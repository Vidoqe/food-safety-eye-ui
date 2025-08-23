import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useAppContext } from '@/contexts/AppContext';
import type { AnalysisResult } from '@/contexts/UserContext';

// ⬇️ Local text analyzer (no JWT needed)
import { IngredientAnalysisService } from '@/services/ingredientAnalysis';

// ---------- helpers ----------
const mapVerdictToSafety = (
  v: 'healthy' | 'moderate' | 'harmful',
  lang: 'en' | 'zh'
) => {
  const en = {
    healthy: '🟢 Safe',
    moderate: '🟡 Moderate',
    harmful: '🔴 Avoid',
  } as const;

  const zh = {
    healthy: '🟢 安全',
    moderate: '🟡 中等',
    harmful: '🔴 避免',
  } as const;

  return (lang === 'zh' ? zh : en)[v];
};

interface ManualInputScreenProps {
  onBack?: () => void;
  onResult: (result: AnalysisResult) => void;
}

const ManualInputScreen: React.FC<ManualInputScreenProps> = ({ onBack, onResult }) => {
  const { language } = useAppContext();               // 'en' | 'zh'
  const { user } = useUser();                         // may contain plan
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!ingredients.trim()) {
      setError(language === 'zh' ? '請輸入成分' : 'Please enter ingredients.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Use local analyzer (no JWT/API)
      const plan: 'free' | 'premium' | 'gold' = (user?.plan as any) || 'free';
      const analysis = await IngredientAnalysisService.analyzeIngredients(ingredients, plan);

      // Map to the UI's AnalysisResult shape
      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,                 // Ingredient[]
        verdict: analysis.verdict,                         // 'healthy' | 'moderate' | 'harmful'
        tips: analysis.tips ?? [],
        timestamp: new Date(),
        productType: 'Manual Input Analysis',
        isEdible: true,

        extractedIngredients: analysis.ingredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,
        junkFoodScore: analysis.junkFoodScore ?? 5,
        quickSummary: analysis.quickSummary ?? '',
        overallSafety: mapVerdictToSafety(analysis.verdict, language),
        summary: analysis.quickSummary ?? '',
        productName: '',
        barcode: '',
        taiwanWarnings: [],

        // fields that exist in image-flow; keep defaults for UI compatibility
        scansLeft: undefined as any,
        creditsExpiry: undefined as any,
        overall_risk: analysis.verdict as any,
        child_safe: undefined as any,
        notes: analysis.tips ?? [],
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
        quickSummary: '',
        overallSafety: mapVerdictToSafety('moderate', language),
        summary: language === 'zh' ? '分析失敗。' : 'Analysis failed.',
        productName: '',
        barcode: '',
        taiwanWarnings: [],
        scansLeft: undefined as any,
        creditsExpiry: undefined as any,
        overall_risk: 'moderate' as any,
        child_safe: undefined as any,
        notes: [],
      };

      onResult(errorResult);
      setError(language === 'zh' ? '分析失敗，請稍後再試。' : 'Analysis failed. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Button variant="ghost" onClick={onBack} className="mb-3">
        ← {language === 'zh' ? '返回' : 'Back'}
      </Button>

      <Card className="p-4 space-y-3">
        <h2 className="text-xl font-semibold">
          {language === 'zh' ? '手動輸入' : 'Manual Input'}
        </h2>

        <p className="text-sm text-muted-foreground">
          {language === 'zh'
            ? '以逗號分隔輸入成分，例如：水、糖、苯甲酸鈉'
            : 'Enter ingredients separated by commas, e.g. water, sugar, sodium benzoate'}
        </p>

        <Textarea
          rows={6}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={
            language === 'zh'
              ? '例如：水、糖、苯甲酸鈉'
              : 'e.g., water, sugar, sodium benzoate'
          }
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
          {isAnalyzing
            ? language === 'zh' ? '分析中…' : 'Analyzing…'
            : language === 'zh' ? '開始分析' : 'Start Analysis'}
        </Button>
      </Card>
    </div>
  );
};

export default ManualInputScreen;
