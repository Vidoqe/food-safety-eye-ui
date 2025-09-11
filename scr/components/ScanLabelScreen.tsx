import React, { useEffect, useRef, useState } from "react";

type Props = { onNavigate: (screen: string) => void };

export default function ScanLabelScreen({ onNavigate }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // start camera when the screen mounts
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
          // iOS requires play() to be called after srcObject set
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        setError("Camera permission denied or not available.");
      }
    })();

    // stop camera on unmount
    return () => {
      active = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []); // run once

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const data = canvas.toDataURL("image/jpeg", 0.92);
    setPhotoDataUrl(data);
    // Stop the stream after capture (optional)
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-2 text-center">Scan Product Label</h1>
      <p className="text-gray-600 mb-4 text-center">
        Point the camera at the ingredients panel. Tap “Capture” to take a photo.
      </p>

      {/* Live preview */}
      {!photoDataUrl && (
        <div className="mb-4">
          {error ? (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full rounded-lg border"
              // iOS Safari sometimes needs controls hidden but present
              controls={false}
              autoPlay
            />
          )}
        </div>
      )}

      {/* After capture, show the picture */}
      {photoDataUrl && (
        <div className="mb-4">
          <img src={photoDataUrl} alt="Captured label" className="w-full rounded-lg border" />
        </div>
      )}

      <div className="flex gap-3 justify-center">
        {!photoDataUrl ? (
          <button
            onClick={takePhoto}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Capture
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                // If you want to process OCR later, keep photoDataUrl here
                onNavigate("result");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Analyze
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

      {/* hidden canvas used to grab a frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
