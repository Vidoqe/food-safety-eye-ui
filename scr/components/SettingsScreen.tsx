import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Globe, Info, Trash2, FileText, Shield } from 'lucide-react';
import { useAppContext, Language } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import { toast } from '@/components/ui/use-toast';
import PlanComparisonTable from './PlanComparisonTable';
import ExtraCreditsSection from './ExtraCreditsSection';
import PaymentModal from './PaymentModal';
import { UpgradePrompt } from './UpgradePrompt';

interface SettingsScreenProps {
  onBack: () => void;
  onPrivacyPolicy?: () => void;
  onTermsOfUse?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onPrivacyPolicy, onTermsOfUse }) => {
  const { language, setLanguage, clearHistory } = useAppContext();
  const { user, language: userLanguage, setLanguage: setUserLanguage } = useUser();
  const t = useTranslation(language);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'credits' | 'upgrade'>('credits');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'gold'>('premium');

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setUserLanguage(newLanguage === 'zh' ? 'zh' : 'en');
    toast({
      title: newLanguage === 'en' ? 'Language changed to English' : '語言已更改為中文',
      duration: 2000,
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: t.historyCleared,
      duration: 2000,
    });
  };

  const getPlanDisplayName = () => {
    if (!user) return language === 'zh' ? '免費版' : 'Free';
    
    switch (user.subscriptionPlan) {
      case 'premium':
        return language === 'zh' ? '高級版' : 'Premium';
      case 'gold':
        return language === 'zh' ? '黃金版' : 'Gold';
      default:
        return language === 'zh' ? '免費版' : 'Free';
    }
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleBuyCreditsClick = () => {
    setPaymentType('credits');
    setShowPaymentModal(true);
  };

  const handleUpgradeFromModal = (plan: 'premium' | 'gold') => {
    setSelectedPlan(plan);
    setPaymentType('upgrade');
    setShowUpgradeModal(false);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
       {/* Header */}
<div className="relative flex flex-col items-center pt-6 pb-2">
  <Button
    variant="ghost"
    onClick={onBack}
    className="absolute left-2 top-2"
    aria-label="Back"
  >
    <ArrowLeft className="w-5 h-5" />
  </Button>

  {/* Circle around the eye only (no text in the logo component) */}
  <AppLogo size="large" showText={false} className="mb-4" />

  <h1 className="text-2xl font-bold text-green-800">Food Safety Eye</h1>
  <div className="text-lg font-semibold text-green-700 mt-1">食安眼</div>

  <div className="text-3xl font-bold text-green-800 mt-4">{t.settings}</div>
</div>


        <div className="space-y-4 mt-8">
          {/* Current Plan */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {language === 'zh' ? '當前方案' : 'Current Plan'}: {getPlanDisplayName()}
              </h2>
              {user && (
                <>
                  <p className="text-sm text-gray-600">
                    {user.scansUsed}/{user.maxScans + user.bonusScans} scans used this month
                  </p>
                  {user.bonusScans > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      (+{user.bonusScans} bonus scans)
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Plan Comparison */}
          <PlanComparisonTable onUpgrade={handleUpgradeClick} />

          {/* Extra Credits */}
          <ExtraCreditsSection onBuyCredits={handleBuyCreditsClick} />

          {/* Language Settings */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">{t.language}</h2>
            </div>
            <div className="space-y-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('en')}
                className={`w-full justify-start ${language === 'en' ? 'bg-green-500 hover:bg-green-600' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
              >
                {t.english}
              </Button>
              <Button
                variant={language === 'zh' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('zh')}
                className={`w-full justify-start ${language === 'zh' ? 'bg-green-500 hover:bg-green-600' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
              >
                {t.chinese}
              </Button>
            </div>
          </Card>

          {/* Legal Documents */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">
                {language === 'zh' ? '法律文件' : 'Legal Documents'}
              </h2>
            </div>
            <div className="space-y-2">
              {onPrivacyPolicy && (
                <Button
                  onClick={onPrivacyPolicy}
                  variant="outline"
                  className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  📄 {language === 'zh' ? '隱私政策' : 'Privacy Policy'}
                </Button>
              )}
              {onTermsOfUse && (
                <Button
                  onClick={onTermsOfUse}
                  variant="outline"
                  className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  📃 {language === 'zh' ? '使用條款' : 'Terms of Use'}
                </Button>
              )}
            </div>
          </Card>

          {/* Clear History */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={handleClearHistory}
              variant="outline"
              className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              {t.clearHistory}
            </Button>
          </Card>

          {/* App Info */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <Info className="w-5 h-5 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-800">{t.appInfo}</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> 2024.01</p>
              <p className="pt-2">
                Safe food, safe family / 吃得安心，全家放心
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <UpgradePrompt 
              onUpgrade={handleUpgradeFromModal}
              onClose={() => setShowUpgradeModal(false)}
            />
          </div>
        </div>
      )}

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type={paymentType}
        plan={selectedPlan}
      />
    </div>
  );
};

export default SettingsScreen;