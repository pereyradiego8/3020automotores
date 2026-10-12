import Link from 'next/link';

export const metadata = {
  title: 'Nosotros',
  description: 'Conocé la historia y la atención de 3020 Automotores en zona sur.',
  alternates: { canonical: '/nosotros' },
  openGraph: { url: '/nosotros' },
};

export default function NosotrosPage() {
  return <main>
    <section className="page-hero"><div className="wrap"><span className="eyebrow">Quiénes somos</span><h1 className="page-title">Una empresa familiar, cerca tuyo.</h1><p>Te acompañamos para que encuentres el vehículo que mejor se adapta a vos, con atención cercana y asesoramiento durante el proceso de compra.</p></div></section>
    <section className="section"><div className="wrap content-narrow">
      <h2>La experiencia de elegir tu próximo vehículo</h2>
      <p>3020 Automotores es una empresa familiar vinculada al rubro automotor y a la atención de clientes de zona sur. Nuestro objetivo es que puedas conocer las opciones disponibles, comparar alternativas y consultar con nuestro equipo antes de tomar una decisión.</p>
      <p>En este nuevo sitio vas a encontrar las unidades que nuestro equipo haya publicado y confirmado. Si buscás un modelo particular, también podés contactarnos para consultar por disponibilidad y condiciones actualizadas.</p>
      <div className="action-row"><Link className="button" href="/autos">Explorar vehículos</Link><Link className="button secondary" href="/contacto">Contactanos</Link></div>
    </div></section>
  </main>;
}
