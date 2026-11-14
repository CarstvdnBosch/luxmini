// Toegankelijkheid (blokkerend): axe-core volgens WCAG 2.1 AA op elke pagina en elk scherm.
// Ook het menu over het hele scherm wordt gescand. Een overtreding houdt de merge tegen.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGINAS, wachtOpRust, turnstileIframe } from './hulp.js';

const REGELS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function samenvatting(overtredingen) {
  return overtredingen.map(o => `${o.impact || '-'} · ${o.id}: ${o.help}\n` +
    o.nodes.slice(0, 5).map(n => `    ${n.target.join(' ')} — ${n.failureSummary.split('\n').slice(1).join(' ').trim()}`).join('\n')).join('\n');
}

for (const { pad, naam } of PAGINAS) {
  test(`toegankelijkheid ${naam}`, async ({ page }, info) => {
    await page.goto(pad);
    await wachtOpRust(page);
    // de hele pagina langs, zodat "opkomen bij scrollen" alles zichtbaar maakt
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const uitslag = await new AxeBuilder({ page }).withTags(REGELS).analyze();
    await info.attach('axe', { body: JSON.stringify(uitslag.violations, null, 2), contentType: 'application/json' });
    expect(uitslag.violations, `WCAG-overtredingen op ${pad}:\n${samenvatting(uitslag.violations)}`).toEqual([]);
  });
}

test('toegankelijkheid menu over het hele scherm', async ({ page }) => {
  await page.goto('/');
  const knop = page.locator('.burger').first();
  await knop.click();
  await page.waitForTimeout(800);
  const uitslag = await new AxeBuilder({ page }).include('.menu-scherm').withTags(REGELS).analyze();
  expect(uitslag.violations, `WCAG-overtredingen in het menu:\n${samenvatting(uitslag.violations)}`).toEqual([]);
});

// Brief 2026-11-06: het formulier met elke groep open (kraamcadeaubox, prematuurkleding, babynest) heeft 0 fouten
for (const onderwerp of ['Kraamcadeaubox', 'Prematuurkleding', 'Babynest']) {
  test(`toegankelijkheid formulier met groep ${onderwerp}`, async ({ page }) => {
    await page.goto('/contact#formulier');
    await wachtOpRust(page);
    await page.locator('select[name="onderwerp"]').selectOption(onderwerp);
    if (onderwerp === 'Kraamcadeaubox') await page.locator('input[name="box_formaat"][value="50"]').check();
    await page.waitForTimeout(400);
    const uitslag = await new AxeBuilder({ page }).include('#formulier').withTags(REGELS).analyze();
    expect(uitslag.violations, `WCAG-overtredingen in het formulier (${onderwerp}):\n${samenvatting(uitslag.violations)}`).toEqual([]);
  });
}

// Brief 2026-11-11: de contactpagina met elk van beide foutmeldingen (ongeldig en versturen) heeft 0 fouten
for (const [soort, pad] of [['ongeldig', '/contact?verzonden=fout#formulier'], ['versturen', '/contact?verzonden=fout&reden=versturen#formulier']]) {
  test(`toegankelijkheid contact met melding ${soort}`, async ({ page }) => {
    await page.goto(pad);
    await wachtOpRust(page);
    await expect(page.locator('.formulier .melding[role="alert"]')).toContainText('Je bericht is niet verstuurd.');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const uitslag = await new AxeBuilder({ page }).withTags(REGELS).analyze();
    expect(uitslag.violations, `WCAG-overtredingen op ${pad}:\n${samenvatting(uitslag.violations)}`).toEqual([]);
  });
}

// Brief 2026-11-11-c7-stofkeuze (O12): de stofkeuze met het blok "Je eigen stof" open, met een gekozen foto en een foutmelding, heeft 0 fouten
test('toegankelijkheid formulier met eigen stof (blok open, foto en melding)', async ({ page }) => {
  await page.goto('/contact?onderwerp=kraamcadeaubox&thema=eigen#formulier');
  await wachtOpRust(page);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await page.locator('input[name="stof_foto"]').setInputFiles({ name: 'stof.png', mimeType: 'image/png', buffer: png });
  await page.locator('input[name="stof_link"]').fill('www.stof.test');
  await page.locator('input[name="stof_link"]').blur();
  await expect(page.locator('#stof-link-fout')).toContainText('Let op:');
  await page.locator('.stofkeuze').evaluate(el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(400);
  const uitslag = await new AxeBuilder({ page }).include('#formulier').withTags(REGELS).analyze();
  expect(uitslag.violations, `WCAG-overtredingen in de stofkeuze:\n${samenvatting(uitslag.violations)}`).toEqual([]);
});

// Brief 2026-11-14-formulier-botbescherming (criterium 21): de drie nieuwe meldingen, het zichtbare Turnstile-vak en zonder JavaScript
for (const reden of ['controle', 'te-veel', 'te-snel']) {
  test(`toegankelijkheid contact met melding ${reden}`, async ({ page }) => {
    const pad = `/contact?verzonden=fout&reden=${reden}#formulier`;
    await page.goto(pad);
    await wachtOpRust(page);
    await expect(page.locator('.formulier .melding[role="alert"]')).toContainText('Je bericht is niet verstuurd.');
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    const uitslag = await new AxeBuilder({ page }).withTags(REGELS).analyze();
    expect(uitslag.violations, `WCAG-overtredingen op ${pad}:\n${samenvatting(uitslag.violations)}`).toEqual([]);
  });
}

// Zonder JavaScript: axe zelf heeft JavaScript nodig (in een context met javaScriptEnabled: false blijft frame.evaluate hangen,
// CI 14 nov.). Daarom laden we de pagina zoals een browser zonder JavaScript haar toont: alle <script> eruit en de inhoud van
// <noscript> als gewone inhoud (dat doet een browser zonder JavaScript ook). Zo toetst axe precies wat die bezoeker ziet.
async function alsZonderJavaScript(page) {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const res = await route.fetch();
    const html = (await res.text())
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<noscript>/gi, '<div data-noscript="">')
      .replace(/<\/noscript>/gi, '</div>');
    const headers = { ...res.headers() };
    delete headers['content-length'];
    await route.fulfill({ status: res.status(), headers, body: html });
  });
}
test('toegankelijkheid contact zonder JavaScript met de <noscript>-regel (testsite key)', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-testturnstile': 'geslaagd' });
  await alsZonderJavaScript(page);
  await page.goto('/contact#formulier');
  // echt de toestand zonder JavaScript: geen .js-klasse, geen formtijd-veld, de <noscript>-regel zichtbaar
  await expect(page.locator('html')).not.toHaveClass(/(^|\s)js(\s|$)/);
  await expect(page.locator('form.formulier input[name="formtijd"]')).toHaveCount(0);
  await expect(page.locator('#formulier .noscript-melding')).toBeVisible();
  const uitslag = await new AxeBuilder({ page }).withTags(REGELS).analyze();
  expect(uitslag.violations, `WCAG-overtredingen zonder JavaScript:\n${samenvatting(uitslag.violations)}`).toEqual([]);
});

// Het zichtbare vak kan alleen met het echte script van Cloudflare (testsleutel "interactie"). In CI altijd; lokaal alleen als
// challenges.cloudflare.com bereikbaar is.
test('toegankelijkheid formulier met het zichtbare Turnstile-vak', async ({ page }) => {
  let bereikbaar = !!process.env.CI;
  if (!bereikbaar) { try { await fetch('https://challenges.cloudflare.com/turnstile/v0/api.js', { signal: AbortSignal.timeout(3000) }); bereikbaar = true; } catch { bereikbaar = false; } }
  test.skip(!bereikbaar, 'challenges.cloudflare.com niet bereikbaar (alleen lokaal; in CI draait deze test altijd)');
  await page.setExtraHTTPHeaders({ 'x-testturnstile': 'interactie' });
  await page.goto('/contact#formulier');
  await expect(page.locator('.turnstile-vak')).toHaveClass(/zichtbaar/, { timeout: 30000 });
  // Cloudflare zet het iframe in een gesloten shadow root (CSS-locators zien het niet); zoek het via de frames van de pagina
  await turnstileIframe(page);
  const uitslag = await new AxeBuilder({ page }).include('#formulier').withTags(REGELS).analyze();
  expect(uitslag.violations, `WCAG-overtredingen met het Turnstile-vak:\n${samenvatting(uitslag.violations)}`).toEqual([]);
});
