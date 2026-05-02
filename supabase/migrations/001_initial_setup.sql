-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products (public)
CREATE POLICY "Allow public read access" ON products
FOR SELECT USING (true);

-- Policy: Authenticated users can insert products
CREATE POLICY "Allow authenticated insert" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update their own products (or all for now)
CREATE POLICY "Allow authenticated update" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete products
CREATE POLICY "Allow authenticated delete" ON products
FOR DELETE USING (auth.role() = 'authenticated');

-- Storage: Create bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

-- Storage policies for product-images bucket
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Actually we want public read for images
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
