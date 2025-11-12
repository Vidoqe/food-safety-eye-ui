// scr/components/ManualInputScreen.tsx
import React, { useMemo, useState } from "react";
import { AnalyzeProduct, type AnalyzeResult } from "../services/gptImageAnalysis";

type Lang = "zh" | "en";

interface ManualInputScreenProps {
  onBack?: () => void;
  onResult?: (result: AnalyzeResult) => void;
}

export default function ManualInputScreen({
  onBack,
  onResult,
}: ManualInputScreenProps) {
  // -------- form state --------
  const [ingredients, setIngredients] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [lang, setLang] = useState<Lang>("zh");

  // -------- UI state ----------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------- result state (local preview + debug) --------
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [debugResult, setDebugResult] = useState<any | null>(null);

  // require at least one: ingredients OR barcode
  const canAnalyze = useMemo(
    () =>
      ingredients.trim().length > 0 ||
      barcode.trim().length > 0,
    [ingredients, barcode]
  );

  async function handleAnalyze() {
    setError(null);

    if (!canAnalyze) {
      setError(
        lang === "zh"
          ? "請輸入成分或條碼（至少一項）。"
          : "Enter ingredients or a barcode (at least one)."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        // manual mode – no photo
        image: undefined,
        // main text we want the backend to use
        ingredients: ingredients.trim() || undefined,
        ingredientsText: ingredients.trim() || undefined,
        barcode: barcode.trim() || undefined,
        lang,
      };

      const res = await AnalyzeProduct(payload as any);

      console.log("[Analyze] result:", res);
      setDebugResult(res); // <-- show raw JSON below the form

      // if backend uses an ok flag, honor it
      if (!(res as any)?.ok) {
        setResult(null);
        setError(
          (res as any)?.error ||
          (lang === "zh" ? "分析失敗" : "Analysis failed")
        );
        return;
      }

      setResult(res);
      onResult?.(res);
    } catch (e: any) {
      console.error("[ManualInputScreen] analyze error:", e);
      setResult(null);
      setDebugResult(null);
      setError(
        e?.message ||
          (lang === "zh" ? "系統錯誤，請稍後再試。" : "Unexpected error. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }

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
  onClick={onBack} // ← capital “C” is required
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
            style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
          >
            {lang === "zh" ? "成分（文字）" : "Ingredients (text)"}
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={3}
            placeholder={
              lang === "zh"
                ? "例如：水、糖、鹽..."
                : "e.g. water, sugar, salt..."
            }
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div>
          <label
            style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
          >
            {lang === "zh" ? "條碼（選填）" : "Barcode (optional)"}
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="4712345678901"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label
            style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
          >
            {lang === "zh" ? "語言" : "Language"}
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {error && (
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || loading}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              background: !canAnalyze || loading ? "#9ca3af" : "#16a34a",
              color: "white",
              fontWeight: 500,
              cursor:
                !canAnalyze || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? lang === "zh"
                ? "分析中..."
                : "Analyzing..."
              : lang === "zh"
              ? "分析"
              : "Analyze"}
          </button>
        </div>
      </div>

      {/* Optional local summary (very simple) */}
      {result && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            {lang === "zh" ? "摘要" : "Summary"}
          </h2>
          <p style={{ marginBottom: "0.25rem" }}>
            <strong>
              {lang === "zh" ? "風險：" : "Risk:"}
            </strong>{" "}
            {(result as any).overallResult}
          </p>
          <p>
            <strong>
              {lang === "zh" ? "說明：" : "Message:"}
            </strong>{" "}
            {(result as any).message}
          </p>
        </div>
      )}

      {/* RAW JSON for debugging */}
      {debugResult && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            background: "#111827",
            color: "#e5e7eb",
            fontSize: "0.75rem",
            maxHeight: "320px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(debugResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
