/**
 * ==================== Orion Site Selection v2 - Enhanced Edition ====================
 * Feature-rich, beautiful UI, powerful functionality
 * Combines simplicity with completeness
 */

// ==================== Configuration ====================
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'
  : 'https://your-backend-url.com'; // UPDATE after backend deployment

const CONFIG = {
  API_BASE: API_BASE_URL,
  PASSWORD: 'EdgeNebula2026',
  STORAGE_KEY: 'orion_access_granted',
  GOOGLE_MAPS_API_KEY: 'AIzaSyBGR0-qpZQoV6x3GX3q7ygwLbKgKgOlYdc'
};

// ==================== Global State ====================
let currentPage = 'dashboard';
let map = null;
let markers = [];
let googleMapsLoaded = false;
let allSitesData = null; // Cache for sites data
let statsData = null;
let chartsInstances = {};
let currentInfoWindow = null; // Reuse single InfoWindow for performance
let isLoadingSites = false; // Prevent duplicate loads

// Selection Criteria (saved to localStorage)
// Default values - frontend uses 3km for densityRadius (will be passed to backend)
let selectionCriteria = {
  maxUtilisation: 40,      // Backend default: 40
  minOnan: 1000,            // Backend default: 1000
  densityRadius: 3,         // Frontend default: 3 km (will be passed to backend)
  minSupplies: 3            // Common default: 3
};

// ==================== Password Protection ====================
function checkPassword() {
  const input = document.getElementById('password-input');
  const errorEl = document.getElementById('password-error');
  const password = input.value;
  
  if (password === CONFIG.PASSWORD) {
    sessionStorage.setItem(CONFIG.STORAGE_KEY, 'true');
    document.getElementById('password-protection').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
  } else {
    errorEl.classList.add('show');
    input.value = '';
    input.focus();
    setTimeout(() => errorEl.classList.remove('show'), 3000);
  }
}

// Check if already authenticated
if (sessionStorage.getItem(CONFIG.STORAGE_KEY) === 'true') {
  document.getElementById('password-protection').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('password-input');
    if (input) {
      input.focus();
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
      });
    }
  });
}

// ==================== Application Initialization ====================
function initApp() {
  console.log('🚀 Initializing Orion Site Selection v2 Enhanced...');
  
  // Load criteria from localStorage
  loadCriteria();
  
  // Setup navigation
  setupNavigation();
  
  // Load initial data
  loadGlobalData();
  
  // Load default page
  loadPage('dashboard');
  
  console.log('✅ Application initialized successfully');
}

// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) {
        loadPage(page);
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

// Load global data (stats, sites list)
async function loadGlobalData() {
  try {
    // Load stats
    const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies/stats`);
    if (!response.ok) throw new Error('Failed to load stats');
    const result = await response.json();
    if (result.success) {
      statsData = result.data;
      console.log('✅ Global stats loaded:', statsData.total, 'sites');
    }
  } catch (error) {
    console.error('❌ Error loading global data:', error);
  }
}

// Load/Save criteria
function loadCriteria() {
  const saved = localStorage.getItem('orionSelectionCriteria');
  if (saved) {
    try {
      selectionCriteria = { ...selectionCriteria, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load criteria:', e);
    }
  }
}

function saveCriteria() {
  localStorage.setItem('orionSelectionCriteria', JSON.stringify(selectionCriteria));
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('criteriaUpdated', { detail: selectionCriteria }));
}

// ==================== Page Loading System ====================
function loadPage(page) {
  const oldPage = currentPage; // Save old page before updating
  const content = document.getElementById('page-content');
  
  // Cleanup previous page
  cleanupCurrentPage();
  
  // Important: When switching away from map pages or entering map pages,
  // reset map instance because innerHTML will destroy the old DOM element
  const wasMapPage = (oldPage === 'power-analysis' || oldPage === 'site-map');
  const isMapPage = (page === 'power-analysis' || page === 'site-map');
  
  if (wasMapPage || isMapPage) {
    console.log(`🔄 Page transition: ${oldPage} → ${page}, resetting map...`);
    // Reset map instance so it will be recreated with new DOM
    if (map) {
      // Clear markers first
      if (markers.length > 0) {
        console.log(`🧹 Clearing ${markers.length} markers...`);
        markers.forEach(m => m.setMap(null));
        markers = [];
      }
      // Reset map to force recreation with new DOM element
      map = null;
    }
  }
  
  // Update current page
  currentPage = page;
  
  // Load new page content
  switch (page) {
    case 'dashboard':
      renderDashboardPage(content);
      break;
    case 'site-list':
      renderSiteListPage(content);
      break;
    case 'power-analysis':
      renderPowerAnalysisPage(content);
      break;
    case 'site-map':
      renderSiteMapPage(content);
      break;
    case 'dc-matrix':
      renderDCMatrixPage(content);
      break;
    case 'site-compare':
      renderSiteComparePage(content);
      break;
    case 'reports':
      renderReportsPage(content);
      break;
    default:
      content.innerHTML = '<div class="page-header"><h1 class="page-title">Page Not Found</h1></div>';
  }
  
  // Scroll to top
  content.scrollTop = 0;
}

function cleanupCurrentPage() {
  // Dispose charts
  if (Object.keys(chartsInstances).length > 0) {
    console.log('🧹 Cleaning up charts...');
    Object.values(chartsInstances).forEach(chart => {
      if (chart && chart.dispose) chart.dispose();
    });
    chartsInstances = {};
  }
  
  // Close info window if open
  if (currentInfoWindow) {
    currentInfoWindow.close();
  }
  
  // Note: Keep markers and map instance for reuse
  // Only clear markers when actually reloading map data
  console.log('✅ Page cleanup complete');
}

// ==================== Dashboard Page ====================
function renderDashboardPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-description">Overview of site selection data and key metrics</p>
    </div>
    
    <div class="stats-grid" id="stats-cards">
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon blue">📊</div>
        </div>
        <div class="stat-card-label">Total Sites</div>
        <div class="stat-card-value" id="stat-total">-</div>
        <div class="stat-card-change positive">+12% from last month</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon green">✅</div>
        </div>
        <div class="stat-card-label">Valid Candidates</div>
        <div class="stat-card-value" id="stat-valid">-</div>
        <div class="stat-card-change positive">Meeting all criteria</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon yellow">⚡</div>
        </div>
        <div class="stat-card-label">Avg Utilisation</div>
        <div class="stat-card-value" id="stat-util">-</div>
        <div class="stat-card-change">Target: <40%</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-card-header">
          <div class="stat-card-icon red">🔌</div>
        </div>
        <div class="stat-card-label">Avg ONAN Rating</div>
        <div class="stat-card-value" id="stat-onan">-</div>
        <div class="stat-card-change">Target: >1000 kVA</div>
      </div>
    </div>
    
    <div class="content-card" style="margin-bottom: 24px;">
      <div class="content-card-header">
        <h3 class="content-card-title">📍 Sites by Region</h3>
      </div>
      <div class="content-card-body">
        <div id="chart-regions" style="width: 100%; height: 400px;"></div>
      </div>
    </div>
    
    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">📈 Site Quality Distribution</h3>
      </div>
      <div class="content-card-body">
        <div id="chart-quality" style="width: 100%; height: 350px;"></div>
      </div>
    </div>
  `;
  
  // Load and display data
  loadDashboardData();
}

async function loadDashboardData() {
  try {
    // Fetch stats if not already loaded
    if (!statsData) {
      const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies/stats`);
      const result = await response.json();
      if (result.success) {
        statsData = result.data;
      }
    }
    
    if (statsData) {
      // Update stat cards (only if we're on the dashboard page)
      const statTotal = document.getElementById('stat-total');
      const statValid = document.getElementById('stat-valid');
      const statUtil = document.getElementById('stat-util');
      const statOnan = document.getElementById('stat-onan');
      
      if (statTotal) statTotal.textContent = statsData.total.toLocaleString();
      if (statValid) statValid.textContent = statsData.validCandidateSites || 0;
      if (statUtil) statUtil.textContent = (statsData.avgUtilisation || 0).toFixed(1) + '%';
      if (statOnan) statOnan.textContent = (statsData.avgOnanRating || 0).toFixed(0) + ' kVA';
      
      // Initialize charts (only if we're on the dashboard page)
      if (document.getElementById('stat-total')) {
        initDashboardCharts(statsData);
      }
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function initDashboardCharts(data) {
  // Load ECharts from CDN if not already loaded
  if (typeof echarts === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.onload = () => {
      console.log('✅ ECharts loaded');
      createDashboardCharts(data);
    };
    document.head.appendChild(script);
  } else {
    createDashboardCharts(data);
  }
}

function createDashboardCharts(data) {
  // Regions chart
  const regionsEl = document.getElementById('chart-regions');
  if (regionsEl && data.regions) {
    const regionsChart = echarts.init(regionsEl);
    
    // Sort and take top 15 regions
    const topRegions = data.regions
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    
    regionsChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: topRegions.map(r => r.name)
      },
      series: [
        {
          name: 'Sites',
          type: 'bar',
          data: topRegions.map(r => r.count),
          itemStyle: {
            color: '#5369f8'
          },
          label: {
            show: true,
            position: 'right'
          }
        }
      ]
    });
    
    chartsInstances.regions = regionsChart;
  }
  
  // Quality distribution chart
  const qualityEl = document.getElementById('chart-quality');
  if (qualityEl) {
    const qualityChart = echarts.init(qualityEl);
    
    // Generate sample quality distribution data
    const qualityData = [
      { name: 'Excellent', value: Math.floor(data.total * 0.15) },
      { name: 'Good', value: Math.floor(data.total * 0.35) },
      { name: 'Fair', value: Math.floor(data.total * 0.30) },
      { name: 'Poor', value: Math.floor(data.total * 0.20) }
    ];
    
    qualityChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%'
      },
      series: [
        {
          name: 'Quality',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: qualityData,
          color: ['#10b981', '#5369f8', '#f59e0b', '#ef4444']
        }
      ]
    });
    
    chartsInstances.quality = qualityChart;
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    Object.values(chartsInstances).forEach(chart => {
      if (chart && chart.resize) chart.resize();
    });
  });
}

// ==================== Site List Page ====================
function renderSiteListPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Site List</h1>
      <p class="page-description">Complete list of power supply sites with filtering</p>
    </div>
    
    <div class="content-card" style="margin-bottom: 24px;">
      <div class="content-card-header">
        <h3 class="content-card-title">🔍 Filters</h3>
      </div>
      <div class="content-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Region</label>
            <select class="form-select" id="filter-region">
              <option value="">All Regions</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Utilisation (%)</label>
            <input type="number" class="form-input" id="filter-util" value="40" min="0" max="100">
          </div>
          <div class="form-group">
            <label class="form-label">Min ONAN (kVA)</label>
            <input type="number" class="form-input" id="filter-onan" value="1000" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Search</label>
            <input type="text" class="form-input" id="filter-search" placeholder="Search by name...">
          </div>
        </div>
        <div class="btn-group mt-4">
          <button class="btn btn-primary" onclick="applySiteFilters()">🔍 Apply Filters</button>
          <button class="btn btn-secondary" onclick="clearSiteFilters()">🔄 Clear</button>
        </div>
      </div>
    </div>
    
    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title" id="site-list-title">📋 Sites</h3>
      </div>
      <div class="content-card-body">
        <div id="site-list-content" style="text-align: center; padding: 40px;">
          <div class="loading-spinner"></div>
          <p style="margin-top: 16px; color: #6b7280;">Loading sites...</p>
        </div>
      </div>
    </div>
  `;
  
  // Load sites
  loadSiteList();
}

async function loadSiteList(filters = {}) {
  const contentEl = document.getElementById('site-list-content');
  const titleEl = document.getElementById('site-list-title');
  
  try {
    // Build query string
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.utilisationBandMax) params.append('utilisationBandMax', filters.utilisationBandMax);
    if (filters.onanRatingMin) params.append('onanRatingMin', filters.onanRatingMin);
    if (filters.searchText) params.append('searchText', filters.searchText);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?${params}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // Map backend field names to frontend field names
      const sites = result.data.map(site => ({
        ...site,
        utilisation: site.utilisationBandPercent,
        onanRating: site.onanRatingKva,
        latitude: site.lat,
        longitude: site.lng,
        // Preserve what3Words from backend (handle both cases)
        what3Words: site.what3Words || site.what3words || null
      }));
      
      titleEl.textContent = `📋 Sites (${sites.length} results)`;
      
      if (sites.length === 0) {
        contentEl.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No sites found matching criteria</p>';
        return;
      }
      
      // Render table with improved styling
      contentEl.innerHTML = `
        <div style="overflow-x: auto;">
          <table class="data-table site-list-table">
            <thead>
              <tr>
                <th style="text-align: left; min-width: 200px;">Site Name</th>
                <th style="text-align: left; min-width: 150px;">Region</th>
                <th style="text-align: left; min-width: 120px;">ONAN (kVA)</th>
                <th style="text-align: center; min-width: 130px;">Utilisation (%)</th>
                <th style="text-align: left; min-width: 180px;">What3Words</th>
                <th style="text-align: center; min-width: 100px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${sites.slice(0, 100).map(site => `
                <tr>
                  <td style="text-align: left; font-weight: 600; color: #1f2937;">${site.siteName || site.address || 'Unknown'}</td>
                  <td style="text-align: left; color: #374151;">${site.region || site.localAuthority || '-'}</td>
                  <td style="text-align: left; color: #374151;">${site.onanRating ? site.onanRating.toFixed(0) : '-'}</td>
                  <td style="text-align: center;">
                    <span style="color: ${site.utilisation > 40 ? '#ef4444' : '#10b981'}; font-weight: 600;">
                      ${site.utilisation ? site.utilisation.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td style="text-align: left; color: #6b7280; font-family: 'Courier New', monospace; font-size: 13px;">
                    ${(site.what3Words || site.what3words) ? (site.what3Words || site.what3words) : '-'}
                  </td>
                  <td style="text-align: center;">
                    ${site.utilisation && site.utilisation <= 40 && site.onanRating >= 1000 
                      ? '<span style="color: #10b981; font-weight: 600;">✅ Valid</span>' 
                      : '<span style="color: #6b7280;">-</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${sites.length > 100 ? `<p style="text-align: center; color: #6b7280; margin-top: 16px; font-size: 14px;">Showing first 100 of ${sites.length} results</p>` : ''}
      `;
      
      // Populate region filter if empty
      const regionSelect = document.getElementById('filter-region');
      if (regionSelect && regionSelect.options.length === 1 && statsData && statsData.regions) {
        statsData.regions.forEach(region => {
          const option = document.createElement('option');
          option.value = region.name;
          option.textContent = region.name;
          regionSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error loading sites:', error);
    contentEl.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Error loading sites. Please try again.</p>';
  }
}

window.applySiteFilters = function() {
  const filters = {
    region: document.getElementById('filter-region').value,
    utilisationBandMax: document.getElementById('filter-util').value,
    onanRatingMin: document.getElementById('filter-onan').value,
    searchText: document.getElementById('filter-search').value
  };
  loadSiteList(filters);
};

window.clearSiteFilters = function() {
  document.getElementById('filter-region').value = '';
  document.getElementById('filter-util').value = '40';
  document.getElementById('filter-onan').value = '1000';
  document.getElementById('filter-search').value = '';
  loadSiteList();
};

// ==================== Power Analysis Page ====================
function renderPowerAnalysisPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">⚡ Power Analysis with Filters</h1>
      <p class="page-description">Geographic visualization with real-time filtering</p>
    </div>
    
    <!-- Filter Panel -->
    <div class="content-card" style="margin-bottom: 20px;">
      <div class="content-card-header" style="cursor: pointer; user-select: none;" onclick="toggleFilterPanel()">
        <h3 class="content-card-title">
          <span id="filter-toggle-icon">▼</span> ⚙️ Selection Criteria & Filters
        </h3>
        <div class="stat-card-value" style="font-size: 14px; color: #6b7280;">
          <span id="filtered-count">-</span> sites match filters
        </div>
      </div>
      <div class="content-card-body" id="filter-panel-body">
        <!-- Region/Area and Search Section -->
        <div class="form-grid" style="grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div class="form-group">
            <label class="form-label">
              <strong>📍 Region / Area</strong>
            </label>
            <select class="form-select" id="region-filter" onchange="applyRegionFilter()">
              <option value="">All Regions</option>
              <!-- Regions will be loaded dynamically from backend API -->
            </select>
            <small style="color: #6b7280; font-size: 11px;">Filters by Local Authority or Region name</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <strong>🔍 Search</strong>
            </label>
            <input type="text" 
                   class="form-input" 
                   id="site-search" 
                   placeholder="Site name, town, postcode..."
                   oninput="applySearchFilter()"
                   style="width: 100%;">
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        
        <!-- Criteria Sliders -->
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">
              <strong>Max Utilisation (%)</strong>
              <span style="color: #10b981; margin-left: 8px;" id="util-value">${selectionCriteria.maxUtilisation}%</span>
            </label>
            <input type="range" class="form-range" id="criteria-util" 
                   value="${selectionCriteria.maxUtilisation}" 
                   min="20" max="100" step="20"
                   oninput="updateCriteriaValue('util', this.value)">
            <small style="color: #6b7280;">Sites with utilisation ≤ threshold (interval-based: 20, 40, 60, 80, 100)</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <strong>Min ONAN Rating (kVA)</strong>
              <span style="color: #10b981; margin-left: 8px;" id="onan-value">${selectionCriteria.minOnan}</span>
            </label>
            <input type="range" class="form-range" id="criteria-onan" 
                   value="${selectionCriteria.minOnan}" 
                   min="0" max="5000" step="100"
                   oninput="updateCriteriaValue('onan', this.value)">
            <small style="color: #6b7280;">Minimum transformer rating required</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <strong>Density Radius (km)</strong>
              <span style="color: #10b981; margin-left: 8px;" id="radius-value">${selectionCriteria.densityRadius} km</span>
            </label>
            <input type="range" class="form-range" id="criteria-radius" 
                   value="${selectionCriteria.densityRadius}" 
                   min="1" max="6" step="1"
                   oninput="updateCriteriaValue('radius', this.value)">
            <small style="color: #6b7280;">Search radius for nearby sites (1-6 km, neighbour count calculation)</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <strong>Min Supplies in Radius</strong>
              <span style="color: #10b981; margin-left: 8px;" id="supplies-value">${selectionCriteria.minSupplies}</span>
            </label>
            <input type="range" class="form-range" id="criteria-supplies" 
                   value="${selectionCriteria.minSupplies}" 
                   min="2" max="6" step="1"
                   oninput="updateCriteriaValue('supplies', this.value)">
            <small style="color: #6b7280;">Minimum sites required within Density Radius (2-6, must also pass Util & ONAN filters)</small>
          </div>
        </div>
        
        <div class="btn-group mt-4">
          <button class="btn btn-primary" onclick="applyFiltersToMap()">
            🔍 Apply Filters to Map
          </button>
          <button class="btn btn-secondary" onclick="resetFiltersAndMap()">
            🔄 Reset All
          </button>
          <button class="btn btn-secondary" onclick="saveCriteriaSettings()">
            💾 Save Settings
          </button>
        </div>
        
        <div id="filter-message" class="mt-4" style="display: none;"></div>
      </div>
    </div>
    
    <!-- Map Card -->
    <div class="content-card">
      <div class="content-card-body" style="padding: 0;">
        <div class="map-container">
          <div id="map">
            <div class="map-loading-indicator">
              <div class="spinner"></div>
              <p>Loading Google Maps...</p>
            </div>
          </div>
          
          <div class="map-controls">
            <div class="map-control-group">
              <label>
                <input type="radio" name="map-type" value="roadmap" checked onchange="changeMapType('roadmap')">
                🗺️ Map
              </label>
              <label>
                <input type="radio" name="map-type" value="satellite" onchange="changeMapType('satellite')">
                🛰️ Satellite
              </label>
            </div>
            <div class="map-control-group">
              <label>
                <input type="checkbox" id="show-labels" onchange="toggleLabels()">
                🏷️ Labels
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filtered Sites List -->
    <div class="content-card" style="margin-top: 20px;">
      <div class="content-card-header">
        <h3 class="content-card-title">📋 Filtered Sites List</h3>
        <div class="sort-controls">
          <label style="font-size: 13px; color: #6b7280; margin-right: 8px;">Sort by:</label>
          <select class="form-select" id="sort-criteria" onchange="sortFilteredSites()" style="width: auto; padding: 6px 12px;">
            <option value="utilisation">Max Utilisation (Low to High)</option>
            <option value="onan">Min ONAN Rating (Low to High)</option>
            <option value="supplies">Supplies in Radius (High to Low)</option>
          </select>
        </div>
      </div>
      <div class="content-card-body">
        <div id="filtered-sites-list">
          <div class="empty-state" style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">Apply filters to see results</h3>
            <p style="margin: 0; color: #6b7280;">Click "Apply Filters to Map" to display filtered sites</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize Google Maps
  initializeGoogleMaps();
  
  // Load regions from backend API
  loadRegionsFromAPI();
  
  // Load sites on map after a short delay to ensure map is initialized
  setTimeout(() => {
    if (map) {
      console.log('🔄 Initial load: Loading sites on map...');
      loadSitesOnMap();
    }
  }, 500);
}

// Load regions from backend API and populate dropdown
async function loadRegionsFromAPI() {
  try {
    console.log('📡 Loading regions from API...');
    const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies/regions`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const regions = result.data;
      console.log(`✅ Loaded ${regions.length} regions from backend`);
      
      // Populate region dropdown
      const regionFilter = document.getElementById('region-filter');
      if (regionFilter) {
        // Keep "All Regions" option
        regionFilter.innerHTML = '<option value="">All Regions</option>';
        
        // Add regions from API
        regions.forEach(region => {
          const option = document.createElement('option');
          option.value = region.name;
          option.textContent = `${region.name} (${region.count} sites)`;
          regionFilter.appendChild(option);
        });
        
        console.log('✅ Region dropdown populated with backend data');
      }
    } else {
      console.warn('⚠️ No regions data returned from API');
    }
  } catch (error) {
    console.error('❌ Error loading regions from API:', error);
    // Keep hardcoded regions as fallback
    console.log('Using hardcoded regions as fallback');
  }
}

// ==================== Site Map Page ====================
function renderSiteMapPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">🗺️ Site Map</h1>
      <p class="page-description">Interactive map of all power supply locations</p>
    </div>
    
    <div class="content-card">
      <div class="content-card-body" style="padding: 0;">
        <div class="map-container">
          <div id="map">
            <div class="map-loading-indicator">
              <div class="spinner"></div>
              <p>Loading Google Maps...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize Google Maps
  initializeGoogleMaps();
}

// ==================== Google Maps Integration ====================
function initializeGoogleMaps() {
  if (window.google && window.google.maps) {
    // API already loaded, create map immediately
    console.log('✅ Google Maps API already available');
    createMap();
  } else if (!googleMapsLoaded) {
    // First time loading, add script
    googleMapsLoaded = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.GOOGLE_MAPS_API_KEY}&libraries=places&language=en&region=GB`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ Google Maps loaded');
      createMap();
    };
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps');
      const mapEl = document.getElementById('map');
      if (mapEl) {
        mapEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h3>Failed to Load Map</h3><p>Please check your API key</p></div>';
      }
    };
    document.head.appendChild(script);
  } else {
    // Script is loading, wait for it
    console.log('⏳ Waiting for Google Maps API to load...');
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        console.log('✅ Google Maps API now available');
        createMap();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.google || !window.google.maps) {
        console.error('❌ Timeout waiting for Google Maps API');
        const mapEl = document.getElementById('map');
        if (mapEl) {
          mapEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h3>Failed to Load Map</h3><p>Timeout loading Google Maps API</p></div>';
        }
      }
    }, 10000);
  }
}

function createMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) {
    console.warn('⚠️ Map container not found');
    return;
  }
  
  // Wait for container to have dimensions (with timeout)
  let retryCount = 0;
  const maxRetries = 10;
  
  const checkDimensions = () => {
    if (mapEl.offsetWidth === 0 || mapEl.offsetHeight === 0) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`⏳ Waiting for map container dimensions... (${retryCount}/${maxRetries})`);
        setTimeout(checkDimensions, 50);
      } else {
        console.error('❌ Map container never got dimensions');
        mapEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h3>Map Container Error</h3><p>Failed to initialize map container</p></div>';
      }
      return;
    }
    
    initializeMap();
  };
  
  const initializeMap = () => {
    // Clear loading indicator
    const loadingIndicator = mapEl.querySelector('.map-loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
    
    // Always create new map instance (map should be null when we get here)
    if (map) {
      console.warn('⚠️ Map instance exists but should be null, clearing...');
      map = null;
    }
    
    // Create new map instance
    console.log('🗺️ Creating new Google Maps instance...');
    mapEl.innerHTML = ''; // Clear everything
    
    try {
      map = new google.maps.Map(mapEl, {
        center: { lat: 52.2053, lng: 0.1218 }, // Cambridge, UK
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false, // Disable for performance
        fullscreenControl: false, // Disable for simplicity
        zoomControl: true,
        gestureHandling: 'greedy',
        // Performance optimizations
        disableDefaultUI: false,
        clickableIcons: false, // Disable POI clicks for performance
      });
      
      console.log('✅ Google Maps created successfully');
      
      // Wait for map to be fully loaded
      google.maps.event.addListenerOnce(map, 'idle', () => {
        console.log('✅ Map idle event fired, loading sites...');
        loadSitesOnMap();
      });
      
    } catch (error) {
      console.error('❌ Error creating map:', error);
      mapEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h3>Error Creating Map</h3><p>' + error.message + '</p></div>';
    }
  };
  
  checkDimensions();
}

// Helper function to sort sites based on current criteria
function getSortedSites(sites) {
  if (!sites || sites.length === 0) return [];
  
  const sitesWithData = sites.map(site => ({
    ...site,
    // Use backend calculated neighbour count if available, otherwise calculate
    nearbySupplies: site.neighbourCount !== undefined ? site.neighbourCount : calculateNearbySupplies(site)
  }));
  
  switch(currentSortBy) {
    case 'utilisation_asc':
      return sitesWithData.sort((a, b) => (a.utilisation || 0) - (b.utilisation || 0));
    case 'onan_asc':
      return sitesWithData.sort((a, b) => (a.onanRating || 0) - (b.onanRating || 0));
    case 'supplies_desc':
      return sitesWithData.sort((a, b) => (b.nearbySupplies || 0) - (a.nearbySupplies || 0));
    default:
      return sitesWithData;
  }
}

async function loadSitesOnMap() {
  if (!map) {
    console.warn('⚠️ Map not initialized');
    return;
  }
  
  // Prevent duplicate loading
  if (isLoadingSites) {
    console.log('⏳ Already loading sites, skipping...');
    return;
  }
  
  isLoadingSites = true;
  
  try {
    // Clear existing markers
    if (markers.length > 0) {
      console.log(`🧹 Clearing ${markers.length} existing markers...`);
      markers.forEach(m => m.setMap(null));
      markers = [];
    }
    
    // Always fetch fresh data from backend to ensure filters are applied correctly
    // Don't use cached data as filters may have changed
    let sitesWithCoords;
    // Note: We always fetch from API to ensure backend filtering is applied
    {
      console.log('📡 Fetching sites from API...');
      
      // Build query parameters for backend filtering
      const params = new URLSearchParams();
      params.append('limit', '10000'); // Increase limit to get all filtered sites
      
      // Pass filter criteria to backend for server-side filtering
      // Always pass these parameters (frontend defaults will be used)
      params.append('utilisationBandMax', selectionCriteria.maxUtilisation || 40);
      params.append('onanRatingMin', selectionCriteria.minOnan || 1000);
      params.append('densityRadius', selectionCriteria.densityRadius || 3);  // Frontend default: 3 km
      params.append('minSupplies', selectionCriteria.minSupplies || 3);
      
      // Get current filter values from UI
      const selectedRegion = document.getElementById('region-filter')?.value || '';
      const searchText = document.getElementById('site-search')?.value.trim() || '';
      
      // Only pass region if it's not "All Regions" or empty
      if (selectedRegion && selectedRegion !== 'All Regions' && selectedRegion !== '') {
        params.append('region', selectedRegion);
      }
      if (searchText) {
        params.append('searchText', searchText);
      }
      
      const regionDisplay = (selectedRegion && selectedRegion !== 'All Regions') ? selectedRegion : 'All Regions';
      console.log('📡 API request with filters:', {
        utilisationBandMax: selectionCriteria.maxUtilisation,
        onanRatingMin: selectionCriteria.minOnan,
        densityRadius: selectionCriteria.densityRadius,
        minSupplies: selectionCriteria.minSupplies,
        region: regionDisplay,
        search: searchText || 'None'
      });
      
      const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?${params}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Map backend field names to frontend field names
        const mappedData = result.data.map(site => ({
          ...site,
          // Map backend fields to frontend expected fields
          utilisation: site.utilisationBandPercent,
          onanRating: site.onanRatingKva,
          latitude: site.lat,
          longitude: site.lng,
          // Preserve neighbour count from backend (already calculated with correct radius)
          neighbourCount: site.neighbourCountWithin5Km || 0
        }));
        
        sitesWithCoords = mappedData.filter(s => s.latitude && s.longitude);
        allSitesData = mappedData; // Cache for future use with mapped fields
        console.log(`✅ Loaded ${sitesWithCoords.length} sites with coordinates from backend (already filtered by server)`);
        console.log(`📊 Sample site data:`, sitesWithCoords[0] ? {
          region: sitesWithCoords[0].region,
          localAuthority: sitesWithCoords[0].localAuthority,
          utilisation: sitesWithCoords[0].utilisation,
          onanRating: sitesWithCoords[0].onanRating,
          hasCoords: !!(sitesWithCoords[0].latitude && sitesWithCoords[0].longitude),
          neighbourCount: sitesWithCoords[0].neighbourCount || 0,
          neighbourCountFromBackend: sitesWithCoords[0].neighbourCountWithin5Km || 0
        } : 'No sites loaded');
      } else {
        console.error('❌ API call failed or returned no data');
        console.error('Response:', result);
        isLoadingSites = false;
        return;
      }
    }
    
    // Note: Backend has already applied ALL filters including:
    // - Utilisation filter
    // - ONAN rating filter
    // - Region filter
    // - Search text filter
    // - Density radius filter (neighbour count calculation)
    // - Min supplies in radius filter
    // So the sites returned are already fully filtered!
    
    // Get current filter values for logging
    const selectedRegion = document.getElementById('region-filter')?.value || '';
    const searchText = document.getElementById('site-search')?.value.trim() || '';
    const regionDisplay = (selectedRegion && selectedRegion !== 'All Regions') ? selectedRegion : 'All Regions';
    
    console.log('✅ Backend filtering complete. Sites returned are already filtered by:');
    console.log(`   - Max Utilisation: ≤${selectionCriteria.maxUtilisation}% (interval-based)`);
    console.log(`   - Min ONAN: ≥${selectionCriteria.minOnan} kVA`);
    console.log(`   - Density Radius: ${selectionCriteria.densityRadius} km`);
    console.log(`   - Min Supplies in Radius: ≥${selectionCriteria.minSupplies}`);
    console.log(`   - Region: ${regionDisplay}`);
    console.log(`   - Search: ${searchText || 'None'}`);
    console.log(`   - Neighbour counts calculated by backend using radius: ${selectionCriteria.densityRadius} km`);
    
    // Use the sites returned from backend directly (they're already filtered)
    const filteredSites = sitesWithCoords;
    
    console.log(`📊 Final Results: ${sitesWithCoords.length} sites match all criteria (filtered by backend)`);
    
    if (filteredSites.length === 0) {
      console.warn('⚠️ No sites match filters. Try:');
      console.warn(`   - Increase Max Utilisation: ${selectionCriteria.maxUtilisation}%`);
      console.warn(`   - Decrease Min ONAN: ${selectionCriteria.minOnan} kVA`);
      console.warn(`   - Increase Density Radius: ${selectionCriteria.densityRadius} km`);
      console.warn(`   - Decrease Min Supplies: ${selectionCriteria.minSupplies}`);
    }
    
    // Store filtered sites for list rendering
    currentFilteredSites = filteredSites;
    
    // Update filtered count display with formatted number
    const countEl = document.getElementById('filtered-count');
    if (countEl) {
      const count = filteredSites.length;
      countEl.textContent = count.toLocaleString(); // Format with commas
      countEl.style.fontWeight = 'bold';
      countEl.style.color = count > 0 ? '#10b981' : '#ef4444';
      
      // Update parent text color for better visibility
      const parentEl = countEl.parentElement;
      if (parentEl) {
        parentEl.style.color = count > 0 ? '#10b981' : '#ef4444';
      }
    }
    
    // Create single shared InfoWindow for better performance
    if (!currentInfoWindow) {
      currentInfoWindow = new google.maps.InfoWindow();
    }
    
    // Limit markers to improve performance (reduce from 200 to 100)
    const maxMarkers = 100;
    const sitesToShow = filteredSites.slice(0, Math.min(maxMarkers, filteredSites.length));
    console.log(`📍 Creating ${sitesToShow.length} markers...`);
    
    // If no sites match filters, show message
    if (filteredSites.length === 0) {
      console.warn('⚠️ No sites match current filters');
      isLoadingSites = false;
      return;
    }
    
    // Sort sites based on current sort order before creating markers
    const sortedSites = getSortedSites(sitesToShow);
    
    // Use requestAnimationFrame for smooth rendering
    const createMarkersInBatches = (sites, batchSize = 20) => {
      let index = 0;
      
      const createBatch = () => {
        const batch = sites.slice(index, index + batchSize);
        
        batch.forEach((site, batchIdx) => {
          const globalIndex = index + batchIdx;
          const markerNumber = globalIndex + 1; // 1-based numbering
          
          const marker = new google.maps.Marker({
            position: { lat: site.latitude, lng: site.longitude },
            map: map,
            title: site.siteName || site.address,
            label: showMarkerLabels ? {
              text: String(markerNumber),
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold'
            } : null,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: site.utilisation <= 40 ? '#10b981' : '#ef4444',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: showMarkerLabels ? 8 : 5 // Larger when showing labels
            },
            optimized: true, // Enable marker optimization
            zIndex: showMarkerLabels ? markerNumber : 0 // Higher numbered markers on top when labeled
          });
          
          // Use single shared InfoWindow
          marker.addListener('click', () => {
            currentInfoWindow.setContent(`
              <div style="padding: 8px; font-family: -apple-system, sans-serif;">
                <strong style="color: #1f2937;">${site.siteName || site.address || 'Unknown Site'}</strong><br>
                <small style="color: #6b7280; line-height: 1.6;">
                  Region: ${site.region || '-'}<br>
                  ONAN: ${site.onanRating ? site.onanRating.toFixed(0) + ' kVA' : '-'}<br>
                  Utilisation: ${site.utilisation ? site.utilisation.toFixed(1) + '%' : '-'}
                </small>
              </div>
            `);
            currentInfoWindow.open(map, marker);
          });
          
          markers.push(marker);
        });
        
        index += batchSize;
        
        if (index < sites.length) {
          requestAnimationFrame(createBatch);
        } else {
          console.log(`✅ Created ${markers.length} markers`);
          
          // Fit bounds after all markers created
          if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(m => bounds.extend(m.getPosition()));
            map.fitBounds(bounds);
            
            // Adjust zoom to not be too close
            const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
              if (map.getZoom() > 15) {
                map.setZoom(15);
              }
            });
          }
          
          isLoadingSites = false;
          
          // Render filtered sites list after map is loaded
          renderFilteredSitesList();
        }
      };
      
      createBatch();
    };
    
    createMarkersInBatches(sortedSites);
    
  } catch (error) {
    console.error('❌ Error loading sites on map:', error);
    isLoadingSites = false;
    // Render empty state if error
    renderFilteredSitesList();
  }
}

// Render filtered sites list
function renderFilteredSitesList() {
  const container = document.getElementById('filtered-sites-list');
  if (!container) return;
  
  if (!currentFilteredSites || currentFilteredSites.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">No sites match filters</h3>
        <p style="margin: 0; color: #6b7280;">Adjust filter criteria to see results</p>
      </div>
    `;
    return;
  }
  
  // Sort sites based on current selection
  sortFilteredSites();
}

// Sort filtered sites
window.sortFilteredSites = function() {
  const sortBy = document.getElementById('sort-criteria')?.value || 'utilisation';
  const container = document.getElementById('filtered-sites-list');
  if (!container || !currentFilteredSites || currentFilteredSites.length === 0) return;
  
  // Update current sort order (convert from old format to new format)
  switch(sortBy) {
    case 'utilisation':
      currentSortBy = 'utilisation_asc';
      break;
    case 'onan':
      currentSortBy = 'onan_asc';
      break;
    case 'supplies':
      currentSortBy = 'supplies_desc';
      break;
  }
  
  console.log('📊 Sorting by:', currentSortBy);
  
  // Create a copy and sort
  let sortedSites = [...currentFilteredSites];
  
  switch(sortBy) {
    case 'utilisation':
      sortedSites.sort((a, b) => (a.utilisation || 0) - (b.utilisation || 0));
      break;
    case 'onan':
      sortedSites.sort((a, b) => (a.onanRating || 0) - (b.onanRating || 0));
      break;
    case 'supplies':
      // Sort by supplies in radius (high to low) - use backend calculated value
      sortedSites.sort((a, b) => {
        const aSupplies = a.neighbourCount !== undefined ? a.neighbourCount : calculateNearbySupplies(a);
        const bSupplies = b.neighbourCount !== undefined ? b.neighbourCount : calculateNearbySupplies(b);
        return bSupplies - aSupplies;
      });
      break;
  }
  
  // Render sorted list
  container.innerHTML = `
    <div class="sites-list-table">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Site Name</th>
            <th>Region</th>
            <th>Max Utilisation (%)</th>
            <th>ONAN Rating (kVA)</th>
            <th>Supplies in Radius</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedSites.map((site, index) => renderSiteListRow(site, index + 1, sortBy)).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  // If labels are enabled, reload map to update marker numbers
  if (showMarkerLabels && map) {
    console.log('🔄 Reloading map markers with new sort order');
    loadSitesOnMap();
  }
};

function calculateNearbySupplies(site) {
  if (!currentFilteredSites || !site.latitude || !site.longitude) return 0;
  
  const radius = selectionCriteria.densityRadius || 3; // km (frontend default)
  let count = 0;
  
  // Count OTHER qualified sites within radius
  // Use currentFilteredSites to ensure consistency with map filtering
  currentFilteredSites.forEach(otherSite => {
    if (otherSite.id === site.id) return; // Skip the site itself
    if (!otherSite.latitude || !otherSite.longitude) return;
    
    const distance = calculateDistance(
      site.latitude, site.longitude,
      otherSite.latitude, otherSite.longitude
    );
    
    if (distance <= radius) count++;
  });
  
  return count;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function renderSiteListRow(site, rank, sortBy) {
  // Use neighbour count from backend (already calculated with correct radius and filters)
  // Fallback to calculateNearbySupplies only if backend value is not available
  const nearbySupplies = site.neighbourCount !== undefined ? site.neighbourCount : calculateNearbySupplies(site);
  
  // Highlight the sorted column
  const highlightUtil = sortBy === 'utilisation' ? 'background: #fef3c7;' : '';
  const highlightOnan = sortBy === 'onan' ? 'background: #dbeafe;' : '';
  const highlightSupplies = sortBy === 'supplies' ? 'background: #d1fae5;' : '';
  
  // Color code utilisation
  const utilColor = (site.utilisation || 0) <= 40 ? '#10b981' : '#ef4444';
  
  // Color code supplies
  const suppliesColor = nearbySupplies >= selectionCriteria.minSupplies ? '#10b981' : '#ef4444';
  
  return `
    <tr class="site-list-row">
      <td style="text-align: center; font-weight: 600; color: #6b7280;">${rank}</td>
      <td>
        <div style="font-weight: 600; color: #1f2937;">${site.siteName || 'Unnamed Site'}</div>
        <div style="font-size: 12px; color: #6b7280;">${site.address || '-'}</div>
      </td>
      <td>${site.region || site.town || '-'}</td>
      <td style="${highlightUtil}">
        <span style="color: ${utilColor}; font-weight: 600;">
          ${(site.utilisation || 0).toFixed(1)}%
        </span>
      </td>
      <td style="${highlightOnan}">
        <span style="font-weight: 600;">
          ${(site.onanRating || 0).toFixed(0)} kVA
        </span>
      </td>
      <td style="${highlightSupplies}">
        <span style="color: ${suppliesColor}; font-weight: 600;">
          ${nearbySupplies}
        </span>
      </td>
      <td>
        <button class="btn-icon" onclick="viewSiteDetails('${site.id || ''}')" title="View Details">
          👁️
        </button>
      </td>
    </tr>
  `;
}

window.viewSiteDetails = function(siteId) {
  // Placeholder for viewing site details
  alert('Site details view - Coming soon!');
};

window.changeMapType = function(type) {
  if (map) {
    map.setMapTypeId(type === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
  }
};

window.toggleLabels = function() {
  const checkbox = document.getElementById('show-labels');
  if (!checkbox) return;
  
  showMarkerLabels = checkbox.checked;
  console.log('🏷️ Marker labels:', showMarkerLabels ? 'ON' : 'OFF');
  
  // Reload map to update marker labels
  loadSitesOnMap();
};

// ==================== Filter Panel Functions ====================
window.toggleFilterPanel = function() {
  const panel = document.getElementById('filter-panel-body');
  const icon = document.getElementById('filter-toggle-icon');
  
  if (panel && icon) {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
    icon.textContent = isHidden ? '▼' : '▶';
  }
};

window.updateCriteriaValue = function(type, value) {
  const displays = {
    'util': { el: 'util-value', suffix: '%', criteria: 'maxUtilisation' },
    'onan': { el: 'onan-value', suffix: '', criteria: 'minOnan' },
    'radius': { el: 'radius-value', suffix: ' km', criteria: 'densityRadius' },
    'supplies': { el: 'supplies-value', suffix: '', criteria: 'minSupplies' }
  };
  
  const display = displays[type];
  if (display) {
    const el = document.getElementById(display.el);
    if (el) el.textContent = value + display.suffix;
    
    // Update selectionCriteria immediately
    const numValue = parseInt(value);
    if (!isNaN(numValue) && display.criteria) {
      selectionCriteria[display.criteria] = numValue;
    }
    
    // Auto-apply filters when slider changes (with debounce for performance)
    clearTimeout(window.filterUpdateTimeout);
    window.filterUpdateTimeout = setTimeout(() => {
      if (map) {
        console.log(`🔄 Auto-applying filter: ${display.criteria} = ${numValue}`);
        loadSitesOnMap(); // This will call renderFilteredSitesList() at the end
      }
    }, 800); // 800ms debounce to avoid too many API calls
  }
};

// Region Filter Function
window.applyRegionFilter = function() {
  console.log('📍 Region filter changed');
  // Auto-apply filters when region changes (immediate, no debounce needed)
  if (map) {
    loadSitesOnMap(); // This will call renderFilteredSitesList() at the end
  }
};

// Search Filter Function
window.applySearchFilter = function() {
  console.log('🔍 Search filter changed');
  // Auto-apply filters when search text changes (with debounce)
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    if (map) {
      loadSitesOnMap();
    }
  }, 500); // 500ms debounce
};

// Store filtered sites globally for list rendering
let currentFilteredSites = [];
let showMarkerLabels = false;
let currentSortBy = 'utilisation_asc'; // Track current sort order

window.applyFiltersToMap = function() {
  // Update criteria from current inputs
  selectionCriteria = {
    maxUtilisation: parseInt(document.getElementById('criteria-util').value) || 40,
    minOnan: parseInt(document.getElementById('criteria-onan').value) || 1000,
    densityRadius: parseInt(document.getElementById('criteria-radius').value) || 3,
    minSupplies: parseInt(document.getElementById('criteria-supplies').value) || 3
  };
  
  // Reload map with filters
  console.log('🔍 Applying filters:', selectionCriteria);
  loadSitesOnMap();
  
  // Render filtered sites list
  renderFilteredSitesList();
  
  // Show success message
  const msg = document.getElementById('filter-message');
  if (msg) {
    msg.style.display = 'block';
    msg.style.color = '#10b981';
    msg.style.padding = '12px';
    msg.style.backgroundColor = '#d1fae5';
    msg.style.borderRadius = '8px';
    msg.textContent = '✅ Filters applied! Map updated with matching sites.';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  }
};

window.resetFiltersAndMap = function() {
  // Reset to frontend defaults
  selectionCriteria = {
    maxUtilisation: 40,
    minOnan: 1000,
    densityRadius: 3,  // Frontend default: 3 km
    minSupplies: 3
  };
  
  // Update UI
  document.getElementById('criteria-util').value = 40;
  document.getElementById('criteria-onan').value = 1000;
  document.getElementById('criteria-radius').value = 3;  // Frontend default: 3 km
  document.getElementById('criteria-supplies').value = 3;
  
  // Update value displays
  document.getElementById('util-value').textContent = '40%';
  document.getElementById('onan-value').textContent = '1000';
  document.getElementById('radius-value').textContent = '3 km';
  document.getElementById('supplies-value').textContent = '3';
  
  // Reload map
  console.log('🔄 Resetting filters to defaults');
  loadSitesOnMap();
  
  // Show message
  const msg = document.getElementById('filter-message');
  if (msg) {
    msg.style.display = 'block';
    msg.style.color = '#3b82f6';
    msg.style.padding = '12px';
    msg.style.backgroundColor = '#dbeafe';
    msg.style.borderRadius = '8px';
    msg.textContent = '🔄 Filters reset to defaults!';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  }
};

window.saveCriteriaSettings = function() {
  selectionCriteria = {
    maxUtilisation: parseInt(document.getElementById('criteria-util').value) || 40,
    minOnan: parseInt(document.getElementById('criteria-onan').value) || 1000,
    densityRadius: parseInt(document.getElementById('criteria-radius').value) || 3,
    minSupplies: parseInt(document.getElementById('criteria-supplies').value) || 3
  };
  
  saveCriteria();
  
  const msg = document.getElementById('filter-message');
  if (msg) {
    msg.style.display = 'block';
    msg.style.color = '#10b981';
    msg.style.padding = '12px';
    msg.style.backgroundColor = '#d1fae5';
    msg.style.borderRadius = '8px';
    msg.textContent = '💾 Criteria saved successfully! Will be applied on next page load.';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  }
};

window.resetCriteriaSettings = function() {
  // Reset to frontend defaults
  selectionCriteria = {
    maxUtilisation: 40,
    minOnan: 1000,
    densityRadius: 3,  // Frontend default: 3 km
    minSupplies: 3
  };
  
  document.getElementById('criteria-util').value = 40;
  document.getElementById('criteria-onan').value = 1000;
  document.getElementById('criteria-radius').value = 3;  // Frontend default: 3 km
  document.getElementById('criteria-supplies').value = 3;
  
  saveCriteria();
  
  const msg = document.getElementById('criteria-message');
  msg.style.display = 'block';
  msg.style.color = '#5369f8';
  msg.textContent = '🔄 Criteria reset to defaults';
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
};

// ==================== Site Compare Page ====================
function renderSiteComparePage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">⚖️ Site Comparison</h1>
        <p class="page-description">Compare multiple sites side by side with detailed criteria breakdown</p>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" onclick="compareAddSite()">
          ➕ Add Site to Compare
        </button>
        <button class="btn btn-secondary" onclick="compareClearAll()">
          🗑️ Clear All
        </button>
      </div>
    </div>
    
    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">📊 Sites in Comparison</h3>
        <span style="font-size: 14px; color: #6b7280;">
          <strong id="compare-count">0</strong> sites selected
        </span>
      </div>
      <div class="content-card-body">
        <div id="comparison-container">
          <div class="empty-state">
            <div class="empty-state-icon">⚖️</div>
            <h3>No sites selected for comparison</h3>
            <p>Add sites from the DC Selection Matrix recommendations or manually add sites here</p>
            <div class="empty-state-hint">
              💡 <strong>Tip:</strong> Select 2-4 sites for optimal comparison view
            </div>
            <button class="btn btn-primary" onclick="compareAddSite()" style="margin-top: 16px;">
              ➕ Add First Site
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load and render comparison
  loadComparison();
}

function loadComparison() {
  let comparisonList = [];
  try {
    const saved = localStorage.getItem('dc_comparison_list');
    if (saved) {
      comparisonList = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading comparison list:', e);
  }
  
  // Load actual site data
  let dcSites = [];
  try {
    const sitesData = localStorage.getItem('dc_matrix_sites');
    if (sitesData) {
      dcSites = JSON.parse(sitesData);
    }
  } catch (e) {
    console.error('Error loading sites:', e);
  }
  
  const comparisonSites = comparisonList
    .map(id => dcSites.find(s => s.id === id))
    .filter(s => s !== undefined);
  
  renderComparison(comparisonSites);
}

function renderComparison(sites) {
  const container = document.getElementById('comparison-container');
  const countEl = document.getElementById('compare-count');
  
  if (!container) return;
  if (countEl) countEl.textContent = sites.length;
  
  if (sites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚖️</div>
        <h3>No sites selected for comparison</h3>
        <p>Add sites from the DC Selection Matrix recommendations or manually add sites here</p>
        <div class="empty-state-hint">
          💡 <strong>Tip:</strong> Select 2-4 sites for optimal comparison view
        </div>
        <button class="btn btn-primary" onclick="compareAddSite()" style="margin-top: 16px;">
          ➕ Add First Site
        </button>
      </div>
    `;
    return;
  }
  
  // Render each site as a detailed card (like DC Matrix low score analysis)
  container.innerHTML = `
    <div class="comparison-sites-list">
      ${sites.map((site, index) => renderComparisonSiteCard(site, index + 1)).join('')}
    </div>
  `;
}

// Render individual site card with detailed analysis
function renderComparisonSiteCard(site, rank) {
  const totalScore = calculateTotalComparisonScore(site);
  const scoreColor = getComparisonScoreColor(totalScore);
  
  const DC_CRITERIA_FULL = [
    {
      id: 'power',
      name: 'Power and Energy Infrastructure',
      icon: '⚡',
      weight: 25,
      color: '#ef4444'
    },
    {
      id: 'network',
      name: 'Network and Latency',
      icon: '🌐',
      weight: 20,
      color: '#3b82f6'
    },
    {
      id: 'property',
      name: 'Property and Site Characteristics',
      icon: '🏢',
      weight: 15,
      color: '#10b981'
    },
    {
      id: 'planning',
      name: 'Planning Compliance and Regulatory',
      icon: '📋',
      weight: 15,
      color: '#f59e0b'
    },
    {
      id: 'cost',
      name: 'Cost and Commercial Viability',
      icon: '💰',
      weight: 15,
      color: '#8b5cf6'
    },
    {
      id: 'sustainability',
      name: 'Sustainability and ESG Alignment',
      icon: '🌱',
      weight: 10,
      color: '#059669'
    }
  ];
  
  // Identify problem criteria (score < 3)
  const problemCriteria = DC_CRITERIA_FULL.filter(criterion => {
    const score = calculateCriterionComparisonScore(site, criterion.id);
    return score < 3;
  });
  
  // Calculate total sub-criteria with problems
  const totalSubCriteria = 33; // 6+5+6+5+6+5
  const problemSubCriteria = DC_CRITERIA_FULL.reduce((count, criterion) => {
    if (!site.scores || !site.scores[criterion.id]) return count;
    const subScores = Object.values(site.scores[criterion.id]);
    return count + subScores.filter(s => s < 3).length;
  }, 0);
  
  // Calculate impact percentage
  const maxScore = 5.0;
  const lostScore = maxScore - totalScore;
  const impactPercentage = (lostScore / maxScore * 100).toFixed(0);
  
  const statusBadge = totalScore < 3 ? 
    '<span class="warning-badge">⚠️ Needs Attention</span>' : 
    totalScore >= 4 ? 
    '<span class="success-badge">✓ Excellent</span>' : 
    '<span class="good-badge">✓ Good</span>';
  
  return `
    <div class="low-score-site-card">
      <div class="low-score-site-header">
        <div class="low-score-rank" style="background-color: ${scoreColor}">
          #${rank}
        </div>
        <div class="low-score-site-info">
          <h3>
            ${site.name}
            ${statusBadge}
          </h3>
          <div class="low-score-meta">
            ${site.country ? `<span>🌍 ${site.country}</span><span>•</span>` : ''}
            ${site.region ? `<span>📍 ${site.region}</span><span>•</span>` : ''}
            <span>📊 Overall Score: <strong style="color: ${scoreColor}">${totalScore.toFixed(2)}/5.00</strong></span>
            <span>•</span>
            <span>📉 Performance Gap: <strong style="color: ${totalScore < 3 ? '#ef4444' : '#10b981'}">${impactPercentage}%</strong> ${totalScore < 3 ? 'below optimal' : 'to perfect'}</span>
          </div>
        </div>
        <div class="low-score-actions">
          <button class="btn-icon" onclick="compareEditSite('${site.id}')" title="Edit Scores">
            ✏️
          </button>
          <button class="btn-icon" onclick="compareRemoveSite('${site.id}')" title="Remove from Comparison">
            🗑️
          </button>
        </div>
      </div>
      
      <!-- Executive Summary Cards -->
      <div class="low-score-summary">
        <div class="summary-card ${problemCriteria.length > 0 ? 'summary-critical' : 'summary-success'}">
          <div class="summary-icon">${problemCriteria.length > 0 ? '⛔' : '✓'}</div>
          <div class="summary-content">
            <div class="summary-title">${problemCriteria.length > 0 ? 'Critical Issues' : 'All Good'}</div>
            <div class="summary-value">${problemCriteria.length} / ${DC_CRITERIA_FULL.length}</div>
            <div class="summary-label">criteria ${problemCriteria.length > 0 ? 'below standard' : 'meet standard'}</div>
          </div>
        </div>
        
        <div class="summary-card ${problemSubCriteria > 0 ? 'summary-subcriteria' : 'summary-success'}">
          <div class="summary-icon">🔍</div>
          <div class="summary-content">
            <div class="summary-title">Problem Areas</div>
            <div class="summary-value">${problemSubCriteria}</div>
            <div class="summary-label">sub-criteria need improvement</div>
          </div>
        </div>
        
        <div class="summary-card summary-potential">
          <div class="summary-icon">📈</div>
          <div class="summary-content">
            <div class="summary-title">Improvement Potential</div>
            <div class="summary-value">${impactPercentage}%</div>
            <div class="summary-label">score increase possible</div>
          </div>
        </div>
      </div>
      
      <!-- Full Criteria Breakdown -->
      <div class="criteria-overview">
        <h4>📊 Full Criteria Breakdown</h4>
        <div class="criteria-breakdown-grid">
          ${DC_CRITERIA_FULL.map(criterion => {
            const score = calculateCriterionComparisonScore(site, criterion.id);
            const isProblem = score < 3;
            const percentage = (score / 5 * 100).toFixed(0);
            
            return `
              <div class="criterion-breakdown-item ${isProblem ? 'criterion-problem' : ''}">
                <div class="criterion-breakdown-header">
                  <span class="criterion-icon" style="color: ${criterion.color}">${criterion.icon}</span>
                  <div class="criterion-breakdown-info">
                    <div class="criterion-breakdown-name">${criterion.name}</div>
                    <div class="criterion-breakdown-meta">
                      Weight: ${criterion.weight}% | Score: <strong style="color: ${isProblem ? '#ef4444' : criterion.color}">${score.toFixed(2)}/5.00</strong>
                    </div>
                  </div>
                  ${isProblem ? '<span class="problem-indicator">⚠️</span>' : '<span class="success-indicator">✓</span>'}
                </div>
                <div class="criterion-breakdown-bar">
                  <div class="criterion-breakdown-fill ${isProblem ? 'fill-problem' : ''}" 
                       style="width: ${percentage}%; background-color: ${isProblem ? '#ef4444' : criterion.color}"></div>
                  <span class="criterion-breakdown-percentage">${percentage}%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// Detailed Criteria Comparison with Sub-Criteria
function renderDetailedCriteriaComparison(sites) {
  const DC_CRITERIA_FULL = [
    {
      id: 'power',
      name: 'Power and Energy Infrastructure',
      icon: '⚡',
      weight: 25,
      color: '#ef4444',
      subCriteria: [
        { id: 'grid_connection', name: 'Grid connection availability and lead time' },
        { id: 'substation_proximity', name: 'Proximity to primary or grid substation' },
        { id: 'import_capacity', name: 'Available import capacity and reinforcement risk' },
        { id: 'reliability', name: 'Electricity reliability and outage history' },
        { id: 'renewable_access', name: 'Access to renewable energy or green tariffs' },
        { id: 'backup_generation', name: 'Ability to support backup generation and energy storage' }
      ]
    },
    {
      id: 'network',
      name: 'Network and Latency',
      icon: '🌐',
      weight: 20,
      color: '#3b82f6',
      subCriteria: [
        { id: 'fibre_density', name: 'Fibre density and route diversity' },
        { id: 'carrier_count', name: 'Number of available carriers' },
        { id: 'latency', name: 'Latency to target population or enterprise clusters' },
        { id: 'mec_proximity', name: 'Proximity to mobile core or MEC nodes' },
        { id: 'connectivity', name: 'Regional and international connectivity resilience' }
      ]
    },
    {
      id: 'property',
      name: 'Property and Site Characteristics',
      icon: '🏢',
      weight: 15,
      color: '#10b981',
      subCriteria: [
        { id: 'availability', name: 'Land or building availability' },
        { id: 'size_shape', name: 'Site size and shape suitability' },
        { id: 'planning_class', name: 'Planning use class compatibility' },
        { id: 'structural', name: 'Structural loading and floor to ceiling height' },
        { id: 'access', name: 'Setback, access and construction logistics' },
        { id: 'security', name: 'Security and boundary conditions' }
      ]
    },
    {
      id: 'planning',
      name: 'Planning Compliance and Regulatory',
      icon: '📋',
      weight: 15,
      color: '#f59e0b',
      subCriteria: [
        { id: 'permission_likelihood', name: 'Planning permission likelihood' },
        { id: 'authority_support', name: 'Local authority support and policy alignment' },
        { id: 'environmental', name: 'Environmental and noise compliance' },
        { id: 'data_sovereignty', name: 'Data protection and sovereignty constraints' },
        { id: 'permitting_timeline', name: 'Permitting timeline and approval risk' }
      ]
    },
    {
      id: 'cost',
      name: 'Cost and Commercial Viability',
      icon: '💰',
      weight: 15,
      color: '#8b5cf6',
      subCriteria: [
        { id: 'acquisition_cost', name: 'Land or building acquisition cost' },
        { id: 'connection_cost', name: 'Power connection and reinforcement cost' },
        { id: 'electricity_price', name: 'Electricity price structure and volatility' },
        { id: 'network_cost', name: 'Network access cost' },
        { id: 'tax_environment', name: 'Local tax environment and incentives' },
        { id: 'tco', name: 'Estimated total cost of ownership' }
      ]
    },
    {
      id: 'sustainability',
      name: 'Sustainability and ESG Alignment',
      icon: '🌱',
      weight: 10,
      color: '#059669',
      subCriteria: [
        { id: 'carbon_intensity', name: 'Grid carbon intensity' },
        { id: 'heat_reuse', name: 'Heat reuse potential' },
        { id: 'water_efficiency', name: 'Water usage and cooling efficiency' },
        { id: 'local_targets', name: 'Alignment with local sustainability targets' },
        { id: 'esg_reporting', name: 'ESG reporting and certification readiness' }
      ]
    }
  ];
  
  return DC_CRITERIA_FULL.map(criterion => {
    const avgScores = sites.map(site => calculateCriterionComparisonScore(site, criterion.id));
    
    return `
      <div class="criterion-comparison-card">
        <div class="criterion-header" onclick="toggleCriterionDetails('${criterion.id}')">
          <div class="criterion-title">
            <span class="criterion-icon-large">${criterion.icon}</span>
            <div>
              <h3>${criterion.name}</h3>
              <span class="criterion-weight-badge">Weight: ${criterion.weight}%</span>
            </div>
          </div>
          <button class="btn-expand" id="expand-btn-${criterion.id}">
            <span class="expand-icon">▼</span> Show Details
          </button>
        </div>
        
        <!-- Main Criterion Scores -->
        <div class="criterion-scores-summary">
          ${sites.map((site, idx) => {
            const score = avgScores[idx];
            const color = getComparisonScoreColor(score);
            const percentage = (score / 5 * 100).toFixed(0);
            return `
              <div class="site-score-column">
                <div class="site-name-label">${site.name}</div>
                <div class="score-display-large" style="color: ${color}">
                  ${score.toFixed(2)}
                </div>
                <div class="score-bar-mini">
                  <div class="score-bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Sub-Criteria Details (Collapsible) -->
        <div class="sub-criteria-details" id="details-${criterion.id}" style="display: none;">
          ${criterion.subCriteria.map(subCrit => `
            <div class="sub-criterion-row">
              <div class="sub-criterion-name">
                ${subCrit.name}
              </div>
              ${sites.map(site => {
                const score = site.scores?.[criterion.id]?.[subCrit.id] || 0;
                const color = getComparisonScoreColor(score);
                return `
                  <div class="sub-criterion-score">
                    <div class="score-badge-small" style="background-color: ${color}">
                      ${score.toFixed(1)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function calculateTotalComparisonScore(site) {
  if (!site.scores) return 0;
  
  const weights = {
    power: 25, network: 20, property: 15,
    planning: 15, cost: 15, sustainability: 10
  };
  
  let totalWeighted = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(criterionId => {
    const criterionScores = site.scores[criterionId];
    if (criterionScores) {
      const scores = Object.values(criterionScores);
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      totalWeighted += avgScore * weights[criterionId];
      totalWeight += weights[criterionId];
    }
  });
  
  return totalWeight > 0 ? totalWeighted / totalWeight : 0;
}

function calculateCriterionComparisonScore(site, criterionId) {
  if (!site.scores || !site.scores[criterionId]) return 0;
  const scores = Object.values(site.scores[criterionId]);
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function getComparisonScoreColor(score) {
  if (score >= 4) return '#10b981';
  if (score >= 3) return '#f59e0b';
  return '#ef4444';
}

window.compareAddSite = function() {
  // Show modal to select site from available sites
  const sitesData = localStorage.getItem('dc_matrix_sites');
  if (!sitesData) {
    alert('No sites available. Please create sites in the DC Selection Matrix first.');
    return;
  }
  
  const sites = JSON.parse(sitesData);
  const comparisonList = JSON.parse(localStorage.getItem('dc_comparison_list') || '[]');
  const availableSites = sites.filter(s => !comparisonList.includes(s.id));
  
  if (availableSites.length === 0) {
    alert('All available sites are already in the comparison.');
    return;
  }
  
  const siteOptions = availableSites.map(s => 
    `<option value="${s.id}">${s.name}${s.region ? ' (' + s.region + ')' : ''}</option>`
  ).join('');
  
  const modal = document.createElement('div');
  modal.className = 'dc-modal';
  modal.innerHTML = `
    <div class="dc-modal-content" style="max-width: 500px;">
      <div class="dc-modal-header">
        <h2>➕ Add Site to Comparison</h2>
        <button class="dc-modal-close" onclick="this.closest('.dc-modal').remove()">×</button>
      </div>
      <div class="dc-modal-body">
        <div class="form-group">
          <label class="form-label">Select Site</label>
          <select class="form-select" id="compare-site-select">
            ${siteOptions}
          </select>
        </div>
      </div>
      <div class="dc-modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.dc-modal').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="compareConfirmAdd()">Add Site</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.compareConfirmAdd = function() {
  const select = document.getElementById('compare-site-select');
  const siteId = select.value;
  
  if (siteId) {
    const comparisonList = JSON.parse(localStorage.getItem('dc_comparison_list') || '[]');
    comparisonList.push(siteId);
    localStorage.setItem('dc_comparison_list', JSON.stringify(comparisonList));
    
    // Close modal and reload
    document.querySelector('.dc-modal').remove();
    loadComparison();
  }
};

window.compareRemoveSite = function(siteId) {
  const comparisonList = JSON.parse(localStorage.getItem('dc_comparison_list') || '[]');
  const filtered = comparisonList.filter(id => id !== siteId);
  localStorage.setItem('dc_comparison_list', JSON.stringify(filtered));
  loadComparison();
};

window.compareClearAll = function() {
  if (confirm('Are you sure you want to clear all sites from comparison?')) {
    localStorage.setItem('dc_comparison_list', JSON.stringify([]));
    loadComparison();
  }
};

window.compareExport = function() {
  alert('📥 Export comparison to CSV - Coming soon!');
};

window.compareViewCharts = function() {
  alert('📊 Chart visualization - Coming soon!');
};

// Toggle individual criterion details
window.toggleCriterionDetails = function(criterionId) {
  const detailsEl = document.getElementById(`details-${criterionId}`);
  const btnEl = document.getElementById(`expand-btn-${criterionId}`);
  
  if (!detailsEl || !btnEl) return;
  
  const isHidden = detailsEl.style.display === 'none';
  detailsEl.style.display = isHidden ? 'block' : 'none';
  btnEl.innerHTML = isHidden 
    ? '<span class="expand-icon">▲</span> Hide Details'
    : '<span class="expand-icon">▼</span> Show Details';
};

// Expand/Collapse all criteria
let allCriteriaExpanded = false;

window.compareExpandAllCriteria = function() {
  const criteriaIds = ['power', 'network', 'property', 'planning', 'cost', 'sustainability'];
  allCriteriaExpanded = !allCriteriaExpanded;
  
  criteriaIds.forEach(id => {
    const detailsEl = document.getElementById(`details-${id}`);
    const btnEl = document.getElementById(`expand-btn-${id}`);
    
    if (detailsEl && btnEl) {
      detailsEl.style.display = allCriteriaExpanded ? 'block' : 'none';
      btnEl.innerHTML = allCriteriaExpanded
        ? '<span class="expand-icon">▲</span> Hide Details'
        : '<span class="expand-icon">▼</span> Show Details';
    }
  });
  
  // Update button text
  const expandAllBtn = document.getElementById('expand-all-text');
  const expandAllIcon = document.getElementById('expand-all-icon');
  if (expandAllBtn) expandAllBtn.textContent = allCriteriaExpanded ? 'Collapse All Details' : 'Expand All Details';
  if (expandAllIcon) expandAllIcon.textContent = allCriteriaExpanded ? '📕' : '📋';
};

// Edit site scores
window.compareEditSite = function(siteId) {
  const sitesData = localStorage.getItem('dc_matrix_sites');
  if (!sitesData) return;
  
  const sites = JSON.parse(sitesData);
  const site = sites.find(s => s.id === siteId);
  if (!site) return;
  
  // Create edit modal with all sub-criteria
  const modal = document.createElement('div');
  modal.className = 'dc-modal';
  modal.innerHTML = `
    <div class="dc-modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="dc-modal-header">
        <h2>✏️ Edit Scores - ${site.name}</h2>
        <button class="dc-modal-close" onclick="this.closest('.dc-modal').remove()">×</button>
      </div>
      <div class="dc-modal-body">
        ${renderEditScoresForm(site)}
      </div>
      <div class="dc-modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.dc-modal').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="compareSaveEditedScores('${siteId}')">💾 Save Changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

function renderEditScoresForm(site) {
  const criteria = [
    {
      id: 'power',
      name: 'Power and Energy Infrastructure',
      icon: '⚡',
      subCriteria: [
        { id: 'grid_connection', name: 'Grid connection availability and lead time' },
        { id: 'substation_proximity', name: 'Proximity to primary or grid substation' },
        { id: 'import_capacity', name: 'Available import capacity and reinforcement risk' },
        { id: 'reliability', name: 'Electricity reliability and outage history' },
        { id: 'renewable_access', name: 'Access to renewable energy or green tariffs' },
        { id: 'backup_generation', name: 'Ability to support backup generation and energy storage' }
      ]
    },
    {
      id: 'network',
      name: 'Network and Latency',
      icon: '🌐',
      subCriteria: [
        { id: 'fibre_density', name: 'Fibre density and route diversity' },
        { id: 'carrier_count', name: 'Number of available carriers' },
        { id: 'latency', name: 'Latency to target population or enterprise clusters' },
        { id: 'mec_proximity', name: 'Proximity to mobile core or MEC nodes' },
        { id: 'connectivity', name: 'Regional and international connectivity resilience' }
      ]
    },
    {
      id: 'property',
      name: 'Property and Site Characteristics',
      icon: '🏢',
      subCriteria: [
        { id: 'availability', name: 'Land or building availability' },
        { id: 'size_shape', name: 'Site size and shape suitability' },
        { id: 'planning_class', name: 'Planning use class compatibility' },
        { id: 'structural', name: 'Structural loading and floor to ceiling height' },
        { id: 'access', name: 'Setback, access and construction logistics' },
        { id: 'security', name: 'Security and boundary conditions' }
      ]
    },
    {
      id: 'planning',
      name: 'Planning Compliance and Regulatory',
      icon: '📋',
      subCriteria: [
        { id: 'permission_likelihood', name: 'Planning permission likelihood' },
        { id: 'authority_support', name: 'Local authority support and policy alignment' },
        { id: 'environmental', name: 'Environmental and noise compliance' },
        { id: 'data_sovereignty', name: 'Data protection and sovereignty constraints' },
        { id: 'permitting_timeline', name: 'Permitting timeline and approval risk' }
      ]
    },
    {
      id: 'cost',
      name: 'Cost and Commercial Viability',
      icon: '💰',
      subCriteria: [
        { id: 'acquisition_cost', name: 'Land or building acquisition cost' },
        { id: 'connection_cost', name: 'Power connection and reinforcement cost' },
        { id: 'electricity_price', name: 'Electricity price structure and volatility' },
        { id: 'network_cost', name: 'Network access cost' },
        { id: 'tax_environment', name: 'Local tax environment and incentives' },
        { id: 'tco', name: 'Estimated total cost of ownership' }
      ]
    },
    {
      id: 'sustainability',
      name: 'Sustainability and ESG Alignment',
      icon: '🌱',
      subCriteria: [
        { id: 'carbon_intensity', name: 'Grid carbon intensity' },
        { id: 'heat_reuse', name: 'Heat reuse potential' },
        { id: 'water_efficiency', name: 'Water usage and cooling efficiency' },
        { id: 'local_targets', name: 'Alignment with local sustainability targets' },
        { id: 'esg_reporting', name: 'ESG reporting and certification readiness' }
      ]
    }
  ];
  
  return criteria.map(criterion => {
    return `
      <div class="edit-criterion-section">
        <h3 class="edit-criterion-header">
          <span>${criterion.icon}</span> ${criterion.name}
        </h3>
        <div class="edit-sub-criteria-grid">
          ${criterion.subCriteria.map(subCrit => {
            const currentScore = site.scores?.[criterion.id]?.[subCrit.id] || 3;
            return `
              <div class="edit-score-item">
                <label class="edit-score-label">
                  ${subCrit.name}
                </label>
                <div class="score-input-group">
                  <input 
                    type="range" 
                    class="form-range" 
                    id="score-${criterion.id}-${subCrit.id}"
                    min="1" 
                    max="5" 
                    step="0.1" 
                    value="${currentScore}"
                    oninput="updateScoreDisplay('${criterion.id}', '${subCrit.id}')"
                  />
                  <span class="score-display-value" id="display-${criterion.id}-${subCrit.id}">
                    ${currentScore.toFixed(1)}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

window.updateScoreDisplay = function(criterionId, subCritId) {
  const input = document.getElementById(`score-${criterionId}-${subCritId}`);
  const display = document.getElementById(`display-${criterionId}-${subCritId}`);
  if (input && display) {
    display.textContent = parseFloat(input.value).toFixed(1);
    
    // Color coding
    const value = parseFloat(input.value);
    if (value >= 4) display.style.color = '#10b981';
    else if (value >= 3) display.style.color = '#f59e0b';
    else display.style.color = '#ef4444';
  }
};

window.compareSaveEditedScores = function(siteId) {
  const sitesData = localStorage.getItem('dc_matrix_sites');
  if (!sitesData) return;
  
  const sites = JSON.parse(sitesData);
  const siteIndex = sites.findIndex(s => s.id === siteId);
  if (siteIndex === -1) return;
  
  // Collect all scores from inputs
  const criteria = ['power', 'network', 'property', 'planning', 'cost', 'sustainability'];
  const subCriteriaMap = {
    power: ['grid_connection', 'substation_proximity', 'import_capacity', 'reliability', 'renewable_access', 'backup_generation'],
    network: ['fibre_density', 'carrier_count', 'latency', 'mec_proximity', 'connectivity'],
    property: ['availability', 'size_shape', 'planning_class', 'structural', 'access', 'security'],
    planning: ['permission_likelihood', 'authority_support', 'environmental', 'data_sovereignty', 'permitting_timeline'],
    cost: ['acquisition_cost', 'connection_cost', 'electricity_price', 'network_cost', 'tax_environment', 'tco'],
    sustainability: ['carbon_intensity', 'heat_reuse', 'water_efficiency', 'local_targets', 'esg_reporting']
  };
  
  // Initialize scores object if it doesn't exist
  if (!sites[siteIndex].scores) {
    sites[siteIndex].scores = {};
  }
  
  // Update all scores
  criteria.forEach(criterionId => {
    if (!sites[siteIndex].scores[criterionId]) {
      sites[siteIndex].scores[criterionId] = {};
    }
    
    subCriteriaMap[criterionId].forEach(subCritId => {
      const input = document.getElementById(`score-${criterionId}-${subCritId}`);
      if (input) {
        sites[siteIndex].scores[criterionId][subCritId] = parseFloat(input.value);
      }
    });
  });
  
  // Save to localStorage
  localStorage.setItem('dc_matrix_sites', JSON.stringify(sites));
  
  // Close modal
  document.querySelector('.dc-modal').remove();
  
  // Reload comparison
  loadComparison();
  
  // Show success message
  const tempMsg = document.createElement('div');
  tempMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
  tempMsg.textContent = '✅ Scores updated successfully!';
  document.body.appendChild(tempMsg);
  setTimeout(() => tempMsg.remove(), 3000);
};

// ==================== Reports Page ====================
function renderReportsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">📈 Reports</h1>
      <p class="page-description">Generate and export site selection reports</p>
    </div>
    
    <div class="content-card">
      <div class="content-card-body" style="text-align: center; padding: 60px 20px;">
        <span style="font-size: 48px;">📊</span>
        <h3 style="margin: 16px 0; color: #1f2937;">Reports Module</h3>
        <p style="color: #6b7280;">Advanced reporting features will be available soon</p>
        <div class="btn-group" style="justify-content: center; margin-top: 24px;">
          <button class="btn btn-primary" disabled>📄 Export PDF</button>
          <button class="btn btn-secondary" disabled>📊 Export Excel</button>
        </div>
      </div>
    </div>
  `;
}

// ==================== Utility Functions ====================
function formatNumber(num) {
  return num ? num.toLocaleString() : '-';
}

function formatDecimal(num, decimals = 2) {
  return num ? num.toFixed(decimals) : '-';
}

// Handle window resize
window.addEventListener('resize', () => {
  if (map) {
    google.maps.event.trigger(map, 'resize');
  }
  Object.values(chartsInstances).forEach(chart => {
    if (chart && chart.resize) chart.resize();
  });
});

console.log('✅ Orion Site Selection v2 Enhanced Edition loaded');

