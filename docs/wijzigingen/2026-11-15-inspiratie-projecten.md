# Inspiratie als projecten: elk onderwerp een eigen pagina (zoals Projecten op Stock)

- **Datum:** 2026-11-15
- **Aangevraagd door:** Carst
  - Feedback 15 nov. 11:43, opmerking 4: "Inspiratie mag meer richting de opzet van Projecten op Dutch Design. Elk onderwerp is een inspiratie om op te klikken, bijv. knuffels, swaddles en babynest; siliconen en hangers; kraamcadeauboxen. Dit kan zoals Projecten: ieder onderwerp is een project. Daar kun je op klikken en krijg je uitleg, en mooie foto's ingezoomd."
  - Schermafdrukken: `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-15nov/8.png` (Stock Projecten, mobiel, naast de huidige Inspiratie) en `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/feedback-15nov/9.png` (Stock-projecttegel "Een warm en kleurrijk interieur vol karakter": kleurvlak, grote vage titel erachter, foto, witte titel).
  - Besluit Carst (keuzevraag): Claude schrijft de uitleg per onderwerp als voorstel op basis van wat al op de site staat. Geen verzonnen feiten, prijzen of claims. Carst keurt de teksten goed vóór live.
- **Branch:** `wijziging/inspiratie-projecten` (vanaf `origin/main`), worktree `/home/claude/luxmini-projecten`
- **Issue:** geen nummer bekend (zie Open vragen 7)
- **Risico:** midden. Er komen vier nieuwe pagina's bij. Het menu over het hele scherm verandert op alle pagina's (subitems van Inspiratie), en de gedeelde `style.css` en `main.js` (hover-logica van `.portfolio-groep`) veranderen. Daardoor wijken de visuele basisschermen af en moeten paginalijsten in tests en sitecontrole worden uitgebreid. Het formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` blijven buiten schot (zie de keuze voor platte bestandsnamen hieronder).

## Doel
Op Inspiratie kiest de bezoeker een onderwerp, zoals een project bij Stock, en komt op een eigen pagina met een korte uitleg en grote foto's. Zo ziet ze het werk van Carien beter en rustiger dan in één lange pagina met kleine foto's.

## Wens en context
- **Nu (`public/inspiratie.html`):** paginakop op terracotta ("Inspiratie" / "Gemaakt in het atelier in Ospel") met vier pijl-links naar ankers. Daarna vier groepen in metselwerk (`.portfolio-groep` met `.werken`): `#kleding` (8 foto's, salie/diep `#839C75`), `#textiel` (4, mauve/`#AE8C94`), `#siliconen` (7, olijf/`#999575`), `#boxen` (10, perzik/`#C88654`). Elke groep heeft een LET OP "keuze van de foto's wacht op akkoord". Daarna het atelierstatement en 005 Contact.
- **Stock Projecten** (`docs/ontwerp/bron/stock-analyse-paginas-2026-11-02.md` r. 29–41): een lijst projecten, elk een link naar een detailpagina, met een eigen kleur, een liggende foto (58,33 % breed, parallax binnenin), een kop eronder, erachter de projectnaam als lopende tekst (opacity 0,2, eindeloos, 30 s), in een verspringend ritme van vier. Op 9.png (mobiel) heeft de tegel een kleurvlak, de vage titel erachter, de foto en een witte titel.
- **Vier projecten.** Carst noemt er drie "bijv."; Kleding is de vierde bestaande groep en blijft in dit voorstel een project (zie Open vragen 3).
- **Links naar de ankers van nu:** het menu over het hele scherm op alle pagina's (`inspiratie.html#kleding|#textiel|#siliconen|#boxen`, in `404.html` met `/inspiratie#…`), de homepage Handwerk (`#siliconen`, `#textiel`, ook de touchkaarten), `scripts/controleer.py` (r. 346–348, 714, 1097) en `tests/e2e/kernpaden.spec.js` r. 109.

### Keuze adres: platte bestanden `inspiratie-<onderwerp>.html`
| Project | Bestand | Adres (canonical) |
|---|---|---|
| Kleding | `public/inspiratie-kleding.html` | `https://www.luxmini.nl/inspiratie-kleding` |
| Knuffels, swaddles en babynest | `public/inspiratie-knuffels-en-babynest.html` | `https://www.luxmini.nl/inspiratie-knuffels-en-babynest` |
| Siliconen en hangers | `public/inspiratie-siliconen-en-hangers.html` | `https://www.luxmini.nl/inspiratie-siliconen-en-hangers` |
| Kraamcadeauboxen | `public/inspiratie-kraamcadeauboxen.html` | `https://www.luxmini.nl/inspiratie-kraamcadeauboxen` |

Waarom niet `inspiratie/kleding.html`:
- alle pagina's gebruiken relatieve paden (`assets/css/style.css`, `index.html`, `werkwijze.html` in header, menu, footer en intro). In een submap moeten die allemaal anders (`../` of `/`), wat afwijkt van de rest en foutgevoelig is;
- `inspiratie.html` en een map `inspiratie/` naast elkaar met `html_handling: "auto-trailing-slash"` geeft kans op verwarring tussen `/inspiratie` en `/inspiratie/`;
- met platte bestanden serveert Cloudflare `/inspiratie-kleding` vanzelf, zoals `/werkwijze`. `_redirects` hoeft niet te veranderen (geen hoog risico), `/portfolio` en `/portfolio.html` → `/inspiratie` (301) blijven gewoon staan.

Nadeel: het adres laat de hiërarchie minder zien. Voor een site van deze omvang maakt dat voor vindbaarheid niet uit.

## Acceptatiecriteria
*Ontwerpkeuzes (opbouw overzicht, hover/touch, opbouw projectpagina, foto's "ingezoomd", vorig/volgend) volgen uit de Ontwerprichting zodra website-ontwerper die heeft ingevuld. Deze criteria gelden in elk geval.*

### A. Overzicht `inspiratie.html`
1. `inspiratie.html` toont na de paginakop precies vier projecten in deze volgorde: Kleding, Knuffels, swaddles en babynest, Siliconen en hangers, Kraamcadeauboxen. Elk project is één link (het hele project is klikbaar, één tabstop) naar zijn projectpagina uit de tabel hierboven.
2. Elk project toont de projectnaam als kop en één foto uit zijn eigen groep. Er staan geen metselwerkrasters met alle foto's meer op het overzicht.
3. De ankers `#kleding`, `#textiel`, `#siliconen` en `#boxen` bestaan nog op het overzicht (op het betreffende project), zodat oude links en bladwijzers op de goede plek landen.
4. De paginakop houdt "Inspiratie" en "Gemaakt in het atelier in Ospel". De vier pijl-links in de kop gaan naar de projectpagina's (of vervallen, als de ontwerper dat kiest; dan staat dat in de Ontwerprichting).
5. Het atelierstatement (Cariens quote, "Carien Geurts —", "Lees het verhaal") en het contactblok blijven onder de projecten staan. Nummers en `data-label`s lopen zonder gat door.
6. Het projectvak gebruikt alleen paletkleuren uit `CLAUDE.md`. Witte tekst staat alleen op terracotta of op een diepe portfoliotint en is minstens 24 px (of 19 px vet). Op een lichte paletkleur is alle tekst inkt. (Wit op een diepe tint *in rust* op desktop is nu niet toegestaan, zie Open vragen 4.)
7. Een grote titel op de achtergrond (zoals Stock), als de ontwerper die kiest, is decoratief: `aria-hidden="true"`, telt niet als kop en veroorzaakt op geen enkele breedte horizontaal scrollen. Beweegt hij, dan staat hij stil bij `prefers-reduced-motion: reduce` en zonder JavaScript.

### B. Projectpagina's (vier)
8. Elke projectpagina heeft:
   - dezelfde header, hetzelfde menu, dezelfde balk en footer als de andere pagina's; in header en snelmenu heeft "Inspiratie" `aria-current="page"`;
   - een `.pagina-kop` (zodat de balk na de kop verschijnt) met het label "Inspiratie" en als `h1` de projectnaam;
   - de uitleg uit "Tekstvoorstellen" hieronder, letterlijk, met direct erboven `<!-- LET OP: wacht op akkoord Carst (uitleg project <naam>, brief 2026-11-15-inspiratie-projecten) -->`;
   - de foto's van die groep (zie D), groot getoond;
   - één pijl-link naar het formulier (zie C) en een link terug naar het overzicht;
   - het gedeelde contactblok ("Stuur Carien een bericht" → `contact.html#formulier`); geen links naar WhatsApp, telefoon of mail in de inhoud.
9. Elke sectie heeft een `data-label` dat gelijk is aan het zichtbare label. Secties zijn genummerd `001 —`, `002 —` …
10. Elke projectpagina heeft een eigen `<title>`, `meta description`, `canonical` (adres zonder `.html`, zie tabel), `og:title`, `og:description`, `og:url` en `og:image` (een foto uit de groep). Title en description zijn gemaakt uit de zinnen van het tekstvoorstel en vallen onder dezelfde LET OP.
11. Er is navigatie naar het volgende project (en eventueel het vorige), als de ontwerper daarvoor kiest; de volgorde is die van criterium 1, en na Kraamcadeauboxen volgt Kleding (of het overzicht).

### C. Links en adressen
12. Het menu over het hele scherm op **alle** pagina's (ook `privacy.html`, `bedankt.html`, `404.html`) linkt de vier subitems onder Inspiratie naar de projectpagina's (in `404.html` met absolute paden, zoals nu). De tekst van de subitems blijft gelijk.
13. Homepage 002 Handwerk: "Rustig en praktisch" (lijst en kaart) linkt naar `inspiratie-siliconen-en-hangers.html`, "Speels en levendig" naar `inspiratie-knuffels-en-babynest.html`. De andere links blijven gelijk.
14. De pijl-link naar het formulier op de projectpagina's is:
    - Kleding en Siliconen en hangers: "Bespreek je idee" → `contact.html?onderwerp=` met de waarde voor "Iets op maat" zoals die in `contact.html` staat, `#formulier` (zie Open vragen 6);
    - Knuffels, swaddles en babynest: "Bespreek je idee" → idem "Iets op maat";
    - Kraamcadeauboxen: "Bekijk thema's en prijzen" → `kraamcadeauboxen.html` (bestaande link), plus "Bespreek je idee" → onderwerp Kraamcadeaubox.
    De bouwer gebruikt de bestaande `onderwerp`-waarden uit `contact.html`; er komen geen nieuwe.
15. `sitemap.xml` bevat de vier nieuwe adressen (priority 0.6). `/portfolio` en `/portfolio.html` geven nog 301 naar `/inspiratie`; `_redirects` verandert niet.
16. Elke nieuwe pagina geeft lokaal (`scripts/serveer.mjs`) 200 op het adres met én zonder `.html`. Er zijn geen dode interne links (`controleer.py`).

### D. Foto's
17. Er komen geen nieuwe foto's. Elke projectpagina toont alle foto's die nu in die groep op `inspiratie.html` staan (Kleding 8, Knuffels 4, Siliconen 7, Kraamcadeauboxen 10), met de bestaande alt-teksten en bijschriften.
18. Geen foto wordt breder of hoger getoond dan zijn bestand (CSS-weergavemaat ≤ intrinsieke maat van het grootste `srcset`-bestand). Dat geldt vooral voor de kleine Instagram-foto's (`ig-jasje-teddy.jpg` 316 × 300, `ig-jasje-tricot.jpg` 316 × 300, `ig-babynest.jpg` 324 × 436, `ig-bijtringen.jpg` 540 × 322, `ig-charme-roze.jpg` 375 × 530). Wat de ontwerper bij DPR 2 eist, staat in de Ontwerprichting.
19. Een uitsnede of "ingezoomde" weergave snijdt nooit een naam, datum of het LUX-label half af.
20. De eerste foto op een projectpagina heeft geen `loading="lazy"`; de rest wel. Alle foto's hebben `width`, `height` en `decoding="async"`.

### E. Mobiel en algemeen
21. Op 360, 390, 768, 1024 en 1440 px scrolt geen van de vijf pagina's horizontaal (`scrollWidth ≤ innerWidth`).
22. Op 390 × 844 staat op elke projectpagina de eerste foto na hooguit één keer scrollen helemaal in beeld. Een kop staat nooit over een foto, behalve op een donkere foto met sluier.
23. Op touch zijn alle tikdoelen minstens 44 px; er is niets dat alleen bij aanwijzen te zien of te bereiken is.
24. Bij "minder beweging" en zonder JavaScript is alles direct zichtbaar en werken alle links.

### F. Tests, controle en documentatie
25. **Sitecontrole** (`scripts/controleer.py`) en de paginalijsten van de e2e-harness (o.a. `tests/e2e/hulp.js`, `seo-veiligheid.spec.js`, `scripts/schermafdrukken.py`) kennen de vier nieuwe pagina's. De controles die nu naar de ankers wijzen (r. 346–348, 714, 1097; `kernpaden.spec.js` r. 109) volgen de nieuwe links. Dat volgt uit deze wijziging en is geen versoepeling; de bouwer noemt elke aangepaste verwachting in het Verloop.
26. De sitecontrole eist op elke projectpagina de LET OP "wacht op akkoord Carst" boven de uitleg, zolang Carst niet heeft goedgekeurd. Het validatierapport toont ze onder de open punten.
27. Een nieuwe spec (bijv. `tests/e2e/inspiratie-projecten.spec.js`) draait in desktop, tablet, mobiel en WebKit en toetst criteria 1, 3, 8, 10, 12–14, 17, 18, 21–24.
28. **Visueel:** nieuwe basisschermen voor de vier projectpagina's; `inspiratie` wijkt af (bedoeld). Andere pagina's wijken alleen af in het geopende menu, als dat in een basisscherm zit.
29. **`CLAUDE.md`** wordt bijgewerkt met een verwijzing naar deze brief: Mappen (regel `inspiratie.html` en de vier nieuwe bestanden), de ontwerpregel Inspiratie, en bij het menu dat de subitems van Inspiratie naar de projectpagina's gaan.
30. `npm run check` is groen: tests, sitecontrole, toegankelijkheid (axe zonder nieuwe fouten op de vijf pagina's), SEO, veiligheid, snelheid (LCP en CLS binnen de grenzen), visueel en het validatierapport.

## Tekstvoorstellen per project
**Status: voorstel, wacht op akkoord Carst.** Elke zin komt van de site of is er direct van afgeleid; per zin staat de bron (stand `origin/main`). "Letterlijk" = woord voor woord, "afgeleid" = samengesteld uit bestaande feiten, zonder nieuwe claim. In de HTML staat de LET OP uit criterium 8 tot Carst akkoord geeft.

### 1. Kleding
> Maatwerk in (prematuur)babykleding: net iets anders en persoonlijks. Samen kies je wat het wordt, en in welke stof, kleur en maat. Een naam, geboortedatum of klein figuurtje, geborduurd op kleding, knuffels en zakjes. Carien maakt elk stuk met de hand in haar atelier in Ospel.

| Zin | Bron |
|---|---|
| Maatwerk in (prematuur)babykleding: net iets anders en persoonlijks. | Letterlijk deel van Cariens verhaal, `werkwijze.html` r. 148 ("Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks."); vgl. `index.html` r. 197 |
| Samen kies je wat het wordt, en in welke stof, kleur en maat. | Letterlijk, `werkwijze.html` r. 167 |
| Een naam, geboortedatum of klein figuurtje, geborduurd op kleding, knuffels en zakjes. | Letterlijk, `werkwijze.html` r. 202 (Borduren); de foto `p-sjaaltje-kleur.jpg` toont de geborduurde naam Sem |
| Carien maakt elk stuk met de hand in haar atelier in Ospel. | Letterlijk, `werkwijze.html` r. 177 |

### 2. Knuffels, swaddles en babynest
> Een knuffel en swaddle met naam, of een babynest in de stof en kleur die jij kiest. Een naam, geboortedatum of klein figuurtje, geborduurd op kleding, knuffels en zakjes. Knuffel en swaddle zitten in elke kraamcadeaubox. Een eigen stof of kleur is altijd bespreekbaar.

| Zin | Bron |
|---|---|
| Een knuffel en swaddle met naam, of een babynest in de stof en kleur die jij kiest. | Afgeleid: "Een babynest in de stof en kleur die jij kiest." letterlijk uit `index.html` r. 207; "knuffel … met naam" volgt uit de foto `p-knuffel-naam.jpg` (naam Sem geborduurd) en `werkwijze.html` r. 173 ("Altijd met naam of eigen detail"). Of een swaddle ook een naam krijgt, staat nergens; zie Open vragen 2 |
| Een naam, geboortedatum of klein figuurtje, geborduurd op kleding, knuffels en zakjes. | Letterlijk, `werkwijze.html` r. 202 |
| Knuffel en swaddle zitten in elke kraamcadeaubox. | Afgeleid: de kleinste box (€ 35) bevat "Knuffel, swaddle en broekje" (`kraamcadeauboxen.html` r. 146, prijzen in `CLAUDE.md`) en de grotere boxen voegen alleen iets toe |
| Een eigen stof of kleur is altijd bespreekbaar. | Letterlijk, `kraamcadeauboxen.html` r. 264 (daar bij de stoffen van de box; hier breder gebruikt, zie Open vragen 2) |

### 3. Siliconen en hangers
> Bijtring, speenkoord, sleutelhanger, Maxi-Cosi-hanger en mobiel, in jouw kleuren en met naam. Altijd met naam of eigen detail. Een bijtring of speenkoord kan ook in de kraamcadeaubox van € 80.

| Zin | Bron |
|---|---|
| Bijtring, speenkoord, sleutelhanger, Maxi-Cosi-hanger en mobiel, in jouw kleuren en met naam. | Letterlijk, `werkwijze.html` r. 212 (Siliconen) |
| Altijd met naam of eigen detail. | Letterlijk, `werkwijze.html` r. 172 |
| Een bijtring of speenkoord kan ook in de kraamcadeaubox van € 80. | Afgeleid: `kraamcadeauboxen.html` r. 182 ("Met bijtring of speenkoord") en de prijs € 80 in `CLAUDE.md` (wens Carien 11 nov.) |

Niet opgenomen: een zin over tashangers. Die staan op de foto's (`ig-charme-blauw.jpg`, `ig-charme-roze.jpg`, bijschriften "Tashanger blauw/roze"), maar nergens staat dat Carien ze op bestelling maakt. Zie Open vragen 2.

### 4. Kraamcadeauboxen
> Een box vol handgemaakte babyproducten in één thema, met de naam en geboortedatum van de baby. Zelfs de doos is persoonlijk. Vier formaten, van € 35 tot € 80. Een kraamcadeaubox wordt binnen 7 werkdagen verzonden.

| Zin | Bron |
|---|---|
| Een box vol handgemaakte babyproducten in één thema, met de naam en geboortedatum van de baby. | Letterlijk, `kraamcadeauboxen.html` r. 114 |
| Zelfs de doos is persoonlijk. | Letterlijk, `kraamcadeauboxen.html` r. 114 |
| Vier formaten, van € 35 tot € 80. | Letterlijk, `kraamcadeauboxen.html` r. 115; prijzen leidend in `CLAUDE.md` |
| Een kraamcadeaubox wordt binnen 7 werkdagen verzonden. | Letterlijk, `kraamcadeauboxen.html` r. 191; oude site volgens `CLAUDE.md` |

Opmerking: projecten 1 en 2 delen de zin over borduren. De ontwerper of Carst kan er één laten vallen; nieuwe tekst schrijft de planner niet.

## Ontwerprichting
*Nog in te vullen door website-ontwerper. De planner zet de tekst hier letterlijk neer. Vragen om te beantwoorden:*

1. **Overzicht: projectvak zoals Stock?** Nemen we per project een kleurvlak met een grote vage titel op de achtergrond, een foto en de titel eronder over (9.png)?
   - Welke kleur per project: de lichte tint (salie, mauve, olijf, perzik) met inkt, of de diepe tint (`#839C75`, `#AE8C94`, `#999575`, `#C88654`) met witte titel ≥ 24 px? Het tweede is in rust op desktop nu niet toegestaan (`CLAUDE.md`, Witte tekst); zie Open vragen 4.
   - Loopt de achtergrondtitel (Stock: eindeloos, 30 s, opacity 0,2) of staat hij stil? Groot en vaag in inkt op een lichte tint: welk contrast/opacity?
   - Verspringend ritme zoals Stock (links 33,33 % / 8,33 % …) of een rustiger opbouw met vier projecten? Welke foto per project (liggend 4:3 of zoals Stock 33,33 : 58,33)?
   - Hoe verhoudt dit zich tot de bestaande kleurlaag (`.achtergrond`, `data-achtergrond`) en de hover naar de diepe tint (`data-diep`, `main.js` §portfolio)? Doet het overzicht mee met de laag, of heeft elk project een eigen vlak (zoals het drieluik)?
2. **Aanwijzen en touch.** Wat gebeurt er bij aanwijzen met een muis (diepe tint, foto zoomt, sluier, cursorlabel)? Wat ziet een touchgebruiker in rust? Zelfde volgorde foto/titel op mobiel als op desktop?
3. **Opbouw projectpagina.** Volgorde en secties: kop (terracotta of de projectkleur?), uitleg, foto's, pijl-links, statement, contact? Hoe groot is de uitleg (kop-m, quote of lopende tekst)? Komen de bijschriften terug?
4. **Foto's "ingezoomd".** Wat bedoelt Carst ermee, en hoe doen we het zonder vergroting boven het bestand?
   - grote foto's over (bijna) de hele breedte, een verspringend raster zoals Prematuurkleding 003, of een carrousel;
   - wel of geen klik naar een grotere weergave (lightbox)? Zo ja: toetsenbord, Esc, focus terug, en op touch;
   - wat doen we met de kleine Instagram-foto's (316–540 px breed)? Kleiner tonen, groeperen, of weglaten op de projectpagina?
   - welke DPR-eis (1 of 2) geldt voor "niet vergroot"?
   - inschuiven bij scrollen: hergebruiken we `.inschuif` van Prematuurkleding?
5. **Vorig/volgend project.** Onderaan een groot blok "Volgend project" in de kleur van dat project (zoals Stock), of alleen pijl-links? Terug naar het overzicht?
6. **Mobiel (390 px).** Overzicht: één project per scherm met kleurvlak, of compacter? Projectpagina: foto's onder elkaar, in paren, of een veegrij (`.carrousel`)? Hoeveel scrollhoogte mag het fotoblok innemen?
7. **Balk en label.** Wat toont de balk op een projectpagina ("— Inspiratie" of "— Kleding")?
8. **Ontwerpcriteria.** Graag toetsbare criteria (OC1 …) voor de ontwerpgate: maten per breakpoint, rand ten opzichte van `.wrap`, positie eerste foto op 390 × 844, beweging (start, eind, duur, minder beweging).

### Antwoord website-ontwerper (rol 1, 15 nov.; gemeten op eigen testserver, Chromium)

**1. Overzicht `inspiratie.html`: projecttegels zoals Stock, binnen onze kleurregels**
- Paginakop blijft (terracotta, "Inspiratie" / "Gemaakt in het atelier in Ospel"); de vier pijl-links in de kop vervallen (tegels zijn de links; scheelt ~180 px op 390 en vier dubbele tabstops).
- Vier tegels, elk een eigen vlak over de volle breedte in een lichte paletkleur; doet niet mee met de kleurlaag (geen `data-achtergrond`/`data-diep`, zoals het drieluik); tegels sluiten aan zonder witte lijn.
- Kleuren: 001 Kleding **perzik** `#DEB799` (diep `#C88654`); 002 Knuffels, swaddles en babynest **mauve** `#B5969E` (diep `#AE8C94`); 003 Siliconen en hangers **olijf** `#B4B19A` (diep `#999575`); 004 Kraamcadeauboxen **salie** `#C3CFBC` (diep `#839C75`). Kleding en Kraamcadeauboxen ruilen t.o.v. nu: de kledingfoto's zijn op salie gefotografeerd (`#C3CEBD`) en zouden wegvallen; de box past bij de salie prijskaarten.
- Opbouw tegel: hergebruik `.thema`, `.thema-vak`, `.ritme-1…4`, `.thema-lopend`, `.thema-foto`, `.thema-onder` uit `style.css` (geen HTML gebruikt ze nog); hernoem naar `.project…` of deel, geen tweede kopie. Label `001 — Kleding` op de rand; achter de foto de projectnaam als lopende regel (`.lopend`/`.lopend-spoor`, `aria-hidden="true"`, inkt 0,2, halve spoorbreedte in 30 s, pauze buiten beeld, begint met de naam); foto 4:3; daaronder `h2.kop-m` en een `span` in `.pijl`-stijl "Bekijk de foto's"; foto + titel + pijl samen één `<a>` (één tabstop); label en lopende regel erbuiten.
- Ritme van Stock: linkerrand foto 33,33 / 8,33 / 25 / 8,33 % van het ontwerpvak; foto 58,33 % breed (1440: 840 × 630); 4:3 i.p.v. Stocks 1,75:1 (staande productfoto's, namen en LUX-label blijven heel); geen parallax.
- Tegelfoto = eerste foto op de projectpagina (alle ≥ 900 px breed): Kleding `p-sjaaltje-kleur.jpg` (object-position 50% 35%); Knuffels `p-swaddle-open-kleur.jpg` (50% 60%); Siliconen `p-bijtring-kleur.jpg` (Tobi, 50% 50%); Kraamcadeauboxen `hero-box-open.jpg` (50% 30%).

**2. Aanwijzen, toetsenbord en touch**
- Muis (`hover: hover` en `pointer: fine`) en `:focus-visible`: alleen dat vlak verloopt naar de diepe tint; titel wit (kop-m ≥ 34 px; 3,0:1); lopende regel wit op 0,3; foto zoomt binnen zijn kader 1 → 1,04 (kleiner dan het bestand); 1 s `cubic-bezier(.45,0,.55,1)`, terug bij verlaten; label en "Bekijk de foto's" blijven inkt (5,4:1); geen sluier; kleurlaag en balk doen niet mee. Met CSS; de hover van `.portfolio-groep` in main.js §4b is niet meer nodig.
- Touch: geen aanwijsstand; altijd lichte tint, alle tekst inkt, foto boven de titel. De Inspiratie-regel in `CLAUDE.md` verandert mee (criterium 29).
- Minder beweging: kleur direct, geen zoom, lopende regel stil. Zonder JS alles stil, links werken.
- Mauve/diep mauve liggen dicht bij elkaar; bij Knuffels toont vooral de witte titel de wissel (bedoeld).

**3. Opbouw projectpagina**
1. `.pagina-kop` op terracotta (balk na de kop): `p.caps` "Inspiratie"; `h1.kop-xl` projectnaam wit; uitleg lopende tekst inkt 18 px (mobiel 17), regelhoogte 1,6, max. 31em *(was 34em; ontwerpgate 15 nov.: 34em gaf 78–82 tekens per regel, 31em ≈ 72)*; geen pijl-links in de kop.
2. `001 — Foto's` op de lichte tint van het project (laag met `data-achtergrond`): alle foto's van de groep in verspringend raster; hergebruik `.voorbeelden` (Prematuurkleding 003: 12 kolommen, gaten 16 / 96 px, tablet 12 / 56, margin-top-verschuiving); elke foto in eigen verhouding, **niet bijgesneden**; bestaand bijschrift in `.werk figcaption`-stijl (Libre Caslon Display 24 px, mobiel 20, inkt); onder het raster de pijl-links uit criterium 14 (16 px).
3. `002 — Volgend project`: de tegel van het volgende project (zelfde onderdeel en gedrag); volgorde Kleding → Knuffels → Siliconen → Kraamcadeauboxen → Kleding; daaronder op hetzelfde vlak pijl-link "Alle inspiratie" → `inspiratie.html`; geen "Vorig project".
4. `003 — Contact`: gedeeld contactblok. Geen statement op de projectpagina's.

**4. "Ingezoomd": groot en dichtbij, nooit groter dan het bestand**
- Veel groter dan nu (270 px in vier kolommen), een paar per scherm; via de weergavebreedte.
- Geen lightbox; foto's geen link/knop/tabstop; pinch-zoom blijft toegestaan.
- Max. breedte desktop (12 kolommen, 1 kolom ≈ 86 px op 1440): staande/vierkante productfoto's (900 en 675 px) 5–6 kolommen (492–594 px, nooit hoger dan 810 px op 1440 × 900); liggende thema-/boxfoto's (1100, 1400) 6–7 (594–696); `ig-jasje-teddy`, `ig-jasje-tricot`, `ig-babynest`, `ig-charme-roze` 3 (289); `ig-outfit-ladder`, `ig-charme-blauw`, `ig-speenkoord-paardje` 4 (391); `ig-bijtringen` 5 (492). Kleine foto's als paar (bijv. de twee jasjes).
- Weergave in CSS-px nooit breder dan het grootste bestand (DPR 1), op elke breedte en tijdens beweging. DPR 2 vraagt grotere originelen (open punt, buiten scope).
- Inschuiven: hergebruik `.inschuif` (masker van onder, 1,2 s, vertraging per plek) **zonder schaal 1,12**. Minder beweging en zonder JS: direct.
- Geen foto op een vlak in zijn eigen achtergrondkleur. Bij Siliconen komt `p-bijtring-kleur.jpg` vooraan.

**5. Mobiel (≤ 760 px) en tablet**
- Overzicht 390: elke tegel in één scherm; foto over de binnenbreedte van `.wrap` (326 × 245), tegen de rand (springt niet); titel kop-m 34 px; lopende regel 56 px achter het bovenste deel van de foto.
- Overzicht tablet: zoals de oude thema-indeling: foto 76 % breed, om en om 8 % / 16 % van links en rechts; lopende regel 80 px.
- Projectpagina 390: 2 kolommen, gat 12 px; grote productfoto's volle breedte, rest in paren met de rechter 24 px lager; foto's smaller dan 326 px (`ig-jasje-*`, `ig-babynest`) altijd in een paar; fotoblok ≤ 3,5 schermhoogtes; geen veegrij.
- Projectpagina tablet: 12 kolommen met de tabletmaten van `.voorbeelden`.

**6. Balk en labels**
- Balk na `.pagina-kop`.
- Projectpagina's: `— Inspiratie`, `001 — Foto's`, `002 — Volgend project`, `003 — Contact`.
- Overzicht (kort): `001 — Kleding`, `002 — Knuffels`, `003 — Siliconen`, `004 — Cadeauboxen`, `— Het atelier`, `005 — Contact`.
- Reden (gemeten 15 nov.): balklabel begint op x 126 (360) / 128 (390), burger op x 286 / 314; de huidige lange labels lopen nu al 3–9 px (390) en 28–34 px (360) over de burger (bestaande fout). Korte labels houden ≥ 49 px vrij; "002 — Volgend project" (152 px) houdt op 360 nog 9 px; haalt WebKit 8 px niet, dan "002 — Meer zien".

### Ontwerpcriteria (voor de ontwerpgate)
- **OC1** Na de kop van het overzicht precies vier tegels, elk eigen vlak met berekende achtergrond perzik, mauve, olijf, salie (exacte hex), aansluitend (±1 px) op 360, 390, 768, 1024, 1440. Kop zonder pijl-links; h1 en `kop-xl` ongewijzigd.
- **OC2** In rust en op touch alle tekst op de tegels inkt `#202020`; geen wit.
- **OC3** Muis/focus-visible: alleen de aangewezen tegel diep, `.achtergrond` gelijk; titel `#FFFFFF` ≥ 34 px; label en pijl inkt; overgang 1 s, foto `scale` ≤ 1,04; minder beweging duur 0 en geen schaal.
- **OC4** Tegelfoto 4:3 (±1 %); 1440: 840 px (±2), linkerrand 33,33/8,33/25/8,33 %; 768: 76 %; 390: 326 px (±1) op 32 px van links; `naturalWidth` ≥ 1,04 × weergavebreedte op elke breedte.
- **OC5** Lopende regel `aria-hidden="true"`, opacity 0,2 in rust; stil bij minder beweging en zonder JS; pauzeert buiten beeld; `scrollWidth ≤ innerWidth` op 360, 390, 768, 1024, 1440.
- **OC6** Eén tabstop per tegel; link omvat foto, titel en "Bekijk de foto's", ≥ 44 px hoog.
- **OC7** 390 × 844: hele tegel (label tot onderkant pijl) ≤ 788 px; 1440 × 900: foto + titel + pijl ≤ 836 px.
- **OC8** Projectkop: h1 projectnaam wit ≥ 40 px; uitleg inkt 18 px desktop, ≥ 17 mobiel, ≤ 75 tekens per regel (≤ 31em; *was ≤ 34em, rechtgezet na de ontwerpgate van 15 nov.: 34em gaf op 1440/768 78–82 tekens per regel*).
- **OC9** Eerste foto projectpagina = tegelfoto; 390 × 844 bovenkant ≤ 844, onderkant ≤ 1688 en hoogte ≤ 788 (past onder de balk); 1440 × 900 bovenkant ≤ 900. *(Rechtgezet door de bouwer op verzoek van de controleur, 15 nov.: de oorspronkelijke tekst "bovenkant ≤ 844 en bij `scrollY = 844` helemaal in beeld onder de balk" kon niet allebei gelden; dit is de lezing waarop sitecontrole en spec toetsen.)*
- **OC10** Geen foto bijgesneden op projectpagina's (verhouding ±1 %); op 360, 390, 768, 1024, 1440, 1920 `clientWidth ≤ naturalWidth`; Instagram-foto's nooit breder dan hun bestand.
- **OC11** 1440 × 900: geen foto hoger dan 810 px.
- **OC12** 390 × 844: blok 001 ≤ 2954 px; `ig-jasje-*` en `ig-babynest` in een paar op halve kolombreedte.
- **OC13** Tijdens inschuiven schaal ≤ 1; minder beweging en zonder JS geen `clip-path`, alles direct zichtbaar.
- **OC14** Elke foto zijn bestaande bijschrift, inkt, ≥ 20 px mobiel.
- **OC15** Zelfde tint per project op overzicht en projectpagina (Kleding perzik, Knuffels mauve, Siliconen olijf, Kraamcadeauboxen salie); geen foto op zijn eigen achtergrondkleur.
- **OC16** "Volgend project" = zelfde onderdeel als de tegel, volgorde klopt (na Kraamcadeauboxen Kleding); "Alle inspiratie" 16 px, ≥ 44 px hoog; geen "Vorig project".
- **OC17** Balklabels zoals punt 6; op 360 en 390 (Chromium en WebKit) één regel en ≥ 8 px links van de burger; boven een tegel of fotoblok lichte tint, donker logo, label inkt.
- **OC18** Geen lightbox; foto's geen tabstop; viewport blokkeert inzoomen niet.
- **OC19** Onder het fotoblok pijl-link naar het formulier (criterium 14), onderaan het contactblok; in `main` geen `wa.me`, `tel:` of `mailto:`.

Opmerkingen ontwerper voor Carst: kleurenruil Kleding ↔ Kraamcadeauboxen; nieuwe linkteksten/labels ("Bekijk de foto's", "Alle inspiratie", "Foto's", "Volgend project", korte overzichtslabels "Knuffels", "Siliconen", "Cadeauboxen"); `CLAUDE.md` Inspiratie-regel wordt "in rust en op touch lichte tint met inkt; muis of focus diepe tint met witte titel"; bestaande fout balklabel over burger op inspiratie.html wordt hiermee opgelost (andere pagina's in de ontwerpgate bekijken).

## Bestanden
- `public/inspiratie.html`: projectenoverzicht
- `public/inspiratie-kleding.html`, `public/inspiratie-knuffels-en-babynest.html`, `public/inspiratie-siliconen-en-hangers.html`, `public/inspiratie-kraamcadeauboxen.html` (nieuw)
- Menu in alle pagina's: `index.html`, `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `babynest.html`, `contact.html`, `privacy.html`, `bedankt.html`, `404.html`
- `public/index.html`: links bij 002 Handwerk
- `public/sitemap.xml`
- `public/assets/css/style.css`, `public/assets/js/main.js` (overzicht, hover, eventueel vorig/volgend en foto's)
- `scripts/controleer.py`, `scripts/schermafdrukken.py`, `tests/e2e/hulp.js`, `tests/e2e/kernpaden.spec.js`, `tests/e2e/seo-veiligheid.spec.js`, `tests/e2e/inspiratie-projecten.spec.js` (nieuw), `tests/e2e/basis/` (via `visueel-basis.yml`)
- `CLAUDE.md`

## Buiten scope
- Nieuwe foto's of nieuwe webversies; alleen de bestaande foto's van elke groep.
- Groter maken van de Instagram-foto's (de originelen zijn nog open, zie `CLAUDE.md`).
- Nieuwe tekst buiten de tekstvoorstellen hierboven, de labels van nieuwe secties en de verplichte meta-teksten (criterium 10).
- Een vijfde project (bijv. Prematuurkleding of losse thema's) of andere groepen.
- `_redirects`, `_headers`, `wrangler.jsonc`, `.github/workflows/`, het formulier en `src/`.
- De hoofdnavigatie (zes items) zelf.
- De goedkeuring van de teksten: die geeft Carst; deze wijziging gaat niet live zonder zijn akkoord op de uitleg (of met de LET OP's zichtbaar in het validatierapport).

## Open vragen
**Blokkerend voor het bouwen:**
1. **Ontwerprichting.** Vragen 1–8 hierboven moet website-ontwerper eerst beantwoorden. Zonder die antwoorden liggen opbouw, kleur, foto's en mobiel gedrag niet vast.
2. **Teksten (voorstel, wacht op akkoord Carst).** Graag akkoord of correctie per project. Specifiek:
   - Kan een swaddle ook een naam krijgen? Zo niet, dan wordt de eerste zin van project 2 "Een knuffel met naam, of een babynest in de stof en kleur die jij kiest."
   - Mag "Een eigen stof of kleur is altijd bespreekbaar." ook buiten de kraamcadeaubox (knuffels, swaddles, babynest)?
   - Maakt Carien tashangers op bestelling? Zo ja, dan kan een zin daarover in project 3 (tekst van Carst of Carien).
   - Mogen projecten 1 en 2 dezelfde zin over borduren delen?
3. **Vier of drie projecten?** Carst noemt drie onderwerpen "bijv."; dit voorstel houdt Kleding als vierde project. Klopt dat?
4. **Witte titel op een kleurvlak in rust (ontwerpregel).** Stock zet een witte titel op het kleurvlak. Volgens `CLAUDE.md` mag wit alleen op terracotta of op een diepe portfoliotint *bij aanwijzen* (op touch ook in rust, als kaart). Als de ontwerper een diepe tint met witte titel in rust ook op desktop wil, is dat een wijziging van de ontwerpregel en moet Carst die goedkeuren. **Alternatief zonder regelwijziging:** lichte tint met inkt in rust, diepe tint met witte titel bij aanwijzen (zoals nu op Inspiratie en Handwerk).

**Niet blokkerend:**
5. **Keuze van de foto's.** De groepen hebben nu "LET OP: keuze van de foto's wacht op akkoord" (brief 2026-11-14-goedkeuringen-teksten, Open vragen 2). Die markering verhuist naar de projectpagina's. Zegt Carst dat de foto's goed zijn, dan gaat ze weg.
6. **Onderwerp in het formulier.** Klopt "Iets op maat" als vooringevuld onderwerp voor Kleding, Knuffels en Siliconen? Anders gaan die links naar `contact.html#formulier` zonder onderwerp, zoals nu.
7. **Issuenummer.** Er is geen issue bekend voor deze feedback. Is er een, dan komt `Closes #<nummer>` in de pull request; anders verwijst de pull request naar de feedback van Carst (15 nov., opmerking 4).
8. **Samenloop.** Andere open branches die `style.css`, `main.js` of het menu raken: wie het laatst merget, rebaset.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit feedback Carst 15 nov. 11:43 (opmerking 4) en zijn besluit over de teksten. Gelezen: `CLAUDE.md`, `inspiratie.html`, `_redirects`, `sitemap.xml`, teksten op `werkwijze.html`, `index.html`, `kraamcadeauboxen.html`, Stock-analyse Projecten, schermafdrukken 8.png en 9.png. Keuze: platte bestanden `inspiratie-<onderwerp>.html` (geen padwijziging, `_redirects` ongemoeid). Vier tekstvoorstellen met bron per zin (voorstel, wacht op akkoord Carst). Ontwerprichting open met acht vragen. Risico midden. Blokkerend: Ontwerprichting, akkoord/correctie teksten, aantal projecten, witte titel in rust |
| Bouwen | website-bouwer | Gebouwd volgens de Ontwerprichting (OC1–OC19) en de Besluiten Carst. **Overzicht:** kop zonder pijl-links; vier tegels (`section.project`, hergebruik van het ongebruikte thema-ritme, hernoemd naar `.project…`, geen kopie): eigen vlak perzik/mauve/olijf/salie (inline, doet niet mee met de laag), foto 4:3 (1440: 840 × 630, linkerrand 33,33/8,33/25/8,33 %; tablet 76 %; mobiel 326 px op 32 px), lopende regel `aria-hidden` (0,2, 30 s), foto + titel + "Bekijk de foto's" één link; muis/focus: alleen dat vlak diep, titel wit, foto 1,04 (CSS `:has`); ankers `#kleding #textiel #siliconen #boxen` blijven; balklabels kort. Hover van `.portfolio-groep` (main.js §4b) en de metselwerk-CSS weg. **Projectpagina's** (4): kop met de uitleg letterlijk uit de tekstvoorstellen + LET OP "wacht op akkoord Carst" (ook boven title/description), 001 Foto's in `.voorbeelden` (plaats per foto via `--d/--dt/--m/--mt`, eigen verhouding, `max-width: 100%` van het width-attribuut, inschuiven zonder schaal, eerste foto direct + `fetchpriority`), pijl-links (Iets op maat = `?onderwerp=iets-op-maat-laten-maken`, bestaande waarde), 002 Volgend project (zelfde tegel + "Alle inspiratie"), 003 Contact. LET OP over de fotokeuze verhuisd naar de projectpagina's. Menu-subitems op alle pagina's (404 absoluut), Handwerk-links (lijst en kaarten), `sitemap.xml` (0.6), `lighthouserc.cjs` (vier pagina's erbij), `schermafdrukken.py`, `CLAUDE.md`. `_redirects` ongewijzigd. Geen nieuwe foto's, geen nieuwe tekst buiten de voorstellen en de labels/linkteksten van de ontwerper. **Aangepaste verwachtingen (volgen uit de wijziging, geen versoepeling):** controleer.py: PAGINAS/HOOFDPAGINAS + projectpagina's, TECHNIEKEN-doelen, MENU_SUBS (subitems herkend via `.menu-sub`, landen op de projectpagina met h1), aria-current Inspiratie op projectpagina's, sitemap-lijst, de controle van de vier groepen vervangen door `controleer_portfoliopagina` (tegels) + `controleer_projectpaginas`, balk ook ≥ 8 px van de burger op 360/390; kernpaden.spec.js r. 91 (onderwerp `iets-op-maat-laten-maken` toegestaan) en r. 109 (Handwerk-doelen); seo-veiligheid.spec.js sitemap-lijst; hulp.js PAGINAS + 4. Nieuw: `tests/e2e/inspiratie-projecten.spec.js` (criteria 1, 3, 8, 10, 12–14, 16–18, 21–24; OC1–OC7, OC9–OC13, OC15–OC19; ook WebKit). **Lokaal (Chromium, eigen poort):** `npm test` 192/192; e2e zonder axe-specs 785 geslaagd, 3 mislukt onder belasting (kernpaden intro 641 > 600 ms, logo-krimpen /inspiratie, de breedtetest van de nieuwe spec door de testtijd); los herhaald alle drie groen (breedtetest kreeg 240 s testtijd); nieuwe spec 61/61; `controleer.py` geen fouten. Niet lokaal: axe, Lighthouse, WebKit, visueel (alleen in CI). Visueel: inspiratie wijkt af en de vier projectpagina's hebben nog geen basis (bedoeld); andere pagina's alleen in het geopende menu (andere hrefs, zelfde tekst). OC9 op 390 gelezen als: bovenkant ≤ 844, onderkant ≤ 1688 en hoogte ≤ 788. Open: zin over tashangers (Carst bevestigde het feit, maar er is geen tekst; niets bij verzonnen), akkoord op de vier uitleggen en meta-teksten, fotokeuze |
| Bouwen (ronde 2) | website-bouwer | Na NIET AKKOORD van de controleur. `origin/main` gemerged (#88; conflict in `CLAUDE.md` opgelost met beide kanten: Witte-tekstregel met de projecttegels én de mobiele drieluikblokken). Criterium 13: de mobiele Handwerk-lookbooklinks in `index.html` gaan nu naar `inspiratie-siliconen-en-hangers.html` en `inspiratie-knuffels-en-babynest.html`; geen andere links naar de oude ankers meer (alleen de bewuste ankertest op het overzicht). **Aangepaste verwachtingen (structuurgevolg, geen versoepeling):** `tests/e2e/homepage-mobiel.spec.js` r. 12/14 (doelen van Rustig en praktisch en Speels en levendig); het lookbookdeel van `controleer.py` volgt al `TECHNIEKEN` (geen aparte wijziging nodig); de nieuwe spec toetst nu ook de lookbook-panelen. Kan-beter meegenomen: `.project-onder` is een `div` (geen `h2` in een `span`), tegelfoto's `alt=""` (decoratief; spec toetst linknaam "<titel>, Bekijk de foto's", komma optioneel, en sitecontrole eist `alt=""`), breedtetest per pagina opgesplitst, `controleer.py` mobiel ook hoogte ≤ 788, OC9-tekst in de brief rechtgezet met vermelding. **Lokaal (Chromium, poort 4771):** `npm test` 192/192; e2e zonder axe-specs 783 geslaagd en 40 mislukt bij een machinebelasting van ~11 (time-outs, logo/intro-timing); die 40 los en serieel opnieuw: 129/129 geslaagd; `controleer.py` geen fouten |
| Bouwen (ronde 3) | website-bouwer | Na ONTWERP NIET AKKOORD (head 0e30a90). OC8: uitleg max. 31em (was 34em; ≈ 72 tekens), in OC8 en Ontwerprichting punt 3 rechtgezet met vermelding; nieuwe toets meet tekens per visuele regel ≤ 75 op 1440 en 768 (spec per project + `controleer.py`). P1: op mobiel staan de acht liggende boxfoto's over de volle breedte; de twee vierkante (box open, de tegelfoto, en box dicht) staan samen in een paar, anders past het fotoblok niet (alles vol ≈ 3148 px > 2954); nu ≈ 2600 px. Andere projecten hadden al geen grote liggende foto's in paren (de jasjes zijn klein en blijven een paar). P2: `#fotos` heeft `data-laag-lijn="0.99"` op de vier projectpagina's (geen witte tekst in 001; toets in de spec), `CLAUDE.md` (Scrollen en kleur, Inspiratie-regel) bijgewerkt. Lokaal (Chromium, poort 4771): `inspiratie-projecten.spec.js` 73/73; contact-ruimte-en-kleur, mobiel-ontwerp en kernpaden (gefilterd) 75/75; `controleer.py` geen fouten |
| Controleren | website-controleur | Ronde 1 NIET AKKOORD (achter op main; lookbooklinks naar oude ankers). Ronde 2 NIET AKKOORD (CLAUDE.md Witte tekst verkeerd samengevoegd; hersteld in 0e30a90). Ronde 3 (84d13f3) **AKKOORD**: uitleg 31em met toets ≤ 75 tekens, liggende boxfoto's mobiel volle breedte, data-laag-lijn 0,99 alleen op #fotos zonder witte tekst; geen grens verruimd; npm test, betrokken specs (183/183) en controleer.py groen. |
| Ontwerpgate | website-ontwerper | Ronde 1 NIET AKKOORD (regels 78–82 tekens in de projectkop). Ronde 2 (84d13f3) **ONTWERP AKKOORD**: ≤ 73 tekens per regel, boxfoto's vol op mobiel, projecttint direct onder de kop; tegels, kleuren, balklabels volgens OC1–OC19; foto's onbijgesneden en niet vergroot. Kan beter: openingsfoto Kraamcadeauboxen op mobiel als paar (157 px); "002 — Volgend project" op 360 px precies 8 px van de burger. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (15 nov., keuzevragen in de chat)
1. **Vier projecten**, met Kleding.
2. **Witte titel binnen de regels:** in rust de lichte tint met inkt, bij aanwijzen de diepe tint met witte titel (zoals Inspiratie nu).
3. **Feiten bevestigd door Carst:** een swaddle kan ook een naam krijgen; een eigen stof of kleur is bespreekbaar, ook voor losse producten; Carien maakt tashangers op bestelling; de zin over borduren mag bij Kleding én bij Knuffels staan.
   De tekstvoorstellen blijven "voorstel, wacht op akkoord Carst" (LET OP) tot Carst ze in de preview goedkeurt; de bevestigde feiten mogen in de voorstellen verwerkt worden.
