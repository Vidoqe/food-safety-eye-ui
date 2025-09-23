import React, { useRef, useState } from 'react';

type Row = {
  ingredient: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Unknown';
  childRisk: 'Yes' | 'No' | 'Unknown';
  badge: 'green' | 'yellow' | 'red' | 'gray';
  taiwanFda: string;
};

type ApiResponse =
  | {
      ok: true;
      overall: { verdict: string; summary: string; tips: string[] };
      diagnostics: Record<string, any>;
      ingredients: Row[];
    }
  | {
      ok: false;
      error: string;
      diagnostics: Record<string, any>;
    };

export default function ScanScreen() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [api, setApi] = useState<ApiResponse | null>(null);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Read as Data URL for API
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
    };
    reader.onerror = () => setError('Failed to read image.');
    reader.readAsDataURL(file);
  };

  const openCamera = () => {
    setError('');
    setApi(null);
    try {
      if (!inputRef.current) return;
      // Prefer modern picker if available
      // @ts-ignore
      if (inputRef.current.showPicker) inputRef.current.showPicker();
      else inputRef.current.click();
    } catch {
      inputRef.current?.click();
    }
  };

  const handleAnalyze = async () => {
    if (!imageDataUrl) {
      setError('No image selected yet.');
      return;
    }
    setIsAnalyzing(true);
    setError('');
    setApi(null);

    try {
      const resp = await fetch('/api/analyze-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,      // MUST be data URL
          language: 'en',
        }),
      });

      const json = (await resp.json()) as ApiResponse;
      setApi(json);
      if (!resp.ok || !json.ok) {
        setError(
          'API returned an error: ' +
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((json as any).error || resp.statusText)
        );
      }
    } catch (err: any) {
      setError('Request failed: ' + err?.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Scan Product Label</h1>

      {/* Hidden file input for camera/gallery */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // mobile hint
        // @ts-ignore
        capture="environment"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />

      <div className="space-y-3">
        <button
          onClick={openCamera}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
          disabled={isAnalyzing}
        >
          Take Photo
        </button>

        {previewUrl && (
          <div className="border rounded overflow-hidden bg-white">
            <img src={previewUrl} alt="preview" className="w-full object-contain max-h-[360px]" />
          </div>
        )}

        <button
          onClick={handleAnalyze}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded disabled:opacity-50"
          disabled={isAnalyzing || !imageDataUrl}
        >
          {isAnalyzing ? 'Analyzing…' : 'Start Analysis'}
        </button>

        <button
          onClick={() => {
            setImageDataUrl(null);
            setPreviewUrl(null);
            setApi(null);
            setError('');
          }}
          className="w-full h-12 border rounded"
          disabled={isAnalyzing}
        >
          Retake Photo
        </button>

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded p-3 text-sm">{error}</div>
        )}

        {/* Diagnostics & results (debug view) */}
        {api && (
          <div className="mt-4 space-y-4">
            <div className="border rounded p-3">
              <h2 className="font-semibold mb-2">Diagnostics (from API)</h2>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify((api as any).diagnostics, null, 2)}
              </pre>
            </div>

            {'ok' in api && api.ok && (
              <>
                <div className="border rounded p-3">
                  <h2 className="font-semibold mb-2">Overall</h2>
                  <div className="text-sm">{api.overall.verdict}</div>
                  <div className="text-sm text-gray-600">{api.overall.summary}</div>
                </div>

                <div className="border rounded p-3">
                  <h2 className="font-semibold mb-2">Ingredient Risk Analysis (mock)</h2>
                  <div className="text-xs text-gray-600 mb-2">
                    If you see rows here, the image reached the API as a data URL.
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-1">Ingredient</th>
                        <th className="py-1">Risk Level</th>
                        <th className="py-1">Child Risk?</th>
                        <th className="py-1">Badge</th>
                        <th className="py-1">Taiwan FDA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {api.ingredients.map((r, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="py-1">{r.ingredient}</td>
                          <td className="py-1">{r.riskLevel}</td>
                          <td className="py-1">{r.childRisk}</td>
                          <td className="py-1">{r.badge}</td>
                          <td className="py-1">{r.taiwanFda}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
