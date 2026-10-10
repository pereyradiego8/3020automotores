import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedVehicles } from '@/lib/inventory';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicles = await getPublishedVehicles();
  const vehicle = vehicles.find((item) => item.slug === slug);
  if (!vehicle) return { title: 'Vehículo no disponible' };
  return {
    title: vehicle.title,
    description: `Consultá por ${vehicle.title} en 3020 Automotores. Confirmá disponibilidad, precio y condiciones con el equipo comercial.`,
    openGraph: {
      title: vehicle.title,
      description: `Consultá por ${vehicle.title} en 3020 Automotores.`,
      images: vehicle.image_urls?.[0] ? [vehicle.image_urls[0]] : [],
      type: 'website',
    },
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}=await params;
  const vehicles=await getPublishedVehicles();
  const vehicle=vehicles.find(item=>item.slug===slug);
  if(!vehicle) notFound();
  const specs=[['Año',String(vehicle.year)],['Kilometraje',vehicle.mileage_text||'Consultar'],['Carrocería',vehicle.body_type||'Consultar'],['Combustible',vehicle.fuel||'Consultar'],['Transmisión',vehicle.transmission||'Consultar']];
  const message=encodeURIComponent('Hola, quiero consultar por '+vehicle.title+'. ¿Me confirman disponibilidad y precio actualizado?');
  return <main className="detail"><div className="wrap"><p><Link className="text-link" href="/autos">← Volver al catálogo</Link></p><div className="detail-layout"><div>{vehicle.image_urls?.[0]?<img className="detail-image" src={vehicle.image_urls[0]} alt={vehicle.title}/>:<div className="detail-image" style={{display:'grid',placeItems:'center',color:'var(--muted)'}}>3020 Automotores</div>}</div><div><span className="tag">Consultar disponibilidad</span><h1>{vehicle.title}</h1>{vehicle.price_text&&<h2>{vehicle.price_text}</h2>}<p className="muted">Consultá al equipo para confirmar disponibilidad y condiciones.</p><div className="spec-list">{specs.map(([label,value])=><div className="spec-item" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>{vehicle.description&&<p style={{lineHeight:1.7}}>{vehicle.description}</p>}<a className="button" href={'https://wa.me/5491137303619?text='+message} target="_blank" rel="noreferrer">Consultar por WhatsApp</a><p className="muted" style={{fontSize:12}}>Verificá el número de contacto antes del lanzamiento.</p></div></div></div></main>;
}
