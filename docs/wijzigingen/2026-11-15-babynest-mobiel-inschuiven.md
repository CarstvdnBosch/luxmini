# Babynest op mobiel en tablet: objecten schuiven van opzij in, en het boek oogt echter

- **Datum:** 2026-11-15
- **Aangevraagd door:** Carst (feedback 15 nov. 11:43, opmerking 3, mobiel; vergelijking met stockdutchdesign.com/media/ op een iPhone 16, 393 × 852)
- **Branch:** `wijziging/babynest-mobiel-inschuiven` (vanaf `origin/main`, waar Babynest met boek, magazine en tablet al live staat)
- **Issue:** geen issuenummer bekend. Is er een issue, dan komt `Closes #<nummer>` in de pull request.
- **Risico:** midden. Het formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt. Wel verandert gedeelde code: `main.js` §5f en de CSS van `.media`, `.papier`, `.blad` en `.kaft`. Die code gebruikt ook het atelierboekje op Werkwijze (PR #86, live). Objecten die half buiten het scherm beginnen, kunnen horizontaal scrollen veroorzaken. Dat gebeurde eerder alleen in WebKit (iPhone), en WebKit draait alleen in CI.

## Doel
Op mobiel en tablet schuift elk object op Babynest bij het scrollen van opzij het beeld in, met een draai, zoals bij Stock. 001 komt van links, 002 van rechts en 003 weer van links. Boek en magazine lijken meer op een echt boek, met een rug, zichtbare bladzijden en schaduw, in plaats van een plat vlak dat stil in het midden staat.

## Wens (letterlijk, Carst 15 nov. 11:43)
> "Het babynest, de plaatjes openen nu en dat ziet er al best aardig uit. Maar bij Dutch Stock schuift het in van de zijkant en is het design van het boekje realistischer. Plaatje 1 komt van links, plaatje 2 komt van rechts. Bij LUX staat het statisch in het midden."

Zo ziet het er bij Stock op mobiel uit, volgens de waarneming in de opdracht:
- Het boek steekt eerst half buiten het scherm, gekanteld, met een dikke rug en bladzijden.
- Bij scrollen schuift het naar binnen.
- Het volgende item komt van de andere kant.

## Hoe het nu werkt (gelezen in de code)
- **Desktop (≥ 1025 px):** `.obj` schuift in vanaf `translateX(150%) rotate(14deg)`. Bij `.gespiegeld` is dat `-150%` en `-14deg`. Het duurt 1,5 s met `cubic-bezier(.65,0,.35,1)`. De start is `.binnen`, gezet door de IntersectionObserver: het hangt dus van tijd af, niet van de scrollpositie. Daarna staat het blok vast (sticky) en slaat de kaft open.
  - Gevolg: op desktop komt 001 van **rechts** en 002 van **links**. Dat is andersom dan wat Carst voor mobiel beschrijft (zie open vraag 3).
- **Tablet en mobiel (≤ 1024 px):** `.obj` komt van onder (`translateY(80px)`, opacity 0 → 1, 1,5 s) en staat gecentreerd in de kolom (`.media-object { align-self: center }`, mobiel 326 × 408, tablet ≤ 560 px).
  - Er is één pagina van 4:5. `.kaft-achter` is verborgen en de kaft draait tot 90° en verdwijnt dan (`--kaft-o`).
  - Het openslaan hangt af van de scrollpositie (`mediaStart`, hooguit 3/4 scherm).
  - Het blok heeft `overflow-x: hidden; overflow: clip`.
- **Realisme nu:** het boek is een plat vlak (`.blad`, `#FBF8F3`) met één slagschaduw (`0 30px 50px`) en een smalle verloopstrook langs de rug (`::after`, 5–12%). Er is geen rugdikte en er zijn geen bladzijderanden.
- **Werkwijze:** `section.media.boekje` gebruikt dezelfde `.papier`, `.blad`, `.kaft` en dezelfde §5f, zonder `.gespiegeld`.

## Acceptatiecriteria

### Inschuiven op mobiel (≤ 760 px) en tablet (761–1024 px)
1. **Richting.** Op `babynest.html` begint bij beweging met JavaScript:
   - het object van 001 Het nest (boek) links, voor een deel buiten het scherm, en schuift naar rechts op zijn plek;
   - het object van 002 De stof (magazine, `.gespiegeld`) rechts, en schuift naar links;
   - het object van 003 Het dekentje (tablet) weer links.

   De richting volgt de klasse `.gespiegeld`, niet het volgnummer. Zo blijft hij goed als er een blok bij komt.
2. **Draai.** Tijdens het inschuiven is het object gekanteld en eindigt het recht (rotate 0). Draaiing, beginafstand, duur en easing komen uit de Ontwerprichting (nog in te vullen door website-ontwerper). De bouwer kiest deze waarden niet zelf.
3. **Wanneer.** Het inschuiven start of verloopt zoals de Ontwerprichting zegt: tijd na binnenkomst, of meelopend met de scrollpositie (open vraag 1). Touch scrolt altijd native: niets wordt vastgezet en er is geen scroll-jacking.
4. **Eindstand gelijk aan nu.** Na het inschuiven staat het object op dezelfde plek en in dezelfde maat als nu:
   - op 390 px 326 × 408 px;
   - op tablet hooguit 560 px, gecentreerd in de kolom.

   De volgorde label, object, kop, zin, pijl-link verandert niet. Op 390 × 844 staat in elk blok van 001 tot en met 003 de pijl-link nog in hetzelfde scherm als het label (zoals in de brief van 14 nov., criterium 9).
5. **Openslaan blijft werken.** De kaft is bij binnenkomst dicht en slaat open op de scrollpositie. Het openslaan begint pas als het object op zijn plek staat, of zoals de Ontwerprichting het anders vastlegt. Tijdens het openslaan blijft de kaft minstens 12 px onder het label. De tablet wisselt nog steeds van foto op de scrollpositie.
6. **Geen horizontaal scrollen.** Op 390, 393, 768 en 1024 px geldt `document.documentElement.scrollWidth === window.innerWidth` op elke scrollpositie: vóór, tijdens en na het inschuiven en halverwege het openslaan. Dit wordt getoetst in Chromium en WebKit (iPhone). Het object dat buiten het scherm begint, wordt geknipt door het blok (`overflow: clip` op `.media` blijft) en niet door `body`/`html`. Er komt geen `overflow-x: hidden` op `html` of `body` erbij, want dat breekt `position: sticky`.
7. **Desktop ongewijzigd** (≥ 1025 px): het inschuiven (x ±150% met draai, 1,5 s), het vastzetten (sticky, 0,7 scherm), het openslaan en de tekstregels blijven zoals nu. Tenzij open vraag 3 anders wordt beslist.

### Realistischer boek en magazine (alle schermen, of alleen ≤ 1024 px: open vraag 4)
8. **Uiterlijk.** Boek (001) en magazine (002) hebben zichtbaar:
   - een rug met dikte;
   - randen van bladzijden (het boek dikker dan het magazine);
   - een schaduw die het object van de achtergrond tilt.

   Maten en uitvoering komen uit de Ontwerprichting. Het verschil tussen boek (harde kaft, dik) en magazine (dun, zachte kaft) blijft zichtbaar.
9. **Alleen CSS.** Rug, bladzijden en schaduw zijn alleen opmaak, met pseudo-elementen of lege `aria-hidden`-elementen. Er komen geen nieuwe afbeeldingen en geen nieuwe tekst. Elke `alt` blijft uniek, en een element dat alleen decoratie is, wordt niet voorgelezen.
10. **Kleine tekst.** Op de kaften ("LUX mini — Babynest", "Lookbook · Babynest", op Werkwijze "LUX mini · Atelier") haalt de kleine tekst nog steeds 4,5:1. Rug en schaduw liggen niet over die tekst.
11. **Maten.** Geen pagina wordt breder getoond dan het bestand (768 px). Op desktop blijft één pagina ≤ 384 px. De rugdikte komt bij de breedte van het objectvak, niet bovenop: het object wordt niet breder dan nu (op 390 px past alles binnen de rand van 32 px, behalve tijdens het inschuiven, zie criterium 6).
12. **Tablet (003).** Het tabletkader verandert niet in vorm (geen merk, knoppen of camera-eiland). Het schuift alleen van opzij in volgens criterium 1.

### Minder beweging en zonder JavaScript
13. **Minder beweging** (`prefers-reduced-motion: reduce`): niets schuift of draait. Boek en magazine staan open (op mobiel de binnenpagina), de tablet wisselt van foto zonder te schuiven en alle tekst staat er direct. Rug, bladzijden en schaduw zijn wel zichtbaar, want die bewegen niet.
14. **Zonder JavaScript:** de objecten staan direct op hun plek. Op mobiel staat de binnenpagina er, de tablet toont de eerste foto en alle tekst en links zijn zichtbaar. Er staat nergens een object half buiten het scherm.

### Werkwijze (atelierboekje)
15. Volgens de keuze bij open vraag 2 doet het atelierboekje op `werkwijze.html` **mee** of blijft het **ongewijzigd**:
    - **Mee** (voorstel): op mobiel en tablet schuift het boekje van links in, met dezelfde rug, bladzijden en schaduw. De criteria 6, 8 tot en met 11, 13 en 14 gelden dan ook daar.
    - **Ongewijzigd:** de nieuwe opmaak en beweging gelden alleen voor `.media:not(.boekje)`. `werkwijze-boekje.spec.js` blijft dan zonder aanpassing groen en de basisschermen van Werkwijze veranderen niet.

    De bouwer noemt in het Verloop welke keuze is uitgevoerd.

### Tests en harness
16. **`babynest-media.spec.js`** krijgt er tests bij (projecten mobiel, tablet en iPhone/WebKit):
    - vóór het inschuiven ligt het midden van het object van 001 links van het schermmidden, bij 002 rechts en bij 003 links, met een rotatie ≠ 0;
    - na het inschuiven staat het object gecentreerd met rotatie 0 en met de maten uit criterium 4;
    - op elke scrollstap (bijv. 25 px) `scrollWidth === innerWidth` op 390, 393 en 768 px;
    - bij minder beweging en zonder JS is er geen transform op `.obj` en is het object volledig binnen het scherm;
    - rug en bladzijden zijn aanwezig en niet voorleesbaar (geen extra item in de toegankelijkheidsboom).

    Bestaande tests (kaft dicht bij binnenkomst, ≥ 12 px onder het label, pijl-link in hetzelfde scherm, desktop) blijven en worden niet versoepeld.
17. **`werkwijze-boekje.spec.js`** blijft groen. Bij "mee" (open vraag 2) krijgt het dezelfde toetsen voor richting en horizontaal scrollen. Alleen verwachte waarden die door de keuze veranderen, mogen worden aangepast. De bouwer noemt die in het Verloop.
18. **Visueel:** de basisschermen van `babynest.html` (alle drie de schermen als het realisme ook op desktop komt, anders tablet en mobiel) en eventueel `werkwijze.html` wijken bewust af. Ze worden bijgewerkt via `visueel-basis.yml` en de bouwer noemt welke schermen.
19. **Groen:** `npm run check` is groen (tests, sitecontrole, axe zonder fouten, SEO, veiligheid, Lighthouse zonder hogere CLS of LCP, visueel, validatierapport). Grenzen, tests en axe-regels worden niet versoepeld.
20. **`CLAUDE.md`:** de Babynest-regel (nu: "Mobiel/tablet onder elkaar … kaft dicht bij binnenkomst …") en zo nodig de regel Werkwijze 001 worden bijgewerkt. Daar komen in: de inschuifrichting op mobiel en tablet (van opzij, afwisselend volgens `.gespiegeld`), de waarden uit de Ontwerprichting en rug, bladzijden en schaduw. Dit doet de hoofdsessie of de bouwer, met een vermelding in het Verloop.

## Ontwerprichting

*Nog in te vullen door website-ontwerper. De planner zet de tekst hier letterlijk neer. De bouwer begint pas aan criterium 2, 3, 5 en 8 als dit blok er staat.*

Vragen aan website-ontwerper:

1. **Inschuifafstand op mobiel en tablet.** Waar begint het object? Bijvoorbeeld voor de helft buiten het scherm, zoals Carst bij Stock zag, of `translateX(±150%)` zoals op desktop. Geldt die maat in procenten van het object of van het scherm? Is die op tablet (560 px) anders dan op 390 px?
2. **Kanteling.** Om welke as, hoeveel graden en vanuit welk draaipunt? Draait het object mee met de richting (van links bijvoorbeeld −x°, van rechts +x°)? Alleen `rotate` in het vlak, of ook een lichte `rotateY` voor diepte?
3. **Tijd of scroll.** Loopt het inschuiven op mobiel mee met de scrollpositie (zoals het openslaan nu, scroll-gekoppeld, terugscrollen = terugschuiven) of start het één keer op tijd bij binnenkomst (zoals desktop nu, 1,5 s `cubic-bezier(.65,0,.35,1)`)? Hoe lang is het scrolltraject of hoe lang duurt het?
   - 001 staat op 390 × 844 bij binnenkomst al gedeeltelijk in beeld. Schuift dat object bij het laden vanzelf in, of pas bij de eerste scroll?
4. **Volgorde inschuiven en openslaan.** Eerst inschuiven en dan openslaan, of overlappend? Blijft de kaft op mobiel na 90° verdwijnen (één pagina), of wordt het op mobiel een spread die half buiten beeld begint, zoals Stock? Let op: dan wordt het object breder dan 326 px (criterium 4 en 11).
5. **"Realistischer": rugdikte.** Hoeveel px of % van de paginabreedte voor de rug van het boek, en voor het magazine (dunner, zachte kaft, nietjes of gelijmd)? Welke kleur en welk verloop? Is de rug zichtbaar in rust of alleen tijdens het kantelen?
6. **"Realistischer": bladzijderanden.** Hoeveel randen of lagen (bijvoorbeeld 3–6 lijntjes in gebroken wit) en aan welke zijden (rechts en onder)? Hoe dik bij het boek, hoe dun bij het magazine? Wat gebeurt er bij het openslaan: blijven de randen onder de rechterpagina liggen?
7. **"Realistischer": schaduw.** Eén zachte slagschaduw (nu `0 30px 50px rgba(32,32,32,.28–.3)`) of gelaagd (contactschaduw plus diepe schaduw)? Beweegt de schaduw mee met de kanteling? Krijgt de rug een eigen lichtval?
8. **Overlap met de schermrand.** Hoeveel van het object mag in de eindstand of tijdens het inschuiven buiten de rand van 32 px vallen? Mag het in de eindstand de schermrand raken, zoals Stock, of blijft het binnen de rand, zoals nu (326 px)? Hoe verhoudt dat zich tot Mobiel-regel "zijmarge 32 px" in `CLAUDE.md`?
9. **Tablet (761–1024 px).** Hetzelfde gedrag als mobiel, met de kolom van 560 px gecentreerd? Of schuift het object daar in tot de rand van het scherm en niet van de kolom?
10. **Desktop.** Komt het realisme (rug, bladzijden, schaduw) ook op desktop, op de spread van twee pagina's? En moet de richting op desktop gelijk worden met mobiel (001 van links)? Zie open vraag 3.
11. **Werkwijze.** Doet het atelierboekje mee (aanbevolen voor één boek-code) of blijft het zoals het is (open vraag 2)?
12. **Toetsbare ontwerpcriteria.** Graag als genummerde lijst, zoals in de brief van 14 nov.: bijvoorbeeld de positie en rotatie bij het begin, de stand per scrollpercentage, de minimale zichtbare rugdikte in px op 390 en 768 px, en de schaduwwaarden.

## Bestanden
- `public/assets/css/style.css`: `.media`, `.papier`, `.blad`, `.kaft*` (rug, bladzijden, schaduw), en het inschuiven per richting in `@media (prefers-reduced-motion: no-preference) and (max-width: 1024px)`
- `public/assets/js/main.js`: §5f, alleen als het inschuiven scroll-gekoppeld wordt (een variabele per blok, zoals `--open`) of als de richting/klasse daar wordt gezet
- `public/babynest.html`: alleen als er decoratieve elementen nodig zijn voor rug of bladzijden (`aria-hidden`)
- `public/werkwijze.html`: alleen bij "mee" en als er elementen nodig zijn
- `tests/e2e/babynest-media.spec.js` en eventueel `tests/e2e/werkwijze-boekje.spec.js`
- `tests/e2e/basis/` (via `visueel-basis.yml`)
- `CLAUDE.md`: de Babynest-regel en eventueel Werkwijze 001

## Buiten scope
- Geen nieuwe teksten, foto's of kaftteksten. De koppen en zinnen van 001 tot en met 003 houden "LET OP: wacht op akkoord Carien".
- Geen wijziging aan 004 Prijs, 005 Zo werkt het, 006 Contact, de paginakop, het logo, de balk of de kleurlaag.
- Geen wijziging aan het vastzetten op desktop.
- Geen wijziging aan het formulier, `src/`, `_redirects`, `_headers`, `wrangler.jsonc` of `.github/workflows/`.
- De andere pijnpunten uit de feedback van 15 nov. (opmerking 1, 2 en verder) horen niet bij deze brief. Eén story per brief.
- Geen kopie van het ontwerp, de beelden of de teksten van Stock. Alleen het patroon (inschuiven van opzij, een boek dat echt oogt).

## Open vragen

**Blokkerend**
1. **Ontwerprichting ontbreekt.** Website-ontwerper moet de vragen hierboven beantwoorden: beginafstand, kanteling, tijd of scroll, rugdikte, bladzijden, schaduw, overlap met de rand en tablet. Zonder die antwoorden kan de bouwer criterium 2, 3, 5 en 8 niet uitvoeren zonder zelf ontwerpkeuzes te maken.
2. **Werkwijze mee of niet?** Het atelierboekje gebruikt dezelfde code.
   - Voorstel: **mee**. Dan blijft er één boek-code en oogt het boekje op Werkwijze net zo echt.
   - Gevolg: Werkwijze verandert zichtbaar, en die pagina is net live gegaan (PR #86, goedgekeurd door Carst).

   Carst of de hoofdsessie beslist. Zonder besluit houdt de bouwer Werkwijze ongewijzigd (`.media:not(.boekje)`).

**Niet blokkerend**
3. **Richting op desktop.** Carst wil op mobiel 001 van links. Op desktop komt 001 nu van rechts, omdat het object daar rechts staat. Voorstel: desktop ongewijzigd laten, want daar volgt de richting de kant waar het object staat. Mobiel krijgt de afwisseling van Stock.
4. **Realisme ook op desktop?** Carst noemt het bij mobiel, maar een boek dat er op mobiel echter uitziet dan op desktop is niet consequent. Voorstel: rug, bladzijden en schaduw op alle schermen, en het inschuiven alleen nieuw op ≤ 1024 px. De ontwerper beslist (vraag 10).
5. **Rand van 32 px.** Stock laat het boek op mobiel half buiten het scherm steken. Mag het object in de eindstand buiten de zijmarge van 32 px komen? Dat wijkt af van de Mobiel-regel in `CLAUDE.md`. Voorstel: alleen tijdens het inschuiven buiten de rand, in de eindstand binnen de rand zoals nu. Wil Carst het wel zoals Stock (ook in rust tot de schermrand), dan is dat een wijziging van een ontwerpregel en dus een besluit van Carst.
6. **Schermafdruk klopt niet.** `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-15nov/8.png` toont links Stock **/projecten** en rechts luxmini.nl/**inspiratie**, niet /media en /babynest. De brief steunt daarom alleen op Carsts tekst en de waarneming in de opdracht. Een schermafdruk of korte opname van stockdutchdesign.com/media/ op mobiel zou de ontwerper helpen.
7. **Issuenummer.** Er is geen issue genoemd. Bestaat er een, dan komt het in de pull request.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit feedback Carst 15 nov. 11:43 (opmerking 3): op mobiel en tablet schuiven de objecten op Babynest van opzij in (001 links, 002 rechts, 003 links), met draai, en boek en magazine krijgen een rug, bladzijden en schaduw. Huidige code gelezen (`babynest.html`, `style.css` r. 1689–1797, `main.js` §5f). Risico midden (gedeelde boek-code met Werkwijze, horizontaal scrollen in WebKit). Ontwerprichting leeg, met 12 vragen aan website-ontwerper. Blokkerend: de Ontwerprichting, en of Werkwijze meegaat. De schermafdruk 8.png toont andere pagina's (open vraag 6). |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (15 nov., keuzevragen in de chat)
1. **Werkwijze gaat mee:** het atelierboekje krijgt hetzelfde realistischere boek (één boek-code op de hele site).
2. **Buiten de rand alleen tijdens het inschuiven:** in rust staat het object binnen de zijmarge van 32 px.
3. Desktop-richting blijft zoals nu; realisme (rug, bladzijden, schaduw) op alle schermen (voorstellen planner overgenomen).
4. Schermafdruk van Stock /media op mobiel: /tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-15nov/7.png (links); 8.png is /projecten.
