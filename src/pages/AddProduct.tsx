import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Info, AlertCircle, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { useProducts } from '../context/ProductContext';
import { imageService } from '../services/imageService';
import { useNotifications } from '../contexts/NotificationContext';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const notify = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Crème',
    price: 0,
    summary: '',
    ingredients: '',
    benefits: '',
    usage: '',
    targetSkin: '',
    contraindications: '',
    keyPoints: '',
    notes: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [categories, setCategories] = useState(['Crème', 'Sérum', 'Nettoyant', 'Tonique', 'Masque', 'Solaire', 'Huile']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400';

    if (selectedImage) {
      setIsUploading(true);
      try {
        imageUrl = await imageService.upload(selectedImage, crypto.randomUUID());
      } catch (error) {
        console.warn('Upload échoué, utilisation image par défaut:', error);
        notify.warning('Upload échoué', 'Image par défaut utilisée');
      }
      setIsUploading(false);
    }

    try {
      await addProduct({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: formData.price,
        summary: formData.summary,
        ingredients: formData.ingredients,
        benefits: formData.benefits,
        usage: formData.usage,
        targetSkin: formData.targetSkin,
        contraindications: formData.contraindications,
        keyPoints: formData.keyPoints.split('\n').filter(p => p.trim()),
        notes: formData.notes,
        imageUrl: imageUrl
      });
      navigate('/');
    } catch (error) {
      console.error('Erreur:', error);
      notify.error('Erreur', "Impossible d'ajouter le produit");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const finalValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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

  return (
    <div id="add-product-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <header className="mb-10 text-center">
        <h1 className="font-display text-5xl font-bold text-gray-900 mb-2">Ajouter un Produit</h1>
        <p className="text-gray-500 font-medium">Contribuez à la base de connaissances en ajoutant un nouveau produit.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-6 sm:p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-6">
          <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">Informations de base</h3>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Photo du Produit</label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Nom du Produit</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
                placeholder="ex: Hydratation Soyeuse"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Marque</label>
              <input
                required
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
                placeholder="ex: L'Oréal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Prix (FCFA)</label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Catégorie</label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-xs font-bold text-beauty-accent hover:underline"
              >
                {isCustomCategory ? "Choisir existante" : "Nouvelle catégorie ?"}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                required
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
                placeholder="Entrez le nom de la catégorie..."
              />
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all appearance-none text-sm sm:text-base"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Résumé Court</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all resize-none text-sm sm:text-base"
              placeholder="ex: Un hydratant quotidien pour peaux sensibles."
            />
          </div>
        </section>

        <section className="bg-white p-6 sm:p-10 rounded-[40px] border border-beauty-soft shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-beauty-soft rounded-full flex items-center justify-center">
              <Info size={20} className="text-beauty-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold">Connaissances Approfondies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <FormField
              label="Ingrédients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="Listez les actifs principaux..."
            />
            <FormField
              label="Bénéfices"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              placeholder="Quels sont les effets sur la peau ?"
            />
            <FormField
              label="Instructions d'Utilisation"
              name="usage"
              value={formData.usage}
              onChange={handleInputChange}
              placeholder="Comment et quand appliquer..."
            />
            <FormField
              label="Type de Peau Cible"
              name="targetSkin"
              value={formData.targetSkin}
              onChange={handleInputChange}
              placeholder="ex: Grasse, Sensible, Mature..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-red-400" />
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contre-indications / Avertissements</label>
            </div>
            <textarea
              name="contraindications"
              value={formData.contraindications}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
              placeholder="ex: Ne pas utiliser avec du rétinol..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Points Clés (Un par ligne)</label>
            <textarea
              name="keyPoints"
              value={formData.keyPoints}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
              placeholder="Arguments de vente cruciaux..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Notes Personnelles</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
              placeholder="Vos astuces, retours clients ou rappels..."
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-white text-gray-600 font-bold border border-beauty-soft hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <X size={20} /> Annuler
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-6 sm:px-10 py-3 sm:py-4 rounded-2xl bg-beauty-accent text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <Save size={20} /> {isUploading ? 'Upload...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{ label: string; name: string; value: string; onChange: any; placeholder: string }> = ({ label, name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-beauty-base border border-beauty-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-sm sm:text-base"
      placeholder={placeholder}
    />
  </div>
);
