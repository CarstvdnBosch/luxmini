// Visuele regressie (waarschuwing, niet blokkerend): elke pagina vergeleken met de goedgekeurde basis
// in tests/e2e/basis/<scherm>/. Een verschil komt in het validatierapport; Carst beoordeelt het.
// Basis bijwerken: GitHub → Actions → "Visuele basis bijwerken" (draait in dezelfde omgeving als de controle).
import { test, expect, PAGINAS, wachtOpRust } from './hulp.js';

for (const { pad, naam } of PAGINAS) {
  test(`@visueel ${naam}`, async ({ page }) => {
    await page.goto(pad);
    await wachtOpRust(page);
    // lazy foto's laden en "opkomen bij scrollen" afronden
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await wachtOpRust(page);
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot(`${naam}.png`, {
      fullPage: true,
      mask: [page.locator('.lopend, .lopend-spoor, .balk')], // bewegende regels en de vaste balk
    });
  });
}
