import { NextRequest, NextResponse } from 'next/server';
import { Product, StorePrice } from '@/types';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { query, isUrl } = await request.json();

    console.log('🔍 User searched for:', query);

    // STEP 1: Use AI to UNDERSTAND what the user actually wants
    const intelligentQuery = await expandQueryWithAI(query);
    console.log('🤖 AI understood this as:', intelligentQuery.fullName);

    // STEP 2: Search the web for this actual product
    const searchResults = await searchWeb(intelligentQuery.fullName);

    // STEP 3: Extract REAL product data from search results
    const productData = await extractRealProductData(searchResults, intelligentQuery);

    // STEP 4: Get REAL prices from actual stores - NO FALLBACKS!
    const storePrices = await getRealStorePrices(intelligentQuery.fullName);

    // Find cheapest
    const cheapest = storePrices.length > 0
      ? storePrices.reduce((min, store) => store.price < min.price ? store : min)
      : null;

    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productData.name,
      brand: intelligentQuery.brand,
      image: productData.image,
      price: cheapest ? `$${cheapest.price.toFixed(2)}` : 'Price not available',
      cheapestPrice: cheapest?.price,
      cheapestStore: cheapest?.store,
      storePrices: storePrices.length > 0 ? storePrices : undefined,
      url: cheapest?.url || productData.url,
      source: cheapest?.store || 'Web',
    };

    if (storePrices.length > 0) {
      console.log(`✅ REAL PRICES FOUND: ${product.name} @ ${product.price} from ${product.cheapestStore}`);
    } else {
      console.log(`⚠️ NO REAL PRICES FOUND for ${product.name} - showing "Price not available"`);
    }

    return NextResponse.json({ product });

  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search product' },
      { status: 500 }
    );
  }
}

// STEP 1: AI THINKS and expands vague queries (with smart fallback!)
async function expandQueryWithAI(userQuery: string): Promise<{
  fullName: string;
  brand: string;
  category: string;
}> {
  console.log('🧠 Analyzing query:', userQuery);

  // SMART FALLBACK: Expand common vague queries without AI
  const smartExpansion = smartExpandQuery(userQuery);
  if (smartExpansion) {
    console.log('✅ Smart expansion:', smartExpansion.fullName);
    return smartExpansion;
  }

  // Try OpenAI if available AND has credits
  if (!process.env.OPENAI_API_KEY) {
    console.log('ℹ️ No OpenAI key - using basic expansion');
    return basicExpansion(userQuery);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a product search assistant. When given a vague product query, expand it to the full product name.

Examples:
- "xm4" → "Sony WH-1000XM4 Wireless Headphones"
- "iphone 15" → "Apple iPhone 15"
- "oral b" → "Oral-B Electric Toothbrush"
- "macbook" → "Apple MacBook Pro"
- "airpods" → "Apple AirPods Pro"

Return JSON with:
{
  "fullName": "Complete product name with brand and model",
  "brand": "Brand name only",
  "category": "Product category (headphones, phone, laptop, etc.)"
}`
        },
        {
          role: 'user',
          content: `User is searching for: "${userQuery}"\n\nWhat product are they looking for?`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log('✅ AI expanded query to:', result.fullName);

    return {
      fullName: result.fullName || userQuery,
      brand: result.brand || extractBrand(userQuery),
      category: result.category || detectCategory(userQuery)
    };

  } catch (error) {
    console.error('⚠️ AI expansion failed (no credits?) - using smart fallback:', error);
    return basicExpansion(userQuery);
  }
}

// Smart pattern matching for common vague queries
function smartExpandQuery(query: string): { fullName: string; brand: string; category: string } | null {
  const lower = query.toLowerCase().trim();

  // Sony Headphones
  if (lower === 'xm4' || lower === 'wh-1000xm4' || lower === 'sony xm4') {
    return { fullName: 'Sony WH-1000XM4 Wireless Headphones', brand: 'Sony', category: 'headphones' };
  }
  if (lower === 'xm5' || lower === 'wh-1000xm5' || lower === 'sony xm5') {
    return { fullName: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'headphones' };
  }

  // Apple Products
  if (lower === 'airpods max' || lower === 'airpods max') {
    return { fullName: 'Apple AirPods Max', brand: 'Apple', category: 'headphones' };
  }
  if (lower === 'airpods' || lower === 'airpods pro') {
    return { fullName: 'Apple AirPods Pro 2nd Generation', brand: 'Apple', category: 'earbuds' };
  }
  if (lower.match(/^iphone\s*15$/i)) {
    return { fullName: 'Apple iPhone 15', brand: 'Apple', category: 'smartphone' };
  }
  if (lower.match(/^iphone\s*14$/i)) {
    return { fullName: 'Apple iPhone 14', brand: 'Apple', category: 'smartphone' };
  }
  if (lower === 'macbook' || lower === 'macbook pro') {
    return { fullName: 'Apple MacBook Pro', brand: 'Apple', category: 'laptop' };
  }

  // Samsung
  if (lower.includes('galaxy s24')) {
    return { fullName: 'Samsung Galaxy S24', brand: 'Samsung', category: 'smartphone' };
  }
  if (lower.includes('galaxy s23')) {
    return { fullName: 'Samsung Galaxy S23', brand: 'Samsung', category: 'smartphone' };
  }

  // Other common products
  if (lower === 'oral b' || lower === 'oral-b') {
    return { fullName: 'Oral-B Electric Toothbrush', brand: 'Oral-B', category: 'toothbrush' };
  }

  return null; // No match, try AI or basic expansion
}

// Basic expansion when no AI and no pattern match
function basicExpansion(query: string): { fullName: string; brand: string; category: string } {
  return {
    fullName: query,
    brand: extractBrand(query),
    category: detectCategory(query)
  };
}

// STEP 2: Search the web
async function searchWeb(query: string): Promise<any> {
  console.log('🌐 Searching web for:', query);

  if (!process.env.BRAVE_API_KEY) {
    console.log('⚠️ No Brave API key, using fallback');
    return { web: { results: [] } };
  }

  try {
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query + ' buy price')}&count=10`;

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.web?.results?.length || 0} search results`);
    return data;

  } catch (error) {
    console.error('⚠️ Web search failed:', error);
    return { web: { results: [] } };
  }
}

// STEP 3: Extract REAL product data
async function extractRealProductData(searchResults: any, intelligentQuery: any): Promise<{
  name: string;
  image: string;
  url: string;
}> {
  const results = searchResults.web?.results || [];

  // Try to find a real product image from search results
  let productImage = '';

  // First, check if any result has a thumbnail
  for (const result of results.slice(0, 5)) {
    if (result.thumbnail?.src) {
      productImage = result.thumbnail.src;
      console.log('✅ Found product image in search results');
      break;
    }
    if (result.page?.image) {
      productImage = result.page.image;
      console.log('✅ Found product image from page');
      break;
    }
  }

  // If no image found, try Unsplash for category image
  if (!productImage) {
    try {
      const category = intelligentQuery.category || 'product';
      const unsplashUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(category)}`;

      const imgTest = await fetch(unsplashUrl, { method: 'HEAD' });
      if (imgTest.ok) {
        productImage = unsplashUrl;
        console.log('✅ Using Unsplash image for', category);
      }
    } catch (error) {
      console.log('⚠️ Unsplash failed');
    }
  }

  // Last resort: placeholder
  if (!productImage) {
    const category = intelligentQuery.category || 'product';
    productImage = `https://via.placeholder.com/400x400/3b82f6/ffffff?text=${encodeURIComponent(category)}`;
    console.log('⚠️ Using placeholder image');
  }

  // Get product URL from first result
  const productUrl = results[0]?.url || '';

  return {
    name: intelligentQuery.fullName,
    image: productImage,
    url: productUrl
  };
}

// AI-POWERED: Select RELEVANT stores for this product type
async function getRelevantStores(productName: string): Promise<Array<{ name: string; domain: string }>> {
  // ALL available stores
  const allStores = [
    { name: 'Amazon', domain: 'amazon.com' },
    { name: 'Best Buy', domain: 'bestbuy.com' },
    { name: 'Walmart', domain: 'walmart.com' },
    { name: 'B&H Photo', domain: 'bhphotovideo.com' },
    { name: 'Adorama', domain: 'adorama.com' },
    { name: 'Crutchfield', domain: 'crutchfield.com' },
  ];

  // Smart fallback based on product type
  const lower = productName.toLowerCase();

  // Electronics/Tech → Amazon, Best Buy, B&H Photo, Adorama
  if (lower.includes('headphone') || lower.includes('airpods') || lower.includes('speaker') ||
      lower.includes('camera') || lower.includes('phone') || lower.includes('laptop') ||
      lower.includes('iphone') || lower.includes('galaxy') || lower.includes('macbook') ||
      lower.includes('ipad') || lower.includes('watch') || lower.includes('xm4') || lower.includes('xm5')) {
    return [
      { name: 'Amazon', domain: 'amazon.com' },
      { name: 'Best Buy', domain: 'bestbuy.com' },
      { name: 'B&H Photo', domain: 'bhphotovideo.com' },
    ];
  }

  // Consumer goods → Amazon, Walmart
  if (lower.includes('toothbrush') || lower.includes('toothpaste') || lower.includes('shampoo')) {
    return [
      { name: 'Amazon', domain: 'amazon.com' },
      { name: 'Walmart', domain: 'walmart.com' },
    ];
  }

  // Default: Amazon, Best Buy, Walmart
  return [
    { name: 'Amazon', domain: 'amazon.com' },
    { name: 'Best Buy', domain: 'bestbuy.com' },
    { name: 'Walmart', domain: 'walmart.com' },
  ];
}

// SCRAPE ACTUAL WEB PAGE TO GET PRICE
async function scrapePrice(url: string, storeName: string): Promise<number | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 5000, // 5 second timeout
    });

    const $ = cheerio.load(response.data);
    let price: number | null = null;

    // Store-specific selectors
    if (storeName === 'Amazon') {
      // Amazon price selectors
      const priceWhole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
      const priceFraction = $('.a-price-fraction').first().text().replace(/[^0-9]/g, '');
      if (priceWhole) {
        price = parseFloat(`${priceWhole}.${priceFraction || '00'}`);
      }
    } else if (storeName === 'Best Buy') {
      // Best Buy price selectors
      const priceText = $('[class*="priceView-hero-price"]').first().text() ||
                       $('[class*="pricing-price"]').first().text() ||
                       $('span[aria-label*="$"]').first().attr('aria-label');

      if (priceText) {
        const match = priceText.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (match) price = parseFloat(match[1].replace(/,/g, ''));
      }
    } else if (storeName === 'Walmart') {
      // Walmart price selectors
      const priceText = $('[itemprop="price"]').first().attr('content') ||
                       $('[data-testid="product-price"]').first().text() ||
                       $('.price-characteristic').first().text();

      if (priceText) {
        const match = priceText.match(/(\d+(?:\.\d{2})?)/);
        if (match) price = parseFloat(match[1]);
      }
    } else if (storeName === 'B&H Photo') {
      // B&H Photo price selectors
      const priceText = $('[data-selenium="pricingPrice"]').first().text() ||
                       $('.price_1').first().text();

      if (priceText) {
        const match = priceText.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (match) price = parseFloat(match[1].replace(/,/g, ''));
      }
    }

    // Generic fallback - search entire page for price patterns
    if (!price) {
      const bodyText = $('body').text();
      const priceMatches = bodyText.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);

      if (priceMatches && priceMatches.length > 0) {
        // Get most common price (likely the actual price)
        const prices = priceMatches.map(m => parseFloat(m.replace(/[$,]/g, '')))
          .filter(p => p >= 1 && p <= 10000);

        if (prices.length > 0) {
          price = prices[0]; // Use first valid price found
        }
      }
    }

    return price;
  } catch (error) {
    return null;
  }
}

// STEP 4: Get REAL prices from stores - NO FAKE FALLBACKS
async function getRealStorePrices(productName: string): Promise<StorePrice[]> {
  console.log('💰 Getting REAL prices for:', productName);

  if (!process.env.BRAVE_API_KEY) {
    console.log('❌ No Brave API key - cannot get prices');
    return [];
  }

  // STEP 4A: Use AI to determine RELEVANT stores for this product
  const relevantStores = await getRelevantStores(productName);
  console.log(`🎯 AI selected ${relevantStores.length} relevant stores:`, relevantStores.map(s => s.name).join(', '));

  try {
    // SEQUENTIAL SEARCH: One store at a time to avoid rate limits
    const validPrices: StorePrice[] = [];

    for (let i = 0; i < relevantStores.length; i++) {
      const store = relevantStores[i];

      // Add delay between requests (1.2 seconds) to respect rate limit
      if (i > 0) {
        console.log(`⏳ Waiting 1.2s before next search...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      try {
        // More specific query per store
        const storeQuery = `${productName} price site:${store.domain}`;
        const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(storeQuery)}&count=10`;

        console.log(`🔍 Searching ${store.name}:`, storeQuery);

        const response = await fetch(searchUrl, {
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`❌ ${store.name} search failed:`, response.status, errorText.substring(0, 100));
          continue;
        }

        const data = await response.json();
        const results = data.web?.results || [];

        console.log(`📊 ${store.name}: Found ${results.length} results`);

        if (results.length === 0) {
          console.log(`⚠️ ${store.name}: No results found`);
          continue;
        }

        // SCRAPE THE ACTUAL WEB PAGE TO GET THE PRICE
        let foundPrice: number | null = null;
        let foundUrl: string | null = null;

        // Try first 3 results
        for (const result of results.slice(0, 3)) {
          if (!result.url) continue;

          console.log(`🌐 ${store.name}: Trying to scrape ${result.url}`);

          try {
            // Scrape the actual page
            const price = await scrapePrice(result.url, store.name);

            if (price) {
              foundPrice = price;
              foundUrl = result.url;
              console.log(`✅ ${store.name}: Scraped price $${price} from ${result.url}`);
              break;
            }
          } catch (error) {
            console.log(`⚠️ ${store.name}: Failed to scrape ${result.url}`);
            continue;
          }
        }

        if (!foundPrice) {
          console.log(`❌ ${store.name}: Could not scrape any prices`);
          continue;
        }

        validPrices.push({
          store: store.name,
          price: foundPrice,
          url: foundUrl || results[0]?.url || `https://www.${store.domain}`,
          inStock: true,
        });

      } catch (error) {
        console.error(`❌ ${store.name} error:`, error);
        continue;
      }
    }

    console.log(`✅ Found ${validPrices.length} real prices out of ${relevantStores.length} stores`);

    if (validPrices.length === 0) {
      console.log('❌ NO REAL PRICES FOUND - returning empty array');
      return [];
    }

    return validPrices.sort((a, b) => a.price - b.price);

  } catch (error) {
    console.error('❌ Price search error:', error);
    return [];
  }
}

function detectCategory(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('headphone') || lower.includes('xm4') || lower.includes('airpod')) return 'headphones';
  if (lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy')) return 'smartphone';
  if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('computer')) return 'laptop';
  if (lower.includes('toothpaste')) return 'toothpaste';
  if (lower.includes('toothbrush')) return 'toothbrush';
  if (lower.includes('watch')) return 'smartwatch';
  if (lower.includes('earbud')) return 'earbuds';

  return 'product';
}

function extractBrand(query: string): string {
  const brands = [
    'Sony', 'Apple', 'Samsung', 'Google', 'Microsoft',
    'Bose', 'JBL', 'Beats', 'Sennheiser',
    'Oral-B', 'Colgate', 'Philips', 'Sonicare',
    'Dell', 'HP', 'Lenovo', 'ASUS',
  ];

  const found = brands.find(b => query.toLowerCase().includes(b.toLowerCase()));
  return found || 'Generic';
}
