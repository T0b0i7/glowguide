import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Edit3, Heart, Target, Sparkles, Save, X, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { SupabaseProduct, Product } from '../types';
import { productService } from '../services/productService';
import { useProducts } from '../context/ProductContext';
import { imageService } from '../services/imageService';

export const ProductDetailsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SupabaseProduct>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toggleFavorite, updateProduct } = useProducts();

  useEffect(() => {
    if (!id) return;
    productService.getById(id)
      .then(p => {
        setProduct(p);
        setFormData(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
        image_url: imageUrl
      };

      await updateProduct(id, updates);
      const updated = await productService.getById(id);
      setProduct(updated);
      setFormData(updated);
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button 
          onClick={handleCancelEdit}
          className="group flex items-center gap-2 text-gray-500 hover:text-beauty-accent font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour au produit
        </button>

        <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Modifier le Produit</h1>

        <form onSubmit={handleSubmitEdit} className="space-y-8">
          <section className="bg-white p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">Informations de base</h3>
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Photo du Produit</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-beauty-soft rounded-2xl flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={40} className="text-beauty-accent" />
                  )}
                </div>
                <label className="px-6 py-3 rounded-2xl bg-beauty-base text-gray-700 font-bold border border-beauty-soft hover:bg-beauty-soft cursor-pointer transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  Choisir une image
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Nom du Produit</label>
                <input 
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Marque</label>
                <input 
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Catégorie</label>
                <select 
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
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
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
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
                className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
              />
            </div>
          </section>

          <section className="bg-white p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-6">
            <h3 className="font-display text-2xl font-bold">Connaissances Approfondies</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Ingrédients</label>
                <textarea 
                  name="ingredients"
                  value={formData.ingredients || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Bénéfices</label>
                <textarea 
                  name="benefits"
                  value={formData.benefits || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Utilisation</label>
                <textarea 
                  name="usage"
                  value={formData.usage || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Type de Peau Cible</label>
                <textarea 
                  name="target_skin"
                  value={formData.target_skin || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
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
                className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Points Clés (Un par ligne)</label>
              <textarea 
                name="key_points"
                value={Array.isArray(formData.key_points) ? formData.key_points.join('\n') : formData.key_points || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Notes Personnelles</label>
              <textarea 
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-5 py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
              />
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pb-10">
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="px-8 py-4 rounded-2xl bg-white text-gray-600 font-bold border border-beauty-soft hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={20} /> Annuler
            </button>
            <button 
              type="submit"
              disabled={isUploading}
              className="px-10 py-4 rounded-2xl bg-beauty-accent text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} /> {isUploading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div id={`product-details-${product.id}`} className="max-w-5xl mx-auto px-6 py-10">
      <button 
        id="back-btn"
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-gray-500 hover:text-beauty-accent font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Retour à la liste
      </button>

      <div className="flex flex-col lg:flex-row gap-12 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-1/3"
        >
          <div className="relative aspect-square rounded-[40px] overflow-hidden shadow-lg border border-beauty-soft">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              product.learning_status === 'maîtrisé' ? 'bg-beauty-muted text-gray-700' : 'bg-beauty-soft text-beauty-accent'
            }`}>
              {product.learning_status?.replace('-', ' ')}
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
                <h1 className="font-display text-5xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <button className="p-3 rounded-full bg-white border border-beauty-soft text-beauty-accent shadow-sm hover:scale-110 transition-transform"
                  onClick={handleEdit}>
                  <Edit3 size={24} />
                </button>
                <button className="p-3 rounded-full bg-white border border-beauty-soft text-beauty-accent shadow-sm hover:scale-110 transition-transform"
                  onClick={() => toggleFavorite(product.id)}>
                  <Heart size={24} fill={product.is_favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1 bg-beauty-base rounded-lg text-sm font-semibold text-gray-600 border border-beauty-soft">
                {product.category}
              </span>
              <span className="text-xl font-bold text-beauty-accent">
                {product.price.toLocaleString()} FCFA
              </span>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed italic border-l-2 border-beauty-soft pl-6">
              "{product.summary}"
            </p>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DetailSection 
          icon={<Sparkles className="text-beauty-accent" />} 
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
        <div className="bg-white p-8 rounded-[32px] border border-beauty-soft shadow-sm col-span-full md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 size={24} className="text-beauty-muted fill-beauty-muted text-gray-700" />
            <h3 className="font-display text-2xl font-bold">Points Clés</h3>
          </div>
          <ul className="space-y-3">
            {product.key_points?.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-beauty-accent flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        
        {product.notes && (
          <div className="bg-beauty-soft/30 p-8 rounded-[32px] border border-beauty-soft col-span-full">
            <h3 className="font-display text-2xl font-bold mb-4">Notes Personnelles</h3>
            <p className="text-gray-600 italic leading-relaxed whitespace-pre-line">
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
    className="bg-white p-8 rounded-[32px] border border-beauty-soft shadow-sm"
  >
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="font-display text-2xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{content}</p>
  </motion.div>
);