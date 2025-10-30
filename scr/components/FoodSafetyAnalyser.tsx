// scr/components/FoodSafetyAnalyser.tsx
import React, { useMemo, useState } from "react";
import { AnalyzeProduct } from "../services/gptImageAnalysis";

type Lang = "zh" | "en";

export default function FoodSafetyAnalyser() {
  // form state
  const [ingredients, setIngredients] = useState("");
  const [barcode, setBarcode] = useState("");
  const [lang, setLang] = useState<Lang>("zh");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // ui state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // result state
  const [overall, setOverall] = useState<{
    risk?: "Low" | "Moderate" | "High" | "Unknown";
    message?: string;
    childSafeOverall?: boolean;
  }>({});
  const [rows, setRows] = useState<
    Array<{
      name: string;
      riskLevel: "healthy" | "low" | "moderate" | "harmful" | "unknown";
      badge?: "green" | "yellow" | "red" | "gray";
      reason?: string;
      taiwanRegulation?: string;
      childSafe?: boolean;
    }>
  >([]);

  // enable button only if user provided at least one input
  const canAnalyze = useMemo(
    () =>
      Boolean(
        (ingredients && ingredients.trim()) ||
          (barcode && barcode.trim()) ||
          imageDataUrl
      ),
    [ingredients, barcode, imageDataUrl]
  );

  // pick or take image -> save as DataURL
  const pickImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setImageDataUrl(String(reader.result || ""));
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const resetImage = () => setImageDataUrl(null);

  // call Edge
  async function analyze() {
    setError(null);
    if (!canAnalyze) {
      setError(lang === "zh" ? "請輸入成分、條碼或上傳圖片（需要至少一項）" : "Enter ingredients, barcode, or upload an image (at least one).");
      return;
    }
    try {
      setLoading(true);

      const payload = {
  image: imageDataUrl || undefined,
  ingredients: ingredients.trim() || undefined,
  barcode: barcode.trim() || undefined,
  lang,
};

// 🔍 Debugging lines
console.log("[DEBUG] canAnalyze =", canAnalyze);
console.log("[DEBUG] payload about to send:", payload);

const res = await AnalyzeProduct(payload);
console.log("[DEBUG] [Analyze] result:", res);


      // Normalize: the Edge returns { ok, result }, but older code expects fields at top-level
const data: any = (res && "result" in (res as any)) ? (res as any).result : res;

if (!data || data.ok === false) {
  setError(
    (data && data.message) ||
    (lang === "zh" ? "分析失敗" : "Analysis failed")
  );
  setRows([]);
  setOverall({});
  return;
}

// Update UI from normalized data
setOverall({
  risk: data.overallResult?.risk,
  message: data.overallResult?.message,
  childSafeOverall: data.overallResult?.childSafeOverall,
});
setRows(data.table || []);

// TEMP: visual feedback for testing
alert(
  (lang === "zh"
    ? "分析完成\n"
    : "Analysis completed.\n") + "Check console for JSON (temporary)."
);

      // TEMP: useful while UI evolves
      alert(
        (lang === "zh" ? "分析完成。\n" : "Analysis completed.\n") +
          "Check console for JSON (temporary)."
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message || (lang === "zh" ? "發生錯誤" : "Unexpected error"));
    } finally {
      setLoading(false);
    }
  }

  // simple UI
  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        {lang === "zh" ? "食安分析" : "Food Safety Analysis"}
      </h2>

      {/* Ingredients */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          {lang === "zh" ? "成分（文字）" : "Ingredients (text)"}
        </label>
        <input
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={
            lang === "zh" ? "例如：sugar, milk, salt, flavour" : "e.g., sugar, milk, salt, flavour"
          }
          style={inputStyle}
        />
      </div>

      {/* Barcode */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          {lang === "zh" ? "條碼（可選）" : "Barcode (optional)"}
        </label>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder={lang === "zh" ? "例如：4712345678901" : "e.g., 4712345678901"}
          style={inputStyle}
        />
      </div>

      {/* Language */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          {lang === "zh" ? "語言" : "Language"}
        </label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          style={{ ...inputStyle, height: 40 }}
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Image picker + Analyze */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="button"
          onClick={imageDataUrl ? resetImage : pickImage}
          style={secondaryButtonStyle}
        >
          {imageDataUrl ? (lang === "zh" ? "重新選擇圖片" : "Pick Another Image")
                        : (lang === "zh" ? "拍照/選擇圖片" : "Pick/Take Image")}
        </button>

        <button
          type="button"
          onClick={analyze}
          disabled={loading || !canAnalyze}
          style={{
            ...primaryButtonStyle,
            opacity: loading || !canAnalyze ? 0.6 : 1,
            cursor: loading || !canAnalyze ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (lang === "zh" ? "分析中…" : "Analyzing…") : (lang === "zh" ? "分析" : "Analyze")}
        </button>
      </div>

      {/* Preview */}
      {imageDataUrl && (
        <div style={{ marginTop: 12 }}>
          <img
            src={imageDataUrl}
            alt="preview"
            style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #eee" }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 16, color: "#b00020", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {(overall.risk || rows.length > 0) && (
        <div style={{ marginTop: 20 }}>
          {overall.risk && (
            <div style={{ marginBottom: 10, fontWeight: 600 }}>
              {lang === "zh" ? "整體風險" : "Overall Risk"}: {overall.risk}
              {overall.childSafeOverall !== undefined &&
                `  •  ${lang === "zh" ? "兒童安全" : "Child-safe"}: ${
                  overall.childSafeOverall ? (lang === "zh" ? "是" : "Yes") : (lang === "zh" ? "否" : "No")
                }`}
            </div>
          )}

          {overall.message && (
            <div style={{ marginBottom: 16, color: "#444" }}>{overall.message}</div>
          )}

          {rows.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Ingredient", "Risk", "Badge", "Reason", "TW Rule", "Child-safe"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{r.name}</td>
                    <td style={tdStyle}>{r.riskLevel}</td>
                    <td style={tdStyle}>{r.badge ?? "-"}</td>
                    <td style={tdStyle}>{r.reason ?? "-"}</td>
                    <td style={tdStyle}>{r.taiwanRegulation ?? "-"}</td>
                    <td style={tdStyle}>{r.childSafe === undefined ? "-" : r.childSafe ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* ----- inline styles ----- */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "#12B981",
  color: "#fff",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#f9f9f9",
  color: "#333",
  fontWeight: 600,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #eee",
  background: "#fafafa",
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #f2f2f2",
};
