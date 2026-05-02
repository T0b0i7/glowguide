import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Edit3, Heart, Target, Sparkles, Save, X, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useProducts } from '../context';
import { useToast } from '../context/ToastContext';
import { imageService } from '../services/imageService';

export const ProductDetailsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, toggleFavorite, updateProduct } = useProducts();
  const product = products.find(p => p.id === id) || null;
  const [loading, setLoading] = useState(!product);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.imageUrl || null);
      setLoading(false);
    }
  }, [product]);

  const handleEdit = () => {
    if (product) {
      setFormData(product);
      setImagePreview(product.imageUrl || null);
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

  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      await toggleFavorite(product.id);
      toast.success(product.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (error) {
      toast.error('Erreur lors du changement de favori');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !product) return;

    setIsUploading(true);
    let imageUrl = product.imageUrl;

    if (selectedImage) {
      try {
        imageUrl = await imageService.upload(selectedImage, crypto.randomUUID());
      } catch (err) {
        console.warn('Upload échoué, conservation de l\'image existante:', err);
        toast.warning('Upload image échoué, image existante conservée');
      }
    }

    try {
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
        imageUrl: imageUrl
      };

      await updateProduct(id, updates);
      const updated = await productService.getById(id);
      setProduct(updated);
      setFormData(updated);
      setIsEditing(false);
      setSelectedImage(null);
      toast.success('Produit mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé.</h2>
        <button onClick={() => navigate('/')} className="text-beauty-accent hover:underline flex items-center gap-2 font-medium">
          <ArrowLeft size={18} /> Retour au catalogue
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button
          onClick={handleCancelEdit}
          className="group flex items-center gap-2 text-gray-500 hover:text-beauty-accent font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour au produit
        </button>

        <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Modifier le Produit</h1>

        <form onSubmit={handleSubmitEdit} className="space-y-8">
          <section className="bg-white p-6 sm:p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">Informations de base</h3>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Photo du Produit</label>
              <div className="flex items-center gap-4 sm:gap-6 flex-col sm:flex-row">
                <div className="w-32 h-32 bg-beauty-soft rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-beauty-accent" />
                  )}
                </div>
                <label className="px-4 sm:px-6 py-3 rounded-2xl bg-beauty-base text-gray-700 font-bold border border-beauty-soft hover:bg-beauty-soft cursor-pointer transition-colors text-center">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  Choisir une image
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Nom du Produit</label>
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Marque</label>
                <input
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Catégorie</label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all appearance-none text-sm sm:text-base"
                >
                  <option value="Crème">Crème</option>
                  <option value="Sérum">Sérum</option>
                  <option value="Nettoyant">Nettoyant</option>
                  <option value="Tonique">Tonique</option>
                  <option value="Masque">Masque</option>
                  <option value="Solaire">Solaire</option>
                  <option value="Huile">Huile</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Prix (FCFA)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Résumé Court</label>
              <textarea
                name="summary"
                value={formData.summary || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all resize-none text-sm sm:text-base"
              />
            </div>
          </section>

          <section className="bg-white p-6 sm:p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold">Connaissances Approfondies</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Ingrédients</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Bénéfices</label>
                <textarea
                  name="benefits"
                  value={formData.benefits || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Utilisation</label>
                <textarea
                  name="usage"
                  value={formData.usage || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Type de Peau Cible</label>
                <textarea
                  name="target_skin"
                  value={formData.target_skin || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contre-indications</label>
              <textarea
                name="contraindications"
                value={formData.contraindications || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Points Clés (Un par ligne)</label>
              <textarea
                name="key_points"
                value={Array.isArray(formData.key_points) ? formData.key_points.join('\n') : formData.key_points || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Notes Personnelles</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 transition-all text-sm sm:text-base"
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pb-10">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white text-gray-600 font-bold border border-beauty-soft hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <X size={18} sm:size={20} /> Annuler
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 sm:px-10 py-3 sm:py-4 rounded-2xl bg-beauty-accent text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <Save size={18} sm:size={20} /> {isUploading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div id={`product-details-${product?.id}`} className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <button
        id="back-btn"
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-beauty-accent font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Retour à la liste
      </button>

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-1/3"
        >
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-lg border border-beauty-soft">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-4 sm:top-6 left-4 px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest ${
              product.learningStatus === 'maîtrisé' ? 'bg-beauty-muted text-gray-700' : 'bg-beauty-soft text-beauty-accent'
            }`}>
              {product.learningStatus?.replace('-', ' ')}
            </div>
          </div>
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-beauty-accent uppercase tracking-[0.2em] mb-1">{product.brand}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <button className="p-2 sm:p-3 rounded-full bg-white border border-beauty-soft text-beauty-accent shadow-sm hover:scale-110 transition-transform"
                  onClick={handleEdit}>
                  <Edit3 size={20} sm:size={24} />
                </button>
                <button className="p-2 sm:p-3 rounded-full bg-white border border-beauty-soft text-beauty-accent shadow-sm hover:scale-110 transition-transform"
                  onClick={handleToggleFavorite}>
                  <Heart size={20} sm:size={24} fill={product.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 sm:px-4 py-1 bg-beauty-base rounded-lg text-xs sm:text-sm font-semibold text-gray-600 border border-beauty-soft">
                {product.category}
              </span>
              <span className="text-lg sm:text-xl font-bold text-beauty-accent">
                {product.price.toLocaleString()} FCFA
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed italic border-l-2 border-beauty-soft pl-4 sm:pl-6">
              "{product.summary}"
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <DetailSection
          icon={<Sparkles className="text-beauty-accent" size={20} sm:size={24} />}
          title="Bénéfices"
          content={product.benefits}
        />
        <DetailSection
          icon={<Info className="text-blue-400" size={20} sm:size={24} />}
          title="Ingrédients"
          content={product.ingredients}
        />
        <DetailSection
          icon={<Edit3 className="text-purple-400" size={20} sm:size={24} />}
          title="Utilisation"
          content={product.usage}
        />
        <DetailSection
          icon={<Target className="text-orange-400" size={20} sm:size={24} />}
          title="Type de Peau"
          content={product.target_skin}
        />
        <DetailSection
          icon={<AlertCircle className="text-red-400" size={20} sm:size={24} />}
          title="Contre-indications"
          content={product.contraindications}
        />
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-beauty-soft shadow-sm col-span-full md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={20} sm:size={24} className="text-beauty-muted fill-beauty-muted text-gray-700" />
            <h3 className="font-display text-xl sm:text-2xl font-bold">Points Clés</h3>
          </div>
          <ul className="space-y-3">
            {product.key_points?.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-sm sm:text-base">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-beauty-accent flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {product.notes && (
          <div className="bg-beauty-soft/30 p-6 sm:p-8 rounded-[32px] border border-beauty-soft col-span-full">
            <h3 className="font-display text-xl sm:text-2xl font-bold mb-4">Notes Personnelles</h3>
            <p className="text-gray-600 italic leading-relaxed whitespace-pre-line text-sm sm:text-base">
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
    className="bg-white p-6 sm:p-8 rounded-[32px] border border-beauty-soft shadow-sm"
  >
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="font-display text-xl sm:text-2xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{content}</p>
  </motion.div>
);
