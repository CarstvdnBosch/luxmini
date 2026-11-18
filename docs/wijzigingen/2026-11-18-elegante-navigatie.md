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
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
