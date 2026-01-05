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
  console.log('║  测试 Cambridgeshire 区域默认筛选条件                         ║');
  console.log('║  Test Cambridgeshire Region Default Filter Criteria          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('默认筛选条件 / Default Filter Criteria:');
  console.log('  • Region: Cambridgeshire');
  console.log('  • Max Utilisation: ≤ 40%');
  console.log('  • Min ONAN Rating: ≥ 1000 kVA');
  console.log('  • (无密度筛选 / No density filter)');
  console.log('');

  // Test: 仅区域筛选
  const test1 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire',
    '仅区域筛选 (Cambridgeshire only)'
  );
  const allSites = test1.result.data || [];
  console.log(`✅ ${test1.description}: ${allSites.length} 个站点`);

  // Test: 区域 + Utilisation ≤ 40%
  const test2 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40',
    '区域 + Utilisation ≤ 40%'
  );
  console.log(`✅ ${test2.description}: ${test2.result.count} 个站点`);

  // Test: 区域 + ONAN ≥ 1000 kVA
  const test3 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&onanRatingMin=1000',
    '区域 + ONAN ≥ 1000 kVA'
  );
  console.log(`✅ ${test3.description}: ${test3.result.count} 个站点`);

  // Test: 区域 + Utilisation ≤ 40% + ONAN ≥ 1000 kVA (默认条件)
  const test4 = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000',
    '区域 + Util ≤ 40% + ONAN ≥ 1000 kVA (默认条件)'
  );
  const filteredSites = test4.result.data || [];
  console.log(`\n✅ ${test4.description}: ${test4.result.count} 个站点`);

  // 详细统计
  if (filteredSites.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('详细统计 / Detailed Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 按Utilisation分组
    const utilGroups = {};
    const onanGroups = {};
    
    filteredSites.forEach(site => {
      const util = site.utilisationBandPercent;
      const onan = site.onanRatingKva;
      
      // Utilisation分组
      const utilKey = util === 0 ? '0%' : 
                     util <= 10 ? '1-10%' :
                     util <= 20 ? '11-20%' :
                     util <= 30 ? '21-30%' :
                     util <= 40 ? '31-40%' : '>40%';
      utilGroups[utilKey] = (utilGroups[utilKey] || 0) + 1;
      
      // ONAN分组
      const onanKey = onan === 1000 ? '1000 kVA' :
                     onan <= 1500 ? '1001-1500 kVA' :
                     onan <= 2000 ? '1501-2000 kVA' :
                     onan <= 3000 ? '2001-3000 kVA' : '>3000 kVA';
      onanGroups[onanKey] = (onanGroups[onanKey] || 0) + 1;
    });
    
    console.log('\n按 Utilisation 分组 / Grouped by Utilisation:');
    Object.keys(utilGroups).sort().forEach(key => {
      console.log(`  ${key}: ${utilGroups[key]} 个站点`);
    });
    
    console.log('\n按 ONAN Rating 分组 / Grouped by ONAN Rating:');
    Object.keys(onanGroups).sort().forEach(key => {
      console.log(`  ${key}: ${onanGroups[key]} 个站点`);
    });
    
    // 边界值统计
    const boundarySites = filteredSites.filter(site => 
      site.utilisationBandPercent === 40 || site.onanRatingKva === 1000
    );
    console.log(`\n边界值站点数 / Boundary Value Sites: ${boundarySites.length}`);
    console.log(`  • Utilisation = 40%: ${filteredSites.filter(s => s.utilisationBandPercent === 40).length} 个`);
    console.log(`  • ONAN = 1000 kVA: ${filteredSites.filter(s => s.onanRatingKva === 1000).length} 个`);
    
    // 显示前10个站点示例
    console.log('\n前10个站点示例 / First 10 Sites Sample:');
    filteredSites.slice(0, 10).forEach((site, i) => {
      console.log(`  ${i+1}. ${site.siteName || 'N/A'}`);
      console.log(`     Util: ${site.utilisationBandPercent}%, ONAN: ${site.onanRatingKva} kVA`);
      if (site.town) console.log(`     Town: ${site.town}`);
    });
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试结果总结 / Test Results Summary                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Cambridgeshire 区域总站点数: ${allSites.length}`);
  console.log(`✅ 满足 Utilisation ≤ 40%: ${test2.result.count} 个站点`);
  console.log(`✅ 满足 ONAN ≥ 1000 kVA: ${test3.result.count} 个站点`);
  console.log(`✅ 同时满足两个默认条件: ${test4.result.count} 个站点`);
  console.log('');
}

runTests().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
