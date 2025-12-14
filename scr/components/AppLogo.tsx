import React from 'react';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32 md:w-36 md:h-36',
    large: 'w-36 h-36 md:w-40 md:h-40 lg:w-44 lg:h-44'
  };

  const textSizeClasses = {
    small: 'text-base',
    medium: 'text-lg md:text-xl',
    large: 'text-xl md:text-2xl'
  };

  return (
    <div className={`text-center mt-6 md:mt-8 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className={`${sizeClasses[size]} bg-green-100 rounded-full flex items-center justify-center border-4 border-green-500 shadow-lg`}>
 <Shield className="w-10 h-10 text-green-700" strokeWidth={2.5} />
</div>
          import { Shield } from "lucide-react";
            👁️
          </div>
        </div>
      </div>
      {showText && (
        <div className={`${textSizeClasses[size]} font-bold text-green-800 leading-tight px-4 space-y-1`}>
          <div>Food Safety Eye</div>
          <div>食安眼</div>
        </div>
      )}
    </div>
  );
};

export { AppLogo };
export default AppLogo;