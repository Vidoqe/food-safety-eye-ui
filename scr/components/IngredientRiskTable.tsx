// src/components/IngredientRiskTable.tsx
import React from "react";

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
  law?: string;
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

// ---------------------------------------------------------------------
// Ingredient Safety Rules (frontend helper)
// ---------------------------------------------------------------------

const SAFE_INGREDIENTS = ["water", "aqua"];

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
  // Build a combined ingredient name string from whatever we have
  const name = (
    normalize(row.ingredient) ||
    normalize(row.name) ||
    normalize(row.additive) ||
    ""
  ).toLowerCase();

  // 1. Use explicit backend value if present
  const explicit = (
    normalize(row.riskLevel) ||
    normalize(row.risk)
  ).toLowerCase();

  if (explicit === "safe" || explicit === "low") return "safe";
  if (explicit === "high" || explicit === "harmful") return "harmful";
  if (explicit === "moderate" || explicit === "medium") return "moderate";

  // 2. Fallback to simple keyword rules

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

  // 3. Final fallback
  return "unknown";
}

// Child risk text
function childRiskText(row: IngredientRow): string {
  // 1. Use backend child risk if provided
  const explicit =
    normalize(row.childRisk) ||
    normalize(row.childSafe) ||
    normalize(row.childSafeOverall);

  if (explicit) return explicit;

  // 2. Derive from overall risk
  const overall = riskText(row);
  if (overall === "safe" || overall === "low") return "safe";

  // 3. Default: show that there is some risk
  return "risk";
}

// Turn riskText into coloured badge text
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

// Taiwan FDA / law / GPT comment column
function regulationText(row: IngredientRow): string {
  const source =
    normalize(row.regulation) ||
    normalize(row.taiwanRegulation) ||
    normalize(row.twRegulation) ||
    normalize(row.law) ||
    normalize(row.note) ||
    // fallback to GPT comment from backend, if any
    normalize((row as any).comment);

  return source;
}

// ---------------------------------------------------------------------
// Table Component
// ---------------------------------------------------------------------

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
                {/* Ingredient name column */}
                <td className="px-3 py-2 text-gray-900">
                  {normalize(row.ingredient) ||
                    normalize(row.name) ||
                    normalize(row.additive) ||
                    ""}
                </td>

                {/* Risk level column */}
                <td className="px-3 py-2 text-gray-800">
                  {riskText(row)}
                </td>

                {/* Child risk column */}
                <td className="px-3 py-2 text-gray-800">
                  {childRiskText(row)}
                </td>

                {/* Badge column */}
                <td className="px-3 py-2 text-gray-800">
                  {badgeDisplay(row)}
                </td>

                {/* Taiwan regulation / comment column */}
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
