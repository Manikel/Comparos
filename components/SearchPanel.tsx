'use client';

import React, { FormEvent, useState } from 'react';
import type { Product } from '@/types';
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
  const [errorMsg, setErrorMsg] = useState<string>('');

  const performSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setErrorMsg('');
    setSearchResults(null);

    try {
      const isUrl = /^https?:\/\//i.test(trimmed);
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, isUrl }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error('Search failed:', res.status, t);
        setErrorMsg('Could not find that product. Try a more specific name or paste a direct link.');
        return;
      }

      const data = await res.json();
      if (data?.product) {
        setSearchResults(data.product);
        setSearchAttempt(prev => prev + 1);
      } else {
        setErrorMsg('No product found. Try refining your query.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performSearch(searchQuery);
  };

  const handleConfirm = () => {
    if (searchResults) {
      onProductConfirmed(searchResults);
      setSearchResults(null);
      setSearchQuery('');
      setSearchAttempt(0);
    }
  };

  const handleDeny = async () => {
    if (searchAttempt >= 2) {
      const link = prompt('Please paste the direct product link:');
      if (link) {
        setSearchQuery(link);
        await performSearch(link);
      }
      return;
    }
    await performSearch(searchQuery);
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
              <span className="text-4xl">{side === 'left' ? '📱' : '🎧'}</span>
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {side === 'left' ? 'First Product' : 'Second Product'}
            </h2>
            <p className="text-gray-400 text-sm">Type a name or paste a link. Example: &ldquo;Sony WH-1000XM4&rdquo;</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or paste URL"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              disabled={isSearching || !searchQuery.trim()}
              className="w-full rounded-xl bg-primary/90 hover:bg-primary text-white py-3 font-semibold transition disabled:opacity-50"
            >
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </form>

          {errorMsg && <div className="text-sm text-red-400">{errorMsg}</div>}
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <ProductConfirmation product={searchResults} confirmed={false} />

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-green-600/90 hover:bg-green-600 text-white font-semibold"
            >
              ✓ This is correct
            </button>
            <button
              onClick={handleDeny}
              className="px-4 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-semibold"
            >
              ✗ Try again
            </button>
          </div>

          {errorMsg && <div className="text-sm text-red-400 text-center">{errorMsg}</div>}
        </div>
      )}
    </div>
  );
}