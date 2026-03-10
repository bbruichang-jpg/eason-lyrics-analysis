"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { WordFrequency } from "@/data/lyrics-data";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: WordFrequency) => void;
  selectedWord: string | null;
}

interface WordLayout {
  word: WordFrequency;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  rotation: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, onWordClick, selectedWord }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [layouts, setLayouts] = useState<WordLayout[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 生成颜色 - 参考图风格的丰富配色
  const getColor = (index: number, count: number, maxCount: number): string => {
    const weight = count / maxCount;
    
    // 丰富的配色方案
    const warmColors = [
      "#FF6B35", "#FF4757", "#FF6B81", "#FFA502", "#FF7F50",
      "#E74C3C", "#F39C12", "#E67E22", "#D35400", "#C0392B",
    ];
    
    const coolColors = [
      "#3498DB", "#2ECC71", "#1ABC9C", "#00D2D3", "#3742FA",
      "#2980B9", "#27AE60", "#16A085", "#0984e3", "#00b894",
    ];
    
    const neutralColors = [
      "#2F3542", "#57606F", "#747D8C", "#636e72", "#2d3436",
    ];
    
    if (weight > 0.6) {
      return warmColors[index % warmColors.length];
    } else if (weight > 0.3) {
      return coolColors[index % coolColors.length];
    } else {
      return neutralColors[index % neutralColors.length];
    }
  };

  // 计算字体大小 - 更明显的差异
  const getFontSize = (count: number, maxCount: number): number => {
    const minSize = 13;
    const maxSize = 58;
    const weight = count / maxCount;
    // 使用平方根缩放使高频词更突出
    return Math.round(minSize + Math.pow(weight, 0.6) * (maxSize - minSize));
  };

  // 计算布局
  useEffect(() => {
    if (!isMounted || !containerRef.current || words.length === 0) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxCount = Math.max(...words.map(w => w.count));
    const placed: WordLayout[] = [];
    const placedBounds: Array<{ x: number; y: number; width: number; height: number }> = [];
    
    // 取前80个词，按词频排序
    const sortedWords = [...words]
      .sort((a, b) => b.count - a.count)
      .slice(0, 80);

    // 创建临时元素测量文本尺寸
    const measureSpan = document.createElement('span');
    measureSpan.style.position = 'absolute';
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.whiteSpace = 'nowrap';
    measureSpan.style.fontWeight = 'bold';
    container.appendChild(measureSpan);

    for (let i = 0; i < sortedWords.length; i++) {
      const wordFreq = sortedWords[i];
      const fontSize = getFontSize(wordFreq.count, maxCount);
      const color = getColor(i, wordFreq.count, maxCount);
      
      // 20%概率竖排
      const rotation = Math.random() < 0.15 ? 90 : 0;
      
      // 测量文本尺寸
      measureSpan.style.fontSize = `${fontSize}px`;
      measureSpan.textContent = wordFreq.word;
      const textWidth = measureSpan.offsetWidth;
      const textHeight = fontSize;
      
      // 根据旋转方向计算实际占用的宽高
      const width = rotation === 90 ? textHeight + 4 : textWidth + 6;
      const height = rotation === 90 ? textWidth + 6 : textHeight + 4;
      
      // 螺旋放置算法
      let placed_flag = false;
      let angle = Math.random() * Math.PI * 2;
      let radius = 0;
      const angleStep = 0.25;
      const radiusStep = 2;
      const maxRadius = Math.min(rect.width, rect.height) / 2;
      
      while (!placed_flag && radius < maxRadius) {
        const x = centerX + radius * Math.cos(angle) - width / 2;
        const y = centerY + radius * Math.sin(angle) - height / 2;
        
        // 边界检查
        if (x >= 2 && x + width <= rect.width - 2 &&
            y >= 2 && y + height <= rect.height - 2) {
          
          // 碰撞检测
          const bounds = { x, y, width, height };
          const hasCollision = placedBounds.some(b => {
            return !(x + width < b.x || x > b.x + b.width ||
                     y + height < b.y || y > b.y + b.height);
          });
          
          if (!hasCollision) {
            placed.push({
              word: wordFreq,
              x,
              y,
              width,
              height,
              fontSize,
              color,
              rotation,
            });
            placedBounds.push(bounds);
            placed_flag = true;
          }
        }
        
        angle += angleStep;
        radius += radiusStep;
      }
    }
    
    container.removeChild(measureSpan);
    setLayouts(placed);
  }, [words, isMounted]);

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
      {layouts.map((layout, index) => (
        <div
          key={`${layout.word.word}-${index}`}
          onClick={() => onWordClick(layout.word)}
          className={`
            absolute cursor-pointer select-none
            transition-all duration-200 
            hover:scale-110 hover:z-10
            ${selectedWord === layout.word.word ? 'ring-2 ring-orange-400 ring-opacity-50 rounded scale-110 z-20' : ''}
          `}
          style={{
            left: layout.x,
            top: layout.y,
            fontSize: `${layout.fontSize}px`,
            fontWeight: 'bold',
            color: layout.color,
            transform: layout.rotation === 90 ? `rotate(90deg)` : undefined,
            transformOrigin: 'center center',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px',
            padding: '2px 4px',
          }}
        >
          {layout.word.word}
        </div>
      ))}
      
      {layouts.length === 0 && words.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          生成词云中...
        </div>
      )}
    </div>
  );
};

export default WordCloud;
