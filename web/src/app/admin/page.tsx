import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';
import AdminInventory from './AdminInventory';

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

  const { data: sales } = await supabase
    .from('vehicle_sales')
    .select('vehicle_id,buyer_name,buyer_document_type,buyer_document_number,vehicle_plate,sale_notes,sold_at,document_paths');

  const salesWithLinks = await Promise.all((sales || []).map(async (sale) => {
    const paths = Array.isArray(sale.document_paths) ? sale.document_paths : [];
    const document_links = await Promise.all(paths.map(async (path) => {
      const { data } = await supabase.storage.from('vehicle-sale-documents').createSignedUrl(path, 3600);
      return data?.signedUrl ? { path, url: data.signedUrl } : null;
    }));
    return { ...sale, document_links: document_links.filter((item): item is { path: string; url: string } => item !== null) };
  }));

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
          <AdminInventory vehicles={vehicles || []} sales={salesWithLinks || []} />
        )}
      </div>
    </main>
  );
}
