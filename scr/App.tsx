
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

        {screen === "scanLabel" && <ScanLabelScreen />}

        {screen === "manualInput" && <ManualInputScreen />}

        {screen === "settings" && <SettingsScreen />}
      </AppProvider>
    </UserProvider>
  );
}
