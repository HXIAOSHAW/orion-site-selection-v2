# ✅ 简化版本 (v2) 已启动！

## 🌐 访问地址

### 主应用
```
http://localhost:8080
```
**密码**: `EdgeNebula2026`

### 直接访问各页面

- **Dashboard**: http://localhost:8080
- **Site List**: http://localhost:8080 (点击左侧菜单)
- **Power Analysis**: http://localhost:8080 (点击左侧菜单)
- **Site Map**: http://localhost:8080 (点击左侧菜单)

## 📊 服务状态

- ✅ **后端 (Backend)**: 运行在 Port 3000
- ✅ **前端 (Frontend)**: 运行在 Port 8080

## 🧪 测试步骤

1. **打开浏览器**
   ```
   http://localhost:8080
   ```

2. **输入密码**
   ```
   EdgeNebula2026
   ```

3. **查看 Dashboard**
   - 应显示统计数据：Total Sites, Valid Candidates等
   - 应显示区域分布图表

4. **测试 Site List**
   - 点击左侧 "Site List"
   - 应显示站点列表
   - 尝试搜索功能

5. **测试 Power Analysis**
   - 点击左侧 "Power Analysis"
   - 地图应流畅加载（无闪烁）
   - 标记应正确显示
   - 搜索功能应正常工作

6. **测试 Site Map**
   - 点击左侧 "Site Map"
   - 地图应正确显示
   - 可以切换回其他页面再返回

## 🔄 重启服务

如果需要重启，使用一键脚本：

```bash
# 停止服务
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# 重新启动
cd /Users/xh/Orion/orion-site-selection-v2
./start.sh
```

## 🆚 版本对比

### 简化版 v2 (当前运行)
- ✅ 代码简洁（单文件实现）
- ✅ 启动快速（一键启动）
- ✅ 易于维护
- ✅ 地图稳定（无闪烁）
- 📍 位置: `/Users/xh/Orion/orion-site-selection-v2/`
- 🌐 端口: 8080

### 完整版 (已优化)
- ✅ 功能完整（多模块）
- ✅ 地图已优化（基于v2经验）
- ✅ 更多功能
- 📍 位置: `/Users/xh/Orion/orion-site-selection-frontend/`
- 🌐 端口: 8080 (需要先停止v2)

## 🔀 切换版本

### 从 v2 切换到完整版

```bash
# 1. 停止 v2
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# 2. 启动完整版后端
cd /Users/xh/Orion/orion-site-selection-frontend/backend
npm start &

# 3. 启动完整版前端
cd /Users/xh/Orion/orion-site-selection-frontend
python3 -m http.server 8080 &
```

### 从完整版切换回 v2

```bash
# 1. 停止完整版
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# 2. 启动 v2
cd /Users/xh/Orion/orion-site-selection-v2
./start.sh
```

## 🛠️ 故障排除

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3000
lsof -i :8080

# 停止进程
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### 后端数据不显示

```bash
# 测试后端 API
curl http://localhost:3000/api/power-supplies/stats

# 如果失败，检查 Excel 文件路径
# 编辑 backend/server.js
```

### 前端无法访问

```bash
# 尝试其他端口
cd /Users/xh/Orion/orion-site-selection-v2/frontend
python3 -m http.server 8888
# 然后访问 http://localhost:8888
```

## 📚 相关文档

- **快速启动**: `QUICKSTART.md`
- **测试指南**: `TEST.md`
- **备份说明**: `BACKUP_README.md`
- **备份操作**: `BACKUP_INSTRUCTIONS.md`

## 💡 快速命令

```bash
# 检查服务状态
lsof -i :3000 -i :8080 | grep LISTEN

# 测试后端
curl http://localhost:3000/api/power-supplies/stats

# 停止所有服务
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# 启动简化版 v2
cd /Users/xh/Orion/orion-site-selection-v2 && ./start.sh

# 查看后端日志（如果需要）
tail -f /Users/xh/.cursor/projects/Users-xh-Orion/terminals/4.txt
```

---

**当前版本**: 简化版 v2
**启动时间**: $(date)
**状态**: ✅ 运行中




