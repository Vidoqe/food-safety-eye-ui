// force vercel rebuild 24-11-2025
// src/pages/Index.tsx
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { AppProvider } from "@/contexts/AppContext";

const Index: React.FC = () => {
  const [ingredients, setIngredients] = useState([]);

  // ---- Scan Handler ----
  const handleScan = async (payload: any) => {
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_EDGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Scan result:", data);

      // Store only what your UI needs
      setIngredients(data.ingredients || []);

    } catch (err) {
      console.error("Scan failed:", err);
    }
  };

  return (
    <AppProvider>
      <AppLayout onScan={handleScan} additives={ingredients} />
    </AppProvider>
  );
};

export default Index;
