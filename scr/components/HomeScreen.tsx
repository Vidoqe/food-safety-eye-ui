import React from "react";
import { Camera, Heart, Leaf, AlertTriangle, Settings, Eye } from "lucide-react";

type Props = {
  onScanLabel?: () => void;
  onManualInput?: () => void;
  onSettings?: () => void;
};

export default function HomeScreen({
  onScanLabel,
  onManualInput,
  onSettings,
}: Props) {
  const handleScanLabel = () => {
    console.log("Scan label clicked");
    onScanLabel?.(); // ✅ THIS is what makes it work
  };

  const handleManualInput = () => {
    console.log("Manual input clicked");
    onManualInput?.(); // ✅ THIS is what makes it work
  };

  const handleSettings = () => {
    console.log("Settings clicked");
    onSettings?.(); // ✅ THIS is what makes it work
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="pt-6 text-center relative">
          {onSettings && (
            <button
              onClick={handleSettings}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Settings"
              type="button"
            >
              <Settings className="w-6 h-6 text-emerald-700" />
            </button>
          )}

          {/* Eye icon */}
          <div className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white/70 shadow-sm">
            <Eye className="h-10 w-10 text-emerald-700" />
          </div>

          <h1 className="text-3xl font-bold text-emerald-800">Food Safety Eye</h1>
          <div className="mt-1 text-xl font-semibold text-emerald-700">食安眼</div>

          <h2 className="mt-3 text-base font-semibold text-emerald-800">
            守護孩子健康，從食品安全開始
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-emerald-700">
            食安眼幫助你快速辨識可能有害成分，為孩子和家人提供更安心的飲食選擇。
            <br />
            讓每一口都安心，每一餐都放心。
          </p>
        </div>

        {/* Trust icons */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-800">Child Safe</div>
            <div className="text-[10px] text-emerald-700">安全兒童</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-800">Healthy</div>
            <div className="text-[10px] text-emerald-700">健康選擇</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-800">Warning</div>
            <div className="text-[10px] text-emerald-700">添加物警示</div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
            <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Eye className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-[10px] font-semibold text-emerald-800">Taiwan</div>
            <div className="text-[10px] text-emerald-700">台灣法規</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleScanLabel}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-3"
            type="button"
          >
            <Camera className="h-6 w-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          <button
            onClick={handleManualInput}
            className="w-full rounded-2xl bg-gray-200 px-4 py-4 text-emerald-800 shadow-md hover:bg-gray-300 active:scale-[0.99] flex items-center justify-center"
            type="button"
          >
            <span className="text-base font-semibold">手動輸入成分</span>
          </button>

          <div className="pt-2 text-center text-xs text-emerald-700">
            先做介紹 ✅ 下一步再接掃描結果與 API
          </div>
        </div>
      </div>
    </div>
  );
}
