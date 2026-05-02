import React, { useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { AdvancedFilterBar } from '../components/AdvancedFilterBar';
import { BulkActionBar } from '../components/BulkActionBar';
import { motion } from 'motion/react';
import { TrendingUp, Inbox, Search } from 'lucide-react';
import { useProducts, useFilters } from '../context';

export const ProductList: React.FC = () => {
  const { products, loading, error } = useProducts();
  const { filters } = useFilters();

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
      const matchesFavorite = !filters.favoritesOnly || product.is_favorite;

      // Learning status
      const matchesStatus = filters.learningStatus === 'Tous' ||
        product.learning_status === filters.learningStatus;

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

  const masteredCount = products.filter(p => p.learning_status === 'maîtrisé').length;
  const learningCount = products.filter(p => p.learning_status === 'en-cours').length;
  const favoriteCount = products.filter(p => p.is_favorite).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beauty-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-bold text-lg">{error}</p>
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
            className="font-display text-5xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Catalogue Produits
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Explorez et gérez votre base de connaissances cosmétiques.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold border border-beauty-soft dark:border-gray-700 shadow-sm">
              {products.length} produits
            </span>
            <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
              <TrendingUp size={14} />
              {masteredCount} maîtrisés
            </span>
            <span className="px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-semibold border border-orange-200 dark:border-orange-700">
              {learningCount} en apprentissage
            </span>
            {favoriteCount > 0 && (
              <span className="px-4 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-xl text-sm font-semibold border border-pink-200 dark:border-pink-700 flex items-center gap-1">
                ❤️ {favoriteCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <AdvancedFilterBar />

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Bulk actions bar */}
          <BulkActionBar />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-[32px] border-2 border-dashed border-beauty-soft dark:border-gray-700"
        >
          <Inbox className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">
            Aucun produit trouvé
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
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
