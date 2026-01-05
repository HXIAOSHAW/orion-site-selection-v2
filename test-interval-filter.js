const http = require('http');

function testAPI(url, description) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ description, result: json });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试区间筛选逻辑 / Test Interval Filter Logic                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 获取所有Cambridgeshire站点用于手动验证
  const allResult = await testAPI('http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire');
  const allSites = allResult.result.data || [];
  
  console.log('CSV中的Utilisation值分布:');
  const utilCounts = {};
  allSites.forEach(site => {
    const util = site.utilisationBandPercent;
    if (util !== null && util !== undefined) {
      utilCounts[util] = (utilCounts[util] || 0) + 1;
    }
  });
  Object.keys(utilCounts).sort((a, b) => a - b).forEach(val => {
    console.log(`  ${val}%: ${utilCounts[val]} 个站点`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试不同筛选阈值 / Test Different Filter Thresholds:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testCases = [
    { max: 20, expected: [0, 20] },
    { max: 40, expected: [0, 20, 40] },
    { max: 60, expected: [0, 20, 40, 60] },
    { max: 80, expected: [0, 20, 40, 60, 80] },
    { max: 100, expected: [0, 20, 40, 60, 80, 100] }
  ];

  for (const testCase of testCases) {
    const result = await testAPI(
      `http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=${testCase.max}`
    );
    const filteredSites = result.result.data || [];
    
    // 验证返回的站点是否都在允许的值列表中
    const actualValues = new Set();
    filteredSites.forEach(site => {
      const util = site.utilisationBandPercent;
      if (util !== null && util !== undefined) {
        actualValues.add(util);
      }
    });
    
    const actualValuesArray = Array.from(actualValues).sort((a, b) => a - b);
    const isValid = JSON.stringify(actualValuesArray) === JSON.stringify(testCase.expected);
    
    console.log(`筛选条件: ≤ ${testCase.max}%`);
    console.log(`  期望包含的值: [${testCase.expected.join(', ')}%]`);
    console.log(`  实际包含的值: [${actualValuesArray.join(', ')}%]`);
    console.log(`  返回站点数: ${result.result.count}`);
    console.log(`  验证: ${isValid ? '✅ 通过' : '❌ 失败'}`);
    
    // 显示每个值的计数
    testCase.expected.forEach(val => {
      const count = filteredSites.filter(s => s.utilisationBandPercent === val).length;
      console.log(`    ${val}%: ${count} 个站点`);
    });
    console.log('');
  }

  // 测试默认条件（≤40%, ONAN≥1000）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试默认筛选条件 (≤40%, ONAN≥1000) / Test Default Filters:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const defaultResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  const defaultSites = defaultResult.result.data || [];
  
  console.log(`✅ 默认筛选条件返回: ${defaultResult.result.count} 个站点`);
  
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
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 测试完成 / Test Complete                                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runTests().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
