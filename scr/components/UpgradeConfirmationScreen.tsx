import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';

interface UpgradeConfirmationScreenProps {
  plan: 'premium' | 'gold';
  onStartScanning: () => void;
}

const UpgradeConfirmationScreen: React.FC<UpgradeConfirmationScreenProps> = ({ 
  plan, 
  onStartScanning 
}) => {
  const { language } = useUser();
  const t = useTranslation(language);

  const getPlanDetails = () => {
    if (plan === 'premium') {
      return {
        scanLimit: 30,
        historyLimit: 20,
        planName: language === 'zh' ? '高級版' : 'Premium'
      };
    } else {
      return {
        scanLimit: 50,
        historyLimit: 50,
        planName: language === 'zh' ? '黃金版' : 'Gold'
      };
    }
  };

  const { scanLimit, historyLimit, planName } = getPlanDetails();

  const getMessage = () => {
    if (language === 'zh') {
      return `您已升級！感謝您升級到${planName}。您現在每月有${scanLimit}次掃描，可以保存${historyLimit}條掃描記錄。盡情享受完整的食品安全和家庭健康功能。`;
    } else {
      return `You're Upgraded! Thank you for upgrading to ${planName}. You now have ${scanLimit} scans/month and can save ${historyLimit} scan records. Enjoy full access to ingredient safety and family health features.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            {language === 'zh' ? '升級成功！' : 'You\'re Upgraded!'}
          </h1>
          <p className="text-gray-700 leading-relaxed">
            {getMessage()}
          </p>
        </div>
        
        <Button 
          onClick={onStartScanning}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-lg"
        >
          {language === 'zh' ? '開始掃描' : 'Start Scanning'}
        </Button>
      </Card>
    </div>
  );
};

export default UpgradeConfirmationScreen;