import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export const ProductList: React.FC = () => {
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = products.filter(product => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) || 
                         product.brand.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'Tous' || product.category === category;
    return matchesQuery && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const masteredCount = products.filter(p => p.learning_status === 'maîtrisé').length;
  const learningCount = products.filter(p => p.learning_status === 'en-cours').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 font-medium">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-500 font-medium">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div id="product-list-page" className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-5xl font-bold text-gray-900 mb-2"
          >
            Catalogue Produits
          </motion.h1>
          <p className="text-gray-500 font-medium">Explorez et gérez votre base de connaissances cosmétiques.</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium border border-beauty-soft">
              {products.length} produits
            </span>
            <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium border border-beauty-soft text-beauty-accent">
              <TrendingUp size={14} className="inline mr-1" />
              {masteredCount} maîtrisés
            </span>
            <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium border border-beauty-soft text-orange-600">
              {learningCount} en apprentissage
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white border border-beauty-soft text-sm font-medium focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
          >
            <option value="name">Trier par: Nom</option>
            <option value="price-asc">Trier par: Prix ↑</option>
            <option value="price-desc">Trier par: Prix ↓</option>
          </select>
        </div>
      </header>

      <SearchBar onSearch={setQuery} onCategoryChange={setCategory} />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProductCard product={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                category: product.category,
                price: product.price,
                summary: product.summary || '',
                ingredients: product.ingredients || '',
                benefits: product.benefits || '',
                usage: product.usage || '',
                targetSkin: product.target_skin || '',
                contraindications: product.contraindications || '',
                keyPoints: product.key_points || [],
                notes: product.notes || '',
                isFavorite: product.is_favorite,
                learningStatus: product.learning_status,
                imageUrl: product.image_url
              }} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-beauty-soft">
          <p className="text-gray-400 font-medium italic">Aucun produit trouvé. Commencez par ajouter des produits!</p>
        </div>
      )}
    </div>
  );
};