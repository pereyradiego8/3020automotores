import type { MetadataRoute } from 'next';
import { getPublishedVehicles } from '@/lib/inventory';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (!siteUrl || siteUrl.includes('localhost')) return [];
  const vehicles = await getPublishedVehicles();
  const baseEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/autos`, changeFrequency: 'daily', priority: 0.9 },
  ];
  return [
    ...baseEntries,
    ...vehicles.map((vehicle) => ({
      url: `${siteUrl}/autos/${vehicle.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
