import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PresentationSlides = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: 上半年業務表現 - 嚴峻挑戰
    {
      title: "Y25 上半年業務表現：面臨嚴峻挑戰",
      subtitle: "整合專案事業部營運現況",
      content: (
        <div className="space-y-3 h-full">
          {/* 核心問題 */}
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <h3 className="text-xl font-bold text-red-700 mb-1">訂單達成率最低 · 達成率 0%</h3>
            <p className="text-base text-gray-700">事業部目前 10 人，9 人負責雲端專案，僅 1 人經理兼業務，業務承載量嚴重不足</p>
          </div>

          {/* 財務數據 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">訂單目標 vs 實際</div>
              <div className="text-2xl font-bold text-gray-800">$119M</div>
              <div className="text-base text-red-600 font-semibold">實際 $0.3M</div>
              <div className="text-xs text-red-600 mt-1">達成率 0.2%</div>
            </div>
            
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">營收目標 vs 實際</div>
              <div className="text-2xl font-bold text-gray-800">$356M</div>
              <div className="text-base text-orange-600 font-semibold">實際 $81M</div>
              <div className="text-xs text-orange-600 mt-1">達成率 23%</div>
            </div>
            
            <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">毛利目標 vs 實際</div>
              <div className="text-2xl font-bold text-gray-800">$7M</div>
              <div className="text-base text-red-600 font-semibold">實際 $1M</div>
              <div className="text-xs text-red-600 mt-1">達成率 8% · 毛利率僅 1%</div>
            </div>
          </div>

          {/* 核心問題分析 + 關鍵數據對比 合併 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-base font-bold text-gray-800 mb-2">上半年主要困境</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2 flex-shrink-0">●</span>
                  <span><strong>AIDC 大型專案延遲：</strong>原始資源首有 AIDC 進度落後，內部作業延遲，台電供電不確定，業主遲遲未能啟動</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-500 mr-2 flex-shrink-0">●</span>
                  <span><strong>NOVA 案進度落後：</strong>因 NOVA 案及高醫驗收進度落後，仍積極追趕中</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-500 mr-2 flex-shrink-0">●</span>
                  <span><strong>EBIT 虧損：</strong>上半年 EBIT -$3M（-3%），營運費用 $3M 遠超毛利</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-base font-bold text-gray-800 mb-2">團隊現況數據</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">人均營收貢獻</div>
                  <div className="text-lg font-bold">$8.1M <span className="text-sm text-gray-500">vs 目標 $29.7M</span></div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">團隊規模</div>
                  <div className="text-lg font-bold">10 人 <span className="text-sm text-gray-500">vs 計畫 12 人</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Q3 執行重點 - 轉機與行動
    {
      title: "Q3 執行重點：奮力轉虧為盈",
      subtitle: "現有案件推進 + 新案源開發雙軌並行",
      content: (
        <div className="space-y-3 h-full">
          {/* Q3 預期改善 */}
          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
            <h3 className="text-lg font-bold text-green-700 mb-1">Q3 關鍵轉折：營收預估 $199M（達成率 164%）</h3>
            <p className="text-sm text-gray-700">下半年累計營收目標 $477M，達成率預估 59%</p>
          </div>

          {/* 現有案件執行 */}
          <div>
            <h4 className="text-base font-bold text-gray-800 mb-2 flex items-center">
              <span className="bg-blue-600 text-white px-2 py-1 rounded mr-2 text-sm">既有案件</span>
              加速推進與驗收
            </h4>
            <div className="space-y-2">
              <div className="bg-white border-l-4 border-blue-500 p-2 rounded shadow-sm">
                <div className="text-base font-semibold text-gray-800">NOVA 案（客戶：雲高）</div>
                <div className="text-sm text-gray-600 mt-1">
                  • 設計變更追加工程、減項工程，已與業主協商，後續簽訂維護合約<br/>
                  • 加速進行缺改作業中，<strong className="text-blue-600">預估 2025/8 月初起開始執行終驗程序，9 月底完成缺失改善</strong><br/>
                  • 預計 Q3 完工報驗，詳見後頁說明
                </div>
              </div>

              <div className="bg-white border-l-4 border-purple-500 p-2 rounded shadow-sm">
                <div className="text-base font-semibold text-gray-800">高醫案（客戶：興鼎營造）</div>
                <div className="text-sm text-gray-600 mt-1">
                  • 本案因與承攬廠商有合約相關議題仍加緊處理中（增補協議），<strong className="text-purple-600">預計 7 月底完成</strong><br/>
                  • 依目前芻鼎工程進度，仍有可能發生工程逾期，將密切觀察工程進度與執行狀況決定是否須介入
                </div>
              </div>
            </div>
          </div>

          {/* 新案源開發 + Q3營收 合併 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-base font-bold text-gray-800 mb-2 flex items-center">
                <span className="bg-orange-600 text-white px-2 py-1 rounded mr-2 text-sm">新案源</span>
                積極開發多元商機
              </h4>
              <div className="space-y-2">
                <div className="bg-orange-50 border border-orange-300 rounded p-2">
                  <div className="font-semibold text-sm text-gray-800 mb-1">AIDC 建置案持續追蹤</div>
                  <div className="text-xs text-gray-600">持續追蹤洽談及跟蹤進度（嘉義案、鴻海二期）</div>
                </div>
                
                <div className="bg-orange-50 border border-orange-300 rounded p-2">
                  <div className="font-semibold text-sm text-gray-800 mb-1">執行中專案衍生商機</div>
                  <div className="text-xs text-gray-600">馬欄 DS 機房案、新營服務區發電機電統包工程</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-100 rounded-lg p-3">
              <h4 className="text-base font-bold text-gray-800 mb-2">Q3 主要營收來源 $M</h4>
              <div className="flex items-center justify-around text-center mb-2">
                <div>
                  <div className="text-2xl font-bold text-blue-600">$121M</div>
                  <div className="text-xs text-gray-600">預算</div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div>
                  <div className="text-2xl font-bold text-green-600">$199M</div>
                  <div className="text-xs text-gray-600">實際/預估</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">164%</div>
                  <div className="text-xs text-gray-600">達成率</div>
                </div>
              </div>
              <div className="text-sm text-gray-700 border-t border-blue-300 pt-2">
                <strong>主要貢獻：</strong>NOVA（雲雀/雲高合案）+ 高醫驗收入帳
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: 2025 全年展望與策略規劃
    {
      title: "2025 全年展望與策略行動",
      subtitle: "營收預估明細與關鍵專案佈局",
      content: (
        <div className="space-y-3 h-full">
          {/* 全年營收預估 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border-2 border-blue-300">
            <h4 className="text-base font-bold text-gray-800 mb-2">Y2025 全年營收預估（截至 09/15）</h4>
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 text-xs">年度預算</div>
                <div className="text-xl font-bold text-gray-800">$356M</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 text-xs">H1 實際</div>
                <div className="text-xl font-bold text-orange-600">$81M</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 text-xs">Q3 預估</div>
                <div className="text-xl font-bold text-green-600">$199M</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 text-xs">H1+Q3 累計</div>
                <div className="text-xl font-bold text-blue-600">$280M</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600 text-xs">達成率預估</div>
                <div className="text-xl font-bold text-blue-700">59%</div>
              </div>
            </div>
          </div>

          {/* 主要專案佈局 */}
          <div>
            <h4 className="text-base font-bold text-gray-800 mb-2">2025 關鍵專案佈局（4 大案源）</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white border border-gray-300 rounded p-2 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">1. 鴻海二期 AI 機房（遠傳）</div>
                  <div className="font-bold text-blue-600">$100M</div>
                </div>
                <div className="text-xs text-gray-600">
                  設計變更追加工程分期招標，工程款支分機電工程及驗證工程<br/>
                  <strong>時程：</strong>2025/12 啟動，2027/10 結案 | <strong>完成度：</strong>10%
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-2 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">2. 馬欄 D/S 機電工程（興鼎營造）</div>
                  <div className="font-bold text-blue-600">$41M</div>
                </div>
                <div className="text-xs text-gray-600">
                  機電統包，與業主洽談中<br/>
                  <strong>時程：</strong>2025/12 啟動，2026/12 結案 | <strong>完成度：</strong>10%
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-2 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">3. NOVA 機房維護合約（雲高）</div>
                  <div className="font-bold text-blue-600">$75M</div>
                </div>
                <div className="text-xs text-gray-600">
                  設備維護，與業主洽談中<br/>
                  <strong>時程：</strong>2025/12 啟動，2029/12 結案 | <strong>完成度：</strong>25%
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-2 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">4. 德晉資料中心設計監造（德晉）</div>
                  <div className="font-bold text-blue-600">$60M</div>
                </div>
                <div className="text-xs text-gray-600">
                  AIDC 機房建置設計監造，協助業主撰寫專案需求書（RFP）<br/>
                  <strong>時程：</strong>2025/10 啟動，2027/12 結案 | <strong>完成度：</strong>10%
                </div>
              </div>
            </div>
          </div>

          {/* 下半年行動重點 */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded">
            <h4 className="font-bold text-gray-800 mb-1 text-sm">下半年關鍵行動</h4>
            <div className="text-xs text-gray-700 grid grid-cols-3 gap-2">
              <div>✓ <strong>Q4 補業績缺口：</strong>積極追蹤 AIDC 建置案及其他新案源，補足預算差距 $76M</div>
              <div>✓ <strong>專案交付品質：</strong>確保 NOVA、高醫案順利驗收，建立專案實績</div>
              <div>✓ <strong>擴大業務能量：</strong>強化南北區各一業務配置，專案執行組負責執行與交付</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Slide Content - 16:9 比例 (1280x720) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{width: '1280px', height: '720px'}}>
          <div className="p-6 flex flex-col h-full">
            {/* Company Header */}
            <div className="mb-2 pb-2 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-lg font-bold text-blue-700">富鴻網 FDS</h1>
                <p className="text-xs text-gray-600">整合專案事業部業務現況報告</p>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>內部檢討會議</div>
                <div>2025年度營運檢視</div>
              </div>
            </div>

            {/* Slide Title */}
            <div className="mb-3 border-b-4 border-blue-600 pb-2 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {slides[currentSlide].title}
              </h2>
              <p className="text-sm text-gray-600">{slides[currentSlide].subtitle}</p>
            </div>

            {/* Slide Content */}
            <div className="flex-1 overflow-hidden">
              {slides[currentSlide].content}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-300 p-3 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={18} />
            上一頁
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition ${
                  currentSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={currentSlide === slides.length - 1}
            >
              下一頁
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationSlides;