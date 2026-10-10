import Link from 'next/link';
import { notFound } from 'next/navigation';
import { vehicles, historicalImage, vehicleSlug } from '@/lib/catalog';

export function generateStaticParams() { return vehicles.map(vehicle => ({ slug: vehicleSlug(vehicle) })); }
export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = vehicles.find(item => vehicleSlug(item) === slug);
  if (!vehicle) notFound();
  const specs = [['Año', vehicle.year], ['Kilometraje histórico', vehicle.legacy_mileage], ['Carrocería', vehicle.body_type], ['Combustible', vehicle.fuel], ['Motor', vehicle.engine], ['Transmisión', vehicle.transmission], ['Puertas', vehicle.doors]];
  const message = encodeURIComponent('Hola, quiero consultar por el modelo ' + vehicle.title + '. ¿Me confirman disponibilidad y precio actualizado?');
  return <main className="detail"><div className="wrap"><p><Link className="text-link" href="/autos">← Volver al catálogo</Link></p><div className="detail-layout"><div><img className="detail-image" src={historicalImage(vehicle)} alt={vehicle.title}/></div><div><span className="tag">Información histórica · confirmar</span><h1>{vehicle.title}</h1><p className="muted">Consultá al equipo para confirmar stock, precio y condiciones actuales.</p><div className="notice">El precio y la disponibilidad de esta ficha no están verificados. No tomes los datos históricos como una oferta vigente.</div><div className="spec-list">{specs.map(([label,value])=><div className="spec-item" key={label}><small>{label}</small><strong>{value || 'A confirmar'}</strong></div>)}</div><a className="button" href={'https://wa.me/5491137303619?text='+message} target="_blank" rel="noreferrer">Consultar por WhatsApp</a><p className="muted" style={{fontSize:12}}>Contacto heredado de la web anterior; verificar antes de lanzar.</p></div></div></div></main>;
}
