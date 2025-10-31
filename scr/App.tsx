
import React, { Suspense, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingScreen from "./components/LandingScreen";

// lazy-load the analyser screen (your working one)
const FoodSafetyAnalyser = React.lazy(
  () => import("./components/FoodSafetyAnalyser")
);

export default function App() {
  console.log("[App] mounted");

  // "landing" = marketing home screen
  // "analyze" = the form / scanner / results UI
  const [mode, setMode] = useState<"landing" | "analyze">("landing");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {/* keep this small debug line so you know build is the right one */}
      <div style={{ marginBottom: 16 }}>✅ App mounted (local)</div>

      {mode === "landing" ? (
        <LandingScreen onStart={() => setMode("analyze")} />
      ) : (
        <ErrorBoundary>
          <Suspense fallback={<div>Loading analyzer…</div>}>
            <FoodSafetyAnalyser />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
