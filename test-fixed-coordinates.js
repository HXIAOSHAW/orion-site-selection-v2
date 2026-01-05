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

async function verifyFixedCoordinates() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  验证修复后的坐标数据                                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const params = new URLSearchParams();
  params.append('region', 'Cambridgeshire');
  params.append('utilisationBandMax', '40');
  params.append('onanRatingMin', '1000');
  params.append('densityRadius', '3');
  params.append('minSupplies', '3');
  params.append('limit', '20');

  const url = `http://localhost:3000/api/power-supplies?${params}`;
  
  try {
    const result = await testAPI(url);
    
    if (result.success && result.data) {
      const sites = result.data;
      console.log(`获取到 ${sites.length} 个站点\n`);
      
      // 检查坐标分布
      const lats = sites.map(s => s.lat).filter(lat => lat !== null && lat !== undefined);
      const lngs = sites.map(s => s.lng).filter(lng => lng !== null && lng !== undefined);
      
      if (lats.length > 0 && lngs.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        console.log('坐标范围:');
        console.log(`  Latitude: ${minLat.toFixed(6)} 到 ${maxLat.toFixed(6)} (范围: ${(maxLat - minLat).toFixed(6)})`);
        console.log(`  Longitude: ${minLng.toFixed(6)} 到 ${maxLng.toFixed(6)} (范围: ${(maxLng - minLng).toFixed(6)})`);
        console.log('');
        
        const uniqueLats = [...new Set(lats.map(l => l.toFixed(2)))];
        console.log(`唯一Latitude值数量: ${uniqueLats.length}`);
        
        if (uniqueLats.length > 1) {
          console.log('✅ 修复成功！Latitude现在有多个不同的值');
        } else {
          console.log('❌ 仍然有问题：所有Latitude值都相同');
        }
        
        // 显示前10个站点的坐标
        console.log('\n前10个站点的坐标:');
        console.log('='.repeat(80));
        sites.slice(0, 10).forEach((site, i) => {
          console.log(`${i + 1}. ${site.siteName || 'N/A'}: (${site.lat}, ${site.lng})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n请确保后端服务器正在运行，并且已重启以加载修复后的代码');
  }
}

verifyFixedCoordinates();
