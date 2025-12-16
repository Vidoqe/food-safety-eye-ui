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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="mx-auto max-w-md px-4">
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

          <div className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-emerald-500 flex items-center justify-center">
            <Eye className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-bold text-emerald-800">
            Food Safety Eye
          </h1>
          <div className="text-emerald-700 font-semibold">食安眼</div>

          <p className="mt-3 text-sm text-emerald-700 leading-relaxed">
            守護孩子健康，從食品安全開始<br />
            食安眼幫助你快速辨識可能有害成分
          </p>
        </div>

        {/* Feature Icons */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <Feature icon={<Heart className="w-5 h-5 text-emerald-600" />} title="Child Safe" sub="安全兒童" />
          <Feature icon={<Leaf className="w-5 h-5 text-emerald-600" />} title="Healthy" sub="健康選擇" />
          <Feature icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} title="Warning" sub="添加物警示" />
          <Feature icon={<Eye className="w-5 h-5 text-emerald-600" />} title="Taiwan" sub="台灣法規" />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleScanLabel}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-white shadow hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-3"
            type="button"
          >
            <Camera className="w-6 h-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          <button
            onClick={handleManualInput}
            className="w-full rounded-2xl bg-white px-4 py-4 text-emerald-700 shadow hover:bg-emerald-50 active:scale-[0.99] flex items-center justify-center gap-3"
            type="button"
          >
            <span className="text-base font-semibold">手動輸入成分</span>
          </button>
        </div>

        <div className="pt-3 text-center text-xs text-emerald-700">
          先做介面 ✔️ 下一步再接掃描與 API
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-white/70 p-3 shadow-sm">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
        {icon}
      </div>
      <div className="text-[11px] font-semibold text-emerald-800">{title}</div>
      <div className="text-[10px] text-emerald-700">{sub}</div>
    </div>
  );
}
