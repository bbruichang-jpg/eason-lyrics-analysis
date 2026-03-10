"use client";

import React, { useEffect, useRef, useState } from "react";
import { WordFrequency } from "@/data/lyrics-data";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: WordFrequency) => void;
  selectedWord: string | null;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, onWordClick, selectedWord }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wordMapRef = useRef<Map<string, WordFrequency>>(new Map());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 构建词汇映射
  useEffect(() => {
    const map = new Map<string, WordFrequency>();
    words.forEach(w => map.set(w.word, w));
    wordMapRef.current = map;
  }, [words]);

  // 动态加载并初始化 wordcloud
  useEffect(() => {
    if (!isMounted) return;
    
    const initWordCloud = async () => {
      try {
        // @ts-ignore
        const WordCloudModule = await import('wordcloud');
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

    const generateWordCloud = async () => {
      // @ts-ignore
      const WordCloudLib = (await import('wordcloud')).default;
      
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
      
      // 取前80个词
      const topWords = words.slice(0, 80);
      
      // 转换为 wordcloud 需要的格式 [word, weight]
      const list = topWords.map(w => {
        // 将词频转换为权重 (10-100)
        const normalizedWeight = minCount === maxCount 
          ? 50 
          : 10 + ((w.count - minCount) / (maxCount - minCount)) * 90;
        return [w.word, normalizedWeight] as [string, number];
      });

      // 多彩配色方案
      const warmColors = [
        '#FF6B35', '#FF4757', '#FF6B81', '#FFA502', '#FF7F50',
        '#E74C3C', '#F39C12', '#E67E22', '#D35400', '#C0392B',
      ];
      const coolColors = [
        '#3498DB', '#2ECC71', '#1ABC9C', '#00D2D3', '#3742FA',
        '#2980B9', '#27AE60', '#16A085', '#0984e3', '#00b894',
      ];
      const neutralColors = [
        '#2F3542', '#57606F', '#747D8C', '#636e72', '#2d3436',
      ];

      // 生成词云
      WordCloudLib(canvas, {
        list: list,
        gridSize: Math.round(8 * dpr),
        weightFactor: (size: number) => {
          return Math.pow(size / 100, 0.8) * Math.min(rect.width, rect.height) / 2.5 * dpr;
        },
        fontFamily: 'PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif',
        fontWeight: '700',
        color: (word: string, weight: number) => {
          // 根据权重选择颜色
          const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          if (weight > 70) {
            return warmColors[hash % warmColors.length];
          } else if (weight > 40) {
            return coolColors[hash % coolColors.length];
          } else {
            return neutralColors[hash % neutralColors.length];
          }
        },
        rotateRatio: 0.2,
        rotationSteps: 2,
        minRotation: -Math.PI / 4,
        maxRotation: Math.PI / 4,
        backgroundColor: '#ffffff',
        drawOutOfBound: false,
        shrinkToFit: true,
        shuffle: true,
        ellipticity: 0.6,  // 椭圆形状
        
        // 点击事件
        click: (item: [string, number]) => {
          const word = wordMapRef.current.get(item[0]);
          if (word) {
            onWordClick(word);
          }
        },
        
        // 悬停效果
        hover: (item: [string, number] | undefined) => {
          if (canvas) {
            canvas.style.cursor = item ? 'pointer' : 'default';
          }
        },
      });
    };

    generateWordCloud();
  }, [words, isMounted, isReady, onWordClick]);

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
      <canvas ref={canvasRef} />
      {words.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          暂无数据
        </div>
      )}
    </div>
  );
};

export default WordCloud;
