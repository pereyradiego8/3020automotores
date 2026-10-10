import type { Metadata } from 'next';
import { getPublishedVehicles } from '@/lib/inventory';
import VehicleCatalog from './VehicleCatalog';

export const metadata: Metadata = {
  title: 'Vehículos disponibles',
  description: 'Explorá el catálogo de 3020 Automotores. Consultá por vehículos publicados y confirmá disponibilidad y condiciones con nuestro equipo.',
  openGraph: {
    title: 'Vehículos disponibles | 3020 Automotores',
    description: 'Explorá el catálogo de 3020 Automotores y consultá por tu próximo vehículo.',
    type: 'website',
  },
};

export default async function AutosPage({ searchParams }: { searchParams: Promise<{ marca?: string }> }) {
  const [{ marca }, vehicles] = await Promise.all([searchParams, getPublishedVehicles()]);
  const initialMake = marca ? decodeURIComponent(marca).trim() : '';
  return <main className="section"><div className="wrap"><span className="eyebrow" style={{color:'var(--accent)'}}>Catálogo</span><h1 className="page-title">Vehículos</h1><p className="muted">Explorá las unidades publicadas por nuestro equipo.</p>{initialMake && <p className="notice">Búsqueda iniciada desde Marcas: <strong>{initialMake}</strong>. Podés editar la búsqueda para encontrar modelos relacionados.</p>}<VehicleCatalog vehicles={vehicles} initialMake={initialMake}/></div></main>;
}
