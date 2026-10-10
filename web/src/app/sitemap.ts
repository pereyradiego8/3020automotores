import type { MetadataRoute } from 'next';
import { getPublishedVehicles } from '@/lib/inventory';

function getPublicBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname === 'localhost' || url.hostname === '127.0.0.1') return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl();
  if (!baseUrl) return [];
  const vehicles = await getPublishedVehicles();
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/autos`, changeFrequency: 'daily', priority: 0.9 },
    ...vehicles.map((vehicle) => ({
      url: `${baseUrl}/autos/${encodeURIComponent(vehicle.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
