'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/autos', label: 'Vehículos' },
  { href: '/marcas', label: 'Marcas' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export default function SiteNavigation({ whatsappUrl }: { whatsappUrl: string | null }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación principal" className="site-nav">
      {links.map(({ href, label }) => (
        <Link key={href} href={href}
          aria-current={pathname === href || (href === '/autos' && pathname.startsWith('/autos/')) ? 'page' : undefined}>
          {label}
        </Link>
      ))}
      {whatsappUrl && <a className="site-nav-whatsapp" href={whatsappUrl}
        target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
    </nav>
  );
}
