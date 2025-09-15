mport React, { useRef, useState, useCallback } from "react";

type Props = {
  onImageSelected?: (file: File) => void;
};

const ScanLabelScreen: React.FC<Props> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((m: string) => {
    setLog((l) => [new Date().toLocaleTimeString() + " " + m, ...l].slice(0, 50));
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        addLog("No file selected.");
        return;
      }
      const file = files[0];
      setPreviewUrl(URL.createObjectURL(file));
      addLog(`Got file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      onImageSelected?.(file);
    },
    [addLog, onImageSelected]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ""; // reset so same file again still fires change
  };

  const openCamera = async () => {
    addLog("Open camera requested (user gesture).");

    const input = inputRef.current;
    if (!input) {
      addLog("ERROR: inputRef is null");
      return;
    }

    // 1) Try modern Chrome showPicker()
    if (typeof input.showPicker === "function") {
      try {
        // @ts-ignore
        input.showPicker();
        addLog("Used input.showPicker()");
        return;
      } catch (e: any) {
        addLog("showPicker failed: " + e?.message);
      }
    }

    // 2) Fallback: input.click()
    try {
      input.click();
      addLog("Used input.click() fallback");
      return;
    } catch (e: any) {
      addLog("input.click() failed: " + e?.message);
    }

    // 3) Last resort: nudge getUserMedia (no preview, just permission)
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        s.getTracks().forEach((t) => t.stop());
        addLog("Permission nudged via getUserMedia; try again.");
      }
    } catch (e: any) {
      addLog("getUserMedia failed: " + e?.message);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      <div className="mx-auto max-w-md">
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onChange}
          style={{ display: "none" }}   // ✅ replaced className="hidden"
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

        {/* Secondary button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 block w-full text-center rounded-xl bg-gray-100 py-3 text-gray-800 hover:bg-gray-200 active:scale-[0.98] transition"
        >
          Choose From Gallery
        </button>

        {/* Log for debugging */}
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
            If nothing opens: make sure the site has camera permission (Chrome → lock icon → Site settings → Camera → Allow).
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanLabelScreen;
