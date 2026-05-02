import React, { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { AdvancedFilterBar } from '../components/AdvancedFilterBar';
import { BulkActionBar } from '../components/BulkActionBar';
import { motion } from 'motion/react';
import { TrendingUp, Inbox, Search, Grid, List, ChevronDown, Loader2 } from 'lucide-react';
import { useProducts, useFilters } from '../context';

const ITEMS_PER_PAGE = 12;

export const ProductList: React.FC = () => {
  const { products, loading, error } = useProducts();
  const { filters } = useFilters();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search query
      const matchesQuery = !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search.toLowerCase());

      // Category
      const matchesCategory = filters.category === 'Tous' || product.category === filters.category;

      // Brand
      const matchesBrand = !filters.brand ||
        product.brand.toLowerCase().includes(filters.brand.toLowerCase());

      // Price range
      const matchesPrice = (filters.priceMin === null || product.price >= filters.priceMin) &&
        (filters.priceMax === null || product.price <= filters.priceMax);

      // Favorites only
      const matchesFavorite = !filters.favoritesOnly || product.isFavorite;

      // Learning status
      const matchesStatus = filters.learningStatus === 'Tous' ||
        product.learningStatus === filters.learningStatus;

      // Tags
      const matchesTags = filters.tags.length === 0 ||
        (product.tags && filters.tags.some(tagId => product.tags?.includes(tagId)));

      return matchesQuery && matchesCategory && matchesBrand && matchesPrice &&
             matchesFavorite && matchesStatus && matchesTags;
    }).sort((a, b) => {
      // Default sort by name
      return a.name.localeCompare(b.name);
    });
  }, [products, filters]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 300);
  };

  const masteredCount = products.filter(p => p.learningStatus === 'maîtrisé').length;
  const learningCount = products.filter(p => p.learningStatus === 'en-cours').length;
  const favoriteCount = products.filter(p => p.isFavorite).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beauty-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-beauty-text font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-600 text-red-400 font-bold text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-beauty-accent text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="product-list-page" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-5xl font-bold text-beauty-dark mb-2"
          >
            Catalogue Produits
          </motion.h1>
          <p className="text-beauty-text font-medium">
            Explorez et gérez votre base de connaissances cosmétiques.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold border border-beauty-sand shadow-sm">
              {products.length} produits
            </span>
            <span className="px-4 py-2 bg-emerald-50 bg-emerald-900/30 text-emerald-700 text-emerald-300 rounded-xl text-sm font-semibold border border-emerald-200 border-emerald-700 flex items-center gap-1">
              <TrendingUp size={14} />
              {masteredCount} maîtrisés
            </span>
            <span className="px-4 py-2 bg-orange-50 bg-orange-900/30 text-orange-700 text-orange-300 rounded-xl text-sm font-semibold border border-orange-200 border-orange-700">
              {learningCount} en apprentissage
            </span>
            {favoriteCount > 0 && (
              <span className="px-4 py-2 bg-pink-50 bg-pink-900/30 text-pink-700 text-pink-300 rounded-xl text-sm font-semibold border border-pink-200 border-pink-700 flex items-center gap-1">
                ❤️ {favoriteCount}
              </span>
            )}
          </div>
        </div>
        
        {/* View Mode & Sort */}
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-xl border border-beauty-sand p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-beauty-accent text-white' : 'text-beauty-text hover:text-beauty-accent'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-beauty-accent text-white' : 'text-beauty-text hover:text-beauty-accent'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <AdvancedFilterBar />

      {/* Products grid/list */}
      {filteredProducts.length > 0 ? (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
            : 'space-y-4'}>
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="text-center mt-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-4 bg-white text-beauty-text font-semibold rounded-2xl border border-beauty-sand hover:border-beauty-accent hover:text-beauty-accent transition-all flex items-center gap-2 mx-auto"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    Voir plus ({filteredProducts.length - visibleCount} restants)
                    <ChevronDown size={20} />
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Results count */}
          <div className="text-center mt-6 text-beauty-text/60 text-sm">
            Affichage de {displayedProducts.length} sur {filteredProducts.length} produits
          </div>

          {/* Bulk actions bar */}
          <BulkActionBar />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-beauty-sand"
        >
          <Inbox className="w-20 h-20 text-beauty-text/30 mx-auto mb-6" />
          <p className="text-beauty-text font-medium text-lg mb-2">
            Aucun produit trouvé
          </p>
          <p className="text-beauty-text/60 text-sm mb-6">
            Essayez d'ajuster vos filtres ou ajoutez un nouveau produit.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/add'}
            className="px-8 py-4 bg-beauty-accent text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            + Ajouter un produit
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
