'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import VehicleImageManager from './VehicleImageManager';
import VehicleStatusForm from './VehicleStatusForm';
import SaleOptionalFieldEditor from './SaleOptionalFieldEditor';
import PrivateSaleDocumentLink from './PrivateSaleDocumentLink';
import { retrySaleDocumentCleanup } from './actions';

type Sale = {
  vehicle_id: string;
  buyer_name: string | null;
  buyer_document_type: 'DNI' | 'CUIL' | 'CUIT' | null;
  buyer_document_number: string | null;
  vehicle_plate: string | null;
  sale_notes: string | null;
  sold_at: string;
  document_paths: string[] | null;
};

type Vehicle = {
  id: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  status: string;
  image_urls: string[] | null;
};

const labels: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
};

const statuses = ['draft', 'published', 'reserved', 'sold'] as const;

export default function AdminInventory({ vehicles, sales, pendingCleanupCount }: { vehicles: Vehicle[]; sales: Sale[]; pendingCleanupCount: number }) {
  const [pendingCleanup, setPendingCleanup] = useState(pendingCleanupCount);
  useEffect(() => setPendingCleanup(pendingCleanupCount), [pendingCleanupCount]);
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number] | 'all'>('published');
  const restoredStatus = useRef(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem('3020-admin-inventory-status');
      if (saved && (saved === 'all' || statuses.includes(saved as (typeof statuses)[number]))) {
        setStatus(saved as (typeof statuses)[number] | 'all');
      }
    } catch {
      // La pestaña predeterminada sigue funcionando si el almacenamiento está bloqueado.
    }
    restoredStatus.current = true;
  }, []);

  useEffect(() => {
    if (!restoredStatus.current) return;
    try {
      window.sessionStorage.setItem('3020-admin-inventory-status', status);
    } catch {
      // La navegación sigue funcionando aunque el almacenamiento esté bloqueado.
    }
  }, [status]);
  const normalizedSearch = search.trim().toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const counts = useMemo(() => ({
    all: vehicles.length,
    draft: vehicles.filter((v) => v.status === 'draft').length,
    published: vehicles.filter((v) => v.status === 'published').length,
    reserved: vehicles.filter((v) => v.status === 'reserved').length,
    sold: vehicles.filter((v) => v.status === 'sold').length,
  }), [vehicles]);

  const filtered = useMemo(() => vehicles.filter((v) => {
    const matchesStatus = status === 'all' || v.status === status;
    const sale = sales.find((item) => item.vehicle_id === v.id);
    const searchable = [v.title, v.make, v.model, String(v.year ?? ''), v.status, labels[v.status], sale?.buyer_name, sale?.buyer_document_type, sale?.buyer_document_number, sale?.buyer_document_number?.replace(/\\D/g, ''), sale?.vehicle_plate, sale?.sale_notes, sale?.sold_at ? new Date(sale.sold_at).toLocaleDateString('es-AR') : '', ...(sale?.document_paths ?? [])].filter(Boolean).join(' ').toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchesSearch = !normalizedSearch || normalizedSearch.split(/\s+/).every((term) => searchable.includes(term));
    return matchesStatus && matchesSearch;
  }), [vehicles, sales, status, normalizedSearch]);

  return (
    <section aria-label="Administrar inventario">
      {pendingCleanup > 0 && (
        <div className="notice" role="status" aria-live="polite">
          <strong>Documentación privada pendiente de eliminar: {pendingCleanup} archivo(s).</strong>
          <p>El cambio de estado ya se guardó. Si hubo un error al borrar los archivos, podés volver a intentar la limpieza sin modificar las ventas.</p>
          <button type="button" className="button secondary" disabled={cleanupBusy} onClick={async () => {
            setCleanupBusy(true);
            setCleanupMessage('');
            try {
              const result = await retrySaleDocumentCleanup();
              setPendingCleanup(result.pending);
              setCleanupMessage(result.pending
                ? `Se eliminaron ${result.removed} archivo(s); quedan ${result.pending} pendientes.`
                : 'La limpieza de documentos privados se completó.');
            } catch {
              setCleanupMessage('No se pudo completar la limpieza. Volvé a intentar más tarde.');
            } finally {
              setCleanupBusy(false);
            }
          }}>{cleanupBusy ? 'Limpiando documentos…' : 'Reintentar limpieza documental'}</button>
          {cleanupMessage && <p className="muted">{cleanupMessage}</p>}
        </div>
      )}
      <div className="admin-inventory-filters">
        <label>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Buscar en inventario y ventas</span>
          <input className="field" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre del auto, comprador, documento, notas…" aria-label="Buscar en todos los datos de vehículos y ventas" />
        </label>
        <label>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Filtrar por estado</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number] | 'all')} aria-label="Filtrar vehículos por estado">
            <option value="all">Todos los estados</option>
            <option value="draft">Borradores</option>
            <option value="published">Publicados</option>
            <option value="reserved">Reservados</option>
            <option value="sold">Vendidos</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }} aria-label="Resumen del inventario">
        {statuses.map((key) => (
          <button key={key} type="button" className={status === key ? 'button' : 'button secondary'} onClick={() => setStatus(key)} aria-pressed={status === key} style={{ marginTop: 0, padding: '9px 12px', fontSize: 12 }}>
            {labels[key]} ({counts[key]})
          </button>
        ))}
      </div>

      <p className="muted" aria-live="polite" style={{ fontSize: 13 }}>
        {filtered.length === vehicles.length
          ? `Mostrando ${filtered.length} vehículos.`
          : `Mostrando ${filtered.length} de ${vehicles.length} vehículos.`}
      </p>

      {filtered.length === 0 ? (
        <div className="empty">
          <strong>No encontramos vehículos con esos criterios.</strong>
          <p>Probá con otra búsqueda o limpiá los filtros.</p>
          <button type="button" className="button secondary" onClick={() => { setSearch(''); setStatus('all'); }} style={{ marginTop: 0 }}>Limpiar búsqueda y filtros</button>
        </div>
      ) : status === 'sold' ? (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', minWidth: 1050, borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr>
                {['Vehículo', 'Fecha de venta', 'Comprador', 'Tipo de documento', 'N.º de documento', 'Patente', 'Notas', 'Documentación'].map((heading) => (
                  <th key={heading} scope="col" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', whiteSpace: 'nowrap' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const sale = sales.find((item) => item.vehicle_id === v.id);
                return (
                  <tr key={v.id}>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      <strong>{v.title}</strong>
                      <div className="muted">{[v.make, v.model, v.year].filter(Boolean).join(' · ')}</div>
                      <div style={{ marginTop: 8 }}><VehicleStatusForm vehicleId={v.id} vehicleTitle={v.title} initialStatus="sold" initialSale={sale ?? null} /></div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{sale?.sold_at ? new Date(sale.sold_at).toLocaleDateString('es-AR') : '—'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>{sale?.buyer_name || '—'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>{sale?.buyer_document_type || '—'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{sale?.buyer_document_number || '—'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{sale?.vehicle_plate || '—'}<div style={{ marginTop: 6 }}><SaleOptionalFieldEditor vehicleId={v.id} sale={sale ?? null} field="plate" /></div></td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'pre-wrap', maxWidth: 260 }}>{sale?.sale_notes || '—'}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                      {sale?.document_paths?.length ? (
                        <div style={{ display: 'grid', gap: 5 }}>
                          {sale.document_paths.map((path, index) => (
                            <PrivateSaleDocumentLink key={path} path={path} number={index + 1} />
                          ))}
                        </div>
                      ) : <span className="muted">Sin archivos</span>}
                                          </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((v) => (
            <article className="vehicle-card" key={v.id} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="tag">{labels[v.status] || v.status}</span>
                <span className="muted" style={{ fontSize: 12 }}>{v.image_urls?.length || 0} fotos</span>
              </div>
              <h3>{v.title}</h3>
              <p><Link className="text-link" href={'/admin/editar/' + v.id}>Editar datos →</Link></p>
              <p className="muted">{v.make} {v.model} · {v.year}</p>
              <VehicleStatusForm
                vehicleId={v.id}
                vehicleTitle={v.title}
                initialStatus={v.status as 'draft' | 'published' | 'reserved' | 'sold'}
                initialSale={sales.find((sale) => sale.vehicle_id === v.id) ?? null}
              />
              <VehicleImageManager vehicleId={v.id} initialUrls={v.image_urls || []} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
