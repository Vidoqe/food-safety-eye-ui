// src/components/ResultScreen.tsx
import React from 'react';
import IngredientRiskTable from '@/components/IngredientRiskTable';
import { useAppContext } from '@/contexts/AppContext';
import type { GPTAnalysisResult, Risk } from '@/services/gptImageAnalysis';

// fallback badge for verdict
const BADGE_FALLBACK: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟡',
  low: '🟢',
  healthy: '🟢',
};

function verdictText(v: Risk, lang: 'en' | 'zh') {
  if (lang === 'zh') {
    switch (v) {
      case 'harmful': return '高風險（建議避免）';
      case 'moderate': return '中等風險（建議限制）';
      case 'healthy':
      case 'low': return '低風險（普遍安全）';
      default: return '中等風險';
    }
  }
  switch (v) {
    case 'harmful': return 'High Risk (avoid if possible)';
    case 'moderate': return 'Moderate Risk (limit intake)';
    case 'healthy':
    case 'low': return 'Low Risk (generally safe)';
    default: return 'Moderate Risk';
  }
}

function sectionTitle(
  key: 'overview' | 'summary' | 'tips' | 'details',
  lang: 'en' | 'zh'
) {
  const map = {
    en: { overview: 'Overall Result', summary: 'Summary', tips: 'Tips', details: 'Ingredient Details' },
    zh: { overview: '整體結果', summary: '摘要', tips: '建議', details: '成分詳情' },
  };
  return map[lang][key];
}

interface Props {
  result: GPTAnalysisResult | null;
  onBack?: () => void;
}

const ResultScreen: React.FC<Props> = ({ result, onBack }) => {
  const { language } = useAppContext(); // 'en' | 'zh'
// ✅ Combine table and ingredients results
const ingredientRows =
  Array.isArray(result?.table) && result.table.length > 0
    ? result.table
    : Array.isArray(result?.ingredients)
    ? result.ingredients
    : [];

  if (!result) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === 'zh' ? '尚未產生結果。' : 'No result yet.'}
        </p>
        {onBack && (
          <button onClick={onBack} className="mt-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
            {language === 'zh' ? '返回' : 'Back'}
          </button>
        )}
      </div>
    );
  }

  const verdict: Risk =
    result.verdict === 'low' || result.verdict === 'healthy'
      ? 'healthy'
      : result.verdict === 'harmful'
      ? 'harmful'
      : 'moderate';

  const verdictBadge = BADGE_FALLBACK[verdict] ?? '🟡';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{sectionTitle('overview', language)}</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
          >
            {language === 'zh' ? '返回' : 'Back'}
          </button>
        )}
      </div>

      {/* Verdict card */}
      <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{verdictBadge}</div>
          <div className="text-lg font-medium">{verdictText(verdict, language)}</div>
        </div>

        {!!result.summary && (
          <div className="text-gray-700 mt-3">{result.summary}</div>
        )}
      </div>

      {/* Tips */}
      {!!result.tips?.length && (
        <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">{sectionTitle('tips', language)}</h3>
          <ul className="list-disc ml-6 space-y-1">
            {result.tips.map((t, i) => (
              <li key={i} className="text-gray-700">{t}</li>
            ))}
          </ul>
        </div>
      )}

   {/* Ingredient section */}
<div className="rounded-2xl border p-3 md:p-4 bg-white shadow-sm">
  <h3 className="text-lg font-semibold mb-3">
    {sectionTitle('details', language)}
  </h3>

  {/* Show yellow warning only if no OCR text AND no ingredients found */}
  {!result.text && ingredientRows.length === 0 && (
    <div className="rounded-xl border p-3 bg-yellow-50 text-yellow-900 mb-3">
      {language === 'zh'
        ? '無法從照片辨識成分表，請調整拍攝，確保文字清晰或改用手動輸入。'
        : "Couldn't detect an ingredient list from the photo. Move closer, keep text in focus with good lighting, or use Manual input."}
    </div>
  )}

  <IngredientRiskTable ingredients={ingredientRows} />
</div>
);

export default ResultScreen;
