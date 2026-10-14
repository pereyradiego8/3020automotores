import type { Metadata } from 'next';
import { getPublishedVehicles, type PublicVehicle } from '@/lib/inventory';
import VehicleCatalog from './VehicleCatalog';

export const metadata: Metadata = {
  title: 'Vehículos disponibles',
  description: 'Explorá el catálogo de 3020 Automotores. Consultá por vehículos publicados y confirmá disponibilidad y condiciones con nuestro equipo.',
  alternates: { canonical: '/autos' },
  openGraph: {
    title: 'Vehículos disponibles | 3020 Automotores',
    description: 'Explorá el catálogo de 3020 Automotores y consultá por tu próximo vehículo.',
    url: '/autos',
    type: 'website',
  },
};

export default async function AutosPage({ searchParams }: { searchParams: Promise<{ marca?: string }> }) {
  const { marca } = await searchParams;
  const initialMake = marca?.trim() ?? '';
  let vehicles: PublicVehicle[] = [];
  let inventoryUnavailable = false;
  try {
    vehicles = await getPublishedVehicles();
  } catch {
    inventoryUnavailable = true;
  }
  return <main className="section"><div className="wrap">
    <span className="eyebrow" style={{color:'var(--accent)'}}>Catálogo</span>
    <h1 className="page-title">Vehículos</h1>
    <p className="muted">Explorá las unidades publicadas por nuestro equipo.</p>
    {inventoryUnavailable
      ? <div className="notice" role="alert">
          <strong>El catálogo no está disponible temporalmente.</strong>
          <p>Estamos teniendo un problema para consultar los vehículos. Intentá nuevamente en unos minutos o escribinos para conocer las opciones disponibles.</p>
          <a className="text-link" href="/contacto">Contactar al equipo →</a>
        </div>
      : <>
          {initialMake && <p className="notice">Búsqueda iniciada desde Marcas: <strong>{initialMake}</strong>. Podés editar la búsqueda para encontrar modelos relacionados.</p>}
          <VehicleCatalog vehicles={vehicles} initialMake={initialMake} />
        </>}
  </div></main>;
}
