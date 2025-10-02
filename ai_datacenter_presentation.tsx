import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Zap, ThermometerSun, Cpu } from 'lucide-react';

const AIDataCenterPresentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: AI機房 vs 傳統IDC
    {
      title: "AI機房 vs 傳統IDC",
      subtitle: "新世代資料中心的全面進化",
      content: (
        <div className="h-full flex flex-col justify-center space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* 傳統IDC */}
            <div className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300">
              <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">傳統 IDC</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold">電力容量</div>
                    <div className="text-gray-600">4~6 kW/櫃</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded flex-shrink-0" />
                  <div>
                    <div className="font-semibold">樓板載重</div>
                    <div className="text-gray-600">1,000 kg/㎡</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThermometerSun className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold">冷卻方式</div>
                    <div className="text-gray-600">氣冷 + 精密空調</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="text-gray-500 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold">設備密度</div>
                    <div className="text-gray-600">一般伺服器</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI機房 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-500 shadow-lg">
              <h3 className="text-xl font-bold text-blue-700 mb-3 text-center">AI 機房 (AIDC)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-blue-900">電力容量</div>
                    <div className="text-blue-700 font-bold">10~200 kW/櫃</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">樓板載重</div>
                    <div className="text-blue-700 font-bold">2,000+ kg/㎡</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThermometerSun className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-blue-900">冷卻方式</div>
                    <div className="text-blue-700 font-bold">液冷技術</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-blue-900">設備密度</div>
                    <div className="text-blue-700 font-bold">高階 GPU 叢集</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 關鍵數據對比 */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">33x</div>
                <div className="text-xs text-gray-600">最大電力容量提升</div>
                <div className="text-xs text-gray-500">(200kW vs 6kW)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">2x</div>
                <div className="text-xs text-gray-600">樓板載重強度</div>
                <div className="text-xs text-gray-500">(2000kg vs 1000kg)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">&lt;1.3</div>
                <div className="text-xs text-gray-600">PUE 能效目標</div>
                <div className="text-xs text-gray-500">(vs 傳統1.7~2.0)</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: 台灣AI機房市場趨勢
    {
      title: "台灣AI機房市場趨勢",
      subtitle: "升級改造與新建並進的黃金時代",
      content: (
        <div className="h-full flex flex-col justify-center space-y-3">
          {/* 市場動態圖表 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border-2 border-purple-400">
              <div className="text-center mb-2">
                <div className="text-xl font-bold text-purple-700">電信IDC</div>
                <div className="text-xs text-purple-600">業者投入</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">是方電訊 LY2</div>
                  <div className="text-gray-600">投資 30億 | 1,800櫃</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">中華電信</div>
                  <div className="text-gray-600">台南永康 AIDC</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-400">
              <div className="text-center mb-2">
                <div className="text-xl font-bold text-green-700">科技業者</div>
                <div className="text-xs text-green-600">新建專用</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">德晉科技</div>
                  <div className="text-gray-600">100櫃 | 200台AI伺服器</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">A-Top園區</div>
                  <div className="text-gray-600">規劃 12,000櫃</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border-2 border-orange-400">
              <div className="text-center mb-2">
                <div className="text-xl font-bold text-orange-700">政府投資</div>
                <div className="text-xs text-orange-600">國家級建設</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">台南沙崙</div>
                  <div className="text-gray-600">國網中心 AI 機房</div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="font-semibold">200 PF 算力</div>
                  <div className="text-gray-600">2026~2029 建置</div>
                </div>
              </div>
            </div>
          </div>

          {/* 時間軸 */}
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
            <h4 className="font-bold text-gray-800 mb-3 text-center text-base">關鍵里程碑</h4>
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-blue-200"></div>
              <div className="relative grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs">✓</div>
                  <div className="text-xs font-semibold">2024 Q2</div>
                  <div className="text-xs text-gray-600">是方LY2開幕</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs">✓</div>
                  <div className="text-xs font-semibold">2024 Q4</div>
                  <div className="text-xs text-gray-600">上架率70%</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs">→</div>
                  <div className="text-xs font-semibold">2025 Q2</div>
                  <div className="text-xs text-gray-600">中華AIDC啟用</div>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs">○</div>
                  <div className="text-xs font-semibold">2026~</div>
                  <div className="text-xs text-gray-600">國網AI中心</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-500">
            <div className="text-xs text-blue-900">
              <strong>市場趨勢：</strong>傳統IDC升級改造與全新AI專用機房並進，產業龍頭投入巨資搶建算力中心，中小企業傾向租用雲端算力服務
            </div>
          </div>
        </div>
      )
    },

    // Slide 3: 既有IDC升級關鍵
    {
      title: "既有IDC升級AI機房",
      subtitle: "三大關鍵瓶頸與解決方案",
      content: (
        <div className="h-full flex flex-col justify-center space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {/* 樓板載重 */}
            <div className="bg-white rounded-xl p-3 border-2 border-gray-300 shadow-md">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-1">
                  <div className="text-xl">🏗️</div>
                </div>
                <h4 className="font-bold text-gray-800 text-sm">樓板載重</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 rounded p-2">
                  <div className="font-semibold text-red-700">挑戰</div>
                  <div className="text-gray-700">傳統 1,000 kg/㎡<br/>AI需求 &gt;2,000 kg/㎡</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="font-semibold text-green-700">解決方案</div>
                  <div className="text-gray-700">• 加裝鋼樑支撐<br/>• 重載櫃移至一樓<br/>• 限制每櫃設備數</div>
                </div>
              </div>
            </div>

            {/* 電力容量 */}
            <div className="bg-white rounded-xl p-3 border-2 border-gray-300 shadow-md">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-1">
                  <Zap className="text-yellow-600" size={24} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">電力擴容</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 rounded p-2">
                  <div className="font-semibold text-red-700">挑戰</div>
                  <div className="text-gray-700">傳統 12~15 kW/櫃<br/>AI需求 &gt;100 kW/櫃</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="font-semibold text-green-700">解決方案</div>
                  <div className="text-gray-700">• 申請高壓電力<br/>• 升級UPS/PDU<br/>• 改造供電迴路</div>
                </div>
              </div>
            </div>

            {/* 冷卻系統 */}
            <div className="bg-white rounded-xl p-3 border-2 border-gray-300 shadow-md">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-1">
                  <ThermometerSun className="text-blue-600" size={24} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">冷卻升級</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 rounded p-2">
                  <div className="font-semibold text-red-700">挑戰</div>
                  <div className="text-gray-700">氣冷極限 20~30 kW<br/>AI熱密度 &gt;100 kW</div>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <div className="font-semibold text-green-700">解決方案</div>
                  <div className="text-gray-700">• 後門熱交換器<br/>• 側邊水冷機組<br/>• 浸沒式液冷</div>
                </div>
              </div>
            </div>
          </div>

          {/* 改造策略 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border-2 border-blue-300 shadow-lg">
            <h4 className="font-bold text-gray-800 mb-2 text-center text-sm">漸進式改造策略</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div className="bg-white rounded-lg p-2 mb-1 h-14 flex items-center justify-center">
                  <div>
                    <div className="text-lg mb-1">📍</div>
                    <div className="font-semibold text-xs">選擇區域</div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs">挑選樓板最強區塊部署GPU機櫃</div>
              </div>
              <div>
                <div className="bg-white rounded-lg p-2 mb-1 h-14 flex items-center justify-center">
                  <div>
                    <div className="text-lg mb-1">⚡</div>
                    <div className="font-semibold text-xs">升級配電</div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs">該區域增設高功率供電設施</div>
              </div>
              <div>
                <div className="bg-white rounded-lg p-2 mb-1 h-14 flex items-center justify-center">
                  <div>
                    <div className="text-lg mb-1">❄️</div>
                    <div className="font-semibold text-xs">引入液冷</div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs">增設封閉冷熱通道、水冷配管</div>
              </div>
              <div>
                <div className="bg-white rounded-lg p-2 mb-1 h-14 flex items-center justify-center">
                  <div>
                    <div className="text-lg mb-1">🔄</div>
                    <div className="font-semibold text-xs">逐步擴展</div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs">不推倒重來，滿足短中期需求</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: 新建AI機房規劃
    {
      title: "新建AI機房規劃要點",
      subtitle: "一次到位的高規格設計",
      content: (
        <div className="h-full flex flex-col justify-center space-y-2">
          {/* 三大規劃面向 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-400 shadow-md">
              <div className="text-center mb-2">
                <div className="text-lg mb-1">📍</div>
                <h4 className="font-bold text-green-800 text-sm">選址與供電</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>✓ 鄰近變電所或工業區</li>
                <li>✓ 光纖主幹網路經過</li>
                <li>✓ 避開淹水與斷層帶</li>
                <li>✓ 多路高壓電力進線</li>
              </ul>
              <div className="mt-2 bg-white rounded p-2 text-xs">
                <div className="font-semibold text-green-700">案例</div>
                <div className="text-gray-600">是方LY2：台北內湖<br/>國網AI：台南沙崙</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-400 shadow-md">
              <div className="text-center mb-2">
                <div className="text-lg mb-1">🏗️</div>
                <h4 className="font-bold text-blue-800 text-sm">土建結構</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>✓ 樓板承重 2,000+ kg/㎡</li>
                <li>✓ 抗震等級 7 級以上</li>
                <li>✓ 樓層挑高 6 米</li>
                <li>✓ 雙層隔熱牆、無窗</li>
              </ul>
              <div className="mt-2 bg-white rounded p-2 text-xs">
                <div className="font-semibold text-blue-700">規格</div>
                <div className="text-gray-600">LY2：1,800櫃容量<br/>挑高6m、7級抗震</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border-2 border-purple-400 shadow-md">
              <div className="text-center mb-2">
                <div className="text-lg mb-1">⚙️</div>
                <h4 className="font-bold text-purple-800 text-sm">機電系統</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>✓ 每櫃 10~200 kW 供電</li>
                <li>✓ N+1 或 2N 冗餘設計</li>
                <li>✓ 預裝液冷基礎設施</li>
                <li>✓ 智慧監控 DCIM 系統</li>
              </ul>
              <div className="mt-2 bg-white rounded p-2 text-xs">
                <div className="font-semibold text-purple-700">目標</div>
                <div className="text-gray-600">PUE &lt; 1.3<br/>Tier III 認證</div>
              </div>
            </div>
          </div>

          {/* 關鍵技術對比表 */}
          <div className="bg-white rounded-xl p-3 border-2 border-gray-200 shadow-md">
            <h4 className="font-bold text-gray-800 mb-2 text-center text-sm">關鍵技術規格對比</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">項目</th>
                  <th className="p-2 text-center">傳統IDC</th>
                  <th className="p-2 text-center bg-blue-100">新建AI機房</th>
                  <th className="p-2 text-center">提升</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2 font-semibold">電力容量</td>
                  <td className="p-2 text-center">12~15 kW/櫃</td>
                  <td className="p-2 text-center bg-blue-50 font-bold text-blue-700">10~200 kW/櫃</td>
                  <td className="p-2 text-center text-green-600 font-bold">13x</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="p-2 font-semibold">樓板載重</td>
                  <td className="p-2 text-center">1,000 kg/㎡</td>
                  <td className="p-2 text-center bg-blue-50 font-bold text-blue-700">2,000+ kg/㎡</td>
                  <td className="p-2 text-center text-green-600 font-bold">2x</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2 font-semibold">PUE 能效</td>
                  <td className="p-2 text-center">1.7~2.0</td>
                  <td className="p-2 text-center bg-blue-50 font-bold text-blue-700">&lt;1.3</td>
                  <td className="p-2 text-center text-green-600 font-bold">35% ↓</td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="p-2 font-semibold">冷卻技術</td>
                  <td className="p-2 text-center">氣冷</td>
                  <td className="p-2 text-center bg-blue-50 font-bold text-blue-700">液冷 + 氣冷</td>
                  <td className="p-2 text-center text-green-600 font-bold">5x</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 rounded-lg p-2 border-l-4 border-green-500">
            <div className="text-xs text-green-900">
              <strong>永續設計：</strong>屋頂太陽能、Free Cooling、餘熱回收等綠色技術，遠傳TPKC達成PUE 1.46（Tier III認證）
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: 富鴻網商機與策略
    {
      title: "富鴻網商機與發展策略",
      subtitle: "把握AI機房基建黃金時代",
      content: (
        <div className="h-full flex flex-col justify-center space-y-2">
          {/* 四大商機板塊 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 border-2 border-blue-400 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-base">🏢</div>
                <h4 className="font-bold text-blue-800 text-xs">新建專案合作</h4>
              </div>
              <div className="text-xs space-y-1">
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">目標客群</div>
                  <div className="text-gray-600">德晉科技等轉型業者、新創雲端園區</div>
                </div>
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">服務內容</div>
                  <div className="text-gray-600">機房規劃設計 | 供配電方案 | 液冷散熱（Vertiv合作）</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2 border-2 border-green-400 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-base">🔄</div>
                <h4 className="font-bold text-green-800 text-xs">既有機房升級</h4>
              </div>
              <div className="text-xs space-y-1">
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">目標客群</div>
                  <div className="text-gray-600">電信業者、金融機構、企業IDC</div>
                </div>
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">服務內容</div>
                  <div className="text-gray-600">樓板補強 | 機櫃水冷改造 | 模組化升級套件</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-2 border-2 border-purple-400 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-base">☁️</div>
                <h4 className="font-bold text-purple-800 text-xs">算力租賃合作</h4>
              </div>
              <div className="text-xs space-y-1">
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">目標客群</div>
                  <div className="text-gray-600">中小企業、電信商、雲服務商</div>
                </div>
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">服務內容</div>
                  <div className="text-gray-600">共享算力中心建置 | GPU雲租賃業務 | 基建整合</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2 border-2 border-orange-400 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-base">🌱</div>
                <h4 className="font-bold text-orange-800 text-xs">永續能源服務</h4>
              </div>
              <div className="text-xs space-y-1">
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">目標客群</div>
                  <div className="text-gray-600">所有AI機房業者、ESG導向企業</div>
                </div>
                <div className="bg-white rounded p-1.5">
                  <div className="font-semibold text-gray-800">服務內容</div>
                  <div className="text-gray-600">屋頂太陽能 | 儲能系統 | 餘熱回收 | PUE優化</div>
                </div>
              </div>
            </div>
          </div>

          {/* 核心競爭優勢 */}
          <div className="bg-white rounded-xl p-2 border-2 border-gray-200 shadow-md">
            <h4 className="font-bold text-gray-800 mb-2 text-center text-xs">富鴻網核心競爭優勢</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-1.5 mb-1 h-8 flex items-center justify-center">
                  <div className="font-semibold text-blue-800 text-xs">電信級經驗</div>
                </div>
                <div className="text-gray-600 text-xs">UPS、機房工程實績豐富</div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-1.5 mb-1 h-8 flex items-center justify-center">
                  <div className="font-semibold text-green-800 text-xs">國際合作</div>
                </div>
                <div className="text-gray-600 text-xs">Vertiv散熱方案代理</div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-1.5 mb-1 h-8 flex items-center justify-center">
                  <div className="font-semibold text-purple-800 text-xs">整合能力</div>
                </div>
                <div className="text-gray-600 text-xs">從規劃到維運一站式</div>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-lg p-1.5 mb-1 h-8 flex items-center justify-center">
                  <div className="font-semibold text-orange-800 text-xs">綠電技術</div>
                </div>
                <div className="text-gray-600 text-xs">太陽能與儲能經驗</div>
              </div>
            </div>
          </div>

          {/* 市場展望 + 策略建議 合併 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-2 text-white shadow-lg">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-base font-bold mb-0.5">電力 = 算力</div>
                  <div className="text-xs opacity-90">AI時代核心資源</div>
                </div>
                <div>
                  <div className="text-base font-bold mb-0.5">算力 = 國力</div>
                  <div className="text-xs opacity-90">戰略競爭高地</div>
                </div>
                <div>
                  <div className="text-base font-bold mb-0.5">黃金成長期</div>
                  <div className="text-xs opacity-90">產業鏈全面升級</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-2 border-2 border-yellow-500">
              <div className="text-xs text-yellow-900">
                <strong>策略建議：</strong>強化Vertiv等國際合作 | 培養液冷整合團隊 | 布局算力營運模式 | 站上AI時代價值鏈高點
              </div>
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
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Slide Content - 16:9 比例 (1280x720) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{width: '1280px', height: '720px'}}>
          <div className="p-5 flex flex-col h-full">
            {/* Company Header */}
            <div className="mb-2 pb-2 border-b-2 border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h1 className="text-lg font-bold text-blue-700">富鴻網 FDS</h1>
                <p className="text-xs text-gray-600">AI機房市場研究報告</p>
              </div>
              <div className="text-right text-xs text-gray-600">
                <div>臺灣市場分析</div>
                <div>2025年度</div>
              </div>
            </div>

            {/* Slide Title */}
            <div className="mb-2 border-b-4 border-blue-600 pb-2 flex-shrink-0">
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
            <span className="text-xs text-gray-600 font-medium">
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

export default AIDataCenterPresentation;