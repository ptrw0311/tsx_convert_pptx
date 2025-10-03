/**
 * Tailwind CSS 類名映射到實際樣式
 */

import { ElementStyle, TailwindClassMapping } from './types';

// Tailwind 顏色映射
const colorMap: { [key: string]: string } = {
  // 紅色系
  'red-50': 'FEF2F2',
  'red-500': 'EF4444',
  'red-600': 'DC2626',
  'red-700': 'B91C1C',

  // 橙色系
  'orange-50': 'FFF7ED',
  'orange-100': 'FFEDD5',
  'orange-400': 'FB923C',
  'orange-600': 'EA580C',
  'orange-700': 'C2410C',
  'orange-800': '9A3412',

  // 黃色系
  'yellow-50': 'FEFCE8',
  'yellow-100': 'FEF9C3',
  'yellow-500': 'EAB308',
  'yellow-600': 'CA8A04',
  'yellow-900': '713F12',

  // 綠色系
  'green-50': 'F0FDF4',
  'green-100': 'DCFCE7',
  'green-400': '4ADE80',
  'green-500': '22C55E',
  'green-600': '16A34A',
  'green-700': '15803D',
  'green-800': '166534',

  // 藍色系
  'blue-50': 'EFF6FF',
  'blue-100': 'DBEAFE',
  'blue-300': '93C5FD',
  'blue-500': '3B82F6',
  'blue-600': '2563EB',
  'blue-700': '1D4ED8',
  'blue-800': '1E40AF',
  'blue-900': '1E3A8A',

  // 紫色系
  'purple-50': 'FAF5FF',
  'purple-100': 'F3E8FF',
  'purple-400': 'C084FC',
  'purple-500': 'A855F7',
  'purple-600': '9333EA',
  'purple-700': '7E22CE',
  'purple-800': '6B21A8',

  // 灰色系
  'gray-50': 'F9FAFB',
  'gray-100': 'F3F4F6',
  'gray-200': 'E5E7EB',
  'gray-300': 'D1D5DB',
  'gray-400': '9CA3AF',
  'gray-500': '6B7280',
  'gray-600': '4B5563',
  'gray-700': '374151',
  'gray-800': '1F2937',
  'gray-900': '111827',

  // 白色
  'white': 'FFFFFF',
};

/**
 * 解析 Tailwind CSS 類名並轉換為樣式對象
 */
export function parseTailwindClasses(classNames: string): Partial<ElementStyle> {
  const classes = classNames.split(' ').filter(c => c.trim());
  const style: Partial<ElementStyle> = {};

  classes.forEach(className => {
    if (className.startsWith('bg-')) {
      if (className.includes('gradient')) {
        style.gradient = style.gradient ?? { angle: 315 };
        if (className.includes('to-r')) style.gradient.angle = 0;
        if (className.includes('to-b')) style.gradient.angle = 90;
        if (className.includes('to-tr')) style.gradient.angle = 45;
        if (className.includes('to-br')) style.gradient.angle = 315;
        if (className.includes('to-bl')) style.gradient.angle = 225;
      } else {
        const colorKey = className.replace('bg-', '');
        if (colorMap[colorKey]) {
          style.backgroundColor = colorMap[colorKey];
        }
      }
    }

    if (className.startsWith('from-')) {
      const colorKey = className.replace('from-', '');
      if (colorMap[colorKey]) {
        style.gradient = style.gradient ?? {};
        style.gradient.from = colorMap[colorKey];
      }
    }

    if (className.startsWith('to-')) {
      const colorKey = className.replace('to-', '');
      if (colorMap[colorKey]) {
        style.gradient = style.gradient ?? {};
        style.gradient.to = colorMap[colorKey];
      }
    }

    if (className.startsWith('text-')) {
      const parts = className.split('-');
      if (parts.length >= 3) {
        const colorKey = parts.slice(1).join('-');
        if (colorMap[colorKey]) {
          style.color = colorMap[colorKey];
        }
      }

      if (className === 'text-xs') style.fontSize = 10;
      else if (className === 'text-sm') style.fontSize = 11;
      else if (className === 'text-base') style.fontSize = 13;
      else if (className === 'text-lg') style.fontSize = 15;
      else if (className === 'text-xl') style.fontSize = 18;
      else if (className === 'text-2xl') style.fontSize = 22;
      else if (className === 'text-3xl') style.fontSize = 28;
    }

    if (className.includes('font-bold') || className.includes('font-semibold')) {
      style.fontWeight = 'bold';
    }

    if (className.startsWith('border-')) {
      const parts = className.split('-');
      if (parts.length >= 3 && colorMap[parts.slice(1).join('-')]) {
        style.borderColor = colorMap[parts.slice(1).join('-')];
      }

      if (className.includes('border-2')) style.borderWidth = 2;
      else if (className.includes('border-4')) style.borderWidth = 4;
      else if (className.includes('border')) style.borderWidth = 1;
    }

    if (className.includes('rounded')) {
      if (className.includes('rounded-xl')) style.borderRadius = 12;
      else if (className.includes('rounded-lg')) style.borderRadius = 8;
      else if (className.includes('rounded-full')) style.borderRadius = 999;
      else style.borderRadius = 4;
    }

    if (className.includes('text-center')) style.textAlign = 'center';
    else if (className.includes('text-right')) style.textAlign = 'right';
    else if (className.includes('text-left')) style.textAlign = 'left';

    if (className.includes('shadow')) style.shadow = true;

    if (className === 'flex') style.flexDirection = 'row';
    if (className === 'flex-col') style.flexDirection = 'column';

    if (className.startsWith('gap-')) {
      const value = parseInt(className.replace('gap-', ''), 10);
      if (!Number.isNaN(value)) style.gap = tailwindUnitToInches(value);
    }

    if (className.startsWith('space-y-')) {
      const value = parseInt(className.replace('space-y-', ''), 10);
      if (!Number.isNaN(value)) style.gap = tailwindUnitToInches(value);
    }

    if (className === 'items-center') style.alignItems = 'center';
    else if (className === 'items-end') style.alignItems = 'end';

    if (className === 'justify-center') style.justifyContent = 'center';
    else if (className === 'justify-between') style.justifyContent = 'between';

    if (className.startsWith('mb-')) {
      const value = parseInt(className.replace('mb-', ''), 10);
      if (!Number.isNaN(value)) style.marginBottom = tailwindUnitToInches(value);
    }

    if (className.startsWith('mt-')) {
      const value = parseInt(className.replace('mt-', ''), 10);
      if (!Number.isNaN(value)) style.marginTop = tailwindUnitToInches(value);
    }

    if (className.startsWith('p-')) {
      const value = parseInt(className.replace('p-', ''), 10);
      if (!Number.isNaN(value)) style.padding = tailwindUnitToInches(value);
    }

    if (className.startsWith('px-')) {
      const value = parseInt(className.replace('px-', ''), 10);
      if (!Number.isNaN(value)) style.paddingX = tailwindUnitToInches(value);
    }

    if (className.startsWith('py-')) {
      const value = parseInt(className.replace('py-', ''), 10);
      if (!Number.isNaN(value)) style.paddingY = tailwindUnitToInches(value);
    }

    if (className.startsWith('w-')) {
      const value = parseInt(className.replace('w-', ''), 10);
      if (!Number.isNaN(value)) style.width = tailwindUnitToInches(value);
    }

    if (className.startsWith('h-')) {
      const value = parseInt(className.replace('h-', ''), 10);
      if (!Number.isNaN(value)) style.height = tailwindUnitToInches(value);
    }

    if (className === 'text-xs') style.lineHeight = 0.18;
    else if (className === 'text-sm') style.lineHeight = 0.2;
    else if (className === 'text-base') style.lineHeight = 0.22;
    else if (className === 'text-lg') style.lineHeight = 0.25;
    else if (className === 'text-xl') style.lineHeight = 0.3;
    else if (className === 'text-2xl') style.lineHeight = 0.35;
    else if (className === 'text-3xl') style.lineHeight = 0.4;
  });

  if (style.gradient && !style.backgroundColor) {
    style.backgroundColor = style.gradient.to || style.gradient.from;
  }

  return style;
}

function tailwindUnitToInches(value: number): number {
  return parseFloat((value * 0.0416).toFixed(3));
}

/**
 * 從完整的 className 字符串中提取關鍵信息
 */
export function extractLayoutInfo(className: string): {
  gridCols?: number;
  gap?: number;
  padding?: number;
} {
  const info: any = {};

  // Grid 列數
  if (className.includes('grid-cols-2')) info.gridCols = 2;
  else if (className.includes('grid-cols-3')) info.gridCols = 3;
  else if (className.includes('grid-cols-4')) info.gridCols = 4;
  else if (className.includes('grid-cols-5')) info.gridCols = 5;

  // Gap
  if (className.includes('gap-1')) info.gap = 1;
  else if (className.includes('gap-2')) info.gap = 2;
  else if (className.includes('gap-3')) info.gap = 3;

  // Padding
  if (className.includes('p-2')) info.padding = 2;
  else if (className.includes('p-3')) info.padding = 3;
  else if (className.includes('p-4')) info.padding = 4;

  return info;
}

/**
 * 將十六進制顏色轉換為 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * 判斷文字是否應該使用粗體（根據內容）
 */
export function shouldBeBold(text: string): boolean {
  // 如果文字被 <strong> 標籤包裹，或包含特定關鍵字
  return text.includes('<strong>') || text.includes('</strong>');
}

/**
 * 清理 HTML 標籤
 */
export function stripHtmlTags(text: string): string {
  return text
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<strong>(.*?)<\/strong>/g, '$1')
    .replace(/<[^>]*>/g, '');
}
