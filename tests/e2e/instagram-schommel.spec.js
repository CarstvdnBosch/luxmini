// Brief 2026-11-15-instagram-pakje-schommelt (besluit Carst: alleen het broekje, skewX, bovenrand vast).
// 004 Instagram op de homepage: het broekje schommelt één keer zacht (2,8 s, vijf afnemende uitslagen, eindigt op 0°),
// zodra ≥ 60 % van de foto in beeld is en op zijn vroegst 700 ms na het opkomen. Minder beweging en zonder JavaScript:
// alleen de gewone foto en geen verzoeken naar de nieuwe bestanden. Eén tabstop, één beeld met alt-tekst, geen layout shift.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, wachtOpRust } from './hulp.js';

const ALT = 'Mauve overslagshirtje met ruches en een flared broekje aan een houten ladder, op Instagram';
const NIEUW = /ig-outfit-(ladder-achtergrond\.jpg|broekje\.webp)/;
const HREF = 'https://www.instagram.com/Luxmini2020/';

// Telt verzoeken naar de nieuwe bestanden.
function telVerzoeken(page) {
  const lijst = [];
  page.on('request', (r) => { if (NIEUW.test(r.url())) lijst.push(r.url()); });
  return lijst;
}

// Meet in de pagina: moment van in-beeld, start van de animatie (met het zichtbare deel), aantal starts, layout shifts.
async function meetInit(page) {
  await page.addInitScript(() => {
    const m = window.__schommel = { inBeeld: 0, klaar: 0, starts: [], shift: 0 };
    const orig = Element.prototype.animate;
    Element.prototype.animate = function (kf, opt) {
      if (this.classList && this.classList.contains('insta-broekje')) {
        const post = document.querySelector('.insta-foto').getBoundingClientRect();
        const zicht = Math.max(0, Math.min(post.bottom, innerHeight) - Math.max(post.top, 0)) / post.height;
        m.starts.push({ t: performance.now(), zicht });
      }
      return orig.call(this, kf, opt);
    };
    document.addEventListener('DOMContentLoaded', () => {
      const post = document.querySelector('.insta-foto');
      if (!post) return;
      new MutationObserver(() => { if (!m.inBeeld && post.classList.contains('in-beeld')) m.inBeeld = performance.now(); })
        .observe(post, { attributes: true, attributeFilter: ['class'] });
      // einde in de pagina zelf meten (moment waarop main.js "klaar" zet), los van het pollen van Playwright
      new MutationObserver(() => { if (!m.klaar && post.dataset.schommel === 'klaar') m.klaar = performance.now(); })
        .observe(post, { attributes: true, attributeFilter: ['data-schommel'] });
    });
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput && m.starts.length) m.shift += e.value; })
        .observe({ type: 'layout-shift', buffered: false });
    } catch (e) { m.shift = -1; /* niet ondersteund (WebKit) */ }
  });
}

const naarPost = (page, blok = 'center') => page.evaluate((b) => document.querySelector('.insta-foto').scrollIntoView({ block: b, behavior: 'instant' }), blok);

test.describe('met beweging', () => {
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'no-preference' }); });

  test('schommelt één keer: 2,8 s, vijf afnemende uitslagen, eerst naar rechts, eindigt op 0°, daarna verborgen', async ({ page }) => {
    await meetInit(page);
    const verzoeken = telVerzoeken(page);
    await page.goto('/');
    await wachtOpRust(page);
    expect(verzoeken, 'nog niets geladen bovenaan de pagina').toEqual([]);
    await naarPost(page);
    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'bezig', { timeout: 5000 });

    const anim = await page.evaluate(() => {
      const a = document.querySelector('.insta-broekje').getAnimations()[0];
      return { duur: a.effect.getTiming().duration, kf: a.effect.getKeyframes().map((k) => ({ o: k.offset, t: k.transform, e: k.easing })) };
    });
    expect(anim.duur).toBe(2800);
    expect(anim.kf.map((k) => k.o)).toEqual([0, 0.18, 0.38, 0.58, 0.78, 1]);
    const graden = anim.kf.map((k) => parseFloat(/skewX\((-?[\d.]+)deg\)/.exec(k.t)[1]));
    expect(graden).toEqual([0, 2.5, -1.6, 0.9, -0.4, 0]);
    for (let i = 2; i < graden.length - 1; i++) expect(Math.abs(graden[i])).toBeLessThan(Math.abs(graden[i - 1])); // afnemend
    for (const k of anim.kf.slice(0, -1)) expect(k.e.replace(/\s/g, '')).toBe('cubic-bezier(0.45,0,0.55,1)');

    // de lagen liggen over de foto: aria-hidden, alt="" en niet focusbaar
    const lagen = page.locator('.insta-lagen');
    await expect(lagen).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.insta-laag')).toHaveCount(2);
    for (const img of await page.locator('.insta-laag').all()) {
      await expect(img).toHaveAttribute('alt', '');
      await expect(img).toHaveAttribute('width', '384');
      await expect(img).toHaveAttribute('height', '224');
    }

    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'klaar', { timeout: 5000 });
    const na = await page.evaluate(() => {
      const b = document.querySelector('.insta-broekje');
      return { verborgen: document.querySelector('.insta-lagen').hidden, animaties: b.getAnimations().length, transform: getComputedStyle(b).transform, starts: window.__schommel.starts.length };
    });
    expect(na).toEqual({ verborgen: true, animaties: 0, transform: 'none', starts: 1 });

    // wegscrollen en terugkomen: start niet opnieuw
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(400);
    await naarPost(page);
    await page.waitForTimeout(1600);
    expect(await page.evaluate(() => window.__schommel.starts.length)).toBe(1);
    expect(new Set(verzoeken).size, 'elk nieuw bestand één keer geladen').toBe(2);
  });

  test('start pas bij ≥ 60 % in beeld en ≥ 700 ms na het opkomen; de duur is 2,8 s', async ({ page }) => {
    await meetInit(page);
    await page.goto('/');
    await wachtOpRust(page);
    // eerst maar ongeveer 40 % van de foto in beeld: geen start
    await page.evaluate(() => {
      const r = document.querySelector('.insta-foto').getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + r.top - innerHeight + r.height * 0.4, behavior: 'instant' });
    });
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => window.__schommel.starts.length), 'geen start bij 40 % in beeld').toBe(0);
    await naarPost(page);
    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'bezig', { timeout: 5000 });
    const m = await page.evaluate(() => window.__schommel);
    expect(m.starts).toHaveLength(1);
    expect(m.starts[0].zicht).toBeGreaterThanOrEqual(0.6);
    expect(m.inBeeld).toBeGreaterThan(0);
    expect(m.starts[0].t - m.inBeeld).toBeGreaterThanOrEqual(695);
    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'klaar', { timeout: 5000 });
    // duur in de pagina: van de start van de animatie (animate()) tot "klaar" (finish); niet de wandklok van de test,
    // want toHaveAttribute pollt met 100/250/500/1000 ms en kan een einde net na een poll ~0,5 s later zien (CI mobiel 15 nov.)
    const duur = await page.evaluate(() => window.__schommel.klaar - window.__schommel.starts[0].t);
    expect(duur).toBeGreaterThanOrEqual(2700);
    expect(duur).toBeLessThan(3100);
  });

  test('in rust en bij de grootste uitslag: lagen precies op de foto, bovenrand vast, zoom 8 ± 1 px, geen horizontaal scrollen, geen layout shift', async ({ page }) => {
    await meetInit(page);
    await page.goto('/');
    await wachtOpRust(page);
    await naarPost(page);
    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'bezig', { timeout: 5000 });
    const meet = (t) => page.evaluate((tijd) => {
      const a = document.querySelector('.insta-broekje').getAnimations()[0];
      a.pause(); a.currentTime = tijd;
      const img = document.querySelector('.insta-binnen > img');
      const achter = document.querySelector('.insta-laag:not(.insta-broekje)');
      const broek = document.querySelector('.insta-broekje');
      const ri = img.getBoundingClientRect();
      const schaal = ri.width / 480; // object-fit: cover, breedte bepaalt (3:4 en 4:5)
      const boven = ri.top - (640 * schaal - ri.height) * (getComputedStyle(img).objectPosition.split(' ')[1] === '40%' ? 0.4 : 0.5);
      const verwacht = { left: ri.left + 32 * schaal, top: boven + 400 * schaal, width: 384 * schaal, height: 224 * schaal };
      const ra = achter.getBoundingClientRect();
      const m = new DOMMatrix(getComputedStyle(broek).transform);
      const hoek = Math.atan(m.c) * 180 / Math.PI;
      const oy = (423 - 400) * schaal; // draaipunt in px vanaf de bovenkant van de laag
      return {
        afwijking: Math.max(Math.abs(ra.left - verwacht.left), Math.abs(ra.top - verwacht.top), Math.abs(ra.width - verwacht.width), Math.abs(ra.height - verwacht.height)),
        hoek,
        bovenrandPx: Math.abs(m.c * (418 - 423)), // shirtzoom (y 418) in bestandspixels
        zoomPx: Math.abs(m.c * (599.5 - 423)),
        broekOpAchter: Math.abs(broek.offsetLeft - achter.offsetLeft) + Math.abs(broek.offsetTop - achter.offsetTop),
        scrolltBreed: document.scrollingElement.scrollWidth > innerWidth,
        oy,
      };
    }, t);
    const rust = await meet(0);
    expect(rust.afwijking, 'achtergrondlaag ligt op de foto (≤ 1 px)').toBeLessThanOrEqual(1);
    expect(rust.broekOpAchter).toBe(0);
    expect(Math.abs(rust.hoek)).toBeLessThan(0.001);
    const piek = await meet(2800 * 0.18);
    expect(piek.hoek).toBeCloseTo(2.5, 2); // eerste uitslag naar rechts (skewX positief: onderkant naar rechts)
    expect(piek.bovenrandPx).toBeLessThan(0.5);
    expect(piek.zoomPx).toBeGreaterThanOrEqual(7);
    expect(piek.zoomPx).toBeLessThanOrEqual(9);
    expect(piek.scrolltBreed).toBe(false);
    const eind = await meet(2800);
    expect(Math.abs(eind.hoek)).toBeLessThan(0.001);
    const shift = await page.evaluate(() => window.__schommel.shift);
    if (shift >= 0) expect(shift, 'geen layout shift door het schommelen').toBe(0);
  });

  test('één tabstop, één beeld met alt-tekst en geen axe-meldingen tijdens het schommelen', async ({ page }) => {
    await page.goto('/');
    await wachtOpRust(page);
    await naarPost(page);
    await expect(page.locator('.insta-foto')).toHaveAttribute('data-schommel', 'bezig', { timeout: 5000 });
    const post = page.locator('.insta-foto');
    await expect(post).toHaveAttribute('href', HREF);
    expect(await post.evaluate((a) => a.querySelectorAll('a, button, input, select, textarea, [tabindex]').length)).toBe(0);
    const zichtbaar = await post.evaluate((a) => [...a.querySelectorAll('img')].filter((i) => i.alt !== '' && !i.closest('[aria-hidden="true"]')).map((i) => i.alt));
    expect(zichtbaar).toEqual([ALT]);
    await expect(post).toHaveAccessibleName(ALT);
    const uitslag = await new AxeBuilder({ page }).include('.insta-blok').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(uitslag.violations).toEqual([]);
  });

  test('andere pagina\'s laden de nieuwe bestanden niet', async ({ page }) => {
    const verzoeken = telVerzoeken(page);
    for (const pad of ['/werkwijze', '/inspiratie']) {
      await page.goto(pad);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
    }
    expect(verzoeken).toEqual([]);
  });
});

test('minder beweging: alleen de gewone foto, stil, en geen verzoeken naar de nieuwe bestanden', async ({ page }) => {
  // de gedeelde test zet al prefers-reduced-motion: reduce
  const verzoeken = telVerzoeken(page);
  await page.goto('/');
  await wachtOpRust(page);
  await naarPost(page);
  await page.waitForTimeout(2500);
  const post = page.locator('.insta-foto');
  await expect(post.locator('img')).toHaveCount(1);
  await expect(post.locator('img')).toHaveAttribute('src', 'assets/img/ig-outfit-ladder.jpg');
  await expect(post.locator('img')).toHaveAttribute('alt', ALT);
  await expect(page.locator('.insta-lagen')).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.insta-foto')).length)).toBe(0);
  expect(verzoeken).toEqual([]);
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('alleen de gewone foto en geen verzoeken naar de nieuwe bestanden', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const verzoeken = telVerzoeken(page);
    await page.goto('/');
    await naarPost(page).catch(() => {}); // zonder JS kan de pagina niet zelf scrollen
    await page.locator('.insta-foto').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const post = page.locator('.insta-foto');
    await expect(post.locator('img')).toHaveCount(1);
    await expect(post.locator('img')).toHaveAttribute('alt', ALT);
    await expect(post).toHaveAttribute('href', HREF);
    expect(verzoeken).toEqual([]);
  });
});
