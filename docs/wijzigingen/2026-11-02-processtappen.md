# Processtappen: "003 — Zo werkt het" als één doorlopend proces

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst
- **Risico:** laag — alleen opmaak, markup en animatie van één sectie op `kraamcadeaubox.html`, plus een extra controle in `scripts/controleer.py`. Raakt het formulier, de doorverwijzingen, `wrangler.jsonc` en `.github/workflows/` niet.

## Doel
In "003 — Zo werkt het" op de kraamcadeaubox-pagina zien bezoekers nu drie losse stappen. Na de wijziging zien ze één proces: drie genummerde stappen achter elkaar, met een lijn en een pijl die de volgorde laten zien.

Wens van Carst: "Dit is een process flow… nu lijken het een beetje losse stappen. Kunnen we dat iets meer naar een proces modelleren?"

## Acceptatiecriteria
1. Alle 12 ontwerpcriteria hieronder (sectie "Ontwerpcriteria (toetsbaar)") worden gehaald.
2. De teksten blijven ongewijzigd: het label `003 — Zo werkt het`, de `data-label`, de drie koppen (inclusief `<br>`) en de drie alinea's zijn letterlijk gelijk aan de huidige versie (`public/kraamcadeaubox.html` r. 233–248). Er komt geen nieuwe zichtbare tekst bij.
3. `.kolommen` en `.kolom` zijn helemaal weg uit `public/` (HTML, `assets/css/style.css` en `assets/js/main.js`, inclusief de selector `main .kolom .nr, main .kolom .klein` in `main.js`). `.kern-kolommen`, `.kern-kolom` en `.menu-kolom` blijven ongewijzigd.
4. `scripts/controleer.py` krijgt een nieuwe controle voor `kraamcadeaubox.html`. Die faalt als:
   - sectie 003 niet precies één `<ol>` met precies drie `<li>` heeft;
   - de koppen van de drie stappen niet exact "Neem contact op", "Kies samen thema en maat" en "Carien gaat aan de slag" zijn (tekstinhoud, `<br>` als spatie of regelovergang);
   - de pagina horizontaal scrollt (`document.documentElement.scrollWidth` groter dan de vensterbreedte), in elk geval op 390 px.
5. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Ontwerprichting

1. **Eén genummerde reeks in plaats van drie losse kolommen.**
   - Vervang `.kolommen` en `.kolom` door `<ol class="stappen" role="list">` met drie keer `<li class="stap">`.
   - Per stap blijven `h2.kop-m` (met de bestaande `<br>`) en `p.klein` staan, met precies dezelfde tekst.
   - Het nummer komt in een rondje (`.stap-nr`, "01", "02", "03") met `aria-hidden="true"`. De lijst zelf geeft de volgorde al door aan schermlezers.
   - Zet `list-style: none`. `role="list"` zorgt dat Safari/VoiceOver het toch als lijst blijft voorlezen.
   - Haal de verspringing via `nth-child(2n)` weg. Alle stappen staan op één lijn: zo leest het als één reeks.
   - Label `003 — Zo werkt het` en `data-label` blijven zoals ze zijn.

2. **Lijn en rondjes, overal in inkt (`var(--inkt)` / `currentColor`).**
   - Rondje: 1 px rand in inkt, zonder vulling, cijfers in Libre Caslon Text 16 px. Formaat: 48 px op 1440, 44 px op 768, 40 px op 390.
   - De lijn loopt **niet door** de rondjes heen. Het zijn losse stukken lijn van 1 px in inkt, met 12 px lucht aan beide kanten van een rondje. Zo hoeft een rondje geen vulling te hebben die bij de wisselende achtergrond past.
   - Elk stuk lijn eindigt in een klein pijlpuntje in de looprichting, met dezelfde vorm als de pijl in `.pijl` (`M22 1l4 4-4 4`, ongeveer 8 × 8 px, 1,2 px dik). Dat geeft de richting van het proces aan.
   - Na 03 komt geen lijn meer: daar is het proces klaar.
   - Lijn en pijlen zijn decoratief: pseudo-elementen of een `svg` met `aria-hidden="true"`.
   - Geen extra kleuren, geen pastel, geen vlakken of knoppen. Ik raad ook af om één rondje te vullen als "voortgang": dat leest als een status ("deze stap is klaar") en klopt dan niet.

3. **Desktop (1440, en alles vanaf 1025 px): horizontaal.**
   - Raster van drie gelijke kolommen, `column-gap: clamp(32px, 4vw, 64px)`.
   - Per stap van boven naar beneden: rondje, 32 px ruimte, kop, 24 px ruimte, tekst.
   - De lijnstukken staan op de hoogte van het midden van de rondjes en lopen van rondje 01 naar 02 en van 02 naar 03. Dat is ongeveer 320 px per stuk op 1440.
   - Alle rondjes en alle koppen staan op exact dezelfde hoogte.
   - De `max-width: 420px` van `.klein` blijft, dus de regels blijven onder de 75 tekens.
   - Wat de bezoeker eerst ziet: de rij van drie rondjes met lijn ("dit is een proces"). Daarna de koppen, daarna de uitleg.

4. **Tablet (768) en mobiel (390, alles tot en met 1024 px): verticaal, met de lijn links.**
   - Twee kolommen: links het rondje (44 px op 768, 40 px op 390), rechts kop en tekst.
   - Ruimte tussen rondje en tekst: 32 px op 768, 20 px op 390.
   - Het rondje staat midden op de eerste regel van de kop.
   - De lijn loopt verticaal door het midden van de rondjes, van onder rondje 01 tot boven rondje 02, en van 02 naar 03. Er zit 12 px lucht rond elk rondje en elk stuk eindigt in een pijlpuntje omlaag.
   - Ruimte tussen de stappen: 56 px op 768, 48 px op 390.
   - Kop `.kop-m` op 34 px (het bestaande minimum), lopende tekst 16 px.
   - Op 768 is de tekstkolom ongeveer 560 px, en `.klein` blijft `max-width: 420px` (op ≤760 px: `none`). Op 390 is de tekstkolom ongeveer 286 px.
   - De rondjes zijn geen links: geen aanwijzer-cursor, geen hover en geen eis voor tikdoelen.

5. **Beweging: alleen een extra laag, nooit een voorwaarde.**
   - Zonder JS staat alles er al, inclusief alle lijnen.
   - Met JS (`.js`) en zonder "minder beweging" tekenen de lijnstukken zich één keer als de sectie in beeld komt. Ze groeien met `transform: scaleX(0→1)` (verticaal `scaleY`) vanaf het beginpunt, in 0,9 s met `cubic-bezier(.2,.7,.2,1)`, dezelfde curve als `.opkomen`.
   - De volgorde is rondje 01, lijn, rondje 02, lijn, rondje 03, met telkens ongeveer 0,15 s vertraging. In totaal duurt het maximaal ongeveer 1,2 s.
   - Gebruik de bestaande IntersectionObserver in `main.js` en geen nieuwe. **Let op:** de selector daar bevat nu `main .kolom .nr, main .kolom .klein`. Vervang die door de nieuwe klassen, anders verdwijnt het opkomen in deze sectie.
   - Bij `prefers-reduced-motion: reduce` is er geen animatie en staan de lijnen er meteen helemaal.

6. **Opruimen en niet aanraken.**
   - `.kolommen` en `.kolom` worden alleen in `kraamcadeaubox.html` gebruikt (gecontroleerd in `public/*.html`). Na de wijziging moeten deze regels weg: `style.css` r. 87–90 en 208–209, plus de selector in `main.js` r. 364.
   - `index.html` "001 — De werkwijze" met `.kern-kolommen` / `.kern-kolom` blijft ongewijzigd.

## Ontwerpcriteria (toetsbaar)

1. In `public/kraamcadeaubox.html` staat sectie 003 als één `<ol>` met precies drie `<li>`. `grep -rn "kolommen\|\"kolom\"\|\.kolom\b" public/` levert alleen nog `kern-kolom`-treffers op.
2. De zichtbare tekst van de drie koppen en de drie alinea's is letterlijk gelijk aan de huidige versie, inclusief de `<br>` in de koppen. Er is geen nieuwe tekst bij gekomen.
3. **1440:** de drie rondjes staan op dezelfde hoogte (verschil ≤ 1 px) en de drie koppen beginnen op dezelfde hoogte. Er is geen verspringing tussen de kolommen meer.
4. **1440:** tussen 01→02 en 02→03 loopt een ononderbroken lijn van 1 px in inkt, met een pijlpuntje naar rechts.
   - Na 03 staat geen lijn.
   - Geen lijn kruist een rondje of tekst.
   - Rondjes zijn 48 px.
5. **768 en 390:** de stappen staan onder elkaar, met de rondjes links en een verticale lijn met pijlpuntjes omlaag tussen 01→02 en 02→03.
   - Op 768 heeft geen enkele regel lopende tekst minder dan ongeveer 45 of meer dan 75 tekens.
   - Op 768 en op 390 breekt geen kop af op meer dan twee regels.
6. **390:** er is geen horizontaal scrollen (`document.documentElement.scrollWidth === 390`). Lopende tekst is ≥ 16 px, koppen ≥ 34 px. Rondje 01 en de kop van stap 01 staan samen in beeld zodra het label `003 — Zo werkt het` bovenaan het scherm staat.
7. Alle tekst, lijnen en rondjes in 003 zijn inkt. Dat geldt zowel op grijsblauw als op terracotta (de stand tijdens de overgang naar 004, zie `d-kraamcadeaubox-06`). Nergens staat witte tekst kleiner dan 24 px.
8. Lijnen en pijlpuntjes zijn pseudo-elementen of `aria-hidden="true"`. De nummers in de rondjes zijn `aria-hidden="true"`. Een schermlezer meldt "lijst, 3 items" en leest elk nummer maar één keer voor.
9. Met JS uitgeschakeld en met "minder beweging" aan staan alle lijnen en rondjes er direct en helemaal, zonder animatie of opacity 0.
10. Met JS en beweging tekenen de lijnen zich één keer, in de volgorde 01→02→03, in maximaal ongeveer 1,2 s. Daarna blijven ze staan. Het opkomen van de koppen en tekst in 003 werkt nog net zo als bij de andere secties.
11. Het ritme tussen 002, 003 en 004 blijft binnen de afspraak: 96–160 px op desktop, 56–96 px op mobiel. Er ontstaat geen nieuw leeg scherm (vergelijk `d-/t-/m-kraamcadeaubox`).
12. De homepage (`d-/t-/m-index`) en "001 — De werkwijze" zien er hetzelfde uit als vóór de wijziging.

## Bestanden
- `public/kraamcadeaubox.html` (sectie 003, r. 230–252)
- `public/assets/css/style.css` (r. 85–90 en 208–209 weg; nieuwe regels voor `.stappen`, `.stap`, `.stap-nr`; breekpunt 1024/1025 px)
- `public/assets/js/main.js` (selector in de IntersectionObserver, r. 360–368)
- `scripts/controleer.py` (nieuwe controle voor sectie 003)

## Buiten scope
- Teksten van sectie 003 aanpassen (ook niet "Binnen ongeveer 7 werkdagen").
- Andere secties van `kraamcadeaubox.html` en alles op `index.html`, inclusief "001 — De werkwijze" (`.kern-kolommen` / `.kern-kolom`).
- Nieuwe kleuren, lettertypes, iconen of foto's.
- Een "voortgang"-weergave (gevuld rondje) of klikbare stappen.
- Formulier, `_redirects`, `_headers`, `wrangler.jsonc`, `.github/workflows/`.

## Open vragen
- **Besloten:** de ontwerper wijkt af van een horizontale tijdlijn op tablet. Op tablet (768, tot en met 1024 px) staat de reeks **verticaal**; horizontaal pas vanaf 1025 px (het bestaande breekpunt in `style.css`). Reden: leesbaarheid. Drie kolommen op 768 px geven ongeveer 24 tekens per regel, terwijl `docs/ontwerp/principes.md` 45–75 tekens per regel vraagt; koppen op 34 px zouden op drie regels afbreken.
- Signaal van de ontwerper (geen vraag, wel opletten): de sectie heeft `op-grijs`, maar door de vaste achtergrondlaag staat 003 tijdens de overgang naar 004 al op terracotta (`d-kraamcadeaubox-06`). Daarom alles in inkt, niet in wit (ontwerpcriterium 7).
- Geen verdere open vragen: er komt geen nieuwe tekst, foto of prijs bij.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief klaar, 2026-11-02 |
| Bouwen | website-bouwer | Klaar, 2026-11-02, branch `wijziging/processtappen`. Sectie 003 is een `<ol class="stappen">` met drie `.stap`; rondjes, lijnstukken en pijlpuntjes in inkt (pseudo-elementen); horizontaal vanaf 1025 px, verticaal tot en met 1024 px; tekenen één keer via de bestaande IntersectionObserver (`.teken`/`.in-beeld`), klaar na ca. 1,2 s. `.kolommen`/`.kolom` weg. Nieuwe controle `controleer_stappen` in `scripts/controleer.py`; `.stappen` ook in eindstand gezet in de screenshotscripts. Gemeten: rondjes en koppen op 1440 op gelijke hoogte (verschil 0 px), 12 px lucht rond elk rondje, scrollWidth 1440/768/390 = vensterbreedte, alles `rgb(32,32,32)`. Ritme 002/003/004 gelijk aan vóór de wijziging. `npm test` 6/6 en `controleer.py` zonder fouten. Let op: op 768 staat "wordt." alleen op de laatste regel van alinea 01. |
| Controleren | website-controleur | Ronde 1: NIET AKKOORD, 2026-11-02. Eén must-fix: de scroll-controle in `controleer_stappen` vergeleek `scrollWidth` met `innerWidth`; bij `is_mobile` groeit `innerWidth` mee met te brede inhoud, dus 768 en 390 sloegen nooit aan. |
| Bouwen (ronde 2) | website-bouwer | Klaar, 2026-11-02. `controleer_stappen` vergelijkt `scrollWidth` nu met de ingestelde vensterbreedte. Tegentest met een te breed element in `.stappen`: gevonden op 1440 (1859 > 1440), 768 (1039 > 768) en 390 (983 > 390). Op de schone code: `npm test` 6/6 en `controleer.py` zonder fouten. |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | [mens] | |
| Live gezet (merge) | [mens] | |
