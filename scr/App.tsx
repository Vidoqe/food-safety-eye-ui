
import React from "react";
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";
import HomeScreen from "./components/HomeScreen";
import SettingsScreen from "./components/SettingsScreen";
import ManualInputScreen from "./components/ManualInputScreen";
import ScanHistoryScreen from "./components/ScanHistoryScreen";

export default function App() {
  console.log("[App] mounted ✅");

  const [screen, setScreen] = React.useState<
    "home" | "settings" | "manual" | "history"
  >("home");

  const gotoHome = () => setScreen("home");
  const gotoSettings = () => setScreen("settings");
  const gotoManual = () => setScreen("manual");
  const gotoHistory = () => setScreen("history");

  return (
    <UserProvider>
      <AppProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
          {screen === "home" && (
            <HomeScreen
              onScanLabel={() => console.log("Scan label")}
              onScanBarcode={() => console.log("Scan barcode")}
              onManualInput={gotoManual}
              onSettings={gotoSettings}
              onScanHistory={gotoHistory}
            />
          )}
          {screen === "settings" && <SettingsScreen onBack={gotoHome} />}
          {screen === "manual" && <ManualInputScreen onBack={gotoHome} />}
          {screen === "history" && <ScanHistoryScreen onBack={gotoHome} />}
        </div>
      </AppProvider>
    </UserProvider>
  );
}
