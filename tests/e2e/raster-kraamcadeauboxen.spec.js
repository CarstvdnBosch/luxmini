// Brief 2026-11-14-walvis-uit-assortiment (besluit Carst 14 nov. 13:31: "Eén raster"), ontwerpcriteria 1–8, 13 en 14:
// productenrij, stoffenrij en themacarrousel op Kraamcadeauboxen delen één raster (rand van .wrap, kolom, gat).
// De formuliercriteria 11 en 12 staan in stofkeuze.spec.js.
import { test, expect } from './hulp.js';

const meet = page => page.evaluate(() => {
  const rect = e => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, b: r.width, h: r.height }; };
  const label = document.querySelector('#in-de-box .label').getBoundingClientRect();
  const rij = id => {
    const r = document.getElementById(id), ul = r.querySelector('ul');
    const knop = document.querySelector(`.carrousel-knop[aria-controls="${id}"]`);
    return { tegels: [...ul.children].map(rect), gat: parseFloat(getComputedStyle(ul).columnGap) || 0,
      scrolt: r.scrollWidth > r.clientWidth + 1, tab: r.getAttribute('tabindex'), knoppen: !!knop && knop.offsetParent !== null,
      scrollLeft: r.scrollLeft, gedrag: getComputedStyle(r).scrollBehavior };
  };
  return { label: { l: label.left, r: label.right }, b: innerWidth, pagina: document.documentElement.scrollWidth - innerWidth,
    p: rij('productenrij'), s: rij('stoffenrij'), t: rij('themacarrousel'),
    fotos: [...document.querySelectorAll('#productenrij .product img, #productenrij .product-tekening, #stoffenrij .stof img')].map(rect) };
});

async function naar(page, breedte) {
  if (breedte) await page.setViewportSize({ width: breedte, height: 900 });
  await page.goto('/kraamcadeauboxen#in-de-box');
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(() => ['productenrij', 'stoffenrij', 'themacarrousel'].forEach(id => { document.getElementById(id).scrollLeft = 0; }));
  await page.waitForTimeout(50);
}

test('raster: linkerrand op alle breedtes, rechterrand op desktop, maten en geen horizontaal scrollen (criteria 1, 2, 5, 8, 13)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'breedtes worden hier zelf gezet (met een muis)');
  for (const w of [360, 390, 768, 1024, 1025, 1280, 1440, 1600, 1920]) {
    await naar(page, w);
    const m = await meet(page);
    // 1: de eerste product-, stof- en themategel beginnen op de linkerkant van het label "002 —"
    for (const k of ['p', 's', 't']) expect(Math.abs(m[k].tegels[0].l - m.label.l), `${w}: eerste tegel (${k}) op de linkerrand`).toBeLessThanOrEqual(1);
    // 8: nooit een stoftegel breder dan 240 px of een thema breder dan 600 px
    for (const t of m.s.tegels) expect(t.b, `${w}: stoftegel max. 240 px`).toBeLessThanOrEqual(240);
    for (const t of m.t.tegels) expect(t.b, `${w}: thema max. 600 px`).toBeLessThanOrEqual(600);
    // 13: de pagina scrolt niet horizontaal
    if ([360, 390, 768, 1024].includes(w)) expect(m.pagina, `${w}: pagina scrolt niet horizontaal`).toBeLessThanOrEqual(0);
    if (w >= 1025) {
      // 2: product 8, stof 8 en thema 4 eindigen op de rechterkant van het label
      expect(Math.abs(m.p.tegels[7].r - m.label.r), `${w}: product 8 op de rechterrand`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.s.tegels[7].r - m.label.r), `${w}: stof 8 op de rechterrand`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.t.tegels[3].r - m.label.r), `${w}: thema 4 op de rechterrand`).toBeLessThanOrEqual(1);
    }
    if ([1025, 1280, 1440].includes(w)) {
      // 5: producten en stoffen scrollen niet: geen knoppen, geen tabstop
      await expect.poll(async () => { const n = await meet(page); return [n.p.scrolt, n.s.scrolt, n.p.knoppen, n.s.knoppen, n.p.tab, n.s.tab]; },
        { message: `${w}: producten en stoffen zonder scrollen, knoppen en tabstop` }).toEqual([false, false, false, false, null, null]);
    }
    if (w === 1024) {
      await expect.poll(async () => { const n = await meet(page); return [n.p.knoppen, n.s.knoppen, n.p.tab, n.s.tab]; },
        { message: '1024: producten en stoffen met knoppen en tabstop' }).toEqual([true, true, '0', '0']);
    }
    if (w === 390) {
      // 8: kolom 150 px, thema 312 px
      expect(Math.abs(m.p.tegels[0].b - 150), '390: kolom 150 px').toBeLessThanOrEqual(1);
      expect(Math.abs(m.t.tegels[0].b - 312), '390: thema 312 px').toBeLessThanOrEqual(1);
    }
  }
});

test('raster: gelijke kolommen en vierkante foto\'s (criteria 3 en 4)', async ({ page }, info) => {
  await naar(page);
  const m = await meet(page);
  const n = m.b <= 760 ? 2 : m.b <= 1024 ? 4 : 8;
  // 3: product en stof even breed; een thema is 2 × kolom + gat; product n en stof n beginnen op dezelfde x
  expect(Math.abs(m.p.tegels[0].b - m.s.tegels[0].b), 'product en stof even breed').toBeLessThanOrEqual(0.5);
  expect(Math.abs(m.t.tegels[0].b - (2 * m.p.tegels[0].b + m.t.gat)), 'thema = 2 × kolom + gat').toBeLessThanOrEqual(1);
  expect(Math.abs(m.p.gat - m.s.gat), 'zelfde gat').toBeLessThanOrEqual(0.5);
  for (let i = 0; i < n; i++) expect(Math.abs(m.p.tegels[i].l - m.s.tegels[i].l), `${info.project.name}: product ${i + 1} en stof ${i + 1} op dezelfde x`).toBeLessThanOrEqual(1);
  // 4: elke productfoto, de tekening en elke stoffoto is vierkant
  expect(m.fotos.length).toBe(16);
  for (const f of m.fotos) expect(Math.abs(f.h - f.b), `vierkant (${f.b} × ${f.h})`).toBeLessThanOrEqual(1);
  // brief criterium 10: uitsnede met een klasse, geen inline style; width/height blijven de maat van het bestand
  await expect(page.locator('#productenrij img.p-knuffel-naam')).toHaveCSS('object-position', '50% 40%');
  await expect(page.locator('#productenrij img.p-speenkoord-hond')).toHaveCSS('object-position', /^50% 0(%|px)?$/);
  expect(await page.locator('#productenrij [style], #stoffenrij [style], #themacarrousel [style]').count(), 'geen inline style').toBe(0);
  const maten = await page.locator('#productenrij img').evaluateAll(is => is.map(i => [i.getAttribute('width'), i.getAttribute('height')]));
  for (const [w, h] of maten) expect([w, h]).toEqual(['600', '800']);
});

test('raster: mobiel twee tegels in beeld en 25–40 px van de derde (criterium 7)', async ({ page }, info) => {
  test.skip(page.viewportSize().width > 430, 'telefoons (390 px)');
  await naar(page);
  const m = await meet(page);
  for (const k of ['p', 's']) {
    const volledig = m[k].tegels.filter(t => t.l >= -0.5 && t.r <= m.b + 0.5).length;
    expect(volledig, `${k}: twee tegels volledig in beeld`).toBe(2);
    const derde = m.b - m[k].tegels[2].l;
    expect(derde, `${k}: 25–40 px van de derde tegel`).toBeGreaterThanOrEqual(25);
    expect(derde, `${k}: 25–40 px van de derde tegel`).toBeLessThanOrEqual(40);
  }
  const volgend = m.b - m.t.tegels[1].l;
  expect(volgend, 'thema: 25–40 px van het volgende').toBeGreaterThanOrEqual(25);
  expect(volgend, 'thema: 25–40 px van het volgende').toBeLessThanOrEqual(40);
});

// 6, 7 en 14: met een muis (knoppen zichtbaar) en minder beweging (hulp.js): springt direct en snapt op de linkerrand
test('raster: knoppen schuiven één set, direct bij minder beweging, en snappen op de linkerrand (criteria 6, 7, 14)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'met een muis; breedtes worden hier zelf gezet');
  const knop = (id, r) => page.locator(`.carrousel-knop[aria-controls="${id}"][data-richting="${r}"]`);
  const eersteZichtbaar = async id => page.evaluate(id => {
    const label = document.querySelector('#in-de-box .label').getBoundingClientRect().left;
    const t = [...document.getElementById(id).querySelector('ul').children].map(e => e.getBoundingClientRect()).find(r => r.right > label + 1);
    return t.left - label;
  }, id);

  // 6: op 1440 px thema 1–4 binnen W, thema 5 in de rechterrand; na "Volgende" thema 5 op de linkerrand en "Volgende" uit
  await naar(page, 1440);
  let m = await meet(page);
  for (let i = 0; i < 4; i++) { expect(m.t.tegels[i].l).toBeGreaterThanOrEqual(m.label.l - 1); expect(m.t.tegels[i].r).toBeLessThanOrEqual(m.label.r + 1); }
  expect(m.t.tegels[4].l, 'thema 5 begint in de rechterrand').toBeGreaterThan(m.label.r);
  expect(m.t.tegels[4].l, 'thema 5 begint in beeld').toBeLessThan(m.b);
  expect(m.t.gedrag, 'minder beweging: scroll-behavior auto').toBe('auto');
  await knop('themacarrousel', 1).click();
  // 14: direct, zonder te wachten op een animatie
  expect(Math.abs(await eersteZichtbaar('themacarrousel')), 'thema 5 direct op de linkerrand').toBeLessThanOrEqual(1);
  await expect(knop('themacarrousel', 1)).toHaveAttribute('aria-disabled', 'true');
  m = await meet(page);
  expect(Math.abs(m.t.tegels[4].l - m.label.l), 'thema 5 op de linkerrand').toBeLessThanOrEqual(1);
  expect(Math.abs(m.t.tegels[7].r - m.label.r), 'thema 8 op de rechterrand (geen lege strook)').toBeLessThanOrEqual(1);

  // 6: op 768 px vier sets van twee, nooit een lege set
  await naar(page, 768);
  const snaps = await page.locator('#themacarrousel li').evaluateAll(ls => ls.map(l => getComputedStyle(l).scrollSnapAlign).filter(a => a.includes('start')).length);
  expect(snaps, '768: vier sets (snap op 1, 3, 5, 7)').toBe(4);
  let klikken = 0;
  for (; klikken < 6 && (await knop('themacarrousel', 1).getAttribute('aria-disabled')) !== 'true'; klikken++) {
    await knop('themacarrousel', 1).click();
    expect(Math.abs(await eersteZichtbaar('themacarrousel')), `768: na klik ${klikken + 1} een thema op de linkerrand`).toBeLessThanOrEqual(1);
    m = await meet(page);
    expect(m.t.tegels.filter(t => t.l >= m.label.l - 1 && t.r <= m.label.r + 1).length, `768: set ${klikken + 2} heeft twee thema's`).toBe(2);
  }
  expect(klikken, '768: drie keer "Volgende" naar de vierde set').toBe(3);

  // 7: tablet (768) en mobiel (390): na één keer "Volgende" en na Home begint de eerste zichtbare tegel van elke rij op de linkerrand
  for (const w of [768, 390]) {
    await naar(page, w);
    for (const id of ['productenrij', 'stoffenrij', 'themacarrousel']) {
      await knop(id, 1).click();
      expect(Math.abs(await eersteZichtbaar(id)), `${w}: ${id} na "Volgende" op de linkerrand`).toBeLessThanOrEqual(1);
      const stap = await page.evaluate(id => document.getElementById(id).scrollLeft, id);
      const tegel = await page.evaluate(id => { const ul = document.getElementById(id).querySelector('ul'); return ul.children[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(ul).columnGap) || 0); }, id);
      const perSet = id === 'themacarrousel' ? (w <= 760 ? 1 : 2) : (w <= 760 ? 2 : 4);
      expect(Math.round(stap / tegel), `${w}: ${id} schuift één set (${perSet})`).toBe(perSet);
      await page.locator(`#${id}`).focus();
      await page.keyboard.press('End');
      await expect.poll(() => page.evaluate(id => { const r = document.getElementById(id); return r.scrollWidth - r.clientWidth - r.scrollLeft; }, id)).toBeLessThanOrEqual(2);
      await page.keyboard.press('Home');
      await expect.poll(() => eersteZichtbaar(id), { message: `${w}: ${id} na Home op de linkerrand` }).toBeLessThanOrEqual(1);
      expect(Math.abs(await eersteZichtbaar(id))).toBeLessThanOrEqual(1);
    }
  }
});
