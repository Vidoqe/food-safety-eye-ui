import React, { useRef, useState } from "react";
import { analyzeProduct } from "../services/gptImageAnalysis";

type ScanScreenProps = {
  type: "label" | "barcode";
  onBack: () => void;
  // AppLayout passes this – we call it when scan is done
  onResult: (result: any | null, error?: string) => void;
};

export default function ScanScreen({ type, onBack, onResult }: ScanScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- helpers (same compression as before) ---
  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function compressDataUrl(
    dataUrl: string,
    maxSide = 1400,
    quality = 0.75
  ): Promise<string> {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Image decode failed"));
      img.src = dataUrl;
    });

    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  }

  // --- UI actions ---
  const onClickTakePhoto = () => {
    setError(null);
    fileInputRef.current?.click(); // open camera / picker
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const dataUrl = await fileToDataURL(file);
      const compressed = await compressDataUrl(dataUrl, 1600, 0.90);
      setPreview(compressed);
      console.log("[UI] picked image chars:", compressed.length);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      // allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onAnalyze = async () => {
    if (!preview) {
      setError(
        type === "barcode"
          ? "Please capture a barcode photo first"
          : "Please capture an ingredient photo first"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await analyzeProduct({
        imageBase64: preview,
        lang: "zh",
        mode: type, // just a hint, backend can ignore this
      });

      console.log("[UI] analyzeProduct result:", res);

      // 🔥 Send result up to AppLayout so it shows the big result screen
      onResult(res, undefined);
    } catch (err: any) {
      console.error("[UI] analyzeProduct error:", err);
      const msg = err?.message ?? String(err);
      setError(msg);
      onResult(null, msg);
    } finally {
      setLoading(false);
    }
  };
// Temporary bilingual support (safe version)
const isChinese =
  (typeof navigator !== "undefined" &&
    navigator.language.toLowerCase().startsWith("zh")) ||
  (typeof document !== "undefined" &&
    document.documentElement.lang?.toLowerCase().startsWith("zh"));

// Title text
const title =
  type === "barcode"
    ? isChinese
      ? "掃描產品條碼"
      : "Scan Product Barcode"
    : isChinese
      ? "掃描產品成分標籤"
      : "Scan Product Label";

// Placeholder text
const placeholder =
  type === "barcode"
    ? isChinese
      ? "拍攝條碼"
      : "Capture barcode"
    : isChinese
      ? "拍攝成分列表"
      : "Capture ingredient list";
  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">{title}</h1>

      {/* Hidden input – mobile browsers need this */}
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
            <div>{placeholder}</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
  <button
    onClick={onClickTakePhoto}
    className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-white font-medium"
  >
    {isChinese ? "拍照" : "Take Photo"}
  </button>

  <button
    onClick={onAnalyze}
    disabled={!preview || loading}
    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
  >
    {loading
      ? (isChinese ? "分析中..." : "Analyzing...")
      : (isChinese ? "開始分析" : "Analyze")}
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
