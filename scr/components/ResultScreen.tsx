import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import HealthReportDisplay from './HealthReportDisplay';

interface ResultScreenProps {
  result: AnalysisResult;
  onBack: () => void;
  onHome: () => void;
  onJunkFoodInfo: () => void;
  error?: string;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onBack, onHome, onJunkFoodInfo, error }) => {
  const { language } = useAppContext();
  const { user } = useUser();
  const t = useTranslation(language);
  const isPremium = user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'gold';

  // If there's an error or no result, show error message without returning to dashboard
  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-green-800">
              {language === 'zh' ? '掃描結果' : 'Scan Results'}
            </h1>
          </div>
          
          <div className="p-6 shadow-lg border-2 border-red-500 bg-red-50 mb-4 rounded-lg">
            <div className="text-center text-red-600 font-medium">
              ❌ No result – please try another image.
            </div>
          </div>
          
          <Button
            onClick={onBack}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {language === 'zh' ? '重新掃描' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  // Transform result data for HealthReportDisplay
  const transformedIngredients = (result.ingredients || []).map(ingredient => ({
    name: ingredient.name,
    riskLevel: ingredient.riskLevel === 'healthy' ? 'safe' : ingredient.riskLevel as 'safe' | 'moderate' | 'harmful',
    risk_level: ingredient.riskLevel === 'healthy' ? 'safe' : ingredient.riskLevel as 'safe' | 'moderate' | 'harmful',
    childRisk: ingredient.childRisk || false,
    child_risk: ingredient.childRisk || false,
    badge: ingredient.badge,
    chinese: ingredient.chinese
  }));

  const overallRisk = result.verdict === 'healthy' ? 'safe' : result.verdict as 'safe' | 'moderate' | 'harmful';
  const overall_risk = result.overall_risk || overallRisk;
  const child_safe = result.child_safe;
  const notes = result.notes || result.taiwanWarnings || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center mb-6 px-4">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-green-800">
            {language === 'zh' ? '掃描結果' : 'Scan Results'}
          </h1>
        </div>

        {/* Health Report Display */}
        <div className="bg-white rounded-lg shadow-lg mx-4 mb-6">
          <HealthReportDisplay 
            ingredients={transformedIngredients}
            overallRisk={overallRisk}
            overall_risk={overall_risk}
            childSafe={result.child_safe}
            child_safe={child_safe}
            notes={notes}
            taiwanWarnings={result.taiwanWarnings}
          />
        </div>

        <div className="space-y-3 px-4">
          <Button
            onClick={onBack}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {language === 'zh' ? '重新掃描' : 'Scan Again'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;