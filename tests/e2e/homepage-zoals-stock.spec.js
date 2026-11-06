// Brief 2026-11-06 (homepage, menu, overgang, kraamcadeauboxen en formulier zoals Stock): nieuwe kernpaden (blokkerend).
import { test, expect } from './hulp.js';

const GROEPEN = ['Kraamcadeaubox', 'Prematuurkleding', 'Babynest'];
const zichtbareGroepen = page => page.locator('form .groep').evaluateAll(gs => gs.filter(g => getComputedStyle(g).display !== 'none').map(g => g.dataset.groep));

/* ---------- Formulier: vooraf invullen en groepen per onderwerp ---------- */
test('formulier: vooraf ingevuld met onderwerp, formaat en thema', async ({ page }) => {
  await page.goto('/contact?onderwerp=kraamcadeaubox&formaat=50&thema=wilde-blaadjes#formulier');
  await expect(page.locator('select[name="onderwerp"]')).toHaveValue('Kraamcadeaubox');
  await expect(page.locator('input[name="box_formaat"][value="50"]')).toBeChecked();
  await expect(page.locator('select[name="box_thema"]')).toHaveValue('Wilde blaadjes');
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
  await expect(page.locator('select[name="box_thema"]')).toHaveValue('');
  expect(await page.content()).not.toContain('alert(1)');
});

test('formulier: per onderwerp alleen de eigen groep zichtbaar', async ({ page }) => {
  await page.goto('/contact#formulier');
  for (const o of [...GROEPEN, 'Iets op maat laten maken', 'Iets anders']) {
    await page.locator('select[name="onderwerp"]').selectOption(o);
    expect(await zichtbareGroepen(page), `zichtbare groepen bij ${o}`).toEqual(GROEPEN.includes(o) ? [o] : []);
  }
  // kraamcadeaubox: vier formaten (keuzekaartjes van minstens 44 px), negen thema's plus een eigen stof
  await page.locator('select[name="onderwerp"]').selectOption('Kraamcadeaubox');
  const kaarten = await page.locator('.keuze-kaart').evaluateAll(ks => ks.map(k => [k.querySelector('input').value, Math.round(k.getBoundingClientRect().height), Math.round(k.querySelector('input').getBoundingClientRect().height)]));
  expect(kaarten.map(k => k[0])).toEqual(['35', '50', '65', '80']);
  for (const [, h, ih] of kaarten) { expect(h).toBeGreaterThanOrEqual(44); expect(ih).toBeGreaterThanOrEqual(44); }
  const themas = await page.locator('select[name="box_thema"] option').evaluateAll(os => os.map(o => o.value).filter(Boolean));
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
    expect(verstuurd).toContain('onderwerp=Babynest');
  });
});

/* ---------- Kraamcadeauboxen: zeven producten en de stoffenrij ---------- */
test('kraamcadeauboxen: zeven producten met de juiste prijsregels', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const p = await page.locator('#formaten .producten > li').evaluateAll(ls => ls.map(l => [l.querySelector('.product-naam').textContent.replace(/­/g, ''), l.querySelector('.product-regel').textContent.replace(/\s+/g, ' '), !!l.querySelector('img'), !!l.querySelector('svg')]));
  expect(p).toEqual([['Knuffel', 'vanaf € 35', true, false], ['Swaddle', 'vanaf € 35', true, false], ['Broekje', 'vanaf € 35', true, false], ['Sjaaltje', 'vanaf € 50', true, false],
    ['Shirtje', 'vanaf € 65', true, false], ['Douchehandschoen', 'vanaf € 65', false, true], ['Bijtring', 'in de box van € 80', true, false]]);
  if (info.project.name === 'desktop') { // desktop: alle zeven naast elkaar, zonder scrollen
    const rij = await page.locator('#formaten .producten').evaluate(u => [u.scrollWidth - u.clientWidth, new Set([...u.children].map(l => Math.round(l.getBoundingClientRect().top))).size]);
    expect(rij).toEqual([0, 1]);
  }
  // de prijskaarten linken met onderwerp en formaat naar het formulier
  const links = await page.locator('#formaten .formaat a.pijl').evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(links).toEqual(['35', '50', '65', '80'].map(f => `contact.html?onderwerp=kraamcadeaubox&formaat=${f}#formulier`));
});

test('kraamcadeauboxen: stoffenrij met de negen namen van het raster, scrollbaar en met het toetsenbord bereikbaar', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const rij = page.locator('#themas .stoffen');
  await expect(rij).toHaveAttribute('role', 'region');
  await expect(rij).toHaveAttribute('aria-label', 'Stoffen');
  await expect(rij).toHaveAttribute('tabindex', '0');
  const raster = await page.locator('#themas .themaraster figcaption').allTextContents();
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
    await page.evaluate(([h, t]) => { const a = document.createElement('a'); a.href = h; if (t) a.target = t; a.textContent = 'x'; document.body.appendChild(a); a.click(); a.remove(); }, [href, extra]);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.querySelector('.overgang').classList.contains('weg')), `geen overgang bij ${href} ${extra}`).toBe(false);
  }
  await page.locator('.site-header .menu a[href="werkwijze.html"]').click();
  await page.waitForTimeout(450);
  const [yWeg, zichtWeg] = await lees();
  expect(zichtWeg).toBe('visible');
  expect(yWeg, 'vlak komt van boven').toBeLessThan(0);
  await page.waitForURL(/\/werkwijze/);
  await page.waitForTimeout(400);
  const [yBinnen] = await lees();
  expect(yBinnen, 'vlak schuift naar beneden weg').toBeGreaterThan(0);
  await page.waitForTimeout(1200);
  expect((await lees())[1], 'vlak weg na de overgang').toBe('hidden');
  await page.goBack();
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
