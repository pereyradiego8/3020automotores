'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) throw new Error('Cuenta sin permisos de inventario.');
  return supabase;
}

export async function createVehicle(formData: FormData) {
  const supabase = await requireAdmin();
  const title = String(formData.get('title') || '').trim();
  const make = String(formData.get('make') || '').trim();
  const model = String(formData.get('model') || '').trim();
  const year = Number(formData.get('year'));
  if (!title || !make || !model || !Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new Error('Completá título, marca, modelo y año válido.');
  }
  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { error } = await supabase.from('vehicles').insert({
    title, slug, make, model, year,
    price_text: String(formData.get('price') || '').trim() || null,
    mileage_text: String(formData.get('mileage') || '').trim() || null,
    body_type: String(formData.get('body_type') || '').trim() || null,
    fuel: String(formData.get('fuel') || '').trim() || null,
    transmission: String(formData.get('transmission') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    status: 'draft',
  });
  if (error) throw new Error('No se pudo guardar. Revisá si ya existe una ficha con ese título.');
  revalidatePath('/admin');
  revalidatePath('/autos');
  redirect('/admin');
}

export async function setVehicleStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!id || !['draft', 'published', 'reserved', 'sold'].includes(status)) throw new Error('Estado no válido.');
  const { error } = await supabase.from('vehicles').update({ status }).eq('id', id);
  if (error) throw new Error('No se pudo actualizar el estado.');
  revalidatePath('/admin');
  revalidatePath('/autos');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function saveVehicleImages(vehicleId: string, imageUrls: string[]) {
  const supabase = await requireAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl || !vehicleId || !Array.isArray(imageUrls) || imageUrls.length > 12) {
    throw new Error('Datos de imágenes no válidos.');
  }
  const allowedPrefix = `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/vehicle-images/`;
  if (imageUrls.some((url) => typeof url !== 'string' || !url.startsWith(allowedPrefix))) {
    throw new Error('Las imágenes deben pertenecer al almacenamiento de vehículos.');
  }
  const { error } = await supabase.from('vehicles').update({ image_urls: imageUrls }).eq('id', vehicleId);
  if (error) throw new Error('No se pudieron guardar las imágenes.');
  revalidatePath('/admin');
  revalidatePath('/autos');
}

export async function updateVehicle(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const make = String(formData.get('make') || '').trim();
  const model = String(formData.get('model') || '').trim();
  const year = Number(formData.get('year'));
  if (!id || !title || !make || !model || !Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new Error('Completá título, marca, modelo y año válido.');
  }
  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const { error } = await supabase.from('vehicles').update({
    title, slug, make, model, year,
    price_text: String(formData.get('price') || '').trim() || null,
    mileage_text: String(formData.get('mileage') || '').trim() || null,
    body_type: String(formData.get('body_type') || '').trim() || null,
    fuel: String(formData.get('fuel') || '').trim() || null,
    transmission: String(formData.get('transmission') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
  }).eq('id', id);
  if (error) throw new Error('No se pudo actualizar. Revisá si ya existe otra ficha con ese título.');
  revalidatePath('/admin');
  revalidatePath('/autos');
  redirect('/admin');
}
