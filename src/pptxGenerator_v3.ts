/**
 * PPTX 生成器 - V3 簡化版
 * 專注於正確渲染所有文字內容
 */

import PptxGenJS from 'pptxgenjs';
import { ParsedPresentation, PresentationMetadata } from './types';
import { parseTailwindClasses } from './styleMapper';
import * as fs from 'fs';
import * as path from 'path';
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

interface RenderResult {
  usedHeight: number;
}

export async function generatePptx(
  presentation: ParsedPresentation,
  outputPath: string,
  tsxFilePath: string
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const code = fs.readFileSync(tsxFilePath, 'utf-8');
  const slidesData = extractSlidesFromTsx(code);
  const metadata = prepareMetadata(code, slidesData, tsxFilePath, presentation.metadata);

  slidesData.forEach((slideData) => {
    createSlideFromJsx(pptx, slideData, metadata);
  });

  await pptx.writeFile({ fileName: outputPath });
}

function prepareMetadata(
  code: string,
  slidesData: any[],
  tsxFilePath: string,
  parsedMetadata?: PresentationMetadata
): PresentationMetadata {
  const metadataFromCode = extractMetadata(code, tsxFilePath);
  const merged: PresentationMetadata = { ...metadataFromCode };

  if (parsedMetadata) {
    (Object.keys(parsedMetadata) as (keyof PresentationMetadata)[]).forEach((key) => {
      if (!merged[key] && parsedMetadata[key]) {
        merged[key] = parsedMetadata[key];
      }
    });
  }

  const firstSlide = slidesData[0];
  if (firstSlide) {
    if (!merged.title && firstSlide.title) {
      merged.title = firstSlide.title;
    }
    if (!merged.subtitle && firstSlide.subtitle) {
      merged.subtitle = firstSlide.subtitle;
    }
  }

  if (!merged.company) {
    merged.company = deriveNameFromFile(tsxFilePath);
  }

  return merged;
}

function deriveNameFromFile(filePath: string): string | undefined {
  if (!filePath) return undefined;
  const baseName = path.basename(filePath, path.extname(filePath));
  if (!baseName) return undefined;

  return baseName
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(.)/g, (char) => char.toUpperCase());
}

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

function createSlideFromJsx(pptx: PptxGenJS, slideData: any, metadata?: PresentationMetadata): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  const headerInfo = addHeader(slide, metadata, slideData);

  let currentY = headerInfo.nextY;

  if (slideData.title) {
    slide.addText(slideData.title, {
      x: 0.5,
      y: currentY,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: '1F2937',
    });
    currentY += 0.42;
  }

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: currentY,
      w: 9,
      h: 0.25,
      fontSize: 12,
      color: '4B5563',
    });
    currentY += 0.28;
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: currentY,
    w: 9,
    h: 0.03,
    fill: { color: '2563EB' },
    line: { type: 'none' }
  });
  currentY += 0.12;

  if (slideData.jsxContent) {
    const contentBox: LayoutBox = {
      x: 0.5,
      y: currentY,
      w: 9,
      h: Math.max(0.5, 5.625 - currentY - 0.2)
    };

    renderJsx(slide, slideData.jsxContent, contentBox, pptx);
  }
}

/**
 * 渲染 JSX - 遞歸渲染所有元素和文字
 */
function renderJsx(slide: any, jsx: any, box: LayoutBox, pptx: any): void {
  if (!jsx || !t.isJSXElement(jsx)) return;

  const className = getClassName(jsx);

  // Grid 佈局 - 最優先
  if (className.includes('grid') && className.includes('grid-cols')) {
    renderGrid(slide, jsx, box, className, pptx);
    return;
  }

  // 帶背景的容器
  if (hasVisibleBackground(className)) {
    renderBox(slide, jsx, box, className, pptx);
    return;
  }

  // space-y 垂直堆疊
  if (className.includes('space-y')) {
    renderVerticalStack(slide, jsx, box, className, pptx);
    return;
  }

  // 默認：遞歸處理所有子元素
  renderAllChildren(slide, jsx, box, pptx);
}

/**
 * 渲染 Grid
 */
function renderGrid(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any): void {
  let cols = 2;
  if (className.includes('grid-cols-3')) cols = 3;
  else if (className.includes('grid-cols-4')) cols = 4;
  else if (className.includes('grid-cols-5')) cols = 5;

  let gap = 0.2;
  if (className.includes('gap-2')) gap = 0.15;
  else if (className.includes('gap-3')) gap = 0.2;
  else if (className.includes('gap-4')) gap = 0.25;

  const children = jsx.children.filter((c: any) => t.isJSXElement(c));
  const rows = Math.ceil(children.length / cols);

  const cellW = (box.w - (cols - 1) * gap) / cols;
  const cellH = (box.h - (rows - 1) * gap) / rows;

  children.forEach((child: any, idx: number) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;

    const cellBox: LayoutBox = {
      x: box.x + col * (cellW + gap),
      y: box.y + row * (cellH + gap),
      w: cellW,
      h: cellH
    };

    renderJsx(slide, child, cellBox, pptx);
  });
}

/**
 * 渲染帶背景的容器
 */
function renderBox(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any): void {
  const style = parseTailwindClasses(className);

  // 繪製背景
  slide.addShape(pptx.ShapeType.rect, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fill: { color: style.backgroundColor || 'FFFFFF' },
    line: style.borderColor ?
      { color: style.borderColor, width: (style.borderWidth || 1) / 2 } :
      (className.includes('border') ? { color: 'D1D5DB', width: 1 } : { type: 'none' })
  });

  // 內容區（減去 padding）
  let pad = 0.15;
  if (className.includes('p-2')) pad = 0.12;
  else if (className.includes('p-3')) pad = 0.18;

  const contentBox: LayoutBox = {
    x: box.x + pad,
    y: box.y + pad,
    w: box.w - 2 * pad,
    h: box.h - 2 * pad
  };

  renderAllChildren(slide, jsx, contentBox, pptx);
}

/**
 * 渲染垂直堆疊
 */
function renderVerticalStack(slide: any, jsx: any, box: LayoutBox, className: string, pptx: any): void {
  let gap = 0.12;
  if (className.includes('space-y-1')) gap = 0.08;
  else if (className.includes('space-y-2')) gap = 0.12;
  else if (className.includes('space-y-3')) gap = 0.18;

  const children = jsx.children.filter((c: any) => t.isJSXElement(c));
  if (children.length === 0) return;

  const childH = (box.h - gap * (children.length - 1)) / children.length;
  let currentY = box.y;

  children.forEach((child: any) => {
    const childBox: LayoutBox = {
      x: box.x,
      y: currentY,
      w: box.w,
      h: childH
    };

    renderJsx(slide, child, childBox, pptx);
    currentY += childH + gap;
  });
}

/**
 * 渲染所有子元素（包括文字）
 */
function renderAllChildren(slide: any, jsx: any, box: LayoutBox, pptx: any): void {
  if (!jsx.children) return;

  let currentY = box.y;
  const maxY = box.y + box.h;

  jsx.children.forEach((child: any) => {
    if (currentY >= maxY) return;

    // 文字節點
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: 0.18,
          fontSize: 10,
          color: '374151',
          valign: 'top'
        });
        currentY += 0.18;
      }
      return;
    }

    // JSX 元素
    if (t.isJSXElement(child)) {
      const tagName = (child.openingElement.name as any).name;
      const className = getClassName(child);
      const style = parseTailwindClasses(className);

      // h3/h4 標題
      if (tagName === 'h3' || tagName === 'h4') {
        const text = extractText(child);
        const fontSize = style.fontSize || (tagName === 'h3' ? 16 : 13);
        const height = tagName === 'h3' ? 0.3 : 0.25;

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
        if (className.includes('mb-2')) currentY += 0.08;
        return;
      }

      // div 元素
      if (tagName === 'div') {
        // 如果是帶背景或 grid 或 space-y，遞歸處理
        if (hasVisibleBackground(className) ||
            className.includes('grid') ||
            className.includes('space-y')) {
          const childBox: LayoutBox = {
            x: box.x,
            y: currentY,
            w: box.w,
            h: maxY - currentY
          };
          renderJsx(slide, child, childBox, pptx);
          currentY = maxY; // 用完所有空間
        } else {
          // 普通 div，只提取文字
          const text = extractText(child);
          if (text) {
            const fontSize = style.fontSize || 10;
            slide.addText(text, {
              x: box.x,
              y: currentY,
              w: box.w,
              h: 0.2,
              fontSize: fontSize,
              bold: style.fontWeight === 'bold',
              color: style.color || '374151',
              align: style.textAlign || 'left',
              valign: 'top'
            });
            currentY += 0.2;
          }
        }
        return;
      }

      // 其他元素（提取文字）
      const text = extractText(child);
      if (text) {
        const fontSize = style.fontSize || 10;
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: 0.18,
          fontSize: fontSize,
          bold: style.fontWeight === 'bold',
          color: style.color || '374151',
          valign: 'top'
        });
        currentY += 0.18;
      }
    }
  });
}

function hasVisibleBackground(className: string): boolean {
  return (className.includes('bg-') && !className.includes('bg-gradient-to')) ||
         className.includes('border-') ||
         className.includes('rounded');
}

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

function addHeader(
  slide: any,
  metadata: PresentationMetadata | undefined,
  slideData: any
): { hasHeader: boolean; nextY: number } {
  const defaultNextY = 0.6;
  if (!metadata) {
    return { hasHeader: false, nextY: defaultNextY };
  }

  let leftCursorY = 0.25;
  let lastLeftBaseline = leftCursorY;
  let hasHeaderContent = false;

  if (metadata.company) {
    slide.addText(metadata.company, {
      x: 0.5,
      y: leftCursorY,
      w: 5,
      h: 0.25,
      fontSize: 14,
      bold: true,
      color: '2563EB',
    });
    hasHeaderContent = true;
    lastLeftBaseline = leftCursorY + 0.28;
    leftCursorY = lastLeftBaseline;
  }

  const reportTitle = metadata.title && metadata.title !== slideData?.title ? metadata.title : undefined;
  if (reportTitle) {
    slide.addText(reportTitle, {
      x: 0.5,
      y: leftCursorY,
      w: 5,
      h: 0.2,
      fontSize: 10,
      color: '4B5563',
    });
    hasHeaderContent = true;
    lastLeftBaseline = leftCursorY + 0.22;
    leftCursorY = lastLeftBaseline;
  }

  const rightLines: string[] = [];
  if (metadata.subtitle && metadata.subtitle !== slideData?.subtitle) {
    rightLines.push(metadata.subtitle);
  }
  if (metadata.department) {
    rightLines.push(metadata.department);
  }
  if (metadata.presenter) {
    rightLines.push(metadata.presenter);
  }
  if (metadata.year) {
    rightLines.push(metadata.year);
  }
  if (metadata.date) {
    rightLines.push(metadata.date);
  }

  if (rightLines.length > 0) {
    slide.addText(rightLines.join('\n'), {
      x: 7.3,
      y: 0.25,
      w: 2.2,
      h: 0.4,
      fontSize: 9,
      color: '4B5563',
      align: 'right',
    });
    hasHeaderContent = true;
  }

  if (!hasHeaderContent) {
    return { hasHeader: false, nextY: defaultNextY };
  }

  const lineY = Math.max(lastLeftBaseline + 0.08, 0.68);
  slide.addShape(slide.ShapeType?.rect || 'rect', {
    x: 0.5,
    y: lineY,
    w: 9,
    h: 0.015,
    fill: { color: 'E5E7EB' },
    line: { type: 'none' }
  });

  return { hasHeader: true, nextY: lineY + 0.15 };
}
