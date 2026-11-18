// Werkwijze 001 Het atelier als klein atelierboekje (brief 2026-11-14-werkwijze-boekje, criterium 16 en ontwerpcriteria 1–13).
// Hetzelfde boek als Babynest 001 (.media, .papier, .blad, .kaft; main.js §5f). Tekst naast het boek: label → quote → verhaal.
import { readFileSync } from 'node:fs';
import { test, expect } from './hulp.js';

const VERHAAL = 'Ik ben Carien Geurts, moeder van twee dochters en oma van vier kleinkinderen. Jarenlang maakte ik kleding voor mezelf en mijn kinderen. Sinds er kleinkinderen zijn, maak ik met veel plezier de babyuitzet en de eerste pakjes, en nu ook voor anderen. Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks.';
const QUOTE = '“Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken.”';
const FOTOS = { kaft: 'atelier-carien-label.jpg', links: 'atelier-carien-detail.jpg', rechts: 'atelier-borduurmachine-scherm.jpg' };
const INKT = 'rgb(32, 32, 32)';
// x van de labels van 002, 003 en 004 vóór deze wijziging (gemeten op main, 15 nov.)
const LABELS_X = { desktop: [120, 118.1, 118.1], tablet: [64, 63, 63], mobiel: [32, 32, 32], iphone: [32, 32, 32] };
const isTouch = info => ['tablet', 'mobiel', 'iphone'].includes(info.project.name);
const beweging = page => page.emulateMedia({ reducedMotion: 'no-preference' });
const norm = s => s.replace(/\s+/g, ' ').trim();
const gelijk = (a, b) => Math.abs(a - b) < 0.001;

async function scrolNaar(page, y) {
  const doel = await page.evaluate(y => {
    const max = document.documentElement.scrollHeight - innerHeight, d = Math.round(Math.max(0, Math.min(max, y)));
    window.scrollTo({ top: d, behavior: 'instant' });
    return d;
  }, y);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBe(doel);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  return doel;
}

// regels van het verhaal: woorden gegroepeerd op hun bovenkant (links, aantal tekens per regel)
const REGELS = () => {
  const v = document.querySelector('#atelier .verhaal'), t = v.firstChild, tekst = t.textContent, uit = [];
  const re = /\S+/g; let m;
  while ((m = re.exec(tekst))) {
    const r = document.createRange(); r.setStart(t, m.index === 0 ? 1 : m.index); r.setEnd(t, m.index + m[0].length);
    const b = r.getBoundingClientRect(), top = Math.round(b.top + b.height / 2);
    let regel = uit.find(x => Math.abs(x.top - top) < 6);
    if (!regel) { regel = { top, links: b.left, tekst: [] }; uit.push(regel); }
    regel.links = Math.min(regel.links, b.left); regel.tekst.push(m[0]);
  }
  const vb = v.getBoundingClientRect();
  return uit.sort((a, b) => a.top - b.top).map(x => ({ inspring: x.links - vb.left, tekens: x.tekst.join(' ').length }));
};

test('inhoud: alleen het bestaande verhaal en de quote, één keer, zonder persaandacht (criterium 1–3)', async ({ page }) => {
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  expect(norm(await s.locator('.verhaal').textContent())).toBe(VERHAAL);
  expect(await s.locator('.verhaal *').count(), 'geen element (span) in het verhaal').toBe(0);
  await expect(s.locator('.quote')).toHaveCount(1);
  expect(norm(await s.locator('.quote').textContent())).toBe(QUOTE);
  // alle tekst in 001: label, kafttitel, quote en verhaal, en verder niets
  expect(norm(await s.textContent())).toBe(norm(`Het atelier LUX mini · Atelier ${QUOTE} ${VERHAAL}`));
  await expect(s.locator('.kaft-strook')).toHaveText('LUX mini · Atelier');
  await expect(s.locator('figcaption, .masthead')).toHaveCount(0);
  const alles = (await s.textContent()) + ' ' + (await s.evaluate(e => [...e.querySelectorAll('img')].map(i => i.alt).join(' ')));
  expect(alles).not.toMatch(/interview|uit de pers|zoals gezien|redactie|journalist|editie|nummer|nr\.|€|barcode|20\d\d/i);
});

test('opbouw: #atelier, data-label, salie, inkt en het donkere balklogo (criterium 7, ontwerp 1)', async ({ page }) => {
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  await expect(s).toHaveAttribute('data-label', 'Het atelier');
  await expect(s).toHaveAttribute('data-achtergrond', '#C3CFBC');
  await expect(s.locator('.media-rij > .label')).toHaveText('Het atelier');
  const secties = await page.$$eval('main > section', x => x.map(e => e.id));
  expect(secties).toEqual(['', 'atelier', 'hoe-ik-werk', 'personaliseren', 'contact']);
  await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + 40));
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.querySelector('.achtergrond')).backgroundColor)).toBe('rgb(195, 207, 188)');
  await expect(page.locator('.balk .sectie-label')).toHaveText('Het atelier');
  await expect(page.locator('.balk .logo-donker')).toBeVisible();
  await expect(page.locator('.balk .logo-wit')).toBeHidden();
  const kleuren = await s.evaluate(e => [...e.querySelectorAll('.media-rij > .label, .quote, .verhaal, .kaft-strook')].map(x => getComputedStyle(x).color));
  expect(kleuren.every(c => c === INKT), `alle tekst inkt (${kleuren})`).toBe(true);
});

test('het anker #atelier landt met het label onder de vaste balk', async ({ page }) => {
  await page.goto('/werkwijze#atelier');
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => { const l = document.querySelector('#atelier .media-rij > .label').getBoundingClientRect(), b = document.querySelector('.balk');
    return [l.top, b.classList.contains('zichtbaar') ? b.getBoundingClientRect().bottom : 0, innerHeight]; });
  expect(m[0]).toBeGreaterThanOrEqual(m[1]);
  expect(m[0]).toBeLessThan(m[2] / 2);
});

test('foto\'s: drie webversies 768 × 960 zonder EXIF, unieke alt, width/height, lazy; geen fotorij meer (criterium 4, 5, 12; ontwerp 4, 11)', async ({ page }) => {
  for (const f of Object.values(FOTOS)) {
    const b = readFileSync(new URL(`../../public/assets/img/${f}`, import.meta.url));
    expect(b.includes(Buffer.from('Exif\0\0')), `${f}: geen EXIF`).toBe(false);
    expect(b.includes(Buffer.from('GPS')), `${f}: geen GPS`).toBe(false);
  }
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  await expect(s.locator('.kaft-voor img')).toHaveAttribute('src', `assets/img/${FOTOS.kaft}`);
  await expect(s.locator('.kaft-achter img')).toHaveAttribute('src', `assets/img/${FOTOS.links}`);
  await expect(s.locator('.blad-rechts img')).toHaveAttribute('src', `assets/img/${FOTOS.rechts}`);
  const imgs = await s.locator('img').evaluateAll(i => i.map(x => [x.getAttribute('width'), x.getAttribute('height'), x.getAttribute('loading'), x.alt]));
  expect(imgs).toHaveLength(3);
  for (const [w, h, l, alt] of imgs) { expect([w, h, l]).toEqual(['768', '960', 'lazy']); expect(alt.length).toBeGreaterThan(10); }
  const alts = await page.$$eval('main img', i => i.map(x => x.alt).filter(Boolean));
  expect(new Set(alts).size, 'geen alt dubbel op de pagina').toBe(alts.length);
  await expect(page.locator('#fotorij, #atelier .carrousel, [aria-controls="fotorij"]')).toHaveCount(0);
  // het bestand is nooit kleiner dan de getoonde foto
  const breed = await s.locator('img').evaluateAll(i => i.map(x => x.getBoundingClientRect().width));
  for (const w of breed) expect(w).toBeLessThanOrEqual(768);
});

test('in een blad zonder onderschrift is de foto boven en onder even ver van de rand (ontwerp 4)', async ({ page }) => {
  await page.goto('/werkwijze');
  const m = await page.locator('#atelier').evaluate(s => [...s.querySelectorAll('.blad')].filter(b => b.offsetWidth).map(b => {
    const r = b.getBoundingClientRect(), i = b.querySelector('img').getBoundingClientRect(); return [i.top - r.top, r.bottom - i.bottom]; }));
  expect(m.length).toBeGreaterThan(0);
  for (const [boven, onder] of m) expect(Math.abs(boven - onder)).toBeLessThanOrEqual(2);
});

test('typografie: pull-quote, initiaal en verhaal in één kolom (criterium 13, ontwerp 5–7)', async ({ page }, info) => {
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  const q = await s.locator('.quote').evaluate(e => { const c = getComputedStyle(e), lh = parseFloat(c.lineHeight);
    return { fam: c.fontFamily, fs: parseFloat(c.fontSize), regels: Math.round((e.getBoundingClientRect().height - parseFloat(c.paddingTop) - parseFloat(c.paddingBottom) - 2) / lh),
      lijn: [c.borderTopWidth, c.borderTopStyle, c.borderTopColor, c.borderBottomWidth, c.borderBottomStyle] }; });
  expect(q.fam).toContain('Libre Caslon Display');
  expect(q.lijn).toEqual(['1px', 'solid', INKT, '1px', 'solid']);
  if (info.project.name === 'desktop') { expect(q.fs).toBeGreaterThanOrEqual(28); expect(q.fs).toBeLessThanOrEqual(36); expect(q.regels).toBeLessThanOrEqual(3); }
  if (['mobiel', 'iphone'].includes(info.project.name)) { expect(q.fs).toBe(26); expect(q.regels).toBeLessThanOrEqual(5); }
  const v = await s.locator('.verhaal').evaluate(e => { const c = getComputedStyle(e), f = getComputedStyle(e, '::first-letter');
    return { fs: parseFloat(c.fontSize), lh: parseFloat(c.lineHeight) / parseFloat(c.fontSize), kolommen: c.columnCount, fam: c.fontFamily, init: f.fontFamily,
      begin: e.textContent.trim().startsWith('Ik ben Carien Geurts') }; });
  expect(v.fs).toBe(info.project.name === 'desktop' || info.project.name === 'tablet' ? 18 : 17);
  expect(v.lh).toBeGreaterThanOrEqual(1.6);
  expect(v.kolommen).toBe('auto');
  expect(v.fam).toContain('Source Sans 3');
  expect(v.init).toContain('Libre Caslon Display');
  expect(v.begin).toBe(true);
  // initiaal drie regels hoog: precies de eerste drie regels springen in, de vierde begint weer aan de rand
  const regels = await page.evaluate(REGELS);
  expect(regels.length).toBeGreaterThan(3);
  expect(regels.slice(0, 3).every(r => r.inspring > 20), `regel 1–3 springen in (${JSON.stringify(regels)})`).toBe(true);
  expect(regels.slice(3).every(r => r.inspring < 2), `regel 4 en verder aan de rand (${JSON.stringify(regels)})`).toBe(true);
  for (const r of regels) expect(r.tekens, 'hooguit 75 tekens per regel').toBeLessThanOrEqual(75);
});

test('desktop: boek 576 px (bladzijden 288 × 360 met plat en randen), tekst op x = 120 en samen in beeld tijdens het vastzetten (ontwerp 2, 10)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  const top = await s.evaluate(e => e.getBoundingClientRect().top + scrollY);
  const m0 = await s.evaluate(e => [e.getBoundingClientRect().height, innerHeight]);
  expect(m0[0] - m0[1], 'hooguit 0,7 scherm vast').toBeLessThanOrEqual(m0[1] * 0.7 + 1);
  for (const f of [0, 0.35, 0.7]) {
    await scrolNaar(page, top + f * m0[1]);
    await page.waitForTimeout(1700);
    const m = await s.evaluate(e => { const r = q => e.querySelector(q).getBoundingClientRect();
      return { boek: r('.papier'), blad: r('.blad-rechts'), label: r('.media-rij > .label'), quote: r('.quote'), verhaal: r('.verhaal') }; });
    expect(Math.abs(m.boek.width - 576)).toBeLessThanOrEqual(2);
    // de helft van het boek blijft 288 × 360; de bladzijde ligt daarop met 4 px overstek en 6 px randen rechts en onder
    // (brief 2026-11-15-babynest-mobiel-inschuiven, ontwerp 4): 278 × 346
    expect(Math.abs(m.blad.width - 278)).toBeLessThanOrEqual(2);
    expect(Math.abs(m.blad.height - 346)).toBeLessThanOrEqual(2);
    expect(Math.abs(m.blad.left - (m.boek.left + 288))).toBeLessThanOrEqual(1);
    expect(Math.abs(m.label.left - 120)).toBeLessThanOrEqual(1);
    expect(m.verhaal.width).toBeLessThanOrEqual(480);
    expect(m.label.top, `bij ${f}`).toBeGreaterThanOrEqual(0);
    expect(m.verhaal.bottom, `bij ${f}`).toBeLessThanOrEqual(876);
    expect(m.verhaal.right).toBeLessThan(m.boek.left);
  }
  await expect.poll(() => s.evaluate(e => parseFloat(e.style.getPropertyValue('--open')))).toBe(1);
});

test('mobiel en tablet: label → boek → quote → verhaal, maten en tekst binnen de rand (ontwerp 8, 9)', async ({ page }, info) => {
  test.skip(!isTouch(info), 'alleen touch');
  await page.goto('/werkwijze');
  const m = await page.locator('#atelier').evaluate(s => {
    const els = ['.media-rij > .label', '.papier', '.quote', '.verhaal'].map(q => s.querySelector(q).getBoundingClientRect());
    return { tops: els.map(r => r.top), boek: [els[1].left, els[1].width, els[1].height], tekst: [els[0], els[2], els[3]].map(r => [r.left, r.right]), b: innerWidth };
  });
  expect([...m.tops].sort((a, b) => a - b)).toEqual(m.tops);
  if (info.project.name === 'tablet') {
    expect(Math.abs(m.boek[0] - 104)).toBeLessThanOrEqual(1);
    expect([Math.round(m.boek[1]), Math.round(m.boek[2])]).toEqual([560, 700]);
    for (const [l] of m.tekst) expect(Math.abs(l - 104)).toBeLessThanOrEqual(1);
  } else {
    expect(Math.abs(m.boek[1] - 326)).toBeLessThanOrEqual(2);
    expect(Math.abs(m.boek[2] - 408)).toBeLessThanOrEqual(2);
    for (const [l, r] of m.tekst) { expect(Math.round(l)).toBeGreaterThanOrEqual(32); expect(Math.round(r)).toBeLessThanOrEqual(m.b - 32); } // --rand = min(32px, 8,2vw) = 31,98 px op 390
  }
});

test('geen horizontaal scrollen bij --open 0, 0,5 en 1 (criterium 14, ontwerp 8, 9)', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop', 'op 390 en 768 px (Chromium en WebKit)');
  await beweging(page);
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  const top = await s.evaluate(e => e.querySelector('.media-object').getBoundingClientRect().top + scrollY);
  const gezien = new Set();
  for (let y = top - 1.2 * (await page.evaluate(() => innerHeight)); y < top + 400; y += 20) {
    await scrolNaar(page, y);
    const [open, sw, iw] = await s.evaluate(e => [parseFloat(e.style.getPropertyValue('--open') || '1'), document.documentElement.scrollWidth, innerWidth]);
    expect(sw, `--open ${open}`).toBe(iw);
    if (gelijk(open, 0)) gezien.add('0');
    if (open > 0.3 && open < 0.7) gezien.add('0,5');
    if (gelijk(open, 1)) gezien.add('1');
  }
  expect([...gezien].sort()).toEqual(['0', '0,5', '1']);
});

test('tablet en mobiel: de draaiende kaft blijft minstens 12 px onder het label (ontwerp 8)', async ({ page }, info) => {
  test.skip(!isTouch(info) || info.project.name === 'iphone', 'op 768 × 1024 en 390 × 844 (Chromium)');
  await beweging(page);
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  const top = await s.evaluate(e => e.getBoundingClientRect().top + scrollY);
  let min = Infinity, gezien = 0, labelStaat = false;
  for (let y = Math.max(0, top - 1000); y <= top + 900; y += 30) {
    await scrolNaar(page, y);
    // de kaft draait pas als het label klaar is met opkomen (brief 2026-11-15-babynest-mobiel-inschuiven, CI 15 nov.);
    // wacht daar één keer op zodra het blok binnen is, anders is de test in CI sneller dan het label en draait er nog niets
    if (!labelStaat && await s.evaluate(e => e.classList.contains('binnen'))) {
      await expect.poll(() => s.locator('.media-rij > .label').evaluate(e => getComputedStyle(e).transform), { message: 'label in rust' }).toBe('none');
      await page.waitForTimeout(100); // de timer van main.js (1,25 s na .binnen) werkt de stand bij
      labelStaat = true;
    }
    const x = await s.evaluate(e => ({ binnen: e.classList.contains('binnen'), open: parseFloat(e.style.getPropertyValue('--open')), zicht: e.style.getPropertyValue('--kaft-o') === '1',
      vrij: e.querySelector('.kaft-voor').getBoundingClientRect().top - e.querySelector('.media-rij > .label').getBoundingClientRect().bottom }));
    if (x.binnen && x.zicht && x.open > 0 && x.open < 1) { gezien++; min = Math.min(min, x.vrij); }
  }
  expect(gezien, 'de kaft draait tijdens het scrollen').toBeGreaterThan(3);
  expect(min).toBeGreaterThanOrEqual(12);
});

test('met beweging: het boek schuift in, de regels komen op en de kaft slaat open (ontwerp 10)', async ({ page }, info) => {
  await beweging(page);
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  await expect(s).toHaveClass(/\banim\b/);
  const t = await s.evaluate(e => [getComputedStyle(e.querySelector('.obj')).transitionDuration, getComputedStyle(e.querySelector('.verhaal')).transitionDuration]);
  // desktop schuift op tijd in (1,5 s); tablet en mobiel lopen mee met de scrollpositie (--in, brief 2026-11-15-babynest-mobiel-inschuiven)
  if (info.project.name === 'desktop') expect(t[0].split(', ')[0]).toBe('1.5s');
  else expect(await s.evaluate(e => e.style.getPropertyValue('--in')), '--in gezet').toMatch(/^[01]\.\d{3}$/);
  expect(t[1].split(', ')[0]).toBe('1s');
  if (isTouch(info)) await s.evaluate(e => window.scrollTo(0, e.querySelector('.media-object').getBoundingClientRect().top + scrollY - innerHeight * 0.5));
  else await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.5));
  await expect(s).toHaveClass(/\bbinnen\b/);
  await page.waitForTimeout(1700);
  expect(await s.locator('.obj').evaluate(e => getComputedStyle(e).transform)).toBe('none');
  expect(await s.locator('.verhaal').evaluate(e => getComputedStyle(e).opacity)).toBe('1');
  if (info.project.name === 'desktop') await s.evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + e.offsetHeight - innerHeight));
  else await s.evaluate(e => { const o = e.querySelector('.media-object').getBoundingClientRect(); window.scrollTo(0, o.top + scrollY + innerHeight * 0.2); });
  await expect.poll(() => s.evaluate(e => parseFloat(e.style.getPropertyValue('--open')))).toBe(1);
});

test('geen leeg scherm tijdens het scrollen door 001 (ontwerp 13)', async ({ page }) => {
  await beweging(page);
  await page.goto('/werkwijze');
  const leeg = await page.evaluate(async () => {
    const uit = [], h = innerHeight, a = document.querySelector('#atelier'), begin = a.getBoundingClientRect().top + scrollY - h, eind = begin + h + a.offsetHeight;
    for (let y = Math.max(0, begin); y < eind; y += h / 3) {
      window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 120));
      const iets = [...document.querySelectorAll('main h1, main h2, main p, main a, main img, main .obj')].some(e => {
        const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < h && getComputedStyle(e).visibility === 'visible';
      });
      if (!iets) uit.push(Math.round(y));
    }
    return uit;
  });
  expect(leeg).toEqual([]);
});

test('minder beweging: het boek staat open (mobiel de binnenpagina), alle tekst direct zichtbaar (criterium 10, ontwerp 10)', async ({ page }, info) => {
  await page.goto('/werkwijze'); // hulp.js: reducedMotion reduce
  const s = page.locator('#atelier');
  await expect(s).not.toHaveClass(/\banim\b/);
  const m = await s.evaluate(e => ({ open: getComputedStyle(e).getPropertyValue('--open'), kaft: getComputedStyle(e.querySelector('.kaft')).transform, o: getComputedStyle(e.querySelector('.kaft')).opacity,
    regels: [...e.querySelectorAll('.regel')].map(r => getComputedStyle(r).opacity) }));
  expect(m.regels.every(o => o === '1')).toBe(true);
  await s.scrollIntoViewIfNeeded();
  await expect(s.locator('.blad-rechts img')).toBeVisible();
  if (isTouch(info)) expect(m.o, 'op mobiel de binnenpagina').toBe('0');
  else { expect(m.kaft).not.toBe('none'); await expect(s.locator('.kaft-achter img')).toBeVisible(); }
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('het boek staat open en quote en verhaal zijn zichtbaar', async ({ page }, info) => {
    await page.goto('/werkwijze');
    const s = page.locator('#atelier');
    await expect(s.locator('.blad-rechts img')).toBeVisible();
    if (info.project.name === 'desktop') await expect(s.locator('.kaft-achter img')).toBeVisible();
    else expect(await s.locator('.kaft').evaluate(e => getComputedStyle(e).opacity)).toBe('0');
    for (const q of ['.quote', '.verhaal', '.media-rij > .label']) {
      await expect(s.locator(q)).toBeVisible();
      expect(await s.locator(q).evaluate(e => getComputedStyle(e).opacity)).toBe('1');
    }
  });
});

test('002, 003 en 004 staan waar ze stonden (ontwerp 12)', async ({ page }, info) => {
  await page.goto('/werkwijze');
  const x = await page.evaluate(() => ['hoe-ik-werk', 'personaliseren', 'contact'].map(id => Math.round(document.querySelector(`#${id} .label`).getBoundingClientRect().left * 10) / 10));
  const verwacht = LABELS_X[info.project.name];
  x.forEach((v, i) => expect(Math.abs(v - verwacht[i]), `label ${i + 2}`).toBeLessThanOrEqual(0.5));
});

// ---------- Werkwijze gaat mee (brief 2026-11-15-babynest-mobiel-inschuiven, besluit Carst 1, ontwerp 6 en 14) ----------
const standObj = s => s.locator('.obj').evaluate(e => {
  const t = getComputedStyle(e).transform; if (t === 'none') return { x: 0, rot: 0, none: true };
  const m = new DOMMatrix(t); return { x: m.e, rot: Math.atan2(m.b, m.a) * 180 / Math.PI, none: false };
});

test('mobiel: het boekje schuift van links in en loopt mee met scrollen (ontwerp 14)', async ({ page }, info) => {
  test.skip(!['mobiel', 'iphone'].includes(info.project.name), 'op 390 px (Chromium en WebKit)');
  await beweging(page);
  await page.goto('/werkwijze');
  const s = page.locator('#atelier');
  const top = await s.evaluate(e => e.querySelector('.media-object').getBoundingClientRect().top + scrollY);
  const vh = await page.evaluate(() => innerHeight);
  expect(top, 'het boekje staat bij het laden onder het scherm').toBeGreaterThan(vh);
  await scrolNaar(page, Math.floor(top - vh));
  let b = await standObj(s);
  expect(Math.abs(b.x + 195)).toBeLessThanOrEqual(1);
  expect(Math.abs(b.rot - 12)).toBeLessThanOrEqual(0.2);
  await scrolNaar(page, top - vh * 0.8);
  b = await standObj(s);
  expect(Math.abs(b.x + 195 / 4)).toBeLessThanOrEqual(2);
  expect(Math.abs(b.rot - 3)).toBeLessThanOrEqual(0.2);
  await scrolNaar(page, Math.ceil(top - vh * 0.6));
  expect((await standObj(s)).none).toBe(true);
});

test('tablet: het boekje staat bij het laden in beeld en schuift één keer op tijd van links in (ontwerp 14)', async ({ page }, info) => {
  test.skip(info.project.name !== 'tablet', 'op 768 × 1024');
  await beweging(page);
  await page.goto('/werkwijze', { waitUntil: 'domcontentloaded' });
  const s = page.locator('#atelier');
  const begin = await s.evaluate(e => { const r = e.querySelector('.obj').getBoundingClientRect(); return (r.left + r.right) / 2; });
  expect(begin, 'begint links').toBeLessThan(100);
  await expect.poll(async () => (await standObj(s)).none, { timeout: 1600, intervals: [100] }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth)).toBe(true);
});

test('desktop: het boekje komt nog steeds van rechts (ontwerp 14)', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'alleen desktop');
  await beweging(page);
  await page.goto('/werkwijze');
  await page.waitForTimeout(1700);
  const m = await page.locator('#atelier .obj').evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return [m.e / e.offsetWidth, Math.atan2(m.b, m.a) * 180 / Math.PI]; });
  if (!(await page.locator('#atelier').evaluate(e => e.classList.contains('binnen')))) {
    expect(Math.abs(m[0] - 1.5)).toBeLessThanOrEqual(0.01);
    expect(Math.abs(m[1] - 14)).toBeLessThanOrEqual(0.2);
  }
});

test('het boekje is hetzelfde echte boek: rug, plat en randen (ontwerp 6)', async ({ page }, info) => {
  await page.goto('/werkwijze');
  const m = await page.locator('#atelier .papier').evaluate(p => { const rp = p.getBoundingClientRect(), rb = p.querySelector('.blad-rechts').getBoundingClientRect();
    return { rug: rb.left - rp.left, over: rb.top - rp.top, rechts: rp.right - rb.right, plat: getComputedStyle(p, '::before').backgroundColor, vw: innerWidth,
      strook: [getComputedStyle(p.querySelector('.kaft-strook')).color, getComputedStyle(p.querySelector('.kaft-strook')).backgroundColor] }; });
  expect(m.plat).toBe('rgb(140, 110, 88)');
  expect(m.strook).toEqual([INKT, 'rgb(251, 248, 243)']); // "LUX mini · Atelier" blijft inkt op #FBF8F3
  if (m.vw <= 760) { expect(Math.abs(m.rug - 13)).toBeLessThanOrEqual(1); expect(Math.round(m.over)).toBe(3); expect(Math.round(m.rechts)).toBe(7); }
  else if (m.vw <= 1024) { expect(Math.abs(m.rug - 22)).toBeLessThanOrEqual(1); expect(Math.round(m.over)).toBe(4); expect(Math.round(m.rechts)).toBe(10); }
  else { expect(Math.round(m.over)).toBe(4); expect(Math.round(m.rechts)).toBe(10); }
});
