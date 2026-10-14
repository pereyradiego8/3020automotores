import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the actual TypeScript policy using the project's installed compiler,
// without adding a runtime test dependency or changing the Node.js CI version.
const source = readFileSync(new URL('../src/lib/publication-policy.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { getPublicationIssues } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64')
);

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
