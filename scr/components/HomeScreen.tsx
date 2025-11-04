         // scr/components/HomeScreen.tsx
import React from "react";

interface HomeScreenProps {
  // Support both names so we don't have to touch App.tsx
  onScanLabel?: () => void;
  onScanBarcode?: () => void;
  onManualInput: () => void;
  onSettings: () => void;
  onScanHistory: () => void;
  onApiTest?: () => void;
}

export default function HomeScreen({
  onScanLabel,
  onScanBarcode,
  onManualInput,
  onSettings,
  onScanHistory,
  onApiTest,
}: HomeScreenProps) {
  const handleScanClick = () => {
    if (onScanBarcode) {
      onScanBarcode();
    } else if (onScanLabel) {
      onScanLabel();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex flex-col items-center px-4 pb-10">
      {/* top logo / eye */}
      <header className="w-full max-w-md pt-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 rounded-full border-4 border-emerald-500 bg-emerald-50 shadow-lg flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-emerald-700 border-4 border-emerald-200" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-emerald-800">Food Safety Eye</h1>
        <p className="text-lg text-emerald-700 mt-1">食安眼</p>

        <p className="mt-4 text-base font-semibold text-emerald-900">
          守護孩子健康，從食品安全開始
        </p>
        <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
          食安眼幫助家長識別有害成分，為孩子和家人提供安全的飲食選擇。
          讓每一口都安心，每一餐都放心。
        </p>
      </header>

      {/* feature icons */}
      <section className="w-full max-w-md mt-8 grid grid-cols-2 gap-y-6 text-sm text-emerald-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">😊</span>
          <div>
            <div className="font-semibold">Child Safe / 安全兒童</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-semibold">Healthy Choice / 健康選擇</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold">Additive Warning / 添加物警示</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className="font-semibold">Taiwan Rules / 台灣法規</div>
          </div>
        </div>
      </section>

      {/* main buttons */}
      <main className="w-full max-w-md mt-10 space-y-4">
        {/* main scan button */}
        <button
          onClick={handleScanClick}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-semibold text-lg shadow-md hover:bg-emerald-600 active:bg-emerald-700 transition"
        >
          拍攝產品標籤
        </button>

        {/* secondary actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onScanHistory}
            className="py-3 rounded-xl bg-blue-500 text-white text-sm font-medium shadow hover:bg-blue-600 active:bg-blue-700 transition"
          >
            查看掃描紀錄
          </button>

          <button
            onClick={onManualInput}
            className="py-3 rounded-xl bg-amber-500 text-white text-sm font-medium shadow hover:bg-amber-600 active:bg-amber-700 transition"
          >
            手動輸入成分
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onSettings}
            className="py-3 rounded-xl bg-slate-200 text-slate-800 text-sm font-medium shadow hover:bg-slate-300 active:bg-slate-400 transition"
          >
            設定 &amp; 偏好
          </button>

          {onApiTest && (
            <button
              onClick={onApiTest}
              className="py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow hover:bg-black active:bg-black/80 transition"
            >
              API 測試
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
