import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 读取 Excel 文件
const excelPath = path.resolve(__dirname, '../songs-data.xlsx');
const workbook = XLSX.readFile(excelPath);

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 转换为 JSON
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

// 打印前几行看看结构
console.log('总行数:', data.length);
console.log('\n前10行数据:');
for (let i = 0; i < Math.min(10, data.length); i++) {
  console.log(`\n第 ${i + 1} 行:`);
  console.log(data[i]);
}

// 保存完整数据到 JSON 文件
const outputPath = path.resolve(__dirname, '../songs-data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n完整数据已保存到: ${outputPath}`);
