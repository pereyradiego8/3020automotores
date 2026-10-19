import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNavigation from '@/components/SiteNavigation';
import FloatingContact from '@/components/FloatingContact';
import OptionalAnalytics from '@/components/OptionalAnalytics';
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
  image: `${DEFAULT_SITE_URL}/images/3020-logo.png`,
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const safeMeasurementId = measurementId && /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : null;
  return <html lang="es-AR"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessStructuredData) }} /><a className="skip-link" href="#contenido">Saltar al contenido</a><header className="site-header"><Link className="brand" href="/" aria-label="3020 Automotores, inicio"><img className="brand-logo" src="/images/3020-logo.png" alt="3020 Automotores" width={190} height={43} decoding="async" /></Link><SiteNavigation whatsappUrl={whatsappUrl} /></header><div id="contenido">{children}</div><FloatingContact href={whatsappUrl} /><OptionalAnalytics measurementId={safeMeasurementId} /><footer className="site-footer"><div><strong>3020 Automotores</strong><p>Te acompañamos a encontrar tu próximo vehículo.</p><p>Av. Dardo Rocha Nº 826, Berazategui</p></div><div className="footer-links"><Link href="/autos">Vehículos</Link><Link href="/marcas">Marcas</Link><Link href="/nosotros">Nosotros</Link><Link href="/contacto">Contacto</Link><Link href="/privacidad">Privacidad</Link><p>Consultá por disponibilidad, precios y condiciones de cada unidad.</p></div></footer></body></html>;
}
