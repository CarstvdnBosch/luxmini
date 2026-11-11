# Mintgroene knuffel van de site (C3)

**Wens (Carien, 11 nov., via Carst; issue #55):** "De mintgroene knuffel staat absoluut niet in het geheel, ga hier een andere voor maken." Akkoord Carst om te starten.

## Wat verandert
- De foto van het mintgroene knuffeldoekje-konijn met LUX-label (`p-knuffel.jpg`, `p-knuffel-600.jpg`) verdwijnt van de site. Hij stond alleen op Inspiratie, in groep 002 Knuffels, swaddles en babynest (`#textiel`), met bijschrift "Knuffel mint".
- Om de groep op vier items te houden (vier kolommen op desktop, geen leeg vak) komt er een bestaande eigen foto bij die nog niet op de site stond: de opgerolde swaddle met strik (origineel `p-swaddle.jpg`, vrijgesteld op perzik: `p-swaddle-strik-kleur.jpg` en `-600`). Het is dezelfde swaddle als het item "Swaddle, open", in een andere stand; daarom staan ze nooit naast elkaar (ronde 2, ontwerpgate).
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
| Ontwerpgate ronde 1 | website-ontwerper | ONTWERP NIET AKKOORD — de twee swaddles mogen niet naast elkaar staan; nieuwe foto vrijstaand op perzik in 3:4 zoals de buur; bijschriften en alt gelijktrekken |
| Bouwen ronde 2 | website-bouwer | Volgorde Swaddle, open · Knuffel met naam · Babynest · Swaddle, dichtgestrikt (1440: kolom 1 en 4; 768: Babynest ertussen; 390: linksboven en rechtsonder). Foto vrijgesteld met `scripts/vrijstaand.py` op perzik `#DEB799`: `p-swaddle-strik-kleur.jpg` (900 × 1200) + `-600`; `p-swaddle-600.jpg` verwijderd. Alt beide "print van bosdieren". `npm test` 94/94, `controleer.py` geen fouten, e2e kernpaden en seo-veiligheid 87 geslaagd, 0 fout (desktop, tablet, mobiel; Chromium); axe, WebKit, Lighthouse en visueel in CI |
| Controle ronde 2 | website-controleur | NIET AKKOORD — alt van p-swaddle-open-kleur in kraamcadeauboxen.html (r. 201, img en noscript) nog "Opgerolde … vosjes en egeltjes" |
| Ontwerpgate ronde 2 | website-ontwerper | ONTWERP AKKOORD — swaddles staan op 1440, 768 en 390 niet meer naast elkaar; de nieuwe foto staat vrij op perzik in 3:4, scherp en warm, en sluit aan bij de buren |
| Bouwen ronde 3 | Claude (hoofdsessie) | Alt op kraamcadeauboxen gelijk aan Inspiratie (img en noscript); srcset p-knuffel-naam 900w → 675w (bestaande fout, bestand is 675 breed) |
