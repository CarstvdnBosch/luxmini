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
| Bouwen | website-bouwer | Gebouwd op `d5f3039` (main met PR #84, babynest en meekrimpend logo). **A** (story 9): drieluik op mobiel en liggend als drie blokken met stilstaande foto (cover, `#2A1C14`, sluier .66 → .28), tekst onderaan wit (kop 40 px, 16 px), liggend tekst links 45 % en foto rechts 55 %; `sizes` 720px/540px (liggend 55vw), "Vanaf&nbsp;€&nbsp;35"; balk boven de blokken perzik met donker logo. **B** (story 9): `.lookbook` met per item `.papier.spread` (papier en rugschaduw van babynest), vlak perzik/salie/olijf/mauve, naam 40 px + productregel als één link, tabjes 01–04 (`tablist`, roving tabindex, pijl links/rechts, Home/End), veegrij met scroll-snap, IntersectionObserver (0,6), `inert`; sectie en balk volgen de kleur (sectie dan zonder `met-laag`); zonder JS alleen de veegrij. Afwijking: "Prematuurkleding" past in spatiekapitalen van 13 px niet op de rechterpagina (gemeten 152–173 px op een pagina van 164 px bij 360 px), dus `Prematuur&shy;kleding` op twee regels met iets lagere foto's in het lookbook. Op ≤ 760 px is de hover-lijst ook met een muis verborgen (anders twee keer Handwerk). **C** (story 6): witte post-kaart met profielregel (LUX-logo op terracotta, "luxmini2020", geen link), foto 4:5, drie eigen lijniconen (`aria-hidden`, `focusable="false"`, geen pointer), kop 28 px, zin en "@luxmini2020"; desktop gelijk (`<br>` kreeg een spatie ervoor, onzichtbaar op desktop). `CLAUDE.md` (Homepage op mobiel, witte tekst, drieluik/Handwerk-regel), principes Mobiel-regel 10. **Tests:** nieuw `tests/e2e/homepage-mobiel.spec.js` (criteria 1–16 op 360 × 740, 390 × 844, 430 × 932, 844 × 390, @3×, zonder JS, met beweging, iPhone en desktop/tablet ongewijzigd). Aangepaste verwachtingen (besluit Carst 14 nov.): `controleer.py` controleer_home op mobiel "foto boven tekst" → foto als achtergrond met witte tekst + contrast 4,5:1/3:1 (regel 10), "kaarten van Technieken in beeld" → vier lookbook-panelen met tabjes (tablet ongewijzigd); controleer_witte_lijn verbergt de tekst van het drieluik tijdens de meting (witte letterstokken zijn geen scheidingslijn; zelfde drempel). `mobiel-ontwerp.spec.js` en `homepage-zoals-stock.spec.js` hoefden niet te veranderen. **Uitkomst:** `npm test` 192/192; `controleer.py` geen fouten; Playwright Chromium (desktop, tablet, mobiel, eigen poort, 2 workers) 670 geslaagd, 1 mislukt: `kernpaden` "intro … overslaan binnen 0,6 s" (timing onder belasting; los 3 × herhaald groen, niet geraakt door deze wijziging). Alleen in CI: axe (pakket lokaal niet aanwezig), WebKit/iPhone, Lighthouse, visueel (geen lokale basis). Visueel: mobiele basis wijkt bewust af bij 001, 002 en 004 (bijwerken via `visueel-basis.yml`); desktop en tablet horen gelijk te blijven. |
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


## Ontwerprichting (website-ontwerper, 14 nov.; vervangt de lege sectie hierboven)


**Geldt alleen op mobiel:** ≤ 760 px, en telefoons liggend (touch met hoogte ≤ 500 px). Touch-tablets van 761–1024 px houden het huidige gedrag: drieluik met de foto boven de tekst en Handwerk als kaarten. Desktop verandert niet.

### A · 001 Producten

1. **Opbouw.**
   - Het label "001 — Producten" blijft op de eigen perzik strook (`data-achtergrond="#DEB799"`, doet niet mee met de kleurlaag). Daaronder staan drie blokken over de volle breedte.
   - Elk blok heeft als ondergrond warm donker `#2A1C14`, de bestaande kleur van `.kern-masker`. Zo is de witte tekst ook leesbaar zolang de foto nog laadt.
   - De foto vult het blok (`object-fit: cover`) en staat stil: niet inschuiven, niet schalen en geen `opacity .6`.
   - De bestaande inschuif bij aanwijzen werkt hier niet, ook niet met een muis in een smal venster. De perzik, oker en mauve per kolom zie je op mobiel niet meer.
   - De balk is boven deze blokken effen perzik, met het donkere logo en het label in inkt. Dat gaat vanzelf via `style.backgroundColor` van de sectie.
2. **Hoogte.**
   - Blokhoogte: `height: clamp(520px, calc(100svh - 96px), 720px)`. Dat is 720 px op 390 × 844, 568 px op de iPhone (390 × 664) en 644 px op 360 × 740.
   - Zo past een blok altijd onder de balk van 56 px. Na een ankerlink staan de kop en de pijl-link dus helemaal in beeld.
   - Geen enkele foto wordt in CSS-pixels groter dan het bestand. Op 390 × 720 is de schaal bij de box 0,51, bij het broekje 0,60 en bij het nest 0,75.
   - `sizes` volgt de echte getoonde breedte, niet `90vw`:
     - box: `(max-width: 760px) 720px`;
     - broekje: `(max-width: 760px) 540px`;
     - nest: geen srcset.
   - Zo laadt ook een scherm met pixelverhouding 1× geen te klein bestand. De foto's blijven `loading="lazy"`.
3. **Tekst en sluier.**
   - De tekst staat **onderaan** het blok, in deze volgorde: nr (Libre Caslon Text, 16 px), kop (Libre Caslon Display, 40 px, regelafstand 1,08, de bestaande `&shy;`), zin (16 px / 1,7, max. 300 px breed) en pijl-link (16 px, 44 px hoog).
   - Alles is wit en links uitgelijnd op de rand van 32 px. Ruimte tussen de onderdelen: 20 px; onderaan 48 px.
   - De sluier is een verloop: `linear-gradient(to top, rgba(42,28,20,.66) 0, rgba(42,28,20,.66) 380px, rgba(42,28,20,.28) 100%)`.
   - Daarmee halen de zin, het nr en de pijl-link minstens 4,5:1 op de lichtste plek. Ze worden dus niet groter gemaakt. De kop haalt ruim 3:1.
   - Uitsnede per foto (`object-position`):
     - box `30% 50%` (het zakje "Sem" blijft boven de tekst);
     - broekje `50% 50%`;
     - nest `50% 50%`.
   - Vervang in "Vanaf € 35" de spaties door `&nbsp;`, zodat "€ 35" niet alleen op een regel valt. De tekst zelf verandert niet.
4. **Telefoon liggend (touch, hoogte ≤ 500 px).**
   - Het blok is 100svh hoog en heeft twee helften. Links (45 %) staat de tekst op effen `#2A1C14`: wit, 16,5:1.
   - Rechts staat de foto, 55 % breed (`inset: 0 0 0 auto`), met een verloop van `#2A1C14` (1) naar 0,28. Zo blijft het nest onder 768 px breed.
   - Kop 34–40 px, dezelfde volgorde als staand.

### B · 002 Handwerk

1. **Object: een eigen LUX mini-lookbook, opengeslagen**, zoals het open magazine bij Stock.
   - Een spread van twee pagina's (`aspect-ratio: 8 / 5`, breedte `min(100vw - 32px, 400px)`, op 390 px 358 × 224).
   - Hergebruik de papierstijl van de babynest-PR: `.blad` (papier `#FBF8F3`, schaduw `0 30px 50px rgba(32,32,32,.28)`, foto ingezet op 7 %) en de rugschaduw van `.blad-rechts::after`.
   - Maak een nieuwe variant `.papier.spread` met een linker- en een rechterblad van 50 %, zonder kaft en zonder draaien. Een omslag of masthead hoort er niet bij, dus niets wat op persaandacht lijkt.
   - Links staat de grote foto van het item, rechts de kleine. Het zijn de bestaande `.sfeer`-foto's met srcset 600w.
   - Onder op elke pagina een regel van 13 px in Libre Caslon Text, in spatiekapitalen: links "LUX mini", rechts de productregel.
   - Het object is decoratief: `aria-hidden="true"` en `alt=""`.
2. **Kleurvlak per item (lichte paletkleur, alle tekst inkt):**
   - Belettering: perzik `#DEB799` (8,8:1);
   - Siliconen items: salie `#C3CFBC` (10,1:1);
   - Prematuurkleding: olijf `#B4B19A` (7,5:1);
   - Borduren: mauve `#B5969E` (6,1:1).

   Elk paneel heeft zijn eigen kleur over de volle breedte. Tijdens het vegen zie je dus twee kleuren naast elkaar, zoals bladzijden.
   - Na elke wissel zet main.js `style.backgroundColor` en `data-achtergrond` van `#technieken` op de kleur van het actieve item (0,75 s `var(--rustig)`) en roept `balkBijwerken(true)` aan. Label, tabjes, pijl-link en balk staan dan op dezelfde kleur. Het vlak doet niet mee met de kleurlaag.
   - Geen witte tekst in dit blok.
3. **Inhoud van het paneel (gecentreerd).**
   - Bovenaan het object. Daarna, op 44 px afstand, de naam als `h3`: Libre Caslon Display, 40 px, regelafstand 1,08, hooguit twee regels.
   - Daaronder de productregel: Source Sans 3, 16 px, gewicht 600, spatiekapitalen (0,2em), met de pijl erachter.
   - Object, naam en productregel vormen samen één link (`<a>` om het hele paneel) naar dezelfde `href` als nu. De naam is de link, volgens besluit 4.
   - Onder de rij volgen de tabjes. Daaronder blijft "Zo personaliseert Carien" als gewone `.pijl`, gecentreerd, zonder kader. Story 5 regelt het kader los.
4. **Tabjes.**
   - Er zijn vier tabjes met de nummers **01 02 03 04**: Libre Caslon Text, 16 px, inkt, elk 48 × 44 px, 8 px ertussen, samen 216 px. Dat past op 360 px en sluit aan op de nummers van het drieluik.
   - De woorden in spatiekapitalen passen niet: "PREMATUURKLEDING" is op 16 px al ±205 px breed.
   - Elke tab heeft als naam "01 Belettering" enzovoort, met de productregel als `sr-only`.
   - Gebruik `role="tablist"` (`aria-label="Handwerk"`), `role="tab"` met `aria-selected`, `aria-controls` en roving tabindex, en per paneel `role="tabpanel"` met `aria-labelledby`.
   - Het actieve tabje is onderstreept (1 px, 6 px onder de letters, zoals `aria-current` in het menu). De niet-actieve tabjes blijven volle inkt; inkt op 60 % haalt op mauve maar 2,9:1.
   - Pijl links/rechts wisselt meteen en verplaatst de focus. Home en End werken ook.
5. **Wisselen.**
   - De rij is een native veegrij met `scroll-snap-type: x mandatory`. Elk paneel is 100 % breed, er kijkt geen buurpaneel mee en er is geen scrollbalk. Er wisselt niets vanzelf.
   - Een tik op een tab scrollt naar het paneel (`behavior: smooth`, bij minder beweging `auto`).
   - Het actieve paneel volgt uit een IntersectionObserver op de panelen (drempel 0,6), niet uit `scrollend`: Safari ondersteunt dat niet overal.
   - Niet-actieve panelen krijgen `inert`. De rij zelf is geen tabstop, want de tabjes zijn de bediening. Er komen geen pijlknoppen.
   - Bij minder beweging springt de rij direct en wisselt de kleur zonder overgang.
   - Zonder JavaScript krijgt de tablist `hidden` (main.js haalt die weg). Dan is de rij gewoon veegbaar met scroll-snap, met een dunne scrollbalk voor een muis. Alle namen en links zijn bereikbaar en niets is `inert`.
6. Het nieuwe blok bestaat alleen op mobiel. Op 761 px en breder is het `display: none` en blijven de hover-lijst en de touch-kaarten zoals ze zijn. Op mobiel krijgt `.sfeer-kaarten` `display: none`.

### C · 004 Instagram

1. **Kaart.**
   - Het label "004 — Instagram" blijft boven de kaart, op de rand.
   - De kaart is wit `#FFFFFF` op grijsblauw, met rechte hoeken, zonder rand en zonder schaduw. Breedte 100 % binnen de rand: 326 px op 390, hooguit 400 px en gecentreerd als je liggend kijkt.
2. **Profielregel** (binnenmarge 12 px × 14 px).
   - Een rond avatar van 40 px op terracotta `#BC8565` met `logo-lux-groot-wit.png` erin (26 px breed, `alt=""`). Eromheen een dunne ring: `box-shadow: 0 0 0 2px #fff, 0 0 0 3px #BC8565`.
   - Daarnaast "luxmini2020" in Source Sans 3, 16 px, gewicht 600, inkt.
   - De profielregel is **geen** link. Het profiel wordt zo maar één keer voorgelezen, en er staan al twee links naar Instagram (de foto en de pijl-link).
3. **Foto.**
   - Staand **4:5**, niet vierkant: `aspect-ratio: 4 / 5; object-fit: cover; object-position: 50% 40%`. Dit is een gewone Instagram-maat. Bij vierkant valt het broekje half weg.
   - De foto loopt van rand tot rand in de kaart en blijft de bestaande link met dezelfde alt-tekst.
   - Op 390 px wordt hij 326 × 408 getoond, dat is schaal 0,68 en dus niet vergroot.
4. **Iconen.**
   - Drie eigen lijntekeningen (hartje, reactie, delen) van 24 × 24 px, lijn 1,5 px in inkt, 18 px ertussen, binnenmarge 14 px.
   - Ze staan in een gewone `div` met `aria-hidden="true"` en `pointer-events: none`, met `focusable="false"` op de svg's. Ze hebben geen hover en geen tellers.
   - Geen Instagram-logo, geen kleurverloop en geen "…"-menu.
5. **Bijschrift** (binnenmarge 10 px 14 px 16 px).
   - De bestaande `h2` "Volg het atelier op Instagram" in Libre Caslon Display, 28 px, regelafstand 1,12, de `<br>`'s verborgen op mobiel.
   - Daaronder de zin (16 px / 1,6) en de pijl-link "@luxmini2020" (16 px, 44 px hoog).
   - Op desktop verandert niets (besluit 5).

### D · Dubbel label
Valt buiten deze brief (besluit 3 van Carst). Criterium 17 vervalt.

---

## Ontwerpcriteria (toetsbaar)

Gemeten op 360 × 740, 390 × 844, 390 × 664 (WebKit/iPhone), 430 × 932 en 844 × 390.

1. **Hoogte drieluikblok.** Elk drieluikblok is ≤ `innerHeight − 56` hoog (staand) en heeft `background-color` `rgb(42, 28, 20)`. Na `#kraamcadeauboxen`, `#prematuurkleding` en `#babynest` staan de kop en de pijl-link helemaal tussen de onderrand van de balk en de onderkant van het scherm.
2. **Contrast in het drieluik.** Dit wordt gemeten met de tekst verborgen (`color: transparent`): schermafdruk per tekstvak, 99,5e percentiel van de luminantie. De zin, het nr en de pijl-link halen ≥ 4,5:1 tegen wit, de kop ≥ 3:1, op alle drie de foto's.
3. **Geen vergroting in het drieluik.** Voor elke drieluikfoto geldt op pixelverhouding 1×: `naturalWidth` van `currentSrc` ≥ de getoonde breedte bij cover. Op 3× wordt het grootste beschikbare bestand geladen.
4. **Stilstaande foto's.** Op mobiel heeft `.kern-beeld` of `.kern-masker` geen transform en heeft de img `opacity: 1`, ook na `hover()`. De kop is wit.
5. **Balk boven het drieluik.** Boven de drieluikblokken heeft de balk achtergrond `#DEB799`, het donkere logo en het label in inkt.
6. **Eén paneel in beeld.** Bij Handwerk staat precies één paneel volledig in beeld. Het object is ≥ 290 px breed en ≤ 400 px. Van het label "002 — Handwerk" tot de onderkant van "Zo personaliseert Carien" is het op 390 × 844 ≤ 788 px.
7. **Tabjes.** Op 360 px staan de vier tabjes op één regel, elk ≥ 44 × 44 px. De pagina scrolt niet horizontaal. Het actieve tabje heeft een onderstreping van 1 px. Elk tabje haalt ≥ 4,5:1 (inkt, volle dekking).
8. **Tabs en vegen werken samen.** Na een tik op tab 03 of na één keer vegen zijn `aria-selected` en de achtergrond van `#technieken` en van de balk binnen 1 s gelijk aan het actieve paneel, en zijn de andere panelen `inert`. Pijl rechts, Home en End werken. Bij `reducedMotion: 'reduce'` is de wissel direct (geen `transition-duration` > 0).
9. **Zonder JavaScript.** De vier namen en hun links zijn bereikbaar door te vegen of te tabben, en er is geen tablist in beeld.
10. **Instagram-kaart.** Een witte kaart met daarin, van boven naar beneden: profielregel (avatar 40 × 40, rond), foto in 4:5, iconenrij, `h2` van ≥ 24 px, zin en pijl-link. De iconen zijn niet focusbaar en hebben `aria-hidden`. Er staan geen cijfers in de kaart. De kaart bevat precies twee links, allebei naar `https://www.instagram.com/Luxmini2020/`.
11. **Desktop en tablet gelijk.** Op ≥ 761 px wijken drieluik, Handwerk en Instagram niet af van de visuele basis.

---

## Tekst voor `CLAUDE.md`

Op te nemen door de bouwer. Deze tekst vervangt het stuk tussen haakjes "(op mobiel blijft het drieluik … besluit 7 nov.)" en wordt samengevoegd met de regel "Homepage, drieluik (wens Carst 14 nov.)":

> Homepage op mobiel (≤ 760 px en telefoons liggend; wens Carst 14 nov., brief 2026-11-14-homepage-mobiel-stock; touch-tablets houden foto boven tekst en kaarten):
>
> **001 Producten:** drie blokken over de volle breedte (hoogte `clamp(520px, 100svh − 96px, 720px)`, ondergrond `#2A1C14`). De foto staat stil als achtergrond, met de sluier `rgba(42,28,20)` van .66 (onderste 380 px) naar .28. De tekst staat onderaan en is wit: nr, kop 40 px, zin en pijl-link van 16 px, alles ≥ 4,5:1. Liggend: tekst links op `#2A1C14`, foto rechts (55 %). De balk is daar perzik.
>
> **002 Handwerk:** per item een opengeslagen LUX mini-lookbook (`.papier.spread`, papier van de babynestpagina) op een lichte paletkleur (perzik, salie, olijf, mauve), met de naam (40 px) en de productregel als één link. Daaronder tabjes 01–04 (tablist), veegrij met scroll-snap. Sectie en balk volgen de kleur van het actieve item. Er wisselt niets vanzelf.
>
> **004 Instagram:** een eigen post op een witte kaart: avatar met "LUX" op terracotta, "luxmini2020", foto 4:5, drie eigen lijniconen (decoratief), kop 28 px als bijschrift, zin en "@luxmini2020". Geen Instagram-logo of tellers.

Aanvulling op de regel **Witte tekst**, bij "Uitzondering": `…, de mobiele drieluikblokken op de homepage (wit op foto met warme sluier ≥ .66 onder de tekst: kop 40 px en 16 px voor nr, zin en pijl-link, gemeten ≥ 4,5:1)`.

## Voorstel voor `docs/ontwerp/principes.md`, Mobiel-regel 10

Te beslissen door de hoofdsessie, want dit volgt uit het besluit van Carst:

> 10. **Eén duidelijke volgende stap per productblok.** De foto staat boven de tekst, of (homepage-drieluik, besluit Carst 14 nov.) de tekst staat op de foto met een sluier die voor kleine tekst 4,5:1 haalt. Een scherm is nooit leeg.

`scripts/controleer.py` toetst die regel en moet dus mee veranderen.

---


## Aanvulling hoofdsessie (14 nov.)
- Criterium 5 (balk) volgt de ontwerper: boven de drieluikblokken effen perzik met donker logo.
- Mobiel-regel 10 in docs/ontwerp/principes.md en de bijbehorende toets in scripts/controleer.py worden aangepast volgens het voorstel van de ontwerper (besluit Carst 14 nov.).
- Bouwen pas na merge van PR #84 (babynest + logo).
