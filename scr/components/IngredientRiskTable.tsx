import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ingredient } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';

interface IngredientRiskTableProps {
  ingredients: Ingredient[];
}

const IngredientRiskTable: React.FC<IngredientRiskTableProps> = ({ ingredients }) => {
  const { language } = useAppContext();

  // Sort ingredients by risk level (harmful first, then moderate, then healthy)
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const riskOrder = { 'harmful': 0, 'moderate': 1, 'healthy': 2 };
    return riskOrder[a.status] - riskOrder[b.status];
  });

  const getRiskLevelText = (status: string) => {
    if (language === 'zh') {
      switch (status) {
        case 'harmful': return '有害';
        case 'moderate': return '中等風險';
        case 'healthy': return '低風險';
        default: return '中等風險';
      }
    } else {
      switch (status) {
        case 'harmful': return 'Harmful';
        case 'moderate': return 'Moderate';
        case 'healthy': return 'Low Risk';
        default: return 'Moderate';
      }
    }
  };

  const getChildRiskText = (childSafety: string) => {
    if (language === 'zh') {
      switch (childSafety) {
        case 'yes': return '是';
        case 'no': return '否';
        default: return '未知';
      }
    } else {
      switch (childSafety) {
        case 'yes': return 'Yes';
        case 'no': return 'No';
        default: return 'Unknown';
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {language === 'zh' ? '🧪 成分風險分析表' : '🧪 Ingredient Risk Analysis Table'}
      </h3>
      
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">
                {language === 'zh' ? '成分' : 'Ingredient'}
              </TableHead>
              <TableHead className="text-center">
                {language === 'zh' ? '風險等級' : 'Risk Level'}
              </TableHead>
              <TableHead className="text-center">
                {language === 'zh' ? '兒童風險?' : 'Child Risk?'}
              </TableHead>
              <TableHead className="text-center">
                {language === 'zh' ? '標誌' : 'Badge'}
              </TableHead>
              <TableHead className="text-left">
                {language === 'zh' ? '台灣食藥署法規' : 'Taiwan FDA Regulation'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIngredients.map((ingredient, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {language === 'zh' ? ingredient.chinese : ingredient.name}
                </TableCell>
                <TableCell className="text-center">
                  {getRiskLevelText(ingredient.status)}
                </TableCell>
                <TableCell className="text-center">
                  {getChildRiskText(ingredient.childSafety || 'unknown')}
                </TableCell>
                <TableCell className="text-center text-lg">
                  {ingredient.badge || (ingredient.status === 'harmful' ? '🔴' : ingredient.status === 'moderate' ? '🟡' : '🟢')}
                </TableCell>
                <TableCell className="text-sm">
                  {ingredient.taiwanRegulation || (language === 'zh' ? '無特定限制' : 'No specific restriction')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IngredientRiskTable;