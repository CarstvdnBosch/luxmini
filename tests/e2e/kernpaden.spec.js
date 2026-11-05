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

// Vijf hoofdpagina's in deze volgorde (navigatie v2); op desktop (1440 px, dus >= 1200) staan ze in de header.
const HOOFDMENU = [['Werkwijze', /\/werkwijze(\.html)?$/], ['Kraamcadeauboxen', /\/kraamcadeauboxen(\.html)?$/],
  ['Prematuurkleding', /\/prematuurkleding(\.html)?$/], ['Portfolio', /\/portfolio(\.html)?$/], ['Contact', /\/contact(\.html)?$/]];

test('header: vijf links in de juiste volgorde, elk met het juiste doel', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'de header-links staan er vanaf 1200 px; daaronder de burger');
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

// Oude adressen (301 naar /werkwijze): het anker gaat mee en de kop van die sectie staat in beeld.
for (const [oud, nieuw, anker] of [['/producten#siliconen', '/werkwijze', 'siliconen'], ['/over#hoe-ik-werk', '/werkwijze', 'hoe-ik-werk']]) {
  test(`oud adres ${oud} landt op ${nieuw}#${anker} met de kop in beeld`, async ({ page }) => {
    await page.goto(oud);
    await expect(page).toHaveURL(new RegExp(`${nieuw}#${anker}$`));
    await page.waitForTimeout(300);
    const kop = page.locator(`[id="${anker}"]`).locator('h1, h2, .label').first();
    await expect(kop).toBeInViewport();
  });
}

test('intro speelt bij het eerste bezoek en is binnen 2 s weg (besluit Carst: ca. 1,5 s)', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop', 'één keer is genoeg');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/intro-aan/);
  const start = Date.now();
  await expect(page.locator('html')).not.toHaveClass(/intro-aan/, { timeout: 4000 });
  expect(Date.now() - start, 'duur van de intro in ms').toBeLessThan(2000);
  await expect(page.locator('.hero h1')).toBeVisible();
  await ctx.close();
});
