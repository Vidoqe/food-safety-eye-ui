import React from 'react';
import { Card } from '@/components/ui/card';

interface ProductSummaryProps {
  productName?: string;
  ingredients?: string[];
  barcode?: string;
  language: 'zh' | 'en';
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ 
  productName, 
  ingredients = [], 
  barcode, 
  language 
}) => {
  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🧾</div>
          <div className="text-lg font-semibold text-gray-800">
            {language === 'zh' ? 'Product Summary' : 'Product Summary'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">
              {language === 'zh' ? 'Product Name:' : 'Product Name:'}
            </span>
            <p className="text-gray-600 text-sm">{productName || 'Unknown Product'}</p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">
              {language === 'zh' ? 'Scanned Ingredients:' : 'Scanned Ingredients:'}
            </span>
            <p className="text-gray-600 text-sm">
              {ingredients.length > 0 ? ingredients.join(', ') : 'No ingredients detected'}
            </p>
          </div>
          
          {barcode && (
            <div>
              <span className="font-medium text-gray-700">
                {language === 'zh' ? 'Barcode:' : 'Barcode:'}
              </span>
              <p className="text-gray-600 text-sm">{barcode}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductSummary;