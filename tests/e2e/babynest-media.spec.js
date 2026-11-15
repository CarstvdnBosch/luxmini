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

// Scrol zonder zacht scrollen (html heeft scroll-behavior: smooth) en wacht tot de pagina echt op die plek staat
// en main.js de stand heeft bijgewerkt (twee frames na de scroll), zodat er op de bedoelde plek gemeten wordt.
async function scrolNaar(page, y) {
  const doel = await page.evaluate(y => {
    const max = document.documentElement.scrollHeight - innerHeight, d = Math.round(Math.max(0, Math.min(max, y)));
    window.scrollTo({ top: d, behavior: 'instant' });
    return d;
  }, y);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBe(doel);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  return doel;
}

test('geen horizontaal scrollen, ook halverwege het openslaan van een kaft', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'op 390 en 768 px (Chromium en WebKit)');
  await beweging(page);
  await page.goto('/babynest');
  for (const id of ['babynest', 'stof', 'dekentje']) {
    const top = await page.evaluate(i => document.querySelector(`#${i} .media-object`).getBoundingClientRect().top + scrollY, id);
    for (const f of [0.75, 0.55, 0.4, 0.2]) { // van dicht via half open naar open
      const vh = await page.evaluate(() => innerHeight);
      await scrolNaar(page, top - vh * f);
      const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(w[0], `${id} bij ${f}`).toBe(w[1]);
    }
  }
  // halverwege: de kaft staat echt half open. Op tablet en mobiel schuift het object eerst in en staat het op zijn plek
  // als de bovenkant van het vak op 0,6 scherm staat (brief 2026-11-15-babynest-mobiel-inschuiven, ontwerp 3); daar begint
  // het openslaan en na een half scherm is de kaft open: p = 0,5 bij de bovenkant op 0,35 scherm. Een blok dat bij het laden
  // onder het scherm staat, loopt mee met scrollen (een blok dat al in beeld staat, schuift op tijd in).
  const blok = await page.evaluate(() => [...document.querySelectorAll('main .media')].filter(s => s.querySelector('.kaft'))
    .map(s => { const t = s.querySelector('.media-object').getBoundingClientRect().top + scrollY; return [s.id, t > innerHeight ? t - innerHeight * 0.35 : -1]; })
    .find(([, y]) => y > 0 && y < document.documentElement.scrollHeight - innerHeight));
  expect(blok, 'een kaft waarvoor halverwege openslaan bestaat').toBeTruthy();
  await scrolNaar(page, 0); // eerst terug naar boven: de kaft gaat dicht
  const [id, y] = blok;
  await scrolNaar(page, y);
  const s = page.locator(`#${id}`);
  await expect(s).toHaveClass(/\bbinnen\b/);
  await expect.poll(() => s.evaluate(e => parseFloat(e.style.getPropertyValue('--open'))), { message: `${id}: --open halverwege` }).toBeGreaterThan(0);
  const open = await s.evaluate(e => parseFloat(e.style.getPropertyValue('--open')));
  expect(open, `${id}: kaft half open`).toBeGreaterThan(0);
  expect(open, `${id}: kaft half open`).toBeLessThan(1);
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(w[0], `${id} halverwege`).toBe(w[1]);
});

test('met beweging: het object schuift in, de regels komen op en de kaft slaat open bij scrollen', async ({ page }, info) => {
  await beweging(page);
  await page.goto('/babynest');
  const s = page.locator('#babynest');
  await expect(s).toHaveClass(/\banim\b/);
  // desktop: het blok op half scherm; tablet en mobiel: het vak boven 0,6 scherm, waar het object op zijn plek staat
  // (brief 2026-11-15-babynest-mobiel-inschuiven, ontwerp 2)
  if (isTouch(info)) await s.evaluate(e => window.scrollTo(0, e.querySelector('.media-object').getBoundingClientRect().top + scrollY - innerHeight * 0.5));
  else await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.5));
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
    // de kaft begint pas bij scrollen open te slaan (ontwerpgate 14 nov.): helemaal open als het object iets boven de rand staat
    await s.evaluate(e => { const o = e.querySelector('.media-object').getBoundingClientRect(); window.scrollTo(0, o.top + scrollY + innerHeight * 0.2); });
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

test('tablet en mobiel: bij binnenkomst is de kaft dicht; tijdens het openslaan blijft hij minstens 12 px onder het label', async ({ page }, info) => {
  test.skip(!isTouch(info) || info.project.name === 'iphone', 'op 768 × 1024 en 390 × 844 (Chromium)');
  await beweging(page);
  await page.goto('/babynest');
  await page.waitForLoadState('load');
  const s = page.locator('#babynest');
  await expect(s).toHaveClass(/\bbinnen\b/); // het eerste blok staat bij binnenkomst (deels) in beeld
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await s.evaluate(e => e.style.getPropertyValue('--open')), 'kaft dicht bij scrollY 0').toBe('0.000');
  let min = Infinity, gezien = 0;
  for (let y = 0; y <= 2400; y += 30) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const r = await page.evaluate(() => [...document.querySelectorAll('main .media')].filter(e => e.querySelector('.kaft') && e.classList.contains('binnen')).map(e => ({
      open: parseFloat(e.style.getPropertyValue('--open')), zicht: e.style.getPropertyValue('--kaft-o') === '1',
      vrij: e.querySelector('.kaft-voor').getBoundingClientRect().top - e.querySelector('.media-rij > .label').getBoundingClientRect().bottom })));
    for (const x of r) if (x.zicht && x.open > 0 && x.open < 1) { gezien++; min = Math.min(min, x.vrij); }
  }
  expect(gezien, 'de kaft draait tijdens het scrollen').toBeGreaterThan(3);
  expect(min, 'bovenkant van de draaiende kaft onder het label').toBeGreaterThanOrEqual(12);
});

test('tablet: de kolom (hooguit 560 px) staat in het midden', async ({ page }, info) => {
  test.skip(info.project.name !== 'tablet', 'alleen tablet');
  for (const w of [768, 1024]) {
    await page.setViewportSize({ width: w, height: 1024 });
    await page.goto('/babynest');
    const m = await page.evaluate(() => [...document.querySelectorAll('main .media')].map(e => {
      const o = e.querySelector('.media-object').getBoundingClientRect(), l = e.querySelector('.media-rij > .label').getBoundingClientRect();
      return { links: o.left, rechts: innerWidth - o.right, label: l.left, breed: o.width };
    }));
    for (const b of m) {
      expect(Math.abs(b.links - b.rechts), `object in het midden op ${w} px`).toBeLessThanOrEqual(1);
      expect(b.breed).toBeLessThanOrEqual(560);
      expect(Math.abs(b.label - b.links), `label links in de kolom op ${w} px`).toBeLessThanOrEqual(1);
    }
  }
});

// ---------- Inschuiven van opzij op tablet en mobiel en een echter boek (brief 2026-11-15-babynest-mobiel-inschuiven) ----------
// Ontwerpcriteria 1–14 van website-ontwerper. Draait op tablet (768, 1024), mobiel (390, 393) en iPhone (WebKit).

// stand van het object: verschuiving x (px) en draai (graden) uit de computed transform
const stand = (page, id) => page.locator(`#${id} .obj`).evaluate(e => {
  const t = getComputedStyle(e).transform;
  if (t === 'none') return { x: 0, rot: 0, none: true };
  const m = new DOMMatrix(t);
  return { x: m.e, rot: Math.atan2(m.b, m.a) * 180 / Math.PI, none: false };
});
// scrol zo dat de bovenkant van het vak (zonder transform) op f × schermhoogte staat. Scrollen gaat per hele pixel:
// 'onder' houdt de bovenkant op of onder die lijn (beginstand), 'boven' op of erboven (eindstand), anders afgerond.
async function vakOp(page, id, f, kant) {
  const y = await page.evaluate(([i, f]) => document.querySelector(`#${i} .media-object`).getBoundingClientRect().top + scrollY - innerHeight * f, [id, f]);
  return scrolNaar(page, kant === 'onder' ? Math.floor(y) : kant === 'boven' ? Math.ceil(y) : y);
}
const lagen = s => s.split(/,(?![^(]*\))/).map(l => l.trim()).filter(Boolean);
const blurVan = l => { const n = l.replace(/rgba?\([^)]*\)|#[0-9a-f]+/gi, '').trim().split(/\s+/).map(parseFloat); return n[2] || 0; };

test('inschuiven: beginstand, halverwege en eindstand volgen .gespiegeld (ontwerp 1–3)', async ({ page }, info) => {
  test.skip(!isTouch(info), 'tablet en mobiel');
  const breedtes = info.project.name === 'tablet' ? [768, 1024] : info.project.name === 'mobiel' ? [390, 393] : [null];
  for (const w of breedtes) {
    if (w) await page.setViewportSize({ width: w, height: info.project.name === 'tablet' ? 1024 : 844 });
    await beweging(page);
    await page.goto('/babynest');
    const vw = await page.evaluate(() => innerWidth);
    // 002 (gespiegeld) en 003 staan bij het laden onder het scherm: ze lopen mee met scrollen
    for (const [id, teken] of [['stof', 1], ['dekentje', -1]]) {
      await vakOp(page, id, 1, 'onder');
      const b = await stand(page, id);
      expect(Math.abs(b.x - teken * vw / 2), `${id} op ${vw}: begin x ${b.x}`).toBeLessThanOrEqual(1);
      expect(Math.abs(b.rot + teken * 12), `${id} op ${vw}: begin draai ${b.rot}`).toBeLessThanOrEqual(0.2);
      const midden = await page.locator(`#${id} .obj`).evaluate(e => { const r = e.getBoundingClientRect(); return (r.left + r.right) / 2; });
      expect(teken > 0 ? midden > vw / 2 : midden < vw / 2, `${id}: midden ${teken > 0 ? 'rechts' : 'links'} van het schermmidden`).toBe(true);
      // halverwege: s 0,5 → e 0,75: x ±vw/8, draai ±3°
      await vakOp(page, id, 0.8);
      const h = await stand(page, id);
      expect(Math.abs(h.x - teken * vw / 8), `${id} op ${vw}: halverwege x ${h.x}`).toBeLessThanOrEqual(2);
      expect(Math.abs(h.rot + teken * 3), `${id} op ${vw}: halverwege draai ${h.rot}`).toBeLessThanOrEqual(0.2);
      // eindstand: geen transform, het vak op zijn plek
      await vakOp(page, id, 0.6, 'boven');
      expect((await stand(page, id)).none, `${id} op ${vw}: eindstand zonder transform`).toBe(true);
      await vakOp(page, id, 0.3);
      expect((await stand(page, id)).none).toBe(true);
      const v = await page.locator(`#${id} .media-object`).evaluate(e => { const r = e.getBoundingClientRect(), o = e.querySelector('.obj').getBoundingClientRect(); return [r.left, r.width, o.height, innerWidth - r.right]; });
      if (vw < 761) {
        expect(Math.abs(v[0] - 32)).toBeLessThanOrEqual(1);
        expect(Math.abs(v[1] - (vw - 64))).toBeLessThanOrEqual(1);
      } else {
        // boek en magazine 560 × 700; de tablet (003) houdt zijn huidige maat (hooguit 560), allemaal in het midden
        if (id === 'stof') expect([Math.round(v[1]), Math.round(v[2])]).toEqual([560, 700]);
        else expect(v[1]).toBeLessThanOrEqual(560);
        expect(Math.abs(v[0] - v[3])).toBeLessThanOrEqual(1);
      }
      // terugscrollen = terugschuiven
      await vakOp(page, id, 0.9);
      expect(Math.abs((await stand(page, id)).rot)).toBeGreaterThan(0.5);
    }
  }
});

test('inschuiven: 001 (boek) komt van links, ook als het meeloopt op een laag scherm', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'op 390 × 400 (001 staat dan bij het laden onder het scherm)');
  await page.setViewportSize({ width: 390, height: 400 });
  await beweging(page);
  await page.goto('/babynest');
  await vakOp(page, 'babynest', 1, 'onder');
  const b = await stand(page, 'babynest');
  expect(Math.abs(b.x + 195)).toBeLessThanOrEqual(1);
  expect(Math.abs(b.rot - 12)).toBeLessThanOrEqual(0.2);
});

test('inschuiven: een object dat bij het laden in beeld staat, schuift één keer op tijd in en blijft staan (ontwerp 2, 4)', async ({ page }, info) => {
  test.skip(!isTouch(info), 'tablet en mobiel');
  await beweging(page);
  await page.goto('/babynest', { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  const begin = await page.evaluate(() => { const r = document.querySelector('#babynest .obj').getBoundingClientRect(); return [(r.left + r.right) / 2, innerWidth]; });
  expect(begin[0], '001 begint links (midden van het object op de schermrand)').toBeLessThan(100);
  // per 100 ms: nooit horizontaal scrollen; na hooguit 1,5 s op zijn plek zonder transform
  let klaarNa = null;
  while (Date.now() - t0 < 2500) {
    const [sw, iw, tr] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, getComputedStyle(document.querySelector('#babynest .obj')).transform]);
    expect(sw, `na ${Date.now() - t0} ms`).toBe(iw);
    if (tr === 'none' && klaarNa === null) klaarNa = Date.now() - t0;
    await page.waitForTimeout(100);
  }
  expect(klaarNa, '001 staat op zijn plek').not.toBeNull();
  expect(klaarNa, `001 op zijn plek na ${klaarNa} ms`).toBeLessThanOrEqual(1500);
  await expect(page.locator('#babynest')).toHaveClass(/\bingeschoven\b/);
  // blijft staan: een klein stukje scrollen schuift het niet terug
  await scrolNaar(page, 40);
  await scrolNaar(page, 0);
  expect((await stand(page, 'babynest')).none).toBe(true);
});

test('openslaan pas als het object op zijn plek staat: --open 0 zolang --in < 1; op 0,55 dicht en op 0,2 open (ontwerp 3, 5)', async ({ page }, info) => {
  test.skip(!isTouch(info), 'tablet en mobiel');
  await beweging(page);
  await page.goto('/babynest');
  await page.waitForTimeout(1600); // 001 schuift op tijd in
  const fouten = await page.evaluate(async () => {
    const uit = [], eind = document.querySelector('#prijs').getBoundingClientRect().top + scrollY;
    const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (let y = 0; y < eind; y += 25) {
      window.scrollTo({ top: y, behavior: 'instant' }); await frame();
      for (const s of document.querySelectorAll('main .media')) {
        if (!s.querySelector('.kaft')) continue;
        const inn = parseFloat(s.style.getPropertyValue('--in')), open = parseFloat(s.style.getPropertyValue('--open'));
        if (inn < 1 && open !== 0) uit.push(`${s.id} y ${y}: --in ${inn}, --open ${open}`);
      }
    }
    return uit;
  });
  expect(fouten).toEqual([]);
  if (info.project.name === 'mobiel') {
    await vakOp(page, 'stof', 0.55, 'onder');
    expect(parseFloat(await page.locator('#stof').evaluate(e => e.style.getPropertyValue('--open')))).toBeLessThanOrEqual(0.02);
    await vakOp(page, 'stof', 0.2, 'boven');
    expect(await page.locator('#stof').evaluate(e => e.style.getPropertyValue('--open'))).toBe('1.000');
  }
});

for (const pad of ['/babynest', '/werkwijze']) {
  test(`geen horizontaal scrollen bij elke scrollstap van 25 px op ${pad} (ontwerp 6)`, async ({ page }, info) => {
    test.skip(!isTouch(info), 'tablet en mobiel (Chromium en WebKit)');
    const breedtes = info.project.name === 'tablet' ? [768, 1024] : info.project.name === 'mobiel' ? [390, 393] : [null];
    for (const w of breedtes) {
      if (w) await page.setViewportSize({ width: w, height: info.project.name === 'tablet' ? 1024 : 844 });
      await beweging(page);
      await page.goto(pad);
      const fouten = await page.evaluate(async () => {
        const uit = [], blokken = [...document.querySelectorAll('main .media')];
        const eind = Math.min(document.documentElement.scrollHeight - innerHeight, blokken[blokken.length - 1].getBoundingClientRect().bottom + scrollY);
        const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        for (let y = 0; y <= eind; y += 25) {
          window.scrollTo({ top: y, behavior: 'instant' }); await frame();
          if (document.documentElement.scrollWidth !== innerWidth) uit.push(`y ${y}: ${document.documentElement.scrollWidth} ≠ ${innerWidth}`);
        }
        return uit;
      });
      expect(fouten, `op ${w || 'iPhone'}`).toEqual([]);
      const ov = await page.evaluate(() => [getComputedStyle(document.documentElement).overflowX, getComputedStyle(document.body).overflowX]);
      expect(ov, 'geen overflow-x op html en body (sticky blijft werken)').toEqual(['visible', 'visible']);
    }
  });
}

test('echter boek en magazine: rug, plat, randen van bladzijden en schaduw (ontwerp 4, 7, 8)', async ({ page }, info) => {
  await page.goto('/babynest'); // minder beweging: alles op zijn plek
  const m = await page.evaluate(() => ['babynest', 'stof'].map(id => {
    const p = document.querySelector(`#${id} .papier`), b = p.querySelector('.blad-rechts'), k = p.querySelector('.kaft-voor');
    const rp = p.getBoundingClientRect(), rb = b.getBoundingClientRect(), voor = getComputedStyle(p, '::before'), na = getComputedStyle(p, '::after');
    return { id, rug: rb.left - rp.left, over: rb.top - rp.top, rechts: rp.right - rb.right, onder: rp.bottom - rb.bottom,
      onderSchaduw: voor.boxShadow, plat: voor.backgroundColor, rugBreed: parseFloat(na.width), rugKleur: na.backgroundColor,
      blad: getComputedStyle(b).boxShadow, kaft: getComputedStyle(k).boxShadow, breed: rp.width, vw: innerWidth };
  }));
  const [boek, mag] = m;
  const mobiel = boek.vw <= 760, desktop = boek.vw >= 1025;
  // drie lagen op de onderste laag, precies de waarden uit het ontwerp
  expect(lagen(boek.onderSchaduw)).toHaveLength(3);
  expect(boek.onderSchaduw).toContain('rgba(32, 32, 32, 0.34)');
  expect(mag.onderSchaduw).toContain('rgba(32, 32, 32, 0.26)');
  for (const x of m) {
    for (const l of lagen(x.blad).concat(lagen(x.kaft))) expect(blurVan(l), `${x.id}: geen blur > 2 px op blad en kaft (${l})`).toBeLessThanOrEqual(2);
  }
  expect(boek.plat).toBe('rgb(140, 110, 88)'); // #8C6E58
  if (desktop) {
    // spread: bladzijde met 4 px overstek (boek), randen 6 px (boek) en 2 px (magazine); pagina ≤ 384 px
    expect(Math.round(boek.over)).toBe(4);
    expect(Math.round(boek.rechts)).toBe(10);
    expect(Math.round(boek.onder)).toBe(10);
    expect(Math.round(mag.over)).toBe(0);
    expect(Math.round(mag.rechts)).toBe(2);
    expect(boek.breed / 2).toBeLessThanOrEqual(384);
  } else {
    // één pagina: rug, overstek en randen
    const [rugB, rugM, ov, rand] = mobiel ? [13, 5, 3, 4] : [22, 8, 4, 6];
    expect(Math.abs(boek.rug - rugB), `rug boek ${boek.rug}`).toBeLessThanOrEqual(1);
    expect(Math.abs(boek.rugBreed - rugB)).toBeLessThanOrEqual(1);
    expect(Math.abs(mag.rug - rugM), `rug magazine ${mag.rug}`).toBeLessThanOrEqual(1);
    expect(Math.abs(mag.rugBreed - rugM)).toBeLessThanOrEqual(1);
    expect(mag.rugKleur).toBe(INKT);
    expect(Math.round(boek.over)).toBe(ov);
    expect(Math.round(boek.rechts)).toBe(ov + rand);
    expect(Math.round(boek.onder)).toBe(ov + rand);
    expect(Math.round(mag.over)).toBe(0);
    expect(Math.round(mag.rechts)).toBe(2);
    expect(Math.round(mag.onder)).toBe(2);
    expect(lagen(boek.blad).filter(l => blurVan(l) === 0)).toHaveLength(rand);
    expect(lagen(mag.blad).filter(l => blurVan(l) === 0)).toHaveLength(2);
  }
});

test('rug, plat en randen zijn alleen opmaak: geen nieuwe elementen, niets voorgelezen (ontwerp 4, 10)', async ({ page }) => {
  await page.goto('/babynest');
  const m = await page.$$eval('main .papier', ps => ps.map(p => ({ kinderen: [...p.children].map(c => c.className), voor: getComputedStyle(p, '::before').content, na: getComputedStyle(p, '::after').content })));
  for (const x of m) {
    expect(x.kinderen).toEqual(['blad blad-rechts', 'kaft']);
    expect(x.voor).toBe('""');
    expect(x.na).toBe('""');
  }
  // dezelfde code op Werkwijze
  await page.goto('/werkwijze');
  const w = await page.locator('#atelier .papier').evaluate(p => [p.children.length, getComputedStyle(p, '::after').content]);
  expect(w).toEqual([2, '""']);
});

test('kleine tekst op de kaften blijft vrij: de strook en de masthead liggen bovenop (ontwerp 9)', async ({ page }, info) => {
  await beweging(page);
  await page.goto('/babynest');
  if (isTouch(info)) {
    await page.waitForTimeout(1600);
    await vakOp(page, 'babynest', 0.6);
  } else {
    await page.waitForTimeout(1700);
  }
  const strook = await page.locator('#babynest .kaft-strook').evaluate(e => {
    const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, el = document.elementFromPoint(x, y);
    return { raak: !!(el && el.closest('.kaft-strook')), r: [r.top, r.bottom, innerHeight], z: getComputedStyle(e).zIndex };
  });
  if (strook.r[0] >= 0 && strook.r[1] <= strook.r[2]) expect(strook.raak, 'midden van de strook is de strook').toBe(true);
  expect(strook.z).toBe('1'); // boven de scharniergroef
  if (isTouch(info)) {
    await vakOp(page, 'stof', 0.6);
    const mh = await page.locator('#stof .masthead-sub').evaluate(e => {
      const r = e.getBoundingClientRect(), el = document.elementFromPoint(r.left + 20, r.top + r.height / 2);
      return !!(el && el.closest('.masthead'));
    });
    expect(mh, 'midden op de masthead is de masthead').toBe(true);
  }
});

test('minder beweging: niets schuift of draait, elk object binnen het scherm, rug en randen wel zichtbaar (ontwerp 11)', async ({ page }) => {
  await page.goto('/babynest'); // hulp.js: reducedMotion reduce
  for (const id of ['babynest', 'stof', 'dekentje']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    const m = await page.locator(`#${id}`).evaluate(s => {
      const o = s.querySelector('.obj'), r = o.getBoundingClientRect(), p = s.querySelector('.papier');
      return { tr: getComputedStyle(o).transform, l: r.left, r: r.right, vw: innerWidth, rug: p ? parseFloat(getComputedStyle(p, '::after').width) : 1 };
    });
    expect(m.tr).toBe('none');
    expect(m.l).toBeGreaterThanOrEqual(0);
    expect(m.r).toBeLessThanOrEqual(m.vw);
    expect(m.rug).toBeGreaterThan(0);
  }
});

test.describe('zonder JavaScript (inschuiven)', () => {
  test.use({ javaScriptEnabled: false });
  test('geen transform op de objecten; elk object helemaal binnen het scherm; rug zichtbaar (ontwerp 11)', async ({ page }) => {
    for (const pad of ['/babynest', '/werkwijze']) {
      await page.goto(pad);
      const m = await page.$$eval('main .media .obj', os => os.map(o => {
        const r = o.getBoundingClientRect(), p = o.closest('.papier') || o.querySelector('.papier') || (o.matches('.papier') ? o : null);
        return { tr: getComputedStyle(o).transform, l: r.left, r: r.right, vw: innerWidth, rug: o.matches('.papier') ? parseFloat(getComputedStyle(o, '::after').width) : 1 };
      }));
      for (const x of m) {
        expect(x.tr).toBe('none');
        expect(x.l).toBeGreaterThanOrEqual(0);
        expect(x.r).toBeLessThanOrEqual(x.vw);
        expect(x.rug).toBeGreaterThan(0);
      }
    }
  });
});

test('desktop: inschuiven ongewijzigd (x ±150% met ±14°, 1,5 s), alleen het uiterlijk is nieuw (ontwerp 12)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  await page.goto('/babynest');
  await page.waitForTimeout(1700); // .anim zet de beginstand met een overgang van 1,5 s
  const m = await page.locator('#stof .obj').evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform);
    return { x: m.e / e.offsetWidth, rot: Math.atan2(m.b, m.a) * 180 / Math.PI, t: getComputedStyle(e).transitionDuration }; });
  expect(Math.abs(m.x + 1.5)).toBeLessThanOrEqual(0.01);
  expect(Math.abs(m.rot + 14)).toBeLessThanOrEqual(0.2);
  expect(m.t.split(', ')[0]).toBe('1.5s');
  expect(await page.locator('#stof').evaluate(e => e.style.getPropertyValue('--in'))).toBe('');
});
