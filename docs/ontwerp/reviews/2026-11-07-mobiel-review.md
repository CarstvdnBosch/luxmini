# Ontwerpreview mobiel — 7 november 2026

- **Door:** website-ontwerper (senior UX/UI), op verzoek van Carst
- **Versie:** `main`, commit `1fcd4e4` (live versie), lokaal geserveerd met `node scripts/serveer.mjs 4173`
- **Scherm:** 390 × 844, Chromium, touch (`has_touch`, `is_mobile`), deviceScaleFactor 2. Afdrukken per schermhoogte met 100 px overlap, plus het eerste scherm zonder hulp ("eerste indruk"), het open menu, de pagina-overgang (menu → Babynest) en de intro (eerste bezoek).
- **Afdrukken:** `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/mobiel-review/` (`01-index-00.png` … `08-contact-formulier-02.png`, `20-menu-open-*.png`, `21-overgang-*ms.png`, `22-intro-*ms.png`, `metingen.json`). Dit is een tijdelijke map; draai `python3 scripts/schermafdrukken.py` opnieuw voor de standaardafdrukken (`scripts/schermafdrukken/m-*.png`, ook gemaakt).
- **Automatisch:** `tests/e2e/mobiel-ontwerp.spec.js` op Chromium 390: 12 van 12 groen. Op iPhone/WebKit niet uitgevoerd: WebKit is in deze omgeving niet geïnstalleerd (12 fouten door "Executable doesn't exist", niet door de site). `npm run test:visueel` en axe zijn in deze review niet gedraaid.
- **Stock:** stockdutchdesign.com was vanuit deze omgeving niet bereikbaar en er was geen browser. Alle metingen in `docs/ontwerp/bron/` zijn op **desktop (1440 × 900)** gedaan. Alles wat hieronder over Stock op mobiel staat, is daarom een **aanname, te verifiëren in de browser**.

## Oordeel

**ONTWERP NIET AKKOORD** (als ontwerpgate voor deze versie), op drie punten die de bezoeker echt raken of de afspraken breken:

1. de plaatshouder "Prijsrichtlijn: [prijs]" staat groot in beeld op Prematuurkleding en Babynest;
2. de kopfoto van Contact is vergroot (1,65× in CSS-pixels, 3,3× op een retina-scherm) en ziet er wazig uit; dat breekt Mobiel-regel 6;
3. de footer heeft geen WhatsApp, telefoon en mail, terwijl `CLAUDE.md` en principe 2 dat wel vragen.

De rest is sterk: rustig, warm, consequent, niets scrolt horizontaal en elke pagina heeft binnen één tik een weg naar het formulier.

**Mobiel (de tien regels):** ✘ (regel 6; de rest ✔ of ~, zie tabel)

| Regel | Uitslag | Toelichting |
|---|---|---|
| 1 Tikdoelen 44 px | ✔ | Alleen "privacyverklaring" (22 px) is kleiner; die staat midden in een zin en mag dat. |
| 2 Lopende tekst 16 px | ~ | Lopende tekst is 16 px. Wel klein: formulierlabels 11 px, footerlinks 11 px, contactlinks in het menu 14 px, pijl-links 15 px, `.caps` 12–13 px. |
| 3 Velden 16 px | ✔ | `.formulier input/select/textarea` 16 px. |
| 4 Inzoomen | ✔ | Chromium-test groen. |
| 5 Niets steekt buiten | ✔ | `scrollWidth − innerWidth` = 0 op alle pagina's. |
| 6 Foto's niet vergroot | ✘ | `home-hero-handwerk-800.jpg` (800 × 450) vult de contactkop van 390 × 743: 1,65× vergroot. De test mist dit, omdat hij `naturalWidth` uit `srcset` vergelijkt en `object-fit: cover` niet meeneemt. |
| 7 Contact binnen één tik | ✔ | Elke pagina heeft "Stuur Carien een bericht". In het menu staat WhatsApp op y = 469 px, dus zonder scrollen. |
| 8 Regels ≤ 75 tekens | ✔ | Ongeveer 45–55 tekens. |
| 9 Balk bedekt geen kop | ✔ | Chromium-test groen. In de afdrukken loopt het balklabel soms een sectie achter (zie Homepage). |
| 10 Foto boven, nooit leeg | ~ | De productblokken zijn in orde. De plaatshouder [prijs] en een leeg scherm tijdens de overgang van ongeveer 0,5 s tellen mee. |

## Per pagina

### Homepage (`01-index-*`)
- **Goed:**
  - De collage is ook op 390 px mooi: zes echte foto's, een rustige kop en de tabjes "Het atelier · Het cadeau" (44 px).
  - Het drieluik staat netjes onder elkaar: foto boven, nummer, kop, één zin en één pijl-link per product (`01-index-01` t/m `-03`).
  - Handwerk als veegbare kaarten, met de volgende kaart half in beeld als hint (`01-index-04`).
  - Het Inspiratie-beeld over het hele scherm, met witte kop op een sluier en twee pijl-links (`01-index-05`).
- **Beter:**
  - Het eerste scherm (`01-index-eerste-indruk`) zegt niet wat je hier kunt laten maken en heeft geen volgende stap. "Samen ontworpen, met de hand gemaakt" plus de namen is sfeer, geen aanbod. De onderste fotorij neemt ongeveer 35% van het scherm in. Dit was punt 3 van de review van 2 november en staat nog open.
  - 001 Producten is 2013 px hoog (2,4 schermen). Dat is te verdedigen omdat er drie producten zijn, maar de kolommen worden niet kleiner.
  - De "Sem"-doos staat drie keer op de homepage: in het drieluik, in Handwerk en in Inspiratie.
  - Het balklabel loopt achter: op `01-index-04` staat "001 — Producten" terwijl 002 Handwerk in beeld is. Op `01-index-05` zit een witte streep van ongeveer 8 px tussen de balk en de Inspiratie-foto.

### Werkwijze (`02-werkwijze-*`)
- **Goed:**
  - De kop met de foto van Carien, een duidelijke titel en het verhaal in leesbare 16 px (`02-werkwijze-01`).
  - De stappen 01–03 staan op mobiel onder elkaar, zonder tabbladen die je moet ontdekken.
  - Personaliseren met de tabs Borduren · Belettering · Siliconen (`02-werkwijze-04`).
- **Beter:**
  - In de fotorij staat de tweede foto half buiten beeld (`02-werkwijze-01`, `-02`). Als hij veegbaar is, is dat goed. Zo niet, dan oogt het als afgesneden.
  - De lopende tekst "Ieder nieuw leven is bijzonder" staat afgesneden boven 004 (`02-werkwijze-04`). Dat is bedoeld, maar het doet weinig op mobiel.

### Kraamcadeauboxen (`03-kraamcadeauboxen-*`)
- **Goed:**
  - De volgorde klopt met de afspraak: kop, statementfoto, formaten, producten, stoffen, thema's, stappen, contact.
  - De productrij en de stoffenrij zijn veegbaar, met lijntekening waar geen foto is.
  - De thema's staan één per keer met een stukje van de volgende (foto op ware grootte, 312 × 234).
  - "Stel deze box samen" vult het formulier vooraf in (getest: €50 staat aangevinkt).
- **Beter:**
  - De paginakop is zeven regels serif van ongeveer 26 px (quote, uitleg en zin samen). Dat is zwaar om te lezen, en de eerste foto begint pas onderaan (`03-kraamcadeauboxen-eerste-indruk`).
  - 001 Kies je formaat is 2007 px (2,4 schermen) aan witte kaarten op salie (`03-…-01` t/m `-04`). De bezoeker moet drie keer scrollen om € 35 en € 80 te vergelijken. Hier is de meeste winst te halen.
  - Tussen de stoffen en 003 Thema's staat een leeg vlak van ongeveer 130 px perzik (`03-…-05`).

### Prematuurkleding (`04-prematuurkleding-*`)
- **Goed:**
  - Compact (3035 px).
  - De foto staat na één keer scrollen in beeld.
  - Cariens eigen woorden staan bovenaan.
- **Moet:**
  - "Prijsrichtlijn: [prijs]" staat in grote serif (ongeveer 44 px) en is daarmee het grootste element op `04-prematuurkleding-01`. Dit is een plaatshouder die de bezoeker ziet (Carst beslist bij GO, maar op live voelt het onaf).
- **Beter:**
  - De foto is tijdelijk een broekje en nog geen prematuurkleding (fotolijst, opname 13).

### Babynest (`05-babynest-*`)
- **Goed:**
  - Kort, met een duidelijke intro en direct de foto.
- **Moet:**
  - Hetzelfde [prijs]-blok als op Prematuurkleding (`05-babynest-01`).
- **Beter:**
  - De foto is 324 px breed (het bestand) in een kolom van 346 px. Hij staat daardoor 11 px ingesprongen en lijnt niet met de tekst. Op retina is hij zacht (2×).
  - Onder de kop "Babynest" staat alleen een pijl-link, zonder één zin uitleg.

### Inspiratie (`06-inspiratie-*`)
- **Goed:**
  - Twee kolommen in metselwerk met echte foto's en korte namen.
  - Elke groep heeft een eigen tint die meekleurt.
  - De snelkoppelingen naar de vier groepen staan bovenaan.
  - Na elke groep volgt "Bespreek je idee".
- **Beter:**
  - De pagina is 6612 px (7,8 schermen). Voor een portfolio mag dat, maar Kleding alleen is al 1308 px.
  - Het groepslabel en de groepskop zeggen hetzelfde ("001 — Kleding" en "Kleding").
  - De quote bij de atelierfoto wacht nog op goedkeuring van Carien.

### Contact (`07-contact-*`, `08-contact-formulier-*`)
- **Goed:**
  - Het eerste scherm geeft meteen "WhatsApp Carien" en "Stuur een bericht".
  - De gegevens staan helder in blokken.
  - Het formulier toont alleen de velden van het onderwerp.
  - Met `?onderwerp=kraamcadeaubox&formaat=50#formulier` land je precies op het formulier, met het onderwerp en € 50 al gekozen (`08-contact-formulier-00`).
  - De velden zijn 48 px hoog met 16 px tekst.
- **Moet:**
  - De kopfoto is wazig door de vergroting (`07-contact-eerste-indruk`).
- **Beter:**
  - De labels zijn 11 px, vet en in kapitalen. Voor grootouders aan de kleine kant.
  - De verzendknop staat pas na ongeveer twee schermen formulier.
  - Op mobiel staat de header als terracotta band boven de foto, terwijl de afspraak "header over de donkere foto, wit" is. Bewust? Graag bevestigen.

### Menu, overgang en intro (`20-*`, `21-*`, `22-*`)
- **Menu:**
  - Zes hoofditems van 36 px met tikdoelen van 44 px. Contact staat zonder scrollen in beeld.
  - De huidige pagina is niet te zien.
  - De hoofditems staan bovenin, buiten het duimbereik.
  - De contactlinks zijn 14 px.
  - De sluierfoto is op retina zacht (1,9×). Door de donkere sluier valt dat weinig op.
- **Overgang** (menu → Babynest):
  - Het vlak dekt de pagina en het scherm is ongeveer 0,5 s effen salie (`21-overgang-0600ms`, `-0900ms`).
  - Pas na ongeveer 1,3 s staat de nieuwe pagina er.
  - Op een telefoon voelt dat trager dan op desktop, omdat je daar vaker en sneller tikt.
- **Intro:**
  - Mooi en rustig (`22-intro-0700ms` t/m `-1500ms`).
  - In de uitgang (`22-intro-1900ms`) liggen de intro-tekst, de half opgekomen hero-kop en "Carien Geurts" kort over elkaar. Het gaat om een tussenbeeld van ongeveer 0,3 s: te verifiëren op een echt toestel.
- **Laadgevoel:**
  - Gemeten lokaal met 150 ms latentie, 1,6 Mbit/s en CPU ×4.
  - LCP 1,1–1,3 s.
  - Homepage 1,05 MB in 20 verzoeken (beeld 0,78 MB). Kraamcadeauboxen 0,53 MB, Contact 0,33 MB.
  - Dat is goed. Het echte netwerk van Cloudflare kan afwijken.

## Top-10 verbeterpunten mobiel

| # | Prio | Waar | Probleem | Voorstel | Verwachte impact |
|---|---|---|---|---|---|
| 1 | P1 | Prematuurkleding, Babynest (`04-…-01`, `05-…-01`) | "Prijsrichtlijn: [prijs]" is het grootste element op het scherm. | Tot Carien een prijs geeft: het blok weglaten, of een zin die Carien goedkeurt, met de pijl-link "Vraag naar de prijs" → formulier met onderwerp. Later de prijs in `kop-m` (ongeveer 32 px) in plaats van 44 px. | Vertrouwen. De pagina voelt af, en de bezoeker krijgt een volgende stap in plaats van een gat. |
| 2 | P1 | Contact (`07-contact-eerste-indruk`) | Kopfoto 1,65× vergroot (3,3× op retina) en wazig. | Een staande uitsnede voor mobiel (bijv. 900 × 1300) via `<picture><source media="(max-width:760px)">`, of `sizes` afstemmen op `cover` (op mobiel ongeveer `330vw`, zodat de 1800w-versie geladen wordt). Daarnaast de test op regel 6 laten rekenen met `object-fit: cover` en het echte bestand (testwijziging alleen met akkoord van Carst). | Een scherpe eerste indruk op de belangrijkste pagina, en regel 6 is weer waar. |
| 3 | P1 | Alle pagina's, footer | Geen WhatsApp, telefoon of mail in de footer (in strijd met `CLAUDE.md` en principe 2). Ze zijn weggevallen in `c596889`. | Drie regels in de footer: "WhatsApp Carien", "06 – 43 79 16 18", "info.LUXmini@gmail.com", in 16 px met tikdoelen van 44 px. Footerlinks van 11 naar 13–14 px. | Contact onderaan elke pagina, precies waar de bezoeker na het lezen uitkomt. |
| 4 | P1 | Homepage, eerste scherm | Niet zichtbaar wat je kunt laten maken; geen volgende stap. | Onder de kop één regel over het aanbod (tekst door Carien te bevestigen, bijv. "Kraamcadeauboxen, prematuurkleding en babynesten met naam") en één pijl-link "Bekijk de kraamcadeauboxen". Op mobiel de onderste fotorij kleiner, zodat de regel en de link boven de vouw staan. | Minder afhakers: de bezoeker weet binnen 3 s of hij goed zit. |
| 5 | P2 | Kraamcadeauboxen 001 (`03-…-01` t/m `-04`) | Vier prijskaarten zijn samen 2,4 schermen. | Op mobiel compacte kaarten: prijs, aantal producten en "plus: …" op één regel, zonder herhaalde vinklijsten; of een veegbare rij van vier, zoals de stoffen. Doel: ≤ 1,2 scherm, met € 35 en € 80 binnen één keer scrollen. Ook de paginakop inkorten: quote apart en de uitleg in Source Sans 18 px. | Snellere prijsvergelijking. "Wat kost het" is vraag 2 van de bezoeker. |
| 6 | P2 | Formulier, menu, footer, pijl-links | Kleine letters: labels 11 px, menu-contact 14 px, pijl-links 15 px, `.caps` 12–13 px. | Op mobiel: labels 13 px caps of 16 px normaal; pijl-links 16–17 px; menu-contact 17 px. | Prettiger lezen voor (groot)ouders, zonder verlies van sfeer. |
| 7 | P2 | Pagina-overgang en intro (`21-*`, `22-intro-1900ms`) | Ongeveer 0,5 s effen leeg scherm per tik; de intro-uitgang laat tekst overlappen. | Op touch de overgang naar ongeveer 0,6–0,7 s (besluit Carst, want 1 s is vastgelegd). Bij de intro de hero-kop pas laten opkomen als het doek weg is. | Navigeren voelt sneller; geen rommelig tussenbeeld. |
| 8 | P2 | Babynest 001 (`05-babynest-00`, `-01`) | De foto is smaller dan de kolom (324 px, ingesprongen) en zacht op retina; geen uitleg onder de kop. | Tot er een groter bestand is (fotolijst, opname 11): de foto links uitlijnen met de tekst. Eén zin van Carien onder de kop. | Rustiger beeld en meer inhoud op een dunne pagina. |
| 9 | P3 | Menu (`20-menu-open-00`) | Huidige pagina niet zichtbaar; hoofditems bovenin, buiten het duimbereik. | De onderstreping van `aria-current` ook in het menu. Op hoge schermen de hoofditems iets lager zetten (ruimte boven ongeveer 20vh). | Oriëntatie en duimbereik. |
| 10 | P3 | Homepage en contactblokken | Herhaling van beeld: de "Sem"-doos 3× op de homepage, de naaimachinefoto in elk contactblok; het balklabel loopt soms achter; witte streep boven de Inspiratie-foto (`01-index-04`, `-05`). | Bij 003 Inspiratie een ander beeld. De drempel van het balklabel gelijk trekken met de sectiebovenkant. De streep weghalen. | Meer verrassing bij het scrollen, en een strakker geheel. |

## LUX mini vs Stock op mobiel

Kolom LUX mini: **gezien en gemeten** in deze review. Kolom Stock: alleen desktopmetingen uit `docs/ontwerp/bron/`; het mobiele gedrag is een **aanname, te verifiëren in de browser**.

| Onderwerp | LUX mini (390 px, gemeten) | Stock op mobiel (aanname, te verifiëren) | Beoordeling |
|---|---|---|---|
| Eerste scherm / hero | Collage van zes foto's in een eigen mobiele indeling, kop links, tabjes voor de sets, badge. Geen aanbodregel, geen pijl-link. | Waarschijnlijk een vereenvoudigde collage of één beeld met de kop. Geen muisbeweging, geen kleurwissel per helft. | LUX staat dicht bij Stock. Stock hoeft op het eerste scherm geen aanbod uit te leggen (bureau); LUX wel (consument). Hier wijken we bewust af. |
| Navigatie | Alleen de burger. Menu over het hele scherm met zes items van 36 px, contact en socials, zonder subitems. | Waarschijnlijk alleen de burger en een volledig menu met grote serif-items. Of de subitems (Media → …) op mobiel blijven, is onbekend. | Gelijkwaardig. LUX toont de directe kanalen in het menu: beter voor onze bezoeker. |
| Sectieritme | Secties onder elkaar, gekleurde vlakken per sectie, labels "00x —". Lange blokken: Producten 2,4, Formaten 2,4, Inspiratie 7,8 schermen. | Waarschijnlijk dezelfde opbouw (onder elkaar, laag kleurt per sectie). Hun desktopsecties zijn 100vh; op mobiel waarschijnlijk korter. | LUX is op twee plekken langer dan nodig (formaten, producten). |
| Typografie-schaal | Kop xl 44 px, koppen 32–36 px, tekst 16 px, pijl-links 15 px, caps 11–13 px. | Desktop: kop 50–110 px, tekst 15 px, nav 0,9vw. Mobiel: onbekend; waarschijnlijk kop rond 40 px en tekst 15–16 px. | Gelijke sfeer. LUX houdt 16 px lopende tekst aan (eigen regel). De kleine caps zijn bij LUX ook klein. |
| Beeldgebruik | Foto boven de tekst, één foto per blok, veegbare rijen met een stukje van de volgende. Echte producten; een paar te kleine bestanden (contactkop, babynest, Instagram). | Desktop: grote beelden, parallax, foto's over het hele scherm. Mobiel: waarschijnlijk beelden op volle breedte, parallax uit of beperkt. | LUX is eerlijk en warm. De scherpte op retina is het zwakke punt (bestanden van 324–800 px). |
| Interactie / beweging | Geen aanwijseffecten op touch: kaarten en tabjes in plaats daarvan. Intro 2,2 s, overgang ongeveer 1,3 s met 0,5 s een leeg scherm. Kleurlaag per sectie. | Intro ongeveer 5,5 s en overgang 2 × 1 s (gemeten op desktop). Op mobiel waarschijnlijk hetzelfde. Lopende teksten blijven lopen. | LUX is al korter dan Stock. Voor een consument op een telefoon mag de overgang op touch nog korter. |
| Contact / volgende stap | Elke pagina: "Stuur Carien een bericht" → het vooraf ingevulde formulier. Contactpagina met WhatsApp bovenaan. Footer zonder kanalen. | Een contactblok onderaan elke pagina ("Neem contact op" → /contact). Hun contactpagina heeft geen formulier, alleen gegevens (gemeten op desktop). | LUX is sterker (formulier vooraf ingevuld, WhatsApp). Het gat zit in de footer. |

## Nog te verifiëren in de browser (Stock-kant)

1. Hoe de hero-collage er op 390 px uitziet: hoeveel foto's, welke posities, of er een vervanging is voor het wisselen per schermhelft, en of de cirkel en de badge blijven.
2. Of de intro op mobiel even lang duurt (ongeveer 5,5 s) en of hij per sessie maar één keer komt.
3. De pagina-overgang op touch: duur, kleurvlak en hoe ver de pagina zakt (150 px of minder).
4. Het menu op mobiel: lettergrootte, of de subitems blijven, plek van de socials, en of de huidige pagina gemarkeerd is.
5. Het kernwaarden-drieluik op mobiel: onder elkaar of veegbaar, en of de foto zonder aanwijzen zichtbaar is.
6. De projectenlijst en de portfoliolijst op mobiel: lijst met foto's, kaarten of alleen namen.
7. De getuigenis-slider (volle foto) op mobiel: hoogte, sluier en grootte van de quote.
8. De typografie-schaal op 390 px: grootte van koppen, lopende tekst, labels en pijl-links.
9. Of er een vaste balk met sectielabel is op mobiel, en hoe die zich gedraagt.
10. De witruimte tussen secties op mobiel (vergelijken met ons ritme van 56–96 px).
11. Lopende teksten en parallax op mobiel: blijven ze aan, en hoe staat het met "minder beweging".
12. Laadgedrag: LCP en totaal gewicht van de homepage op mobiel.

## Score per checklistpunt

| # | Punt | Score | Kort |
|---|---|---|---|
| 1 | Doel en volgende stap | ~ | Subpagina's goed. Het eerste scherm van de homepage mist het aanbod en de stap. |
| 2 | Hiërarchie | ~ | Rustig en logisch. [prijs] en de kop van Kraamcadeauboxen trekken te veel aandacht. |
| 3 | Leesbaarheid | ~ | 16 px, korte regels, inkt op terracotta. Labels, footer en menu-contact zijn klein. |
| 4 | Ritme en witruimte | ~ | Geen lege schermen in de inhoud. Formaten en producten zijn lang; het lege moment in de overgang telt mee. |
| 5 | Consistentie | ~ | Kleuren, letters, nummers en pijl-links kloppen. Footer zonder kanalen; header op Contact anders dan afgesproken. |
| 6 | Beeld | ✘ | Contactkop vergroot en wazig. Babynest en Instagram zacht op retina. Tijdelijke foto bij Prematuurkleding (gemeld). |
| 7 | Mobiel en touch | ✔ | 44 px, geen horizontaal scrollen, kaarten in plaats van aanwijzen, veegbare rijen met een hint. |
| 8 | Interactie | ~ | Rustig en zonder aanwijzen bruikbaar. Overgang en intro-uitgang kunnen strakker. |
| 9 | Vertrouwen en toon | ~ | Warm, "je", echte foto's. De zichtbare plaatshouder [prijs] kost vertrouwen. |
