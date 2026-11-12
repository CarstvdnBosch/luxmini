// Brief 2026-11-06 (homepage, menu, overgang, kraamcadeauboxen en formulier zoals Stock): nieuwe kernpaden (blokkerend).
import { test, expect } from './hulp.js';

const GROEPEN = ['Kraamcadeaubox', 'Prematuurkleding', 'Babynest', 'Iets op maat laten maken']; // Iets op maat: brief 2026-11-11-c5-babymaten
const zichtbareGroepen = page => page.locator('form .groep').evaluateAll(gs => gs.filter(g => getComputedStyle(g).display !== 'none').map(g => g.dataset.groep));

/* ---------- Formulier: vooraf invullen en groepen per onderwerp ---------- */
test('formulier: vooraf ingevuld met onderwerp, formaat en thema', async ({ page }) => {
  await page.goto('/contact?onderwerp=kraamcadeaubox&formaat=50&thema=wilde-blaadjes#formulier');
  await expect(page.locator('select[name="onderwerp"]')).toHaveValue('Kraamcadeaubox');
  await expect(page.locator('input[name="box_formaat"][value="50"]')).toBeChecked();
  await expect(page.locator('input[name="box_thema"][value="Wilde blaadjes"]')).toBeChecked(); // keuzekaarten (brief 2026-11-11-c7-stofkeuze)
  expect(await page.evaluate(() => document.activeElement === document.body), 'er wordt niet automatisch gefocust').toBe(true);
  for (const [w, verwacht] of [['prematuurkleding', 'Prematuurkleding'], ['babynest', 'Babynest']]) {
    await page.goto(`/contact?onderwerp=${w}#formulier`);
    await expect(page.locator('select[name="onderwerp"]')).toHaveValue(verwacht);
    expect(await zichtbareGroepen(page)).toEqual([verwacht]);
  }
});

test('formulier: onbekende waarden veranderen niets en komen niet in de pagina', async ({ page }) => {
  await page.goto('/contact?onderwerp=x&formaat=99&thema=%3Cscript%3Ealert(1)%3C%2Fscript%3E#formulier');
  await expect(page.locator('select[name="onderwerp"]')).toHaveValue('Kraamcadeaubox'); // de eerste keuze, zoals zonder adres
  await expect(page.locator('input[name="box_formaat"]:checked')).toHaveCount(0);
  await expect(page.locator('input[name="box_thema"][value=""]')).toBeChecked(); // "Nog niet gekozen"
  await expect(page.locator('input[name="box_thema"]:checked')).toHaveCount(1);
  expect(await page.content()).not.toContain('alert(1)');
});

test('formulier: per onderwerp alleen de eigen groep zichtbaar', async ({ page }) => {
  await page.goto('/contact#formulier');
  for (const o of [...GROEPEN, 'Iets anders']) {
    await page.locator('select[name="onderwerp"]').selectOption(o);
    expect(await zichtbareGroepen(page), `zichtbare groepen bij ${o}`).toEqual(GROEPEN.includes(o) ? [o] : []);
  }
  // kraamcadeaubox: vier formaten (keuzekaartjes van minstens 44 px), negen thema's plus een eigen stof
  await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
  const kaarten = await page.locator('.keuze-kaart:has(input[name="box_formaat"])').evaluateAll(ks => ks.map(k => [k.querySelector('input').value, Math.round(k.getBoundingClientRect().height), Math.round(k.querySelector('input').getBoundingClientRect().height)]));
  expect(kaarten.map(k => k[0])).toEqual(['35', '50', '65', '80']);
  for (const [, h, ih] of kaarten) { expect(h).toBeGreaterThanOrEqual(44); expect(ih).toBeGreaterThanOrEqual(44); }
  const themas = await page.locator('input[name="box_thema"]').evaluateAll(os => os.map(o => o.value).filter(Boolean));
  expect(themas).toEqual(['Giraf', 'Vos', 'Tulp', 'Walvis', 'Wilde blaadjes', 'Framboos', 'Regenboog', 'Wilgentakjes', 'Blaadjes en bloemen', 'Een eigen stof of kleur']);
  // alle groepsvelden zijn optioneel; verplicht blijven naam, e-mail en bericht
  expect(await page.locator('form .groep [required]').count()).toBe(0);
  expect(await page.locator('form [required]').evaluateAll(es => es.map(e => e.name))).toEqual(['bericht', 'naam', 'email']);
  // volgorde: onderwerp, groepen, bericht, naam, e-mail, telefoon
  const volgorde = await page.locator('form').evaluate(f => [...f.querySelectorAll('select[name="onderwerp"], fieldset.groep, textarea, input[name="naam"], input[name="email"], input[name="telefoon"]')].map(e => e.name || e.dataset.groep));
  expect(volgorde).toEqual(['onderwerp', ...GROEPEN, 'bericht', 'naam', 'email', 'telefoon']);
  // elk zichtbaar veld heeft een label en tekst van minstens 16 px
  for (const veld of await page.locator('form input:not([name=website]):not([type=radio]), form select, form textarea').all()) {
    if (!(await veld.isVisible())) continue;
    await expect(veld).toHaveAccessibleName(/\S/);
    expect(parseFloat(await veld.evaluate(e => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  }
});

// Brief 2026-11-11-c5-babymaten: maatkeuzes per onderwerp (besluit Carst 11 nov.); vrij veld alleen bij "Anders"
test('formulier: maatkeuzes per onderwerp en het vrije veld alleen bij anders', async ({ page }) => {
  await page.goto('/contact#formulier');
  const keuzes = naam => page.locator(`select[name="${naam}"] option`).evaluateAll(os => os.map(o => [o.value, o.textContent.trim()]));
  const onderwerp = page.locator('select[name="onderwerp"]');
  await onderwerp.selectOption('Kraamcadeaubox');
  expect(await keuzes('box_maat')).toEqual([['', 'Weet ik nog niet'], ...['44', '46', '48', '50', '56', '62', '68', '74'].map(m => [m, `Maat ${m}`])]);
  await expect(page.locator('select[name="box_maat"]')).toBeVisible();
  for (const [o, naam, maten, anders, vrij] of [
    ['Prematuurkleding', 'prem_maat', ['32', '38', '44', '46', '48', '50'], 'Anders / gewicht', 'prem_maat_anders'],
    ['Iets op maat laten maken', 'op_maat', ['32', '38', '44', '46', '48', '50', '56', '62', '68', '74', '80', '86'], 'Anders', 'op_maat_anders'],
  ]) {
    await onderwerp.selectOption(o);
    const kies = page.locator(`select[name="${naam}"]`), veld = page.locator(`input[name="${vrij}"]`);
    await expect(kies).toBeVisible();
    expect(await keuzes(naam)).toEqual([['', 'Nog niet gekozen'], ...maten.map(m => [m, `Maat ${m}`]), ['anders', anders]]);
    await expect(veld).toBeHidden();
    await kies.selectOption('anders');
    await expect(veld).toBeVisible();
    await expect(veld).toHaveAccessibleName(/\S/);
    expect(Math.round((await veld.boundingBox()).height)).toBeGreaterThanOrEqual(44);
    expect(Math.round((await kies.boundingBox()).height)).toBeGreaterThanOrEqual(44);
    await kies.selectOption(maten[1]);
    await expect(veld).toBeHidden();
  }
  expect(await page.locator('form [required]').evaluateAll(es => es.map(e => e.name))).toEqual(['bericht', 'naam', 'email']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'niet horizontaal scrollen').toBe(true);
});

// Story 16 (Carst 12 nov., brief 2026-11-12-productrij-carrousel-en-maten): maat 46 komt echt in de mail aan Carien.
// De testserver bouwt de mail met src/contact.js en laat het versturen mislukken als de regel er niet in staat (x-testmail-bevat).
test('formulier: kraamcadeaubox met maat 46 geeft "Kledingmaat: maat 46" in de mail', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testmail': 'ok', 'x-testmail-bevat': encodeURIComponent('\nKledingmaat: maat 46\n') });
  await page.goto('/contact?onderwerp=kraamcadeaubox#formulier');
  const maat = page.locator('select[name="box_maat"]');
  await expect(maat).toBeVisible();
  const opmaak = await maat.evaluate(s => [parseFloat(getComputedStyle(s).fontSize), s.getBoundingClientRect().height]);
  expect(opmaak[0], 'select 16 px').toBeGreaterThanOrEqual(16);
  expect(Math.round(opmaak[1]), 'select minstens 44 px hoog').toBeGreaterThanOrEqual(44);
  await maat.selectOption('46');
  await page.locator('textarea[name="bericht"]').fill('Graag een box');
  await page.locator('input[name="naam"]').fill('Test');
  await page.locator('input[name="email"]').fill('test@example.nl');
  await page.locator('button.verstuur').click();
  await expect(page).toHaveURL(/\/bedankt$/);
});

test('formulier: op 390 x 844 staat "002 — Stuur een bericht" onder de balk', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 x 844');
  await page.goto('/contact?onderwerp=kraamcadeaubox&formaat=50#formulier');
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => { const l = document.querySelector('#formulier .label').getBoundingClientRect(), b = document.querySelector('.balk').getBoundingClientRect();
    return { label: l.top, onder: l.bottom, balk: document.querySelector('.balk').classList.contains('zichtbaar') ? b.bottom : 0 }; });
  expect(m.label, 'label onder de balk').toBeGreaterThanOrEqual(m.balk - 1);
  expect(m.onder, 'label in beeld').toBeLessThanOrEqual(844);
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('formulier: versturen kan met verborgen groepen', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
    let verstuurd = null;
    await page.route('**/api/contact', async r => { verstuurd = r.request().postData(); await r.fulfill({ status: 303, headers: { location: '/bedankt' } }); });
    await page.goto('/contact#formulier');
    await page.locator('select[name="onderwerp"]').selectOption('Babynest');
    expect(await zichtbareGroepen(page)).toEqual(['Babynest']);
    await page.locator('textarea[name="bericht"]').fill('Graag een babynest');
    await page.locator('input[name="naam"]').fill('Test');
    await page.locator('input[name="email"]').fill('test@example.nl');
    await page.locator('button.verstuur').click();
    await expect(page).toHaveURL(/\/bedankt$/);
    expect(verstuurd).toMatch(/name="onderwerp"\r\n\r\nBabynest\r\n/); // multipart/form-data (enctype, brief 2026-11-11-c7-stofkeuze)
  });
});

/* ---------- Kraamcadeauboxen: acht producten en de stoffenrij (speenkoord erbij: wens Carien 11 nov., brief 2026-11-11-c2) ---------- */
test('kraamcadeauboxen: acht producten met de juiste prijsregels', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const p = await page.locator('#in-de-box .producten > li').evaluateAll(ls => ls.map(l => [l.querySelector('.product-naam').textContent.replace(/­/g, ''), l.querySelector('.product-regel').textContent.replace(/\s+/g, ' '), !!l.querySelector('img'), !!l.querySelector('svg')]));
  expect(p).toEqual([['Knuffel', 'vanaf € 35', true, false], ['Swaddle', 'vanaf € 35', true, false], ['Broekje', 'vanaf € 35', true, false], ['Sjaaltje', 'vanaf € 50', true, false],
    ['Shirtje', 'vanaf € 65', true, false], ['Douchehandschoen', 'vanaf € 65', false, true], ['Bijtring', 'in de box van € 80', true, false], ['Speenkoord', 'in de box van € 80', true, false]]);
  if (info.project.name === 'desktop') { // desktop: alle acht naast elkaar, zonder scrollen
    const rij = await page.locator('#in-de-box .producten').evaluate(u => [u.scrollWidth - u.clientWidth, new Set([...u.children].map(l => Math.round(l.getBoundingClientRect().top))).size]);
    expect(rij).toEqual([0, 1]);
  }
  // de prijskaarten linken met onderwerp en formaat naar het formulier
  const links = await page.locator('#formaten .formaat a.pijl').evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(links).toEqual(['35', '50', '65', '80'].map(f => `contact.html?onderwerp=kraamcadeaubox&formaat=${f}#formulier`));
});

test('kraamcadeauboxen: stoffenrij met de negen namen van het raster, scrollbaar en met het toetsenbord bereikbaar', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const rij = page.locator('#in-de-box .stoffen');
  await expect(rij).toHaveAttribute('role', 'region');
  await expect(rij).toHaveAttribute('aria-label', 'Stoffen');
  await expect(rij).toHaveAttribute('tabindex', '0');
  const raster = await page.locator('#themas .themacarrousel figcaption').allTextContents();
  const stoffen = await rij.locator('.stof-naam').allTextContents();
  expect(stoffen).toEqual(raster);
  expect(stoffen).toHaveLength(9);
  const maten = await rij.locator('img').evaluateAll(is => is.map(i => Math.max(i.getBoundingClientRect().width, i.getBoundingClientRect().height)));
  for (const m of maten) expect(m, 'tegel hooguit 240 px').toBeLessThanOrEqual(240);
  expect(await rij.evaluate(r => r.scrollWidth > r.clientWidth), 'de rij scrolt horizontaal').toBe(true);
  await rij.focus();
  await expect(rij).toBeFocused();
  if (info.project.name === 'desktop') {
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    await expect.poll(() => rij.evaluate(r => r.scrollLeft), { message: 'pijltoetsen scrollen de rij' }).toBeGreaterThan(0);
  }
  const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(breed, 'de pagina zelf scrolt niet horizontaal').toBeLessThanOrEqual(0);
});

/* ---------- Menu-rij naast de burger ---------- */
test('menu: de rij verschijnt bij aanwijzen en Tab, verdwijnt met Esc; een klik opent het menu', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen met een muis (vanaf 1240 px)');
  await page.goto('/kraamcadeauboxen');
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(300);
  const rij = page.locator('nav.menu-rij');
  await expect(rij).toBeHidden();
  await page.locator('.burger').hover();
  await expect(rij).toBeVisible({ timeout: 900 });
  await expect(rij.locator('a')).toHaveText(['Werkwijze', 'Kraamcadeauboxen', 'Prematuurkleding', 'Babynest', 'Inspiratie', 'Contact']);
  const m = await page.evaluate(() => { const as = [...document.querySelectorAll('.menu-rij a')].map(a => a.getBoundingClientRect());
    const logo = [...document.querySelectorAll('.balk .links img')].map(i => i.getBoundingClientRect()).filter(r => r.width)[0];
    return { regels: new Set(as.map(a => Math.round(a.top))).size, links: as[0].left, logo: logo.right, ariaHidden: !!document.querySelector('.menu-rij').closest('[aria-hidden="true"]') }; });
  expect(m.regels, 'op één regel').toBe(1);
  expect(m.links, 'geen overlap met het logo').toBeGreaterThan(m.logo);
  expect(m.ariaHidden, 'niet binnen aria-hidden').toBe(false);
  // van de burger naar de links: de rij blijft staan
  await page.locator('.menu-rij a').nth(2).hover();
  await page.waitForTimeout(600);
  await expect(rij).toBeVisible();
  // weg met de muis: weg
  await page.mouse.move(700, 600);
  await expect(rij).toBeHidden({ timeout: 1500 });
  // toetsenbord: focus op de burger toont de rij, Tab gaat de links in, Esc verbergt
  await page.locator('.burger').focus();
  await expect(rij).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(rij.locator('a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(rij).toBeHidden();
  // klik op de burger: het menu over het hele scherm, zonder rij
  await page.locator('.burger').click();
  await expect(page.locator('.burger')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.menu-scherm')).toBeVisible();
  await expect(rij).toBeHidden();
});

test('menu: op touch verschijnt geen rij', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'alleen op touch');
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.locator('.burger').tap();
  await expect(page.locator('nav.menu-rij')).toBeHidden();
  await expect(page.locator('.menu-scherm')).toBeVisible();
});

/* ---------- Pagina-overgang ---------- */
test('overgang: vlak van boven naar beneden, op de nieuwe pagina verder weg; terug-knop zonder vlak', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  const page = await ctx.newPage();
  const lees = () => page.evaluate(() => { const o = document.querySelector('.overgang'); return [new DOMMatrix(getComputedStyle(o).transform).m42, getComputedStyle(o).visibility]; });
  await page.goto('/');
  // geen overgang bij een anker op dezelfde pagina, mailto of een nieuwe tab
  for (const [href, extra] of [['#technieken', ''], ['mailto:info.luxmini@gmail.com', ''], ['werkwijze.html', '_blank']]) {
    // main.js beslist in zijn klikafhandeling (op document); daarna houdt een luisteraar op window de echte navigatie tegen,
    // zodat de test niet van pagina wisselt. De klasse 'weg' wordt meteen in de klik gezet, dus direct na de klik lezen.
    const weg = await page.evaluate(([h, t]) => { const a = document.createElement('a'); a.href = h; if (t) a.target = t; a.textContent = 'x'; document.body.appendChild(a);
      const stop = e => e.preventDefault(); window.addEventListener('click', stop); a.click(); window.removeEventListener('click', stop); a.remove();
      return document.querySelector('.overgang').classList.contains('weg'); }, [href, extra]);
    expect(weg, `geen overgang bij ${href} ${extra}`).toBe(false);
  }
  await page.locator('.site-header .menu a[href="werkwijze.html"]').click();
  await page.waitForTimeout(450);
  const [yWeg, zichtWeg] = await lees();
  expect(zichtWeg).toBe('visible');
  expect(yWeg, 'vlak komt van boven').toBeLessThan(0);
  await page.waitForURL(/\/werkwijze/);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);
  const [yBinnen] = await lees();
  expect(yBinnen, 'vlak schuift naar beneden weg').toBeGreaterThan(0);
  await page.waitForTimeout(1200);
  expect((await lees())[1], 'vlak weg na de overgang').toBe('hidden');
  await page.goBack();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  expect((await lees())[1], 'terug-knop: geen vlak').toBe('hidden');
  await ctx.close();
});

test('overgang: geen vlak en geen verschuiving bij minder beweging', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  await page.goto('/contact'); // hulp.js zet minder beweging aan
  await page.locator('.site-header .menu a[href="werkwijze.html"]').click();
  await expect(page).toHaveURL(/\/werkwijze/);
  await page.waitForLoadState('load');
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.overgang')).display)).toBe('none');
  expect(await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('main')).transform).m42)).toBe(0);
});

/* ---------- Controle ronde 1: drieluik en Technieken blijven binnen hun vak ---------- */
const SCHERMEN_MUIS = [[1025, 800], [1280, 720], [1440, 900]];

test('drieluik: aanwijzen van Babynest laat kolom 1 en 2 exact staan (±1 px)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen met een muis');
  for (const [b, h] of SCHERMEN_MUIS) {
    await page.setViewportSize({ width: b, height: h });
    await page.goto('/');
    await page.locator('#producten').evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.mouse.move(5, h - 5);
    await page.waitForTimeout(300);
    const plek = () => page.evaluate(() => ['#kraamcadeauboxen h2', '#prematuurkleding h2', '#producten'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.top, r.left, r.height]; }));
    const voor = await plek();
    const k = await page.locator('#babynest').boundingBox();
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2, { steps: 3 });
    await page.waitForTimeout(400);
    const tijdens = await plek();
    voor.forEach((v, i) => v.forEach((x, n) => expect(Math.abs(tijdens[i][n] - x), `${b} px: ${['kop kolom 1', 'kop kolom 2', 'drieluik'][i]} verschuift`).toBeLessThanOrEqual(1)));
    // de ingelijste babynestfoto valt binnen de kolom en is hooguit 324 px breed
    await page.waitForTimeout(800);
    const nest = await page.evaluate(() => { const f = document.querySelector('#babynest .nest-lijst').getBoundingClientRect(), k = document.querySelector('#babynest').getBoundingClientRect(), t = document.querySelector('#babynest .pijl').getBoundingClientRect();
      return { binnen: f.top >= k.top - 1 && t.bottom <= k.bottom + 1, breed: f.width }; });
    expect(nest.binnen, `${b} px: babynestfoto en tekst binnen de kolom`).toBe(true);
    expect(nest.breed).toBeLessThanOrEqual(324.5);
  }
});

test('Technieken: bij aanwijzen vallen productregel en foto\'s binnen de sectie', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen met een muis');
  for (const [b, h] of SCHERMEN_MUIS) {
    await page.setViewportSize({ width: b, height: h });
    await page.goto('/');
    await page.locator('#technieken .hoverlijst').evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    for (let i = 1; i <= 4; i++) {
      const a = page.locator(`#technieken .hoverlijst li:nth-child(${i}) a`);
      const r = await a.boundingBox();
      await page.mouse.move(r.x + r.width / 2, r.y + r.height - 2, { steps: 2 }); // onderaan de naam: foto's het verst omlaag
      await page.waitForTimeout(1100);
      const m = await page.evaluate(() => { const s = document.querySelector('#technieken').getBoundingClientRect();
        const delen = ['.sfeer.aan .productregel', '.sfeer.aan .groot', '.sfeer.aan .klein-beeld'].map(q => document.querySelector('#technieken ' + q).getBoundingClientRect().bottom);
        return { onder: s.bottom, delen }; });
      m.delen.forEach((y, n) => expect(y, `${b} px, item ${i}: ${['productregel', 'grote foto', 'kleine foto'][n]} valt onder de sectie`).toBeLessThanOrEqual(m.onder));
      // ronde 5: de pijl-link "Zo personaliseert Carien" vervaagt niet bij aanwijzen
      expect(await page.locator('#technieken .sectie > .pijl').evaluate(a => getComputedStyle(a).opacity), `${b} px, item ${i}: pijl-link vervaagt`).toBe('1');
    }
  }
});

/* ---------- Ontwerpgate ronde 1 ---------- */
test('foto\'s over de volle breedte (003 Inspiratie, statement) worden op tablet en mobiel niet vergroot', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'desktop toetst de sitecontrole');
  for (const pad of ['/', '/kraamcadeauboxen']) {
    await page.goto(pad);
    const uit = await page.evaluate(async () => {
      const r = [];
      for (const i of document.querySelectorAll('main .statement > img')) {
        i.loading = 'eager'; i.scrollIntoView({ block: 'center', behavior: 'instant' }); await i.decode().catch(() => {});
        const bron = new Image(); bron.src = i.currentSrc; await bron.decode().catch(() => {});
        const b = i.getBoundingClientRect();
        r.push([i.currentSrc.split('/').pop(), Math.max(b.width / bron.naturalWidth, b.height / bron.naturalHeight)]);
      }
      return r; });
    expect(uit.length, `${pad}: er staat een foto over de volle breedte`).toBeGreaterThan(0);
    for (const [bestand, schaal] of uit) expect(schaal, `${pad}: ${bestand} vergroot`).toBeLessThanOrEqual(1.01);
  }
});

test('minder beweging: de kleurlaag, de bovenkant en de balk wisselen direct van kleur', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  await page.goto('/'); // hulp.js zet minder beweging aan
  const duur = await page.evaluate(() => ['.achtergrond', '.balk', '.hero-kleur'].map(s => getComputedStyle(document.querySelector(s)).transitionDuration));
  expect(duur).toEqual(['0s', '0s', '0s']);
  await page.locator('#technieken').evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 100));
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const na = await page.evaluate(() => getComputedStyle(document.querySelector('.achtergrond')).backgroundColor);
  expect(na, 'de laag is direct wit (zonder overgang)').toBe('rgb(255, 255, 255)');
});

/* ---------- Feedback Carst 6 nov. 14:28 ---------- */
test('F1 hero: meebewegen zoals Stock (absolute muispositie /20 /15 /10, kanteling tot 12,5 graden)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen met een muis');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(1500);
  const rust = await page.locator('.hero .tegel').evaluateAll(ts => ts.map(t => getComputedStyle(t).transform));
  expect(rust, 'beginstand zonder transform').toEqual(Array(6).fill('none'));
  await page.mouse.move(1430, 890, { steps: 4 });
  await page.waitForTimeout(1500); // 1 s easeOut
  const m = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.hero .tegel')].map(t => {
    const n = [...t.classList].find(k => /^t\d$/.test(k)); const s = t.style.transform;
    const tr = s.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px/); const ry = s.match(/rotateY\(([-\d.]+)deg/), rx = s.match(/rotateX\(([-\d.]+)deg/);
    return [n, [+tr[1], +tr[2], +rx[1], +ry[1]]]; })));
  const verwacht = { t2: [20, -1], t1: [15, -1], t3: [10, -1], t4: [20, 1], t5: [10, 1], t6: [15, 1] };
  for (const [n, [k, teken]] of Object.entries(verwacht)) {
    expect(m[n][0], `${n} x`).toBeCloseTo(1430 / k, 0);
    expect(m[n][1], `${n} y`).toBeCloseTo(teken * 890 / k, 0);
    expect(Math.abs(m[n][2]), `${n} rotateX`).toBeLessThanOrEqual(12.5);
    expect(Math.abs(m[n][3]), `${n} rotateY`).toBeLessThanOrEqual(12.5);
    expect(Math.abs(m[n][3]), `${n} rotateY bijna max`).toBeGreaterThan(12);
  }
  // naar de header of het menu bewegen: de foto's blijven staan (geen terugzwaai)
  await page.mouse.move(1300, 40, { steps: 4 });
  await page.waitForTimeout(300);
  expect(await page.locator('.hero .tegel').first().evaluate(t => t.style.transform), 'tegel blijft verschoven boven de header').not.toBe('');
  // de kop blijft boven de foto's
  const z = await page.evaluate(() => [getComputedStyle(document.querySelector('.hero-tekst')).zIndex, ...[...document.querySelectorAll('.hero .tegel')].map(t => getComputedStyle(t).zIndex)].map(Number));
  expect(z[0]).toBeGreaterThan(Math.max(...z.slice(1)));
  await ctx.close();
});

test('F2: geen witte scheidingslijn in 001 — Producten (ook niet tussen de kolommen, feedback Carst 7 nov.)', async ({ page }) => {
  await page.goto('/');
  const lijnen = await page.evaluate(() => { const k = document.querySelector('#producten .kern-kolom:nth-child(2)');
    return ['::before', '::after'].map(p => getComputedStyle(k, p).display); });
  expect(lijnen, 'geen witte lijnen tussen de kolommen').toEqual(['none', 'none']);
});

test('F3: label 002 — Handwerk en vier namen waarin elk woord één keer voorkomt', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#technieken .label')).toHaveText(/002\s—\sHandwerk/);
  const namen = await page.locator('#technieken .hoverlijst ul a').evaluateAll(as => as.map(a => a.childNodes[0].textContent.trim()));
  expect(namen).toEqual(['Warm en eigen', 'Rustig en praktisch', 'Klein en precies', 'Speels en levendig']);
  const woorden = namen.join(' ').split(' ').filter(w => w !== 'en');
  expect(new Set(woorden).size, 'elk woord één keer').toBe(woorden.length);
});

test('F4: de thema-knoppen schuiven één set; aan het begin staat "vorige" uit', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'knoppen alleen met een muis');
  await page.goto('/kraamcadeauboxen#themas');
  const vorige = page.locator('.carrousel-knop[aria-controls="themacarrousel"][data-richting="-1"]'), volgende = page.locator('.carrousel-knop[aria-controls="themacarrousel"][data-richting="1"]');
  const links = () => page.locator('.themacarrousel li').nth(3).evaluate(l => Math.abs(Math.round(l.getBoundingClientRect().left - document.querySelector('#themas .label').getBoundingClientRect().left)));
  await expect(vorige).toHaveAttribute('aria-disabled', 'true'); // aria-disabled: de focus blijft op de knop
  await volgende.click();
  await expect.poll(links).toBeLessThanOrEqual(1);
  await volgende.focus();
  await volgende.click();
  await expect(volgende).toHaveAttribute('aria-disabled', 'true');
  await expect(volgende, 'focus blijft op de knop').toBeFocused();
  await vorige.click();
  await expect.poll(links).toBeLessThanOrEqual(1);
  // Home en End in de rij: eerste en laatste set
  const rij = page.locator('.themacarrousel');
  await rij.focus();
  await page.keyboard.press('End');
  await expect.poll(() => rij.evaluate(r => r.scrollWidth - r.clientWidth - r.scrollLeft)).toBeLessThanOrEqual(2);
  await page.keyboard.press('Home');
  await expect.poll(() => rij.evaluate(r => r.scrollLeft)).toBeLessThanOrEqual(2);
});

/* ---------- C6 (feedback Carst 11 nov.): de stoffenrij volgt het themapatroon, zonder scrollbalk ---------- */
test('C6: stoffenrij zonder scrollbalk, met knoppen (muis), aria-disabled en Home/End', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen#in-de-box');
  const rij = page.locator('#stoffenrij');
  await expect(rij).toHaveClass(/\bcarrousel\b/);
  await expect(rij).toHaveAttribute('role', 'region');
  await expect(rij).toHaveAttribute('aria-label', 'Stoffen');
  await expect(rij).toHaveAttribute('tabindex', '0');
  // geen zichtbare scrollbalk: geen ruimte voor een balk en scrollbar-width none
  const balk = await rij.evaluate(r => [r.offsetHeight - r.clientHeight, getComputedStyle(r).scrollbarWidth, getComputedStyle(r).scrollSnapType]);
  expect(balk[0], 'geen hoogte voor een scrollbalk').toBe(0);
  expect(balk[1]).toBe('none');
  expect(balk[2]).toMatch(/x mandatory/);
  // binnen de rand: de eerste stof begint onder het label van de sectie
  const eerste = await page.evaluate(() => Math.round(document.querySelector('#stoffenrij li').getBoundingClientRect().left - document.querySelector('#in-de-box .label').getBoundingClientRect().left));
  expect(Math.abs(eerste), 'eerste stof onder het label').toBeLessThanOrEqual(1);
  const vorige = page.locator('.carrousel-knop[aria-controls="stoffenrij"][data-richting="-1"]'), volgende = page.locator('.carrousel-knop[aria-controls="stoffenrij"][data-richting="1"]');
  await expect(vorige).toHaveAttribute('aria-label', 'Vorige stoffen');
  await expect(volgende).toHaveAttribute('aria-label', 'Volgende stoffen');
  if (info.project.name === 'desktop') {
    for (const k of [vorige, volgende]) { const b = await k.boundingBox(); expect(b.width).toBeGreaterThanOrEqual(44); expect(b.height).toBeGreaterThanOrEqual(44); }
    await expect(vorige).toHaveAttribute('aria-disabled', 'true');
    await expect(volgende).toHaveAttribute('aria-disabled', 'false');
    // "volgende" schuift een set: de eerste tegel die niet helemaal binnen de rand stond, staat daarna onder het label
    // (of de rij staat aan het eind, als de laatste set korter is)
    const voor = await rij.evaluate(r => { const ul = r.querySelector('ul'), rechts = r.getBoundingClientRect().right - parseFloat(getComputedStyle(ul).paddingRight);
      return [...r.querySelectorAll('li')].findIndex(l => l.getBoundingClientRect().right > rechts + 1); });
    expect(voor, 'er staan stoffen buiten de rand').toBeGreaterThan(0);
    await volgende.click();
    await expect.poll(() => page.evaluate(i => { const r = document.querySelector('#stoffenrij');
      const onder = Math.abs(document.querySelectorAll('#stoffenrij li')[i].getBoundingClientRect().left - document.querySelector('#in-de-box .label').getBoundingClientRect().left) <= 1;
      return onder || r.scrollWidth - r.clientWidth - r.scrollLeft <= 2; }, voor), { message: 'een set verder' }).toBe(true);
    // nooit voorbij een tegel die nog niet helemaal in beeld stond
    expect(await page.evaluate(i => document.querySelectorAll('#stoffenrij li')[i].getBoundingClientRect().left - document.querySelector('#in-de-box .label').getBoundingClientRect().left, voor), 'geen stof overgeslagen').toBeGreaterThanOrEqual(-1);
    await expect(vorige).toHaveAttribute('aria-disabled', 'false');
    await volgende.focus();
    for (let i = 0; i < 3 && (await volgende.getAttribute('aria-disabled')) !== 'true'; i++) { await volgende.click(); await page.waitForTimeout(700); }
    await expect(volgende).toHaveAttribute('aria-disabled', 'true');
    await expect(volgende, 'focus blijft op de knop').toBeFocused();
  } else {
    await expect(vorige, 'op touch geen knoppen (vegen)').toBeHidden();
    await expect(volgende).toBeHidden();
  }
  // Home en End in de rij: eerste en laatste stof
  await rij.focus();
  await page.keyboard.press('End');
  await expect.poll(() => rij.evaluate(r => r.scrollWidth - r.clientWidth - r.scrollLeft)).toBeLessThanOrEqual(2);
  await page.keyboard.press('Home');
  await expect.poll(() => rij.evaluate(r => r.scrollLeft)).toBeLessThanOrEqual(2);
  // tegels nooit groter dan het bestand (240 px) en de pagina scrolt niet horizontaal
  for (const m of await rij.locator('img').evaluateAll(is => is.map(i => i.getBoundingClientRect().width))) expect(m).toBeLessThanOrEqual(240);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 'de pagina scrolt niet horizontaal').toBeLessThanOrEqual(0);
});

test('C6: nergens een zichtbare horizontale scrollbalk in carrousels (kraamcadeauboxen, werkwijze)', async ({ page }, info) => {
  for (const pad of ['/kraamcadeauboxen', '/werkwijze']) {
    await page.goto(pad);
    const rijen = await page.locator('.carrousel').evaluateAll(rs => rs.map(r => [r.id, r.offsetHeight - r.clientHeight, getComputedStyle(r).scrollbarWidth,
      document.querySelectorAll(`.carrousel-knop[aria-controls="${r.id}"]`).length]));
    expect(rijen.length, `${pad}: carrousels`).toBeGreaterThan(0);
    for (const [id, h, w, knoppen] of rijen) {
      expect(h, `${pad} #${id}: geen scrollbalk`).toBe(0);
      expect(w, `${pad} #${id}`).toBe('none');
      expect(knoppen, `${pad} #${id}: vorige en volgende`).toBe(2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${pad}: geen horizontaal scrollen`).toBeLessThanOrEqual(0);
  }
});

/* ---------- Controle ronde 6: ankers landen goed na scrollen en na een pagina-overgang (zonder minder beweging) ----------
   Uitbreiding van "vaste balk bedekt geen kop na een ankerlink" (mobiel-ontwerp.spec.js, alleen telefoons) naar alle schermen:
   #themas en #werkwijze op Kraamcadeauboxen, via een link op de pagina en via een link vanaf de homepage (pagina-overgang). */
for (const anker of ['themas', 'werkwijze']) {
  for (const manier of ['link op de pagina', 'na pagina-overgang']) {
    test(`anker #${anker} (${manier}): kop onder de balk en het juiste label`, async ({ browser }, info) => {
      const ctx = await browser.newContext({ ...info.project.use, baseURL: info.project.use.baseURL || 'http://127.0.0.1:4173' });
      await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
      const page = await ctx.newPage();
      const klik = async href => page.evaluate(h => { const a = document.createElement('a'); a.href = h; a.textContent = 'x'; a.style.cssText = 'position:fixed;left:0;top:200px;';
        document.body.appendChild(a); a.click(); a.remove(); }, href);
      if (manier === 'link op de pagina') {
        await page.goto('/kraamcadeauboxen');
        await page.waitForTimeout(600);
        await page.evaluate(() => window.scrollTo(0, 400)); // eerst een stukje scrollen, zoals een bezoeker
        await page.waitForTimeout(400);
        await klik(`#${anker}`);
      } else {
        await page.goto('/');
        await page.waitForTimeout(600);
        await klik(`kraamcadeauboxen.html#${anker}`);
        await page.waitForURL(new RegExp(`kraamcadeauboxen(\\.html)?#${anker}$`));
        await page.waitForLoadState('load');
      }
      await page.waitForTimeout(2200); // overgang (1 s) en zacht scrollen uitlopen
      const m = await page.evaluate(id => { const k = document.querySelector(`#${id} .label`).getBoundingClientRect(), b = document.querySelector('.balk');
        return { sectie: Math.round(document.getElementById(id).getBoundingClientRect().top), marge: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
          kop: Math.round(k.top), onder: Math.round(k.bottom), balk: b.classList.contains('zichtbaar') ? Math.round(b.getBoundingClientRect().bottom) : 0,
          label: b.querySelector('.sectie-label').textContent.replace(/\s+/g, ' ').trim(), verwacht: document.getElementById(id).getAttribute('data-label').replace(/<[^>]+>/g, '').trim() }; }, anker);
      expect(m.kop, `kop van #${anker} onder de balk (balk eindigt op ${m.balk} px)`).toBeGreaterThanOrEqual(m.balk - 1);
      expect(Math.abs(m.sectie - m.marge), `sectie #${anker} begint op de scroll-marge (${m.marge} px), niet op ${m.sectie} px`).toBeLessThanOrEqual(2);
      expect(m.onder, `kop van #${anker} in beeld`).toBeLessThanOrEqual(info.project.use.viewport.height);
      expect(m.label, 'de balk toont de juiste sectie').toBe(m.verwacht);
      await ctx.close();
    });
  }
}

/* ---------- Controle ronde 7: afdrukken zonder eerst te scrollen toont alle foto's ---------- */
test('afdrukken: na beforeprint staan alle foto\'s in 002 en 003 klaar (geen data-src zonder src)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  await page.goto('/kraamcadeauboxen');
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const open = await page.locator('#in-de-box img, #themas img').evaluateAll(is => is.filter(i => i.hasAttribute('data-src') || !i.getAttribute('src')).length);
  expect(open, 'foto\'s zonder src bij afdrukken').toBe(0);
  await expect(page.locator('#in-de-box img, #themas img')).toHaveCount(25); // 7 productfoto's (speenkoord erbij, brief 2026-11-11-c2) + 9 stoffen + 9 thema's
});
