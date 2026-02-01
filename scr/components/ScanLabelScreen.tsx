import React, { useCallback, useRef, useState } from "react";
import GPTImageAnalysisService, { type GPTAnalysisResult } from "../services/gptImageAnalysis";
const ScanLabelScreen: React.FC<Props> = ({ onImageSelected }) => {
const [result, setResult] = useState<GPTAnalysisResult | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const res = await GPTImageAnalysisService.analyzeProduct(base64);
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type Props = {
  onImageSelected?: (file: File) => void;
};


  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((m: string) => {
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${m}`, ...l].slice(0, 30));
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        addLog("No file selected.");
        return;
      }
     const file = files[0];

setSelectedFile(file);
setError(null);
setResult(null);

setPreviewUrl(URL.createObjectURL(file));
addLog(`Got file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
onImageSelected?.(file);
    },
    [addLog, onImageSelected]
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // allow picking the same file again later
    e.target.value = "";
  }, [handleFiles]);

  const openCamera = useCallback(async () => {
    addLog("Open camera requested (user gesture).");

    const input = inputRef.current;
    if (!input) {
      addLog("ERROR: inputRef is null.");
      return;
    }

    // 1) Modern Chrome on Android: showPicker opens the chooser/camera directly
    // Needs a user gesture (the button click)
    // @ts-ignore - showPicker is not in TS lib yet on all channels
    if (typeof input.showPicker === "function") {
      try {
        // @ts-ignore
        input.showPicker();
        addLog("Used input.showPicker().");
        return;
      } catch (e: any) {
        addLog("showPicker failed: " + e?.message);
      }
    }

    // 2) Fallback: regular click()
    try {
      input.click();
      addLog("Used input.click() fallback.");
      return;
    } catch (e: any) {
      addLog("input.click() failed: " + e?.message);
    }

    // 3) Last resort: nudge permission so the next attempt works
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        s.getTracks().forEach((t) => t.stop());
        addLog("Permission nudged via getUserMedia; try again.");
      }
    } catch (e: any) {
      addLog("getUserMedia failed: " + e?.message);
    }
  }, [addLog]);
const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const onAnalyze = useCallback(async () => {
  if (!selectedFile) {
    addLog("No image selected — take a photo first.");
    return;
  }

  try {
    setLoading(true);
    setError(null);
    addLog("Analyzing image...");

    const base64 = await fileToBase64(selectedFile);
addLog(`[UI] picked image chars: ${base64.length}`);

const res = await GPTImageAnalysisService.analyzeProduct(base64)

    setResult(res);
    addLog("Analysis done ✅");
  } catch (e: any) {
    const msg = e?.message || String(e);
    setError(msg);
    addLog("Analysis failed: " + msg);
  } finally {
    setLoading(false);
  }
}, [selectedFile, addLog]);


  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      <div className="mx-auto max-w-md">
        {/* Hidden file input the buttons will trigger */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onChange}
          className="hidden"
        />

        {/* Preview box */}
        <div className="border-2 border-dashed rounded-xl p-6 bg-white/70 mb-4 aspect-[4/3] flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="max-h-full max-w-full object-contain rounded" />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-5xl mb-2">📷</div>
              <div>Capture ingredient list</div>
            </div>
          )}
        </div>

        {/* Primary button */}
        <button
          onClick={openCamera}
          className="block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-[0.98] transition"
        >
          Take Photo (label)
        </button>

        {/* Secondary button (gallery) */}
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 block w-full text-center rounded-xl bg-gray-100 py-3 text-gray-800 hover:bg-gray-200 active:scale-[0.98] transition"
        >
          Choose From Gallery
        <button
  onClick={onAnalyze}
  disabled={loading || !selectedFile}
  className="mt-3 block w-full text-center rounded-xl bg-blue-600 py-3 text-white text-lg font-semibold disabled:opacity-50"
>
  {loading ? "Analyzing..." : "Analyze"}
</button>

{error && <div className="mt-3 text-sm text-red-600">{error}</div>}
{/* TEMP DEBUG OUTPUT */}
{result && (
  <pre className="mt-4 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
    {JSON.stringify(result, null, 2)}
  </pre>
)}

        {/* Tiny log for diagnosis */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-1">Event Log</div>
          <div className="text-xs bg-gray-50 border rounded p-2 h-40 overflow-auto">
            {log.length === 0 ? <div className="text-gray-400">No events yet.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            If nothing opens: make sure the site has camera permission (Chrome → lock icon → Site settings → Camera → Allow), then try again.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanLabelScreen;
