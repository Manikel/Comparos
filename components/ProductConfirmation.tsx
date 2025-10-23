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
  return (
    <div className="space-y-6 animate-scale-bounce">
      <div className="glass-effect rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform duration-300 group">
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />

        {/* Product Image */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10 animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2 relative z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 animate-fade-in">
              {product.brand}
            </span>
            <span className="text-xs px-3 py-1 rounded-full glass-effect text-secondary animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {product.source}
            </span>
          </div>
          <h3 className="text-lg font-semibold leading-tight animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {product.name}
          </h3>
          {product.price && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-scale-in" style={{ animationDelay: '0.4s' }}>
                  {product.price}
                </p>
                <span className="text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                  + tax
                </span>
              </div>
              {product.cheapestStore && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <span>💰</span>
                  <span>Cheapest at {product.cheapestStore}</span>
                </div>
              )}
              {product.storePrices && product.storePrices.length > 1 && (
                <div className="mt-2 space-y-1 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                  <p className="text-xs text-gray-400">Also available at:</p>
                  {product.storePrices.slice(1, 4).map((store, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className={store.inStock ? 'text-gray-300' : 'text-gray-600'}>
                        {store.store} {!store.inStock && '(Out of Stock)'}
                      </span>
                      <span className={store.inStock ? 'text-secondary font-semibold' : 'text-gray-600'}>
                        ${store.price.toFixed(2)}
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
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-effect animate-shimmer opacity-0 group-hover:opacity-100" />

            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-2xl animate-bounce-subtle">✓</span>
              This is correct
            </span>
          </button>
          <button
            onClick={onDeny}
            className="w-full py-4 rounded-2xl glass-effect text-white font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              {attemptNumber >= 2 ? (
                <>
                  🔗 Enter link manually
                </>
              ) : (
                <>
                  <span className="inline-block animate-wiggle">✗</span>
                  Try again
                </>
              )}
            </span>
          </button>
        </div>
      )}

      {confirmed && (
        <div className="text-center animate-scale-bounce">
          <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/20 text-primary overflow-hidden group">
            {/* Pulsing background */}
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-scale-pulse" />

            <span className="relative z-10 text-2xl animate-scale-pulse">✓</span>
            <span className="relative z-10 font-bold text-lg">Locked In</span>

            {/* Sparkles */}
            <span className="absolute -top-1 -right-1 text-xs animate-bounce-slow">✨</span>
            <span className="absolute -bottom-1 -left-1 text-xs animate-bounce-slow" style={{ animationDelay: '0.5s' }}>✨</span>
          </div>
        </div>
      )}
    </div>
  );
}
