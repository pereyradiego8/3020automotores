const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** Returns a verified WhatsApp destination only when configured by the deployer. */
export function getWhatsAppUrl(message?: string): string | null {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!configured) return null;
  const number = digitsOnly(configured);
  // International format without '+'; require a plausible E.164 digit count.
  if (number.length < 10 || number.length > 15) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
