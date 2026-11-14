// Kernpaden (blokkerend): wat een bezoeker altijd moet kunnen, op elk scherm.
import { test, expect, PAGINAS } from './hulp.js';

for (const { pad, naam } of PAGINAS) {
  test(`${naam}: geen JavaScript-fouten en niets scrolt horizontaal`, async ({ page }) => {
    const fouten = [];
    page.on('pageerror', e => fouten.push(e.message));
    // console-fouten, behalve "kon bron niet laden" (die vangen we per verzoek, alleen voor de eigen site)
    page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) fouten.push(m.text()); });
    page.on('requestfailed', r => { if (new URL(r.url()).origin === new URL(page.url() || 'http://x').origin) fouten.push(`laden mislukt: ${r.url()}`); });
    page.on('response', r => { if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url() || 'http://x').origin) fouten.push(`${r.status()}: ${r.url()}`); });
    await page.goto(pad);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 25)); } });
    const breed = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(breed, 'pagina is breder dan het scherm').toBeLessThanOrEqual(0);
    expect(fouten, 'fouten in de console').toEqual([]);
  });
}

// Zes hoofdpagina's in deze volgorde (brief homepage per product); op desktop (1440 px, dus >= 1280) staan ze in de header.
const HOOFDMENU = [['Werkwijze', /\/werkwijze(\.html)?$/], ['Kraamcadeauboxen', /\/kraamcadeauboxen(\.html)?$/],
  ['Prematuurkleding', /\/prematuurkleding(\.html)?$/], ['Babynest', /\/babynest(\.html)?$/], ['Inspiratie', /\/inspiratie(\.html)?$/], ['Contact', /\/contact(\.html)?$/]];

test('header: zes links in de juiste volgorde, elk met het juiste doel', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'de header-links staan er vanaf 1280 px; daaronder de burger');
  await page.goto('/');
  const links = page.locator('header nav.menu a');
  await expect(links).toHaveText(HOOFDMENU.map(([t]) => t));
  const doelen = await links.evaluateAll(as => as.map(a => new URL(a.href).pathname));
  doelen.forEach((d, i) => expect(d, `doel van ${HOOFDMENU[i][0]}`).toMatch(HOOFDMENU[i][1]));
});

test('hoofdnavigatie brengt je naar elke pagina', async ({ page }, info) => {
  await page.goto('/');
  for (const [tekst, doel] of HOOFDMENU) {
    if (info.project.name === 'desktop') {
      await page.locator('header nav.menu a', { hasText: new RegExp(`^${tekst}$`, 'i') }).first().click();
    } else {
      await page.locator('.burger').first().click();
      await expect(page.locator('.menu-scherm')).toBeVisible();
      await expect(page.locator('.burger').first()).toHaveAttribute('aria-expanded', 'true');
      await page.locator('.menu-nav > ul > li > a', { hasText: new RegExp(`^\\s*${tekst}\\s*$`, 'i') }).first().click();
    }
    await expect(page).toHaveURL(doel);
    await page.waitForLoadState('load'); // pas klikken als het script van de nieuwe pagina draait
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('contact: WhatsApp, telefoon en formulier zijn bereikbaar', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('main a[href^="https://wa.me/31643791618"]:visible').first()).toBeVisible();
  await expect(page.locator('a[href^="tel:"]').first()).toBeAttached();
  const formulier = page.locator('form[action="/api/contact"][method="post"]');
  await expect(formulier).toHaveCount(1);
  for (const veld of await formulier.locator('input:not([type=hidden]):not([tabindex="-1"]), textarea, select').all()) {
    if (!(await veld.isVisible())) continue;
    await expect(veld, `veld ${await veld.getAttribute('name')} heeft een label`).toHaveAccessibleName(/\S/);
  }
});

test('kraamcadeauboxen: vier prijzen van € 35 tot € 80', async ({ page }) => {
  await page.goto('/kraamcadeauboxen');
  const prijzen = (await page.locator('#formaten .formaat-prijs').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
  expect(prijzen).toEqual(['€ 35', '€ 50', '€ 65', '€ 80']);
});

// Oude adressen (301): het anker gaat mee en de kop van die sectie staat in beeld.
// Brief 2026-11-06: alle vijf oude productankers landen op de homepage (drieluik of Technieken).
for (const [oud, nieuw, anker] of [['/producten#siliconen', '/', 'siliconen'], ['/producten#prematuur', '/', 'prematuur'], ['/producten#babynest', '/', 'babynest'],
  ['/producten#kraamcadeaubox', '/', 'kraamcadeaubox'], ['/producten#babykleding', '/', 'babykleding'], ['/over#hoe-ik-werk', '/werkwijze', 'hoe-ik-werk'], ['/portfolio#siliconen', '/inspiratie', 'siliconen']]) {
  test(`oud adres ${oud} landt op ${nieuw}#${anker} met de kop in beeld`, async ({ page }) => {
    await page.goto(oud);
    await expect(page).toHaveURL(new RegExp(`${nieuw}#${anker}$`));
    await page.waitForTimeout(300);
    // de sectie met dit anker (het anker zelf, of een anker bovenaan de sectie voor oude adressen)
    const kop = page.locator(`xpath=//*[@id="${anker}"]/ancestor-or-self::section[1]`).locator('h1, h2, .label').first();
    await expect(kop).toBeInViewport();
  });
}

// Contactmomenten (criterium 6): buiten de contactpagina leidt elke contact-link in de inhoud naar het formulier.
for (const { pad, naam } of PAGINAS.filter(p => p.naam !== 'contact')) {
  test(`${naam}: geen WhatsApp, telefoon of mail als link in de inhoud; contact gaat naar het formulier`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'HTML is per scherm gelijk');
    await page.goto(pad);
    const direct = await page.locator('main a.pijl[href^="https://wa.me"], main a.pijl[href^="tel:"], main a.pijl[href^="mailto:"], main .contact-lijst a[href^="https://wa.me"], main .contact-lijst a[href^="tel:"], main .contact-lijst a[href^="mailto:"]').count();
    expect(direct, 'directe contactlinks in de inhoud').toBe(0);
    const doelen = await page.locator('main a[href*="contact"]').evaluateAll(as => as.map(a => a.getAttribute('href')));
    // brief 2026-11-06: ook met onderwerp (en formaat), zodat het formulier vooraf is ingevuld; elke CTA gaat naar het formulier
    for (const d of doelen) expect(d, 'contact-link in de inhoud').toMatch(/^(contact\.html|\/contact)(\?onderwerp=(kraamcadeaubox|prematuurkleding|babynest)(&formaat=(35|50|65|80))?)?#formulier$/);
    await expect(page.locator('#menu-scherm a[href^="https://wa.me/31643791618"]')).toHaveCount(1);
  });
}

test('homepage: hero, 001 Producten, 002 Handwerk, 003 Inspiratie, 004 Instagram in deze volgorde (brief 2026-11-06)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'volgorde is per scherm gelijk');
  await page.goto('/');
  const labels = await page.locator('main > section').evaluateAll(s => s.map(x => x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()));
  expect(labels).toEqual(['— LUX mini', '001 — Producten', '002 — Handwerk', '003 — Inspiratie', '004 — Instagram']);
  await expect(page.locator('main section.categorie')).toHaveCount(0);
  // drieluik: drie kolommen, elk één link naar de productpagina
  const kolommen = await page.locator('#producten .kern-kolom').evaluateAll(s => s.map(x => [x.id, [...x.querySelectorAll('a')].map(a => a.getAttribute('href'))]));
  expect(kolommen).toEqual([['kraamcadeauboxen', ['kraamcadeauboxen.html']], ['prematuurkleding', ['prematuurkleding.html']], ['babynest', ['babynest.html']]]);
  // technieken: vier namen als link, met de productregel in de toegankelijke naam
  const technieken = page.locator('#technieken .hoverlijst ul a');
  await expect(technieken).toHaveCount(4);
  const doelen = await technieken.evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(doelen).toEqual(['werkwijze.html#personaliseren', 'inspiratie.html#siliconen', 'prematuurkleding.html', 'inspiratie.html#textiel']);
  for (const [i, naam] of [[0, /Warm en eigen\s?: Belettering/], [1, /Rustig en praktisch\s?: Siliconen items/], [2, /Klein en precies\s?: Prematuurkleding/], [3, /Speels en levendig\s?: Borduren/]]) {
    await expect(technieken.nth(i)).toHaveAccessibleName(naam);
  }
  // 003 Inspiratie: naar alle inspiratie en het formulier; precies één link naar het formulier in main
  const insp = await page.locator('#inspiratie a.pijl').evaluateAll(as => as.map(a => a.getAttribute('href')));
  expect(insp).toEqual(['inspiratie.html', 'contact.html#formulier']);
  await expect(page.locator('main a[href="contact.html#formulier"]')).toHaveCount(1);
  await expect(page.locator('main a[href="werkwijze.html#atelier"]')).toHaveCount(1);
  for (const id of ['kraamcadeaubox', 'prematuur', 'babynest', 'babykleding', 'siliconen', 'inspiratie', 'contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
});

// Feedback Carst 6 nov. 14:28 (F4): de thema's groot in sets met scroll-snap. Brief 2026-11-14-walvis-uit-assortiment (besluit Carst
// 14 nov. 13:31 "Eén raster"): acht thema's (Walvis weg), twee kolommen breed: desktop sets van vier, tablet sets van twee, mobiel één
// (vervangt "sets van drie")
test('kraamcadeauboxen: volgorde en thema\'s twee kolommen breed in sets met scroll-snap', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen');
  const labels = await page.locator('main > section').evaluateAll(s => s.map(x => x.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()));
  expect(labels).toEqual(['— Kraamcadeauboxen', '— Met naam', '001 — Kies je formaat', '002 — Wat er in de box kan', '003 — Thema\'s', '004 — Zo werkt het', '005 — Contact']);
  const rij = page.locator('#themas .themacarrousel');
  await expect(rij.locator('li')).toHaveCount(8);
  // de foto's laden pas als de sectie in de buurt komt (ronde 8)
  await page.locator('#themas').evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(rij.locator('img[data-src]')).toHaveCount(0);
  const m = await rij.evaluate(async r => { const ts = [...r.querySelectorAll('li')].map(l => l.getBoundingClientRect());
    const label = document.querySelector('#themas .label').getBoundingClientRect();
    const foto = [];
    for (const i of [...r.querySelectorAll('img')].slice(0, 4)) { i.loading = 'eager'; await i.decode().catch(() => {}); const b = new Image(); b.src = i.currentSrc || i.src; await b.decode().catch(() => {});
      foto.push([i.getBoundingClientRect().width, i.getBoundingClientRect().height, b.naturalWidth, b.naturalHeight]); }
    const n = innerWidth <= 760 ? 1 : innerWidth <= 1024 ? 2 : 4; // eerste tegel van de volgende set
    return { scrollt: r.scrollWidth > r.clientWidth, snap: getComputedStyle(r).scrollSnapType, inBeeld: ts.filter(t => t.left >= -1 && t.right <= innerWidth + 1).length,
      eerste: ts[0].left, label: label.left, volgende: Math.max(0, Math.min(innerWidth, ts[n].right) - ts[n].left), foto }; });
  expect(m.scrollt).toBe(true);
  expect(m.snap).toMatch(/x mandatory/);
  const smal = ['mobiel', 'iphone'].includes(info.project.name); // beide 390 px breed: één thema per keer
  expect(m.inBeeld, 'één set in beeld').toBe(smal ? 1 : info.project.name === 'tablet' ? 2 : 4);
  // ontwerpgate ronde 3: binnen de rand (eerste thema onder het label) en een stukje van de volgende set in beeld
  expect(Math.abs(m.eerste - m.label), 'eerste thema begint onder het label').toBeLessThanOrEqual(1);
  expect(m.volgende, 'zichtbaar deel van de volgende set (signaal dat er meer is)').toBeGreaterThanOrEqual(smal ? 25 : 40);
  if (smal) expect(m.volgende, 'mobiel: 25–40 px van het volgende thema (ontwerpcriterium 7)').toBeLessThanOrEqual(40);
  // de foto's worden nooit groter getoond dan het gekozen bestand (echte pixelmaat; met de bijsnede van 2% tegen het donkere randje)
  for (const [b, h, fb, fh] of m.foto) expect(Math.max(b / fb, h / fh), 'themafoto vergroot').toBeLessThanOrEqual(1.01);
  await expect(page.locator('#themas a.pijl')).toHaveText(['Vraag je thema aan']);
});

test('intro speelt bij het eerste bezoek en is tussen 2,0 en 2,6 s weg (wens Carst 6 nov.: ca. 2,2 s)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // gemeten in de pagina zelf: van het moment dat de intro begint (klasse intro-aan) tot hij weg is,
  // los van de laadtijd die de testrunner ziet (ronde 5)
  await page.addInitScript(() => { window.__intro = {}; new MutationObserver(() => { const aan = !!document.documentElement && document.documentElement.classList.contains('intro-aan');
    if (aan && !window.__intro.start) window.__intro.start = performance.now(); if (!aan && window.__intro.start && !window.__intro.eind) window.__intro.eind = performance.now(); })
    .observe(document, { subtree: true, attributes: true, attributeFilter: ['class'] }); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/intro-aan/);
  // begin van de zichtbare intro: het begin van de CSS-tijdlijn van het doek (later dan de klasse als de stylesheet traag binnenkomt)
  const begin = await page.evaluate(() => { const a = document.querySelector('.intro-doek').getAnimations()[0];
    return a && a.currentTime !== null ? performance.now() - a.currentTime : window.__intro.start; });
  await expect(page.locator('html')).not.toHaveClass(/intro-aan/, { timeout: 4000 });
  const duur = await page.evaluate(b => window.__intro.eind - b, begin);
  expect(duur, 'duur van de intro in ms').toBeGreaterThanOrEqual(2000);
  expect(duur, 'duur van de intro in ms').toBeLessThanOrEqual(2600);
  await expect(page.locator('.hero h1')).toBeVisible();
  await ctx.close();
});

test('intro: de hero-foto\'s staan onder het doek al zichtbaar, overslaan is binnen 0,6 s klaar', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/intro-aan/);
  const dekking = await page.locator('.hero .tegel').evaluateAll(ts => ts.map(t => getComputedStyle(t).opacity));
  expect(dekking, 'doorzichtigheid van de tegels tijdens de intro').toEqual(['1', '1', '1', '1', '1', '1']);
  await page.waitForTimeout(400);
  // gemeten in de pagina zelf: van de toets tot de intro weg is (zonder de wachttijd van de testrunner)
  await page.evaluate(() => { window.__weg = null; addEventListener('keydown', () => { window.__toets = performance.now(); }, { capture: true, once: true });
    new MutationObserver((m, o) => { if (!document.documentElement.classList.contains('intro-aan')) { window.__weg = performance.now(); o.disconnect(); } }).observe(document.documentElement, { attributes: true }); });
  await page.keyboard.press('Shift');
  await expect(page.locator('html')).not.toHaveClass(/intro-aan/, { timeout: 2000 });
  const duur = await page.evaluate(() => window.__weg - window.__toets);
  expect(duur, 'overslaan duurt in ms').toBeLessThanOrEqual(600);
  await ctx.close();
});

test('intro: zonder main.js haalt de noodrem hem vóór 3,1 s weg', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.route('**/assets/js/main.js', r => r.abort());
  await page.goto('/');
  // tijd vanaf het begin van de navigatie (performance.now) tot de intro onzichtbaar of weg is
  const weg = await page.waitForFunction(() => { const i = document.querySelector('.intro-scherm'), c = getComputedStyle(i);
    return (c.display === 'none' || c.visibility === 'hidden' || c.opacity === '0') ? performance.now() : false; }, null, { timeout: 4000, polling: 20 });
  expect(await weg.jsonValue(), 'intro weg na ms').toBeLessThan(3100);
  await ctx.close();
});

/* ---------- Story 1 (issue #63, brief 2026-11-12-productrij-carrousel-en-maten): productrij als carrousel, zonder scrollbalk ---------- */
const PRODUCTEN = ['Knuffel', 'Swaddle', 'Broekje', 'Sjaaltje', 'Shirtje', 'Douchehandschoen', 'Bijtring', 'Speenkoord'];
const meetRij = page => page.evaluate(() => {
  const r = document.querySelector('#productenrij'), lis = [...r.querySelectorAll('li')], rr = r.getBoundingClientRect();
  const ul = r.querySelector('ul'), pl = parseFloat(getComputedStyle(ul).paddingLeft) || 0;
  return { balk: r.offsetHeight - r.clientHeight, sb: getComputedStyle(r).scrollbarWidth, pagina: document.documentElement.scrollWidth - window.innerWidth,
    scrolt: r.scrollWidth > r.clientWidth + 1, tab: r.getAttribute('tabindex'), links: lis.map(l => Math.round(l.getBoundingClientRect().left)),
    rand: Math.round(rr.left + pl), rechts: rr.right, laatste: lis[7].getBoundingClientRect().right, scrollLeft: r.scrollLeft,
    volledig: lis.filter(l => l.getBoundingClientRect().left >= -0.5 && l.getBoundingClientRect().right <= innerWidth + 0.5).length,
    derde: innerWidth - lis[2].getBoundingClientRect().left, rijen: new Set(lis.map(l => Math.round(l.getBoundingClientRect().top))).size,
    label: Math.round(document.querySelector('#in-de-box .label').getBoundingClientRect().left),
    afgesneden: lis.some(l => { const n = l.querySelector('.product-naam'); return n.scrollWidth > n.clientWidth + 0.5 || n.getBoundingClientRect().right > l.getBoundingClientRect().right + 0.5; }) };
});

test('Story 1: productrij als carrousel, zonder scrollbalk, met knoppen (muis), Home/End en raster op desktop', async ({ page }, info) => {
  await page.goto('/kraamcadeauboxen#in-de-box');
  const rij = page.locator('#productenrij');
  await expect(rij).toHaveClass(/\bcarrousel\b/);
  await expect(rij).toHaveAttribute('role', 'region');
  await expect(rij).toHaveAttribute('aria-label', 'Producten');
  const namen = await rij.locator('ul[role="list"] > li .product-naam').evaluateAll(ns => ns.map(n => n.textContent.replace(/­/g, '')));
  expect(namen).toEqual(PRODUCTEN);
  const vorige = page.locator('.carrousel-knop[aria-controls="productenrij"][data-richting="-1"]'), volgende = page.locator('.carrousel-knop[aria-controls="productenrij"][data-richting="1"]');
  await expect(vorige).toHaveAttribute('aria-label', 'Vorige producten');
  await expect(volgende).toHaveAttribute('aria-label', 'Volgende producten');
  const geenBalk = async (w) => {
    const m = await meetRij(page);
    expect(m.balk, `${w}: geen hoogte voor een scrollbalk`).toBe(0);
    expect(m.sb, `${w}: scrollbar-width`).toBe('none');
    expect(m.pagina, `${w}: pagina scrolt niet horizontaal`).toBeLessThanOrEqual(0);
    return m;
  };

  if (info.project.name === 'desktop') {
    // vanaf 1025 px: raster van acht binnen de rand, geen knoppen, geen tabstop; op 1025 geen afgesneden naam
    for (const w of [1440, 1280, 1025]) {
      await page.setViewportSize({ width: w, height: 900 });
      await expect.poll(async () => (await meetRij(page)).tab, `${w}: geen tabstop`).toBe(null);
      const m = await geenBalk(w);
      expect(m.scrolt, `${w}: rij scrolt niet`).toBe(false);
      expect(m.rijen, `${w}: één rij`).toBe(1);
      expect(m.volledig, `${w}: acht producten in beeld`).toBe(8);
      expect(m.afgesneden, `${w}: geen naam afgesneden`).toBe(false);
      await expect(vorige, `${w}: geen knoppen`).toBeHidden();
      await expect(volgende).toBeHidden();
    }
    // met een muis op 768 en 1024 px: knoppen, aria-disabled, snap per set, geen product overgeslagen
    for (const w of [768, 1024]) {
      await page.setViewportSize({ width: w, height: 900 });
      await expect.poll(async () => (await meetRij(page)).tab, `${w}: tabstop`).toBe('0');
      await rij.evaluate(r => { r.scrollLeft = 0; });
      const m = await geenBalk(w);
      expect(m.links[0], `${w}: eerste product onder het label`).toBe(m.label);
      if (w === 768) expect(m.volledig, '768: minstens 4 volledig').toBeGreaterThanOrEqual(4);
      for (const k of [vorige, volgende]) { const b = await k.boundingBox(); expect(b.width).toBeGreaterThanOrEqual(44); expect(b.height).toBeGreaterThanOrEqual(44); }
      // dezelfde afstand van rij tot knoppen als bij de stoffen (±4 px)
      const afstand = await page.evaluate(() => ['productenrij', 'stoffenrij'].map(id => document.querySelector(`.carrousel-knop[aria-controls="${id}"]`).getBoundingClientRect().top - document.getElementById(id).getBoundingClientRect().bottom));
      expect(Math.abs(afstand[0] - afstand[1]), `${w}: afstand rij-knoppen gelijk aan de stoffen`).toBeLessThanOrEqual(4);
      await expect(vorige).toHaveAttribute('aria-disabled', 'true');
      await expect(volgende).toHaveAttribute('aria-disabled', 'false');
      for (let i = 0; i < 8 && (await volgende.getAttribute('aria-disabled')) !== 'true'; i++) {
        const voor = await meetRij(page);
        const eersteNiet = voor.links.findIndex((l, j) => l + (voor.links[1] - voor.links[0]) - 12 > voor.rechts + 1);
        await volgende.click();
        await expect.poll(async () => { const na = await meetRij(page); return na.links.some(l => Math.abs(l - na.rand) <= 1) || (await rij.evaluate(r => r.scrollWidth - r.clientWidth - r.scrollLeft)) <= 2; },
          { message: `${w}: na een klik ligt een tegel op de rand (snap)` }).toBe(true);
        const na = await meetRij(page);
        if (eersteNiet > 0) expect(na.links[eersteNiet], `${w}: geen product overgeslagen`).toBeGreaterThanOrEqual(na.rand - 1);
      }
      await expect(volgende).toHaveAttribute('aria-disabled', 'true');
      await expect(vorige).toHaveAttribute('aria-disabled', 'false');
      const eind = await meetRij(page);
      expect(eind.laatste, `${w}: Speenkoord helemaal binnen de rij`).toBeLessThanOrEqual(eind.rechts + 1);
    }
    // toetsenbord: Tab bereikt de rij, pijl rechts scrolt, Home/End zonder verticaal verspringen
    await page.setViewportSize({ width: 768, height: 900 });
    await expect.poll(async () => (await meetRij(page)).tab).toBe('0');
    await rij.evaluate(r => { r.scrollLeft = 0; });
    await vorige.evaluate(k => k.closest('section').querySelector('.label').scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.locator('#in-de-box .sr-only').evaluate(h => { h.tabIndex = -1; h.focus(); });
    await page.keyboard.press('Tab');
    await expect(rij).toBeFocused();
    const rand = await rij.evaluate(r => getComputedStyle(r).outlineStyle);
    expect(rand, 'zichtbare focusrand').not.toBe('none');
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => rij.evaluate(r => r.scrollLeft)).toBeGreaterThan(0);
    await page.keyboard.press('End');
    await expect.poll(() => rij.evaluate(r => r.scrollWidth - r.clientWidth - r.scrollLeft)).toBeLessThanOrEqual(2);
    await page.keyboard.press('Home');
    await expect.poll(() => rij.evaluate(r => r.scrollLeft)).toBeLessThanOrEqual(2);
    expect(Math.abs((await page.evaluate(() => scrollY)) - y), 'pagina verspringt niet verticaal').toBeLessThanOrEqual(2);
  } else {
    // touch (tablet 768, mobiel 390, iPhone in WebKit): geen knoppen, vegen, rand en een stukje van het volgende product
    const w = page.viewportSize().width;
    const m = await geenBalk(w);
    expect(m.scrolt, 'rij scrolt (vegen)').toBe(true);
    await expect(rij).toHaveAttribute('tabindex', '0');
    await expect(vorige, 'op touch geen knoppen').toBeHidden();
    await expect(volgende).toBeHidden();
    expect(m.links[0], 'eerste product op de rand, gelijk met de stoffen').toBe(await page.evaluate(() => Math.round(document.querySelector('#stoffenrij li').getBoundingClientRect().left)));
    if (w <= 430) {
      expect(m.links[0], 'eerste product op 32 px').toBe(32);
      expect(m.volledig, '2 producten volledig').toBe(2);
      // brief 2026-11-14 (ontwerpcriterium 7): 25–40 px van het derde (was: minstens 24 px)
      expect(m.derde, '25–40 px van het derde').toBeGreaterThanOrEqual(25);
      expect(m.derde, '25–40 px van het derde').toBeLessThanOrEqual(40);
      // ook op 460 px geen scrollbalk en niets horizontaal
      await page.setViewportSize({ width: 460, height: 900 });
      await geenBalk(460);
    } else {
      expect(m.volledig, 'minstens 4 volledig').toBeGreaterThanOrEqual(4);
      expect(m.volledig, 'plus een stukje van het volgende').toBeLessThan(8);
    }
    // vegen: de rij schuift (scroll via touch is native; hier de scrollpositie als vervanging)
    await rij.evaluate(r => r.scrollBy({ left: 300, behavior: 'instant' }));
    await expect.poll(() => rij.evaluate(r => r.scrollLeft)).toBeGreaterThan(0);
  }
});
