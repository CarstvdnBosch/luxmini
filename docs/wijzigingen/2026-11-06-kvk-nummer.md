# KvK-nummer invullen

- **Datum:** 6 november 2026
- **Aangevraagd door:** Carst. Hij stuurde het KvK-uittreksel van Carien ("information of Carien for site").
- **Branch:** `wijziging/kvk-nummer`
- **Risico:** laag. Alleen tekst verandert.

## Wijziging
De plaatshouder `[nummer]` is overal vervangen door **KvK 78234654**: in de footer van alle pagina's en in de privacyverklaring.

Het uittreksel noemt als naam Lux-mini en als adres Sperwerstraat 10, 6035 GH Ospel. Dat adres stond al op de site. Het uittreksel zelf staat niet in de (openbare) repository.

## Acceptatiecriteria
1. Er staat nergens nog `[nummer]` in `public/`.
2. De footer en de privacyverklaring tonen KvK 78234654.
3. `npm test`, de sitecontrole en de e2e-tests zijn groen.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Bouwen | Claude (hoofdsessie) | Vervangen op 9 pagina's. Ontwerpgate n.v.t. (alleen tekst, geen opmaak). |
