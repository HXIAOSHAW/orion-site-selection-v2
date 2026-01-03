# Orion Site Selection v2

🚀 **Live Demo**: [https://hxiaoshaw.github.io/orion-site-selection-v2/](https://hxiaoshaw.github.io/orion-site-selection-v2/)  
🔑 **Password**: `EdgeNebula2026`

**Simplified, Clean, Fast, Maintainable Version**

This is a complete rewrite of the Orion Site Selection application with:
- ✅ Clean, simple code
- ✅ Fast startup
- ✅ Easy to maintain
- ✅ Same functionality as original
- ✅ Same design and user experience

## Project Structure

```
orion-site-selection-v2/
├── backend/          # Simplified Express backend
│   ├── server.js     # Single file server
│   ├── package.json
│   └── README.md
├── frontend/         # Simplified SPA frontend
│   ├── index.html    # Single HTML file
│   ├── styles.css    # All styles
│   ├── app.js        # All JavaScript logic
│   └── README.md
└── README.md         # This file
```

## Quick Start

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3000`

### Frontend

```bash
cd frontend
python3 -m http.server 8080
```

Frontend runs on `http://localhost:8080`

**Password**: `EdgeNebula2026`

## Features Comparison

| Feature | Original | v2 |
|---------|----------|-----|
| **Backend Files** | ~20+ files | 1 file |
| **Frontend Files** | ~30+ files | 3 files |
| **Startup Time** | ~5-10s | ~1-2s |
| **Code Complexity** | High | Low |
| **Maintainability** | Medium | High |
| **Functionality** | Full | Full ✅ |
| **Design** | Original | Same ✅ |
| **Data Source** | Excel | Same Excel ✅ |
| **Filter Logic** | Complex | Same Logic ✅ |

## API Endpoints

Same as original:
- `GET /api/power-supplies` - Get filtered sites
- `GET /api/power-supplies/stats` - Get statistics
- `GET /api/power-supplies/regions` - Get regions

## Filter Parameters

Same as original:
- `region`, `area`, `utilisationBandMax`, `onanRatingMin`
- `minSuppliesInRadius`, `radiusKm`, `centerLat`, `centerLng`
- `searchText`

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && python3 -m http.server 8080`
3. Open browser: `http://localhost:8080`
4. Enter password: `EdgeNebula2026`
5. Test all pages and functionality

## Advantages of v2

1. **Simpler**: 90% less code, easier to understand
2. **Faster**: No complex routing, faster startup
3. **Maintainable**: All logic in one place
4. **Same Features**: All original functionality preserved
5. **Same Design**: Identical user experience

## Migration Notes

- Data source: Same Excel file
- API endpoints: Same structure
- Filter logic: Identical implementation
- Frontend pages: Same design and functionality


