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
  return { title: vehicle.title, description: `Consultá por ${vehicle.title} en 3020 Automotores. Confirmá disponibilidad, precios y condiciones con el equipo comercial.`, alternates: { canonical }, openGraph: { title: vehicle.title, description: `Consultá por ${vehicle.title} en 3020 Automotores.`, url: canonical, images: vehicle.image_urls?.[0] ? [vehicle.image_urls[0]] : [], type: 'website' } };
}

function splitDescription(description: string | null) {
  return (description || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicles = await getPublishedVehicles();
  const vehicle = vehicles.find((item) => item.slug === slug);
  if (!vehicle) notFound();
  const specs = [['Marca', vehicle.make || 'Consultar'], ['Modelo', vehicle.model || 'Consultar'], ['Año', String(vehicle.year)], ['Kilometraje', vehicle.mileage_text || 'Consultar'], ['Tipo de vehículo', vehicle.body_type || 'Consultar'], ['Combustible', vehicle.fuel || 'Consultar'], ['Transmisión', vehicle.transmission || 'Consultar']];
  const descriptionLines = splitDescription(vehicle.description);
  const whatsappUrl = getWhatsAppUrl('Hola, quiero consultar por ' + vehicle.title + '. ¿Me confirman disponibilidad, precio de contado y precio de permuta?');
  return <main className="detail"><div className="wrap">
    <p><Link className="text-link" href="/autos">← Volver al catálogo</Link></p>
    <div className="detail-layout"><VehicleGallery title={vehicle.title} imageUrls={vehicle.image_urls || []} /><div>
      <span className="tag">Consultar disponibilidad</span><h1>{vehicle.title}</h1>
      {vehicle.price_text && <p><strong>Precio de contado / anticipo:</strong> {vehicle.price_text}</p>}
      {vehicle.trade_in_price_text && <p><strong>Precio de permuta:</strong> {vehicle.trade_in_price_text}</p>}
      <p className="muted">Consultá al equipo para confirmar disponibilidad y condiciones comerciales vigentes.</p>
      <h2>Características técnicas</h2><div className="spec-list">{specs.map(([label, value]) => <div className="spec-item" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      {descriptionLines.length > 0 && <section className="vehicle-description"><h2>Descripción y condiciones comerciales</h2><div>{descriptionLines.map((line, index) => <p key={index} style={{ lineHeight: 1.7, margin: '0 0 8px' }}>{line}</p>)}</div></section>}
      {vehicle.features?.length > 0 && <section className="vehicle-features"><h2>Otras características</h2><ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px 20px', paddingLeft: 18 }}>{vehicle.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}
      {whatsappUrl ? <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp</a> : <p className="notice">El canal de WhatsApp estará disponible cuando se configure el número oficial de contacto.</p>}
    </div></div>
  </div></main>;
}
