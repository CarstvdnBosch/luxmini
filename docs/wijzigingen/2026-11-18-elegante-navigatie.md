# Elegantere navigatie: pijlknoppen, woorden in plaats van nummers, pijl-link met kader

- **Datum:** 2026-11-18
- **Aangevraagd door:** Carst (chat, 18 nov. 08:43)
- **Issue:** nog geen nummer bekend (zie Open vragen). Dekt ook **Story 5 (kader om de pijl-link)** af, die als "los te regelen" staat in `2026-11-14-homepage-mobiel-stock.md` (vraag 6, scope en criterium bij 002) en `2026-11-15-homepage-mobiel-tweetraps.md` (vraag 11, buiten scope, optie 1c).
- **Risico:** **midden**. De wijziging raakt alle openbare pagina's (sectielabels en `data-label`), de gedeelde `.pijl` op tientallen plekken, `main.js` (lookbook, balk) en ongeveer 12 testbestanden plus `scripts/controleer.py`. Kans op visuele en structurele regressie is groot. Formulier, doorverwijzingen, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt (dus niet hoog). Ook de visuele basisschermen (`tests/e2e/basis/`) moeten opnieuw worden gemaakt.

## Wens (letterlijk, met tikfouten)
> "op de mobile worden nu deze knoppen gebruikt: 01 02 3 04 Dat vind ik niet mooi. Ik wil knoppen met elegante pijltjes van links naar rechts op de site. ik vind het gebruik van cijfers overal niet netjes, en het is niet erg elegant in de navigatie. Dat mag iets eleganter. als laatste de navigatie knoppen die zijn op dutch design netter op mobiel en niet mobile. op niet mobile zit ook een mooie animatie. Wellicht toevoegen."

Besluit Carst (keuzevraag, 18 nov.): de cijfers worden vervangen door **alleen het woord** in kleine kapitalen, overal en ook in de vaste balk. Er komen geen nummers meer. Dit is het overleg dat nodig is om de ontwerpregel "Secties genummerd: `001 —` …" in `CLAUDE.md` te wijzigen.

Schermafdrukken (scratchpad, niet in de repo):
1. `1-tabjes.png`: homepage, Handwerk op mobiel. Onder het lookbook staan de tabjes "01 02 03 04" op perzik, en het actieve tabje is onderstreept.
2. `2-label.png`: de vaste balk met "001 — Producten" op perzik.
3. `3-lux-pijl.png`: LUX-pijl-link "→ Bekijk de kraamcadeauboxen", wit op een donkere foto, zonder kader.
4. `4-stock-pijl.png`: Stock-pijl-link "→ Lees verder" op terracotta. De pijl staat links **buiten** een dun kader van 1 px (lichte, half doorzichtige lijn) dat alleen om de tekst loopt. De tekst is wit en vet.

## Doel
Navigatie en links voelen rustiger en eleganter. Bladeren gaat met verfijnde pijlknoppen in plaats van cijfertabjes, secties heten alleen nog hun naam en een pijl-link ziet eruit zoals bij Stock: een dun kader met de pijl ervoor. Met een muis krijgt de pijl-link een rustige animatie.

## Inventaris (grep, 18 nov.)

**B1. Sectielabels `00n —` in `public/`** (90 keer in 12 bestanden): `index.html` (8), `werkwijze.html` (8), `kraamcadeauboxen.html` (10), `prematuurkleding.html` (10), `babynest.html` (12), `inspiratie.html` (10), de vier `inspiratie-*.html` (elk 6), `contact.html` (4), `assets/css/style.css` (4, alleen in commentaar). Het gaat steeds om het zichtbare `<p class="label"><span>00n —</span> Naam</p>` en om `data-label="<span>00n —</span> Naam"`. Dat laatste komt 43 keer voor in 11 bestanden.

**B2. Andere cijfers die bezoekers zien:**
- `index.html` r. 281: lookbook-tabjes `01`–`04` (`.lookbook-tabs`, `role="tablist"`). Dit is deel A.
- `index.html` r. 187/198/208: `.nr` 01/02/03 in de drieluikkolommen (Producten). Op mobiel staat in stap 1 "alleen nummer en kop".
- `werkwijze.html` r. 160–162: `.hoe-tab` met `<span class="nr">01</span>` … in "Hoe ik werk".
- `kraamcadeauboxen.html` r. 277/282/287 (en dezelfde reeks op Prematuurkleding en Babynest): `.stap-nr` 01/02/03 in "Zo werkt het" (`aria-hidden`; `main.js` r. 1332 tekent 01 → 02 → 03).
- Geen cijfers in: de menu-subitems (alleen woorden), de prijskaarten (bedragen blijven), de thema's, de hero-tabjes "Het atelier · Het cadeau" (woorden, blijven zo) en `.tablet-puntjes` op Babynest (puntjes, `aria-hidden`).
- Labels zonder nummer maar met een streepje vooraan: "— LUX mini", "— Kraamcadeauboxen", "— Met naam", "— Inspiratie", "— Het atelier" (zie Open vragen).

**B3. Tests en scripts die nummers verwachten** (66 treffers in 12 bestanden): `scripts/controleer.py` (33), `tests/e2e/kernpaden.spec.js` (balklabels homepage en Kraamcadeauboxen), `homepage-mobiel.spec.js` (balk "001 — Producten", tabjes `'01 Belettering'` …, "tab 03", "tab 04"), `homepage-mobiel-tweetraps.spec.js` (7), `homepage-zoals-stock.spec.js` ("002 — Stuur een bericht", "001 — Producten", "002 — Handwerk"), `babynest-media.spec.js` (SECTIES), `prematuur-fotos.spec.js`, `inspiratie-projecten.spec.js` (`00${i + 1} — …`, "001 — Foto's" …), `werkwijze-boekje.spec.js` (tekstinhoud "001 — Het atelier …"), `contact-ruimte-en-kleur.spec.js` (meet de letters van "002 —"), `raster-kraamcadeauboxen.spec.js` (linkerkant van het label "002 —"), `mobiel-ontwerp.spec.js` (label "003 — Inspiratie", commentaar "001 —"). `vooraf-betalen.spec.js` noemt stap 01/02/03 alleen in commentaar en testnamen.

**B4. `CLAUDE.md` (worktree), regels om bij te werken:**
- r. 73: "Secties genummerd: `001 —`, `002 —` enzovoort, klein in serif." Wordt de nieuwe regel (zie criterium 8).
- r. 78 (Inspiratie): "Balklabels kort: 001 — Kleding, 002 — Knuffels, 003 — Siliconen, 004 — Cadeauboxen."
- r. 60 (Prematuurkleding): `("002 — Prijs", brief 7 nov.; …)`.
- r. 67 (Homepage op mobiel, 002 Handwerk): "Daaronder tabjes 01–04 (tablist)".
- r. 66 (001 Producten mobiel): "alleen nummer en kop in inkt", "dan worden nummer en kop wit". Daarnaast r. 77 "nr en pijl-link 16 px" (Witte tekst) als `.nr` verdwijnt.
- r. 62/73/91: andere vermeldingen van "nummer" bekijken. Waarschijnlijk alleen r. 73 en het boekje ("geen nummer, datum …" betekent daar een tijdschriftnummer en blijft staan).
- r. 72 (Links als pijl-links): uitbreiden met het kader en de animatie (deel C).
- r. 74 (Geen zichtbare scrollbalken / `.carrousel`): het lookbook als gebruiker van de pijlknoppen noemen.
- Verwijzingen als "001 Producten", "002 Handwerk", "003 Thema's" in Mappen en Ontwerpregels zijn interne namen. Die laten we staan, of we schrijven ze om naar de naam zonder nummer (zie Open vragen). `1706` in `style.css` en `mobiel-ontwerp.spec.js` r. 113 ("Decoratieve labels ("001 —", .caps)") alleen in commentaar bijwerken.

## Acceptatiecriteria

**A. Pijlknoppen in plaats van cijfertabjes**
1. Op de homepage bij 390 × 844 staan onder het Handwerk-lookbook geen tabjes "01–04" meer. Er staan twee pijlknoppen, vorige (pijl naar links) en volgende (pijl naar rechts), in dezelfde vormtaal als `.carrousel-knop`. Elke knop heeft een tikdoel van minstens 44 × 44 px, een `aria-label` ("Vorige" / "Volgende" met de naam van het item of de sectie, volgens de ontwerprichting) en `aria-controls` naar de veegrij.
2. Een tik op volgende of vorige schuift één lookbook verder of terug. Sectie en balk volgen dan de kleur van het actieve item, net als nu. Vegen, Home en End blijven werken. Er wisselt niets vanzelf.
3. Aan begin en eind gedragen de knoppen zich zoals de ontwerprichting zegt: ofwel `aria-disabled="true"` en zichtbaar gedempt, ofwel rondlopen. Er wordt **één** van de twee gebouwd en getest.
4. De positie (1 van 4) is zonder cijfers te zien, volgens de ontwerprichting (bijvoorbeeld fijne streepjes of de naam van het actieve item), en is ook voorleesbaar (bijvoorbeeld via `aria-live="polite"` of de naam in het paneel). Een decoratieve indicatie krijgt `aria-hidden="true"`.
5. "Hoe ik werk" op Werkwijze (`.hoe-tab`) toont geen `01`/`02`/`03` meer. Het blijven tabbladen met alleen het woord (bijvoorbeeld "Samen kiezen"), tenzij de ontwerper pijlknoppen voorstelt.
6. Zonder JavaScript blijft alleen de veegrij zichtbaar, zonder knoppen, zoals nu met de tabjes. Er scrolt niets horizontaal op 360, 390 en 768 px.

**B. Alleen woorden, geen nummers**
7. In `public/` komt geen sectielabel met `00n —` meer voor, niet in de zichtbare labels en niet in `data-label`. `grep -rE '0[0-9]{2} ?(—|&mdash;)' public/*.html` geeft 0 treffers. Elk label toont alleen de naam in `.caps` (kleine kapitalen, ruime spatiëring). De vaste balk toont dat woord, op mobiel op één regel naast de burger op 360 en 390 px.
8. `.nr` in het drieluik en `.stap-nr` in "Zo werkt het" zijn behandeld volgens de ontwerprichting (weg, of vervangen door een cijferloos teken). Daarna staan er op geen enkele openbare pagina nog zichtbare volgnummers als `01`, `02` of `001`. Prijzen, maten, telefoonnummer, KvK en datums blijven uiteraard.
9. `CLAUDE.md` is bijgewerkt op alle plekken uit B4. De regel "Secties genummerd" is vervangen door een regel als: "Sectielabels: alleen de naam in kleine kapitalen (`.caps`), zonder nummer, ook in de vaste balk (besluit Carst 18 nov., brief 2026-11-18-elegante-navigatie)." Het Mappen-overzicht mag nummers houden als interne aanduiding, tenzij Carst anders beslist (Open vragen).
10. Alle tests en `scripts/controleer.py` uit B3 verwachten de nieuwe labels: alleen de woorden, of een cijferloze positie. Dit is een **gevolg van de structuurwijziging, geen versoepeling**. Elke controle blijft even streng. Metingen die nu de letters van "002 —" als ankerpunt gebruiken (contact-ruimte, raster-kraamcadeauboxen, prematuur OC5) meten voortaan de linkerkant van het label zelf, met dezelfde marge. Er komt een test bij die op alle openbare pagina's controleert dat er geen label of `data-label` met `0\d\d —` meer is.

**C. Pijl-link met kader en animatie**
11. Elke `.pijl` heeft de pijl links, **buiten** een dun kader van 1 px om de tekst (zoals `4-stock-pijl.png`). Het kader is in `currentColor` met verlaagde dekking, of in een vaste kleur volgens de ontwerprichting. Het kader is geen gevulde knop: geen achtergrondvlak in rust, geen schaduw, geen afgeronde pil (regel "geen opvallende knoppen").
12. Het tikdoel van elke `.pijl` blijft minstens 44 px hoog op touch. Op 390 px past de langste pijl-link ("Bekijk de kraamcadeauboxen", "Stuur Carien een bericht") op één regel binnen de zijmarge van 32 px, of breekt hij netjes zonder dat het kader de marge overschrijdt. Niets scrolt horizontaal.
13. Contrast: het kader haalt minstens 3:1 tegen de achtergrond (WCAG 1.4.11) op elke ondergrond waar een `.pijl` staat: wit, grijsblauw, de lichte paletkleuren, terracotta, de diepe tinten bij aanwijzen en de donkere foto's met sluier. De tekst van de pijl-link houdt de bestaande contrastregels. Witte tekst alleen waar dat nu al mag (donkere foto met sluier, diepe tint), nooit op een lichte paletkleur. Op terracotta blijft kleine tekst inkt. De axe-controle blijft groen.
14. Met een muis (`(hover: hover) and (pointer: fine)`) speelt bij aanwijzen **en** bij toetsenbordfocus een rustige animatie volgens de ontwerprichting, met in-uit `cubic-bezier(.45,0,.55,1)` of de curve die de ontwerper noemt. Op touch is er geen hover-animatie. Bij "minder beweging" verandert de toestand direct, zonder overgang.
15. De focus is zichtbaar op elke `.pijl`, op de nieuwe lookbookknoppen en op de tabbladen van "Hoe ik werk" (focusring minstens 2 px of het kader zichtbaar dikker of donkerder, met minstens 3:1). Dat geldt ook op terracotta en op een foto.
16. Op plekken waar de `.pijl` nu bewust wegvalt of vervaagt (drieluik stap 1 met opacity 0, hoverlijst `lijst-actief` op 0,2/0,35) gedraagt het kader zich hetzelfde als de tekst, zonder losse lijn die blijft staan.

**Algemeen**
17. Desktop (1440 × 900), tablet (768 × 1024) en mobiel (390 × 844 en 360 × 640): niets scrolt horizontaal, op touch zijn alle tikdoelen minstens 44 px en is alle tekst die je moet lezen of aantikken minstens 16 px op mobiel.
18. `npm run check` is groen (tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel, validatierapport). De basisschermen worden bijgewerkt via `visueel-basis.yml` of lokaal, met uitleg in de pull request.

## Ontwerprichting
*Nog leeg. De tekst komt van website-ontwerper. De planner zet hem hier zodra hij binnen is.*

Vragen aan website-ontwerper:
1. **Lookbookknoppen (A):** vorm en plek van de pijlknoppen onder of naast het lookbook op mobiel (390 px). Gelijk aan `.carrousel-knop`, of fijner (alleen een lijnpijl van 28 × 10 zoals `.pijl svg`, met een onzichtbaar tikvlak van 44 px)? Links en rechts van de indicatie, of samen rechts?
2. **Begin en eind:** `aria-disabled` met gedempte knop, of rondlopen van 4 naar 1? Eén keuze, met reden.
3. **Positie zonder cijfers:** fijne streepjes (breedte, dikte, actieve toestand), de naam van het actieve item tussen de pijlen ("Belettering"), of allebei? Hoe voorleesbaar?
4. **Rol:** blijft het een `tablist` (dan pijlknoppen als extra bediening) of wordt het een `.carrousel`-region met knoppen? Dat laatste past bij de bestaande regel "een horizontale rij is een `.carrousel`".
5. **Andere cijfertabjes en -tekens:** "Hoe ik werk" (`.hoe-tab` 01–03): alleen het woord, of ook pijlknoppen? Drieluik `.nr` (01–03): weg, of een vervangend element (bijvoorbeeld een korte lijn)? Mobiel stap 1 wordt dan "alleen de kop". "Zo werkt het" `.stap-nr` (01–03 in de rondjes die zich tekenen): weg, leeg rondje, of iets anders? Het blijft een `<ol>`.
6. **Labels zonder nummer:** hoe ziet een sectielabel eruit als het nummer weg is? Alleen het woord in `.caps`, of met een fijn streepje ervoor ("— Producten"), zoals de labels die nu al zonder nummer zijn? Lettergrootte en spatiëring in de balk op 360 px.
7. **Pijl-link (C), rust:** dikte en kleur van het kader (wit 0,4 zoals Stock op terracotta? `currentColor` 0,5?), padding (Stock oogt ongeveer 12 × 24 px), afstand pijl–kader, lettergrootte (nu 15–17 px; Stock is vet) en een eventueel gewicht. Overal hetzelfde, of een kleinere variant in dichte plekken (prijskaarten, contactlijst, pijl-rij)?
8. **Pijl-link, animatie bij aanwijzen:** in `docs/ontwerp/bron/stock-analyse-*.md` is de hover van Stocks pijl-link **niet gemeten**, en Stock is vanaf hier niet bereikbaar. Stel een passende animatie voor binnen de bewegingsregels, bijvoorbeeld: pijl schuift 6–8 px naar rechts tot tegen het kader, en/of de kaderlijn tekent zich rond, en/of het kader wordt dekkend. Geef duur, curve en wat er bij focus gebeurt.
9. **Kader op terracotta en op foto:** welke kleur haalt daar 3:1 en voelt niet als een opvallende knop? Mag de lijn wit zijn op terracotta (lijn, geen tekst)?
10. **Mobiel:** kader ook op touch (Carst: "netter op mobiel en niet mobile"), alleen zonder animatie?

## Bestanden
- `public/index.html`, `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `babynest.html`, `inspiratie.html`, `inspiratie-kleding.html`, `inspiratie-knuffels-en-babynest.html`, `inspiratie-siliconen-en-hangers.html`, `inspiratie-kraamcadeauboxen.html`, `contact.html` (labels, `data-label`, lookbook, `.nr`, `.hoe-tab`, `.stap-nr`)
- Eventueel `privacy.html`, `bedankt.html`, `404.html` (alleen als daar een `.pijl` of label staat dat aangepast moet worden)
- `public/assets/css/style.css` (`.pijl`, `.label`/balk, `.lookbook-tab*`, `.nr`, `.stap-nr`, `.hoe-tab`, commentaar)
- `public/assets/js/main.js` (§5g lookbook: knoppen, begin en eind, indicatie; balklabel; §tekenen "Zo werkt het")
- `scripts/controleer.py`, `tests/e2e/*.spec.js` uit B3, `tests/e2e/basis/` (basisschermen)
- `CLAUDE.md` (regels uit B4)
- `docs/ontwerp/principes.md` alleen als de ontwerper daar nummering noemt (ontwerper beslist)

## Buiten scope
- Hoofdnavigatie, menu over het hele scherm, burger en de linkrij met animatie naast de burger (geen cijfers, blijven ongewijzigd).
- De hero-tabjes "Het atelier · Het cadeau" (woorden, blijven).
- De pijlknoppen van bestaande `.carrousel`s (productrij, stoffen, thema's): alleen aanpassen als de ontwerper een gedeelde stijl voorstelt. Gedrag en tests van die rijen blijven gelijk.
- Formulier (`contact.html#formulier`, Worker), doorverwijzingen, `wrangler.jsonc`, workflows.
- Teksten van labels en links (alleen het nummer valt weg; geen nieuwe woorden, behalve de `aria-label`s van de knoppen).
- `public/beheer/` (eigen opmaak, laadt `style.css` niet).
- Ankers en `id`'s (bijvoorbeeld `lookbook-tab-1`, `hoe-tab-01`) mogen intern blijven, zolang ze niet zichtbaar zijn.

## Open vragen
1. **Issue (blokkerend voor de PR-tekst, niet voor het bouwen):** is er een issue of user story voor deze wens, of voor Story 5? Zonder nummer kan de pull request geen `Closes #…` bevatten. Eén story per brief: als Carst A, B en C als losse stories wil, splitsen we deze brief in drie.
2. **Ontwerprichting (blokkerend voor het bouwen):** de vragen 1–10 hierboven aan website-ontwerper. Vooral de hover-animatie (8) en het kadercontrast op terracotta en foto (9), omdat er geen meting van Stock is.
3. **Volgnummers in "Zo werkt het" (`.stap-nr`):** de wens zegt "cijfers overal niet netjes". Geldt dat ook voor een stappenreeks, waar de volgorde betekenis heeft? Voorstel: de nummers weg, de `<ol>` houdt de volgorde voor schermlezers en de rondjes blijven leeg of krijgen een fijn teken. Dit moet Carst bevestigen.
4. **Labels die al zonder nummer zijn** ("— LUX mini", "— Met naam", "— Inspiratie" …): het streepje houden, of ook weghalen, zodat alle labels er hetzelfde uitzien? Voorstel: gelijk trekken volgens wat de ontwerper bij vraag 6 kiest.
5. **CLAUDE.md, interne aanduidingen:** mogen beschrijvingen als "001 Producten" en "003 Thema's" in Mappen en Ontwerpregels blijven als interne verwijzing, of moeten ook die naar alleen de naam? Voorstel: de zichtbare-labelregels aanpassen (B4) en de interne verwijzingen laten staan, om het verschil in `CLAUDE.md` klein te houden.
6. **Testwijzigingen:** de aanpassingen in B3 volgen uit de structuur en zijn geen versoepeling. Carst ziet ze in de diff en in het validatierapport. Als een meting een ander ankerpunt krijgt (criterium 10), staat dat met reden in de pull request.
7. **Story 5:** klopt het dat deze brief Story 5 (kader om de pijl-link) helemaal afdekt, ook buiten de homepage? Dan kan die story na de merge dicht.

### Antwoord website-ontwerper (rol 1, 18 nov.; gemeten op eigen poort, Chromium touch 360/390 px)
Proefbeeld: `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/proef/proef-pijl-en-lookbook.png`.
Aanvulling inventaris B2: `.hoe-nr` ("01"–"03" in de koppen van Hoe ik werk, `werkwijze.html` r. 166/171/176) gaat ook weg. B4: de CLAUDE.md-regel "labels in Libre Caslon Text" wordt `.caps` in Source Sans 3.

1. **Sectielabels: alleen het woord.** Elk `.label` en `data-label` toont alleen de naam, zonder nummer en zonder streepje ("— LUX mini" → "LUX mini"). Opmaak `.caps`: Source Sans 3, 600, hoofdletters; in de pagina 14 px / 0,64em, ≤ 760 px 13 px / 0,4em. Balk: 14 px / 0,2em vanaf 761 px, 13 px / 0,1em ≤ 760 px; `.balk .links` gat op mobiel 16 → 12 px. Labels inkt (op terracotta 5,2:1).
2. **Pijl-link (`.pijl`): pijl steekt door een dun kader** (opbouw Stock). HTML gelijk; kader is een pseudo-element.
   - Maten: link ≥ 48 px hoog; pijl 28 × 10 px vanaf de linkerrand van de inhoud; kader begint 14 px verder (midden van de pijl); 12 px tussen pijl en tekst; binnen het kader links 26 px, rechts 24 px (breedte = tekst + 64 px).
   - Lijn 1 px boven, rechts en onder; links alleen twee stompjes van 10 px (boven en onder), opening van 28 px in het midden waar de pijl doorloopt.
   - Kleur `currentColor`, dekking 0,72 bij inkt, 1 bij witte tekst (alleen op donkere foto). Nooit gevuld, geen schaduw, geen ronde hoeken.
   - Tekst Libre Caslon Text 400, overal 16 px (varianten 15/17 px vervallen). Geen nieuw lettertypebestand.
   - Overal hetzelfde (prijskaarten, contactlijst, footer). Onder elkaar (`.pijl-rij` mobiel, `.contact-lijst`, `.gegevens`) 12 px tussen de kaders.
   - Op touch staat het kader er ook, zonder animatie.
3. **Aanwijzen en focus (alleen `(hover: hover) and (pointer: fine)`, bij hover en `:focus-visible`):** 0,6 s in en uit, `cubic-bezier(.45,0,.55,1)`: pijl `translateX(6px)`; stompjes 10 → 17 px (kader sluit rond de pijl, 2 px lucht); lijn naar dekking 1. De tekst staat stil. Focus: idem plus lijn 2 px naar binnen; algemene `outline` vervalt op `.pijl` (volle `currentColor` ≥ 3:1). Minder beweging: pijl schuift niet, lijn/stompjes direct. Vervagende pijl-links (drieluik stap 1, `lijst-actief`): kader vervaagt mee als kind van de link. Bij `#technieken` vult het diepe vlak precies het kader (vanaf 14 px). Techniek: `@property --stomp` (`<length>`) of twee lijnstukjes met `scaleY`.
4. **Lookbook (Handwerk, mobiel): pijlknoppen met streepjes.** Tablist wordt een `.carrousel`: rij `role="region"`, `aria-label="Handwerk"`, `tabindex="0"`, Home/End; niet-actieve panelen inert.
   - Rij onder het lookbook, gecentreerd op de plek van de tabjes: Vorige · 20 px · streepjes · 20 px · Volgende; 232 × 44 px (pijl-link eronder verschuift niet).
   - Knoppen `.carrousel-knop`: rond 44 × 44, rand 1 px inkt, pijl 20 × 10; ook op touch (uitzondering op "alleen muis", ze vervangen de tabjes). `aria-label` "Vorig handwerk"/"Volgend handwerk", `aria-controls="lookbook-rij"`.
   - Begin/eind: `aria-disabled="true"` en dekking 0,3; niet rondlopen.
   - Positie: vier streepjes 1 px dik, 16 px breed, 8 px tussenruimte, inkt 0,4; actief 32 px op dekking 1; overgang 0,5 s `cubic-bezier(.45,0,.55,1)`, minder beweging direct; `aria-hidden`, niet tikbaar.
   - Voorleesbaar: `.sr-only` met `aria-live="polite"`, bijv. "Siliconen items, 2 van 4" (cijfers alleen voorgelezen).
   - Vegen blijft; sectie en balk volgen de kleur van het actieve item; zonder JS alleen de veegrij.
   - P2: met een muis schuift de pijl in elke `.carrousel-knop` 4 px in zijn richting (0,5 s); niet bij `aria-disabled` of minder beweging.
5. **Overige cijfers weg:** "Hoe ik werk" blijft tabbladen met alleen het woord (actief lijntje 24 px blijft); `.hoe-nr` weg. Drieluik `.nr` weg; op mobiel begint de kop in stap 1 op 72 px. "Zo werkt het" `.stap-nr`: rondje blijft (tekent zich in), cijfer wordt een punt van 5 px in `currentColor` (`aria-hidden`); `<ol>` blijft; lijnen en pijlpunten blijven.
6. **Volgorde:** label (woord) → kop en zin → pijl-link met kader als herkenbaar actiepunt, geen opvallende knop. Mobiel één kolom binnen 32 px marge.

**Ontwerpcriteria**
- **O1** 360 en 390 px: elk balklabel op één regel, ≥ 12 px tot het tikvlak van de burger (getoetst met "Wat er in de box kan", "Stuur een bericht", "Kraamcadeauboxen", "Prematuurkleding", "Contactgegevens"; gemeten 13 / 38 px).
- **O2** Sectielabels en balk: Source Sans 3, 600, hoofdletters, ≥ 13 px, spatiëring ≥ 0,1em.
- **O3** Elke zichtbare `.pijl` ≥ 48 px hoog; pijl op de linkerrand van de inhoud, kader 14 px verder (± 1); linkerkant open over ≥ 24 px rond het midden.
- **O4** Langste pijl-link ("Bekijk de kraamcadeauboxen", met kader 288 px) op 360 en 390 px op één regel, rechterkant niet voorbij de zijmarge (gemeten 318 / grens 330 op 360); geen horizontaal scrollen.
- **O5** Kadercontrast in rust ≥ 3:1 (inkt 0,72: wit 6,2, grijsblauw 5,5, perzik 4,5, oker 3,8, salie 4,8, mauve 3,6, olijf 4,1, terracotta 3,34, diepe tinten ≥ 3,4); wit op 1,0 op donkere foto zoals de witte tekst daar. Bouwer meet op foto's met pixels uit de schermafdruk.
- **O6** Muis: 0,7 s na hover/focus pijl `translateX(6px)`, stompjes 17 px, lijn dekking 1; focus lijn 2 px; tekstpositie 0 px verschoven. Touch en minder beweging: geen overgang.
- **O7** 390 × 844: onder het lookbook Vorige en Volgende 44 × 44 (`.carrousel-knop`, `aria-controls="lookbook-rij"`), vier streepjes (`aria-hidden`), nergens een cijfer; knoprij binnen 32 px onder het actieve paneel.
- **O8** Paneel 1: Vorige `aria-disabled="true"` en dekking 0,3; paneel 4: Volgende; tik op gedempte knop doet niets; precies één streepje 32 px op dekking 1.
- **O9** Na tik op Volgende kondigt de live-regel de nieuwe naam aan; sectie en balk binnen 1 s de `data-kleur` van dat paneel.
- **O10** `werkwijze.html` "Hoe ik werk": geen cijfer (tabs en koppen). "Zo werkt het" (Kraamcadeauboxen, Prematuurkleding, Babynest): rondje 48/44/40 px met punt van 5 px. Drieluik: geen `.nr`.
- **O11** Pijl-links onder elkaar ≥ 12 px tussen de kaders op 390 en 768 px.
- **O12** axe groen; focus zichtbaar (≥ 2 px, ≥ 3:1) op `.pijl`, lookbookknoppen en tabs van Hoe ik werk, ook op terracotta en foto.

Opmerking ontwerper: Stocks kaderlijn haalt ~1,7:1; met inkt 0,72 wordt ons kader iets donkerder dan bij Stock om 3:1 te halen (criterium 13). Wil Carst het lichtere kader (~0,4), dan moet criterium 13 versoepeld worden; advies: 0,72 houden.

## Antwoorden hoofdsessie (18 nov., niet-blokkerende vragen; in lijn met Carsts "cijfers overal niet netjes")
- Vraag 2: één brief, één pull request (A, B en C samen).
- Vraag 3: ja, de zichtbare stapnummers in "Zo werkt het" gaan weg; de genummerde lijst (`<ol>`) blijft voor schermlezers.
- Vraag 4: gelijktrekken: labels zonder nummer krijgen ook geen streepje meer (alleen het woord).
- Vraag 5: ja, interne aanduidingen in `CLAUDE.md` en briefs mogen blijven waar ze naar een sectie verwijzen; regels over wat zichtbaar is worden bijgewerkt.
- Vraag 6: ja, deze brief dekt story 5 (kader om de pijl-link) op de hele site af.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (18 nov. 08:43) en zijn keuze "alleen het woord". |
| Bouwen | website-bouwer | 18 nov.: A) lookbook op mobiel: tabjes 01–04 vervangen door Vorige · vier streepjes · Volgende (`.carrousel-knop` 44 × 44, ook op touch, `aria-disabled` op 0,3 aan begin/eind, niet rondlopen; live-regel "Siliconen items, 2 van 4"; rij is `.carrousel`-region met Home/End); Hoe ik werk zonder cijfers. B) alle labels en `data-label` alleen het woord (ook zonder streepje), `.label` en balk in Source Sans 3 600 kapitalen; `.nr` weg, `.stap-nr` = punt van 5 px. C) `.pijl` met kader (`::before`, 14 px na de pijl, stompjes 10 → 17 px, 0,72 → 1), animatie alleen met een muis bij hover/focus, focus = lijn 2 px; overal 16 px, `width: fit-content`, 12 px tussen kaders; kern-tekst 288 px. CLAUDE.md en principes.md bijgewerkt. Tests: B3 aangepast (zelfde strengheid), nieuwe `tests/e2e/elegante-navigatie.spec.js` (geen nummers op alle pagina's, kader, animatie, balk 360/390, O10). Uitkomst lokaal (Chromium, eigen poort): `npm test` 197/197; e2e alle specs groen behalve de axe-toetsen (axe-core niet te installeren, 114 × stub) en drie timingtoetsen die bij een volle machine wisselen en los groen zijn (ook in de basismeting op `main` rood); `controleer.py` "Geen fouten gevonden"; kadercontrast gemeten op schermafdrukken ≥ 3,35:1 (terracotta), foto's ≥ 5,8:1. Niet lokaal: Lighthouse, WebKit/iPhone, axe; basisschermen (Gate 5) wijken bewust af en moeten via `visueel-basis.yml` opnieuw. |
| Controleren | website-controleur | AKKOORD — ronde 1: twee punten (pijl-links op tablet raakten bij afbreken de lijnen; bij minder beweging schoof de pijl op de Inspiratie-tegels), in ronde 2 opgelost; ronde 3 en 4 (eb466d0, bd6336c) nagemeten: nergens horizontaal scrollen op 360/390/768/1024/1100/1280/1440 px, pijl en kader binnen de prijskaart en vrij van het iconenraster, kaarten en drieluikkaders per rij even hoog, drieluik op de lijn van het label; geen versoepeling (ijkpunt 1280 px terug op 506, grens ± 8 px, alleen toetsen erbij); npm test 197/197, sitecontrole groen, relevante e2e-specs Chromium groen (timingtests los herhaald); axe, Lighthouse, WebKit en basisschermen volgen in CI. |
| Bouwen (ronde 2) | website-bouwer | Op de twee punten van de controleur (ronde 1): `.pijl` krijgt 12 px boven en onder (en regelhoogte 1,5), zodat een gebroken pijl-link netjes in het kader staat (enkele regel blijft 48 px); in het drieluik `kraam&shy;cadeau&shy;boxen` en `prematuur&shy;kleding`, zodat de tekst op de tablet (kolom 208 px) binnen het kader breekt; minder beweging: de pijl schuift nooit, ook niet via `.project-link:hover`. Test: pijl-links ook op 1024 px, ≥ 8 px tussen tekst en boven-/onderlijn en ≥ 24 px rechts op elke regel; minder beweging op een Inspiratie-tegel. `prijskaart-iconen`: ijkpunt van de kaarthoogte op 1280 px 506 → 534 ("Stel deze box samen" staat daar nu op twee regels in het kader; grens ± 8 px ongewijzigd). Oud commentaar "nr en kop" bijgewerkt. Uitkomst: `npm test` 197/197, `controleer.py` geen fouten, relevante e2e-specs groen (Chromium, los gedraaid). |
| Bouwen (ronde 3) | website-bouwer | Afwerking ontwerpgate: prijskaarten 1025–1399 px zijpadding 22 px en pijl 14 px in de binnenrand (iconenraster mee), "Stel deze box samen" vanaf 1280 px op één regel (48 px), ijkpunt 1280 in `prijskaart-iconen` terug naar 506; drieluik met een muis: linkerrand wijkt tot de tekstkolom van 288 px past (vanaf ca. 1024 px alle drie op één regel), daaronder via een container query alle drie 72 px; Inspiratie mobiel 16 px tussen titel en kader; prijskaart mobiel 16 px onder het kader (vier kaarten 0,95 scherm op 390 × 844). Nieuwe toetsen in `elegante-navigatie.spec.js` (1280/1366 één regel, drieluik 1024/1100/1200 gelijk, mobiel 16 px). Uitkomst: `npm test` 197/197, `controleer.py` geen fouten, relevante specs groen (458, Chromium). |
| Bouwen (ronde 4) | website-bouwer | P1 ontwerper: de linkerrand van het drieluik staat weer op de lijn van label en logo op alle breedtes (aanpassing uit ronde 3 teruggedraaid). Container query: binnenbreedte < 288 px → alle drie de kaders 72 px (muis 900–ca. 1260 px, touch-tablet), < 190 px → 96 px (muis 761–ca. 900 px); vanaf ca. 1260 px op één regel (48 px). Toets: 800/1024/1100/1200/1280/1440 px drie gelijke kaders (96/72/72/72/48/48) en kop en pijl-link ± 2 px op de lijn van het label. Uitkomst: `npm test` 197/197, `controleer.py` geen fouten, elegante-navigatie, homepage-* en mobiel-ontwerp groen (Chromium; zes toetsen die in de gezamenlijke run door de drukte omvielen, los opnieuw groen). |
| Bouwen (ronde 5) | website-bouwer | Gate 4 in CI (PR #95): (1) Contact 1440 px 117 i.p.v. 131 ± 12: in CI was de linkerkolom van 001 (pijl-links, zonder ondermarge) de langste, waardoor de 12 px marge van p/address wegviel; `.gegevens .contact-lijst` krijgt dezelfde 12 px, zodat de afstand niet meer afhangt van welke kolom het langst is (lokaal 129, ook als de linkerkolom de langste is). (2) Balk 360 px: ≤ 380 px 8 px tussen logo en label; "Wat er in de box kan" lokaal 17 px van de burger (was 13). (3+4) Prijskaarten mobiel: padding 16/20/12 px, inhoud 8 px, pijl-link zonder marge (blijft 48 px); vier kaarten 764 px op 390 × 664 (grens 797; was 804). Toets ronde 3 onder het kader nu ≥ 12 px. Uitkomst: `npm test` 197/197, `controleer.py` geen fouten; contact-ruimte-en-kleur, elegante-navigatie, mobiel-ontwerp en prijskaart-iconen groen in Chromium, ook in een project van 390 × 664 (touch). |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD — na vier rondes: lookbook met Vorige · streepjes · Volgende in plaats van 01–04, labels alleen het woord, pijl-link met kader en rustige animatie (muis en focus, niets bij minder beweging) volgens O1–O12 op 360 t/m 1440 px; prijskaartlink op één regel vanaf 1280 px, meer ruimte rond de kaders op Inspiratie en de prijskaart op mobiel, drieluik op de lijn van label en logo met gelijke kaders; geen horizontaal scrollen; mobiel akkoord (Chromium; WebKit, axe en visuele vergelijking via het validatierapport); P3: op 860 px met een muis kaders 96/96/72 px. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
