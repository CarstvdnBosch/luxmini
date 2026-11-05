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

test('hoofdnavigatie brengt je naar elke pagina', async ({ page }, info) => {
  await page.goto('/');
  for (const [tekst, doel] of [['Producten', /producten/], ['Kraamcadeaubox', /kraamcadeaubox/], ['Over', /over/], ['Contact', /contact/]]) {
    if (info.project.name === 'desktop') {
      await page.locator('header nav a', { hasText: new RegExp(`^${tekst}$`, 'i') }).first().click();
    } else {
      await page.locator('.burger').first().click();
      await expect(page.locator('.menu-scherm')).toBeVisible();
      await expect(page.locator('.burger').first()).toHaveAttribute('aria-expanded', 'true');
      await page.locator('.menu-scherm a', { hasText: new RegExp(`^\\s*${tekst}\\s*$`, 'i') }).first().click();
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

test('kraamcadeaubox: vier prijzen van € 35 tot € 80', async ({ page }) => {
  await page.goto('/kraamcadeaubox');
  const prijzen = (await page.locator('#formaten .formaat-prijs').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
  expect(prijzen).toEqual(['€ 35', '€ 50', '€ 65', '€ 80']);
});

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
