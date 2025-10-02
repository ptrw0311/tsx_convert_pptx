/**
 * 投影片數據類型定義
 */

export interface SlideData {
  title: string;
  subtitle?: string;
  content: ContentElement[];
}

export interface ContentElement {
  type: 'div' | 'text' | 'grid' | 'card' | 'list' | 'table';
  className?: string;
  text?: string;
  children?: ContentElement[];
  style?: ElementStyle;
  gridCols?: number;
  items?: ContentElement[];
}

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ParsedPresentation {
  slides: SlideData[];
  metadata?: {
    title?: string;
    company?: string;
    date?: string;
  };
}

export interface TailwindClassMapping {
  [key: string]: Partial<ElementStyle>;
}
