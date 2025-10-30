export interface StorePrice {
  store: string;
  price: number;
  url: string;
  inStock?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  image?: string;
  price?: string;           // formatted e.g. "$199.99"
  cheapestPrice?: number;   // numeric
  cheapestStore?: string;
  url?: string;
  storePrices?: StorePrice[];
  source?: string;

  // optional fields used by ComparisonView (safe defaults if unused)
  rating?: {
    average: number;
    total: number;
  };
  reviews?: Array<{
    source: string;
    rating: number;
    totalReviews: number;
  }>;
}

export interface ComparisonItem {
  metric: string;
  leftValue: string | number;
  rightValue: string | number;
  winner?: 'left' | 'right' | 'tie' | null;
  description?: string;
}

export interface ComparisonResult {
  leftProduct: Product;
  rightProduct: Product;
  comparison: ComparisonItem[];
  conclusion: string;
}