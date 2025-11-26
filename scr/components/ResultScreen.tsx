// scr/components/ResultScreen.tsx
import React from "react";
import IngredientRiskTable from "@/components/IngredientRiskTable";
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

const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onBack,
  error,
}) => {
  const { language } = useAppContext(); // 'en' | 'zh'
// Guard: if result is null, do not crash
if (!result) {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <p className="text-gray-600">
        {language === 'zh' ? '尚未產生結果。' : 'No result yet.'}
      </p>
    </div>
  );
}

  if (!result) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="text-gray-600">
          {language === "zh" ? "尚未產生結果。" : "No result yet."}
        </p>
      </div>
    );
  }
// 🔒 Safety guard: ensure ingredients is always an array
const safeIngredients =
  Array.isArray(result.ingredients) ? result.ingredients : [];
  const verdict: Risk =
    result.verdict === "low" || result.verdict === "healthy"
      ? "healthy"
      : result.verdict === "harmful"
      ? "harmful"
      : result.verdict || "moderate";

  const verdictBadge = BADGE_FALLBACK[verdict] ?? "🟡";

  // --- Map backend fields to UI fields (risk, child risk, Taiwan rules) ---
  const mappedIngredients = safeIngredients.map((ing: any) => {
    const rawRisk = (ing.risk_level || ing.status || ing.risk || "")
      .toString()
      .toLowerCase();

    let normalized: Risk = "moderate";
    if (rawRisk === "high" || rawRisk === "harmful") normalized = "harmful";
    else if (rawRisk === "moderate" || rawRisk === "medium")
      normalized = "moderate";
    else if (rawRisk === "low") normalized = "low";
    else if (rawRisk === "healthy") normalized = "healthy";

    const badge = BADGE_FALLBACK[normalized] ?? "🟡";

    const childRiskRaw =
      ing.child_risk || ing.childRisk || ing.childSafety || "unknown";

    const taiwanReg =
      ing.fda_regulation ||
      ing.taiwanRegulation ||
      ing.taiwan_regulation ||
      "";

    return {
      ...ing,
      name: ing.ingredient || ing.name,
      status: normalized,
      childRisk: childRiskRaw,
      badge,
      taiwanRegulation: taiwanReg || "No info",
    };
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {sectionTitle("overview", language)}
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
          >
            {language === "zh" ? "返回" : "Back"}
          </button>
        )}
      </div>

      {/* Optional error banner */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Verdict card */}
      <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{verdictBadge}</div>
          <div>
            <div className="text-lg font-medium">
              {verdictText(verdict, language)}
            </div>
            {result.summary && (
              <div className="text-gray-700 mt-1">{result.summary}</div>
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

       {((result?.ingredients ?? []).length === 0) && ( (
          <div className="rounded-xl border p-3 bg-yellow-50 text-yellow-900 mb-3">
            {language === "zh"
              ? "無法從照片辨識成分表，請靠近成分文字並保持良好光線，或改用手動輸入。"
              : "Couldn’t detect an ingredient list from the photo. Move closer, keep text in focus with good lighting, or use Manual input."}
          </div>
        )}

        <IngredientRiskTable ingredients={mappedIngredients} />
      </div>
    </div>
  );
};

export default ResultScreen;
