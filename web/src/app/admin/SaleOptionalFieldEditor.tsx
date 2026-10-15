'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setVehicleStatusAndSale } from './actions';

type Sale = {
  buyer_name: string | null;
  buyer_document_type: 'DNI' | 'CUIL' | 'CUIT' | null;
  buyer_document_number: string | null;
  vehicle_plate: string | null;
  sale_notes: string | null;
  document_paths: string[] | null;
};

type Field = 'plate' | 'notes' | 'documents';

const fieldCopy = {
  plate: { title: 'Patente', action: 'Agregar patente', save: 'Guardar patente' },
  notes: { title: 'Notas internas', action: 'Agregar notas', save: 'Guardar notas' },
  documents: { title: 'Documentación', action: 'Agregar documentación', save: 'Guardar documentación' },
} as const;

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const maxFileBytes = 10 * 1024 * 1024;
const maxDocuments = 8;

export default function SaleOptionalFieldEditor({
  vehicleId,
  sale,
  field,
}: {
  vehicleId: string;
  sale: Sale | null;
  field: Field;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState(sale?.vehicle_plate ?? '');
  const [notes, setNotes] = useState(sale?.sale_notes ?? '');
  const [paths, setPaths] = useState<string[]>(sale?.document_paths ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const uploaded: string[] = [];
    try {
      if (field === 'plate' && plate.trim().length > 12) throw new Error('La patente admite hasta 12 caracteres.');
      if (field === 'notes' && notes.trim().length > 2000) throw new Error('Las notas admiten hasta 2000 caracteres.');
      if (paths.length + files.length > maxDocuments) throw new Error('Podés guardar hasta 8 documentos por venta.');
      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) throw new Error('Los documentos deben ser imágenes JPG, PNG, WebP o archivos PDF.');
        if (file.size > maxFileBytes) throw new Error('Cada documento debe pesar 10 MB o menos.');
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-90) || 'documento';
        const path = `${vehicleId}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from('vehicle-sale-documents').upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error('No se pudo subir un documento. Revisá tu sesión y los permisos de Storage.');
        uploaded.push(path);
      }
      const nextPaths = field === 'documents' ? [...paths, ...uploaded] : paths;
      await setVehicleStatusAndSale({
        vehicleId,
        status: 'sold',
        buyerName: sale?.buyer_name ?? '',
        buyerDocumentType: sale?.buyer_document_type ?? 'DNI',
        buyerDocumentNumber: sale?.buyer_document_number ?? '',
        vehiclePlate: field === 'plate' ? plate : sale?.vehicle_plate ?? '',
        saleNotes: field === 'notes' ? notes : sale?.sale_notes ?? '',
        documentPaths: nextPaths,
      });
      setPaths(nextPaths);
      setFiles([]);
      setMessage('Información guardada correctamente.');
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (uploaded.length) await supabase.storage.from('vehicle-sale-documents').remove(uploaded).catch(() => undefined);
      setMessage(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setBusy(false);
    }
  }

  const value = field === 'plate' ? sale?.vehicle_plate : field === 'notes' ? sale?.sale_notes : null;
  const hasValue = field === 'documents' ? Boolean(paths.length) : Boolean(value?.trim());

  return (
    <>
      <button type="button" className="text-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => { setMessage(''); setOpen(true); }}>
        {hasValue ? (field === 'documents' ? `Editar (${paths.length})` : 'Editar') : `+ ${fieldCopy[field].action}`}
      </button>
      {open && (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.58)', display: 'grid', placeItems: 'center', padding: 16, overflowY: 'auto' }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`sale-field-${field}-title`} style={{ width: '100%', maxWidth: 500, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', background: 'var(--surface, white)', color: 'var(--foreground, #171717)', border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(16px, 3vw, 22px)', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <h3 id={`sale-field-${field}-title`} style={{ marginTop: 0 }}>{fieldCopy[field].title}</h3>
            <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
              {field === 'plate' && <label><input autoFocus className="field" value={plate} onChange={(event) => setPlate(event.target.value)} maxLength={12} placeholder="Ej.: AB 123 CD" disabled={busy} /></label>}
              {field === 'notes' && <label>Notas internas<textarea autoFocus className="field" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} placeholder="Observaciones de la operación (opcional)" disabled={busy} /></label>}
              {field === 'documents' && <>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Imágenes JPG, PNG o WebP y PDF. Máximo 10 MB por archivo, hasta 8 documentos. Los archivos son privados.</p>
                {paths.length > 0 && <ul style={{ margin: 0, paddingLeft: 20 }}>{paths.map((path, index) => <li key={path}>Documento {index + 1}</li>)}</ul>}
                <input autoFocus className="field" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy || paths.length >= maxDocuments} onChange={(event) => { setFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ''; }} />
                {files.length > 0 && <p className="muted" style={{ fontSize: 12, margin: 0 }}>{files.length} archivo(s): {files.map((file) => file.name).join(', ')}</p>}
              </>}
              {message && <p role="status" aria-live="polite" className="muted" style={{ margin: 0 }}>{message}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="button secondary" style={{ marginTop: 0 }} onClick={() => setOpen(false)} disabled={busy}>Cancelar</button>
                <button className="button" style={{ marginTop: 0 }} disabled={busy}>{busy ? 'Guardando…' : fieldCopy[field].save}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
