# Stock-pariteit: intro, hero-sets, uitgelicht, portfolio, personaliseren, Instagram en contact

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst
- **Risico:** hoog — grote zichtbare wijziging op de homepage en een intro bij elk eerste bezoek. Ook verandert de kleurregel voor witte tekst in de hele bovenkant. Formulier-Worker, `_redirects`, `wrangler.jsonc` en `.github/workflows/` blijven onaangeroerd. Het contactblok rond het formulier wordt wel anders opgebouwd.

## Doel
De homepage moet aanvoelen als stockdutchdesign.com: een rustige intro, foto's die per schermhelft samen wisselen, een portfolio dat draait om gevoel in plaats van om producten, en een overgang bij personaliseren zoals Stocks media-slider. Daarbij moet alle tekst goed leesbaar blijven, dus nooit wit op de lichte hoverkleuren.

Bron van Carsts wens (2 nov 2026), zes punten:
1. een vloeiende intro zoals bij Stock;
2. de hero-foto's wisselen samen per schermhelft en staan meer naar het midden en lager;
3. Uitgelicht: de foto meer in het midden en een snellere, constante lopende tekst;
4. een portfolio rond emotie, maximaal 5 items, foto's op de posities van Stock en een kleurwissel bij aanwijzen;
5. Personaliseren met een klikovergang zoals de media-slider van Stock;
6. Instagram en Contact met elk één foto.

Metingen: `docs/ontwerp/bron/stock-analyse-2026-11-02.md`.

## Besluiten
1. **Intro duurt ongeveer 3 s** in plaats van ongeveer 1,6 s. De reden van de ontwerper: alle vijf de momenten van Stock blijven herkenbaar, na ongeveer 2,3 s zie je de pagina al, en de intro komt maar één keer per sessie. Dit **vervangt acceptatiecriterium 1** van `2026-11-01-interactie-zoals-stock.md`.
2. **Witte tekst staat alleen op terracotta, nooit op de hoverkleuren** (perzik, oker, salie, mauve, olijf). Daarmee worden ook twee bestaande fouten opgelost:
   - de rechterhelft van de hero, die nu naar olijf kleurt met een witte kop;
   - de werkwijze-kolommen, die nu naar perzik, oker en mauve kleuren met witte koppen.
3. **De ontwerpregels in `CLAUDE.md` gaan in deze wijziging mee:**
   - **Hero:** de tegels draaien niet meer los om. De set wisselt per schermhelft, en op touch en met het toetsenbord via de tabjes "Het atelier · Het cadeau".
   - **Intro:** komt één keer per sessie en duurt ongeveer 3 s. Je kunt hem overslaan, met een noodrem na 4,0 s. Er is geen intro bij "minder beweging" of zonder JavaScript.
   - **Witte tekst:** alleen op terracotta (koppen en quotes vanaf 24 px). Op alle andere paletkleuren wordt de tekst inkt en wisselt het logo naar de donkere versie.
4. **Nieuwe taglines en teksten zijn tijdelijk** en wachten op akkoord van Carien. Dat houdt deze wijziging niet tegen, omdat de site nog niet op luxmini.nl staat. Ze gaan later door de goedkeuringsronde. Zet bij elk tijdelijk item in de HTML de opmerking `<!-- LET OP: wacht op akkoord Carien -->`. Dat zijn alle items onder "Voor Carien ter goedkeuring", punten 1 tot en met 6.
5. **Portfolio: witte tekst bij aanwijzen (ronde 3, wens Carst: "hoover over moet witte tekst geven").** Dit vervangt de keuze "de actieve naam blijft inkt" (ontwerprichting punt 4 en criterium 11). De laag kleurt bij aanwijzen naar een diepe tint, de lichtste waarop wit 3:1 haalt: oker `#BC8B47`, salie `#839C75`, olijf `#999575`, perzik `#C88654`, mauve `#AE8C94`. Alle portfoliotekst wordt wit (actieve naam 1, andere namen 0,35, label en pijl-link 0,35, productregel 19 px vet in kapitalen), de foto's krijgen 20% inkt, balk en logo worden wit. De kaarten op touch krijgen dezelfde diepe tint met witte tekst. Elders blijft het lichte palet.
6. **Rustigere kleurwissels (ronde 3, wens Carst).** De wissel per schermhelft voelde te snel. Bovenkant (achtergrond, tekst en logo) nu 1,2 s, fotowissel tussen set A en B 0,6 s (was 0,2 s), portfolio 1 s, allemaal in-uit `cubic-bezier(.45,0,.55,1)`. Dit vervangt de 0,75 s en 0,2 s uit de ontwerprichting voor deze wissels; de laag bij scrollen en bij de tabbladen blijft 0,75 s.

## Acceptatiecriteria
1. Alle 24 ontwerpcriteria hieronder (sectie "Ontwerpcriteria (toetsbaar)") worden gehaald.
2. De regels in `CLAUDE.md` zijn bijgewerkt volgens besluit 3 (hero, intro en witte tekst). Er staat geen tekst meer in die zegt dat de tegels omdraaien bij aanwijzen of met een tik.
3. Elk tijdelijk tekstitem (sfeernamen, productregels, hero-tabjes, alinea bij Instagram, inleiding bij het formulier, uitleg per techniek) staat in `public/index.html` met de HTML-opmerking `<!-- LET OP: wacht op akkoord Carien -->` ervoor.
4. `scripts/controleer.py` is bijgewerkt:
   - de oude omdraaitest (`.tegel.t2` krijgt `.om`) is vervangen door een **setwisseltest**. Op desktop: muis op de rechterhelft zet t2, t3, t4 en t6 op set B, en t1 en t5 blijven gelijk. Op mobiel: een tik op "Het cadeau" doet hetzelfde en zet `aria-pressed` goed;
   - de woordenlijsttest is vervangen door een **tabbladtest**. Een klik op het tweede tabblad in Personaliseren zet `aria-selected="true"` op dat tabblad en toont na maximaal 1,5 s de bijbehorende foto en kop. Aanwijzen alleen wisselt niets;
   - er is een controle dat het portfolio **precies 5 items** telt in de hoverlijst én in de kaarten, en dat die met elkaar overeenkomen;
   - de bestaande controles blijven werken en slagen: de contactlaag (`controleer_contact`), de prijstabel (`controleer_prijstabel`), de stappen (`controleer_stappen`) en geen horizontaal scrollen op 1440, 768 en 390 px;
   - de intro wordt in de controle nog steeds overgeslagen via `sessionStorage` (`lux-intro-gezien`).
5. `npm test` en `python3 scripts/controleer.py` geven geen fouten.

## Ontwerprichting

Geleverd door website-ontwerper (`/home/claude/ontwerprichting-stock.md`), letterlijk overgenomen.

**Algemene kleurregel (geldt voor alle punten).** Wit staat alleen op terracotta `#BC8565`. Krijgt een vlak een andere kleur uit het palet, dan wordt alle tekst, lijn en badge daarop inkt, en wisselt het logo naar `logo-luxmini-donker.png`. De wissel duurt 0,75 s, net als de achtergrond. Dit geldt voor de hele bovenkant (`.hero-kleur`: header, collage, uitgelicht en werkwijze), ook voor de lopende tekst en de koppen in de werkwijze. Een praktische aanpak is één klasse op `html` die `--op-kleur` naar inkt zet. Zonder JavaScript blijft alles terracotta met witte koppen. Bij 'minder beweging' wisselen sets en kleuren direct, zonder overgang (zie criterium 22); de kleurregel geldt dan gewoon.

### 1. Intro bij het eerste bezoek

- **Opbouw.** Een vast scherm in terracotta, zodat er geen kleurflits is naar de hero. Daarop drie dingen:
  - het witte logo, gecentreerd, maximaal 200 px breed (het PNG-bestand is 248 px, dus niet groter);
  - een staande figuur, gecentreerd, 25vw breed op desktop (360 × 504 px op 1440), verhouding 25 : 35;
  - twee regels tekst in Libre Caslon Display, wit, `clamp(40px, 4.4vw, 64px)`.
- **De figuur.** Er schuift een vlak in perzik `#DEB799` in, en daarop de foto `p-knuffel-naam.jpg` (knuffel met "Sem", 675 × 900). Die foto wordt hier niet vergroot.
- **Tekst.** Bestaande tekst van de oude site: "Ieder nieuw leven" / "is bijzonder".
  - Op desktop (vanaf 1025 px) staat regel 1 rechts uitgelijnd en eindigt 24 px links van de figuur, op 40% van de figuurhoogte. Regel 2 staat links uitgelijnd en begint 24 px rechts van de figuur, op 62% van de figuurhoogte. Er staat geen tekst op de foto.
  - Tot en met 1024 px staan beide regels gecentreerd onder de figuur.
  - Het logo staat 32 px boven de figuur.
- **Mobiel (390 px).** De figuur is 56vw breed (218 × 305 px) en staat in het midden. Het logo is 160 px breed. De tekstregels zijn 40 px groot en staan gecentreerd onder de figuur.
- **Tijdlijn (ease power3, of `cubic-bezier(.76,0,.24,1)` voor in-uit).** Het verloop van Stock, ingekort tot ongeveer 55%:

  | Tijd | Wat gebeurt er |
  |---|---|
  | 0,10–0,60 s | Het logo verschijnt (opacity 0 → 1). |
  | 0,35–1,25 s | Het perzik vlak schuift van onder in (100% → 0). |
  | 0,65–1,55 s | Masker (101% → 0) en foto (−80% → 0) schuiven tegen elkaar in. |
  | 0,75 s en 0,87 s | De tekstregels komen omhoog uit hun masker, elk 0,8 s. |
  | 1,67–1,90 s | Rust: het hele beeld staat stil. |
  | vanaf 1,90 s | Uitgang begint (zie hieronder). |

  - **Uitgang vanaf 1,90 s:**
    - het logo vervaagt in 0,3 s;
    - de tekstregels schuiven een schermhoogte omhoog in 1,0 s, 0,06 s na elkaar;
    - de figuur gaat omhoog uit beeld in 1,0 s, vanaf 2,00 s;
    - de pagina schuift van y 80 px naar 0 (op mobiel 48 px) in 1,0 s, vanaf 2,05 s;
    - het terracotta vlak schuift naar boven weg in 1,0 s, vanaf 2,05 s.
  - Rond **3,05 s** is de intro klaar. Rond 2,4 s komen de woorden van de hero-kop op (het bestaande woordmasker, 45 ms na elkaar).
- **Waarom 3 seconden.** Alle vijf de momenten van Stock blijven herkenbaar: logo, vlak, foto, tekst en het doek dat optrekt. Na ongeveer 2,3 s is het doek half weg en zie je de header en de hero al. 5,5 s is te lang voor iemand die op de telefoon snel iets zoekt, en voor wie via een gedeelde link binnenkomt. De intro verschijnt één keer per sessie, dus het kost een bezoeker hooguit één keer 3 s.
- **Overslaan.** Tikken, klikken, een toets (ook Tab), scrollen of vegen start meteen de uitgang, die dan in 0,6 s klaar is. De intro wacht niet op het laden van de hele pagina (`load`) en begint direct.
  - De introfoto staat als `preload`. Is die na 0,6 s niet geladen, dan blijft alleen het perzik vlak staan en loopt de tijdlijn gewoon door.
  - Een noodrem in CSS haalt de intro na 4,0 s altijd weg.
  - Er komt geen intro bij een herhaald bezoek in dezelfde sessie, na een pagina-overgang, bij "minder beweging" of zonder JavaScript.
  - Het scherm krijgt `aria-hidden`. De focus wordt niet vastgehouden: na de eerste Tab gaat de intro weg en komt de link "Naar de inhoud" in beeld.

### 2. Hero: foto's wisselen samen, per schermhelft

- **Twee sets in plaats van omdraaien per foto.** Het omdraaien per tegel (`rotateY`, `.om`, en de zes tabstops met `role="button"`) verdwijnt. Net als bij Stock wisselen vier tegels tegelijk van beeld en blijven er twee staan:

  | Tegel | Set A "Het atelier" (terracotta, standaard) | Set B "Het cadeau" (salie `#C3CFBC`) |
  |---|---|---|
  | t1 (vast) | `ig-babynest.jpg` | (blijft) |
  | t2 (groot, links) | `over-naaimachine.jpg` | `p-swaddle-open-kleur.jpg` |
  | t3 | `pers-stoffen.jpg` | `p-bijtring-giraf-kleur.jpg` |
  | t4 | `pers-klaar.jpg` | `p-broekje-kleur.jpg` |
  | t5 (vast, rechts) | `over-carien.jpg` | (blijft) |
  | t6 (liggend) | `over-werkplek.jpg` | `p-shirtje-kleur.jpg` |

  - Op de foto's van set B staat de achtergrondkleur al in de foto, dus het salie vlak sluit daarop aan.
  - Alleen set A krijgt een `alt`-tekst. Set B is decoratief (`alt=""`).
- **Gedrag.**
  - Muis op de linkerhelft van het scherm: set A en terracotta, met witte kop. Muis op de rechterhelft: set B en salie, en dan wordt alle tekst inkt, plus het donkere logo (volgens de algemene kleurregel).
  - De foto's wisselen met een crossfade van 0,2 s, de achtergrond verloopt in 0,75 s.
  - Wie de bovenkant verlaat, gaat terug naar A en terracotta (bestaande regel).
  - Meebewegen met de muis blijft. Daarbij kantelen de foto's licht in 3D, maximaal ±8° (`perspective` 1000 px). De cirkel beweegt mee.
  - De `text-shadow` op de kop vervalt, omdat de kop niet meer op een foto staat (zie posities).
- **Touch, toetsenbord en zonder JS.** Onder de regel "Carien Geurts / Atelier Ospel" komt een rij van twee tabjes in kleine kapitalen, 14 px: **Het atelier · Het cadeau**. Het actieve tabje heeft een onderstreping van 1 px.
  - Gebruik knoppen met `aria-pressed`, elk minimaal 44 px hoog.
  - Op touch is de rij altijd zichtbaar. Met een muis is hij verborgen en verschijnt hij bij `:focus-visible`.
  - Een tik op een tegel wisselt ook de set. Er wisselt niets vanzelf.
  - Zonder JavaScript: set A, geen tabjes.
- **Posities op desktop en tablet** (in % van het hero-vak, maximaal 1440 px breed; `top` is de bovenrand). De hero is `100svh` hoog, minimaal 680 px en maximaal 1000 px. De groep schuift ongeveer 4% lager en t1 komt van de rand af:

  | Tegel | left | top | breedte | verhouding |
  |---|---|---|---|---|
  | t1 | 6% | 51% | 12,5% | 0,74 |
  | t2 | 14% | 31% | 21% | 0,71 |
  | t3 | 12% | 70% | 11% | 0,76 |
  | t4 | 63% | 20% | 14,5% | 0,6 |
  | t5 | 68% | 39% | 16,5% | 0,77 |
  | t6 | 65% | 71% | 12% | 1,22 |

  - **Kop:** `left` 37%, verticaal gecentreerd op 52%. Grootte `clamp(40px, 6.1vw, 88px)`, op tablet (761–1024 px) maximaal 6vw.
  - **Badge:** blijft rechtsonder.
- **Mobiel (tot en met 760 px).** De hero wordt 740 px hoog. De huidige bovenste rij (t1, t2, t3) blijft. Onder de kapitalen komt de wisselrij, en de onderste rij (t4, t5, t6) begint op minimaal 16 px onder de wisselrij (ongeveer `top` 66%).

### 3. Uitgelicht

- **Desktop (vanaf 1025 px).**
  - **Foto:** `hero-box-open.jpg` (de box met "Sem"), absoluut geplaatst op `left` 16,667vw, `top` 5,9vw, 25vw breed en 33,33vw hoog (360 × 480 px op 1440, uitgesneden uit 1400 × 1400). `object-position` 40% 50%, zodat het labeltje met "Sem" in beeld blijft.
  - **Lopende tekst:** loopt over de foto heen (hogere z-index). Het midden van de regel ligt op het midden van de foto, op ongeveer 22,6vw vanaf de bovenkant van het blok. Grootte `clamp(56px, 7.6vw, 110px)`, wit op terracotta.
  - **Tekstblok:** begint op `left` 50vw, is 25vw breed (maximaal 360 px) en staat 32 px onder de onderrand van de lopende regel. Inhoud: de kapitalen "Uitgelicht", de korte tekst en de pijl-link (inhoud ongewijzigd).
- **Lopende tekst.** De koppeling aan het scrollen vervalt. De tekst loopt lineair en eindeloos, één halve spoorbreedte in **15 s**.
  - De tekst pauzeert als het blok buiten beeld is.
  - Bij "minder beweging" staat de regel stil, beginnend met "— Ieder".
  - Optioneel: met de muis boven de lopende regel schuift de foto horizontaal mee, met 0,05 × de muispositie, maximaal ±36 px.
- **Tablet.** De foto wordt 36vw breed (`left` 10vw), het tekstblok begint op 54vw en is 38vw breed.
- **Mobiel.** De foto wordt 62vw breed en staat gecentreerd (`left` 19vw). De lopende tekst is 56 px groot, met het midden op het midden van de foto. Het tekstblok staat 32 px onder de foto, over de volle breedte binnen de rand.
- **Lege ruimte.** De ruimte tussen de quote "Hoe bijzonder…" en Uitgelicht is nu bijna een half scherm leeg (`d-index-01`). Die moet terug naar het vaste ritme: maximaal 160 px op desktop en maximaal 96 px op mobiel.

### 4. Portfolio: vijf sferen in plaats van producten

- **Inhoud.** Vijf items, met per item een sfeernaam, een kleur uit het palet, twee foto's en één productregel. Die productregel houden we bewust, omdat bezoekers volgens de principes eerst willen weten wat ze kunnen laten maken.

  | # | Sfeernaam (wacht op Carien) | Kleur | Grote foto | Kleine foto | Productregel |
  |---|---|---|---|---|---|
  | 1 | Welkom op de wereld | oker `#C89F67` | `p-swaddle-open-kleur.jpg` | `p-knuffel-naam.jpg` | Swaddle · knuffel met naam |
  | 2 | Helemaal van jou | salie `#C3CFBC` | `p-sjaaltje-kleur.jpg` | `pers-naam.jpg` | Sjaaltje · doos met naam |
  | 3 | Klaar voor het eerste uitje | olijf `#B4B19A` | `p-shirtje-roze-kleur-vierkant.jpg` | `ig-jasje-teddy.jpg` | Shirtje · omkeerbaar jasje |
  | 4 | Iets om vast te houden | perzik `#DEB799` | `p-bijtring-giraf-kleur.jpg` | `ig-speenkoord-paardje.jpg` | Bijtring · hanger |
  | 5 | Voor de allerkleinsten | mauve `#B5969E` | `p-bijtring-kleur.jpg` | `ig-babynest.jpg` | Bijtring met naam · babynest |

  - De kraamcadeaubox valt uit de lijst, want die heeft al Uitgelicht en een eigen pagina.
  - Elke grote foto is minstens 432 × 600 px en elke kleine minstens 216 × 288 px. Er wordt dus niets vergroot.
- **Posities op desktop** (in % van het sectievak, maximaal 1440 px breed; `top` ten opzichte van de bovenkant van de lijst):
  - **groot:** `left` 25%, `top` −3%, breedte min(30%, 440 px), verhouding 30 : 41,66;
  - **klein:** `left` 58%, `top` 17%, breedte min(15%, 220 px), verhouding 3 : 4;
  - **productregel:** onder de kleine foto, met 16 px tussenruimte, in kleine kapitalen van 14 px, inkt.
  - Er komt geen zwarte laag over de foto's. Die is bij Stock alleen nodig voor witte tekst.
  - Verticaal meebewegen met de muis: de grote foto maximaal ±40 px, de kleine ±20 px.
- **Aanwijzen of focus** (alles tegelijk in 0,75 s):
  - de achtergrondlaag gaat naar de kleur van het item;
  - de andere namen, het label en de pijl-link gaan naar opacity 0,2;
  - de foto's en de productregel verschijnen;
  - de actieve naam blijft **inkt**, dus niet wit (zie de contrasten bovenaan). *Vervangen in ronde 3: zie besluit 5 (witte tekst op een diepe tint).*
  - Wisselen tussen items: de foto's crossfaden in 0,35 s.
  - Weggaan, focus uit de lijst of Esc: terug naar wit, alles op opacity 1.
- **Typografie.** De namen staan in Libre Caslon Display, `clamp(30px, 5.2vw, 76px)`, elk op één regel, gecentreerd.
- **Touch en zonder JS: kaarten.** Het bestaande schuifpatroon met snap blijft, maar met vijf kaarten van min(78vw, 320 px) breed.
  - Elke kaart is een vlak in de kleur van het item, met 12 px binnenruimte en daarin de grote foto (4 : 5).
  - Daaronder komt de sfeernaam (Display, 24 px, inkt) met de productregel (Source Sans, 16 px, inkt).
  - Er verandert geen achtergrond tijdens het vegen, dus het is rustig en werkt ook zonder JS.
  - Zonder JavaScript staan de kaarten ook op desktop, en is de hoverlijst verborgen.

### 5. Personaliseren als media-slider

- **Desktop (vanaf 1025 px).** De sectie is minimaal `max(720px, 100svh)` en maximaal 1000 px hoog, en heeft `overflow: clip`.
  - **Label:** linksboven, op de rand.
  - **Tekstblok links:** begint op 16,66vw, is 25vw breed (320–380 px) en staat verticaal gecentreerd. Inhoud: h2 `.kop-l` met de naam van de techniek ("Borduren") in inkt, de uitleg (`.klein`, maximaal 360 px) en de pijl-link "Bespreek je idee" naar `#contact`.
  - **Beeld rechts:** begint op 50vw, verhouding 3 : 4, hoogte min(44vw, 100svh − 220 px). Op 1440 × 900 is dat ongeveer 476 × 634 px, verticaal gecentreerd.
  - **Tabbladen:** gecentreerd onderaan, 48 px boven de onderrand. Kleine kapitalen van 14 px, `letter-spacing` 0,32em, 48 px tussenruimte, elk minimaal 44 px hoog.
    - Het actieve tabblad krijgt een onderstreping van 1 px, 6 px onder de letters.
    - De inactieve tabbladen blijven **volle inkt**, geen lagere opacity: inkt op 75% haalt op oker maar 4,2:1, dus te weinig voor 14 px.
- **Foto's en kleuren:**
  - Borduren: `pers-sjaaltje-naam.jpg`, oker;
  - Belettering: `hero-box-dicht.jpg`, perzik. Dit blijft een tijdelijke foto tot er een echte foto van belettering op kleding is;
  - Siliconen: `p-bijtring-naam.jpg`, mauve. Deze vervangt `ig-speenkoord-paardje`, die 400 px breed is en vergroot zou worden.
  - Alle tekst is inkt (6,1 tot 8,8:1).
- **Klikken op een tabblad** (alleen bij klik, Enter of Spatie; niet bij aanwijzen of focus):
  - de achtergrondlaag gaat in 0,75 s naar de kleur van het tabblad;
  - de oude foto gaat naar `translateX(-150%)` in 1,2 s, met `cubic-bezier(.76,0,.24,1)`;
  - de nieuwe foto komt van `translateX(150%) rotate(90deg)` naar 0 / 0 in 1,2 s, met dezelfde ease en op hetzelfde moment;
  - de oude kop, tekst en pijl-link gaan per regel omhoog weg (y −40 px, opacity 0) in 0,5 s, 0,06 s na elkaar;
  - de nieuwe komen per regel binnen (y 40 px → 0) in 0,7 s, vanaf 0,5 s, 0,08 s na elkaar;
  - totaal ongeveer 1,4 s;
  - klik je tijdens een wissel opnieuw, dan springt de lopende wissel naar het eind en start de nieuwe. Er blijft nooit een leeg beeldvlak of een dubbele foto staan.
- **Toetsenbord.** Gebruik `role="tablist"`, `tab` en `tabpanel` met `aria-selected`. De pijltoetsen verplaatsen de focus, Enter en Spatie activeren (handmatige activering, vanwege de animatie van 1,4 s).
- **Tablet.** Het tekstblok begint op 8vw en is 38vw breed. Het beeld begint op 52vw en is 40vw breed. De tabbladen staan gecentreerd onderaan.
- **Mobiel.** De volgorde is: label, beeld (72vw breed, gecentreerd, 3 : 4, ongeveer 281 × 375 px), tabbladen, kop, tekst en pijl-link.
  - De tabbladen staan in drie gelijke kolommen, in kapitalen van 13 px met `letter-spacing` 0,12em, minimaal 44 px hoog, en lopen niet over op een tweede regel.
  - Het draaien blijft binnen de sectie (geen horizontaal scrollen).
- **Minder beweging.** Foto, tekst en kleur wisselen direct.
- **Zonder JavaScript.** De drie technieken staan onder elkaar, elk met tekst links en foto rechts. De tabbladen zijn verborgen.

### 6. Instagram en Contact: één foto met tekst

- **Instagram (op grijsblauw).**
  - Het label staat in de flow, met daaronder de ruimte van het ritme.
  - **Foto links:** begint op 16,66vw, is 33,33vw breed en maximaal 480 px. Foto: `ig-outfit-ladder.jpg` (480 × 640). We gebruiken verhouding **3 : 4 in plaats van 2 : 3**, omdat het bestand anders vergroot wordt. Komt het grotere origineel, dan wordt het 2 : 3.
  - De foto linkt naar Instagram. Bij aanwijzen schaalt de foto naar 1,04 binnen zijn kader.
  - **Tekst rechts:** van 58,33vw tot 83,33vw, verticaal gecentreerd. Inhoud: `.kop-l` over drie regels ("Volg het / atelier op / Instagram"), één korte alinea en de pijl-link "@luxmini2020".
  - Het raster van zes foto's verdwijnt.
  - **Mobiel:** de foto over de volle breedte binnen de rand (ongeveer 346 × 461 px), daaronder kop, alinea en pijl-link.
- **Contact (op terracotta), gespiegeld, in twee rijen.**
  - **Rij 1, één scherm zoals bij Stock:**
    - **Tekst links**, van 16,66vw tot 41,66vw:
      - kop `.kop-l`: "Zin om samen iets moois te maken?", wit, 60 px, drie regels;
      - daaronder de drie pijl-links onder elkaar, elk minimaal 44 px hoog: **WhatsApp Carien** (eerst), het telefoonnummer en het e-mailadres. Alles in inkt.
    - **Foto rechts:** vierkant, van 50vw tot 83,33vw (maximaal 480 px), verticaal gelijk met het tekstblok. Foto: `maatwerk-handwerk.jpg` (de handen van Carien met het LUX-label; vierkant uitgesneden uit 1200 × 900).
  - **Rij 2:** één regel inleiding in inkt, en daaronder het bestaande formulier. Het formulier loopt van 16,66vw tot 83,33vw (maximaal 960 px), in twee kolommen, met de velden en de knop zoals nu.
  - **Mobiel:** de volgorde is label, foto (3 : 2, over de volle breedte binnen de rand), kop (36 px), pijl-links, inleiding en formulier in één kolom.

## Ontwerpcriteria (toetsbaar)

**Intro**

1. Bij het eerste bezoek per sessie is de intro rond 3,05 s klaar (± 0,2 s). Na ongeveer 2,3 s is het terracotta vlak minstens half weg. De noodrem haalt de intro altijd weg vóór 4,0 s.
2. Een tik, klik, toets of scroll tijdens de intro laat die binnen 0,6 s verdwijnen. Er komt geen intro bij een herhaald bezoek in de sessie, na een pagina-overgang, bij "minder beweging" of zonder JavaScript.
3. In de intro staat geen witte tekst op de foto. De tekstregels zijn minimaal 40 px. De logo-afbeelding wordt niet groter getoond dan 248 px. Op 390 × 844 valt niets buiten beeld of over de rand.

**Hero**

4. Op 1440 × 900 wisselen met de muis op de linkerhelft tegelijk t2, t3, t4 en t6 naar set A en terracotta, en op de rechterhelft naar set B en salie. t1 en t5 veranderen niet. Er draait geen enkele tegel om.
5. In toestand B (salie) is alle tekst in de bovenkant inkt en staat het donkere logo in de header. Nergens in de site staat witte tekst op perzik, oker, salie, mauve of olijf. Dit geldt ook voor de werkwijze-kolommen en de lopende tekst.
6. Op 1440 × 900 begint de hoogste foto minimaal 128 px vanaf de bovenkant en eindigt de laagste minimaal 40 px boven de onderrand. De kop overlapt geen foto voor meer dan 24 px. Op 768 px overlapt de kop geen foto.
7. Op 390 × 844 staan na de intro de kop, de wisselrij "Het atelier · Het cadeau" en minstens vier tegels in het eerste scherm. Beide knoppen zijn minimaal 44 × 44 px en wisselen de set met één tik. Met Tab kom je in de hero op die twee knoppen, en niet meer op zes tegels.

**Uitgelicht**

8. De Uitgelicht-foto begint op 1440 px op 240 px (± 8 px) vanaf links en is 360 × 480 px. Op 390 px staat de foto gecentreerd (de marge links en rechts verschilt hooguit 8 px). De lopende regel loopt over het midden van de foto.
9. De lopende tekst beweegt even snel met en zonder scrollen: één halve spoorbreedte in 15 s (± 0,5 s). Bij "minder beweging" staat de tekst stil.
10. Tussen de quote "Hoe bijzonder…" en Uitgelicht zit op desktop maximaal 160 px en op mobiel maximaal 96 px lege ruimte.

**Portfolio**

11. Het portfolio telt precies vijf items, zowel in de lijst als in de kaarten. Bij aanwijzen of focus wordt binnen 0,75 s de achtergrond de kleur van het item, gaan de andere namen en de pijl-link naar opacity 0,2 en verschijnen de twee foto's en de productregel. De actieve naam blijft inkt.
12. Op 1440 px begint de grote portfoliofoto op 25% van het sectievak en de kleine op 58%, binnen ± 16 px. Geen enkele foto wordt groter getoond dan het bestand is.
13. Op touch en zonder JavaScript staan vijf kaarten, elk met kleurvlak, foto, sfeernaam (24 px) en productregel (16 px). Op 390 px kan de pagina niet horizontaal scrollen; alleen de kaartenrij scrollt.

**Personaliseren**

14. Een klik op een tabblad laat altijd zichtbaar de foto van rechts indraaien en de oude naar links wegschuiven. De kleur wisselt in 0,75 s. Na maximaal 1,5 s staan de juiste foto, kop en tekst stil. Vijf snelle klikken achter elkaar laten nooit een leeg of dubbel beeld achter.
15. Aanwijzen of focus wisselt het tabblad niet; alleen een klik, Enter of Spatie doet dat. De pijltoetsen verplaatsen de focus tussen de tabbladen en `aria-selected` klopt.
16. De tabbladen zijn minimaal 44 px hoog, in volle inkt (minstens 4,5:1 op oker, perzik en mauve), en het actieve tabblad is onderstreept. Op 390 px staan ze op één regel, zonder afgebroken woorden.
17. Op 390 × 844 staan na het scrollen naar het label de foto, de tabbladen en de kop van de actieve techniek samen in één scherm. Tijdens het draaien scrollt de pagina niet horizontaal.

**Instagram en contact**

18. Instagram toont één foto met tekst ernaast op desktop (vanaf 1025 px) en eronder op mobiel. Het raster van zes foto's is weg. De foto wordt niet breder getoond dan 480 px.
19. Op 1440 × 900 staan na de klik op "Contact" de kop, de WhatsApp-link en de foto zonder scrollen in beeld, en begint het formulier binnen één schermhoogte.
20. Op 390 × 844 staat na het tikken op een link naar `#contact` de WhatsApp-link zonder verder scrollen in beeld. Het formulier staat in één kolom en alle velden zijn minimaal 44 px hoog.

**Algemeen**

21. Op 390, 768 en 1440 px is er nergens horizontaal scrollen, ook niet tijdens de intro, het draaien van de foto's in Personaliseren of het kantelen van de hero.
22. Bij "minder beweging" is er geen intro, kantelen of verschuiven. De sets, tabbladen en kleuren wisselen direct en alle inhoud is zichtbaar.
23. Zonder JavaScript is alle inhoud zichtbaar en bruikbaar: hero set A, Uitgelicht met de tekst stilstaand, het portfolio als kaarten, de drie technieken onder elkaar en het formulier.
24. Alle nieuwe secties hebben een `data-label`, de nummering 001–006 klopt en de balk toont het juiste label. Lopende tekst is overal minimaal 16 px en heeft overal een contrast van minimaal 4,5:1.

## Voor Carien ter goedkeuring

1. **De vijf sfeernamen in het portfolio** (taglines, geen beweringen):
   1. "Welkom op de wereld"
   2. "Helemaal van jou"
   3. "Klaar voor het eerste uitje"
   4. "Iets om vast te houden"
   5. "Voor de allerkleinsten" (bestaat al als tekst op de badge)
2. **De productregels per item**, zoals "Swaddle · knuffel met naam" en "Shirtje · omkeerbaar jasje". Carien moet bevestigen dat ze deze producten zo maakt en noemt.
3. **De tabjes in de hero:** "Het atelier" en "Het cadeau".
4. **De alinea bij Instagram** (nieuw), bijvoorbeeld: "Nieuwe stukjes uit het atelier, zo van de naaimachine."
5. **De inleiding bij het formulier** (nieuw), bijvoorbeeld: "Liever schrijven? Laat hier een bericht achter, Carien reageert persoonlijk."
6. **De uitleg per techniek in Personaliseren.** Die stond al open en is nu ook de tekst onder een grote kop.
7. **Het gebruik van "Ieder nieuw leven is bijzonder" in de intro.** De tekst komt van de oude site, dus formeel is goedkeuring niet nodig, maar Carien moet het wel weten.
8. **Nog steeds open:** de quote bij de atelierfoto, en een echte foto van belettering op kleding (`hero-box-dicht.jpg` is tijdelijk).

**Voor `docs/fotolijst.md` (ter info):**
- Een vectorlogo (SVG) maakt een groter logo in de intro mogelijk.
- Met de grotere originelen van de Instagram-foto's kan de Instagram-foto naar 2 : 3, en kan `ig-babynest.jpg` ook als grote portfoliofoto gebruikt worden.

## Bestanden
- `public/index.html` (intro, hero-sets en tabjes, uitgelicht, portfolio, personaliseren, Instagram, contact, LET OP-opmerkingen)
- `public/assets/css/style.css` (kleurregel `--op-kleur`, intro, posities, slider, kaarten, Instagram, contact)
- `public/assets/js/main.js` (intro-tijdlijn en overslaan, setwissel per helft, kantelen, lopende tekst op tijd, portfolio-hover, tab-slider)
- `scripts/controleer.py` (setwisseltest, tabbladtest, telling portfolio = 5)
- `CLAUDE.md` (ontwerpregels hero, intro en witte tekst)
- `docs/fotolijst.md` (vectorlogo en grotere Instagram-originelen toevoegen)
- Mogelijk geraakt via gedeelde CSS en JS: `public/kraamcadeaubox.html`, `public/privacy.html`, `public/bedankt.html`, `public/404.html` (controleren, niet bewust wijzigen)

Alle genoemde foto's staan al in `public/assets/img/`. Er zijn geen nieuwe foto's nodig.

## Buiten scope
- De formulier-Worker (`src/worker.js`, `src/formulier.js`), `tests/`, `_redirects`, `_headers`, `wrangler.jsonc` en `.github/workflows/`. Het formulier wordt alleen anders geplaatst; velden, namen en `action` blijven gelijk.
- De inhoud en opmaak van `kraamcadeaubox.html` (prijstabel en thema's).
- Nieuwe foto's, een vectorlogo en grotere Instagram-originelen.
- De definitieve teksten van Carien. Die komen later via de goedkeuringsronde.
- Het menu, de cursor, de pagina-overgang en het vloeiend scrollen uit `2026-11-01-interactie-zoals-stock.md`. Alleen criterium 1 (intro) en criterium 6 (woordenlijst) van die brief worden vervangen.
- Nameservers en live zetten op luxmini.nl.

## Open vragen
**Besluiten van Carst over de open vragen (2 nov 2026):**
- **Intro op andere pagina's:** de intro komt op elke pagina, één keer per sessie (via `sessionStorage`, `lux-intro-gezien`), zoals bij Stock.
- **Teksten en productregels:** zijn tijdelijke plaatshouders met de opmerking `<!-- LET OP: wacht op akkoord Carien -->`; ze gaan later door de goedkeuringsronde.
- **Ontwerpregels in `CLAUDE.md`:** zijn in deze wijziging bijgewerkt; Carst keurt ze goed in de pull request.

- **Teksten voor Carien:** alle punten onder "Voor Carien ter goedkeuring". Ze zijn tijdelijk en houden deze wijziging niet tegen (besluit 4), maar moeten vóór de overstap naar luxmini.nl zijn goedgekeurd.
- **Productregels:** maakt Carien deze producten echt zo en noemt ze ze ook zo (bijvoorbeeld "omkeerbaar jasje", "hanger", "babynest")? Dit zijn feitelijke beweringen, dus ze moeten kloppen voordat de site live gaat.
- **Ontwerpregels in `CLAUDE.md`:** volgens `CLAUDE.md` veranderen die "niet zonder overleg". Carst heeft ze gevraagd. De mens die de pull request bekijkt, moet de nieuwe regels expliciet goedkeuren.
- **Intro op andere pagina's:** de ontwerprichting gaat uit van het eerste bezoek per sessie, dus ook wie binnenkomt via `kraamcadeaubox.html`. Moet de intro ook daar verschijnen, of alleen op de homepage? Voorstel: op elke pagina, één keer per sessie, zoals bij Stock. Bevestiging nodig.
- **Tijdelijke Belettering-foto:** `hero-box-dicht.jpg` blijft tijdelijk tot er een echte foto is (`docs/fotolijst.md`).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | website-planner | brief opgesteld; ontwerprichting en criteria van website-ontwerper letterlijk overgenomen |
| Bouwen | website-bouwer | Gebouwd in zes stappen met een commit per stap (intro, hero, uitgelicht, portfolio, personaliseren, Instagram/contact), plus `controleer.py`, `CLAUDE.md` en `docs/fotolijst.md`. Gemeten met Playwright op 1440/1024/768/390. **Intro:** klaar op 3,04–3,12 s, doek op 2,31 s al 519 van 900 px weg, overslaan (klik, toets, Tab, wiel, tik) visueel in 0,5 s, opgeruimd in 0,54 s; geen intro bij herhaald bezoek, minder beweging of zonder JS; regels 63 px (mobiel 40 px), logo 200/160 px, regel 1 eindigt 24 px links van de figuur op 40%, regel 2 begint 24 px rechts op 62%. **Hero:** muis rechts zet t2/t3/t4/t6 op B en salie met inkt en donker logo, t1/t5 blijven; op 390 wisselt een tik op "Het cadeau" of een tegel; Tab komt op de twee tabjes (44 px hoog), niet op tegels; hoogste foto op 180 px, laagste eindigt 62 px boven de onderrand; overlap kop/foto 0 px op 1440 en 768. **Uitgelicht:** foto 240 px van links, 360 × 480, regel loopt over het midden van de foto (beide 1475 px), 15,0 s per halve spoorbreedte met en zonder scrollen, pauze buiten beeld, stil bij minder beweging; 390: marges 74/74 px; ruimte quote → foto 155 px (vanaf de pijl-link 85 px), mobiel 95 px (24 px). **Portfolio:** 5 + 5, na 0,75 s laag in de itemkleur, andere namen, label en pijl-link 0,2, actieve naam inkt; groot op 360 px (25%), klein op 835 px (58%); niets vergroot; kaarten 304 px (390) en 320 px, naam 24 px, regel 16 px; Esc en focus uit de lijst zetten terug. **Personaliseren:** stil op de juiste foto en kop na 1,37 s, laag naar mauve in 0,75 s, tijdens het draaien scrollWidth 1440/390; 2 × 5 snelle klikken: nooit leeg beeld, nooit meer dan 2 foto's, eind en `aria-selected` kloppen; aanwijzen en focus wisselen niet, pijltoetsen verplaatsen de focus, Enter en Spatie activeren; tabbladen 44 px, inkt (ook op oker), op 390 drie kolommen op één regel; 390: label, foto, tabbladen en kop samen in beeld. **Instagram/contact:** één foto (480 × 640, 3:4) naast de tekst op 1440, eronder op 390; 1440 na "Contact": kop, WhatsApp en foto in beeld, formulier begint op 864 px; 390 na tik op `#contact`: WhatsApp op 595–639 px, formulier één kolom, velden 47–49 px. **Algemeen:** contrastscan over alle zichtbare tekst in 16 toestanden: geen wit op een lichte paletkleur (de enige melding was het werkwijze-label op de donkere foto van kolom 1); balk toont bij elke sectie het juiste label. `npm test`: 6 geslaagd. `controleer.py`: geen fouten (setwisseltest, tabbladtest, portfolio = 5, contactlaag, prijstabel, stappen, 768 px toegevoegd). **Afwijkingen en keuzes:** (1) de hero-kop wordt kleiner als de langste regel een foto rechts ervan zou raken; met het vervanglettertype hier (Google Fonts is in de bouwomgeving niet bereikbaar) wordt de kop 74 px in plaats van 88 px op 1440 en 41 px op 768. Met Libre Caslon Display kan dat anders uitvallen, dus graag controleren in de preview. (2) Het beeldvlak in Personaliseren is een masker; de oude foto schuift binnen het kader naar links weg, anders bleef hij half over de tekst staan. (3) De introfiguur is op tablet 36vw (niet gegeven). (4) Kraamcadeaubox: de omdraai-opmaak van de tegels is verwijderd (anders werkte die hero niet meer met de gedeelde CSS/JS); die hero wisselt geen sets en blijft terracotta. (5) Bij minder beweging wisselen sets, tabbladen en kleuren direct (criterium 22), dus de hero kan dan wel naar salie met inkt. |
| Controleren | website-controleur | Ronde 1: AKKOORD. Verbeterpunten voor de pull request: setwissel- en tabbladtest verplicht maken op `index.html` (ontbreken = fout), de setwisseltest ook laten toetsen op inkt en het donkere logo in set B (met een negatieve test); alt-teksten van `p-bijtring-giraf-kleur.jpg` (geen houten ring) en `over-werkplek.jpg` (één naaimachine) corrigeren; `loading="lazy"` weg bij de introfoto (die wordt al vooraf geladen). |
| Ontwerpgate | website-ontwerper | Ronde 1: ONTWERP AKKOORD, met een poetsronde vóór de pull request. P1: witte lopende regel over de lichte Uitgelicht-foto (ca. 1,5:1); hero-kop zonder JS overlapt foto's (basis naar `clamp(40px, 5.6vw, 80px)`); tabletheader (761–1024 px) loopt over twee regels en het logo valt bovenaan weg. P2: gat van ca. 170 px in de mobiele kraamcadeaubox-hero; cirkel door "Carien Geurts / Atelier Ospel" op mobiel; sjaal bij Borduren afgesneden. Brief: de zin over "minder beweging" in de algemene kleurregel vervangen. |
| Bouwen (ronde 2) | website-bouwer | Alles verwerkt. **Uitgelicht:** foto `brightness(.85)` plus 20% inkt (`::after`, komt samen met de foto op). Wit op de foto in de band van de lopende regel, gemeten op de pixels zonder de regel: 1440 gemiddeld 2,25:1 → 4,26:1 (83% van de pixels ≥ 3:1, 10e percentiel 2,68:1 op het lichtste vloeipapier); 390: 2,27:1 → 4,30:1 (84%). **Hero-kop:** basis `clamp(40px, 5.6vw, 80px)`, de tabletregel (6vw) is overbodig en weg. Zonder JS met het vervanglettertype (Google Fonts is hier niet bereikbaar): 80 px op 1440 en 57 px op 1024, waarbij de langste regel nog 12 en 11 px horizontaal onder t4 loopt (binnen de 24 px van criterium 6, maar niet nul); 768 px: 0 px. Met JS 74/52/41 px en 0 px overlap. Met Libre Caslon Display in de preview nog nameten. **Tabletheader:** met JS 761–1024 px alleen logo en burger; header 104 px, logo op 30 px van boven (was 0 px, afgesneden). Zonder JS blijft het menu staan, want zonder JS is er geen burger. **Kraamcadeaubox mobiel:** hero 680 px en onderste rij op 62/65/64%, ruimte tekst → onderste rij 109 px (was ca. 170 px); geen extra pijl-link, die staat al direct onder de hero. **Cirkel mobiel:** 24 px omhoog en naar rechts was niet genoeg (bleef kruisen); nu 12 px naar rechts, 40 px omhoog en 52% breed: 10 px vrij van de kapitalen. **Borduren:** `object-position: 35% 50%`; "Sem" staat helemaal in beeld, maar de sjaal loopt in het bronbestand zelf rechts van de foto af en kan dus nooit helemaal in beeld (nodig: het origineel). **Alt-teksten:** bijtring ("…met twee kralen met girafprint en een bruin bijtfiguurtje"), werkplek ("…met een naaimachine bij het raam en een wand vol garens"). **Introfoto:** staat als `data-src` zonder `src`; de intro-JS zet `src` pas als de intro echt komt (de preload in `<head>` gebeurt ook alleen dan). Gemeten met Playwright (verzoeken naar `p-knuffel-naam.jpg`): eerste bezoek 1 verzoek (ook na doorklikken in dezelfde sessie), herhaald bezoek op de kraamcadeaubox 0, zonder JS op de privacypagina 0. Op `index.html` blijft er zonder intro 1 verzoek; dat komt van de kleine portfoliofoto bij "Welkom op de wereld" (`.klein-beeld`), niet van de intro. Is de foto na 0,6 s nog niet geladen, dan blijft het perzik vlak staan (getest met een vertraagde foto). **controleer.py:** setwissel- en tabbladtest verplicht op `index.html`; set B toetst inkt op kop, quote en lopende regel en het donkere logo, en set A weer wit. Negatieve test: met tabbladen, inkt-regel en donker logo kapot meldt de controle 6 fouten (desktop en mobiel), zonder `data-wissel` 2 fouten; daarna teruggezet. `npm test`: 6 geslaagd; `controleer.py`: geen fouten; `schermafdrukken.py` opnieuw gedraaid en de geraakte schermen bekeken. **Caching (gevonden op de preview):** `public/_headers` gaf CSS en JS `max-age=604800`, waardoor terugkerende bezoekers na een release tot een week de oude `style.css` en `main.js` hielden. Nu `Cache-Control: public, max-age=0, must-revalidate` (Cloudflare stuurt een ETag, dus hercontroleren is goedkoop). Afbeeldingen houden de lange cache (30 dagen): **een vervangen foto moet daarom altijd een nieuwe bestandsnaam krijgen**, anders ziet een terugkerende bezoeker de oude. `controleer.py` controleert `_headers` (CSS/JS geen lange `max-age` zonder `must-revalidate` of `no-cache`) en `rooktest.sh` controleert hetzelfde op de live site; beide negatief getest (met de oude waarde: fout, exitcode 1). |
| Bouwen (ronde 3) | website-bouwer | **Portfolio wit bij aanwijzen** (besluit 5, wens Carst): diepe tinten in lijst en kaarten. Gemeten op 1440 per item, wit tegen de laag: oker 3,034:1, salie 3,010:1, olijf 3,039:1, perzik 3,003:1, mauve 3,009:1. Actieve naam wit (opacity 1, 75 px), andere namen wit 0,35, label en pijl-link wit 0,35, productregel wit 19 px 600 in kapitalen, 20% inkt op beide foto's. Balk boven het portfolio: wit logo, wit label, witte burger. Na weggaan alles terug naar inkt op wit. Kaarten (390): diepe tint, naam 24 px en productregel 19 px 600, wit, met dezelfde contrasten. **Let op:** het balklabel is 15 px en wit op de diepe tint (3:1). Dat is kleine tekst onder de nieuwe regel; graag een besluit van de ontwerper (groter, of inkt laten). **Rustigere wissels** (besluit 6): bovenkant naar salie in 1,27 s, kop inkt na 1,24 s, donker logo na 1,22 s, foto B volledig na 0,66 s. Halverwege terug wisselen loopt verder vanaf de huidige stand (geen sprong groter dan 0,15 in opacity per frame). Portfoliolaag 1 s rustig, daarna weer 0,75 s bij scrollen. Bij minder beweging alles direct (eerste frame al eindstand). **controleer.py:** de portfoliotest toetst bij alle vijf items een witte actieve naam en een laag in een van de diepe tinten. Negatief getest: met een lichte tint en inkt als hoverkleur kwamen 6 fouten. Wachttijden van de set- en hovertest passen bij 1,2 en 1 s. `schermafdrukken.py` wacht 1,3 s per scherm. **Documentatie:** kleurregel in `CLAUDE.md` (wit alleen voor grote tekst, op terracotta en op de vijf diepe tinten; portfolioregel; tijden) en `docs/ontwerp/principes.md` bijgewerkt, besluiten 5 en 6 in deze brief. `npm test`: 6 geslaagd; `controleer.py`: geen fouten; schermafdrukken opnieuw gemaakt en bekeken. |
| Preview bekeken | [mens] | |
| Live gezet (merge) | [mens] | |
