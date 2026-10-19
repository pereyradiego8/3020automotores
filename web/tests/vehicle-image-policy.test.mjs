import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { classifyVehicleImage } = require('../node_modules/.cache/3020-tests/vehicle-image-policy.js');

const vehicleId = '5c6a77c5-3934-4a2e-96f6-f67b16a0dd0c';
const otherId = 'a07dbbed-bc69-4f13-8715-b0dbb31fa9b1';
const supabase = 'https://zoncelsnskpuninitier.supabase.co';
const historical = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/historico/wp-content/uploads/2026/10/DS3-2019-1-1920x1080.jpg';
const older = 'https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/2020/01/aut3020-blanco.png';
const uploaded = `${supabase}/storage/v1/object/public/vehicle-images/${vehicleId}/front.jpg`;
const allowed = [historical, older, uploaded];

test('retains and reorders historical images already belonging to a vehicle', () => {
  assert.deepEqual(classifyVehicleImage(historical, vehicleId, supabase, allowed), { kind: 'historical', objectPath: null });
  assert.deepEqual(classifyVehicleImage(older, vehicleId, supabase, allowed), { kind: 'historical', objectPath: null });
  assert.deepEqual(classifyVehicleImage(uploaded, vehicleId, supabase, allowed), { kind: 'storage', objectPath: `${vehicleId}/front.jpg` });
});

test('rejects arbitrary new historical or third-party URLs', () => {
  assert.equal(classifyVehicleImage(historical, vehicleId, supabase, [],), null);
  assert.equal(classifyVehicleImage(historical + '?raw=true', vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage('https://evil.example/photo.jpg', vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage(historical.replace('histori' + 'co', 'new-branch'), vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage(historical.replace('2026/10/', '../'), vehicleId, supabase, [historical.replace('2026/10/', '../')]), null);
});

test('enforces vehicle ownership and clean Storage file paths', () => {
  assert.equal(classifyVehicleImage(`${supabase}/storage/v1/object/public/vehicle-images/${otherId}/front.jpg`, vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage(`${supabase}/storage/v1/object/public/vehicle-images/${vehicleId}/%2e%2e/file.jpg`, vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage(uploaded+'?download=1', vehicleId, supabase, allowed), null);
  assert.equal(classifyVehicleImage('http://zoncelsnskpuninitier.supabase.co/storage/v1/object/public/vehicle-images/' + vehicleId + '/front.jpg', vehicleId, supabase, allowed), null);
});

test('server actions reuse the same central historical image policy for save and remove', () => {
  const code = readFileSync(new URL('../src/app/admin/actions.ts', import.meta.url), 'utf8');
  assert.match(code, /classifyVehicleImage\(url, vehicleId, baseUrl, currentUrls\)/);
  assert.match(code, /classifyVehicleImage\(imageUrl, vehicleId, baseUrl, currentUrls\)/);
  assert.doesNotMatch(code, /main\/wp-content\/uploads\//);
});
