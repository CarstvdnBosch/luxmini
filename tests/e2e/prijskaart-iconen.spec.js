// Brief 2026-11-14-prijskaart-iconen (issue #71): zeven eigen lijntekeningen op de formaatkaarten in het formulier (contact.html)
// en op de prijskaarten van 001 Kies je formaat (kraamcadeauboxen.html). Doorgetrokken = in de box, gestippeld op dekking 0,5 = komt erbij.
// Met een muis verschijnen ze bij aanwijzen, focus en (in het formulier) de gekozen kaart; op touch staan ze er altijd.
// Er gaat nooit een echte mail weg: /api/contact loopt via de testmodus van scripts/serveer.mjs (x-testmail, x-testmail-bevat).
// axe op contact.html en kraamcadeauboxen.html: tests/e2e/toegankelijkheid.spec.js.
import { test, expect, wachtOpRust } from './hulp.js';

const PRIJZEN = ['35', '50', '65', '80'];
const IN_BOX = [3, 4, 6, 7];
const ICONEN = ['knuffel', 'swaddle', 'broekje', 'sjaaltje', 'shirtje', 'douchehandschoen', 'bijtring-of-speenkoord'];
const NAMEN = { 35: '€ 35 Knuffel, swaddle en broekje', 50: '€ 50 Met een sjaaltje erbij', 65: '€ 65 Met shirtje en douchehandschoen', 80: '€ 80 Met bijtring of speenkoord' };
const UITLEG = {
  35: 'In deze box: knuffel, swaddle en broekje. In een grotere box komen erbij: sjaaltje, shirtje, douchehandschoen, bijtring of speenkoord.',
  50: 'In deze box: knuffel, swaddle, broekje en sjaaltje. In een grotere box komen erbij: shirtje, douchehandschoen, bijtring of speenkoord.',
  65: 'In deze box: knuffel, swaddle, broekje, sjaaltje, shirtje en douchehandschoen. In de box van € 80 komt er een bijtring of speenkoord bij.',
  80: 'In deze box: knuffel, swaddle, broekje, sjaaltje, shirtje, douchehandschoen en een bijtring of speenkoord.',
};
const KAART = (p) => `.keuze-kaart:has(input[name="box_formaat"][value="${p}"])`;
const schoon = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const muis = (info) => info.project.name === 'desktop';

async function naarFormulier(page, extra = '') {
  await page.goto(`/contact?onderwerp=kraamcadeaubox${extra}#formulier`);
  await wachtOpRust(page);
  await page.waitForTimeout(350);
}
async function naarBoxen(page) {
  await page.goto('/kraamcadeauboxen#formaten');
  await wachtOpRust(page);
}

// leest per kaart de zeven iconen: naam, gestippeld, dekking van de tekening, attributen, maat, kleur en de zichtbaarheid
const LEES = (kaarten) => kaarten.map((k) => [...k.querySelectorAll('svg.icoon')].map((s) => {
  const r = s.getBoundingClientRect(), g = s.querySelector(':scope > g');
  return {
    naam: [...s.classList].find((c) => c.startsWith('icoon-'))?.slice(6),
    stip: s.getAttribute('stroke-dasharray') === '2 2', dekking: g ? g.getAttribute('opacity') : '1',
    attr: ['viewBox', 'stroke-width', 'fill', 'stroke', 'stroke-linecap', 'stroke-linejoin', 'aria-hidden'].map((a) => s.getAttribute(a)),
    maat: [r.width, r.height], kleur: getComputedStyle(s).color, zicht: getComputedStyle(s).opacity,
  };
}));

for (const plek of ['formulier', 'kraamcadeauboxen']) {
  test(`${plek}: elke kaart toont de zeven iconen in vaste volgorde, 3/4/6/7 doorgetrokken, de rest gestippeld op 0,5; 24 × 24 px in inkt`, async ({ page }) => {
    if (plek === 'formulier') await naarFormulier(page); else await naarBoxen(page);
    const sel = plek === 'formulier' ? '.keuze-kaart:has(input[name="box_formaat"])' : '#formaten .formaat';
    const kaarten = await page.locator(sel).evaluateAll(LEES);
    expect(kaarten.length).toBe(4);
    kaarten.forEach((iconen, i) => {
      expect(iconen.map((x) => x.naam), `€ ${PRIJZEN[i]}: volgorde`).toEqual(ICONEN);
      expect(iconen.filter((x) => !x.stip).length, `€ ${PRIJZEN[i]}: doorgetrokken`).toBe(IN_BOX[i]);
      iconen.forEach((x, j) => {
        const erbij = j >= IN_BOX[i];
        expect(x.stip, `€ ${PRIJZEN[i]} ${x.naam}: gestippeld = komt erbij`).toBe(erbij);
        expect(x.dekking, `€ ${PRIJZEN[i]} ${x.naam}: dekking`).toBe(erbij ? '.5' : '1');
        expect(x.attr, `€ ${PRIJZEN[i]} ${x.naam}: stijl`).toEqual(['0 0 24 24', '1.3', 'none', 'currentColor', 'round', 'round', 'true']);
        expect(Math.abs(x.maat[0] - 24) <= 0.5 && Math.abs(x.maat[1] - 24) <= 0.5, `€ ${PRIJZEN[i]} ${x.naam}: 24 × 24 px (${x.maat})`).toBe(true);
        expect(x.kleur, `€ ${PRIJZEN[i]} ${x.naam}: inkt, nooit wit`).toBe('rgb(32, 32, 32)');
      });
    });
    // de iconen zijn versiering: geen tekst, geen foto's, geen externe bestanden; de groep is aria-hidden
    const extern = await page.locator(`${sel} svg.icoon`).evaluateAll((ss) => ss.filter((s) => s.querySelector('image, use, text, foreignObject')).length);
    expect(extern, 'geen <image>, <use>, <text> in de iconen').toBe(0);
    const verborgen = await page.locator(sel).evaluateAll((ks) => ks.every((k) => k.querySelector('svg.icoon').closest('[aria-hidden="true"]')));
    expect(verborgen, 'iconen zijn aria-hidden').toBe(true);
    // legenda: 16 px, altijd zichtbaar, aria-hidden; in het formulier onder de kaarten, op Kraamcadeauboxen boven .formaten-voet
    const leg = await page.evaluate((plek) => {
      const l = plek === 'formulier' ? document.querySelector('fieldset.keuzes .iconen-legenda') : document.querySelector('#formaten .iconen-legenda');
      if (!l) return null;
      const ref = plek === 'formulier' ? document.querySelector('.keuze-kaarten').getBoundingClientRect().bottom : document.querySelector('.formaten').getBoundingClientRect().bottom;
      const voet = document.querySelector('.formaten-voet');
      return { px: parseFloat(getComputedStyle(l).fontSize), tekst: l.textContent.replace(/\s+/g, ' ').trim(), verborgen: l.getAttribute('aria-hidden'), onder: l.getBoundingClientRect().top >= ref - 0.5,
        boven: plek === 'formulier' ? true : l.getBoundingClientRect().bottom <= voet.getBoundingClientRect().top, zicht: l.getBoundingClientRect().height > 0 && getComputedStyle(l).visibility === 'visible',
        stip: [...l.querySelectorAll('svg')].map((s) => s.getAttribute('stroke-dasharray')) };
    }, plek);
    expect(leg, 'legenda aanwezig').not.toBeNull();
    expect(leg.px).toBe(16);
    expect(leg.tekst).toBe('in de boxkomt erbij in een grotere box');
    expect(leg.verborgen).toBe('true');
    expect(leg.zicht && leg.onder && leg.boven, `legenda zichtbaar op de goede plek (${JSON.stringify(leg)})`).toBe(true);
    expect(leg.stip).toEqual([null, '2 2']);
  });
}

test('formulier: name, waarden en toegankelijke naam blijven; beschrijving via aria-describedby met de tekst uit de brief', async ({ page }) => {
  await naarFormulier(page);
  expect(await page.locator('input[name="box_formaat"]').evaluateAll((is) => is.map((i) => [i.type, i.value]))).toEqual(PRIJZEN.map((p) => ['radio', p]));
  for (const p of PRIJZEN) {
    const r = page.locator(`input[name="box_formaat"][value="${p}"]`);
    await expect(r).toHaveAccessibleName(NAMEN[p]);
    const beschrijving = await r.evaluate((i) => { const d = document.getElementById(i.getAttribute('aria-describedby')); return d ? [d.textContent, d.className, !!d.closest('label')] : null; });
    expect(beschrijving, `€ ${p}: aria-describedby wijst naar een bestaande tekst`).not.toBeNull();
    expect(schoon(beschrijving[0])).toBe(UITLEG[p]);
    expect(beschrijving[1], 'alleen voor schermlezers').toBe('sr-only');
    expect(beschrijving[2], 'buiten het label, zodat de naam niet langer wordt').toBe(false);
  }
});

test('formulier met een muis: in rust dekking 0, bij aanwijzen 1, geen sprong; raster 120 × 56, kaarten even hoog en ≤ 190 px (1440 en 1280)', async ({ page }, info) => {
  test.skip(!muis(info), 'alleen met een muis');
  for (const breedte of [1440, 1280]) {
    await page.setViewportSize({ width: breedte, height: 900 });
    await naarFormulier(page);
    const meet = () => page.evaluate(() => {
      const ks = [...document.querySelectorAll('.keuze-kaart:has(input[name="box_formaat"])')];
      return { zicht: ks.map((k) => [...k.querySelectorAll('.icoon')].map((s) => getComputedStyle(s).opacity)), hoog: ks.map((k) => k.getBoundingClientRect().height),
        raster: ks.map((k) => { const r = k.querySelector('.keuze-iconen').getBoundingClientRect(), kr = k.getBoundingClientRect(); return [r.width, r.height, r.right <= kr.right, r.bottom <= kr.bottom]; }),
        stof: document.querySelector('fieldset.stofkeuze').getBoundingClientRect().top + scrollY };
    });
    const rust = await meet();
    rust.zicht.forEach((k, i) => expect(k.every((o) => o === '0'), `${breedte}: € ${PRIJZEN[i]} in rust onzichtbaar`).toBe(true));
    expect(new Set(rust.hoog.map(Math.round)).size, `${breedte}: kaarten even hoog (${rust.hoog})`).toBe(1);
    expect(Math.max(...rust.hoog), `${breedte}: kaart ≤ 190 px`).toBeLessThanOrEqual(190);
    rust.raster.forEach((r) => expect(r, `${breedte}: raster 120 × 56 binnen de kaart`).toEqual([120, 56, true, true]));
    await page.locator(KAART('50')).hover();
    const aan = await meet();
    aan.zicht.forEach((k, i) => expect(k.every((o) => o === (i === 1 ? '1' : '0')), `${breedte}: € ${PRIJZEN[i]} bij aanwijzen € 50`).toBe(true));
    expect(aan.stof - rust.stof, `${breedte}: Thema verschuift niet bij aanwijzen`).toBe(0);
    expect(aan.hoog, `${breedte}: kaarten groeien niet`).toEqual(rust.hoog);
    await page.mouse.move(2, 2);
    const weer = await meet();
    expect(weer.zicht[1].every((o) => o === '0'), `${breedte}: na verlaten weer weg`).toBe(true);
    expect(weer.stof - rust.stof, `${breedte}: Thema verschuift niet na verlaten`).toBe(0);
  }
});

test('formulier: kiezen met een klik op de iconen, het vinkje en de gekozen kaart houdt zijn iconen; vooraf ingevuld via ?formaat=65', async ({ page }, info) => {
  await naarFormulier(page, '&formaat=65');
  await expect(page.locator('input[name="box_formaat"][value="65"]')).toBeChecked();
  const zicht = (p) => page.locator(`${KAART(p)} .icoon`).evaluateAll((ss) => ss.map((s) => getComputedStyle(s).opacity));
  if (muis(info)) await page.mouse.move(2, 2);
  expect((await zicht('65')).every((o) => o === '1'), '€ 65 gekozen: iconen zichtbaar').toBe(true);
  // klik/tik midden op de iconen van € 80: kiest de kaart (de iconen vangen geen klik).
  // Eerst in beeld: op de iPhone (390 × 664) staat € 80 onder de vouw en een tik buiten het scherm raakt niets (CI 14 nov., PR #82).
  await page.locator(`${KAART('80')} .keuze-iconen`).scrollIntoViewIfNeeded();
  const box = await page.locator(`${KAART('80')} .keuze-iconen`).boundingBox();
  // onder het tikpunt ligt de onzichtbare radio van € 80 zelf, niet het icoon of iets anders (ook in WebKit)
  const geraakt = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? [e.tagName, e.name || '', e.value || ''] : null; }, [box.x + box.width / 2, box.y + box.height / 2]);
  expect(geraakt, 'het tikpunt op de iconen raakt de radio van € 80').toEqual(['INPUT', 'box_formaat', '80']);
  if (info.project.use?.hasTouch || info.project.name !== 'desktop') await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('input[name="box_formaat"][value="80"]')).toBeChecked();
  expect(await page.locator(`${KAART('80')} .keuze-vink`).evaluate((v) => getComputedStyle(v).opacity)).toBe('1');
  if (muis(info)) await page.mouse.move(2, 2);
  expect((await zicht('80')).every((o) => o === '1'), '€ 80 gekozen: iconen zichtbaar').toBe(true);
  if (muis(info)) expect((await zicht('65')).every((o) => o === '0'), '€ 65 niet meer gekozen: weg').toBe(true);
});

test('formulier: versturen zet "Formaat" in de mail zoals nu', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent('\nFormaat: € 65\n') });
  await naarFormulier(page, '&formaat=65');
  await page.locator('textarea[name="bericht"]').fill('Graag een box');
  await page.locator('input[name="naam"]').fill('Test Persoon');
  await page.locator('input[name="email"]').fill('test@voorbeeld.test');
  await page.locator('button.verstuur').click();
  await expect(page).toHaveURL(/\/bedankt$/);
});

test('toetsenbord: Tab naar de formaatkeuze en pijl naar € 65 toont de iconen met een focusrand van 2 px; op Kraamcadeauboxen Tab naar "Stel deze box samen" van € 50', async ({ page }, info) => {
  test.skip(!muis(info), 'toetsenbord op het desktopscherm');
  await naarFormulier(page);
  await page.locator('select[name="onderwerp"]').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="box_formaat"][value="35"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const r65 = page.locator('input[name="box_formaat"][value="65"]');
  await expect(r65).toBeFocused();
  await expect(r65).toBeChecked();
  await page.mouse.move(2, 2);
  const m = await r65.evaluate((i) => { const k = i.closest('.keuze-kaart'), rand = getComputedStyle(k.querySelector('.keuze-rand'));
    return { zicht: [...k.querySelectorAll('.icoon')].map((s) => getComputedStyle(s).opacity), rand: [rand.outlineStyle, rand.outlineWidth, rand.outlineColor] }; });
  expect(m.zicht.every((o) => o === '1'), 'iconen van € 65 zichtbaar').toBe(true);
  expect(m.rand).toEqual(['solid', '2px', 'rgb(32, 32, 32)']);

  await naarBoxen(page);
  await page.mouse.move(2, 2);
  await page.locator('#formaten .formaat').nth(0).locator('a.pijl').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#formaten .formaat').nth(1).locator('a.pijl')).toBeFocused();
  const b = await page.locator('#formaten .formaat').evaluateAll((ks) => ks.map((k) => [[...k.querySelectorAll('.icoon')].every((s) => getComputedStyle(s).opacity === '1'), getComputedStyle(k.querySelector('.takje')).opacity]));
  expect(b[1], '€ 50: iconen zichtbaar, takje weg').toEqual([true, '0']);
  expect(b[0], '€ 35: in rust').toEqual([false, '1']);
});

test('Kraamcadeauboxen met een muis (1440 en 1280): in rust het takje, bij aanwijzen het raster op die plek; de kaart groeit niet', async ({ page }, info) => {
  test.skip(!muis(info), 'alleen met een muis');
  // 1280: 534 (was 506). Brief 2026-11-18-elegante-navigatie, ronde 2: de pijl-link "Stel deze box samen" past met kader niet
  // op één regel in de kaart van 197 px binnenbreedte en staat nu op twee regels met 12 px boven en onder in het kader
  // (eerder raakte de tekst de lijnen). Alleen het ijkpunt verschuift; de grens (± 8 px, niet groeien bij aanwijzen) blijft.
  for (const [breedte, nu] of [[1440, 512], [1280, 534]]) {
    await page.setViewportSize({ width: breedte, height: 900 });
    await naarBoxen(page);
    await page.mouse.move(2, 2);
    const meet = () => page.locator('#formaten .formaat').nth(2).evaluate((k) => {
      const t = k.querySelector('.takje'), g = k.querySelector('.formaat-iconen'), p = k.querySelector('.formaat-prijs');
      const tr = t.getBoundingClientRect(), gr = g.getBoundingClientRect();
      return { h: k.getBoundingClientRect().height, takje: getComputedStyle(t).opacity, zicht: [...g.querySelectorAll('.icoon')].map((s) => getComputedStyle(s).opacity),
        raster: [gr.width, gr.height], plek: Math.abs(gr.left - tr.left) <= 0.5 && Math.abs(gr.top - tr.top) <= 0.5 && gr.bottom <= p.getBoundingClientRect().top };
    });
    const rust = await meet();
    expect(rust.takje, `${breedte}: takje in rust`).toBe('1');
    expect(rust.zicht.every((o) => o === '0'), `${breedte}: iconen in rust weg`).toBe(true);
    expect(Math.abs(rust.h - nu), `${breedte}: hoogte ${rust.h} wijkt hooguit 8 px af van ${nu}`).toBeLessThanOrEqual(8);
    await page.locator('#formaten .formaat').nth(2).hover();
    const aan = await meet();
    expect(aan.takje, `${breedte}: takje weg bij aanwijzen`).toBe('0');
    expect(aan.zicht.every((o) => o === '1'), `${breedte}: iconen bij aanwijzen`).toBe(true);
    expect(aan.raster).toEqual([120, 56]);
    expect(aan.plek, `${breedte}: raster op de plek van het takje, boven de prijs`).toBe(true);
    expect(Math.abs(aan.h - rust.h), `${breedte}: hoogte rust/aanwijzen`).toBeLessThanOrEqual(1);
  }
});

test('beweging: 0,4 s per icoon met 0,05 s ertussen, alles binnen 0,75 s; verdwijnen 0,2 s', async ({ browser }, info) => {
  test.skip(!muis(info), 'alleen met een muis');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  const page = await ctx.newPage();
  await naarFormulier(page);
  const lees = (sel) => page.locator(sel).evaluateAll((ss) => ss.map((s) => { const c = getComputedStyle(s); return [c.transitionDuration.split(',')[0].trim(), c.transitionDelay.split(',')[0].trim()]; }));
  const uit = await lees(`${KAART('35')} .icoon`);
  uit.forEach((t) => expect(t, 'verdwijnen samen in 0,2 s').toEqual(['0.2s', '0s']));
  await page.locator(KAART('35')).hover();
  const aan = await lees(`${KAART('35')} .icoon`);
  expect(aan).toEqual(['0s', '0.05s', '0.1s', '0.15s', '0.2s', '0.25s', '0.3s'].map((d) => ['0.4s', d]));
  expect(0.3 + 0.4, 'alles binnen 0,75 s').toBeLessThanOrEqual(0.75);
  await naarBoxen(page);
  await page.locator('#formaten .formaat').nth(0).hover();
  expect(await lees('#formaten .formaat:nth-child(1) .icoon')).toEqual(['0s', '0.05s', '0.1s', '0.15s', '0.2s', '0.25s', '0.3s'].map((d) => ['0.4s', d]));
  expect(await lees('#formaten .formaat:nth-child(1) .takje')).toEqual([['0.4s', '0s']]);
  await ctx.close();
});

test('minder beweging: de iconen en het takje zonder overgang, direct op dekking 1', async ({ page }, info) => {
  // de fixture zet prefers-reduced-motion: reduce
  await naarFormulier(page);
  if (muis(info)) await page.locator(KAART('50')).hover();
  const f = await page.locator(`${KAART('50')} .icoon`).evaluateAll((ss) => ss.map((s) => { const c = getComputedStyle(s); return [c.transitionDuration, c.opacity, c.transform]; }));
  f.forEach((x) => expect(x).toEqual(['0s', '1', 'none']));
  await naarBoxen(page);
  if (muis(info)) await page.locator('#formaten .formaat').nth(1).hover();
  const b = await page.locator('#formaten .formaat').nth(1).evaluate((k) => [...k.querySelectorAll('.icoon, .takje')].map((s) => { const c = getComputedStyle(s); return [c.transitionDuration, s.classList.contains('takje') ? 'takje' : c.opacity]; }));
  b.forEach((x) => expect(x[0]).toBe('0s'));
  b.filter((x) => x[1] !== 'takje').forEach((x) => expect(x[1]).toBe('1'));
});

test('touch: de iconen staan er zonder aanwijzen; formulier op 390 px compact, binnen de kaart en zonder horizontaal scrollen', async ({ page }, info) => {
  test.skip(muis(info), 'alleen op touch');
  await naarFormulier(page);
  const m = await page.evaluate(() => {
    const ks = [...document.querySelectorAll('.keuze-kaart:has(input[name="box_formaat"])')];
    return { zicht: ks.flatMap((k) => [...k.querySelectorAll('.icoon')].map((s) => getComputedStyle(s).opacity)),
      kaarten: ks.map((k) => { const r = k.getBoundingClientRect(), g = k.querySelector('.keuze-iconen').getBoundingClientRect(); return { b: r.width, h: r.height, marge: r.right - g.right, binnen: g.left >= r.left && g.bottom <= r.bottom }; }),
      rij: document.querySelector('.keuze-kaarten').getBoundingClientRect().height, groep: document.querySelector('.groep[data-groep="Kraamcadeaubox"]').getBoundingClientRect().height,
      breed: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(m.zicht.every((o) => o === '1'), 'alle iconen zichtbaar zonder aanwijzen').toBe(true);
  expect(m.breed, 'niets scrolt horizontaal').toBe(0);
  m.kaarten.forEach((k, i) => { expect(k.b >= 44 && k.h >= 44, `€ ${PRIJZEN[i]}: tikdoel ≥ 44 × 44`).toBe(true); expect(k.binnen, `€ ${PRIJZEN[i]}: raster binnen de kaart`).toBe(true); });
  if (info.project.name === 'mobiel') {
    expect(m.rij, '.keuze-kaarten ≤ 400 px').toBeLessThanOrEqual(400);
    m.kaarten.forEach((k, i) => expect(k.marge, `€ ${PRIJZEN[i]}: minstens 12 px marge rechts`).toBeGreaterThanOrEqual(12));
    expect(m.groep, 'groep Kraamcadeaubox hooguit 180 px hoger (was 1306 px)').toBeLessThanOrEqual(1306 + 180);
  }
});

test('touch: Kraamcadeauboxen toont de iconen altijd; tablet zonder takje op dezelfde plek, mobiel één rij van zeven tussen prijs en "In deze box/plus:" binnen 1,2 scherm', async ({ page }, info) => {
  test.skip(muis(info), 'alleen op touch');
  await naarBoxen(page);
  const m = await page.evaluate(() => {
    const ks = [...document.querySelectorAll('#formaten .formaat')];
    const zichtbaar = (el) => { const r = el.getBoundingClientRect(), c = getComputedStyle(el); return r.width > 0 && r.height > 0 && c.display !== 'none' && c.visibility !== 'hidden'; };
    return { breed: document.documentElement.scrollWidth - document.documentElement.clientWidth, span: ks[3].getBoundingClientRect().bottom - ks[0].getBoundingClientRect().top, scherm: innerHeight,
      kaarten: ks.map((k) => { const g = k.querySelector('.formaat-iconen').getBoundingClientRect(), p = k.querySelector('.formaat-prijs').getBoundingClientRect(), a = k.querySelector('.formaat-aantal').getBoundingClientRect();
        const inh = k.querySelector('.formaat-inhoud').getBoundingClientRect(), pijl = k.querySelector('a.pijl').getBoundingClientRect();
        return { zicht: [...k.querySelectorAll('.icoon')].every((s) => getComputedStyle(s).opacity === '1'), takje: zichtbaar(k.querySelector('.takje')),
          vink: [...k.querySelectorAll('.formaat-lijst .vink')].some(zichtbaar), raster: [g.width, g.height], h: k.getBoundingClientRect().height,
          rij: new Set([...k.querySelectorAll('.icoon')].map((s) => Math.round(s.getBoundingClientRect().top))).size,
          volgorde: g.top >= Math.max(p.bottom, a.bottom) - 0.5 && g.bottom <= inh.top + 0.5 && inh.bottom <= pijl.top + 0.5, boven: g.bottom <= p.top + 0.5 }; }) };
  });
  expect(m.breed, 'niets scrolt horizontaal').toBe(0);
  m.kaarten.forEach((k, i) => {
    expect(k.zicht, `€ ${PRIJZEN[i]}: iconen zichtbaar`).toBe(true);
    expect(k.takje, `€ ${PRIJZEN[i]}: geen takje op touch`).toBe(false);
  });
  if (info.project.name === 'tablet') {
    m.kaarten.forEach((k, i) => { expect(k.raster, `€ ${PRIJZEN[i]}: raster 4 + 3`).toEqual([120, 56]); expect(k.boven, `€ ${PRIJZEN[i]}: raster boven de prijs (plek van het takje)`).toBe(true); });
    // nu (zonder iconen) 503 / 503 / 471 / 471 px op 768 × 1024; hooguit 8 px hoger
    [503, 503, 471, 471].forEach((nu, i) => expect(m.kaarten[i].h, `€ ${PRIJZEN[i]}: hooguit 8 px hoger dan ${nu}`).toBeLessThanOrEqual(nu + 8));
  } else {
    m.kaarten.forEach((k, i) => {
      expect(k.raster, `€ ${PRIJZEN[i]}: één rij van 216 × 24`).toEqual([216, 24]);
      expect(k.rij, `€ ${PRIJZEN[i]}: één rij`).toBe(1);
      expect(k.volgorde, `€ ${PRIJZEN[i]}: prijs + aantal → iconen → In deze box/plus → pijl-link`).toBe(true);
      expect(k.vink, `€ ${PRIJZEN[i]}: geen vinklijst`).toBe(false);
    });
    expect(m.span, `€ 35 t/m € 80: ${Math.round(m.span)} px, hooguit 1,2 scherm`).toBeLessThanOrEqual(1.2 * m.scherm);
  }
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('iconen, aanwijzen/touch en kiezen werken ook zonder JavaScript', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone', 'Chromium-schermen');
    await page.goto('/contact#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
    const zicht = (p) => page.locator(`${KAART(p)} .icoon`).evaluateAll((ss) => ss.map((s) => getComputedStyle(s).opacity));
    expect(await page.locator('.keuze-kaart:has(input[name="box_formaat"]) .icoon').count()).toBe(28);
    if (muis(info)) {
      await page.mouse.move(2, 2);
      expect((await zicht('35')).every((o) => o === '0')).toBe(true);
      await page.locator(KAART('35')).hover();
      expect((await zicht('35')).every((o) => o === '1'), 'aanwijzen zonder JavaScript').toBe(true);
      await page.locator(KAART('80')).click();
    } else {
      expect((await zicht('35')).every((o) => o === '1'), 'touch: altijd zichtbaar').toBe(true);
      await page.locator(KAART('80')).tap();
    }
    await expect(page.locator('input[name="box_formaat"][value="80"]')).toBeChecked();
    if (muis(info)) await page.mouse.move(2, 2);
    expect((await zicht('80')).every((o) => o === '1'), 'gekozen kaart houdt zijn iconen').toBe(true);
    await page.goto('/kraamcadeauboxen#formaten');
    const box = () => page.locator('#formaten .formaat').nth(1).evaluate((k) => [[...k.querySelectorAll('.icoon')].every((s) => getComputedStyle(s).opacity === '1'), k.querySelectorAll('.icoon').length]);
    if (muis(info)) await page.locator('#formaten .formaat').nth(1).hover();
    expect(await box()).toEqual([true, 7]);
  });
});
