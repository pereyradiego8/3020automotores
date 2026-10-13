'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setVehicleStatusAndSale } from './actions';

type Sale = {
  buyer_name: string | null;
  buyer_document_type: 'DNI' | 'CUIL' | 'CUIT' | null;
  buyer_document_number: string | null;
  sale_notes: string | null;
  sold_at: string;
  document_paths: string[] | null;
};

const statusLabels = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
} as const;

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const maxFileBytes = 10 * 1024 * 1024;
const maxDocuments = 8;

export default function VehicleStatusForm({
  vehicleId,
  vehicleTitle,
  initialStatus,
  initialSale,
}: {
  vehicleId: string;
  vehicleTitle: string;
  initialStatus: keyof typeof statusLabels;
  initialSale?: Sale | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<keyof typeof statusLabels>(initialStatus);
  const [buyerName, setBuyerName] = useState(initialSale?.buyer_name ?? '');
  const [buyerDocumentType, setBuyerDocumentType] = useState<'DNI' | 'CUIL' | 'CUIT'>(initialSale?.buyer_document_type ?? 'DNI');
  const [buyerDocumentNumber, setBuyerDocumentNumber] = useState(initialSale?.buyer_document_number ?? '');
  const [saleNotes, setSaleNotes] = useState(initialSale?.sale_notes ?? '');
  const [documentPaths, setDocumentPaths] = useState<string[]>(initialSale?.document_paths ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [documentLink, setDocumentLink] = useState<{ path: string; url: string } | null>(null);

  async function prepareDocumentLink(path: string) {
    setDocumentLink(null);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from('vehicle-sale-documents').createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      setMessage('No se pudo generar el acceso al documento. Verificá que sigas conectado como administrador.');
      return;
    }
    setDocumentLink({ path, url: data.signedUrl });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    setDocumentLink(null);
    const supabase = createClient();
    const uploadedPaths: string[] = [];

    try {
      if (status === 'sold') {
        if (documentPaths.length + files.length > maxDocuments) {
          throw new Error('Podés guardar hasta 8 documentos por venta.');
        }
        for (const file of files) {
          if (!acceptedTypes.includes(file.type)) {
            throw new Error('Los documentos deben ser imágenes JPG, PNG, WebP o archivos PDF.');
          }
          if (file.size > maxFileBytes) {
            throw new Error('Cada documento debe pesar 10 MB o menos.');
          }
          const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-90) || 'documento';
          const path = `${vehicleId}/${crypto.randomUUID()}-${safeName}`;
          const { error } = await supabase.storage
            .from('vehicle-sale-documents')
            .upload(path, file, { contentType: file.type, upsert: false });
          if (error) throw new Error('No se pudo subir un documento. Revisá tu sesión y los permisos de Storage.');
          uploadedPaths.push(path);
        }
      }

      const nextPaths = status === 'sold' ? [...documentPaths, ...uploadedPaths] : documentPaths;
      await setVehicleStatusAndSale({
        vehicleId,
        status,
        buyerName,
        buyerDocumentType,
        buyerDocumentNumber,
        saleNotes,
        documentPaths: nextPaths,
      });
      setDocumentPaths(nextPaths);
      setFiles([]);
      if (status !== 'sold') {
        setBuyerName('');
        setBuyerDocumentType('DNI');
        setBuyerDocumentNumber('');
        setSaleNotes('');
        setDocumentPaths([]);
      }
      setMessage(status === 'sold' ? 'Venta y estado guardados correctamente.' : 'Estado actualizado y datos de venta eliminados correctamente.');
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from('vehicle-sale-documents').remove(uploadedPaths).catch(() => undefined);
      }
      setMessage(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
      <label>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>Estado de publicación</span>
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value as keyof typeof statusLabels)} aria-label={'Estado de ' + vehicleTitle} disabled={busy}>
          {Object.entries(statusLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select>
      </label>

      {status === 'sold' && (
        <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'grid', gap: 10 }}>
          <h4 style={{ margin: 0 }}>Datos de la venta (solo administración)</h4>
          <label>
            Comprador / persona a quien se vendió
            <input className="field" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} maxLength={160} placeholder="Nombre del comprador (opcional)" disabled={busy} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, 0.65fr) minmax(150px, 1fr)', gap: 10 }}>
            <label>
              Tipo de documento
              <select className="field" value={buyerDocumentType} onChange={(event) => setBuyerDocumentType(event.target.value as 'DNI' | 'CUIL' | 'CUIT')} disabled={busy}>
                <option value="DNI">DNI</option>
                <option value="CUIL">CUIL</option>
                <option value="CUIT">CUIT</option>
              </select>
            </label>
            <label>
              Número de documento
              <input className="field" value={buyerDocumentNumber} onChange={(event) => setBuyerDocumentNumber(event.target.value)} maxLength={20} placeholder="DNI o CUIL/CUIT" disabled={busy} inputMode="numeric" />
            </label>
          </div>
          <label>
            Notas internas
            <textarea className="field" rows={3} value={saleNotes} onChange={(event) => setSaleNotes(event.target.value)} maxLength={2000} placeholder="Observaciones de la operación (opcional)" disabled={busy} />
          </label>
          <div>
            <strong style={{ fontSize: 13 }}>Documentación ({documentPaths.length}/{maxDocuments})</strong>
            <p className="muted" style={{ fontSize: 12, margin: '4px 0 8px' }}>Imágenes JPG, PNG o WebP y PDF. Máximo 10 MB por archivo. Los archivos son privados.</p>
            {documentPaths.length > 0 && (
              <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>
                {documentPaths.map((path, index) => (
                  <li key={path} style={{ marginBottom: 5, fontSize: 13 }}>
                    Documento {index + 1}{' '}
                    <button type="button" className="text-link" onClick={() => void prepareDocumentLink(path)} disabled={busy} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }}>Generar enlace seguro</button>
                    {documentLink?.path === path && <> · <a className="text-link" href={documentLink.url} target="_blank" rel="noreferrer">Abrir documento</a></>}
                  </li>
                ))}
              </ul>
            )}
            <input
              className="field"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              disabled={busy || documentPaths.length >= maxDocuments}
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                event.currentTarget.value = '';
              }}
            />
            {files.length > 0 && <p className="muted" style={{ fontSize: 12 }}>{files.length} archivo(s) seleccionado(s): {files.map((file) => file.name).join(', ')}</p>}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="button secondary" style={{ marginTop: 0 }} disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar estado'}
        </button>
        {busy && <span className="muted" role="status">Guardando cambios y documentación…</span>}
      </div>
      {message && <p className="muted" role="status" aria-live="polite" style={{ margin: 0 }}>{message}</p>}
    </form>
  );
}
