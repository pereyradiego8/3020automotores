import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseVehiclePrice, comparableVehiclePrice, isRecentBlueQuote, MAX_QUOTE_AGE_MS } =
  require('../node_modules/.cache/3020-tests/pricing.js');

test('parses Argentine pesos with thousands separators', () => {
  assert.deepEqual(parseVehiclePrice('$ 28.500.000'), { amount: 28500000, currency: 'ARS' });
  assert.deepEqual(parseVehiclePrice('$ 14.900.000'), { amount: 14900000, currency: 'ARS' });
  assert.deepEqual(parseVehiclePrice('ARS 69000000'), { amount: 69000000, currency: 'ARS' });
});

test('parses USD formats used in the existing inventory', () => {
  assert.deepEqual(parseVehiclePrice('U$D 19.900'), { amount: 19900, currency: 'USD' });
  assert.deepEqual(parseVehiclePrice('USD $ 27,500'), { amount: 27500, currency: 'USD' });
  assert.deepEqual(parseVehiclePrice('U$S 11.900'), { amount: 11900, currency: 'USD' });
});

test('ignores ambiguous or malformed prices', () => {
  for (const input of ['Consultá', '$ 28.50.000', '$ 25,99', '$ 0', 'ARS -900', '$ 2.500 anticipo', '', 'USD 1.5M']) {
    assert.equal(parseVehiclePrice(input), null, input);
  }
});

test('uses the blue sell quote only for USD prices', () => {
  assert.equal(comparableVehiclePrice('$ 28.500.000', 1400), 28500000);
  assert.equal(comparableVehiclePrice('U$D 19.900', 1400), 27860000);
  assert.equal(comparableVehiclePrice('U$D 19.900', null), null);
  assert.equal(comparableVehiclePrice('U$D 19.900', 0), null);
});

test('rejects expired or invalid stored exchange quotes', () => {
  const now = Date.UTC(2026, 9, 14);
  assert.equal(isRecentBlueQuote(1450, now - 60_000, now), true);
  assert.equal(isRecentBlueQuote(1450, now - MAX_QUOTE_AGE_MS - 1, now), false);
  assert.equal(isRecentBlueQuote(1450, now + 1000, now), false);
  assert.equal(isRecentBlueQuote(-1, now, now), false);
});
