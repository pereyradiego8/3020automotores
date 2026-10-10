import Link from 'next/link';

export const metadata = {
  title: 'Contacto',
  description: 'Contactá a 3020 Automotores para consultar por vehículos y atención comercial.',
};

const phoneNumbers = [
  { label: 'Teléfono 1', display: '11 3730-3619', href: '+541137303619' },
  { label: 'Teléfono 2', display: '11 7707-1333', href: '+541177071333' },
];

export default function ContactoPage() {
  return <main>
    <section className="page-hero"><div className="wrap"><span className="eyebrow">Estamos para ayudarte</span><h1 className="page-title">Hablemos de tu próximo vehículo.</h1><p>Consultanos por modelos, disponibilidad, precios y condiciones. El equipo comercial podrá orientarte con la información actualizada.</p></div></section>
    <section className="section"><div className="wrap contact-grid">
      <div className="contact-card"><span className="eyebrow" style={{color:'var(--accent)'}}>Contacto directo</span><h2>Comunicate con nosotros</h2>
        {phoneNumbers.map((phone)=><p key={phone.href}><span className="contact-label">{phone.label}</span><br/><a className="contact-value" href={`tel:${phone.href}`}>{phone.display}</a></p>)}
        <p><span className="contact-label">Correo electrónico</span><br/><a className="contact-value" href="mailto:automotores3020@hotmail.com">automotores3020@hotmail.com</a></p>
        <p className="notice">Estos datos se recuperaron del sitio anterior. Antes del lanzamiento público, confirmá que teléfonos y correo sigan vigentes.</p>
      </div>
      <div className="contact-card"><span className="eyebrow" style={{color:'var(--accent)'}}>Dónde estamos</span><h2>Berazategui, zona sur</h2>
        <p className="contact-value">Av. Dardo Rocha Nº 826, Berazategui</p>
        <h3>Horarios publicados anteriormente</h3><p>Lunes a viernes: 8 a 12 h y 14 a 18 h.</p><p>Sábados: 8 a 15 h.</p>
        <p className="notice">Dirección y horarios también requieren confirmación antes de publicarse como información vigente.</p>
        <Link className="button secondary" href="/autos">Ver vehículos</Link>
      </div>
    </div></section>
  </main>;
}
