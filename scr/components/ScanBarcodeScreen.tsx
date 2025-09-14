import React, { useRef, useState } from "react";

type Detected = { format: string; rawValue: string };

export default function ScanBarcodeScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detected[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportsBD = "BarcodeDetector" in window;

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDetections(null);

    const url = URL.createObjectURL(file);
    setPreview(url);

    if (!supportsBD) {
      setError("BarcodeDetector not supported on this device/browser.");
      e.target.value = "";
      return;
    }

    try {
      // @ts-ignore experimental lib typing
      const detector = new BarcodeDetector({
        formats: [
          "qr_code","ean_13","ean_8","code_128","code_39","code_93",
          "itf","upc_a","upc_e","codabar","data_matrix","pdf417","aztec"
        ],
      });

      const img = new Image();
      img.src = url;
      await img.decode();

      let source: CanvasImageSource = img;
      if ("createImageBitmap" in window) {
        source = await createImageBitmap(img);
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const w = (source as any).width || img.width;
      const h = (source as any).height || img.height;
      canvas.width = w; canvas.height = h;
      ctx.drawImage(source as any, 0, 0, w, h);

      const results = await detector.detect(canvas);
      setDetections(results.map((r: any) => ({ format: r.format, rawValue: r.rawValue })));
    } catch (e: any) {
      setError(e?.message ?? "Barcode detection failed.");
    }

    e.target.value = ""; // allow immediate re-snap
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
        Scan Barcode
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="aspect-[4/3] w-full rounded-xl border-2 border-dashed border-gray-300 grid place-items-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-400 text-lg text-center">
              Point at barcode and snap
            </div>
          )}
        </div>

        {/* LABEL-AS-BUTTON */}
        <label
          htmlFor="barcodeCamera"
          className="mt-6 block w-full text-center rounded-xl bg-green-600 py-3 text-white text-lg font-semibold hover:bg-green-700 active:scale-95 transition cursor-pointer"
        >
          📸 Snap Barcode
        </label>

        <input
          id="barcodeCamera"
          ref={inputRef}
          type="file"
          accept="image/*;capture=camera"
          capture="environment"
          onChange={onFileChange}
          style={{ display: "none" }}
        />

        <div className="mt-6 text-sm text-gray-500">
          getUserMedia: <b>not needed</b> • BarcodeDetector:{" "}
          <b className={supportsBD ? "text-green-600" : "text-red-600"}>
            {supportsBD ? "YES" : "NO"}
          </b>
        </div>

        {error && <p className="mt-2 text-red-600 text-sm">Error: {error}</p>}

        {detections && (
          <div className="mt-3">
            <h3 className="font-semibold mb-2">Detections</h3>
            {detections.length === 0 ? (
              <div className="text-gray-500">None</div>
            ) : (
              <ul className="list-disc pl-5">
                {detections.map((d, i) => (
                  <li key={i}>
                    <span className="font-mono">{d.format}</span>:{" "}
                    <span className="font-semibold">{d.rawValue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
