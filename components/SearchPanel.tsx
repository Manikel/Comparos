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
      <div className="animate-fade-in">
        <ProductConfirmation product={product} confirmed={true} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      {!searchResults ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              {side === 'left' ? 'First Product' : 'Second Product'}
            </h2>
            <p className="text-gray-400 text-sm">
              Enter name, brand, or paste product link
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Oral-B Electric Toothbrush..."
                className="w-full px-6 py-4 rounded-2xl glass-effect text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={isSearching}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSearching ? 'Searching...' : 'Search Product'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500">
            <p>Searching across Amazon, BestBuy, and official stores</p>
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
