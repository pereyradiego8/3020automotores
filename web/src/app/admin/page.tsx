import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setVehicleStatus, signOut } from './actions';
import VehicleImageManager from './VehicleImageManager';

const labels: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="section">
        <div className="wrap">
          <h1 className="page-title">Acceso no habilitado</h1>
          <p className="muted">La cuenta no está autorizada para administrar el inventario.</p>
          <form action={signOut}><button className="button secondary">Cerrar sesión</button></form>
        </div>
      </main>
    );
  }

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id,title,make,model,year,status,image_urls')
    // Keep a stable alphabetical order; status saves update updated_at and must not move a car.
    .order('title', { ascending: true })
    .order('id', { ascending: true });

  return (
    <main className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h1 className="page-title">Inventario</h1>
            <p className="muted">Sesión: {user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="button" href="/admin/nuevo">+ Cargar vehículo</Link>
            <form action={signOut}><button className="button secondary">Salir</button></form>
          </div>
        </div>
        {error ? (
          <div className="notice">No se pudo leer el inventario. Verificá Supabase.</div>
        ) : !vehicles?.length ? (
          <div className="empty">Todavía no hay vehículos cargados.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {vehicles.map((v) => (
              <article className="vehicle-card" key={v.id} style={{ padding: 18 }}>
                <span className="tag">{labels[v.status] || v.status}</span>
                <h3>{v.title}</h3>
                <p><Link className="text-link" href={'/admin/editar/' + v.id}>Editar datos →</Link></p>
                <p className="muted">{v.make} {v.model} · {v.year}</p>
                <form action={setVehicleStatus} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="hidden" name="id" value={v.id} />
                  <select className="field" name="status" defaultValue={v.status} aria-label={'Estado de ' + v.title}>
                    {Object.entries(labels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
                  </select>
                  <button className="button secondary" style={{ marginTop: 0 }}>Guardar estado</button>
                </form>
                <VehicleImageManager vehicleId={v.id} initialUrls={v.image_urls || []} />
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
