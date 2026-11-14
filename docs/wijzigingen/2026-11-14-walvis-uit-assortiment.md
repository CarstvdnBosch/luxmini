# De stoffen: Walvis weg en één raster

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst
  - 14 nov. 13:30: "Het stofje walvis gaat uit het assortiment. Die mag je weghalen bij stoffen."
  - 14 nov. 13:31, keuzevraag: "afmetingen zijn allemaal verschillend, kunnen we dat afstemmen aan elkaar?" Carst koos "Eén raster" en "Ja, samen": dit komt in dezelfde pull request als Walvis weg.
- **Branch:** `wijziging/walvis-uit-assortiment` (vanaf `origin/main`)
- **Issue:** geen nummer bekend (zie Open vragen)
- **Risico:** hoog. Het formulier verandert: de stofkeuzekaarten en hun raster in `public/contact.html` en de toegestane thema's in `src/formulier.js`. Daarnaast verandert de opmaak van alle drie de rijen op Kraamcadeauboxen (producten, stoffen, thema's). Dat raakt de gedeelde carrouselregels en meerdere bestaande e2e-tests.

## Doel
1. Bezoekers zien en kiezen Walvis nergens meer, omdat Carien die stof niet meer heeft. Zo vraagt niemand een box aan die niet meer gemaakt kan worden.
2. Op Kraamcadeauboxen zijn "002 — Wat er in de box kan" en "003 — Thema's" één rustig geheel. Alle rijen beginnen op dezelfde linkerrand. Producten en stoffen zijn even groot, met een vierkante foto. Thema's zijn precies twee kolommen breed.

## Wens en besluit
- **Walvis weg (Carst, 13:30).** Eerder was al bekend dat Carien Walvis vervangt door een schildpadstof. Daarvan is nog geen stof- of themafoto. Die komt later in een eigen story.
- **Besluit hoofdsessie.** Walvis verdwijnt overal waar hij als keuze of aanbod staat:
  - de stoffenrij (002) en de thema's (003) op Kraamcadeauboxen;
  - de stofkeuzekaarten in het formulier;
  - de toegestane waarde in de Worker;
  - het eerder gemaakte werk op Inspiratie.

  Waar het aantal genoemd wordt, wordt "negen" overal "acht".
- **Eén raster (Carst, 13:31).** Alle rijen op dezelfde linkerrand. Producten en stoffen krijgen dezelfde tegelbreedte met een vierkante foto. Thema's zijn precies twee of drie kolommen breed. De ontwerper kiest twee kolommen, omdat bij drie kolommen de rechterrand nooit gelijk kan lopen. Dat geeft op desktop sets van vier en op tablet sets van twee. De regel "sets van drie" vervalt daarmee.

## Context: meting van website-ontwerper (Chromium, `kraamcadeauboxen.html`)
- **Tot 1440 px beginnen alle rijen al op dezelfde linkerrand.** Op 1440, 1400 en 1280 px is het verschil 0 px.
- **Boven 1440 px schuiven de stoffen en de thema's naar links.** `.wrap` (het label en de producten) rekent met een rand van 8,2 % van de schermbreedte. `.stoffen` en `.themacarrousel` rekenen met 8,2 % van 1440 px. Daardoor beginnen ze 8 px te ver links op 1536 px, 13 px op 1600 px en 39 px op 1920 px. Dat is wat Carst ziet.
- **De rechterranden lopen nergens gelijk.** Producten zijn ca. 132 px breed (3:4), stoffen 200 px, thema's 380 px.
- **Gevolg:** met acht kolommen kunnen de thema's alleen gelijk aan beide randen lopen als een thema precies twee kolommen breed is. Op desktop worden het dus sets van vier (precies twee sets) en op tablet sets van twee. Bij drie kolommen staan er 2⅔ thema's in beeld en kan de rechterrand nooit gelijk lopen.
- **Aandachtspunt voor de preview (Carst):** op 1440 px worden de thema's kleiner, van ca. 390 naar ca. 289 px breed. Ze blijven twee keer zo breed als een product. Vindt Carst ze te klein, dan is dat een vervolgstap. Het alternatief is vier kolommen (sets van twee), maar dat valt buiten zijn keuze "twee of drie".

## Gevonden plekken met Walvis (stand `origin/main`, 14 nov.)
| Plek | Wat | Actie |
|---|---|---|
| `public/kraamcadeauboxen.html` r. 223 | stoftegel Walvis in `#stoffenrij` (`stof-walvis.jpg`) | weg |
| `public/kraamcadeauboxen.html` r. 250 | thema Walvis in `.themacarrousel` (`box-walvis.jpg`) | weg |
| `public/kraamcadeauboxen.html` r. 7 en r. 239 | meta description "in negen thema's", commentaar "de negen thema's" | "acht" |
| `public/contact.html` r. 194 | keuzekaart `box_thema` = `Walvis` | weg |
| `src/formulier.js` r. 49 | `THEMAS` bevat `'Walvis'` | weg |
| `public/inspiratie.html` r. 189 | werk "Walvis" (`box-walvis.jpg`) in groep 004 Kraamcadeauboxen | weg |
| `public/index.html` r. 136, `public/werkwijze.html` r. 135 | foto `pers-stoffen.jpg`, alt "Vier stoffen met prints van vosjes, walvissen en blaadjes" | **blijft**: een sfeerfoto van het atelier, geen keuze of aanbod. De alt-tekst blijft kloppen (zie Open vragen 2) |
| `public/assets/css/style.css` r. 864, r. 1181 | commentaar "negen thema's", "9 stoffen + Een eigen stof = 2 rijen" | bijwerken |
| `public/assets/img/stof-walvis.jpg`, `box-walvis.jpg`, `box-walvis-600.jpg` | daarna nergens meer gebruikt | verwijderen |

## Acceptatiecriteria

### A. Walvis weg
1. **Kraamcadeauboxen, 002:** `#stoffenrij` heeft acht stoftegels, in deze volgorde: Giraf, Vos, Tulp, Wilde blaadjes, Framboos, Regenboog, Wilgentakjes, Blaadjes en bloemen. Alt-teksten en namen van de andere tegels blijven gelijk.
2. **Kraamcadeauboxen, 003:** de `.themacarrousel` heeft acht thema's in dezelfde volgorde als criterium 1. Het gedrag per set staat bij de Ontwerpcriteria (6 en 7).
3. **Teksten:** de meta description van `kraamcadeauboxen.html` noemt "acht thema's". In `public/` staat nergens zichtbaar "negen thema's" of "negen stoffen".
4. **Formulier (`contact.html`):** de groep Thema toont acht stofkaarten (zelfde volgorde als criterium 1), daarna "Een eigen stof" en daaronder "Nog niet gekozen" (standaard aangevinkt).
   - Er is geen radio met `value="Walvis"`.
   - "Een eigen stof" en het blok "Je eigen stof (optioneel)" werken zoals nu (`:has`, foto, link).
   - De indeling van het raster volgt Ontwerprichting 5 (indeling a) en Ontwerpcriteria 11 en 12.
5. **Vooraf invullen:** `contact.html?onderwerp=kraamcadeaubox&thema=walvis#formulier` zet geen thema en laat "Nog niet gekozen" aangevinkt. Dat is het bestaande gedrag van `main.js` voor een onbekend thema; die code verandert niet. `?thema=giraf` en `?thema=eigen` werken zoals nu.
6. **Worker (`src/formulier.js`):** `THEMAS` is `Giraf, Vos, Tulp, Wilde blaadjes, Framboos, Regenboog, Wilgentakjes, Blaadjes en bloemen, Een eigen stof of kleur`.
   - Een verzending met `box_thema=Walvis` neemt geen thema over, net als elke andere onbekende waarde. De verzending zelf slaagt wel.
   - Foto, link en bijlage veranderen niet.
7. **Inspiratie:** de groep 004 Kraamcadeauboxen heeft geen werk "Walvis" meer: tien werken in plaats van elf. Het metselwerk sluit zonder gat aan en werkt bij aanwijzen en op touch zoals nu.
8. **Bestanden:** `stof-walvis.jpg`, `box-walvis.jpg` en `box-walvis-600.jpg` zijn uit `public/assets/img/` verwijderd. Geen bestand in `public/` verwijst er nog naar.

### B. Eén raster
9. Ontwerpcriteria 1–10, 13 en 14 hieronder zijn aantoonbaar gehaald. De bestaande `.carrousel`-regels blijven gelden:
   - scroll-snap;
   - geen zichtbare scrollbalk;
   - knoppen van 44 px alleen met een muis;
   - `aria-disabled` aan begin en eind;
   - Home en End;
   - geen knoppen en geen tabstop als een rij niet scrolt;
   - vegen op touch;
   - zonder JavaScript een dunne scrollbalk.
10. Productfoto's worden vierkant met CSS (`aspect-ratio: 1; object-fit: cover`). Er komen geen nieuwe of bijgesneden bestanden.
    - Knuffel krijgt de klasse `p-knuffel-naam` en Speenkoord de klasse `p-speenkoord-hond`, met de uitsnede uit Ontwerprichting 4. Geen inline `style`.
    - `width` en `height` in de HTML blijven de werkelijke maten van de bestanden.
    - `sizes` van producten, stoffen en thema's passen bij de nieuwe breedtes. Een foto wordt nooit groter getoond dan het bestand.

### C. Tests, sitecontrole en documentatie
11. **E2e, Walvis:**
    - In `tests/e2e/stofkeuze.spec.js` (`THEMAS`) en `tests/e2e/homepage-zoals-stock.spec.js` (r. 42) staat Walvis niet meer in de verwachte lijsten.
    - In de test "na Verwijderen en bij een ander thema" (`stofkeuze.spec.js` r. 182) wordt `kies(page, 'Walvis')` een ander thema, bijvoorbeeld Vos.
    - Een nieuwe controle toetst criterium 5 (`?thema=walvis` geeft "Nog niet gekozen").
12. **E2e, raster:** waar bestaande tests oude maten of indelingen toetsen, volgen ze het besluit van Carst (13:31) en deze brief. De bouwer noemt in het Verloop elke aangepaste verwachting. Het gaat om:
    - de rastertest in `stofkeuze.spec.js` r. 43–54: 3 × 3 met de eigen stof breed wordt 3 × 3 met de eigen stof als negende tegel; op desktop 5 + 3 met de eigen stof over twee kolommen;
    - in `kernpaden.spec.js`: thema's "één set in beeld … 3" wordt sets van vier op desktop en twee op tablet; de productrij van Story 1 met tegels 160/136 px en "2 producten + ≥ 24 px van het derde" wordt Ontwerpcriteria 7 en 8;
    - de stoffenrij in `homepage-zoals-stock.spec.js` r. 147.

    Een nieuwe test, of een uitbreiding van de bestaande, toetst Ontwerpcriteria 1–8, 11–14. Hij draait in de bestaande projecten (desktop, tablet, mobiel, WebKit), plus 1600 en 1920 px voor criteria 1 en 2. Er wordt geen controle geschrapt, behalve die op Walvis zelf en op de vervallen maten en sets.
13. **Unit (`tests/formulier.test.js`):** de testnaam op r. 102 noemt "acht thema's". Een nieuwe controle toetst dat `Walvis` geen geldig thema meer is. Er wordt niets geschrapt.
14. **Sitecontrole (`scripts/controleer.py`):**
    - `THEMAS` (r. 1042) zonder Walvis.
    - Een nieuwe controle meldt een fout als "walvis" (hoofdletterongevoelig) voorkomt in `src/` of in `public/`: HTML, JS, CSS en bestandsnamen in `assets/img/`. Enige uitzondering is exact de alt-tekst van `pers-stoffen.jpg`.
    - De themacontrole (`LEES_THEMAS`/`controleer_themas`) volgt sets van vier op desktop en twee op tablet.
    - Docstring en commentaar met "negen" worden bijgewerkt.
15. **Visueel:** de basisschermen wijken alleen af bij:
    - Kraamcadeauboxen 002 en 003, op alle schermen;
    - de themagroep van het formulier op Contact;
    - de groep Kraamcadeauboxen op Inspiratie.

    De basis wordt bijgewerkt via `visueel-basis.yml`. De bouwer noemt welke schermen.
16. **`CLAUDE.md`:** de bouwer past de tekst aan volgens Ontwerprichting 6, met een verwijzing naar deze brief:
    - de regel bij de Kraamcadeauboxenpagina;
    - de formulierregel over de stofkeuze;
    - "negen" → "acht" bij Mappen.
17. `npm run check` is groen: tests, sitecontrole, axe zonder nieuwe fouten op `kraamcadeauboxen.html`, `contact.html` en `inspiratie.html`, SEO, veiligheid, Lighthouse, visueel en het validatierapport. Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting
*Letterlijk van website-ontwerper (14 nov.). Open vraag 1 van de vorige versie is daarmee beslist: indeling (a).*

1. **Eén raster voor 002 en 003.** Productenrij, stoffenrij en themacarrousel gebruiken dezelfde drie maten:
   - de rand `--rand-px`;
   - de kolom `--kol`;
   - het gat `--gat`.

   Zet ze één keer, op `#in-de-box` en `#themas` of een gedeelde klasse.
   - **Rand:** precies die van `.wrap`. Dus `--rand-px: calc(100cqw * .082)` vanaf 761 px en `var(--rand)` (32 px) op mobiel, nooit `var(--B) * .082`. De binnenbreedte is `W = var(--B) − 2 × var(--rand-px)` en valt zo samen met het label "002 —".
   - **Desktop (≥ 1025 px):** acht kolommen, `--gat: 16px`, `--kol: (W − 7 × 16px) / 8`. Dat is ca. 136 px op 1440, 120 px op 1280 en 93 px op 1025.
   - **Tablet (761–1024 px):** vier kolommen per beeld, `--gat: 12px`, `--kol: (W − 3 × 12px) / 4`. Dat is ca. 151 px op 768 en 205 px op 1024.
   - **Mobiel (≤ 760 px):** `--gat: 12px`, `--kol: min((80cqw − 12px) / 2, 160px)`. Dat is 150 px op 390 en 138 px op 360.
   - Bouw alle drie de rijen op dezelfde manier: zo breed als het ontwerpvak, met `padding-inline` en `scroll-padding-inline` gelijk aan `--rand-px`. Op tablet en mobiel lopen ze veegbaar tot de schermrand, zoals nu.
   - De bestaande `.carrousel`-regels blijven: scroll-snap, geen scrollbalk, knoppen van 44 px alleen met een muis, `aria-disabled`, Home/End.

2. **Producten en stoffen zien er gelijk uit.**
   - Elke tegel is één kolom breed en de foto is vierkant (1:1).
   - Daaronder de naam en bij producten de prijsregel. Die typografie blijft zoals nu.
   - Op desktop staan de acht producten en de acht stoffen elk op één rij van acht binnen de rand. Ze scrollen dus allebei niet: geen knoppen en geen tabstop. Dat doet `main.js` al als `scrollWidth ≤ clientWidth + 1`.
   - Op tablet en mobiel zijn het veegrijen met snap per tegel. De knoppen schuiven één set: vier tegels op tablet, twee op mobiel.

3. **Thema's zijn twee kolommen breed:** `2 × --kol + --gat`, foto 4:3, naam eronder.
   - **Desktop:** sets van vier (= W, precies twee sets), snap op `:nth-child(4n + 1)`.
   - **Tablet:** sets van twee (vier sets), snap op `:nth-child(2n + 1)`.
   - **Mobiel:** één thema per keer, snap per tegel, rechts 30–35 px van het volgende in beeld.
   - De volgende set kijkt alleen in de rand rechts naar binnen, nooit binnen W.
   - Zet `sizes` van foto's, thema's en producten op de nieuwe breedtes. Voorbeeld voor thema's: `(max-width: 760px) 80vw, (max-width: 1024px) 42vw, 300px`. Een foto wordt nooit groter getoond dan het bestand.

4. **Vierkante productfoto's met CSS, zonder nieuwe bestanden.** `.product img` krijgt `aspect-ratio: 1; object-fit: cover`. Standaard staat de uitsnede in het midden; dat werkt goed voor swaddle, broekje, sjaaltje, shirtje en bijtring. Twee foto's krijgen een eigen uitsnede via een klasse op de `img`, geen inline `style`:
   - **Knuffel** (`p-knuffel-naam`): `object-position: 50% 40%`. Dan blijven de oren met "Sem" en de datum, het knoopje en het label "LUX" in beeld.
   - **Speenkoord** (`p-speenkoord-hond`): `object-position: 50% 0`. Dan blijven de clip, de kralen en het hondje in beeld; alleen het koord onderaan valt weg.

   De lijntekening van de douchehandschoen staat in een vierkant vak op grijsblauw. Het svg-blok wordt `height: 70%; width: auto`, gecentreerd. `width`/`height` in de HTML blijven 600 × 800, de werkelijke maat van het bestand.

5. **Formulier, stofkeuze, indeling (a):**
   - **Vanaf 761 px:** vijf kolommen. Rij 1 heeft vijf stoffen. Rij 2 heeft drie stoffen en daarnaast "Een eigen stof" liggend over twee kolommen (`grid-column: span 2`): de tekening links, even breed als een stoffoto in die rij, de tekst rechts en verticaal gecentreerd. De vink staat rechts in het midden.
   - **Mobiel:** 3 × 3, met "Een eigen stof" als gewone negende tegel (vierkante tekening, naam en "Foto of link" eronder). De regel `grid-column: 1 / -1` en de liggende opmaak vervallen op mobiel.
   - "Nog niet gekozen" blijft breed onder het raster en het blok "Je eigen stof" werkt zoals nu.

6. **CLAUDE.md** (de bouwer past dit aan, met een verwijzing naar deze brief):
   - **Kraamcadeauboxenpagina** wordt: "002 Wat er in de box kan en 003 Thema's delen één raster (brief 2026-11-14): de rand van `.wrap`; desktop acht kolommen (gat 16 px), tablet vier per beeld (gat 12 px), mobiel kolom min((80 % − 12 px)/2, 160 px) (gat 12 px). De acht producten en de acht stoffen zijn één kolom breed met een vierkante foto (desktop één rij van acht zonder knoppen en zonder tabstop; tablet en mobiel veegbaar tot de schermrand, knoppen schuiven één set). De acht thema's zijn twee kolommen breed (foto 4:3): desktop sets van vier, tablet sets van twee, mobiel één per keer met een stukje van het volgende; de volgende set kijkt alleen in de rand naar binnen."
   - Dat vervangt "tegels 160 px, mobiel 136 px", "tegels 200 px, mobiel 128 px" en "sets van drie binnen de rand (set = ontwerpvak − 2 × rand …)".
   - **Formulierregel:** "5 kolommen, op mobiel 3 × 3 met 'Een eigen stof' breed eronder" wordt "vanaf 761 px 5 kolommen (5 + 3 stoffen en 'Een eigen stof' liggend over twee kolommen), op mobiel 3 × 3 met 'Een eigen stof' als negende tegel".
   - **Mappen:** "negen" wordt "acht".

## Ontwerpcriteria (toetsbaar)
*Letterlijk van website-ontwerper (14 nov.).*

1. **Linkerrand:** op 360, 390, 768, 1024, 1025, 1280, 1440, 1600 en 1920 px (beginstand, niet gescrold) is de linkerkant van de eerste product-, stof- en themategel gelijk aan de linkerkant van het label "002 —" (± 1 px).
2. **Rechterrand op desktop:** op 1025, 1280, 1440 en 1920 px zijn de rechterkanten van product 8, stof 8 en thema 4 gelijk aan de rechterkant van het label (± 1 px).
3. **Gelijke kolommen:**
   - product en stof zijn even breed (± 0,5 px);
   - een thema is 2 × kolom + gat breed (± 1 px);
   - product n en stof n beginnen op dezelfde x (± 1 px; desktop alle acht, tablet de eerste vier, mobiel de eerste twee).
4. **Vierkant:** elke `.product img`, elke `.product-tekening` en elke `.stof img` heeft hoogte = breedte (± 1 px).
5. **Desktop zonder scrollen:** op 1025, 1280 en 1440 px scrollen `#productenrij` en `#stoffenrij` niet (`scrollWidth ≤ clientWidth + 1`). Hun knoppen zijn verborgen en de rij heeft geen `tabindex="0"`. Op 1024 px hebben ze wel knoppen.
6. **Thema's per set:**
   - op 1440 px staan na laden thema 1–4 helemaal binnen W en begint thema 5 in de rechterrand;
   - na "Volgende" begint thema 5 op de linkerrand (± 1 px) en heeft "Volgende" `aria-disabled="true"`;
   - op 768 px zijn er vier sets van twee;
   - nergens is er een lege set of rechts een lege strook van een thema breed terwijl "Volgende" nog actief is.
7. **Tablet en mobiel:**
   - na één keer "Volgende", Vorige of Home begint de eerste zichtbare tegel van elke rij op de linkerrand (± 1 px); aan het eind (End, of de laatste "Volgende") ligt de laatste tegel op de rechterrand (± 1 px), het spiegelbeeld van de beginstand (aangepast na ontwerpgate 14 nov.);
   - op 390 px staan twee producten en twee stoffen in beeld en is van de derde tegel 25–40 px zichtbaar;
   - van het volgende thema is 25–40 px zichtbaar.
8. **Maten op 390 px:** kolom 150 px (± 1), thema 312 px (± 1). Op geen enkele breedte is een stoftegel breder dan 240 px of een thema breder dan 600 px.
9. **Uitsnede:**
   - knuffel: beide oortoppen en het label "LUX" volledig in beeld;
   - speenkoord: clip en hondje volledig in beeld;
   - douchehandschoen: de tekening volledig binnen het vak, met minstens 10 % ruimte boven en onder.

   Te beoordelen op `m-kraamcadeauboxen` en `d-kraamcadeauboxen` in de ontwerpgate.
10. **Tekst:** op 1025 px past elke productnaam (20 px) en prijsregel (16 px) binnen de tegelbreedte. Afbreken met `&shy;` en een tweede regel mogen; overlopen of afsnijden niet. Hetzelfde geldt voor themanamen op 1025 en 768 px.
11. **Formulier:**
    - op 768 en 1280 px heeft `.stof-kaarten` vijf kolommen en twee rijen;
    - "Een eigen stof" beslaat in rij 2 de kolommen 4–5;
    - de rechterkant van de laatste kaart in elke rij is gelijk aan de rechterkant van het raster (± 1 px).
12. **Formulier op 390 px:**
    - drie kolommen en drie rijen, elke rij gevuld tot de rechterrand (± 1 px);
    - "Een eigen stof" is even breed als de andere kaarten;
    - de themagroep zonder het blok past binnen 390 × 844;
    - namen zijn 16 px en tikdoelen minstens 44 × 44 px;
    - geen horizontaal scrollen.
13. **Geen horizontaal scrollen** van de pagina op 360, 390, 768 en 1024 px (`document.documentElement.scrollWidth ≤ innerWidth`). Alleen de veegrijen zelf mogen breder zijn.
14. **Minder beweging:** knoppen en Home/End springen direct (`scroll-behavior: auto`) en snappen op dezelfde randen als in criterium 1 en 7.

## Bestanden
Zo klein en lokaal mogelijk houden: drie andere pull requests raken dezelfde bestanden (zie Open vragen 3).
- `public/kraamcadeauboxen.html`:
  - Walvis weg uit `#stoffenrij` en `.themacarrousel`;
  - meta description;
  - klassen `p-knuffel-naam` en `p-speenkoord-hond`;
  - `sizes` in 002 en 003.

  Het `id="stoffen"` en de rest van de sectie blijven ongemoeid.
- `public/contact.html`: één `label.stof-kaart` weg (r. 194)
- `public/inspiratie.html`: één `figure.werk` weg (r. 189)
- `public/assets/css/style.css`:
  - de rand- en rastervariabelen (r. 24–30, 46, voor zover nodig);
  - `.producten`, `.stoffen`, `.themacarrousel` en `.product-tekening` (r. 1234–1265, 1396–1428);
  - `.stof-kaarten` (r. 1180–1232);
  - commentaar.
- `public/assets/js/main.js`: alleen als de set-stap (vier op tablet, twee op mobiel, sets van vier/twee bij thema's) niet al volgt uit de bestaande carrousellogica (r. 1300–1330). Liever niet aanpassen.
- `public/assets/img/`: `stof-walvis.jpg`, `box-walvis.jpg`, `box-walvis-600.jpg` verwijderen
- `src/formulier.js`: `THEMAS`
- `tests/formulier.test.js`, `tests/e2e/stofkeuze.spec.js`, `tests/e2e/homepage-zoals-stock.spec.js`, `tests/e2e/kernpaden.spec.js`
- `scripts/controleer.py`: `THEMAS`, de controle op "walvis" en de themacontrole
- `tests/e2e/basis/`: via `visueel-basis.yml`
- `CLAUDE.md`

## Buiten scope
- De schildpadstof (nieuwe stof-/themafoto, naam, plek in de rijen): die komt in een eigen story als de foto's er zijn.
- Nieuwe of bijgesneden productfoto's. Het vierkant gebeurt alleen met CSS; een betere foto van de douchehandschoen blijft op `docs/fotolijst.md` staan.
- Thema's vier kolommen breed (sets van twee op desktop): alleen als vervolgstap als Carst de thema's in de preview te klein vindt.
- `pers-stoffen.jpg` vervangen of bijsnijden, en de alt-tekst daarvan veranderen.
- Geen wijziging aan het vooraf invullen in `main.js`.
- Geen wijziging aan `src/contact.js`, `wrangler.jsonc`, `_redirects`, `_headers` of `.github/workflows/`.
- Niets overnemen uit de lopende pull requests:
  - PR #72 (goedkeuringen: contact, kraamcadeauboxen, inspiratie, index);
  - de babynest-PR (`id="stoffen"` op kraamcadeauboxen, index);
  - botbescherming (contact.html en het formulier).
- Oude briefs met "Walvis" in `docs/wijzigingen/` blijven zoals ze zijn.

## Open vragen
Geen van deze vragen blokkeert het bouwen.
1. **Issuenummer.** Er is geen issue bekend voor de wensen van 13:30 en 13:31. Als er een is, komt in de pull request `Closes #<nummer>`. Anders verwijst de pull request naar de wensen van Carst van 14 nov.
2. **Sfeerfoto `pers-stoffen.jpg`.** Op de homepage (hero set A) en in de fotorij op Werkwijze staat een foto met onder meer de walvisstof. Dat is geen keuze, dus de foto blijft. Een bezoeker kan de stof wel herkennen. Wil Carst of Carien die foto later vervangen? Dan gebeurt dat met een nieuwe bestandsnaam en een eigen wijziging.
3. **Samenloop met andere pull requests.** PR #72, de babynest-PR en botbescherming raken `contact.html`, `kraamcadeauboxen.html`, `inspiratie.html`, `index.html` en het formulier.
   - Deze brief verandert in de HTML alleen losse regels (`li`, `label`, `figure`, klassen, `sizes`).
   - De grootste verandering zit in `style.css`, in de blokken van 002, 003 en `.stof-kaarten`.
   - `index.html` en `werkwijze.html` blijven ongemoeid.

   Wie het laatst merget, rebaset. Bij een conflict gaan het weghalen van Walvis en het raster altijd mee.
4. **Inspiratie.** Volgens het besluit gaat het eerder gemaakte werk "Walvis" ook weg. De groep wacht nog op het akkoord van Carien (PR #72); zij ziet het bij die goedkeuring.
5. **Grootte van de thema's (preview).** Op 1440 px worden de thema's kleiner, van ca. 390 naar ca. 289 px. Vindt Carst ze te klein, dan volgt een vervolgstap (zie Buiten scope).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov. 13:30) en het besluit van de hoofdsessie. Plekken met "walvis" geïnventariseerd; `pers-stoffen.jpg` blijft (sfeerfoto). Bijgewerkt na het besluit van Carst (13:31: "Eén raster", "Ja, samen"): titel, doel, scope en criteria. Ontwerprichting en ontwerpcriteria van website-ontwerper letterlijk overgenomen, indeling (a) voor het formulier. "Sets van drie, laatste set van twee" vervalt: thema's twee kolommen breed (desktop sets van vier, tablet sets van twee). Risico hoog (formulier) |
| Bouwen | website-bouwer | **Walvis weg:** stoftegel en thema op Kraamcadeauboxen, stofkaart in het formulier, `THEMAS` in `src/formulier.js`, werk op Inspiratie (tien werken); `stof-walvis.jpg`, `box-walvis.jpg`, `box-walvis-600.jpg` verwijderd; meta description en commentaar "acht". **Eén raster:** `--rand-px` (100cqw × 0,082, mobiel `--rand`), `--gat`, `--W`, `--kol` op `#in-de-box, #themas`; productenrij, stoffenrij en themacarrousel gebouwd als één regel (breedte ontwerpvak, padding en scroll-padding = rand); thema = 2 × kol + gat, snap 4n+1 (desktop) / 2n+1 (tablet) / elke tegel (mobiel); productfoto's en stoffen vierkant met CSS, `p-knuffel-naam` (50% 40%) en `p-speenkoord-hond` (50% 0), tekening 70% hoog; `sizes` 160px/210px/140px (producten) en 80vw/42vw/300px (thema's). `main.js` niet aangepast: de set-stap volgt uit de bestaande logica (4/2 tegels, 4/2/1 thema's). Formulier indeling (a): vanaf 761 px "Een eigen stof" over kolom 4–5 (tekening = breedte stoffoto, afbreken alleen tussen woorden), mobiel 3 × 3. **Aangepaste verwachtingen (besluit Carst 13:31 / Walvis):** `stofkeuze.spec.js` THEMAS zonder Walvis, `kies('Walvis')` → Vos, rastertest 3 × 3 + eigen stof breed → 3 × 3 met eigen stof als negende tegel en desktop 5 + 3 met eigen stof over kolom 4–5 (eigen kaart mag 2 × 240 + 12 px breed zijn); `homepage-zoals-stock.spec.js` themalijst zonder Walvis, stoffenrij negen → acht en op desktop zonder scrollen/tabstop, C6-knoppen op 1024 px getoetst (op 1440 scrolt de rij niet meer), F4 twee sets van vier (thema 5 i.p.v. 4), afdrukken 25 → 23 foto's; `kernpaden.spec.js` 9 → 8 thema's, "één set in beeld 3" → 4/2/1, "vierde thema ≥ 40 px" → eerste van de volgende set (mobiel 25–40 px), productrij "≥ 24 px van het derde" → 25–40 px; `controleer.py` THEMAS, 11 → 10 radio's `box_thema`, themacontrole sets van vier/twee (thema 5 na Volgende, Volgende dan uit). **Nieuw:** `tests/e2e/raster-kraamcadeauboxen.spec.js` (ontwerpcriteria 1–8, 13, 14, op 360–1920 px), in `stofkeuze.spec.js` `?thema=walvis` en criterium 11 (768/1280), unit "Walvis geen geldig thema", sitecontrole `controleer_walvis` (public/ en src/, uitzondering alleen de alt van `pers-stoffen.jpg`). `CLAUDE.md` bijgewerkt (punt 6). **Lokaal:** `npm test` 135/135 groen; sitecontrole "Geen fouten gevonden"; Playwright Chromium desktop/tablet/mobiel 323 passed, 0 failed (zonder axe-specs: pakket lokaal niet beschikbaar). Niet lokaal: axe, Lighthouse, WebKit (iphone), visueel en validatierapport: in CI. **Visueel (Gate 5, bedoeld):** kraamcadeauboxen (002 en 003, alle schermen), contact (themagroep), inspiratie (groep 004); basis bijwerken via `visueel-basis.yml`. **Open:** End op mobiel legt de laatste tegel tegen de rechterrand (niet de linker): bij 2 tegels + 34 px per beeld kan de laatste set niet op de linkerrand vallen zonder een lege strook rechts; Volgende en Home snappen wel op de linkerrand. |
| Controleren | website-controleur | AKKOORD: Walvis overal weg (ook THEMAS, ?thema=walvis geeft "Nog niet gekozen", 3 afbeeldingen weg), raster gemeten op 360–1920 px (randen ±0,2 px, vierkant, thema 2 kolommen + gat), formulier 5 kol./3 × 3 zonder lege cel, geen horizontaal scrollen; tests niet versoepeld (C6 naar 1024 volgt uit het besluit); npm test 135/135, sitecontrole schoon, Playwright Chromium groen (apart herhaald); axe, Lighthouse, WebKit en visueel in CI |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD: één raster klopt op 360–1920 px; eindstand op mobiel (laatste tegel op de rechterrand, spiegelbeeld van het begin) geaccepteerd, criterium 7 aangepast; Inspiratie 004 en knuffeluitsnede ok; P1 meegenomen door de hoofdsessie: `.stof-naam` breekt af (`hyphens: auto; overflow-wrap: break-word`) zodat "Wilgentakjes" op 1025–1071 px binnen de tegel blijft. Visueel, axe en WebKit uit het validatierapport |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
