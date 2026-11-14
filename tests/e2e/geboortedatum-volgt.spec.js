// Brief 2026-11-14-geboortedatum-volgt (issue #69): het vakje "Geboortedatum volgt nog" bij Kraamcadeaubox, Prematuurkleding,
// Babynest en Iets op maat laten maken (niet bij Iets anders). Er gaat nooit een echte mail weg: /api/contact loopt via de
// testmodus van scripts/serveer.mjs (x-testmail, x-testmail-bevat laat de nep-verzending mislukken als de regel niet in de mail staat).
// axe met het vakje aan per onderwerp: tests/e2e/toegankelijkheid.spec.js.
import { test, expect, wachtOpRust } from './hulp.js';

const VAKJES = { Kraamcadeaubox: 'box_datum_volgt', Prematuurkleding: 'prem_datum_volgt', Babynest: 'nest_datum_volgt', 'Iets op maat laten maken': 'op_maat_datum_volgt' };
const LABEL = 'Geboortedatum volgt nog';
const UITLEG = 'Carien neemt contact met je op voordat ze de datum op het product zet.';
const REGEL = '\nGeboortedatum: volgt nog (Carien neemt eerst contact op)\n';

async function naarFormulier(page, onderwerp) {
  await page.goto('/contact#formulier');
  await wachtOpRust(page);
  await page.locator('select[name="onderwerp"]').selectOption(onderwerp);
  await page.waitForTimeout(350);
}
async function vulVerplicht(page) {
  await page.locator('textarea[name="bericht"]').fill('Graag iets voor een baby die nog komt');
  await page.locator('input[name="naam"]').fill('Test Persoon');
  await page.locator('input[name="email"]').fill('test@voorbeeld.test');
}

test('per onderwerp precies één vakje in de juiste groep, met toelichting via aria-describedby; niet bij Iets anders', async ({ page }) => {
  await page.goto('/contact#formulier');
  await wachtOpRust(page);
  expect(await page.locator('form .vakje input[type="checkbox"]').evaluateAll(es => es.map(e => e.name))).toEqual(Object.values(VAKJES));
  for (const [onderwerp, naam] of Object.entries(VAKJES)) {
    const groep = page.locator(`.groep[data-groep="${onderwerp}"]`);
    await expect(groep.locator('.vakje')).toHaveCount(1);
    const vakje = groep.locator(`input[type="checkbox"][name="${naam}"]`);
    await expect(vakje).toHaveAttribute('value', 'ja');
    await expect(vakje).not.toBeChecked();
    await expect(groep.locator('.vakje')).toHaveText(LABEL);
    await page.locator('select[name="onderwerp"]').selectOption(onderwerp);
    await page.waitForTimeout(350);
    // naam en beschrijving tellen pas als de groep te zien is (een verborgen groep heeft geen toegankelijke naam)
    await expect(vakje).toHaveAccessibleName(LABEL);
    await expect(vakje).toHaveAccessibleDescription(UITLEG);
    await expect(groep.locator('.vakje')).toBeVisible();
    await expect(groep.locator('.vakje-uitleg')).toBeVisible();
    // alleen het vakje van dit onderwerp is te zien
    expect(await page.locator('form .vakje').evaluateAll(es => es.filter(e => e.offsetParent !== null).length)).toBe(1);
  }
  await page.locator('select[name="onderwerp"]').selectOption('Iets anders');
  await page.waitForTimeout(350);
  expect(await page.locator('form .vakje').evaluateAll(es => es.filter(e => e.offsetParent !== null).length)).toBe(0);
});

test('opmaak: tikdoel minstens 44 px, 16 px in inkt, vakje 24 px, toelichting gelijk met de labeltekst, niets breder dan het scherm', async ({ page }) => {
  for (const [onderwerp, naam] of Object.entries(VAKJES)) {
    await naarFormulier(page, onderwerp);
    const m = await page.locator(`input[name="${naam}"]`).evaluate(i => {
      const l = i.closest('label'), r = l.getBoundingClientRect(), v = i.closest('.vakje-vak').getBoundingClientRect(), t = i.getBoundingClientRect();
      const tekst = l.querySelector('.vakje-tekst'), uitleg = document.getElementById(i.getAttribute('aria-describedby'));
      const cs = getComputedStyle(tekst), cu = getComputedStyle(uitleg);
      return { h: r.height, b: r.width, vak: [v.width, v.height], tik: [t.width, t.height], midden: Math.abs((t.left + t.width / 2) - (v.left + v.width / 2)) + Math.abs((t.top + t.height / 2) - (v.top + v.height / 2)), grootte: [parseFloat(cs.fontSize), parseFloat(cu.fontSize)], kleur: [cs.color, cu.color],
        gewicht: cs.fontWeight, kapitalen: cs.textTransform, links: [tekst.getBoundingClientRect().left, uitleg.getBoundingClientRect().left + parseFloat(cu.paddingLeft)],
        breed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
    });
    expect(m.h, `${onderwerp}: label minstens 44 px hoog`).toBeGreaterThanOrEqual(44);
    expect(m.b, `${onderwerp}: label minstens 44 px breed`).toBeGreaterThanOrEqual(44);
    expect(m.tik[0] >= 44 && m.tik[1] >= 44, `${onderwerp}: het vakje zelf is een tikdoel van 44 × 44 px (${m.tik})`).toBe(true);
    expect(m.midden, `${onderwerp}: tikvlak midden op het zichtbare vak`).toBeLessThanOrEqual(1);
    expect(Math.abs(m.vak[0] - 24) <= 1 && Math.abs(m.vak[1] - 24) <= 1, `${onderwerp}: vakje 24 × 24 px (${m.vak})`).toBe(true);
    expect(m.grootte, `${onderwerp}: label en toelichting 16 px`).toEqual([16, 16]);
    expect(m.kleur, `${onderwerp}: inkt`).toEqual(['rgb(32, 32, 32)', 'rgb(32, 32, 32)']);
    expect(m.gewicht, `${onderwerp}: gewicht 400`).toBe('400');
    expect(m.kapitalen, `${onderwerp}: geen kapitalen`).toBe('none');
    expect(Math.abs(m.links[0] - m.links[1]), `${onderwerp}: toelichting gelijk met de labeltekst`).toBeLessThanOrEqual(2);
    expect(m.breed, `${onderwerp}: niets scrolt horizontaal`).toBe(false);
  }
});

test('Kraamcadeaubox: vakje direct onder het datumveld, datumveld blijft gelijk en invulbaar; klik op de tekst zet het aan en uit', async ({ page }, info) => {
  await naarFormulier(page, 'Kraamcadeaubox');
  const datum = page.locator('input[name="box_datum"]');
  const vakje = page.locator('input[name="box_datum_volgt"]');
  const plek = await vakje.evaluate(i => {
    const d = document.querySelector('input[name="box_datum"]').getBoundingClientRect(), l = i.closest('label').getBoundingClientRect();
    const maat = document.querySelector('select[name="box_maat"]').getBoundingClientRect();
    return { links: Math.abs(l.left - d.left), afstand: l.top - d.bottom, boven: l.bottom <= maat.top };
  });
  expect(plek.links, 'linkerrand gelijk met het datumveld').toBeLessThanOrEqual(1);
  expect(plek.boven, 'boven de kledingmaat').toBe(true);
  if (info.project.name !== 'mobiel') {
    expect(plek.afstand, '12–24 px onder het datumveld').toBeGreaterThanOrEqual(12);
    expect(plek.afstand).toBeLessThanOrEqual(24);
  } else expect(plek.afstand, 'direct onder het datumveld').toBeGreaterThanOrEqual(0);
  const stijl = () => datum.evaluate(d => { const c = getComputedStyle(d); return [c.opacity, c.color, c.backgroundColor, d.disabled, d.readOnly, d.closest('label').textContent.trim()]; });
  const voor = await stijl();
  await page.locator('.groep[data-groep="Kraamcadeaubox"] .vakje-tekst').click();
  await expect(vakje).toBeChecked();
  expect(await stijl(), 'datumveld ziet er met vinkje hetzelfde uit').toEqual(voor);
  await datum.fill('uitgerekend 3 maart');
  await expect(datum).toHaveValue('uitgerekend 3 maart');
  await page.locator('.groep[data-groep="Kraamcadeaubox"] .vakje-tekst').click();
  await expect(vakje).not.toBeChecked();
});

test('toetsenbord: Tab na het datumveld bereikt het vakje, spatie zet het aan en uit, zichtbare focusrand', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'toetsenbord met een muis/toetsenbord-scherm');
  await naarFormulier(page, 'Kraamcadeaubox');
  await page.locator('input[name="box_datum"]').focus();
  await page.keyboard.press('Tab');
  const vakje = page.locator('input[name="box_datum_volgt"]');
  await expect(vakje).toBeFocused();
  // focusrand: 2 px inkt, 3 px om het zichtbare vak van 24 px (het tikvlak is 44 px, dus outline-offset −7 px)
  const rand = await vakje.evaluate(i => { const c = getComputedStyle(i), t = i.getBoundingClientRect(), v = i.closest('.vakje-vak').getBoundingClientRect();
    return [c.outlineStyle, c.outlineWidth, c.outlineColor, (v.left - (t.left - parseFloat(c.outlineOffset))) ]; });
  expect(rand.slice(0, 3)).toEqual(['solid', '2px', 'rgb(32, 32, 32)']);
  expect(rand[3], 'afstand tussen vak en focusrand').toBe(3);
  await page.keyboard.press('Space');
  await expect(vakje).toBeChecked();
  await page.keyboard.press('Space');
  await expect(vakje).not.toBeChecked();
  // de andere drie: het vakje komt direct na het laatste veld van de groep
  for (const [onderwerp, laatste, naam] of [['Prematuurkleding', 'prem_naam', 'prem_datum_volgt'], ['Babynest', 'nest_naam', 'nest_datum_volgt'], ['Iets op maat laten maken', 'op_maat', 'op_maat_datum_volgt']]) {
    await page.locator('select[name="onderwerp"]').selectOption(onderwerp);
    await page.waitForTimeout(350);
    await page.locator(`[name="${laatste}"]`).focus();
    await page.keyboard.press('Tab');
    await expect(page.locator(`input[name="${naam}"]`), `${onderwerp}: Tab na ${laatste}`).toBeFocused();
  }
});

test('toelichting: hooguit twee regels (box en mobiel), één regel in een volle rij op 1440 px; Babynest op 390 px hooguit 120 px hoger', async ({ page }, info) => {
  for (const [onderwerp, naam] of Object.entries(VAKJES)) {
    await naarFormulier(page, onderwerp);
    const regels = await page.locator(`input[name="${naam}"]`).evaluate(i => { const u = document.getElementById(i.getAttribute('aria-describedby'));
      return Math.round(u.getBoundingClientRect().height / parseFloat(getComputedStyle(u).lineHeight)); });
    const max = info.project.name === 'desktop' && onderwerp !== 'Kraamcadeaubox' ? 1 : 2;
    expect(regels, `${onderwerp}: toelichting over ${regels} regels`).toBeLessThanOrEqual(max);
  }
  if (info.project.name === 'mobiel') {
    await naarFormulier(page, 'Babynest');
    const h = await page.locator('.groep[data-groep="Babynest"]').evaluate(g => g.getBoundingClientRect().height);
    expect(h, 'groep Babynest (was 225 px)').toBeLessThanOrEqual(345);
  }
});

test('Prematuurkleding, Babynest en Iets op maat: het vakje is het laatste element van de groep, aan de linkerrand', async ({ page }) => {
  for (const onderwerp of ['Prematuurkleding', 'Babynest', 'Iets op maat laten maken']) {
    await naarFormulier(page, onderwerp);
    const m = await page.locator(`.groep[data-groep="${onderwerp}"]`).evaluate(g => {
      const zichtbaar = [...g.children].filter(e => e.tagName !== 'LEGEND' && e.offsetParent !== null);
      const laatste = zichtbaar[zichtbaar.length - 1];
      return { laatste: laatste.classList.contains('datum-volgt'), links: Math.abs(laatste.querySelector('.vakje').getBoundingClientRect().left - g.getBoundingClientRect().left) };
    });
    expect(m.laatste, `${onderwerp}: vakje als laatste`).toBe(true);
    expect(m.links, `${onderwerp}: linkerrand van de groep`).toBeLessThanOrEqual(1);
  }
});

test('versturen met het vakje aan zet de regel in de mail, bij elk onderwerp', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent(REGEL) });
  for (const [onderwerp, naam] of Object.entries(VAKJES)) {
    await naarFormulier(page, onderwerp);
    await page.locator(`input[name="${naam}"]`).check();
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page, onderwerp).toHaveURL(/\/bedankt$/);
  }
});

test('zonder vakje gaat de regel niet mee (de nep-verzending mislukt als de regel ontbreekt)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent(REGEL) });
  await naarFormulier(page, 'Babynest');
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Je bericht is niet verstuurd.');
});

test('versturen mislukt: de stand van het vakje blijft staan', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'fout' });
  await naarFormulier(page, 'Prematuurkleding');
  await page.locator('input[name="prem_datum_volgt"]').check();
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await expect(page.locator('input[name="prem_datum_volgt"]')).toBeChecked();
  await expect(page.locator('select[name="onderwerp"]')).toHaveValue('Prematuurkleding');
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('het vakje is te zien en aan te vinken; versturen zet de regel in de mail', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone', 'Chromium-schermen');
    await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent(REGEL) });
    await page.goto('/contact#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Babynest');
    const vakje = page.locator('input[name="nest_datum_volgt"]');
    await expect(page.locator('.groep[data-groep="Babynest"] .vakje')).toBeVisible();
    await page.locator('.groep[data-groep="Babynest"] .vakje-tekst').click();
    await expect(vakje).toBeChecked();
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
  });
});

// Ontwerpgate ronde 1: in geforceerde kleuren (Windows hoog contrast) vallen achtergrondafbeeldingen weg. Het vak is daarom een
// echte rand op .vakje-vak; hier moet die rand blijven staan en in beeld afsteken tegen het vlak, aangevinkt en niet aangevinkt.
test.describe('geforceerde kleuren (hoog contrast)', () => {
  test('het vak heeft een zichtbare rand en de vink blijft te zien, aangevinkt en niet aangevinkt', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'forcedColors-emulatie alleen in Chromium');
    await page.emulateMedia({ forcedColors: 'active' });
    for (const [onderwerp, naam] of Object.entries(VAKJES)) {
      await naarFormulier(page, onderwerp);
      expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
      const input = page.locator(`input[name="${naam}"]`);
      const vak = page.locator(`.vakje-vak:has(input[name="${naam}"])`);
      for (const aan of [false, true]) {
        if (aan) await input.check(); else await expect(input).not.toBeChecked();
        const s = await vak.evaluate(v => {
          const c = getComputedStyle(v), vink = getComputedStyle(v.querySelector('.keuze-vink'));
          return { breedte: ['Top', 'Right', 'Bottom', 'Left'].map(k => parseFloat(c[`border${k}Width`])), stijl: c.borderTopStyle, rand: c.borderTopColor, vlak: c.backgroundColor, vinkKleur: vink.color, vinkZicht: parseFloat(vink.opacity) };
        });
        for (const b of s.breedte) expect(b, `${onderwerp}: randbreedte`).toBeGreaterThanOrEqual(1);
        expect(s.stijl).toBe('solid');
        expect(s.rand, `${onderwerp}: rand steekt af tegen het vlak`).not.toBe(s.vlak);
        expect(s.vinkKleur).toBe(s.rand);
        expect(s.vinkZicht).toBe(aan ? 1 : 0);
        // in beeld: de randpixels verschillen duidelijk van het midden van het vak (aangevinkt: ook de vink zelf)
        const png = (await vak.screenshot({ animations: 'disabled' })).toString('base64');
        const contrast = await page.evaluate(async b64 => {
          const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
          const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
          const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
          const px = (x, y) => cx.getImageData(x, y, 1, 1).data;
          const helder = p => (p[0] + p[1] + p[2]) / 3;
          const w = img.width, h = img.height, mx = Math.round(w / 2), my = Math.round(h / 2);
          const midden = helder(px(Math.round(w * 0.15), Math.round(h * 0.15)));
          // per zijde de sterkste afwijking in de buitenste drie pixels (het vak valt niet altijd op hele pixels)
          const zijde = punten => Math.max(...punten.map(([x, y]) => Math.abs(helder(px(x, y)) - midden)));
          const randen = [zijde([[0, my], [1, my], [2, my]]), zijde([[w - 1, my], [w - 2, my], [w - 3, my]]), zijde([[mx, 0], [mx, 1], [mx, 2]]), zijde([[mx, h - 1], [mx, h - 2], [mx, h - 3]])];
          let donkersteVink = midden;
          for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) { const v = Math.abs(helder(px(x, y)) - midden); if (v > Math.abs(donkersteVink - midden)) donkersteVink = helder(px(x, y)); }
          return { rand: Math.min(...randen), vink: Math.abs(donkersteVink - midden) };
        }, png);
        expect(contrast.rand, `${onderwerp}${aan ? ' (aan)' : ''}: rand zichtbaar in beeld`).toBeGreaterThan(100);
        if (aan) expect(contrast.vink, `${onderwerp}: vink zichtbaar in beeld`).toBeGreaterThan(100);
      }
    }
  });
});
