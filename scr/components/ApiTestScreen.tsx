// scr/components/ApiTestScreen.tsx
import React, { useState } from 'react';
import { analyzeProduct, type AnalysisResult } from '../services/gptImageAnalysis';

interface ApiTestScreenProps {
  onClose?: () => void;
}

export default function ApiTestScreen({ onClose }: ApiTestScreenProps) {
  const [ingredients, setIngredients] = useState<string>('水、糖、檸檬酸、苯甲酸鈉、人工香料、黃色5號');
  const [barcode, setBarcode] = useState<string>(''); // e.g. 4710088412345
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runIngredientsTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await analyzeProduct({
        imageBase64: '',
        ingredients,
        barcode: '',
        lang,
      });
      setResult(resp);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const runBarcodeTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await analyzeProduct({
        imageBase64: '',
        ingredients: '',
        barcode,
        lang,
      });
      setResult(resp);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const runEmptyTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await analyzeProduct({
        imageBase64: '',
        ingredients: '',
        barcode: '',
        lang,
      });
      setResult(resp);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">API Test Screen</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            Close
          </button>
        )}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Ingredients (text)</label>
          <textarea
            className="w-full rounded-md border p-2"
            rows={6}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Paste an ingredient list here…"
          />
          <button
            onClick={runIngredientsTest}
            disabled={loading}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Testing…' : 'Test Ingredients'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Barcode</label>
          <input
            className="w-full rounded-md border p-2"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="e.g. 4710088412345"
          />

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Language</label>
            <select
              className="rounded-md border p-2"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'zh' | 'en')}
            >
              <option value="zh">zh</option>
              <option value="en">en</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runBarcodeTest}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing…' : 'Test Barcode'}
            </button>
            <button
              onClick={runEmptyTest}
              disabled={loading}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Testing…' : 'Test Empty (should error)'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          <div className="font-semibold">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {result && (
        <div className="rounded-md border bg-white p-3">
          <div className="mb-2 font-semibold">Raw Response</div>
          <pre className="max-h-[50vh] overflow-auto text-xs leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
