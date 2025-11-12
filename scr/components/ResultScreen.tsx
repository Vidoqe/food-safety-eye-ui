// src/components/ResultScreen.tsx
import React from 'react';
import IngredientRiskTable from '@/components/IngredientRiskTable';
import { useAppContext } from '@/contexts/AppContext';
import type { GPTAnalysisResult, Risk } from '@/services/gptImageAnalysis';

// fallback badge for verdict
const BADGE_FALLBACK: Record<Risk, string> = {
  harmful: '🔴',
  moderate: '🟠',
  low: '🟡',
  healthy: '🟢',
};

function verdictText(v: Risk, lang: 'en' | 'zh') {
  if (lang === 'zh') {
    switch (v) {
      case 'harmful':
        return '高風險（建議避免）';
      case 'moderate':
        return '中等風險（建議限量）';
      case 'healthy':
      case 'low':
        return '低風險（普通安全）';
      default:
        return '中等風險';
    }
  }

  switch (v) {
    case 'harmful':
      return 'High Risk (avoid if possible)';
    case 'moderate':
      return 'Moderate Risk (limit intake)';
    case 'healthy':
    case 'low':
      return 'Low Risk (generally safe)';
    default:
      return 'Moderate Risk';
  }
}

function sectionTitle(
  key: 'overview' | 'summary' | 'tips' | 'details',
  lang: 'en' | 'zh',
) {
  const map = {
    en: {
      overview: 'Overall Result',
      summary: 'Summary',
      tips: 'Tips',
      details: 'Ingredient Details',
    },
    zh: {
      overview: '整體結果',
      summary: '摘要',
      tips: '建議',
      details: '成分詳情',
    },
  } as const;

  return map[lang][key];
}

// ---------- find ingredient rows in result ----------

function getIngredientRows(result: any): any[] {
  if (!result || typeof result !== 'object') return [];

  // 1) Preferred explicit keys
  if (Array.isArray(result.ingredients) && result.ingredients.length > 0) {
    return result.ingredients;
  }
  if (Array.isArray(result.table) && result.table.length > 0) {
    return result.table;
  }

  // 2) Fallback: scan all properties for an array of objects
  for (const key of Object.keys(result)) {
    const val = (result as any)[key];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      const first = val[0] as any;
      // heuristic: looks like ingredient rows
      if (
        'ingredient' in first ||
        'name' in first ||
        'item' in first ||
        'risk' in first
      ) {
        return val;
      }
    }
  }

  return [];
}

interface Props {
  result: GPTAnalysisResult | null;
  onBack?: () => void;
}

const ResultScreen: React.FC<Props> = ({ result, onBack }) => {
  const { language } = useAppContext(); // 'en' | 'zh'

  // No result yet
  if (!result) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === 'zh' ? '尚未產生結果…' : 'No result yet.'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            {language === 'zh' ? '返回' : 'Back'}
          </button>
        )}
      </div>
    );
  }

  // ------- overall verdict -------
  const verdict: Risk =
    result.verdict === 'low' || result.verdict === 'healthy'
      ? 'healthy'
      : result.verdict === 'harmful'
      ? 'harmful'
      : 'moderate';

  const verdictBadge = BADGE_FALLBACK[verdict] ?? '🟡';

  // ------- ingredient rows -------
  // -------- ingredient rows -------
const ingredientsForTable =
  (result.ingredients && result.ingredients.length > 0
    ? result.ingredients
    : result.table) || [];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {sectionTitle('overview', language as 'en' | 'zh')}
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
          >
            {language === 'zh' ? '返回' : 'Back'}
          </button>
        )}
      </div>

      {/* Overview card */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <p className="text-lg font-semibold mb-1">
          <span className="mr-2">{verdictBadge}</span>
          {verdictText(verdict, language as 'en' | 'zh')}
        </p>
        <p className="text-gray-700 whitespace-pre-line">
          {result.message ?? ''}
        </p>
      </div>

      {/* Summary card (if present) */}
      {result.summary && (
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {sectionTitle('summary', language as 'en' | 'zh')}
          </h3>
          <p className="text-gray-700 whitespace-pre-line">{result.summary}</p>
        </div>
      )}

      {/* Tips card (if present) */}
      {Array.isArray(result.tips) && result.tips.length > 0 && (
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {sectionTitle('tips', language as 'en' | 'zh')}
          </h3>
          <ul className="list-disc ml-6 space-y-1">
            {result.tips.map((t, i) => (
              <li key={i} className="text-gray-700">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingredient section */}
      <div className="rounded-2xl border p-3 md:p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-3">
          {sectionTitle('details', language as 'en' | 'zh')}
        </h3>

        {/* Show warning only if no OCR text AND no ingredient rows at all */}
        {!result.text && ingredientsForTable.length === 0 && (
          <div className="rounded-xl border p-3 bg-yellow-50 text-yellow-900 mb-3">
            {language === 'zh'
              ? '無法從照片辨識成分表，請靠近拍攝，確保文字清晰或改用手動輸入。'
              : "Couldn't detect an ingredient list from the photo. Move closer, keep text in focus with good lighting, or use Manual input."}
          </div>
        )}

        <IngredientRiskTable ingredients={ingredientsForTable} />
      </div>
    </div>
  );
};

export default ResultScreen;

