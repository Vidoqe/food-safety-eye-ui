import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

import { useAppContext, AnalysisResult } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';

// Local text analyzer (no JWT needed)
import IngredientAnalysisService from '@/services/ingredientAnalysis';
// -------- helpers --------
const RISK_LABELS = {
  en: { healthy: 'Low', moderate: 'Moderate', harmful: 'High', unknown: 'Unknown' },
  zh: { healthy: '低',   moderate: '中等',     harmful: '高',   unknown: '未知' },
};

const OVERALL_SAFETY = {
  en: { healthy: 'Low Risk', moderate: 'Medium Risk', harmful: 'High Risk' },
  zh: { healthy: '低風險',     moderate: '中風險',        harmful: '高風險' },
};

const YES_NO = {
  en: { yes: 'Yes', no: 'No' },
  zh: { yes: '是',  no: '否' },
};

const mapVerdictToBadge = (v: 'healthy' | 'moderate' | 'harmful') => {
  switch (v) {
    case 'healthy': return '🟢';
    case 'moderate': return '🟡';
    case 'harmful': return '🔴';
    default: return '⚪';
  }
};

interface ManualInputScreenProps {
  onBack?: () => void;
  onResult: (result: AnalysisResult) => void;
}

const ManualInputScreen: React.FC<ManualInputScreenProps> = ({ onBack, onResult }) => {
  const { language } = useAppContext();               // 'en' | 'zh'
  const { user } = useUser();

  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setError('');
    if (!ingredients.trim()) {
      setError(language === 'zh' ? '請先輸入成分。' : 'Please enter ingredients first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use local analyzer (no JWT/API)
      const plan: 'free' | 'premium' | 'gold' = user?.plan ?? 'free';
      const analysis = await IngredientAnalysisService.analyzeIngredients(ingredients, plan);

      // Build language-specific labels here, so UI shows a single language.
      const riskLabels = RISK_LABELS[language];
      const overallLabels = OVERALL_SAFETY[language];

      const result: AnalysisResult = {
        id: Date.now().toString(),
        ingredients: analysis.ingredients,
        verdict: analysis.verdict,                              // 'healthy' | 'moderate' | 'harmful'
        tips: analysis.tips ?? [],
        timestamp: new Date(),
        productType: 'Manual Input Analysis',
        isEdible: true,

        extractedIngredients: analysis.extractedIngredients,
        keyDetectedSubstances: analysis.regulatedAdditives,
        isNaturalProduct: analysis.isNaturalProduct,
        regulatedAdditives: analysis.regulatedAdditives,

        // Quantified score (keep your existing calc, fallback to 5)
        junkFoodScore: analysis.junkFoodScore ?? 5,

        // Single-language quick summary + overall safety
        quickSummary:
          language === 'zh'
            ? (analysis.summaryZh ?? analysis.summary ?? '')
            : (analysis.summaryEn ?? analysis.summary ?? ''),

        overallSafety:
          overallLabels[
            (analysis.verdict as 'healthy' | 'moderate' | 'harmful') ?? 'moderate'
          ],

        summary:
          language === 'zh'
            ? (analysis.summaryZh ?? analysis.summary ?? '')
            : (analysis.summaryEn ?? analysis.summary ?? ''),

        productName: analysis.productName ?? '',
        barcode: analysis.barcode ?? '',

        taiwanWarnings: analysis.taiwanWarnings ?? [],

        // Optional counters (keep if present; ignore if missing)
        scansLeft: analysis.scansLeft,
        creditsExpiry: analysis.creditsExpiry,

        // Preserve any extended fields your results page might use:
        overall_risk: riskLabels[analysis.verdict as 'healthy' | 'moderate' | 'harmful'] ?? riskLabels.moderate,
        child_safe:
          analysis.child_safe === true
            ? YES_NO[language].yes
            : analysis.child_safe === false
              ? YES_NO[language].no
              : YES_NO[language].no,

        notes: analysis.notes ?? [],
      };

      setIsAnalyzing(false);
      onResult?.(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);

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
        overallSafety: language === 'zh' ? '中風險' : 'Medium Risk',
        summary: language === 'zh' ? '分析失敗' : 'Analysis failed',
        productName: '',
        barcode: '',
        taiwanWarnings: [],
        overall_risk: language === 'zh' ? '中等' : 'Moderate',
        child_safe: YES_NO[language].no,
        notes: [],
      };

      onResult?.(errorResult);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} disabled={isAnalyzing}>
            ← {language === 'zh' ? '返回' : 'Back'}
          </Button>
        )}
        <h2 className="text-xl font-semibold">
          {language === 'zh' ? '手動輸入' : 'Manual Input'}
        </h2>
      </div>

      <Card className="p-4 space-y-4">
        <label className="text-sm font-medium">
          {language === 'zh'
            ? '請輸入產品成分（以逗號分隔）'
            : 'Enter product ingredients (comma-separated)'}
        </label>

        <Textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={
            language === 'zh'
              ? '範例：water, sugar, sodium benzoate, aspartame'
              : 'Example: water, sugar, sodium benzoate, aspartame'
          }
          className="min-h-[140px]"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
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

