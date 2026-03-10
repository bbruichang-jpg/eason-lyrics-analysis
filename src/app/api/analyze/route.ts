import { NextRequest, NextResponse } from 'next/server';

// 动态导入数据
let songs: any[] = [];
let albums: any[] = [];
let jieba: any = null;

function loadData() {
  if (songs.length === 0) {
    const data = require('@/data/lyrics-data.ts');
    songs = data.songs || [];
    albums = data.albums || [];
  }
}

// 动态加载 jieba
function getJieba() {
  if (!jieba) {
    try {
      // 使用 eval 避免 Next.js 的模块转换
      // @ts-ignore
      const jsJieba = eval('require("js-jieba")');
      // @ts-ignore
      const jiebaData = eval('require("jieba-zh-cn")');
      const { JiebaDict, HMMModel, UserDict, IDF, StopWords } = jiebaData;
      
      jieba = jsJieba(JiebaDict, HMMModel, UserDict, IDF, StopWords);
    } catch (error) {
      console.error('Failed to initialize jieba:', error);
      throw error;
    }
  }
  return jieba;
}

// 停用词集合
const STOP_WORDS = new Set([
  // 助词、代词、连词
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
  
  // 否定词类
  "不要", "不想", "不会", "不必", "不再", "没法", "不可", "不知", "不敢", 
  "不怕", "不够", "不能", "不可", "不是", "没", "无", "非",
  
  // 情态词类
  "我会", "你要", "我要", "他会", "她会", "能", "想", "愿意",
  
  // 疑问词类
  "为何", "为什么", "怎么", "如何", "怎样", "哪", "哪里", "哪儿",
  
  // 时间副词
  "今天", "明天", "昨天", "现在", "未来", "过去", "一天", "仍然", "依然",
  "仍然", "已经", "正在", "一直", "永远", "曾经", "时候", "一生",
  
  // 程度副词
  "多么", "这么", "那么", "非常", "很", "太", "更", "最", "比较", "一点",
  
  // 认知类动词
  "知道", "发现", "明白", "了解", "认识", "懂得", "理解", "记得", "忘记",
  
  // 语气词
  "真的", "也许", "大概", "可能", "确实", "真的", "真的", "好像", "似乎",
  "就算", "难道", "其实", "原来", "当然", "果然", "竟然", "居然",
  
  // 其他无意义词
  "这个", "那个", "不到", "觉得", "一次", "留下", "多少",
  "得到", "你说", "我说", "他说", "她说",
  "像是", "那种", "这种", "以为",
  "这样的", "那样的", "怎样的",
  "可以", "应该", "是不是", "有没有",
  "一种", "一样", "就是", "一句", "这里", "那里",
  
  // 英文填充词/无意义词
  "oh", "yeah", "baby", "darling", "honey", "la", "da", "ba", "na", "na",
  
  // 英文停用词（代词、冠词、介词、连词等）
  "the", "a", "an", "and", "or", "but", "if", "then", "so", "because",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "her", "its", "our", "their",
  "this", "that", "these", "those",
  "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must",
  "can", "need", "dare", "ought", "used",
  "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "up", "about", "into", "over", "after", "under", "above",
  "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
  "all", "each", "every", "both", "few", "more", "most", "other", "some",
  "such", "no", "not", "only", "same", "than", "too", "very",
  "just", "now", "here", "there", "also",
]);

// 标点符号集合
const PUNCTUATION = new Set([
  "，", "。", "、", "；", "：", "？", "！", "「", "」", "『", "』", "（", "）",
  "【", "】", "《", "》", "〈", "〉", "\"", "'", "''", "\"\"", "…", "—", "－",
  ",", ".", ";", ":", "?", "!", "(", ")", "[", "]", "{", "}", "<", ">", "...",
]);

function isPurePunctuation(text: string): boolean {
  if (text.length === 0) return true;
  for (const char of text) {
    if (!PUNCTUATION.has(char)) return false;
  }
  return true;
}

function isPureWhitespace(text: string): boolean {
  return /^\s+$/.test(text);
}

function hasWhitespace(text: string): boolean {
  return /\s/.test(text);
}

function isPureNumber(text: string): boolean {
  return /^\d+$/.test(text);
}

// 判断是否为无意义的英文碎片
function isMeaninglessEnglish(text: string): boolean {
  // 必须是纯英文
  if (!/^[a-zA-Z]+$/.test(text)) return false;
  
  // 无意义的英文填充词列表
  const meaninglessWords = new Set([
    // 单字母/双字母碎片
    'a', 'i', 'u', 'o', 'e',
    'ba', 'la', 'da', 'na', 'ha', 'oh', 'ye', 'ah', 'eh', 'uh', 'um',
    // 常见无意义副歌填充词
    'doo', 'daa', 'laa', 'baa', 'naa', 'woo', 'ooh', 'aah',
    // 短缩写
    've', 'll', 're', 't', 's', 'm', 'd',
  ]);
  
  const lowerText = text.toLowerCase();
  
  // 如果是已知的无意义词，直接过滤
  if (meaninglessWords.has(lowerText)) return true;
  
  // 长度小于3的英文单词视为无意义碎片
  if (text.length < 3) return true;
  
  // 检查是否是重复字母组成的无意义词（如 aaa, bbb）
  if (lowerText.length >= 2 && /^([a-z])\1+$/.test(lowerText)) return true;
  
  return false;
}

function startsWithSpecialChar(text: string): boolean {
  return /^[^\u4e00-\u9fa5a-zA-Z]/.test(text);
}

// 使用 jieba 进行专业中文分词
function segmentText(text: string): string[] {
  const words: string[] = [];

  try {
    const jiebaInstance = getJieba();
    const rawWords = jiebaInstance.cut(text, true);

    rawWords.forEach((word: string) => {
      const trimmedWord = word.trim();

      // ===== 严格过滤规则 =====
      // 1. 空白和长度检查
      if (trimmedWord.length === 0) return;
      if (isPureWhitespace(trimmedWord)) return;
      
      // 2. 单字过滤（中文单字无意义）
      if (trimmedWord.length < 2) return;
      
      // 3. 标点符号过滤
      if (isPurePunctuation(trimmedWord)) return;
      
      // 4. 停用词过滤
      if (STOP_WORDS.has(trimmedWord)) return;
      if (STOP_WORDS.has(trimmedWord.toLowerCase())) return; // 英文不区分大小写
      
      // 5. 数字过滤
      if (isPureNumber(trimmedWord)) return;
      
      // 6. 特殊字符开头的词
      if (startsWithSpecialChar(trimmedWord)) return;
      
      // 7. 包含空白字符的词
      if (hasWhitespace(trimmedWord)) return;
      
      // 8. 类型检查：只保留中文词汇或完整的英文单词
      const isChinese = /^[\u4e00-\u9fa5]+$/.test(trimmedWord);
      const isEnglish = /^[a-zA-Z]+$/.test(trimmedWord);
      if (!isChinese && !isEnglish) return;
      
      // 9. 英文词汇过滤：过滤无意义碎片
      if (isEnglish && isMeaninglessEnglish(trimmedWord)) return;
      
      // 10. 中文词汇：过滤单字（再次确认）
      if (isChinese && trimmedWord.length < 2) return;

      words.push(trimmedWord);
    });
  } catch (error) {
    console.error('Jieba 分词失败:', error);
    const cleanedText = text.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, " ");
    for (let i = 0; i < cleanedText.length - 1; i++) {
      const twoCharWord = cleanedText.slice(i, i + 2);
      if (twoCharWord.length === 2 && 
          !STOP_WORDS.has(twoCharWord) && 
          /^[\u4e00-\u9fa5]{2}$/.test(twoCharWord)) {
        words.push(twoCharWord);
      }
    }
  }

  return words;
}

// 从歌词中提取包含特定词的句子
function extractContextLines(lyrics: string, word: string): string[] {
  const lines = lyrics.split('\n');
  const contextLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes(word) && trimmedLine.length > 0) {
      // 清理句子中的多余空白
      const cleanedLine = trimmedLine.replace(/\s+/g, ' ').trim();
      if (cleanedLine.length > 0 && cleanedLine.length < 100) {
        contextLines.push(cleanedLine);
      }
    }
  }
  
  // 最多返回5个上下文句子
  return contextLines.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    loadData();

    const body = await request.json();
    const { selectedAlbumId, selectedSongId } = body;

    // 根据筛选条件过滤歌曲
    let filteredSongs = songs;

    if (selectedSongId && selectedSongId !== "all") {
      filteredSongs = songs.filter((song) => song.id === selectedSongId);
    } else if (selectedAlbumId && selectedAlbumId !== "all") {
      filteredSongs = songs.filter((song) => song.albumId === selectedAlbumId);
    }

    // 统计词频并收集上下文
    const wordMap = new Map<string, {
      word: string;
      count: number;
      songs: string[];
      albums: string[];
      contexts: Array<{
        songId: string;
        songName: string;
        albumId: string;
        albumName: string;
        line: string;
      }>;
    }>();

    filteredSongs.forEach((song) => {
      const words = segmentText(song.lyrics);
      const album = albums.find((a) => a.id === song.albumId);

      words.forEach((word) => {
        if (!wordMap.has(word)) {
          wordMap.set(word, {
            word,
            count: 0,
            songs: [],
            albums: [],
            contexts: [],
          });
        }

        const freq = wordMap.get(word)!;
        freq.count += 1;

        // 记录歌曲
        if (!freq.songs.includes(song.id)) {
          freq.songs.push(song.id);
        }

        // 记录专辑
        if (album && !freq.albums.includes(album.id)) {
          freq.albums.push(album.id);
        }

        // 收集上下文（每个词最多10个上下文）
        if (freq.contexts.length < 10) {
          const contextLines = extractContextLines(song.lyrics, word);
          for (const line of contextLines) {
            if (freq.contexts.length >= 10) break;
            // 避免重复的句子
            if (!freq.contexts.some(c => c.line === line)) {
              freq.contexts.push({
                songId: song.id,
                songName: song.name || song.title || '',
                albumId: song.albumId,
                albumName: album?.name || '',
                line,
              });
            }
          }
        }
      });
    });

    // 转换为数组并按频率排序，取前100个
    const wordFrequencies = Array.from(wordMap.values())
      .filter((wf) => wf.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    // 计算统计数据
    let totalWords = 0;
    const uniqueWords = new Set<string>();

    filteredSongs.forEach((song) => {
      const words = segmentText(song.lyrics);
      totalWords += words.length;
      words.forEach((word) => uniqueWords.add(word));
    });

    const result = {
      totalWords,
      uniqueWords: uniqueWords.size,
      songCount: filteredSongs.length,
      wordFrequencies,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: '分析失败' }, { status: 500 });
  }
}
