-- Keep buyer identity data with the private sale record.
alter table public.vehicle_sales
  add column if not exists buyer_document_type text,
  add column if not exists buyer_document_number text;

alter table public.vehicle_sales
  drop constraint if exists vehicle_sales_buyer_document_type_check,
  add constraint vehicle_sales_buyer_document_type_check
    check (buyer_document_type is null or buyer_document_type in ('DNI', 'CUIL', 'CUIT')),
  drop constraint if exists vehicle_sales_buyer_document_number_length_check,
  add constraint vehicle_sales_buyer_document_number_length_check
    check (buyer_document_number is null or char_length(buyer_document_number) <= 20);
