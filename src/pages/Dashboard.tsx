import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, Package, Heart, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useProducts } from '../context';
import { categories, learningStatuses, brands } from '../data/categories';

export const Dashboard: React.FC = () => {
  const { products } = useProducts();

  // Calculate stats
  const stats = useMemo(() => {
    const total = products?.length || 0;
    const totalValue = products?.reduce((sum, p) => sum + p.price, 0) || 0;
    const avgPrice = total > 0 ? totalValue / total : 0;
    const favorites = products?.filter(p => p.is_favorite).length || 0;
    const mastered = products?.filter(p => p.learning_status === 'maîtrisé').length || 0;

    return { total, totalValue, avgPrice, favorites, mastered };
  }, [products]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  // Brand distribution (top 5)
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

  // Learning status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      'à-apprendre': 0,
      'en-cours': 0,
      'maîtrisé': 0
    };
    products.forEach(p => {
      const status = p.learning_status || 'à-apprendre';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: learningStatuses.find(s => s.value === name)?.label || name,
      value
    }));
  }, [products]);

  // Price distribution by ranges
  const priceRanges = useMemo(() => {
    const ranges = [
      { label: '< 5k', min: 0, max: 5000, count: 0 },
      { label: '5k-10k', min: 5000, max: 10000, count: 0 },
      { label: '10k-20k', min: 10000, max: 20000, count: 0 },
      { label: '20k-50k', min: 20000, max: 50000, count: 0 },
      { label: '> 50k', min: 50000, max: Infinity, count: 0 }
    ];
    products.forEach(p => {
      const range = ranges.find(r => p.price >= r.min && p.price < r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [products]);

  // Recent activity (mock - would come from backend)
  const recentActivity = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
      .slice(0, 5);
  }, [products]);

  // Colors
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-10">
          Analyse et insights de votre catalogue
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<Package size={24} />}
            label="Produits"
            value={stats.total}
            trend={null}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<DollarSign size={24} />}
            label="Valeur Totale"
            value={`${stats.totalValue.toLocaleString()} FCFA`}
            trend={null}
            color="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={<Heart size={24} />}
            label="Favoris"
            value={`${stats.favorites} (${((stats.favorites / stats.total) * 100).toFixed(1)}%)`}
            trend={null}
            color="from-pink-500 to-rose-500"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Maîtrisés"
            value={`${stats.mastered} (${((stats.mastered / stats.total) * 100).toFixed(1)}%)`}
            trend={null}
            color="from-violet-500 to-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-beauty-soft dark:border-gray-700 shadow-lg"
          >
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Répartition par Catégorie
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {categoryData.map((cat, i) => (
                <span
                  key={cat.name}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {cat.name}: {cat.value}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Top brands */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-beauty-soft dark:border-gray-700 shadow-lg"
          >
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Top Marques
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brandData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-muted)" />
                <YAxis type="category" dataKey="name" stroke="var(--color-muted)" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Learning status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-beauty-soft dark:border-gray-700 shadow-lg"
          >
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Statut d'Apprentissage
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {statusData.map((status, i) => {
                const config = learningStatuses.find(s => s.label === status.name);
                return (
                  <div
                    key={status.name}
                    className={`p-4 rounded-2xl text-center ${config?.color || 'bg-gray-100 dark:bg-gray-700'}`}
                  >
                    <div className="text-3xl font-bold mb-1">{status.value}</div>
                    <div className="text-sm font-medium opacity-80">{status.name}</div>
                  </div>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Price ranges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-beauty-soft dark:border-gray-700 shadow-lg"
          >
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Distribution des Prix
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-beauty-soft dark:border-gray-700 shadow-lg"
          >
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Activité Récente
            </h3>
            <div className="space-y-4">
              {recentActivity.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-beauty-base dark:bg-gray-900/50 border border-beauty-soft dark:border-gray-700 hover:bg-beauty-soft dark:hover:bg-gray-700/50 transition-colors"
                >
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=48'}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.brand} • {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-beauty-accent">
                      {product.price.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {product.updated_at
                        ? new Date(product.updated_at).toLocaleDateString()
                        : 'Non modifié'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | null;
  color: string;
}> = ({ icon, label, value, trend, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-beauty-soft dark:border-gray-700 shadow-lg"
  >
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white mb-4`}>
      {icon}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {trend && (
      <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span>vs mois dernier</span>
      </div>
    )}
  </motion.div>
);
