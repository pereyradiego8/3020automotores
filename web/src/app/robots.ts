import type { MetadataRoute } from 'next';

const DEFAULT_SITE_URL = 'https://3020automotores.vercel.app';

export default function robots(): MetadataRoute.Robots {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  let sitemap = new URL('/sitemap.xml', DEFAULT_SITE_URL).toString();
  try {
    const url = new URL(configured);
    if (['http:', 'https:'].includes(url.protocol) && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      sitemap = new URL('/sitemap.xml', url).toString();
    }
  } catch {
    // Fall back to the active Vercel production URL.
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }],
    sitemap,
  };
}
