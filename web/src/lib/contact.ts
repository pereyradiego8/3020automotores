const digitsOnly = (value: string) => value.replace(/\D/g, '');

// Official 3020 Automotores WhatsApp. An environment variable can override it per deployment.
const DEFAULT_WHATSAPP_NUMBER = '5491137303619';

export function getWhatsAppUrl(message?: string): string | null {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  const number = digitsOnly(configured);
  if (number.length < 10 || number.length > 15) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
