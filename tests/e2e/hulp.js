// Gedeelde hulp voor de harness-tests.
import { test as basis, expect } from '@playwright/test';

// De pagina's die online komen (zelfde lijst als sitemap.xml + de vaste extra's).
export const PAGINAS = [
  { pad: '/', naam: 'home' },
  { pad: '/producten', naam: 'producten' },
  { pad: '/kraamcadeaubox', naam: 'kraamcadeaubox' },
  { pad: '/over', naam: 'over' },
  { pad: '/contact', naam: 'contact' },
  { pad: '/privacy', naam: 'privacy' },
  { pad: '/bedankt', naam: 'bedankt' },
];
export const DOMEIN = 'https://www.luxmini.nl';

// Elke test begint zonder intro (die speelt één keer per sessie) en met minder beweging,
// zodat schermen stilstaan en de tests niet op animaties wachten.
export const test = basis.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await use(page);
  },
});
export { expect };

// Wacht tot lettertypes en foto's binnen zijn (anders verspringen schermen).
export async function wachtOpRust(page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all([...document.images].filter(i => !i.complete && i.loading !== 'lazy').map(i => new Promise(r => { i.onload = i.onerror = r; })));
  });
}
