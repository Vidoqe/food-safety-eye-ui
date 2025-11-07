import React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import HomeScreen from "@/components/HomeScreen";
import { AppProvider } from "@/contexts/AppContext";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppProvider>
      <AppLayout>
        <HomeScreen
          onScanLabel={() => navigate("/scan-label")}
          onScanBarcode={() => navigate("/scan-barcode")}
          onManualInput={() => navigate("/manual-input")}  // ✅ Fix here
          onSettings={() => navigate("/settings")}
          onScanHistory={() => navigate("/scan-history")}
          onApiTest={() => navigate("/api-test")}
        />
      </AppLayout>
    </AppProvider>
  );
};

export default Index;
