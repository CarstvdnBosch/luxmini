# C7 — Stofkeuze in het formulier: stoffoto's, eigen stof met foto of link (issue #59)

**Wens (Carst, 11 nov.):** "On the form you also want to show the actual fabric picture, and maybe upload one preferred yourself, maybe with a hyperlink on the website that provides this fabric."

## Wat verandert
1. **Thema als keuzekaarten** (`public/contact.html`, groep Kraamcadeaubox): de keuzelijst Thema wordt een tweede `fieldset.keuzes` (legend "Thema") onder Formaat, met per thema een kaart met de bestaande stoffoto (`stof-*.jpg`, 240 × 240, lazy) en de naam. Daarna een tegel **"Een eigen stof"** met een lijntekening (stoflap met plus; geen nepfoto) en de regel "Upload een foto of stuur een link", en onder het raster **"Nog niet gekozen"** (standaard). De waarden blijven de huidige themawaarden (`Giraf` … `Blaadjes en bloemen`, `Een eigen stof of kleur`, leeg).
2. **Blok "Je eigen stof (optioneel)"**, alleen bij een eigen stof (CSS `:has`; zonder `:has` altijd zichtbaar met "Alleen bij een eigen stof: "):
   - `input type=file name=stof_foto` (`accept="image/jpeg,image/png,image/webp,image/heic"`, max. 5 MB), met JavaScript een miniatuur, de bestandsnaam en "Verwijderen";
   - uitlegzin: "Je foto gaat alleen als bijlage mee in de mail aan Carien en wordt niet bewaard." (plus het toegestane formaat);
   - `input type=url name=stof_link` (max. 300 tekens), label "Link naar de stof (bijvoorbeeld een webshop)".
3. **Formulier** wordt `enctype="multipart/form-data"`; met JavaScript verstuurt `fetch` de `FormData` (was `URLSearchParams`, waarmee een bestand niet mee kan).
4. **Worker** (`src/formulier.js`, `src/contact.js`, `src/worker.js`):
   - foto alleen bij onderwerp Kraamcadeaubox en thema = eigen stof; opgegeven type in de lijst (of leeg, zoals HEIC op sommige systemen) én eerste bytes kloppen (JPEG `FFD8FF`, PNG `89504E47`, WEBP `RIFF…WEBP`, HEIC `ftyp` `heic`/`heix`/`mif1`), max. 5 MB; bestandsnaam opgeschoond (geen map, alleen `a-z0-9._-`, juiste extensie); niets opgeslagen, niets van naam of inhoud gelogd;
   - link alleen bij eigen stof: `https://`, max. 300 tekens, geen regeleinden of spaties; alleen als platte tekst in de mail ("Link naar de stof: …");
   - met foto wordt de mail `multipart/mixed`: dezelfde tekst (base64) plus de foto als base64-bijlage (regels van 76) met `Content-Type`, `Content-Disposition: attachment` en een regel "Foto van de stof: bijlage (naam)" in de tekst; **zonder foto blijft de mail precies als nu**;
   - ongeldige foto → `/contact?verzonden=fout&reden=foto#formulier`, ongeldige link → `&reden=link`; ongeldige naam/e-mail/bericht gaat voor (gewone melding).
   - Cloudflare-limieten: een foto van 5 MB geeft een mail van ca. 7 MB (send_email ruim binnen 25 MB); request body ruim onder 100 MB.
5. **Meldingen** (`main.js`): vooraf onder het veld, 16 px inkt, `aria-live="polite"`, via `aria-describedby`: "Let op: deze foto is groter dan 5 MB. Kies een kleinere foto.", "Let op: dit is geen foto. Kies een JPG, PNG of HEIC.", "Let op: begin de link met https://". Een geweigerde foto gaat niet mee (veld leeg). Een verborgen linkveld blokkeert het versturen nooit. Foutpagina's `reden=foto` en `reden=link` krijgen een eigen melding boven de knop.
6. **Vooraf invullen:** `?thema=giraf` (zoals nu via `sleutel()`) vinkt de kaart; `?thema=eigen` kiest de eigen stof (blok open); onbekend → "Nog niet gekozen". Geen scroll of focus.
7. `privacy.html`: één zin dat een meegestuurde foto alleen als bijlage per mail naar Carien gaat en niet op de website wordt bewaard. `CLAUDE.md` bijgewerkt.
8. Testmodus `scripts/serveer.mjs`: kan multipart (Node `request.formData()`), bouwt de mail op (ook met bijlage) en verstuurt nooit; nieuwe header `x-testmail-bijlage: ja | nee` laat de nep-verzending mislukken als er (g)een bijlage in de mail zit.

## Acceptatiecriteria
1. Thema kies je met keuzekaarten met de negen stoffoto's, "Een eigen stof" en "Nog niet gekozen" (standaard); de waarden zijn gelijk aan de huidige thema-waarden; de Worker neemt alleen bekende thema's over (ongewijzigd).
2. Het blok "Je eigen stof" staat er alleen bij een eigen stof (met en zonder JavaScript via `:has`; zonder `:has` altijd met prefix).
3. Foto: optioneel, alleen bij eigen stof; type, eerste bytes en grootte (max. 5 MB) gecontroleerd in de Worker; bestandsnaam opgeschoond; niets opgeslagen of gelogd. Link: optioneel, alleen `https://`, max. 300, geen regeleinden, platte tekst.
4. Mail met foto: `multipart/mixed` met tekst en base64-bijlage (regels ≤ 76, juiste MIME-koppen); zonder foto exact de oude mail; geen bijlage bij een ander thema of onderwerp.
5. Met JavaScript: meldingen vooraf ("Let op: …"), miniatuur/naam/Verwijderen; zonder JavaScript: gewone POST (multipart), bij een ongeldige foto terug op `reden=foto` met een passende melding.
6. `?thema=giraf`, `?thema=eigen`, `?thema=onzin` werken zoals beschreven.
7. Unit-tests (bestandstype/grootte/eerste bytes, link, MIME met en zonder bijlage, geen bijlage bij ander thema, log zonder naam) en e2e (kaarten per breedte zonder horizontaal scrollen, blok alleen bij eigen stof, vooraf invullen, upload via `setInputFiles` met `x-testmail` ok/fout, meldingen te groot/verkeerd type/link, zonder JS). Nooit een echte mail.
8. `npm run check` groen; axe 0 overtredingen, ook met het blok open.

## Ontwerprichting (website-ontwerper, rol 1, 11 nov.)
1. Thema als tweede `fieldset.keuzes` (legend "Thema") onder Formaat; keuzekaarten in de stijl van `.keuze-kaart`: stoffoto vierkant (object-fit cover, max. 240 px) + naam (Libre Caslon Text 16 px); gekozen = 1 px inktrand + vink rechtsboven in een wit rondje van 24 px. `value` = de huidige optiewaarden (Giraf … Blaadjes en bloemen, "Een eigen stof of kleur", "").
2. Raster zonder scrollbalk: vanaf 761 px 5 kolommen (9 stoffen + tegel "Een eigen stof" = 2 rijen); tot 760 px 3 kolommen 3 × 3 + "Een eigen stof" over de volle breedte, liggend. Eigen stof = lijntekening (stoflap met plus), onder de naam "Upload een foto of stuur een link". "Nog niet gekozen" als smalle tekstkaart over de volle breedte onder het raster (≥ 44 px), standaard aangevinkt.
3. Blok "Je eigen stof (optioneel)" (fieldset) direct onder het raster, vóór "Nog niet gekozen"; zichtbaar via `:has(input[value="Een eigen stof of kleur"]:checked)` binnen `@supports selector(:has(a))`, vervaagt in zoals `groep-in` (minder beweging direct); zonder `:has` altijd zichtbaar met prefix "Alleen bij een eigen stof: ". Inhoud: `input type=file` (accept image/jpeg, png, webp, heic), `::file-selector-button` in huisstijl (serif 16 px, inkt op wit, geen ronde hoeken, ≥ 44 px); met JS een miniatuur (≤ 72 px) + bestandsnaam + "Verwijderen" (≥ 44 × 44, focus terug naar de bestandsknop). Uitleg 16 px: "Je foto gaat alleen als bijlage mee in de mail aan Carien en wordt niet bewaard." Link: `input type=url`, label "Link naar de stof (bijvoorbeeld een webshop)".
4. Fouten onder het veld, 16 px inkt, beginnen met "Let op:", `aria-describedby` + `aria-live="polite"`: te groot ("Let op: deze foto is groter dan 5 MB. Kies een kleinere foto."), verkeerd type ("Let op: dit is geen foto. Kies een JPG, PNG of HEIC."), link ("Let op: begin de link met https://"). De Worker controleert hetzelfde.
5. Toegankelijkheid: stoffoto `alt=""` (naam in het label), tekening `aria-hidden`, pijltjestoetsen in de radiogroep, focus outline 2 px inkt offset 3 px, verborgen blok `display: none`, hover rand 40% inkt, foto's lazy 240 × 240.
6. Vooraf invullen: `?thema=giraf` (`sleutel()`) vinkt de kaart; `?thema=eigen` → eigen stof + blok open; onbekend → Nog niet gekozen; geen scroll/focus.

### Ontwerpcriteria
- **O1** 5 kolommen / 2 rijen op 1440 en 768; 3 kolommen + eigen stof breed op 390.
- **O2** tegel ≤ 240 css-px; ≥ 96 px op 390.
- **O3** themagroep op 390 ≤ 844 px hoog (zonder blok).
- **O4** geen horizontale scroll (390/768/1440).
- **O5** foto + naam 16 px; gekozen: rand + vink.
- **O6** tikdoelen ≥ 44 px, tekst ≥ 16 px.
- **O7** "Nog niet gekozen" standaard en opnieuw kiesbaar.
- **O8** blok alleen bij eigen stof (zonder `:has` altijd, met prefix).
- **O9** bestandsknop in huisstijl; werkt zonder JS; met JS miniatuur/naam/Verwijderen, focus terug.
- **O10** fout < 1 s met "Let op:", `aria-live`, `aria-describedby`; het bestand gaat niet mee.
- **O11** uitlegzin onder de knop, 16 px.
- **O12** legend "Thema", `alt=""`, toegankelijke naam = themanaam, axe 0 ook met blok open.
- **O13** `?thema=giraf` / `eigen` / `onzin`; focus springt niet.
- **O14** minder beweging zonder vervagen.

Aandacht (ontwerper): de Worker mag de foto niet opslaan (de belofte staat in beeld); `stof-*-480.jpg`-srcset later (fotolijst); de maatkeuze van C5 staat onder Naam/Datum.

## Besluiten ronde 2 (bouwer)
- **Linkveld** `stof_link` is `type="text" inputmode="url" autocomplete="url"`: zonder JavaScript controleert de browser niets (een verborgen ongeldige link blokkeerde anders het versturen zonder melding); de Worker controleert (`reden=link`). Met JavaScript houdt `setCustomValidity` een zichtbare foute link tegen.
- **Bestandsknop:** met JavaScript (`html.js`) is het echte veld alleen visueel verborgen (geen `display:none`, focusbaar, de focus is op de knop te zien) en is het label de knop "Kies een foto" (serif 16 px, inkt op wit, 44 px); de gekozen naam staat bij de miniatuur. Zonder JavaScript (geen `.js`, ook na de noodrem van 3 s) blijft de gewone weergave van de browser met de gekozen naam en is de losse knop verborgen. Eenvoudigste robuuste oplossing: geen `:has`/`@supports` nodig.
- **Worker:** `Content-Length` > 6 MB → `reden=foto` vóór het lezen; links met gebruikersgegevens (`naam:wachtwoord@`) geweigerd; `mif1`/`msf1` alleen HEIC met een `heic`/`heix`-merk, AVIF wordt geweigerd (accept blijft JPG/PNG/WEBP/HEIC).

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | Claude (hoofdsessie) + website-ontwerper rol 1 | Brief en ontwerprichting O1–O14 (11 nov.). |
| Bouwen | website-bouwer | `contact.html`: Thema als keuzekaarten (9 stoffoto's, "Een eigen stof" met lijntekening, "Nog niet gekozen" standaard), blok "Je eigen stof" (`stof_foto`, `stof_link`), `enctype="multipart/form-data"`. `style.css`: `.stof-kaarten` (5 kolommen, mobiel 3 × 3 + eigen stof breed), vink in wit rondje, blok via `:has`, bestandsknop in huisstijl, miniatuur en meldingen. `main.js`: `fetch` met `FormData`; vooraf invullen voor de kaarten (`?thema=eigen`); fotocontrole vooraf (type/grootte, "Let op: …", geweigerde foto gaat niet mee), miniatuur/naam/Verwijderen (focus terug); linkcontrole (`setCustomValidity`, verborgen linkveld uitgeschakeld zodat het nooit blokkeert); meldingen `reden=foto` en `reden=link`. Worker: `controleerFoto` (type, eerste bytes, 5 MB), `schoneNaam`, `controleerLink`, `bouwMail` multipart/mixed met bijlage (zonder foto ongewijzigd), `reden=foto`/`reden=link`, log alleen "foto"/"link". `privacy.html` één zin; `CLAUDE.md` bijgewerkt. Testmodus `serveer.mjs`: bouwt de mail op, `x-testmail-bijlage: ja | nee`. Tests: nieuw `tests/stofkeuze.test.js` (14) en `tests/e2e/stofkeuze.spec.js`; +2 multipart-tests in `formulier-testmodus.test.js`; axe met blok open in `toegankelijkheid.spec.js`; bestaande tests aangepast aan de kaarten en multipart (select → radio, urlencoded → multipart; niets versoepeld); `controleer.py` kent de nieuwe velden en toetst dat het blok zonder JS pas bij een eigen stof verschijnt. Lokaal: `npm test` 129/129, `controleer.py` geen fouten, e2e Chromium desktop/tablet/mobiel (eigen poort): stofkeuze + formulier-foutmelding 59 geslaagd, homepage/kernpaden/mobiel/SEO-veiligheid/plaatshouders 252 geslaagd, 0 fout. axe, WebKit (iPhone), Lighthouse en visueel draaien alleen in CI; `npm run check` dus niet volledig lokaal. Visueel (Gate 5): de contactpagina wijkt bewust af (keuzekaarten). |
| Controle ronde 1 | website-controleur | NIET AKKOORD — verborgen `stof_link` (type=url) blokkeert zonder JS het versturen zonder melding na wisselen van thema/onderwerp; verder Content-Length, links met gebruikersgegevens en AVIF als HEIC. |
| Ontwerpgate ronde 1 | website-ontwerper | ONTWERP NIET AKKOORD — themanamen lopen op 360–390 px buiten hun kaart ("Wilgentakjes", "Regenboog", op 320 "Framboos"); kan beter: "Nog niet gekozen" vóór het blok, bestandsknop "Kies een foto", meldingen met accentlijn en max. 60ch, regel "Foto of link". |
| Bouwen ronde 2 | website-bouwer | `stof_link` type=text (inputmode/autocomplete url); `.stof-kaart-naam` block met `hyphens: auto` en `overflow-wrap: anywhere`, `&shy;` in Wilgen-takjes, Regen-boog, Fram-boos; "Nog niet gekozen" direct onder het raster; bestandsknop "Kies een foto" (zie Besluiten ronde 2); meldingen met inktlijn 2 px links, max. 60ch; regel "Foto of link". Worker: Content-Length > 6 MB → `reden=foto`, geen gebruikersgegevens in de link, AVIF geweigerd. Tests: +5 unit-tests (`tests/stofkeuze.test.js`), e2e: namen binnen de kaart op 320/360/390, knop/volgorde/regel/60ch, zonder JS: link wisselen van thema → /bedankt, ongeldige link eigen stof → `reden=link`, native bestandsveld; `controleer.py` kent de nieuwe veldvolgorde en `stof_link` text (geen versoepeling). Lokaal: `npm test` 134/134, `controleer.py` geen fouten, e2e Chromium desktop/tablet/mobiel op eigen poort (stofkeuze, formulier-foutmelding, kernpaden, homepage, mobiel, SEO-veiligheid, plaatshouders) 286 geslaagd, 0 fout. axe (`@axe-core/playwright` niet geïnstalleerd), WebKit, Lighthouse en visueel alleen in CI; `npm run check` dus niet volledig lokaal. Visueel: contactpagina wijkt bewust af. |
