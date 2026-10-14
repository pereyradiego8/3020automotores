import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// npm test compiles the actual TypeScript policy to a temporary ignored directory.
// This keeps the tests compatible with Node.js 20 and TypeScript 7.
const require = createRequire(import.meta.url);
const { getPublicationIssues } = require('../node_modules/.cache/3020-tests/publication-policy.js');

const complete = {
  title: 'Peugeot 2008 2022',
  make: 'Peugeot',
  model: '2008',
  year: 2022,
  price_text: 'USD 19.900',
  description: 'Unidad con ficha comercial revisada.',
  image_urls: ['https://example.com/auto.jpg'],
};

test('a complete vehicle can be published', () => {
  assert.deepEqual(getPublicationIssues(complete), []);
});

test('rejects a blank price, description, and image list', () => {
  assert.deepEqual(getPublicationIssues({
    ...complete,
    price_text: '   ',
    description: null,
    image_urls: [],
  }), ['precio', 'descripción', 'al menos una foto']);
});

test('rejects missing vehicle identity and invalid years', () => {
  assert.deepEqual(getPublicationIssues({
    ...complete,
    title: '',
    make: null,
    model: ' ',
    year: 1900,
  }), ['título', 'marca', 'modelo', 'año válido']);
});

test('rejects image lists containing only empty URLs', () => {
  assert.deepEqual(getPublicationIssues({
    ...complete,
    image_urls: ['', '   '],
  }), ['al menos una foto']);
});
