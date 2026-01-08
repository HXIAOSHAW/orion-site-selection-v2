#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🧪 CB3 Postcode 检索测试                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "1️⃣ 测试后端 API..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESULT=$(curl -s 'http://localhost:3000/api/power-supplies/search/postcode/CB3')
COUNT=$(echo $RESULT | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

echo "API 响应:"
echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
echo ""
echo "找到站点数量: $COUNT"
echo ""

if [ "$COUNT" = "0" ]; then
    echo "❌ 测试失败: 未找到 CB3 站点"
    echo ""
    echo "🔍 检查服务器状态..."
    ps aux | grep "node.*server.js" | grep -v grep
    echo ""
    echo "⚠️  后端服务器需要重启才能加载新代码"
else
    echo "✅ 测试成功: 找到 $COUNT 个 CB3 站点"
fi

