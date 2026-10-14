import Link from 'next/link';
import { redirect } from 'next/navigation';
import PageHero from '@/components/PageHero';
import { createClient } from '@/lib/supabase/server';
import { createVehicle } from '../actions';

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: admin } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect('/admin');

  return (
    <main>
      <PageHero compact eyebrow="Gestión del inventario" title="Cargar vehículo"
        description="Completá la información de la unidad. Se guardará como borrador hasta que decidas publicarla.">
        <Link href="/admin" className="page-hero-back">← Volver al inventario</Link>
      </PageHero>
      <section className="section admin-section">
        <div className="wrap admin-form-wrap">
          <form action={createVehicle} className="contact admin-vehicle-form">
            <h2>Datos del vehículo</h2>
            <label className="form-span-full">Título *<input className="field" name="title" required maxLength={120}/></label>
            <label>Marca *<input className="field" name="make" required maxLength={80}/></label>
            <label>Modelo *<input className="field" name="model" required maxLength={80}/></label>
            <label>Año *<input className="field" name="year" type="number" min="1950" max="2100" required/></label>
            <label>Precio de contado / anticipo<input className="field" name="price" placeholder="Ej.: U$D 27.500"/></label>
            <label>Precio de permuta<input className="field" name="trade_in_price" placeholder="Ej.: U$D 30.900"/></label>
            <label>Kilometraje<input className="field" name="mileage"/></label>
            <label>Carrocería<input className="field" name="body_type"/></label>
            <label>Combustible<input className="field" name="fuel"/></label>
            <label>Transmisión<input className="field" name="transmission"/></label>
            <label className="form-span-full">Descripción y condiciones comerciales
              <textarea className="field" name="description" rows={6}
                placeholder="Garantía, documentación, entrega, financiación, sucursales y horarios. Solo información confirmada."/>
            </label>
            <label className="form-span-full">Otras características (una por línea)
              <textarea className="field" name="features" rows={4}
                placeholder={'Interior de cuero\nControl de crucero\nApple CarPlay'}/>
            </label>
            <div className="form-span-full panel-actions"><button className="button">Guardar borrador</button></div>
          </form>
        </div>
      </section>
    </main>
  );
}
