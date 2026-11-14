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
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluit Carst (14 nov., keuzevraag in de chat, met contactvel A–K)
Alle geselecteerde foto's A–K zijn prematuur-/couveusekleding en mogen op de pagina Prematuurkleding: A web/prematuur-hangers.jpg, B kleding-2, C kleding-3, D kleding-6, E kleding-9, F kleding-10, G plat-1, H plat-10, I plat-20, J plat-30, K plat-65. Alt-teksten mogen "couveuse-" of "prematuurkleding" noemen (zonder verzonnen maat). Open vraag 2 is daarmee beantwoord.
