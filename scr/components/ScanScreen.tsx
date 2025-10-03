import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ScanScreen() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [log, setLog] = useState("");

  const addLog = (msg: string) => setLog((p) => (p ? p + "\n" : "") + msg);

  async function handleAnalyze() {
    if (!selectedFile) {
      addLog("No file selected");
      return;
    }

    try {
      addLog("Uploading to Supabase…");
      const fileName = `scan-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("scans")
        .upload(fileName, selectedFile, { upsert: true });

      if (error) {
        addLog("Upload error: " + error.message);
        return;
      }

      addLog("Upload OK: " + data.path);

      const res = await fetch("/api/analyze-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath: data.path }),
      });

      const json = await res.json();
      addLog("Analysis result:\n" + JSON.stringify(json, null, 2));
    } catch (err: any) {
      addLog("Unexpected error: " + (err?.message || String(err)));
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 640, margin: "0 auto" }}>
      <h1>Scan Product Label</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleAnalyze}
          style={{
            padding: "10px 16px",
            background: "#2563eb",
            color: "white",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Start Analysis
        </button>
      </div>

      <pre
        style={{
          marginTop: 16,
          background: "#f6f7f9",
          padding: 12,
          borderRadius: 8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 13,
        }}
      >
        {log || "Event log will appear here…"}
      </pre>
    </div>
  );
}
