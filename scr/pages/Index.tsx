import React from "react";
import { AppProvider } from "@/contexts/AppContext";
import HomeScreen from "@/components/HomeScreen";

const Index: React.FC = () => {
  return (
    <AppProvider>
      <HomeScreen />
    </AppProvider>
  );
};

export default Index;