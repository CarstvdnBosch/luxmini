// Toegankelijkheid (blokkerend): axe-core volgens WCAG 2.1 AA op elke pagina en elk scherm.
// Ook het menu over het hele scherm wordt gescand. Een overtreding houdt de merge tegen.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, PAGINAS, wachtOpRust } from './hulp.js';

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
