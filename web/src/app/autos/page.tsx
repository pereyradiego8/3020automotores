'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { vehicles, historicalImage, vehicleSlug } from '@/lib/catalog';

export default function AutosPage() {
  const [query, setQuery] = useState('');
  const [body, setBody] = useState('Todos');
  const bodyTypes = ['Todos', ...Array.from(new Set(vehicles.map(v => v.body_type).filter(Boolean)))];
  const results = useMemo(() => vehicles.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) && (body === 'Todos' || v.body_type === body)), [query, body]);
  return <main className="section"><div className="wrap"><span className="eyebrow" style={{color:'var(--accent)'}}>Catálogo</span><h1 className="page-title">Vehículos</h1><p className="muted">Explorá las fichas y consultá por el modelo que te interesa.</p><div className="notice">Las fichas disponibles provienen de un catálogo histórico. Ningún precio ni disponibilidad se considera vigente hasta ser confirmado por 3020 Automotores.</div><div className="filters"><input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por marca o modelo…" aria-label="Buscar vehículos"/><select className="field" value={body} onChange={e=>setBody(e.target.value)} aria-label="Filtrar por tipo"><option value="Todos">Todos los tipos</option>{bodyTypes.filter(t=>t!=='Todos').map(t=><option key={t} value={t}>{t}</option>)}</select></div><p className="muted">{results.length} {results.length===1?'ficha encontrada':'fichas encontradas'}</p>{results.length ? <div className="grid">{results.map(vehicle=><article className="vehicle-card" key={vehicleSlug(vehicle)}><Link href={'/autos/'+vehicleSlug(vehicle)}><img className="vehicle-image" src={historicalImage(vehicle)} alt={vehicle.title} loading="lazy"/><div className="vehicle-body"><span className="tag">Stock a confirmar</span><h3>{vehicle.title}</h3><div className="specs"><span>{vehicle.year}</span><span>{vehicle.body_type}</span><span>{vehicle.legacy_mileage}</span></div><span className="text-link">Ver ficha →</span></div></Link></article>)}</div> : <div className="empty">No encontramos vehículos con esos criterios. Probá otra búsqueda.</div>}</div></main>;
}
