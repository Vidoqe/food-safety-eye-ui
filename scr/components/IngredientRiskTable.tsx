// scr/components/IngredientRiskTable.tsx
import React from "react";
// ---------------------------------------------------------
// ---------------------------------------------------------------------
// BADGE + RISK LOGIC
// ---------------------------------------------------------------------

// Ingredient Safety Rules (frontend helper)
const SAFE_INGREDIENTS = [
  "water",
  "aqua",
];

const MODERATE_INGREDIENTS = [
  "salt",
  "sodium chloride",
  "sugar",
  "glucose",
  "fructose",
  "sucrose",
];

const HARMFUL_INGREDIENTS = [
  "sodium nitrate",
  "sodium nitrite",
  "nitrate",
  "nitrite",
];

// Decide "safe" / "moderate" / "harmful" for one ingredient row
function riskText(row: IngredientRow): string {
  const name = ingredientName(row).toLowerCase();

  // Safe group
  if (SAFE_INGREDIENTS.some((s) => name.includes(s))) {
    return "safe";
  }

  // Harmful group
  if (HARMFUL_INGREDIENTS.some((h) => name.includes(h))) {
    return "harmful";
  }

  // Moderate group
  if (MODERATE_INGREDIENTS.some((m) => name.includes(m))) {
    return "moderate";
  }

  // Fallback: backend text
  return normalize(row.riskLevel) || normalize(row.risk) || "unknown";
}

// Turn riskText into coloured badge
function badgeDisplay(row: IngredientRow): string {
  const risk = riskText(row).toLowerCase();

  if (risk === "safe" || risk === "low") {
    return "🟢 Safe";
  }

  if (risk === "harmful" || risk === "high") {
    return "🔴 Harmful";
  }

  // default = caution (medium / moderate / unknown)
  return "🟡 Caution";
}

  const source =
    normalize(row.regulation) ||
    normalize(row.taiwanRegulation) ||
    normalize(row.twRegulation) ||
    normalize(row.law) ||
    normalize(row.note) ||
    // NEW: fallback to GPT analysis text
    normalize((row as any).comment);

  return source;
}

const IngredientRiskTable: React.FC<Props> = ({ ingredients }) => {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-3 py-2 text-left font-semibold">Ingredient</th>
            <th className="px-3 py-2 text-left font-semibold">Risk Level</th>
            <th className="px-3 py-2 text-left font-semibold">Child Risk?</th>
            <th className="px-3 py-2 text-left font-semibold">Badge</th>
            <th className="px-3 py-2 text-left font-semibold">
              Taiwan FDA Regulation
            </th>
          </tr>
        </thead>
       <tbody>
  {/* If nothing to show */}
  {(!ingredients || ingredients.length === 0) && (
    <tr>
      <td
        colSpan={5}
        className="px-3 py-3 text-center text-gray-500"
      >
        No ingredients analyzed.
      </td>
    </tr>
  )}

  {/* Ensure ingredients is always an array */}
  {(Array.isArray(ingredients) ? ingredients : [ingredients]).map(
    (row: any, i: number) => (
      <tr
        key={i}
        className="border-b last:border-0 hover:bg-gray-50"
      >
        <td className="px-3 py-2 text-gray-900">
          {ingredientName(row) || "-"}
        </td>
        <td className="px-3 py-2 text-gray-800">
          {riskText(row)}
        </td>
        <td className="px-3 py-2 text-gray-800">
          {childRiskText(row)}
        </td>
        <td className="px-3 py-2 text-gray-800">
          {badgeDisplay(row)}
        </td>
        <td className="px-3 py-2 text-gray-800">
          {regulationText(row)}
        </td>
      </tr>
    )
  )}
</tbody>

      </table>
    </div>
  );
};

export default IngredientRiskTable;
