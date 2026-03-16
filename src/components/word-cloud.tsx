"use client";

import React, { useEffect, useRef, useState } from "react";
import { WordFrequency } from "@/data/lyrics-data";
import { defaultColors } from "@/data/album-colors";
import { WordCloudSettings, colorThemes } from "./word-cloud-settings";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: WordFrequency) => void;
  selectedWord: string | null;
  albumColors?: string[];
  settings?: WordCloudSettings;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  words, 
  onWordClick, 
  selectedWord, 
  albumColors,
  settings 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wordMapRef = useRef<Map<string, WordFrequency>>(new Map());
  const wordcloudRef = useRef<any>(null);

  // 获取当前配色
  const getColors = (): string[] => {
    if (settings?.useCustomColors && settings.customColors.length > 0) {
      return settings.customColors;
    }
    if (settings?.colorTheme === 'album' && albumColors && albumColors.length > 0) {
      return albumColors;
    }
    if (settings?.colorTheme && settings.colorTheme !== 'album') {
      const theme = colorThemes.find(t => t.id === settings.colorTheme);
      if (theme) return theme.colors;
    }
    // 默认使用专辑配色或默认配色
    return albumColors && albumColors.length > 0 ? albumColors : defaultColors;
  };

  const colors = getColors();

  // 配置参数
  const wordCount = settings?.wordCount ?? 80;
  const minSize = settings?.minSize ?? 15;
  const maxSize = settings?.maxSize ?? 100;
  const shape = settings?.shape ?? 0.65;
  const rotation = settings?.rotation ?? 0.3;
  const font = settings?.font ?? 'PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 构建词汇映射
  useEffect(() => {
    const map = new Map<string, WordFrequency>();
    words.forEach(w => map.set(w.word, w));
    wordMapRef.current = map;
  }, [words]);

  // 动态加载 wordcloud
  useEffect(() => {
    if (!isMounted) return;
    
    const initWordCloud = async () => {
      try {
        // @ts-ignore
        const WordCloudModule = await import('wordcloud');
        wordcloudRef.current = WordCloudModule.default;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load wordcloud:', error);
      }
    };
    
    initWordCloud();
  }, [isMounted]);

  // 生成词云
  useEffect(() => {
    if (!isMounted || !isReady || !canvasRef.current || words.length === 0) return;
    if (!wordcloudRef.current) return;

    const WordCloudLib = wordcloudRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 设置 canvas 尺寸
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // 准备词云数据
    const counts = words.map(w => w.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    
    // 取指定数量的词并去重
    const seenWords = new Set<string>();
    const uniqueWords: WordFrequency[] = [];
    
    for (const w of words) {
      if (seenWords.has(w.word)) continue;
      
      seenWords.add(w.word);
      uniqueWords.push(w);
      
      if (uniqueWords.length >= wordCount) break;
    }
    
    // 转换为 wordcloud 需要的格式 [word, weight]
    const list = uniqueWords.map(w => {
      const normalizedWeight = minCount === maxCount 
        ? (minSize + maxSize) / 2
        : minSize + ((w.count - minCount) / (maxCount - minCount)) * (maxSize - minSize);
      return [w.word, normalizedWeight] as [string, number];
    });

    // 颜色索引
    let colorIndex = 0;

    // 生成词云
    WordCloudLib(canvas, {
      list: list,
      gridSize: Math.round(6 * dpr),
      weightFactor: (size: number) => {
        return Math.pow(size / 100, 0.75) * Math.min(rect.width, rect.height) / 2.2 * dpr;
      },
      fontFamily: font,
      fontWeight: '700',
      color: () => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return color;
      },
      rotateRatio: rotation,
      minRotation: -Math.PI / 3,
      maxRotation: Math.PI / 3,
      backgroundColor: '#ffffff',
      drawOutOfBound: false,
      shrinkToFit: true,
      shuffle: true,
      ellipticity: shape,
      
      // 悬停效果
      hover: (item: [string, number] | undefined, dimension: any, event: MouseEvent) => {
        if (!item) {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
          canvas.style.cursor = 'default';
          return;
        }
        
        canvas.style.cursor = 'pointer';
        
        const word = wordMapRef.current.get(item[0]);
        if (word && word.contexts && word.contexts.length > 0 && tooltipRef.current) {
          const tooltip = tooltipRef.current;
          
          let content = '<div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #9333ea;">"' + word.word + '" (' + word.count + '次)</div>';
          
          const contexts = word.contexts.slice(0, 3);
          contexts.forEach((ctx, i) => {
            if (i > 0) {
              content += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">';
            } else {
              content += '<div style="margin-top: 8px;">';
            }
            content += '<div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">' + ctx.albumName + ' - ' + ctx.songName + '</div>';
            content += '<div style="font-size: 13px;">"' + ctx.line + '"</div>';
            content += '</div>';
          });
          
          if (word.contexts.length > 3) {
            content += '<div style="margin-top: 8px; font-size: 11px; color: #9ca3af;">... 共 ' + word.contexts.length + ' 处出现</div>';
          }
          
          tooltip.innerHTML = content;
          tooltip.style.display = 'block';
          tooltip.style.left = (event.offsetX + 15) + 'px';
          tooltip.style.top = (event.offsetY + 15) + 'px';
        }
      },
      
      // 点击事件
      click: (item: [string, number]) => {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        
        const word = wordMapRef.current.get(item[0]);
        if (word) {
          onWordClick(word);
        }
      },
    });

    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, [words, isMounted, isReady, onWordClick, colors, wordCount, minSize, maxSize, shape, rotation, font]);

  if (!isMounted) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-white rounded-lg">
        <div className="text-muted-foreground animate-pulse">加载词云中...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas ref={canvasRef} className="rounded-lg" />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-white border rounded-lg shadow-lg p-3 max-w-xs z-50 pointer-events-none"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default WordCloud;
