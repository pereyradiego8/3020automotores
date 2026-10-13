'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function optionalText(formData: FormData, field: string, maxLength: number) {
  const value = String(formData.get(field) || '').trim();
  if (value.length > maxLength) throw new Error(`El campo ${field} admite hasta ${maxLength} caracteres.`);
  return value || null;
}

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
  if (!title || title.length > 120 || !make || make.length > 80 || !model || model.length > 80 || !Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new Error('Completá título, marca, modelo y año válido. El título admite hasta 120 caracteres.');
  }
  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) throw new Error('El título debe incluir letras o números para generar la URL.');
  const { error } = await supabase.from('vehicles').insert({
    title, slug, make, model, year,
    price_text: optionalText(formData, 'price', 80),
    trade_in_price_text: optionalText(formData, 'trade_in_price', 80),
    mileage_text: optionalText(formData, 'mileage', 80),
    body_type: optionalText(formData, 'body_type', 80),
    fuel: optionalText(formData, 'fuel', 80),
    transmission: optionalText(formData, 'transmission', 80),
    description: optionalText(formData, 'description', 5000),
    features: String(formData.get('features') || '').split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 40),
    status: 'draft',
  });
  if (error) throw new Error('No se pudo guardar. Revisá si ya existe una ficha con ese título.');
  revalidatePath('/admin');
  revalidatePath('/autos');
  revalidatePath('/sitemap.xml');
  redirect('/admin');
}

export async function setVehicleStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  if (!id || !['draft', 'published', 'reserved', 'sold'].includes(status)) throw new Error('Estado no válido.');
  const { data: updatedVehicle, error } = await supabase
    .from('vehicles')
    .update({ status })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    // Keep database details in server logs for diagnosis; never expose them to the browser.
    console.error('No se pudo actualizar el estado del vehículo.', {
      vehicleId: id,
      requestedStatus: status,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error('No se pudo actualizar el estado. Revisá los permisos y la conexión e intentá nuevamente.');
  }

  if (!updatedVehicle) {
    console.error('La actualización del estado no modificó ninguna fila.', {
      vehicleId: id,
      requestedStatus: status,
    });
    throw new Error('No se aplicaron cambios. Actualizá el inventario y verificá que el vehículo siga disponible para editar.');
  }
  revalidatePath('/admin');
  revalidatePath('/autos');
  revalidatePath('/sitemap.xml');
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
  const legacyPrefix = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/';
  if (new Set(imageUrls).size !== imageUrls.length || imageUrls.some((url) => {
    if (typeof url !== 'string') return true;
    if (url.startsWith(allowedPrefix)) {
      const objectPath = url.slice(allowedPrefix.length);
      return !objectPath.startsWith(`${vehicleId}/`) || objectPath.split('/').some((part) => !part || part === '.' || part === '..');
    }
    if (url.startsWith(legacyPrefix)) {
      const legacyPath = url.slice(legacyPrefix.length);
      return /[?#]/.test(legacyPath) || legacyPath.split('/').some((part) => !part || part === '.' || part === '..');
    }
    return true;
  })) {
    throw new Error('Las imágenes deben ser únicas y pertenecer a este vehículo o al archivo histórico autorizado.');
  }
  const { data: vehicle, error: readError } = await supabase.from('vehicles').select('id').eq('id', vehicleId).maybeSingle();
  if (readError || !vehicle) throw new Error('No se encontró el vehículo.');
  const { error } = await supabase.from('vehicles').update({ image_urls: imageUrls }).eq('id', vehicleId);
  if (error) throw new Error('No se pudieron guardar las imágenes.');
  revalidatePath('/admin');
  revalidatePath('/autos');
  revalidatePath('/sitemap.xml');
}

export async function updateVehicle(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const make = String(formData.get('make') || '').trim();
  const model = String(formData.get('model') || '').trim();
  const year = Number(formData.get('year'));
  if (!id || !title || title.length > 120 || !make || make.length > 80 || !model || model.length > 80 || !Number.isInteger(year) || year < 1950 || year > 2100) {
    throw new Error('Completá título, marca, modelo y año válido. El título admite hasta 120 caracteres.');
  }
  const { data: updatedVehicle, error } = await supabase.from('vehicles').update({
    title, make, model, year,
    price_text: optionalText(formData, 'price', 80),
    trade_in_price_text: optionalText(formData, 'trade_in_price', 80),
    mileage_text: optionalText(formData, 'mileage', 80),
    body_type: optionalText(formData, 'body_type', 80),
    fuel: optionalText(formData, 'fuel', 80),
    transmission: optionalText(formData, 'transmission', 80),
    description: optionalText(formData, 'description', 5000),
    features: String(formData.get('features') || '').split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 40),
  }).eq('id', id).select('id').maybeSingle();
  if (error) throw new Error('No se pudo actualizar. Revisá si ya existe otra ficha con ese título.');
  if (!updatedVehicle) throw new Error('No se aplicaron cambios. Actualizá el inventario y verificá que el vehículo siga disponible para editar.');
  revalidatePath('/admin');
  revalidatePath('/autos');
  revalidatePath('/sitemap.xml');
  redirect('/admin');
}

export async function removeVehicleImage(vehicleId: string, imageUrl: string) {
  const supabase = await requireAdmin();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl || !vehicleId || typeof imageUrl !== 'string') {
    throw new Error('Datos de imagen no válidos.');
  }
  const prefix = `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/vehicle-images/`;
  const legacyPrefix = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/';
  const isStorageImage = imageUrl.startsWith(prefix);
  const isLegacyImage = imageUrl.startsWith(legacyPrefix);
  if (!isStorageImage && !isLegacyImage) throw new Error('La imagen no pertenece al almacenamiento autorizado.');
  const objectPath = isStorageImage ? imageUrl.slice(prefix.length) : '';
  if (isStorageImage && (!objectPath.startsWith(`${vehicleId}/`) || objectPath.split('/').some((part) => !part || part === '.' || part === '..'))) {
    throw new Error('La imagen no pertenece a este vehículo.');
  }
  if (isLegacyImage) {
    const legacyPath = imageUrl.slice(legacyPrefix.length);
    if (/[?#]/.test(legacyPath) || legacyPath.split('/').some((part) => !part || part === '.' || part === '..')) {
      throw new Error('La ruta de la imagen histórica no es válida.');
    }
  }

  const { data: vehicle, error: readError } = await supabase
    .from('vehicles').select('image_urls,slug').eq('id', vehicleId).maybeSingle();
  if (readError || !vehicle) throw new Error('No se encontró el vehículo.');
  const currentUrls = Array.isArray(vehicle.image_urls) ? vehicle.image_urls as string[] : [];
  if (!currentUrls.includes(imageUrl)) throw new Error('La imagen ya no está en la ficha.');
  const nextUrls = currentUrls.filter((url) => url !== imageUrl);
  const { error: updateError } = await supabase.from('vehicles').update({ image_urls: nextUrls }).eq('id', vehicleId);
  if (updateError) throw new Error('No se pudo quitar la imagen de la ficha.');

  const { error: storageError } = isStorageImage
    ? await supabase.storage.from('vehicle-images').remove([objectPath])
    : { error: null };
  revalidatePath('/admin');
  revalidatePath('/autos');
  revalidatePath(`/autos/${vehicle.slug}`);
  revalidatePath('/sitemap.xml');
  return { removedFromStorage: isStorageImage && !storageError, removedFromListOnly: isLegacyImage };
}
