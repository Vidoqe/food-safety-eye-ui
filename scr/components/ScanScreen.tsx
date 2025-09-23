// scr/components/ScanScreen.tsx
import React, { useState } from 'react';

export default function ScanScreen() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Handle file input (camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result will be a base64 Data URL
      setImageDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Call the API
  const handleStartAnalysis = async () => {
    if (!imageDataUrl) {
      alert("Please take or select a photo first.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl, // ✅ always base64 Data URL
          language: 'en',
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis error", err);
      alert("Error: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Product Label</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {imageDataUrl && (
        <div style={{ marginTop: 12 }}>
          <img
            src={imageDataUrl}
            alt="preview"
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </div>
      )}

      <button
        onClick={handleStartAnalysis}
        disabled={loading || !imageDataUrl}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Analyzing…' : 'Start Analysis'}
      </button>

      {result && (
        <pre style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
