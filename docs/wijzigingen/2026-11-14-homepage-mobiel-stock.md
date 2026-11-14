# Homepage op mobiel zoals Stock: drieluik met foto als achtergrond, Handwerk als veegbaar object, Instagram als eigen post

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst, feedback op mobiel met schermafdrukken:
  - 22:45 en 22:47: drieluik 001 Producten en 002 Handwerk;
  - 22:48: 004 Instagram.
- **Branch:** `wijziging/homepage-mobiel-stock-2` (vanaf `origin/main`). De naam zonder `-2` is al gebruikt voor de mobiele homepage van 7 nov. (brief `2026-11-07-homepage-mobiel-stock.md`).
- **Story / issue:**
  - onderdeel A en B: story 9 ("homepage mobile like Stock");
  - onderdeel C: story 6 ("Instagram more flashy", feedback 12 nov.).
  - Issuenummers zijn niet bekend (zie Open vraag 6).
- **Risico:** midden. Alleen de homepage verandert, en alleen op mobiel. Wel krijgen `style.css` en waarschijnlijk `main.js` nieuwe regels (tabjes en vegen bij Handwerk). Daarnaast veranderen bestaande verwachtingen in tests en in de sitecontrole, omdat Carst het besluit van 7 nov. terugdraait. Het formulier, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt.

## Doel
Op een telefoon voelt de homepage meer als een tijdschrift, zoals Stock:
- elk product (001) vult het scherm, met de foto als achtergrond en de tekst erop;
- Handwerk (002) laat per keer één mooi gepresenteerd object zien, waar je doorheen veegt;
- Instagram (004) ziet eruit als een verzorgde post van het atelier, die uitnodigt om te volgen.

## Wens en besluit
- **A · Drieluik 001 Producten (Carst, 22:45).** "De drie foto's [moeten], zoals op Stock op mobiel, in beeld gebracht worden: op de achtergrond, tekst voorop."
  - Stock (`stock-kernwaarden.jpg`): elk blok vult het scherm. De foto is de achtergrond, met een donkere sluier. Daarop staan het nummer, een grote witte kop en een witte alinea.
  - LUX nu (`lux-drieluik.jpg`): de foto staat boven, met de tekst eronder op perzik en oker.
  - **Dit vervangt het besluit van 7 nov.** In de brief van 7 nov. ("Ter beoordeling door Carst", optie A/B) en in `CLAUDE.md` staat: "op mobiel blijft het drieluik foto boven tekst". Carst kiest nu uitdrukkelijk optie B.
  - De grotere babynestfoto, die in die brief nog ontbrak, komt met de babynest-PR (`babynest-boven.jpg`, 768 × 960).
- **B · 002 Handwerk (Carst, 22:47).** "Vervolgens komen er 3 foto's welke je kunt swipen van links naar rechts. Ook hier op mobiel het design volgen van Stock. Dit mag op een magazine-achtige manier of het gevoel geven van een pakketje."
  - Stock (`stock-media.jpg`, "003 — Stock in de media"): op een effen kleurvlak staat één object in het midden (een opengeslagen magazine met schaduw). Daaronder een grote gecentreerde kop, een pijl-link in een kader en tabjes in spatiekapitalen; het actieve tabje is onderstreept.
  - LUX nu (`lux-handwerk.jpg`): vier kaarten in een veegrij ("Warm en eigen / Belettering", …), met de rand van de volgende kaart in beeld.
  - Ook dit vervangt het besluit van 7 nov. ("blijft Handwerk kaarten met foto").
- **C · 004 Instagram (Carst, 22:48).** "mag een Instagram-uitstraling krijgen. Een soort coole advertentie op Instagram."
  - LUX nu (`lux-instagram.jpg`): label, grote foto, kop "Volg het atelier op Instagram", alinea en pijl-link "@luxmini2020".
  - Richting van de hoofdsessie: het blok lijkt een eigen post van @luxmini2020:
    - een profielregel met een rond avatar en de accountnaam;
    - de foto;
    - een rij gewone iconen (hartje, reactie, delen) als eigen lijntekeningen;
    - de bestaande kop en tekst als bijschrift;
    - de pijl-link naar het profiel.

    Geen Instagram-logo en geen nagemaakt merkbeeld: het blijft duidelijk de eigen LUX-site.
- **Dubbel label (gezien in `lux-handwerk.jpg` en `lux-instagram.jpg`).**
  - "002 — Handwerk" en "004 — Instagram" staan twee keer onder elkaar: in de vaste balk en als sectielabel (`p.label`) direct daaronder.
  - Oorzaak: de balk toont `data-label` van de huidige sectie, en de sectie heeft zelf ook een zichtbaar `p.label`. Zodra de bovenkant van de sectie net onder de balk staat, zie je ze allebei.
  - Dat geldt in principe voor elke sectie met een eigen label, op alle pagina's. Op Stock (`stock-media.jpg`) staat het label maar één keer.
  - Zie Ontwerprichting D en Open vraag 4.
- **Schermafdrukken** (tijdelijke scratchpad; die map kan worden gewist): `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-mobiel/` (`stock-kernwaarden.jpg`, `lux-drieluik.jpg`, `stock-media.jpg`, `lux-handwerk.jpg`, `lux-instagram.jpg`).

## Afhankelijkheid: babynest-PR
- De branch `wijziging/babynest-media-en-logo` (PR volgt) verandert het drieluik al. De babynestkolom krijgt `babynest-boven.jpg` in `.kern-beeld`, en `.nest-lijst` met `ig-babynest.jpg` verdwijnt.
- Die branch verandert ook het header-logo (groot "LUX" dat krimpt). Dat raakt de bovenkant van elk blok op mobiel.
- Bovendien heeft hij een boek/magazine/tablet-aanpak met kaft (`babynest.html`), die bij onderdeel B misschien te hergebruiken is.
- **De bouwer begint pas als de babynest-PR gemerged is.** Hij rebaset deze branch dan op de nieuwe `main` en schrijft in het Verloop op welke commit hij heeft gebouwd.
- De regel "Homepage, drieluik (wens Carst 14 nov.)" uit die PR wordt in `CLAUDE.md` samengevoegd met de nieuwe tekst (zie criterium 14).

## Acceptatiecriteria
Alleen op mobiel: ≤ 760 px, en telefoons liggend volgens de bestaande mobiele regel (touch met hoogte ≤ 500 px). Gemeten op 360 × 740, 390 × 844, 390 × 664 (WebKit/iPhone), 430 × 932 en 844 × 390, tenzij anders vermeld.

### A · 001 Producten
1. **Foto als achtergrond.** Elk van de drie producten (Kraamcadeauboxen, Prematuurkleding, Babynest) is een eigen blok.
   - De foto vult het hele blok als achtergrond (`object-fit: cover`), met een donkere sluier.
   - Daarop staan, in deze volgorde: nummer (01/02/03), kop (h2), de bestaande zin en de pijl-link.
   - Er staat geen kleurvlak meer onder de foto.
2. **Hoogte en leesbaarheid.**
   - De blokhoogte, de plek van de tekst, de sterkte van de sluier en de breedte van de tekstkolom volgen de Ontwerprichting.
   - Alle tekst in het blok is wit. Kop en nummer halen minstens 3:1 tegen de foto met sluier, op elke plek onder de tekst.
   - De zin en de pijl-link (16 px) halen minstens 4,5:1, of de Ontwerprichting maakt ze groot genoeg voor 3:1.
   - axe vindt geen fout.
3. **Teksten en links blijven gelijk.**
   - De koppen, zinnen en pijl-links blijven letterlijk zoals ze zijn, met dezelfde `href`'s.
   - De ankers `#kraamcadeauboxen`, `#kraamcadeaubox`, `#prematuurkleding`, `#prematuur` en `#babynest` landen op het juiste blok, met de kop onder de vaste balk.
   - Tikdoelen zijn minstens 44 px.
4. **Foto's.**
   - Er komen geen nieuwe of bijgesneden bestanden; het kader komt uit CSS.
   - `sizes` en `srcset` laden op een 3×-scherm de grootste beschikbare versie. Geen enkele foto wordt in CSS-pixels groter getoond dan het bestand.
   - De foto's blijven `loading="lazy"`, behalve als de Ontwerprichting anders zegt.
5. **Balk.** Boven deze blokken toont de balk het logo dat bij een donkere foto past: wit logo, label leesbaar.

### B · 002 Handwerk
6. **Eén item per keer.** In plaats van de kaartenrij staat er telkens één item.
   - Het item heeft een object (zie Ontwerprichting B) op een effen kleurvlak, met daaronder de naam als grote gecentreerde kop en de productregel.
   - Het aantal items volgt Open vraag 2. De bouwer begint met de vier bestaande items.
7. **Wisselen.**
   - De bezoeker wisselt van item door te vegen (links/rechts) en met tabjes onder het item.
   - De tabjes zijn een `role="tablist"` met `role="tab"`, `aria-selected`, `aria-controls` en een `tabpanel` per item. Pijl links/rechts, Home en End werken.
   - Elk tabje is minstens 44 × 44 px. Het actieve tabje is onderstreept (1 px).
   - Alle tabjes passen naast elkaar op 360 px, zonder horizontaal scrollen van de pagina.
   - Er wisselt niets vanzelf.
8. **Links.**
   - Elk item linkt naar dezelfde pagina als nu: `werkwijze.html#personaliseren`, `inspiratie.html#siliconen`, `prematuurkleding.html` en `inspiratie.html#textiel`.
   - De pijl-link "Zo personaliseert Carien" blijft onder het blok staan.
   - Er komen geen nieuwe linkteksten, behalve als Carst die goedkeurt (Open vraag 3).
9. **Bestaande foto's.** Er komen alleen bestaande foto's uit dit blok (`pers-naam.jpg`, `p-bijtring-*`, `p-broekje-kleur*`, `p-shirtje-kleur*`, `p-knuffel-naam*`, `pers-sjaaltje-naam.jpg`) in het object.
   - Geen nep-tijdschrift dat persaandacht suggereert. Een eigen "LUX mini"-lookbook of een pakketje mag.
   - Het object en de bijbehorende onderdelen van de babynest-PR worden hergebruikt waar dat past, niet nagebouwd (zie Ontwerprichting B).
10. **Minder beweging en zonder JavaScript.**
    - Bij "minder beweging" wisselen de items direct, zonder schuiven of overvloeien.
    - Zonder JavaScript zijn alle items bereikbaar: onder elkaar, of als veegrij met scroll-snap. Alle namen en links zijn zichtbaar.

### C · 004 Instagram
11. **Eigen post.** Het blok is opgebouwd als een post. Van boven naar beneden:
    - een profielregel: rond avatar en "luxmini2020";
    - de foto `ig-outfit-ladder.jpg` (uitsnede met CSS, zie Ontwerprichting C);
    - een rij iconen: hartje, reactie, delen;
    - als bijschrift de bestaande kop "Volg het atelier op Instagram" en de zin "Nieuwe stukjes uit het atelier, zo van de naaimachine.";
    - de pijl-link "@luxmini2020" naar `https://www.instagram.com/Luxmini2020/`.
12. **Geen nagemaakt Instagram.**
    - Geen Instagram-logo, geen kleurverloop van Instagram en geen nagemaakte interface.
    - Geen verzonnen aantallen (likes, volgers, reacties) en geen verzonnen reacties of datum.
    - De iconen zijn eigen lijntekeningen, `aria-hidden="true"` en niet focusbaar. Het zijn geen knoppen die iets lijken te doen.
    - Het blok gebruikt de letters en kleuren van LUX mini.
13. **Toegankelijk.**
    - De foto houdt een beschrijvende `alt`.
    - Het profiel wordt maar één keer voorgelezen; avatar en naam samen staan niet dubbel als link.
    - Tikdoelen zijn minstens 44 px. Kleine tekst haalt 4,5:1.

### Voor alle onderdelen
14. **`CLAUDE.md`** is bijgewerkt (bouwer, met verwijzing naar deze brief):
    - **Homepage-regel:** de zin "(op mobiel blijft het drieluik foto boven tekst en blijft Handwerk kaarten met foto: … besluit 7 nov.)" vervalt. "op touch foto boven de tekst" en "op touch kaarten" worden aangepast.
    - **Nieuwe tekst** voor mobiel (drieluik, Handwerk, Instagram), van website-ontwerper.
    - **Witte tekst:** de regel krijgt de mobiele drieluikblokken als uitzondering ("tekst op een donkere foto"), met de toegestane tekstmaten.
    - **Samenvoegen** met de regel "Homepage, drieluik (wens Carst 14 nov.)" uit de babynest-PR.
15. **Desktop en tablet blijven gelijk.** Op 761 px en breder zien drieluik, Handwerk en Instagram er hetzelfde uit; de visuele basis voor desktop en tablet wijkt niet af. Uitzondering: als Carst Open vraag 9 met "ja" beantwoordt, ook Instagram op desktop.
16. **Geen horizontaal scrollen** van de pagina op alle genoemde schermen (`document.documentElement.scrollWidth === innerWidth`). Alleen een veegrij zelf mag breder zijn.
17. **Dubbel label.** Op 390 × 844 staat het label van een sectie nooit twee keer tegelijk in beeld, of de ontwerper legt in de Ontwerprichting vast waarom het zo blijft (Open vraag 4). Geldt minstens voor 002 en 004 op de homepage.
18. **Tests.**
    - Bestaande toetsen voor het oude gedrag op mobiel ("drieluik foto boven tekst", "babynestfoto ≤ 324 px" voor zover nog aanwezig, "Handwerk kaarten met witte naam 24 px en productregel 19 px", de veegrij `.sfeer-kaarten`) krijgen alleen een andere verwachte waarde, omdat Carst het besluit van 7 nov. terugdraait. Het gaat om `tests/e2e/mobiel-ontwerp.spec.js`, `tests/e2e/homepage-zoals-stock.spec.js` en `scripts/controleer.py`. De bouwer noemt elke aanpassing in het Verloop.
    - Er komen nieuwe toetsen voor criteria 1–17.
    - Geen enkele grens of axe-regel wordt versoepeld.
19. **Visueel.** De basis voor mobiel wijkt bewust af bij 001, 002 en 004 op de homepage en wordt bijgewerkt via `visueel-basis.yml`. De basis voor desktop en tablet blijft gelijk.
20. **Harness.** `npm run check` is groen. Wat alleen in CI draait (axe, Lighthouse, WebKit/iPhone, visueel) staat in het Verloop.

## Ontwerprichting
*Nog in te vullen door website-ontwerper. De planner zet de tekst hier letterlijk neer, met toetsbare ontwerpcriteria en de tekst voor `CLAUDE.md`. Hieronder staan de vragen die de ontwerper beantwoordt.*

**A · Drieluik 001 Producten (mobiel)**
1. **Blokhoogte.** 100svh, een vaste verhouding (bijv. 4:5) of min/max? Let op: `p-broekje-kleur.jpg` is 900 × 1200 en `babynest-boven.jpg` 768 × 960. Schermvullend op 390 × 844 worden ze op een 3×-scherm zacht, maar in CSS-pixels niet vergroot. Wat is acceptabel?
2. **Sluier.** Hoe sterk (55 % zoals Handwerk en het drieluik op desktop, of donkerder) en in welke vorm (vlak of verloop onder de tekst)? `p-broekje-kleur.jpg` is een wit broekje op lichtgrijs en `hero-box-open.jpg` heeft veel mintgroen vloeipapier, dus witte tekst heeft daar weinig contrast.
3. **Contrast van de kleine tekst.** De zin en de pijl-link zijn 16 px. `CLAUDE.md` staat witte tekst alleen toe vanaf 24 px, met als uitzondering "tekst op een donkere foto". De brief van 7 nov. zei: "kleine witte tekst op een foto valt buiten de uitzondering". Wordt het 4,5:1 met een sterkere sluier, of een grotere zin?
4. **Tekst.** Plek in het blok (boven zoals Stock, midden of onder), breedte van de tekstkolom en grootte van de kop.
5. **Uitsnede per foto** (`object-position`), en of de foto bij binnenkomst inschuift of stil staat.
6. **Kleurlaag en balk.** Krijgen de blokken nog perzik, oker en mauve als `data-achtergrond` (zichtbaar bij laden en achter de balk)?
7. **Telefoon liggend (844 × 390).** Past een blok met kop en tekst, of geldt daar iets anders?

**B · 002 Handwerk (mobiel)**
1. **Het object.** Magazine-achtig (eigen "LUX mini"-lookbook) of het gevoel van een pakketje? Voorstel om te toetsen: elk item heeft al twee foto's (groot en klein), die samen een spread kunnen vormen. Welke onderdelen van de boek- en magazine-aanpak van de babynest-PR (kaft, spread, schaduw, CSS-klassen) worden hergebruikt? Kaften alleen met "LUX mini" en eigen tekst; niets wat persaandacht suggereert.
2. **Kleurvlak per item.** De bestaande diepe tinten (`--kaart-kleur`: perzik #C88654, salie #839C75, olijf #999575, mauve #AE8C94) of de lichte paletkleuren? Met wit of inkt? Doet het vlak mee met de kleurlaag?
3. **Kop en productregel.** Maten en kleur; mag de productregel weg als die als tabje terugkomt?
4. **Tabjes.**
   - Welke tekst: de productregels (Belettering · Siliconen items · Prematuurkleding · Borduren) of de namen?
   - Vier tabjes in spatiekapitalen passen niet naast elkaar op 360 px ("PREMATUURKLEDING" is lang). Wat dan: kortere spatiëring, twee regels, of een veegbare tabrij?
   - Bevestig `tablist`/`tab`/`tabpanel` met `aria-selected`.
5. **Wisselen.** Vegen met scroll-snap (een rij die je ziet bewegen) of overvloeien? Hoe gaan het vegen en de tabjes samen? Pijlknoppen met een muis zoals `.carrousel`?
6. **Kader om de pijl-link** (zoals Stock "Bekijk magazines"). Story 5 (pijl-link met kader bij aanwijzen) raakt dit. Hier wel of niet, en hoe sluit het daarop aan zonder dat het een opvallende knop wordt?
7. **Aantal items** (Open vraag 2): drie of vier, en zo drie, welke valt weg?

**C · 004 Instagram (mobiel)**
1. **Avatar.** Het LUX-logo (`logo-luxmini-donker.png`) in een cirkel, of de foto van Carien (`over-carien*.jpg`)? Zie Open vraag 5.
2. **Foto.** Vierkant (1:1) of staand (4:5)? Het bestand is 480 × 640 (3:4) en wordt op 326 px breed al bijna 1,5× uitgerekt op een 3×-scherm. Een groter bestand ontbreekt (`CLAUDE.md`: "Nog open: originele (grotere) bestanden van de Instagram-foto's").
3. **Kaart of vrij.** Een kader of witte kaart om de post (op grijsblauw), of vrij op het vlak? Afstanden, lettermaat van de accountnaam en het bijschrift.
4. **Iconen en bijschrift.** Lijndikte en maat van de iconen, en hoe ze duidelijk decoratief blijven. Bijschrift: blijft de kop groot (kop-l), of wordt het een kleiner bijschrift met de kop vet ervoor, zoals in een post?
5. **Desktop.** Is er een goede reden om dit ook op desktop te doen? Zo ja, alleen als vraag aan Carst (Open vraag 9).

**D · Dubbel label**
1. Is het dubbele label (balk en `p.label` tegelijk in beeld) bedoeld? Op Stock staat het maar één keer.
2. **Voorstel:** op mobiel vervaagt het `p.label` van de sectie zodra de balk hetzelfde label toont, of het label staat op dezelfde plek als het balklabel. Het label blijft wel in de DOM voor schermlezers.
3. Geldt dit alleen voor de homepage, of overal? Dat laatste is waarschijnlijk een eigen story.

## Bestanden
- `public/index.html`:
  - 001: de opmaak van de blokken, voor zover CSS niet genoeg is;
  - 002: het object, de tabjes en de panelen;
  - 004: profielregel, iconen (inline svg) en bijschrift.
- `public/assets/css/style.css`: alleen binnen de mobiele mediaquery (≤ 760 px en telefoons liggend): `.kern-kolom` en `.kern-beeld`, Handwerk (`.sfeer-kaarten` of een nieuw blok), `.insta-blok`, en eventueel `.label` en de balk (dubbel label).
- `public/assets/js/main.js`: de tabjes en het vegen bij Handwerk (liefst de bestaande tablogica of `.carrousel` hergebruiken) en eventueel het dubbele label.
- `tests/e2e/mobiel-ontwerp.spec.js`, `tests/e2e/homepage-zoals-stock.spec.js`, eventueel een nieuwe spec; `scripts/controleer.py`
- `tests/e2e/basis/`: via `visueel-basis.yml`
- `CLAUDE.md`

## Buiten scope
- Desktop en tablet (≥ 761 px) van drieluik, Handwerk en Instagram, behalve als Carst bij Open vraag 9 "ja" zegt voor Instagram.
- De hero, 003 Inspiratie en de andere pagina's.
- Het dubbele label buiten de homepage. Als de oplossing overal zou gelden, wordt dat een eigen story.
- Nieuwe of andere foto's, teksten, linkteksten, quotes of cijfers. Grotere Instagram-bestanden blijven op `docs/fotolijst.md`.
- Story 5 (pijl-link met kader): hier alleen afstemmen, niet bouwen.
- Formulier, Worker, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/`.
- Geen grens of axe-regel versoepelen.

## Open vragen
**Blokkerend**
1. **Babynest-PR eerst.** Bouwen kan pas na de merge van `wijziging/babynest-media-en-logo`. Die PR verandert het drieluik (babynestfoto vol) en het header-logo, en heeft de boek/magazine-onderdelen die B misschien hergebruikt.
2. **Drie of vier items bij Handwerk?** Carst zegt "3 foto's", maar er staan nu vier items:
   - Warm en eigen / Belettering;
   - Rustig en praktisch / Siliconen items;
   - Klein en precies / Prematuurkleding;
   - Speels en levendig / Borduren.

   Voorstel: de vier bestaande items houden. Bedoelt Carst er drie, welke valt dan weg? Of bedoelt hij met "3 foto's" de drie foto's van het drieluik?
3. **Pijl-link per item?** Stock heeft per item een eigen pijl-link ("Bekijk magazines"). Wij hebben per item geen goedgekeurde linktekst. Voorstel: de naam (kop) is de link en "Zo personaliseert Carien" blijft eronder. Wil Carst per item een eigen tekst, dan moet hij die goedkeuren.
4. **Dubbel label.** Bedoeld of niet, en alleen de homepage of overal (Ontwerprichting D)? Voorstel: in deze brief alleen de homepage op mobiel; een algemene oplossing als eigen story.
5. **Avatar bij Instagram:** het logo of de foto van Carien? Een foto van Carien als avatar laat haar persoonlijk zien. Dat is gebruikelijk op Instagram, maar Carst of Carien beslist.

**Niet blokkerend**
6. **Issuenummers** van story 9 en story 6. Als die er zijn, komt in de pull request `Closes #<nummer>` voor beide.
7. **Twee stories in één brief.** Volgens de werkwijze hoort er één story per brief; de hoofdsessie vraagt om story 9 en story 6 samen, omdat ze allebei de mobiele homepage raken. De bouwer houdt A+B (story 9) en C (story 6) in aparte commits, zodat ze los terug te draaien zijn. Wil Carst twee pull requests, dan wordt C een eigen brief.
8. **Kwaliteit van de foto's.** Schermvullend op een telefoon zijn `p-broekje-kleur.jpg` (tijdelijke foto, fotolijst opname 13) en `babynest-boven.jpg` zacht op een 3×-scherm. `ig-outfit-ladder.jpg` (480 × 640) is klein voor een postfoto. Betere bestanden staan op `docs/fotolijst.md`; dat blokkeert niet.
9. **Instagram ook op desktop?** Carst vroeg het voor mobiel. Een post-uitstraling kan op desktop ook werken, maar de huidige indeling (foto met tekst ernaast) is daar al rustig. Voorstel: eerst alleen mobiel; Carst beslist bij de preview.
10. **Akkoord van Carien.** De teksten blijven dezelfde (goedgekeurd door Carst, 14 nov.). Er komt geen nieuwe tekst bij, behalve de accountnaam "luxmini2020", die al op de site staat.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de feedback van Carst op mobiel (14 nov. 22:45, 22:47, 22:48) en de richting van de hoofdsessie. Draait het besluit van 7 nov. (drieluik foto boven tekst, Handwerk kaarten) terug op wens van Carst. Drie onderdelen: A drieluik en B Handwerk (story 9), C Instagram (story 6). Dubbel label gezien bij 002 en 004. Ontwerprichting nog leeg, met vragen voor website-ontwerper. Bouwen pas na de merge van de babynest-PR. Risico midden. Blokkerend: babynest-PR, aantal items Handwerk, pijl-link per item, dubbel label, avatar |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (14 nov., keuzevragen in de chat)
1. **Handwerk:** alle vier de items blijven (Belettering, Siliconen items, Prematuurkleding, Borduren).
2. **Avatar Instagram-blok:** het LUX-logo.
3. **Dubbel label (balk + sectielabel):** oplossen voor de hele site in een eigen wijziging; niet in deze brief (criterium "label niet dubbel" vervalt hier).
4. Pijl-link per Handwerk-item: voorstel planner overgenomen (de naam is de link, "Zo personaliseert Carien" blijft eronder).
5. Eén brief, aparte commits per onderdeel (A/B en C); Instagram eerst alleen mobiel.
