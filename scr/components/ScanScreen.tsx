import React, { useRef, useState } from 'react';
const result = await AnalyzeProduct({
  image: imageDataUrl || "",
  ingredients: ingredientsText || "",
  barcode: barcodeText || "",
  lang: lang || "en",
});

export default function ScanScreen() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- helpers (same compression we used before) ---
  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function compressDataUrl(dataUrl: string, maxSide = 1400, quality = 0.75): Promise<string> {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Image decode failed'));
      img.src = dataUrl;
    });

    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }

  // --- UI actions ---
  const onClickTakePhoto = () => {
    setError(null);
    fileInputRef.current?.click(); // direct click on the input (safest on mobile)
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await fileToDataURL(file);
      const compressed = await compressDataUrl(dataUrl, 1400, 0.75);
      setPreview(compressed);
      console.log('[UI] picked image chars:', compressed.length);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      // allow picking the same file twice if user retries
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onAnalyze = async () => {
    if (!preview) return setError('Please capture an ingredient photo first');
    setLoading(true); setError(null);
    try {
      const res = await analyzeProduct({ imageBase64: preview, lang: 'zh' });
      console.log('[UI] analyzeProduct result:', res);
      // TODO: route to Result screen or lift state to parent
      alert('Analysis completed. Check console for JSON (temporary).');
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-4">Scan Product Label</h1>

      {/* Hidden input – this is what mobile browsers need */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFilePicked}
        className="hidden"
      />

      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 mb-4 flex items-center justify-center h-64">
        {preview ? (
          <img src={preview} alt="preview" className="max-h-60 object-contain" />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-5xl mb-2">📷</div>
            <div>Capture ingredient list</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClickTakePhoto}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-white font-medium hover:bg-emerald-700"
        >
          Take Photo
        </button>
        <button
          onClick={onAnalyze}
          disabled={!preview || loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
