// Homepage op mobiel: 001 Producten in twee stappen zoals Stock (brief 2026-11-15-homepage-mobiel-tweetraps, A).
// Stap 1: effen paletkleur met alleen nr en kop in inkt. Stap 2 (één keer, bovenrand op 50 % van het scherm, focus of tik):
// foto van boven naar beneden met sluier, nr en kop wit, zin en pijl-link komen op. Direct stap 2 na anker of herladen,
// bij minder beweging, zonder JavaScript en op liggende telefoons. Draait in Chromium (eigen schermmaten) én in
// WebKit op de iPhone (390 × 664).
import { test, expect } from './hulp.js';

const BRIEF = 'brief 2026-11-15-homepage-mobiel-tweetraps';
const INKT = 'rgb(32, 32, 32)', WIT = 'rgb(255, 255, 255)', PERZIK = 'rgb(222, 183, 153)';
const BLOKKEN = [['kraamcadeauboxen', PERZIK], ['prematuurkleding', 'rgb(200, 159, 103)'], ['babynest', 'rgb(181, 150, 158)']];
const STAAND = [[360, 740], [390, 844], [430, 932]];

// Chromium: de opgegeven maat. WebKit (project iphone): het toestel zelf (390 × 664 met de balken van Safari).
async function telefoon(browser, info, b, h, extra = {}) {
  const u = info.project.use;
  const basis = info.project.name === 'iphone'
    ? { viewport: u.viewport, screen: u.screen, userAgent: u.userAgent, deviceScaleFactor: u.deviceScaleFactor, isMobile: u.isMobile, hasTouch: u.hasTouch }
    : { viewport: { width: b, height: h }, hasTouch: true, isMobile: true };
  const ctx = await browser.newContext({ ...basis, reducedMotion: 'no-preference', locale: 'nl-NL', baseURL: info.project.use.baseURL, ...extra });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  return ctx;
}
const schermen = info => (info.project.name === 'iphone' ? [[390, 664]] : STAAND);
const alleenTelefoon = info => test.skip(!['mobiel', 'iphone'].includes(info.project.name), 'alleen telefoons (Chromium en WebKit)');

// zet de bovenrand van een blok op een fractie van de schermhoogte
const blokOp = (page, id, f) => page.evaluate(([i, fr]) => { const k = document.getElementById(i);
  window.scrollTo({ top: k.getBoundingClientRect().top + scrollY - innerHeight * fr, behavior: 'instant' }); }, [id, f]);

const LEES = id => {
  const k = document.getElementById(id), r = k.getBoundingClientRect(), q = s => k.querySelector(s);
  const beeld = q('.kern-beeld').getBoundingClientRect(), img = q('.kern-beeld img');
  const stijl = e => getComputedStyle(e);
  return { stap2: k.classList.contains('aangekomen'), direct: k.classList.contains('direct'), stappen: k.closest('.drieluik').classList.contains('stappen'),
    hoogte: r.height, top: r.top, bg: stijl(k).backgroundColor, masker: stijl(q('.kern-masker')).backgroundColor,
    beeld: [beeld.top - r.top, beeld.bottom - r.top, beeld.left - r.left, r.right - beeld.right, r.bottom - beeld.bottom],
    imgTransform: stijl(img).transform, objectFit: stijl(img).objectFit,
    nr: [q('.nr').getBoundingClientRect().top - r.top, stijl(q('.nr')).color],
    kop: [q('h2').getBoundingClientRect().top - r.top, q('h2').getBoundingClientRect().bottom - r.top, stijl(q('h2')).color, parseFloat(stijl(q('h2')).fontSize)],
    zin: [stijl(q('p.klein')).opacity, stijl(q('p.klein')).display, stijl(q('p.klein')).visibility, stijl(q('p.klein')).pointerEvents, stijl(q('p.klein')).color, parseFloat(stijl(q('p.klein')).fontSize), parseFloat(stijl(q('p.klein')).lineHeight), q('p.klein').getBoundingClientRect().width],
    pijl: [stijl(q('a.pijl')).opacity, stijl(q('a.pijl')).display, stijl(q('a.pijl')).visibility, stijl(q('a.pijl')).pointerEvents, stijl(q('a.pijl')).color, parseFloat(stijl(q('a.pijl')).fontSize),
      q('a.pijl').getBoundingClientRect().height, q('a.pijl').tabIndex, q('a.pijl').getAttribute('href')],
    pijlOnder: q('a.pijl').getBoundingClientRect().bottom - r.top - (new DOMMatrix(stijl(q('a.pijl')).transform).m42 || 0),
    verborgen: !!k.querySelector('[aria-hidden="true"]:not(.anker):not(svg)') || !!k.closest('[aria-hidden="true"]'),
    teksten: [q('h2').textContent.replace(/­/g, ''), q('p.klein').textContent, q('a.pijl').textContent.trim()],
    breed: document.documentElement.scrollWidth, vw: innerWidth };
};
const luminantie = c => { const [r, g, b] = c.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [luminantie(a), luminantie(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test.describe('telefoon staand, met beweging', () => {
  test.beforeEach(({}, info) => alleenTelefoon(info));

  // Criteria 1, 3, 4 (stap 1), 5, 13; ontwerpcriteria 1 en 4
  test(`stap 1: paletkleur met nr en kop in inkt, foto buiten de kolom, zin en pijl-link onzichtbaar maar in de DOM (${BRIEF}, criterium 1)`, async ({ browser }, info) => {
    for (const [b, h] of schermen(info)) {
      const ctx = await telefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      for (const [id, kleur] of BLOKKEN) {
        await blokOp(page, id, 0.62);
        await page.waitForTimeout(250);
        const m = await page.evaluate(LEES, id);
        const t = `${b} × ${h} ${id}`;
        expect(m.stappen, `${t}: twee stappen aan`).toBe(true);
        expect(m.stap2, `${t}: nog in stap 1 met de bovenrand op 62 %`).toBe(false);
        expect(m.bg, `${t}: effen paletkleur`).toBe(kleur);
        expect(m.beeld[1], `${t}: foto helemaal buiten de kolom (${m.beeld})`).toBeLessThanOrEqual(0.5);
        expect([m.nr[1], m.kop[2]], `${t}: nr en kop in inkt`).toEqual([INKT, INKT]);
        expect(contrast(INKT, kleur), `${t}: inkt op de paletkleur ≥ 6:1`).toBeGreaterThanOrEqual(6);
        for (const [naam, d] of [['zin', m.zin], ['pijl-link', m.pijl]]) {
          expect(d[0], `${t}: ${naam} opacity 0`).toBe('0');
          expect(d[1], `${t}: ${naam} niet display none`).not.toBe('none');
          expect(d[2], `${t}: ${naam} niet visibility hidden`).toBe('visible');
          expect(d[3], `${t}: ${naam} pointer-events none`).toBe('none');
        }
        expect(m.pijl[7], `${t}: pijl-link focusbaar`).toBe(0);
        expect(m.verborgen, `${t}: geen aria-hidden op de tekst`).toBe(false);
        expect(Math.abs(m.nr[0] - 72), `${t}: nr 72 px onder de bovenrand (${m.nr[0]})`).toBeLessThanOrEqual(2);
        expect(m.kop[3], `${t}: kop 40 px`).toBe(40);
        expect(m.breed, `${t}: geen horizontaal scrollen`).toBe(m.vw);
      }
      await ctx.close();
    }
  });

  // Criteria 2, 4 (overgang), 5, 9; ontwerpcriteria 2, 3, 4, 6, 7
  test(`trigger op 50 %: kop eerst in beeld, dan foto van boven, wit pas op de foto, zin en pijl-link op; één keer (${BRIEF}, criterium 2)`, async ({ browser }, info) => {
    for (const [b, h] of schermen(info)) {
      const ctx = await telefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      for (const [id, kleur] of BLOKKEN) {
        const t = `${b} × ${h} ${id}`;
        // langzaam naderen: van onder het scherm naar 60 %
        for (const f of [1.1, 0.9, 0.75, 0.6]) { await blokOp(page, id, f); await page.waitForTimeout(120); }
        const voor = await page.evaluate(LEES, id);
        expect(voor.stap2, `${t}: op 60 % nog stap 1`).toBe(false);
        const vh = await page.evaluate(() => innerHeight);
        // de kop staat vóór de wissel helemaal in beeld vanaf bovenrand = vh − kopOnder tot de drempel (0,5 vh)
        const ruimte = (vh - voor.kop[1]) - vh * 0.5;
        expect(ruimte, `${t}: kop ${ruimte.toFixed(0)} px scrollen helemaal in beeld vóór de wissel`).toBeGreaterThanOrEqual(vh >= 844 ? 240 : 160);
        // over de drempel: elke frame meten (wit nooit op de paletkleur zonder foto eronder)
        const film = await page.evaluate(async ([i, inkt]) => {
          const k = document.getElementById(i), r0 = k.getBoundingClientRect();
          window.scrollTo({ top: r0.top + scrollY - innerHeight * 0.48, behavior: 'instant' });
          const uit = [], start = performance.now();
          await new Promise(klaar => { const stap = () => { const r = k.getBoundingClientRect(), b = k.querySelector('.kern-beeld').getBoundingClientRect(), h2 = k.querySelector('h2');
            uit.push({ t: performance.now() - start, kleur: getComputedStyle(h2).color, nrKleur: getComputedStyle(k.querySelector('.nr')).color,
              onthuld: b.bottom - r.top, kopOnder: h2.getBoundingClientRect().bottom - r.top, pijlOp: parseFloat(getComputedStyle(k.querySelector('a.pijl')).opacity) });
            if (performance.now() - start < 1700) requestAnimationFrame(stap); else klaar(); }; requestAnimationFrame(stap); });
          return { uit, inkt }; }, [id, INKT]);
        for (const f of film.uit) {
          if (f.kleur !== INKT || f.nrKleur !== INKT) expect(f.onthuld, `${t}: op ${f.t.toFixed(0)} ms is de kop niet meer inkt (${f.kleur}) terwijl de foto pas tot ${f.onthuld.toFixed(0)} px is onthuld`).toBeGreaterThanOrEqual(f.kopOnder);
        }
        const vroeg = film.uit.filter(f => f.t < 150);
        expect(vroeg.every(f => f.kleur === INKT), `${t}: de kop verkleurt niet vóór 0,2 s`).toBe(true);
        const na = await page.evaluate(LEES, id);
        expect(na.stap2 && !na.direct, `${t}: stap 2 met overgang`).toBe(true);
        expect([na.beeld[0], ...na.beeld.slice(2)].every(x => Math.abs(x) <= 1), `${t}: foto vult het blok (${na.beeld})`).toBe(true);
        expect(na.masker, `${t}: ondergrond van de foto #2A1C14`).toBe('rgb(42, 28, 20)');
        expect(na.imgTransform, `${t}: foto niet geschaald`).toBe('none');
        expect(na.objectFit).toBe('cover');
        expect([na.nr[1], na.kop[2], na.zin[4], na.pijl[4]], `${t}: alle tekst wit`).toEqual([WIT, WIT, WIT, WIT]);
        expect([na.zin[0], na.pijl[0]], `${t}: zin en pijl-link zichtbaar`).toEqual(['1', '1']);
        expect([na.zin[3], na.pijl[3]], `${t}: zin en pijl-link bruikbaar`).toEqual(['auto', 'auto']);
        expect(na.hoogte, `${t}: blokhoogte gelijk in stap 1 en 2`).toBe(voor.hoogte);
        expect([na.nr[0], na.kop[0]], `${t}: nr en kop op dezelfde plek (Δy = 0)`).toEqual([voor.nr[0], voor.kop[0]]);
        expect([na.zin[5], na.zin[6]], `${t}: zin 18 px / 1,6`).toEqual([18, 28.8]);
        expect(na.zin[7], `${t}: zin max. 300 px`).toBeLessThanOrEqual(300);
        expect(na.pijl[5], `${t}: pijl-link 16 px`).toBe(16);
        expect(na.pijl[6], `${t}: pijl-link ≥ 44 px`).toBeGreaterThanOrEqual(43.5);
        expect(na.pijlOnder, `${t}: onderkant pijl-link ≤ 340 px onder de bovenrand`).toBeLessThanOrEqual(340);
        expect(film.uit[film.uit.length - 1].pijlOp, `${t}: na 1,5 s stil (pijl-link opacity 1)`).toBe(1);
        expect(na.breed, `${t}: geen horizontaal scrollen`).toBe(na.vw);
      }
      // één keer: terug omhoog en weer omlaag, stap 2 blijft staan
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(400);
      for (const [id] of BLOKKEN) {
        await blokOp(page, id, 0.7);
        await page.waitForTimeout(150);
        const m = await page.evaluate(LEES, id);
        expect([m.stap2, m.pijl[0], m.kop[2]], `${b} × ${h} ${id}: na terugscrollen nog stap 2`).toEqual([true, '1', WIT]);
      }
      await ctx.close();
    }
  });

  // Criterium 4 en de bestaande eis voor de overgangen: duur, vertraging en easing zoals de Ontwerprichting
  test(`overgangen: foto 1 s zonder schaal, kleur 0,4 s na 0,2 s, zin en pijl-link 1 s na 0,3 / 0,4 s (${BRIEF}, ontwerpcriterium 3)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844);
    const page = await ctx.newPage();
    await page.goto('/');
    // eerst wachten tot het aanzetten van de stappen klaar is (.stappen-wissel zet de overgangen twee beelden lang uit)
    await page.waitForFunction(() => { const d = document.querySelector('#producten'); return d.classList.contains('stappen') && !d.classList.contains('stappen-wissel'); });
    const m = await page.evaluate(() => { const k = document.getElementById('prematuurkleding'), s = e => getComputedStyle(k.querySelector(e));
      return { beeld: [s('.kern-beeld').transitionDuration, s('.kern-beeld').transitionTimingFunction, s('.kern-masker').transitionDuration],
        tekst: [s('.kern-tekst').transitionProperty, s('.kern-tekst').transitionDuration, s('.kern-tekst').transitionDelay],
        zin: [s('p.klein').transitionDuration, s('p.klein').transitionDelay], pijl: [s('a.pijl').transitionDuration, s('a.pijl').transitionDelay] }; });
    expect(m.beeld).toEqual(['1s', 'cubic-bezier(0.215, 0.61, 0.355, 1)', '1s']);
    expect(m.tekst).toEqual(['color', '0.4s', '0.2s']);
    expect(m.zin[0].split(', ').every(d => d === '1s') && m.zin[1].split(', ').every(d => d === '0.3s'), `zin ${m.zin}`).toBe(true);
    expect(m.pijl[0].split(', ').every(d => d === '1s') && m.pijl[1].split(', ').every(d => d === '0.4s'), `pijl ${m.pijl}`).toBe(true);
    await ctx.close();
  });

  // Criterium 6 en ontwerpcriterium 8: focus en tik
  test(`focus op de pijl-link in stap 1 zet het blok in hetzelfde frame in stap 2; een tik toont eerst stap 2 (${BRIEF}, criterium 6)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844);
    const page = await ctx.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // focus: met Tab vanaf het label van 001
    await blokOp(page, 'kraamcadeauboxen', 0.7);
    await page.waitForTimeout(200);
    expect((await page.evaluate(LEES, 'kraamcadeauboxen')).stap2).toBe(false);
    const safari = info.project.name === 'iphone';
    if (safari) await page.locator('#kraamcadeauboxen a.pijl').focus(); // Safari tabt standaard niet naar links
    else {
      await page.locator('#producten .kern-label').evaluate(e => { e.tabIndex = -1; e.focus(); });
      await page.keyboard.press('Tab');
    }
    const direct = await page.evaluate(() => { const a = document.activeElement, k = a.closest('.kern-kolom');
      return [a.getAttribute('href'), !!k && k.classList.contains('aangekomen'), getComputedStyle(a).pointerEvents]; });
    expect(direct, 'focus op de pijl-link en meteen stap 2').toEqual(['kraamcadeauboxen.html', true, 'auto']);
    await page.waitForTimeout(1600);
    const focus = await page.evaluate(() => { const a = document.activeElement, s = getComputedStyle(a); return [s.opacity, s.outlineStyle, s.outlineWidth, a.matches(':focus-visible')]; });
    if (safari) expect(focus[0], 'na de overgang: opacity 1').toBe('1');
    else expect(focus, 'na de overgang: opacity 1 en een zichtbare focusrand').toEqual(['1', 'solid', '2px', true]);
    // tik op het blok in stap 1: stap 2, adres blijft gelijk
    await blokOp(page, 'prematuurkleding', 0.62);
    await page.waitForTimeout(250);
    expect((await page.evaluate(LEES, 'prematuurkleding')).stap2).toBe(false);
    const url = page.url();
    const kop = await page.locator('#prematuurkleding h2').boundingBox();
    await page.touchscreen.tap(kop.x + 20, kop.y + kop.height / 2);
    await page.waitForTimeout(300);
    expect(page.url(), 'een tik in stap 1 volgt geen link').toBe(url);
    expect((await page.evaluate(LEES, 'prematuurkleding')).stap2, 'een tik zet het blok in stap 2').toBe(true);
    await page.waitForTimeout(1400);
    // daarna werkt het blok gewoon als link
    await page.touchscreen.tap(kop.x + 20, kop.y + kop.height / 2);
    await page.waitForURL(/prematuurkleding/);
    await ctx.close();
  });

  // Criterium 6 en ontwerpcriterium 8: ankers en herladen halverwege
  test(`ankers en herladen: direct stap 2, kop en pijl-link onder de balk in beeld (${BRIEF}, criterium 6)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844);
    const page = await ctx.newPage();
    for (const [anker, blok] of [['kraamcadeauboxen', 'kraamcadeauboxen'], ['kraamcadeaubox', 'kraamcadeauboxen'], ['prematuurkleding', 'prematuurkleding'], ['prematuur', 'prematuurkleding'], ['babynest', 'babynest']]) {
      await page.goto(`/#${anker}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const m = await page.evaluate(([id]) => { const k = document.getElementById(id), balk = document.querySelector('.balk'), a = k.querySelector('a.pijl');
        return { stap2: k.classList.contains('aangekomen'), direct: k.classList.contains('direct'), op: getComputedStyle(a).opacity, kleur: getComputedStyle(k.querySelector('h2')).color,
          onderBalk: balk.classList.contains('zichtbaar') ? balk.getBoundingClientRect().bottom : 56, kop: k.querySelector('h2').getBoundingClientRect().top,
          pijl: a.getBoundingClientRect().bottom, vh: innerHeight }; }, [blok]);
      expect([m.stap2, m.direct, m.op, m.kleur], `#${anker}: direct stap 2 zonder overgang`).toEqual([true, true, '1', WIT]);
      expect(m.kop, `#${anker}: kop onder de balk`).toBeGreaterThanOrEqual(m.onderBalk - 1);
      expect(m.pijl, `#${anker}: pijl-link binnen het scherm`).toBeLessThanOrEqual(m.vh + 0.5);
    }
    // anker op de pagina zelf (hashchange)
    await page.goto('/');
    await page.evaluate(() => { location.hash = 'babynest'; });
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => ['kraamcadeauboxen', 'prematuurkleding', 'babynest'].map(i => document.getElementById(i).classList.contains('aangekomen'))), 'hashchange: blok en blokken erboven in stap 2').toEqual([true, true, true]);
    // herladen halverwege het tweede blok
    await page.goto('/');
    await blokOp(page, 'prematuurkleding', -0.1);
    await page.waitForTimeout(300);
    await page.reload();
    await page.waitForTimeout(300);
    const her = await page.evaluate(() => { const k = document.getElementById('prematuurkleding');
      return [scrollY > 0, k.classList.contains('aangekomen'), getComputedStyle(k.querySelector('a.pijl')).opacity]; });
    if (her[0]) expect(her.slice(1), 'na herladen halverwege: stap 2').toEqual([true, '1']);
    await ctx.close();
  });

  // Criterium 10 en ontwerpcriterium 10: balk boven het drieluik perzik in stap 1 en stap 2
  test(`balk boven het drieluik: perzik, donker logo, label in inkt, in stap 1 en 2 (${BRIEF}, criterium 10)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844);
    const page = await ctx.newPage();
    await page.goto('/');
    const balk = () => page.evaluate(() => { const b = document.querySelector('.balk');
      return [b.classList.contains('zichtbaar'), getComputedStyle(b).backgroundColor, getComputedStyle(b.querySelector('.logo-donker')).display, getComputedStyle(b.querySelector('.sectie-label')).color]; });
    // blok 2 nog in stap 1 terwijl de balk boven het drieluik staat
    await blokOp(page, 'kraamcadeauboxen', 0.4);
    await page.waitForTimeout(300);
    await blokOp(page, 'prematuurkleding', 0.62);
    await page.waitForTimeout(1400);
    expect((await page.evaluate(LEES, 'prematuurkleding')).stap2, 'blok 2 nog in stap 1').toBe(false);
    expect(await balk(), 'stap 1').toEqual([true, PERZIK, 'block', INKT]);
    await blokOp(page, 'prematuurkleding', -0.02);
    await page.waitForTimeout(1400);
    expect((await page.evaluate(LEES, 'prematuurkleding')).stap2, 'blok 2 in stap 2').toBe(true);
    expect(await balk(), 'stap 2').toEqual([true, PERZIK, 'block', INKT]);
    await ctx.close();
  });
});

// Criteria 7, 8 en liggend; ontwerpcriterium 9: direct stap 2
test.describe('direct stap 2', () => {
  test.beforeEach(({}, info) => alleenTelefoon(info));
  const STAP2 = async (page, t, wacht = 0) => {
    for (const [id] of BLOKKEN) {
      if (wacht) { await blokOp(page, id, 0); await page.waitForTimeout(wacht); }
      const m = await page.evaluate(LEES, id);
      expect(m.stappen, `${t} ${id}: geen twee stappen`).toBe(false);
      // staand vult de foto het blok; liggend de rechterhelft (55 %)
      expect([m.beeld[0], m.beeld[3], m.beeld[4]].every(x => Math.abs(x) <= 1) && m.beeld[1] > 1, `${t} ${id}: foto in beeld (${m.beeld})`).toBe(true);
      expect([m.zin[0], m.pijl[0], m.pijl[3]], `${t} ${id}: zin en pijl-link zichtbaar en bruikbaar`).toEqual(['1', '1', 'auto']);
      expect([m.nr[1], m.kop[2], m.zin[4], m.pijl[4]], `${t} ${id}: tekst wit`).toEqual([WIT, WIT, WIT, WIT]);
      expect(m.breed, `${t}: geen horizontaal scrollen`).toBe(m.vw);
    }
  };
  test(`minder beweging: elk blok meteen in stap 2, zonder overgang (${BRIEF}, criterium 7)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844, { reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    await STAP2(page, 'minder beweging');
    const duur = await page.evaluate(() => [...document.querySelectorAll('#producten .kern-beeld, #producten .kern-masker, #producten .kern-tekst')].map(e => getComputedStyle(e).transitionDuration));
    expect(duur.every(d => d.split(', ').every(x => parseFloat(x) === 0)), `transition-duration 0 (${duur})`).toBe(true);
    await ctx.close();
  });
  test(`liggend (844 × 390): direct stap 2 zoals na #88 (${BRIEF}, ontwerpcriterium 9)`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'mobiel', 'liggend gemeten in Chromium');
    const ctx = await telefoon(browser, info, 844, 390);
    const page = await ctx.newPage();
    await page.goto('/');
    await STAP2(page, 'liggend', 1500); // per blok in beeld: de pijl-link komt op zoals na #88 (.opkomen, 0,9 s)
    expect(await page.evaluate(() => getComputedStyle(document.getElementById('prematuurkleding')).backgroundColor), 'liggend: tekst op #2A1C14').toBe('rgb(42, 28, 20)');
    await ctx.close();
  });
  test(`zonder JavaScript: elk blok in stap 2 met foto, kop, zin en pijl-link (${BRIEF}, criterium 8)`, async ({ browser }, info) => {
    const ctx = await telefoon(browser, info, 390, 844, { javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await STAP2(page, 'zonder JS');
    await ctx.close();
  });
});

// Criterium 12: desktop en touch-tablets krijgen geen twee stappen
test(`desktop en tablet: geen twee stappen in het drieluik (${BRIEF}, criterium 12)`, async ({ page }, info) => {
  test.skip(!['desktop', 'tablet'].includes(info.project.name), 'alleen vanaf 761 px');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const m = await page.evaluate(() => [document.querySelector('#producten').classList.contains('stappen'), getComputedStyle(document.querySelector('#prematuurkleding .kern-tekst')).color]);
  expect(m).toEqual([false, INKT]);
  // door het drieluik scrollen en focus op een pijl-link: op desktop en tablet geen .aangekomen (controleur: observers alleen t/m 760 px)
  for (const id of ['kraamcadeauboxen', 'prematuurkleding', 'babynest']) {
    await page.evaluate(i => { const k = document.getElementById(i); window.scrollTo({ top: k.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }); }, id);
    await page.waitForTimeout(150);
  }
  await page.locator('#prematuurkleding a.pijl').focus();
  const na = await page.evaluate(() => [[...document.querySelectorAll('#producten .kern-kolom')].filter(k => k.classList.contains('aangekomen') || k.classList.contains('direct')).length,
    [...document.querySelectorAll('#producten .kern-beeld img')].map(i => i.getAttribute('loading'))]);
  expect(na[0], 'geen .aangekomen of .direct op desktop en tablet').toBe(0);
  // touch-tablet: geen muis, dus ook drieIo zet de foto's niet op eager; ze blijven lazy
  if (info.project.name === 'tablet') expect(na[1], 'tablet: foto\'s blijven lazy').toEqual(['lazy', 'lazy', 'lazy']);
});
