// scr/components/IngredientRiskTable.tsx
import React from "react";

export interface IngredientRow {
  name: string;
  englishName?: string;       // NEW: English version of name
  status: string;             // "high" | "moderate" | "low" | "healthy"
  childRisk?: string;
  badge?: string;             // e.g. 🔴 🟡 🟢
  taiwanRegulation?: string;  // Taiwan FDA / regulation note
}
interface IngredientRiskTableProps {
  ingredients: IngredientRow[];
  language?: "en" | "zh";
}
const IngredientRiskTableCompact: React.FC<IngredientRiskTableProps> = ({
  ingredients,
  language = "en",
}) => {  if (!ingredients || ingredients.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No ingredients detected.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-full text-xs"> {/* smaller text overall */}
        <thead className="bg-gray-50">
  <tr>
    <th className="px-1 py-1 text-left font-semibold text-xs">
      {language === "zh" ? "成分" : "Ingredient"}
    </th>
    <th className="px-1 py-1 text-left font-semibold text-xs">
      {language === "zh" ? "風險等級" : "Risk Level"}
    </th>
    <th className="px-1 py-1 text-left font-semibold text-xs">
      {language === "zh" ? "兒童風險" : "Child Risk?"}
    </th>
    <th className="px-1 py-1 text-left font-semibold text-xs">
      {language === "zh" ? "標記" : "Badge"}
    </th>
    <th className="px-1 py-1 text-left font-semibold text-xs">
      {language === "zh" ? "台灣規範" : "Taiwan FDA Regulation"}
    </th>
  </tr>
</thead>
        <tbody>
          {ingredients.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="px-1 py-1 align-top text-[10px] whitespace-normal">
  {row.name}
</td>
<td className="px-1 py-1 align-top text-[10px] whitespace-nowrap">
  {row.status}
</td>
<td className="px-1 py-1 align-top text-[10px] whitespace-nowrap">
  {row.childRisk}
</td>
<td className="px-1 py-1 align-top">
  {row.badge}
</td>
<td className="px-1 py-1 align-top text-[10px] whitespace-normal leading-tight">
  {row.taiwanRegulation || "No info"}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
  };


export default IngredientRiskTableCompact;
