# Homepage, menu, pagina-overgang, kraamcadeauboxen en formulier zoals Stock

- **Datum:** 6 november 2026
- **Aangevraagd door:** Carst (6 nov., 11:35)
- **Branch:** `wijziging/homepage-zoals-stock`
- **Risico:** hoog. De wijziging raakt het contactformulier (HTML, CSS `:has`, JavaScript om vooraf in te vullen en de Worker in `src/formulier.js`). De homepage krijgt een nieuwe opbouw, oude ankers (`/producten#…`) moeten blijven werken, en menu, pagina-overgang en intro veranderen op alle pagina's. Ook tests veranderen functioneel. `wrangler.jsonc`, `_redirects` en `.github/workflows/` veranderen niet.

## Wens (Carst, 6 nov. 11:35, samengevat door de hoofdsessie)
1. Homepage zoals Stock:
   - de intro iets langzamer;
   - de hero-posities precies zoals bij Stock;
   - een drieluik Kraamcadeauboxen / Prematuurkleding / Babynest in plaats van de vijf productblokken;
   - technieken zoals Stock Projecten;
   - Inspiratie als grote foto met tekst;
   - Instagram als laatste.
   - Alle blokken linken naar de hoofdpagina's.
2. Menu: de links verschijnen bij het aanwijzen van de burger.
3. Pagina-overgang: soepeler, zoals Stock.
4. Kraamcadeauboxen: de losse producten (knuffel, swaddle, broekje, sjaaltje, shirtje, douchehandschoen, bijtring) en een scrollbare rij met de stoffen.
5. Contactformulier met keuzevelden:
   - kraamcadeaubox: box 1–4, thema/stof en naam;
   - vergelijkbaar voor prematuurkleding en babynest;
   - vooraf ingevuld vanaf de pagina's.

## Besluiten (hoofdsessie, 6 nov.)
- **Niets blokkeert.** De bouwer zet `<!-- LET OP: wacht op akkoord Carien -->` als plaatshouder bij:
  - de techniek "Levendig en persoonlijk" (Borduren);
  - de velden voor prematuurkleding en babynest, en de kledingmaat in de groep Kraamcadeaubox;
  - de labelnaam "001 — Producten";
  - de douchehandschoen zonder foto.
- **Tests:** tests die door deze wens functioneel veranderen, mogen mee veranderen, omdat ze het gedrag volgen dat Carst vraagt (zie "Testaanpassingen ter beoordeling door Carst"). Er wordt geen enkele grens versoepeld.
- **Mail:** geen wijzigingen aan de mail- en notificatie-instellingen of aan Email Routing.

## Doel
De bezoeker ziet op de homepage in één oogopslag de drie hoofdproducten. Elk blok leidt direct naar de juiste pagina, en de site voelt rustiger en vloeiender aan, zoals Stock. Wie een kraamcadeaubox, prematuurkleding of een babynest wil aanvragen, krijgt een formulier dat al op het juiste onderwerp (en formaat) staat en alleen de vragen stelt die erbij horen.

## Acceptatiecriteria
1. **Ontwerpcriteria:** alle twintig ontwerpcriteria in de sectie "Ontwerpcriteria" hieronder zijn gehaald. De website-ontwerper toetst ze in de ontwerpgate, de controleur toetst de meetbare (maten, volgorde, links, contrast, tikdoelen).
2. **Homepage, volgorde:** hero → `001 — Producten` → `002 — Technieken` → `003 — Inspiratie` → `004 — Instagram` → footer.
   - Er staan geen `section.categorie` meer op de homepage en er is geen apart contactblok.
3. **Homepage, links:**
   - **Drieluik:** de drie kolommen linken naar `kraamcadeauboxen.html`, `prematuurkleding.html` en `babynest.html`.
   - **Technieken:** de vier namen linken naar de doelen in de tabel bij A4.
   - **003 Inspiratie:** linkt naar `inspiratie.html` en naar `contact.html#formulier`.
   - **Hero:** "Over Carien" blijft `werkwijze.html#atelier`.
   - **Controle:** de linktest vindt geen kapotte links of ankers.
4. **Oude adressen:**
   - `/producten#prematuur`, `/producten#siliconen`, `/producten#babynest`, `/producten#kraamcadeaubox` en `/producten#babykleding` landen op de homepage, met de kop van het juiste blok onder de balk, op 1440 × 900 en op 390 × 844;
   - `#contact` en `#inspiratie` bestaan;
   - `_redirects` is niet veranderd.
5. **Intro:**
   - bij het eerste bezoek is de intro tussen 2,0 en 2,6 s weg;
   - zonder `main.js` haalt de CSS-noodrem hem vóór 3,1 s weg;
   - overslaan (tik, klik, toets, scroll, vegen) is binnen 0,6 s klaar;
   - geen intro bij "minder beweging", zonder JavaScript of na een pagina-overgang;
   - de hero-tegels zijn tijdens de intro zichtbaar (doorzichtigheid 1) onder het doek.
6. **Menu bij aanwijzen** (`hover: hover` en `pointer: fine`, vanaf de breedte die de bouwer meet en in het verslag zet):
   - aanwijzen van de burger toont binnen 0,9 s de zes links in de menuvolgorde op één regel, zonder overlap met het logo;
   - van de burger naar de links schuiven laat de rij staan;
   - Tab vanaf de burger gaat de zes links in;
   - Esc of de focus eruit verbergt de rij;
   - een klik op de burger opent het menu over het hele scherm, zoals nu;
   - op touch verandert er niets;
   - de rij is een zichtbare `nav` die niet binnen `aria-hidden` staat.
7. **Pagina-overgang:**
   - bij een interne link schuift een effen vlak in een paletkleur in 1 s van boven naar beneden, en schuift het op de nieuwe pagina in 1 s verder weg;
   - geen overgang bij `mailto:`, `tel:`, een nieuwe tab of een anker op dezelfde pagina;
   - met de terug-knop (bfcache) blijft er geen vlak staan;
   - bij "minder beweging" is er geen vlak en geen verschuiving.
8. **Kraamcadeauboxen, producten:**
   - in 001, onder de prijskaarten, staan zeven producttegels: Knuffel, Swaddle, Broekje, Sjaaltje, Shirtje, Douchehandschoen, Bijtring;
   - elke tegel heeft een regel ("vanaf € …" of "in de box van € 80") die klopt met de prijzen in CLAUDE.md;
   - de douchehandschoen heeft geen foto, wel een lijntekening, en in de HTML staat de LET OP-plaatshouder;
   - `docs/fotolijst.md` heeft een nieuwe opname "Douchehandschoen".
9. **Kraamcadeauboxen, stoffen:**
   - in 002, onder het themaraster, staat één horizontaal scrollbare rij met de negen stoffen, met dezelfde namen en in dezelfde volgorde als het raster;
   - de tegels zijn hooguit 240 px;
   - de rij heeft `role="region"`, `aria-label="Stoffen"` en `tabindex="0"`, en scrolt met de pijltoetsen;
   - de pagina scrolt op 390 en 768 niet horizontaal;
   - "negen thema's binnen twee schermen" op 1440 × 900 blijft groen.
10. **Contactlinks met onderwerp:**
    - "Stel deze box samen" bij elk formaat → `contact.html?onderwerp=kraamcadeaubox&formaat=<35|50|65|80>#formulier`;
    - "Vraag je thema aan" en het contactblok op Kraamcadeauboxen → `contact.html?onderwerp=kraamcadeaubox#formulier`;
    - Prematuurkleding → `contact.html?onderwerp=prematuurkleding#formulier`;
    - Babynest → `contact.html?onderwerp=babynest#formulier`;
    - de homepage houdt `contact.html#formulier`;
    - buiten `contact.html`, het menu en de footer staan geen links naar WhatsApp, telefoon of mail in de inhoud.
11. **Formulier, keuzevelden (`contact.html#formulier`):**
    - **Volgorde:** onderwerp → groep bij het onderwerp → bericht → naam, e-mail, telefoon → verstuur.
    - **Onderwerpen:** Kraamcadeaubox, Prematuurkleding, Babynest, Iets op maat laten maken, Iets anders.
    - **Groep Kraamcadeaubox:** formaat (€ 35/50/65/80 als keuzerondjes), thema (de negen thema's plus "Een eigen stof of kleur"), naam op het product, geboortedatum of uitgerekende datum, kledingmaat.
    - **Groepen Prematuurkleding en Babynest:** de velden uit E.
    - **Zichtbaarheid:** alleen de groep van het gekozen onderwerp is zichtbaar.
    - **Zonder JavaScript:** dit werkt via CSS `:has`; zonder `:has` staan alle groepen er, met een legend "Alleen bij een …".
    - **Verplicht:** alle groepsvelden zijn optioneel. Verplicht blijven naam, e-mail en bericht, zoals nu.
    - **Maten:** elk veld heeft een zichtbaar label, tekst van minstens 16 px en tikdoelen van minstens 44 px.
    - **axe:** 0 fouten op `contact.html`, met elke groep open.
12. **Formulier vooraf ingevuld:**
    - `contact.html?onderwerp=kraamcadeaubox&formaat=50#formulier` opent met Kraamcadeaubox en € 50 gekozen;
    - `?onderwerp=prematuurkleding` en `?onderwerp=babynest` kiezen hun onderwerp;
    - `&thema=<bekende waarde>` kiest dat thema;
    - onbekende waarden (bijv. `?onderwerp=x&formaat=99&thema=<script>`) veranderen niets en komen nergens in de pagina terecht;
    - er wordt niet automatisch gefocust;
    - op 390 × 844 staat het label "002 — Stuur een bericht" onder de balk.
13. **Worker (`src/formulier.js`):**
    - "Babynest" staat in `ONDERWERPEN`;
    - de mail bevat alleen de extra velden van het gekozen onderwerp; velden van een ander onderwerp worden genegeerd, ook als ze meegestuurd zijn;
    - `formaat` geldt alleen als 35, 50, 65 of 80;
    - extra tekstvelden gaan door `schoon()`, dus zonder regeleinden en met een maximumlengte (geen kopinjectie);
    - de onderwerpregel heeft dezelfde vorm (`Website: <onderwerp> – <naam>`);
    - afzender, ontvanger, het foutpad `/contact?verzonden=fout#formulier`, `wrangler.jsonc` en de Email Routing veranderen niet.
14. **Plaatshouders:** `<!-- LET OP: wacht op akkoord Carien -->`, met een korte toelichting erbij, staat bij:
    - Borduren ("Levendig en persoonlijk");
    - de velden voor prematuurkleding en babynest;
    - de kledingmaat;
    - het label "001 — Producten";
    - de douchehandschoen.

    De bestaande LET OP's (tijdelijke prematuurfoto, babynestfoto) blijven staan. Het validatierapport toont ze allemaal onder de open punten.
15. **Nieuwe tests** (alle groen):
    - **e2e, formulier:** vooraf invullen (onderwerp, formaat, thema; onbekende waarden genegeerd); per onderwerp alleen de eigen groep zichtbaar; zonder JavaScript is versturen mogelijk met verborgen groepen;
    - **e2e, Kraamcadeauboxen:** de stoffenrij (negen namen gelijk aan het raster, horizontaal scrollbaar, bereikbaar met het toetsenbord, geen horizontale scroll van de pagina); de zeven producten met de juiste prijsregels;
    - **e2e, menu:** de rij verschijnt bij aanwijzen van de burger en bij Tab, verdwijnt met Esc, en verschijnt niet op touch;
    - **unit (`npm test`):** Babynest wordt als onderwerp geaccepteerd; extra velden komen alleen in de mail bij het gekozen onderwerp; een ongeldig `formaat` valt weg; geen regeleinden in extra velden.
16. **Testaanpassingen:**
    - alleen de tests in "Testaanpassingen ter beoordeling door Carst" zijn aangepast;
    - per aanpassing staat in het Verloop wat er veranderde en waarom;
    - geen enkele grens is versoepeld: Lighthouse-drempels in `lighthouserc.cjs` (o.a. LCP ≤ 4000 ms, CLS ≤ 0,1), axe-regels, tikdoelen van 44 px, tekst van 16 px, contrasteisen, de mobiele regels en "negen thema's binnen twee schermen".
17. **CLAUDE.md:** de teksten uit "Wijzigingen in CLAUDE.md" hieronder zijn letterlijk doorgevoerd. Dat zijn ontwerpregels die Carst met deze wens vraagt; hij beoordeelt ze bij GO.
18. **Harness:** `npm test` en `python3 scripts/controleer.py` geven geen fouten, en `npm run check` is groen. De visuele basisschermen worden alleen via `visueel-basis.yml` of na akkoord bijgewerkt.

## Ontwerprichting

### A. Homepage

Volgorde en labels in de balk:
1. Hero (terracotta, ongewijzigd)
2. `001 — Producten` (drieluik)
3. `002 — Technieken`
4. `003 — Inspiratie` (grote foto)
5. `004 — Instagram` (grijsblauw)
6. Footer

Buren hebben nooit dezelfde kleur. Er staat geen apart contactblok meer. De link naar het formulier staat in 003 (zie A5).

**A1 · Intro iets langzamer**
- **Nieuwe tijdlijn, totaal ongeveer 2,2 s:**
  - 0,10 logo in (0,4 s);
  - 0,20 perzik vlak (0,7 s);
  - 0,45 masker en foto (0,7 s);
  - 0,55 en 0,65 tekstregels;
  - 1,45 uitgang: logo en regels, 1,50 figuur, 1,55 doek en pagina (0,65 s);
  - 2,20 klaar.
- **Noodrem en overslaan:**
  - de CSS-noodrem gaat van 2,2 naar 2,9 s, de time-out in `<head>` van 2,5 naar 3,0 s;
  - klikken gaan door naar de pagina vanaf 1,6 s;
  - overslaan blijft binnen 0,6 s klaar.
- **LCP:**
  - tijdens de intro staan de hero-tegels al op doorzichtigheid 1 onder het doek; alleen de verschuiving van 40 px speelt na de intro;
  - zo hangt de LCP niet meer af van de duur van de intro, want onzichtbare elementen tellen niet mee voor LCP;
  - de hero-kop komt op ongeveer 1,55 s op.
- **Terugval:** is de mediaan van de LCP op mobiel toch hoger dan 3,8 s, dan wordt de intro 2,0 s (uitgang op 1,30). Dat zet de bouwer in het verslag.

**A2 · Hero-foto's precies zoals Stock (alleen vanaf 1025 px)**

De maten gelden ten opzichte van het hero-vak. "top" is een percentage van de hero-hoogte, omdat de hero 100svh hoog is. Breedte en hoogte zijn in `--u` (1% van het ontwerpvak, max. 1440). De bovenrand hangt aan de top-waarde; er is geen translateY(−50%).

| Tegel | Stock | top | links/rechts | breedte × hoogte | z |
|---|---|---|---|---|---|
| t2 | links 1 (groot) | 31% | left 11% | 23,5u × 33u | 1 |
| t1 | links 2 | 50% | left 2% | 14,5u × 22u | 2 |
| t3 | links 3 | 70% | left 10% | 12u × 16u | 3 |
| t4 | rechts 1 | 13% | right 24% | 16,66u × 26u | 1 |
| t5 | rechts 2 | 31% | right 18% | 14,5u × 22u | 2 |
| t6 | rechts 3 | 55% | right 23% | 12u × 16u | 3 |

Let op de stapeling: t1 en t2 wisselen van z-index ten opzichte van nu. t6 wordt staand (12 × 16), want beide bestanden zijn staand.

- **Rust:** de foto's staan recht, zonder kanteling of `transform`.
- **Muis, links:** t1, t2 en t3 bewegen tegen de muis in, dus bij een muis rechtsonder naar linksboven.
- **Muis, rechts:** t4, t5 en t6 bewegen met de muis mee, naar rechtsonder.
- **Factoren en uitslag:**
  - de factoren zijn 1/20, 1/15 en 1/10, achter elkaar per tegel;
  - de grootste uitslag is ongeveer 37 × 51 px op 1440 × 900;
  - de kanteling bij bewegen is hooguit 4° (nu 8°).
- **Wat gelijk blijft:**
  - kop, cirkel, badge, quote, sets, tabjes en de pijl-link "Over Carien";
  - `pasKopIn` blijft zorgen dat de kop niet over t4 valt.
- **Tablet (761–1024) en mobiel:** de huidige posities in % blijven staan, in een eigen mediaquery.
- **Minder beweging:** de foto's bewegen niet mee en kantelen niet.

**A3 · Drieluik `001 — Producten`** (vervangt de vijf productblokken)
- **Patroon:** `.kernwaarden` en `.kern-kolom` hergebruiken. Het script kleurt niet meer de bovenkant (`zetHeroKleur`); elke kolom heeft een eigen achtergrond.
- **Opbouw desktop (vanaf 1025 px):**
  - hoogte `clamp(600px, 100svh, 900px)`;
  - drie gelijke kolommen;
  - label linksboven op `--rand`.
- **Kolommen, in rust elk een lichte paletkleur met alle tekst in inkt:**
  1. Kraamcadeauboxen: perzik `#DEB799`;
  2. Prematuurkleding: oker `#C89F67`;
  3. Babynest: mauve `#B5969E`.
- **Inhoud per kolom:**
  - tekstblok op 1/12 vanaf de kolomrand, `min(280px, kolom − 2 × 24px)` breed, verticaal in het midden;
  - nummer "01" in Libre Caslon Text, 16 px;
  - kop `.kop-m` (34–50 px) over twee of drie regels, met vaste afbrekingen: `Kraam&shy;cadeau&shy;boxen`, `Prematuur&shy;kleding`, `Babynest`;
  - de korte tekst (16 px, altijd zichtbaar, ook op desktop);
  - één pijl-link.
- **Teksten:** de bestaande producttekst, zonder nieuwe feiten:
  - "Handgemaakte babyproducten in één thema, met naam en geboortedatum. Vanaf € 35."
  - "Maatwerk in (prematuur)babykleding. Ook prematuurmaten."
  - "Een babynest in de stof en kleur die jij kiest."
- **Pijl-links:** "Bekijk de kraamcadeauboxen", "Bekijk prematuurkleding" en "Bekijk het babynest". Elke link heeft een `::after` die de hele kolom aanklikbaar maakt. Er is één tabstop per kolom; `tabindex` op de kolom vervalt.
- **Scheidingslijn:** 1 px wit, alleen tussen de kolommen, verticaal in het midden, `calc(var(--u) * 18)` hoog, volle dekking (nu 0,15).
- **Bij aanwijzen of focus in de kolom (muis vanaf 761 px):**
  - de foto schuift van boven in: masker −101% → 0, foto zoom 1,3 → 1, 1 s `cubic-bezier(.215,.61,.355,1)`;
  - zwarte onderlaag, foto op 0,6;
  - nummer, kop, tekst en pijl-link worden wit;
  - de andere kolommen blijven zoals ze zijn.
- **Foto's per kolom:**
  - Kraamcadeauboxen: `hero-box-open.jpg` (1400², cover);
  - Prematuurkleding: `p-broekje-kleur.jpg` (tijdelijk, met dezelfde LET OP als nu);
  - Babynest: **niet over de volle kolom**. `ig-babynest.jpg` komt als ingelijste foto van hooguit 324 px boven het tekstblok, op een diepe mauve `#AE8C94`. De tekst blijft daar inkt, want wit van 16 px haalt op die tint geen 4,5:1. Er komt een LET OP en een verwijzing naar fotolijst opname 11.
- **Laag en balk:**
  - de sectie staat met `data-achtergrond="#DEB799"` op de laag; kolom 2 en 3 hebben hun eigen vlak;
  - de balk is perzik met het donkere logo;
  - de sectie heeft één `data-label`, de kolommen geen.
- **Touch (tablet en mobiel):** de foto staat altijd boven de tekst.
  - Tablet, drie kolommen: foto 4:5, kop 34 px.
  - Mobiel, onder elkaar: elk blok in zijn eigen kleur, foto `min(100%, bestand)` 4:3, nummer, kop 40 px, tekst en pijl-link. Babynest heeft daar een foto van hooguit 324 px, gecentreerd.
- **Oude ankers:** elke kolom wordt een geneste `<section>` met id en een eigen `h2`. Zo vindt de kernpaden-test de juiste kop, ook op mobiel.
  - `#kraamcadeauboxen` en `#kraamcadeaubox` → kolom 1;
  - `#prematuurkleding` en `#prematuur` → kolom 2;
  - `#babynest` → kolom 3.
- **Minder beweging:** de foto staat er direct, zonder schuiven of zoom.

**A4 · Technieken `002 — Technieken`**
- **Patroon:** `.hoverlijst.sferen` met de kaarten `.sfeer-kaarten` voor touch en zonder JavaScript. De structuur staat in git (brief 2026-11-02-stock-pariteit).
- **Rust:**
  - de laag is wit;
  - vier namen in Libre Caslon Display, `clamp(30px, 5.2vw, 76px)`, gecentreerd, op één regel, in inkt;
  - onder de lijst één pijl-link "Zo personaliseert Carien" → `werkwijze.html#personaliseren`.
- **Bij aanwijzen of focus (muis):**
  - de laag gaat in 1 s rustig naar de diepe tint van het item;
  - de actieve naam wordt wit (1), de andere namen wit op 0,35;
  - label en pijl-link blijven inkt op 0,2;
  - een grote en een kleine foto verschijnen achter de naam, met een warme sluier van 28% en 20%;
  - de productregel is 19 px vet in kapitalen, wit;
  - de foto's bewegen verticaal mee met de muis.
- **Items en bestemmingen:** de namen zijn **links**, met als toegankelijke naam "naam: productregel".

| Naam | Diepe tint | Productregel | Groot / klein | Link |
|---|---|---|---|---|
| Warm en persoonlijk | perzik `#C88654` | Belettering | `pers-naam.jpg` / `p-bijtring-kleur.jpg` | `werkwijze.html#personaliseren` |
| Rustig en functioneel | salie `#839C75` | Siliconen items | `p-bijtring-naam.jpg` / `p-bijtring-giraf-kleur.jpg` | `inspiratie.html#siliconen` |
| Specifiek en oog voor detail | olijf `#999575` | Prematuurkleding | `p-broekje-kleur.jpg` / `p-shirtje-kleur.jpg` | `prematuurkleding.html` |
| Levendig en persoonlijk | mauve `#AE8C94` | Borduren **(LET OP)** | `p-knuffel-naam.jpg` / `pers-sjaaltje-naam.jpg` | `inspiratie.html#textiel` |

- **LET OP-punten:**
  - de techniek bij "Levendig en persoonlijk" is niet bevestigd;
  - de beletteringsfoto's (doos en zakje TOBI) laten belettering op kleding niet zien;
  - Prematuurkleding gebruikt een tijdelijke foto.
- **Touch en zonder JavaScript:** veegbare kaarten (`min(78vw, 320px)`).
  - Elke kaart is één link, op de diepe tint.
  - Foto 4:5, naam wit 24 px, productregel wit 19 px vet.
- **Oude ankers:** `#babykleding` en `#siliconen` worden een `.anker` bovenaan deze sectie.

**A5 · Inspiratie `003 — Inspiratie`**
- **Patroon:** `.statement.donker`.
- **Maat:** `clamp(560px, 100svh, 900px)` hoog, foto over de volle breedte.
- **Foto:** `box-hero-wide.jpg` met `object-position: 85% 50%`. Die foto staat ook op Kraamcadeauboxen; een eigen foto is P3, zie "Kan beter".
- **Sluier:** 52% inkt, plus links een verloop naar 60% onder de tekst.
- **Tekst, in wit:**
  - label op `--rand`;
  - kop "Ieder nieuw leven is bijzonder" in Libre Caslon Display `clamp(36px, 4.5vw, 65px)`, links op 16,67%, hooguit 50% breed, zonder aanhalingstekens en zonder naamregel (het is een slogan van de oude site, geen quote).
- **Pijl-links in een `.pijl-rij`, 17 px:**
  - "Bekijk alle inspiratie" → `inspiratie.html`;
  - "Stuur Carien een bericht" → `contact.html#formulier`.
- **Ankers:** de sectie krijgt `id="inspiratie"`, en `#contact` wordt hier een `.anker`.
- **Mobiel:**
  - tekst onderaan het beeld, `--rand` aan beide kanten;
  - kop 36 px;
  - de links onder elkaar.

**A6 · Instagram `004 — Instagram`:** het blok blijft zoals het is, alleen het nummer verandert. De homepage eindigt hiermee, met daarna de footer.

### B. Menu: links naast de burger bij aanwijzen
- **Wanneer:** alleen bij `(hover: hover) and (pointer: fine)` en vanaf de breedte waarop de zes links op één regel passen tussen het logo en de burger, met minstens 24 px lucht. De bouwer meet die breedte; de richtwaarde is ongeveer 1180 px. Daaronder opent alleen een klik het menu.
- **Bovenaan de pagina (vanaf 1280 px):** de links staan er al, zoals nu.
- **Na 100 px scrollen:**
  - de links vervagen één voor één: y 0 → 5 px, doorzichtigheid → 0, 0,5 s, 0,1 s na elkaar;
  - bij aanwijzen van de burger of de linkrij komen ze terug: y 5 → 0, 0,5 s, 0,1 s na elkaar, van links naar rechts;
  - de vaste balk schuift tegelijk in, zodat de links altijd op de balkkleur staan;
  - het sectielabel in de balk vervaagt zolang de links er staan.
- **Aanwijsgedrag:**
  - de aanwijszone is de burger plus de rij plus de ruimte ertussen;
  - verschijnen na 80 ms, verdwijnen 400 ms na het verlaten, zodat de rij niet flikkert als je van de burger naar links schuift.
- **Opmaak:**
  - zoals de headerlinks: Source Sans 3, 13 px, 700, kapitalen, spatiëring 0,3em, inkt;
  - op Contact bovenaan wit over de donkere foto;
  - bij aanwijzen groeit een lijn van 1 px, 6 px onder de letters, van links naar rechts (0,4 s);
  - `aria-current` blijft vast onderstreept.
- **Positie:** het einde van de rij ligt 24 px links van de burger, verticaal op het midden van de burger.
- **Toetsenbord:**
  - focus op de burger toont de rij;
  - Tab gaat daarna de zes links in;
  - Esc of de focus eruit verbergt de rij;
  - Enter of een klik op de burger opent het menu over het hele scherm, zoals nu;
  - is dat menu open, dan toont de rij niet.
- **Toegankelijkheid:** de rij is een echte, zichtbare `nav`, niet binnen `aria-hidden` (de balk is nu `aria-hidden`).
- **Touch:** ongewijzigd: een tik opent het menu over het hele scherm.
- **Minder beweging:** de rij verschijnt en verdwijnt direct.

### C. Pagina-overgang
- **Weg (1 s, `cubic-bezier(.65,0,.35,1)`):**
  - een effen vlak schuift van boven naar beneden over de pagina (−100% → 0);
  - header en `main` zakken tegelijk 150 px (op mobiel 80 px);
  - daarna wisselt de pagina.
- **Binnen (1 s, dezelfde curve):**
  - het vlak staat bij het laden dicht en schuift verder naar beneden uit beeld (0 → 100%);
  - de nieuwe pagina komt van −150 px (mobiel −80) naar 0;
  - dit start op `DOMContentLoaded`, niet op `load`.
- **Kleur:** willekeurig uit perzik, oker, salie, mauve, olijf en terracotta. Dezelfde kleur geldt bij weg en binnen (bewaard met `lux-overgang`). Er staat geen tekst op het vlak, dus contrast speelt geen rol.
- **Overslaan:** een klik of toets tijdens het binnenkomen maakt het vlak direct af.
- **Terug-knop (bfcache):** vlak open en pagina op 0.
- **Geen overgang** bij mailto, tel, nieuwe tab of ankers op dezelfde pagina.
- **Minder beweging:** direct, zonder vlak en zonder verschuiving.
- **Intro:** er volgt nooit een intro na een overgang (dat blijft zo).

### D. Kraamcadeauboxen
- **Volgorde blijft gelijk:**
  1. kop;
  2. statement;
  3. `001 — Kies je formaat`;
  4. `002 — Thema's`;
  5. `003 — Zo werkt het`;
  6. `004 — Contact`.
- **De producten**, in 001 direct onder de prijskaarten en vóór `.formaten-voet`:
  - subkop "Wat er in de box kan" (Libre Caslon Text, 24 px);
  - zeven tegels: foto 3:4, naam in Libre Caslon Display 20 px, regel 16 px "vanaf € 35/50/65/80". Die bedragen volgen uit de prijzen die al op de site staan; er is niets verzonnen.

| Product | Foto | Regel |
|---|---|---|
| Knuffel | `p-knuffel-naam.jpg` | vanaf € 35 |
| Swaddle | `p-swaddle-open-kleur.jpg` | vanaf € 35 |
| Broekje | `p-broekje-kleur.jpg` | vanaf € 35 |
| Sjaaltje | `p-sjaaltje-kleur.jpg` | vanaf € 50 |
| Shirtje | `p-shirtje-kleur.jpg` | vanaf € 65 |
| Douchehandschoen | **geen foto** | vanaf € 65 |
| Bijtring | `p-bijtring-kleur.jpg` | in de box van € 80 |

  - Gebruik de 600-versies via srcset, met `loading="lazy"`.
- **Douchehandschoen:**
  - een vlak in grijsblauw (3:4) met een lijntekening van een washandje (1,3 px, zelfde stijl als `.takje`) en de naam;
  - geen nepfoto en geen tekst "foto volgt" voor de bezoeker;
  - een LET OP in de HTML en een nieuwe opname in `docs/fotolijst.md`.
- **Indeling per scherm:** desktop zeven kolommen naast elkaar (geen scroll); tablet en mobiel een veegbare rij (tegels 160 px, mobiel 136 px, rand tot de schermkant).
- **De stoffen**, in 002 direct onder het themaraster en vóór "Vraag je thema aan":
  - subkop "De stoffen" (24 px);
  - één horizontale rij met de negen stoffen, in dezelfde volgorde en met dezelfde namen als het raster;
  - tegel 200 px desktop en tablet, 128 px mobiel, vierkant; nooit groter dan 240 px, want het bestand is 240 px;
  - naam eronder in Libre Caslon Text 16 px.
- **Gedrag van de stoffenrij:**
  - de rij loopt door tot de rechter schermrand, zodat de afgesneden tegel laat zien dat je kunt vegen;
  - `scroll-snap`;
  - dunne scrollbalk op desktop, verborgen op touch;
  - `tabindex="0"` met `role="region"` en `aria-label="Stoffen"`; pijltoetsen scrollen;
  - het wiel-script laat horizontaal scrollen met rust (dat doet het al).
- **Compact houden:** de stoffenrij voegt ongeveer 300 px toe. De meting "negen thema's binnen twee schermen" (label tot het laatste thema) blijft gelden.
- **Links:**
  - "Stel deze box samen" → `contact.html?onderwerp=kraamcadeaubox&formaat=35#formulier`, enzovoort per formaat;
  - "Vraag je thema aan" en het contactblok → `contact.html?onderwerp=kraamcadeaubox#formulier`.

### E. Contactformulier met keuzevelden
- **Nieuwe volgorde, eerst waar de bezoeker voor komt:**
  1. Waar gaat je vraag over?
  2. De groep bij dat onderwerp.
  3. Je idee.
  4. Naam, e-mail en telefoon.
  5. Verstuur.
- **Onderwerpen:** Kraamcadeaubox · Prematuurkleding · Babynest (nieuw) · Iets op maat laten maken · Iets anders. Babynest moet ook in `ONDERWERPEN` in de Worker.
- **Groep Kraamcadeaubox** (`fieldset`, `legend` "Je kraamcadeaubox", serif 16 px):
  - **Formaat:** vier keuzerondjes als kaartjes, wit op 0,92 en inkt. Elk kaartje toont "€ 35" (Libre Caslon Display 24 px) en daaronder 16 px "Knuffel, swaddle en broekje", "Met een sjaaltje erbij", "Met shirtje en douchehandschoen" of "De complete box". De gekozen kaart krijgt een rand van 1 px in inkt en een vinkje. Desktop vier naast elkaar, mobiel 2 × 2.
  - **Thema:** keuzelijst met de negen thema's plus "Een eigen stof of kleur".
  - **Naam op het product** (optioneel).
  - **Geboortedatum of uitgerekende datum** (optioneel, tekstveld).
  - **Kledingmaat** (optioneel, vrij tekstveld, LET OP: de maten zijn niet bekend).
- **Groep Prematuurkleding (LET OP: opties onbekend):**
  - "Maat of gewicht van de baby" (optioneel, vrije tekst);
  - "Naam op het kledingstuk" (optioneel).
- **Groep Babynest (LET OP):**
  - "Stof of kleur" (optioneel);
  - "Naam" (optioneel).
- **Werkt zonder JavaScript:**
  - CSS `form:has(select option[value="…"]:checked)` toont alleen de groep bij het gekozen onderwerp;
  - zonder ondersteuning voor `:has` staan alle groepen er, elk met een legend "Alleen bij een …";
  - alle groepsvelden zijn optioneel, dus een verborgen groep blokkeert nooit het versturen.
- **Vooraf invullen:** JavaScript leest `?onderwerp=`, `formaat=` en `thema=`. Alleen bekende waarden tellen. Er wordt niet automatisch gefocust; de bezoeker landt via `#formulier` op het label onder de balk.
- **Server:** de Worker neemt alleen de velden van het gekozen onderwerp op in de mail.
- **Opmaak:**
  - velden blijven 16 px;
  - nieuwe legends en keuzeteksten zijn 16 px;
  - tikdoelen van de kaartjes en de rondjes zijn minstens 44 px;
  - focus-ring zoals nu;
  - een groep verschijnt met een vervaging van 0,3 s, bij minder beweging direct.
- **Links vanaf de productpagina's:**
  - Prematuurkleding → `contact.html?onderwerp=prematuurkleding#formulier`;
  - Babynest → `contact.html?onderwerp=babynest#formulier`;
  - de homepage houdt `contact.html#formulier`.

## Ontwerpcriteria

1. **Homepage-volgorde:** de balklabels zijn `— LUX mini`, `001 — Producten`, `002 — Technieken`, `003 — Inspiratie`, `004 — Instagram`. Er zijn geen `section.categorie` en geen contactsectie meer.
2. **Hero op 1440 × 900:** de linkerbovenhoeken en maten van t1 t/m t6 kloppen met de tabel op ±2 px. In rust is de `transform` van elke tegel `none`. De stapeling is t2 < t1 < t3 en t4 < t5 < t6.
3. **Hero bij bewegen:**
   - op 1440 × 900 is de uitslag hooguit 40 × 55 px en de kanteling hooguit 4°;
   - links beweegt tegengesteld aan rechts;
   - de kop overlapt geen tegel en is minstens 60 px.
   - Op 768 en 390 zijn de tegelposities gelijk aan de huidige basisschermen.
4. **Hero, overige maten:** op 1280 × 720 en 1440 × 900 valt geen tegel onder de hero over de quote.
5. **Intro:**
   - speelt bij het eerste bezoek en is tussen 2,0 en 2,6 s weg;
   - de noodrem werkt vóór 3,1 s zonder main.js;
   - overslaan is binnen 0,6 s klaar.
   - Lighthouse mobiel `/`: de mediaan van de LCP is hooguit 4,0 s. Is die hoger dan 3,8 s, dan wordt de intro 2,0 s.
6. **Drieluik, desktop:**
   - op 1440 × 900 staat het drieluik in één scherm;
   - de drie kolommen zijn even breed en hebben de kleuren perzik, oker en mauve;
   - geen enkel woord van de koppen steekt buiten zijn kolom, op 1025, 1280 en 1440 px;
   - de witte lijnen zijn 1 px en staan alleen tussen de kolommen.
7. **Drieluik, aanwijzen:**
   - bij aanwijzen of focus ligt binnen 1,1 s de foto over kolom 1 en 2, en zijn kop, tekst en pijl-link wit met een contrast van minstens 4,5:1, gemeten op het lichtste stuk foto;
   - in kolom 3 wordt de foto nooit groter dan 324 px getoond en blijft de tekst inkt;
   - de hele kolom is klikbaar en elke kolom heeft één tabstop.
8. **Drieluik, touch en mobiel:**
   - op 390 en op touch staat de foto boven de tekst;
   - elke pijl-link is zichtbaar zonder aanwijzen;
   - geen foto wordt groter dan het bestand.
9. **Oude ankers:**
   - `/producten#prematuur` en `/producten#siliconen` landen met de kop onder de balk, op desktop en op mobiel;
   - `#kraamcadeaubox`, `#babynest`, `#babykleding`, `#inspiratie` en `#contact` bestaan op de homepage.
10. **Technieken, muis:**
    - vier namen op één regel elk;
    - bij aanwijzen een diepe tint, actieve naam wit, andere namen op 0,35, twee foto's en een productregel van 19 px vet;
    - weg met de muis, focus eruit of Esc: binnen 1 s terug naar wit;
    - elke naam is een link met een toegankelijke naam die de productregel bevat.
11. **Technieken, touch:** kaarten in de diepe tint met witte tekst (24 px en 19 px vet); de rij scrolt alleen horizontaal binnen zichzelf.
12. **Inspiratie-blok:**
    - de foto vult de volle breedte en wordt op 1440 × 900 niet vergroot;
    - witte kop en pijl-links halen minstens 4,5:1 op de sluier;
    - "Stuur Carien een bericht" gaat naar `contact.html#formulier`;
    - op 390 is het blok minstens 560 px hoog en staat de tekst niet over het onderwerp heen.
13. **Contact op de homepage:** er is precies één pijl-link naar `contact.html#formulier` in `main`. Er staan geen WhatsApp-, telefoon- of maillinks in de inhoud.
14. **Menu bij aanwijzen:**
    - vanaf de gemeten breedte verschijnen bij aanwijzen van de burger binnen 0,9 s zes links op één regel links van de burger, in de volgorde van het menu, zonder overlap met het logo;
    - de rij blijft staan als de muis van de burger naar de links gaat;
    - met Tab gaat het van de burger naar de zes links;
    - op touch verschijnt er niets;
    - na een klik op de burger staat het menu over het hele scherm open zoals nu.
15. **Pagina-overgang:**
    - een vlak van boven naar beneden, 1 s weg en 1 s binnen, de pagina verschuift mee;
    - terug-knop zonder vast vlak;
    - bij minder beweging geen vlak en geen verschuiving.
16. **Kraamcadeauboxen, producten:**
    - zeven producttegels; op desktop alle zeven zonder scrollen naast elkaar;
    - de regels "vanaf € …" kloppen met de prijskaarten;
    - de douchehandschoen heeft geen foto, wel een lijntekening en een LET OP in de HTML.
17. **Kraamcadeauboxen, stoffen:**
    - negen stoffen in één horizontaal scrollbare rij, met de namen van het raster;
    - tegels hooguit 240 px;
    - de rij is met het toetsenbord bereikbaar;
    - de pagina zelf scrolt op 390 en 768 niet horizontaal;
    - "negen thema's binnen twee schermen" blijft groen.
18. **Formulier, keuzevelden:**
    - kies je Kraamcadeaubox, dan verschijnt de groep met formaat (€ 35, 50, 65, 80), thema (9 plus eigen) en naam;
    - bij Prematuurkleding en Babynest verschijnt hun groep;
    - zonder JavaScript werkt dit via `:has`, of staan alle groepen er met een legend;
    - alle velden hebben een label, zijn minstens 16 px en hebben tikdoelen van minstens 44 px;
    - axe geeft 0 fouten.
19. **Formulier vooraf ingevuld:** `contact.html?onderwerp=kraamcadeaubox&formaat=50#formulier` opent met Kraamcadeaubox en € 50 gekozen. Op 390 staat het label "002 — Stuur een bericht" onder de balk.
20. **Mobiel algemeen:** de tien mobiele regels zijn groen op alle gewijzigde pagina's, in Chromium en WebKit.

## Wijzigingen in CLAUDE.md (onderdeel van de opdracht, exacte nieuwe tekst)

Dit zijn ontwerpregels die Carst met deze wens vraagt. De bouwer voert ze letterlijk door en Carst beoordeelt ze bij GO.

**Mappen, `index.html`:**
> `index.html` — homepage: één scrollpagina (hero, 001 Producten (drieluik Kraamcadeauboxen · Prematuurkleding · Babynest), 002 Technieken, 003 Inspiratie (grote foto), 004 Instagram); de ankers voor oude adressen (`/producten#…`, `#kraamcadeaubox`, `#prematuur`, `#babynest`, `#babykleding`, `#siliconen`, `#contact`) blijven bestaan; geen formulier

**Mappen, `kraamcadeauboxen.html`:**
> `kraamcadeauboxen.html` — Kraamcadeauboxen: paginakop met intro, statementfoto "Met naam en geboortedatum", 001 Kies je formaat (prijskaarten en de zeven losse producten), 002 Thema's (compact raster en een veegbare rij met de negen stoffen), 003 Zo werkt het, 004 Contact

**Hoofdnavigatie**, deze zin toevoegen:
> Met een muis verschijnen de zes links ook naast de burger zodra je de burger of de linkrij aanwijst of naar de burger tabt (één voor één, y 5 → 0, 0,5 s, 0,1 s na elkaar; op de balkkleur, sectielabel vervaagt); een klik opent het menu over het hele scherm. Op touch alleen de burger. Bij "minder beweging" direct.

**Nieuwe regel na Hoofdnavigatie:**
> - Pagina-overgang (wens Carst 6 nov., zoals Stock): een effen vlak in een willekeurige paletkleur schuift van boven naar beneden over de pagina (1 s, `cubic-bezier(.65,0,.35,1)`), de pagina zakt 150 px (mobiel 80 px); op de nieuwe pagina schuift het vlak verder naar beneden weg en komt de pagina van −150 px naar 0. Bij "minder beweging" direct.

**Homepage**, vervangen door:
> - Homepage (wens Carst 6 nov., zoals Stock): hero; 001 Producten als drieluik (Kraamcadeauboxen perzik · Prematuurkleding oker · Babynest mauve, inkt in rust, dunne witte lijnen tussen de kolommen, bij aanwijzen schuift een foto in en wordt de tekst wit; elke kolom linkt naar de productpagina; op touch foto boven de tekst); 002 Technieken als grote namen (zoals Inspiratie bij aanwijzen: diepe tint, witte namen, twee foto's; op touch kaarten); 003 Inspiratie als één foto over de volle breedte met donkere sluier, witte kop en de pijl-links naar Inspiratie en naar het formulier; 004 Instagram als laatste.

**Kraamcadeauboxenpagina**, deze zin toevoegen:
> Onder de prijskaarten de zeven losse producten met "vanaf € …" (zonder foto: een lijntekening, nooit een nepfoto); onder het themaraster een veegbare rij met de negen stoffen (tegels max. 240 px, het bestandsformaat).

**Contactformulier**, deze zin toevoegen:
> Het formulier begint met het onderwerp (Kraamcadeaubox, Prematuurkleding, Babynest, Iets op maat, Iets anders) en toont daarna alleen de velden van dat onderwerp (zonder JavaScript via CSS `:has`, anders alle groepen); alle extra velden zijn optioneel. Productpagina's linken naar `contact.html?onderwerp=…#formulier` (bij een formaat ook `&formaat=35`), zodat het formulier vooraf is ingevuld.

**Witte tekst**, de opsomming uitbreiden:
> … of op de diepe portfoliotinten bij aanwijzen (Inspiratie en Technieken op de homepage) …

**Hero**, de zin over bewegen vervangen door:
> Vanaf 1025 px staan de foto's op de posities van Stock (bovenrand aan de top, maten in eenheden van het ontwerpvak, zie `docs/ontwerp/bron/stock-analyse-2026-11-06.md` §1), in rust recht; met de muis verschuiven ze licht (links tegengesteld, rechts mee, max. ca. 37 × 51 px) en kantelen ze hooguit 4°. Tablet en mobiel houden hun eigen indeling.

**Intro:**
> - Intro: één keer per sessie bij het eerste bezoek, op elke pagina, ongeveer 2,2 s (wens Carst 6 nov.: iets rustiger; was 1,5 s) (…). Overslaan met tik, klik, toets, scroll of vegen; noodrem in CSS na 3 s. De hero-foto's staan tijdens de intro al zichtbaar onder het doek (LCP). Geen intro bij …

**Optioneel in `docs/ontwerp/principes.md`, Mobiel regel 10:**
> Elk productblok of elke productkolom heeft één duidelijke volgende stap.

## Testaanpassingen ter beoordeling door Carst
**Punt voor het validatierapport.** Volgens CLAUDE.md worden tests niet versoepeld zonder akkoord van Carst. De hoofdsessie heeft besloten dat de tests hieronder mee mogen veranderen, omdat ze het gedrag volgen dat Carst op 6 nov. vroeg. **Carst beoordeelt dit bij GO.** De bouwer zet per punt in het Verloop wat er veranderde. Er wordt geen enkele grens versoepeld (Lighthouse, axe, 44 px, 16 px, contrast, mobiele regels, "negen thema's binnen twee schermen").
- **`tests/e2e/kernpaden.spec.js`:**
  - de volgorde van de homepage wordt hero → 001 Producten → 002 Technieken → 003 Inspiratie → 004 Instagram;
  - de doelen van de productblokken worden de drie kolommen en de techniekenlinks.
- **Intro-duur:** "< 2 s" wordt "≤ 2,6 s" (de wens "iets langzamer"). De noodrem gaat naar < 3,1 s.
- **Contactlinks:** de regex staat ook `contact.html?onderwerp=…(&formaat=…)#formulier` toe. De eis dat elke CTA naar het formulier gaat, blijft.
- **`scripts/controleer.py`:**
  - de headerlinks (menu-rij naast de burger);
  - de producttekst- en blokcontroles op de homepage (vijf blokken worden drie kolommen; de teksten van Babykleding en Siliconen staan niet meer letterlijk op de homepage).
- **Visuele basisschermen:** home, kraamcadeauboxen en contact. Ook alle andere pagina's, omdat de header en de overgang op elke pagina veranderen.

## Bestanden
- `public/index.html`: hero, drieluik, technieken, inspiratie, instagram; contactblok weg.
- `public/kraamcadeauboxen.html`: producten, stoffenrij, links met `?onderwerp=`.
- `public/prematuurkleding.html` en `public/babynest.html`: contactlinks met `?onderwerp=`.
- `public/contact.html`: formulier met onderwerp en groepen.
- Alle overige `public/*.html` (`werkwijze`, `inspiratie`, `privacy`, `bedankt`, `404`): de header met de menu-rij, en de intro-tijden in `<head>`.
- `public/assets/css/style.css`: hero-posities, drieluik, technieken, inspiratieblok, menu-rij, overgang, producten, stoffen, formuliergroepen, intro.
- `public/assets/js/main.js`: intro, hero-beweging, drieluik (§5b), hoverlijst (§4a), menu-rij, pagina-overgang, vooraf invullen van het formulier.
- `src/formulier.js`: Babynest in `ONDERWERPEN`, extra velden per onderwerp, mail.
- `src/contact.js` / `src/worker.js`: alleen als de extra velden daar doorgegeven moeten worden.
- `tests/formulier.test.js`, `tests/contact.test.js`: nieuwe unit-tests.
- `tests/e2e/kernpaden.spec.js`, `tests/e2e/mobiel-ontwerp.spec.js`, `tests/e2e/toegankelijkheid.spec.js`, `tests/e2e/hulp.js`, en een nieuwe spec voor het formulier, de stoffen en het menu; `tests/e2e/basis/` via `visueel-basis.yml`.
- `scripts/controleer.py`, en zo nodig `scripts/schermafdrukken.py` en `scripts/rooktest.sh`.
- `docs/fotolijst.md`: nieuwe opname douchehandschoen.
- `CLAUDE.md`: de teksten hierboven; zo nodig `docs/kwaliteit.md` en `docs/ontwerp/principes.md`.

## Buiten scope
- `wrangler.jsonc`, `_redirects`, `_headers` en `.github/workflows/` veranderen niet.
- Mail- en notificatie-instellingen, Email Routing, afzender en ontvanger veranderen niet.
- Geen nieuwe foto's maken of bewerken. De Kan beter-punten P1 (grotere babynestfoto), P2 (thema's kiezen met stofjes) en P3 (eigen brede sfeerfoto voor 003) blijven liggen.
- Geen nieuwe prijzen, maten of producteigenschappen. De Werkwijze- en Inspiratiepagina's houden hun inhoud.
- De nameservers en het domein (GoDaddy) blijven zoals ze zijn.
- Geen grens in de harness versoepelen.

## Open vragen
Niets blokkeert het bouwen. De punten hieronder worden gebouwd met `<!-- LET OP: wacht op akkoord Carien -->`. Het zijn beslispunten voor Carst en Carien bij GO.
1. **"Levendig en persoonlijk":** welke techniek is dit? Voorlopig staat er Borduren.
2. **Formulier, prematuurkleding:** welke velden wil Carien? Voorlopig maat of gewicht en naam, vrij en optioneel.
3. **Formulier, babynest:** welke velden wil Carien? Voorlopig stof of kleur en naam, vrij en optioneel.
4. **Kledingmaat in de kraamcadeaubox:** welke maten zijn er? Voorlopig een vrij tekstveld.
5. **Labelnaam:** is "001 — Producten" de goede naam? Het is een voorstel.
6. **Douchehandschoen:** er is geen foto (nieuwe opname in de fotolijst). Tot die er is, staat er een lijntekening.
7. **Tijdelijke foto's:** de prematuurfoto (`p-broekje-kleur.jpg`) staat er tijdelijk. De beletteringsfoto's laten geen belettering op kleding zien.
8. **Testaanpassingen:** zie de sectie "Testaanpassingen ter beoordeling door Carst".

## Kan beter (los van deze brief)
- **P1:** een grotere babynestfoto (fotolijst 11), zodat kolom 3 net als de andere kolommen een foto over de volle kolom krijgt.
- **P2:** thema's in het formulier kiezen met stofjes in plaats van een keuzelijst.
- **P3:** een eigen brede sfeerfoto voor 003 Inspiratie, zodat `box-hero-wide.jpg` niet op twee pagina's staat.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief op basis van de wens van Carst (6 nov. 11:35), de besluiten van de hoofdsessie en de ontwerprichting van website-ontwerper (rol 1). Metingen: `docs/ontwerp/bron/stock-analyse-2026-11-06.md`. |
| Bouwen | website-bouwer | Gebouwd op `wijziging/homepage-zoals-stock` in zes commits (Worker, formulier, Kraamcadeauboxen, homepage, menu-rij en overgang, harness en documentatie). **Besluiten Carst 6 nov. 12:04 verwerkt:** (1) teksten mocht de bouwer zelf schrijven; de bestaande producttekst en de namen/regels uit de brief zijn gebruikt (geen nieuwe feiten), Borduren blijft, alle nieuwe teksten houden hun LET OP; (2) label "001 — Producten" goedgekeurd, LET OP weg; (3) formuliervelden prematuur/babynest/kledingmaat minimaal en optioneel met LET OP; (4) douchehandschoen als lijntekening met LET OP en fotolijst opname 20. **Gemeten breedte menu-rij:** de zes links (13 px, 700, 0,3em, tussenruimte als de headerlinks) zijn 866–902 px breed; met 24 px lucht tot het balklogo passen ze vanaf **1240 px** (1230 px: 19 px lucht, 1220: 12 px). Grens in CSS en JS: `(hover: hover) and (pointer: fine) and (min-width: 1240px)`. Zolang de rij open is, verdwijnt het grote headerlogo en staat de balk met het balklogo er (geen twee logo's). Bovenaan vanaf 1280 px opent de rij niet (de headerlinks staan er al). De zesde link is na 0,9 s zichtbaar maar bereikt pas na ca. 1,08 s volle dekking (0,1 s na elkaar en 0,5 s per link, zoals de brief vraagt). **Hero 1440 × 900:** alle zes tegels op 0 px van de tabel; in rust `transform: none`; uitslag max. 36,9 × 50,9 px, kanteling max. 4°; kop 69 px (1280 × 720: 61 px), geen overlap met tegels of quote. **Intro en LCP:** tijdlijn 2,2 s (gemeten in de e2e-test: tussen 1,9 en 2,6 s weg; overslaan ≤ 0,6 s; noodrem zonder main.js vóór 3,1 s); hero-tegels op dekking 1 onder het doek. Lighthouse draait alleen in CI. Lokale vergelijking (Chromium, 4× CPU, 150 ms / 1,6 Mbit, mediaan van 3, eerste bezoek met intro): homepage 1,16 s tegen 1,08 s op `main` — geen aanwijzing voor > 3,8 s, dus de intro blijft 2,2 s; als de CI-mediaan toch > 3,8 s is, gaat de uitgang naar 1,30 (2,0 s). **Contrast (sitecontrole, lichtste plek):** witte kop, tekst en pijl-link op de foto's van kolom 1 en 2 en op de sluier van 003 halen ≥ 4,5:1 (extra sluier 42% onder de tekst in het drieluik; 003 links 66% inkt, mobiel onderaan 68%). **Afwijkingen:** de babynestkolom schuift bij aanwijzen de halve lijsthoogte omlaag zodat de ingelijste foto (max. 324 px) boven de tekst past; op mobiel staat 003 met het zakje "Sem" in beeld (object-position 36%) zodat de tekst niet over de knuffel valt; de namen in Technieken hebben als toegankelijke naam "naam : productregel" (spatie voor de dubbele punt door de verborgen span); het formulier staat zonder adres op Kraamcadeaubox (eerste keuze), de themalijst heeft een lege eerste optie "Nog niet gekozen" zodat het veld optioneel blijft. **Testaanpassingen (ter beoordeling door Carst, geen grens versoepeld):** `kernpaden.spec.js`: volgorde homepage → hero, 001 Producten, 002 Technieken, 003 Inspiratie, 004 Instagram met de doelen van de drie kolommen en de techniekenlinks (was vijf productblokken); oude adressen nu alle vijf `/producten#…` (strenger); contactlink-regex staat ook `contact.html?onderwerp=…(&formaat=…)#formulier` toe; intro "< 2 s" → "1,9–2,6 s" plus nieuwe tests voor dekking onder het doek, overslaan ≤ 0,6 s en noodrem < 3,1 s. `mobiel-ontwerp.spec.js`: regel 7 (contact binnen één tik) herkent ook links met `?onderwerp=`. `scripts/controleer.py`: homepagecontrole herschreven voor drieluik/Technieken/Inspiratie (teksten van Babykleding en Siliconen niet meer op de homepage), `#contact` op de homepage is een anker in 003, prijskaarten/thema's/productpagina's verwachten de links met onderwerp, formuliervelden in de nieuwe volgorde (alleen zichtbare velden gemeten), `aria-current` mag ook in de menu-rij, zonder JS tellen verborgen groepen niet, de Inspiratie-foto wordt gemeten tegen het bestand (naturalWidth is bij srcset dichtheidsgecorrigeerd). Nieuw: `homepage-zoals-stock.spec.js` (formulier, stoffen, producten, menu-rij, overgang), axe-test voor het formulier met elke groep open, unit-tests Worker. Rooktest: extra controle op het drieluik. **Harness lokaal:** `npm test` 17/17; `python3 scripts/controleer.py` 0 fouten; Playwright (Chromium desktop, tablet, mobiel) 119 geslaagd, 0 mislukt. Alleen in CI: axe (`@axe-core/playwright` niet geïnstalleerd), Lighthouse, WebKit/iPhone, Gate 5 (geen basisschermen in `tests/e2e/basis/`; visuele verschillen op alle pagina's zijn bedoeld: header met menu-rij, homepage, Kraamcadeauboxen en contact). |
| Controle ronde 1 | website-controleur (ingevuld door hoofdsessie) | NIET AKKOORD (6 nov.). Groen: npm test 17/17, sitecontrole 0 fouten, Playwright Chromium 119/119; Worker veilig; geen grenzen versoepeld; ankers, contactlinks, prijzen en LET OP's in orde. Op te lossen: (1) Technieken: productregel en onderkant foto's vallen bij aanwijzen achter 003 weg; (2) drieluik: aanwijzen van Babynest verschuift kolom 1 en 2 met 21–36 px. |
| Bouwen (ronde 2) | website-bouwer | Herstel na NIET AKKOORD controle ronde 1. (1) Technieken: de lijst krijgt met een muis een minimale hoogte van 0,46 × het ontwerpvak + 8 px, zodat grote foto (incl. 40 px meebewegen), kleine foto en productregel bij aanwijzen binnen de sectie blijven; nieuwe e2e-test op 1025 × 800, 1280 × 720 en 1440 × 900 voor alle vier items. (2) Drieluik: de babynestfoto staat absoluut boven het tekstblok en het tekstblok schuift met een transform (geen hoogteverandering), dus kolom 1 en 2 blijven staan; de klikbare `::after` van de pijl-link is groter dan de kolom en wordt door de kolom afgesneden (`overflow: hidden`), zodat de hele kolom klikbaar blijft; nieuwe e2e-test: koppen van kolom 1 en 2 en het drieluik vóór en tijdens aanwijzen van Babynest ±1 px, babynestfoto en tekst binnen de kolom (≤ 324 px), op 1025, 1280 en 1440. Kan beter: intro-test ondergrens 2000 ms; overslaan nu in de pagina gemeten (toets → intro weg; opruimen na 520 ms); `ul.producten` krijgt alleen een tabstop als de rij scrolt (main.js, `data-scrollrij`); de Worker accepteert bij thema alleen de negen thema's en "Een eigen stof of kleur" (unit-test); de gebroken strook onder het drieluik is weg: het drieluik heeft een eigen perzik vlak en doet niet meer mee met de kleurlaag (de balk blijft perzik). Lokaal: `npm test` 18/18, sitecontrole 0 fouten, Playwright Chromium (desktop, tablet, mobiel) 121 geslaagd, 0 mislukt. Alleen in CI: axe, Lighthouse, WebKit, Gate 5. |
| Controleren (ronde 2) | website-controleur (ingevuld door hoofdsessie) | AKKOORD (6 nov.). Herstel b2143a4 zelf nagemeten in Chromium op 1025×800 t/m 1920×1080: (1) Technieken: productregel en beide foto's blijven bij aanwijzen binnen de sectie; (2) drieluik: aanwijzen of focus van Babynest verschuift kolom 1 en 2 met 0 px. Geen grens versoepeld (intro-ondergrens 1900 → 2000 ms strenger; overslaan ≤ 600 ms, nu in de pagina gemeten). Worker accepteert alleen de negen thema's en "Een eigen stof of kleur". Lokaal: npm test 18/18, sitecontrole 0 fouten, Playwright Chromium 121/121. Alleen in CI: axe, Lighthouse, WebKit, Gate 5. Ter beoordeling in de ontwerpgate: drieluik op eigen perzik vlak i.p.v. kleurlaag (afwijking brief A3, zichtbaar gelijk). |
| Ontwerpgate ronde 1 | website-ontwerper (ingevuld door hoofdsessie) | ONTWERP NIET AKKOORD (6 nov.). Goed: drieluik, Technieken, 003, menu-rij vanaf 1240, overgang, producten, stoffenrij, vooraf ingevuld formulier; afwijking drieluik op eigen perzik vlak akkoord. Op te lossen: (1) 003-foto tot 2× vergroot op mobiel/tablet (sizes); (2) twee velden "Naam" bij Babynest; (3) reduced-motion-regel voor laag/hero/balk weggevallen. |
| Bouwen (ronde 3) | website-bouwer | Herstel ontwerpgate ronde 1. MOET: (1) `sizes` van de brede foto: homepage 003 `(max-width: 1024px) 1600px, 100vw`, Kraamcadeauboxen-statement `(max-width: 1024px) 1100px, 100vw` (tot 1024 px laadt de browser nu het bestand van 1800 px; nooit meer vergroot); nieuwe toetsen: `mobiel-ontwerp.spec.js` regel 6b (cover-foto's in `.statement` gemeten tegen de echte pixelmaat van het gekozen bestand) en een tablet/mobiel-test in `homepage-zoals-stock.spec.js`; beide vingen de oude code (2×). Let op snelheid: op Kraamcadeauboxen is dit de LCP-foto en die wordt op mobiel ca. 176 kB groter (226 kB in plaats van 50 kB); Lighthouse in CI moet uitwijzen of de LCP onder 4,0 s blijft. Zelfde vergroting bestaat al op `main` bij de kopfoto van Contact (`home-hero-handwerk`, sizes 100vw); niet aangepast (buiten deze ronde). (2) Babynestveld heet "Naam op het babynest" (formulier en mail), LET OP blijft. (3) De regel voor minder beweging (laag, bovenkant, balk direct) staat terug; test met minder beweging: overgangsduur 0 s en de laag direct wit. KAN BETER: Technieken: pijl-link in rust direct onder de namen (gewone sectieruimte), de ruimte voor de foto's zit onderaan de sectie (ronde-1-test blijft groen); sterkere warme sluier onder de actieve naam (40%); "(optioneel)" in de legends van de groepen; "Formaat" in de labelstijl; warme donkere sluier in het drieluik (#2A1C14, contrast blijft ≥ 4,5:1 in de sitecontrole); nieuwe voorbeeldtekst in "Je idee" (met LET OP). CLAUDE.md: drieluik met eigen perzik vlak toegevoegd. Lokaal: `npm test` 18/18, sitecontrole 0 fouten, Playwright Chromium (desktop, tablet, mobiel) 124 geslaagd, 0 mislukt. Alleen in CI: axe, Lighthouse, WebKit, Gate 5. |
| Controleren (ronde 3) | website-controleur (ingevuld door hoofdsessie) | AKKOORD (6 nov.). Herstel 094e779 zelf nagemeten. Geen grens versoepeld (alleen nieuwe tests; verwachting formulier.test.js volgt het nieuwe label). Ronde-2-fixes intact: Technieken productregel en foto's binnen de sectie (marge ≥ 36 px); drieluik 0 px verschuiving bij aanwijzen en focus van Babynest. Worker veilig. LCP Kraamcadeauboxen mobiel: LCP-element is de tekst; gesimuleerd 30–100 ms trager (ca. 1,2 s), pagina 514 kB; risico laag, Lighthouse in CI bevestigt. Lokaal: npm test 18/18, sitecontrole 0 fouten, Playwright Chromium 124/124. Kan beter: bij aanwijzen in Technieken liggen de foto's over de pijl-link "Zo personaliseert Carien" (link blijft bruikbaar). |
| Ontwerpgate ronde 2 | website-ontwerper (ingevuld door hoofdsessie) | ONTWERP AKKOORD (6 nov., 094e779). De drie punten uit ronde 1 zijn opgelost en nagemeten: (1) 003 en statement laden op 375@2x, 390@3x en 768 het bestand van 1800 px (niet vergroot); (2) "Naam op het babynest"; (3) minder beweging: laag, bovenkant en balk direct. Kan-beter-punten verwerkt. Mobiel ✔ (Chromium). Alleen in CI: WebKit/iPhone, axe, Gate 5. Vervolg (P1): sluier grote foto in Technieken naar 55% (witte actieve naam 2,4–2,7:1 op witte fotoachtergrond); P2 kopfoto Contact vergroot op mobiel (bestond al); P3 brede foto vanaf 1800 px; P3 kleurovergang label 001. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

---

## Aanvulling na preview — feedback Carst (6 nov. 14:28)

Carst bekeek de preview van PR #14 en vraagt de volgende aanpassingen op dezelfde branch (geen GO voor de huidige stand):

**F1 · Hero: meebewegen zoals Stock (groter).** Gemeten in hun script (`s-collage`, mousemove):
- Verschuiving in **absolute muispositie**, niet ten opzichte van het midden: `x = clientX / k`, `y = ± clientY / k`. Linkerfoto's y negatief (−), rechterfoto's y positief (+), x voor alle foto's positief.
- k per foto: links 1 = 20, links 2 = 15, links 3 = 10; rechts 1 = 20, rechts 2 = 10, rechts 3 = 15. Op 1440 × 900 is de grootste uitslag dus ca. 144 × 90 px.
- Kanteling: `rotationY = 25 × (clientX / breedte − 0,5)`, `rotationX = 25 × (clientY / hoogte − 0,5)`, dus max. ± 12,5°; perspectief per foto 1500 / 1000 / 500 (k = 20 / 15 / 10).
- Volgen met 1 s Power1.easeOut (ongeveer `cubic-bezier(.25,.46,.45,.94)`, of een lerp in rAF).
- Op de beginstand (vóór de eerste muisbeweging) staan ze zoals nu. Vervangt de grens "max. ca. 37 × 51 px, kanteling hooguit 4°" in CLAUDE.md (Hero). Bij "minder beweging" en op touch: niets.
- Let op: de kop mag door de grotere uitslag niet onleesbaar worden; foto's mogen de kop raken zoals bij Stock, maar de kop blijft boven de foto's (z-index).

**F2 · 001 — Producten: er staat een kleine witte lijn op de pagina** die er niet hoort (los van de bedoelde scheidingslijnen tussen de kolommen). Zoek en verwijder (vermoedelijk een naad of 1 px tussen het perzik vlak van het drieluik en een buursectie, of een scheidingslijn die buiten de kolommen uitsteekt). Test: geen witte pixelrij of -kolom langs de randen van `#producten` op 1440 × 900, 1280 × 720 en 390.

**F3 · Technieken anders benoemen + donkerdere foto's.**
- Het label "Technieken" vindt Carst het verkeerde woord en "persoonlijk" komt twee keer voor. Nieuwe teksten (besluit hoofdsessie, Carst vroeg "ben creatief"): label **`002 — Handwerk`**; de vier namen:
  - **Warm en eigen** · Belettering
  - **Rustig en praktisch** · Siliconen items
  - **Klein en precies** · Prematuurkleding
  - **Speels en levendig** · Borduren
- Elk woord komt één keer voor. Toegankelijke namen en tests mee aanpassen. LET OP-opmerking blijft (Carien leest mee).
- **Foto's donkerder zoals Stock**, zodat de witte tekst beter zichtbaar is: sluier op de grote foto 55% en op de kleine foto 40% (warm donker, `rgba(60,40,30,…)`); hetzelfde principe in het drieluik bij aanwijzen. De witte actieve naam haalt op elke foto minstens 3:1 (meting in de sitecontrole). Dit vervangt "groot 28%, klein 20%" voor de homepage; Inspiratie-pagina blijft zoals hij is.

**F4 · Kraamcadeauboxen anders ordenen, thema's groter.** Nieuwe volgorde:
1. Paginakop en statementfoto (zoals nu).
2. `001 — Kies je formaat`: de vier prijskaarten, op een **andere achtergrondkleur dan nu** (lichte paletkleur, nooit terracotta; inkt; buren nooit dezelfde kleur — ontwerper kiest).
3. `002 — Wat er in de box kan`: de zeven producten en **daaronder de stoffen**, samengevoegd in één sectie.
4. `003 — Thema's`: de negen thema's **groot**: drie mooie voorbeelden naast elkaar, met horizontaal scrollen/vegen naar de volgende set van drie (drie sets). Elke set vult de breedte van het ontwerpvak; foto ca. 4:5 of 4:3, zo groot als het bestand toelaat (nooit vergroot), naam eronder. Scroll-snap per set; pijl-knoppen (vorige/volgende, 44 px, `aria-label`) op desktop, vegen op touch; toetsenbord bereikbaar; op mobiel één thema per keer (snap per tegel), met een stukje van de volgende in beeld. Eén pijl-link "Vraag je thema aan" eronder.
5. `004 — Zo werkt het`, `005 — Contact`.
- Het 3 × 3-raster (`.themaraster`) en de grens "negen thema's binnen twee schermen" vervallen; CLAUDE.md (Kraamcadeauboxenpagina en Mappen) en de tests aanpassen.

**Testaanpassingen ter beoordeling door Carst (aanvulling):** hero-meebewegen (uitslag en kanteling volgen Stock i.p.v. max. 40 × 55 px / 4°), technieken-namen, kraamcadeauboxen-volgorde en thema-carrousel i.p.v. raster. Geen andere grens wordt versoepeld.
