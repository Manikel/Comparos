import { NextRequest, NextResponse } from 'next/server';
import { Product, ProductDetails, ComparisonResult, ComparisonItem } from '@/types';

// This is a mock implementation. In production, you would:
// 1. Scrape product pages for detailed specs
// 2. Use AI (GPT-4, Claude) to extract and compare specifications
// 3. Aggregate reviews from multiple platforms
// 4. Perform intelligent analysis

export async function POST(request: NextRequest) {
  try {
    const { leftProduct, rightProduct } = await request.json();

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate mock detailed products
    const leftDetails = await generateProductDetails(leftProduct);
    const rightDetails = await generateProductDetails(rightProduct);

    // Generate comparison
    const comparison = generateComparison(leftDetails, rightDetails);

    // Generate conclusion
    const conclusion = generateConclusion(comparison, leftDetails, rightDetails);

    const result: ComparisonResult = {
      leftProduct: leftDetails,
      rightProduct: rightDetails,
      comparison,
      conclusion,
      winner: determineWinner(comparison),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare products' },
      { status: 500 }
    );
  }
}

async function generateProductDetails(product: Product): Promise<ProductDetails> {
  // Mock specs generation
  const specs = [
    {
      name: 'Battery Life',
      value: `${Math.floor(Math.random() * 14 + 7)} days`,
      importance: 'high' as const,
    },
    {
      name: 'Brush Modes',
      value: `${Math.floor(Math.random() * 5 + 1)} modes`,
      importance: 'high' as const,
    },
    {
      name: 'Pressure Sensor',
      value: Math.random() > 0.5 ? 'Yes' : 'No',
      importance: 'medium' as const,
    },
    {
      name: 'Smart Timer',
      value: Math.random() > 0.3 ? '2-minute timer' : 'No timer',
      importance: 'medium' as const,
    },
    {
      name: 'Waterproof',
      value: Math.random() > 0.2 ? 'IPX7' : 'IPX5',
      importance: 'high' as const,
    },
    {
      name: 'Warranty',
      value: `${Math.floor(Math.random() * 2 + 1)} years`,
      importance: 'low' as const,
    },
    {
      name: 'Charging Time',
      value: `${Math.floor(Math.random() * 12 + 12)} hours`,
      importance: 'medium' as const,
    },
  ];

  // Mock reviews
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

function generateConclusion(
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
    return `${left.brand} ${left.name.split('-')[0]} takes the lead with superior specifications and ${left.rating.average}/5 rating. It excels in ${leftWins} out of ${comparison.length} categories, making it the recommended choice for most users.`;
  } else if (rightWins > leftWins + 2) {
    return `${right.brand} ${right.name.split('-')[0]} stands out with ${rightWins} category wins and a ${right.rating.average}/5 rating. Its performance advantages make it worth considering despite any price difference.`;
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
