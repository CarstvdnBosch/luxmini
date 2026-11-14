// Babynest als Media-overzicht (brief 2026-11-14-babynest-media-en-logo, A; criterium 27).
// Boek (001), magazine (002) en tablet (003) om en om, daarna 004 Prijs, 005 Zo werkt het en 006 Contact.
import { test, expect } from './hulp.js';

const SECTIES = [['', '— Babynest'], ['babynest', '001 — Het nest'], ['stof', '002 — De stof'], ['dekentje', '003 — Het dekentje'],
  ['prijs', '004 — Prijs'], ['zo-werkt-het', '005 — Zo werkt het'], ['contact', '006 — Contact']];
const FORMULIER = 'contact.html?onderwerp=babynest#formulier';
const BLOKKEN = [
  { id: 'babynest', kleur: '#B5969E', kop: 'Het nest', pijl: 'Bespreek je idee', href: FORMULIER },
  { id: 'stof', kleur: '#C3CFBC', kop: 'De stof', pijl: 'Bekijk de stoffen', href: 'kraamcadeauboxen.html#stoffen' }, // besluit Carst 14 nov.: dezelfde negen stoffen
  { id: 'dekentje', kleur: '#DEB799', kop: 'Het dekentje', pijl: 'Vraag ernaar', href: FORMULIER },
];
const INKT = 'rgb(32, 32, 32)';
const isTouch = info => ['tablet', 'mobiel', 'iphone'].includes(info.project.name);
const beweging = page => page.emulateMedia({ reducedMotion: 'no-preference' });

test('opbouw: secties, ids, data-labels en de kop', async ({ page }) => {
  await page.goto('/babynest');
  const secties = await page.$$eval('main > section', s => s.map(x => [x.id, x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()]));
  expect(secties).toEqual(SECTIES);
  await expect(page.locator('.pagina-kop h1.caps')).toHaveText('Babynest');
  await expect(page.locator('.pagina-kop .quote.pagina-quote')).toHaveText('Een babynest in de stof en kleur die jij kiest.');
  await expect(page.locator('.pagina-kop a.pijl')).toHaveText('Stuur Carien een bericht');
  await expect(page.locator('.pagina-kop a.pijl')).toHaveAttribute('href', FORMULIER);
  const q = await page.locator('.pagina-kop .quote').evaluate(e => [getComputedStyle(e).color, parseFloat(getComputedStyle(e).fontSize)]);
  expect(q[0]).toBe('rgb(255, 255, 255)');
  expect(q[1]).toBeGreaterThanOrEqual(24);
  // geen WhatsApp, telefoon of mail in de inhoud
  expect(await page.locator('main a[href*="wa.me"], main a[href^="tel:"], main a[href^="mailto:"]').count()).toBe(0);
});

test('per blok: kleur, inkt, één kop, één zin van 16 px en één pijl-link van 44 px', async ({ page }) => {
  await page.goto('/babynest');
  for (const b of BLOKKEN) {
    const s = page.locator(`#${b.id}`);
    await expect(s).toHaveAttribute('data-achtergrond', b.kleur);
    await expect(s.locator('h2')).toHaveCount(1);
    await expect(s.locator('h2')).toHaveText(b.kop);
    await expect(s.locator('.media-zin')).toHaveCount(1);
    await expect(s.locator('a.pijl')).toHaveCount(1);
    await expect(s.locator('a.pijl')).toHaveText(b.pijl);
    await expect(s.locator('a.pijl')).toHaveAttribute('href', b.href);
    expect(await s.locator('button').count(), 'geen knoppen').toBe(0);
    await s.scrollIntoViewIfNeeded();
    const m = await s.evaluate(sec => {
      const z = sec.querySelector('.media-zin'), a = sec.querySelector('a.pijl'), h = sec.querySelector('h2');
      const tekst = [...sec.querySelectorAll('.media-rij > .label, .media-rij > h2, .media-zin, .media-rij > .pijl')].map(e => getComputedStyle(e).color);
      const fs = parseFloat(getComputedStyle(z).fontSize);
      return { fs, fam: getComputedStyle(z).fontFamily, tekens: z.getBoundingClientRect().width / fs, pijlH: a.getBoundingClientRect().height,
        kop: getComputedStyle(h).fontFamily, tekst, label: parseFloat(getComputedStyle(sec.querySelector('.media-rij > .label')).fontSize) };
    });
    expect(m.fs).toBeGreaterThanOrEqual(16);
    expect(m.fam).toContain('Source Sans 3');
    expect(m.tekens, 'regels van hooguit 75 tekens (gem. teken ca. 0,5 em)').toBeLessThanOrEqual(75 * 0.55);
    expect(m.pijlH).toBeGreaterThanOrEqual(44);
    expect(m.kop).toContain('Libre Caslon Display');
    expect(m.label).toBeGreaterThanOrEqual(13);
    expect(m.tekst.every(c => c === INKT), `tekst inkt op ${b.kleur}`).toBe(true);
  }
});

test('de balk toont per blok het juiste label, met het donkere logo op de lichte tinten', async ({ page }) => {
  await page.goto('/babynest');
  for (const [id, label] of SECTIES.slice(1)) {
    await page.evaluate(i => { const e = document.getElementById(i); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 40); }, id);
    await expect(page.locator('.balk .sectie-label')).toHaveText(label);
    if (['babynest', 'stof', 'dekentje'].includes(id)) {
      await expect(page.locator('.balk .logo-donker')).toBeVisible();
      await expect(page.locator('.balk .logo-wit')).toBeHidden();
    }
  }
});

test('maten: geen pagina breder dan het bestand; desktop pagina ≤ 384 px en object ≤ 40%; mobiel 326 × 408; tablet ≤ 560', async ({ page }, info) => {
  await page.goto('/babynest');
  const m = await page.evaluate(() => [...document.querySelectorAll('main .media')].map(s => {
    const o = s.querySelector('.media-object').getBoundingClientRect(), obj = s.querySelector('.obj').getBoundingClientRect();
    return { obj: [o.width, obj.height], vak: document.querySelector('main').clientWidth,
      pag: [...s.querySelectorAll('.blad, .kaft-voor')].filter(e => e.offsetWidth).map(e => e.getBoundingClientRect().width),
      img: [...s.querySelectorAll('.media-object img')].map(i => i.getBoundingClientRect().width) };
  }));
  for (const b of m) {
    expect(Math.max(...b.img), 'nooit vergroot (bestand 768 px)').toBeLessThanOrEqual(768);
    if (info.project.name === 'desktop') {
      expect(Math.max(...b.pag)).toBeLessThanOrEqual(384.5);
      expect(b.obj[0]).toBeLessThanOrEqual(b.vak * 0.41);
    } else if (info.project.name === 'tablet') {
      expect(b.obj[0]).toBeLessThanOrEqual(560.5);
    } else {
      expect(Math.abs(b.obj[0] - 326)).toBeLessThanOrEqual(1);
      expect(Math.abs(b.obj[1] - 408)).toBeLessThanOrEqual(1.5);
    }
  }
});

test('desktop: object en tekstblok samen in één scherm, tekst naast het object, om en om', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await page.goto('/babynest');
  for (const [i, b] of BLOKKEN.entries()) {
    await page.evaluate(id => { const s = document.getElementById(id), r = s.querySelector('.media-rij').getBoundingClientRect(); window.scrollTo(0, r.top + scrollY + r.height / 2 - innerHeight / 2); }, b.id);
    const m = await page.locator(`#${b.id}`).evaluate(s => {
      const r = e => e.getBoundingClientRect();
      const o = r(s.querySelector('.obj')), l = r(s.querySelector('.media-rij > .label')), p = r(s.querySelector('.media-rij > .pijl'));
      return { o: [o.left, o.top, o.right, o.bottom], t: [l.left, l.top, p.right, p.bottom], vh: innerHeight };
    });
    for (const [top, bottom] of [[m.o[1], m.o[3]], [m.t[1], m.t[3]]]) { expect(top).toBeGreaterThanOrEqual(0); expect(bottom).toBeLessThanOrEqual(m.vh); }
    const tekstLinks = m.t[0] < m.o[0];
    expect(tekstLinks, `${b.id}: tekst ${i === 1 ? 'rechts' : 'links'}`).toBe(i !== 1);
    // tekstblok verticaal ongeveer gecentreerd naast het object
    expect(Math.abs((m.t[1] + m.t[3]) / 2 - (m.o[1] + m.o[3]) / 2)).toBeLessThan(120);
  }
});

test('mobiel en tablet: label, object, kop, zin, pijl-link onder elkaar; op 390 × 844 pijl-link in hetzelfde scherm als het label', async ({ page }, info) => {
  test.skip(!isTouch(info), 'alleen touch');
  await page.goto('/babynest');
  for (const b of BLOKKEN) {
    const m = await page.locator(`#${b.id}`).evaluate(s => {
      const els = ['.media-rij > .label', '.media-object', 'h2', '.media-zin', '.media-rij > .pijl'].map(q => s.querySelector(q).getBoundingClientRect());
      return { tops: els.map(r => r.top), label: els[0].top, pijl: els[4].bottom };
    });
    expect([...m.tops].sort((a, b) => a - b)).toEqual(m.tops);
    if (info.project.name === 'mobiel') expect(m.pijl - m.label, `${b.id}: label tot pijl-link past in 844 px`).toBeLessThanOrEqual(844);
  }
});

test('geen horizontaal scrollen, ook halverwege het openslaan van een kaft', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'op 390 en 768 px (Chromium en WebKit)');
  await beweging(page);
  await page.goto('/babynest');
  for (const id of ['babynest', 'stof', 'dekentje']) {
    const top = await page.evaluate(i => document.querySelector(`#${i} .media-object`).getBoundingClientRect().top + scrollY, id);
    for (const f of [0.75, 0.55, 0.4, 0.2]) { // van dicht via half open naar open
      await page.evaluate(([t, f]) => window.scrollTo(0, t - innerHeight * f), [top, f]);
      await page.waitForTimeout(250);
      const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(w[0], `${id} bij ${f}`).toBe(w[1]);
    }
  }
  // halverwege: de kaft staat echt half open
  await page.evaluate(() => { const o = document.querySelector('#babynest .media-object').getBoundingClientRect(); window.scrollTo(0, o.top + scrollY - innerHeight * 0.6); });
  await page.waitForTimeout(400);
  const open = await page.locator('#babynest').evaluate(s => parseFloat(s.style.getPropertyValue('--open')));
  expect(open).toBeGreaterThan(0);
  expect(open).toBeLessThan(1);
});

test('met beweging: het object schuift in, de regels komen op en de kaft slaat open bij scrollen', async ({ page }, info) => {
  await beweging(page);
  await page.goto('/babynest');
  const s = page.locator('#babynest');
  await expect(s).toHaveClass(/\banim\b/);
  await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.5));
  await expect(s).toHaveClass(/\bbinnen\b/);
  await page.waitForTimeout(1700);
  expect(await s.locator('.obj').evaluate(e => getComputedStyle(e).transform)).toBe('none');
  expect(await s.locator('.pijl').evaluate(e => getComputedStyle(e).opacity)).toBe('1');
  // kop, zin en pijl-link staan er voordat de kaft opengaat
  expect(parseFloat(await s.evaluate(e => e.style.getPropertyValue('--open')))).toBeLessThan(1);
  if (info.project.name === 'desktop') {
    // vastgezet: hooguit één schermhoogte extra; aan het eind staat het boek open
    const m = await s.evaluate(e => [e.getBoundingClientRect().height, innerHeight]);
    expect(m[0] - m[1]).toBeLessThanOrEqual(m[1]);
    await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + e.offsetHeight - innerHeight));
  } else {
    await s.evaluate(e => { const o = e.querySelector('.media-object').getBoundingClientRect(); window.scrollTo(0, o.top + scrollY - innerHeight * 0.1); });
  }
  await expect.poll(() => s.evaluate(e => parseFloat(e.style.getPropertyValue('--open')))).toBe(1);
  if (isTouch(info)) expect(await s.locator('.kaft').evaluate(e => getComputedStyle(e).opacity)).toBe('0'); // kaft weg bij 90°
});

test('geen leeg scherm tijdens het scrollen (met beweging)', async ({ page }) => {
  await beweging(page);
  await page.goto('/babynest');
  const leeg = await page.evaluate(async () => {
    const uit = [], h = innerHeight, eind = document.querySelector('#prijs').getBoundingClientRect().top + scrollY;
    for (let y = 0; y < eind; y += h / 3) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
      const iets = [...document.querySelectorAll('main h1, main h2, main p, main a, main img, main .obj')].some(e => {
        const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < h && getComputedStyle(e).visibility === 'visible';
      });
      if (!iets) uit.push(Math.round(y));
    }
    return uit;
  });
  expect(leeg).toEqual([]);
});

test('minder beweging: boek en magazine open, tekst direct, niets schuift; de tablet wisselt zonder te schuiven', async ({ page }, info) => {
  await page.goto('/babynest'); // hulp.js: reducedMotion reduce
  for (const id of ['babynest', 'stof']) {
    const s = page.locator(`#${id}`);
    await expect(s).not.toHaveClass(/\banim\b/);
    const m = await s.evaluate(e => ({ kaft: getComputedStyle(e.querySelector('.kaft')).transform, o: getComputedStyle(e.querySelector('.kaft')).opacity,
      obj: getComputedStyle(e.querySelector('.obj')).transform, regels: [...e.querySelectorAll('.regel')].map(r => getComputedStyle(r).opacity) }));
    expect(m.obj).toBe('none');
    expect(m.regels.every(o => o === '1')).toBe(true);
    if (isTouch(info)) expect(m.o, 'op mobiel de binnenpagina').toBe('0');
    else expect(m.kaft, 'kaft om de rug gedraaid (open)').not.toBe('none');
  }
  // tablet: wisselt van foto op de scrollpositie, zonder overgang
  const t = page.locator('#dekentje');
  expect(await t.locator('.tablet-strook').evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await t.evaluate(e => { const o = e.querySelector('.media-object').getBoundingClientRect(); window.scrollTo(0, o.top + scrollY - innerHeight * 0.1); });
  await expect.poll(() => t.locator('.tablet-strook').evaluate(e => e.style.getPropertyValue('--stap'))).toBe('2');
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('de open spread (mobiel: de binnenpagina) en de eerste tabletfoto zijn zichtbaar, alle links bruikbaar', async ({ page }, info) => {
    await page.goto('/babynest');
    const b = page.locator('#babynest');
    await expect(b.locator('.blad-rechts img')).toBeVisible();
    if (info.project.name === 'desktop') {
      await expect(b.locator('.kaft-achter img')).toBeVisible(); // linkerpagina (de achterkant van de opengeslagen kaft)
      expect(await b.locator('.kaft').evaluate(e => getComputedStyle(e).transform)).not.toBe('none');
    } else {
      expect(await b.locator('.kaft').evaluate(e => getComputedStyle(e).opacity)).toBe('0');
    }
    const eerste = await page.locator('#dekentje').evaluate(s => {
      const sch = s.querySelector('.tablet-scherm').getBoundingClientRect(), i = s.querySelector('.tablet-strook img').getBoundingClientRect();
      return Math.abs(i.left - sch.left) < 1;
    });
    expect(eerste).toBe(true);
    for (const x of BLOKKEN) await expect(page.locator(`#${x.id} a.pijl`)).toBeVisible();
  });
});

test('toegankelijkheid: puntjes aria-hidden en niet focusbaar; elk beeld één keer voorgelezen; width/height en lazy', async ({ page }) => {
  await page.goto('/babynest');
  await expect(page.locator('.tablet-puntjes')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('.tablet-puntjes').evaluate(p => [...p.querySelectorAll('*')].filter(e => e.tabIndex >= 0 || e.matches('a, button')).length)).toBe(0);
  const alts = await page.$$eval('main img', i => i.map(x => x.getAttribute('alt')));
  expect(alts.every(a => a !== null)).toBe(true);
  const gevuld = alts.filter(Boolean);
  expect(new Set(gevuld).size, 'geen dubbel voorgelezen alt').toBe(gevuld.length);
  const media = await page.$$eval('main .media img, #contact img', i => i.map(x => [x.getAttribute('width'), x.getAttribute('height'), x.getAttribute('loading'), x.alt]));
  for (const [w, h, l, alt] of media) { expect([w, h, l]).toEqual(['768', '960', 'lazy']); expect(alt.length).toBeGreaterThan(10); }
  // kleine tekst op de kaften: inkt op een lichte strook, of wit op een donkere sluier
  const strook = await page.locator('.kaft-strook').evaluate(e => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor, parseFloat(getComputedStyle(e).fontSize)]);
  expect(strook).toEqual([INKT, 'rgb(251, 248, 243)', 13]);
  const sluier = await page.locator('.masthead').evaluate(e => getComputedStyle(e).backgroundImage);
  expect(sluier).toContain('rgba(32, 32, 32, 0.72)');
});

test('"Bekijk de stoffen" landt met de kop "De stoffen" onder de vaste balk', async ({ page }) => {
  await page.goto('/kraamcadeauboxen.html#stoffen');
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => { const h = document.getElementById('stoffen'), b = document.querySelector('.balk');
    return [h.textContent.trim(), h.getBoundingClientRect().top, b.classList.contains('zichtbaar') ? b.getBoundingClientRect().bottom : 0, innerHeight]; });
  expect(m[0]).toBe('De stoffen');
  expect(m[1]).toBeGreaterThanOrEqual(m[2]);
  expect(m[1]).toBeLessThan(m[3] / 2);
});
