# Productfoto's vrijstaand op de huiskleuren

- **Datum:** 2026-11-01
- **Aangevraagd door:** Carst (optie 2 uit het foto-advies)
- **Risico:** laag — alleen nieuwe afbeeldingen en verwijzingen in `public/`; formulier, redirects en pipeline blijven onaangeroerd.

## Doel
De productfoto's ogen nu als losse telefoonfoto's met wisselende grijze en witte achtergronden. Door de producten vrij te stellen op de kleuren van de site (perzik, oker, salie, mauve, olijf, grijsblauw, terracotta) met een zachte schaduw wordt het geheel rustiger en meer "editorial", in lijn met het ontwerp.

## Acceptatiecriteria
1. Elk product dat netjes vrij te stellen is, heeft een nieuwe versie op een huiskleur: staand 3:4 en vierkant 1:1, met een zachte schaduw en een subtiele textuur, in `public/assets/img/` met het achtervoegsel `-kleur`.
2. Een product dat **niet** schoon vrij te stellen is (bijvoorbeeld wit op wit), blijft zijn oude foto houden. Geen halve of gerafelde uitsnedes online.
3. De nieuwe versies worden gebruikt in de collage (voor- en achterkanten), de portfolio-lijst en het Instagram-blok op de homepage, en waar passend op de kraamcadeaubox-pagina. Foto's van boxen, sfeer en het atelier blijven onveranderd.
4. Per sectie wisselen de achtergrondkleuren elkaar af; twee buren hebben nooit dezelfde kleur.
5. Bestanden max. ~150 KB per stuk; elke afbeelding houdt een beschrijvende `alt`.
6. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Bestanden
- `public/assets/img/*-kleur.jpg` (nieuw)
- `public/index.html`, `public/kraamcadeaubox.html`
- `scripts/vrijstaand.py` (nieuw: het script om nieuwe foto's later op dezelfde manier te verwerken)

## Buiten scope
- Nieuwe fotoshoot (zie `docs/fotolijst.md`).
- AI-gegenereerde producten of mensen: nooit.

## Open vragen
- Geen; witte producten blijven voorlopig in hun oude versie tot er nieuwe foto's zijn.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | brief opgesteld |
| Bouwen | website-bouwer | 9 producten vrijgesteld (shirtje cognac en oudroze, sjaaltje, bijtring Tobi, bijtring giraf, swaddle opgerold en open, broekje regenboog). Knuffels, letterbijtring en vosjesbroek blijven het origineel (uitsnede niet schoon). |
| Controleren | website-controleur | Ronde 1 NIET AKKOORD (doos vrijgesteld, gat bij sticker). Doos teruggezet naar origineel, ongebruikte bestanden verwijderd. |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
