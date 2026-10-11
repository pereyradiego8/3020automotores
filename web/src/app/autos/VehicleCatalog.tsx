'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicVehicle } from '@/lib/inventory';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
}

const BLUE_DOLLAR_SELL_RATE = 1540; // ARS por USD; cotización de venta blue consultada el 10/10/2026.

function comparablePrice(value: string | null) {
  if (!value) return null;
  const amountText = value.replace(/[^0-9]/g, '');
  if (!amountText) return null;
  const amount = Number(amountText);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const isUsd = /U\$D|USD|US\$/i.test(value);
  return isUsd ? amount * BLUE_DOLLAR_SELL_RATE : amount;
}
export default function VehicleCatalog({ vehicles, initialMake = '' }: { vehicles: PublicVehicle[]; initialMake?: string }) {
  const [query, setQuery] = useState(initialMake);
  const [body, setBody] = useState('Todos');
  const [year, setYear] = useState('Todos');
  const [sort, setSort] = useState('recent');

  const types = useMemo(() => ['Todos', ...Array.from(new Set(vehicles.map((v) => v.body_type).filter((v): v is string => Boolean(v))).values()).sort((a, b) => a.localeCompare(b, 'es'))], [vehicles]);
  const years = useMemo(() => Array.from(new Set(vehicles.map((v) => v.year))).sort((a, b) => b - a), [vehicles]);
  const results = useMemo(() => {
    const term = normalize(query);
    const filtered = vehicles.filter((v) => {
      const searchable = normalize([v.title, v.make, v.model, String(v.year), v.body_type || '', v.fuel || '', v.transmission || ''].join(' '));
      return (!term || searchable.includes(term)) && (body === 'Todos' || v.body_type === body) && (year === 'Todos' || String(v.year) === year);
    });
    return filtered.sort((a, b) => {
      if (sort === 'year-asc') return a.year - b.year || a.title.localeCompare(b.title, 'es');
      if (sort === 'title') return a.title.localeCompare(b.title, 'es');
      if (sort === 'price-asc' || sort === 'price-desc') {
        const priceA = comparablePrice(a.price_text);
        const priceB = comparablePrice(b.price_text);
        // Pesos y dólares se comparan en ARS, usando dólar blue vendedor.
        if (priceA === null && priceB === null) return a.title.localeCompare(b.title, 'es');
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return sort === 'price-asc'
          ? priceA - priceB || a.title.localeCompare(b.title, 'es')
          : priceB - priceA || a.title.localeCompare(b.title, 'es');
      }
      return b.year - a.year || a.title.localeCompare(b.title, 'es');
    });
  }, [vehicles, query, body, year, sort]);

  return <>
    <div className="filters">
      <input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar marca, modelo, año o combustible…" aria-label="Buscar vehículos" />
      <select className="field" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Filtrar por carrocería"><option value="Todos">Todas las carrocerías</option>{types.filter((t) => t !== 'Todos').map((t) => <option key={t} value={t}>{t}</option>)}</select>
      <select className="field" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filtrar por año"><option value="Todos">Todos los años</option>{years.map((y) => <option key={y} value={String(y)}>{y}</option>)}</select>
      <select className="field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar vehículos"><option value="recent">Año: más nuevo primero</option><option value="year-asc">Año: más antiguo primero</option><option value="price-asc">Precio: menor a mayor (dólar blue)</option><option value="price-desc">Precio: mayor a menor (dólar blue)</option><option value="title">Marca y modelo: A–Z</option></select>
    </div>
    <div className="filters price-sort-controls" aria-label="Ordenamiento por precio">
      <span className="muted">Ordenar por precio:</span>
      <button className={sort === 'price-asc' ? 'button' : 'button secondary'} type="button" aria-pressed={sort === 'price-asc'} onClick={() => setSort('price-asc')}>Menor a mayor ↑</button>
      <button className={sort === 'price-desc' ? 'button' : 'button secondary'} type="button" aria-pressed={sort === 'price-desc'} onClick={() => setSort('price-desc')}>Mayor a menor ↓</button>
    </div>
    <p className="muted" aria-live="polite">{results.length} {results.length === 1 ? 'vehículo publicado' : 'vehículos publicados'} · Precios en USD convertidos a pesos al dólar blue vendedor ($ {BLUE_DOLLAR_SELL_RATE.toLocaleString('es-AR')} por USD).</p>
    {results.length ? <div className="grid">{results.map((v) => <article className="vehicle-card" key={v.id}><Link href={'/autos/' + v.slug}>{v.image_urls?.[0] ? <img className="vehicle-image" src={v.image_urls[0]} alt={v.title} loading="lazy" /> : <div className="vehicle-image" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>3020 Automotores</div>}<div className="vehicle-body"><span className="tag">Disponible para consultar</span><h3>{v.title}</h3><div className="specs"><span>{v.year}</span><span>{v.body_type || 'Consultar'}</span><span>{v.mileage_text || 'Kilometraje a consultar'}</span></div>{v.price_text && <p><strong>{v.price_text}</strong></p>}<span className="text-link">Ver ficha →</span></div></Link></article>)}</div> : <div className="empty"><strong>{vehicles.length ? 'No encontramos vehículos con esos filtros.' : 'Estamos actualizando el catálogo.'}</strong><p>{vehicles.length ? 'Probá cambiar la búsqueda o quitar algún filtro.' : 'En este momento no hay vehículos publicados para mostrar. Consultanos para conocer las opciones disponibles.'}</p>{vehicles.length ? <button className="button secondary" type="button" onClick={() => { setQuery(''); setBody('Todos'); setYear('Todos'); setSort('recent'); }}>Limpiar filtros</button> : <a className="button" href="/#contacto">Contactar al equipo</a>}</div>}
  </>;
}
