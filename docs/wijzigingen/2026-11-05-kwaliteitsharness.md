# Kwaliteitsharness, validatierapport en GO / NO-GO

- **Datum:** 5 november 2026
- **Aangevraagd door:** Carst
- **Branch:** `wijziging/kwaliteitsharness` (bouwt voort op `wijziging/navigatie-paginas`)
- **Risico:** middel. Raakt de pipeline (`.github/workflows/`), `package.json` en `public/_headers`; de site zelf verandert alleen in titels, meta-descriptions en een extra beveiligingsheader.

## Wens
"Ik wil een harness maken om de software delivery pipeline en alle niet-functionele eisen te verbeteren, met een lichtgewicht testtool (bijv. Playwright)." En: "Kan ik voordat we het in productie zetten een validatierapport ontvangen, dat ik mag valideren met GO / NO-GO voordat we naar productie lanceren?"

## Besluiten (keuzes van Carst, 5 nov. 2026)
- Testtool: **Playwright Test**.
- Niet-functionele eisen: **toegankelijkheid, snelheid, visuele regressie, veiligheid en SEO**.
- Strengheid: **blokkeren**, behalve visueel (**waarschuwing**).
- Harness: **agent-harness** (`npm run check` is het eindcriterium van bouwer en controleur).
- Release: **validatierapport** per pull request en **GO / NO-GO** door Carst als verplichte controle.

## Acceptatiecriteria
1. `npm run check` draait in volgorde: `npm test`, sitecontrole, Playwright Test (Gate 4), Lighthouse CI (Gate 4), visueel (Gate 5, waarschuwing) en het validatierapport; de exitcode is rood als een blokkerende stap faalt.
2. Gate 4 test op desktop 1440, tablet 768 en mobiel 390: axe WCAG 2.1 AA op home, producten, kraamcadeaubox, over, contact, privacy, bedankt en het menu; SEO (lang, titel 10–65, description 50–160, canonical op www.luxmini.nl zonder .html, één h1, og:title); beveiligingsheaders (nosniff, referrer-policy, frame-options, permissions-policy, HSTS); kapotte links en ankers; sitemap/robots; geen geheimen in `public/`; kernpaden (navigatie, contact, formulierlabels, prijzen, geen consolefouten, niet breder dan het scherm).
3. Lighthouse CI meet vijf pagina's mobiel met de grenzen uit `docs/kwaliteit.md` en blokkeert bij overschrijding.
4. Gate 5 vergelijkt elke pagina met `tests/e2e/basis/` en meldt verschillen alleen als waarschuwing; de basis is bij te werken met de workflow "Visuele basis bijwerken".
5. Bij elke pull request staat het validatierapport als (bijgewerkte) reactie in de pull request, in de job-samenvatting en als artefact (md + html), met advies GO of NO-GO en de reden.
6. De controle "GO · Akkoord Carst" is alleen groen als de eigenaar van de repository het label `GO` zette; een nieuwe commit haalt het label weg.
7. Agents, AI-PDLC, `CLAUDE.md` en `docs/kwaliteit.md` beschrijven de harness en het GO / NO-GO-besluit; agents zetten het label nooit zelf.
8. Bevindingen van de harness op de huidige site zijn opgelost in de site, niet door de test te versoepelen.

## Open vragen voor Carst
- Ruleset op `main`: voeg `Gate 4 · Kwaliteit` en `GO · Akkoord Carst` toe als verplichte controles (README stap 3).
- De eerste visuele basis maken (Actions → "Visuele basis bijwerken") zodra de navigatie-wijziging is goedgekeurd.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Besluiten met Carst in het gesprek (5 nov.); brief geschreven |
| Bouwen | Claude (hoofdsessie) | Harness, workflows, rapport en GO / NO-GO gebouwd; harness vond te lange titels/description, ontbrekende description op privacy en ontbrekende HSTS: opgelost |
| Eerste meting in GitHub | Claude (hoofdsessie) | axe: 4 links met afwijkende toegankelijke naam (prijskaarten) → opgelost. Lighthouse: CLS tot 0,35 en LCP tot 6,5 s door Google Fonts → lettertypes zelf gehost met preload (CLS 0); LCP-foto's kleiner (srcset, fetchpriority); paginakop direct zichtbaar; testserver comprimeert zoals Cloudflare. Producten, kraamcadeaubox, over, contact nu 99–100. |
| Besluit Carst (5 nov.) | Carst | Homepage: LCP 4,8 s en TBT 0,7 s door de intro van ca. 3 s. Besluit: **intro korter** (ca. 1,5 s). Ontwerpregel Intro in CLAUDE.md aangepast; kernpaden testen de duur (< 2 s). |
| Controleren | website-controleur | Volgt na 6 nov. 13:00 (weeklimiet) |
| Ontwerpgate | website-ontwerper | n.v.t. (alleen techniek; titels en meta-tags zijn niet zichtbaar op de pagina) |
