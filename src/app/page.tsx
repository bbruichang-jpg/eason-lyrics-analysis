"use client";

import { useState, useMemo } from "react";
import { albums, songs, Song, Album, WordFrequency, LyricTrace } from "@/data/lyrics-data";
import { globalWordFrequencies, albumWordFrequencies } from "@/data/word-frequency";
import { getAlbumColors, defaultColors } from "@/data/album-colors";
import { analyzeLyrics, traceWord, getAlbumCover, getGradientColor } from "@/lib/lyrics-analyzer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, BarChart3, MessageSquare, Database } from "lucide-react";
import dynamic from "next/dynamic";
import { Timeline } from "@/components/timeline";

// 动态导入词云组件以避免 SSR 问题
const WordCloud = dynamic(() => import("@/components/word-cloud"), { ssr: false });

export default function Home() {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedSong, setSelectedSong] = useState<string>("all");
  const [analysisData, setAnalysisData] = useState<{
    totalWords: number;
    uniqueWords: number;
    songCount: number;
    wordFrequencies: WordFrequency[];
  } | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordFrequency | null>(null);
  const [traceData, setTraceData] = useState<LyricTrace | null>(null);
  const [selectedSongForLyrics, setSelectedSongForLyrics] = useState<Song | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 12; // 每页显示12张专辑

  // 按年份排序的专辑列表
  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => a.year - b.year);
  }, []);

  // 获取可选的歌曲列表
  const availableSongs =
    selectedAlbum === "all"
      ? songs
      : songs.filter((song) => song.albumId === selectedAlbum);

  // 获取当前专辑的配色方案
  const currentAlbumColors = useMemo(() => {
    if (selectedAlbum === "all") {
      return defaultColors; // 全局分析使用默认彩虹色
    }
    return getAlbumColors(selectedAlbum);
  }, [selectedAlbum]);

  // 分页计算
  const totalPages = Math.ceil(sortedAlbums.length / albumsPerPage);
  const startIndex = (currentPage - 1) * albumsPerPage;
  const endIndex = startIndex + albumsPerPage;
  const currentAlbums = sortedAlbums.slice(startIndex, endIndex);

  // 上一页
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  // 下一页
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // 开始分析
  const handleAnalyze = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      if (selectedAlbum === "all") {
        // 使用预计算的全局词频数据
        const wordFrequencies: WordFrequency[] = globalWordFrequencies.map((wf, index) => ({
          word: wf.word,
          count: wf.count,
          songs: [],
          albums: [],
          contexts: [],
        }));

        setAnalysisData({
          totalWords: globalWordFrequencies.reduce((sum, wf) => sum + wf.count, 0),
          uniqueWords: globalWordFrequencies.length,
          songCount: songs.length,
          wordFrequencies,
        });
      } else {
        // 查找专辑预计算数据
        const albumData = albumWordFrequencies.find(a => a.albumId === selectedAlbum);
        
        if (albumData) {
          const wordFrequencies: WordFrequency[] = albumData.topWords.map((wf) => ({
            word: wf.word,
            count: wf.count,
            songs: [],
            albums: [],
            contexts: [],
          }));

          setAnalysisData({
            totalWords: albumData.topWords.reduce((sum, wf) => sum + wf.count, 0),
            uniqueWords: albumData.topWords.length,
            songCount: songs.filter(s => s.albumId === selectedAlbum).length,
            wordFrequencies,
          });
        } else {
          // 回退到实时分析
          const result = analyzeLyrics(songs, albums, selectedAlbum, selectedSong === "all" ? null : selectedSong);
          setAnalysisData(result);
        }
      }

      setSelectedWord(null);
      setTraceData(null);
      setIsAnalyzing(false);
    }, 300);
  };

  // 刷新数据
  const handleRefresh = () => {
    setSelectedAlbum("all");
    setSelectedSong("all");
    setAnalysisData(null);
    setSelectedWord(null);
    setTraceData(null);
    setSelectedSongForLyrics(null);
  };

  // 选择词云中的词汇
  const handleWordClick = (word: WordFrequency) => {
    setSelectedWord(word);
    
    // 使用 API 返回的上下文数据，如果没有则回退到客户端计算
    if (word.contexts && word.contexts.length > 0) {
      const trace: LyricTrace = {
        word: word.word,
        totalCount: word.count,
        songCount: word.songs.length,
        albumCount: word.albums.length,
        traces: word.contexts.map(ctx => ({
          albumId: ctx.albumId,
          albumName: ctx.albumName,
          songId: ctx.songId,
          songName: ctx.songName,
          lyricSnippet: ctx.line,
        })),
      };
      setTraceData(trace);
    } else {
      // 回退到客户端计算
      const trace = traceWord(word.word, songs, albums);
      setTraceData(trace);
    }
  };

  // 查看歌曲歌词
  const handleViewLyrics = (song: Song) => {
    setSelectedSongForLyrics(song);
  };

  // 关闭歌词弹窗
  const handleCloseLyrics = () => {
    setSelectedSongForLyrics(null);
  };

  // 获取当前专辑信息
  const currentAlbum = albums.find((a) => a.id === selectedAlbum) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* 顶部筛选区 */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              陈奕迅歌词分析系统
            </h1>
            
            {/* 时间轴 */}
            <div className="bg-white/80 dark:bg-slate-800/50 rounded-lg p-2 shadow-sm">
              <Timeline
                albums={albums}
                selectedAlbum={selectedAlbum === "all" ? null : selectedAlbum}
                onAlbumSelect={(albumId) => {
                  setSelectedAlbum(albumId);
                  setSelectedSong("all");
                }}
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">专辑:</label>
                <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="选择专辑" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部专辑 ({albums.length}张)</SelectItem>
                    {sortedAlbums.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.name} ({album.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">歌曲:</label>
                <Select value={selectedSong} onValueChange={setSelectedSong}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="选择歌曲" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部歌曲 ({availableSongs.length}首)</SelectItem>
                    {availableSongs.map((song) => (
                      <SelectItem key={song.id} value={song.id}>
                        {song.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isAnalyzing ? "分析中..." : "开始分析"}
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新数据
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {analysisData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧数据概览区 */}
            <aside className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    数据概览
                  </CardTitle>
                  <CardDescription>当前分析范围</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 专辑封面 */}
                  {currentAlbum && selectedAlbum !== "all" && (
                    <div className="aspect-square rounded-lg shadow-lg overflow-hidden relative bg-gradient-to-br from-purple-500 to-pink-500">
                      <img
                        src={getAlbumCover(currentAlbum.id, currentAlbum.name)}
                        alt={currentAlbum.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 如果图片加载失败，使用渐变色
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            // 移除 Tailwind 背景类，避免覆盖内联样式
                            parent.className = parent.className
                              .replace(/bg-gradient-to-br\s+from-\w+-\d+\s+to-\w+-\d+/g, '')
                              .trim();
                            target.style.display = 'none';
                            parent.style.background = getGradientColor(currentAlbum.id);
                            const text = document.createElement('div');
                            text.className = 'absolute inset-0 flex items-center justify-center text-white text-2xl font-bold';
                            text.textContent = currentAlbum.name;
                            parent.appendChild(text);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* 统计数据 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">总词数</span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {analysisData.totalWords.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">UNIQUE 词</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {analysisData.uniqueWords.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">歌曲数</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {analysisData.songCount}
                      </span>
                    </div>
                  </div>

                  {/* 当前筛选信息 */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">当前筛选:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {selectedAlbum === "all" ? "全部专辑" : currentAlbum?.name}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedSong === "all" ? "全部歌曲" : songs.find(s => s.id === selectedSong)?.name}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* 中间词云可视化区 */}
            <section className="lg:col-span-5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    词云可视化
                  </CardTitle>
                  <CardDescription>高频词汇展示（点击词汇查看详情）</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <WordCloud
                      words={analysisData.wordFrequencies}
                      onWordClick={handleWordClick}
                      selectedWord={selectedWord?.word || null}
                      albumColors={currentAlbumColors}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* 右侧溯源统计区 */}
            <aside className="lg:col-span-4 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    溯源统计
                  </CardTitle>
                  <CardDescription>词汇使用详情</CardDescription>
                </CardHeader>
                <CardContent>
                  {traceData && selectedWord ? (
                    <div className="space-y-4">
                      {/* 词频统计 */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            "{selectedWord.word}"
                          </h3>
                          <Badge variant="outline" className="text-lg">
                            {selectedWord.count} 次
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>覆盖 {traceData.songCount} 首歌曲</span>
                          <span>{traceData.albumCount} 张专辑</span>
                        </div>
                      </div>

                      {/* 溯源列表 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">歌词溯源:</h4>
                        <ScrollArea className="h-[350px] rounded-md border p-2">
                          <div className="space-y-2">
                            {traceData.traces.map((trace, index) => (
                              <div
                                key={index}
                                className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {trace.albumName}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {trace.songName}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleViewLyrics(
                                        songs.find((s) => s.id === trace.songId)!
                                      )
                                    }
                                  >
                                    查看歌词
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {trace.lyricSnippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>点击词云中的词汇查看详细信息</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BarChart3 className="h-24 w-24 mx-auto mb-6 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">欢迎使用陈奕迅歌词分析系统</h2>
              <p className="text-muted-foreground mb-6">
                选择专辑或歌曲，点击"开始分析"查看词频统计和溯源信息
              </p>
              <div className="mb-6">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  共收录 {albums.length} 张专辑，{songs.length} 首歌曲
                </Badge>
              </div>
              <div className="flex justify-center gap-4 flex-wrap max-w-5xl mx-auto">
                {currentAlbums.map((album) => (
                  <Card
                    key={album.id}
                    className="w-36 cursor-pointer hover:shadow-lg transition-shadow hover:scale-105"
                    onClick={() => setSelectedAlbum(album.id)}
                  >
                    <div className="aspect-square rounded-t-lg overflow-hidden relative bg-gradient-to-br from-purple-500 to-pink-500">
                      <img
                        src={getAlbumCover(album.id, album.name)}
                        alt={album.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 如果图片加载失败，显示渐变色背景
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            // 移除 Tailwind 背景类，避免覆盖内联样式
                            parent.className = parent.className
                              .replace(/bg-gradient-to-br\s+from-\w+-\d+\s+to-\w+-\d+/g, '')
                              .trim();
                            target.style.display = 'none';
                            parent.style.background = getGradientColor(album.id);
                          }
                        }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-center line-clamp-1">
                        {album.name}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {album.year}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页控件 */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  第 {currentPage} 页 / 共 {totalPages} 页
                </p>
                <Badge variant="secondary" className="text-xs">
                  显示 {startIndex + 1}-{Math.min(endIndex, sortedAlbums.length)} / 共 {sortedAlbums.length} 张专辑
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                点击专辑卡片快速开始，或使用上方下拉菜单选择专辑
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 歌词弹窗 */}
      {selectedSongForLyrics && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseLyrics}
        >
          <Card
            className="max-w-3xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedSongForLyrics.name}</CardTitle>
                  <CardDescription>
                    {albums.find((a) => a.id === selectedSongForLyrics.albumId)?.name}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseLyrics}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedSongForLyrics.lyrics}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
