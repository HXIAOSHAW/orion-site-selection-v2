/**
 * Simplified Orion Site Selection v2 Frontend
 * Clean, simple, fast, maintainable
 */

// Configuration
// Auto-detect environment: use production API if deployed, localhost if local
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'  // Local development
  : 'https://your-backend-url.com';  // Production - UPDATE THIS after deploying backend

const CONFIG = {
  API_BASE: API_BASE_URL,
  PASSWORD: 'EdgeNebula2026',
  STORAGE_KEY: 'orion_access_granted'
};

// Global state
let currentPage = 'dashboard';
let selectionCriteria = {
  maxUtilisation: 40,
  minOnan: 1000,
  densityRadius: 5,
  minSupplies: 3
};

// Password protection
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
    setTimeout(() => errorEl.classList.remove('show'), 3000);
  }
}

// Check if already authenticated
if (sessionStorage.getItem(CONFIG.STORAGE_KEY) === 'true') {
  document.getElementById('password-protection').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  initApp();
} else {
  document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
}

// Initialize application
function initApp() {
  // Load selection criteria from localStorage
  const saved = localStorage.getItem('siteSelectionCriteria');
  if (saved) {
    try {
      selectionCriteria = { ...selectionCriteria, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load criteria:', e);
    }
  }
  
  // Setup navigation
  setupNavigation();
  
  // Load initial page
  loadPage('dashboard');
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

// Load page content
function loadPage(page) {
  currentPage = page;
  const content = document.getElementById('page-content');
  
  // Clean up previous page
  if ((currentPage === 'power-analysis' || currentPage === 'site-map') && 
      page !== 'power-analysis' && page !== 'site-map') {
    // Leaving map pages, clear markers but keep map instance
    if (markers && markers.length > 0) {
      markers.forEach(m => m.setMap(null));
      markers = [];
    }
  }
  
  switch(page) {
    case 'dashboard':
      loadDashboard(content);
      break;
    case 'site-list':
      loadSiteList(content);
      break;
    case 'power-analysis':
      loadPowerAnalysis(content);
      break;
    case 'site-map':
      loadSiteMap(content);
      break;
    case 'site-compare':
      loadSiteCompare(content);
      break;
    case 'criteria':
      loadCriteria(content);
      break;
    case 'reports':
      loadReports(content);
      break;
    default:
      content.innerHTML = '<div class="page-header"><h2>Page Not Found</h2></div>';
  }
}

// API helper
async function apiGet(endpoint, params = {}) {
  const url = new URL(`${CONFIG.API_BASE}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Build API URL with criteria
function buildApiUrl(endpoint, additionalParams = {}) {
  const params = {
    utilisationBandMax: selectionCriteria.maxUtilisation,
    onanRatingMin: selectionCriteria.minOnan,
    ...additionalParams
  };
  return { endpoint, params };
}

// Dashboard page
async function loadDashboard(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Dashboard</h2>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card-title">Total Sites</div>
        <div class="kpi-card-value" id="kpi-total">-</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-title">Valid Candidates</div>
        <div class="kpi-card-value" id="kpi-valid">-</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-title">Avg Utilisation</div>
        <div class="kpi-card-value" id="kpi-utilisation">-</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-title">Avg ONAN Rating</div>
        <div class="kpi-card-value" id="kpi-onan">-</div>
      </div>
    </div>
    <div class="chart-container">
      <div class="chart-title">Regional Distribution</div>
      <div id="chart-regions" class="chart"></div>
    </div>
  `;
  
  try {
    const { endpoint, params } = buildApiUrl('/api/power-supplies/stats');
    const result = await apiGet(endpoint, params);
    
    if (result.success) {
      const stats = result.data;
      document.getElementById('kpi-total').textContent = stats.total.toLocaleString();
      document.getElementById('kpi-valid').textContent = stats.validCandidateSites.toLocaleString();
      document.getElementById('kpi-utilisation').textContent = stats.avgUtilisation.toFixed(1) + '%';
      document.getElementById('kpi-onan').textContent = Math.round(stats.avgOnanRating).toLocaleString() + ' kVA';
      
      // Simple chart (using basic HTML/CSS, can be enhanced with Chart.js)
      renderRegionsChart(stats.regions);
    }
  } catch (error) {
    container.innerHTML += `<div class="error-message">Error loading dashboard: ${error.message}</div>`;
  }
}

// Simple regions chart
function renderRegionsChart(regions) {
  const chartEl = document.getElementById('chart-regions');
  if (!chartEl) return;
  
  const topRegions = regions.slice(0, 10);
  const maxCount = Math.max(...topRegions.map(r => r.count));
  
  chartEl.innerHTML = topRegions.map(region => `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${region.name}</span>
        <span style="font-weight: 600;">${region.count}</span>
      </div>
      <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background: #5369f8; height: 100%; width: ${(region.count / maxCount) * 100}%;"></div>
      </div>
    </div>
  `).join('');
}

// Site List page
async function loadSiteList(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Site List</h2>
    </div>
    <div class="site-list-container">
      <div class="search-bar">
        <input type="text" id="search-input" placeholder="Search sites..." onkeypress="if(event.key==='Enter') searchSites()">
        <button onclick="searchSites()">Search</button>
      </div>
      <div class="table-container">
        <table id="sites-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Region</th>
              <th>Utilisation %</th>
              <th>ONAN (kVA)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="sites-tbody">
            <tr><td colspan="5" class="loading">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  try {
    const { endpoint, params } = buildApiUrl('/api/power-supplies', { limit: 100 });
    const result = await apiGet(endpoint, params);
    
    if (result.success) {
      renderSitesTable(result.data);
    }
  } catch (error) {
    const tbody = document.getElementById('sites-tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="error-message">Error loading sites: ${error.message}</td></tr>`;
    }
  }
}

function renderSitesTable(sites) {
  const tbody = document.getElementById('sites-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = sites.map(site => `
    <tr>
      <td>${site.siteName || '-'}</td>
      <td>${site.localAuthority || site.region || '-'}</td>
      <td>${site.utilisationBandPercent.toFixed(1)}%</td>
      <td>${site.onanRatingKva}</td>
      <td>
        <span style="color: ${site.isValidCandidateSite ? 'green' : 'red'}; font-weight: 600;">
          ${site.isValidCandidateSite ? 'Valid' : 'Invalid'}
        </span>
      </td>
    </tr>
  `).join('');
}

// Search sites
window.searchSites = async function() {
  const searchText = document.getElementById('search-input')?.value;
  const tbody = document.getElementById('sites-tbody');
  
  if (!searchText) {
    // Reload all sites
    try {
      const { endpoint, params } = buildApiUrl('/api/power-supplies', { limit: 100 });
      const result = await apiGet(endpoint, params);
      if (result.success) {
        renderSitesTable(result.data);
      }
    } catch (error) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="error-message">Error: ${error.message}</td></tr>`;
    }
    return;
  }
  
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="loading">Searching...</td></tr>';
  
  try {
    const { endpoint, params } = buildApiUrl('/api/power-supplies', { searchText, limit: 100 });
    const result = await apiGet(endpoint, params);
    
    if (result.success) {
      renderSitesTable(result.data);
    }
  } catch (error) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="error-message">Search error: ${error.message}</td></tr>`;
    console.error('Search error:', error);
  }
};

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function() {
  // This will be called when page loads, but search input might not exist yet
  // So we'll add listener when site-list page loads
});

// Power Analysis page
function loadPowerAnalysis(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>⚡ Power Supply Analysis - AI-Enabled Site Selection</h2>
    </div>
    <div style="display: flex; gap: 20px; height: 600px;">
      <div style="width: 350px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; overflow-y: auto;">
        <h3 style="margin: 0 0 20px 0;">Search & Filters</h3>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Search Address:</label>
          <input type="text" id="address-input" placeholder="e.g., Cambridge, UK" 
                 style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="searchLocation()" style="flex: 1; padding: 10px; background: #5369f8; color: white; border: none; border-radius: 6px; cursor: pointer;">
              🔍 SEARCH LOCATION
            </button>
            <button onclick="geocodeAddress()" style="flex: 1; padding: 10px; background: #5369f8; color: white; border: none; border-radius: 6px; cursor: pointer;">
              📍 GEOCODE ADDRESS
            </button>
          </div>
        </div>
        <div id="search-results" style="margin-top: 20px;">
          <h4>Search Results</h4>
          <textarea readonly style="width: 100%; height: 200px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px;">
Enter an address and click search to see results.</textarea>
        </div>
      </div>
      <div style="flex: 1; position: relative; height: 600px; min-height: 600px;">
        <div id="map-wrapper" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
          <div id="map" style="width: 100%; height: 100%; border-radius: 8px; background: #f0f0f0;">
            <div class="map-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Loading Google Maps...</div>
          </div>
        </div>
        <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000;">
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="radio" name="map-type" value="roadmap" checked onchange="changeMapType('roadmap')">
            Map
          </label>
          <label style="display: flex; align-items: center; gap: 8px;">
            <input type="radio" name="map-type" value="satellite" onchange="changeMapType('satellite')">
            Satellite
          </label>
        </div>
      </div>
    </div>
  `;
  
  // Handle map initialization/recreation
  setTimeout(() => {
    if (powerAnalysisLoaded && mapInitialized) {
      // Page was loaded before, need to recreate map
      console.log('Power Analysis page reloaded, recreating map...');
      map = null; // Force reset
      createMap();
    } else {
      // First time loading
      console.log('First time loading Power Analysis page');
      powerAnalysisLoaded = true;
      initGoogleMaps();
    }
  }, 300);
}

// Google Maps initialization
let map = null;
let markers = [];
let mapInitialized = false;
let powerAnalysisLoaded = false;
let siteMapLoaded = false;

function initGoogleMaps() {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBGR0-qpZQoV6x3GX3q7ygwLbKgKgOlYdc';
  
  // Check if already loaded
  if (window.google && window.google.maps) {
    console.log('Google Maps already loaded, creating map...');
    createMap();
    return;
  }
  
  if (mapInitialized) {
    console.log('Map initialization already in progress, skipping...');
    return;
  }
  
  // Load Google Maps API
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=en&region=GB&callback=initMapCallback`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  
  window.initMapCallback = function() {
    mapInitialized = true;
    createMap();
  };
}

function createMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) {
    console.error('Map div not found');
    return;
  }
  
  // Force reset map if switching back to page
  if (map && (currentPage === 'power-analysis' || currentPage === 'site-map')) {
    console.log('Resetting existing map for page switch');
    map = null;
  }
  
  if (map) {
    console.log('Map already initialized');
    return;
  }
  
  // Force the map div to have explicit dimensions
  mapDiv.style.width = '100%';
  mapDiv.style.height = '100%';
  mapDiv.style.position = 'relative';
  
  // For Site Map page, ensure the parent container has height
  if (currentPage === 'site-map') {
    const parent = mapDiv.parentElement;
    if (parent && parent.style.height === '') {
      parent.style.height = '600px';
    }
  }
  
  // Ensure the map div has dimensions
  const rect = mapDiv.getBoundingClientRect();
  console.log('Map div dimensions:', rect.width, 'x', rect.height);
  
  // Add retry limit to prevent infinite loop
  if (!window.mapRetryCount) window.mapRetryCount = 0;
  
  if (rect.width === 0 || rect.height === 0) {
    window.mapRetryCount++;
    if (window.mapRetryCount > 5) {
      console.error('Failed to create map after 5 retries - map container has no dimensions');
      window.mapRetryCount = 0;
      return;
    }
    console.warn(`Map div has no dimensions, retry ${window.mapRetryCount}/5...`);
    setTimeout(createMap, 500);
    return;
  }
  
  // Reset retry count on success
  window.mapRetryCount = 0;
  
  // Remove loading indicator
  const loading = mapDiv.querySelector('.map-loading');
  if (loading) loading.remove();
  
  try {
    // Create the map
    map = new google.maps.Map(mapDiv, {
      center: { lat: 52.2053, lng: 0.1218 }, // Cambridge, UK
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'greedy',
      fullscreenControl: false,
      streetViewControl: false
    });
    
    window.map = map;
    console.log('Map created successfully');
    
    // Force a resize after creation
    setTimeout(() => {
      if (map) {
        google.maps.event.trigger(map, 'resize');
        map.setCenter({ lat: 52.2053, lng: 0.1218 });
      }
    }, 100);
    
    // Load sites after map is ready
    google.maps.event.addListenerOnce(map, 'idle', function() {
      console.log('Map is ready, loading sites...');
      loadSitesOnMap();
    });
  } catch (error) {
    console.error('Error creating map:', error);
  }
}

window.changeMapType = function(type) {
  if (!map) return;
  map.setMapTypeId(type === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
};

async function loadSitesOnMap() {
  if (!map) {
    console.log('Map not ready, skipping loadSitesOnMap');
    return;
  }
  
  try {
    const { endpoint, params } = buildApiUrl('/api/power-supplies', { limit: 50 });
    const result = await apiGet(endpoint, params);
    
    if (result.success) {
      // Clear existing markers
      markers.forEach(m => m.setMap(null));
      markers = [];
      
      // Add markers for sites with coordinates
      result.data.forEach(site => {
        if (site.lat && site.lng) {
          const marker = new google.maps.Marker({
            position: { lat: site.lat, lng: site.lng },
            map: map,
            title: site.siteName,
            icon: site.isValidCandidateSite 
              ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
          
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0;">${site.siteName || 'Unknown'}</h4>
                <p style="margin: 4px 0;"><strong>Region:</strong> ${site.localAuthority || 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Utilisation:</strong> ${site.utilisationBandPercent.toFixed(1)}%</p>
                <p style="margin: 4px 0;"><strong>ONAN Rating:</strong> ${site.onanRatingKva} kVA</p>
                <p style="margin: 4px 0;"><strong>Status:</strong> 
                  <span style="color: ${site.isValidCandidateSite ? 'green' : 'red'};">
                    ${site.isValidCandidateSite ? 'Valid Candidate' : 'Invalid Candidate'}
                  </span>
                </p>
              </div>
            `
          });
          
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
          
          markers.push(marker);
        }
      });
      
      // Fit bounds to show all markers
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

window.searchLocation = function() {
  console.log('Search location clicked');
  // TODO: Implement location search
};

window.geocodeAddress = function() {
  console.log('Geocode address clicked');
  // TODO: Implement geocoding
};

// Site Map page
function loadSiteMap(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Site Map</h2>
    </div>
    <div id="map" style="width: 100%; height: 600px; border-radius: 8px; background: #f0f0f0; position: relative;">
      <div class="map-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Loading map...</div>
    </div>
  `;
  
  // Initialize map for site map view
  setTimeout(() => {
    if (siteMapLoaded && mapInitialized) {
      // Page was loaded before, need to recreate map
      console.log('Site Map page reloaded, recreating map...');
      map = null; // Force reset
      createMap();
    } else {
      // First time loading or Google Maps not yet loaded
      console.log('First time loading Site Map page');
      siteMapLoaded = true;
      if (mapInitialized && window.google && window.google.maps) {
        // Google Maps already loaded from Power Analysis
        map = null;
        createMap();
      } else {
        // Need to load Google Maps
        initGoogleMaps();
      }
    }
  }, 300);
}

// Site Compare page
function loadSiteCompare(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Site Compare</h2>
    </div>
    <div class="site-list-container">
      <p>Select sites to compare from the Site List page.</p>
    </div>
  `;
}

// Selection Criteria page
function loadCriteria(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Selection Criteria</h2>
    </div>
    <div class="site-list-container">
      <div style="max-width: 600px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Maximum Utilisation (%): 
            <span id="max-util-value">${selectionCriteria.maxUtilisation}</span>
          </label>
          <input type="range" id="max-util" min="0" max="100" value="${selectionCriteria.maxUtilisation}" 
                 oninput="updateCriteria('maxUtilisation', this.value)"
                 style="width: 100%;">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Minimum ONAN Rating (kVA): 
            <span id="min-onan-value">${selectionCriteria.minOnan}</span>
          </label>
          <input type="range" id="min-onan" min="0" max="5000" step="100" value="${selectionCriteria.minOnan}"
                 oninput="updateCriteria('minOnan', this.value)"
                 style="width: 100%;">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Density Radius (km): 
            <span id="density-radius-value">${selectionCriteria.densityRadius}</span>
          </label>
          <input type="range" id="density-radius" min="1" max="20" value="${selectionCriteria.densityRadius}"
                 oninput="updateCriteria('densityRadius', this.value)"
                 style="width: 100%;">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">
            Minimum Supplies in Radius: 
            <span id="min-supplies-value">${selectionCriteria.minSupplies}</span>
          </label>
          <input type="range" id="min-supplies" min="0" max="20" value="${selectionCriteria.minSupplies}"
                 oninput="updateCriteria('minSupplies', this.value)"
                 style="width: 100%;">
        </div>
        <button onclick="saveCriteria()" style="padding: 12px 24px; background: #5369f8; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Save Criteria
        </button>
      </div>
    </div>
  `;
}

window.updateCriteria = function(key, value) {
  selectionCriteria[key] = parseFloat(value);
  document.getElementById(`${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-value`).textContent = value;
};

window.saveCriteria = function() {
  localStorage.setItem('siteSelectionCriteria', JSON.stringify(selectionCriteria));
  alert('Selection criteria saved!');
  // Reload current page to apply new criteria
  loadPage(currentPage);
};

// Reports page
async function loadReports(container) {
  container.innerHTML = `
    <div class="page-header">
      <h2>Reports</h2>
    </div>
    <div class="chart-container">
      <div class="chart-title">Regional Distribution</div>
      <div id="report-regions" class="chart"></div>
    </div>
    <div class="chart-container">
      <div class="chart-title">Utilisation Analysis</div>
      <div id="report-utilisation" class="chart"></div>
    </div>
  `;
  
  try {
    const { endpoint, params } = buildApiUrl('/api/power-supplies/stats');
    const result = await apiGet(endpoint, params);
    
    if (result.success) {
      renderRegionsChart(result.data.regions);
      // Add utilisation analysis
      // TODO: Implement utilisation chart
    }
  } catch (error) {
    container.innerHTML += `<div class="error-message">Error loading reports: ${error.message}</div>`;
  }
}

