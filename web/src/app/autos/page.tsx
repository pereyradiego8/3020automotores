import { getPublishedVehicles } from '@/lib/inventory';
import VehicleCatalog from './VehicleCatalog';

export default async function AutosPage() {
  const vehicles=await getPublishedVehicles();
  return <main className="section"><div className="wrap"><span className="eyebrow" style={{color:'var(--accent)'}}>Catálogo</span><h1 className="page-title">Vehículos</h1><p className="muted">Explorá las unidades publicadas por nuestro equipo.</p><VehicleCatalog vehicles={vehicles}/></div></main>;
}
