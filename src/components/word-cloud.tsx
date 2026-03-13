"use client";

import React, { useEffect, useRef, useState } from "react";
import { WordFrequency } from "@/data/lyrics-data";
import { defaultColors } from "@/data/album-colors";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: WordFrequency) => void;
  selectedWord: string | null;
  albumColors?: string[]; // 专辑配色方案
}

const WordCloud: React.FC<WordCloudProps> = ({ words, onWordClick, selectedWord, albumColors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wordMapRef = useRef<Map<string, WordFrequency>>(new Map());
  const wordcloudRef = useRef<any>(null);

  // 使用专辑配色或默认配色
  const colors = albumColors && albumColors.length > 0 ? albumColors : defaultColors;

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
    
    // 取前100个词并去重（确保不会有重复词）
    const seenWords = new Set<string>();
    const uniqueWords: WordFrequency[] = [];
    
    for (const w of words) {
      // 跳过已存在的词
      if (seenWords.has(w.word)) continue;
      
      seenWords.add(w.word);
      uniqueWords.push(w);
      
      // 最多100个词
      if (uniqueWords.length >= 100) break;
    }
    
    // 转换为 wordcloud 需要的格式 [word, weight]
    const list = uniqueWords.map(w => {
      const normalizedWeight = minCount === maxCount 
        ? 50 
        : 15 + ((w.count - minCount) / (maxCount - minCount)) * 85;
      return [w.word, normalizedWeight] as [string, number];
    });

    // 颜色索引（使用闭包）
    let colorIndex = 0;

    // 生成词云
    WordCloudLib(canvas, {
      list: list,
      gridSize: Math.round(6 * dpr),
      weightFactor: (size: number) => {
        return Math.pow(size / 100, 0.75) * Math.min(rect.width, rect.height) / 2.2 * dpr;
      },
      fontFamily: 'PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif',
      fontWeight: '700',
      color: () => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return color;
      },
      rotateRatio: 0.3,
      minRotation: -Math.PI / 3,
      maxRotation: Math.PI / 3,
      backgroundColor: '#ffffff',
      drawOutOfBound: false,
      shrinkToFit: true,
      shuffle: true,
      ellipticity: 0.65,
      
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
  }, [words, isMounted, isReady, onWordClick, colors]);

  if (!isMounted) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-white rounded-lg">
        <div className="text-muted-foreground animate-pulse">加载词云中...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-white rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      <canvas 
        ref={canvasRef}
        className="block"
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 pointer-events-none"
        style={{ 
          display: 'none',
          maxWidth: '300px'
        }}
      />
      
      {words.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          暂无数据
        </div>
      )}
    </div>
  );
};

export default WordCloud;
