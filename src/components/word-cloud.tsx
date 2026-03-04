"use client";

import React, { useEffect, useRef } from "react";
import { WordFrequency } from "@/data/lyrics-data";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick: (word: WordFrequency) => void;
  selectedWord: string | null;
}

const WordCloud: React.FC<WordCloudProps> = ({ words, onWordClick, selectedWord }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成颜色
  const getWordColor = (index: number) => {
    const colors = [
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // amber
      "#EF4444", // red
      "#6366F1", // indigo
      "#14B8A6", // teal
    ];
    return colors[index % colors.length];
  };

  // 计算字体大小
  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 14;
    const maxSize = 48;
    const size = minSize + ((count - 1) / (maxCount - 1)) * (maxSize - minSize);
    return Math.round(size);
  };

  useEffect(() => {
    if (!containerRef.current || words.length === 0) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const maxCount = Math.max(...words.map((w) => w.count));
    const placedWords: Array<{ x: number; y: number; width: number; height: number }> = [];

    words.forEach((wordFreq, index) => {
      const wordEl = document.createElement("div");
      wordEl.textContent = wordFreq.word;
      wordEl.className = "absolute cursor-pointer transition-all duration-300 hover:scale-110 select-none";

      const fontSize = getFontSize(wordFreq.count, maxCount);
      wordEl.style.fontSize = `${fontSize}px`;
      wordEl.style.fontWeight = "bold";
      wordEl.style.color = getWordColor(index);
      wordEl.style.padding = "4px 8px";
      wordEl.style.borderRadius = "4px";
      wordEl.style.whiteSpace = "nowrap";

      if (selectedWord === wordFreq.word) {
        wordEl.style.backgroundColor = "rgba(139, 92, 246, 0.2)";
        wordEl.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.3)";
        wordEl.style.transform = "scale(1.15)";
      }

      // 临时添加到DOM以获取尺寸
      container.appendChild(wordEl);
      const wordRect = wordEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const wordWidth = wordRect.width;
      const wordHeight = wordRect.height;

      // 移除临时元素
      container.removeChild(wordEl);

      // 尝试放置词
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const x = Math.random() * (containerRect.width - wordWidth);
        const y = Math.random() * (containerRect.height - wordHeight);

        // 检查碰撞
        const wordBounds = {
          x: x,
          y: y,
          width: wordWidth,
          height: wordHeight,
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

        attempts++;
      }
    });
  }, [words, selectedWord, onWordClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-lg"
    />
  );
};

export default WordCloud;
