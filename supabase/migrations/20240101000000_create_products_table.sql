-- Product table for GlowGuide
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  brand text not null,
  category text not null,
  price numeric not null,
  summary text,
  ingredients text,
  benefits text,
  usage text,
  target_skin text,
  contraindications text,
  key_points text[],
  notes text,
  is_favorite boolean default false,
  learning_status text check (learning_status in ('à-apprendre', 'en-cours', 'maîtrisé')),
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Image storage table (optional - for tracking uploaded images)
create table product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  path text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

-- Enable realtime for products
alter publication supabase_realtime add table products;

-- Create index for faster searches
create index products_category_idx on products(category);
create index products_brand_idx on products(brand);
create index products_learning_status_idx on products(learning_status);

-- Note: For image storage, create a bucket in Supabase Storage dashboard:
-- 1. Go to Storage > Buckets
-- 2. Create bucket named 'product-images'
-- 3. Set public read access if you want images accessible without auth
-- 4. Upload images via supabase.storage.from('product-images').upload()