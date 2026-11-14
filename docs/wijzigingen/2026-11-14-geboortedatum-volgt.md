# Geboortedatum volgt nog

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (wens 14 nov., issue #69). Beslist: de optie komt bij alle vier de onderwerpen met een product: Kraamcadeaubox, Prematuurkleding, Babynest en Iets op maat laten maken.
- **Branch:** `wijziging/geboortedatum-volgt` (vanaf `origin/main`)
- **Issue:** #69. De pull request bevat `Closes #69`.
- **Risico:** hoog. Het formulier verandert (`public/contact.html`, `src/formulier.js`). PR #73 (botbescherming) raakt `contact.html`, `main.js` en `src/contact.js` en wordt eerst gemerged; de bouwer rebaset daarna op `origin/main` (zie Open vragen 5).

## Doel
Wie een product bestelt voordat het kind geboren is, kan in het formulier aangeven dat de geboortedatum nog volgt. Carien kan het product dan al voorbereiden en weet dat ze eerst belt voordat ze de datum op het product zet.

## Stand nu (`origin/main`, 14 nov.)
| Onderwerp (`data-groep`) | Naam op het product | Datumveld | Opmerking |
|---|---|---|---|
| Kraamcadeaubox | `box_naam` "Naam op het product" | `box_datum` "Geboortedatum of uitgerekende datum" (vrije tekst, max. 60) | enige datumveld in het formulier |
| Prematuurkleding | `prem_naam` "Naam op het kledingstuk" | geen | |
| Babynest | `nest_naam` "Naam op het babynest" | geen | |
| Iets op maat laten maken | geen | geen | alleen maat en "Anders" |

- Groepen tonen zich zonder JavaScript via `:has` op het gekozen onderwerp (`style.css` r. 1161–1170); zonder `:has` staan alle groepen er met "Alleen bij …".
- `src/formulier.js` neemt alleen de velden uit `EXTRA_VELDEN` van het gekozen onderwerp over; keuzevelden alleen met toegestane waarden (`FORMATEN`, `THEMAS`, `MATEN`).
- Alle extra velden zijn optioneel (formulierregel in `CLAUDE.md`).

## Voorgestelde vorm (planner; de ontwerper beslist de opmaak)
- In elk van de vier groepen één **selectievakje** "Geboortedatum volgt nog" met daaronder of ernaast een korte toelichting dat Carien belt voordat ze de datum op het product zet (definitieve tekst: Open vragen 1).
- Veldnamen: `box_datum_volgt`, `prem_datum_volgt`, `nest_datum_volgt`, `op_maat_datum_volgt`; enige waarde `ja`.
- Bij Kraamcadeaubox staat het vakje bij `box_datum`. Het datumveld blijft bruikbaar, want het vraagt ook naar de **uitgerekende** datum en die is juist nuttig als de geboortedatum nog volgt (zie Open vragen 2). Bij de andere drie onderwerpen komt alleen het vakje, geen nieuw datumveld (Open vragen 3).
- Werkt zonder JavaScript: een gewoon `input type="checkbox"` in de groep; geen gedrag dat JavaScript nodig heeft. Eventueel visueel gedrag (bijv. het datumveld dimmen) alleen met `:has`, nooit `disabled` via JavaScript als enige weg.

## Acceptatiecriteria

### A. Formulier (`public/contact.html`)
1. In de groepen Kraamcadeaubox, Prematuurkleding, Babynest en Iets op maat laten maken staat precies één selectievakje met de zichtbare label "Geboortedatum volgt nog" (`name` zoals hierboven, `value="ja"`). Bij "Iets anders" staat het niet.
2. Bij elk vakje staat de toelichting (tekst volgens Open vragen 1), gekoppeld via `aria-describedby`. Er komt geen andere nieuwe tekst bij.
3. Het vakje is optioneel en standaard uit. Een formulier zonder vakje verstuurt precies zoals nu.
4. Kraamcadeaubox: het vakje staat direct bij "Geboortedatum of uitgerekende datum" (onder of naast, volgens de Ontwerprichting). Het datumveld blijft invulbaar, ook met het vakje aan (tenzij Carst bij Open vragen 2 anders beslist).
5. Zonder JavaScript: het vakje is te zien en aan te vinken zodra de groep zichtbaar is (`:has`), en zonder `:has` staat het in elke groep. Verzenden zonder JavaScript zet de regel in de mail (criterium 8).
6. Tikdoel van vakje plus label minstens 44 × 44 px; label en toelichting 16 px; op 390 px geen horizontaal scrollen; volledig met toetsenbord te bedienen (spatie zet aan/uit), zichtbare focus.
7. Met JavaScript (fetch-verzending) blijft de stand van het vakje staan bij een fout, net als de andere velden (brief 2026-11-11-formulier-foutmelding).

### B. Mail aan Carien (`src/formulier.js`)
8. Staat het vakje van het **gekozen** onderwerp op `ja`, dan staat in de mail de regel `Geboortedatum: volgt nog (Carien belt eerst)` (definitieve formulering: Open vragen 1) bij de extra velden van dat onderwerp.
9. Alleen de waarde `ja` telt. Elke andere waarde, of het vakje van een ander onderwerp dan het gekozen, geeft geen regel. Geen regeleinden of vrije tekst uit dit veld in de mail.
10. Bij Kraamcadeaubox met vakje aan én een ingevuld `box_datum` gaan beide regels mee (uitgerekende datum blijft nuttig), tenzij Open vragen 2 anders beslist.
11. Onderwerpregel, bijlage (eigen stof), foutafhandeling en `&reden=…` veranderen niet.

### C. Tests en documentatie
12. **Unit (`tests/formulier.test.js`):** per onderwerp (vier) geeft `ja` de regel; `nee`, `1`, `JA ` met regeleinde en een leeg veld geven geen regel; het vakje van een ander onderwerp (bijv. `nest_datum_volgt=ja` bij onderwerp Kraamcadeaubox) geeft geen regel; bij "Iets anders" nooit een regel; criterium 10 (beide regels). Bestaande tests blijven ongewijzigd groen.
13. **E2e:** een nieuwe of uitgebreide spec (bijv. in `tests/e2e/kernpaden.spec.js` of een eigen `geboortedatum-volgt.spec.js`) toetst:
    - per onderwerp: vakje zichtbaar in de juiste groep, niet bij "Iets anders";
    - verzending met vakje aan via de testmodus (`x-testmail: ok`, `x-testmail-bevat: Geboortedatum: volgt nog`) slaagt, ook zonder JavaScript (`javaScriptEnabled: false`);
    - stand blijft staan na een fout (`x-testmail: fout`);
    - tikdoel ≥ 44 px en geen horizontaal scrollen op 390 px;
    - axe zonder nieuwe fouten op `contact.html`.
14. **Sitecontrole (`scripts/controleer.py`):** als die het aantal of de namen van formuliervelden toetst, bijwerken met de vier nieuwe vakjes; geen controle schrappen.
15. **Visueel:** basisschermen wijken alleen af bij de groepen van het formulier op Contact; basis bijwerken via `visueel-basis.yml`, de bouwer noemt welke schermen.
16. **`CLAUDE.md`:** formulierregel aanvullen met één zin: "Geboortedatum volgt nog (issue #69, brief 2026-11-14-geboortedatum-volgt): bij Kraamcadeaubox, Prematuurkleding, Babynest en Iets op maat een selectievakje (`*_datum_volgt`, alleen `ja`); de Worker zet dan een regel in de mail."
17. `npm run check` is groen. Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting
*Nog in te vullen door website-ontwerper. De planner zet de tekst er letterlijk in. Vragen aan de ontwerper:*

1. **Plek van het vakje** per groep: direct onder het datumveld (box), onder de naam (prematuur, babynest), of als vaste laatste regel van elke groep? Halve of volle breedte in het 2-koloms raster van `.groep`?
2. **Opmaak van het selectievakje:** er is nog geen checkbox-stijl in het formulier (wel radio-keuzekaarten). Eigen vakje in de stijl van `.keuze-kaart`/vink, of een eenvoudig vakje met label? Kleur en contrast op terracotta (kleine tekst in inkt).
3. **Toelichting:** onder het label in kleinere tekst, altijd zichtbaar, of alleen zichtbaar als het vakje aan staat (`:has`)? Met en zonder `:has` moet het begrijpelijk blijven.
4. **Datumveld bij Kraamcadeaubox** als het vakje aan staat: gewoon laten, dimmen (alleen `:has`, geen `disabled`), of het label laten verschuiven naar "Uitgerekende datum"? (Zie Open vragen 2; geen nieuwe tekst zonder akkoord.)
5. **Mobiel 390 px:** volgorde en ruimte, zodat de groep compact blijft.

## Ontwerpcriteria (toetsbaar)
*Nog in te vullen door website-ontwerper.*

## Bestanden
- `public/contact.html`: vier `label`s met checkbox en toelichting in de vier groepen.
- `public/assets/css/style.css`: opmaak van het vakje en eventueel `:has`-regels, in het blok van het contactformulier (r. ~1140–1232).
- `public/assets/js/main.js`: alleen als het bewaren van de invoer bij een fout checkboxes nog niet meeneemt. Liever niet aanpassen (PR #73 raakt dit bestand).
- `src/formulier.js`: vier entries in `EXTRA_VELDEN` plus de controle "alleen `ja`".
- `tests/formulier.test.js`, nieuwe of uitgebreide e2e-spec, eventueel `scripts/controleer.py`.
- `tests/e2e/basis/` via `visueel-basis.yml`.
- `CLAUDE.md` (criterium 16).

## Buiten scope
- Geen nieuw datumveld of naamveld bij Prematuurkleding, Babynest of Iets op maat (tenzij Carst bij Open vragen 3 anders beslist; dan een aparte story).
- Het telefoonveld wordt niet verplicht (zie Open vragen 4).
- Geen datumkiezer (`type="date"`) voor `box_datum`; het blijft vrije tekst.
- Geen tekst op de productpagina's (`kraamcadeauboxen.html`, `prematuurkleding.html`, `babynest.html`) over deze optie.
- Geen wijziging aan `src/contact.js`, `wrangler.jsonc`, `_redirects`, `_headers` of `.github/workflows/`; niets overnemen uit PR #73.

## Open vragen
1. **Tekst (blokkerend voor de bouw van de tekst).** De opdracht geeft alleen de strekking. Voorstel: label "Geboortedatum volgt nog", toelichting "Carien belt je voordat ze de datum op het product zet." en mailregel "Geboortedatum: volgt nog (Carien belt eerst)". Carst bevestigt of past aan. Vallen deze teksten onder de goedkeuring van 14 nov. of moet Carien ze zien?
2. **Uitgerekende datum (blokkerend voor criterium 4 en 10).** Het veld bij de box heet "Geboortedatum of uitgerekende datum". Voorstel: het veld blijft invulbaar naast het vakje, zodat de uitgerekende datum meegaat. Alternatief uit de opdracht: het veld dimmen/optioneel maken. Zonder JavaScript kan CSS het veld niet echt uitschakelen; het zou dan toch meegestuurd worden.
3. **Datum bij de andere onderwerpen.** Prematuurkleding, Babynest en Iets op maat hebben nu geen datumveld (Iets op maat ook geen naamveld). Klopt het dat daar alleen het vakje komt? Of zet Carien daar ook een datum op en is een datumveld gewenst (dan eigen story)?
4. **"Carien belt" zonder telefoonnummer.** Telefoon is optioneel. Moet de toelichting "neemt contact op" zeggen, of moet bij het vakje een hint komen om het telefoonnummer in te vullen? Voorstel: telefoon blijft optioneel; tekst volgens vraag 1. Niet blokkerend.
5. **Samenloop PR #73.** De bouwer start vanaf `origin/main` en rebaset na de merge van #73. Bij een conflict in `contact.html` of `main.js` gaan zowel de botbescherming als de vakjes mee. Niet blokkerend.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit issue #69 (wens Carst 14 nov., alle vier de onderwerpen). Stand opgenomen: alleen Kraamcadeaubox heeft een datumveld (`box_datum`, ook uitgerekende datum). Vorm voorgesteld: selectievakje per groep (`*_datum_volgt`, alleen `ja`), werkt zonder JavaScript; datumveld blijft bruikbaar. Ontwerprichting en ontwerpcriteria open voor website-ontwerper. Risico hoog (formulier). Blokkerend: Open vragen 1 en 2 |
| Ontwerprichting | website-ontwerper | |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (14 nov., keuzevragen in de chat)
1. **Teksten (goedgekeurd):** label "Geboortedatum volgt nog"; toelichting "Carien neemt contact met je op voordat ze de datum op het product zet."; mailregel "Geboortedatum: volgt nog (Carien neemt eerst contact op)". Telefoon blijft optioneel.
2. **Datumveld box:** blijft invulbaar naast het vakje (uitgerekende datum kan mee).
3. **Prematuurkleding, Babynest, Iets op maat:** alleen het vakje, geen nieuw datumveld.

## Ontwerprichting en ontwerpcriteria (website-ontwerper, 14 nov.)

_Letterlijk overgenomen; deze sectie vervangt de lege sectie Ontwerprichting hierboven._

### Tekst voor de sectie "Ontwerprichting" (letterlijk)

1. **Plek.** Bij **Kraamcadeaubox** staat het vakje direct onder "Geboortedatum of uitgerekende datum", in dezelfde kolom. In de HTML komt het na `box_datum` en vóór "Kledingmaat". Vanaf 761 px krijgt het `grid-column: 2`, zodat het onder het datumveld staat; de linkercel van die rij blijft leeg. Bij **Prematuurkleding, Babynest en Iets op maat** is het vakje de laatste regel van de groep, over de volle breedte (`breed`). De tabvolgorde volgt de HTML: naam → datum → vakje → maat bij de box, en de velden → vakje bij de andere drie.
2. **Opmaak: één nieuw patroon `.vakje`, afgeleid van de keuzekaarten.** Opbouw per groep:
   `<div class="datum-volgt [breed]"><label class="vakje"><span class="vakje-vak"><input type="checkbox" name="…_datum_volgt" value="ja" aria-describedby="…-uitleg"><svg class="keuze-vink" aria-hidden="true">…zelfde pad als de keuzekaarten…</svg></span><span class="vakje-tekst">Geboortedatum volgt nog</span></label><p class="eigen-uitleg vakje-uitleg" id="…-uitleg">Carien neemt contact met je op voordat ze de datum op het product zet.</p></div>`
   - **Label:** een rij (`flex-direction: row`, verticaal gecentreerd, gat 12 px), minstens 44 px hoog, zo breed als de inhoud (`width: fit-content`). Het label zelf heeft geen achtergrond.
   - **Vakje:** het echte `input` blijft het element dat de focus krijgt en met de spatie aan en uit gaat. Het krijgt `appearance: none`, 24 × 24 px, een achtergrond `rgba(255,255,255,.92)` zoals de velden, een rand van 1 px in inkt en geen rondingen.
   - **Aangevinkt:** de bestaande inktvink (`.keuze-vink`, 18 px) verschijnt midden in het vakje, net als bij de keuzekaarten. Geen andere kleur en geen animatie.
   - **Focus:** `outline: 2px solid var(--inkt); outline-offset: 3px`, gelijk aan de rest van het formulier.
   - **Labeltekst:** Libre Caslon Text (`var(--serif)`), 16 px, gewicht 400, geen kapitalen, letterafstand normaal, in inkt. Dat is dezelfde letter als de keuzenamen ("Nog niet gekozen", de stofnamen). Op terracotta komt geen witte tekst.
3. **Toelichting altijd zichtbaar**, dus niet alleen als het vakje aan staat. Ze legt uit wat er gebeurt vóórdat je beslist, werkt met en zonder `:has`, en tekst die pas na het aanvinken verschijnt, wordt door schermlezers niet voorgelezen.
   - **Stijl:** de bestaande `.eigen-uitleg` (Source Sans 3, 16 px, regelhoogte 1,45, inkt, max. 60ch).
   - **Plek:** direct onder het label, ingesprongen tot de labeltekst (`padding-left: 36px`, dus 24 px vakje plus 12 px gat), met 2 px ruimte tussen label en toelichting.
   - **Koppeling:** via `aria-describedby`. De toelichting staat buiten het `label`, zodat ze niet dubbel wordt voorgelezen.
4. **Datumveld bij de box blijft zoals het is.** Niet dimmen, niet uitschakelen en het label niet veranderen (besluit Carst 2). Een gedimd veld lijkt uitgeschakeld, terwijl het toch wordt meegestuurd en de uitgerekende datum juist nuttig is. Er komt geen `:has`-gedrag op het datumveld.
5. **Mobiel (≤ 760 px):** één kolom. Bij de box staan naam → datum → vakje met toelichting → kledingmaat onder elkaar, bij de andere drie het vakje als laatste. Het vakje voegt per groep hooguit ca. 115 px toe: label 44 px, 2 px, toelichting op twee regels en het rijgat van 18 px. Er komen geen extra randen, lijnen of vlakken bij. Zonder `:has` staan alle vier groepen er met hun "Alleen bij …"-kop, en dus ook vier vakjes. Dat is de bestaande terugvaloptie en zo bedoeld.
6. **Geen nieuwe hover- of bewegingseffecten.** Alleen `cursor: pointer` op het label. Bij "minder beweging" en zonder JavaScript ziet het vakje er hetzelfde uit en werkt het hetzelfde.

### Tekst voor de sectie "Ontwerpcriteria (toetsbaar)" (letterlijk)

1. In elk van de vier groepen staat precies één `.vakje` met de labeltekst "Geboortedatum volgt nog" en daaronder de toelichting "Carien neemt contact met je op voordat ze de datum op het product zet." Bij "Iets anders" staat er geen vakje.
2. Kraamcadeaubox, vanaf 761 px: de linkerrand van het vakje valt op de linkerrand van het veld `box_datum` (verschil ≤ 1 px), en de bovenkant van het label staat 12–24 px onder de onderkant van dat veld. Op 390 px staat het vakje direct onder `box_datum` en boven "Kledingmaat".
3. Prematuurkleding, Babynest en Iets op maat: het vakje is het laatste zichtbare element van de groep en begint aan de linkerrand van de groep.
4. Het label van het vakje (de klikbare rij) is op 390, 768 en 1440 px minstens 44 px hoog en minstens 44 px breed. Een klik of tik op de labeltekst zet het vakje aan en uit.
5. Het zichtbare vakje is 24 × 24 px (± 1 px), wit (`rgba(255,255,255,.92)`) met een rand van 1 px in inkt. Aangevinkt staat de inktvink in het vakje.
6. Labeltekst en toelichting zijn op elk scherm 16 px, in inkt `#202020` op terracotta (contrast ≥ 4,5:1, axe zonder nieuwe fouten). De labeltekst is gewicht 400 en niet in kapitalen, ook op desktop (de 11 px-kapitalen van `.formulier label` gelden hier niet).
7. De linkerrand van de toelichting valt gelijk met de linkerrand van de labeltekst (± 2 px). Op 390 px loopt de toelichting over hooguit twee regels, op 1440 px over hooguit twee regels bij de box en één regel in een volle rij.
8. Met het toetsenbord: Tab bereikt het vakje direct na `box_datum` (box) of na het laatste veld van de groep (de andere drie). De spatie zet het aan en uit. De focusrand (2 px inkt, 3 px afstand) is te zien.
9. `box_datum` ziet er met en zonder vinkje hetzelfde uit: dezelfde dekking, kleur en labeltekst, geen `disabled` en geen `readonly`.
10. Op 390 px scrolt niets horizontaal en wordt de groep Babynest hooguit 120 px hoger dan nu (nu 225 px).
11. Zonder `:has` (of zonder JavaScript) is het vakje in elke zichtbare groep te zien en aan te vinken, met dezelfde opmaak.
12. Visueel: alleen de schermen met het formulier op Contact wijken af van de basis. Op de andere pagina's verandert niets.

