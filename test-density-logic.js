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

async function testDensityLogic() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试Density筛选逻辑                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const testCases = [
    { radius: 3, expectedMin: 2, desc: 'radius=3km, 应显示neighbourCount>=2的站点' },
    { radius: 5, expectedMin: 4, desc: 'radius=5km, 应显示neighbourCount>=4的站点' },
    { radius: 1, expectedMin: 0, desc: 'radius=1km, 应显示neighbourCount>=0的站点' },
  ];

  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.desc}`);
    console.log('='.repeat(80));
    
    const params = new URLSearchParams();
    params.append('region', 'Cambridgeshire');
    params.append('utilisationBandMax', '40');
    params.append('onanRatingMin', '1000');
    params.append('densityRadius', testCase.radius);
    params.append('limit', '20'); // 只获取20个用于验证

    const url = `http://localhost:3000/api/power-supplies?${params}`;
    
    try {
      const result = await testAPI(url);
      
      if (result.success && result.data) {
        const sites = result.data;
        console.log(`返回站点数量: ${sites.length}`);
        
        if (sites.length > 0) {
          // 检查所有站点的neighbourCount
          const neighbourCounts = sites.map(s => s.neighbourCountWithin5Km || 0);
          const minCount = Math.min(...neighbourCounts);
          const maxCount = Math.max(...neighbourCounts);
          const avgCount = neighbourCounts.reduce((a, b) => a + b, 0) / neighbourCounts.length;
          
          console.log(`NeighbourCount范围: ${minCount} - ${maxCount}`);
          console.log(`NeighbourCount平均值: ${avgCount.toFixed(2)}`);
          console.log(`期望最小NeighbourCount: >= ${testCase.expectedMin}`);
          
          // 验证所有站点都满足条件
          const invalidSites = sites.filter(s => (s.neighbourCountWithin5Km || 0) < testCase.expectedMin);
          if (invalidSites.length === 0) {
            console.log(`✅ 验证通过: 所有站点都满足neighbourCount >= ${testCase.expectedMin}`);
          } else {
            console.log(`❌ 验证失败: ${invalidSites.length}个站点不满足条件`);
            invalidSites.slice(0, 5).forEach(site => {
              console.log(`   站点 ${site.siteName}: neighbourCount=${site.neighbourCountWithin5Km || 0}`);
            });
          }
          
          // 显示前5个站点的详细信息
          console.log('\n前5个站点的详细信息:');
          sites.slice(0, 5).forEach((site, i) => {
            console.log(`  ${i + 1}. ${site.siteName || 'N/A'}`);
            console.log(`     NeighbourCount: ${site.neighbourCountWithin5Km || 0}`);
            console.log(`     坐标: (${site.lat}, ${site.lng})`);
          });
        } else {
          console.log('⚠️  没有站点返回');
        }
      } else {
        console.error('❌ API调用失败:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ 错误:', error.message);
    }
  }
}

testDensityLogic();
