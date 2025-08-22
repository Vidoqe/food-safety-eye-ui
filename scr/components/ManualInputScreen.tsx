import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Type } from 'lucide-react';
import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/utils/translations';
import { GPTImageAnalysisService } from '@/services/gptImageAnalysis';
import { ScanLimitDialog } from '@/components/ScanLimitDialog';

interface ManualInputScreenProps {
  onBack: () => void;
  onResult: (result: AnalysisResult, error?: string) => void;
}

const ManualInputScreen: React.FC<ManualInputScreenProps> = ({ onBack, onResult }) => {
  const { language } = useAppContext();
  const { user, canScan, incrementScanCount } = useUser();
  const t = useTranslation(language);
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!ingredients.trim()) return;
    
    if (!canScan) {
      setShowLimitDialog(true);
      return;
    }

    const scanSuccess = await incrementScanCount();
    if (!scanSuccess) {
      setShowLimitDialog(true);
      return;
    }

    setIsAnalyzing(true);
    setError('');
    
    try {
      // Use 食安眼 (Food Safety Eye) analyzeProduct method
      const analysis = await GPTImageAnalysisService.analyzeProduct(
        undefined,
        ingredients,
        undefined,
        language === 'zh' ? 'zh' : 'en'
      );

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,
        verdict: analysis.verdict,
        tips: analysis.notes || [],
        timestamp: new Date(),
        productType: 'Manual Input Analysis',
        isEdible: true,
        extractedIngredients: analysis.extractedIngredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,
        junkFoodScore: analysis.junkFoodScore || 5,
        quickSummary: analysis.summary,
        overallSafety: analysis.overallSafety,
        summary: analysis.summary,
        productName: analysis.productName,
        barcode: analysis.barcode,
        taiwanWarnings: analysis.taiwanWarnings,
        scansLeft: analysis.scansLeft,
        creditsExpiry: analysis.creditsExpiry,
        overall_risk: analysis.overall_risk,
        child_safe: analysis.child_safe,
        notes: analysis.notes
      };
      
      setIsAnalyzing(false);
      onResult(result);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      
      // Create a dummy result for error display
      const errorResult: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: [],
        verdict: 'moderate',
        tips: [],
        timestamp: new Date(),
        productType: 'Error',
        isEdible: false,
        extractedIngredients: [],
        keyDetectedSubstances: [],
        isNaturalProduct: false,
        regulatedAdditives: [],
        junkFoodScore: 0,
        quickSummary: 'Error'
      };
      
      onResult(errorResult, '掃描失敗，請再試一次。');
    }
  };

  const getBadgeFromRisk = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'harmful': return '🔴';
      case 'moderate': return '🟡';
      case 'healthy': return '🟢';
      default: return '🟡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-green-800">
            {language === 'zh' ? '手動輸入成分' : 'Manual Input'}
          </h1>
        </div>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Type className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                {language === 'zh' 
                  ? '請輸入產品成分，用逗號分隔' 
                  : 'Enter product ingredients, separated by commas'}
              </p>
            </div>

            <Textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder={language === 'zh' 
                ? '例如：阿斯巴甜, 咖啡因, 牛磺酸, 檸檬酸' 
                : 'e.g., Aspartame, Caffeine, Taurine, Citric Acid'}
              className="min-h-32 resize-none"
              disabled={isAnalyzing}
            />

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !ingredients.trim()}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Type className="w-5 h-5 mr-2" />
              )}
              {isAnalyzing 
                ? (language === 'zh' ? '分析中...' : 'Analyzing...')
                : (language === 'zh' ? '開始分析' : 'Start Analysis')
              }
            </Button>
          </div>
        </Card>
      </div>
      
      <ScanLimitDialog 
        open={showLimitDialog}
        onClose={() => setShowLimitDialog(false)}
      />
    </div>
  );
};

export default ManualInputScreen;