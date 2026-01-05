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

async function debugCoordinates() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  调试坐标数据 - 检查经纬度列索引                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const params = new URLSearchParams();
  params.append('region', 'Cambridgeshire');
  params.append('utilisationBandMax', '40');
  params.append('onanRatingMin', '1000');
  params.append('densityRadius', '3');
  params.append('minSupplies', '3');
  params.append('limit', '10'); // 只获取10个站点用于调试

  const url = `http://localhost:3000/api/power-supplies?${params}`;
  
  try {
    const result = await testAPI(url);
    
    if (result.success && result.data) {
      const sites = result.data;
      console.log(`获取到 ${sites.length} 个站点用于分析\n`);
      
      console.log('前10个站点的坐标数据:');
      console.log('='.repeat(80));
      sites.slice(0, 10).forEach((site, i) => {
        console.log(`\n站点 ${i + 1}: ${site.siteName || 'N/A'}`);
        console.log(`  lat: ${site.lat}`);
        console.log(`  lng: ${site.lng}`);
        console.log(`  localAuthority: ${site.localAuthority || 'N/A'}`);
        console.log(`  town: ${site.town || 'N/A'}`);
      });
      
      // 分析坐标分布
      const lats = sites.map(s => s.lat).filter(lat => lat !== null && lat !== undefined);
      const lngs = sites.map(s => s.lng).filter(lng => lng !== null && lng !== undefined);
      
      if (lats.length > 0 && lngs.length > 0) {
        const uniqueLats = [...new Set(lats.map(l => l.toFixed(2)))];
        const uniqueLngs = [...new Set(lngs.map(l => l.toFixed(2)))];
        
        console.log('\n' + '='.repeat(80));
        console.log('坐标分布分析:');
        console.log('='.repeat(80));
        console.log(`唯一Latitude值数量: ${uniqueLats.length}`);
        console.log(`唯一Longitude值数量: ${uniqueLngs.length}`);
        console.log(`Latitude范围: ${Math.min(...lats).toFixed(6)} 到 ${Math.max(...lats).toFixed(6)}`);
        console.log(`Longitude范围: ${Math.min(...lngs).toFixed(6)} 到 ${Math.max(...lngs).toFixed(6)}`);
        
        if (uniqueLats.length === 1) {
          console.log('\n⚠️  问题: 所有站点的Latitude都相同！');
          console.log(`   所有Latitude值都是: ${uniqueLats[0]}`);
          console.log('   这会导致所有站点在地图上显示为一条直线');
          console.log('   可能原因: 列索引错误，或者CSV中Latitude列的值确实都相同');
        }
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

debugCoordinates();
