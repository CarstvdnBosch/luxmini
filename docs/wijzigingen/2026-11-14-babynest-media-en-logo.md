# Babynest als Media-overzicht en logo groot → klein

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (wens 14 nov. 2026; mock-up "Book magazine, Ipad" in het ontwerpcanvas goedgekeurd; logo optie A; teksten goedgekeurd met "yours is ok")
- **Branch:** `wijziging/babynest-media-en-logo`
- **Issue:** geen issuenummer bekend. Als er een issue is, komt `Closes #<nummer>` in de pull request.
- **Risico:** midden. Het formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt. Wel verandert de header op alle openbare pagina's, en `main.js` krijgt een nieuw scrollgedrag (logo, inschuiven, vastzetten). Dat kan de intro, de vaste balk, de linkrij, de pagina-overgang en CLS raken.

## Doel
1. Op de Babynest-pagina ziet de bezoeker het nest in drie rustige, verrassende blokken: een boek dat openslaat, een eigen lookbook en een tablet met foto's. Elk blok heeft één duidelijke vervolgstap.
2. Op elke openbare pagina opent de site met een groot, scherp "LUX". Bij scrollen krimpt dat vloeiend naar het gewone logo "LUX mini", zonder dat er iets verspringt of het menu wordt geraakt.

## Wens
- **A · Babynest (Carst, 14 nov.):** de Babynest-pagina krijgt het patroon van het Media-overzicht van Stock: boek, magazine en tablet schuiven in. De mock-up in het ontwerpcanvas is goedgekeurd ("Book magazine, Ipad").
- **B · Logo (Carst, 14 nov., optie A):** het logo gaat van groot naar klein bij scrollen, op alle openbare pagina's. Groot staat alleen "LUX", uit het scherpe bestand van 1474 px.
- **Eén pull request:** dit zijn eigenlijk twee stories (A Babynest, B Logo). De werkwijze vraagt één story per brief, maar Carst wil voor dit voorstel uitdrukkelijk één pull request. De bouwer houdt A en B wel in aparte commits, zodat ze los terug te draaien zijn.
- **Bronbestanden** (staan nu in de tijdelijke scratchpad van de sessie):
  - `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/nest-assets/`
  - `nest-voor.jpg`, `nest-boven.jpg`, `nest-deken.jpg` en `nest-rits.jpg`: 768 × 960 en al warm gecorrigeerd.
  - `lux-a-wit.png`: 1474 × 559. De donkere versie maakt de bouwer zelf.
  - De originelen moeten buiten de site bewaard worden, in de mediamap. De scratchpad kan worden gewist.
  - In `public/assets/img/` komen ze onder nieuwe bestandsnamen, bijvoorbeeld `babynest-voor.jpg`, `babynest-boven.jpg`, `babynest-deken.jpg`, `babynest-rits.jpg`, `logo-lux-groot-wit.png` en `logo-lux-groot-donker.png`.

## Acceptatiecriteria

### A · Babynest-pagina (`babynest.html`)
1. **Opbouw.** De volgorde in `main` is:
   - paginakop `.op-kleur.pagina-kop` met `h1.caps` "Babynest", de quote (`.quote.pagina-quote`, wit, ≥ 24 px) en daaronder de kleine pijl-link "Stuur Carien een bericht" → `contact.html?onderwerp=babynest#formulier`;
   - 001 Het nest, 002 De stof, 003 Het dekentje;
   - 004 Prijs, 005 Zo werkt het, 006 Contact.

   Elke sectie heeft een `data-label` in de bestaande vorm, bijvoorbeeld `<span>001 —</span> Het nest`. De ids zijn: `babynest` (001, dit bestaande anker blijft), `stof` (002), `dekentje` (003), `prijs`, `zo-werkt-het` en `contact`.
2. **Kleur per blok.** De blokken hebben `data-achtergrond`: 001 `#B5969E` (mauve), 002 `#C3CFBC` (salie), 003 `#DEB799` (perzik). Alle tekst daarop is inkt met minimaal 4,5:1. Staat de balk boven deze blokken, dan toont hij het donkere logo.
3. **Om en om.** Vanaf 1025 px staat in 001 en 003 de tekst links en het object rechts. In 002 is dat gespiegeld.
4. **Tekstblok per blok.** Elk blok heeft:
   - `.label` "00x — titel";
   - één kop (h2) in Libre Caslon Display;
   - één zin in Source Sans 3 van ≥ 16 px, met regels van hooguit 75 tekens;
   - één `.pijl` met een tikdoel van ≥ 44 px.

   Er zijn geen knoppen. De teksten komen letterlijk uit de goedgekeurde mock-up (zie Open vragen 1).
5. **Pijl-links.**
   - 001 "Bespreek je idee" → `contact.html?onderwerp=babynest#formulier`.
   - 003 "Vraag ernaar" → hetzelfde adres.
   - 002, voorlopig de "Nee"-variant: "Vraag naar de stoffen" → `contact.html?onderwerp=babynest#formulier`.
   - Meldt de hoofdsessie "Ja", dan wordt het "Bekijk de stoffen" → `kraamcadeauboxen.html#stoffen`. Dan krijgt de h3 "De stoffen" in `kraamcadeauboxen.html` `id="stoffen"`, en landt die kop na de klik onder de vaste balk, niet erachter.
   - In de inhoud staan geen links naar WhatsApp, telefoon of mail.
6. **Objecten.**
   - 001 is een boek. De kaft heeft een strook "LUX mini — Babynest". Binnen ligt een spread: links de stof, rechts het nest van boven.
   - 002 is een magazine met de masthead "LUX mini" en "Lookbook · Babynest", in onze eigen letters.
   - 003 is een tablet zonder merk, knoppen of camera-eiland, met drie foto's die doorschuiven. De puntjes hebben `aria-hidden="true"` en zijn niet focusbaar.
   - De kleine tekst op de kaften haalt 4,5:1.
7. **Maten.**
   - Geen pagina of spreadhelft wordt breder getoond dan het bestand (768 px).
   - Op desktop is één pagina ≤ 384 px breed en het objectvak ≤ ca. 40% van het ontwerpvak.
   - Op 390 px is het object 326 × 408 px. Op tablet is het hooguit 560 px breed en gecentreerd.
8. **Beweging op desktop.**
   - Het inschuiven gaat van x 150% met een draai naar 0, in 1,5 s, `cubic-bezier(.65,0,.35,1)`.
   - Daarna komen de tekstregels één voor één van onder (y 50 → 0, 1 s, 0,1 s na elkaar).
   - De kaft draait om de rug (rotateY 0 → −180°, met perspectief en `backface-visibility: hidden`) en komt nooit over het tekstblok.
   - Per blok is hooguit één schermhoogte vastgezet. In een schermafdruk tijdens het scrollen is geen enkel scherm leeg.
   - Kop, zin en pijl-link staan er al voordat de kaft opengaat.
9. **Mobiel (≤ 760 px) en tablet (761–1024 px).**
   - De volgorde is: label, object, kop, zin, pijl-link.
   - De kaft verdwijnt bij 90° (opacity 0) en het blok heeft `overflow: clip`.
   - Er is geen vastzetten en geen scroll-jacking: touch scrolt native.
   - De tablet wisselt van foto op de scrollpositie.
   - Op 390 × 844 staat in elk blok van 001 tot en met 003 de pijl-link in hetzelfde scherm als het label.
10. **Geen horizontaal scrollen.** Op 390 en 768 px geldt `document.documentElement.scrollWidth === window.innerWidth`, ook halverwege het openslaan van een kaft. Dit wordt getoetst in Chromium en WebKit (iPhone).
11. **Minder beweging.**
    - Boek en magazine staan open (op mobiel de binnenpagina).
    - De tekstregels staan er direct en er schuift niets.
    - De tablet wisselt van foto zonder te schuiven.
12. **Zonder JavaScript.** De open spread staat er (op mobiel de binnenpagina) en de tablet toont de eerste foto. Alle tekst en links zijn zichtbaar en bruikbaar.
13. **Alt-teksten.**
    - Elk beeld wordt maar één keer voorgelezen. De kaften en de binnenpagina's hebben een eigen beschrijvende `alt`. Verborgen kopieën en decoratie hebben `alt=""`.
    - Foto's krijgen `width` en `height`. Foto's onder de vouw krijgen `loading="lazy"`.
14. **004, 005 en 006** blijven inhoudelijk zoals nu, alleen met de nieuwe nummers in label en `data-label`.
    - De prijszin en "Vraag naar de prijs" blijven ongewijzigd, zonder plaatshouder.
    - De contactfoto wordt de voorkant van het nest (`babynest-voor.jpg` of de gekozen naam), met een nieuwe `alt`.
15. **Kleur.** Thema's of objecten staan niet op terracotta. Alleen de paginakop is terracotta.

### B · Logo groot → klein (alle openbare pagina's)
16. Het geldt voor `index`, `werkwijze`, `kraamcadeauboxen`, `prematuurkleding`, `babynest`, `inspiratie`, `contact`, `privacy`, `bedankt` en `404`. `/beheer` verandert niet.
17. Bij scrollpositie 0 staat in `.site-header .logo` alleen "LUX". Het komt uit een witte en een donkere webversie van het bestand van 1474 px en is ca. 2,5 × de headermaat (desktop ca. 110 px hoog, mobiel ca. 90 px). In 2× is het scherp: het bestand is minstens 2 × zo breed als de weergave.
18. **Wit of donker** volgt de bestaande regels:
    - `html.hero-licht` toont donker;
    - `html.kop-donker` (contact) toont wit;
    - verder wit op terracotta en donker op wit of grijs.
19. **Krimpen.**
    - Het logo krimpt vloeiend naar de gewone maat met "LUX mini": 44 px, mobiel 36 px.
    - Dat gebeurt met `transform: scale` vanuit linksboven, op de afgevlakte scrollwaarde.
    - Het is klaar binnen de eerste ca. 40% van een schermhoogte en in elk geval voordat de balk verschijnt. Bij terugscrollen groeit het weer.
20. **Geen verspringing.** De ruimte voor het grote logo is vast gereserveerd. CLS van de header is 0, ook tijdens het krimpen.
21. **Krappe ruimte.**
    - Op 1280, 1440 en 1920 px staat bij scrollpositie 0 de rechterrand van het grote logo ≥ 24 px links van de eerste menulink, en staat het menu op één regel. Waar dat met 2,5 × niet past (rond 1280 px), wordt het grote logo kleiner.
    - Op 1024, 768 en 390 px overlapt het logo de burger niet, en staat het ≥ 12 px vrij van de eerste hero-foto en de h1 van de hero.
    - Met een muis overlapt het logo ook de linkrij naast de burger niet.
22. **Linkrij open** (`html.rij-open`): het logo vervaagt zoals nu.
23. **Minder beweging en zonder JavaScript:** het logo staat altijd op de gewone maat en krimpt niet.
24. **Binnenkomen halverwege.** Wie via een anker halverwege binnenkomt, of na terugladen halverwege staat, ziet het logo meteen op de maat die bij die plek hoort, zonder animatie vanaf groot.
25. **Toegankelijkheid.** De link houdt `aria-label="LUX mini, naar de homepage"` en een tikdoel van ≥ 44 px. Het grote beeld voegt geen tweede voorgelezen naam toe (`alt=""` op de extra afbeeldingen).
26. **Wat gelijk blijft.**
    - De intro (2,2 s, overslaan, noodrem na 3 s, LCP onder het doek), de pagina-overgang, de vaste balk (eigen logo van 128 px), het menu over het hele scherm en de linkrij werken als voorheen.
    - Na de intro of een pagina-overgang staat het logo op de maat die bij de scrollpositie hoort.

### Tests en harness
27. **E2e Babynest** (nieuwe spec, bijvoorbeeld `tests/e2e/babynest-media.spec.js`, in de projecten desktop, tablet, mobiel en WebKit). De spec toetst:
    - de volgorde van de blokken, de ids en de `data-label`-teksten (001–006), en dat de balk per blok het juiste label toont (criterium 1 en ontwerpcriterium 10);
    - `data-achtergrond`, inkt op de tinten en het donkere logo in de balk;
    - per blok één h2, één zin van ≥ 16 px en één `.pijl` van ≥ 44 px met de juiste `href` (criterium 5). "Stuur Carien een bericht" in de kop blijft;
    - maten en object en tekst samen in één scherm op 1440 × 900 (criterium 7, ontwerpcriteria 1 en 2);
    - op 390 × 844 de pijl-link in hetzelfde scherm als het label (criterium 9);
    - geen horizontaal scrollen op 390 en 768 px, ook halverwege het openslaan (criterium 10, Chromium en WebKit);
    - `prefers-reduced-motion: reduce`: boek en magazine open, tekst direct zichtbaar, geen transform-animatie (criterium 11);
    - `javaScriptEnabled: false`: de open spread en de eerste tabletfoto zichtbaar (criterium 12);
    - puntjes `aria-hidden` en niet focusbaar, en geen dubbel voorgelezen `alt` (criterium 13);
    - geen leeg scherm tijdens het scrollen (criterium 8).
28. **E2e Logo** (nieuwe spec, bijvoorbeeld `tests/e2e/logo-krimpen.spec.js`). De spec toetst:
    - het grote "LUX" bij scrollpositie 0 op de tien openbare pagina's;
    - wit of donker volgens `hero-licht` en `kop-donker` (criterium 18);
    - de afstand tot het menu en het menu op één regel op 1280, 1440 en 1920 px;
    - geen overlap met de burger, de hero-foto of de h1 op 1024, 768 en 390 px (criterium 21);
    - de gewone maat (44 of 36 px) vóórdat `.balk` zichtbaar wordt, en de gewone maat bij `reduced-motion` en zonder JS;
    - de juiste maat bij een anker halverwege (criterium 24);
    - de layout-shift van de header 0 via `PerformanceObserver('layout-shift')` tijdens scrollen (criterium 20);
    - `aria-label` en tikdoel (criterium 25).
29. **Sitecontrole** (`scripts/controleer.py`). `PRODUCTPAGINAS["babynest.html"]` volgt de nieuwe opbouw: secties 001–006, nieuwe foto's en maximale breedte ≤ 384 px op desktop, 001 met `id="babynest"` en kleur `#B5969E`, en "Stuur Carien een bericht" in de kop. De controle "één voorbeeldfoto na hooguit één keer scrollen" geldt voor Babynest het object van 001. De controle van Prematuurkleding verandert niet. Een nieuwe controle kijkt of de header op alle openbare pagina's de grote logoversies en de juiste `aria-label` heeft.
30. **Bestaande tests worden niet versoepeld.** Intro, header, menu, linkrij, balk, overgang, kernpaden, axe, SEO, veiligheid, Lighthouse en visueel blijven zoals ze zijn. Moet een bestaande test anders omdat de opbouw van Babynest verandert (labels of nummers), dan past de bouwer alleen de verwachte waarde aan en noemt hij dat in het Verloop. Grenzen en axe-regels blijven gelijk.
31. **Visueel.** De basisschermen wijken af in de header bovenaan op alle pagina's en op heel `babynest.html`. De basis wordt bijgewerkt via `visueel-basis.yml` en de bouwer noemt welke schermen.
32. **Groen.** `npm run check` is groen: tests, sitecontrole, axe zonder fouten, SEO, veiligheid, Lighthouse (geen hogere CLS of LCP dan de grenzen), visueel en het validatierapport.
33. **`CLAUDE.md`** is bijgewerkt met de voorgestelde regels hieronder:
    - de Babynest-regel en de Logo-regel;
    - de Logo-regel bovenaan aangevuld;
    - de Intro-regel, als die het logo raakt;
    - de regel "Productpagina's Prematuurkleding en Babynest" geldt voortaan alleen voor Prematuurkleding, en Babynest verwijst naar de eigen regel;
    - de mapbeschrijving van `babynest.html` aangepast.

## Ontwerprichting

### Blok 1 · Ontwerprichting

1. **Patroon Media-overzicht van Stock, met onze bestaande klassen.**
   - Paginakop `.op-kleur.pagina-kop` op terracotta: label `h1.caps` "Babynest", daaronder de quote in Libre Caslon Display, wit (dat mag: groot en op terracotta).
   - Daarna drie blokken om en om: 001 tekst links en object rechts, 002 gespiegeld, 003 weer zoals 001.
   - Elk blok heeft een eigen `data-achtergrond` voor de kleurlaag (mauve `#B5969E`, salie `#C3CFBC`, perzik `#DEB799`) en een eigen `data-label` (`001 — Het nest` enzovoort).
   - Alle tekst op deze lichte tinten is inkt. Daar staat de balk in de lichte variant met het donkere logo.
   - Tekstblok per blok: `.label` "00x — titel", een grote kop in Libre Caslon Display, één zin in Source Sans 3 van minimaal 16 px, en één `.pijl`. Geen knoppen.
   - 004 Prijs, 005 Zo werkt het en 006 Contact blijven zoals ze nu zijn, alleen met nieuwe nummers. De contactfoto wordt `nest-voor`.
2. **Hiërarchie en volgorde.**
   - Per blok ziet de bezoeker eerst het object (boek, magazine, tablet), dan de kop, dan de zin, dan de pijl-link.
   - De regels komen één voor één van onder binnen (y 50 → 0, 1 s, 0,1 s na elkaar), pas nadat het object begint in te schuiven.
   - Het openslaan van boek en magazine en het doorschuiven in de tablet zijn de beloning bij verder scrollen. De inhoud hangt er niet van af: kop, zin en pijl-link staan er al voordat de kaft opengaat.
3. **Objecten op desktop (vanaf 1025 px).**
   - Het objectvak is hooguit ca. 40% van het ontwerpvak breed. De open spread bestaat uit twee pagina's van 4:5, elk hooguit 384 px breed. Zo wordt er nooit iets vergroot.
   - Het gesloten boek is de rechterpagina, met de rug in het midden van het objectvak. Bij het openslaan vult de spread het vak. De kaft draait om de rug (rotateY 0 → −180°, met perspectief en verborgen achterkant) en komt nooit over het tekstblok.
   - Het inschuiven gaat zoals Stock: x 150% en een draai → 0, in 1,5 s, `cubic-bezier(.65,0,.35,1)`.
   - De kaft van het boek heeft een strook "LUX mini — Babynest". De kaft van het magazine heeft de masthead "LUX mini" en "Lookbook · Babynest", in onze eigen letters, zonder iets wat aan een bestaand tijdschrift doet denken.
   - De tablet is een neutraal kader zonder merk, knoppen of camera-eiland. De puntjes zijn alleen een aanwijzing (`aria-hidden`) en geen bediening.
   - Het blok blijft hooguit één schermhoogte vastgezet terwijl het openslaat. Daarna scrolt het gewoon door, zodat er geen leeg scherm ontstaat.
4. **Mobiel (≤ 760 px) en tablet (761–1024 px): alles onder elkaar.**
   - Volgorde: label, object, kop, zin, pijl-link. Dat is mobiel-regel 10: foto boven, tekst eronder.
   - Het object is één pagina op volle breedte binnen de rand. Op 390 px is dat 326 × 408 px, op tablet hooguit 560 px breed en gecentreerd.
   - De kaft glijdt van onder in en slaat open. Omdat een kaft die om de linkerrug draait links buiten het scherm komt, verdwijnt de kaft bij 90° (opacity 0) en heeft het blok `overflow: clip`.
   - Het scrollen op touch blijft native: geen vastzetten en geen scroll-jacking. De tablet wisselt van foto op de scrollpositie.
5. **Minder beweging en geen JavaScript.**
   - Bij minder beweging staat alles direct op zijn plek. Boek en magazine staan open (op mobiel de binnenpagina), de tablet wisselt van foto zonder te schuiven en de regels staan er meteen.
   - Zonder JavaScript staat de open spread er (op mobiel de binnenpagina) en toont de tablet de eerste foto.
   - Elk beeld wordt maar één keer voorgelezen. De kaft heeft een eigen `alt`, de binnenpagina's ook, en verborgen kopieën krijgen `alt=""`.
6. **B · Het logo krimpt van groot naar klein (alle openbare pagina's, niet in `/beheer`).**
   - Bovenaan staat alleen "LUX", uit het scherpe bestand van 1474 px, ca. 2,5 × de headermaat (desktop ca. 110 px hoog, mobiel ca. 90 px). Er komt een witte en een donkere versie. De wissel tussen die twee volgt precies de bestaande regels: `html.hero-licht` toont donker, `html.kop-donker` op contact toont wit.
   - Bij scrollen krimpt het logo vloeiend naar de gewone maat met het volledige "LUX mini". Dat is klaar binnen de eerste ca. 40% van een schermhoogte, ruim voordat de balk verschijnt. Scrol je terug, dan groeit het weer.
   - Het krimpen gaat met `transform: scale` vanuit linksboven, op de afgevlakte scrollwaarde (wiel 0,05). De ruimte voor het grote logo is vast gereserveerd, zodat er niets verspringt.
   - Waar de ruimte te krap is (rond 1280 px naast het menu op één regel, of naast de burger en de linkrij), wordt het grote logo kleiner dan 2,5 ×. Het menu breekt nooit af en wordt nooit overlapt.
   - Opent de linkrij, dan vervaagt het logo net als nu (`html.rij-open`).
   - Bij minder beweging en zonder JavaScript blijft het logo op de gewone maat. Kom je via een anker halverwege de pagina binnen, dan staat het logo meteen op de maat die bij die plek hoort.
   - De link houdt `aria-label` "LUX mini, naar de homepage" en een tikdoel van minimaal 44 px.

### Blok 2 · Ontwerpcriteria (toetsbaar)

1. Op 1440 × 900 staan bij 001, 002 en 003 het object en het tekstblok samen in één scherm, met het tekstblok verticaal gecentreerd naast het object.
2. Op 1440, 768 en 390 px is geen pagina of spreadhelft breder getoond dan het bestand (768 px). Op desktop is één pagina ≤ 384 px breed.
3. Op 390 × 844 staat in elk van de blokken 001 t/m 003 de pijl-link in hetzelfde scherm als het label, zonder te scrollen.
4. Op 390 en 768 px scrolt `document` nergens horizontaal, ook niet halverwege het openslaan van een kaft. Dit wordt getoetst op Chromium en op WebKit (iPhone).
5. Alle tekst op mauve, salie en perzik is inkt, met minimaal 4,5:1. De quote in de kop is wit en ≥ 24 px op terracotta. Kleine tekst op de kaften ("LUX mini — Babynest", "Lookbook · Babynest") haalt 4,5:1, bijvoorbeeld inkt op een lichte strook of met een donkere sluier. axe vindt geen fout.
6. De lopende tekst in de blokken is ≥ 16 px, met regels van hooguit 75 tekens. Labels zijn minimaal 13 px.
7. Er staat hooguit één schermhoogte vastgezet per blok. In een schermafdruk tijdens het scrollen is geen enkel scherm leeg (alleen kleur).
8. Met `prefers-reduced-motion` staan boek en magazine open, staan alle tekstregels er direct en schuift er niets. Zonder JavaScript zijn de open spread en de eerste tabletfoto zichtbaar.
9. De pijl-links hebben een tikdoel van ≥ 44 px. "Bespreek je idee" en "Vraag ernaar" gaan naar `contact.html?onderwerp=babynest#formulier`. "Bekijk de stoffen" landt met de kop "De stoffen" onder de vaste balk.
10. De balk toont het label van het huidige blok (001–006) en heeft het donkere logo op de lichte tinten.
11. Op 1280, 1440 en 1920 px staat bij scrollpositie 0 de rechterrand van het grote logo minimaal 24 px links van de eerste menulink, en staat het menu op één regel. Op 1024, 768 en 390 px overlapt het grote logo de burger niet en staat het ≥ 12 px vrij van de eerste foto en de h1 van de hero. Op contact is het logo wit, bij `html.hero-licht` donker.
12. Het logo staat op de gewone maat (44 px, mobiel 36 px) voordat de balk verschijnt. De layout verschuift niet door het krimpen (CLS 0 voor de header). Bij minder beweging staat het logo altijd op de gewone maat. Het grote "LUX" is in 2× scherp.

### Voorgestelde CLAUDE.md-regels
- Babynest-pagina (`babynest.html`, mock-up goedgekeurd door Carst 14 nov., zoals het Media-overzicht van Stock): paginakop op terracotta met label "Babynest" en de quote; drie blokken om en om, eigen kleur, tekst inkt: 001 Het nest (mauve) boek dat inschuift en om de rug openslaat (stof links, nest van boven rechts); 002 De stof (salie) eigen LUX mini-lookbook ("LUX mini", "Lookbook · Babynest"; nooit een bestaand tijdschrift suggereren); 003 Het dekentje (perzik) tablet zonder merk met drie doorschuivende foto's en puntjes. Per blok label, kop Libre Caslon Display, één zin, één pijl-link; regels één voor één van onder (y 50 → 0, 1 s, 0,1 s na elkaar); inschuiven x 150% en draai → 0, 1,5 s, cubic-bezier(.65,0,.35,1). Object desktop ≤ ca. 40% (pagina ≤ 384 px), hooguit één schermhoogte vastgezet. Mobiel/tablet onder elkaar, object eerst, kaft verdwijnt bij 90°, geen horizontaal scrollen, touch native. Minder beweging en geen JS: open, eerste tabletfoto. Daarna 004 Prijs, 005 Zo werkt het, 006 Contact (foto nest voorkant).
- Logo (wens Carst 14 nov., optie A, zoals Stock): op alle openbare pagina's (niet /beheer) bovenaan alleen "LUX" (1474 px, wit en donker volgens hero-licht/kop-donker), ca. 2,5 × de headermaat, krimpt vloeiend (transform, linksboven, gereserveerde ruimte) naar "LUX mini" binnen ca. 40% schermhoogte, vóór de balk, groeit terug. Overlapt nooit menu, burger, linkrij of hero-foto/kop; bij krapte kleiner dan 2,5 ×. Minder beweging en geen JS: gewone maat. aria-label "LUX mini, naar de homepage".
- Ook bijwerken: de Intro-regel noemt het logo; Logo-regel bovenaan ("witte versie los op terracotta…") aanvullen.

## Bestanden
- `public/babynest.html`: nieuwe opbouw (kop, 001–003 met objecten, 004–006 hernummerd, contactfoto)
- `public/kraamcadeauboxen.html`: alleen bij "Ja" op open vraag 2 (`id="stoffen"` op de h3 "De stoffen")
- `public/index.html`, `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `inspiratie.html`, `contact.html`, `privacy.html`, `bedankt.html`, `404.html`: header-logo met de grote versies
- `public/assets/css/style.css`: blokken en objecten van Babynest, logo groot/klein, gereserveerde ruimte, regels voor minder beweging en zonder JS
- `public/assets/js/main.js`: inschuiven, openslaan, vastzetten (alleen desktop), tabletwissel, tekstregels, logoschaal op de afgevlakte scrollwaarde
- `public/assets/img/`: `babynest-voor.jpg`, `babynest-boven.jpg`, `babynest-deken.jpg`, `babynest-rits.jpg`, `logo-lux-groot-wit.png`, `logo-lux-groot-donker.png` (namen voorgesteld)
- `tests/e2e/babynest-media.spec.js`, `tests/e2e/logo-krimpen.spec.js` (nieuw); waar nodig de verwachte waarden in bestaande specs
- `scripts/controleer.py`: `PRODUCTPAGINAS["babynest.html"]` en een controle van het header-logo
- `tests/e2e/basis/`: basisschermen (via `visueel-basis.yml`)
- `CLAUDE.md`: Babynest-regel, Logo-regel, Intro-regel, productpaginaregel en mapbeschrijving

## Buiten scope
- Geen prijs voor het babynest. Het prijsblok blijft de neutrale zin.
- Geen nieuwe teksten buiten de goedgekeurde mock-up, en geen nieuwe quote van Carien.
- Geen wijziging aan het formulier (`contact.html#formulier`, `src/`), `_redirects`, `_headers`, `wrangler.jsonc` of `.github/workflows/`.
- Het logo in de vaste balk, het intro-logo en het menu over het hele scherm veranderen niet, behalve dat ze naast het nieuwe header-logo moeten blijven werken.
- `/beheer` verandert niet.
- De Media-objecten komen niet op andere pagina's (Prematuurkleding blijft zoals hij is).
- `og:image` (`ig-babynest.jpg`), titel en beschrijving van de pagina blijven gelijk (zie open vraag 6).

## Open vragen
**Blokkerend**
1. **De exacte teksten.** Het gaat om de kop en de zin per blok (001–003) en, als die verandert, de quote in de paginakop. Volgens de wens heeft Carst ze goedgekeurd ("yours is ok"), maar ze staan niet in de opdracht en niet in de repo. De bouwer verzint niets. De hoofdsessie zet de teksten uit de mock-up hier in de brief of geeft ze aan de bouwer. Zonder die teksten blijft de quote van nu staan ("Een babynest in de stof en kleur die jij kiest.").
2. **Welke foto waar.** Er zijn vier foto's: voor, boven, deken en rits. Nodig zijn de kaften, de spread van het boek (stof links, nest van boven rechts), de binnenkant van het magazine, drie tabletfoto's en de contactfoto (voorkant). Uit de ontwerprichting volgt alleen: "boven" rechts in het boek en "voor" als contactfoto. De rest moet uit de mock-up komen. Zonder die toewijzing kan de bouwer de voorstelling van de goedgekeurde mock-up niet zeker nabouwen.

**Niet blokkerend**
3. **Stoffen bij het babynest.** Gelden de negen stoffen van de kraamcadeauboxen ook voor het babynest? Carst wordt nu gevraagd.
   - Ja: "Bekijk de stoffen" → `kraamcadeauboxen.html#stoffen`, plus `id="stoffen"`.
   - Nee: "Vraag naar de stoffen" → `contact.html?onderwerp=babynest#formulier`.
   - De bouwer begint met "Nee", tenzij de hoofdsessie iets anders meldt.
4. **Eén story per brief.** Deze brief bevat twee stories (A Babynest, B Logo) in één pull request, op wens van Carst. Ze komen in aparte commits.
5. **Akkoord van Carien.** De teksten zijn goedgekeurd door Carst. De bestaande opmerkingen "wacht op akkoord Carien" op deze pagina blijven staan tot Carien de teksten heeft gezien.
6. **Deelafbeelding.** Moet `og:image` naar de nieuwe voorkantfoto? Voorstel: pas in een volgende wijziging.
7. **Grootte van het logobestand.** 1474 px is ruim meer dan 2× de weergave (ca. 290 px breed bij 110 px hoog). De bouwer mag een kleinere scherpe webversie maken van minstens 3× de grootste weergave. Het origineel blijft buiten de site.
8. **Intro.** Volgens de ontwerper moet de Intro-regel worden bijgewerkt, maar niet wat er precies verandert. Voorstel: de intro blijft zoals hij is, en na het optrekken van het doek staat het header-logo groot. De ontwerper bevestigt dit bij de ontwerpgate.
9. **Bronbestanden.** De bronbestanden staan in een tijdelijke scratchpad. Iemand moet de originelen in de mediamap buiten de site zetten voordat die map wordt gewist.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov.): Babynest als Media-overzicht en logo groot → klein (optie A). Ontwerprichting, ontwerpcriteria en CLAUDE.md-regels van website-ontwerper letterlijk overgenomen. Risico midden (header op alle pagina's en `main.js`). Twee stories in één pull request op wens van Carst. Blokkerend: teksten en foto-indeling uit de mock-up |
| Bouwen | website-bouwer | Twee commits: A Babynest (boek, magazine, tablet; 004 richtprijs € 95; stoffenanker; drieluik met volle babynestfoto) en B Logo groot → klein (+ CLAUDE.md en brief). Nieuwe specs `babynest-media.spec.js` en `logo-krimpen.spec.js`; sitecontrole: eigen controle Babynest en header-logo. Verwachte waarden aangepast na besluiten Carst (geen versoepeling): Babynest-opbouw 001–006 en LET OP's in `controleer.py`, drieluik-babynest (was: ingelijst ≤ 324 px, nu: vult de kolom zoals de andere twee, tekst wit, ≤ 768 px) in `controleer.py` en `homepage-zoals-stock.spec.js`. Keuzes: groot logo 92 px op 761–1279 px (110 px raakt de kop van de subpagina's), vanaf 1280 px zo groot als past naast het menu (44–85 px), met een muis op 1240–1279 px geen groot logo (linkrij); vastzetten op desktop 0,7 scherm. Lokaal: `npm test` 134/134, sitecontrole geen fouten, Playwright (Chromium: desktop, tablet, mobiel) 400 geslaagd / 0 fout zonder de twee axe-specs. Niet lokaal te draaien (npm-register geblokkeerd, WebKit niet geïnstalleerd): axe (`toegankelijkheid`, `beheer-toegankelijkheid`), Lighthouse, wrangler dry-run, project iPhone (WebKit) en visueel; die draaien in CI. Visueel (Gate 5, waarschuwing, bedoeld): header bovenaan op alle pagina's, heel `babynest.html`, het drieluik op de homepage en het anker op `kraamcadeauboxen.html` niet zichtbaar. |
| Controleren | website-controleur | |
| Bouwen ronde 2 | website-bouwer | Na NIET AKKOORD ronde 1 (alleen tests en sitecontrole; site niet gewijzigd, geen grenzen versoepeld). `babynest-media.spec.js`: "halverwege openslaan" scrolt zonder zacht scrollen (`behavior: 'instant'`) en wacht met `expect.poll` op de echte `scrollY` plus twee frames, ook in de lus (geen vaste 250/400 ms meer); de halve stand wordt getoetst op de eerste kaft waarvoor die bestaat (op 768 × 1024 het magazine van 002, het boek van 001 staat daar bovenaan al te ver in beeld), na eerst terug naar boven; doel gelijk (nergens horizontaal scrollen, `--open` strikt tussen 0 en 1). `logo-krimpen.spec.js`: vaste wachttijden vervangen door wachten op de echte toestand (load, letters, geen `intro-aan`, geen lopende overgangen in de header) en scrollen zonder zacht scrollen met wachten op `scrollY`; CLS-test meet na die rust, grens blijft 0. `controleer.py`: in de Babynest-controle de link "Meer over de werkwijze" (→ `werkwijze.html#hoe-ik-werk`) en "#prijs op mobiel hooguit een halve schermhoogte" teruggezet. Lokaal (eigen poort 4231): `npm test` 134/134, sitecontrole geen fouten, Playwright Chromium (desktop, tablet, mobiel) babynest-media, logo-krimpen, homepage-zoals-stock en kernpaden 223 geslaagd / 0 fout (2 workers); tablettest 5× serieel en 5× parallel groen; babynest-media + logo-krimpen 3× herhaald op alle drie schermen groen. Let op: met 4 workers naast een lopende sitecontrole op 2 kernen faalden ook ongewijzigde tijdgevoelige tests (intro, menu); zonder overbelasting groen. Niet lokaal: axe, Lighthouse, iPhone (WebKit), visueel (CI). |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Aanvulling hoofdsessie (14 nov.): teksten en foto's uit de goedgekeurde mock-up

Beslist door Carst ("yours is ok", 14 nov.); dit sluit open vragen 1 en 2. Bron: mock-up `Animatie.dc.html` / `Babynest.dc.html` in het ontwerpcanvas.

**Teksten (letterlijk)**
- Paginakop: label "Babynest", quote "Een babynest in de stof en kleur die jij kiest." (bestaande tekst), daaronder klein de pijl-link "Stuur Carien een bericht".
- 001 — Het nest · kop "Het nest" · zin "Rond en zacht, met een ruime rand. Carien maakt het in de stof en kleur die jij kiest." · pijl-link "Bespreek je idee" → `contact.html?onderwerp=babynest#formulier`.
- 002 — De stof · kop "De stof" · zin "Wafelstof buiten, katoen met print binnen. Met de hand afgewerkt in het atelier in Ospel." · pijl-link "Vraag naar de stoffen" → `contact.html?onderwerp=babynest#formulier` (Nee-variant tot Carst anders zegt).
- 003 — Het dekentje · kop "Het dekentje" · zin "Een dekentje in dezelfde stof maakt het nest compleet." · pijl-link "Vraag ernaar" → `contact.html?onderwerp=babynest#formulier`.
- Kaftteksten: boek "LUX mini — Babynest"; magazine "LUX mini" + "Lookbook · Babynest". Onderschriften op de binnenpagina's (Libre Caslon Text, ≥ 13 px): zie hieronder.

**Foto's (bestanden in de scratchpad `nest-assets/`, nieuwe namen in `public/assets/img/`)**
- `nest-voor.jpg` → `babynest-voorkant.jpg`: alt "Babynest van groene wafelstof met een lapje met het LUX-label aan de voorkant"
- `nest-boven.jpg` → `babynest-boven.jpg`: alt "Babynest van groene wafelstof met een binnenkant met cactussen, van bovenaf"
- `nest-deken.jpg` → `babynest-dekentje.jpg`: alt "Opgevouwen dekentje met cactusprint en groene wafelstof"
- `nest-rits.jpg` → `babynest-stof-rits.jpg`: alt "Close-up van de groene wafelstof met een rits en het LUX-label"

| Blok | Object | Kaft | Linkerpagina (onderschrift) | Rechterpagina (onderschrift) |
|---|---|---|---|---|
| 001 Het nest | boek | voorkant | stof-rits ("De stof") | boven ("Het nest") |
| 002 De stof | magazine | boven (paginavullend, masthead) | stof-rits ("Wafelstof en katoen") | dekentje ("Het dekentje") |
| 003 Het dekentje | tablet | — | — | drie foto's in volgorde: dekentje, stof-rits, voorkant |
| 006 Contact | foto | voorkant | | |

Originele foto's: buiten de repo bewaren (mediamap van Carst); niet committen.

## Aanvulling hoofdsessie (14 nov., na de start van de bouw): besluiten Carst

Doorgegeven door de hoofdsessie (besluiten Carst, 14 nov., via chat). Dit sluit open vraag 3 en wijzigt criterium 5 en 14.

1. **Stoffen: ja.** Het babynest gebruikt dezelfde negen stoffen. De pijl-link in 002 De stof wordt "Bekijk de stoffen" → `kraamcadeauboxen.html#stoffen`; de h3 "De stoffen" op `kraamcadeauboxen.html` krijgt `id="stoffen"` en landt onder de vaste balk (criterium 5, ontwerpcriterium 9).
2. **Prijs babynest.** 004 Prijs krijgt de prijsrichtlijn als eigen regel (kop-m, ca. 32 px): "Richtprijs € 95", daaronder "De prijs kan iets wijzigen, afhankelijk van de stof en extra wensen." en de pijl-link "Vraag naar de prijs" (zoals nu). De LET OP's bij de prijs op `babynest.html` gaan weg. Dit vervangt "Geen prijs voor het babynest" onder Buiten scope en de neutrale zin van criterium 14.
3. **Goedgekeurd door Carst** (LET OP weg op `babynest.html`): paginatitel en beschrijving, de quote "Een babynest in de stof en kleur die jij kiest." en de werkwijzestappen (Samen kiezen / Persoonlijk maken / Met zorg gemaakt). De koppen en zinnen van 001–003 houden "LET OP: wacht op akkoord Carien" (open vraag 5).
4. **Drieluik op de homepage (Carst, 12:41, screenshot 001 Producten, kolom 03).** Nieuw criterium 34: de babynestkolom in het drieluik van `index.html` is net zo vol als Kraamcadeauboxen en Prematuurkleding: `babynest-boven.jpg` (768 × 960) in `.kern-beeld` met dezelfde klassen en maten, de foto schuift in bij aanwijzen (tekst wit, zelfde sluier), op touch foto boven de tekst op volle breedte. De ingelijste kleine foto (`.nest-lijst`, `ig-babynest.jpg`) en de bijbehorende LET OP gaan weg. De foto wordt nergens breder dan 768 px getoond. Sitecontrole en `homepage-zoals-stock.spec.js` toetsen dat de babynestkolom nu hetzelfde is als de andere twee (vult de kolom, tekst wit, niet breder dan het bestand).

Andere pagina's worden alleen aangepast voor het logo, het stoffenanker en het drieluik; overige goedkeuringen gaan in een aparte pull request.
