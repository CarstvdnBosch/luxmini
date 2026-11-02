# Analyse stockdutchdesign.com — gedrag en maten (2 november 2026)

Gemeten in de browser en uit het gedrag van hun eigen script (GSAP-tijdlijnen). We nemen **gedrag en maten** over, nooit hun code, teksten, logo of foto's.

## 1. Intro bij het eerste bezoek (`a-intro`)
- **Opbouw:** vast scherm (z-index 50) met een effen vlak (oudroze/mauve). Daarop:
  - het logo in het midden (33% breed);
  - een staande figuur in het midden: 25% breed, verhouding ongeveer 25 : 35;
  - twee regels grote serif-tekst in maskers.
- **Tijdlijn** (Power3, in seconden):
  - 0,5–1,5: het logo vervaagt in.
  - 1,5: een gekleurd vlak in de figuur schuift van onder (yPercent 100 → 0) in 1,5 s.
  - 2,0: masker (101 → 0) en foto (−80 → 0) schuiven tegen elkaar in, in 1,5 s.
  - 2,0: de tekstregels komen omhoog uit hun masker, 0,2 s na elkaar.
  - ±3,5: uitgang.
    - Het logo verdwijnt.
    - De tekstregels schuiven één schermhoogte omhoog, 2 s, 0,1 s na elkaar.
    - De figuur gaat omhoog uit beeld (2 s, vanaf 0,3).
    - De pagina schuift van y 150 px naar 0 (2 s, vanaf 0,4).
    - Het achtergrondvlak schuift naar boven weg (yPercent −100, 2 s, vanaf 0,4).
  - Totaal ongeveer 5,5 s.
- **Daarna de hero:**
  - De letters van de kop komen per letter op: y 25 → 0, opacity 0 → 1, 1 s, 0,05 s na elkaar, 1 s vertraging.
  - De onderregel komt per letter van x 10 → 0.

## 2. Hero-collage (`s-collage`)
- **Posities in vh/vw**, elke foto met `translateY(-50%)`:
  - Links:
    - foto 1: top 31vh, left 11vw, 23,5% breed, verhouding 33/23,5;
    - foto 2: top 50vh, left 2vw, 14,5% breed, 22/14,5;
    - foto 3: top 70vh, left 10vw, 12% breed, 16/12.
  - Rechts:
    - foto 1: top 13vh, right 24vw, 16,66% breed, 26/16,66;
    - foto 2: top 31vh, right 18vw;
    - foto 3: top 55vh, right 23vw.
  - De kop staat op top 50%, left 33,33%, 50% breed.
  - De dunne cirkel staat op top 41vh, left 28vw, 26% breed.
- **Wisselen gebeurt samen, niet per foto:**
  - Het scherm is in twee helften verdeeld.
  - Muis op de linkerhelft: vier van de zes foto's (1, 3, 4 en 6) tonen tegelijk beeld A (crossfade 0,2 s) en de achtergrond van collage, uitgelicht en kernwaarden gaat in 0,75 s naar kleur A.
  - Rechterhelft: beeld B en kleur B, tegelijk.
- **Meebewegen met de muis:**
  - De foto's verschuiven met verschillende factoren (1/20, 1/15, 1/10 van de muispositie, deels tegengesteld).
  - Ze kantelen in 3D: rotationY/X 25 × (muis − 0,5), perspectief 500–1500.
  - De cirkel beweegt mee.

## 3. Uitgelicht (`s-update`)
- **Lopende tekst:** loopt constant door, onafhankelijk van het scrollen. Lineair, één halve breedte in **15 s**, eindeloos herhaald.
- **Foto:**
  - 25vw breed, 33,33vw hoog, absoluut;
  - geplaatst op x = 16,667vw, y = 5,9vw, dus duidelijk naar binnen en niet tegen de rand;
  - beweegt licht horizontaal mee als de muis over de lopende tekst gaat (0,05 × muis).
- **Tekstblok:** 25vw breed, begint op 50vw.

## 4. Portfoliolijst (`s-portfolio-list`)
- **Inhoud:** 5 categorieën met een sfeernaam, geen productnaam: "Warm en kleurrijk", "Art Nouveau", "Southern delight", "Rustig maar kleurrijk", "Levendige karakter". Elke categorie heeft een eigen kleur.
- **Bij aanwijzen** (alles in 0,75 s, tegelijk):
  - de achtergrondlaag gaat naar de categoriekleur;
  - **alle tekst wordt wit**, het label ook;
  - de knop eronder vervaagt;
  - de andere namen gaan naar opacity 0,2;
  - twee foto's verschijnen.
- **Bij weggaan:** wit, zwarte tekst.
- **Foto's:**
  - groot: top −3vw, left 25vw, 30% breed, verhouding 41,66/30;
  - klein: top 17vw, left 58vw, 15% breed, 20/15;
  - beide met 20% zwart over de foto;
  - verticaal meebewegen met de muis (groot y/2,5, klein y/5, binnenkant y/15 en y/30).

## 5. Media-slider (`s-media-slider`), voor ons Personaliseren
- **Opbouw:**
  - het label linksboven;
  - links een tekstblok (16,66% vanaf links, 25% breed, verticaal gecentreerd) met grote kop, alinea en pijl-link;
  - rechts een grote foto, het beeldvlak 50vw hoog;
  - onderaan, in het midden, tabbladen in kleine kapitalen met een onderstreping bij het actieve tabblad.
- **Bij klikken op een tabblad:**
  - de achtergrondlaag gaat in 0,75 s naar de tabbladkleur;
  - de oude foto gaat naar xPercent −150 (1,5 s, easeInOut);
  - de nieuwe foto komt van rotation 90 / xPercent 150 naar 0 / 0 (1,5 s, easeInOut);
  - de oude tekst gaat per regel omhoog weg (y −50, opacity 0, 1 s, 0,1 s na elkaar);
  - de nieuwe tekst komt per regel binnen (y 50 → 0, 1 s, vanaf 1 s, 0,1 s na elkaar).
- **Wisselen gebeurt op klik**, niet bij aanwijzen.

## 6. Instagram (`s-instagram`) en Contact (`s-contact`)
- **Instagram:**
  - het label staat in de flow, met daaronder ruimte;
  - **één grote staande foto** links (van 16,66% tot 50%, verhouding ongeveer 2:3);
  - rechts verticaal gecentreerd (58,33% tot 83,33%): grote kop over drie regels ("Volg … op Instagram"), alinea en pijl-link.
- **Contact:**
  - gespiegeld: tekst links (16,66% tot 41,66%) met grote kop, alinea en pijl-link;
  - **één vierkante foto** rechts (van 50% tot 83,33%).
