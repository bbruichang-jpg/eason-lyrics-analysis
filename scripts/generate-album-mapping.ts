import * as fs from 'fs';
import * as path from 'path';

// 读取歌词数据文件
const dataPath = path.resolve(__dirname, '../src/data/lyrics-data.ts');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// 提取专辑数据（简单的正则匹配）
const albumMatch = dataContent.match(/export const albums: Album\[\] = (\[[\s\S]*?\]);/);
if (!albumMatch) {
  console.error('无法提取专辑数据');
  process.exit(1);
}

// 解析 JSON
const albums = JSON.parse(albumMatch[1]);

// 生成专辑封面文件名映射
console.log('📋 专辑封面文件名映射表\n');
console.log('请将你的专辑封面图片按照以下规则重命名后，上传到 public/albums/ 目录：\n');

albums.forEach((album: any, index: number) => {
  const safeName = album.name
    .replace(/[\/\\:*?"<>|]/g, '') // 移除非法字符
    .replace(/\s+/g, '_'); // 替换空格为下划线

  console.log(`${index + 1}. 专辑: ${album.name}`);
  console.log(`   文件名: ${safeName}.jpg`);
  console.log(`   专辑ID: ${album.id}`);
  console.log(`   年份: ${album.year}`);
  console.log('');
});

// 生成批量重命名脚本（Linux/Mac）
let bashScript = `#!/bin/bash
# 批量重命名专辑封面脚本
# 用法: 将此脚本保存为 rename-covers.sh，然后在你的封面图片目录运行

`;

albums.forEach((album: any, index: number) => {
  const safeName = album.name
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
  bashScript += `# ${album.name}\n`;
  bashScript += `# mv "你的原始文件名${index + 1}.jpg" "${safeName}.jpg"\n\n`;
});

fs.writeFileSync(path.resolve(__dirname, '../rename-covers.sh'), bashScript, 'utf-8');
console.log('✅ 已生成重命名脚本: rename-covers.sh\n');

// 生成批量重命名脚本（Windows PowerShell）
let powershellScript = `# 批量重命名专辑封面脚本 (PowerShell)
# 用法: 将此脚本保存为 rename-covers.ps1，然后在你的封面图片目录运行

`;

albums.forEach((album: any, index: number) => {
  const safeName = album.name
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
  powershellScript += `# ${album.name}\n`;
  powershellScript += `# Rename-Item -Path "你的原始文件名${index + 1}.jpg" -NewName "${safeName}.jpg"\n\n`;
});

fs.writeFileSync(path.resolve(__dirname, '../rename-covers.ps1'), powershellScript, 'utf-8');
console.log('✅ 已生成 PowerShell 重命名脚本: rename-covers.ps1\n');

console.log('📝 使用说明:');
console.log('1. 将你的专辑封面图片放到一个文件夹中');
console.log('2. 根据上方的映射表，将图片重命名为对应的文件名');
console.log('3. 将重命名后的图片上传到 public/albums/ 目录');
console.log('4. 刷新页面，专辑封面就会显示出来！\n');

console.log('🔍 提示:');
console.log('- 系统会自动查找 .jpg, .jpeg, .png, .webp, .gif 格式的图片');
console.log('- 如果找不到图片，会显示渐变色背景作为后备');
console.log('- 图片加载失败时会自动回退到渐变色\n');
