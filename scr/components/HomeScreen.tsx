// scr/components/HomeScreen.tsx
import React from "react";
import { Shield, Heart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useTranslation } from "@/utils/translations";
import { useScanHistory } from "@/hooks/useScanHistory";
import { useUser } from "@/contexts/UserContext";
import { useAppContext } from "@/contexts/AppContext";

import AppLogo from "./AppLogo";
import TrustIcons from "./TrustIcons";
interface HomeScreenProps {
  onScanLabel: () => void;
  onScanBarcode: () => void;
  onManualInput: () => void;
  onSettings: () => void;
  onScanHistory: () => void;
  onApiTest: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onScanLabel, 
  onScanBarcode, 
  onManualInput,
  onSettings, 
  onScanHistory,
  onApiTest
}) => {
  const { language } = useAppContext();
  const { user, creditSummary } = useUser();
  const { scanHistory } = useScanHistory();
  const t = useTranslation(language);

  return (
<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* App Header with Logo */}
        <div className="mb-8">
          <AppLogo size="large" showText={true} className="mt-6" />
          
          {/* Child Safety Focused Tagline */}
          <div className="text-center mt-4 px-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-green-700 mb-2">
              {language === 'zh' ? '守護孩子健康，從食品安全開始' : 'Protecting Children\'s Health Through Food Safety'}
            </h2>
            <p className="text-green-600 text-sm leading-relaxed">
              {language === 'zh' 
                ? '食安眼幫助家長識別有害成分，為孩子和家人提供安全的飲食選擇。讓每一口都安心，每一餐都放心。'
                : 'Food Safety Eye helps parents identify risky ingredients, ensuring safe food choices for children and families. Every bite matters, every meal counts.'}
            </p>
            
            {/* Trust Icons */}
            <TrustIcons language={language} />
          </div>
        </div>

{/* Scan Credits Display */}
        {user && creditSummary && (
          <Card className="p-4 mb-6 bg-white/90 backdrop-blur-sm border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                {language === 'zh' ? '掃描次數餘額' : 'Scan Credits Balance'}
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {creditSummary.totalCredits}
              </div>
              {creditSummary.expiringCredits > 0 && (
                <div className="flex items-center justify-center text-orange-600 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {language === 'zh' 
                    ? `${creditSummary.expiringCredits} 次掃描將在 ${creditSummary.daysUntilExpiry} 天後到期`
                    : `${creditSummary.expiringCredits} credits expire in ${creditSummary.daysUntilExpiry} days`}
                </div>
              )}
            </div>
          </Card>
        )}

{/* Action Buttons */}
        <div className="space-y-4 mt-8">
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onScanLabel}
              className="w-full h-16 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold shadow-lg"
            >
              <Camera className="w-6 h-6 mr-3" />
              {language === 'zh' ? '掃描產品標籤' : 'Scan Product Label'}
            </Button>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onScanBarcode}
              className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold shadow-lg"
            >
              <Scan className="w-6 h-6 mr-3" />
              {language === 'zh' ? '掃描條碼' : 'Scan Barcode'}
            </Button>
          </Card>

<Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onManualInput}
              className="w-full h-16 bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold shadow-lg"
            >
              <Type className="w-6 h-6 mr-3" />
              {language === 'zh' ? '手動輸入成分' : 'Manual Input'}
            </Button>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onApiTest}
              className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-lg"
            >
              <Code className="w-6 h-6 mr-3" />
              {language === 'zh' ? 'API 測試' : 'API Test'}
            </Button>
          </Card>

<Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onScanHistory}
              variant="outline"
              className="w-full h-16 border-purple-300 text-purple-700 hover:bg-purple-50 text-lg font-semibold relative"
            >
              <History className="w-6 h-6 mr-3" />
              {language === 'zh' ? '掃描記錄' : 'Scan History'}
              {scanHistory.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {scanHistory.length}
                </span>
              )}
            </Button>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onSettings}
              variant="outline"
              className="w-full h-16 border-green-300 text-green-700 hover:bg-green-50 text-lg font-semibold"
            >
              <Settings className="w-6 h-6 mr-3" />
              {language === 'zh' ? '設定' : 'Settings'}
            </Button>
          </Card>
        </div>

        {/* Plan Info */}
        {user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-green-600">
              {language === 'zh' ? '當前方案：' : 'Current Plan: '}
<span className="font-semibold">
                {user.subscriptionPlan === 'gold' ? (language === 'zh' ? '黃金' : 'Gold') :
                 user.subscriptionPlan === 'premium' ? (language === 'zh' ? '高級' : 'Premium') :
                 (language === 'zh' ? '免費' : 'Free')}
              </span>
              {!user.subscriptionActive && (
                <span className="text-red-500 ml-2">
                  ({language === 'zh' ? '已停用' : 'Inactive'})
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;

