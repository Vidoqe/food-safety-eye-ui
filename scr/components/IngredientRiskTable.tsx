// scr/components/IngredientRiskTable.tsx
import React from "react";
function badgeDisplay(row: IngredientRow): string {
  const source =
    normalize(row.badge) ||
    normalize(row.riskLevel) ||
    normalize(row.risk) ||
    "";

  const ingredient = normalize(row.ingredient);

  // 1) If backend explicitly says harmful / high risk
  if (
    source.includes("harmful") ||
    source.includes("high") ||
    source.includes("danger")
  ) {
    return "🔴 Harmful";
  }

  // 2) Ingredient-based auto harmful (frontend helper)
  const harmfulKeywords = [
    "sodium nitrite",
    "sodium nitrate",
    "nitrite",
    "nitrate",
    "bht",
    "bha",
    "azeo dye",
    "azo dye",
    "e102",
    "e110",
    "e122",
    "e124",
    "e129"
  ];

  if (harmfulKeywords.some((k) => ingredient.includes(k))) {
    return "🔴 Harmful";
  }

  // 3) Caution
  if (
    source.includes("caution") ||
    source.includes("warning") ||
    source.includes("moderate") ||
    source.includes("limit")
  ) {
    return "🟡 Caution";
  }

  // 4) Safe / low
  if (
    source.includes("safe") ||
    source.includes("low") ||
    source.includes("minimal")
  ) {
    return "🟢 Safe";
  }

  // 5) Fallback – just show text if nothing matched
  return source || "";
}

type IngredientRow = {
  ingredient?: string;
  name?: string;
  additive?: string;
  riskLevel?: string;
  risk?: string;
  childRisk?: string;
  childSafe?: string;
  childSafeOverall?: string;
  badge?: string;
  regulation?: string;
  taiwanRegulation?: string;
  twRegulation?: string;
  note?: string;
  [key: string]: any;
};

interface Props {
  ingredients: IngredientRow[];
}

function normalize(value: unknown): string {
  if (value === undefined || value === null) return "";
  return value.toString().trim();
}

function ingredientName(row: IngredientRow): string {
  return (
    normalize(row.ingredient) ||
    normalize(row.name) ||
    normalize(row.additive) ||
    ""
  );
}

function riskText(row: IngredientRow): string {
  return (
    normalize(row.riskLevel) ||
    normalize(row.risk) ||
    "Unknown"
  );
}

function childRiskText(row: IngredientRow): string {
  return (
    normalize(row.childRisk) ||
    normalize(row.childSafe) ||
    normalize(row.childSafeOverall) ||
    "Unknown"
  );
}

function regulationText(row: IngredientRow): string {
  return (
    normalize(row.regulation) ||
    normalize(row.taiwanRegulation) ||
    normalize(row.twRegulation) ||
    normalize(row.note)
  );
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
