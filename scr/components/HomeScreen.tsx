import React from "react";
import { Button } from "@/components/ui/button";
import AppLogo from "./AppLogo";
import TrustIcons from "./TrustIcons";
import { Camera, Settings } from "lucide-react";
import { useAppContext } from "../context/AppContext";

type HomeScreenProps = {
  onScanLabel: () => void;
  onManualInput: () => void;
  onSettings: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanLabel,
  onManualInput,
  onSettings,
}) => {
const { language } = useAppContext();
  const isZh = language === "zh";

  const handleScanLabel = () => {
    console.log("[HomeScreen] Scan Label clicked");
    onScanLabel();
  };

  const handleManualInput = () => {
    console.log("[HomeScreen] Manual Input clicked");
    onManualInput();
  };

  const handleSettings = () => {
    console.log("[HomeScreen] Settings clicked");
    onSettings();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Top right settings */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSettings}
            className="rounded-full bg-white/80 backdrop-blur p-2 shadow hover:bg-white"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>

        {/* Logo (your circle + eye is inside AppLogo; do NOT change it) */}
        <div className="mt-4">
          <AppLogo size="large" showText />
        </div>

        {/* Trust icons row */}
        <div className="mt-6">
          <TrustIcons language={language} />
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
         {/* Scan label button (GREEN) */}
<Button
  type="button"
  onClick={handleScanLabel}
  className="w-full h-14 text-lg font-semibold shadow bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
>
  <Camera className="w-6 h-6" />
  <span>{isZh ? "掃描產品標籤" : "Scan Label"}</span>
</Button>
          
            
          {/* Manual input button (NOT PINK) */}
         <Button
  type="button"
  onClick={handleManualInput}
  variant="outline"
  className="w-full h-14 text-lg font-semibold shadow
bg-sky-300 hover:bg-sky-400
border border-sky-500
text-sky-900"
>
  {isZh ? "手動輸入成分" : "Manual Input"}
</Button>

          {/* helper line (optional, harmless) */}
          <div className="text-center text-xs text-green-700/80">
            先做介紹 ✓ 下一步再連接掃描結果與 API
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
