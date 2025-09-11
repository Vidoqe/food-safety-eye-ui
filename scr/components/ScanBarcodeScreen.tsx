import React, { useEffect, useRef, useState } from "react";

type Props = { onNavigate: (screen: string) => void };

// Typing for native BarcodeDetector (present on most Chromium browsers)
type BarcodeDetectorType = {
  new (opts?: { formats?: string[] }): {
    detect: (source: CanvasImageSource | ImageBitmap | ImageData | Blob) => Promise<
      { rawValue: string; format: string }[]
    >;
  };
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorType;
  }
}

export default function ScanBarcodeScreen({ onNavigate }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detector, setDetector] = useState<InstanceType<BarcodeDetectorType> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError(null);

        if (window.BarcodeDetector) {
          setDetector(
            new window.BarcodeDetector({
              formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "qr_code"] as any,
            })
          );
        }

        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }

        if (window.BarcodeDetector && detector) {
          const tick = async () => {
            await detectOnce();
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch {
        setError("Camera permission denied or not available.");
      }
    })();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detector]); // set after detector created

  const detectOnce = async () => {
    if (!detector || !videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    if (v.readyState < 2) return;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const results = await detector.detect(c);
    if (results.length) {
      setCode(results[0].rawValue);
      // stop camera after success (optional)
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const captureFallback = () => {
    // Simple capture if detector unsupported; still lets user take a photo
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    setError("Barcode detector not supported on this device. Photo captured.");
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const detectorSupported = Boolean(window.BarcodeDetector);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-xl font-bold mb-2">Scan Barcode</h1>
      <p className="text-gray-600 mb-4">Point the camera at the barcode. We’ll read it automatically.</p>

      <div className="mb-4">
        {error ? (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        ) : (
          <video ref={videoRef} className="w-full rounded-lg border" playsInline muted />
        )}
      </div>

      {code && (
        <div className="mb-4">
          <div className="text-sm text-gray-500">Detected code</div>
          <div className="text-lg font-semibold">{code}</div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {detectorSupported ? (
          <>
            {!code ? (
              <button onClick={() => onNavigate("home")} className="px-4 py-2 bg-gray-200 rounded-lg">
                Back
              </button>
            ) : (
              <button onClick={() => onNavigate("result")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Use This Code
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={captureFallback} className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Capture Photo (Fallback)
            </button>
            <button onClick={() => onNavigate("home")} className="px-4 py-2 bg-gray-200 rounded-lg">
              Back
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
