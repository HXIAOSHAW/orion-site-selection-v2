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

async function runTest() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试Density和Suppliers in Radius筛选逻辑                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('筛选条件要求:');
  console.log('  1. Region筛选（已测试通过）');
  console.log('  2. Utilisation ≤ 阈值（已测试通过）');
  console.log('  3. ONAN ≥ 阈值（已测试通过）');
  console.log('  4. 在半径R内，至少有N个附近的电源站点');
  console.log('     附近的站点必须也满足ONAN和utilisation阈值\n');

  // 测试1: 基本筛选（无density）
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试1: 基本筛选（无density条件）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const basicResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  console.log(`✅ 基本筛选返回: ${basicResult.count} 个站点\n`);

  // 测试2: 添加density筛选
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试2: 添加density筛选 (radius=5km, minSupplies=3)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const densityResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3'
  );
  console.log(`✅ Density筛选返回: ${densityResult.count} 个站点`);
  
  if (densityResult.data && densityResult.data.length > 0) {
    // 检查前5个站点的neighbourCount
    console.log('\n前5个站点的邻居数:');
    densityResult.data.slice(0, 5).forEach((site, i) => {
      const neighbours = site.neighbourCountWithin5Km || 0;
      console.log(`  ${i+1}. ${site.siteName}: ${neighbours} 个邻居`);
      if (neighbours < 3) {
        console.log(`     ⚠️  警告: 邻居数 < 3，但通过了筛选！`);
      }
    });
  }

  // 测试3: 验证邻居数计算是否正确
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试3: 验证邻居数计算逻辑');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 获取一个站点，手动验证其邻居数
  if (densityResult.data && densityResult.data.length > 0) {
    const testSite = densityResult.data[0];
    console.log(`测试站点: ${testSite.siteName}`);
    console.log(`  坐标: (${testSite.lat}, ${testSite.lng})`);
    console.log(`  报告的邻居数: ${testSite.neighbourCountWithin5Km || 0}`);
    console.log(`  Utilisation: ${testSite.utilisationBandPercent}%`);
    console.log(`  ONAN: ${testSite.onanRatingKva} kVA`);
    
    // 获取所有基本筛选的站点，手动计算邻居数
    console.log('\n  手动验证邻居数计算:');
    let manualCount = 0;
    basicResult.data.forEach(otherSite => {
      if (otherSite.siteName === testSite.siteName) return; // 跳过自己
      if (!otherSite.lat || !otherSite.lng) return; // 跳过无坐标的
      
      // 计算距离（使用简化的Haversine公式）
      const R = 6371; // 地球半径（公里）
      const dLat = (otherSite.lat - testSite.lat) * Math.PI / 180;
      const dLng = (otherSite.lng - testSite.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(testSite.lat * Math.PI / 180) * Math.cos(otherSite.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance <= 5) {
        manualCount++;
      }
    });
    
    console.log(`  手动计算的邻居数（5km内）: ${manualCount}`);
    if (Math.abs(manualCount - (testSite.neighbourCountWithin5Km || 0)) > 1) {
      console.log(`  ⚠️  差异: 手动计算 ${manualCount} vs 后端报告 ${testSite.neighbourCountWithin5Km || 0}`);
    } else {
      console.log(`  ✅ 邻居数计算正确`);
    }
  }

  // 测试4: 检查筛选逻辑是否符合要求
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('测试4: 验证筛选逻辑是否符合要求');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('要求: 附近的站点必须也满足ONAN和utilisation阈值');
  console.log('验证: 检查返回的站点是否都满足所有条件\n');
  
  if (densityResult.data && densityResult.data.length > 0) {
    let allValid = true;
    densityResult.data.slice(0, 10).forEach((site, i) => {
      const issues = [];
      
      // 检查1: Region
      if (!site.localAuthority || !site.localAuthority.toLowerCase().includes('cambridgeshire')) {
        issues.push('Region不匹配');
      }
      
      // 检查2: Utilisation
      if (site.utilisationBandPercent === null || site.utilisationBandPercent === undefined) {
        issues.push('Utilisation为null');
      } else if (site.utilisationBandPercent > 40) {
        issues.push(`Utilisation ${site.utilisationBandPercent}% > 40%`);
      }
      
      // 检查3: ONAN
      if (site.onanRatingKva === null || site.onanRatingKva === undefined) {
        issues.push('ONAN为null');
      } else if (site.onanRatingKva < 1000) {
        issues.push(`ONAN ${site.onanRatingKva} kVA < 1000 kVA`);
      }
      
      // 检查4: 邻居数
      const neighbours = site.neighbourCountWithin5Km || 0;
      if (neighbours < 3) {
        issues.push(`邻居数 ${neighbours} < 3`);
      }
      
      if (issues.length > 0) {
        console.log(`  ${i+1}. ${site.siteName}: ❌ ${issues.join(', ')}`);
        allValid = false;
      }
    });
    
    if (allValid) {
      console.log('✅ 前10个站点都满足所有筛选条件');
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 测试完成 / Test Complete                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runTest().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
