import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface TaiwanHealthWarningsProps {
  warnings?: string[];
  ingredients: any[];
  language: 'zh' | 'en';
}

const TaiwanHealthWarnings: React.FC<TaiwanHealthWarningsProps> = ({ 
  warnings = [], 
  ingredients, 
  language 
}) => {
  // Generate warnings based on ingredients if not provided
  const generateWarnings = () => {
    const generatedWarnings: string[] = [];
    
    ingredients.forEach(ingredient => {
      if (ingredient.riskLevel === 'harmful' || ingredient.status === 'harmful') {
        if (ingredient.childSafety === 'No' || ingredient.childSafety === false) {
          generatedWarnings.push(
            `⚠️ ${ingredient.name || ingredient.ingredient} is not suitable for children`
          );
        }
        if (ingredient.taiwanRegulation && ingredient.taiwanRegulation !== 'No specific restriction') {
          generatedWarnings.push(
            `🚫 ${ingredient.name || ingredient.ingredient}: ${ingredient.taiwanRegulation}`
          );
        }
      }
    });
    
    // Add general tip
    generatedWarnings.push(
      '📌 Tip: Avoid artificial colorings, sweeteners, and preservatives especially for young kids.'
    );
    
    return generatedWarnings;
  };

  const displayWarnings = warnings.length > 0 ? warnings : generateWarnings();

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🧒</div>
          <div className="text-lg font-semibold text-gray-800">
            {language === 'zh' ? 'Taiwan-Specific Health Warnings (台灣兒童與健康警示)' : 'Taiwan-Specific Health Warnings (Taiwan Child & Health Alerts)'}
          </div>
        </div>
        
        <div className="space-y-2">
          {displayWarnings.length > 0 ? (
            displayWarnings.map((warning, index) => (
              <Alert key={index} className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  {warning}
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 text-sm">
                ✅ {language === 'zh' ? 'No specific Taiwan health warnings detected.' : 'No specific Taiwan health warnings detected.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TaiwanHealthWarnings;