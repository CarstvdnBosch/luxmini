// Brief 2026-11-14-contact-ruimte-en-kleur, blokkerend.
// Contact: geen lege strook tussen 001 (gegevens) en 002 (formulier), en de kleurlaag wisselt bij 002 al op 60 %
// van de schermhoogte (data-laag-lijn="0.6"), zodat je de overgang naar terracotta ziet terwijl de gegevens nog in beeld zijn.
// De balk volgt de laag: wit logo op de terracotta laag, donker logo op de witte laag. Andere pagina's houden 0,88 / 0,5.
import { test, expect, wachtOpRust } from './hulp.js';

const TERRACOTTA = 'rgb(188, 133, 101)';
const WIT = 'rgb(255, 255, 255)';
// criterium 3: afstand laatste tekstregel 001 → letters "002 —" per schermbreedte (± 12 px), zoals de ontwerper die opgaf.
// De ontwerper mat op main 478 / 396 / 248 / 374 / 149 px; met de meting hieronder (onderkant van het laatste tekstblok →
// bovenkant van de letters "002 —") is dat op dezelfde code 448 / 365 / 217 / 343 / 118 px: overal precies 31 px minder.
// Die vaste meetverschuiving trekken we af; de marge van ± 12 px blijft gelijk (niet losser).
const AFSTAND = { 1440: 162, 1280: 150, 1024: 133, 768: 117, 390: 101 };
const MEETVERSCHIL = 31;

const laagKleur = page => page.locator('.achtergrond').evaluate(el => getComputedStyle(el).backgroundColor);

// Zet de bovenkant van een sectie op een fractie van de schermhoogte (plus een verschuiving in px) en wacht een paar frames.
async function zetBovenkant(page, selector, fractie, extra) {
  await page.evaluate(([sel, f, d]) => {
    const el = document.querySelector(sel);
    const doel = window.scrollY + el.getBoundingClientRect().top - (window.innerHeight * f + d); // d > 0: bovenkant onder de lijn
    window.scrollTo({ top: doel, behavior: 'instant' });
  }, [selector, fractie, extra]);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  return page.locator(selector).evaluate(el => el.getBoundingClientRect().top / window.innerHeight);
}

async function afstand(page) {
  return page.evaluate(() => {
    // onderkant van de laagste tekstregel in 001 (laatste blok van elke kolom; kolommen kunnen naast elkaar staan)
    const onder = Math.max(...[...document.querySelectorAll('.gegevens-kolom')].map(k => k.lastElementChild.getBoundingClientRect().bottom));
    // bovenkant van de letters "002 —"
    const r = document.createRange(); r.selectNodeContents(document.querySelector('#formulier .label span').firstChild);
    const boven = Math.min(...[...r.getClientRects()].map(x => x.top));
    return Math.round(boven - onder);
  });
}

test.describe('Contact: ruimte en kleurovergang (brief 2026-11-14)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await wachtOpRust(page);
  });

  test('criterium 1 en 3: geen min-height en de afstand 001 → 002 volgt het ritme', async ({ page }) => {
    const vp = page.viewportSize();
    const breedtes = vp.width >= 1024 ? [[1440, 900], [1280, 800], [1024, 768]] : [[vp.width, vp.height]];
    for (const [b, h] of breedtes) {
      await page.setViewportSize({ width: b, height: h });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const minH = await page.locator('.gegevens').evaluate(el => getComputedStyle(el).minHeight);
      expect(['0px', 'auto'], `min-height van .gegevens op ${b} px`).toContain(minH);
      const pb = await page.locator('.gegevens').evaluate(el => getComputedStyle(el).paddingBottom);
      expect(pb, `padding-bottom van .gegevens op ${b} px`).toBe(b >= 761 ? '16px' : '0px');
      const a = await afstand(page);
      expect(a, `afstand op ${b} px`).toBeLessThanOrEqual(200);
      if (AFSTAND[b]) expect(Math.abs(a - (AFSTAND[b] - MEETVERSCHIL)), `afstand op ${b} px is ${a} (+${MEETVERSCHIL} = ${a + MEETVERSCHIL}), verwacht ${AFSTAND[b]} ± 12`).toBeLessThanOrEqual(12);
    }
  });

  test('criterium 7, 8 en 13: de laag wisselt op 60 % heen en terug, met de gegevens nog in beeld', async ({ page }) => {
    expect(await page.locator('#formulier').getAttribute('data-laag-lijn')).toBe('0.6');
    expect(await page.locator('.achtergrond').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
    // net onder de lijn: nog wit
    await zetBovenkant(page, '#formulier', 0.6, 0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'onder de 60 %-lijn blijft de laag wit').toBe(WIT);
    // net boven de lijn: terracotta, en de gegevens staan nog (deels) in beeld
    await zetBovenkant(page, '#formulier', 0.6, -0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'boven de 60 %-lijn is de laag terracotta').toBe(TERRACOTTA);
    const kolOnder = await page.locator('.gegevens-kolommen').evaluate(el => el.getBoundingClientRect().bottom);
    expect(kolOnder, 'de gegevens staan nog in beeld als de laag omslaat').toBeGreaterThan(0);
    // terug omhoog: weer wit op dezelfde lijn
    await zetBovenkant(page, '#formulier', 0.6, 0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'terug omhoog wordt de laag weer wit').toBe(WIT);
  });

  test('criterium 7: met beweging na de overgang van 0,75 s dezelfde lijn', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await zetBovenkant(page, '#formulier', 0.6, -0.03 * page.viewportSize().height);
    await page.waitForTimeout(1000);
    expect(await laagKleur(page)).toBe(TERRACOTTA);
    await zetBovenkant(page, '#formulier', 0.6, 0.03 * page.viewportSize().height);
    await page.waitForTimeout(1000);
    expect(await laagKleur(page)).toBe(WIT);
  });

  test('criterium 11: het balklogo volgt de laag', async ({ page }) => {
    const logo = async () => page.locator('.balk').evaluate(b => {
      const zichtbaar = el => el && getComputedStyle(el).display !== 'none';
      return { zichtbaar: b.classList.contains('zichtbaar'), wit: zichtbaar(b.querySelector('.logo-wit')), donker: zichtbaar(b.querySelector('.logo-donker')), label: getComputedStyle(b.querySelector('.sectie-label')).color };
    });
    // terracotta laag terwijl 001 nog onder de balk ligt: wit logo, label inkt
    await zetBovenkant(page, '#formulier', 0.6, -0.03 * page.viewportSize().height);
    let s = await logo();
    if (s.zichtbaar) { expect(s.wit).toBe(true); expect(s.donker).toBe(false); expect(s.label).toBe('rgb(32, 32, 32)'); }
    // verder in het formulier: de balk is zeker zichtbaar, laag terracotta, wit logo
    await zetBovenkant(page, '#formulier', 0, 10);
    s = await logo();
    expect(s.zichtbaar).toBe(true);
    expect(await laagKleur(page)).toBe(TERRACOTTA);
    expect(s.wit && !s.donker, 'wit logo op de terracotta laag').toBe(true);
    expect(s.label).toBe('rgb(32, 32, 32)');
    // terug naar de witte laag met de balk in beeld: donker logo
    await zetBovenkant(page, '.gegevens', 0, 60);
    await zetBovenkant(page, '#formulier', 0.6, 0.03 * page.viewportSize().height);
    s = await logo();
    if (await laagKleur(page) === WIT && s.zichtbaar) { expect(s.donker && !s.wit, 'donker logo op de witte laag').toBe(true); }
  });

  test('criterium 10: een andere pagina wisselt nog op de oude lijn (0,88 voor terracotta)', async ({ page }) => {
    await page.goto('/kraamcadeauboxen');
    await wachtOpRust(page);
    expect(await page.locator('[data-laag-lijn]').count()).toBe(0);
    await zetBovenkant(page, '#contact', 0.88, 0.02 * page.viewportSize().height);
    expect(await laagKleur(page), 'onder 88 % nog niet terracotta').not.toBe(TERRACOTTA);
    await zetBovenkant(page, '#contact', 0.88, -0.02 * page.viewportSize().height);
    expect(await laagKleur(page), 'boven 88 % terracotta').toBe(TERRACOTTA);
  });
});
