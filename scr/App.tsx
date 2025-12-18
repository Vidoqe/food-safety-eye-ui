
import React, { useState } from "react";
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";
import HomeScreen from "./components/HomeScreen";

// TEMP placeholder screens (keep simple for now)
function SettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen p-4">
      <button className="border px-3 py-2 rounded" onClick={onBack}>← Back</button>
      <h2 className="mt-4 text-lg font-semibold">Settings screen (placeholder)</h2>
    </div>
  );
}

function ScanLabelScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen p-4">
      <button className="border px-3 py-2 rounded" onClick={onBack}>← Back</button>
      <h2 className="mt-4 text-lg font-semibold">Scan Label (placeholder)</h2>
      <p className="mt-2 text-sm opacity-80">Next step: open camera / upload image.</p>
    </div>
  );
}

function ManualInputScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen p-4">
      <button className="border px-3 py-2 rounded" onClick={onBack}>← Back</button>
      <h2 className="mt-4 text-lg font-semibold">Manual Input (placeholder)</h2>
      <p className="mt-2 text-sm opacity-80">Next step: ingredient text box.</p>
    </div>
  );
}

type Screen = "home" | "settings" | "scanLabel" | "manualInput";

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

        {screen === "settings" && <SettingsScreen onBack={() => setScreen("home")} />}
        {screen === "scanLabel" && <ScanLabelScreen onBack={() => setScreen("home")} />}
        {screen === "manualInput" && <ManualInputScreen onBack={() => setScreen("home")} />}
      </AppProvider>
    </UserProvider>
  );
}
