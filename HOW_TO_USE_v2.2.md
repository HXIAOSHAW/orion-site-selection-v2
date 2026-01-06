# 🎯 如何使用 Orion Site Selection v2.2

## 🚀 快速启动指南

### 启动本地服务 (端口 8888)

**方式1：一键启动（推荐）**
```bash
cd /Users/xh/Orion/orion-site-selection-v2/backend && nohup node server.js > /dev/null 2>&1 & cd ../frontend && nohup python3 -m http.server 8888 > /dev/null 2>&1 & echo "✅ 服务已启动！"
```

**方式2：分步启动**
```bash
# 步骤1: 启动后端
cd /Users/xh/Orion/orion-site-selection-v2/backend
node server.js &

# 步骤2: 启动前端
cd /Users/xh/Orion/orion-site-selection-v2/frontend
python3 -m http.server 8888 &
```

### 访问地址
- **本地开发**: http://localhost:8888
- **GitHub Pages**: https://hxiaoshaw.github.io/orion-site-selection-v2/
- **密码**: `EdgeNebula2026`

### 停止服务
```bash
pkill -f "node server.js"
pkill -f "http.server 8888"
```

---

## ⚡ 新功能：Power Analysis with Filters

### 什么是新功能？
v2.2 版本将 **Selection Criteria（选择标准）** 整合到了 **Power Analysis（电力分析）** 页面，让您在一个界面就能：
- 🎚️ 调整筛选参数
- 🗺️ 查看地图
- 📊 实时看到筛选结果

### 如何使用？

#### 1️⃣ 进入页面
1. 打开 http://localhost:8888
2. 输入密码: `EdgeNebula2026`
3. 点击左侧菜单 **⚡ Power Analysis**

#### 2️⃣ 调整筛选参数

**可用的筛选条件：**

| 参数 | 说明 | 范围 | 默认值 |
|------|------|------|--------|
| **Max Utilisation** | 最大使用率 | 0-100% | 40% |
| **Min ONAN Rating** | 最小变压器额定功率 | 0-5000 kVA | 1000 |
| **Density Radius** | 密度搜索半径 | 1-50 km | 5 |
| **Min Supplies** | 半径内最少站点数 | 1-20 | 3 |

**如何调整：**
- 🎚️ 拖动滑块
- 👀 实时查看参数值变化
- 📊 观察右上角的匹配站点数量

#### 3️⃣ 应用筛选

点击按钮：
- 🔍 **Apply Filters to Map** - 应用筛选到地图
- 🔄 **Reset All** - 恢复默认设置
- 💾 **Save Settings** - 保存设置供下次使用

#### 4️⃣ 查看结果

**地图标记颜色：**
- 🟢 **绿色** = 低使用率站点（推荐）
- 🔴 **红色** = 高使用率站点

**点击标记查看详情：**
- 站点名称
- 地址
- 使用率百分比
- ONAN 额定功率
- GPS 坐标

#### 5️⃣ 折叠/展开面板

点击筛选面板标题栏可以折叠/展开，节省屏幕空间！

---

## 📋 完整功能列表

### 7 个页面

| 页面 | 功能 | 状态 |
|------|------|------|
| **📊 Dashboard** | 统计概览 + ECharts 图表 | ✅ |
| **📋 Site List** | 站点列表 + 高级筛选 | ✅ |
| **⚡ Power Analysis** | 地图 + 实时筛选 | ✅ **NEW!** |
| **🗺️ Site Map** | 交互式地图 | ✅ |
| **⚖️ Site Compare** | 站点对比 | 🚧 |
| **⚙️ Selection Criteria** | 参数配置 | ✅ |
| **📈 Reports** | 报告生成 | 🚧 |

---

## 🎯 使用场景示例

### 场景1：寻找低使用率站点
1. 打开 Power Analysis
2. 将 **Max Utilisation** 滑块设置为 30%
3. 将 **Min ONAN Rating** 设置为 1500 kVA
4. 点击 **Apply Filters**
5. 地图上只显示符合条件的站点（绿色标记）

### 场景2：高容量站点分析
1. 将 **Min ONAN Rating** 设置为 3000 kVA
2. 将 **Max Utilisation** 设置为 60%
3. 点击 **Apply Filters**
4. 查看高容量、低使用率的优质站点

### 场景3：密度区域筛选
1. 将 **Density Radius** 设置为 10 km
2. 将 **Min Supplies** 设置为 5
3. 点击 **Apply Filters**
4. 找到周边站点密集的区域

---

## 💡 使用技巧

### 1. 缓存机制
- 首次加载需要 1-2 秒获取数据
- 后续筛选只需 0.3-0.5 秒（使用缓存）
- 刷新页面会清除缓存

### 2. 性能优化
- 地图最多显示 100 个标记
- 使用单一 InfoWindow 提升性能
- 批量渲染标记避免卡顿

### 3. 快捷操作
- **折叠面板**: 节省屏幕空间
- **保存设置**: 下次打开自动加载
- **重置筛选**: 一键恢复默认

### 4. 浏览器推荐
- ✅ Chrome (推荐)
- ✅ Safari
- ✅ Firefox
- ✅ Edge

---

## 🛠️ 故障排查

### 问题1：地图不显示
**解决方案：**
1. 检查 Google Maps API Key 是否有效
2. 打开浏览器控制台查看错误信息
3. 确保网络连接正常
4. 清除浏览器缓存后重试

### 问题2：后端连接失败
**解决方案：**
1. 确认后端服务正在运行
   ```bash
   lsof -i:3000
   ```
2. 如果未运行，启动后端
   ```bash
   cd /Users/xh/Orion/orion-site-selection-v2/backend
   node server.js &
   ```

### 问题3：筛选无效果
**解决方案：**
1. 点击 **Apply Filters to Map** 按钮
2. 检查筛选条件是否过于严格
3. 尝试 **Reset All** 重置后再试
4. 刷新页面重新加载

### 问题4：前端无法访问
**解决方案：**
1. 确认前端服务正在运行
   ```bash
   lsof -i:8888
   ```
2. 如果未运行，启动前端
   ```bash
   cd /Users/xh/Orion/orion-site-selection-v2/frontend
   python3 -m http.server 8888 &
   ```

---

## 📊 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + R` | 刷新页面 |
| `Ctrl + +` | 放大地图 |
| `Ctrl + -` | 缩小地图 |
| `Esc` | 关闭 InfoWindow |

---

## 🔗 相关链接

### 文档
- [POWER_ANALYSIS_UPGRADE.md](POWER_ANALYSIS_UPGRADE.md) - 升级详情
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - 性能优化
- [README.md](README.md) - 项目说明

### 在线资源
- **GitHub 仓库**: https://github.com/HXIAOSHAW/orion-site-selection-v2
- **在线演示**: https://hxiaoshaw.github.io/orion-site-selection-v2/
- **问题反馈**: GitHub Issues

---

## 📈 版本历史

### v2.2 - Integrated Filters (2026-01-03) ⭐ 当前版本
- ✨ Selection Criteria 整合到 Power Analysis
- 🎚️ 滑块控件替代输入框
- 📊 实时显示筛选计数
- ⚡ 一键应用/重置筛选

### v2.1 - Optimized (2026-01-03)
- 🚀 性能优化（速度提升 60-90%）
- 💾 内存优化（减少 70%）
- 🔧 修复页面切换地图丢失

### v2.0 - Enhanced (2026-01-02)
- 🎨 完整 UI 重新设计
- 📊 Dashboard 图表
- 🗺️ Google Maps 集成

### v1.0 - Simple (2026-01-02)
- 🎯 基础功能
- 📋 Site List
- ⚡ Power Analysis

---

## 🎉 开始使用！

### 最快上手方式

```bash
# 一键启动
cd /Users/xh/Orion/orion-site-selection-v2/backend && nohup node server.js > /dev/null 2>&1 & cd ../frontend && nohup python3 -m http.server 8888 > /dev/null 2>&1 &

# 访问
open http://localhost:8888

# 密码
EdgeNebula2026
```

**然后：**
1. 点击 **⚡ Power Analysis**
2. 拖动滑块调整筛选
3. 点击 **🔍 Apply Filters**
4. 🎉 享受全新的筛选体验！

---

## 💬 需要帮助？

**常见问题：**
- 查看本文档的"故障排查"部分
- 阅读 [POWER_ANALYSIS_UPGRADE.md](POWER_ANALYSIS_UPGRADE.md)
- 查看浏览器控制台错误信息

**联系方式：**
- GitHub Issues
- 项目文档

---

**🌟 EdgeNebula Orion - 让站点选择更智能、更高效！**

*Connected Always* 🚀



