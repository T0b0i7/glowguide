import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, Bookmark, Trash, Edit3 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { useProducts } from '../context/ProductContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toggleFavorite, deleteProduct } = useProducts();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      id={`product-card-${product.id}`}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-beauty-soft group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
<div className="absolute top-4 right-4 flex gap-2">
  <button 
    id={`fav-btn-${product.id}`}
    className={`p-2 rounded-full backdrop-blur-md transition-colors ${product.isFavorite ? 'bg-beauty-soft text-beauty-accent' : 'bg-white/70 text-gray-400 hover:text-beauty-accent'}`}
    onClick={(e) => { 
      e.stopPropagation();
      toggleFavorite(product.id);
    }}
  >
    <Heart size={18} fill={product.isFavorite ? 'currentColor' : 'none'} />
  </button>
  <button 
    id={`delete-btn-${product.id}`}
    className="p-2 rounded-full backdrop-blur-md text-gray-400 hover:text-red-500 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        deleteProduct(product.id);
      }
    }}
  >
    <Trash size={18} />
  </button>
</div>
        {product.learningStatus === 'à-apprendre' && (
          <div className="absolute bottom-4 left-4 bg-beauty-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Bookmark size={12} fill="currentColor" />
            À apprendre
          </div>
        )}
      </div>
      
<div className="p-6">
  <div className="flex justify-between items-start mb-2">
    <div>
      <p className="text-xs font-semibold text-beauty-accent uppercase tracking-wider">{product.brand}</p>
      <h3 className="font-display text-xl font-bold text-gray-800">{product.name}</h3>
    </div>
    <div className="flex flex-col items-end gap-1">
      <span className="text-[10px] bg-beauty-base text-gray-500 px-2 py-1 rounded-md uppercase font-medium border border-beauty-soft">
        {product.category}
      </span>
      <span className="text-sm font-bold text-beauty-accent">
        {product.price.toLocaleString()} FCFA
      </span>
    </div>
  </div>
  
  <p className="text-sm text-gray-600 line-clamp-2 mb-6 h-10">
    {product.summary}
  </p>
  
  <div className="flex items-center justify-between">
    <button 
      id={`view-details-${product.id}`}
      onClick={() => navigate(`/product/${product.id}`)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-beauty-base text-gray-700 font-semibold hover:bg-beauty-soft hover:text-beauty-accent transition-colors group/btn"
    >
      Voir Détails
      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
    </button>
    <button 
      id={`edit-btn-${product.id}`}
      onClick={() => navigate(`/edit/${product.id}`)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-gray-600 font-semibold border border-beauty-soft hover:bg-gray-50 transition-colors group/btn"
    >
      Modifier
      <Edit3 size={16} className="group-hover/btn:translate-x-1 transition-transform" />
    </button>
  </div>
</div>
    </motion.div>
  );
};