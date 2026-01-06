# 🌐 Orion Site Selection v2.5

## 🎯 Enterprise-Grade Edge Data Centre Site Selection Platform

### UK & European Focus | Weighted Criteria Framework | Professional Comparison

---

## 🚀 What's New in v2.5

### Major UX Redesign - Separated Workflows

**Before v2.5:**
```
DC Selection Matrix
├─ Add Site manually
├─ Configure criteria
└─ View all sites mixed together ❌ Confusing
```

**After v2.5:**
```
DC Selection Matrix              Site Compare
├─ 📍 Select Location           ├─ ⚖️ Load selected sites
├─ ⚙️ Configure Criteria        ├─ ➕ Add more sites
├─ 🎯 View Recommendations      ├─ 📊 Side-by-side table
└─ ➕ Add to Comparison         └─ 📥 Export report
   
   Clear workflow: Evaluate → Compare → Decide ✅
```

---

## 📋 Key Features

### 1. DC Selection Matrix 🏢
- **Location-Based Discovery**
  - Filter by Country & Region
  - Set minimum score thresholds
  - Real-time filtering
  
- **Weighted Criteria Framework**
  - 6 Main Criteria (Power, Network, Property, Planning, Cost, ESG)
  - 33 Sub-Criteria with detailed breakdowns
  - Configurable weights (total = 100%)
  - UK/EU edge DC optimized defaults
  
- **Intelligent Recommendations**
  - Auto-ranked by weighted scores
  - Top strengths highlighted
  - Color-coded quality indicators
  - One-click add to comparison

### 2. Site Comparison ⚖️
- **Professional Table View**
  - Side-by-side comparison (2-10 sites)
  - Overall & per-criterion scores
  - Visual progress bars
  - Color-coded performance
  
- **Flexible Management**
  - Add sites from recommendations
  - Manually select additional sites
  - Remove unwanted sites
  - Clear all with confirmation
  
- **Export & Visualization**
  - Export comparison reports
  - Chart visualizations (coming soon)
  - Share-ready formats

---

## 🎓 Quick Start

### Step 1: Evaluate Sites
```
1. Navigate to "DC Selection Matrix"
2. Select: Country = UK, Region = London
3. Adjust criteria weights if needed (defaults work well)
4. Click "🔍 Find Sites"
5. Review ranked recommendations
6. Click "➕ Add to Compare" on 2-3 sites
```

### Step 2: Compare Sites
```
1. Navigate to "Site Compare"
2. Review side-by-side breakdown
3. Add more sites if needed
4. Analyze scores and trade-offs
5. Export comparison for decision-makers
```

---

## 📊 Use Cases

### 🏦 Investor: Multi-Region Evaluation
```
Goal: Find best UK/EU sites for portfolio expansion
Workflow: Broad search → Adjust weights → Compare top 5 → Export to board
Time: 15-20 minutes
```

### 👨‍💻 Developer: Latency-Optimized Edge
```
Goal: Find lowest-latency site near London
Workflow: Filter London → Prioritize Network → Compare top 3 → Deploy
Time: 10 minutes
```

### 🌱 ESG Team: Sustainable DC Selection
```
Goal: Find greenest data centre site
Workflow: Pan-European → Max ESG weight → Compare renewables → Select
Time: 15 minutes
```

---

## 🛠️ Technical Stack

### Frontend
- Pure HTML5, CSS3, JavaScript (ES6+)
- Google Maps API integration
- Chart.js for visualizations
- localStorage for persistence

### Backend
- Node.js + Express
- RESTful API
- JSON data format
- Modular architecture

### Deployment
- GitHub Pages (frontend)
- Railway/Heroku (backend - optional)
- Static hosting compatible

---

## 📦 Installation

### Local Development

```bash
# Clone repository
git clone https://github.com/HXIAOSHAW/orion-site-selection-v2.git
cd orion-site-selection-v2

# Start backend (Terminal 1)
cd backend
npm install
node server.js
# Runs on http://localhost:3000

# Start frontend (Terminal 2)
cd frontend
python3 -m http.server 8888
# Access at http://localhost:8888
# Password: EdgeNebula2026
```

### GitHub Pages

```bash
# Already deployed at:
https://hxiaoshaw.github.io/orion-site-selection-v2/

# To enable on your fork:
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: main, Folder: /docs
4. Save
5. Wait 1-3 minutes
6. Access your URL
```

---

## 📖 Documentation

### User Guides
- **[USER_GUIDE_v2.5.md](./USER_GUIDE_v2.5.md)** - Complete user manual
- **[QUICK_TEST_v2.5.md](./QUICK_TEST_v2.5.md)** - Testing scenarios

### Technical Documentation
- **[DC_MATRIX_RESTRUCTURE_v2.5.md](./DC_MATRIX_RESTRUCTURE_v2.5.md)** - Architecture details
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

### Criteria Reference
- **[DC_SELECTION_MATRIX_GUIDE.md](./DC_SELECTION_MATRIX_GUIDE.md)** - Criteria explanations

---

## 🎨 Screenshots

### DC Selection Matrix
```
┌─────────────────────────────────────────────────┐
│ 🏢 UK/EU Edge Data Centre Selection Matrix     │
├─────────────────────────────────────────────────┤
│ 📍 Location & Area Selection                   │
│ [UK ▼] [London ▼] [≥3.0 ▼] [🔍 Find Sites]   │
├─────────────────────────────────────────────────┤
│ ▼ ⚙️ Criteria Weights (100%)                   │
│ ⚡ Power [━━━━━━━━━━━━] 25%                    │
│ 🌐 Network [━━━━━━━━━━] 20%                   │
│ ... (6 total)                                   │
├─────────────────────────────────────────────────┤
│ 🎯 Site Recommendations (5 sites)              │
│ ┌─────────────────────────────────────────────┐ │
│ │ #1 [4.2] London Edge DC Alpha             │ │
│ │ 🏆 Power (4.5), Network (4.2), ESG (4.0)  │ │
│ │ [📊 Details] [➕ Add to Compare]          │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Site Comparison
```
┌───────────────┬──────────┬──────────┬──────────┐
│ Criteria      │ Site A   │ Site B   │ Site C   │
├───────────────┼──────────┼──────────┼──────────┤
│ Overall       │  4.2 🟢  │  3.8 🟠  │  3.5 🟠  │
│ ⚡ Power (25%)│  4.5     │  3.9     │  3.2     │
│ 🌐 Net (20%)  │  4.2     │  4.0     │  3.8     │
│ ... (6 total) │  ...     │  ...     │  ...     │
└───────────────┴──────────┴──────────┴──────────┘
[📥 Export] [📊 Charts]
```

---

## 🔐 Data & Privacy

### Local Storage
- All data stored in browser localStorage
- No server-side persistence by default
- Per-browser, per-device storage
- User controls all data

### Data Structure
```javascript
// Sites database
dc_matrix_sites: [
  {
    id: 'site-123',
    name: 'London Edge DC',
    country: 'UK',
    region: 'London',
    dateAdded: '2026-01-04',
    scores: { /* ... */ }
  }
]

// Comparison list
dc_comparison_list: ['site-123', 'site-456']

// Weights configuration
dc_matrix_weights: { power: 25, network: 20, ... }
```

---

## 🧪 Testing

### Quick Test (5 minutes)

```bash
cd /Users/xh/Orion/orion-site-selection-v2

# Terminal 1: Backend
cd backend && node server.js

# Terminal 2: Frontend
cd frontend && python3 -m http.server 8888

# Browser: http://localhost:8888
# Password: EdgeNebula2026

# Test:
1. DC Matrix → Select UK + London
2. Add 2 sites to comparison
3. Go to Site Compare
4. Verify table displays correctly
```

### Full Test Suite
See **[QUICK_TEST_v2.5.md](./QUICK_TEST_v2.5.md)** for comprehensive scenarios.

---

## 🗺️ Roadmap

### v2.6 (Q1 2026)
- [ ] Real export (CSV/PDF)
- [ ] Chart visualizations
- [ ] Map view of recommendations
- [ ] Advanced filters

### v2.7 (Q2 2026)
- [ ] External API integration
- [ ] Real-time site availability
- [ ] Budget constraints
- [ ] Scoring history

### v3.0 (Q3 2026)
- [ ] Backend database
- [ ] User accounts
- [ ] Collaborative features
- [ ] ML recommendations
- [ ] Mobile app

---

## 🤝 Contributing

### Bug Reports
Open an issue with:
- Browser & version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (F12)

### Feature Requests
Open an issue with:
- Use case description
- Proposed workflow
- Expected outcome

### Pull Requests
1. Fork repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Update documentation
6. Submit PR

---

## 📜 License

**Proprietary** - Internal use only  
© 2026 Orion Site Selection  
All rights reserved

---

## 👥 Team

**Development**: EdgeNebula Engineering  
**Product**: DC Site Selection Team  
**Support**: devops@edgenebula.io

---

## 🔗 Links

- **Repository**: https://github.com/HXIAOSHAW/orion-site-selection-v2
- **GitHub Pages**: https://hxiaoshaw.github.io/orion-site-selection-v2/
- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/HXIAOSHAW/orion-site-selection-v2/issues

---

## ⚡ Quick Reference

### Commands
```bash
# Start backend
cd backend && node server.js

# Start frontend
cd frontend && python3 -m http.server 8888

# Check syntax
node -c frontend/dc-matrix.js
node -c frontend/app.js

# Sync to docs
cp frontend/*.{js,css,html} docs/
```

### Default Password
```
EdgeNebula2026
```

### Key Shortcuts
- `Cmd/Ctrl + Shift + R` - Hard refresh (clear cache)
- `F12` - Open developer console
- `Cmd/Ctrl + K` - Quick search (if implemented)

---

## 📞 Support

**Documentation**: Read the guides first  
**Testing**: See QUICK_TEST_v2.5.md  
**Issues**: Open GitHub issue  
**Questions**: Check USER_GUIDE_v2.5.md

---

**Version**: 2.5.0  
**Release Date**: January 4, 2026  
**Status**: Production Ready ✅

---

*Built with ❤️ for the edge data centre industry*



