# Prijstabel kraamcadeaubox

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst
- **Risico:** laag. De wijziging raakt één sectie (`#formaten` op `kraamcadeaubox.html`) met bijbehorende CSS en een extra controle. Het formulier, de Worker, `_redirects`, `wrangler.jsonc` en `.github/workflows/` blijven onaangeroerd.

## Doel
In de sectie "001 — Kies je formaat" ziet de bezoeker nu vier verspringende kolommen. Daarin is lastig te zien wat er per formaat bij komt. Een vergelijkingstabel, gebaseerd op de tabel van de oude site, laat in één oogopslag zien welke producten bij welke prijs in de box zitten.

## Acceptatiecriteria
1. Aan alle 12 ontwerpcriteria hieronder ("Ontwerpcriteria (toetsbaar)") is voldaan.
2. De gegevens in de tabel kloppen met `CLAUDE.md` en met de bron `docs/ontwerp/bron/prijstabel-oude-site.png`:
   - **€ 35:** Knuffel, Swaddle, Broekje (3 producten).
   - **€ 50:** + Sjaaltje (4).
   - **€ 65:** + Shirtje en Douchehandschoen (6).
   - **€ 80:** + Bijtring (7).
3. De oude markup van `.kolommen.vier` in `#formaten` is weg. De regels voor `.kolommen.vier` in `style.css` zijn ook weg, ook in de media queries. Controleer eerst dat `.kolommen.vier` nergens anders voorkomt. `.kolommen` blijft bestaan, met `.kolom:nth-child(2n)` en de mobiele regels, en sectie "003 — Zo werkt het" ziet er onveranderd uit.
4. De menulink "Formaten en prijzen" (`kraamcadeaubox.html#formaten`) brengt je nog steeds naar de sectie. Dat geldt voor `index.html`, `kraamcadeaubox.html`, `privacy.html`, `bedankt.html` en `404.html`. Ook de hero-link "Bekijk de formaten" (`#formaten`) werkt nog. `id="formaten"` en de `data-label` van de sectie zijn ongewijzigd.
5. De meta description van `kraamcadeaubox.html` klopt nog: "Vier formaten vanaf € 35". Pas die alleen aan als de inhoud verandert.
6. `scripts/controleer.py` krijgt een controle die faalt als een van de volgende dingen niet klopt:
   - `#formaten` bevat een `<table>`;
   - `thead` heeft precies 4 prijskolommen met € 35, € 50, € 65 en € 80, in die volgorde;
   - `tbody` heeft precies 7 productrijen: Knuffel, Swaddle, Broekje, Sjaaltje, Shirtje, Douchehandschoen, Bijtring;
   - elke cel heeft het juiste vinkje of streepje volgens criterium 2. Toets dit op de sr-only tekst "inbegrepen" of "niet inbegrepen";
   - de voet toont 3, 4, 6 en 7.
7. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Ontwerprichting

*Overgenomen van website-ontwerper, letterlijk.*

1. **Blijft op terracotta, als rustige tabel in plaats van kolommen.** De sectie `#formaten` blijft in de bovenkant (`section.op-kleur.hero-kleur`), met hetzelfde label `001 — Kies je formaat` en dezelfde `data-label`. Het label blijft staan en de tabel komt ervoor in de plaats van `.kolommen.vier`. Haal de verspringende `padding-top` (`.kolommen > .kolom:nth-child(2n)`) voor deze sectie weg. `.kolommen` blijft bestaan, want sectie 003 gebruikt die nog. Ruim `.kolommen.vier` op als die nergens anders voorkomt. Stijl als in een tijdschrift: dunne lijnen tussen de rijen, geen kaders, geen afgeronde hoeken, geen pastelkleuren van de oude site.

2. **Echte tabel, met de juiste koppen.**
   - `<table>` met een `<caption class="sr-only">`: "Wat zit er in elke kraamcadeaubox, per formaat".
   - In `thead` een eerste `th scope="col"` met `<span class="sr-only">Product</span>`, dus geen lege cel. Daarna vier `th scope="col"` met `€&nbsp;35`, `€&nbsp;50`, `€&nbsp;65` en `€&nbsp;80`.
   - In `tbody` zeven rijen met de productnaam als `th scope="row"`.
   - Een `tfoot` met de rij "Aantal producten": 3, 4, 6, 7. Die rij ziet de bezoeker en hij helpt bij het vergelijken. De getallen staan in de bron, dus ze zijn niet verzonnen.
   - Zet de tabel niet in een container die horizontaal scrolt, en maak hem niet focusbaar.

3. **Hiërarchie en letters.**
   - Eerst de prijzen: Libre Caslon Display, gewicht 400, `clamp(24px, 3.4vw, 48px)`, `white-space: nowrap`.
   - Daarna de productnamen: Source Sans 3, 16 px, gewicht 400, links uitgelijnd.
   - Het aantal producten in de voet in Libre Caslon Text, 16 px.
   - **Prijzen in inkt, niet in wit.** De bovenkant kan na het aanwijzen van de collage perzik of olijf blijven. Wit is daarop onleesbaar (perzik ongeveer 1,9:1). Inkt haalt op terracotta en op alle vijf hoverkleuren meer dan 4,5:1. Volgens `CLAUDE.md` mag wit op terracotta vanaf 24 px, maar het hoeft niet. Hier gaat leesbaarheid voor. Pas daarom de regel `.op-kleur .prijs` in deze tabel aan, of gebruik een eigen klasse.

4. **Vinkjes, en wat niet in de box zit.**
   - **Inbegrepen:** een kleine inline-SVG van een vinkje (ongeveer 18 × 18 px, lijn 1,5 px, kleur `currentColor` = inkt) met `aria-hidden="true"`. Daarnaast `<span class="sr-only">inbegrepen</span>`.
   - **Niet inbegrepen:** een kort, dun streepje van 12 × 1 px in inkt met `aria-hidden="true"`. Daarnaast `<span class="sr-only">niet inbegrepen</span>`.
   - Het verschil zit in de vorm (vinkje of streepje), niet in de kleur. Geen rood en groen, geen vervaagde kruisjes.
   - Alle cellen staan gecentreerd.

5. **Kolommen uit elkaar houden zonder pastel.**
   - De 2e en 4e prijskolom krijgen een zachte band van `rgba(255,255,255,.14)`. Die band loopt van de kop tot en met de voet en werkt op elke hoverkleur. Je kunt hem met `<colgroup>` en `<col>` maken of met `nth-child` op de cellen.
   - Tussen de rijen komt een lijn van 1 px in inkt met `opacity` .2. Dat is hetzelfde idee als de hairlines in `.kern-kolom`.
   - Licht geen kolom extra uit, ook € 80 niet. Dat zou een claim zijn als "meest gekozen", en zo'n claim hebben we niet.

6. **Volgende stap en mobiel.**
   - Onder de tabel komt één pijl-link (`.pijl`, met dezelfde SVG als op de rest van de pagina): **"Kies je thema"** naar `#themas`. Dat is de logische volgende stap: eerst het formaat, dan het thema, dan samenstellen. "Stel je box samen" naar `#contact` staat al in de statementsectie, dus die hoeft hier niet nog eens. WhatsApp blijft via de vaste balk en het menu binnen één klik.
   - Opbouw per scherm:
     - **1440:** de tabel is maximaal 880 px breed en links uitgelijnd met het label. De productkolom is ongeveer 32 %, de prijskolommen zijn gelijk verdeeld. Rijen zijn minimaal 56 px hoog.
     - **768:** de tabel vult de hele contentbreedte (ongeveer 640 px). De productkolom is 34 %. Rijen zijn minimaal 52 px hoog.
     - **390:** `table-layout: fixed; width: 100%`. Bij `--rand: 22px` is de contentbreedte 346 px. De productkolom is 36 % (ongeveer 125 px), elke prijskolom 16 % (ongeveer 55 px). De cellen hebben 4 px padding links en rechts. "Douche&shy;handschoen" krijgt een `&shy;`, zodat het woord netjes op twee regels breekt ("Douche-/handschoen"). Prijzen op 24 px. Rijen zijn minimaal 48 px hoog.

### Ontwerpcriteria (toetsbaar)

1. Op 390 × 844 is `document.documentElement.scrollWidth` ≤ 390, en de tabel is niet breder dan zijn container. Er is ook geen scrollbalk in de tabel.
2. Op 390 staan alle vier de prijzen (`€ 35` tot en met `€ 80`) op één regel in hun kolom, zonder afkappen of overlap. Geen enkele productnaam loopt over de cel heen, en "Douchehandschoen" breekt alleen op het afbreekstreepje.
3. Op 390 past de hele tabel (kop, zeven rijen en de voet) in één schermhoogte van 844 px, als je naar het begin van de sectie scrollt.
4. Productnamen en de rij "Aantal producten" zijn op elk scherm minstens 16 px. Prijzen staan in Libre Caslon Display en zijn minstens 24 px.
5. Alle tekst en tekens in de tabel zijn in inkt (`#202020`). Het contrast is minstens 4,5:1 op terracotta en op perzik, oker, salie, mauve en olijf, ook in de witte banden. In de tabel staat geen witte tekst.
6. De gegevens kloppen. Knuffel, Swaddle en Broekje hebben een vinkje in alle vier de kolommen. Sjaaltje heeft een vinkje vanaf € 50, Shirtje en Douchehandschoen vanaf € 65, Bijtring alleen bij € 80. De voet toont 3, 4, 6 en 7.
7. Toegankelijkheid:
   - de tabel heeft een `<caption>` die alleen schermlezers zien;
   - de prijskoppen hebben `th scope="col"` en de productnamen `th scope="row"`;
   - geen enkele `th` is leeg;
   - elk vinkje en streepje heeft `aria-hidden="true"` en een tekst die alleen schermlezers zien: "inbegrepen" of "niet inbegrepen".
8. Met kleuren uit (grijswaarden) of in de modus met geforceerde kleuren blijft het verschil tussen inbegrepen en niet inbegrepen duidelijk door de vorm (vinkje of streepje).
9. De kolommen zijn alleen te onderscheiden door de witte band op de 2e en 4e prijskolom en door dunne rijlijnen. Nergens staan pastelvlakken, kaders of afgeronde hoeken, en geen enkele kolom is extra uitgelicht.
10. Onder de tabel staat precies één `.pijl`-link, "Kies je thema", naar `#themas`. Er staan geen knoppen. Het label `001 — Kies je formaat` en de `data-label` van de sectie zijn ongewijzigd, en de vaste balk toont dat label.
11. Op 1440 is de tabel maximaal 880 px breed en staat hij links uitgelijnd met het label. Op 768 vult hij de contentbreedte zonder dat de prijzen afbreken.
12. De tabel heeft geen eigen beweging, behalve het bestaande opkomen bij scrollen. Bij "minder beweging" is hij meteen volledig zichtbaar.

### Kanttekening: prijzen in inkt (bewuste keuze)
De ontwerper wijkt hier bewust af van hoe `.prijs` nu wit wordt binnen `.op-kleur`. Dat mag volgens `CLAUDE.md`: wit op terracotta mag vanaf 24 px, maar het hoeft niet. Kleine tekst op terracotta staat sowieso in inkt.

**Correctie van de planner op de redenering:** de bovenkant gaat inmiddels terug naar terracotta zodra je hem verlaat. Zolang je op de bovenkant bent, kan een hoverkleur zoals perzik of olijf nog actief zijn. Daarop is witte tekst onleesbaar. De keuze voor inkt blijft dus staan. Zorg dat `.op-kleur .prijs` elders (als die nog gebruikt wordt) niet verandert. Overschrijf alleen binnen de tabel, of gebruik een eigen klasse.

## Bestanden
- `public/kraamcadeaubox.html`: sectie `#formaten`, markup van `.kolommen.vier` vervangen door `<table>` plus pijl-link.
- `public/assets/css/style.css`: tabelstijl, regels voor `.kolommen.vier` weg (r. 88, 167, 191). `.kolommen` blijft.
- `scripts/controleer.py`: nieuwe controle op de prijstabel.
- `docs/ontwerp/bron/prijstabel-oude-site.png`: bron, nieuw in deze wijziging (alleen meecommitten, niet online).

## Buiten scope
- Prijzen, producten of formaten veranderen.
- Teksten of labels van andere secties veranderen, de meta description herschrijven, menu- of hero-links aanpassen.
- De pastelkleuren, afgeronde kaders of het lettertype van de oude site overnemen.
- Opmaak van `.kolommen` (sectie 003) of `.kern-kolommen` (homepage).
- Het kleurgedrag van de bovenkant in `main.js`.
- Formulier, Worker, `_redirects`, `_headers`, `wrangler.jsonc`, `.github/workflows/`.

## Open vragen
Alle vier besloten (2026-11-02):
- **Volledige tabel of groepen?** Besloten: de volledige tabel per product. Carst vroeg om de originele tabel als basis.
- **Rij "Aantal producten" (3, 4, 6, 7)?** Besloten: de rij blijft. De getallen volgen uit de vinkjes en stonden al op de pagina.
- **"€ 35,-" of "€ 35"?** Besloten: "€ 35", net als de rest van de site.
- **`.lijst-klein` en `.nr` opruimen?** Besloten: alleen als ze echt nergens meer voorkomen. Uitkomst: `.lijst-klein` kwam alleen in `#formaten` voor en is weggehaald (CSS en de opkomen-selector in `main.js`, die nu `.prijstabel` laat opkomen). `.nr` blijft: die staat nog in sectie 003 en op de homepage.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief klaar (2026-11-02), ontwerprichting van website-ontwerper opgenomen |
| Bouwen | website-bouwer | Klaar (2026-11-02). Tabel met caption, scope-koppen, vinkje/streepje met sr-only tekst, band op 2e en 4e prijskolom, pijl-link "Kies je thema". Gemeten: scrollWidth 390/768/1440 = schermbreedte; op 390 tabel 346 px (= container), kolommen 125/55 px, tabel eindigt 511 px onder de sectiestart (< 844); prijzen Libre Caslon Display 24/26/48 px op één regel; namen en voet 16 px; rijen 48/52/56 px; alle tekst en tekens in rgb(32,32,32), contrast min. 5,2:1 (terracotta), met band min. 6,2:1; 1440 tabel 880 px, links gelijk met label. Sectie 003 ongewijzigd (zelfde breedtes en padding). Zonder JS en bij minder beweging direct zichtbaar. `npm test` 6/6, `controleer.py` geen fouten (nieuwe prijstabelcontrole faalt aantoonbaar bij foute data). Let op: webfonts konden in de bouwomgeving niet laden; breedte van de prijzen op 390 is met een vervangende serif gemeten (42 van 47 px). |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | [mens] | |
| Live gezet (merge) | [mens] | |
