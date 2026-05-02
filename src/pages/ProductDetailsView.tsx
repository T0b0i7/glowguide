import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Edit3, Heart, Target, Sparkles, Save, X, Camera, Tag, FileDown, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { SupabaseProduct } from '../types';
import { productService } from '../services/productService';
import { useProducts, useNotifications, useTags } from '../context';
import { imageService } from '../services/imageService';
import { TagSelector } from '../components/TagSelector';
import { TemplateSelector } from '../components/TemplateSelector';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';

export const ProductDetailsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, updateProduct } = useProducts();
  const { success, error: notifyError } = useNotifications();
  const { tags } = useTags();
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SupabaseProduct>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [newTag, setNewTag] = useState('');

  useKeyboardShortcuts();

  useEffect(() => {
    if (!id) return;
    productService.getById(id)
      .then(p => {
        setProduct(p);
        setFormData(p);
      })
      .catch(err => {
        console.error('Failed to load product:', err);
        notifyError('Erreur', 'Impossible de charger le produit');
      })
      .finally(() => setLoading(false));
  }, [id, notifyError]);

  const handleFavorite = async () => {
    if (!product) return;
    try {
      await toggleFavorite(product.id);
      success('Favoris', product.is_favorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (err) {
      notifyError('Erreur', 'Impossible de modifier favori');
    }
  };

  const handleEdit = () => {
    if (product) {
      setFormData(product);
      setImagePreview(product.image_url || null);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateApply = (templateId: string) => {
    // Find template
    const templates = JSON.parse(localStorage.getItem('glowguide-templates') || '[]');
    const template = templates.find((t: any) => t.id === templateId);
    if (template && product) {
      const values = template.defaultValues;
      const updated = {
        ...product,
        ...values,
        category: template.category
      };
      setFormData(updated);
      success('Template appliqué', `Valeurs de ${template.name} appliquées`);
    }
    setShowTemplateSelector(false);
  };

  const handleAddTag = (tagName: string) => {
    // This would be added in the main tag system
    notifyError('À venir', 'La gestion des tags sera disponible dans la prochaine version');
  };

  const handleToggleTag = (tagId: string) => {
    // Toggle tag
    const currentTags = formData.tags || [];
    setFormData(prev => ({
      ...prev,
      tags: currentTags.includes(tagId)
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId]
    }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !product) return;

    setIsUploading(true);
    let imageUrl = product.image_url;

    try {
      if (selectedImage) {
        imageUrl = await imageService.upload(selectedImage, crypto.randomUUID());
      }

      const updates: Partial<SupabaseProduct> = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: formData.price,
        summary: formData.summary,
        ingredients: formData.ingredients,
        benefits: formData.benefits,
        usage: formData.usage,
        target_skin: formData.target_skin,
        contraindications: formData.contraindications,
        key_points: Array.isArray(formData.key_points)
          ? formData.key_points
          : (typeof formData.key_points === 'string' ? (formData.key_points as string).split('\n').filter(p => p.trim()) : []),
        notes: formData.notes,
        image_url: imageUrl,
        tags: formData.tags
      };

      await updateProduct(id, updates);
      const updated = await productService.getById(id);
      setProduct(updated);
      setFormData(updated);
      setIsEditing(false);
      setSelectedImage(null);
      success('Produit mis à jour', 'Les modifications ont été sauvegardées');
    } catch (error) {
      console.error('Erreur:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
      notifyError('Échec de la modification', message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportJSON = () => {
    if (!product) return;
    const blob = new Blob([JSON.stringify(product, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Exporté', 'Produit exporté en JSON');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beauty-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Produit non trouvé.</h2>
        <button onClick={() => navigate('/')} className="text-beauty-accent hover:underline flex items-center gap-2 font-medium">
          <ArrowLeft size={18} /> Retour au catalogue
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={handleCancelEdit}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-beauty-accent font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour au produit
        </button>

        <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-8">Modifier le Produit</h1>

        <form onSubmit={handleSubmitEdit} className="space-y-8">
          <section className="bg-white dark:bg-gray-800 p-10 rounded-[40px] border border-beauty-soft dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold text-gray-800 dark:text-white mb-4">Informations de base</h3>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Photo du Produit</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-beauty-soft dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-beauty-accent" />
                  )}
                </div>
                <label className="px-6 py-3 rounded-2xl bg-beauty-base dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold border border-beauty-soft dark:border-gray-700 hover:bg-beauty-soft dark:hover:bg-gray-600 cursor-pointer transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  Choisir une image
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Nom du Produit</label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Marque</label>
                <input
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Catégorie</label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Prix (FCFA)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Résumé Court</label>
              <textarea
                name="summary"
                value={formData.summary || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 p-10 rounded-[40px] border border-beauty-soft dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold dark:text-white">Connaissances Approfondies</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Ingrédients</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Bénéfices</label>
                <textarea
                  name="benefits"
                  value={formData.benefits || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Utilisation</label>
                <textarea
                  name="usage"
                  value={formData.usage || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Type de Peau Cible</label>
                <textarea
                  name="target_skin"
                  value={formData.target_skin || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contre-indications</label>
              <textarea
                name="contraindications"
                value={formData.contraindications || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Points Clés (Un par ligne)</label>
              <textarea
                name="key_points"
                value={Array.isArray(formData.key_points) ? formData.key_points.join('\n') : formData.key_points || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Notes Personnelles</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 text-gray-900 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={16} className="text-beauty-accent" />
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tags</label>
              </div>
              <TagSelector
                selectedTagIds={formData.tags || []}
                onToggle={handleToggleTag}
                onAddTag={handleAddTag}
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pb-10">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border border-beauty-soft dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <X size={20} /> Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isUploading}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-beauty-accent to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} /> {isUploading ? 'Enregistrement...' : 'Enregistrer'}
            </motion.button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div id={`product-details-${product.id}`} className="max-w-5xl mx-auto px-6 py-10">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          id="back-btn"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-beauty-accent font-medium transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour à la liste
        </button>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTemplateSelector(true)}
            className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-xl font-semibold hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors flex items-center gap-2"
          >
            <Sparkles size={18} />
            Appliquer template
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportJSON}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center gap-2"
          >
            <FileDown size={18} />
            Exporter
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="px-4 py-2 bg-beauty-accent text-white rounded-xl font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-md"
          >
            <Edit3 size={18} />
            Modifier
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFavorite}
            className={`p-3 rounded-xl shadow-md transition-colors ${
              product.is_favorite
                ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white'
                : 'bg-white dark:bg-gray-800 border border-beauty-soft dark:border-gray-700 text-beauty-accent hover:bg-beauty-soft dark:hover:bg-gray-700'
            }`}
          >
            <Heart size={24} fill={product.is_favorite ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
      </div>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateApply}
      />

      {/* Product view */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col lg:flex-row gap-12 mb-12"
      >
        {/* Image */}
        <div className="w-full lg:w-1/3">
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-lg border-2 border-beauty-soft dark:border-gray-700 group">
            <img
              src={product.image_url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              product.learning_status === 'maîtrisé'
                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                : product.learning_status === 'en-cours'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
            }`}>
              {product.learning_status?.replace('-', ' ') || 'À apprendre'}
            </div>

            {/* Quick actions overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                onClick={handleFavorite}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:scale-110 transition-transform"
              >
                <Heart size={28} fill={product.is_favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleEdit}
                className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:scale-110 transition-transform"
              >
                <Edit3 size={28} />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-beauty-accent dark:text-pink-400 uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-beauty-base dark:bg-gray-700 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 border border-beauty-soft dark:border-gray-600">
                {product.category}
              </span>
              <span className="text-2xl font-bold text-beauty-accent dark:text-pink-400">
                {product.price.toLocaleString()} FCFA
              </span>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-4 border-beauty-accent pl-6 mb-6">
              "{product.summary}"
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tagId}
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DetailSection
          icon={<Sparkles className="text-beauty-accent dark:text-pink-400" />}
          title="Bénéfices"
          content={product.benefits}
        />
        <DetailSection
          icon={<Info className="text-blue-400" />}
          title="Ingrédients"
          content={product.ingredients}
        />
        <DetailSection
          icon={<Edit3 className="text-purple-400" />}
          title="Utilisation"
          content={product.usage}
        />
        <DetailSection
          icon={<Target className="text-orange-400" />}
          title="Type de Peau"
          content={product.target_skin}
        />
        <DetailSection
          icon={<AlertCircle className="text-red-400" />}
          title="Contre-indications"
          content={product.contraindications}
        />

        <div className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-beauty-soft dark:border-gray-700 shadow-sm col-span-full md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900/30" />
            <h3 className="font-display text-2xl font-bold dark:text-white">Points Clés</h3>
          </div>
          <ul className="space-y-3">
            {product.key_points?.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-beauty-accent flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {product.notes && (
          <div className="bg-beauty-soft/30 dark:bg-gray-800/50 p-8 rounded-[32px] border border-beauty-soft dark:border-gray-700 col-span-full">
            <h3 className="font-display text-2xl font-bold mb-4 text-gray-900 dark:text-white">Notes Personnelles</h3>
            <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed whitespace-pre-line">
              {product.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailSection: React.FC<{ icon: React.ReactNode; title: string; content: string }> = ({ icon, title, content }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-8 rounded-[32px] border border-beauty-soft dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="font-display text-2xl font-bold dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{content}</p>
  </motion.div>
);
