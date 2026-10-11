'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicVehicle } from '@/lib/inventory';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
}

const FALLBACK_BLUE_DOLLAR_SELL_RATE = 1540;

function comparablePrice(value: string | null, blueDollarRate: number) {
  if (!value) return null;
  const amountText = value.replace(/[^0-9]/g, '');
  if (!amountText) return null;
  const amount = Number(amountText);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const isUsd = /U\$D|USD|US\$/i.test(value);
  return isUsd ? amount * blueDollarRate : amount;
}

export default function VehicleCatalog({ vehicles, initialMake = '' }: { vehicles: PublicVehicle[]; initialMake?: string }) {
  const [query, setQuery] = useState(initialMake);
  const [make, setMake] = useState('Todas');
  const [body, setBody] = useState('Todos');
  const [year, setYear] = useState('Todos');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('recent');
  const [blueDollarRate, setBlueDollarRate] = useState(FALLBACK_BLUE_DOLLAR_SELL_RATE);
  const [blueRateUpdatedAt, setBlueRateUpdatedAt] = useState<string | null>(null);
  const [blueRateLoaded, setBlueRateLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const refreshBlueDollarRate = async () => {
      try {
        const response = await fetch('/api/dolar-blue', { cache: 'no-store' });
        if (!response.ok) return;
        const quote: { venta?: number; fechaActualizacion?: string | null } = await response.json();
        if (!active || typeof quote.venta !== 'number' || !Number.isFinite(quote.venta) || quote.venta <= 0) return;
        setBlueDollarRate(quote.venta);
        setBlueRateUpdatedAt(quote.fechaActualizacion ?? null);
        setBlueRateLoaded(true);
      } catch {
        // Se conserva el valor de referencia hasta que vuelva a estar disponible la cotización.
      }
    };
    void refreshBlueDollarRate();
    const intervalId = window.setInterval(() => void refreshBlueDollarRate(), 30 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const makes = useMemo(() => Array.from(new Set(vehicles.map((v) => v.make).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')), [vehicles]);
  const types = useMemo(() => Array.from(new Set(vehicles.map((v) => v.body_type).filter((v): v is string => Boolean(v))).sort((a, b) => a.localeCompare(b, 'es')), [vehicles]);
  const years = useMemo(() => Array.from(new Set(vehicles.map((v) => v.year))).sort((a, b) => b - a), [vehicles]);

  const results = useMemo(() => {
    const term = normalize(query);
    const lowerBound = minPrice.trim() ? Number(minPrice) : null;
    const upperBound = maxPrice.trim() ? Number(maxPrice) : null;
    const filtered = vehicles.filter((v) => {
      const searchable = normalize([v.title, v.make, v.model, String(v.year), v.body_type || '', v.fuel || '', v.transmission || ''].join(' '));
      const price = comparablePrice(v.price_text, blueDollarRate);
      return (!term || searchable.includes(term))
        && (make === 'Todas' || normalize(v.make) === normalize(make))
        && (body === 'Todos' || v.body_type === body)
        && (year === 'Todos' || String(v.year) === year)
        && (lowerBound === null || (price !== null && price >= lowerBound))
        && (upperBound === null || (price !== null && price <= upperBound));
    });
    return filtered.sort((a, b) => {
      if (sort === 'year-asc') return a.year - b.year || a.title.localeCompare(b.title, 'es');
      if (sort === 'title') return a.title.localeCompare(b.title, 'es');
      if (sort === 'price-asc' || sort === 'price-desc') {
        const priceA = comparablePrice(a.price_text, blueDollarRate);
        const priceB = comparablePrice(b.price_text, blueDollarRate);
        if (priceA === null && priceB === null) return a.title.localeCompare(b.title, 'es');
        if (priceA === null) return 1;
        if (priceB === null) return -1;
        return sort === 'price-asc'
          ? priceA - priceB || a.title.localeCompare(b.title, 'es')
          : priceB - priceA || a.title.localeCompare(b.title, 'es');
      }
      return b.year - a.year || a.title.localeCompare(b.title, 'es');
    });
  }, [vehicles, query, make, body, year, minPrice, maxPrice, sort, blueDollarRate]);

  const clearFilters = () => {
    setQuery('');
    setMake('Todas');
    setBody('Todos');
    setYear('Todos');
    setMinPrice('');
    setMaxPrice('');
    setSort('recent');
  };

  return <>
    <div className="filters">
      <input className="field search-field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar marca, modelo, año o combustible…" aria-label="Buscar vehículos" />
      <select className="field" value={make} onChange={(e) => setMake(e.target.value)} aria-label="Filtrar por marca"><option value="Todas">Todas las marcas</option>{makes.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select className="field" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Filtrar por carrocería"><option value="Todos">Todas las carrocerías</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select className="field" value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filtrar por año"><option value="Todos">Todos los años</option>{years.map((item) => <option key={item} value={String(item)}>{item}</option>)}</select>
      <label className="price-filter"><span>Precio mínimo (ARS)</span><input className="field" type="number" min="0" step="100000" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Sin mínimo" aria-label="Precio mínimo en pesos equivalentes" /></label>
      <label className="price-filter"><span>Precio máximo (ARS)</span><input className="field" type="number" min="0" step="100000" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Sin máximo" aria-label="Precio máximo en pesos equivalentes" /></label>
      <select className="field sort-field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar vehículos"><option value="recent">Ordenar: año más nuevo</option><option value="year-asc">Ordenar: año más antiguo</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="title">Marca y modelo: A–Z</option></select>
    </div>
    <div className="catalog-summary">
      <p className="muted" aria-live="polite">{results.length} {results.length === 1 ? 'vehículo publicado' : 'vehículos publicados'}. Los filtros y el orden de precio comparan importes en pesos; las publicaciones conservan su moneda original.</p>
      <button className="text-link clear-filters" type="button" onClick={clearFilters}>Limpiar filtros</button>
    </div>
    <p className="muted exchange-note">Cotización de referencia para comparar precios en dólares: $ {blueDollarRate.toLocaleString('es-AR')} por USD{blueRateLoaded ? ' (dólar blue vendedor)' : ' (valor de respaldo; cotización en actualización)'}{blueRateUpdatedAt ? ` · Actualizada: ${new Date(blueRateUpdatedAt).toLocaleString('es-AR')}` : ''}. Los precios finales deben confirmarse con el equipo.</p>
    {results.length ? <div className="grid">{results.map((v) => <article className="vehicle-card" key={v.id}><Link href={'/autos/' + v.slug}>{v.image_urls?.[0] ? <img className="vehicle-image" src={v.image_urls[0]} alt={v.title} loading="lazy" /> : <div className="vehicle-image" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>3020 Automotores</div>}<div className="vehicle-body"><span className="tag">Consultar disponibilidad</span><h3>{v.title}</h3><div className="specs"><span>{v.year}</span><span>{v.body_type || 'Consultar'}</span><span>{v.mileage_text || 'Kilometraje a consultar'}</span></div>{v.price_text && <p><strong>{v.price_text}</strong></p>}<span className="text-link">Ver ficha →</span></div></Link></article>)}</div> : <div className="empty"><strong>{vehicles.length ? 'No encontramos vehículos con esos filtros.' : 'Estamos actualizando el catálogo.'}</strong><p>{vehicles.length ? 'Probá cambiar la búsqueda o quitar algún filtro.' : 'En este momento no hay vehículos publicados para mostrar. Consultanos para conocer las opciones disponibles.'}</p>{vehicles.length ? <button className="button secondary" type="button" onClick={clearFilters}>Limpiar filtros</button> : <a className="button" href="/contacto">Contactar al equipo</a>}</div>}
  </>;
}
