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
    <div className="space-y-6 animate-scale-in">
      <div className="glass-effect rounded-2xl p-6 space-y-4">
        {/* Product Image */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-white/5">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase">{product.brand}</span>
            <span className="text-xs text-gray-400">{product.source}</span>
          </div>
          <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
          {product.price && (
            <p className="text-2xl font-bold text-primary">{product.price}</p>
          )}
        </div>
      </div>

      {/* Confirmation Buttons */}
      {!confirmed && (
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover-glow transition-all"
          >
            ✓ This is correct
          </button>
          <button
            onClick={onDeny}
            className="w-full py-4 rounded-2xl glass-effect text-white font-semibold hover:bg-white/10 transition-all"
          >
            {attemptNumber >= 2 ? 'Enter link manually' : '✗ Try again'}
          </button>
        </div>
      )}

      {confirmed && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Locked In</span>
          </div>
        </div>
      )}
    </div>
  );
}
