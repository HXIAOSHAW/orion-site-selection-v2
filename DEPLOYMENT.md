# 部署说明 / Deployment Guide

## GitHub Pages 部署

### 方法1: 使用 GitHub Pages (推荐)

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `main` 分支和 `/docs` 目录作为源
3. 访问: `https://[username].github.io/orion-site-selection-v2/`

### 方法2: 使用 gh-pages 分支

```bash
# 创建 gh-pages 分支
git checkout -b gh-pages
git add frontend/
git commit -m "Deploy to gh-pages"
git push origin gh-pages
```

### 方法3: 使用 GitHub Actions (自动部署)

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
```

## 后端部署

后端需要单独部署到支持 Node.js 的服务器（如 Heroku, Vercel, Railway等）。

### 环境变量

后端需要配置以下环境变量（如果需要）:
- `PORT`: 服务器端口（默认: 3000）
- `EXCEL_FILE_PATH`: Excel文件路径（已在代码中配置）

### 本地运行

```bash
cd backend
npm install
npm start
```

## 前端配置

前端需要配置后端API地址。在 `frontend/app.js` 中:

```javascript
const CONFIG = {
  API_BASE: 'http://localhost:3000'  // 本地开发
  // API_BASE: 'https://your-backend-url.com'  // 生产环境
};
```

## 注意事项

1. 前端和后端需要分别部署
2. 确保后端CORS配置允许前端域名访问
3. Excel文件需要放在后端可访问的位置
4. 如果使用GitHub Pages，需要将后端部署到其他服务器

