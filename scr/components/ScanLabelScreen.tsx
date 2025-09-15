// scr/components/ScanLabelScreen.tsx
import React, { useCallback, useRef, useState } from "react";

type Props = {
  onImageSelected: (file: File) => void;
};

const ScanLabelScreen: React.FC<Props> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((m: string) => {
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${m}`, ...l].slice(0, 50));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) {
        addLog("No file selected.");
        return;
      }
      setPreviewUrl(URL.createObjectURL(f));
      addLog(`Selected ${f.name} (${Math.round(f.size / 1024)} KB)`);
      onImageSelected(f);
      // allow selecting the same file again
      e.target.value = "";
    },
    [addLog, onImageSelected]
  );

  const openCamera = async () => {
    addLog("Open camera requested (user gesture).");

    const input = inputRef.current;
    if (!input) {
      addLog("ERROR: inputRef is null.");
      return;
    }

    // Ensure attributes before opening
    input.accept = "image/*";
    // @ts-ignore - capture is non-standard but supported on mobile
    input.capture = "environment";

    // 1) Modern Chrome/Android
    // @ts-ignore
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

    // 2) Fallback for browsers without showPicker
    try {
      input.click();
      addLog("Used input.click() fallback.");
      return;
    } catch (e: any) {
      addLog("input.click() failed: " + e?.message);
    }

    // 3) Last nudge to surface permission prompt
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        s.getTracks().forEach((t) => t.stop());
        addLog("Permission nudged via getUserMedia; try button again.");
      }
    } catch (e: any) {
      addLog("getUserMedia failed: " + e?.message);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      {/* Keep input in the layout (NOT display:none / NOT hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // @ts-ignore
        capture="environment"
        onChange={handleChange}
        // visually invisible but present in layout
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Preview box */}
      <div className="mx-auto max-w-md">
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

        {/* Secondary: pick from gallery (optional) */}
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 block w-full text-center rounded-xl bg-gray-100 py-3 text-gray-800 hover:bg-gray-200 active:scale-[0.98] transition"
        >
          Choose From Gallery
        </button>

        {/* Tiny log for diagnosis */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-1">Event Log</div>
          <div className="text-xs bg-gray-50 border rounded p-2 h-40 overflow-auto">
            {log.length === 0 ? (
              <div className="text-gray-400">No events yet…</div>
            ) : (
              log.map((l, i) => <div key={i}>{l}</div>)
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            If nothing opens: ensure the site has camera permission (tap the lock icon → Site settings → Camera →
            Allow), then try again.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanLabelScreen;
