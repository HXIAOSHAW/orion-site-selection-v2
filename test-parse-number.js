// 测试parseNumber函数
function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  
  // If it's already a number, return it
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'null') return null;
  
  // Check if it's an interval string like "0-20%", "20-40%"
  const intervalMatch = str.match(/^(\d+)-(\d+)%?$/);
  if (intervalMatch) {
    const upperBound = parseFloat(intervalMatch[2]);
    return isNaN(upperBound) ? null : upperBound;
  }
  
  // Try to parse as regular number (handles "100 kVA" format and decimal numbers like "51.959079")
  // First try to parse as full decimal number
  const decimalMatch = str.match(/^-?\d+\.?\d*/);
  if (decimalMatch) {
    const num = parseFloat(decimalMatch[0]);
    if (!isNaN(num)) return num;
  }
  
  // Fallback: try to parse integer part only
  const numMatch = str.match(/^-?\d+/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    return isNaN(num) ? null : num;
  }
  
  return null;
}

// 测试用例
const testCases = [
  { input: 51.959079, expected: 51.959079, desc: 'Number 51.959079' },
  { input: '51.959079', expected: 51.959079, desc: 'String "51.959079"' },
  { input: '0.772856', expected: 0.772856, desc: 'String "0.772856"' },
  { input: 52, expected: 52, desc: 'Number 52' },
  { input: '52', expected: 52, desc: 'String "52"' },
  { input: '-0.271042', expected: -0.271042, desc: 'String "-0.271042"' },
];

console.log('测试parseNumber函数:');
console.log('='.repeat(80));
testCases.forEach(test => {
  const result = parseNumber(test.input);
  const pass = Math.abs(result - test.expected) < 0.000001;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}`);
  console.log(`   输入: ${test.input} (${typeof test.input})`);
  console.log(`   输出: ${result}`);
  console.log(`   期望: ${test.expected}`);
  if (!pass) console.log(`   ⚠️  不匹配！`);
  console.log('');
});
