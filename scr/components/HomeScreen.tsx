import React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Camera, Settings, ArrowLeft, Clock } from "lucide-react";

import { useAppContext } from "@/contexts/AppContext";
import { useTranslation } from "@/utils/translations";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useUser } from "@/contexts/UserContext";

import AppLogo from "./AppLogo";
import TrustIcons from "./TrustIcons";

type Props = {
  onScanLabel: () => void;       // Scan Ingredients / Label
  onManualInput: () => void;     // Manual ingredients input
  onSettings: () => void;        // Settings screen
  onBack?: () => void;           // Optional back button if you want it
};

export default function HomeScreen({
  onScanLabel,
  onManualInput,
  onSettings,
  onBack,
}: Props) {
  const { language } = useAppContext();
  const t = useTranslation(language);

  const { user, creditSummary } = useUser();
  const { scanHistory } = useScanHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-md relative">
        {/* Top buttons */}
        <div className="absolute top-3 left-3 z-10">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-full bg-white/80 backdrop-blur p-2 shadow-sm hover:bg-white"
              aria-label="Back"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 text-green-700" />
            </button>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onSettings}
            className="rounded-full bg-white/80 backdrop-blur p-2 shadow-sm hover:bg-white"
            aria-label="Settings"
            type="button"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>

        {/* Logo (Eye + circle) */}
        <div className="pt-8 flex flex-col items-center">
          <AppLogo size="large" showText={true} className="mt-6" />

          <div className="text-center mt-4 px-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              {language === "zh"
                ? "守護孩子健康，從食品安全開始"
                : "Protecting Children's Health Through Food Safety"}
            </h2>

            <p className="text-green-600 text-sm leading-relaxed">
              {language === "zh"
                ? "食安眼幫助你快速辨識可能有害成分，為孩子和家人提供更安心的飲食選擇。讓每一口都安心，每一餐都放心。"
                : "Food Safety Eye helps you identify risky ingredients quickly, supporting safer choices for children and families."}
            </p>
          </div>

          {/* Trust icons row */}
          <div className="mt-6 w-full">
            <TrustIcons language={language} />
          </div>

          {/* Credits (optional, keep your existing logic) */}
          {user && creditSummary && (
            <Card className="p-4 mt-6 w-full bg-white/90 backdrop-blur border border-green-200">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-700 mb-1">
                  {language === "zh" ? "掃描次數餘額" : "Scan Credits Balance"}
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {creditSummary.totalCredits}
                </div>

                {creditSummary.expiringCredits > 0 && (
                  <div className="mt-2 flex items-center justify-center text-orange-600 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {language === "zh"
                      ? `有 ${creditSummary.expiringCredits} 次將於 ${creditSummary.daysUntilExpiry} 天後到期`
                      : `${creditSummary.expiringCredits} credits expire in ${creditSummary.daysUntilExpiry} days`}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action buttons (NO BARCODE) */}
          <div className="w-full mt-8 space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
              <Button
                onClick={onScanLabel}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow-lg"
                type="button"
              >
                <Camera className="w-6 h-6 mr-3" />
                {language === "zh" ? "掃描產品標籤" : "Scan Product Label"}
              </Button>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur border-0 shadow-lg">
              <Button
                onClick={onManualInput}
                className="w-full h-16 bg-pink-200 hover:bg-pink-300 text-green-900 text-lg font-semibold shadow-lg"
                type="button"
              >
                {language === "zh" ? "手動輸入成分" : "Manual Input"}
              </Button>
            </Card>

            {/* (Optional) Keep your scanHistory button if you want it later:
                If you don’t want it, delete this whole block. */}
            {scanHistory && scanHistory.length > 0 && (
              <div className="text-center text-xs text-green-700 opacity-80">
                {language === "zh"
                  ? `已有 ${scanHistory.length} 筆掃描紀錄`
                  : `${scanHistory.length} scans in history`}
              </div>
            )}
          </div>

          {/* Small footer hint */}
          <div className="mt-4 text-center text-xs text-green-700/70">
            {language === "zh"
              ? "先做介紹 ✓ 下一步再連接掃描結果與 API"
              : "Intro first ✓ Next step: connect scan results to API"}
          </div>
        </div>
      </div>
    </div>
  );
}
