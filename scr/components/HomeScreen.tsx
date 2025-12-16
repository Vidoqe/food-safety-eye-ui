import React from "react";
import { Camera, Scan, Heart, Leaf, AlertTriangle, Settings } from "lucide-react";
import { Eye } from "lucide-react";


type Props = {
  // Optional callbacks (use whichever your app already passes)
  onScanLabel?: () => void;
  onScanBarcode?: () => void;
  onManualInput?: () => void;
  onSettings?: () => void;

  // If your Index.tsx currently uses onScan(payload), we accept it too
  onScan?: (payload: any) => void | Promise<void>;
};

export default function HomeScreen({
  onScanLabel,
  onScanBarcode,
  onManualInput,
  onSettings,
  onScan,
 
}: Props) {

  const handleScanLabel = () => {
    if (onScanLabel) return onScanLabel();
    if (onScan) return onScan({ type: "label" });
    if (onManualInput) return onManualInput();
    console.log("Scan label clicked");
  };
const handleSettings = () => {
  onSettings?.();
};

  const handleScanBarcode = () => {
    if (onScanBarcode) return onScanBarcode();
    if (onScan) return onScan({ type: "barcode" });
    console.log("Scan barcode clicked");
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
                <div className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center">
  <span className="text-emerald-700 text-[40px] leading-none">👁️</span>
</div>
          <h1 className="text-3xl font-bold text-emerald-800">Food Safety Eye</h1>
          <div className="mt-1 text-xl font-semibold text-emerald-700">食安眼</div>

          
          <h2 className="mt-3 text-base font-semibold text-emerald-800">
            守護孩子健康，從食品安全開始
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-emerald-700">
            食安眼幫助家長辨識可能有害成分，為孩子和家人提供更安心的飲食選擇。
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
              <Eye className="h-10 w-10 text-emerald-600" />
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
          >
            <Camera className="h-6 w-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          <button
            onClick={handleScanBarcode}
            className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-white shadow-md hover:bg-blue-700 active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <Scan className="h-6 w-6" />
            <span className="text-base font-semibold">掃描條碼</span>
          </button>

          <div className="pt-2 text-center text-xs text-emerald-700">
            先做介面 ✅ 下一步再接掃描流程與 API
          </div>
        </div>
      </div>
    </div>
  );
}
// force git change
