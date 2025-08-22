import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { CheckCircle, Crown } from 'lucide-react';

interface UpgradePromptProps {
  onUpgrade?: (plan: 'premium' | 'gold') => void;
  onClose?: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ onUpgrade, onClose }) => {
  const { user, language, upgradeUser } = useUser();

  if (!user) return null;

  const isZh = language === 'zh';

  const handleUpgrade = async (plan: 'premium' | 'gold') => {
    await upgradeUser(plan);
    onUpgrade?.(plan);
    onClose?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-red-600">
          {isZh ? '您已達到掃描限制' : "You've reached your scan limit."}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {isZh 
            ? '免費用戶每月可掃描 5 次產品，僅保存最近 5 次掃描記錄。'
            : 'Free Plan users can scan up to 5 products per month and view only the last 5 scan records.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3">
            🎯 {isZh ? '升級解鎖更多功能：' : 'Upgrade to unlock more:'}
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">
              {isZh ? 'Premium 方案 – NT$49/月：30 次掃描/月 & 保存 20 個產品' : 'Premium Plan – NT$49/month: 30 scans/month & save up to 20 products'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">
              {isZh ? 'Gold 方案 – NT$69/月：50 次掃描/月 & 保存 50 個產品' : 'Gold Plan – NT$69/month: 50 scans/month & save up to 50 products'}
            </span>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600 py-2">
          🔓 {isZh ? '保留完整掃描記錄，更好地保護您的家人。' : 'Keep your full scan history and protect your family better.'}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => handleUpgrade('premium')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isZh ? '升級至 Premium – NT$49' : 'Upgrade to Premium – NT$49'}
          </Button>
          
          <Button 
            onClick={() => handleUpgrade('gold')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isZh ? '升級至 Gold – NT$69' : 'Go Gold – NT$69'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};