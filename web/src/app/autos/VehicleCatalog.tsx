'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicVehicle } from '@/lib/inventory';

export default function VehicleCatalog({ vehicles }: { vehicles: PublicVehicle[] }) {
  const [query,setQuery]=useState(''); const [body,setBody]=useState('Todos');
  const types=['Todos',...Array.from(new Set(vehicles.map(v=>v.body_type).filter((v):v is string=>Boolean(v))))];
  const results=useMemo(()=>vehicles.filter(v=>(v.title+' '+v.make+' '+v.model).toLowerCase().includes(query.toLowerCase())&&(body==='Todos'||v.body_type===body)),[vehicles,query,body]);
  return <><div className="filters"><input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por marca o modelo…" aria-label="Buscar vehículos"/><select className="field" value={body} onChange={e=>setBody(e.target.value)} aria-label="Filtrar por tipo"><option value="Todos">Todos los tipos</option>{types.filter(t=>t!=='Todos').map(t=><option key={t} value={t}>{t}</option>)}</select></div><p className="muted">{results.length} {results.length===1?'vehículo publicado':'vehículos publicados'}</p>{results.length?<div className="grid">{results.map(v=><article className="vehicle-card" key={v.id}><Link href={'/autos/'+v.slug}>{v.image_urls?.[0]?<img className="vehicle-image" src={v.image_urls[0]} alt={v.title} loading="lazy"/>:<div className="vehicle-image" style={{display:'grid',placeItems:'center',color:'var(--muted)'}}>3020 Automotores</div>}<div className="vehicle-body"><span className="tag">Disponible para consultar</span><h3>{v.title}</h3><div className="specs"><span>{v.year}</span><span>{v.body_type||'Consultar'}</span><span>{v.mileage_text||'Kilometraje a consultar'}</span></div>{v.price_text&&<p><strong>{v.price_text}</strong></p>}<span className="text-link">Ver ficha →</span></div></Link></article>)}</div>:<div className="empty"><strong>Estamos actualizando el catálogo.</strong><p>En este momento no hay vehículos publicados para mostrar. Consultanos para conocer las opciones disponibles.</p><a className="button" href="/#contacto">Contactar al equipo</a></div>}</>;
}
