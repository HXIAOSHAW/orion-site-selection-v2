const http = require('http');

// 默认筛选条件（与前端一致）
const filters = {
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

async function verifyCount() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  验证前端和后端站点数量一致性                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const params = new URLSearchParams();
  params.append('region', filters.region);
  params.append('utilisationBandMax', filters.utilisationBandMax);
  params.append('onanRatingMin', filters.onanRatingMin);
  params.append('densityRadius', filters.densityRadius);
  params.append('minSupplies', filters.minSupplies);
  params.append('limit', '10000');

  const url = `http://localhost:3000/api/power-supplies?${params}`;
  console.log('📡 后端API请求:', url);
  console.log('筛选条件:', filters);
  console.log('');

  try {
    const result = await testAPI(url);
    
    if (result.success) {
      const sites = result.data || [];
      const count = result.count || sites.length;
      
      console.log('✅ 后端返回结果:');
      console.log(`   站点数量: ${count}`);
      console.log(`   前端显示: 177`);
      console.log(`   差异: ${Math.abs(count - 177)}`);
      console.log('');

      if (count === 177) {
        console.log('✅ 数量一致！');
      } else {
        console.log('❌ 数量不一致！');
        console.log(`   后端: ${count}`);
        console.log(`   前端: 177`);
      }

      // 检查经纬度数据
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('检查经纬度数据 / Checking Coordinates:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const sitesWithCoords = sites.filter(s => s.lat && s.lng);
      const sitesWithoutCoords = sites.length - sitesWithCoords.length;
      
      console.log(`有坐标的站点: ${sitesWithCoords.length}`);
      console.log(`无坐标的站点: ${sitesWithoutCoords}`);

      if (sitesWithCoords.length > 0) {
        // 检查坐标范围
        const lats = sitesWithCoords.map(s => s.lat).filter(lat => lat !== null);
        const lngs = sitesWithCoords.map(s => s.lng).filter(lng => lng !== null);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        console.log('\n坐标范围:');
        console.log(`   Latitude: ${minLat.toFixed(6)} 到 ${maxLat.toFixed(6)} (范围: ${(maxLat - minLat).toFixed(6)})`);
        console.log(`   Longitude: ${minLng.toFixed(6)} 到 ${maxLng.toFixed(6)} (范围: ${(maxLng - minLng).toFixed(6)})`);

        // 检查是否有异常的坐标（可能经纬度颠倒）
        const latRange = maxLat - minLat;
        const lngRange = maxLng - minLng;
        
        console.log('\n坐标分布分析:');
        if (latRange < 0.1) {
          console.log('⚠️  警告: Latitude范围很小，站点可能集中在一条线上');
        }
        if (lngRange < 0.1) {
          console.log('⚠️  警告: Longitude范围很小，站点可能集中在一条线上');
        }
        if (latRange > lngRange * 10) {
          console.log('⚠️  警告: Latitude范围远大于Longitude，可能经纬度颠倒');
        }
        if (lngRange > latRange * 10) {
          console.log('⚠️  警告: Longitude范围远大于Latitude，可能经纬度颠倒');
        }

        // 显示前10个站点的坐标
        console.log('\n前10个站点的坐标:');
        sitesWithCoords.slice(0, 10).forEach((site, i) => {
          console.log(`   ${i + 1}. ${site.siteName || 'N/A'}: (${site.lat}, ${site.lng})`);
        });
      }
    } else {
      console.error('❌ API调用失败:', result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('\n请确保后端服务器正在运行 (http://localhost:3000)');
  }
}

verifyCount();
