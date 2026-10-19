import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type PublicVehicle = {
  id: string; title: string; slug: string; make: string; model: string; year: number; updated_at: string | null;
  price_text: string | null; trade_in_price_text: string | null; features: string[]; mileage_text: string | null; body_type: string | null;
  fuel: string | null; transmission: string | null; description: string | null; image_urls: string[];
  status: 'draft' | 'published' | 'reserved' | 'sold';
};

const PUBLIC_VEHICLE_FIELDS = 'id,title,slug,make,model,year,updated_at,price_text,trade_in_price_text,mileage_text,body_type,fuel,transmission,description,features,image_urls,status';

export class InventoryUnavailableError extends Error {
  constructor() {
    super('No se pudo consultar el catálogo de vehículos.');
    this.name = 'InventoryUnavailableError';
  }
}

function ensureInventoryConfigured() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Public inventory is unavailable: Supabase environment is missing.');
    throw new InventoryUnavailableError();
  }
}

export const getPublishedVehicles = cache(async (): Promise<PublicVehicle[]> => {
  ensureInventoryConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select(PUBLIC_VEHICLE_FIELDS)
    .eq('status', 'published')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('Public vehicle inventory query failed.', { code: error.code });
    throw new InventoryUnavailableError();
  }
  return (data || []) as PublicVehicle[];
});

/** Look up only the requested published vehicle, rather than downloading all stock. */
export const getPublishedVehicleBySlug = cache(async (slug: string): Promise<PublicVehicle | null> => {
  ensureInventoryConfigured();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vehicles')
    .select(PUBLIC_VEHICLE_FIELDS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('Public vehicle detail query failed.', { code: error.code });
    throw new InventoryUnavailableError();
  }
  return (data ?? null) as PublicVehicle | null;
});
