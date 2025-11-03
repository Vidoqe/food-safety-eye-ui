
import React from "react";

// main screens
import HomeScreen from "./components/HomeScreen";
import SettingsScreen from "./components/SettingsScreen";
import ManualInputScreen from "./components/ManualInputScreen";
import ScanHistoryScreen from "./components/ScanHistoryScreen";
import ApiTestScreen from "./components/ApiTestScreen";

// context providers etc (these are names you've shown me in your codebase)
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";

// simple in-memory nav
export default function App() {
  console.log("[App] mounted ✅");

  // we keep simple state for which screen is visible
  const [screen, setScreen] = React.useState<
    "home" | "settings" | "manual" | "history" | "apiTest"
  >("home");

  // handlers we pass down to HomeScreen buttons
  const gotoHome = () => setScreen("home");
  const gotoSettings = () => setScreen("settings");
  const gotoManual = () => setScreen("manual");
  const gotoHistory = () => setScreen("history");
  const gotoApiTest = () => setScreen("apiTest");

  return (
    <UserProvider>
      <AppProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
          {screen === "home" && (
            <HomeScreen
              onScanLabel={() => {
                // this is your camera flow (ScanScreen / barcode etc.)
                // you already have this wired in HomeScreen, so we just let HomeScreen handle it
              }}
              onScanBarcode={() => {
                // same story – HomeScreen calls its own logic
              }}
              onManualInput={gotoManual}
              onSettings={gotoSettings}
              onScanHistory={gotoHistory}
              onApiTest={gotoApiTest}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen
              onBack={gotoHome}
            />
          )}

          {screen === "manual" && (
            <ManualInputScreen
              onBack={gotoHome}
            />
          )}

          {screen === "history" && (
            <ScanHistoryScreen
              onBack={gotoHome}
            />
          )}

          {screen === "apiTest" && (
            <ApiTestScreen
              onBack={gotoHome}
            />
          )}
        </div>
      </AppProvider>
    </UserProvider>
  );
}
