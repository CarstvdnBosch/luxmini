# C2 — Bijtring of speenkoord in de grote box

**Wens (Carien, 11 nov., via Carst; issue #54):** "bij grote cadeaubox vermelden bijtring of speenkoord, heb hier voorbeelden van liggen." Akkoord Carst om te starten.

## Wat verandert
- De box van € 80 bevat voortaan "bijtring of speenkoord" in plaats van alleen "bijtring": prijskaart € 80 op `kraamcadeauboxen.html` (ook de compacte mobiele regel "plus: …"), de formaatkeuze € 80 in het formulier op `contact.html` ("Met bijtring of speenkoord", in lijn met de regels van de andere formaten) en de inhoudsregel in `CLAUDE.md`. Prijzen en aantallen blijven gelijk (de box telt 7 producten: één van de twee).
- 002 — Wat er in de box kan krijgt een achtste product **Speenkoord** met "in de box van € 80", in dezelfde opmaak als Bijtring, met Cariens eigen foto (`p-speenkoord-hond-600.jpg` / `p-speenkoord-hond.jpg`, staand 3:4, warm gebroken wit).
- Desktop: acht tegels naast elkaar (grid van 7 naar 8 kolommen); tablet en mobiel blijven een veegbare rij.
- Test "kraamcadeauboxen: acht producten…" (`tests/e2e/homepage-zoals-stock.spec.js`), de prijskaarttest op mobiel (`tests/e2e/mobiel-ontwerp.spec.js`) en de prijstabel in `scripts/controleer.py` toetsen de nieuwe inhoud. Dit is een nieuwe eis, geen versoepeling.
- Homepage, structured data en meta noemen de inhoud van de € 80-box niet; daar verandert niets.

## Acceptatiecriteria
1. Prijskaart € 80 noemt "Bijtring of speenkoord" (desktop in de vinklijst, mobiel in de regel "plus: …"); "7 producten" en de link naar het formulier blijven.
2. In 002 staan acht producten; de achtste is Speenkoord met "in de box van € 80" en een echte foto van Carien met beschrijvende alt.
3. Op 1440 px staan de acht producten op één rij zonder scrollen; op 768 en 390 px een veegbare rij zonder dat de pagina horizontaal scrolt.
4. Formulier: formaat € 80 heet "Met bijtring of speenkoord".
5. `CLAUDE.md`: "€ 80 (+ bijtring of speenkoord; wens Carien 11 nov.)" en "acht losse producten".
6. `npm test`, de sitecontrole en de relevante e2e-tests groen; axe, WebKit en Lighthouse in CI.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Brief direct uit de wens (issue #54) |
| Bouwen | website-bouwer | Prijskaart € 80 en formulier: "bijtring of speenkoord"; achtste product Speenkoord met eigen foto (`p-speenkoord-hond(-600).jpg`); desktop 8 kolommen; tests en sitecontrole volgen de nieuwe eis (ook afdruktest 24 → 25 foto's). `npm test` 94/94, sitecontrole zonder fouten, e2e (desktop, tablet, mobiel; zonder axe) groen. Axe, WebKit, Lighthouse en visueel in CI; visueel verschil op kraamcadeauboxen en contact is bedoeld. Op 1025 px breekt "in de box van € 80" op twee regels (net als Douche-handschoen al deed). |
