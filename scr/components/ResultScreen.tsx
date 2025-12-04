// scr/components/ResultScreen.tsx
import React from "react";
import IngredientRiskTable from "@/components/IngredientRiskTableCompact";
import { useAppContext } from "@/contexts/AppContext";
import type { GPTAnalysisResult, Risk } from "@/services/gptImageAnalysis";

const BADGE_FALLBACK: Record<Risk, string> = {
  harmful: "🔴",
  moderate: "🟡",
  low: "🟢",
  healthy: "🟢",
};

function verdictText(v: Risk, lang: "en" | "zh") {
  if (lang === "zh") {
    switch (v) {
      case "harmful":
        return "高風險（建議避免）";
      case "moderate":
        return "中等風險（建議限制）";
      case "healthy":
        return "較安全";
      case "low":
      default:
        return "低風險（普通安全）";
    }
  }
  switch (v) {
    case "harmful":
      return "High Risk (avoid if possible)";
    case "moderate":
      return "Moderate Risk (limit intake)";
    case "healthy":
      return "Healthier choice";
    case "low":
    default:
      return "Low Risk (generally safe)";
  }
}

function sectionTitle(
  key: "overview" | "summary" | "tips" | "details",
  lang: "en" | "zh"
) {
  const map = {
    en: {
      overview: "Overall Result",
      summary: "Summary",
      tips: "Tips",
      details: "Ingredient Details",
    },
    zh: {
      overview: "整體結果",
      summary: "摘要",
      tips: "建議",
      details: "成分詳情",
    },
  } as const;
  return map[lang][key];
}

interface ResultScreenProps {
  result: GPTAnalysisResult | null;
  onBack?: () => void;
  onHome?: () => void;
  onJunkFoodInfo?: () => void;
  error?: string;
}

// Main result screen
const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onBack,
  onHome,
  onJunkFoodInfo,
  error,
}) => {
  const { language } = useAppContext(); // 'en' | 'zh'

  // If result is null, show simple message and don't crash
  if (!result) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === "zh" ? "尚未產生結果⋯" : "No result yet."}
        </p>
      </div>
    );
  }

  // 🛡️ Safety guard: ensure ingredients is always an array
  const safeIngredients = Array.isArray(result.ingredients)
    ? (result.ingredients as any[])
    : [];

  // Verdict + badge
  const verdict: Risk =
    result.verdict === "low" || result.verdict === "healthy"
      ? "healthy"
      : result.verdict === "harmful"
      ? "harmful"
      : result.verdict || "moderate";

  const verdictBadge = BADGE_FALLBACK[verdict] ?? "🟡";

  // --- Map backend fields to UI fields (risk, child risk, Taiwan rules, englishName) ---
  const mappedIngredients = safeIngredients.map((ing: any) => {
    const rawRisk = (ing.risk_level || ing.status || ing.risk || "")
      .toString()
      .toLowerCase();

    let normalized: Risk = "moderate";
    if (rawRisk === "high" || rawRisk === "harmful") normalized = "harmful";
    else if (rawRisk === "moderate" || rawRisk === "medium")
      normalized = "moderate";
    else if (rawRisk === "healthy" || rawRisk === "low") normalized = "healthy";

    const badge = BADGE_FALLBACK[normalized] ?? "🟡";

    const childRiskRaw =
      ing.child_risk || ing.childRisk || ing.childSafety || "unknown";

    const taiwanReg =
    ing.fda_regulation ||
    ing.taiwanRegulation ||
    ing.taiwan_regulation ||
    "";

  // figure out names
  const originalName = ing.ingredient || ing.name || "";
  const englishName = ing.englishName || ing.name || "";

  // what to actually display in the table
  const displayName =
    language === "zh"
      ? (originalName || englishName)   // Chinese tab → original label text
      : (englishName || originalName);  // English tab → English name

  return {
    ...ing,

    // Name shown in the table
    name: displayName,

    // keep both versions (future-proof)
    originalName,
    englishName,

    status: normalized,
    childRisk: childRiskRaw,
    badge,
    taiwanRegulation: taiwanReg || "No info",
  };
});

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {sectionTitle("overview", language)}
        </h2>
        <div className="flex gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded bg-gray-100 px-3 py-1 text-sm"
            >
              {language === "zh" ? "返回" : "Back"}
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="rounded bg-gray-100 px-3 py-1 text-sm"
            >
              {language === "zh" ? "首頁" : "Home"}
            </button>
          )}
          {onJunkFoodInfo && (
            <button
              onClick={onJunkFoodInfo}
              className="rounded bg-gray-100 px-3 py-1 text-sm"
            >
              {language === "zh" ? "說明" : "Info"}
            </button>
          )}
        </div>
      </div>

      {/* Optional error banner */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Verdict card */}
      <div className="rounded-2xl border p-4 md:p-6 bg-white shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{verdictBadge}</div>
          <div>
            <div className="text-lg font-medium">
              {verdictText(verdict, language)}
            </div>
            {result.summary && (
              <div className="text-gray-700 text-sm md:text-base mt-2">
                {result.summary}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      {!!result.tips?.length && (
        <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            {sectionTitle("tips", language)}
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
          {sectionTitle("details", language)}
        </h3>

        {safeIngredients.length === 0 && (
          <div className="rounded-2xl border p-3 md:p-4 bg-yellow-50 text-yellow-900 text-sm">
            {language === "zh"
              ? "無法從照片辨識成分表，請靠近成分文字並保持良好光線，或改用手動輸入成分。"
              : "Couldn't detect an ingredient list from the photo. Move closer, keep good lighting, or use manual input instead."}
          </div>
        )}

        <IngredientRiskTable ingredients={mappedIngredients} 
         language={language}
       />
      </div>
    </div>
  );
};

export default ResultScreen;
