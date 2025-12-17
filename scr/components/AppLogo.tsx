import React from "react";
import { Eye } from "lucide-react";

type LogoSize = "small" | "medium" | "large";

type AppLogoProps = {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
};

export default function AppLogo({
  size = "large",
  showText = true,
  className = "",
}: AppLogoProps) {
  const ringSize =
    size === "small" ? "w-14 h-14" : size === "medium" ? "w-20 h-20" : "w-24 h-24";
  const eyeSize =
    size === "small" ? "w-6 h-6" : size === "medium" ? "w-8 h-8" : "w-10 h-10";

  const titleSize =
    size === "small" ? "text-lg" : size === "medium" ? "text-2xl" : "text-3xl";
  const subtitleSize =
    size === "small" ? "text-sm" : size === "medium" ? "text-base" : "text-lg";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Eye + circle */}
      <div className={`${ringSize} rounded-full border-4 border-emerald-600 flex items-center justify-center bg-white/70`}>
        <Eye className={`${eyeSize} text-emerald-700`} />
      </div>

      {showText && (
        <div className="mt-4 text-center px-4 space-y-1">
          <div className={`${titleSize} font-bold text-emerald-800 leading-tight`}>
            Food Safety Eye
          </div>
          <div className={`${subtitleSize} font-semibold text-emerald-700`}>
            食安眼
          </div>
        </div>
      )}
    </div>
  );
}
