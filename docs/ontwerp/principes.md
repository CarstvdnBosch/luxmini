# UX- en UI-principes LUX mini

Dit zijn de afspraken van de UX/UI-ontwerper (`website-ontwerper`). De ontwerpgate toetst hierop, naast de ontwerpregels in `CLAUDE.md`. De stijl van stockdutchdesign.com is het uitgangspunt. Als die stijl botst met duidelijkheid of leesbaarheid voor onze bezoekers, gaat duidelijkheid voor.

## Voor wie
Jonge ouders en (groot)ouders, vrienden en collega's die een persoonlijk kraamcadeau zoeken. Ze zijn vaak op hun telefoon, oriënteren zich rustig en willen snel weten:
1. wat ze kunnen laten maken;
2. wat het kost;
3. hoe ze Carien bereiken.

## Principes
1. **Eén scherm, één boodschap.** Elk scherm heeft één hoofdpunt en een duidelijke volgende stap (pijl-link of contact).
2. **Contact is nooit ver weg.** Elke pagina heeft binnen één klik een pijl-link naar het contactformulier (besluit Carst, 5 nov. 2026). WhatsApp, telefoon en mail staan in het menu, in de footer en op de contactpagina.
3. **Laten zien, niet vertellen.** Het portfolio en de thema's tonen foto's, ook op touch. Wat op desktop bij aanwijzen verschijnt, moet op mobiel zonder aanwijzen zichtbaar zijn.
4. **Leesbaar boven sfeer:**
   - lopende tekst is minimaal 16 px (op mobiel ook);
   - regellengte is 45–75 tekens;
   - kleine tekst heeft een contrast van minimaal 4,5:1 (WCAG AA): op terracotta `#BC8565` dus inkt (5,2:1), geen wit;
   - wit alleen voor grote tekst (vanaf 24 px, of vanaf 19 px vet, gewicht 700), op terracotta `#BC8565` (3,1:1) of op de diepe portfoliotinten bij aanwijzen: oker `#BC8B47` (3,03:1), salie `#839C75` (3,01:1), olijf `#999575` (3,04:1), perzik `#C88654` (3,00:1), mauve `#AE8C94` (3,01:1);
   - nooit wit op de lichte paletkleuren (perzik `#DEB799`, oker `#C89F67`, salie `#C3CFBC`, mauve `#B5969E`, olijf `#B4B19A`, grijsblauw `#E0E6E7`); daarop is tekst inkt.
5. **Witruimte met bedoeling.** Er staat geen scherm vol niets. Tussen secties zit vast ritme: 96–160 px op desktop, 56–96 px op mobiel.
6. **Beweging ondersteunt.** Beweging leidt nooit af van de inhoud. Zonder beweging (minder beweging, toetsenbord) is alles bereikbaar en leesbaar.
7. **Echte beelden, scherp en warm.** We gebruiken alleen echte producten van Carien. Beelden worden nooit verder vergroot dan hun ware grootte. Waar nog geen goede foto is, staat dat in `docs/fotolijst.md`.
8. **Eerlijk en warm.** We verzinnen geen reviews of claims. We schrijven korte zinnen, met "je".

## Mobiel (besluit Carst 5 nov. 2026: extra toets op mobiel ontwerp)
De meeste bezoekers komen op hun telefoon, vaak met Safari op een iPhone. Daarom gelden op mobiel deze regels. Regels 1 tot en met 7 en regel 9 worden automatisch getoetst in `tests/e2e/mobiel-ontwerp.spec.js`, op Chromium (390 × 844) en op WebKit/Safari (iPhone, 390 × 664). Regel 10 controleert `scripts/controleer.py`. Regel 8 (regellengte) beoordeelt de ontwerpgate; op een telefoon is een regel van nature korter. De ontwerpgate kijkt bovendien naar alle tien regels.
1. **Tikdoelen minimaal 44 px.** Elke link, knop, tab en elk veld is minstens 44 px hoog. Alleen een link midden in een zin mag kleiner.
2. **Lopende tekst minimaal 16 px**, ook kleine regels zoals de privacyzin onder het formulier. Ook alles wat je aantikt of moet lezen om iets te bedienen is minimaal 16 px: links, pijl-links, knoppen, tabjes, formulierlabels, de links in het menu en in de footer (brief 7 nov. 2026). Uitzondering: alleen decoratieve labels die geen link of bedieningselement zijn, zoals de sectielabels "001 —" (`.label`) en `.caps`-regels zoals "Carien Geurts —"; die mogen kleiner zijn dan 16 px, maar minimaal 13 px, en dan met een letterafstand van minimaal 0,1em. Een link midden in een zin heeft de grootte van die zin (de maillink in de privacyverklaring).
3. **Formuliervelden minimaal 16 px.** Anders zoomt Safari in zodra je een veld aantikt.
4. **Inzoomen nooit blokkeren.** Geen `user-scalable=no` of `maximum-scale=1`.
5. **Niets steekt buiten het scherm.** Er is geen horizontaal scrollen; alleen bewust veegbare rijen mogen breder zijn.
6. **Foto's nooit groter dan het bestand**, ook niet op een smal scherm.
7. **Contact binnen één tik.** Elke pagina heeft een pijl-link naar het contactformulier. De enige uitzondering is de bedankpagina, die je pas ziet nadat je het formulier hebt verstuurd. In het menu staan WhatsApp, telefoon en mail zonder scrollen in beeld.
8. **Regels hooguit ca. 75 tekens.**
9. **De vaste balk bedekt nooit een kop.** Na een ankerlink staat de kop onder de balk.
10. **Foto boven, tekst eronder.** Elk productblok of elke productkolom heeft één duidelijke volgende stap. Een scherm is nooit leeg.

## Schermen waarop we toetsen
Desktop 1440 × 900, tablet 768 × 1024, mobiel 390 × 844, en iPhone met Safari (WebKit, 390 × 664, met de balken van Safari). Maak de afdrukken met `python3 scripts/schermafdrukken.py`.
