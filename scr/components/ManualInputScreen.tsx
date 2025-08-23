import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';

// Local text analyzer (no JWT/API required)
import IngredientAnalysisService from '@/services/ingredientAnalysis';

interface ManualInputScreenProps {
  onBack?: () => void;
  onResult: (result: AnalysisResult) => void;
}

const ManualInputScreen: React.FC<ManualInputScreenProps> = ({ onBack, onResult }) => {
  const { language } = useAppContext();
  const { user } = useUser();

  const [ingredients, setIngredients] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Map internal verdict to the UI "overallSafety" label
  const mapVerdictToSafety = (v: 'healthy' | 'moderate' | 'harmful'): string => {
    switch (v) {
      case 'healthy':
        return language === 'zh' ? '安全' : 'Safe';
      case 'moderate':
        return language === 'zh' ? '中等' : 'Moderate';
      case 'harmful':
        return language === 'zh' ? '避免' : 'Avoid';
      default:
        return language === 'zh' ? '未知' : 'Unknown';
    }
  };

  const handleAnalyze = async () => {
    if (!ingredients.trim()) {
      setError(language === 'zh' ? '請輸入成分清單' : 'Please enter ingredients.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const plan: 'free' | 'premium' | 'gold' = (user?.plan as any) ?? 'free';

      // Use local analyzer (no JWT/API calls)
      const analysis = await IngredientAnalysisService.analyzeIngredients(ingredients, plan);

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,
        verdict: analysis.verdict,
        tips: analysis.tips ?? [],
        timestamp: new Date(),
        productType: 'Manual Input Analysis',
        isEdible: true,
        extractedIngredients: analysis.extractedIngredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,
        junkFoodScore: analysis.junkFoodScore ?? 5,
        quickSummary: analysis.summary,
        overallSafety: mapVerdictToSafety(analysis.verdict),
        summary: analysis.summary,
        productName: analysis.productName,
        barcode: analysis.barcode,
        taiwanWarnings: analysis.taiwanWarnings,
        scansLeft: analysis.scansLeft,
        creditsExpiry: analysis.creditsExpiry,
        overall_risk: analysis.overall_risk,
        child_safe: analysis.child_safe,
        notes: analysis.notes,
      };

      setIsAnalyzing(false);
      onResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);

      // Fallback dummy result so UI still renders
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
        junkFoodScore: 5,
        quickSummary: language === 'zh' ? '分析失敗' : 'Analysis failed',
        overallSafety: language === 'zh' ? '未知' : 'Unknown',
        summary: language === 'zh' ? '分析失敗' : 'Analysis failed',
        productName: '',
        barcode: '',
        taiwanWarnings: [],
        scansLeft: 0,
        creditsExpiry: '',
        overall_risk: '',
        child_safe: false,
        notes: [],
      };

      onResult(errorResult);
      setError(language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card className="p-4">
        <div className="mb-2 text-xl font-semibold">
          {language === 'zh' ? '手動輸入' : 'Manual Input'}
        </div>

        <Textarea
          placeholder={
            language === 'zh'
              ? '請以逗號分隔輸入成分，例如：water, sugar, sodium benzoate'
              : 'Enter ingredients separated by commas, e.g., water, sugar, sodium benzoate'
          }
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={6}
        />

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

        <div className="mt-4 flex items-center gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} disabled={isAnalyzing}>
              {language === 'zh' ? '返回' : 'Back'}
            </Button>
          )}
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing
              ? language === 'zh' ? '分析中…' : 'Analyzing…'
              : language === 'zh' ? '開始分析' : 'Start Analysis'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ManualInputScreen;

