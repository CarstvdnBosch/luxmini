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
  return { eind: parseFloat(getComputedStyle(document.querySelector('.site-header .logo')).getPropertyValue('--logo-eind')), groot: zicht(g), vast: zicht(v), kleinHeader: zicht(k), balk: balkZicht, klein: zicht(k) || zicht(v) || balkZicht,
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
    // klaar binnen ca. 40% van een schermhoogte (korte pagina's: onderaan) en vóór de balk verschijnt; main.js kan eerder
    // klaar zijn (het eindpunt ligt boven de eerste tekst, besluit Carst ronde 5) en geeft het eindpunt door (--logo-eind)
    const [vh, max] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight - innerHeight]);
    const eind = boven.eind;
    expect(eind, 'eindpunt binnen 40% van een schermhoogte').toBeLessThanOrEqual(Math.min(vh * 0.4, max) + 0.5);
    expect(eind).toBeGreaterThan(0);
    const hBegin = boven.gi.h;
    for (let y = 0; y <= eind + 1; y += Math.max(1, eind / 4)) {
      await scrolNaar(page, y);
      const st = await page.evaluate(LEES);
      // het grote logo blijft in beeld terwijl het krimpt (vast, zoals de burger)
      if (st.groot) expect(st.gi.t, `groot logo in beeld (y ${y})`).toBeGreaterThanOrEqual(0);
      // nooit twee logo's: staat de balk er, dan zijn het vaste "LUX" en "LUX mini" weg zodra de balk is ingeschoven (0,4 s)
      if (st.balk) await expect.poll(async () => { const x = await page.evaluate(LEES); return [x.groot, x.vast]; }, { message: `alleen het balklogo (y ${y})`, timeout: 2000 }).toEqual([false, false]);
    }
    // halverwege het krimpen: in beeld en tussen begin- en eindmaat
    if (eind >= 8) {
      await scrolNaar(page, eind * 0.5);
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
    // op het eindpunt staat "LUX mini" op plek en maat van het balklogo (de balk is er dan nog niet); pagina's zonder balk:
    // op plek en maat van het gewone logo in de header (44 px, mobiel 36 px)
    expect(na.balk, 'de balk is er op het eindpunt nog niet').toBe(false);
    expect(na.vast, 'LUX mini op het eindpunt').toBe(true);
    if (na.bi) {
      expect(Math.round(na.vi.h)).toBe(na.bi.h);
      expect(Math.abs(na.vi.l - na.bi.l)).toBeLessThanOrEqual(1);
    } else {
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

// CLS van de header (grote "LUX", "LUX mini") over de hele krimp- en wegscrollfase, met en zonder intro; grens 0
const CLS_START = () => { window.__verschuiving = 0; window.__bronnen = []; new PerformanceObserver(l => { for (const e of l.getEntries()) {
  const bron = e.sources.find(s => s.node && s.node.closest && s.node.closest('.site-header'));
  if (!e.hadRecentInput && bron) { window.__verschuiving += e.value; window.__bronnen.push((bron.node.className || bron.node.nodeName) + ' ' + Math.round(scrollY)); } } }).observe({ type: 'layout-shift', buffered: true }); };
for (const metIntro of [false, true]) {
  test(`geen verspringing van de header tijdens het krimpen en wegscrollen (CLS 0), ${metIntro ? 'met' : 'zonder'} intro`, async ({ page }) => {
    await beweging(page);
    await page.addInitScript(CLS_START);
    for (const pad of ['/', '/babynest', '/werkwijze', '/privacy', '/bedankt', '/bestaat-niet-meer']) {
      // de intro komt alleen bij het eerste bezoek per sessie: per pagina een schone sessie of juist "al gezien"
      await page.addInitScript(intro => { try { if (intro) sessionStorage.clear(); else sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } }, metIntro);
      await page.goto(pad);
      // 404 heeft geen intro (geen intro-scherm); op de andere pagina's loopt hij echt
      if (metIntro && pad !== '/bestaat-niet-meer') expect(await page.evaluate(() => document.documentElement.classList.contains('intro-aan')), `${pad}: de intro loopt`).toBe(true);
      await rust(page);
      const [eind, max] = await page.evaluate(() => [parseFloat(getComputedStyle(document.querySelector('.site-header .logo')).getPropertyValue('--logo-eind')), document.documentElement.scrollHeight - innerHeight]);
      const tot = Math.min(max, eind + 300); // het hele krimpen en wegscrollen (het kleine logo is binnen ca. 60 px weg)
      for (let y = 0; y <= tot; y += 20) await scrolNaar(page, y);
      await scrolNaar(page, tot);
      await rust(page); // ook de laatste stand is helemaal verwerkt
      const [cls, bronnen] = await page.evaluate(() => [window.__verschuiving, window.__bronnen]);
      expect(cls, `${pad}: ${bronnen.join(', ')}`).toBe(0);
    }
  });
}

test('aria-label en tikdoel van 44 px; het grote beeld voegt geen tweede naam toe', async ({ page }) => {
  await beweging(page);
  await page.goto('/');
  const logo = page.locator('.site-header .logo');
  await expect(logo).toHaveAttribute('aria-label', 'LUX mini, naar de homepage');
  expect((await logo.boundingBox()).height).toBeGreaterThanOrEqual(44);
  expect(await page.$$eval('.site-header .logo-groot img', i => i.map(x => x.getAttribute('alt')))).toEqual(['', '']);
});

// per pagina een eigen test (stappen van 10 px: zo blijft elke test ruim binnen de tijdgrens, ook op WebKit in CI)
for (const pad of OPENBAAR) {
  test(`${pad}: na het krimpen scrolt "LUX mini" mee weg en ligt het nooit op tekst; daarna neemt de balk over`, async ({ page }) => {
    await beweging(page);
    await page.goto(pad);
    await rust(page);
    const [vh, max, eind] = await page.evaluate(() => [innerHeight, document.documentElement.scrollHeight - innerHeight,
      parseFloat(getComputedStyle(document.querySelector('.site-header .logo')).getPropertyValue('--logo-eind'))]);
    if (eind >= max) return; // de pagina scrolt niet verder dan het eindpunt: niets om te toetsen
    await scrolNaar(page, eind);
    const bij = await page.evaluate(LEES);
    // een stukje verder staat het precies zoveel hoger (het scrolt mee)
    const stap = Math.min(20, max - eind);
    await scrolNaar(page, eind + stap);
    const verder = await page.evaluate(LEES);
    expect(Math.round(bij.vi.t - verder.vi.t), `${pad}: LUX mini scrolt mee`).toBe(Math.round(stap));
    // vanaf het eindpunt tot de balk (of het einde): het vaste logo ligt nergens op tekst, en ver voorbij is het weg
    for (let y = eind; y <= Math.min(max, eind + vh); y += 10) {
      await scrolNaar(page, y);
      const m = await page.evaluate(() => {
        const v = document.querySelector('.site-header .logo-vast'), c = getComputedStyle(v);
        const img = [...v.querySelectorAll('img')].find(i => i.offsetWidth && parseFloat(getComputedStyle(i).opacity) > 0.05);
        if (!img || c.visibility === 'hidden' || parseFloat(c.opacity) <= 0.05) return { op: false };
        const r = img.getBoundingClientRect();
        if (r.bottom <= 0) return { op: false, weg: true };
        const tekst = [...document.querySelectorAll('main p, main h1, main h2, main h3, main li, main dd, main dt, main blockquote, main label, main .caps, main .pijl, footer p, footer a')];
        const raakt = tekst.find(el => [...el.getClientRects()].some(q => q.width > 0 && q.height > 0 && q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top));
        return { op: !!raakt, wat: raakt ? raakt.tagName + ' ' + raakt.textContent.trim().slice(0, 30) : '' };
      });
      expect(m.op, `${pad} bij ${Math.round(y)}: LUX mini op tekst (${m.wat})`).toBe(false);
    }
    // ver voorbij het eindpunt (het kleine logo staat op ca. 13–17 px en is 30–44 px hoog, dus na 80 px weg): niets meer in beeld
    // (een korte pagina die daarvoor ophoudt, toetst de 404-test hieronder: daar vervaagt het)
    for (const y of [eind + 80, eind + 200, eind + vh, max]) {
      if (y > max || y < eind + 80) continue;
      await scrolNaar(page, y);
      const m = await page.evaluate(LEES);
      expect([m.groot, m.vast], `${pad} bij ${Math.round(y)}: geen vast logo in beeld`).toEqual([false, false]);
    }
  });
}

// het vaste "LUX mini" zoals het in beeld staat: zichtbare kopie (wit of donker), dekking en plek
const VAST = () => {
  const v = document.querySelector('.site-header .logo-vast'), c = getComputedStyle(v);
  const img = [...v.querySelectorAll('img')].find(i => i.offsetWidth && parseFloat(getComputedStyle(i).opacity) > 0.05);
  const r = img ? img.getBoundingClientRect() : null;
  return { o: c.visibility === 'hidden' || !img ? 0 : parseFloat(c.opacity), t: r ? r.top : 0, b: r ? r.bottom : 0 };
};

test('404 op een korte pagina (1165–1215 × 768): onderaan nooit een half "LUX mini"', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  for (const w of [1165, 1180, 1190, 1200, 1215]) {
    await page.setViewportSize({ width: w, height: 768 });
    await page.goto('/bestaat-niet-meer');
    await rust(page);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = Math.max(0, max - 30); y <= max; y += 2) {
      await scrolNaar(page, Math.min(y, max));
      const m = await page.evaluate(VAST);
      // zichtbaar is alleen het hele logo; een deel boven de bovenrand mag alleen als het (bijna) weg is of aan het vervagen
      if (Math.min(y, max) === max) expect(m.o <= 0.05 || m.b <= 0 || m.t >= 0, `404 op ${w} px onderaan: half logo (top ${m.t.toFixed(1)}, dekking ${m.o})`).toBe(true);
    }
  }
});

test('homepage: het logo (groot en klein) ligt op geen enkele scrollpositie over een hero-foto', async ({ page }, info) => {
  const maten = { desktop: [[1440, 900], [1920, 1080]], tablet: [[768, 1024]], mobiel: [[390, 844]], iphone: [] }[info.project.name];
  test.skip(!maten.length, 'iPhone: zelfde als mobiel');
  await beweging(page);
  for (const [w, h] of maten) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    await rust(page);
    const eind = (await page.evaluate(LEES)).eind;
    for (let y = 0; y <= eind + 120; y += 5) {
      await scrolNaar(page, y);
      const m = await page.evaluate(() => {
        const zicht = sel => [...document.querySelectorAll(sel)].filter(i => {
          const c = getComputedStyle(i.closest('.logo-groot, .logo-vast'));
          return i.offsetWidth && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0.05 && parseFloat(getComputedStyle(i).opacity) > 0.05;
        }).map(i => i.getBoundingClientRect());
        const logos = [...zicht('.site-header .logo-groot img'), ...zicht('.site-header .logo-vast img')].filter(r => r.bottom > 0);
        const tegels = [...document.querySelectorAll('.hero .tegel')].filter(t => t.offsetWidth).map(t => t.getBoundingClientRect());
        const raak = logos.find(a => tegels.some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top));
        return raak ? `logo ${Math.round(raak.left)},${Math.round(raak.top)}–${Math.round(raak.right)},${Math.round(raak.bottom)}` : '';
      });
      expect(m, `${w} px bij ${y}: logo over een hero-foto`).toBe('');
    }
  }
});

test('bij het verschijnen van de balk is "LUX mini" al weggescrold (nooit twee logo\'s, ook niet een randje); terug omhoog meteen het grote "LUX"', async ({ page }) => {
  await beweging(page);
  for (const pad of ['/babynest', '/kraamcadeauboxen', '/werkwijze', '/contact', '/']) {
    await page.goto(pad);
    await rust(page);
    // zoek de eerste plek (stappen van 10 px) waar de balk verschijnt
    const kop = await page.evaluate(() => { const k = document.querySelector('.hero, main > .pagina-kop, main > .over-kop, main > .contact-kop'); return k.offsetTop + k.offsetHeight; });
    let y = kop - 80;
    await scrolNaar(page, y - 10);
    while (!(await page.evaluate(LEES)).balk && y < kop + 600) { await scrolNaar(page, y); y += 10; }
    expect((await page.evaluate(LEES)).balk, `${pad}: de balk verschijnt`).toBe(true);
    // tijdens het inschuiven van de balk (0,4 s) staat het vaste "LUX mini" al helemaal boven de bovenrand
    const onder = await page.evaluate(async () => { let m = -Infinity; const t0 = performance.now();
      while (performance.now() - t0 < 500) { await new Promise(r => requestAnimationFrame(r)); const i = [...document.querySelectorAll('.site-header .logo-vast img')].find(x => x.offsetWidth && parseFloat(getComputedStyle(x).opacity) > 0.05); if (i) m = Math.max(m, i.getBoundingClientRect().bottom); }
      return m; });
    expect(onder, `${pad}: LUX mini is weg als de balk komt`).toBeLessThanOrEqual(0);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.site-header .logo-vast')).visibility), { timeout: 2000 }).toBe('hidden');
    // terug omhoog: het vaste logo is meteen terug
    await scrolNaar(page, 0);
    expect((await page.evaluate(LEES)).groot).toBe(true);
  }
});
