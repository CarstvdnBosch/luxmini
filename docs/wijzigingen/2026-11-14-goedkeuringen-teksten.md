# Goedgekeurde teksten verwerken en maat 44–48 weg bij de kraamcadeaubox

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (eigenaar; hij keurde de teksten op 14 nov. 2026 in de chat goed en beslist daarbij namens LUX mini)
- **Branch:** `wijziging/goedkeuringen-teksten`
- **Issue:** geen nummer bekend (zie Open vragen)
- **Risico:** hoog. De wijziging raakt het formulier: de opties in `public/contact.html` en de validatie `MATEN.box_maat` in `src/formulier.js`. De rest is laag: alleen HTML-commentaar weghalen en één quote vervangen. Daarnaast verandert de sitecontrole (`scripts/controleer.py`): controles die nu een LET OP *eisen*, gaan juist controleren dat die LET OP weg is. Dat gebeurt op basis van het akkoord van Carst. De controles worden er niet losser van.

## Doel
1. De bezoeker ziet op Inspiratie Cariens eigen woorden in plaats van een tekst die zij niet zelf schreef.
2. Bij een kraamcadeaubox kun je alleen nog de maten kiezen die bij een box horen (50 t/m 74). De goedgekeurde teksten zijn niet meer als voorlopig gemarkeerd, zodat het validatierapport alleen de punten toont die echt nog open staan.

## Wens (Carst, 14 nov.)
1. Goedgekeurd: de `<!-- LET OP: wacht op akkoord Carien … -->`-markeringen gaan weg. De tekst zelf blijft staan.
2. De quote op Inspiratie wordt "Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken." (— Carien Geurts).
3. Maat 44, 46 en 48 gaan weg bij Kraamcadeaubox. Prematuurkleding en Iets op maat houden ze.
4. `babynest.html` blijft buiten deze wijziging, omdat die pagina al in een andere pull request zit (`wijziging/babynest-media-en-logo`).

## Acceptatiecriteria

### A. Markeringen weg (de tekst blijft letterlijk gelijk)
1. **`public/index.html`:** de LET OP staat niet meer boven de producttekst van de drie drieluikkolommen (Kraamcadeauboxen, Prematuurkleding en Babynest, nu r. 187, 199 en 210). Die markeringen gingen ook over de linkteksten. Boven "Nieuwe stukjes uit het atelier, zo van de naaimachine." (r. 280) staat ook geen LET OP meer.
2. **`public/index.html`, Handwerk (r. 227–228):** de markering zegt niet meer dat de namen en productregels op akkoord wachten. Ook "Borduren niet bevestigd" staat er niet meer. Het deel over de foto's blijft als smallere LET OP staan: de beletteringsfoto's tonen geen belettering op kleding, en Prematuurkleding gebruikt een tijdelijke foto. Voorbeeld: `<!-- LET OP: foto's: de beletteringsfoto's (doos en zakje TOBI) laten geen belettering op kleding zien; Prematuurkleding gebruikt een tijdelijke foto -->`. De namen, productregels en "Speels en levendig — Borduren" blijven ongewijzigd.
3. **`public/werkwijze.html`:** de LET OP staat niet meer boven 002 Hoe ik werk (r. 151) en niet meer boven de technieken Borduren, Belettering en Siliconen (r. 193, 199 en 205).
4. **`public/prematuurkleding.html`:** de LET OP staat niet meer bij Cariens quote (r. 111), de Maatwerk-tekst (r. 128), de prijszin (r. 141) en Zo werkt het (r. 151). De zin "De prijs hangt af van de maat en de stof. Carien stuurt je een voorstel." blijft staan. **Wel blijven staan:** de LET OP over de prijsrichtlijn met het oude prijsblok als commentaar (r. 139–140) en de LET OP over de tijdelijke foto (r. 124).
5. **`public/kraamcadeauboxen.html`:** de LET OP staat niet meer boven de intro "Vier formaten, van € 35 tot € 80." (r. 115) en de regels onder de prijzen (r. 139). **Wel blijft staan:** de LET OP over de douchehandschoen/lijntekening (r. 207).
6. **`public/inspiratie.html`:** de LET OP staat niet meer boven de kop "Gemaakt in het atelier in Ospel" (r. 111). Bij de vier groepen (r. 127, 147, 163 en 182) staat niet meer dat de groepsnaam en de bijschriften op akkoord wachten. Wat er met "keuze van de foto's" gebeurt, staat in Open vragen, punt 2.
7. **`public/contact.html`:** de LET OP staat niet meer bij "Wat mag Carien voor jou maken?" (r. 114), "Mooi ingepakt…" (r. 144), "binnen 7 werkdagen verzonden" (r. 149), "Liever schrijven? …" (r. 161), de velden voor prematuurkleding (r. 234) en babynest (r. 252) en de voorbeeldtekst bij "Je idee" (r. 280). De velden en teksten zelf veranderen niet.
8. In `index.html`, `werkwijze.html`, `prematuurkleding.html`, `kraamcadeauboxen.html`, `inspiratie.html`, `contact.html` en `privacy.html` komt "wacht op akkoord Carien" alleen nog voor op deze plekken:
   - bij de douchehandschoen;
   - ~~eventueel bij de herotabjes in `index.html` (r. 156)~~ — vervallen: Carst keurde ook de herotabjes goed (14 nov., 12:22), zie Open vragen, punt 1.

   De paginatitels, beschrijvingen en de privacyverklaring hebben nu geen markering. Daar hoeft niets te veranderen.
9. `public/babynest.html` is in deze branch byte voor byte gelijk aan `main` (`git diff main -- public/babynest.html` is leeg).

### B. Quote op Inspiratie
10. In het atelierstatement van `public/inspiratie.html` staat `<p class="quote">“Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken.”</p>`, met de typografische aanhalingstekens zoals op de homepage. Daaronder blijven `Carien Geurts —` en de pijl-link "Lees het verhaal" (→ `werkwijze.html#atelier`) staan. Er staat geen LET OP meer bij.
11. "Door dezelfde handen" en "genaaid, geborduurd en beletterd" komen nergens meer voor in `public/`.

### C. Formulier: maat 44–48 weg bij Kraamcadeaubox
12. In `public/contact.html` heeft `select[name="box_maat"]` precies deze opties: Weet ik nog niet (`value=""`, standaard) · Maat 50 · Maat 56 · Maat 62 · Maat 68 · Maat 74. Het commentaar boven de select noemt dat 44/46/48 bij de box weer weg zijn (Carst, 14 nov., deze brief).
13. `prem_maat` blijft: Nog niet gekozen · Maat 32 · 38 · 44 · 46 · 48 · 50 · Anders / gewicht. `op_maat` blijft: Nog niet gekozen · Maat 32 · 38 · 44 · 46 · 48 · 50 · 56 · 62 · 68 · 74 · 80 · 86 · Anders. Opmaak en "Anders"-gedrag blijven gelijk.
14. `src/formulier.js`: `MATEN.box_maat` is `['50', '56', '62', '68', '74']`. `prem_maat` en `op_maat` blijven gelijk. Een box met `box_maat` 44, 46 of 48 geeft geen kledingmaat in de mail (`extra` is leeg).
15. `tests/formulier.test.js`: de kraamcadeauboxtest heet "alleen maat 50 t/m 74". De lijst met geldige maten is 50–74. `'44'`, `'46'` en `'48'` staan erbij in de lijst met ongeldige waarden. Er verdwijnt geen bestaande ongeldige waarde. De mailregel die nu maat 46 toetst (r. 118), toetst voortaan een geldige boxmaat die nog niet getoetst wordt, bijvoorbeeld `50` ("Kledingmaat: maat 50"). Alleen de verwachte lijsten veranderen; er wordt geen test geschrapt.
16. `tests/e2e/homepage-zoals-stock.spec.js`: de verwachte `box_maat`-lijst is `['50', '56', '62', '68', '74']`. De test "kraamcadeaubox met maat 46" gaat over een geldige boxmaat, bijvoorbeeld 50, met `x-testmail-bevat` "\nKledingmaat: maat 50\n". De naam en het commentaar van de test veranderen mee. De controles op lettergrootte en hoogte (16 px en 44 px) blijven staan.
17. `scripts/controleer.py`: als `FORMULIER_VELDEN` of een andere controle het aantal boxmaten telt, past de bouwer dat aan.
17a. **Aanvulling Carst (14 nov., 12:32, chat):** `prem_maat` krijgt maat 34 en 36: Nog niet gekozen · Maat 32 · 34 · 36 · 38 · 44 · 46 · 48 · 50 · Anders / gewicht. Dit vervangt de lijst van `prem_maat` in criterium 13. Ook in `MATEN.prem_maat` (`src/formulier.js`), de verwachtingen in `tests/formulier.test.js` en `tests/e2e/homepage-zoals-stock.spec.js` en de maatregel in `CLAUDE.md`. `op_maat` en `box_maat` blijven zoals hierboven.

### D. Sitecontrole en CLAUDE.md
18. `scripts/controleer.py` volgt het besluit. Bij elke controle is de nieuwe controle minstens zo streng als de oude:
    - r. 704–705 eist bij Prematuurkleding geen LET OP meer boven de prijszin. De nieuwe controle eist dat de prijszin er staat ("De prijs hangt af van de maat en de stof."), zonder "wacht op akkoord" er direct boven. De controle op het oude prijsblok (r. 702) en op de tijdelijke foto (r. 706) blijven staan.
    - r. 720–727: in plaats van "elke sectie heeft een LET OP" en "LET OP over Speels en levendig (Borduren)" controleert de sitecontrole dat de drie producttekstjes en Handwerk geen "wacht op akkoord" meer hebben. Ze controleert ook dat de LET OP's bij de tijdelijke prematuurfoto (r. 718) en de babynestfoto (r. 731) er nog zijn.
    - r. 739–742 controleert het omgekeerde: de formuliervelden voor prematuurkleding en babynest in `contact.html` hebben géén LET OP meer.
    - Nieuw: de Inspiratie-quote is gelijk aan de zin uit criterium 10, en criterium 8 en 11 worden gecontroleerd.
    - De controles van `babynest.html` (r. 708–716) en de douchehandschoen (r. 734) blijven ongewijzigd.
    - De beschrijving bovenaan (r. 30–36) noemt Borduren niet meer als LET OP.
19. `CLAUDE.md`:
    - In de formulierregel staat bij Kraamcadeaubox "Weet ik nog niet · maat 50 · 56 · 62 · 68 · 74", met de aantekening "maat 44–48 bij de box weer weg: Carst 14 nov., brief 2026-11-14-goedkeuringen-teksten". Prematuurkleding en Iets op maat blijven gelijk.
    - Bij "Nog open" (Inhoudsregels) zijn "goedkeuring quote bij de atelierfoto" en "teksten bij de technieken" weg. Wel blijven staan: de foto van belettering op kleding en de originele bestanden van de Instagram-foto's.
    - Bij de Inhoudsregels staat dat Carst op 14 nov. de teksten heeft goedgekeurd, behalve die op `babynest.html`. Hij deed dat als eigenaar namens LUX mini. De Inspiratie-quote is Cariens zin van de oude site.
20. `npm run check` is groen: tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel en validatierapport. Het validatierapport toont onder de LET OP-punten alleen nog de punten die blijven staan: tijdelijke foto's, douchehandschoen, prijsrichtlijn, de punten van `babynest.html` en eventueel de punten uit Open vragen 1–3.

## Ontwerprichting
Website-ontwerper heeft nog niets aangeleverd. De planner kon de ontwerper vanuit deze sessie niet aanroepen. Daarom staat hier geen eigen ontwerpkeuze. Zichtbaar veranderen alleen de quote op Inspiratie (bestaand patroon `.quote` in het statement, een kortere zin) en de keuzelijst `box_maat` (drie opties minder, opmaak gelijk). De opdrachtgever geeft aan dat de ontwerper "n.v.t." mag geven of kort kan kijken naar:
- de quote op de statementfoto (desktop, tablet, 390 px; wit op donkere foto met sluier);
- de maatlijst bij Kraamcadeaubox.

## Bestanden
- `public/index.html`: markeringen (drieluik, Handwerk smaller, Instagram)
- `public/werkwijze.html`: markeringen (Hoe ik werk, technieken)
- `public/prematuurkleding.html`: markeringen (quote, Maatwerk, prijszin, Zo werkt het)
- `public/kraamcadeauboxen.html`: markeringen (intro, regels onder de prijzen)
- `public/inspiratie.html`: markeringen (kop, groepen) en de quote
- `public/contact.html`: markeringen en de opties van `box_maat`
- `src/formulier.js`: `MATEN.box_maat`
- `tests/formulier.test.js`, `tests/e2e/homepage-zoals-stock.spec.js`: verwachte maatlijsten en mailregel
- `scripts/controleer.py`: LET OP-controles omgezet (criterium 18), eventueel `FORMULIER_VELDEN`
- `tests/e2e/basis/`: basisschermen van Inspiratie en Contact, alleen als de visuele test dat vraagt (via `visueel-basis.yml`)
- `CLAUDE.md`: maatregel, "Nog open" en de aantekening over het akkoord

## Buiten scope
- `public/babynest.html` en alles wat bij `wijziging/babynest-media-en-logo` hoort.
- Een tekst inhoudelijk veranderen. Alleen de quote op Inspiratie verandert.
- De LET OP's over tijdelijke foto's (prematuurbroekje op de homepage en op Prematuurkleding, Instagram-foto van het babynest op de homepage), de lijntekening van de douchehandschoen en de prijsrichtlijn van Prematuurkleding.
- Het thema "Walvis" (formulier, stoffen, thema's, `THEMAS`). Dat vervalt later met de fotobatch van Carien.
- Andere maten bij Prematuurkleding of Iets op maat, en vooraf invullen via `?onderwerp=…&formaat=…`.
- `wrangler.jsonc`, `_redirects`, `_headers`, `.github/workflows/`, `src/contact.js`.

## Open vragen
Geen van deze vragen blokkeert het bouwen. Bij elke vraag staat wat de bouwer doet zolang Carst niets anders zegt.
1. **Markeringen die niet in de lijst van Carst staan (`index.html`).**
   - r. 156: de herotabjes "Het atelier · Het cadeau";
   - r. 249: "Zo personaliseert Carien" ("nieuwe linktekst");
   - r. 263: "Bekijk alle inspiratie" / "Stuur Carien een bericht" ("nieuwe linkteksten").

   Carst noemde alleen de linkteksten van het drieluik. Voorstel: deze drie markeringen blijven staan en komen als open punt in het validatierapport. Keurt Carst ze ook goed, dan gaan ze in deze branch mee weg.

   **Beslist (Carst, 14 nov., 12:22, chat):** ook deze drie zijn goedgekeurd. Ze zijn in deze branch weg, en de sitecontrole controleert dat er in `index.html` geen LET OP over een tekst of linktekst meer staat.
2. **"Keuze van de foto's" op Inspiratie.** De vier groepsmarkeringen gaan ook over de keuze van de foto's. Carst keurde de groepsnamen en bijschriften goed, de keuze van de foto's noemde hij niet. Voorstel: de markering wordt smaller, bijvoorbeeld `<!-- LET OP: keuze van de foto's wacht op akkoord -->`. Zegt Carst dat de foto's ook goed zijn, dan gaat de markering helemaal weg.
3. **Werkwijzestappen op de homepage.** De wens noemt de werkwijzestappen op de homepage, maar `index.html` heeft geen sectie Zo werkt het meer en daar staat geen LET OP. Er valt daar dus niets weg te halen. Dit is alleen ter informatie.
4. **Twee keer dezelfde quote.** De nieuwe quote op Inspiratie is dezelfde zin als onder de hero op de homepage. Dat is Cariens enige goedgekeurde zin over het maken. Als alternatief kan op Inspiratie haar andere goedgekeurde zin komen: "Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks." De brief volgt de wens van Carst.
5. **Inhoudsregel over quotes.** Volgens `CLAUDE.md` mag een quote van Carien alleen als zij die heeft goedgekeurd. Deze brief gaat uit van het akkoord van Carst namens LUX mini (14 nov.) en zet dat in `CLAUDE.md` (criterium 19). Wil Carst dat Carien de quotes nog zelf bevestigt, dan kan de pull request wachten tot dat gebeurd is.
6. **Issue.** Er is geen issuenummer bekend. Bestaat er een issue, dan krijgt de pull request `Closes #<nummer>`.
7. **Ontwerprichting.** Die ontbreekt nog, zie hierboven. De ontwerper vult de sectie aan of geeft "n.v.t." bij de ontwerpgate.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit het akkoord van Carst op 14 nov. (chat). Risico hoog (formulier). `babynest.html` valt buiten scope. Ontwerprichting nog niet geleverd (ontwerper niet bereikbaar vanuit de planner); n.v.t. of korte blik volgens de opdrachtgever |
| Bouwen | website-bouwer | 14 nov.: LET OP-markeringen bij de goedgekeurde teksten weg (index, werkwijze, prematuurkleding, kraamcadeauboxen, inspiratie, contact). Ook weg: de drie markeringen uit open vraag 1 (beslist door Carst, 12:22). Handwerk heeft een smallere LET OP over de foto's; bij de Inspiratie-groepen staat "keuze van de foto's wacht op akkoord". Quote op Inspiratie vervangen. `box_maat` 50–74, `prem_maat` met 34 en 36 erbij (Carst 12:32, criterium 17a); `src/formulier.js`, unit- en e2e-tests, sitecontrole (omgekeerde LET OP-controles, criterium 8, 10 en 11) en CLAUDE.md bijgewerkt. `babynest.html` niet aangeraakt. Lokaal groen: `npm test` (134/134), sitecontrole (geen fouten), Playwright desktop/tablet/mobiel 313/313. Lokaal niet te draaien (npm-registry geblokkeerd, 403): axe (toegankelijkheid), Lighthouse, wrangler dry-run; WebKit/iPhone en visueel ook niet. Die draaien in CI. Rapport lokaal: NO-GO, omdat gate 1 onbekend is (wrangler) en de controleur en de ontwerpgate nog niet geweest zijn |
| Controleren | website-controleur | AKKOORD — alleen markeringen weg, Inspiratie-quote juist, babynest.html gelijk aan main, box_maat 50–74 en prem_maat met 34/36 in HTML en Worker, sitecontrole strenger; npm test 134/134, sitecontrole groen, Playwright 312/313 (1 timingschommeling intro, los 3/3 groen); axe, Lighthouse, WebKit, wrangler en visueel in CI |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD — quote op Inspiratie leest goed op 1440/768/390; maatlijsten box (50–74) en prematuur (32–50, met 34/36) kloppen, 16 px, tikdoel 49 px, geen horizontaal scrollen. Kan beter (later): contrast wit op de statementfoto ~2,9:1 (bestaand) |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
