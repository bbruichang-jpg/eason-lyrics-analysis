import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// 读取 Excel 文件
const excelPath = path.resolve(__dirname, '../songs-data.xlsx');
const workbook = XLSX.readFile(excelPath);

// 获取第一个工作表
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 转换为 JSON（从第2行开始，跳过标题）
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

// 跳过标题行
const rows = data.slice(1);

// 专辑映射
const albumsMap = new Map<string, {
  id: string;
  name: string;
  year: number;
  company: string;
  type: string;
  language: string;
  trackCount: number;
}>();

// 歌曲列表
const songs: {
  id: string;
  name: string;
  albumId: string;
  artist: string;
  lyrics: string;
}[] = [];

// 处理每一行数据
rows.forEach((row, index) => {
  const [excelDate, albumName, company, albumType, language, trackCount, songName, artist, lyrics] = row;

  // 将 Excel 日期转换为年份（Excel日期从1900-01-01开始，35296 大约是1996年）
  const year = Number(new Date((Number(excelDate) - 25569) * 86400 * 1000).getFullYear());

  // 生成专辑ID（使用拼音或英文名）
  const albumId = `album-${index}`;

  // 如果专辑不在映射中，添加它
  if (!albumsMap.has(albumName)) {
    albumsMap.set(albumName, {
      id: albumId,
      name: albumName,
      year: year,
      company: String(company || ''),
      type: String(albumType || ''),
      language: String(language || ''),
      trackCount: Number(trackCount) || 0,
    });
  }

  // 获取专辑ID
  const albumIdForSong = albumsMap.get(albumName)!.id;

  // 生成歌曲ID
  const songId = `song-${index}`;

  // 添加歌曲
  songs.push({
    id: songId,
    name: String(songName || ''),
    albumId: albumIdForSong,
    artist: String(artist || ''),
    lyrics: String(lyrics || ''),
  });
});

// 转换专辑映射为数组
const albums = Array.from(albumsMap.values());

// 生成最终的 TypeScript 数据文件
const outputData = `// 专辑数据结构
export interface Album {
  id: string;
  name: string;
  year: number;
  company: string;
  type: string;
  language: string;
  trackCount: number;
}

// 歌曲数据结构
export interface Song {
  id: string;
  name: string;
  albumId: string;
  artist: string;
  lyrics: string;
}

// 陈奕迅专辑数据
export const albums: Album[] = ${JSON.stringify(albums, null, 2)};

// 陈奕迅歌曲数据
export const songs: Song[] = ${JSON.stringify(songs, null, 2)};

// 词云词频统计结果接口
export interface WordFrequency {
  word: string;
  count: number;
  songs: string[]; // 包含该词的歌曲ID列表
  albums: string[]; // 包含该词的专辑ID列表
}

// 歌词溯源信息接口
export interface LyricTrace {
  word: string;
  totalCount: number;
  songCount: number;
  albumCount: number;
  traces: TraceItem[];
}

export interface TraceItem {
  albumId: string;
  albumName: string;
  songId: string;
  songName: string;
  lyricSnippet: string;
}

// 分析结果接口
export interface AnalysisResult {
  totalWords: number;
  uniqueWords: number;
  songCount: number;
  wordFrequencies: WordFrequency[];
}
`;

// 写入文件
const outputPath = path.resolve(__dirname, '../src/data/lyrics-data.ts');
fs.writeFileSync(outputPath, outputData, 'utf-8');

console.log('✅ 数据转换完成！');
console.log(`📊 统计信息:`);
console.log(`   - 专辑数量: ${albums.length}`);
console.log(`   - 歌曲数量: ${songs.length}`);
console.log(`\n📁 数据文件已生成: ${outputPath}`);

// 打印一些示例数据
console.log('\n📋 专辑示例:');
albums.slice(0, 5).forEach(album => {
  console.log(`   - ${album.name} (${album.year})`);
});

console.log('\n🎵 歌曲示例:');
songs.slice(0, 5).forEach(song => {
  const album = albums.find(a => a.id === song.albumId);
  console.log(`   - ${song.name} (${album?.name})`);
});
