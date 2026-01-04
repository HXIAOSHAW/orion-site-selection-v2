#!/bin/bash

# 🧪 Orion Site Selection v2.5 - Quick Test Script
# Tests the major restructure: DC Selection Matrix + Site Compare

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🧪 Orion Site Selection v2.5 - Quick Test                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

echo -e "${BLUE}📋 Test 1: File Structure Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check frontend files
if [ -f "frontend/dc-matrix.js" ]; then test_result 0 "dc-matrix.js exists"; else test_result 1 "dc-matrix.js missing"; fi
if [ -f "frontend/app.js" ]; then test_result 0 "app.js exists"; else test_result 1 "app.js missing"; fi
if [ -f "frontend/styles.css" ]; then test_result 0 "styles.css exists"; else test_result 1 "styles.css missing"; fi
if [ -f "frontend/index.html" ]; then test_result 0 "index.html exists"; else test_result 1 "index.html missing"; fi

# Check docs sync
if [ -f "docs/dc-matrix.js" ]; then test_result 0 "dc-matrix.js synced to docs"; else test_result 1 "dc-matrix.js not synced"; fi
if [ -f "docs/app.js" ]; then test_result 0 "app.js synced to docs"; else test_result 1 "app.js not synced"; fi

echo ""
echo -e "${BLUE}📋 Test 2: JavaScript Syntax Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check JS syntax
node -c frontend/dc-matrix.js 2>/dev/null
test_result $? "dc-matrix.js syntax valid"

node -c frontend/app.js 2>/dev/null
test_result $? "app.js syntax valid"

echo ""
echo -e "${BLUE}📋 Test 3: Key Functions Check (dc-matrix.js)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for new functions
grep -q "dcUpdateLocationFilter" frontend/dc-matrix.js
test_result $? "dcUpdateLocationFilter() function exists"

grep -q "dcApplyLocationFilter" frontend/dc-matrix.js
test_result $? "dcApplyLocationFilter() function exists"

grep -q "dcLoadSiteRecommendations" frontend/dc-matrix.js
test_result $? "dcLoadSiteRecommendations() function exists"

grep -q "dcRenderRecommendations" frontend/dc-matrix.js
test_result $? "dcRenderRecommendations() function exists"

grep -q "dcRenderRecommendationCard" frontend/dc-matrix.js
test_result $? "dcRenderRecommendationCard() function exists"

grep -q "dcAddToComparison" frontend/dc-matrix.js
test_result $? "dcAddToComparison() function exists"

echo ""
echo -e "${BLUE}📋 Test 4: Key Functions Check (app.js)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for comparison functions
grep -q "renderSiteComparePage" frontend/app.js
test_result $? "renderSiteComparePage() function exists"

grep -q "loadComparison" frontend/app.js
test_result $? "loadComparison() function exists"

grep -q "renderComparison" frontend/app.js
test_result $? "renderComparison() function exists"

grep -q "compareAddSite" frontend/app.js
test_result $? "compareAddSite() function exists"

grep -q "compareRemoveSite" frontend/app.js
test_result $? "compareRemoveSite() function exists"

grep -q "calculateTotalComparisonScore" frontend/app.js
test_result $? "calculateTotalComparisonScore() function exists"

echo ""
echo -e "${BLUE}📋 Test 5: CSS Styles Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for new CSS classes
grep -q "\.location-filter-container" frontend/styles.css
test_result $? ".location-filter-container style exists"

grep -q "\.recommendations-list" frontend/styles.css
test_result $? ".recommendations-list style exists"

grep -q "\.recommendation-card" frontend/styles.css
test_result $? ".recommendation-card style exists"

grep -q "\.comparison-table" frontend/styles.css
test_result $? ".comparison-table style exists"

grep -q "\.comparison-score-badge" frontend/styles.css
test_result $? ".comparison-score-badge style exists"

echo ""
echo -e "${BLUE}📋 Test 6: HTML Structure Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check navigation links
grep -q "dc-matrix" frontend/index.html
test_result $? "DC Selection Matrix navigation link exists"

grep -q "site-compare" frontend/index.html
test_result $? "Site Compare navigation link exists"

# Check script includes
grep -q "dc-matrix.js" frontend/index.html
test_result $? "dc-matrix.js script included"

echo ""
echo -e "${BLUE}📋 Test 7: Documentation Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "DC_MATRIX_RESTRUCTURE_v2.5.md" ]; then test_result 0 "Restructure documentation exists"; else test_result 1 "Restructure doc missing"; fi
if [ -f "QUICK_TEST_v2.5.md" ]; then test_result 0 "Quick test guide exists"; else test_result 1 "Quick test guide missing"; fi
if [ -f "USER_GUIDE_v2.5.md" ]; then test_result 0 "User guide exists"; else test_result 1 "User guide missing"; fi
if [ -f "CHANGELOG.md" ]; then test_result 0 "Changelog exists"; else test_result 1 "Changelog missing"; fi
if [ -f "README_v2.5.md" ]; then test_result 0 "README v2.5 exists"; else test_result 1 "README missing"; fi

echo ""
echo -e "${BLUE}📋 Test 8: Removed Features Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check that "Add Site" button is removed from DC Matrix
grep -q "➕ Add Site" frontend/dc-matrix.js | grep -q "renderDCMatrixPage" && test_result 1 "Add Site button incorrectly present" || test_result 0 "Add Site button correctly removed from DC Matrix"

# Check that Sites Comparison is renamed to Site Recommendations
grep -q "Site Recommendations" frontend/dc-matrix.js
test_result $? "Site Recommendations section exists"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                     📊 Test Results                           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ ALL TESTS PASSED! v2.5 is ready for deployment.${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "🚀 Next Steps:"
  echo "  1. Start backend:  cd backend && node server.js"
  echo "  2. Start frontend: cd frontend && python3 -m http.server 8888"
  echo "  3. Open browser:   http://localhost:8888"
  echo "  4. Password:       EdgeNebula2026"
  echo "  5. Test workflow:  DC Matrix → Add sites → Site Compare"
  echo ""
  exit 0
else
  echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}❌ SOME TESTS FAILED. Please review and fix.${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════════${NC}"
  echo ""
  exit 1
fi

