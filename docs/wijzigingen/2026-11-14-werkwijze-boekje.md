# Werkwijze: 001 Het atelier als eigen atelierboekje

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst. Story 7 (feedback 12 nov.): "Werkwijze text like magazines". Op de keuzevraag koos hij "eigen atelierboekje" met de atelierfoto's.
- **Branch:** `wijziging/werkwijze-boekje`, vanaf `origin/main`
- **Issue:** Story 7. Het issuenummer is niet bekend. Is er een issue, dan komt `Closes #<nummer>` in de pull request.
- **Afhankelijkheid:** pas **beginnen met bouwen nadat de pull request van `wijziging/babynest-media-en-logo` is gemerged** (brief 2026-11-14-babynest-media-en-logo). Daarna rebaset deze branch op `main`. Het boek, de kaft en het openslaan bij scrollen komen uit die branch. Dit boekje gebruikt ze en maakt ze geen tweede keer (zie criterium 9–11).
- **Risico:** midden. Formulier, `_redirects`, `wrangler.jsonc` en `.github/workflows/` worden niet geraakt. Midden omdat:
  - de code van het boek in `main.js` (§5f, nu alleen voor Babynest) algemener moet worden. Een fout daar raakt Babynest;
  - de atelierfoto's Carien herkenbaar laten zien en er privégegevens in beeld staan (zie criterium 4).

## Doel
Op Werkwijze leest de bezoeker het verhaal van Carien als een klein boekje van het atelier: een eigen kaft "LUX mini · Atelier" die opengaat, met haar bestaande verhaal in magazine-opmaak en echte foto's van Carien aan het werk. Het voelt persoonlijk en gemaakt, maar het doet nooit alsof er een tijdschrift of de pers over haar schrijft.

## Wat er nu staat (`public/werkwijze.html`, r. 123–143)
- `section#atelier.op-wit.atelier`, `data-label="<span>001 —</span> Het atelier"`.
- Tekst links: één alinea `.verhaal` (Cariens verhaal, ca. 60 woorden) en de quote `.quote` "Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken." Beide zijn goedgekeurd (Carst, 14 nov., brief 2026-11-14-goedkeuringen-teksten) en komen van de oude site.
- Rechts de fotorij `#fotorij.carrousel` met vijf foto's (`over-werkplek`, `over-naaimachine`, `pers-klaar`, `pers-stoffen`, `over-verzending`) en knoppen.
- Opmaak: `style.css` r. 928–947.
- Ernaar linken: het menu ("Het atelier" → `werkwijze.html#atelier`) en de homepage ("Over Carien" → `werkwijze.html#atelier`).

## Nieuwe foto's (Carien, 12 nov.)
Bron: `/tmp/claude-0/-home-claude/d4af4dd4-d393-563f-96ff-bcef27cbdbce/scratchpad/carien-atelier-12nov/atelier-1..8.jpg` (2576 × 2061 of 2061 × 2576, al warm van toon). Bekeken door de planner:

| Bestand | Wat je ziet | Advies planner | Voorgestelde webnaam |
|---|---|---|---|
| atelier-8 | Carien aan de lockmachine met een badstof stuk met het LUX-label, staand | **kiezen** (kaft of eerste bladzijde: het label is LUX mini zelf) | `atelier-carien-label.jpg` |
| atelier-7 | Carien werkt een badstof stuk met de hand af naast de lockmachine, staand | **kiezen** | `atelier-carien-afwerken.jpg` |
| atelier-6 | Carien van bovenaf, afwerken aan tafel, snijmat op de achtergrond, staand | **kiezen** (detail) | `atelier-carien-detail.jpg` |
| atelier-3 | Carien bij de borduurmachine met een rol vlies, liggend | **kiezen** (de enige liggende) | `atelier-borduurmachine-vlies.jpg` |
| atelier-4 | Carien bedient het scherm van de borduurmachine, staand | **kiezen** | `atelier-borduurmachine-scherm.jpg` |
| atelier-5 | Lijkt hetzelfde beeld als atelier-4 | niet gebruiken (dubbel) | — |
| atelier-1 | Carien bij de borduurmachine, heel de hoek. Op het bureau ligt een **betalingsbericht** met gegevens, aan de wand een ingelijste tekst van een club | niet gebruiken, of alleen bijsnijden zonder bureau en wand | — |
| atelier-2 | Zelfde hoek, staand. Ook het **betalingsbericht**, de ingelijste tekst en een arm van een ander persoon op de voorgrond | niet gebruiken | — |

De keuze en de volgorde zijn een voorstel. De ontwerper beslist (vraag O1).

## Acceptatiecriteria

### A. Inhoud: alleen bestaande tekst
1. In 001 staat alleen tekst die nu al op `werkwijze.html` staat: de alinea van `.verhaal` en de quote. Die tekst blijft woord voor woord gelijk. Hij mag wel in delen over de bladzijden verdeeld worden, op een zinsgrens. Er komen geen nieuwe zinnen, onderschriften, citaten, jaartallen, cijfers of koppen bij, behalve:
   - de kafttitel "LUX mini · Atelier" (opdracht Carst);
   - het bestaande label "001 — Het atelier".

   Wil de ontwerper onderschriften bij de foto's, dan is dat open vraag B1 en worden ze niet verzonnen.
2. De pull-quote (als die er komt) is letterlijk de bestaande quote van Carien. De quote komt maar één keer voor in 001. Gebruik je hem als pull-quote, dan staat hij niet nog eens als losse alinea.
3. **Geen nep-magazine.** Nergens in 001 staat iets wat persaandacht of een bestaand tijdschrift suggereert: geen editienummer, datum of prijs op de kaft, geen barcode, geen "interview", "uit de pers", "zoals gezien in" of de naam van een redactie of journalist. Het boekje is herkenbaar van LUX mini zelf: het eigen logo of de naam "LUX mini" op de kaft, en de letters en kleuren van de site.

### B. Foto's
4. De gekozen foto's komen als webversie in `public/assets/img/`:
   - max. 1400 px aan de lange zijde, JPEG kwaliteit 80;
   - dezelfde lichte warme kleurcorrectie als de andere atelierfoto's;
   - een nieuwe bestandsnaam in kleine letters met streepjes;
   - **zonder EXIF-gegevens** (geen GPS, geen toestel).

   Het betalingsbericht, de ingelijste clubtekst en andere personen zijn op geen enkele webversie te zien of te lezen. De originelen worden niet gecommit.
5. Elke foto heeft `width` en `height`, een eigen beschrijvende `alt` die op de pagina niet nog eens voorkomt, en `loading="lazy"` als hij onder de vouw staat. Elke foto wordt maar één keer voorgelezen (verborgen kopieën of de achterkant van de kaft krijgen `alt=""`).
6. Geen foto wordt groter getoond dan zijn bestand. Wordt een foto breder dan 800 px getoond, dan heeft hij een `srcset` met kleinere versies (zoals `over-carien`).

### C. Opbouw en gedrag
7. `section#atelier` blijft bestaan, met hetzelfde `id`, `data-label="<span>001 —</span> Het atelier"` en het zichtbare label. De ankers vanuit het menu en de homepage landen op 001 onder de vaste balk. 002 Hoe ik werk, 003 Personaliseren, 004 Contact en de kopfoto veranderen niet.
8. Het boekje heeft een kaft met "LUX mini · Atelier" die opengaat bij scrollen. Binnen staan Cariens verhaal en de foto's in magazine-opmaak. De precieze opbouw komt uit de ontwerprichting (vragen O2–O5). De bouwer vult daarna de criteria hieronder aan met de toetsbare ontwerpcriteria van de ontwerper.
9. **Geen tweede boek.** Kaft, bladzijden en openslaan gebruiken dezelfde klassen en dezelfde code als Babynest (`.papier`, `.blad`, `.kaft`, `.kaft-voor`, `.kaft-achter`, `.kaft-strook` en het openslaan in `main.js` §5f, met `--open`). Er komt geen kopie van die CSS of JS met een andere naam. Moet die code algemener worden (bijvoorbeeld meer bladzijden, een kaft zonder het babynest-raster `.media-rij`, of een selector die niet aan `.media` vastzit), dan:
   - wordt de bestaande code aangepast;
   - blijft het gedrag op `babynest.html` precies hetzelfde. `tests/e2e/babynest-media.spec.js` blijft groen zonder dat er een verwachte waarde verandert, en de visuele basis van Babynest verandert niet.
10. Bij minder beweging en zonder JavaScript staat het boekje open (op mobiel de binnenpagina's onder elkaar). Alle tekst en alle foto's zijn dan zichtbaar en leesbaar, zoals bij Babynest. De tekst hangt nooit af van het openslaan: het verhaal is in de HTML gewone tekst in leesvolgorde, ook voor schermlezers.
11. Op touch scrolt de pagina gewoon (geen vastzetten op mobiel en tablet, geen scroll-jacking). Op desktop staat hooguit één schermhoogte vast, zoals bij Babynest. In een schermafdruk tijdens het scrollen is geen enkel scherm leeg.
12. Blijft er een horizontale fotorij, dan blijft die een `.carrousel` volgens de regel in `CLAUDE.md` (role, aria-label, tabindex, knoppen alleen met een muis, Home/End, geen scrollbalk). Verdwijnt de fotorij, dan blijft er geen dode `#fotorij`-code of knop achter. Dan wordt de carrouselregel in `CLAUDE.md` bijgewerkt, want die noemt "de fotorij op Werkwijze".

### D. Leesbaarheid, mobiel en kleur
13. De lopende tekst is ≥ 17 px (mobiel) / 18 px (desktop), met regels van hooguit 75 tekens per kolom. In kolommen loopt de tekst nooit door naar een kolom die buiten beeld valt. Een initiaal (als die er komt) is decoratief: schermlezers lezen het woord gewoon in één keer (geen losse letter, geen `aria-hidden` op een deel van het woord).
14. Op 390 × 844 en 768 × 1024 is er geen horizontaal scrollen (`scrollWidth === innerWidth`), ook niet halverwege het openslaan van de kaft (Chromium en WebKit). Op 390 px staat de tekst in één kolom, binnen de zijmarge van 32 px. Er staat nooit tekst over een foto, behalve wit op een donkere sluier van minstens 4,5:1 (kleine tekst) of 3:1 (≥ 24 px).
15. Kleuren volgen `CLAUDE.md`: geen witte tekst op lichte paletkleuren, kleine tekst op de kaft haalt 4,5:1, en het boekje staat niet op terracotta, tenzij de ontwerper dat met een wit/inkt-controle onderbouwt. axe meldt op `werkwijze.html` geen fouten.

### E. Tests, sitecontrole en CLAUDE.md
16. Er komt een nieuwe e2e-spec, bijvoorbeeld `tests/e2e/werkwijze-boekje.spec.js`, voor desktop, tablet, mobiel en WebKit. Die toetst:
    - criterium 1–3: de tekst van 001 is gelijk aan de huidige tekst, met de witruimte genormaliseerd, en er staan geen verboden woorden uit criterium 3 in;
    - criterium 5: alt-teksten uniek en niet leeg;
    - criterium 7: `#atelier` en `data-label`, en het anker landt onder de balk;
    - criterium 10: open bij minder beweging en zonder JS;
    - criterium 14: geen horizontaal scrollen;
    - criterium 4: de nieuwe webversies hebben geen EXIF/GPS. Dit mag ook in `controleer.py`.
17. `scripts/controleer.py`: controles die de oude opbouw van 001 of de vijf fotorij-foto's toetsen, gaan naar de nieuwe opbouw. Ze worden niet losser dan nu.
18. Bestaande tests, grenzen en axe-regels worden niet versoepeld. De visuele basis van `werkwijze.html` verandert (bedoeld), via `visueel-basis.yml`. Die van `babynest.html` verandert niet (criterium 9).
19. In `CLAUDE.md` worden bijgewerkt:
    - de mapregel van `werkwijze.html` ("001 Het atelier (atelierboekje …)");
    - zo nodig de carrouselregel;
    - een korte ontwerpregel voor het atelierboekje, met de verwijzing naar deze brief en "nooit persaandacht of een bestaand tijdschrift suggereren".
20. `npm run check` is groen.

## Ontwerprichting
*Leeg: in te vullen door website-ontwerper (letterlijk overnemen in de brief, met toetsbare ontwerpcriteria). Vragen:*

- **O1 · Foto's.** Welke van de vijf voorgestelde foto's (8, 7, 6, 3, 4) gebruik je, in welke volgorde en met welke uitsnede? Welke komt op de kaft? Blijven de vijf huidige fotorij-foto's (werkplek, naaimachine, kast, stoffen, verzending) erbij, gaan ze weg, of gaan er een paar het boekje in? Blijft er een `.carrousel` onder het boekje?
- **O2 · Opbouw.** Eén kaft en één open spread, zoals Babynest (de tekst links en de foto rechts in het boek), of meerdere spreads die je bij scrollen omslaat? Let op: er is maar één alinea van ca. 60 woorden plus één quote. Meer spreads betekent veel foto en weinig tekst. Staat de tekst ín het boek (op de bladzijden van hooguit 384 px) of naast het boek, zoals het tekstblok bij Babynest?
- **O3 · Magazine-typografie.** Kolommen: hoeveel, en vanaf welke breedte? Bij 60 woorden zijn twee kolommen op een bladzijde van 384 px te smal. Initiaal: ja of nee? Welke letter, hoeveel regels hoog, en hoe blijft het woord voorleesbaar? Pull-quote: de bestaande quote in Libre Caslon Display, in welke maat, en waar ten opzichte van de foto's? Mag er een dunne regel of een kleine kapitaal-regel bij (`.caps`), zonder nieuwe tekst?
- **O4 · Kaft.** Hoe ziet "LUX mini · Atelier" eruit (logo of letters, op een foto of op papier, `.kaft-strook` of iets anders), zonder dat het op een tijdschrift met masthead lijkt? Hoe houd je het verschil met het lookbook op Babynest ("LUX mini" / "Lookbook · Babynest") duidelijk, maar wel als familie?
- **O5 · Mobiel en tablet.** Volgorde (label, kaft/object, tekst, foto's), het openslaan zoals bij Babynest (kaft weg bij 90°) of direct open, en de maten op 390 en 768 px. Hoe staat een staande foto naast de tekst op tablet?
- **O6 · Kleur en balk.** Op welke ondergrond staat 001: wit zoals nu (`.op-wit`) of een eigen `data-achtergrond` uit het palet? Wat betekent dat voor het logo in de balk?
- **O7 · Beweging.** Inschuiven en openslaan net als Babynest (zelfde tijden en curve), of rustiger, omdat dit een leespagina is? De tekstregels één voor één, ja of nee?

## Bestanden
- `public/werkwijze.html`: alleen `section#atelier`
- `public/assets/css/style.css`: `.atelier*` / `.fotorij*` (r. 928–947) en waar nodig een algemener boek (`.papier`, `.blad`, `.kaft*`), zonder Babynest te veranderen
- `public/assets/js/main.js`: §5f algemener (openslaan niet alleen voor `main .media`), zonder kopie
- `public/assets/img/`: de gekozen webversies (namen zie tabel)
- `tests/e2e/werkwijze-boekje.spec.js` (nieuw); `scripts/controleer.py`; `tests/e2e/basis/` (Werkwijze, via `visueel-basis.yml`)
- `CLAUDE.md`: mapregel Werkwijze, carrouselregel, ontwerpregel atelierboekje

## Buiten scope
- Nieuwe teksten, onderschriften, citaten of een "interview" met Carien.
- De kopfoto, 002 Hoe ik werk, 003 Personaliseren, 004 Contact, `og:image` en de paginatitel/beschrijving.
- Babynest: geen zichtbare verandering. Het logo groot → klein komt uit de babynest-PR en valt hier buiten.
- Formulier, `src/`, `_redirects`, `_headers`, `wrangler.jsonc`, `.github/workflows/`.
- Andere pagina's met foto's van Carien (homepage, contact) bijwerken met de nieuwe foto's. Dat kan later in een eigen brief.

## Open vragen
**Blokkerend**
1. **Babynest-PR eerst.** Bouwen begint pas na de merge van `wijziging/babynest-media-en-logo`. Het nummer van die pull request is niet bekend. Wordt die PR afgewezen of sterk veranderd, dan moet deze brief opnieuw bekeken worden: dan is er geen gedeeld boek om op aan te sluiten.
2. **Ontwerprichting O1–O7.** Zonder die antwoorden kan de bouwer criterium 8 niet uitwerken.
3. **Weinig tekst voor een magazine.** Er is één alinea van ca. 60 woorden plus één quote. Kolommen en een initiaal werken pas echt met meer tekst. Er mag niets verzonnen worden. Keuzes voor Carst (via de hoofdsessie):
   - **a.** Het boekje blijft klein (kaft, één spread), met veel beeld en de bestaande tekst. Dit is het voorstel van de planner.
   - **b.** Carien schrijft of keurt zelf extra tekst over haar atelier. Dat wordt dan een aparte stap, en de tekst komt letterlijk in de brief.
   - Teksten van 002 of 003 naar 001 verhuizen is geen optie, want dan veranderen die secties.

**Niet blokkerend**
- **B1 · Onderschriften.** Moeten de foto's onderschriften krijgen (zoals "De stof" bij Babynest)? Alleen als Carst of Carien de tekst geeft. Anders zonder onderschrift.
- **B2 · Toestemming en maker.** Mogen deze foto's online, met Carien herkenbaar in beeld? Moet de fotograaf genoemd worden? De planner gaat ervan uit dat het ja is, omdat Carien ze zelf heeft aangeleverd, maar dat staat nergens vastgelegd.
- **B3 · atelier-1 bijsnijden.** Wil de ontwerper het brede beeld van de hele hoek toch gebruiken, dan moet het bureau met het betalingsbericht en de ingelijste tekst eruit. Blijft er dan genoeg over?
- **B4 · Originelen.** De originelen staan in een tijdelijke scratchpad. Iemand moet ze in de mediamap buiten de site zetten voordat die map wordt gewist.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit Story 7 (feedback Carst 12 nov., keuze "eigen atelierboekje"). Acht foto's bekeken: 8, 7, 6, 3 en 4 voorgesteld, 5 dubbel, 1 en 2 niet gebruiken (betalingsbericht, ingelijste tekst, andere persoon in beeld). Aansluiting op het boek van de babynest-branch (`.papier/.blad/.kaft`, main.js §5f) zonder kopie; bouwen na de merge van die PR. Ontwerprichting leeg met vragen O1–O7 voor website-ontwerper. Risico midden. Blokkerend: babynest-PR, ontwerprichting, weinig tekst |
| Ontwerprichting | website-ontwerper | |
| Bouwen | website-bouwer | |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluit Carst (14 nov., keuzevraag in de chat)
- **Omvang:** klein boekje (optie a): een kaft en één spread met veel beeld, alleen met de bestaande tekst. Open vraag 3 is beantwoord.
- Bouwen start na de merge van de babynest-PR (zie open vraag 1).


## Ontwerprichting (website-ontwerper, 15 nov.; vervangt de lege sectie hierboven)

### Waar de bouwer op moet letten


1. **Een bestaande regel zou 002–004 laten verschuiven.** In `style.css` r. 1797 staat `.media ~ section > .wrap`. Wordt `#atelier` een `.media`, dan verschuift op Werkwijze ook de linkerlijn van 004 Contact (`.wrap`). Dat mag niet volgens criterium 7. Die regel moet alleen voor Babynest gelden, bijvoorbeeld met `.media:not(.boekje) ~ section > .wrap`.
2. **Een tekst naast het boek, geen tekst ín het boek.** Een bladzijde is hooguit 384 × 480 px. Daar passen 60 woorden op 18 px plus de quote maar net in, en op mobiel valt de linkerbladzijde weg. Dan zou de tekst dubbel moeten staan, en dat verbiedt criterium 1 en 2.
3. **Atelier-7 en atelier-3 vallen af.** Atelier-7 lijkt bijna precies op atelier-8, en atelier-3 is liggend terwijl de bladzijden staand zijn. In het boekje passen drie foto's: kaft, links en rechts.




1. **Opbouw: één kaft en één open spread, met de tekst naast het boek (O2).**
   - `section#atelier` krijgt de klassen `op-wit media boekje atelier` en hergebruikt het raster `.media-rij` van Babynest: de tekst in kolom 2 (33,333 %), het boek in kolom 4 (40 %).
   - Het boek is `.boek.papier.obj` met `.blad.blad-rechts`, `.kaft`, `.kaft-voor.boek-kaft`, `.kaft-strook` en `.blad.kaft-achter`. Het opent via §5f. Er komt geen nieuwe CSS- of JS-klasse voor het boek.
   - Alleen deze dingen worden algemener:
     - een `.blad` zonder `figcaption` krijgt een foto die gelijk is aan de rand (top 6 %, hoogte 88 %), dus geen lege strook voor een onderschrift. Gebruik `.blad:not(:has(figcaption)) img` of een modifier. Babynest verandert niet;
     - r. 1797 (`.media ~ section > .wrap`) geldt alleen voor Babynest, zodat 002–004 op Werkwijze niet verschuiven.
   - De tekst staat niet in het boek. Een bladzijde van 384 px is te klein voor 60 woorden op 18 px plus de quote, en op mobiel valt de linkerbladzijde weg.
   - Volgorde in de HTML: label → boek → quote → verhaal. Een pijl-link komt er niet bij (dat zou nieuwe tekst zijn); 004 Contact blijft de volgende stap.

2. **Foto's en kaft (O1, O4).**
   - **Kaft:** `atelier-8` → `atelier-carien-label.jpg`. Onderaan de bestaande `.kaft-strook` met precies "LUX mini · Atelier": 13 px, Libre Caslon Text, kapitalen met .2em spatiëring, inkt op #FBF8F3.
   - Dus wel een boekkaft zoals 001 op Babynest, en geen masthead of foto over de hele kaft zoals het lookbook. Zo hoort het bij dezelfde familie als Babynest, maar lijkt het nooit op een tijdschrift.
   - **Linkerbladzijde** (`.kaft-achter`): `atelier-6` → `atelier-carien-detail.jpg` (handen van bovenaf).
   - **Rechterbladzijde** (`.blad-rechts`): `atelier-4` → `atelier-borduurmachine-scherm.jpg`.
   - Formaat: alle drie 768 × 960 (4:5), zoals de Babynest-foto's. Daarmee is er geen `srcset` nodig, want ze worden nergens breder dan 560 px getoond. Uitsnede:
     - 8 en 6: het hele beeld, verkleind (de verhouding is al 4:5);
     - 4: het hele beeld, met Carien en het scherm in de bovenste helft.
   - Geen onderschriften (B1).
   - Niet gebruiken:
     - `atelier-7` (bijna gelijk aan 8);
     - `atelier-3` (liggend; past niet op een staande bladzijde);
     - 1, 2 en 5.
   - **De fotorij verdwijnt.** Weg gaan:
     - `#fotorij`, de twee `.carrousel-knop` met `aria-controls="fotorij"`;
     - `.fotorij*` en `.atelier-vak`/`.atelier-tekst` in de CSS.

     De carrouselregel in `CLAUDE.md` verliest "de fotorij op Werkwijze". De oude bestanden blijven staan. `over-naaimachine` wordt nog op de homepage gebruikt.

3. **Magazine-typografie (O3), in één kolom op elke breedte (geen `column-count`).**
   - **Pull-quote als opener:** de bestaande quote staat direct onder het boek of het label, één keer, als `p.quote` (of `blockquote` zonder bron).
     - Libre Caslon Display, `clamp(28px, 2.4vw, 36px)`, regelafstand 1,25, inkt.
     - Erboven en eronder een lijn van 1 px inkt, met 20 px ruimte tot de tekst.
     - Er komt geen naam bij.
   - **Verhaal:** de hele alinea `.verhaal`, woord voor woord gelijk: 18 px (tablet en desktop) en 17 px (≤ 760 px), regelafstand 1,7, `max-width: 60ch`, 28 px onder de quote.
   - **Initiaal:** alleen via `.verhaal::first-letter`: Libre Caslon Display, inkt, drie regels hoog. De bovenkant valt gelijk met de hoofdletterhoogte van regel 1, de onderkant met de basislijn van regel 3, en er zit 10 px ruimte rechts van de letter.
     - Gebruik `initial-letter: 3` (met `-webkit-`), met als terugval `float` en `font-size` van ca. 5,2em en `line-height: .8`.
     - In de HTML komt geen `span` en geen `aria-hidden`. "Ik" blijft één woord voor schermlezers.
     - Geen terracotta: dat haalt op salie maar 1,9:1.

4. **Kleur en balk (O6).**
   - 001 krijgt `data-achtergrond="#C3CFBC"` (salie). Waarom salie:
     - het papier (#FBF8F3) valt op salie op, op wit niet;
     - salie sluit aan bij de groene snijmat op de foto's;
     - het is rustig na de terracotta kopfoto en voor de donkere foto van 002.
   - Alle tekst is inkt (10:1). Er staat geen witte tekst in 001. De balk toont het donkere logo en het label "001 — Het atelier".

5. **Beweging (O7):** dezelfde code en dezelfde tijden als Babynest.
   - Inschuiven: x 150 % met een draai naar 0, in 1,5 s, `cubic-bezier(.65,0,.35,1)`; op tablet en mobiel van onder (y 80 → 0).
   - Regels: y 50 → 0 in 1 s. Het label komt na 0,2 s, de quote na 0,3 s en het verhaal na 0,4 s (de bestaande vertragingen van `.kop-cat` en `.media-zin` hergebruiken). Het verhaal komt op als één `.regel`, niet regel voor regel, want het is een leestekst.
   - Desktop: hooguit één scherm vast (de bestaande sticky van 170vh). De tekst staat tijdens het openslaan al stil en is te lezen.
   - Minder beweging en zonder JS: het boek staat open (op mobiel de binnenpagina, atelier-4) en alle tekst is meteen zichtbaar.

6. **Mobiel (390 px) en tablet (768 px) (O5).**
   - De volgorde is gelijk aan Babynest: label → boek → quote → verhaal, alles links in de kolom.
   - Mobiel: boek 326 × 408 binnen de zijmarge van 32 px, quote 26 px, verhaal 17 px. De kaft slaat open vanaf de plek waar het boek binnenkomt en verdwijnt bij 90°. Op mobiel zie je dus kaft en atelier-4; atelier-6 alleen vanaf 1025 px.
   - Tablet: een kolom van 560 px in het midden, boek 560 × 700, de tekst daaronder op 18 px. Er staat dus geen staande foto naast de tekst.
   - Touch: native scrollen, niets staat vast.

## Ontwerpcriteria (toetsbaar)

1. **Ondergrond.** `#atelier` heeft `data-achtergrond="#C3CFBC"`. Staat 001 op 50 % van de schermhoogte, dan is de laag salie. Alle tekst in 001 is `#202020`. Het balklogo is de donkere versie.
2. **Desktop 1440 × 900, open:**
   - het boek is 576 px breed (± 2) en elke bladzijde 288 × 360;
   - de tekstkolom begint op x = 120 en is ≤ 480 px breed;
   - label, quote en de laatste regel van het verhaal staan tijdens het vastzetten samen in beeld (onderkant verhaal ≤ 876 px).
3. **Kaft.** Op de kaft staat alleen de tekst "LUX mini · Atelier": 13 px, letter-spacing ≥ 0,2em, inkt op #FBF8F3 (15,6:1). Er staat geen nummer, datum, prijs, barcode of `.masthead` in 001.
4. **Foto's in het boek.**
   - De kaft is `atelier-carien-label.jpg`, `.kaft-achter` is `atelier-carien-detail.jpg` en `.blad-rechts` is `atelier-borduurmachine-scherm.jpg`. Alle drie 768 × 960, zonder EXIF.
   - Er staat geen `figcaption` in 001.
   - In een `.blad` zonder onderschrift is de foto boven en onder even ver van de rand (± 2 px).
5. **Pull-quote.**
   - Komt precies één keer voor in 001, in Libre Caslon Display.
   - Maat: 28–36 px op desktop, 26 px op 390 px.
   - Een lijn van 1 px boven en onder.
   - Hooguit 3 regels op 1440, hooguit 5 op 390.
6. **Initiaal.**
   - `getComputedStyle(.verhaal, '::first-letter')` heeft Libre Caslon Display.
   - De hoogte is drie regels (± 4 px).
   - De `textContent` van `.verhaal` begint met "Ik ben Carien Geurts" en er staat geen element in `.verhaal`.
7. **Verhaal.**
   - 18 px vanaf 761 px en 17 px op ≤ 760 px, regelafstand ≥ 1,6.
   - De langste regel heeft ≤ 75 tekens (op 1440, 768 en 390).
   - De tekst staat in één kolom (`column-count: auto`).
8. **Mobiel 390 × 844 (Chromium en WebKit):**
   - de volgorde van boven naar beneden is label → boek (326 × 408 ± 2) → quote → verhaal;
   - alle tekst staat tussen x = 32 en x = 358;
   - de kaft blijft tijdens het openslaan ≥ 12 px onder het label;
   - er is geen horizontaal scrollen (`scrollWidth === innerWidth`) bij `--open` 0, 0,5 en 1.
9. **Tablet 768 × 1024:** het boek is 560 × 700 en staat in het midden (x = 104). De tekst staat links in dezelfde kolom op 18 px. Er is geen horizontaal scrollen, ook niet halverwege het openslaan.
10. **Beweging.**
    - De klassen en tijden zijn gelijk aan Babynest (`.anim`, `.binnen`, `--open`, 1,5 s en 1 s).
    - Op desktop staat 001 hooguit 0,7 scherm vast.
    - Bij `reducedMotion: 'reduce'` en zonder JS is `--open` 1. Op 390 px is dan atelier-4 zichtbaar, en de quote en het verhaal hebben opacity 1.
11. **De fotorij is weg.** In de HTML staan geen `#fotorij`, geen `.carrousel` in `#atelier` en geen `[aria-controls="fotorij"]`. In `style.css` staan geen selectors `.fotorij` of `.atelier-vak` meer.
12. **002–004 en Babynest veranderen niet.**
    - De x-positie van de labels 002, 003 en 004 op Werkwijze (1440, 768, 390) is voor en na gelijk.
    - `babynest-media.spec.js` blijft groen zonder dat er een waarde verandert.
    - De visuele basis van Babynest blijft gelijk.
13. **Geen leeg scherm.** In de schermafdrukken tijdens het scrollen (desktop, tablet, mobiel) is geen enkel scherm leeg. axe meldt 0 fouten op `werkwijze.html`.

---

Antwoorden op de niet-blokkerende vragen:
- **B1:** geen onderschriften.
- **B3:** atelier-1 gebruiken we niet, dus bijsnijden is niet nodig.
- **B2:** blijft open voor Carst. Carien staat herkenbaar op de kaft en op beide bladzijden.

Kan beter, P3: op desktop staat Carien achter een machine twee keer kort na elkaar (de kopfoto `over-carien` en de kaft). Dat is acceptabel, omdat de omgeving anders is. Wordt het later toch te veel, dan kan `atelier-6` de kaft worden.

