import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
type Props = {
  onBack: () => void;
title: string;
};


// If you already have TEXT + lang coming from props/context, you can rewire it later.
// This file is a "known-good compile" version to stop Vite errors first.
const TEXT: any = {
  en: {
    title: "Scan Ingredients",
    back: "Back",
    takePhoto: "Take Photo",
    gallery: "Gallery",
    capture: "Tap Take Photo or Gallery",
  },
  zh: {
    title: "掃描成分標籤",
    back: "返回",
    takePhoto: "拍照",
    gallery: "相簿",
    capture: "請按「拍照」或「相簿」",
  },
};
export default function ScanLabelScreen({ onBack }: Props ) { 
  const { language } = useAppContext();
const lang: "en" | "zh" = language === "zh" ? "zh" : "en";
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((p) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...p].slice(0, 30));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog("No file selected");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    addLog(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
  };

  const openCamera = async () => {
    try {
      // This is just to trigger permission in browsers that are picky.
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      s.getTracks().forEach((t) => t.stop());
      addLog("Camera permission OK (getUserMedia success). Opening file picker…");

      // open the file picker (camera on mobile if supported)
      inputRef.current?.click();
    } catch (e: any) {
      addLog("getUserMedia failed: " + (e?.message || String(e)));
      inputRef.current?.click(); // still try to open picker
    }
  };

  useEffect(() => {
    addLog("ScanLabelScreen mounted");
  }, []);

  return (
    <div className="px-4 py-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        {TEXT[lang].back}
      </button>

      {/* Title */}
     <h1 className="text-lg font-semibold mb-3">
  {TEXT[lang].title}
</h1>

      <div className="mx-auto max-w-md">
        {/* Hidden file input */}
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
            <img
              src={previewUrl}
              alt="preview"
              className="max-h-full max-w-full object-contain rounded"
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-5xl mb-2">📷</div>
              <div>{TEXT[lang].capture}</div>
            </div>
          )}
        </div>

        {/* Take Photo button */}
        <button
          type="button"
          onClick={openCamera}
          className="block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-[0.98] transition"
        >
          {TEXT[lang].takePhoto}
        </button>

        {/* Gallery button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 block w-full text-center rounded-xl bg-gray-100 py-3 text-gray-800 hover:bg-gray-200 active:scale-[0.98] transition"
        >
          {TEXT[lang].gallery}
        </button>

        {/* Tiny log for diagnosis */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-1">Event Log</div>

          <div className="text-xs bg-gray-50 border rounded p-2 h-40 overflow-auto">
            {log.length === 0 ? (
              <div className="text-gray-400">No events yet.</div>
            ) : (
              log.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>

          <div className="text-[11px] text-gray-500 mt-2">
            If nothing opens: Chrome → lock icon → Site settings → Camera → Allow, then refresh.
          </div>
        </div>
      </div>
    </div>
  );
}
