import React, { useRef, useState } from "react";

const ScanScreen: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>("");

  // Helper to log messages
  const addLog = (msg: string) => {
    setLog((prev) => new Date().toLocaleTimeString() + " " + msg + "\n" + prev);
  };

  // Handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    addLog(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    e.target.value = "";
  };

  // Open camera
  const openCamera = () => {
    inputRef.current?.click();
  };

  // Convert file → base64 and send to API
  const startAnalysis = async () => {
    if (!selectedFile) {
      addLog("No file selected for analysis.");
      return;
    }

    try {
      const base64String: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile); // Converts to data:image/jpeg;base64,...
      });

      addLog(`Base64 length: ${base64String.length}`);

      const response = await fetch("/api/analyze-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64String }),
      });

      const result = await response.json();
      addLog("Analysis complete: " + JSON.stringify(result, null, 2));
    } catch (err: any) {
      addLog("Error: " + err.message);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      {/* Hidden camera input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      {/* Preview image */}
      <div className="border-2 border-dashed rounded-xl p-6 bg-white/70 mb-4 flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="max-h-64 object-contain rounded" />
        ) : (
          <div className="text-gray-500 text-center">📷 Capture ingredient list</div>
        )}
      </div>

      {/* Buttons */}
      <button
        onClick={openCamera}
        className="block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-95 transition"
      >
        Take Photo
      </button>

      <button
        onClick={startAnalysis}
        className="mt-3 block w-full text-center rounded-xl bg-blue-600 py-3 text-white text-lg font-semibold hover:bg-blue-700 active:scale-95 transition"
      >
        Start Analysis
      </button>

      {/* Log */}
      <div className="mt-6 text-xs text-gray-500">
        <b>Event Log</b>
        <pre className="border rounded p-2 h-40 overflow-auto whitespace-pre-wrap">
          {log || "No events yet…"}
        </pre>
      </div>
    </div>
  );
};

export default ScanScreen;
