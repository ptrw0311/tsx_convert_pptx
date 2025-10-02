#!/usr/bin/env node

/**
 * TSX to PPTX Converter
 * 將 React TSX 投影片組件轉換為 PowerPoint 格式
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseTsxFile, parseSlideDataSimple, extractMetadata } from './tsxParser';
import { generatePptx } from './pptxGenerator_v3';

/**
 * 主程序
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         TSX to PPTX Converter - 投影片轉換工具            ║
╚═══════════════════════════════════════════════════════════╝

使用方法:
  npm run convert <input.tsx> [output.pptx]

參數說明:
  <input.tsx>   - 必填：輸入的 TSX 投影片文件路徑
  [output.pptx] - 可選：輸出的 PPTX 文件路徑（默認與輸入文件同名）

範例:
  npm run convert ./slides/presentation.tsx
  npm run convert ./slides/presentation.tsx ./output/result.pptx

功能特性:
  ✓ 自動解析 TSX 投影片結構
  ✓ 保留原始樣式（顏色、字體、佈局）
  ✓ 支持 Tailwind CSS 類名轉換
  ✓ 生成標準 16:9 PowerPoint 格式
    `);
    process.exit(0);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(/\.tsx$/, '.pptx');

  // 檢查輸入文件是否存在
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 錯誤：找不到輸入文件 "${inputFile}"`);
    process.exit(1);
  }

  // 檢查輸入文件是否為 .tsx 格式
  if (!inputFile.endsWith('.tsx')) {
    console.error(`❌ 錯誤：輸入文件必須是 .tsx 格式`);
    process.exit(1);
  }

  console.log('\n🚀 開始轉換...\n');
  console.log(`📄 輸入文件: ${inputFile}`);
  console.log(`📦 輸出文件: ${outputFile}\n`);

  try {
    // 解析 TSX 文件
    console.log('⏳ 正在解析 TSX 文件...');

    let presentation;
    try {
      // 嘗試使用 AST 解析
      presentation = parseTsxFile(inputFile);
      console.log(`✓ 成功解析 ${presentation.slides.length} 張投影片`);
    } catch (error) {
      console.log('⚠ AST 解析失敗，使用簡化解析模式...');
      presentation = parseSlideDataSimple(inputFile);
      console.log(`✓ 成功解析 ${presentation.slides.length} 張投影片`);
    }

    // 提取元數據
    const code = fs.readFileSync(inputFile, 'utf-8');
    presentation.metadata = extractMetadata(code);

    // 生成 PPTX - 傳入 TSX 文件路徑以便直接解析 JSX
    console.log('\n⏳ 正在生成 PowerPoint 文件...');
    await generatePptx(presentation, outputFile, inputFile);

    console.log(`\n✅ 轉換完成！`);
    console.log(`📊 投影片總數: ${presentation.slides.length}`);
    console.log(`💾 輸出位置: ${path.resolve(outputFile)}\n`);

    // 顯示投影片標題
    console.log('📋 投影片清單:');
    presentation.slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title}`);
      if (slide.subtitle) {
        console.log(`      └─ ${slide.subtitle}`);
      }
    });

    console.log('\n🎉 轉換成功！現在可以打開 PowerPoint 文件查看結果。\n');

  } catch (error) {
    console.error('\n❌ 轉換失敗:', error);
    if (error instanceof Error) {
      console.error('錯誤詳情:', error.message);
      console.error('堆疊追蹤:', error.stack);
    }
    process.exit(1);
  }
}

// 執行主程序
main();
