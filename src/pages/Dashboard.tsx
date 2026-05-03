import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Package, Heart, Star } from 'lucide-react';
import { useProducts } from '../context';
import { useCatalogName } from '../components/SettingsModal';

export const Dashboard: React.FC = () => {
  const { products } = useProducts();
  const catalogName = useCatalogName();

  const stats = useMemo(() => {
    const total = products?.length || 0;
    const totalValue = products?.reduce((sum, p) => sum + p.price, 0) || 0;
    const favorites = products?.filter(p => p.isFavorite).length || 0;
    const mastered = products?.filter(p => p.learningStatus === 'maîtrisé').length || 0;

    return { total, totalValue, favorites, mastered };
  }, [products]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  const statusData = useMemo(() => {
    const counts = { 'maîtrisé': 0, 'en-cours': 0, 'à-apprendre': 0 };
    products.forEach(p => {
      const status = p.learningStatus || 'à-apprendre';
      counts[status as keyof typeof counts]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const brandData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products]);

  const COLORS = ['#C9A96E', '#B08D74', '#6B8E78', '#8b5cf6', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-beauty-dark mb-2">
          {catalogName}
        </h1>
        <p className="text-beauty-text font-medium mb-6 sm:mb-10 text-sm sm:text-base">
          Analyse et insights de votre catalogue
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Package size={24} />} label="Total Produits" value={stats.total} color="bg-beauty-accent/20 text-beauty-accent" />
          <StatCard icon={<TrendingUp size={24} />} label="Valeur Totale" value={`${stats.totalValue.toLocaleString()} Fcfa`} color="bg-beauty-success/20 text-beauty-success" />
          <StatCard icon={<Heart size={24} />} label="Favoris" value={stats.favorites} color="bg-pink-100 text-pink-600" />
          <StatCard icon={<Star size={24} />} label="Maîtrisés" value={stats.mastered} color="bg-emerald-100 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category distribution */}
          <div className="bg-white rounded-[32px] p-8 border border-beauty-sand shadow-lg">
            <h3 className="font-display text-2xl font-bold text-beauty-dark mb-6">
              Répartition par Catégorie
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis type="number" stroke="#5C524F" />
                  <YAxis dataKey="name" type="category" width={80} stroke="#5C524F" />
                  <Tooltip contentStyle={{ background: '#FDFBF8', border: '1px solid #E8E0D8', borderRadius: 12 }} />
                  <Bar dataKey="value" fill="#C9A96E" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-beauty-text/60">Aucune donnée</div>
            )}
          </div>

          {/* Learning status */}
          <div className="bg-white rounded-[32px] p-8 border border-beauty-sand shadow-lg">
            <h3 className="font-display text-2xl font-bold text-beauty-dark mb-6">
              Statut d'Apprentissage
            </h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#FDFBF8', border: '1px solid #E8E0D8', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-beauty-text/60">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Top Brands */}
        <div className="bg-white rounded-[32px] p-8 border border-beauty-sand shadow-lg">
          <h3 className="font-display text-2xl font-bold text-beauty-dark mb-6">
            Top Marques
          </h3>
          <div className="space-y-4">
            {brandData.map((brand, index) => (
              <div key={brand.name} className="flex items-center gap-4 p-4 rounded-xl bg-beauty-soft border border-beauty-sand hover:border-beauty-accent transition-colors">
                <span className="w-8 h-8 bg-beauty-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-beauty-dark">{brand.name}</p>
                </div>
                <p className="font-bold text-beauty-accent">{brand.value} produits</p>
              </div>
            ))}
            {brandData.length === 0 && (
              <div className="text-center py-8 text-beauty-text/60">Aucune donnée</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-[32px] p-6 border border-beauty-sand shadow-lg hover:shadow-xl transition-all"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-sm text-beauty-text font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-beauty-dark">{value}</p>
  </motion.div>
);