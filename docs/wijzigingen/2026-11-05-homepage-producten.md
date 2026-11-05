# Homepage per product, compacte productpagina's, Babynest en Inspiratie

- **Datum:** 5 november 2026
- **Aangevraagd door:** Carst
- **Branch:** `wijziging/navigatie-v2` (zelfde release als PR #8)
- **Risico:** hoog. De homepage, de navigatie en drie pagina's veranderen, er komt een pagina bij, en adressen en tests moeten mee.

## Wens (Carst, letterlijk, 5 nov.)
1. Kraamcadeauboxen: "het gedeelte nu in beeld vind ik teveel scrollen. Laten we dat compacter doen. Dus Giraf, vos, tulp, walvis, etc. Ik wil dat een voorbeeld van de box direct in beeld komt na de korte introductietekst die we nu hebben. De foto met naam en geboortedatum op de producten en zelfs op de doos. Dan direct de prijzen... aan het einde staat dan het contact... alle contactmomenten leiden naar een contactformulier op de contacttab (hoofdnavigatie)."
2. "Zelfde geldt voor prematuur babykleding."
3. "De uitleg op de pagina 'Wat ik maak' (babykleding, siliconen items, babynest, prematuurkleding, kraamcadeauboxen) is een perfecte uiteenzetting, dat moet de indeling op de homepagina worden."
4. "Ik wil ook in de hoofdnavigatie Babynest toevoegen."
5. "Laten we portfolio renamen naar Inspiratie."

## Besluiten van Carst
- **Homepage:** hero → vijf productblokken (Babykleding, Siliconen items, Babynest, Prematuurkleding, Kraamcadeauboxen) → Inspiratie-teaser → Instagram → contact. De rest verhuist naar Werkwijze of Inspiratie: uitgelicht, werkwijze-kolommen, sferen, personaliseren, statement en Over Carien.
- **Hoofdnavigatie (zes items):** Werkwijze · Kraamcadeauboxen · Prematuurkleding · Babynest · Inspiratie · Contact.

## Al gedaan in de werkmap (hoofdsessie, nog niet gecommit)
- **Kraamcadeauboxen** heeft deze volgorde:
  - kop met intro;
  - de statementfoto "Met naam en geboortedatum, op de producten en zelfs op de doos." direct daarna;
  - 001 Kies je formaat (prijskaarten);
  - 002 Thema's als compact raster (`.themaraster`, 3/2/2 kolommen, foto 4:3 met naam, één pijl-link "Vraag je thema aan");
  - 003 Zo werkt het;
  - 004 Contact.
- **Contactblok** op home, Werkwijze, Prematuurkleding, Portfolio en Kraamcadeauboxen: één pijl-link "Stuur Carien een bericht" → `contact.html#formulier`, in plaats van WhatsApp, telefoon, mail en "Neem contact op".
- **Prematuurkleding:** de link "WhatsApp Carien" in de kop gaat nu ook naar het formulier.
- **Nog niet bijgewerkt:** de controles in `scripts/controleer.py` (thema's in het ritme, WhatsApp in het contactblok, enzovoort) en `tests/e2e`.

## Ontwerprichting
- **Hergebruik bestaande patronen.** Productblokken in de stijl van de huidige categorie-/"Wat ik maak"-rijen, maar groter: foto en tekst om en om, elk blok een eigen sectie met `data-label` (001–005) en een lichte paletkleur als `data-achtergrond`.
  - Buren hebben nooit dezelfde kleur en nooit terracotta. Op lichte kleuren alleen inkt.
  - Per blok: kop (Display), de bestaande producttekst uit "Wat ik maak" (letterlijk), één pijl-link naar de productpagina:
    - Babykleding → `inspiratie.html#kleding`;
    - Siliconen → `inspiratie.html#siliconen`;
    - Babynest → `babynest.html`;
    - Prematuurkleding → `prematuurkleding.html`;
    - Kraamcadeauboxen → `kraamcadeauboxen.html`.
  - Foto: bestaande foto, nooit groter dan het bestand, srcset met -600, lazy behalve het eerste blok.
  - Mobiel: foto boven, tekst onder.
- **Hero blijft** (collage, sets, intro), maar alle hero-links gaan naar de nieuwe pagina's.
- **Inspiratie-teaser:** een sectie met 3 tot 4 foto's uit het portfolio en de pijl-link "Bekijk alle inspiratie" → `inspiratie.html`.
- **Instagram** blijft. Het contactblok (`id="contact"`) heeft alleen "Stuur Carien een bericht".
- **Werkwijze** krijgt wat van de homepage verhuist en nog niet op Werkwijze staat. Personaliseren, het verhaal en "Hoe ik werk" staan er al. Er komt geen dubbele inhoud; de werkwijze-kolommen hoeven niet mee als "Hoe ik werk" hetzelfde vertelt.
- **Inspiratie:** de sferen ("Het gevoel") komen niet terug als dat dubbel is met de foto's die er al staan. Kies het rustigste.
- **Prematuurkleding**, zelfde opbouw als Kraamcadeauboxen:
  - korte intro in de kop;
  - direct een voorbeeldfoto (tijdelijk de foto van het broekje, LET OP);
  - de prijsrichtlijn "[prijs]" (LET OP) als eigen blok;
  - Zo werkt het (drie stappen);
  - contact (formulier).
  - Compact, zonder leeg scherm.
- **Babynest (nieuw), dezelfde opbouw:**
  - kop "Babynest" met de bestaande zin "Een babynest in de stof en kleur die jij kiest." (LET OP);
  - de foto `ig-babynest` (maximaal 324 px breed, niet vergroten);
  - prijsrichtlijn "[prijs]" (LET OP);
  - Zo werkt het;
  - contact.
- **Portfolio wordt Inspiratie:**
  - het bestand `inspiratie.html`; `portfolio.html` wordt verwijderd;
  - 301 van `/portfolio` naar `/inspiratie`;
  - h1, title, de menu-labels en de balklabels worden "Inspiratie";
  - de ankers `#kleding`, `#textiel`, `#siliconen` en `#boxen` blijven.
- **Hoofdnavigatie, zes items:**
  - de header toont de items op één regel, vanaf de breedte waarop ze naast het logo passen (meet het, waarschijnlijk 1280 px); daaronder de burger;
  - in het menu de subitems zoals nu, plus Babynest zonder subitems, en Inspiratie met de groepen;
  - op mobiel zes hoofditems en WhatsApp zonder scrollen op 390×844;
  - tikdoelen op touch 44 px.
- **Contactmomenten:** elke CTA op een pagina die niet de contactpagina is, gaat naar `contact.html#formulier`. De contactpagina zelf houdt WhatsApp, telefoon en mail. Ook het menu en de footer houden de directe kanalen.

## Acceptatiecriteria
1. Kraamcadeauboxen:
   - de volgorde is kop → statementfoto → 001 formaten → 002 thema's (raster, 9 thema's, geen lopende regels meer) → 003 Zo werkt het → 004 Contact;
   - op 1440×900 staan alle negen thema's binnen twee schermen;
   - op 390 staat de statementfoto direct na de intro.
2. Prematuurkleding en Babynest:
   - de volgorde is kop → voorbeeldfoto → prijsrichtlijn → Zo werkt het → contact;
   - op 390 is de foto na hooguit één keer scrollen in beeld;
   - "[prijs]" staat er met LET OP.
3. Homepage:
   - de volgorde is hero → 001 Babykleding, 002 Siliconen items, 003 Babynest, 004 Prematuurkleding, 005 Kraamcadeauboxen → 006 Inspiratie → 007 Instagram → 008 Contact;
   - de teksten zijn letterlijk die van "Wat ik maak";
   - elk blok heeft één pijl-link naar de juiste pagina.
4. Navigatie:
   - zes items in deze volgorde op alle pagina's;
   - `aria-current` op de huidige pagina;
   - vanaf de gemeten breedte op één regel, daaronder alleen de burger, nergens een tweede regel;
   - op 390×844 staan zes hoofditems en WhatsApp in beeld;
   - op touch zijn alle tikdoelen ≥ 44 px.
5. Adressen:
   - `/portfolio` geeft 301 naar `/inspiratie`;
   - alle eerdere doorverwijzingen blijven;
   - de sitemap bevat `/`, `/werkwijze`, `/kraamcadeauboxen`, `/prematuurkleding`, `/babynest`, `/inspiratie`, `/contact`, `/privacy`;
   - geen kapotte links of ankers.
6. Contact: op geen enkele pagina behalve `contact.html` staat een pijl-link naar WhatsApp, telefoon of mail in de inhoud. Het menu en de footer mogen dat wel.
7. Werkwijze bevat geen dubbele inhoud en geen lege secties. Wat van de homepage verhuist, staat er alleen als het nog niet op Werkwijze stond.
8. Harness:
   - `npm test` is groen;
   - `python3 scripts/controleer.py` is groen en bijgewerkt (vervallen controles zijn vervangen, geen grens versoepeld);
   - `tests/e2e` en `lighthouserc.cjs` zijn bijgewerkt voor de nieuwe pagina's, de rooktest en de schermafdrukken ook;
   - kernpaden en SEO/veiligheid zijn lokaal groen.
9. In `CLAUDE.md` zijn bijgewerkt: "Mappen", "Hoofdnavigatie", "Kraamcadeauboxpagina" (compact raster in plaats van het projectenritme), "Hero/homepage-opbouw", de regel over het contactformulier en de vaste balk. Dat zijn wensen van Carst. `docs/kwaliteit.md` wordt bijgewerkt waar nodig.
10. Geen verzonnen teksten. Nieuwe teksten krijgen LET OP.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) | Brief op basis van de wensen en besluiten van Carst (5 nov.) |
| Bouwen | website-bouwer (Claude) | Criteria 1–10 uitgevoerd op `wijziging/navigatie-v2`. Lokaal groen: `npm test` (12/12), `python3 scripts/controleer.py` (geen fouten; alleen `[nummer]` en `[prijs]` open), kernpaden en SEO/veiligheid (71 geslaagd, 52 overgeslagen per scherm). Axe en Lighthouse draaien alleen in GitHub. |

### Keuzes bij het bouwen
- **Homepage:** blokken 001–005 hergebruiken `.categorie` (foto en tekst om en om, mobiel foto boven) in salie, olijf, mauve, perzik en oker. Kop en tekst letterlijk uit "Wat ik maak". De linkteksten ("Bekijk babykleding", "Bekijk siliconen items", "Bekijk het babynest", "Bekijk prematuurkleding", "Bekijk alle inspiratie") zijn nieuw en staan onder LET OP. De quote met "Over Carien" onder de collage blijft.
- **Wat verhuist:** het atelierstatement staat nu op Inspiratie (voor het contactblok); op Werkwijze zou de foto dubbel zijn met "Hoe ik werk". Niet verhuisd omdat het er al staat: uitgelicht (staat op Kraamcadeauboxen en in blok 005), de werkwijze-kolommen (= "Hoe ik werk"), de sferen (dezelfde foto's als Inspiratie), Personaliseren en Over Carien (staan al op Werkwijze). Het anker `#over` op de homepage vervalt; er linkt niets naartoe.
- **Werkwijze:** "Wat ik maak" blijft staan (de oude adressen `/producten#…` landen daar en het menu-subitem blijft). De links gaan nu naar Inspiratie en Babynest. Open vraag voor Carst: "Wat ik maak" staat nu ook als homepage-indeling.
- **Navigatie:** gemeten breedte is 1280 px (daar passen de zes links naast het logo zonder dat het logo krimpt; het logo krimpt nu nooit meer). Daaronder alleen de burger. Op touch zijn burger, balklogo, header- en footerlinks minimaal 44 px.
- **Balk:** op mobiel 14 px en op één regel, zodat "005 — Kraamcadeauboxen" en de labels op Inspiratie niet meer over twee regels lopen.
- **Babynest en Prematuurkleding:** prijsrichtlijn als eigen blok "002 — Prijsrichtlijn". Het babynestblok is op desktop zo hoog als de inhoud, zodat de kleine foto (324 px) geen leeg vlak geeft.
- **Harness:** vervallen controles zijn vervangen door gelijkwaardige of strengere (zie de commit "Harness bijgewerkt"). Thema-ritme → raster, negen thema's binnen twee schermen, geen lopende regels. WhatsApp in contactblok/kop → "Stuur Carien een bericht" naar het formulier, plus een controle dat nergens buiten contact.html directe kanalen in de inhoud staan. Portfoliosferen op home → productblokken en Inspiratie-teaser. Tabbladen in Personaliseren → nu verplicht op Werkwijze. "Max. 4 secties" op Prematuurkleding → exacte volgorde van 5 secties (eis van de brief: prijsrichtlijn als eigen blok). Geen grens is versoepeld.
