# Contact: minder lege ruimte en een zichtbare kleurovergang naar het formulier

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (14 nov., 15:38, chat, met een schermafdruk van `contact.html` op desktop): "ruimte tussen hier is iets te groot en kleuraanpassing overgang hier zou mooi zijn"
- **Branch:** `wijziging/contact-ruimte-en-kleur`
- **Issue:** geen nummer bekend
- **Risico:** laag tot midden. Het gaat om opmaak en de wissellijn van de kleurlaag. Het formulier zelf (velden, `POST /api/contact`, Worker) verandert niet. Midden, omdat `laagBijwerken` en de balk in `main.js` op elke pagina draaien: een fout daar raakt de kleurlaag of het logo van andere pagina's. Er lopen ook twee pull requests die `contact.html` raken: #73 (botbescherming in het formulier) en #74 (stofkeuze). Houd de diff klein en lokaal, zie Buiten scope.

## Doel
Op de contactpagina loopt de bezoeker zonder lege strook van de contactgegevens (001) naar "002 — Stuur een bericht". Bij die stap kleurt het scherm zichtbaar van wit naar terracotta, terwijl de gegevens nog in beeld zijn. Zo voel je dat hier de volgende stap begint.

## Context: meting website-ontwerper (14 nov.)
Gemeten met Playwright (Chromium) op de huidige `main`:
- **Oorzaak van de lege strook:** `.gegevens` heeft vanaf 761 px `min-height: min(88svh, 820px)`. De afstand van de laatste tekstregel van 001 tot de letters van "002 —" is nu: 1440 × 900: 478 px · 1280 × 800: 396 · 1024 × 768: 248 (touch en muis gelijk) · 768 × 1024: 374 · 390 × 844: 149.
- **Waarom je de overgang niet ziet:** 002 (`#formulier`) is `.op-kleur` en wisselt dus op 88 % van de schermhoogte. Dat valt samen met het moment dat 001 bovenaan het scherm staat. Op 1440 is de laag na 60 px scrollen al terracotta. Als de gegevens netjes in beeld staan, staan ze dus al op terracotta.
- **88 % is hier niet nodig:** in 002 staat geen witte tekst, alleen inkt. Wel zijn de velden wit (`rgba(255,255,255,.92)`, alleen een onderlijn). Op een witte laag vallen ze weg, dus de laag moet terracotta zijn kort nadat het eerste veld in beeld komt.
- **Gesimuleerd:** met lijnen op 88, 70, 60 en 50 % werkt **60 %** het best. Bij 50 % staat "Waar gaat je vraag over?" ongeveer 250 px scrollen wit op wit. Bij 70 % gebeurt dat op 768 nog steeds.
- **Al goed:** bij "minder beweging" heeft `.achtergrond` al `transition: none` (style.css r. 620).
- **Balk:** slaat de laag om terwijl 001 onder de balk ligt, dan wordt de balk terracotta maar houdt hij `op-wit`. Dan staat het donkere logo op terracotta. Dat gebeurt nu al op alle breedtes en botst met de logoregel in `CLAUDE.md`.

## Acceptatiecriteria

### A. Ruimte tussen 001 en 002
1. In `public/assets/css/style.css` heeft `.gegevens` geen `min-height` meer (nu r. 1005–1011). De computed `min-height` van `.gegevens` is op elke breedte `0px` of `auto`.
2. `.gegevens` heeft vanaf 761 px `padding-bottom: 16px` en tot en met 760 px `padding-bottom: 0`. De bovenruimte van 002 (`.sectie`, `var(--ritme)`) blijft gelijk.
3. De afstand van de onderkant van de laatste tekstregel in 001 tot de bovenkant van de letters "002 —" is, met een marge van ±12 px: 1440 × 900: 162 px · 1280 × 800: 150 · 1024 × 768: 133 (touch en muis gelijk) · 768 × 1024: 117 · 390 × 844: 101 (ontwerpcriterium 2).
4. Op geen breedte staat er tussen 001 en 002 een strook hoger dan 200 px zonder tekst of beeld.

### B. Wissellijn op 60 %
5. In `public/contact.html` heeft de sectie `#formulier` het attribuut `data-laag-lijn="0.6"`. De sectie blijft `.op-kleur`, 001 blijft `.op-wit`. Er komen geen nieuwe klassen, kleuren of overgangen bij.
6. `laagBijwerken` in `public/assets/js/main.js` (nu r. 676–689) leest per sectie `data-laag-lijn`. Is dat een getal tussen 0 en 1, dan is dat de lijn. Anders blijft de huidige lijn: 0,88 voor `.op-kleur` en 0,5 voor de rest. Het commentaar boven de functie noemt de uitzondering en de voorwaarde: alleen voor secties zonder witte tekst.
7. Op contact.html wordt de laag terracotta zodra de bovenkant van `#formulier` op of boven 60 % van de schermhoogte staat (± 2 %). De laag wordt weer wit als die bovenkant eronder zakt (ook bij terug omhoog scrollen).
8. Op het moment dat de laag omslaat, staat ten minste een deel van `.gegevens-kolommen` in beeld op 1440, 1280, 1024, 768 en 390 (ontwerpcriterium 5).
9. Als de pagina na de overgang stilstaat, staat het veld "Waar gaat je vraag over?" nooit helemaal in beeld op een witte laag. De overgang van 0,75 s telt daarbij niet mee (ontwerpcriterium 6).
10. Geen andere pagina krijgt `data-laag-lijn`. Op de andere pagina's wisselt de laag op exact dezelfde lijnen als nu (0,88 / 0,5).

### C. Balk en logo
11. Is de balk zichtbaar en de laag terracotta, dan toont de balk `logo-luxmini-wit.png`. Is de laag wit, dan toont hij `logo-luxmini-donker.png`. Het sectielabel blijft inkt en de burger blijft leesbaar volgens de bestaande regels. De header op de fotokop (`html.kop-donker`) verandert niet.
12. De aanpassing zit in `bijwerken` (main.js §6, nu ongeveer r. 791–820). Komt er een neveneffect op andere pagina's, beperk het dan tot secties met een laag (`met-laag`) en de terracotta laag (ontwerprichting 4). De visuele basis van de andere pagina's (`tests/e2e/basis/`) verandert niet. Verandert er toch een basisscherm, dan legt de bouwer in het Verloop uit welk scherm, waarom, en dat het verschil alleen het logo op een terracotta laag is (dan klopt het juist met de logoregel). De basisschermen worden alleen bijgewerkt via `visueel-basis.yml`.

### D. Minder beweging, mobiel en contrast
13. Bij `prefers-reduced-motion: reduce` is de computed `transition-duration` van `.achtergrond` `0s` en wisselt de laag op dezelfde lijn van 60 %.
14. Op 390 × 844 en op WebKit 390 × 664 is er geen horizontaal scrollen en zijn alle tikdoelen in 001 minstens 44 px hoog. `tests/e2e/mobiel-ontwerp.spec.js` is groen.
15. In 002 staat in geen enkele staat witte tekst kleiner dan 24 px (of 19 px vet). Alle kleine tekst op terracotta is inkt (≥ 4,5:1). axe meldt op contact.html geen contrastfouten.

### E. Tests, sitecontrole en CLAUDE.md
16. Er komt een nieuwe e2e-test, bijvoorbeeld `tests/e2e/contact-ruimte-en-kleur.spec.js`, voor desktop, tablet en mobiel. Die toetst:
    - criterium 1: geen `min-height`;
    - criterium 3: de afstand per breedte;
    - criterium 7: de wissellijn op 60 % heen en terug, via de achtergrondkleur van `.achtergrond` na het wachten op de overgang, of bij minder beweging;
    - criterium 11: het balklogo wit op de terracotta laag en donker op de witte laag;
    - criterium 10: een steekproef op één andere pagina, die op de oude lijn wisselt.
17. Bestaande tests, grenzen en axe-regels worden niet versoepeld of geschrapt. Wordt een bestaande test rood door het nieuwe gedrag, dan stopt de bouwer en meldt hij dat bij de controleur en Carst.
18. `scripts/controleer.py` toetst nu de `min-height` van `.gegevens` of de oude afstand niet (gezocht: r. 934 en 1393 lezen alleen tekst). Er hoeft dus niets aangepast te worden. Komt de bouwer toch een controle tegen die de oude afstand toetst, dan zet hij die om naar criterium 3. De nieuwe controle mag niet losser zijn dan de oude.
19. In `CLAUDE.md` krijgt de regel "Scrollen en kleur" een aanvulling: een sectie kan een eigen wissellijn hebben via `data-laag-lijn` (bijvoorbeeld 0,6), maar alleen als er geen witte tekst in die sectie staat. Anders blijft 0,88 voor `.op-kleur` en 0,5 voor de rest. Nu geldt dat alleen voor contact.html `#formulier` (brief 2026-11-14-contact-ruimte-en-kleur). Verder verandert er niets aan de ontwerpregels.
20. `npm run check` is groen: tests, sitecontrole, toegankelijkheid, SEO, veiligheid, snelheid, visueel en validatierapport.

## Ontwerprichting
1. **Gebruik bestaande patronen, geen nieuw mechanisme.** De overgang loopt via de vaste kleurlaag `.achtergrond` (0,75 s, bestaande curve). 001 blijft `.op-wit` en 002 `#formulier` blijft `.op-kleur`. Haal de `min-height` van `.gegevens` weg: die maakt de strook leeg en maakt de overgang niet zichtbaar. Geef 002 een eigen wissellijn op 60 % van de schermhoogte, met een data-attribuut op de sectie (bijvoorbeeld `data-laag-lijn="0.6"`). `laagBijwerken` in main.js leest dat attribuut en valt anders terug op de huidige 0,88 / 0,5. Dit mag omdat 002 geen witte tekst heeft, alleen inkt. Er komen geen nieuwe overgangen, kleuren of klassen bij.
2. **Ritme tussen 001 en 002.** De afstand volgt het sectieritme van de rest van de site. `.gegevens` krijgt `padding-bottom: 16px` vanaf 761 px en `0` tot en met 760 px. De bovenruimte van 002 (`.sectie`, `var(--ritme)`) blijft zoals hij is. Zo is de afstand van de laatste regel van 001 tot "002 —" ongeveer 1440: 162 px · 1280: 150 · 1024: 133 · 768: 117 · 390: 101. De lucht moet bedoeld voelen, niet leeg.
3. **Volgorde en hiërarchie.** Eerst leest de bezoeker de gegevens rustig op wit. Bij verder scrollen komt "002 — Stuur een bericht" onderin op. Zodra 002 het onderste 40 % van het scherm vult, kleurt het hele scherm zacht naar terracotta, terwijl de gegevens nog in beeld zijn. Dat is de zichtbare overgang waar Carst om vraagt, en hij zegt: hier begint de volgende stap. Terug omhoog scrollen kleurt op dezelfde lijn weer naar wit. Inkt van 001 op terracotta is in orde (5,2:1).
4. **Balk en logo.** De balk volgt de laag: op een terracotta laag het witte logo, op een witte laag het donkere logo. Het sectielabel en de burger blijven leesbaar volgens de bestaande regels (label inkt). De header op de fotokop (`html.kop-donker`) verandert niet. Toets bij een aanpassing in `bijwerken` (main.js §6) met de visuele tests of andere pagina's niet veranderen. Lukt dat niet zonder neveneffect, beperk het dan tot secties met een laag (`met-laag`) en de terracotta laag.
5. **Mobiel en touch.** Op 390 px staan de gegevens in één kolom. De wissellijn van 60 % geldt ook hier. Op touch en met een muis gedraagt de pagina zich hetzelfde (1024 touch = 1024 muis). Er is geen horizontaal scrollen en verder verandert er niets aan het formulier.
6. **Minder beweging.** De laag wisselt direct op dezelfde lijn, zonder overgang (bestaande regel `.achtergrond { transition: none }`).

## Ontwerpcriteria (toetsbaar)
1. `.gegevens` heeft op geen enkele breedte nog een `min-height` (computed `0px` / `auto`).
2. De afstand van de onderkant van de laatste tekstregel in 001 tot de bovenkant van de letters "002 —" is, met een marge van ±12 px:
   - 1440 × 900: 162 px
   - 1280 × 800: 150 px
   - 1024 × 768: 133 px (touch en muis gelijk)
   - 768 × 1024: 117 px
   - 390 × 844: 101 px
3. Er is op geen breedte een strook hoger dan 200 px tussen 001 en 002 zonder tekst of beeld.
4. De laag wordt terracotta zodra de bovenkant van `#formulier` op of boven 60 % van de schermhoogte staat (± 2 %), en weer wit als die eronder zakt. Andere secties en pagina's houden hun lijn (0,88 / 0,5).
5. Op het moment dat de laag omslaat, staat ten minste een deel van `.gegevens-kolommen` in beeld op 1440, 1280, 1024, 768 en 390. Je ziet de overgang dus gebeuren.
6. Als de pagina na de overgang stilstaat, staat het veld "Waar gaat je vraag over?" nooit helemaal in beeld op een witte laag (de overgang van 0,75 s telt niet mee).
7. In 002 staat in geen enkele staat witte tekst kleiner dan 24 px (of 19 px vet). Alle kleine tekst op terracotta is inkt (≥ 4,5:1). axe meldt op contact.html geen contrastfouten.
8. Bij `prefers-reduced-motion: reduce` heeft `.achtergrond` als computed `transition-duration` `0s` en wisselt de laag op dezelfde lijn.
9. Als de balk zichtbaar is en de laag terracotta is, toont de balk `logo-luxmini-wit.png`. Is de laag wit, dan toont hij `logo-luxmini-donker.png`. Het label blijft inkt. De visuele basis van de andere pagina's verandert hierdoor niet (of de verschillen zijn verklaard).
10. Op 390 × 844 en op WebKit 390 × 664 is er geen horizontaal scrollen en blijven alle tikdoelen in 001 minstens 44 px hoog. `tests/e2e/mobiel-ontwerp.spec.js` is groen.

**Kan beter (P3, niet voor deze brief nodig):** de badge (terracotta cirkel half over de rand van de fotokop) verdwijnt in de achtergrond zolang hij op een terracotta laag in beeld is. Bij een lijn van 60 % gebeurt dat op 1440 nog net kort. Je kunt er later een dunne inktrand of een wit vlak achter overwegen.

## Bestanden
- `public/assets/css/style.css`: `.gegevens` (min-height weg, padding-bottom per breedte)
- `public/contact.html`: alleen `data-laag-lijn="0.6"` op `<section id="formulier">` (nu r. 154)
- `public/assets/js/main.js`: `laagBijwerken` (lijn uit attribuut) en `bijwerken` §6 (balklogo volgt de laag)
- `tests/e2e/contact-ruimte-en-kleur.spec.js` (nieuw)
- `tests/e2e/basis/`: alleen als een basisscherm van Contact verandert, via `visueel-basis.yml`
- `CLAUDE.md`: regel "Scrollen en kleur"

## Buiten scope
- De inhoud van het formulier: velden, labels, stofkeuze, botbescherming, `src/*`. Die zitten in PR #73 en #74. In `contact.html` verandert alleen de openingstag van `#formulier`. Raak geen andere regels in die sectie aan, zodat de samenvoeging met #73 en #74 zonder conflict blijft.
- De fotokop, de header op de foto (`html.kop-donker`) en de teksten in 001.
- De badge (P3 hierboven).
- De wissellijn op andere pagina's of in andere secties.
- `wrangler.jsonc`, `_redirects`, `_headers`, `.github/workflows/`.

## Open vragen
Geen blokkerende vragen. Ter informatie:
1. **Samenloop met #73 en #74.** Wordt een van die PR's eerst gemerged, dan rebaset de bouwer deze branch op `main`. Daarna meet hij criterium 3 en 7–9 opnieuw, omdat extra velden de hoogte van 002 veranderen. Voor de afstand tussen 001 en 002 maakt dat niets uit.
2. **Logo op de terracotta laag (criterium 11).** Dit herstelt een bestaande afwijking van de logoregel. Als het op andere pagina's iets zichtbaar verandert, staat dat met uitleg in het Verloop en het validatierapport. Carst beoordeelt dat dan in de preview.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov., 15:38). Ontwerprichting en ontwerpcriteria letterlijk van de website-ontwerper (meting 14 nov.). Risico laag tot midden (main.js op elke pagina; samenloop met #73/#74). `controleer.py` toetst de min-height of de afstand niet |
| Bouwen | website-bouwer | `.gegevens` zonder min-height (padding-bottom 16 px vanaf 761, 0 daaronder); `data-laag-lijn="0.6"` op `#formulier` (alleen de openingstag), gelezen door `laagBijwerken` (fallback 0,88 / 0,5); balk: wit logo als de laag terracotta is boven een sectie met laag (via de bestaande klasse `.diep`, label inkt); CLAUDE.md "Scrollen en kleur" aangevuld; nieuwe test `tests/e2e/contact-ruimte-en-kleur.spec.js`. Lokaal groen: `npm test` (134), `controleer.py` (geen fouten), Playwright Chromium desktop/tablet/mobiel 328 geslaagd (axe, Lighthouse, WebKit en visueel alleen in CI: npm-register lokaal geblokkeerd). **Criterium 3:** de CSS volgt richting 2 exact; mijn meting (onderkant laatste tekstblok → letters "002 —") geeft op main overal 31 px minder dan de meting van de ontwerper (448/365/217/343/118 tegenover 478/396/248/374/149); met die vaste verschuiving klopt het nieuwe resultaat op 1 px (1440: 131+31=162 enz.); de test rekent met die verschuiving, marge ± 12 ongewijzigd. **Criterium 9 niet gehaald:** bij lijn 0,6 staat het onderwerpveld helemaal in beeld op wit over 63 px scrollen (1440), 34 (1280), 39 (1024, touch en muis), 157 (768), 66 (390); een lijn van ca. 0,76 zou nodig zijn en botst met criterium 5/7 (0,6 vast) – niet zelf aangepast, ter beslissing aan ontwerper/Carst. **Criterium 12:** bedoeld neveneffect: op andere pagina's toont de balk nu ook het witte logo als een witte sectie onder de balk ligt en de laag al terracotta is (bijv. kraamcadeauboxen, 003 Thema's net voor 004/005); homepage-drieluik ongewijzigd. Basisschermen staan bovenaan de pagina (balk niet zichtbaar) en zullen naar verwachting niet veranderen; controleren in Gate 5 |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
