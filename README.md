<div align="center">
  <img width="120" height="120" src="https://raw.githubusercontent.com/T0b0i7/glowguide/master/public/icon.svg" alt="GlowGuide Logo" />
</div>

# GlowGuide - Gestion de Produits Cosmétiques

GlowGuide est une application web de gestion de produits cosmétiques qui permet d'explorer, ajouter, modifier et suivre vos produits de beauté préférés. Elle offre une interface moderne pour cataloguer vos connaissances sur les produits de soins de la peau.

![GlowGuide Preview](https://raw.githubusercontent.com/T0b0i7/glowguide/master/public/preview.png)

## Fonctionnalités

### Catalogue de Produits
- Parcourir tous vos produits cosmétiques
- Rechercher par nom ou marque
- Filtrer par catégorie (Visage, Corps, Cheveux, Solaire, Maquillage)
- Trier par nom ou prix

### Gestion des Produits
- Ajouter de nouveaux produits avec toutes les informations détaillées
- Modifier les produits existants
- Supprimer des produits
- Marquer comme favori

### Suivi d'Apprentissage
- Statut "Maîtrisé" pour les produits que vous avez testés
- Statut "En cours" pour les produits en apprentissage
- Tableau de bord avec statistiques

### Détails des Produits
Chaque produit contient :
- Nom et marque
- Catégorie
- Prix
- Résumé description
- Ingrédients clés
- Bienfaits
- Mode d'utilisation
- Type de peau cible
- Contre-indications
- Points clés
- Notes personnelles
- Image

## Technologies

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (Base de données + Auth)
- **Icons**: Lucide React

## Installation

```bash
# Cloner le projet
git clone https://github.com/T0b0i7/glowguide.git
cd glowguide

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos identifiants Supabase

# Lancer l'application
npm run dev
```

## Configuration Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Récupérer les URL et clés dans les paramètres du projet
3. Les ajouter dans le fichier `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Exécuter les migrations SQL dans le dossier `supabase/migrations/`

## Structure du Projet

```
src/
├── components/       # Composants React réutilisables
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   └── SearchBar.tsx
├── context/          # Contextes React
│   └── ProductContext.tsx
├── pages/            # Pages principales
│   ├── Dashboard.tsx
│   ├── ProductList.tsx
│   ├── ProductDetailsView.tsx
│   ├── AddProduct.tsx
│   └── EditProduct.tsx
├── services/         # Services API
│   ├── productService.ts
│   └── imageService.ts
├── lib/              # Configuration
│   └── supabase.ts
├── types/            # Types TypeScript
│   └── supabase.ts
└── types.ts          # Types globaux
```

## Commandes Disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Construire pour la production
npm run preview  # Prévisualiser la version production
```

## Licence

MIT License