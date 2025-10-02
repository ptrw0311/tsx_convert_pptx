# TSX to PPTX Converter

一個強大的工具，可以將 React TSX 投影片組件自動轉換為 PowerPoint (PPTX) 格式，完整保留原始樣式、顏色、字體和佈局。

## ✨ 功能特性

- 🎯 **自動解析** - 智能解析 React TSX 組件結構
- 🎨 **樣式保留** - 完整轉換 Tailwind CSS 樣式到 PowerPoint 格式
- 📊 **佈局還原** - 精確重現原始投影片的佈局和排版
- 🌈 **色彩映射** - 自動轉換 Tailwind 顏色到十六進制色碼
- 📐 **16:9 比例** - 生成標準 PowerPoint 寬屏格式
- 🔄 **通用適配** - 支持各種 TSX 投影片結構

## 📦 安裝

### 1. 克隆或下載此項目

```bash
cd tsx_convert_pptx
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 編譯 TypeScript

```bash
npm run build
```

## 🚀 使用方法

### 基本用法

```bash
npm run convert <input.tsx> [output.pptx]
```

### 參數說明

- `<input.tsx>` - **必填**：輸入的 TSX 投影片文件路徑
- `[output.pptx]` - **可選**：輸出的 PPTX 文件路徑（默認與輸入文件同名）

### 使用範例

```bash
# 轉換投影片，輸出到默認位置
npm run convert ./slides/presentation.tsx

# 指定輸出路徑
npm run convert ./slides/presentation.tsx ./output/result.pptx

# 轉換當前目錄下的文件
npm run convert project_dept_summary.tsx
```

## 📋 支持的 TSX 結構

本工具支持標準的 React 投影片組件結構：

```tsx
const slides = [
  {
    title: "投影片標題",
    subtitle: "副標題",
    content: (
      <div className="space-y-3">
        {/* 投影片內容 */}
      </div>
    )
  },
  // 更多投影片...
];
```

## 🎨 支持的樣式

### Tailwind CSS 類名

工具會自動轉換以下 Tailwind CSS 類名：

#### 顏色
- 背景色：`bg-red-50`, `bg-blue-600`, `bg-gray-100` 等
- 文字色：`text-red-700`, `text-blue-600`, `text-gray-800` 等

#### 字體
- 大小：`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- 粗細：`font-bold`, `font-semibold`

#### 佈局
- Grid：`grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-5`
- 間距：`gap-1`, `gap-2`, `gap-3`
- 內距：`p-2`, `p-3`, `p-4`

#### 邊框
- 顏色：`border-red-500`, `border-blue-600` 等
- 寬度：`border-2`, `border-4`, `border-l-4`
- 圓角：`rounded`, `rounded-lg`, `rounded-xl`

#### 對齊
- 文字對齊：`text-left`, `text-center`, `text-right`

## 📁 項目結構

```
tsx_convert_pptx/
├── src/
│   ├── index.ts          # 主程序入口
│   ├── tsxParser.ts      # TSX 文件解析器
│   ├── pptxGenerator.ts  # PowerPoint 生成器
│   ├── styleMapper.ts    # 樣式映射系統
│   └── types.ts          # TypeScript 類型定義
├── package.json          # 項目配置
├── tsconfig.json         # TypeScript 配置
└── README.md            # 使用說明（本文件）
```

## 🔧 開發

### 開發模式運行

```bash
npm run dev
```

### 編譯項目

```bash
npm run build
```

### 運行編譯後的程序

```bash
npm start <input.tsx> [output.pptx]
```

## 📝 轉換示例

假設您有一個 TSX 投影片文件 `presentation.tsx`：

```tsx
const slides = [
  {
    title: "Q1 業績報告",
    subtitle: "2025年第一季度",
    content: (
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded">
          <h3 className="text-xl font-bold text-blue-700">
            營收成長 25%
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border-2 p-3">
            <div className="text-2xl font-bold">$100M</div>
            <div className="text-sm text-gray-600">總營收</div>
          </div>
          {/* 更多卡片... */}
        </div>
      </div>
    )
  }
];
```

執行轉換：

```bash
npm run convert presentation.tsx
```

將生成一個包含相同內容、樣式和佈局的 `presentation.pptx` 文件。

## ⚙️ 進階配置

### 自定義樣式映射

您可以在 [src/styleMapper.ts](src/styleMapper.ts) 中添加更多顏色或樣式映射：

```typescript
const colorMap: { [key: string]: string } = {
  // 添加自定義顏色
  'custom-blue': '0066CC',
  'custom-red': 'CC0000',
  // ...更多顏色
};
```

### 擴展投影片模板

在 [src/pptxGenerator.ts](src/pptxGenerator.ts) 中可以添加新的投影片渲染邏輯：

```typescript
function renderSlide(slide: any, slideData: SlideData, startY: number) {
  // 自定義渲染邏輯
}
```

## 🐛 常見問題

### Q: 轉換後的 PowerPoint 樣式不完全一致？

A: 確保 TSX 文件使用支持的 Tailwind CSS 類名。某些複雜的 CSS 樣式可能需要手動調整映射規則。

### Q: 支持其他 CSS 框架嗎？

A: 目前主要支持 Tailwind CSS。如需支持其他框架，可以在 `styleMapper.ts` 中添加相應的映射規則。

### Q: 可以轉換圖片嗎？

A: 當前版本主要支持文字和基礎圖形。圖片支持將在未來版本中添加。

### Q: 如何處理中文字體？

A: PowerPoint 會自動使用系統默認的中文字體（通常是微軟雅黑或新細明體）。您可以在生成後手動調整字體。

## 📄 許可證

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📧 聯繫方式

如有問題或建議，請通過 GitHub Issues 聯繫。

---

**注意**：本工具專為 React TSX 投影片組件設計。對於其他類型的 React 組件，可能需要額外的配置或修改。
