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
// CORS configuration - allow GitHub Pages and localhost
app.use(cors({
  origin: [
    'https://hxiaoshaw.github.io',
    'https://*.github.io',
    'http://localhost:8080',
    'http://localhost:8888',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8888'
  ],
  credentials: true
}));
app.use(express.json());

// Excel file path
// Excel file path - supports environment variable for production deployment
// Priority: 1. Environment variable, 2. Local data directory, 3. Original path
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || 
  (fs.existsSync(path.join(__dirname, 'data/ukpn-secondary-sites.xlsx'))
    ? path.join(__dirname, 'data/ukpn-secondary-sites.xlsx')
    : path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx'));

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
  
  // Debug: Log header row to check column structure (only once)
  if (rawData.length > 0 && !dataCache) {
    console.log('📋 CSV Header (first 30 columns):');
    for (let col = 0; col < Math.min(30, rawData[0].length); col++) {
      console.log(`  Column ${col}: ${rawData[0][col] || '(empty)'}`);
    }
    console.log('\n🔍 Searching for coordinate columns:');
    for (let col = 0; col < rawData[0].length; col++) {
      const header = String(rawData[0][col] || '').toLowerCase();
      if (header.includes('lat') || header.includes('lon') || header.includes('lng') || 
          header.includes('coord') || header.includes('easting') || header.includes('northing')) {
        console.log(`  Found at column ${col}: "${rawData[0][col]}"`);
        // Show sample values from first 3 data rows
        for (let r = 1; r < Math.min(4, rawData.length); r++) {
          if (rawData[r] && rawData[r][col] !== undefined) {
            console.log(`    Row ${r}: ${rawData[r][col]}`);
          }
        }
      }
    }
  }
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    
    // Column indices (from CSV structure):
    // 0: Local Authority
    // 1: Site Name (functionallocation)
    // 2: Town
    // 3: Postcode
    // 7: Utilisation Band %
    // 9: ONAN Rating (kVA)
    // 11: Primary Feeder
    // 21: Latitude (可能错误，需要验证)
    // 22: Longitude (可能错误，需要验证)
    // 29: What3Words
    
    const parseString = (val) => {
      if (val === null || val === undefined) return null;
      const str = String(val).trim();
      return str === '' ? null : str;
    };
    
    /**
     * Parse number from value, handling interval strings like "0-20%", "20-40%"
     * Returns the upper bound of the interval (e.g., "0-20%" → 20, "20-40%" → 40)
     * Returns null for blank/null/invalid values
     */
    const parseNumber = (val) => {
      if (val === null || val === undefined || val === '') return null;
      
      // If it's already a number, return it
      if (typeof val === 'number') {
        return isNaN(val) ? null : val;
      }
      
      const str = String(val).trim();
      if (str === '' || str.toLowerCase() === 'null') return null;
      
      // Check if it's an interval string like "0-20%", "20-40%"
      const intervalMatch = str.match(/^(\d+)-(\d+)%?$/);
      if (intervalMatch) {
        // Return the upper bound of the interval
        const upperBound = parseFloat(intervalMatch[2]);
        return isNaN(upperBound) ? null : upperBound;
      }
      
      // Try to parse as regular number (handles "100 kVA" format and decimal numbers like "51.959079")
      // First try to parse as full decimal number
      const decimalMatch = str.match(/^-?\d+\.?\d*/);
      if (decimalMatch) {
        const num = parseFloat(decimalMatch[0]);
        if (!isNaN(num)) return num;
      }
      
      // Fallback: try to parse integer part only
      const numMatch = str.match(/^-?\d+/);
      if (numMatch) {
        const num = parseFloat(numMatch[0]);
        return isNaN(num) ? null : num;
      }
      
      return null;
    };
    
    const localAuthority = parseString(row[0]);
    const siteName = parseString(row[1]); // functionallocation
    const town = parseString(row[2]);
    const postcode = parseString(row[3]);
    const utilisationBand = parseNumber(row[7]);
    const onanRating = parseNumber(row[9]);
    const primaryFeeder = parseString(row[11]);
    const latitude = parseNumber(row[21]); // Latitude column
    const longitude = parseNumber(row[22]); // Longitude column
    const what3Words = parseString(row[29]);
    
    // Skip rows with missing required data
    if (utilisationBand === null || onanRating === null || !primaryFeeder) {
      skippedRows++;
      continue;
    }
    
    const powerSupply = {
      utilisationBandPercent: utilisationBand,
      onanRatingKva: onanRating,
      primaryFeeder: primaryFeeder.trim(),
      rowNumber: i + 1,
      neighbourCountWithin5Km: 0,
      isValidCandidateSite: false,
      lat: latitude, // Read from CSV Column 21
      lng: longitude // Read from CSV Column 22
    };
    
    // Add optional fields if present
    if (localAuthority) {
      powerSupply.localAuthority = localAuthority.trim();
      powerSupply.region = localAuthority.trim();
    }
    if (siteName) powerSupply.siteName = siteName;
    if (town) powerSupply.town = town;
    if (postcode) powerSupply.postcode = postcode;
    if (what3Words) powerSupply.what3Words = what3Words.trim().toLowerCase();
    
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

  // Utilisation filter (interval-based with upper bound mapping)
  // CSV values are interval strings: "0-20%", "20-40%", "40-60%", "60-80%", "80-100%"
  // These are parsed to upper bounds: "0-20%" → 20, "20-40%" → 40, "40-60%" → 60, etc.
  // Filter logic: ≤20% includes [20], ≤40% includes [20, 40], ≤60% includes [20, 40, 60], etc.
  if (filters.utilisationBandMax !== undefined && filters.utilisationBandMax !== null) {
    const maxValue = filters.utilisationBandMax;
    // Define allowed interval upper bounds based on max threshold
    // ≤20%: [20] (only "0-20%" interval)
    // ≤40%: [20, 40] ("0-20%" and "20-40%" intervals)
    // ≤60%: [20, 40, 60] ("0-20%", "20-40%", "40-60%" intervals)
    // ≤80%: [20, 40, 60, 80] ("0-20%", "20-40%", "40-60%", "60-80%" intervals)
    // ≤100%: [20, 40, 60, 80, 100] (all intervals)
    const allowedValues = [];
    const intervalUpperBounds = [20, 40, 60, 80, 100];
    for (const upperBound of intervalUpperBounds) {
      if (upperBound <= maxValue) {
        allowedValues.push(upperBound);
      }
    }
    filtered = filtered.filter(ps => {
      const util = ps.utilisationBandPercent;
      // Filter out null/undefined/blank values
      if (util === null || util === undefined) return false;
      return allowedValues.includes(util);
    });
  }

  // Onan rating filter (≥ min, inclusive)
  if (filters.onanRatingMin !== undefined && filters.onanRatingMin !== null) {
    filtered = filtered.filter(ps => ps.onanRatingKva >= filters.onanRatingMin);
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
  // Support both parameter names: radiusKm (backend) and densityRadius (frontend)
  const radius = filters.radiusKm || filters.densityRadius;
  if (radius !== undefined && radius !== null) {
    const radiusValue = parseFloat(radius) || 3;  // Default: 3 km (matching frontend)
    
    // Step 1: Calculate neighbour count for each site within density radius
    // Count neighbours based on haversine distance calculation using lat/lng
    filtered = filtered.map(ps => {
      if (!ps.lat || !ps.lng) {
        return { ...ps, neighbourCountWithin5Km: 0 };
      }
      // Count neighbours within radius (only from already filtered/qualified sites)
      // This counts other sites that are within radiusValue km distance
      const neighbourCount = filtered.filter(other => {
        // Skip self: use rowNumber for unique identification (more reliable than what3Words)
        if (ps.rowNumber === other.rowNumber) return false;
        if (!other.lat || !other.lng) return false;
        // Calculate distance using haversine formula
        const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
        return distance <= radiusValue;
      }).length;
      return { ...ps, neighbourCountWithin5Km: neighbourCount };
    });
  }

  // Min supplies in radius filter
  // Support both parameter names: minSuppliesInRadius (backend) and minSupplies (frontend)
  const minSupplies = filters.minSuppliesInRadius !== undefined && filters.minSuppliesInRadius !== null
    ? filters.minSuppliesInRadius
    : (filters.minSupplies !== undefined && filters.minSupplies !== null ? filters.minSupplies : null);
  
  // Step 2: Filter sites based on neighbour count threshold
  // Only show sites with neighbourCount >= (minSupplies - 1)
  // Example: if minSupplies = 3, show sites with >= 2 neighbours
  // Example: if minSupplies = 5, show sites with >= 4 neighbours
  if (minSupplies !== null && minSupplies !== undefined) {
    const minNeighbourCount = Math.max(0, minSupplies - 1); // Ensure non-negative
    filtered = filtered.filter(ps => {
      const neighbourCount = ps.neighbourCountWithin5Km || 0;
      return neighbourCount >= minNeighbourCount;
    });
    
    console.log(`📍 Density filter applied: radius=${radius ? parseFloat(radius) || 3 : 'N/A'}km, minSupplies=${minSupplies}, minNeighbourCount=${minNeighbourCount}, sites remaining=${filtered.length}`);
  }

  // Calculate isValidCandidateSite
  // A site is valid if: utilisation < maxUtilisation AND onanRating >= minOnan
  const maxUtilisation = filters.utilisationBandMax !== undefined ? filters.utilisationBandMax : 40;
  const minOnan = filters.onanRatingMin !== undefined ? filters.onanRatingMin : 1000;
  filtered = filtered.map(ps => ({
    ...ps,
    isValidCandidateSite: ps.utilisationBandPercent < maxUtilisation && ps.onanRatingKva >= minOnan
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

  // Calculate quality distribution
  // Quality is based on: utilisation (lower is better) and ONAN rating (higher is better)
  // Excellent: Utilisation < 20% AND ONAN >= 1000 kVA
  // Good: (Utilisation < 40% AND ONAN >= 1000 kVA) OR (Utilisation < 20% AND ONAN >= 500 kVA)
  // Fair: (Utilisation < 60% AND ONAN >= 500 kVA) OR (Utilisation < 40% AND ONAN >= 300 kVA)
  // Poor: All others
  let excellent = 0, good = 0, fair = 0, poor = 0;
  
  powerSupplies.forEach(ps => {
    const util = ps.utilisationBandPercent || 0;
    const onan = ps.onanRatingKva || 0;
    
    if (util < 20 && onan >= 1000) {
      excellent++;
    } else if ((util < 40 && onan >= 1000) || (util < 20 && onan >= 500)) {
      good++;
    } else if ((util < 60 && onan >= 500) || (util < 40 && onan >= 300)) {
      fair++;
    } else {
      poor++;
    }
  });

  return {
    total,
    withCoordinates,
    validCandidateSites,
    avgUtilisation,
    avgOnanRating,
    regions,
    qualityDistribution: {
      excellent,
      good,
      fair,
      poor
    }
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
    // Support both backend and frontend parameter names
    if (req.query.region) filters.region = req.query.region;
    if (req.query.area) filters.area = req.query.area;
    if (req.query.utilisationBandMax) filters.utilisationBandMax = parseFloat(req.query.utilisationBandMax);
    if (req.query.onanRatingMin) filters.onanRatingMin = parseFloat(req.query.onanRatingMin);
    
    // Support both parameter names for density radius
    if (req.query.radiusKm) filters.radiusKm = parseFloat(req.query.radiusKm);
    if (req.query.densityRadius) filters.densityRadius = parseFloat(req.query.densityRadius);
    
    // Support both parameter names for min supplies
    if (req.query.minSuppliesInRadius) filters.minSuppliesInRadius = parseInt(req.query.minSuppliesInRadius, 10);
    if (req.query.minSupplies) filters.minSupplies = parseInt(req.query.minSupplies, 10);
    
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

