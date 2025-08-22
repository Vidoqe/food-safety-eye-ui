import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'credits' | 'upgrade';
  plan?: 'premium' | 'gold';
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, type, plan }) => {
  const { language, user, upgradeUser, addBonusScans } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const isZh = language === 'zh';

  const getTitle = () => {
    if (type === 'credits') {
      return isZh ? '購買額外掃描點數' : 'Buy Extra Credits';
    }
    return isZh ? '升級方案' : 'Upgrade Plan';
  };

  const getPrice = () => {
    if (type === 'credits') return 'NT$20';
    if (plan === 'premium') return 'NT$49';
    if (plan === 'gold') return 'NT$69';
    return 'NT$0';
  };

  const getDescription = () => {
    if (type === 'credits') {
      return isZh ? '10 次額外掃描（本月有效）' : '10 extra scans (valid this month)';
    }
    if (plan === 'premium') {
      return isZh ? '30 次掃描/月，保存 20 個記錄' : '30 scans/month, save 20 records';
    }
    if (plan === 'gold') {
      return isZh ? '50 次掃描/月，保存 50 個記錄' : '50 scans/month, save 50 records';
    }
    return '';
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      if (type === 'credits') {
        await addBonusScans(10);
        toast({
          title: isZh ? '購買成功！' : 'Purchase Successful!',
          description: isZh ? '已添加 10 次額外掃描' : '10 extra scans added',
        });
      } else if (plan) {
        await upgradeUser(plan);
        toast({
          title: isZh ? '升級成功！' : 'Upgrade Successful!',
          description: isZh ? `已升級至 ${plan === 'premium' ? '高級' : '黃金'}版` : `Upgraded to ${plan}`,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: isZh ? '處理失敗' : 'Payment Failed',
        description: isZh ? '請稍後再試' : 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{getDescription()}</span>
              <span className="text-xl font-bold text-green-600">{getPrice()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              {isZh ? '安全付款' : 'Secure Payment'}
            </div>
          </Card>
          
          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing 
                ? (isZh ? '處理中...' : 'Processing...') 
                : (isZh ? `付款 ${getPrice()}` : `Pay ${getPrice()}`)}
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
            >
              {isZh ? '取消' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;