'use client';

import { useState } from 'react';
import SearchPanel from '@/components/SearchPanel';
import ComparisonView from '@/components/ComparisonView';
import { Product } from '@/types';

export default function Home() {
  const [leftProduct, setLeftProduct] = useState<Product | null>(null);
  const [rightProduct, setRightProduct] = useState<Product | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleReset = () => {
    setLeftProduct(null);
    setRightProduct(null);
    setIsComparing(false);
  };

  const handleCompare = () => {
    if (leftProduct && rightProduct) {
      setIsComparing(true);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Comparos
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20">
        {!isComparing ? (
          <div className="flex h-[calc(100vh-5rem)] w-full">
            {/* Left Panel */}
            <div className="w-1/2 border-r border-white/10 flex items-center justify-center p-8">
              <SearchPanel
                side="left"
                onProductConfirmed={setLeftProduct}
                product={leftProduct}
              />
            </div>

            {/* Divider */}
            <div className="absolute left-1/2 top-20 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent opacity-50" />

            {/* Right Panel */}
            <div className="w-1/2 flex items-center justify-center p-8">
              <SearchPanel
                side="right"
                onProductConfirmed={setRightProduct}
                product={rightProduct}
              />
            </div>
          </div>
        ) : (
          <ComparisonView
            leftProduct={leftProduct!}
            rightProduct={rightProduct!}
            onReset={handleReset}
          />
        )}

        {/* Compare Button */}
        {!isComparing && leftProduct && rightProduct && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
            <button
              onClick={handleCompare}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-white font-semibold text-lg hover-glow hover:scale-105 transition-transform"
            >
              Compare Products
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
