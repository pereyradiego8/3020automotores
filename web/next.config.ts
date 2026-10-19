import type { NextConfig } from 'next';

const legacyRedirects = [
  ...[
    '15064', '15904', '15951', '16070', '16096', '16667', '16737',
    '16760', '17118', '17276', '17296', '17341', '17498', '17569',
    '17636', '17705', '17798', '17800', '17957', '18005', '18029',
    '18051', '18117',
  ].map((id) => ({
    source: '/',
    has: [{ type: 'query' as const, key: 'p', value: id }],
    destination: '/autos',
    permanent: true,
  })),
  { source: '/', has: [{ type: 'query' as const, key: 'p', value: '4739' }], destination: '/nosotros', permanent: true },
  { source: '/', has: [{ type: 'query' as const, key: 'p', value: '4743' }], destination: '/contacto', permanent: true },
  { source: '/', has: [{ type: 'query' as const, key: 'p', value: '4819' }], destination: '/marcas', permanent: true },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/pereyradiego8/3020automotores/main/historico/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'zoncelsnskpuninitier.supabase.co',
        pathname: '/storage/v1/object/public/vehicle-images/**',
      },
    ],
  },
  async redirects() {
    return [
      ...legacyRedirects,
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/autos.html', destination: '/autos', permanent: true },
      { source: '/autos/:slug/index.html', destination: '/autos/:slug', permanent: true },
      { source: '/nosotros/index.html', destination: '/nosotros', permanent: true },
      { source: '/contacto/index.html', destination: '/contacto', permanent: true },
      { source: '/marcas/index.html', destination: '/marcas', permanent: true },
      { source: '/marcas/:marca/index.html', destination: '/marcas', permanent: true },
      { source: '/nosotros/', destination: '/nosotros', permanent: true },
      { source: '/contacto/', destination: '/contacto', permanent: true },
      { source: '/marcas/', destination: '/marcas', permanent: true },
    ];
  },
  async headers() {
    const commonHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // Compatible CSP baseline: a strict script-src will require per-request
      // nonces and separate browser testing for Next.js, Supabase and maps.
      { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" },
      { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
    ];
    if (process.env.NODE_ENV === 'production') {
      commonHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    }
    return [{ source: '/:path*', headers: commonHeaders }];
  },
};

export default nextConfig;
