/**
 * PPTX 生成器 - 精確版本
 * 完全匹配 TSX 顯示的佈局和樣式
 */

import PptxGenJS from 'pptxgenjs';
import { ParsedPresentation } from './types';
import { parseTailwindClasses } from './styleMapper';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface LayoutBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 生成 PPTX 文件
 */
export async function generatePptx(
  presentation: ParsedPresentation,
  outputPath: string,
  tsxFilePath: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const code = fs.readFileSync(tsxFilePath, 'utf-8');
  const slidesData = extractSlidesFromTsx(code);
  const metadata = extractMetadataFromTsx(code);

  slidesData.forEach((slideData) => {
    createSlideFromJsx(pptx, slideData, metadata);
  });

  await pptx.writeFile({ fileName: outputPath });
}

/**
 * 從 TSX 代碼中提取元數據
 */
function extractMetadataFromTsx(code: string): any {
  const metadata: any = {};

  if (code.includes('富鴻網 FDS')) {
    metadata.company = '富鴻網 FDS';
  }

  if (code.includes('AI機房市場研究報告')) {
    metadata.title = 'AI機房市場研究報告';
    metadata.subtitle = '臺灣市場分析';
    metadata.year = '2025年度';
  }

  return metadata;
}

/**
 * 從 TSX 代碼中提取投影片數據
 */
function extractSlidesFromTsx(code: string): any[] {
  const slidesData: any[] = [];

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    VariableDeclarator(path) {
      if (t.isIdentifier(path.node.id) && path.node.id.name === 'slides') {
        if (t.isArrayExpression(path.node.init)) {
          path.node.init.elements.forEach((element) => {
            if (t.isObjectExpression(element)) {
              const slideData = extractSlideData(element);
              if (slideData) {
                slidesData.push(slideData);
              }
            }
          });
        }
      }
    }
  });

  return slidesData;
}

/**
 * 提取單個投影片的數據
 */
function extractSlideData(objectExpr: t.ObjectExpression): any {
  const slideData: any = {};

  objectExpr.properties.forEach((prop) => {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name;

      if (key === 'title' && t.isStringLiteral(prop.value)) {
        slideData.title = prop.value.value;
      } else if (key === 'subtitle' && t.isStringLiteral(prop.value)) {
        slideData.subtitle = prop.value.value;
      } else if (key === 'content') {
        if (t.isJSXElement(prop.value)) {
          slideData.jsxContent = prop.value;
        } else if (t.isArrowFunctionExpression(prop.value) || t.isFunctionExpression(prop.value)) {
          const body = prop.value.body;
          if (t.isJSXElement(body)) {
            slideData.jsxContent = body;
          } else if (t.isBlockStatement(body) && body.body.length > 0) {
            const returnStmt = body.body.find(stmt => t.isReturnStatement(stmt));
            if (returnStmt && t.isReturnStatement(returnStmt) && returnStmt.argument) {
              if (t.isJSXElement(returnStmt.argument)) {
                slideData.jsxContent = returnStmt.argument;
              }
            }
          }
        }
      }
    }
  });

  return slideData;
}

/**
 * 從 JSX 創建投影片
 */
function createSlideFromJsx(pptx: PptxGenJS, slideData: any, metadata?: any): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  // 添加頁首
  addHeader(slide, metadata);

  // 添加標題區域
  const titleY = 0.85;
  slide.addText(slideData.title || '', {
    x: 0.5,
    y: titleY,
    w: 9,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: '1F2937',
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: titleY + 0.38,
      w: 9,
      h: 0.2,
      fontSize: 12,
      color: '4B5563',
    });
  }

  // 添加藍色分隔線
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: titleY + 0.6,
    w: 9,
    h: 0.03,
    fill: { color: '2563EB' },
    line: { type: 'none' }
  });

  // 渲染 JSX 內容 - 從分隔線下方開始，垂直居中
  if (slideData.jsxContent) {
    const contentStartY = titleY + 0.7;
    const availableHeight = 5.625 - contentStartY - 0.2; // 總高度 - 已用高度 - 底部邊距

    const contentBox: LayoutBox = {
      x: 0.5,
      y: contentStartY,
      w: 9,
      h: availableHeight
    };

    renderJsxElement(slide, slideData.jsxContent, contentBox, pptx);
  }
}

/**
 * 渲染 JSX 元素 - 核心函數
 */
function renderJsxElement(slide: any, jsx: any, box: LayoutBox, pptx: any, depth: number = 0): number {
  if (!jsx || !t.isJSXElement(jsx)) return 0;

  const className = getClassName(jsx);
  const openingElement = jsx.openingElement;

  if (!t.isJSXIdentifier(openingElement.name)) return 0;
  const tagName = openingElement.name.name;

  // 檢查是否有 justify-center (垂直居中)
  const hasJustifyCenter = className.includes('justify-center');

  // Grid 佈局
  if (className.includes('grid') && className.includes('grid-cols')) {
    return renderGrid(slide, jsx, box, className, pptx, hasJustifyCenter);
  }

  // 容器 (有背景色或邊框)
  if ((className.includes('bg-') || className.includes('border')) &&
      (className.includes('rounded') || className.includes('p-'))) {
    return renderContainer(slide, jsx, box, className, pptx);
  }

  // space-y 容器 (垂直堆疊子元素)
  if (className.includes('space-y')) {
    return renderVerticalStack(slide, jsx, box, className, pptx, hasJustifyCenter);
  }

  // 默認：渲染子元素
  return renderChildren(slide, jsx, box, pptx);
}

/**
 * 渲染 Grid 佈局
 */
function renderGrid(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any, centerVertically: boolean): number {
  let cols = 2;
  if (className.includes('grid-cols-1')) cols = 1;
  else if (className.includes('grid-cols-2')) cols = 2;
  else if (className.includes('grid-cols-3')) cols = 3;
  else if (className.includes('grid-cols-4')) cols = 4;
  else if (className.includes('grid-cols-5')) cols = 5;

  let gap = 0.2;
  if (className.includes('gap-1')) gap = 0.1;
  else if (className.includes('gap-2')) gap = 0.15;
  else if (className.includes('gap-3')) gap = 0.2;
  else if (className.includes('gap-4')) gap = 0.25;

  const children = jsx.children.filter((child: any) => t.isJSXElement(child));
  const rows = Math.ceil(children.length / cols);

  const cellWidth = (box.w - (cols - 1) * gap) / cols;
  const cellHeight = (box.h - (rows - 1) * gap) / rows;

  children.forEach((child: any, index: number) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    const cellBox: LayoutBox = {
      x: box.x + col * (cellWidth + gap),
      y: box.y + row * (cellHeight + gap),
      w: cellWidth,
      h: cellHeight
    };

    renderJsxElement(slide, child, cellBox, pptx, 1);
  });

  return box.h;
}

/**
 * 渲染容器
 */
function renderContainer(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any): number {
  const style = parseTailwindClasses(className);

  // 繪製背景
  const shapeProps: any = {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fill: style.backgroundColor ? { color: style.backgroundColor } : { color: 'FFFFFF' },
  };

  if (style.borderColor) {
    shapeProps.line = {
      color: style.borderColor,
      width: (style.borderWidth || 1) / 2
    };
  } else if (className.includes('border')) {
    shapeProps.line = { color: 'D1D5DB', width: 1 };
  } else {
    shapeProps.line = { type: 'none' };
  }

  slide.addShape(pptx.ShapeType.rect, shapeProps);

  // 計算 padding
  let padding = 0.15;
  if (className.includes('p-1')) padding = 0.08;
  else if (className.includes('p-2')) padding = 0.12;
  else if (className.includes('p-3')) padding = 0.18;
  else if (className.includes('p-4')) padding = 0.22;

  const contentBox: LayoutBox = {
    x: box.x + padding,
    y: box.y + padding,
    w: box.w - 2 * padding,
    h: box.h - 2 * padding
  };

  renderChildren(slide, jsx, contentBox, pptx);
  return box.h;
}

/**
 * 渲染垂直堆疊
 */
function renderVerticalStack(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any, centerVertically: boolean): number {
  let spaceY = 0.15;
  if (className.includes('space-y-1')) spaceY = 0.08;
  else if (className.includes('space-y-2')) spaceY = 0.12;
  else if (className.includes('space-y-3')) spaceY = 0.18;

  const children = jsx.children.filter((child: any) => t.isJSXElement(child));

  // 如果需要垂直居中，先計算總高度
  let startY = box.y;
  if (centerVertically) {
    // 簡單估算：每個子元素約佔 box.h / children.length
    const estimatedTotalHeight = children.length * (box.h / children.length);
    startY = box.y + (box.h - estimatedTotalHeight) / 2;
  }

  let currentY = startY;

  children.forEach((child: any, index: number) => {
    const childBox: LayoutBox = {
      x: box.x,
      y: currentY,
      w: box.w,
      h: (box.h - (children.length - 1) * spaceY) / children.length
    };

    const usedHeight = renderJsxElement(slide, child, childBox, pptx, 1);
    currentY += (usedHeight > 0 ? usedHeight : childBox.h) + spaceY;
  });

  return currentY - box.y;
}

/**
 * 渲染子元素
 */
function renderChildren(slide: any, jsx: any, box: LayoutBox, pptx: any): number {
  if (!jsx.children) return 0;

  let currentY = box.y;
  const maxY = box.y + box.h;

  jsx.children.forEach((child: any) => {
    if (currentY >= maxY) return;

    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        const lineHeight = 0.2;
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: lineHeight,
          fontSize: 11,
          color: '1F2937',
          valign: 'top'
        });
        currentY += lineHeight;
      }
    } else if (t.isJSXElement(child)) {
      const className = getClassName(child);
      const style = parseTailwindClasses(className);
      const tagName = (child.openingElement.name as any).name;

      if (tagName === 'h3') {
        const text = extractText(child);
        const fontSize = style.fontSize || 18;
        const height = 0.35;

        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: height,
          fontSize: fontSize,
          bold: true,
          color: style.color || '1F2937',
          align: style.textAlign || 'left',
          valign: 'top'
        });

        currentY += height;
        if (className.includes('mb-3')) currentY += 0.15;
        else if (className.includes('mb-2')) currentY += 0.1;
        else if (className.includes('mb-1')) currentY += 0.05;

      } else if (tagName === 'div') {
        const childBox: LayoutBox = {
          x: box.x,
          y: currentY,
          w: box.w,
          h: maxY - currentY
        };
        const used = renderJsxElement(slide, child, childBox, pptx, 1);
        currentY += used > 0 ? used : 0.3;
      } else {
        const text = extractText(child);
        if (text) {
          const fontSize = style.fontSize || 11;
          const lineHeight = 0.22;

          slide.addText(text, {
            x: box.x,
            y: currentY,
            w: box.w,
            h: lineHeight,
            fontSize: fontSize,
            bold: style.fontWeight === 'bold',
            color: style.color || '1F2937',
            align: style.textAlign || 'left',
            valign: 'top'
          });
          currentY += lineHeight;
        }
      }
    }
  });

  return currentY - box.y;
}

/**
 * 獲取元素的 className
 */
function getClassName(jsx: any): string {
  if (!jsx || !jsx.openingElement) return '';

  let className = '';
  jsx.openingElement.attributes.forEach((attr: any) => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
      if (t.isStringLiteral(attr.value)) {
        className = attr.value.value;
      }
    }
  });

  return className;
}

/**
 * 提取文字
 */
function extractText(jsx: any): string {
  if (!jsx) return '';

  if (t.isJSXText(jsx)) {
    return jsx.value.trim().replace(/\s+/g, ' ');
  }

  if (t.isJSXElement(jsx)) {
    let text = '';
    jsx.children?.forEach((child: any) => {
      const childText = extractText(child);
      if (childText) {
        text += childText + ' ';
      }
    });
    return text.trim();
  }

  if (t.isJSXExpressionContainer(jsx)) {
    if (t.isStringLiteral(jsx.expression)) {
      return jsx.expression.value;
    }
  }

  return '';
}

/**
 * 添加頁首
 */
function addHeader(slide: any, metadata: any): void {
  slide.addText(metadata?.company || '富鴻網 FDS', {
    x: 0.5,
    y: 0.25,
    w: 5,
    h: 0.25,
    fontSize: 14,
    bold: true,
    color: '2563EB',
  });

  if (metadata?.title) {
    slide.addText(metadata.title, {
      x: 0.5,
      y: 0.48,
      w: 5,
      h: 0.15,
      fontSize: 9,
      color: '4B5563',
    });
  }

  if (metadata?.subtitle && metadata?.year) {
    slide.addText(`${metadata.subtitle}\n${metadata.year}`, {
      x: 7.5,
      y: 0.25,
      w: 2,
      h: 0.35,
      fontSize: 9,
      color: '4B5563',
      align: 'right',
    });
  }

  slide.addShape(slide.ShapeType?.rect || 'rect', {
    x: 0.5,
    y: 0.7,
    w: 9,
    h: 0.015,
    fill: { color: 'E5E7EB' },
    line: { type: 'none' }
  });
}
