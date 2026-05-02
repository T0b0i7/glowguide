import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Star, BookOpen, TrendingUp, Award } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const stats = {
    totalProducts: products.length,
    mastered: products.filter(p => p.learning_status === 'maîtrisé').length,
    learning: products.filter(p => p.learning_status === 'en-cours').length,
    toLearn: products.filter(p => p.learning_status === 'à-apprendre').length,
    favorites: products.filter(p => p.is_favorite).length,
    categories: [...new Set(products.map(p => p.category))].length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-gray-500 hover:text-beauty-accent font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Retour
      </button>

      <header className="mb-10">
        <h1 className="font-display text-5xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
        <p className="text-gray-500 font-medium">Vue d'ensemble de votre base de connaissances.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard 
          icon={<BookOpen className="text-beauty-accent" size={32} />}
          title="Total Produits"
          value={stats.totalProducts}
          bgColor="bg-beauty-soft"
          textColor="text-beauty-accent"
        />
        <StatCard 
          icon={<Award className="text-green-600" size={32} />}
          title="Maîtrisés"
          value={stats.mastered}
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard 
          icon={<TrendingUp className="text-orange-600" size={32} />}
          title="En Apprentissage"
          value={stats.learning}
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
        <StatCard 
          icon={<Star className="text-yellow-600" size={32} />}
          title="Favoris"
          value={stats.favorites}
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
        <StatCard 
          icon={<BarChart3 className="text-blue-600" size={32} />}
          title="Catégories"
          value={stats.categories}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard 
          icon={<BookOpen className="text-purple-600" size={32} />}
          title="À Apprendre"
          value={stats.toLearn}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-[32px] border border-beauty-soft p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold mb-6">Répartition par Catégorie</h2>
        <div className="space-y-4">
          {[...new Set(products.map(p => p.category))].map(category => {
            const count = products.filter(p => p.category === category).length;
            return (
              <div key={category} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-gray-600">{category}</span>
                <div className="flex-1 h-3 bg-beauty-soft rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.totalProducts) * 100}%` }}
                    className="h-full bg-beauty-accent rounded-full"
                  />
                </div>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; bgColor: string; textColor: string }> = ({ 
  icon, title, value, bgColor, textColor 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-[24px] border border-beauty-soft p-6 shadow-sm"
  >
    <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
  </motion.div>
);