
import { AppProvider } from "./contexts/AppContext";
import { UserProvider } from "./contexts/UserContext";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  return (
    <UserProvider>
      <AppProvider>
        <HomeScreen
          onScanLabel={() => console.log("Scan label")}
          onScanBarcode={() => console.log("Scan barcode")}
          onManualInput={() => console.log("Manual input")}
          onSettings={() => console.log("Settings")}
          onScanHistory={() => console.log("Scan history")}
          onApiTest={() => console.log("API test")}
        />
      </AppProvider>
    </UserProvider>
  );
}