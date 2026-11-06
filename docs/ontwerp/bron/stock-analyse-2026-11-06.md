# Analyse stockdutchdesign.com — aanvulling (6 november 2026)

Gemeten in de browser op 1440 × 900 en uit hun eigen script. Aanvulling op `stock-analyse-2026-11-02.md`; waar dit document afwijkt, geldt dit document. We nemen **gedrag en maten** over, nooit hun code, teksten, logo of foto's.

## 1. Hero-collage: correctie van de posities

**Correctie op de analyse van 2 november:** de foto's hangen met hun **bovenrand** aan de top-waarde. Er is geen `translateY(-50%)`. In rust staan ze recht: geen kanteling, alleen een kleine verschuiving door de muis.

**Maten** (breedte en hoogte in vw, zodat de verhouding vast is):

| Foto | top | horizontaal | breedte | hoogte |
|---|---|---|---|---|
| links 1 (groot) | 31vh | left 11vw | 23,5vw | 33vw |
| links 2 | 50vh | left 2vw | 14,5vw | 22vw |
| links 3 | 70vh | left 10vw | 12vw | 16vw |
| rechts 1 | 13vh | right 24vw | 16,66vw | 26vw |
| rechts 2 | 31vh | right 18vw | 14,5vw | 22vw |
| rechts 3 | 55vh | right 23vw | 12vw | 16vw |

**Stapeling:**
- Links 2 ligt over links 1 heen (links onder), en links 3 ligt over beide heen.
- Rechts 2 en rechts 3 overlappen rechts 1 net zo.

**Overige onderdelen:**
- **Kop:** links 33,33vw, 50vw breed. De kop schuift bij scrollen omhoog (parallax).
- **Cirkel en badge:** ongeveer 10vw groot, rechtsonder in de collage. De badge draait langzaam.
- **Hoogte:** de collage is 100vh. Daaronder staat de quote (50vw breed, gecentreerd) met een pijl-link.

**Muis:**
- De foto's verschuiven tegengesteld per kant.
  - Links naar linksboven.
  - Rechts naar rechtsonder.
- Factoren 1/20, 1/15 en 1/10.
- Grootste uitslag ongeveer 37 × 51 px op 1440 px.
- De 3D-kanteling bij bewegen is beperkt.

## 2. Kernwaarden-drieluik (`s-core-values`)

**Opbouw:**
- Eén scherm hoog (100vh) met drie gelijke kolommen van 33,33vw.
- Label "001 — …" linksboven op 1/12 (120 px).
- **Per kolom:**
  - een tekstblok op 1/12 vanaf de kolomrand, 1/6 breed (240 px), verticaal gecentreerd;
  - een klein volgnummer in serif ("01");
  - een kop in serif van 50 px over 2–3 regels;
  - een korte alinea van 15 px.

**Scheidingslijn:**
- 1 px wit, alleen tussen de kolommen.
- Verticaal gecentreerd, 18vw hoog (259 px), dus niet over de volle hoogte.

**Achtergrond:** de sectie staat op de achtergrondlaag. Elke kolom heeft een eigen `data-color`: perzik, oker, mauve.

**Bij aanwijzen van een kolom:**
- de laag kleurt naar de kolomkleur;
- in die kolom schuift een foto van boven in beeld (masker −101% → 0, foto met zoom 1,3 → 1);
- de tekst wordt wit over de foto;
- het logo wordt wit (eerste kolom) of de burger wordt wit (derde kolom).

## 3. Projectenlijst (`s-portfolio-list`), voor onze technieken

Dit patroon is al beschreven in de analyse van 2 november, §4, en wij gebruiken het op Inspiratie (`.hoverlijst`).

**Opbouw:**
- Label "002 — …".
- Vijf grote namen in serif van 110 px, gecentreerd, regelafstand 130 px.
- Onderaan één pijl-link.

**Bij aanwijzen:**
- de laag kleurt naar de categoriekleur;
- alle tekst wordt wit;
- de andere namen vervagen ("vage woorden erachter");
- twee foto's verschijnen achter de naam (groot en klein).

## 4. Getuigenis-slider (`s-testimonial-slider`), voor ons Inspiratie-blok

**Opbouw:**
- Eén scherm hoog, met de foto over de volle breedte en hoogte (100vw × 100vh).
- **Quote:**
  - in wit, serif 65 px, regelafstand 75 px;
  - links op 16,67vw, 66,67vw breed, verticaal ongeveer in het midden;
  - daaronder een naamregel (16 px) en een pijl-link.
- Linksonder bolletjes op 1/12, rechtsonder pijlen.

**Wij nemen één foto met één tekst**, zonder slider, zoals Carst vraagt ("een grote afbeelding met een tekst"). Wit op een foto mag alleen met een donkere sluier (uitzondering "tekst op een donkere foto").

## 5. Navigatie in de kop

**Tot 100 px scrollen:**
- de vijf links staan op één regel links van de burger;
- 0,9vw, vet, kapitalen, spatiëring 0,27vw;
- onderstreping 2 px die van links naar rechts groeit (0,4 s).

**Na 100 px scrollen:**
- de links vervagen één voor één (y 0 → 5 px, opacity → 0, 0,5 s, 0,1 s na elkaar);
- de burger schuift 5,5vw naar rechts (1 s, Power3.out).

**Terug boven 100 px:** de links komen in dezelfde volgorde terug.

**Wat Carst ziet** ("bij aanwijzen van het hamburgermenu verschijnen de links"): in hun kop staan de links direct naast de burger. Bij ons staan ze onder 1280 px nergens, en boven 1280 px los van de burger.

**Afspraak voor ons:** op een scherm met muis verschijnen de links naast de burger zodra je de burger of de linkrij aanwijst, of erheen tabt. Ze komen op dezelfde manier binnen: één voor één, y 5 → 0, 0,5 s, 0,1 s na elkaar. Bovenaan de pagina staan ze er al (vanaf 1280 px). Ze verdwijnen weer na het verlaten.

**Klik op de burger:** het menu over het hele scherm, zoals nu.

## 6. Pagina-overgang (Highway + GSAP)

**Weg (1 s, Power3.easeInOut, ongeveer `cubic-bezier(.65,0,.35,1)`):**
- een gekleurd vlak schuift **van boven naar beneden** over de pagina (yPercent −100 → 0);
- een binnenmasker schuift tegengesteld (80 → 0);
- de oude pagina zakt 150 px.

**Binnen (1 s, dezelfde curve):**
- de nieuwe pagina komt van −150 px naar 0;
- het vlak schuift verder naar beneden uit beeld (0 → 100);
- het masker gaat −80.

**Kleur:** een willekeurige gedempte tint uit acht kleuren.

**Bij ons nu:** terracotta vlak van onder naar boven, 0,6 s, zonder verschuiving van de pagina. Dat voelt korter en harder.
