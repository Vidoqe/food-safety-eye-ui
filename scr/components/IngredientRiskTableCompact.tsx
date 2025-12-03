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
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium">
              Ingredient
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Risk Level
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Child Risk?
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Badge
            </th>
            <th className="px-3 py-2 text-left font-medium">
              Taiwan FDA Regulation
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {ingredients.map((ing, index) => (
            <tr key={index}>
              <td className="px-3 py-2 align-top whitespace-nowrap">
                {ing.name || "-"}
              </td>

              <td className="px-3 py-2 align-top whitespace-nowrap">
                {ing.status || "-"}
              </td>

              <td className="px-3 py-2 align-top whitespace-nowrap">
                {ing.childRisk || "-"}
              </td>

              <td className="px-3 py-2 align-top whitespace-nowrap">
                {ing.badge || ""}
              </td>

              <td className="px-3 py-2 align-top">
                {ing.taiwanRegulation || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngredientRiskTable;
