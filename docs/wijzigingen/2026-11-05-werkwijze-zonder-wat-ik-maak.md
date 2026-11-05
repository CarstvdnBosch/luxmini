# Werkwijze zonder "Wat ik maak"

- **Datum:** 5 november 2026
- **Aangevraagd door:** Carst ("Haal weg", 21:38)
- **Branch:** `wijziging/werkwijze-zonder-wat-ik-maak`
- **Risico:** laag. Er verdwijnt één sectie en er verandert één doorverwijzing.

## Wens
Op Werkwijze stond "Wat ik maak". Die indeling staat nu ook op de homepage, waardoor de zin over siliconen twee keer op Werkwijze stond. Carst besloot: weghalen.

## Acceptatiecriteria
1. Werkwijze heeft geen sectie "Wat ik maak" meer.
   - Volgorde: kop, 001 Het atelier, 002 Hoe ik werk, 003 Personaliseren, 004 Contact.
2. Het subitem "Wat ik maak" staat niet meer in het menu op alle pagina's (16 menulinks).
3. Oude adressen landen op de homepage:
   - `/producten` en `/producten.html` geven 301 naar `/`;
   - `/producten#siliconen`, `#babykleding`, `#babynest`, `#prematuur` en `#kraamcadeaubox` tonen de kop van het juiste blok;
   - `#prematuur` en `#kraamcadeaubox` werken via een anker bovenaan het blok.
4. De producttekst op de homepage blijft letterlijk gelijk. De sitecontrole bewaakt die nu met vaste teksten.
5. `npm test`, de sitecontrole, de kernpaden en SEO/veiligheid zijn groen. Er is niets versoepeld: de vervallen controles zijn vervangen.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen en bouwen | Claude (hoofdsessie) | Gebouwd. Sitecontrole en e2e (74 groen) lokaal groen. |
