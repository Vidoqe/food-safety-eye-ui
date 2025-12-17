import React from "react";
import {
  Camera,
  Heart,
  Leaf,
  AlertTriangle,
  Settings,
  Eye,
} from "lucide-react";

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
              onClick={handleSettings}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Settings"
              type="button"
            >
              <Settings className="w-6 h-6 text-emerald-700" />
            </button>
          )}

          {/* Eye icon */}
          <div className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <Eye className="text-emerald-700 w-12 h-12" />
          </div>

          <h1 className="text-3xl font-bold text-emerald-800">
            Food Safety Eye
          </h1>
          <div className="mt-1 text-xl font-semibold text-emerald-700">
            食安眼
          </div>

          <p className="mt-3 text-sm leading-relaxed text-emerald-700">
            守護孩子健康，從食品安全開始
            <br />
            食安眼幫助你快速辨識可能有害成分
          </p>
        </div>

        {/* Trust icons */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <Trust icon={<Heart />} label="Child Safe" zh="安全兒童" />
          <Trust icon={<Leaf />} label="Healthy" zh="健康選擇" />
          <Trust icon={<AlertTriangle />} label="Warning" zh="添加物警示" />
          <Trust icon={<Eye />} label="Taiwan" zh="台灣法規" />
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
            className="w-full rounded-2xl bg-emerald-100 px-4 py-4 text-emerald-800 shadow-sm hover:bg-emerald-200 active:scale-[0.99]"
            type="button"
          >
            <span className="text-base font-semibold">手動輸入成分</span>
          </button>

          <div className="pt-2 text-center text-xs text-emerald-700">
            先做介紹 ✓ 下一步再接掃描 API
          </div>
        </div>
      </div>
    </div>
  );
}

function Trust({
  icon,
  label,
  zh,
}: {
  icon: React.ReactNode;
  label: string;
  zh: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
      <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
      <div className="text-[10px] font-semibold text-emerald-800">
        {label}
      </div>
      <div className="text-[10px] text-emerald-700">
        {zh}
      </div>
    </div>
  );
}
