import { Song, Album, WordFrequency, LyricTrace, TraceItem, AnalysisResult } from "@/data/lyrics-data";

// 中文分词和停用词过滤
const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着", "没有",
  "看", "好", "自己", "这", "那", "些", "个", "来", "他", "她", "它", "我们",
  "你们", "他们", "她们", "它们", "把", "被", "让", "从", "到", "为", "对",
  "给", "向", "往", "等", "啊", "呀", "呢", "吧", "么", "吗", "啦", "喔",
  "哦", "嗯", "哈", "呵", "嗨", "嘿", "哟", "呜", "嘻", "吱", "哎", "唉",
  "之", "乎", "者", "也", "而", "且", "或", "与", "及", "若", "如", "但",
  "然", "则", "因", "为", "所以", "因此", "于是", "然而", "不过", "只是",
  "已经", "正在", "将要", "可以", "能够", "应该", "必须", "需要", "想要",
  "终于", "渐渐", "慢慢", "突然", "忽然", "其实", "原来", "还是", "到底",
  "只是", "只要", "只有", "不管", "无论", "即使", "虽然", "但是", "可是",
  "于是", "接着", "然后", "最后", "开始", "结束", "完成", "进行", "继续",
  "停止", "暂停", "继续", "重新", "再次", "已经", "从未", "总是", "经常",
  "有时", "偶尔", "常常", "每天", "每年", "每月", "每周", "每次", "每个",
  "各位", "大家", "有人", "没人", "一切", "所有", "全部", "整个", "整个",
  "因为", "所以", "如果", "那么", "既然", "就", "才", "就", "都", "也",
  "还", "又", "再", "更", "最", "太", "更", "越", "比较", "这样", "那样",
  "怎样", "什么样", "什么样", "什么", "哪儿", "哪里", "怎样", "怎么",
]);

// 标点符号集合（用于过滤纯标点符号）
const PUNCTUATION = new Set([
  "，", "。", "、", "；", "：", "？", "！", "「", "」", "『", "』", "（", "）",
  "【", "】", "《", "》", "〈", "〉", "\"", "'", "''", "\"\"", "…", "—", "－",
  ",", ".", ";", ":", "?", "!", "(", ")", "[", "]", "{", "}", "<", ">", "...",
]);

// 判断是否为纯标点符号
function isPurePunctuation(text: string): boolean {
  if (text.length === 0) return true;
  for (const char of text) {
    if (!PUNCTUATION.has(char)) {
      return false;
    }
  }
  return true;
}

// 分词函数（备用方案，用于词云等不依赖精确分词的场景）
// 专业的分词功能已移至 API Route (src/app/api/analyze/route.ts)
function segmentText(text: string): string[] {
  // 简单的字符分割
  const cleanedText = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, " ");
  const words: string[] = [];
  for (let i = 0; i < cleanedText.length - 1; i++) {
    const twoCharWord = cleanedText.slice(i, i + 2);
    if (twoCharWord.length === 2 && !STOP_WORDS.has(twoCharWord)) {
      words.push(twoCharWord);
    }
    if (i < cleanedText.length - 2) {
      const threeCharWord = cleanedText.slice(i, i + 3);
      if (threeCharWord.length === 3 && !STOP_WORDS.has(threeCharWord)) {
        words.push(threeCharWord);
      }
    }
  }
  return words;
}

// 分析歌词，返回词频统计
export function analyzeLyrics(
  songs: Song[],
  albums: Album[],
  selectedAlbumId: string | null,
  selectedSongId: string | null
): AnalysisResult {
  // 根据筛选条件过滤歌曲
  let filteredSongs = songs;

  if (selectedSongId) {
    filteredSongs = songs.filter((song) => song.id === selectedSongId);
  } else if (selectedAlbumId) {
    filteredSongs = songs.filter((song) => song.albumId === selectedAlbumId);
  }

  // 统计词频
  const wordMap = new Map<string, WordFrequency>();

  filteredSongs.forEach((song) => {
    const words = segmentText(song.lyrics);

    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();

      if (!wordMap.has(normalizedWord)) {
        wordMap.set(normalizedWord, {
          word: normalizedWord,
          count: 0,
          songs: [],
          albums: [],
        });
      }

      const freq = wordMap.get(normalizedWord)!;
      freq.count += 1;

      // 记录歌曲和专辑
      if (!freq.songs.includes(song.id)) {
        freq.songs.push(song.id);
      }

      const album = albums.find((a) => a.id === song.albumId);
      if (album && !freq.albums.includes(album.id)) {
        freq.albums.push(album.id);
      }
    });
  });

  // 转换为数组并按频率排序
  const wordFrequencies = Array.from(wordMap.values())
    .filter((wf) => wf.count >= 2) // 只显示出现至少2次的词
    .sort((a, b) => b.count - a.count)
    .slice(0, 100); // 取前100个高频词

  // 计算统计数据
  let totalWords = 0;
  let uniqueWords = new Set<string>();

  filteredSongs.forEach((song) => {
    const words = segmentText(song.lyrics);
    totalWords += words.length;
    words.forEach((word) => uniqueWords.add(word.toLowerCase()));
  });

  return {
    totalWords,
    uniqueWords: uniqueWords.size,
    songCount: filteredSongs.length,
    wordFrequencies,
  };
}

// 溯源某个词的使用情况
export function traceWord(
  word: string,
  songs: Song[],
  albums: Album[]
): LyricTrace {
  const traces: TraceItem[] = [];
  const targetWord = word.toLowerCase();

  songs.forEach((song) => {
    const album = albums.find((a) => a.id === song.albumId);
    if (!album) return;

    // 查找包含该词的歌词片段
    const lyrics = song.lyrics;
    const lines = lyrics.split("\n");

    lines.forEach((line) => {
      const words = segmentText(line);
      const hasWord = words.some((w) => w.toLowerCase() === targetWord);

      if (hasWord) {
        traces.push({
          albumId: album.id,
          albumName: album.name,
          songId: song.id,
          songName: song.name,
          lyricSnippet: line.trim(),
        });
      }
    });
  });

  // 统计数据
  const songIds = new Set(traces.map((t) => t.songId));
  const albumIds = new Set(traces.map((t) => t.albumId));

  return {
    word,
    totalCount: traces.length,
    songCount: songIds.size,
    albumCount: albumIds.size,
    traces,
  };
}

// 特殊专辑ID映射（用于包含特殊字符的专辑）
const SPECIAL_ALBUM_MAPPING: Record<string, string> = {
  'album-134': 'album-134', // Shall We Dance?Shall We Talk!
  'album-201': 'album-201', // Eason 4 A Change & Hits
  'album-271': 'album-271', // What's Going On..?
  'album-367': 'album-367', // ?
  'album-382': 'album-382', // ...3mm
  'album-406': 'album-406', // 《米 · 闪》(Rice&Shine)
  'album-436': 'Cmon_in',   // C'mon in~
  'album-447': 'LOVE',      // L.O.V.E.
  'album-465': 'I_Want',    // I Want...
  'album-467': 'CHIN_UP',   // CHIN UP!
};

// 根据专辑ID生成唯一的渐变色（作为后备）
export function getAlbumCover(albumId: string, albumName: string): string {
  // 支持的图片格式
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  // 检查是否是特殊专辑
  if (SPECIAL_ALBUM_MAPPING[albumId]) {
    for (const ext of imageExtensions) {
      const imagePath = `/albums/${SPECIAL_ALBUM_MAPPING[albumId]}.${ext}`;
      return imagePath;
    }
  }

  // 对于普通专辑，尝试使用专辑名作为文件名
  for (const ext of imageExtensions) {
    // 替换特殊字符以创建有效的文件名
    const safeFileName = albumName
      .replace(/&/g, 'and') // 将 & 替换为 and
      .replace(/[\/\\:*?"<>|]/g, '') // 移除非法字符
      .replace(/\s+/g, '_'); // 替换空格为下划线

    const imagePath = `/albums/${safeFileName}.${ext}`;
    return imagePath;
  }

  // 如果没有找到图片，使用专辑ID生成渐变色作为后备
  const hash = albumId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // 生成两种互补色
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 180) % 360;

  // 使用 HSL 生成渐变色
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 70%, 60%) 100%)`;
}

// 生成渐变色作为后备方案
export function getGradientColor(albumId: string): string {
  const hash = albumId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 180) % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 70%, 60%) 100%)`;
}
