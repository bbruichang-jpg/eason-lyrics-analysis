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

// 动态加载 jieba（延迟加载以避免初始化错误）
function getJieba() {
  if (!jieba) {
    try {
      // 使用 eval 避免 Next.js 的模块转换
      // @ts-ignore
      const jsJieba = eval('require("js-jieba")');
      // @ts-ignore
      const jiebaData = eval('require("jieba-zh-cn")');
      const { JiebaDict, HMMModel, UserDict, IDF, StopWords } = jiebaData;
      
      // jsJieba 本身就是 createJieba 函数
      jieba = jsJieba(JiebaDict, HMMModel, UserDict, IDF, StopWords);
    } catch (error) {
      console.error('Failed to initialize jieba:', error);
      throw error;
    }
  }
  return jieba;
}

// 标点符号集合
const PUNCTUATION = new Set([
  "，", "。", "、", "；", "：", "？", "！", "「", "」", "『", "』", "（", "）",
  "【", "】", "《", "》", "〈", "〉", "\"", "'", "''", "\"\"", "…", "—", "－",
  ",", ".", ";", ":", "?", "!", "(", ")", "[", "]", "{", "}", "<", ">", "...",
]);

// 停用词集合（常见的无意义词汇）
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
  
  // 否定词类（词云中不应出现）
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
  
  // 常见副歌填充词
  "oh", "yeah", "baby", "darling", "honey", "la", "da", "ba", "na", "na",
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

// 判断是否为纯空白字符
function isPureWhitespace(text: string): boolean {
  return /^\s+$/.test(text);
}

// 判断是否包含空格
function hasWhitespace(text: string): boolean {
  return /\s/.test(text);
}

// 判断是否为纯数字
function isPureNumber(text: string): boolean {
  return /^\d+$/.test(text);
}

// 判断是否为纯英文单词（歌词中的英文通常是填充词，非核心情感表达）
function isPureEnglish(text: string): boolean {
  return /^[a-zA-Z]+$/.test(text);
}

// 判断是否以特殊符号开头
function startsWithSpecialChar(text: string): boolean {
  return /^[^\u4e00-\u9fa5a-zA-Z]/.test(text);
}

// 使用 jieba 进行专业中文分词
function segmentText(text: string): string[] {
  const words: string[] = [];

  try {
    const jiebaInstance = getJieba();
    // 使用 jieba 进行分词（启用 HMM 模式以获得更好的分词效果）
    const rawWords = jiebaInstance.cut(text, true);

    rawWords.forEach((word: string) => {
      const trimmedWord = word.trim();

      // 智能过滤：
      
      // 1. 跳过空字符串
      if (trimmedWord.length === 0) return;

      // 2. 跳过纯空白字符
      if (isPureWhitespace(trimmedWord)) return;

      // 3. 过滤长度小于 2 的词（单字通常无意义）
      if (trimmedWord.length < 2) return;

      // 4. 过滤纯标点符号
      if (isPurePunctuation(trimmedWord)) return;

      // 5. 过滤停用词
      if (STOP_WORDS.has(trimmedWord)) return;

      // 6. 过滤纯数字
      if (isPureNumber(trimmedWord)) return;

      // 7. 过滤特殊符号开头的词
      if (startsWithSpecialChar(trimmedWord)) return;

      // 8. 过滤包含空格的词（避免 " 我"、"心 " 等）
      if (hasWhitespace(trimmedWord)) return;

      // 9. 过滤纯英文单词（歌词中的英文通常是填充词）
      if (isPureEnglish(trimmedWord)) return;

      // 10. 只保留中文词汇
      if (!/^[\u4e00-\u9fa5]+$/.test(trimmedWord)) return;

      words.push(trimmedWord);
    });
  } catch (error) {
    console.error('Jieba 分词失败:', error);
    // 备用方案：简单的字符分割（只保留中文）
    const cleanedText = text.replace(/[^\u4e00-\u9fa5]/g, " ");
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

export async function POST(request: NextRequest) {
  try {
    // 加载数据
    loadData();
    console.log(`Loaded: ${songs.length} songs, ${albums.length} albums`);

    const body = await request.json();
    const { selectedAlbumId, selectedSongId } = body;

    console.log(`API called: selectedAlbumId=${selectedAlbumId}, selectedSongId=${selectedSongId}`);

    // 根据筛选条件过滤歌曲
    let filteredSongs = songs;

    if (selectedSongId && selectedSongId !== "all") {
      filteredSongs = songs.filter((song) => song.id === selectedSongId);
    } else if (selectedAlbumId && selectedAlbumId !== "all") {
      filteredSongs = songs.filter((song) => song.albumId === selectedAlbumId);
    }

    console.log(`Filtered songs: ${filteredSongs.length}`);

    // 统计词频
    const wordMap = new Map<string, any>();

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

    console.log(`Total unique words: ${wordMap.size}`);

    // 转换为数组并按频率排序
    const wordFrequencies = Array.from(wordMap.values())
      .filter((wf) => wf.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    // 计算统计数据
    let totalWords = 0;
    let uniqueWords = new Set<string>();

    filteredSongs.forEach((song) => {
      const words = segmentText(song.lyrics);
      totalWords += words.length;
      words.forEach((word) => uniqueWords.add(word.toLowerCase()));
    });

    const result = {
      totalWords,
      uniqueWords: uniqueWords.size,
      songCount: filteredSongs.length,
      wordFrequencies,
    };

    console.log(`Result: totalWords=${result.totalWords}, uniqueWords=${result.uniqueWords}, wordFrequencies=${result.wordFrequencies.length}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: '分析失败' }, { status: 500 });
  }
}
