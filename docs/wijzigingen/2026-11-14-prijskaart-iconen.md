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


## Ontwerprichting (website-ontwerper, 14 nov.; vervangt de lege sectie hierboven)

_Meting vooraf:_


| Plek | 1440 | 1280 | 768 | 390 |
|


1. **Eén set van zeven iconen, in een vaste volgorde en een vast raster.**
   - **De set:** zeven eigen inline SVG's: knuffel · swaddle · broekje · sjaaltje · shirtje · douchehandschoen · bijtring of speenkoord.
   - **Stijl:** `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.3"`, `stroke-linecap="round"`, `stroke-linejoin="round"`. De tekening blijft binnen 2–22 en heeft geen vlakken. Op 24 px komt de lijn daardoor even dik op het scherm (1,3 px) als die van de douchehandschoen in de productrij, zodat ze als één familie lezen.
   - **Douchehandschoen:** het icoon is een vereenvoudigde versie van de bestaande tekening, met de omtrek, de boord en het lusje. De gestippelde stiklijnen vallen weg, want gestippeld betekent hier "komt erbij" (punt 2).
   - **Bijtring of speenkoord:** dit is één plek met één icoon. Links staat een ring, rechts een kort kralensnoer met een clip, en daartussen een schuine streep, die de "of" uitdrukt. Zo telt niemand acht producten.
   - **Volgorde:** altijd de volgorde van de tabel. Omdat de boxen op elkaar voortbouwen, staat dan vanzelf eerst wat in de box zit en daarna wat erbij komt.
   - **Raster:** het formulier en de kaarten op Kraamcadeauboxen vanaf 761 px gebruiken een raster van 4 kolommen × 2 rijen (`repeat(4, 24px)`, gat 8 px, totaal 120 × 56 px). Rij 1 is knuffel · swaddle · broekje · sjaaltje, rij 2 is shirtje · douchehandschoen · bijtring/speenkoord. Alleen op de compacte mobiele kaarten van Kraamcadeauboxen staan de zeven iconen op één rij (216 × 24 px).

2. **"In de box" tegenover "komt erbij", niet alleen met kleur.**
   - **In de box:** een doorgetrokken lijn in inkt, met dekking 1.
   - **Komt erbij in een duurdere box:** een gestippelde lijn (`stroke-dasharray="2 2"`) met dekking 0,5. Dat geeft op wit ongeveer #8F8F8F, met een contrast van 3,2:1.
   - Het verschil zit dus in het lijnpatroon én in het contrast. Beide zijn inkt (`currentColor`), nooit wit en nooit een paletkleur.
   - Bij € 80 zijn alle zeven doorgetrokken en is er niets gestippeld.
   - Een zichtbare legenda van één regel in 16 px legt dit uit: [doorgetrokken icoon] "in de box" · [gestippeld icoon] "komt erbij in een grotere box". In het formulier staat die direct onder de vier kaarten, op Kraamcadeauboxen boven `.formaten-voet`. De legenda is altijd zichtbaar en `aria-hidden="true"`.

3. **Plaats en gedrag.**
   - **Formulier, met een muis (`hover: hover`):**
     - de iconen staan onder `.keuze-regel` in `.keuze-iconen`;
     - de ruimte daarvoor is altijd gereserveerd en ze verschijnen alleen via `opacity`, nooit via `display` of `height`, dus er is geen sprong in de layout;
     - ze zijn zichtbaar bij `:hover` op de kaart, bij `input:focus-visible` en bij `input:checked`, dus de gekozen kaart houdt zijn iconen (ook na `?formaat=65`).
   - **Formulier, op touch (`hover: none`):** de iconen zijn altijd zichtbaar in alle vier de kaarten. Er is geen informatie die alleen met aanwijzen te zien is (principe 3).
   - **Kraamcadeauboxen vanaf 761 px:**
     - de iconen nemen de plek van het takje in. Dat vak is 48 + 28 px, het raster 56 px, dus de kaart groeit niet;
     - met een muis staat in rust het takje er. Bij `:hover` of `:focus-within` van `.formaat`, dus ook als je met Tab op "Stel deze box samen" komt, vervaagt het takje en verschijnen de iconen;
     - op touch (768 px) is het takje verborgen en staan de iconen er altijd.
     - De vinklijst `.formaat-inhoud` blijft staan als leesbare tekst, met de vinkjes. De iconen hebben geen bijschrift, dus de tekst blijft de bron.
   - **Kraamcadeauboxen op mobiel (≤ 760 px, compact):** de volgorde is prijs + aantal → één iconenrij → de regel "In deze box: …" of "plus: …" → de pijl-link. De iconen zijn altijd zichtbaar. Takje, korte omschrijving en vinklijst blijven weg, zoals afgesproken op 7 nov.
   - **Klikken:** de iconen zijn `pointer-events: none` en liggen onder de onzichtbare radio. Een klik of tik op de iconen kiest dus gewoon de kaart.
   - **Mobiel formulier:** de binnenmarge van de kaart wordt 14 px, zodat het raster van 120 px ook op 360 px past.

4. **Toetsenbord en schermlezers.**
   - **Toetsenbord:** focus geeft hetzelfde beeld als aanwijzen. In het formulier is dat `input:focus-visible ~ .keuze-iconen`, op Kraamcadeauboxen `.formaat:focus-within`. De bestaande focusrand (2 px inkt, offset 3) blijft zoals hij is.
   - **Iconen en legenda:** die zijn `aria-hidden="true"`. De toegankelijke naam van elke radio blijft prijs plus regel.
   - **Extra tekst in het formulier:** elke radio krijgt `aria-describedby` naar een `.sr-only`-tekst buiten het label, zodat de naam niet langer wordt. Die tekst bevat alleen inhoud uit de inhoudsregels:
     - € 35: "In deze box: knuffel, swaddle en broekje. In een grotere box komen erbij: sjaaltje, shirtje, douchehandschoen, bijtring of speenkoord."
     - € 50: "In deze box: knuffel, swaddle, broekje en sjaaltje. In een grotere box komen erbij: shirtje, douchehandschoen, bijtring of speenkoord."
     - € 65: "In deze box: knuffel, swaddle, broekje, sjaaltje, shirtje en douchehandschoen. In de box van € 80 komt er een bijtring of speenkoord bij."
     - € 80: "In deze box: knuffel, swaddle, broekje, sjaaltje, shirtje, douchehandschoen en een bijtring of speenkoord."
   - **Kraamcadeauboxen:** daar komt geen extra tekst bij, want de vinklijst zegt het al.

5. **Beweging en minder beweging.**
   - **Verschijnen:** elk icoon gaat van `opacity 0 → 1` en `translateY(4px) → 0`, in 0,4 s met `cubic-bezier(.45,0,.55,1)`, één voor één met 0,05 s ertussen (`transition-delay` per `:nth-child`). Alles staat er binnen 0,75 s. Dat sluit aan bij de rustige wissels en de linkrij in het menu.
   - **Verdwijnen:** alles tegelijk in 0,2 s, zonder vertraging.
   - **Takje:** vervaagt in 0,4 s.
   - **Touch:** hier beweegt niets, want de iconen staan er al.
   - **Minder beweging (`prefers-reduced-motion: reduce`):** `transition: none` en geen verschuiving. Alles verschijnt direct.
   - Er is geen JavaScript nodig. Alles werkt met `:hover`, `:focus-visible`, `:focus-within`, `:checked` en `@media (hover)`.

6. **Wat niet verandert:**
   - waarden, `name`, volgorde en teksten van de kaarten;
   - de pijl-link en zijn `href`;
   - de salie achtergrond met witte kaarten (nooit terracotta);
   - de productrij en de tekening van de douchehandschoen in 002.

### Ontwerpcriteria (meetbaar)

1. Elk icoon is 24 × 24 px (± 0,5) op 1440, 1280, 768 en 390 px. Het heeft `viewBox="0 0 24 24"`, `stroke-width="1.3"`, `fill="none"`, ronde uiteinden en hoeken, en `aria-hidden="true"`.
2. Elke kaart in het formulier en op Kraamcadeauboxen toont de zeven plekken in de volgorde van de tabel. Het aantal doorgetrokken iconen is 3, 4, 6 en 7 voor € 35, 50, 65 en 80. De rest heeft `stroke-dasharray` en dekking 0,5. Bij € 80 is niets gestippeld.
3. Het formulier op 1440 en 1280 px:
   - het raster is 120 × 56 px (4 + 3, gat 8 px);
   - een kaart is hooguit 190 px hoog en de vier kaarten zijn even hoog;
   - bij aanwijzen en weer verlaten verschuift de bovenrand van `fieldset.stofkeuze` 0 px;
   - in rust is de dekking van de iconen van een niet-gekozen kaart 0, bij aanwijzen 1.
4. Het formulier op 768 px (touch) en 390 px (touch): de iconen zijn zichtbaar zonder aanwijzen (dekking 1). Op 390 px:
   - `.keuze-kaarten` is hooguit 400 px hoog (nu 235 px);
   - het raster valt binnen de kaart, met minstens 12 px marge rechts;
   - de groep Kraamcadeaubox wordt hooguit 180 px hoger (nu 1196 px);
   - een kaart is minstens 44 × 44 px;
   - `scrollWidth` is gelijk aan `clientWidth`.
5. Met het toetsenbord: Tab naar de formaatkeuze, dan pijl naar € 65. Daarna zijn de iconen van € 65 zichtbaar en staat er een focusrand van 2 px. Op Kraamcadeauboxen: Tab naar "Stel deze box samen" van € 50, dan zijn de iconen van die kaart zichtbaar.
6. Voor schermlezers:
   - de toegankelijke naam van de radio € 65 is "€ 65 Met shirtje en douchehandschoen";
   - de beschrijving (`aria-describedby`) is de tekst uit punt 4;
   - axe geeft geen nieuwe fouten op `contact.html` en `kraamcadeauboxen.html`.
7. Kraamcadeauboxen op 1440 en 1280 px: de hoogte van `.formaat` in rust en bij aanwijzen verschilt hooguit 1 px en wijkt hooguit 8 px af van nu (512 en 506 px). In rust is het takje zichtbaar, bij aanwijzen staat het raster op zijn plek en is het takje op dekking 0.
8. Kraamcadeauboxen op 768 px (touch): het takje is verborgen, het raster is altijd zichtbaar en een kaart wordt hooguit 8 px hoger dan nu.
9. Kraamcadeauboxen op 390 × 844 px:
   - één rij van zeven iconen (216 × 24 px), tussen de regel met prijs en aantal en de regel "In deze box/plus:";
   - de afstand van de bovenrand van de kaart van € 35 tot de onderrand van die van € 80 is hooguit 1013 px (1,2 scherm), streefwaarde 800 px (nu 628 px);
   - geen takje, geen vinklijst, en geen horizontaal scrollen.
10. Het verschijnen duurt 0,4 s per icoon, met 0,05 s ertussen, en alles staat er binnen 0,75 s. Bij `prefers-reduced-motion: reduce` is de `transitionDuration` van de iconen en het takje `0s` en zijn ze direct op dekking 1.
11. Contrast op de witte kaart: doorgetrokken iconen halen minstens 4,5:1 (inkt), gestippelde minstens 3:1 (inkt op dekking 0,5 ≈ 3,2:1). Er staan geen witte iconen. De legenda is 16 px en staat in het formulier onder de kaarten en op Kraamcadeauboxen boven `.formaten-voet`.
12. Zonder JavaScript gelden criteria 2–5 en 7–9 ook.

---

**Aandachtspunten:**
- **Of de iconen herkenbaar zijn op 24 px:** vooral knuffel tegenover swaddle, en het gecombineerde icoon van bijtring en speenkoord. Dat kan ik pas in de ontwerpgate beoordelen. Daarom blijven de tekst in de kaart, de vinklijst en de legenda leidend, en zijn de iconen een aanvulling.
- **De gereserveerde lege strook in het formulier:** met een muis staat er in rust onder elke niet-gekozen kaart een lege strook van ongeveer 68 px. Ik vind dat acceptabel omdat de vier kaarten op één rij staan. In de ontwerpgate kijk ik of de ruimte bedoeld voelt.

Er is niets uit het geheugen van de gebruiker gebruikt, en ik heb niets nieuws te melden om op te slaan.