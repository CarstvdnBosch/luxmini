# Zo werkt het: je betaalt vooraf

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (wens 14 nov., issue #70)
- **Branch:** `wijziging/vooraf-betalen` (vanaf `origin/main`)
- **Issue:** #70. De pull request bevat `Closes #70`.
- **Risico:** laag. Er verandert één zin in drie bestaande alinea's. Het formulier, de doorverwijzingen, `wrangler.jsonc` en `.github/workflows/` blijven ongemoeid. Wel samenloop met de open babynest-branch (zie Open vragen 2).

## Doel
Een bezoeker weet vóór het eerste bericht dat een bestelling vooraf betaald wordt. Zo is er later geen verrassing, en hoeft Carien het niet steeds zelf uit te leggen.

## Wens en keuze
- **Wens (Carst, 14 nov., issue #70):** in "Zo werkt het" op Kraamcadeauboxen, Prematuurkleding en Babynest staat dat bestellingen vooraf betaald worden. In Cariens toon, kort, met je/jij. Carst gaf als voorbeeld: "Je betaalt vooraf; daarna gaat Carien aan de slag."
- **Huidige blokken (stand `origin/main`):**
  - `kraamcadeauboxen.html` r. 267–288, `004 — Zo werkt het`: 01 Neem contact op · 02 Kies samen thema en maat · 03 Carien gaat aan de slag.
  - `prematuurkleding.html` r. 145–167 en `babynest.html` r. 145–168, `003 — Zo werkt het`: 01 Samen kiezen · 02 Persoonlijk maken · 03 Met zorg gemaakt, met de pijl-link "Meer over de werkwijze".
- **Keuze planner: een zin in een bestaande stap, geen vierde stap.**
  - De reeks is overal drie stappen, met lijn, pijl en een tekenanimatie 01 → 02 → 03 (`main.js` r. 868, `style.css` r. 132). `controleer.py` toetst precies drie `<li>` en de koppen. Een vierde stap breekt dat ritme.
  - De zin komt als **laatste zin van stap 02**, op alle drie de pagina's. Stap 02 is het moment waarop alles is afgesproken; stap 03 is het maken. Zo staat het betalen precies tussen afspreken en maken, en staat het op elke pagina op dezelfde plek.
  - Koppen, nummers en de andere alinea's blijven gelijk.

## Acceptatiecriteria
In deze criteria is **V** de betaalzin: "Je betaalt vooraf; daarna gaat Carien aan de slag." Past de ontwerper de tweede helft aan (Ontwerprichting 2), dan geldt die tekst als V. Het begin "Je betaalt vooraf" blijft altijd staan.

1. **Kraamcadeauboxen:** in `#werkwijze` (`004 — Zo werkt het`) is de alinea van stap 02 precies:
   "Kies het thema, het formaat en de kledingmaat. Met naam en geboortedatum maak je de box helemaal persoonlijk. V"
2. **Prematuurkleding:** in `#zo-werkt-het` (`003 — Zo werkt het`) is de alinea van stap 02 precies:
   "Altijd met naam of eigen detail. V"
3. **Babynest:** in `#zo-werkt-het` (`003 — Zo werkt het`) is de alinea van stap 02 precies:
   "Altijd met naam of eigen detail. V"
4. **Eén keer, op de juiste plek:** op elk van de drie pagina's staat "Je betaalt vooraf" precies één keer in `main`, en alleen in `.stappen > li:nth-child(2) p.klein` van de sectie Zo werkt het. Stap 01 en 03 zijn letterlijk gelijk aan nu.
5. **Ritme blijft:** elke sectie Zo werkt het heeft nog steeds één `<ol class="stappen">` met drie `<li>`, dezelfde koppen, dezelfde nummers en (op Prematuurkleding en Babynest) dezelfde pijl-link "Meer over de werkwijze". Geen nieuwe sectie, geen nieuw label, geen nieuwe `data-label`.
6. **Geen nieuwe feiten:** de wijziging noemt geen betaalmethode, termijn, bedrag, aanbetaling of percentage. Er komt geen `€` en geen cijfer in de stappen bij.
7. **Mobiel (390 × 844):** geen horizontaal scrollen; V is 16 px of groter (zoals de rest van `.klein`) en wordt niet afgesneden. Op 768 en 1440 px staan de drie stappen nog naast elkaar zoals nu.
8. **Sitecontrole (`scripts/controleer.py`):** een nieuwe controle (bijv. `controleer_vooraf_betalen`) toetst criteria 1–4 op alle drie de pagina's, met selectors (sectie met `data-label` "Zo werkt het", `.stappen > li`), niet met regelnummers. De bestaande controles `controleer_stappen` en `controleer_productpagina` blijven ongewijzigd en slagen.
9. **E2e:** een test in `tests/e2e/` (in `kernpaden.spec.js` of een nieuwe `vooraf-betalen.spec.js`) toetst op desktop, tablet en mobiel dat V zichtbaar is in stap 02 van Zo werkt het op alle drie de pagina's, precies één keer, en dat stap 01 en 03 niet veranderd zijn. Er wordt geen bestaande controle geschrapt of versoepeld.
10. **Visueel:** de basisschermen wijken alleen af in de sectie Zo werkt het van `kraamcadeauboxen.html`, `prematuurkleding.html` en `babynest.html`. De basis wordt bijgewerkt via `visueel-basis.yml`; de bouwer noemt welke schermen.
11. `npm run check` is groen (tests, sitecontrole, axe, SEO, veiligheid, Lighthouse, visueel, validatierapport). Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting
*Korte richting van de planner (alleen binnen `CLAUDE.md`). website-ontwerper vult aan of vervangt deze sectie vóór het bouwen.*

1. **Zin, geen stap.** De betaalzin sluit stap 02 af, in dezelfde `.klein`-tekst als de rest van de alinea. Geen vet, geen kleur, geen icoon, geen kader, geen extra regelruimte: het is een feit, geen waarschuwing.
2. **Tekst.** Voorstel: Carsts voorbeeld letterlijk, "Je betaalt vooraf; daarna gaat Carien aan de slag." Aandachtspunt voor de ontwerper: op Kraamcadeauboxen heet stap 03 al "Carien gaat aan de slag", dus de zin herhaalt die kop direct. Mogelijke keuze: daar alleen "Je betaalt vooraf." De ontwerper beslist of de tekst op de drie pagina's gelijk blijft of op Kraamcadeauboxen korter wordt. Geen nieuwe feiten (zie criterium 6).
3. **Hoogte van de stappen.** Stap 02 wordt een regel langer. Op desktop en tablet mag de reeks daardoor niet scheef ogen (koppen en nummers blijven op één lijn); op mobiel staan de stappen onder elkaar en is een regel extra prima.

*[Aanvulling website-ontwerper: nog in te vullen.]*

## Bestanden
- `public/kraamcadeauboxen.html`: één `<p class="klein">` (stap 02, r. 279)
- `public/prematuurkleding.html`: één `<p class="klein">` (stap 02, r. 157)
- `public/babynest.html`: één `<p class="klein">` (stap 02, r. 158). **Alleen deze regel**, zie Open vragen 2. De opmerking `LET OP: wacht op akkoord Carien` (r. 148) blijft staan.
- `scripts/controleer.py`: nieuwe controle + aanroep
- `tests/e2e/kernpaden.spec.js` of nieuw `tests/e2e/vooraf-betalen.spec.js`
- `tests/e2e/basis/`: via `visueel-basis.yml`

Geen wijziging aan `style.css`, `main.js`, `CLAUDE.md`, het formulier of de Worker.

## Buiten scope
- Betaalmethoden, termijnen, aanbetaling, bedragen, een betaallink of betaalknop: niets daarvan wordt genoemd of gebouwd.
- De stappen in `werkwijze.html` (002 Hoe ik werk), de homepage, de contactpagina, het formulier, `bedankt.html` en de privacyverklaring (zie Open vragen 3).
- Een vierde stap of andere opmaak van `.stappen`.
- De herbouw van `babynest.html` (branch `wijziging/babynest-media-en-logo`): niets daaruit overnemen.

## Open vragen
Geen van deze vragen blokkeert het bouwen.
1. **Tekst van de zin.** De brief gebruikt Carsts voorbeeld. Wil Carst (of Carien) een andere formulering, of op Kraamcadeauboxen alleen "Je betaalt vooraf." (Ontwerprichting 2)? Dat ziet hij in de preview; de tests toetsen dan de nieuwe tekst.
2. **Samenloop met de babynest-branch.** `wijziging/babynest-media-en-logo` herbouwt `babynest.html`. Deze brief verandert daar alleen de alinea van stap 02 in Zo werkt het. Wie het laatst merget, rebaset:
   - merget babynest eerst, dan zet de bouwer V als laatste zin in stap 02 van de nieuwe Zo werkt het (of, als die sectie anders is opgebouwd, in de stap vóór het maken, na overleg met de ontwerper);
   - de controle en de test werken met selectors, dus ze overleven de herbouw zolang Zo werkt het drie stappen houdt.
   De babynestteksten zijn nog niet goedgekeurd (`CLAUDE.md`, Inhoudsregels); deze ene zin is de wens van Carst zelf.
3. **Andere plekken.** Moet "vooraf betalen" ook op Werkwijze (002 Hoe ik werk) of in de bevestiging op `bedankt.html` staan? Issue #70 noemt alleen de drie productpagina's; dat kan een eigen story worden.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit issue #70 (wens Carst 14 nov.). Huidige Zo werkt het-blokken gelezen: overal drie stappen met lijn, pijl en tekenanimatie, getoetst door `controleer.py`. Gekozen: de betaalzin als laatste zin van stap 02 op alle drie de pagina's, geen vierde stap. Babynest beperkt tot één regel vanwege de open herbouwbranch. Korte ontwerprichting van de planner; aanvulling van website-ontwerper volgt. Risico laag |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Aanvulling hoofdsessie (14 nov.)
- Op Kraamcadeauboxen heet stap 03 al "Carien gaat aan de slag". Daar wordt de zin alleen **"Je betaalt vooraf."** (geen herhaling van de kop). Criterium 1 wordt: de alinea van stap 02 eindigt op "…maak je de box helemaal persoonlijk. Je betaalt vooraf." Prematuurkleding en Babynest houden de volledige zin.
- Ontwerprichting: de korte richting van de planner volstaat; de ontwerper beoordeelt in de ontwerpgate.
