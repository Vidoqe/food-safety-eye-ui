
import React from "react";

// providers (the wrappers that make language / user / history work)
import { AppContextProvider } from "./contexts/AppContext";
import { UserContextProvider } from "./contexts/UserContext";
import { ScanHistoryProvider } from "./hooks/useScanHistory";

// app layout + screens
import AppLayout from "./components/AppLayout";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  console.log("[App] mounted ✅ (RESTORED)");

  return (
    <AppContextProvider>
      <UserContextProvider>
        <ScanHistoryProvider>
          <AppLayout>
            <HomeScreen
              onScanLabel={() => {
                console.log("TODO: go to Scan Label screen");
              }}
              onScanBarcode={() => {
                console.log("TODO: go to Scan Barcode screen");
              }}
              onManualInput={() => {
                console.log("TODO: go to Manual Input screen");
              }}
              onSettings={() => {
                console.log("TODO: go to Settings screen");
              }}
              onScanHistory={() => {
                console.log("TODO: go to Scan History screen");
              }}
              onApiTest={() => {
                console.log("TODO: go to API Test screen");
              }}
            />
          </AppLayout>
        </ScanHistoryProvider>
      </UserContextProvider>
    </AppContextProvider>
  );
}
