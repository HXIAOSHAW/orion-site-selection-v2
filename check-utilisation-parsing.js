const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE_PATH = path.join(__dirname, '../../orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  检查CSV中Utilisation字段的解析方式                           ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (!fs.existsSync(EXCEL_FILE_PATH)) {
  console.error(`❌ Excel文件不存在: ${EXCEL_FILE_PATH}`);
  process.exit(1);
}

const workbook = xlsx.readFile(EXCEL_FILE_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const rawData = xlsx.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: null
});

console.log(`总行数: ${rawData.length}\n`);

// 检查第7列（Utilisation Band）的原始值
const utilisationValues = new Set();
const sampleRows = [];

for (let i = 1; i < Math.min(100, rawData.length); i++) {
  const row = rawData[i];
  const localAuthority = String(row[0] || '').trim();
  const siteName = String(row[1] || '').trim();
  const utilisationRaw = row[7];
  
  if (localAuthority === 'Cambridgeshire' && siteName) {
    utilisationValues.add(utilisationRaw);
    if (sampleRows.length < 20) {
      sampleRows.push({
        siteName,
        utilisationRaw,
        utilisationType: typeof utilisationRaw,
        rowIndex: i
      });
    }
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('CSV中Utilisation字段的唯一值 / Unique Utilisation Values:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

Array.from(utilisationValues).sort().forEach(val => {
  console.log(`  "${val}" (类型: ${typeof val})`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('示例行数据 / Sample Rows:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

sampleRows.forEach((row, i) => {
  console.log(`${i+1}. ${row.siteName}`);
  console.log(`   Utilisation原始值: "${row.utilisationRaw}" (${row.utilisationType})`);
  
  // 测试解析逻辑
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(num) ? null : num;
  };
  
  const parsed = parseNumber(row.utilisationRaw);
  console.log(`   解析后: ${parsed}`);
  console.log('');
});

// 检查用户提供的站点在CSV中的Utilisation值
const userSites = ['EPN-S0000004U2443', 'EPN-S0000004U1076', 'EPN-S0000004U1791'];
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('检查用户提供的站点在CSV中的值:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

for (let i = 1; i < rawData.length; i++) {
  const row = rawData[i];
  const siteName = String(row[1] || '').trim();
  if (userSites.includes(siteName)) {
    console.log(`${siteName}:`);
    console.log(`  Utilisation (列7): "${row[7]}"`);
    console.log(`  ONAN (列9): "${row[9]}"`);
    console.log(`  解析后 Util: ${parseNumber(row[7])}`);
    console.log(`  解析后 ONAN: ${parseNumber(row[9])}`);
    console.log('');
  }
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(num) ? null : num;
}
