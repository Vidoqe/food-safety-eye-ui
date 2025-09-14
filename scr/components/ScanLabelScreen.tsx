import React, { useRef, useState } from "react";

export default function ScanLabelScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    // TODO: send `file` to OCR backend here
    e.target.value = ""; // allow snapping again
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
        Scan Product Label
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        {/* Preview area */}
        <div className="aspect-[4/3] w-full rounded-xl border-2 border-dashed border-gray-300 grid place-items-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-400 text-lg text-center">
              Capture ingredient list
            </div>
          )}
        </div>

        {/* Button (label for hidden input) */}
        <label
          htmlFor="labelCamera"
          className="mt-6 block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-95 transition cursor-pointer"
        >
          📷 Take Photo
        </label>

        {/* Hidden but present input */}
        <input
          id="labelCamera"
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}
