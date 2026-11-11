# Stoffen zonder scrollbalk (C6, issue #58)

**Wens (Carst, 11 nov., met schermafdruk desktop):** "I am not a fan of scroll bars, we already have better ways (patterns) on the website to improve this." Het gaat om de veegbare rij "De stoffen" onder 002 — Wat er in de box kan op `kraamcadeauboxen.html`, die op desktop een zichtbare horizontale scrollbalk toont.

## Wat verandert
- De stoffenrij volgt het bestaande patroon van de thema's: binnen de rand (eerste stof onder het label, rechts een stukje van de volgende), scroll-snap, pijlknoppen vorige/volgende van 44 px alleen met een muis (`aria-disabled` aan begin en eind, de focus blijft op de knop), Home/End in de rij, vegen op touch. Geen zichtbare scrollbalk.
- Gedeelde klasse `.carrousel` (CSS en `main.js`) voor thema's, stoffen en de fotorij op Werkwijze (001 Het atelier), die op desktop ook een zichtbare scrollbalk had. De knop schuift één set: zoveel tegels als er helemaal binnen de rand passen (thema's: drie, zoals voorheen).
- Tegelgrootte en namen van de stoffen blijven (200 px, mobiel 128 px, nooit groter dan het bestand van 240 px). Op mobiel blijven de stoffen 128 px (twee en een half in beeld) in plaats van één tegel per keer: zo blijft de tegelgrootte behouden.
- Zonder JavaScript zijn er geen knoppen; dan krijgt een muis een dunne scrollbalk, zodat de rij bruikbaar blijft.
- De productrij (alleen veegbaar tot 1024 px) is niet aangepast, om het samenvoegen met C2 (Speenkoord) eenvoudig te houden: met een muis in een smal venster (761–1024 px) toont die nog een scrollbalk. Kan in een vervolgstap dezelfde aanpak krijgen.
- `CLAUDE.md`: Kraamcadeauboxenpagina en een algemene regel "geen zichtbare scrollbalken".

## Acceptatiecriteria
1. Op 1440 × 900 heeft `#stoffenrij` geen scrollbalk (`scrollbar-width: none`, geen hoogte voor een balk) en scroll-snap `x mandatory`.
2. De eerste stof begint onder het label van 002; met een muis staan "Vorige stoffen" en "Volgende stoffen" (44 × 44 px, `aria-controls="stoffenrij"`); "vorige" heeft aan het begin `aria-disabled="true"`, "volgende" aan het eind; "volgende" slaat geen stof over.
3. Home en End in de rij gaan naar de eerste en de laatste stof; de rij blijft `role="region"`, `aria-label="Stoffen"`, `tabindex="0"`.
4. Op touch (768 en 390) geen knoppen, wel vegen; op 390 scrolt de pagina niet horizontaal.
5. De negen namen en tegels (max. 240 px) zijn ongewijzigd; de thema's werken als voorheen.
6. Ook de fotorij op Werkwijze heeft geen scrollbalk en heeft dezelfde knoppen.
7. `npm test`, sitecontrole en de e2e-kernpaden groen (axe, WebKit en Lighthouse in CI).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Brief direct uit de feedback van Carst (issue #58) |
| Bouwen | website-bouwer | `.carrousel` gedeeld door thema's, stoffen en fotorij Werkwijze; knoppen bij stoffen en fotorij; e2e "C6" (twee tests), bestaande themaknop-test en sitecontrole gericht op `aria-controls="themacarrousel"` (nu er meer knoppen zijn; niet versoepeld). `npm test` groen, sitecontrole geen fouten, e2e homepage-zoals-stock, kernpaden, mobiel-ontwerp, seo-veiligheid en plaatshouders groen op desktop, tablet en mobiel (axe, WebKit, Lighthouse en visueel in CI) |
| Controle | website-controleur | AKKOORD — stoffen en fotorij in het carrouselpatroon zonder scrollbalk, thema's nog per set van drie (F4, controleer.py), Home/End en aria-disabled werken, op touch geen knoppen en op 390 geen horizontaal scrollen, zonder JS bruikbaar, tests niet versoepeld; npm test, sitecontrole en e2e lokaal groen (axe, WebKit en Lighthouse in CI) |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD — stoffen en fotorij zonder scrollbalk, knoppen en snap zoals bij de thema's; 2,5 stof op mobiel houdt de staalgrootte (alleen de productrij van 761–1024 px houdt nog een scrollbalk, vervolgstap) |
