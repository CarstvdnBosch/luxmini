# LUX mini — website (luxmini.nl)

Statische portfolio-website voor **Carien Geurts / LUX mini**: gepersonaliseerde, handgemaakte babykleding, siliconen items en kraamcadeauboxen. Atelier in Ospel. Er is **geen webshop**; bezoekers nemen contact op (WhatsApp, bellen, mail, formulier).

Hosting: **Cloudflare Workers** (statische bestanden uit `public/` + een kleine Worker voor het formulier). Code staat op **GitHub** (openbaar; nooit geheimen committen). **Cloudflare Workers Builds** maakt per branch een preview en zet live na een merge naar `main`. GitHub Actions draait de controles (gate 1 en 2) bij elke pull request en de rooktest (gate 3) na live zetten. Domein luxmini.nl staat geregistreerd bij GoDaddy; de nameservers gaan pas naar Cloudflare na akkoord van Carien.

## Werkwijze: AI-PDLC

Elke wijziging volgt `docs/ai-pdlc.md`: **plannen → bouwen → controleren → ontwerpgate → release**. Start met `/website-update <wens>`.

1. **website-planner** maakt een brief met acceptatiecriteria in `docs/wijzigingen/`. Bij zichtbare wijzigingen levert **website-ontwerper** (senior UX/UI) de tekst voor de ontwerprichting en ontwerpcriteria; de planner zet die in de brief.
2. **website-bouwer** voert die uit op een branch `wijziging/<naam>` en draait `npm run check` (harness: tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel en het validatierapport).
3. **website-controleur** toetst onafhankelijk of het werkt en klopt en draait zelf `npm run check`; bij NIET AKKOORD terug naar de bouwer (max. 3 rondes).
4. **Ontwerpgate:** **website-ontwerper** beoordeelt de schermen (desktop, tablet, mobiel; `python3 scripts/schermafdrukken.py`) tegen `docs/ontwerp/principes.md` en de ontwerpregels hieronder; bij ONTWERP NIET AKKOORD terug naar de bouwer (max. 3 rondes).
5. Bij AKKOORD van beiden (of n.v.t. van de ontwerper bij alleen techniek): branch pushen en pull request openen → GitHub draait de controles (gate 1, 2, 4 en 5), Cloudflare maakt een preview en GitHub zet het **validatierapport** in de pull request → **Carst** beoordeelt rapport en preview en geeft **GO** (label `GO`) of NO-GO → na GO merget Carst (of Claude op zijn uitdrukkelijke verzoek) naar `main` → Cloudflare zet live, de rooktest controleert.

**Harness:** een wijziging is pas klaar als `npm run check` groen is (zie `docs/kwaliteit.md`). Los rode tests op door de site te verbeteren; tests, grenzen en axe-regels worden niet versoepeld zonder akkoord van Carst.

Agents mergen nooit zonder GO van Carst, zetten nooit zelf het label `GO` en zetten nooit zelf iets live.

## Mappen

- `public/` — **alles wat online komt**
  - `index.html` — homepage: één scrollpagina (hero, 001 Babykleding, 002 Siliconen items, 003 Babynest, 004 Prematuurkleding, 005 Kraamcadeauboxen, 006 Inspiratie, 007 Instagram, 008 Contact); de productblokken gebruiken de teksten van "Wat ik maak"; geen formulier
  - `werkwijze.html` — Werkwijze (Over en Producten samen): kopfoto, 001 Het atelier (verhaal met fotorij), 002 Hoe ik werk (tabbladen), 003 Personaliseren (slider), 004 Wat ik maak (vijf rijen met de oude productankers; bron van de teksten op de homepage), contact
  - `kraamcadeauboxen.html` — Kraamcadeauboxen: paginakop met intro, statementfoto "Met naam en geboortedatum", 001 Kies je formaat (prijskaarten), 002 Thema's (compact raster), 003 Zo werkt het, 004 Contact
  - `prematuurkleding.html` — Prematuurkleding: paginakop met Cariens quote, 001 Maatwerk (voorbeeldfoto), 002 Prijsrichtlijn, 003 Zo werkt het, 004 Contact
  - `babynest.html` — Babynest: paginakop, 001 Babynest (foto), 002 Prijsrichtlijn, 003 Zo werkt het, 004 Contact
  - `inspiratie.html` — Inspiratie (was Portfolio; `/portfolio` geeft 301): vier groepen in metselwerk (kleding, knuffels/swaddles/babynest, siliconen en hangers, kraamcadeauboxen), het atelierstatement en contact; bij aanwijzen de diepe tint van de groep
  - `contact.html` — Contact: fotokop, contactgegevens en het contactformulier (`#formulier`, `POST /api/contact`)
  - `privacy.html`, `bedankt.html`, `404.html`, `robots.txt`, `sitemap.xml`
  - `_redirects` — doorverwijzingen van oude Wix-adressen; `_headers` — beveiliging en caching
  - `assets/css/style.css` — alle opmaak; kleuren als variabelen bovenaan
  - `assets/js/main.js` — intro, collage (sets wisselen), hover-lijst, tabbladen, vaste balk, opkomen bij scrollen
  - `assets/img/` — webversies van foto's (max. ~1400 px, JPEG kwaliteit ~80)
- `src/worker.js` + `src/contact.js` + `src/formulier.js` — contactformulier (`POST /api/contact`) → mail via Cloudflare Email Routing naar info.luxmini@gmail.com; bij een fout terug naar `/contact?verzonden=fout#formulier`
- `wrangler.jsonc` — Cloudflare-configuratie
- `.github/workflows/` — `controle.yml` (gate 1, 2, 4, 5 en het validatierapport bij elke pull request), `go-nogo.yml` (GO · Akkoord Carst), `visueel-basis.yml` (basisschermen bijwerken), `rooktest.yml` (gate 3 na live zetten en dagelijks)
- `tests/` — tests voor het formulier (`npm test`); `tests/e2e/` — harness met Playwright Test: toegankelijkheid, SEO/veiligheid, kernpaden, visueel (`npm run test:e2e`, `npm run test:visueel`); basisschermen in `tests/e2e/basis/`
- `playwright.config.js`, `lighthouserc.cjs` — instellingen van de harness; `scripts/serveer.mjs` — lokale testserver zoals Cloudflare; `scripts/validatierapport.mjs` — validatierapport voor GO / NO-GO
- `scripts/controleer.py` — sitecontrole met screenshots; `scripts/rooktest.sh` — controle van de live site
- `docs/` — AI-PDLC, `kwaliteit.md` (harness en GO / NO-GO), wijzigingsbriefs, fotolijst, `ontwerp/` (UX-principes en ontwerpreviews) (niet online)
- `scripts/schermafdrukken.py` — schermafdrukken per schermhoogte voor de ontwerpgate

## Ontwerpregels (niet zonder overleg veranderen)

- Ontwerppatroon: editorial, gebaseerd op de opbouw van stockdutchdesign.com, maar met eigen logo, teksten en foto's van LUX mini. Nooit hun logo, teksten, slogans of foto's overnemen.
- Kleuren (variabelen in `style.css`): terracotta `#BC8565` (hoofdkleur; witte tekst alleen voor koppen en quotes vanaf 24 px; kleine tekst op terracotta in inkt), wit, grijsblauw `#E0E6E7`, inkt `#202020`. Hoverkleuren portfolio: perzik `#DEB799`, oker `#C89F67`, salie `#C3CFBC`, mauve `#B5969E`, olijf `#B4B19A`.
- Lettertypes: grote koppen en quotes in Libre Caslon Display, labels en pijl-links in Libre Caslon Text, lopende tekst in Source Sans 3 (vrije versie van de letter die Stock gebruikt). Kleine kapitalen met ruime spatiëring (`.caps`).
- Logo: witte versie (`logo-luxmini-wit.png`) los op terracotta; donkere versie (`logo-luxmini-donker.png`) op wit/grijs.
- Hoofdnavigatie (wens Carst 5 nov.): Werkwijze · Kraamcadeauboxen · Prematuurkleding · Babynest · Inspiratie · Contact, elk een eigen pagina (geen ankers). Het menu staat op één regel in de header vanaf 1280 px (gemeten: daar passen de zes links naast het logo); daaronder alleen de burger. De huidige pagina heeft `aria-current="page"` en is onderstreept (1 px, 6 px onder de letters). Het menu over het hele scherm toont dezelfde zes items met subitems (ankers op die pagina's; Babynest zonder subitems); op mobiel alleen de hoofditems. Op touch zijn alle tikdoelen minimaal 44 px. Header en menu zijn op alle pagina's gelijk.
- Vaste balk (`.balk`) verschijnt na de hero (homepage) of na de eerste sectie van een subpagina (`.pagina-kop` op Kraamcadeauboxen, Prematuurkleding, Babynest en Inspiratie, `.over-kop` op Werkwijze, `.contact-kop` op Contact) en toont het label van de huidige sectie (`data-label`), op mobiel op één regel. Nieuwe secties krijgen een `data-label`.
- Kraamcadeauboxenpagina (`kraamcadeauboxen.html`, wens Carst 5 nov.: minder scrollen): geen collage, maar een paginakop op terracotta met korte intro en prijsregel, direct daarna de statementfoto (naam en geboortedatum op de producten en de doos), dan de prijskaarten, de negen thema's als compact raster (`.themaraster`: 3 kolommen, 2 op tablet en mobiel, foto 4:3 met de naam eronder, geen lopende regels; op 1440 x 900 binnen twee schermen) met één pijl-link "Vraag je thema aan", Zo werkt het en contact. Thema's staan nooit op terracotta.
- Productpagina's Prematuurkleding en Babynest: kop met korte intro, direct een voorbeeldfoto (op 390 px na hooguit één keer scrollen in beeld), de prijsrichtlijn als eigen blok, Zo werkt het en contact. Compact, zonder leeg scherm.
- Homepage (wens Carst 5 nov.): hero (collage, sets, intro), dan vijf productblokken om en om (foto en tekst, op mobiel foto boven), elk een eigen sectie met een lichte paletkleur (buren nooit dezelfde, nooit terracotta, alleen inkt), de tekst van "Wat ik maak" en één pijl-link naar de productpagina; daarna Inspiratie (vier foto's), Instagram en het contactblok.
- Het contactformulier staat alleen op `contact.html` (`#formulier`). Alle contactmomenten op andere pagina's leiden naar dat formulier (wens Carst 5 nov.): het gedeelde contactblok heeft alleen de pijl-link "Stuur Carien een bericht" → `contact.html#formulier`, en in de inhoud staan geen links naar WhatsApp, telefoon of mail. De contactpagina, het menu en de footer houden de directe kanalen. Op de contactpagina ligt de header over een donkere foto: navigatie en logo wit (`html.kop-donker`).
- Foto's: warme, gebroken witte tinten. Nieuwe foto's krijgen dezelfde lichte warme kleurcorrectie. Zie `docs/fotolijst.md` voor gewenste nieuwe foto's.
- Secties genummerd: `001 —`, `002 —` enzovoort, klein in serif.
- Links als pijl-links (`.pijl`), geen opvallende knoppen.
- Scrollen en kleur (gemeten bij Stock): wiel glijdt met ease 0,05, toetsenbord en ankers met 0,14; touch native. Secties na de bovenkant zijn doorzichtig boven één vaste laag (`.achtergrond`) die per sectie in 0,75 s van kleur verloopt. Header en collage (`.hero-kleur`) kleuren samen mee bij aanwijzen en gaan terug naar terracotta bij verlaten.
- Witte tekst: alleen voor grote tekst (vanaf 24 px, of vanaf 19 px vet, gewicht 700) en alleen op terracotta `#BC8565` of op de diepe portfoliotinten bij aanwijzen: oker `#BC8B47`, salie `#839C75`, olijf `#999575`, perzik `#C88654`, mauve `#AE8C94` (wit haalt daarop 3:1). Nooit wit op de lichte paletkleuren (perzik, oker, salie, mauve, olijf, grijsblauw). Krijgt de bovenkant een lichte paletkleur, dan wordt alle tekst daar inkt en wisselt het logo naar de donkere versie (`html.hero-licht`). Uitzondering: tekst op een donkere foto (statement, open werkwijze-kolom).
- Inspiratie (was Portfolio; wens Carst, zoals Stock): bij aanwijzen kleurt de laag naar de diepe tint van het item en wordt alle portfoliotekst wit (actieve naam 1, andere namen 0,35; productregel 19 px vet (700) in kapitalen); de foto's krijgen een warme sluier (groot 28%, klein 20%). Kaarten op touch: diepe tint met witte naam (24 px) en productregel (19 px vet, 700). Staat de balk boven deze tint, dan wordt het logo wit en blijft het label inkt.
- Kleurwissels bij aanwijzen zijn rustig (in-uit `cubic-bezier(.45,0,.55,1)`): bovenkant (achtergrond, tekst, logo) 1,2 s, fotowissel in de hero 0,6 s, portfolio 1 s. Bij "minder beweging" direct.
- Hero (homepage): collage van zes foto's (`.tegel.t1` t/m `.t6`) in twee sets. De foto's wisselen samen per schermhelft: links set A "Het atelier" op terracotta, rechts set B "Het cadeau" op salie (t2, t3, t4 en t6 wisselen, t1 en t5 blijven). Op touch en met het toetsenbord wisselt de set via de tabjes "Het atelier · Het cadeau" (`aria-pressed`); een tik op een tegel wisselt ook. Er wisselt niets vanzelf. Op desktop bewegen en kantelen de foto's licht mee met de muis (max. 8°). Tegels zijn geen knoppen en draaien niet los. Onder de collage Cariens quote met de pijl-link "Over Carien" (→ `werkwijze.html#atelier`); daarna volgen de productblokken.
- Intro: één keer per sessie bij het eerste bezoek, op elke pagina, ongeveer 1,5 s (besluit Carst 5 nov. 2026, voor een snellere homepage; was 3 s) (logo, perzik vlak met foto, "Ieder nieuw leven / is bijzonder", doek trekt op). Overslaan met tik, klik, toets, scroll of vegen; noodrem in CSS na 2,5 s. Geen intro bij "minder beweging", zonder JavaScript of na een pagina-overgang.
- Mobiel moet altijd goed werken (390 px breed): niets mag horizontaal scrollen, tekst moet leesbaar blijven.
- Toon: warm, persoonlijk, Nederlands, "je/jij". Korte zinnen.

## Inhoudsregels

- Geen verzonnen feiten, reviews, cijfers of quotes. Een quote van Carien alleen als zij die heeft goedgekeurd.
- Prijzen kraamcadeaubox (leidend, van de originele site): € 35 (knuffel, swaddle, broekje), € 50 (+ sjaaltje), € 65 (+ shirtje, douchehandschoen), € 80 (+ bijtring).
- Contact: 06 – 43 79 16 18, info.LUXmini@gmail.com, WhatsApp via `https://wa.me/31643791618`, Sperwerstraat 10, 6035 GH Ospel.
- Overgenomen van de oude site (luxmini.nl), dus geen verzonnen tekst: "Ieder nieuw leven is bijzonder", Cariens verhaal (twee dochters, vier kleinkinderen, "Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken") en "binnen 7 werkdagen verzonden".
- Nog open: KvK-nummer (`[nummer]`), goedkeuring quote bij de atelierfoto, foto van belettering op kleding, teksten bij de technieken, originele (grotere) bestanden van de Instagram-foto's.
- Foto's van Instagram @luxmini2020 mogen gebruikt worden (toestemming van Carst). Ze staan als `ig-*.jpg` in `public/assets/img/`. Snijd tekstbalken en overlays altijd weg.

## Nieuwe foto's toevoegen

1. Origineel in de mediamap bewaren (buiten deze site).
2. Webversie maken: max. 1400 px lange zijde, JPEG kwaliteit 80, bestandsnaam in kleine letters met streepjes (`box-thema.jpg`).
3. In `public/assets/img/` zetten en met een beschrijvende `alt`-tekst gebruiken.
4. Een bestaande foto vervangen? Geef de nieuwe versie altijd een **nieuwe bestandsnaam** (bijv. `box-thema-2.jpg`). Foto's worden 30 dagen in de browser bewaard; met dezelfde naam ziet een terugkerende bezoeker nog de oude. CSS en JS worden bij elk bezoek opnieuw gecontroleerd (`public/_headers`).
