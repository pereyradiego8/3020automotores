import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  let sitemap: string | undefined;
  if (configured) {
    try {
      const url = new URL(configured);
      if (['http:', 'https:'].includes(url.protocol) && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        sitemap = new URL('/sitemap.xml', url).toString();
      }
    } catch {
      // Missing or invalid canonical URL should not break the build.
    }
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }],
    ...(sitemap ? { sitemap } : {}),
  };
}
