# LUX mini — website (luxmini.nl)

Statische portfolio-website voor **Carien Geurts / LUX mini**: gepersonaliseerde, handgemaakte babykleding, siliconen items en kraamcadeauboxen. Atelier in Ospel. Er is **geen webshop**; bezoekers nemen contact op (WhatsApp, bellen, mail, formulier).

Hosting: **Cloudflare Workers** (statische bestanden uit `public/` + een kleine Worker voor het formulier). Code staat op **GitHub** (openbaar; nooit geheimen committen). **Cloudflare Workers Builds** maakt per branch een preview en zet live na een merge naar `main`. GitHub Actions draait de controles (gate 1 en 2) bij elke pull request en de rooktest (gate 3) na live zetten. Domein luxmini.nl staat geregistreerd bij GoDaddy; de nameservers gaan pas naar Cloudflare na akkoord van Carien.

## Werkwijze: AI-PDLC

Elke wijziging volgt `docs/ai-pdlc.md`: **plannen → bouwen → controleren → ontwerpgate → release**. Start met `/website-update <wens>`.

1. **website-planner** maakt een brief met acceptatiecriteria in `docs/wijzigingen/`. Bij zichtbare wijzigingen levert **website-ontwerper** (senior UX/UI) de tekst voor de ontwerprichting en ontwerpcriteria; de planner zet die in de brief.
2. **website-bouwer** voert die uit op een branch `wijziging/<naam>` en draait `npm test` en `python3 scripts/controleer.py`.
3. **website-controleur** toetst onafhankelijk of het werkt en klopt; bij NIET AKKOORD terug naar de bouwer (max. 3 rondes).
4. **Ontwerpgate:** **website-ontwerper** beoordeelt de schermen (desktop, tablet, mobiel; `python3 scripts/schermafdrukken.py`) tegen `docs/ontwerp/principes.md` en de ontwerpregels hieronder; bij ONTWERP NIET AKKOORD terug naar de bouwer (max. 3 rondes).
5. Bij AKKOORD van beiden (of n.v.t. van de ontwerper bij alleen techniek): branch pushen en pull request openen → GitHub draait de controles, Cloudflare maakt een preview → **een mens** bekijkt die en merget naar `main` → Cloudflare zet live, de rooktest controleert.

Agents mergen nooit naar `main` en zetten nooit zelf iets live.

## Mappen

- `public/` — **alles wat online komt**
  - `index.html` — homepage: maatwerk en personaliseren (hoofdfocus)
  - `kraamcadeaubox.html` — tweede pagina: de kraamcadeaubox (formaten, thema's)
  - `privacy.html`, `bedankt.html`, `404.html`, `robots.txt`, `sitemap.xml`
  - `_redirects` — doorverwijzingen van oude Wix-adressen; `_headers` — beveiliging en caching
  - `assets/css/style.css` — alle opmaak; kleuren als variabelen bovenaan
  - `assets/js/main.js` — collage, omdraaien, hover-lijst, vaste balk, opkomen bij scrollen
  - `assets/img/` — webversies van foto's (max. ~1400 px, JPEG kwaliteit ~80)
- `src/worker.js` + `src/formulier.js` — contactformulier (`POST /api/contact`) → mail via Cloudflare Email Routing naar info.luxmini@gmail.com
- `wrangler.jsonc` — Cloudflare-configuratie
- `.github/workflows/` — `controle.yml` (gate 1 en 2 bij elke pull request), `rooktest.yml` (gate 3 na live zetten en dagelijks)
- `tests/` — tests voor het formulier (`npm test`)
- `scripts/controleer.py` — sitecontrole met screenshots; `scripts/rooktest.sh` — controle van de live site
- `docs/` — AI-PDLC, wijzigingsbriefs, fotolijst, `ontwerp/` (UX-principes en ontwerpreviews) (niet online)
- `scripts/schermafdrukken.py` — schermafdrukken per schermhoogte voor de ontwerpgate

## Ontwerpregels (niet zonder overleg veranderen)

- Ontwerppatroon: editorial, gebaseerd op de opbouw van stockdutchdesign.com, maar met eigen logo, teksten en foto's van LUX mini. Nooit hun logo, teksten, slogans of foto's overnemen.
- Kleuren (variabelen in `style.css`): terracotta `#BC8565` (hoofdkleur; witte tekst alleen voor koppen en quotes vanaf 24 px; kleine tekst op terracotta in inkt), wit, grijsblauw `#E0E6E7`, inkt `#202020`. Hoverkleuren portfolio: perzik `#DEB799`, oker `#C89F67`, salie `#C3CFBC`, mauve `#B5969E`, olijf `#B4B19A`.
- Lettertypes: grote koppen en quotes in Libre Caslon Display, labels en pijl-links in Libre Caslon Text, lopende tekst in Source Sans 3 (vrije versie van de letter die Stock gebruikt). Kleine kapitalen met ruime spatiëring (`.caps`).
- Logo: witte versie (`logo-luxmini-wit.png`) los op terracotta; donkere versie (`logo-luxmini-donker.png`) op wit/grijs.
- Vaste balk (`.balk`) verschijnt na de hero en toont het label van de huidige sectie (`data-label`). Nieuwe secties krijgen een `data-label`.
- Foto's: warme, gebroken witte tinten. Nieuwe foto's krijgen dezelfde lichte warme kleurcorrectie. Zie `docs/fotolijst.md` voor gewenste nieuwe foto's.
- Secties genummerd: `001 —`, `002 —` enzovoort, klein in serif.
- Links als pijl-links (`.pijl`), geen opvallende knoppen.
- Scrollen en kleur (gemeten bij Stock): wiel glijdt met ease 0,05, toetsenbord en ankers met 0,14; touch native. Secties na de bovenkant zijn doorzichtig boven één vaste laag (`.achtergrond`) die per sectie in 0,75 s van kleur verloopt. Header, collage, uitgelicht en werkwijze (`.hero-kleur`) kleuren samen mee bij aanwijzen en gaan terug naar terracotta bij verlaten.
- Hero: collage van zes foto's (`.tegel.t1` t/m `.t6`). Op desktop bewegen ze mee met de muis en draaien ze om bij aanwijzen; op mobiel draaien ze om met een tik.
- Mobiel moet altijd goed werken (390 px breed): niets mag horizontaal scrollen, tekst moet leesbaar blijven.
- Toon: warm, persoonlijk, Nederlands, "je/jij". Korte zinnen.

## Inhoudsregels

- Geen verzonnen feiten, reviews, cijfers of quotes. Een quote van Carien alleen als zij die heeft goedgekeurd.
- Prijzen kraamcadeaubox (leidend, van de originele site): € 35 (knuffel, swaddle, broekje), € 50 (+ sjaaltje), € 65 (+ shirtje, douchehandschoen), € 80 (+ bijtring).
- Contact: 06 – 43 79 16 18, info.LUXmini@gmail.com, WhatsApp via `https://wa.me/31643791618`, Sperwerstraat 10, 6035 GH Ospel.
- Overgenomen van de oude site (luxmini.nl), dus geen verzonnen tekst: "Ieder nieuw leven is bijzonder", Cariens verhaal (twee dochters, vier kleinkinderen, "Hoe bijzonder is het om één van de eerste pakjes voor iemand te mogen maken") en "binnen 7 werkdagen verzonden".
- Nog open: KvK-nummer (`[nummer]`), goedkeuring quote bij de atelierfoto, foto van belettering op kleding, teksten bij de technieken, originele (grotere) bestanden van de Instagram-foto's.
- Foto's van Instagram @luxmini2020 mogen gebruikt worden (toestemming van Carst). Ze staan als `ig-*.jpg` in `public/assets/img/`. Snijd tekstbalken en overlays altijd weg.

## Nieuwe foto's toevoegen

1. Origineel in de mediamap bewaren (buiten deze site).
2. Webversie maken: max. 1400 px lange zijde, JPEG kwaliteit 80, bestandsnaam in kleine letters met streepjes (`box-thema.jpg`).
3. In `public/assets/img/` zetten en met een beschrijvende `alt`-tekst gebruiken.
