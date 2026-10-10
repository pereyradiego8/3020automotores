'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveVehicleImages } from './actions';

export default function VehicleImageManager({ vehicleId, initialUrls }: { vehicleId: string; initialUrls: string[] }) {
  const [urls, setUrls] = useState(initialUrls);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    try {
      if (urls.length + files.length > 12) throw new Error('Podés guardar hasta 12 fotos por vehículo.');
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Usá imágenes JPG, PNG o WebP.');
        }
        if (file.size > 8 * 1024 * 1024) throw new Error('Cada foto debe pesar 8 MB o menos.');
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-80);
        const path = `${vehicleId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('vehicle-images').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error('No se pudo subir una foto. Verificá las políticas de Storage.');
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      const nextUrls = [...urls, ...uploaded];
      await saveVehicleImages(vehicleId, nextUrls);
      setUrls(nextUrls);
      setMessage('Fotos guardadas.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron subir las fotos.');
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(url: string) {
    setBusy(true);
    setMessage('');
    try {
      const nextUrls = urls.filter((item) => item !== url);
      await saveVehicleImages(vehicleId, nextUrls);
      setUrls(nextUrls);
      setMessage('Cambios guardados. El archivo seguirá en almacenamiento hasta que se elimine manualmente.');
    } catch {
      setMessage('No se pudo actualizar la galería.');
    } finally {
      setBusy(false);
    }
  }

  return <section style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
    <p><strong>Fotos ({urls.length}/12)</strong></p>
    {urls.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8, marginBottom: 12 }}>
      {urls.map((url) => <div key={url}>
        <img src={url} alt="Foto del vehículo" style={{ width: '100%', height: 76, objectFit: 'cover', borderRadius: 6 }} />
        <button type="button" className="button secondary" style={{ marginTop: 4, width: '100%', padding: '6px 8px', fontSize: 12 }} disabled={busy} onClick={() => removeImage(url)}>Quitar</button>
      </div>)}
    </div>}
    <label style={{ display: 'block' }}>Agregar fotos (JPG, PNG o WebP; máximo 8 MB cada una)
      <input className="field" style={{ marginTop: 6 }} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || urls.length >= 12} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ''; }} />
    </label>
    {busy && <p className="muted">Procesando fotos…</p>}
    {message && <p className="muted" role="status">{message}</p>}
  </section>;
}
