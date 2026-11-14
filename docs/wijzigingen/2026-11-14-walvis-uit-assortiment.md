# Walvis uit het assortiment

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (14 nov. 13:30: "Het stofje walvis gaat uit het assortiment. Die mag je weghalen bij stoffen.")
- **Branch:** `wijziging/walvis-uit-assortiment` (vanaf `origin/main`)
- **Issue:** geen nummer bekend (zie Open vragen)
- **Risico:** hoog — raakt het formulier: de stofkeuzekaarten in `public/contact.html` en de toegestane thema's in `src/formulier.js`. De rest is laag: een tegel minder in drie rijen en een foto minder op Inspiratie.

## Doel
Bezoekers zien en kiezen Walvis nergens meer, omdat Carien die stof niet meer heeft. Zo vraagt niemand een box aan die niet meer gemaakt kan worden.

## Wens en besluit
- Carst, 14 nov. 13:30: Walvis weghalen bij de stoffen. Eerder bekend: Carien vervangt Walvis door een schildpadstof. Daarvan is nog geen stof- of themafoto. Die komt later in een eigen story, niet in deze brief.
- Besluit hoofdsessie: Walvis verdwijnt overal waar hij als keuze of aanbod staat:
  - de stoffenrij (002) en de themacarrousel (003) op Kraamcadeauboxen;
  - de stofkeuzekaarten in het formulier;
  - de toegestane waarde in de Worker;
  - het eerder gemaakte werk op Inspiratie (groep Kraamcadeauboxen).
- Waar het aantal genoemd wordt, wordt "negen stoffen/thema's" overal "acht".

## Gevonden plekken (stand `origin/main`, 14 nov.)
| Plek | Wat | Actie |
|---|---|---|
| `public/kraamcadeauboxen.html` r. 223 | stoftegel Walvis in `#stoffenrij` (`stof-walvis.jpg`) | weg |
| `public/kraamcadeauboxen.html` r. 250 | thema Walvis in `.themacarrousel` (`box-walvis.jpg`) | weg |
| `public/kraamcadeauboxen.html` r. 7 en r. 239 | meta description "in negen thema's", commentaar "de negen thema's" | "acht" |
| `public/contact.html` r. 194 | keuzekaart `box_thema` = `Walvis` | weg |
| `src/formulier.js` r. 49 | `THEMAS` bevat `'Walvis'` | weg |
| `public/inspiratie.html` r. 189 | werk "Walvis" (`box-walvis.jpg`) in groep 004 Kraamcadeauboxen | weg |
| `public/index.html` r. 136, `public/werkwijze.html` r. 135 | foto `pers-stoffen.jpg`, alt "Vier stoffen met prints van vosjes, walvissen en blaadjes" | **blijft**: dit is een sfeerfoto van het atelier (hero set A, fotorij Werkwijze), geen keuze of aanbod. De alt-tekst beschrijft wat er op de foto staat en blijft dus kloppen (zie Open vragen 3) |
| `public/assets/css/style.css` r. 864, r. 1181 | commentaar "negen thema's", "9 stoffen + Een eigen stof = 2 rijen" | bijwerken |
| `public/assets/img/stof-walvis.jpg`, `box-walvis.jpg`, `box-walvis-600.jpg` | daarna nergens meer gebruikt | verwijderen |
| `tests/…`, `scripts/controleer.py`, `CLAUDE.md` | lijsten en aantallen | zie criteria 9–14 |

## Acceptatiecriteria

### Site
1. **Kraamcadeauboxen, 002:** `#stoffenrij` heeft acht stoftegels, in deze volgorde: Giraf, Vos, Tulp, Wilde blaadjes, Framboos, Regenboog, Wilgentakjes, Blaadjes en bloemen. Foto's, alt-teksten en namen van de andere tegels blijven gelijk. De carrousel werkt zoals nu: knoppen "Vorige stoffen" en "Volgende stoffen" met een muis, `aria-disabled` aan begin en eind, Home en End, geen scrollbalk. Blaadjes en bloemen ligt aan het eind helemaal binnen de rij.
2. **Kraamcadeauboxen, 003:** de `.themacarrousel` heeft acht thema's in dezelfde volgorde als criterium 1. Bij sets van drie is de laatste set er een van twee. Dat mag. Scroll-snap per set, "Volgende" krijgt `aria-disabled="true"` als Blaadjes en bloemen helemaal in beeld is, en End gaat naar de laatste set. Op mobiel staat één thema per keer in beeld met een stukje van het volgende. Op geen enkele breedte staat er een lege set of rechts een lege rand ter breedte van een thema terwijl de knop "Volgende" nog actief is.
3. **Teksten:** de meta description van `kraamcadeauboxen.html` noemt "acht thema's". In `public/` staat nergens zichtbaar "negen thema's" of "negen stoffen".
4. **Formulier (`contact.html`):** de groep Thema toont acht stofkaarten (zelfde volgorde als criterium 1), daarna "Een eigen stof" en daaronder "Nog niet gekozen" (standaard aangevinkt). Er is geen radio met `value="Walvis"`. "Een eigen stof" en het blok "Je eigen stof (optioneel)" werken zoals nu (`:has`, foto, link).
5. **Raster zonder gaten:** op 390, 768 en 1280 px heeft het raster `.stof-kaarten` geen lege cel. Elke rij is tot de rechterrand van het raster gevuld (rechterkant van de laatste kaart in elke rij = rechterkant van het raster, ± 1 px). Vanaf 761 px blijven er 5 kolommen (CLAUDE.md) en op mobiel 3 kolommen. Hoe de negen kaarten (8 stoffen + eigen stof) daarin vallen, volgt de **Ontwerprichting**; zie Open vragen 1. Verder blijft alles zoals nu: tegels max. 240 px, naam 16 px, tikdoelen minstens 44 px, geen horizontaal scrollen, op 390 × 844 de themagroep (zonder het blok) binnen één scherm.
6. **Vooraf invullen:** `contact.html?onderwerp=kraamcadeaubox&thema=walvis#formulier` zet geen thema en laat "Nog niet gekozen" aangevinkt (het bestaande gedrag voor een onbekend thema in `main.js`; aan de code verandert niets). `?thema=giraf` en `?thema=eigen` werken zoals nu.
7. **Worker (`src/formulier.js`):** `THEMAS` is `Giraf, Vos, Tulp, Wilde blaadjes, Framboos, Regenboog, Wilgentakjes, Blaadjes en bloemen, Een eigen stof of kleur`. Een verzending met `box_thema=Walvis` neemt geen thema over: de mail heeft geen themaregel met Walvis, net als bij elke andere onbekende waarde. De verzending zelf slaagt wel. Er verandert niets aan foto, link of bijlage.
8. **Inspiratie:** de groep 004 Kraamcadeauboxen heeft geen werk "Walvis" meer (tien werken in plaats van elf). Het metselwerk sluit zonder gat aan en de groep werkt bij aanwijzen en op touch zoals nu.
9. **Bestanden:** `stof-walvis.jpg`, `box-walvis.jpg` en `box-walvis-600.jpg` zijn uit `public/assets/img/` verwijderd. Geen enkel bestand in `public/` verwijst er nog naar (geen 404 in de sitecontrole).

### Tests, sitecontrole en documentatie
10. **E2e:** in `tests/e2e/stofkeuze.spec.js` (`THEMAS`) en `tests/e2e/homepage-zoals-stock.spec.js` (r. 42, de themalijst in het formulier) staat Walvis niet meer in de verwachte lijsten.
    - De rastertest in `stofkeuze.spec.js` (r. 43–54: aantal rijen, kolommen, `slice(0, 9)`, `kaarten[9]`) volgt de indeling uit de Ontwerprichting en toetst criterium 5 ("geen lege cel").
    - In de test "na Verwijderen en bij een ander thema" (r. 182) wordt `kies(page, 'Walvis')` een ander thema, bijvoorbeeld Vos. De test blijft verder gelijk.
    - Een nieuwe controle toetst criterium 6 (`?thema=walvis` geeft "Nog niet gekozen").
    - In `kernpaden.spec.js` en `homepage-zoals-stock.spec.js` worden alleen namen en commentaar "negen" → "acht" bijgewerkt. Alle bestaande controles blijven.
11. **Unit (`tests/formulier.test.js`):** de testnaam op r. 102 noemt "acht thema's". Een nieuwe controle toetst dat `Walvis` geen geldig thema meer is (criterium 7). Er wordt niets geschrapt.
12. **Sitecontrole (`scripts/controleer.py`):** `THEMAS` (r. 1042) zonder Walvis. Een nieuwe controle meldt een fout als "walvis" (hoofdletterongevoelig) voorkomt in `src/` of in `public/` (HTML, JS, CSS, bestandsnamen in `assets/img/`). Enige uitzondering: de alt-tekst van `pers-stoffen.jpg`, alleen exact die zin. De docstring/commentaar met "negen thema's" wordt bijgewerkt.
13. **Visueel:** de basisschermen wijken alleen af bij:
    - Kraamcadeauboxen 002 (stoffenrij) en 003 (thema's);
    - de themagroep van het formulier op Contact;
    - de groep Kraamcadeauboxen op Inspiratie.

    De basis wordt bijgewerkt via `visueel-basis.yml`. De bouwer noemt welke schermen.
14. **`CLAUDE.md`:**
    - Bij Mappen (`kraamcadeauboxen.html`) en bij de ontwerpregel Kraamcadeauboxenpagina wordt "de negen stoffen" en "de negen thema's" overal "acht".
    - De zin over de stofkeuze in de formulierregel ("5 kolommen, op mobiel 3 × 3 met 'Een eigen stof' breed eronder") wordt de indeling uit de Ontwerprichting.
    - Bij elke aangepaste regel komt een verwijzing naar deze brief.
15. `npm run check` is groen: tests, sitecontrole, axe zonder nieuwe fouten op `kraamcadeauboxen.html`, `contact.html` en `inspiratie.html`, SEO, veiligheid, Lighthouse, visueel en het validatierapport. Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting
*Nog aan te vullen door website-ontwerper (kort). De hoofdsessie vraagt die tekst op en zet hem hier, voordat de bouwer aan criterium 5 begint.* De vraag aan de ontwerper staat bij Open vragen 1.

Wat al vastligt in CLAUDE.md en het besluit van de hoofdsessie:
- stoffenrij en thema's blijven `.carrousel`;
- thema's in sets van drie, een laatste set van twee mag;
- het formulier houdt 5 kolommen vanaf 761 px en 3 op mobiel;
- het raster heeft geen lege cellen.

## Bestanden
Zo klein en lokaal mogelijk houden. Drie andere pull requests raken dezelfde bestanden: zie Buiten scope en Open vragen 4.
- `public/kraamcadeauboxen.html`: een `li` weg in `#stoffenrij`, een `li` weg in `.themacarrousel`, meta description. Het `id="stoffen"` en de rest van de sectie blijven ongemoeid.
- `public/contact.html`: één `label.stof-kaart` weg (r. 194)
- `public/inspiratie.html`: één `figure.werk` weg (r. 189)
- `public/assets/css/style.css`: alleen het blok `.stof-kaarten` (r. 1180–1232) als de Ontwerprichting dat vraagt, plus commentaar
- `public/assets/img/`: `stof-walvis.jpg`, `box-walvis.jpg`, `box-walvis-600.jpg` verwijderen
- `src/formulier.js`: `THEMAS`
- `tests/formulier.test.js`, `tests/e2e/stofkeuze.spec.js`, `tests/e2e/homepage-zoals-stock.spec.js`, `tests/e2e/kernpaden.spec.js` (alleen commentaar)
- `scripts/controleer.py`: `THEMAS` en de controle op "walvis"
- `tests/e2e/basis/`: via `visueel-basis.yml`
- `CLAUDE.md`

## Buiten scope
- De schildpadstof (nieuwe stof-/themafoto, naam, plek in de rijen): die komt in een eigen story als de foto's er zijn.
- `pers-stoffen.jpg` vervangen of bijsnijden, en de alt-tekst daarvan veranderen.
- Geen andere wijzigingen aan `main.js`. Het vooraf invullen werkt al met "onbekend → Nog niet gekozen".
- Geen wijziging aan `src/contact.js`, `wrangler.jsonc`, `_redirects`, `_headers` of `.github/workflows/`.
- Niets uit de lopende pull requests overnemen of vooruitlopen:
  - PR #72 (goedkeuringen: contact, kraamcadeauboxen, inspiratie, index);
  - de babynest-PR (`id="stoffen"` op kraamcadeauboxen, index);
  - botbescherming (contact.html en het formulier).
- Oude briefs in `docs/wijzigingen/` met "Walvis" blijven zoals ze zijn (historie).

## Open vragen
1. **Raster formulier (blokkerend voor criterium 5; beslist door website-ontwerper, niet door Carst).** Met 8 stoffen + "Een eigen stof" zijn er negen kaarten. Bij 5 kolommen geeft dat op desktop een gat in rij 2 (5 + 4). Een indeling van 3·3·2 met de eigen stof breed eronder geeft op mobiel een gat in rij 3. Mogelijkheden die binnen CLAUDE.md blijven:
   - **(a)** desktop: rij 1 vijf stoffen, rij 2 drie stoffen en "Een eigen stof" over twee kolommen (liggend, zoals nu op mobiel). Mobiel: 3 × 3, met "Een eigen stof" als gewone negende tegel.
   - **(b)** desktop zoals (a). Mobiel: 3 · 3 · 2, met "Een eigen stof" in rij 3 naast de laatste twee stoffen.
   - **(c)** desktop 4 kolommen (2 × 4) met de eigen stof breed eronder. Dat wijkt af van "5 kolommen" in CLAUDE.md, dus daarvoor is overleg met Carst nodig.

   Voorstel van de planner: (a). Het blijft dichtst bij de huidige regels en mobiel wordt een rustig 3 × 3. De ontwerper beslist.
2. **Issuenummer.** Er is geen issue bekend voor deze wens. Als er een is, komt in de pull request `Closes #<nummer>`. Anders verwijst de pull request naar de wens van Carst van 14 nov. 13:30.
3. **Sfeerfoto `pers-stoffen.jpg` (niet blokkerend).** Op de homepage (hero set A) en in de fotorij op Werkwijze staat een foto met onder meer de walvisstof. Dat is geen keuze, dus de foto blijft staan. Een bezoeker kan de stof wel herkennen. Wil Carst of Carien die foto later vervangen? Dan gebeurt dat met een nieuwe bestandsnaam en een eigen wijziging.
4. **Samenloop met andere pull requests (niet blokkerend).** PR #72, de babynest-PR en botbescherming raken `contact.html`, `kraamcadeauboxen.html`, `inspiratie.html`, `index.html` en het formulier. Deze brief verandert alleen losse regels: een `li`, een `label`, een `figure`, een array en het CSS-blok `.stof-kaarten`. `index.html` en `werkwijze.html` blijven ongemoeid. Wie het laatst merget, rebaset. Bij een conflict in de themalijst of de stofkaarten gaat het weghalen van Walvis altijd mee.
5. **Inspiratie (niet blokkerend).** Volgens het besluit gaat het eerder gemaakte werk "Walvis" ook weg. De groep heeft een opmerking "wacht op akkoord Carien" (PR #72). Dit weghalen gaat daar niet tegenin, maar Carien ziet het bij die goedkeuring.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov. 13:30) en het besluit van de hoofdsessie. Plekken met "walvis" in `public/`, `src/`, `tests/` en `scripts/` geïnventariseerd. `pers-stoffen.jpg` blijft (sfeerfoto, geen keuze). Risico hoog (formulier). Ontwerprichting en rasterkeuze (open vraag 1) wachten nog op website-ontwerper |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
