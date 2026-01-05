#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🧪 Testing Backend Coordinate Fix                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check if backend returns coordinates
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Testing /api/power-supplies (check coordinates)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s "http://localhost:3000/api/power-supplies?limit=5")
HAS_LAT=$(echo "$RESPONSE" | grep -o '"lat"' | head -1)
HAS_LNG=$(echo "$RESPONSE" | grep -o '"lng"' | head -1)
LAT_VALUE=$(echo "$RESPONSE" | grep -o '"lat":[0-9.]*' | head -1 | grep -o '[0-9.]*')

if [ -n "$HAS_LAT" ] && [ -n "$HAS_LNG" ]; then
    echo "✅ API returns lat and lng fields"
    if [ -n "$LAT_VALUE" ] && [ "$LAT_VALUE" != "null" ]; then
        echo "✅ Coordinates have values (lat: $LAT_VALUE)"
    else
        echo "❌ Coordinates are null"
    fi
else
    echo "❌ API missing lat/lng fields"
fi
echo ""

# Test 2: Test with filters
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Testing with filters (40% utilisation, 1000 kVA)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILTERED=$(curl -s "http://localhost:3000/api/power-supplies?utilisationBandMax=40&onanRatingMin=1000&limit=10")
FILTERED_COUNT=$(echo "$FILTERED" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' | head -1)
HAS_COORDS=$(echo "$FILTERED" | grep -o '"lat":[0-9.]*' | head -1)

if [ -n "$FILTERED_COUNT" ]; then
    echo "✅ Filtered count: $FILTERED_COUNT sites"
    if [ -n "$HAS_COORDS" ]; then
        echo "✅ Filtered sites have coordinates"
    else
        echo "⚠️  Filtered sites missing coordinates"
    fi
else
    echo "❌ Filtered API call failed"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📊 Summary                                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "If coordinates are present, backend fix is working!"
echo "Restart backend server if needed: cd backend && npm start"
echo ""

