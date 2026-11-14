# Prematuurkleding: meer echte foto's die bij scrollen inschuiven (Story 8)

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst
  - Story 8 (12 nov.): "more pictures on prematuurkleding with slide-in like Stock".
  - Carien stuurde nieuwe foto's van couveuserompers en couveusesetjes en een foto met hangers (12 nov.).
- **Branch:** `wijziging/prematuur-fotos` (vanaf `origin/main`)
- **Issue:** Story 8, geen issuenummer bekend (zie Open vragen 1)
- **Risico:** midden. Het formulier, de doorverwijzingen, `wrangler.jsonc` en `.github/workflows/` blijven buiten schot. Wel verandert waarschijnlijk de gedeelde logica voor "opkomen bij scrollen" in `main.js` en de opmaak in `style.css`. Die raken alle pagina's. Daarnaast komen er nieuwe foto's bij, wat gevolgen heeft voor snelheid (LCP, gewicht) en de visuele basisschermen.

## Doel
Wie prematuurkleding zoekt, ziet meteen echte couveusesetjes en -rompers van Carien in plaats van één tijdelijke foto van een broekje. De foto's schuiven rustig in beeld bij het scrollen, zoals op Stock. De pagina blijft compact.

## Wens en context
- **Nu (stand `origin/main`):** `prematuurkleding.html` heeft één foto in 001 Maatwerk, `p-broekje-kleur.jpg`. In de HTML staat er het commentaar "LET OP: tijdelijke foto (het broekje) tot er een foto van prematuurkleding is". Daarna volgen 002 Prijs, 003 Zo werkt het en 004 Contact.
- **Opkomen bij scrollen bestaat al** (`main.js` r. 856–871, `style.css` r. 323–325 en 498–500):
  - labels, quotes, pijl-links en dergelijke krijgen `.opkomen`: opacity 0 → 1 en translateY 28 px → 0, in 0,9 s;
  - een aantal foto's krijgt `img.zoom`: scale 1,12 → 1 en opacity 0 → 1, in 1,6 s;
  - beide worden gestart door één IntersectionObserver (`in-beeld`, rootMargin −8 % onder);
  - bij "minder beweging" en zonder JavaScript staat alles er direct.
- **Stock:** in `docs/ontwerp/bron/` staat nog geen meting van een "slide-in" van foto's. Wel staat in `stock-analyse-paginas-2026-11-02.md` r. 32 een liggende foto met parallax binnenin (top −25 %, hoogte 120 %). De Media-slider (`stock-analyse-2026-11-02.md` §5) laat foto's van opzij inschuiven, maar alleen bij een klik. Wat Carst precies bedoelt met "slide-in like Stock" ligt bij de ontwerper (Ontwerprichting, vraag 2).
- **Babynest** (branch `wijziging/babynest-media-en-logo`, brief `2026-11-14-babynest-media-en-logo.md`) krijgt een eigen patroon, het Media-overzicht met boek, magazine en tablet. Volgens die brief blijft Prematuurkleding zoals hij is. Deze brief neemt dat patroon niet over, maar sluit er wel op aan: dezelfde easing, dezelfde regels voor "minder beweging" en zonder JavaScript, en dezelfde manier om de beweging te starten (de bestaande observer).

## Geselecteerde foto's (bron, niet committen)
Bronmappen in de scratchpad: `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/`. Hieronder staan de bestandsnamen relatief ten opzichte van die map.

**Webversie die al klaarstaat (de foto met hangers):**
- `web/prematuur-hangers.jpg` en `web/prematuur-hangers-800.jpg`: vier wikkelshirtjes met bijpassend mutsje op houten hangertjes, met wilgenkatjes, regenboogjes en eucalyptus en randen in mauve, bordeaux en lichtblauw.
- Let op: de opdracht noemde ze direct in de scratchpad. Ze staan in de submap `web/`.
- De compositie komt overeen met `carien-kleding-12nov/kleding-4.jpg` en `kleding-5.jpg`. Die twee zijn dubbel, dus maar één van beide gebruiken.

**Couveusesetjes aan het rek (`carien-kleding-12nov/`), foto's van Carien op een lichte achtergrond:**
| Bron | Wat je ziet | Voorstel |
|---|---|---|
| `kleding-2.jpg` | rek met vier setjes recht van voren: overslagromper met knoopmutsje (herfstblad, roest), overslagromper (eucalyptus, lichtblauw), jurkje met legging (bloemetjes, roze), wikkelshirt met broekje (groene blaadjes) | kandidaat |
| `kleding-1.jpg` | dezelfde vier setjes, iets dichterbij en schuiner | alternatief voor `kleding-2` (niet allebei) |
| `kleding-3.jpg` | close-up van een wikkelshirt met satijnen strik en het LUX-label, liggend | kandidaat (detail) |
| `kleding-6.jpg` | rek van opzij met een knoopmutsje en wikkelshirtjes | kandidaat |
| `kleding-9.jpg` | close-up van een mutsje met lichtblauwe rand en het LUX-label | kandidaat (detail) |
| `kleding-10.jpg` | overslagromper met mutsje en jurkje, dichtbij | kandidaat |
| `kleding-hangers-sfeer.jpg` | niet apart bekeken; waarschijnlijk de bron van `web/prematuur-hangers.jpg` | alleen als die webversie niet volstaat |

**Couveusesetjes plat op wit (`carien-plat-12nov/`), telefoonfoto's op koel wit:**
| Bron | Wat je ziet | Voorstel |
|---|---|---|
| `plat-1.jpg` (staand) | wikkelshirt met regenboogjes, mutsje en bordeauxrode broek, met een droogbloem | kandidaat |
| `plat-20.jpg` | wit wikkelshirt met roze rand en strik, roze knoopmutsje; sticker "38" in de hals | kandidaat (maat 38 zichtbaar) |
| `plat-30.jpg` (staand) | wikkelvestje met groene blaadjes; sticker "38"; met een korenaar | kandidaat (maat 38 zichtbaar) |
| `plat-65.jpg` (staand) | roze setje: wikkelshirt met bloemetjes en strik, mutsje, legging | kandidaat |
| `plat-10.jpg` | wikkelshirtje met lieveheersbeestjes | kandidaat, maat niet zichtbaar |

**Bewust niet geselecteerd:**
- `carien-kleding-12nov/kleding-7.jpg` en `kleding-8.jpg`: een vol rek met veel kleding. Daar hangt ook gewone babykleding tussen en er is niet te zien wat prematuur is.
- `carien-plat-12nov/plat-45.jpg`: een textieldoek, geen kleding.
- `carien-extra-12nov/` (steekproef extra-1, -8, -16, -24): een kraamcadeaubox, Carien aan de naaimachine en het atelier. Geen prematuurkleding.
- `carien-12nov/` (steekproef 006863ad, 9349a977): speenkoorden. Geen prematuurkleding.

**Niet volledig bekeken:** van `carien-plat-12nov/` zijn 7 van de 71 foto's bekeken, van `carien-extra-12nov/` 4 van de 24 en van `carien-12nov/` 2 van de 37. De bouwer bekijkt de rest alleen als de ontwerper meer foto's nodig heeft dan hierboven staan (zie Open vragen 3).

## Acceptatiecriteria
*Ontwerpkeuzes (aantal, opbouw, beweging) volgen uit de Ontwerprichting zodra de website-ontwerper die heeft ingevuld. Deze criteria gelden in elk geval.*

### A. Foto's
1. Alle nieuwe foto's op `prematuurkleding.html` komen uit de selectie hierboven of uit een latere aanvulling die in deze brief wordt genoemd. Er komen geen AI-beelden, nepfoto's, stockfoto's of foto's van Stock.
2. Elke webversie:
   - is maximaal 1400 px aan de lange zijde, JPEG kwaliteit 80;
   - heeft de lichte warme kleurcorrectie van de site (gebroken wit, geen koel blauwwit). Dat geldt vooral voor de `plat-*`-foto's;
   - krijgt een nieuwe bestandsnaam in kleine letters met streepjes, bijvoorbeeld `prematuur-set-rek.jpg`. Geen bestaande naam wordt overschreven;
   - krijgt een kleinere variant voor `srcset` (bijv. `-600` of `-800`) als de foto op mobiel smaller getoond wordt.
3. `web/prematuur-hangers.jpg` en `-800.jpg` worden alleen zo gebruikt als ze aan criterium 2 voldoen. Is de kleurcorrectie al gedaan, dan noemt de bouwer dat in het Verloop.
4. Elke `img` heeft:
   - een beschrijvende Nederlandse `alt` die zegt wat er te zien is (soort kledingstuk, print, kleur). Geen verzonnen maat, gewicht of naam van een kind. "Maat 38" mag alleen in de alt als de sticker "38" op de foto zichtbaar is;
   - `width` en `height` gelijk aan de werkelijke maat van het bestand;
   - `decoding="async"`;
   - `loading="lazy"` als de foto bij het openen niet in beeld staat.
5. De tijdelijke foto `p-broekje-kleur.jpg` staat niet meer in 001 Maatwerk. Het commentaar "LET OP: tijdelijke foto" is weg. Het bestand zelf blijft (het wordt elders gebruikt).
6. `og:image` van `prematuurkleding.html` wijst naar een van de nieuwe prematuurfoto's.

### B. Pagina
7. De volgorde blijft: paginakop met Cariens quote, 001 Maatwerk, dan de prijs, Zo werkt het en Contact. Komt er een nieuwe sectie voor de extra foto's, dan:
   - lopen de nummers zonder gat door (`001 —`, `002 —` …);
   - heeft elke sectie een `data-label` met hetzelfde nummer en dezelfde naam als het zichtbare label;
   - werken de ankers `#maatwerk`, `#prijs`, `#zo-werkt-het` en `#contact` nog.
8. Op 390 × 844 staat de eerste prematuurfoto na hooguit één keer scrollen (≤ 844 px) volledig in beeld. Dat volgt de productpaginaregel in `CLAUDE.md`.
9. De pagina blijft compact:
   - nergens staat op 390, 768 of 1440 px een scherm zonder inhoud (geen leeg vlak hoger dan 50 % van het scherm);
   - geen kop staat over een foto, behalve op een donkere foto met sluier;
   - op 360, 390, 768 en 1024 px scrolt de pagina niet horizontaal (`scrollWidth ≤ innerWidth`).
10. Een horizontale fotorij, als de ontwerper daarvoor kiest, is een `.carrousel` volgens de regel in `CLAUDE.md`:
    - scroll-snap en geen zichtbare scrollbalk;
    - `role="region"` met `aria-label` en `tabindex="0"`;
    - knoppen van 44 px alleen met een muis, met `aria-controls` en `aria-disabled` aan begin en eind;
    - Home en End, vegen op touch;
    - geen knoppen en geen tabstop als de rij niet scrolt.
11. Alle contactmomenten blijven pijl-links naar `contact.html?onderwerp=prematuurkleding#formulier`. Er komen geen links naar WhatsApp, telefoon of mail in de inhoud.

### C. Inschuiven bij scrollen
12. De foto's schuiven één keer in beeld als ze in beeld komen. Ze bewegen niet terug bij omhoog scrollen. De beweging wordt gestart door de bestaande IntersectionObserver in `main.js`. Er komt geen tweede scroll-listener of eigen animatiebibliotheek.
13. Bij `prefers-reduced-motion: reduce` staan alle foto's er direct, zonder verschuiving of vervaging.
14. Zonder JavaScript zijn alle foto's direct zichtbaar (geen opacity 0 zonder `.js`).
15. De eerste foto die bij het openen al in beeld is (LCP-kandidaat) schuift niet in. Die heeft `fetchpriority="high"` en geen `loading="lazy"`.
16. De beweging veroorzaakt geen verschuiving van de layout (CLS ≤ 0,1 op `prematuurkleding.html`). Gebruik alleen `transform`, `translate`, `opacity` of `clip-path`.
17. Andere pagina's bewegen precies als nu. Wordt de gedeelde logica in `main.js` of `style.css` uitgebreid, dan blijven de bestaande selectors en hun gedrag gelijk. De visuele basisschermen van andere pagina's wijken niet af.

### D. Tests, controle en documentatie
18. **E2e:** een nieuwe spec (bijv. `tests/e2e/prematuur-fotos.spec.js`) draait in de projecten desktop, tablet, mobiel en WebKit en toetst:
    - criteria 4, 5, 7, 8, 9, 13, 14 en 15;
    - criterium 10 als er een carrousel is.
    Bestaande tests worden niet versoepeld.
19. **Sitecontrole:** `scripts/controleer.py` geeft geen fouten. Verwijzen bestaande controles naar `p-broekje-kleur.jpg` op deze pagina, dan volgen ze de nieuwe foto. De bouwer noemt dat in het Verloop.
20. **Visueel:** de basisschermen wijken alleen af voor `prematuurkleding` (desktop, tablet, mobiel). Ze worden bijgewerkt via `visueel-basis.yml`.
21. **`CLAUDE.md`:** de bouwer werkt bij, met een verwijzing naar deze brief:
    - bij Mappen de regel `prematuurkleding.html`;
    - bij de ontwerpregel "Productpagina's Prematuurkleding en Babynest" het patroon voor de foto's en het inschuiven;
    - bij `assets/js/main.js` het inschuiven, als dat nieuw is.
22. **`docs/fotolijst.md`:** opname 13 ("Prematuurkleding naast een gewoon maatje 50") blijft open. Deze foto's lossen die wens niet op.
23. `npm run check` is groen: tests, sitecontrole, axe zonder nieuwe fouten op `prematuurkleding.html`, SEO, veiligheid, Lighthouse (LCP en CLS binnen de grenzen), visueel en het validatierapport.

## Ontwerprichting
*Nog in te vullen door website-ontwerper. De planner zet de tekst hier letterlijk neer. Vragen om te beantwoorden:*

1. **Aantal foto's.** Hoeveel foto's komen er op de pagina? Welke uit de selectie hierboven, in welke volgorde en met welke uitsnede (staand, liggend, vierkant)? Mogen `kleding-2` (rek recht van voren) en `web/prematuur-hangers.jpg` allebei, of lijken ze te veel op elkaar?
2. **"Slide-in zoals Stock".** Welk gedrag van Stock bedoelen we precies?
   - inschuiven van opzij (x), van onder (y) of een masker dat opent (`clip-path`);
   - met of zonder parallax binnenin de foto (zoals Stock, top −25 %, hoogte 120 %);
   - duur, easing en vertraging tussen foto's.

   Is er een nieuwe meting op stockdutchdesign.com nodig, vast te leggen in `docs/ontwerp/bron/`? Hoe verhoudt dit zich tot de bestaande `.opkomen` (y 28 px) en `img.zoom` (scale 1,12)? Breiden we die uit met een variant, of komt er een nieuwe klasse?
3. **Opbouw.** Wat past het best bij de productpaginaregel (compact, voorbeeldfoto direct na de kop)?
   - (a) een fotorij als `.carrousel`;
   - (b) een vaste rij of raster dat bij scrollen per foto inschuift;
   - (c) foto's verspreid door 001 Maatwerk (bijv. een grote en een kleine foto, editorial);
   - (d) iets anders.

   Komt er een eigen sectie (bijv. "002 — Voorbeelden", waardoor Prijs 003 wordt), of blijft alles in 001 Maatwerk?
4. **Mobiel (390 px).** Hoe staan de foto's op mobiel? Onder elkaar, een veegrij met een stukje van de volgende of een kleiner raster? Hoeveel scrollhoogte mogen ze innemen zonder dat Prijs en Zo werkt het te ver wegzakken? Schuift er op touch iets in, of alleen opkomen?
5. **Achtergrond en kleur.** Op welke paletkleur staan de foto's: salie zoals 001 nu, wit of een andere lichte tint? Hoe gaan we om met het verschil tussen de rekfoto's (warm, met diepte) en de platte telefoonfoto's (koel wit)? Alleen kleurcorrectie, of een vast vlak eromheen?
6. **Maatsticker.** Op `plat-20` en `plat-30` zit een sticker "38" in de hals. Laten we die staan (het laat zien dat het prematuurmaat is) of snijden we hem weg?
7. **Ontwerpcriteria.** Graag toetsbare criteria voor de ontwerpgate: maten per breakpoint, randen ten opzichte van `.wrap`, de positie van de eerste foto op 390 × 844, en de beweging (start, eind, duur).

## Bestanden
- `public/prematuurkleding.html`: foto's in 001 (en eventueel een nieuwe sectie), `og:image`, nummering en `data-label` als er een sectie bijkomt
- `public/assets/img/`: nieuwe webversies van de prematuurfoto's (nieuwe namen)
- `public/assets/css/style.css`: opmaak van de foto's en de inschuifvariant (zo lokaal mogelijk)
- `public/assets/js/main.js`: alleen als de inschuifvariant niet met de bestaande observer en klassen kan; de bestaande selectors blijven gelijk
- `tests/e2e/prematuur-fotos.spec.js` (nieuw), en waar nodig de verwachte waarden in bestaande specs
- `scripts/controleer.py`: alleen als een controle naar de oude foto verwijst
- `tests/e2e/basis/`: via `visueel-basis.yml`
- `CLAUDE.md`

## Buiten scope
- De Babynest-pagina en het Media-overzicht (eigen branch `wijziging/babynest-media-en-logo`). Niets daaruit kopiëren.
- Nieuwe teksten op `prematuurkleding.html`, behalve labels voor een eventuele nieuwe sectie en alt-teksten. De quote, de introzin en de prijszin blijven zoals ze zijn.
- Een prijsrichtlijn voor prematuurkleding. Die is er nog niet; de neutrale zin blijft.
- Foto's op andere pagina's (Inspiratie, homepage-drieluik) vervangen of aanvullen. Dat kan later in een eigen wijziging.
- Het formulier, `src/`, `wrangler.jsonc`, `_redirects`, `_headers` en `.github/workflows/`.
- `docs/fotolijst.md` opname 13 (prematuur naast maatje 50): blijft een open wens.
- Originelen committen. Ze blijven buiten de repo.

## Open vragen
**Blokkerend voor het bouwen:**
1. **Ontwerprichting.** De vragen 1–7 hierboven moet de website-ontwerper eerst beantwoorden. Zonder die antwoorden ligt niet vast hoeveel foto's er komen, welke opbouw de pagina krijgt, wat er op mobiel gebeurt en hoe het inschuiven werkt.
2. **Toestemming en selectie bij Carien.** Is het goed dat deze foto's (vooral de telefoonfoto's `plat-*`, die mogelijk al op Instagram of de oude site stonden) op de site komen? Laten ze allemaal prematuur- of couveusekleding zien? Bij `plat-1`, `plat-10`, `plat-65` en de rekfoto's is de maat niet te zien. Een alt-tekst noemt alleen "couveuse" of "prematuur" als Carien of Carst bevestigt dat het om prematuurmaten gaat. Anders wordt het "babysetje".

**Niet blokkerend:**
3. **Rest van de bronmappen.** Een groot deel van `carien-plat-12nov/` (64 van de 71), `carien-extra-12nov/` (20 van de 24) en `carien-12nov/` (35 van de 37) is niet bekeken. Heeft de ontwerper meer foto's nodig, dan selecteert de bouwer daar verder en noemt hij de namen in het Verloop.
4. **Issuenummer.** Er is geen issuenummer bekend voor Story 8. Als er een issue is, komt `Closes #<nummer>` in de pull request. Anders verwijst de pull request naar Story 8 (Carst, 12 nov.).
5. **Mediamap.** De originelen staan alleen in een tijdelijke scratchpad. Iemand moet ze in de mediamap buiten de site bewaren voordat die map wordt gewist.
6. **Samenloop.** De babynest-PR en dit werk raken allebei `style.css` en mogelijk `main.js`. Wie het laatst merget, rebaset. Bij een conflict blijven beide patronen naast elkaar bestaan.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit Story 8 (Carst, 12 nov.). Bronmappen bekeken: `carien-kleding-12nov/` helemaal (behalve `kleding-hangers-sfeer`), `carien-plat-12nov/` 7 van 71, `carien-extra-12nov/` 4 van 24, `carien-12nov/` 2 van 37. Geselecteerd: `web/prematuur-hangers(-800).jpg`, `kleding-1/2/3/6/9/10`, `plat-1/10/20/30/65`. `kleding-4` en `-5` zijn dubbel. Ontwerprichting open met zeven vragen voor website-ontwerper. Risico midden (gedeelde `main.js`/`style.css`). Blokkerend: Ontwerprichting en bevestiging van Carien/Carst dat de foto's prematuurkleding tonen |
| Bouwen | website-bouwer | 001: G (`prematuur-regenboog-setje`) vervangt het broekje (LET OP weg, bestand blijft), `og:image` naar G. Nieuwe sectie 003 Voorbeelden (perzik, `id="voorbeelden"`) met B, K, A, I, H, J, F, C in het 12-kolomsraster (mobiel paren); Zo werkt het 004, Contact 005, ankers gelijk. `.inschuif` (clip-path + foto, 1,2 s) wordt in `main.js` gezet en gestart door de bestaande observer `io`; `.opkomen`/`img.zoom` ongewijzigd; geen `.js` of "minder beweging": direct zichtbaar. **Foto's:** negen webversies (max. 1400 px, JPEG 80, -800/-600), alleen bijsnijden, schalen en een gain per kanaal. Rand (3 %) gemeten: R − B +13,2 t/m +14,5 (spreiding 003 ≤ 0,4); helderheid platte foto's 237–238. `web/prematuur-hangers.jpg` was niet gecorrigeerd (R − B +2,6): A is opnieuw gemaakt uit de bron `kleding-hangers-sfeer.jpg` (zelfde opname). **Afwijking G:** 2:3 op volle breedte (1582 × 2373) snijdt mutsje of broekspijpen af (setje loopt van y 110 tot 2534); daarom 1582 × 2480 → 893 × 1400 (ca. 2:3,1), desktop max. 446 × 700 (nooit vergroot bij DPR 2). Sticker 38 staat; "maat 38" alleen in de alt van I. **Tests:** nieuwe `tests/e2e/prematuur-fotos.spec.js` (criteria 4–9, 11–16; OC1–OC9, OC11, OC12). Volgt uit het besluit (geen versoepeling): `controleer.py` verwacht nu de nieuwe foto, de labels 003 Voorbeelden / 004 / 005 en op Prematuurkleding een alt die prematuurkleding noemt (Babynest blijft zonder); de controle "LET OP tijdelijke foto" is omgedraaid (moet weg zijn). Geen bestaande Playwright-spec controleerde de oude labels. **Uitkomst:** `npm test` groen; `controleer.py` "Geen fouten gevonden"; Playwright Chromium (desktop/tablet/mobiel, 2 workers, eigen poort) 341 groen, 1 rood door timing (`kernpaden` noodrem-intro op de homepage, 3202 ms), los 3 × herhaald groen. Lokaal niet te draaien: de axe-specs en Lighthouse (`@axe-core/playwright` en `@lhci/cli` niet geïnstalleerd, npm-register geblokkeerd), visueel (geen basisschermen lokaal); `npm run check` dus niet volledig lokaal, CI moet gate 1/2/4/5 bevestigen. Visueel verwacht: alleen `prematuurkleding` wijkt af (bedoeld). `CLAUDE.md` (criterium 21) niet aangepast door de bouwer: open voor de hoofdsessie |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluit Carst (14 nov., keuzevraag in de chat, met contactvel A–K)
Alle geselecteerde foto's A–K zijn prematuur-/couveusekleding en mogen op de pagina Prematuurkleding: A web/prematuur-hangers.jpg, B kleding-2, C kleding-3, D kleding-6, E kleding-9, F kleding-10, G plat-1, H plat-10, I plat-20, J plat-30, K plat-65. Alt-teksten mogen "couveuse-" of "prematuurkleding" noemen (zonder verzonnen maat). Open vraag 2 is daarmee beantwoord.


## Ontwerprichting (website-ontwerper, 14 nov.; vervangt de lege sectie hierboven)


**Over "zoals Stock".** Stockdutchdesign.com was niet bereikbaar, dus er is geen nieuwe meting gedaan. Het inschuiven is gebaseerd op twee metingen die al in `docs/ontwerp/bron/` staan:
- het masker uit het drieluik: masker −101 % → 0, foto zoomt van 1,3 naar 1, 1 s, `cubic-bezier(.215,.61,.355,1)` (`stock-analyse-2026-11-06.md` §2, op de site al als `.kern-beeld`);
- de verspringende fotolijst van Projecten, met een ritme in posities (`stock-analyse-paginas-2026-11-02.md`, Projecten).

De parallax die blijft meelopen in de foto (top −25 %, hoogte 120 %) nemen we niet over. Die heeft een scroll-listener nodig, en criterium 12 sluit dat uit. Wil Carst het precies zoals Stock, dan is dat een aparte meting en een aparte wijziging.

1. **Foto's en volgorde: 9 van de 11 bevestigde foto's.**
   - **001 Maatwerk:** G (`plat-1`, het regenboogsetje met de bordeauxrode broek). Dit vervangt het broekje. De foto is staand **2:3**, met een eigen variant van `.categorie-foto`, alleen op deze pagina. Bovenaan valt ca. 2 % weg, onderaan ca. 6 %. Mutsje en broekspijpen blijven helemaal in beeld. In 3:4 zouden ze worden afgesneden. G schuift niet in (LCP, criterium 15).
   - **Nieuwe sectie `003 — Voorbeelden`** (`id="voorbeelden"`), in deze volgorde:
     1. B `kleding-2`, rek recht van voren, liggend 4:3, hele beeld;
     2. K `plat-65`, staand 3:4: de donkere rand links en boven wegsnijden, de lege ruimte onder de legging inkorten;
     3. A `web/prematuur-hangers`, liggend 16:9 zoals hij is;
     4. I `plat-20`, vierkant 1:1: mutsje, shirt, strik en sticker helemaal in beeld;
     5. H `plat-10`, vierkant 1:1;
     6. J `plat-30`, staand 3:4, met de korenaar;
     7. F `kleding-10`, liggend 4:3;
     8. C `kleding-3`, liggend 4:3: snijden rond de strik en het LUX-label.
   - **Weg:** D `kleding-6` is bijna dezelfde opname als A (zelfde setjes, zelfde hoek). E `kleding-9` is bijna dezelfde opname als F (zelfde lichtblauwe mutsje met label). Beide mogen volgens het besluit van Carst, maar ze laten hetzelfde kledingstuk dan twee keer zien in één blik.
   - **B en A mogen allebei.** B toont vier verschillende setjes aan het rek, A is een close-up van wikkelshirtjes met mutsjes. Ze staan niet naast elkaar.
   - A en C laten hetzelfde wilgenkatjesshirt zien. Ze staan in verschillende rijen, nooit naast elkaar.

2. **Opbouw.** Volgorde van de pagina:
   - paginakop;
   - 001 Maatwerk (foto G);
   - 002 Prijs (ongewijzigd, blijft 002);
   - **003 Voorbeelden** (nieuw);
   - 004 Zo werkt het (was 003);
   - 005 Contact (was 004).

   Zo blijft "wat is het en wat kost het" bovenaan. Wie meer wil zien, scrolt door naar de voorbeelden. De ankers veranderen niet.

   003 is een **vast, verspringend fotoraster (optie b/c), geen carrousel.** Foto's achter een veegrij verstoppen past niet bij "meer foto's die inschuiven". Daarom geldt criterium 10 niet.

   Opbouw van de sectie:
   - het label `003 — Voorbeelden` in inkt;
   - de acht foto's als `figure` (zonder bijschrift, geen links, geen lightbox, niets dat alleen bij aanwijzen verschijnt);
   - één pijl-link "Bespreek je idee" → `contact.html?onderwerp=prematuurkleding#formulier`. Dit is bestaande tekst; die link komt op via de bestaande `.opkomen`.
   - `data-label="<span>003 —</span> Voorbeelden"`.
   - Er komt geen nieuwe tekst bij.

   **Vanaf 761 px:** een raster van 12 kolommen binnen `.wrap`, met een kolomgat van 16 px (tablet 12 px) en een rijgat van 96 px (tablet 56 px):

   | Rij | Foto | Kolommen | Verschuiving omlaag |
   |---|---|---|---|
   | 1 | B | 1–7 | – |
   | 1 | K | 9–12 | 96 px (tablet 48 px) |
   | 2 | A | 1–5 | – |
   | 2 | I | 7–9 | 64 px (tablet 32 px) |
   | 2 | H | 10–12 | – |
   | 3 | J | 1–3 | – |
   | 3 | F | 5–9 | – |
   | 3 | C | 10–12 | 128 px (tablet 64 px) |

   De verschuivingen zijn `margin-top` en liggen vast, dus geen CLS. Elke `figure` krijgt `aspect-ratio`, `overflow: hidden` en een foto met `object-fit: cover`.

3. **Inschuiven: een nieuwe klasse, de bestaande blijven zoals ze zijn.**
   - Op elke `figure` in 003 komt `.inschuif`. Deze wordt toegevoegd aan de lijst van de bestaande observer `io` (zelfde `in-beeld`, zelfde rootMargin −8 %, één keer, daarna `unobserve`). Er komt geen nieuwe observer of listener. `.opkomen` en `img.zoom` blijven ongewijzigd.
   - **Begin:** de `figure` heeft `clip-path: inset(100% 0 0 0)`; de `img` heeft `transform: translateY(10%) scale(1.12)`.
   - **Eind** (`.in-beeld`): `clip-path: inset(0)`; de `img` heeft `transform: none`.
   - **Beweging:** beide in **1,2 s**, `cubic-bezier(.215,.61,.355,1)`, dezelfde curve als het drieluik. Het masker gaat van onder naar boven open, mee met de scrollrichting, en de foto glijdt binnen het kader omhoog op zijn plek.
   - **Vertraging** naar plek in de rij: 0 / 0,15 / 0,3 s. Op mobiel krijgt de rechterfoto van een paar 0,15 s.
   - Er komt geen opacity-vervaging: het perzik vlak is het "lege" begin.
   - **Bij `prefers-reduced-motion: reduce` en zonder `.js`:** geen clip-path, geen transform, geen transition. Alles staat er direct. De noodrem in de kop (na 3 s `js` weg) laat de foto's dus ook zien.

4. **Mobiel (≤ 760 px).**
   - Eén kolom binnen de rand van 32 px.
   - B en A over de hele breedte (326 px).
   - De andere foto's in paren van twee kolommen (gat 12 px, elk ca. 157 px): K + I, J + H, F + C. De rechterfoto van elk paar staat 24 px lager.
   - Volgorde: B, K+I, A, J+H, F+C. Rijgat 24 px.
   - Het fotoblok is daarmee ca. 1 080 px hoog, zo'n 1,3 scherm.
   - Op touch schuiven de foto's net zo in. Dat hangt aan het scrollen, niet aan aanwijzen.
   - `srcset` met een `-600`-variant voor de halve tegels en een `-800`-variant voor de hele breedte.

5. **Achtergrond en kleur.**
   - 003 krijgt `data-achtergrond="#DEB799"` (perzik), alle tekst in inkt. De kleuren lopen dan: salie (001) → wit (002) → perzik (003) → grijs (004) → terracotta (005). Geen twee keer dezelfde kleur na elkaar. Op wit zouden de platte foto's tegen de achtergrond wegvallen.
   - Thema's staan nooit op terracotta, en dat geldt hier ook.
   - **Kleur van de foto's:** alleen kleurcorrectie, geen vlak eromheen. Alle negen krijgen de lichte warme correctie van de site.
   - De platte telefoonfoto's (G, H, I, J, K) gaan van koel of puur wit naar gebroken wit. K is grijs en moet ook iets lichter.
   - De rekfoto's (A, B, C, F) worden een paar graden warmer, zonder dat ze lichter worden.
   - `p-broekje-kleur.jpg` is zelf koel. Gebruik die foto niet als voorbeeld.

6. **Maatsticker "38": laten staan, niet wegsnijden of wegretoucheren.** Het is echt en het laat de bezoeker zien hoe klein het is.
   - Bij I is "38" leesbaar. Daar mag "maat 38" in de alt.
   - Bij J is de sticker op webformaat niet leesbaar. Daar komt geen maat in de alt.
   - De uitsnede snijdt de sticker nooit half af.

7. **Ontwerpcriteria:** zie de lijst hieronder (OC1–OC12).

### Ontwerpcriteria (toetsbaar)

- **OC1.** Op 390 × 844 staat foto G (001) na hooguit één keer scrollen helemaal in beeld: onderkant ≤ 1 688 px vanaf de bovenkant van de pagina, hoogte ≤ 844 px. Verwacht: boven ca. 522, onder ca. 1 011. G heeft `fetchpriority="high"`, geen `loading="lazy"` en geen `.inschuif`.
- **OC2.** G toont op 2:3 het hele setje: mutsje, shirt en broek zijn nergens afgesneden. Op 1440 is de foto hooguit 480 × 720 px en past het blok 001 binnen 900 px schermhoogte.
- **OC3.** Op de pagina staan precies negen nieuwe prematuurfoto's (G plus acht in 003), in de volgorde van punt 1. D en E staan niet op de pagina. A en C staan niet naast elkaar.
- **OC4.** Hoogte van het fotoblok in 003 (van de eerste tot de laatste `figure`):
  - ≤ 1 650 px op 1440 × 900;
  - ≤ 950 px op 768 × 1024;
  - ≤ 1 150 px op 390 × 844.

  Geen leeg vlak hoger dan 50 % van het scherm, ook niet tijdens het inschuiven (de kaders hebben hun hoogte vooraf).
- **OC5.** Plaats in het raster:
  - vanaf 761 px de kolommen en verschuivingen uit de tabel in punt 2;
  - op ≤ 760 px B en A even breed als `.wrap` min de randen (326 px op 390), de paren elk (wrap − 12 px) / 2;
  - geen enkele foto smaller dan 150 px op 768;
  - de linkerrand van de eerste kolom valt samen met de linkerrand van het label `003 —` (verschil ≤ 1 px).
- **OC6.** Inschuiven met `.js` en zonder "minder beweging":
  - vóór `in-beeld` heeft de `figure` `clip-path: inset(100% 0 0 0)`;
  - na `in-beeld` heeft hij `inset(0)` en heeft de `img` de transform `none`;
  - de transition-duration is 1,2 s met `cubic-bezier(.215,.61,.355,1)`;
  - de vertraging is 0 / 0,15 / 0,3 s per plek in de rij;
  - bij omhoog scrollen gebeurt er niets (de klasse blijft staan).
- **OC7.** Bij `reducedMotion: 'reduce'` en zonder JavaScript zijn alle acht foto's van 003 direct zichtbaar: clip-path `none` of `inset(0)`, transform `none`, opacity 1.
- **OC8.** Er is geen horizontale scroll op 360, 390, 768 en 1024 px, ook niet tijdens het inschuiven: de `img` met `scale(1.12)` blijft binnen de `figure` met `overflow: hidden`. CLS ≤ 0,1.
- **OC9.** Geen enkele foto wordt groter getoond dan het bestand. De weergavebreedte × DPR 2 is ≤ de breedte van het gekozen `srcset`-bestand. Een `-600`-variant mag op mobiel bij DPR 3 krap zijn, maar wordt dan nooit vergroot boven 1:1 van de grote versie.
- **OC10.** Kleur, gemeten als het gemiddelde van de buitenste 3 % rand van elke webversie:
  - R − B tussen +8 en +20; de huidige site-foto's zitten op +10 tot +30;
  - het verschil in R − B tussen de foto's in 003 is ≤ 12;
  - de achtergrond van de platte foto's (G, H, I, J, K) heeft een helderheid tussen 230 en 246, dus geen puur wit 255 en geen grijs onder 225.
- **OC11.** Het label `003 — Voorbeelden` en de balk tonen hetzelfde nummer en dezelfde naam. Op perzik is alle tekst inkt; wit is daar nergens toegestaan. De pijl-link onder het raster is minstens 44 px hoog en 16 px groot.
- **OC12.** Alt-teksten:
  - ze noemen soort kledingstuk, print en kleur, met "couveuse-" of "prematuurkleding" (besluit Carst);
  - alleen bij I staat "maat 38";
  - nergens een gewicht, een naam van een kind of een andere maat.

---

## Voor de planner (niet in de Ontwerprichting zetten)

- **Volgorde en nummering wijken af van wat de brief verwacht.** Prijs blijft 002, Voorbeelden wordt 003, Zo werkt het 004 en Contact 005. Dat past bij criterium 7. Werk wel de Mappen-regel in `CLAUDE.md` bij, en de verwachte labels in bestaande specs, als die op "003 — Zo werkt het" of "004 — Contact" controleren.
- **De visuele basisschermen moeten met "minder beweging" worden gemaakt** (of na `in-beeld`). Een schermafdruk van de hele pagina zonder scrollen toont anders acht lege perzik kaders. Dat risico bestaat nu ook al bij `img.zoom`.
- **Open vraag 3 van de brief is daarmee opgelost.** Ik heb aan de negen foto's genoeg; de rest van de bronmappen hoeft niet bekeken te worden.

Mijn eigen contactvellen staan in `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/ontwerp-blik/` (`rek.jpg`, `plat.jpg`). Ze zijn alleen ter vergelijking; de originelen staan op de plek die de brief noemt.