import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }],
    ...(siteUrl && !siteUrl.includes('localhost') ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
