import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface PlanComparisonTableProps {
  onUpgrade: () => void;
}

const PlanComparisonTable: React.FC<PlanComparisonTableProps> = ({ onUpgrade }) => {
  const { language, plan } = useUser();
  const isZh = language === 'zh';

  const plans = [
    {
      id: 'free',
      name: isZh ? '免費' : 'Free',
      scans: 5,
      records: 5,
      price: 'NT$0',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    {
      id: 'premium',
      name: isZh ? '高級' : 'Premium',
      scans: 30,
      records: 20,
      price: 'NT$49',
      icon: <Star className="w-5 h-5 text-blue-500" />
    },
    {
      id: 'gold',
      name: isZh ? '黃金' : 'Gold',
      scans: 50,
      records: 50,
      price: 'NT$69',
      icon: <Crown className="w-5 h-5 text-yellow-500" />
    }
  ];

  const getButtonText = (planId: string) => {
    if (plan === planId) {
      return isZh ? '目前方案' : 'Current Plan';
    }
    if (planId === 'free') {
      return isZh ? '選擇方案' : 'Choose Plan';
    }
    return isZh ? '選擇方案' : 'Choose Plan';
  };

  const isCurrentPlan = (planId: string) => plan === planId;

  return (
    <Card className="p-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        {isZh ? '比較方案與升級' : 'Compare Plans & Upgrade'}
      </h2>
      
      <div className="space-y-3 mb-4">
        {plans.map((planItem) => (
          <Card key={planItem.id} className={`p-3 border-2 ${isCurrentPlan(planItem.id) ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {planItem.icon}
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{planItem.name}</h3>
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p>{planItem.scans} {isZh ? '次掃描/月' : 'scans/month'}</p>
                    <p>{planItem.records} {isZh ? '個保存記錄' : 'saved records'}</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-medium text-sm text-gray-800 mb-2 whitespace-nowrap">{planItem.price}</p>
                <Button 
                  onClick={() => !isCurrentPlan(planItem.id) && onUpgrade()}
                  disabled={isCurrentPlan(planItem.id)}
                  size="sm"
                  className={`text-xs px-2 py-1 ${isCurrentPlan(planItem.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white whitespace-nowrap`}
                >
                  {getButtonText(planItem.id)}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center text-xs text-gray-600">
        {isZh 
          ? '享受完整的成分安全分析與家庭健康守護'
          : 'Enjoy full ingredient safety and family health analysis.'}
      </div>
    </Card>
  );
};

export default PlanComparisonTable;