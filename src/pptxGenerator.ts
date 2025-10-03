/**
 * PPTX 生成器 - 通用 JSX 渲染版本
 * 真正通用地將 TSX/JSX 轉換為 PowerPoint
 */

import PptxGenJS from 'pptxgenjs';
import { ParsedPresentation, PresentationMetadata } from './types';
import { parseTailwindClasses } from './styleMapper';
import * as fs from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { extractMetadata } from './tsxParser';

interface LayoutBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 生成 PPTX 文件 - 主入口
 */
export async function generatePptx(
  presentation: ParsedPresentation,
  outputPath: string,
  tsxFilePath: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // 直接從 TSX 文件解析並渲染
  const code = fs.readFileSync(tsxFilePath, 'utf-8');
  const slidesData = extractSlidesFromTsx(code);
  const metadata = extractMetadataFromTsx(code, tsxFilePath, presentation.metadata);

  slidesData.forEach((slideData) => {
    createSlideFromJsx(pptx, slideData, metadata);
  });

  await pptx.writeFile({ fileName: outputPath });
}

/**
 * 從 TSX 代碼中提取元數據
 */
function extractMetadataFromTsx(
  code: string,
  sourceFilePath?: string,
  parsedMetadata?: PresentationMetadata
): PresentationMetadata {
  const metadataFromCode = extractMetadata(code, sourceFilePath);
  if (!parsedMetadata) {
    return metadataFromCode;
  }

  const merged: PresentationMetadata = { ...metadataFromCode };
  (Object.keys(parsedMetadata) as (keyof PresentationMetadata)[]).forEach((key) => {
    if (!merged[key] && parsedMetadata[key]) {
      merged[key] = parsedMetadata[key];
    }
  });

  return merged;
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
        // 處理三種情況：
        // 1. 直接的 JSX 元素: content: (<div>...</div>)
        // 2. 箭頭函數返回 JSX: content: () => (<div>...</div>)
        // 3. 箭頭函數帶 return: content: () => { return (<div>...</div>) }

        if (t.isJSXElement(prop.value)) {
          // 情況 1: 直接的 JSX 元素
          slideData.jsxContent = prop.value;
        } else if (t.isArrowFunctionExpression(prop.value) || t.isFunctionExpression(prop.value)) {
          const body = prop.value.body;
          if (t.isJSXElement(body)) {
            // 情況 2: 箭頭函數直接返回 JSX
            slideData.jsxContent = body;
          } else if (t.isBlockStatement(body) && body.body.length > 0) {
            // 情況 3: 箭頭函數帶 return 語句
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

  let yPosition = 0.3;

  // 添加頁首
  addHeader(slide, metadata);
  yPosition += 0.5;

  // 添加標題
  slide.addText(slideData.title || '', {
    x: 0.5,
    y: yPosition,
    w: 9,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: '1F2937',
  });
  yPosition += 0.4;

  // 添加副標題
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: 0.2,
      fontSize: 12,
      color: '4B5563',
    });
    yPosition += 0.25;
  }

  // 添加藍色分隔線
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: yPosition,
    w: 9,
    h: 0.03,
    fill: { color: '2563EB' },
    line: { type: 'none' }
  });
  yPosition += 0.1;

  // 渲染 JSX 內容
  if (slideData.jsxContent) {
    const contentBox: LayoutBox = {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: 4.9 - yPosition
    };
    renderJsxElement(slide, slideData.jsxContent, contentBox, pptx);
  }
}

/**
 * 渲染 JSX 元素到 PowerPoint - 核心遞歸函數
 */
function renderJsxElement(slide: any, jsx: any, box: LayoutBox, pptx: any, depth: number = 0): void {
  if (!jsx || !t.isJSXElement(jsx)) return;

  const openingElement = jsx.openingElement;
  if (!t.isJSXIdentifier(openingElement.name)) return;

  const tagName = openingElement.name.name;

  // 提取 className
  let className = '';
  openingElement.attributes.forEach((attr: any) => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
      if (t.isStringLiteral(attr.value)) {
        className = attr.value.value;
      }
    }
  });

  const style = parseTailwindClasses(className);

  // 根據類名判斷元素類型和佈局
  if (className.includes('grid') && className.includes('grid-cols')) {
    renderGrid(slide, jsx, box, className, pptx);
  } else if ((className.includes('bg-') || className.includes('border')) &&
             (className.includes('rounded') || className.includes('p-'))) {
    // 這是一個容器/卡片
    renderContainer(slide, jsx, box, className, style, pptx);
  } else if (tagName === 'table') {
    renderTable(slide, jsx, box);
  } else {
    // 默認：渲染子元素
    renderChildren(slide, jsx, box, pptx);
  }
}

/**
 * 渲染 Grid 佈局
 */
function renderGrid(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any): void {
  let cols = 2;
  if (className.includes('grid-cols-1')) cols = 1;
  else if (className.includes('grid-cols-2')) cols = 2;
  else if (className.includes('grid-cols-3')) cols = 3;
  else if (className.includes('grid-cols-4')) cols = 4;
  else if (className.includes('grid-cols-5')) cols = 5;

  let gap = 0.15;
  if (className.includes('gap-1')) gap = 0.08;
  else if (className.includes('gap-2')) gap = 0.12;
  else if (className.includes('gap-3')) gap = 0.18;
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
}

/**
 * 渲染容器/卡片
 */
function renderContainer(slide: any, jsx: any, box: LayoutBox, className: string, style: any, pptx: any): void {
  // 繪製背景和邊框
  const shapeProps: any = {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fill: style.backgroundColor ? { color: style.backgroundColor } : undefined,
  };

  if (style.borderColor || className.includes('border')) {
    shapeProps.line = {
      color: style.borderColor || 'D1D5DB',
      width: style.borderWidth || 1
    };
  } else {
    shapeProps.line = { type: 'none' };
  }

  slide.addShape(pptx.ShapeType.rect, shapeProps);

  // 渲染內容（留出 padding）
  let padding = 0.1;
  if (className.includes('p-1')) padding = 0.05;
  else if (className.includes('p-2')) padding = 0.08;
  else if (className.includes('p-3')) padding = 0.12;
  else if (className.includes('p-4')) padding = 0.15;

  const contentBox: LayoutBox = {
    x: box.x + padding,
    y: box.y + padding,
    w: box.w - 2 * padding,
    h: box.h - 2 * padding
  };

  renderChildren(slide, jsx, contentBox, pptx);
}

/**
 * 渲染子元素
 */
function renderChildren(slide: any, jsx: any, box: LayoutBox, pptx: any): void {
  if (!jsx.children) return;

  // 檢查父容器是否有 space-y 類
  let spaceY = 0.08; // 默認間距
  if (jsx.openingElement) {
    const parentClassName = getClassName(jsx);
    if (parentClassName.includes('space-y-1')) spaceY = 0.05;
    else if (parentClassName.includes('space-y-2')) spaceY = 0.08;
    else if (parentClassName.includes('space-y-3')) spaceY = 0.12;
  }

  let currentY = box.y;
  const maxY = box.y + box.h;

  jsx.children.forEach((child: any, index: number) => {
    if (currentY >= maxY) return;

    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        const lineHeight = 0.18;
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
      const openingElement = child.openingElement;
      if (t.isJSXIdentifier(openingElement.name)) {
        const tagName = openingElement.name.name;
        const className = getClassName(child);
        const style = parseTailwindClasses(className);

        if (tagName === 'h3') {
          const text = extractText(child);
          const fontSize = style.fontSize || 18;
          const height = 0.3;
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
          // 處理 mb-3 等margin
          if (className.includes('mb-1')) currentY += 0.05;
          else if (className.includes('mb-2')) currentY += 0.08;
          else if (className.includes('mb-3')) currentY += 0.12;
        } else if (tagName === 'h4') {
          const text = extractText(child);
          const fontSize = style.fontSize || 14;
          const height = 0.25;
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
          currentY += height + (className.includes('mb-') ? 0.08 : 0.05);
        } else if (tagName === 'div') {
          // 遞歸處理 div
          const childHeight = Math.min(maxY - currentY, 0.8);
          const childBox: LayoutBox = {
            x: box.x,
            y: currentY,
            w: box.w,
            h: childHeight
          };
          renderJsxElement(slide, child, childBox, pptx, 1);
          currentY += spaceY;
        } else if (tagName === 'ul') {
          renderList(slide, child, box.x, currentY, box.w);
          currentY += 0.5;
        } else if (tagName === 'table') {
          renderTable(slide, child, { x: box.x, y: currentY, w: box.w, h: 1.2 });
          currentY += 1.3;
        } else {
          const text = extractText(child);
          if (text) {
            const fontSize = style.fontSize || 11;
            const lineHeight = fontSize / 72 + 0.08;
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
    }
  });
}

/**
 * 渲染列表
 */
function renderList(slide: any, listJsx: any, x: number, y: number, w: number): void {
  let currentY = y;

  listJsx.children.forEach((child: any) => {
    if (t.isJSXElement(child)) {
      const tagName = (child.openingElement.name as any).name;
      if (tagName === 'li') {
        const text = extractText(child);
        if (text) {
          slide.addText(text, {
            x: x,
            y: currentY,
            w: w,
            h: 0.18,
            fontSize: 10,
            color: '4B5563',
            valign: 'top'
          });
          currentY += 0.2;
        }
      }
    }
  });
}

/**
 * 渲染表格
 */
function renderTable(slide: any, tableJsx: any, box: LayoutBox): void {
  const rows: any[][] = [];

  tableJsx.children.forEach((child: any) => {
    if (t.isJSXElement(child)) {
      const tagName = (child.openingElement.name as any).name;

      if (tagName === 'thead' || tagName === 'tbody') {
        child.children.forEach((row: any) => {
          if (t.isJSXElement(row) && (row.openingElement.name as any).name === 'tr') {
            const rowData: any[] = [];
            row.children.forEach((cell: any) => {
              if (t.isJSXElement(cell)) {
                const cellTagName = (cell.openingElement.name as any).name;
                if (cellTagName === 'th' || cellTagName === 'td') {
                  const text = extractText(cell);

                  // 提取樣式
                  let className = '';
                  cell.openingElement.attributes.forEach((attr: any) => {
                    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
                      if (t.isStringLiteral(attr.value)) {
                        className = attr.value.value;
                      }
                    }
                  });

                  const style = parseTailwindClasses(className);

                  rowData.push({
                    text: text,
                    options: {
                      fill: style.backgroundColor || (cellTagName === 'th' ? 'F3F4F6' : 'FFFFFF'),
                      color: style.color || (cellTagName === 'th' ? '1F2937' : '4B5563'),
                      bold: cellTagName === 'th' || style.fontWeight === 'bold',
                      fontSize: 9,
                      align: style.textAlign || (className.includes('text-center') ? 'center' : 'left')
                    }
                  });
                }
              }
            });
            if (rowData.length > 0) {
              rows.push(rowData);
            }
          }
        });
      }
    }
  });

  if (rows.length > 0) {
    slide.addTable(rows, {
      x: box.x,
      y: box.y,
      w: box.w,
      border: { pt: 0.5, color: 'D1D5DB' },
      rowH: 0.25,
    });
  }
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
 * 提取元素中的所有文字
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
    fontSize: 15,
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
