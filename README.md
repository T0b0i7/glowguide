# GlowGuide - Catalogue de Produits Cosmétiques

Application de gestion de catalogue de produits cosmétiques pour professionnels, construite avec React, TypeScript, Tailwind CSS et Supabase.

## ✨ Fonctionnalités

### 📦 Gestion des Produits (CRUD)
- **Création** : Formulaire complet avec upload d'image, tags, templates
- **Lecture** : Vue détaillée avec sections organisées
- **Mise à jour** : Édition inline avec prévisualisation
- **Suppression** : Avec confirmation et undo optionnel

### 🏷️ Système de Tags
- Création de tags personnalisés avec couleur aléatoire
- Attribution multiple par produit
- Filtrage par tag

### 📊 Dashboard Analytique
- Répartition par catégorie (pie chart)
- Top marques (bar chart)
- Répartition des statuts d'apprentissage
- Distribution des prix
- Activité récente

### 🔍 Filtres Avancés
- Recherche textuelle (nom, marque)
- Filtres par catégorie, marque, prix
- Filtres par statut d'apprentissage
- Filtres par tags
- Synchronisation avec l'URL (shareable links)
- Sauvegarde des vues

### 🖼️ Gestion d'Images
- Upload avec compression automatique
- Redimensionnement automatique
- Support JPEG/WebP
- Prévisualisation avant sauvegarde

### 📋 Comparaison de Produits
- Sélection jusqu'à 3 produits
- Vue tableau comparatif côte à côte
- Mise en évidence des différences
- Export possible

### ↩️ Historique & Undo/Redo
- Historique des 50 dernières actions
- Annulation et rétablissement
- Raccourcis clavier (Ctrl+Z, Ctrl+Y)

### 🌙 Mode Sombre
- Thème sombre complet
- Synchronisé avec les préférences système
- Persistance dans localStorage

### 🔔 Notifications
- Toasts animés pour chaque action CRUD
- 8 types de notifications (success, error, warning, create, update, delete, favorite, info)
- Auto-dismiss avec barre de progression
- Fermeture manuelle

### ⌨️ Raccourcis Clavier
- `Ctrl+Z` : Annuler
- `Ctrl+Y` : Rétablir
- `Ctrl+A` : Tout sélectionner
- `Escape` : Désélectionner
- `N` : Nouveau produit
- `/` : Focus sur recherche

### 📤 Import / Export
- Export complet JSON (produits, tags, templates, paramètres)
- Import avec confirmation et preview
- Remplacement ou merge des données

### 🏗️ Templates de Produits
- 3 templates par défaut (Crème hydratante, Sérum anti-âge, Nettoyant doux)
- Application rapide de valeurs par défaut
- Création de templates personnalisés

### 💾 Persistance Locale
- Sauvegarde automatique dans localStorage
- Sync différé avec Supabase
- Mode hors ligne (PWA)

### 📱 PWA (Progressive Web App)
-installable sur mobile/desktop
- Mode hors ligne avec Service Worker
- Synchronisation en arrière-plan
- Notifications push (à venir)

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Un projet Supabase

### Configuration

1. Cloner le repository
```bash
git clone <repository>
cd glowguide
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
VITE_SUPABASE_URL="votre_url_supabase"
VITE_SUPABASE_ANON_KEY="votre_clé_anon"
GEMINI_API_KEY="votre_clé_gemini" # Optionnel
```

4. Lancer en développement
```bash
npm run dev
```

5. Construction pour production
```bash
npm run build
npm run preview
```

## ☁️ Déploiement sur Netlify

### Méthode 1: Drag & Drop
1. Construire le projet : `npm run build`
2. Glisser-déposer le dossier `dist` sur netlify.com

### Méthode 2: Git Integration
1. Connecter votre repository à Netlify
2. Configurer les variables d'environnement dans Netlify Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Changer la commande de build : `npm run build`
4. Déployer

Le fichier `netlify.toml` est déjà configuré pour:
- Build automatique
- Variables d'environnement (à ajouter dans l'UI Netlify)
- Redirects SPA
- Headers de sécurité

## 🗄️ Base de données Supabase

### Table `products`
```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category text not null,
  price integer not null,
  summary text,
  ingredients text,
  benefits text,
  usage text,
  target_skin text,
  contraindications text,
  key_points text[],
  notes text,
  is_favorite boolean default false,
  learning_status text check (learning_status in ('à-apprendre','en-cours','maîtrisé')),
  image_url text,
  tags text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

### Storage
- Bucket `product-images` (public)
- Politique: lecture publique, écriture authentifiée

## 🎨 Personnalisation

### Couleurs (index.css)
- `--color-beauty-base` : fond principal
- `--color-beauty-soft` : secondaire
- `--color-beauty-accent` : accent principal
- `--color-beauty-muted` : atténué

### Catégories
Modifier `src/data/categories.ts`

### Templates
Les templates sont stockés dans `localStorage` sous la clé `glowguide-templates`. Modifiables via l'UI.

## 📱 Raccourcis Clavier Complets

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `Ctrl+A` | Tout sélectionner |
| `Escape` | Désélectionner |
| `N` | Nouveau produit |
| `/` | Focus recherche |
| `Ctrl+S` | Sauvegarder (formulaires) |

## 🔧 Architecture

### Structure des dossiers
```
src/
├── components/
│   ├── ui/          # Composants UI réutilisables
│   ├── ProductCard.tsx
│   ├── Navbar.tsx
│   ├── BulkActionBar.tsx
│   ├── AdvancedFilterBar.tsx
│   ├── ExportImportModal.tsx
│   ├── TemplateSelector.tsx
│   ├── TagSelector.tsx
│   ├── ComparisonTable.tsx
│   ├── OfflineIndicator.tsx
│   ├── UndoRedoBar.tsx
│   └── ThemeController.tsx
├── pages/
│   ├── ProductList.tsx
│   ├── ProductDetailsView.tsx
│   ├── AddProduct.tsx
│   ├── EditProduct.tsx
│   └── Dashboard.tsx
├── context/
│   ├── AppContext.tsx      # Contexte principal
│   ├── NotificationContext.tsx
│   ├── HistoryContext.tsx
│   └── index.ts
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useUrlSync.ts
│   └── useServiceWorker.ts
├── services/
│   ├── storageService.ts   # LocalStorage
│   ├── imageService.ts     # Upload/compression
│   └── supabase.ts
├── types/
│   └── supabase.ts
├── data/
│   └── categories.ts
└── utils/
```

### Contextes React
- **NotificationContext**: Gestion des toasts
- **AppContext**: État global (produits, filtres, sélection, tags, templates)
- **HistoryContext**: Undo/redo

### Hooks Custom
- `useProducts()`: CRUD produits
- `useSelection()`: Sélection multiple
- `useFilters()`: Filtres avancés
- `useTags()`: Gestion tags
- `useTemplates()`: Templates
- `useComparison()`: Comparaison
- `useSettings()`: Paramètres (dark mode, etc.)
- `useNotifications()`:Notifications
- `useHistory()`: Undo/redo
- `useUrlSync()`: Sync URL
- `useServiceWorker()`: PWA
- `useKeyboardShortcuts()`: Raccourcis

## 🐛 Debug

### Voir les données localStorage
```javascript
// Dans console navigateur
localStorage.getItem('glowguide-products')
localStorage.getItem('glowguide-settings')
```

### Reset complet
```javascript
localStorage.clear()
location.reload()
```

### logs Service Worker
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})
```

## 📄 Licence

Propriétaire - Tous droits réservés

## 🆘 Support

Pour toute question ou bug, ouvrir une issue sur GitHub.

---
**GlowGuide** fait pour les professionnels de la beauté.
