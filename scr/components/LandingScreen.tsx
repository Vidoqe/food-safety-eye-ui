import React from "react";

type LandingScreenProps = {
  onStart: () => void;
};

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eefce8 0%, #ffffff 60%)",
        fontFamily: "system-ui, sans-serif",
        color: "#065f46", // deep green-ish
        padding: "24px 16px",
        textAlign: "center",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* Circle logo */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "9999px",
          border: "4px solid #10b981", // emerald-500
          margin: "0 auto 24px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* placeholder "eye" circle */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle at 40% 40%, #4b2e2e 0%, #000 60%, #000 100%)",
            border: "2px solid #444",
          }}
        />
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#065f46" }}>
        Food Safety Eye
        <br />
        <span style={{ fontSize: 24, fontWeight: 700 }}>食安眼</span>
      </h1>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
          color: "#065f46",
          lineHeight: 1.4,
        }}
      >
        守護孩子健康，從食品安全開始
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          color: "#047857", // slightly lighter green
          maxWidth: 360,
          margin: "0 auto 24px auto",
        }}
      >
        食安眼幫助家長識別有害成分，為孩子和家人提供安全的飲食選擇。
        讓每一口都安心，每一餐都放心。
      </div>

      {/* Feature row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          rowGap: 24,
          columnGap: 16,
          maxWidth: 360,
          margin: "0 auto 24px auto",
          color: "#065f46",
          fontSize: 14,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>👶</div>
          <div style={{ fontWeight: 600 }}>Child Safe</div>
          <div style={{ fontSize: 12, color: "#065f46" }}>安全兒童</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🌿</div>
          <div style={{ fontWeight: 600 }}>Healthy Choice</div>
          <div style={{ fontSize: 12, color: "#065f46" }}>健康選擇</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>⚠️</div>
          <div style={{ fontWeight: 600 }}>Additive Warning</div>
          <div style={{ fontSize: 12, color: "#065f46" }}>添加物警示</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🛡️</div>
          <div style={{ fontWeight: 600 }}>Taiwan Rules</div>
          <div style={{ fontSize: 12, color: "#065f46" }}>台灣法規</div>
        </div>
      </div>

      {/* Big CTA button */}
      <button
        type="button"
        onClick={onStart}
        style={{
          width: "100%",
          maxWidth: 360,
          margin: "0 auto",
          backgroundColor: "#10b981", // emerald-500
          color: "#fff",
          fontWeight: 600,
          fontSize: 18,
          border: "none",
          borderRadius: 8,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 20px rgba(16,185,129,0.4)",
        }}
      >
        <span style={{ fontSize: 20, marginRight: 8 }}>📷</span>
        <span>
          拍攝產品標籤
          <br />
          <span style={{ fontSize: 14 }}>Scan Product Label</span>
        </span>
      </button>
    </div>
  );
}
