import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ExtraCreditsSectionProps {
  onBuyCredits: () => void;
}

const ExtraCreditsSection: React.FC<ExtraCreditsSectionProps> = ({ onBuyCredits }) => {
  const { language } = useUser();
  const isZh = language === 'zh';

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center mb-4">
        <CreditCard className="w-5 h-5 text-green-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-800">
          {isZh ? '購買額外掃描點數' : 'Buy Extra Credits'}
        </h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        {isZh 
          ? '本月需要更多掃描嗎？NT$20 可購買 10 次額外掃描（單次付款）'
          : 'Need more scans this month? NT$20 for 10 extra scans (one-time purchase).'}
      </p>
      
      <Button 
        onClick={onBuyCredits}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      >
        {isZh ? '購買點數' : 'Buy Extra Credits'}
      </Button>
    </Card>
  );
};

export default ExtraCreditsSection;