#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Testing Orion Site Selection v2.2 - Integrated Filters     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend
echo "🔍 Testing Backend (port 3000)..."
if lsof -i:3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend is running${NC}"
    BACKEND_STATUS="✅"
else
    echo -e "   ${RED}❌ Backend is not running${NC}"
    BACKEND_STATUS="❌"
fi

# Test frontend
echo ""
echo "🔍 Testing Frontend (port 8888)..."
if lsof -i:8888 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend is running${NC}"
    FRONTEND_STATUS="✅"
else
    echo -e "   ${RED}❌ Frontend is not running${NC}"
    FRONTEND_STATUS="❌"
fi

# Test API
echo ""
echo "🔍 Testing API Connection..."
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "   ${GREEN}✅ API is responding${NC}"
    API_STATUS="✅"
else
    echo -e "   ${YELLOW}⚠️  API connection issue${NC}"
    API_STATUS="⚠️"
fi

# Check files
echo ""
echo "🔍 Checking Updated Files..."

FILES=(
    "frontend/app.js"
    "frontend/styles.css"
    "frontend/index.html"
    "docs/app.js"
    "docs/styles.css"
    "POWER_ANALYSIS_UPGRADE.md"
    "HOW_TO_USE_v2.2.md"
)

ALL_FILES_OK=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✅ $file${NC}"
    else
        echo -e "   ${RED}❌ $file (missing)${NC}"
        ALL_FILES_OK=false
    fi
done

# Test browser access
echo ""
echo "🔍 Testing Browser Access..."
if command -v open >/dev/null 2>&1; then
    echo -e "   ${YELLOW}⚡ Opening browser...${NC}"
    open http://localhost:8888
    BROWSER_STATUS="⚡"
else
    echo -e "   ${YELLOW}ℹ️  Please open http://localhost:8888 manually${NC}"
    BROWSER_STATUS="ℹ️"
fi

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Test Summary                                                ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Backend (port 3000):     $BACKEND_STATUS                                       ║"
echo "║  Frontend (port 8888):    $FRONTEND_STATUS                                       ║"
echo "║  API Connection:          $API_STATUS                                       ║"
echo "║  Files Updated:           $([ "$ALL_FILES_OK" = true ] && echo "✅" || echo "❌")                                       ║"
echo "║  Browser:                 $BROWSER_STATUS                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$BACKEND_STATUS" = "✅" ] && [ "$FRONTEND_STATUS" = "✅" ]; then
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    echo ""
    echo "📍 Access URLs:"
    echo "   • Local:  http://localhost:8888"
    echo "   • Online: https://hxiaoshaw.github.io/orion-site-selection-v2/"
    echo ""
    echo "🔑 Password: EdgeNebula2026"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Go to Power Analysis page"
    echo "   2. Try the new filter sliders"
    echo "   3. Click 'Apply Filters to Map'"
    echo "   4. Enjoy the new features! 🚀"
else
    echo -e "${RED}⚠️  Some services are not running${NC}"
    echo ""
    echo "🔧 To start services:"
    echo "   cd /Users/xh/Orion/orion-site-selection-v2"
    echo "   ./start.sh"
    echo ""
    echo "   Or manually:"
    echo "   cd backend && node server.js &"
    echo "   cd frontend && python3 -m http.server 8888 &"
fi

echo ""

