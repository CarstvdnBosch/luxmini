# Analyse stockdutchdesign.com: navigatie en losse pagina's (2 november 2026)

We nemen alleen gedrag en maten over, nooit code, teksten, logo of foto's.

## Hoofdnavigatie
**Over ons · Projecten · Media · Blog · Contact**. Elke link opent een eigen pagina. De homepage is één lange scrollpagina met de bekende secties. Het menu over het hele scherm heeft submenu's (Media → Boeken / Magazines / Videos) en socials.

## Contact (`/contact/`), opbouw `s-header-text` + `s-text`
- **Kop:** een foto van volle schermhoogte (100vh) met een zwarte ondergrond, de foto op opacity 0,6, licht parallax.
  - Tekst links, verticaal gecentreerd: links 8,33%, maximaal 50% breed, wit.
  - Eerst klein (kapitalen) "Contact", dan een h2 `f-heading-m` als uitnodigende vraag.
  - De badge staat op left 75%, bottom −4vw.
- **Daarna een tekstsectie** (`s-text`, marge 10,41vw boven, 6,94vw onder) met kopjes:
  - Afspraak (uitleg + uitnodiging);
  - naam, adres, telefoon, e-mail;
  - Parkeren;
  - Openbaar vervoer.
- **Achtergrondlaag:** wit (`c-color` #FFFFFF).

## Media-overzicht (`/media/`), opbouw `s-media-overview` + `s-contact`
- **Intro:** marge 20,83vw boven, 10,41vw onder, links 8,33%, rechts 50%. Kleine kapitalen "Media" en een grote quote (`f-blockquote-m`).
- **Categorieën onder elkaar**, om en om rechts (`c-right`) en links (`c-left`):
  - per categorie een eigen kleur (`c-color` → de achtergrondlaag kleurt mee bij het in beeld komen);
  - een grote afbeelding of object, absoluut;
  - tekst verticaal gecentreerd: kop `f-heading-xl` ("Boeken"), alinea en pijl-link ("Bekijk boeken") naar de subpagina;
  - witte tekst op de categoriekleur. **Wij gebruiken inkt** (onze contrastregel).
- **Afsluiting:** het contactblok (één foto + "Zin om met ons te werken?" + "Neem contact op" → `/contact/`).

## Projecten (`/projecten/`), opbouw `s-projects` + `s-contact`
- **Een lijst projecten**, elk een link naar een detailpagina. Per project:
  - een eigen kleur (`c-color`);
  - een liggende foto, 58,33% breed, verhouding 33,33 : 58,33, met parallax binnenin (top −25%, hoogte 120%);
  - een kop `f-heading-m` eronder (marge-top 3,47vw);
  - erachter een **lopende tekst** met de projectnaam: opacity 0,2, top 19vw, eindeloos lineair in 30 s.
- **Ritme van 4:** de projecten verspringen in een patroon van vier.
  1. links 33,33%, rechts 8,33%;
  2. links 8,33%, rechts 33,33%;
  3. links 25%, rechts 16,66%;
  4. links 8,33%, rechts 33,33%.
- Tussen de projecten zit 10,41vw.
- **Afsluiting:** het contactblok.

## Over ons (`/over-ons/`)
1. **`s-header-about`:** 83,33vw hoog.
   - De foto staat midden in het scherm: left 33,33%, 33,33% breed, 50vw hoog, top 13,89vw.
   - Daaroverheen witte tekst: padding-top 27,78vw, marges 8,33% links en 16,66% rechts. Eerst klein "About", dan een grote kop.
   - De badge staat rechtsonder (right 12,5vw, bottom 12,5vw).
2. **`s-carousel`:** "001 — …", een carrousel met foto's van het kantoor plus een verhaal.
3. **`s-how-we-work`:** "002 — Hoe wij werken". Een foto-achtergrond met witte tekst, links een verticaal menu met 4 stappen (opacity 0,4, actief 1 met een streepje ervoor), per stap een kop (`f-heading-xl`) en een alinea.
4. **`s-marquee`:** een grote lopende regel.
5. **`s-videos-slider`:** "003 — Wat we het meest waarderen", waarden met uitleg.
6. **`s-team`:** "004 — Ons team".
7. **`s-testimonial-slider`:** reviews. **Bij ons niet:** er zijn geen echte reviews.
8. **`s-partners`:** "005 — Partners".
9. **`s-contact`:** "006 — Contacteer ons".
