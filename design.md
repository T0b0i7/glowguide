Je vais repenser entièrement le design pour un look **luxe & minimaliste** typé cosmétiques premium. Voici ma proposition:

## 🎨 Nouvelle Palette "Luxe Cosmétique"

| Élément | Couleur HEX | Usage |
|---------|------------|-------|
| **Fond principal** | `#FDFBF8` | Ivoire chaud (remplace #FCFAF8) |
| **Fond secondaire** | `#F7F3EE` | Crème nuancé pour cartes |
| **Titre principal** | `#0D0D0D` | Noir charbon (90% contraste) |
| **Texte secondaire** | `#5C524F` | Taupe foncé (lisible sans harshité) |
| **Accent doré** | `#C9A96E` | Or mat (prix, boutons CTA) |
| **Accent secondaire** | `#B08D74` | Bronze rosé (hover, états actifs) |
| **Badge / Soft** | `#EFE8E0` | Écru (fonds de badges) |
| **Bordure discrète** | `#E8E0D8` | Sable clair |
| **Success** | `#6B8E78` | Vert sauge (douceur naturelle) |
| **Error** | `#B85450` | Terracotta (chaleur contrôlée) |

## ✨ Principes de Design

**Typographie**
- Titres h1-h6: Playfair Display Italic (élegance éditoriale)
- Corps de texte: Inter (lisibilité)
- Tailles plus généreuses (line-height 1.6 pour le confort)

**Formes & Espacement**
- Coins `rounded-3xl` (40px) pour cartes (style galet)
- Espacement `gap-8` entre sections
- Ombres `shadow-lg` + `hover:shadow-2xl` (profondeur douce)
- Marges généreuses `py-12` au lieu de `py-6`

**Micro-interactions**
- `transition-all duration-300 ease-out` partout
- Boutons: `hover:scale-[1.02] active:scale-[0.98]`
- Cartes: `hover:-translate-y-1` (léger effet flottant)
- Inputs: `focus:ring-2 ring-c9a96e/20` (or subtil)

**Layout**
- Max-width `max-w-5xl` pour le contenu principal (plus aéré)
- Grid produits: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`
- Card: image en haut (4:3), contenu dessous avec padding `p-6`

**Composants clés:**
- **Navbar**: fond `bg-white/90` backdrop blur, bordure inférieure `border-b border-[#E8E0D8]`
- **Badge catégorie**: fond `bg-[#EFE8E0]` texte `text-[#5C524F]`
- **Boutons**: 
  - Primary: `bg-[#C9A96E] text-white hover:bg-[#B08D74]`
  - Secondary: `bg-white border border-[#E8E0D8] text-[#5C524F] hover:bg-[#F7F3EE]`
- **Toasts**: fond `bg-white` bordure `border-l-4` couleur selon type, ombre `shadow-2xl`

**Responsive Mobile:**
- Hamburger menu simple (icône☰) pour écrans <768px
- Cartes pleine largeur `w-full`
- Inputs et boutons en hauteur `min-h-[44px]` (touch-friendly)
- Padding page `px-4` sur mobile, `px-6` desktop

**Effets spéciaux:**
- Gradient très subtil sur fond page: `bg-gradient-to-b from-[#FDFBF8] to-[#F7F3EE]`
- Overlay modal: `bg-black/20 backdrop-blur-sm`
- Loading skeleton: `bg-[#EFE8E0] animate-pulse`

Voulez-vous que j'applique cette nouvelle charte graphique maintenant? Cela implique de mettre à jour:

1. `src/index.css` (thème Tailwind + variables CSS)
2. Tous les composants (ajustement classes Tailwind)
3. `ToastContext` (design des toasts)
4. `ConfirmDialog` (harmonie visuelle)
5. Éventuellement ajouter un `SkeletonLoader` pour les états de chargement

Je peux le faire en une passe complète.