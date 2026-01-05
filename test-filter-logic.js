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
  console.log('║  测试后端筛选逻辑 / Testing Backend Filter Logic              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: 仅区域筛选
  const test1 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire',
    '仅区域筛选 (Cambridgeshire)'
  );
  const allSites = test1.result.data || [];
  console.log(`✅ ${test1.description}: ${allSites.length} 个站点`);

  // 手动统计满足条件的站点
  let countUtil40 = 0;
  let countOnan1000 = 0;
  let countBoth = 0;
  
  allSites.forEach(site => {
    const util = site.utilisationBandPercent;
    const onan = site.onanRatingKva;
    
    if (util !== null && util !== undefined && util <= 40) {
      countUtil40++;
    }
    if (onan !== null && onan !== undefined && onan >= 1000) {
      countOnan1000++;
    }
    if (util !== null && util !== undefined && util <= 40 && 
        onan !== null && onan !== undefined && onan >= 1000) {
      countBoth++;
    }
  });
  
  console.log(`\n📊 手动统计结果:`);
  console.log(`   Utilisation ≤ 40%: ${countUtil40} 个站点`);
  console.log(`   ONAN ≥ 1000 kVA: ${countOnan1000} 个站点`);
  console.log(`   同时满足两个条件: ${countBoth} 个站点`);

  // Test 2: 使用后端筛选
  const test2 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=500&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000',
    '后端筛选 (Util ≤ 40%, ONAN ≥ 1000)'
  );
  const filteredSites = test2.result.data || [];
  console.log(`\n✅ ${test2.description}: ${test2.result.count} 个站点`);
  
  if (filteredSites.length > 0) {
    console.log(`\n前5个站点详情:`);
    filteredSites.slice(0, 5).forEach((site, i) => {
      console.log(`  ${i+1}. ${site.siteName || 'N/A'}`);
      console.log(`     Util: ${site.utilisationBandPercent}%, ONAN: ${site.onanRatingKva} kVA`);
    });
  }

  // 检查筛选逻辑问题
  console.log(`\n🔍 问题诊断:`);
  if (countBoth !== filteredSites.length) {
    console.log(`   ❌ 不匹配！手动统计: ${countBoth} 个，后端筛选: ${filteredSites.length} 个`);
    console.log(`   差异: ${countBoth - filteredSites.length} 个站点`);
    
    // 检查边界值
    console.log(`\n   检查边界值问题:`);
    const boundaryIssues = allSites.filter(site => {
      const util = site.utilisationBandPercent;
      const onan = site.onanRatingKva;
      return (util === 40 && onan >= 1000) || (util <= 40 && onan === 1000);
    });
    console.log(`   边界值站点数: ${boundaryIssues.length}`);
    if (boundaryIssues.length > 0) {
      console.log(`   前3个边界值站点:`);
      boundaryIssues.slice(0, 3).forEach((site, i) => {
        console.log(`     ${i+1}. Util: ${site.utilisationBandPercent}%, ONAN: ${site.onanRatingKva} kVA`);
      });
    }
  } else {
    console.log(`   ✅ 匹配！`);
  }
}

runTests().catch(console.error);
