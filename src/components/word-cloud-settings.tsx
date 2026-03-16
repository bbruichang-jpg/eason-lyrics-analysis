"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, RotateCcw, Palette } from "lucide-react";

// 预设配色主题
export const colorThemes = [
  { id: "rainbow", name: "彩虹", colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'] },
  { id: "ocean", name: "海洋", colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E', '#023E8A', '#0096C7', '#48CAE4', '#ADE8F4'] },
  { id: "sunset", name: "日落", colors: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFD700', '#FF4500', '#DC143C', '#FF6347', '#FF7F50'] },
  { id: "forest", name: "森林", colors: ['#2D5A27', '#4A7C2E', '#6B8E23', '#8FBC8F', '#90EE90', '#228B22', '#32CD32', '#3CB371', '#66CDAA'] },
  { id: "lavender", name: "薰衣草", colors: ['#9B59B6', '#8E44AD', '#A569BD', '#BB8FCE', '#D7BDE2', '#E8DAEF', '#AF7AC5', '#9B59B6', '#7D3C98'] },
  { id: "warm", name: "暖阳", colors: ['#F39C12', '#E67E22', '#F1C40F', '#D4AC0D', '#B7950B', '#FFC107', '#FFB300', '#FFA000', '#FF8F00'] },
  { id: "cool", name: "清凉", colors: ['#3498DB', '#2980B9', '#5DADE2', '#85C1E9', '#AED6F1', '#1ABC9C', '#16A085', '#48C9B0', '#76D7C4'] },
  { id: "monochrome", name: "水墨", colors: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E', '#ABB2B9', '#7F8C8D', '#95A5A6', '#BDC3C7', '#D5DBDB'] },
  { id: "sakura", name: "樱花", colors: ['#FFB7C5', '#FF69B4', '#FF1493', '#DB7093', '#C71585', '#FFC0CB', '#FFB6C1', '#FFA0B4', '#FF91A4'] },
  { id: "neon", name: "霓虹", colors: ['#FF00FF', '#00FFFF', '#FF006E', '#8338EC', '#3A86FF', '#FFBE0B', '#FB5607', '#06D6A0', '#EF476F'] },
];

// 形状选项
export const shapeOptions = [
  { id: "circle", name: "圆形", value: 0.65 },
  { id: "ellipse", name: "椭圆", value: 0.5 },
  { id: "wide", name: "横向", value: 0.3 },
  { id: "tall", name: "纵向", value: 0.9 },
  { id: "square", name: "方形", value: 1 },
];

// 字体选项
export const fontOptions = [
  { id: "default", name: "默认", value: "PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif" },
  { id: "serif", name: "衬线", value: "Georgia, 'Times New Roman', serif" },
  { id: "rounded", name: "圆润", value: "'Comic Sans MS', 'PingFang SC', cursive" },
  { id: "elegant", name: "优雅", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
];

export interface WordCloudSettings {
  wordCount: number;        // 词汇数量
  colorTheme: string;       // 配色主题ID
  customColors: string[];   // 自定义颜色
  useCustomColors: boolean; // 是否使用自定义颜色
  minSize: number;          // 最小字号比例
  maxSize: number;          // 最大字号比例
  shape: number;            // 形状参数 (ellipticity)
  rotation: number;         // 旋转比例
  font: string;             // 字体
}

interface WordCloudSettingsPanelProps {
  settings: WordCloudSettings;
  onSettingsChange: (settings: WordCloudSettings) => void;
  albumColors?: string[];
}

export const defaultSettings: WordCloudSettings = {
  wordCount: 80,
  colorTheme: "rainbow",
  customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  useCustomColors: false,
  minSize: 15,
  maxSize: 100,
  shape: 0.65,
  rotation: 0.3,
  font: "PingFang SC, Microsoft YaHei, Hiragino Sans GB, sans-serif",
};

export const WordCloudSettingsPanel: React.FC<WordCloudSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  albumColors,
}) => {
  const updateSetting = <K extends keyof WordCloudSettings>(key: K, value: WordCloudSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resetSettings = () => {
    onSettingsChange(defaultSettings);
  };

  const getCurrentColors = (): string[] => {
    if (settings.useCustomColors && settings.customColors.length > 0) {
      return settings.customColors;
    }
    const theme = colorThemes.find(t => t.id === settings.colorTheme);
    return theme ? theme.colors : defaultSettings.customColors;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">词云设置</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        </div>
        <CardDescription>自定义词云的显示效果</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 词汇数量 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">词汇数量</Label>
            <span className="text-sm text-muted-foreground font-mono">{settings.wordCount}</span>
          </div>
          <Slider
            value={[settings.wordCount]}
            onValueChange={([value]) => updateSetting('wordCount', value)}
            min={20}
            max={150}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>20</span>
            <span>150</span>
          </div>
        </div>

        {/* 配色主题 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            配色主题
          </Label>
          {albumColors && albumColors.length > 0 && (
            <Button
              variant={settings.colorTheme === 'album' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                updateSetting('colorTheme', 'album');
                updateSetting('useCustomColors', false);
              }}
              className="w-full mb-2"
            >
              专辑配色
            </Button>
          )}
          <div className="grid grid-cols-5 gap-2">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  updateSetting('colorTheme', theme.id);
                  updateSetting('useCustomColors', false);
                }}
                className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                  settings.colorTheme === theme.id && !settings.useCustomColors
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-transparent hover:border-gray-300'
                }`}
                title={theme.name}
              >
                <div className="flex gap-0.5">
                  {theme.colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义颜色 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">自定义颜色</Label>
            <Button
              variant={settings.useCustomColors ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateSetting('useCustomColors', !settings.useCustomColors)}
            >
              {settings.useCustomColors ? '已启用' : '启用'}
            </Button>
          </div>
          {settings.useCustomColors && (
            <div className="flex flex-wrap gap-2">
              {settings.customColors.map((color, index) => (
                <div key={index} className="relative group">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...settings.customColors];
                      newColors[index] = e.target.value;
                      updateSetting('customColors', newColors);
                    }}
                    className="w-8 h-8 rounded cursor-pointer border-2 border-gray-200"
                  />
                  {settings.customColors.length > 2 && (
                    <button
                      onClick={() => {
                        const newColors = settings.customColors.filter((_, i) => i !== index);
                        updateSetting('customColors', newColors);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {settings.customColors.length < 10 && (
                <button
                  onClick={() => updateSetting('customColors', [...settings.customColors, '#888888'])}
                  className="w-8 h-8 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>

        {/* 字体大小 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">字体大小范围</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">最小</span>
                <span className="text-xs text-muted-foreground font-mono">{settings.minSize}%</span>
              </div>
              <Slider
                value={[settings.minSize]}
                onValueChange={([value]) => updateSetting('minSize', value)}
                min={5}
                max={50}
                step={1}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">最大</span>
                <span className="text-xs text-muted-foreground font-mono">{settings.maxSize}%</span>
              </div>
              <Slider
                value={[settings.maxSize]}
                onValueChange={([value]) => updateSetting('maxSize', value)}
                min={50}
                max={150}
                step={5}
              />
            </div>
          </div>
        </div>

        {/* 形状 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">词云形状</Label>
          <div className="grid grid-cols-5 gap-2">
            {shapeOptions.map((shape) => (
              <button
                key={shape.id}
                onClick={() => updateSetting('shape', shape.value)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  settings.shape === shape.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-8 h-6 mx-auto border-2 border-current rounded"
                  style={{
                    borderRadius: shape.value < 0.5 ? '50%' : shape.value > 0.8 ? '25%' : '40%',
                  }}
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 旋转角度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">词汇旋转</Label>
            <span className="text-sm text-muted-foreground">{Math.round(settings.rotation * 100)}%</span>
          </div>
          <Slider
            value={[settings.rotation]}
            onValueChange={([value]) => updateSetting('rotation', value)}
            min={0}
            max={1}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>无旋转</span>
            <span>全部旋转</span>
          </div>
        </div>

        {/* 字体 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">字体风格</Label>
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                onClick={() => updateSetting('font', font.value)}
                className={`p-2 rounded-lg border-2 transition-all text-sm ${
                  settings.font === font.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* 当前配色预览 */}
        <div className="pt-2 border-t">
          <Label className="text-sm font-medium mb-2 block">当前配色预览</Label>
          <div className="flex gap-1 flex-wrap">
            {getCurrentColors().map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
