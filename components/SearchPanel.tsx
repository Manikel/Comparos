'use client';

import { useState } from 'react';
import { FormEvent, useState } from 'react';
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
  const performSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearchResults(null);
    setIsSearching(true);

    try {
      // Check if it's a URL
      const isUrl = searchQuery.startsWith('http://') || searchQuery.startsWith('https://');
      const isUrl = trimmedQuery.startsWith('http://') || trimmedQuery.startsWith('https://');

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          isUrl
          query: trimmedQuery,
          isUrl,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search request failed:', response.status, errorText);
        return;
      }

      const data = await response.json();

      if (data.product) {
        setSearchResults(data.product);
        setSearchAttempt(prev => prev + 1);
        setSearchAttempt((prev) => prev + 1);
      } else if (data.error) {
        console.error('Search API error:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleDeny = () => {
    if (searchAttempt >= 2) {
      // Ask for direct link
      const link = prompt('Please enter the direct link to the product:');
      if (link) {
        setSearchQuery(link);
        handleSearch({ preventDefault: () => {} } as React.FormEvent);
        void performSearch(link);
      }
    } else {
      // Try searching again
      setSearchResults(null);
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
      void performSearch(searchQuery);
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
