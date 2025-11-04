import React from "react";

type HomeScreenProps = {
  onScanLabel: () => void;
  onScanBarcode: () => void;
  onManualInput: () => void;
  onSettings: () => void;
  onScanHistory: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanLabel,
  onScanBarcode,
  onManualInput,
  onSettings,
  onScanHistory,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-100 text-emerald-900">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-6 pt-6">
        {/* Top logo + title */}
        <header className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full bg-white shadow-md ring-4 ring-emerald-200 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight text-emerald-900">
              Food Safety Eye
            </h1>
            <p className="text-base font-semibold text-emerald-800">
              食安眼
            </p>
            <p className="text-xs text-emerald-700">
              守護孩子健康，從食品安全開始
            </p>
          </div>
        </header>

        {/* Main hero card */}
        <section className="mt-1 rounded-2xl bg-white p-4 shadow-md">
          <p className="text-sm text-emerald-800 mb-3">
            食安眼幫助家長識別有害成分，為孩子和家人提供安全的飲食選擇。
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs text-emerald-800">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 px-2 py-2">
              <span className="text-xl">👶</span>
              <span className="font-semibold">Child Safe</span>
              <span className="text-[11px] text-emerald-700">兒童安全</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 px-2 py-2">
              <span className="text-xl">🌿</span>
              <span className="font-semibold">Healthy Choice</span>
              <span className="text-[11px] text-emerald-700">健康選擇</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 px-2 py-2">
              <span className="text-xl">⚠️</span>
              <span className="font-semibold">Additive Warning</span>
              <span className="text-[11px] text-emerald-700">添加物警示</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 px-2 py-2">
              <span className="text-xl">🛡️</span>
              <span className="font-semibold">Taiwan Rules</span>
              <span className="text-[11px] text-emerald-700">台灣法規</span>
            </div>
          </div>

          {/* Big primary action button */}
          <button
            onClick={onScanLabel}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:bg-emerald-800"
          >
            <span className="text-lg">📷</span>
            <span className="leading-tight text-left">
              拍攝產品標籤
              <br />
              <span className="text-[11px] opacity-90">Scan Product Label</span>
            </span>
          </button>
        </section>

        {/* Secondary actions */}
        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={onManualInput}
            className="flex flex-col items-start gap-1 rounded-2xl bg-white p-3 text-left shadow-sm hover:bg-emerald-50"
          >
            <span className="text-lg">📝</span>
            <span className="text-sm font-semibold text-emerald-900">
              Input ingredient list
            </span>
            <span className="text-[11px] text-emerald-700">
              文字掃描 / 手動輸入
            </span>
          </button>

          <button
            onClick={onScanBarcode}
            className="flex flex-col items-start gap-1 rounded-2xl bg-white p-3 text-left shadow-sm hover:bg-emerald-50"
          >
            <span className="text-lg">🏷️</span>
            <span className="text-sm font-semibold text-emerald-900">
              Scan barcode
            </span>
            <span className="text-[11px] text-emerald-700">
              條碼比對產品資訊
            </span>
          </button>

          <button
            onClick={onScanHistory}
            className="flex flex-col items-start gap-1 rounded-2xl bg-white p-3 text-left shadow-sm hover:bg-emerald-50"
          >
            <span className="text-lg">📜</span>
            <span className="text-sm font-semibold text-emerald-900">
              View history
            </span>
            <span className="text-[11px] text-emerald-700">
              過去掃描紀錄
            </span>
          </button>

          <button
            onClick={onSettings}
            className="flex flex-col items-start gap-1 rounded-2xl bg-white p-3 text-left shadow-sm hover:bg-emerald-50"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-semibold text-emerald-900">
              Settings & plan
            </span>
            <span className="text-[11px] text-emerald-700">
              語言 / 帳號 / 方案
            </span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;
