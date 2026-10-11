-- Keep the SECURITY DEFINER helper outside exposed schemas so it cannot be called via the public Data API.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
alter function public.is_inventory_admin() set schema private;
revoke all on function private.is_inventory_admin() from public, anon;
grant execute on function private.is_inventory_admin() to authenticated;

drop policy if exists "Admins can read admin roster" on public.admin_users;
create policy "Admins can read admin roster" on public.admin_users for select to authenticated using(private.is_inventory_admin());

drop policy if exists "Public can read published vehicles" on public.vehicles;
create policy "Public can read published vehicles" on public.vehicles for select to anon using(status='published');
create policy "Signed-in users can read published or admin inventory" on public.vehicles for select to authenticated using(status='published' or private.is_inventory_admin());

drop policy if exists "Admins can insert vehicles" on public.vehicles;
create policy "Admins can insert vehicles" on public.vehicles for insert to authenticated with check(private.is_inventory_admin());
drop policy if exists "Admins can update vehicles" on public.vehicles;
create policy "Admins can update vehicles" on public.vehicles for update to authenticated using(private.is_inventory_admin()) with check(private.is_inventory_admin());
drop policy if exists "Admins can delete vehicles" on public.vehicles;
create policy "Admins can delete vehicles" on public.vehicles for delete to authenticated using(private.is_inventory_admin());

drop policy if exists "Admins can upload vehicle photos" on storage.objects;
create policy "Admins can upload vehicle photos" on storage.objects for insert to authenticated with check (bucket_id='vehicle-images' and private.is_inventory_admin());
drop policy if exists "Admins can update vehicle photos" on storage.objects;
create policy "Admins can update vehicle photos" on storage.objects for update to authenticated using (bucket_id='vehicle-images' and private.is_inventory_admin()) with check (bucket_id='vehicle-images' and private.is_inventory_admin());
drop policy if exists "Admins can delete vehicle photos" on storage.objects;
create policy "Admins can delete vehicle photos" on storage.objects for delete to authenticated using (bucket_id='vehicle-images' and private.is_inventory_admin());
