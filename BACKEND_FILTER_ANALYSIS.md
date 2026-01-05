# 🔍 Backend Filter Logic Analysis
## 后端筛选逻辑分析

**Date:** 2026-01-05  
**Issue:** Density and Min Supplies in Radius filtering

---

## 📊 Current Backend Code / 当前后端代码

### Density Radius & Min Supplies Filter Logic

**Location:** `backend/server.js` Lines 205-224

```javascript
// Calculate neighbour counts if coordinates available
if (filters.radiusKm) {  // ⚠️ PROBLEM 1: Only executes if radiusKm exists
  const radius = filters.radiusKm || 5;
  filtered = filtered.map(ps => {
    if (!ps.lat || !ps.lng) {
      return { ...ps, neighbourCountWithin5Km: 0 };
    }
    const neighbourCount = filtered.filter(other => {
      if (!other.lat || !other.lng || ps.what3Words === other.what3Words) return false;
      const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
      return distance <= radius;
    }).length;
    return { ...ps, neighbourCountWithin5Km: neighbourCount };
  });
}

// Min supplies in radius filter
if (filters.minSuppliesInRadius !== undefined && filters.minSuppliesInRadius !== null) {
  filtered = filtered.filter(ps => (ps.neighbourCountWithin5Km || 0) >= filters.minSuppliesInRadius);
}
```

---

## ❌ Issues Found / 发现的问题

### Issue 1: Parameter Name Mismatch / 参数名不匹配

**Backend expects:**
- `filters.radiusKm` (Line 206)
- `filters.minSuppliesInRadius` (Line 222)

**Frontend uses:**
- `selectionCriteria.densityRadius` (not passed to backend!)
- `selectionCriteria.minSupplies` (not passed to backend!)

**Result:**
- `filters.radiusKm` is `undefined`
- Neighbour count calculation **NEVER EXECUTES** (Line 206 condition fails)
- `neighbourCountWithin5Km` stays at initial value `0` (from Line 106)
- All sites filtered out when `minSuppliesInRadius >= 1`

### Issue 2: Frontend Doesn't Pass Filter Parameters / 前端不传递筛选参数

**Frontend API call (Line 1031):**
```javascript
const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?limit=500`);
```

**Missing parameters:**
- ❌ No `radiusKm` or `densityRadius`
- ❌ No `minSuppliesInRadius` or `minSupplies`
- ❌ No `utilisationBandMax`
- ❌ No `onanRatingMin`
- ❌ No `region`

**Result:**
- Backend returns ALL 69,337 sites
- Frontend does filtering in client-side (inefficient)
- Backend density filter logic is NEVER USED

### Issue 3: Neighbour Count Calculation Logic / 邻近站点数量计算逻辑

**Current logic (Line 212-216):**
```javascript
const neighbourCount = filtered.filter(other => {
  if (!other.lat || !other.lng || ps.what3Words === other.what3Words) return false;
  const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
  return distance <= radius;
}).length;
```

**Potential issues:**
1. Uses `filtered` array (already filtered by other criteria)
   - ✅ Correct: Should count only qualified neighbours
2. Excludes same `what3Words`
   - ⚠️ Problem: What if two sites have same what3Words but different coordinates?
   - Should use `id` or coordinates comparison instead
3. Calculates for ALL sites in `filtered`
   - ✅ Correct: Need to know neighbour count for each site

### Issue 4: Filter Order Dependency / 筛选顺序依赖

**Current order:**
1. Region filter
2. Area filter
3. Utilisation filter
4. ONAN filter
5. Search filter
6. Radius filter (centerLat/centerLng - different from density!)
7. **Calculate neighbour counts** (Line 206-219)
8. **Min supplies filter** (Line 222-224)

**Problem:**
- Neighbour count is calculated AFTER other filters
- This is CORRECT (should count only qualified neighbours)
- But if `radiusKm` is not provided, calculation never happens

---

## ✅ Solutions / 解决方案

### Solution 1: Fix Backend to Handle Missing Parameters / 修复后端处理缺失参数

**Option A: Always calculate neighbour counts**
```javascript
// Always calculate, use default radius if not provided
const radius = filters.radiusKm || filters.densityRadius || 5;
if (radius) {
  filtered = filtered.map(ps => {
    // ... calculate neighbour count
  });
}
```

**Option B: Support both parameter names**
```javascript
const radius = filters.radiusKm || filters.densityRadius || 5;
const minSupplies = filters.minSuppliesInRadius || filters.minSupplies || 0;
```

### Solution 2: Fix Frontend to Pass Parameters / 修复前端传递参数

**Modify API call:**
```javascript
const params = new URLSearchParams();
params.append('limit', '500');
if (selectionCriteria.maxUtilisation) {
  params.append('utilisationBandMax', selectionCriteria.maxUtilisation);
}
if (selectionCriteria.minOnan) {
  params.append('onanRatingMin', selectionCriteria.minOnan);
}
if (selectionCriteria.densityRadius) {
  params.append('radiusKm', selectionCriteria.densityRadius);
}
if (selectionCriteria.minSupplies) {
  params.append('minSuppliesInRadius', selectionCriteria.minSupplies);
}
if (selectedRegion) {
  params.append('region', selectedRegion);
}

const response = await fetch(`${CONFIG.API_BASE}/api/power-supplies?${params}`);
```

### Solution 3: Fix Neighbour Count Comparison / 修复邻近站点比较

**Current:**
```javascript
if (ps.what3Words === other.what3Words) return false;
```

**Better:**
```javascript
// Use rowNumber or coordinates to identify unique sites
if (ps.rowNumber === other.rowNumber) return false;
// OR
if (ps.lat === other.lat && ps.lng === other.lng) return false;
```

---

## 🎯 Recommended Fix / 推荐修复

**Priority 1: Fix Backend Parameter Handling**
- Support both `radiusKm` and `densityRadius`
- Support both `minSuppliesInRadius` and `minSupplies`
- Always calculate neighbour counts if radius is provided (even if 0)

**Priority 2: Fix Frontend API Call**
- Pass all filter parameters to backend
- Let backend do the filtering (more efficient)

**Priority 3: Fix Neighbour Comparison**
- Use `rowNumber` instead of `what3Words` for uniqueness

