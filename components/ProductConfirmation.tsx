'use client';

import Image from 'next/image';
import { Product } from '@/types';

interface ProductConfirmationProps {
  product: Product;
  confirmed: boolean;
  onConfirm?: () => void;
  onDeny?: () => void;
  attemptNumber?: number;
}

export default function ProductConfirmation({
  product,
  confirmed,
  onConfirm,
  onDeny,
  attemptNumber = 1,
}: ProductConfirmationProps) {
  // Always give next/image a definite string to prevent TS/runtime errors.
  const fallbackSrc =
    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // 1x1
  const imgSrc =
    typeof product.image === 'string' && product.image.trim()
      ? product.image
      : fallbackSrc;

  // normalize store prices to avoid .toFixed on undefined
  const otherStores = Array.isArray(product.storePrices)
    ? product.storePrices.slice(1, 4)
    : [];

  const brand = product.brand || '';
  const source = product.source || '';

  return (
    <div className="space-y-6 animate-scale-bounce">
      <div className="relative glass-effect rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform duration-300 group overflow-hidden">
        {/* Glow effect on hover */}
        <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />

        {/* Product Image */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Image
            src={imgSrc}
            alt={product.name || 'Product image'}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2 relative z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 animate-fade-in">
              {brand || ' '}
            </span>
            <span className="text-xs px-3 py-1 rounded-full glass-effect text-secondary animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {source || ' '}
            </span>
          </div>

          <h3 className="text-lg font-semibold leading-tight animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {product.name}
          </h3>

          {product.price && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p
                  className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-scale-in"
                  style={{ animationDelay: '0.4s' }}
                >
                  {product.price}
                </p>
                <span className="text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  + tax
                </span>
              </div>

              {product.cheapestStore && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold animate-fade-in"
                  style={{ animationDelay: '0.6s' }}
                >
                  <span>💰</span>
                  <span>Cheapest at {product.cheapestStore}</span>
                </div>
              )}

              {otherStores.length > 0 && (
                <div className="mt-2 space-y-1 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                  <p className="text-xs text-gray-400">Also available at:</p>
                  {otherStores.map((store, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className={store.inStock ? 'text-gray-300' : 'text-gray-600'}>
                        {store.store} {!store.inStock && '(Out of Stock)'}
                      </span>
                      <span className={store.inStock ? 'text-secondary font-semibold' : 'text-gray-600'}>
                        {typeof store.price === 'number' ? `$${store.price.toFixed(2)}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Buttons */}
      {!confirmed && (
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={onConfirm}
            className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40"
          >
            <div className="absolute inset-0 shimmer-effect animate-shimmer opacity-0 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              This is correct
            </span>
          </button>
          <button
            onClick={onDeny}
            className="w-full py-4 rounded-2xl glass-effect text-white font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              {attemptNumber >= 2 ? '🔗 Enter link manually' : (<><span className="inline-block">✗</span>Try again</>)}
            </span>
          </button>
        </div>
      )}

      {confirmed && (
        <div className="text-center">
          <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 text-primary overflow-hidden">
            <span className="relative z-10 text-2xl">✓</span>
            <span className="relative z-10 font-bold text-lg">Locked In</span>
          </div>
        </div>
      )}
    </div>
  );
}
