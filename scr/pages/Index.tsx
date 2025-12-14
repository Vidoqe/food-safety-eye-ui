import React, { useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { UserProvider } from "@/contexts/UserContext";
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
    <UserProvider>
      <AppProvider>
        <HomeScreen onScan={handleScan} additives={ingredients} />
      </AppProvider>
    </UserProvider>
  );
};

export default Index;
