import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedVehicles } from '@/lib/inventory';
import { getWhatsAppUrl } from '@/lib/contact';
import VehicleGallery from './VehicleGallery';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicles = await getPublishedVehicles();
  const vehicle = vehicles.find((item) => item.slug === slug);
  if (!vehicle) return { title: 'Vehículo no disponible', robots: { index: false, follow: true } };
  const canonical = `/autos/${encodeURIComponent(vehicle.slug)}`;
  return {
    title: vehicle.title,
    description: `Consultá por ${vehicle.title} en 3020 Automotores. Confirmá disponibilidad, precio y condiciones con el equipo comercial.`,
    alternates: { canonical },
    openGraph: {
      title: vehicle.title,
      description: `Consultá por ${vehicle.title} en 3020 Automotores.`,
      url: canonical,
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
  const whatsappUrl=getWhatsAppUrl('Hola, quiero consultar por '+vehicle.title+'. ¿Me confirman disponibilidad y precio actualizado?');
  return <main className="detail"><div className="wrap"><p><Link className="text-link" href="/autos">← Volver al catálogo</Link></p><div className="detail-layout"><VehicleGallery title={vehicle.title} imageUrls={vehicle.image_urls || []} /><div><span className="tag">Consultar disponibilidad</span><h1>{vehicle.title}</h1>{vehicle.price_text&&<h2>{vehicle.price_text}</h2>}<p className="muted">Consultá al equipo para confirmar disponibilidad y condiciones.</p><div className="spec-list">{specs.map(([label,value])=><div className="spec-item" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>{vehicle.description&&<p style={{lineHeight:1.7}}>{vehicle.description}</p>}{whatsappUrl?<a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>:<p className="notice">El canal de WhatsApp estará disponible cuando se configure el número oficial de contacto.</p>}</div></div></div></main>;
}
