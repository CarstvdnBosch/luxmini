# UX- en UI-principes LUX mini

Dit zijn de afspraken van de UX/UI-ontwerper (`website-ontwerper`). De ontwerpgate toetst hierop, naast de ontwerpregels in `CLAUDE.md`. De stijl van stockdutchdesign.com is het uitgangspunt. Als die stijl botst met duidelijkheid of leesbaarheid voor onze bezoekers, gaat duidelijkheid voor.

## Voor wie
Jonge ouders en (groot)ouders, vrienden en collega's die een persoonlijk kraamcadeau zoeken. Ze zijn vaak op hun telefoon, oriënteren zich rustig en willen snel weten:
1. wat ze kunnen laten maken;
2. wat het kost;
3. hoe ze Carien bereiken.

## Principes
1. **Eén scherm, één boodschap.** Elk scherm heeft één hoofdpunt en een duidelijke volgende stap (pijl-link of contact).
2. **Contact is nooit ver weg.** WhatsApp is het belangrijkste kanaal. Het staat bovenaan elke pagina en in het menu, en het is altijd binnen één klik te bereiken.
3. **Laten zien, niet vertellen.** Het portfolio en de thema's tonen foto's, ook op touch. Wat op desktop bij aanwijzen verschijnt, moet op mobiel zonder aanwijzen zichtbaar zijn.
4. **Leesbaar boven sfeer:**
   - lopende tekst is minimaal 16 px (op mobiel ook);
   - regellengte is 45–75 tekens;
   - kleine tekst heeft een contrast van minimaal 4,5:1 (WCAG AA): op terracotta `#BC8565` dus inkt (5,2:1), geen wit;
   - wit alleen voor grote tekst (vanaf 24 px, of vanaf 19 px vet), op terracotta `#BC8565` (3,1:1) of op de diepe portfoliotinten bij aanwijzen: oker `#BC8B47` (3,03:1), salie `#839C75` (3,01:1), olijf `#999575` (3,04:1), perzik `#C88654` (3,00:1), mauve `#AE8C94` (3,01:1);
   - nooit wit op de lichte paletkleuren (perzik `#DEB799`, oker `#C89F67`, salie `#C3CFBC`, mauve `#B5969E`, olijf `#B4B19A`, grijsblauw `#E0E6E7`); daarop is tekst inkt.
5. **Witruimte met bedoeling.** Er staat geen scherm vol niets. Tussen secties zit vast ritme: 96–160 px op desktop, 56–96 px op mobiel.
6. **Beweging ondersteunt.** Beweging leidt nooit af van de inhoud. Zonder beweging (minder beweging, toetsenbord) is alles bereikbaar en leesbaar.
7. **Echte beelden, scherp en warm.** We gebruiken alleen echte producten van Carien. Beelden worden nooit verder vergroot dan hun ware grootte. Waar nog geen goede foto is, staat dat in `docs/fotolijst.md`.
8. **Eerlijk en warm.** We verzinnen geen reviews of claims. We schrijven korte zinnen, met "je".

## Schermen waarop we toetsen
Desktop 1440 × 900, tablet 768 × 1024, mobiel 390 × 844. Maak de afdrukken met `python3 scripts/schermafdrukken.py`.
