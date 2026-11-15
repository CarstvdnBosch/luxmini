// Homepage op mobiel zoals Stock (brief 2026-11-14-homepage-mobiel-stock): 001 Producten met de foto als stilstaande achtergrond,
// 002 Handwerk als veegbaar LUX mini-lookbook met tabjes 01–04, 004 Instagram als eigen post. Alleen ≤ 760 px en telefoons liggend;
// desktop en touch-tablets blijven gelijk (criterium 15).
import { test, expect } from './hulp.js';

const BRIEF = 'brief 2026-11-14-homepage-mobiel-stock';
// staand: 360 × 740, 390 × 844, 430 × 932 (390 × 664 = het project iphone); liggend: 844 × 390 (touch, hoogte ≤ 500 px)
const SCHERMEN = [[360, 740], [390, 844], [430, 932], [844, 390]];
const INKT = 'rgb(32, 32, 32)', WIT = 'rgb(255, 255, 255)';
const HANDWERK = [
  ['Warm en eigen', 'Belettering', 'werkwijze.html#personaliseren', 'rgb(222, 183, 153)'],
  ['Rustig en praktisch', 'Siliconen items', 'inspiratie.html#siliconen', 'rgb(195, 207, 188)'],
  ['Klein en precies', 'Prematuurkleding', 'prematuurkleding.html', 'rgb(180, 177, 154)'],
  ['Speels en levendig', 'Borduren', 'inspiratie.html#textiel', 'rgb(181, 150, 158)'],
];

async function nieuweTelefoon(browser, info, b, h, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: b, height: h }, hasTouch: true, isMobile: true, reducedMotion: 'reduce', locale: 'nl-NL',
    baseURL: info.project.use.baseURL, ...extra });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) { /* geen opslag */ } });
  return ctx;
}
const naarSectie = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 84); }, sel);

test.describe('telefoon', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'mobiel', 'eigen schermmaten in Chromium (WebKit: zie de iPhone-toets hieronder)'); });

  // Criteria 1–5 en ontwerpcriteria 1, 4 en 5
  for (const [b, h] of SCHERMEN) {
    const liggend = b > 760;
    test(`001 Producten ${b} × ${h}: foto als stilstaande achtergrond, witte tekst onderaan, balk perzik (${BRIEF}, A)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#kraamcadeauboxen').hover().catch(() => {}); // ook na aanwijzen staat alles stil
      const m = await page.evaluate(() => [...document.querySelectorAll('#producten .kern-kolom')].map(k => {
        const r = k.getBoundingClientRect(), beeld = k.querySelector('.kern-beeld'), f = beeld.getBoundingClientRect(), img = beeld.querySelector('img');
        const delen = [k.querySelector('.nr'), k.querySelector('h2'), k.querySelector('p.klein'), k.querySelector('a.pijl')];
        return { id: k.id, hoogte: r.height, breedte: r.width, links: r.left, onder: r.bottom, kleur: getComputedStyle(k).backgroundColor,
          beeld: [f.left - r.left, f.top - r.top, r.right - f.right, r.bottom - f.bottom, f.width], cover: getComputedStyle(img).objectFit,
          transform: [getComputedStyle(beeld).transform, getComputedStyle(k.querySelector('.kern-masker')).transform, getComputedStyle(img).transform],
          opacity: getComputedStyle(img).opacity, loading: img.getAttribute('loading'),
          volgorde: delen.map(d => d.getBoundingClientRect().top), kleuren: delen.map(d => getComputedStyle(d).color),
          maten: [parseFloat(getComputedStyle(delen[1]).fontSize), parseFloat(getComputedStyle(delen[2]).fontSize), parseFloat(getComputedStyle(delen[3]).fontSize)],
          pijl: delen[3].getBoundingClientRect().height, tekstOnder: r.bottom - delen[3].getBoundingClientRect().bottom };
      }));
      expect(m.map(k => k.id)).toEqual(['kraamcadeauboxen', 'prematuurkleding', 'babynest']);
      for (const k of m) {
        expect(k.kleur, `${k.id}: ondergrond #2A1C14`).toBe('rgb(42, 28, 20)');
        expect(k.breedte, `${k.id}: blok over de volle breedte`).toBeGreaterThanOrEqual(b - 1);
        if (!liggend) {
          expect(k.hoogte, `${k.id}: blok ≤ schermhoogte − 56`).toBeLessThanOrEqual(h - 56 + 0.5);
          expect(k.beeld.slice(0, 4).every(x => Math.abs(x) <= 1), `${k.id}: de foto vult het hele blok (${k.beeld})`).toBe(true);
          expect(k.tekstOnder, `${k.id}: tekst onderaan (48 px)`).toBeLessThanOrEqual(49);
        } else {
          expect(Math.abs(k.hoogte - h), `${k.id}: liggend één scherm hoog`).toBeLessThanOrEqual(1);
          expect(Math.abs(k.beeld[2]) <= 1 && Math.abs(k.beeld[4] - b * 0.55) <= 1, `${k.id}: liggend de foto rechts op 55 % (${k.beeld})`).toBe(true);
        }
        expect(k.cover).toBe('cover');
        expect(k.transform, `${k.id}: foto staat stil (geen transform)`).toEqual(['none', 'none', 'none']);
        expect(k.opacity, `${k.id}: foto niet gedimd`).toBe('1');
        expect(k.loading, `${k.id}: foto blijft lazy`).toBe('lazy');
        expect([...k.volgorde].sort((x, y) => x - y), `${k.id}: volgorde nr, kop, zin, pijl-link`).toEqual(k.volgorde);
        expect(k.kleuren.every(c => c === WIT), `${k.id}: alle tekst wit (${k.kleuren})`).toBe(true);
        expect(k.maten, `${k.id}: kop ≥ 34 px, zin en pijl-link 16 px`).toEqual([expect.any(Number), 16, 16]);
        expect(k.maten[0]).toBeGreaterThanOrEqual(34);
        expect(k.pijl, `${k.id}: pijl-link minstens 44 px`).toBeGreaterThanOrEqual(43.5);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'geen horizontaal scrollen').toBe(b);
      // balk boven de blokken: effen perzik, donker logo, label in inkt
      await page.evaluate(() => { const k = document.querySelector('#prematuurkleding'); window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 20); });
      await page.waitForTimeout(400);
      const balk = await page.evaluate(() => { const b = document.querySelector('.balk');
        return [b.classList.contains('zichtbaar'), getComputedStyle(b).backgroundColor, getComputedStyle(b.querySelector('.logo-donker')).display, getComputedStyle(b.querySelector('.logo-wit')).display,
          getComputedStyle(b.querySelector('.sectie-label')).color, b.querySelector('.sectie-label').textContent.replace(/\s+/g, ' ').trim()]; });
      expect(balk, 'balk perzik met donker logo en label in inkt boven het drieluik').toEqual([true, 'rgb(222, 183, 153)', 'block', 'none', INKT, '001 — Producten']);
      await ctx.close();
    });
  }

  // Criterium 3 en ontwerpcriterium 1: ankers landen op het juiste blok, kop en pijl-link tussen de balk en de onderkant van het scherm
  for (const [b, h] of [[390, 844], [360, 740], [844, 390]]) {
    test(`001 Producten ${b} × ${h}: ankers landen op het blok met kop en pijl-link in beeld (${BRIEF}, criterium 3)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h);
      const page = await ctx.newPage();
      for (const [anker, blok] of [['kraamcadeauboxen', 'kraamcadeauboxen'], ['kraamcadeaubox', 'kraamcadeauboxen'], ['prematuurkleding', 'prematuurkleding'], ['prematuur', 'prematuurkleding'], ['babynest', 'babynest']]) {
        await page.goto(`/#${anker}`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        const m = await page.evaluate(id => { const k = document.getElementById(id), balk = document.querySelector('.balk');
          const onderBalk = balk.classList.contains('zichtbaar') ? balk.getBoundingClientRect().bottom : 0;
          return { onderBalk, kop: k.querySelector('h2').getBoundingClientRect().toJSON(), pijl: k.querySelector('a.pijl').getBoundingClientRect().toJSON(), blok: k.getBoundingClientRect().toJSON() }; }, blok);
        expect(m.kop.top, `#${anker}: kop onder de balk`).toBeGreaterThanOrEqual(m.onderBalk - 1);
        expect(m.pijl.bottom, `#${anker}: pijl-link boven de onderkant van het scherm`).toBeLessThanOrEqual(h + 0.5);
        expect(m.blok.top, `#${anker}: het blok ${blok} staat bovenaan in beeld`).toBeLessThanOrEqual(m.onderBalk + 40);
      }
      await ctx.close();
    });
  }

  // Criterium 2 en ontwerpcriterium 2: contrast van de witte tekst op de foto met sluier (tekst verborgen, 99,5e percentiel)
  for (const [b, h] of [[390, 844], [360, 740], [844, 390]]) {
    test(`001 Producten ${b} × ${h}: wit haalt op elke foto 4,5:1 (nr, zin, pijl-link) en 3:1 (kop) (${BRIEF}, criterium 2)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      for (const id of ['kraamcadeauboxen', 'prematuurkleding', 'babynest']) {
        await page.evaluate(i => { const k = document.getElementById(i); window.scrollTo(0, k.getBoundingClientRect().top + scrollY - 60); }, id);
        await page.evaluate(i => { const img = document.querySelector(`#${i} .kern-beeld img`); img.loading = 'eager'; return img.decode().catch(() => {}); }, id);
        await page.waitForTimeout(300);
        for (const [sel, min] of [['.nr', 4.5], ['h2', 3], ['p.klein', 4.5], ['a.pijl', 4.5]]) {
          const vak = await page.evaluate(([i, s]) => { const e = document.querySelector(`#${i} .kern-tekst ${s}`); e.style.color = 'transparent';
            e.querySelectorAll('*').forEach(x => { x.style.color = 'transparent'; x.style.stroke = 'transparent'; });
            const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }, [id, sel]);
          const png = (await page.screenshot({ clip: vak })).toString('base64');
          await page.evaluate(([i, s]) => { const e = document.querySelector(`#${i} .kern-tekst ${s}`); e.style.color = ''; e.querySelectorAll('*').forEach(x => { x.style.color = ''; x.style.stroke = ''; }); }, [id, sel]);
          const c = await page.evaluate(async p => {
            const img = new Image(); img.src = 'data:image/png;base64,' + p; await img.decode();
            const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
            const d = x.getImageData(0, 0, cv.width, cv.height).data, lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
            const L = []; for (let i = 0; i < d.length; i += 4) L.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
            L.sort((a, z) => a - z); return 1.05 / (L[Math.floor(L.length * 0.995)] + 0.05); }, png);
          expect(c, `${id} ${sel}: wit haalt ${c.toFixed(2)}:1 (min. ${min}:1)`).toBeGreaterThanOrEqual(min);
        }
      }
      await ctx.close();
    });
  }

  // Criterium 4 en ontwerpcriterium 3: geen vergroting; op 3× het grootste bestand.
  // Ook tussen 540 en 760 px bij 1× (controleur ronde 1): daar is de cover-breedte de schermbreedte, niet 540/720 px.
  for (const [b, h, dpr] of [[390, 844, 1], [360, 740, 1], [430, 932, 1], [844, 390, 1], [390, 844, 3], [600, 900, 1], [700, 900, 1], [760, 900, 1]]) {
    test(`001 Producten ${b} × ${h} @${dpr}×: foto's niet vergroot${dpr === 3 ? ', grootste bestand geladen' : ''} (${BRIEF}, criterium 4)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h, { deviceScaleFactor: dpr });
      const page = await ctx.newPage();
      await page.goto('/');
      const m = await page.evaluate(async () => {
        const uit = [];
        for (const img of document.querySelectorAll('#producten .kern-beeld img')) {
          img.loading = 'eager'; await img.decode().catch(() => {});
          const bron = new Image(); bron.src = img.currentSrc; await bron.decode().catch(() => {});
          const r = img.getBoundingClientRect(); const getoond = Math.max(r.width, r.height * bron.naturalWidth / bron.naturalHeight);
          uit.push({ bestand: img.currentSrc.split('/').pop(), breed: bron.naturalWidth, getoond });
        }
        return uit; });
      for (const f of m) expect(f.breed, `${f.bestand}: ${Math.round(f.getoond)} px getoond uit ${f.breed} px`).toBeGreaterThanOrEqual(f.getoond - 0.5);
      if (dpr === 3) expect(m.map(f => f.bestand)).toEqual(['hero-box-open.jpg', 'p-broekje-kleur.jpg', 'babynest-boven.jpg']);
      await ctx.close();
    });
  }

  // Criteria 6–8 en ontwerpcriteria 6 en 7
  for (const [b, h] of SCHERMEN) {
    test(`002 Handwerk ${b} × ${h}: één lookbook per keer, tabjes op één regel, links gelijk (${BRIEF}, B)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      await naarSectie(page, '#technieken');
      await page.waitForTimeout(400);
      const m = await page.evaluate(() => {
        const s = document.querySelector('#technieken'), rij = s.querySelector('.lookbook-rij'), rr = rij.getBoundingClientRect();
        const panelen = [...s.querySelectorAll('.lookbook-paneel')];
        const tabs = [...s.querySelectorAll('[role="tab"]')];
        const label = s.querySelector('.label').getBoundingClientRect(), pijl = s.querySelector(':scope > .wrap > a.pijl').getBoundingClientRect();
        return {
          oud: [getComputedStyle(s.querySelector('.sfeer-kaarten')).display, getComputedStyle(s.querySelector('.hoverlijst')).display],
          inBeeld: panelen.filter(p => { const r = p.getBoundingClientRect(); return r.left >= rr.left - 1 && r.right <= rr.right + 1; }).length,
          panelen: panelen.map(p => { const a = p.querySelector('a'); return [p.querySelector('h3').textContent.trim(), p.querySelector('.lookbook-regel').textContent.trim(), a.getAttribute('href'),
            getComputedStyle(p).backgroundColor, getComputedStyle(a).color, p.getAttribute('role'), !!p.closest('[inert]') || p.hasAttribute('inert')]; }),
          naam: parseFloat(getComputedStyle(panelen[0].querySelector('h3')).fontSize),
          object: panelen[0].querySelector('.papier.spread').getBoundingClientRect().width, decor: panelen[0].querySelector('.papier.spread').getAttribute('aria-hidden'),
          alts: [...s.querySelectorAll('.lookbook img')].map(i => i.getAttribute('alt')),
          tabs: tabs.map(t => { const r = t.getBoundingClientRect(); return [t.textContent.replace(/\s+/g, ' ').trim(), Math.round(r.top), r.width, r.height, t.getAttribute('aria-selected'), t.getAttribute('aria-controls'), getComputedStyle(t).color]; }),
          lijst: [s.querySelector('[role="tablist"]').hidden, s.querySelector('[role="tablist"]').getAttribute('aria-label')],
          streep: tabs.map(t => getComputedStyle(t.firstElementChild, '::after').transform !== 'none' && getComputedStyle(t.firstElementChild, '::after').transform !== 'matrix(1, 0, 0, 1, 0, 0)' ? 'uit' : getComputedStyle(t.firstElementChild, '::after').height),
          hoogte: pijl.bottom - label.top, pijlTekst: s.querySelector(':scope > .wrap > a.pijl').textContent.trim(),
          breed: document.documentElement.scrollWidth };
      });
      expect(m.oud, 'oude kaartenrij en hover-lijst zijn weg op mobiel').toEqual(['none', 'none']);
      expect(m.inBeeld, 'precies één paneel volledig in beeld').toBe(1);
      expect(m.panelen.map(p => p.slice(0, 5))).toEqual(HANDWERK.map(([n, r, href, kleur]) => [n, r, href, kleur, INKT]));
      expect(m.panelen.map(p => p[5]), 'elk paneel is een tabpanel').toEqual(['tabpanel', 'tabpanel', 'tabpanel', 'tabpanel']);
      expect(m.panelen.map(p => p[6]), 'alleen het actieve paneel is niet inert').toEqual([false, true, true, true]);
      expect(m.naam, 'naam 40 px').toBe(40);
      expect(m.decor, 'het lookbook is decoratief').toBe('true');
      expect(m.alts.every(a => a === ''), 'foto’s in het lookbook zonder alt').toBe(true);
      expect(m.object, 'lookbook ≤ 400 px breed').toBeLessThanOrEqual(400.5);
      if (b <= 760) expect(m.object, 'lookbook ≥ 290 px breed').toBeGreaterThanOrEqual(290);
      expect(m.lijst).toEqual([false, 'Handwerk']);
      expect(m.tabs.map(t => t[0])).toEqual(['01 Belettering', '02 Siliconen items', '03 Prematuurkleding', '04 Borduren']);
      expect(new Set(m.tabs.map(t => t[1])).size, 'tabjes op één regel').toBe(1);
      for (const t of m.tabs) { expect(t[2], `${t[0]}: breed genoeg`).toBeGreaterThanOrEqual(44); expect(t[3], `${t[0]}: hoog genoeg`).toBeGreaterThanOrEqual(43.5); expect(t[6], 'tabjes in volle inkt').toBe(INKT); }
      expect(m.tabs.map(t => t[4])).toEqual(['true', 'false', 'false', 'false']);
      expect(m.tabs.map(t => t[5])).toEqual(['lookbook-1', 'lookbook-2', 'lookbook-3', 'lookbook-4']);
      expect(m.streep[0], 'actieve tab onderstreept (1 px)').toBe('1px');
      expect(m.streep.slice(1), 'andere tabjes niet onderstreept').toEqual(['uit', 'uit', 'uit']);
      expect(m.pijlTekst).toBe('Zo personaliseert Carien');
      if (b === 390 && h === 844) expect(m.hoogte, 'van het label tot onder "Zo personaliseert Carien" ≤ 788 px').toBeLessThanOrEqual(788);
      expect(m.breed, 'geen horizontaal scrollen').toBe(b);
      await ctx.close();
    });
  }

  // Criterium 7 en ontwerpcriterium 8: tabjes en vegen werken samen; kleur van sectie en balk volgt; minder beweging direct
  test(`002 Handwerk: tab 03, vegen, pijl rechts, Home en End wisselen het paneel; sectie en balk volgen de kleur (${BRIEF}, criterium 7)`, async ({ page }) => {
    await page.goto('/');
    await naarSectie(page, '#technieken');
    await page.waitForTimeout(300);
    const stand = () => page.evaluate(() => {
      const s = document.querySelector('#technieken'), balk = document.querySelector('.balk');
      return { gekozen: [...s.querySelectorAll('[role="tab"]')].map(t => t.getAttribute('aria-selected') === 'true').indexOf(true),
        inert: [...s.querySelectorAll('.lookbook-paneel')].map(p => p.hasAttribute('inert')), sectie: getComputedStyle(s).backgroundColor,
        balk: getComputedStyle(balk).backgroundColor, overgang: getComputedStyle(s).transitionDuration, focus: document.activeElement.id,
        logo: getComputedStyle(balk.querySelector('.logo-donker')).display }; });
    const verwacht = async (n, focus) => {
      await expect.poll(async () => (await stand()).gekozen, { timeout: 1000 }).toBe(n);
      const st = await stand();
      expect(st.inert, `paneel ${n + 1}: andere panelen inert`).toEqual([0, 1, 2, 3].map(i => i !== n));
      expect(st.sectie, `paneel ${n + 1}: sectie in de kleur van het item`).toBe(HANDWERK[n][3]);
      expect(st.balk, `paneel ${n + 1}: balk in de kleur van het item`).toBe(HANDWERK[n][3]);
      expect(st.logo, 'donker logo op de lichte kleur').toBe('block');
      expect(st.overgang.split(',').every(d => parseFloat(d) === 0), 'minder beweging: geen overgang').toBe(true);
      if (focus) expect(st.focus).toBe(`lookbook-tab-${n + 1}`);
    };
    await page.locator('#lookbook-tab-3').click();
    await verwacht(2);
    // vegen: de rij één paneel terug schuiven (zoals een veeg naar rechts)
    await page.evaluate(() => { const rij = document.querySelector('.lookbook-rij'); rij.scrollTo({ left: document.getElementById('lookbook-2').offsetLeft, behavior: 'auto' }); });
    await verwacht(1);
    await page.locator('#lookbook-tab-2').focus();
    await page.keyboard.press('ArrowRight');
    await verwacht(2, true);
    await page.keyboard.press('End');
    await verwacht(3, true);
    await page.keyboard.press('Home');
    await verwacht(0, true);
    await page.keyboard.press('ArrowLeft');
    await verwacht(3, true);
    // er wisselt niets vanzelf
    await page.waitForTimeout(2500);
    expect((await stand()).gekozen).toBe(3);
  });

  test(`002 Handwerk met beweging: tab 04 schuift zacht naar het vierde paneel en blijft daar (${BRIEF}, criterium 7)`, async ({ browser }, info) => {
    const ctx = await nieuweTelefoon(browser, info, 390, 844, { reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto('/');
    await naarSectie(page, '#technieken');
    await page.waitForTimeout(400);
    await page.locator('#lookbook-tab-4').click();
    await page.waitForTimeout(1600);
    const m = await page.evaluate(() => ({ gekozen: [...document.querySelectorAll('#technieken [role="tab"]')].map(t => t.getAttribute('aria-selected')),
      plek: Math.abs(document.querySelector('.lookbook-rij').scrollLeft - document.getElementById('lookbook-4').offsetLeft),
      sectie: document.querySelector('#technieken').style.backgroundColor }));
    expect(m.gekozen).toEqual(['false', 'false', 'false', 'true']);
    expect(m.plek, 'de rij staat op het vierde paneel').toBeLessThanOrEqual(1);
    expect(m.sectie).toBe(HANDWERK[3][3]);
    await ctx.close();
  });

  // Criterium 11–13 en ontwerpcriterium 10
  for (const [b, h] of SCHERMEN) {
    test(`004 Instagram ${b} × ${h}: een eigen post op een witte kaart, zonder tellers of Instagram-logo (${BRIEF}, C)`, async ({ browser }, info) => {
      const ctx = await nieuweTelefoon(browser, info, b, h);
      const page = await ctx.newPage();
      await page.goto('/');
      await naarSectie(page, 'section[data-label*="Instagram"]');
      await page.evaluate(() => { const i = document.querySelector('.insta-foto img'); i.loading = 'eager'; return i.decode().catch(() => {}); });
      const m = await page.evaluate(() => {
        const kaart = document.querySelector('.insta-blok'), r = kaart.getBoundingClientRect();
        const delen = ['.insta-profiel', '.insta-foto img', '.insta-iconen', '.insta-tekst h2', '.insta-tekst p.klein', '.insta-tekst a.pijl'].map(s => kaart.querySelector(s));
        const av = kaart.querySelector('.insta-avatar'), avr = av.getBoundingClientRect(), foto = delen[1].getBoundingClientRect();
        const iconen = delen[2];
        return { kleur: getComputedStyle(kaart).backgroundColor, breed: r.width, links: r.left, rechts: innerWidth - r.right, schaduw: getComputedStyle(kaart).boxShadow, rand: getComputedStyle(kaart).borderTopWidth,
          volgorde: delen.map(d => d.getBoundingClientRect().top),
          avatar: [avr.width, avr.height, getComputedStyle(av).borderRadius, getComputedStyle(av).backgroundColor, av.querySelector('img').getAttribute('alt')],
          naam: [kaart.querySelector('.insta-naam').textContent.trim(), parseFloat(getComputedStyle(kaart.querySelector('.insta-naam')).fontSize), getComputedStyle(kaart.querySelector('.insta-naam')).color],
          profielLink: !!kaart.querySelector('.insta-profiel a'),
          foto: [foto.width / foto.height, delen[1].getAttribute('alt'), foto.left - r.left, r.right - foto.right],
          iconen: [iconen.getAttribute('aria-hidden'), iconen.querySelectorAll('svg').length, [...iconen.querySelectorAll('svg')].every(s => s.getAttribute('focusable') === 'false'),
            [...iconen.querySelectorAll('a, button, [tabindex]')].length, getComputedStyle(iconen).pointerEvents],
          kop: [delen[3].textContent.replace(/\s+/g, ' ').trim(), parseFloat(getComputedStyle(delen[3]).fontSize)],
          zin: delen[4].textContent.trim(), links2: [...kaart.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.getBoundingClientRect().height]),
          cijfers: kaart.innerText.replace(/luxmini2020/gi, '').match(/\d/g),
          merk: [...kaart.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(s => /insta|ig-logo|instagram/i.test(s) && !/ig-outfit/.test(s)) };
      });
      expect(m.kleur, 'witte kaart').toBe(WIT);
      expect(m.schaduw + ' ' + m.rand, 'zonder schaduw en rand').toBe('none 0px');
      expect(m.breed, 'kaart ≤ 400 px').toBeLessThanOrEqual(400.5);
      if (b <= 760) expect(Math.abs(m.links - Math.min(32, b * 0.082)), `kaart 100 % binnen de rand (links ${m.links})`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.links - m.rechts), 'kaart gecentreerd').toBeLessThanOrEqual(1);
      expect([...m.volgorde].sort((x, y) => x - y), 'profiel, foto, iconen, kop, zin, pijl-link').toEqual(m.volgorde);
      expect(m.avatar, 'rond avatar van 40 px op terracotta met het LUX-logo').toEqual([40, 40, '50%', 'rgb(188, 133, 101)', '']);
      expect(m.naam).toEqual(['luxmini2020', 16, INKT]);
      expect(m.profielLink, 'de profielregel is geen link').toBe(false);
      expect(Math.abs(m.foto[0] - 0.8), `foto 4:5 (${m.foto[0]})`).toBeLessThanOrEqual(0.01);
      expect(m.foto[1]).toBe('Mauve overslagshirtje met ruches en een flared broekje aan een houten ladder, op Instagram');
      expect(Math.abs(m.foto[2]) + Math.abs(m.foto[3]), 'foto van rand tot rand').toBeLessThanOrEqual(1);
      expect(m.iconen, 'drie decoratieve iconen, niet focusbaar, geen knoppen').toEqual(['true', 3, true, 0, 'none']);
      expect(m.kop[0]).toBe('Volg het atelier op Instagram');
      expect(m.kop[1]).toBeGreaterThanOrEqual(24);
      expect(m.zin).toBe('Nieuwe stukjes uit het atelier, zo van de naaimachine.');
      expect(m.links2.map(l => l[0]), 'precies twee links, allebei naar het profiel').toEqual(['https://www.instagram.com/Luxmini2020/', 'https://www.instagram.com/Luxmini2020/']);
      expect(m.links2.every(l => l[1] >= 43.5), 'tikdoelen ≥ 44 px').toBe(true);
      expect(m.cijfers, 'geen aantallen of andere cijfers in de kaart').toBeNull();
      expect(m.merk, 'geen Instagram-logo').toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'geen horizontaal scrollen').toBe(b);
      await ctx.close();
    });
  }
});

// WebKit/iPhone (390 × 664): de belangrijkste maten ook in Safari
test(`iPhone: drieluikblok past onder de balk, één lookbook in beeld, post 4:5 (${BRIEF})`, async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'alleen Safari op de iPhone');
  await page.goto('/');
  const h = page.viewportSize().height;
  const m = await page.evaluate(() => ({
    blokken: [...document.querySelectorAll('#producten .kern-kolom')].map(k => k.getBoundingClientRect().height),
    paneel: (() => { const rij = document.querySelector('.lookbook-rij').getBoundingClientRect(); return [...document.querySelectorAll('.lookbook-paneel')].filter(p => { const r = p.getBoundingClientRect(); return r.left >= rij.left - 1 && r.right <= rij.right + 1; }).length; })(),
    foto: (() => { const r = document.querySelector('.insta-foto img').getBoundingClientRect(); return r.width / r.height; })(),
    breed: document.documentElement.scrollWidth }));
  for (const b of m.blokken) expect(b).toBeLessThanOrEqual(h - 56 + 0.5);
  expect(m.paneel).toBe(1);
  expect(Math.abs(m.foto - 0.8)).toBeLessThanOrEqual(0.01);
  expect(m.breed).toBe(390);
});

// Criterium 10 en ontwerpcriterium 9: zonder JavaScript zijn alle items bereikbaar, zonder tablist en zonder inert
test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test(`002 Handwerk: veegrij met vier namen en links, geen tablist in beeld (${BRIEF}, criterium 10)`, async ({ page }, info) => {
    test.skip(info.project.name !== 'mobiel', 'gemeten op 390 × 844');
    await page.goto('/');
    await expect(page.locator('#technieken [role="tablist"]')).toBeHidden();
    const m = await page.evaluate(() => ({
      panelen: [...document.querySelectorAll('.lookbook-paneel')].map(p => [p.querySelector('h3').textContent.trim(), p.querySelector('a').getAttribute('href'), p.hasAttribute('inert'), p.getBoundingClientRect().height > 0]),
      rij: [getComputedStyle(document.querySelector('.lookbook-rij')).overflowX, getComputedStyle(document.querySelector('.lookbook-rij')).scrollSnapType],
      breed: document.documentElement.scrollWidth }));
    expect(m.panelen).toEqual(HANDWERK.map(([n, , href]) => [n, href, false, true]));
    expect(m.rij[0]).toBe('auto');
    expect(m.rij[1]).toContain('x');
    expect(m.breed).toBe(390);
    // bereikbaar met Tab: de vier links krijgen na elkaar de focus
    const doelen = [];
    await page.locator('#technieken .label').evaluate(e => { e.tabIndex = -1; e.focus(); });
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); doelen.push(await page.evaluate(() => document.activeElement.getAttribute('href'))); }
    expect(doelen).toEqual(HANDWERK.map(x => x[2]));
  });
});

// Criterium 15 en ontwerpcriterium 11: desktop en touch-tablets houden het oude gedrag
test(`desktop en tablet: geen lookbook en geen post; drieluik, Handwerk en Instagram zoals ze waren (${BRIEF}, criterium 15)`, async ({ page }, info) => {
  test.skip(!['desktop', 'tablet'].includes(info.project.name), 'alleen vanaf 761 px');
  await page.goto('/');
  const m = await page.evaluate(() => ({
    lookbook: getComputedStyle(document.querySelector('.lookbook')).display,
    post: ['.insta-profiel', '.insta-iconen'].map(s => getComputedStyle(document.querySelector(s)).display),
    kaarten: getComputedStyle(document.querySelector('.sfeer-kaarten')).display,
    lijst: getComputedStyle(document.querySelector('.hoverlijst.sferen')).display,
    kolommen: getComputedStyle(document.querySelector('.kern-kolommen')).gridTemplateColumns.split(' ').length,
    kleur: getComputedStyle(document.querySelector('#prematuurkleding')).backgroundColor,
    fotoBoven: (() => { const f = document.querySelector('#prematuurkleding .kern-beeld').getBoundingClientRect(), k = document.querySelector('#prematuurkleding h2').getBoundingClientRect(); return f.height > 0 && f.bottom <= k.top + 1; })(),
    insta: getComputedStyle(document.querySelector('.insta-blok')).display,
    sectie: [document.querySelector('#technieken').classList.contains('met-laag'), document.querySelector('#technieken').style.backgroundColor] }));
  expect(m.lookbook).toBe('none');
  expect(m.post).toEqual(['none', 'none']);
  expect(m.kolommen, 'drieluik in drie kolommen').toBe(3);
  expect(m.kleur, 'Prematuurkleding op oker').toBe('rgb(200, 159, 103)');
  expect(m.insta, 'Instagram: foto met tekst ernaast').toBe('grid');
  expect(m.sectie, 'Handwerk doet mee met de kleurlaag').toEqual([true, '']);
  if (info.project.name === 'tablet') {
    expect(m.kaarten, 'touch-tablet: kaarten').not.toBe('none');
    expect(m.fotoBoven, 'touch-tablet: foto boven de tekst').toBe(true);
  } else {
    expect(m.lijst, 'desktop: de hover-lijst').toBe('block');
    expect(m.kaarten).toBe('none');
  }
});
