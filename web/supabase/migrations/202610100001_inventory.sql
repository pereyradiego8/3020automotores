-- 3020 Automotores inventory schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
do $$ begin create type public.vehicle_status as enum ('draft','published','reserved','sold'); exception when duplicate_object then null; end $$;
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.vehicles (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, make text not null, model text not null, year integer not null check(year between 1950 and 2100), price_text text, mileage_text text, body_type text, fuel text, transmission text, description text, image_urls text[] not null default '{}', status public.vehicle_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create or replace function public.is_inventory_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;
revoke all on function public.is_inventory_admin() from public;
grant execute on function public.is_inventory_admin() to anon, authenticated;
create or replace function public.set_vehicle_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_vehicle_updated_at();
alter table public.admin_users enable row level security;
alter table public.vehicles enable row level security;
drop policy if exists "Admins can read admin roster" on public.admin_users;
create policy "Admins can read admin roster" on public.admin_users for select to authenticated using(public.is_inventory_admin());
drop policy if exists "Public can read published vehicles" on public.vehicles;
create policy "Public can read published vehicles" on public.vehicles for select to anon,authenticated using(status='published' or public.is_inventory_admin());
drop policy if exists "Admins can insert vehicles" on public.vehicles;
create policy "Admins can insert vehicles" on public.vehicles for insert to authenticated with check(public.is_inventory_admin());
drop policy if exists "Admins can update vehicles" on public.vehicles;
create policy "Admins can update vehicles" on public.vehicles for update to authenticated using(public.is_inventory_admin()) with check(public.is_inventory_admin());
drop policy if exists "Admins can delete vehicles" on public.vehicles;
create policy "Admins can delete vehicles" on public.vehicles for delete to authenticated using(public.is_inventory_admin());
grant select on public.vehicles to anon,authenticated;
grant insert,update,delete on public.vehicles to authenticated;
grant select on public.admin_users to authenticated;
-- After creating a staff user in Supabase Auth, authorize their UUID:
-- insert into public.admin_users(user_id) values ('UUID_FROM_AUTH_USERS');

-- Public vehicle photos. Uploads are limited to authorized inventory admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true, file_size_limit=8388608, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view vehicle photos" on storage.objects;
create policy "Public can view vehicle photos" on storage.objects for select to anon, authenticated using (bucket_id='vehicle-images');
drop policy if exists "Admins can upload vehicle photos" on storage.objects;
create policy "Admins can upload vehicle photos" on storage.objects for insert to authenticated with check (bucket_id='vehicle-images' and public.is_inventory_admin());
drop policy if exists "Admins can update vehicle photos" on storage.objects;
create policy "Admins can update vehicle photos" on storage.objects for update to authenticated using (bucket_id='vehicle-images' and public.is_inventory_admin()) with check (bucket_id='vehicle-images' and public.is_inventory_admin());
drop policy if exists "Admins can delete vehicle photos" on storage.objects;
create policy "Admins can delete vehicle photos" on storage.objects for delete to authenticated using (bucket_id='vehicle-images' and public.is_inventory_admin());
