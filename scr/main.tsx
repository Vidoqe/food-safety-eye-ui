// scr/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        background: "black",
        color: "lime",
        padding: "8px",
        fontWeight: 900,
      }}
    >
      🚨 ROOT ENTRY ACTIVE
    </div>

    <App />
  </React.StrictMode>
);