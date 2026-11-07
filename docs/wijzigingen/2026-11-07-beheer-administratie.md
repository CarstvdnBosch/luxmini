# Beheer: administratie bijhouden (luxmini.nl/beheer)

- **Datum:** 2026-11-07
- **Aangevraagd door:** Carst (wens en besluiten 7 nov., via vragen beantwoord)
- **Branch:** `wijziging/beheer-administratie` (deze brief); elke story krijgt een eigen branch `wijziging/beheer-s<n>-<naam>` en een eigen pull request
- **Issue(s):** nog niet bekend, zie Open vragen (V1). Elke pull request bevat `Closes #<nummer van die story>`.
- **Risico:** **hoog.** Raakt `wrangler.jsonc` (nieuwe binding, `run_worker_first`), de Worker, de beveiliging (inlog, rollen) en financiële gegevens van LUX mini in een openbare repository. Wat de publieke site laat zien, verandert niet (alleen `robots.txt` en `_headers`).

## Doel
Carien houdt haar inkomsten en uitgaven bij op haar telefoon, op luxmini.nl/beheer, in plaats van in een Excel per jaar. De accountant kijkt mee en krijgt met één klik dezelfde Excel als nu (dezelfde tabbladen, kolommen, codes, formules en aangiftetabbladen).

## User journey "Administratie bijhouden"

**Wie:** Carien (eigenaar LUX mini, niet technisch, meestal op de telefoon) en Carst (schrijven); de accountant (alleen lezen).
**Wil:** boekingen online invoeren, per maand en kwartaal zien hoe het ervoor staat en de Excel voor de accountant downloaden.
**Zodat:** de administratie altijd bij is, er geen formulefouten meer in sluipen en de accountant hetzelfde resultaat krijgt als nu.

Stappen:
1. Inloggen op luxmini.nl/beheer met een code per mail.
2. Een boeking invoeren (ontvangen of uitgegeven, bedrag, datum, omschrijving, rubriek, btw-code, bank of kas).
3. Het overzicht bekijken: saldi per maand en btw per kwartaal, met een controle of alles klopt.
4. De Excel exporteren voor de accountant (kwartaal of jaar).
5. Een nieuw boekjaar beginnen.
6. *(later)* Het ING-bankafschrift importeren.
7. *(later)* Een bonnetje bij een boeking bewaren.

### Stories en volgorde van de pull requests

Eén story per pull request, in deze volgorde (latere stories bouwen voort op eerdere).

| Story | Stap | Titel | Release | Pull request |
|---|---|---|---|---|
| **S1** | 1 | Veilig inloggen en de basis (rollen, opslag, testmodus) | 1 | **eerste pull request** |
| S2 | 2 | Boeking invoeren, wijzigen en verwijderen | 1 | 2 |
| S3 | 3 | Maandoverzicht met saldi en controle | 1 | 3 |
| S4 | 3 | Btw per kwartaal (aangifte) | 1 | 4 |
| S5 | — | Boekjaar 2026 importeren uit de huidige Excel (+ leeg sjabloon) | 1 | 5 |
| S6 | 4 | Excel exporteren voor de accountant | 1 | 6 |
| S7 | 5 | Nieuw boekjaar beginnen (en oud jaar afsluiten) | 1 | 7 |
| S8 | 6 | ING-bankafschrift importeren | later | — |
| S9 | 7 | Bonnetje bij een boeking | later | — |

S5 komt vóór S6: de round-trip-test van de export (export → opnieuw importeren) heeft de import nodig.

---

## Technische randvoorwaarden (gelden voor alle stories)

Elke story wordt ook op deze punten gecontroleerd.

**Openbare repository**
- R1. Nooit echte gegevens committen: geen bedragen, omschrijvingen, IBAN, namen van klanten of leveranciers, e-mailadressen van gebruikers en geen Excel met gegevens (ook niet in `tests/`, `docs/`, schermafdrukken of het validatierapport). Testgegevens zijn verzonnen voorbeeldboekingen.
- R2. Het exportsjabloon in de repository is leeg: geen bedragen in invoercellen, geen rekeningnummer, geen jaartal met gegevens. Een unit-test controleert dat (geen IBAN-patroon, invoerkolommen leeg).
- R3. `.gitignore` sluit `*.xlsx` uit, behalve het lege sjabloon en de verzonnen fixture (expliciete uitzonderingen).

**Inlog en rollen**
- R4. Cloudflare Access (Zero Trust, code per mail) beschermt `/beheer*` en `/api/beheer/*`. Carst richt dit zelf in (zie Voorwaarden).
- R5. De Worker controleert bovendien zelf elke aanvraag op `/beheer*` en `/api/beheer/*`: header `Cf-Access-Jwt-Assertion`, handtekening (RS256, sleutels van `https://<team-domein>/cdn-cgi/access/certs`, met cache), `aud` gelijk aan `BEHEER_ACCESS_AUD`, `iss` gelijk aan het team-domein (`BEHEER_ACCESS_TEAM`), niet verlopen. Team-domein en AUD staan als `vars` in `wrangler.jsonc` (geen geheimen).
- R6. De rol volgt uit het e-mailadres in de JWT, opgezocht in het Worker-secret `BEHEER_ROLLEN` (bijv. JSON met `schrijven` en `lezen`; alleen via `wrangler secret put` of het dashboard, nooit in de repository). Adres niet in de lijst: 403. Vergelijking zonder hoofdlettergevoeligheid.
- R7. Zonder geldige JWT: **403** (ook op het workers.dev-adres en op previews), zonder gegevens in het antwoord.
- R8. Schrijfacties (POST/PUT/DELETE) alleen voor rol `schrijven`; rol `lezen` krijgt 403. Elke POST/PUT/DELETE vereist een `Origin`-header gelijk aan de eigen host; anders 403.
- R9. Alle antwoorden onder `/beheer*` en `/api/beheer/*`: `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, en een Content-Security-Policy zonder inline script (`default-src 'self'; frame-ancestors 'none'; form-action 'self'`). De Worker zet deze headers (ook op de statische beheerbestanden), `_headers` als extra laag.
- R10. `robots.txt` krijgt `Disallow: /beheer`; `/beheer` staat niet in `sitemap.xml` en nergens op de publieke site staat een link naar `/beheer`.

**Opslag**
- R11. Cloudflare D1 met jurisdictie EU, binding `BEHEER_DB`. Migraties in `migrations/` (SQL, genummerd). Previews gebruiken **niet** de echte database (eigen preview-database met verzonnen gegevens of geen binding, dan geeft beheer 503 met een nette melding); zie Voorwaarden en V6.
- R12. Bedragen als gehele centen (integer). Btw zoals in de Excel: `bedrag / 121 × 21`, intern zonder tussentijdse afronding (bijv. in honderdsten van centen of als breuk); afronden pas bij weergave en in de export doet Excel het zelf met de formules.
- R13. Geen bedragen, omschrijvingen, IBAN of e-mailadressen in logs (observability staat aan). Fouten loggen alleen een code en de route. Een unit-test vangt `console.*` af tijdens een volledige invoer, import en export en controleert dat de verzonnen bedragen en omschrijvingen er niet in staan.

**Testmodus (harness en ontwerpgate)**
- R14. De testmodus bestaat **alleen in `scripts/serveer.mjs`** (lokale testserver), niet in de code die naar Cloudflare gaat. De beheerlogica in `src/beheer/` krijgt verificatie en opslag van buitenaf mee (dependency injection); `serveer.mjs` geeft een nep-verificatie met vaste rol (instelbaar per verzoek of via een omgevingsvariabele van de testserver: `schrijven` of `lezen`) en een opslag in het geheugen met verzonnen voorbeeldgegevens. `src/worker.js` geeft altijd de echte JWT-controle en D1 mee.
- R15. Afgedwongen en getest: (a) unit-test: in `src/` komt geen testmodus-vlag of nep-verificatie voor en `wrangler.jsonc` (ook `previews`) bevat geen testmodus-variabele; (b) unit-test: de Worker uit `src/worker.js` geeft 403 op `/beheer` en `/api/beheer/*` zonder JWT, met een ongeldige JWT, met een verkeerde `aud` en met een verlopen JWT; (c) Gate 3: de rooktest controleert live dat `/beheer` en `/api/beheer/boekingen` zonder inlog nooit 200 geven (verwacht 403 of een doorverwijzing naar `*.cloudflareaccess.com`).

**Harness**
- R16. Bestaande tests, grenzen en axe-regels worden niet versoepeld. Beheerschermen zijn geen publieke pagina's: ze tellen niet mee in de SEO-toetsen en Lighthouse voor de publieke site, maar wel in axe (desktop, tablet, mobiel) en de mobiel-ontwerptoetsen (tikdoelen, 16 px, geen horizontaal scrollen).
- R17. `scripts/schermafdrukken.py` en de e2e-tests kunnen de beheerschermen in testmodus fotograferen, met rol `schrijven` en rol `lezen`.
- R18. Geen nieuwe zware afhankelijkheden in de Worker (de bundel blijft ruim onder de limiet van het gratis plan). Zip lezen en schrijven met `CompressionStream`/`DecompressionStream` of één kleine bibliotheek (bijv. `fflate`); geen volledige xlsx-bibliotheek.
- R19. Aan de publieke site verandert niets behalve `robots.txt` en `_headers` (gate 2 en 4 blijven groen zonder aanpassing van de publieke tests).

## Voorwaarden voor Carst (vóór S1 live kan)

Claude heeft geen Cloudflare-token; deze stappen doet Carst in het Cloudflare-dashboard.

1. **D1-database** maken: naam bijv. `luxmini-beheer`, jurisdictie **EU**. Teruggeven: `database_id` (komt in `wrangler.jsonc`, is geen geheim). Optioneel een tweede, `luxmini-beheer-preview`, voor previews (V6).
2. **Migraties** toepassen na de merge van S1 (en van latere stories met een nieuwe migratie): `wrangler d1 migrations apply luxmini-beheer --remote`, of laten doen door Workers Builds als dat in de build is opgenomen (V7). De bouwer schrijft de exacte opdracht in de pull request.
3. **Cloudflare Access** (Zero Trust, Free): team aanmaken, inlogmethode "One-time PIN" (code per mail), een self-hosted applicatie voor `/beheer*` en `/api/beheer/*` op `luxmini.nl` en `www.luxmini.nl` (de zone staat sinds 7 nov. bij Cloudflare) en op het workers.dev-adres van `luxmini`, beleid "Allow" voor de drie e-mailadressen. Teruggeven: **team-domein** (`<team>.cloudflareaccess.com`) en **AUD-tag** van de applicatie (beide geen geheimen, komen in `wrangler.jsonc`).
4. **Secret** `BEHEER_ROLLEN` zetten bij de Worker (dashboard → Settings → Variables and Secrets, type Secret), met de e-mailadressen per rol. **Niet** in de chat of in GitHub zetten.
5. Na S5: de Excel van 2026 (de herstelde kopie) zelf uploaden in het beheerscherm. Het bestand komt nooit in de repository of in de chat.

---

## S1 · Veilig inloggen en de basis — **eerste pull request**

**Als** Carien, Carst of de accountant **wil ik** met een code per mail op luxmini.nl/beheer inloggen **zodat** alleen wij bij de administratie kunnen, ieder met de juiste rechten.

Acceptatiecriteria
1. `/beheer` toont na inloggen een eerste scherm met de kopregel uit de Ontwerprichting (logo donker, "Administratie", naam van de ingelogde, "Uitloggen") en de drie tabs Boekingen · Overzicht · Exporteren; de inhoud van de tabs mag nog een korte zin zijn ("Hier komen je boekingen", tekst door de ontwerper te bevestigen). Bij rol `lezen` staat de regel "Je kijkt mee (alleen lezen)".
2. "Uitloggen" gaat naar `/cdn-cgi/access/logout`.
3. `GET /api/beheer/ik` geeft `{ rol, naam of e-mail }` voor de ingelogde; zonder geldige JWT 403 (R5–R7).
4. Rol `lezen` krijgt 403 op een (proef-)schrijfroute; een POST zonder of met vreemde `Origin` krijgt 403 (R8). Gate 4 bevat deze veiligheidstests.
5. Alle headers uit R9 staan op `/beheer`, de beheerbestanden en `/api/beheer/*` (e2e-test). `robots.txt` bevat `Disallow: /beheer`; sitemap ongewijzigd (R10).
6. `wrangler.jsonc`: `run_worker_first` bevat `/api/*`, `/beheer` en `/beheer/*`; `vars` `BEHEER_ACCESS_TEAM` en `BEHEER_ACCESS_AUD` (leeg tot Carst ze geeft); de binding `BEHEER_DB` (D1) staat als commentaar klaar met de plaatshouder `[DATABASE_ID VAN CARST]`; `previews` volgt R11 (geen D1-binding, lege Access-waarden). `wrangler deploy --dry-run` (Gate 1) slaagt. Zonder team/AUD of zonder geldige JWT geeft beheer altijd 403; met geldige JWT maar zonder `BEHEER_DB` geven routes met opslag 503 "Opslag nog niet ingesteld" (`/api/beheer/ik` heeft geen opslag nodig). Zo kan de pull request veilig gemerged worden en faalt de preview niet (zie V3).
   *Aangepast door hoofdsessie (7 nov.): binding pas na de waarden van Carst.*
7. Migratie `migrations/0001_beheer.sql` maakt de tabellen voor boekjaren (jaar, IBAN, beginsaldo in centen, afgesloten ja/nee), boekingen (datum, omschrijving, dagafschrift-nr, bank of kas, ontvangen of uitgegeven, bedrag in centen, btw-code 0/1/2, aangemaakt/gewijzigd door en op, versie) en de verdeling van een boeking over rubrieken (rubriekcode, bedrag in centen). De rubriekcodes zijn die van de Excel (510 storting/opname, 1300, 1400, 1500 ontvangen/betaald, 4000–4800).
8. De testmodus werkt zoals R14 en is afgedwongen en getest zoals R15 (a en b). `scripts/rooktest.sh` heeft de controle uit R15 (c).
9. Het beheerscherm laadt `main.js` niet, heeft geen intro, pagina-overgang, kleurlaag, balk of collage, en heeft `<meta name="robots" content="noindex, nofollow">` (O1).
10. axe: 0 overtredingen op het eerste scherm (desktop, tablet, mobiel; rol `schrijven` en `lezen`).
11. Geen echte gegevens in de repository (R1); `CLAUDE.md` (Mappen) en `docs/kwaliteit.md` beschrijven beheer, testmodus en de nieuwe veiligheidstests; een korte handleiding `docs/beheer.md` bevat de Voorwaarden voor Carst.
12. `npm run check` is groen.

Ontwerpcriteria in deze story: O1, O2, O4, O15 (alleen de regel en het ontbreken van schrijfknoppen), O21, O22.

## S2 · Boeking invoeren, wijzigen en verwijderen

**Als** Carien **wil ik** op mijn telefoon snel een ontvangst of uitgave invoeren **zodat** mijn administratie direct bij is.

Acceptatiecriteria
1. Tab Boekingen toont per maand (nieuwste eerst) de boekingen; op desktop een tabel, op 390 px kaarten (O12). Begin- en eindsaldo per maand volgen in S3; tot dan staat er alleen de lijst.
2. "+ Nieuwe boeking" opent het invulscherm met de velden en volgorde uit de Ontwerprichting punt 3 (O3, O7–O11).
3. Validatie in de Worker (niet alleen in de browser): bedrag > 0 en hooguit 1.000.000,00; datum binnen het gekozen boekjaar; btw-code 0, 1 of 2; rubriek bestaat; de verdeling over rubrieken telt op tot het bedrag (de controlekolommen AB–AD van de Excel zijn dan 0); omschrijving verplicht, max. 200 tekens. Foutmeldingen zoals O18.
4. Eén rubriek per boeking in release 1. In 2026 kwam een verdeling over twee rubrieken één keer voor en die was een fout (dubbel geteld); de opslag (tabel verdeling) laat later meer rubrieken toe zonder migratie.
5. Wijzigen en verwijderen (rol `schrijven`): verwijderen met bevestiging (O19). Gelijktijdig wijzigen: een verouderde versie geeft 409 en de melding dat de boeking intussen is gewijzigd; de invoer blijft staan.
6. Bedraginvoer en weergave zoals O8 en O13 (unit-test op de omzetting: "12,5", "12.50", "€ 12,50", "1.234,56" → 123456 cent).
7. De standaard btw-code per rubriek volgt een tabel in de code (zie V9); de code is altijd aan te passen (O9).
8. Rol `lezen` ziet geen invoer-, wijzig- of verwijderknoppen en krijgt 403 op de API (O15).
9. Boekingen in een afgesloten boekjaar (S7) kunnen niet worden gewijzigd (403, en geen knoppen).
10. e2e in testmodus: invoeren, wijzigen en verwijderen op 390 × 844, 390 × 664 (iPhone/Safari), tablet en desktop; axe 0 overtredingen op lijst, invulscherm, foutmeldingen en bevestiging.
11. `npm run check` is groen.

Ontwerpcriteria: O2, O3, O7–O13, O15, O17–O19, O21, O22.

## S3 · Maandoverzicht met saldi en controle

**Als** Carien **wil ik** per maand mijn beginsaldo, wat erbij en eraf ging en mijn eindsaldo zien **zodat** ik weet of het klopt met de bank.

Acceptatiecriteria
1. Per maand rekent de app zoals de Excel: beginsaldo januari = beginsaldo van het boekjaar; beginsaldo volgende maand = eindsaldo vorige maand; totaal bij = som ontvangsten (bank en kas, kolommen D en F), totaal af = som uitgaven (E en G); eindsaldo = begin + bij − af. Hoe bank en kas samen of apart worden getoond, hangt af van V4 (tot dan zoals de Excel: één saldo).
2. Tab Boekingen toont bij elke maand beginsaldo boven en eindsaldo onder (O14); een lege maand toont "Geen boekingen in <maand>" met de saldi (O17).
3. Tab Overzicht toont de maandsaldi van het jaar en bovenaan de controle (O6): "Alles klopt", of per maand wat niet klopt (bijv. een verdeling die niet optelt) met een link naar die maand.
4. Unit-tests met verzonnen boekingen: saldi per maand, doorschuiven van saldo, lege maanden, negatieve saldi, afronding pas bij weergave.
5. axe 0 overtredingen; tabellen met `th scope` en `caption` (O21); op 390 px niets horizontaal scrollen.
6. `npm run check` is groen.

Ontwerpcriteria: O6, O13, O14, O17, O21, O22.

## S4 · Btw per kwartaal (aangifte)

**Als** Carien en de accountant **willen wij** per kwartaal zien wat ik moet betalen of terugkrijgen **zodat** de btw-aangifte klopt met de Excel.

Acceptatiecriteria
1. De app rekent precies zoals de Excel (formules uit tab "OB Aangifte" en kolommen I en J van de maandtabs), zodat app en export hetzelfde geven:
   - af te dragen per regel = bank-ontvangst (D) / 121 × 21 als btw-code 1, anders 0 (kolom I);
   - voorbelasting per regel = bank-uitgave (E) / 121 × 21 als btw-code 2, anders 0 (kolom J);
   - per maand en kwartaal: omzet = som Verkopen (M) / 1,21, btw = omzet × 0,21, voorbelasting = som J, saldo = btw − voorbelasting.
   Let op de verschillen die de Excel nu heeft (kas telt niet mee voor I en J; omzet komt uit M, niet uit I): zie V10. De app volgt de Excel tot Carst of de accountant anders besluit.
2. Tab Overzicht toont per kwartaal precies, in deze volgorde: 1a omzet, 1a btw, 5b voorbelasting, "Te betalen" of "Terug te vragen" (O5), plus het jaartotaal.
3. Unit-tests met verzonnen boekingen voor alle drie btw-codes, bank en kas, kwartaalgrenzen (31 maart / 1 april) en afronding; de verwachte waarden in de test zijn met de hand of met LibreOffice berekend, niet met de app-code zelf.
4. Op 390 px zonder horizontaal scrollen; axe 0 overtredingen.
5. `npm run check` is groen.

Ontwerpcriteria: O5, O6, O13, O21, O22.

## S5 · Boekjaar 2026 importeren uit de Excel (en het lege sjabloon)

**Als** Carien **wil ik** mijn boekingen van 2026 uit de huidige Excel overnemen **zodat** ik niet opnieuw hoef te beginnen.

Acceptatiecriteria
1. **Leeg sjabloon:** `scripts/maak-sjabloon.mjs <pad naar de herstelde kopie>` maakt `src/beheer/sjabloon/administratie-sjabloon.xlsx`: alle tabbladen, opmaak, vormen en afbeeldingen (ook Q1–Q4 Belastingdienst) en formules blijven; invoercellen leeg (datum/omschrijving, D–H, K–AA in de boekingsrijen), D1 (jaar), E6 (IBAN) en C8 van januari leeg; gecachte formulewaarden weggehaald. Het script draait buiten CI door wie de Excel heeft (Carst of de hoofdsessie); het bestand met gegevens komt nooit in de repository. Unit-test R2 op het resultaat. Het sjabloon staat niet in `public/` en is niet als bestand op te vragen.
2. **Fixture:** `tests/fixtures/administratie-voorbeeld.xlsx` = het lege sjabloon met **verzonnen** boekingen (alle btw-codes, bank en kas, een privéstorting, een verdeling over twee rubrieken, een lege maand), plus de verwachte totalen per maand en kwartaal in een JSON. De fixture wordt niet met de exportcode van S6 gemaakt.
3. **Import** (rol `schrijven`, Overzicht → "Importeren" met bevestiging): de Worker leest alleen invoerkolommen, nooit formules: per maandtab de boekingsrijen vanaf rij 17 tot de somrij (die per maand verschilt en wordt gevonden aan de inhoud, niet aan een vast rijnummer), D1 jaar, E6 IBAN, C8 beginsaldo van januari. Lege rijen worden overgeslagen.
4. Vóór het opslaan toont het scherm per maand het aantal gevonden boekingen en of de controle klopt: het eindsaldo dat de app berekent tegenover de gecachte waarde van C10 in het bestand, en de controlekolommen (O20). Regels die niet kloppen worden genoemd (maand en rij, zonder bedrag in logs) en niet stil overgeslagen; bij een verschil wordt pas na uitdrukkelijke bevestiging opgeslagen.
5. Import kan alleen in een leeg boekjaar of na bevestiging "Vervang alle boekingen van <jaar>" (alles of niets, in één D1-transactie of batch).
6. Het geüploade bestand wordt niet bewaard (niet in D1, niet in R2, niet in logs); maximaal 5 MB; alleen `.xlsx`.
7. Unit-test op de fixture: alle verzonnen boekingen komen terug met de juiste velden en bedragen in centen; de totalen per maand en kwartaal zijn gelijk aan de JSON.
8. e2e in testmodus met de fixture; axe 0 overtredingen op upload, voorvertoning en resultaat.
9. `npm run check` is groen.

Ontwerpcriteria: O2, O7, O18, O20, O21, O22.

## S6 · Excel exporteren voor de accountant

**Als** accountant (en Carien) **wil ik** de administratie als dezelfde Excel downloaden **zodat** ik werk zoals ik gewend ben.

Acceptatiecriteria
1. Tab Exporteren: keuze kwartaal of jaar; ook rol `lezen` kan exporteren (O15), tenzij V8 anders beslist. Bestandsnaam `administratie_LUX-Mini_<jaar>.xlsx` (kwartaal: `…_<jaar>_Q<n>.xlsx`).
2. De Worker vult het lege sjabloon (xlsx = zip met XML): alleen de invoercellen van de maandtabs, D1, E6 en C8 van januari; alle andere onderdelen (tabbladen, kolommen, codes, formules, OB Aangifte, Q1–Q4 Belastingdienst met vormen en afbeeldingen, opmaak) blijven ongewijzigd. Formules blijven formules; `workbook.xml` krijgt `<calcPr fullCalcOnLoad="1"/>`; er blijven geen oude gecachte waarden staan.
3. Tekst wordt als tekst geschreven (inline string), nooit als formule: een omschrijving die begint met `=`, `+`, `-` of `@` komt als gewone tekst in de cel (unit-test).
4. **Meer boekingen dan rijen in een maand:** het sjabloon heeft per maand een vaste ruimte (nu ongeveer 47 rijen, per maand verschillend). Voorstel: het sjabloon krijgt in S5 bij het maken ruim extra rijen per maand (bijv. 150, in Excel zelf ingevoegd zodat alle formules en verwijzingen kloppen; zie V11). Past een maand toch niet, dan exporteert de app **niet** half, maar toont: "<Maand> heeft <n> boekingen; de Excel heeft ruimte voor <m>. Neem contact op met Carst." De export voegt zelf geen rijen in de XML in. Unit-test op beide gevallen.
5. Kwartaalexport: dezelfde werkmap, met alleen de boekingen van dat kwartaal ingevuld (andere maanden leeg, saldi lopen door vanaf het beginsaldo van het jaar plus de eerdere maanden — zie V8 of dat de bedoeling is).
6. **Round-trip-test:** fixture importeren → exporteren → opnieuw importeren geeft dezelfde boekingen. De export wordt in CI met LibreOffice (headless) herberekend; de kwartaalwaarden uit tab OB Aangifte en de eindsaldi per maand zijn gelijk aan wat de app toont (S3, S4). Draait LibreOffice lokaal niet, dan staat de test als "overgeslagen" zichtbaar in het validatierapport; in Gate 1 is hij verplicht (installatie in `controle.yml`).
7. Het bestand opent zonder herstelmelding in Excel en LibreOffice (handmatig door Carst of de accountant met een export van verzonnen gegevens uit de preview of de testmodus; bevestiging in het Verloop).
8. `Cache-Control: no-store` en `Content-Disposition: attachment` op de download; niets van de inhoud in de logs.
9. `npm run check` is groen.

Ontwerpcriteria: O15, O16, O21, O22.

## S7 · Nieuw boekjaar beginnen

**Als** Carien **wil ik** in januari een nieuw boekjaar beginnen **zodat** ik verder kan zoals met een nieuwe Excel per jaar.

Acceptatiecriteria
1. Overzicht → "Nieuw boekjaar" (rol `schrijven`): het scherm toont vóór bevestigen het nieuwe jaar, het beginsaldo (= eindsaldo december van het vorige jaar, aanpasbaar) en het rekeningnummer (overgenomen, aanpasbaar) (O20).
2. Na bevestigen bestaat het nieuwe jaar, staat de jaarkeuze erop en toont Boekingen de lege staat (O17).
3. Het vorige jaar wordt afgesloten: bekijken en exporteren kan, wijzigen niet (O16; API 403). Heropenen alleen als V5 dat toestaat.
4. Een jaar dat al bestaat kan niet opnieuw worden aangemaakt (409 met melding).
5. Unit-tests: beginsaldo uit eindsaldo, afsluiten blokkeert schrijven, dubbel jaar geweigerd.
6. axe 0 overtredingen; `npm run check` is groen.

Ontwerpcriteria: O16, O17, O20, O21, O22.

## S8 · ING-bankafschrift importeren *(later, niet in release 1)*

**Als** Carien **wil ik** mijn ING-afschrift inlezen **zodat** ik bankboekingen niet over hoef te typen.
Globale criteria (worden in een eigen brief uitgewerkt): CSV- of CAMT.053-bestand van ING; voorstel per regel met rubriek en btw-code, Carien bevestigt; geen dubbele boekingen; het bestand wordt niet bewaard.

## S9 · Bonnetje bij een boeking *(later, niet in release 1)*

**Als** Carien **wil ik** een foto van een bonnetje bij een boeking bewaren **zodat** de accountant het bewijs heeft.
Globale criteria (eigen brief): opslag in Cloudflare R2 (EU), alleen via de beheer-API met dezelfde rollen; bewaartermijn volgens de fiscale bewaarplicht (navragen bij de accountant).

---

## Ontwerprichting (website-ontwerper)

1. Rustige huisstijl, maar een werkplek: zelfde kleurvariabelen en letters (--inkt, --wit, --grijsblauw, --terracotta, --salie; --sans voor alle tekst, --serif alleen voor paginatitel en kopjes). Witte achtergrond, inkt als tekst; terracotta alleen als accent (hoofdknop "Boeking opslaan" met inkt erop, actieve tab). Geen intro, pagina-overgang, kleurlaag .achtergrond, collage, vaste balk .balk, menu over het hele scherm, smooth scroll of opkomen; main.js niet laden, eigen beheer.css en beheer.js, noindex. Echte knoppen mogen hier (de pijl-linkregel geldt voor de site). Veldlabels 16 px, niet de 11 px-kapitalen van .formulier label.
2. Schermen en volgorde: kopregel met logo (donker), "Administratie", jaarkeuze, naam ingelogde + "Uitloggen". Drie tabs: Boekingen (start; "+ Nieuwe boeking" bovenaan, boekingen per maand nieuwste eerst met begin- en eindsaldo), Overzicht (maandsaldi, kwartalen met 1a omzet/btw, 5b voorbelasting, te betalen/terug, controle), Exporteren (kwartaal of jaar). "Nieuw boekjaar" en "Importeren" onder Overzicht achter eigen knop met bevestiging.
3. Mobiel invoeren (390 px), één kolom: Ontvangen/Uitgegeven (twee grote keuzeknoppen); bedrag; datum (vandaag); omschrijving; rubriek (laatst gebruikt); btw-code volgt uit rubriek, zichtbaar als uitleg, aanpasbaar via "Wijzig"; bank of kas (laatst gebruikt); dagafschrift-nr ingeklapt onder "Meer". "Opslaan" sticky onderaan. Na opslaan "Opgeslagen" + "Nog een boeking". Desktop: tabel; mobiel: kaarten (omschrijving en bedrag op één regel, daaronder datum, rubriek, btw), geen horizontaal scrollende tabel.
4. Bedragen: € 1.234,56; uitgegeven met − en aparte kolom of label "uit", kleur nooit enige signaal; rechts uitgelijnd, tabular-nums; inputmode="decimal", komma en punt; na verlaten netjes € 12,50.
5. Rollen: accountant ziet dezelfde schermen zonder toevoegen/wijzigen/verwijderen/nieuw boekjaar/import (niet uitgeschakeld in beeld, gewoon weg), vaste regel "Je kijkt mee (alleen lezen)". Oude boekjaren: "Boekjaar 2026 is afgesloten. Je kunt het bekijken en exporteren."
6. Fouten bij het veld in gewone taal met wat te doen ("Vul een bedrag in, bijvoorbeeld 12,50"); invoer blijft staan; verwijderen met bevestiging die de boeking noemt; lege maand/jaar met korte zin en volgende stap; WCAG 2.1 AA, volledig toetsenbord.

Advies ontwerper: testmodus met vaste rol (schrijven en lezen) en voorbeeldgegevens, zodat `scripts/schermafdrukken.py` en de e2e-tests de beheerschermen kunnen fotograferen en toetsen. (Opgenomen als R14–R17.)

### Ontwerpcriteria

- **O1** Geen intro, overgang, kleurlaag, balk of collage op /beheer; main.js niet geladen; meta robots noindex; niet in sitemap.
- **O2** Alleen kleuren uit style.css-variabelen; 4,5:1 tekst, 3:1 rand/focus; nergens wit op terracotta onder 24 px (hoofdknop inkt op terracotta).
- **O3** Na inloggen tab Boekingen; op 390×844 "+ Nieuwe boeking" zonder scrollen in beeld (Carien/Carst); bij accountant afwezig.
- **O4** Tabs Boekingen · Overzicht · Exporteren op elke breedte op één regel, min. 44 px hoog, actieve tab aria-current="page" (of aria-selected bij echte tabs).
- **O5** Kwartaal toont precies, in aangiftevolgorde: 1a omzet, 1a btw, 5b voorbelasting, "Te betalen" of "Terug te vragen"; op 390 px zonder horizontaal scrollen.
- **O6** Controle bovenaan Overzicht: "Alles klopt" met vinkje en tekst, of melding met wat/welke maand + link; nooit alleen kleur.
- **O7** Invulscherm 390 px één kolom zonder horizontaal scrollen; alle tikdoelen ≥ 44×44; veldtekst en labels ≥ 16 px; zoom niet geblokkeerd.
- **O8** Bedragveld numeriek toetsenbord met komma; "12,5", "12.50" en "€ 12,50" → € 12,50.
- **O9** Nieuwe boeking: datum vandaag, rubriek en bank/kas laatst gebruikt; btw-code direct bij kiezen rubriek met uitleg ("2 · voorbelasting 21%"), aanpasbaar zonder rubriek te wijzigen.
- **O10** Op 390×664 "Opslaan" altijd in beeld, ook met toetsenbord open; bedekt nooit een veld of foutmelding.
- **O11** Binnen 1 s "Opgeslagen" (role="status") met "Nog een boeking"; geen invoer verdwijnt zonder melding.
- **O12** Op 390 px elke boeking een kaart; regel 1 omschrijving en bedrag, regel 2 datum · rubriek · btw · bank/kas; hele kaart tikdoel; geen tabel breder dan scherm.
- **O13** Elk bedrag € 1.234,56, rechts uitgelijnd, tabular-nums; uitgaven met − of eigen kolom.
- **O14** Elke maand toont beginsaldo boven en eindsaldo onder, zonder uitklappen (per bank en kas als de opslag dat onderscheidt; anders zoals de Excel één saldo — open vraag).
- **O15** Accountant: "Je kijkt mee (alleen lezen)", geen knoppen/links voor toevoegen, wijzigen, verwijderen, importeren of nieuw boekjaar; exporteren werkt.
- **O16** Afgesloten boekjaar: bovenaan "Boekjaar 2026 is afgesloten. Je kunt het bekijken en exporteren.", geen wijzigactie.
- **O17** Leeg jaar: "Nog geen boekingen in 2027." + "+ Nieuwe boeking" (accountant alleen de zin); lege maand: "Geen boekingen in maart" met saldi; nooit leeg scherm.
- **O18** Foutmelding direct onder veld, 16 px, met voorbeeld, aria-describedby, aria-invalid="true"; focus naar eerste fout; invoer blijft; netwerk-/serverfout: "Opslaan lukte niet. Je invoer staat er nog; probeer het opnieuw."
- **O19** Verwijderen vraagt bevestiging met naam en bedrag van de boeking; standaardfocus op "Annuleren".
- **O20** Nieuw boekjaar en Importeren tonen vóór bevestigen wat er gebeurt (beginsaldo uit eindsaldo vorig jaar; aantal gevonden boekingen per maand en of de controle klopt).
- **O21** axe 0 overtredingen op alle beheerschermen (desktop, tablet, mobiel); elk veld zichtbaar label; Ontvangen/Uitgegeven en bank/kas als keuzerondjes in fieldset met legend; tabellen met th scope en caption.
- **O22** Volledig met toetsenbord, logische tabvolgorde, focus altijd zichtbaar (2 px inkt, ≥ 3:1); focus keert terug na sluiten invulscherm/bevestiging; bij "minder beweging" alles hetzelfde.

---

## Bestanden (waarschijnlijk, over alle stories)
- `wrangler.jsonc` (binding `BEHEER_DB`, `vars`, `run_worker_first`, `previews`)
- `src/worker.js` (routes `/beheer*`, `/api/beheer/*`)
- `src/beheer/` (nieuw): `toegang.js` (JWT, rollen, Origin), `api.js`, `boekingen.js`, `btw.js`, `saldi.js`, `bedrag.js`, `import.js`, `export.js`, `zip.js`, `sjabloon/administratie-sjabloon.xlsx`
- `migrations/0001_beheer.sql` (en volgende)
- `public/beheer/index.html`, `public/beheer/beheer.css`, `public/beheer/beheer.js` (zonder gegevens; achter de Worker-controle)
- `public/robots.txt`, `public/_headers`
- `scripts/serveer.mjs` (testmodus), `scripts/maak-sjabloon.mjs`, `scripts/rooktest.sh`, `scripts/schermafdrukken.py`
- `tests/beheer-*.test.js`, `tests/fixtures/administratie-voorbeeld.xlsx` (+ JSON), `tests/e2e/beheer*.spec.js`, `playwright.config.js`
- `.github/workflows/controle.yml` (LibreOffice voor de round-trip in S6)
- `.gitignore`, `CLAUDE.md` (Mappen), `docs/kwaliteit.md`, `docs/beheer.md`

## Buiten scope
- ING-bankimport (S8) en bonnetjes (S9): latere releases, eigen brief.
- Rechtstreeks aangifte doen bij de Belastingdienst; de app toont alleen de bedragen.
- Wijzigingen aan de publieke pagina's, het contactformulier en de doorverwijzingen.
- Andere btw-tarieven dan 21% en 0% (9% komt in de Excel niet voor).
- Het domein luxmini.nl naar Cloudflare verhuizen (besluit Carien, los hiervan).
- Een link naar `/beheer` op de publieke site.

## Open vragen

### Blokkerend
- **V1 · Issues.** Opgelost: S1 #44, S2 #45, S3 #46, S4 #47, S5 #48, S6 #49, S7 #50 (stories S1–S7 akkoord Carst 7 nov.).
- **V2 · Domein.** Opgelost (Claude, 7 nov.): luxmini.nl staat sinds de domeinverhuizing bij Cloudflare (custom domains op de Worker), dus Access kan direct op `luxmini.nl/beheer`.
- **V3 · Waarden van Carst.** `database_id`, team-domein en AUD-tag (Voorwaarden 1 en 3). Zonder deze kan S1 niet live; de bouw kan wel in testmodus. Aanpak S1 (hoofdsessie, 7 nov.): de D1-binding staat als commentaar in `wrangler.jsonc` en `BEHEER_ACCESS_TEAM`/`BEHEER_ACCESS_AUD` zijn leeg. Daardoor geeft beheer live, op workers.dev en op previews altijd 403, en kan de pull request veilig gemerged worden. Na de waarden van Carst volgt een kleine pull request die ze invult (exacte stappen in `docs/beheer.md`).
- **V4 · Bank en kas.** Besluit Carst 7 nov.: één saldo over bank en kas samen, zoals de Excel.
- **V5 · E-mailadressen en rollen.** Welke adressen krijgen `schrijven` en welke `lezen`? (Niet in de chat of repository; Carst zet ze zelf in Access en het secret.) Mag een afgesloten jaar worden heropend, en door wie? Besluit Carst 7 nov.: een afgesloten boekjaar mag weer geopend worden door Carien en Carst (rol schrijven), met bevestiging; de accountant niet.
- **V10 · Btw-berekening Excel.** De Excel rekent af te dragen btw (I) en voorbelasting (J) alleen over bankbedragen (D/E), niet over kas (F/G), en de aangifte-omzet uit Verkopen (M / 1,21), ongeacht de btw-code. Is dat zo bedoeld (accountant), of moet het anders? Tot een besluit volgt de app de Excel, zodat app en export gelijk zijn.
- **V12 · Kolommen van de Excel.** Opgelost (Claude, 7 nov.): A datum, B dagafschrift-nr, C omschrijving; N en P zijn lege tussenkolommen; AB = (D+F)−(K+M+Q), AC = (E+G)−(L+O+R+S..AA), AD = AB+AC; somrij = SOM per kolom. Claude maakt in S5 het lege sjabloon uit de herstelde kopie (buiten de repo) en levert dat aan de bouwer.

### Niet blokkerend (wel vóór de betreffende story)
- **V6 · Previews.** Een eigen preview-database met verzonnen gegevens (Carst maakt die), of beheer uit in previews (503)? Moet Access ook de preview-adressen beschermen, zodat Carst beheer op de preview kan bekijken?
- **V7 · Migraties.** Past Carst migraties zelf toe (`wrangler d1 migrations apply --remote`), of komt dat in de build van Workers Builds?
- **V8 · Accountant en export.** Besluit Carst 7 nov.: de accountant mag zelf exporteren, kwartaal en jaar.
- **V9 · Standaard btw-code per rubriek.** Voorstel uit het gebruik in 2026 (meest gebruikte code): Verkopen 1300 → 1; Inkopen 1400 → 2; Omzetbelasting 1500, Privé 510, Verzekering 4000, Porto 4100, Rente/bank 4300, Km-vergoeding 4400 → 0; Bedrijfsbenodigdheden 4200, Kantoorkosten 4500, Communicatie 4600, Representatie 4700, Overige 4800 → 2. Altijd aanpasbaar. Ter bevestiging door Carien/accountant.
- **V11 · Ruimte per maand.** Mogen er in het sjabloon extra rijen per maand worden ingevoegd (bijv. tot 150), zodat de export nooit vastloopt? Dat verandert de rijnummers van de somrij ten opzichte van de huidige Excel; de accountant ziet verder hetzelfde.
- **V13 · Teksten.** De korte zinnen in lege staten en meldingen komen uit de Ontwerprichting; de plaatshoudertekst in S1 ("Hier komen je boekingen") laat de bouwer door de ontwerper bevestigen.
- **V14 · Back-up.** D1 heeft Time Travel (herstel tot een eerder moment). Is dat genoeg, of wil Carst daarnaast elke maand een export bewaren (buiten de repository)?

## Verloop (S1, eerste pull request)
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | Brief met journey "Administratie bijhouden", S1–S9 (release 1: S1–S7), ontwerprichting en O1–O22 van website-ontwerper (7 nov.) |
| Bouwen | website-bouwer | Ronde 1 (7 nov.): S1 gebouwd. Worker controleert `/beheer*` en `/api/beheer/*` zelf (Access-JWT RS256 met Web Crypto en JWKS-cache, aud/iss/exp/nbf, rol uit `BEHEER_ROLLEN`, Origin bij schrijven, headers R9); zonder team/AUD 403, zonder `BEHEER_DB` 503. Eerste scherm met kopregel, drie tabs en de regel voor rol lezen; migratie 0001; testmodus alleen in `serveer.mjs`; rooktest R15c; `docs/beheer.md`. Lokaal groen: `npm test` (92/92), sitecontrole (Gate 2, geen fouten) en Playwright zonder axe op desktop, tablet en mobiel (233 groen, 0 rood). `npm run check` als geheel kan lokaal niet groen worden. Alleen in CI: axe (ook `beheer-toegankelijkheid.spec.js`), WebKit/iPhone, Lighthouse en `wrangler deploy --dry-run` (de npm-registry is lokaal niet bereikbaar). |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |

Latere stories (S2–S7) krijgen bij de start elk een eigen tabel Verloop, onderaan deze brief of in een eigen brief die naar deze verwijst.
