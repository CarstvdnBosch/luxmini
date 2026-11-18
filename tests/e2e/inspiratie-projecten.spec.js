// Brief 2026-11-15-inspiratie-projecten: Inspiratie als projecten (zoals Projecten op Stock), elk onderwerp een eigen pagina.
// Criteria 1, 3, 8, 10, 12–14, 17, 18, 21–24 en de ontwerpcriteria OC1–OC7, OC9–OC13, OC15–OC19.
// Draait op desktop, tablet, mobiel en iPhone (WebKit); wat alleen op een bepaald scherm geldt, staat bij de test.
import { test, expect, wachtOpRust } from './hulp.js';

const OP_MAAT = 'contact.html?onderwerp=iets-op-maat-laten-maken#formulier';
const PROJECTEN = [
  { id: 'kleding', naam: 'Kleding', kort: 'Kleding', pad: '/inspiratie-kleding', licht: 'rgb(222, 183, 153)', diep: 'rgb(200, 134, 84)',
    links: [['Bespreek je idee', OP_MAAT]],
    fotos: ['p-sjaaltje-kleur', 'p-shirtje-kleur', 'p-shirtje-roze-kleur-vierkant', 'p-broekje-kleur', 'p-broekje-vos', 'ig-outfit-ladder', 'ig-jasje-teddy', 'ig-jasje-tricot'] },
  { id: 'textiel', naam: 'Knuffels, swaddles en babynest', kort: 'Knuffels', pad: '/inspiratie-knuffels-en-babynest', licht: 'rgb(181, 150, 158)', diep: 'rgb(174, 140, 148)',
    links: [['Bespreek je idee', OP_MAAT]],
    fotos: ['p-swaddle-open-kleur', 'p-knuffel-naam', 'ig-babynest', 'p-swaddle-strik-kleur'] },
  { id: 'siliconen', naam: 'Siliconen en hangers', kort: 'Siliconen', pad: '/inspiratie-siliconen-en-hangers', licht: 'rgb(180, 177, 154)', diep: 'rgb(153, 149, 117)',
    links: [['Bespreek je idee', OP_MAAT]],
    fotos: ['p-bijtring-kleur', 'p-bijtring-giraf-kleur', 'p-bijtring-naam', 'ig-bijtringen', 'ig-speenkoord-paardje', 'ig-charme-blauw', 'ig-charme-roze'] },
  { id: 'boxen', naam: 'Kraamcadeauboxen', kort: 'Cadeauboxen', pad: '/inspiratie-kraamcadeauboxen', licht: 'rgb(195, 207, 188)', diep: 'rgb(131, 156, 117)',
    links: [["Bekijk thema's en prijzen", 'kraamcadeauboxen.html'], ['Bespreek je idee', 'contact.html?onderwerp=kraamcadeaubox#formulier']],
    fotos: ['hero-box-open', 'hero-box-dicht', 'box-giraf', 'box-vos', 'box-tulp', 'box-wilde-blaadjes', 'box-framboos', 'box-regenboog', 'box-wilgentakjes', 'box-blaadjes-en-bloemen'] },
];
const bestand = p => p.pad.slice(1) + '.html';
const INKT = 'rgb(32, 32, 32)';
const WIT = 'rgb(255, 255, 255)';
const label = s => s.replace(/<[^>]+>/g, '').trim();

// naturalWidth geeft bij een srcset met w-beschrijvingen de maat uit sizes terug; daarom het geladen bestand (currentSrc) zelf meten
const leesTegels = page => page.evaluate(async () => { const echt = async img => { const b = new Image(); b.src = img.currentSrc || img.src; try { await b.decode(); } catch (e) { return 0; } return b.naturalWidth; };
  const uit = []; for (const s of document.querySelectorAll('main > section.project')) uit.push(await (async () => {
  const img = s.querySelector('.project-foto img'), nat = await echt(img), r = img.getBoundingClientRect(), sr = s.getBoundingClientRect(), c = e => getComputedStyle(e).color;
  return { id: s.id, label: s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), kleur: getComputedStyle(s).backgroundColor,
    links: [...s.querySelectorAll('a')].map(a => a.getAttribute('href')), linkH: s.querySelector('a.project-link').getBoundingClientRect().height,
    inLink: [!!s.querySelector('a.project-link img'), (s.querySelector('a.project-link h2') || {}).textContent, ((s.querySelector('a.project-link .pijl') || {}).textContent || '').trim()],
    tab: [...s.querySelectorAll('a, button, input, select, textarea, [tabindex]')].filter(e => e.tabIndex >= 0).length,
    lopend: [...s.querySelectorAll('.lopend')].map(l => [l.getAttribute('aria-hidden'), parseFloat(getComputedStyle(l).opacity)]),
    kleuren: [c(s.querySelector('.label')), c(s.querySelector('h2')), c(s.querySelector('.project-link .pijl'))],
    b: r.width, h: r.height, l: r.left, nat, boven: sr.top + scrollY, onder: sr.bottom + scrollY,
    tegel: s.querySelector('.project-link .pijl').getBoundingClientRect().bottom - s.querySelector('.label').getBoundingClientRect().top,
    blok: s.querySelector('.project-link .pijl').getBoundingClientRect().bottom - r.top };
  })()); return uit; });

test('overzicht: vier projecttegels in volgorde, kleur, één link en één tabstop per tegel (criteria 1–5, 7; OC1, OC2, OC5, OC6)', async ({ page }) => {
  await page.goto('/inspiratie');
  await wachtOpRust(page);
  const s = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(x => [x.id, x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()]));
  expect(s).toEqual([['', 'Inspiratie'], ...PROJECTEN.map((p, i) => [p.id, p.kort]), ['', 'Het atelier'], ['contact', 'Contact']]);
  await expect(page.locator('h1')).toHaveText('Inspiratie');
  await expect(page.locator('.pagina-kop .kop-xl')).toHaveText('Gemaakt in het atelier in Ospel');
  await expect(page.locator('.pagina-kop a'), 'geen pijl-links meer in de kop').toHaveCount(0);
  await expect(page.locator('main .werken, main .werk'), 'geen metselwerk meer op het overzicht').toHaveCount(0);
  for (const anker of ['kleding', 'textiel', 'siliconen', 'boxen']) await expect(page.locator(`#${anker}.project`)).toHaveCount(1);
  await expect(page.locator('.statement .quote')).toHaveText('“Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken.”');
  await expect(page.locator('#contact a.pijl')).toHaveAttribute('href', 'contact.html#formulier');
  const t = await leesTegels(page);
  for (const [i, p] of PROJECTEN.entries()) {
    const x = t[i];
    expect(x.kleur, `${p.id}: lichte tint`).toBe(p.licht);
    expect(x.links, `${p.id}: één link naar de projectpagina`).toEqual([bestand(p)]);
    expect(x.tab, `${p.id}: één tabstop`).toBe(1);
    expect(x.linkH).toBeGreaterThanOrEqual(44);
    expect(x.inLink).toEqual([true, p.naam, "Bekijk de foto's"]);
    expect(x.kleuren, `${p.id}: alle tekst inkt in rust`).toEqual([INKT, INKT, INKT]);
    expect(x.lopend, `${p.id}: lopende regel decoratief, 0,2`).toEqual([['true', 0.2]]);
    if (i) expect(Math.abs(x.boven - t[i - 1].onder), `${p.id} sluit aan`).toBeLessThanOrEqual(1);
    // de tegelfoto is decoratief (alt=""); de link heet naar de titel en de pijl
    await expect(page.locator(`#${p.id} .project-foto img`)).toHaveAttribute('alt', '');
    await expect(page.locator(`#${p.id} a.project-link`)).toHaveAccessibleName(new RegExp(`^${p.naam},? Bekijk de foto's$`));
  }
  await expect(page.locator('main .project-link span h2'), 'geen kop binnen een span').toHaveCount(0);
  // de lopende regel telt niet als kop
  await expect(page.locator('main .lopend h1, main .lopend h2, main .lopend h3')).toHaveCount(0);
});

test('overzicht: tegelfoto 4:3, maten per scherm en nooit vergroot (OC4, OC7)', async ({ page }, info) => {
  await page.goto('/inspiratie');
  await page.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
  const t = await leesTegels(page);
  const vw = await page.evaluate(() => document.documentElement.clientWidth);
  for (const x of t) {
    expect(Math.abs(x.b / x.h - 4 / 3), `${x.id}: 4:3`).toBeLessThanOrEqual(0.014);
    expect(x.nat, `${x.id}: bestand >= 1,04 x weergave (${x.b.toFixed(0)} px)`).toBeGreaterThanOrEqual(1.04 * x.b - 0.5);
  }
  const p = info.project.name;
  if (p === 'desktop') {
    for (const [i, l] of [33.333, 8.333, 25, 8.333].entries()) {
      expect(Math.abs(t[i].b - 840), `${t[i].id}: 840 px`).toBeLessThanOrEqual(2);
      expect(Math.abs(t[i].l - vw * l / 100), `${t[i].id}: linkerrand ${l}%`).toBeLessThanOrEqual(2);
    }
    for (const x of t) expect(x.blok, `${x.id}: foto + titel + pijl`).toBeLessThanOrEqual(836);
  } else if (p === 'tablet') {
    for (const x of t) expect(Math.abs(x.b - vw * 0.76), `${x.id}: 76%`).toBeLessThanOrEqual(2);
  } else {
    for (const x of t) {
      expect(Math.abs(x.b - (vw - 64)), `${x.id}: binnenbreedte`).toBeLessThanOrEqual(1);
      expect(Math.abs(x.l - 32), `${x.id}: 32 px van links`).toBeLessThanOrEqual(1);
      if (p === 'mobiel') expect(x.tegel, `${x.id}: hele tegel in één scherm`).toBeLessThanOrEqual(788);
    }
  }
});

test('overzicht: aanwijzen en toetsenbordfocus maken alleen dat vlak diep, titel wit (criterium 6; OC3)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'aanwijzen met een muis');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/inspiratie');
  const duur = await page.evaluate(() => [getComputedStyle(document.querySelector('.project')).transitionDuration, getComputedStyle(document.querySelector('.project')).transitionTimingFunction]);
  expect(duur).toEqual(['1s', 'cubic-bezier(0.45, 0, 0.55, 1)']);
  for (const p of PROJECTEN) {
    const foto = page.locator(`#${p.id} .project-foto`);
    await foto.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const laag = await page.evaluate(() => getComputedStyle(document.querySelector('.achtergrond')).backgroundColor);
    await foto.hover();
    await page.waitForTimeout(1400);
    const st = await page.evaluate(id => { const s = document.getElementById(id), c = e => getComputedStyle(e);
      const m = new DOMMatrix(c(s.querySelector('.project-foto img')).transform);
      return { vlak: c(s).backgroundColor, titel: c(s.querySelector('h2')).color, titelPx: parseFloat(c(s.querySelector('h2')).fontSize), label: c(s.querySelector('.label')).color,
        pijl: c(s.querySelector('.project-link .pijl')).color, schaal: m.a, laag: c(document.querySelector('.achtergrond')).backgroundColor,
        anderen: [...document.querySelectorAll('main > section.project')].filter(x => x !== s).map(x => c(x).backgroundColor) }; }, p.id);
    expect([st.vlak, st.titel, st.label, st.pijl], p.id).toEqual([p.diep, WIT, INKT, INKT]);
    expect(st.titelPx).toBeGreaterThanOrEqual(34);
    expect(st.schaal).toBeLessThanOrEqual(1.04 + 1e-6);
    expect(st.laag, 'de kleurlaag doet niet mee').toBe(laag);
    expect(st.anderen, 'de andere tegels blijven licht').toEqual(PROJECTEN.filter(x => x !== p).map(x => x.licht));
    await page.mouse.move(2, 450);
    await page.waitForTimeout(1300);
    expect(await page.evaluate(id => getComputedStyle(document.getElementById(id)).backgroundColor, p.id)).toBe(p.licht);
  }
  // toetsenbord: Tab naar de eerste tegel geeft dezelfde stand
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#kleding a.project-link').focus();
  await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  await page.waitForTimeout(1300);
  expect(await page.evaluate(() => [getComputedStyle(document.getElementById('kleding')).backgroundColor, getComputedStyle(document.querySelector('#kleding h2')).color])).toEqual([PROJECTEN[0].diep, WIT]);
});

test('overzicht: bij minder beweging geen schaal en een stilstaande lopende regel (OC3, OC5)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'aanwijzen met een muis');
  await page.goto('/inspiratie');
  const foto = page.locator('#siliconen .project-foto');
  await foto.scrollIntoViewIfNeeded();
  await foto.hover();
  const st = await page.evaluate(() => { const s = document.getElementById('siliconen');
    return [getComputedStyle(s).transitionDuration, getComputedStyle(s.querySelector('.project-foto img')).transform, getComputedStyle(s.querySelector('.lopend-spoor')).animationName, getComputedStyle(s).backgroundColor]; });
  expect(st).toEqual(['0s', 'none', 'none', PROJECTEN[2].diep]);
});

test('overzicht: op touch geen aanwijsstand, alle tekst inkt (OC2)', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'alleen op touch');
  await page.goto('/inspiratie');
  const t = await leesTegels(page);
  for (const [i, x] of t.entries()) {
    expect(x.kleur).toBe(PROJECTEN[i].licht);
    expect(x.kleuren).toEqual([INKT, INKT, INKT]);
  }
  // foto boven de titel
  const volgorde = await page.evaluate(() => [...document.querySelectorAll('.project')].map(s => s.querySelector('.project-foto').getBoundingClientRect().bottom <= s.querySelector('h2').getBoundingClientRect().top));
  expect(volgorde.every(Boolean)).toBe(true);
});

const leesProject = page => page.evaluate(async () => {
  const n = t => (t || '').replace(/\s+/g, ' ').trim();
  const fotos = [];
  for (const i of document.querySelectorAll('#fotos .projectfoto img')) {
    const bron = new Image(); bron.src = i.getAttribute('src');
    try { await bron.decode(); } catch (e) { /* telt hieronder als 0 */ }
    const echt = new Image(); echt.src = i.currentSrc || i.src; try { await echt.decode(); } catch (e) { /* 0 */ }
    const r = i.getBoundingClientRect(), f = i.closest('figure');
    fotos.push({ src: i.getAttribute('src').replace(/^assets\/img\/|\.jpg$/g, ''), cw: i.clientWidth, b: r.width, h: r.height, top: r.top + scrollY, onder: r.bottom + scrollY,
      nat: echt.naturalWidth, bw: bron.naturalWidth, bh: bron.naturalHeight, w: +i.getAttribute('width'), hh: +i.getAttribute('height'), alt: i.getAttribute('alt') || '',
      lazy: i.getAttribute('loading'), dec: i.getAttribute('decoding'), bij: n((f.querySelector('figcaption') || {}).textContent), bijPx: parseFloat(getComputedStyle(f.querySelector('figcaption')).fontSize),
      bijKleur: getComputedStyle(f.querySelector('figcaption')).color, tab: !!i.closest('a, button, [tabindex]') });
  }
  return { fotos, blok: document.querySelector('#fotos .voorbeelden').getBoundingClientRect().height };
});

for (const [i, p] of PROJECTEN.entries()) {
  const volgend = PROJECTEN[(i + 1) % PROJECTEN.length];

  test(`${p.id}: kop, secties, uitleg met LET OP, meta en contactmomenten (criteria 8, 9, 10, 14; OC8, OC16, OC19)`, async ({ page }, info) => {
    const antwoord = await page.goto(p.pad);
    expect(antwoord.status()).toBe(200);
    const s = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(x => { const l = x.querySelector(':scope .label');
      return [x.id, x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), l ? l.textContent.replace(/\s+/g, ' ').trim() : null]; }));
    expect(s.map(x => x.slice(0, 2))).toEqual([['', 'Inspiratie'], ['fotos', "Foto's"], ['volgend', 'Meer zien'], ['contact', 'Contact']]);
    for (const x of s.slice(1)) expect(x[2], `${x[0]}: zichtbaar label gelijk aan data-label`).toBe(x[1]);
    await expect(page.locator('h1')).toHaveText(p.naam);
    await expect(page.locator('main > section.pagina-kop')).toHaveCount(1);
    await expect(page.locator('.pagina-kop .caps')).toHaveText('Inspiratie');
    // aria-current op Inspiratie in header en snelmenu
    expect(await page.locator('[aria-current="page"]').evaluateAll(as => as.map(a => [a.closest('.site-header') ? 'header' : a.closest('.menu-rij') ? 'rij' : 'elders', a.textContent.trim()])))
      .toEqual([['rij', 'Inspiratie'], ['header', 'Inspiratie']]);
    // de uitleg letterlijk; uitleg, title en description zijn goedgekeurd (Carst, 15 nov. 2026): juist geen LET OP meer
    const html = await (await page.request.get(p.pad)).text();
    expect(html).toMatch(/<p class="project-uitleg">[^<]+<\/p>/);
    expect(html, 'geen LET OP bij de goedgekeurde teksten').not.toMatch(/LET OP:[^>]*(uitleg project|title en description project)|wacht op akkoord Carst/);
    expect(html, 'de fotokeuze wacht nog op akkoord').toContain("LET OP: keuze van de foto's wacht op akkoord");
    // OC8: wit h1 >= 40 px, uitleg inkt 18 px (mobiel >= 17), hooguit 31em breed (ontwerpgate 15 nov.; was 34em)
    const kop = await page.evaluate(() => { const h = document.querySelector('h1'), u = document.querySelector('.project-uitleg'), cs = getComputedStyle(u);
      return [getComputedStyle(h).color, parseFloat(getComputedStyle(h).fontSize), cs.color, parseFloat(cs.fontSize), u.getBoundingClientRect().width / parseFloat(cs.fontSize)]; });
    expect(kop[0]).toBe(WIT);
    expect(kop[1]).toBeGreaterThanOrEqual(40);
    expect(kop[2]).toBe(INKT);
    expect(kop[3]).toBeGreaterThanOrEqual(['desktop'].includes(info.project.name) ? 18 : 17);
    expect(kop[4]).toBeLessThanOrEqual(31.01);
    // criterium 10: eigen meta met canonical zonder .html en og:image uit de groep
    const meta = await page.evaluate(() => Object.fromEntries(['link[rel="canonical"]', 'meta[property="og:url"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[name="description"]']
      .map(q => [q, (document.querySelector(q) || {}).href || (document.querySelector(q) || {}).content || ''])));
    expect(meta['link[rel="canonical"]']).toBe(`https://www.luxmini.nl${p.pad}`);
    expect(meta['meta[property="og:url"]']).toBe(`https://www.luxmini.nl${p.pad}`);
    expect(meta['meta[property="og:title"]']).toContain(p.naam);
    expect(meta['meta[property="og:description"]']).toBe(meta['meta[name="description"]']);
    expect(meta['meta[property="og:image"]']).toBe(`https://www.luxmini.nl/assets/img/${p.fotos[0]}.jpg`);
    expect(await page.title()).toBe(`${p.naam} · Inspiratie · LUX mini`);
    // criterium 14 / OC19: pijl-links onder de foto's, daarna het gedeelde contactblok; geen directe kanalen in de inhoud
    const links = await page.locator('#fotos a.pijl').evaluateAll(as => as.map(a => [a.textContent.trim(), a.getAttribute('href'), a.getBoundingClientRect().height]));
    expect(links.map(l => l.slice(0, 2))).toEqual(p.links);
    for (const l of links) expect(l[2]).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#contact a.pijl')).toHaveAttribute('href', 'contact.html#formulier');
    await expect(page.locator('#contact a.pijl')).toHaveText('Stuur Carien een bericht');
    expect(await page.locator('main a[href^="https://wa.me"], main a[href^="tel:"], main a[href^="mailto:"]').count()).toBe(0);
    // OC16: volgend project in de volgorde van het overzicht, "Alle inspiratie" 16 px en 44 px hoog, geen vorig project
    const v = await page.evaluate(() => { const s = document.getElementById('volgend'), a = s.querySelector('.project-slot a.pijl');
      return { href: s.querySelector('a.project-link').getAttribute('href'), naam: s.querySelector('h2').textContent.trim(), kleur: getComputedStyle(s).backgroundColor,
        tab: [...s.querySelectorAll('a')].filter(x => x.tabIndex >= 0).length, alle: [a.textContent.trim(), a.getAttribute('href'), parseFloat(getComputedStyle(a).fontSize), a.getBoundingClientRect().height],
        vorig: /vorig/i.test(document.querySelector('main').textContent) }; });
    expect([v.href, v.naam, v.kleur]).toEqual([bestand(volgend), volgend.naam, volgend.licht]);
    expect(v.tab).toBe(2);
    await expect(page.locator('#volgend .project-foto img')).toHaveAttribute('alt', '');
    await expect(page.locator('#volgend a.project-link')).toHaveAccessibleName(new RegExp(`^${volgend.naam},? Bekijk de foto's$`));
    expect(v.alle.slice(0, 2)).toEqual(['Alle inspiratie', 'inspiratie.html']);
    expect(v.alle[2]).toBeGreaterThanOrEqual(16);
    expect(v.alle[3]).toBeGreaterThanOrEqual(44);
    expect(v.vorig).toBe(false);
  });

  test(`${p.id}: alle foto's van de groep, niet bijgesneden en nooit breder dan het bestand (criteria 17–20; OC10–OC12, OC14, OC15, OC18)`, async ({ page }, info) => {
    await page.goto(p.pad);
    const lazy = await page.locator('#fotos .projectfoto img').evaluateAll(is => is.map(i => i.getAttribute('loading'))); // vóór het vooraf laden hieronder
    await page.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); });
    const m = await leesProject(page);
    m.fotos.forEach((f, n) => { f.lazy = lazy[n]; });
    expect(m.fotos.map(f => f.src)).toEqual(p.fotos);
    expect(await page.locator('#fotos').getAttribute('data-achtergrond'), 'OC15: zelfde tint als op het overzicht').toBe(await page.evaluate(k => k, { 'kleding': '#DEB799', 'textiel': '#B5969E', 'siliconen': '#B4B19A', 'boxen': '#C3CFBC' }[p.id]));
    const klein = info.project.name === 'mobiel' || info.project.name === 'iphone';
    for (const [n, f] of m.fotos.entries()) {
      expect([f.w, f.hh], `${f.src}: width en height gelijk aan het bestand`).toEqual([f.bw, f.bh]);
      expect(f.dec).toBe('async');
      expect(f.lazy, `${f.src}: alleen de eerste zonder lazy`).toBe(n ? 'lazy' : null);
      expect(f.alt.length, `${f.src}: beschrijvende alt`).toBeGreaterThanOrEqual(15);
      expect(f.bij, `${f.src}: bijschrift`).not.toBe('');
      expect(f.bijKleur).toBe(INKT);
      expect(f.bijPx).toBeGreaterThanOrEqual(20);
      expect(f.tab, `${f.src}: geen link, knop of tabstop (geen lightbox)`).toBe(false);
      expect(f.cw, `${f.src}: ${f.cw} px <= geladen bestand ${f.nat} px`).toBeLessThanOrEqual(f.nat);
      expect(f.cw, `${f.src}: ${f.cw} px <= grootste bestand ${f.bw} px`).toBeLessThanOrEqual(f.bw);
      expect(Math.abs(f.h / f.b - f.bh / f.bw), `${f.src}: niet bijgesneden`).toBeLessThanOrEqual(0.01 * f.bh / f.bw + 1 / f.b);
    }
    if (info.project.name === 'desktop') {
      expect(Math.max(...m.fotos.map(f => f.h)), 'OC11: geen foto hoger dan 810 px').toBeLessThanOrEqual(810);
      expect(m.fotos[0].top, 'OC9: eerste foto begint in het eerste scherm').toBeLessThanOrEqual(900);
    }
    if (klein) {
      const vw = await page.evaluate(() => document.querySelector('#fotos .voorbeelden').getBoundingClientRect().width);
      for (const f of m.fotos.filter(x => /ig-jasje|ig-babynest/.test(x.src))) expect(Math.abs(f.b - (vw - 12) / 2), `OC12: ${f.src} in een paar`).toBeLessThanOrEqual(1);
      if (info.project.name === 'mobiel') expect(m.blok, 'OC12: fotoblok').toBeLessThanOrEqual(2954);
    }
    // OC18: inzoomen niet geblokkeerd
    expect(await page.locator('meta[name="viewport"]').getAttribute('content')).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/);
  });

  test(`${p.id}: de eerste foto (de tegelfoto) na hooguit één keer scrollen helemaal in beeld (criterium 22, OC9)`, async ({ page }, info) => {
    test.skip(info.project.name !== 'mobiel', 'gemeten op 390 x 844');
    await page.goto(p.pad);
    const e = await page.evaluate(() => { const r = document.querySelector('#fotos .projectfoto img').getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY, r.height]; });
    expect(e[0]).toBeLessThanOrEqual(844);
    expect(e[1]).toBeLessThanOrEqual(1688);
    expect(e[2]).toBeLessThanOrEqual(788);
  });
}

// per pagina een eigen test (zes breedtes, elk helemaal geladen)
for (const pad of ['/inspiratie', ...PROJECTEN.map(p => p.pad)]) {
  test(`${pad}: geen horizontaal scrollen op 360, 390, 768, 1024, 1440 en 1920 px (criterium 21, OC5, OC10)`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'breedtes worden hier zelf gezet');
    for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(pad);
      await page.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; }); for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 20)); } });
      const r = await page.evaluate(async () => {
        await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(res => { i.onload = i.onerror = res; })));
        return { breed: document.documentElement.scrollWidth - innerWidth,
          vergroot: await (async () => { const uit = []; for (const i of document.querySelectorAll('main .projectfoto img, main .project-foto img')) { const b = new Image(); b.src = i.currentSrc || i.src; try { await b.decode(); } catch (e) { /* 0 */ }
            if (i.clientWidth > b.naturalWidth) uit.push(`${i.getAttribute('src')} ${i.clientWidth} > ${b.naturalWidth}`); } return uit; })() };
      });
      expect(r.breed, `${pad} op ${w}: geen horizontale scroll`).toBeLessThanOrEqual(0);
      expect(r.vergroot, `${pad} op ${w}: niets vergroot`).toEqual([]);
    }
  });
}

test('balk: korte labels op één regel en minstens 8 px links van de burger (OC17)', async ({ page }, info) => {
  test.skip(!['mobiel', 'iphone'].includes(info.project.name), 'op telefoons (Chromium en WebKit)');
  const breedtes = info.project.name === 'mobiel' ? [390, 360] : [info.project.use.viewport.width];
  for (const w of breedtes) {
    if (info.project.name === 'mobiel') await page.setViewportSize({ width: w, height: 800 });
    for (const pad of ['/inspiratie', ...PROJECTEN.map(p => p.pad)]) {
      await page.goto(pad);
      const n = await page.locator('main > section').count();
      for (let i = 1; i < n; i++) {
        const verwacht = await page.evaluate(i => { const s = document.querySelectorAll('main > section')[i]; window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 20);
          return s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(); }, i);
        await expect.poll(() => page.evaluate(() => document.querySelector('.balk .sectie-label').textContent.trim()), { message: `${pad}: balk toont ${verwacht}` }).toBe(verwacht);
        const m = await page.evaluate(() => { const l = document.querySelector('.balk .sectie-label').getBoundingClientRect(), b = document.querySelector('.burger').getBoundingClientRect(); return [b.left - l.right, l.height]; });
        expect(m[0], `${pad} ${w} px: '${verwacht}' ${m[0].toFixed(0)} px van de burger`).toBeGreaterThanOrEqual(8);
        expect(m[1], `${pad}: '${verwacht}' op één regel`).toBeLessThanOrEqual(30);
      }
    }
  }
});

test('balk boven een tegel of het fotoblok: lichte tint, donker logo, label inkt (OC17)', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel' && info.project.name !== 'desktop', 'één groot en één klein scherm');
  await page.goto('/inspiratie');
  for (const p of PROJECTEN) {
    await page.evaluate(id => { const s = document.getElementById(id); window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 40); }, p.id);
    await page.waitForTimeout(400);
    const b = await page.evaluate(() => { const b = document.querySelector('.balk'); return [b.style.backgroundColor, getComputedStyle(b.querySelector('.logo-donker')).display, getComputedStyle(b.querySelector('.sectie-label')).color]; });
    expect(b, p.id).toEqual([p.licht, 'block', INKT]);
  }
});

test('menu: de subitems van Inspiratie gaan naar de projectpagina\'s, met dezelfde tekst (criterium 12)', async ({ page }) => {
  for (const pad of ['/', '/werkwijze', '/kraamcadeauboxen', '/prematuurkleding', '/babynest', '/inspiratie', '/contact', '/privacy', '/bedankt', ...PROJECTEN.map(p => p.pad)]) {
    await page.goto(pad);
    const subs = await page.locator('#menu-scherm .menu-nav > ul > li').nth(4).locator('.menu-sub a').evaluateAll(as => as.map(a => [a.textContent.trim(), a.getAttribute('href')]));
    expect(subs, pad).toEqual(PROJECTEN.map(p => [p.naam, bestand(p)]));
  }
  await page.goto('/bestaat-niet-meer');
  const subs = await page.locator('#menu-scherm .menu-nav > ul > li').nth(4).locator('.menu-sub a').evaluateAll(as => as.map(a => [a.textContent.trim(), a.getAttribute('href')]));
  expect(subs, '404 met absolute paden').toEqual(PROJECTEN.map(p => [p.naam, p.pad]));
});

test('kernpad: van het overzicht naar elk project en via "Volgend project" de hele ronde (criteria 1, 11, 16)', async ({ page }) => {
  for (const p of PROJECTEN) {
    await page.goto('/inspiratie');
    await page.locator(`#${p.id} a.project-link`).click();
    await expect(page).toHaveURL(new RegExp(`${p.pad}(\\.html)?$`));
    await expect(page.locator('h1')).toHaveText(p.naam);
  }
  await page.goto(PROJECTEN[0].pad);
  for (let i = 1; i <= PROJECTEN.length; i++) {
    const p = PROJECTEN[i % PROJECTEN.length];
    await page.locator('#volgend a.project-link').click();
    await expect(page).toHaveURL(new RegExp(`${p.pad}(\\.html)?$`));
    await page.waitForLoadState('load');
    await expect(page.locator('h1')).toHaveText(p.naam);
  }
  await page.locator('#volgend a.pijl', { hasText: 'Alle inspiratie' }).click();
  await expect(page).toHaveURL(/\/inspiratie(\.html)?$/);
  // criterium 16: met en zonder .html 200
  for (const p of PROJECTEN) for (const pad of [p.pad, p.pad + '.html']) expect((await page.request.get(pad)).status(), pad).toBe(200);
});

test('homepage Handwerk: Rustig en praktisch en Speels en levendig gaan naar hun project (criterium 13)', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['#technieken .hoverlijst ul a', '#technieken .kaarten a.kaart', '#technieken .lookbook-paneel a']) { // ook de mobiele lookbook-panelen (brief 2026-11-14-homepage-mobiel-stock)
    const h = await page.locator(sel).evaluateAll(as => as.map(a => a.getAttribute('href')));
    expect(h, sel).toEqual(['werkwijze.html#personaliseren', 'inspiratie-siliconen-en-hangers.html', 'prematuurkleding.html', 'inspiratie-knuffels-en-babynest.html']);
  }
});

test('oude ankers op het overzicht landen op het juiste project (criterium 3)', async ({ page }) => {
  for (const p of PROJECTEN) {
    await page.goto(`/inspiratie#${p.id}`);
    await expect.poll(() => page.evaluate(id => document.getElementById(id).getBoundingClientRect().top / innerHeight, p.id), { message: `#${p.id}` }).toBeLessThan(0.5);
    await expect(page.locator(`#${p.id} .label`)).toBeInViewport();
  }
});

test('projectfoto\'s schuiven in zonder schaal; de eerste staat er direct (OC13)', async ({ page }, info) => {
  test.skip(info.project.name === 'iphone', 'WebKit: alleen de stilstaande criteria');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(PROJECTEN[3].pad);
  const voor = await page.evaluate(() => [...document.querySelectorAll('#fotos .projectfoto-beeld')].map(b => [b.classList.contains('inschuif'), new DOMMatrix(getComputedStyle(b.querySelector('img')).transform).a]));
  expect(voor[0][0], 'de eerste foto schuift niet in').toBe(false);
  for (const [i, [inschuif, schaal]] of voor.entries()) {
    if (i) expect(inschuif).toBe(true);
    expect(schaal, `foto ${i + 1}: schaal <= 1`).toBeLessThanOrEqual(1);
  }
  await page.locator('#fotos .pijl-rij').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const breed = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(breed).toBeLessThanOrEqual(0);
});

const allesZichtbaar = page => page.evaluate(() => [...document.querySelectorAll('#fotos .projectfoto-beeld, .project-foto, .project-onder')].map(b => {
  const s = getComputedStyle(b), i = b.querySelector('img');
  let o = 1; for (let e = b; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
  return /^(none|inset\(0(px)?\))$/.test(s.clipPath) && (!i || getComputedStyle(i).transform === 'none') && o === 1;
}));

test('minder beweging en zonder JavaScript: alles direct zichtbaar, links werken (criterium 24, OC5, OC13)', async ({ page, browser }, info) => {
  test.skip(info.project.name !== 'desktop' && info.project.name !== 'mobiel', 'één keer groot en één keer klein');
  for (const pad of ['/inspiratie', PROJECTEN[0].pad]) {
    await page.goto(pad);
    expect((await allesZichtbaar(page)).every(Boolean), `${pad}: minder beweging`).toBe(true);
    expect(await page.evaluate(() => [...document.querySelectorAll('.lopend-spoor')].every(s => getComputedStyle(s).animationName === 'none'))).toBe(true);
  }
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference', viewport: info.project.use.viewport });
  const p = await ctx.newPage();
  for (const pad of ['/inspiratie', PROJECTEN[0].pad]) {
    await p.goto(pad);
    expect((await allesZichtbaar(p)).every(Boolean), `${pad}: zonder JavaScript`).toBe(true);
    expect(await p.evaluate(() => [...document.querySelectorAll('.lopend-spoor')].every(s => getComputedStyle(s).animationName === 'none')), 'lopende regel staat stil').toBe(true);
  }
  await p.goto('/inspiratie');
  await p.locator('#siliconen a.project-link').click();
  await expect(p).toHaveURL(/inspiratie-siliconen-en-hangers(\.html)?$/);
  await ctx.close();
});

test('touch: alle tikdoelen op de vijf pagina\'s minstens 44 px, niets alleen bij aanwijzen (criterium 23)', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'alleen op touch');
  for (const pad of ['/inspiratie', ...PROJECTEN.map(p => p.pad)]) {
    await page.goto(pad);
    const klein = await page.evaluate(() => [...document.querySelectorAll('main a[href]')].filter(a => a.getBoundingClientRect().width > 0)
      .filter(a => a.getBoundingClientRect().height < 43.5).map(a => a.textContent.trim().slice(0, 30)));
    expect(klein, pad).toEqual([]);
    const verborgen = await page.evaluate(() => [...document.querySelectorAll('main .project-onder, main .project-link .pijl, main .projectfoto figcaption')].filter(e => {
      let o = 1; for (let x = e; x; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity); return o < 1 || getComputedStyle(e).visibility !== 'visible'; }).length);
    expect(verborgen, `${pad}: alles zichtbaar zonder aanwijzen`).toBe(0);
  }
});

// Tekens per visuele regel van een tekstblok (letters op dezelfde regelhoogte samen), zonder de spatie aan het regeleinde
const tekensPerRegel = (page, sel) => page.evaluate(sel => {
  const el = document.querySelector(sel), regels = new Map();
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) for (let i = 0; i < n.length; i++) {
    const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
    const b = r.getClientRects()[0]; if (!b || !b.width) continue;
    const k = Math.round(b.top); regels.set(k, (regels.get(k) || '') + n.data[i]);
  }
  return [...regels.values()].map(t => t.trim().length);
}, sel);

for (const p of PROJECTEN) {
  test(`${p.id}: uitleg in de kop hooguit 75 tekens per regel op 1440 en 768 px (OC8, principe 4)`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'breedtes worden hier zelf gezet');
    for (const [w, h] of [[1440, 900], [768, 1024]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(p.pad);
      await wachtOpRust(page);
      const regels = await tekensPerRegel(page, '.pagina-kop .project-uitleg');
      expect(regels.length, `${w}: meer dan één regel`).toBeGreaterThan(1);
      expect(Math.max(...regels), `${w} px: tekens per regel ${regels.join(', ')}`).toBeLessThanOrEqual(75);
    }
  });
}

test('001 Foto\'s: de laag staat al in de projecttint zodra het blok in beeld komt (ontwerpgate P2)', async ({ page }) => {
  for (const p of PROJECTEN) {
    await page.goto(p.pad);
    await wachtOpRust(page);
    expect(await page.locator('#fotos').getAttribute('data-laag-lijn')).toBe('0.99');
    // geen witte tekst in 001 (voorwaarde voor een eigen wissellijn, CLAUDE.md)
    expect(await page.evaluate(() => [...document.querySelectorAll('#fotos *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.data.trim()) && getComputedStyle(e).color === 'rgb(255, 255, 255)').length)).toBe(0);
    // het blok komt in beeld: de laag is (na de overgang) de lichte tint
    await page.evaluate(() => { const s = document.getElementById('fotos'); window.scrollTo(0, Math.max(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.97)); });
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.achtergrond')).backgroundColor), { message: p.id }).toBe(p.licht);
  }
});

test('mobiel: liggende foto\'s over de volle breedte, staande, vierkante en kleine in paren; fotoblok binnen 3,5 schermen (ontwerpgate P1, OC12)', async ({ page }, info) => {
  test.skip(!['mobiel', 'iphone'].includes(info.project.name), 'op telefoons');
  for (const p of PROJECTEN) {
    await page.goto(p.pad);
    const m = await page.evaluate(() => { const v = document.querySelector('#fotos .voorbeelden'), vb = v.getBoundingClientRect();
      return { b: vb.width, h: vb.height, fotos: [...v.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), w: +i.getAttribute('width'), hh: +i.getAttribute('height'), b: i.getBoundingClientRect().width })) }; });
    // groot genoeg om de inhoud te zien en binnen 3,5 schermen, ook op 390 × 664 (CI 15 nov.): op Kraamcadeauboxen staan vijf van de acht
    // liggende themafoto's over de volle breedte, de andere drie in een paar; liggende foto's van andere projecten zijn klein (paar) of vol
    const liggend = m.fotos.filter(f => f.w > f.hh && f.w >= m.b);
    const vol = liggend.filter(f => Math.abs(f.b - m.b) <= 1).length;
    if (p.id === 'boxen') expect(vol, 'boxen: liggende foto\'s over de volle breedte').toBeGreaterThanOrEqual(5);
    else expect(vol, `${p.id}: liggende foto's over de volle breedte`).toBe(liggend.length);
    for (const f of liggend) expect(f.b, `${f.src}: minstens een halve kolom`).toBeGreaterThanOrEqual((m.b - 12) / 2 - 1);
    for (const f of m.fotos.filter(f => f.w > f.hh && f.w < m.b)) expect(f.b, `${f.src}: klein liggend, in een paar`).toBeLessThan(m.b / 2 + 1);
    expect(m.h, `${p.id}: fotoblok`).toBeLessThanOrEqual(Math.min(2954, 3.5 * page.viewportSize().height));
  }
});

test('390 × 664 (iPhone-hoogte in Chromium): fotoblok binnen 3,5 schermen op alle projectpagina\'s (OC12)', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'één keer, met de hoogte van de iPhone');
  await page.setViewportSize({ width: 390, height: 664 });
  for (const p of PROJECTEN) {
    await page.goto(p.pad);
    const h = await page.evaluate(() => document.querySelector('#fotos .voorbeelden').getBoundingClientRect().height);
    expect(h, `${p.id}: fotoblok ${h.toFixed(0)} px`).toBeLessThanOrEqual(3.5 * 664);
  }
});
