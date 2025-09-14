import React, { useRef, useState } from "react";

export default function ScanLabelScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  const log = (m: string) => {
    setEvents((e) => [`${new Date().toLocaleTimeString()}  ${m}`, ...e].slice(0, 60));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { log("onChange: no file"); return; }
    log(`onChange: got file (${file.type}, ${Math.round(file.size/1024)} KB)`);
    const url = URL.createObjectURL(file);
    setPreview(url);
    // TODO: send `file` to OCR backend here.
    e.target.value = ""; // allow immediate re-snap
  };

  const tryShowPicker = () => {
    if (inputRef.current && "showPicker" in HTMLInputElement.prototype) {
      log("showPicker(): calling");
      // @ts-ignore
      inputRef.current.showPicker();
    } else {
      log("showPicker(): not supported, fallback to input.click()");
      inputRef.current?.click();
    }
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
        Scan Product Label <span className="text-xs text-gray-400">(probe)</span>
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-xl space-y-4">
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

        {/* B) Normal flow: LABEL-AS-BUTTON */}
        <label
          ref={labelRef}
          htmlFor="labelCamera"
          onClick={() => log("label clicked")}
          className="block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-95 transition cursor-pointer"
        >
          📷 Take Photo (label)
        </label>

        {/* Keep input PRESENT (not display:none). Visually hidden. */}
        <input
          id="labelCamera"
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onClick={() => log("input.click fired")}
          onChange={onFileChange}
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
        />

        <div className="grid gap-2 sm:grid-cols-2">
          {/* A) Plain visible input (baseline) */}
          <div className="border rounded-xl p-3">
            <div className="text-sm font-semibold mb-2">A) Native file input</div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onClick={() => log("VISIBLE input.click")}
              onChange={onFileChange}
              className="block w-full border rounded p-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Should always open camera/picker if site has permission.
            </p>
          </div>

          {/* C) showPicker() fallback */}
          <div className="border rounded-xl p-3">
            <div className="text-sm font-semibold mb-2">C) showPicker() button</div>
            <button
              onClick={tryShowPicker}
              className="w-full rounded bg-blue-600 text-white py-2 font-semibold"
            >
              Try showPicker()
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Newer Chrome method; falls back to input.click().
            </p>
          </div>
        </div>
      </div>

      {/* Event log */}
      <div className="mt-6 rounded-xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Event Log</h2>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-sm text-gray-700">
{events.join("\n")}
        </pre>
      </div>
    </div>
  );
}
