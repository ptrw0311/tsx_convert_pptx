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
  gradient?: {
    from?: string;
    to?: string;
    angle?: number;
  };
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  margin?: number;
  marginBottom?: number;
  marginTop?: number;
  textAlign?: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
  gap?: number;
  flexDirection?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end';
  justifyContent?: 'start' | 'center' | 'end' | 'between';
  shadow?: boolean;
  lineHeight?: number;
}

export interface PresentationMetadata {
  title?: string;
  subtitle?: string;
  company?: string;
  department?: string;
  date?: string;
  year?: string;
  presenter?: string;
}

export interface ParsedPresentation {
  slides: SlideData[];
  metadata?: PresentationMetadata;
}

export interface TailwindClassMapping {
  [key: string]: Partial<ElementStyle>;
}
