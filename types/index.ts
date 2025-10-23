export interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price?: string;
  url: string;
  source: string; // 'amazon', 'bestbuy', 'official', etc.
}

export interface ProductDetails extends Product {
  specs: Spec[];
  reviews: Review[];
  rating: Rating;
}

export interface Spec {
  name: string;
  value: string;
  importance: 'high' | 'medium' | 'low';
}

export interface Review {
  source: string;
  rating: number;
  totalReviews: number;
  summary?: string;
}

export interface Rating {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ComparisonResult {
  leftProduct: ProductDetails;
  rightProduct: ProductDetails;
  comparison: ComparisonItem[];
  conclusion: string;
  winner?: 'left' | 'right' | 'tie';
}

export interface ComparisonItem {
  metric: string;
  leftValue: string;
  rightValue: string;
  winner?: 'left' | 'right' | 'tie';
  description?: string;
}
