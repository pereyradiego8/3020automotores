import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { vehicleStructuredData, parseMileageKm, serializeStructuredData } =
  require('../node_modules/.cache/3020-tests/vehicle-seo.js');

const sample = {
  slug: 'fiat-cronos-1-3-pack-plus-0km',
  title: 'FIAT CRONOS 1.3 PACK PLUS 0KM',
  make: 'Fiat',
  model: 'Cronos',
  year: 2026,
  price_text: '$ 32.500.000',
  mileage_text: '0 km',
  description: 'Vehículo publicado por el concesionario.',
  image_urls: [],
};

test('vehicle structured data uses published vehicle fields and Argentine currency', () => {
  const obj = vehicleStructuredData(sample);
  assert.equal(obj['@type'], 'Car');
  assert.equal(obj.name, sample.title);
  assert.equal(obj.brand.name, 'Fiat');
  assert.equal(obj.vehicleModelDate, '2026');
  assert.equal(obj.offers.price, 32500000);
  assert.equal(obj.offers.priceCurrency, 'ARS');
  assert.equal(obj.mileageFromOdometer.value, 0);
  assert.equal(obj.url, 'https://3020automotores.vercel.app/autos/' + sample.slug);
  assert.equal(obj.offers.seller.name, '3020 Automotores');
  assert.ok(!('image' in obj));
});

test('USD offers preserve USD prices rather than applying a blue dollar estimate', () => {
  const obj = vehicleStructuredData({ ...sample, price_text: 'U$D 17.900', mileage_text: '125.000 km' });
  assert.equal(obj.offers.priceCurrency, 'USD');
  assert.equal(obj.offers.price, 17900);
  assert.equal(obj.mileageFromOdometer.value, 125000);
});

test('uncertain commercial values are not published as structured offers', () => {
  const obj = vehicleStructuredData({ ...sample, price_text: 'Consultar financiación', mileage_text: 'Consultar' });
  assert.ok(!('offers' in obj));
  assert.ok(!('mileageFromOdometer' in obj));
});

test('kilometres are not invented from unrelated or ambiguous text', () => {
  assert.equal(parseMileageKm('35.500 km'), 35500);
  assert.equal(parseMileageKm('0km'), 0);
  assert.equal(parseMileageKm('26.5 km'), null);
  assert.equal(parseMileageKm('a confirmar'), null);
});

test('JSON-LD escapes HTML-breaking characters from editable vehicle fields', () => {
  const text = serializeStructuredData({ title: '</script><script>malicious()</script>&' });
  assert.ok(!text.includes('</script>'));
  assert.match(text, /\\u003c/);
  assert.match(text, /\\u0026/);
  assert.deepEqual(JSON.parse(text), { title: '</script><script>malicious()</script>&' });
});
