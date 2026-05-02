import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input, Button, Chip } from '@heroui/react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onCategoryChange }) => {
  const categories = ['Tous', 'Crème', 'Sérum', 'Nettoyant', 'Tonique', 'Masque', 'Solaire', 'Huile'];

  return (
    <div id="search-container" className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          id="product-search"
          type="text" 
          placeholder="Rechercher un produit ou une marque..." 
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-beauty-soft rounded-[24px] focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all shadow-sm"
        />
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase()}`}
            onClick={() => onCategoryChange(cat)}
            className="whitespace-nowrap px-6 py-3 rounded-full bg-white border border-beauty-soft text-sm font-medium text-gray-600 hover:bg-beauty-soft hover:text-beauty-accent transition-all shadow-sm"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};