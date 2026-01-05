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

async function analyze() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  分析Density筛选逻辑是否符合要求                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('要求分析:');
  console.log('  4. 在半径R内，至少有N个附近的电源站点');
  console.log('     附近的站点必须也满足ONAN和utilisation阈值\n');

  // 获取基本筛选的站点（无density）
  const basicResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  const basicSites = basicResult.data || [];
  console.log(`基本筛选（无density）: ${basicSites.length} 个站点\n`);

  // 获取带density筛选的站点
  const densityResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3'
  );
  const densitySites = densityResult.data || [];
  console.log(`Density筛选后: ${densitySites.length} 个站点\n`);

  // 检查：邻居数计算是否基于已通过基本筛选的站点
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('验证: 邻居数计算是否基于已通过基本筛选的站点');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 选择一个站点进行详细分析
  if (densitySites.length > 0) {
    const testSite = densitySites[0];
    console.log(`测试站点: ${testSite.siteName}`);
    console.log(`  坐标: (${testSite.lat}, ${testSite.lng})`);
    console.log(`  报告的邻居数: ${testSite.neighbourCountWithin5Km || 0}\n`);

    // 方法1: 在基本筛选的站点中计算邻居数
    let neighboursFromBasic = 0;
    basicSites.forEach(otherSite => {
      if (otherSite.siteName === testSite.siteName) return;
      if (!otherSite.lat || !otherSite.lng) return;
      
      const R = 6371;
      const dLat = (otherSite.lat - testSite.lat) * Math.PI / 180;
      const dLng = (otherSite.lng - testSite.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(testSite.lat * Math.PI / 180) * Math.cos(otherSite.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance <= 5) {
        neighboursFromBasic++;
      }
    });

    console.log(`  在基本筛选站点中计算的邻居数: ${neighboursFromBasic}`);
    console.log(`  后端报告的邻居数: ${testSite.neighbourCountWithin5Km || 0}`);
    
    if (Math.abs(neighboursFromBasic - (testSite.neighbourCountWithin5Km || 0)) <= 1) {
      console.log(`  ✅ 邻居数计算基于已通过基本筛选的站点（正确）`);
    } else {
      console.log(`  ⚠️  差异较大，可能邻居数计算逻辑有问题`);
    }

    // 验证邻居站点是否都满足基本条件
    console.log(`\n  验证邻居站点是否满足基本条件:`);
    let validNeighbours = 0;
    let invalidNeighbours = 0;
    
    basicSites.forEach(otherSite => {
      if (otherSite.siteName === testSite.siteName) return;
      if (!otherSite.lat || !otherSite.lng) return;
      
      const R = 6371;
      const dLat = (otherSite.lat - testSite.lat) * Math.PI / 180;
      const dLng = (otherSite.lng - testSite.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(testSite.lat * Math.PI / 180) * Math.cos(otherSite.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance <= 5) {
        // 检查是否满足基本条件
        const utilValid = otherSite.utilisationBandPercent !== null && 
                         (otherSite.utilisationBandPercent === 20 || otherSite.utilisationBandPercent === 40);
        const onanValid = otherSite.onanRatingKva !== null && otherSite.onanRatingKva >= 1000;
        
        if (utilValid && onanValid) {
          validNeighbours++;
        } else {
          invalidNeighbours++;
          if (invalidNeighbours <= 3) {
            console.log(`     ⚠️  邻居站点 ${otherSite.siteName} 不满足条件:`);
            console.log(`        Util: ${otherSite.utilisationBandPercent}%, ONAN: ${otherSite.onanRatingKva} kVA`);
          }
        }
      }
    });

    console.log(`  满足条件的邻居: ${validNeighbours}`);
    console.log(`  不满足条件的邻居: ${invalidNeighbours}`);
    
    if (invalidNeighbours === 0) {
      console.log(`  ✅ 所有邻居站点都满足基本筛选条件`);
    } else {
      console.log(`  ⚠️  有 ${invalidNeighbours} 个邻居站点不满足基本筛选条件`);
      console.log(`     这说明邻居数计算可能包含了未通过基本筛选的站点`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 分析完成 / Analysis Complete                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

analyze().catch(err => {
  console.error('❌ 分析失败:', err.message);
  process.exit(1);
});
