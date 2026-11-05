# Kwaliteitsharness en GO / NO-GO

Dit is het vaste kwaliteitsnet onder elke wijziging aan luxmini.nl. Het is gemaakt voor mensen én voor de agents van de AI-PDLC: **een wijziging is pas klaar als `npm run check` groen is**, en **naar productie gaat pas na het GO van Carst** op het validatierapport.

## Besluiten (5 nov. 2026, Carst)

| Onderwerp | Besluit |
|---|---|
| Testtool | **Playwright Test** (Node), naast de bestaande Python-sitecontrole (`scripts/controleer.py`) |
| Niet-functionele eisen | Toegankelijkheid, snelheid, visuele regressie, veiligheid en SEO |
| Strengheid | Toegankelijkheid, snelheid, veiligheid en SEO **blokkeren** een merge; visuele verschillen **waarschuwen** alleen (Carst beoordeelt) |
| Harness | **Agent-harness**: `npm run check` is het eindcriterium van bouwer en controleur |
| Release | **Validatierapport** per pull request, met **GO / NO-GO** van Carst als verplichte controle |

## Wat wordt er gecontroleerd

| Gate | Tool | Wat | Blokkeert |
|---|---|---|---|
| 1 · Tests | `node --test`, wrangler dry-run | Formulierlogica, Cloudflare-configuratie | ja |
| 2 · Sitecontrole | `scripts/controleer.py` (Playwright Python) | Interacties: intro, collage, tabbladen, balk, prijskaarten, stappen, ankers, mobiel | ja |
| 4 · Kwaliteit | Playwright Test + axe-core | **Toegankelijkheid** WCAG 2.1 AA op 7 pagina's × 3 schermen + het menu; **SEO** (titel, description, canonical, één h1, og:title, lang); **veiligheid** (beveiligingsheaders, `rel=noopener`, geen geheimen in `public/`); **links** en ankers; **kernpaden** (navigatie, contact, formulierlabels, prijzen, geen consolefouten, geen horizontaal scrollen) | ja |
| 4 · Kwaliteit | Lighthouse CI (mobiel, trage 4G) | **Snelheid**: score ≥ 70, LCP ≤ 4,0 s, CLS ≤ 0,1, TBT ≤ 300 ms, ≤ 3,5 MB per pagina; toegankelijk ≥ 95, best practices ≥ 90, SEO ≥ 90 | ja |
| 5 · Visueel | Playwright `toHaveScreenshot` | Elke pagina op 3 schermen vergeleken met de goedgekeurde basis (`tests/e2e/basis/`) | nee, waarschuwing |
| Validatierapport | `scripts/validatierapport.mjs` | Bundelt alles + oordelen controleur/ontwerper + open punten (LET OP) + checklist | — |
| GO · Akkoord Carst | label `GO` | Alleen de eigenaar van de repository; vervalt bij elke nieuwe commit | ja |
| 3 · Rooktest | `scripts/rooktest.sh` | Na live zetten en dagelijks | (live) |

## Lokaal draaien (mensen en agents)

```
npm install
npx playwright install chromium
npm run check          # alles: tests, sitecontrole, kwaliteit, snelheid, visueel (waarschuwing) en het rapport
npm run test:e2e       # alleen Gate 4 (Playwright)
npm run test:snelheid  # alleen Lighthouse
npm run test:visueel   # alleen de schermvergelijking
npm run rapport        # rapport/validatierapport.md en .html
```

Resultaten staan in `rapport/` (niet in git): `playwright-html/index.html` (met traces bij fouten), `lighthouse/`, `visueel-html/` en `validatierapport.html`.

## Het GO / NO-GO-besluit

1. Bij elke pull request zet GitHub het **validatierapport** als reactie in de pull request (en als bijlage, ook in HTML). Het rapport geeft een **advies**: GO als alle blokkerende gates groen zijn én controleur en ontwerper akkoord gaven, anders NO-GO met de reden.
2. Carst bekijkt het rapport en de **preview-link**, en loopt de checklist in het rapport langs (telefoon, laptop, teksten, prijzen, contactlinks, visuele verschillen).
3. **GO:** Carst zet het label **`GO`**. De verplichte controle "GO · Akkoord Carst" wordt groen; dan kan er gemerged worden. **NO-GO:** geen label, en een reactie met wat er anders moet.
4. Een nieuwe commit haalt een eerder GO automatisch weg.
5. Agents zetten het label `GO` nooit en mergen alleen als Carst daar na zijn GO uitdrukkelijk om vraagt.

## Grenzen aanpassen

- Aanscherpen (strenger) mag altijd via een gewone wijziging.
- Verruimen (een grens losser zetten, een test overslaan of een axe-regel uitzetten) alleen met akkoord van Carst, vastgelegd in de brief. Agents lossen een rode test op door de site te verbeteren, niet door de test aan te passen.

## Visuele basis bijwerken

Na een bewuste ontwerpwijziging: GitHub → Actions → **Visuele basis bijwerken** → *Run workflow* → kies de branch van de pull request. De nieuwe basis komt als commit op die branch en is daarmee zichtbaar in de pull request. Push daarna nog een commit (of draai de controles opnieuw), zodat Gate 5 en het rapport de nieuwe basis gebruiken.
