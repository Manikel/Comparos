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
        <div className="text-center space-y-6 animate-fade-in">
          {/* Animated loading spinner with glow */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ animation: 'spin-glow 1s linear infinite' }} />
            <div className="absolute inset-3 border-4 border-secondary/50 border-b-transparent rounded-full animate-spin-slower" />
          </div>

          {/* Animated text */}
          <div className="space-y-2">
            <p className="text-2xl font-bold gradient-text">Analyzing products</p>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>

          {/* Progress steps */}
          <div className="space-y-2 text-sm text-gray-400 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="animate-fade-in">⚡ Fetching product details...</p>
            <p className="animate-fade-in" style={{ animationDelay: '0.5s' }}>📊 Comparing specifications...</p>
            <p className="animate-fade-in" style={{ animationDelay: '1s' }}>⭐ Analyzing reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4 animate-scale-in">
          <span className="text-6xl animate-wiggle">❌</span>
          <p className="text-xl text-gray-400">Failed to load comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Product Headers */}
      <div className="grid grid-cols-2 gap-8 animate-fade-in">
        <div className="animate-slide-right">
          <ProductHeader product={comparison.leftProduct} />
        </div>
        <div className="animate-slide-left">
          <ProductHeader product={comparison.rightProduct} />
        </div>
      </div>

      {/* VS Badge */}
      <div className="flex justify-center -my-4 relative z-10 animate-scale-bounce" style={{ animationDelay: '0.2s' }}>
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur opacity-75 group-hover:opacity-100 animate-glow-pulse" />
          <div className="relative px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full">
            <span className="text-2xl font-bold text-white">VS</span>
          </div>
        </div>
      </div>

      {/* Comparison Metrics */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-bold gradient-text animate-fade-in-down">
            Detailed Comparison
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full animate-shimmer-slow" />
        </div>

        {comparison.comparison.map((item, index) => (
          <ComparisonRow key={index} item={item} index={index} />
        ))}
      </div>

      {/* Reviews Summary */}
      <div className="grid grid-cols-2 gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="animate-slide-right" style={{ animationDelay: `${0.7}s` }}>
          <ReviewsSummary reviews={comparison.leftProduct.reviews} rating={comparison.leftProduct.rating} />
        </div>
        <div className="animate-slide-left" style={{ animationDelay: `${0.7}s` }}>
          <ReviewsSummary reviews={comparison.rightProduct.reviews} rating={comparison.rightProduct.rating} />
        </div>
      </div>

      {/* Conclusion */}
      <div className="mt-16 mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6 glass-effect rounded-3xl p-12 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Trophy icon */}
          <div className="inline-block text-6xl animate-bounce-slow">🏆</div>

          <h2 className="text-4xl font-bold gradient-text relative z-10">
            Conclusion
          </h2>

          <p className="text-2xl leading-relaxed text-gray-200 relative z-10 animate-fade-in" style={{ animationDelay: '1s' }}>
            {comparison.conclusion}
          </p>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 text-2xl animate-float opacity-50">✨</div>
          <div className="absolute top-4 right-4 text-2xl animate-float opacity-50" style={{ animationDelay: '1s' }}>✨</div>
          <div className="absolute bottom-4 left-8 text-2xl animate-float opacity-50" style={{ animationDelay: '2s' }}>⭐</div>
          <div className="absolute bottom-4 right-8 text-2xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>⭐</div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center pb-12 animate-scale-bounce" style={{ animationDelay: '1s' }}>
        <div className="relative inline-block group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur opacity-75 group-hover:opacity-100 animate-glow-pulse" />

          <button
            onClick={onReset}
            className="relative px-12 py-5 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white text-lg font-bold hover:scale-110 transition-all duration-300 shadow-2xl shadow-primary/50"
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient 3s ease infinite',
            }}
          >
            <span className="flex items-center gap-2">
              🔄 Compare Different Items
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="glass-effect rounded-2xl p-6 space-y-4 hover:scale-105 transition-all duration-500 group relative overflow-hidden">
      {/* Hover glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />

      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="relative z-10 space-y-2">
        <p className="text-sm text-gray-400 uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 inline-block">
          {product.brand}
        </p>
        <h3 className="text-xl font-bold mt-1 leading-tight">{product.name}</h3>
        {product.price && (
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {product.price}
          </p>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({ item, index }: { item: ComparisonItem; index: number }) {
  return (
    <div
      className="glass-effect rounded-xl p-6 hover:scale-105 transition-all duration-300 group animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Background highlight for winner */}
      {item.winner && item.winner !== 'tie' && (
        <div className={`absolute inset-0 bg-gradient-to-r ${
          item.winner === 'left' ? 'from-primary/10 to-transparent' : 'from-transparent to-primary/10'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center relative z-10">
        {/* Left Value */}
        <div className={`text-right transition-all duration-300 ${
          item.winner === 'left' ? 'text-primary font-bold scale-110' : 'text-gray-300'
        }`}>
          <p className="text-lg">{item.leftValue}</p>
          {item.winner === 'left' && (
            <span className="inline-block text-xs animate-bounce-subtle">✨</span>
          )}
        </div>

        {/* Metric Name */}
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {item.metric}
          </p>
          {item.winner && item.winner !== 'tie' && (
            <div className={`text-3xl animate-slide-${item.winner === 'left' ? 'right' : 'left'}`}>
              {item.winner === 'left' ? '←' : '→'}
            </div>
          )}
          {item.winner === 'tie' && (
            <div className="text-2xl animate-scale-pulse">⚖️</div>
          )}
        </div>

        {/* Right Value */}
        <div className={`text-left transition-all duration-300 ${
          item.winner === 'right' ? 'text-primary font-bold scale-110' : 'text-gray-300'
        }`}>
          <p className="text-lg">{item.leftValue}</p>
          {item.winner === 'right' && (
            <span className="inline-block text-xs animate-bounce-subtle">✨</span>
          )}
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-gray-500 mt-3 text-center relative z-10 animate-fade-in" style={{ animationDelay: `${index * 0.05 + 0.2}s` }}>
          {item.description}
        </p>
      )}
    </div>
  );
}

function ReviewsSummary({ reviews, rating }: { reviews: any[]; rating: any }) {
  return (
    <div className="glass-effect rounded-xl p-6 space-y-4 hover:scale-105 transition-all duration-500 group">
      <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Reviews & Ratings
      </h3>

      <div className="space-y-3">
        <div className="flex items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-scale-in">
              {rating.average.toFixed(1)}
            </div>
            {/* Star decorations */}
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce-slow">⭐</div>
          </div>

          <div className="text-sm text-gray-400">
            <p>out of 5.0</p>
            <p className="font-semibold text-white">{rating.total.toLocaleString()} reviews</p>
          </div>
        </div>

        {/* Rating bars */}
        <div className="space-y-2">
          {reviews.map((review, idx) => (
            <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                  {review.source}
                </span>
                <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {review.rating} ⭐
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 animate-shimmer"
                  style={{
                    width: `${(review.rating / 5) * 100}%`,
                    animationDelay: `${idx * 0.2}s`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {review.totalReviews.toLocaleString()} reviews
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
