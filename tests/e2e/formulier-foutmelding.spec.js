// Brief 2026-11-11 (formulier: eerlijke foutmelding en invoer bewaren), blokkerend.
// Er gaat nooit een echte mail weg: /api/contact is in elke test een nep-antwoord via page.route.
import { test, expect, wachtOpRust } from './hulp.js';

const ONGELDIG = '/contact?verzonden=fout#formulier';
const VERSTUREN = '/contact?verzonden=fout&reden=versturen#formulier';
const INVOER = { bericht: 'Graag een box met een giraf', naam: 'Test Persoon', email: 'test@voorbeeld.test', telefoon: '0600000000', box_naam: 'Sem', box_datum: '1 december' };

async function vulIn(page, invoer = INVOER) {
  await page.goto('/contact#formulier');
  await wachtOpRust(page);
  await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
  await page.locator('input[name="box_formaat"][value="50"]').check({ force: true });
  await page.locator('select[name="box_thema"]').selectOption('Giraf');
  for (const [naam, waarde] of Object.entries(invoer)) await page.locator(`[name="${naam}"]`).fill(waarde);
}
// nep-Worker: antwoordt met een doorverwijzing (303), zoals src/contact.js
const nepWorker = (page, locatie, opslaan) => page.route('**/api/contact', async r => {
  if (opslaan) opslaan(r.request());
  await r.fulfill({ status: 303, headers: { location: locatie } });
});
async function veldenGevuld(page) {
  for (const [naam, waarde] of Object.entries(INVOER)) await expect(page.locator(`[name="${naam}"]`), `veld ${naam} blijft gevuld`).toHaveValue(waarde);
  await expect(page.locator('select[name="onderwerp"]')).toHaveValue('Kraamcadeaubox');
  await expect(page.locator('input[name="box_formaat"][value="50"]')).toBeChecked();
  await expect(page.locator('select[name="box_thema"]')).toHaveValue('Giraf');
}
async function meldingMeten(page) {
  return page.locator('.formulier .melding.fout').evaluate(m => {
    const r = m.getBoundingClientRect();
    const maten = [m, ...m.querySelectorAll('*')].map(el => parseFloat(getComputedStyle(el).fontSize));
    const k = document.querySelector('.formulier button.verstuur').getBoundingClientRect();
    return { knopBoven: k.top, knopOnder: k.bottom, boven: r.top, onder: r.bottom, hoogte: window.innerHeight, kleinste: Math.min(...maten), breed: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  });
}

// de privacyzin met de link blijft staan naast de foutmelding (kan-beter controleur, ronde 2)
async function privacyBlijft(page) {
  await expect(page.locator('.formulier .melding:not(.fout) a[href="privacy.html"]')).toBeVisible();
  await expect(page.locator('.formulier .melding.fout')).toHaveCount(1);
}

test('versturen mislukt: velden blijven staan, eerlijke melding met WhatsApp en mail in beeld', async ({ page }) => {
  await nepWorker(page, VERSTUREN);
  await vulIn(page);
  await page.locator('button.verstuur').click();
  const melding = page.locator('.formulier .melding.fout');
  await expect(melding).toContainText('Je bericht is niet verstuurd.');
  await expect(melding).toContainText('Dat ligt niet aan jou: er ging iets mis bij het versturen.');
  await expect(melding).not.toContainText('Controleer je naam');
  await expect(melding).toHaveAttribute('role', 'alert');
  await expect(melding.locator('a[href="https://wa.me/31643791618"]')).toHaveText('WhatsApp');
  await expect(melding.locator('a[href="mailto:info.LUXmini@gmail.com"]')).toHaveText('mail');
  await expect(melding).toBeFocused();
  await expect(page).toHaveURL(/\/contact#formulier$/); // de pagina blijft staan
  await veldenGevuld(page);
  const m = await meldingMeten(page);
  expect(m.boven, 'melding in beeld (boven)').toBeGreaterThanOrEqual(0);
  expect(m.onder, 'melding in beeld (onder)').toBeLessThanOrEqual(m.hoogte);
  expect(m.kleinste, 'geen tekst onder 16 px in de melding').toBeGreaterThanOrEqual(16);
  expect(m.breed, 'niets scrolt horizontaal').toBe(false);
  expect(m.knopBoven, 'knop volledig in beeld (boven)').toBeGreaterThanOrEqual(0);
  expect(m.knopOnder, 'knop volledig in beeld (onder)').toBeLessThanOrEqual(m.hoogte);
  await privacyBlijft(page);
  // de knop is weer bruikbaar
  await expect(page.locator('button.verstuur')).toBeEnabled();
  await expect(page.locator('button.verstuur')).toHaveText('Verstuur bericht');
});

test('twee keer mislukt: één melding, privacylink blijft, knop en melding in beeld', async ({ page }) => {
  await nepWorker(page, ONGELDIG);
  await vulIn(page, { ...INVOER, email: 'test@voorbeeld' });
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Controleer je naam');
  await page.unroute('**/api/contact');
  await nepWorker(page, VERSTUREN);
  await page.locator('input[name="email"]').fill(INVOER.email);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await privacyBlijft(page);
  const m = await meldingMeten(page);
  expect(m.boven).toBeGreaterThanOrEqual(0);
  expect(m.knopOnder, 'knop volledig in beeld').toBeLessThanOrEqual(m.hoogte);
});

test('netwerkfout: zelfde melding als versturen mislukt, velden blijven staan', async ({ page }) => {
  await page.route('**/api/contact', r => r.abort('internetdisconnected'));
  await vulIn(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await veldenGevuld(page);
});

test('onverwacht antwoord (bijv. 405): melding versturen', async ({ page }) => {
  await page.route('**/api/contact', r => r.fulfill({ status: 405, body: '' }));
  await vulIn(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
});

test('ongeldige invoer: melding ongeldig, focus naar het eerste foute veld, velden blijven staan', async ({ page }) => {
  await nepWorker(page, ONGELDIG);
  // de browser vindt dit adres goed, de Worker niet (geen punt in het domein)
  await vulIn(page, { ...INVOER, email: 'test@voorbeeld' });
  await page.locator('button.verstuur').click();
  const melding = page.locator('.formulier .melding.fout');
  await expect(melding).toHaveText('Je bericht is niet verstuurd. Controleer je naam, e-mailadres en bericht.');
  await expect(melding).toHaveAttribute('role', 'alert');
  await expect(melding.locator('a')).toHaveCount(0);
  await expect(page.locator('input[name="email"]')).toBeFocused();
  await expect(page.locator('input[name="email"]')).toHaveValue('test@voorbeeld');
  await expect(page.locator('textarea[name="bericht"]')).toHaveValue(INVOER.bericht);
  expect((await meldingMeten(page)).kleinste).toBeGreaterThanOrEqual(16);
  await privacyBlijft(page);
});

test('gelukt: dezelfde formulierdata naar /api/contact en dan naar /bedankt', async ({ page }) => {
  let verzoek = null;
  await nepWorker(page, '/bedankt', r => { verzoek = { methode: r.method(), type: r.headers()['content-type'], data: r.postData() }; });
  await vulIn(page);
  await page.locator('button.verstuur').click();
  await expect(page).toHaveURL(/\/bedankt$/);
  expect(verzoek.methode).toBe('POST');
  expect(verzoek.type).toContain('application/x-www-form-urlencoded');
  const data = new URLSearchParams(verzoek.data);
  expect(data.get('onderwerp')).toBe('Kraamcadeaubox');
  expect(data.get('box_formaat')).toBe('50');
  expect(data.get('naam')).toBe(INVOER.naam);
  expect(data.get('website')).toBe(''); // spamval gaat mee, leeg
});

test('tijdens het versturen: knop uit met "Bezig met versturen…"', async ({ page }) => {
  let laatGaan;
  const wacht = new Promise(r => { laatGaan = r; });
  await page.route('**/api/contact', async r => { await wacht; await r.fulfill({ status: 303, headers: { location: VERSTUREN } }); });
  await vulIn(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('button.verstuur')).toBeDisabled();
  await expect(page.locator('button.verstuur')).toHaveText('Bezig met versturen…');
  await expect(page.locator('button.verstuur')).toHaveCSS('cursor', 'progress');
  laatGaan();
  await expect(page.locator('button.verstuur')).toBeEnabled();
});

test('foutpagina na een gewone POST: de melding hoort bij de reden', async ({ page }) => {
  await page.goto(VERSTUREN);
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await expect(page.locator('.formulier .melding.fout a[href="https://wa.me/31643791618"]')).toHaveCount(1);
  const m = await meldingMeten(page);
  expect(m.onder, 'melding zonder scrollen in beeld').toBeLessThanOrEqual(m.hoogte);
  expect(m.boven).toBeGreaterThanOrEqual(0);
  expect(m.knopOnder, 'knop volledig in beeld').toBeLessThanOrEqual(m.hoogte);
  await privacyBlijft(page);
  await page.goto(ONGELDIG);
  await expect(page.locator('.formulier .melding.fout')).toHaveText('Je bericht is niet verstuurd. Controleer je naam, e-mailadres en bericht.');
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('gewone POST: bij versturen mislukt naar de foutpagina met reden=versturen', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
    let verstuurd = null;
    await nepWorker(page, VERSTUREN, r => { verstuurd = r.postData(); });
    await page.goto('/contact#formulier');
    await page.locator('textarea[name="bericht"]').fill(INVOER.bericht);
    await page.locator('input[name="naam"]').fill(INVOER.naam);
    await page.locator('input[name="email"]').fill(INVOER.email);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/contact\?verzonden=fout&reden=versturen#formulier$/);
    expect(verstuurd).toContain('naam=Test+Persoon');
  });
});

// Ontwerpgate ronde 1 (11 nov.): rustige regellengte, gecentreerd, geen los woord op de laatste regel.
async function regels(page) {
  return page.locator('.formulier .melding.fout').evaluate(m => {
    const r = m.getBoundingClientRect();
    const f = m.closest('form').getBoundingClientRect();
    const rng = document.createRange(); rng.selectNodeContents(m);
    const lijnen = new Map();
    for (const q of rng.getClientRects()) {
      if (q.width < 1) continue;
      const k = Math.round(q.top / 4);
      const l = lijnen.get(k) || { links: q.left, rechts: q.right };
      l.links = Math.min(l.links, q.left); l.rechts = Math.max(l.rechts, q.right); lijnen.set(k, l);
    }
    const breedtes = [...lijnen.values()].map(l => l.rechts - l.links);
    const ch = (() => { const s = document.createElement('span'); s.textContent = '0'.repeat(60); s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'; m.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return w; })();
    return { breed: r.width, max60ch: ch, midden: Math.abs((r.left + r.right) / 2 - (f.left + f.right) / 2), aantal: breedtes.length, laatste: breedtes[breedtes.length - 1], langste: Math.max(...breedtes) };
  });
}

test('versturen-melding: max. ca. 60ch, gecentreerd, 2–3 rustige regels zonder los woord', async ({ page }, info) => {
  test.skip(info.project.name === 'mobiel' || info.project.name === 'iphone', 'regellengte geldt voor 1440 en 768');
  await nepWorker(page, VERSTUREN);
  await vulIn(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  const r = await regels(page);
  expect(r.breed, 'melding niet breder dan ca. 60 tekens').toBeLessThanOrEqual(r.max60ch + 1);
  expect(r.midden, 'melding gecentreerd in het formulier').toBeLessThanOrEqual(2);
  expect(r.aantal, '2 of 3 regels').toBeGreaterThanOrEqual(2);
  expect(r.aantal, '2 of 3 regels').toBeLessThanOrEqual(3);
  expect(r.laatste / r.langste, 'geen los woord op de laatste regel').toBeGreaterThan(0.5);
});

test.describe('390 met beweging', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== 'mobiel', 'alleen 390 × 844');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('versturen mislukt, een paar keer achter elkaar: melding en knop altijd in beeld', async ({ page }) => {
    await nepWorker(page, VERSTUREN);
    await vulIn(page);
    for (let i = 0; i < 4; i++) {
      // begin telkens ergens anders op de pagina
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), [0, 400, 99999, 1200][i]);
      await page.locator('button.verstuur').click();
      await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
      await expect(page.locator('button.verstuur')).toBeEnabled();
      await page.waitForTimeout(700); // na de tweede meting
      const m = await meldingMeten(page);
      expect(m.boven, `poging ${i + 1}: melding in beeld (boven)`).toBeGreaterThanOrEqual(0);
      expect(m.onder, `poging ${i + 1}: melding in beeld (onder)`).toBeLessThanOrEqual(m.hoogte);
      expect(m.knopBoven, `poging ${i + 1}: knop in beeld (boven)`).toBeGreaterThanOrEqual(0);
      expect(m.knopOnder, `poging ${i + 1}: knop in beeld (onder)`).toBeLessThanOrEqual(m.hoogte);
      await expect(page.locator('.formulier .melding.fout')).toHaveCount(1);
    }
    await veldenGevuld(page);
  });

  test('ongeldige invoer: foute veld heeft focus, melding en knop in beeld', async ({ page }) => {
    await nepWorker(page, ONGELDIG);
    await vulIn(page, { ...INVOER, email: 'test@voorbeeld' });
    await page.locator('button.verstuur').click();
    await expect(page.locator('.formulier .melding.fout')).toContainText('Controleer je naam');
    await expect(page.locator('input[name="email"]')).toBeFocused();
    await page.waitForTimeout(700);
    const m = await meldingMeten(page);
    expect(m.boven).toBeGreaterThanOrEqual(0);
    expect(m.knopOnder, 'knop volledig in beeld').toBeLessThanOrEqual(m.hoogte);
    const veld = await page.locator('input[name="email"]').boundingBox();
    expect(veld.y, 'het foute veld blijft in beeld').toBeGreaterThanOrEqual(0);
  });
});
