// Beheer S1: toegankelijkheid (axe, WCAG 2.1 AA) van het eerste scherm en elke tab,
// op elk scherm en met rol schrijven en lezen (brief 2026-11-07-beheer-administratie, criterium 10, O21).
import AxeBuilder from '@axe-core/playwright';
import { test, expect, wachtOpRust } from './hulp.js';

const REGELS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const samenvatting = (v) => v.map((o) => `${o.id}: ${o.help}\n` + o.nodes.slice(0, 5).map((n) => `    ${n.target.join(' ')}`).join('\n')).join('\n');

for (const rol of ['schrijven', 'lezen']) {
  test.describe(`beheer, rol ${rol}`, () => {
    test.use({ extraHTTPHeaders: { 'x-testrol': rol } });
    for (const tab of ['Boekingen', 'Overzicht', 'Exporteren']) {
      test(`toegankelijkheid beheer, tab ${tab} (${rol})`, async ({ page }) => {
        await page.goto('/beheer');
        await wachtOpRust(page);
        await expect(page.locator('#wie')).toBeVisible();
        await page.getByRole('tab', { name: tab }).click();
        const uitslag = await new AxeBuilder({ page }).withTags(REGELS).analyze();
        expect(uitslag.violations, `WCAG-overtredingen op /beheer (${tab}, ${rol}):\n${samenvatting(uitslag.violations)}`).toEqual([]);
      });
    }
  });
}
