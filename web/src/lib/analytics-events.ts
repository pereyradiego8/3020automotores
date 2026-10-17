export type ContactPlacement = 'header' | 'floating' | 'home' | 'home-contact' | 'contact-page' | 'vehicle-detail';
export type ContactIntent = 'general' | 'availability' | 'trade-in' | 'financing';

export type ContactEvent = {
  placement: ContactPlacement;
  intent: ContactIntent;
  vehicleSlug?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Solo registra categorías y slugs públicos; jamás datos del comprador. */
export function trackContactClick(event: ContactEvent) {
  if (typeof window === 'undefined') return;
  const slug = event.vehicleSlug?.trim();
  window.gtag?.('event', 'contact_click', {
    channel: 'whatsapp',
    placement: event.placement,
    intent: event.intent,
    ...(slug ? { vehicle_slug: slug.slice(0, 120) } : {}),
  });
}
