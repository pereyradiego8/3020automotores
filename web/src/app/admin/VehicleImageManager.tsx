'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeVehicleImage, saveVehicleImages } from './actions';

export default function VehicleImageManager({ vehicleId, initialUrls }: { vehicleId: string; initialUrls: string[] }) {
  const [urls, setUrls] = useState(initialUrls);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const uploadedPaths: string[] = [];
    try {
      if (urls.length + files.length > 12) throw new Error('Podés guardar hasta 12 fotos por vehículo.');
      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Usá imágenes JPG, PNG o WebP.');
        if (file.size > 8 * 1024 * 1024) throw new Error('Cada foto debe pesar 8 MB o menos.');
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-80);
        const path = `${vehicleId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('vehicle-images').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error('No se pudo subir una foto. Verificá las políticas de Storage.');
        uploadedPaths.push(path);
      }
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!baseUrl) throw new Error('Falta configurar Supabase.');
      const uploadedUrls = uploadedPaths.map((path) => `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/vehicle-images/${path}`);
      const nextUrls = [...urls, ...uploadedUrls];
      await saveVehicleImages(vehicleId, nextUrls);
      setUrls(nextUrls);
      setMessage('Fotos guardadas. La primera foto es la principal.');
    } catch (error) {
      if (uploadedPaths.length) await supabase.storage.from('vehicle-images').remove(uploadedPaths).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : 'No se pudieron subir las fotos.');
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(url: string) {
    if (!window.confirm('¿Querés quitar esta foto del vehículo?')) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await removeVehicleImage(vehicleId, url);
      setUrls((current) => current.filter((item) => item !== url));
      setMessage(result.removedFromListOnly ? 'Foto histórica quitada de la ficha; el archivo original se conserva en el repositorio.' : result.removedFromStorage ? 'Foto quitada y archivo eliminado.' : 'Foto quitada de la ficha; el archivo quedó almacenado y requiere revisión.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo quitar la foto.');
    } finally {
      setBusy(false);
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= urls.length || busy) return;
    const next = [...urls];
    [next[index], next[target]] = [next[target], next[index]];
    setBusy(true);
    setMessage('');
    try {
      await saveVehicleImages(vehicleId, next);
      setUrls(next);
      setMessage('Orden de fotos actualizado. La primera foto se usa como principal.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el orden de fotos.');
    } finally {
      setBusy(false);
    }
  }

  return <section style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
    <p><strong>Fotos ({urls.length}/12)</strong></p>
    {urls.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, marginBottom: 12 }}>
      {urls.map((url, index) => <div key={url} style={{ minWidth: 0 }}>
        <img src={url} alt={`Foto ${index + 1} del vehículo`} style={{ width: '100%', height: 92, objectFit: 'cover', borderRadius: 6 }} />
        <p className="muted" style={{ fontSize: 11, margin: '5px 0' }}>{index === 0 ? 'Foto principal' : `Foto ${index + 1}`}</p>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" className="button secondary" aria-label={`Mover foto ${index + 1} hacia la izquierda`} title="Mover antes" disabled={busy || index === 0} onClick={() => void moveImage(index, -1)} style={{ marginTop: 0, flex: 1, padding: '6px 8px' }}>←</button>
          <button type="button" className="button secondary" aria-label={`Mover foto ${index + 1} hacia la derecha`} title="Mover después" disabled={busy || index === urls.length - 1} onClick={() => void moveImage(index, 1)} style={{ marginTop: 0, flex: 1, padding: '6px 8px' }}>→</button>
          <button type="button" className="button secondary" disabled={busy} onClick={() => void removeImage(url)} style={{ marginTop: 0, flex: 2, padding: '6px 8px', fontSize: 12 }}>Quitar</button>
        </div>
      </div>)}
    </div>}
    <label style={{ display: 'block' }}>Agregar fotos (JPG, PNG o WebP; máximo 8 MB cada una)
      <input className="field" style={{ marginTop: 6 }} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || urls.length >= 12} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ''; }} />
    </label>
    {busy && <p className="muted" role="status">Procesando fotos…</p>}
    {message && <p className="muted" role="status">{message}</p>}
  </section>;
}
