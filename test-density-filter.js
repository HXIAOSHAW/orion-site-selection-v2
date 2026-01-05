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

async function testDensityFilter() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试Density筛选逻辑                                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const testCases = [
    { densityRadius: 3, minSupplies: 3, desc: '默认: radius=3km, minSupplies=3 (应显示neighbourCount>=2的站点)' },
    { densityRadius: 5, minSupplies: 3, desc: 'radius=5km, minSupplies=3 (应显示neighbourCount>=2的站点)' },
    { densityRadius: 3, minSupplies: 5, desc: 'radius=3km, minSupplies=5 (应显示neighbourCount>=4的站点)' },
  ];

  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.desc}`);
    console.log('='.repeat(80));
    
    const params = new URLSearchParams();
    params.append('region', 'Cambridgeshire');
    params.append('utilisationBandMax', '40');
    params.append('onanRatingMin', '1000');
    params.append('densityRadius', testCase.densityRadius);
    params.append('minSupplies', testCase.minSupplies);
    params.append('limit', '10');

    const url = `http://localhost:3000/api/power-supplies?${params}`;
    
    try {
      const result = await testAPI(url);
      
      if (result.success && result.data) {
        const sites = result.data;
        const minNeighbourCount = Math.max(0, testCase.minSupplies - 1);
        
        console.log(`筛选条件: radius=${testCase.densityRadius}km, minSupplies=${testCase.minSupplies}`);
        console.log(`预期最小neighbourCount: >= ${minNeighbourCount}`);
        console.log(`返回站点数量: ${sites.length}`);
        
        if (sites.length > 0) {
          // 检查所有站点的neighbourCount
          const neighbourCounts = sites.map(s => s.neighbourCountWithin5Km || 0);
          const minActual = Math.min(...neighbourCounts);
          const maxActual = Math.max(...neighbourCounts);
          
          console.log(`实际neighbourCount范围: ${minActual} 到 ${maxActual}`);
          
          // 验证所有站点都满足条件
          const invalidSites = sites.filter(s => (s.neighbourCountWithin5Km || 0) < minNeighbourCount);
          if (invalidSites.length === 0) {
            console.log(`✅ 验证通过: 所有站点都满足 neighbourCount >= ${minNeighbourCount}`);
          } else {
            console.log(`❌ 验证失败: ${invalidSites.length} 个站点不满足条件`);
            invalidSites.slice(0, 3).forEach(site => {
              console.log(`   站点: ${site.siteName}, neighbourCount: ${site.neighbourCountWithin5Km || 0}`);
            });
          }
          
          // 显示前5个站点的详细信息
          console.log('\n前5个站点的详细信息:');
          sites.slice(0, 5).forEach((site, i) => {
            console.log(`  ${i + 1}. ${site.siteName || 'N/A'}: neighbourCount=${site.neighbourCountWithin5Km || 0}`);
          });
        } else {
          console.log('⚠️  没有站点通过筛选');
        }
      }
    } catch (error) {
      console.error('❌ 错误:', error.message);
    }
  }
}

testDensityFilter();
