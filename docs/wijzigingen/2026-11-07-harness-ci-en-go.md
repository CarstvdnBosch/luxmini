# Betrouwbare pipeline, GO via reactie en intake met user stories

- **Datum:** 7 november 2026
- **Aangevraagd door:** Carst (GO op de scope, 7 nov.; GitHub-issues #30, #34 en een deel van #29 en #28)
- **Branch:** `wijziging/harness-ci-go`
- **Risico:** hoog. Raakt `.github/workflows/` (`controle.yml`, `go-nogo.yml`) en het GO-besluit, dus de poort naar productie. De site in `public/` verandert niet.

## Doel
De controles bij een pull request mogen niet meer vastlopen of toevallig rood worden, zodat Carst sneller en met vertrouwen GO kan geven. Carst kan GO ook geven met een reactie `GO` in de pull request, en elke wens begint als een korte user story, zodat de brief vanaf het begin klopt.

## Aanleiding
- 6 nov.: de stap "Chromium voor Playwright" in Gate 4 hing 30 minuten en de hele gate werd afgebroken (#30).
- Lighthouse wordt soms rood op alleen `total-blocking-time` (TBT), een meting die op de GitHub-runner wisselt (#30).
- Een label zetten op de telefoon is omslachtig; Carst koos optie 2: GO via een reactie (#34).
- De controleur mag geen bestanden aanpassen, maar het Verloop in de brief moet wel zijn oordeel bevatten.
- Screenshots over de hele pagina (`full_page=True`) tonen de vaste kleurlaag (`.achtergrond`) verkeerd (#29).

## Acceptatiecriteria

### A. Betrouwbare CI (#30)
1. In `controle.yml` gebruiken Gate 4 en Gate 5 `actions/cache` voor `~/.cache/ms-playwright`, met een sleutel op besturingssysteem + Playwright-versie (bijv. `playwright-${{ runner.os }}-<versie>`; de versie komt uit `package-lock.json` of uit `npx playwright --version`, niet hard in de workflow).
2. Bij een cache-miss draait `npx playwright install --with-deps chromium webkit`; bij een cache-hit alleen `npx playwright install-deps chromium webkit` (systeempakketten staan niet in de cache). In de logs van een tweede run op dezelfde versie staat "Cache restored" en wordt er geen browser gedownload.
3. De installatiestap in Gate 4 en Gate 5 heeft `timeout-minutes: 10` en probeert het precies één keer opnieuw als de eerste poging mislukt of hangt (in de shell, bijv. `timeout 270 … || timeout 270 …`; geen extra actie van derden). In Gate 4 blijft een mislukte installatie na de herkansing blokkerend; in Gate 5 blijft `continue-on-error: true`.
4. Lighthouse in Gate 4: mislukt de toets **alleen** op `total-blocking-time` (alle andere fouten in `.lighthouseci/assertion-results.json` ontbreken), dan meet de stap precies één keer opnieuw (opnieuw 3 runs, `median-run`) en telt de tweede uitslag. Faalt iets anders (prestatiescore, LCP, CLS, toegankelijkheid enz.), dan is er geen herkansing. De werkwijze staat als commentaar in de workflow en in `docs/kwaliteit.md`. Bijvoorbeeld: `lhci collect` + `lhci assert`; bij een fout met `jq` controleren of elke fout `auditId == "total-blocking-time"` heeft; zo ja `.lighthouseci/` leegmaken en `lhci autorun` nog één keer draaien.
5. `lighthouserc.cjs` is niet veranderd: grenzen, `numberOfRuns: 3` en `aggregationMethod: 'median-run'` blijven gelijk (`git diff main -- lighthouserc.cjs` is leeg).
6. `@axe-core/playwright` en `@lhci/cli` staan als `devDependencies` in `package.json` (dat is al zo; de versies blijven gelijk). Er komt een `package-lock.json` als `npm install --package-lock-only` in de bouwomgeving werkt; dan wordt `npm ci || npm install` in de workflows `npm ci`. Lukt dat offline niet, dan blijft `npm ci || npm install` staan en beschrijft de brief (Verloop) en `docs/kwaliteit.md` de eenmalige stap om het lockbestand in CI te maken. Er wordt geen half of met de hand gemaakt lockbestand gecommit.

### B. GO via reactie in de pull request (#34, optie 2)
7. `go-nogo.yml` luistert naast de bestaande `pull_request`-gebeurtenissen ook naar `issue_comment` met `types: [created]`. De job voor reacties draait alleen als **alle drie** gelden: de reactie hoort bij een pull request (`github.event.issue.pull_request`), `github.event.comment.author_association == 'OWNER'` en `github.event.comment.user.login == github.repository_owner`.
8. De tekst van de reactie wordt alleen via een omgevingsvariabele gelezen (nooit `${{ github.event.comment.body }}` direct in `run:`), getrimd (spaties, regeleinden) en in kleine letters vergeleken; alleen precies `go` telt (`GO`, `Go`, ` go ` wel; `GO!`, `GO graag`, `ok GO` niet).
9. Bij een geldige GO-reactie haalt de job de actuele head-SHA van de pull request op via de API (`gh api repos/$REPO/pulls/$PR --jq .head.sha`), zet de commitstatus "GO · Akkoord Carst" = `success` op die SHA en zet het label `GO`. Een reactie van iemand anders (ook van een bot of medewerker) verandert niets en laat de run niet mislukken.
10. De job voor reacties doet geen `actions/checkout` en voert geen code uit de pull request uit. Rechten per job minimaal: `statuses: write`, `pull-requests: write`, `issues: write`, verder niets (geen `contents: write`).
11. Een nieuwe commit (`synchronize`) zet de status weer op `pending` en haalt het label `GO` weg, ook als GO via een reactie kwam; een oude GO-reactie telt daarna niet meer (alleen een nieuwe reactie `GO` na die commit).
12. Het bestaande labelpad blijft werken (eigenaar zet label `GO` → `success`). Het label dat de workflow na een GO-reactie zelf zet (door `github-actions[bot]`) mag bij een latere `pull_request`-gebeurtenis zonder nieuwe commit (bijv. een ander label, `ready_for_review`) de status **niet** terugzetten naar `pending`: de job accepteert dan het label alleen als er een reactie `GO` van de eigenaar is die nieuwer is dan de laatste commit. Een label `GO` van iemand anders blijft `pending` geven.
13. `concurrency` werkt voor beide gebeurtenissen (groep op `github.event.pull_request.number || github.event.issue.number`). De job slaagt altijd (geen mislukte run, dus geen foutmail), zoals nu.
14. Bijgewerkt: commentaar bovenin `go-nogo.yml`, README (ruleset-stappen: de verplichte controle blijft "GO · Akkoord Carst"; vermeld dat de reactievariant pas werkt nadat deze workflow op `main` staat, omdat GitHub `issue_comment` altijd met de workflow van de standaardbranch draait), `docs/kwaliteit.md`, `docs/ai-pdlc.md` (fase 5, tabel Poorten, mermaid-pijl), `CLAUDE.md` (GO = label `GO` of reactie `GO` van de eigenaar), de tekst "Jouw besluit" in `scripts/validatierapport.mjs` en `.github/pull_request_template.md`.
15. Alle vier agents in `.claude/agents/` zeggen expliciet: agents plaatsen nooit een reactie `GO` (ook niet met andere hoofdletters of als citaat op een eigen regel), zetten nooit het label `GO` en vragen Carst daar niet om in een vorm die hij kan kopiëren.

### C. Verloop in de brief (proces)
16. `docs/ai-pdlc.md` zegt: de hoofdsessie (orchestrator) vult de rijen "Controleren" en "Ontwerpgate" in het Verloop in, letterlijk met de tekst die controleur en ontwerper teruggeven; de controleur en ontwerper passen zelf geen bestanden aan.
17. `.claude/agents/website-controleur.md` en `website-ontwerper.md` eindigen hun verslag met een vaste regel voor het Verloop, bijv. `Verloop: AKKOORD — <korte reden>` / `Verloop: NIET AKKOORD — <punten>` en `Verloop: ONTWERP AKKOORD — …` / `Verloop: n.v.t. — alleen techniek`. De woorden passen bij de regex in `scripts/validatierapport.mjs` (`AKKOORD` zonder `NIET AKKOORD`, of `n.v.t.`), zodat het rapport ze herkent.

### D. Intake met user stories (#28, deel)
18. Er zijn `.github/ISSUE_TEMPLATE/user-story.yml` en `user-journey.yml` (GitHub issue forms) met de velden: Wie, Wil, Zodat, Klaar als, Nu niet, Prioriteit (keuze must / should / could) en Onderdeel (keuzelijst). Wie, Wil, Zodat, Klaar als en Prioriteit zijn verplicht. De journey heeft daarnaast een veld voor de stappen van de bezoeker.
19. Er is `.github/ISSUE_TEMPLATE/config.yml`. De drie YAML-bestanden laden zonder fout en volgen het schema van GitHub issue forms (`name`, `description`, `body` met `type`/`id`/`attributes`; unieke `id`'s).
20. `docs/ai-pdlc.md` beschrijft de intake vóór fase 1: elke wens begint als issue (user story of journey); de hoofdsessie controleert die op gaten en tegenstrijdigheden (ook met `CLAUDE.md`) en geeft kort terug wat zij van de vraag vindt, vóór de planner start; één story per pull request; de beschrijving van de pull request bevat `Closes #<nummer>`. `.github/pull_request_template.md` heeft daar een regel voor.

### E. Screenshots per scherm (#29, deel)
21. `scripts/controleer.py` maakt geen screenshots meer met `full_page=True` (regels rond 542 en 1454): per pagina en schermmaat worden schermvullende screenshots gemaakt door per schermhoogte te scrollen (zoals `scripts/schermafdrukken.py`), met nummering `<pagina>-<schermmaat>-01.png`, `-02.png` … in `scripts/screenshots/`. `grep -n "full_page" scripts/controleer.py` geeft niets.
22. Op de screenshots heeft de vaste kleurlaag per scherm de kleur van de sectie die in beeld is (steekproef: homepage desktop en mobiel, minstens drie schermen bekeken). De verwijzing naar de screenshots in `.claude/agents/website-controleur.md` klopt met de nieuwe namen.
23. Gate 2 blijft dezelfde controles doen (geen controle weggehaald of versoepeld) en uploadt `scripts/screenshots/` als artefact.

### F. Algemeen
24. Alle workflow-YAML valideert: `actionlint` zonder fouten als het beschikbaar is, anders `python3 -c "import yaml,sys; [yaml.safe_load(open(f)) for f in sys.argv[1:]]" .github/workflows/*.yml .github/ISSUE_TEMPLATE/*.yml` zonder fout plus een handmatige check van `on:`, `if:`-expressies, `permissions` en `timeout-minutes`. De bouwer schrijft in het Verloop welke van de twee is gebruikt.
25. Geen test, grens of axe-regel is versoepeld; `public/` is ongewijzigd (`git diff main --stat -- public` is leeg).
26. `npm run check` is groen.

## Ontwerprichting
n.v.t. (alleen techniek en proces; de bezoeker ziet niets).

## Bestanden
- `.github/workflows/controle.yml`
- `.github/workflows/go-nogo.yml`
- `.github/ISSUE_TEMPLATE/user-story.yml`, `user-journey.yml`, `config.yml` (nieuw)
- `.github/pull_request_template.md`
- `package.json` (alleen als scripts nodig zijn voor de Lighthouse-herkansing), `package-lock.json` (nieuw, als het offline lukt)
- `scripts/controleer.py`
- `scripts/validatierapport.mjs` (alleen de tekst "Jouw besluit")
- `docs/ai-pdlc.md`, `docs/kwaliteit.md`, `README.md`, `CLAUDE.md`
- `.claude/agents/website-controleur.md`, `website-ontwerper.md`, `website-bouwer.md`, `website-planner.md`

## Buiten scope
- Grenzen in `lighthouserc.cjs`, Playwright-tests en axe-regels veranderen.
- De container en Playwright-versie van Gate 2 (`playwright/python:v1.47.0`) aanpassen.
- De ruleset in GitHub zelf instellen (doet Carst; de brief werkt alleen de beschrijving bij).
- `.claude/settings.json` aanpassen (zie open vragen).
- De rest van #28 en #29; `rooktest.yml` en `visueel-basis.yml`.
- Iets in `public/`, `src/` of `wrangler.jsonc`.

## Open vragen
- **Labels van de issueformulieren:** Nederlands (Wie, Wil, Zodat, Klaar als, Nu niet, Prioriteit, Onderdeel) of Engels (Who, Wants to, So that, Done when, Not now, Priority, Area)? Voorstel: Nederlands, zoals de rest van de repo.
- **Keuzes voor Onderdeel:** voorstel Homepage, Werkwijze, Kraamcadeauboxen, Prematuurkleding, Babynest, Inspiratie, Contact en formulier, Menu en algemeen, Pipeline en techniek. Klopt dat?
- **`config.yml`:** lege issues uitzetten (`blank_issues_enabled: false`) of toestaan?
- **Herkansing installatie:** is één herkansing binnen dezelfde 10 minuten (2 × ca. 4,5 min) goed, of liever 10 minuten per poging (stap dan 20 min)?
- **Screenshots per scherm:** alle schermen per pagina, of een maximum (bijv. 12) om het artefact klein te houden?
- **Extra slot voor agents:** wil Carst in `.claude/settings.json` ook `gh pr comment` en `gh issue comment` laten blokkeren, zodat een agent technisch geen reactie `GO` kan plaatsen? Dat is configuratie en gebeurt alleen met zijn uitdrukkelijk akkoord. Nu is het alleen een afspraak; de workflow accepteert sowieso alleen reacties van het account van de eigenaar.
- **Open besluit Carst (7 nov.):** `gh pr comment` / `gh issue comment` (en daarmee een reactie GO door een agent) blokkeren in `.claude/settings.json`. Blijft buiten deze wijziging; Carst beslist later. Tot dan is het een afspraak in `CLAUDE.md` en de agents.
- **Werkt pas na merge:** de GO-reactie werkt pas nadat deze wijziging op `main` staat. Voor deze pull request zelf geldt dus nog het label `GO`.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief geschreven (7 nov.) op basis van de scope met GO van Carst; risico hoog (workflows en GO-besluit). |
| Bouwen | website-bouwer | 7 nov. Besluiten open vragen (hoofdsessie, 7 nov.): (1) labels issueformulieren Nederlands; (2) Onderdeel-lijst volgens voorstel; (3) lege issues uit; (4) installatie: twee pogingen van max. 8 min (`timeout -k 30 480`), stap 18 min (wijkt bewust af van crit. 3: 10 min / 270 s); daardoor jobtijd Gate 4 30 → 45 min en Gate 5 25 → 35 min; (5) max. 8 screenshots per pagina per schermmaat; (6) `gh pr/issue comment` blokkeren in `.claude/settings.json` blijft buiten scope (Carst beslist later). Gebouwd: cache via `actions/cache/restore` + `actions/cache/save` (opslaan direct na geslaagde installatie, ook als tests later falen), versie via `npx playwright --version`; Lighthouse-herkansing alleen als alle mislukte error-asserties `total-blocking-time` zijn, eerste meting in `rapport/lighthouse-poging-1/`; `go-nogo.yml` met job `go-reactie` (geen checkout, body via env, `permissions` per job, workflow-niveau `{}`), concurrency per job (een overgeslagen job breekt niets af); extra slot: label of reactie telt alleen als hij nieuwer is dan de laatste versie (commitdatum of eerste GO-status op die SHA), ook voor het label van de eigenaar; issueformulieren, intake en Verloop-regels in docs en agents; `controleer.py` zonder `full_page`. Lockbestand: `npm install --package-lock-only` faalt offline (registry onbereikbaar) → `npm ci \|\| npm install` blijft; eenmalige stap staat in `docs/kwaliteit.md`. YAML-validatie: `actionlint` 1.7.7 (met shellcheck 0.10.0) zonder fouten in de gewijzigde workflows (alleen een bestaande SC2034-waarschuwing in `rooktest.yml`, buiten scope) plus `yaml.safe_load` van alle workflows en issueformulieren (unieke id's). `git diff main` op `public/`, `lighthouserc.cjs`, `tests/`, `playwright.config.js`, `package.json` leeg. Lokaal: `npm test` 18/18; `controleer.py` geen fouten (141 screenshots, 9 min); Playwright Chromium (desktop, tablet, mobiel, zonder axe-spec) 147 groen, 102 bewust overgeslagen; axe, Lighthouse en WebKit alleen in CI. Steekproef screenshots homepage desktop (02, 04, 06) en mobiel (03, 06, 08): kleurlaag per scherm in de kleur van de sectie. |
| Controleren | website-controleur (ingevuld door hoofdsessie) | NIET AKKOORD (7 nov.). go-nogo.yml: zonder GO-status op de nieuwe commit valt de controle terug op de lokale commitdatum; een GO-reactie van vóór de push kan op de nieuwe commit groen blijven als de synchronize-run wordt geannuleerd (criterium 11). Verder in orde: actionlint schoon, npm test 18/18, controleer.py zonder fouten, Playwright Chromium groen. |
| Bouwen (ronde 2) | website-bouwer | 7 nov. go-nogo.yml: grens is nu de eerste pending-status "GO · Akkoord Carst" van github-actions[bot] op de nieuwste commit; de commitdatum wordt niet meer gebruikt. Zonder die status telt geen GO (reactie of label): de workflow zet zelf "wachten", haalt het label weg en meldt in een reactie dat de nieuwe versie nog wordt verwerkt. Alleen ongewijzigde reacties tellen (updated_at = created_at). Nieuw `tests/go-nogo.test.js` (in `npm test`): draait de echte run-scripts uit de workflow met een nep-gh en voorbeeld-JSON; 12 tests, o.a. GO vóór de push geweigerd, GO zonder pending-status geweigerd, GO na pending geaccepteerd op de head-SHA, gewijzigde reactie telt niet; 7 daarvan falen tegen de vorige versie. Verder: controleer.py neemt bij meer dan 8 schermen altijd het laatste scherm mee; README: verwachte bron van "GO · Akkoord Carst" = GitHub Actions; open besluit `gh pr comment` bij Open vragen. actionlint (met shellcheck) schoon, yaml.safe_load ok; npm test 30/30. |
| Controleren (ronde 2) | website-controleur (ingevuld door hoofdsessie) | AKKOORD (7 nov.). Race gesloten: GO telt alleen na de eerste pending-status van github-actions[bot] op de nieuwste commit, anders wachten en label weg (ook bij een geannuleerde synchronize-run). Geen nieuwe injectie of extra rechten. tests/go-nogo.test.js draait de echte workflowscripts (7 van 12 falen op de oude versie). actionlint schoon, npm test 30/30, controleer.py zonder fouten met het laatste scherm erbij. Open besluit Carst: `gh pr comment`/`gh issue comment` blokkeren voor agents. |
| Ontwerpgate | website-ontwerper | n.v.t. — alleen techniek en proces |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
