import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IngredientRiskAnalysisProps {
  ingredients: any[];
  language: 'zh' | 'en';
}

const IngredientRiskAnalysis: React.FC<IngredientRiskAnalysisProps> = ({ 
  ingredients, 
  language 
}) => {
  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'harmful':
        return <Badge className="bg-red-500 text-white">🔴</Badge>;
      case 'moderate':
        return <Badge className="bg-yellow-500 text-white">🟡</Badge>;
      case 'healthy':
      case 'safe':
        return <Badge className="bg-green-500 text-white">🟢</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">🟡</Badge>;
    }
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">⚠️</div>
          <div className="text-lg font-semibold text-gray-800">
            {language === 'zh' ? 'Ingredient Risk Analysis (台灣食品風險分析)' : 'Ingredient Risk Analysis (Taiwan Food Risk Analysis)'}
          </div>
        </div>
        
        {ingredients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 font-medium text-gray-800">
                    {language === 'zh' ? 'Ingredient' : 'Ingredient'}
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-800">
                    {language === 'zh' ? 'Risk Level' : 'Risk Level'}
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-800">
                    {language === 'zh' ? 'Child Risk' : 'Child Risk'}
                  </th>
                  <th className="py-2 px-3 font-medium text-gray-800">
                    {language === 'zh' ? 'Badge' : 'Badge'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((item: any, index: number) => {
                  const ingredient = item.name || item.ingredient || item.chinese;
                  const riskLevel = item.riskLevel || item.status || 'moderate';
                  const childSafety = item.childSafety || 'Yes';
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-700">
                        <div>
                          <div className="font-medium">{ingredient}</div>
                          {item.chinese && item.chinese !== ingredient && (
                            <div className="text-xs text-gray-500">{item.chinese}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-700 capitalize">{riskLevel}</td>
                      <td className="py-2 px-3 text-gray-700">{childSafety}</td>
                      <td className="py-2 px-3">{getRiskBadge(riskLevel)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            {language === 'zh' ? 'No ingredients detected for analysis.' : 'No ingredients detected for analysis.'}
          </p>
        )}
      </div>
    </Card>
  );
};

export default IngredientRiskAnalysis;