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

// AI-POWERED: Generate specs based on what the product ACTUALLY is - NO FALLBACKS
async function generateProductDetailsWithAI(product: Product): Promise<ProductDetails> {
  console.log('🤖 AI analyzing product:', product.name);

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured - cannot generate product details');
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Generate specs with AI
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a product specification expert. Given a product name, generate FACTUAL, SPECIFIC specifications for that EXACT product based on real specs.

For headphones: battery life, noise cancellation type, driver size, frequency response, bluetooth version, weight, codecs, etc.
For phones: display size, processor model, RAM amount, storage options, camera megapixels, battery mAh, 5G support, etc.
For laptops: processor model, RAM GB, storage GB, display size and resolution, battery life hours, weight lbs, graphics card, etc.

Also provide real review data from multiple sources (Amazon, Best Buy, Consumer Reports, etc.) with actual ratings and review counts.

Return JSON with:
{
  "specs": [{"name": "spec name", "value": "actual value", "importance": "high|medium|low"}],
  "reviews": [{"source": "store name", "rating": 4.5, "totalReviews": 1234}],
  "rating": {"average": 4.6, "total": 5678, "distribution": {"5": 3000, "4": 1500, "3": 800, "2": 300, "1": 78}}
}`
      },
      {
        role: 'user',
        content: `Generate FACTUAL specifications and real review data for: "${product.name}"\nBrand: ${product.brand}\nPrice: ${product.price}\n\nProvide accurate specs and realistic review data based on this product's actual market presence.`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  console.log(`✅ AI generated ${result.specs?.length || 0} specs for ${product.name}`);

  return {
    ...product,
    specs: result.specs || [],
    reviews: result.reviews || [],
    rating: result.rating || { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
  };
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

// AI-POWERED: Intelligent conclusion based on comparison - NO FALLBACKS
async function generateAIConclusion(
  comparison: ComparisonItem[],
  left: ProductDetails,
  right: ProductDetails
): Promise<string> {
  console.log('🤖 AI generating conclusion...');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured - cannot generate conclusion');
  }

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

  const conclusion = response.choices[0].message.content || 'Unable to generate conclusion.';
  console.log('✅ AI conclusion generated');
  return conclusion;
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
