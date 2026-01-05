#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🧪 测试后端CSV连接和Cambridgeshire筛选 / Testing Backend    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

API_BASE="http://localhost:3000"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 1: 检查后端健康状态 / Step 1: Check Backend Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s "$API_BASE/health" 2>&1)
if [ $? -eq 0 ] && echo "$HEALTH" | grep -q "ok"; then
    echo "✅ 后端服务器运行正常 / Backend server is running"
    echo "   Response: $HEALTH"
else
    echo "❌ 后端服务器未运行或无法访问 / Backend server not running or unreachable"
    echo "   请先启动后端: cd backend && npm start"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 2: 测试CSV数据加载 / Step 2: Test CSV Data Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
STATS=$(curl -s "$API_BASE/api/power-supplies/stats")
if [ $? -eq 0 ]; then
    TOTAL=$(echo "$STATS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
    VALID=$(echo "$STATS" | grep -o '"validCandidateSites":[0-9]*' | grep -o '[0-9]*')
    WITH_COORDS=$(echo "$STATS" | grep -o '"sitesWithCoordinates":[0-9]*' | grep -o '[0-9]*')
    
    if [ -n "$TOTAL" ]; then
        echo "✅ CSV数据加载成功 / CSV data loaded successfully"
        echo "   总站点数 / Total Sites: $TOTAL"
        echo "   有效候选站点 / Valid Candidates: $VALID"
        echo "   有坐标的站点 / Sites with Coordinates: $WITH_COORDS"
    else
        echo "❌ CSV数据加载失败 / CSV data loading failed"
        echo "   Response: $STATS"
        exit 1
    fi
else
    echo "❌ 无法获取统计数据 / Cannot fetch stats"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 3: 检查Cambridgeshire区域数据 / Step 3: Check Cambridgeshire Region"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REGIONS=$(curl -s "$API_BASE/api/power-supplies/regions")
if [ $? -eq 0 ]; then
    CAMBRIDGE_COUNT=$(echo "$REGIONS" | grep -i "cambridgeshire" | grep -o '[0-9]*' | head -1)
    if [ -n "$CAMBRIDGE_COUNT" ]; then
        echo "✅ 找到Cambridgeshire区域 / Found Cambridgeshire region"
        echo "   Cambridgeshire站点数 / Sites: $CAMBRIDGE_COUNT"
    else
        echo "⚠️  未找到Cambridgeshire区域 / Cambridgeshire region not found"
        echo "   可用区域 / Available regions:"
        echo "$REGIONS" | grep -o '"[^"]*"' | head -5
    fi
else
    echo "❌ 无法获取区域列表 / Cannot fetch regions"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 4: 测试默认筛选条件 / Step 4: Test Default Filter Criteria"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "默认筛选条件 / Default Filters:"
echo "  • Max Utilisation: 40%"
echo "  • Min ONAN Rating: 1000 kVA"
echo "  • Density Radius: 5 km"
echo "  • Min Supplies in Radius: 3"
echo "  • Region: Cambridgeshire"
echo ""

# 构建查询参数
PARAMS="limit=500&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3&region=Cambridgeshire"

echo "发送API请求 / Sending API request..."
echo "  URL: $API_BASE/api/power-supplies?$PARAMS"
echo ""

RESULT=$(curl -s "$API_BASE/api/power-supplies?$PARAMS")
if [ $? -eq 0 ]; then
    # 检查返回的JSON
    SUCCESS=$(echo "$RESULT" | grep -o '"success":[^,]*' | grep -o '[^:]*$')
    COUNT=$(echo "$RESULT" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    
    if [ "$SUCCESS" = "true" ]; then
        echo "✅ API请求成功 / API request successful"
        echo "   返回站点数 / Sites returned: $COUNT"
        
        if [ -n "$COUNT" ] && [ "$COUNT" -gt 0 ]; then
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ 测试通过！/ Test Passed!"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "Cambridgeshire区域有 $COUNT 个站点通过默认筛选"
            echo "Cambridgeshire region has $COUNT sites passing default filters"
            echo ""
            
            # 显示前3个站点的示例数据
            echo "示例站点数据 / Sample Site Data (first 3):"
            echo "$RESULT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success') and data.get('data'):
        sites = data['data'][:3]
        for i, site in enumerate(sites, 1):
            print(f\"  {i}. {site.get('siteName', 'N/A')} - {site.get('town', 'N/A')}\")
            print(f\"     Utilisation: {site.get('utilisationBandPercent', 'N/A')}%\")
            print(f\"     ONAN: {site.get('onanRatingKva', 'N/A')} kVA\")
            print(f\"     Coordinates: ({site.get('lat', 'N/A')}, {site.get('lng', 'N/A')})\")
            print(f\"     Neighbours: {site.get('neighbourCountWithin5Km', 0)}\")
            print()
except Exception as e:
    print(f\"  Error parsing JSON: {e}\")
" 2>/dev/null || echo "  (无法解析JSON / Cannot parse JSON)"
        else
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "⚠️  警告：没有站点通过筛选 / Warning: No sites pass filters"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "可能的原因 / Possible reasons:"
            echo "  1. 筛选条件太严格 / Filters too strict"
            echo "  2. Density Radius (5km) 和 Min Supplies (3) 要求太高"
            echo "  3. 建议尝试放宽筛选条件 / Try relaxing filters:"
            echo "     • 增加 Density Radius 到 10km"
            echo "     • 减少 Min Supplies 到 1"
        fi
    else
        echo "❌ API请求失败 / API request failed"
        echo "   Response: $RESULT"
    fi
else
    echo "❌ 无法发送API请求 / Cannot send API request"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 5: 测试放宽筛选条件 / Step 5: Test Relaxed Filters"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "尝试放宽筛选条件以查看是否有更多站点 / Trying relaxed filters..."
PARAMS_RELAXED="limit=500&utilisationBandMax=40&onanRatingMin=1000&densityRadius=10&minSupplies=1&region=Cambridgeshire"
RESULT_RELAXED=$(curl -s "$API_BASE/api/power-supplies?$PARAMS_RELAXED")
COUNT_RELAXED=$(echo "$RESULT_RELAXED" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ -n "$COUNT_RELAXED" ] && [ "$COUNT_RELAXED" -gt 0 ]; then
    echo "✅ 放宽筛选后找到 $COUNT_RELAXED 个站点"
    echo "   Relaxed filters (10km radius, 1 min supply) found $COUNT_RELAXED sites"
else
    echo "⚠️  即使放宽筛选条件，仍然没有站点"
    echo "   Even with relaxed filters, no sites found"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║  ✅ 测试完成 / Test Complete                                  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
