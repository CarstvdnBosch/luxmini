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
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten Carst (15 nov., keuzevragen in de chat)
1. **Vier projecten**, met Kleding.
2. **Witte titel binnen de regels:** in rust de lichte tint met inkt, bij aanwijzen de diepe tint met witte titel (zoals Inspiratie nu).
3. **Feiten bevestigd door Carst:** een swaddle kan ook een naam krijgen; een eigen stof of kleur is bespreekbaar, ook voor losse producten; Carien maakt tashangers op bestelling; de zin over borduren mag bij Kleding én bij Knuffels staan.
   De tekstvoorstellen blijven "voorstel, wacht op akkoord Carst" (LET OP) tot Carst ze in de preview goedkeurt; de bevestigde feiten mogen in de voorstellen verwerkt worden.
