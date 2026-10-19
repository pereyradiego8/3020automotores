/**
 * Pruebas visuales sin sesión: no necesitan credenciales ni datos de compradores.
 * Ejecutar contra el servidor Next local con Playwright instalado.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000';
const routes = ['/', '/autos', '/marcas', '/nosotros', '/contacto', '/admin/login', '/privacidad'];
const viewports = [
  { label: 'movil-320', width: 320, height: 700 },
  { label: 'movil-390', width: 390, height: 844 },
  { label: 'tablet-768', width: 768, height: 1024 },
  { label: 'desktop-1440', width: 1440, height: 900 },
];
const output = path.resolve('artifacts/visual');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      const name = route === '/' ? 'inicio' : route.replace(/^\//, '').replaceAll('/', '-');
      try {
        const response = await page.goto(new URL(route, baseUrl), { waitUntil: 'domcontentloaded', timeout: 30_000 });
        if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() ?? 'sin respuesta'}`);
        await page.locator('h1').first().waitFor({ timeout: 12_000 });
        const geometry = await page.evaluate(() => {
          const root = document.documentElement;
          const heading = document.querySelector('h1');
          return {
            viewport: window.innerWidth,
            scroll: root.scrollWidth,
            h1Font: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 0,
          };
        });
        if (geometry.scroll > geometry.viewport + 2) {
          throw new Error(`Desborde horizontal: documento ${geometry.scroll}px > viewport ${geometry.viewport}px`);
        }
        if (geometry.h1Font > (viewport.width <= 390 ? 48 : viewport.width < 800 ? 62 : 76)) {
          throw new Error(`Título demasiado grande: ${geometry.h1Font}px`);
        }
        await page.screenshot({ path: path.join(output, `${viewport.label}-${name}.png`), fullPage: true });
        console.log(`OK ${viewport.label} ${route} · ancho ${geometry.viewport}px · h1 ${geometry.h1Font}px`);
      } catch (error) {
        errors.push(`${viewport.label} ${route}: ${error.message}`);
        console.error('FAIL', errors.at(-1));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
if (errors.length) {
  console.error(`FALLÓ la revisión visual en ${errors.length} combinaciones:\n` + errors.join('\n'));
  process.exitCode = 1;
}
