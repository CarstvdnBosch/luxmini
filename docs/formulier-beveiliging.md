# Formulier: botbescherming (tijdcontrole, Turnstile en rate limit)

Korte handleiding bij de brief `docs/wijzigingen/2026-11-14-formulier-botbescherming.md`. Hier staat hoe de bescherming van het contactformulier werkt, welke stappen Carst in Cloudflare doet en wat Claude doet zodra de site key er is.

## Hoe het werkt

Bovenop de bestaande spamval (het verborgen veld `website`) zitten drie lagen. De Worker (`src/contact.js`) controleert in deze volgorde:

1. **Rate limit** (vóór het lezen van het bericht): max. 5 verzendingen per 60 s per IP (`CF-Connecting-IP`), via de binding `CONTACT_RATELIMIT` in `wrangler.jsonc`. Te veel → `/contact?verzonden=fout&reden=te-veel#formulier`. De teller is per Cloudflare-locatie en bij benadering. Ontbreekt de binding of geeft het platform een fout, dan gaat het bericht gewoon door (log: `Rate limit niet beschikbaar`).
2. Te groot verzoek, onleesbaar formulier, spamval, invoer, foto en link: zoals voorheen.
3. **Tijdcontrole:** `main.js` maakt bij het laden het verborgen veld `formtijd` en zet er bij het versturen in hoeveel milliseconden er sinds het laden voorbij zijn. Kleiner dan 3000 → `reden=te-snel`. Met JavaScript wacht het formulier zelf de resttijd af, dus een mens merkt hier niets van. Zonder JavaScript is er geen veld en dus geen tijdcontrole.
4. **Turnstile** (alleen als het aanstaat): de Worker controleert het token `cf-turnstile-response` bij Cloudflare (siteverify, met `remoteip`, time-out 5 s). Geen token, afgekeurd, of siteverify niet bereikbaar → `reden=controle`.
5. Versturen.

De Worker logt nooit een IP-adres, token, secret of veldwaarde; alleen `Formulier geweigerd: te-veel | te-snel | controle` en `Rate limit niet beschikbaar`. Er wordt niets opgeslagen.

### Wanneer staat Turnstile aan?

| Situatie | Gevolg |
|---|---|
| `data-sitekey` in `public/contact.html` leeg (zo staat het nu) | De pagina laadt niets van `challenges.cloudflare.com` en toont geen vak. |
| `TURNSTILE_SITEKEY` (var) of `TURNSTILE_SECRET` (secret) leeg of afwezig | De Worker slaat de Turnstile-controle over. |
| Site key op beide plekken én het secret ingesteld | Turnstile staat aan: meestal onzichtbaar (Managed, `interaction-only`), soms één klik. |

Zolang Turnstile uit staat, werken de tijdcontrole, de rate limit en de spamval wel.

## Stappen voor Carst

1. **Turnstile-widget maken.** Cloudflare-dashboard → **Turnstile** → *Add widget*. Naam bijv. `luxmini-formulier`, modus **Managed**. Hostnamen: `luxmini.nl`, `www.luxmini.nl` en de workers.dev-host van de Worker (`luxmini.<account>.workers.dev`). Previews draaien op een eigen host per versie; ga na of die onder de workers.dev-host vallen. Lukt dat niet, dan blijft Turnstile op previews uit (zie hieronder).
2. **De site key doorgeven.** Die is publiek en mag in de chat of in een issue.
3. **Het secret zelf instellen**, nooit in de chat, een issue of de repo:
   - in het dashboard: **Workers & Pages** → `luxmini` → **Settings** → **Variables and Secrets** → *Add* → type **Secret**, naam `TURNSTILE_SECRET`; of
   - in een terminal: `npx wrangler secret put TURNSTILE_SECRET` en het secret plakken als daarom wordt gevraagd.
   De volgorde maakt niet uit: de Worker controleert pas als zowel de site key (`TURNSTILE_SITEKEY`) als het secret er zijn. Het secret mag dus al vóór de commit met de site key staan.
4. **Rate limit controleren.** Na het live zetten: dashboard → `luxmini` → **Settings** → **Bindings**: daar hoort `CONTACT_RATELIMIT` (Rate limit) te staan. Staat hij er niet (bijv. omdat het plan het niet toestaat), stel dan de terugvalregel in:
   - **Terugval: WAF-regel** (werkt alleen als luxmini.nl in Cloudflare staat, dus na het omzetten van de nameservers, en nooit op `*.workers.dev`). Dashboard → zone `luxmini.nl` → **Security** → **WAF** → **Rate limiting rules** → *Create rule*:
     - naam: `Contactformulier`;
     - als: `(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")`;
     - tellen per: IP;
     - grens: zo dicht mogelijk bij 5 per minuut binnen wat het plan toestaat (op het gratis plan is de periode mogelijk vast op 10 s: kies dan bijv. 3 per 10 s);
     - actie: **Block**, zo kort als het plan toestaat.
     Let op: een WAF-blokkade geeft de bezoeker een pagina van Cloudflare, niet de eigen melding van de site.
5. **Uitzetten in een noodgeval** (er komen ineens geen berichten meer binnen). Er zijn twee gevallen, met elk een eigen oplossing. Weet je niet welk geval het is, doe dan beide.
   - **(a) De Worker weigert ten onrechte** (de bezoeker krijgt de melding "De controle tegen spam lukte niet" pas na het versturen, bijv. omdat het secret niet bij de widget hoort of siteverify hapert): verwijder het secret `TURNSTILE_SECRET` (dashboard → Variables and Secrets → verwijderen, of `npx wrangler secret delete TURNSTILE_SECRET`). Daarmee staat de controle aan de serverkant direct uit; er hoeft niets live gezet te worden.
   - **(b) Het vak faalt in de browser** (de hostnaam staat niet in de widget, het script van `challenges.cloudflare.com` wordt geblokkeerd, of de widget geeft een fout): zolang `data-sitekey` in `public/contact.html` gevuld is, wacht het formulier op een token. Komt dat niet, dan krijgt **elke bezoeker met JavaScript** na 15 s de melding `controle` en gaat er niets naar de Worker. Het secret weghalen helpt dan **niet**. Oplossing: Claude maakt `data-sitekey` in `public/contact.html` weer leeg (en `vars.TURNSTILE_SITEKEY` in `wrangler.jsonc`, zodat de twee gelijk blijven), zet de markeringen `<!--TURNSTILE-NOSCRIPT` en `TURNSTILE-NOSCRIPT-->` terug rond de `<noscript>`-regel en past de zin over Turnstile in `public/privacy.html` aan als dat nodig is. Daarna gaat het de gewone weg: pull request, GO van Carst, live. Tot dat live staat, komen berichten via het formulier niet aan; WhatsApp, telefoon en mail op de contactpagina werken wel.

## Wat Claude doet zodra de site key er is

In één commit, op een eigen branch met brief en de gewone controles:

1. `public/contact.html`: de site key invullen in `data-sitekey` op het `.turnstile-vak`.
2. `wrangler.jsonc`: dezelfde site key in `vars.TURNSTILE_SITEKEY`. `previews.vars.TURNSTILE_SITEKEY` alleen invullen als de preview-host in de hostnamen van de widget staat; anders leeg laten (Turnstile uit op previews).
3. `public/contact.html`: de markeringen `<!--TURNSTILE-NOSCRIPT` en `TURNSTILE-NOSCRIPT-->` rond de `<noscript>`-regel onder de kop van 002 weghalen. Die regel is pas waar als Turnstile aanstaat (dan kan het formulier zonder JavaScript niet meer versturen).
4. `npm run check` draaien. `tests/botbescherming.test.js` en `scripts/controleer.py` bewaken dat site key en `<noscript>`-regel samengaan en dat de site key op beide plekken gelijk is.

Het secret komt nooit in de repo; een test zoekt daarnaar.

## Lokaal testen (testmodus)

Alleen in `scripts/serveer.mjs`, nooit in `src/`, `public/` of `wrangler.jsonc` (een test bewaakt dat):

- `x-testlimiet: overschreden`: de nep-rate limit weigert (`reden=te-veel`).
- `x-testturnstile: geslaagd | mislukt | interactie`: bij GET `/contact` krijgt `data-sitekey` een officiële testsleutel van Cloudflare en wordt de `<noscript>`-regel actief; bij POST staat Turnstile aan en beoordeelt de testserver het token zoals siteverify met de testsecret (geslaagd of mislukt). Er gaat nooit iets naar Cloudflare en er gaat nooit een mail weg.

Tests: `tests/contact.test.js` (volgorde, tijdcontrole, Turnstile, rate limit, logs), `tests/botbescherming.test.js` (site key, `<noscript>`, geen secret, CSP), `tests/wrangler.test.js` (binding), `tests/formulier-testmodus.test.js` (testmodus), `tests/e2e/formulier-botbescherming.spec.js` en `tests/e2e/toegankelijkheid.spec.js`. De e2e-tests met het zichtbare vak laden het echte script van Cloudflare met de testsleutel "interactie"; lokaal slaan ze over als `challenges.cloudflare.com` niet bereikbaar is, in CI draaien ze altijd.

## Content-Security-Policy

De publieke pagina's hebben nu geen CSP (alleen `/beheer*`). Komt er later een CSP voor `/*` of `/contact`, dan moet `https://challenges.cloudflare.com` in `script-src` en `frame-src` staan; `tests/botbescherming.test.js` bewaakt dat.
