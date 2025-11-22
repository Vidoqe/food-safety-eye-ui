import React, { useState } from "react";
import ResultScreen from "./ResultScreen";
import { AnalyzeProduct } from "../services/gptImageAnalysis";

interface ManualInputScreenProps {
  lang: string;
  onBack?: () => void;
}

type EdgePayload = {
  ingredients?: string;
  ingredientsText?: string;
  barcode?: string;
  lang: string;
};

export default function ManualInputScreen({
  lang,
  onBack,
}: ManualInputScreenProps) {
  const [ingredients, setIngredients] = useState("");
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!ingredients.trim() && !barcode.trim()) {
      setError(
        lang === "zh"
          ? "請輸入成分或條碼（至少一項）。"
          : "Enter ingredients or a barcode (at least one)."
      );
      return;
    }

    setError(null);
    setLoading(true);

    const payload: EdgePayload = {
      ingredients: ingredients.trim() || undefined,
      ingredientsText: ingredients.trim() || undefined,
      barcode: barcode.trim() || undefined,
      lang,
    };

    try {
      const edgeResult = await AnalyzeProduct(payload);
      console.log("[ManualInputScreen] result:", edgeResult);
      setResult(edgeResult);
    } catch (e: any) {
      console.error("[ManualInputScreen] analyze error:", e);
      setResult(null);
      setError(
        lang === "zh"
          ? "分析失敗，請再試一次。"
          : "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // If we already have a result, show the ResultScreen (with table)
  if (result) {
    return (
      <ResultScreen
        result={result}
        onBack={() => setResult(null)}
      />
    );
  }

  // ----- Form view -----
  return (
    <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto" }}>
      {/* Header / Back */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "0.5rem",
              border: "1px solid #ddd",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            {lang === "zh" ? "返回" : "Back"}
          </button>
        )}

        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          {lang === "zh"
            ? "食安分析（手動輸入）"
            : "Food Safety Analysis (Manual Input)"}
        </h1>
      </div>

      {/* Form */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            {lang === "zh" ? "成分（文字）" : "Ingredients (text)"}
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            {lang === "zh" ? "條碼（可選）" : "Barcode (optional)"}
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            border: "none",
            background: loading ? "#9ca3af" : "#16a34a",
            color: "white",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {loading
            ? lang === "zh"
              ? "分析中…"
              : "Analyzing…"
            : lang === "zh"
            ? "分析"
            : "Analyze"}
        </button>
      </div>
    </div>
  );
}
