# Scrollen, kleurovergangen en werkwijze precies zoals stockdutchdesign.com

- **Datum:** 2026-11-01
- **Aangevraagd door:** Carst ("scrolt anders, Stock flowt lekkerder; kleurtransities kloppen niet; 001 — werkwijze staat midden links")
- **Risico:** midden. Raakt `main.js`, `style.css`, de opbouw van de werkwijze in `index.html` en `hero-kleur` op twee pagina's.

## Gemeten op stockdutchdesign.com (1 nov 2026, uit hun eigen code)
- **Scrollen:** "virtual scroll" met `ease: .05` per beeld; de pagina glijdt achter het wiel aan en loopt ongeveer een seconde uit. Op telefoons gewoon native.
- **Kleur onderin:** een vaste achtergrondlaag (`.a-background`). Elke sectie heeft halverwege een markering met een kleur. Zodra die in beeld is, vloeit de laag in 0,75 s naar die kleur. (Wij wisselen al bij een lijn op 88% van het scherm, zodat witte tekst niet op een lichte laag staat.) De secties zelf zijn doorzichtig.
- **Kleur bovenin:** muis op de linker- of rechterhelft van de collage kleurt collage, uitgelicht-blok en kernwaarden samen in 0,75 s (terracotta ↔ olijf).
- **Kernwaarden (onze 001 Werkwijze):** sectie van schermhoogte, label linksboven (top 10,41vw, links 8,33%), drie kolommen met de tekst verticaal in het midden. Bij aanwijzen kleurt de bovenkant in 1 s naar de kolomkleur (perzik, oker, mauve). Er schuift een foto van boven in (opacity 0,6 op zwart, zoom van 1,3 naar 1) en de uitleg schuift uit een masker. De kleur blijft staan na het weggaan.

## Acceptatiecriteria
1. Muiswiel en toetsenbord glijden met ease 0,05 (onafhankelijk van 60/120/144 Hz). Ankerlinks glijden ook. Scrollbalk, zoeken, schermlezers en touch blijven native. Uit bij `prefers-reduced-motion`.
2. Na de bovenkant zijn de secties doorzichtig boven één vaste laag, die per sectie in 0,75 s van kleur verloopt. De hover-lijst en de woordenlijst kleuren dezelfde laag.
3. Collage: linkerhelft terracotta, rechterhelft olijf, voor header, collage, uitgelicht en werkwijze samen.
4. Werkwijze: schermhoog, label linksboven, drie kolommen met scheidingslijntjes. Hover zoals hierboven. Op touch, op mobiel en zonder JS is alle tekst zichtbaar en zijn er geen foto's.
5. De vaste balk neemt de kleur over van wat eronder ligt.
6. Zonder JavaScript houden de secties hun eigen achtergrond.
7. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Foto's in de werkwijze
Samen kiezen: `pers-stoffen.jpg`; Persoonlijk maken: `pers-sjaaltje-naam.jpg`; Met zorg gemaakt: `pers-handwerk.jpg`.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | gemeten in de code van Stock, brief opgesteld |
| Bouwen | website-bouwer | gebouwd; sitecontrole groen; uitloop wiel gemeten (~1,2 s) |
| Controleren | website-controleur | ronde 1 NIET AKKOORD: witte contacttekst op lichte laag, werkwijze-tekst alleen met muis, kleur bovenaan bleef hangen, focus raakte uit beeld tijdens glijden |
| Bouwen | website-bouwer | ronde 2: laag wisselt op 88%-lijn; kolommen openen ook met Tab; bovenkant terug naar terracotta bij verlaten; glijden stopt bij focus; toetsenbord en ankers vlotter (ease 0,14) |
| Controleren | website-controleur | ronde 2 AKKOORD |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
