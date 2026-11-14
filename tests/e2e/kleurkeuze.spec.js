// Brief 2026-11-14-kleurkeuze: hoofdkleur en tweede kleur met kleurstalen bij Prematuurkleding, Babynest en Iets op maat laten maken
// (niet bij Kraamcadeaubox of Iets anders). Er gaat nooit een echte mail weg: /api/contact loopt via de testmodus van
// scripts/serveer.mjs (x-testmail; x-testmail-bevat laat de nep-verzending mislukken als de regel niet in de mail staat).
// axe met elk onderwerp en Tweede kleur zichtbaar: tests/e2e/toegankelijkheid.spec.js.
import { test, expect, wachtOpRust } from './hulp.js';

const PREFIX = { Prematuurkleding: 'prem', Babynest: 'nest', 'Iets op maat laten maken': 'op' };
const NAMEN = ['Weet ik nog niet', 'Naturel/wit', 'Oud roze', 'Bordeaux', 'Roest', 'Oker', 'Salie', 'Olijfgroen', 'Lichtblauw', 'Grijs', 'Anders'];
const WAARDEN = ['', 'Naturel/wit', 'Oud roze', 'Bordeaux', 'Roest', 'Oker', 'Salie', 'Olijfgroen', 'Lichtblauw', 'Grijs', 'anders'];
const HEX = { 'Naturel/wit': 'rgb(238, 232, 223)', 'Oud roze': 'rgb(196, 147, 156)', Bordeaux: 'rgb(122, 40, 48)', Roest: 'rgb(165, 79, 51)', Oker: 'rgb(194, 144, 67)',
  Salie: 'rgb(157, 168, 143)', Olijfgroen: 'rgb(100, 101, 80)', Lichtblauw: 'rgb(168, 188, 198)', Grijs: 'rgb(187, 186, 183)' };
const UITLEG = 'De kleuren zijn een indicatie. De echte stof kan iets afwijken.';

async function naarFormulier(page, onderwerp) {
  await page.goto('/contact#formulier');
  await wachtOpRust(page);
  await page.locator('select[name="onderwerp"]').selectOption(onderwerp);
  await page.waitForTimeout(350);
}
async function vulVerplicht(page) {
  await page.locator('textarea[name="bericht"]').fill('Graag iets in deze kleuren');
  await page.locator('input[name="naam"]').fill('Test Persoon');
  await page.locator('input[name="email"]').fill('test@voorbeeld.test');
}
const kaart = (page, onderwerp, soort, waarde) => page.locator(`.groep[data-groep="${onderwerp}"] .kleur-${soort} .kleur-kaart:has(input[value="${waarde}"])`);
const zichtbaar = (loc) => loc.evaluate(e => e.offsetParent !== null || getComputedStyle(e).display !== 'none' && e.getClientRects().length > 0);

test('kleurkeuzes alleen bij Prematuurkleding, Babynest en Iets op maat; opties, waarden, namen en standaard', async ({ page }) => {
  await page.goto('/contact#formulier');
  await wachtOpRust(page);
  await expect(page.locator('.groep[data-groep="Kraamcadeaubox"] .kleurkeuze')).toHaveCount(0);
  await expect(page.locator('form .kleurkeuze')).toHaveCount(6);
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    const groep = page.locator(`.groep[data-groep="${onderwerp}"]`);
    await expect(groep.locator('.kleurkeuze')).toHaveCount(2);
    await expect(groep.locator('.kleur-hoofd > legend')).toHaveText('Hoofdkleur');
    await expect(groep.locator('.kleur-tweede > legend')).toHaveText('Tweede kleur');
    expect(await groep.locator(`.kleur-hoofd input[name="${p}_kleur"]`).evaluateAll(es => es.map(e => e.value))).toEqual(WAARDEN);
    expect(await groep.locator(`.kleur-tweede input[name="${p}_kleur2"]`).evaluateAll(es => es.map(e => e.value))).toEqual(['', 'Geen', ...WAARDEN.slice(1)]);
    expect(await groep.locator('.kleur-hoofd .kleur-naam').evaluateAll(es => es.map(e => e.textContent.replace(/­/g, '')))).toEqual(NAMEN);
    await expect(groep.locator(`input[name="${p}_kleur"][value=""]`)).toBeChecked();
    await expect(groep.locator(`input[name="${p}_kleur2"][value=""]`)).toBeChecked();
    for (const veld of [`${p}_kleur_anders`, `${p}_kleur2_anders`]) {
      const v = groep.locator(`input[name="${veld}"]`);
      await expect(v).toHaveAttribute('maxlength', '80');
      await expect(v).toHaveAttribute('autocomplete', 'off');
    }
    // alle kleurvelden optioneel, staal decoratief, de indicatiezin één keer en beide fieldsets verwijzen ernaar
    await expect(groep.locator('.kleurkeuze [required]')).toHaveCount(0);
    expect(await groep.locator('.kleur-staal').evaluateAll(es => es.every(e => e.getAttribute('aria-hidden') === 'true'))).toBe(true);
    await expect(groep.locator('.kleur-uitleg')).toHaveCount(1);
    await expect(groep.locator('.kleur-uitleg')).toHaveText(UITLEG);
    const id = await groep.locator('.kleur-uitleg').getAttribute('id');
    expect(id).toBe(`${p}-kleur-uitleg`);
    for (const fs of ['.kleur-hoofd', '.kleur-tweede']) await expect(groep.locator(fs)).toHaveAttribute('aria-describedby', id);
  }
  // het label "Stof" (was "Stof of kleur"); een naam telt pas als de groep te zien is
  await page.locator('select[name="onderwerp"]').selectOption('Babynest');
  await expect(page.locator('input[name="nest_stof"]')).toHaveAccessibleName('Stof');
});

test('volgorde: bestaande velden, Hoofdkleur, Tweede kleur, het vakje als laatste; kolommen, stalen, kaarten en namen', async ({ page }, info) => {
  const kolommen = { desktop: 4, tablet: 3, mobiel: 2, iphone: 2 }[info.project.name];
  const staal = info.project.name === 'desktop' ? 32 : 28;
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    await naarFormulier(page, onderwerp);
    await kaart(page, onderwerp, 'hoofd', 'Salie').click();
    await page.waitForTimeout(350);
    const m = await page.locator(`.groep[data-groep="${onderwerp}"]`).evaluate((g) => {
      const kinderen = [...g.children].filter(e => e.tagName !== 'LEGEND' && e.offsetParent !== null);
      const plek = (sel) => kinderen.findIndex(e => e.matches(sel));
      const kaarten = [...g.querySelectorAll('.kleurkeuze .kleur-kaart')];
      return {
        volgorde: [plek('.kleur-hoofd'), plek('.kleur-tweede'), plek('.datum-volgt'), kinderen.length],
        kolommen: ['.kleur-hoofd', '.kleur-tweede'].map(s => new Set([...g.querySelectorAll(`${s} .kleur-kaart`)].map(k => Math.round(k.getBoundingClientRect().left))).size),
        kaarten: kaarten.map(k => { const r = k.getBoundingClientRect(); return [r.width, r.height]; }),
        stalen: [...g.querySelectorAll('.kleur-staal')].map(s => { const c = getComputedStyle(s); return [s.getBoundingClientRect().width, s.getBoundingClientRect().height, c.borderTopLeftRadius, c.borderTopWidth, c.borderTopColor, c.backgroundColor, s.className]; }),
        namen: kaarten.map(k => { const n = k.querySelector('.kleur-naam'), c = getComputedStyle(n); return [n.textContent, n.scrollWidth <= n.clientWidth + 0.5 && n.getBoundingClientRect().right <= k.getBoundingClientRect().right + 0.5, c.fontSize, c.color]; }),
        uitleg: (() => { const u = g.querySelector('.kleur-uitleg'), c = getComputedStyle(u); return [c.fontSize, c.color]; })(),
        breed: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    const [hoofd, tweede, datum, aantal] = m.volgorde;
    expect(hoofd, `${onderwerp}: Hoofdkleur na de bestaande velden`).toBeGreaterThan(0);
    expect(tweede, `${onderwerp}: Tweede kleur direct na Hoofdkleur`).toBe(hoofd + 1);
    expect(datum, `${onderwerp}: het vakje direct na Tweede kleur, als laatste`).toBe(tweede + 1);
    expect(datum).toBe(aantal - 1);
    expect(m.kolommen, `${onderwerp}: ${kolommen} kolommen`).toEqual([kolommen, kolommen]);
    for (const [b, h] of m.kaarten) expect(b >= 44 && h >= 44, `${onderwerp}: kaart ${b} × ${h} px`).toBe(true);
    for (const [b, h, rond, rand, randkleur, kleur, klasse] of m.stalen) {
      expect([Math.round(b), Math.round(h)], `${onderwerp}: staal ${klasse}`).toEqual([staal, staal]);
      expect(rond).toBe('50%');
      expect(rand).toBe('1px');
      expect(randkleur).toBe('rgba(32, 32, 32, 0.6)');
      void kleur;
    }
    // de achtergrondkleur is precies de hex uit de kleurtabel
    const kleuren = Object.fromEntries(m.namen.map((n, i) => [n[0].replace(/­/g, ''), m.stalen[i][5]]));
    for (const [naam, rgb] of Object.entries(HEX)) expect(kleuren[naam], `${onderwerp}: ${naam}`).toBe(rgb);
    for (const [naam, heel, grootte, kleur] of m.namen) {
      expect(heel, `${onderwerp}: "${naam}" volledig leesbaar`).toBe(true);
      expect([grootte, kleur]).toEqual(['16px', 'rgb(32, 32, 32)']);
    }
    expect(m.uitleg).toEqual(['16px', 'rgb(32, 32, 32)']);
    expect(m.breed, `${onderwerp}: niets scrolt horizontaal`).toBe(false);
  }
});

test('Tweede kleur verschijnt na een hoofdkleur en verdwijnt weer bij "Weet ik nog niet"', async ({ page }) => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    await naarFormulier(page, onderwerp);
    const tweede = page.locator(`.groep[data-groep="${onderwerp}"] .kleur-tweede`);
    await expect(tweede).toBeHidden();
    await kaart(page, onderwerp, 'hoofd', 'Bordeaux').click();
    await expect(tweede).toBeVisible();
    await expect(page.locator(`input[name="${p}_kleur2"][value=""]`)).toBeChecked();
    await kaart(page, onderwerp, 'hoofd', '').click();
    await expect(tweede).toBeHidden();
    await kaart(page, onderwerp, 'hoofd', 'anders').click();
    await expect(tweede).toBeVisible();
  }
});

test('"Andere kleur" alleen bij Anders in de eigen fieldset', async ({ page }) => {
  for (const [onderwerp, p] of Object.entries(PREFIX)) {
    await naarFormulier(page, onderwerp);
    const vrijHoofd = page.locator(`input[name="${p}_kleur_anders"]`), vrijTweede = page.locator(`input[name="${p}_kleur2_anders"]`);
    await expect(vrijHoofd).toBeHidden();
    await kaart(page, onderwerp, 'hoofd', 'anders').click();
    await expect(vrijHoofd).toBeVisible();
    await expect(vrijHoofd).toHaveAccessibleName('Andere kleur');
    await expect(vrijTweede, `${onderwerp}: Anders bij Hoofdkleur opent het veld van Tweede kleur niet`).toBeHidden();
    await kaart(page, onderwerp, 'tweede', 'anders').click();
    await expect(vrijTweede).toBeVisible();
    await kaart(page, onderwerp, 'hoofd', 'Salie').click();
    await expect(vrijHoofd, `${onderwerp}: weer weg na een vaste kleur`).toBeHidden();
    await expect(vrijTweede, `${onderwerp}: Tweede kleur houdt zijn eigen veld`).toBeVisible();
    await kaart(page, onderwerp, 'tweede', 'Geen').click();
    await expect(vrijTweede).toBeHidden();
  }
});

test('gekozen kaart: rand 1 px inkt en de vink op het staal, op alle 12 stalen', async ({ page }) => {
  await naarFormulier(page, 'Prematuurkleding');
  await kaart(page, 'Prematuurkleding', 'hoofd', 'Salie').click();
  for (const waarde of ['', 'Geen', ...WAARDEN.slice(1)]) {
    const k = kaart(page, 'Prematuurkleding', 'tweede', waarde);
    await k.click();
    const s = await k.evaluate(el => {
      const rand = getComputedStyle(el.querySelector('.keuze-rand')), vink = el.querySelector('.keuze-vink'), cv = getComputedStyle(vink);
      const v = vink.getBoundingClientRect(), st = el.querySelector('.kleur-staal').getBoundingClientRect();
      return { rand: [rand.borderTopWidth, rand.borderTopColor], vink: [cv.opacity, cv.backgroundColor, cv.color, Math.round(v.width)],
        midden: Math.abs((v.left + v.width / 2) - (st.left + st.width / 2)) + Math.abs((v.top + v.height / 2) - (st.top + st.height / 2)) };
    });
    expect(s.rand, `"${waarde}": kaartrand`).toEqual(['1px', 'rgb(32, 32, 32)']);
    expect(s.vink, `"${waarde}": wit rondje van 20 px met een inktvink`).toEqual(['1', 'rgb(255, 255, 255)', 'rgb(32, 32, 32)', 20]);
    expect(s.midden, `"${waarde}": vink midden op het staal`).toBeLessThanOrEqual(1);
  }
  // een niet-gekozen kaart heeft geen inktrand en geen vink
  const niet = await kaart(page, 'Prematuurkleding', 'tweede', 'Oker').evaluate(el => [getComputedStyle(el.querySelector('.keuze-rand')).borderTopColor, getComputedStyle(el.querySelector('.keuze-vink')).opacity]);
  expect(niet[1]).toBe('0');
  expect(niet[0]).not.toBe('rgb(32, 32, 32)');
});

test('toetsenbord: Tab per fieldset naar één keuze, pijltjes kiezen, zichtbare focus', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'toetsenbord met een muis/toetsenbord-scherm');
  await naarFormulier(page, 'Prematuurkleding');
  await page.locator('input[name="prem_naam"]').focus();
  await page.keyboard.press('Tab');
  const weet = page.locator('input[name="prem_kleur"][value=""]');
  await expect(weet).toBeFocused();
  const rand = await weet.evaluate(i => { const c = getComputedStyle(i.parentElement.querySelector('.keuze-rand')); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.outlineOffset]; });
  expect(rand).toEqual(['solid', '2px', 'rgb(32, 32, 32)', '3px']);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('input[name="prem_kleur"][value="Naturel/wit"]')).toBeFocused();
  await expect(page.locator('input[name="prem_kleur"][value="Naturel/wit"]')).toBeChecked();
  // Tweede kleur is nu te zien: Tab gaat naar de gekozen keuze daar, daarna naar het vakje
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="prem_kleur2"][value=""]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="prem_datum_volgt"]')).toBeFocused();
});

test('versturen: "Hoofdkleur: Salie" in de mail, bij elk onderwerp', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent('\nHoofdkleur: Salie\n') });
  for (const onderwerp of Object.keys(PREFIX)) {
    await naarFormulier(page, onderwerp);
    await kaart(page, onderwerp, 'hoofd', 'Salie').click();
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page, onderwerp).toHaveURL(/\/bedankt$/);
  }
});

test('versturen: "Tweede kleur: Oud roze" en "Tweede kleur: Geen" in de mail', async ({ page }) => {
  for (const [waarde, regel] of [['Oud roze', 'Tweede kleur: Oud roze'], ['Geen', 'Tweede kleur: Geen']]) {
    await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent(`\n${regel}\n`) });
    await naarFormulier(page, 'Babynest');
    await kaart(page, 'Babynest', 'hoofd', 'Olijfgroen').click();
    await kaart(page, 'Babynest', 'tweede', waarde).click();
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page, regel).toHaveURL(/\/bedankt$/);
  }
});

test('versturen: "Anders" geeft "Hoofdkleur anders: …" en "Tweede kleur anders: …"', async ({ page }) => {
  for (const [soort, kop] of [['hoofd', 'Hoofdkleur anders'], ['tweede', 'Tweede kleur anders']]) {
    await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent(`\n${kop}: petrol\n`) });
    await naarFormulier(page, 'Iets op maat laten maken');
    if (soort === 'tweede') await kaart(page, 'Iets op maat laten maken', 'hoofd', 'Grijs').click();
    await kaart(page, 'Iets op maat laten maken', soort, 'anders').click();
    await page.locator(`input[name="${soort === 'hoofd' ? 'op_kleur_anders' : 'op_kleur2_anders'}"]`).fill('petrol');
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page, kop).toHaveURL(/\/bedankt$/);
  }
});

test('een kleur bij Prematuurkleding gaat niet mee als het onderwerp daarna Kraamcadeaubox is', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent('Hoofdkleur') });
  await naarFormulier(page, 'Prematuurkleding');
  await kaart(page, 'Prematuurkleding', 'hoofd', 'Salie').click();
  await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  // de regel ontbreekt in de mail, dus de nep-verzending mislukt
  await expect(page.locator('.formulier .melding.fout')).toContainText('Je bericht is niet verstuurd.');
});

test('vooraf invullen via ?onderwerp= laat de kleurkeuzes op "Weet ik nog niet"', async ({ page }) => {
  for (const [sleutel, onderwerp, p] of [['prematuurkleding', 'Prematuurkleding', 'prem'], ['babynest', 'Babynest', 'nest']]) {
    await page.goto(`/contact?onderwerp=${sleutel}#formulier`);
    await wachtOpRust(page);
    await expect(page.locator('select[name="onderwerp"]')).toHaveValue(onderwerp);
    await expect(page.locator(`input[name="${p}_kleur"][value=""]`)).toBeChecked();
    await expect(page.locator(`.groep[data-groep="${onderwerp}"] .kleur-hoofd`)).toBeVisible();
    await expect(page.locator(`.groep[data-groep="${onderwerp}"] .kleur-tweede`)).toBeHidden();
  }
});

test('versturen mislukt: de gekozen kleuren blijven staan', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'fout' });
  await naarFormulier(page, 'Prematuurkleding');
  await kaart(page, 'Prematuurkleding', 'hoofd', 'Roest').click();
  await kaart(page, 'Prematuurkleding', 'tweede', 'Lichtblauw').click();
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await expect(page.locator('input[name="prem_kleur"][value="Roest"]')).toBeChecked();
  await expect(page.locator('input[name="prem_kleur2"][value="Lichtblauw"]')).toBeChecked();
});

test('op 390 px: kleurblok bij Prematuurkleding hooguit 460 px; op 320 px elke naam heel en niets scrolt horizontaal', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'telefoonmaten');
  await naarFormulier(page, 'Prematuurkleding');
  const h = await page.locator('.groep[data-groep="Prematuurkleding"] .kleur-hoofd').evaluate(f => {
    const l = f.querySelector('legend').getBoundingClientRect(), k = [...f.querySelectorAll('.kleur-kaart')].at(-1).getBoundingClientRect();
    return k.bottom - l.top;
  });
  expect(h, 'van legend Hoofdkleur tot en met de laatste kaart').toBeLessThanOrEqual(460);
  await page.setViewportSize({ width: 320, height: 640 });
  await page.waitForTimeout(200);
  await kaart(page, 'Prematuurkleding', 'hoofd', 'Salie').click();
  const m = await page.evaluate(() => ({
    namen: [...document.querySelectorAll('.groep[data-groep="Prematuurkleding"] .kleur-kaart')].filter(k => { const n = k.querySelector('.kleur-naam');
      return n.scrollWidth > n.clientWidth + 0.5 || n.getBoundingClientRect().right > k.getBoundingClientRect().right + 0.5; }).map(k => k.textContent),
    breed: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    klein: [...document.querySelectorAll('.groep[data-groep="Prematuurkleding"] .kleur-kaart')].filter(k => k.getBoundingClientRect().height < 44 || k.getBoundingClientRect().width < 44).length,
  }));
  expect(m.namen, 'afgekapte namen op 320 px').toEqual([]);
  expect(m.breed).toBe(false);
  expect(m.klein).toBe(0);
});

test('minder beweging: geen overgang of animatie op kaarten en op Tweede kleur', async ({ page }) => {
  await naarFormulier(page, 'Babynest');
  await kaart(page, 'Babynest', 'hoofd', 'Oker').click();
  await kaart(page, 'Babynest', 'tweede', 'anders').click();
  const s = await page.locator('.groep[data-groep="Babynest"]').evaluate(g => [...g.querySelectorAll('.kleurkeuze, .kleurkeuze *')]
    .map(e => getComputedStyle(e)).filter(c => c.animationName !== 'none' || (c.transitionDuration.split(',').some(d => parseFloat(d) > 0) && c.transitionProperty !== 'none')).length);
  expect(s).toBe(0);
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('kiezen, "Andere kleur" via :has en versturen zet de regels in de mail', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone', 'Chromium-schermen');
    await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent('\nHoofdkleur: Bordeaux\nTweede kleur anders: goud\n') });
    await page.goto('/contact#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Prematuurkleding');
    await expect(page.locator('.groep[data-groep="Prematuurkleding"] .kleur-tweede')).toBeHidden();
    await kaart(page, 'Prematuurkleding', 'hoofd', 'Bordeaux').click();
    await expect(page.locator('.groep[data-groep="Prematuurkleding"] .kleur-tweede')).toBeVisible();
    await kaart(page, 'Prematuurkleding', 'tweede', 'anders').click();
    await expect(page.locator('input[name="prem_kleur2_anders"]')).toBeVisible();
    await page.locator('input[name="prem_kleur2_anders"]').fill('goud');
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
  });
});

test.describe('geforceerde kleuren (hoog contrast)', () => {
  test('elk staal houdt zijn kleur en de rand is CanvasText', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'forcedColors-emulatie alleen in Chromium');
    await page.emulateMedia({ forcedColors: 'active' });
    await naarFormulier(page, 'Prematuurkleding');
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    const s = await page.locator('.groep[data-groep="Prematuurkleding"] .kleur-hoofd').evaluate(f => {
      const t = document.createElement('span'); t.style.color = 'CanvasText'; document.body.appendChild(t); const canvasText = getComputedStyle(t).color; t.remove();
      return { canvasText, stalen: [...f.querySelectorAll('.kleur-kaart')].map(k => { const c = getComputedStyle(k.querySelector('.kleur-staal')); return [k.textContent.replace(/­/g, ''), c.backgroundColor, c.borderTopColor, c.forcedColorAdjust]; }) };
    });
    for (const [naam, kleur, rand, aanpassen] of s.stalen) {
      expect(aanpassen, naam).toBe('none');
      expect(rand, `${naam}: rand`).toBe(s.canvasText);
      if (HEX[naam]) expect(kleur, `${naam}: kleur blijft`).toBe(HEX[naam]);
    }
  });
});
