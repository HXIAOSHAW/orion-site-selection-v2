const http = require('http');

// 从用户提供的数据中提取站点名称
const csvSiteNames = [
  'EPN-S0000004U2443', 'EPN-S0000004U1076', 'EPN-S0000004U1791', 'EPN-S0000004U3881',
  'EPN-S0000004U1428', 'EPN-S0000004U2421', 'EPN-S0000004U0253', 'EPN-S0000004U2892',
  'EPN-S0000006U1182', 'EPN-S0000004U1059', 'EPN-S0000004U1729', 'EPN-S0000004U1856',
  'EPN-S0000004U5122', 'EPN-S0000004U2694', 'EPN-S0000004U2948', 'EPN-S0000004U2478',
  'EPN-S0000004U0092', 'EPN-S0000004U5098', 'EPN-S0000006U0817', 'EPN-S0000004U2292',
  'EPN-S0000004U2643', 'EPN-S0000004U0040', 'EPN-S0000004U0054', 'EPN-S0000004U3584',
  'EPN-S0000004U1242', 'EPN-S0000004U1287', 'EPN-S0000004U5519', 'EPN-S0000004U2044',
  'EPN-S0000004U0035', 'EPN-S0000004U2477', 'EPN-S0000004U1580', 'EPN-S0000004U1359',
  'EPN-S0000004U1746', 'EPN-S0000004U2470', 'EPN-S0000004U2718', 'EPN-S0000004U2910',
  'EPN-S0000004U2318', 'EPN-S0000004U3437', 'EPN-S0000004U1656', 'EPN-S0000004U2411',
  'EPN-S0000004U1249', 'EPN-S0000004U1083', 'EPN-S0000004U1152', 'EPN-S0000006U0850',
  'EPN-S0000004U2742', 'EPN-S0000004U2603', 'EPN-S0000004U0016', 'EPN-S0000004U0028',
  'EPN-S0000004U1113', 'EPN-S000000GH4085', 'EPN-S0000004U3868', 'EPN-S0000004U3613',
  'EPN-S0000004U1543', 'EPN-S0000004U1193', 'EPN-S0000004U1419', 'EPN-S0000004U2849',
  'EPN-S0000004U1825', 'EPN-S0000004U2538', 'EPN-S0000004U2883', 'EPN-S0000004U1844',
  'EPN-S0000004U2345', 'EPN-S0000004U1814', 'EPN-S0000004U2787', 'EPN-S0000004U1407',
  'EPN-S0000004U2180', 'EPN-S0000004U1226', 'EPN-S0000004U5075', 'EPN-S0000004U2747',
  'EPN-S0000004U0118', 'EPN-S0000004U2562', 'EPN-S0000004U2514', 'EPN-S0000004U1180',
  'EPN-S0000004U2572', 'EPN-S0000004U2428', 'EPN-S0000004U3026', 'EPN-S0000004U0128',
  'EPN-S0000004U1769', 'EPN-S0000004U0114', 'EPN-S0000004U1378', 'EPN-S0000004U2491',
  'EPN-S0000004U2880', 'EPN-S0000006U0945', 'EPN-S0000004U1229', 'EPN-S0000004U2039',
  'EPN-S0000004U1751', 'EPN-S0000006U1246', 'EPN-S0000004U2739', 'EPN-S0000004U0205',
  'EPN-S0000004U4106', 'EPN-S0000004U2619', 'EPN-S0000006U0742', 'EPN-S0000004U3479',
  'EPN-S0000004U2731', 'EPN-S0000006U0734', 'EPN-S0000006U1179', 'EPN-S0000004U3390',
  'EPN-S0000004U1335', 'EPN-S0000004U1112', 'EPN-S0000004U2894', 'EPN-S0000004U2642',
  'EPN-S0000004U1846', 'EPN-S0000004U2901', 'EPN-S0000006U0802', 'EPN-S0000004U2733',
  'EPN-S0000004U0147', 'EPN-S0000004U1341', 'EPN-S0000004U2854', 'EPN-S0000006U1096',
  'EPN-S0000004U3059', 'EPN-S0000004U3740', 'EPN-S0000004U1061', 'EPN-S0000004U1308',
  'EPN-S0000004U2599', 'EPN-S0000004U3827', 'EPN-S0000004U2862', 'EPN-S0000004U1713',
  'EPN-S0000006U0831', 'EPN-S0000004U0105', 'EPN-S0000004U2615', 'EPN-S0000004U3456',
  'EPN-S0000004U1347', 'EPN-S0000004U2977', 'EPN-S0000004U2445', 'EPN-S0000006U0880',
  'EPN-S0000004U5073', 'EPN-S0000004U5120', 'EPN-S0000004U0214', 'EPN-S0000004U1720',
  'EPN-S0000004U2852', 'EPN-S0000004U1178', 'EPN-S0000004U1286', 'EPN-S0000006U1080',
  'EPN-S0000004U1153', 'EPN-S0000004U2607', 'EPN-S0000004U1344', 'EPN-S0000004U1326',
  'EPN-S0000004U1206', 'EPN-S0000004U1361', 'EPN-S0000004U0052', 'EPN-S0000004U2786',
  'EPN-S0000006U1341', 'EPN-S0000004U1643', 'EPN-S0000004U2879', 'EPN-S0000004U5121',
  'EPN-S0000004U1338', 'EPN-S0000004U1038', 'EPN-S0000006U1227', 'EPN-S0000004U0174',
  'EPN-S0000004U2258', 'EPN-S0000004U2541', 'EPN-S0000004U2056', 'EPN-S0000004U1672',
  'EPN-S0000004U5542', 'EPN-S0000004U2080', 'EPN-S0000004U0014', 'EPN-S0000004U2328',
  'EPN-S0000006U1325', 'EPN-S0000004U5099', 'EPN-S0000004U2809', 'EPN-S0000004U2390',
  'EPN-S0000004U2427', 'EPN-S0000004U2758', 'EPN-S0000004U1265', 'EPN-S0000004U1011',
  'EPN-S0000004U2710', 'EPN-S0000004U1662', 'EPN-S0000004U5205', 'EPN-S0000004U5076',
  'EPN-S0000004U2528', 'EPN-S0000004U2750'
];

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
  console.log('║  对比CSV数据与后端筛选结果 / Compare CSV vs Backend Results  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`CSV中满足条件的站点数: ${csvSiteNames.length}\n`);

  // 测试后端筛选
  const result = await testAPI(
    'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire&utilisationBandMax=40&onanRatingMin=1000'
  );

  const backendSites = result.data || [];
  console.log(`后端返回的站点数: ${backendSites.length}\n`);

  // 创建后端站点名称集合
  const backendSiteNames = new Set(backendSites.map(s => s.siteName));

  // 检查CSV中的站点是否都在后端结果中
  const missingInBackend = [];
  const foundInBackend = [];

  csvSiteNames.forEach(siteName => {
    if (backendSiteNames.has(siteName)) {
      foundInBackend.push(siteName);
    } else {
      missingInBackend.push(siteName);
    }
  });

  // 检查后端结果中是否有CSV中没有的站点
  const extraInBackend = backendSites
    .filter(s => !csvSiteNames.includes(s.siteName))
    .map(s => s.siteName);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('对比结果 / Comparison Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`✅ CSV中的站点在后端找到: ${foundInBackend.length}/${csvSiteNames.length}`);
  console.log(`❌ CSV中的站点在后端缺失: ${missingInBackend.length}`);
  console.log(`⚠️  后端中额外的站点: ${extraInBackend.length}\n`);

  if (missingInBackend.length > 0) {
    console.log('缺失的站点 (前10个):');
    missingInBackend.slice(0, 10).forEach(name => {
      console.log(`  - ${name}`);
    });
    if (missingInBackend.length > 10) {
      console.log(`  ... 还有 ${missingInBackend.length - 10} 个`);
    }
    console.log('');
  }

  if (extraInBackend.length > 0) {
    console.log('后端中额外的站点 (前10个):');
    extraInBackend.slice(0, 10).forEach(name => {
      const site = backendSites.find(s => s.siteName === name);
      console.log(`  - ${name} (Util: ${site?.utilisationBandPercent}%, ONAN: ${site?.onanRatingKva} kVA)`);
    });
    if (extraInBackend.length > 10) {
      console.log(`  ... 还有 ${extraInBackend.length - 10} 个`);
    }
    console.log('');
  }

  // 检查缺失站点的详细信息
  if (missingInBackend.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('检查缺失站点的详细信息 / Check Missing Sites Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 获取所有Cambridgeshire站点
    const allSites = await testAPI(
      'http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire'
    );

    missingInBackend.slice(0, 5).forEach(siteName => {
      const site = allSites.data.find(s => s.siteName === siteName);
      if (site) {
        console.log(`${siteName}:`);
        console.log(`  Util: ${site.utilisationBandPercent}%, ONAN: ${site.onanRatingKva} kVA`);
        console.log(`  是否满足条件: Util≤40%: ${site.utilisationBandPercent <= 40}, ONAN≥1000: ${site.onanRatingKva >= 1000}`);
      } else {
        console.log(`${siteName}: 在后端数据中未找到`);
      }
      console.log('');
    });
  }

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  测试完成 / Test Complete                                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

runTest().catch(err => {
  console.error('❌ 测试失败:', err.message);
  process.exit(1);
});
