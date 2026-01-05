const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  检查CSV中Utilisation字段的实际格式                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const workbook = xlsx.readFile(EXCEL_FILE_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

// 检查Cambridgeshire区域的前20个站点
let count = 0;
const samples = [];

for (let i = 1; i < rawData.length && count < 20; i++) {
  const row = rawData[i];
  const localAuthority = String(row[0] || '').trim();
  const siteName = String(row[1] || '').trim();
  
  if (localAuthority === 'Cambridgeshire' && siteName) {
    const utilisationRaw = row[7];
    const onanRaw = row[9];
    
    samples.push({
      siteName,
      utilisationRaw,
      utilisationType: typeof utilisationRaw,
      onanRaw,
      onanType: typeof onanRaw
    });
    count++;
  }
}

console.log('前20个Cambridgeshire站点的原始数据:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

samples.forEach((s, i) => {
  console.log(`${i+1}. ${s.siteName}`);
  console.log(`   Utilisation (列7): "${s.utilisationRaw}" (${s.utilisationType})`);
  console.log(`   ONAN (列9): "${s.onanRaw}" (${s.onanType})`);
  
  // 测试当前解析逻辑
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(num) ? null : num;
  };
  
  const parsedUtil = parseNumber(s.utilisationRaw);
  const parsedOnan = parseNumber(s.onanRaw);
  console.log(`   解析后 Util: ${parsedUtil}, ONAN: ${parsedOnan}`);
  console.log('');
});

// 检查所有唯一的Utilisation值
const uniqueUtils = new Set();
for (let i = 1; i < rawData.length; i++) {
  const row = rawData[i];
  if (String(row[0] || '').trim() === 'Cambridgeshire') {
    uniqueUtils.add(row[7]);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Cambridgeshire区域所有唯一的Utilisation值:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

Array.from(uniqueUtils).sort().forEach(val => {
  console.log(`  "${val}"`);
});
