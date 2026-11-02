# Hoofdnavigatie met losse pagina's: Producten, Kraamcadeaubox, Over en Contact

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst
- **Branch:** `wijziging/navigatie-paginas` (al aangemaakt vanaf `main`)
- **Risico:** hoog. Het formulier verhuist van de homepage naar `contact.html`, de doeladressen in `src/worker.js` veranderen, `_redirects` verandert en er komen drie nieuwe pagina's bij. `wrangler.jsonc` en `.github/workflows/` worden niet geraakt.

**Wens (letterlijk):** "Ik wil dat de hoofdnavigatie producten (vergelijkbaar aan media bij stock), kraamcadeaubox (vergelijkbaar op stock met projecten), over en contact (zelfde als stock aan contact) bevat. Als je navigeert via deze knop kom je op een nieuwe pagina (zoals bij stock); de hoofdpagina blijft de bestaande scrollable page. Dan krijg je kraamcadeaubox, dan krijg je producten (met de werkwijze hoe je een product maakt), dan krijg je het gevoel. 'Laat iets voor jou maken' gaat naar contactformulier. Personaliseren gaat ook naar contact. 'Zin om iets te maken' heeft nu op de hoofdpagina een contactformulier; dat moet naar contact."

Bron voor het gedrag van Stock: `docs/ontwerp/bron/stock-analyse-paginas-2026-11-02.md`. We nemen alleen gedrag en maten over, nooit code, teksten, logo of foto's.

## Doel
Een bezoeker vindt via vier duidelijke menu-items (Producten, Kraamcadeaubox, Over, Contact) direct een eigen pagina over wat zij zoekt. De homepage blijft één rustige scrollpagina, en elke vraag om contact komt uit op één contactpagina met het formulier.

## Acceptatiecriteria

### Ontwerpcriteria (van website-ontwerper, volledig overgenomen)

**Navigatie en adressen**

1. Op 1440 px staan in de header van alle pagina's precies vier links: Producten, Kraamcadeaubox, Over en Contact. Elk opent een eigen pagina, geen anker. De huidige pagina heeft `aria-current="page"` en is onderstreept.
2. Het menu over het hele scherm toont op 1440 de vier hoofditems met de subitems uit A. Elk subitem landt op het juiste anker en de kop van die sectie staat dan in beeld. Op 390 × 844 staan de vier hoofditems en de WhatsApp-link zonder scrollen in beeld.
3. `/producten`, `/kraamcadeaubox`, `/over` en `/contact` geven 200 op de preview. `/klantenservice` geeft 301 naar `/contact` en `/over-lux` geeft 301 naar `/over`. `/contact` heeft **geen** regel in `_redirects`. De sitemap noemt alle vier de adressen. Canonicals gebruiken schone adressen.
4. Op de homepage gaan "Laat iets voor jou maken" en de drie "Bespreek je idee"-links naar `contact.html#formulier`. "Neem contact op" in elk contactblok gaat naar `contact.html`. Op de homepage staat geen `<form>` meer.

**Homepage**

5. De volgorde is: hero, 001 De kraamcadeaubox, 002 Producten, 003 Het gevoel, statement, 004 Personaliseren, 005 Over Carien, 006 Instagram, 007 Contact. De labels in de pagina en de balk tonen precies deze nummers.
6. De pijl-link "Bekijk alle producten" in 002 is op 1440 (zonder aanwijzen), 768 en 390 zichtbaar, minimaal 44 px hoog, en gaat naar `producten.html`.
7. Op 390 × 844 staan na een tik op een link naar `#contact` de kop van het contactblok en de WhatsApp-link zonder verder scrollen in beeld.

**Producten**

8. Er zijn precies vijf categorieën, met id's `babykleding`, `siliconen`, `babynest`, `prematuur` en `kraamcadeaubox`. Op 1440 staan ze om en om (tekst links en foto rechts, dan gespiegeld) en de laag kleurt per categorie naar de kleur uit de tabel in C.
9. Op 1440 × 900 staan per categorie het label, de kop, de alinea, de pijl-link en de hele foto samen in één scherm.
10. Geen foto wordt groter getoond dan het bestand: de babynestfoto maximaal 324 px breed op elk scherm, de andere maximaal 480 px breed op 1440.
11. Alle tekst op de categoriekleuren is inkt; nergens staat wit op salie, mauve, olijf, grijsblauw of perzik.

**Kraamcadeaubox**

12. Op 390 × 844 staat de regel "Vier formaten, van € 35 tot € 80." in het eerste scherm.
13. Er zijn negen thema's, elk met een foto, de kop en "Vraag dit thema aan". Op 1440 volgen de linkermarges van de foto's het ritme 33,33 / 8,33 / 25 / 8,33% (± 16 px). Een foto is daar 840 × 480 (± 8 px).
14. De lopende regel per thema loopt één halve spoorbreedte in 30 s (± 1 s), staat op opacity 0,2 en ligt achter de foto. Bij "minder beweging" staat hij stil. Buiten beeld pauzeert hij.
15. Twee opeenvolgende thema's hebben nooit dezelfde laagkleur, en geen enkel thema gebruikt terracotta.
16. De prijstabel (`controleer_prijstabel`) en "Zo werkt het" (`controleer_stappen`) slagen nog, en de prijzen zijn € 35, € 50, € 65 en € 80.

**Over**

17. Op 1440 staat de kopfoto gecentreerd (de marges links en rechts verschillen hooguit 8 px) en is hij 480 × 720. De witte kop haalt over de foto minimaal 3:1 en het witte label minimaal 4,5:1. Op 390 staat de kop onder de foto, niet erover.
18. "Hoe ik werk" wisselt op 1440 alleen bij klik, Enter of Spatie, en `aria-selected` klopt. Op 390 en zonder JavaScript staan alle drie de stappen onder elkaar, volledig leesbaar. Nergens wordt de achtergrondfoto groter getoond dan 1800 × 900.
19. Op de pagina staan geen reviews, cijfers of verzonnen quotes. Het verhaal is letterlijk de bestaande tekst.

**Contact**

20. Op 390 × 844 en op 1440 × 900 staan de vraag, "WhatsApp Carien" en "Stuur een bericht" zonder scrollen in beeld. Alle tekst in de kop haalt minimaal 4,5:1 op de donkere foto. De navigatie en het logo zijn daar wit.
21. Het formulier op `contact.html` heeft dezelfde velden, namen, spamval en `action="/api/contact"` als het oude formulier op de homepage. Op 390 staat het in één kolom en zijn alle velden minimaal 44 px hoog.
22. Een mislukte verzending komt terug op `/contact?verzonden=fout#formulier`. De foutmelding staat dan zonder scrollen in beeld. `npm test` controleert de nieuwe doeladressen.
23. Het adres in Ospel, de drie contactkanalen en "binnen 7 werkdagen verzonden" (alleen bij de box) staan in sectie 001.

**Algemeen**

24. Op 390, 768 en 1440 px kan geen enkele pagina horizontaal scrollen, ook niet tijdens de lopende regels, de parallax of de fotorij op Over.
25. Elke sectie op elke pagina heeft een `data-label`. De vaste balk verschijnt ook op Producten, Kraamcadeaubox, Over en Contact, en toont het juiste label.
26. Lopende tekst is overal minimaal 16 px met een contrast van minimaal 4,5:1. Alle pijl-links zijn minimaal 44 px hoog.
27. Zonder JavaScript is op alle nieuwe pagina's alle inhoud zichtbaar: thema's en categorieën met foto, stappen onder elkaar en het formulier bruikbaar. Bij "minder beweging" is er geen parallax en lopen er geen regels.

### Technische criteria

28. **Worker:** `src/worker.js` stuurt bij een fout bij het lezen, bij een mislukte controle en bij een mislukte verzending (303) naar `/contact?verzonden=fout#formulier`; een GET op `/api/contact` stuurt (303) naar `/contact#formulier`. Succes en spam gaan ongewijzigd naar `/bedankt`. Nergens in `src/` staat nog `/?verzonden=fout#contact` of `/#contact`.
29. **Tests:** `npm test` is groen en bevat tests die beide nieuwe doeladressen (`/contact?verzonden=fout#formulier` en `/contact#formulier`) controleren, naast de bestaande tests voor `/bedankt` en de spamval.
30. **Foutmelding:** de bestaande code in `main.js` die bij `?verzonden=fout` de melding in `.melding` zet, werkt op `contact.html` (niet meer alleen op de homepage).
31. **Sitecontrole:** `python3 scripts/controleer.py` is groen. `PAGINAS` en de controles per schermbreedte bevatten `producten.html`, `over.html` en `contact.html` naast de bestaande pagina's. Op 390, 768 en 1440 px controleert het script voor elke pagina dat er niet horizontaal gescrold kan worden (`scrollWidth` ≤ `clientWidth`) en maakt het schermafdrukken. De controles die nu alleen voor `index.html` verplicht zijn (setwissel, tabbladen), blijven werken; controles voor elementen die van de kraamcadeauboxpagina verdwijnen (collage, hoverlijst, kaarten) worden aangepast in plaats van weggelaten zonder vervanging.
32. **Schermafdrukken:** `scripts/schermafdrukken.py` neemt zonder argumenten `index.html`, `kraamcadeaubox.html`, `producten.html`, `over.html` en `contact.html` mee.
33. **Sitemap en canonicals:** `public/sitemap.xml` bevat `/`, `/producten`, `/kraamcadeaubox`, `/over` en `/contact` (plus de bestaande overige adressen). Elke nieuwe pagina heeft een `canonical` en `og:url` met het schone adres op `https://luxmini.nl` (zelfde domeinvorm als de bestaande pagina's), een eigen `<title>` en `meta description`.
34. **`_redirects`:** `/klantenservice` → `/contact` 301 en `/over-lux` → `/over` 301. Er is geen regel voor `/contact`, `/producten` of `/over`. De overige regels (`/aanbod`, `/aanbod/`, `/shop`, `/product-page/*`, `/account/*`) zijn ongewijzigd.
35. **Oude ankers:** `/#contact` blijft werken (het contactblok op de homepage houdt `id="contact"`). Links in de navigatie van `privacy.html`, `bedankt.html`, `404.html` en `kraamcadeaubox.html` die nu naar `index.html#over` of `index.html#contact` gaan, wijzen naar `over.html` en `contact.html`. Geen enkele interne link in `public/` verwijst naar een anker dat niet bestaat.
36. **Header op alle pagina's:** de vier links en het menu over het hele scherm zijn op alle pagina's gelijk (ook `privacy.html`, `bedankt.html`, `404.html`); `404.html` gebruikt absolute paden (`/producten` enz.), zoals nu.
37. **CLAUDE.md:** de sectie "Mappen" noemt `producten.html`, `over.html` en `contact.html` met een korte omschrijving, en de omschrijving van `index.html` en `kraamcadeaubox.html` klopt met de nieuwe opbouw. Het formulier staat daar genoemd bij `contact.html`. Overige secties van `CLAUDE.md` alleen aanpassen na akkoord (zie Open vragen).
38. **Rooktest:** `scripts/rooktest.sh` controleert ook `/producten`, `/over` en `/contact` (200, met een vaste tekst van die pagina) en `/klantenservice` (301). De bestaande controle op "Kies je formaat" voor `/kraamcadeaubox` blijft kloppen.
39. Nieuwe of herschreven teksten die niet letterlijk van de oude site of uit de bestaande pagina's komen, hebben `<!-- LET OP: wacht op akkoord Carien -->`.
40. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Ontwerprichting

*Tekst van website-ontwerper, volledig overgenomen.*

**Algemeen, voor alle nieuwe pagina's**

- **Kleurregel blijft gelijk.** Op de lichte paletkleuren (perzik, oker, salie, mauve, olijf, grijsblauw) is alle tekst inkt. Wit gebruiken we alleen voor koppen en quotes vanaf 24 px op terracotta, of voor tekst op een donkere foto met een sluier.
- **Achtergrondlaag per sectie.** Elke categorie en elk thema is een eigen `main > section` met `data-achtergrond`. Zo werkt de bestaande laag (0,75 s, wissel bij de lijn op 88%) zonder nieuwe techniek. Dit is de `c-color` van Stock.
- **Eén vast patroon voor de paginakop (`.pagina-kop`).** Producten en Kraamcadeaubox beginnen met dezelfde kop op terracotta:
  - de paginanaam als `h1` in `.caps`, inkt;
  - daaronder een grote quote of kop, wit;
  - links op 8,33%, maximaal 50% breed;
  - `padding-top` clamp(160px, 20,83vw, 300px), onder 10,41vw;
  - mobiel: 48 px onder de terracotta header, quote 28 px.
  - Over en Contact hebben elk een eigen fotokop (zie E en F). Daar staat de paginanaam ook als kleine `h1` in kapitalen.
- **Vaste balk.** `main.js` toont de balk nu alleen als er een `.hero` is. Laat hem ook verschijnen na de eerste sectie van `main` (`.pagina-kop`, `.over-kop`, `.contact-kop`). Elke sectie krijgt een `data-label` met nummer. De paginakop krijgt een label zonder nummer, bijvoorbeeld "— Producten".
- **Contactblok (gedeeld onderdeel)** voor Home, Producten, Kraamcadeaubox en Over:
  - de bestaande `.contact-rij` op terracotta: tekst links (16,66–41,66%), vierkante foto `maatwerk-handwerk.jpg` rechts (50–83,33%, maximaal 480 px);
  - kop `.kop-l`, wit;
  - vier pijl-links onder elkaar, inkt, elk minimaal 44 px hoog: **WhatsApp Carien** (eerst), het telefoonnummer, het e-mailadres en **Neem contact op** → `contact.html`;
  - **geen formulier**;
  - kop per pagina: Home, Producten en Over "Zin om samen iets moois te maken?" (bestaand); Kraamcadeaubox "Een box samenstellen?" (bestaand);
  - op de homepage blijft `id="contact"`, zodat oude links naar `/#contact` blijven werken;
  - mobiel: label, foto (3 : 2), kop van 36 px, pijl-links.
- **Nieuwe teksten** krijgen `<!-- LET OP: wacht op akkoord Carien -->`.

### A. Hoofdnavigatie en adressen

- **Header (desktop vanaf 1025 px):** logo links → `index.html`, rechts **Producten · Kraamcadeaubox · Over · Contact**. Typografie zoals nu. De huidige pagina krijgt `aria-current="page"` en een onderstreping van 1 px, 6 px onder de letters. Zet dit op alle pagina's, ook op `privacy`, `bedankt` en `404`. Tablet (761–1024 px) en mobiel blijven zoals nu: logo en burger.
- **Menu over het hele scherm: ja, met submenu's** zoals bij Stock.
  - Links staan de vier hoofditems groot (Display, zoals nu). Onder elk hoofditem staan de subitems klein in Libre Caslon Text van 16 px, met 24 px inspringing:
    - **Producten:** Babykleding met naam · Siliconen items · Babynest · Prematuurkleding (`producten.html#babykleding`, `#siliconen`, `#babynest`, `#prematuur`);
    - **Kraamcadeaubox:** Thema's · Formaten en prijzen · Zo werkt het (`#themas`, `#formaten`, `#werkwijze`);
    - **Over:** Het atelier · Hoe ik werk (`over.html#atelier`, `#hoe-ik-werk`);
    - **Contact:** geen subitems.
  - In de rechterkolom staan "Contact" (WhatsApp, telefoon, mail) en "Volg het atelier" (Instagram, Facebook). Het blok "De kraamcadeaubox" verdwijnt uit die kolom, want het staat nu onder het hoofditem.
  - **Mobiel (tot en met 760 px):** de subitems van Producten, Kraamcadeaubox en Over zijn verborgen; de hoofditems zijn genoeg en de pagina's hebben zelf ankers. Volgorde: vier hoofditems (36 px), dan WhatsApp, telefoon en mail, dan Instagram en Facebook.
- **Bestanden en adressen:** `producten.html`, `kraamcadeaubox.html`, `over.html` en `contact.html`. Met `auto-trailing-slash` worden dat `/producten`, `/kraamcadeaubox`, `/over` en `/contact`.
  - `canonical`, `og:url` en `sitemap.xml` gebruiken de schone adressen. Voeg `/producten`, `/over` en `/contact` toe aan de sitemap.
  - In de pagina's houden we `href="producten.html"` enzovoort, net als nu. Dat werkt ook met de lokale testserver van `controleer.py`. Wel kost dit op Cloudflare één doorverwijzing per klik (zie "kan beter").
- **`_redirects`:**
  - `/klantenservice` → `/contact` (301; was `/#contact`);
  - `/over-lux` → `/over` (301; was `/#over`);
  - **geen** regel voor `/contact`: dat adres wordt nu gewoon `contact.html`. Een regel zou die pagina blokkeren;
  - `/aanbod`, `/shop` en `/product-page/*` blijven naar `/kraamcadeaubox` gaan, want die verkochten de boxen.

### B. Homepage (blijft één lange scrollpagina)

| # | Sectie | `data-label` / zichtbaar label | Wijziging |
|---|---|---|---|
| — | Hero en quote "Hoe bijzonder…" | — | Ongewijzigd. Pijl-link "Over Carien" → `over.html`. |
| 001 | Kraamcadeaubox (het huidige Uitgelicht) | `001 — De kraamcadeaubox` | De kapitalen "Uitgelicht" worden het label `001 — De kraamcadeaubox`, in hetzelfde tekstblok. Tekst, foto, lopende regel en posities blijven. Pijl-link "Bekijk de kraamcadeaubox" → `kraamcadeaubox.html`. |
| 002 | Producten met werkwijze (de huidige `.kern-kolommen`) | `002 — Producten` | De drie kolommen blijven. Nieuw: pijl-link **"Bekijk alle producten"** → `producten.html`, gecentreerd onder de kolommen, 48 px boven de onderrand van de sectie. Altijd zichtbaar, ook op touch, dus niet alleen bij aanwijzen. Inkt (5,2:1 op terracotta, op de kolomkleuren hoger). |
| 003 | Het gevoel (de vijf sferen) | `003 — Het gevoel` | Ongewijzigd, `id="portfolio"` blijft. "Laat iets voor jou maken" → `contact.html#formulier`. |
| — | Statement (atelierfoto) | `— Het atelier` | Blijft tussen 003 en 004. "Lees het verhaal" → `over.html`. |
| 004 | Personaliseren | `004 — Personaliseren` | Ongewijzigd. De drie "Bespreek je idee"-links → `contact.html#formulier`. |
| 005 | Over Carien, **ingekort tot teaser** | `005 — Over Carien` | Zie hieronder. |
| 006 | Instagram | `006 — Instagram` | Ongewijzigd. |
| 007 | Contactblok | `007 — Contact` | Het gedeelde contactblok, zonder formulier, `id="contact"`. |

**Besluit Over Carien:** de teaser blijft. Het gezicht en het verhaal van Carien zijn het sterkste vertrouwensteken voor deze bezoeker, en de homepage moet zonder doorklikken persoonlijk blijven.

- Gebruik de bestaande `.duo`, maar met **één** foto: `over-werkplek.jpg`, staand 3 : 4, maximaal 420 px breed. `over-carien` staat al in de hero en wordt de kop van Over.
- De kop blijft "Van de eerste pakjes voor haar kleinkinderen tot maatwerk voor jou".
- De alinea wordt alleen de eerste twee zinnen van het bestaande verhaal, tot en met "…mijn kinderen.". Het hele verhaal staat op Over.
- Pijl-link "Lees het verhaal van Carien" → `over.html`.

### C. `producten.html` (zoals Stock /media)

1. **Paginakop** (terracotta):
   - `h1` "Producten" in kapitalen;
   - quote (wit, `.quote` op `clamp(32px, 3.6vw, 52px)`): "Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks." met daaronder `.caps` "Carien Geurts —". De tekst komt uit Cariens bestaande verhaal; zie de punten voor Carien.
2. **Vijf categorieën**, elk een eigen sectie van ongeveer één scherm hoog: `padding` var(--ritme) boven en onder, rond 900 px op 1440 × 900. Per categorie:
   - het label met nummer (`.label`, inkt) boven de kop;
   - de kop in Display, `clamp(40px, 4.6vw, 66px)`, inkt, met vaste regelbreuken;
   - een alinea (`.klein`, 16 px, maximaal 360 px);
   - een pijl-link.

   | # | id | Kop (regelbreuk) | Laag | Foto (bron) | Op scherm (1440) | Pijl-link |
   |---|---|---|---|---|---|---|
   | 001 | `babykleding` | Babykleding / met naam | salie `#C3CFBC` | `p-sjaaltje-kleur.jpg` (900×1200, staat op salie) | 480×640 | "Bespreek je idee" → `contact.html#formulier` |
   | 002 | `siliconen` | Siliconen / items | mauve `#B5969E` | `p-bijtring-kleur.jpg` (900×1200, staat op mauve) | 480×640 | idem |
   | 003 | `babynest` | Babynest | olijf `#B4B19A` | `ig-babynest.jpg` (324×436) | **maximaal 324×432**, gecentreerd in de fotokolom | idem |
   | 004 | `prematuur` | Prematuur&shy;kleding (afbreken als "Prematuur- / kleding") | grijsblauw `#E0E6E7` | `p-broekje-kleur.jpg` (900×1200, staat op grijsblauw), **tijdelijk** | 480×640 | idem |
   | 005 | `kraamcadeaubox` | Kraam- / cadeaubox | perzik `#DEB799` | `hero-box-open.jpg` (1400×1400, uitgesneden naar 3 : 4, `object-position` 40% 50%) | 480×640 | "Bekijk de kraamcadeaubox" → `kraamcadeaubox.html` |

   **Teksten** (alleen bestaande feiten):
   - **001:** "Een naam, geboortedatum of klein figuurtje, geborduurd of als belettering op kleding." Dit komt uit de technieken, die nog wachten op akkoord van Carien.
   - **002:** "Bijtring, speenkoord, sleutelhanger, Maxi-Cosi-hanger en mobiel, in jouw kleuren en met naam."
   - **003:** nieuw, met LET OP. Bijvoorbeeld: "Een babynest in de stof en kleur die jij kiest."
   - **004:** "Maatwerk in (prematuur)babykleding. Ook prematuurmaten." De alt-tekst beschrijft alleen het broekje en noemt het niet prematuur.
   - **005:** "Handgemaakte babyproducten in één thema, met naam en geboortedatum. Vanaf € 35."

   **Opbouw desktop (vanaf 1025 px):** gebruik het raster van `.insta-blok`/`.contact-rij` (16,666 / 25 / 8,334 / 33,333 / 16,667%).
   - Oneven categorieën: **tekst links, foto rechts**. Even categorieën: gespiegeld.
   - De tekst staat verticaal gecentreerd naast de foto.
   - Er komt geen sluier over de foto's, want er staat geen witte tekst op.
   - Bij 001, 002 en 004 valt de foto op dezelfde kleur als de laag. Het product lijkt dan te zweven, zoals bij Stock.

   **Tablet (761–1024 px):** hetzelfde om-en-om, met 8vw rand, tekst 40% en foto 44% breed.

   **Mobiel:** in deze volgorde:
   - label;
   - foto over de volle breedte binnen de rand, 3 : 4, ongeveer 346×461 px (babynest maximaal 324 px breed);
   - kop van 40 px;
   - alinea;
   - pijl-link.

   Tussen de categorieën zit 56–96 px. De laag kleurt mee.
3. **Contactblok** `006 — Contact`.

### D. `kraamcadeaubox.html` (zoals Stock /projecten)

**Besluit:** de collage verdwijnt van deze pagina. Ze wisselt hier toch al niet meer en geeft dezelfde boxfoto's die de thema's nu groot laten zien. In plaats daarvan komt de paginakop, met de prijs direct zichtbaar. Volgens de principes willen bezoekers snel weten wat het kost, en anders staan de prijzen pas na negen thema's.

1. **Paginakop** (terracotta), `data-label` "— Kraamcadeaubox":
   - `h1` "Kraamcadeaubox" in kapitalen;
   - kop `.kop-xl` "De kraam- / cadeaubox", wit;
   - de bestaande quote-tekst ("Ieder nieuw leven is bijzonder." Een box vol …);
   - een regel van 16 px in inkt: **"Vier formaten, van € 35 tot € 80."** (bestaande prijzen);
   - twee pijl-links naast elkaar (mobiel onder elkaar): "Bekijk formaten en prijzen" → `#formaten` en "Kies je thema" → `#themas`.
   - De lopende regel "Voor de mooiste kraamcadeauboxen" vervalt; elk thema krijgt nu zijn eigen lopende regel.
2. **`001 — Thema's`** (`id="themas"`). Het label staat één keer bovenaan, daarna volgen negen thema-secties. Er is voor **alle negen** thema's een foto (`box-*.jpg`, 1100×825). Per thema:
   - **Foto:** liggend, 58,33% van het vak breed, verhouding 58,33 : 33,33. Op 1440 is dat 840×480 px. Binnenin parallax: de foto is 120% hoog en zit op top −25%. Dat vraagt 840×576 uit 1100×825, dus er wordt niets vergroot.
   - **Kop** `.kop-m` met de themanaam, inkt, 3,47vw onder de foto. Rechts op dezelfde regel de pijl-link **"Vraag dit thema aan"** → `contact.html#formulier`. De detailpagina's komen later.
   - **Lopende regel** met de themanaam ("— Giraf — Giraf …"):
     - achter de foto (lagere z-index), inkt op opacity 0,2;
     - Display, `clamp(64px, 9vw, 140px)`, top 19vw;
     - lineair, één halve spoorbreedte in **30 s**;
     - pauzeert buiten beeld (bestaande `.lopend.pauze`), staat stil bij "minder beweging", `aria-hidden`.
   - **Ritme van 4** (desktop, links/rechts van het vak, maximaal 1440 px):
     1. 33,33 / 8,33;
     2. 8,33 / 33,33;
     3. 25 / 16,66;
     4. 8,33 / 33,33.
     Daarna herhaalt het patroon. Tussen de thema's zit 10,41vw.
   - **Laagkleur per thema**, met inkt op alle kleuren. Volgorde: Giraf perzik, Vos oker, Tulp mauve, Walvis salie, Wilde blaadjes olijf, **Framboos mauve** (was terracotta; terracotta bewaren we voor de kop en het contactblok, en inkt-koppen op terracotta botsen met de regel "koppen op terracotta wit"), Regenboog perzik, Wilgentakjes salie, Blaadjes en bloemen olijf. Buren hebben nooit dezelfde kleur.
   - De **hoverlijst en de kaarten verdwijnen** van deze pagina. De thema's zijn nu altijd zichtbaar, ook op touch.
   - Na het laatste thema volgt de bestaande zin "Een eigen stof of kleur is altijd bespreekbaar." (16 px, gecentreerd).
   - **Tablet:** de foto is 76% breed en verspringt alleen tussen links 8% en links 16%. De lopende regel is 80 px.
   - **Mobiel:** de foto is 82% breed, om en om links en rechts tegen de rand, verhouding **4 : 3**, zodat de hele box in beeld is (ongeveer 284×213 px). Geen parallax. De lopende regel is 56 px en loopt achter de foto, zichtbaar in de vrije strook. Kop en pijl-link staan onder elkaar.
3. **Statement** (bestaand, `box-hero-wide.jpg`, sluier 0,52, "Met naam en geboortedatum…"). De pijl-link wordt "Kies je formaat" → `#formaten`.
4. **`002 — Kies je formaat`** (`id="formaten"`): de prijstabel ongewijzigd, op grijsblauw of wit (de laag), niet meer binnen de terracotta bovenkant. Pijl-link "Stel je box samen" → `contact.html#formulier`.
5. **`003 — Zo werkt het`** (`id="werkwijze"`): ongewijzigd.
6. **Contactblok** `004 — Contact`, met de kop "Een box samenstellen?". De link "Contactformulier" wordt "Neem contact op" → `contact.html`.

### E. `over.html` (zoals Stock /over-ons)

1. **Kop (`.over-kop`)**, terracotta, 83,33vw hoog (maximaal 1100 px):
   - **Foto** `over-carien.jpg` in het midden: left 33,33%, 33,33% breed, 50vw hoog. Op 1440 is dat 480×720 px uit 1200×900, dus niet vergroot. Top 13,89vw, `object-position` 35% 50%, zodat Carien in beeld staat.
   - **Sluier** op de foto: `brightness(.85)` plus 25% inkt. De foto heeft lichte ramen.
   - **Tekst**, wit, over de foto heen (padding-top 27,78vw, links 8,33%, rechts 16,66%):
     - `h1` "Over Carien" in kapitalen, wit. Dat mag: dit is tekst op een donkere foto en op terracotta, en hij moet ≥ 4,5:1 halen; anders inkt;
     - kop `.kop-xl` (maximaal 88 px) met de bestaande kop "Van de eerste pakjes voor haar kleinkinderen tot maatwerk voor jou".
   - De bestaande badge staat rechtsonder (right 12,5vw, bottom 12,5vw).
   - **Mobiel:** de foto is 72vw breed, 3 : 4, gecentreerd. De kop staat ónder de foto (40 px, wit op terracotta), niet erover.
2. **`001 — Het atelier`** (`id="atelier"`, wit):
   - links het **hele bestaande verhaal** van Carien (18 px, maximaal 60 tekens per regel), met daaronder de bestaande quote "Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken." (`.quote`, inkt);
   - rechts een **fotorij** met scroll-snap (het `.kaarten`-patroon), elke foto 3 : 4 en 360×480 op desktop: `over-werkplek`, `over-naaimachine`, `pers-klaar`, `pers-stoffen`, `over-verzending`. Alle bronnen zijn groot genoeg;
   - de volgende foto steekt zichtbaar uit, zodat je ziet dat je kunt vegen. De rij is met het toetsenbord te bedienen (region met `tabindex`);
   - mobiel: eerst de tekst, dan de fotorij (72vw per foto).
3. **`002 — Hoe ik werk`** (`id="hoe-ik-werk"`):
   - **Desktop:** volle hoogte (100svh, 680–1000 px), achtergrond `home-atelier-wide.jpg` (1800×900, op 1440×900 niet vergroot) met 55% inkt.
     - Links een verticaal menu met de drie bestaande werkwijzestappen: "01 Samen kiezen", "02 Persoonlijk maken", "03 Met zorg gemaakt". Libre Caslon Text, 24 px, wit. Inactief op opacity 0,6 (niet 0,4, vanwege het contrast), actief op 1 met een streepje van 24 px ervoor.
     - Rechts de kop van de actieve stap (`.kop-xl`, wit) met de bestaande zin en copy uit de werkwijze (18 px, wit).
     - Wisselen gaat alleen bij klik, Enter of Spatie, met `role="tablist"`, net als bij Personaliseren. Tekst wisselt met een crossfade van 0,4 s.
   - **Mobiel en zonder JS:** de foto is een band van 3 : 2 bovenaan. Daaronder staan de drie stappen onder elkaar op terracotta: koppen wit (36 px), tekst inkt. Er is geen menu.
4. **Lopende regel** "— Ieder nieuw leven is bijzonder" (bestaande `.lopend.lopend-los`, wit Display op terracotta, 15 s). Decoratief, zonder label.
5. **Contactblok** `003 — Contact`. Er komen **geen** reviews, team of partners.

### F. `contact.html` (zoals Stock /contact)

1. **Fotokop (`.contact-kop`)**:
   - hoogte 100svh (minimaal 640, maximaal 1000 px), mobiel 88svh;
   - foto `home-hero-handwerk.jpg` (1800×1012, donker, handen aan de naaimachine) op een zwarte ondergrond met opacity 0,6 en lichte parallax, die uitstaat bij "minder beweging" en op touch;
   - tekst links op 8,33%, maximaal 50% breed, verticaal gecentreerd, **wit** (uitzondering: tekst op een donkere foto):
     - `h1` "Contact" in kapitalen, wit;
     - een h2 als uitnodigende vraag (`.kop-xl`, maximaal 88 px), nieuw, met LET OP. Bijvoorbeeld: "Wat mag Carien voor jou maken?";
     - **direct in de kop** twee pijl-links, wit, 17 px, 44 px hoog: **"WhatsApp Carien"** en **"Stuur een bericht"** → `#formulier`. Zo staat contact ook op deze pagina bovenaan, ook op mobiel.
   - **Header op deze pagina (desktop):** het logo is wit en de navigatie wit, met de klasse `html.kop-donker`. Inkt zou op de donkere foto wegvallen. De badge staat op left 75%, bottom −4vw.
2. **`001 — Contactgegevens`** (wit, marge 10,41vw boven en 6,94vw onder). Drie kolommen op desktop, één op mobiel. Elk kopje in Libre Caslon Text 20 px, de tekst in 16–18 px inkt:
   - **Direct contact:** WhatsApp Carien (eerst), 06 – 43 79 16 18, info.LUXmini@gmail.com, als pijl-links;
   - **Atelier:** LUX mini, Carien Geurts, Sperwerstraat 10, 6035 GH Ospel. Het bestaande "klaar om op te halen of te versturen" mag erbij; **geen** openingstijden of "op afspraak", want dat is niet bevestigd;
   - **Levertijd:** "Een kraamcadeaubox wordt binnen 7 werkdagen verzonden." (bestaande tekst). Deze regel gaat alleen over de box, dus niet algemener schrijven.
3. **`002 — Stuur een bericht`** (`id="formulier"`, **terracotta**, zodat de huidige opmaak van de velden werkt; op wit vallen de velden weg):
   - de bestaande inleiding ("Liever schrijven? …") en het **formulier ongewijzigd**: zelfde velden, namen, spamval, `action="/api/contact"` en `method="post"`;
   - de breedte is 16,66–83,33% (maximaal 960 px), in twee kolommen; mobiel één kolom en velden minimaal 44 px hoog;
   - na een fout zet de bestaande code in `main.js` de melding in `.melding`. Scroll dan naar `#formulier`, dan staat de melding in beeld.
4. **Geen contactblok** onderaan (dat zou dubbel zijn), direct de footer.

**Worker en test (`src/`, raakt `npm test`):**
- succes en spam: `/bedankt` (ongewijzigd);
- fout bij het lezen, de controle of het versturen: **`/contact?verzonden=fout#formulier`** (was `/?verzonden=fout#contact`);
- GET op `/api/contact`: **`/contact#formulier`**;
- de tests moeten deze doeladressen controleren.

### Voor Carien ter goedkeuring

1. **De quote bovenaan Producten:** "Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks." Dit zijn haar eigen woorden van de oude site, maar nu als losse quote met haar naam erbij.
2. **De categorieën en hun teksten op Producten:** klopt het dat ze babynest en prematuurkleding als eigen categorie wil tonen? De tekst bij het babynest is nieuw.
3. **De tijdelijke foto bij Prematuurkleding** (`p-broekje-kleur.jpg`, een gewoon broekje). Gewenst: een foto van prematuurkleding naast maat 50 (fotolijst, opname 13).
4. **Het babynest wordt klein getoond** (324 px), omdat alleen de Instagram-versie er is. Het origineel, of opname 11 uit de fotolijst, maakt een grote foto mogelijk.
5. **De vraag in de kop van Contact,** bijvoorbeeld "Wat mag Carien voor jou maken?"
6. **Het adres zichtbaar op de contactpagina** (Sperwerstraat 10, Ospel), en of ophalen mag. Er staan geen openingstijden of "op afspraak" bij, tot zij dat bevestigt.
7. **De pijl-link "Vraag dit thema aan"** bij de thema's (tijdelijk, tot de detailpagina's er zijn).
8. **De werkwijzeteksten op Over ("Hoe ik werk")** zijn dezelfde als op de homepage. Ze staan daar nu groter in beeld.
9. **Ter info:** op de kraamcadeauboxpagina verdwijnen de fotocollage en de regel "Voor de mooiste kraamcadeauboxen". De pagina begint nu met de prijzen en de negen thema's groot in beeld. Ook ter info: Framboos kleurt mauve in plaats van terracotta.

### Kan beter (geen onderdeel van de criteria)

- **P2:** "Vraag dit thema aan", Prematuurkleding en de box-categorie kunnen het onderwerp in het formulier vooraf kiezen (`?onderwerp=Kraamcadeaubox`). Gebruik dan alleen waarden uit `ONDERWERPEN`.
- **P2:** bij elk thema een stofstaal van 72 × 72 px naast de kop (`stof-*.jpg`, 240 px). Dat is echt, laat de stof zien en wordt niet vergroot.
- **P3:** links naar schone adressen (`/producten`) besparen een doorverwijzing per klik, maar dan moet de lokale testserver in `controleer.py` en `schermafdrukken.py` `/producten` naar `producten.html` leiden.
- **P3:** de kopfoto van Contact (1800 px breed) wordt op schermen breder dan 1800 px licht vergroot. Een groter origineel voorkomt dat.

## Bestanden
- `public/index.html` (navigatie, labels 001–007, links naar nieuwe pagina's, formulier weg, Over-teaser)
- `public/producten.html` (nieuw)
- `public/over.html` (nieuw)
- `public/contact.html` (nieuw, met het formulier)
- `public/kraamcadeaubox.html` (paginakop, thema's, collage/hoverlijst/kaarten weg, contactblok)
- `public/privacy.html`, `public/bedankt.html`, `public/404.html` (header en menu)
- `public/_redirects`, `public/sitemap.xml`
- `public/assets/css/style.css` (`.pagina-kop`, `.over-kop`, `.contact-kop`, `html.kop-donker`, categorieën, thema's, fotorij, Hoe ik werk, menu met subitems, `aria-current`)
- `public/assets/js/main.js` (balk zonder `.hero`, Hoe ik werk-tabs, parallax, foutmelding op contact)
- `src/worker.js`
- `tests/formulier.test.js` (of een nieuw testbestand voor de worker)
- `scripts/controleer.py`, `scripts/schermafdrukken.py`, `scripts/rooktest.sh`
- `CLAUDE.md` (alleen sectie "Mappen")

## Buiten scope
- Detailpagina's per thema of per product (Stocks projectdetails).
- Het onderwerp vooraf invullen in het formulier, stofstalen bij thema's en schone interne links (staan onder "Kan beter").
- Wijzigingen aan de velden, validatie of mailopmaak van het formulier (`src/formulier.js`).
- `wrangler.jsonc` en `.github/workflows/`.
- Reviews, team, partners, openingstijden, parkeren of openbaar vervoer (Stock heeft die, wij niet).
- Nieuwe foto's maken of bewerken; alleen bestaande bestanden uit `public/assets/img/`.
- Nameservers of domein omzetten.

## Open vragen
- Alle punten onder "Voor Carien ter goedkeuring" (quote Producten, categorieën en babynesttekst, tijdelijke prematuurfoto, kleine babynestfoto, vraag in de contactkop, adres en ophalen, "Vraag dit thema aan", werkwijzeteksten op Over, verdwijnen collage en Framboos mauve). Tot haar akkoord staan nieuwe teksten met LET OP-commentaar.
- **CLAUDE.md, ontwerpregels:** deze wijziging raakt twee regels die "niet zonder overleg" veranderen: "Vaste balk verschijnt na de hero" (nu ook na `.pagina-kop`, `.over-kop`, `.contact-kop`) en de kraamcadeauboxpagina zonder collage. De brief laat de bouwer alleen "Mappen" bijwerken. Moet Carst (mens) daarnaast de ontwerpregels voor de balk, `html.kop-donker` en de nieuwe pagina's laten aanpassen, en zo ja na de ontwerpgate?
- **Oud anker `/#over`:** `/over-lux` gaat naar `/over`, maar externe links naar `/#over` zijn er mogelijk nog. Moet de Over-teaser op de homepage `id="over"` houden? Voorstel: ja, kost niets.
- **Rooktest:** welke vaste tekst per nieuwe pagina moet `rooktest.sh` controleren? Voorstel: de `h1` ("Producten", "Over Carien", "Contact"). Na merge controleert de rooktest de live site; zolang de nameservers nog niet naar Cloudflare gaan, draait die op het workers.dev-adres.
- KvK-nummer (`[nummer]`) staat nog open; niet nodig voor deze wijziging, wel zichtbaar in de footer van de nieuwe pagina's.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief klaar, ontwerprichting van website-ontwerper opgenomen |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | [mens] | |
| Live gezet (merge) | [mens] | |
