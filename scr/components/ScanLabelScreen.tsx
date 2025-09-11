import React, { useEffect, useRef, useState } from "react";

type Props = { onNavigate: (screen: string) => void };

export default function ScanLabelScreen({ onNavigate }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setError(null);
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
      } catch {
        setError("Camera permission denied or not available.");
      }
    })();

    return () => {
      active = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []); // mount once

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.92);
    setPhoto(data);
    // optional: stop stream after capture
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-xl font-bold mb-2">Scan Product Label</h1>
      <p className="text-gray-600 mb-4">
        Point the camera at the ingredients panel, then tap Capture.
      </p>

      {!photo ? (
        <div className="mb-4">
          {error ? (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          ) : (
            <video ref={videoRef} className="w-full rounded-lg border" playsInline muted />
          )}
        </div>
      ) : (
        <div className="mb-4">
          <img src={photo} alt="Captured label" className="w-full rounded-lg border" />
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {!photo ? (
          <>
            <button onClick={capture} className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Capture
            </button>
            <button onClick={() => onNavigate("home")} className="px-4 py-2 bg-gray-200 rounded-lg">
              Back
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate("result")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Analyze
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
