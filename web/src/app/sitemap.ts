import type { MetadataRoute } from 'next';
import { getPublishedVehicles } from '@/lib/inventory';

// Fetch current published vehicles at request time; do not prerender without
// Supabase environment variables during GitHub Actions builds.
export const dynamic = 'force-dynamic';

const DEFAULT_SITE_URL = 'https://3020automotores.vercel.app';

function getPublicBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  try {
    const url = new URL(configured);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return DEFAULT_SITE_URL;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicBaseUrl();
  const vehicles = await getPublishedVehicles();
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/autos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/nosotros`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/marcas`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
    ...vehicles.map((vehicle) => ({
      url: `${baseUrl}/autos/${encodeURIComponent(vehicle.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
