-- Add separate trade-in pricing and structured equipment/features.
alter table public.vehicles
  add column if not exists trade_in_price_text text,
  add column if not exists features text[] not null default '{}';
