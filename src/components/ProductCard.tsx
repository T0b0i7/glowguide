import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, Bookmark, Trash, Edit3, Check, GripVertical, GitCompare } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { useProducts, useSelection, useNotifications, useComparison, useApp } from '../context';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toggleFavorite, deleteProduct } = useProducts();
  const { isSelected, toggleSelect } = useSelection();
  const { favorite, error: notifyError } = useNotifications();
  const { comparisonIds, addToComparison, removeFromComparison } = useComparison();
  const selected = isSelected(product.id);
  const isInComparison = comparisonIds.includes(product.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(product.id);
      const action = product.is_favorite ? 'retiré des' : 'ajouté aux';
      favorite('Favoris', `${product.name} a été ${action} favoris`);
    } catch (err) {
      notifyError('Erreur favori', 'Impossible de modifier le statut favori');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer "${product.name}" ?`)) {
      try {
        await deleteProduct(product.id);
      } catch (err) {
        notifyError('Erreur suppression', 'Impossible de supprimer');
      }
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelect(product.id);
  };

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      id={`product-card-${product.id}`}
      className={`
        bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border
        ${selected
          ? 'border-beauty-accent ring-2 ring-beauty-accent/20 scale-[1.02]'
          : 'border-beauty-soft dark:border-gray-700'
        }
        group cursor-pointer relative
      `}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-4 left-4 z-20">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleSelect}
          className={`
            w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all
            ${selected
              ? 'bg-beauty-accent border-beauty-accent text-white'
              : 'bg-white/80 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-beauty-accent'
            }
          `}
        >
          {selected && <Check size={14} />}
        </motion.button>
      </div>

      {/* Drag handle icon */}
      <div className="absolute top-4 right-20 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="text-gray-400" size={20} />
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay actions */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`
              p-2 rounded-full backdrop-blur-md transition-all duration-300
              ${product.isFavorite
                ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
              }
            `}
            onClick={handleFavorite}
          >
            <Heart size={18} fill={product.isFavorite ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Add to comparison */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleComparison}
            className={`
              p-2 rounded-full backdrop-blur-md transition-all
              ${isInComparison
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                : 'bg-white/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
              }
            `}
            title={isInComparison ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
          >
            <GitCompare size={18} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full backdrop-blur-md text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors bg-white/80 dark:bg-gray-700"
            onClick={handleDelete}
          >
            <Trash size={18} />
          </motion.button>
        </div>

        {/* Learning badge */}
        {product.learningStatus === 'à-apprendre' && (
          <div className="absolute bottom-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <Bookmark size={12} fill="currentColor" />
            À apprendre
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-beauty-accent dark:text-pink-400 uppercase tracking-wider">{product.brand}</p>
            <h3 className="font-display text-xl font-bold text-gray-800 dark:text-white">{product.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] bg-beauty-base dark:bg-gray-100 text-gray-600 dark:text-gray-800 px-2 py-1 rounded-md uppercase font-medium border border-beauty-soft dark:border-gray-300">
              {product.category}
            </span>
            <span className="text-sm font-bold text-beauty-accent dark:text-pink-400">
              {product.price.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-6 h-10">
          {product.summary}
        </p>

        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-beauty-base dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-beauty-soft dark:hover:bg-gray-600 transition-colors group/btn"
          >
            Voir Détails
            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${product.id}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold border border-beauty-soft dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group/btn"
          >
            Modifier
            <Edit3 size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
