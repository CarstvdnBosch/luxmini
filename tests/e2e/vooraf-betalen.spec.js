// Zo werkt het: je betaalt vooraf (brief 2026-11-14-vooraf-betalen, issue #70, criterium 9).
// Op Kraamcadeauboxen, Prematuurkleding en Babynest sluit de betaalzin stap 02 af, precies één keer,
// zichtbaar, en stap 01 en 03 zijn niet veranderd. Draait op alle projecten (desktop, tablet, mobiel, iphone).
import { test, expect } from './hulp.js';

const ZIN = 'Je betaalt vooraf; daarna gaat Carien aan de slag.';
const PAGINAS = [
  { pad: '/kraamcadeauboxen', stappen: [
    'Vertel voor wie de box is en wanneer de baby verwacht wordt.',
    'Kies het thema, het formaat en de kledingmaat. Met naam en geboortedatum maak je de box helemaal persoonlijk. Je betaalt vooraf.',
    'Binnen ongeveer 7 werkdagen is je box klaar om op te halen of te versturen.',
  ] },
  { pad: '/prematuurkleding', stappen: [
    'Samen kies je wat het wordt, en in welke stof, kleur en maat.',
    `Altijd met naam of eigen detail. ${ZIN}`,
    'Carien maakt elk stuk met de hand in haar atelier in Ospel.',
  ] },
  { pad: '/babynest', stappen: [
    'Samen kies je wat het wordt, en in welke stof, kleur en maat.',
    `Altijd met naam of eigen detail. ${ZIN}`,
    'Carien maakt elk stuk met de hand in haar atelier in Ospel.',
  ] },
];

for (const { pad, stappen } of PAGINAS) {
  test(`${pad}: "Je betaalt vooraf" sluit stap 02 van Zo werkt het af`, async ({ page }) => {
    await page.goto(pad);
    const sectie = page.locator('main section[data-label*="Zo werkt het"]');
    await expect(sectie).toHaveCount(1);
    const items = sectie.locator('ol.stappen > li');
    await expect(items).toHaveCount(3);

    const teksten = (await items.locator('p.klein').allTextContents()).map(t => t.replace(/\s+/g, ' ').trim());
    expect(teksten).toEqual(stappen);

    const tweede = items.nth(1).locator('p.klein');
    await tweede.scrollIntoViewIfNeeded();
    await expect(tweede).toBeVisible();
    await expect(tweede).toContainText('Je betaalt vooraf');

    // precies één keer in main
    const aantal = await page.locator('main').evaluate(m => (m.textContent.match(/Je betaalt vooraf/g) || []).length);
    expect(aantal).toBe(1);

    // leesbaar en niet afgesneden, geen horizontaal scrollen
    const maat = await tweede.evaluate(p => ({
      letter: parseFloat(getComputedStyle(p).fontSize),
      afgesneden: p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1,
      breedte: document.documentElement.scrollWidth,
      venster: document.documentElement.clientWidth,
    }));
    expect(maat.letter).toBeGreaterThanOrEqual(16);
    expect(maat.afgesneden).toBe(false);
    expect(maat.breedte).toBeLessThanOrEqual(maat.venster);
  });
}
