import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ingredient } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';

interface IngredientTableProps {
  ingredients: Ingredient[];
}

const IngredientTable: React.FC<IngredientTableProps> = ({ ingredients }) => {
  const { language } = useAppContext();

  const getRiskBadge = (status: string) => {
    switch (status) {
      case 'harmful':
        return <Badge className="bg-red-100 text-red-800 border-red-200">🔴</Badge>;
      case 'moderate':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">🟡</Badge>;
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">🟢</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">🟡</Badge>;
    }
  };

  const getRiskLevel = (status: string) => {
    if (language === 'zh') {
      switch (status) {
        case 'harmful': return '有害';
        case 'moderate': return '中等';
        case 'healthy': return '低風險';
        default: return '中等';
      }
    } else {
      switch (status) {
        case 'harmful': return 'Harmful';
        case 'moderate': return 'Moderate';
        case 'healthy': return 'Low';
        default: return 'Moderate';
      }
    }
  };

  const getChildSafety = (childRisk: boolean) => {
    if (language === 'zh') {
      return childRisk ? '否' : '是';
    } else {
      return childRisk ? 'No' : 'Yes';
    }
  };

  if (ingredients.length === 0) {
    return (
      <Card className="p-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <p className="text-center text-gray-600">
          {language === 'zh' ? '未發現台灣管制物質' : 'No Taiwan-regulated substances found'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {language === 'zh' ? '台灣管制物質分析表' : 'Taiwan-Regulated Substances Analysis'}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                {language === 'zh' ? '成分' : 'Ingredient'}
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                {language === 'zh' ? '風險等級' : 'Risk Level'}
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                {language === 'zh' ? '兒童安全' : 'Child Safety'}
              </th>
              <th className="text-left py-2 px-1 font-medium text-gray-700">
                {language === 'zh' ? '標記' : 'Badge'}
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, index) => {
              // Extract English and Chinese names from the formatted name
              const nameParts = ingredient.name.split(' / ');
              const englishName = nameParts[0] || ingredient.name;
              const chineseName = nameParts[1] || ingredient.chinese;
              
              return (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-1 text-gray-800">
                    <div className="font-medium">{englishName}</div>
                    {chineseName && (
                      <div className="text-xs text-gray-500">({chineseName})</div>
                    )}
                  </td>
                  <td className="py-2 px-1 text-gray-700">
                    {getRiskLevel(ingredient.status)}
                  </td>
                  <td className="py-2 px-1 text-gray-700">
                    {getChildSafety(ingredient.childRisk)}
                  </td>
                  <td className="py-2 px-1">
                    {getRiskBadge(ingredient.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Detailed reason information */}
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">
          {language === 'zh' ? '詳細資訊：' : 'Detailed Information:'}
        </h4>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">{ingredient.name.split(' / ')[0]}:</span> {ingredient.reason}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default IngredientTable;