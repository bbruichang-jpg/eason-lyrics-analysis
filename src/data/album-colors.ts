// 专辑封面配色方案
// 基于每个专辑封面的主色调提取

export interface AlbumColors {
  albumId: string;
  albumName: string;
  // 主色调数组，用于词云配色
  colors: string[];
}

// 各专辑封面配色方案
export const albumColorSchemes: AlbumColors[] = [
  {
    albumId: "album-0",
    albumName: "陈奕迅",
    colors: ["#2C3E50", "#34495E", "#7F8C8D", "#95A5A6", "#BDC3C7"]
  },
  {
    albumId: "album-10",
    albumName: "一滴眼泪",
    colors: ["#1A5F7A", "#57C5B6", "#159895", "#002B5B", "#EA5455"]
  },
  {
    albumId: "album-20",
    albumName: "与我常在",
    colors: ["#F4A460", "#DEB887", "#D2691E", "#8B4513", "#CD853F"]
  },
  {
    albumId: "album-31",
    albumName: "酝酿",
    colors: ["#8B7355", "#D2B48C", "#BC8F8F", "#F5DEB3", "#DEB887"]
  },
  {
    albumId: "album-43",
    albumName: "我的快乐时代",
    colors: ["#FFD700", "#FFA500", "#FF8C00", "#FF6347", "#FF4500"]
  },
  {
    albumId: "album-57",
    albumName: "新生活",
    colors: ["#98D8C8", "#7FCDCD", "#5F9EA0", "#20B2AA", "#008B8B"]
  },
  {
    albumId: "album-65",
    albumName: "天佑爱人",
    colors: ["#4169E1", "#6495ED", "#87CEEB", "#00BFFF", "#1E90FF"]
  },
  {
    albumId: "album-77",
    albumName: "婚礼的祝福",
    colors: ["#E8B4B8", "#D4A5A5", "#C9A0A0", "#FFE4E1", "#FFC0CB"]
  },
  {
    albumId: "album-89",
    albumName: "幸福",
    colors: ["#FFB6C1", "#FF69B4", "#FF1493", "#DB7093", "#C71585"]
  },
  {
    albumId: "album-100",
    albumName: "天佑爱人（国语版）",
    colors: ["#4682B4", "#5F9EA0", "#6495ED", "#87CEEB", "#ADD8E6"]
  },
  {
    albumId: "album-110",
    albumName: "Nothing Really Matters",
    colors: ["#2F4F4F", "#696969", "#808080", "#A9A9A9", "#D3D3D3"]
  },
  {
    albumId: "album-120",
    albumName: "Hit 弹起来",
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
  },
  {
    albumId: "album-134",
    albumName: "Shall We Dance?Shall We Talk!",
    colors: ["#9B59B6", "#8E44AD", "#A569BD", "#BB8FCE", "#D7BDE2"]
  },
  {
    albumId: "album-148",
    albumName: "反正是我",
    colors: ["#E74C3C", "#C0392B", "#EC7063", "#F1948A", "#FADBD8"]
  },
  {
    albumId: "album-160",
    albumName: "The Line-Up",
    colors: ["#1ABC9C", "#16A085", "#2ECC71", "#27AE60", "#58D68D"]
  },
  {
    albumId: "album-175",
    albumName: "Special Thanks To...",
    colors: ["#3498DB", "#2980B9", "#5DADE2", "#85C1E9", "#AED6F1"]
  },
  {
    albumId: "album-189",
    albumName: "黑白灰",
    colors: ["#2C3E50", "#34495E", "#7F8C8D", "#95A5A6", "#BDC3C7"]
  },
  {
    albumId: "album-201",
    albumName: "Eason 4 A Change & Hits",
    colors: ["#F39C12", "#E67E22", "#F1C40F", "#D4AC0D", "#B7950B"]
  },
  {
    albumId: "album-216",
    albumName: "七",
    colors: ["#E74C3C", "#F39C12", "#F1C40F", "#2ECC71", "#3498DB", "#9B59B6", "#E91E63"]
  },
  {
    albumId: "album-229",
    albumName: "U87",
    colors: ["#1ABC9C", "#16A085", "#2ECC71", "#27AE60", "#58D68D"]
  },
  {
    albumId: "album-244",
    albumName: "怎么样",
    colors: ["#95A5A6", "#7F8C8D", "#BDC3C7", "#D5DBDB", "#EAEDED"]
  },
  {
    albumId: "album-257",
    albumName: "Life Continues",
    colors: ["#27AE60", "#2ECC71", "#58D68D", "#82E0AA", "#ABEBC6"]
  },
  {
    albumId: "album-271",
    albumName: "What's Going On..?",
    colors: ["#8E44AD", "#9B59B6", "#A569BD", "#BB8FCE", "#D7BDE2"]
  },
  {
    albumId: "album-284",
    albumName: "认了吧",
    colors: ["#E74C3C", "#C0392B", "#EC7063", "#F1948A", "#FADBD8"]
  },
  {
    albumId: "album-296",
    albumName: "聆听陈奕迅",
    colors: ["#3498DB", "#2980B9", "#5DADE2", "#85C1E9", "#AED6F1"]
  },
  {
    albumId: "album-310",
    albumName: "Solidays",
    colors: ["#F39C12", "#E67E22", "#F1C40F", "#D4AC0D", "#B7950B"]
  },
  {
    albumId: "album-322",
    albumName: "不想放手",
    colors: ["#1ABC9C", "#16A085", "#2ECC71", "#27AE60", "#58D68D"]
  },
  {
    albumId: "album-336",
    albumName: "H3M",
    colors: ["#34495E", "#2C3E50", "#5D6D7E", "#85929E", "#ABB2B9"]
  },
  {
    albumId: "album-349",
    albumName: "上五楼的快活",
    colors: ["#E91E63", "#C2185B", "#F06292", "#F48FB1", "#F8BBD9"]
  },
  {
    albumId: "album-367",
    albumName: "?",
    colors: ["#607D8B", "#455A64", "#78909C", "#90A4AE", "#B0BEC5"]
  },
  {
    albumId: "album-382",
    albumName: "...3mm",
    colors: ["#795548", "#6D4C41", "#8D6E63", "#A1887F", "#BCAAA4"]
  },
  {
    albumId: "album-397",
    albumName: "Stranger Under My Skin",
    colors: ["#9E9E9E", "#757575", "#BDBDBD", "#E0E0E0", "#EEEEEE"]
  },
  {
    albumId: "album-406",
    albumName: "《米 · 闪》(Rice&Shine)",
    colors: ["#FFD54F", "#FFC107", "#FFEB3B", "#FFF176", "#FFF59D"]
  },
  {
    albumId: "album-421",
    albumName: "Rice & Shine",
    colors: ["#FFD54F", "#FFC107", "#FFEB3B", "#FFF176", "#FFF59D"]
  },
  {
    albumId: "album-436",
    albumName: "C'mon in~",
    colors: ["#4CAF50", "#388E3C", "#66BB6A", "#81C784", "#A5D6A7"]
  },
  {
    albumId: "album-447",
    albumName: "L.O.V.E.",
    colors: ["#E91E63", "#F06292", "#F48FB1", "#F8BBD9", "#FCE4EC"]
  },
  {
    albumId: "album-465",
    albumName: "I Want...",
    colors: ["#3F51B5", "#303F9F", "#5C6BC0", "#7986CB", "#9FA8DA"]
  },
  {
    albumId: "album-467",
    albumName: "CHIN UP!",
    colors: ["#FF5722", "#E64A19", "#FF7043", "#FF8A65", "#FFAB91"]
  },
  {
    albumId: "album-478",
    albumName: "米.闪",
    colors: ["#FFD54F", "#FFC107", "#FFEB3B", "#FFF176", "#FFF59D"]
  },
  {
    albumId: "album-489",
    albumName: "Stranger Under My Skin",
    colors: ["#9E9E9E", "#757575", "#BDBDBD", "#E0E0E0", "#EEEEEE"]
  },
  {
    albumId: "album-500",
    albumName: "Fight as ONE",
    colors: ["#E74C3C", "#C0392B", "#EC7063", "#F1948A", "#FADBD8"]
  },
  {
    albumId: "album-510",
    albumName: "尘大",
    colors: ["#795548", "#6D4C41", "#8D6E63", "#A1887F", "#BCAAA4"]
  }
];

// 默认全局配色（彩虹色）
export const defaultColors: string[] = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#85C1E9', '#BB8FCE', '#F1948A',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
];

// 根据专辑ID获取配色
export function getAlbumColors(albumId: string): string[] {
  const album = albumColorSchemes.find(a => a.albumId === albumId);
  return album ? album.colors : defaultColors;
}
