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
  console.log('║  分析 Utilisation 字段分布特征                                 ║');
  console.log('║  Analyze Utilisation Field Distribution                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 获取Cambridgeshire的所有站点
  const result = await testAPI('http://localhost:3000/api/power-supplies?limit=10000&region=Cambridgeshire');
  const sites = result.data || [];
  
  console.log(`总站点数: ${sites.length}\n`);
  
  // 统计所有唯一的Utilisation值
  const uniqueValues = new Set();
  const valueCounts = {};
  
  sites.forEach(site => {
    const util = site.utilisationBandPercent;
    if (util !== null && util !== undefined) {
      uniqueValues.add(util);
      valueCounts[util] = (valueCounts[util] || 0) + 1;
    }
  });
  
  // 排序并显示
  const sortedValues = Array.from(uniqueValues).sort((a, b) => a - b);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('所有唯一的 Utilisation 值 / All Unique Utilisation Values:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`共 ${sortedValues.length} 个不同的值\n`);
  
  // 显示前50个值及其计数
  console.log('前50个值及其出现次数:');
  sortedValues.slice(0, 50).forEach(val => {
    console.log(`  ${val}%: ${valueCounts[val]} 个站点`);
  });
  
  if (sortedValues.length > 50) {
    console.log(`  ... 还有 ${sortedValues.length - 50} 个其他值`);
  }
  
  // 分析区间分布
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('区间分布分析 / Interval Distribution Analysis:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const intervals = {
    '0-10': { min: 0, max: 10, count: 0 },
    '10-20': { min: 10, max: 20, count: 0 },
    '20-30': { min: 20, max: 30, count: 0 },
    '30-40': { min: 30, max: 40, count: 0 },
    '40-50': { min: 40, max: 50, count: 0 },
    '50-60': { min: 50, max: 60, count: 0 },
    '60-70': { min: 60, max: 70, count: 0 },
    '70-80': { min: 70, max: 80, count: 0 },
    '80-90': { min: 80, max: 90, count: 0 },
    '90-100': { min: 90, max: 100, count: 0 },
    '>100': { min: 100, max: Infinity, count: 0 }
  };
  
  sites.forEach(site => {
    const util = site.utilisationBandPercent;
    if (util !== null && util !== undefined) {
      for (const [key, interval] of Object.entries(intervals)) {
        if (util >= interval.min && util < interval.max) {
          interval.count++;
          break;
        }
      }
    }
  });
  
  console.log('\n按10%区间分组:');
  Object.entries(intervals).forEach(([key, interval]) => {
    if (interval.count > 0) {
      console.log(`  ${key}%: ${interval.count} 个站点`);
    }
  });
  
  // 检查是否有特定的区间模式（比如0, 20, 40, 60, 80, 100等）
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('检查可能的区间边界值 / Check Possible Interval Boundaries:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const commonBoundaries = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  commonBoundaries.forEach(boundary => {
    const count = valueCounts[boundary] || 0;
    if (count > 0) {
      console.log(`  ${boundary}%: ${count} 个站点`);
    }
  });
  
  // 检查Cambridgeshire中满足不同条件的站点数
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('当前筛选逻辑测试 / Current Filter Logic Test:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const testMax20 = sites.filter(s => s.utilisationBandPercent <= 20).length;
  const testMax40 = sites.filter(s => s.utilisationBandPercent <= 40).length;
  const testMax60 = sites.filter(s => s.utilisationBandPercent <= 60).length;
  
  console.log(`  ≤ 20%: ${testMax20} 个站点`);
  console.log(`  ≤ 40%: ${testMax40} 个站点`);
  console.log(`  ≤ 60%: ${testMax60} 个站点`);
  
  // 如果使用区间逻辑（0-20, 20-40等）
  const intervalMax20 = sites.filter(s => {
    const util = s.utilisationBandPercent;
    return util !== null && util !== undefined && util >= 0 && util < 20;
  }).length;
  
  const intervalMax40 = sites.filter(s => {
    const util = s.utilisationBandPercent;
    return util !== null && util !== undefined && util >= 0 && util < 40;
  }).length;
  
  console.log('\n如果使用区间逻辑 (0-20, 20-40):');
  console.log(`  0-20% 区间: ${intervalMax20} 个站点`);
  console.log(`  0-40% 区间: ${intervalMax40} 个站点`);
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  分析完成 / Analysis Complete                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

analyze().catch(err => {
  console.error('❌ 分析失败:', err.message);
  process.exit(1);
});
