# Instagram-post: het pakje schommelt even aan het hangertje

- **Datum:** 2026-11-15
- **Aangevraagd door:** Carst (15 nov. 13:17, bij een screenshot van 004 Instagram op de homepage: "Deze foto mag even een beetje bewegen qua pakje nog."; keuze Carst: **Zacht schommelen**)
- **Issue:** geen nummer gegeven (zie Open vragen); geen `Closes #…` tot dat bekend is
- **Risico:** midden: geen formulier, doorverwijzingen, `wrangler.jsonc` of workflows, maar wel een bewerking van een echte foto (uitknippen en opvullen), een nieuwe animatie op de homepage en mogelijk nieuwe basisschermen voor de visuele test

## Doel
Als de Instagram-post (004) in beeld komt, schommelt het mauve pakje een paar keer zacht aan zijn hangertje en hangt daarna weer stil. Zo voelt de post levendiger, terwijl de foto echt blijft: ladder, muur en pakje komen allemaal uit de bestaande foto.

## Uitgangssituatie (gelezen)
- `public/index.html` r. 310: `<a class="insta-foto" href="https://www.instagram.com/Luxmini2020/"><img src="assets/img/ig-outfit-ladder.jpg" alt="Mauve overslagshirtje met ruches en een flared broekje aan een houten ladder, op Instagram" width="480" height="640" loading="lazy"></a>`.
- `style.css` r. 803–807: `.insta-foto` heeft `overflow: hidden`, de img `aspect-ratio: 3 / 4; object-fit: cover` en bij aanwijzen `transform: scale(1.04)` (0,6 s). Op mobiel (r. 1922) `aspect-ratio: 4 / 5; object-position: 50% 40%`, dus daar valt ongeveer 40 px van de hoogte weg (boven ca. 16, onder ca. 24). Bij minder beweging staat de overgang uit (r. 837).
- `main.js` r. 1187: `.insta-foto` krijgt `.opkomen` en komt via de gedeelde IntersectionObserver in beeld (`in-beeld`, rootMargin −8 %); bij `stil` (minder beweging) gebeurt dat niet.
- De foto (480 × 640): de metalen haak van het hangertje hangt aan de bovenste sport, ongeveer op x 235, y 15–30. Daaronder het witte hangertje met het maatlabel "62", het overslagshirtje, het broekje, twee "LUX"-labels en een papieren kaartje. Beide mouwen liggen voor de staanders van de ladder. De rechtermouw loopt tot de rechterrand van de foto (x ≈ 480) en de linker manchet bijna tot de linkerrand. De middelste sport (y ≈ 315–335) loopt achter het shirt langs. De pijpen van het broekje eindigen vlak boven de onderste sport. Het broekje heeft een licht bloemetjesprint die qua tint dicht bij de muur ligt.

## Acceptatiecriteria
1. **Echte foto, niets verzonnen.** Het pakje en de achtergrond komen alleen uit `ig-outfit-ladder.jpg`. Er zijn geen AI-gegenereerde of generatief ingevulde beelden gebruikt. Uitknippen en opvullen gebeuren deterministisch met een script in `scripts/` (bijv. `scripts/pakje-uitknippen.py`, OpenCV met vaste parameters, zoals een vast masker en/of `cv2.grabCut` met een vaste rechthoek en een vast aantal iteraties, plus `cv2.inpaint`). Twee keer draaien geeft bytegelijke bestanden. Het masker (of de polygoon) staat in de repo buiten `public/`.
2. **Bestanden.** `public/assets/img/ig-outfit-ladder.jpg` is onveranderd (zelfde bytes). Er komen hooguit twee nieuwe bestanden bij, met nieuwe namen, bijv. `ig-outfit-ladder-achtergrond.jpg` (ladder en muur, achter het pakje opgevuld) en `ig-outfit-pakje.webp` of `.png` (pakje plus hangertje, met alfa). Geen van beide is groter dan 480 × 640 px of groter in bytes dan het origineel. Samen zijn ze hooguit 1,5 × het origineel in bytes (zie Open vragen). JPEG met kwaliteit ca. 80, geen EXIF.
3. **In rust identiek.** Vóór en na het schommelen valt de samengestelde post samen met de originele foto: het pakje staat op dezelfde plek (afwijking ≤ 1 px), op 1440, 820 en 390 px breed, dus ook met de 3:4-uitsnede (desktop/tablet) en de 4:5-uitsnede met `object-position: 50% 40%` (mobiel). Er zit geen zichtbare rand, halo of kleurverschil rond het pakje (beoordeling ontwerpgate op schermafdrukken op ware grootte en op 2×).
4. **Draaipunt en beweging.** Het pakje draait samen met het hangertje om het punt waar de haak de bovenste sport raakt (het draaipunt van de ontwerper, zie Ontwerprichting). De ladder, de muur en de bovenste sport bewegen niet. Hoek, aantal slingers, duur en demping zijn exact zoals in de Ontwerprichting. Daarna staat het pakje stil op de beginstand (criterium 3).
5. **Opvulling.** Bij de grootste uitslag is achter het pakje alleen opgevulde achtergrond uit de foto te zien, zonder gaten, zonder transparante pixels en zonder herhaald of gespiegeld beeld. Geen enkele snijrand van het pakje komt binnen de lijst in beeld, ook niet de rechtermouw die nu door de rechterrand wordt afgesneden. De ontwerper keurt de opvulling bij de grootste uitslag goed op een stilstaand beeld (de bouwer levert dat bij de schermafdrukken).
6. **Trigger, één keer.** Het schommelen start één keer per paginabezoek, als de post in beeld komt (trigger volgens de Ontwerprichting), en niet opnieuw bij wegscrollen en terugkomen. Het schommelen botst niet met `.opkomen` en ook niet met `scale(1.04)` bij aanwijzen: geen sprong en geen dubbele transform op hetzelfde element.
7. **Minder beweging en zonder JavaScript.** Met `prefers-reduced-motion: reduce` en zonder JavaScript staat precies de huidige `<img src="assets/img/ig-outfit-ladder.jpg">` er stil, met dezelfde alt-tekst. Dan worden de nieuwe bestanden niet geladen (te toetsen in het netwerkverkeer van Playwright).
8. **Toegankelijkheid.** De link naar `https://www.instagram.com/Luxmini2020/` werkt en is één tabstop. Er zijn geen extra focusbare elementen en de toegankelijke naam blijft gelijk: precies één beeld met de huidige alt-tekst, de lagen voor achtergrond en pakje hebben `alt=""` of `aria-hidden="true"`. Het schommelen duurt korter dan 5 s, zodat er geen pauzeknop nodig is (WCAG 2.2.2; de ontwerper bevestigt de duur). axe geeft geen nieuwe meldingen.
9. **Geen layout shift en geen horizontaal scrollen.** De post houdt 3:4 (desktop/tablet) en 4:5 (mobiel) met de huidige maten. Lighthouse CLS blijft ≤ 0,1 en het schommelen zelf voegt 0 toe (alleen `transform` op de pakjelaag, binnen `overflow: hidden`). Op 390 px scrolt de pagina niet horizontaal, ook niet bij de grootste uitslag.
10. **Prestaties.** De nieuwe bestanden zijn lazy (`loading="lazy"` of pas laden als de post bijna in beeld is) en hebben `width` en `height`. De budgetten in `lighthouserc.cjs` blijven ongewijzigd en worden gehaald (LCP ≤ 4000 ms, CLS ≤ 0,1, TBT ≤ 300 ms, totaal ≤ 3,5 MB). De animatie loopt met CSS-transform of de Web Animations API, zonder scrollhandler of rAF-lus die blijft lopen na het stilstaan.
11. **Mobiele Instagram-kaart.** Op ≤ 760 px blijven de witte kaart, de avatar, "luxmini2020", de iconen en het bijschrift ongewijzigd. Het pakje schommelt alleen binnen de foto van 4:5.
12. **Andere pagina's.** Alleen de homepage verandert. `main.js` doet niets als `.insta-foto` er niet is.
13. `npm run check` is groen: tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel en het validatierapport. Wijken de basisschermen van 004 af, dan legt de bouwer uit waarom, en ze worden alleen bijgewerkt via de gewone route (`visueel-basis.yml`), nooit door grenzen te versoepelen. Met ingeschakelde animatie maakt de visuele test een schermafdruk in rust (vóór of na het schommelen).
14. `CLAUDE.md` krijgt bij "Homepage" (004 Instagram) één regel over het schommelen (bestanden, trigger, minder beweging/zonder JS) met een verwijzing naar deze brief.

## Ontwerprichting
*Nog leeg: website-ontwerper levert de tekst. De bouwer begint pas na de antwoorden op de vragen hieronder.*

Vragen aan website-ontwerper:
1. **Draaipunt:** is dat het punt waar de haak de bovenste sport raakt (ca. x 235, y 20–28 in het bestand van 480 × 640)? Of de bovenkant van de haak? Draait het hangertje (wit, met "62") mee met het pakje? Dat ligt voor de hand, want het hangt eraan.
2. **Hoek:** wat is de grootste uitslag? Ter info: de afstand van het draaipunt tot de zoom van het broekje is ca. 570 px, dus 1° ≈ 10 px verschuiving onderaan, 2° ≈ 20 px. De rechtermouw wordt nu door de rand van de foto afgesneden. Bij een hoek van ca. 2° schuift die snijrand ongeveer 10 px naar binnen. Welke hoek is dan nog mogelijk zonder zichtbare snijrand (criterium 5), of hoe los je dat op (bijv. de mouw tegen de rand laten wegvallen, een iets andere uitsnede, alleen naar één kant laten uitslaan)?
3. **Opvulling:** hoe mag de vrijkomende strook eruitzien? Achter het pakje lopen de linker- en rechterstaander en de middelste sport. `cv2.inpaint` vult muur goed op, maar maakt hout en randen wazig. Mag een dunne wazige strook (hooguit X px)? Of moet de hoek zo klein zijn dat de opvulling niet opvalt? Is een zachte schaduw van het pakje op de muur toegestaan, of juist niet, omdat die niet in de foto staat?
4. **Slingers:** hoeveel slingers, hoe lang in totaal (korter dan 5 s, criterium 8), welke demping (bijv. uitslag die per slinger afneemt) en welke easing? Moet de beweging aanvoelen als een zuchtje wind of als een duwtje?
5. **Trigger:** hoeveel van de post moet in beeld zijn (bijv. 50 % zichtbaar), na hoeveel vertraging, en start het na het opkomen (`.opkomen`) of gelijktijdig? Wat gebeurt er als de bezoeker al aanwijst (`scale(1.04)`) of aanwijst tijdens het schommelen?
6. **Desktop/tablet/mobiel:** overal dezelfde hoek en duur? Op mobiel valt boven ca. 16 px weg (4:5, `object-position: 50% 40%`), dus de haak zit dichter bij de rand. Moet dat op touch anders?
7. **Minder beweging / zonder JS:** de gewone foto stil, zoals in criterium 7. Akkoord?

## Bestanden
- `public/index.html` (004 Instagram: de lagen in `.insta-foto`)
- `public/assets/css/style.css` (`.insta-foto` en de lagen, keyframes, `prefers-reduced-motion`)
- `public/assets/js/main.js` (trigger één keer per paginabezoek, lagen laden alleen bij beweging)
- `public/assets/img/ig-outfit-ladder-achtergrond.jpg` (nieuw)
- `public/assets/img/ig-outfit-pakje.webp` of `.png` (nieuw, met alfa)
- `scripts/pakje-uitknippen.py` (nieuw, deterministisch) en het masker buiten `public/`
- `tests/e2e/…` (kernpad of toegankelijkheid: één tabstop, alt-tekst, minder beweging laadt geen nieuwe bestanden)
- eventueel `tests/e2e/basis/…` (basisschermen, alleen via `visueel-basis.yml`)
- `CLAUDE.md` (regel bij Homepage)

## Buiten scope
- Andere foto's of andere posts laten bewegen, ook op Inspiratie.
- De ladder, de muur of de rest van de foto laten bewegen. Geen parallax en geen meebewegen met de muis.
- AI-gegenereerde of generatief ingevulde beelden, een nieuwe foto of een nepfoto.
- Een echte Instagram-feed of embed, en wijzigingen aan de tekst, avatar of iconen van 004.
- Het Lighthouse-budget, axe-regels of visuele grenzen versoepelen.
- Formulier, doorverwijzingen, `wrangler.jsonc`, `.github/workflows/`.

## Open vragen
- **Blokkerend: Ontwerprichting.** De bouwer heeft de antwoorden op vraag 1–5 nodig (draaipunt, hoek, opvulling, slingers, trigger).
- **Blokkerend (technisch): snijrand rechtermouw.** De rechtermouw loopt tot de rand van de foto (en de linker manchet bijna). Bij elke draaiing kan een rechte snijrand in beeld komen. Lukt dat niet onzichtbaar met een kleine hoek (vraag 2), dan stel ik als alternatief voor: alleen het broekje (vanaf de zoom van het shirt) laten schommelen, of de uitslag zo klein houden (bijv. ≤ 0,5°) dat de randen binnen 3 px blijven. Dit moet Carst kiezen, want het wijkt af van "het pakje schommelt".
- **Uitknippen van het broekje:** de lichte bloemetjesprint ligt qua tint dicht bij de muur. Of een automatisch masker (grabCut) daar een nette rand geeft, is onzeker. Mag de bouwer een handgetekend vast masker (polygoon, in de repo) gebruiken? Dat is ook deterministisch.
- **Grootte van de bestanden:** "nooit groter dan het origineel" heb ik opgevat als per bestand (px en bytes). Samen hooguit 1,5 × het origineel. Klopt dat, of moeten de twee nieuwe bestanden samen ook kleiner zijn dan het origineel?
- **Bronbestand:** volgens CLAUDE.md ontbreken de originele, grotere Instagram-bestanden nog. Het uitknippen gebeurt dus op de webversie van 480 × 640 (JPEG-artefacten aan de randen). Komt het grotere origineel nog, of gaan we hiermee verder?
- **Issue:** is er een issue (user story) voor deze wens? Dan komt het nummer in de brief en `Closes #<nummer>` in de pull request.
- **Visuele basisschermen:** als de samenstelling in rust minimaal afwijkt van de huidige foto (inpaint of afronding), kan de visuele test van 004 rood worden. Bijwerken kan alleen via `visueel-basis.yml` en de beoordeling in de pull request door Carst (validatierapport).
- **Gereedschap:** is OpenCV (`opencv-python`) beschikbaar in de omgeving van de bouwer? Het hoort alleen bij het script en is geen afhankelijkheid van de site of van `npm run check`.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief klaar; Ontwerprichting open (vragen aan website-ontwerper) |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Antwoorden hoofdsessie (15 nov.)
- OpenCV 5.0 en Pillow zijn beschikbaar in de werkomgeving (alleen voor het script).
- Een vast, met de hand getekend masker (polygoon in het script of een masker-PNG buiten `public/`) mag: het is deterministisch en gebruikt alleen de echte foto.
- Bestandsgrootte: per bestand niet groter dan het origineel, samen hooguit 1,5 × het origineel.
- We gaan verder met de webversie van 480 × 640 (het grotere bestand is nog open).
- Snijrand van de mouwen: eerst beoordeelt website-ontwerper of het pakje onzichtbaar kan schommelen; zo niet, dan legt de hoofdsessie de alternatieven aan Carst voor.
