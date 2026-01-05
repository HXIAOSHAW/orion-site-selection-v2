# Cambridgeshire区域默认筛选条件测试结果

## 测试结果 / Test Results

**符合所有默认筛选条件的站点数量: 177**

### 默认筛选条件 / Default Filter Conditions

- **Region**: Cambridgeshire
- **Max Utilisation**: ≤40%
- **Min ONAN Rating**: ≥1000 kVA
- **Density Radius**: 3 km
- **Min Supplies in Radius**: ≥3

### 统计信息 / Statistics

- **平均Utilisation**: 35.6%
- **平均ONAN Rating**: 1006 kVA
- **平均Neighbour Count**: 40.8

---

## 后端筛选逻辑详解 / Backend Filter Logic Explanation

### 筛选顺序 / Filter Order

筛选按照以下顺序执行，每个步骤都会进一步缩小结果集：

### Step 1: Region筛选 (第182-189行)

```javascript
if (filters.region && filters.region.trim() !== '') {
  const regionLower = filters.region.toLowerCase();
  filtered = filtered.filter(ps =>
    ps.localAuthority?.toLowerCase().includes(regionLower) ||
    ps.region?.toLowerCase().includes(regionLower)
  );
}
```

**逻辑说明:**
- 将region参数转换为小写
- 检查站点的`localAuthority`或`region`字段是否包含该region名称
- 使用`includes`进行部分匹配（例如："Cambridgeshire"会匹配"Cambridgeshire County"）

**对于Cambridgeshire:**
- 筛选出所有`localAuthority`或`region`字段包含"cambridgeshire"的站点

---

### Step 2: Utilisation筛选 (第201-226行)

```javascript
if (filters.utilisationBandMax !== undefined && filters.utilisationBandMax !== null) {
  const maxValue = filters.utilisationBandMax; // 40
  const allowedValues = [];
  const intervalUpperBounds = [20, 40, 60, 80, 100];
  for (const upperBound of intervalUpperBounds) {
    if (upperBound <= maxValue) {
      allowedValues.push(upperBound); // [20, 40]
    }
  }
  filtered = filtered.filter(ps => {
    const util = ps.utilisationBandPercent;
    if (util === null || util === undefined) return false;
    return allowedValues.includes(util);
  });
}
```

**逻辑说明:**
- CSV中的utilisation值是区间字符串："0-20%", "20-40%", "40-60%", "60-80%", "80-100%"
- 这些区间在数据加载时被解析为上界值：20, 40, 60, 80, 100
- 当`maxValue = 40`时，允许的值为`[20, 40]`
- 这意味着只包含utilisation为20%或40%的站点（对应"0-20%"和"20-40%"区间）
- **排除null/undefined/blank值**

**对于Max Utilisation ≤40%:**
- 只包含utilisation为20%或40%的站点
- 排除utilisation为60%, 80%, 100%的站点
- 排除utilisation为null/undefined的站点

---

### Step 3: ONAN Rating筛选 (第228-231行)

```javascript
if (filters.onanRatingMin !== undefined && filters.onanRatingMin !== null) {
  filtered = filtered.filter(ps => ps.onanRatingKva >= filters.onanRatingMin);
}
```

**逻辑说明:**
- 使用`>=`运算符（包含边界值）
- 只包含ONAN rating大于或等于阈值的站点

**对于Min ONAN ≥1000 kVA:**
- 只包含ONAN rating ≥ 1000 kVA的站点
- 排除ONAN rating < 1000 kVA的站点

---

### Step 4: Density Radius计算 (第255-274行)

```javascript
const radius = filters.radiusKm || filters.densityRadius;
if (radius !== undefined && radius !== null) {
  const radiusValue = parseFloat(radius) || 3; // 默认3 km
  filtered = filtered.map(ps => {
    if (!ps.lat || !ps.lng) {
      return { ...ps, neighbourCountWithin5Km: 0 };
    }
    // 在已通过前面筛选的站点中计算邻居数
    const neighbourCount = filtered.filter(other => {
      if (ps.rowNumber === other.rowNumber) return false; // 跳过自己
      if (!other.lat || !other.lng) return false; // 跳过无坐标的
      const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
      return distance <= radiusValue; // 在半径内
    }).length;
    return { ...ps, neighbourCountWithin5Km: neighbourCount };
  });
}
```

**逻辑说明:**
- **关键点**: 邻居计数是基于**已通过前面筛选的站点集合**计算的
- 使用Haversine公式计算地球表面距离
- 对于每个站点，计算在指定半径内（3km）有多少个其他站点
- 邻居站点必须：
  1. 不是站点自己（使用rowNumber进行唯一性比较）
  2. 有有效的坐标（lat和lng不为null）
  3. 在半径范围内（distance ≤ radiusValue）
  4. **已经通过了前面的所有筛选**（Region, Utilisation, ONAN）

**对于Density Radius = 3 km:**
- 对每个站点，计算在3km半径内有多少个符合条件的邻居站点
- 邻居站点必须也满足Region、Utilisation ≤40%、ONAN ≥1000 kVA的条件

---

### Step 5: Min Supplies筛选 (第276-284行)

```javascript
const minSupplies = filters.minSuppliesInRadius !== undefined && filters.minSuppliesInRadius !== null
  ? filters.minSuppliesInRadius
  : (filters.minSupplies !== undefined && filters.minSupplies !== null ? filters.minSupplies : null);

if (minSupplies !== null && minSupplies !== undefined) {
  filtered = filtered.filter(ps => (ps.neighbourCountWithin5Km || 0) >= minSupplies);
}
```

**逻辑说明:**
- 只保留邻居数大于或等于最小要求的站点
- 使用`>=`运算符（包含边界值）

**对于Min Supplies ≥3:**
- 只包含在3km半径内至少有3个邻居站点的站点
- 排除邻居数 < 3的站点

---

## 筛选逻辑总结 / Filter Logic Summary

### 筛选条件组合 / Combined Filter Conditions

一个站点必须**同时满足**以下所有条件才会被返回：

1. ✅ **Region**: `localAuthority`或`region`字段包含"Cambridgeshire"
2. ✅ **Utilisation**: `utilisationBandPercent`为20或40（对应"0-20%"或"20-40%"区间）
3. ✅ **ONAN**: `onanRatingKva` ≥ 1000 kVA
4. ✅ **Density**: 在3km半径内，至少有3个其他站点也满足条件1-3
5. ✅ **Coordinates**: 站点必须有有效的坐标（lat和lng）

### 筛选顺序的重要性 / Importance of Filter Order

筛选顺序很重要，因为：

1. **Density计算基于已筛选的站点**: 
   - 邻居计数是在已通过Region、Utilisation、ONAN筛选的站点中计算的
   - 这确保了邻居站点也满足基本筛选条件

2. **效率优化**:
   - 先应用基本筛选（Region, Utilisation, ONAN）可以减少需要计算距离的站点数量
   - Density计算是计算密集型的，所以先缩小数据集很重要

### 示例站点分析 / Example Site Analysis

**站点1: EPN-S0000004U2443**
- Utilisation: 40% ✅ (在允许的[20, 40]范围内)
- ONAN: 1000 kVA ✅ (≥1000)
- Neighbour Count: 77 ✅ (≥3)
- 在3km半径内有77个符合条件的邻居站点

**站点5: EPN-S0000004U2421**
- Utilisation: 20% ✅ (在允许的[20, 40]范围内)
- ONAN: 1000 kVA ✅ (≥1000)
- Neighbour Count: 75 ✅ (≥3)
- 在3km半径内有75个符合条件的邻居站点

---

## 关键要点 / Key Points

1. **区间映射**: Utilisation使用区间映射（"0-20%" → 20, "20-40%" → 40等）
2. **包含边界值**: ONAN和Min Supplies使用`>=`运算符，包含边界值
3. **邻居计数基于已筛选站点**: Density计算只考虑已通过基本筛选的站点
4. **排除null值**: Utilisation为null/undefined的站点被明确排除
5. **Haversine距离**: 使用地球表面距离公式，考虑了地球曲率

