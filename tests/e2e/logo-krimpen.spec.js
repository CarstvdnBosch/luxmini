// Logo groot → klein (brief 2026-11-14-babynest-media-en-logo, B; criterium 28).
// Bovenaan alleen "LUX" (groot, wit of donker); bij scrollen krimpt het naar het gewone logo "LUX mini", vóór de balk verschijnt.
import { test, expect } from './hulp.js';

const OPENBAAR = ['/', '/werkwijze', '/kraamcadeauboxen', '/prematuurkleding', '/babynest', '/inspiratie', '/contact', '/privacy', '/bedankt', '/bestaat-niet-meer'];
const beweging = page => page.emulateMedia({ reducedMotion: 'no-preference' });
const LEES = () => {
  const g = document.querySelector('.site-header .logo-groot'), k = document.querySelector('.site-header .logo-klein');
  const zicht = e => e && getComputedStyle(e).display !== 'none' && parseFloat(getComputedStyle(e).opacity) > 0.5;
  const gi = g ? [...g.querySelectorAll('img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5) : null;
  const ki = [...k.querySelectorAll('img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5);
  const r = e => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, h: x.height }; };
  return { groot: !!(g && zicht(g)), klein: zicht(k), gi: gi ? { ...r(gi), cls: gi.className, src: gi.getAttribute('src') } : null, ki: ki ? { ...r(ki), cls: ki.className } : null };
};

for (const pad of OPENBAAR) {
  test(`${pad}: bovenaan het grote "LUX", na scrollen het gewone logo`, async ({ page }, info) => {
    await beweging(page);
    await page.goto(pad);
    await page.waitForTimeout(300);
    const boven = await page.evaluate(LEES);
    expect(boven.groot, 'groot logo zichtbaar').toBe(true);
    expect(boven.klein, 'gewone logo nog niet zichtbaar').toBe(false);
    expect(boven.gi.src).toMatch(/logo-lux-groot-(wit|donker)\.png$/);
    // contact: de header ligt over een donkere foto, dus wit
    if (pad === '/contact') expect(boven.gi.cls).toBe('logo-wit');
    // klaar binnen ca. 40% van een schermhoogte (korte pagina's: onderaan) en vóór de balk verschijnt
    const [vh, max] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight - innerHeight]);
    const eind = Math.min(vh * 0.4, max);
    for (let y = 0; y <= eind + 1; y += Math.max(1, eind / 4)) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(60);
      const balk = await page.evaluate(() => { const b = document.querySelector('.balk'); return !!b && b.classList.contains('zichtbaar'); });
      if (balk) { const s = await page.evaluate(LEES); expect(s.klein, `gewone maat vóór de balk (y ${y})`).toBe(true); }
    }
    await page.evaluate(y => window.scrollTo(0, y), eind);
    expect(max, 'de pagina scrolt (anders kan het logo niet krimpen)').toBeGreaterThan(40);
    await page.waitForTimeout(100);
    const na = await page.evaluate(LEES);
    expect(na.klein).toBe(true);
    expect(na.groot).toBe(false);
    expect(Math.round(na.ki.h)).toBe(['mobiel', 'iphone'].includes(info.project.name) ? 36 : 44);
    // terugscrollen: groeit weer
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    expect((await page.evaluate(LEES)).groot).toBe(true);
  });
}

test('wit of donker volgt html.hero-licht', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  expect((await page.evaluate(LEES)).gi.cls).toBe('logo-wit');
  await page.evaluate(() => document.documentElement.classList.add('hero-licht'));
  await page.waitForTimeout(1400); // de wissel duurt 1,2 s
  expect((await page.evaluate(LEES)).gi.cls).toBe('logo-donker');
});

test('desktop: op 1280, 1440 en 1920 px 24 px vrij van het menu en het menu op één regel', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const pad of ['/', '/babynest', '/contact']) {
      await page.goto(pad);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      const m = await page.evaluate(() => {
        const links = [...document.querySelectorAll('.site-header .menu a')];
        const g = [...document.querySelectorAll('.site-header .logo-groot img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5);
        return { rechts: g.getBoundingClientRect().right, eerste: links[0].getBoundingClientRect().left, regels: new Set(links.map(a => Math.round(a.getBoundingClientRect().top))).size };
      });
      expect(m.eerste - m.rechts, `${pad} op ${w} px`).toBeGreaterThanOrEqual(24);
      expect(m.regels).toBe(1);
    }
  }
});

test('op 1024, 768 en 390 px: geen overlap met de burger, en 12 px vrij van de eerste hero-foto en de h1', async ({ page }, info) => {
  await beweging(page);
  const maten = { desktop: [[1024, 768]], tablet: [[768, 1024]], mobiel: [[390, 844]], iphone: [] }[info.project.name];
  test.skip(!maten.length, 'iPhone: zelfde als mobiel');
  for (const [w, h] of maten) {
    await page.setViewportSize({ width: w, height: h });
    for (const pad of ['/', '/babynest', '/kraamcadeauboxen', '/werkwijze', '/contact']) {
      await page.goto(pad);
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => {
        const r = e => e.getBoundingClientRect();
        const g = r([...document.querySelectorAll('.site-header .logo-groot img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5));
        const raakt = (a, b, marge) => !(a.right + marge <= b.left || b.right + marge <= a.left || a.bottom + marge <= b.top || b.bottom + marge <= a.top);
        const burger = r(document.querySelector('.burger'));
        const fotos = [...document.querySelectorAll('.hero .tegel')].filter(t => t.offsetWidth).map(r);
        const h1 = document.querySelector('main h1');
        return { burger: raakt(g, burger, 0), foto: fotos.some(f => raakt(g, f, 12)), h1: h1 ? raakt(g, r(h1), 12) : false };
      });
      expect(m, `${pad} op ${w} px`).toEqual({ burger: false, foto: false, h1: false });
    }
  }
});

test('minder beweging: alleen het gewone logo', async ({ page }) => {
  await page.goto('/babynest'); // hulp.js: reducedMotion reduce
  const m = await page.evaluate(LEES);
  expect(m.groot).toBe(false);
  expect(m.klein).toBe(true);
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('alleen het gewone logo', async ({ page }) => {
    await beweging(page);
    await page.goto('/babynest');
    const m = await page.evaluate(LEES);
    expect(m.groot).toBe(false);
    expect(m.klein).toBe(true);
  });
});

test('binnenkomen halverwege (anker): meteen de maat van die plek', async ({ page }) => {
  await beweging(page);
  await page.goto('/babynest#prijs');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500); // de browser springt naar het anker
  await page.waitForTimeout(50);
  const m = await page.evaluate(() => [getComputedStyle(document.querySelector('.site-header .logo-klein')).opacity, getComputedStyle(document.querySelector('.site-header .logo-groot')).transitionDuration]);
  expect(m[0]).toBe('1');
  expect(m[1], 'geen animatie vanaf groot').toBe('0s');
});

test('geen verspringing van de header tijdens het krimpen (CLS 0)', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  await page.evaluate(() => { window.__verschuiving = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) {
    if (!e.hadRecentInput && e.sources.some(s => s.node && s.node.closest && s.node.closest('.site-header'))) window.__verschuiving += e.value; } }).observe({ type: 'layout-shift', buffered: true }); });
  for (let y = 0; y <= 600; y += 40) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(30); }
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__verschuiving)).toBe(0);
});

test('aria-label en tikdoel van 44 px; het grote beeld voegt geen tweede naam toe', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  const logo = page.locator('.site-header .logo');
  await expect(logo).toHaveAttribute('aria-label', 'LUX mini, naar de homepage');
  expect((await logo.boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.$$eval('.site-header .logo-groot img', i => i.map(x => x.getAttribute('alt')))).toEqual(['', '']);
});
