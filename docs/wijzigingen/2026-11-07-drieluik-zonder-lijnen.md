# Drieluik zonder witte lijnen

**Wens (Carst, 7 nov. 16:47, met schermafdruk desktop):** "still has a white line": in 001 — Producten op de homepage staan nog twee dunne witte verticale lijnen tussen de kolommen. Die moeten weg.

## Wat verandert
- De witte scheidingslijnen tussen de drie kolommen van het drieluik vervallen, op alle schermen (ook met een muis).
- De ontwerpregel in `CLAUDE.md` (Homepage) wordt aangepast: geen witte lijnen tussen de kolommen.
- De test F2 (`tests/e2e/homepage-zoals-stock.spec.js`) en de sitecontrole (`controleer_witte_lijn` in `scripts/controleer.py`) toetsen nu dat er nergens een witte lijn staat. Dit is een gewijzigde eis van Carst, geen versoepeling.

## Acceptatiecriteria
1. Op 1440 × 900, 1280 × 720, 768 × 1024 en 390 × 844 staat in en langs `#producten` geen enkele dunne witte lijn, in rust en bij aanwijzen.
2. `::before` en `::after` van de middelste kolom tonen niets (`display: none`).
3. Kleuren, foto-inloop, witte tekst bij aanwijzen en klikgebieden van het drieluik zijn ongewijzigd.
4. `npm run check` groen; visuele basis van de homepage desktop wijkt alleen af op de plek van de lijnen.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (kleine wijziging, brief direct uit de wens) | — |
