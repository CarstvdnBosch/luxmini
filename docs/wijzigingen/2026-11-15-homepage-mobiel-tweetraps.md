# Homepage op mobiel: drieluik in twee stappen zoals Stock (en Handwerk na herbeoordeling)

- **Datum:** 2026-11-15
- **Aangevraagd door:** Carst, chat 15 nov. 11:43, met schermafdrukken
- **Branch:** `wijziging/homepage-mobiel-tweetraps` (worktree, vanaf `main` na de merge van #88)
- **Story / issue:** vervolg op story 9 ("homepage mobile like Stock"). Het issuenummer is niet bekend (zie Open vraag 5).
- **Risico:** midden.
  - Raakt de homepage op mobiel: `style.css` (mobiele mediaquery), `main.js` (een nieuwe trigger bij scrollen) en de bestaande mobiele toetsen uit #88.
  - Het formulier, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/` blijven ongemoeid.

## Wens (letterlijk)
1. "Drieluik op mobiel zoals Stock: eerst tekst, vervolgens als je erkomt verschijnt het plaatje op de achtergrond met meer tekst op de voorgrond. Voor alle 3."
2. "Handwerk: aanpassen naar het gedrag van Stock."

### Wat de schermafdrukken laten zien
De schermafdrukken staan in `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-15nov/`: 1–6. Dat is een tijdelijke map, die kan worden gewist.

- **3.png (Stock, stap 1):** het blok "01 Future Proof Design" is een effen perzik vlak met alleen het nummer en de kop. Er is geen foto en geen alinea.
- **4.png en 5.png (Stock, stap 2):** hetzelfde blok iets verder gescrold.
  - De foto vult nu het blok, met een donkere sluier.
  - De kop staat erop, met daaronder een lange witte alinea. De tekst staat bovenin het blok.
  - Boven en onder het blok blijft het perzik vlak zichtbaar.
- **1.png:** links Stock (blok 02, al in stap 2). Rechts luxmini.nl live: het drieluik met de **foto boven de tekst** op perzik.
- **2.png:** het drieluik op desktop (ter vergelijking).
- **6.png:** links Stock "003 — Stock in de media": één opengeslagen magazine op een effen vlak, de kop "Magazines", een pijl-link in een kader en tabjes in spatiekapitalen. Rechts luxmini.nl live: Handwerk als **kaarten** ("Warm en eigen / Belettering").

**Let op:** de LUX-helften van 1.png en 6.png tonen de site van **vóór #88**: foto boven tekst en Handwerk als kaarten. Sinds #88 staat de foto op mobiel al als achtergrond onder de tekst, en is Handwerk een lookbook met tabjes 01–04. Dat lookbook is juist gebouwd naar "Stock in de media" uit 6.png. Zie Open vraag 1.

## Doel
Op een telefoon vertelt elk productblok van 001 zijn verhaal in twee stappen, zoals bij Stock:
- eerst een rustige kop;
- zodra je bij het blok bent, verschijnt de foto als achtergrond met de rest van de tekst ervoor.

Handwerk gedraagt zich zoals Carst het bij Stock bedoelt (zie Open vraag 1).

## Acceptatiecriteria
Dit geldt alleen op mobiel: ≤ 760 px, en telefoons liggend volgens de bestaande regel (touch met hoogte ≤ 500 px), voor zover de Ontwerprichting liggend niet uitzondert.

Meten op 360 × 740, 390 × 844, 390 × 664 (WebKit/iPhone), 430 × 932 en 844 × 390.

### A · 001 Producten in twee stappen
1. **Stap 1 (rust).** Elk van de drie blokken (Kraamcadeauboxen, Prematuurkleding, Babynest) toont eerst alleen het nummer (01/02/03) en de kop, op een effen vlak zonder zichtbare foto.
   - De zin en de pijl-link zijn niet zichtbaar.
   - Ze staan wel in de DOM en worden voorgelezen; ze zijn dus niet `display: none` en niet `aria-hidden`.
2. **Stap 2 (aangekomen).** Komt het blok op de plek die de Ontwerprichting vastlegt (drempel in % van de schermhoogte), dan:
   - verschijnt de foto als achtergrond over het hele blok (cover), met de sluier;
   - verschijnen de bestaande zin en de pijl-link.

   Dat geldt voor alle drie de blokken.
3. **Teksten en links gelijk.** Kop, zin en pijl-link blijven letterlijk zoals in `index.html` na #88, met dezelfde `href`'s. Er komt geen nieuwe tekst bij, behalve als Carst die bij Open vraag 3 goedkeurt.
4. **Contrast in beide stappen** (gemeten in de eindstand van elke stap, met de tekst verborgen, zoals ontwerpcriterium 2 van brief 2026-11-14):
   - **Stap 1:** is het vlak een lichte paletkleur (perzik, oker, mauve), dan zijn nummer en kop inkt (≥ 4,5:1). Wit op een lichte paletkleur mag nooit (`CLAUDE.md`, Witte tekst).
   - **Stap 2:** wit op de foto met sluier. De kop (≥ 24 px) haalt ≥ 3:1 op elke plek onder de tekst; het nummer, de zin en de pijl-link (16 px) halen ≥ 4,5:1.
   - Op geen enkel moment staat witte tekst langer dan de overgang zelf (de duur volgt uit de Ontwerprichting) op een lichte paletkleur zonder foto.
   - axe vindt geen fout.
5. **Geen sprong.** De blokhoogte is in stap 1 en stap 2 gelijk; de overgang verandert de opmaak niet (CLS 0 voor de homepage op mobiel). De foto komt niet groter in beeld dan het bestand (criterium 4 van brief 2026-11-14 blijft gelden).
6. **Toetsenbord en ankers.**
   - Krijgt de pijl-link focus terwijl het blok nog in stap 1 staat, dan gaat het blok direct naar stap 2. De link is dus nooit onzichtbaar met focus.
   - Na `#kraamcadeauboxen`, `#kraamcadeaubox`, `#prematuurkleding`, `#prematuur` en `#babynest` staat het blok in stap 2, en staan de kop en de pijl-link helemaal onder de balk in beeld.
   - Tikdoelen zijn ≥ 44 px.
7. **Minder beweging.** Bij `prefers-reduced-motion: reduce` staat elk blok meteen in stap 2: foto en alle tekst zichtbaar, zonder overgang (`transition-duration` 0).
8. **Zonder JavaScript.** Elk blok staat in stap 2: foto, kop, zin en pijl-link zijn zichtbaar en bruikbaar. Het verbergen in stap 1 hangt dus af van een klasse die main.js zet (bijv. onder `.js`).
9. **Terug omhoog.** Wat er gebeurt als je terugscrolt (stap 2 blijft staan, of het blok gaat terug naar stap 1), volgt Open vraag 2. Het gedrag is in elk geval voorspelbaar en wisselt niet heen en weer rond de drempel: er is een tussenruimte of de wissel gebeurt maar één keer.
10. **Balk.** Boven de drieluikblokken blijft de balk zoals na #88 (perzik, donker logo, label inkt), tenzij de Ontwerprichting het vlak van stap 1 anders kiest. Dan haalt het logo/label daarop dezelfde contrasteisen.

### B · 002 Handwerk
11. **Pas bouwen na het antwoord op Open vraag 1.**
    - Kiest Carst optie 1a (het lookbook van #88 is wat hij bedoelt), dan vervalt onderdeel B en blijft Handwerk zoals na #88.
    - Bij optie 1b of 1c vult de planner hier de criteria aan, met de Ontwerprichting.
    - Tot dan verandert de bouwer niets aan `#technieken`.

### Voor alles
12. **Desktop en tablet ongewijzigd.** Op ≥ 761 px (en touch-tablets) wijken drieluik en Handwerk niet af van de visuele basis.
13. **Geen horizontaal scrollen** op alle genoemde schermen (`document.documentElement.scrollWidth === innerWidth`).
14. **Tests.**
    - De bestaande toetsen uit #88 (`tests/e2e/homepage-mobiel.spec.js`, en de mobiele toetsen van het drieluik in `scripts/controleer.py`) gaan uit van stap 2. Ze krijgen alleen een andere verwachte waarde, waar nodig (bijv. eerst naar het blok scrollen).
    - Er komen nieuwe toetsen voor criteria 1–10: stap 1 en stap 2, focus, ankers, minder beweging, zonder JS en contrast in beide stappen.
    - Geen enkele grens of axe-regel wordt versoepeld.
    - De bouwer noemt elke aanpassing in het Verloop.
15. **`CLAUDE.md`** krijgt de nieuwe tekst van de ontwerper bij "Homepage op mobiel → 001 Producten", met een verwijzing naar deze brief. Wat er bij Witte tekst staat, past de bouwer aan als stap 1 of 2 iets verandert aan de uitzondering.
16. **Visueel.** De mobiele basis van 001 wijkt bewust af en wordt bijgewerkt via `visueel-basis.yml`. Desktop en tablet blijven gelijk.
17. **Harness.** `npm run check` is groen. Wat alleen in CI draait (axe, Lighthouse, WebKit/iPhone, visueel), staat in het Verloop.

## Ontwerprichting
*Nog in te vullen door website-ontwerper; de planner zet de tekst hier letterlijk neer, met toetsbare ontwerpcriteria en de tekst voor `CLAUDE.md`.*

**Vragen aan website-ontwerper**

**A · Drieluik in twee stappen**
1. **Het vlak in stap 1.**
   - Elk blok een eigen lichte paletkleur, zoals op desktop: perzik, oker en mauve. Dan is de tekst inkt en wordt die in stap 2 wit.
   - Of één perzik vlak voor alle drie, zoals Stock.
   - Of de warme donkere ondergrond `#2A1C14` met witte tekst, zodat er geen kleurwissel van de tekst nodig is.

   Wat is rustiger, en hoe verloopt de wissel inkt → wit zonder dat wit even op licht staat?
2. **Trigger.** Bij welke positie gaat een blok naar stap 2? Bijvoorbeeld: de bovenrand van het blok op 50 % of 30 % van het scherm, of het blok voor 60 % in beeld. Zorg dat de kop in stap 1 echt even te zien is: niet meteen stap 2 bij binnenkomst.
3. **Overgang.** Hoe verschijnt de foto: overvloeien, een masker van onder (zoals `.inschuif` op Prematuurkleding) of schalen? En de zin en de pijl-link: regels één voor één van onder, zoals op Babynest (y 50 → 0)? Geef duur en easing.
4. **Plek van de tekst.**
   - Stock zet de tekst bovenin, in een kolom van 260 px op x 65 (`stock-analyse-2026-11-07-mobiel.md`). #88 zette hem onderaan op de rand van 32 px.
   - Welke kies je, staat de kop in stap 1 en stap 2 op dezelfde plek, en klopt de sluier (nu donker onderaan) dan nog?
5. **Sluier en contrast.** Geef de sluier voor stap 2 zo, dat 16 px wit ≥ 4,5:1 haalt op alle drie de foto's op de plek van de tekst. Let op het witte broekje (`p-broekje-kleur.jpg`) en het mintgroene vloeipapier (`hero-box-open.jpg`).
6. **"Meer tekst".** Is de bestaande zin plus de pijl-link genoeg als "meer tekst" in stap 2, of oogt het blok dan leeg vergeleken met de lange alinea van Stock? Zo ja, welke indeling (lettermaat, regelafstand, kolombreedte) vult het blok zonder nieuwe tekst? Zie Open vraag 3.
7. **Terugscrollen** (Open vraag 2): wat is jouw advies?
8. **Liggend (844 × 390).** Twee stappen ook daar (tekst links, foto rechts verschijnt), of daar direct stap 2?
9. **Balk** boven de blokken in stap 1 en stap 2: perzik houden of meekleuren?
10. **Toetsbare ontwerpcriteria** en de nieuwe tekst voor `CLAUDE.md` ("Homepage op mobiel → 001 Producten").

**B · Handwerk** (alleen na het antwoord op Open vraag 1)
11. Advies voor Carst: wijkt het lookbook van #88 op een punt wezenlijk af van "Stock in de media" (6.png)? Denk aan de tabjes in woorden in plaats van nummers, het kader om de pijl-link (story 5) en het inschuiven van het object. Of is het al het bedoelde gedrag?

## Bestanden
- `public/assets/css/style.css`: alleen binnen de mobiele mediaquery: `.kern-kolom`, `.kern-beeld`, `.kern-masker`, `.kern-tekst`, en een nieuwe toestandsklasse voor stap 2.
- `public/assets/js/main.js`: een IntersectionObserver voor de drieluikblokken op mobiel (los van de bestaande `drieIo` voor de muis), focus en ankers, minder beweging.
- `public/index.html`: alleen als CSS niet genoeg is (bijv. een klasse op de blokken). Geen tekstwijzigingen.
- `tests/e2e/homepage-mobiel.spec.js`, `scripts/controleer.py`
- `tests/e2e/basis/` (via `visueel-basis.yml`)
- `CLAUDE.md`
- Onderdeel B: pas na Open vraag 1 (`index.html`, `style.css` en `main.js` rond `#technieken`/`.lookbook`).

## Buiten scope
- Desktop en tablet (≥ 761 px, en touch-tablets).
- De hero, 003 Inspiratie, 004 Instagram en de andere pagina's.
- Nieuwe of andere foto's, teksten, linkteksten of prijzen.
- Het dubbele label (balk en sectielabel): eigen wijziging, besluit Carst 14 nov.
- Story 5 (pijl-link met kader).
- Formulier, Worker, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/`.
- Grenzen of axe-regels versoepelen.

## Open vragen

### Blokkerend
1. **Handwerk: welk "gedrag van Stock"?**

   **Blokkerend voor onderdeel B, niet voor A.**

   Carsts schermafdruk van LUX (6.png) toont nog de kaarten van vóór #88. Zijn Stock-voorbeeld is "Stock in de media": één object, een kop en tabjes. Op mobiel is dat precies wat #88 heeft gebouwd (het lookbook met tabjes 01–04).

   De meting van 7 nov. noemt voor Handwerk ook de projectenlijst van Stock: namen van 35 px, gecentreerd, zonder foto's. Daarvoor geldt het besluit van 7 nov.: "principe 3 en Mobiel-regel 10 gaan voor de projectenlijst van Stock". Dat is in #88 op mobiel al vervangen door het lookbook.

   Opties:
   - **1a.** Carst bekijkt eerst #88 op mobiel (preview of live na de deploy). Is het lookbook wat hij bedoelt, dan vervalt B. *Voorstel van de planner.*
   - **1b.** De projectenlijst zoals Stock: vier namen zonder foto's, gecentreerd, met één pijl-link. Dan herziet Carst uitdrukkelijk het besluit van 7 nov. (principe 3 en Mobiel-regel 10 in `docs/ontwerp/principes.md`) en het lookbook van 14 nov. Gevolg: op mobiel zie je bij Handwerk geen foto meer van het werk.
   - **1c.** Het lookbook blijft, met gerichte aanpassingen naar Stock: tabjes met woorden, het object dat inschuift, een kader om de pijl-link. Carst noemt welke.
2. **Terugscrollen in het drieluik.** Blijft stap 2 staan als je weer omhoog scrolt (één keer, rustig), of gaat het blok terug naar stap 1 (zoals bij Stock, als dat zo werkt)? Voorstel: één keer, net als `.opkomen` en `.inschuif` op de rest van de site. De ontwerper kan dat bevestigen. Zonder antwoord bouwt de bouwer "één keer".

### Niet blokkerend
3. **"Meer tekst" in stap 2.** Stock heeft een lange alinea; wij hebben per product één zin. Voorstel: de bestaande zin en de pijl-link, zonder nieuwe tekst. Wil Carst meer tekst, dan zijn dit de goedgekeurde kandidaten:
   - **Kraamcadeauboxen:** de intro van `kraamcadeauboxen.html` ("Een box vol handgemaakte babyproducten in één thema, met de naam en geboortedatum van de baby. Zelfs de doos is persoonlijk."), en eventueel "binnen 7 werkdagen verzonden" (van de oude site);
   - **Prematuurkleding:** Cariens quote van `prematuurkleding.html` ("Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks.");
   - **Babynest:** er is geen andere goedgekeurde tekst dan de zin die er al staat. De teksten op `babynest.html` vallen buiten de goedkeuring van 14 nov., behalve de quote/zin en de prijszin. Zou Carst "Richtprijs € 95" hier willen, dan moet hij dat bevestigen.

   Dubbele tekst met de productpagina is een afweging voor Carst.
4. **Live versus #88.** Klopt het dat Carst de wens baseerde op de live site van vóór #88? Als #88 inmiddels live staat, is het verstandig dat hij de mobiele homepage daar eerst bekijkt. Dat raakt vooral Open vraag 1.
5. **Issuenummer** van story 9 (of een nieuw issue voor deze wens), zodat de pull request `Closes #<nummer>` kan bevatten.
6. **Foto's.** In stap 2 vullen de foto's weer het hele blok. `p-broekje-kleur.jpg` is nog een tijdelijke foto (fotolijst, opname 13). Dat blokkeert niet.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (15 nov. 11:43) en de schermafdrukken 1–6. A (drieluik in twee stappen) kan worden gebouwd zodra de Ontwerprichting er is. B (Handwerk) wacht op Open vraag 1: de LUX-schermafdrukken tonen de stand van vóór #88, en het lookbook van #88 volgt al het Stock-voorbeeld uit 6.png. Ontwerprichting nog leeg, met vragen voor website-ontwerper. Risico midden. |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
