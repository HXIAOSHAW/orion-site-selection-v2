# Testing Guide - Orion Site Selection v2

## Quick Test

### Option 1: Use Start Script (Recommended)

```bash
cd /Users/xh/Orion/orion-site-selection-v2
./start.sh
```

This will start both backend and frontend automatically.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd /Users/xh/Orion/orion-site-selection-v2/backend
npm install  # First time only
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /Users/xh/Orion/orion-site-selection-v2/frontend
python3 -m http.server 8080
```

## Test Steps

1. **Open Browser**: `http://localhost:8080`
2. **Enter Password**: `EdgeNebula2026`
3. **Test Each Page**:

### ✅ Dashboard
- Should show KPI cards (Total Sites, Valid Candidates, etc.)
- Should show regional distribution chart
- **Expected**: Data loads from backend

### ✅ Site List
- Should show table of sites
- Test search functionality
- **Expected**: Sites filtered by selection criteria

### ✅ Power Analysis
- Should load Google Maps
- Should show site markers (green = valid, red = invalid)
- Test map type switching (Map/Satellite)
- **Expected**: Interactive map with site data

### ✅ Site Map
- Should show map view
- **Expected**: Geographic visualization

### ✅ Selection Criteria
- Adjust sliders for:
  - Maximum Utilisation (%)
  - Minimum ONAN Rating (kVA)
  - Density Radius (km)
  - Minimum Supplies in Radius
- Click "Save Criteria"
- **Expected**: Criteria saved, pages reload with new filters

### ✅ Reports
- Should show analytics
- **Expected**: Regional distribution and statistics

## Comparison Test

### Original vs v2

| Test | Original | v2 | Notes |
|------|----------|----|----|
| **Startup Time** | ~5-10s | ~1-2s | v2 faster ✅ |
| **File Count** | 50+ files | 3 files | v2 simpler ✅ |
| **Code Lines** | ~5000+ | ~800 | v2 cleaner ✅ |
| **Dashboard** | ✅ | ✅ | Same functionality |
| **Site List** | ✅ | ✅ | Same functionality |
| **Power Analysis** | ✅ | ✅ | Same functionality |
| **Filtering** | ✅ | ✅ | Same logic |
| **Data Source** | Excel | Excel | Same data ✅ |

## Performance Metrics

### Backend
- **Startup**: < 1 second
- **First Request**: < 2 seconds (Excel loading)
- **Subsequent Requests**: < 100ms (cached)

### Frontend
- **Initial Load**: < 1 second
- **Page Switch**: < 500ms
- **Map Load**: < 2 seconds

## Known Limitations

1. **Google Maps API Key**: Uses same key as original (may need update)
2. **Excel File Path**: Hardcoded relative path (works if structure maintained)
3. **No Coordinate Resolution**: Coordinates must be in Excel (no What3Words API)

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Excel file path is correct
- Check Node.js version (v14+)

### Frontend shows errors
- Check backend is running on port 3000
- Check browser console for errors
- Verify API endpoints match

### Map not loading
- Check Google Maps API key
- Check browser console for API errors
- Verify internet connection

### No data showing
- Check backend logs for Excel loading errors
- Verify Excel file exists at expected path
- Check API responses in browser Network tab

## Success Criteria

✅ All pages load without errors
✅ Data displays correctly
✅ Filters work as expected
✅ Map displays with markers
✅ Criteria can be saved and applied
✅ Performance is acceptable (< 2s page load)



