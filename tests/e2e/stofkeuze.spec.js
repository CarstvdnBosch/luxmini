// Brief 2026-11-11-c7-stofkeuze (wens Carst 11 nov.), blokkerend: thema als keuzekaarten met de stoffoto's,
// "Een eigen stof" met een foto (alleen als bijlage in de mail) en/of een link. Er gaat nooit een echte mail weg:
// /api/contact loopt via de testmodus van scripts/serveer.mjs (header x-testmail: ok | fout).
import { test, expect, wachtOpRust } from './hulp.js';

const EIGEN = 'Een eigen stof of kleur';
// Walvis is uit het assortiment (brief 2026-11-14-walvis-uit-assortiment)
const THEMAS = ['Giraf', 'Vos', 'Tulp', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen'];
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
    const kaarten = [...f.querySelectorAll('.stof-kaart')].map(k => { const r = k.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: r.right, b: r.width, h: r.height, w: k.querySelector('input').value }; });
    const fotos = [...f.querySelectorAll('.stof-kaart img')].map(i => [i.getBoundingClientRect().width, i.getAttribute('alt'), i.getAttribute('loading')]);
    const namen = [...f.querySelectorAll('.stof-kaart-naam, .stof-kaart-regel')].map(n => parseFloat(getComputedStyle(n).fontSize));
    const geen = f.querySelector('.stof-geen').getBoundingClientRect();
    const raster = f.querySelector('.stof-kaarten');
    const rr = raster.getBoundingClientRect();
    return { kaarten, fotos, namen, geen: geen.height, rasterRechts: rr.right, top: f.getBoundingClientRect().top, onder: geen.bottom,
      rasterBreed: raster.scrollWidth > raster.clientWidth + 1, pagina: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      legend: f.querySelector('legend').textContent.trim() };
  });
  expect(m.legend).toBe('Thema');
  expect(m.kaarten.map(k => k.w)).toEqual([...THEMAS, EIGEN]);
  expect(m.pagina, 'pagina scrolt horizontaal').toBe(false);
  expect(m.rasterBreed, 'raster scrolt horizontaal').toBe(false);
  const rijen = [...new Set(m.kaarten.map(k => k.t))];
  // de laatste kaart van elke rij eindigt op de rechterkant van het raster (ontwerpcriteria 11 en 12)
  for (const t of rijen) { const rij = m.kaarten.filter(k => k.t === t); expect(Math.abs(rij[rij.length - 1].r - m.rasterRechts), `rij op ${t} loopt tot de rechterrand`).toBeLessThanOrEqual(1); }
  const eigen = m.kaarten[8];
  if (smal) {
    // brief 2026-11-14 (indeling a): 3 × 3 met de eigen stof als negende tegel, even breed als de andere kaarten (was: breed eronder)
    expect(rijen.length, '3 kolommen, 3 rijen').toBe(3);
    expect(new Set(m.kaarten.map(k => k.l)).size).toBe(3);
    expect(Math.abs(eigen.b - m.kaarten[0].b), 'eigen stof even breed als een stofkaart').toBeLessThanOrEqual(0.5);
    for (const [b] of m.fotos) expect(b, 'stoffoto op 390 minstens 96 px').toBeGreaterThanOrEqual(90);
    expect(m.onder - m.top, 'themagroep (zonder blok) binnen één scherm').toBeLessThanOrEqual(844);
  } else {
    // brief 2026-11-14 (indeling a): 5 kolommen, 2 rijen: 5 stoffen, dan 3 stoffen en de eigen stof over de kolommen 4–5
    expect(rijen.length, '5 kolommen, 2 rijen').toBe(2);
    expect(new Set(m.kaarten.map(k => k.l)).size).toBe(5);
    expect(m.kaarten.slice(0, 5).every(k => k.t === rijen[0]) && m.kaarten.slice(5).every(k => k.t === rijen[1])).toBe(true);
    expect(Math.abs(eigen.l - m.kaarten[3].l), 'eigen stof begint in kolom 4').toBeLessThanOrEqual(1);
    expect(Math.abs(eigen.r - m.kaarten[4].r), 'eigen stof eindigt in kolom 5').toBeLessThanOrEqual(1);
  }
  // stofkaarten max. 240 px; de liggende eigen stof (desktop/tablet) beslaat twee kolommen (besluit Carst 14 nov.)
  for (const k of m.kaarten) { expect(k.b).toBeLessThanOrEqual(smal ? 400 : (k === eigen ? 2 * 240 + 12 : 240)); expect(k.h).toBeGreaterThanOrEqual(44); }
  for (const [b, alt, laden] of m.fotos) { expect(b).toBeLessThanOrEqual(240); expect(alt, 'stoffoto heeft alt=""').toBe(''); expect(laden).toBe('lazy'); }
  for (const g of m.namen) expect(g).toBeGreaterThanOrEqual(16);
  expect(m.geen).toBeGreaterThanOrEqual(44);
  // toegankelijke naam = themanaam (O12)
  await expect(page.getByRole('radio', { name: 'Giraf', exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Een eigen stof', exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Nog niet gekozen', exact: true })).toBeChecked();
  await info.attach('maten', { body: JSON.stringify(m, null, 2), contentType: 'application/json' });
});

test('themanamen blijven binnen hun kaart op 320, 360 en 390 px (ontwerpgate ronde 1)', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'smalle telefoons: één project is genoeg');
  for (const breedte of [320, 360, 390]) {
    await page.setViewportSize({ width: breedte, height: 844 });
    await naarStoffen(page);
    const te = await page.locator('.stofkeuze').evaluate(f => [...f.querySelectorAll('.stof-kaart-naam')]
      .filter(n => n.scrollWidth > n.clientWidth || n.getBoundingClientRect().right > n.closest('.keuze-kaart').getBoundingClientRect().right + 0.5)
      .map(n => [n.textContent, n.scrollWidth, n.clientWidth]));
    expect(te, `namen buiten hun kaart op ${breedte} px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), `horizontaal scrollen op ${breedte} px`).toBe(false);
  }
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
  // type=text met inputmode=url: zonder JavaScript houdt de browser een (verborgen) link nooit tegen; de Worker controleert (controle ronde 1)
  const linkVeld = page.getByLabel('Link naar de stof (bijvoorbeeld een webshop)');
  await expect(linkVeld).toHaveAttribute('type', 'text');
  await expect(linkVeld).toHaveAttribute('inputmode', 'url');
  await expect(linkVeld).toHaveAttribute('autocomplete', 'url');
  const uitleg = page.locator('#stof-foto-uitleg');
  await expect(uitleg).toContainText('Je foto gaat alleen als bijlage mee in de mail aan Carien en wordt niet bewaard.');
  await expect(uitleg).toHaveCSS('font-size', '16px');
  // bestandsknop (O9, ontwerpgate ronde 1): het label "Kies een foto" is de knop (≥ 44 px, serif 16 px); het echte veld is alleen
  // visueel verborgen (niet display:none, focusbaar) en de focus is op de knop te zien
  const knop = blok(page).locator('.eigen-foto-knop');
  await expect(knop).toHaveText('Kies een foto');
  const km = await knop.evaluate(k => { const r = k.getBoundingClientRect(), c = getComputedStyle(k); return [r.height, c.fontSize, c.textTransform]; });
  expect(km[0]).toBeGreaterThanOrEqual(44); expect(km[1]).toBe('16px'); expect(km[2]).toBe('none');
  const veldFoto = page.locator('input[name="stof_foto"]');
  expect(await veldFoto.evaluate(i => getComputedStyle(i).display !== 'none' && getComputedStyle(i).visibility !== 'hidden' && i.tabIndex >= 0)).toBe(true);
  await veldFoto.focus();
  await expect(veldFoto).toBeFocused();
  // de regel onder "Een eigen stof"
  await expect(page.locator('#stof-eigen-regel')).toHaveText('Foto of link');
  // "Nog niet gekozen" direct onder het raster, vóór het blok
  const volgorde = await page.locator('.stofkeuze').evaluate(f => { const r = f.querySelector('.stof-kaarten'); return [r.nextElementSibling.matches('.stof-geen'), !!(f.querySelector('.stof-geen').compareDocumentPosition(f.querySelector('.eigen-stof')) & Node.DOCUMENT_POSITION_FOLLOWING)]; });
  expect(volgorde).toEqual([true, true]);
  // meldingen: maximaal ca. 60 tekens breed
  for (const id of ['#stof-foto-uitleg', '#stof-foto-fout']) expect(await page.locator(id).evaluate(e => getComputedStyle(e).maxWidth)).not.toBe('none');
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

// Brief 2026-11-14-walvis-uit-assortiment, criterium 5: Walvis is uit het assortiment; ?thema=walvis zet geen thema
test('vooraf invullen: ?thema=walvis geeft "Nog niet gekozen" en er is geen kaart Walvis', async ({ page }) => {
  await naarStoffen(page, '/contact?onderwerp=kraamcadeaubox&thema=walvis#formulier');
  await expect(page.locator('input[name="box_thema"][value="Walvis"]')).toHaveCount(0);
  await expect(page.locator('input[name="box_thema"]:checked')).toHaveValue('');
  await expect(page.getByRole('radio', { name: 'Nog niet gekozen', exact: true })).toBeChecked();
  await expect(blok(page)).toBeHidden();
});

// Ontwerpcriterium 11 (brief 2026-11-14): op 768 en 1280 px vijf kolommen en twee rijen, de eigen stof in kolom 4–5
test('stofkaarten op 768 en 1280 px: vijf kolommen, twee rijen, eigen stof over kolom 4–5, rijen tot de rechterrand', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'breedtes worden hier zelf gezet');
  for (const breedte of [768, 1280]) {
    await page.setViewportSize({ width: breedte, height: 900 });
    await naarStoffen(page);
    const m = await page.locator('.stof-kaarten').evaluate(r => {
      const rr = r.getBoundingClientRect();
      const k = [...r.querySelectorAll('.stof-kaart')].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.top), b.left, b.right]; });
      return { kolommen: getComputedStyle(r).gridTemplateColumns.split(' ').length, k, rechts: rr.right, eigenKolom: getComputedStyle(r.querySelector('.stof-eigen')).gridColumnEnd };
    });
    expect(m.kolommen, `${breedte}: vijf kolommen`).toBe(5);
    expect(new Set(m.k.map(x => x[0])).size, `${breedte}: twee rijen`).toBe(2);
    expect(Math.abs(m.k[8][1] - m.k[3][1]), `${breedte}: eigen stof begint in kolom 4`).toBeLessThanOrEqual(1);
    expect(Math.abs(m.k[4][2] - m.rechts), `${breedte}: rij 1 tot de rechterrand`).toBeLessThanOrEqual(1);
    expect(Math.abs(m.k[8][2] - m.rechts), `${breedte}: rij 2 tot de rechterrand`).toBeLessThanOrEqual(1);
    // de tekening is even breed als een stoffoto in die rij
    const t = await page.evaluate(() => [document.querySelector('.stof-eigen-tekening').getBoundingClientRect().width, document.querySelectorAll('.stof-kaart img')[5].getBoundingClientRect().width]);
    expect(Math.abs(t[0] - t[1]), `${breedte}: tekening even breed als een stoffoto (${t})`).toBeLessThanOrEqual(1);
  }
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
  await kies(page, 'Vos');
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

  test('bestandsveld zonder JavaScript: de gewone weergave van de browser (met de gekozen naam), geen losse knop', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
    await page.goto('/contact#formulier');
    await page.locator(`input[name="box_thema"][value="${EIGEN}"]`).check({ force: true });
    await expect(page.locator('.eigen-foto-knop')).toBeHidden();
    const h = await page.locator('input[name="stof_foto"]').evaluate(i => i.getBoundingClientRect().height);
    expect(h, 'echte bestandsknop zichtbaar en 44 px').toBeGreaterThanOrEqual(44);
  });

  test('een ongeldige link bij een eigen stof blokkeert niet na wisselen van thema; de Worker krijgt het (controle ronde 1)', async ({ page }) => {
    await nepMail(page, 'ok');
    await page.goto('/contact?onderwerp=kraamcadeaubox#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
    await page.locator(`input[name="box_thema"][value="${EIGEN}"]`).check({ force: true });
    await page.locator('input[name="stof_link"]').fill('www.stof.nl');
    await page.locator('input[name="box_thema"][value="Giraf"]').check({ force: true });
    await expect(blok(page)).toBeHidden();
    await vulVerplicht(page);
    expect(await page.locator('form.formulier').evaluate(f => f.checkValidity()), 'de browser houdt het formulier niet tegen').toBe(true);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
  });

  test('een ongeldige link bij een eigen stof: de browser laat hem door, de Worker stuurt terug met reden=link', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
    await nepMail(page, 'ok');
    await page.goto('/contact#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
    await page.locator(`input[name="box_thema"][value="${EIGEN}"]`).check({ force: true });
    await page.locator('input[name="stof_link"]').fill('www.stof.nl');
    await vulVerplicht(page);
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/contact\?verzonden=fout&reden=link#formulier$/);
  });
});
