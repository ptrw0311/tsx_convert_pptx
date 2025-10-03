/**
 * TSX 文件解析器
 * 解析 React TSX 組件，提取投影片數據結構
 */

import * as fs from 'fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { SlideData, ContentElement, ParsedPresentation, PresentationMetadata } from './types';
import { parseTailwindClasses, extractLayoutInfo, stripHtmlTags } from './styleMapper';

const METADATA_KEY_MAP: Record<string, keyof PresentationMetadata> = {
  company: 'company',
  organisation: 'company',
  organization: 'company',
  org: 'company',
  corporation: 'company',
  corporate: 'company',
  brand: 'company',
  business: 'company',
  department: 'department',
  dept: 'department',
  division: 'department',
  team: 'department',
  unit: 'department',
  title: 'title',
  reporttitle: 'title',
  name: 'title',
  headline: 'title',
  subtitle: 'subtitle',
  tagline: 'subtitle',
  description: 'subtitle',
  summary: 'subtitle',
  highlight: 'subtitle',
  year: 'year',
  fiscalyear: 'year',
  date: 'date',
  reportdate: 'date',
  asof: 'date',
  presenter: 'presenter',
  author: 'presenter',
  speaker: 'presenter',
  preparedby: 'presenter'
};

const METADATA_KEY_WEIGHT: Record<keyof PresentationMetadata, number> = {
  company: 3,
  department: 2,
  title: 2,
  subtitle: 1.5,
  date: 2,
  year: 1.5,
  presenter: 1
};

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
export function extractMetadata(code: string, sourceFilePath?: string): PresentationMetadata {
  let ast: t.File | null = null;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (error) {
    // 如果語法解析失敗，改用簡易匹配
    return buildFallbackMetadata(code, sourceFilePath);
  }

  const candidates: Array<{ metadata: PresentationMetadata; score: number }> = [];

  traverse(ast, {
    VariableDeclarator(path) {
      const init = path.node.init;
      if (t.isObjectExpression(init)) {
        const candidate = buildMetadataFromObject(init);
        if (candidate.score > 0) {
          candidates.push(candidate);
        }
      }
    },
    ObjectExpression(path) {
      // 尋找 export default { metadata: { ... } } 型態
      const parent = path.parent;
      if (t.isObjectProperty(parent) && t.isIdentifier(parent.key) && parent.key.name === 'metadata') {
        const candidate = buildMetadataFromObject(path.node);
        if (candidate.score > 0) {
          candidates.push(candidate);
        }
      }
    }
  });

  const best = selectBestMetadataCandidate(candidates);
  const metadata: PresentationMetadata = best ? { ...best.metadata } : {};

  // 從 slides 內容補齊標題/副標題
  const slideObjects = extractSlideObjects(code)
    .map(parseSlideFromCode)
    .filter((slide): slide is SlideData => Boolean(slide));

  if (!metadata.title && slideObjects[0]?.title) {
    metadata.title = slideObjects[0].title;
  }

  if (!metadata.subtitle && slideObjects[0]?.subtitle) {
    metadata.subtitle = slideObjects[0].subtitle;
  }

  if (!metadata.company) {
    metadata.company = fallbackCompanyFromCode(code) || deriveNameFromPath(sourceFilePath);
  }

  if (!metadata.year) {
    metadata.year = fallbackYearFromCode(code);
  }

  if (!metadata.date) {
    metadata.date = fallbackDateFromCode(code);
  }

  return metadata;
}

function buildFallbackMetadata(code: string, sourceFilePath?: string): PresentationMetadata {
  const slides = extractSlideObjects(code)
    .map(parseSlideFromCode)
    .filter((slide): slide is SlideData => Boolean(slide));

  return {
    title: slides[0]?.title,
    subtitle: slides[0]?.subtitle,
    company: fallbackCompanyFromCode(code) || deriveNameFromPath(sourceFilePath),
    year: fallbackYearFromCode(code),
    date: fallbackDateFromCode(code)
  };
}

function buildMetadataFromObject(objectExpr: t.ObjectExpression): { metadata: PresentationMetadata; score: number } {
  const metadata: PresentationMetadata = {};
  let score = 0;

  objectExpr.properties.forEach((prop) => {
    if (t.isObjectProperty(prop)) {
      const keyName = getPropertyKeyName(prop.key);
      if (!keyName) return;

      const canonicalKey = METADATA_KEY_MAP[keyName.toLowerCase()];
      if (!canonicalKey) {
        return;
      }

      const value = extractStringValue(prop.value);
      if (value) {
        (metadata as any)[canonicalKey] = value.trim();
        score += METADATA_KEY_WEIGHT[canonicalKey] ?? 1;
      }
    }
  });

  return { metadata, score };
}

function selectBestMetadataCandidate(
  candidates: Array<{ metadata: PresentationMetadata; score: number }>
): { metadata: PresentationMetadata; score: number } | null {
  if (candidates.length === 0) return null;

  return candidates
    .filter(candidate => Object.keys(candidate.metadata).length > 0)
    .sort((a, b) => b.score - a.score)[0] ?? null;
}

function getPropertyKeyName(key: t.Node): string | null {
  if (t.isIdentifier(key)) return key.name;
  if (t.isStringLiteral(key)) return key.value;
  return null;
}

function extractStringValue(node: t.Node | null | undefined): string | null {
  if (!node) return null;

  if (t.isStringLiteral(node)) {
    return node.value;
  }

  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis.map(quasi => quasi.value.cooked ?? '').join('');
  }

  if (t.isTSAsExpression(node) || t.isTypeCastExpression(node)) {
    return extractStringValue(node.expression as t.Expression);
  }

  return null;
}

function deriveNameFromPath(filePath?: string): string | undefined {
  if (!filePath) return undefined;
  const baseName = filePath.split(/[\\/]/).pop();
  if (!baseName) return undefined;
  const noExt = baseName.replace(/\.[^/.]+$/, '');
  if (!noExt) return undefined;
  return noExt
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(.)/g, (char) => char.toUpperCase());
}

function fallbackCompanyFromCode(code: string): string | undefined {
  const companyRegex = /['"` ]([^'"`\n]*?(?:公司|股份有限公司|企業|集團|Corporation|Corp\.?|Company|Inc\.?|Limited|Ltd\.?)[^'"`\n]*)['"`]/;
  const match = code.match(companyRegex);
  return match ? match[1].trim() : undefined;
}

function fallbackYearFromCode(code: string): string | undefined {
  const yearMatches = code.match(/20\d{2}(?=\D)/g);
  if (!yearMatches) return undefined;
  const numericCounts: Record<string, number> = {};
  yearMatches.forEach((year) => {
    numericCounts[year] = (numericCounts[year] || 0) + 1;
  });
  const sorted = Object.entries(numericCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0];
}

function fallbackDateFromCode(code: string): string | undefined {
  const dateRegex = /(20\d{2}[\/-](?:0?[1-9]|1[0-2])(?:[\/-](?:0?[1-9]|[12]\d|3[01]))?)/;
  const match = code.match(dateRegex);
  return match ? match[1] : undefined;
}
