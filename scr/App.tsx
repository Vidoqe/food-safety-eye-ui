
// scr/App.tsx
import React, { useState } from "react";

import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";

import HomeScreen from "./components/HomeScreen";
import ScanLabelScreen from "./components/ScanLabelScreen";
import ManualInputScreen from "./components/ManualInputScreen";
import SettingsScreen from "./components/SettingsScreen";

type Screen = "home" | "scanLabel" | "manualInput" | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <UserProvider>
      <AppProvider>
        {screen === "home" && (
          <HomeScreen
            onScanLabel={() => setScreen("scanLabel")}
            onManualInput={() => setScreen("manualInput")}
            onSettings={() => setScreen("settings")}
          />
        )}

        {/* DO NOT change ScanLabel UI — we only add a safe back handler prop */}
        {screen === "scanLabel" && (
          <ScanLabelScreen onBack={() => setScreen("home")} />
        )}

        {screen === "manualInput" && (
          <ManualInputScreen onBack={() => setScreen("home")} />
        )}

        {screen === "settings" && (
          <SettingsScreen onBack={() => setScreen("home")} />
        )}
      </AppProvider>
    </UserProvider>
  );
}
