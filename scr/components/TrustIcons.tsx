import React from 'react';
import { Baby, Leaf, AlertTriangle, Shield } from 'lucide-react';

interface TrustIconsProps {
  language: 'en' | 'zh';
}

const TrustIcons: React.FC<TrustIconsProps> = ({ language }) => {
  const icons = [
    {
      icon: Baby,
      label: language === 'zh' ? 'Child Safe / 安全兒童' : 'Child Safe / 安全兒童',
      color: 'text-green-600'
    },
    {
      icon: Leaf,
      label: language === 'zh' ? 'Healthy Choice / 健康選擇' : 'Healthy Choice / 健康選擇',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      label: language === 'zh' ? 'Additive Warning / 添加物警示' : 'Additive Warning / 添加物警示',
      color: 'text-orange-600'
    },
    {
      icon: Shield,
      label: language === 'zh' ? 'Taiwan Rules / 台灣法規' : 'Taiwan Rules / 台灣法規',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="flex justify-center items-center space-x-8 mt-6 px-4">
      {icons.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div key={index} className="flex flex-col items-center text-center">
            <div className={`w-8 h-8 ${item.color} mb-2`}>
              <IconComponent className="w-full h-full" />
            </div>
            <p className="text-xs text-gray-600 leading-tight max-w-16">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default TrustIcons;