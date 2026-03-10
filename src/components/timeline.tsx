"use client";

import React from "react";
import { Album } from "@/data/lyrics-data";

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

  // 计算时间范围
  const minYear = years[0] || 1996;
  const maxYear = years[years.length - 1] || 2024;

  return (
    <div className="w-full py-4 px-2">
      {/* 时间轴主体 */}
      <div className="relative">
        {/* 时间轴线 */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-pink-400 transform -translate-y-1/2" />
        
        {/* 时间点 */}
        <div className="relative flex justify-between items-center">
          {years.map((year) => {
            const yearAlbums = yearGroups[year];
            const isSelected = yearAlbums.some((a) => a.id === selectedAlbum);
            const albumCount = yearAlbums.length;
            
            // 计算位置百分比
            const position = ((year - minYear) / (maxYear - minYear)) * 100;
            
            return (
              <div
                key={year}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                {/* 年份标签 */}
                <div
                  className={`
                    relative cursor-pointer group
                    ${isSelected ? "z-20" : "z-10"}
                  `}
                  onClick={() => {
                    // 点击年份选择该年第一张专辑
                    if (yearAlbums.length > 0) {
                      onAlbumSelect(yearAlbums[0].id);
                    }
                  }}
                >
                  {/* 时间点圆圈 */}
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 transition-all duration-200
                      ${isSelected 
                        ? "bg-purple-600 border-purple-600 scale-125 shadow-lg shadow-purple-300" 
                        : "bg-white border-purple-300 hover:border-purple-500 hover:scale-110"
                      }
                    `}
                  />
                  
                  {/* 年份文字 */}
                  <div
                    className={`
                      absolute top-6 left-1/2 transform -translate-x-1/2
                      text-xs font-medium whitespace-nowrap
                      transition-colors duration-200
                      ${isSelected 
                        ? "text-purple-600" 
                        : "text-muted-foreground group-hover:text-purple-500"
                      }
                    `}
                  >
                    {year}
                  </div>

                  {/* 专辑数量气泡 */}
                  {albumCount > 1 && (
                    <div
                      className={`
                        absolute -top-3 left-1/2 transform -translate-x-1/2
                        min-w-[18px] h-[18px] px-1 rounded-full
                        text-[10px] font-bold flex items-center justify-center
                        transition-all duration-200
                        ${isSelected 
                          ? "bg-purple-600 text-white" 
                          : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                        }
                      `}
                    >
                      {albumCount}
                    </div>
                  )}

                  {/* Hover 提示 */}
                  <div className="
                    absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    pointer-events-none
                  ">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-bold mb-1">{year}年</div>
                      {yearAlbums.slice(0, 3).map((album) => (
                        <div key={album.id} className="truncate max-w-[150px]">
                          {album.name}
                        </div>
                      ))}
                      {yearAlbums.length > 3 && (
                        <div className="text-slate-400">
                          +{yearAlbums.length - 3} 更多
                        </div>
                      )}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 年份范围 */}
      <div className="flex justify-between mt-8 px-2">
        <span className="text-xs text-muted-foreground">{minYear}</span>
        <span className="text-xs font-medium text-purple-600">
          共 {years.length} 个年份 · {albums.length} 张专辑
        </span>
        <span className="text-xs text-muted-foreground">{maxYear}</span>
      </div>
    </div>
  );
};

export default Timeline;
