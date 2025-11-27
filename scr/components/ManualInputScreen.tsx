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
    setError(language === 'zh' ? '請輸入成分。' : 'Please enter ingredients.');
    return;
  }

  setIsAnalyzing(true);
  setError('');

  try {
    // Use existing edge function URL
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ingredients.trim(),
        barcode: '',
      }),
    });

    if (!response.ok) {
      setError(language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.');
      return;
    }

    const json = await response.json().catch(() => null);
    if (!json || typeof json !== 'object') {
      setError(language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.');
      return;
    }

    // support both {result:{...}} and {...}
    const gpt = (json.result ?? json) || {};

    const result: AnalysisResult = {
      id: Date.now().toString(),
      ingredients: Array.isArray(gpt.ingredients) ? gpt.ingredients : [],
      verdict: gpt.verdict ?? 'moderate',
      tips: Array.isArray(gpt.tips) ? gpt.tips : [],
      timestamp: new Date(),
      raw: gpt,
    };

    onResult(result);
  } catch (err) {
    console.error(err);
    setError(language === 'zh' ? '分析失敗，請再試一次。' : 'Analysis failed. Please try again.');
  } finally {
    setIsAnalyzing(false);
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
