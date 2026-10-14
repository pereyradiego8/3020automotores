'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setVehicleStatusAndSale } from './actions';

const labels = { draft: 'Borrador', published: 'Publicado', reserved: 'Reservado', sold: 'Vendido' } as const;

export default function SaleStatusControl({
  vehicleId, vehicleTitle, sale,
}: {
  vehicleId: string;
  vehicleTitle: string;
  sale: {
    buyer_name: string | null;
    buyer_document_type: 'DNI' | 'CUIL' | 'CUIT' | null;
    buyer_document_number: string | null;
    vehicle_plate: string | null;
    sale_notes: string | null;
    document_paths: string[] | null;
  } | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<keyof typeof labels>('sold');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function changeStatus() {
    if (busy || !sale) {
      if (!sale) setMessage('No se encontró el registro de venta. Actualizá el inventario antes de cambiar el estado.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await setVehicleStatusAndSale({
        vehicleId, status,
        buyerName: sale.buyer_name ?? '',
        buyerDocumentType: sale.buyer_document_type ?? 'DNI',
        buyerDocumentNumber: sale.buyer_document_number ?? '',
        vehiclePlate: sale.vehicle_plate ?? '',
        saleNotes: sale.sale_notes ?? '',
        documentPaths: sale.document_paths ?? [],
      });
      setConfirm(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cambiar el estado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 250 }}>
      <label>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 5 }}>Cambiar estado de publicación</span>
        <select className="field" value={status} aria-label={'Estado de ' + vehicleTitle} disabled={busy} onChange={(event) => {
          const next = event.target.value as keyof typeof labels;
          setStatus(next);
          if (next !== 'sold') setConfirm(true);
        }}>
          {Object.entries(labels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
        </select>
      </label>
      {message && <p className="muted" role="status" style={{ margin: 0 }}>{message}</p>}
      {confirm && <div role="alertdialog" aria-modal="true" aria-labelledby={'confirm-sale-' + vehicleId} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: 18 }}>
        <section style={{ width: '100%', maxWidth: 480, background: 'var(--surface, white)', color: 'var(--foreground, #171717)', border: '1px solid var(--border)', borderRadius: 12, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
          <h3 id={'confirm-sale-' + vehicleId} style={{ marginTop: 0 }}>¿Cambiar el estado de publicación?</h3>
          <p>Si cambiás de <strong>Vendido</strong> a <strong>{labels[status]}</strong>, se eliminarán permanentemente los datos del comprador, la patente, las notas, el registro de venta y los documentos privados. Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="button secondary" style={{ marginTop: 0 }} disabled={busy} onClick={() => { setConfirm(false); setStatus('sold'); }}>Cancelar</button>
            <button type="button" className="button" style={{ marginTop: 0 }} disabled={busy} onClick={() => void changeStatus()}>{busy ? 'Cambiando…' : 'Sí, eliminar y cambiar estado'}</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
