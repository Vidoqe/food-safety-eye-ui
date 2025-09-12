import React, { useRef, useState } from "react";

type Props = {
  onNavigate: (screen: string) => void;
};

export default function ScanLabelScreen({ onNavigate }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try to explicitly request camera; if that fails, click the file input as fallback.
  const handleScan = async () => {
    setError(null);
    // Attempt to trigger the permission prompt via getUserMedia
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        // We don’t actually render the stream here (no design change).
        // Immediately stop it and let the user use the file picker fallback.
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      // ignore — we’ll fallback to file input
    }
    // Always trigger the reliable fallback so the user can pick or capture a photo
    inputRef.current?.click();
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     // TODO: plug into your existing processing flow if needed.
     // For now we just navigate to result (keeps current app flow intact).
     onNavigate("result");
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold mb-4">Scan Product Label</h1>
      <p className="text-gray-600 mb-6">
        Take a photo of the ingredients panel or select an existing image.
      </p>

      <button
        onClick={handleScan}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Open Camera / Gallery
      </button>

      <div className="mt-4">
        <button
          onClick={() => onNavigate("home")}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Back to Home
        </button>
      </div>

      {/* Fallback input – opens camera on most Android devices because of capture="environment" */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFilePicked}
      />

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
