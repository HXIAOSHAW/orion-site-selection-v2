# 部署到GitHub Pages指南

## ✅ 已完成的操作

1. ✅ 所有代码已推送到GitHub (main分支)
2. ✅ 已创建标签 v2.5.12
3. ✅ 前端文件已复制到 `/docs` 目录（用于GitHub Pages）

## 📋 下一步操作

### 1. 启用GitHub Pages

1. 访问GitHub仓库: `https://github.com/HXIAOSHAW/orion-site-selection-v2`
2. 点击 **Settings** (设置)
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分:
   - 选择 **Deploy from a branch**
   - Branch: 选择 **main**
   - Folder: 选择 **/docs**
5. 点击 **Save**

### 2. 访问网页

等待几分钟后，访问:
```
https://HXIAOSHAW.github.io/orion-site-selection-v2/
```

### 3. 后端部署

⚠️ **重要**: 前端需要后端API才能正常工作。

#### 选项A: 使用Railway (推荐)

1. 访问 https://railway.app
2. 创建新项目
3. 连接GitHub仓库
4. 选择 `backend` 目录
5. Railway会自动检测Node.js并部署

#### 选项B: 使用Heroku

```bash
cd backend
heroku create your-app-name
git subtree push --prefix backend heroku main
```

#### 选项C: 使用Vercel

1. 访问 https://vercel.com
2. 导入GitHub仓库
3. 选择 `backend` 目录
4. 配置构建命令: `npm install && npm start`

### 4. 更新前端API地址

部署后端后，更新 `docs/app.js` 中的API地址:

```javascript
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'
  : 'https://your-backend-url.railway.app'; // 更新为实际后端地址
```

然后重新提交并推送:

```bash
git add docs/app.js
git commit -m "Update API URL for production"
git push origin main
```

## 🔧 本地测试

### 启动后端
```bash
cd backend
npm install
npm start
```

### 启动前端
```bash
cd frontend
python3 -m http.server 8888
```

访问: http://localhost:8888

## 📝 注意事项

1. GitHub Pages只支持静态文件，不能运行Node.js后端
2. 后端必须部署到支持Node.js的服务器
3. 确保后端CORS配置允许GitHub Pages域名访问
4. Excel文件需要放在后端可访问的位置

## 🐛 故障排除

### 前端无法加载
- 检查GitHub Pages是否已启用
- 检查 `/docs` 目录是否有 `index.html`
- 查看浏览器控制台的错误信息

### API请求失败
- 检查后端是否已部署并运行
- 检查前端API地址是否正确
- 检查后端CORS配置

### 地图不显示
- 检查Google Maps API密钥是否有效
- 检查浏览器控制台的错误信息

