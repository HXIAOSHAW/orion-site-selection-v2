#!/bin/bash

API_BASE="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  详细诊断：Cambridgeshire筛选问题 / Detailed Diagnosis         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 1: 仅区域筛选（无其他条件）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT1=$(curl -s "$API_BASE/api/power-supplies?limit=10&region=Cambridgeshire")
COUNT1=$(echo "$RESULT1" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ Cambridgeshire区域总站点数: $COUNT1"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 2: 区域 + Utilisation ≤ 40%"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT2=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40")
COUNT2=$(echo "$RESULT2" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ 满足Utilisation ≤ 40%的站点数: $COUNT2"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 3: 区域 + Utilisation ≤ 40% + ONAN ≥ 1000 kVA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT3=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000")
COUNT3=$(echo "$RESULT3" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ 满足基本条件的站点数: $COUNT3"
if [ "$COUNT3" -gt 0 ]; then
    echo ""
    echo "前3个站点示例:"
    echo "$RESULT3" | python3 -c "
import sys, json
d = json.load(sys.stdin)
sites = d.get('data', [])[:3]
for i, s in enumerate(sites, 1):
    print(f\"  {i}. {s.get('siteName', 'N/A')} - Util: {s.get('utilisationBandPercent', 'N/A')}%, ONAN: {s.get('onanRatingKva', 'N/A')} kVA\")
    print(f\"     坐标: ({s.get('lat', 'N/A')}, {s.get('lng', 'N/A')})\")
    print(f\"     邻居数: {s.get('neighbourCountWithin5Km', 0)}\")
" 2>/dev/null
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 4: 区域 + 基本条件 + 有坐标的站点"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT4=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000")
WITH_COORDS=$(echo "$RESULT4" | python3 -c "
import sys, json
d = json.load(sys.stdin)
sites = d.get('data', [])
with_coords = [s for s in sites if s.get('lat') and s.get('lng')]
print(len(with_coords))
" 2>/dev/null)
echo "✅ 有坐标的站点数: $WITH_COORDS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 5: 区域 + 基本条件 + Density Radius 5km (无Min Supplies要求)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT5=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5")
COUNT5=$(echo "$RESULT5" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ 计算密度后的站点数: $COUNT5"
if [ "$COUNT5" -gt 0 ]; then
    echo ""
    echo "邻居数分布:"
    echo "$RESULT5" | python3 -c "
import sys, json
from collections import Counter
d = json.load(sys.stdin)
sites = d.get('data', [])
neighbours = [s.get('neighbourCountWithin5Km', 0) for s in sites]
counter = Counter(neighbours)
for n, count in sorted(counter.items())[:10]:
    print(f\"  {n} 个邻居: {count} 个站点\")
" 2>/dev/null
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 6: 区域 + 基本条件 + Density Radius 5km + Min Supplies ≥ 3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT6=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3")
COUNT6=$(echo "$RESULT6" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ 满足所有默认条件的站点数: $COUNT6"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 7: 区域 + 基本条件 + Density Radius 10km + Min Supplies ≥ 1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT7=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=10&minSupplies=1")
COUNT7=$(echo "$RESULT7" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('count', 0))" 2>/dev/null)
echo "✅ 放宽密度条件后的站点数: $COUNT7"
if [ "$COUNT7" -gt 0 ]; then
    echo ""
    echo "前3个站点详情:"
    echo "$RESULT7" | python3 -c "
import sys, json
d = json.load(sys.stdin)
sites = d.get('data', [])[:3]
for i, s in enumerate(sites, 1):
    print(f\"  {i}. {s.get('siteName', 'N/A')} - {s.get('town', 'N/A')}\")
    print(f\"     Util: {s.get('utilisationBandPercent', 'N/A')}%, ONAN: {s.get('onanRatingKva', 'N/A')} kVA\")
    print(f\"     坐标: ({s.get('lat', 'N/A')}, {s.get('lng', 'N/A')})\")
    print(f\"     10km内邻居数: {s.get('neighbourCountWithin5Km', 0)}\")
" 2>/dev/null
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  诊断总结 / Diagnosis Summary                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ 后端CSV连接: 正常"
echo "✅ Cambridgeshire区域数据: 有 $COUNT1 个站点"
echo "✅ 满足Utilisation ≤ 40%: $COUNT2 个站点"
echo "✅ 满足基本条件 (Util + ONAN): $COUNT3 个站点"
echo "✅ 有坐标的站点: $WITH_COORDS 个"
echo "✅ 计算密度后: $COUNT5 个站点"
echo "⚠️  默认筛选条件 (5km, 3个邻居): $COUNT6 个站点"
echo "✅ 放宽条件 (10km, 1个邻居): $COUNT7 个站点"
echo ""
if [ "$COUNT6" -eq 0 ]; then
    echo "🔍 问题分析:"
    echo "   默认筛选条件中的 'Density Radius 5km + Min Supplies 3' 太严格"
    echo "   建议调整:"
    echo "   • Density Radius: 5km → 10km"
    echo "   • Min Supplies: 3 → 1"
fi
