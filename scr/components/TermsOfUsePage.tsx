import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/AppLogo';

interface TermsOfUsePageProps {
  onBack: () => void;
}

const TermsOfUsePage: React.FC<TermsOfUsePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <AppLogo size="medium" showText={true} />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-green-800">
              📃 《使用條款》Terms of Use
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3">【English】</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  By using this app, you agree not to misuse its content or services. All information provided is for educational and informational use only.
                </p>
                <p>
                  You may subscribe for NT$49/month to unlock premium features. Subscriptions auto-renew monthly unless cancelled. No refunds will be given for partially used periods. Cancellation must be done through your payment provider before the next billing cycle.
                </p>
                <p>
                  We reserve the right to change prices or features at any time with notice.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">【中文】</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  使用本應用程式即表示您同意不會濫用其內容或服務。所有資訊僅供教育與參考之用。
                </p>
                <p>
                  您可選擇每月訂閱 NT$49 解鎖進階功能。訂閱將自動每月續約，除非提前取消。已使用之期間不予退款，取消需在下一個扣款日前透過付款平台完成。
                </p>
                <p>
                  我們保留隨時更改價格與功能的權利。
                </p>
              </div>
            </div>
            
            <Button
              onClick={onBack}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              返回 Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfUsePage;