// scr/components/IngredientRiskTable.tsx
import React from "react";

export interface IngredientRow {
  name: string;
  status: string; // "high" | "moderate" | "low" | "healthy"
  childRisk?: string;
  badge?: string;            // e.g. 🔴🟡🟢 – already prepared in ResultScreen
  taiwanRegulation?: string; // Taiwan FDA / regulation note
}

interface IngredientRiskTableProps {
  ingredients: IngredientRow[];
}

const IngredientRiskTable: React.FC<IngredientRiskTableProps> = ({
  ingredients,
}) => {
  if (!ingredients || ingredients.length === 0) {
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
            <th className="px-2 py-1 text-left font-semibold">Ingredient</th>
            <th className="px-2 py-1 text-left font-semibold">Risk<br />Level</th>
            <th className="px-2 py-1 text-left font-semibold">Child<br />Risk?</th>
            <th className="px-2 py-1 text-left font-semibold">Badge</th>
            <th className="px-2 py-1 text-left font-semibold">
              Taiwan<br />FDA Regulation
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="px-2 py-1 align-top whitespace-normal">
                {row.name}
              </td>
              <td className="px-2 py-1 align-top whitespace-nowrap">
                {row.status}
              </td>
              <td className="px-2 py-1 align-top whitespace-nowrap">
                {row.childRisk}
              </td>
              <td className="px-2 py-1 align-top">
                {row.badge}
              </td>
              <td className="px-2 py-1 align-top whitespace-normal">
                {row.taiwanRegulation || "No info"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


export default IngredientRiskTableCompact;
