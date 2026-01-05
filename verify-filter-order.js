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

async function verify() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  验证筛选逻辑顺序和协作 / Verify Filter Order & Collaboration ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('要求:');
  console.log('  1. Region筛选');
  console.log('  2. Utilisation ≤ 阈值');
  console.log('  3. ONAN ≥ 阈值');
  console.log('  4. 在半径R内，至少有N个附近的电源站点');
  console.log('     附近的站点必须也满足ONAN和utilisation阈值\n');

  // 测试完整的筛选流程
  const fullResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000&densityRadius=5&minSupplies=3'
  );
  const fullSites = fullResult.data || [];
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('完整筛选结果验证:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`返回站点数: ${fullSites.length}\n`);

  // 验证每个站点是否满足所有条件
  let allValid = true;
  let issues = [];

  fullSites.forEach((site, i) => {
    const siteIssues = [];

    // 条件1: Region
    if (!site.localAuthority || !site.localAuthority.toLowerCase().includes('cambridgeshire')) {
      siteIssues.push('Region不匹配');
    }

    // 条件2: Utilisation ≤ 40%
    if (site.utilisationBandPercent === null || site.utilisationBandPercent === undefined) {
      siteIssues.push('Utilisation为null');
    } else if (![20, 40].includes(site.utilisationBandPercent)) {
      siteIssues.push(`Utilisation ${site.utilisationBandPercent}% 不在允许范围内[20, 40]`);
    }

    // 条件3: ONAN ≥ 1000
    if (site.onanRatingKva === null || site.onanRatingKva === undefined) {
      siteIssues.push('ONAN为null');
    } else if (site.onanRatingKva < 1000) {
      siteIssues.push(`ONAN ${site.onanRatingKva} kVA < 1000 kVA`);
    }

    // 条件4: 邻居数 ≥ 3
    const neighbours = site.neighbourCountWithin5Km || 0;
    if (neighbours < 3) {
      siteIssues.push(`邻居数 ${neighbours} < 3`);
    }

    if (siteIssues.length > 0) {
      allValid = false;
      if (issues.length < 5) {
        issues.push({
          site: site.siteName,
          issues: siteIssues
        });
      }
    }
  });

  if (allValid) {
    console.log('✅ 所有站点都满足所有筛选条件\n');
  } else {
    console.log(`❌ 发现 ${issues.length} 个站点不满足条件:\n`);
    issues.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.site}:`);
      item.issues.forEach(issue => {
        console.log(`     - ${issue}`);
      });
    });
    console.log('');
  }

  // 验证邻居站点是否满足基本条件
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('验证: 邻居站点是否满足ONAN和utilisation阈值');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 获取基本筛选的站点（用于验证邻居）
  const basicResult = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );
  const basicSites = basicResult.data || [];

  // 检查一个站点的邻居是否都满足条件
  if (fullSites.length > 0) {
    const testSite = fullSites[0];
    console.log(`测试站点: ${testSite.siteName}`);
    console.log(`  坐标: (${testSite.lat}, ${testSite.lng})`);
    console.log(`  报告的邻居数: ${testSite.neighbourCountWithin5Km || 0}\n`);

    // 在基本筛选的站点中查找邻居
    const neighbours = [];
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
        neighbours.push({
          site: otherSite.siteName,
          distance: distance.toFixed(2),
          utilisation: otherSite.utilisationBandPercent,
          onan: otherSite.onanRatingKva
        });
      }
    });

    console.log(`  找到 ${neighbours.length} 个邻居站点（在基本筛选结果中）\n`);

    // 检查邻居是否都满足条件
    let validNeighbours = 0;
    let invalidNeighbours = 0;
    
    neighbours.forEach(neighbour => {
      const utilValid = neighbour.utilisation !== null && [20, 40].includes(neighbour.utilisation);
      const onanValid = neighbour.onan !== null && neighbour.onan >= 1000;
      
      if (utilValid && onanValid) {
        validNeighbours++;
      } else {
        invalidNeighbours++;
        if (invalidNeighbours <= 3) {
          console.log(`  ⚠️  邻居 ${neighbour.site}:`);
          console.log(`     Util: ${neighbour.utilisation}%, ONAN: ${neighbour.onan} kVA`);
          console.log(`     距离: ${neighbour.distance} km`);
        }
      }
    });

    console.log(`\n  满足条件的邻居: ${validNeighbours}`);
    console.log(`  不满足条件的邻居: ${invalidNeighbours}`);
    
    if (invalidNeighbours === 0) {
      console.log(`  ✅ 所有邻居站点都满足ONAN和utilisation阈值（符合要求）`);
    } else {
      console.log(`  ❌ 有 ${invalidNeighbours} 个邻居站点不满足条件`);
      console.log(`     这说明邻居数计算可能包含了未通过基本筛选的站点`);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ✅ 验证完成 / Verification Complete                             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

verify().catch(err => {
  console.error('❌ 验证失败:', err.message);
  process.exit(1);
});
