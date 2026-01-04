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
let selectionCriteria = {
  maxUtilisation: 40,
  minOnan: 1000,
  densityRadius: 5,
  minSupplies: 3
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
      // Update stat cards
      document.getElementById('stat-total').textContent = statsData.total.toLocaleString();
      document.getElementById('stat-valid').textContent = statsData.validCandidateSites || 0;
      document.getElementById('stat-util').textContent = (statsData.avgUtilisation || 0).toFixed(1) + '%';
      document.getElementById('stat-onan').textContent = (statsData.avgOnanRating || 0).toFixed(0) + ' kVA';
      
      // Initialize charts
      initDashboardCharts(statsData);
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
      const sites = result.data;
      titleEl.textContent = `📋 Sites (${sites.length} results)`;
      
      if (sites.length === 0) {
        contentEl.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">No sites found matching criteria</p>';
        return;
      }
      
      // Render table
      contentEl.innerHTML = `
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Region</th>
                <th>Area</th>
                <th>ONAN (kVA)</th>
                <th>Utilisation (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${sites.slice(0, 100).map(site => `
                <tr>
                  <td><strong>${site.siteName || site.address || 'Unknown'}</strong></td>
                  <td>${site.region || '-'}</td>
                  <td>${site.area || '-'}</td>
                  <td>${site.onanRating ? site.onanRating.toFixed(0) : '-'}</td>
                  <td>
                    <span style="color: ${site.utilisation > 40 ? '#ef4444' : '#10b981'}">
                      ${site.utilisation ? site.utilisation.toFixed(1) : '-'}
                    </span>
                  </td>
                  <td>
                    ${site.utilisation && site.utilisation <= 40 && site.onanRating >= 1000 
                      ? '<span style="color: #10b981;">✅ Valid</span>' 
                      : '<span style="color: #6b7280;">-</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${sites.length > 100 ? `<p style="text-align: center; color: #6b7280; margin-top: 16px;">Showing first 100 of ${sites.length} results</p>` : ''}
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
              <option value="Cambridge">Cambridge</option>
              <option value="London">London</option>
              <option value="Oxford">Oxford</option>
              <option value="Brighton">Brighton</option>
              <option value="Norwich">Norwich</option>
            </select>
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
                   min="0" max="100" step="5"
                   oninput="updateCriteriaValue('util', this.value)">
            <small style="color: #6b7280;">Sites above this threshold are filtered out</small>
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
                   min="1" max="50" step="1"
                   oninput="updateCriteriaValue('radius', this.value)">
            <small style="color: #6b7280;">Search radius for nearby sites</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <strong>Min Supplies in Radius</strong>
              <span style="color: #10b981; margin-left: 8px;" id="supplies-value">${selectionCriteria.minSupplies}</span>
            </label>
            <input type="range" class="form-range" id="criteria-supplies" 
                   value="${selectionCriteria.minSupplies}" 
                   min="1" max="20" step="1"
                   oninput="updateCriteriaValue('supplies', this.value)">
            <small style="color: #6b7280;">Minimum sites required within radius</small>
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
  `;
  
  // Initialize Google Maps
  initializeGoogleMaps();
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
    
    // Use cached data if available
    let sitesWithCoords;
    if (allSitesData && allSitesData.length > 0) {
      console.log('✅ Using cached sites data');
      sitesWithCoords = allSitesData;
    } else {
      console.log('📡 Fetching sites from API...');
      const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?limit=500`);
      const result = await response.json();
      
      if (result.success && result.data) {
        sitesWithCoords = result.data.filter(s => s.latitude && s.longitude);
        allSitesData = sitesWithCoords; // Cache for future use
        console.log(`✅ Loaded ${sitesWithCoords.length} sites with coordinates`);
      } else {
        console.warn('⚠️ No sites data returned');
        isLoadingSites = false;
        return;
      }
    }
    
    // Get current filter values
    const selectedRegion = document.getElementById('region-filter')?.value || '';
    const searchText = document.getElementById('site-search')?.value.toLowerCase().trim() || '';
    
    // Apply filters to sites
    const filteredSites = sitesWithCoords.filter(site => {
      // Filter by utilisation
      if (site.utilisation > selectionCriteria.maxUtilisation) return false;
      
      // Filter by ONAN rating
      if (site.onanRating < selectionCriteria.minOnan) return false;
      
      // Filter by region
      if (selectedRegion) {
        const siteRegion = site.region || site.town || site.address || '';
        if (!siteRegion.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }
      
      // Filter by search text
      if (searchText) {
        const searchableText = [
          site.siteName,
          site.address,
          site.town,
          site.postcode,
          site.region
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchText)) {
          return false;
        }
      }
      
      // All filters passed
      return true;
    });
    
    console.log(`🔍 Filtered ${sitesWithCoords.length} sites → ${filteredSites.length} match criteria`);
    
    // Update filtered count display
    const countEl = document.getElementById('filtered-count');
    if (countEl) {
      countEl.textContent = filteredSites.length;
      countEl.style.fontWeight = 'bold';
      countEl.style.color = filteredSites.length > 0 ? '#10b981' : '#ef4444';
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
    
    // Use requestAnimationFrame for smooth rendering
    const createMarkersInBatches = (sites, batchSize = 20) => {
      let index = 0;
      
      const createBatch = () => {
        const batch = sites.slice(index, index + batchSize);
        
        batch.forEach(site => {
          const marker = new google.maps.Marker({
            position: { lat: site.latitude, lng: site.longitude },
            map: map,
            title: site.siteName || site.address,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: site.utilisation <= 40 ? '#10b981' : '#ef4444',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 5 // Slightly smaller for better performance
            },
            optimized: true // Enable marker optimization
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
        }
      };
      
      createBatch();
    };
    
    createMarkersInBatches(sitesToShow);
    
  } catch (error) {
    console.error('❌ Error loading sites on map:', error);
    isLoadingSites = false;
  }
}

window.changeMapType = function(type) {
  if (map) {
    map.setMapTypeId(type === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
  }
};

window.toggleLabels = function() {
  // This would require more complex implementation
  console.log('Toggle labels clicked');
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
    'util': { el: 'util-value', suffix: '%' },
    'onan': { el: 'onan-value', suffix: '' },
    'radius': { el: 'radius-value', suffix: ' km' },
    'supplies': { el: 'supplies-value', suffix: '' }
  };
  
  const display = displays[type];
  if (display) {
    const el = document.getElementById(display.el);
    if (el) el.textContent = value + display.suffix;
  }
};

// Region Filter Function
window.applyRegionFilter = function() {
  console.log('📍 Region filter changed');
  // Auto-apply filters when region changes
  if (map && allSitesData) {
    loadSitesOnMap();
  }
};

// Search Filter Function
window.applySearchFilter = function() {
  console.log('🔍 Search filter changed');
  // Auto-apply filters when search text changes (with debounce)
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    if (map && allSitesData) {
      loadSitesOnMap();
    }
  }, 500); // 500ms debounce
};

window.applyFiltersToMap = function() {
  // Update criteria from current inputs
  selectionCriteria = {
    maxUtilisation: parseInt(document.getElementById('criteria-util').value) || 40,
    minOnan: parseInt(document.getElementById('criteria-onan').value) || 1000,
    densityRadius: parseInt(document.getElementById('criteria-radius').value) || 5,
    minSupplies: parseInt(document.getElementById('criteria-supplies').value) || 3
  };
  
  // Reload map with filters
  console.log('🔍 Applying filters:', selectionCriteria);
  loadSitesOnMap();
  
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
  // Reset to defaults
  selectionCriteria = {
    maxUtilisation: 40,
    minOnan: 1000,
    densityRadius: 5,
    minSupplies: 3
  };
  
  // Update UI
  document.getElementById('criteria-util').value = 40;
  document.getElementById('criteria-onan').value = 1000;
  document.getElementById('criteria-radius').value = 5;
  document.getElementById('criteria-supplies').value = 3;
  
  // Update value displays
  document.getElementById('util-value').textContent = '40%';
  document.getElementById('onan-value').textContent = '1000';
  document.getElementById('radius-value').textContent = '5 km';
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
    densityRadius: parseInt(document.getElementById('criteria-radius').value) || 5,
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
  selectionCriteria = {
    maxUtilisation: 40,
    minOnan: 1000,
    densityRadius: 5,
    minSupplies: 3
  };
  
  document.getElementById('criteria-util').value = 40;
  document.getElementById('criteria-onan').value = 1000;
  document.getElementById('criteria-radius').value = 5;
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
  
  container.innerHTML = `
    <div class="comparison-table-wrapper">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="comparison-header-cell">Criteria</th>
            ${sites.map((site, idx) => `
              <th class="comparison-site-cell">
                <div class="comparison-site-header">
                  <div class="site-header-content">
                    <strong>${site.name}</strong>
                    ${site.region ? `<small>${site.region}</small>` : ''}
                  </div>
                  <button class="btn-icon-sm" onclick="compareRemoveSite('${site.id}')" title="Remove">
                    ×
                  </button>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr class="comparison-overall-row">
            <td class="comparison-label-cell"><strong>Overall Score</strong></td>
            ${sites.map(site => {
              const score = calculateTotalComparisonScore(site);
              const color = getComparisonScoreColor(score);
              return `
                <td class="comparison-value-cell">
                  <div class="comparison-score-badge" style="background-color: ${color}">
                    <span class="score-large">${score.toFixed(2)}</span>
                    <span class="score-label">/5.00</span>
                  </div>
                </td>
              `;
            }).join('')}
          </tr>
          ${renderComparisonCriteriaRows(sites)}
        </tbody>
      </table>
    </div>
    
    <div class="comparison-actions">
      <button class="btn btn-secondary" onclick="compareExport()">
        📥 Export Comparison
      </button>
      <button class="btn btn-secondary" onclick="compareViewCharts()">
        📊 View Charts
      </button>
    </div>
  `;
}

function renderComparisonCriteriaRows(sites) {
  const DC_CRITERIA = [
    { id: 'power', name: 'Power and Energy Infrastructure', icon: '⚡', weight: 25 },
    { id: 'network', name: 'Network and Latency', icon: '🌐', weight: 20 },
    { id: 'property', name: 'Property and Site Characteristics', icon: '🏢', weight: 15 },
    { id: 'planning', name: 'Planning Compliance and Regulatory', icon: '📋', weight: 15 },
    { id: 'cost', name: 'Cost and Commercial Viability', icon: '💰', weight: 15 },
    { id: 'sustainability', name: 'Sustainability and ESG Alignment', icon: '🌱', weight: 10 }
  ];
  
  return DC_CRITERIA.map(criterion => `
    <tr class="comparison-criterion-row">
      <td class="comparison-label-cell">
        <span class="criterion-icon">${criterion.icon}</span>
        <span class="criterion-name">${criterion.name}</span>
        <span class="criterion-weight">(${criterion.weight}%)</span>
      </td>
      ${sites.map(site => {
        const score = calculateCriterionComparisonScore(site, criterion.id);
        const percentage = (score / 5 * 100).toFixed(0);
        return `
          <td class="comparison-value-cell">
            <div class="criterion-score-display">
              <span class="score-value">${score.toFixed(1)}</span>
              <div class="score-progress">
                <div class="score-progress-bar" style="width: ${percentage}%"></div>
              </div>
            </div>
          </td>
        `;
      }).join('')}
    </tr>
  `).join('');
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

