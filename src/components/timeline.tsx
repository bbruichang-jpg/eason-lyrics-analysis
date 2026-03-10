"use client";

import React, { useRef, useState } from "react";
import { Album } from "@/data/lyrics-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  albums: Album[];
  selectedAlbum: string | null;
  onAlbumSelect: (albumId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  albums,
  selectedAlbum,
  onAlbumSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // 按年份分组
  const yearGroups = React.useMemo(() => {
    const sortedAlbums = [...albums].sort((a, b) => a.year - b.year);
    const groups: { [year: number]: Album[] } = {};
    
    sortedAlbums.forEach((album) => {
      if (!groups[album.year]) {
        groups[album.year] = [];
      }
      groups[album.year].push(album);
    });
    
    return groups;
  }, [albums]);

  // 获取所有年份并排序
  const years = React.useMemo(() => {
    return Object.keys(yearGroups)
      .map(Number)
      .sort((a, b) => a - b);
  }, [yearGroups]);

  // 检查滚动位置
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // 滚动
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative w-full">
      {/* 左箭头 */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 shadow-sm hover:bg-white"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* 右箭头 */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-white/90 shadow-sm hover:bg-white"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* 年份列表 */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {years.map((year) => {
          const yearAlbums = yearGroups[year];
          const isSelected = yearAlbums.some((a) => a.id === selectedAlbum);
          const albumCount = yearAlbums.length;
          const decade = Math.floor(year / 10) * 10;
          const decadeColor = decade === 1990 
            ? "from-purple-500 to-purple-600" 
            : decade === 2000 
            ? "from-blue-500 to-blue-600"
            : decade === 2010 
            ? "from-teal-500 to-teal-600"
            : "from-pink-500 to-pink-600";

          return (
            <button
              key={year}
              onClick={() => onAlbumSelect(yearAlbums[0].id)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[70px] h-[72px] px-3 rounded-xl
                transition-all duration-300 ease-out
                group cursor-pointer
                ${isSelected
                  ? `bg-gradient-to-br ${decadeColor} text-white shadow-lg scale-105`
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }
              `}
            >
              {/* 年份 */}
              <span className={`text-lg font-bold ${isSelected ? "text-white" : ""}`}>
                {year}
              </span>
              
              {/* 专辑数量 */}
              <span className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                {albumCount} 张
              </span>

              {/* Tooltip */}
              <div className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                pointer-events-none z-20
              ">
                <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                  <div className="font-semibold mb-1">{year}年专辑</div>
                  {yearAlbums.slice(0, 4).map((album) => (
                    <div key={album.id} className="text-slate-300 truncate max-w-[180px]">
                      • {album.name}
                    </div>
                  ))}
                  {yearAlbums.length > 4 && (
                    <div className="text-slate-400 mt-1">
                      还有 {yearAlbums.length - 4} 张...
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 渐变遮罩 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default Timeline;
