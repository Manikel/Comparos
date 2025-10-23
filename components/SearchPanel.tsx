'use client';

import { useState } from 'react';
import { Product } from '@/types';
import ProductConfirmation from './ProductConfirmation';

interface SearchPanelProps {
  side: 'left' | 'right';
  onProductConfirmed: (product: Product) => void;
  product: Product | null;
}

export default function SearchPanel({ side, onProductConfirmed, product }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product | null>(null);
  const [searchAttempt, setSearchAttempt] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Check if it's a URL
      const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          isUrl
        }),
      });

      const data = await response.json();

      if (data.product) {
        setSearchResults(data.product);
        setSearchAttempt(prev => prev + 1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (searchResults) {
      onProductConfirmed(searchResults);
      setSearchResults(null);
      setSearchQuery('');
      setSearchAttempt(0);
    }
  };

  const handleDeny = () => {
    if (searchAttempt >= 2) {
      // Ask for direct link
      const link = prompt('Please enter the direct link to the product:');
      if (link) {
        setSearchQuery(link);
        handleSearch({ preventDefault: () => {} } as React.FormEvent);
      }
    } else {
      // Try searching again
      setSearchResults(null);
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  if (product) {
    return (
      <div className="animate-scale-in">
        <ProductConfirmation product={product} confirmed={true} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {!searchResults ? (
        <div className="space-y-6">
          <div className="text-center space-y-3 animate-fade-in-up">
            <div className="inline-block p-3 rounded-2xl glass-effect animate-scale-bounce">
              <span className="text-4xl animate-float">
                {side === 'left' ? '📱' : '🎧'}
              </span>
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {side === 'left' ? 'First Product' : 'Second Product'}
            </h2>
            <p className="text-gray-400 text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Enter name, brand, or paste product link
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              {/* Glow border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-500" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Oral-B Electric Toothbrush..."
                className="relative w-full px-6 py-4 rounded-2xl glass-effect text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:scale-105 transition-all duration-300"
                disabled={isSearching}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" style={{ animation: 'spin-glow 1s linear infinite' }} />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer-effect animate-shimmer opacity-0 group-hover:opacity-100" />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSearching ? (
                  <>
                    <span className="inline-block animate-spin">⚡</span>
                    Searching...
                  </>
                ) : (
                  <>
                    🔍 Search Product
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full glass-effect animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
                Amazon
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full glass-effect animate-pulse" style={{ animationDelay: '0.2s' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-glow-pulse" />
                BestBuy
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full glass-effect animate-pulse" style={{ animationDelay: '0.4s' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-glow-pulse" />
                Official Stores
              </span>
            </div>
          </div>
        </div>
      ) : (
        <ProductConfirmation
          product={searchResults}
          confirmed={false}
          onConfirm={handleConfirm}
          onDeny={handleDeny}
          attemptNumber={searchAttempt}
        />
      )}
    </div>
  );
}
