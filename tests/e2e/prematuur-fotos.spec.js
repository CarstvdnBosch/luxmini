// Brief 2026-11-14-prematuur-fotos (Story 8): echte prematuurfoto's op Prematuurkleding die bij scrollen inschuiven.
// Criteria 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15 en 16 en de ontwerpcriteria OC1–OC9, OC11 en OC12.
// Criterium 10 (carrousel) geldt niet: 003 Voorbeelden is een vast raster (Ontwerprichting punt 2). OC10 (kleur) is gemeten
// bij het maken van de webversies (Verloop van de brief).
import { test, expect } from './hulp.js';

const FORMULIER = 'contact.html?onderwerp=prematuurkleding#formulier';
// volgorde op de pagina (Ontwerprichting punt 1): G in 001, daarna B, K, A, I, H, J, F, C in 003
const FOTOS = ['prematuur-regenboog-setje', 'prematuur-setjes-rek', 'prematuur-roze-setje', 'prematuur-hangers-mutsjes',
  'prematuur-wit-shirtje-roze', 'prematuur-lieveheersbeestjes', 'prematuur-vestje-blaadjes', 'prematuur-mutsje-blauw', 'prematuur-strik-label'];
// plaats in het raster vanaf 761 px: [klasse, eerste kolom, kolommen, verschuiving desktop, verschuiving tablet]
const RASTER = [['vb-b', 1, 7, 0, 0], ['vb-k', 9, 4, 96, 48], ['vb-a', 1, 5, 0, 0], ['vb-i', 7, 3, 64, 32],
  ['vb-h', 10, 3, 0, 0], ['vb-j', 1, 3, 0, 0], ['vb-f', 5, 5, 0, 0], ['vb-c', 10, 3, 128, 64]];
const INKT = 'rgb(32, 32, 32)';

const fotosOpPagina = page => page.evaluate(async () => {
  const uit = [];
  for (const i of document.querySelectorAll('main img')) {
    const src = i.getAttribute('src');
    if (!/prematuur-/.test(src)) continue;
    const bron = new Image(); bron.src = src;
    try { await bron.decode(); } catch (e) { /* telt hieronder als 0 */ }
    const r = i.getBoundingClientRect();
    uit.push({ src, alt: i.getAttribute('alt') || '', w: +i.getAttribute('width'), h: +i.getAttribute('height'), bw: bron.naturalWidth, bh: bron.naturalHeight,
      lazy: i.getAttribute('loading'), dec: i.getAttribute('decoding'), prio: i.getAttribute('fetchpriority'), b: r.width,
      voorbeeld: !!i.closest('figure.voorbeeld'), in003: !!i.closest('#voorbeelden') });
  }
  return uit;
});

test('foto\'s: negen prematuurfoto\'s in de juiste volgorde, met alt, maten, decoding en lazy (criteria 4, 5, 6; OC3, OC9, OC12)', async ({ page }) => {
  await page.goto('/prematuurkleding');
  const f = await fotosOpPagina(page);
  expect(f.map(x => x.src.replace(/^assets\/img\/|\.jpg$/g, ''))).toEqual(FOTOS);
  expect(f.filter(x => x.in003).length, 'acht foto\'s in 003').toBe(8);
  const html = await page.content();
  expect(html, 'de tijdelijke foto staat niet meer op de pagina').not.toContain('p-broekje-kleur');
  expect(html, 'het commentaar over de tijdelijke foto is weg').not.toMatch(/LET OP:[^>]*tijdelijke foto/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/assets\/img\/prematuur-regenboog-setje\.jpg$/);
  for (const [n, x] of f.entries()) {
    expect(x.w, `${x.src}: width gelijk aan het bestand`).toBe(x.bw);
    expect(x.h, `${x.src}: height gelijk aan het bestand`).toBe(x.bh);
    expect(Math.max(x.w, x.h), `${x.src}: max. 1400 px`).toBeLessThanOrEqual(1400);
    expect(x.dec, `${x.src}: decoding async`).toBe('async');
    // OC12: kledingstuk en "couveuse-" of "prematuur-"; alleen bij I (wit shirtje, sticker leesbaar) maat 38; nooit gewicht of andere maat
    expect(x.alt, `${x.src}: alt noemt couveuse- of prematuurkleding`).toMatch(/couveuse|prematuur/i);
    expect(x.alt.length, `${x.src}: beschrijvende alt`).toBeGreaterThan(40);
    if (x.src.includes('wit-shirtje-roze')) expect(x.alt).toMatch(/maat 38/);
    else expect(x.alt, `${x.src}: geen maat in de alt`).not.toMatch(/maat/i);
    expect(x.alt, `${x.src}: geen gewicht of getal`).not.toMatch(/\d+\s*(g|gr|gram|kg|cm)\b|(?<!maat )\b\d+\b/i);
    // OC9: nooit vergroot (weergave x DPR 2 binnen het grootste bestand; mobiel mag bij DPR 3 krap zijn)
    expect(x.b * 2, `${x.src}: ${x.b.toFixed(0)} px x 2 binnen ${x.w} px`).toBeLessThanOrEqual(x.w + 1);
    if (n === 0) {
      // 15 / OC1: de eerste foto is de LCP-foto en schuift niet in (geen .voorbeeld, dus nooit .inschuif; zie de test inschuiven)
      expect([x.prio, x.lazy, x.voorbeeld, x.in003]).toEqual(['high', null, false, false]);
    } else {
      expect([x.lazy, x.prio, x.voorbeeld], `${x.src}: lazy en een kader dat inschuift`).toEqual(['lazy', null, true]);
    }
  }
});

test('pagina: volgorde, labels, ankers, perzik met inkt en contactmomenten (criteria 7, 11; OC11)', async ({ page }) => {
  await page.goto('/prematuurkleding');
  const s = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(x => {
    const l = x.querySelector('.label');
    return [x.id, x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), l ? l.textContent.trim() : null, x.getAttribute('data-achtergrond')];
  }));
  expect(s.map(x => x.slice(0, 2))).toEqual([['', 'Prematuurkleding'], ['maatwerk', 'Maatwerk'], ['prijs', 'Prijs'],
    ['voorbeelden', 'Voorbeelden'], ['zo-werkt-het', 'Zo werkt het'], ['contact', 'Contact']]);
  for (const x of s.slice(1)) expect(x[2], `${x[0]}: zichtbaar label gelijk aan data-label`).toBe(x[1]);
  expect(s[3][3], '003 op perzik').toBe('#DEB799');
  for (const anker of ['maatwerk', 'prijs', 'zo-werkt-het', 'contact']) {
    await page.goto(`/prematuurkleding#${anker}`);
    // de laatste sectie kan niet tot bovenaan scrollen; in de bovenste helft van het scherm is genoeg
    await expect.poll(() => page.evaluate(a => document.getElementById(a).getBoundingClientRect().top / innerHeight, anker), { message: `#${anker} werkt` }).toBeLessThan(.5);
  }
  // OC11: alle tekst in 003 inkt; de pijl-link minstens 44 px hoog en 16 px groot, naar het formulier
  const v = await page.evaluate(() => {
    const sec = document.getElementById('voorbeelden'), a = sec.querySelector('a.pijl');
    return { kleuren: [...new Set([...sec.querySelectorAll('p, a, span')].map(e => getComputedStyle(e).color))],
      a: [a.textContent.trim(), a.getAttribute('href'), a.getBoundingClientRect().height, parseFloat(getComputedStyle(a).fontSize)],
      figcaption: sec.querySelectorAll('figcaption, figure a, figure button').length };
  });
  expect(v.kleuren).toEqual([INKT]);
  expect(v.a.slice(0, 2)).toEqual(['Bespreek je idee', FORMULIER]);
  expect(v.a[2]).toBeGreaterThanOrEqual(44);
  expect(v.a[3]).toBeGreaterThanOrEqual(16);
  expect(v.figcaption, 'geen bijschrift, links of knoppen in de foto\'s').toBe(0);
  // 11: contactmomenten in de inhoud leiden naar het formulier; geen WhatsApp, telefoon of mail in main
  const links = await page.evaluate(() => [...document.querySelectorAll('main a')].map(a => a.getAttribute('href')));
  expect(links.filter(h => /wa\.me|^tel:|^mailto:/.test(h))).toEqual([]);
  expect([...new Set(links.filter(h => h.startsWith('contact')))]).toEqual([FORMULIER]);
});

test('mobiel: foto G na hooguit één keer scrollen helemaal in beeld (criterium 8, OC1)', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 x 844');
  await page.goto('/prematuurkleding');
  const g = await page.evaluate(() => { const r = document.querySelector('#maatwerk .categorie-foto img').getBoundingClientRect(); return { top: r.top + scrollY, onder: r.bottom + scrollY, h: r.height }; });
  expect(g.h).toBeLessThanOrEqual(844);
  expect(g.onder).toBeLessThanOrEqual(1688);
});

test('raster: kolommen, verschuivingen, linkerrand en hoogte van 003 (OC2, OC4, OC5)', async ({ page }, info) => {
  await page.goto('/prematuurkleding');
  const m = await page.evaluate(() => {
    const raster = document.querySelector('#voorbeelden .voorbeelden'), rr = raster.getBoundingClientRect(), cs = getComputedStyle(raster);
    const figs = [...raster.querySelectorAll('figure')].map(f => { const r = f.getBoundingClientRect(); return { k: [...f.classList].find(c => c.startsWith('vb-')), l: r.left, t: r.top + scrollY, b: r.width, h: r.height, mt: parseFloat(getComputedStyle(f).marginTop) }; });
    const g = document.querySelector('#maatwerk .categorie-foto img').getBoundingClientRect(), mw = document.querySelector('#maatwerk .categorie-rij').getBoundingClientRect();
    return { l: rr.left, w: rr.width, gat: parseFloat(cs.columnGap), rij: parseFloat(cs.rowGap), label: document.querySelector('#voorbeelden .label').getBoundingClientRect().left, figs,
      blok: Math.max(...figs.map(f => f.t + f.h)) - Math.min(...figs.map(f => f.t)), g: [g.width, g.height], maatwerk: mw.height, vh: innerHeight };
  });
  const p = info.project.name;
  // OC5: de eerste kolom begint op de linkerrand van het label (Voorbeelden)
  expect(Math.abs(m.l - m.label)).toBeLessThanOrEqual(1);
  const grens = { desktop: 1650, tablet: 950, mobiel: 1150, iphone: 1150 }[p];
  expect(m.blok, `fotoblok ${m.blok.toFixed(0)} px`).toBeLessThanOrEqual(grens);
  if (p === 'desktop' || p === 'tablet') {
    expect([m.gat, m.rij]).toEqual(p === 'desktop' ? [16, 96] : [12, 56]);
    const kol = (m.w - 11 * m.gat) / 12;
    for (const [k, start, span, mtD, mtT] of RASTER) {
      const f = m.figs.find(x => x.k === k);
      expect(Math.abs(f.l - (m.l + (start - 1) * (kol + m.gat))), `${k}: eerste kolom ${start}`).toBeLessThanOrEqual(1);
      expect(Math.abs(f.b - (span * kol + (span - 1) * m.gat)), `${k}: ${span} kolommen`).toBeLessThanOrEqual(1);
      expect(f.mt, `${k}: verschuiving`).toBe(p === 'desktop' ? mtD : mtT);
      if (p === 'tablet') expect(f.b, `${k}: min. 150 px`).toBeGreaterThanOrEqual(150);
    }
  } else {
    // mobiel: B en A zo breed als de rand toelaat, de paren (breedte - 12) / 2 en rechts 24 px lager
    const vind = k => m.figs.find(x => x.k === k);
    for (const k of ['vb-b', 'vb-a']) expect(Math.abs(vind(k).b - m.w), `${k}: volle breedte`).toBeLessThanOrEqual(1);
    for (const [links, rechts] of [['vb-k', 'vb-i'], ['vb-j', 'vb-h'], ['vb-f', 'vb-c']]) {
      for (const k of [links, rechts]) expect(Math.abs(vind(k).b - (m.w - 12) / 2), `${k}: halve breedte`).toBeLessThanOrEqual(1);
      expect(Math.abs(vind(rechts).t - vind(links).t - 24), `${rechts}: 24 px lager dan ${links}`).toBeLessThanOrEqual(1);
      expect(vind(rechts).l).toBeGreaterThan(vind(links).l);
    }
    const volgorde = [...m.figs].sort((a, b) => a.t - b.t || a.l - b.l).map(f => f.k);
    expect(volgorde).toEqual(['vb-b', 'vb-k', 'vb-i', 'vb-a', 'vb-j', 'vb-h', 'vb-f', 'vb-c']);
  }
  // OC2: op 1440 hooguit 480 x 720 en blok 001 binnen 900 px
  if (p === 'desktop') {
    expect(m.g[0]).toBeLessThanOrEqual(480);
    expect(m.g[1]).toBeLessThanOrEqual(720);
    expect(m.maatwerk).toBeLessThanOrEqual(900);
  }
});

test('compact: geen horizontale scroll en geen leeg scherm (criterium 9, OC4, OC8)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'breedtes worden hier zelf gezet');
  for (const [w, h] of [[360, 780], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/prematuurkleding');
    const r = await page.evaluate(() => {
      const els = [...document.querySelectorAll('main h1, main h2, main p, main a, main img, main li, main blockquote')].filter(e => e.getBoundingClientRect().height > 0)
        .map(e => { const b = e.getBoundingClientRect(); return [b.top + scrollY, b.bottom + scrollY]; }).sort((a, b) => a[0] - b[0]);
      let onder = els[0][1], gat = 0;
      for (const [t, o] of els) { gat = Math.max(gat, t - onder); onder = Math.max(onder, o); }
      return { breed: document.documentElement.scrollWidth - innerWidth, gat, vh: innerHeight };
    });
    expect(r.breed, `${w}: geen horizontale scroll`).toBeLessThanOrEqual(0);
    expect(r.gat, `${w}: geen leeg vlak hoger dan een half scherm`).toBeLessThanOrEqual(r.vh * .5);
  }
});

test('inschuiven: masker en foto in 1,2 s, één keer, met vertraging per plek (criteria 12, 16; OC6, OC8)', async ({ page }, info) => {
  test.skip(info.project.name === 'iphone', 'WebKit: alleen de stilstaande criteria');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/prematuurkleding');
  await page.evaluate(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  const lees = () => page.evaluate(() => [...document.querySelectorAll('#voorbeelden figure')].map(f => {
    const s = getComputedStyle(f), i = getComputedStyle(f.querySelector('img'));
    return { k: [...f.classList].find(c => c.startsWith('vb-')), inschuif: f.classList.contains('inschuif'), in: f.classList.contains('in-beeld'), clip: s.clipPath,
      duur: s.transitionDuration, curve: s.transitionTimingFunction, vertraging: parseFloat(s.transitionDelay), img: i.transform, imgDuur: i.transitionDuration, imgVertraging: parseFloat(i.transitionDelay) };
  }));
  const voor = await lees();
  for (const f of voor) {
    expect([f.inschuif, f.in], `${f.k}: nog niet in beeld`).toEqual([true, false]);
    expect(f.clip, `${f.k}: masker dicht`).toMatch(/^inset\(100% 0(px)?( 0(px)?){0,2}\)$/);
    expect([f.duur, f.imgDuur]).toEqual(['1.2s', '1.2s']);
    expect(f.curve).toBe('cubic-bezier(0.215, 0.61, 0.355, 1)');
    expect(f.img, `${f.k}: foto staat lager en groter`).not.toBe('none');
  }
  const mobiel = info.project.name === 'mobiel';
  const vertraging = mobiel ? { 'vb-b': 0, 'vb-k': 0, 'vb-a': 0, 'vb-i': .15, 'vb-h': .15, 'vb-j': 0, 'vb-f': 0, 'vb-c': .15 }
    : { 'vb-b': 0, 'vb-k': .15, 'vb-a': 0, 'vb-i': .15, 'vb-h': .3, 'vb-j': 0, 'vb-f': .15, 'vb-c': .3 };
  for (const f of voor) expect([f.vertraging, f.imgVertraging], `${f.k}: vertraging`).toEqual([vertraging[f.k], vertraging[f.k]]);
  // tijdens het inschuiven geen horizontale scroll (OC8)
  const breedte = [];
  for (const k of ['vb-b', 'vb-a', 'vb-j']) {
    await page.locator(`#voorbeelden .${k}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    breedte.push(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  expect(Math.max(...breedte)).toBeLessThanOrEqual(0);
  await page.locator('#voorbeelden .pijl').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const na = await lees();
  for (const f of na) {
    expect(f.in, `${f.k}: in beeld`).toBe(true);
    expect(f.clip, `${f.k}: masker open`).toMatch(/^inset\(0(px)?\)$/);
    expect(f.img, `${f.k}: foto op zijn plek`).toBe('none');
  }
  // omhoog scrollen: de klasse blijft staan
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  expect((await lees()).every(f => f.in && f.inschuif)).toBe(true);
  expect(await page.evaluate(() => window.__cls), 'CLS').toBeLessThanOrEqual(0.1);
});

const allesZichtbaar = page => page.evaluate(() => [...document.querySelectorAll('#voorbeelden figure')].map(f => {
  const s = getComputedStyle(f), i = getComputedStyle(f.querySelector('img'));
  return [/^(none|inset\(0(px)?\))$/.test(s.clipPath), i.transform === 'none', s.opacity === '1' && i.opacity === '1'];
}));

test('minder beweging: alle foto\'s direct zichtbaar (criterium 13, OC7)', async ({ page }) => {
  await page.goto('/prematuurkleding');
  const z = await allesZichtbaar(page);
  expect(z.length).toBe(8);
  expect(z.flat().every(Boolean), JSON.stringify(z)).toBe(true);
});

test('zonder JavaScript: alle foto\'s direct zichtbaar (criterium 14, OC7)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop' && info.project.name !== 'mobiel', 'één keer groot en één keer klein');
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: info.project.use.viewport });
  const page = await ctx.newPage();
  await page.goto('/prematuurkleding');
  const z = await allesZichtbaar(page);
  expect(z.length).toBe(8);
  expect(z.flat().every(Boolean), JSON.stringify(z)).toBe(true);
  await ctx.close();
});
