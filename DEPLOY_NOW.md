# 🚀 立即部署后端 - 快速指南

## 方法1: Railway (推荐 - 最简单) ⭐

### 步骤：

1. **访问 Railway**
   - 打开浏览器: https://railway.app
   - 点击 "Start a New Project"
   - 使用 **GitHub** 账号登录

2. **连接仓库**
   - 选择 "Deploy from GitHub repo"
   - 找到并选择: `HXIAOSHAW/orion-site-selection-v2`
   - 点击仓库

3. **配置部署**
   - Railway会自动检测到 `railway.json` 配置文件
   - 它会自动：
     - 检测到 `backend` 目录
     - 运行 `npm install` 安装依赖
     - 运行 `npm start` 启动服务

4. **等待部署完成**
   - 通常需要 2-5 分钟
   - 在 Railway 控制台可以看到部署进度

5. **获取后端URL**
   - 部署完成后，Railway会提供一个URL
   - 点击 "Settings" → "Generate Domain"
   - 或者使用自动生成的URL，例如：
     `https://orion-site-selection-v2-production.up.railway.app`
   - **复制这个URL！**

6. **更新前端配置**
   ```bash
   cd /Users/xh/Orion/orion-site-selection-v2
   
   # 编辑 docs/app.js，找到第11行左右：
   #   : 'https://your-backend-url.com';
   # 替换为你的Railway URL
   
   # 然后提交并推送
   git add docs/app.js
   git commit -m "Connect frontend to Railway backend"
   git push origin main
   ```

---

## 方法2: Render (免费，简单)

### 步骤：

1. **访问 Render**
   - 打开: https://render.com
   - 使用GitHub账号登录

2. **创建Web Service**
   - 点击 "New +" → "Web Service"
   - 选择仓库: `HXIAOSHAW/orion-site-selection-v2`

3. **配置设置**
   - **Name**: `orion-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **部署并获取URL**
   - 点击 "Create Web Service"
   - 等待部署完成
   - URL格式: `https://orion-backend.onrender.com`

5. **更新前端配置**（同Railway步骤6）

---

## 方法3: 使用Railway CLI（命令行）

如果你已经安装了Railway CLI：

```bash
# 安装Railway CLI（如果还没安装）
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
cd /Users/xh/Orion/orion-site-selection-v2
railway init

# 部署
railway up

# 获取URL
railway domain
```

---

## 部署后检查清单

- [ ] 后端已部署并运行
- [ ] 获取了后端URL
- [ ] 测试后端API可以访问（见下方测试命令）
- [ ] 更新了 `docs/app.js` 中的后端URL
- [ ] 提交并推送了前端配置更改
- [ ] 等待GitHub Pages更新（1-2分钟）
- [ ] 测试前端页面可以加载数据

---

## 测试后端

部署完成后，测试后端是否正常工作：

```bash
# 替换 YOUR_BACKEND_URL 为你的实际URL
curl https://YOUR_BACKEND_URL/api/power-supplies/stats

# 应该返回JSON数据，例如：
# {"totalSites":12345,"regions":[...],...}
```

如果返回JSON数据，说明后端部署成功！

---

## 常见问题

### Q: Railway显示部署失败？
**A**: 检查：
1. 确保 `backend/package.json` 存在
2. 确保 `backend/server.js` 存在
3. 查看Railway日志中的错误信息

### Q: 后端部署成功但前端无法连接？
**A**: 检查：
1. 后端URL是否正确更新到 `docs/app.js`
2. 是否已提交并推送更改
3. 浏览器控制台是否有CORS错误

### Q: Excel文件未找到错误？
**A**: 这是正常的，如果Excel文件不在服务器上，后端会返回错误。你可以：
1. 上传Excel文件到服务器
2. 或者暂时忽略（前端可能仍能工作，只是没有数据）

---

## 下一步

部署完成后：
1. ✅ 后端运行在: `https://your-backend-url.com`
2. ✅ 前端运行在: `https://hxiaoshaw.github.io/orion-site-selection-v2/`
3. ✅ 两者已连接，系统完全可用！

**恭喜！部署完成！** 🎉



