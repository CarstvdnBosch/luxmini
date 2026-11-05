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
