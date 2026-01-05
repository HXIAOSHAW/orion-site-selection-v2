const http = require('http');

function testAPI(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function showRules() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Density和Min Supplies in Radius筛选规则                      ║');
  console.log('║  Density and Min Supplies in Radius Filter Rules              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 测试不同参数组合
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('筛选规则说明 / Filter Rules Description:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1. Density Radius (密度半径):');
  console.log('   • 参数名: densityRadius 或 radiusKm');
  console.log('   • 单位: 公里 (km)');
  console.log('   • 范围: 1-6 km（可配置）');
  console.log('   • 作用: 定义计算邻居站点的搜索半径\n');

  console.log('2. Min Supplies in Radius (最小站点数):');
  console.log('   • 参数名: minSupplies 或 minSuppliesInRadius');
  console.log('   • 单位: 个站点');
  console.log('   • 范围: 2-6 个（可配置）');
  console.log('   • 作用: 站点必须在此半径内有至少N个邻居站点\n');

  console.log('3. 邻居站点定义:');
  console.log('   一个站点被认为是"邻居"必须满足:');
  console.log('   ✅ 在Density Radius范围内（距离 ≤ radius）');
  console.log('   ✅ 已通过基本筛选条件:');
  console.log('      - Region筛选（如果应用）');
  console.log('      - Utilisation ≤ 阈值');
  console.log('      - ONAN ≥ 阈值');
  console.log('   ✅ 不是站点自己（使用rowNumber进行唯一性比较）');
  console.log('   ✅ 有有效的坐标（lat和lng不为null）\n');

  console.log('4. 筛选逻辑顺序:');
  console.log('   Step 1: 应用基本筛选（Region, Utilisation, ONAN）');
  console.log('   Step 2: 对每个站点计算邻居数（基于已筛选的站点集合）');
  console.log('   Step 3: 过滤掉邻居数 < Min Supplies 的站点\n');

  // 测试不同参数组合
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试不同参数组合 / Test Different Parameter Combinations:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testCases = [
    { radius: 1, minSupplies: 2, desc: 'Radius=1km, MinSupplies=2' },
    { radius: 3, minSupplies: 2, desc: 'Radius=3km, MinSupplies=2' },
    { radius: 5, minSupplies: 3, desc: 'Radius=5km, MinSupplies=3 (默认)' },
    { radius: 5, minSupplies: 5, desc: 'Radius=5km, MinSupplies=5' },
    { radius: 6, minSupplies: 6, desc: 'Radius=6km, MinSupplies=6' }
  ];

  for (const testCase of testCases) {
    const result = await testAPI(
      `http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=${testCase.radius}&minSupplies=${testCase.minSupplies}`
    );
    console.log(`${testCase.desc}: ${result.count} 个站点`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('代码实现细节 / Code Implementation Details:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('计算邻居数的代码逻辑:');
  console.log('```javascript');
  console.log('// 1. 获取半径值（支持两种参数名）');
  console.log('const radius = filters.radiusKm || filters.densityRadius;');
  console.log('const radiusValue = parseFloat(radius) || 5;');
  console.log('');
  console.log('// 2. 对每个站点计算邻居数');
  console.log('filtered = filtered.map(ps => {');
  console.log('  if (!ps.lat || !ps.lng) {');
  console.log('    return { ...ps, neighbourCountWithin5Km: 0 };');
  console.log('  }');
  console.log('  ');
  console.log('  // 在已通过基本筛选的站点中查找邻居');
  console.log('  const neighbourCount = filtered.filter(other => {');
  console.log('    if (ps.rowNumber === other.rowNumber) return false; // 跳过自己');
  console.log('    if (!other.lat || !other.lng) return false; // 跳过无坐标的');
  console.log('    const distance = haversineDistance(ps.lat, ps.lng, other.lat, other.lng);');
  console.log('    return distance <= radiusValue; // 在半径内');
  console.log('  }).length;');
  console.log('  ');
  console.log('  return { ...ps, neighbourCountWithin5Km: neighbourCount };');
  console.log('});');
  console.log('');
  console.log('// 3. 应用Min Supplies筛选');
  console.log('if (minSupplies !== null && minSupplies !== undefined) {');
  console.log('  filtered = filtered.filter(ps => ');
  console.log('    (ps.neighbourCountWithin5Km || 0) >= minSupplies');
  console.log('  );');
  console.log('}');
  console.log('```\n');

  console.log('关键点 / Key Points:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ 邻居数计算基于已通过基本筛选的站点集合');
  console.log('   这确保邻居站点都满足ONAN和utilisation阈值');
  console.log('');
  console.log('✅ 使用Haversine公式计算距离（地球表面距离）');
  console.log('   公式考虑了地球的曲率，计算准确');
  console.log('');
  console.log('✅ 使用rowNumber进行唯一性比较');
  console.log('   比what3Words更可靠（不依赖可选字段）');
  console.log('');
  console.log('✅ 无坐标的站点邻居数设为0');
  console.log('   这些站点会被Min Supplies筛选过滤掉');

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 规则说明完成 / Rules Description Complete                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

showRules().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
