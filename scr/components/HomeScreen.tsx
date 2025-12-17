import React from "react";
import {
  Camera,
  Heart,
  Leaf,
  AlertTriangle,
  Settings
} from "lucide-react";

// 👁️ LOGO IMAGE (NOT lucide)
import eyeLogo from "../assets/eye.png";

type Props = {
  onScanLabel: () => void;
  onManualInput: () => void;
  onSettings?: () => void;
};

export default function HomeScreen({
  onScanLabel,
  onManualInput,
  onSettings,
}: Props) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="pt-6 text-center relative">
          {onSettings && (
            <button
              onClick={onSettings}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              aria-label="Settings"
              type="button"
            >
              <Settings className="w-6 h-6 text-emerald-700" />
            </button>
          )}

          {/* 👁️ IMAGE LOGO */}
          <div className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white">
            <img src={eyeLogo} alt="Food Safety Eye" className="h-16 w-16" />
          </div>

          <h1 className="text-3xl font-bold text-emerald-800">
            Food Safety Eye
          </h1>
          <div className="mt-1 text-xl font-semibold text-emerald-700">
            食安眼
          </div>

          <p className="mt-3 text-sm text-emerald-700 leading-relaxed">
            守護孩子健康，從食品安全開始
            <br />
            為孩子和家人提供更安心的飲食選擇
          </p>
        </div>

        {/* Trust cards */}
        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          <Trust icon={<Heart />} title="Child Safe" sub="安全兒童" />
          <Trust icon={<Leaf />} title="Healthy" sub="健康選擇" />
          <Trust icon={<AlertTriangle />} title="Warning" sub="添加物警示" />
          <Trust icon={<img src={eyeLogo} className="h-6 w-6" />} title="Taiwan" sub="台灣法規" />
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          {/* SCAN LABEL */}
          <button
            onClick={onScanLabel}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-4 text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-3"
          >
            <Camera className="h-6 w-6" />
            <span className="text-base font-semibold">掃描產品標籤</span>
          </button>

          {/* MANUAL INPUT */}
          <button
            onClick={onManualInput}
            className="w-full rounded-2xl bg-emerald-100 px-4 py-4 text-emerald-800 shadow-sm hover:bg-emerald-200 flex items-center justify-center"
          >
            <span className="text-base font-semibold">手動輸入成分</span>
          </button>
        </div>

        <div className="pt-3 text-center text-xs text-emerald-700">
          先做介紹 ☑ 下一步再接掃描與 API
        </div>
      </div>
    </div>
  );
}

function Trust({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm">
      <div className="mx-auto mb-2 h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
      <div className="text-[10px] font-semibold text-emerald-800">{title}</div>
      <div className="text-[10px] text-emerald-700">{sub}</div>
    </div>
  );
}
