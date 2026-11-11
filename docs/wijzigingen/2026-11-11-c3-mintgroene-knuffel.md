# Mintgroene knuffel van de site (C3)

**Wens (Carien, 11 nov., via Carst; issue #55):** "De mintgroene knuffel staat absoluut niet in het geheel, ga hier een andere voor maken." Akkoord Carst om te starten.

## Wat verandert
- De foto van het mintgroene knuffeldoekje-konijn met LUX-label (`p-knuffel.jpg`, `p-knuffel-600.jpg`) verdwijnt van de site. Hij stond alleen op Inspiratie, in groep 002 Knuffels, swaddles en babynest (`#textiel`), met bijschrift "Knuffel mint".
- Om de groep op vier items te houden (vier kolommen op desktop, geen leeg vak) komt er een bestaande eigen foto bij die nog niet op de site stond: de opgerolde swaddle met strik (`p-swaddle.jpg`, met een nieuwe webversie `p-swaddle-600.jpg`). Het is dezelfde swaddle als het item "Swaddle", in een andere stand; daarom staat hij niet naast dat item.
- De bestanden `p-knuffel.jpg` en `p-knuffel-600.jpg` worden verwijderd (niets gebruikt ze meer).
- Het crème knuffeldoekje met naam (`p-knuffel-naam*.jpg`) en de doos met mintgroen vloeipapier blijven (vloeipapier valt onder C1).
- `docs/fotolijst.md`: gewenst een foto van de nieuwe knuffel van Carien (vervangt het mintgroene konijn).

## Acceptatiecriteria
1. Geen enkele pagina in `public/` (ook `srcset`, `data-src`, `noscript`), `main.js` of `style.css` verwijst nog naar `p-knuffel.jpg` of `p-knuffel-600.jpg`; de bestanden zijn weg.
2. Inspiratie, groep 002, toont vier items zonder gat of scheve kolom op 1440, 768 en 390 px; geen AI-beeld, alleen eigen foto's.
3. De nieuwe foto heeft een beschrijvende `alt`, `width`/`height`, `loading="lazy"` en een `srcset` zoals de andere items.
4. Het crème knuffeldoekje en de vloeipapierfoto staan er nog.
5. `docs/fotolijst.md` vraagt om een foto van de nieuwe knuffel.
6. `npm test`, `scripts/controleer.py` en de relevante e2e-tests groen; axe, WebKit en Lighthouse in CI.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Brief uit de wens van Carien (issue #55) |
| Bouwen | website-bouwer | Mintgroene knuffel weg uit Inspiratie (enige plek), `p-knuffel(-600).jpg` verwijderd; `p-swaddle.jpg` + nieuwe `p-swaddle-600.jpg` als vierde item (achteraan, niet naast "Swaddle"); fotolijst punt 21. `npm test` groen, `controleer.py` geen fouten, e2e kernpaden/mobiel-ontwerp/seo-veiligheid groen op desktop, tablet en mobiel (Chromium); axe, WebKit, Lighthouse en visueel in CI. Schermafdrukken 1440/768/390: vier items, geen gat |
