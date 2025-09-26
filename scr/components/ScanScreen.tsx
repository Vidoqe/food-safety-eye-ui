import React, { useRef, useState } from "react";

export default function ScanScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((l) => [...l, msg]);

  const pickPhoto = () => {
    inputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    // Preview
    const preview = URL.createObjectURL(file);
    setImageUrl(preview);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // data:image/...;base64,AAAA
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const startAnalysis = async () => {
    try {
      const file = inputRef.current?.files?.[0];
      if (!file) {
        addLog("No file selected");
        return;
      }

      const base64String = await fileToBase64(file);
      addLog(`Base64 length: ${base64String.length}`);

      const response = await fetch("/api/analyze-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ imageBase64: base64String }),
      });

      // Always try JSON first; if it fails, show raw text to help debugging
      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        addLog(`Non-JSON response: ${text.slice(0, 200)}`);
        throw new Error("Server did not return JSON");
      }

      if (!response.ok || json?.ok === false) {
        throw new Error(json?.error || `HTTP ${response.status}`);
      }

      addLog("Analysis complete: " + JSON.stringify(json, null, 2));
    } catch (err: any) {
      addLog("Error: " + (err?.message || String(err)));
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Preview */}
      <div className="border-2 border-dashed rounded-xl p-4 mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="mx-auto max-h-96 object-contain" />
        ) : (
          <p className="text-center text-sm opacity-70">No image selected</p>
        )}
      </div>

      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={pickPhoto}
          className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold"
        >
          Take Photo
        </button>
        <button
          onClick={startAnalysis}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold"
        >
          Start Analysis
        </button>
      </div>

      {/* Event log */}
      <div className="bg-white border rounded-md p-3 text-sm whitespace-pre-wrap">
        <strong>Event Log</strong>
        <div className="mt-2">
          {log.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
