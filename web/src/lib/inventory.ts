import { createClient } from '@/lib/supabase/server';

export type PublicVehicle = {
  id: string; title: string; slug: string; make: string; model: string; year: number;
  price_text: string | null; mileage_text: string | null; body_type: string | null;
  fuel: string | null; transmission: string | null; description: string | null; image_urls: string[];
  status: 'draft' | 'published' | 'reserved' | 'sold';
};

export async function getPublishedVehicles(): Promise<PublicVehicle[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from('vehicles').select('id,title,slug,make,model,year,price_text,mileage_text,body_type,fuel,transmission,description,image_urls,status').eq('status','published').order('updated_at',{ascending:false});
  if (error) { console.error('Unable to load published vehicle inventory'); return []; }
  return (data || []) as PublicVehicle[];
}
