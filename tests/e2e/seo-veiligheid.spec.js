// SEO, veiligheid en links (blokkerend). Draait één keer (desktop): de HTML is op elk scherm gelijk.
import { readFile } from 'node:fs/promises';
import { test, expect, PAGINAS, DOMEIN } from './hulp.js';

test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'alleen op desktop: HTML is per scherm gelijk'); });

const VERPLICHTE_HEADERS = {
  'x-content-type-options': /^nosniff$/i,
  'referrer-policy': /strict-origin-when-cross-origin|no-referrer|same-origin/i,
  'x-frame-options': /^(SAMEORIGIN|DENY)$/i,
  'permissions-policy': /camera=\(\)/,
  'strict-transport-security': /max-age=\d{7,}/,
};

for (const { pad, naam } of PAGINAS) {
  test(`SEO en kopstructuur ${naam}`, async ({ page }) => {
    const antwoord = await page.goto(pad);
    expect(antwoord.status(), `${pad} geeft geen 200`).toBe(200);
    const s = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      titel: document.title.trim(),
      beschrijving: (document.querySelector('meta[name="description"]') || {}).content || '',
      canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
      ogTitel: (document.querySelector('meta[property="og:title"]') || {}).content || '',
      robots: (document.querySelector('meta[name="robots"]') || {}).content || '',
      h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()),
      viewport: !!document.querySelector('meta[name="viewport"]'),
      fotosZonderAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src')),
      blankZonderNoopener: [...document.querySelectorAll('a[target="_blank"]')].filter(a => !/noopener|noreferrer/.test(a.rel)).map(a => a.href),
    }));
    expect(s.lang, 'html lang').toBe('nl');
    expect(s.viewport, 'meta viewport').toBe(true);
    expect(s.titel.length, `titel "${s.titel}" (10–65 tekens)`).toBeGreaterThanOrEqual(10);
    expect(s.titel.length, `titel "${s.titel}" (10–65 tekens)`).toBeLessThanOrEqual(65);
    expect(s.h1.length, `precies één h1 (nu: ${JSON.stringify(s.h1)})`).toBe(1);
    expect(s.fotosZonderAlt, 'foto’s zonder alt').toEqual([]);
    expect(s.blankZonderNoopener, 'links met target=_blank zonder rel=noopener').toEqual([]);
    if (/noindex/.test(s.robots)) return; // bedankt-pagina: hoeft niet gevonden te worden
    expect(s.beschrijving.length, `meta description (50–160 tekens): "${s.beschrijving}"`).toBeGreaterThanOrEqual(50);
    expect(s.beschrijving.length, `meta description (50–160 tekens): "${s.beschrijving}"`).toBeLessThanOrEqual(160);
    expect(s.canonical.startsWith(DOMEIN + '/'), `canonical "${s.canonical}" begint met ${DOMEIN}/`).toBe(true);
    expect(s.canonical.endsWith('.html'), `canonical "${s.canonical}" gebruikt een schoon adres`).toBe(false);
    expect(s.ogTitel, 'og:title').not.toBe('');
  });
}

test('beveiligingsheaders op elke pagina', async ({ request }) => {
  for (const { pad } of PAGINAS) {
    const r = await request.get(pad);
    const h = r.headers();
    for (const [naam, waarde] of Object.entries(VERPLICHTE_HEADERS)) {
      expect(h[naam], `${pad}: header ${naam}`).toMatch(waarde);
    }
  }
});

test('geen kapotte interne links, foto’s of bestanden', async ({ page, request }) => {
  const gezien = new Map();
  for (const { pad } of PAGINAS) {
    await page.goto(pad);
    const adressen = await page.evaluate(() => [
      ...[...document.querySelectorAll('a[href]')].map(a => a.href),
      ...[...document.querySelectorAll('img[src], script[src]')].map(e => e.src),
      ...[...document.querySelectorAll('link[rel="stylesheet"][href], link[rel="icon"][href]')].map(e => e.href),
      ...[...document.querySelectorAll('img[data-src]')].map(e => new URL(e.dataset.src, location.href).href),
    ]);
    for (const a of adressen) {
      const u = new URL(a);
      if (u.origin !== new URL(page.url()).origin) continue;
      const sleutel = u.pathname;
      if (!gezien.has(sleutel)) gezien.set(sleutel, { status: (await request.get(sleutel, { maxRedirects: 0 })).status(), van: pad });
      // ankers moeten bestaan op de doelpagina
      if (u.hash && u.hash.length > 1) {
        const doel = sleutel === new URL(page.url()).pathname ? page : null;
        const bestaat = doel ? await page.locator(`[id="${decodeURIComponent(u.hash.slice(1))}"]`).count()
          : await (async () => { const p2 = await page.context().newPage(); await p2.goto(sleutel); const n = await p2.locator(`[id="${decodeURIComponent(u.hash.slice(1))}"]`).count(); await p2.close(); return n; })();
        expect(bestaat, `${pad}: anker ${sleutel}${u.hash} bestaat niet`).toBeGreaterThan(0);
      }
    }
  }
  const kapot = [...gezien].filter(([, v]) => v.status >= 400).map(([k, v]) => `${k} (${v.status}, op ${v.van})`);
  expect(kapot, 'kapotte interne adressen').toEqual([]);
});

test('sitemap en robots kloppen', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const adressen = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(adressen.length, 'sitemap bevat adressen').toBeGreaterThan(0);
  for (const a of adressen) {
    expect(a.startsWith(DOMEIN), `sitemap-adres ${a} begint met ${DOMEIN}`).toBe(true);
    const r = await request.get(new URL(a).pathname, { maxRedirects: 0 });
    expect(r.status(), `sitemap-adres ${a}`).toBe(200);
  }
  const paden = adressen.map(a => new URL(a).pathname).sort();
  expect(paden, 'adressen in de sitemap').toEqual(['/', '/contact', '/kraamcadeauboxen', '/portfolio', '/prematuurkleding', '/privacy', '/werkwijze']);
  for (const oud of ['/producten', '/kraamcadeaubox', '/over']) expect(paden, `${oud} hoort niet meer in de sitemap`).not.toContain(oud);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Sitemap:\s*https:\/\/www\.luxmini\.nl\/sitemap\.xml/i);
});

// Doorverwijzingen (brief navigatie-v2, criterium 4): 301 en Location rechtstreeks naar het eindadres, zonder tussenstap.
const DOORVERWIJZINGEN = {
  '/producten': '/werkwijze', '/producten.html': '/werkwijze', '/over': '/werkwijze', '/over.html': '/werkwijze', '/over-lux': '/werkwijze',
  '/kraamcadeaubox': '/kraamcadeauboxen', '/kraamcadeaubox.html': '/kraamcadeauboxen', '/aanbod': '/kraamcadeauboxen', '/aanbod/': '/kraamcadeauboxen',
  '/shop': '/kraamcadeauboxen', '/product-page/x': '/kraamcadeauboxen', '/klantenservice': '/contact',
};
test('oude adressen geven 301 rechtstreeks naar het eindadres', async ({ request }) => {
  for (const [van, naar] of Object.entries(DOORVERWIJZINGEN)) {
    const r = await request.get(van, { maxRedirects: 0 });
    expect(r.status(), `${van} geeft 301`).toBe(301);
    expect(new URL(r.headers()['location'], 'http://x').pathname, `${van} gaat rechtstreeks naar ${naar}`).toBe(naar);
    const eind = await request.get(naar, { maxRedirects: 0 });
    expect(eind.status(), `${naar} is een eindadres (200, geen tweede doorverwijzing)`).toBe(200);
  }
});

test('geen geheimen in public/', async () => {
  const { readdir } = await import('node:fs/promises');
  const bestanden = (await readdir('public', { recursive: true })).filter(f => /\.(html|js|css|txt|xml|json)$|^_/.test(f.split('/').pop()));
  for (const f of bestanden) {
    const t = await readFile(`public/${f}`, 'utf8');
    expect(t, `public/${f} lijkt een sleutel of token te bevatten`).not.toMatch(/(api[_-]?key|secret|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}/i);
  }
});
