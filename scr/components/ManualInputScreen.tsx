import React, { useState } from 'react';

// use local (relative) imports to avoid alias issues
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

import { useAppContext, type AnalysisResult } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

// Local, rule-based analyzer (no API/JWT)
import IngredientAnalysisService from '../services/ingredientAnalysis.ts';

// GPT analyzer (image + text). We’ll use it for manual text too.
import { analyzeProduct }  from '../services/gptImageAnalysis';

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

    // which plan? (kept for display/back-compat with local analyzer)
    const plan = (user?.plan ?? 'free') as 'free' | 'premium' | 'gold';

    try {
      // Prefer GPT analyzer (text mode), fall back to local if it throws
      let gpt: GPTAnalysisResult;

      try {
        gpt = await GPTImageAnalysisService.analyzeProduct(
          undefined,                // no image (manual input)
          ingredients,              // typed ingredients
          undefined,                // no barcode
          language === 'zh' ? 'zh' : 'en'
        );
      } catch (err) {
    console.error('GPT analysis failed, using local rules instead', err);

    // Run local text-only analyzer as fallback
    const local: any =
      (await IngredientAnalysisService.analyzeIngredients(ingredients, plan)) || null;

    // If local also fails, show a friendly error and stop
    if (!local || typeof local !== 'object') {
      setIsAnalyzing(false);
      return setError(
        language === 'zh'
          ? '分析失敗，請再試一次。'
          : 'Analysis failed. Please try again.'
      );
    }

    // SAFETY GUARD: make sure arrays are never null/undefined
    local.ingredients = Array.isArray(local.ingredients)
      ? local.ingredients
      : [];
    local.extractedIngredients = Array.isArray(local.extractedIngredients)
      ? local.extractedIngredients
      : [];
    local.regulatedAdditives = Array.isArray(local.regulatedAdditives)
      ? local.regulatedAdditives
      : [];
   local.tips = Array.isArray(local.tips) ? local.tips : [];

gpt = {
  extractedIngredients: local.extractedIngredients ?? [],
  ingredients: local.ingredients ?? [],
  verdict: local.verdict ?? 'moderate',
  isNaturalProduct: local.isNaturalProduct ?? false,
  regulatedAdditives: local.regulatedAdditives ?? [],
  tips: local.tips ?? [],
  junkFoodScore: local.junkFoodScore ?? 5,
  quickSummary: local.quickSummary ?? local.summary ?? '',
  overallSafety: mapVerdictToSafety(local.verdict ?? 'moderate') as
    'safe' | 'moderate' | 'harmful',
  summary: local.summary ?? local.quickSummary ?? '',
  error: local.errorMessage,
  productName: local.productName ?? '',
  barcode: local.barcode ?? '',
  taiwanRisks: local.taiwanWarnings ?? [],
  scanIsExt: local.scanIsExt ?? undefined,
  localVerdict: local.verdict ?? 'moderate',
  localAllergyFlags: local.allergyFlags ?? [],
} as GPTAnalysisResult;


          tips: local.tips ?? [],
          junkFoodScore: local.junkFoodScore ?? 5,
          quickSummary: local.quickSummary ?? local.summary ?? '',
          overallSafety: mapVerdictToSafety(local.verdict ?? 'moderate') as
            | 'safe'
            | 'moderate'
            | 'harmful',
          summary: local.summary ?? local.quickSummary ?? '',
          error: local.errorMessage,
          productName: local.productName ?? '',
          barcode: local.barcode ?? '',
          taiwanWarnings: local.taiwanWarnings ?? [],
          scansLeft: local.scansLeft ?? undefined,
          creditsExpiry: local.creditsExpiry ?? undefined,
          overall_risk: local.overall_risk ?? undefined,
          child_safe: local.child_safe ?? undefined,
          notes: local.notes ?? [],
        };
      }

      // Build the UI result
      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: gpt.ingredients ?? [],
        verdict: gpt.verdict ?? 'moderate',
        tips: gpt.tips ?? [],
        timestamp: new Date(),

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
      setError(language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.');
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
