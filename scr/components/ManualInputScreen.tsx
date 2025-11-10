// scr/components/ManualInputScreen.tsx
import React, { useMemo, useState } from "react";
import { AnalyzeProduct, type AnalyzeResult } from "../services/gptImageAnalysis";

type Lang = "zh" | "en";

interface ManualInputScreenProps {

  onBack?: () => void;
  onResult?: (result: AnalyzeResult) => void;
}

export default function ManualInputScreen({ onBack, onResult }: ManualInputScreenProps) {
  // form state
  const [ingredients, setIngredients] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [lang, setLang] = useState<Lang>("zh");

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // result state
  const [overall, setOverall] = useState<{
    risk: AnalyzeResult["overallResult"];
    message?: string;
    childSafeOverall?: boolean;
  }>();
  const [rows, setRows] = useState<AnalyzeResult["table"]>([]);

  // require at least one: ingredients OR barcode
  const canAnalyze = useMemo(
    () => ingredients.trim().length > 0 || barcode.trim().length > 0,
    [ingredients, barcode]
  );

  async function handleAnalyze() {
    setError(null);
    if (!canAnalyze) {
      setError(lang === "zh" ? "請輸入成分或條碼（至少一項）" : "Enter ingredients or a barcode (at least one).");
      return;
    }

    try {
      setLoading(true);

      const payload = {
    image: undefined, // manual mode (no photo)
    ingredientsText: ingredients.trim() || undefined, // ✅ use this key!
    barcode: barcode.trim() || undefined,
    lang,
  };

      const res = await AnalyzeProduct(payload);
      console.log("[Analyze] result:", res);

      if (!res?.ok) {
        setRows([]);
        setOverall(undefined);
        setError(res?.message || (lang === "zh" ? "分析失敗" : "Analysis failed"));
        return;
      }

      setOverall({
        risk: res.overallResult,
        message: res.message,
        childSafeOverall: res.childSafeOverall,
      });
      setRows(Array.isArray(res.table) ? res.table : []);

      onResult?.(res);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      setOverall(undefined);
      setError(e?.message || (lang === "zh" ? "系統錯誤" : "Unexpected error"));
    } finally {
      setLoading(false);
    }
  }

  function RiskBadge({ level }: { level: "Low" | "Moderate" | "High" | "Unknown" }) {
    const color =
      level === "Low" ? "#10b981" : level === "Moderate" ? "#f59e0b" : level === "High" ? "#ef4444" : "#9ca3af";
    return (
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          marginRight: 8,
          verticalAlign: "middle",
        }}
        aria-label={`badge-${level}`}
      />
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {lang === "zh" ? "返回" : "Back"}
          </button>
        )}
        <h2 style={{ margin: 0 }}>{lang === "zh" ? "食安分析（手動輸入）" : "Food Safety Analysis (Manual Input)"}</h2>
      </div>

      {/* Form */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>{lang === "zh" ? "成分（文字）" : "Ingredients (text)"}</span>
          <textarea
            placeholder={lang === "zh" ? "例如：糖、牛奶、鹽、香料" : "e.g., sugar, milk, salt, flavour"}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={3}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>{lang === "zh" ? "條碼（可選）" : "Barcode (optional)"}</span>
          <input
            placeholder="4712345678901"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>{lang === "zh" ? "語言" : "Language"}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14 }}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || !canAnalyze}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #16a34a",
              background: loading || !canAnalyze ? "#d1fae5" : "#22c55e",
              color: "#06310f",
              fontWeight: 600,
              cursor: loading || !canAnalyze ? "not-allowed" : "pointer",
            }}
            aria-label="analyze"
          >
            {loading ? (lang === "zh" ? "分析中…" : "Analyzing…") : lang === "zh" ? "分析" : "Analyze"}
          </button>

          {!canAnalyze && (
            <small style={{ color: "#ef4444" }}>
              {lang === "zh" ? "請輸入成分或條碼（至少一項）" : "Enter ingredients or a barcode first."}
            </small>
          )}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 4,
              padding: 10,
              borderRadius: 10,
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {overall && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "#fafafa",
            }}
          >
            <RiskBadge level={overall.risk} />
            <strong>
              {lang === "zh" ? "總體風險：" : "Overall Risk:"} {overall.risk}
            </strong>
            <span>•</span>
            <span>
              {lang === "zh" ? "孩童是否安全：" : "Child-safe:"}{" "}
              {overall.childSafeOverall ? (lang === "zh" ? "是" : "Yes") : (lang === "zh" ? "否/未知" : "No/Unknown")}
            </span>
          </div>

          {overall.message && <p style={{ marginTop: 10, color: "#374151" }}>{overall.message}</p>}

          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={th}>Ingredient</th>
                  <th style={th}>Risk Level</th>
                  <th style={th}>{lang === "zh" ? "孩童風險？" : "Child Risk?"}</th>
                  <th style={th}>Badge</th>
                  <th style={th}>{lang === "zh" ? "台灣法規" : "Taiwan FDA Regulation"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>{r.reason}</div>
                    </td>
                    <td style={td}>
                      <RiskBadge level={r.risk} />
                      {r.risk}
                    </td>
                    <td style={td}>{r.childSafe === true ? "Yes" : r.childSafe === false ? "No" : "Unknown"}</td>
                    <td style={td}>{r.badge}</td>
                    <td style={td}>{r.twRule}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td style={{ ...td, color: "#6b7280" }} colSpan={5}>
                      {lang === "zh" ? "沒有資料" : "No rows to display."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 13,
  color: "#111827",
  borderBottom: "1px solid #e5e7eb",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "top",
  fontSize: 14,
};

