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
import AppLogo from './AppLogo';
import AuthPanel from './AuthPanel';

interface SettingsScreenProps {
  onBack: () => void;
  onPrivacyPolicy?: () => void;
  onTermsOfUse?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onPrivacyPolicy, onTermsOfUse }) => {
  const { language, setLanguage, } = useAppContext();
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

  const [paymentNotice, setPaymentNotice] = useState(false);
  const handleUpgradeClick = () => setPaymentNotice(true);
  const handleBuyCreditsClick = () => setPaymentNotice(true);
  const handleUpgradeFromModal = () => setPaymentNotice(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Logo */}
        <div className="mb-6">
          <AppLogo size="medium" showText={true} className="mt-6 mb-6" />
          <div className="flex items-center justify-center">
            <Button type="button" variant="ghost" onClick={onBack} className="absolute left-4 top-4 gap-2 text-green-800"
              aria-label={language === 'zh' ? '返回首頁' : 'Back to Home'}>
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
              <span>{language === 'zh' ? '返回首頁' : 'Back to Home'}</span>
            </Button>
            <h1 className="text-xl font-bold text-green-800">{language === 'zh' ? '方案與設定' : 'Plans & Settings'}</h1>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <AuthPanel />
          {paymentNotice && <Card className="p-4" role="status">
            <p>{language === 'zh' ? '線上付款尚未開放，方案及點數購買即將推出。' : 'Online payments are not available yet. Plan upgrades and credit purchases are coming soon.'}</p>
            <Button variant="outline" onClick={() => setPaymentNotice(false)} className="mt-2">{language === 'zh' ? '關閉' : 'Close'}</Button>
          </Card>}

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
