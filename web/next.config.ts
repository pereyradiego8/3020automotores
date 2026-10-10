import type { NextConfig } from 'next';

const legacyVehicleIds = [
  '18117', '18051', '18029', '18005', '17957', '17800', '17798',
  '17705', '17636', '17569', '17498', '17341', '17296', '17276',
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return legacyVehicleIds.map((id) => ({
      source: '/',
      has: [{ type: 'query' as const, key: 'p', value: id }],
      destination: '/autos',
      permanent: true,
    }));
  },
  async headers() {
    const commonHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    if (process.env.NODE_ENV === 'production') {
      commonHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' });
    }
    return [{ source: '/:path*', headers: commonHeaders }];
  },
};

export default nextConfig;
