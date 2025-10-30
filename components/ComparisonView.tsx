'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product, ComparisonResult, ComparisonItem } from '@/types';

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
        const res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // prefer {productA, productB}; adapt as needed if your route expects different keys
          body: JSON.stringify({ productA: leftProduct, productB: rightProduct }),
        });

        if (!res.ok) throw new Error(`Compare failed: ${res.status}`);
        const raw = await res.json();

        // ---- Normalization layer ----
        // Supports both legacy shape { rows, verdict } and new shape { comparison, conclusion }
        const normalized: ComparisonResult = normalizeComparisonResponse(raw, leftProduct, rightProduct);
        setComparison(normalized);
      } catch (error) {
        console.error('Comparison error:', error);
        setComparison(null);
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
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-3 border-4 border-secondary/50 border-b-transparent rounded-full animate-spin" style={{ animationDuration: '1.8s' }} />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold gradient-text">Analyzing products</p>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <p>⚡ Fetching product details...</p>
            <p>📊 Comparing specifications...</p>
            <p>⭐ Summarizing results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center space-y-4 animate-scale-in">
          <span className="text-6xl">❌</span>
          <p className="text-xl text-gray-400">Failed to load comparison</p>
          <button onClick={onReset} className="mt-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Product Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
        <div>
          <ProductHeader product={comparison.leftProduct} />
        </div>
        <div>
          <ProductHeader product={comparison.rightProduct} />
        </div>
      </div>

      {/* VS Badge */}
      <div className="flex justify-center -my-4 relative z-10">
        <div className="relative">
          <div className="relative px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full">
            <span className="text-2xl font-bold text-white">VS</span>
          </div>
        </div>
      </div>

      {/* Comparison Metrics */}
      <div className="space-y-4">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-bold gradient-text">Detailed Comparison</h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
        </div>

        {comparison.comparison.map((item, index) => (
          <ComparisonRow key={index} item={item} index={index} />
        ))}
      </div>

      {/* Conclusion */}
      <div className="mt-16 mb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6 glass-effect rounded-3xl p-12 relative overflow-hidden">
          <div className="inline-block text-6xl">🏆</div>
          <h2 className="text-4xl font-bold gradient-text">Conclusion</h2>
          <p className="text-2xl leading-relaxed text-gray-200">
            {comparison.conclusion || 'Both have strengths; choose based on the categories above.'}
          </p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center pb-12">
        <button
          onClick={onReset}
          className="relative px-12 py-5 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white text-lg font-bold hover:scale-105 transition-all"
        >
          🔄 Compare Different Items
        </button>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function normalizeComparisonResponse(
  raw: any,
  left: Product,
  right: Product
): ComparisonResult {
  // If already in desired shape
  if (raw && Array.isArray(raw.comparison)) {
    return {
      leftProduct: raw.leftProduct || left,
      rightProduct: raw.rightProduct || right,
      comparison: raw.comparison as ComparisonItem[],
      conclusion: raw.conclusion || raw.verdict || '',
    };
  }

  // Legacy shape: { rows: [{category, A, B, winner, notes}], verdict: string }
  if (raw && Array.isArray(raw.rows)) {
    const mapped: ComparisonItem[] = raw.rows.map((r: any) => ({
      metric: r.category ?? '—',
      leftValue: r.A ?? '—',
      rightValue: r.B ?? '—',
      winner:
        r.winner === 'A' ? 'left' : r.winner === 'B' ? 'right' : 'tie',
      description: r.notes,
    }));

    return {
      leftProduct: left,
      rightProduct: right,
      comparison: mapped,
      conclusion: raw.verdict || '',
    };
  }

  // Fallback — empty result to avoid crashes
  return {
    leftProduct: left,
    rightProduct: right,
    comparison: [],
    conclusion: '',
  };
}

function ProductHeader({ product }: { product: Product }) {
  // Guaranteed string for next/image
  const src: string =
    product.image ||
    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  return (
    <div className="glass-effect rounded-2xl p-6 space-y-4 relative overflow-hidden">
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        <Image
          src={src}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="relative z-10 space-y-2">
        {product.brand && (
          <p className="text-sm text-gray-400 uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 inline-block">
            {product.brand}
          </p>
        )}
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
      className="glass-effect rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* background highlight for winner */}
      {item.winner && item.winner !== 'tie' && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            item.winner === 'left'
              ? 'bg-gradient-to-r from-primary/10 to-transparent'
              : 'bg-gradient-to-l from-primary/10 to-transparent'
          }`}
        />
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center relative z-10">
        {/* Left Value */}
        <div
          className={`text-right ${
            item.winner === 'left' ? 'text-primary font-semibold' : 'text-gray-300'
          }`}
        >
          <p className="text-lg">{item.leftValue ?? '—'}</p>
        </div>

        {/* Metric */}
        <div className="text-center min-w-[200px]">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {item.metric}
          </p>
          {item.winner === 'left' && <div className="text-2xl">←</div>}
          {item.winner === 'right' && <div className="text-2xl">→</div>}
          {item.winner === 'tie' && <div className="text-2xl">⚖️</div>}
        </div>

        {/* Right Value */}
        <div
          className={`text-left ${
            item.winner === 'right' ? 'text-primary font-semibold' : 'text-gray-300'
          }`}
        >
          <p className="text-lg">{item.rightValue ?? '—'}</p>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-gray-500 mt-3 text-center">{item.description}</p>
      )}
    </div>
  );
}