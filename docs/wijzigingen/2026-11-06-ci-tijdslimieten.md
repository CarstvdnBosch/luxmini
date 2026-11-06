# Tijdslimieten in de pipeline (geen hangende runs, geen foutmails)

- **Datum:** 6 november 2026
- **Aangevraagd door:** Carst ("ik krijg nog steeds mails als een run niet goed ging, zet dat uit"; "doe niets met mail")
- **Branch:** `wijziging/ci-tijdslimieten`
- **Risico:** laag. Alleen de workflows veranderen; de site blijft gelijk.

## Aanleiding
Gate 5 (Visueel) bleef meer dan 40 minuten hangen bij het installeren van WebKit. Een job zonder tijdslimiet loopt tot 6 uur door en mislukt dan, en dat geeft weer een foutmail. Ik heb de twee hangende runs afgebroken.

## Wijziging
- Elke job heeft een tijdslimiet:

  | Job | Limiet |
  |---|---|
  | Gate 1 · Tests | 10 min |
  | Gate 2 · Sitecontrole | 20 min |
  | Gate 4 · Kwaliteit | 30 min |
  | Gate 5 · Visueel | 25 min |
  | Validatierapport | 10 min |
  | Rooktest | 15 min |
  | GO-besluit | 5 min |
  | Visuele basis | 30 min |

- In Gate 5 mag de browserinstallatie hooguit 10 minuten duren. Gaat dat mis, dan mislukt de run niet. Gate 5 blokkeert sowieso niet.
- Aan mailinstellingen is niets veranderd.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Bouwen | Claude (hoofdsessie) | Limieten toegevoegd; hangende runs afgebroken. Controleur en ontwerpgate n.v.t. (alleen pipeline). |
