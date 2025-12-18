
import React, { useState } from "react";
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";
import HomeScreen from "./components/HomeScreen";

type Screen = "home" | "scanLabel" | "manualInput" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <UserProvider>
      <AppProvider>
        {screen === "home" ? (
          <HomeScreen
            onScanLabel={() => setScreen("scanLabel")}
            onManualInput={() => setScreen("manualInput")}
            onSettings={() => setScreen("settings")}
          />
        ) : (
          // Temporary screen so you can confirm navigation works.
          // Later we replace this with your real Scan/Manual/Settings components.
          <div className="min-h-screen p-6">
            <button
              className="mb-6 rounded px-4 py-2 border"
              onClick={() => setScreen("home")}
            >
              ← Back
            </button>

            {screen === "scanLabel" && <div>Scan Label screen (placeholder)</div>}
            {screen === "manualInput" && <div>Manual Input screen (placeholder)</div>}
            {screen === "settings" && <div>Settings screen (placeholder)</div>}
          </div>
        )}
      </AppProvider>
    </UserProvider>
  );
}
