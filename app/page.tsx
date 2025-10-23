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
    <main className="min-h-screen w-full overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect animate-slide-down backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text animate-fade-in">
            Comparos
          </h1>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
            <div className="w-2 h-2 rounded-full bg-secondary animate-glow-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-glow-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 relative z-10">
        {!isComparing ? (
          <div className="flex h-[calc(100vh-5rem)] w-full">
            {/* Left Panel */}
            <div className="w-1/2 border-r border-white/10 flex items-center justify-center p-8 animate-slide-right">
              <SearchPanel
                side="left"
                onProductConfirmed={setLeftProduct}
                product={leftProduct}
              />
            </div>

            {/* Animated Divider */}
            <div className="absolute left-1/2 top-20 bottom-0 w-px overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary via-secondary to-accent opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-30 animate-slide-down" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex items-center justify-center p-8 animate-slide-left">
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

        {/* Compare Button with extra animations */}
        {!isComparing && leftProduct && rightProduct && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-scale-bounce">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur opacity-75 group-hover:opacity-100 animate-glow-pulse" />

              <button
                onClick={handleCompare}
                className="relative px-10 py-5 bg-gradient-to-r from-primary via-secondary to-accent rounded-full text-white font-bold text-lg hover:scale-110 transition-all duration-300 shadow-2xl shadow-primary/50 animate-shimmer hover:shadow-primary/70"
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  ⚡ Compare Products
                  <span className="inline-block animate-bounce-subtle">→</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
