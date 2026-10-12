import type { Metadata } from 'next';
import { getWhatsAppUrl } from '@/lib/contact';
import './globals.css';

const DEFAULT_SITE_URL = 'https://3020automotores.vercel.app';

function getMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  try {
    const url = new URL(configured);
    return ['http:', 'https:'].includes(url.protocol) ? url : new URL(DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: '3020 Automotores',
  url: DEFAULT_SITE_URL,
  image: 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/2020/01/aut3020-blanco.png',
  telephone: '+54 9 11 3730-3619',
  email: 'automotores3020@hotmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Dardo Rocha 826',
    addressLocality: 'Berazategui',
    addressRegion: 'Buenos Aires',
    addressCountry: 'AR',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Zona Sur, Buenos Aires, Argentina',
  },
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  alternates: { canonical: '/' },
  title: { default: '3020 Automotores | Encontrá tu próximo vehículo', template: '%s | 3020 Automotores' },
  description: 'Conocé el catálogo de 3020 Automotores en Berazategui, Zona Sur de Buenos Aires. Explorá autos usados y 0 km y consultá por WhatsApp.',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: '3020 Automotores',
    title: '3020 Automotores | Encontrá tu próximo vehículo',
    description: 'Conocé el catálogo de 3020 Automotores en Berazategui, Zona Sur de Buenos Aires. Explorá autos usados y 0 km y consultá por WhatsApp.',
  },
  twitter: { card: 'summary_large_image', title: '3020 Automotores', description: 'Conocé nuestro catálogo y consultá por tu próximo vehículo.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const whatsappUrl = getWhatsAppUrl('Hola, quiero hacer una consulta a 3020 Automotores.');
  return <html lang="es-AR"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessStructuredData) }} /><a className="skip-link" href="#contenido">Saltar al contenido</a><header className="site-header"><a className="brand" href="/" aria-label="3020 Automotores, inicio"><img className="brand-logo" src="https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/2020/01/aut3020-blanco.png" alt="3020 Automotores" /></a><nav aria-label="Navegación principal"><a href="/autos">Vehículos</a><a href="/marcas">Marcas</a><a href="/nosotros">Nosotros</a><a href="/contacto">Contacto</a>{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>}</nav></header><div id="contenido">{children}</div><footer className="site-footer"><div><strong>3020 Automotores</strong><p>Te acompañamos a encontrar tu próximo vehículo.</p><p>Av. Dardo Rocha Nº 826, Berazategui</p><p><a href="tel:+5491137303619">+54 9 11 3730-3619</a></p>{whatsappUrl && <p><a href={whatsappUrl} target="_blank" rel="noreferrer">Escribinos por WhatsApp</a></p>}</div><div className="footer-links"><a href="/autos">Vehículos</a><a href="/marcas">Marcas</a><a href="/nosotros">Nosotros</a><a href="/contacto">Contacto</a><p>Consultá por disponibilidad, precios y condiciones de cada unidad.</p></div></footer></body></html>;
}
