// Logo groot → klein (brief 2026-11-14-babynest-media-en-logo, B; criterium 28).
// Bovenaan alleen "LUX" (groot, wit of donker); bij scrollen krimpt het naar het gewone logo "LUX mini", vóór de balk verschijnt.
import { test, expect } from './hulp.js';

const OPENBAAR = ['/', '/werkwijze', '/kraamcadeauboxen', '/prematuurkleding', '/babynest', '/inspiratie', '/contact', '/privacy', '/bedankt', '/bestaat-niet-meer'];
const beweging = page => page.emulateMedia({ reducedMotion: 'no-preference' });
// groot: het vaste grote "LUX"; klein: "LUX mini" zichtbaar (het gewone logo in beeld, het vaste "LUX mini" op het eindpunt
// of het balklogo); vast: het vaste "LUX mini" zelf. Zichtbaar = getoond, niet verborgen, dekking boven 0,5 en in beeld.
const LEES = () => {
  const g = document.querySelector('.site-header .logo-groot'), k = document.querySelector('.site-header .logo-klein'), v = document.querySelector('.site-header .logo-vast');
  const zicht = e => { if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect();
    return c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.5 && r.bottom > 0 && r.height > 0; };
  const zichtImg = e => e ? [...e.querySelectorAll('img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5 && i.offsetWidth) : null;
  const r = e => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, h: x.height }; };
  const balk = document.querySelector('.balk');
  const balkZicht = !!balk && balk.classList.contains('zichtbaar');
  const bi = balk ? [...balk.querySelectorAll('.links img')].find(i => i.offsetWidth) : null;
  const gi = zichtImg(g), ki = zichtImg(k), vi = zichtImg(v);
  return { groot: zicht(g), vast: zicht(v), kleinHeader: zicht(k), balk: balkZicht, klein: zicht(k) || zicht(v) || balkZicht,
    gi: gi ? { ...r(gi), cls: gi.className, src: gi.getAttribute('src') } : null, ki: ki ? { ...r(ki), cls: ki.className } : null,
    vi: vi ? { ...r(vi), cls: vi.className } : null, bi: bi ? { l: bi.getBoundingClientRect().left, h: bi.offsetHeight } : null, // de balk schuift alleen verticaal
    s: parseFloat(getComputedStyle(document.querySelector('.site-header .logo')).getPropertyValue('--logo-s')) || 1 };
};

// Wacht op de echte toestand in plaats van een vaste tijd: pagina geladen, letters binnen (de menubreedte bepaalt de maat
// van het grote logo), geen intro meer en geen lopende overgangen in de header.
async function rust(page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await expect(page.locator('html')).not.toHaveClass(/\bintro-aan\b/);
  await expect.poll(() => page.evaluate(() => document.querySelector('.site-header').getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
}
// Scrol zonder zacht scrollen (html heeft scroll-behavior: smooth), wacht tot de pagina echt op die plek staat en
// main.js het logo heeft bijgewerkt (requestAnimationFrame na de scroll: twee frames).
async function scrolNaar(page, y) {
  const doel = await page.evaluate(y => {
    const d = Math.round(Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, y)));
    window.scrollTo({ top: d, behavior: 'instant' });
    return d;
  }, y);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(doel);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

for (const pad of OPENBAAR) {
  test(`${pad}: bovenaan het grote "LUX", na scrollen het gewone logo`, async ({ page }, info) => {
    await beweging(page);
    await page.goto(pad);
    await rust(page);
    const boven = await page.evaluate(LEES);
    expect(boven.groot, 'groot logo zichtbaar').toBe(true);
    expect(boven.klein, 'gewone logo nog niet zichtbaar').toBe(false);
    expect(boven.gi.src).toMatch(/logo-lux-groot-(wit|donker)\.png$/);
    // contact: de header ligt over een donkere foto, dus wit
    if (pad === '/contact') expect(boven.gi.cls).toBe('logo-wit');
    // klaar binnen ca. 40% van een schermhoogte (korte pagina's: onderaan) en vóór de balk verschijnt
    const [vh, max] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight - innerHeight]);
    const eind = Math.min(vh * 0.4, max);
    const hBegin = boven.gi.h;
    for (let y = 0; y <= eind + 1; y += Math.max(1, eind / 4)) {
      await scrolNaar(page, y);
      const st = await page.evaluate(LEES);
      // het grote logo blijft in beeld terwijl het krimpt (vast, zoals de burger)
      if (st.groot) expect(st.gi.t, `groot logo in beeld (y ${y})`).toBeGreaterThanOrEqual(0);
      // nooit twee logo's: staat de balk er, dan zijn het vaste "LUX" en "LUX mini" weg zodra de balk is ingeschoven (0,4 s)
      if (st.balk) await expect.poll(async () => { const x = await page.evaluate(LEES); return [x.groot, x.vast]; }, { message: `alleen het balklogo (y ${y})`, timeout: 2000 }).toEqual([false, false]);
    }
    // bij 20% van een schermhoogte (of eerder klaar): in beeld en tussen begin- en eindmaat
    if (vh * 0.2 < eind * 0.8) {
      await scrolNaar(page, vh * 0.2);
      const t = await page.evaluate(LEES);
      expect(t.groot).toBe(true);
      expect(t.gi.t).toBeGreaterThanOrEqual(0);
      expect(t.s).toBeLessThan(1);
      expect(t.gi.h).toBeLessThan(hBegin);
      expect(t.gi.h).toBeGreaterThan(30 * 82 / 93);
    }
    expect(max, 'de pagina scrolt (anders kan het logo niet krimpen)').toBeGreaterThan(40);
    await scrolNaar(page, eind);
    const na = await page.evaluate(LEES);
    expect(na.klein).toBe(true);
    expect(na.groot).toBe(false);
    // "LUX mini" staat op plek en maat van het balklogo; pagina's zonder balk: het gewone logo in de header neemt het over
    // (44 px, mobiel 36 px) en het vaste logo is weg
    if (!na.balk && na.bi) {
      expect(na.vast, 'LUX mini op het eindpunt').toBe(true);
      expect(Math.round(na.vi.h)).toBe(na.bi.h);
      expect(Math.abs(na.vi.l - na.bi.l)).toBeLessThanOrEqual(1);
    } else if (!na.bi) {
      expect(na.vast, 'LUX mini op de plek van het gewone logo').toBe(true);
      expect(Math.round(na.vi.h)).toBe(['mobiel', 'iphone'].includes(info.project.name) ? 36 : 44);
    }
    // terugscrollen: groeit weer
    await scrolNaar(page, 0);
    expect((await page.evaluate(LEES)).groot).toBe(true);
  });
}

test('wit of donker volgt html.hero-licht', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  await rust(page);
  expect((await page.evaluate(LEES)).gi.cls).toBe('logo-wit');
  await page.evaluate(() => document.documentElement.classList.add('hero-licht'));
  await rust(page); // de wissel duurt 1,2 s
  expect((await page.evaluate(LEES)).gi.cls).toBe('logo-donker');
});

test('desktop: menu rechts tegen de burger; op 1440 en 1920 px het grote logo (min. 70 px, 1920 px: 110 px) 24 px vrij van het menu, op 1280 px het gewone logo', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  for (const [w, h] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const pad of ['/', '/babynest', '/contact']) {
      await page.goto(pad);
      await rust(page);
      const m = await page.evaluate(() => {
        const links = [...document.querySelectorAll('.site-header .menu a')];
        const groot = document.querySelector('.site-header .logo-groot');
        const g = [...groot.querySelectorAll('img')].find(i => parseFloat(getComputedStyle(i).opacity) > 0.5);
        const klein = document.querySelector('.site-header .logo-klein');
        return { groot: getComputedStyle(groot).display !== 'none', h: g ? g.getBoundingClientRect().height : 0, rechts: g ? g.getBoundingClientRect().right : 0,
          klein: parseFloat(getComputedStyle(klein).opacity), eerste: links[0].getBoundingClientRect().left,
          menuRechts: links[links.length - 1].getBoundingClientRect().right, burger: document.querySelector('.burger').getBoundingClientRect().left,
          regels: new Set(links.map(a => Math.round(a.getBoundingClientRect().top))).size };
      });
      expect(m.regels, `${pad} op ${w} px: menu op één regel`).toBe(1);
      const vrijBurger = m.burger - m.menuRechts;
      expect(vrijBurger, `${pad} op ${w} px: menu rechts tegen de burger`).toBeGreaterThanOrEqual(12);
      expect(vrijBurger).toBeLessThanOrEqual(32);
      if (w === 1280) {
        expect([m.groot, m.klein], `${pad} op 1280 px: alleen het gewone logo`).toEqual([false, 1]);
      } else {
        expect(m.groot, `${pad} op ${w} px: groot logo`).toBe(true);
        expect(m.h).toBeGreaterThanOrEqual(70);
        if (w === 1920) expect(Math.round(m.h)).toBe(110);
        expect(m.eerste - m.rechts, `${pad} op ${w} px`).toBeGreaterThanOrEqual(24);
      }
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
        return { burger: raakt(g, burger, 0), foto: fotos.some(f => raakt(g, f, 12)), h1: h1 ? raakt(g, r(h1), 12) : false,
          h1vrij: h1 && r(h1).left < g.right ? r(h1).top - g.bottom : null };
      });
      const { h1vrij, ...overlap } = m;
      expect(overlap, `${pad} op ${w} px`).toEqual({ burger: false, foto: false, h1: false });
      // 761–1279 px: minstens 28 px tussen het grote "LUX" en het label (h1) van de subpagina's (ontwerpgate 14 nov.)
      if (w > 760 && h1vrij !== null && h1vrij >= 0) expect(h1vrij, `${pad} op ${w} px: ruimte tot het label`).toBeGreaterThanOrEqual(28);
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
  const m = await page.evaluate(LEES);
  expect([m.klein, m.groot], 'meteen "LUX mini" (balk), geen groot logo').toEqual([true, false]);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.site-header .logo-groot')).transitionDuration), 'geen animatie vanaf groot').toBe('0s');
});

test('geen verspringing van de header tijdens het krimpen (CLS 0)', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  await rust(page);
  await page.evaluate(() => { window.__verschuiving = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) {
    if (!e.hadRecentInput && e.sources.some(s => s.node && s.node.closest && s.node.closest('.site-header'))) window.__verschuiving += e.value; } }).observe({ type: 'layout-shift', buffered: true }); });
  for (let y = 0; y <= 600; y += 40) await scrolNaar(page, y);
  await rust(page); // ook de laatste stand is helemaal verwerkt
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

test('pagina\'s zonder balk (privacy, bedankt, 404): na het krimpen scrolt "LUX mini" mee weg en zweeft het niet boven de tekst', async ({ page }) => {
  await beweging(page);
  for (const pad of ['/privacy', '/bedankt', '/bestaat-niet-meer']) {
    await page.goto(pad);
    await rust(page);
    const [vh, max] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight - innerHeight]);
    const eind = Math.min(vh * 0.4, max);
    await scrolNaar(page, eind);
    const bij = await page.evaluate(LEES);
    if (eind >= max) continue; // de pagina scrolt niet verder dan het eindpunt: niets om te toetsen
    // een stukje verder staat het precies zoveel hoger (het scrolt mee)
    const stap = Math.min(40, max - eind);
    await scrolNaar(page, eind + stap);
    const verder = await page.evaluate(LEES);
    expect(Math.round(bij.vi.t - verder.vi.t), `${pad}: LUX mini scrolt mee`).toBe(Math.round(stap));
    // ver voorbij het eindpunt: geen vast logo meer in beeld
    for (const y of [eind + 200, eind + vh, max]) {
      if (y > max) continue;
      await scrolNaar(page, y);
      const m = await page.evaluate(LEES);
      expect([m.groot, m.vast], `${pad} bij ${Math.round(y)}: geen vast logo in beeld`).toEqual([false, false]);
    }
  }
});

test('bij het overnemen door de balk staat er steeds een logo (eerst het vaste, na het inschuiven het balklogo)', async ({ page }) => {
  await beweging(page);
  await page.goto('/babynest');
  await rust(page);
  const y = await page.evaluate(() => { const k = document.querySelector('main > .pagina-kop'); return k.offsetTop + k.offsetHeight; });
  await scrolNaar(page, y);
  expect((await page.evaluate(LEES)).balk).toBe(true);
  // direct na het verschijnen van de balk is het vaste "LUX mini" er nog (de balk schuift eroverheen)
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.site-header .logo-vast')).visibility)).toBe('visible');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.site-header .logo-vast')).visibility), { timeout: 2000 }).toBe('hidden');
  // terug omhoog: het vaste logo is meteen terug
  await scrolNaar(page, 0);
  expect((await page.evaluate(LEES)).groot).toBe(true);
});
