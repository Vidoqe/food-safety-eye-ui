import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';

import IngredientAnalysisService from '@/services/ingredientAnalysis';

interface ManualInputScreenProps {
  onBack?: () => void;
  onResult: (result: AnalysisResult) => void;
}

const ManualInputScreen: React.FC<ManualInputScreenProps> = ({ onBack, onResult }) => {
  const { language } = useAppContext();
  const { user } = useUser();

  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const mapVerdictToSafety = (v: 'healthy' | 'moderate' | 'harmful') => {
    switch (v) {
      case 'healthy':
        return '🟢 Safe';
      case 'moderate':
        return '🟡 Moderate';
      case 'harmful':
        return '🔴 Avoid';
      default:
        return '⚪ Unknown';
    }
  };

  const handleAnalyze = async () => {
    if (!ingredients.trim()) return;

    setIsAnalyzing(true);
    setError('');

    try {
      // Use local analyzer (NO JWT/API calls)
      const plan = user?.plan ?? 'free';
      const analysis = await IngredientAnalysisService.analyzeIngredients(ingredients, plan);

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,
        verdict: analysis.verdict,
        tips: analysis.notes ?? [],
        timestamp: new Date(),
        productType: 'Manual Input Analysis',
        isEdible: true,

        // details
        extractedIngredients: analysis.extractedIngredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,
        junkFoodScore: analysis.junkFoodScore ?? 5,
        quickSummary: analysis.summary,
        overallSafety: mapVerdictToSafety(analysis.verdict),
        summary: analysis.summary,

        // optional / extended fields
        productName: analysis.productName,
        barcode: analysis.barcode,
        taiwanWarnings: analysis.taiwanWarnings ?? [],
        scansLeft: analysis.scansLeft,
        creditsExpiry: analysis.creditsExpiry,
        overall_risk: analysis.overall_risk,
        child_safe: analysis.child_safe,
        notes: analysis.notes,
      };

      onResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {language === 'zh' ? '返回' : 'Back'}
        </Button>
        <h2 className="text-xl font-semibold">
          {language === 'zh' ? '手動輸入' : 'Manual Input'}
        </h2>
      </div>

      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">
          {language === 'zh'
            ? '請輸入產品成分（以逗號分隔）'
            : 'Enter product ingredients, separated by commas'}
        </label>

        <Textarea
          rows={6}
          placeholder={
            language === 'zh'
              ? '例如：水、砂糖、苯甲酸鈉、食用色素 Red 40'
              : 'Ingredients: water, sugar, sodium benzoate, Red 40'
          }
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="mb-4"
        />

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <Button onClick={handleAnalyze} disabled={isAnalyzing || !ingredients.trim()}>
          {isAnalyzing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {language === 'zh' ? '開始分析' : 'Start Analysis'}
        </Button>
      </Card>
    </div>
  );
};

export default ManualInputScreen;
