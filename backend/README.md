# Orion Site Selection Backend v2

Simplified, clean, fast, and maintainable backend for Orion Site Selection.

## Features

- ✅ Simple Express server
- ✅ Excel data loading with caching
- ✅ Filtering logic matching original backend
- ✅ Fast startup
- ✅ Easy to maintain

## Quick Start

```bash
cd backend
npm install
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

- `GET /api/power-supplies` - Get filtered power supplies
- `GET /api/power-supplies/stats` - Get statistics
- `GET /api/power-supplies/regions` - Get list of regions
- `GET /health` - Health check

## Filter Parameters

- `region` - Filter by region/local authority
- `area` - Filter by area
- `utilisationBandMax` - Maximum utilisation percentage
- `onanRatingMin` - Minimum ONAN rating (kVA)
- `minSuppliesInRadius` - Minimum supplies within radius
- `radiusKm` - Radius in kilometers
- `centerLat` - Center latitude
- `centerLng` - Center longitude
- `searchText` - Text search

## Data Source

Excel file: `../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx`



