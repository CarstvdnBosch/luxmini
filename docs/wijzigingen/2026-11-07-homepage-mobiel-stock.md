# Homepage op mobiel zoals Stock: hero met drie foto's, zijmarge 32 px, geen overlap

- **Datum:** 7 november 2026
- **Aangevraagd door:** Carst (wens 7 nov. 10:25: "Controleren en verbeteren.")
- **Branch:** `wijziging/homepage-mobiel-stock`
- **Risico:** midden. De hero van de homepage verandert op mobiel en tablet, en de zijmarge (`--rand`) verandert op alle pagina's. Het formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt.

## Doel
Op een telefoon ziet de bezoeker bovenaan de homepage een rustig groepje van drie foto's met daaronder de kop, de tabjes, de quote en "Over Carien". Er staat nooit tekst over een foto en niets valt buiten het scherm, ook niet op een brede telefoon, een tablet of een telefoon die liggend wordt gehouden.

## Aanleiding
- Carst (7 nov. 10:25): de homepage van Stock werkt op mobiel duidelijk anders. Stock toont in de hero drie foto's, wij zes. Op zijn telefoon ligt de kop over een foto en loopt de quote rechts het scherm uit.
- Metingen van Stock: `docs/ontwerp/bron/stock-analyse-2026-11-07-mobiel.md`.
- Metingen op `main` (website-ontwerper, Chromium, touch): de kop overlapt een foto op 430 × 932, 768 × 1024, 844 × 390 en 932 × 430. Op 360–393 px breed is er geen overlap. De oorzaak: de kop staat absoluut op 25,5 % van een vaste hero van 740 px, tussen twee rijen foto's. `pasKopIn` in `main.js` werkt alleen tot 760 px. De afgesneden quote kon in Chromium niet worden nagebootst. Dat moet de iPhone/Safari-uitslag in CI bevestigen.

## Afhankelijkheid: PR #39
Deze wijziging bouwt voort op de open PR #39 (mobiele verbeteringen: `.pijl` en tekst 16 px, `.hero-wissel` 16 px / .12em, `.caps` 13 px, compacte prijskaarten, footer).
- **Wordt #39 gemerged voordat de bouwer start?** Dan maakt de bouwer de branch vanaf de nieuwe `main`.
- **Is #39 nog open?** Dan begint de bouwer vanaf `main` en rebaset hij op `main` zodra #39 gemerged is, vóór de controle. Hij neemt de maten van #39 niet dubbel over.
- De bouwer schrijft in het Verloop op welke commit van `main` hij heeft gebouwd en of #39 daarin zat.
- Criterium 10 (prijsregel op één regel bij 360 px) is alleen te toetsen met #39 erin.

## Acceptatiecriteria
1. **Ontwerpcriteria:** alle 15 toetsbare ontwerpcriteria in de Ontwerprichting (deel 2) zijn gehaald, gemeten op de schermen die daar staan.
2. **Hero op mobiel (≤ 760 px en telefoons liggend: touch met hoogte ≤ 500 px):**
   - de volgorde is fotogroep → kop → namen → tabjes → badge in cirkel → quote → "Over Carien";
   - de hero heeft geen vaste hoogte;
   - geen tekstelement van de hero ligt over een foto.
3. **Drie foto's:**
   - op 390 × 844 zijn alleen t2, t4 en t5 zichtbaar;
   - in de netwerklijst van de pagina staan de bestanden van t1, t3 en t6 niet (ook niet die van set B);
   - t2 is niet lazy en blijft de LCP-foto.
4. **Tabjes:** "Het atelier · Het cadeau" wisselen met een tik, met Enter/Spatie en met een tik op een foto (`aria-pressed` volgt). Bij "Het cadeau" wisselen t2 en t4, blijft t5 (Carien) staan en wordt de kop inkt op salie (`html.hero-licht`).
5. **Tablet 761–1024 px (touch, staand):**
   - zes foto's in de eigen indeling;
   - tussen de kop en elke foto zit minstens 12 px ruimte op 768 × 1024 en 1024 × 1366;
   - `pasKopIn` werkt ook op tablet.
6. **Telefoon liggend (844 × 390, 932 × 430):** de mobiele hero staat in een gecentreerde kolom van maximaal 520 px, zonder overlap en zonder horizontaal scrollen.
7. **Zijmarge:**
   - `--rand` is `min(32px, 8.2vw)` op mobiel;
   - op 390 px begint de tekst op elke pagina op 32 px van de rand;
   - op 360 px scrolt geen enkele pagina horizontaal (`scrollWidth − innerWidth = 0`).
8. **Desktop ongewijzigd:** op 1025 px en breder zien hero, meebewegen, kanteling en de rest van de homepage er hetzelfde uit. De visuele basis voor desktop wijkt niet af.
9. **Geen witte streep** tussen de vaste balk en de foto van 003 Inspiratie op 390 × 844.
10. **Opruimen:** de dode regels `.hero:not([data-wissel])` in `style.css` zijn weg. Geen enkele andere pagina verandert daardoor zichtbaar.
11. **CLAUDE.md:** de drie tekstwijzigingen uit "Taak: CLAUDE.md bijwerken" hieronder staan er letterlijk in.
12. **Tests:** alleen uitbreidingen, zoals beschreven in "Testaanpassingen". Geen enkele test, grens of axe-regel is versoepeld.
13. **Harness:** `npm run check` is groen. Wat alleen in CI draait (axe, Lighthouse, WebKit/iPhone, Gate 5) staat in het Verloop. De WebKit/iPhone-uitslag moet criterium 1 (quote binnen de zijmarges) op 390 × 664 bevestigen.

## Ontwerprichting
Tekst van website-ontwerper (rol 1, 7 nov.).

### 1 · Ontwerprichting

**A. Hero op mobiel (≤ 760 px, en telefoons liggend: touch met hoogte ≤ 500 px)**

1. **Alles onder elkaar, niets meer absoluut over elkaar.**
   - Volgorde: fotogroep → kop → namen → tabjes → badge in cirkel → quote → pijl-link "Over Carien".
   - De hero krijgt geen vaste hoogte meer (nu 740 px); hij is zo hoog als de inhoud.
   - Er staat nooit tekst over een foto. Zo is overlap niet meer mogelijk, ook niet met grotere tekst.

2. **Drie foto's (zoals Stock).**
   - t1 (babynest), t3 (stoffen/bijtring) en t6 (werkplek/shirtje) krijgen `display:none`.
   - Ze worden op mobiel ook niet gedownload: `loading="lazy"` op die drie, en set B alleen ophalen voor zichtbare tegels.
   - De fotogroep is een vak van de volle breedte (verhouding 390 : 352), 32 px onder de header. Maten in % van dat vak, gemeten bij Stock:

| Tegel | Set A · Set B | links | boven | breedte | verhouding | laag |
|---|---|---|---|---|---|---|
| **t2** groot, midden | naaimachine · swaddle | 33,3 % | 0 | 41,5 % | 0,71 | 1 (achter) |
| **t5** links | Carien (blijft staan) | 15,1 % | 44,6 % | 30 % | 0,6 | 2 |
| **t4** rechts | kast · broekje | 55,1 % | 32,4 % | 30 % | 0,6 | 2 |

   - Zo wisselen bij "Het cadeau" twee van de drie foto's en blijft Carien in beeld.
   - t2 blijft de LCP-foto en wordt niet lazy geladen.
   - Voor t5 op mobiel `sizes` zo zetten dat `over-carien.jpg` (1200w) laadt. De 600w-versie is 450 px hoog en wordt op een 3×-scherm net vergroot. Gebruik `object-position` ongeveer 40 % 50 %.
   - Geen meebewegen of kantelen op ≤ 760 px, ook niet met een muis.

3. **Kop, namen en tabjes.**
   - Kop onder de foto's, gecentreerd, `font-size: min(42px, 10.25vw)` (40 px op 390). Op ≤ 760 px op twee regels: "Samen ontworpen, / met de hand gemaakt" (de `<br>`'s daar uit). Gemeten: 276 en 309 px, dat past in 326 px. Wit op terracotta; bij set B wordt hij inkt via `hero-licht`.
   - Daaronder "Carien Geurts / Atelier Ospel" in `.caps` (13 px, zoals PR #39), gecentreerd.
   - Daaronder de tabjes "Het atelier · Het cadeau", gecentreerd. Overnemen uit PR #39: 16 px, spatiëring .12em, 44 px hoog (231 px breed, dat past). Een tik op een foto wisselt ook, zoals nu.

4. **Badge, quote en pijl-link.**
   - `.hero-cirkel` gaat niet meer om de kop, maar wordt de ring om de badge (zoals Stock): ring 136 px, badge 96 px, gecentreerd.
   - Daaronder de quote: 24 px, gecentreerd, breedte = 100 % − 2 × zijmarge, `overflow-wrap: break-word`.
   - Daaronder de pijl-link "Over Carien" (16 px, PR #39).
   - Ritme tussen de blokken 32–56 px, onderaan het vaste ritme.

**B. Zijmarge en letters**

5. **Zijmarge op mobiel 32 px:** `--rand: min(32px, 8.2vw)` in plaats van 22 px.
   - 32 px is op 390 precies onze eigen 8,2 %. Dezelfde marge geldt dus op alle pagina's, en header, logo en burger blijven gelijk.
   - Bijvangst: de babynestfoto (324 px) past dan zonder inspringen in de kolom van 326 px.
   - Koppen 35–42 px en lopende tekst 16 px (PR #39). Niet dubbel aanpassen.
   - Na de wijziging alle pagina's op 360 px nalopen. Vooral de compacte prijsregel van PR #39 moet op één regel blijven.

**C. De andere blokken op de homepage**

6. **001 Producten: foto boven de tekst houden. Geen foto over het hele blok zoals Stock.**
   - Mobiel-regel 10 ("Foto boven, tekst eronder") is een vaste afspraak.
   - Kleine witte tekst op een foto valt buiten de uitzondering in `CLAUDE.md`.
   - Babynest heeft alleen een bestand van 324 px. Over de hele breedte wordt dat vergroot (regel 6).
   - De drie kleurvlakken (perzik, oker, mauve) zijn juist het herkenbare van dit blok.
   - Wel: elk blok past binnen één scherm, met foto 4:3, nummer, kop 40 px, één zin en de pijl-link.

7. **002 Handwerk: de kaarten houden, geen losse namen zoals Stock.**
   - Principe 3: wat op desktop bij aanwijzen verschijnt (foto's en productregel), moet op touch zichtbaar zijn.
   - Losse namen zonder foto breken dat, en de namen zeggen zonder foto weinig over het aanbod.
   - De kaartenrij is nu ongeveer 1 scherm (706 px), even hoog als Stocks lijst.

8. **003 Inspiratie en 004 Instagram: blijven zoals ze zijn.**
   - Inspiratie is één scherm, zoals Stocks getuigenis. Instagram heeft al de volgorde van Stock: label, foto, kop, zin, pijl-link.
   - Alleen de zijmarge gaat naar 32 px. De witte streep van ongeveer 8 px tussen balk en Inspiratie-foto moet weg (review 7 nov., punt 10).

**D. Tablet 761–1024 px (touch, staand)**

9. **Zes foto's in de eigen indeling houden, maar zonder overlap.**
   - De kop staat in de middenkolom.
   - t4 en t5 schuiven zo ver naar rechts (of de kop wordt zo smal) dat er minstens 12 px ruimte overblijft.
   - `pasKopIn` moet ook op tablet de woord-spans meten.
   - Telefoons liggend (touch, hoogte ≤ 500 px) krijgen de mobiele hero uit punt 1–4, in een gecentreerde kolom van maximaal 520 px.

### 2 · Toetsbare ontwerpcriteria

Gemeten op 360 × 740, 390 × 844, 390 × 664 (WebKit/iPhone), 430 × 932, 768 × 1024, 844 × 390 en 390 × 844 met tekst op 130 %, tenzij anders vermeld.

1. **Niets breder dan het scherm:** `scrollWidth − innerWidth = 0` op alle genoemde schermen; de quote valt binnen de zijmarges.
2. **De hero-kop overlapt nooit een foto** (overlap van de rechthoeken = 0), op alle genoemde schermen, ook bij 130 % tekst en bij set B.
3. **≤ 760 px: precies 3 hero-foto's zichtbaar** (t2, t4, t5). t1, t3 en t6 hebben `display:none` en hun bestanden worden op 390 × 844 niet opgehaald.
4. **Posities van de foto's:** op 390 px wijken ze hooguit 4 px af van de tabel in A2: t2 ongeveer x 130 / b 162, t5 x 59 / b 117, t4 x 215 / b 117. Geen enkele tegel valt buiten de zijmarge van het scherm.
5. **Eerste scherm 390 × 844:** de drie foto's, de volledige kop, de namen en de tabjes staan zonder scrollen in beeld.
6. **Eerste scherm 390 × 664 (Safari):** de drie foto's en de volledige kop staan zonder scrollen in beeld.
7. **Tabjes:** 44 px hoog, 16 px, gecentreerd. Wisselen werkt met een tik en met het toetsenbord (`aria-pressed`). Bij set B wisselen t2 en t4 en wordt de kop inkt op salie.
8. **Kop:** ≤ 760 px gecentreerd, 35–42 px; op 390 px twee regels.
9. **Quote en pijl-link:** quote 24 px, breedte ≤ schermbreedte − 64 px op 390, gecentreerd. "Over Carien" staat eronder met een tikdoel van 44 px.
10. **Zijmarge 32 px op 390 px** op alle pagina's. De compacte prijsregel van Kraamcadeauboxen (PR #39) blijft op 360 px op één regel.
11. **Drieluik:** foto boven de tekst. Per product staan foto, kop en pijl-link samen binnen 844 px. De babynestfoto is niet breder dan 324 px en lijnt links uit met de tekst.
12. **Handwerk** blijft op touch kaarten met foto, witte naam (24 px) en productregel (19 px vet).
13. **Geen witte streep** tussen de balk en de Inspiratie-foto.
14. **Geen meebewegen of kantelen** van de hero op ≤ 760 px, ook niet met een muis. Bij "minder beweging" staat alles direct.
15. **Desktop ≥ 1025 px is niet veranderd:** de visuele basis voor desktop wijkt niet af. De basis voor mobiel en tablet wordt bewust vernieuwd via `visueel-basis.yml`.

## Taak: CLAUDE.md bijwerken
Tekst van website-ontwerper (deel 3). De bouwer zet deze teksten letterlijk in `CLAUDE.md` (criterium 11).

**Ontwerpregels, bullet "Hero (homepage)":** vervang de zin "Tablet en mobiel houden hun eigen indeling." door:

> Tablet (761–1024 px) houdt zijn eigen indeling met zes foto's; de kop overlapt daar nooit een foto (minstens 12 px vrij). Mobiel (≤ 760 px, en telefoons liggend: touch met hoogte ≤ 500 px; zoals Stock, meting 7 nov., `docs/ontwerp/bron/stock-analyse-2026-11-07-mobiel.md`): alles onder elkaar en nooit tekst over een foto. Eerst drie foto's in een groepje (t2 groot in het midden, t5 Carien links, t4 rechts; t1, t3 en t6 verborgen en niet geladen), daaronder de kop gecentreerd op twee regels (35–42 px), de namen, de tabjes "Het atelier · Het cadeau", de badge in de cirkel, de quote binnen de zijmarges en de pijl-link. Geen meebewegen.

**Bullet "Homepage (wens Carst 6 nov., zoals Stock)":** voeg toe na "op touch kaarten);":

> (op mobiel blijft het drieluik foto boven tekst en blijft Handwerk kaarten met foto: principe 3 en Mobiel-regel 10 gaan voor de projectenlijst van Stock, besluit 7 nov.);

**Bullet "Mobiel moet altijd goed werken (390 px breed)":** vervang door:

> Mobiel moet altijd goed werken (390 px breed): niets mag horizontaal scrollen, tekst moet leesbaar blijven, de zijmarge is 32 px (`--rand: min(32px, 8.2vw)`, zoals Stock) en een kop staat nooit over een foto, behalve op een donkere foto met sluier.

## Ter beoordeling door Carst
Het drieluik en Handwerk volgen op mobiel bewust **niet** Stock (ontwerprichting C6 en C7). Carst kiest bij GO, of eerder als hij het anders wil:
- **Drieluik 001 Producten:**
  - **Optie A (in deze brief):** foto boven de tekst, met elk product op een eigen kleurvlak (perzik, oker, mauve).
  - **Optie B (zoals Stock):** een foto over het hele blok met witte tekst erop. Daarvoor is een grotere babynestfoto nodig (fotolijst 11) en een uitzondering op de regel voor witte tekst.
- **002 Handwerk:**
  - **Optie A (in deze brief):** kaarten met foto, witte naam en productregel.
  - **Optie B (zoals Stock):** alleen de vier namen onder elkaar, zonder foto. Dat is korter, maar de bezoeker ziet dan niet wat elke techniek oplevert (principe 3).

Kiest Carst voor optie B, dan wordt dat een aparte brief. Deze brief blijft bij één story.

## Testaanpassingen
**Alleen uitbreidingen, niets versoepeld.** Er wordt geen enkele bestaande test, grens of axe-regel versoepeld (Lighthouse, axe, 44 px, 16 px, contrast, mobiele regels). De bouwer zet per punt in het Verloop wat er is toegevoegd.
- **`tests/e2e/mobiel-ontwerp.spec.js`:**
  - nieuwe schermen 430 × 932, 844 × 390 en 932 × 430 (liggend) en 768 × 1024;
  - toets op overlap van kop en foto: de rechthoeken van de hero-kop en van elke zichtbare tegel overlappen niet (op tablet minstens 12 px ruimte), ook bij set B en bij tekst op 130 %;
  - toets dat de quote binnen de zijmarges valt.
- **Nieuwe toetsen voor de mobiele hero:**
  - precies drie zichtbare tegels op ≤ 760 px;
  - de bestanden van t1, t3 en t6 worden niet opgehaald;
  - de posities wijken op 390 px hooguit 4 px af van de tabel;
  - de zijmarge is 32 px op 390 px.
- **Visuele basisschermen:** de basis voor mobiel en tablet wordt bewust vernieuwd via `visueel-basis.yml`, omdat de hero en de zijmarge veranderen. De basis voor desktop blijft gelijk (criterium 8). Dat vernieuwen is geen versoepeling: Carst ziet de nieuwe basisschermen in het validatierapport.
- **Bestaande hero-toetsen voor ≤ 760 px:** zes tegels of een vaste hoogte van 740 px mogen alleen veranderen als ze het gedrag beschrijven dat deze brief vervangt. De bouwer noemt ze in het Verloop. Geen enkele grens wordt ruimer.

## Bestanden
- `public/assets/css/style.css`: mobiele hero (rond regel 271–288), tablet-hero, `--rand`, `.hero-cirkel`, de witte streep boven 003, de dode `.hero:not([data-wissel])`-regels (rond regel 789).
- `public/assets/js/main.js`: `pasKopIn` (rond regel 336–360) ook op tablet; geen meebewegen op ≤ 760 px; set B alleen voor zichtbare tegels.
- `public/index.html`: hero (regel 121–282): `loading="lazy"` op t1, t3 en t6, `sizes` van t5, de volgorde van badge en cirkel.
- `tests/e2e/mobiel-ontwerp.spec.js`, zo nodig `tests/e2e/homepage-zoals-stock.spec.js` en `tests/e2e/hulp.js`; `tests/e2e/basis/` via `visueel-basis.yml`.
- `scripts/controleer.py` en `scripts/schermafdrukken.py`, alleen als er schermen bij moeten.
- `CLAUDE.md`: de teksten uit "Taak: CLAUDE.md bijwerken".

## Buiten scope
- Desktop (≥ 1025 px): hero-posities, meebewegen en kanteling blijven gelijk.
- Het drieluik en Handwerk op mobiel volgens Stock (zie "Ter beoordeling door Carst").
- 003 Inspiratie en 004 Instagram, behalve de zijmarge en de witte streep.
- Nieuwe of andere foto's, teksten, quotes of prijzen. Een grotere babynestfoto (fotolijst 11) blijft liggen.
- De punten van PR #39 (16 px, `.caps` 13 px, compacte prijzen, footer) worden hier niet opnieuw gebouwd.
- Formulier, Worker, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/`.
- Geen grens in de harness versoepelen.

## Open vragen
- **Carsts telefoon:** de ontwerper denkt dat die 430 px breed is (iPhone Plus / Pro Max), omdat op 430 × 932 de quote onderaan het eerste scherm staat, zoals op zijn schermafdruk. Klopt dat? Welk toestel en welke browser?
- **Quote buiten beeld:** in Chromium niet na te bootsen; WebKit was lokaal niet beschikbaar en de live site niet bereikbaar. De iPhone/Safari-uitslag in CI moet laten zien dat de quote binnen de zijmarges valt. Is die nog rood, dan meldt de bouwer dat in het Verloop.
- **Drieluik en Handwerk op mobiel:** optie A of B (zie "Ter beoordeling door Carst").
- **Volgorde met PR #39:** wordt #39 eerst gemerged? Zo niet, dan rebaset de bouwer later (zie "Afhankelijkheid").

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief geschreven (7 nov.) op basis van de wens van Carst (7 nov. 10:25), de metingen in `docs/ontwerp/bron/stock-analyse-2026-11-07-mobiel.md` en de ontwerprichting van website-ontwerper (rol 1). Eén story: hero mobiel, zijmarge en overlap. Bouwt voort op PR #39. Risico midden. |
| Bouwen | website-bouwer | Gebouwd (7 nov.) op `main` = `02cce9f` (merge van PR #39, dus de maten van #39 zitten erin en zijn niet opnieuw gebouwd). **Ter beoordeling door Carst:** nog geen antwoord, dus optie A van de ontwerper gebouwd: drieluik foto boven tekst, Handwerk kaarten met foto (niets aan veranderd). **Hero mobiel** (≤ 760 px en touch met hoogte ≤ 500 px): tegels in een nieuw vak `.hero-fotos` (op desktop en tablet `display: contents`, dus daar niets veranderd); t1, t3, t6 `display: none` en `loading="lazy"`; set B alleen voor zichtbare tegels (`laadSetB`; het late laden van secties slaat set B van de hero nu over, dat haalde eerst alle zes op); t5 `sizes` 100vw op mobiel (1200w op 2×/3×), uitsnede 40 % 50 % (de inline 30 % 50 % staat nu in CSS); kop `min(42px, 10.25vw)` op twee regels (`<br class="breed">` verborgen); cirkel 136 px om de badge van 96 px; quote 24 px binnen de zijmarges; liggend een kolom van max. 520 px, 32 px onder de header; geen meebewegen op ≤ 760 px, ook niet met een muis. **Tablet:** kop zo breed als de tekst, t4 naar 69 %, t5 naar 74 %; `pasKopIn` meet op tablet de woorden (`.w`) en het vak van de kop tegen de tegels in rust (zonder de opkomverschuiving) en houdt 12 px vrij. Desktop-pad van `pasKopIn` ongewijzigd. **Zijmarge** `--rand: min(32px, 8.2vw)` (31,98 px op 390). **Witte streep:** een `.statement` neemt de balk op mobiel pas over als de foto de balk raakt (was 90 px, balk is 56 px). **Opgeruimd:** de `.hero:not([data-wissel])`-regels. **CLAUDE.md:** de drie teksten letterlijk. **Gemeten (Chromium):** kop–foto 32 px op 360/390/430 en liggend 844 × 390, 932 × 430, ook bij set B en bij tekst op 130 % (text-size-adjust); tablet 15 px (768 × 1024) en 20 px (1024 × 1366), op `main` was dat −8 px (vak van de kop over t4); tegels op 390: t2 130/162, t5 59/117, t4 215/117; eerste scherm 390 × 844 t/m tabjes (onderkant 686 px); `scrollWidth − innerWidth = 0` op alle schermen en alle pagina's op 360; prijsregel op 360 op één regel. Desktop 1440/1280/1025: alle pagina's pixel-gelijk aan `main` (eigen vergelijking, reduced motion). **Testaanpassingen (alleen uitbreidingen):** `mobiel-ontwerp.spec.js` +hero op 360 × 740, 390 × 844, 430 × 932, 768 × 1024, 1024 × 1366, 844 × 390, 932 × 430 en 390 × 844 bij 130 % (overlap kop–foto, tablet ≥ 12 px met beweging aan, set A en B, quote binnen de marges, geen horizontaal scrollen); +iPhone 390 × 664 (zelfde plus foto's en kop in het eerste scherm); +maten en volgorde op 390 (drie tegels, posities ≤ 4 px, t2 niet lazy, volgorde, badge in de cirkel, geen lege hoogte, kop 35–42 px en twee regels, tabjes, quote, pijl-link, eerste scherm); +netwerk (t1, t3, t6 niet opgehaald, set B alleen t2 en t4); +tabjes (tik, tik op foto, Enter, Spatie, `hero-licht`, t5 blijft); +geen meebewegen op 700 px met muis; +zijmarge 32 px op 390 en geen horizontaal scrollen op 360 voor alle pagina's en 404; +prijsregel op 360; +witte streep. `controleer.py` +`controleer_hero_mobiel` (zelfde schermen, set A en B). Geen bestaande toets veranderd: er waren geen toetsen voor zes tegels of 740 px op ≤ 760 px. Toegestane speling van 0,5 px in twee nieuwe toetsen omdat 8,2vw op 390 px 31,98 px is. Tegen `main` gedraaid falen 22 van de 23 nieuwe hero-, zijmarge- en streeptoetsen (de toets die slaagt beschrijft gedrag dat al bestond). **Afwijking:** `ig-babynest.jpg` (het bestand van t1) wordt op 390 × 844 toch opgehaald, maar door de babynestfoto in het drieluik (zelfde bestand, lazy, binnen de laadafstand van Chromium), niet door de hero; de netwerktoets sluit bestanden uit die ook buiten de hero staan. Visuele basis mobiel en tablet moet bewust vernieuwd worden via `visueel-basis.yml` (hero en zijmarge veranderen); desktop blijft gelijk. **Harness lokaal:** `npm test` groen; sitecontrole geen fouten; Playwright desktop/tablet/mobiel (kernpaden, mobiel-ontwerp, homepage-zoals-stock, plaatshouders, seo-veiligheid) 212 geslaagd. **Alleen in CI:** axe (toegankelijkheid), Lighthouse (snelheid), WebKit/iPhone (moet criterium 1, quote binnen de marges op 390 × 664, bevestigen) en Gate 5 (visueel). |
| Controleren | website-controleur (ingevuld door hoofdsessie) | AKKOORD (7 nov.). npm test 30/30, sitecontrole geen fouten, Playwright Chromium 212 geslaagd; geen horizontaal scrollen en geen overlap kop–foto op alle 9 schermen (set A/B, 130 %; tablet 15,4/20,5 px); 3 tegels op de maten; t1/t3/t6 niet opgehaald; tabjes 44 px werken; quote binnen de marges; desktop pixel-gelijk aan main; speling 0,5 px alleen in nieuwe toetsen, aanvaardbaar. |
| Ontwerpgate ronde 1 | website-ontwerper (ingevuld door hoofdsessie) | ONTWERP NIET AKKOORD (7 nov.). Staande hero op 360–430 klopt met Stock (≤ 1 px), geen overlap, zijmarge 32 px, geen witte streep. Moet: tabjes op een liggende telefoon 14 → 16 px / .12em, met toets. |
| Bouwen ronde 2 | website-bouwer | **Moet:** de tabjes krijgen ook in de mobiele hero-query (dus ook liggend) 16 px, letterspatiëring .12em en de span-padding van PR #39; gemeten op 844 × 390 en 932 × 430: 16 px / 1,92 px, 44 px hoog. Toets erbij in `mobiel-ontwerp.spec.js` (hero-lus: tabjes 16 px, .12em en 44 px op 360, 390, 430, 844 × 390 en 932 × 430). **Kan, meegenomen:** (1) liggend is de fotogroep ca. 70 % van de schermhoogte (`width: min(100%, 70vh × 390/352)`): de kop begint op 844 × 390 op 441 px (was 637). (2) `loading="lazy"` op t1/t3/t6 is weg: op desktop en tablet staan die foto's in het eerste scherm en laden ze gewoon (zoals op `main`). Op mobiel kiest een `<picture>` met dezelfde mediaquery als de mobiele hero een leeg plaatje (data-URI, zonder netwerkverzoek). De toets controleert nu op mobiel dat het lege plaatje gekozen is; de netwerktoets (bestanden van t1/t3/t6 niet opgehaald) is ongewijzigd. Desktop 1440/1280/1025 (home, kraamcadeauboxen, werkwijze): pixel-gelijk aan `main` (`02cce9f`). **Harness lokaal:** `npm test` 30/30, sitecontrole geen fouten, Playwright desktop/tablet/mobiel 212 geslaagd; axe, Lighthouse, WebKit/iPhone en Gate 5 alleen in CI. |
| Ontwerpgate ronde 2 | website-ontwerper (ingevuld door hoofdsessie) | ONTWERP AKKOORD (7 nov.). Tabjes op een liggende telefoon nu 16 px / .12em / 44 px, gecentreerd, wisselen werkt (844×390 en 932×430). Liggend fotogroep ca. 70 %, kop op y 441. t1/t3/t6 op mobiel niet opgehaald, op desktop en tablet gewoon geladen. Desktop pixel-gelijk aan main, tablet alleen bewust anders. Overal 0 px horizontaal scrollen en geen overlap. Mobiel ✔. Kan beter: P2 liggend eerste scherm (fotogroep 19 px afgesneden), P3 tabjes op tablet 14 → 16 px. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
