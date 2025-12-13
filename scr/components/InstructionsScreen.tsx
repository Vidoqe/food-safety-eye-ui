import React from "react";

export default function InstructionsScreen({
  lang,
  onBack,
}: {
  lang: "en" | "zh";
  onBack: () => void;
}) {
  const t = {
    title: lang === "zh" ? "使用說明" : "How to use",
    p1:
      lang === "zh"
        ? "1) 點「掃描成分」：拍攝產品成分表（清楚、平整、光線足）。"
        : "1) Tap “Scan Ingredients”: take a clear photo of the ingredient label (flat, bright, in focus).",
    p2:
      lang === "zh"
        ? "2) 或用「手動輸入」：直接貼上/輸入成分文字。"
        : "2) Or use “Manual Input”: paste/type the ingredients text.",
    p3:
      lang === "zh"
        ? "3) 系統會標示風險等級、兒童風險與台灣法規提示。"
        : "3) You’ll get risk level, child risk, and Taiwan regulation notes.",
    back: lang === "zh" ? "返回" : "Back",
  };

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>{t.title}</h2>
      <div style={{ lineHeight: 1.6 }}>
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>{t.p3}</p>
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
      >
        {t.back}
      </button>
    </div>
  );
}
