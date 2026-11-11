// Brief 2026-11-11-c7-stofkeuze (wens Carst 11 nov.), blokkerend: thema als keuzekaarten met de stoffoto's,
// "Een eigen stof" met een foto (alleen als bijlage in de mail) en/of een link. Er gaat nooit een echte mail weg:
// /api/contact loopt via de testmodus van scripts/serveer.mjs (header x-testmail: ok | fout).
import { test, expect, wachtOpRust } from './hulp.js';

const EIGEN = 'Een eigen stof of kleur';
const THEMAS = ['Giraf', 'Vos', 'Tulp', 'Walvis', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen'];
// een echt PNG-plaatje van 1 × 1 pixel (verzonnen)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
// bijlage: 'ja' | 'nee' → de testserver laat het versturen mislukken als er (g)een foto als bijlage in de opgebouwde mail zit
const nepMail = (page, uitkomst, bijlage) => page.setExtraHTTPHeaders({ 'x-testmail': uitkomst, ...(bijlage ? { 'x-testmail-bijlage': bijlage } : {}) });
const blok = (page) => page.locator('.formulier .eigen-stof');

async function naarStoffen(page, pad = '/contact?onderwerp=kraamcadeaubox#formulier') {
  await page.goto(pad);
  await wachtOpRust(page);
  await page.locator('.stofkeuze').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(50);
}
async function kies(page, waarde) {
  const r = page.locator(`input[name="box_thema"][value="${waarde}"]`);
  await r.evaluate(el => el.closest('label').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await r.check({ force: true });
}

test('keuzekaarten: raster zonder horizontaal scrollen, tegels max. 240 px, naam 16 px en tikdoelen van 44 px (O1–O6)', async ({ page }, info) => {
  await naarStoffen(page);
  const smal = (page.viewportSize().width <= 760);
  const m = await page.locator('.stofkeuze').evaluate(f => {
    const kaarten = [...f.querySelectorAll('.stof-kaart')].map(k => { const r = k.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), b: r.width, h: r.height, w: k.querySelector('input').value }; });
    const fotos = [...f.querySelectorAll('.stof-kaart img')].map(i => [i.getBoundingClientRect().width, i.getAttribute('alt'), i.getAttribute('loading')]);
    const namen = [...f.querySelectorAll('.stof-kaart-naam, .stof-kaart-regel')].map(n => parseFloat(getComputedStyle(n).fontSize));
    const geen = f.querySelector('.stof-geen').getBoundingClientRect();
    const raster = f.querySelector('.stof-kaarten');
    return { kaarten, fotos, namen, geen: geen.height, top: f.getBoundingClientRect().top, onder: geen.bottom,
      rasterBreed: raster.scrollWidth > raster.clientWidth + 1, pagina: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      legend: f.querySelector('legend').textContent.trim() };
  });
  expect(m.legend).toBe('Thema');
  expect(m.kaarten.map(k => k.w)).toEqual([...THEMAS, EIGEN]);
  expect(m.pagina, 'pagina scrolt horizontaal').toBe(false);
  expect(m.rasterBreed, 'raster scrolt horizontaal').toBe(false);
  const rijen = [...new Set(m.kaarten.map(k => k.t))];
  if (smal) {
    // 3 × 3 en de eigen stof liggend over de volle breedte
    expect(rijen.length).toBe(4);
    expect(new Set(m.kaarten.slice(0, 9).map(k => k.l)).size).toBe(3);
    expect(m.kaarten[9].b).toBeGreaterThan(m.kaarten[0].b * 2.5);
    for (const [b] of m.fotos) expect(b, 'stoffoto op 390 minstens 96 px').toBeGreaterThanOrEqual(90);
    expect(m.onder - m.top, 'themagroep (zonder blok) binnen één scherm').toBeLessThanOrEqual(844);
  } else {
    expect(rijen.length, '5 kolommen, 2 rijen').toBe(2);
    expect(new Set(m.kaarten.map(k => k.l)).size).toBe(5);
  }
  for (const k of m.kaarten) { expect(k.b).toBeLessThanOrEqual(smal ? 400 : 240); expect(k.h).toBeGreaterThanOrEqual(44); }
  for (const [b, alt, laden] of m.fotos) { expect(b).toBeLessThanOrEqual(240); expect(alt, 'stoffoto heeft alt=""').toBe(''); expect(laden).toBe('lazy'); }
  for (const g of m.namen) expect(g).toBeGreaterThanOrEqual(16);
  expect(m.geen).toBeGreaterThanOrEqual(44);
  // toegankelijke naam = themanaam (O12)
  await expect(page.getByRole('radio', { name: 'Giraf', exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Een eigen stof', exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Nog niet gekozen', exact: true })).toBeChecked();
  await info.attach('maten', { body: JSON.stringify(m, null, 2), contentType: 'application/json' });
});

test('gekozen kaart: inktrand en vink; "Nog niet gekozen" standaard en opnieuw te kiezen (O5, O7)', async ({ page }) => {
  await naarStoffen(page);
  await expect(page.locator('input[name="box_thema"]:checked')).toHaveValue('');
  await kies(page, 'Vos');
  const kaart = page.locator('.stof-kaart:has(input[value="Vos"])');
  await expect(kaart.locator('.keuze-rand')).toHaveCSS('border-top-color', 'rgb(32, 32, 32)');
  await expect(kaart.locator('.keuze-vink')).toHaveCSS('opacity', '1');
  await expect(page.locator('.stof-kaart:has(input[value="Giraf"]) .keuze-vink')).toHaveCSS('opacity', '0');
  await kies(page, '');
  await expect(page.locator('input[name="box_thema"][value=""]')).toBeChecked();
  await expect(kaart.locator('.keuze-vink')).toHaveCSS('opacity', '0');
});

test('blok "Je eigen stof" alleen bij een eigen stof, zonder vervagen bij minder beweging (O8, O14)', async ({ page }) => {
  await naarStoffen(page);
  await expect(blok(page)).toBeHidden();
  await kies(page, EIGEN);
  await expect(blok(page)).toBeVisible();
  expect(await blok(page).locator('legend').evaluate(l => l.innerText.trim())).toBe('Je eigen stof (optioneel)');
  await expect(blok(page)).toHaveCSS('animation-name', 'none');
  await expect(page.getByLabel('Foto van de stof')).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp,image/heic');
  await expect(page.getByLabel('Link naar de stof (bijvoorbeeld een webshop)')).toHaveAttribute('type', 'url');
  const uitleg = page.locator('#stof-foto-uitleg');
  await expect(uitleg).toContainText('Je foto gaat alleen als bijlage mee in de mail aan Carien en wordt niet bewaard.');
  await expect(uitleg).toHaveCSS('font-size', '16px');
  // bestandsknop: 44 px hoog (O9)
  const knopHoogte = await page.locator('input[name="stof_foto"]').evaluate(i => i.getBoundingClientRect().height);
  expect(knopHoogte).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), 'horizontaal scrollen met het blok open').toBe(false);
  await kies(page, 'Giraf');
  await expect(blok(page)).toBeHidden();
});

test('vooraf invullen: ?thema=giraf, ?thema=eigen (blok open) en onbekend; focus springt niet (O13)', async ({ page }) => {
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=giraf#formulier');
  await expect(page.locator('input[name="box_thema"][value="Giraf"]')).toBeChecked();
  await expect(blok(page)).toBeHidden();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  await expect(page.locator(`input[name="box_thema"][value="${EIGEN}"]`)).toBeChecked();
  await expect(blok(page)).toBeVisible();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=onzin#formulier');
  await expect(page.locator('input[name="box_thema"][value=""]')).toBeChecked();
  await expect(blok(page)).toBeHidden();
});

async function vulVerplicht(page) {
  await page.locator('textarea[name="bericht"]').fill('Graag een box met deze stof');
  await page.locator('input[name="naam"]').fill('Test Persoon');
  await page.locator('input[name="email"]').fill('test@voorbeeld.test');
}

test('upload: miniatuur, naam en "Verwijderen" (focus terug); met de foto naar /bedankt (multipart) (O9)', async ({ page }) => {
  let type = null;
  page.on('request', r => { if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/contact') type = r.headers()['content-type']; });
  await nepMail(page, 'ok', 'ja'); // /bedankt alleen als de foto (geldig, PNG) als bijlage in de mail zit
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  const veld = page.locator('input[name="stof_foto"]');
  await veld.setInputFiles({ name: 'Mijn stof.png', mimeType: 'image/png', buffer: PNG });
  const voorbeeld = page.locator('.eigen-voorbeeld');
  await expect(voorbeeld).toBeVisible();
  await expect(voorbeeld.locator('.eigen-voorbeeld-naam')).toHaveText('Mijn stof.png');
  const mini = await voorbeeld.locator('img').evaluate(i => [i.getBoundingClientRect().width, i.getAttribute('alt')]);
  expect(mini[0]).toBeLessThanOrEqual(72); expect(mini[1]).toBe('');
  const weg = voorbeeld.locator('button.eigen-weg');
  const maat = await weg.evaluate(b => [b.getBoundingClientRect().width, b.getBoundingClientRect().height]);
  expect(Math.min(...maat)).toBeGreaterThanOrEqual(44);
  await weg.click();
  await expect(voorbeeld).toHaveCount(0);
  await expect(veld).toBeFocused();
  expect(await veld.evaluate(i => i.files.length)).toBe(0);
  // opnieuw kiezen en versturen
  await veld.setInputFiles({ name: 'Mijn stof.png', mimeType: 'image/png', buffer: PNG });
  await page.locator('input[name="stof_link"]').fill('https://stof.test/giraf');
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page).toHaveURL(/\/bedankt$/);
  expect(type).toContain('multipart/form-data');
});

test('na "Verwijderen" en bij een ander thema gaat er geen bijlage mee', async ({ page }) => {
  await nepMail(page, 'ok', 'nee'); // /bedankt alleen als er geen bijlage in de mail zit
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  await page.locator('input[name="stof_foto"]').setInputFiles({ name: 'stof.png', mimeType: 'image/png', buffer: PNG });
  await kies(page, 'Walvis');
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page).toHaveURL(/\/bedankt$/);
});

test('upload met versturen mislukt: velden en foto blijven staan, melding "versturen"', async ({ page }) => {
  await nepMail(page, 'fout');
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  await page.locator('input[name="stof_foto"]').setInputFiles({ name: 'stof.png', mimeType: 'image/png', buffer: PNG });
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await expect(page.locator('.formulier .melding.fout')).toContainText('Dat ligt niet aan jou');
  await expect(page.locator(`input[name="box_thema"][value="${EIGEN}"]`)).toBeChecked();
  expect(await page.locator('input[name="stof_foto"]').evaluate(i => i.files.length)).toBe(1);
  await expect(page.locator('input[name="naam"]')).toHaveValue('Test Persoon');
});

test('meldingen: te groot, geen foto en een link zonder https:// — "Let op:", aria-live, bestand gaat niet mee (O10)', async ({ page }) => {
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  const veld = page.locator('input[name="stof_foto"]');
  const fout = page.locator('#stof-foto-fout');
  await expect(fout).toHaveAttribute('aria-live', 'polite');
  await expect(veld).toHaveAttribute('aria-describedby', /stof-foto-fout/);
  const groot = Buffer.alloc(5 * 1024 * 1024 + 1); PNG.copy(groot);
  await veld.setInputFiles({ name: 'groot.png', mimeType: 'image/png', buffer: groot });
  await expect(fout).toHaveText('Let op: deze foto is groter dan 5 MB. Kies een kleinere foto.', { timeout: 1000 });
  await expect(fout).toHaveCSS('font-size', '16px');
  expect(await veld.evaluate(i => i.files.length), 'te grote foto gaat niet mee').toBe(0);
  await expect(page.locator('.eigen-voorbeeld')).toHaveCount(0);
  await veld.setInputFiles({ name: 'brief.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7 verzonnen') });
  await expect(fout).toHaveText('Let op: dit is geen foto. Kies een JPG, PNG of HEIC.', { timeout: 1000 });
  expect(await veld.evaluate(i => i.files.length)).toBe(0);
  await veld.setInputFiles({ name: 'stof.png', mimeType: 'image/png', buffer: PNG });
  await expect(fout).toHaveText('');
  // link
  const link = page.locator('input[name="stof_link"]');
  await expect(link).toHaveAttribute('aria-describedby', 'stof-link-fout');
  await link.fill('www.stof.test');
  await link.blur();
  await expect(page.locator('#stof-link-fout')).toHaveText('Let op: begin de link met https://');
  // versturen wordt tegengehouden zolang de link niet klopt
  let verstuurd = false;
  page.on('request', r => { if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/contact') verstuurd = true; });
  await vulVerplicht(page);
  await page.locator('button.verstuur').click();
  await page.waitForTimeout(300);
  expect(verstuurd).toBe(false);
  await link.fill('https://www.stof.test/vos');
  await expect(page.locator('#stof-link-fout')).toHaveText('');
  // een ongeldige link bij een ander thema blokkeert niets (het veld is dan verborgen)
  await link.fill('www.stof.test');
  await kies(page, 'Giraf');
  expect(await link.evaluate(i => i.disabled || i.checkValidity()), 'verborgen linkveld blokkeert het versturen').toBe(true);
  expect(await page.locator('form.formulier').evaluate(f => f.checkValidity())).toBe(true);
});

test('foutpagina reden=foto en reden=link tonen een passende melding', async ({ page }) => {
  await page.goto('/contact?verzonden=fout&reden=foto#formulier');
  await expect(page.locator('.formulier .melding.fout')).toContainText('De foto van je stof kon niet mee.');
  await page.goto('/contact?verzonden=fout&reden=link#formulier');
  await expect(page.locator('.formulier .melding.fout')).toContainText('Begin de link met https://');
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('gewone POST (multipart) met foto naar /bedankt; geen foto → reden=foto', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
    await nepMail(page, 'ok', 'ja');
    await page.goto('/contact#formulier');
    await expect(blok(page)).toBeHidden(); // CSS :has werkt ook zonder JavaScript
    await page.locator(`input[name="box_thema"][value="${EIGEN}"]`).check({ force: true });
    await expect(blok(page)).toBeVisible();
    await page.locator('input[name="stof_foto"]').setInputFiles({ name: 'stof.png', mimeType: 'image/png', buffer: PNG });
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
    await page.goto('/contact#formulier');
    await page.locator(`input[name="box_thema"][value="${EIGEN}"]`).check({ force: true });
    await page.locator('input[name="stof_foto"]').setInputFiles({ name: 'stof.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('%PDF-1.7 verzonnen') });
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/contact\?verzonden=fout&reden=foto#formulier$/);
  });
});
