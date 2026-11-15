# Babynest sneller in beeld: LCP ruim onder de grens

- **Datum:** 2026-11-15
- **Aangevraagd door:** Carst (15 nov. 22:10 in de chat: "Go" om dit op te pakken)
- **Branch:** `wijziging/babynest-lcp` (vanaf `main`, na merge van #92, commit c2c9022)
- **Issue:** geen issuenummer bekend. Is er een issue, dan komt `Closes #<nummer>` in de pull request.
- **Risico:** midden. Het formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt. Wel kan gedeelde code veranderen: `main.js` §5f (laden van de boekfoto's, inschuiven) en de `<img>`-attributen van het boek. Die gebruikt ook het atelierboekje op Werkwijze. Een fout in het laden kan het inschuiven of openslaan (tests uit brief 2026-11-15-babynest-mobiel-inschuiven) breken.

## Doel
Op `/babynest` staat de grootste inhoud bij een trage mobiele verbinding sneller in beeld. Lighthouse CI meet LCP ruim onder de grens van 4000 ms, zodat de controle niet meer bij toeval rood wordt. Het afgesproken inschuiven van opzij blijft zoals Carst het op 15 nov. heeft goedgekeurd.

## Aanleiding (metingen)
- Grens: `lighthouserc.cjs`, `largest-contentful-paint` ≤ 4000 ms, mediaan van 3 runs (`median-run`), mobiele instellingen (standaard Lighthouse: trage 4G, middelmatige telefoon).
- Bij #89 (brief 2026-11-15-babynest-mobiel-inschuiven): groen.
- PR #92: 4172 ms (rood), daarna een rerun die groen was.
- Controle op `main` na merge van #92 (c2c9022): 4025 ms (rood).
- Babynest zit dus sinds #89 op de grens en de uitkomst hangt af van toeval.

## Hoe het nu werkt (gelezen in de code)
Dit zijn de factoren die LCP op `/babynest` (mobiel) waarschijnlijk bepalen. Welk element echt het LCP-element is, staat **niet** vast. Dat stelt de bouwer eerst vast (criterium 1).

1. **Geen beeld in de paginakop.** `.pagina-kop` heeft alleen tekst: h1 "Babynest", de quote `.pagina-quote` (Libre Caslon Display, `clamp(32px, 3.6vw, 52px)`, het lettertype is preloaded) en een pijl-link. Op mobiel is de quote waarschijnlijk kleiner dan de boekfoto eronder.
2. **Het boek van 001 staat op mobiel bij het laden al deels in beeld** (brief van 15 nov.: op 390 × 844 322 van 408 px). Het is dus een sterke kandidaat voor LCP: de kaftfoto `babynest-voorkant.jpg` (`.kaft-voor`), of `babynest-boven.jpg` (`.blad-rechts`) / `babynest-stof-rits.jpg` (`.kaft-achter`). Alle drie hebben:
   - `loading="lazy"` en `decoding="async"`;
   - geen `fetchpriority`, geen preload, geen `srcset`/`sizes` (één bestand van 768 × 960 voor een vak van ongeveer 326–348 css-px breed).
3. **Het boek begint buiten beeld.** In `style.css` (r. 1907–1909) staat het object bij `--in` 0 op `translateX(-50vw) rotate(12deg)`. `main.js` §5f (`opTijdStarten`) wacht tot `intro-aan`/`overgang-binnen` weg is en zet dan na 0,2 s `.op-tijd` (1,2 s overgang). Lighthouse draait met een leeg profiel, dus de **intro speelt** (ongeveer 2,2 s). Het boek staat dus pas na ongeveer 2,2 + 0,2 + 1,2 s helemaal in beeld. Hoe Chrome dit meetelt (deels zichtbaar, geschaald, onder het intro-doek), moet de meting uitwijzen.
4. **Concurrentie om bandbreedte bij het laden.**
   - Het script in `<head>` voegt bij de intro een preload toe van `p-knuffel-naam.jpg` (de intro-foto). `main.js` zet die foto ook als `src`.
   - `laadIo` in §5f (`rootMargin: '100% 0px 100% 0px'`) laadt met `mediaLaden` alle foto's van elk blok binnen één scherm erboven of eronder via `new Image()`. Op mobiel zijn dat bij het laden waarschijnlijk 001 én 002, dus tot zes keer 768 × 960. Die halen ze op in dezelfde periode als de LCP-foto.
5. **Groot logo.** `logo-lux-groot-wit.png` en `-donker.png` (880 × 334) staan in de header. De donkere versie heeft `fetchpriority="low"`, de witte niet. Op mobiel tot 90 px hoog en daarom waarschijnlijk geen LCP, maar wel een download die vroeg begint.
6. **Werkwijze (zelfde boek).** Daar is de kopfoto `over-carien.jpg` het eerste beeld, met `srcset`, `sizes` en `fetchpriority="high"`. Het atelierboekje staat op 390 × 844 buiten beeld, maar op tablet al in beeld. Daar is LCP waarschijnlijk de kopfoto en speelt het boek een kleinere rol. De bouwer meet dit wel (criterium 7).

## Acceptatiecriteria

### Diagnose (eerst, vóór de aanpassing)
1. **LCP-element vastgesteld.** De bouwer draait Lighthouse CI lokaal op `main` (`npm run test:snelheid` of alleen `/babynest` en `/werkwijze`, met dezelfde instellingen als `lighthouserc.cjs`). Per pagina zet hij in het Verloop:
   - het LCP-element (audit `largest-contentful-paint-element`: selector en snippet);
   - de LCP-fasen (TTFB, load delay, load time, render delay);
   - de mediaan-LCP van 3 runs.

   De aanpak van criterium 3 en 4 volgt uit deze diagnose, niet uit aannames in deze brief.

### Snelheid
2. **LCP ruim onder de grens.** In Lighthouse CI (`lighthouserc.cjs` ongewijzigd, `median-run` van 3 runs) is LCP op `/babynest` **≤ 3000 ms**, zowel lokaal als in de CI-run van de pull request. Wordt 3000 ms niet gehaald zonder het ontwerp te veranderen, maar is de uitkomst wel stabiel onder ≤ 3500 ms, dan meldt de bouwer dat in het Verloop met de metingen. Het besluit ligt dan bij Carst (open vraag 1).
3. **De LCP-bron krijgt voorrang.** Is het LCP-element een foto:
   - heeft die foto geen `loading="lazy"` en krijgt hij `fetchpriority="high"`;
   - kan hij vroeg worden gevonden (in de HTML zichtbaar of met `<link rel="preload" as="image">`, met `imagesrcset`/`imagesizes` als er een `srcset` is);
   - komen andere foto's uit hetzelfde blok die bij het laden niet direct nodig zijn (`.kaft-achter`, `.blad-rechts` onder een dichte kaft) niet vóór de LCP-foto. Ze houden `loading="lazy"`, of `mediaLaden` start pas na `load` of na de LCP-foto.

   Is het LCP-element tekst (de quote), dan zorgt de bouwer dat die niet op JavaScript, de intro of een late font-swap wacht. Het preloaden van het lettertype blijft.
4. **Minder concurrentie bij het laden.**
   - `mediaLaden` (§5f) laadt bij het laden van de pagina geen foto's meer van blokken die nog niet in beeld zijn (002, 003). Dat mag pas na `load` of zodra het blok binnen één scherm komt, zolang het inschuiven en openslaan nooit een lege kaft of tablet toont.
   - Foto's die alleen voor de intro zijn, of het grote logo, mogen de LCP-foto niet vertragen. Hoe dat het best kan (bijv. `fetchpriority="low"` op `logo-groot-wit`), volgt uit de diagnose.
   - De intro zelf (duur, preload van de intro-foto op andere pagina's) verandert niet zonder besluit van Carst (open vraag 2).
5. **Juiste maat.** Krijgt de LCP-foto een kleinere variant (bijv. `babynest-voorkant-600.jpg`), dan:
   - is het een nieuwe bestandsnaam met dezelfde kleurcorrectie, gemaakt van het bestaande bestand (geen nieuwe foto);
   - is de `srcset`/`sizes` correct voor 390, 768 en desktop;
   - wordt geen foto breder getoond dan het bestand;
   - blijven de `alt`-teksten ongewijzigd en uniek.
6. **Andere grenzen niet slechter.** Op `/babynest` en `/werkwijze` worden CLS, TBT, totale grootte en de performancescore niet slechter dan op `main` (c2c9022). De bouwer zet de getallen van vóór en na in het Verloop.
7. **Werkwijze.** De bouwer meet `/werkwijze` vóór en na de wijziging. Raakt de wijziging gedeelde code (§5f, `mediaLaden`) of het boek, dan wordt LCP op `/werkwijze` niet hoger dan op `main` en blijft het ≤ 3000 ms. Ligt `/werkwijze` nu al dicht bij 4000 ms (> 3500 ms), dan meldt de bouwer dat en past hij dezelfde aanpak toe, mits die alleen de laadvolgorde verandert.

### Ontwerp ongewijzigd
8. **Inschuiven en openslaan blijven gelijk.** Alle tests in `tests/e2e/babynest-media.spec.js` en `tests/e2e/werkwijze-boekje.spec.js` blijven groen zonder versoepeling. Dat geldt vooral voor:
   - de beginstand (∓50vw, ±12°);
   - "001 op tijd ≤ 1,5 s";
   - `--open` 0 zolang `--in` < 1;
   - geen horizontaal scrollen;
   - minder beweging en zonder JS.

   Duur, easing, vertraging na de intro en richting veranderen niet.
9. **Visueel gelijk.** De basisschermen van `babynest.html` en `werkwijze.html` (desktop, tablet, mobiel) wijken niet af, en er komen geen nieuwe basisschermen bij. Moet er toch iets zichtbaar veranderen om criterium 2 te halen, dan bouwt de bouwer dat niet. Hij zet het als voorstel in het Verloop en het gaat via de planner naar Carst en website-ontwerper (open vraag 1).
10. **Geen trucs met LCP.** Het LCP-element wordt niet verborgen, niet klein gemaakt en niet onzichtbaar gemaakt (geen `opacity: 0` die Chrome uitsluit, geen placeholder-afbeelding), alleen om de meting te beïnvloeden. De bezoeker moet het echt sneller zien.

### Harness
11. **Groen zonder versoepeling.** `npm run check` is groen. `lighthouserc.cjs` (grenzen, `numberOfRuns`, `aggregationMethod`, `settings`), tests en axe-regels blijven ongewijzigd. Wil de bouwer een eigen strengere LCP-toets voor `/babynest` (bijv. ≤ 3000 ms) toevoegen in `lighthouserc.cjs`, dan is dat een aanscherping, en die mag ("aanscherpen mag"). Hij noemt het in het Verloop.
12. **Overal hetzelfde.** Bij `.media`/§5f-wijzigingen gelden criterium 8 en 9 voor beide pagina's. Een eventuele `<link rel="preload">` staat alleen op de pagina waar die foto het LCP-element is, niet op alle pagina's.
13. **`CLAUDE.md`.** Komt er een afspraak bij over het laden (bijv. "de kaftfoto van Babynest 001 heeft `fetchpriority="high"` en geen lazy; `mediaLaden` pas na `load`"), dan wordt de Babynest-regel en zo nodig de regel Werkwijze 001 met één zin bijgewerkt. Dit noemt de bouwer in het Verloop.

## Ontwerprichting
n.v.t. Dit is een technische wijziging zonder zichtbaar verschil (criterium 9). Website-ontwerper is alleen nodig als de diagnose laat zien dat 3000 ms niet te halen is zonder zichtbare wijziging (open vraag 1). De ontwerpgate is dan n.v.t., tenzij de basisschermen toch afwijken.

## Bestanden
- `public/babynest.html`: attributen van de foto's in 001 (`loading`, `fetchpriority`, eventueel `srcset`/`sizes`), eventueel `<link rel="preload" as="image">`, eventueel `fetchpriority="low"` op het grote witte logo
- `public/assets/js/main.js`: §5f (`mediaLaden`/`laadIo`, alleen het moment van laden)
- `public/werkwijze.html`: alleen als de meting dat nodig maakt (criterium 7)
- `public/assets/img/`: eventueel kleinere varianten met een nieuwe naam (bijv. `babynest-voorkant-600.jpg`)
- `lighthouserc.cjs`: alleen een aanscherping (criterium 11), nooit een versoepeling
- `CLAUDE.md`: eventueel één zin (criterium 13)

## Buiten scope
- Geen wijziging aan het inschuiven, openslaan, de intro, de pagina-overgang, het logo groot → klein of de kleurlaag.
- Geen versoepeling van `lighthouserc.cjs` of van tests.
- Geen wijziging aan het formulier, `src/`, `_redirects`, `_headers`, `wrangler.jsonc` of `.github/workflows/`.
- Andere pagina's alleen als ze dezelfde code delen (Werkwijze). Een algemene snelheidsronde over de hele site is een eigen brief.
- Geen nieuwe foto's of teksten.

## Open vragen

**Blokkerend (alleen als het zich voordoet)**
1. **Als 3000 ms niet te halen is zonder zichtbare wijziging.** Bijvoorbeeld als LCP vooral vastzit op de intro of op het inschuiven na de intro (factor 3). Dan is een ontwerpkeuze nodig, en die maakt Carst. Mogelijke alternatieven, te beoordelen door website-ontwerper:
   - (a) Het 001-object op mobiel bij het laden niet buiten beeld laten beginnen, maar meteen op zijn plek, en alleen 002/003 laten inschuiven. Dat wijkt af van besluit 15 nov. ("staat het object bij het laden al in beeld, dan één keer op tijd").
   - (b) Een doel van ≤ 3500 ms accepteren, met de grens van 4000 ms ongewijzigd.

   Zonder besluit bouwt de bouwer alleen wijzigingen zonder zichtbaar verschil.
2. **Intro.** Lighthouse meet altijd met intro (leeg profiel). Blijkt de intro (2,2 s, preload `p-knuffel-naam.jpg`) de hoofdoorzaak, dan is dat een ontwerpregel ("Intro: … ongeveer 2,2 s") en dus een besluit van Carst. Deze brief verandert de intro niet.

**Niet blokkerend**
3. **Doel 3000 ms.** Dit is het voorstel uit de opdracht. Carst kan een ander doel kiezen. De grens van 4000 ms blijft hoe dan ook.
4. **Andere pagina's.** Liggen andere pagina's ook dicht bij 4000 ms (de bouwer ziet dat in de lokale run), dan noemt hij ze in het Verloop als kandidaat voor een eigen brief.
5. **Issuenummer.** Er is geen issue genoemd. Bestaat er een, dan komt het in de pull request.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de opdracht van Carst (15 nov. 22:10). Code gelezen: `babynest.html` (boekfoto's `loading="lazy"`, geen `fetchpriority`/`srcset`), `style.css` r. 1904–1909 (inschuiven vanaf −50vw), `main.js` §5f (`opTijdStarten` na de intro, `laadIo` met 100 %-marge, `mediaLaden`), het intro-script in `<head>`, `lighthouserc.cjs`, `werkwijze.html` (kopfoto met `fetchpriority="high"`). LCP-element nog niet gemeten (geen lokaal Lighthouse-rapport): criterium 1 is daarom de diagnose. Ontwerper n.v.t. zolang er niets zichtbaar verandert. |
| Bouwen | website-bouwer | **Meetmethode.** Lighthouse/lhci is lokaal niet te installeren (npm-registry onbereikbaar) en de CI-artefacten (`kwaliteit`) zijn niet te downloaden (proxy weigert de blob-opslag); uit het CI-log van c2c9022 alleen: `/babynest` LCP 4024,7 ms. Lokaal gemeten met Playwright/Chromium: (a) gethrottelde run (4× CPU, 150 ms RTT, 1,6 Mbps, 412 × 823 @1,75, leeg profiel dus met intro, 3 runs, mediaan, LCP via PerformanceObserver); (b) omdat Lighthouse *simuleert* (Lantern) op een ongethrottelde opname: per ongethrottelde run de waargenomen LCP en de bytes van de verzoeken die vóór de LCP klaar zijn (pessimistische graaf) en van CSS + LCP-foto (optimistische graaf). "Vóór" = branchbasis 611c057 (main na #91). **Diagnose (criterium 1).** LCP-element op mobiel wisselt op main tussen `#babynest .blad-rechts img` (`babynest-boven.jpg`) en `#babynest .kaft-voor img` (`babynest-voorkant.jpg`). Oorzaak: vóór main.js staat het boek op mobiel open (`.kaft` opacity `var(--kaft-o, 0)`), dus bij de eerste paint is alleen de binnenpagina zichtbaar; main.js sluit daarna de kaft. Beide foto's waren lazy en werden pas na CSS/lay-out ontdekt. Fasen gethrottelde run (main): TTFB ~30 ms, load delay ~1 400 ms (ontdekking pas bij ~1 450 ms), load time ~1 750 ms (tegelijk met `babynest-boven`, `babynest-dekentje` (002) en `babynest-stof-rits`), render delay ~20 ms. In de ongethrottelde opname kwam de LCP pas na main.js (~540 ms), dus zaten alle 14 verzoeken (586 KB) in de pessimistische graaf. Werkwijze: LCP = kopfoto `.over-kop-foto img` (`over-carien-600.jpg`), niet het boekje. **Gebouwd.** `babynest.html`: `<link rel="preload" as="image" href="assets/img/babynest-boven.jpg" fetchpriority="high">` (alleen deze pagina) en `decoding="sync"` op `.blad-rechts img` van 001, zodat die bij de eerste paint staat; kaft 001 krijgt `srcset` met de nieuwe `babynest-voorkant-560.jpg` (560 × 700, verkleind uit het bestaande bestand, q80; `sizes` gemeten: kaft 248 px op desktop, 462 px op tablet, 242–477 px op mobiel); `fetchpriority="low"` op `logo-lux-groot-wit` (alleen deze pagina). `main.js` §5f: `mediaLaden` (laadIo) start pas na `load` (geldt ook voor Werkwijze). `CLAUDE.md`: één zin bij de Babynest-regel. Geen tests, grenzen of `lighthouserc.cjs` gewijzigd; geen aanscherping toegevoegd. **Afwijking van criterium 3, eerste punt:** de LCP-foto houdt `loading="lazy"`, want `controleer.py` (r. 1551) en `babynest-media.spec.js:268` eisen `lazy` op elke foto in `.media`, en criterium 11 verbiedt tests aanpassen. De preload met `fetchpriority="high"` geeft hetzelfde effect (in 12 van 12 ongethrottelde runs stond de foto bij de eerste paint). Zonder lazy + `fetchpriority="high"` op de img is ook gemeten: zelfde LCP, maar de tests worden rood. Een 560-variant van `babynest-boven` is geprobeerd en weer weggehaald: `babynest-boven.jpg` blijft nodig voor de lookbook-kaft in 002 (341 css-px, dus 560 is daar te klein), en dan stijgt de totale grootte met 39 KB. **Metingen vóór → na.** `/babynest` gethrottelde LCP mediaan 3 216 → 2 280 ms (runs 3 176/3 216/3 308 → 2 256/2 280/2 488); LCP-element nu in elke run `.blad-rechts img`. Lantern-graaf (ongethrottelde opname, 5 runs): waargenomen LCP ~540 → ~385 ms; pessimistisch 586 → 274 KB (14 → 8 verzoeken); optimistisch 127 → 123 KB. Grove schatting: op main gaf ~1 825 ms "graaf-tijd" in CI 4 025 ms; dezelfde verhouding geeft na de wijziging ~2 250 ms in Lighthouse. **Niet in Lighthouse zelf bevestigd**; dat moet de CI-run van de pull request laten zien (criterium 2). CLS 0,000 → 0,000; lange taken > 50 ms (benadering TBT) 26–73 → 17–43 ms; totale overdracht 590 → 566 KB (−25 KB: voorkant 89 → 64 KB). `/werkwijze`: LCP 1 476 → 1 464 ms (kopfoto), CLS 0 → 0, lange taken 15–37 → 18–38 ms, 691 → 691 KB; Lantern-graaf gelijk (228/77 KB). Werkwijze lag dus ver onder 3 500 ms. **Neveneffect (voorleggen):** de introfoto `p-knuffel-naam.jpg` komt in de gethrottelde run later binnen: ~1,6 s → ~2,0–2,2 s (de preload van de boekfoto deelt de bandbreedte). Bij 1,6 Mbps verschijnt de introfoto dan later in de intro-animatie; op snellere verbindingen niet merkbaar. De brief (criterium 4) geeft de LCP-foto voorrang boven intro-foto's. Zonder `fetchpriority="high"` gemeten: introfoto 1,9–2,2 s en LCP ~2 490 ms, dus nauwelijks beter. **Visueel.** Schermen main ↔ branch vergeleken (zonder intro, desktop/tablet/mobiel, met en zonder minder beweging, Werkwijze en Babynest): Werkwijze 0 verschil in rust; Babynest alleen resampling van de kaftfoto (560-variant op 1×-schermen): mobiel 0,7 %, tablet 0,35 %, desktop 0,04 % van de pixels (onder de drempel van 1 %), niet waarneembaar. De basisschermen van deze pagina's bestaan in CI nog niet ("A snapshot doesn't exist"). Verschillen bij full-page schermafdrukken bleken decodeer-timing (de aantallen geladen foto's zijn op main en branch gelijk). **Waarneming buiten scope:** zonder intro en zonder pagina-overgang (bijv. herladen in dezelfde sessie) staat het boek op mobiel één of meer frames open op zijn plek voordat main.js het buiten beeld zet; dat gebeurde op main ook al (toen met lege bladzijden). **Harness (lokaal).** `npm test` 197/197 groen; Playwright (eigen poort 4891, desktop/tablet/mobiel) `babynest-media`, `werkwijze-boekje`, `kernpaden` 205 groen, `logo-krimpen` + `seo-veiligheid` 110 groen; het project `iphone` kan lokaal niet draaien (WebKit ontbreekt), dat draait CI; `controleer.py`: geen fouten. Niet lokaal te draaien: `npm run check` als geheel, Lighthouse CI (gate 4 snelheid) en axe (`@axe-core/playwright` niet geïnstalleerd). Dat moet de CI-run van de pull request doen. |
| Controleren | website-controleur | **AKKOORD** (40c8799): LCP /babynest nagemeten 3180 → 2348 ms (Werkwijze gelijk), niets zichtbaar veranderd, srcset/sizes juist, tests en lighthouserc ongewijzigd, lazy plus preload aanvaardbaar. Let op (besluit Carst): bij 1,6–3 Mbps, eerste bezoek direct op /babynest, toont de intro alleen het perzik vlak zonder foto (bestaande noodrem 300 ms in main.js). |
| Ontwerpgate | website-ontwerper | n.v.t. (tenzij open vraag 1) |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
