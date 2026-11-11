// Mobiel ontwerp (blokkerend): de mobiele principes uit docs/ontwerp/principes.md ("Mobiel"),
// getoetst op elke pagina op mobiel (Chromium, 390 x 844) en op de iPhone (WebKit/Safari, 390 x 664).
import { test, expect, PAGINAS, wachtOpRust } from './hulp.js';

test.beforeEach(({}, info) => { test.skip(!['mobiel', 'iphone'].includes(info.project.name), 'alleen op telefoons'); });

// Alles wat je kunt aantikken (zichtbaar, niet verborgen achter een gesloten menu)
const TIKBAAR = 'main a[href], main button, main input:not([type=hidden]), main select, main textarea, main [role=tab], header a[href], header button, .balk a[href], .balk button, footer a[href]';

// ook de 404-pagina: daar komen bezoekers binnen via oude webshop-links
for (const { pad, naam } of [...PAGINAS, { pad: '/bestaat-niet-meer', naam: '404' }]) {
  test(`${naam}: mobiele ontwerpprincipes`, async ({ page }) => {
    await page.goto(pad);
    await wachtOpRust(page);
    // hele pagina langs, zodat alles wat opkomt bij scrollen zichtbaar is
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });

    const m = await page.evaluate((sel) => {
      const zichtbaar = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden], [aria-hidden="true"], .val, .sr-only, .skip, .intro-scherm, .menu-scherm'); };
      const naam = el => (el.textContent || el.getAttribute('aria-label') || el.getAttribute('name') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40);
      const uit = {};
      // 1. tikdoelen minimaal 44 px hoog (of breed én hoog bij iconen)
      uit.klein = [...document.querySelectorAll(sel)].filter(zichtbaar).filter(el => {
        const r = el.getBoundingClientRect();
        if (el.matches('main p a, main li > p a, .tekstblok a')) return false; // links midden in een zin (WCAG 2.5.8 uitzondering: inline)
        return r.height < 43.5 || r.width < 24;
      }).map(el => `${naam(el)} (${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)})`);
      // 2. lopende tekst minimaal 16 px (alinea's en lijstregels met echte zinnen)
      uit.kleineTekst = [...document.querySelectorAll('main p, main li, main dd, main figcaption, main td'), ...[...document.querySelectorAll('footer *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 20))].filter(zichtbaar)
        .filter(el => !el.closest('.caps, .label, main nav') && el.textContent.trim().length > 40 && parseFloat(getComputedStyle(el).fontSize) < 16)
        .map(el => `${naam(el)} (${getComputedStyle(el).fontSize})`);
      // 3. formuliervelden minimaal 16 px (anders zoomt Safari in bij aantikken)
      uit.veldZoom = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(zichtbaar)
        .filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).map(el => `${naam(el)} (${getComputedStyle(el).fontSize})`);
      // 4. inzoomen niet geblokkeerd
      const vp = (document.querySelector('meta[name="viewport"]') || {}).content || '';
      uit.zoomGeblokkeerd = /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(vp);
      // 5. niets steekt buiten het scherm (behalve in bewust scrollbare of afgesneden rijen)
      const vw = document.documentElement.clientWidth;
      const afgesneden = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(o.overflowX)) return true; } return false; };
      uit.buitenScherm = [...document.querySelectorAll('main *, header *, footer *')].filter(zichtbaar)
        .filter(el => { const r = el.getBoundingClientRect(); return (r.right > vw + 1 || r.left < -1) && !afgesneden(el) && getComputedStyle(el).position !== 'fixed'; })
        .slice(0, 8).map(el => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} (${Math.round(el.getBoundingClientRect().left)}–${Math.round(el.getBoundingClientRect().right)})`);
      // 6. foto's nooit groter getoond dan het bestand (in CSS-pixels)
      uit.vergroot = [...document.querySelectorAll('main img')].filter(zichtbaar).filter(i => i.complete && i.naturalWidth && i.getBoundingClientRect().width > i.naturalWidth + 1)
        .map(i => `${i.getAttribute('src')} (${Math.round(i.getBoundingClientRect().width)} > ${i.naturalWidth})`);
      // 7. contact binnen één tik: een link naar het formulier (of je staat op de contactpagina)
      // (brief 2026-11-06: ook met ?onderwerp=…, zodat het formulier vooraf is ingevuld)
      uit.contact = [...document.querySelectorAll('main a[href]')].some(a => /^(contact\.html|\/contact)(\?[^#]*)?#formulier$/.test(a.getAttribute('href'))) || !!document.querySelector('main form[action="/api/contact"]');
      // 8. regellengte: op 390 px van nature kort; vangnet tegen te brede tekstblokken (ontwerpgate beoordeelt regel 8)
      uit.langeRegels = [...document.querySelectorAll('main p')].filter(zichtbaar).filter(p => { const fs = parseFloat(getComputedStyle(p).fontSize); return p.textContent.trim().length > 80 && p.getBoundingClientRect().width / (fs * 0.5) > 80; }).map(naam);
      return uit;
    }, TIKBAAR);

    expect(m.klein, 'tikdoelen kleiner dan 44 px').toEqual([]);
    expect(m.kleineTekst, 'lopende tekst kleiner dan 16 px').toEqual([]);
    expect(m.veldZoom, 'formuliervelden kleiner dan 16 px (Safari zoomt dan in)').toEqual([]);
    expect(m.zoomGeblokkeerd, 'inzoomen is geblokkeerd in de viewport-meta').toBe(false);
    expect(m.buitenScherm, 'elementen die buiten het scherm steken').toEqual([]);
    expect(m.vergroot, 'foto’s groter getoond dan het bestand').toEqual([]);
    // 6b. foto's met object-fit: cover (statement, 003 Inspiratie, de kopfoto van Contact en alle andere): de uitsnede is niet
    //     groter dan het gekozen bestand (srcset/sizes/picture), gemeten met de echte pixelmaat van currentSrc (ontwerpgate ronde 1;
    //     brief 2026-11-07, criterium 10: alle zichtbare main img met cover, niet alleen .statement)
    const cover = await page.evaluate(async () => {
      const uit = [];
      const zichtbaar = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden], [aria-hidden="true"], .intro-scherm, .menu-scherm'); };
      for (const i of [...document.querySelectorAll('main img')].filter(i => getComputedStyle(i).objectFit === 'cover' && zichtbaar(i))) {
        if (!i.complete || !i.currentSrc) { i.loading = 'eager'; await i.decode().catch(() => {}); }
        const bron = new Image(); bron.src = i.currentSrc || i.src; await bron.decode().catch(() => {});
        const r = i.getBoundingClientRect(), schaal = Math.max(r.width / bron.naturalWidth, r.height / bron.naturalHeight);
        if (bron.naturalWidth && schaal > 1.01) uit.push(`${(i.currentSrc || '').split('/').pop()} ${schaal.toFixed(2)}× (${Math.round(r.width)}×${Math.round(r.height)} uit ${bron.naturalWidth}×${bron.naturalHeight})`);
      }
      return uit; });
    expect(cover, 'achtergrondfoto’s (cover) groter getoond dan het bestand').toEqual([]);
    // uitzondering (principes.md, regel 7): de bedankpagina, die je pas ziet nádat je het formulier verstuurde
    if (naam !== 'bedankt') expect(m.contact, 'geen link naar het contactformulier op deze pagina').toBe(true);
    expect(m.langeRegels, 'regels langer dan ca. 75 tekens').toEqual([]);
  });
}

test('menu op de telefoon: zes hoofditems, WhatsApp, telefoon en mail zonder scrollen, tikdoelen 44 px', async ({ page }) => {
  await page.goto('/');
  await page.locator('.burger').first().click();
  await expect(page.locator('.menu-scherm')).toBeVisible();
  await page.waitForTimeout(900);
  const m = await page.evaluate(() => {
    const zicht = [...document.querySelectorAll('.menu-scherm a')].filter(a => a.offsetParent && a.getBoundingClientRect().height > 0);
    const hoofd = [...document.querySelectorAll('.menu-nav > ul > li > a')];
    const kanalen = ['https://wa.me', 'tel:', 'mailto:'].map(p => document.querySelector(`.menu-scherm a[href^="${p}"]`).getBoundingClientRect());
    return { hoofd: hoofd.length, inBeeld: hoofd.every(a => a.getBoundingClientRect().bottom <= innerHeight), wa: kanalen.every(r => r.height > 0 && r.bottom <= innerHeight), klein: zicht.filter(a => a.getBoundingClientRect().height < 43.5).map(a => a.textContent.trim()) };
  });
  expect(m.hoofd).toBe(6);
  expect(m.inBeeld, 'hoofditems in beeld zonder scrollen').toBe(true);
  expect(m.wa, 'WhatsApp, telefoon en mail in beeld zonder scrollen').toBe(true);
  expect(m.klein, 'menulinks kleiner dan 44 px').toEqual([]);
});

test('vaste balk bedekt geen kop na een ankerlink', async ({ page }) => {
  await page.goto('/kraamcadeauboxen#formaten');
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const balk = document.querySelector('.balk'); const kop = document.querySelector('#formaten .label');
    const b = balk ? balk.getBoundingClientRect() : { bottom: 0 }; const k = kop.getBoundingClientRect();
    return { balkOnder: Math.round(b.bottom), kopBoven: Math.round(k.top), zichtbaar: k.bottom > 0 && k.top < innerHeight };
  });
  expect(m.zichtbaar, 'kop van de sectie in beeld').toBe(true);
  expect(m.kopBoven, `kop staat onder de balk (balk eindigt op ${m.balkOnder} px)`).toBeGreaterThanOrEqual(m.balkOnder - 1);
});

// Leesbare letters op mobiel (brief 2026-11-07, criteria 15–17; principes.md, Mobiel regel 2): alles wat je aantikt of moet lezen
// om iets te bedienen is minimaal 16 px, in main, in het geopende menu en in de footer. Alleen decoratieve labels ("001 —", .caps)
// mogen kleiner, maar niet onder 13 px. Uitzondering met naam: de inline maillink in de lopende tekst van de privacyverklaring
// (zelfde grootte als die tekst).
for (const { pad, naam } of [...PAGINAS, { pad: '/bestaat-niet-meer', naam: '404' }]) {
  test(`${naam}: bedieningselementen minimaal 16 px, labels minimaal 13 px (ook in het menu)`, async ({ page }) => {
    await page.goto(pad);
    await wachtOpRust(page);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const meet = (menu) => page.evaluate((menu) => {
      const zichtbaar = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden], [aria-hidden="true"], .sr-only, .skip, .intro-scherm'); };
      const naam = el => (el.textContent || el.getAttribute('aria-label') || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40);
      const fs = el => parseFloat(getComputedStyle(el).fontSize);
      const uitzondering = el => location.pathname.replace(/\.html$/, '') === '/privacy' && el.matches('.tekstblok p > a[href="mailto:info.luxmini@gmail.com"]');
      const binnen = menu ? ['#menu-scherm'] : ['main', 'footer'];
      const bediening = binnen.flatMap(b => [...document.querySelectorAll(['a', 'button', 'label', 'summary', '[role=tab]'].map(t => `${b} ${t}`).join(', '))]);
      const decor = binnen.flatMap(b => [...document.querySelectorAll(`${b} .label, ${b} .caps`)]);
      return {
        klein: bediening.filter(zichtbaar).filter(el => !uitzondering(el) && fs(el) < 16).map(el => `${naam(el)} (${fs(el)} px)`),
        decorKlein: decor.filter(zichtbaar).filter(el => fs(el) < 13).map(el => `${naam(el)} (${fs(el)} px)`),
      };
    }, menu);
    const pagina = await meet(false);
    await page.locator('.burger').first().click();
    await expect(page.locator('.menu-scherm')).toBeVisible();
    await page.waitForTimeout(900);
    const menu = await meet(true);
    expect(pagina.klein, 'links, knoppen en labels kleiner dan 16 px (main en footer)').toEqual([]);
    expect(menu.klein, 'links en knoppen kleiner dan 16 px in het menu').toEqual([]);
    expect([...pagina.decorKlein, ...menu.decorKlein], 'decoratieve labels (.label, .caps) kleiner dan 13 px').toEqual([]);
  });
}

// Prijskaarten Kraamcadeauboxen compact op de telefoon (brief 2026-11-07, criteria 20–24): € 35 t/m € 80 binnen 1,2 schermhoogte,
// elke kaart toont zichtbaar prijs (min. 32 px), aantal, de producten (compleet, zoals CLAUDE.md) en de pijl-link met formaat=.
test('kraamcadeauboxen: vier formaten compact binnen 1,2 scherm, elk met prijs, aantal, producten en link', async ({ page }) => {
  await page.goto('/kraamcadeauboxen#formaten');
  await wachtOpRust(page);
  const m = await page.evaluate(() => {
    const kaarten = [...document.querySelectorAll('#formaten .formaat')];
    const zicht = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const schoon = s => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const eerste = kaarten[0].getBoundingClientRect(), laatste = kaarten.at(-1).getBoundingClientRect();
    return {
      hoogte: laatste.bottom - eerste.top, scherm: innerHeight,
      kaarten: kaarten.map(k => {
        const prijs = k.querySelector('.formaat-prijs'), a = k.querySelector('a.pijl');
        // de zichtbare tekst van de kaart (innerText laat verborgen delen weg)
        const tekst = schoon(k.innerText).toLowerCase();
        const klein = [...k.querySelectorAll('*')].filter(e => zicht(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
          .filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).map(e => schoon(e.textContent).slice(0, 30));
        return { prijs: schoon(prijs.textContent), prijsPx: parseFloat(getComputedStyle(prijs).fontSize), tekst, klein,
          link: a && zicht(a) ? a.getAttribute('href') : '', linkH: a ? a.getBoundingClientRect().height : 0, linkPx: a ? parseFloat(getComputedStyle(a).fontSize) : 0,
          achtergrond: getComputedStyle(k).backgroundColor };
      }),
      breed: document.documentElement.scrollWidth - innerWidth,
    };
  });
  // op de iPhone (390 × 664) 1,2 × 664 = 797 px; op mobiel (390 × 844) 1013 px
  expect(m.hoogte, `€ 35 t/m € 80 beslaan ${Math.round(m.hoogte)} px (scherm ${m.scherm} px)`).toBeLessThanOrEqual(1.2 * m.scherm);
  expect(m.breed, 'pagina is breder dan het scherm').toBeLessThanOrEqual(0);
  const VERWACHT = [['€ 35', '3 producten', ['knuffel', 'swaddle', 'broekje']], ['€ 50', '4 producten', ['sjaaltje']],
    ['€ 65', '6 producten', ['shirtje', 'douchehandschoen']], ['€ 80', '7 producten', ['bijtring of speenkoord']]];
  m.kaarten.forEach((k, i) => {
    const [prijs, aantal, producten] = VERWACHT[i];
    expect(k.prijs, `kaart ${i + 1}: prijs`).toBe(prijs);
    expect(k.prijsPx, `kaart ${i + 1}: prijs minimaal 32 px`).toBeGreaterThanOrEqual(32);
    expect(k.tekst, `kaart ${i + 1}: aantal zichtbaar`).toContain(aantal);
    for (const p of producten) expect(k.tekst, `kaart ${i + 1}: ${p} zichtbaar`).toContain(p);
    if (i > 0) expect(k.tekst, `kaart ${i + 1}: "plus" (de producten bovenop het vorige formaat)`).toContain('plus');
    expect(k.link, `kaart ${i + 1}: pijl-link naar het formulier`).toBe(`contact.html?onderwerp=kraamcadeaubox&formaat=${prijs.slice(2)}#formulier`);
    expect(k.linkH, `kaart ${i + 1}: pijl-link minimaal 44 px hoog`).toBeGreaterThanOrEqual(43.5);
    expect(k.linkPx, `kaart ${i + 1}: pijl-link minimaal 16 px`).toBeGreaterThanOrEqual(16);
    expect(k.klein, `kaart ${i + 1}: tekst kleiner dan 16 px`).toEqual([]);
    expect(k.achtergrond, `kaart ${i + 1}: wit`).toBe('rgb(255, 255, 255)');
  });
});

/* ---------- Homepage op mobiel zoals Stock (brief 2026-11-07-homepage-mobiel-stock) ----------
   Hero op mobiel (≤ 760 px en telefoons liggend): drie foto's, daaronder kop, namen, tabjes, badge, quote en "Over Carien";
   nooit tekst over een foto. Tablet (761–1024 px): zes foto's, de kop minstens 12 px vrij van elke foto. Zijmarge 32 px. */
const BRIEF = 'brief 2026-11-07-homepage-mobiel-stock';
// Schermen uit de ontwerpcriteria (deel 2); 390 × 664 is het iPhone-project zelf (WebKit). Tablet ook 1024 × 1366 (criterium 5).
const HERO_SCHERMEN = [
  { b: 360, h: 740 }, { b: 390, h: 844 }, { b: 430, h: 932 }, { b: 768, h: 1024, tablet: true }, { b: 1024, h: 1366, tablet: true },
  { b: 844, h: 390, liggend: true }, { b: 932, h: 430, liggend: true }, { b: 390, h: 844, tekst: 1.3 },
];
const INTRO_WEG = () => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } };

// Meet de hero: overlap van de kop (vak van de h1 én de woorden) met elke zichtbare tegel, horizontaal scrollen en de quote.
const meetHero = (page) => page.evaluate(() => {
  const zicht = e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.display !== 'none' && r.width > 0 && r.height > 0; };
  const hero = document.querySelector('.hero'), kop = hero.querySelector('.kop-xl');
  const rg = document.createRange(); rg.selectNodeContents(kop);
  const kopVakken = [kop.getBoundingClientRect(), ...[...kop.querySelectorAll('.w')].map(w => w.getBoundingClientRect()), ...[...rg.getClientRects()].filter(r => r.width)];
  const tegels = [...hero.querySelectorAll('.tegel')].filter(zicht);
  const gat = (a, b) => Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom);
  let kopGat = Infinity;
  for (const t of tegels) for (const k of kopVakken) kopGat = Math.min(kopGat, gat(t.getBoundingClientRect(), k));
  // geen tekstelement van de hero over een foto (kop, namen, tabjes, badge)
  const tekst = ['.kop-xl', '.hero-tekst .caps', '.hero-wissel', '.badge'].map(s => hero.querySelector(s)).filter(e => e && zicht(e));
  const overFoto = [];
  for (const e of tekst) for (const t of tegels) if (gat(t.getBoundingClientRect(), e.getBoundingClientRect()) < 0) overFoto.push(`${e.className.baseVal ?? e.className} over ${[...t.classList].join('.')}`);
  const q = document.querySelector('.hero-kleur .quote').getBoundingClientRect();
  const rand = parseFloat(getComputedStyle(document.querySelector('.site-footer .wrap')).paddingLeft);
  const tabjes = [...hero.querySelectorAll('.hero-wissel button')].map(k => { const c = getComputedStyle(k); return { tekst: k.textContent.trim(), px: parseFloat(c.fontSize), spatie: parseFloat(c.letterSpacing), h: k.getBoundingClientRect().height }; });
  return { tabjes, kopGat, overFoto, breed: document.documentElement.scrollWidth - innerWidth, quote: [q.left, q.right], vw: innerWidth, rand, tegels: tegels.length };
});

async function zetSetB(page, aanraken) {
  const knop = page.locator('.hero-wissel button[data-set="b"]');
  if (aanraken) await knop.tap(); else await knop.click();
  await expect(knop).toHaveAttribute('aria-pressed', 'true');
}

for (const s of HERO_SCHERMEN) {
  const naam = `${s.b} × ${s.h}${s.tekst ? ` met tekst op ${s.tekst * 100} %` : ''}`;
  test(`hero ${naam}: kop overlapt geen foto, niets breder dan het scherm, quote binnen de marges (${BRIEF})`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'mobiel', 'eigen schermen in Chromium; de iPhone toetst 390 × 664 hieronder');
    // tablet met beweging: dan staat de kop in woorden (.w) en meet pasKopIn die (criterium 5)
    const ctx = await browser.newContext({ viewport: { width: s.b, height: s.h }, hasTouch: true, isMobile: true, reducedMotion: s.tablet ? 'no-preference' : 'reduce' });
    await ctx.addInitScript(INTRO_WEG);
    const page = await ctx.newPage();
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    if (s.tekst) await page.evaluate(z => { for (const p of ['text-size-adjust', '-webkit-text-size-adjust']) document.documentElement.style.setProperty(p, `${z * 100}%`); }, s.tekst);
    await page.waitForTimeout(s.tablet ? 1800 : 300); // tablet: de tegels zijn na de opkomverschuiving in rust
    const minGat = s.tablet ? 12 : 0;
    for (const set of ['A', 'B']) {
      if (set === 'B') { await zetSetB(page, true); await page.waitForTimeout(300); }
      const m = await meetHero(page);
      expect(m.breed, `set ${set}: scrollWidth − innerWidth`).toBe(0);
      expect(m.kopGat, `set ${set}: ruimte tussen de kop en de dichtstbijzijnde foto (min. ${minGat} px)`).toBeGreaterThanOrEqual(minGat);
      expect(m.overFoto, `set ${set}: tekst van de hero over een foto`).toEqual([]);
      expect(m.tegels, 'aantal zichtbare foto\'s').toBe(s.tablet ? 6 : 3);
      // tabjes op mobiel en liggend: 16 px, letterspatiëring .12em, 44 px hoog (ontwerpcriterium 7, Mobiel-regel 2; ontwerpgate ronde 1)
      if (!s.tablet && !s.tekst) for (const k of m.tabjes) {
        expect(k.px, `tabje "${k.tekst}" in px`).toBe(16);
        expect(k.spatie / k.px, `tabje "${k.tekst}": letterspatiëring in em`).toBeCloseTo(0.12, 2);
        expect(k.h, `tabje "${k.tekst}" hoogte`).toBeGreaterThanOrEqual(44);
      }
      // de quote valt binnen de zijmarges (op tablet binnen het scherm)
      const marge = s.tablet ? 0 : m.rand;
      expect(m.quote[0], 'quote links binnen de marge').toBeGreaterThanOrEqual(marge - 1);
      expect(m.quote[1], 'quote rechts binnen de marge').toBeLessThanOrEqual(m.vw - marge + 1);
    }
    await ctx.close();
  });
}

test(`hero op de iPhone (WebKit, 390 × 664): foto's en kop in het eerste scherm, geen overlap, quote binnen de marges (${BRIEF})`, async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'alleen de iPhone (Safari)');
  await page.goto('/');
  await wachtOpRust(page);
  for (const set of ['A', 'B']) {
    if (set === 'B') { await zetSetB(page, true); await page.waitForTimeout(300); }
    const m = await meetHero(page);
    expect(m.breed, `set ${set}: scrollWidth − innerWidth`).toBe(0);
    expect(m.kopGat, `set ${set}: kop over een foto`).toBeGreaterThanOrEqual(0);
    expect(m.overFoto).toEqual([]);
    expect(m.quote[0], 'quote links binnen de marge').toBeGreaterThanOrEqual(m.rand - 1);
    expect(m.quote[1], 'quote rechts binnen de marge').toBeLessThanOrEqual(m.vw - m.rand + 1);
  }
  // ontwerpcriterium 6: de drie foto's en de volledige kop zonder scrollen in beeld
  const eerste = await page.evaluate(() => [...document.querySelectorAll('.hero .tegel'), document.querySelector('.hero .kop-xl')]
    .filter(e => getComputedStyle(e).display !== 'none').map(e => e.getBoundingClientRect().bottom <= innerHeight));
  expect(eerste, 'foto\'s en kop in het eerste scherm').toEqual([true, true, true, true]);
});

test(`hero op 390 × 844: drie foto's op de maten van Stock, volgorde, kop, tabjes, quote en pijl-link (${BRIEF})`, async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 × 844');
  await page.goto('/');
  await wachtOpRust(page);
  const m = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, b: b.width, h: b.height, onder: b.bottom, rechts: b.right }; };
    const tegels = Object.fromEntries([...document.querySelectorAll('.hero .tegel')].map(t => [[...t.classList].find(k => /^t\d$/.test(k)), getComputedStyle(t).display]));
    const vak = r('.hero-fotos'), kop = document.querySelector('.hero .kop-xl');
    const rg = document.createRange(); rg.selectNodeContents(kop);
    const regels = new Set([...rg.getClientRects()].filter(x => x.width).map(x => Math.round(x.top))).size;
    const t2img = document.querySelector('.hero .t2 img.set-a');
    return { tegels, vak, t2: r('.hero .t2'), t4: r('.hero .t4'), t5: r('.hero .t5'), kop: r('.hero .kop-xl'), caps: r('.hero-tekst .caps'), wissel: r('.hero-wissel'),
      cirkel: r('.hero-cirkel'), badge: r('.hero .badge'), quote: r('.hero-kleur .quote'), pijl: r('.hero-kleur .intro .pijl'), hero: r('.hero'),
      kopPx: parseFloat(getComputedStyle(kop).fontSize), kopUitlijning: getComputedStyle(kop).textAlign, regels,
      quotePx: parseFloat(getComputedStyle(document.querySelector('.hero-kleur .quote')).fontSize),
      knoppen: [...document.querySelectorAll('.hero-wissel button')].map(k => [k.getBoundingClientRect().height, parseFloat(getComputedStyle(k).fontSize)]),
      t2lazy: t2img.loading, hoogteStijl: document.querySelector('.hero').style.height, vw: innerWidth, vh: innerHeight };
  });
  // precies drie foto's: t2, t4 en t5 (criterium 3, ontwerpcriterium 3)
  expect(m.tegels).toEqual({ t1: 'none', t2: 'block', t3: 'none', t4: 'block', t5: 'block', t6: 'none' });
  // posities: hooguit 4 px van de tabel (vak 390 : 352; ontwerpcriterium 4)
  const tabel = { t2: [130, 0, 162], t5: [59, 157, 117], t4: [215, 114, 117] };
  for (const [t, [x, y, b]] of Object.entries(tabel)) {
    expect(Math.abs(m[t].x - x), `${t} x`).toBeLessThanOrEqual(4);
    expect(Math.abs(m[t].y - m.vak.y - y), `${t} boven in het vak`).toBeLessThanOrEqual(4);
    expect(Math.abs(m[t].b - b), `${t} breedte`).toBeLessThanOrEqual(4);
    expect(m[t].x, `${t} binnen de zijmarge links`).toBeGreaterThanOrEqual(32);
    expect(m[t].rechts, `${t} binnen de zijmarge rechts`).toBeLessThanOrEqual(m.vw - 32);
  }
  expect(m.t2lazy, 't2 is de LCP-foto en wordt niet lazy geladen').not.toBe('lazy');
  // volgorde: fotogroep → kop → namen → tabjes → badge in de cirkel → quote → "Over Carien" (criterium 2)
  const volgorde = [m.vak, m.kop, m.caps, m.wissel, m.cirkel, m.quote, m.pijl];
  for (let i = 1; i < volgorde.length; i++) expect(volgorde[i].y, `blok ${i + 1} staat onder blok ${i}`).toBeGreaterThanOrEqual(volgorde[i - 1].onder - 0.5);
  // badge in het midden van de cirkel (ring 136 px, badge 96 px)
  expect(Math.round(m.cirkel.b)).toBe(136);
  expect(Math.round(m.badge.b)).toBe(96);
  expect(Math.abs(m.badge.x + m.badge.b / 2 - (m.cirkel.x + m.cirkel.b / 2)), 'badge horizontaal in de cirkel').toBeLessThanOrEqual(1);
  expect(Math.abs(m.badge.y + m.badge.h / 2 - (m.cirkel.y + m.cirkel.h / 2)), 'badge verticaal in de cirkel').toBeLessThanOrEqual(1);
  // geen vaste hoogte: alles staat in de hero, de hero is zo hoog als de inhoud
  expect(m.hero.onder, 'de cirkel valt binnen de hero').toBeGreaterThanOrEqual(m.cirkel.onder - 0.5);
  expect(m.hero.onder - m.cirkel.onder, 'geen lege ruimte onder de cirkel').toBeLessThanOrEqual(1);
  // kop: gecentreerd, 35–42 px, twee regels (ontwerpcriterium 8)
  expect(m.kopPx).toBeGreaterThanOrEqual(35); expect(m.kopPx).toBeLessThanOrEqual(42);
  expect(m.kopUitlijning).toBe('center');
  expect(m.regels, 'kop op twee regels').toBe(2);
  // tabjes: 44 px hoog, 16 px, gecentreerd (ontwerpcriterium 7)
  for (const [h, px] of m.knoppen) { expect(h).toBeGreaterThanOrEqual(44); expect(px).toBeGreaterThanOrEqual(16); }
  expect(Math.abs(m.wissel.x + m.wissel.b / 2 - m.vw / 2), 'tabjes gecentreerd').toBeLessThanOrEqual(6);
  // quote 24 px, breedte ≤ schermbreedte − 64, gecentreerd; pijl-link eronder met tikdoel 44 px (ontwerpcriterium 9)
  expect(m.quotePx).toBe(24);
  expect(m.quote.b, 'quote binnen 2 × 32 px zijmarge (min(32px, 8.2vw) = 31,98 px: halve pixel speling)').toBeLessThanOrEqual(m.vw - 64 + 0.5);
  expect(Math.abs(m.quote.x + m.quote.b / 2 - m.vw / 2), 'quote gecentreerd').toBeLessThanOrEqual(1);
  expect(m.pijl.h).toBeGreaterThanOrEqual(43.5);
  // eerste scherm: de drie foto's, de volledige kop, de namen en de tabjes zonder scrollen (ontwerpcriterium 5)
  for (const blok of [m.t2, m.t4, m.t5, m.kop, m.caps, m.wissel]) expect(blok.onder).toBeLessThanOrEqual(m.vh);
});

test(`hero op 390 × 844: de foto's van t1, t3 en t6 worden niet opgehaald, set B alleen voor t2 en t4 (${BRIEF})`, async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 × 844');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(INTRO_WEG);
  const page = await ctx.newPage();
  const opgehaald = new Set();
  page.on('request', r => { if (r.resourceType() === 'image') opgehaald.add(new URL(r.url()).pathname.replace(/^\//, '')); });
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.waitForTimeout(2500); // set B wordt na het laden opgehaald
  const m = await page.evaluate(() => {
    const bestanden = img => ['src', 'data-src', 'srcset', 'data-srcset'].flatMap(a => (img.getAttribute(a) || '').split(',').map(d => d.trim().split(/\s+/)[0]).filter(Boolean));
    const verborgen = [...document.querySelectorAll('.hero .t1 img, .hero .t3 img, .hero .t6 img')].flatMap(bestanden);
    // hetzelfde bestand kan ook buiten de hero staan (ig-babynest.jpg in het drieluik, lazy): dan haalt dat blok het op, niet de hero
    const elders = new Set([...document.querySelectorAll('img')].filter(i => !i.closest('.hero')).flatMap(bestanden));
    const setB = [...document.querySelectorAll('.hero img.set-b')].map(i => [[...i.closest('.tegel').classList].find(k => /^t\d$/.test(k)), !i.hasAttribute('data-src')]);
    // t1, t3 en t6 (set A): op mobiel kiest <picture> een leeg plaatje (data:), op desktop en tablet het echte bestand (niet lazy: daar in het eerste scherm)
    return { verborgen: [...new Set(verborgen)].filter(f => !elders.has(f)), setB, leeg: [...document.querySelectorAll('.hero .t1 img, .hero .t3 img.set-a, .hero .t6 img.set-a')].map(i => i.currentSrc.startsWith('data:')) };
  });
  expect(m.leeg, 't1, t3 en t6 tonen op mobiel het lege plaatje (geen netwerkverzoek)').toEqual([true, true, true]);
  expect(m.verborgen.length, 'er zijn bestanden van t1, t3 en t6 om te toetsen').toBeGreaterThan(0);
  expect(m.verborgen.filter(f => opgehaald.has(f)), 'opgehaalde bestanden van t1, t3 en t6').toEqual([]);
  expect(m.setB, 'set B alleen voor de zichtbare tegels').toEqual([['t2', true], ['t3', false], ['t4', true], ['t6', false]]);
  await ctx.close();
});

test(`hero op 390 × 844: tabjes en foto's wisselen de set met een tik en met het toetsenbord (${BRIEF})`, async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 × 844');
  await page.goto('/');
  await wachtOpRust(page);
  const stand = () => page.evaluate(() => {
    const op = s => getComputedStyle(document.querySelector(s)).opacity;
    return { knoppen: [...document.querySelectorAll('.hero-wissel button')].map(k => k.getAttribute('aria-pressed')), licht: document.documentElement.classList.contains('hero-licht'),
      t2: op('.hero .t2 img.set-b'), t4: op('.hero .t4 img.set-b'), t5: document.querySelectorAll('.hero .t5 img').length, kop: getComputedStyle(document.querySelector('.hero .kop-xl')).color };
  });
  const A = { knoppen: ['true', 'false'], licht: false, t2: '0', t4: '0', t5: 1, kop: 'rgb(255, 255, 255)' };
  const B = { knoppen: ['false', 'true'], licht: true, t2: '1', t4: '1', t5: 1, kop: 'rgb(32, 32, 32)' };
  expect(await stand()).toEqual(A);
  await page.locator('.hero-wissel button[data-set="b"]').tap();
  expect(await stand(), 'tik op "Het cadeau": t2 en t4 wisselen, Carien (t5) blijft, kop inkt op salie').toEqual(B);
  await page.locator('.hero .t2').tap();
  expect(await stand(), 'tik op een foto wisselt terug').toEqual(A);
  await page.locator('.hero-wissel button[data-set="b"]').focus();
  await page.keyboard.press('Enter');
  expect(await stand(), 'Enter op "Het cadeau"').toEqual(B);
  await page.locator('.hero-wissel button[data-set="a"]').focus();
  await page.keyboard.press(' ');
  expect(await stand(), 'Spatie op "Het atelier"').toEqual(A);
});

test(`hero op ≤ 760 px: geen meebewegen of kantelen, ook niet met een muis (${BRIEF})`, async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobiel', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 700, height: 900 } }); // muis, beweging aan
  await ctx.addInitScript(INTRO_WEG);
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.mouse.move(100, 100); await page.mouse.move(650, 850, { steps: 6 });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => [...document.querySelectorAll('.hero .tegel')].filter(t => getComputedStyle(t).display !== 'none')
    .map(t => [t.style.transform, getComputedStyle(t).transform]));
  expect(m.length).toBe(3);
  for (const [stijl, berekend] of m) { expect(stijl).toBe(''); expect(berekend).toBe('none'); }
  await ctx.close();
});

for (const { pad, naam } of [...PAGINAS, { pad: '/bestaat-niet-meer', naam: '404' }]) {
  test(`${naam}: zijmarge 32 px op 390 px en niets breder dan het scherm op 360 px (${BRIEF})`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'mobiel', 'gemeten in Chromium');
    for (const b of [390, 360]) {
      const ctx = await browser.newContext({ viewport: { width: b, height: 800 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
      await ctx.addInitScript(INTRO_WEG);
      const page = await ctx.newPage();
      await page.goto(pad);
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(() => {
        const zicht = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && !e.closest('.val, .sr-only, .skip, [aria-hidden="true"]'); };
        const inRij = e => { for (let p = e.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) return true; return false; };
        // het begin van de tekst (de eerste letter van elke regel), buiten veegbare rijen
        const links = [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main dt, main dd, main label')].filter(e => zicht(e) && !inRij(e) && e.textContent.trim())
          .map(e => { const rg = document.createRange(); rg.selectNodeContents(e); const rs = [...rg.getClientRects()].filter(x => x.width); return rs.length ? Math.min(...rs.map(x => x.left)) : Infinity; });
        return { breed: document.documentElement.scrollWidth - innerWidth, rand: getComputedStyle(document.querySelector('.site-footer .wrap')).paddingLeft, links: Math.min(...links) };
      });
      expect(m.breed, `${b} px: scrollWidth − innerWidth`).toBe(0);
      if (b === 390) {
        // min(32px, 8.2vw) = 31,98 px op 390 px: afgerond 32 px
        expect(Math.abs(parseFloat(m.rand) - 32), `zijmarge (--rand) op 390 px is ${m.rand}`).toBeLessThanOrEqual(0.5);
        expect(m.links, 'geen tekst dichter dan 32 px bij de rand').toBeGreaterThanOrEqual(31.5);
      }
      await ctx.close();
    }
  });
}

test(`kraamcadeauboxen op 360 px: prijs en aantal op één regel, de producten op één regel (${BRIEF}, criterium 10)`, async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten in Chromium');
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(INTRO_WEG);
  const page = await ctx.newPage();
  await page.goto('/kraamcadeauboxen#formaten');
  await page.evaluate(() => document.fonts.ready);
  const m = await page.evaluate(() => [...document.querySelectorAll('#formaten .formaat')].map(k => {
    const p = k.querySelector('.formaat-prijs').getBoundingClientRect(), a = k.querySelector('.formaat-aantal').getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(k.querySelector('.formaat-inhoud'));
    return { naast: a.left >= p.right && a.top < p.bottom && a.bottom > p.top, regels: new Set([...rg.getClientRects()].filter(x => x.width).map(x => Math.round(x.top))).size };
  }));
  expect(m.length).toBe(4);
  m.forEach((k, i) => { expect(k.naast, `kaart ${i + 1}: prijs en aantal op één regel`).toBe(true); expect(k.regels, `kaart ${i + 1}: producten op één regel`).toBe(1); });
  await ctx.close();
});

test(`003 Inspiratie op 390 × 844: geen witte streep tussen de balk en de foto (${BRIEF}, criterium 9)`, async ({ page }, info) => {
  test.skip(info.project.name !== 'mobiel', 'gemeten op 390 × 844');
  await page.goto('/');
  await wachtOpRust(page);
  for (const afstand of [0, 20, 40, 56, 60, 70, 89, 120]) {
    await page.evaluate(a => { const e = document.querySelector('#inspiratie'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - a); }, afstand);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const m = await page.evaluate(() => { const b = document.querySelector('.balk'), f = document.querySelector('#inspiratie > img').getBoundingClientRect();
      return { onder: b.getBoundingClientRect().bottom, label: b.querySelector('.sectie-label').textContent.replace(/\s+/g, ' ').trim(), foto: f.top, achtergrond: getComputedStyle(b).backgroundColor }; });
    // neemt de balk de kleur van Inspiratie, dan raakt de foto de balk (geen strook van de laag ertussen)
    if (m.label === '003 — Inspiratie') expect(m.foto, `${afstand} px: foto begint onder de balk met een streep (balk ${m.onder}, foto ${m.foto})`).toBeLessThanOrEqual(m.onder + 0.5);
    else expect(m.achtergrond, `${afstand} px: de balk heeft de kleur van de sectie erboven`).not.toBe('rgb(188, 133, 101)');
  }
});
