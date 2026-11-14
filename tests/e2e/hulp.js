// Gedeelde hulp voor de harness-tests.
import { test as basis, expect } from '@playwright/test';

// De pagina's die online komen (zelfde lijst als sitemap.xml + de vaste extra's).
export const PAGINAS = [
  { pad: '/', naam: 'home' },
  { pad: '/werkwijze', naam: 'werkwijze' },
  { pad: '/kraamcadeauboxen', naam: 'kraamcadeauboxen' },
  { pad: '/prematuurkleding', naam: 'prematuurkleding' },
  { pad: '/babynest', naam: 'babynest' },
  { pad: '/inspiratie', naam: 'inspiratie' },
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

// Het iframe van Turnstile (brief 2026-11-14-formulier-botbescherming). Cloudflare zet het in een gesloten shadow root binnen
// .turnstile-vak, dus een CSS-locator als '.turnstile-vak iframe' vindt het niet (CI 14 nov.: 30 s "element(s) not found").
// We zoeken het daarom via de frames van de pagina (een frame van challenges.cloudflare.com direct onder de pagina) en geven
// het iframe-element terug zodra het een afmeting heeft. Het moet binnen .turnstile-vak staan (ook door een shadow root heen).
export async function turnstileIframe(page, timeout = 30000) {
  const zoek = () => page.frames().find((f) => f.parentFrame() === page.mainFrame() && /(^|\.)challenges\.cloudflare\.com$/.test(new URL(f.url() || 'about:blank', 'about:blank').hostname || ''));
  let iframe = null;
  await expect.poll(async () => {
    const f = zoek();
    if (!f) return 'geen frame van challenges.cloudflare.com (' + page.frames().map((x) => x.url() || 'about:blank').join(', ') + ')';
    iframe = await f.frameElement().catch(() => null);
    if (!iframe) return 'frame zonder element';
    const b = await iframe.boundingBox();
    return b && b.width > 0 && b.height > 0 ? 'zichtbaar' : `nog zonder afmeting (${b ? `${b.width}×${b.height}` : 'geen box'})`;
  }, { timeout, message: 'het iframe van Turnstile is zichtbaar' }).toBe('zichtbaar');
  const inVak = await iframe.evaluate((el) => {
    for (let n = el; n; n = n.parentNode || n.host) if (n.classList && n.classList.contains('turnstile-vak')) return true;
    return false;
  });
  expect(inVak, 'het iframe van Turnstile staat in .turnstile-vak').toBe(true);
  return iframe;
}
