# Mobiel verbeteren: geen [prijs], scherpe contactkop, kanalen in de footer, grotere letters, compacte formaten

- **Datum:** 7 november 2026
- **Aangevraagd door:** Carst (GO voor deze scope op 7 nov., één pull request). Basis: de ontwerpreview `docs/ontwerp/reviews/2026-11-07-mobiel-review.md` (top-10, punten 1, 2, 3, 5 en 6).
- **Branch:** `wijziging/mobiel-verbeteringen`
- **Risico:** hoog volgens de regel, omdat de labels van het contactformulier veranderen. Alleen hun lettergrootte verandert. Velden, `name`-attributen, `action`, de Worker en de doorverwijzingen blijven gelijk. Zonder dat punt is het risico midden: de footer verandert op alle pagina's en de kopfoto van Contact krijgt een nieuwe bron.

## Doel
Op de telefoon voelen de pagina's af en betrouwbaar. Er staat geen plaatshouder meer in beeld, de eerste foto op Contact is scherp en onderaan elke pagina staan WhatsApp, telefoon en mail. Wat je moet lezen of aantikken is groot genoeg voor (groot)ouders, en je ziet de vier boxprijzen in ongeveer één scherm.

## Acceptatiecriteria
Alle metingen op het project `mobiel` (Chromium, 390 × 844, touch), tenzij er iets anders staat. De iPhone (WebKit) draait in CI.

### A. Prijsrichtlijn zonder plaatshouder (Prematuurkleding en Babynest)
1. In de zichtbare tekst van `prematuurkleding.html` en `babynest.html` staat geen "[prijs]" en geen bedrag.
2. Het oude blok (`<p class="prijs">Prijsrichtlijn: [prijs]</p>`) staat als HTML-commentaar op zijn plek, zodat het terug kan. Er staat een opmerking `<!-- LET OP: prijsrichtlijn … nog niet bekend; blok terugzetten als Carien een prijs geeft -->` bij. Het validatierapport toont die als open punt.
3. Sectie `#prijs` blijft bestaan, met dezelfde id en op dezelfde plek (002). In de plaats van het oude blok komen:
   - één korte, neutrale zin in lopende tekst (Source Sans 3, minimaal 16 px, inkt), zonder bedrag en zonder nieuwe feiten. Voorstel:
     - Prematuurkleding: "De prijs hangt af van de maat en de stof. Carien stuurt je een voorstel."
     - Babynest: "De prijs hangt af van de stof en je wensen. Carien stuurt je een voorstel."
     - Beide met `<!-- LET OP: wacht op akkoord Carien -->`.
   - één pijl-link "Vraag naar de prijs" → `contact.html?onderwerp=prematuurkleding#formulier` of `contact.html?onderwerp=babynest#formulier`.
4. Het sectielabel en `data-label` zijn gelijk, en de nummering blijft 001 → 002 → 003 → 004 zonder gat. Labelvoorstel: "002 — Prijs" (zie Open vragen). De balk toont bij deze sectie hetzelfde label als de sectie.
5. Sectie `#prijs` is op 390 × 844 hooguit 0,5 schermhoogte (≤ 422 px). Er komt geen leeg scherm.
6. **Plaatshouder-gate (nieuw, blokkerend):** een Playwright-test in Gate 4, die op alle projecten draait, opent elke `public/*.html`. Hij faalt als een van deze teksten iets bevat dat lijkt op een plaatshouder tussen vierkante haken (`/\[[^\]\n]{1,40}\]/`, dus ook "[prijs]", "[nummer]" en "[naam]"), of "TODO" of "lorem ipsum":
   - de zichtbare tekst (`innerText` van `body`, met het menu geopend óf de menu-inhoud apart meegenomen);
   - `alt`, `aria-label` en `title`;
   - de `<title>` en `meta[name=description]`.

   Scripts, stijlen en HTML-commentaar tellen niet mee. De bouwer laat zien dat de test op de huidige `main` rood is (prematuurkleding en babynest) en na de wijziging groen.

### B. Kopfoto Contact niet vergroot
7. Op 390 × 844 en op 390 × 664 (iPhone) laadt de kopfoto van `contact.html` een bestand dat in CSS-pixels niet vergroot wordt: schaal = max(breedte vak / breedte bestand, hoogte vak / hoogte bestand) ≤ 1,0, gemeten met `object-fit: cover`. Ook op 768 en 1440 blijft de schaal ≤ 1,0.
8. Voorkeur: een staande uitsnede via `<picture><source media="(max-width: 760px)" …>`, met een **nieuwe** bestandsnaam (bijv. `home-hero-handwerk-staand-530.jpg`). De bouwer maakt die uitsnede uit het grootste bestaande bestand, `public/assets/img/home-hero-handwerk.jpg` (1800 × 1012), en houdt de volle hoogte aan: ongeveer 530 × 1012, met het onderwerp in beeld zoals nu bij `object-position: 50% 40%`. Daarbij geldt:
   - niet vergroten en niet verscherpen;
   - JPEG-kwaliteit ongeveer 80;
   - dezelfde kleurcorrectie als het bronbestand, dus geen nieuwe correctie;
   - bestaande bestanden blijven ongewijzigd.

   Kan de uitsnede niet, dan mag de bouwer `sizes` zo afstemmen dat op mobiel het bestand van 1800 px laadt. De bouwer meldt dan het extra gewicht.
9. De foto blijft de LCP-foto met `fetchpriority="high"` op de geladen bron. De bytes vóór LCP op `/contact` (mobiel) worden niet groter dan nu (207 kB, gemeten in de brief van 6 nov.), of de bouwer meldt het verschil met de reden.
10. Toets 6b in `tests/e2e/mobiel-ontwerp.spec.js` meet voortaan **alle** zichtbare `main img` met `object-fit: cover`, dus ook `.contact-kop-foto img`. De meting gebeurt tegen de echte pixelmaat van `currentSrc` (zoals 6b nu bij `.statement`). Er geldt geen ruimere marge dan de huidige 1,01. Op de huidige `main` is de toets rood bij Contact (1,65×), na de wijziging groen. Vindt de toets nog een andere vergrote coverfoto, dan geldt:
    - is er een groter bestand, dan lost de bouwer het op met `sizes`;
    - zo niet, dan meldt hij het als open vraag en sluit hij de foto **niet** uit van de toets.

### C. Footer met directe kanalen (alle pagina's)
11. De footer van elke pagina heeft drie links, met dezelfde `href`'s als in het menu:
    - "WhatsApp" → `https://wa.me/31643791618`;
    - "06 – 43 79 16 18" → `tel:+31643791618`;
    - "info.LUXmini@gmail.com" → `mailto:info.luxmini@gmail.com`.

    Dat geldt voor index, werkwijze, kraamcadeauboxen, prematuurkleding, babynest, inspiratie, contact, privacy, bedankt en 404. De footer is op alle pagina's gelijk.
12. Op touch is elke footerlink minimaal 44 px hoog. De tekst van elke footerlink (kanalen, Instagram, Facebook en Privacy) is op mobiel minimaal 16 px.
13. In `main` staan nog steeds geen directe contactlinks buiten `contact.html`. De controle in `scripts/controleer.py` daarop blijft staan, ongewijzigd. Die controle wordt **strenger**: ze eist nu ook dat de drie kanalen in de footer staan.
14. Op 1440 × 900 past de footer netjes, zonder overlap. Op 390 px loopt niets horizontaal buiten beeld.

### D. Leesbare letters op mobiel (≤ 760 px)
15. Wat je moet lezen of aantikken is op mobiel minimaal 16 px:
    - formulierlabels (nu 11 px);
    - footerlinks (nu 11 px);
    - contactlinks in het menu (nu 14 px);
    - pijl-links `.pijl` (nu 15 px);
    - alle andere links, knoppen en `label`-elementen in `main`, het menu en de footer.
16. Alleen decoratieve labels zijn uitgezonderd, en dan alleen als ze geen link en geen bedieningselement zijn: sectielabels "001 —" (`.label`) en `.caps`-regels zoals "Carien Geurts —". Die zijn minimaal 13 px, met een letterafstand van minimaal 0,1em. Leg de uitzondering vast in `docs/ontwerp/principes.md`, Mobiel regel 2.
17. **Nieuwe toets** in `tests/e2e/mobiel-ontwerp.spec.js`, op alle pagina's en met het menu geopend:
    - elke zichtbare `a`, `button`, `label`, `summary` en `[role=tab]` in `main`, `#menu-scherm` en `footer` heeft een `font-size` van minimaal 16 px;
    - elk zichtbaar `.label` en `.caps` is minimaal 13 px.

    De uitzondering is alleen een inline link in lopende tekst met dezelfde grootte als die tekst (de privacyverklaring), en die staat met naam in de test. Op de huidige `main` is de toets rood, na de wijziging groen.
18. Vindt de toets nog meer bedieningselementen onder 16 px (bijv. de tabjes in de hero, subitems of tabbladen), dan maakt de bouwer die op mobiel ook 16 px. Gaat de indeling daardoor stuk, dan meldt hij dat in het Verloop voor de ontwerpgate. Hij past de toets niet aan.
19. Op desktop (1440 × 900) blijft het beeld gelijk, behalve de footer. Gate 5 (visueel) toont alleen verschillen op mobiel/tablet en in de footer. De bouwer licht die toe.

### E. Prijskaarten Kraamcadeauboxen compact op mobiel
20. Op 390 × 844 is de afstand van de bovenkant van de eerste `.formaat` tot de onderkant van de laatste `.formaat` hooguit 1,2 schermhoogte (≤ 1013 px). Nu is dat ongeveer 2,4 schermen.
21. Elke kaart toont op mobiel zichtbaar:
    - de prijs;
    - het aantal producten;
    - welke producten erin zitten, compleet en gelijk aan `CLAUDE.md`:
      - € 35: knuffel, swaddle, broekje;
      - € 50: plus sjaaltje;
      - € 65: plus shirtje en douchehandschoen;
      - € 80: plus bijtring;
    - de pijl-link "Stel deze box samen" naar het vooraf ingevulde formulier (`formaat=35/50/65/80`), minimaal 44 px hoog en minimaal 16 px.

    Op mobiel mag de herhaalde vinklijst ("In deze box:") verdwijnen, als de producten in de compacte regel staan. Ook het takje mag dan weg.
22. De prijs is minimaal 32 px. Alle andere tekst op de kaart is minimaal 16 px, in inkt op wit. De kaarten staan op salie, nooit op terracotta.
23. Er is geen horizontale scroll. Op tablet (768) en desktop (1440) blijven de kaarten zoals nu.
24. **Nieuwe toets** (`kernpaden.spec.js` of `mobiel-ontwerp.spec.js`, project `mobiel` en `iphone`). Hij controleert:
    - de hoogte van criterium 20 (bij iPhone 390 × 664: ≤ 1,2 × 664 = 797 px, of de bouwer meet op 390 × 844 met de mobiele indeling);
    - per kaart de prijs, het aantal en de producten uit criterium 21;
    - de link met `formaat=`.

### Algemeen
25. `npm run check` is groen: tests, sitecontrole, toegankelijkheid (axe), SEO, veiligheid, snelheid (Lighthouse in CI), visueel en het validatierapport. Er is geen grens versoepeld.
26. `CLAUDE.md` is bijgewerkt:
    - bij Productpagina's: "de prijsrichtlijn als eigen blok; zolang er geen prijs is een neutrale zin met pijl-link naar het formulier";
    - bij de footer of het contactformulier: dat de footer WhatsApp, telefoon en mail toont;
    - de Kraamcadeauboxenpagina: compacte formaten op mobiel.

## Ontwerprichting
*Ontleend aan de review van website-ontwerper van 7 november (`docs/ontwerp/reviews/2026-11-07-mobiel-review.md`, top-10, punten 1, 2, 3, 5 en 6). De planner heeft er geen eigen ontwerpkeuzes aan toegevoegd. De ontwerper toetst dit in de ontwerpgate.*

- **Prijs:** geen gat en geen groot getal, maar een volgende stap. De zin staat in lopende tekst, niet in de grote serif van `.prijs` (44 px). De pijl-link "Vraag naar de prijs" staat eronder. Het blok is klein en rustig. Zodra Carien een prijs geeft, komt die in `kop-m` (ongeveer 32 px), niet meer in 44 px.
- **Contactkop:** voor mobiel een staande uitsnede, `<picture><source media="(max-width:760px)">`, met het onderwerp (handwerk aan de naaimachine) in het midden van het beeld. Scherpte gaat voor maximale grootte.
- **Footer:** drie regels: "WhatsApp", "06 – 43 79 16 18", "info.LUXmini@gmail.com". Ze staan in 16 px met tikdoelen van 44 px. De overige footerlinks gaan omhoog van 11 px. De review noemt 13–14 px; deze brief vraagt minimaal 16 px, zoals Carst vroeg.
- **Letters:** labels in het formulier worden 16 px in normale schrijfwijze, of blijven kapitalen in minimaal 13 px. De brief kiest 16 px, omdat dit tekst is die je moet lezen. Pijl-links 16–17 px, menu-contact 17 px. Decoratieve `.caps` en sectielabels houden hun sfeer: minimaal 13 px, ruim gespatieerd.
- **Formaten op mobiel:** compacte kaarten. Op één regel de prijs, het aantal producten en "plus: …", zonder herhaalde vinklijsten. Een veegbare rij zoals de stoffen mag ook, maar dan moet € 35 en € 80 binnen één keer scrollen te vergelijken zijn. Bij vegen is dat lastig, dus de voorkeur gaat uit naar een compacte lijst of een raster van 2 × 2. Gebruik een raster alleen als de pijl-link op 16 px niet afbreekt in twee regels; anders de lijst.

**Ontwerpcriteria (toetsbaar in de ontwerpgate):**
- het grootste element op Prematuurkleding en Babynest, scherm 2, is geen prijsblok;
- de contactkop is op `m-contact` scherp, zonder zichtbare vergroting;
- de footer is op alle pagina's gelijk, met drie kanalen;
- geen tekst om te lezen of aan te tikken onder 16 px op mobiel;
- € 35 t/m € 80 binnen ≤ 1,2 scherm, en elke kaart blijft leesbaar.

## Testaanpassingen ter beoordeling door Carst
**Punt voor het validatierapport.** Er wordt geen grens versoepeld: 44 px, 16 px, contrast, axe, Lighthouse, de mobiele regels en de schaal 1,01 blijven gelijk. De bouwer zet per punt in het Verloop wat er veranderde.
- **`scripts/controleer.py`, regel ±1113:** de controle eist nu letterlijk "Prijsrichtlijn: [prijs]" als eigen blok. Ze verandert in: sectie `#prijs` bestaat op 002, heeft een zin in inkt van minimaal 16 px zonder "[" en een pijl-link naar `contact.html?onderwerp=…#formulier`. Dat volgt de wens van Carst en is niet soepeler.
- **`scripts/controleer.py`, de controle op directe kanalen (±1283):** die wordt strenger, want de footer moet ook de drie kanalen hebben.
- **`tests/e2e/mobiel-ontwerp.spec.js`:** toets 6b kijkt naar alle coverfoto's in `main` in plaats van alleen `.statement` (strenger). Er komt een nieuwe lettergroottetoets bij (criterium 17).
- **Nieuw:** de plaatshouder-gate (criterium 6) en de formatentoets (criterium 24).
- **Bestaande toetsen op de formaatkaarten** (vinklijst, takje) mogen op mobiel vervallen, als criterium 21 en de nieuwe toets hetzelfde of meer afdekken. De bouwer noemt welke.
- **Visuele basisschermen (Gate 5):** footer op alle pagina's; mobiel en tablet voor Contact, Prematuurkleding, Babynest en Kraamcadeauboxen; pijl-links en labels op mobiel.

## Bestanden
- `public/prematuurkleding.html`, `public/babynest.html`: sectie `#prijs`.
- `public/contact.html`: `<picture>` voor de kopfoto.
- `public/assets/img/home-hero-handwerk-staand-530.jpg`: nieuw, uitsnede uit een bestaand bestand.
- Alle `public/*.html` met een footer (index, werkwijze, kraamcadeauboxen, prematuurkleding, babynest, inspiratie, contact, privacy, bedankt, 404): de footerlinks.
- `public/kraamcadeauboxen.html`: alleen als de compacte kaart een extra regel of klasse nodig heeft.
- `public/assets/css/style.css`: `.prijs-sectie`, `.contact-kop-foto`, `.site-footer`, `.formulier label`, menu-contact, `.pijl`, `.formaat*` (alleen ≤ 760 px, behalve de footer).
- `tests/e2e/mobiel-ontwerp.spec.js`, `tests/e2e/kernpaden.spec.js`, en een nieuwe spec voor de plaatshouder-gate (bijv. `tests/e2e/plaatshouders.spec.js`).
- `scripts/controleer.py`.
- `CLAUDE.md`, `docs/ontwerp/principes.md` (Mobiel regel 2).

## Buiten scope
Deze punten staan op de backlog:
- het eerste scherm van de homepage (aanbodregel en volgende stap);
- de duur van de pagina-overgang en de uitgang van de intro;
- de babynestfoto en de zin onder de kop Babynest;
- de huidige pagina in het menu;
- de herhaling van de "Sem"-doos;
- de vertraging van het balklabel en de witte streep boven 003.

Verder valt buiten deze wijziging:
- de paginakop van Kraamcadeauboxen (7 regels serif) en het lege vlak voor 003 Thema's;
- de header op Contact op mobiel (terracotta band boven de foto, zie Open vragen);
- nieuwe foto's laten maken of bestaande bestanden overschrijven; het formulier zelf (velden, Worker, `src/`);
- `wrangler.jsonc`, `_redirects`, `_headers`, `.github/workflows/`;
- prijzen bedenken of noemen voor prematuurkleding of babynest.

## Open vragen
1. **Zinnen bij de prijs (A3):** "De prijs hangt af van de maat en de stof. Carien stuurt je een voorstel." en "De prijs hangt af van de stof en je wensen. Carien stuurt je een voorstel." zijn voorstellen, afgeleid van het voorbeeld van Carst. Klopt het dat Carien altijd een voorstel stuurt, en hangt de babynestprijs inderdaad van de stof af? Ze worden gebouwd met LET OP, en Carien keurt ze goed.
2. **Label 002:** "002 — Prijs" of "002 — Prijsrichtlijn" laten staan? Het voorstel is "Prijs", omdat er nog geen richtlijn staat.
3. **Prijzen:** wat zijn de prijsrichtlijnen voor prematuurkleding en babynest? Zolang die er niet zijn, blijft het blok een zin met link.
4. **Contactkop op retina:** de uitsnede is in CSS-pixels scherp, maar op een retina-scherm nog ongeveer 1,4× (de hoogte van het origineel is 1012 px). Is er een groter origineel van deze foto in de mediamap? Dan kan er een uitsnede van ongeveer 900 × 1300 komen.
5. **Header op Contact op mobiel:** daar staat de header als terracotta band boven de foto, terwijl de afspraak is: header over de donkere foto, in het wit. Is dat bewust? (Vraag uit de review; hier niet aangepast.)
6. **Testaanpassingen:** zie "Testaanpassingen ter beoordeling door Carst".

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief op basis van de GO van Carst voor deze scope (7 nov.) en de mobiele review van website-ontwerper (7 nov.). De ontwerprichting is ontleend aan die review. |
| Bouwen | website-bouwer | **Besluiten hoofdsessie (7 nov., Carst sliep):** zinnen bij de prijs zoals voorgesteld (A3), beide met `<!-- LET OP: wacht op akkoord Carien -->`; label "002 — Prijs"; kopfoto Contact als staande uitsnede uit het bestaande bestand onder een nieuwe naam, niet vergroot (retina blijft ca. 1,4×, daarom als punt op `docs/fotolijst.md`, test niet versoepeld); de terracotta band boven de contactfoto op mobiel blijft buiten scope. **Gebouwd:** A: `#prijs` op Prematuurkleding en Babynest heeft een zin (`.klein.prijs-zin`, Source Sans 3, 16 px, inkt) en de pijl-link "Vraag naar de prijs" naar het formulier met onderwerp; het oude blok staat als commentaar met LET OP; sectie 238 px hoog op 390 × 844. B: `<picture>` met `home-hero-handwerk-staand-530.jpg` (530 × 1012, middenuitsnede zoals nu bij 50% 40%, JPEG 80, geen nieuwe kleurcorrectie, 53 kB) voor `(max-width: 530px)`; daarboven het bestand van 1800 px zonder srcset (de 800-versie werd op elk scherm met `cover` vergroot, ook op 768: 2,2×). Afwijking: media 530 px in plaats van 760 px, zodat telefoons van 531–760 px de 1800-versie krijgen en niet de smalle uitsnede vergroten. Schaal: 0,74 (390 × 844 en 390 × 664), 0,99 (768), 0,89 (1440). Bytes vóór LCP op /contact (lokaal, 412 px, DPR 1,75): 215 → 228 kB (+13 kB, de scherpere foto; op een iPhone met DPR 3 juist 319 → 228 kB, want die laadde eerst de 1800-versie). C: footer op alle tien pagina's gelijk, met "Direct contact" (WhatsApp, 06 – 43 79 16 18, info.LUXmini@gmail.com) en Instagram, Facebook, Privacy, alles 16 px (op touch 44 px); privacy, bedankt en 404 hadden geen footer en hebben hem nu (404 met `/privacy`). D: op mobiel pijl-links 16 px, tabjes in de hero 16 px (letterafstand .12em), tabbladen Personaliseren 16 px (letterafstand .04em, past in drie kolommen), formulierlabels en legend 16 px gewoon gespatieerd (600), contactlinks in het menu 17 px, `.caps` 12 → 13 px. E: formaatkaarten op mobiel als raster: prijs (40 px) en aantal op één regel, daaronder "In deze box: …" of "plus: …" (inline lijst) en de pijl-link; takje, korte omschrijving en vinkjes verborgen; `.formaat-kop-lang` ("Alles uit de box van € …, ") alleen op mobiel weg. € 35 t/m € 80: 1739 → 628 px. Desktop en tablet ongewijzigd behalve de footer. **Testaanpassingen (geen grens versoepeld):** nieuw `tests/e2e/plaatshouders.spec.js` (alle projecten; vóór de wijziging rood op prematuurkleding en babynest, nu groen); `mobiel-ontwerp.spec.js` 6b meet alle zichtbare `main img` met `cover` tegen `currentSrc`, marge 1,01 (vóór: rood op Contact, 1,65×; geen andere vergrote coverfoto gevonden); nieuwe toets lettergrootte (main, footer, geopend menu; uitzondering met naam: maillink privacyverklaring; vóór: rood op alle pagina's); nieuwe toets formaten (vóór: rood, 1739 px). `scripts/controleer.py`: prijscontrole vervangen door zin + LET OP + pijl-link + label + ≤ 0,5 scherm; secties "002 — Prijs"; contactmomenten strenger (footer moet de drie kanalen hebben). Er waren geen bestaande toetsen op vinklijst of takje; niets vervallen. **Uitkomst lokaal:** `npm test` 18/18; `scripts/controleer.py` geen fouten; Playwright (desktop, tablet, mobiel; Chromium) kernpaden, homepage, mobiel ontwerp, SEO/veiligheid en plaatshouders: 188 groen, 124 overgeslagen (projectfilters), 0 rood. Alleen in CI: axe (toegankelijkheid), iPhone/WebKit, Lighthouse, wrangler dry-run en Gate 5 (geen basisschermen lokaal). Verwachte visuele verschillen (Gate 5): footer op alle pagina's en schermen; op mobiel Prematuurkleding/Babynest (002), Contact (kopfoto, labels), Kraamcadeauboxen (formaten), pijl-links, tabjes en `.caps` 13 px; op tablet de footer en de scherpere kopfoto van Contact (laadt nu de 1800-versie). Alle verschillen zijn bedoeld. Open: akkoord Carien op de twee zinnen; prijzen; groter origineel kopfoto Contact; header op Contact op mobiel (open vraag 5). |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
