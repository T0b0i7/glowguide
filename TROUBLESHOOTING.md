# GlowGuide - Guide de dépannage

## Erreurs courantes

### ❌ "Failed to load resource: the server responded with a status of 504 (Outdated Optimize Dep)"

**Cause** : Le CDN esm.sh (utilisé par Vite en mode dev) est lent ou indisponible.

**Solutions** :

1. **Attendre et recharger** (5-10 min) - Le CDN peut être temporairement down
2. **Utiliser `--force`** :
   ```bash
   npm run dev:no-cache
   ```
   Cela force Vite à re-optimiser les dépendances localement.

3. **Nettoyer le cache** :
   ```bash
   # Sur Windows PowerShell
   Remove-Item -Recurse -Force node_modules/.vite
   npm run dev
   ```

4. **Vérifier votre connexion** :
   - Si vous êtes derrière un firewall/vpn, essayez de le désactiver
   - Testez avec un autre navigateur

5. **Installer les dépendances manquantes** :
   ```bash
   npm install
   ```

**Important** : Cette erreur n'affecte **PAS** la production. En build (`npm run build`), toutes les dépendances sont bundlées localement, pas de CDN. Sur Netlify, les fichiers sont servis depuis leur CDN propre, pas esm.sh.

---

### ❌ "meta name="apple-mobile-web-app-capable" is deprecated"

**Corrigé** dans `index.html`. La nouvelle meta est `mobile-web-app-capable`. Les deux sont maintenant présentes pour compatibilité.

---

### ⚠️ "Some chunks are larger than 500 kB"

 normal pour une app avec:
- Recharts (graphiques)
- Motion (animations)
- Lucide (icônes)
- Supabase client

**Optimisations déjà faites** :
- Code splitting automatique
- Compression gzip: 316 KB pour le JS principal
- Tree shaking via Vite

**Si nécessaire** : ajuster `vite.config.ts`:
```typescript
build: {
  chunkSizeWarningLimit: 1000, // en KB
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'charts': ['recharts'],
        'supabase': ['@supabase/supabase-js']
      }
    }
  }
}
```

---

## Vérification de l'installation

### 1. Vérifier que les dépendances sont installées
```bash
npm list motion lucide-react recharts
```

### 2. Nettoyer et réinstaller
```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 3. Vider le cache Vite
```bash
Remove-Item -Recurse -Force node_modules/.vite
```

### 4. Rebuild complet
```bash
npm run clean
npm run build
npm run preview
```

---

## Déploiement sur Netlify

Une fois le build local fonctionnel :

1. **Commit** les changements
2. **Push** vers GitHub/GitLab
3. **Connecter** le repo à Netlify
4. **Configurer** les variables d'environnement dans Netlify Dashboard

Le build Netlify utilisera ses propres dépendances (pas de CDN esm.sh), donc l'erreur 504 n'apparaîtra **pas en production**.

---

## Variables d'environnement Netlify

Assurez-vous d'avoir ajouté dans Netlify → Site settings → Build & deploy → Environment :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://lwrtkomsbssnfganyklo.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_MuiJXE9P7DAjDR9rFf4muQ_t4WhSdai` |

---

## Support

Si les problèmes persistent :
1. Vérifiez `console.log` dans le navigateur
2. Ouvrez l'onglet **Network** pour voir quels fichiers échouent
3. Essayez en navigation privée (pas d'extensions)
4. Testez sur un autre réseau

---

**Note** : L'application est conçue pour fonctionner **hors ligne** après première visite. Le Service Worker met en cache tous les assets. Même si le CDN est down, l'app devrait fonctionner après le premier chargement.
