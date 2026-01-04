/**
 * ==================== UK/EU Edge Data Centre Selection Matrix ====================
 * Professional site selection framework for edge data centre investments
 * Supports configurable criteria, weighted scoring, and multi-site comparison
 */

// ==================== Data Structure & Configuration ====================

const DC_MATRIX_CONFIG = {
  criteria: [
    {
      id: 'power',
      name: 'Power and Energy Infrastructure',
      icon: '⚡',
      weight: 25,
      color: '#ef4444',
      description: 'Primary constraint in UK and Europe due to grid congestion and decarbonisation policy',
      subCriteria: [
        { id: 'grid_connection', name: 'Grid connection availability and lead time', description: 'Time and complexity to secure grid connection' },
        { id: 'substation_proximity', name: 'Proximity to primary or grid substation', description: 'Distance to nearest suitable substation' },
        { id: 'import_capacity', name: 'Available import capacity and reinforcement risk', description: 'Existing capacity and upgrade requirements' },
        { id: 'reliability', name: 'Electricity reliability and outage history', description: 'Historical grid reliability metrics' },
        { id: 'renewable_access', name: 'Access to renewable energy or green tariffs', description: 'Availability of green power options' },
        { id: 'backup_generation', name: 'Ability to support backup generation and energy storage', description: 'Space and permissions for backup systems' }
      ]
    },
    {
      id: 'network',
      name: 'Network and Latency',
      icon: '🌐',
      weight: 20,
      color: '#3b82f6',
      description: 'Focused on edge latency and European carrier diversity',
      subCriteria: [
        { id: 'fibre_density', name: 'Fibre density and route diversity', description: 'Number and diversity of fibre routes' },
        { id: 'carrier_count', name: 'Number of available carriers', description: 'Carrier ecosystem and competition' },
        { id: 'latency', name: 'Latency to target population or enterprise clusters', description: 'Round-trip time to key locations' },
        { id: 'mec_proximity', name: 'Proximity to mobile core or MEC nodes', description: 'Distance to mobile network infrastructure' },
        { id: 'connectivity', name: 'Regional and international connectivity resilience', description: 'International connectivity options' }
      ]
    },
    {
      id: 'property',
      name: 'Property and Site Characteristics',
      icon: '🏢',
      weight: 15,
      color: '#10b981',
      description: 'Evaluates the physical asset independently from infrastructure constraints',
      subCriteria: [
        { id: 'availability', name: 'Land or building availability', description: 'Site availability and acquisition timeline' },
        { id: 'size_shape', name: 'Site size and shape suitability', description: 'Adequate size and usable layout' },
        { id: 'planning_class', name: 'Planning use class compatibility', description: 'Current or achievable use class' },
        { id: 'structural', name: 'Structural loading and floor to ceiling height', description: 'Building suitability for DC equipment' },
        { id: 'access', name: 'Setback, access and construction logistics', description: 'Construction and operational access' },
        { id: 'security', name: 'Security and boundary conditions', description: 'Physical security characteristics' }
      ]
    },
    {
      id: 'planning',
      name: 'Planning Compliance and Regulatory',
      icon: '📋',
      weight: 15,
      color: '#f59e0b',
      description: 'Reflects UK local planning and EU regulatory complexity',
      subCriteria: [
        { id: 'permission_likelihood', name: 'Planning permission likelihood', description: 'Probability of securing planning consent' },
        { id: 'authority_support', name: 'Local authority support and policy alignment', description: 'Council attitude towards data centres' },
        { id: 'environmental', name: 'Environmental and noise compliance', description: 'Environmental impact considerations' },
        { id: 'data_sovereignty', name: 'Data protection and sovereignty constraints', description: 'GDPR and data residency compliance' },
        { id: 'permitting_timeline', name: 'Permitting timeline and approval risk', description: 'Expected approval duration and risk' }
      ]
    },
    {
      id: 'cost',
      name: 'Cost and Commercial Viability',
      icon: '💰',
      weight: 15,
      color: '#8b5cf6',
      description: 'Focuses on long-term financial sustainability',
      subCriteria: [
        { id: 'acquisition_cost', name: 'Land or building acquisition cost', description: 'Purchase or lease costs' },
        { id: 'connection_cost', name: 'Power connection and reinforcement cost', description: 'Grid connection capital costs' },
        { id: 'electricity_price', name: 'Electricity price structure and volatility', description: 'Long-term energy cost outlook' },
        { id: 'network_cost', name: 'Network access cost', description: 'Connectivity infrastructure costs' },
        { id: 'tax_environment', name: 'Local tax environment and incentives', description: 'Tax rates and available incentives' },
        { id: 'tco', name: 'Estimated total cost of ownership', description: 'Lifetime cost projection' }
      ]
    },
    {
      id: 'sustainability',
      name: 'Sustainability and ESG Alignment',
      icon: '🌱',
      weight: 10,
      color: '#059669',
      description: 'Mandatory dimension in European data centre investment',
      subCriteria: [
        { id: 'carbon_intensity', name: 'Grid carbon intensity', description: 'Carbon content of local electricity grid' },
        { id: 'heat_reuse', name: 'Heat reuse potential', description: 'Opportunities for waste heat utilization' },
        { id: 'water_efficiency', name: 'Water usage and cooling efficiency', description: 'Water availability and cooling options' },
        { id: 'local_targets', name: 'Alignment with local sustainability targets', description: 'Fit with local environmental policies' },
        { id: 'esg_reporting', name: 'ESG reporting and certification readiness', description: 'Ability to meet ESG requirements' }
      ]
    }
  ],
  
  scoringScale: {
    min: 1,
    max: 5,
    labels: {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    },
    colors: {
      1: '#ef4444',
      2: '#f59e0b',
      3: '#eab308',
      4: '#84cc16',
      5: '#10b981'
    }
  }
};

// ==================== Global State ====================

let dcMatrixSites = [];
let dcMatrixWeights = {};
let selectedSiteForComparison = null;

// Initialize weights from config
DC_MATRIX_CONFIG.criteria.forEach(c => {
  dcMatrixWeights[c.id] = c.weight;
});

// ==================== Page Rendering ====================

function renderDCMatrixPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">🏢 UK/EU Edge Data Centre Selection Matrix</h1>
        <p class="page-description">Evaluate and rank potential data centre locations using weighted criteria framework</p>
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary" onclick="dcExportMatrix()">
          📊 Export Report
        </button>
      </div>
    </div>
    
    <!-- Location/Area Filter -->
    <div class="content-card" style="margin-bottom: 20px;">
      <div class="content-card-header">
        <h3 class="content-card-title">📍 Location & Area Selection</h3>
        <span style="font-size: 14px; color: #6b7280;">
          Select target region for site evaluation
        </span>
      </div>
      <div class="content-card-body">
        <div class="location-filter-container">
          <div class="filter-grid">
            <div class="form-group">
              <label class="form-label" for="dc-country-filter">🌍 Country</label>
              <select class="form-select" id="dc-country-filter" onchange="dcUpdateLocationFilter()">
                <option value="">All Countries</option>
                <option value="UK">United Kingdom</option>
                <option value="Ireland">Ireland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Netherlands">Netherlands</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="dc-region-filter">📌 Region / Area</label>
              <select class="form-select" id="dc-region-filter" onchange="dcUpdateLocationFilter()">
                <option value="">All Regions</option>
                <option value="London">London</option>
                <option value="Manchester">Manchester</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Birmingham">Birmingham</option>
                <option value="Edinburgh">Edinburgh</option>
                <option value="Dublin">Dublin</option>
                <option value="Paris">Paris</option>
                <option value="Frankfurt">Frankfurt</option>
                <option value="Amsterdam">Amsterdam</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="dc-min-score-filter">⭐ Min Score Threshold</label>
              <select class="form-select" id="dc-min-score-filter" onchange="dcUpdateLocationFilter()">
                <option value="0">All Scores</option>
                <option value="2">≥ 2.0 (Acceptable)</option>
                <option value="3">≥ 3.0 (Good)</option>
                <option value="4">≥ 4.0 (Excellent)</option>
              </select>
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
              <button class="btn btn-primary" onclick="dcApplyLocationFilter()" style="width: 100%;">
                🔍 Find Sites
              </button>
            </div>
          </div>
          <div id="location-filter-status" class="filter-status" style="display: none;">
            <span id="filter-status-text"></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Criteria Weights Configuration -->
    <div class="content-card" style="margin-bottom: 20px;">
      <div class="content-card-header" style="cursor: pointer;" onclick="dcToggleWeightsPanel()">
        <h3 class="content-card-title">
          <span id="weights-toggle-icon">▼</span> ⚙️ Criteria Weights Configuration
        </h3>
        <span style="font-size: 14px; color: #6b7280;">Total: <strong id="total-weight">100</strong>%</span>
      </div>
      <div class="content-card-body" id="weights-panel">
        <div class="criteria-controls-bar">
          <div class="criteria-info">
            <span class="criteria-count">6 Main Criteria</span>
            <span class="separator">•</span>
            <span class="sub-criteria-total">33 Sub-Criteria Total</span>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="dcToggleAllSubCriteria()" id="toggle-all-btn">
            📋 Expand All Details
          </button>
        </div>
        <div id="weights-grid" class="weights-grid"></div>
        <div class="btn-group mt-4">
          <button class="btn btn-secondary" onclick="dcResetWeights()">🔄 Reset to Recommended</button>
        </div>
      </div>
    </div>
    
    <!-- Site Recommendations -->
    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">🎯 Site Recommendations</h3>
        <span style="font-size: 14px; color: #6b7280;">
          <strong id="recommendations-count">0</strong> sites match criteria
        </span>
      </div>
      <div class="content-card-body">
        <div id="recommendations-container">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>No sites evaluated yet</h3>
            <p>Select a location above and apply criteria weights to discover recommended sites</p>
            <div class="empty-state-hint">
              💡 <strong>Tip:</strong> Sites are automatically scored based on your criteria configuration
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Render weights configuration
  dcRenderWeights();
  
  // Load and render recommendations
  dcLoadSiteRecommendations();
}

// ==================== Weights Management ====================

function dcRenderWeights() {
  const grid = document.getElementById('weights-grid');
  if (!grid) return;
  
  grid.innerHTML = DC_MATRIX_CONFIG.criteria.map(criterion => `
    <div class="weight-item">
      <!-- Main Criterion Header -->
      <div class="weight-header">
        <span class="weight-icon" style="color: ${criterion.color}">${criterion.icon}</span>
        <div class="weight-info">
          <strong>${criterion.name}</strong>
          <small>${criterion.description}</small>
          <div class="sub-criteria-count">
            ${criterion.subCriteria.length} sub-criteria
            <button class="toggle-sub-criteria-btn" onclick="dcToggleSubCriteria('${criterion.id}')" type="button">
              <span id="toggle-icon-${criterion.id}">▼</span> Show Details
            </button>
          </div>
        </div>
      </div>
      
      <!-- Weight Control -->
      <div class="weight-control">
        <input type="range" 
               class="form-range" 
               id="weight-${criterion.id}"
               value="${dcMatrixWeights[criterion.id]}"
               min="0" max="50" step="5"
               oninput="dcUpdateWeight('${criterion.id}', this.value)">
        <span class="weight-value" id="weight-value-${criterion.id}">${dcMatrixWeights[criterion.id]}%</span>
      </div>
      
      <!-- Sub-Criteria List (Collapsible) -->
      <div class="sub-criteria-list" id="sub-criteria-${criterion.id}" style="display: none;">
        <div class="sub-criteria-header">
          <h4>Detailed Sub-Criteria</h4>
          <span class="sub-criteria-badge">${criterion.subCriteria.length} items</span>
        </div>
        <div class="sub-criteria-grid">
          ${criterion.subCriteria.map((sub, index) => `
            <div class="sub-criterion-item">
              <div class="sub-criterion-number">${index + 1}</div>
              <div class="sub-criterion-content">
                <div class="sub-criterion-name">${sub.name}</div>
                <div class="sub-criterion-desc">${sub.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="sub-criteria-footer">
          <small>💡 Each sub-criterion is scored 1-5 during site evaluation</small>
        </div>
      </div>
    </div>
  `).join('');
  
  dcUpdateTotalWeight();
}

// Toggle sub-criteria visibility
window.dcToggleSubCriteria = function(criterionId) {
  const list = document.getElementById(`sub-criteria-${criterionId}`);
  const icon = document.getElementById(`toggle-icon-${criterionId}`);
  const btn = icon.closest('button');
  
  if (list && icon && btn) {
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? 'block' : 'none';
    icon.textContent = isHidden ? '▲' : '▼';
    btn.childNodes[1].textContent = isHidden ? ' Hide Details' : ' Show Details';
  }
};

// Toggle all sub-criteria
window.dcToggleAllSubCriteria = function() {
  const toggleBtn = document.getElementById('toggle-all-btn');
  const allLists = DC_MATRIX_CONFIG.criteria.map(c => document.getElementById(`sub-criteria-${c.id}`));
  const allIcons = DC_MATRIX_CONFIG.criteria.map(c => document.getElementById(`toggle-icon-${c.id}`));
  
  // Check if any are visible
  const anyVisible = allLists.some(list => list && list.style.display !== 'none');
  
  // Toggle all
  allLists.forEach((list, index) => {
    if (list) {
      list.style.display = anyVisible ? 'none' : 'block';
      const icon = allIcons[index];
      const btn = icon ? icon.closest('button') : null;
      if (icon) icon.textContent = anyVisible ? '▼' : '▲';
      if (btn) btn.childNodes[1].textContent = anyVisible ? ' Show Details' : ' Hide Details';
    }
  });
  
  // Update toggle button text
  if (toggleBtn) {
    toggleBtn.innerHTML = anyVisible ? '📋 Expand All Details' : '📋 Collapse All Details';
  }
};

window.dcUpdateWeight = function(criterionId, value) {
  dcMatrixWeights[criterionId] = parseInt(value);
  document.getElementById(`weight-value-${criterionId}`).textContent = value + '%';
  dcUpdateTotalWeight();
  dcRenderSites(); // Recalculate all scores
};

function dcUpdateTotalWeight() {
  const total = Object.values(dcMatrixWeights).reduce((sum, w) => sum + w, 0);
  const el = document.getElementById('total-weight');
  if (el) {
    el.textContent = total;
    el.style.color = total === 100 ? '#10b981' : '#ef4444';
    el.style.fontWeight = 'bold';
  }
}

window.dcResetWeights = function() {
  DC_MATRIX_CONFIG.criteria.forEach(c => {
    dcMatrixWeights[c.id] = c.weight;
    const input = document.getElementById(`weight-${c.id}`);
    if (input) input.value = c.weight;
  });
  dcRenderWeights();
  dcRenderSites();
};

window.dcToggleWeightsPanel = function() {
  const panel = document.getElementById('weights-panel');
  const icon = document.getElementById('weights-toggle-icon');
  if (panel && icon) {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
    icon.textContent = isHidden ? '▼' : '▶';
  }
};

// ==================== Site Management ====================

window.dcAddNewSite = function() {
  const siteName = prompt('Enter site name:');
  if (!siteName) return;
  
  const newSite = {
    id: 'site_' + Date.now(),
    name: siteName,
    dateAdded: new Date().toISOString(),
    scores: {}
  };
  
  // Initialize all scores to 3 (Average)
  DC_MATRIX_CONFIG.criteria.forEach(criterion => {
    criterion.subCriteria.forEach(sub => {
      newSite.scores[sub.id] = 3;
    });
  });
  
  dcMatrixSites.push(newSite);
  dcSaveSites();
  dcRenderSites();
};

window.dcDeleteSite = function(siteId) {
  if (!confirm('Are you sure you want to delete this site?')) return;
  dcMatrixSites = dcMatrixSites.filter(s => s.id !== siteId);
  dcSaveSites();
  dcRenderSites();
};

window.dcEditSite = function(siteId) {
  const site = dcMatrixSites.find(s => s.id === siteId);
  if (!site) return;
  
  // Create modal for detailed scoring
  dcShowSiteScoringModal(site);
};

function dcShowSiteScoringModal(site) {
  const modal = document.createElement('div');
  modal.className = 'dc-modal';
  modal.innerHTML = `
    <div class="dc-modal-content">
      <div class="dc-modal-header">
        <h2>📊 Score Site: ${site.name}</h2>
        <button class="dc-modal-close" onclick="this.closest('.dc-modal').remove()">×</button>
      </div>
      <div class="dc-modal-body" id="scoring-modal-body">
        ${DC_MATRIX_CONFIG.criteria.map(criterion => `
          <div class="scoring-section">
            <div class="scoring-section-header">
              <span style="font-size: 24px;">${criterion.icon}</span>
              <div>
                <h3>${criterion.name}</h3>
                <p>${criterion.description}</p>
              </div>
              <div class="scoring-section-score">
                <strong>${dcCalculateCriterionScore(site, criterion.id).toFixed(1)}</strong>
                <small>/ 5.0</small>
              </div>
            </div>
            <div class="scoring-sub-criteria">
              ${criterion.subCriteria.map(sub => `
                <div class="scoring-item">
                  <div class="scoring-item-info">
                    <strong>${sub.name}</strong>
                    <small>${sub.description}</small>
                  </div>
                  <div class="scoring-item-control">
                    ${[1, 2, 3, 4, 5].map(score => `
                      <button class="score-btn ${site.scores[sub.id] === score ? 'active' : ''}"
                              style="background-color: ${site.scores[sub.id] === score ? DC_MATRIX_CONFIG.scoringScale.colors[score] : '#f3f4f6'}"
                              onclick="dcSetSubScore('${site.id}', '${sub.id}', ${score})">
                        ${score}
                      </button>
                    `).join('')}
                    <span class="score-label">${DC_MATRIX_CONFIG.scoringScale.labels[site.scores[sub.id] || 3]}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="dc-modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.dc-modal').remove()">Close</button>
        <button class="btn btn-primary" onclick="dcSaveSiteScores(); this.closest('.dc-modal').remove();">Save Scores</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

window.dcSetSubScore = function(siteId, subCriterionId, score) {
  const site = dcMatrixSites.find(s => s.id === siteId);
  if (!site) return;
  
  site.scores[subCriterionId] = score;
  
  // Update UI
  const modalBody = document.getElementById('scoring-modal-body');
  if (modalBody) {
    // Re-render the modal to show updated scores
    const siteForModal = dcMatrixSites.find(s => s.id === siteId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DC_MATRIX_CONFIG.criteria.map(criterion => `
      <div class="scoring-section">
        <div class="scoring-section-header">
          <span style="font-size: 24px;">${criterion.icon}</span>
          <div>
            <h3>${criterion.name}</h3>
            <p>${criterion.description}</p>
          </div>
          <div class="scoring-section-score">
            <strong>${dcCalculateCriterionScore(siteForModal, criterion.id).toFixed(1)}</strong>
            <small>/ 5.0</small>
          </div>
        </div>
        <div class="scoring-sub-criteria">
          ${criterion.subCriteria.map(sub => `
            <div class="scoring-item">
              <div class="scoring-item-info">
                <strong>${sub.name}</strong>
                <small>${sub.description}</small>
              </div>
              <div class="scoring-item-control">
                ${[1, 2, 3, 4, 5].map(s => `
                  <button class="score-btn ${siteForModal.scores[sub.id] === s ? 'active' : ''}"
                          style="background-color: ${siteForModal.scores[sub.id] === s ? DC_MATRIX_CONFIG.scoringScale.colors[s] : '#f3f4f6'}"
                          onclick="dcSetSubScore('${siteId}', '${sub.id}', ${s})">
                    ${s}
                  </button>
                `).join('')}
                <span class="score-label">${DC_MATRIX_CONFIG.scoringScale.labels[siteForModal.scores[sub.id] || 3]}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    modalBody.innerHTML = tempDiv.innerHTML;
  }
};

window.dcSaveSiteScores = function() {
  dcSaveSites();
  dcRenderSites();
};

// ==================== Score Calculation ====================

function dcCalculateCriterionScore(site, criterionId) {
  const criterion = DC_MATRIX_CONFIG.criteria.find(c => c.id === criterionId);
  if (!criterion) return 0;
  
  const scores = criterion.subCriteria.map(sub => site.scores[sub.id] || 3);
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return avg;
}

function dcCalculateTotalScore(site) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  DC_MATRIX_CONFIG.criteria.forEach(criterion => {
    const criterionScore = dcCalculateCriterionScore(site, criterion.id);
    const weight = dcMatrixWeights[criterion.id] || criterion.weight;
    weightedSum += criterionScore * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? (weightedSum / totalWeight) : 0;
}

function dcGetScoreColor(score) {
  if (score >= 4.5) return DC_MATRIX_CONFIG.scoringScale.colors[5];
  if (score >= 3.5) return DC_MATRIX_CONFIG.scoringScale.colors[4];
  if (score >= 2.5) return DC_MATRIX_CONFIG.scoringScale.colors[3];
  if (score >= 1.5) return DC_MATRIX_CONFIG.scoringScale.colors[2];
  return DC_MATRIX_CONFIG.scoringScale.colors[1];
}

// ==================== Sites Rendering ====================

function dcRenderSites() {
  const container = document.getElementById('sites-container');
  const countEl = document.getElementById('sites-count');
  
  if (!container) return;
  
  if (countEl) countEl.textContent = dcMatrixSites.length;
  
  if (dcMatrixSites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <h3>No sites added yet</h3>
        <p>Click "Add Site" to begin your site selection analysis</p>
        <button class="btn btn-primary" onclick="dcAddNewSite()">➕ Add First Site</button>
      </div>
    `;
    return;
  }
  
  // Sort sites by total score
  const sortedSites = [...dcMatrixSites].sort((a, b) => dcCalculateTotalScore(b) - dcCalculateTotalScore(a));
  
  // Separate sites by score: Low (1-3), Medium (3-4), High (4-5)
  const lowScoreSites = sortedSites.filter(site => dcCalculateTotalScore(site) <= 3);
  const mediumScoreSites = sortedSites.filter(site => {
    const score = dcCalculateTotalScore(site);
    return score > 3 && score <= 4;
  });
  const highScoreSites = sortedSites.filter(site => dcCalculateTotalScore(site) > 4);
  
  container.innerHTML = `
    <!-- High Score Sites -->
    ${highScoreSites.length > 0 ? `
      <div class="score-category-section">
        <div class="score-category-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
          <h3>🌟 High Potential Sites (Score > 4.0)</h3>
          <span class="badge">${highScoreSites.length} sites</span>
        </div>
        <div class="sites-grid">
          ${highScoreSites.map((site, index) => dcRenderSiteCard(site, index + 1, false)).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Medium Score Sites -->
    ${mediumScoreSites.length > 0 ? `
      <div class="score-category-section">
        <div class="score-category-header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
          <h3>⚠️ Medium Potential Sites (Score 3.0 - 4.0)</h3>
          <span class="badge">${mediumScoreSites.length} sites</span>
        </div>
        <div class="sites-grid">
          ${mediumScoreSites.map((site, index) => dcRenderSiteCard(site, highScoreSites.length + index + 1, false)).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- Low Score Sites - Detailed Analysis -->
    ${lowScoreSites.length > 0 ? `
      <div class="score-category-section">
        <div class="score-category-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <h3>⛔ Low Potential Sites (Score ≤ 3.0) - Detailed Analysis</h3>
          <span class="badge">${lowScoreSites.length} sites</span>
        </div>
        <div class="low-score-sites-list">
          ${lowScoreSites.map((site, index) => dcRenderLowScoreSiteDetailed(site, sortedSites.length - lowScoreSites.length + index + 1)).join('')}
        </div>
      </div>
    ` : ''}
    
    ${lowScoreSites.length === 0 && mediumScoreSites.length === 0 && highScoreSites.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <h3>No sites evaluated yet</h3>
        <p>Add sites and complete scoring to see analysis</p>
      </div>
    ` : ''}
  `;
}

// Render regular site card (for high and medium scores)
function dcRenderSiteCard(site, rank, isCompact = false) {
  const totalScore = dcCalculateTotalScore(site);
  const scoreColor = dcGetScoreColor(totalScore);
  
  return `
    <div class="site-card">
      <div class="site-card-header">
        <div class="site-rank" style="background-color: ${scoreColor}">
          #${rank}
        </div>
        <div class="site-info">
          <h3>${site.name}</h3>
          <small>Added: ${new Date(site.dateAdded).toLocaleDateString()}</small>
        </div>
        <div class="site-actions">
          <button class="btn-icon" onclick="dcEditSite('${site.id}')" title="Edit scores">
            ✏️
          </button>
          <button class="btn-icon" onclick="dcDeleteSite('${site.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="site-total-score" style="border-color: ${scoreColor}">
        <div class="score-value" style="color: ${scoreColor}">
          ${totalScore.toFixed(2)}
        </div>
        <div class="score-label">Overall Score</div>
      </div>
      
      <div class="site-criteria-scores">
        ${DC_MATRIX_CONFIG.criteria.map(criterion => {
          const criterionScore = dcCalculateCriterionScore(site, criterion.id);
          return `
            <div class="criterion-score-item">
              <span class="criterion-icon" style="color: ${criterion.color}">${criterion.icon}</span>
              <div class="criterion-details">
                <div class="criterion-name">${criterion.name}</div>
                <div class="criterion-bar">
                  <div class="criterion-bar-fill" style="width: ${(criterionScore / 5) * 100}%; background-color: ${criterion.color}"></div>
                </div>
              </div>
              <div class="criterion-value">${criterionScore.toFixed(1)}</div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="site-card-footer">
        <button class="btn btn-secondary btn-sm" onclick="dcViewRadarChart('${site.id}')">
          📊 View Radar Chart
        </button>
        <button class="btn btn-primary btn-sm" onclick="dcCompareWithOthers('${site.id}')">
          ⚖️ Compare
        </button>
      </div>
    </div>
  `;
}

// Render detailed low score site card with problem analysis
function dcRenderLowScoreSiteDetailed(site, rank) {
  const totalScore = dcCalculateTotalScore(site);
  const scoreColor = dcGetScoreColor(totalScore);
  
  // Identify problem criteria (score < 3)
  const problemCriteria = DC_MATRIX_CONFIG.criteria.map(criterion => {
    const score = dcCalculateCriterionScore(site, criterion.id);
    const weight = criterion.weight;
    
    // Get problem sub-criteria (score < 3)
    const problemSubCriteria = criterion.subCriteria.filter(sub => {
      const subScore = site.scores?.[criterion.id]?.[sub.id] || 0;
      return subScore < 3;
    });
    
    return {
      criterion,
      score,
      weight,
      problemSubCriteria,
      isProblem: score < 3
    };
  }).filter(item => item.isProblem);
  
  // Calculate impact percentage
  const totalPossibleScore = DC_MATRIX_CONFIG.criteria.reduce((sum, c) => sum + c.weight * 5, 0) / 100;
  const lostScore = totalPossibleScore - totalScore;
  const impactPercentage = (lostScore / totalPossibleScore * 100).toFixed(0);
  
  return `
    <div class="low-score-site-card">
      <div class="low-score-site-header">
        <div class="low-score-rank" style="background-color: ${scoreColor}">
          #${rank}
        </div>
        <div class="low-score-site-info">
          <h3>
            ${site.name}
            <span class="warning-badge">⚠️ Needs Attention</span>
          </h3>
          <div class="low-score-meta">
            <span>📅 Added: ${new Date(site.dateAdded).toLocaleDateString()}</span>
            <span>•</span>
            <span>📊 Overall Score: <strong style="color: ${scoreColor}">${totalScore.toFixed(2)}/5.00</strong></span>
            <span>•</span>
            <span>📉 Performance Gap: <strong style="color: #ef4444">${impactPercentage}%</strong> below optimal</span>
          </div>
        </div>
        <div class="low-score-actions">
          <button class="btn-icon" onclick="dcEditSite('${site.id}')" title="Edit & Improve Scores">
            ✏️
          </button>
          <button class="btn-icon" onclick="dcDeleteSite('${site.id}')" title="Delete Site">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="low-score-summary">
        <div class="summary-card summary-critical">
          <div class="summary-icon">⛔</div>
          <div class="summary-content">
            <div class="summary-title">Critical Issues</div>
            <div class="summary-value">${problemCriteria.length} / ${DC_MATRIX_CONFIG.criteria.length}</div>
            <div class="summary-label">criteria below standard</div>
          </div>
        </div>
        
        <div class="summary-card summary-subcriteria">
          <div class="summary-icon">🔍</div>
          <div class="summary-content">
            <div class="summary-title">Problem Areas</div>
            <div class="summary-value">${problemCriteria.reduce((sum, p) => sum + p.problemSubCriteria.length, 0)}</div>
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
      
      <!-- All Criteria Overview -->
      <div class="criteria-overview">
        <h4>📊 Full Criteria Breakdown</h4>
        <div class="criteria-breakdown-grid">
          ${DC_MATRIX_CONFIG.criteria.map(criterion => {
            const score = dcCalculateCriterionScore(site, criterion.id);
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
      
      <!-- Problem Details -->
      ${problemCriteria.length > 0 ? `
        <div class="problem-details">
          <h4>🔴 Identified Problems & Recommendations</h4>
          ${problemCriteria.map((item, idx) => `
            <div class="problem-criterion-detail">
              <div class="problem-criterion-header">
                <span class="problem-number">${idx + 1}</span>
                <span class="criterion-icon" style="color: ${item.criterion.color}">${item.criterion.icon}</span>
                <h5>${item.criterion.name}</h5>
                <span class="problem-score">Score: <strong>${item.score.toFixed(2)}/5.00</strong></span>
              </div>
              
              <div class="problem-subcriteria-list">
                ${item.problemSubCriteria.map(sub => {
                  const subScore = site.scores?.[item.criterion.id]?.[sub.id] || 0;
                  const recommendation = dcGetRecommendation(item.criterion.id, sub.id, subScore);
                  
                  return `
                    <div class="problem-subcriterion-item">
                      <div class="problem-sub-header">
                        <span class="sub-score-badge score-${subScore}">${subScore}/5</span>
                        <span class="sub-name">${sub.name}</span>
                      </div>
                      <div class="problem-description">${sub.description}</div>
                      <div class="recommendation">
                        <strong>💡 Recommendation:</strong> ${recommendation}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="low-score-site-footer">
        <button class="btn btn-secondary btn-sm" onclick="dcViewRadarChart('${site.id}')">
          📊 View Radar Chart
        </button>
        <button class="btn btn-primary btn-sm" onclick="dcEditSite('${site.id}')">
          ✏️ Improve Scoring
        </button>
        <button class="btn btn-secondary btn-sm" onclick="dcCompareWithOthers('${site.id}')">
          ⚖️ Compare with Others
        </button>
      </div>
    </div>
  `;
}

// Get recommendation based on criterion, sub-criterion, and score
function dcGetRecommendation(criterionId, subCriterionId, score) {
  const recommendations = {
    power: {
      gridAvailability: {
        low: 'Engage with DNO early. Consider alternative connection points or private wire networks.',
        medium: 'Monitor DNO queue position. Plan for potential delays in development timeline.',
        high: 'Excellent grid availability. Proceed with connection application.'
      },
      proximitySubstation: {
        low: 'Long cable runs required. Budget for significant connection costs and voltage drop mitigation.',
        medium: 'Moderate distance to substation. Factor in trenching and wayleave costs.',
        high: 'Optimal proximity to substation reduces connection costs and improves reliability.'
      },
      importCapacity: {
        low: 'Grid reinforcement likely required. Engage DNO for detailed capacity study and cost estimate.',
        medium: 'Monitor capacity availability. Consider phased deployment to match grid upgrades.',
        high: 'Sufficient import capacity available. Minimal reinforcement risk.'
      },
      electricityReliability: {
        low: 'High outage risk. Budget for enhanced backup systems (UPS, generators, batteries).',
        medium: 'Acceptable reliability. Standard backup generation recommended.',
        high: 'Excellent grid reliability. Minimize backup infrastructure investment.'
      },
      renewableAccess: {
        low: 'Limited green energy options. May impact ESG ratings and PPA opportunities.',
        medium: 'Some renewable options available. Explore PPAs with nearby wind/solar farms.',
        high: 'Strong renewable energy access. Leverage for ESG credentials and cost savings.'
      },
      backupSupport: {
        low: 'Limited space/permits for backup generation. May restrict data center design options.',
        medium: 'Adequate backup support. Verify planning constraints for generators.',
        high: 'Excellent backup support capability. Flexible design options for resilience.'
      }
    },
    network: {
      fibreDensity: {
        low: 'Limited fibre routes. Budget for new fibre builds or satellite backup.',
        medium: 'Moderate fibre availability. Verify route diversity for resilience.',
        high: 'Excellent fibre density. Multiple carriers available for redundancy.'
      },
      carrierAvailability: {
        low: 'Few carriers present. Negotiate with providers for new builds or extensions.',
        medium: 'Several carriers available. Verify pricing and SLA terms.',
        high: 'Multiple carriers competing. Strong negotiating position for pricing.'
      },
      latencyPerformance: {
        low: 'High latency to target users. Not suitable for latency-sensitive edge applications.',
        medium: 'Acceptable latency for most edge use cases. Verify with specific application requirements.',
        high: 'Excellent latency performance. Ideal for real-time edge computing applications.'
      },
      proximityMec: {
        low: 'Distant from mobile core/MEC nodes. Limited 5G edge opportunities.',
        medium: 'Moderate proximity to MEC. Suitable for some mobile edge applications.',
        high: 'Optimal location for mobile edge computing. Strong 5G partnership potential.'
      },
      connectivityResilience: {
        low: 'Poor connectivity resilience. Single points of failure in network topology.',
        medium: 'Adequate resilience. Verify redundant paths and carrier SLAs.',
        high: 'Excellent network resilience. Multiple redundant paths available.'
      }
    },
    property: {
      landAvailability: {
        low: 'Limited land/building options. May require compromise on design or location.',
        medium: 'Some options available. Verify ownership and acquisition timeline.',
        high: 'Multiple land/building options. Favorable for site selection and negotiation.'
      },
      siteSuitability: {
        low: 'Poor site geometry. May constrain building design and future expansion.',
        medium: 'Adequate site characteristics. Some design optimization required.',
        high: 'Excellent site suitability. Optimal for data center design and expansion.'
      },
      planningUseClass: {
        low: 'Use class change required. Plan for lengthy planning process and potential refusal.',
        medium: 'Minor planning modifications needed. Manageable approval risk.',
        high: 'Compatible use class. Streamlined planning approval expected.'
      },
      structuralSuitability: {
        low: 'Major structural upgrades required. High retrofit costs and technical risk.',
        medium: 'Some structural improvements needed. Factor into CapEx budget.',
        high: 'Excellent structural suitability. Minimal modification required.'
      },
      constructionLogistics: {
        low: 'Difficult access and logistics. May increase construction costs and timeline.',
        medium: 'Acceptable logistics. Some constraints but manageable.',
        high: 'Excellent access and logistics. Favorable for construction efficiency.'
      },
      securityBoundary: {
        low: 'Security concerns present. Requires significant perimeter and access control investment.',
        medium: 'Adequate security potential. Standard measures sufficient.',
        high: 'Excellent natural security characteristics. Minimal additional security investment.'
      }
    },
    planning: {
      permissionLikelihood: {
        low: 'High planning refusal risk. Consider alternative sites or extensive mitigation measures.',
        medium: 'Moderate approval probability. Engage planning authority early for guidance.',
        high: 'Strong likelihood of approval. Proceed with confidence on planning submission.'
      },
      localAuthoritySupport: {
        low: 'Local authority opposition likely. May require extensive community engagement.',
        medium: 'Neutral local authority stance. Standard consultation process expected.',
        high: 'Strong local authority support. Leverage for expedited approval.'
      },
      environmentalCompliance: {
        low: 'Significant environmental constraints. EIA required with high mitigation costs.',
        medium: 'Some environmental considerations. Standard assessments and mitigation sufficient.',
        high: 'Minimal environmental constraints. Streamlined environmental approval.'
      },
      dataProtection: {
        low: 'Data sovereignty concerns. May restrict customer segments and compliance complexity.',
        medium: 'Acceptable for most use cases. Verify specific compliance requirements.',
        high: 'Optimal data protection environment. Attractive to regulated industries.'
      },
      permittingTimeline: {
        low: 'Extended permitting timeline (>18 months). May impact project viability.',
        medium: 'Standard timeline (9-18 months). Factor into development schedule.',
        high: 'Fast-track timeline (<9 months). Favorable for rapid deployment.'
      }
    },
    cost: {
      acquisitionCost: {
        low: 'High acquisition costs. May impact project IRR and financing options.',
        medium: 'Market-rate acquisition. Standard due diligence and valuation.',
        high: 'Attractive acquisition pricing. Strong investment fundamentals.'
      },
      powerConnectionCost: {
        low: 'Expensive power connection. Major CapEx impact requiring careful financial modeling.',
        medium: 'Moderate connection costs. Manageable within typical project budgets.',
        high: 'Low power connection costs. Favorable for project economics.'
      },
      electricityPricing: {
        low: 'High electricity prices. May impact OpEx and competitiveness.',
        medium: 'Market-rate pricing. Explore PPAs for cost optimization.',
        high: 'Favorable electricity pricing. Competitive advantage in operating costs.'
      },
      networkAccessCost: {
        low: 'Expensive network access. May require customer pass-through or impact margins.',
        medium: 'Standard network costs. Factor into connectivity pricing model.',
        high: 'Low network access costs. Competitive advantage for connectivity services.'
      },
      taxIncentives: {
        low: 'Limited tax benefits. Standard corporate tax environment.',
        medium: 'Some tax incentives available. Verify eligibility and application process.',
        high: 'Strong tax incentives. Significant OpEx savings opportunity.'
      },
      totalCostOwnership: {
        low: 'High TCO. May require premium pricing or impact investment returns.',
        medium: 'Market-average TCO. Standard business case viability.',
        high: 'Low TCO. Strong competitive position and investment returns.'
      }
    },
    sustainability: {
      gridCarbonIntensity: {
        low: 'High carbon grid. Requires carbon offset purchases to meet ESG targets.',
        medium: 'Moderate carbon intensity. Consider renewable PPAs for improvement.',
        high: 'Low carbon grid. Excellent for ESG credentials and sustainability reporting.'
      },
      heatReusePotential: {
        low: 'No heat reuse opportunities. Wasted thermal energy reduces sustainability rating.',
        medium: 'Some heat reuse potential. Explore district heating or industrial partnerships.',
        high: 'Excellent heat reuse opportunities. Significant circular economy benefits.'
      },
      waterEfficiency: {
        low: 'Water-intensive cooling required. May face restrictions and higher costs.',
        medium: 'Moderate water usage. Standard cooling efficiency measures sufficient.',
        high: 'Minimal water usage (air-cooled options). Ideal for water-scarce regions.'
      },
      sustainabilityAlignment: {
        low: 'Poor alignment with local sustainability targets. May face regulatory headwinds.',
        medium: 'Adequate alignment. Monitor for evolving regulations.',
        high: 'Strong alignment with sustainability goals. Favorable for long-term operation.'
      },
      esgReadiness: {
        low: 'Difficult to achieve ESG certifications. May limit investment attractiveness.',
        medium: 'ESG certification achievable with standard measures.',
        high: 'ESG certification readily achievable. Attractive to ESG-focused investors.'
      }
    }
  };
  
  const criterionRecs = recommendations[criterionId];
  if (!criterionRecs) return 'Engage specialists for detailed assessment and improvement strategy.';
  
  const subRecs = criterionRecs[subCriterionId];
  if (!subRecs) return 'Conduct further due diligence to identify specific improvement opportunities.';
  
  if (score <= 2) return subRecs.low || 'Critical issue requiring immediate attention and mitigation strategy.';
  if (score <= 3) return subRecs.medium || 'Moderate concern requiring monitoring and potential improvement.';
  return subRecs.high || 'Strong performance. Maintain current standards.';
}

// ==================== Visualization ====================

window.dcViewRadarChart = function(siteId) {
  const site = dcMatrixSites.find(s => s.id === siteId);
  if (!site) return;
  
  const modal = document.createElement('div');
  modal.className = 'dc-modal';
  modal.innerHTML = `
    <div class="dc-modal-content" style="max-width: 900px;">
      <div class="dc-modal-header">
        <h2>📊 Radar Chart: ${site.name}</h2>
        <button class="dc-modal-close" onclick="this.closest('.dc-modal').remove()">×</button>
      </div>
      <div class="dc-modal-body">
        <canvas id="radar-chart-canvas" width="600" height="600"></canvas>
      </div>
      <div class="dc-modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.dc-modal').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Draw radar chart
  setTimeout(() => dcDrawRadarChart(site, 'radar-chart-canvas'), 100);
};

function dcDrawRadarChart(site, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 80;
  
  const criteria = DC_MATRIX_CONFIG.criteria;
  const angleStep = (Math.PI * 2) / criteria.length;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background circles
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw axes
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  criteria.forEach((criterion, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Draw labels
    const labelX = centerX + Math.cos(angle) * (radius + 40);
    const labelY = centerY + Math.sin(angle) * (radius + 40);
    ctx.fillStyle = criterion.color;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(criterion.icon, labelX, labelY - 15);
    ctx.font = '12px Arial';
    ctx.fillStyle = '#1f2937';
    const words = criterion.name.split(' ');
    words.forEach((word, i) => {
      ctx.fillText(word, labelX, labelY + i * 14);
    });
  });
  
  // Draw data polygon
  ctx.beginPath();
  criteria.forEach((criterion, index) => {
    const score = dcCalculateCriterionScore(site, criterion.id);
    const angle = angleStep * index - Math.PI / 2;
    const distance = (score / 5) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw data points
  criteria.forEach((criterion, index) => {
    const score = dcCalculateCriterionScore(site, criterion.id);
    const angle = angleStep * index - Math.PI / 2;
    const distance = (score / 5) * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = criterion.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw score value
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(score.toFixed(1), x, y - 15);
  });
  
  // Draw center title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(site.name, centerX, 30);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`Overall: ${dcCalculateTotalScore(site).toFixed(2)}/5.0`, centerX, 50);
}

// ==================== Comparison ====================

window.dcCompareWithOthers = function(siteId) {
  if (dcMatrixSites.length < 2) {
    alert('Add at least 2 sites to compare');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'dc-modal';
  modal.innerHTML = `
    <div class="dc-modal-content" style="max-width: 1200px;">
      <div class="dc-modal-header">
        <h2>⚖️ Sites Comparison</h2>
        <button class="dc-modal-close" onclick="this.closest('.dc-modal').remove()">×</button>
      </div>
      <div class="dc-modal-body">
        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Criteria / Site</th>
                ${dcMatrixSites.map(site => `
                  <th class="${site.id === siteId ? 'highlight-column' : ''}">
                    ${site.name}
                    ${site.id === siteId ? '<br><span class="badge">Selected</span>' : ''}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr class="total-row">
                <td><strong>Overall Score</strong></td>
                ${dcMatrixSites.map(site => {
                  const score = dcCalculateTotalScore(site);
                  return `
                    <td class="${site.id === siteId ? 'highlight-column' : ''}">
                      <span class="score-badge" style="background-color: ${dcGetScoreColor(score)}">
                        ${score.toFixed(2)}
                      </span>
                    </td>
                  `;
                }).join('')}
              </tr>
              ${DC_MATRIX_CONFIG.criteria.map(criterion => `
                <tr class="criterion-row">
                  <td>
                    <strong>${criterion.icon} ${criterion.name}</strong>
                    <br><small>Weight: ${dcMatrixWeights[criterion.id]}%</small>
                  </td>
                  ${dcMatrixSites.map(site => {
                    const score = dcCalculateCriterionScore(site, criterion.id);
                    return `
                      <td class="${site.id === siteId ? 'highlight-column' : ''}">
                        <div class="score-cell">
                          <span class="score-value" style="color: ${criterion.color}">${score.toFixed(1)}</span>
                          <div class="score-bar" style="width: ${(score / 5) * 100}%; background-color: ${criterion.color}"></div>
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="dc-modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.dc-modal').remove()">Close</button>
        <button class="btn btn-primary" onclick="dcExportComparison()">📊 Export Comparison</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

// ==================== Export ====================

window.dcExportMatrix = function() {
  if (dcMatrixSites.length === 0) {
    alert('No sites to export');
    return;
  }
  
  // Generate CSV
  let csv = 'Site Selection Matrix Export\n\n';
  csv += 'Criteria Weights:\n';
  DC_MATRIX_CONFIG.criteria.forEach(c => {
    csv += `${c.name},${dcMatrixWeights[c.id]}%\n`;
  });
  csv += '\n\nSites Scores:\n';
  csv += 'Site Name,Overall Score,' + DC_MATRIX_CONFIG.criteria.map(c => c.name).join(',') + '\n';
  
  dcMatrixSites.forEach(site => {
    const scores = DC_MATRIX_CONFIG.criteria.map(c => dcCalculateCriterionScore(site, c.id).toFixed(2));
    csv += `${site.name},${dcCalculateTotalScore(site).toFixed(2)},${scores.join(',')}\n`;
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dc-selection-matrix-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
};

window.dcExportComparison = function() {
  alert('Comparison export feature - CSV will be generated');
  dcExportMatrix();
};

// ==================== Storage ====================

function dcSaveSites() {
  localStorage.setItem('dc_matrix_sites', JSON.stringify(dcMatrixSites));
  localStorage.setItem('dc_matrix_weights', JSON.stringify(dcMatrixWeights));
}

function dcLoadSites() {
  try {
    const sitesData = localStorage.getItem('dc_matrix_sites');
    if (sitesData) {
      dcMatrixSites = JSON.parse(sitesData);
    }
    
    const weightsData = localStorage.getItem('dc_matrix_weights');
    if (weightsData) {
      dcMatrixWeights = JSON.parse(weightsData);
    }
  } catch (e) {
    console.error('Error loading DC matrix data:', e);
  }
}

// ==================== Location Filter Functions ====================

let dcLocationFilter = {
  country: '',
  region: '',
  minScore: 0
};

window.dcUpdateLocationFilter = function() {
  const country = document.getElementById('dc-country-filter')?.value || '';
  const region = document.getElementById('dc-region-filter')?.value || '';
  const minScore = parseFloat(document.getElementById('dc-min-score-filter')?.value || 0);
  
  dcLocationFilter = { country, region, minScore };
  
  // Update status
  const status = document.getElementById('location-filter-status');
  const statusText = document.getElementById('filter-status-text');
  if (status && statusText) {
    if (country || region || minScore > 0) {
      status.style.display = 'block';
      statusText.textContent = `🎯 Filters: ${country || 'All Countries'} ${region ? '→ ' + region : ''} ${minScore > 0 ? '→ Score ≥ ' + minScore : ''}`;
    } else {
      status.style.display = 'none';
    }
  }
};

window.dcApplyLocationFilter = function() {
  dcUpdateLocationFilter();
  dcLoadSiteRecommendations();
  
  // Show feedback
  const statusEl = document.getElementById('location-filter-status');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.style.background = '#e0f2fe';
    statusEl.style.border = '1px solid #7dd3fc';
    statusEl.style.padding = '12px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.marginTop = '16px';
  }
};

// ==================== Site Recommendations Functions ====================

function dcLoadSiteRecommendations() {
  // Get all available sites from localStorage or backend
  // For now, we'll use the existing dcMatrixSites and filter/score them
  dcRenderRecommendations();
}

function dcRenderRecommendations() {
  const container = document.getElementById('recommendations-container');
  const countEl = document.getElementById('recommendations-count');
  
  if (!container) return;
  
  // Filter sites based on location criteria
  let filteredSites = dcMatrixSites.filter(site => {
    // Apply location filters
    if (dcLocationFilter.country && site.country !== dcLocationFilter.country) {
      return false;
    }
    if (dcLocationFilter.region && site.region !== dcLocationFilter.region) {
      return false;
    }
    
    // Apply score filter
    const totalScore = dcCalculateTotalScore(site);
    if (totalScore < dcLocationFilter.minScore) {
      return false;
    }
    
    return true;
  });
  
  // Sort by score (highest first)
  filteredSites.sort((a, b) => dcCalculateTotalScore(b) - dcCalculateTotalScore(a));
  
  if (countEl) countEl.textContent = filteredSites.length;
  
  if (filteredSites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No sites match your criteria</h3>
        <p>Try adjusting your location filters or score threshold</p>
        <div class="empty-state-hint">
          💡 <strong>Tip:</strong> Lower the minimum score threshold or broaden your location selection
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="recommendations-header">
      <div class="recommendations-summary">
        <span class="summary-icon">✨</span>
        <span>Showing <strong>${filteredSites.length}</strong> recommended ${filteredSites.length === 1 ? 'site' : 'sites'} based on your criteria</span>
      </div>
      <div class="recommendations-actions">
        <button class="btn btn-sm btn-secondary" onclick="dcExportRecommendations()">
          📥 Export List
        </button>
      </div>
    </div>
    
    <div class="recommendations-list">
      ${filteredSites.map((site, index) => dcRenderRecommendationCard(site, index + 1)).join('')}
    </div>
  `;
}

function dcRenderRecommendationCard(site, rank) {
  const totalScore = dcCalculateTotalScore(site);
  const scoreColor = dcGetScoreColor(totalScore);
  const scorePercentage = ((totalScore / 5) * 100).toFixed(0);
  
  // Get top 3 strengths (highest scoring criteria)
  const criteriaScores = DC_MATRIX_CONFIG.criteria.map(criterion => ({
    name: criterion.name,
    icon: criterion.icon,
    score: dcCalculateCriterionScore(site, criterion.id),
    color: criterion.color
  })).sort((a, b) => b.score - a.score).slice(0, 3);
  
  return `
    <div class="recommendation-card">
      <div class="recommendation-rank" style="background-color: ${scoreColor}">
        <span class="rank-number">#${rank}</span>
      </div>
      
      <div class="recommendation-content">
        <div class="recommendation-header">
          <div class="recommendation-info">
            <h3 class="recommendation-name">${site.name}</h3>
            <div class="recommendation-meta">
              ${site.country ? `<span class="meta-tag">🌍 ${site.country}</span>` : ''}
              ${site.region ? `<span class="meta-tag">📍 ${site.region}</span>` : ''}
              <span class="meta-tag">📅 ${new Date(site.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div class="recommendation-score">
            <div class="score-value" style="color: ${scoreColor}">
              ${totalScore.toFixed(2)}
            </div>
            <div class="score-label">Overall Score</div>
            <div class="score-bar" style="margin-top: 8px;">
              <div class="score-bar-fill" style="width: ${scorePercentage}%; background-color: ${scoreColor}"></div>
            </div>
          </div>
        </div>
        
        <div class="recommendation-strengths">
          <div class="strengths-label">🏆 Top Strengths:</div>
          <div class="strengths-list">
            ${criteriaScores.map(c => `
              <div class="strength-item">
                <span class="strength-icon" style="color: ${c.color}">${c.icon}</span>
                <span class="strength-name">${c.name}</span>
                <span class="strength-score">${c.score.toFixed(1)}/5.0</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="recommendation-actions">
          <button class="btn btn-sm btn-secondary" onclick="dcViewSiteDetails('${site.id}')">
            📊 View Details
          </button>
          <button class="btn btn-sm btn-primary" onclick="dcAddToComparison('${site.id}')">
            ➕ Add to Compare
          </button>
        </div>
      </div>
    </div>
  `;
}

window.dcViewSiteDetails = function(siteId) {
  const site = dcMatrixSites.find(s => s.id === siteId);
  if (!site) return;
  dcEditSite(siteId);
};

window.dcAddToComparison = function(siteId) {
  // Save to comparison list for Site Compare page
  let comparisonList = [];
  try {
    const saved = localStorage.getItem('dc_comparison_list');
    if (saved) comparisonList = JSON.parse(saved);
  } catch (e) {
    console.error('Error loading comparison list:', e);
  }
  
  if (!comparisonList.includes(siteId)) {
    comparisonList.push(siteId);
    localStorage.setItem('dc_comparison_list', JSON.stringify(comparisonList));
    
    // Show feedback
    alert(`✅ Site added to comparison list!\n\nGo to "Site Compare" page to view your selection.`);
  } else {
    alert('ℹ️ This site is already in your comparison list.');
  }
};

window.dcExportRecommendations = function() {
  // Export filtered recommendations to CSV
  alert('📥 Export functionality coming soon!');
};

console.log('✅ DC Selection Matrix module loaded');

