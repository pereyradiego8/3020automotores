-- Optional vehicle registration plate captured with private sale details.
alter table public.vehicle_sales
  add column if not exists vehicle_plate text;

alter table public.vehicle_sales
  drop constraint if exists vehicle_sales_vehicle_plate_length_check,
  add constraint vehicle_sales_vehicle_plate_length_check
    check (vehicle_plate is null or char_length(vehicle_plate) <= 12);
