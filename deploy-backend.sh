#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 后端部署助手                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "这个脚本将帮助你部署后端到Railway"
echo ""
echo "选项1: 使用Railway Web界面（推荐）"
echo "  1. 访问: https://railway.app"
echo "  2. 使用GitHub登录"
echo "  3. 选择 'Deploy from GitHub repo'"
echo "  4. 选择: HXIAOSHAW/orion-site-selection-v2"
echo "  5. Railway会自动部署"
echo ""
echo "选项2: 使用Railway CLI（需要先登录）"
echo "  运行: npx @railway/cli login"
echo "  然后: npx @railway/cli up"
echo ""
echo "按任意键打开Railway网站..."
read -n 1
open https://railway.app/new

