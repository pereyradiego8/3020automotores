const OFFICIAL_WHATSAPP_NUMBER = '5491137303619';

export function getWhatsAppUrl(message?: string): string {
  const number = OFFICIAL_WHATSAPP_NUMBER;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
