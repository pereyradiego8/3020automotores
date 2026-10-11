import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/contact';

export const metadata = {
  title: 'Contacto',
  description: 'Contactá a 3020 Automotores para consultar por vehículos y atención comercial.',
};

export default function ContactoPage() {
  const whatsappUrl = getWhatsAppUrl('Hola, quiero consultar por los vehículos de 3020 Automotores.');
  return <main>
    <section className="page-hero"><div className="wrap"><span className="eyebrow">Estamos para ayudarte</span><h1 className="page-title">Hablemos de tu próximo vehículo.</h1><p>Consultanos por modelos, disponibilidad, precios y condiciones. Nuestro equipo puede orientarte con la información de cada unidad.</p></div></section>
    <section className="section"><div className="wrap contact-grid">
      <div className="contact-card"><span className="eyebrow" style={{color:'var(--accent)'}}>Contacto directo</span><h2>Comunicate con nosotros</h2>
        <p><span className="contact-label">WhatsApp</span><br/><a className="contact-value" href="tel:+5491137303619">+54 9 11 3730-3619</a></p>
        {whatsappUrl && <p><a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Escribir por WhatsApp</a></p>}
        <p><span className="contact-label">Teléfono alternativo</span><br/><a className="contact-value" href="tel:+541177071333">11 7707-1333</a></p>
        <p><span className="contact-label">Correo electrónico</span><br/><a className="contact-value" href="mailto:automotores3020@hotmail.com">automotores3020@hotmail.com</a></p>
      </div>
      <div className="contact-card"><span className="eyebrow" style={{color:'var(--accent)'}}>Dónde estamos</span><h2>Berazategui, zona sur</h2>
        <p className="contact-value">Av. Dardo Rocha Nº 826, Berazategui</p>
        <h3>Horarios publicados anteriormente</h3><p>Lunes a viernes: de 8 a 12 h y de 14 a 18 h.</p><p>Sábados: de 8 a 15 h.</p>
        <p className="muted">Consultá por WhatsApp para confirmar los horarios de atención.</p>
        <Link className="button secondary" href="/autos">Ver vehículos</Link>
      </div>
    </div></section>
  </main>;
}
