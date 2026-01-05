const http = require('http');

// 默认筛选条件
const defaultFilters = {
  region: 'Cambridgeshire',
  utilisationBandMax: 40,
  onanRatingMin: 1000,
  densityRadius: 3,
  minSupplies: 3
};

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

async function testFilters() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试Cambridgeshire区域默认筛选条件                          ║');
  console.log('║  Testing Cambridgeshire with Default Filter Conditions       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('默认筛选条件 / Default Filter Conditions:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`• Region: ${defaultFilters.region}`);
  console.log(`• Max Utilisation: ≤${defaultFilters.utilisationBandMax}%`);
  console.log(`• Min ONAN Rating: ≥${defaultFilters.onanRatingMin} kVA`);
  console.log(`• Density Radius: ${defaultFilters.densityRadius} km`);
  console.log(`• Min Supplies in Radius: ≥${defaultFilters.minSupplies}\n`);

  // 构建查询URL
  const params = new URLSearchParams();
  params.append('region', defaultFilters.region);
  params.append('utilisationBandMax', defaultFilters.utilisationBandMax);
  params.append('onanRatingMin', defaultFilters.onanRatingMin);
  params.append('densityRadius', defaultFilters.densityRadius);
  params.append('minSupplies', defaultFilters.minSupplies);
  params.append('limit', '10000'); // 获取所有结果

  const url = `http://localhost:3000/api/power-supplies?${params}`;
  console.log('📡 API请求URL:');
  console.log(`   ${url}\n`);

  try {
    const result = await testAPI(url);
    
    if (result.success) {
      const sites = result.data || [];
      const count = result.count || sites.length;
      
      console.log('✅ 筛选结果 / Filter Results:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`符合所有条件的站点数量: ${count.toLocaleString()}\n`);

      if (sites.length > 0) {
        console.log('📊 示例站点信息 (前5个) / Sample Sites (First 5):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        sites.slice(0, 5).forEach((site, index) => {
          console.log(`\n站点 ${index + 1}:`);
          console.log(`  • Site Name: ${site.siteName || 'N/A'}`);
          console.log(`  • Local Authority: ${site.localAuthority || 'N/A'}`);
          console.log(`  • Utilisation: ${site.utilisationBandPercent || 'N/A'}%`);
          console.log(`  • ONAN Rating: ${site.onanRatingKva || 'N/A'} kVA`);
          console.log(`  • Neighbour Count: ${site.neighbourCountWithin5Km || 0}`);
          console.log(`  • Coordinates: (${site.lat || 'N/A'}, ${site.lng || 'N/A'})`);
        });
      }

      // 统计信息
      if (sites.length > 0) {
        const avgUtil = sites.reduce((sum, s) => sum + (s.utilisationBandPercent || 0), 0) / sites.length;
        const avgOnan = sites.reduce((sum, s) => sum + (s.onanRatingKva || 0), 0) / sites.length;
        const avgNeighbours = sites.reduce((sum, s) => sum + (s.neighbourCountWithin5Km || 0), 0) / sites.length;
        
        console.log('\n📈 统计信息 / Statistics:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`• 平均Utilisation: ${avgUtil.toFixed(1)}%`);
        console.log(`• 平均ONAN Rating: ${avgOnan.toFixed(0)} kVA`);
        console.log(`• 平均Neighbour Count: ${avgNeighbours.toFixed(1)}`);
      }
    } else {
      console.error('❌ API调用失败:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n请确保后端服务器正在运行 (http://localhost:3000)');
  }
}

testFilters();
