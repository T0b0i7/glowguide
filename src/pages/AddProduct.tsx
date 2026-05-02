import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Info, AlertCircle, Camera, Sparkles, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { useProducts, useNotifications, useTags } from '../context';
import { imageService } from '../services/imageService';
import { TemplateSelector } from '../components/TemplateSelector';
import { categories } from '../data/categories';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { success, error: notifyError } = useNotifications();
  const { tags, addTag, assignTag } = useTags();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
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
    notes: '',
    tags: [] as string[]
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState(['Crème', 'Sérum', 'Nettoyant', 'Tonique', 'Masque', 'Solaire', 'Huile']);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    // Find template and apply
    const templates = JSON.parse(localStorage.getItem('glowguide-templates') || '[]');
    const template = templates.find((t: any) => t.id === templateId);
    if (template) {
      const values = template.defaultValues;
      setFormData(prev => ({
        ...prev,
        name: values.name || prev.name,
        brand: values.brand || prev.brand,
        category: template.category,
        price: values.price || prev.price,
        ingredients: values.ingredients || prev.ingredients,
        benefits: values.benefits || prev.benefits,
        usage: values.usage || prev.usage,
        keyPoints: Array.isArray(values.key_points) ? values.key_points.join('\n') : prev.keyPoints,
        notes: values.notes || prev.notes
      }));
      success('Template appliqué', template.name);
    }
    setShowTemplateSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400';

    if (selectedImage) {
      setIsUploading(true);
      try {
        imageUrl = await imageService.upload(selectedImage, crypto.randomUUID());
      } catch (error) {
        console.warn('Upload échoué, utilisation image par défaut:', error);
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
        target_skin: formData.targetSkin,
        contraindications: formData.contraindications,
        key_points: formData.keyPoints.split('\n').filter(p => p.trim()),
        notes: formData.notes,
        image_url: imageUrl,
        tags: formData.tags
      });

      // Auto-assign tags if created
      formData.tags.forEach(tagId => {
        // Tags are assigned at product creation in backend - handled by supabase trigger or service
      });

      success('Produit créé', `${formData.name} a été ajouté à la base de données`);
      navigate('/');
    } catch (error) {
      console.error('Erreur:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout du produit';
      notifyError('Échec de l\'ajout', message);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      const tag = {
        id: crypto.randomUUID(),
        name: newTag.trim(),
        color,
        productIds: []
      };
      addTag(tag);
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.id]
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <div id="add-product-page" className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="font-display text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Ajouter un Produit
          </h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTemplateSelector(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles size={20} />
            Templates
          </motion.button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Contribuez à la base de connaissances en ajoutant un nouveau produit.
        </p>
      </header>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="bg-white dark:bg-gray-800 p-10 rounded-[40px] border border-beauty-soft dark:border-gray-700 shadow-sm space-y-6">
          <h3 className="font-display text-2xl font-bold text-gray-800 dark:text-white mb-4">Informations de base</h3>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Photo du Produit</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-beauty-base dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-beauty-soft dark:border-gray-600">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-beauty-accent" />
                )}
              </div>
              <label className="px-6 py-3 rounded-2xl bg-beauty-base dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold border border-beauty-soft dark:border-gray-600 hover:bg-beauty-soft dark:hover:bg-gray-600 cursor-pointer transition-colors">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                Choisir une image
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name, Brand, Price */}
            <FormField
              label="Nom du Produit"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="ex: Hydratation Soyeuse"
            />
            <FormField
              label="Marque"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="ex: L'Oréal"
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Prix (FCFA)</label>
              <input
                required
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Catégorie</label>
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
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
                placeholder="Entrez le nom de la catégorie..."
              />
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
              >
                {customCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Résumé Court</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all resize-none text-gray-900 dark:text-white"
              placeholder="ex: Un hydratant quotidien pour peaux sensibles."
            />
          </div>
        </section>

        {/* Advanced info */}
        <section className="bg-white dark:bg-gray-800 p-10 rounded-[40px] border border-beauty-soft dark:border-gray-700 shadow-sm space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-beauty-soft dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Info size={20} className="text-beauty-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold dark:text-white">Connaissances Approfondies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          {/* Contraindications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-red-500" />
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Contre-indications / Avertissements</label>
            </div>
            <textarea
              name="contraindications"
              value={formData.contraindications}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
              placeholder="ex: Ne pas utiliser avec du rétinol..."
            />
          </div>

          {/* Key points */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Points Clés (Un par ligne)</label>
            <textarea
              name="keyPoints"
              value={formData.keyPoints}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
              placeholder="Arguments de vente cruciaux..."
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Notes Personnelles</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all text-gray-900 dark:text-white"
              placeholder="Vos astuces, retours clients ou rappels..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Tags</label>
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-xs text-beauty-accent hover:underline font-medium"
              >
                + Ajouter un tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const isSelected = formData.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold transition-all
                      ${isSelected ? 'ring-2 ring-offset-2' : 'opacity-70 hover:opacity-100'}
                    `}
                    style={{
                      backgroundColor: tag.color,
                      color: 'white',
                      ringColor: tag.color
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>

            {showTagInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Nom du tag..."
                  className="flex-1 px-4 py-2 rounded-xl bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-beauty-accent/20"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-2 bg-beauty-accent text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all"
                >
                  Créer
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold border border-beauty-soft dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X size={20} /> Annuler
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-beauty-accent to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={20} /> {isUploading ? 'Upload...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder: string;
}> = ({ label, name, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="w-full px-5 py-4 bg-beauty-base dark:bg-gray-900 border border-beauty-soft dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-beauty-accent/20 focus:border-beauty-accent transition-all resize-none text-gray-900 dark:text-white"
      placeholder={placeholder}
    />
  </div>
);
