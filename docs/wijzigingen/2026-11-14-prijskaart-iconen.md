# Iconen op de prijskaarten: wat zit erin, wat komt erbij

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst
  - 14 nov., wens bij een screenshot van de formaatkaarten in het formulier: wijs je een prijskaart aan (€ 35 / 50 / 65 / 80), dan verschijnen kleine iconen. Het zijn lijntekeningen, zoals die van de douchehandschoen in de productrij op Kraamcadeauboxen. Ze laten zien wat in die box zit en wat pas in een duurdere box komt. Op touch komt er een alternatief zonder hover.
- **Branch:** `wijziging/prijskaart-iconen` (vanaf `origin/main`)
- **Issue:** #71. De pull request bevat `Closes #71`.
- **Risico:** hoog. De keuzekaarten `box_formaat` staan in het contactformulier (`public/contact.html`). Daarin verandert de opmaak, niet de waarden en niet de Worker. Een fout kan het kiezen, het vooraf invullen (`?formaat=…`) of het verzenden breken.

## Doel
Een bezoeker ziet in één oogopslag wat er in een box van € 35, 50, 65 of 80 zit. Zo ziet ze ook wat ze erbij krijgt als ze een groter formaat kiest. Dat werkt met een muis, op touch en met het toetsenbord.

## Waar de formaatkaarten staan (stand `origin/main`, 14 nov.)
| Plek | Wat | Nu |
|---|---|---|
| `public/contact.html` r. 179–187 | `fieldset.keuzes` "Formaat" in de groep Kraamcadeaubox. Vier `label.keuze-kaart` met `input[type=radio][name=box_formaat]` (35/50/65/80), `.keuze-prijs` en `.keuze-regel` | Prijs en één regel tekst, vink bij `:checked`. Dit is de plek van het screenshot. |
| `public/kraamcadeauboxen.html` r. 134–189 | `#formaten`, 001 Kies je formaat. Vier `li.formaat` op salie met takje, prijs, aantal, regel, pijl-link en `.formaat-inhoud` (vinklijst "In deze box:" / "plus:") | Op mobiel compact, zonder vinklijst en takje (brief 7 nov.). |

**Voorstel voor de scope:** het formulier (`contact.html`) hoort er zeker bij, want daar gaat het screenshot over. De prijskaarten op Kraamcadeauboxen doen alleen mee als Carst dat kiest (Open vraag 1). Mijn voorstel is: wel, met dezelfde set iconen, zodat de bezoeker op beide plekken hetzelfde beeld krijgt. Zonder antwoord bouwt de bouwer alleen het formulier. De criteria onder B gelden dan niet.

## Inhoud per box (bron: Inhoudsregels in `CLAUDE.md`)
| Product | € 35 | € 50 | € 65 | € 80 |
|---|---|---|---|---|
| Knuffel | in de box | in de box | in de box | in de box |
| Swaddle | in de box | in de box | in de box | in de box |
| Broekje | in de box | in de box | in de box | in de box |
| Sjaaltje | komt erbij vanaf € 50 | in de box | in de box | in de box |
| Shirtje | komt erbij vanaf € 65 | komt erbij vanaf € 65 | in de box | in de box |
| Douchehandschoen | komt erbij vanaf € 65 | komt erbij vanaf € 65 | in de box | in de box |
| Bijtring of speenkoord | komt erbij bij € 80 | komt erbij bij € 80 | komt erbij bij € 80 | in de box (één van de twee) |

Deze inhoud verandert niet. Er komen geen nieuwe producten, prijzen of aantallen bij.

## Acceptatiecriteria

### A. Formulier (`contact.html`, altijd in scope)
1. **Iconen bij aanwijzen:** met een muis verschijnen bij het aanwijzen van elke `label.keuze-kaart` in "Formaat" de iconen van alle zeven producten uit de tabel (bijtring en speenkoord volgens Open vraag 3). De producten "in de box" zijn duidelijk anders weergegeven dan de producten die "erbij komen". Hoe precies, staat in de Ontwerprichting.
2. **Touch zonder hover:** op touch (`(hover: none)`) is dezelfde informatie te zien zonder te hoveren, volgens de Ontwerprichting. Geen enkele informatie is alleen met hover bereikbaar.
3. **Toetsenbord:** wie met Tab of de pijltoetsen een formaat kiest of focust, ziet dezelfde iconen als bij aanwijzen. De focusrand blijft zichtbaar.
4. **Geen verandering in het kiezen:** de vier radio's houden `name="box_formaat"` en de waarden `35`, `50`, `65` en `80`. Kiezen met een klik of tik op de kaart (ook op de iconen), het vinkje bij `:checked` en het vooraf invullen via `contact.html?onderwerp=kraamcadeaubox&formaat=65#formulier` werken zoals nu. Een verzending zet "Formaat" in de mail zoals nu (controle met `x-testmail-bevat`).
5. **Toegankelijk:** de iconen zijn `aria-hidden="true"`. De toegankelijke naam van elke radio blijft prijs plus regel. Een eventuele extra tekst voor schermlezers volgt Ontwerpvraag 6. axe geeft geen nieuwe fouten op `contact.html`.
6. **Geen sprong in de layout:** bij aanwijzen en weer verlaten verschuift geen ander veld van het formulier (geen layout shift buiten de kaart, of zoals de Ontwerprichting het toestaat).
7. **Mobiel (390 px):** geen horizontaal scrollen. Tikdoelen blijven minstens 44 × 44 px. De groep Kraamcadeaubox wordt niet langer dan de Ontwerprichting toestaat.
8. **Minder beweging:** bij `prefers-reduced-motion: reduce` verschijnen de iconen direct, zonder animatie.
9. **Zonder JavaScript** werkt criterium 1–4 ook. Liefst alleen met CSS (`:hover`, `:focus-visible`, `:checked`, `@media (hover: none)`).

### B. Prijskaarten op Kraamcadeauboxen (alleen als Carst dat kiest, Open vraag 1)
10. `#formaten` krijgt dezelfde iconen en hetzelfde gedrag als criterium 1–3, 5, 6 en 8. De pijl-link "Stel deze box samen" en zijn `href` blijven gelijk.
11. De regel uit `CLAUDE.md` blijft gelden: op mobiel compact, en € 35 t/m € 80 passen binnen 1,2 scherm (390 × 844). De salie achtergrond en de buurkleuren blijven, en de kaarten staan nooit op terracotta.

### C. Iconen, tests en documentatie
12. **Eigen lijntekeningen:** alle iconen zijn eigen inline SVG's (of één SVG-sprite in `public/`) in dezelfde stijl als de bestaande douchehandschoen (`fill="none"`, `stroke="currentColor"`, ronde lijnuiteinden, lijndikte volgens de Ontwerprichting). Er komen geen foto's, geen nepfoto's, geen iconensets of tekeningen van derden en geen nieuwe externe bestanden of lettertypes. De bestaande tekening van de douchehandschoen mag als basis dienen.
13. **Kleur:** de iconen zijn inkt (`currentColor`) op de lichte achtergrond van de kaart. Ze zijn nooit wit op een lichte paletkleur.
14. **E2e:** een nieuwe test (of een uitbreiding van `tests/e2e/kernpaden.spec.js` of `stofkeuze.spec.js`) toetst criterium 1–4, 7 en 8 in de bestaande projecten (desktop, tablet, mobiel, WebKit). Bij B toetst hij ook criterium 10 en 11. Er wordt geen bestaande controle geschrapt of versoepeld.
15. **Sitecontrole (`scripts/controleer.py`):** de bestaande controle op de vier `box_formaat`-radio's blijft groen. Komt er een controle bij, dan meldt die als een formaatkaart iconen mist.
16. **Visueel:** de basisschermen wijken alleen af bij de formaatkaarten van het formulier op Contact (en bij B bij `#formaten` op Kraamcadeauboxen). De basis wordt bijgewerkt via `visueel-basis.yml`. De bouwer noemt welke schermen.
17. **`CLAUDE.md`:** de bouwer vult de formulierregel (en bij B de regel bij de Kraamcadeauboxenpagina) aan met één zin over de iconen, met een verwijzing naar deze brief.
18. `npm run check` is groen: tests, sitecontrole, axe, SEO, veiligheid, Lighthouse, visueel en het validatierapport. Tests, grenzen en axe-regels worden niet versoepeld.

## Ontwerprichting
*Nog leeg. Website-ontwerper levert de tekst en de toetsbare ontwerpcriteria. De planner zet die hier letterlijk neer, en pas daarna begint het bouwen.*

Vragen aan website-ontwerper:
1. **Waar staan de iconen in de kaart?** Een rij onder `.keuze-regel`, een strook die in de kaart uitschuift, of een laag over de kaart? Groeit de kaart mee bij aanwijzen, of is de ruimte vooraf al gereserveerd (criterium 6)? Hoe groot is een icoon (px) en hoe dik is de lijn, zodat ze naast de douchehandschoen (120 × 160, lijn 1,3) als één familie lezen?
2. **"In de box" tegenover "komt erbij":** hoe maak je het verschil zichtbaar zonder dat het alleen van kleur afhangt? Bijvoorbeeld vol tegenover gestippeld, inkt tegenover lagere dekking, een scheiding met "plus vanaf € …", of alleen de iconen van de eigen box tonen en de rest weglaten?
3. **Volgorde en groepering:** altijd alle zeven in de vaste volgorde van de tabel, of per kaart eerst wat erin zit en dan wat erbij komt? Toon je bij € 80 niets bij "komt erbij"?
4. **Touch zonder hover:** iconen altijd zichtbaar op touch, alleen zichtbaar bij de gekozen kaart (`:checked`), of een andere oplossing? Hoe blijft het compact op 390 px, en welke maximale hoogte geldt voor de groep (criterium 7, bij B criterium 11)?
5. **Toetsenbord en focus:** gelijk aan hover (`:focus-visible` en `:checked`), of anders?
6. **Schermlezers:** is de huidige toegankelijke naam (prijs plus regel) genoeg, of komt er per kaart een korte verborgen tekst bij, zoals "Erbij in een grotere box: …"? Die tekst mag niets nieuws beweren.
7. **Beweging:** hoe komen de iconen op (duur, easing, één voor één of samen)? Sluit dit aan op de rustige wissels in `CLAUDE.md`, en wat gebeurt er bij "minder beweging"?
8. **Kraamcadeauboxen (bij B):** vervangen de iconen daar de vinklijst `.formaat-inhoud` op desktop, of komen ze erbij? Wat gebeurt er met het takje? En hoe blijft de regel "op mobiel compact, binnen 1,2 scherm" overeind?
9. **Bijtring of speenkoord:** één gecombineerd icoon, twee iconen met "of" ertussen, of twee kleine iconen naast elkaar?
10. **Toetsbare ontwerpcriteria:** graag maten en afstanden per breedte (390, 768, 1280 px) die de controleur en de ontwerpgate kunnen meten.

## Bestanden
- `public/contact.html`: de vier `label.keuze-kaart` in "Formaat" (r. 182–185) krijgen iconen. Waarden, `name` en volgorde blijven gelijk.
- `public/assets/css/style.css`: de blokken `.keuze-kaart` / `.keuze-kaarten` (en bij B `.formaat` / `.formaat-inhoud`).
- `public/kraamcadeauboxen.html`: alleen bij B, in `#formaten` (r. 134–189).
- `public/assets/js/main.js`: liever niet. Alleen als de Ontwerprichting iets vraagt dat CSS niet kan.
- `tests/e2e/` (nieuwe of uitgebreide spec), `scripts/controleer.py` (alleen als er een controle bijkomt), `tests/e2e/basis/` via `visueel-basis.yml`
- `CLAUDE.md`

## Buiten scope
- Geen wijziging aan `src/formulier.js`, `src/contact.js`, `src/worker.js`, `wrangler.jsonc`, `_redirects`, `_headers` of `.github/workflows/`. De mail verandert niet.
- Geen nieuwe of andere prijzen, producten, aantallen ("3/4/6/7 producten") of teksten op de kaarten.
- Geen foto's in de kaarten. Ook geen nieuwe foto van de douchehandschoen; die blijft op `docs/fotolijst.md` staan (opname 20).
- De productrij (002) en de lijntekening van de douchehandschoen daar blijven ongemoeid.
- Iconen elders op de site (stofkeuze, Prematuurkleding, Babynest, Inspiratie).

## Open vragen
1. **Blokkerend voor B: welke kaarten?** Alleen de formaatkaarten in het formulier (screenshot), of ook de prijskaarten in 001 op Kraamcadeauboxen? Voorstel: beide, met dezelfde iconen, in deze ene pull request. Zonder antwoord bouwt de bouwer alleen A en C.
2. **Blokkerend voor het bouwen: Ontwerprichting.** Website-ontwerper moet eerst de vragen hierboven beantwoorden, vooral 1, 2 en 4 (het alternatief op touch).
3. **Bijtring of speenkoord bij € 80:** de site zegt "of": er komt één van de twee in de box. Laten de iconen dat ook zo zien (één plek, "of")? Voorstel: ja, zodat niemand denkt dat er acht producten in zitten.
4. **Douchehandschoen:** in `kraamcadeauboxen.html` r. 205 staat bij de lijntekening "wacht op akkoord Carien" (er is nog geen foto). Mag deze tekening ook als icoon op de prijskaarten? Voorstel: ja, want het is een tekening en geen productfoto. Komt er later een foto, dan blijft het icoon een tekening.
5. **Samenloop:** `contact.html` en `style.css` worden ook geraakt door de walvis/raster-PR, PR #72 en botbescherming. Wie het laatst merget, rebaset.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit issue #71 (wens Carst 14 nov., screenshot formaatkaarten in het formulier). Formaatkaarten gevonden in `contact.html` (r. 179–187, `box_formaat`) en `kraamcadeauboxen.html` (`#formaten`, r. 134–189). Scope: formulier zeker, Kraamcadeauboxen volgens Open vraag 1 (voorstel: beide). Inhoud per box uit `CLAUDE.md`. Ontwerprichting nog leeg, met vragen aan website-ontwerper. Risico hoog (formulier) |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluit Carst (14 nov., keuzevraag in de chat)
- **Scope:** formulier (contact.html, formaatkaarten) **én** de prijskaarten op Kraamcadeauboxen (001 `#formaten`). Groep B hoort erbij.
- Niet-blokkerende voorstellen van de planner overgenomen: bijtring of speenkoord als één plek met "of"; de lijntekening van de douchehandschoen mag als icoon dienen.
