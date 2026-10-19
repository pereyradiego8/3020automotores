'use client';

import { usePathname } from 'next/navigation';
import ContactLink from './ContactLink';

export default function FloatingContact({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <ContactLink className="floating-contact" href={href} placement="floating" intent="general"
      aria-label="Consultar a 3020 Automotores por WhatsApp">
      WhatsApp <span aria-hidden="true">↗</span>
    </ContactLink>
  );
}
