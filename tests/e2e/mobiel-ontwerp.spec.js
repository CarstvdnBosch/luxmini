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
    ['€ 65', '6 producten', ['shirtje', 'douchehandschoen']], ['€ 80', '7 producten', ['bijtring']]];
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
