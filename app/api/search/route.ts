import { NextRequest, NextResponse } from 'next/server';
import { Product, StorePrice } from '@/types';

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
    const category = detectCategory(query);

    // Generate prices from multiple stores
    const storePrices = generateMultiStorePrices(category);

    // Find cheapest price
    const cheapest = storePrices.reduce((min, store) =>
      store.price < min.price ? store : min
    );

    // Generate product image based on category
    const productImage = generateProductImage(category, productName);

    // Mock product data with multi-store pricing
    const mockProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productName,
      brand: brand,
      image: productImage,
      price: `$${cheapest.price.toFixed(2)}`,
      cheapestPrice: cheapest.price,
      cheapestStore: cheapest.store,
      storePrices: storePrices,
      url: cheapest.url,
      source: cheapest.store,
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

function detectCategory(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('toothbrush') || lowerQuery.includes('tooth brush')) return 'toothbrush';
  if (lowerQuery.includes('laptop')) return 'laptop';
  if (lowerQuery.includes('phone') || lowerQuery.includes('smartphone')) return 'phone';
  if (lowerQuery.includes('headphone') || lowerQuery.includes('earbuds')) return 'headphones';
  if (lowerQuery.includes('watch') || lowerQuery.includes('smartwatch')) return 'watch';
  if (lowerQuery.includes('tablet')) return 'tablet';
  if (lowerQuery.includes('camera')) return 'camera';
  if (lowerQuery.includes('tv') || lowerQuery.includes('television')) return 'tv';

  return 'electronics';
}

function generateMultiStorePrices(category: string): StorePrice[] {
  const stores = ['Amazon', 'Best Buy', 'Target', 'Walmart', 'Official Store'];
  const basePrice = getBasePriceForCategory(category);

  // Generate prices with realistic variations
  const storePrices: StorePrice[] = stores.map(store => {
    // Each store has a random variance from base price (-15% to +25%)
    const variance = (Math.random() * 0.4) - 0.15; // -15% to +25%
    const price = basePrice * (1 + variance);

    // Some stores might be out of stock (10% chance)
    const inStock = Math.random() > 0.1;

    return {
      store,
      price: parseFloat(price.toFixed(2)),
      url: `https://${store.toLowerCase().replace(/\s+/g, '')}.com/product/${Math.random().toString(36)}`,
      inStock
    };
  });

  // Ensure at least 2 stores have stock
  const inStockCount = storePrices.filter(p => p.inStock).length;
  if (inStockCount < 2) {
    storePrices[0].inStock = true;
    storePrices[1].inStock = true;
  }

  // Sort by price (cheapest first)
  return storePrices.sort((a, b) => {
    // In-stock items come first
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    // Then sort by price
    return a.price - b.price;
  });
}

function getBasePriceForCategory(category: string): number {
  const priceRanges: { [key: string]: { min: number; max: number } } = {
    toothbrush: { min: 35, max: 85 },
    laptop: { min: 699, max: 1899 },
    phone: { min: 399, max: 999 },
    headphones: { min: 79, max: 299 },
    watch: { min: 199, max: 499 },
    tablet: { min: 299, max: 799 },
    camera: { min: 399, max: 1299 },
    tv: { min: 399, max: 1499 },
    electronics: { min: 49, max: 199 },
  };

  const range = priceRanges[category] || priceRanges.electronics;
  return Math.random() * (range.max - range.min) + range.min;
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

function generateProductImage(category: string, productName: string): string {
  // Use a color-coded placeholder based on category
  const categoryColors: { [key: string]: { bg: string; text: string } } = {
    toothbrush: { bg: '3b82f6', text: 'ffffff' },
    laptop: { bg: '0ea5e9', text: 'ffffff' },
    phone: { bg: '06b6d4', text: 'ffffff' },
    headphones: { bg: '8b5cf6', text: 'ffffff' },
    watch: { bg: 'ec4899', text: 'ffffff' },
    tablet: { bg: '10b981', text: 'ffffff' },
    camera: { bg: 'f59e0b', text: 'ffffff' },
    tv: { bg: 'ef4444', text: 'ffffff' },
    electronics: { bg: '6366f1', text: 'ffffff' },
  };

  const colors = categoryColors[category] || categoryColors.electronics;

  // Use via.placeholder.com which is very reliable
  const text = category.charAt(0).toUpperCase() + category.slice(1);
  return `https://via.placeholder.com/400x400/${colors.bg}/${colors.text}?text=${encodeURIComponent(text)}`;
}
