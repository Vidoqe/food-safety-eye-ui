// scr/components/ScanScreen.tsx
import React, { useState } from 'react';
import {
  captureImageFromCamera,
  analyzeProduct,
  type AnalysisResult,
} from '../services/gptImageAnalysis';

export default function ScanScreen() {
  const [img, setImg] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const takePhoto = async () => {
    setError(null);
    setResult(null);
    try {
      const base64 = await captureImageFromCamera();
      setImg(base64);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  };

  const runScan = async () => {
    if (!img) return setError('Please capture an image first');
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await analyzeProduct({ imageBase64: img, lang: 'zh' });
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Scan</h1>

      <div className="flex gap-2">
        <button
          onClick={takePhoto}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Take Photo / Choose Image
        </button>
        <button
          onClick={runScan}
          disabled={!img || loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {img && (
        <img
          src={img}
          alt="preview"
          className="mt-2 max-h-72 rounded-md border object-contain"
        />
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {result && (
        <pre className="rounded-md border bg-white p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
