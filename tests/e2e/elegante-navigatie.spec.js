// Brief 2026-11-18-elegante-navigatie (besluit Carst 18 nov.: alleen het woord), blokkerend.
// A: het lookbook op mobiel heeft pijlknoppen (homepage-mobiel.spec.js); B: sectielabels zonder nummer, overal en in de vaste
// balk, en geen zichtbare volgnummers; C: de pijl-link heeft een dun kader met de pijl ervoor, met een muis een rustige animatie.
import { test, expect, PAGINAS, wachtOpRust } from './hulp.js';

const BRIEF = 'brief 2026-11-18-elegante-navigatie';
const NUMMER_LABEL = /0\d\d\s*(—|–|-)/;

// Criterium 7, 8 en 10: op elke openbare pagina geen label of data-label met "00n —", geen streepje vooraan, en nergens een
// zichtbaar volgnummer als "01", "02" of "001" (prijzen, maten, telefoonnummer, KvK en datums staan in een zin en tellen niet).
for (const { pad, naam } of [...PAGINAS, { pad: '/404', naam: '404' }]) {
  test(`${naam}: geen nummers in sectielabels, data-label of de balk, en geen losse volgnummers in beeld (${BRIEF}, criteria 7, 8, 10)`, async ({ page }) => {
    await page.goto(pad);
    await wachtOpRust(page);
    const m = await page.evaluate(() => {
      const zichtbaar = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const dataLabels = [...document.querySelectorAll('[data-label]')].map(e => e.getAttribute('data-label'));
      const labels = [...document.querySelectorAll('main .label')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
      // losse tekstknopen in main en header/balk die alleen uit een volgnummer bestaan ("01", "3", "001", "01 —")
      const los = [];
      const loop = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = loop.nextNode(); n; n = loop.nextNode()) {
        const t = n.textContent.trim();
        if (!t || !n.parentElement || n.parentElement.closest('script, style, noscript, template, .sr-only')) continue;
        if (/^0?\d{1,3}\s*[—–]?$/.test(t) && zichtbaar(n.parentElement)) los.push(`${n.parentElement.className || n.parentElement.tagName}: ${t}`);
      }
      return { dataLabels, labels, los, nr: document.querySelectorAll('.nr, .hoe-nr').length,
        stapTekst: [...document.querySelectorAll('.stap-nr')].map(e => e.textContent.trim()).filter(Boolean),
        balk: document.querySelector('.balk .sectie-label') ? document.querySelector('.balk .sectie-label').innerHTML : '' };
    });
    for (const l of [...m.dataLabels, ...m.labels]) {
      expect(l, `label "${l}" zonder nummer`).not.toMatch(NUMMER_LABEL);
      expect(l, `label "${l}" zonder streepje vooraan`).not.toMatch(/^\s*(<span>)?\s*[—–]/);
      expect(l, `label "${l}" is alleen het woord (geen opmaak)`).not.toMatch(/</);
    }
    expect(m.balk, 'balklabel zonder nummer').not.toMatch(NUMMER_LABEL);
    expect(m.nr, 'geen .nr of .hoe-nr meer').toBe(0);
    expect(m.stapTekst, 'de rondjes van Zo werkt het zonder cijfer').toEqual([]);
    expect(m.los, 'geen losse volgnummers in beeld').toEqual([]);
  });
}

// Ontwerpcriterium O2: sectielabels in Source Sans 3, 600, hoofdletters, ≥ 13 px, spatiëring ≥ 0,1em; in de balk ook
test(`labels en balk: Source Sans 3, 600, hoofdletters, min. 13 px en ruime spatiëring (${BRIEF}, O2)`, async ({ page }) => {
  for (const pad of ['/', '/kraamcadeauboxen', '/contact']) {
    await page.goto(pad);
    const m = await page.evaluate(() => [...document.querySelectorAll('main .label'), document.querySelector('.balk .sectie-label')].map(e => {
      const s = getComputedStyle(e);
      return [e.className, s.fontFamily, s.fontWeight, s.textTransform, parseFloat(s.fontSize), parseFloat(s.letterSpacing) / parseFloat(s.fontSize)];
    }));
    for (const [k, fam, gew, tt, px, sp] of m) {
      expect(fam, `${pad} ${k}: Source Sans 3`).toMatch(/^"?Source Sans 3/);
      expect([gew, tt], `${pad} ${k}: 600 in hoofdletters`).toEqual(['600', 'uppercase']);
      expect(px, `${pad} ${k}: min. 13 px`).toBeGreaterThanOrEqual(13);
      expect(sp, `${pad} ${k}: spatiëring min. 0,1em`).toBeGreaterThanOrEqual(0.099);
    }
  }
});

// Criterium 7 en ontwerpcriterium O1: op 360 en 390 px past elk balklabel van de site op één regel naast het logo, met
// minstens 12 px tot het tikvlak van de burger
test(`balk 360 en 390 px: elk sectielabel op één regel, min. 12 px vrij van de burger (${BRIEF}, criterium 7, O1)`, async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'breedtes worden hier zelf gezet');
  for (const b of [360, 390]) {
    await page.setViewportSize({ width: b, height: 740 });
    for (const { pad } of PAGINAS) {
      await page.goto(pad);
      await page.evaluate(() => document.fonts.ready);
      if (!(await page.locator('[data-label]').count())) continue; // privacy en bedankt: geen secties met label, geen balk
      await page.waitForFunction(() => document.querySelector('.burger').getBoundingClientRect().width > 0);
      const m = await page.evaluate(() => {
        const balk = document.querySelector('.balk'), label = balk.querySelector('.sectie-label'), burger = document.querySelector('.burger');
        balk.classList.add('zichtbaar');
        const uit = [];
        for (const t of new Set([...document.querySelectorAll('[data-label]')].map(e => e.getAttribute('data-label')))) {
          label.innerHTML = t;
          const r = label.getBoundingClientRect(), br = burger.getBoundingClientRect(), lh = parseFloat(getComputedStyle(label).lineHeight) || parseFloat(getComputedStyle(label).fontSize) * 1.5;
          uit.push([t, Math.round(br.left - r.right), r.height <= lh + 1, Math.round(r.right), Math.round(br.left)]);
        }
        return { uit, breed: document.documentElement.scrollWidth };
      });
      for (const [t, vrij, eenRegel] of m.uit) {
        expect(eenRegel, `${b} px ${pad}: "${t}" op één regel`).toBe(true);
        expect(vrij, `${b} px ${pad}: "${t}" ${vrij} px van de burger`).toBeGreaterThanOrEqual(12);
      }
      expect(m.breed, `${b} px ${pad}: geen horizontaal scrollen`).toBe(b);
    }
  }
});

// Criterium 11, 12 en ontwerpcriteria O3, O4, O11: elke zichtbare pijl-link is ≥ 48 px hoog, de pijl staat op de linkerrand,
// het kader begint 14 px verder, links open (stompjes van 10 px), 1 px lijn in currentColor zonder vulling, schaduw of ronde
// hoeken; op mobiel binnen de zijmarge en onder elkaar 12 px tussen de kaders
for (const { pad, naam } of PAGINAS) {
  // ronde 2 (controleur): ook op 1024 px (desktop-project) en 768 px (tablet-project); een gebroken pijl-link staat met
  // ≥ 8 px boven en onder en ≥ 24 px rechts binnen het kader (drieluik op de tablet: kolom van ca. 208 px)
  test(`${naam}: pijl-links met dun kader, pijl ervoor, ≥ 48 px, binnen de rand (${BRIEF}, criteria 11, 12, O3, O4, O11)`, async ({ page }, info) => {
   for (const breedte of (info.project.name === 'desktop' ? [1440, 1024] : [null])) {
    if (breedte) await page.setViewportSize({ width: breedte, height: 900 });
    await page.goto(pad);
    await wachtOpRust(page);
    const m = await page.evaluate(() => {
      const rand = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rand')) || Math.min(32, innerWidth * 0.082);
      return { vw: innerWidth, rand, breed: document.documentElement.scrollWidth, pijlen: [...document.querySelectorAll('main .pijl, footer .pijl')].filter(p => p.getClientRects().length && getComputedStyle(p).display !== 'none').map(p => {
        const r = p.getBoundingClientRect(), svg = p.querySelector('svg').getBoundingClientRect(), k = getComputedStyle(p, '::before'), s = getComputedStyle(p);
        const tekst = document.createRange(); const tn = [...p.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (tn) tekst.selectNodeContents(tn);
        const tr = tn ? tekst.getBoundingClientRect() : null, regelRects = tn ? [...tekst.getClientRects()].filter(x => x.width > 0) : [];
        return { t: p.textContent.replace(/\u00ad/g, '').trim(), h: r.height, l: r.left, r: r.right, top: r.top, svgL: svg.left - r.left, svgB: svg.width,
          kader: [k.content, k.position, k.left, k.top, k.bottom, k.right, k.borderTopWidth, k.borderRightWidth, k.borderBottomWidth, k.borderLeftWidth, k.borderTopStyle, k.boxShadow, k.borderTopRightRadius, k.backgroundColor, k.backgroundSize],
          tekstL: tr ? tr.left - svg.right : null, tekstR: tr ? r.right - tr.right : null, regels: tn ? new Set(regelRects.map(x => Math.round(x.top))).size : 1,
          tekstBoven: regelRects.length ? Math.min(...regelRects.map(x => x.top)) - r.top : null, tekstOnder: regelRects.length ? r.bottom - Math.max(...regelRects.map(x => x.bottom)) : null,
          tekstRechts: regelRects.length ? r.right - Math.max(...regelRects.map(x => x.right)) : null,
          maat: parseFloat(s.fontSize), letter: s.fontFamily, gewicht: s.fontWeight, achter: s.backgroundColor };
      }) };
    });
    expect(m.breed, 'geen horizontaal scrollen').toBe(m.vw);
    for (const p of m.pijlen) {
      const t = `"${p.t}"`;
      expect(p.h, `${t}: min. 48 px hoog`).toBeGreaterThanOrEqual(47.5);
      expect(Math.abs(p.svgL), `${t}: pijl op de linkerrand`).toBeLessThanOrEqual(0.5);
      expect(p.svgB, `${t}: pijl 28 px`).toBe(28);
      expect(p.kader.slice(0, 10), `${t}: kader 14 px na de pijl, boven/rechts/onder 1 px, links open`).toEqual(['""', 'absolute', '14px', '0px', '0px', '0px', '1px', '1px', '1px', '0px']);
      expect(p.kader.slice(10, 13), `${t}: dunne doorgetrokken lijn, geen schaduw, geen ronde hoeken`).toEqual(['solid', 'none', '0px']);
      expect(p.kader[14], `${t}: stompjes links van 10 px (opening ≥ 24 px)`).toBe('1px 10px, 1px 10px');
      expect(p.h - 20, `${t}: opening links ≥ 24 px`).toBeGreaterThanOrEqual(24);
      if (!p.t.startsWith('Zo personaliseert')) expect(p.kader[13], `${t}: kader niet gevuld`).toBe('rgba(0, 0, 0, 0)');
      expect(p.achter, `${t}: geen achtergrondvlak`).toBe('rgba(0, 0, 0, 0)');
      if (p.tekstBoven !== null) {
        expect(p.tekstBoven, `${t} (${m.vw} px, ${p.regels} regel(s)): ≥ 8 px tussen tekst en bovenlijn (${p.tekstBoven.toFixed(1)})`).toBeGreaterThanOrEqual(8);
        expect(p.tekstOnder, `${t} (${m.vw} px, ${p.regels} regel(s)): ≥ 8 px tussen tekst en onderlijn (${p.tekstOnder.toFixed(1)})`).toBeGreaterThanOrEqual(8);
        expect(p.tekstRechts, `${t} (${m.vw} px): ≥ 24 px rechts binnen het kader (${p.tekstRechts.toFixed(1)})`).toBeGreaterThanOrEqual(23.5);
      }
      if (p.tekstL !== null && p.regels === 1) {
        expect(Math.abs(p.tekstL - 12), `${t}: 12 px tussen pijl en tekst (${p.tekstL})`).toBeLessThanOrEqual(1);
        expect(Math.abs(p.tekstR - 24), `${t}: 24 px tussen tekst en kader (${p.tekstR})`).toBeLessThanOrEqual(1);
      }
      expect([p.maat, p.gewicht], `${t}: 16 px, gewicht 400`).toEqual([16, '400']);
      expect(p.letter, `${t}: Libre Caslon Text`).toMatch(/Libre Caslon Text/);
      expect(p.l, `${t}: links binnen beeld`).toBeGreaterThanOrEqual(-0.5);
      if (m.vw <= 760) {
        expect(p.r, `${t}: rechts niet voorbij de zijmarge (${p.r.toFixed(1)} > ${m.vw - m.rand})`).toBeLessThanOrEqual(m.vw - m.rand + 0.5);
        if (['Bekijk de kraamcadeauboxen', 'Stuur Carien een bericht'].includes(p.t)) expect(p.regels, `${t}: op één regel`).toBe(1);
      }
    }
    // O11: pijl-links onder elkaar (zelfde linkerkant, de een onder de ander) minstens 12 px tussen de kaders
    const opvolgend = m.pijlen.slice().sort((a, b) => a.top - b.top);
    for (let i = 1; i < opvolgend.length; i++) {
      const a = opvolgend[i - 1], b = opvolgend[i];
      if (Math.abs(a.l - b.l) <= 1 && b.top >= a.top + a.h - 0.5 && b.top - (a.top + a.h) < 40) {
        expect(b.top - (a.top + a.h), `"${a.t}" → "${b.t}": min. 12 px tussen de kaders`).toBeGreaterThanOrEqual(11.5);
      }
    }
   }
  });
}

// Criterium 14, 15 en ontwerpcriteria O6, O12: met een muis schuift bij aanwijzen en focus de pijl 6 px, groeien de stompjes
// tot 17 px en wordt de lijn dekkend (0,6 s, rustig in-uit); de tekst staat stil; focus maakt de lijn 2 px; geen outline nodig
test(`pijl-link met een muis: rustige animatie bij aanwijzen en focus, tekst staat stil (${BRIEF}, criteria 14, 15, O6, O12)`, async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen met een muis');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', baseURL: info.project.use.baseURL });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  const page = await ctx.newPage();
  await page.goto('/kraamcadeauboxen');
  await page.evaluate(() => document.fonts.ready);
  const pijl = page.locator('.pagina-kop .pijl').first();
  const lees = () => pijl.evaluate(p => { const k = getComputedStyle(p, '::before'), svg = getComputedStyle(p.querySelector('svg'));
    const tn = [...p.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()), rg = document.createRange(); rg.selectNodeContents(tn);
    return { x: new DOMMatrix(svg.transform).m41, stomp: k.backgroundSize, op: k.opacity, lijn: k.borderTopWidth, tekst: rg.getBoundingClientRect().left,
      duur: k.transitionDuration, curve: k.transitionTimingFunction, outline: getComputedStyle(p).outlineStyle }; });
  const rust = await lees();
  expect([rust.x, rust.stomp, rust.op, rust.lijn], 'in rust').toEqual([0, '1px 10px, 1px 10px', '0.72', '1px']);
  expect(rust.duur.split(', ')[0], 'overgang 0,6 s').toBe('0.6s');
  expect(rust.curve, 'rustig in-uit').toContain('cubic-bezier(0.45, 0, 0.55, 1)');
  await pijl.hover();
  await page.waitForTimeout(700);
  const hover = await lees();
  expect([hover.x, hover.stomp, hover.op], 'na 0,7 s aanwijzen').toEqual([6, '1px 17px, 1px 17px', '1']);
  expect(Math.abs(hover.tekst - rust.tekst), 'de tekst staat stil').toBeLessThanOrEqual(0.01);
  await page.mouse.move(5, 895);
  await page.waitForTimeout(700);
  // toetsenbordfocus: zelfde beweging en de lijn 2 px (naar binnen), zonder losse outline
  await page.locator('.pagina-kop').evaluate(e => { e.tabIndex = -1; e.focus(); });
  await page.keyboard.press('Tab');
  await expect(pijl).toBeFocused();
  await page.waitForTimeout(700);
  const focus = await lees();
  expect([focus.x, focus.stomp, focus.op, focus.lijn, focus.outline], 'na 0,7 s focus').toEqual([6, '2px 17px, 2px 17px', '1', '2px', 'none']);
  expect(Math.abs(focus.tekst - rust.tekst), 'de tekst staat stil bij focus').toBeLessThanOrEqual(0.01);
  await ctx.close();
});

// Criterium 14: op touch geen hover-animatie; bij minder beweging direct en de pijl schuift niet
test(`pijl-link op touch en bij minder beweging: geen overgang, de pijl schuift niet (${BRIEF}, criterium 14)`, async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const pijl = page.locator('.pagina-kop .pijl').first();
  if (info.project.name !== 'desktop') {
    // touch (zonder minder beweging): geen overgang op pijl en kader
    const ctx = await page.context().browser().newContext({ ...info.project.use, reducedMotion: 'no-preference' });
    const p2 = await ctx.newPage();
    await p2.goto('/kraamcadeauboxen');
    const t = await p2.locator('.pagina-kop .pijl').first().evaluate(p => [getComputedStyle(p.querySelector('svg')).transitionDuration, getComputedStyle(p, '::before').transitionDuration]);
    expect(t.every(d => d.split(', ').every(x => parseFloat(x) === 0)), `touch: geen overgang (${t})`).toBe(true);
    await ctx.close();
    return;
  }
  // minder beweging (hulp.js) met een muis: ook een projecttegel van Inspiratie (de tegel is de link) verschuift de pijl niet
  await page.goto('/inspiratie');
  const tegel = page.locator('.project-link').first();
  await tegel.scrollIntoViewIfNeeded();
  await tegel.hover();
  expect(await tegel.locator('.pijl svg').evaluate(s => getComputedStyle(s).transform), 'Inspiratie-tegel: de pijl schuift niet bij minder beweging').toBe('none');
  await page.goto('/kraamcadeauboxen');
  // minder beweging (hulp.js) met een muis: direct, pijl blijft staan, lijn wel dekkend
  await pijl.hover();
  const m = await pijl.evaluate(p => [new DOMMatrix(getComputedStyle(p.querySelector('svg')).transform).m41, getComputedStyle(p, '::before').opacity, getComputedStyle(p, '::before').transitionDuration]);
  expect(m[0], 'de pijl schuift niet').toBe(0);
  expect(m[1], 'de lijn wordt direct dekkend').toBe('1');
  expect(m[2].split(', ').every(x => parseFloat(x) === 0), 'geen overgang').toBe(true);
});

// Criterium 16: waar de pijl-link wegvalt of vervaagt (drieluik stap 1, hoverlijst lijst-actief) vervaagt het kader mee
test(`kader vervaagt mee met de pijl-link (drieluik stap 1) (${BRIEF}, criterium 16)`, async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobiel', 'stap 1 bestaat alleen op mobiel staand');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference', locale: 'nl-NL', baseURL: info.project.use.baseURL });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { const k = document.getElementById('babynest'); window.scrollTo({ top: k.getBoundingClientRect().top + scrollY - innerHeight * 0.62, behavior: 'instant' }); });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => { const p = document.querySelector('#babynest .kern-tekst .pijl');
    return [p.closest('.kern-kolom').classList.contains('aangekomen'), getComputedStyle(p).opacity, getComputedStyle(p, '::before').content, getComputedStyle(p, '::before').position]; });
  expect(m[0], 'blok 3 staat met de bovenrand op 62 % nog in stap 1').toBe(false);
  expect(m[1], 'pijl-link onzichtbaar').toBe('0');
  // het kader is een pseudo-element van de link zelf: het vervaagt mee, er blijft geen losse lijn staan
  expect(m.slice(2), 'kader hoort bij de link').toEqual(['""', 'absolute']);
  await ctx.close();
});

// Ontwerpcriterium O10: Hoe ik werk zonder cijfers; Zo werkt het met een rondje en een punt van 5 px
test(`Hoe ik werk zonder cijfers; Zo werkt het: rondje met een punt van 5 px (${BRIEF}, criteria 5, 8, O10)`, async ({ page }, info) => {
  await page.goto('/werkwijze');
  const hoe = await page.evaluate(() => [[...document.querySelectorAll('.hoe-tab')].map(t => t.textContent.trim()), [...document.querySelectorAll('.hoe-stap h2')].map(h => h.textContent.trim())]);
  expect(hoe).toEqual([['Samen kiezen', 'Persoonlijk maken', 'Met zorg gemaakt'], ['Samen kiezen', 'Persoonlijk maken', 'Met zorg gemaakt']]);
  const rond = { desktop: 48, tablet: 44, mobiel: 40, iphone: 40 }[info.project.name];
  for (const pad of ['/kraamcadeauboxen', '/prematuurkleding', '/babynest']) {
    await page.goto(pad);
    const m = await page.evaluate(() => ({ lijst: document.querySelector('#zo-werkt-het ol.stappen, #werkwijze ol.stappen') ? 'ol' : null,
      stappen: [...document.querySelectorAll('.stappen .stap-nr')].map(e => { const r = e.getBoundingClientRect(), p = getComputedStyle(e, '::before');
        return [Math.round(r.width), e.textContent.trim(), e.getAttribute('aria-hidden'), p.width, p.height, p.borderRadius]; }) }));
    expect(m.lijst, `${pad}: de stappen blijven een <ol>`).toBe('ol');
    expect(m.stappen, `${pad}: rondje ${rond} px met een punt van 5 px, zonder cijfer`).toEqual([0, 1, 2].map(() => [rond, '', 'true', '5px', '5px', '50%']));
  }
});
