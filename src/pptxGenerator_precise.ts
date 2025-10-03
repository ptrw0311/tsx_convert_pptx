/**
 * PPTX 生成器 - 精確版本
 * 完全匹配 TSX 顯示的佈局和樣式
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
  sourceFilePath: string,
  parsedMetadata?: PresentationMetadata
): PresentationMetadata {
  const metadataFromCode = extractMetadata(code, sourceFilePath);
  const merged: PresentationMetadata = { ...metadataFromCode };

  if (parsedMetadata) {
    (Object.keys(parsedMetadata) as (keyof PresentationMetadata)[]).forEach((key) => {
      if (!merged[key] && parsedMetadata[key]) {
        merged[key] = parsedMetadata[key];
      }
    });
  }

  if (!merged.company) {
    merged.company = deriveNameFromFile(sourceFilePath);
  }

  return merged;
}

function deriveNameFromFile(filePath: string): string | undefined {
  const baseName = path.basename(filePath, path.extname(filePath));
  if (!baseName) return undefined;
  return baseName
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(.)/g, (char) => char.toUpperCase());
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
function createSlideFromJsx(pptx: PptxGenJS, slideData: any, metadata?: PresentationMetadata): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  const headerInfo = addHeader(slide, metadata, slideData);
  let cursorY = headerInfo.nextY;

  if (slideData.title) {
    slide.addText(slideData.title, {
      x: 0.5,
      y: cursorY,
      w: 9,
      h: 0.4,
      fontSize: 20,
      bold: true,
      color: '1F2937',
    });
    cursorY += 0.42;
  }

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: cursorY,
      w: 9,
      h: 0.25,
      fontSize: 12,
      color: '4B5563',
    });
    cursorY += 0.28;
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: cursorY,
    w: 9,
    h: 0.03,
    fill: { color: '2563EB' },
    line: { type: 'none' }
  });
  cursorY += 0.12;

  if (slideData.jsxContent) {
    const contentBox: LayoutBox = {
      x: 0.5,
      y: cursorY,
      w: 9,
      h: Math.max(0.5, 5.625 - cursorY - 0.2)
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
  const style = parseTailwindClasses(className);
  const openingElement = jsx.openingElement;

  if (!t.isJSXIdentifier(openingElement.name)) return 0;
  const tagName = openingElement.name.name;

  const hasJustifyCenter = className.includes('justify-center');

  if (/^[A-Z]/.test(tagName)) {
    return renderIconComponent(slide, tagName, box, style);
  }

  if (tagName === 'br') {
    return 0.12;
  }

  if ((className.includes('bg-') || style.gradient) && (className.includes('rounded') || className.includes('p-') || className.includes('border'))) {
    return renderContainer(slide, jsx, box, className, style, pptx);
  }

  if (className.includes('grid') && className.includes('grid-cols')) {
    return renderGrid(slide, jsx, box, className, style, pptx, hasJustifyCenter);
  }

  if (className.includes('flex')) {
    return renderFlex(slide, jsx, box, className, style, pptx);
  }

  if (className.includes('space-y')) {
    return renderVerticalStack(slide, jsx, box, className, style, pptx, hasJustifyCenter);
  }

  if (style.width && style.height && !jsx.children?.some((child: any) => !isWhitespaceText(child))) {
    return renderShapeBlock(slide, box, style, pptx);
  }

  if (tagName === 'ul') {
    return renderList(slide, jsx, box, style);
  }

  if (tagName === 'table') {
    return renderTable(slide, jsx, box);
  }

  return renderChildren(slide, jsx, box, style, pptx);
}

/**
 * 渲染 Grid 佈局
 */
function renderGrid(
  slide: any,
  jsx: any,
  box: LayoutBox,
  className: string,
  style: ReturnType<typeof parseTailwindClasses>,
  pptx: any,
  centerVertically: boolean
): number {
  let cols = 2;
  if (className.includes('grid-cols-1')) cols = 1;
  else if (className.includes('grid-cols-2')) cols = 2;
  else if (className.includes('grid-cols-3')) cols = 3;
  else if (className.includes('grid-cols-4')) cols = 4;
  else if (className.includes('grid-cols-5')) cols = 5;

  const gap = style.gap ?? 0.18;
  const children = jsx.children.filter((child: any) => t.isJSXElement(child));
  const rows = Math.max(1, Math.ceil(children.length / cols));

  const cellWidth = (box.w - Math.max(0, cols - 1) * gap) / cols;
  const cellHeight = (box.h - Math.max(0, rows - 1) * gap) / rows;

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
function renderContainer(
  slide: any,
  jsx: any,
  box: LayoutBox,
  className: string,
  style: ReturnType<typeof parseTailwindClasses>,
  pptx: any
): number {
  const shapeOptions: any = {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    line: style.borderColor
      ? { color: style.borderColor, width: Math.max(0.25, (style.borderWidth || 1) / 2) }
      : className.includes('border')
        ? { color: 'D1D5DB', width: 0.75 }
        : { type: 'none' },
    fill: style.gradient
      ? {
          type: 'linear',
          angle: style.gradient.angle ?? 315,
          stops: [
            { position: 0, color: style.gradient.from || style.backgroundColor || 'FFFFFF' },
            { position: 1, color: style.gradient.to || style.backgroundColor || 'FFFFFF' }
          ]
        }
      : { color: style.backgroundColor || 'FFFFFF' },
  };

  const shapeType = style.borderRadius && style.borderRadius > 6 ? pptx.ShapeType.roundRect : pptx.ShapeType.rect;
  if (style.borderRadius && style.borderRadius > 6) {
    shapeOptions.rectRadius = Math.min(0.4, style.borderRadius / 20);
  }

  if (style.shadow) {
    shapeOptions.shadow = {
      type: 'outer',
      blur: 6,
      offset: 0.05,
      angle: 90,
      color: '666666',
      opacity: 30
    };
  }

  slide.addShape(shapeType, shapeOptions);

  const paddingX = style.paddingX ?? style.padding ?? 0.18;
  const paddingY = style.paddingY ?? style.padding ?? 0.18;

  const contentBox: LayoutBox = {
    x: box.x + paddingX,
    y: box.y + paddingY,
    w: box.w - 2 * paddingX,
    h: box.h - 2 * paddingY
  };

  renderChildren(slide, jsx, contentBox, style, pptx);
  return box.h;
}

/**
 * 渲染垂直堆疊
 */
function renderVerticalStack(
  slide: any,
  jsx: any,
  box: LayoutBox,
  className: string,
  style: ReturnType<typeof parseTailwindClasses>,
  pptx: any,
  centerVertically: boolean
): number {
  const children = jsx.children.filter((child: any) => isRenderableChild(child));
  if (children.length === 0) return 0;

  const gap = style.gap ?? 0.16;
  let totalEstimated = 0;
  const estimates: number[] = [];

  children.forEach((child: any) => {
    const estimate = estimateElementHeight(child, box.w, style);
    estimates.push(estimate);
    totalEstimated += estimate;
  });

  const totalGap = Math.max(0, children.length - 1) * gap;
  let scale = 1;
  if (totalEstimated + totalGap > box.h) {
    scale = (box.h - totalGap) / Math.max(totalEstimated, 0.1);
  }

  let startY = box.y;
  if (centerVertically && scale >= 1) {
    const consumed = totalEstimated + totalGap;
    if (consumed < box.h) {
      startY = box.y + (box.h - consumed) / 2;
    }
  }

  let currentY = startY;
  let maxY = box.y;

  children.forEach((child: any, index: number) => {
    const targetHeight = Math.max(0.2, estimates[index] * scale);

    if (t.isJSXText(child)) {
      const text = normalizeText(child.value);
      if (text) {
        const fontSize = style.fontSize || 12;
        const height = estimateTextHeight(text, fontSize, box.w, style.lineHeight);
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: height,
          fontSize,
          color: style.color || '1F2937',
          valign: 'top'
        });
        currentY += height;
        maxY = Math.max(maxY, currentY);
      }
    } else {
      const childBox: LayoutBox = {
        x: box.x,
        y: currentY,
        w: box.w,
        h: targetHeight
      };

      const used = renderJsxElement(slide, child, childBox, pptx, 1);
      const delta = Math.max(used, targetHeight);
      currentY += delta;
      maxY = Math.max(maxY, currentY);
    }

    if (index < children.length - 1) {
      currentY += gap;
      maxY += gap;
    }
  });

  return Math.max(0, maxY - box.y);
}

/**
 * 渲染子元素
 */
function renderChildren(
  slide: any,
  jsx: any,
  box: LayoutBox,
  parentStyle: ReturnType<typeof parseTailwindClasses>,
  pptx: any
): number {
  if (!jsx.children) return 0;

  const nodes = jsx.children.filter((child: any) => !isWhitespaceText(child));
  if (nodes.length === 0) return 0;

  let currentY = box.y;
  const maxY = box.y + box.h;
  let consumed = 0;

  nodes.forEach((child: any, index: number) => {
    if (currentY >= maxY) return;

    if (t.isJSXText(child)) {
      const text = normalizeText(child.value);
      if (!text) return;

      const fontSize = parentStyle.fontSize || 12;
      const color = parentStyle.color || '1F2937';
      const height = Math.min(
        maxY - currentY,
        Math.max(parentStyle.lineHeight || computeLineHeight(fontSize), estimateTextHeight(text, fontSize, box.w))
      );

      slide.addText(text, {
        x: box.x,
        y: currentY,
        w: box.w,
        h: height,
        fontSize,
        color,
        align: parentStyle.textAlign || 'left',
        valign: 'top'
      });

      currentY += height;
      consumed += height;
      if (parentStyle.marginBottom) {
        currentY += parentStyle.marginBottom;
        consumed += parentStyle.marginBottom;
      }
      return;
    }

    if (t.isJSXElement(child)) {
      const className = getClassName(child);
      const childStyle = parseTailwindClasses(className);
      const tagName = t.isJSXIdentifier(child.openingElement.name)
        ? child.openingElement.name.name
        : '';

      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
        const text = extractText(child);
        const fontSize = childStyle.fontSize || (tagName === 'h1' ? 30 : tagName === 'h2' ? 24 : tagName === 'h3' ? 20 : 15);
        const height = Math.min(maxY - currentY, estimateTextHeight(text, fontSize, box.w, childStyle.lineHeight));
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: height,
          fontSize,
          bold: true,
          color: childStyle.color || '1F2937',
          align: childStyle.textAlign || 'left',
          valign: 'top'
        });
        currentY += height + (childStyle.marginBottom ?? 0);
        consumed += height + (childStyle.marginBottom ?? 0);
        return;
      }

      if (tagName === 'p' || tagName === 'span' || tagName === 'strong') {
        const text = extractText(child);
        if (!text) return;
        const fontSize = childStyle.fontSize || parentStyle.fontSize || 12;
        const height = Math.min(maxY - currentY, estimateTextHeight(text, fontSize, box.w, childStyle.lineHeight));
        slide.addText(text, {
          x: box.x,
          y: currentY,
          w: box.w,
          h: height,
          fontSize,
          bold: childStyle.fontWeight === 'bold',
          color: childStyle.color || parentStyle.color || '1F2937',
          align: childStyle.textAlign || parentStyle.textAlign || 'left',
          valign: 'top'
        });
        currentY += height + (childStyle.marginBottom ?? 0.02);
        consumed += height + (childStyle.marginBottom ?? 0.02);
        return;
      }

      if (tagName === 'br') {
        const spacing = 0.15;
        currentY += spacing;
        consumed += spacing;
        return;
      }

      const childBox: LayoutBox = {
        x: box.x,
        y: currentY,
        w: box.w,
        h: maxY - currentY
      };

      const used = renderJsxElement(slide, child, childBox, pptx, 1);
      const margin = childStyle.marginBottom ?? 0;
      const delta = Math.min(maxY - currentY, used + margin);
      currentY += delta;
      consumed += delta;
    }
  });

  return consumed;
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
    return normalizeText(jsx.value);
  }

  if (t.isJSXElement(jsx)) {
    const name = t.isJSXIdentifier(jsx.openingElement.name)
      ? jsx.openingElement.name.name
      : '';

    if (name === 'br') {
      return '\n';
    }

    const parts: string[] = [];
    jsx.children?.forEach((child: any) => {
      const childText = extractText(child);
      if (childText) {
        parts.push(childText);
      }
    });

    if (parts.length === 0) return '';

    const separator = name === 'p' || name === 'div' || name === 'li' ? '\n' : ' ';
    return parts.join(separator).replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim();
  }

  if (t.isJSXExpressionContainer(jsx)) {
    if (t.isStringLiteral(jsx.expression)) {
      return jsx.expression.value;
    }
  }

  return '';
}

function normalizeText(value: string): string {
  if (!value) return '';
  return value
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function computeLineHeight(fontSize: number): number {
  return Math.max(0.18, (fontSize * 1.35) / 72);
}

function estimateTextHeight(text: string, fontSize: number, width: number, explicitLineHeight?: number): number {
  if (!text) return computeLineHeight(fontSize);
  const lineHeight = explicitLineHeight || computeLineHeight(fontSize);
  const effectiveWidth = Math.max(width, 0.5);
  const charsPerLine = Math.max(1, Math.floor((effectiveWidth * 72) / (fontSize * 0.55)));
  const lines = text.split(/\n/).reduce((acc, part) => acc + Math.max(1, Math.ceil(part.length / charsPerLine)), 0);
  return Math.max(lineHeight, lines * lineHeight);
}

function isWhitespaceText(node: any): boolean {
  return t.isJSXText(node) && normalizeText(node.value) === '';
}

function isRenderableChild(node: any): boolean {
  if (t.isJSXText(node)) {
    return normalizeText(node.value) !== '';
  }
  if (t.isJSXElement(node)) {
    return true;
  }
  return false;
}

function estimateElementHeight(node: any, width: number, parentStyle: ReturnType<typeof parseTailwindClasses>): number {
  if (t.isJSXText(node)) {
    return estimateTextHeight(normalizeText(node.value), parentStyle.fontSize || 12, width, parentStyle.lineHeight);
  }

  if (t.isJSXElement(node)) {
    const className = getClassName(node);
    const style = parseTailwindClasses(className);
    const tagName = t.isJSXIdentifier(node.openingElement.name)
      ? node.openingElement.name.name
      : '';

    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
      const text = extractText(node);
      return estimateTextHeight(text, style.fontSize || 18, width, style.lineHeight);
    }

    if (tagName === 'p' || tagName === 'span') {
      const text = extractText(node);
      return estimateTextHeight(text, style.fontSize || parentStyle.fontSize || 12, width, style.lineHeight);
    }

    if (className.includes('grid')) {
      return Math.max(1.8, parentStyle?.height ?? 1.8);
    }

    if (className.includes('flex')) {
      return Math.max(style.height || parentStyle.height || 0.6, 0.6);
    }

    if (style.height) {
      return style.height;
    }
  }

  return 0.6;
}

function renderFlex(
  slide: any,
  jsx: any,
  box: LayoutBox,
  className: string,
  style: ReturnType<typeof parseTailwindClasses>,
  pptx: any
): number {
  const isColumn = className.includes('flex-col') || style.flexDirection === 'column';
  const nodes = jsx.children.filter((child: any) => !isWhitespaceText(child));
  if (nodes.length === 0) return 0;

  const gap = style.gap ?? 0.12;

  if (isColumn) {
  const combined = nodes.reduce((sum: number, child: any) => sum + estimateElementHeight(child, box.w, style), 0);
    const totalGap = Math.max(0, nodes.length - 1) * gap;
    const scale = combined + totalGap > box.h ? (box.h - totalGap) / Math.max(combined, 0.1) : 1;
    let currentY = box.y;
    let maxY = box.y;
    nodes.forEach((child: any, index: number) => {
      const estimated = estimateElementHeight(child, box.w, style) * scale;
      const childBox: LayoutBox = {
        x: box.x,
        y: currentY,
        w: box.w,
        h: Math.max(0.2, estimated)
      };

      const used = renderJsxElement(slide, child, childBox, pptx, 1);
      const delta = Math.max(estimated, used);
      currentY += delta;
      maxY = Math.max(maxY, currentY);
      if (index < nodes.length - 1) {
        currentY += gap;
        maxY += gap;
      }
    });
    return Math.max(0, maxY - box.y);
  }

  const elementCount = nodes.length;
  const totalGap = Math.max(0, elementCount - 1) * gap;
  const availableWidth = Math.max(0.5, box.w - totalGap);

  const widths: number[] = nodes.map((child: any) => {
    if (t.isJSXElement(child)) {
      const childStyle = parseTailwindClasses(getClassName(child));
      if (childStyle.width) return childStyle.width;
      if (/^[A-Z]/.test(t.isJSXIdentifier(child.openingElement.name) ? child.openingElement.name.name : '')) {
        return 0.35;
      }
    }
    return -1; // auto
  });

  const fixedWidth = widths.reduce((sum: number, value: number) => (value >= 0 ? sum + value : sum), 0);
  const autoCount = widths.reduce((count: number, value: number) => (value < 0 ? count + 1 : count), 0);
  const remainingWidth = Math.max(0.2, availableWidth - fixedWidth);
  const autoWidth = autoCount > 0 ? remainingWidth / autoCount : 0;

  const normalizedWidths: number[] = widths.map((value: number) => (value >= 0 ? value : autoWidth));

  const widthSum = normalizedWidths.reduce((a: number, b: number) => a + b, 0);
  const scale = widthSum > availableWidth ? availableWidth / widthSum : 1;

  let currentX = box.x;
  let maxHeight = 0;

  nodes.forEach((child: any, index: number) => {
    const targetWidth = Math.max(0.2, normalizedWidths[index] * scale);

    if (t.isJSXText(child)) {
      const text = normalizeText(child.value);
      if (text) {
        const fontSize = style.fontSize || 12;
        const height = estimateTextHeight(text, fontSize, targetWidth, style.lineHeight);
        slide.addText(text, {
          x: currentX,
          y: box.y,
          w: targetWidth,
          h: height,
          fontSize,
          color: style.color || '1F2937',
          valign: 'top'
        });
        maxHeight = Math.max(maxHeight, height);
      }
    } else if (t.isJSXElement(child)) {
      const estimatedHeight = estimateElementHeight(child, targetWidth, style);
      const align = style.alignItems || 'start';
      let childY = box.y;
      if (align === 'center' && estimatedHeight < box.h) {
        childY = box.y + (box.h - estimatedHeight) / 2;
      } else if (align === 'end' && estimatedHeight < box.h) {
        childY = box.y + box.h - estimatedHeight;
      }

      const childBox: LayoutBox = {
        x: currentX,
        y: childY,
        w: targetWidth,
        h: box.h - (childY - box.y)
      };

      const used = renderJsxElement(slide, child, childBox, pptx, 1);
      maxHeight = Math.max(maxHeight, used);
    }

    currentX += targetWidth;
    if (index < nodes.length - 1) currentX += gap;
  });

  return Math.max(maxHeight, 0.4);
}

const ICON_MAP: Record<string, { glyph: string; fallbackColor?: string }> = {
  Zap: { glyph: '⚡', fallbackColor: '2563EB' },
  ThermometerSun: { glyph: '🌡️', fallbackColor: 'DC2626' },
  Cpu: { glyph: '🖥️', fallbackColor: '1F2937' },
  ChevronLeft: { glyph: '◀' },
  ChevronRight: { glyph: '▶' },
};

function renderIconComponent(
  slide: any,
  tagName: string,
  box: LayoutBox,
  style: ReturnType<typeof parseTailwindClasses>
): number {
  const icon = ICON_MAP[tagName];
  if (!icon) return 0;
  const fontSize = style.fontSize || 18;
  const height = Math.max(style.height ?? computeLineHeight(fontSize), computeLineHeight(fontSize));
  const width = Math.max(style.width ?? height, height);
  slide.addText(icon.glyph, {
    x: box.x,
    y: box.y,
    w: width,
    h: height,
    fontSize,
    color: style.color || icon.fallbackColor || '1F2937',
    align: 'center',
    valign: 'middle'
  });
  return height;
}

function renderShapeBlock(
  slide: any,
  box: LayoutBox,
  style: ReturnType<typeof parseTailwindClasses>,
  pptx: any
): number {
  const width = Math.max(style.width || 0.25, 0.2);
  const height = Math.max(style.height || 0.25, 0.2);
  const shapeType = style.borderRadius && style.borderRadius > 30
    ? pptx.ShapeType.ellipse
    : style.borderRadius && style.borderRadius > 6
      ? pptx.ShapeType.roundRect
      : pptx.ShapeType.rect;

  const shapeOptions: any = {
    x: box.x,
    y: box.y,
    w: width,
    h: height,
    fill: { color: style.backgroundColor || style.gradient?.from || '2563EB' },
    line: style.borderColor ? { color: style.borderColor, width: Math.max(0.25, (style.borderWidth || 1) / 2) } : { type: 'none' }
  };

  slide.addShape(shapeType, shapeOptions);
  return height;
}

function renderTable(slide: any, tableJsx: any, box: LayoutBox): number {
  const rows: any[][] = [];

  tableJsx.children?.forEach((child: any) => {
    if (t.isJSXElement(child)) {
      const tagName = t.isJSXIdentifier(child.openingElement.name) ? child.openingElement.name.name : '';
      if (tagName === 'thead' || tagName === 'tbody') {
        child.children?.forEach((row: any) => {
          if (t.isJSXElement(row) && t.isJSXIdentifier(row.openingElement.name) && row.openingElement.name.name === 'tr') {
            const rowData: any[] = [];
            row.children?.forEach((cell: any) => {
              if (t.isJSXElement(cell)) {
                const cellTag = t.isJSXIdentifier(cell.openingElement.name) ? cell.openingElement.name.name : '';
                if (cellTag === 'th' || cellTag === 'td') {
                  const text = extractText(cell);
                  const className = getClassName(cell);
                  const style = parseTailwindClasses(className);
                  rowData.push({
                    text,
                    options: {
                      fill: style.backgroundColor || (cellTag === 'th' ? 'F3F4F6' : 'FFFFFF'),
                      color: style.color || (cellTag === 'th' ? '1F2937' : '4B5563'),
                      bold: cellTag === 'th' || style.fontWeight === 'bold',
                      fontSize: style.fontSize || 10,
                      align: style.textAlign || 'left'
                    }
                  });
                }
              }
            });
            if (rowData.length > 0) rows.push(rowData);
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
      rowH: 0.25,
      border: { pt: 0.5, color: 'D1D5DB' }
    });
  }

  return rows.length * 0.25;
}

function renderList(slide: any, listJsx: any, box: LayoutBox, style: ReturnType<typeof parseTailwindClasses>): number {
  const items = listJsx.children?.filter((child: any) => t.isJSXElement(child) && t.isJSXIdentifier(child.openingElement.name) && child.openingElement.name.name === 'li');
  if (!items || items.length === 0) return 0;

  let currentY = box.y;
  const bulletColor = style.color || '4B5563';

  items.forEach((item: any) => {
    const text = extractText(item);
    const fontSize = style.fontSize || 11;
    const height = estimateTextHeight(text, fontSize, box.w - 0.3, style.lineHeight);
    slide.addText(`• ${text}`, {
      x: box.x,
      y: currentY,
      w: box.w,
      h: height,
      fontSize,
      color: bulletColor,
      valign: 'top'
    });
    currentY += height + 0.06;
  });

  return currentY - box.y;
}

/**
 * 添加頁首
 */
function addHeader(slide: any, metadata: PresentationMetadata | undefined, slideData: any): { hasHeader: boolean; nextY: number } {
  const defaultNextY = 0.6;
  if (!metadata) {
    return { hasHeader: false, nextY: defaultNextY };
  }

  let leftCursorY = 0.25;
  let lastBaseline = leftCursorY;
  let hasContent = false;

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
    hasContent = true;
    lastBaseline = leftCursorY + 0.28;
    leftCursorY = lastBaseline;
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
    hasContent = true;
    lastBaseline = leftCursorY + 0.22;
    leftCursorY = lastBaseline;
  }

  const rightLines: string[] = [];
  if (metadata.subtitle && metadata.subtitle !== slideData?.subtitle) rightLines.push(metadata.subtitle);
  if (metadata.department) rightLines.push(metadata.department);
  if (metadata.presenter) rightLines.push(metadata.presenter);
  if (metadata.year) rightLines.push(metadata.year);
  if (metadata.date) rightLines.push(metadata.date);

  if (rightLines.length > 0) {
    slide.addText(rightLines.join('\n'), {
      x: 7.3,
      y: 0.25,
      w: 2.2,
      h: 0.4,
      fontSize: 9,
      color: '4B5563',
      align: 'right'
    });
    hasContent = true;
  }

  if (!hasContent) {
    return { hasHeader: false, nextY: defaultNextY };
  }

  const lineY = Math.max(lastBaseline + 0.08, 0.68);
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
