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

// -------- find ingredient rows in result ----------
function getIngredientRows(result: any): any[] {
  if (!result || typeof result !== "object") return [];

  // 1) If backend already sends an array (future-proof)
  if (Array.isArray(result.ingredients) && result.ingredients.length > 0) {
    return result.ingredients;
  }
  if (Array.isArray(result.table) && result.table.length > 0) {
    return result.table;
  }

  // 2) CURRENT CASE: backend sends a single object with a combined string
  const ingredientsText =
    typeof result.ingredients === "string" ? result.ingredients : "";

  if (!ingredientsText.trim()) return [];

  const base = {
    riskLevel: result.riskLevel ?? "unknown",
    childRisk:
      result.childSafe === true
        ? "low"
        : result.childSafe === false
        ? "risk"
        : "unknown",
    badge: result.badge ?? "",
    law: result.law ?? "",
  };

  // Split "salt,sugar,aspartame" into ["salt","sugar","aspartame"]
  return ingredientsText
    .split(/[,;、]/) // commas, semicolons, Chinese 、 etc.
    .map((raw: string) => raw.trim())
    .filter((name: string) => name.length > 0)
    .map((name: string) => ({
      ingredient: name,
      ...base,
    }));
}
interface Props {
  result: GPTAnalysisResult | null;
  onBack?: () => void;
}

const ResultScreen: React.FC<Props> = ({ result, onBack }) => {
  const { language } = useAppContext(); // 'en' | 'zh'
// Normalize ingredient rows into table format
const ingredientsForTable =
  Array.isArray(result?.table) ? result.table :
  Array.isArray(result?.ingredients) ? result.ingredients :
  result && typeof result === "object" && result.ingredients ? [
    {
      ingredient: result.ingredients,
      riskLevel: result.riskLevel ?? "unknown",
      childRisk:
        result.childSafe === true
          ? "low"
          : result.childSafe === false
          ? "risk"
          : "unknown",
      badge: result.badge ?? "",
      law: result.law ?? "",
    }
  ] : [];

  // No result yet
  if (!result) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === 'zh' ? '尚未產生結果…' : 'No result yet.'}
        </p>
        {onBack && (
          <button
  onClick={() => {
    if (typeof onBack === "function") {
      onBack();
    }
  }}
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
const ingredients = getIngredientRows(result);

return (
  <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  }}
>
  <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
    {sectionTitle("overview", language as "en" | "zh")}
  </h2>

 {onBack && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1.5rem",
    }}
  >
    <button
  type="button"
  onClick={() => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      console.warn("onBack is NOT a function:", onBack);
    }
  }}
  style={{
    padding: "0.3rem 0.8rem",
    borderRadius: "0.5rem",
    border: "1px solid #ddd",
    background: "#f9fafb",
    cursor: "pointer",
  }}
>
  {language === "zh" ? "返回" : "Back"}
</button>
  </div>
)}


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
          <p className="text-gray-700 whitespace-pre-line">
  {result.summary ?? result.analysis ?? result.message ?? "No detailed analysis available."}
</p>
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

       <IngredientRiskTable
  ingredients={result.ingredients}
  language={language}
/>
      </div>
    </div>
  );
};

export default ResultScreen;

