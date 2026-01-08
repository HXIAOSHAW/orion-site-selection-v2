# 📝 Changelog - Orion Site Selection

All notable changes to this project will be documented in this file.

---

## [2.5.0] - 2026-01-04

### 🔄 Major Restructure - Separated Evaluation from Comparison

#### ✨ Added

**DC Selection Matrix Page:**
- 📍 Location/Area Filter section
  - Country dropdown (UK, Ireland, France, Germany, Netherlands)
  - Region dropdown (London, Manchester, Cambridge, Dublin, Paris, Frankfurt, Amsterdam)
  - Min Score threshold filter (≥2.0, ≥3.0, ≥4.0)
  - "Find Sites" button to apply filters
  - Real-time filter status display
  
- 🎯 Site Recommendations section (replaces Sites Comparison)
  - Auto-ranked site list based on weighted criteria
  - Top 3 strengths highlighted per site
  - Color-coded rank badges
  - Site metadata (country, region, date added)
  - "View Details" button (opens scoring modal)
  - "Add to Compare" button (adds to comparison list)
  - Empty state with helpful hints
  
**Site Compare Page:**
- ⚖️ Full comparison table implementation
  - Side-by-side site comparison
  - Overall scores with color-coded badges
  - Detailed criteria breakdown (all 6 main criteria)
  - Visual progress bars for each criterion
  - Weights displayed in criterion labels
  - Remove site (×) button per column
  
- ➕ Manual site addition
  - "Add Site to Compare" button
  - Modal with site selection dropdown
  - Filters out already-compared sites
  
- 🔧 Comparison management
  - "Clear All" button with confirmation
  - "Export Comparison" button (placeholder)
  - "View Charts" button (placeholder)
  - Dynamic site count display

#### 🔄 Changed

**DC Selection Matrix:**
- Removed "Add Site" button from header
- Removed direct site management functionality
- Changed bottom section from "Sites Comparison" to "Site Recommendations"
- Updated page description to focus on evaluation workflow

**Site Compare:**
- Upgraded from "Coming Soon" placeholder to full implementation
- Now loads sites from comparison list (localStorage)
- Supports 2-10 sites in comparison
- Calculation uses weighted scores from criteria configuration

#### 🎨 UI/UX Improvements

- Clearer separation of concerns (Evaluate vs. Compare)
- Streamlined workflow: Location → Criteria → Recommendations → Compare
- Professional comparison table with proper data visualization
- Responsive design for comparison table
- Better empty states with actionable CTAs
- Intuitive navigation between evaluation and comparison

#### 🔧 Technical

**New Files:**
- `DC_MATRIX_RESTRUCTURE_v2.5.md` - Complete restructure documentation
- `QUICK_TEST_v2.5.md` - Testing guide with scenarios
- `USER_GUIDE_v2.5.md` - Comprehensive user manual
- `CHANGELOG.md` - This file

**Modified Files:**
- `frontend/dc-matrix.js` (+250 lines)
  - Added location filter functions
  - Added recommendations rendering
  - Added comparison list management
  - Removed direct site creation from matrix
  
- `frontend/app.js` (+200 lines)
  - Implemented full Site Compare page
  - Added comparison table rendering
  - Added score calculation functions
  - Added site management functions
  
- `frontend/styles.css` (+300 lines)
  - Added location filter styles
  - Added recommendations card styles
  - Added comparison table styles
  - Added progress bar styles
  - Added modal styles for site selection

**localStorage Structure:**
```javascript
// New: Comparison list
'dc_comparison_list': ['site-id-1', 'site-id-2', ...]

// Existing (unchanged):
'dc_matrix_sites': [ { id, name, country, region, scores, ... } ]
'dc_matrix_weights': { power: 25, network: 20, ... }
```

#### 📊 Data Flow

```
User Journey:
1. DC Selection Matrix
   └─> Select location filters
   └─> Configure criteria weights
   └─> View ranked recommendations
   └─> Add sites to comparison list

2. Site Compare
   └─> Load comparison list
   └─> Display side-by-side table
   └─> Add/remove sites manually
   └─> Export comparison report
```

#### ⚠️ Breaking Changes

**None** - Fully backward compatible
- Existing sites data preserved
- Weights configuration unchanged
- No API changes
- No data migration required

#### 🐛 Bug Fixes

- Fixed scoring calculation for comparison table
- Fixed color coding consistency across pages
- Fixed empty state handling

---

## [2.4.0] - 2026-01-03

### ✨ Added
- Detailed sub-criteria display in Criteria Weights Configuration
- "Expand All Details" button for sub-criteria
- Individual "Show Details" toggle per criterion
- Sub-criteria descriptions and explanations

### 🔄 Changed
- Enhanced criteria cards with collapsible sub-criteria lists
- Improved visual hierarchy in weights configuration

### 📖 Documentation
- Added `CRITERIA_DETAILS_UPDATE.md`

---

## [2.3.0] - 2026-01-02

### ✨ Added
- Three-tier site categorization (High/Medium/Low Potential)
- Detailed low-score analysis for sites scoring ≤3.0
  - Executive summary cards (Critical Issues, Problem Areas, Improvement Potential)
  - Full criteria breakdown with progress bars
  - Specific problem details for each sub-criterion
  - Context-aware recommendations per problem
- Enhanced visual design for site cards

### 📖 Documentation
- Added `LOW_SCORE_ANALYSIS_UPDATE.md`
- Added `QUICK_TEST_LOW_SCORE_v2.3.md`

---

## [2.2.1] - 2026-01-01

### ✨ Added
- Region/Area selection dropdown in Power Analysis
- Search functionality (site name, town, postcode, address)
- Debounced search input for performance
- Dynamic region population from site data

### 📖 Documentation
- Added `REGION_SEARCH_UPDATE.md`
- Added `QUICK_TEST_v2.2.1.md`

---

## [2.2.0] - 2025-12-31

### ✨ Added
- DC Selection Matrix page
  - UK/EU Edge Data Centre Site Selection framework
  - 6 main criteria with 33 sub-criteria
  - Configurable weights with recommended defaults
  - Site scoring and comparison
  - Radar chart visualization
  - Export to CSV functionality

### 📖 Documentation
- Added `DC_SELECTION_MATRIX_GUIDE.md`
- Added `DC_MATRIX_QUICK_START.md`

---

## [2.1.0] - 2025-12-30

### ✨ Added
- Integrated Selection Criteria into Power Analysis page
- Interactive range sliders for criteria values
- Real-time filtered site count
- Save/Reset criteria settings
- Collapsible filter panel

### 📖 Documentation
- Added `POWER_ANALYSIS_UPGRADE.md`
- Added `HOW_TO_USE_v2.2.md`
- Added `test-v2.2.sh`

---

## [2.0.0] - 2025-12-29

### 🎉 Initial Release

#### ✨ Features
- Dashboard with site statistics
- Power Analysis with Google Maps integration
- Site List with data table
- Site Map view
- Reports page
- Login authentication
- Responsive design

#### 🛠️ Technical Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Maps: Google Maps API
- Storage: localStorage

---

## Version Numbering

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, major restructure
- **MINOR**: New features, significant additions
- **PATCH**: Bug fixes, minor improvements

---

## Migration Guide

### From v2.4.x to v2.5.0

**No migration required** - Fully backward compatible

**Optional Steps:**
1. Hard refresh browser (Cmd/Ctrl + Shift + R)
2. Add `country` and `region` fields to existing sites (for filtering)
3. Clear comparison list if testing: `localStorage.removeItem('dc_comparison_list')`

**New Behavior:**
- DC Selection Matrix now starts with location filters (not site list)
- Must apply filters to see recommendations
- Comparison moved to separate page
- "Add Site" functionality now in Site Compare page context

---

## Roadmap

### Planned for v2.6.0
- [ ] Real export functionality (CSV/PDF)
- [ ] Chart visualization in comparison
- [ ] Auto-discovery from external API
- [ ] Geospatial map view of recommendations
- [ ] Advanced search filters

### Planned for v3.0.0
- [ ] Backend integration for site database
- [ ] User accounts and saved comparisons
- [ ] Collaborative features
- [ ] ML-powered recommendations
- [ ] Mobile app

---

*For detailed information about each release, see the respective documentation files.*

*Last Updated: January 4, 2026*




