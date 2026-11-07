# Beheer: administratie op luxmini.nl/beheer

Korte handleiding bij de brief `docs/wijzigingen/2026-11-07-beheer-administratie.md`. Hier staat hoe beheer in elkaar zit, hoe je het lokaal test en welke stappen Carst in Cloudflare doet.

## Hoe het werkt

- **Inloggen:** Cloudflare Access (Zero Trust, code per mail) beschermt `/beheer*` en `/api/beheer/*`.
- **Dubbele controle:** de Worker (`src/worker.js` → `src/beheer/`) controleert zelf elke aanvraag op `/beheer`, `/beheer/*` en `/api/beheer/*` (`run_worker_first` in `wrangler.jsonc`):
  - de header `Cf-Access-Jwt-Assertion` met handtekening RS256 (sleutels van `https://<team>/cdn-cgi/access/certs`, een uur bewaard);
  - `aud` gelijk aan `BEHEER_ACCESS_AUD`, `iss` gelijk aan `https://<BEHEER_ACCESS_TEAM>`, niet verlopen;
  - het e-mailadres moet in het secret `BEHEER_ROLLEN` staan.
  
  Klopt iets niet, dan volgt **403**, zonder gegevens.
- **Rollen:** `schrijven` (Carien, Carst) en `lezen` (accountant). Schrijfacties (POST/PUT/PATCH/DELETE) mogen alleen met rol `schrijven` en met een `Origin`-header van de eigen site. Staat een adres in beide lijsten, dan geldt `lezen`.
- **Headers:** de Worker zet op alles onder beheer `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` en een Content-Security-Policy zonder inline script. `public/_headers` herhaalt dit als extra laag.
- **Opslag:** Cloudflare D1 (jurisdictie EU), binding `BEHEER_DB`. De tabellen staan in `migrations/0001_beheer.sql`. Bedragen staan als gehele centen.
- **Logs:** alleen een code en de route, nooit bedragen, omschrijvingen, IBAN of e-mailadressen.

### Zolang de waarden van Carst ontbreken (stand S1)

| Situatie | Gevolg |
|---|---|
| `BEHEER_ACCESS_TEAM` of `BEHEER_ACCESS_AUD` leeg (zo staat het nu in `wrangler.jsonc`) | Beheer geeft **altijd 403**, ook op previews en op workers.dev. De publieke site en het formulier werken gewoon. |
| Team en AUD ingevuld, geldige inlog, maar geen `BEHEER_DB` | `/beheer` en `/api/beheer/ik` werken; routes die opslag nodig hebben geven **503** "Opslag nog niet ingesteld". |
| Alles ingevuld | Beheer werkt. |

Daarom kan de pull request van S1 veilig gemerged worden voordat Carst de waarden heeft gegeven.

## Lokaal testen (testmodus)

De testmodus bestaat **alleen** in `scripts/serveer.mjs` (de lokale testserver), nooit in `src/` of op Cloudflare. Daar gaat `/beheer*` door dezelfde beheerlogica (`src/beheer/api.js`), met een nep-inlog met vaste rol en een opslag in het geheugen met verzonnen gegevens.

```
node scripts/serveer.mjs                         # rol schrijven
BEHEER_TESTROL=lezen node scripts/serveer.mjs    # rol lezen
# of per verzoek: header  x-testrol: schrijven | lezen | geen   (geen = niet ingelogd → 403)
python3 scripts/schermafdrukken.py beheer-schrijven beheer-lezen
```

Tests: `tests/beheer-*.test.js` (JWT met een zelf gemaakt sleutelpaar, de echte Worker, migratie, testmodus nooit in `src/`), `tests/e2e/beheer.spec.js` en `tests/e2e/beheer-toegankelijkheid.spec.js` (axe). De rooktest (`scripts/rooktest.sh`) controleert live dat `/beheer` en `/api/beheer/boekingen` zonder inlog nooit 200 geven.

## Voorwaarden voor Carst

Claude heeft geen Cloudflare-token. Deze stappen doe jij in het Cloudflare-dashboard. Geen van de waarden in stap 1 en 3 is geheim. De e-mailadressen in stap 4 zet je nooit in de chat, in GitHub of in de repository.

1. **D1-database maken.** Ga naar Storage & Databases → D1 → Create. Naam: `luxmini-beheer`, location/jurisdictie **EU**. Geef de `database_id` door.
   - De bouwer zet die dan in `wrangler.jsonc`. Haal de `//` weg voor het blok `d1_databases` en vervang `[DATABASE_ID VAN CARST]`.
   - Previews krijgen de binding niet (R11). Een aparte preview-database is een open vraag (V6).
2. **Migraties toepassen.** Doe dit na de merge van S1 en van elke latere story met een nieuwe migratie:
   ```
   npx wrangler d1 migrations apply luxmini-beheer --remote
   ```
   Of laat Workers Builds dit doen (V7).
3. **Cloudflare Access instellen** (Zero Trust, Free).
   - Maak een team aan. Inlogmethode: **One-time PIN** (code per mail).
   - Maak een self-hosted applicatie voor de paden `/beheer`, `/beheer/*` en `/api/beheer/*`, op `luxmini.nl`, `www.luxmini.nl` en het workers.dev-adres van `luxmini`.
   - Beleid: "Allow" voor de drie e-mailadressen.
   - Geef het **team-domein** (`<team>.cloudflareaccess.com`) en de **AUD-tag** van de applicatie door. De bouwer zet ze in `wrangler.jsonc` bij `vars` → `BEHEER_ACCESS_TEAM` en `BEHEER_ACCESS_AUD`. Voor previews blijven ze leeg, tenzij V6 anders beslist.
4. **Secret `BEHEER_ROLLEN` zetten.** Ga naar Workers & Pages → luxmini → Settings → Variables and Secrets → Add. Kies type **Secret** (niet "Text": een gewone variabele wordt bij de volgende deploy overschreven). Naam: `BEHEER_ROLLEN`. Waarde (vul de echte adressen alleen in het dashboard in):
   ```
   {"schrijven": ["<adres Carien>", "<adres Carst>"], "lezen": ["<adres accountant>"]}
   ```
   Of via de terminal: `npx wrangler secret put BEHEER_ROLLEN`.
5. **Controleren.**
   - Open `https://luxmini.nl/beheer`. Je moet eerst een code per mail krijgen en daarna "Administratie" met je adres zien.
   - Zonder inlog (privévenster) moet je de inlog van Access of een 403 krijgen.
   - Op een preview hoort `/beheer` 403 te geven.
6. **Na S5:** upload de Excel van 2026 zelf in het beheerscherm. Het bestand komt nooit in de repository of in de chat.
