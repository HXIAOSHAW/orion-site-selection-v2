# 🔧 Railway部署修复指南

## 问题
部署失败，错误：`npm: command not found`

## 原因
Railway需要知道：
1. 这是一个Node.js项目
2. 工作目录是 `backend`
3. Node.js版本要求

## 已修复的配置

✅ 已添加以下文件：
- `backend/package.json` - 添加了 `engines` 字段指定Node.js版本
- `backend/.nvmrc` - 指定Node.js 18
- `backend/nixpacks.toml` - Nixpacks配置，明确指定Node.js和npm
- 更新了 `railway.json` 和 `railway.toml`

## 重要：Railway项目设置

**关键步骤**：你需要在Railway项目设置中指定Root Directory！

### 在Railway中设置Root Directory：

1. 进入Railway项目
2. 点击 "Settings" 标签
3. 找到 "Root Directory" 设置
4. 设置为：`backend`
5. 保存设置
6. 重新部署

或者：

1. 删除当前的服务
2. 重新创建服务
3. 在创建时，选择 "Deploy from GitHub repo"
4. 选择仓库后，在配置页面：
   - **Root Directory**: 输入 `backend`
   - Railway会自动检测Node.js项目
5. 点击 "Deploy"

## 验证配置

部署成功后，你应该看到：
- ✅ Build阶段：`npm install` 成功
- ✅ Deploy阶段：服务启动
- ✅ 日志显示：`Server running on port XXXX`

## 如果仍然失败

### 方案1: 使用Dockerfile（最可靠）

创建 `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

然后在Railway中：
- Settings → Build → Builder: 选择 "Dockerfile"
- Root Directory: `backend`

### 方案2: 检查Railway日志

查看详细的构建日志，确认：
- Node.js是否正确安装
- npm命令是否可用
- 工作目录是否正确

## 测试部署

部署成功后，测试API：
```bash
curl https://your-app.up.railway.app/api/power-supplies/stats
```

应该返回JSON数据。



