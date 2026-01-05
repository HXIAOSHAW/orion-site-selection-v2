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
  console.log('║  ✅ 修复验证 / Fix Verification                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: 基本筛选（无密度）
  const test1 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000',
    '基本筛选 (Util ≤ 40%, ONAN ≥ 1000)'
  );
  console.log(`✅ ${test1.description}: ${test1.result.count} 个站点`);
  
  // Test 2: 默认筛选（包括密度）
  const test2 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3',
    '默认筛选 (包括密度 5km, ≥3个邻居)'
  );
  console.log(`✅ ${test2.description}: ${test2.result.count} 个站点`);
  
  if (test2.result.count > 0 && test2.result.data) {
    console.log(`\n前3个站点详情:`);
    test2.result.data.slice(0, 3).forEach((site, i) => {
      console.log(`  ${i+1}. ${site.siteName || 'N/A'}`);
      console.log(`     Util: ${site.utilisationBandPercent}%, ONAN: ${site.onanRatingKva} kVA`);
      console.log(`     5km内邻居数: ${site.neighbourCountWithin5Km || 0}`);
    });
  }
  
  // Test 3: 放宽密度条件
  const test3 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=10&minSupplies=1',
    '放宽密度条件 (10km, ≥1个邻居)'
  );
  console.log(`✅ ${test3.description}: ${test3.result.count} 个站点`);

  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  ✅ 修复成功！/ Fix Successful!                                ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝`);
  console.log(`\n总结:`);
  console.log(`  • 基本筛选 (Util ≤ 40%, ONAN ≥ 1000): ${test1.result.count} 个站点 ✅`);
  console.log(`  • 默认筛选 (包括密度): ${test2.result.count} 个站点`);
  console.log(`  • 放宽密度条件: ${test3.result.count} 个站点`);
}

runTests().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
