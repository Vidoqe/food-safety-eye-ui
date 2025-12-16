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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4">
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

          <div className="mx-auto mb-4 h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <Eye className="h-14 w-14 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-emerald-800">
            Food Safety Eye
          </h1>
          <div className="text-emerald-700 font-semibold">食安眼</div>

          <p className="mt-3 text-sm text-emerald-700">
            守護孩子健康，從食品安全開始
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center text-xs">
          <Feature icon={<Heart className="text-emerald-600" />} label="Child Safe" sub="安全兒童" />
          <Feature icon={<Leaf className="text-emerald-600" />} label="Healthy" sub="健康選擇" />
          <Feature icon={<AlertTriangle className="text-orange-600" />} label="Warning" sub="添加物警示" />
          <Feature icon={<Eye className="text-emerald-600" />} label="Taiwan" sub="台灣法規" />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleScanLabel}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-white shadow hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-3"
            type="button"
          >
            <Camera className="h-6 w-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          <button
            onClick={handleManualInput}
            className="w-full rounded-2xl bg-white/80 px-4 py-3 text-emerald-700 shadow hover:bg-white active:scale-[0.99]"
            type="button"
          >
            手動輸入成分
          </button>
        </div>

        <div className="pt-3 text-center text-xs text-emerald-700">
          先做介紹 ✅ 下一步再接掃描與 API
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
      <div className="mx-auto mb-1 h-9 w-9 flex items-center justify-center rounded-full bg-emerald-50">
        {icon}
      </div>
      <div className="font-semibold text-emerald-800">{label}</div>
      <div className="text-emerald-700">{sub}</div>
    </div>
  );
}
