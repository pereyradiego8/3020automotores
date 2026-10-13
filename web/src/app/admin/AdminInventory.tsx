'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import VehicleImageManager from './VehicleImageManager';
import VehicleStatusForm from './VehicleStatusForm';

type Sale = {
  vehicle_id: string;
  buyer_name: string | null;
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

const statuses = ['all', 'draft', 'published', 'reserved', 'sold'] as const;

export default function AdminInventory({ vehicles, sales }: { vehicles: Vehicle[]; sales: Sale[] }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('all');
  const normalizedSearch = search.trim().toLocaleLowerCase('es-AR');

  const counts = useMemo(() => ({
    all: vehicles.length,
    draft: vehicles.filter((v) => v.status === 'draft').length,
    published: vehicles.filter((v) => v.status === 'published').length,
    reserved: vehicles.filter((v) => v.status === 'reserved').length,
    sold: vehicles.filter((v) => v.status === 'sold').length,
  }), [vehicles]);

  const filtered = useMemo(() => vehicles.filter((v) => {
    const matchesStatus = status === 'all' || v.status === status;
    const searchable = [v.title, v.make, v.model, String(v.year ?? '')].filter(Boolean).join(' ').toLocaleLowerCase('es-AR');
    return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
  }), [vehicles, status, normalizedSearch]);

  return (
    <section aria-label="Administrar inventario">
      <div className="admin-inventory-filters">
        <label>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Buscar vehículo</span>
          <input className="field" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Marca, modelo, año…" aria-label="Buscar por marca, modelo, título o año" />
        </label>
        <label>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Filtrar por estado</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])} aria-label="Filtrar vehículos por estado">
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
            {key === 'all' ? 'Todos' : labels[key]} ({counts[key]})
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
