# 📤 上传Excel文件到Railway指南

## 方法1: 使用Railway Volume（推荐）⭐

### 步骤：

1. **在Railway中创建Volume**
   - 进入Railway项目
   - 点击 "New" → "Volume"
   - 给Volume命名，例如：`excel-data`
   - 点击 "Create"

2. **将Volume挂载到服务**
   - 点击你的服务（"web"）
   - 点击 "Settings" 标签
   - 找到 "Volumes" 部分
   - 点击 "Mount Volume"
   - 选择刚创建的Volume
   - **Mount Path**: 设置为 `/app/data`
   - 保存

3. **上传Excel文件**
   - 在Railway控制台，找到Volume
   - 点击Volume名称
   - 使用Railway CLI上传文件，或者：
   - 在本地使用Railway CLI：
     ```bash
     # 安装Railway CLI（如果还没安装）
     npm install -g @railway/cli
     
     # 登录
     railway login
     
     # 链接到项目
     railway link
     
     # 上传文件到Volume
     railway run --volume excel-data:/app/data -- sh -c "echo 'Uploading file...'"
     ```

4. **更新后端代码使用Volume路径**
   - 在Railway环境变量中设置：
     ```
     EXCEL_FILE_PATH=/app/data/ukpn-secondary-sites.xlsx
     ```

---

## 方法2: 将Excel文件放在代码仓库中（简单）⭐

### 步骤：

1. **复制Excel文件到backend目录**
   ```bash
   cd /Users/xh/Orion/orion-site-selection-v2
   cp /path/to/ukpn-secondary-sites.xlsx backend/data/
   ```

2. **创建data目录（如果不存在）**
   ```bash
   mkdir -p backend/data
   ```

3. **更新.gitignore（如果文件太大）**
   - 如果文件小于100MB，可以直接提交
   - 如果文件很大，考虑使用Git LFS

4. **提交并推送**
   ```bash
   git add backend/data/ukpn-secondary-sites.xlsx
   git commit -m "Add Excel data file"
   git push origin main
   ```

5. **更新后端代码**
   - 修改 `backend/server.js` 中的路径：
     ```javascript
     const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH || 
       path.join(__dirname, 'data/ukpn-secondary-sites.xlsx');
     ```

6. **Railway会自动重新部署**
   - Railway会检测到代码更改
   - 自动重新部署
   - Excel文件会包含在Docker镜像中

---

## 方法3: 使用环境变量指向外部存储（高级）

如果Excel文件很大或需要频繁更新：

1. **上传到云存储**
   - AWS S3
   - Google Cloud Storage
   - 或其他对象存储

2. **在Railway中设置环境变量**
   ```
   EXCEL_FILE_URL=https://your-storage.com/path/to/file.xlsx
   ```

3. **修改后端代码下载文件**
   - 在启动时从URL下载Excel文件
   - 保存到临时目录
   - 使用临时文件路径

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **方法2: 代码仓库** | 简单，自动同步 | 文件大小限制 | 文件 < 100MB ⭐ |
| **方法1: Volume** | 灵活，可更新 | 需要手动上传 | 文件很大或需要频繁更新 |
| **方法3: 云存储** | 最灵活 | 需要额外服务 | 生产环境，大文件 |

---

## 快速操作（推荐方法2）

如果Excel文件不太大（<100MB），最简单的方法是直接放在代码仓库中：

```bash
# 1. 创建data目录
cd /Users/xh/Orion/orion-site-selection-v2/backend
mkdir -p data

# 2. 复制Excel文件
cp /Users/xh/Orion/orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx data/

# 3. 更新server.js中的路径（如果需要）
# 路径应该已经是相对路径了

# 4. 提交并推送
cd /Users/xh/Orion/orion-site-selection-v2
git add backend/data/
git commit -m "Add Excel data file to backend"
git push origin main

# 5. Railway会自动重新部署
```

---

## 验证

部署完成后，测试API：
```bash
curl https://web-production-2c087.up.railway.app/api/power-supplies/stats
```

应该返回JSON数据而不是"Excel file not found"错误。



