import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { CheckCircle, Crown, AlertCircle } from 'lucide-react';

interface ScanLimitDialogProps {
  open: boolean;
  onClose: () => void;
  onUpgrade?: (plan: 'premium' | 'gold') => void;
}

const ScanLimitDialog: React.FC<ScanLimitDialogProps> = ({ 
  open, 
  onClose, 
  onUpgrade 
}) => {
  const { user, language, upgradeUser, getScanStatusMessage } = useUser();

  if (!user) return null;

  const isZh = language === 'zh';
  const statusMessage = getScanStatusMessage();

  const handleUpgrade = async (plan: 'premium' | 'gold') => {
    await upgradeUser(plan);
    onUpgrade?.(plan);
    onClose();
  };

  const isSubscriptionInactive = !user.subscriptionActive;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-red-600">
            {isSubscriptionInactive 
              ? (isZh ? '訂閱已停用' : 'Subscription Inactive')
              : (isZh ? '掃描次數不足' : 'No Scans Left')
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {statusMessage && (
            <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700 text-center">
                {statusMessage}
              </p>
            </div>
          )}
          
          {isSubscriptionInactive ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {isZh 
                  ? '重新啟用訂閱以使用您的掃描次數。'
                  : 'Reactivate your subscription to use your scan credits.'}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => handleUpgrade('premium')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isZh ? '重新啟用 Premium' : 'Reactivate Premium'}
                </Button>
                
                <Button 
                  onClick={() => handleUpgrade('gold')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {isZh ? '重新啟用 Gold' : 'Reactivate Gold'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3">
                  🎯 {isZh ? '升級解鎖更多功能：' : 'Upgrade to unlock more:'}
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">
                    {isZh ? 'Premium：30次掃描/月，最多60次累積' : 'Premium: 30 scans/month, max 60 rollover'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">
                    {isZh ? 'Gold：30次掃描/月，最多100次累積' : 'Gold: 30 scans/month, max 100 rollover'}
                  </span>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600 py-2">
                🔓 {isZh ? '未使用的掃描次數可累積至下個月（30天後到期）' : 'Unused scans roll over to next month (expire after 30 days)'}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ScanLimitDialog };
export default ScanLimitDialog;