#!/bin/bash

API_BASE="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  调试后端筛选逻辑 / Debug Backend Filter Logic                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 1: 检查后端原始数据（无筛选）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT_RAW=$(curl -s "$API_BASE/api/power-supplies?limit=5&region=Cambridgeshire")
echo "原始响应（前500字符）:"
echo "$RESULT_RAW" | head -c 500
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 2: 仅区域筛选，检查数据字段"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT_REGION=$(curl -s "$API_BASE/api/power-supplies?limit=10&region=Cambridgeshire")
echo "$RESULT_REGION" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success') and data.get('data'):
        sites = data['data']
        print(f"返回站点数: {len(sites)}")
        print(f"总计数: {data.get('count', 0)}")
        if sites:
            print("\n前3个站点的字段:")
            for i, site in enumerate(sites[:3], 1):
                print(f"\n站点 {i}:")
                for key, value in site.items():
                    if key in ['utilisationBandPercent', 'utilisation', 'onanRatingKva', 'onanRating', 'localAuthority', 'region']:
                        print(f"  {key}: {value}")
except Exception as e:
    print(f"错误: {e}")
    print(sys.stdin.read())
PYTHON
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 3: 统计满足条件的站点数（手动计算）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT_ALL=$(curl -s "$API_BASE/api/power-supplies?limit=10000&region=Cambridgeshire")
echo "$RESULT_ALL" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success') and data.get('data'):
        sites = data['data']
        print(f"Cambridgeshire总站点数: {len(sites)}")
        
        # 检查字段名称
        if sites:
            sample = sites[0]
            util_key = None
            onan_key = None
            for key in sample.keys():
                if 'util' in key.lower():
                    util_key = key
                if 'onan' in key.lower():
                    onan_key = key
            
            print(f"\n检测到的字段名称:")
            print(f"  Utilisation字段: {util_key}")
            print(f"  ONAN字段: {onan_key}")
            
            # 统计满足条件的站点
            count_util_40 = 0
            count_onan_1000 = 0
            count_both = 0
            
            for site in sites:
                util = site.get(util_key) if util_key else None
                onan = site.get(onan_key) if onan_key else None
                
                if util is not None and util <= 40:
                    count_util_40 += 1
                if onan is not None and onan >= 1000:
                    count_onan_1000 += 1
                if util is not None and util <= 40 and onan is not None and onan >= 1000:
                    count_both += 1
            
            print(f"\n统计结果:")
            print(f"  Utilisation ≤ 40%: {count_util_40} 个站点")
            print(f"  ONAN ≥ 1000 kVA: {count_onan_1000} 个站点")
            print(f"  同时满足两个条件: {count_both} 个站点")
            
            # 显示前5个满足条件的站点
            print(f"\n前5个满足条件的站点:")
            shown = 0
            for site in sites:
                util = site.get(util_key) if util_key else None
                onan = site.get(onan_key) if onan_key else None
                if util is not None and util <= 40 and onan is not None and onan >= 1000:
                    shown += 1
                    print(f"  {shown}. {site.get('siteName', 'N/A')} - Util: {util}%, ONAN: {onan} kVA")
                    if shown >= 5:
                        break
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
PYTHON
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 4: 使用后端筛选API（Util ≤ 40%, ONAN ≥ 1000）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT_FILTERED=$(curl -s "$API_BASE/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000")
echo "$RESULT_FILTERED" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    print(f"API返回成功: {data.get('success', False)}")
    print(f"API返回站点数: {data.get('count', 0)}")
    
    if data.get('success') and data.get('data'):
        sites = data['data']
        print(f"实际数据数组长度: {len(sites)}")
        
        if sites:
            print("\n前5个站点详情:")
            for i, site in enumerate(sites[:5], 1):
                print(f"  {i}. {site.get('siteName', 'N/A')}")
                print(f"     Util: {site.get('utilisationBandPercent', 'N/A')}%")
                print(f"     ONAN: {site.get('onanRatingKva', 'N/A')} kVA")
                print(f"     Region: {site.get('region', 'N/A')}")
                print(f"     LocalAuthority: {site.get('localAuthority', 'N/A')}")
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
PYTHON
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 5: 检查后端筛选逻辑代码"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "检查server.js中的筛选逻辑..."
grep -A 20 "function applyFilters" /Users/xh/Orion/orion-site-selection-v2/backend/server.js | head -30
