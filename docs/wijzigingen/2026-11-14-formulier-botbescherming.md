# Formulier: botbescherming (tijdcontrole, Turnstile en rate limit)

- **Datum:** 2026-11-14
- **Aangevraagd door:** Carst (14 nov.: "do 1 + 2 + 3 together, go")
- **Branch:** `wijziging/formulier-botbescherming` (vanaf `origin/main`)
- **Issue:** geen nummer bekend (zie Open vragen)
- **Risico:** hoog. Het raakt het formulier (`public/contact.html`, `src/contact.js`, `src/worker.js`), `wrangler.jsonc` (nieuwe binding voor de rate limit en een nieuwe var) en de privacyverklaring. Een fout hier betekent dat echte berichten van ouders niet meer aankomen, of juist allemaal worden geweigerd.

## Doel
Carien krijgt geen spam via het contactformulier. Een echte bezoeker merkt daar zo weinig mogelijk van: de controle is meestal onzichtbaar, en een bericht wordt nooit stil weggegooid.

## Wens
Botbescherming in drie lagen bovenop de bestaande honeypot (`website`, blijft ongewijzigd):
1. **Tijdcontrole:** een bericht dat sneller dan 3 s na het laden wordt verstuurd, is verdacht.
2. **Cloudflare Turnstile:** widget in Managed-modus, `appearance: "interaction-only"`, met controle aan de serverkant (siteverify).
3. **Rate limit:** maximaal 5 verzendingen per 60 s per IP op `POST /api/contact`.

## Technische uitgangspunten (hoofdsessie, aangevuld door planner)

**Volgorde in de Worker** (`src/contact.js`; de planner kiest deze volgorde zodat de rooktest geldig blijft en een Turnstile-token alleen bij geldige invoer wordt verbruikt):
1. Is het geen POST, dan zoals nu.
2. **Rate limit**, vóór het lezen van de body.
3. Te groot verzoek, dan zoals nu (`reden=foto`).
4. `formData`, dan zoals nu.
5. Honeypot `website` gevuld: zoals nu, doen alsof het gelukt is (`/bedankt`).
6. Invoercontrole, foto en link: zoals nu.
7. **Tijdcontrole.**
8. **Turnstile.**
9. Versturen.

**Rate limit.** Workers Rate Limiting-binding in `wrangler.jsonc`, bijvoorbeeld:
```jsonc
"ratelimits": [
  { "name": "CONTACT_RATELIMIT", "namespace_id": "<uniek getal, bijv. 1001>", "simple": { "limit": 5, "period": 60 } }
]
```
- De sleutel is `CF-Connecting-IP`. Gebruik: `const { success } = await env.CONTACT_RATELIMIT.limit({ key })`.
- De Worker slaat niets op en logt nooit een IP. In het log staat alleen `Formulier geweigerd: te-veel`.
- Overschreden: `/contact?verzonden=fout&reden=te-veel#formulier`.
- Ontbreekt de binding (lokaal, of een fout van het platform), dan laat de Worker het bericht door (fail open) en logt hij alleen `Rate limit niet beschikbaar`.
- **Nog niet gecontroleerd:** de planner had hier geen toegang tot het web. De syntax hierboven (sleutel `ratelimits`, `namespace_id`, `simple.period` alleen 10 of 60) en of dit op het gratis Workers-plan kan, zijn niet nagekeken. **Eerste stap van de bouwer:** controleer dit op developers.cloudflare.com (Workers → Runtime APIs → Rate Limiting) en noteer de bron in het Verloop. Kan het niet op het gratis plan, dan valt (3) terug op een WAF-regel die Carst instelt (zie Open vragen 2). Die werkt pas als luxmini.nl in Cloudflare staat, en niet op `*.workers.dev`.

**Tijdcontrole.**
- `main.js` maakt bij het laden van `contact.html` een verborgen veld aan, bijvoorbeeld `formtijd`. Dat het veld bestaat, bewijst dat JavaScript draaide.
- Bij het verzenden schrijft `main.js` in dat veld de **verstreken tijd in milliseconden sinds het laden** (`performance.now()`), en niet de klok van het apparaat. De planner kiest dit omdat een klok die een paar minuten voor- of achterloopt anders een echte bezoeker blokkeert.
- De Worker weigert alleen als het veld aanwezig is en een waarde heeft die geen geheel getal ≥ 3000 is. Dan volgt `reden=te-snel`.
- Ontbreekt het veld (geen JavaScript), dan is er geen tijdcontrole. De honeypot en de rate limit blijven wel werken.
- Het veld komt nooit in de mail.

**Turnstile.**
- De site key is publiek. Hij komt op twee plekken: als `data-sitekey` op het Turnstile-vak in `contact.html` en als var `TURNSTILE_SITEKEY` in `wrangler.jsonc`. Een unit-test bewaakt dat beide gelijk zijn.
- Nu zijn beide leeg (`""`). De secret wordt het Worker-secret `TURNSTILE_SECRET`. Carst stelt dat zelf in. Het secret staat nooit in de repo of in de chat.
- **Uit** (site key of secret leeg/afwezig): `main.js` laadt geen script en toont geen widget. De Worker slaat de controle over. Het formulier werkt dus zoals nu.
- **Aan:** `main.js` laadt `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` (async) alleen op `contact.html` en rendert het vak expliciet met de instellingen uit de Ontwerprichting. De Worker controleert `cf-turnstile-response` via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` met `secret`, `response` en `remoteip` (`CF-Connecting-IP`), met een time-out van 5 s.
- Ontbreekt het token, zegt siteverify `success: false`, of is siteverify niet bereikbaar, dan volgt `reden=controle`. In het log staat alleen `Formulier geweigerd: controle`, zonder token of IP.
- **Testbaar maken:** `verwerkContact(request, verstuur, opties)` krijgt de controles mee als functies, net zoals `verstuur` nu: `opties.limiet(ip)` en `opties.turnstile(token, ip)`, plus de minimale tijd. `src/worker.js` geeft de echte functies mee. De tests en `scripts/serveer.mjs` geven nepfuncties mee.

**Testmodus (alleen `scripts/serveer.mjs`).**
- Header `x-testturnstile: geslaagd | mislukt | interactie`. Bij GET `/contact` zet de testserver de officiële Turnstile-testsite key in `data-sitekey` en haalt hij de commentaartekens rond de `<noscript>`-regel weg (zie criterium 13). Bij POST beoordeelt hij het token met de bijbehorende testsecret (geslaagd of mislukt).
- Header `x-testlimiet: overschreden` laat de nep-rate limit weigeren.
- De sleutels zijn volgens de planner (niet gecontroleerd, de bouwer controleert ze op developers.cloudflare.com → Turnstile → Testing):

  | Doel | Sleutel |
  |---|---|
  | site key, altijd geslaagd | `1x00000000000000000000AA` |
  | site key, altijd geslaagd en onzichtbaar | `1x00000000000000000000BB` |
  | site key, altijd mislukt | `2x00000000000000000000AB` |
  | site key, dwingt interactie af | `3x00000000000000000000FF` |
  | secret, geslaagd | `1x0000000000000000000000000000000AA` |
  | secret, mislukt | `2x0000000000000000000000000000000AA` |
- Er wordt nooit een mail verstuurd. De testmodus staat nooit in `src/`, `public/` of `wrangler.jsonc`.

**CSP.** `public/_headers` heeft nu **geen** Content-Security-Policy voor de publieke pagina's, alleen voor `/beheer*`. Er valt dus niets aan te passen om Turnstile toe te laten (zie Open vragen 4). Een bewakingstest zorgt dat een latere CSP voor `/contact` of `/*` `https://challenges.cloudflare.com` in `script-src` en `frame-src` heeft.

## Acceptatiecriteria

### Worker en rate limit
1. In `wrangler.jsonc` staat de rate limit-binding `CONTACT_RATELIMIT`: 5 per 60 s, in de syntax die de bouwer in de Cloudflare-documentatie heeft gecontroleerd (bron in het Verloop). De bouwer controleert ook of de binding op previews werkt of in `previews` herhaald moet worden. `wrangler deploy --dry-run` slaagt (in CI).
2. De zesde POST binnen 60 s van hetzelfde IP geeft een 303 naar `/contact?verzonden=fout&reden=te-veel#formulier`, vóór het lezen van de body. Zonder binding, of als `limit()` een fout gooit, gaat het bericht door.
3. De Worker logt nooit een IP-adres, token, secret of veldwaarde. Hij logt alleen `Formulier geweigerd: te-veel | te-snel | controle`, `Rate limit niet beschikbaar` en de bestaande regels.
4. De volgorde van de controles is zoals hierboven. De honeypot geeft nog steeds stil `/bedankt`. Ongeldige invoer geeft nog steeds precies `/contact?verzonden=fout#formulier`, ook als Turnstile aanstaat. Daardoor blijft `scripts/rooktest.sh` ongewijzigd groen.

### Tijdcontrole
5. Is `formtijd` aanwezig en kleiner dan 3000 (of geen geheel getal ≥ 0), dan volgt een 303 naar `/contact?verzonden=fout&reden=te-snel#formulier` en wordt er niets verstuurd. Bij ≥ 3000 gaat het verder. Zonder het veld gaat het verder, zonder tijdcontrole.
6. Met JavaScript bestaat het veld vanaf het laden. Bij verzenden binnen 3 s wacht het formulier de resttijd af. Gedurende die tijd heeft de knop `aria-busy="true"` (en `cursor: progress`, zoals nu). Daarna verstuurt het formulier. Het gaat nooit stil naar `/bedankt` zonder echte verzending.

### Turnstile
7. Zolang `data-sitekey`, `TURNSTILE_SITEKEY` of `TURNSTILE_SECRET` leeg is of ontbreekt, laadt `contact.html` niets van `challenges.cloudflare.com` (te controleren in het netwerkverkeer) en slaat de Worker de controle over. Een geldig bericht komt dan aan zoals nu.
8. Staan site key en secret allebei ingesteld, dan:
   - weigert de Worker een bericht zonder token of met een afgekeurd token met `reden=controle`;
   - stuurt hij bij siteverify `remoteip` mee;
   - geldt een time-out of netwerkfout als `controle`;
   - wordt een bericht met een goedgekeurd token verstuurd.
9. Na elke foutmelding (alle redenen) roept `main.js` `turnstile.reset()` aan. Een tweede poging krijgt zo een nieuw token, want een token is maar één keer geldig.
10. Verstuurt de bezoeker terwijl er nog geen token is (de controle loopt nog of wacht op een klik), dan wacht het formulier met `aria-busy="true"`, maximaal 15 s. Komt het token, dan verstuurt het formulier. Komt het niet, dan verschijnt de melding `controle` en wordt er niets verstuurd. (Invulling door de planner; de ontwerper bevestigt dit bij de gate.)
11. `data-sitekey` in `contact.html` en `TURNSTILE_SITEKEY` in `wrangler.jsonc` (ook in `previews`, als die daar nodig is) zijn gelijk. Een unit-test bewaakt dat.
12. De Turnstile-testsleutels (zie de tabel), `x-testturnstile` en `x-testlimiet` komen niet voor in `src/`, `public/` of `wrangler.jsonc`. Dit is een bewakingstest in `tests/formulier-testmodus.test.js`, net als bij `x-testmail`. Er staat nergens in de repo een echte secret.

### Zonder JavaScript
13. De `<noscript>`-regel uit Ontwerprichting punt 4 staat in `contact.html`, direct onder de kop van 002. Zolang Turnstile uit is, is dat bericht niet waar: het formulier werkt dan wel zonder JavaScript. Daarom staat de regel in een HTML-commentaar met vaste markeringen, bijvoorbeeld `<!--TURNSTILE-NOSCRIPT … TURNSTILE-NOSCRIPT-->`. Bij het invullen van de site key gaan die markeringen in dezelfde commit weg (stap in de handleiding). `scripts/controleer.py` bewaakt het volgende: `data-sitekey` is gevuld als en alleen als de `<noscript>`-regel actief is (zonder commentaar). In testmodus haalt `serveer.mjs` de markeringen weg (zie de Testmodus). Zie Open vragen 1.
14. Zonder JavaScript en met Turnstile uit werkt een verzending zoals nu: een gewone POST, 303 naar `/bedankt` of naar de foutpagina.

### Meldingen
15. `redenUit` en `toonFout` in `main.js` kennen `controle`, `te-veel` en `te-snel`, met de teksten uit de Ontwerprichting:
    - Ze beginnen allemaal met "Je bericht is niet verstuurd.".
    - In `controle` en `te-veel` zijn WhatsApp (`https://wa.me/31643791618`) en mail (`mailto:info.LUXmini@gmail.com`) links.
    - In `te-veel` staat "over een minuut", omdat de periode 60 s is (zie Open vragen 3).
    - De melding komt via de bestaande weg (`fetch` en de 303 zonder JavaScript), en alle ingevulde velden blijven staan.

### Privacy en documentatie
16. `privacy.html`: een korte passage (drie zinnen) over Turnstile (was "één zin"; aangepast na ontwerpgate 14 nov.), bij de alinea "De website draait bij Cloudflare…". De bouwer controleert de bewoording tegen de privacy-documentatie van Cloudflare over Turnstile en noemt de bron(nen) in het Verloop. Er komen geen claims in die daar niet staan, zoals "geen cookies". De bouwer controleert ook of de bestaande zin "Deze website plaatst geen tracking- of advertentiecookies." nog klopt met Turnstile. Zo niet: melden onder Open vragen, niet zelf herschrijven.
17. Er is een nieuw bestand `docs/formulier-beveiliging.md` met de stappen voor Carst:
    1. In het Cloudflare-dashboard een Turnstile-widget maken (Managed) met de hostnamen `luxmini.nl`, `www.luxmini.nl` en de workers.dev-/preview-host.
    2. De site key doorgeven. Die is publiek en mag in de chat.
    3. Zelf het secret `TURNSTILE_SECRET` instellen in het dashboard (Worker → Settings → Variables and Secrets) of met `wrangler secret put TURNSTILE_SECRET`. Nooit in de chat of in de repo.
    4. Controleren dat de rate limit actief is, of de WAF-terugvalregel instellen.
    5. Uitzetten in een noodgeval: het secret verwijderen. Dan zet de Worker de controle uit.

    Daarnaast beschrijft het bestand wat Claude doet zodra de site key er is: `data-sitekey` en `TURNSTILE_SITEKEY` vullen en de `<noscript>`-markeringen weghalen. `CLAUDE.md` (formulierregel, `src/`, `wrangler.jsonc`, `serveer.mjs`) verwijst ernaar.

### Tests en harness
18. **Unit (`tests/contact.test.js`, plus nieuwe tests waar nodig):**
    - tijdcontrole: veld ontbreekt → door; 2999 → `te-snel`; 3000 → door; `abc`, `-1` en leeg → `te-snel`;
    - Turnstile uit (geen secret of geen site key) → controle overgeslagen, ook zonder token;
    - Turnstile aan met token → door;
    - aan zonder token, met afgekeurd token, en bij een time-out of fout van siteverify → `controle`;
    - siteverify krijgt `remoteip` (gemockte `fetch`);
    - rate limit gemockt: `success: false` → `te-veel`, zonder dat de body is gelezen; ontbrekende binding of een `limit()` die gooit → door;
    - volgorde: honeypot → `/bedankt` zonder Turnstile-aanroep; ongeldige invoer met Turnstile aan → precies `NA_FOUT`, zonder siteverify-aanroep;
    - de logs bevatten geen IP, token of waarden.
19. **Unit bewaking:**
    - criterium 11 (site key gelijk);
    - criterium 12 (testsleutels en testheaders);
    - `tests/wrangler.test.js` controleert de rate limit-binding en dat `TURNSTILE_SECRET` niet in `vars` staat;
    - CSP-bewaking: als `_headers` een CSP heeft voor `/*` of `/contact`, dan staat `challenges.cloudflare.com` in `script-src` en `frame-src`.
20. **E2e (`tests/e2e/formulier-foutmelding.spec.js` of een nieuwe `formulier-botbescherming.spec.js`, via de testserver, desktop, tablet, mobiel en iPhone):**
    - binnen 1 s invullen en versturen met `x-testmail: ok` → `/bedankt`, zonder melding, en de knop is tussendoor `aria-busy="true"` (ontwerpcriterium 4);
    - `x-testturnstile: geslaagd` → afgeleverd;
    - `mislukt` → melding `controle`, velden blijven staan, en `turnstile.reset` is aangeroepen;
    - `interactie` → het vak is zichtbaar en staat gecentreerd boven de knop, zonder horizontaal scrollen op 390 en 320 px (ontwerpcriterium 2);
    - `x-testlimiet: overschreden` → melding `te-veel`;
    - een POST met `formtijd=500` (zonder de wachttijd in de browser) → `te-snel`;
    - Turnstile uit → geen verzoek naar `challenges.cloudflare.com`;
    - zonder JavaScript met de testsite key: `<noscript>`-regel op 390 px direct onder de kop van 002 (ontwerpcriterium 5);
    - tabvolgorde (ontwerpcriterium 6).

    De test die de echte widget nodig heeft (`interactie`) laadt het script van Cloudflare. Mag dat in CI niet, dan zie Open vragen 5.
21. **Toegankelijkheid:** axe zonder fouten op `contact.html` met elk van de drie meldingen, met het zichtbare Turnstile-vak (testsleutel interactie) en zonder JavaScript.
22. **Sitecontrole (`scripts/controleer.py`):** criterium 13 en `FORMULIER_VELDEN` bijgewerkt waar nodig (`formtijd` en `cf-turnstile-response` worden door JavaScript toegevoegd; ze staan niet in de HTML).
23. **Visueel en snelheid:** de basisschermen van `contact` wijken in rust niet af (Turnstile uit, en aan met de onzichtbare testsleutel); Lighthouse CLS op contact ≤ 0,1 (ontwerpcriterium 1).
24. `npm run check` is groen. Tests, grenzen en axe-regels worden niet versoepeld. `scripts/rooktest.sh` blijft ongewijzigd.

## Ontwerprichting

**Blok 1 · Ontwerprichting**

1. **Bestaande opbouw en klassen, niets nieuws in beeld.** Het formulier staat op terracotta (`.op-kleur`, `#formulier`). De volgorde onderaan wordt: de foutmelding (`.melding.fout`, alleen bij een fout) → de privacyzin (`.melding`) → het Turnstile-vak → de knop `.verstuur` "Verstuur bericht". Het Turnstile-vak beslaat de volle breedte (`grid-column: 1 / -1`) en staat gecentreerd, net als de knop. Gebruik geen nieuwe knop of nieuwe kleur, en geen tekst als "Ik ben geen robot" van ons zelf. De meldingen gebruiken de functie `toonFout()` in `main.js`. Die zet altijd hetzelfde element boven de privacyzin, met `role="alert"`, `tabindex="-1"`, max. 60ch en `text-wrap: balance`. Er komen drie nieuwe redenen bij, met de vaste openingszin **"Je bericht is niet verstuurd."**:
   - `reden=controle`: "De controle tegen spam lukte niet. Probeer het nog eens, of stuur Carien een WhatsApp of mail."
   - `reden=te-veel`: "Er zijn in korte tijd veel berichten verstuurd. Probeer het over een uur nog eens, of stuur Carien een WhatsApp of mail." Gebruik de echte tijd van de rate limit, of anders "later". Schrijf nooit iets dat de bezoeker beschuldigt.
   - `reden=te-snel`: alleen voor het geval dat dit zonder JavaScript gebeurt (zie punt 3): "Dat ging sneller dan we verwachten. Wacht een paar tellen en verstuur het nog eens."
   WhatsApp en mail zijn links, zoals in de bestaande melding `versturen`. Bij elke fout blijven alle ingevulde velden staan.
2. **Turnstile: meestal onzichtbaar, soms een klik, en nooit verspringen waar de bezoeker kijkt.**
   - Instellingen: `appearance: "interaction-only"`, `theme: "light"` en `language: "nl"`. Het lichte thema sluit aan bij de bijna witte velden (`rgba(255,255,255,.92)`). Kies op schermen vanaf 360 px `size: "normal"` (300 × 65) en daaronder `"compact"`, via matchMedia bij het tonen.
   - Het vak is in rust 0 px hoog, zodat er geen lege strook is. Het gaat open zonder animatie.
   - Laat de controle meteen bij het laden draaien (de standaardinstelling), zodat het token klaar is voordat de bezoeker bij de knop is.
   - Zet `refresh-expired: "auto"`.
3. **De tijdcontrole merkt een mens niet.** Is de bezoeker met JavaScript binnen 3 s klaar, dan wacht het formulier zelf de resterende tijd af en verstuurt het daarna. De knop krijgt in die tijd `aria-busy="true"`. De melding `te-snel` verschijnt dus in de praktijk alleen zonder JavaScript. Stuur een bericht dat te snel kwam nooit stil naar de bedankpagina.
4. **Zonder JavaScript: zeg het vóórdat de bezoeker gaat typen.** Zet bovenaan het formulier, direct onder de kop van 002, een `<noscript>`-regel in de stijl van `.melding` (inkt, 16 px, max. 60ch, gecentreerd): "Zonder JavaScript kan dit formulier je bericht niet versturen. Stuur Carien een WhatsApp, bel of mail haar, of zet JavaScript aan." WhatsApp, bellen en mail zijn hier links.
5. **Toetsenbord, schermlezer en minder beweging.** Tabvolgorde: laatste veld → privacylink → Turnstile-vak (alleen als zichtbaar) → "Verstuur bericht". Bij een fout krijgt de melding de focus en staan melding en knop samen in beeld (`meldingInBeeld()`). Geen eigen beweging.
6. **Privacy.** Eén zin in `privacy.html` bij de alinea "De website draait bij Cloudflare…". Voorstel: "Om spam tegen te houden controleert Cloudflare Turnstile bij het formulier of het bericht van een mens komt; daarvoor verwerkt Cloudflare technische gegevens van je browser en apparaat, zoals je IP-adres." Naast de documentatie van Cloudflare leggen; geen claims die daar niet staan.

**Blok 2 · Ontwerpcriteria (toetsbaar)**
1. Geen lege strook en geen verspringing: op 390 × 844 en 1440 × 900 in rust dezelfde afstand privacyzin–knop als op `main`; visuele test `contact` wijkt in rust niet af; Lighthouse CLS contact ≤ 0,1.
2. Zichtbare uitdaging (testsleutel "interaction required") staat gecentreerd boven de knop, geen horizontaal scrollen op 390 en 320 px (compact); knop ≥ 44 px hoog.
3. Meldingen `controle`, `te-veel`, `te-snel` op de plek van de bestaande foutmelding, role=alert met focus, ≤ 60ch, 16 px inkt op terracotta (≥ 4,5:1), beginnen met "Je bericht is niet verstuurd.", werkende links WhatsApp en mail; op 390 px melding en knop samen in beeld; alle velden blijven staan.
4. Met JS wordt een formulier dat binnen 1 s is ingevuld en verstuurd toch afgeleverd (`x-testmail: ok`), zonder melding; knop in de wachttijd `aria-busy="true"`.
5. Zonder JS staat de `<noscript>`-regel op 390 px direct onder de kop van 002, vóór het eerste veld, ≥ 16 px, tikdoelen 44 px, axe zonder fouten.
6. Tabvolgorde en zichtbare focus zoals beschreven; geen eigen animatie bij minder beweging; privacy.html noemt Turnstile in een korte passage (drie zinnen).

## Bestanden
- `src/contact.js`: volgorde, rate limit, tijdcontrole, Turnstile (via opties), nieuwe doeladressen `NA_TE_VEEL`, `NA_TE_SNEL` en `NA_CONTROLE`
- `src/worker.js`: echte rate limit (`env.CONTACT_RATELIMIT`) en siteverify (`env.TURNSTILE_SECRET`, `env.TURNSTILE_SITEKEY`) meegeven
- `src/formulier.js`: alleen als nodig, zodat `formtijd` en `cf-turnstile-response` nooit in de mail komen
- `wrangler.jsonc`: `ratelimits`, var `TURNSTILE_SITEKEY: ""` (en eventueel in `previews`), commentaar dat het secret `TURNSTILE_SECRET` daar nooit staat
- `public/contact.html`: Turnstile-vak met `data-sitekey=""`, `<noscript>`-regel in commentaar met markeringen
- `public/assets/js/main.js`: veld `formtijd`, wachten op tijd en token, script laden en renderen, `reset`, drie nieuwe redenen
- `public/assets/css/style.css`: Turnstile-vak (volle breedte, gecentreerd, 0 px in rust), stijl van de `<noscript>`-regel
- `public/privacy.html`: korte passage (drie zinnen) over Turnstile
- `scripts/serveer.mjs`: testmodus `x-testturnstile` en `x-testlimiet`
- `scripts/controleer.py`: bewaking site key ⇔ `<noscript>`
- `tests/contact.test.js`, `tests/formulier-testmodus.test.js`, `tests/wrangler.test.js` en eventueel een nieuwe unit-test
- `tests/e2e/formulier-foutmelding.spec.js` of nieuw `tests/e2e/formulier-botbescherming.spec.js`, `tests/e2e/toegankelijkheid.spec.js`
- `docs/formulier-beveiliging.md` (nieuw), `CLAUDE.md`

## Buiten scope
- De echte site key en het echte secret invullen. Dat gebeurt pas als Carst de widget heeft gemaakt (de handleiding beschrijft het).
- Een CSP voor de publieke pagina's (zie Open vragen 4).
- WAF-regels of andere instellingen in het Cloudflare-dashboard. Die stelt Carst in, alleen als terugval.
- Wijzigingen aan de velden, de maatkeuzes, de stofkeuze, de mail zelf, de honeypot, `run_worker_first`, `_redirects`, `.github/workflows/` of `scripts/rooktest.sh`.
- Een melding zonder JavaScript op de foutpagina. Die verschijnt nu ook niet (geaccepteerd op 11 nov., brief 2026-11-11-formulier-foutmelding).
- Opslaan of tellen van berichten of IP-adressen buiten de rate limit van Cloudflare.

## Open vragen
**Blokkerend vóór het bouwen:**
1. **De `<noscript>`-regel terwijl Turnstile uit staat.** Zolang er geen site key is, werkt het formulier wél zonder JavaScript. Een `<noscript>`-regel die zegt dat het niet kan, zou dan onwaar zijn. Voorstel (criterium 13): de regel staat al in `contact.html`, maar binnen HTML-commentaar met markeringen. Hij wordt actief in dezelfde commit waarin de site key wordt ingevuld, en `controleer.py` bewaakt dat die twee samengaan. Akkoord, of moet de regel nu al zichtbaar zijn?
2. **Rate limit op het gratis plan.** Dat is niet gecontroleerd, want de planner had geen webtoegang. Kan de binding niet op het plan van Carst, dan wordt de terugval een WAF-regel voor rate limiting. Die werkt pas na het omzetten van de nameservers (akkoord van Carien) en nooit op `*.workers.dev`. Is die terugval acceptabel, of moet de bouwer dan stoppen en eerst overleggen?

**Niet blokkerend (de bouwer volgt het voorstel, tenzij iemand anders beslist):**

3. **Tijd in `te-veel`.** De ontwerper schrijft "over een uur" en vraagt de echte tijd van de rate limit te gebruiken. Die is 60 s, dus in de brief staat "over een minuut".
4. **CSP.** De hoofdsessie vroeg om `challenges.cloudflare.com` toe te voegen aan de CSP in `public/_headers`, maar voor de publieke pagina's is er geen CSP. Er een nieuwe neerzetten (inline scripts en stijlen, lettertypes, Turnstile) is een eigen wijziging met eigen risico. Voorstel: in deze brief alleen een bewakingstest (criterium 19), en de CSP later als aparte brief.
5. **Cloudflare-script in CI.** Voor de test met de zichtbare uitdaging moet de browser in CI `challenges.cloudflare.com` kunnen laden. Voorstel: alleen die test (en axe met het zichtbare vak) gebruikt het echte script. De andere tests geven met `page.route` een klein nep-`turnstile`-object, dat bijhoudt of `render` en `reset` worden aangeroepen. Is het script in CI niet bereikbaar, dan meldt de bouwer dat. Hij mag de test niet overslaan zonder akkoord van Carst.
6. **Previews.** Previews draaien op een workers.dev-host. Staat die host niet in de hostnamen van de widget, dan faalt Turnstile op elke preview en weigert de Worker daar elk bericht. Nog na te gaan: of Turnstile jokertekens toestaat voor de preview-hosts, en of `TURNSTILE_SECRET` en de rate limit-binding ook voor previews gelden. Voorstel: de handleiding noemt de preview-host. Lukt dat niet, dan blijft `TURNSTILE_SITEKEY` in `previews` leeg (Turnstile uit op previews).
7. **Wachten op het token (criterium 10, 15 s)** en **siteverify niet bereikbaar → `controle`** zijn invullingen van de planner. De ontwerper bevestigt dat bij de gate.
8. **Cookies in de privacyverklaring.** De zin "Deze website plaatst geen tracking- of advertentiecookies." moet tegen de documentatie van Turnstile worden gelegd (criterium 16). Er wordt niets aangenomen.
9. **Issue en één story per brief.** Er is geen issuenummer bekend. De drie lagen staan op uitdrukkelijk verzoek van Carst in één brief. Heeft dit een issue, dan krijgt de pull request `Closes #<nummer>`.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief uit de wens van Carst (14 nov.) en de technische keuzes van de hoofdsessie. Ontwerprichting en ontwerpcriteria van website-ontwerper letterlijk overgenomen. Toegevoegd door de planner: volgorde van de controles (rooktest blijft geldig, token alleen bij geldige invoer), verstreken tijd in plaats van de klok van het apparaat, `reset` na elke fout, site key op twee plekken met een gelijkheidstest, `<noscript>` in commentaar tot er een site key is. De syntax van de rate limit, het gratis plan en de Turnstile-testsleutels zijn niet tegen de Cloudflare-documentatie gecontroleerd (geen webtoegang); dat is de eerste stap van de bouwer. Risico hoog (formulier, `wrangler.jsonc`) |
| Bouwen | website-bouwer | **Bronnen (eerste stap):** developers.cloudflare.com, GitHub en de npm-registry waren vanuit de bouwomgeving niet bereikbaar (proxy 403). Gecontroleerd met de lokale Cloudflare-skills (`cloudflare`, `turnstile-spin`: siteverify met `secret`, `response`, `remoteip`, fail closed) en eigen kennis; **niet tegen de live documentatie gelegd**: (a) `ratelimits` met `name`, `namespace_id` (getal als tekst), `simple.limit`/`simple.period` (alleen 10 of 60) en `env.X.limit({ key })` → `{ success }`; (b) of de binding op het gratis Workers-plan kan (volgens mijn kennis wel, onzeker); (c) de testsleutels uit de tabel (komen overeen met mijn kennis van Turnstile → Testing); (d) of bindings in `previews` herhaald moeten worden: `ratelimits` staat er voor de zekerheid in, met een eigen teller (`namespace_id` 1002), net als `send_email`; (e) de privacyzin en de cookiezin (zie onder). `wrangler deploy --dry-run` (CI) toetst (a) en (d). **Gebouwd:** `src/contact.js` volgorde rate limit → grootte → formData → spamval → invoer/foto/link → tijdcontrole → Turnstile → versturen, `NA_TE_VEEL`/`NA_TE_SNEL`/`NA_CONTROLE`, `maakSiteverify` (5 s, `remoteip`), controles via `opties` (`limiet`, `turnstile`, `minTijd`), logs alleen de vaste regels; `src/worker.js` geeft binding en siteverify mee (Turnstile alleen met `TURNSTILE_SITEKEY` én `TURNSTILE_SECRET`); `wrangler.jsonc` `ratelimits` (5/60) en var `TURNSTILE_SITEKEY: ""` (ook previews); `contact.html` `.turnstile-vak` met leeg `data-sitekey` tussen privacyzin en knop, `<noscript>`-regel onder de kop van 002 in commentaar `TURNSTILE-NOSCRIPT`; `main.js` veld `formtijd` vanaf het laden, wacht resttijd (3 s) en token (max. 15 s) met `aria-busy`, script alleen bij gevulde site key, render met `interaction-only`/light/nl/normal (compact < 360 px)/`refresh-expired: auto`, `reset` na elke fout, drie meldingen ("over een minuut"); `style.css` vak in rust absoluut 0 × 0 (geen rijafstand), `.zichtbaar` gecentreerd over de volle breedte; `privacy.html` de voorgestelde zin; `serveer.mjs` `x-testlimiet` en `x-testturnstile`; `controleer.py` site key ⇔ `<noscript>` en `formtijd` in `FORMULIER_VELDEN`; `docs/formulier-beveiliging.md` (stappen Carst, WAF-terugval, noodstop, wat Claude doet), `CLAUDE.md`. Tests: `contact.test.js` (+17), nieuw `botbescherming.test.js` (site key gelijk, `<noscript>`, geen secret, CSP-bewaking), `wrangler.test.js` (+2), `formulier-testmodus.test.js` (+8), nieuw e2e `formulier-botbescherming.spec.js`, `toegankelijkheid.spec.js` (+5). **`npm run check` lokaal** (poort 4197): npm test 178/178 groen; sitecontrole geen fouten; e2e 357 groen, 0 fout, 213 overgeslagen (desktop, tablet, mobiel in Chromium; zonder axe-specs). Lokaal niet te draaien (npm-registry en Cloudflare onbereikbaar), **alleen in CI**: axe (`@axe-core/playwright`, ook de 5 nieuwe axe-tests), Lighthouse (CLS contact), wrangler dry-run, WebKit/iPhone, visueel, en de tests met het echte Turnstile-script (testsleutel interactie: vak gecentreerd op 390/320 px, tab naar het vak, axe met het vak; lokaal overgeslagen omdat `challenges.cloudflare.com` onbereikbaar is, in CI nooit overgeslagen). Validatierapport: NO-GO omdat de gates daar pas in CI worden ingevuld en controleur en ontwerpgate nog open staan. **Open:** (1) Bronnen (a)–(e) door de controleur of Carst naast developers.cloudflare.com leggen; (2) privacy: de zin over Turnstile en de bestaande zin "geen tracking- of advertentiecookies" zijn niet tegen de privacydocumentatie van Turnstile gelegd (niet bereikbaar); de cookiezin is niet herschreven; de Turnstile-zin staat er al terwijl Turnstile nog uit staat; (3) criterium 7: de browser kan het secret niet zien, dus de pagina laadt het script zodra `data-sitekey` gevuld is (de Worker controleert pas met site key én secret); (4) axe binnen het iframe van Cloudflare kan in CI fouten geven die wij niet kunnen oplossen; (5) Turnstile-hostnamen voor previews (jokertekens) nog na te gaan. Visueel: geen bedoelde wijziging in rust (Turnstile uit, `<noscript>` in commentaar) |
| Bouwen ronde 2 | website-bouwer | Na NIET AKKOORD controleur (ronde 1). (1) `docs/formulier-beveiliging.md` stap 5: noodstop eerlijk in twee gevallen: (a) Worker weigert ten onrechte → secret `TURNSTILE_SECRET` verwijderen zet de serverkant uit; (b) widget faalt in de browser (hostnaam, script geblokkeerd, error-callback) → met gevulde `data-sitekey` krijgt elke bezoeker met JavaScript na 15 s `controle` en gaat er niets naar de Worker; dan helpt alleen `data-sitekey` (en `TURNSTILE_SITEKEY`) leegmaken, `<noscript>`-markeringen terug, privacyzin nalopen, PR, GO, live. `main.js` niet veranderd (criterium 10 blijft). (2) `privacy.html`: Turnstile-zin voorwaardelijk ("kan … gebruiken") en in lijn met het Turnstile Privacy Addendum van Cloudflare (bron: https://www.cloudflare.com/turnstile-privacy-policy/, gelezen door de hoofdsessie op 14 nov. 2026: technische signalen zoals IP-adres, TLS-vingerafdruk, User-Agent en sitekey met herkomst; strikt nodig voor botdetectie; doel alleen bots herkennen en tegenhouden, niet identificeren, profileren of targeten). Cookiezin ongewijzigd (klopt: geen tracking- of advertentiecookies). Geen test toetste de oude zin letterlijk, dus geen testwijziging. (3) `package.json`: `wrangler` `^4.36.0` (rate limit-binding vraagt ≥ 4.36). **Uitkomst:** `npm test` 178/178 groen; `scripts/controleer.py` geen fouten; Playwright op Chromium (eigen poort 4201, tijdelijke config buiten de repo) voor `formulier-botbescherming`, `formulier-foutmelding`, `seo-veiligheid`, `kernpaden`, `plaatshouders`: 195 groen, 0 fout, 72 overgeslagen (iPhone/WebKit, axe en echt Turnstile-script: alleen in CI). Volledige `npm run check` (axe, Lighthouse, wrangler dry-run, visueel) alleen in CI. Visueel: privacy.html heeft een langere zin (bedoeld). |
| Controleren | website-controleur | Ronde 1 NIET AKKOORD: noodstop klopte niet bij falende widget; privacyzin niet tegen bron en al zichtbaar terwijl Turnstile uit staat. Ronde 2 AKKOORD: noodstop klopt in twee gevallen, privacyzin voorwaardelijk en in lijn met het Turnstile Privacy Addendum, wrangler ^4.36; npm test 178/178, sitecontrole zonder fouten, Playwright Chromium 192 groen (3 timingtests door drukte, los opnieuw groen); axe/Lighthouse/dry-run alleen in CI. Kan beter (niet blokkerend): unit-test dat privacy.html Turnstile en IP-adres noemt zolang `data-sitekey` gevuld is |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD: rust ongewijzigd (18 px privacyzin–knop), vak gecentreerd zonder horizontaal scrollen op 390/320 px, drie meldingen 16 px inkt met focus en links, noscript-regel goed; privacypassage van drie korte zinnen akkoord (brieftekst bijgewerkt); echte widget, axe, WebKit en visueel alleen in CI. Kan beter: regellengte privacy.html (aparte brief), padding links in de noscript-regel |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

## Besluiten hoofdsessie (14 nov.)
1. **`<noscript>`-regel:** akkoord met het voorstel — de regel staat in HTML-commentaar met markeringen en wordt actief in dezelfde commit als de site key; `controleer.py` bewaakt dat die twee samengaan.
2. **Terugval rate limit:** niet stoppen. Kan de Workers Rate Limiting-binding niet op het gratis plan, bouw dan laag 1 en 2 af, laat de Worker zonder binding gewoon doorgaan (criterium blijft), en schrijf de WAF-regel als stappen voor Carst in `docs/formulier-beveiliging.md` (met de beperking: werkt alleen op het eigen domein). Noteer de bron in het Verloop.
3. **Niet-blokkerende voorstellen:** zoals in de brief ("over een minuut", geen CSP in deze brief, nep-object in CI, Turnstile uit op previews als de host niet in de widget kan, cookiezin alleen met bron).
