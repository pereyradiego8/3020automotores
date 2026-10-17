import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

test('legacy model variants redirect without claiming another car is the same unit', () => {
  for (const oldSlug of ['argo-drive-1-3-cvt', 'chevrolet-cruze-1-4-turbo-premier-at-2023', 'ford-ranger-xlt-2-0-4x4']) {
    assert.ok(config.includes(`slug: '${oldSlug}', destination: '/autos'`), oldSlug);
  }
  assert.match(config, /cronos-1-3-pack-plus-0km.*fiat-cronos-1-3-pack-plus-0km/);
  assert.match(config, /\.flatMap\(/);
  assert.match(config, /\.\.\.legacyVehicleAliases/);
});
