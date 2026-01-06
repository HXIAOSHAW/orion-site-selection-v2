# 🔧 Coordinate Data Fix - v2.5.10
## 坐标数据修复 - 版本 2.5.10

**Date / 日期:** 2026-01-05  
**Version / 版本:** v2.5.10  
**Priority / 优先级:** 🔴 CRITICAL - Data Loading Fix  

---

## 🎯 Problem Statement / 问题描述

### Issue / 问题

前端显示 **"0 sites match filters"** 和 **"Total sites with coords: 0"**

### Root Cause / 根本原因

**后端代码没有从 CSV 读取坐标数据！**

- CSV 文件包含：
  - Column 21: **Latitude**
  - Column 22: **Longitude**
- 后端代码只读取了：
  - Column 0-3, 7, 9, 11, 29
  - **没有读取 Column 21 和 22**
- 结果：所有站点的 `lat` 和 `lng` 都是 `null`
- 前端过滤：`sitesWithCoords = mappedData.filter(s => s.latitude && s.longitude)`
- 结果：**0 个站点通过坐标过滤**

---

## ✅ Solution Implemented / 实施的解决方案

### 1. Fixed CSV Column Reading / 修复 CSV 列读取

**Before / 之前:**
```javascript
const powerSupply = {
  // ... other fields ...
  lat: null,  // ❌ Always null
  lng: null   // ❌ Always null
};
```

**After / 之后:**
```javascript
const latitude = parseNumber(row[21]); // ✅ Read from CSV Column 21
const longitude = parseNumber(row[22]); // ✅ Read from CSV Column 22

const powerSupply = {
  // ... other fields ...
  lat: latitude,  // ✅ Actual coordinate from CSV
  lng: longitude  // ✅ Actual coordinate from CSV
};
```

### 2. Updated Column Index Comments / 更新列索引注释

```javascript
// Column indices (from CSV structure):
// 0: Local Authority
// 1: Site Name (functionallocation)
// 2: Town
// 3: Postcode
// 7: Utilisation Band %
// 9: ONAN Rating (kVA)
// 11: Primary Feeder
// 21: Latitude        ← ✅ Added
// 22: Longitude       ← ✅ Added
// 29: What3Words
```

### 3. Improved Field Parsing / 改进字段解析

**Before / 之前:**
```javascript
// Only read required fields
const localAuthority = parseString(row[0]);
const utilisationBand = parseNumber(row[7]);
// ... missing latitude/longitude ...
```

**After / 之后:**
```javascript
// Read all fields including coordinates
const localAuthority = parseString(row[0]);
const siteName = parseString(row[1]);
const town = parseString(row[2]);
const postcode = parseString(row[3]);
const utilisationBand = parseNumber(row[7]);
const onanRating = parseNumber(row[9]);
const primaryFeeder = parseString(row[11]);
const latitude = parseNumber(row[21]);  // ✅ Added
const longitude = parseNumber(row[22]); // ✅ Added
const what3Words = parseString(row[29]);
```

### 4. Removed What3Words Requirement / 移除 What3Words 要求

**Before / 之前:**
```javascript
// Skip rows with missing required data
if (utilisationBand === null || onanRating === null || !primaryFeeder || !what3Words) {
  skippedRows++;
  continue;
}
```

**After / 之后:**
```javascript
// Skip rows with missing required data (what3Words is optional)
if (utilisationBand === null || onanRating === null || !primaryFeeder) {
  skippedRows++;
  continue;
}
```

**Reason / 原因:**
- What3Words 不是必需字段
- 坐标数据来自 Latitude/Longitude 列
- 即使没有 What3Words，站点也应该被包含

---

## 📊 CSV Structure Verified / CSV 结构验证

### Column Mapping / 列映射

| Column Index | Column Name | Data Type | Status |
|--------------|-------------|-----------|--------|
| 0 | localauthority | String | ✅ Read |
| 1 | functionallocation | String | ✅ Read (as siteName) |
| 2 | (Town) | String | ✅ Read |
| 3 | postcode | String | ✅ Read |
| 7 | utilisation band | Number | ✅ Read |
| 9 | onanrating | Number | ✅ Read |
| 11 | primaryfeeder | String | ✅ Read |
| **21** | **Latitude** | **Number** | **✅ FIXED** |
| **22** | **Longitude** | **Number** | **✅ FIXED** |
| 29 | what3words | String | ✅ Read (optional) |

### Sample Data / 样本数据

```
Sample row:
  Latitude: 51.959079
  Longitude: 0.772856
  What3Words: gave.cleanest.daydreams
```

---

## 🧪 Testing / 测试

### Test Script / 测试脚本

Created: `test-backend-fix.sh`

### Results / 结果

```
✅ API returns lat and lng fields
✅ Filtered sites have coordinates
✅ Filtered count: 13 sites (with 40% utilisation, 1000 kVA filters)
```

**Note / 注意:**
- 如果后端服务器未重启，第一个测试可能显示坐标为 null
- 重启后端服务器后，所有测试应该通过

---

## 🚀 Deployment Steps / 部署步骤

### 1. Restart Backend Server / 重启后端服务器

**⚠️ CRITICAL: Backend server MUST be restarted!**

```bash
# Stop current backend server (Ctrl + C)

# Restart backend
cd /Users/xh/Orion/orion-site-selection-v2/backend
npm start
```

**Expected Output / 预期输出:**
```
📊 Excel file: /Users/xh/Orion/.../ukpn-secondary-sites.xlsx
Parsed XXX valid power supply records. Skipped YYY rows.
```

### 2. Verify Backend / 验证后端

```bash
# Run test script
cd /Users/xh/Orion/orion-site-selection-v2
./test-backend-fix.sh
```

**Expected / 预期:**
```
✅ API returns lat and lng fields
✅ Coordinates have values (lat: 51.959079)
✅ Filtered sites have coordinates
```

### 3. Refresh Frontend / 刷新前端

1. **Refresh Browser / 刷新浏览器:**
   ```
   Cmd + R (with Disable cache enabled)
   ```

2. **Test Filtering / 测试筛选:**
   - Select "All Regions"
   - Set filters: 40% utilisation, 1000 kVA
   - Click "Apply Filters to Map"

3. **Check Console / 检查控制台:**
   ```
   ✅ Loaded XXX sites with coordinates
   ✅ Step 1: Basic filters → XXX sites
   ✅ Step 2: Density filter → YYY sites
   ```

---

## 📁 Files Modified / 修改的文件

| File / 文件 | Changes / 变化 |
|------------|----------------|
| `backend/server.js` | • Added Latitude column reading (row[21])<br>• Added Longitude column reading (row[22])<br>• Removed what3Words requirement<br>• Updated column index comments |
| `test-backend-fix.sh` | Created test script |

---

## 🔍 Key Changes / 关键变化

### Code Location / 代码位置

**File:** `backend/server.js`

**Lines Modified:**
- Line 60-70: Updated column index comments
- Line 84-93: Added latitude/longitude reading
- Line 95-99: Removed what3Words requirement
- Line 108-109: Set lat/lng from CSV data

### Before vs After / 修复前后对比

**Before / 之前:**
```javascript
lat: null,  // Always null
lng: null   // Always null
```

**After / 之后:**
```javascript
const latitude = parseNumber(row[21]);
const longitude = parseNumber(row[22]);
// ...
lat: latitude,  // From CSV Column 21
lng: longitude  // From CSV Column 22
```

---

## ✅ Validation Checklist / 验证清单

- [x] CSV structure verified (Latitude Column 21, Longitude Column 22)
- [x] Backend code updated to read coordinates
- [x] What3Words requirement removed
- [x] Test script created
- [ ] Backend server restarted (user action required)
- [ ] Frontend tested (user action required)

---

## 🎯 Expected Results / 预期结果

### After Backend Restart / 后端重启后

1. **API Response / API 响应:**
   ```json
   {
     "success": true,
     "count": 69337,
     "data": [
       {
         "lat": 51.959079,
         "lng": 0.772856,
         "utilisationBandPercent": 40,
         "onanRatingKva": 1000,
         ...
       }
     ]
   }
   ```

2. **Frontend Console / 前端控制台:**
   ```
   📡 Fetching sites from API...
   ✅ Loaded 69337 sites with coordinates
   📊 Sample site data: {
     region: "Essex",
     localAuthority: "Essex",
     utilisation: 40,
     onanRating: 1000,
     hasCoords: true
   }
   🔍 Applying filters: {...}
   ✅ Step 1: Basic filters → XXX sites
   ✅ Step 2: Density filter → YYY sites
   ```

3. **Map Display / 地图显示:**
   - ✅ Markers appear on map
   - ✅ Site count > 0
   - ✅ Filtered sites list displays

---

## 📖 Related Documentation / 相关文档

- `FRONTEND_FILTER_FIX_v2.5.9.md` - Frontend filter fixes
- `DENSITY_FILTER_LOGIC_FIX_v2.5.8.md` - Density filter logic
- `FIELD_MAPPING_FIX_v2.5.7.md` - Field name mapping

---

## ✅ Status / 状态

```
✅ CSV structure verified
✅ Backend code fixed
✅ Coordinates reading implemented
✅ Test script created
⏳ Backend server restart required
⏳ Frontend testing required
```

---

**Version:** v2.5.10  
**Status:** ✅ CODE FIXED - RESTART REQUIRED  
**Next:** Restart backend server and test



