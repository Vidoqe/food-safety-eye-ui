import React from "react";
import { Camera, Heart, Leaf, AlertTriangle, Eye, Settings } from "lucide-react";

type Props = {
  onScanLabel?: () => void;
  onManualInput?: () => void;
  onSettings?: () => void;
};

export default function HomeScreen({ onScanLabel, onManualInput, onSettings }: Props) {
  const handleScanLabel = () => {
    console.log("Scan label clicked");
    onScanLabel?.();
  };

  const handleManualInput = () => {
    console.log("Manual input clicked");
    onManualInput?.();
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    onSettings?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="pt-6 text-center relative">
          {onSettings && (
            <button
              type="button"
              onClick={handleSettings}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-emerald-700" />
            </button>
          )}

          {/* Logo */}
          <div className="mx-auto w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white/70">
            <Eye className="w-10 h-10 text-emerald-700" />
          </div>

          <h1 className="mt-4 text-3xl font-bold text-emerald-800">Food Safety Eye</h1>
          <div className="mt-1 font-semibold text-emerald-700">食安眼</div>

          <div className="mt-3 text-sm text-emerald-700 font-semibold">
            守護孩子健康，從食品安全開始
          </div>
          <div className="mt-2 text-xs text-emerald-700/90 leading-relaxed">
            食安眼幫助你快速辨識可能有害成分，為孩子和家人提供更安心的飲食選擇。
            <br />
            讓每一口都安心，每一餐都放心。
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-pink-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">Child Safe</div>
            <div className="text-[10px] text-emerald-700">安全兒童</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">Healthy</div>
            <div className="text-[10px] text-emerald-700">健康選擇</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">Warning</div>
            <div className="text-[10px] text-emerald-700">添加物警示</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Eye className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">Taiwan</div>
            <div className="text-[10px] text-emerald-700">台灣法規</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleScanLabel}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Camera className="h-6 w-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          <button
            type="button"
            onClick={handleManualInput}
            className="w-full rounded-2xl bg-white/80 px-4 py-4 text-emerald-800 shadow-md hover:bg-white active:scale-[0.99] flex items-center justify-center"
          >
            <span className="text-base font-semibold">手動輸入成分</span>
          </button>

          <div className="pt-2 text-center text-xs text-emerald-700">
            先做介紹 ✅ 下一步再連接掃描結果與 API
          </div>
        </div>
      </div>
    </div>
  );
}
