# Supabase Integration

## Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration in `supabase/migrations/` to create the products table
3. Create a Storage bucket named `product-images` in the Supabase dashboard
4. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

5. Update `.env` with your Supabase URL and anon key:
```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## Features

- **Products CRUD**: Full create, read, update, delete operations
- **Image Storage**: Upload product images to Supabase Storage
- **Realtime**: Subscribe to changes with `subscribeToChanges`
- **Search**: Search by name or brand
- **Favorites**: Toggle favorite status
- **Context Provider**: React context for product state management

## Storage Setup

1. Go to Storage > Buckets in your Supabase dashboard
2. Create bucket named `product-images`
3. Set it to **Public** if you want images accessible without authentication
4. Configure allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## Usage

```tsx
import { useProducts } from './context/ProductContext';
import { imageService } from './services/imageService';

function MyComponent() {
  const { products, addProduct } = useProducts();
  
  const handleImageUpload = async (file: File, productId: string) => {
    const url = await imageService.upload(file, productId);
    // url is the public URL to the uploaded image
  };
  
  // Use the context...
}
```

## API Reference

### productService

- `getAll()` - Get all products
- `getById(id)` - Get single product
- `create(product)` - Create new product
- `update(id, updates)` - Update product
- `delete(id)` - Delete product
- `toggleFavorite(id, isFavorite)` - Toggle favorite flag
- `search(query)` - Search products
- `subscribeToChanges(callback)` - Realtime subscription

### imageService

- `upload(file, productId)` - Upload image to storage, returns public URL
- `delete(path)` - Delete image by path
- `getPublicUrl(path)` - Get public URL for an image