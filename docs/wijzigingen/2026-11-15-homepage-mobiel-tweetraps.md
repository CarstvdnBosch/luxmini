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

### Antwoord website-ontwerper (rol 1, 15 nov.) — A · Drieluik in twee stappen op mobiel

Gemeten na #88 (Chromium, eigen poort; 390 × 844, 390 × 664, 360 × 740). Wit op de foto met sluier, slechtste pixel onder de tekst: tekst boven met sluier .66 tot 420 px ≥ 5,43 / 5,34 / 5,36 : 1; met .60 haalt broekje en nest 4,42 (te laag) → sluier blijft .66. Inkt in stap 1: 8,8 (perzik), 6,68 (oker), 6,07 (mauve); wit zou 1,85/2,44/2,69 halen → nooit wit op het vlak. Wit op `#2A1C14` ≈ 16,8:1.

1. **Vlak stap 1:** per blok eigen lichte paletkleur met inkt: Kraamcadeauboxen perzik `#DEB799`, Prematuurkleding oker `#C89F67`, Babynest mauve `#B5969E`; nr en kop inkt. Blok 1 loopt naadloos door in het perzik van "001 — Producten". De tekst wordt pas wit als de foto met sluier eronder ligt.
2. **Trigger:** stap 2 zodra de bovenrand van het blok 50 % van de schermhoogte passeert (eigen IntersectionObserver, `rootMargin: 0px 0px -50% 0px`, los van `drieIo`). Al boven die lijn bij laden/anker: direct stap 2 zonder overgang.
3. **Overgang:** foto onthult van boven naar beneden (`.kern-beeld` van `translateY(-101%)`, `.kern-masker` van `translateY(101%)` naar `none`, 1 s, `cubic-bezier(.215,.61,.355,1)`, geen scale: `scale(1.3)` vervalt op mobiel). Nr en kop verkleuren inkt → wit, 0,4 s `var(--rustig)`, vertraging 0,2 s. Zin en pijl-link van onder op: y 50 → 0, opacity 0 → 1, 1 s, `cubic-bezier(.215,.61,.355,1)`, vertraging 0,3 s / 0,4 s. Stap 1: zin en pijl alleen `opacity: 0` + `pointer-events: none` (niet visibility/display/aria-hidden). Tik op het blok in stap 1 → stap 2 (volgt geen onzichtbare link). Focus binnen het blok → direct stap 2 (`:focus-within` + klasse uit main.js). Algemene opkom-animaties (`.opkomen` op `.kern-tekst .pijl`, woordanimatie `.kop-m`) op mobiel uitsluiten voor het drieluik of door de stap-2-klasse laten starten.
4. **Plek:** tekst bovenin, Δy = 0 tussen stap 1 en 2: padding boven 72 px, zijmarge `var(--rand)`; nr 16 px, kop 40 px / 1,08, zin 18 px / 1,6 met `max-width: 300px`, pijl 16 px ≥ 44 px hoog; tekstvak eindigt rond 322 px. Sluier: `linear-gradient(to bottom, rgba(42,28,20,.66) 0, rgba(42,28,20,.66) 420px, rgba(42,28,20,.28) 100%)`. Blokhoogte blijft `clamp(520px, 100svh − 96px, 720px)`. `.kern-masker` houdt `#2A1C14` (wit leesbaar zonder geladen foto).
5. **Meer tekst:** niet nodig; bestaande zin + pijl-link. Geen nieuwe tekst.
6. **Terugscrollen:** één keer; stap 2 blijft staan (besluit Carst).
7. **Liggend (touch, hoogte ≤ 500):** direct stap 2, ongewijzigd na #88.
8. **Balk:** perzik zoals na #88 (donker logo, label inkt), in stap 1 en 2.

**Ontwerpcriteria (mobiel ≤ 760; 360 × 740, 390 × 844, 390 × 664 WebKit)**
1. Stap 1: kolomachtergrond `#DEB799` / `#C89F67` / `#B5969E`; `.kern-beeld` geheel buiten de kolom; `.nr` en `.kop-m` `#202020` (≥ 6:1); `.klein` en `.pijl` opacity 0 en `pointer-events: none`, in de DOM, niet display none/visibility hidden/aria-hidden, pijl focusbaar.
2. Trigger: bovenrand op 60 % vh → stap 1; op ≤ 50 % → stap 2. Kop vóór de wissel helemaal in beeld gedurende ≥ 160 px scrollen (390 × 664) en ≥ 240 px (390 × 844).
3. Volgorde: `translateY` 1 s met genoemde easing, geen `scale` op de `img`; kleurovergang nr/kop delay ≥ 0,2 s, duur 0,4 s; zin/pijl y 50 → 0, 1 s, delay 0,3 / 0,4 s; nooit witte tekst op paletkleur; na 1,5 s stil.
4. Plek: bovenkant `.nr` 72 px (±2) onder de kolom, Δy = 0 voor nr en kop; zin 18 px / 1,6, max 300 px; pijl 16 px ≥ 44 px hoog; onderkant pijl ≤ 340 px onder de kolom.
5. Sluier exact zoals punt 4; wit op het lichtste pixel onder nr, kop, zin, pijl ≥ 4,5:1 op alle drie de foto's; zonder foto op `#2A1C14`; axe 0 fouten.
6. Blokhoogte stap 1 = stap 2; CLS 0 op mobiel; geen horizontaal scrollen; geen foto groter dan het bestand.
7. Eén keer: stap 2 blijft, ook na terugscrollen of uit beeld.
8. Tab naar de pijl in stap 1 → stap 2 in hetzelfde frame, zichtbare focusrand, opacity 1 na de overgang. Tik in stap 1 → stap 2, URL ongewijzigd. Na `#kraamcadeauboxen`, `#kraamcadeaubox`, `#prematuurkleding`, `#prematuur`, `#babynest` en na herladen halverwege: direct stap 2, kop en pijl onder de balk (56 px) en binnen het scherm.
9. Minder beweging, zonder JS en liggend (844 × 390): direct stap 2 zoals na #88 (`transition-duration` 0 bij minder beweging); verbergen alleen onder `.js` via een klasse uit main.js, niet bij liggende telefoons.
10. Balk boven het drieluik perzik `#DEB799`, donker logo, label inkt, stap 1 en 2.
11. Desktop, tablet en touch-tablets wijken niet af van de visuele basis.

**Tekst voor `CLAUDE.md`** (vervangt "001 Producten" onder Homepage op mobiel): drie blokken over de volle breedte (`clamp(520px, 100svh − 96px, 720px)`) in twee stappen. Stap 1: effen vlak in de paletkleur van het blok (perzik · oker · mauve), alleen nummer en kop in inkt, bovenin (72 px); zin en pijl-link met opacity 0 (voorleesbaar en focusbaar). Stap 2, één keer, zodra de bovenrand 50 % van het scherm passeert, bij focus of tik: foto onthult van boven naar beneden (1 s, niet schalen) met sluier `rgba(42,28,20)` .66 (bovenste 420 px) naar .28; dan worden nummer en kop wit (0,4 s, na 0,2 s) en komen zin (18 px) en pijl-link (16 px) van onder op (na 0,3 en 0,4 s); alle witte tekst ≥ 4,5:1; wit nooit op de paletkleur. Na anker/herlaad, bij minder beweging en zonder JS direct stap 2. Liggend: tekst links op `#2A1C14`, foto rechts, altijd stap 2. Balk perzik. Bij **Witte tekst** de uitzondering uitbreiden met de mobiele drieluikblokken in stap 2 (wit op foto met warme sluier ≥ .66 boven de tekst).

Kan beter (geen criterium): naamlabel "Sem" valt deels achter de pijl-link; voor onderin ingekaderde foto's zie fotolijst; prematuurfoto is tijdelijk.

## Besluiten Carst (15 nov., keuzevragen in de chat)
1. **Handwerk (deel B):** Carst bekijkt eerst de live site met #88 (lookbook). Deel B wordt **niet** gebouwd in deze wijziging.
2. **Terugscrollen:** stap 2 blijft staan (één keer).
3. **Meer tekst:** geen nieuwe tekst (advies ontwerper; geen nieuwe tekst = geen akkoord nodig).

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
| Bouwen | website-bouwer | Deel A gebouwd; deel B (Handwerk) niet, op besluit van Carst. **CSS** (`style.css`, alleen `max-width: 760px`): staand tekst bovenin (72 px), zin 18 px / 1,6, sluier .66 bovenin (420 px) naar .28, kolom in de paletkleur (perzik · oker · mauve). Stap 1 en de overgangen alleen onder `.js .drieluik.stappen`, met `.aangekomen` (stap 2), `:focus-within`, `.direct` (zonder overgang) en `.stappen-wissel` (aan/uit zonder vervagen). Liggend krijgt weer `#2A1C14` en zin 16 px, net als na #88. **JS** (`main.js` §5h): `.stappen` alleen bij staand ≤ 760 px met beweging. Eigen IntersectionObserver met `rootMargin -50%`, eenmalig. Een tweede observer ("gezien") bepaalt of er een overgang komt; na laden, herladen, een anker (ook `hashchange`) of een sprong gaat het blok direct naar stap 2. Bij focus of een tik in stap 1 gaat het blok naar stap 2; de tik volgt geen link. De foto's worden vooraf op `eager` gezet, omdat ze in stap 1 buiten de kolom liggen. `index.html`: alleen het commentaar. Geen tekst- of linkwijzigingen. Gemeten in Chromium: nr 72 px, alle koppen op één regel (onderkant 151 px). Daardoor staat de kop vóór de wissel 181 px (390 × 664) en 271 px (390 × 844) helemaal in beeld. Onderkant pijl-link: 322 px. **Tests:** nieuw `tests/e2e/homepage-mobiel-tweetraps.spec.js` (projecten mobiel en iphone/WebKit). Dekt stap 1, de trigger op 60/50 %, elke frame "wit alleen op de foto", Δy 0 en gelijke hoogte, één keer, de overgangstijden, focus (Tab) en tik, de vijf ankers, `hashchange` en herladen, de balk in stap 1 en 2, minder beweging, liggend, zonder JS, desktop/tablet zonder stappen en geen horizontaal scrollen. Aangepast in `homepage-mobiel.spec.js` (alleen andere verwachte waarden, niets versoepeld): de kolom staand in de paletkleur, nu het masker op `#2A1C14` (liggend de kolom); tekst bovenin (nr 72 ± 2 px) in plaats van onderaan (≤ 48 px); zin staand 18 px in plaats van 16. In `scripts/controleer.py`: nieuwe controle `drieluik_stappen` (herladen bovenaan, stap 1, daarna elk blok naar stap 2 en terug omhoog); de mobiele kleurtoets kijkt naar het masker in plaats van de kolom; `pijl_meer` wacht 1,6 s in plaats van 1,3 s (stap 2 duurt 1,4 s). **Uitkomst:** `npm test` groen. Playwright in Chromium (eigen poort 4791, 2 workers, zonder de axe-specs: `@axe-core/playwright` ontbreekt lokaal): 718 geslaagd, 7 rood bij een machinebelasting van ~10. Alle 7 waren groen bij een herhaling met 1 worker. In die herhaling waren 3 andere tests rood, alle drie in logo-krimpen op tablet (/contact, CLS met en zonder intro). Dat zijn tijdgevoelige tests buiten de homepage op mobiel. Alleen in CI: axe, Lighthouse, WebKit/iPhone en visueel. De mobiele basis van 001 wijkt bewust af (bijwerken via `visueel-basis.yml`). **Na AKKOORD van de controleur, twee kan-beter-punten verwerkt:** (1) De overgangstoets wacht nu tot `.stappen-wissel` weg is; geen grens veranderd. (2) In `main.js` §5h komen de observers, focus/tik en ankers alleen als het scherm t/m 760 px is, ook bij resize of draaien. Op desktop en tablet komt er dus geen `.aangekomen` en worden de foto's niet op `eager` gezet. De toets voor desktop en tablet controleert dat nu ook: geen `.aangekomen` na scrollen en focus, en op tablet blijven de foto's lazy. `origin/main` was niet nieuwer. Betrokken specs groen in Chromium (poort 4791). Eén tablettoets (menu) liep in een time-out bij belasting ~10 en was groen bij herhaling. Sitecontrole groen ("Geen fouten gevonden"). **CI-run 43733337103 (PR #90), drie punten opgelost:** (1) Spec "ankers en herladen": de pijl-link stond in CI na 150 ms nog onder het scherm (893 px). Oorzaak: de browser glijdt door `html { scroll-behavior: smooth }` naar het anker (lokaal gemeten ca. 0,6 s, in CI langer). De site landt goed: bovenrand van het blok op 84 px, kop en pijl-link in beeld. De toets controleert nu meteen bij het laden dat het blok direct in stap 2 staat, en meet kop en pijl-link pas als het scrollen stilstaat. De grens is gelijk gebleven. (2) WebKit gaf de regelafstand als 28.800001 px; de toets gebruikt nu `toBeCloseTo(28.8, 1)`. Dat is een afronding van de meting, geen versoepeling; de lettermaat blijft exact 18. (3) `controleer.py` `drieluik_stappen`: `scrollTo(0, 0)` gleed zacht (smooth), en het herladen herstelde de pagina halverwege die scroll. Blok 1 stond daardoor al boven de 50 %-lijn en ging terecht direct naar stap 2. De controle scrolt nu instant naar boven en opent de pagina opnieuw (nieuwe navigatie, geen herstelde scrollpositie). Daarna is stap 1 alleen verwacht voor blokken die onder de lijn beginnen. De site is niet gewijzigd.  |
| Controleren | website-controleur | **AKKOORD** (654c064): stap 1/2 gemeten op 360/390/430 px, wit op foto ≥ 5,34:1, tik/focus/ankers/minder beweging/zonder JS/liggend goed, CLS 0; desktop en tablet 0 pixels verschil met origin/main; aangepaste toetsen zijn ontwerpgevolgen. Daarna alleen toets- en controlefixes (d63e220, 740bc19: meetmoment na het zacht scrollen, toBeCloseTo voor WebKit-afronding, controle zonder teruggezette scrollpositie) en §5h alleen op smal scherm; site-gedrag ongewijzigd. |
| Ontwerpgate | website-ontwerper | **ONTWERP AKKOORD** (d63e220): twee stappen zoals de ontwerprichting op 390 × 844, 390 × 664, 360 × 740; liggend en desktop ongewijzigd. Kan beter: "Sem" deels achter de pijl-link (fotokeuze), kop ~0,2 s inkt op de foto tijdens de wissel. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
