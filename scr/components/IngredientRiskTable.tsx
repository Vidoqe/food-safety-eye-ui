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

// Helper to get best name string
function ingredientName(row: IngredientRow): string {
  return (
    normalize(row.ingredient) ||
    normalize(row.name) ||
    normalize(row.additive) ||
    ""
  );
}

// Ingredient Safety Rules (frontend helper)
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
// Taiwan FDA / law rules (frontend helper)
// Keys are lowercase fragments that we match inside the ingredient name.
const TAIWAN_FDA_RULES: Record<string, string> = {
  "water":
    "Allowed as a basic ingredient. Must meet general drinking-water safety standards.",
  "sugar":
    "Permitted sweetener. No specific legal maximum, but Taiwan health guidance recommends limiting added sugars, especially for children.",
  "salt":
    "Permitted. No strict legal cap in ordinary foods, but high sodium intake is linked to hypertension; follow Taiwan dietary guidelines to limit sodium.",
  "sodium nitrate":
    "Permitted preservative in processed meats with maximum level around a few hundred ppm depending on product category. Should be limited in children due to nitrosamine risk.",
  "sodium nitrite":
    "Permitted curing agent in processed meats with strict maximum levels (ppm range). Use should be minimized in young children; avoid frequent consumption.",
  "nitrate":
    "Nitrate-containing additives and natural sources are regulated by maximum residual levels. High intake can convert to nitrite in the body.",
  "nitrite":
    "Nitrite in foods is tightly controlled by Taiwan FDA. Excess intake may increase the risk of methemoglobinemia and nitrosamine formation.",
  "artificial sweetener":
    "Non-nutritive sweeteners (for example aspartame, acesulfame K, sucralose) each have their own Acceptable Daily Intake (ADI). Taiwan FDA follows Codex-style ADIs; avoid exceeding ADI, especially in children.",
  "high fructose corn syrup":
    "Permitted sweetener but contributes to high added sugar intake. Taiwan nutrition policy recommends minimizing sugary drinks and HFCS in children.",
  "food color":
    "Food dyes must be on the approved Taiwan list and stay under permitted daily intake. Some synthetic colors are restricted or banned in children’s products.",
};

// Decide "safe" / "moderate" / "harmful" for one ingredient row
function riskText(row: IngredientRow): string {
  const name = ingredientName(row).toLowerCase();

  // 1. Name-based rules OVERRIDE backend
  if (SAFE_INGREDIENTS.some((s) => name.includes(s))) {
    // water / aqua etc.
    return "safe";
  }

  if (HARMFUL_INGREDIENTS.some((h) => name.includes(h))) {
    // sodium nitrate / nitrite etc.
    return "harmful";
  }

  if (MODERATE_INGREDIENTS.some((m) => name.includes(m))) {
    // salt / sugar group
    return "moderate";
  }

  // 2. If no name rule matched, use backend value if present
  const explicit = (
    normalize(row.riskLevel) ||
    normalize(row.risk)
  ).toLowerCase();

  if (!explicit) return "unknown";

  if (explicit === "safe" || explicit === "low") return "safe";
  if (explicit === "high" || explicit === "harmful") return "harmful";
  if (explicit === "moderate" || explicit === "medium") return "moderate";

  // 3. Final fallback
  return "unknown";
}

// Child risk text
// Child risk text
function childRiskText(row: IngredientRow): string {
  const normalizeValue = (value: any) =>
    (value || "").toString().trim().toLowerCase();

  const explicit =
    normalizeValue(row.childRisk) ||
    normalizeValue(row.childSafe) ||
    normalizeValue(row.childSafeOverall);

  // If backend explicitly says safe → safe
  if (explicit === "safe" || explicit === "low") return "safe";

  // Always safe ingredients
  const name =
    normalizeValue(row.ingredient) ||
    normalizeValue(row.name) ||
    normalizeValue(row.additive) ||
    "";

  if (name.includes("water") || name.includes("aqua")) {
    return "safe";
  }

  // If backend says harmful / high
  if (explicit === "high" || explicit === "harmful") return "risk";

  // Unknown → risk for children
  return "risk";
}

// Turn riskText into coloured badge text
function badgeDisplay(row: IngredientRow): string {
  const risk = riskText(row).toLowerCase();

  if (risk === "safe" || risk === "low") return "🟢 Safe";
  if (risk === "harmful" || risk === "high") return "🔴 Harmful";

  // default: caution (medium / moderate / unknown)
  return "🟡 Caution";
}

// Taiwan FDA / law / GPT comment column
function regulationText(row: IngredientRow): string {
  const name = ingredientName(row).toLowerCase();

  // 1. Try to find a matching Taiwan FDA rule by keyword
  const matchedRule =
    Object.entries(TAIWAN_FDA_RULES).find(([key]) => name.includes(key))?.[1];

  if (matchedRule) {
    return matchedRule;
  }

  // 2. Fallback to any text coming from backend / other fields
  const source =
    normalize(row.taiwanRegulation) ||
    normalize(row.twRegulation) ||
    normalize(row.regulation) ||
    normalize(row.law) ||
    normalize(row.note) ||
    normalize((row as any).comment);

  // 3. Final fallback
  return source || "-";
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
          {(ingredients || []).length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-3 text-center text-gray-500"
              >
                No ingredients analyzed.
              </td>
            </tr>
          )}

          {(Array.isArray(ingredients) ? ingredients : [ingredients]).map(
            (row: any, i: number) => (
              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-900">
                  {ingredientName(row) || "-"}
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {riskText(row) || "-"}
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {childRiskText(row) || "-"}
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {badgeDisplay(row)}
                </td>
                <td className="px-3 py-2 text-gray-800">
                  {regulationText(row) || "-"}
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
