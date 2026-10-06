import React, { useState } from 'react';

// use local (relative) imports to avoid alias issues
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

import { useAppContext, type AnalysisResult } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';


// GPT analyzer (image + text). We’ll use it for manual text too.
import GPTImageAnalysisService, { type GPTAnalysisResult } from '../services/gptImageAnalysis';

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

  // Map internal verdict to the UI "overallSafety" label (respect language)
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
      setError(language === 'zh' ? '請輸入成分' : 'Please enter ingredients.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const gpt = await GPTImageAnalysisService.analyzeProduct(
        undefined, ingredients, language === 'zh' ? 'zh' : 'en'
      );

      // Build the UI result
      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: gpt.ingredients ?? [],
        verdict: gpt.verdict ?? 'moderate',
        tips: gpt.tips ?? [],
        timestamp: new Date(),
       resultLanguage: language === 'zh' ? 'zh' : 'en',

        productType: 'Manual Input Analysis',
        isEdible: true,

        extractedIngredients: gpt.extractedIngredients ?? [],
        keyDetectedSubstances: gpt.regulatedAdditives ?? [],
        isNaturalProduct: gpt.isNaturalProduct ?? false,
        regulatedAdditives: gpt.regulatedAdditives ?? [],
        junkFoodScore: gpt.junkFoodScore ?? 5,

        quickSummary: gpt.quickSummary ?? gpt.summary ?? '',
        overallSafety: mapVerdictToSafety(gpt.verdict ?? 'moderate'),
        summary: gpt.summary ?? gpt.quickSummary ?? '',

        productName: gpt.productName ?? '',
        barcode: gpt.barcode ?? '',
        taiwanWarnings: gpt.taiwanWarnings ?? [],

        // Optional extras (kept if your UI shows them)
        scansLeft: gpt.scansLeft,
        creditsExpiry: gpt.creditsExpiry,
        overall_risk: gpt.overall_risk,
        child_safe: gpt.child_safe,
        notes: gpt.notes ?? [],
      };

      setIsAnalyzing(false);
      onResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : (language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" onClick={onBack}>
        ← {language === 'zh' ? '返回' : 'Back'}
      </Button>

      <Card className="p-5 space-y-4">
        <h2 className="text-xl font-semibold">
          {language === 'zh' ? '手動輸入成分' : 'Manual Input'}
        </h2>

        <Textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={
            language === 'zh'
              ? '例如：水、糖、苯甲酸鈉、阿斯巴甜'
              : 'e.g., water, sugar, sodium benzoate, aspartame'
          }
          className="min-h-40"
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing
              ? language === 'zh'
                ? '分析中…'
                : 'Analyzing…'
              : language === 'zh'
              ? '開始分析'
              : 'Start Analysis'}
          </Button>
          <Button variant="outline" onClick={() => setIngredients('')} disabled={isAnalyzing}>
            {language === 'zh' ? '清除' : 'Clear'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ManualInputScreen;
