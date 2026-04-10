import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface JunkFoodScoreInfoProps {
  onBack: () => void;
}

const JunkFoodScoreInfo: React.FC<JunkFoodScoreInfoProps> = ({ onBack }) => {
  const { language } = useAppContext();

  const content = {
    en: {
      title: 'What is the Junk Food Score?',
      description: 'The Junk Food Score rates how processed or risky a product is, on a scale from 1 to 10.',
      scoringLogic: 'Scoring logic:',
      clean: 'Clean, natural ingredients',
      mild: 'Mildly processed, some preservatives',
      harmful: 'Contains harmful additives, artificial ingredients, or banned substances',
      disclaimer: 'This score is based on ingredient types — not brand judgment — and is designed to help you make more informed, child-safe decisions.'
    },
    zh: {
      title: '什麼是 Junk Food 分數？',
      description: 'Junk Food 分數評估產品的加工程度或風險等級，評分範圍為 1 到 10 分。',
      scoringLogic: '評分邏輯：',
      clean: '天然、乾淨的成分',
      mild: '輕度加工，含有一些防腐劑',
      harmful: '含有有害添加劑、人工成分或禁用物質',
      disclaimer: '此分數基於成分類型評估，非品牌判斷，旨在幫助您做出更明智、對兒童更安全的選擇。'
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{t.description}</p>
            
            <div>
              <h3 className="font-semibold mb-3">{t.scoringLogic}</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <span className="font-medium">1–3:</span>
                    <span className="ml-2 text-gray-700">{t.clean}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <span className="font-medium">4–6:</span>
                    <span className="ml-2 text-gray-700">{t.mild}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <span className="font-medium">7–10:</span>
                    <span className="ml-2 text-gray-700">{t.harmful}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">{t.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JunkFoodScoreInfo;