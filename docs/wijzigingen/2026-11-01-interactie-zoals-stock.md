# Interacties en ontwerpprincipes gelijk aan stockdutchdesign.com

- **Datum:** 2026-11-01
- **Aangevraagd door:** Carst
- **Risico:** midden — veel JavaScript en CSS op alle pagina's; formulier, redirects en pipeline blijven onaangeroerd.

## Doel
De site moet aanvoelen als stockdutchdesign.com: dezelfde soort beweging, overgangen en navigatie, met de inhoud, het logo en de foto's van LUX mini.

## Geïnventariseerd op stockdutchdesign.com (1 nov 2026)
`a-loader` (kleurscherm met logo), `a-burger` + `a-menu` (volledig scherm, grote serif-links over een gedimde foto), `a-cursor` (eigen cursor), `s-update-marquee` (grote lopende tekst die met het scrollen meebeweegt), `c-circle` (draaiende badge), `s-media-slider` (woordenlijst waarbij de foto per woord met kleur in beeld draait), `data-transition` (pagina-overgangen), `data-hud` (vaste balk met sectielabel; hebben we al), vloeiend scrollen, koppen die regel voor regel opkomen. Niet overgenomen: de review-slider, want er zijn (nog) geen echte reviews.

## Acceptatiecriteria
1. **Intro:** bij het eerste bezoek per sessie een kleurscherm met het LUX mini-logo, dat na maximaal ~1,6 s omhoog wegschuift. Niet bij herhaald bezoek in dezelfde sessie, niet bij `prefers-reduced-motion`. Zonder JavaScript is er geen intro.
2. **Menu:** een hamburgerknop rechtsboven op elke pagina, die altijd zichtbaar blijft (ook in de vaste balk). Die opent een menu over het hele scherm: donkere achtergrond met een gedimde atelierfoto, grote serif-links die één voor één opkomen, en een tweede kolom met de kraamcadeaubox, contactgegevens en socials. De drie streepjes worden een kruis. Sluiten met het kruis, met Esc of door op een link te klikken. `aria-expanded` klopt en de focus blijft in het menu. Op mobiel vervangt het menu de rij met links.
3. **Cursor:** op apparaten met een muis volgt een kleine cirkel de muis met een zachte vertraging. Die wordt groter boven links en knoppen, en toont een woord boven de collage ("draai") en de portfolio-lijst ("bekijk"). De gewone cursor blijft zichtbaar. Niet op touch.
4. **Lopende tekst:** een nieuw blok "Uitgelicht" met een foto en een grote serif-regel ("— Ieder nieuw leven is bijzonder —", van de oude site) die met het scrollen horizontaal meebeweegt, plus een korte tekst en een link naar de kraamcadeaubox.
5. **Badge:** de ronde badge draait mee met het scrollen.
6. **Personaliseren als woordenlijst:** een nieuw blok met de woorden Borduren, Belettering en Siliconen. Bij aanwijzen of tikken draait de bijbehorende foto met een eigen kleur in beeld, zoals de media-slider van Stock. Met een korte uitleg per techniek.
7. **Pagina-overgang:** bij een klik op een interne link naar een andere pagina schuift een kleurvlak in beeld; op de nieuwe pagina schuift het weer weg.
8. **Koppen en beelden:** grote koppen komen regel voor regel (per woord) op uit een masker. Foto's in de beeldparen zoomen rustig in tot hun normale grootte.
9. **Vloeiend scrollen:** met een muiswiel scrolt de pagina met zachte uitloop. Toetsenbord, scrollbalk, ankerlinks en touch blijven normaal werken. Niet bij `prefers-reduced-motion`.
10. Alles werkt op mobiel (390 px), zonder horizontaal scrollen. Bij `prefers-reduced-motion` staat alle beweging uit. Zonder JavaScript is alle inhoud zichtbaar.
11. `npm test` en `python3 scripts/controleer.py` geven geen fouten. `controleer.py` test ook het menu en de woordenlijst.

## Bestanden
`public/index.html`, `public/kraamcadeaubox.html`, `public/privacy.html`, `public/bedankt.html`, `public/assets/css/style.css`, `public/assets/js/main.js`, `scripts/controleer.py`, `CLAUDE.md`

## Buiten scope
Review-slider (geen echte reviews), meertaligheid, blog.

## Open vragen
- Foto voor "Belettering": er is geen foto van belettering op kleding. Tijdelijk gebruiken we de doos met "SEM 07-01-2022". Vervangen zodra er een echte foto is (zie `docs/fotolijst.md`, nr. 8).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | brief opgesteld na inventarisatie van de site van Stock |
| Bouwen | website-bouwer | gebouwd, tests en sitecontrole groen |
| Controleren | website-controleur | ronde 1 NIET AKKOORD: intro bleef staan zonder main.js, traag wiel, menu niet sluitbaar voor schermlezers, mobiel menu en woordenlijst zonder JS |
| Bouwen | website-bouwer | ronde 2: noodrem voor intro en .js-klasse, wiel met behavior instant, aria-modal weg, burger en verbergen alleen met .js, overslaanlink eerst, menu ook op 404, uitleg technieken gemarkeerd voor Carien |
| Controleren | website-controleur | ronde 2 AKKOORD |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
