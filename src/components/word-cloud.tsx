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
  const [isMounted, setIsMounted] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 生成颜色 - 更多彩活泼的配色方案（参考图风格）
  const getWordColor = (index: number, count: number, maxCount: number) => {
    // 根据词频权重分配颜色，高频词用暖色，低频词用冷色
    const weight = count / maxCount;
    
    // 多彩配色方案
    const warmColors = [
      "#FF6B35", // 橙色
      "#FF4757", // 红色
      "#FF6B81", // 粉红
      "#FFA502", // 金橙
      "#FF7F50", // 珊瑚色
    ];
    
    const coolColors = [
      "#3742FA", // 蓝色
      "#2ED573", // 绿色
      "#1E90FF", // 道奇蓝
      "#00D2D3", // 青色
      "#7BED9F", // 浅绿
    ];
    
    const neutralColors = [
      "#2F3542", // 深灰
      "#57606F", // 灰色
      "#747D8C", // 中灰
    ];
    
    // 高频词用暖色，中频词用冷色，低频词用中性色
    if (weight > 0.6) {
      return warmColors[index % warmColors.length];
    } else if (weight > 0.3) {
      return coolColors[index % coolColors.length];
    } else {
      return neutralColors[index % neutralColors.length];
    }
  };

  // 计算字体大小 - 更大的差异范围
  const getFontSize = (count: number, maxCount: number, minCount: number) => {
    // 使用对数缩放使差异更明显
    const minSize = 12;
    const maxSize = 56;
    
    if (maxCount === minCount) return minSize;
    
    const normalizedCount = (count - minCount) / (maxCount - minCount);
    // 使用平方根缩放使差异更明显
    const size = minSize + Math.sqrt(normalizedCount) * (maxSize - minSize);
    return Math.round(size);
  };

  useEffect(() => {
    if (!isMounted || !containerRef.current || words.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const counts = words.map((w) => w.count);
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    
    const placedWords: Array<{ x: number; y: number; width: number; height: number }> = [];

    // 按词频排序，高频词先放置（放在中心区域）
    const sortedWords = [...words].sort((a, b) => b.count - a.count);

    sortedWords.forEach((wordFreq, index) => {
      const wordEl = document.createElement("div");
      wordEl.textContent = wordFreq.word;
      wordEl.className = "absolute cursor-pointer transition-all duration-300 hover:scale-110 select-none font-bold";

      const fontSize = getFontSize(wordFreq.count, maxCount, minCount);
      wordEl.style.fontSize = `${fontSize}px`;
      wordEl.style.color = getWordColor(index, wordFreq.count, maxCount);
      wordEl.style.whiteSpace = "nowrap";
      wordEl.style.letterSpacing = "0.5px";

      if (selectedWord === wordFreq.word) {
        wordEl.style.backgroundColor = "rgba(255, 107, 53, 0.15)";
        wordEl.style.borderRadius = "4px";
        wordEl.style.padding = "2px 6px";
      }

      // 临时添加到DOM以获取尺寸
      container.appendChild(wordEl);
      const wordRect = wordEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const wordWidth = wordRect.width;
      const wordHeight = wordRect.height;

      // 移除临时元素
      container.removeChild(wordEl);

      // 螺旋放置算法 - 高频词更靠近中心
      let placed = false;
      let angle = 0;
      let radius = 0;
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      const spiralStep = 5;
      const angleStep = 0.5;
      const maxRadius = Math.min(containerRect.width, containerRect.height) / 2;

      while (!placed && radius < maxRadius) {
        const x = centerX + radius * Math.cos(angle) - wordWidth / 2;
        const y = centerY + radius * Math.sin(angle) - wordHeight / 2;

        // 检查是否在容器内
        if (x >= 0 && x + wordWidth <= containerRect.width &&
            y >= 0 && y + wordHeight <= containerRect.height) {
          
          // 检查碰撞
          const wordBounds = {
            x: x,
            y: y,
            width: wordWidth + 8, // 添加间距
            height: wordHeight + 4,
          };

          const hasCollision = placedWords.some((placed) => {
            return (
              wordBounds.x < placed.x + placed.width &&
              wordBounds.x + wordBounds.width > placed.x &&
              wordBounds.y < placed.y + placed.height &&
              wordBounds.y + wordBounds.height > placed.y
            );
          });

          if (!hasCollision) {
            wordEl.style.left = `${x}px`;
            wordEl.style.top = `${y}px`;
            container.appendChild(wordEl);
            placedWords.push(wordBounds);
            placed = true;

            // 添加点击事件
            wordEl.addEventListener("click", () => onWordClick(wordFreq));
          }
        }

        angle += angleStep;
        radius += spiralStep / (2 * Math.PI);
      }

      // 如果螺旋算法无法放置，使用随机放置作为后备
      if (!placed) {
        let attempts = 0;
        const maxAttempts = 50;

        while (!placed && attempts < maxAttempts) {
          const x = Math.random() * (containerRect.width - wordWidth);
          const y = Math.random() * (containerRect.height - wordHeight);

          const wordBounds = {
            x: x,
            y: y,
            width: wordWidth + 8,
            height: wordHeight + 4,
          };

          const hasCollision = placedWords.some((placed) => {
            return (
              wordBounds.x < placed.x + placed.width &&
              wordBounds.x + wordBounds.width > placed.x &&
              wordBounds.y < placed.y + placed.height &&
              wordBounds.y + wordBounds.height > placed.y
            );
          });

          if (!hasCollision) {
            wordEl.style.left = `${x}px`;
            wordEl.style.top = `${y}px`;
            container.appendChild(wordEl);
            placedWords.push(wordBounds);
            placed = true;

            wordEl.addEventListener("click", () => onWordClick(wordFreq));
          }

          attempts++;
        }
      }
    });
  }, [words, selectedWord, onWordClick, isMounted]);

  if (!isMounted) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-white rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white rounded-lg"
    />
  );
};

export default WordCloud;
