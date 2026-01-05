# Power Analysis 筛选逻辑优化 v2.5.4

## 📝 更新日期
2026-01-04

## 🎯 更新内容

### 1. 地图自动缩放 (Auto Map Zoom)
- 应用筛选后自动缩放地图
- 所有符合条件的站点都显示在视野内
- 智能调整缩放级别（最大zoom = 15）

### 2. 地图标记自动编号 (Marker Numbering)
- 勾选 "🏷️ Labels" 显示标记编号
- 编号基于当前排序顺序
- 更大的标记圆圈以容纳数字
- 白色粗体数字，清晰可见

### 3. 编号与排序同步 (Synchronized Numbering)
- Site List 和 Map 编号完全同步
- 改变排序时，编号自动更新
- 默认按 Max Utilisation (低到高) 排序
- 支持三种排序方式切换

## 📊 筛选逻辑流程

### 步骤 1: 设置筛选条件
- Max Utilisation: 40% (默认)
- Min ONAN Rating: 1000 kVA (默认)
- Density Radius: 5 km (默认)
- Min Supplies in Radius: 3 (默认)
- Region/Area: 选择区域 (可选)
- Search: 搜索站点名称/地址 (可选)

### 步骤 2: 点击 "Apply Filters to Map"
- 从后端CSV数据过滤站点
- 应用所有筛选条件

### 步骤 3: 地图自动更新
- 清除旧标记
- 创建新标记（符合筛选条件）
- **自动缩放显示所有站点**
- 如果 Labels 已勾选，显示编号

### 步骤 4: 显示筛选后的站点列表
- 列表显示在地图下方
- 默认按 Max Utilisation 排序
- 编号从 1 开始

### 步骤 5: 改变排序 (可选)
- 选择排序方式:
  - Max Utilisation (Low to High) - 默认
  - Min ONAN Rating (Low to High)
  - Supplies in Radius (High to Low)
- 列表立即重新排序
- **如果 Labels 已勾选，地图标记也重新编号**

## 🏷️ Labels 功能详解

### 启用 Labels
1. 应用筛选后，地图显示符合条件的站点
2. 勾选地图控制区的 "🏷️ Labels" 复选框
3. 地图标记自动添加编号
4. 标记变大以容纳数字

### 编号规则
- **编号从 1 开始**
- **基于当前排序顺序**

**默认排序: Max Utilisation (低到高)**
- #1 = 利用率最低的站点
- #2 = 利用率第二低的站点
- ...

**ONAN 排序:**
- #1 = ONAN容量最小的站点
- ...

**Supplies 排序:**
- #1 = 周边站点数最多的站点
- ...

### 动态更新
- 改变排序方式时，编号自动更新
- Site List 和 Map 编号始终同步
- 标记颜色保持不变（绿色/红色基于利用率）

## 🎨 视觉效果

### 标记样式

**无编号时:**
- 小圆点 (scale: 5)
- 绿色: 利用率 ≤40%
- 红色: 利用率 >40%
- 白色边框

**有编号时:**
- 大圆点 (scale: 8)
- 白色粗体数字
- 字体大小: 12px
- 高编号标记显示在上层

### 地图缩放
- 自动包含所有筛选结果
- 最大缩放级别: 15 (防止过度放大)
- 智能边界调整

## 🔧 技术实现

### 新增变量
```javascript
let showMarkerLabels = false;
let currentSortBy = 'utilisation_asc'; // Track current sort order
```

### 新增函数
```javascript
// Helper function to sort sites based on current criteria
function getSortedSites(sites) {
  if (!sites || sites.length === 0) return [];
  
  const sitesWithData = sites.map(site => ({
    ...site,
    nearbySupplies: calculateNearbySupplies(site)
  }));
  
  switch(currentSortBy) {
    case 'utilisation_asc':
      return sitesWithData.sort((a, b) => (a.utilisation || 0) - (b.utilisation || 0));
    case 'onan_asc':
      return sitesWithData.sort((a, b) => (a.onanRating || 0) - (b.onanRating || 0));
    case 'supplies_desc':
      return sitesWithData.sort((a, b) => (b.nearbySupplies || 0) - (a.nearbySupplies || 0));
    default:
      return sitesWithData;
  }
}
```

### 修改函数

**toggleLabels():**
```javascript
window.toggleLabels = function() {
  const checkbox = document.getElementById('show-labels');
  if (!checkbox) return;
  
  showMarkerLabels = checkbox.checked;
  console.log('🏷️ Marker labels:', showMarkerLabels ? 'ON' : 'OFF');
  
  // Reload map to update marker labels
  loadSitesOnMap();
};
```

**loadSitesOnMap():**
- 在创建标记前先排序: `const sortedSites = getSortedSites(sitesToShow);`
- 创建标记时添加编号和label属性

**sortFilteredSites():**
- 更新 `currentSortBy` 变量
- 如果 Labels 已启用，重新加载地图标记

### 标记属性
```javascript
const marker = new google.maps.Marker({
  position: { lat: site.latitude, lng: site.longitude },
  map: map,
  title: site.siteName || site.address,
  label: showMarkerLabels ? {
    text: String(markerNumber),
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold'
  } : null,
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: site.utilisation <= 40 ? '#10b981' : '#ef4444',
    fillOpacity: 0.8,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: showMarkerLabels ? 8 : 5 // Larger when showing labels
  },
  optimized: true,
  zIndex: showMarkerLabels ? markerNumber : 0
});
```

## 📋 使用示例

### 场景: 查找伦敦地区低利用率站点

1. **打开 Power Analysis 页面**

2. **设置筛选条件:**
   - Region/Area: London
   - Max Utilisation: 30%
   - Min ONAN Rating: 2000 kVA
   - Density Radius: 10 km
   - Min Supplies: 5

3. **点击 "🔍 Apply Filters to Map"**
   - → 地图显示符合条件的站点
   - → 自动缩放到伦敦区域
   - → 下方列表显示所有站点

4. **勾选 "🏷️ Labels"**
   - → 地图标记显示编号
   - → #1 是利用率最低的站点

5. **切换排序到 "Supplies in Radius"**
   - → 列表重新排序
   - → 地图标记编号自动更新
   - → #1 变成周边站点数最多的站点

6. **查看列表找到 #1 站点详情:**
   - 站点名称
   - 地区
   - 利用率
   - ONAN容量
   - 周边站点数

## 🧪 测试步骤

### 测试 1: 基本筛选和缩放
- [ ] 打开 Power Analysis
- [ ] 应用筛选
- [ ] 验证地图自动缩放
- [ ] 验证所有标记都在视野内

### 测试 2: Labels 编号功能
- [ ] 勾选 "🏷️ Labels"
- [ ] 验证标记显示编号
- [ ] 验证标记变大
- [ ] 验证编号从 1 开始
- [ ] 取消勾选，验证编号消失

### 测试 3: 排序同步
- [ ] 默认排序: Max Utilisation
- [ ] 验证 List #1 = 利用率最低
- [ ] 如果 Labels 开启，验证 Map #1 同步
- [ ] 切换到 ONAN Rating 排序
- [ ] 验证列表重新排序
- [ ] 如果 Labels 开启，验证地图编号更新
- [ ] 切换到 Supplies in Radius 排序
- [ ] 验证列表重新排序（大到小）
- [ ] 如果 Labels 开启，验证地图编号更新

### 测试 4: Region 筛选
- [ ] 选择 Region: Cambridge
- [ ] 应用筛选
- [ ] 验证地图缩放到 Cambridge 区域
- [ ] 验证只显示 Cambridge 的站点

### 测试 5: Search 功能
- [ ] 输入搜索词（如 "London"）
- [ ] 应用筛选
- [ ] 验证只显示匹配的站点
- [ ] 验证地图自动缩放

## 📊 代码变更摘要

### app.js
**新增:**
- `showMarkerLabels` 变量
- `currentSortBy` 变量
- `getSortedSites()` 函数 (~20 lines)

**修改:**
- `loadSitesOnMap()` - 添加排序和编号 (~15 lines)
- `createMarkersInBatches()` - 添加label属性 (~10 lines)
- `toggleLabels()` - 实现切换功能 (~8 lines)
- `sortFilteredSites()` - 添加同步逻辑 (~15 lines)

**总计:** ~70 lines new/modified code

### 文件同步
✅ `frontend/app.js` → `docs/app.js`

## 💡 关键特性

### ✅ 智能地图缩放
- 自动包含所有筛选结果
- 无需手动调整视野
- 防止过度放大

### ✅ 动态标记编号
- 可选显示/隐藏
- 基于实时排序
- 与列表完美同步

### ✅ 灵活排序系统
- 三种排序方式
- 实时更新编号
- 高亮排序列

### ✅ 多维度筛选
- 6个筛选条件
- 实时搜索
- 区域过滤

## 🚀 部署说明

1. **强制刷新浏览器:** `Cmd + Shift + R` (Mac) 或 `Ctrl + Shift + R` (Windows)
2. **导航到 Power Analysis 页面**
3. **应用筛选测试自动缩放**
4. **勾选 Labels 查看编号**
5. **切换排序验证编号同步**

## 📚 相关文档

- `POWER_ANALYSIS_UPGRADE.md` - Power Analysis 初始升级文档
- `HOW_TO_USE_v2.2.md` - Power Analysis 使用指南
- `REGION_SEARCH_UPDATE.md` - Region/Search 功能文档

## 🔗 版本信息

- **Version:** 2.5.4
- **Date:** 2026-01-04
- **Features:** Auto Zoom + Marker Numbering + Sort Sync
- **Status:** Production Ready ✅

---

**完成时间:** 2026-01-04
**开发者:** AI Assistant + User
**状态:** 已测试并准备部署

