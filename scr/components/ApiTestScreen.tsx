// scr/components/ApiTestScreen.tsx
import React, { useState } from "react";
import { analyzeProduct, type AnalyzeResult } from "../services/gptImageAnalysis";

export default function FoodSafetyAnalyser() {
  const [ingredients, setIngredients] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    (input as any).capture = "environment";
    input.onchange = async () => {
      const file = (input as HTMLInputElement).files?.[0];
      if (!file) return;
      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      setImage(dataUrl);
    };
    input.click();
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await analyzeProduct({
        image: image ?? "",
        ingredients: ingredients.trim(),
        barcode: barcode.trim(),
        lang,
      });
      if (!r.ok) {
        setError(r.message || "Analysis failed");
      }
      setResult(r);
      // quick confirm
      alert(`Edge responded ok=${r.ok}\n` + JSON.stringify(r, null, 2).slice(0, 1500));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || String(e));
      alert(`Error: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>API Test Screen</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Ingredients (text)
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            style={{ width: "100%" }}
            placeholder="e.g. sugar, milk, salt, flavour"
          />
        </label>

        <label>
          Barcode
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="e.g. 4712345678901"
          />
        </label>

        <label>
          Language
          <select value={lang} onChange={(e) => setLang(e.target.value as "zh" | "en")}>
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>

        <div>
          <button onClick={pickImage}>Pick/Take Image</button>
          {image ? <span style={{ marginLeft: 8 }}>📷 image attached</span> : null}
        </div>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        {error && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>}

        {result && (
          <details open>
            <summary>Result JSON</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
