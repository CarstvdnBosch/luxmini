# Productrij als carrousel en maat 44, 46 en 48 (Story 1, issue #63 · Story 16)

- **Datum:** 2026-11-12
- **Aangevraagd door:** Carst (user stories 1 en 16, door hem goedgekeurd op 12 nov. 2026; Story 16 om 19:33)
- **Branch:** `wijziging/productrij-carrousel-en-maten`
- **Issue:** #63 (Story 1, de pull request kan `Closes #63` bevatten). Voor Story 16 is geen issuenummer bekend (zie Open vragen).
- **Risico:** hoog — Story 16 raakt het formulier (`public/contact.html` en de validatie in `src/formulier.js`). Story 1 zelf is laag tot midden: alleen 002 op Kraamcadeauboxen en een kleine aanpassing in de gedeelde carrousellogica van `main.js` (knoppen verbergen als een rij niet scrolt), die ook thema's, stoffen en de fotorij op Werkwijze raakt.

## Doel
1. Bezoekers op tablet en smalle schermen zien bij "002 — Wat er in de box kan" geen horizontale scrollbalk meer: de productrij werkt zoals de stoffen en thema's (vegen, of pijlknoppen met een muis).
2. Ouders die een kledingmaat kiezen, kunnen ook maat 44, 46 en 48 opgeven; die maat komt ook echt in de mail aan Carien.

## Wens
- **Story 1 (Carst, 12 nov.):** de productrij "002 — Wat er in de box kan" op `kraamcadeauboxen.html` toont nog een horizontale scrollbalk (schermafdruk op ca. 460 px; ook tablet, backlog issue #63). Geen scrollbalken; gebruik het bestaande `.carrousel`-patroon zoals de stoffen en thema's. Dit is de vervolgstap die in brief `2026-11-11-c6-stoffen-zonder-scrollbalk.md` al werd genoemd.
- **Story 16 (Carst, 12 nov. 19:33):** "kledingmaat … kan ook 44, 46, 48". De maatkeuzes `box_maat`, `prem_maat` en `op_maat` krijgen maat 44, 46 en 48 (waar 44 nog niet bestaat). `src/formulier.js` valideert de waarden, dus ook daar toestaan. De `CLAUDE.md`-regel over de maten bijwerken.

## Acceptatiecriteria

### Story 1 — productrij zonder scrollbalk
1. In `kraamcadeauboxen.html` is de productrij een `.carrousel` met een `id` (bijvoorbeeld `productenrij`), `role="region"`, `aria-label="Producten"` en `tabindex="0"`. De acht producten blijven een lijst (`ul` met acht `li`, in deze volgorde: Knuffel, Swaddle, Broekje, Sjaaltje, Shirtje, Douchehandschoen, Bijtring, Speenkoord), met ongewijzigde foto's, alt-teksten, namen en "vanaf €"-regels.
2. `data-scrollrij` komt nergens meer voor in `public/`. Het losse scrollrij-gedrag in `main.js` en het eigen `overflow-x`/scroll-snap van `.producten` in `style.css` zijn weg (of alleen nog via `.carrousel`). De scroll-snap per tegel (`scroll-snap-align: start`) blijft.
3. Direct onder de productrij staat een `.carrousel-knoppen` met twee knoppen `.carrousel-knop` met `aria-label` "Vorige producten" en "Volgende producten" en `aria-controls` gelijk aan het `id` van de rij.
4. Op 390, 460, 768 en 1024 px (Chromium, WebKit en Firefox) heeft de productrij geen zichtbare scrollbalk (`scrollbar-width: none` of `::-webkit-scrollbar` verborgen; de hoogte van de rij is gelijk aan de hoogte van de inhoud) en geldt `document.documentElement.scrollWidth === window.innerWidth`.
5. Met een muis op 768 en 1024 px: bij het laden `aria-disabled="true"` op "Vorige producten"; na genoeg klikken op "Volgende producten" heeft die `aria-disabled="true"` en ligt Speenkoord helemaal binnen de rij; na elke klik ligt een tegel precies op de rand (snap); geen product wordt overgeslagen.
6. Toetsenbord: Tab bereikt de rij (zichtbare focusrand), pijltoets rechts scrolt de rij, Home gaat naar Knuffel en End naar Speenkoord, zonder dat de pagina verticaal verspringt.
7. Op touch (390 px iPhone in WebKit en 768 px tablet) zijn de carrouselknoppen niet zichtbaar en scrolt de rij met vegen.
8. Vanaf 1025 px (getoetst op 1025, 1280 en 1440) staan de acht producten in één raster binnen de rand, zonder knoppen in beeld en zonder `tabindex` op de rij. Op 1025 px wordt geen productnaam afgesneden en loopt geen naam over zijn kolom (Douche­handschoen breekt af op het zachte afbreekstreepje). Lukt dat niet, dan loopt de carrousel door tot 1279 px en begint het raster vanaf 1280 px (zie Ontwerprichting punt 2); de bouwer noteert in het Verloop welke grens het werd.
9. Algemeen in `main.js`: scrolt een `.carrousel` niet (`scrollWidth ≤ clientWidth`), dan zijn zijn knoppen verborgen (niet twee uitgeschakelde knoppen) en heeft de rij geen tabstop. Bij formaatwijziging (resize) wordt dit opnieuw bepaald. Thema's, stoffen en de fotorij op Werkwijze werken verder als voorheen (bestaande e2e-tests blijven groen zonder versoepeling).
10. Zonder JavaScript is de productrij bruikbaar: met een muis een dunne scrollbalk (zoals elke `.carrousel`), geen knoppen.

### Story 16 — maat 44, 46 en 48
11. `contact.html`, select `box_maat`: Weet ik nog niet (standaard, `value=""`) · Maat 44 · 46 · 48 · 50 · 56 · 62 · 68 · 74 (waarden `44` … `74`).
12. Select `prem_maat`: Nog niet gekozen (`value=""`) · Maat 32 · 38 · 44 · 46 · 48 · 50 · Anders / gewicht (`anders`).
13. Select `op_maat`: Nog niet gekozen (`value=""`) · Maat 32 · 38 · 44 · 46 · 48 · 50 · 56 · 62 · 68 · 74 · 80 · 86 · Anders (`anders`).
14. De schrijfwijze van nieuwe opties is gelijk aan de bestaande ("Maat 46"). Het "Anders"-gedrag (vrij veld alleen bij Anders via `:has`, zonder `:has` altijd met "Alleen bij anders: ") en de opmaak (16 px, minstens 44 px hoog op 390 px) veranderen niet.
15. `src/formulier.js` (`MATEN`) staat precies deze waarden toe: `box_maat` 44, 46, 48, 50, 56, 62, 68, 74; `prem_maat` 32, 38, 44, 46, 48, 50, anders; `op_maat` 32, 38, 44, 46, 48, 50, 56, 62, 68, 74, 80, 86, anders. In de mail staat bijvoorbeeld "Kledingmaat: maat 46", "Maat van de baby: maat 48", "Maat: maat 44". Andere waarden (bijv. 42, 47, 92) vallen weg zoals nu.
16. `CLAUDE.md`, ontwerpregel over het contactformulier, zin "Maatkeuzes": bijgewerkt naar de lijsten van criteria 11–13, met verwijzing naar deze brief (Story 16, 12 nov.). `CLAUDE.md` bij Kraamcadeauboxen en de regel "Geen zichtbare scrollbalken": de productrij staat erbij als `.carrousel` (naast thema's, stoffen en fotorij Werkwijze).

### Tests en harness
17. **Unit (`tests/formulier.test.js`):** de bestaande maattests volgen de nieuwe lijsten: per select alle toegestane waarden geven `maat N`; 44, 46 en 48 zijn nu toegestaan bij `box_maat` (en `44` staat niet meer in de lijst met geweigerde waarden); 46 en 48 bij `prem_maat` en `op_maat`; geweigerd blijven o.a. 42, 47, 92, `<b>46</b>`, `46cm` en lange invoer. Een mailtest controleert `\nKledingmaat: maat 46\n`. Geen bestaande controle wordt geschrapt, alleen de verwachte lijsten worden aangepast aan het besluit van Carst.
18. **E2e formulier (`tests/e2e/homepage-zoals-stock.spec.js`, keuzetest regel ~63–67):** verwachte opties van de drie selects volgens criteria 11–13. Een verzending via de testmodus (`x-testmail: ok`) met Kraamcadeaubox en maat 46 levert "Kledingmaat: maat 46" in de opgebouwde mail (via `src/contact.js` in `scripts/serveer.mjs`).
19. **E2e productrij (nieuwe test, bijvoorbeeld "Story 1 — productrij als carrousel" in `tests/e2e/kernpaden.spec.js` of `mobiel-ontwerp.spec.js`):** dekt criteria 1, 4 (geen scrollbalk: `offsetHeight − clientHeight === 0` en berekende `scrollbar-width`; geen horizontaal scrollen van de pagina) op 390, 460, 768 en 1024 px; 5 (knoppen, `aria-disabled`, Speenkoord in beeld) met een muis op 768 en 1024 px; 6 (Home/End); 7 (geen knoppen op touch); 8 (raster en geen knoppen/tabstop op 1280 en 1440, geen afgesneden naam op 1025); ontwerpcriterium 2 (2 producten volledig en ≥ 24 px van het derde op 390 px; ≥ 4 volledig op 768 px; eerste product op 32 px). De test draait in de bestaande projecten (desktop, tablet, mobiel en WebKit).
20. **Sitecontrole (`scripts/controleer.py`):** controleert dat `kraamcadeauboxen.html` geen `data-scrollrij` meer heeft en dat de productrij `aria-controls`-knoppen heeft, zoals bij de stoffen. `FORMULIER_VELDEN` blijft gelijk (namen veranderen niet).
21. **Visueel:** basisschermen wijken alleen af in 002 op Kraamcadeauboxen (tablet en mobiel) en, als nodig, de contactpagina met geopende select; de basis wordt bijgewerkt via `visueel-basis.yml` en de bouwer noemt welke schermen.
22. `npm run check` is groen (tests, sitecontrole, axe zonder nieuwe fouten op `kraamcadeauboxen.html` en `contact.html`, SEO, veiligheid, Lighthouse, visueel en het validatierapport). Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting

**Ontwerprichting**

1. **Producten in het bestaande patroon (Story 1).** De productrij in 002 wordt hetzelfde soort rij als de stoffen eronder. Concreet: `class="producten carrousel"` met een `id` (bijvoorbeeld `productenrij`), `role="region"`, `aria-label="Producten"` en `tabindex="0"`. Het losse `data-scrollrij`-gedrag en het eigen `overflow-x` in `.producten` vervallen; de scroll-snap per tegel blijft. Direct onder de rij komt een eigen `.carrousel-knoppen` met "Vorige producten" en "Volgende producten" (`aria-controls`). Gebruik dezelfde plaats en tussenruimte als bij de stoffen (`.in-de-box .carrousel-knoppen`), zodat de twee rijen gelijk ogen. De bestaande logica in `main.js` doet de rest: één set per klik, `aria-disabled` aan begin en eind, Home en End. Er komt geen nieuw patroon bij.
2. **Desktop vanaf 1025 px: geen carrousel nodig.** De acht producten blijven daar in het raster van acht kolommen binnen de rand. Er is niets te scrollen, dus er staan geen pijlknoppen en de rij is geen tabstop. Verberg de knoppen ook algemeen als een `.carrousel` niet scrolt (`scrollWidth ≤ clientWidth`), dus niet twee uitgeschakelde knoppen laten staan. Toets op 1025 px of "Douche­handschoen" netjes afbreekt en nergens wordt afgesneden. Lukt dat niet, laat de carrousel dan doorlopen tot 1279 px (de grens van het menu) en begin het raster pas vanaf 1280 px.
3. **Tablet (761–1024 px) en mobiel (≤ 760 px).** De rij begint links op de rand (32 px op mobiel) en loopt door tot de schermrand, net als `.stoffen` op mobiel (`scroll-padding-inline` gelijk aan de rand). Rechts is altijd een stukje van het volgende product te zien, als hint dat je kunt vegen. De tegels blijven even groot: 160 px op tablet en 136 px op mobiel. Op touch zijn er geen knoppen en is er nergens een scrollbalk, ook niet in Safari of Firefox.
4. **Hiërarchie blijft gelijk.** Eerst het label 002, dan de producten met naam en "vanaf €", dan "De stoffen" met de stoffenrij. Twee rijen onder elkaar moeten als één familie ogen: dezelfde tussenruimte tussen rij en knoppen en tussen knoppen en de volgende kop. Er komt geen extra tekst zoals "veeg voor meer".
5. **Formulier (Story 16).** Alleen extra opties in de bestaande selects, in oplopende volgorde en in dezelfde schrijfwijze ("maat 44"). Bij Kraamcadeaubox: Weet ik nog niet · maat 44 · 46 · 48 · 50 · 56 · 62 · 68 · 74. Bij Prematuurkleding: maat 32 · 38 · 44 · 46 · 48 · 50 · Anders / gewicht. Bij Iets op maat: maat 32 · 38 · 44 · 46 · 48 · 50 · 56 … 86 · Anders. De opmaak en het "Anders"-gedrag veranderen niet.

**Ontwerpcriteria (toetsbaar)**

1. Op 390, 460, 768 en 1024 px is in "002 — Wat er in de box kan" geen scrollbalk te zien (Chromium, WebKit en Firefox). De pagina scrolt niet horizontaal: `document.documentElement.scrollWidth` is gelijk aan de breedte van het venster.
2. Op 390 px staan 2 producten volledig in beeld en is van het derde minstens 24 px te zien. Op 768 px staan er minstens 4 volledig, plus een stukje van het volgende. Het eerste product begint op de zijmarge (32 px op 390 px).
3. Met een muis op 768 en 1024 px staan onder de productrij twee knoppen van 44 × 44 px. Bij het laden heeft "Vorige" `aria-disabled="true"`. Na genoeg klikken op "Volgende" heeft "Volgende" `aria-disabled="true"` en is het laatste product (Speenkoord) helemaal te zien. Eén klik schuift één set op; daarna staat een tegel precies op de rand (snap).
4. Op touch (390 px, iPhone in WebKit) staan er geen carrouselknoppen en werkt vegen. Met het toetsenbord: de rij krijgt focus met een zichtbare focusrand, de pijltoetsen scrollen de rij, en Home en End gaan naar het eerste en laatste product.
5. Op 1440 en 1280 px staan alle acht producten in één rij binnen de rand, zonder knoppen en zonder tabstop op de rij. Op 1025 px is geen productnaam afgesneden en loopt er geen naam over de rand van zijn kolom.
6. Producten- en stoffenrij lijken op elkaar: dezelfde knoppen, dezelfde afstand van rij tot knoppen (±4 px) en dezelfde linkerrand. Axe meldt geen nieuwe fouten op `kraamcadeauboxen.html`.
7. Formulier: de drie maatselects tonen precies de opgegeven opties in oplopende volgorde en blijven 16 px en minstens 44 px hoog op 390 px. "Weet ik nog niet" blijft de standaardkeuze bij Kraamcadeaubox. Een verzending met maat 46 komt als "maat 46" in de testmail.
8. De visuele basis wijkt alleen af in 002 op Kraamcadeauboxen (tablet en mobiel; knoppen bij de producten). De contactpagina mag alleen afwijken als er een geopende select in beeld staat.

## Bestanden
- `public/kraamcadeauboxen.html` — productrij als `.carrousel` met `id`, knoppen eronder
- `public/assets/css/style.css` — `.producten` (tablet/mobiel via `.carrousel`, eigen `overflow-x` weg, rand en `scroll-padding-inline` zoals `.stoffen`), afstand van `.carrousel-knoppen` bij de producten
- `public/assets/js/main.js` — `data-scrollrij`-blok weg; carrousellogica verbergt knoppen en tabstop als een rij niet scrolt
- `public/contact.html` — opties in `box_maat`, `prem_maat`, `op_maat`
- `src/formulier.js` — `MATEN`
- `tests/formulier.test.js` — maattests
- `tests/e2e/homepage-zoals-stock.spec.js` — verwachte maatopties en testmail met maat 46
- `tests/e2e/kernpaden.spec.js` of `tests/e2e/mobiel-ontwerp.spec.js` — nieuwe test productrij
- `scripts/controleer.py` — controle productrij (geen `data-scrollrij`, knoppen met `aria-controls`)
- `tests/e2e/basis/` — bijgewerkte basisschermen (via `visueel-basis.yml`)
- `CLAUDE.md` — maatkeuzes en productrij in het carrouselpatroon

## Buiten scope
- Geen andere producten, prijzen, foto's of teksten in 002; de lijntekening van de douchehandschoen blijft (wacht op een foto, `docs/fotolijst.md`).
- Geen wijziging aan de stoffen-, thema- of fotorij behalve het algemene verbergen van knoppen als een rij niet scrolt.
- Geen nieuwe maten buiten 44, 46 en 48; geen maattabel of uitleg bij de maten; het vooraf invullen via `?onderwerp=…&formaat=…` blijft gelijk.
- Geen wijziging aan `wrangler.jsonc`, `_redirects`, `_headers` of `.github/workflows/`.
- Geen wijziging aan de verzending van de mail (`src/contact.js`), alleen de toegestane waarden in `src/formulier.js`.

## Open vragen
Geen van deze vragen blokkeert het bouwen.
1. **Eén story per brief.** De werkwijze vraagt één story per brief. Deze brief combineert Story 1 en Story 16, op uitdrukkelijk verzoek van de opdrachtgever. Voor Story 16 is geen issuenummer bekend. Voorstel: de pull request krijgt `Closes #63`. Heeft Story 16 een issue, dan komt dat nummer er ook bij. Anders gaat er een opmerking bij dat Story 16 is meegenomen. Wil Carst liever twee pull requests, dan kan de bouwer de wijziging opsplitsen in twee commits of branches.
2. **"Nog niet gekozen" bij Prematuurkleding en Iets op maat.** De optielijst van de ontwerper noemt die eerste lege keuze niet, en ontwerpcriterium 7 zegt "precies de opgegeven opties". In deze brief blijft "Nog niet gekozen" staan (`value=""`), omdat "de opmaak en het Anders-gedrag niet veranderen" en de keuze optioneel is. De ontwerper bevestigt dat bij de ontwerpgate.
3. **Hoofdletter.** De ontwerper schrijft "maat 44". De bestaande opties zijn "Maat 44" en in de mail staat "maat 44". Deze brief volgt de bestaande schrijfwijze ("Maat 46" in de lijst, "maat 46" in de mail), zoals de ontwerper vraagt met "in dezelfde schrijfwijze".
4. **Lijst of region.** In de ontwerprichting krijgt de rij `role="region"`. Staat die rol direct op de `ul`, dan verdwijnt de lijststructuur voor schermlezers. Voorstel: dezelfde opbouw als de stoffen, dus een `div` als region (`id`, `.carrousel`) met daarin de `ul role="list"`. De bouwer bepaalt waar de klasse `.producten` komt (raster op de `ul`). Criterium 1 vraagt alleen dat beide behouden blijven.
5. **Carien.** De maten zijn een besluit van Carst; Carien kan ze later bijstellen (zoals bij C5). Of maat 44–48 ook bij een kraamcadeaubox echt leverbaar is, is niet met Carien gecontroleerd.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit Story 1 (issue #63) en Story 16 (Carst, 12 nov. 19:33). Ontwerprichting en ontwerpcriteria van website-ontwerper letterlijk overgenomen. Risico hoog (formulier) |
| Bouwen | website-bouwer | Story 1: productrij is `div#productenrij.productenrij.carrousel` (region "Producten", tabindex 0) met `ul.producten role="list"` erin (open vraag 4), knoppen "Vorige/Volgende producten" eronder; `data-scrollrij` (HTML, JS) en eigen `overflow-x` van `.producten` weg; rand en `scroll-padding-inline` zoals `.stoffen`. `main.js`: scrolt een `.carrousel` niet, dan knoppen verborgen (`hidden`) en geen tabstop, opnieuw bij resize. **Grens raster: 1025 px** (gemeten: kolommen 93 px, geen naam afgesneden, Douche­handschoen breekt op het zachte streepje). Afstand rij–knoppen 24 px, gelijk aan de stoffen. Story 16: maat 44/46/48 in `box_maat`, `prem_maat`, `op_maat` en in `MATEN`; "Nog niet gekozen" en "Maat 46" behouden (open vragen 2 en 3). Tests: unit-maattests bijgewerkt (+ mailregels maat 46/48/44), e2e maatopties + verzending met maat 46 (nieuwe header `x-testmail-bevat` in `scripts/serveer.mjs`), nieuwe e2e "Story 1" in `kernpaden.spec.js`, sitecontrole `controleer_productrij`. `npm run check` lokaal (poort 4191): npm test 134/134 groen; sitecontrole geen fouten; e2e 313 groen, 0 fout (desktop, tablet, mobiel in Chromium). Lokaal niet te draaien (npm-register onbereikbaar, alleen in CI): axe (`@axe-core/playwright`), Lighthouse (`@lhci/cli`), wrangler dry-run, WebKit/iPhone (geen browser), visueel (geen basis in de repo). Validatierapport: NO-GO alleen omdat controleur en ontwerpgate nog open staan |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
