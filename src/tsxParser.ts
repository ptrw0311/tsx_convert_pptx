/**
 * TSX 文件解析器
 * 解析 React TSX 組件，提取投影片數據結構
 */

import * as fs from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { SlideData, ContentElement, ParsedPresentation } from './types';
import { parseTailwindClasses, extractLayoutInfo, stripHtmlTags } from './styleMapper';

/**
 * 解析 TSX 文件
 */
export function parseTsxFile(filePath: string): ParsedPresentation {
  const code = fs.readFileSync(filePath, 'utf-8');

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  const slides: SlideData[] = [];
  let metadata: any = {};

  traverse(ast, {
    VariableDeclarator(path) {
      // 尋找 slides 陣列定義
      if (t.isIdentifier(path.node.id) && path.node.id.name === 'slides') {
        if (t.isArrayExpression(path.node.init)) {
          path.node.init.elements.forEach((element) => {
            if (t.isObjectExpression(element)) {
              const slide = parseSlideObject(element);
              if (slide) {
                slides.push(slide);
              }
            }
          });
        }
      }
    }
  });

  return { slides, metadata };
}

/**
 * 解析單個投影片對象
 */
function parseSlideObject(objectExpr: t.ObjectExpression): SlideData | null {
  let title = '';
  let subtitle = '';
  let content: ContentElement[] = [];

  objectExpr.properties.forEach((prop) => {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name;

      if (key === 'title' && t.isStringLiteral(prop.value)) {
        title = prop.value.value;
      } else if (key === 'subtitle' && t.isStringLiteral(prop.value)) {
        subtitle = prop.value.value;
      } else if (key === 'content') {
        // 解析 JSX 內容
        if (t.isArrowFunctionExpression(prop.value) || t.isFunctionExpression(prop.value)) {
          const body = prop.value.body;
          if (t.isJSXElement(body) || t.isJSXFragment(body)) {
            content = parseJsxElement(body);
          } else if (t.isBlockStatement(body)) {
            // 處理函數體中的 return 語句
            body.body.forEach(statement => {
              if (t.isReturnStatement(statement) && statement.argument) {
                if (t.isJSXElement(statement.argument) || t.isJSXFragment(statement.argument)) {
                  content = parseJsxElement(statement.argument);
                }
              }
            });
          }
        }
      }
    }
  });

  if (!title) return null;

  return { title, subtitle, content };
}

/**
 * 解析 JSX 元素
 */
function parseJsxElement(jsx: any): ContentElement[] {
  const elements: ContentElement[] = [];

  if (!jsx) return elements;

  if (t.isJSXElement(jsx)) {
    const element = convertJsxToContentElement(jsx);
    if (element) elements.push(element);
  } else if (t.isJSXFragment(jsx)) {
    jsx.children.forEach((child: any) => {
      const parsed = parseJsxElement(child);
      elements.push(...parsed);
    });
  }

  return elements;
}

/**
 * 將 JSX 元素轉換為 ContentElement
 */
function convertJsxToContentElement(jsx: t.JSXElement): ContentElement | null {
  const openingElement = jsx.openingElement;

  if (!t.isJSXIdentifier(openingElement.name)) return null;

  const tagName = openingElement.name.name;
  const element: ContentElement = {
    type: 'div',
    children: []
  };

  // 解析屬性
  openingElement.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const attrName = attr.name.name;

      if (attrName === 'className' && attr.value) {
        if (t.isStringLiteral(attr.value)) {
          element.className = attr.value.value;
          element.style = parseTailwindClasses(attr.value.value);

          // 提取佈局信息
          const layoutInfo = extractLayoutInfo(attr.value.value);
          if (layoutInfo.gridCols) {
            element.gridCols = layoutInfo.gridCols;
            element.type = 'grid';
          }
        }
      }
    }
  });

  // 解析子元素
  jsx.children.forEach((child) => {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        element.children?.push({
          type: 'text',
          text: text
        });
      }
    } else if (t.isJSXElement(child)) {
      const childElement = convertJsxToContentElement(child);
      if (childElement) {
        element.children?.push(childElement);
      }
    } else if (t.isJSXExpressionContainer(child)) {
      // 處理 JSX 表達式
      if (t.isStringLiteral(child.expression)) {
        element.children?.push({
          type: 'text',
          text: child.expression.value
        });
      }
    }
  });

  return element;
}

/**
 * 簡化版：直接從源碼提取投影片數據（備用方案）
 */
export function parseSlideDataSimple(filePath: string): ParsedPresentation {
  const code = fs.readFileSync(filePath, 'utf-8');

  // 使用正則表達式提取 slides 陣列
  const slidesMatch = code.match(/const slides = \[([\s\S]*?)\];/);

  if (!slidesMatch) {
    throw new Error('未找到 slides 陣列定義');
  }

  // 這裡我們將使用動態評估的方式（需要注意安全性）
  // 在生產環境中應該使用更安全的 AST 解析

  const slides: SlideData[] = [];

  // 提取每個 slide 對象
  const slideObjects = extractSlideObjects(code);

  slideObjects.forEach(slideCode => {
    const slide = parseSlideFromCode(slideCode);
    if (slide) {
      slides.push(slide);
    }
  });

  return { slides };
}

/**
 * 從代碼中提取 slide 對象
 */
function extractSlideObjects(code: string): string[] {
  const slides: string[] = [];
  const slidesArrayMatch = code.match(/const slides = \[([\s\S]*?)\];/);

  if (!slidesArrayMatch) return slides;

  const slidesContent = slidesArrayMatch[1];

  // 簡單的大括號匹配來分割各個 slide
  let depth = 0;
  let currentSlide = '';
  let inSlide = false;

  for (let i = 0; i < slidesContent.length; i++) {
    const char = slidesContent[i];

    if (char === '{') {
      depth++;
      inSlide = true;
    }

    if (inSlide) {
      currentSlide += char;
    }

    if (char === '}') {
      depth--;
      if (depth === 0 && inSlide) {
        slides.push(currentSlide.trim());
        currentSlide = '';
        inSlide = false;
      }
    }
  }

  return slides;
}

/**
 * 從代碼片段解析 slide
 */
function parseSlideFromCode(code: string): SlideData | null {
  // 提取 title
  const titleMatch = code.match(/title:\s*["']([^"']+)["']/);
  const title = titleMatch ? titleMatch[1] : '';

  // 提取 subtitle
  const subtitleMatch = code.match(/subtitle:\s*["']([^"']+)["']/);
  const subtitle = subtitleMatch ? subtitleMatch[1] : '';

  if (!title) return null;

  // 內容部分會在 PPTX 生成器中處理
  return {
    title,
    subtitle,
    content: [] // 暫時留空，將由 PPTX 生成器直接從原始數據處理
  };
}

/**
 * 提取元數據（公司名稱、日期等）
 */
export function extractMetadata(code: string): any {
  const metadata: any = {};

  // 提取公司名稱
  const companyMatch = code.match(/富鴻網 FDS/);
  if (companyMatch) {
    metadata.company = '富鴻網 FDS';
  }

  // 提取標題
  const titleMatch = code.match(/整合專案事業部業務現況報告/);
  if (titleMatch) {
    metadata.title = '整合專案事業部業務現況報告';
  }

  return metadata;
}
