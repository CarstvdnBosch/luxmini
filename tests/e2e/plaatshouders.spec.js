// Plaatshouder-gate (blokkerend, brief 2026-11-07 mobiel-verbeteringen, criterium 6): op geen enkele pagina staat een
// plaatshouder in beeld of in de teksten voor schermlezers en zoekmachines. Bijvoorbeeld "[prijs]", "[nummer]", "[naam]",
// "TODO" of "lorem ipsum". HTML-commentaar, scripts en stijlen tellen niet mee (daar mogen LET OP-notities staan).
// Draait op alle projecten (desktop, tablet, mobiel, iphone).
import { readdirSync } from 'node:fs';
import { test, expect } from './hulp.js';

const BESTANDEN = readdirSync(new URL('../../public/', import.meta.url)).filter(f => f.endsWith('.html')).sort();
const PLAATSHOUDER = /\[[^\]\n]{1,40}\]|TODO|lorem ipsum/i;

for (const bestand of BESTANDEN) {
  test(`${bestand}: geen plaatshouders in tekst, alt, aria-label, title of description`, async ({ page }) => {
    await page.goto(`/${bestand}`);
    const teksten = await page.evaluate(() => {
      const uit = [];
      // zichtbare tekst, plus de inhoud van het menu over het hele scherm (dat is dicht, dus niet in innerText)
      uit.push(['zichtbare tekst', document.body.innerText]);
      const menu = document.querySelector('#menu-scherm');
      if (menu) uit.push(['menu', menu.textContent]);
      for (const el of document.querySelectorAll('[alt], [aria-label], [title]')) {
        for (const at of ['alt', 'aria-label', 'title']) if (el.hasAttribute(at)) uit.push([`${el.tagName.toLowerCase()}[${at}]`, el.getAttribute(at)]);
      }
      uit.push(['<title>', document.title]);
      const d = document.querySelector('meta[name="description"]');
      uit.push(['meta description', d ? d.getAttribute('content') : '']);
      return uit;
    });
    const gevonden = [];
    for (const [waar, tekst] of teksten) {
      for (const regel of (tekst || '').split('\n')) {
        const m = regel.match(PLAATSHOUDER);
        if (m) gevonden.push(`${waar}: "${m[0]}" in "${regel.trim().slice(0, 80)}"`);
      }
    }
    expect(gevonden, 'plaatshouders op de pagina').toEqual([]);
  });
}
