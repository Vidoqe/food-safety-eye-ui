import React, { useRef, useState } from "react";

type Props = {
  onNavigate: (screen: string) => void;
};

export default function ScanBarcodeScreen({ onNavigate }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch {
      // ignore and fallback
    }
    inputRef.current?.click();
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: run your barcode decoding on the picked image if you have it wired up.
    // Navigate to your intended next screen to keep flow consistent.
    onNavigate("result");
  };

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold mb-4">Scan Barcode</h1>
      <p className="text-gray-600 mb-6">
        Point your camera at the barcode or pick a photo with a barcode.
      </p>

      <button
        onClick={handleScan}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
