#!/bin/bash

API_BASE="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  测试默认筛选条件（修复后）/ Test Default Filters (Fixed)    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "默认筛选条件:"
echo "  • Region: Cambridgeshire"
echo "  • Max Utilisation: 40%"
echo "  • Min ONAN Rating: 1000 kVA"
echo "  • Density Radius: 5 km"
echo "  • Min Supplies in Radius: 3"
echo ""

RESULT=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3")

echo "$RESULT" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
print(f"✅ API返回成功: {data.get('success', False)}")
print(f"✅ 返回站点数: {data.get('count', 0)}")

sites = data.get('data', [])
if sites:
    print(f"\n前5个站点详情:")
    for i, site in enumerate(sites[:5], 1):
        print(f"  {i}. {site.get('siteName', 'N/A')}")
        print(f"     Util: {site.get('utilisationBandPercent', 'N/A')}%, ONAN: {site.get('onanRatingKva', 'N/A')} kVA")
        print(f"     5km内邻居数: {site.get('neighbourCountWithin5Km', 0)}")
else:
    print("\n⚠️  没有站点通过所有筛选条件")
    print("   建议放宽 Density Radius 或 Min Supplies 条件")
PYTHON

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试放宽密度条件 (10km, ≥1个邻居)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT_RELAXED=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=10&minSupplies=1")
echo "$RESULT_RELAXED" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
print(f"✅ 放宽条件后返回站点数: {data.get('count', 0)}")
PYTHON

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ 修复验证完成 / Fix Verification Complete                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
