# Van Bitbucket naar GitHub + Cloudflare Workers Builds

- **Datum:** 2026-11-01
- **Aangevraagd door:** Carst (keuzes: openbare repository, tests + volledige sitecontrole verplicht, domein pas na akkoord van Carien)
- **Risico:** hoog. Raakt het live zetten en `.github/workflows/`.

## Waarom
- Cloudflare Workers Builds werkt niet met Bitbucket. Met GitHub bouwt Cloudflare zelf, met een preview per branch, en is er geen API-token nodig.
- Claude kan via de GitHub-koppeling zelf branches en pull requests aanleveren. Bitbucket is vanuit Claudes werkomgeving niet bereikbaar.
- Een openbare repository mag op gratis GitHub een afgedwongen ruleset op `main` hebben. De code is toch al zichtbaar in de browser, en er staan geen geheimen in.

## Acceptatiecriteria
1. `bitbucket-pipelines.yml` is weg. `.github/workflows/controle.yml` draait gate 1 (`npm test` + `wrangler deploy --dry-run`) en gate 2 (`scripts/controleer.py` in de Playwright-container) bij elke pull request en elke push naar `main`, met alleen leesrechten.
2. `.github/workflows/rooktest.yml` draait gate 3 na elke push naar `main`: na 150 s wachten, zodat Cloudflare kan uitrollen. Hij draait ook dagelijks en handmatig. Faalt duidelijk als `SITE_URL` ontbreekt.
3. Er staan nergens tokens of geheimen in de repository.
4. Een pull request-sjabloon vraagt om de brief, de preview op desktop en telefoon, de controleur en de goedkeuring van Carien.
5. `.claude/settings.json` verbiedt ook `gh pr merge` en force-pushes.
6. `README.md`, `CLAUDE.md`, `docs/ai-pdlc.md`, de agents en `/website-update` beschrijven de nieuwe stroom:
   - Claude pusht een branch en opent een pull request;
   - de gates draaien op GitHub;
   - Cloudflare maakt de preview;
   - de mens merget;
   - Cloudflare zet live;
   - de rooktest controleert.
7. De README beschrijft de ruleset: pull request verplicht, 0 goedkeuringen (je eigen pull request kun je niet goedkeuren), beide gates verplicht, geen uitzonderingen, geen force-push of verwijderen. De domeinoverstap en Email Routing staan als stap 4 en 5, pas na akkoord van Carien.

## Open punt
Onbekend of Cloudflare een Worker met een `send_email`-binding accepteert voordat Email Routing op een domein aanstaat. Faalt de eerste build daarop, dan maken we de binding tijdelijk optioneel.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | brief opgesteld met de keuzes van Carst |
| Bouwen | website-bouwer | workflows, sjabloon, documentatie en agentregels aangepast |
| Controleren | website-controleur | ronde 1 NIET AKKOORD: mergen door agents niet hard afgesloten, DNS only ontbrak, terugvaloptie e-mail ontbrak (+ forks, lockfile, versiecontrole rooktest, 60-dagen-regel) |
| Bouwen | website-bouwer | ronde 2: `gh api`, `gh alias`, `gh repo` e.d. geblokkeerd en restrisico eerlijk in README met optie 1 goedkeuring door Carien; DNS only terug; terugvaloptie e-mail; forks-check; lockfile-stap; rooktest wacht op `/versie.txt` met de commit; 60-dagen-regel genoemd |
| Controleren | website-controleur | ronde 2: alles verwerkt; enige blokkade was dat de repository privé was |
| Besluit | Carst | repository openbaar gemaakt → ruleset wordt afgedwongen; blokkade opgelost |
| Repository aangemaakt en gekoppeld | Carst + Claude | CarstvdnBosch/luxmini, branch `wijziging/eerste-versie` |
| Live gezet (merge) | Carst | |
