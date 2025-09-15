import React, { useCallback, useRef, useState } from "react";

type Props = {
  onImageSelected?: (file: File) => void;
};

const ScanLabelScreen: React.FC<Props> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) {
        setMsg("No file selected.");
        return;
      }
      const file = files[0];
      setPreviewUrl(URL.createObjectURL(file));
      onImageSelected?.(file);
      // allow selecting same file again
      e.target.value = "";
    },
    [onImageSelected]
  );

  const openCamera = useCallback(() => {
    setMsg("Opening camera…");
    const input = inputRef.current;
    if (!input) {
      setMsg("ERROR: inputRef is null");
      return;
    }
    // Use showPicker if present; otherwise click()
    // (Both require a user gesture: this button press)
    // @ts-ignore
    if (typeof input.showPicker === "function") {
      try {
        // @ts-ignore
        input.showPicker();
        return;
      } catch (e: any) {
        setMsg("showPicker failed: " + (e?.message || e));
      }
    }
    try {
      input.click();
    } catch (e: any) {
      setMsg("input.click() failed: " + (e?.message || e));
    }
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Scan Product Label</h1>

      {/* Hidden file input that the button will trigger */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: "none" }}
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
            <div>Capture ingredient list</div>
          </div>
        )}
      </div>

      {/* One simple button that opens the camera */}
      <button
        onClick={openCamera}
        className="block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-[0.98] transition"
      >
        Take Photo (label)
      </button>

      {/* Optional: a second button to pick from gallery */}
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-3 block w-full text-center rounded-xl bg-gray-100 py-3 text-gray-800 hover:bg-gray-200 active:scale-[0.98] transition"
      >
        Choose From Gallery
      </button>

      {/* Tiny status line */}
      {msg && <div className="mt-4 text-xs text-gray-500">{msg}</div>}
    </div>
  );
};

export default ScanLabelScreen;
