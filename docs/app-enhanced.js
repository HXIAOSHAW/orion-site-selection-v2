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
let allSitesData = null;
let statsData = null;
let chartsInstances = {};

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
  currentPage = page;
  const content = document.getElementById('page-content');
  
  // Cleanup previous page
  cleanupCurrentPage();
  
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
    case 'site-compare':
      renderSiteComparePage(content);
      break;
    case 'criteria':
      renderCriteriaPage(content);
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
  Object.values(chartsInstances).forEach(chart => {
    if (chart && chart.dispose) chart.dispose();
  });
  chartsInstances = {};
  
  // Clear markers but keep map instance
  if (markers.length > 0) {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }
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
      <h1 class="page-title">⚡ Power Analysis</h1>
      <p class="page-description">Geographic visualization of power supply sites</p>
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
    createMap();
  } else if (!googleMapsLoaded) {
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
  }
}

function createMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  
  // Check if map already exists and is visible
  if (map && mapEl.offsetWidth > 0 && mapEl.offsetHeight > 0) {
    console.log('✅ Reusing existing map');
    google.maps.event.trigger(map, 'resize');
    loadSitesOnMap();
    return;
  }
  
  // Wait for container to have dimensions
  if (mapEl.offsetWidth === 0 || mapEl.offsetHeight === 0) {
    console.log('⏳ Waiting for map container dimensions...');
    setTimeout(createMap, 100);
    return;
  }
  
  // Clear loading indicator
  mapEl.innerHTML = '';
  
  // Create map
  try {
    map = new google.maps.Map(mapEl, {
      center: { lat: 52.2053, lng: 0.1218 }, // Cambridge, UK
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      gestureHandling: 'greedy'
    });
    
    console.log('✅ Google Maps created');
    
    // Load sites
    loadSitesOnMap();
    
    // Trigger resize after short delay
    setTimeout(() => {
      google.maps.event.trigger(map, 'resize');
    }, 300);
  } catch (error) {
    console.error('❌ Error creating map:', error);
    mapEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;"><h3>Error Creating Map</h3><p>' + error.message + '</p></div>';
  }
}

async function loadSitesOnMap() {
  if (!map) {
    console.warn('Map not initialized');
    return;
  }
  
  try {
    // Clear existing markers
    markers.forEach(m => m.setMap(null));
    markers = [];
    
    // Fetch sites with coordinates
    const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?limit=1000`);
    const result = await response.json();
    
    if (result.success && result.data) {
      const sitesWithCoords = result.data.filter(s => s.latitude && s.longitude);
      console.log(`✅ Loaded ${sitesWithCoords.length} sites with coordinates`);
      
      // Add markers (limit to first 200 for performance)
      sitesWithCoords.slice(0, 200).forEach(site => {
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
            scale: 6
          }
        });
        
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: var(--font-family);">
              <strong>${site.siteName || site.address || 'Unknown Site'}</strong><br>
              <small style="color: #6b7280;">
                Region: ${site.region || '-'}<br>
                ONAN: ${site.onanRating ? site.onanRating.toFixed(0) + ' kVA' : '-'}<br>
                Utilisation: ${site.utilisation ? site.utilisation.toFixed(1) + '%' : '-'}
              </small>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        markers.push(marker);
      });
      
      // Fit bounds if we have markers
      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(m => bounds.extend(m.getPosition()));
        map.fitBounds(bounds);
      }
    }
  } catch (error) {
    console.error('Error loading sites on map:', error);
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

// ==================== Criteria Page ====================
function renderCriteriaPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">⚙️ Selection Criteria</h1>
      <p class="page-description">Configure site selection parameters</p>
    </div>
    
    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">📋 Current Criteria</h3>
      </div>
      <div class="content-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Max Utilisation (%)</label>
            <input type="number" class="form-input" id="criteria-util" value="${selectionCriteria.maxUtilisation}" min="0" max="100">
            <small style="color: #6b7280;">Sites above this threshold are not eligible</small>
          </div>
          <div class="form-group">
            <label class="form-label">Min ONAN Rating (kVA)</label>
            <input type="number" class="form-input" id="criteria-onan" value="${selectionCriteria.minOnan}" min="0">
            <small style="color: #6b7280;">Minimum transformer rating required</small>
          </div>
          <div class="form-group">
            <label class="form-label">Density Radius (km)</label>
            <input type="number" class="form-input" id="criteria-radius" value="${selectionCriteria.densityRadius}" min="1" max="50">
            <small style="color: #6b7280;">Search radius for nearby sites</small>
          </div>
          <div class="form-group">
            <label class="form-label">Min Supplies in Radius</label>
            <input type="number" class="form-input" id="criteria-supplies" value="${selectionCriteria.minSupplies}" min="1" max="20">
            <small style="color: #6b7280;">Minimum sites required within radius</small>
          </div>
        </div>
        
        <div class="btn-group mt-4">
          <button class="btn btn-primary" onclick="saveCriteriaSettings()">💾 Save Criteria</button>
          <button class="btn btn-secondary" onclick="resetCriteriaSettings()">🔄 Reset to Defaults</button>
        </div>
        
        <div id="criteria-message" class="mt-4" style="display: none;"></div>
      </div>
    </div>
  `;
}

window.saveCriteriaSettings = function() {
  selectionCriteria = {
    maxUtilisation: parseInt(document.getElementById('criteria-util').value) || 40,
    minOnan: parseInt(document.getElementById('criteria-onan').value) || 1000,
    densityRadius: parseInt(document.getElementById('criteria-radius').value) || 5,
    minSupplies: parseInt(document.getElementById('criteria-supplies').value) || 3
  };
  
  saveCriteria();
  
  const msg = document.getElementById('criteria-message');
  msg.style.display = 'block';
  msg.style.color = '#10b981';
  msg.textContent = '✅ Criteria saved successfully!';
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
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
      <h1 class="page-title">⚖️ Site Compare</h1>
      <p class="page-description">Compare multiple sites side by side</p>
    </div>
    
    <div class="content-card">
      <div class="content-card-body" style="text-align: center; padding: 60px 20px;">
        <span style="font-size: 48px;">🚧</span>
        <h3 style="margin: 16px 0; color: #1f2937;">Feature Coming Soon</h3>
        <p style="color: #6b7280;">Site comparison functionality will be available in the next release</p>
      </div>
    </div>
  `;
}

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


