import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateVehicle } from '../../actions';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin');
  const { data: vehicle, error } = await supabase.from('vehicles').select('id,title,make,model,year,price_text,mileage_text,body_type,fuel,transmission,description').eq('id', id).maybeSingle();
  if (error || !vehicle) notFound();

  return <main className="section"><div className="wrap" style={{ maxWidth: 820 }}>
    <p><Link className="text-link" href="/admin">← Volver al inventario</Link></p>
    <h1 className="page-title">Editar vehículo</h1>
    <p className="muted">Los cambios de datos no modifican el estado de publicación.</p>
    <form action={updateVehicle} className="contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
      <input type="hidden" name="id" value={vehicle.id}/>
      <label style={{ gridColumn: '1 / -1' }}>Título *<input className="field" name="title" defaultValue={vehicle.title} required/></label>
      <label>Marca *<input className="field" name="make" defaultValue={vehicle.make} required/></label>
      <label>Modelo *<input className="field" name="model" defaultValue={vehicle.model} required/></label>
      <label>Año *<input className="field" name="year" type="number" min="1950" max="2100" defaultValue={vehicle.year} required/></label>
      <label>Precio<input className="field" name="price" defaultValue={vehicle.price_text||''}/></label>
      <label>Kilometraje<input className="field" name="mileage" defaultValue={vehicle.mileage_text||''}/></label>
      <label>Carrocería<input className="field" name="body_type" defaultValue={vehicle.body_type||''}/></label>
      <label>Combustible<input className="field" name="fuel" defaultValue={vehicle.fuel||''}/></label>
      <label>Transmisión<input className="field" name="transmission" defaultValue={vehicle.transmission||''}/></label>
      <label style={{ gridColumn: '1 / -1' }}>Descripción<textarea className="field" name="description" rows={5} defaultValue={vehicle.description||''}/></label>
      <div><button className="button">Guardar cambios</button></div>
    </form>
  </div></main>;
}
