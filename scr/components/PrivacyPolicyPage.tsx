import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/AppLogo';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <AppLogo size="medium" showText={true} />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-green-800">
              《隱私政策》 Privacy Policy
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-700">【English】</h3>
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  We value your privacy and are committed to protecting your personal information. This app does not collect or store any personal data without your explicit permission.
                </p>
                <p>
                  All subscription payments are processed securely through Google Play. No payment information is stored on our servers, ensuring your financial data remains protected.
                </p>
                <p>
                  Subscription is entirely optional. We offer two plans: Premium plan at NT$49 per month and Gold plan at NT$69 per month. You can cancel your subscription at any time through your Google Play account settings.
                </p>
                <p>
                  We are committed to transparency and will never share your information with third parties without your consent.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3 text-green-700">【中文】</h3>
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  我們重視您的隱私，致力於保護您的個人資訊。本應用程式不會在未經您明確許可的情況下收集或儲存任何個人資料。
                </p>
                <p>
                  所有訂閱付款均透過 Google Play 安全處理。您的付款資訊不會儲存在我們的伺服器上，確保您的財務資料受到保護。
                </p>
                <p>
                  訂閱完全為選擇性功能。我們提供兩種方案：高級方案月費 NT$49，黃金方案月費 NT$69。您可隨時透過 Google Play 帳戶設定取消訂閱。
                </p>
                <p>
                  我們承諾保持透明，絕不會在未經您同意的情況下與第三方分享您的資訊。
                </p>
              </div>
            </div>
            
            <Button
              onClick={onBack}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
            >
              返回 Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;