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
