# KvK-nummer invullen

- **Datum:** 6 november 2026
- **Aangevraagd door:** Carst. Hij stuurde het KvK-uittreksel van Carien ("information of Carien for site").
- **Branch:** `wijziging/kvk-nummer`
- **Risico:** laag. Alleen tekst verandert.

## Wijziging
De plaatshouder `[nummer]` is overal vervangen door **KvK 78234654**: in de footer van alle pagina's en in de privacyverklaring.

Het uittreksel noemt als naam Lux-mini en als adres Sperwerstraat 10, 6035 GH Ospel. Dat adres stond al op de site. Het uittreksel zelf staat niet in de (openbare) repository.

## Ook in deze wijziging (Carst, 6 nov.: "ik krijg nog steeds mails als een run niet goed ging, zet dat uit"; "doe niets met mail")
Er is niets aan mailinstellingen veranderd. Wel zijn de oorzaken van de foutmails weggehaald:
- **GO / NO-GO:** zonder het label `GO` mislukte deze workflow bewust, en elke mislukte run gaf een mail. Nu slaagt de run altijd. Het besluit staat als commitstatus "GO · Akkoord Carst": "wachten" zonder GO, "geslaagd" met GO. In de ruleset blijft het een verplichte controle.
- **Rooktest live:** die mislukte omdat de variabele `SITE_URL` ontbrak. Zonder die variabele gebruikt de rooktest nu https://luxmini.carstvdbosch.workers.dev.

## Acceptatiecriteria
1. Er staat nergens nog `[nummer]` in `public/`.
2. De footer en de privacyverklaring tonen KvK 78234654.
3. `npm test`, de sitecontrole en de e2e-tests zijn groen.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Bouwen | Claude (hoofdsessie) | Vervangen op 9 pagina's. Ontwerpgate n.v.t. (alleen tekst, geen opmaak). |
| Foutmails | Claude (hoofdsessie) | GO-workflow zet een status in plaats van te falen; rooktest met standaardadres. |
