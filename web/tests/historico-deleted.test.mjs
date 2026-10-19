import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';

test('retired historico folder is absent while the local vehicle photo archive remains', () => {
  assert.equal(existsSync(new URL('../../historico/', import.meta.url)), false);
  const root = new URL('../public/archivos-vehiculos/', import.meta.url);
  assert.ok(existsSync(root));
  assert.ok(readdirSync(root).length > 0);
});
