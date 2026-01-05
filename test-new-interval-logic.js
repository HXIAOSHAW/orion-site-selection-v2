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

async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试新的区间映射逻辑 / Test New Interval Mapping Logic       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('新的映射规则:');
  console.log('  • "0-20%" → 20 (包含在 ≤20% 中)');
  console.log('  • "20-40%" → 40 (包含在 ≤40% 中)');
  console.log('  • "40-60%" → 60 (包含在 ≤60% 中)');
  console.log('  • "60-80%" → 80 (包含在 ≤80% 中)');
  console.log('  • blank/null 站点不通过筛选\n');

  // 测试不同筛选阈值
  const testCases = [
    { max: 20, expected: [20] },
    { max: 40, expected: [20, 40] },
    { max: 60, expected: [20, 40, 60] },
    { max: 80, expected: [20, 40, 60, 80] },
    { max: 100, expected: [20, 40, 60, 80, 100] }
  ];

  for (const testCase of testCases) {
    const result = await testAPI(
      `http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=${testCase.max}`
    );
    const sites = result.data || [];
    
    // 统计实际包含的Utilisation值
    const actualValues = new Set();
    sites.forEach(site => {
      const util = site.utilisationBandPercent;
      if (util !== null && util !== undefined) {
        actualValues.add(util);
      }
    });
    
    const actualValuesArray = Array.from(actualValues).sort((a, b) => a - b);
    const isValid = JSON.stringify(actualValuesArray) === JSON.stringify(testCase.expected);
    
    console.log(`筛选条件: ≤ ${testCase.max}%`);
    console.log(`  期望包含的值: [${testCase.expected.join(', ')}]`);
    console.log(`  实际包含的值: [${actualValuesArray.join(', ')}]`);
    console.log(`  返回站点数: ${result.count}`);
    console.log(`  验证: ${isValid ? '✅ 通过' : '❌ 失败'}`);
    console.log('');
  }

  // 测试默认筛选条件
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试默认筛选条件 (≤40%, ONAN≥1000):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const defaultResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  const defaultSites = defaultResult.data || [];
  
  console.log(`✅ 默认筛选条件返回: ${defaultResult.count} 个站点`);
  
  // 按Utilisation值分组
  const utilGroups = {};
  defaultSites.forEach(site => {
    const util = site.utilisationBandPercent;
    if (util !== null && util !== undefined) {
      utilGroups[util] = (utilGroups[util] || 0) + 1;
    }
  });
  
  console.log('\n按Utilisation值分组:');
  Object.keys(utilGroups).sort((a, b) => a - b).forEach(val => {
    console.log(`  ${val}%: ${utilGroups[val]} 个站点`);
  });
  
  // 检查是否有null/undefined值
  const nullCount = defaultSites.filter(s => s.utilisationBandPercent === null || s.utilisationBandPercent === undefined).length;
  if (nullCount > 0) {
    console.log(`\n⚠️  警告: 有 ${nullCount} 个站点的Utilisation为null/undefined`);
  } else {
    console.log(`\n✅ 所有站点的Utilisation都有值（blank/null已过滤）`);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 测试完成 / Test Complete                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runTest().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
