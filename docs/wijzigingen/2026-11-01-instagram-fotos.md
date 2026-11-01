# Foto's van Instagram gebruiken waar ze beter passen

- **Datum:** 2026-11-01
- **Aangevraagd door:** Carst ("deze mag je allemaal gebruiken en sommige zijn beter passend")
- **Risico:** laag. Alleen foto's en `alt`-teksten op de homepage; geen JS, CSS, formulier of pipeline.

## Doel
Echte foto's van @luxmini2020 gebruiken op de plekken waar nu een noodoplossing of een minder passende foto staat. Zo laat de site ook producten zien die nog ontbraken: babynest, jasje, outfit met ruches en de hanger met paardje.

## Bron
Zeven posts van https://www.instagram.com/Luxmini2020/ (640 × 640 px). Ze zijn uitgesneden zonder tekstbalken, kaartjes en inzetfoto's en kregen dezelfde lichte warme kleurcorrectie als de andere foto's. De bestanden staan in `public/assets/img/ig-*.jpg`.

## Acceptatiecriteria
1. Er staat geen Instagram-tekst (banners, "Charme mood en bag", tegeltitels) in de uitsneden.
2. Hero: tegel 3 toont voorop de outfit met ruches (knuffel achterop). Achter tegel 5 zit het babynest in plaats van de dubbele doos.
3. Uitgelicht: de geopende box met het zakje "Sem" vervangt de slecht uitgesneden gesloten doos.
4. Portfolio: één overzichtelijke lijst van 9 items, met nieuw Babynest, Ruches en flared broekje, Jasje (twee kanten te dragen: groot de teddykant, klein de gladde kant) en Hanger met houten paardje. Hoverkleuren komen uit `CLAUDE.md`; twee items onder elkaar hebben nooit dezelfde kleur (9 items, 7 kleuren).
5. Personaliseren → Siliconen toont de hanger met houten paardje.
6. Het Instagram-blok toont echte Instagram-foto's.
7. Alle nieuwe afbeeldingen hebben een feitelijke `alt`-tekst, zonder verzonnen namen of claims.
8. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Buiten scope
De "Belettering"-dia, want ook op Instagram staat geen foto van belettering op kleding. De kraamcadeaubox-pagina.

## Aandachtspunt
De Instagram-bestanden zijn maar 640 px. Op grote schermen is dat net genoeg (tegels en dia's zijn maximaal ~460 px breed). Vraag Carien om de originelen voor scherpere versies (zie `docs/fotolijst.md`).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | brief opgesteld |
| Bouwen | website-bouwer | 7 foto's uitgesneden, homepage aangepast, tests en sitecontrole groen |
| Controleren | website-controleur | ronde 1 NIET AKKOORD: jasje-collage, kleuren, Instagram-blok, alt-teksten, ongebruikt bestand |
| Bouwen | website-bouwer | ronde 2: jasje in twee losse foto's, kleuren verdeeld, Instagram-blok alleen Instagram, alt-teksten feitelijker |
| Controleren | website-controleur | ronde 2 AKKOORD (originelen van Carien nodig voor scherpte) |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
