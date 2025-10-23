
import React, { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

// Your file is scr/components/FoodSafetyAnalyser.tsx (capital S, British "s")
const FoodSafetyAnalyser = React.lazy(() => import("./components/FoodSafetyAnalyser"));

export default function App() {
  console.log("[App] mounted");
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 16 }}>✅ App mounted (local)</div>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading analyzer…</div>}>
          <FoodSafetyAnalyser />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}