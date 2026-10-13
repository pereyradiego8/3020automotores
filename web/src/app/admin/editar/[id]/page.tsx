import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateVehicle } from '../../actions';
import VehicleStatusForm from '../VehicleStatusForm';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin');
  const { data: vehicle, error } = await supabase.from('vehicles').select('id,title,make,model,year,status,price_text,trade_in_price_text,mileage_text,body_type,fuel,transmission,description,features,image_urls').eq('id', id).maybeSingle();
  if (error || !vehicle) notFound();
  const { data: sale } = await supabase
    .from('vehicle_sales')
    .select('buyer_name,buyer_document_type,buyer_document_number,sale_notes,sold_at,document_paths')
    .eq('vehicle_id', id)
    .maybeSingle();

  return <main className="section"><div className="wrap" style={{ maxWidth: 820 }}>
    <p><Link className="text-link" href="/admin">← Volver al inventario</Link></p>
    <h1 className="page-title">Editar vehículo</h1>
    <p className="muted">Desde acá también podés cambiar el estado del vehículo, incluso volver a publicarlo si estaba vendido.</p>
    <section className="vehicle-card" style={{ padding: 18, marginBottom: 22 }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Estado del vehículo</h2>
      <VehicleStatusForm
        vehicleId={vehicle.id}
        vehicleTitle={vehicle.title}
        initialStatus={vehicle.status as 'draft' | 'published' | 'reserved' | 'sold'}
        initialSale={sale ?? null}
      />
    </section>
    <form action={updateVehicle} className="contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
      <input type="hidden" name="id" value={vehicle.id}/>
      <label style={{ gridColumn: '1 / -1' }}>Título *<input className="field" name="title" defaultValue={vehicle.title} required/></label>
      <label>Marca *<input className="field" name="make" defaultValue={vehicle.make} required/></label>
      <label>Modelo *<input className="field" name="model" defaultValue={vehicle.model} required/></label>
      <label>Año *<input className="field" name="year" type="number" min="1950" max="2100" defaultValue={vehicle.year} required/></label>
      <label>Precio de contado / anticipo<input className="field" name="price" defaultValue={vehicle.price_text||''} placeholder="Ej.: USD 27.500"/></label><label>Precio de permuta<input className="field" name="trade_in_price" defaultValue={vehicle.trade_in_price_text||''} placeholder="Ej.: USD 30.900"/></label>
      <label>Kilometraje<input className="field" name="mileage" defaultValue={vehicle.mileage_text||''}/></label>
      <label>Carrocería<input className="field" name="body_type" defaultValue={vehicle.body_type||''}/></label>
      <label>Combustible<input className="field" name="fuel" defaultValue={vehicle.fuel||''}/></label>
      <label>Transmisión<input className="field" name="transmission" defaultValue={vehicle.transmission||''}/></label>
      <label style={{ gridColumn: '1 / -1' }}>Descripción y condiciones comerciales<textarea className="field" name="description" rows={6} defaultValue={vehicle.description||''} placeholder="Garantía, documentación, entrega, financiación, sucursales y horarios."/></label><label style={{ gridColumn: '1 / -1' }}>Otras características (una por línea)<textarea className="field" name="features" rows={4} defaultValue={(vehicle.features||[]).join('\n')} placeholder={"Interior de cuero\nControl de crucero\nApple CarPlay"}/></label>
      <div><button className="button">Guardar cambios</button></div>
    </form>
  </div></main>;
}
