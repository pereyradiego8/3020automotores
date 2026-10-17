import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (name) => readFileSync(new URL('../src/' + name, import.meta.url), 'utf8');

test('admin previews require an authenticated inventory admin and prevent indexing', () => {
  const page = source('app/admin/previsualizar/[id]/page.tsx');
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /from\('admin_users'\)/);
  assert.match(page, /index: false/);
  assert.match(page, /'\/admin\/login'/);
  assert.doesNotMatch(page, /vehicle_sales/);
});

test('admin generates short lived sales links only after explicit user interaction', () => {
  const page = source('app/admin/page.tsx');
  const control = source('app/admin/PrivateSaleDocumentLink.tsx');
  const inventory = source('app/admin/AdminInventory.tsx');
  assert.doesNotMatch(page, /createSignedUrl\(/);
  assert.match(control, /createSignedUrl\(path, 300\)/);
  assert.match(control, /onClick=\{\(\) => void createLink\(\)\}/);
  assert.match(inventory, /<PrivateSaleDocumentLink/);
});

test('admin readiness is based on the shared publication policy', () => {
  const inventory = source('app/admin/AdminInventory.tsx');
  assert.match(inventory, /getPublicationIssues\(vehicle\)/);
  assert.match(inventory, /Vista previa privada/);
});

test('analytics is optional, consent gated and never sends buyer information', () => {
  const tracking = source('lib/analytics-events.ts');
  const optional = source('components/OptionalAnalytics.tsx');
  const layout = source('app/layout.tsx');
  assert.match(tracking, /vehicle_slug/);
  assert.doesNotMatch(tracking, /buyerName|buyer_document|phone_number/);
  assert.match(optional, /choice !== 'accepted'/);
  assert.match(optional, /'rejected'/);
  assert.match(layout, /NEXT_PUBLIC_GA_MEASUREMENT_ID/);
});

test('commercial contact actions are framed as questions, not financing claims', () => {
  const detail = source('app/autos/[slug]/page.tsx');
  assert.match(detail, /Consultar permuta/);
  assert.match(detail, /Consultar financiación/);
  assert.match(detail, /sujetas a confirmación del concesionario/);
});
