import React, { useRef, useState } from "react";
import { analyzeProduct } from "../services/gptImageAnalysis";
import { useAppContext } from "../contexts/AppContext";


type ScanScreenProps = {
  type: "label" | "barcode";
  onBack: () => void;
  // AppLayout passes this – we call it when scan is done
  onResult: (result: any | null, error?: string) => void;
};

export default function ScanScreen({ type, onBack, onResult }: ScanScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>("");
const isValidPreview =
  !!preview && (preview.startsWith("data:") || preview.startsWith("blob:"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- helpers (same compression as before) ---
  
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
// Convert a File to base64 DataURL (no compression)
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

    // Convert to base64 with NO compression for best OCR
    const dataUrl = await fileToDataUrl(file);

    setPreview(dataUrl);

  } catch (err: any) {
    setError(err?.message ?? String(err));
  } finally {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};

 const onAnalyze = async () => {
  if (!preview) {
    setError(
      safeType === "barcode"
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
      lang: isChinese ? "zh" : "en",
      mode: safeType, // barcode is effectively disabled
    });
    // ... keep the rest of your code the sameF

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
// Use the same language setting as ManualInputScreen
const { language } = useAppContext();
const isChinese = language === "zh";

// TEMP: disable barcode mode – always treat as ingredient label
const safeType = type === "barcode" ? "label" : type;
// Title text
const title =
  safeType === "barcode"
    ? isChinese
      ? "掃描產品條碼"
      : "Scan Product Barcode"
    : isChinese
      ? "掃描成分標籤"
      : "Scan Product Label";

// Placeholder text
const placeholder =
  safeType === "barcode"
    ? isChinese
      ? "拍攝條碼"
      : "Capture barcode"
    : isChinese
      ? "拍攝成分列表"
      : "Capture ingredient list";
  return (
  <div className="mx-auto max-w-md p-4">
    {/* Back button */}
    <button
      type="button"
      onClick={onBack}
      className="mb-4 text-sm text-blue-600 hover:underline"
    >
      {isChinese ? "返回" : "Back"}
    </button>

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

      {isValidPreview ? (
  // ✅ Looks like a real image preview
  <img
    src={preview}
    alt="preview"
    className="max-h-60 object-contain"
  />
) : preview ? (
  // ❗ Preview string exists but is not a valid DataURL — prevent broken icon
  <div className="text-center text-gray-400">
    <div className="text-5xl mb-2">✅</div>
    <div>
      {isChinese
        ? "照片已拍攝，請點選「開始分析」"
        : "Photo captured — tap Analyze"}
    </div>
  </div>
) : (
  // 📷 No photo yet — show original placeholder
  <div className="text-center text-gray-400">
    <div className="text-5xl mb-2">📷</div>
    <div>{placeholder}</div>
  </div>
)}


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
