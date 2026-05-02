-- Enable Row Level Security on products table if not already enabled
alter table products enable row level security;

-- Policy for INSERT (anon): only WITH CHECK allowed
create policy "Allow anon insert on products"
on products for insert
to anon
with check (true);

-- Policy for SELECT (anon)
create policy "Allow anon select on products"
on products for select
to anon
using (true);

-- Policy for UPDATE (anon): needs both USING and WITH CHECK
create policy "Allow anon update on products"
on products for update
to anon
using (true)
with check (true);

-- Policy for DELETE (anon): only USING allowed
create policy "Allow anon delete on products"
on products for delete
to anon
using (true);