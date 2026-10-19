import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = (path) => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');
const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
const ci = readFileSync(new URL('../../.github/workflows/web-build.yml', import.meta.url), 'utf8');

test('security headers set a non-disruptive enforced Content Security Policy', () => {
  for (const directive of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'"]) {
    assert.ok(config.includes(directive), directive);
  }
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /Strict-Transport-Security/);
  assert.match(config, /X-Permitted-Cross-Domain-Policies/);
});

test('locally served brand assets are original PNG files, not remote dependencies', () => {
  const layout = src('app/layout.tsx');
  assert.match(layout, /src="\/images\/3020-logo\.png"/);
  assert.match(layout, /icon: '\/favicon\.png'/);
  assert.doesNotMatch(layout, /3020automotores\.ar\/wp-content\/uploads/);
  assert.doesNotMatch(layout, /src="https:\/\/raw\.githubusercontent\.com/);
  for (const asset of ['../public/favicon.png', '../public/images/3020-logo.png']) {
    const binary = readFileSync(new URL(asset, import.meta.url));
    assert.ok(binary.length > 1000, `PNG missing: ${asset}`);
    assert.equal(binary.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', asset);
  }
});

test('published stock reads are deduplicated within a request only', () => {
  const inv = src('lib/inventory.ts');
  assert.match(inv, /import \{ cache \} from 'react'/);
  assert.match(inv, /getPublishedVehicles = cache\(/);
  assert.match(inv, /getPublishedVehicleBySlug = cache\(/);
  assert.doesNotMatch(inv, /unstable_cache|revalidate:\s*\d+/);
});

test('withdrawn or nonexistent vehicles are marked noindex during streaming', () => {
  const page = src('app/autos/[slug]/page.tsx');
  assert.match(page, /if \(!vehicle\) return \{ title: 'Vehículo no disponible', robots: \{ index: false, follow: true \} \}/);
  assert.match(page, /if \(!vehicle\) notFound\(\)/);
});

test('CI uses same Node major version as Vercel production', () => {
  assert.match(ci, /node-version: 24/);
});
