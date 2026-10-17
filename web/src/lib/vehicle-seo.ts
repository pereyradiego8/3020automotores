import { parseVehiclePrice } from './pricing';

export type SeoVehicle = {
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price_text: string | null;
  mileage_text: string | null;
  description: string | null;
  image_urls: string[];
};

/** Miles de kilómetros escritos en es-AR, sin inferir un kilometraje desconocido. */
export function parseMileageKm(text: string | null): number | null {
  if (!text) return null;
  const match = text.trim().match(/^(\d+|\d{1,3}(?:[.,]\d{3})+)\s*(?:km|kil[oó]metros?)$/i);
  if (!match) return null;
  const value = Number(match[1].replace(/[.,]/g, ''));
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

/**
 * La ficha puede indexarse como Car. Ofertas y kilometraje sólo se exponen
 * cuando el concesionario publicó valores explícitos que se pueden interpretar.
 */
export function vehicleStructuredData(vehicle: SeoVehicle, siteUrl = 'https://3020automotores.vercel.app') {
  const pageUrl = new URL('/autos/' + encodeURIComponent(vehicle.slug), siteUrl).toString();
  const parsedPrice = parseVehiclePrice(vehicle.price_text);
  const mileage = parseMileageKm(vehicle.mileage_text);
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': pageUrl + '#vehiculo',
    url: pageUrl,
    name: vehicle.title,
    brand: { '@type': 'Brand', name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    ...(vehicle.description?.trim() ? { description: vehicle.description.trim() } : {}),
    ...(vehicle.image_urls.length ? { image: vehicle.image_urls } : {}),
    ...(mileage !== null ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: mileage, unitCode: 'KMT' } } : {}),
    ...(parsedPrice ? {
      offers: {
        '@type': 'Offer',
        price: parsedPrice.amount,
        priceCurrency: parsedPrice.currency,
        url: pageUrl,
        seller: { '@type': 'AutoDealer', name: '3020 Automotores', url: siteUrl },
      },
    } : {}),
  };
}

/** Evita que contenido editable termine interpretándose como etiquetas HTML en JSON-LD. */
export function serializeStructuredData(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
