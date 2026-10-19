import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveVehicleImageUrl, resolveVehicleImageUrls } =
  require('../node_modules/.cache/3020-tests/archived-vehicle-photos.js');

const baseUrl = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/';
const localRoot = new URL('../public/archivos-vehiculos/', import.meta.url);

function archiveFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const sub = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? '/' : ''), dir);
    return entry.isDirectory() ? archiveFiles(sub) : [sub];
  });
}

test('all 24 current vehicle photographs survive the historical-tree removal', () => {
  const photos = archiveFiles(localRoot);
  assert.equal(photos.length, 24);
  assert.ok(photos.every((file) => /\.jpe?g$/i.test(file.pathname)));
  assert.ok(photos.every((file) => statSync(file).size > 1000));
  assert.equal(existsSync(new URL('../../historico/', import.meta.url)), false,
    'Obsolete WordPress tree must not remain on the integrated branch');
});

test('historical vehicle URLs map to same-filename local public copies', () => {
  const old = baseUrl + '2026/10/DS3-2019-1-1920x1080.jpg';
  const mapped = '/archivos-vehiculos/2026/10/DS3-2019-1-1920x1080.jpg';
  assert.equal(resolveVehicleImageUrl(old), mapped);
  assert.equal(resolveVehicleImageUrl(mapped), mapped);
  assert.deepEqual(resolveVehicleImageUrls([old]), [mapped]);
  assert.ok(existsSync(new URL('../public/' + mapped.slice(1), import.meta.url)));
});

test('new uploaded Supabase photos remain untouched', () => {
  const uploaded = 'https://zoncelsnskpuninitier.supabase.co/storage/v1/object/public/vehicle-images/id/file.webp';
  assert.equal(resolveVehicleImageUrl(uploaded), uploaded);
  assert.equal(resolveVehicleImageUrl(baseUrl+'2026/10/photo.jpg?download=1'), baseUrl+'2026/10/photo.jpg?download=1');
});
