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
| 2 · Sitecontrole | `scripts/controleer.py` (Playwright Python) | Interacties: intro, collage, tabbladen, balk, prijskaarten, stappen, ankers, mobiel; homepage zoals Stock (drieluik, Technieken, Inspiratie, contrast van witte tekst op foto's), formulier met groepen per onderwerp, thema-raster, Prematuurkleding en Babynest, zes menu-items vanaf 1280 px, tikdoelen 44 px op touch, contactmomenten naar het formulier | ja |
| 4 · Kwaliteit | Playwright Test + axe-core | **Toegankelijkheid** WCAG 2.1 AA op 9 pagina's × 3 schermen + het menu; **SEO** (titel, description, canonical, één h1, og:title, lang); **veiligheid** (beveiligingsheaders, `rel=noopener`, geen geheimen in `public/`); **links** en ankers; **kernpaden** (navigatie, contact, formulierlabels, prijzen, opbouw homepage, thema's binnen twee schermen, contactmomenten, oude adressen, geen consolefouten, geen horizontaal scrollen) | ja |
| 4 · Kwaliteit | Lighthouse CI (mobiel, trage 4G) | **Snelheid**: score ≥ 70, LCP ≤ 4,0 s, CLS ≤ 0,1, TBT ≤ 300 ms, ≤ 3,5 MB per pagina; toegankelijk ≥ 95, best practices ≥ 90, SEO ≥ 90 | ja |
| 4 · Kwaliteit | Playwright Test, `mobiel-ontwerp.spec.js` | **Mobiel ontwerp** op Chromium (390 × 844) en **iPhone/Safari** (WebKit, 390 × 664): tikdoelen 44 px, tekst en velden 16 px, zoom niet geblokkeerd, niets buiten beeld, foto's niet vergroot, contact binnen één tik, regellengte, de balk bedekt geen kop. Alle andere tests draaien ook op de iPhone. | ja |
| 5 · Visueel | Playwright `toHaveScreenshot` | Elke pagina op 3 schermen vergeleken met de goedgekeurde basis (`tests/e2e/basis/`) | nee, waarschuwing |
| Validatierapport | `scripts/validatierapport.mjs` | Bundelt alles + oordelen controleur/ontwerper + open punten (LET OP) + checklist | — |
| GO · Akkoord Carst | label `GO` of reactie `GO` → commitstatus (`go-nogo.yml`) | Alleen de eigenaar van de repository; vervalt bij elke nieuwe commit. Zonder GO staat de status op "wachten" (geen mislukte run, dus geen foutmail) | ja |
| 3 · Rooktest | `scripts/rooktest.sh` | Na live zetten en dagelijks | (live) |

## Betrouwbaarheid in CI (7 nov. 2026)

- **Browsers uit de cache.** Gate 4 en Gate 5 bewaren `~/.cache/ms-playwright` met `actions/cache` (sleutel: besturingssysteem + Playwright-versie, die de workflow opvraagt met `npx playwright --version`). Bij een treffer installeert de stap alleen de systeempakketten (`npx playwright install-deps chromium webkit`); anders `npx playwright install --with-deps chromium webkit`, en daarna gaan de browsers in de cache.
- **Installatie met één herkansing.** Twee pogingen van hooguit 8 minuten (`timeout -k 30 480`), de stap stopt na 18 minuten. In Gate 4 blijft een mislukte installatie blokkerend; in Gate 5 niet (`continue-on-error`).
- **Lighthouse: herkansing alleen voor TBT.** `total-blocking-time` wisselt op de GitHub-runner. Faalt `lhci autorun` en staat in `.lighthouseci/assertion-results.json` als fout (level `error`) **uitsluitend** `total-blocking-time`, dan meet de stap precies één keer opnieuw (weer 3 runs, `median-run`, zelfde grenzen); de tweede uitslag telt. De eerste meting staat dan in `rapport/lighthouse-poging-1/`. Faalt iets anders (prestatiescore, LCP, CLS, toegankelijkheid, SEO, gewicht), of is er geen uitslag, dan is er geen herkansing. `lighthouserc.cjs` verandert hier niet door.
- **Lockbestand.** Er is nog geen `package-lock.json`: in de bouwomgeving van de agents is de npm-registry niet bereikbaar, en een half of met de hand gemaakt lockbestand wordt niet gecommit. Daarom staat er in de workflows nog `npm ci || npm install`. Eenmalige stap (Carst of een agent met internet): op een schone checkout van `main` `npm install --package-lock-only` draaien (of `npm install`), `package-lock.json` via een pull request toevoegen en in `controle.yml` en `visueel-basis.yml` `npm ci || npm install` vervangen door `npm ci`.
- **Screenshots van Gate 2** staan per scherm in het artefact `screenshots`: `<pagina>-<schermmaat>-01.png`, `-02.png` … (max. 8 per pagina en schermmaat; het laatste scherm altijd erbij), zodat de vaste kleurlaag per scherm de kleur van de sectie in beeld heeft.

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
3. **GO**, op een van twee manieren:
   - Carst zet het label **`GO`**; of
   - Carst plaatst een reactie met precies **`GO`** in de pull request (handig op de telefoon). Hoofdletters en spaties of witregels eromheen tellen niet; `GO!`, `GO graag` of `ok GO` tellen niet. De workflow zet dan zelf de status op groen en het label `GO`.

   De verplichte controle "GO · Akkoord Carst" wordt groen; dan kan er gemerged worden. **NO-GO:** geen label en geen reactie `GO`, maar een reactie met wat er anders moet.
4. Alleen het account van de eigenaar telt (bij een reactie: `author_association` OWNER én login gelijk aan de eigenaar). Een label of reactie van iemand anders, ook van een bot of medewerker, verandert niets en laat de run niet mislukken.
5. Een nieuwe commit haalt een eerder GO automatisch weg (label weg, status terug op wachten). Grens is het moment waarop de workflow de status "wachten" op de nieuwste commit zette; een label of reactie van daarvoor telt niet. Staat die status er nog niet (de nieuwe versie wordt nog verwerkt), dan telt geen enkele GO: de workflow zet "wachten", haalt het label weg en vraagt in een reactie opnieuw GO te geven. Een gewijzigde reactie telt niet. Het label dat de workflow na een reactie zelf zet, telt alleen zolang er een ongewijzigde reactie `GO` van de eigenaar is die nieuwer is dan die grens. Getest in `tests/go-nogo.test.js` (onderdeel van `npm test`).
6. De reactievariant werkt pas als `go-nogo.yml` met deze regels op `main` staat: GitHub draait reacties (`issue_comment`) altijd met de workflow van de standaardbranch. De job voor reacties doet geen checkout en voert geen code uit de pull request uit.
7. Agents zetten nooit het label `GO`, plaatsen nooit een reactie `GO` (ook niet met andere hoofdletters of als citaat op een eigen regel) en mergen alleen als Carst daar na zijn GO uitdrukkelijk om vraagt.

## Grenzen aanpassen

- Aanscherpen (strenger) mag altijd via een gewone wijziging.
- Verruimen (een grens losser zetten, een test overslaan of een axe-regel uitzetten) alleen met akkoord van Carst, vastgelegd in de brief. Agents lossen een rode test op door de site te verbeteren, niet door de test aan te passen.

## Visuele basis bijwerken

Na een bewuste ontwerpwijziging: GitHub → Actions → **Visuele basis bijwerken** → *Run workflow* → kies de branch van de pull request. Alleen Carst doet dit, na een goedgekeurde ontwerpwijziging. De nieuwe basis komt als commit op die branch en is daarmee zichtbaar in de pull request. Push daarna nog een commit (of draai de controles opnieuw), zodat Gate 5 en het rapport de nieuwe basis gebruiken.
