import React from 'react';

type Row = {
  ingredient?: string;
  name?: string;
  item?: string;

  risk?: string;
  riskLevel?: string;

  childRisk?: string;
  child?: string;

  badge?: string;

  regulation?: string;
  taiwanRegulation?: string;
  twRegulation?: string;
  note?: string;
};

interface Props {
  ingredients: Row[];
}

function pickName(row: Row): string {
  return (
    row.ingredient ||
    row.name ||
    row.item ||
    ''
  );
}

function pickRisk(row: Row): string {
  return (
    row.riskLevel ||
    row.risk ||
    ''
  );
}

function pickChildRisk(row: Row): string {
  return (
    row.childRisk ||
    row.child ||
    ''
  );
}

function pickRegulation(row: Row): string {
  return (
    row.regulation ||
    row.taiwanRegulation ||
    row.twRegulation ||
    row.note ||
    ''
  );
}

function badgeDisplay(row: Row): string {
  const source = (
    row.badge ||
    row.riskLevel ||
    row.risk ||
    ''
  ).toLowerCase();

  if (!source) return '';

  if (source.includes('red') || source.includes('high')) {
    return '🔴 red';
  }
  if (source.includes('yellow') || source.includes('moderate')) {
    return '🟠 yellow';
  }
  if (source.includes('green') || source.includes('low') || source.includes('safe')) {
    return '🟢 green';
  }

  // Fallback: just show whatever we got
  return source;
}

const IngredientRiskTable: React.FC<Props> = ({ ingredients }) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        (No ingredient-level details available.)
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-3 py-2 font-semibold">Ingredient</th>
            <th className="text-left px-3 py-2 font-semibold">Risk Level</th>
            <th className="text-left px-3 py-2 font-semibold">Child Risk?</th>
            <th className="text-left px-3 py-2 font-semibold">Badge</th>
            <th className="text-left px-3 py-2 font-semibold">Taiwan FDA Regulation</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-3 py-2 whitespace-nowrap">
                {pickName(row)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {pickRisk(row)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {pickChildRisk(row)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {badgeDisplay(row)}
              </td>
              <td className="px-3 py-2">
                {pickRegulation(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngredientRiskTable;
