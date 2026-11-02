# Ontwerp A + leesbaarheid: veegbare kaarten, werkwijze-zin, vast ritme, dia uit beeld en diepere terracotta

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst (scope goedgekeurd op 2 november 2026, inclusief de diepere terracotta `#BC8565`)
- **Risico:** midden. De wijziging is zichtbaar op alle pagina's: kleur, typografie, witruimte en interactie. Het formulier, de Worker, `_redirects`, `wrangler.jsonc` en `.github/workflows/` blijven onaangeroerd.

## Doel
Bezoekers zien op telefoon en tablet meteen de foto's van het portfolio en de thema's, lezen de werkwijze zonder te hoeven aanwijzen en kunnen kleine tekst op terracotta goed lezen. Lege schermen en de dia die half in beeld staat verdwijnen. Basis: punt 1, 2, 4, 5 en 6 uit `docs/ontwerp/review-2026-11-02.md`.

## Acceptatiecriteria

**Kaarten, werkwijze, ritme en dia (punt 1, 4, 5, 6)**
1. Alle "Ontwerpcriteria (toetsbaar)" hieronder (1 t/m 12) zijn gehaald. Uitzonderingen staan alleen onder "Bekende uitzonderingen".
2. De kaartenrij `.kaarten` staat in de HTML van `#portfolio` (`index.html`) en `#themas` (`kraamcadeaubox.html`), met `loading="lazy"` en dezelfde foto's, namen en `alt`-teksten als de bestaande `.hoverlijst`. Er zijn geen nieuwe foto's of namen bijgekomen.
3. De drie werkwijzezinnen (`.kern-zin`) en de resterende teksten staan er letterlijk zoals in de ontwerprichting (punt 2). Er is geen nieuwe inhoud verzonnen.

**Leesbaarheid en terracotta (punt 2)**
4. In `public/assets/css/style.css` staat `--terracotta: #BC8565`. De oude waarde `#C7997E` komt nergens meer voor in `public/`. Controle: `grep -ri "C7997E" public/` geeft niets.
5. Er is geen vaste terracotta meer naast de variabele:
   - `main.js` (rond regel 149, hero links): de vaste waarde `'#C7997E'` is vervangen door de berekende waarde van `--terracotta`;
   - `<meta name="theme-color">` in `index.html` en `kraamcadeaubox.html` (en op elke andere pagina waar de tag staat) is `#BC8565`;
   - `data-kleur="#C7997E"` is `#BC8565` in `index.html` (rond regel 195) en `kraamcadeaubox.html` (rond regel 164);
   - `scripts/vrijstaand.py`: in `HUISKLEUREN` is `"terracotta"` nu `#BC8565`.
6. Lopende tekst is 16 px (`.klein`, `.lijst-klein`, `.kern-zin`). `.label span` en `.balk .sectie-label span` hebben geen `opacity` meer. Alle kleine tekst op terracotta gebruikt `--op-kleur-klein` (inkt `#202020`). Wit op terracotta komt alleen voor bij koppen en quotes van minstens 24 px.

**Documentatie**
7. `CLAUDE.md`, ontwerpregel Kleuren: `terracotta #C7997E` wordt `terracotta #BC8565`, met de aanvulling "witte tekst alleen voor koppen en quotes vanaf 24 px; kleine tekst op terracotta in inkt". De rest van de regel blijft gelijk. Dit is een aanpassing van een regel die "niet zonder overleg" mag veranderen. Het akkoord van Carst (2 november 2026) staat in de pull request-beschrijving.
8. `docs/ontwerp/principes.md` (regel 18): het contrast van inkt op terracotta is aangepast van 6,4:1 naar 5,2:1, en wit op `#BC8565` staat erbij met 3,1:1 (alleen voor grote koppen).
9. `docs/fotolijst.md` vermeldt dat `ig-jasje-teddy.jpg` in de mobiele kaart ongeveer 1,2× vergroot wordt, en dat dit tijdelijk is tot het origineel er is (zie Bekende uitzonderingen).

**Schermafdrukken en controle**
10. `scripts/schermafdrukken.py` emuleert touch echt. De bouwer controleert eerst of `has_touch=True` alleen al zorgt dat `(hover: none)` / `(pointer: coarse)` in Chromium waar zijn. Zo niet, dan krijgt de mobiele context `is_mobile=True`. Voor tablet krijgt de context `is_mobile=True` of een andere aanpak die `pointer: coarse` geeft. Het bewijs: de `m-`- en `t-`-afdrukken van `index` en `kraamcadeaubox` tonen de kaarten en niet de hover-lijst, en de `d-`-afdrukken tonen de hover-lijst. Voor `scripts/controleer.py` geldt hetzelfde als die de mobiele weergave controleert.
11. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Ontwerprichting

1. **Portfolio en thema's op touch: veegbare kaarten (punt 1).**
   - Gebruik de media query `(hover: none), (pointer: coarse)`. Daar is de `.hoverlijst` verborgen en staat een kaartenrij `.kaarten` in de HTML, in de sectie zelf. Desktop met muis (`(hover: hover) and (pointer: fine)`) houdt de hover-lijst zoals hij is.
   - Maak de kaarten in de HTML zelf, niet met JS, met `loading="lazy"`. Dan werken ze ook zonder JS, en verborgen kaarten laden op desktop niet.
   - Volgorde op het scherm: label `002 —` → kaartenrij → pijl-link. Op de homepage is dat "Laat iets voor jou maken". Op de kraamcadeaubox-pagina komt eerst de zin "Een eigen stof of kleur is altijd bespreekbaar." en dan de pijl-link.
   - Specs van de kaartenrij:
     - `display: grid; grid-auto-flow: column; grid-auto-columns: min(72vw, 300px);`
     - `gap: 12px` (mobiel), `16px` (vanaf 761 px)
     - `overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain;` en `scrollbar-width: none`
     - de rij loopt door tot de rechter schermrand (rand aflopend): `padding-inline: var(--rand); scroll-padding-inline: var(--rand);`
     - kaart: `scroll-snap-align: start`
   - Op 390 px is een kaart dus 281 px breed en steekt de volgende kaart ongeveer 75 px in beeld. Dat inkijkje is de aanwijzing dat je kunt vegen. Er komt geen extra tekst als "veeg" bij.
   - Foto: `aspect-ratio: 4 / 5; object-fit: cover`, met een eigen `object-position` per kaart waar de snede dat vraagt. De boxfoto's zijn liggend (1100 × 825); controleer dat de doos en de naam in beeld blijven. Gebruik de `alt` uit `data-alt`.
   - Naam onder de foto: Libre Caslon Display, 22 px, regelhoogte 1,2, inkt, 12 px boven de naam.
   - De kaarten zijn geen knoppen en geen links. Bij vegen wisselt de achtergrond niet van kleur; de sectie blijft wit.
   - De rij krijgt `role="region"`, een `aria-label` ("Portfolio" of "Thema's") en `tabindex="0"`, zodat je met de pijltjestoetsen kunt scrollen. Bij minder beweging geldt `scroll-behavior: auto`.

2. **Werkwijze: altijd één zin zichtbaar (punt 4).**
   - Onder elke kop staat een nieuwe `<p class="kern-zin">`, binnen `.kern-kop`, zodat de zin bij aanwijzen met de kop meeschuift.
   - Alleen de rest van de tekst blijft het effect bij aanwijzen in `.kern-copy`, samen met de foto en de kleurwissel. Op touch en bij toetsenbordfocus staan de zin en de rest allebei zichtbaar, zoals nu.
   - De zinnen zijn letterlijk overgenomen of ingekort uit de bestaande tekst:
     - **01 Samen kiezen.** Zin: "Samen kies je wat het wordt, en in welke stof, kleur en maat." Rest bij aanwijzen: "Van babynest tot kraamcadeaubox of één gepersonaliseerd item. Ook prematuurmaten."
     - **02 Persoonlijk maken.** Zin: "Altijd met naam of eigen detail." Rest: "Borduren of belettering op kleding, of siliconen items zoals een bijtring, speenkoord, sleutelhanger, Maxi-Cosi-hanger of mobiel."
     - **03 Met zorg gemaakt.** Zin: "Carien maakt elk stuk met de hand in haar atelier in Ospel." Rest: "Mooi ingepakt, klaar om op te halen of te versturen."
   - De zin is 16 px Source Sans 3 in inkt (zie punt 4), regelhoogte 1,6, maximaal 420 px breed.

3. **Vast sectieritme, geen lege schermen (punt 5).**
   - Zet één variabele in `:root`: `--ritme: clamp(56px, 7vw, 104px)`.
   - `.sectie` krijgt `padding-top: var(--ritme)` en `padding-bottom: calc(var(--ritme) / 2)`. De afstand tussen het laatste element van een sectie en het label van de volgende is dan ongeveer 151 px op 1440, en 84 px op 768 en op 390. Dat valt binnen de principes.
   - **Uitgelicht → werkwijze:**
     - `.uitgelicht` krijgt `padding-bottom: calc(var(--ritme) / 2)` en de `min-height` vervalt;
     - `.kern-label` staat op `top: var(--ritme)`;
     - `.kern-kolommen` krijgt `min-height: clamp(560px, 48vw, 720px)` in plaats van `max(100vh, 60vw)`. De hover-foto vult de kolom dan nog steeds.
   - **Instagram → contact:** dit lost het ritme vanzelf op. Controleer dat er geen extra marge in `.insta` of `#contact` blijft hangen.

4. **Leesbaarheid op terracotta (punt 2).**
   - De terracotta wordt overal `#BC8565`; zie het advies hieronder.
   - Wit op terracotta alleen voor grote koppen en quotes vanaf 24 px: `.kop-xl`, `.kop-l`, `.kop-m`, `.quote`, de hero-h1, plus het logo, de burger en de lijnen (geen tekst).
   - Alle kleine tekst op terracotta wordt inkt `#202020` (5,2:1 op `#BC8565`): `.klein`, `.caps`, `.lijst-klein`, `.label`, `.pijl`, `.nr`, `.menu`, `.balk .sectie-label`, de formulierlabels en `.melding`, en de tekst in de badge. Maak hiervoor een variabele `--op-kleur-klein: var(--inkt)`.
   - Maten:
     - `.klein` en `.lijst-klein` worden 16 px, regelhoogte 1,7, `max-width: 420px` (op mobiel `none`, zoals nu);
     - `.uitgelicht-tekst .caps` wordt 14 px.
   - `.label span` en `.balk .sectie-label span` verliezen hun `opacity: .6` en worden volledig dekkend. Het nummer onderscheidt zich alleen nog door de vorm "001 —".

5. **Personaliseren: de wachtende dia volledig uit beeld (punt 6).**
   - De draai-animatie blijft zoals hij is.
   - Wachtende en vertrokken dia's krijgen `visibility: hidden`. Een dia wordt pas `visible` op het moment dat hij `.aan` wordt, en blijft dat tijdens het vertrek. Gebruik `transition: transform 1s …, visibility 0s linear 1s`, en `0s` bij `.aan`.
   - Zo valt ook de schaduw (`box-shadow 0 30px 60px`) niet meer aan de rechterrand in beeld.
   - Bij minder beweging wisselen de dia's direct.

## Ontwerpcriteria (toetsbaar)

1. Op 390 en 768 (touch) staat bij `#portfolio` en `#themas` binnen één scherm na het label minstens één complete foto in 4:5 met de naam eronder, zonder tikken. Op 390 steekt de volgende kaart 60–90 px in beeld.
2. Vegen klikt per kaart vast op de linkerrand (`scroll-snap`). `document.documentElement.scrollWidth` is gelijk aan de schermbreedte op 390 en 768: geen horizontaal scrollen van de pagina.
3. Op 1440 met muis werken de hover-lijst, de foto's en de kleurwissel ongewijzigd, en zijn er geen kaarten zichtbaar.
4. Op 1440 staat onder elke werkwijzekop zonder aanwijzen één zin van 16 px, letterlijk zoals hierboven. Bij aanwijzen verschijnen de rest van de tekst, de foto en de kleur. Met Tab is de rest van de tekst ook te zien.
5. Geen scherm bevat een leeg vlak van meer dan 40% van de schermhoogte. Het gaat met name om `d-index-02` (uitgelicht → werkwijze) en `d-index-09` (Instagram → contact).
6. De afstand van het laatste element van een sectie tot het label van de volgende sectie is 96–160 px op 1440 en 56–96 px op 390. Dit wordt gemeten in de schermafdrukken.
7. In rust staat geen enkel pixel van een niet-actieve dia, ook de schaduw niet, binnen het scherm (`d-index-06`, `-07` en de tablet- en mobiele tegenhangers).
8. Alle lopende tekst (`.klein`, `.lijst-klein`, `.kern-zin`) is minstens 16 px op elk scherm, met hoogstens 75 tekens per regel.
9. Contrast:
   - kleine tekst op terracotta is inkt, minstens 4,5:1;
   - witte tekst op terracotta komt alleen voor bij koppen en quotes van minstens 24 px, minstens 3:1 op `#BC8565`;
   - er staan geen labels met transparantie meer.
10. Er is geen naad of flits tussen de hero, uitgelicht, werkwijze, de `.achtergrond`-laag en de balk. Overal is dezelfde terracotta te zien.
11. Geen enkele foto in de kaarten is meer vergroot dan haar eigen grootte, behalve de bekende uitzondering bij aandachtspunt c hieronder.
12. Na een tik op 'Stel je box samen' of een andere #contact-link, ook bij minder beweging, kleurt de laag op 1440, 768 en 390 naar de kleur van #contact en toont de balk '004 — Contact' (kraamcadeaubox) of '006 — Contact' (index).

## Bekende uitzonderingen
Hierop keuren de controleur en de ontwerpgate niet af.
- **Hero rechts is olijf (aandachtspunt a).** Op desktop kleurt de hero rechts bij aanwijzen naar olijf `#B4B19A` (`main.js`, rond regel 149). De witte h1 haalt daarop maar 2,2:1. Het is een tijdelijke stand bij aanwijzen en valt buiten deze wijziging. Alleen de terracotta-waarde in diezelfde regel verandert (criterium 5).
- **`ig-jasje-teddy.jpg` vergroot (aandachtspunt c, ontwerpcriterium 11).** Het bestand is 316 × 300 en wordt in de mobiele kaart (ongeveer 281 × 351) ongeveer 1,2× vergroot. Dat accepteren we tijdelijk, tot het origineel er is. De melding staat in `docs/fotolijst.md` (criterium 9). `ig-babynest.jpg` (324 × 436) is net groot genoeg en geldt niet als uitzondering.
- **Werkwijze → portfolio op 1440 is in rust 275 px (ontwerpcriterium 6).** Door de voorgeschreven `min-height` van de werkwijze is de afstand tot het label van portfolio in rust 275 px (met aanwijstekst 111 px). De ontwerpgate (ronde 1) accepteert dit; het lege vlak is ongeveer 31% van de schermhoogte, onder de grens van 40% (criterium 5).

## Bestanden
- `public/assets/css/style.css` (variabelen `--terracotta`, `--op-kleur-klein`, `--ritme`; kaarten, werkwijze, labels, ritme, dia's)
- `public/assets/js/main.js` (hero-kleur rond regel 149; zo nodig de dia's en de werkwijze)
- `public/index.html` (`#portfolio`-kaarten, `.kern-zin`, `theme-color`, `data-kleur`)
- `public/kraamcadeaubox.html` (`#themas`-kaarten, `theme-color`, `data-kleur`)
- `scripts/schermafdrukken.py` (touch-emulatie), zo nodig `scripts/controleer.py`
- `scripts/vrijstaand.py` (`HUISKLEUREN["terracotta"]`)
- `CLAUDE.md` (ontwerpregel Kleuren), `docs/ontwerp/principes.md` (contrastwaarden), `docs/fotolijst.md` (uitzondering `ig-jasje-teddy`)

## Buiten scope
- Een nieuwe introductieregel en een WhatsApp-knop in de hero (review punt 3). Daarvoor wachten we op Carien.
- Alle P2-punten (review 7 t/m 13) en P3-punten.
- Het contrast van de witte h1 op olijf in de hero (zie Bekende uitzonderingen).
- Nieuwe of grotere foto's. De hoverkleuren (perzik, oker, salie, mauve, olijf) blijven zoals ze zijn.
- Het formulier, `src/`, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/`.

## Open vragen
Geen blokkerende vragen: Carst heeft de scope en de kleur goedgekeurd. Ter info voor de bouwer:
- Zijn er bestaande productfoto's gemaakt met `vrijstaand.py` op een terracotta achtergrond (`#C7997E`)? Dan wijken die licht af van de nieuwe tint. Meld dit, maar maak ze niet opnieuw zonder overleg.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | brief opgesteld; ontwerprichting en ontwerpcriteria letterlijk overgenomen van website-ontwerper |
| Bouwen | website-bouwer | Gebouwd op `wijziging/ontwerp-a-leesbaarheid`. Kaarten `.kaarten` in de HTML van `#portfolio` en `#themas` (9 + 9, `loading="lazy"`, foto, `alt` en naam letterlijk uit de hover-lijst, `role="region"`, `aria-label`, `tabindex="0"`); zichtbaar bij `(hover: none), (pointer: coarse)`, hover-lijst daar verborgen. Werkwijze: `.kern-zin` letterlijk volgens de ontwerprichting, rest in `.kern-copy`; bij aanwijzen wordt de tekst in de geopende kolom (en het label boven kolom 1) wit, omdat hij dan op de donkere foto staat. `--ritme`, `--op-kleur-klein`, `--terracotta: #BC8565`; `.op-kleur` is standaard inkt, wit alleen voor `.kop-xl/-l/-m`, `.quote`, `.prijs` en de lopende tekst (allemaal ≥ 24 px). Dia's met `visibility`; bij minder beweging nu echt direct (de oude regel werd overschreven door `.js .dia`). `.kern-kolom` heeft bovenin ruimte voor het label (anders viel het label op tablet over "01") en staat op touch bovenaan uitgelijnd. Touch-emulatie: `has_touch=True` geeft in Chromium al `(hover: none)` en `(pointer: coarse)`; `is_mobile=True` toegevoegd voor m en t in `schermafdrukken.py` en voor mobiel in `controleer.py` (die controleert op touch nu de kaarten in plaats van de hover-lijst). Metingen: scrollWidth 390/768/1440; kaart 281 px op 390, inkijk 75 px; snap op 293 px; tekst min. 16 px, max. 58 tekens per regel; geen witte tekst < 24 px op terracotta; labels zonder transparantie; afstand tot het volgende label 151 px (1440) en 84 px (390), behalve werkwijze → portfolio op 1440 (zie open punt). `npm test` 6/6, `controleer.py` geen fouten. Open: werkwijze → portfolio op 1440 is in rust 275 px (met aanwijstekst 111 px) door de voorgeschreven `min-height`; geen pijl-link onder de thema's toegevoegd, omdat de pijl-link "Stel je box samen" van de statement er direct op volgt. Geen vrijstaande foto's op terracotta gevonden. |
| Controleren | website-controleur | Ronde 1: AKKOORD. |
| Ontwerpgate | website-ontwerper | Ronde 1: ONTWERP NIET AKKOORD. Eén verplicht punt: na springen naar de onderkant of naar `#contact` (End, anker "Stel je box samen", vooral bij minder beweging) bleef de `.achtergrond`-laag grijsblauw of wit onder de witte contactkop, en toonde de balk nog het vorige label ("003 — Zo werkt het"). Oorzaak: de lijn op 88% valt dan in de footer en de balklijn op 90 px wordt onderaan nooit bereikt. Toegevoegd als ontwerpcriterium 12. |
| Bouwen (ronde 2) | website-bouwer | `main.js`: de laag kiest de laatste sectie waarvan de bovenkant boven de lijn op 88% ligt (zonder voorwaarde op de onderkant); de balk toont onderaan de pagina (`scrollY + innerHeight >= scrollHeight - 2`) het label van de laatste `[data-label]`. Halverwege de pagina verandert er niets zichtbaars: alleen achter de ondoorzichtige statement kan de laag nu eerder wisselen. `controleer.py`: nieuwe controle voor ontwerpcriterium 12 (minder beweging, #contact-link en End, beide pagina's, 1440/768/390). |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
