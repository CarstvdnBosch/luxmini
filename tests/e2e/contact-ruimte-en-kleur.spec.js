// Brief 2026-11-14-contact-ruimte-en-kleur, blokkerend.
// Contact: geen lege strook tussen 001 (gegevens) en 002 (formulier), en de kleurlaag wisselt bij 002 al op 76 %
// van de schermhoogte (data-laag-lijn="0.76", besluit ontwerper 14 nov.), zodat je de overgang naar terracotta ziet terwijl
// de gegevens nog in beeld zijn, en vóór het eerste formulierveld helemaal in beeld staat.
// De balk volgt de laag: wit logo op de terracotta laag, donker logo op de witte laag. Andere pagina's houden 0,88 / 0,5.
import { test, expect, wachtOpRust } from './hulp.js';

const TERRACOTTA = 'rgb(188, 133, 101)';
const WIT = 'rgb(255, 255, 255)';
const LIJN = 0.76;
// criterium 3: afstand laatste tekstregel 001 → letters "002 —" per schermbreedte (± 12 px), gemeten nadat het label van 002
// is opgekomen; de tests draaien met prefers-reduced-motion: reduce (hulp.js), dus zonder opkomen.
const AFSTAND = { 1440: 131, 1280: 119, 1024: 102, 768: 86, 390: 70 };
const BREEDTES = { desktop: [[1440, 900], [1280, 800], [1024, 768]] };

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
    const breedtes = vp.width >= 1024 ? BREEDTES.desktop : [[vp.width, vp.height]];
    for (const [b, h] of breedtes) {
      await page.setViewportSize({ width: b, height: h });
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      const minH = await page.locator('.gegevens').evaluate(el => getComputedStyle(el).minHeight);
      expect(['0px', 'auto'], `min-height van .gegevens op ${b} px`).toContain(minH);
      const pb = await page.locator('.gegevens').evaluate(el => getComputedStyle(el).paddingBottom);
      expect(pb, `padding-bottom van .gegevens op ${b} px`).toBe(b >= 761 ? '16px' : '0px');
      const a = await afstand(page);
      expect(a, `afstand op ${b} px`).toBeLessThanOrEqual(200);
      if (AFSTAND[b]) expect(Math.abs(a - AFSTAND[b]), `afstand op ${b} px is ${a}, verwacht ${AFSTAND[b]} ± 12`).toBeLessThanOrEqual(12);
    }
  });

  test('criterium 7, 8 en 13: de laag wisselt op 76 % heen en terug, met de gegevens nog in beeld', async ({ page }) => {
    expect(await page.locator('#formulier').getAttribute('data-laag-lijn')).toBe('0.76');
    expect(await page.locator('.achtergrond').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0s');
    // net onder de lijn: nog wit
    await zetBovenkant(page, '#formulier', LIJN, 0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'onder de 76 %-lijn blijft de laag wit').toBe(WIT);
    // net boven de lijn: terracotta, en de gegevens staan nog (deels) in beeld
    await zetBovenkant(page, '#formulier', LIJN, -0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'boven de 76 %-lijn is de laag terracotta').toBe(TERRACOTTA);
    const kolOnder = await page.locator('.gegevens-kolommen').evaluate(el => el.getBoundingClientRect().bottom);
    expect(kolOnder, 'de gegevens staan nog in beeld als de laag omslaat').toBeGreaterThan(0);
    // terug omhoog: weer wit op dezelfde lijn
    await zetBovenkant(page, '#formulier', LIJN, 0.03 * page.viewportSize().height);
    expect(await laagKleur(page), 'terug omhoog wordt de laag weer wit').toBe(WIT);
  });

  test('criterium 7: met beweging na de overgang van 0,75 s dezelfde lijn', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await zetBovenkant(page, '#formulier', LIJN, -0.03 * page.viewportSize().height);
    await page.waitForTimeout(1000);
    expect(await laagKleur(page)).toBe(TERRACOTTA);
    await zetBovenkant(page, '#formulier', LIJN, 0.03 * page.viewportSize().height);
    await page.waitForTimeout(1000);
    expect(await laagKleur(page)).toBe(WIT);
  });

  test('criterium 9: het onderwerpveld staat nooit helemaal in beeld op de witte laag (1440, 1280, 1024, 768, 390)', async ({ page }) => {
    const vp = page.viewportSize();
    const breedtes = vp.width >= 1024 ? BREEDTES.desktop : [[vp.width, vp.height]];
    for (const [b, h] of breedtes) {
      await page.setViewportSize({ width: b, height: h });
      // de laatste stand waarin de laag nog wit is: bovenkant van #formulier 1 px onder de lijn
      await zetBovenkant(page, '#formulier', LIJN, 1);
      expect(await laagKleur(page), `op ${b} px is de laag net onder de lijn nog wit`).toBe(WIT);
      const veld = await page.locator('select[name="onderwerp"]').evaluate(el => ({ boven: el.getBoundingClientRect().top, onder: el.getBoundingClientRect().bottom, vh: window.innerHeight }));
      expect(veld.onder, `op ${b} px staat het onderwerpveld (onderkant ${Math.round(veld.onder)} px) niet helemaal in beeld op wit (scherm ${veld.vh} px)`).toBeGreaterThan(veld.vh);
    }
  });

  test('criterium 11: het balklogo volgt de laag', async ({ page }) => {
    const logo = async () => page.locator('.balk').evaluate(b => {
      const zichtbaar = el => el && getComputedStyle(el).display !== 'none';
      return { zichtbaar: b.classList.contains('zichtbaar'), wit: zichtbaar(b.querySelector('.logo-wit')), donker: zichtbaar(b.querySelector('.logo-donker')), label: getComputedStyle(b.querySelector('.sectie-label')).color };
    });
    // terracotta laag terwijl 001 nog onder de balk ligt: wit logo, label inkt
    await zetBovenkant(page, '#formulier', LIJN, -0.03 * page.viewportSize().height);
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
    await zetBovenkant(page, '#formulier', LIJN, 0.03 * page.viewportSize().height);
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
