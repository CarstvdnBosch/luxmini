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
    // 6b. foto's als achtergrond over de volle breedte (object-fit: cover, statement en 003 Inspiratie): de uitsnede is niet
    //     groter dan het gekozen bestand (srcset/sizes), gemeten met de echte pixelmaat van het bestand (ontwerpgate ronde 1)
    const cover = await page.evaluate(async () => {
      const uit = [];
      for (const i of document.querySelectorAll('main .statement > img')) {
        if (!i.complete || !i.currentSrc) { i.loading = 'eager'; await i.decode().catch(() => {}); }
        const bron = new Image(); bron.src = i.currentSrc || i.src; await bron.decode().catch(() => {});
        const r = i.getBoundingClientRect(), schaal = Math.max(r.width / bron.naturalWidth, r.height / bron.naturalHeight);
        if (bron.naturalWidth && schaal > 1.01) uit.push(`${(i.currentSrc || '').split('/').pop()} ${schaal.toFixed(2)}×`);
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
