/**
 * Simplified Orion Site Selection Backend
 * Clean, simple, fast, maintainable
 */

const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Excel file path
const EXCEL_FILE_PATH = path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx');

// Cache for Excel data
let dataCache = null;
let lastModified = 0;

/**
 * Load Excel data with caching
 */
function loadExcelData() {
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
  }

  const stats = fs.statSync(EXCEL_FILE_PATH);
  const currentModified = stats.mtimeMs;

  // Return cached data if file hasn't changed
  if (dataCache && currentModified <= lastModified) {
    return dataCache;
  }

  // Load and parse Excel file (matching original logic)
  const workbook = xlsx.readFile(EXCEL_FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Parse as array of arrays (matching original ExcelService)
  const rawData = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null
  });

  // Transform data (matching original column indices)
  const powerSupplies = [];
  let skippedRows = 0;
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Column indices (matching original):
    // 0: Local Authority
    // 1: Site Name
    // 2: Town
    // 3: Postcode
    // 7: Utilisation Band %
    // 9: ONAN Rating (kVA)
    // 11: Primary Feeder
    // 29: What3Words
    
    const parseString = (val) => {
      if (val === null || val === undefined) return null;
      const str = String(val).trim();
      return str === '' ? null : str;
    };
    
    const parseNumber = (val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      return isNaN(num) ? null : num;
    };
    
    const localAuthority = parseString(row[0]);
    const utilisationBand = parseNumber(row[7]);
    const onanRating = parseNumber(row[9]);
    const primaryFeeder = parseString(row[11]);
    const what3Words = parseString(row[29]);
    
    // Skip rows with missing required data (matching original logic)
    if (utilisationBand === null || onanRating === null || !primaryFeeder || !what3Words) {
      skippedRows++;
      continue;
    }
    
    const powerSupply = {
      utilisationBandPercent: utilisationBand,
      onanRatingKva: onanRating,
      primaryFeeder: primaryFeeder.trim(),
      what3Words: what3Words.trim().toLowerCase(),
      rowNumber: i + 1,
      neighbourCountWithin5Km: 0,
      isValidCandidateSite: false,
      lat: null,
      lng: null
    };
    
    if (localAuthority) {
      powerSupply.localAuthority = localAuthority.trim();
      powerSupply.region = localAuthority.trim();
    }
    
    const siteName = parseString(row[1]);
    if (siteName) powerSupply.siteName = siteName;
    
    const town = parseString(row[2]);
    if (town) powerSupply.town = town;
    
    const postcode = parseString(row[3]);
    if (postcode) powerSupply.postcode = postcode;
    
    powerSupplies.push(powerSupply);
  }
  
  console.log(`Parsed ${powerSupplies.length} valid power supply records. Skipped ${skippedRows} rows.`);

  // Cache data
  dataCache = powerSupplies;
  lastModified = currentModified;

  return powerSupplies;
}

/**
 * Haversine distance calculation
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Apply filters to power supplies
 */
function applyFilters(powerSupplies, filters) {
  let filtered = [...powerSupplies];

  // Region filter
  if (filters.region && filters.region.trim() !== '') {
    const regionLower = filters.region.toLowerCase();
    filtered = filtered.filter(ps =>
      ps.localAuthority?.toLowerCase().includes(regionLower) ||
      ps.region?.toLowerCase().includes(regionLower)
    );
  }

  // Area filter
  if (filters.area && filters.area.trim() !== '') {
    const areaLower = filters.area.toLowerCase();
    filtered = filtered.filter(ps =>
      ps.localAuthority?.toLowerCase().includes(areaLower) ||
      ps.region?.toLowerCase().includes(areaLower) ||
      ps.town?.toLowerCase().includes(areaLower)
    );
  }

  // Utilisation filter
  if (filters.utilisationBandMax !== undefined && filters.utilisationBandMax !== null) {
    filtered = filtered.filter(ps => ps.utilisationBandPercent < filters.utilisationBandMax);
  }

  // Onan rating filter
  if (filters.onanRatingMin !== undefined && filters.onanRatingMin !== null) {
    filtered = filtered.filter(ps => ps.onanRatingKva > filters.onanRatingMin);
  }

  // Search text filter
  if (filters.searchText && filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(ps =>
      ps.siteName?.toLowerCase().includes(searchLower) ||
      ps.town?.toLowerCase().includes(searchLower) ||
      ps.postcode?.toLowerCase().includes(searchLower) ||
      ps.primaryFeeder?.toLowerCase().includes(searchLower) ||
      ps.what3Words?.toLowerCase().includes(searchLower) ||
      ps.localAuthority?.toLowerCase().includes(searchLower)
    );
  }

  // Radius filter (requires coordinates)
  if (filters.centerLat && filters.centerLng && filters.radiusKm) {
    filtered = filtered.filter(ps => {
      if (!ps.lat || !ps.lng) return false;
      const distance = haversineDistance(filters.centerLat, filters.centerLng, ps.lat, ps.lng);
      return distance <= filters.radiusKm;
    });
  }

  // Calculate neighbour counts if coordinates available
  if (filters.radiusKm) {
    const radius = filters.radiusKm || 5;
    filtered = filtered.map(ps => {
      if (!ps.lat || !ps.lng) {
        return { ...ps, neighbourCountWithin5Km: 0 };
      }
      const neighbourCount = filtered.filter(other => {
        if (!other.lat || !other.lng || ps.what3Words === other.what3Words) return false;
        const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
        return distance <= radius;
      }).length;
      return { ...ps, neighbourCountWithin5Km: neighbourCount };
    });
  }

  // Min supplies in radius filter
  if (filters.minSuppliesInRadius !== undefined && filters.minSuppliesInRadius !== null) {
    filtered = filtered.filter(ps => (ps.neighbourCountWithin5Km || 0) >= filters.minSuppliesInRadius);
  }

  // Calculate isValidCandidateSite
  const maxUtilisation = filters.utilisationBandMax !== undefined ? filters.utilisationBandMax : 40;
  const minOnan = filters.onanRatingMin !== undefined ? filters.onanRatingMin : 1000;
  filtered = filtered.map(ps => ({
    ...ps,
    isValidCandidateSite: ps.utilisationBandPercent < maxUtilisation && ps.onanRatingKva > minOnan
  }));

  return filtered;
}

/**
 * Calculate statistics
 */
function calculateStats(powerSupplies) {
  const total = powerSupplies.length;
  const withCoordinates = powerSupplies.filter(ps => ps.lat && ps.lng).length;
  const validCandidateSites = powerSupplies.filter(ps => ps.isValidCandidateSite).length;
  const avgUtilisation = total > 0
    ? powerSupplies.reduce((sum, ps) => sum + ps.utilisationBandPercent, 0) / total
    : 0;
  const avgOnanRating = total > 0
    ? powerSupplies.reduce((sum, ps) => sum + ps.onanRatingKva, 0) / total
    : 0;

  // Region counts
  const regionCounts = {};
  powerSupplies.forEach(ps => {
    const region = ps.localAuthority || ps.region || 'Unknown';
    if (!regionCounts[region]) {
      regionCounts[region] = { count: 0, validCount: 0 };
    }
    regionCounts[region].count++;
    if (ps.isValidCandidateSite) {
      regionCounts[region].validCount++;
    }
  });

  const regions = Object.keys(regionCounts)
    .sort()
    .map(name => ({
      name,
      count: regionCounts[name].count,
      validCount: regionCounts[name].validCount
    }));

  return {
    total,
    withCoordinates,
    validCandidateSites,
    avgUtilisation,
    avgOnanRating,
    regions
  };
}

// API Routes

/**
 * GET /api/power-supplies
 * Get filtered power supplies
 */
app.get('/api/power-supplies', (req, res) => {
  try {
    const filters = {};
    
    // Parse query parameters
    if (req.query.region) filters.region = req.query.region;
    if (req.query.area) filters.area = req.query.area;
    if (req.query.utilisationBandMax) filters.utilisationBandMax = parseFloat(req.query.utilisationBandMax);
    if (req.query.onanRatingMin) filters.onanRatingMin = parseFloat(req.query.onanRatingMin);
    if (req.query.minSuppliesInRadius) filters.minSuppliesInRadius = parseInt(req.query.minSuppliesInRadius, 10);
    if (req.query.radiusKm) filters.radiusKm = parseFloat(req.query.radiusKm);
    if (req.query.centerLat) filters.centerLat = parseFloat(req.query.centerLat);
    if (req.query.centerLng) filters.centerLng = parseFloat(req.query.centerLng);
    if (req.query.searchText) filters.searchText = req.query.searchText;

    const allPowerSupplies = loadExcelData();
    const filtered = applyFilters(allPowerSupplies, filters);

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching power supplies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch power supplies',
      message: error.message
    });
  }
});

/**
 * GET /api/power-supplies/stats
 * Get statistics with filters
 */
app.get('/api/power-supplies/stats', (req, res) => {
  try {
    const filters = {};
    
    if (req.query.region) filters.region = req.query.region;
    if (req.query.utilisationBandMax) filters.utilisationBandMax = parseFloat(req.query.utilisationBandMax);
    if (req.query.onanRatingMin) filters.onanRatingMin = parseFloat(req.query.onanRatingMin);

    const allPowerSupplies = loadExcelData();
    const filtered = applyFilters(allPowerSupplies, filters);
    const stats = calculateStats(filtered);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

/**
 * GET /api/power-supplies/regions
 * Get list of regions
 */
app.get('/api/power-supplies/regions', (req, res) => {
  try {
    const allPowerSupplies = loadExcelData();
    const stats = calculateStats(allPowerSupplies);
    
    res.json({
      success: true,
      data: stats.regions
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions',
      message: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Orion Site Selection API v2',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET /api/power-supplies',
      'GET /api/power-supplies/stats',
      'GET /api/power-supplies/regions',
      'GET /health'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Orion Site Selection Backend v2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📊 Excel file: ${EXCEL_FILE_PATH}`);
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET  /api/power-supplies');
  console.log('  GET  /api/power-supplies/stats');
  console.log('  GET  /api/power-supplies/regions');
  console.log('  GET  /health');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

