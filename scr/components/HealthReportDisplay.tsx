import React from 'react';

interface Ingredient {
  name: string;
  riskLevel?: 'safe' | 'moderate' | 'harmful';
  risk_level?: 'safe' | 'moderate' | 'harmful';
  childRisk?: boolean;
  child_risk?: boolean;
  badge?: string;
  chinese?: string;
}

interface HealthReportDisplayProps {
  ingredients: Ingredient[];
  overallRisk?: 'safe' | 'moderate' | 'harmful';
  overall_risk?: string;
  childSafe?: boolean;
  child_safe?: boolean;
  notes?: string[];
  taiwanWarnings?: string[];
}

const HealthReportDisplay: React.FC<HealthReportDisplayProps> = ({ 
  ingredients, 
  overallRisk, 
  overall_risk,
  childSafe,
  child_safe,
  notes,
  taiwanWarnings
}) => {
  const getBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return '🟢';
      case 'moderate': return '🟡';
      case 'harmful': return '🔴';
      default: return '🟡';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'Low / 低';
      case 'moderate': return 'Moderate / 中等';
      case 'harmful': return 'Harmful / 有害';
      default: return 'Moderate / 中等';
    }
  };

  const getOverallRiskText = (risk: string) => {
    switch (risk) {
      case 'safe': return 'Low Risk / 低風險';
      case 'moderate': return 'Moderate Risk / 中等風險';
      case 'harmful': return 'High Risk / 高風險';
      default: return 'Moderate Risk / 中等風險';
    }
  };

  const finalOverallRisk = overall_risk || overallRisk || 'moderate';
  const getOverallRiskEmoji = (risk: string) => {
    switch (risk) {
      case 'safe': return '🟢';
      case 'moderate': return '🟡';
      case 'harmful': return '🔴';
      default: return '🟡';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Overall Risk Summary */}
      <div className="border-b pb-4">
        <p className="text-lg font-semibold">
          Overall Risk: {getOverallRiskEmoji(finalOverallRisk)} {getOverallRiskText(finalOverallRisk)}
        </p>
      </div>

      {/* Ingredients Analysis Table */}
      <div className="border-b pb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Ingredient / 成分</th>
                <th className="border border-gray-300 p-2 text-left">Risk Level / 風險</th>
                <th className="border border-gray-300 p-2 text-left">Child Safety / 兒童風險</th>
                <th className="border border-gray-300 p-2 text-left">Badge</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient, index) => {
                const riskLevel = ingredient.riskLevel ?? ingredient.risk_level ?? "moderate";
              const childRisk =
  typeof ingredient.childRisk === "string"
    ? ingredient.childRisk
    : typeof ingredient.child_risk === "string"
    ? ingredient.child_risk
    : ingredient.childSafe === true
    ? "Safe"
    : ingredient.childSafe === false
    ? "Avoid"
    : "Unknown";
                const badge = ingredient.badge || getBadge(riskLevel);
                
                return (
                 <tr key={index}>
  <td className="border border-gray-300 p-2">
<div style={{ color: "red", fontWeight: 700 }}>DEPLOY-TEST-123</div>
    {(() => {
      const zh = ingredient.name_zh ?? ingredient.name ?? "";
      const en = ingredient.name_en ?? ingredient.reason ?? "";

      const displayName = zh || en || "—";
      const secondary = en && zh ? ` / ${en}` : "";

      return (
        <div className="font-medium">
          {displayName}{secondary}
        </div>
      );
    })()}
  </td>

  <td className="border border-gray-300 p-2">
    {childRisk}
  </td>
</tr>

                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Tips */}
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="mr-2">💡</span>
          <span>適量食用</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">💡</span>
          <span>注意台灣法規限制的添加物</span>
        </div>
      </div>
    </div>
  );
};

export default HealthReportDisplay;