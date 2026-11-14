# Formulier: hoofdkleur en tweede kleur kiezen met kleurstalen

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (14 nov., 18:12, chat): "Bij formulier kun je een kleur kiezen. Wellicht een indicatieve kleur toevoegen die je kunt selecteren als hoofdkleur en een secundaire kleur." Daarna besloten via keuzevragen (zelfde avond): kleurenlijst uit Cariens foto's; alleen bij Prematuurkleding, Babynest en Iets op maat.
- **Branch:** `wijziging/kleurkeuze` (vanaf `origin/main`)
- **Issue:** geen nummer bekend (zie Open vragen 1)
- **Risico:** hoog. De wijziging raakt het formulier (`contact.html` `#formulier`) en de Worker (`src/formulier.js`), dus wat er in de mail aan Carien komt. Er lopen ook twee andere wijzigingen in dezelfde groepen van `contact.html`: #69 (vakje geboortedatum) en #71 (iconen). **Bouwen pas na de merge van #69** en daarna rebasen. Met #71 de samenloop bewaken (zie Buiten scope).

## Doel
Bij prematuurkleding, een babynest of iets op maat kies je in het formulier met een paar tikken een hoofdkleur en een tweede kleur, met kleurstalen erbij. Zo ziet Carien meteen welke kant je op wilt, zonder dat je kleuren hoeft te omschrijven. Je weet ook dat het om een indicatie gaat.

## Kleurenlijst (voorstel, besluit Carst 14 nov.)
Volgorde zoals in het formulier. De hex-waarden zijn een **voorstel van de planner**, op het oog geschat uit Cariens foto's (niet gemeten met een pipet). De website-ontwerper stelt ze definitief vast. Carien kan de lijst later aanpassen.

| Waarde (in formulier en mail) | Voorstel hex | Bron (scratchpad, Cariens foto's van 12 nov.) |
|---|---|---|
| Weet ik nog niet (standaard, waarde leeg) | geen staal | n.v.t. |
| Naturel/wit | `#F4F0E8` | de grondstof van bijna alle prints: `carien-kleding-12nov/kleding-1.jpg`, `carien-plat-12nov/plat-1.jpg`, `plat-30.jpg` |
| Oud roze | `#B88A8E` | biesjes en mutsrand `carien-kleding-12nov/kleding-hangers-sfeer.jpg` / `kleding-5.jpg` (links); roze broekje `kleding-1.jpg` |
| Bordeaux | `#8B2328` | biesjes en mutsrand `carien-kleding-12nov/kleding-5.jpg` (midden) |
| Roest | `#B5582A` | biesjes en mutsband `carien-kleding-12nov/kleding-1.jpg` (links); broekje `carien-plat-12nov/plat-1.jpg` zit tussen roest en bordeaux in (ca. `#94372F`) |
| Oker | `#C9963F` | **zwakke bron:** geen effen okerstof gezien; alleen de herfstbladprint in `kleding-1.jpg` (links) en het gele bloemetje (decoratie) in `plat-1.jpg` |
| Salie | `#A3B19B` | eucalyptusprint `carien-kleding-12nov/kleding-1.jpg` (tweede van links) en `carien-plat-12nov/plat-55.jpg` |
| Olijfgroen | `#7D8560` | broekje en strikje `carien-kleding-12nov/kleding-1.jpg` (rechts); bladprint `carien-plat-12nov/plat-30.jpg` |
| Lichtblauw | `#93B6C8` | biesjes `carien-kleding-12nov/kleding-1.jpg` en `carien-plat-12nov/plat-55.jpg` (stoffig blauw); in `kleding-5.jpg` rechts meer aqua (ca. `#8EC3C6`) |
| Grijs | `#B9B6B0` | **zwakke bron:** geen effen grijze stof gezien; alleen de wilgenkatjesprint in `kleding-5.jpg` en de aar in `plat-30.jpg` |
| Anders | geen staal | vrij veld, alleen zichtbaar bij "Anders" (`:has`), zoals bij de maten |

Bekeken: `kleding-1`, `kleding-5`, `kleding-hangers-sfeer`, `plat-1`, `plat-10`, `plat-20`, `plat-30`, `plat-40`, `plat-55` (map `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/`). De andere foto's zijn niet bekeken.

## Acceptatiecriteria

### A. Formulier (`public/contact.html`)
1. De groepen **Prematuurkleding**, **Babynest** en **Iets op maat laten maken** krijgen elk twee kleurkeuzes: **Hoofdkleur** en **Tweede kleur**. De groep **Kraamcadeaubox** krijgt geen kleurkeuze (die heeft de stofkeuze met thema's) en verandert niet.
2. Elke kleurkeuze is een eigen `<fieldset>` met een `<legend>` ("Hoofdkleur" / "Tweede kleur") en radio-keuzekaarten volgens het bestaande patroon (`label.keuze-kaart` met `input type="radio"`, `.keuze-rand`, `.keuze-vink`), met per kleur een kleurstaal en de **naam van de kleur als zichtbare tekst**. Het staal is decoratief (`aria-hidden="true"`); de naam is de toegankelijke naam van de keuze. De kleur is dus nooit de enige informatie (WCAG 1.4.1).
3. Veldnamen: `prem_kleur`, `prem_kleur2`, `nest_kleur`, `nest_kleur2`, `op_kleur`, `op_kleur2`. Bij "Anders" het vrije veld met dezelfde naam plus `_anders` (bijv. `prem_kleur_anders`, `prem_kleur2_anders`).
4. De opties staan in de volgorde van de tabel hierboven: Weet ik nog niet · Naturel/wit · Oud roze · Bordeaux · Roest · Oker · Salie · Olijfgroen · Lichtblauw · Grijs · Anders. De waarde is de naam zoals in de tabel (bijv. `value="Oud roze"`); "Weet ik nog niet" heeft `value=""` en is standaard `checked`; "Anders" heeft `value="anders"`.
5. Of de tweede kleur ook een optie "Geen" (één kleur) krijgt, beslist de website-ontwerper (Ontwerprichting, vraag 4). Komt die er, dan heeft hij `value="Geen"` en staat hij direct na "Weet ik nog niet".
6. Het vrije veld bij "Anders" is alleen zichtbaar als in die keuze "Anders" is aangevinkt (CSS `:has`, zoals `.maat-anders`). Zonder `:has` is het altijd zichtbaar met de bestaande prefix-aanpak (`<span class="groep-alleen">Alleen bij anders: </span>`). Het veld heeft `maxlength="80"` en `autocomplete="off"`.
7. Bij elke groep met kleurkeuze staat één korte zin dat de kleur indicatief is. Voorstel (moet Carst bevestigen, Open vragen 2): **"De kleuren zijn een indicatie. De echte stof kan iets afwijken."** De zin hoort bij de keuzes (bijv. via `aria-describedby` op de fieldsets of in de legend-omgeving), niet als losse tekst ergens anders.
8. Alle kleurvelden zijn optioneel (geen `required`), net als de andere extra velden. Het formulier blijft `multipart/form-data`.
9. Zonder JavaScript werkt alles: kiezen, het vrije veld bij "Anders" (via `:has`) en versturen. Zonder `:has` zijn alle groepen zichtbaar (bestaand gedrag); de Worker neemt alleen de velden van het gekozen onderwerp over.
10. Het vooraf invullen via `?onderwerp=…` (productpagina's) werkt ongewijzigd; de kleurkeuzes staan dan op "Weet ik nog niet".
11. **Babynest, veld `nest_stof`:** voorstel planner: het veld blijft, alleen voor de stof. Het label wordt "Stof" (was "Stof of kleur"), want de kleur kies je nu met de nieuwe keuze. In de mail wordt de kop dan "Stof". Dit wacht op de ontwerper (Ontwerprichting, vraag 8); als die anders beslist, volgt de bouwer dat.

### B. Worker (`src/formulier.js`)
12. Er komt een lijst `KLEUREN` met precies de waarden uit criterium 4 (zonder "Weet ik nog niet") en, als criterium 5 doorgaat, "Geen" alleen voor de tweede kleur. Een kleurwaarde die niet in de lijst staat valt weg (net als bij `THEMAS` en `MATEN`).
13. `EXTRA_VELDEN` krijgt bij Prematuurkleding, Babynest en Iets op maat laten maken de kleurvelden. In de mail staat:
    - `Hoofdkleur: Salie`
    - `Tweede kleur: Oker`
    - bij "Anders" geen regel voor de keuze zelf, maar het vrije veld: `Hoofdkleur anders: <tekst>` / `Tweede kleur anders: <tekst>` (zie Open vragen 4 over de precieze kop)
    - bij "Weet ik nog niet" (leeg) geen regel.
14. Het vrije veld telt alleen als bij die keuze "Anders" is gekozen of als er niets gekozen is (zonder JS), zoals `ANDERS_BIJ` bij de maten. Is er een vaste kleur gekozen, dan valt een eerder ingevuld vrij veld weg.
15. Het vrije veld wordt opgeschoond met de bestaande `schoon()` (geen regeleinden) en afgekapt op **80 tekens**.
16. Kleurvelden van een ander onderwerp dan het gekozen onderwerp komen nooit in de mail (ook niet als ze zonder `:has` zijn ingevuld). Bij Kraamcadeaubox komt er nooit een kleurregel in de mail.
17. Er wordt niets opgeslagen of gelogd; de botbescherming (rate limit, `formtijd`, Turnstile) en de stofkeuze werken ongewijzigd.

### C. Ontwerp, mobiel en toegankelijkheid
18. De opmaak volgt de Ontwerprichting en de ontwerpcriteria van de website-ontwerper (sectie hieronder, nog in te vullen). Zonder ontwerprichting begint de bouwer niet.
19. Op 390 × 844 en op WebKit 390 × 664 is er geen horizontaal scrollen, zijn alle tikdoelen minstens 44 × 44 px en is elke kleurnaam volledig leesbaar (niet afgekapt).
20. Er is geen zichtbare scrollbalk (de kleurkeuzes zijn een raster, geen horizontale rij; komt er toch een rij, dan als `.carrousel` volgens `CLAUDE.md`).
21. Met het toetsenbord: Tab gaat naar elke kleurkeuze als één groep, pijltjes kiezen binnen de groep (standaard radio-gedrag), de focus is zichtbaar. Een gekozen kaart is zichtbaar anders dan een niet-gekozen kaart, ook zonder kleur te zien (rand en vink).
22. Kleine tekst (kleurnaam, indicatiezin, legend) is inkt `#202020` met minstens 4,5:1 op de achtergrond; geen witte tekst onder 24 px. Elk staal heeft tegen zijn directe achtergrond minstens 3:1 contrast of een rand die dat haalt (WCAG 1.4.11; bijv. Naturel/wit, Lichtblauw en Salie op terracotta en op wit). axe meldt op contact.html geen fouten.
23. Bij "minder beweging" geen overgangen op de kaarten.

### D. Tests en documentatie
24. **Unit** (nieuw, bijv. `tests/kleurkeuze.test.js`): per onderwerp een toegestane hoofd- en tweede kleur in `velden.extra`; een onbekende waarde valt weg; "Anders" met tekst geeft de regel van criterium 13; vrije tekst bij een vaste kleur valt weg; afkappen op 80 tekens; regeleinden weg; kleurvelden van een ander onderwerp en bij Kraamcadeaubox komen niet mee; "Geen" alleen bij de tweede kleur (als criterium 5 doorgaat).
25. **E2e** (nieuw, bijv. `tests/e2e/kleurkeuze.spec.js`, desktop, tablet, mobiel):
    - de kleurkeuzes staan bij Prematuurkleding, Babynest en Iets op maat, niet bij Kraamcadeaubox;
    - "Weet ik nog niet" standaard gekozen; elke kaart heeft een zichtbare naam;
    - het vrije veld verschijnt alleen bij "Anders" en verdwijnt weer;
    - versturen via de testmodus met `x-testmail: ok` en `x-testmail-bevat: Hoofdkleur: Salie` (en een tweede test voor `Tweede kleur: …` en voor "anders");
    - zonder JavaScript (`javaScriptEnabled: false`) kiezen en versturen;
    - tikdoelen ≥ 44 px en geen horizontaal scrollen op 390 px;
    - axe zonder fouten.
26. Bestaande tests (`formulier.test.js`, `stofkeuze`, `formulier-foutmelding`, `formulier-botbescherming`, `kernpaden`, `mobiel-ontwerp`, `contact-ruimte-en-kleur`) blijven groen en worden niet versoepeld. Verandert de hoogte van `#formulier` de meting in `contact-ruimte-en-kleur.spec.js`, dan meldt de bouwer dat in het Verloop; de grenzen worden niet zonder akkoord van Carst aangepast.
27. Visuele basisschermen van Contact veranderen waarschijnlijk; bijwerken alleen via `visueel-basis.yml`, met uitleg in het Verloop.
28. `CLAUDE.md`, regel over het contactformulier: aanvulling over de kleurkeuze (onderwerpen, lijst, standaard, "Anders" via `:has`, indicatiezin, mailregels, Carien kan de lijst bijstellen, verwijzing naar deze brief) en, als criterium 11 doorgaat, het nieuwe label "Stof" bij Babynest.
29. `npm run check` is groen: tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel en validatierapport.

## Ontwerprichting
*Nog in te vullen door website-ontwerper. De planner zet de tekst hier letterlijk neer. Graag ook toetsbare ontwerpcriteria.* Vragen:

1. **Staal: vorm en maat.** Rond of vierkant, hoe groot (desktop / tablet / mobiel)? Staal en naam in één kaart van het bestaande keuzekaart-patroon, of een compactere variant (staal links, naam rechts)? Hoeveel kolommen per breakpoint (11 opties; met "Geen" 12)?
2. **Label en indicatiezin.** Legend-teksten "Hoofdkleur" en "Tweede kleur" goed? Waar staat de indicatiezin (onder de legend van Hoofdkleur, of één keer boven beide keuzes)? Tekstvoorstel staat in criterium 7.
3. **Hoofd- versus tweede kleur.** Hoe maak je het verschil duidelijk (volgorde, grootte, korte uitleg zoals "bijv. de biesjes")? Twee volledige rasters onder elkaar, of de tweede compacter? Let op: "biesjes" is een voorbeeld van de planner, geen goedgekeurde tekst.
4. **Tweede kleur optioneel / "Geen".** Een extra optie "Geen" (één kleur), of is "Weet ik nog niet" genoeg?
5. **Contrast en rand.** De formuliersectie staat op de terracotta laag. Lichte stalen (Naturel/wit, Lichtblauw, Salie, Grijs) en stalen dicht bij terracotta (Roest, Oud roze, Oker) vallen daar weg. Welke rand of welk vlak rond het staal (bijv. 1 px inkt, of het staal op een witte kaart) zodat elk staal minstens 3:1 haalt?
6. **Naam zichtbaar bij elk staal.** Bevestigen dat de naam altijd zichtbaar is (niet alleen bij aanwijzen of als tooltip), ook op mobiel. Welke letter en maat (Source Sans 3, ≥ 16 px?).
7. **Mobiel (390 px).** Kolommen, staalgrootte en hoogte van het hele blok: twee rasters van 11 per groep maken het formulier flink langer. Is dat acceptabel, of liever een compacte vorm? Tikdoelen ≥ 44 px.
8. **Babynest `nest_stof`.** Voorstel planner: het veld blijft voor de stof, label "Stof", kleur via de nieuwe keuze (criterium 11). Akkoord, of het veld weghalen of anders noemen?
9. **Hex-waarden.** Stel de definitieve waarden vast (tabel hierboven; Oker en Grijs hebben een zwakke bron). Wil je de warme kleurcorrectie van de foto's ook in de stalen terugzien?
10. **Gekozen staat.** Volstaan de bestaande `.keuze-rand` en `.keuze-vink`, ook op donkere stalen (Bordeaux, Olijfgroen)?

## Bestanden
- `public/contact.html`: groepen Prematuurkleding, Babynest en Iets op maat (kleurkeuzes, indicatiezin, label `nest_stof`)
- `public/assets/css/style.css`: stalen, raster, `:has` voor het vrije veld bij "Anders"
- `src/formulier.js`: `KLEUREN`, `EXTRA_VELDEN`, controle en mailregels (vrij veld via het `ANDERS_BIJ`-patroon)
- `tests/kleurkeuze.test.js` (nieuw), `tests/e2e/kleurkeuze.spec.js` (nieuw)
- `tests/e2e/basis/`: alleen via `visueel-basis.yml`
- `CLAUDE.md`: regel contactformulier
- Waarschijnlijk niet: `public/assets/js/main.js` (FormData neemt de radio's vanzelf mee; alleen aanpassen als het vooraf invullen of het herstellen van de invoer na een fout de kleurkeuzes niet goed terugzet)

## Buiten scope
- De Kraamcadeaubox-groep, de stofkeuze en de thema's.
- Het vakje geboortedatum (#69) en de iconen (#71): niet in deze branch bouwen. Na de merge van #69 rebasen; raakt #71 dezelfde regels, dan wie het laatst merget lost de samenvoeging op zonder de inhoud van de ander te veranderen.
- Een kleurkeuze bij "Iets anders".
- Kleurstalen op de productpagina's.
- Een beheerscherm waarin Carien de lijst zelf aanpast (zij geeft wijzigingen door; dan volgt een nieuwe brief).
- `wrangler.jsonc`, `_redirects`, `_headers`, `.github/workflows/`.

## Open vragen
**Blokkerend:**
1. **Issue-nummer.** Er is geen issue genoemd. Is er een user story voor, zodat de pull request `Closes #…` kan krijgen? Zo niet, dan geen `Closes`.
2. **Indicatiezin (Carst bevestigen).** Voorstel: "De kleuren zijn een indicatie. De echte stof kan iets afwijken." Akkoord, of andere woorden?
3. **Ontwerprichting.** De bouwer begint pas als de website-ontwerper de vragen hierboven heeft beantwoord (vooral 1, 4, 5, 7 en 8) en de hex-waarden heeft vastgesteld.
4. **Wachten op #69.** Bouwen pas na de merge van #69.

**Niet blokkerend (voorstel planner, tenzij iemand anders beslist):**
5. **Kop van het vrije veld in de mail.** De wens noemt "Anders: <tekst>". Omdat er per groep twee keuzes met "Anders" zijn, stelt de planner "Hoofdkleur anders: …" en "Tweede kleur anders: …" voor (zelfde patroon als "Andere maat of gewicht"). Liever iets anders, zeg het dan.
6. **Kleurenlijst.** Oker en Grijs zijn niet als effen stof gezien in de bekeken foto's. Carien kan de lijst later aanpassen; is het goed dat ze er nu al in staan?
7. **Teksten babynest.** De teksten op `babynest.html` zijn nog niet goedgekeurd. Deze wijziging raakt alleen het label in het formulier op `contact.html`, niet `babynest.html`.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov., 18:12) en de besluiten via keuzevragen (lijst uit Cariens foto's; alleen Prematuurkleding, Babynest, Iets op maat). Hex-waarden op het oog geschat uit 9 foto's, met bron per kleur (Oker en Grijs zwak). Ontwerprichting leeg, met 10 vragen voor de website-ontwerper. Risico hoog (formulier en Worker). Bouwen na de merge van #69; samenloop met #71 |
| Ontwerprichting | website-ontwerper | |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (14 nov., keuzevragen in de chat)
1. **Indicatiezin (goedgekeurd):** "De kleuren zijn een indicatie. De echte stof kan iets afwijken."
2. **Oker en Grijs** blijven in de lijst (Carien kan de lijst later aanpassen).
3. Mailkop bij "Anders": voorstel planner overgenomen ("Hoofdkleur anders: …" en "Tweede kleur anders: …").
4. Geen issuenummer; de PR krijgt geen `Closes`.
