-- Private sale records and documents. No existing vehicle rows are modified.
create table if not exists public.vehicle_sales (
  vehicle_id uuid primary key references public.vehicles(id) on delete cascade,
  buyer_name text check (buyer_name is null or char_length(buyer_name) <= 160),
  sale_notes text check (sale_notes is null or char_length(sale_notes) <= 2000),
  sold_at timestamptz not null default now(),
  document_paths text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  constraint vehicle_sales_document_count check (cardinality(document_paths) <= 8)
);

create index if not exists vehicle_sales_sold_at_idx on public.vehicle_sales (sold_at desc);
alter table public.vehicle_sales enable row level security;

drop policy if exists "Admins can read vehicle sale records" on public.vehicle_sales;
create policy "Admins can read vehicle sale records"
  on public.vehicle_sales for select to authenticated
  using (private.is_inventory_admin());

drop policy if exists "Admins can insert vehicle sale records" on public.vehicle_sales;
create policy "Admins can insert vehicle sale records"
  on public.vehicle_sales for insert to authenticated
  with check (private.is_inventory_admin());

drop policy if exists "Admins can update vehicle sale records" on public.vehicle_sales;
create policy "Admins can update vehicle sale records"
  on public.vehicle_sales for update to authenticated
  using (private.is_inventory_admin())
  with check (private.is_inventory_admin());

drop policy if exists "Admins can delete vehicle sale records" on public.vehicle_sales;
create policy "Admins can delete vehicle sale records"
  on public.vehicle_sales for delete to authenticated
  using (private.is_inventory_admin());

grant select, insert, update, delete on public.vehicle_sales to authenticated;
revoke all on public.vehicle_sales from anon;

-- Sale documents must never be public: only authorized admins can access the bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-sale-documents',
  'vehicle-sale-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

drop policy if exists "Admins can read vehicle sale documents" on storage.objects;
create policy "Admins can read vehicle sale documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'vehicle-sale-documents' and private.is_inventory_admin());

drop policy if exists "Admins can upload vehicle sale documents" on storage.objects;
create policy "Admins can upload vehicle sale documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vehicle-sale-documents'
    and private.is_inventory_admin()
    and name ~ '^[0-9a-fA-F-]{36}/'
  );

drop policy if exists "Admins can update vehicle sale documents" on storage.objects;
create policy "Admins can update vehicle sale documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'vehicle-sale-documents' and private.is_inventory_admin())
  with check (
    bucket_id = 'vehicle-sale-documents'
    and private.is_inventory_admin()
    and name ~ '^[0-9a-fA-F-]{36}/'
  );

drop policy if exists "Admins can delete vehicle sale documents" on storage.objects;
create policy "Admins can delete vehicle sale documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'vehicle-sale-documents' and private.is_inventory_admin());
