import { supabase } from '@/lib/supabase';

export interface BarcodeResult {
  found: boolean;
  productName?: string;
  labelImageUrl?: string;
  error?: string;
}

export class BarcodeService {
  static async lookupBarcode(barcode: string): Promise<BarcodeResult> {
    try {
      // Query the products table for the barcode
      const { data, error } = await supabase
        .from('products')
        .select('name, label_image_url')
        .eq('barcode', barcode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return {
            found: false,
            error: 'Product not found in database'
          };
        }
        throw error;
      }

      if (data.label_image_url) {
        return {
          found: true,
          productName: data.name,
          labelImageUrl: data.label_image_url
        };
      } else {
        return {
          found: true,
          productName: data.name,
          error: 'Label image not available'
        };
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return {
        found: false,
        error: 'Database query failed'
      };
    }
  }

  static async analyzeProductFromBarcode(
    barcode: string,
    language: 'zh' | 'en' = 'zh'
  ): Promise<any> {
    const barcodeResult = await this.lookupBarcode(barcode);
    
    if (!barcodeResult.found) {
      throw new Error(language === 'zh' ? '條碼找到但產品標籤缺失。' : 'Barcode found but product label missing.');
    }

    if (!barcodeResult.labelImageUrl) {
      throw new Error(language === 'zh' ? '條碼找到但產品標籤缺失。' : 'Barcode found but product label missing.');
    }

    // Send the label image to the analysis function using direct fetch
    const response = await fetch('https://hqgzhlugkxytionyrnor.supabase.co/functions/v1/analyze-product-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: barcodeResult.labelImageUrl,
        language: language
      })
    });

    if (!response.ok) {
      throw new Error(language === 'zh' ? '掃描失敗，請再試一次。' : 'Scan failed, please try again.');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(language === 'zh' ? '掃描失敗，請再試一次。' : 'Scan failed, please try again.');
    }

    return {
      ...data,
      productName: barcodeResult.productName
    };
  }
}