
import { useState } from "react";
import HomeScreen from "./components/HomeScreen";
import ScanLabelScreen from "./components/ScanLabelScreen";
import ManualInputScreen from "./components/ManualInputScreen";
import SettingsScreen from "./components/SettingsScreen";

type Screen =
  | "home"
  | "scanLabel"
  | "manualInput"
  | "settings";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "scanLabel") {
    return <ScanLabelScreen onBack={() => setScreen("home")} />;
  }

  if (screen === "manualInput") {
    return <ManualInputScreen onBack={() => setScreen("home")} />;
  }

  if (screen === "settings") {
    return <SettingsScreen onBack={() => setScreen("home")} />;
  }

  return (
    <HomeScreen
      onScanLabel={() => setScreen("scanLabel")}
      onManualInput={() => setScreen("manualInput")}
      onSettings={() => setScreen("settings")}
    />
  );
}
