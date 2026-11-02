# LUX mini — website

Portfolio-website voor luxmini.nl. Gehost op **Cloudflare Workers**; code op **GitHub** (openbare repository, er staan geen geheimen in); Cloudflare bouwt en zet live met **Workers Builds**; domein bij **GoDaddy**. Wijzigingen lopen via de AI-PDLC in `docs/ai-pdlc.md`.

## Bekijken op je eigen computer

Open `public/index.html` in je browser. Alles werkt, behalve het verzenden van het contactformulier.

Met Node.js geïnstalleerd kun je ook de echte Cloudflare-omgeving lokaal draaien:
```
npm install
npm run dev        # opent op http://localhost:8787 (mail wordt dan alleen gesimuleerd)
```

## Eenmalige installatie

In deze volgorde blijft de oude Wix-site gewoon bereikbaar tot de allerlaatste stap. Stap 1 t/m 3 kunnen nu al; stap 4 en 5 pas als Carien de site heeft goedgekeurd.

### 1. Code op GitHub
1. Maak op github.com een **openbare** repository `luxmini`, zonder README.
2. Koppel GitHub aan Claude (claude.ai → Settings → Connectors → GitHub). Claude zet de code erin en levert wijzigingen aan als branch met pull request.

### 2. Cloudflare bouwt en zet live (Workers Builds)
1. Maak in Cloudflare eenmalig je **workers.dev-subdomein** aan: Workers & Pages → rechts "Your subdomain".
2. Workers & Pages → **Create** → **Import a repository** → GitHub → kies `luxmini`. Laat de standaardinstellingen staan:
   - Build command: `echo "$WORKERS_CI_COMMIT_SHA" > public/versie.txt` (zo kan de rooktest zien dat de nieuwe versie live staat);
   - Deploy command: `npx wrangler deploy`;
   - Preview command: laat de standaard `npx wrangler preview` staan;
   - let op: Cloudflare vult bij *Deploy command* soms `npx wrangler versions upload` in. Dat zet niets live; vervang het door `npx wrangler deploy`;
   - zet daarna onder Settings → Builds **Builds for non-production branches** aan, dan krijgt elke pull request een eigen preview-link;
   - controleer dat er **geen builds voor pull requests uit forks** draaien (de repository is openbaar: anders kan code van vreemden een preview op jouw account krijgen).
3. Cloudflare bouwt `main` en zet de site op `https://luxmini.<jouw-subdomein>.workers.dev`. Er is geen API-token nodig: GitHub en Cloudflare regelen de toegang onderling.
4. **Faalt deze eerste build op e-mail** (melding over `send_email` of Email Routing)? Email Routing staat dan nog niet aan; dat komt pas in stap 4. Laat Claude in een pull request het `send_email`-blok in `wrangler.jsonc` tijdelijk uitzetten. De site werkt dan gewoon; alleen het formulier geeft netjes een foutmelding met de WhatsApp-, bel- en mailopties, tot Email Routing aanstaat en het blok terugkomt.
5. **Lockfile:** zodra de code op GitHub staat, draai je op je eigen computer één keer `npm install` en zet je de nieuwe `package-lock.json` erbij via een pull request (of vraag Claude dat te doen). Dan gebruiken GitHub en Cloudflare altijd dezelfde wrangler-versie.

### 3. Controles en bescherming in GitHub
1. GitHub → repository → Settings → Secrets and variables → Actions → **Variables** → `SITE_URL` = `https://luxmini.<jouw-subdomein>.workers.dev`.
2. Settings → **Rules → Rulesets → New branch ruleset** voor `main`:
   - *Restrict deletions* en *Block force pushes*;
   - *Require a pull request before merging* (0 goedkeuringen nodig: je kunt je eigen pull request niet goedkeuren);
   - *Require status checks to pass*: `Gate 1 · Tests` en `Gate 2 · Sitecontrole`;
   - geen uitzonderingen (bypass list leeg).
   De controles verschijnen pas in de keuzelijst nadat ze één keer gedraaid hebben: kom na de eerste pull request terug om ze aan te vinken.
3. Vanaf nu kan niemand nog direct op `main` zetten: alles gaat via een pull request met groene controles.
4. **Eerlijk over de grens:** met 0 verplichte goedkeuringen kan iedereen met schrijfrechten een groene pull request mergen. Claude mag dat niet (afspraak in `CLAUDE.md` en de agents, en `.claude/settings.json` blokkeert `gh pr merge`, `gh api` en `git merge`), maar dat is een afspraak, geen slot. Wil je het hard afdwingen, geef Carien dan een eigen GitHub-account en zet in de ruleset **1 goedkeuring** verplicht: dan gaat er niets live zonder haar klik.
5. GitHub zet geplande workflows (de dagelijkse rooktest) uit als er 60 dagen niets aan de repository verandert. Je krijgt daar een mail over; met één klik staat hij weer aan.

### 4. Domein naar Cloudflare (pas na akkoord van Carien)
De registratie blijft bij GoDaddy; alleen de nameservers gaan naar Cloudflare.
1. Cloudflare → *Add a domain* → `luxmini.nl` → **Free**. Cloudflare neemt de bestaande DNS-records over, ook de A-record en de `www`-CNAME die naar Wix wijzen. Zet die records op **DNS only** (grijs wolkje), zodat Wix voorlopig blijft werken zonder certificaat- of doorverwijsproblemen.
2. **E-mail op het domein?** Kijk of er MX-records staan. Gebruikt niemand een mailbox op `@luxmini.nl` (Carien mailt via Gmail), dan mogen die weg. Wordt er wél mail op het domein gebruikt, overleg dan eerst: Email Routing vervangt die.
3. Vervang bij GoDaddy (Mijn producten → luxmini.nl → DNS → Nameservers → *Mijn eigen nameservers*) de nameservers door de twee van Cloudflare. Wacht tot Cloudflare meldt dat het domein actief is.
4. **Email Routing:** Cloudflare → luxmini.nl → Email → Email Routing → *Get started* → voeg `info.luxmini@gmail.com` toe als bestemming en laat Carien de bevestigingslink aanklikken → *Enable*. Vanaf nu verstuurt het contactformulier mail.

### 5. Live op luxmini.nl
1. Verwijder in Cloudflare → luxmini.nl → DNS de oude Wix-records voor `luxmini.nl` (`@`) en `www`.
2. Haal in `wrangler.jsonc` de `//` weg voor het `routes`-blok en merge dat via een pull request. Cloudflare koppelt `www.luxmini.nl` en `luxmini.nl` aan de Worker.
3. luxmini.nl → Rules → Redirect Rules → sjabloon **Redirect from root to WWW**; SSL/TLS → Edge Certificates → **Always Use HTTPS** aan.
4. Zet de GitHub-variabele `SITE_URL` op `https://www.luxmini.nl`.
5. Werkt alles, zeg dan het Wix-abonnement op. Meld de site aan bij Google Search Console met `https://www.luxmini.nl/sitemap.xml`.

**Let op:** zodra Email Routing aanstaat, versturen previews en de workers.dev-versie bij een testbericht echte mail naar Carien.

## Wijzigingen maken (met Claude Code)

1. Open deze map in Claude Code.
2. Eenmalig: `npm install`, `pip install playwright opencv-python` en `playwright install chromium`. Doe op deze computer **geen** `wrangler login`: live zetten gaat alleen via Cloudflare Workers Builds na een merge.
3. Typ bijvoorbeeld: `/website-update Voeg portfolio-item "Voor Lisa" toe met de foto's in ~/Downloads/lisa`
4. De agents plannen, bouwen, controleren (werking én ontwerp, met een eigen UX/UI-ontwerper als poort) de wijziging, pushen een branch en openen een pull request. GitHub draait de controles; Cloudflare zet de preview-link erbij.
5. Bekijk de preview op je computer en je telefoon. Is alles goed en zijn de controles groen, klik dan op **Merge**. Cloudflare zet de site live; de rooktest controleert hem daarna.

Meer uitleg: `docs/ai-pdlc.md`. Gewenste nieuwe foto's: `docs/fotolijst.md`.

## Nog in te vullen
- KvK-nummer: zoek op `[nummer]` in `public/`.
- Quote bij de atelierfoto in `public/index.html` (gemarkeerd met `LET OP`): Carien keurt goed of geeft eigen woorden.
- `public/privacy.html` laten nakijken door Carien.
