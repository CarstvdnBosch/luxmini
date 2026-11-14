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
| Bouwen | website-bouwer | Kleurkeuze bij Prematuurkleding, Babynest en Iets op maat (box en Iets anders ongewijzigd): per groep `fieldset.keuzes.kleurkeuze` Hoofdkleur (11) en Tweede kleur (12, met "Geen"), liggende `.keuze-kaart.kleur-kaart` met rond staal (`aria-hidden`, rand 1 px `rgba(32,32,32,.6)`, hex uit de definitieve tabel), vink (wit rondje 20 px) midden op het staal, naam in Libre Caslon Text 16 px; 4/3/2 kolommen; indicatiezin (goedgekeurd) als `p.eigen-uitleg` onder de legend Hoofdkleur, `aria-describedby` op beide fieldsets; Tweede kleur pas na een hoofdkleur en "Andere kleur" (`…_anders`, max. 80) alleen bij Anders in de eigen fieldset (beide `:has`, zonder `:has` alles zichtbaar met "Alleen bij anders: "); forced-colors en minder beweging; volgorde vóór het vakje "Geboortedatum volgt nog". Label `nest_stof` → "Stof" (ook mailkop). Eén afwijking: onder 360 px kaartpadding 10 px 8 px en gat 8 px, anders past "Bordeaux" (74 px) niet op 320 px (ontwerpcriterium 3). Worker: `KLEUREN`/`KLEUREN_TWEEDE`, alleen toegestane waarden, vrij veld via het `ANDERS_BIJ`-patroon, tweede kleur alleen bij een hoofdkleur; `src/contact.js` niet aangeraakt. Tests: `tests/kleurkeuze.test.js` (10), `tests/e2e/kleurkeuze.spec.js` (o.a. `x-testmail-bevat`, zonder JS, verschijnen/verdwijnen Tweede kleur, 320/390 px, forced-colors), 3 axe-tests in `toegankelijkheid.spec.js`, `controleer.py` veldenlijst +50; mailkop "Stof" in `formulier.test.js`/`contact.test.js`. In `geboortedatum-volgt.spec.js` twee metingen aangepast aan de nieuwe volgorde, grenzen gelijk: Tab naar het vakje start nu vanaf de gekozen Hoofdkleur (was naam/maat), en de Babynest-hoogte (≤ 345 px op 390 px) telt de kleurkeuzes niet mee (die hebben hun eigen grens van 460 px). Hoogte `#formulier` bij standaardonderwerp Kraamcadeaubox ongewijzigd (`contact-ruimte-en-kleur` groen). Lokaal: `npm test` 192/192; `controleer.py` geen fouten; Playwright Chromium (desktop/tablet/mobiel, zonder axe-specs) 483 geslaagd, 1 mislukt door tijd onder belasting (botbescherming "binnen 1 s", 2862 ms > 2800 ms), daarna los 3 × geslaagd. Niet lokaal: axe-specs (`@axe-core/playwright` niet geïnstalleerd), iPhone/WebKit, Lighthouse, visueel en validatierapport; die draaien in CI. Visueel: Contact verandert alleen als Prematuurkleding/Babynest/Iets op maat open staat; standaard (box) naar verwachting gelijk |
| Controleren | website-controleur | AKKOORD — alleen 3 groepen, indicatiezin en hex exact, Tweede kleur via :has en in Worker alleen bij hoofdkleur, Andere kleur per fieldset, contact.js ongewijzigd; npm test 192/192, controleer.py zonder fouten, Playwright Chromium 484/0; testaanpassingen volgen uit de opbouw, geen versoepeling |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD — kaarten met staal en vink op 1440/1024/768/390/320, Tweede kleur en Andere kleur goed, focus/hoog contrast/minder beweging in orde; kleinere kaartpadding onder 360 px (10 px 8 px, gat 8 px) akkoord als aanvulling op de richting. P1 vervolg (aparte brief): main.js stuurt verborgen velden niet mee |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (14 nov., keuzevragen in de chat)
1. **Indicatiezin (goedgekeurd):** "De kleuren zijn een indicatie. De echte stof kan iets afwijken."
2. **Oker en Grijs** blijven in de lijst (Carien kan de lijst later aanpassen).
3. Mailkop bij "Anders": voorstel planner overgenomen ("Hoofdkleur anders: …" en "Tweede kleur anders: …").
4. Geen issuenummer; de PR krijgt geen `Closes`.


## Ontwerprichting (website-ontwerper, 14 nov.; vervangt de lege sectie hierboven)


1. **Patroon en vorm.** Elke kleurkeuze is een `fieldset.keuzes.kleurkeuze` met kaarten volgens het bestaande patroon: `label.keuze-kaart.kleur-kaart` met een radio, `.keuze-rand` en `.keuze-vink`. Er zit geen foto in, dus de kaart is liggend en compact:
   - links een rond staal (`span.kleur-staal`, `aria-hidden="true"`): 32 px vanaf 1025 px, 28 px daaronder;
   - rechts de kleurnaam in Libre Caslon Text, 16 px, inkt, zoals `.stof-kaart-naam`;
   - de kaart: min. 48 px hoog, padding 10 px 12 px, gat tussen staal en naam 12 px (mobiel 10 px), achtergrond zoals elke keuzekaart (wit 92 %, op terracotta gemeten `#FAF5F3`).

   De vink staat niet rechtsboven, maar midden op het staal: een wit rondje van 20 px met een inktvink. Daardoor heeft de naam de volle breedte en is de vink op elk staal te zien, ook op Bordeaux, Olijfgroen en Naturel/wit.

   Kolommen:
   - vanaf 1025 px: 4 kolommen;
   - 761–1024 px: 3 kolommen;
   - tot 760 px: 2 kolommen;
   - gat 12 px (mobiel 10 px).

   Opties zonder kleur hebben ook een staal, zodat het raster gelijk blijft:
   - "Weet ik nog niet": een lege, gestippelde ring;
   - "Geen": een ring met een schuine lijn;
   - "Anders": een ring met een plusje.

   Dit is een raster, geen rij: er komt geen scrollbalk en geen `.carrousel`.

2. **Volgorde en hiërarchie.** In de groepen Prematuurkleding, Babynest en Iets op maat komen de kleurkeuzes over de volle breedte, ná de bestaande velden (maat, anders, naam of stof) en vóór het vakje "Geboortedatum volgt nog". Dat vakje blijft de laatste regel, zoals afgesproken bij #69.

   Eerst komt **Hoofdkleur**: legend "Hoofdkleur". Direct daaronder staat de indicatiezin "De kleuren zijn een indicatie. De echte stof kan iets afwijken." als `p.eigen-uitleg` (16 px, inkt), met een eigen id per groep (`prem-kleur-uitleg`, `nest-kleur-uitleg`, `op-kleur-uitleg`). Daarna het raster.

   Daarna komt **Tweede kleur**: legend "Tweede kleur", met hetzelfde raster plus "Geen" direct na "Weet ik nog niet". Beide fieldsets krijgen `aria-describedby` naar de indicatiezin. De zin staat dus één keer in beeld en hoort bij beide keuzes.

   Het verschil tussen hoofd- en tweede kleur maak je duidelijk met de volgorde en met het moment waarop de tweede verschijnt: de tweede kleur is pas zichtbaar als bij Hoofdkleur iets anders dan "Weet ik nog niet" is gekozen (CSS `:has`, zachte vervaging zoals `groep-in`). Zonder `:has` staat hij er altijd. Er komt geen extra uitleg zoals "bijv. de biesjes": dat is geen goedgekeurde tekst. Wil Carst zo'n regel, dan in een nieuwe brief.

   De legends krijgen dezelfde stijl als de andere keuzes: 11 px in kapitalen op desktop en tablet, 16 px (600) op mobiel.

3. **"Anders" en het vrije veld.** Het vrije veld staat direct onder het raster, in dezelfde fieldset:
   - label "Andere kleur" (zonder `:has` met de prefix "Alleen bij anders: ");
   - `maxlength="80"`, `autocomplete="off"`.

   Het veld is alleen zichtbaar als in díé fieldset "Anders" is gekozen: `.kleurkeuze:has(input[value="anders"]:checked) .kleur-anders`. Hoofd- en tweede kleur zijn zusters, niet in elkaar genest. Zo opent "Anders" bij de hoofdkleur nooit het veld van de tweede kleur. De bestaande maatregel `:has(option[value="anders"])` reageert alleen op `option` en wordt niet geraakt.

4. **Rand en contrast.** Elk staal heeft een rand van 1 px `rgba(32,32,32,.6)`. Op de kaart is dat `#777574` tegen `#FAF5F3`, dus 4,2:1. Zo valt geen enkel staal weg, ook Naturel/wit (1,13:1 zonder rand), Grijs, Lichtblauw, Salie, Oud roze en Oker niet.

   De stalen staan op de witte kaart, nooit direct op terracotta. Gekozen ziet er zo uit: de kaartrand wordt 1 px inkt (bestaand), plus de vink op het staal. Met een muis wordt de rand bij aanwijzen 40 % inkt, zoals bij de stofkeuze. De focus is de bestaande outline van 2 px inkt met 3 px afstand.

   Bij geforceerde kleuren (`forced-colors: active`): het staal krijgt `forced-color-adjust: none`, zodat de kleur blijft, en de rand wordt `CanvasText`.

   De kleur is nooit de enige informatie: de naam staat altijd zichtbaar naast het staal, ook op touch. Er zijn geen tooltips.

5. **Mobiel (390 px).** 2 kolommen van 158 px, staal 28 px. Alle namen passen op één regel, behalve "Weet ik nog niet" (twee regels). De namen breken alleen op aangegeven punten: `Naturel/<wbr>wit`, `Licht&shy;blauw`, `Olijf&shy;groen`, met `hyphens: manual`. Zo blijven ze op 320 px heel.

   Standaard staat alleen Hoofdkleur in beeld. Dat is ongeveer 6 rijen, ca. 430 px inclusief legend en indicatiezin. De tweede kleur voegt pas na een keuze ca. 380 px toe. Zo wordt het formulier niet standaard een scherm langer.

6. **Babynest, zonder JS en zonder `:has`.**
   - `nest_stof` blijft. Het label wordt "Stof" (criterium 11 akkoord), zonder placeholder, want de teksten op babynest zijn nog niet goedgekeurd.
   - Zonder JavaScript werkt alles via CSS.
   - Zonder `:has` staan alle groepen, beide kleurkeuzes en de vrije velden er met hun prefix "Alleen bij …".
   - Bij "minder beweging" zijn er geen overgangen op kaarten of vervaging.
   - De groep Kraamcadeaubox verandert niet.

## Ontwerpcriteria (toetsbaar)

1. Op 390 × 844 (Chromium) en 390 × 664 (WebKit) staan de kleurkaarten in 2 kolommen. Op 768 × 1024 in 3, op 1440 × 900 in 4.
2. Elke kleurkaart is minstens 44 × 44 px (doel 48 px hoog). Op 320, 390, 768 en 1440 px is er geen horizontaal scrollen (`scrollWidth ≤ clientWidth` op `html`).
3. Op 320 en 390 px is elke kleurnaam volledig zichtbaar (naam `scrollWidth ≤ clientWidth`). Afbreken mag alleen bij `&shy;` of `<wbr>`.
4. Elk staal is rond: 32 px vanaf 1025 px, 28 px daaronder. Het heeft een rand van 1 px `rgba(32,32,32,.6)` en haalt minstens 3:1 tegen de kaart (gemeten 4,2:1). De `background-color` is precies de hex uit de tabel hieronder.
5. Bij laden is bij Hoofdkleur "Weet ik nog niet" gekozen en is Tweede kleur niet zichtbaar. Na het kiezen van een kleur of "Anders" verschijnt Tweede kleur, met "Weet ik nog niet" gekozen. Terug naar "Weet ik nog niet" verbergt hem weer. Zonder `:has` is hij altijd zichtbaar.
6. Het vrije veld "Andere kleur" is alleen zichtbaar bij "Anders" in de eigen fieldset. "Anders" bij Hoofdkleur toont het veld van Tweede kleur niet, en omgekeerd ook niet.
7. Een gekozen kaart heeft een kaartrand van 1 px inkt en een zichtbare vink op het staal (wit rondje van 20 px, inktvink), op alle 12 stalen. De focus is zichtbaar (2 px inkt, 3 px afstand). Tab gaat per fieldset naar één keuze, de pijltjes kiezen binnen de groep.
8. Kleurnaam en indicatiezin zijn 16 px in inkt. De indicatiezin staat direct onder de legend "Hoofdkleur", één keer per groep, met hooguit ca. 75 tekens per regel. Beide fieldsets verwijzen er met `aria-describedby` naar.
9. Volgorde in elke groep: bestaande velden, dan Hoofdkleur, dan Tweede kleur, dan het vakje "Geboortedatum volgt nog" als laatste regel.
10. Op 390 px, met de standaardkeuzes bij Prematuurkleding, is het kleurblok (van legend Hoofdkleur tot en met de laatste kaart) ≤ 460 px hoog.
11. Bij `prefers-reduced-motion: reduce` zijn er geen overgangen of animaties op kleurkaarten of op het verschijnen van Tweede kleur.
12. Bij `forced-colors: active` blijft elk staal zijn kleur houden en is de rand `CanvasText`.
13. De groep Kraamcadeaubox is visueel ongewijzigd. Er staat geen kleurkeuze bij Kraamcadeaubox of bij Iets anders.
14. axe meldt op contact.html geen fouten, ook niet met elk van de drie onderwerpen gekozen en Tweede kleur zichtbaar.

## Definitieve kleurtabel

Hoe ik heb gemeten:
- Ik nam de mediaan van een effen vlak (de middelste 40 % van de pixels op helderheid).
- Bij foto's van een plat gelegd kledingstuk heb ik de witbalans en belichting gecorrigeerd naar het witte papier in dezelfde foto (papier = `#F7F7F7`).
- De foto's aan het rekje zijn te ongelijk belicht om er rechtstreeks op te meten. Die gebruikte ik alleen als controle.
- Alleen Naturel/wit heeft de lichte warme correctie van de foto's gekregen. De andere kleuren niet: warmer maken trekt Oud roze, Roest en Oker naar terracotta, en dan zijn ze slechter te onderscheiden.
- Foto's staan in `carien-plat-12nov/` en `carien-kleding-12nov/` in de scratchpad.

| Waarde | Hex | Bron en meting |
|---|---|---|
| Weet ik nog niet | geen staal (gestippelde ring) | n.v.t. |
| Geen (alleen Tweede kleur) | geen staal (ring met schuine lijn) | n.v.t. |
| Naturel/wit | `#EEE8DF` | witte stof `plat-30.jpg` (ten opzichte van papier `#E7E2DE`), licht warm gezet; controle `plat-12.jpg` |
| Oud roze | `#C4939C` | effen broekjes `plat-7.jpg` (ruw `#B2868D`) en `plat-26.jpg` (ruw `#C2949E`); midden tussen ruw en gecorrigeerd. De biesjes in `kleding-5.jpg` zijn meer mauve (`#AD8A8E`) |
| Bordeaux | `#7A2830` | broekje `plat-1.jpg` (`#742629`), mutsrand `plat-1.jpg` (`#823B3E`), kraag `kleding-5.jpg` (`#76191F`) |
| Roest | `#A54F33` | mutsband `plat-18.jpg` (`#A2543E`, ruw `#A75740`); controle band `kleding-1.jpg` (`#9A3C12`) |
| Oker | `#C29043` | **zwak:** geen effen stof. Bladprint `kleding-1.jpg`, `plat-24.jpg` (`#B4976E`) en het gele bloemetje `plat-1.jpg` (`#DFB246`) |
| Salie | `#9DA88F` | **middel:** alleen de print. Eucalyptusblad `plat-30.jpg` (`#93967C`) en `kleding-1.jpg` (`#7C9AA3`), naar het lichtere waterverf-gemiddelde |
| Olijfgroen | `#646550` | effen broekje `plat-63.jpg` (`#63604D`) en broekje `kleding-1.jpg` ten opzichte van de muur (`#61634F`); twee bronnen die goed overeenkomen. Het voorstel `#7D8560` was te groen en te licht |
| Lichtblauw | `#A8BCC6` | broekje `plat-38.jpg` (`#ACBBC5`), kraag `kleding-1.jpg` (`#A8BDC6`); controle `plat-12.jpg` (`#9AA6AD`) |
| Grijs | `#BBBAB7` | **nu wel een effen bron:** de grijs gemêleerde tailleband `plat-19.jpg` (ruw `#C9CBD4`). Iets donkerder en neutraler gezet, zodat het staal naast Naturel/wit en Lichtblauw te onderscheiden blijft |
| Anders | geen staal (ring met plus) | vrij veld "Andere kleur" |

Contrast tegen de kaart `#FAF5F3`, zonder rand: Bordeaux 8,9 · Olijfgroen 5,5 · Roest 5,2 · Oker 2,6 · Oud roze 2,4 · Salie 2,3 · Lichtblauw 1,8 · Grijs 1,8 · Naturel/wit 1,1. Met de rand van 1 px haalt elk staal 4,2:1.

## Wat de planner nog moet aanpassen in de brief

- **Criterium 5:** "Geen" gaat door (`value="Geen"`, alleen bij Tweede kleur, direct na "Weet ik nog niet"). In de mail: `Tweede kleur: Geen`.
- **Nieuw in B (Worker):** de tweede kleur en "Tweede kleur anders" tellen alleen als er een hoofdkleur is, dus een vaste kleur of "Anders" met tekst. Anders valt de tweede kleur weg. Dat voorkomt een oude waarde uit een verborgen Tweede kleur. Er hoort een unit-test bij.
- **Criteria 6 en 3:** het label van het vrije veld is "Andere kleur". De mailkoppen blijven "Hoofdkleur anders: …" en "Tweede kleur anders: …" (besluit Carst).
- **Criterium 11:** akkoord met het label "Stof".
- **Criterium 25 (e2e):** voeg toe dat Tweede kleur verschijnt en weer verdwijnt (ontwerpcriterium 5).

Voor Carien, niet voor deze brief: op haar foto's zie ik ook effen petrol (`plat-19`, `plat-33`), mint (`plat-9`), donkerblauw (`plat-8`, `plat-49`) en donkergrijs/taupe (`plat-15`, `#57524F`). Die kunnen erbij als zij de lijst bijstelt.


## Aanvulling hoofdsessie (14 nov.)
De aanpassingen uit 'Wat de planner nog moet aanpassen in de brief' hierboven gelden als acceptatiecriteria: 'Geen' bij Tweede kleur; Worker neemt Tweede kleur (en 'Tweede kleur anders') alleen over als er een hoofdkleur is (vaste kleur of 'Anders' met tekst), met unit-test; label vrij veld 'Andere kleur'; label nest_stof 'Stof'; e2e toetst dat Tweede kleur verschijnt en verdwijnt. De hex-waarden in de 'Definitieve kleurtabel' vervangen de voorlopige tabel.
