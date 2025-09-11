import React, { useEffect, useRef, useState } from "react";

type Props = { onNavigate: (screen: string) => void };

type BarcodeDetectorType = {
  new (opts?: { formats?: string[] }): {
    detect: (source: CanvasImageSource | ImageBitmap | ImageData | Blob) => Promise<
      { rawValue: string; format: string; cornerPoints?: { x: number; y: number }[] }[]
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
  const [error, setError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [detectorReady, setDetectorReady] = useState<boolean>(false);
  const detectorRef = useRef<InstanceType<BarcodeDetectorType> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError(null);

        // Create detector if available
        if (window.BarcodeDetector) {
          detectorRef.current = new window.BarcodeDetector({
            formats: [
              "ean_13",
              "ean_8",
              "code_128",
              "code_39",
              "upc_e",
              "upc_a",
              "qr_code",
            ],
          } as any);
          setDetectorReady(true);
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

        if (detectorRef.current) {
          // start detection loop
          const tick = () => {
            detectFrame();
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch (e) {
        setError("Camera permission denied or not available.");
      }
    })();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const detectFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !detectorRef.current) return;
    if (video.readyState < 2) return;

    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    const codes = await detectorRef.current.detect(canvas);
    if (codes.length > 0) {
      setLastCode(codes[0].rawValue);
      // Optional: stop once found
      stream?.getTracks().forEach((t) => t.stop());
    }
  };

  const capturePhotoFallback = () => {
    // simple one-shot photo if no detector (keeps screen useful)
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, videoWidth, videoHeight);
    setError("Barcode detector not supported on this device. Photo captured.");
    stream?.getTracks().forEach((t) => t.stop());
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2 text-center">Scan Barcode</h1>
      <p className="text-gray-600 mb-4 text-center">
        Point the camera at the barcode. We’ll read it automatically.
      </p>

      <div className="mb-4">
        {error ? (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        ) : (
          <video ref={videoRef} playsInline muted className="w-full rounded-lg border" />
        )}
      </div>

      {lastCode && (
        <div className="mb-4 text-center">
          <div className="text-sm text-gray-500">Detected barcode</div>
          <div className="text-lg font-semibold">{lastCode}</div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {detectorReady ? (
          <>
            {!lastCode ? (
              <button
                onClick={() => onNavigate("home")}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Back to Home
              </button>
            ) : (
              <button
                onClick={() => onNavigate("result")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Use This Code
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={capturePhotoFallback}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Capture Photo (Fallback)
            </button>
            <button
              onClick={() => onNavigate("home")}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Back to Home
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
