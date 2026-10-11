import type { Metadata } from 'next';
import { getWhatsAppUrl } from '@/lib/contact';
import './globals.css';

function getMetadataBase(): URL | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return undefined;
  try {
    const url = new URL(configured);
    return ['http:', 'https:'].includes(url.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: { default: '3020 Automotores | Encontrá tu próximo vehículo', template: '%s | 3020 Automotores' },
  description: 'Conocé el catálogo de 3020 Automotores y consultá por tu próximo vehículo.',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: '3020 Automotores',
    title: '3020 Automotores | Encontrá tu próximo vehículo',
    description: 'Conocé el catálogo de 3020 Automotores y consultá por tu próximo vehículo.',
  },
  twitter: { card: 'summary_large_image', title: '3020 Automotores', description: 'Conocé nuestro catálogo y consultá por tu próximo vehículo.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const whatsappUrl = getWhatsAppUrl('Hola, quiero hacer una consulta a 3020 Automotores.');
  return <html lang="es-AR"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><header className="site-header"><a className="brand" href="/" aria-label="3020 Automotores, inicio"><img className="brand-logo" src="https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/2020/01/aut3020-blanco.png" alt="3020 Automotores" /></a><nav aria-label="Navegación principal"><a href="/autos">Vehículos</a><a href="/marcas">Marcas</a><a href="/nosotros">Nosotros</a><a href="/contacto">Contacto</a>{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>}</nav></header><div id="contenido">{children}</div><footer className="site-footer"><div><strong>3020 Automotores</strong><p>Te acompañamos a encontrar tu próximo vehículo.</p>{whatsappUrl && <p><a href={whatsappUrl} target="_blank" rel="noreferrer">Escribinos por WhatsApp</a></p>}</div><div className="footer-links"><a href="/autos">Vehículos</a><a href="/marcas">Marcas</a><a href="/nosotros">Nosotros</a><a href="/contacto">Contacto</a><p>Consultá por disponibilidad, precios y condiciones de cada unidad.</p></div></footer></body></html>;
}
