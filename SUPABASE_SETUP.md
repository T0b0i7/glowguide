# Configuration Supabase pour GlowGuide

## 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé `anon` (public)

## 2. Base de données

Exécutez le SQL suivant dans l'éditeur SQL de Supabase:

```sql
-- Table des produits
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
  learning_status text check (learning_status in ('à-apprendre','en-cours','maîtrisé')) default 'à-apprendre',
  image_url text,
  tags text[] default '{}',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Index pour performance
create index idx_products_category on products(category);
create index idx_products_brand on products(brand);
create index idx_products_favorite on products(is_favorite);
create index idx_products_learning on products(learning_status);

-- Trigger pour updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at
before update on products
for each row
execute function update_updated_at();
```

## 3. Storage (Images de produits)

1. Allez dans **Storage** → **Create bucket**
2. Nom: `product-images`
3. Public bucket: ✅ Oui
4. File size limit: 10MB (recommandé)
5. Allowed MIME types: `image/jpeg,image/png,image/webp,image/svg+xml`

### Politiques RLS (Row Level Security)

Dans **Storage Policies**, ajoutez:

**Policy 1: Lecture publique**
```sql
create policy "Public Read Access" on storage.objects
for select using (bucket_id = 'product-images');
```

**Policy 2: Upload authentifié**
```sql
create policy "Authenticated Upload" on storage.objects
for insert with check (
  bucket_id = 'product-images' and
  auth.role() = 'authenticated'
);
```

**Policy 3: Update authentifié**
```sql
create policy "Authenticated Update" on storage.objects
for update using (
  bucket_id = 'product-images' and
  auth.role() = 'authenticated'
);
```

**Policy 4: Delete authentifié**
```sql
create policy "Authenticated Delete" on storage.objects
for delete using (
  bucket_id = 'product-images' and
  auth.role() = 'authenticated'
);
```

## 4. Configuration CORS

Dans **Settings** → **API** → **URL Configuration**:

- **Site URL**: `https://votre-site.netlify.app`
- **Redirect URLs**: `https://votre-site.netlify.app/*`

## 5. Variables d'environnement

Dans **Settings** → **API** → **Project API keys**:

- `anon` (public) → à utiliser comme `VITE_SUPABASE_ANON_KEY`
- `service_role` (private) → garder secret, non utilisé côté client

## 6. Authentification (Optionnel)

Si vous voulez utiliser l'authentification:

1. Allez dans **Authentication** → **Providers**
2. Activez **Email** (déjà activé par défaut)
3. Configurez les templates d'email si besoin

Pour désactiver l'authentification (actuellement l'app fonctionne sans auth), vous pouvez ignorer cette étape. Les RLS ci-dessus permettent les inserts/updates sans auth, ce qui n'est pas recommandé en production. Pour une version production sécurisée, activez l'auth et modifiez les policies.

## 7. Vérification

Testez la connexion:

```bash
npm run dev
```

L'application devrait se connecter à Supabase sans erreur.

Si vous avez des erreurs de CORS, vérifiez l'URL du projet dans les Settings.

## 8. Déploiement Netlify

Dans Netlify Dashboard → Site settings → Build & deploy → Environment:

 Ajoutez ces variables:

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (votre clé anon) |

Redeclenchez un nouveau déploiement.

## 9. Notes importantes

- Le bucket `product-images` doit être **public** pour afficher les images
- Les images sont stockées dans le chemin `{productId}/{timestamp}.jpg`
- La compression côté client réduit la taille des images avant upload
- La suppression d'un produit ne supprime pas l'image du bucket (pour éviter des suppressions accidentelles)

## 10. Backup

Pensez à faire des backups réguliers:

```sql
-- Export
\copy (select * from products) to 'products_backup.csv' csv header;
```

Ou utilisez l'interface Supabase → Project Settings → Database → Export.

---

**GlowGuide** est maintenant prêt pour la production! 🚀
