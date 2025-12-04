import React from "react";

export default function IngredientRiskTableLarge({ ingredients }) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left font-medium">Ingredient</th>
            <th className="px-3 py-2 text-left font-medium">Risk Level</th>
            <th className="px-3 py-2 text-left font-medium">Child Risk?</th>
            <th className="px-3 py-2 text-left font-medium">Badge</th>
            <th className="px-3 py-2 text-left font-medium">Taiwan FDA Regulation</th>
          </tr>
        </thead>

        <tbody>
          {ingredients.map((ing, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-3 py-2">{ing.name}</td>
              <td className="px-3 py-2">{ing.status}</td>
              <td className="px-3 py-2">{ing.childRisk}</td>
              <td className="px-3 py-2">{ing.badge}</td>
              <td className="px-3 py-2">{ing.taiwanReg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
