// scr/components/IngredientRiskTable.tsx
import React from "react";
function badgeDisplay(row: IngredientRow): string {
  // Combine all possible text into one lowercase string
  const source =
    (
      (row.badge ?? "") +
      " " +
      (row.riskLevel ?? "") +
      " " +
      (row.risk ?? "")
    )
      .toString()
      .trim()
      .toLowerCase();

  const ingredient = (row.ingredient ?? "")
    .toString()
    .trim()
    .toLowerCase();

  if (!source && !ingredient) return "";

  // 🔴 Harmful ingredients by name (frontend helper)
  const harmfulKeywords = [
    "sodium nitrite",
    "sodium nitrate",
    "nitrite",
    "nitrate",
    "bht",
    "bha",
    "azo dye",
    "azeo dye",
    "e102",
    "e110",
    "e122",
    "e124",
    "e129"
  ];

  if (
    source.includes("harmful") ||
    source.includes("high") ||
    source.includes("danger") ||
    harmfulKeywords.some((k) => ingredient.includes(k))
  ) {
    return "🔴 Harmful";
  }

  // 🟡 Caution / warning / moderate risk
  if (
    source.includes("caution") ||
    source.includes("warning") ||
    source.includes("moderate") ||
    source.includes("limit")
  ) {
    return "🟡 Caution";
  }

  // 🟢 Safe / low risk
  if (
    source.includes("safe") ||
    source.includes("low") ||
    source.includes("minimal")
  ) {
    return "🟢 Safe";
  }

  // Fallback – just show whatever text we got
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
// --------------------------------------
// Ingredient Safety Rules (frontend fallback)
// --------------------------------------

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
function ingredientName(row: IngredientRow): string {
  return (
    normalize(row.ingredient) ||
    normalize(row.name) ||
    normalize(row.additive) ||
    ""
  );
}

function riskText(row: IngredientRow): string {
  const name = ingredientName(row).toLowerCase();

  // ❗ 1. Check harmful list
  if (HARMFUL_INGREDIENTS.some((x) => name.includes(x.toLowerCase()))) {
    return "harmful";
  }

  // ❓ 2. Check moderate list
  if (MODERATE_INGREDIENTS.some((x) => name.includes(x.toLowerCase()))) {
    return "moderate";
  }

  // ✅ 3. Check safe list
  if (SAFE_INGREDIENTS.some((x) => name.includes(x.toLowerCase()))) {
    return "safe";
  }

  // 🔄 4. Otherwise fallback to backend or default
  return (
    normalize(row.riskLevel) ||
    normalize(row.risk) ||
    "unknown"
  );
}

function childRiskText(row: IngredientRow): string {
  // 1. Use backend child risk if provided
  const explicit =
    normalize(row.childRisk) ||
    normalize(row.childSafe) ||
    normalize(row.childSafeOverall);

  if (explicit) {
    return explicit;
  }

  // 2. Derive from badge or risk level
  const badge = normalize(row.badge);
  const risk = normalize(row.riskLevel);

  if (
    badge.includes("harmful") ||
    badge.includes("avoid") ||
    risk.includes("high")
  ) {
    return "risk";
  }

  if (
    badge.includes("caution") ||
    risk.includes("moderate") ||
    risk.includes("medium")
  ) {
    return "caution";
  }

  if (
    badge.includes("safe") ||
    risk.includes("low") ||
    risk.includes("healthy")
  ) {
    return "low";
  }

  return "Unknown";
}

function regulationText(row: IngredientRow): string {
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
