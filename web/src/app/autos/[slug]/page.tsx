import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedVehicleBySlug } from '@/lib/inventory';
import { getWhatsAppUrl } from '@/lib/contact';
import VehicleGallery from './VehicleGallery';
import PageHero from '@/components/PageHero';
import { serializeStructuredData, vehicleStructuredData } from '@/lib/vehicle-seo';
import ContactLink from '@/components/ContactLink';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getPublishedVehicleBySlug(slug);
  if (!vehicle) return { title: 'Vehículo no disponible', robots: { index: false, follow: true } };
  const canonical = `/autos/${encodeURIComponent(vehicle.slug)}`;
  return { title: vehicle.title, description: `Consultá por ${vehicle.title} en 3020 Automotores. Confirmá disponibilidad, precios y condiciones con el equipo comercial.`, alternates: { canonical }, openGraph: { title: vehicle.title, description: `Consultá por ${vehicle.title} en 3020 Automotores.`, url: canonical, images: vehicle.image_urls?.[0] ? [vehicle.image_urls[0]] : [], type: 'website' } };
}

function splitDescription(description: string | null) {
  return (description || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getPublishedVehicleBySlug(slug);
  if (!vehicle) notFound();
  const specs = [['Marca', vehicle.make || 'Consultar'], ['Modelo', vehicle.model || 'Consultar'], ['Año', String(vehicle.year)], ['Kilometraje', vehicle.mileage_text || 'Consultar'], ['Tipo de vehículo', vehicle.body_type || 'Consultar'], ['Combustible', vehicle.fuel || 'Consultar'], ['Transmisión', vehicle.transmission || 'Consultar']];
  const descriptionLines = splitDescription(vehicle.description);
  const whatsappUrl = getWhatsAppUrl('Hola, quiero consultar por ' + vehicle.title + '. ¿Me confirman disponibilidad y precio actual?');
  const permutaUrl = getWhatsAppUrl('Hola, ¿reciben mi vehículo en permuta por ' + vehicle.title + '?');
  const financingUrl = getWhatsAppUrl('Hola, quiero consultar si ofrecen opciones de financiación para ' + vehicle.title + '.');
  const structuredData = vehicleStructuredData(vehicle);
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />
      <PageHero
        compact
        eyebrow="Catálogo · Ficha del vehículo"
        title={vehicle.title}
        description="Conocé las características de esta unidad y consultá las condiciones comerciales vigentes."
      >
        <Link className="page-hero-back" href="/autos">← Volver al catálogo</Link>
      </PageHero>
      <section className="detail section">
        <div className="wrap">
          <div className="detail-layout">
            <div className="detail-gallery-panel">
              <VehicleGallery title={vehicle.title} imageUrls={vehicle.image_urls || []} />
            </div>
            <div className="detail-info-panel">
              <span className="tag">Consultar disponibilidad</span>
              <h2 className="detail-panel-title">Información comercial</h2>
              {vehicle.price_text && <p className="detail-price"><span>Precio de contado / anticipo</span><strong>{vehicle.price_text}</strong></p>}
              {vehicle.trade_in_price_text && <p className="detail-price detail-price--secondary"><span>Precio de permuta</span><strong>{vehicle.trade_in_price_text}</strong></p>}
              <p className="muted">Consultá al equipo para confirmar disponibilidad y condiciones comerciales vigentes.</p>
              <h3 className="detail-subtitle">Características técnicas</h3>
              <div className="spec-list">{specs.map(([label, value]) => (
                <div className="spec-item" key={label}><small>{label}</small><strong>{value}</strong></div>
              ))}</div>
              <div className="detail-contact-actions">
                <ContactLink className="button detail-contact-button" href={whatsappUrl} vehicleSlug={vehicle.slug} placement="vehicle-detail" intent="availability">
                  Consultar disponibilidad por WhatsApp →
                </ContactLink>
                <ContactLink className="button secondary" href={permutaUrl} vehicleSlug={vehicle.slug} placement="vehicle-detail" intent="trade-in">
                  Consultar permuta
                </ContactLink>
                <ContactLink className="button secondary" href={financingUrl} vehicleSlug={vehicle.slug} placement="vehicle-detail" intent="financing">
                  Consultar financiación
                </ContactLink>
              </div>
              <p className="muted detail-contact-disclaimer">La recepción de permutas y las opciones de financiación están sujetas a confirmación del concesionario.</p>
            </div>
          </div>
          {(descriptionLines.length > 0 || vehicle.features?.length > 0) && (
            <div className="detail-extra-grid">
              {descriptionLines.length > 0 && <section className="detail-extra-panel vehicle-description">
                <h2>Descripción y condiciones comerciales</h2>
                <div>{descriptionLines.map((line, index) => <p key={index}>{line}</p>)}</div>
              </section>}
              {vehicle.features?.length > 0 && <section className="detail-extra-panel vehicle-features">
                <h2>Otras características</h2>
                <ul>{vehicle.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </section>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
