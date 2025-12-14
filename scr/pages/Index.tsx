import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { AppProvider } from "@/contexts/AppContext";
 import HomeScreen from "@/components/HomeScreen";

const Index: React.FC = () => {
  const [ingredients, setIngredients] = useState<any[]>([]);

  const handleScan = async (payload: any) => {
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Scan result:", data);

      setIngredients(data.ingredients || []);
    } catch (err) {
      console.error("Scan failed:", err);
    }
  };

 

return (
  <AppProvider>
    <HomeScreen />
  </AppProvider>
);

export default Index;
