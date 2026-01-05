const XLSX = require('xlsx');
const path = require('path');

const excelFile = '/Users/xh/Orion/orion-site-selection-frontend/database/power/data/ukpn-secondary-sites.xlsx';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  检查CSV/Excel文件的坐标列结构                                  ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

try {
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  console.log(`总行数: ${data.length}`);
  console.log(`第一行（表头）列数: ${data[0] ? data[0].length : 0}\n`);
  
  // 显示表头
  if (data[0]) {
    console.log('表头（前30列）:');
    console.log('='.repeat(80));
    for (let i = 0; i < Math.min(30, data[0].length); i++) {
      console.log(`列 ${i}: ${data[0][i] || '(空)'}`);
    }
  }
  
  // 检查列21和22
  console.log('\n' + '='.repeat(80));
  console.log('列21和22的内容（前10行数据）:');
  console.log('='.repeat(80));
  if (data[0]) {
    console.log(`列21名称: ${data[0][21] || '(空)'}`);
    console.log(`列22名称: ${data[0][22] || '(空)'}`);
  }
  
  console.log('\n前10行数据的列21和22值:');
  for (let i = 1; i < Math.min(11, data.length); i++) {
    const row = data[i];
    if (row && row.length > 22) {
      console.log(`行 ${i}: 列21=${row[21]}, 列22=${row[22]}`);
    }
  }
  
  // 查找包含"lat"或"lon"的列
  console.log('\n' + '='.repeat(80));
  console.log('查找包含坐标信息的列:');
  console.log('='.repeat(80));
  if (data[0]) {
    for (let i = 0; i < data[0].length; i++) {
      const header = String(data[0][i] || '').toLowerCase();
      if (header.includes('lat') || header.includes('lon') || header.includes('lng') || 
          header.includes('coord') || header.includes('easting') || header.includes('northing')) {
        console.log(`列 ${i}: "${data[0][i]}"`);
        // 显示前3行的值
        for (let j = 1; j < Math.min(4, data.length); j++) {
          if (data[j] && data[j][i] !== undefined) {
            console.log(`   行${j}: ${data[j][i]}`);
          }
        }
      }
    }
  }
  
} catch (error) {
  console.error('❌ 错误:', error.message);
}
