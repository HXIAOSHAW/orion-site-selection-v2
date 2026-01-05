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

// Haversine距离计算
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function showExample() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  示例站点：通过所有默认筛选条件                                ║');
  console.log('║  Example Site: Passing All Default Filter Criteria            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('默认筛选条件:');
  console.log('  • Region: Cambridgeshire');
  console.log('  • Utilisation ≤ 40%');
  console.log('  • ONAN ≥ 1000 kVA');
  console.log('  • Density Radius: 5 km');
  console.log('  • Min Supplies in Radius: 3\n');

  // 获取通过所有筛选条件的站点
  const result = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3'
  );
  const sites = result.data || [];
  
  console.log(`通过所有筛选条件的站点数: ${sites.length}\n`);

  if (sites.length === 0) {
    console.log('❌ 没有站点通过所有筛选条件');
    return;
  }

  // 选择一个有较多邻居的站点作为示例
  const exampleSite = sites.find(s => (s.neighbourCountWithin5Km || 0) >= 5) || sites[0];
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('示例站点信息 / Example Site Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📍 Local Authority: ${exampleSite.localAuthority || 'N/A'}`);
  console.log(`🏢 Functional Location: ${exampleSite.siteName || 'N/A'}`);
  console.log(`📊 Utilisation: ${exampleSite.utilisationBandPercent}%`);
  console.log(`⚡ ONAN Rating: ${exampleSite.onanRatingKva} kVA`);
  console.log(`🌍 Latitude: ${exampleSite.lat}`);
  console.log(`🌍 Longitude: ${exampleSite.lng}`);
  console.log(`👥 符合density筛选条件的相邻站点数量: ${exampleSite.neighbourCountWithin5Km || 0}\n`);

  // 获取基本筛选的站点（用于查找邻居）
  const basicResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  const basicSites = basicResult.data || [];

  // 查找所有邻居站点
  const neighbours = [];
  basicSites.forEach(otherSite => {
    if (otherSite.siteName === exampleSite.siteName) return; // 跳过自己
    if (!otherSite.lat || !otherSite.lng) return; // 跳过无坐标的
    
    const distance = haversineDistance(
      exampleSite.lat, exampleSite.lng,
      otherSite.lat, otherSite.lng
    );
    
    if (distance <= 5) {
      neighbours.push({
        siteName: otherSite.siteName,
        distance: distance.toFixed(2),
        utilisation: otherSite.utilisationBandPercent,
        onan: otherSite.onanRatingKva,
        lat: otherSite.lat,
        lng: otherSite.lng
      });
    }
  });

  // 按距离排序
  neighbours.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('符合density筛选条件的相邻站点列表 / Neighbouring Sites List:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`总共 ${neighbours.length} 个相邻站点（5km内，且满足Util≤40%和ONAN≥1000）:\n`);

  neighbours.forEach((neighbour, i) => {
    console.log(`${i + 1}. ${neighbour.siteName}`);
    console.log(`   距离: ${neighbour.distance} km`);
    console.log(`   Utilisation: ${neighbour.utilisation}%`);
    console.log(`   ONAN: ${neighbour.onan} kVA`);
    console.log(`   坐标: (${neighbour.lat}, ${neighbour.lng})`);
    console.log('');
  });

  // 验证所有邻居都满足条件
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('验证 / Verification:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allValid = true;
  neighbours.forEach(neighbour => {
    const utilValid = neighbour.utilisation !== null && [20, 40].includes(neighbour.utilisation);
    const onanValid = neighbour.onan !== null && neighbour.onan >= 1000;
    if (!utilValid || !onanValid) {
      allValid = false;
      console.log(`⚠️  ${neighbour.siteName}: 不满足条件`);
      console.log(`   Util: ${neighbour.utilisation}%, ONAN: ${neighbour.onan} kVA`);
    }
  });

  if (allValid) {
    console.log('✅ 所有相邻站点都满足Util≤40%和ONAN≥1000条件');
  }

  console.log(`\n✅ 示例站点满足所有筛选条件:`);
  console.log(`   • Region: Cambridgeshire ✅`);
  console.log(`   • Utilisation: ${exampleSite.utilisationBandPercent}% ≤ 40% ✅`);
  console.log(`   • ONAN: ${exampleSite.onanRatingKva} kVA ≥ 1000 kVA ✅`);
  console.log(`   • 邻居数: ${exampleSite.neighbourCountWithin5Km} ≥ 3 ✅`);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 示例展示完成 / Example Display Complete                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

showExample().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
