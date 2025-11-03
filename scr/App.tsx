
import React from "react";

// context providers (these already exist in your project)
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";

// screens
import HomeScreen from "./components/HomeScreen";
import SettingsScreen from "./components/SettingsScreen";
import ManualInputScreen from "./components/ManualInputScreen";
import ScanHistoryScreen from "./components/ScanHistoryScreen";

export default function App() {
  console.log("[App] mounted ✅");

  // which screen is visible
  const [screen, setScreen] = React.useState<
    "home" | "settings" | "manual" | "history"
  >("home");

  // nav handlers
  const gotoHome = () => setScreen("home");
  const gotoSettings = () => setScreen("settings");
  const gotoManual = () => setScreen("manual");
  const gotoHistory = () => setScreen("history");

  return (
    <UserProvider>
      <AppProvider>
        {/* this wrapper gives you the gradient bg etc via HomeScreen */}
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
          {screen === "home" && (
            <HomeScreen
              onScanLabel={() => {
                // later this will open camera ScanScreen
                console.log("[nav] Scan Label tapped");
              }}
              onScanBarcode={() => {
                // later this will open ScanBarcodeScreen
                console.log("[nav] Scan Barcode tapped");
              }}
              onManualInput={gotoManual}
              onSettings={gotoSettings}
              onScanHistory={gotoHistory}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen onBack={gotoHome} />
          )}

          {screen === "manual" && (
            <ManualInputScreen onBack={gotoHome} />
          )}

          {screen === "history" && (
            <ScanHistoryScreen onBack={gotoHome} />
          )}
        </div>
      </AppProvider>
    </UserProvider>
  );
}
