'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { trackContactClick, type ContactIntent, type ContactPlacement } from '@/lib/analytics-events';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  placement: ContactPlacement;
  intent?: ContactIntent;
  vehicleSlug?: string;
  children: ReactNode;
};

export default function ContactLink({ href, placement, intent = 'general', vehicleSlug, children, onClick, ...props }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props} onClick={(event) => {
      trackContactClick({ placement, intent, vehicleSlug });
      onClick?.(event);
    }}>
      {children}
    </a>
  );
}
