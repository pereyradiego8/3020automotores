import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (relative) => readFileSync(new URL('../src/' + relative, import.meta.url), 'utf8');
const styledRoutes = [
  'app/autos/page.tsx',
  'app/autos/[slug]/page.tsx',
  'app/nosotros/page.tsx',
  'app/marcas/page.tsx',
  'app/contacto/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/page.tsx',
  'app/admin/nuevo/page.tsx',
  'app/admin/editar/[id]/page.tsx',
  'app/admin/error.tsx',
  'app/error.tsx',
  'app/not-found.tsx',
];

test('all secondary public and administrative pages share one branded heading', () => {
  const header = source('components/PageHero.tsx');
  assert.match(header, /<h1 className="page-title">\{title\}<\/h1>/);
  for (const route of styledRoutes) {
    assert.match(source(route), /<PageHero\b/, route);
  }
  assert.match(source('app/page.tsx'), /hero-showcase/);
});

test('shared styles cover cards, forms, mobile, accessibility and dark page headers', () => {
  const css = source('app/globals.css');
  for (const selector of ['.page-hero-content', '.page-hero--compact', '.detail-info-panel',
    '.admin-vehicle-form', '.site-header .site-nav a[aria-current="page"]',
    '.page-loading-indicator', '@media(max-width:540px)', ':focus-visible']) {
    assert.ok(css.includes(selector), `Missing shared design selector: ${selector}`);
  }
});

test('header navigation exposes active page and preserves the official WhatsApp link', () => {
  const nav = source('components/SiteNavigation.tsx');
  const layout = source('app/layout.tsx');
  assert.match(nav, /aria-current=/);
  assert.match(nav, /pathname\.startsWith\('\/autos\/'\)/);
  assert.match(layout, /<SiteNavigation whatsappUrl=\{whatsappUrl\}/);
  assert.match(layout, /className="skip-link"/);
});
