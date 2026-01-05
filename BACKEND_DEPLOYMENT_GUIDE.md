# 🚀 后端部署指南 - 让GitHub Pages前端连接后端

## 问题说明

GitHub Pages (https://hxiaoshaw.github.io/orion-site-selection-v2/) 只能托管静态文件，无法运行Node.js后端。需要将后端部署到支持Node.js的服务器。

## 快速部署方案（推荐）

### 方案1: Railway (最简单，推荐) ⭐

**优点**: 免费额度充足，自动部署，支持GitHub集成

#### 步骤：

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择仓库: `HXIAOSHAW/orion-site-selection-v2`

3. **配置部署**
   - Railway会自动检测到Node.js项目
   - 在设置中，将 **Root Directory** 设置为 `backend`
   - 确保 **Start Command** 为 `npm start`

4. **获取后端URL**
   - 部署完成后，Railway会提供一个URL，例如：
     `https://orion-backend-production.up.railway.app`
   - 复制这个URL

5. **更新前端配置**
   ```bash
   cd /Users/xh/Orion/orion-site-selection-v2
   
   # 编辑 docs/app.js，找到这一行（约第11行）：
   #   : 'https://your-backend-url.com';
   # 替换为你的Railway URL，例如：
   #   : 'https://orion-backend-production.up.railway.app';
   
   # 然后提交并推送
   git add docs/app.js frontend/app.js
   git commit -m "Update backend URL for production"
   git push origin main
   ```

6. **等待GitHub Pages更新**
   - 等待1-2分钟
   - 刷新 https://hxiaoshaw.github.io/orion-site-selection-v2/
   - 应该可以正常加载数据了！

---

### 方案2: Render (免费，简单)

**优点**: 免费套餐，自动部署

#### 步骤：

1. **访问 Render**
   - 打开 https://render.com
   - 使用GitHub账号登录

2. **创建Web Service**
   - 点击 "New +" → "Web Service"
   - 连接仓库: `HXIAOSHAW/orion-site-selection-v2`

3. **配置设置**
   - **Name**: `orion-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **部署并获取URL**
   - 点击 "Create Web Service"
   - 等待部署完成
   - 获取URL，例如: `https://orion-backend.onrender.com`

5. **更新前端配置**（同Railway步骤5）

---

### 方案3: Vercel (适合小项目)

**优点**: 快速部署，全球CDN

#### 步骤：

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd /Users/xh/Orion/orion-site-selection-v2/backend
vercel --prod

# 获取URL并更新前端配置
```

---

## 重要配置说明

### 1. Excel文件路径问题

**问题**: 后端代码中Excel文件路径指向本地文件系统，生产环境无法访问。

**解决方案**:

#### 选项A: 上传Excel文件到服务器（推荐）

如果使用Railway:
1. 在Railway项目中创建Volume
2. 上传Excel文件到Volume
3. 在环境变量中设置 `EXCEL_FILE_PATH`

如果使用Render:
1. 将Excel文件放在 `backend/data/` 目录
2. 更新 `server.js` 中的路径为相对路径

#### 选项B: 使用环境变量（推荐）

修改 `backend/server.js`，支持环境变量：

```javascript
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || 
  path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx');
```

然后在部署平台设置环境变量。

#### 选项C: 转换为数据库（长期方案）

1. 将Excel导出为CSV
2. 导入到PostgreSQL/MongoDB
3. 更新后端代码使用数据库

---

### 2. CORS配置

后端已配置CORS，允许以下域名访问：
- `https://hxiaoshaw.github.io`
- `https://*.github.io`
- `http://localhost:*`

如果使用自定义域名，需要在 `backend/server.js` 中添加你的域名。

---

### 3. 环境变量

后端支持以下环境变量：

```bash
PORT=3000                    # 端口（通常由平台自动设置）
NODE_ENV=production         # 环境
EXCEL_FILE_PATH=/path/to/file.xlsx  # Excel文件路径（可选）
```

---

## 测试部署

部署完成后，测试后端：

```bash
# 测试健康检查
curl https://your-backend-url.com/

# 测试API
curl https://your-backend-url.com/api/power-supplies/stats

# 应该返回JSON数据
```

---

## 更新前端配置

### 方法1: 直接编辑文件

编辑 `docs/app.js` 和 `frontend/app.js`，找到：

```javascript
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000'
  : 'https://your-backend-url.com'; // 更新这里
```

替换为你的后端URL。

### 方法2: 使用环境变量（高级）

可以在HTML中注入环境变量，但这需要构建步骤。

---

## 完整部署检查清单

- [ ] 后端已部署到Railway/Render/Vercel
- [ ] 获取了后端URL
- [ ] 更新了 `docs/app.js` 中的后端URL
- [ ] 更新了 `frontend/app.js` 中的后端URL（可选，用于本地开发）
- [ ] Excel文件已上传或路径已配置
- [ ] 测试后端API可以访问
- [ ] 提交并推送代码到GitHub
- [ ] 等待GitHub Pages更新
- [ ] 测试前端页面可以加载数据

---

## 故障排除

### 问题1: CORS错误

**错误信息**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解决方案**:
- 检查后端CORS配置是否包含你的前端域名
- 确保后端正在运行

### 问题2: 404 Not Found

**错误信息**: `Failed to fetch` 或 `404`

**解决方案**:
- 检查后端URL是否正确
- 检查后端是否正在运行
- 检查API路径是否正确 (`/api/power-supplies`)

### 问题3: Excel文件未找到

**错误信息**: `Excel file not found`

**解决方案**:
- 确保Excel文件已上传到服务器
- 检查文件路径是否正确
- 使用环境变量设置正确的路径

### 问题4: 前端显示"No Data"

**解决方案**:
1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 查看Network标签页，检查API请求是否成功
4. 检查后端日志

---

## 快速命令参考

```bash
# 1. 更新前端配置
cd /Users/xh/Orion/orion-site-selection-v2
# 编辑 docs/app.js，更新后端URL

# 2. 提交更改
git add docs/app.js frontend/app.js
git commit -m "Connect frontend to production backend"
git push origin main

# 3. 测试后端（替换为你的URL）
curl https://your-backend-url.com/api/power-supplies/stats
```

---

## 下一步

部署完成后，你的系统将完全可用：
- ✅ 前端: https://hxiaoshaw.github.io/orion-site-selection-v2/
- ✅ 后端: https://your-backend-url.com
- ✅ 数据: 实时从后端API加载

**恭喜！你的系统已完全部署！** 🎉

