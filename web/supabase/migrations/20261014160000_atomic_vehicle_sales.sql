-- PREPARED FOR STAGING ONLY. Do not run against production until the
-- corresponding web version and a rollback/backup plan have been approved.
--
-- Vehicle status and private buyer data are now committed atomically.
-- Storage operations cannot participate in a PostgreSQL transaction:
-- document removals are queued inside the transaction, then retried after.
--
-- Private retry queue: no documents or buyer IDs are exposed to anonymous users.
create table if not exists private.sale_document_cleanup_queue (
  object_path text primary key,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  queued_at timestamptz not null default now(),
  constraint cleanup_path_belongs_to_vehicle
    check (left(object_path, length(vehicle_id::text) + 1) = vehicle_id::text || '/')
);

create index if not exists sale_document_cleanup_by_vehicle_idx
  on private.sale_document_cleanup_queue (vehicle_id, queued_at);
alter table private.sale_document_cleanup_queue enable row level security;
revoke all on private.sale_document_cleanup_queue from public, anon;
grant select, insert, delete on private.sale_document_cleanup_queue to authenticated;

drop policy if exists "Admins manage sale document cleanup" on private.sale_document_cleanup_queue;
create policy "Admins manage sale document cleanup"
  on private.sale_document_cleanup_queue
  for all to authenticated
  using (private.is_inventory_admin())
  with check (private.is_inventory_admin());

create or replace function public.save_vehicle_sale_atomic(
  p_vehicle_id uuid,
  p_status public.vehicle_status,
  p_buyer_name text,
  p_buyer_document_type text,
  p_buyer_document_number text,
  p_vehicle_plate text,
  p_sale_notes text,
  p_document_paths text[]
)
returns text[]
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_vehicle public.vehicles%rowtype;
  v_document_paths text[] := coalesce(p_document_paths, '{}'::text[]);
  v_old_paths text[] := '{}'::text[];
  v_pending_paths text[] := '{}'::text[];
begin
  if not private.is_inventory_admin() then
    raise exception 'Not authorized to administer inventory' using errcode = '42501';
  end if;

  select * into v_vehicle
  from public.vehicles
  where id = p_vehicle_id
  for update;

  if not found then
    raise exception 'Vehicle not found' using errcode = 'P0002';
  end if;

  -- Match the validation performed by the web app, including direct RPC callers.
  if p_status = 'published' and v_vehicle.status <> 'published' and (
    nullif(btrim(v_vehicle.title), '') is null
    or nullif(btrim(v_vehicle.make), '') is null
    or nullif(btrim(v_vehicle.model), '') is null
    or v_vehicle.year not between 1950 and 2100
    or nullif(btrim(v_vehicle.price_text), '') is null
    or nullif(btrim(v_vehicle.description), '') is null
    or not exists (
      select 1 from unnest(v_vehicle.image_urls) as image_url
      where nullif(btrim(image_url), '') is not null
    )
  ) then
    raise exception 'Complete the vehicle information before publishing'
      using errcode = '23514';
  end if;

  if p_status = 'sold' then
    if nullif(btrim(coalesce(p_buyer_name, '')), '') is null
       or nullif(btrim(coalesce(p_buyer_document_number, '')), '') is null
       or coalesce(p_buyer_document_type, '') not in ('DNI', 'CUIL', 'CUIT')
       or char_length(btrim(p_buyer_name)) > 160
       or char_length(btrim(p_buyer_document_number)) > 20
       or char_length(btrim(coalesce(p_vehicle_plate, ''))) > 12
       or char_length(btrim(coalesce(p_sale_notes, ''))) > 2000
       or cardinality(v_document_paths) > 8
       or exists (
         select 1 from unnest(v_document_paths) as path
         where path !~ ('^' || p_vehicle_id::text || '/[a-zA-Z0-9._-]+$')
       )
       or (select count(*) from unnest(v_document_paths) as path) <>
          (select count(distinct path) from unnest(v_document_paths) as path)
    then
      raise exception 'Invalid buyer or document data' using errcode = '23514';
    end if;

    insert into public.vehicle_sales (
      vehicle_id, buyer_name, buyer_document_type, buyer_document_number,
      vehicle_plate, sale_notes, document_paths
    )
    values (
      p_vehicle_id, nullif(btrim(p_buyer_name), ''),
      p_buyer_document_type, nullif(btrim(p_buyer_document_number), ''),
      nullif(upper(btrim(coalesce(p_vehicle_plate, ''))), ''),
      nullif(btrim(coalesce(p_sale_notes, '')), ''), v_document_paths
    )
    on conflict (vehicle_id) do update set
      buyer_name = excluded.buyer_name,
      buyer_document_type = excluded.buyer_document_type,
      buyer_document_number = excluded.buyer_document_number,
      vehicle_plate = excluded.vehicle_plate,
      sale_notes = excluded.sale_notes,
      document_paths = excluded.document_paths;
      -- Intentionally do not overwrite original sold_at.
  else
    select document_paths into v_old_paths
    from public.vehicle_sales
    where vehicle_id = p_vehicle_id
    for update;

    if found then
      insert into private.sale_document_cleanup_queue (vehicle_id, object_path)
      select p_vehicle_id, old_path
      from unnest(v_old_paths) as old_path
      on conflict (object_path) do nothing;

      delete from public.vehicle_sales where vehicle_id = p_vehicle_id;
    end if;
  end if;

  update public.vehicles set status = p_status where id = p_vehicle_id;

  select coalesce(array_agg(object_path order by queued_at), '{}'::text[])
  into v_pending_paths
  from private.sale_document_cleanup_queue
  where vehicle_id = p_vehicle_id;

  return v_pending_paths;
end;
$function$;

revoke all on function public.save_vehicle_sale_atomic(
  uuid, public.vehicle_status, text, text, text, text, text, text[]
) from public, anon;
grant execute on function public.save_vehicle_sale_atomic(
  uuid, public.vehicle_status, text, text, text, text, text, text[]
) to authenticated;

create or replace function public.acknowledge_sale_document_cleanup(
  p_vehicle_id uuid,
  p_document_paths text[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if not private.is_inventory_admin() then
    raise exception 'Not authorized to administer inventory' using errcode = '42501';
  end if;

  delete from private.sale_document_cleanup_queue
  where vehicle_id = p_vehicle_id
    and object_path = any(coalesce(p_document_paths, '{}'::text[]));
end;
$function$;

revoke all on function public.acknowledge_sale_document_cleanup(uuid, text[])
  from public, anon;
grant execute on function public.acknowledge_sale_document_cleanup(uuid, text[])
  to authenticated;

-- Only authorized staff can list retryable Storage paths (no buyer information).
create or replace function public.list_pending_sale_document_cleanup()
returns table (vehicle_id uuid, object_path text)
language sql stable
security invoker
set search_path = ''
as $function$
  select q.vehicle_id, q.object_path
  from private.sale_document_cleanup_queue as q
  where private.is_inventory_admin()
  order by q.queued_at, q.object_path;
$function$;

revoke all on function public.list_pending_sale_document_cleanup()
  from public, anon;
grant execute on function public.list_pending_sale_document_cleanup()
  to authenticated;
