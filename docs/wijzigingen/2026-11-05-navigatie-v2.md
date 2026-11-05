# Navigatie v2: Werkwijze · Kraamcadeauboxen · Prematuurkleding · Portfolio · Contact

- **Datum:** 2026-11-05
- **Aangevraagd door:** Carst
- **Branch:** `wijziging/navigatie-v2` (al aangemaakt)
- **Risico:** hoog. `public/_redirects` verandert (Producten, Over en Kraamcadeaubox krijgen 301's), drie pagina's verdwijnen en drie komen erbij, en de hele harness (controleer.py, e2e, lighthouserc, rooktest) moet mee. Het formulier, `src/`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt.

**Wens (5 nov.):** hoofdnavigatie zoals stockdutchdesign.com, vijf knoppen, elk een eigen pagina: Werkwijze (hoe Carien werkt + personaliseren), Kraamcadeauboxen (op maat, prijsrichtlijn), Prematuurkleding (op maat, prijsrichtlijn), Portfolio (alles wat ze gemaakt heeft), Contact.

**Besluiten Carst:**
- De release van PR #7 wordt overgeslagen; deze wijziging komt er bovenop.
- Producten en Over gaan op in Werkwijze; de oude adressen geven 301.
- Prijsrichtlijn prematuurkleding: zichtbare plaatshouder "[prijs]" met `<!-- LET OP -->` tot Carien die geeft.
- Portfolio: eigen foto's als raster, gegroepeerd.

**Besluiten hoofdsessie op de open punten van de ontwerper** (Carst kan ze in de PR nog terugdraaien):
- Menu in de header vanaf 1200 px, daaronder alleen de burger.
- Portfolio: één foto per gemaakt item (geen dubbele versies, geen atelierfoto's), volgens de lijst van de ontwerper (F), met alle negen box-thema's.
- Tijdelijke foto bij Prematuurkleding (`p-broekje-kleur`).

## Doel
Een bezoeker ziet in één oogopslag de vijf dingen die zij zoekt (hoe Carien werkt, de boxen, prematuurkleding, wat ze al gemaakt heeft en hoe je contact opneemt) en komt via elke knop op een eigen pagina. Oude adressen en links blijven werken.

## Acceptatiecriteria

### Ontwerpcriteria (van website-ontwerper, volledig overgenomen)

1. Op 1200 en 1440 px staan in de header van alle pagina's precies vijf links op één regel naast het logo, in de volgorde Werkwijze, Kraamcadeauboxen, Prematuurkleding, Portfolio, Contact. Op 1024 px en smaller staat er alleen de burger, nergens schuift het menu naar een tweede regel.
2. De huidige pagina heeft `aria-current="page"` en is onderstreept. Zijn er twee paginanamen met dezelfde betekenis, dan heeft alleen de huidige pagina het kenmerk.
3. Op 1440 × 900 staan in het open menu alle hoofditems en subitems zonder scrollen in beeld. Op 390 × 844 staan de vijf hoofditems en WhatsApp zonder scrollen in beeld.
4. Doorverwijzingen:
   - `/producten`, `/over`, `/over-lux`, `/producten.html` en `/over.html` geven 301 naar `/werkwijze`;
   - `/kraamcadeaubox`, `/kraamcadeaubox.html`, `/aanbod`, `/shop` en `/product-page/x` geven 301 rechtstreeks naar `/kraamcadeauboxen`;
   - nergens zit een tussenstap in de doorverwijzing;
   - `/producten#siliconen` en `/over#hoe-ik-werk` landen met de kop van die sectie in beeld.
5. De sitemap bevat `/`, `/werkwijze`, `/kraamcadeauboxen`, `/prematuurkleding`, `/portfolio`, `/contact` en `/privacy`, en geen oude adressen. Geen interne link wijst naar een verwijderde pagina of een anker dat niet bestaat.
6. Homepage: de labels en de balk tonen "002 — Werkwijze" en "003 — Portfolio". "Bekijk het portfolio" is op 1440 (zonder aanwijzen), 768 en 390 te zien en minimaal 44 px hoog.
7. Werkwijze:
   - op 390 × 844 staan `h1` "Werkwijze" en de kop in het eerste scherm;
   - de witte kop over de foto haalt minimaal 3:1;
   - "Wat ik maak" heeft vijf rijen met de id's uit A en werkende pijl-links;
   - de slider wisselt alleen bij klik, Enter of Spatie, en `aria-pressed`/`aria-selected` klopt.
8. Kraamcadeauboxen: de bestaande criteria (prijsregel in het eerste scherm op 390, negen thema's in het ritme, vier prijskaarten € 35/50/65/80) slagen nog.
9. Prematuurkleding:
   - op 390 × 844 staan de quote, "Prijsrichtlijn: [prijs]" en "WhatsApp Carien" zonder scrollen in beeld;
   - de pagina heeft maximaal 4 secties en geen scherm zonder inhoud;
   - de LET OP bij de prijs en bij de tijdelijke foto staat in de bron en in het validatierapport.
10. Portfolio, raster:
    - vier groepen met de genoemde id's en kleuren, buren nooit dezelfde kleur, nergens terracotta;
    - 4, 3 en 2 kolommen op 1440, 768 en 390;
    - geen foto wordt breder getoond dan het bestand (de getoonde breedte is nooit groter dan de breedte van het bestand);
    - geen foto komt dubbel voor.
11. Portfolio, aanwijzen en touch:
    - op 1440 kleurt bij aanwijzen de groep naar de diepe tint en worden de groepskop en het aangewezen bijschrift wit (minimaal 24 px);
    - het label en de pijl-links blijven inkt;
    - op 390 en 768 (touch) zijn alle bijschriften in inkt te zien, zonder aanwijzen.
12. Portfolio, snelheid: Lighthouse mobiel geeft LCP ≤ 4 s, CLS ≤ 0,1 en ≤ 3,5 MB. Alle foto's onder het eerste scherm hebben `loading="lazy"`, en elke `img` heeft `width`, `height` en een beschrijvende `alt`.
13. Algemeen:
    - axe WCAG 2.1 AA geeft 0 fouten op alle pagina's × 3 schermen;
    - geen horizontaal scrollen op 390, 768 en 1440;
    - lopende tekst is minimaal 16 px;
    - pijl-links en ankerlinks zijn minimaal 44 px hoog;
    - de balk verschijnt op de nieuwe pagina's met het juiste label;
    - zonder JavaScript en bij "minder beweging" is alles zichtbaar.
14. Visuele basis: voor de nieuwe pagina's is nog geen basis. Gate 5 waarschuwt, en Carst werkt de basis pas bij na GO.

### Technische criteria

15. **Formuliertests:** `npm test` is groen. `src/` en `tests/*.test.js` blijven ongewijzigd (het formulier verandert niet).
16. **Sitecontrole:** `python3 scripts/controleer.py` is groen en bijgewerkt:
    - `PAGINAS` en de controles per schermbreedte bevatten `index.html`, `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `portfolio.html` en `contact.html` (plus de bestaande overige pagina's);
    - alle controles die nu naar `producten.html`, `over.html` of `kraamcadeaubox.html` verwijzen, zijn omgezet naar de nieuwe pagina's (prijstabel/prijskaarten en "Zo werkt het" → `kraamcadeauboxen.html`; tabbladen "Hoe ik werk", fotorij en categorie-/productcontroles → `werkwijze.html`). Een controle die vervalt omdat het onderdeel weg is, krijgt een vervangende controle voor het nieuwe onderdeel (bijv. "Wat ik maak" met vijf rijen, portfoliogroepen met vier id's, kolommen per breedte, geen dubbele foto's, geen foto breder getoond dan het bestand);
    - de controle op interne links en ankers dekt de nieuwe pagina's en de menu-subitems uit A.
17. **E2E-harness (`tests/e2e/`), zonder grenzen of axe-regels te versoepelen:**
    - `hulp.js` `PAGINAS` bevat `/`, `/werkwijze`, `/kraamcadeauboxen`, `/prematuurkleding`, `/portfolio`, `/contact` (plus de bestaande overige) en niet meer `/producten`, `/kraamcadeaubox`, `/over`;
    - `kernpaden.spec.js`: de navigatietest controleert vijf header-items in de volgorde Werkwijze, Kraamcadeauboxen, Prematuurkleding, Portfolio, Contact (op een breedte ≥ 1200 px), elk met het juiste doel; de prijstest gaat naar `/kraamcadeauboxen` en vindt € 35, € 50, € 65 en € 80;
    - `seo-veiligheid.spec.js`: de sitemaptest verwacht de adressen uit criterium 5 en geen oude adressen; de lijst met pagina's voor canonical/title/description gebruikt de nieuwe adressen;
    - de doorverwijzingen uit criterium 4 worden getest tegen `scripts/serveer.mjs` (status 301 en `Location` rechtstreeks naar het eindadres);
    - `npm run test:e2e` is groen. Gate 5 (visueel) mag waarschuwen voor de nieuwe pagina's (zie 14); de bouwer werkt de basis in `tests/e2e/basis/` niet zelf bij.
18. **Lighthouse:** `lighthouserc.cjs` `PAGINAS` wordt `['/', '/werkwijze', '/kraamcadeauboxen', '/prematuurkleding', '/portfolio', '/contact']`. Grenzen blijven gelijk.
19. **Schermafdrukken:** `scripts/schermafdrukken.py` neemt zonder argumenten `index.html`, `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `portfolio.html` en `contact.html` mee.
20. **Rooktest:** `scripts/rooktest.sh` controleert `/werkwijze` ("Werkwijze</h1>"), `/kraamcadeauboxen` ("Kies je formaat"), `/prematuurkleding` ("Prematuurkleding</h1>"), `/portfolio` ("Portfolio</h1>") en `/contact` op 200, en `/producten`, `/over` en `/kraamcadeaubox` op 301. De controles op `/producten` en `/over` als 200-pagina vervallen.
21. **`scripts/serveer.mjs`:** het commentaarvoorbeeld (`/producten → producten.html`) klopt met de nieuwe pagina's; het gedrag (schone adressen, `_redirects`) blijft gelijk.
22. **CLAUDE.md** (Carst heeft deze wens zelf gegeven):
    - "Mappen": `producten.html`, `over.html` en `kraamcadeaubox.html` vervangen door `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html` en `portfolio.html`, elk met een korte omschrijving; de omschrijving van `index.html` noemt "002 Werkwijze" en "003 Portfolio";
    - ontwerpregel "Hoofdnavigatie": Werkwijze · Kraamcadeauboxen · Prematuurkleding · Portfolio · Contact, menu in de header vanaf 1200 px, daaronder de burger; de rest van de regel blijft;
    - ontwerpregel "Kraamcadeauboxpagina" wordt "Kraamcadeauboxenpagina" (`kraamcadeauboxen.html`), inhoud verder gelijk;
    - de regel "Vaste balk" noemt ook de koppen van de nieuwe pagina's (`.pagina-kop`, `.over-kop`);
    - geen andere ontwerp- of inhoudsregels veranderen.
23. **docs/kwaliteit.md:** bijgewerkt waar het oude pagina's of adressen noemt; anders ongewijzigd.
24. Nieuwe of herschreven teksten die niet letterlijk van de oude site of uit de bestaande pagina's komen, hebben `<!-- LET OP: wacht op akkoord Carien -->`. Ze verschijnen in het validatierapport.
25. `npm run check` is groen (op de verwachte waarschuwing van gate 5 na).

## Ontwerprichting

*Tekst van website-ontwerper, volledig overgenomen.*

**Algemeen**
- Dezelfde onderdelen hergebruiken, geen nieuwe stijlen:
  - `.pagina-kop` (terracotta) en `.over-kop` voor de koppen;
  - `.slider-sectie`, `.hoe`, `.atelier`/`.fotorij` en `.stappen`;
  - `.formaten` en het gedeelde contactblok (`.contact-rij`).
- Elke `main > section` krijgt een `data-label` met nummer. Krijgt een sectie een lichte paletkleur als achtergrond (`data-achtergrond`), dan nooit terracotta en nooit dezelfde kleur als de buursectie.
- Op lichte paletkleuren is alle tekst inkt. Wit alleen vanaf 24 px (of 19 px vet) op terracotta of op een diepe tint.
- Nieuwe of herschreven teksten krijgen `<!-- LET OP: wacht op akkoord Carien -->`.

**A. Navigatie, menu en adressen**
- **Header:** logo, en rechts **Werkwijze · Kraamcadeauboxen · Prematuurkleding · Portfolio · Contact**.
  - De huidige pagina krijgt `aria-current="page"` en een onderstreping (1 px, 6 px onder de letters).
  - Het menu staat in de header vanaf 1200 px, daaronder alleen de burger.
  - Dit geldt voor alle pagina's, ook privacy, bedankt en 404 (met absolute paden).
- **Menu over het hele scherm:** de vijf hoofditems groot, met subitems (Libre Caslon Text 16 px, 24 px ingesprongen):
  - **Werkwijze:** Het atelier `#atelier` · Hoe ik werk `#hoe-ik-werk` · Personaliseren `#personaliseren` · Wat ik maak `#wat-ik-maak`
  - **Kraamcadeauboxen:** Thema's `#themas` · Formaten en prijzen `#formaten` · Zo werkt het `#werkwijze`
  - **Portfolio:** Kleding `#kleding` · Knuffels, swaddles en babynest `#textiel` · Siliconen en hangers `#siliconen` · Kraamcadeauboxen `#boxen`
  - **Prematuurkleding** en **Contact:** geen subitems.
  - De rechterkolom (WhatsApp, telefoon, mail, Instagram, Facebook) blijft zoals hij is.
  - Op mobiel (tot en met 760 px) alleen de vijf hoofditems, daarna WhatsApp, telefoon en mail.
- **Bestanden:** `werkwijze.html`, `kraamcadeauboxen.html`, `prematuurkleding.html`, `portfolio.html`, `contact.html`. Verwijderen: `producten.html`, `over.html`, `kraamcadeaubox.html`.
- **`_redirects` (301, rechtstreeks naar het eindadres, zonder tussenstap):**
  - naar `/werkwijze`: `/producten`, `/producten.html`, `/over`, `/over.html`, `/over-lux`
  - naar `/kraamcadeauboxen`: `/kraamcadeaubox`, `/kraamcadeaubox.html`, `/aanbod`, `/aanbod/`, `/shop`, `/product-page/*`
  - `/klantenservice` blijft naar `/contact` gaan, `/account/*` blijft naar `/` gaan.
  - Geen regel voor `/contact`, `/werkwijze`, `/portfolio` en `/prematuurkleding`.
- **Oude ankers blijven werken**, omdat de browser het anker meeneemt na de doorverwijzing:
  - op `werkwijze.html` bestaan `#atelier`, `#hoe-ik-werk`, `#babykleding`, `#siliconen`, `#babynest`, `#prematuur` en `#kraamcadeaubox`;
  - op `kraamcadeauboxen.html` bestaan `#themas`, `#formaten` en `#werkwijze`.

**B. Homepage (zelfde opbouw, alleen links en twee labels)**
- Hero "Over Carien", statement "Lees het verhaal" en 005 "Lees het verhaal van Carien" → `werkwijze.html#atelier`.
- 001 "Bekijk de kraamcadeaubox" → `kraamcadeauboxen.html`.
- 002: label wordt **"002 — Werkwijze"**, link wordt **"Bekijk de werkwijze"** → `werkwijze.html#hoe-ik-werk`. De sectie toont stappen en geen producten, dus "Producten" klopt niet meer.
- 003: label wordt **"003 — Portfolio"**. Eerst de pijl-link **"Bekijk het portfolio"** → `portfolio.html`, daarna "Laat iets voor jou maken" → `contact.html#formulier`.
- De rest blijft zoals het is: 004 Personaliseren, 006 Instagram en 007 Contact met `id="contact"`.

**C. Werkwijze (Over en Producten samen)**
- **Kop:** het patroon van `.over-kop`.
  - `h1.caps` "Werkwijze" en de bestaande kop "Van de eerste pakjes voor haar kleinkinderen tot maatwerk voor jou".
  - De foto `over-carien` is de LCP-afbeelding: `fetchpriority="high"`, met srcset.
- **Volgorde:**
  1. **001 Het atelier** `#atelier`: het verhaal letterlijk, de quote en de fotorij, op wit.
  2. **002 Hoe ik werk** `#hoe-ik-werk`: de drie stappen als tabbladen over de donkere foto. Op mobiel en zonder JavaScript staan ze onder elkaar.
  3. **003 Personaliseren** `#personaliseren`: dezelfde slider als op de homepage (Borduren, Belettering, Siliconen), met eigen unieke id's.
  4. **004 Wat ik maak** `#wat-ik-maak`: compact, op grijsblauw.
  5. **005 Contact:** het gedeelde blok.
- **"Wat ik maak":** vijf rijen met de bestaande producttekst en een kleine foto (maximaal 240 px breed, nooit groter dan het bestand). Elke rij heeft een eigen id en een pijl-link:
  - Babykleding → `portfolio.html#kleding`
  - Siliconen → `portfolio.html#siliconen`
  - Babynest → `portfolio.html#textiel`
  - Prematuurkleding → `prematuurkleding.html`
  - Kraamcadeaubox → `kraamcadeauboxen.html`
  - Op mobiel: foto van 96 px links, tekst rechts. Geen vijf schermvullende categorieën meer, want dan wordt de pagina te lang.

**D. Kraamcadeauboxen**
- De pagina blijft zoals hij is (thema's in het projectenritme, de statement, de prijskaarten, Zo werkt het, contact). Alleen het volgende verandert:
  - `h1` wordt "Kraamcadeauboxen";
  - `<title>`, de meta description, de canonical en `og:url` krijgen `/kraamcadeauboxen`.
- De prijsrichtlijn "Vier formaten, van € 35 tot € 80." blijft in de kop staan. De vier kaarten (€ 35, 50, 65, 80) blijven ongewijzigd.

**E. Prematuurkleding (nieuw, kort en eerlijk)**
- **Kop:** `.pagina-kop` op terracotta.
  - `h1.caps` "Prematuurkleding".
  - Cariens woorden als quote (wit, vanaf 24 px): "Mijn passie is maatwerk in (prematuur)babykleding: net iets anders en persoonlijks." en daaronder "Carien Geurts —".
  - Daaronder, in inkt: **"Prijsrichtlijn: [prijs]"** met LET OP.
  - Een pijl-link "WhatsApp Carien".
- **001 Maatwerk** `#maatwerk`, op salie:
  - links de tijdelijke foto `p-broekje-kleur` (met de opmerking "tijdelijk, opname 13"; de alt beschrijft het broekje en zegt niet dat het prematuurkleding is);
  - rechts "Maatwerk in (prematuur)babykleding. Ook prematuurmaten." en de pijl-link "Bespreek je idee" → `contact.html#formulier`.
- **002 Zo werkt het:** `.stappen` met de drie bestaande stappen uit Werkwijze (Samen kiezen, Persoonlijk maken, Met zorg gemaakt) en de pijl-link "Meer over de werkwijze" → `werkwijze.html#hoe-ik-werk`.
- **003 Contact:** het gedeelde blok.
- Geen andere feiten: geen maten, levertijden of prijzen die niet in `CLAUDE.md` of op de site staan.

**F. Portfolio (nieuw)**
- **Kop:** `.pagina-kop` op terracotta.
  - `h1.caps` "Portfolio" en een korte kop (nieuwe tekst, LET OP).
  - Daaronder vier pijl-links naar de groepen. Op mobiel staan die onder elkaar, elk minimaal 44 px hoog.
- **Groepen:** elke groep is een eigen sectie, met de lichte kleur als achtergrond (`data-achtergrond`) en de diepe tint bij aanwijzen.

  | Groep | Lichte kleur | Diepe tint | Foto's |
  |---|---|---|---|
  | 001 Kleding `#kleding` | salie | `#839C75` | `p-sjaaltje-kleur`, `p-shirtje-kleur`, `p-shirtje-roze-kleur-vierkant`, `p-broekje-kleur`, `p-broekje-vos`, `ig-outfit-ladder`, `ig-jasje-teddy`, `ig-jasje-tricot` |
  | 002 Knuffels, swaddles en babynest `#textiel` | mauve | `#AE8C94` | `p-knuffel-naam`, `p-knuffel`, `p-swaddle-open-kleur`, `p-swaddle` (als het een ander item is), `ig-babynest` |
  | 003 Siliconen en hangers `#siliconen` | olijf | `#999575` | `p-bijtring-giraf-kleur`, `p-bijtring-kleur`, `p-bijtring-naam`, `ig-bijtringen`, `ig-speenkoord-paardje`, `ig-charme-blauw`, `ig-charme-roze` |
  | 004 Kraamcadeauboxen `#boxen` | perzik | `#C88654` | `hero-box-open`, `hero-box-dicht` en de negen `box-*`-thema's (bijschrift = themanaam) |

  - Niet in het portfolio: de atelierfoto's (`over-*`, `home-*`, `maatwerk-*`, `pers-handwerk`, `pers-klaar`, `pers-stoffen`), de collage `pers-samen-kiezen`, de stofstalen `stof-*` (240 px) en dubbele foto's (`pers-naam`, `pers-sjaaltje-naam`, `home-hero-sjaaltje`, `box-hero-wide`, de versies zonder `-kleur`).
  - Een prematuurgroep komt er pas als er een foto is (opname 13).
- **Raster:** kolommen in metselwerk (CSS `columns`), 4 kolommen vanaf 1025 px, 3 op tablet, 2 op 390 px. Tussenruimte 32, 24 en 12 px.
  - Elke foto houdt zijn eigen verhouding en wordt nooit breder getoond dan het bestand. Dat is nodig voor `ig-jasje-*` (316 px) en `ig-babynest` (324 px), want een vaste verhouding zou ze vergroten.
  - Elke foto is een `figure` met een `figcaption`: een korte naam in Libre Caslon Display, 24 px op desktop en 20 px op mobiel.
  - Tegels zijn geen links en niet met het toetsenbord te bereiken. Alle informatie is ook zonder aanwijzen te zien.
  - Onder elke groep staat een pijl-link: bij Kleding, Textiel en Siliconen "Bespreek je idee" → `contact.html#formulier`, bij Boxen "Bekijk thema's en prijzen" → `kraamcadeauboxen.html`.
  - Daarna het gedeelde contactblok.
- **Bij aanwijzen** (alleen bij `hover: hover` en `pointer: fine`):
  - de achtergrond van de groep kleurt in 1 s (`cubic-bezier(.45,0,.55,1)`) naar de diepe tint;
  - de groepskop en het bijschrift van de aangewezen foto worden wit (opacity 1), de andere bijschriften wit op 0,35;
  - de andere foto's krijgen een warme sluier van 20 %;
  - het label en de pijl-links blijven inkt (5,4:1 op elke diepe tint; wit haalt daar maar 3:1);
  - bij "minder beweging" verandert de kleur direct.
- **Op touch:** geen hoverstand. Lichte groepskleur en alle tekst in inkt.
- **Gewicht:**
  - elke foto krijgt `width`/`height`, `loading="lazy"` (behalve de eerste rij), `decoding="async"` en een srcset met een 600w-versie;
  - de bouwer maakt 600w-versies van foto's breder dan 600 px die nog geen versie hebben (nieuwe bestandsnaam `-600`);
  - `sizes`: `(max-width:760px) 46vw, (max-width:1024px) 30vw, 270px`.
- **Alt-teksten:** beschrijf item, kleur en print, en een naam als die in beeld staat. Het bijschrift is kort, de alt-tekst uitgebreider.

**G. Contact:** ongewijzigd, op de nieuwe header en het menu na.

### Voor Carien ter goedkeuring

1. **Prijsrichtlijn prematuurkleding:** een bedrag, een "vanaf"-prijs, of "Prijs op aanvraag". Advies: geen zichtbaar "[prijs]" op de live site. Is er bij GO nog geen prijs, dan "Prijs op aanvraag".
2. **Teksten Prematuurkleding:** mag haar zin als quote met haar naam staan? Welke maten maakt ze? Er wordt niets ingevuld zonder haar antwoord.
3. **Foto prematuurkleding (opname 13):** tot die er is, staat het broekje als tijdelijke foto. Akkoord?
4. **Portfoliofoto's:** mogen alle genoemde foto's erin? Zijn er foto's van prematuurmaten bij? Zijn `p-swaddle` en `p-swaddle-open` hetzelfde item? Horen de tashangers bij "Siliconen en hangers"?
5. **Babynamen in beeld** (Sem, Tobi, Eva): is het goed dat die op meer pagina's te zien zijn?
6. **Nieuwe teksten:** de koppen van Portfolio en Werkwijze, de groepsnamen en de bijschriften, en de korte teksten bij "Wat ik maak" en de technieken (al open).
7. **Belettering:** er is nog geen foto van belettering op kleding (opname 8). Daar staat tijdelijk de doos met naam.

**Voor Carst (geen Carien):** de grens van 1200 px voor het menu in de header, minder foto's in het portfolio dan "alle", alle negen thema's ook in het portfolio of alleen een paar (ze lijken veel op elkaar), en de visuele basis bijwerken na GO. *(Hoofdsessie heeft voorlopig besloten: 1200 px, één foto per item, alle negen thema's; Carst kan dit in de PR terugdraaien.)*

## Bestanden
- `public/index.html` (header/menu, labels 002/003, links)
- `public/werkwijze.html`, `public/prematuurkleding.html`, `public/portfolio.html` (nieuw)
- `public/kraamcadeauboxen.html` (nieuw, overgezet van `kraamcadeaubox.html`)
- `public/producten.html`, `public/over.html`, `public/kraamcadeaubox.html` (verwijderd)
- `public/contact.html`, `public/privacy.html`, `public/bedankt.html`, `public/404.html` (header en menu)
- `public/_redirects`, `public/sitemap.xml`
- `public/assets/css/style.css` (header vanaf 1200 px, menu met vijf items, Wat ik maak, portfolioraster en aanwijzen)
- `public/assets/js/main.js` (balk op de nieuwe pagina's, slider met unieke id's op Werkwijze, portfolio-aanwijzen indien nodig)
- `public/assets/img/` (alleen nieuwe `-600`-versies van bestaande foto's)
- `scripts/controleer.py`, `scripts/schermafdrukken.py`, `scripts/rooktest.sh`, `scripts/serveer.mjs` (alleen commentaar)
- `tests/e2e/hulp.js`, `tests/e2e/kernpaden.spec.js`, `tests/e2e/seo-veiligheid.spec.js`
- `lighthouserc.cjs`
- `CLAUDE.md` ("Mappen", "Hoofdnavigatie", "Kraamcadeauboxpagina", "Vaste balk")
- `docs/kwaliteit.md` (indien nodig)

## Buiten scope
- Het formulier, `src/`, `tests/*.test.js`, `wrangler.jsonc` en `.github/workflows/`.
- De visuele basis in `tests/e2e/basis/` bijwerken (doet Carst na GO).
- Grenzen, tests of axe-regels versoepelen.
- Een prematuurgroep in het portfolio (pas als er een foto is, opname 13).
- Nieuwe foto's maken of kleurcorrigeren; alleen 600w-versies van bestaande bestanden.
- Maten, levertijden of prijzen voor prematuurkleding invullen.
- Detailpagina's per thema of item.
- Nameservers of domein omzetten.

## Open vragen
- Alle punten onder "Voor Carien ter goedkeuring". Tot haar akkoord staan nieuwe teksten en "[prijs]" met LET OP.
- **"[prijs]" op de live site:** Carst wil een zichtbare plaatshouder tot Carien de prijs geeft; de ontwerper adviseert bij GO zonder prijs "Prijs op aanvraag". Carst beslist bij GO.
- **Voorlopige besluiten hoofdsessie** (1200 px, één foto per item, alle negen thema's, tijdelijke prematuurfoto): Carst bevestigt of draait terug in de PR.
- **PR #7:** release wordt overgeslagen. Wordt PR #7 gesloten of gaat deze branch erin op? Dat bepaalt waartegen de PR van deze wijziging wordt geopend.
- KvK-nummer (`[nummer]`) staat nog open; niet nodig voor deze wijziging.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief klaar, ontwerprichting van website-ontwerper volledig opgenomen |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | [mens] | |
| Live gezet (merge) | [mens] | |
