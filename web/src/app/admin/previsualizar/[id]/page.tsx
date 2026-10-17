import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPublicationIssues } from '@/lib/publication-policy';
import PageHero from '@/components/PageHero';
import VehicleGallery from '@/app/autos/[slug]/VehicleGallery';

export const metadata: Metadata = {
  title: 'Vista previa privada de vehículo',
  robots: { index: false, follow: false },
};

export default async function AdminVehiclePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) notFound();

  const { data: vehicle, error } = await supabase.from('vehicles')
    .select('id,title,slug,make,model,year,status,price_text,trade_in_price_text,mileage_text,body_type,fuel,transmission,description,features,image_urls')
    .eq('id', id)
    .maybeSingle();
  if (error || !vehicle) notFound();

  const issues = getPublicationIssues(vehicle);
  const specs = [
    ['Marca', vehicle.make], ['Modelo', vehicle.model], ['Año', String(vehicle.year)],
    ['Kilometraje', vehicle.mileage_text], ['Carrocería', vehicle.body_type],
    ['Combustible', vehicle.fuel], ['Transmisión', vehicle.transmission],
  ];

  return <main>
    <PageHero compact eyebrow="Administración · Solo personal autorizado"
      title={vehicle.title} description="Vista previa de los datos cargados. No es una publicación pública.">
      <Link className="page-hero-back" href={'/admin/editar/' + vehicle.id}>← Editar vehículo</Link>
      <Link className="page-hero-back" href="/admin">Volver al inventario</Link>
    </PageHero>
    <section className="section detail admin-section">
      <div className="wrap">
        <div className="notice" role="status">
          <strong>Vista previa privada · {vehicle.status}</strong>
          {issues.length
            ? <p>Antes de publicar faltan: {issues.join(', ')}.</p>
            : <p>Los datos mínimos para publicación están completos. Confirmá que los datos comerciales sean correctos.</p>}
        </div>
        <div className="detail-layout">
          <div className="detail-gallery-panel">
            <VehicleGallery title={vehicle.title} imageUrls={vehicle.image_urls ?? []} />
          </div>
          <div className="detail-info-panel">
            <h2 className="detail-panel-title">Información comercial</h2>
            {vehicle.price_text && <p className="detail-price"><span>Precio publicado</span><strong>{vehicle.price_text}</strong></p>}
            {vehicle.trade_in_price_text && <p className="detail-price detail-price--secondary"><span>Precio de permuta</span><strong>{vehicle.trade_in_price_text}</strong></p>}
            <h3 className="detail-subtitle">Ficha técnica</h3>
            <div className="spec-list">
              {specs.map(([label, value]) => (
                <div className="spec-item" key={label}><small>{label}</small><strong>{value || 'Sin cargar'}</strong></div>
              ))}
            </div>
          </div>
        </div>
        {(vehicle.description || vehicle.features?.length) && (
          <div className="detail-extra-grid">
            {vehicle.description && <section className="detail-extra-panel">
              <h2>Descripción</h2>
              {vehicle.description.split(/\r?\n/).filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}
            </section>}
            {!!vehicle.features?.length && <section className="detail-extra-panel">
              <h2>Otras características</h2>
              <ul>{vehicle.features.map((feature: string) => <li key={feature}>{feature}</li>)}</ul>
            </section>}
          </div>
        )}
      </div>
    </section>
  </main>;
}
