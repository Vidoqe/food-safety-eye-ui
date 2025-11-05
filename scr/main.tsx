// scr/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

// ✅ this pulls in Tailwind classes
import "./styles/tailwind.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);