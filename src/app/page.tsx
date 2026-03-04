"use client";

import { useState } from "react";
import { albums, songs, Song, Album, WordFrequency, LyricTrace } from "@/data/lyrics-data";
import { analyzeLyrics, traceWord, getAlbumCover } from "@/lib/lyrics-analyzer";
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

  // 获取可选的歌曲列表
  const availableSongs =
    selectedAlbum === "all"
      ? songs
      : songs.filter((song) => song.albumId === selectedAlbum);

  // 开始分析
  const handleAnalyze = () => {
    setIsAnalyzing(true);

    // 模拟分析延迟
    setTimeout(() => {
      const albumId = selectedAlbum === "all" ? null : selectedAlbum;
      const songId = selectedSong === "all" ? null : selectedSong;

      const result = analyzeLyrics(songs, albums, albumId, songId);
      setAnalysisData(result);
      setSelectedWord(null);
      setTraceData(null);
      setIsAnalyzing(false);
    }, 500);
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
    const trace = traceWord(word.word, songs, albums);
    setTraceData(trace);
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
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">专辑:</label>
                <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择专辑" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部专辑</SelectItem>
                    {albums.map((album) => (
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
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择歌曲" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部歌曲</SelectItem>
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
                    <div
                      className="aspect-square rounded-lg shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                      style={{
                        background: getAlbumCover(currentAlbum.id),
                      }}
                    >
                      {currentAlbum.name}
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
              <div className="flex justify-center gap-4 flex-wrap">
                {albums.map((album) => (
                  <Card
                    key={album.id}
                    className="w-40 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedAlbum(album.id)}
                  >
                    <div
                      className="aspect-square rounded-t-lg"
                      style={{
                        background: getAlbumCover(album.id),
                      }}
                    />
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-center">
                        {album.name}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        {album.year}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
