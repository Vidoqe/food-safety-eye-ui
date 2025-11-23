// src/components/ResultScreen.tsx
import React from 'react';
import IngredientRiskTable from "../components/IngredientRiskTable";
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

// -------- find ingredient rows in result --------
function getIngredientRows(result: any): any[] {
  if (!result || typeof result !== "object") return [];

  // 1) If backend already sends an array (future-proof)
  if (Array.isArray(result.ingredients) && result.ingredients.length > 0) {
    return result.ingredients;
  }

  if (Array.isArray(result.table) && result.table.length > 0) {
    return result.table;
  }

  // 2) CURRENT CASE: backend sends a single string with a combined list
  const ingredientsText: string =
    typeof result.ingredients === "string" ? result.ingredients : "";

  if (!ingredientsText.trim()) return [];

  const splitIngredients = ingredientsText
    .split(/[,;；、]+/) // commas, semicolons, Chinese punctuation
    .map((n: string) => n.trim())
    .filter((n: string) => n.length > 0);

  return splitIngredients.map((name: string) => ({
    ingredient: name,
    riskLevel: result.riskLevel ?? "unknown",
    childRisk:
      result.childSafe === true
        ? "low"
        : result.childSafe === false
        ? "risk"
        : "unknown",
    badge: result.badge ?? "Caution",
    law: result.law ?? "No specific restriction",
  }));
}

interface Props {
  result: GPTAnalysisResult | null;
  onBack?: () => void;
}

const ResultScreen: React.FC<Props> = ({ result, onBack }) => {
const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      console.warn("onBack is NOT a function:", onBack);
    }
  };
  const { language } = useAppContext(); // 'en' | 'zh'
// Normalize ingredient rows into table format
const ingredientsForTable: IngredientRow[] = (() => {
  if (!result) return [];

  // Case 1: backend returns a ready-made table array
  if (Array.isArray((result as any).table)) {
    return (result as any).table as IngredientRow[];
  }

  // Case 2: backend returns an array of ingredient entries
  if (Array.isArray((result as any).ingredients)) {
    return (result as any).ingredients.map((item: any) => ({
      ingredient: item.ingredient ?? item ?? "",
      riskLevel: item.riskLevel ?? "unknown",
      childRisk:
        item.childSafe === true
          ? "low"
          : item.childSafe === false
          ? "risk"
          : "unknown",
      badge: item.badge ?? "",
      law: item.law ?? "",
    }));
  }

  // Case 3: backend returns "sugar,salt,sodium nitrate"
if (typeof result.ingredients === "string") {
  return result.ingredients
    .split(/[,;，]/)
    .map((name: string) => name.trim())
    .filter((name: string) => name.length > 0)
    .map((name: string) => ({
      ingredient: name,
      risklevel: result.risklevel ?? "unknown",
      childisk:
        result.childSafe === true
          ? "low"
          : result.childSafe === false
          ? "risk"
          : "unknown",
      badge: result.badge ?? "",
      law: result.law ?? "",
    }));
}

  return [];
})();


// No result yet
if (!result) {
  return (
    <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === 'zh' ? '尚未產生結果…' : 'No result yet.'}
        </p>
        {onBack && (
 <button
  type="button"
  onClick={() => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      console.warn("onBack is NOT a function, falling back to history.back()");
      window.history.back();
    }
  }}
  className="mt-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
>
  {language === "zh" ? "返回" : "Back"}
</button>
)}
      </div>
    );
  }

  
 // -------- overall verdict --------
const verdict: Risk =
  result.verdict === "low" || result.verdict === "healthy"
    ? "healthy"
    : result.verdict === "harmful"
    ? "harmful"
    : "moderate";

const verdictBadge = BADGE_FALLBACK[verdict] ?? "🟡";

// -------- ingredient rows --------
// Build ingredient rows directly from result
const ingredientRows = React.useMemo(() => {
  if (!result) return [];

  // 1) Get ingredients string
  const raw =
    typeof result.ingredients === "string"
      ? result.ingredients
      : Array.isArray(result.ingredients)
      ? result.ingredients.join(",")
      : "";

  if (!raw.trim()) return [];

  // 2) Split text -> array
  const names = raw
    .split(/[,;；、]+/) // commas, semicolons, Chinese punctuation
    .map((n: string) => n.trim())
    .filter((n: string) => n.length > 0);

  // 3) Map into table rows
  return names.map((name: string) => ({
    ingredient: name,
    riskLevel: result.riskLevel ?? "unknown",
    childRisk:
      result.childSafe === true
        ? "low"
        : result.childSafe === false
        ? "risk"
        : "unknown",
    badge: result.badge ?? "Caution",
    law: result.law ?? "No specific restriction",
  }));
}, [result]);

const thStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
};

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

 {typeof onBack === "function" && (
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
      onClick={handleBackClick}
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
<section style={{ width: "100%", marginTop: "1.5rem" }}>
 <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
  {sectionTitle("details", language as "en" | "zh")}
</h2>
</section>  //

};

<table style={{ width: "100%", marginTop: "1rem", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        <th style={thStyle}>{language === "zh" ? "成分" : "Ingredient"}</th>
<th style={thStyle}>{language === "zh" ? "風險等級" : "Risk Level"}</th>
<th style={thStyle}>{language === "zh" ? "兒童風險" : "Child Risk?"}</th>
<th style={thStyle}>{language === "zh" ? "標章" : "Badge"}</th>
<th style={thStyle}>{language === "zh" ? "台灣法規" : "Taiwan FDA Regulation"}</th>
      </tr>
    </thead>

    <tbody>
      {ingredientRows.map((row, index) => (
        <tr key={index}>
          <td style={tdStyle}>{row.ingredient}</td>
          <td style={tdStyle}>{row.riskLevel}</td>
          <td style={tdStyle}>{row.childRisk}</td>
          <td style={tdStyle}>{row.badge}</td>
          <td style={tdStyle}>{row.law}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>

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

