// scr/components/IngredientRiskTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ingredient } from "@/contexts/AppContext";
import { useAppContext } from "@/contexts/AppContext";

interface IngredientRiskTableProps {
  ingredients: Ingredient[];
}

// Local fallback so a badge always renders
const BADGE_FALLBACK: Record<string, string> = {
  harmful: "🔴",
  moderate: "🟡",
  low: "🟢",
  healthy: "🟢",
};

const IngredientRiskTable: React.FC<IngredientRiskTableProps> = ({
  ingredients,
}) => {
  const { language } = useAppContext();

  // Sort by risk severity
  const order: Record<string, number> = {
    harmful: 0,
    high: 0,
    moderate: 1,
    medium: 1,
    low: 2,
    healthy: 2,
  };

  const sorted = [...(ingredients || [])].sort((a: any, b: any) => {
    const sa = (a.status || a.risk || "").toString().toLowerCase();
    const sb = (b.status || b.risk || "").toString().toLowerCase();
    const oa = order[sa] ?? 99;
    const ob = order[sb] ?? 99;
    return oa - ob;
  });

  const getRiskLevelText = (status?: string): string => {
    const val = (status || "").toString().toLowerCase();
    if (language === "zh") {
      switch (val) {
        case "harmful":
        case "high":
          return "高風險";
        case "moderate":
        case "medium":
          return "中等風險";
        case "low":
          return "低風險";
        case "healthy":
          return "較安全";
        default:
          return "未知";
      }
    }
    switch (val) {
      case "harmful":
      case "high":
        return "High Risk";
      case "moderate":
      case "medium":
        return "Moderate";
      case "low":
        return "Low Risk";
      case "healthy":
        return "Healthy";
      default:
        return "Unknown";
    }
  };

  const getChildRiskText = (child: string | boolean | undefined): string => {
    const raw =
      typeof child === "string" ? child.toLowerCase() : child ? "yes" : "unknown";

    if (language === "zh") {
      switch (raw) {
        case "safe":
        case "yes":
          return "適量安全";
        case "limit":
          return "兒童應限量";
        case "avoid":
        case "no":
          return "兒童避免";
        default:
          return "未知";
      }
    }

    switch (raw) {
      case "safe":
      case "yes":
        return "Generally safe";
      case "limit":
        return "Limit for children";
      case "avoid":
      case "no":
        return "Avoid for children";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {language === "zh" ? "成分風險分析表" : "Ingredient Risk Analysis"}
      </h3>

      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">
                {language === "zh" ? "成分" : "Ingredient"}
              </TableHead>
              <TableHead className="text-center">
                {language === "zh" ? "風險等級" : "Risk Level"}
              </TableHead>
              <TableHead className="text-center">
                {language === "zh" ? "兒童風險" : "Child Risk?"}
              </TableHead>
              <TableHead className="text-center">
                {language === "zh" ? "標記" : "Badge"}
              </TableHead>
              <TableHead className="text-left">
                {language === "zh"
                  ? "台灣食品法規說明"
                  : "Taiwan FDA Regulation"}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.map((ingredient: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  {language === "zh"
                    ? ingredient.chinese || ingredient.name
                    : ingredient.name}
                </TableCell>

                <TableCell className="text-center">
                  {getRiskLevelText(ingredient.status || ingredient.risk)}
                </TableCell>

                <TableCell className="text-center">
                  {getChildRiskText(
                    ingredient.childRisk ?? ingredient.child_risk
                  )}
                </TableCell>

                <TableCell className="text-center text-lg">
                  {ingredient.badge ||
                    BADGE_FALLBACK[
                      (ingredient.status || ingredient.risk || "moderate") as string
                    ] ||
                    "🟡"}
                </TableCell>

                <TableCell className="text-sm">
                  {ingredient.taiwanRegulation ||
                    ingredient.fda_regulation ||
                    (language === "zh" ? "無特定限制" : "No specific restriction")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IngredientRiskTable;
