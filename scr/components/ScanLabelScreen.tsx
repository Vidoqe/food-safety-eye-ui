import { useRef, useState } from "react";

const ScanLabelScreen = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const addLog = (msg: string) =>
    setLog((l) => [...l, msg]);

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      s.getTracks().forEach((t) => t.stop());
      addLog("Camera permission OK");
    } catch (e: any) {
      addLog("getUserMedia failed: " + e?.message);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    addLog("Image selected");
  };

  return (
    <div className="px-4 py-6">

      {/* Back */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        Back
      </button>

      <h1 className="text-xl font-semibold mb-4">Scan Label</h1>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />

      <div className="border-2 border-dashed rounded-xl p-6 mb-4 text-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="max-h-64 mx-auto rounded"
          />
        ) : (
          <div className="text-gray-500">No image selected</div>
        )}
      </div>

      <button
        onClick={openCamera}
        className="block w-full rounded-xl bg-green-600 py-3 text-white font-semibold"
      >
        Take Photo
      </button>

      <button
        onClick={() => inputRef.current?.click()}
        className="mt-3 block w-full rounded-xl bg-gray-200 py-3 text-gray-800"
      >
        Gallery
      </button>

      {/* Tiny log */}
      <div className="mt-6">
        <div className="text-sm font-semibold mb-1">Event Log</div>
        <div className="text-xs bg-gray-50 border rounded p-2 h-32 overflow-auto">
          {log.length === 0 ? (
            <div className="text-gray-400">No events yet.</div>
          ) : (
            log.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
      </div>

    </div>
  );
};

export default ScanLabelScreen;
