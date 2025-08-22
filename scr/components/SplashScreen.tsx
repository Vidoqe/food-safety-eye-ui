import React, { useEffect } from 'react';
import AppLogo from './AppLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="text-center w-full max-w-md">
        <div className="animate-pulse mb-8">
          <AppLogo size="large" showText={true} className="mt-8" />
        </div>
        <p className="text-green-600 text-base md:text-lg mb-8 px-4">
          Safe food, safe family / 吃得安心，全家放心
        </p>
        
        <div className="mt-8">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;