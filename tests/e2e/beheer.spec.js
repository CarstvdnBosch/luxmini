// Beheer S1 in testmodus (scripts/serveer.mjs, header x-testrol): eerste scherm, rollen, headers en veiligheid.
// Brief 2026-11-07-beheer-administratie: S1 criteria 1–5 en 9, O1, O4, O15, O22, R7–R10, R16.
// De axe-toets van deze schermen staat in beheer-toegankelijkheid.spec.js.
import { readFile, readdir } from 'node:fs/promises';
import { test, expect, wachtOpRust } from './hulp.js';

const ROLLEN = [
  { rol: 'schrijven', email: 'schrijver@voorbeeld.test' },
  { rol: 'lezen', email: 'meekijker@voorbeeld.test' },
];
const TABS = ['Boekingen', 'Overzicht', 'Exporteren'];

for (const { rol, email } of ROLLEN) {
  test.describe(`beheer, rol ${rol}`, () => {
    test.use({ extraHTTPHeaders: { 'x-testrol': rol } });

    test(`eerste scherm: kopregel, tabs en rolregel (${rol})`, async ({ page }) => {
      const fouten = [];
      page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
      page.on('pageerror', (e) => fouten.push(String(e)));
      const verzoeken = [];
      page.on('request', (r) => verzoeken.push(new URL(r.url()).pathname));
      await page.goto('/beheer');
      await wachtOpRust(page);

      // kopregel (criterium 1): logo donker, Administratie, ingelogde, Uitloggen
      await expect(page.locator('header img[src$="logo-luxmini-donker.png"]')).toHaveAttribute('alt', 'LUX mini');
      await expect(page.locator('h1')).toHaveText('Administratie');
      await expect(page.locator('#wie')).toBeVisible();
      await expect(page.locator('#wie')).toContainText(email);
      // criterium 2: Uitloggen gaat naar Access
      await expect(page.getByRole('link', { name: 'Uitloggen' })).toHaveAttribute('href', '/cdn-cgi/access/logout');

      // tabs (O4): drie, op één regel, min. 44 px hoog, Boekingen actief
      const tabs = page.getByRole('tab');
      await expect(tabs).toHaveText(TABS);
      const vakken = await tabs.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: r.height, right: r.right }; }));
      const breedte = await page.evaluate(() => document.documentElement.clientWidth);
      expect(new Set(vakken.map((v) => v.top)).size, 'tabs op één regel').toBe(1);
      for (const v of vakken) { expect(v.h, 'tab min. 44 px hoog').toBeGreaterThanOrEqual(44); expect(v.right).toBeLessThanOrEqual(breedte); }
      await expect(page.getByRole('tab', { name: 'Boekingen' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toHaveCount(1);
      await expect(page.getByRole('tabpanel')).toContainText('Hier komen de boekingen');

      // rol (criterium 1, O15): de regel alleen bij lezen; geen schrijfknoppen
      if (rol === 'lezen') await expect(page.getByText('Je kijkt mee (alleen lezen)')).toBeVisible();
      else await expect(page.getByText('Je kijkt mee (alleen lezen)')).toBeHidden();
      await expect(page.getByRole('button', { name: /nieuwe boeking|importeren|nieuw boekjaar|verwijder|wijzig/i })).toHaveCount(0);

      // O1: geen main.js, style.css, intro, overgang, kleurlaag, balk of collage; noindex
      expect(verzoeken.filter((p) => /main\.js|style\.css/.test(p)), 'main.js en style.css niet geladen').toEqual([]);
      expect(await page.locator('.intro-scherm, .overgang, .achtergrond, .balk, .hero, .tegel, .menu-scherm').count()).toBe(0);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe('smooth');
      expect(fouten, 'geen consolefouten (ook geen CSP-meldingen)').toEqual([]);
    });

    test(`tabs met muis en toetsenbord (${rol})`, async ({ page }, info) => {
      await page.goto('/beheer');
      await page.getByRole('tab', { name: 'Overzicht' }).click();
      await expect(page.getByRole('tab', { name: 'Overzicht' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toContainText('saldi per maand');
      expect(new URL(page.url()).hash).toBe('#overzicht');
      if (info.project.name !== 'desktop') return; // toetsenbord: één keer is genoeg
      await page.getByRole('tab', { name: 'Overzicht' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'Exporteren' })).toBeFocused();
      await expect(page.getByRole('tab', { name: 'Exporteren' })).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'Boekingen' })).toBeFocused();
      await page.keyboard.press('End');
      await expect(page.getByRole('tab', { name: 'Exporteren' })).toBeFocused();
      await page.keyboard.press('Home');
      await expect(page.getByRole('tab', { name: 'Boekingen' })).toBeFocused();
      // focus zichtbaar (O22): 2 px inkt
      const rand = await page.getByRole('tab', { name: 'Boekingen' }).evaluate((e) => { const s = getComputedStyle(e); return [s.outlineStyle, s.outlineWidth, s.outlineColor]; });
      expect(rand).toEqual(['solid', '2px', 'rgb(32, 32, 32)']);
      // Tab gaat van de tabrij naar het paneel
      await page.keyboard.press('Tab');
      await expect(page.locator('#paneel-boekingen')).toBeFocused();
      // een tab-adres opent die tab direct
      await page.goto('/beheer#exporteren');
      await expect(page.getByRole('tab', { name: 'Exporteren' })).toHaveAttribute('aria-selected', 'true');
    });

    test(`mobiel: tikdoelen, 16 px en niets buiten beeld (${rol})`, async ({ page }, info) => {
      test.skip(!['mobiel', 'iphone', 'tablet'].includes(info.project.name), 'alleen op touch');
      await page.goto('/beheer');
      await wachtOpRust(page);
      await expect(page.locator('#wie')).toBeVisible();
      const m = await page.evaluate(() => {
        const zichtbaar = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('[hidden], .sr-only, .skip'); };
        const vw = document.documentElement.clientWidth;
        return {
          klein: [...document.querySelectorAll('a[href], button, [role=tab], input, select, textarea')].filter(zichtbaar)
            .filter((e) => e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 24).map((e) => e.textContent.trim()),
          kleineTekst: [...document.querySelectorAll('p, a, button, li, td, th, label')].filter(zichtbaar)
            .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => e.textContent.trim()),
          buiten: [...document.querySelectorAll('body *')].filter(zichtbaar).filter((e) => { const r = e.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1; }).map((e) => e.className || e.tagName),
          scrollt: document.documentElement.scrollWidth > vw,
          zoom: /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test((document.querySelector('meta[name="viewport"]') || {}).content || ''),
        };
      });
      expect(m.klein, 'tikdoelen kleiner dan 44 px').toEqual([]);
      expect(m.kleineTekst, 'tekst kleiner dan 16 px').toEqual([]);
      expect(m.buiten, 'elementen buiten het scherm').toEqual([]);
      expect(m.scrollt, 'horizontaal scrollen').toBe(false);
      expect(m.zoom, 'zoom geblokkeerd').toBe(false);
    });
  });
}

// ---------- Veiligheid (Gate 4, criterium 4 en 5; R7–R10). HTML is per scherm gelijk: alleen desktop. ----------
test.describe('beheer: veiligheid en headers', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'alleen op desktop'); });

  const R9 = {
    'cache-control': /^no-store$/,
    'x-robots-tag': /^noindex, nofollow$/,
    'referrer-policy': /^no-referrer$/,
    'content-security-policy': /^(?=.*default-src 'self')(?=.*frame-ancestors 'none')(?=.*form-action 'self')(?=.*base-uri 'none')(?!.*unsafe-inline).*$/,
  };

  test('headers van R9 op /beheer, de beheerbestanden en /api/beheer/*', async ({ request }) => {
    for (const pad of ['/beheer', '/beheer/', '/beheer/beheer.css', '/beheer/beheer.js', '/api/beheer/ik', '/api/beheer/boekjaren', '/api/beheer/bestaat-niet']) {
      for (const rol of ['schrijven', 'lezen', 'geen']) {
        const h = (await request.get(pad, { headers: { 'x-testrol': rol }, maxRedirects: 0 })).headers();
        for (const [naam, waarde] of Object.entries(R9)) expect(h[naam], `${pad} (${rol}): ${naam}`).toMatch(waarde);
      }
    }
  });

  test('niet ingelogd: 403 zonder gegevens', async ({ request }) => {
    for (const pad of ['/beheer', '/beheer/beheer.js', '/api/beheer/ik', '/api/beheer/boekjaren', '/api/beheer/boekingen']) {
      const r = await request.get(pad, { headers: { 'x-testrol': 'geen' }, maxRedirects: 0 });
      expect(r.status(), pad).toBe(403);
      expect(await r.text(), pad).not.toMatch(/@|jaar|rol/i);
    }
  });

  test('GET /api/beheer/ik geeft rol en e-mail', async ({ request }) => {
    expect(await (await request.get('/api/beheer/ik', { headers: { 'x-testrol': 'schrijven' } })).json()).toEqual({ rol: 'schrijven', email: 'schrijver@voorbeeld.test' });
    expect(await (await request.get('/api/beheer/ik', { headers: { 'x-testrol': 'lezen' } })).json()).toEqual({ rol: 'lezen', email: 'meekijker@voorbeeld.test' });
  });

  test('schrijfroute: rol lezen 403; zonder of met vreemde Origin 403', async ({ request, baseURL }) => {
    const eigen = new URL(baseURL).origin;
    for (const method of ['post', 'put', 'delete']) {
      const lezen = await request[method]('/api/beheer/boekingen', { headers: { 'x-testrol': 'lezen', Origin: eigen }, data: {} });
      expect(lezen.status(), `${method} met rol lezen`).toBe(403);
    }
    for (const origin of [undefined, 'https://evil.example', 'null']) {
      const headers = { 'x-testrol': 'schrijven', ...(origin ? { Origin: origin } : {}) };
      expect((await request.post('/api/beheer/boekingen', { headers, data: {} })).status(), `POST Origin ${origin}`).toBe(403);
    }
    const goed = await request.post('/api/beheer/boekingen', { headers: { 'x-testrol': 'schrijven', Origin: eigen }, data: {} });
    expect(goed.status(), 'rol schrijven met eigen Origin komt door de controle').not.toBe(403);
  });

  test('robots.txt sluit /beheer uit; sitemap en publieke pagina’s noemen /beheer niet', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toMatch(/^Disallow: \/beheer$/m);
    expect(await (await request.get('/sitemap.xml')).text()).not.toMatch(/beheer/);
    for (const f of (await readdir('public')).filter((f) => f.endsWith('.html'))) {
      expect(await readFile(`public/${f}`, 'utf8'), `public/${f}`).not.toMatch(/beheer/i);
    }
  });
});
