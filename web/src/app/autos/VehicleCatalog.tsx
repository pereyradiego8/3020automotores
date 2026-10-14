'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicVehicle } from '@/lib/inventory';
import { comparableVehiclePrice, isRecentBlueQuote } from '@/lib/pricing';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
}

const QUOTE_CACHE_KEY = '3020-blue-dollar-quote-v1';

export default function VehicleCatalog({ vehicles, initialMake = '' }: { vehicles: PublicVehicle[]; initialMake?: string }) {
  const [query, setQuery] = useState(initialMake);
  const [make, setMake] = useState('Todas');
  const [body, setBody] = useState('Todos');
  const [year, setYear] = useState('Todos');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('recent');
  const [blueDollarRate, setBlueDollarRate] = useState<number | null>(null);
  const [blueRateUpdatedAt, setBlueRateUpdatedAt] = useState<string | null>(null);
  const [blueRateSource, setBlueRateSource] = useState<'live' | 'recent-cache' | 'unavailable'>('unavailable');

  useEffect(() => {
    let active = true;
    // A recent previously verified quote is safer than an arbitrary fixed rate.
    try {
      const saved = window.localStorage.getItem(QUOTE_CACHE_KEY);
      if (saved) {
        const cached: { rate?: number; fetchedAt?: number; updatedAt?: string | null } = JSON.parse(saved);
        if (typeof cached.rate === 'number' && typeof cached.fetchedAt === 'number'
          && isRecentBlueQuote(cached.rate, cached.fetchedAt, Date.now())) {
          setBlueDollarRate(cached.rate);
          setBlueRateUpdatedAt(cached.updatedAt ?? null);
          setBlueRateSource('recent-cache');
        }
      }
    } catch {
      // The catalog still works when storage is blocked or the value is invalid.
    }
    const refreshBlueDollarRate = async () => {
      try {
        const response = await fetch('/api/dolar-blue', { cache: 'no-store' });
        if (!response.ok) return;
        const quote: { venta?: number; fechaActualizacion?: string | null } = await response.json();
        if (!active || typeof quote.venta !== 'number' || !isRecentBlueQuote(quote.venta, Date.now(), Date.now())) return;
        setBlueDollarRate(quote.venta);
        setBlueRateUpdatedAt(quote.fechaActualizacion ?? null);
        setBlueRateSource('live');
        try {
          window.localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify({
            rate: quote.venta, fetchedAt: Date.now(), updatedAt: quote.fechaActualizacion ?? null,
          }));
        } catch {
          // Keep the current quote in memory if persistence is unavailable.
        }
      } catch {
        // If no recent cached quote exists, price comparisons remain disabled.
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
  const types = useMemo(() => Array.from(new Set(vehicles.map((v) => v.body_type).filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b, 'es')), [vehicles]);
  const years = useMemo(() => Array.from(new Set(vehicles.map((v) => v.year))).sort((a, b) => b - a), [vehicles]);

  const results = useMemo(() => {
    const term = normalize(query);
    const lowerBound = minPrice.trim() ? Number(minPrice) : null;
    const upperBound = maxPrice.trim() ? Number(maxPrice) : null;
    const filtered = vehicles.filter((v) => {
      const searchable = normalize([v.title, v.make, v.model, String(v.year), v.body_type || '', v.fuel || '', v.transmission || ''].join(' '));
      const price = comparableVehiclePrice(v.price_text, blueDollarRate);
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
        const priceA = comparableVehiclePrice(a.price_text, blueDollarRate);
        const priceB = comparableVehiclePrice(b.price_text, blueDollarRate);
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

  const invalidPriceRange = minPrice.trim() !== '' && maxPrice.trim() !== '' && Number(minPrice) > Number(maxPrice);

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
      <label className="price-filter"><span>Precio mínimo (ARS)</span><input className="field" type="number" min="0" step="100000" inputMode="numeric" disabled={blueDollarRate === null} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Sin mínimo" aria-label="Precio mínimo en pesos equivalentes" aria-invalid={invalidPriceRange} /></label>
      <label className="price-filter"><span>Precio máximo (ARS)</span><input className="field" type="number" min="0" step="100000" inputMode="numeric" disabled={blueDollarRate === null} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Sin máximo" aria-label="Precio máximo en pesos equivalentes" aria-invalid={invalidPriceRange} /></label>
      <select className="field sort-field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar vehículos"><option value="recent">Ordenar: año más nuevo</option><option value="year-asc">Ordenar: año más antiguo</option><option value="price-asc" disabled={blueDollarRate === null}>Precio: menor a mayor</option><option value="price-desc" disabled={blueDollarRate === null}>Precio: mayor a menor</option><option value="title">Marca y modelo: A–Z</option></select>
    </div>
    {invalidPriceRange && <p className="notice" role="alert">El precio mínimo no puede ser mayor que el precio máximo. Corregí el rango para ver resultados.</p>}
    <div className="catalog-summary">
      <p className="muted" aria-live="polite">{results.length} {results.length === 1 ? 'vehículo publicado' : 'vehículos publicados'}. Los filtros y el orden de precio comparan importes en pesos; las publicaciones conservan su moneda original.</p>
      <button className="text-link clear-filters" type="button" onClick={clearFilters}>Limpiar filtros</button>
    </div>
    <p className="muted exchange-note" role="status">
      {blueDollarRate === null
        ? 'No está disponible la cotización del dólar blue. El ordenamiento y los filtros por precio están deshabilitados temporalmente para evitar comparaciones incorrectas.'
        : `Cotización de referencia: $ ${blueDollarRate.toLocaleString('es-AR')} por USD (${blueRateSource === 'live' ? 'dólar blue vendedor' : 'última cotización válida guardada, de menos de 24 h'})${blueRateUpdatedAt && !Number.isNaN(Date.parse(blueRateUpdatedAt)) ? ` · Actualizada: ${new Date(blueRateUpdatedAt).toLocaleString('es-AR')}` : ''}. Los precios finales deben confirmarse con el equipo.`}
    </p>
    {!invalidPriceRange && results.length ? <div className="grid">{results.map((v) => <article className="vehicle-card" key={v.id}><Link href={'/autos/' + v.slug}>{v.image_urls?.[0] ? <img className="vehicle-image" src={v.image_urls[0]} alt={v.title} loading="lazy" /> : <div className="vehicle-image" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>3020 Automotores</div>}<div className="vehicle-body"><span className="tag">Consultar disponibilidad</span><h3>{v.title}</h3><div className="specs"><span>{v.year}</span><span>{v.body_type || 'Consultar'}</span><span>{v.mileage_text || 'Kilometraje a consultar'}</span></div>{v.price_text && <p><strong>{v.price_text}</strong></p>}<span className="text-link">Ver ficha →</span></div></Link></article>)}</div> : <div className="empty"><strong>{vehicles.length ? 'No encontramos vehículos con esos filtros.' : 'Estamos actualizando el catálogo.'}</strong><p>{vehicles.length ? 'Probá cambiar la búsqueda o quitar algún filtro.' : 'En este momento no hay vehículos publicados para mostrar. Consultanos para conocer las opciones disponibles.'}</p>{vehicles.length ? <button className="button secondary" type="button" onClick={clearFilters}>Limpiar filtros</button> : <a className="button" href="/contacto">Contactar al equipo</a>}</div>}
  </>;
}
