#!/bin/bash

# Test Connection Script - Frontend & Backend Integration
# Tests all frontend pages and backend API endpoints

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🔌 Frontend & Backend Connection Test                       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASS++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAIL++))
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Check Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Excel file exists
EXCEL_FILE="/Users/xh/Orion/orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx"
if [ -f "$EXCEL_FILE" ]; then
  FILE_SIZE=$(ls -lh "$EXCEL_FILE" | awk '{print $5}')
  test_result 0 "Excel file exists ($FILE_SIZE)"
else
  test_result 1 "Excel file missing at $EXCEL_FILE"
fi

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  test_result 0 "Node.js installed ($NODE_VERSION)"
else
  test_result 1 "Node.js not found"
fi

# Check Python
if command -v python3 &> /dev/null; then
  PYTHON_VERSION=$(python3 --version)
  test_result 0 "Python3 installed ($PYTHON_VERSION)"
else
  test_result 1 "Python3 not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Check Backend Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKEND_DIR="/Users/xh/Orion/orion-site-selection-v2/backend"
if [ -f "$BACKEND_DIR/server.js" ]; then
  test_result 0 "Backend server.js exists"
else
  test_result 1 "Backend server.js missing"
fi

if [ -f "$BACKEND_DIR/package.json" ]; then
  test_result 0 "Backend package.json exists"
else
  test_result 1 "Backend package.json missing"
fi

if [ -d "$BACKEND_DIR/node_modules" ]; then
  test_result 0 "Backend node_modules installed"
else
  test_result 1 "Backend node_modules missing (run: cd backend && npm install)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Check Frontend Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FRONTEND_DIR="/Users/xh/Orion/orion-site-selection-v2/frontend"
[ -f "$FRONTEND_DIR/index.html" ] && test_result 0 "index.html exists" || test_result 1 "index.html missing"
[ -f "$FRONTEND_DIR/app.js" ] && test_result 0 "app.js exists" || test_result 1 "app.js missing"
[ -f "$FRONTEND_DIR/dc-matrix.js" ] && test_result 0 "dc-matrix.js exists" || test_result 1 "dc-matrix.js missing"
[ -f "$FRONTEND_DIR/styles.css" ] && test_result 0 "styles.css exists" || test_result 1 "styles.css missing"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Check Backend Server Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if backend is running
BACKEND_RUNNING=$(lsof -ti:3000)
if [ -n "$BACKEND_RUNNING" ]; then
  test_result 0 "Backend server running on port 3000 (PID: $BACKEND_RUNNING)"
  
  # Test API endpoints
  echo ""
  echo -e "${BLUE}Testing API Endpoints...${NC}"
  
  # Test health endpoint
  HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
  if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    test_result 0 "API /health endpoint responding"
  else
    test_result 1 "API /health endpoint not responding"
  fi
  
  # Test power-supplies endpoint
  PS_RESPONSE=$(curl -s http://localhost:3000/api/power-supplies?limit=1)
  if [[ $PS_RESPONSE == *"success"* ]]; then
    test_result 0 "API /api/power-supplies endpoint responding"
    
    # Extract count
    COUNT=$(echo $PS_RESPONSE | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    if [ -n "$COUNT" ]; then
      echo -e "  ${YELLOW}→${NC} Total sites available: $COUNT"
    fi
  else
    test_result 1 "API /api/power-supplies endpoint not responding"
  fi
  
  # Test stats endpoint
  STATS_RESPONSE=$(curl -s http://localhost:3000/api/power-supplies/stats)
  if [[ $STATS_RESPONSE == *"success"* ]]; then
    test_result 0 "API /api/power-supplies/stats endpoint responding"
  else
    test_result 1 "API /api/power-supplies/stats endpoint not responding"
  fi
  
  # Test regions endpoint
  REGIONS_RESPONSE=$(curl -s http://localhost:3000/api/power-supplies/regions)
  if [[ $REGIONS_RESPONSE == *"success"* ]]; then
    test_result 0 "API /api/power-supplies/regions endpoint responding"
  else
    test_result 1 "API /api/power-supplies/regions endpoint not responding"
  fi
  
else
  test_result 1 "Backend server NOT running on port 3000"
  echo -e "  ${YELLOW}→${NC} Start backend: cd backend && npm start"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Check Frontend Server Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if frontend is running on port 8888
FRONTEND_RUNNING=$(lsof -ti:8888)
if [ -n "$FRONTEND_RUNNING" ]; then
  test_result 0 "Frontend server running on port 8888 (PID: $FRONTEND_RUNNING)"
  
  # Test frontend access
  FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8888)
  if [ "$FRONTEND_RESPONSE" == "200" ]; then
    test_result 0 "Frontend accessible at http://localhost:8888"
  else
    test_result 1 "Frontend not accessible (HTTP $FRONTEND_RESPONSE)"
  fi
else
  test_result 1 "Frontend server NOT running on port 8888"
  echo -e "  ${YELLOW}→${NC} Start frontend: cd frontend && python3 -m http.server 8888"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 6: Frontend Pages Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${BLUE}Frontend Pages to Test Manually:${NC}"
echo ""
echo "□ Dashboard Page"
echo "  - Stats cards display correctly"
echo "  - Charts render properly"
echo "  - Real-time data updates"
echo ""
echo "□ Site List Page"
echo "  - Sites table displays"
echo "  - Pagination works"
echo "  - Search/filter functions"
echo ""
echo "□ Power Analysis Page"
echo "  - Google Maps loads"
echo "  - Site markers display"
echo "  - Filter sliders work"
echo "  - Labels toggle works"
echo "  - Filtered sites list displays"
echo "  - Sorting works (Max Util, ONAN, Supplies)"
echo "  - Density radius filtering works"
echo "  - Min supplies filtering works"
echo ""
echo "□ Site Map Page"
echo "  - Map loads correctly"
echo "  - All sites visible"
echo "  - Clustering works"
echo ""
echo "□ DC Selection Matrix Page"
echo "  - Matrix table renders"
echo "  - Weight sliders work"
echo "  - Location filter works"
echo "  - Site recommendations display"
echo "  - Sub-criteria details expand"
echo ""
echo "□ Site Compare Page"
echo "  - Comparison table displays"
echo "  - Sites can be added"
echo "  - Detailed scores visible"
echo "  - Manual score editing works"
echo ""
echo "□ Reports Page"
echo "  - Report generation works"
echo "  - Export functions work"
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL=$((PASS + FAIL))
echo ""
echo -e "${GREEN}Passed:${NC} $PASS / $TOTAL"
echo -e "${RED}Failed:${NC} $FAIL / $TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All automated tests passed!${NC}"
  echo ""
  echo "🚀 Ready to test frontend pages manually at:"
  echo "   http://localhost:8888"
else
  echo -e "${RED}❌ Some tests failed. Please review errors above.${NC}"
  echo ""
  echo "🔧 Common fixes:"
  echo "   • Backend: cd backend && npm install && npm start"
  echo "   • Frontend: cd frontend && python3 -m http.server 8888"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   Test Complete - Review results above                        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"



