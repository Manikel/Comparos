import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// This is a mock implementation. In production, you would:
// 1. Use web scraping libraries (puppeteer, cheerio)
// 2. Integrate with Amazon Product API, BestBuy API, etc.
// 3. Use AI to parse product information from URLs
// 4. Search across multiple stores

export async function POST(request: NextRequest) {
  try {
    const { query, isUrl } = await request.json();

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const brand = extractBrand(query);
    const productName = isUrl ? extractProductNameFromUrl(query) : generateProductName(query, brand);

    // Mock product data
    const mockProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productName,
      brand: brand,
      image: generatePlaceholderImage(productName),
      price: `$${generateRealisticPrice(query).toFixed(2)}`,
      url: isUrl ? query : `https://amazon.com/product/${Math.random().toString(36)}`,
      source: isUrl ? detectSource(query) : 'Amazon',
    };

    return NextResponse.json({ product: mockProduct });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search product' },
      { status: 500 }
    );
  }
}

function extractProductNameFromUrl(url: string): string {
  // Simple extraction - in production, use web scraping
  const parts = url.split('/');
  const productPart = parts.find(p => p.includes('-')) || 'Product';
  return productPart.replace(/-/g, ' ').slice(0, 100);
}

function generateProductName(query: string, brand: string): string {
  // Generate a realistic product name without "Premium Edition"
  const lowerQuery = query.toLowerCase();

  // Common product types and their typical model patterns
  if (lowerQuery.includes('toothbrush') || lowerQuery.includes('tooth brush')) {
    const models = ['Pro 1000', '3000', '5000', 'Genius X', 'Smart 5000', 'Elite'];
    const model = models[Math.floor(Math.random() * models.length)];
    return `${brand} Electric Toothbrush ${model}`;
  } else if (lowerQuery.includes('laptop')) {
    const models = ['XPS 13', 'MacBook Pro', 'ThinkPad X1', 'Spectre x360', 'ZenBook'];
    const model = models[Math.floor(Math.random() * models.length)];
    return `${brand} ${model} Laptop`;
  } else if (lowerQuery.includes('phone')) {
    const models = ['14 Pro', 'Galaxy S23', 'Pixel 8', '15 Plus'];
    const model = models[Math.floor(Math.random() * models.length)];
    return `${brand} ${model} Smartphone`;
  } else if (lowerQuery.includes('headphone') || lowerQuery.includes('earbuds')) {
    const models = ['Pro', 'Studio', 'Elite', 'QuietComfort', 'WH-1000XM5'];
    const model = models[Math.floor(Math.random() * models.length)];
    return `${brand} ${model} Wireless Headphones`;
  } else {
    // Generic product name
    const words = query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return `${brand} ${words.join(' ')}`;
  }
}

function generateRealisticPrice(query: string): number {
  const lowerQuery = query.toLowerCase();

  // Price ranges based on product categories
  if (lowerQuery.includes('toothbrush') || lowerQuery.includes('tooth brush')) {
    return Math.random() * 80 + 20; // $20-$100
  } else if (lowerQuery.includes('laptop')) {
    return Math.random() * 1500 + 500; // $500-$2000
  } else if (lowerQuery.includes('phone') || lowerQuery.includes('smartphone')) {
    return Math.random() * 700 + 300; // $300-$1000
  } else if (lowerQuery.includes('headphone') || lowerQuery.includes('earbuds')) {
    return Math.random() * 250 + 50; // $50-$300
  } else if (lowerQuery.includes('watch') || lowerQuery.includes('smartwatch')) {
    return Math.random() * 350 + 150; // $150-$500
  } else if (lowerQuery.includes('tablet')) {
    return Math.random() * 600 + 200; // $200-$800
  } else if (lowerQuery.includes('camera')) {
    return Math.random() * 1000 + 300; // $300-$1300
  } else if (lowerQuery.includes('tv') || lowerQuery.includes('television')) {
    return Math.random() * 1200 + 300; // $300-$1500
  } else {
    // Default range for unknown products
    return Math.random() * 150 + 25; // $25-$175
  }
}

function extractBrand(query: string): string {
  const commonBrands = [
    'Oral-B', 'Colgate', 'Philips', 'Sonicare', 'Waterpik', 'Quip',
    'Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer',
    'Sony', 'Bose', 'JBL', 'Beats', 'Sennheiser',
    'LG', 'Google', 'Microsoft', 'Razer', 'Logitech'
  ];
  const found = commonBrands.find(brand =>
    query.toLowerCase().includes(brand.toLowerCase())
  );
  return found || 'TechBrand';
}

function detectSource(url: string): string {
  if (url.includes('amazon')) return 'Amazon';
  if (url.includes('bestbuy')) return 'Best Buy';
  if (url.includes('walmart')) return 'Walmart';
  if (url.includes('target')) return 'Target';
  return 'Official Store';
}

function generatePlaceholderImage(productName: string): string {
  // Using placeholder.com for better image display
  const seed = encodeURIComponent(productName);
  // Use a more reliable placeholder service with product-like imagery
  return `https://placehold.co/400x400/1a1a24/3b82f6?text=${seed.slice(0, 20)}`;
}
