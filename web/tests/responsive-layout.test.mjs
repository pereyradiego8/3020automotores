import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../src/' + path, import.meta.url), 'utf8');
const css = read('app/globals.css');

test('shared layout defines tablet, phone and narrow-phone breakpoints', () => {
  for (const width of [1024, 860, 760, 560, 390]) {
    assert.ok(css.includes(`@media(max-width:${width}px)`), `Missing layout breakpoint ${width}px`);
  }
  assert.match(css, /\.hero-showcase h1\{font-size:clamp\(30px,7\.4vw,38px\)/);
  assert.match(css, /\.page-hero\.page-hero--compact \.page-title\{font-size:clamp\(27px,6\.4vw,32px\)/);
  assert.match(css, /\.grid\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css, /\.filters\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css, /\.admin-vehicle-form\{grid-template-columns:minmax\(0,1fr\)/);
});

test('sale dialogs and document editor stay inside the phone viewport', () => {
  for (const file of [
    'app/admin/VehicleStatusForm.tsx',
    'app/admin/SaleOptionalFieldEditor.tsx',
    'app/admin/SaleStatusControl.tsx',
  ]) {
    const source = read(file);
    assert.ok(source.includes("maxHeight: 'calc(100dvh - 32px)'"), file);
    assert.ok(source.includes("overflowY: 'auto'"), file);
  }
});

test('inventory tables remain locally scrollable rather than overflowing the entire page', () => {
  const inventory = read('app/admin/AdminInventory.tsx');
  assert.match(inventory, /className="admin-sales-table-scroll"/);
  assert.match(inventory, /tabIndex=\{0\}/);
  assert.match(css, /\.admin-sales-table-scroll\{max-width:100%;overscroll-behavior-inline:contain\}/);
});

test('car hero, photos and cards use bounded sizes', () => {
  assert.match(css, /\.hero-car-image\{max-height:235px\}/);
  assert.match(css, /\.hero-visual\{min-height:195px\}/);
  assert.match(css, /\.vehicle-card\{width:100%;max-width:520px/);
  assert.match(read('app/admin/VehicleImageManager.tsx'), /minmax\(min\(100%,118px\),1fr\)/);
});
