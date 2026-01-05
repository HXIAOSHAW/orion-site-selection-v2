#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔍 Testing API Connection and Data Loading                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Backend Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Testing Backend Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is NOT running"
    exit 1
fi
echo ""

# Test 2: Get All Sites (no filters)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Testing /api/power-supplies (no filters)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s "http://localhost:3000/api/power-supplies?limit=10")
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true' | head -1)
COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ "$SUCCESS" = '"success":true' ]; then
    echo "✅ API call successful"
    echo "   Count: $COUNT sites"
    
    # Check if data has required fields
    HAS_REGION=$(echo "$RESPONSE" | grep -o '"region"' | head -1)
    HAS_LAT=$(echo "$RESPONSE" | grep -o '"lat"' | head -1)
    HAS_UTIL=$(echo "$RESPONSE" | grep -o '"utilisationBandPercent"' | head -1)
    
    if [ -n "$HAS_REGION" ]; then
        echo "✅ Data contains 'region' field"
    else
        echo "❌ Data missing 'region' field"
    fi
    
    if [ -n "$HAS_LAT" ]; then
        echo "✅ Data contains 'lat' field"
    else
        echo "❌ Data missing 'lat' field"
    fi
    
    if [ -n "$HAS_UTIL" ]; then
        echo "✅ Data contains 'utilisationBandPercent' field"
    else
        echo "❌ Data missing 'utilisationBandPercent' field"
    fi
else
    echo "❌ API call failed"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Get Sites with Filters
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Testing /api/power-supplies with filters"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILTERED=$(curl -s "http://localhost:3000/api/power-supplies?utilisationBandMax=40&onanRatingMin=1000&limit=10")
FILTERED_SUCCESS=$(echo "$FILTERED" | grep -o '"success":true' | head -1)
FILTERED_COUNT=$(echo "$FILTERED" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ "$FILTERED_SUCCESS" = '"success":true' ]; then
    echo "✅ Filtered API call successful"
    echo "   Filtered count: $FILTERED_COUNT sites"
else
    echo "❌ Filtered API call failed"
fi
echo ""

# Test 4: Get Regions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Testing /api/power-supplies/regions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REGIONS=$(curl -s "http://localhost:3000/api/power-supplies/regions")
REGIONS_SUCCESS=$(echo "$REGIONS" | grep -o '"success":true' | head -1)
REGION_COUNT=$(echo "$REGIONS" | grep -o '"name"' | wc -l | xargs)

if [ "$REGIONS_SUCCESS" = '"success":true' ]; then
    echo "✅ Regions API call successful"
    echo "   Total regions: $REGION_COUNT"
else
    echo "❌ Regions API call failed"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📊 Summary                                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "If all tests pass, the issue is likely in frontend filtering logic."
echo "If tests fail, check backend server and CSV file connection."
echo ""

