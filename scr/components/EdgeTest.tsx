// scr/components/EdgeTest.tsx
import React from "react";

export default function EdgeTest() {
  async function callEdge() {
    try {
      const url =
        import.meta.env.VITE_SUPABASE_EDGE_URL ||
        "https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image";

      const secret =
        import.meta.env.VITE_EDGE_SHARED_SECRET || "foodsafetysecret456";

      console.log("[EdgeTest] calling:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({
  ingredients: "sugar, milk, salt, flavour",
  barcode: "",
  image: "",
  lang: "zh"
}),
      });

      const text = await res.text();
      console.log("[EdgeTest] status:", res.status, "body:", text);
      alert(`Edge Function returned ${res.status}\n\n${text}`);
    } catch (err) {
      console.error("[EdgeTest] error:", err);
      alert("Error: " + err);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={callEdge}>Call Supabase Edge</button>
    </div>
  );
}
