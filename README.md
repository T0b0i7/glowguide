# GlowGuide - Gestionnaire de Catalogue de Produits Cosmétiques

[🔗 Preview](https://glowguide229.netlify.app/)

Application web de gestion de catalogue de produits cosmétiques pour les professionnels de la beauté. GlowGuide permet de cataloguer, organiser et maîtriser votre savoir produits avec des outils d'analyse et de suivi d'apprentissage.

---

## Fonctionnalités

### Gestion des Produits (CRUD)
- **Création** : Formulaire complet avec upload d'image, tags, templates et catégories
- **Lecture** : Vue détaillée avec sections organisées (ingrédients, bénéfices, usage, contre-indications)
- **Mise à jour** : Édition inline avec prévisualisation
- **Suppression** : Avec confirmation et option undo

### Dashboard Analytique
- Nombre total de produits et valeur inventaire
- Graphiques de répartition par catégorie
- Statut d'apprentissage (À apprendre / En cours / Maîtrisé)
- Top marque avec classement
- Indicateurs de favoris et produits maîtrisés

### Système de Tags
- Création de tags personnalisés avec couleur
- Attribution multiple par produit
- Filtrage par tag

### Filtres Avancés
- Recherche textuelle (nom, marque)
- Filtres par catégorie, marque, prix
- Filtres par statut d'apprentissage
- Filtres par tags et favoris
- Synchronisation URL (liens partageables)

### Gestion d'Images
- Upload avec prévisualisation
- Redimensionnement automatique
- Support JPEG/WebP
- Stockage Supabase

### Comparaison de Produits
- Sélection hasta 3 productos
- Vista tabular comparativa
- Destacación de diferenças

### Historique & Undo/Redo
- 50 dernières acciones
- Annulation et rétablissement
- Raccourcis clavier (Ctrl+Z, Ctrl+Y)

### Mode Sombre
- Thème complet
- Sync avec préférences système
- Persistance localStorage

### Notifications
- Toasts animés pour chaque action
- Types: success, error, warning, info
- Auto-dismiss avec progression

### Raccourcis Clavier
- `Ctrl+Z` : Annuler
- `Ctrl+Y` : Rétablir
- `Ctrl+A` : Tout sélectionner
- `Escape` : Désélectionner
- `N` : Nouveau produit
- `/` : Focus recherche

### Import / Export
- Export JSON complet
- Import avec confirmation

### Templates de Produits
- 3 templates par défaut (Crème hydratante, Sérum anti-âge, Nettoyant doux)
- Application rapide de valeurs par défaut

### PWA (Progressive Web App)
- Installable sur mobile et desktop
- Mode hors ligne avec Service Worker

---

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Projet Supabase

### Étapes

1. **Cloner le repository**
   ```bash
   git clone <repository>
   cd glowguide
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   # Créer fichier .env
   cp .env.example .env
   
   # Éditer avec vos valeurs
   VITE_SUPABASE_URL="votre_url_supabase"
   VITE_SUPABASE_ANON_KEY="votre_clé_anon"
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Build et preview**
   ```bash
   npm run build
   npm run preview
   ```

---

## Déploiement sur Netlify

### Méthode 1: Drag & Drop
1. `npm run build`
2. Glisser le dossier `dist` sur netlify.com

### Méthode 2: Git Integration
1. Connecter repository à Netlify
2. Ajouter variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## Base de données

### Table products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  summary TEXT,
  ingredients TEXT,
  benefits TEXT,
  usage TEXT,
  target_skin TEXT,
  contraindications TEXT,
  key_points TEXT[],
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  learning_status TEXT CHECK (learning_status IN ('à-apprendre','en-cours','maîtrisé')),
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Storage
- Bucket: `product-images` (public)

---

## Architecture

```
src/
├── components/
│   ├── ProductCard.tsx
│   ├── Navbar.tsx
│   ├── BulkActionBar.tsx
│   ├── AdvancedFilterBar.tsx
│   ├── ExportImportModal.tsx
│   ├── TemplateSelector.tsx
│   ├── TagSelector.tsx
│   ├── ComparisonTable.tsx
│   ├── SettingsModal.tsx
│   ├── UndoRedoBar.tsx
│   └── ThemeController.tsx
├── pages/
│   ├── ProductList.tsx
│   ├── ProductDetailsView.tsx
│   ├── AddProduct.tsx
│   ├── EditProduct.tsx
│   └── Dashboard.tsx
├── context/
│   ├── AppContext.tsx
│   ├── NotificationContext.tsx
│   ├── HistoryContext.tsx
│   └── index.ts
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useUrlSync.ts
│   └── useServiceWorker.ts
├── services/
│   ├── storageService.ts
│   ├── productService.ts
│   ├── imageService.ts
│   └── settingsService.ts
├── types/
│   ├── supabase.ts
│   └── index.ts
├── data/
│   └── categories.ts
├── lib/
│   └── supabase.ts
└── utils/
    └── productMapper.ts
```

---

## Personnalisation

### Couleurs (Tailwind)
- `beauty-accent`: #C9A96E (Doré)
- `beauty-dark`: #2D2926 ( Brun foncé)
- `beauty-sand`: #E8E0D8 (Sable)
- `beauty-text`: #5C524F

### Catégories
Modifier `src/data/categories.ts`

---

## Technologies

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Storage)
- **PWA**: Service Worker, Web App Manifest
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **Build**: Vite

---

## Debug

### Données localStorage
```javascript
localStorage.getItem('glowguide-products')
localStorage.getItem('glowguide-settings')
```

### Reset complet
```javascript
localStorage.clear()
location.reload()
```

---

## Licence

Propriétaire - Tous droits réservés

---

**GlowGuide** - Conçu pour les Professionnels de la Beauté