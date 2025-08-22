import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';

interface FirstLaunchPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onPrivacyPolicy: () => void;
  onTermsOfUse: () => void;
}

const FirstLaunchPrompt: React.FC<FirstLaunchPromptProps> = ({
  isOpen,
  onClose,
  onPrivacyPolicy,
  onTermsOfUse
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <AppLogo size="medium" showText={true} />
          <DialogTitle className="text-center text-lg font-bold text-green-800 mt-4">
            歡迎使用《食安眼》Food Safety Eye 👁️
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 px-4">
          <p className="text-sm text-gray-700 text-center">
            在開始使用本應用程式前，請先閱讀並同意以下政策：
          </p>
          
          <div className="space-y-2">
            <button
              onClick={onPrivacyPolicy}
              className="w-full text-left p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              📄《隱私政策》Privacy Policy
            </button>
            
            <button
              onClick={onTermsOfUse}
              className="w-full text-left p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              📃《使用條款》Terms of Use
            </button>
          </div>
          
          <p className="text-xs text-gray-600 text-center">
            ✅ 按下「同意並繼續」即表示您已閱讀並同意上述條款與政策。
          </p>
          
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            🔘 同意並繼續
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstLaunchPrompt;