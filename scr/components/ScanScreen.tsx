// scr/components/ScanScreen.tsx
import React, { useRef, useState } from "react";

// Small helper to add lines to the event log
function useLogger() {
  const [lines, setLines] = useState<string[]>([]);
  return {
    lines,
    add: (msg: string) => setLines((prev) => [...prev, msg]),
    clear: () => setLines([]),
  };
}

export default function ScanScreen() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const logger = useLogger();

  async function toBase64(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file); // yields data:image/...;base64,XXXX
    });
  }

  function onChooseClick() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    logger.clear();
    if (!file) {
      logger.add("No file selected");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    logger.add(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
  }

  async function startAnalysis() {
    const input = fileInputRef.current;
    const selectedFile = input?.files?.[0];

    logger.add("Starting analysis…");

    if (!selectedFile) {
      logger.add("No file selected");
      return;
    }

    try {
      setBusy(true);

      // Convert to base64
      const base64String = await toBase64(selectedFile);
      logger.add(`Base64 length: ${base64String.length}`);

      // POST JSON to our API
      const resp = await fetch("/api/analyze-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64String }),
      });

      // Try to parse JSON; if server returned text (e.g. error page), show that
      let result: any = null;
      const text = await resp.text();
      try {
        result = JSON.parse(text);
      } catch {
        logger.add(`Non-JSON response: ${text.slice(0, 200)}`);
      }

      if (!resp.ok) {
        logger.add(`Server error (${resp.status})`);
      }

      if (result) {
        logger.add("Analysis complete: " + JSON.stringify(result, null, 2));
      }
    } catch (err: any) {
      logger.add("Error: " + (err?.message ?? String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scan Product Label</h1>

      {/* Hidden input so mobile opens camera; keep it in DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Choose / Take Photo */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={onChooseClick}
          className="px-4 py-2 rounded bg-gray-200"
          disabled={busy}
        >
          Choose File
        </button>

        <button
          onClick={startAnalysis}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Analyzing…" : "Start Analysis"}
        </button>
      </div>

      {/* Preview */}
      <div className="mb-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="w-full rounded border"
          />
        ) : (
          <div className="text-sm text-gray-500">No image selected yet.</div>
        )}
      </div>

      {/* Event log */}
      <div className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">
        {logger.lines.length === 0
          ? "Event log will appear here…"
          : logger.lines.join("\n")}
      </div>
    </div>
  );
}
