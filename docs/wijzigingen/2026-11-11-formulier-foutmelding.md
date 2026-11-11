# Formulier: eerlijke foutmelding en invoer bewaren

**Wens (Carst, 11 nov.):** het formulier verstuurt live nog niet (oorzaak ligt in de Cloudflare-instellingen van Email Routing, buiten de code). De melding zegt nu "Controleer je naam, e-mailadres en bericht", ook als het versturen aan onze kant mislukt. Dat is misleidend, en na de fout is alles wat de bezoeker invulde weg. "Graag" (Carst) op het voorstel om dat te verbeteren.

## Wat verandert
1. **Twee soorten fout in de Worker** (`src/contact.js`):
   - ongeldige invoer → blijft `/contact?verzonden=fout#formulier`;
   - versturen mislukt → `/contact?verzonden=fout&reden=versturen#formulier`.
   - Bij ongeldige invoer logt de Worker alleen welke velden ontbreken of ongeldig zijn (`Formulier ongeldig: naam, email`), nooit de waarden. Bij versturen blijft `Versturen mislukt: <melding>`.
2. **Twee meldingen** op `contact.html` (`main.js`):
   - ongeldig: **"Je bericht is niet verstuurd.** Controleer je naam, e-mailadres en bericht."
   - versturen: **"Je bericht is niet verstuurd.** Dat ligt niet aan jou: er ging iets mis bij het versturen. Probeer het later nog eens, of stuur Carien een WhatsApp of mail." met de links naar WhatsApp en mail (de contactpagina houdt de directe kanalen).
   - De melding heeft `role="alert"` en staat zonder scrollen in beeld (zoals nu).
3. **Invoer blijft staan** (met JavaScript): het formulier verstuurt via `fetch` naar `/api/contact` (zelfde formulierdata, zelfde Worker). Eindigt het antwoord op `/bedankt`, dan gaat de pagina daarheen; eindigt het op de foutpagina, dan blijft de pagina staan met alle ingevulde velden en verschijnt de juiste melding boven de knop; de focus gaat naar de melding (ongeldig: naar het eerste foute veld). Tijdens het versturen is de knop even uitgeschakeld met de tekst "Bezig met versturen…". Netwerkfout = melding "versturen". Zonder JavaScript werkt alles zoals nu (gewone POST met doorverwijzing).
4. Spamval, de velden, de mail zelf en `run_worker_first` blijven ongewijzigd. De rooktest blijft geldig (ongeldige invoer → `verzonden=fout`).

## Acceptatiecriteria
1. Unit-tests: ongeldig → `/contact?verzonden=fout#formulier`; versturen gooit → `/contact?verzonden=fout&reden=versturen#formulier`; log bij ongeldig bevat veldnamen en geen waarden.
2. e2e (desktop, tablet, mobiel): met een nep-`/api/contact` die faalt blijven alle velden gevuld en staat de versturen-melding in beeld met WhatsApp- en maillink; met ongeldige invoer de ongeldig-melding; met succes naar `/bedankt`.
3. Zonder JavaScript: POST werkt en de foutpagina toont de melding die bij `reden` hoort.
4. axe 0 overtredingen op de contactpagina met beide meldingen; tikdoelen 44 px; geen tekst onder 16 px in de melding.
5. `npm run check` groen; publieke pagina's verder ongewijzigd.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie, kleine wijziging) | — |
