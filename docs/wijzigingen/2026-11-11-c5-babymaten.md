# C5 — Babymaten in het contactformulier

**Wens (Carst, 11 nov., issue #57):** het contactformulier uitbreiden met standaard babymaten waar dat past. Maatkeuzes zijn een besluit van Carst; Carien kan ze later bijstellen.

## Wat verandert
- **Kraamcadeaubox** (`box_maat`, was een vrij veld "Kledingmaat"): keuzelijst "Weet ik nog niet" (standaard) · maat 50 · 56 · 62 · 68 · 74.
- **Prematuurkleding** (`prem_maat`, was een vrij veld "Maat of gewicht van de baby"): keuzelijst maat 32 · 38 · 44 · 50 · "Anders / gewicht", met een vrij veld `prem_maat_anders` dat alleen bij "Anders / gewicht" in beeld komt (CSS `:has`; zonder `:has` staat het er altijd, met "Alleen bij …").
- **Iets op maat laten maken**: nieuwe groep met keuzelijst `op_maat` maat 32 · 38 · 44 · 50 · 56 · 62 · 68 · 74 · 80 · 86 · "Anders", met vrij veld `op_maat_anders` (zelfde gedrag).
- `src/formulier.js` accepteert alleen de toegestane waarden; een onbekende waarde valt weg (zoals bij thema en formaat). Het vrije veld komt alleen mee als "Anders" (of niets) is gekozen. In de mail staat de maat als "maat 50".
- De LET OP-opmerkingen over onbekende maten vervallen (besluit Carst); de sitecontrole volgt die gewijzigde eis.

## Acceptatiecriteria
1. Bij onderwerp Kraamcadeaubox is "Kledingmaat" een keuzelijst met precies: Weet ik nog niet, maat 50, 56, 62, 68, 74.
2. Bij Prematuurkleding is de maat een keuzelijst met maat 32, 38, 44, 50 en "Anders / gewicht"; het veld "Anders of gewicht" is alleen zichtbaar bij "Anders / gewicht" (met `:has`).
3. Bij "Iets op maat laten maken" verschijnt een eigen groep met de keuzelijst maat 32 t/m 86 en "Anders"; het vrije veld "Andere maat" alleen bij "Anders". Bij "Iets anders" is er geen groep.
4. Alle nieuwe velden zijn optioneel; verplicht blijven bericht, naam en e-mail.
5. De mail toont bijvoorbeeld "Kledingmaat: maat 56", "Maat van de baby: maat 44", "Andere maat of gewicht: 1800 gram", "Maat: maat 86". Onbekende waarden komen nooit in de mail; het vrije veld valt weg als er een vaste maat is gekozen; regeleinden en lengte worden begrensd.
6. Vooraf invullen via `?onderwerp=…&formaat=…&thema=…` werkt ongewijzigd.
7. Op 390 px staat alles in één kolom, zonder horizontaal scrollen; velden zijn minstens 44 px hoog met labels zoals de bestaande.
8. `npm test`, `python3 scripts/controleer.py` en de relevante e2e-tests groen (axe, WebKit en Lighthouse in CI).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Brief uit de wens en besluiten van Carst (11 nov.) |
| Bouwen | website-bouwer | Keuzelijsten in `contact.html` (nieuwe groep Iets op maat, vrij veld bij Anders via `:has`), validatie en mailtekst in `src/formulier.js`, unit- en e2e-tests, sitecontrole volgt de nieuwe velden (LET OP kledingmaat vervallen), CLAUDE.md bijgewerkt. `npm test` 97/97, `controleer.py` zonder fouten, e2e formulier/contact/kernpaden/SEO groen op desktop, tablet en mobiel; axe, WebKit, Lighthouse en visueel in CI |
| Controle | website-controleur | AKKOORD — maatkeuzes volgens issue #57; formulier.js laat alleen toegestane maten door en het vrije veld is begrensd en zonder regeleinden; werkt zonder JS en zonder :has; vooraf invullen ongewijzigd; npm test 97/97, controleer.py zonder fouten, e2e 215 groen (axe, WebKit en Lighthouse in CI) |
| Ontwerpgate | website-ontwerper | ONTWERP AKKOORD — keuzelijsten volgen het bestaande formulierpatroon, vrij veld alleen bij Anders direct naast/onder de lijst, 390 px één kolom zonder horizontaal scrollen, velden 49 px en 16 px |
| Na controle (hoofdsessie) | Claude | Kan-beter verwerkt: vrij veld alleen bij Anders of zonder keuze (controleur); voorbeeld "Bijvoorbeeld 1800 gram" en groepskop "Je maatwerk" (ontwerper); npm test 97/97 |
