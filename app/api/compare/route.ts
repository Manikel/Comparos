import { NextRequest, NextResponse } from 'next/server';
import { Product, ProductDetails, ComparisonResult, ComparisonItem } from '@/types';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { leftProduct, rightProduct } = await request.json();

    console.log('🔄 Starting AI-powered comparison for:', leftProduct.name, 'vs', rightProduct.name);

    // Use AI to generate detailed products with RELEVANT specs
    const leftDetails = await generateProductDetailsWithAI(leftProduct);
    const rightDetails = await generateProductDetailsWithAI(rightProduct);

    // Generate comparison
    const comparison = generateComparison(leftDetails, rightDetails);

    // Use AI to generate intelligent conclusion
    const conclusion = await generateAIConclusion(comparison, leftDetails, rightDetails);

    const result: ComparisonResult = {
      leftProduct: leftDetails,
      rightProduct: rightDetails,
      comparison,
      conclusion,
      winner: determineWinner(comparison),
    };

    console.log('✅ Comparison complete!');
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare products' },
      { status: 500 }
    );
  }
}

// AI-POWERED: Generate specs based on what the product ACTUALLY is
async function generateProductDetailsWithAI(product: Product): Promise<ProductDetails> {
  console.log('🤖 AI analyzing product:', product.name);

  let specs = [];

  // Try to use AI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a product specification expert with deep knowledge of actual products. Given a product name, generate FACTUAL, SPECIFIC specifications for that EXACT product based on real specs.

IMPORTANT: Generate DIFFERENT values for different products! Don't use the same values for all products.

For headphones: battery life, noise cancellation type, driver size, frequency response, bluetooth version, weight, codecs, etc.
For phones: display size, processor model, RAM amount, storage options, camera megapixels, battery mAh, 5G support, etc.
For laptops: processor model, RAM GB, storage GB, display size and resolution, battery life hours, weight lbs, graphics card, etc.

CRITICAL: Use your knowledge to provide ACTUAL specs for known products:
- Sony WH-1000XM4: 30hr battery, 40mm drivers, LDAC codec, 254g weight
- Sony WH-1000XM5: 30hr battery, 30mm drivers, LDAC codec, 250g weight
- Apple AirPods Max: 20hr battery, 40mm drivers, AAC codec, 385g weight
- iPhone 15: 6.1" display, A16 Bionic, 48MP camera, 3,877mAh battery
- iPhone 15 Pro: 6.1" display, A17 Pro, 48MP camera, 3,274mAh battery

Return JSON with specs array. Each spec should have:
{
  "name": "Spec name",
  "value": "ACTUAL factual value for THIS specific product",
  "importance": "high" | "medium" | "low"
}`
          },
          {
            role: 'user',
            content: `Generate FACTUAL, SPECIFIC specifications for this EXACT product: "${product.name}"\nBrand: ${product.brand}\nPrice: ${product.price}\n\nUse your knowledge of this specific product to provide accurate specs. Make sure specs are DIFFERENT from other products.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2, // Lower temperature for more factual responses
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      specs = result.specs || [];
      console.log(`✅ AI generated ${specs.length} specs for ${product.name}`);

    } catch (error) {
      console.error('⚠️ AI spec generation failed:', error);
      specs = generateFallbackSpecs(product);
    }
  } else {
    console.log('ℹ️ No OpenAI key - using fallback specs');
    specs = generateFallbackSpecs(product);
  }

  // Mock reviews (same as before)
  const reviews = [
    {
      source: 'Amazon',
      rating: Math.random() * 1.5 + 3.5,
      totalReviews: Math.floor(Math.random() * 5000 + 500),
    },
    {
      source: 'Best Buy',
      rating: Math.random() * 1.5 + 3.5,
      totalReviews: Math.floor(Math.random() * 2000 + 200),
    },
    {
      source: 'Consumer Reports',
      rating: Math.random() * 1.5 + 3.5,
      totalReviews: Math.floor(Math.random() * 500 + 50),
    },
  ];

  const totalReviews = reviews.reduce((sum, r) => sum + r.totalReviews, 0);
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating * r.totalReviews, 0) / totalReviews;

  return {
    ...product,
    specs,
    reviews: reviews.map(r => ({ ...r, rating: Number(r.rating.toFixed(1)) })),
    rating: {
      average: Number(averageRating.toFixed(1)),
      total: totalReviews,
      distribution: {
        5: Math.floor(totalReviews * 0.5),
        4: Math.floor(totalReviews * 0.3),
        3: Math.floor(totalReviews * 0.1),
        2: Math.floor(totalReviews * 0.05),
        1: Math.floor(totalReviews * 0.05),
      },
    },
  };
}

// Fallback specs when AI unavailable - PRODUCT SPECIFIC!
function generateFallbackSpecs(product: Product) {
  const lower = product.name.toLowerCase();

  // SPECIFIC Sony WH-1000XM4
  if (lower.includes('xm4') || lower.includes('1000xm4')) {
    return [
      { name: 'Battery Life', value: '30 hours', importance: 'high' as const },
      { name: 'Noise Cancellation', value: 'Industry-leading ANC', importance: 'high' as const },
      { name: 'Driver Size', value: '40mm', importance: 'medium' as const },
      { name: 'Bluetooth', value: '5.0', importance: 'medium' as const },
      { name: 'Weight', value: '254g', importance: 'low' as const },
      { name: 'Frequency Response', value: '4Hz-40kHz', importance: 'medium' as const },
      { name: 'Codecs', value: 'LDAC, AAC, SBC', importance: 'high' as const },
      { name: 'Multipoint', value: 'Yes', importance: 'medium' as const },
      { name: 'Touch Controls', value: 'Yes', importance: 'medium' as const },
      { name: 'Charging Port', value: 'USB-C', importance: 'low' as const },
    ];
  }

  // SPECIFIC Sony WH-1000XM5
  if (lower.includes('xm5') || lower.includes('1000xm5')) {
    return [
      { name: 'Battery Life', value: '30 hours', importance: 'high' as const },
      { name: 'Noise Cancellation', value: 'Advanced ANC with 8 mics', importance: 'high' as const },
      { name: 'Driver Size', value: '30mm', importance: 'medium' as const },
      { name: 'Bluetooth', value: '5.2', importance: 'medium' as const },
      { name: 'Weight', value: '250g', importance: 'low' as const },
      { name: 'Frequency Response', value: '4Hz-40kHz', importance: 'medium' as const },
      { name: 'Codecs', value: 'LDAC, AAC, SBC', importance: 'high' as const },
      { name: 'Multipoint', value: 'Yes', importance: 'medium' as const },
      { name: 'Design', value: 'New sleeker design', importance: 'low' as const },
      { name: 'Charging Port', value: 'USB-C', importance: 'low' as const },
    ];
  }

  // SPECIFIC AirPods Max
  if (lower.includes('airpods max')) {
    return [
      { name: 'Battery Life', value: '20 hours', importance: 'high' as const },
      { name: 'Noise Cancellation', value: 'Active ANC', importance: 'high' as const },
      { name: 'Driver Size', value: '40mm', importance: 'medium' as const },
      { name: 'Chip', value: 'Apple H1', importance: 'high' as const },
      { name: 'Weight', value: '385g', importance: 'low' as const },
      { name: 'Spatial Audio', value: 'Yes with head tracking', importance: 'high' as const },
      { name: 'Codecs', value: 'AAC', importance: 'medium' as const },
      { name: 'Build', value: 'Aluminum & stainless steel', importance: 'medium' as const },
      { name: 'Digital Crown', value: 'Yes', importance: 'medium' as const },
      { name: 'Charging Port', value: 'Lightning', importance: 'low' as const },
    ];
  }

  // SPECIFIC AirPods Pro
  if (lower.includes('airpods pro')) {
    return [
      { name: 'Battery Life', value: '6 hours (30 with case)', importance: 'high' as const },
      { name: 'Noise Cancellation', value: 'Active ANC', importance: 'high' as const },
      { name: 'Chip', value: 'Apple H2', importance: 'high' as const },
      { name: 'Water Resistance', value: 'IPX4', importance: 'medium' as const },
      { name: 'Adaptive Audio', value: 'Yes', importance: 'high' as const },
      { name: 'Spatial Audio', value: 'Yes with head tracking', importance: 'high' as const },
      { name: 'Ear Tips', value: '4 sizes included', importance: 'medium' as const },
      { name: 'Charging', value: 'USB-C, MagSafe, Qi', importance: 'medium' as const },
      { name: 'Find My', value: 'Precision Finding', importance: 'low' as const },
      { name: 'Conversation Awareness', value: 'Yes', importance: 'medium' as const },
    ];
  }

  // Generic headphones fallback
  if (lower.includes('headphone')) {
    return [
      { name: 'Battery Life', value: '25 hours', importance: 'high' as const },
      { name: 'Noise Cancellation', value: 'Active ANC', importance: 'high' as const },
      { name: 'Driver Size', value: '40mm', importance: 'medium' as const },
      { name: 'Bluetooth', value: '5.0', importance: 'medium' as const },
      { name: 'Weight', value: '250g', importance: 'low' as const },
      { name: 'Frequency Response', value: '20Hz-20kHz', importance: 'medium' as const },
      { name: 'Codecs', value: 'AAC, SBC', importance: 'medium' as const },
      { name: 'Multipoint', value: 'No', importance: 'medium' as const },
      { name: 'Foldable', value: 'Yes', importance: 'low' as const },
      { name: 'Warranty', value: '1 year', importance: 'low' as const },
    ];
  }

  // Phones
  if (lower.includes('iphone') || lower.includes('galaxy') || lower.includes('phone')) {
    return [
      { name: 'Display', value: '6.1" OLED', importance: 'high' as const },
      { name: 'Processor', value: 'A16 Bionic', importance: 'high' as const },
      { name: 'RAM', value: '6GB', importance: 'high' as const },
      { name: 'Storage', value: '128GB', importance: 'high' as const },
      { name: 'Main Camera', value: '48MP', importance: 'high' as const },
      { name: 'Battery', value: '3,877 mAh', importance: 'high' as const },
      { name: '5G', value: 'Yes', importance: 'medium' as const },
      { name: 'Refresh Rate', value: '120Hz', importance: 'medium' as const },
      { name: 'Water Resistance', value: 'IP68', importance: 'medium' as const },
      { name: 'Wireless Charging', value: 'Yes', importance: 'low' as const },
    ];
  }

  // Laptops
  if (lower.includes('macbook') || lower.includes('laptop')) {
    return [
      { name: 'Processor', value: 'M2 Pro', importance: 'high' as const },
      { name: 'RAM', value: '16GB', importance: 'high' as const },
      { name: 'Storage', value: '512GB SSD', importance: 'high' as const },
      { name: 'Display', value: '14.2" Retina', importance: 'high' as const },
      { name: 'Resolution', value: '3024x1964', importance: 'medium' as const },
      { name: 'Battery Life', value: '18 hours', importance: 'high' as const },
      { name: 'Weight', value: '3.5 lbs', importance: 'medium' as const },
      { name: 'Ports', value: '3x Thunderbolt 4', importance: 'medium' as const },
      { name: 'Graphics', value: 'Integrated', importance: 'medium' as const },
      { name: 'Webcam', value: '1080p', importance: 'low' as const },
    ];
  }

  // Default generic specs
  return [
    { name: 'Build Quality', value: 'Premium', importance: 'high' as const },
    { name: 'Warranty', value: '1 year', importance: 'medium' as const },
    { name: 'Color Options', value: '3 colors', importance: 'low' as const },
    { name: 'Weight', value: 'Lightweight', importance: 'medium' as const },
    { name: 'Durability', value: 'High', importance: 'high' as const },
  ];
}

function generateComparison(
  left: ProductDetails,
  right: ProductDetails
): ComparisonItem[] {
  const comparison: ComparisonItem[] = [];

  // Compare price
  const leftPrice = parseFloat(left.price?.replace('$', '') || '0');
  const rightPrice = parseFloat(right.price?.replace('$', '') || '0');

  comparison.push({
    metric: 'Price',
    leftValue: left.price || 'N/A',
    rightValue: right.price || 'N/A',
    winner: leftPrice < rightPrice ? 'left' : rightPrice < leftPrice ? 'right' : 'tie',
    description: 'Lower is better for budget-conscious buyers',
  });

  // Compare rating
  comparison.push({
    metric: 'Average Rating',
    leftValue: `${left.rating.average}/5.0`,
    rightValue: `${right.rating.average}/5.0`,
    winner:
      left.rating.average > right.rating.average
        ? 'left'
        : right.rating.average > left.rating.average
        ? 'right'
        : 'tie',
  });

  // Compare total reviews
  comparison.push({
    metric: 'Total Reviews',
    leftValue: left.rating.total.toLocaleString(),
    rightValue: right.rating.total.toLocaleString(),
    winner:
      left.rating.total > right.rating.total
        ? 'left'
        : right.rating.total > left.rating.total
        ? 'right'
        : 'tie',
    description: 'More reviews indicate higher popularity',
  });

  // Compare common specs
  const specNames = [...new Set([...left.specs, ...right.specs].map(s => s.name))];
  specNames.slice(0, 7).forEach(specName => {
    const leftSpec = left.specs.find(s => s.name === specName);
    const rightSpec = right.specs.find(s => s.name === specName);

    if (leftSpec && rightSpec) {
      const winner = compareSpecValues(
        specName,
        leftSpec.value,
        rightSpec.value
      );

      comparison.push({
        metric: specName,
        leftValue: leftSpec.value,
        rightValue: rightSpec.value,
        winner,
      });
    }
  });

  return comparison.slice(0, 12); // Limit to ~12 metrics
}

function compareSpecValues(
  specName: string,
  leftValue: string,
  rightValue: string
): 'left' | 'right' | 'tie' {
  // Extract numbers for comparison
  const leftNum = parseFloat(leftValue.replace(/[^0-9.]/g, ''));
  const rightNum = parseFloat(rightValue.replace(/[^0-9.]/g, ''));

  if (isNaN(leftNum) || isNaN(rightNum)) {
    // For yes/no or text values
    if (leftValue.toLowerCase() === 'yes' && rightValue.toLowerCase() === 'no') return 'left';
    if (rightValue.toLowerCase() === 'yes' && leftValue.toLowerCase() === 'no') return 'right';
    return 'tie';
  }

  // For numeric values, higher is usually better except for price and charging time
  const lowerIsBetter = ['price', 'charging time', 'charge time'].some(term =>
    specName.toLowerCase().includes(term)
  );

  if (lowerIsBetter) {
    return leftNum < rightNum ? 'left' : rightNum < leftNum ? 'right' : 'tie';
  } else {
    return leftNum > rightNum ? 'left' : rightNum > leftNum ? 'right' : 'tie';
  }
}

// AI-POWERED: Intelligent conclusion based on comparison
async function generateAIConclusion(
  comparison: ComparisonItem[],
  left: ProductDetails,
  right: ProductDetails
): Promise<string> {
  console.log('🤖 AI generating conclusion...');

  if (!process.env.OPENAI_API_KEY) {
    console.log('ℹ️ No OpenAI key - using fallback conclusion');
    return generateFallbackConclusion(comparison, left, right);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Prepare comparison summary for AI
    const comparisonSummary = comparison.map(c =>
      `${c.metric}: ${left.name} has ${c.leftValue}, ${right.name} has ${c.rightValue}. Winner: ${c.winner}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a product comparison expert. Based on the comparison data, write a concise 2-3 sentence conclusion that:
1. Identifies which product is better overall (or if it's a tie)
2. Highlights the key deciding factors
3. Provides a clear recommendation

Be direct, factual, and helpful. Don't use marketing language.`
        },
        {
          role: 'user',
          content: `Compare these products:

LEFT: ${left.name} by ${left.brand}
Price: ${left.price}
Rating: ${left.rating.average}/5 (${left.rating.total} reviews)

RIGHT: ${right.name} by ${right.brand}
Price: ${right.price}
Rating: ${right.rating.average}/5 (${right.rating.total} reviews)

COMPARISON:
${comparisonSummary}

Write a conclusion:`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const conclusion = response.choices[0].message.content || generateFallbackConclusion(comparison, left, right);
    console.log('✅ AI conclusion generated');
    return conclusion;

  } catch (error) {
    console.error('⚠️ AI conclusion failed:', error);
    return generateFallbackConclusion(comparison, left, right);
  }
}

function generateFallbackConclusion(
  comparison: ComparisonItem[],
  left: ProductDetails,
  right: ProductDetails
): string {
  const leftWins = comparison.filter(c => c.winner === 'left').length;
  const rightWins = comparison.filter(c => c.winner === 'right').length;

  const priceDiff = Math.abs(
    parseFloat(left.price?.replace('$', '') || '0') -
    parseFloat(right.price?.replace('$', '') || '0')
  );

  const ratingDiff = Math.abs(left.rating.average - right.rating.average);

  if (leftWins > rightWins + 2) {
    return `${left.brand} ${left.name.split(' ')[0]} takes the lead with superior specifications and ${left.rating.average}/5 rating. It excels in ${leftWins} out of ${comparison.length} categories, making it the recommended choice for most users.`;
  } else if (rightWins > leftWins + 2) {
    return `${right.brand} ${right.name.split(' ')[0]} stands out with ${rightWins} category wins and a ${right.rating.average}/5 rating. Its performance advantages make it worth considering despite any price difference.`;
  } else if (ratingDiff > 0.3) {
    const winner = left.rating.average > right.rating.average ? left : right;
    return `Both products are closely matched in features, but ${winner.brand} edges ahead with a ${winner.rating.average}/5 rating from ${winner.rating.total.toLocaleString()} reviews. Customer satisfaction gives it the advantage.`;
  } else if (priceDiff > 20) {
    const cheaper = parseFloat(left.price?.replace('$', '') || '0') <
                     parseFloat(right.price?.replace('$', '') || '0') ? left : right;
    return `These products are remarkably similar in performance and ratings. ${cheaper.brand} offers better value at ${cheaper.price}, making it the smart choice for budget-conscious shoppers.`;
  } else {
    return `Both products are excellent choices with comparable features and ratings around ${left.rating.average}/5. Your decision can come down to brand preference, specific features you prioritize, or availability.`;
  }
}

function determineWinner(
  comparison: ComparisonItem[]
): 'left' | 'right' | 'tie' {
  const leftWins = comparison.filter(c => c.winner === 'left').length;
  const rightWins = comparison.filter(c => c.winner === 'right').length;

  if (leftWins > rightWins + 1) return 'left';
  if (rightWins > leftWins + 1) return 'right';
  return 'tie';
}
