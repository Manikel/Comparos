'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Product, ComparisonResult, ComparisonItem } from '@/types';

interface ComparisonViewProps {
  leftProduct: Product;
  rightProduct: Product;
  onReset: () => void;
}

export default function ComparisonView({ leftProduct, rightProduct, onReset }: ComparisonViewProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leftProduct, rightProduct }),
        });

        const data = await response.json();
        setComparison(data);
      } catch (error) {
        console.error('Comparison error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparison();
  }, [leftProduct, rightProduct]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xl text-gray-400">Analyzing products...</p>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <p className="text-xl text-gray-400">Failed to load comparison</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Product Headers */}
      <div className="grid grid-cols-2 gap-8">
        <ProductHeader product={comparison.leftProduct} />
        <ProductHeader product={comparison.rightProduct} />
      </div>

      {/* Comparison Metrics */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-8">Detailed Comparison</h2>
        {comparison.comparison.map((item, index) => (
          <ComparisonRow key={index} item={item} index={index} />
        ))}
      </div>

      {/* Reviews Summary */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        <ReviewsSummary reviews={comparison.leftProduct.reviews} rating={comparison.leftProduct.rating} />
        <ReviewsSummary reviews={comparison.rightProduct.reviews} rating={comparison.rightProduct.rating} />
      </div>

      {/* Conclusion */}
      <div className="mt-16 mb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6 glass-effect rounded-3xl p-12 animate-slide-up">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Conclusion
          </h2>
          <p className="text-2xl leading-relaxed text-gray-200">
            {comparison.conclusion}
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center pb-12">
        <button
          onClick={onReset}
          className="px-12 py-5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold hover-glow hover:scale-105 transition-all"
        >
          Compare Different Items
        </button>
      </div>
    </div>
  );
}

function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="glass-effect rounded-2xl p-6 space-y-4">
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/5">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain"
        />
      </div>
      <div>
        <p className="text-sm text-gray-400 uppercase">{product.brand}</p>
        <h3 className="text-xl font-bold mt-1">{product.name}</h3>
        {product.price && (
          <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({ item, index }: { item: ComparisonItem; index: number }) {
  return (
    <div
      className="glass-effect rounded-xl p-6 hover-glow animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Left Value */}
        <div className={`text-right ${item.winner === 'left' ? 'text-primary font-bold' : 'text-gray-300'}`}>
          <p className="text-lg">{item.leftValue}</p>
        </div>

        {/* Metric Name */}
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {item.metric}
          </p>
          {item.winner && item.winner !== 'tie' && (
            <div className={`mt-2 text-2xl ${item.winner === 'left' ? 'text-left' : 'text-right'}`}>
              {item.winner === 'left' ? '←' : '→'}
            </div>
          )}
        </div>

        {/* Right Value */}
        <div className={`text-left ${item.winner === 'right' ? 'text-primary font-bold' : 'text-gray-300'}`}>
          <p className="text-lg">{item.rightValue}</p>
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-gray-500 mt-3 text-center">{item.description}</p>
      )}
    </div>
  );
}

function ReviewsSummary({ reviews, rating }: { reviews: any[]; rating: any }) {
  return (
    <div className="glass-effect rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-4xl font-bold text-primary">{rating.average.toFixed(1)}</div>
          <div className="text-sm text-gray-400">
            <p>out of 5.0</p>
            <p>{rating.total.toLocaleString()} reviews</p>
          </div>
        </div>
        <div className="space-y-1">
          {reviews.map((review, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-400">{review.source}</span>
              <span className="text-primary font-semibold">
                {review.rating} ({review.totalReviews})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
