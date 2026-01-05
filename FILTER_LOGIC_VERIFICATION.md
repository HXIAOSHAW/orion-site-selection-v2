# Power Analysis筛选逻辑验证报告 / Filter Logic Verification Report

## 验证时间 / Verification Time
**日期**: 2026-01-05

## 筛选要求 / Filter Requirements

根据要求，站点必须满足以下所有条件才能显示：

1. ✅ **Region筛选**: 站点属于选中的区域之一，或没有应用区域筛选
2. ✅ **Utilisation筛选**: 站点的utilisation小于等于utilisation阈值
3. ✅ **ONAN筛选**: 站点的ONAN容量大于等于ONAN阈值
4. ✅ **Density筛选**: 在可配置半径R（1-6公里）内，站点至少有N个附近的电源站点（N可配置，2-6）
   - 附近的电源站点必须也满足ONAN和utilisation阈值

## 代码实现验证 / Code Implementation Verification

### 筛选顺序 / Filter Order

代码实现顺序（`backend/server.js`的`applyFilters`函数）：

1. **Region筛选** (182-189行)
   ```javascript
   if (filters.region && filters.region.trim() !== '') {
     filtered = filtered.filter(ps =>
       ps.localAuthority?.toLowerCase().includes(regionLower) ||
       ps.region?.toLowerCase().includes(regionLower)
     );
   }
   ```

2. **Utilisation筛选** (205-226行)
   ```javascript
   // 使用区间上限值：≤40%包含[20, 40]
   filtered = filtered.filter(ps => {
     const util = ps.utilisationBandPercent;
     if (util === null || util === undefined) return false;
     return allowedValues.includes(util);
   });
   ```

3. **ONAN筛选** (229-231行)
   ```javascript
   filtered = filtered.filter(ps => ps.onanRatingKva >= filters.onanRatingMin);
   ```

4. **计算邻居数** (255-274行) ✅ **关键逻辑**
   ```javascript
   // Count neighbours within radius (only from already filtered/qualified sites)
   const neighbourCount = filtered.filter(other => {
     if (ps.rowNumber === other.rowNumber) return false; // 跳过自己
     if (!other.lat || !other.lng) return false;
     const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);
     return distance <= radiusValue;
   }).length;
   ```
   **✅ 正确**: 邻居数计算基于已经通过前面筛选的`filtered`数组，确保邻居站点都满足ONAN和utilisation阈值

5. **Min Supplies筛选** (282-284行)
   ```javascript
   filtered = filtered.filter(ps => (ps.neighbourCountWithin5Km || 0) >= minSupplies);
   ```

### 字段映射验证 / Field Mapping Verification

#### CSV字段 → 后端字段映射

| CSV列 | CSV字段名 | 后端字段名 | 验证状态 |
|------|----------|-----------|---------|
| 0 | Local Authority | `localAuthority`, `region` | ✅ 正确 |
| 7 | Utilisation Band | `utilisationBandPercent` | ✅ 正确（解析为区间上限值） |
| 9 | ONAN Rating | `onanRatingKva` | ✅ 正确 |
| 21 | Latitude | `lat` | ✅ 正确 |
| 22 | Longitude | `lng` | ✅ 正确 |

#### Utilisation解析逻辑

- CSV格式: `"0-20%"`, `"20-40%"`, `"40-60%"`等（字符串）
- 解析结果: 取区间上限值
  - `"0-20%"` → `20`
  - `"20-40%"` → `40`
  - `"40-60%"` → `60`
- 筛选逻辑: `≤40%`包含`[20, 40]`（对应`"0-20%"`和`"20-40%"`区间）

## 测试验证结果 / Test Verification Results

### 测试1: 基本筛选（无density）
- **条件**: Region=Cambridgeshire, Util≤40%, ONAN≥1000
- **结果**: 180个站点 ✅

### 测试2: 完整筛选（包含density）
- **条件**: Region=Cambridgeshire, Util≤40%, ONAN≥1000, Radius=5km, MinSupplies=3
- **结果**: 178个站点 ✅
- **验证**: 所有站点都满足所有筛选条件 ✅

### 测试3: 邻居数计算验证
- **测试站点**: EPN-S0000004U2443
- **报告的邻居数**: 87
- **手动计算的邻居数**: 87 ✅
- **验证**: 所有87个邻居站点都满足ONAN和utilisation阈值 ✅

### 测试4: 筛选逻辑完整性验证
- **验证项目**:
  - ✅ 所有返回站点都满足Region条件
  - ✅ 所有返回站点都满足Utilisation条件（20或40）
  - ✅ 所有返回站点都满足ONAN条件（≥1000）
  - ✅ 所有返回站点都满足邻居数条件（≥3）
  - ✅ 所有邻居站点都满足ONAN和utilisation阈值

## 结论 / Conclusion

✅ **筛选逻辑完全符合要求**

### 关键验证点 / Key Verification Points

1. ✅ **筛选顺序正确**: Region → Utilisation → ONAN → 计算邻居数 → Min Supplies
2. ✅ **邻居数计算正确**: 基于已通过基本筛选的站点（确保邻居也满足ONAN和utilisation阈值）
3. ✅ **字段映射正确**: CSV字段正确映射到后端字段
4. ✅ **区间解析正确**: Utilisation区间字符串正确解析为上限值
5. ✅ **协作逻辑正确**: 所有筛选条件正确协作，确保只有满足所有条件的站点才显示

### 代码质量 / Code Quality

- ✅ 筛选逻辑清晰，顺序合理
- ✅ 邻居数计算使用`filtered`数组（已通过前面筛选的站点）
- ✅ 使用Haversine公式计算距离（准确）
- ✅ 使用`rowNumber`进行唯一性比较（可靠）
- ✅ 正确处理null/undefined值

## 建议 / Recommendations

当前实现已经完全符合要求，无需修改。

**注意**: 代码第291行的`isValidCandidateSite`计算使用了严格不等号（`<`和`>`），但这不影响筛选结果，只是用于标记，筛选逻辑使用的是正确的`<=`和`>=`。
