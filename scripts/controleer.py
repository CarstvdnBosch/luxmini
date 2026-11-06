"""
LUX mini — automatische controle van de website.

Gebruik:  python3 scripts/controleer.py
Vereist:  pip install playwright  &&  playwright install chromium

Wat het doet:
  - opent elke pagina op desktop (1440 px) en mobiel (390 px), en controleert
    horizontaal scrollen ook op tablet (768 px); de intro wordt overgeslagen
    via sessionStorage (lux-intro-gezien)
  - controleert (bij minder beweging, 1440/768/390) dat laag en balk na een
    #contact-link en na End op Contact staan (ontwerpcriterium 12)
  - controleert de prijskaarten van de kraamcadeaubox (prijzen, producten,
    vinkjes en aantallen)
  - controleert "003 — Zo werkt het" op de kraamcadeaubox: één <ol> met drie
    stappen, de juiste koppen en geen horizontaal scrollen (1440/768/390)
  - controleert de tabbladen in Personaliseren (klik wisselt foto en kop
    binnen 1,5 s, aanwijzen niet)
  - controleert in public/_headers dat CSS en JS niet lang gecachet worden
    zonder hercontrole
  - brief homepage zoals Stock (2026-11-06): homepage hero, 001 Producten
    (drieluik: drie kolommen, producttekst, één pijl-link en één tabstop per
    kolom, foto boven de tekst op touch, bij aanwijzen witte tekst met 4,5:1 op
    de foto, babynest max. 324 px, koppen binnen de kolom op 1025/1280/1440),
    002 Technieken (vier links, diepe tint bij aanwijzen, kaarten op touch),
    003 Inspiratie (grote foto, witte tekst 4,5:1 op de sluier, #contact),
    004 Instagram; LET OP's (Borduren, babynestfoto, douchehandschoen,
    formuliervelden); prijskaarten en contactlinks met ?onderwerp=;
    formulier met groepen per onderwerp; Kraamcadeauboxen (volgorde,
    negen thema's als raster 3/2/2, binnen twee schermen, statementfoto direct
    na de intro); Prematuurkleding en Babynest (kop, foto, prijsrichtlijn met
    LET OP, Zo werkt het, contact; foto na hooguit één keer scrollen);
    navigatie met zes items op één regel vanaf 1280 px (daaronder de burger),
    aria-current, menu met subitems, tikdoelen 44 px op touch; _redirects
    (ook /portfolio -> /inspiratie), sitemap en canonicals; contactmomenten
    (buiten contact.html geen WhatsApp, telefoon of mail in de inhoud);
    Werkwijze (kop, Hoe ik werk-tabs, slider, Wat ik maak, geen dubbele of
    lege onderdelen); Inspiratie (vier groepen, kleuren, kolommen, geen
    vergrote of dubbele foto's, aanwijzen en touch); Contact (kop, formulier,
    foutmelding); de balk met het juiste label, zonder JavaScript en bij
    minder beweging; pijl-links 44 px, data-labels en geen horizontaal
    scrollen op 390, 768 en 1440 px
  - maakt screenshots in scripts/screenshots/
  - controleert kapotte links en afbeeldingen, ontbrekende alt-teksten,
    horizontaal scrollen op mobiel, JavaScript-fouten en of de
    interacties werken (hero-sets wisselen per schermhelft of met een tik,
    hover-lijst met muis, kaarten op touch)
Exitcode 1 als er fouten zijn, zodat een agent of CI het ziet.
"""
import os, sys, pathlib, re, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
ROOT = PROJECT / "public"          # de pagina's die online gaan
SHOTS = PROJECT / "scripts" / "screenshots"
PAGINAS = ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "babynest.html", "inspiratie.html", "contact.html", "privacy.html", "bedankt.html", "404.html"]
HOOFDPAGINAS = ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "babynest.html", "inspiratie.html", "contact.html"]
OUDE_PAGINAS = ["producten.html", "over.html", "kraamcadeaubox.html", "portfolio.html"]
SCHERMEN = {"desktop": (1440, 900), "mobiel": (390, 844)}

fouten, waarschuwingen = [], []

class StilleHandler(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

# Een kleine lokale webserver, zodat absolute paden (/assets/...) werken, zoals op Cloudflare
_server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(StilleHandler, directory=str(ROOT)))
threading.Thread(target=_server.serve_forever, daemon=True).start()

def url(p):
    return f"http://127.0.0.1:{_server.server_address[1]}/{p}"

def doelbestand(href, pagina):
    """Het bestand in public/ waar een interne link naartoe gaat (None als het niet bestaat).
    Schone adressen (/werkwijze) gaan naar werkwijze.html, zoals op Cloudflare (auto-trailing-slash)."""
    pad = href.split("#")[0].split("?")[0]
    if pad == "":
        return ROOT / pagina
    doel = ROOT / pad.lstrip("/") if pad.startswith("/") else (ROOT / pagina).parent / pad
    if doel.is_dir():
        doel = doel / "index.html"
    if not doel.exists() and doel.suffix == "" and doel.with_suffix(".html").exists():
        doel = doel.with_suffix(".html")
    return doel if doel.exists() else None

def bestaat(href, pagina):
    if href.startswith(("http", "mailto:", "tel:", "/api/")) or href == "":
        return True
    doel = doelbestand(href, pagina)
    if doel is None:
        return False
    # het anker moet op de doelpagina bestaan (criterium 35 van de brief navigatie-paginas)
    if "#" in href and doel.suffix == ".html":
        anker = href.split("#", 1)[1]
        if anker and not re.search(r'\bid="' + re.escape(anker) + '"', doel.read_text(encoding="utf-8")):
            return False
    return True

CONTACT_SCHERMEN = {"desktop": (1440, 900, False), "tablet": (768, 1024, True), "mobiel": (390, 844, True)}

# Leest de kleur van de laag, de verwachte kleur van #contact (genormaliseerd naar rgb) en het balklabel
STAND_CONTACT = """() => {
  const norm = k => { const d = document.createElement('div'); d.style.backgroundColor = k; document.body.appendChild(d);
    const c = getComputedStyle(d).backgroundColor; d.remove(); return c; };
  const laag = document.querySelector('.achtergrond');
  const contact = document.querySelector('#contact');
  return [laag ? getComputedStyle(laag).backgroundColor : null,
          contact ? norm(contact.getAttribute('data-achtergrond') || '') : null,
          (document.querySelector('.balk .sectie-label') || {}).textContent || ''];
}"""

def controleer_contact(browser):
    """Ontwerpcriterium 12: na een #contact-link of End kleurt de laag naar #contact en toont de balk Contact."""
    for naam, (b, h, touch) in CONTACT_SCHERMEN.items():
        ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch, reduced_motion="reduce")
        ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
        for pagina in ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "babynest.html", "inspiratie.html"]:
            for manier in ["link", "end"]:
                page = ctx.new_page()
                page.goto(url(pagina), wait_until="load")
                page.wait_for_timeout(400)
                tag = f"{pagina} [{naam}, minder beweging, {manier}]"
                if manier == "link":
                    # een tik op een link naar #contact (bijv. een oude link /#contact of de balk)
                    page.evaluate("""() => { const a = document.createElement('a'); a.href = '#contact'; a.textContent = 'x';
                      a.style.cssText = 'position:fixed;left:0;bottom:0;'; document.body.appendChild(a); a.click(); a.remove(); }""")
                else:
                    page.keyboard.press("End")
                page.wait_for_timeout(1200)
                if manier == "link" and naam == "mobiel" and pagina != "index.html":
                    # kop van het contactblok en de link naar het formulier zonder verder scrollen in beeld
                    # (was: WhatsApp; alle contactmomenten leiden nu naar het formulier, wens Carst 5 nov.)
                    zicht = page.evaluate("""() => ['#contact h2', '#contact a.pijl[href^="contact.html"][href$="#formulier"]'].map(s => {
                      const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })""")
                    if not all(zicht):
                        fouten.append(f"{tag}: na de link naar #contact staan kop en 'Stuur Carien een bericht' niet samen in beeld ({zicht})")
                if pagina == "index.html":
                    # brief 2026-11-06: geen contactblok meer; #contact is een anker in 003 Inspiratie (bij "Stuur Carien een bericht"),
                    # End toont het laatste blok (004 Instagram)
                    label = page.evaluate("() => (document.querySelector('.balk .sectie-label') || {}).textContent || ''")
                    verwacht_label = "003 — Inspiratie" if manier == "link" else "004 — Instagram"
                    if verwacht_label not in " ".join(label.split()):
                        fouten.append(f"{tag}: balk toont '{label.strip()}' in plaats van {verwacht_label}")
                    if manier == "link":
                        zicht = page.evaluate("""() => { const a = document.querySelector('#inspiratie a.pijl[href="contact.html#formulier"]'); if (!a) return false;
                          const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }""")
                        if not zicht:
                            fouten.append(f"{tag}: na de link naar #contact staat 'Stuur Carien een bericht' niet in beeld")
                    page.close()
                    continue
                laag, verwacht, label = page.evaluate(STAND_CONTACT)
                if laag is None or verwacht is None:
                    fouten.append(f"{tag}: .achtergrond of #contact ontbreekt")
                elif laag != verwacht:
                    fouten.append(f"{tag}: laag is {laag}, verwacht {verwacht} (kleur van #contact)")
                if "Contact" not in label:
                    fouten.append(f"{tag}: balk toont '{label.strip()}' in plaats van Contact")
                page.close()
        ctx.close()

# Prijstabel kraamcadeaubox: gegevens volgens CLAUDE.md en docs/ontwerp/bron/prijstabel-oude-site.png
PRIJZEN = ["€ 35", "€ 50", "€ 65", "€ 80"]
PRODUCTEN = {"Knuffel": 1, "Swaddle": 1, "Broekje": 1, "Sjaaltje": 2, "Shirtje": 3, "Douchehandschoen": 3, "Bijtring": 4}  # vanaf welk formaat
AANTALLEN = ["3", "4", "6", "7"]

LEES_PRIJSTABEL = """() => {
  const schoon = s => s.replace(/\\u00a0/g, ' ').replace(/\\u00ad/g, '').replace(/\\s+/g, ' ').trim();
  const kaarten = [...document.querySelectorAll('#formaten .formaten > li.formaat')];
  if (!kaarten.length) return null;
  return kaarten.map(k => [schoon((k.querySelector('.formaat-prijs') || {}).textContent || ''),
    schoon((k.querySelector('.formaat-aantal') || {}).textContent || ''),
    [...k.querySelectorAll('.formaat-lijst > li')].map(li => schoon(li.textContent)),
    (k.querySelector('a.pijl') || {}).getAttribute ? k.querySelector('a.pijl').getAttribute('href') : '']);
}"""

def controleer_prijstabel(browser):
    """Prijskaarten kraamcadeaubox: vier kaarten, juiste prijzen, aantallen en inhoud (opgeteld) en een link naar het formulier."""
    tag = "kraamcadeauboxen.html [prijskaarten]"
    page = browser.new_page()
    page.goto(url("kraamcadeauboxen.html"), wait_until="load")
    stand = page.evaluate(LEES_PRIJSTABEL)
    page.close()
    if stand is None:
        fouten.append(f"{tag}: #formaten bevat geen prijskaarten (.formaten > li.formaat)"); return
    if [k[0] for k in stand] != PRIJZEN:
        fouten.append(f"{tag}: prijzen zijn {[k[0] for k in stand]}, verwacht {PRIJZEN}")
    if [k[1].split(' ')[0] for k in stand] != AANTALLEN:
        fouten.append(f"{tag}: aantallen zijn {[k[1] for k in stand]}, verwacht {AANTALLEN}")
    inhoud = []
    for i, k in enumerate(stand, 1):
        inhoud += k[2]
        verwacht = [n for n, vanaf in PRODUCTEN.items() if vanaf <= i]
        if sorted(inhoud) != sorted(verwacht):
            fouten.append(f"{tag}: box {i} bevat {inhoud}, verwacht {verwacht}")
        if len(inhoud) != int(AANTALLEN[i - 1]):
            fouten.append(f"{tag}: box {i} telt {len(inhoud)} producten, kaart zegt {AANTALLEN[i - 1]}")
        verwacht_link = f"contact.html?onderwerp=kraamcadeaubox&formaat={PRIJZEN[i - 1].split(' ')[1]}#formulier"
        if k[3] != verwacht_link:
            fouten.append(f"{tag}: kaart {i} linkt naar {k[3]!r}, verwacht {verwacht_link} (brief 2026-11-06: formulier vooraf ingevuld)")

# 003 Zo werkt het: één genummerde reeks met deze koppen (brief processtappen, criterium 4)
STAP_KOPPEN = ["Neem contact op", "Kies samen thema en maat", "Carien gaat aan de slag"]
STAPPEN_SCHERMEN = {"desktop": (1440, 900, False), "tablet": (768, 1024, True), "mobiel": (390, 844, True)}

LEES_STAPPEN = """() => {
  const schoon = s => s.replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ').trim();
  const sectie = [...document.querySelectorAll('main section[data-label]')].find(s => s.getAttribute('data-label').includes('003'));
  if (!sectie) return null;
  const lijsten = sectie.querySelectorAll('ol');
  const items = lijsten.length === 1 ? [...lijsten[0].querySelectorAll(':scope > li')] : [];
  const koppen = items.map(li => { const h = li.querySelector('h2, h3'); if (!h) return '';
    const kopie = h.cloneNode(true); kopie.querySelectorAll('br').forEach(br => br.replaceWith(' ')); return schoon(kopie.textContent); });
  return [lijsten.length, items.length, koppen, document.documentElement.scrollWidth];
}"""

def controleer_stappen(browser):
    """Brief processtappen: sectie 003 is één <ol> met drie <li>, juiste koppen, geen horizontaal scrollen."""
    for naam, (b, h, touch) in STAPPEN_SCHERMEN.items():
        ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch)
        ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
        page = ctx.new_page()
        page.goto(url("kraamcadeauboxen.html"), wait_until="load")
        page.wait_for_timeout(400)
        tag = f"kraamcadeauboxen.html [003 Zo werkt het, {naam}]"
        stand = page.evaluate(LEES_STAPPEN)
        ctx.close()
        if stand is None:
            fouten.append(f"{tag}: sectie met data-label 003 ontbreekt"); continue
        lijsten, items, koppen, breedte = stand
        if lijsten != 1:
            fouten.append(f"{tag}: {lijsten} <ol> in de sectie, verwacht precies 1")
        if items != 3:
            fouten.append(f"{tag}: {items} <li> in de lijst, verwacht precies 3")
        if koppen != STAP_KOPPEN:
            fouten.append(f"{tag}: koppen zijn {koppen}, verwacht {STAP_KOPPEN}")
        # vergelijk met de ingestelde breedte b: bij is_mobile groeit innerWidth mee met te brede inhoud
        if breedte > b:
            fouten.append(f"{tag}: pagina scrollt horizontaal (scrollWidth {breedte} > {b})")

# Homepage zoals Stock (brief 2026-11-06): hero, 001 Producten (drieluik), 002 Technieken, 003 Inspiratie, 004 Instagram.
# Vervangt de controle van de vijf productblokken (brief 2026-11-05); de teksten van Babykleding en Siliconen staan
# niet meer letterlijk op de homepage (testaanpassing ter beoordeling door Carst).
DRIELUIK = [("kraamcadeauboxen", "kraamcadeaubox", "Kraamcadeauboxen", "kraamcadeauboxen.html", "#DEB799"),
            ("prematuurkleding", "prematuur", "Prematuurkleding", "prematuurkleding.html", "#C89F67"),
            ("babynest", "babynest", "Babynest", "babynest.html", "#B5969E")]
TECHNIEKEN = [("Warm en persoonlijk", "Belettering", "werkwijze.html#personaliseren", "#C88654"),
              ("Rustig en functioneel", "Siliconen items", "inspiratie.html#siliconen", "#839C75"),
              ("Specifiek en oog voor detail", "Prematuurkleding", "prematuurkleding.html", "#999575"),
              ("Levendig en persoonlijk", "Borduren", "inspiratie.html#textiel", "#AE8C94")]
LICHTE_KLEUREN = {"#DEB799", "#C89F67", "#C3CFBC", "#B5969E", "#B4B19A", "#E0E6E7"}

# Producttekst per blok (letterlijk; was "Wat ik maak" op Werkwijze, sinds 5 nov. alleen op de homepage)
PRODUCTTEKSTEN = {
    'babynest': ('Babynest', 'Een babynest in de stof en kleur die jij kiest.'),
    'prematuur': ('Prematuurkleding', 'Maatwerk in (prematuur)babykleding. Ook prematuurmaten.'),
    'kraamcadeaubox': ('Kraamcadeauboxen', 'Handgemaakte babyproducten in één thema, met naam en geboortedatum. Vanaf € 35.'),
}

def wat_ik_maak():
    return PRODUCTTEKSTEN

def bestandsbreedte(src):
    """Breedte van het bestand in public/ (0 als het niet bestaat)."""
    from PIL import Image
    pad = ROOT / src.lstrip("/")
    return Image.open(pad).size[0] if pad.exists() else 0

LEES_DRIELUIK = r"""() => { const s = document.querySelector('#producten'); if (!s) return null;
  const schoon = t => t.replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
  return { label: s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), kleur: s.getAttribute('data-achtergrond'), hoogte: s.getBoundingClientRect().height,
    kolommen: [...s.querySelectorAll('.kern-kolom')].map(k => { const r = k.getBoundingClientRect(), h = k.querySelector('h2'), hr = h.getBoundingClientRect();
      const img = k.querySelector('.kern-beeld img, .nest-lijst img'), ir = img ? img.getBoundingClientRect() : null;
      const woorden = (() => { const rg = document.createRange(); rg.selectNodeContents(h); return [...rg.getClientRects()].some(x => x.width && (x.right > r.right + 1 || x.left < r.left - 1)); })();
      return { id: k.id, kop: schoon(h.textContent), tekst: [...k.querySelectorAll('p.klein')].map(p => schoon(p.textContent)),
        pijlen: [...k.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.getBoundingClientRect().height, getComputedStyle(a).visibility, parseFloat(getComputedStyle(a).opacity)]),
        breedte: r.width, kleur: getComputedStyle(k).backgroundColor, buiten: woorden,
        img: img ? [img.getAttribute('src'), img.getAttribute('loading'), ir.width, ir.height, ir.bottom <= hr.top + 1, img.naturalWidth || 0, getComputedStyle(img.closest('.kern-beeld, .nest-lijst')).display] : null,
        tabstops: [...k.querySelectorAll('a, button, [tabindex]')].filter(e => e.tabIndex >= 0).length + (k.tabIndex >= 0 ? 1 : 0) }; }) }; }"""

def controleer_home(page, tag, naam):
    """Brief 2026-11-06, criteria 2, 3 en 9 en ontwerpcriteria 1, 6, 8, 12 en 13."""
    d = page.evaluate(LEES_DRIELUIK)
    if not d:
        fouten.append(f"{tag}: sectie #producten (001 — Producten) ontbreekt"); return
    if d["label"] != "001 — Producten" or (d["kleur"] or "").upper() != "#DEB799":
        fouten.append(f"{tag}: drieluik heeft label {d['label']!r} of kleur {d['kleur']} (verwacht 001 — Producten op perzik)")
    bron = wat_ik_maak()
    if [k["id"] for k in d["kolommen"]] != [x[0] for x in DRIELUIK]:
        fouten.append(f"{tag}: kolommen van het drieluik kloppen niet ({[k['id'] for k in d['kolommen']]})"); return
    for k, (id_, anker, kop, doel, kleur) in zip(d["kolommen"], DRIELUIK):
        ktag = f"{tag} [drieluik {kop}]"
        if (k["kop"], k["tekst"]) != (bron[anker][0], [bron[anker][1]]):
            fouten.append(f"{ktag}: kop of tekst klopt niet ({k['kop']!r}, {k['tekst']!r})")
        # (dekking en "in beeld na scrollen" toetst pijl_meer; hier staat de pagina nog bovenaan en zijn de links nog niet opgekomen)
        if [x[0] for x in k["pijlen"]] != [doel] or any(x[1] < 43.5 or x[2] != "visible" for x in k["pijlen"]):
            fouten.append(f"{ktag}: verwacht precies één zichtbare pijl-link (min. 44 px) naar {doel} ({k['pijlen']})")
        if k["tabstops"] != 1:
            fouten.append(f"{ktag}: {k['tabstops']} tabstops in de kolom, verwacht 1")
        if k["buiten"]:
            fouten.append(f"{ktag}: een woord van de kop steekt buiten de kolom")
        # loading=lazy staat in de HTML (controleer_bestanden); met een muis zet main.js de foto's bij het naderen op eager
        if not k["img"]:
            fouten.append(f"{ktag}: foto ontbreekt")
        elif naam != "desktop":
            src, _, b, h, boven, nat, disp = k["img"]
            if disp == "none" or not boven:
                fouten.append(f"{ktag}: op touch staat de foto niet boven de tekst ({k['img']})")
            if nat and b > nat + 0.5:
                fouten.append(f"{ktag}: foto {src} groter getoond ({b:.0f} px) dan het bestand ({nat} px)")
            if id_ == "babynest" and b > 324.5:
                fouten.append(f"{ktag}: babynestfoto breder dan 324 px ({b:.0f})")
    if naam == "desktop":
        breedtes = [round(k["breedte"]) for k in d["kolommen"]]
        if max(breedtes) - min(breedtes) > 1 or d["hoogte"] > 900.5:
            fouten.append(f"{tag}: drieluik niet in drie gelijke kolommen binnen één scherm ({breedtes}, hoogte {d['hoogte']:.0f})")
        kleuren = [norm_kleur(page, x[4]) for x in DRIELUIK[1:]]
        if [k["kleur"] for k in d["kolommen"][1:]] != kleuren:
            fouten.append(f"{tag}: kolom 2 en 3 zijn niet oker en mauve ({[k['kleur'] for k in d['kolommen']]})")
    # 002 Technieken: vier namen als link; op touch vier kaarten met dezelfde doelen
    t = page.evaluate("""() => { const s = document.querySelector('#technieken'); if (!s) return null;
      return [s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), [...s.querySelectorAll('.hoverlijst ul a')].map(a => [a.childNodes[0].textContent.trim(), a.getAttribute('href'), a.dataset.kleur]),
        [...s.querySelectorAll('.sfeer-kaarten a.kaart')].map(a => [a.querySelector('.kaart-naam').textContent.trim(), a.querySelector('.kaart-regel').textContent.trim(), a.getAttribute('href'), a.offsetHeight > 0]),
        [...s.querySelectorAll('.sfeer .productregel')].map(p => p.textContent.trim()), !!s.querySelector('#babykleding'), !!s.querySelector('#siliconen'),
        [...s.querySelectorAll(':scope > .wrap > a.pijl')].map(a => a.getAttribute('href'))]; }""")
    if not t:
        fouten.append(f"{tag}: sectie #technieken ontbreekt")
    else:
        if t[0] != "002 — Technieken" or [x[:2] for x in t[1]] != [[n, h] for n, _, h, _ in TECHNIEKEN] or [x[2] for x in t[1]] != [k for *_, k in TECHNIEKEN]:
            fouten.append(f"{tag}: Technieken klopt niet ({t[:2]})")
        if [x[:3] for x in t[2]] != [[n, r, h] for n, r, h, _ in TECHNIEKEN] or t[3] != [r for _, r, _, _ in TECHNIEKEN]:
            fouten.append(f"{tag}: kaarten of productregels van Technieken kloppen niet ({t[2]}, {t[3]})")
        if naam != "desktop" and not all(x[3] for x in t[2]):
            fouten.append(f"{tag}: op touch staan de kaarten van Technieken niet in beeld")
        if not (t[4] and t[5]):
            fouten.append(f"{tag}: ankers #babykleding en #siliconen horen bovenaan Technieken")
        if t[6] != ["werkwijze.html#personaliseren"]:
            fouten.append(f"{tag}: onder Technieken hoort één pijl-link 'Zo personaliseert Carien' ({t[6]})")
    # 003 Inspiratie: grote foto (lazy), witte kop, links naar Inspiratie en het formulier; #contact als anker
    st = page.evaluate("""() => { const s = document.querySelector('#inspiratie'); if (!s) return null; const i = s.querySelector(':scope > img'), r = i.getBoundingClientRect();
      return [s.matches('.statement'), [...s.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href'), a.getBoundingClientRect().height]), i.getAttribute('loading'),
              r.width, r.height, i.naturalWidth, i.naturalHeight, !!s.querySelector('#contact'), s.getBoundingClientRect().height, (s.querySelector('h2') || {}).textContent, i.getAttribute('src')]; }""")
    if not st:
        fouten.append(f"{tag}: sectie #inspiratie ontbreekt")
    else:
        if [x[:2] for x in st[1]] != [["Bekijk alle inspiratie", "inspiratie.html"], ["Stuur Carien een bericht", "contact.html#formulier"]] or any(x[2] < 43.5 for x in st[1]):
            fouten.append(f"{tag}: Inspiratie hoort 'Bekijk alle inspiratie' en 'Stuur Carien een bericht' te hebben (min. 44 px) ({st[1]})")
        if not st[0] or st[2] != "lazy" or not st[7] or st[9] != "Ieder nieuw leven is bijzonder":
            fouten.append(f"{tag}: Inspiratie is geen grote foto (lazy) met de kop en het anker #contact ({st})")
        bw = bestandsbreedte(st[10]); bh = bw * 1013 / 1800 if bw else 0  # bestand box-hero-wide.jpg: 1800 x 1013 (naturalWidth is bij srcset dichtheidsgecorrigeerd)
        if naam == "desktop" and bw and max(st[3] / bw, st[4] / bh) > 1.001:
            fouten.append(f"{tag}: de Inspiratie-foto wordt vergroot")
        if naam == "mobiel" and st[8] < 560:
            fouten.append(f"{tag}: Inspiratie is op 390 px lager dan 560 px ({st[8]:.0f})")
    # wat verdwenen is, staat niet meer op de homepage; precies één link naar het formulier
    weg = page.evaluate("() => ['.categorie', '.uitgelicht', '.slider', '#over', '.inspiratie-rij', 'form', '.contact-rij'].filter(s => document.querySelector('main ' + s))")
    if weg:
        fouten.append(f"{tag}: deze onderdelen horen niet meer op de homepage: {weg}")
    n = page.evaluate("() => document.querySelectorAll('main a[href=\"contact.html#formulier\"]').length")
    if n != 1:
        fouten.append(f"{tag}: {n} links naar contact.html#formulier in main, verwacht precies 1")

def controleer_home_interactie(browser):
    """Desktop (muis): drieluik bij aanwijzen (foto in, witte tekst min. 4,5:1 op de lichtste plek; babynest max. 324 px en inkt),
    Technieken bij aanwijzen (diepe tint, namen wit, terug na het verlaten), koppen binnen de kolommen op 1025/1280/1440,
    Inspiratie met witte tekst op de sluier (min. 4,5:1)."""
    for b, h in [(1025, 800), (1280, 720), (1440, 900)]:
        ctx, page = nieuwe_pagina(browser, "index.html", b, h)
        d = page.evaluate(LEES_DRIELUIK)
        if any(k["buiten"] for k in d["kolommen"]):
            fouten.append(f"index.html [{b} px]: een woord van een kop in het drieluik steekt buiten de kolom")
        ctx.close()
    ctx, page = nieuwe_pagina(browser, "index.html")
    tag = "index.html [desktop, drieluik aanwijzen]"
    for i, (id_, *_rest) in enumerate(DRIELUIK, 1):
        page.eval_on_selector("#producten", "e => e.scrollIntoView({ block: 'start', behavior: 'instant' })"); page.wait_for_timeout(400)
        r = page.evaluate("id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", id_)
        page.mouse.move(r[0], r[1], steps=3); page.wait_for_timeout(1500)
        kleur = page.evaluate("id => [...document.querySelectorAll('#' + id + ' .kern-tekst h2, #' + id + ' .kern-tekst p, #' + id + ' .kern-tekst a')].map(e => getComputedStyle(e).color)", id_)
        if id_ == "babynest":
            w = page.evaluate("() => document.querySelector('#babynest .nest-lijst img').getBoundingClientRect().width")
            if w > 324.5 or any(k != INKT for k in kleur):
                fouten.append(f"{tag}: babynest: foto {w:.0f} px (max. 324) of tekst niet inkt ({kleur})")
            continue
        if any(k != WIT for k in kleur):
            fouten.append(f"{tag}: kolom {i}: tekst niet wit bij aanwijzen ({kleur})")
        for sel in ["h2", "p.klein", "a.pijl"]:
            c = contrast_wit_over_foto(page, f"#{id_} .kern-tekst {sel}", f"#{id_} .kern-beeld")
            if c is None or c < 4.5:
                fouten.append(f"{tag}: kolom {i}: wit {sel} haalt op de foto {c and round(c, 2)}:1 (min. 4,5:1)")
        page.mouse.move(5, 5); page.wait_for_timeout(300)
    # Technieken: aanwijzen kleurt de laag naar de diepe tint; weg met de muis: binnen 1 s terug naar wit
    page.eval_on_selector("#technieken .hoverlijst", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })"); page.wait_for_timeout(1200)
    for i, (naam_t, regel, doel, diep) in enumerate(TECHNIEKEN, 1):
        page.hover(f"#technieken .hoverlijst li:nth-child({i}) a"); page.wait_for_timeout(1300)
        st = page.evaluate("""i => { const as = [...document.querySelectorAll('#technieken .hoverlijst ul a')];
          return [as.map(a => [getComputedStyle(a).color, getComputedStyle(a).opacity]), getComputedStyle(document.querySelector('#technieken .sfeer.aan .productregel')).fontSize,
                  document.querySelectorAll('#technieken .sfeer.aan img').length]; }""", i)
        if lees_laag(page) != norm_kleur(page, diep) or st[0][i - 1] != [WIT, "1"] or any(x != [WIT, "0.35"] for n, x in enumerate(st[0]) if n != i - 1) or st[1] != "19px" or st[2] != 2:
            fouten.append(f"index.html [desktop, Technieken {naam_t}]: laag {lees_laag(page)} (verwacht {diep}), namen {st[0]}, productregel {st[1]}, foto's {st[2]}")
    page.mouse.move(720, 3, steps=4); page.wait_for_timeout(1200)  # omhoog de lijst uit (de lijst is zo breed als het ontwerpvak)
    if lees_laag(page) != WIT:
        fouten.append(f"index.html [desktop, Technieken]: na het verlaten is de laag {lees_laag(page)}, niet wit")
    # Inspiratie: witte kop en pijl-links op de sluier minstens 4,5:1
    page.eval_on_selector("#inspiratie", "e => e.scrollIntoView({ block: 'start', behavior: 'instant' })"); page.wait_for_timeout(900)
    for sel in ["#inspiratie h2", "#inspiratie a.pijl[href='inspiratie.html']", "#inspiratie a.pijl[href='contact.html#formulier']"]:
        c = contrast_wit_over_foto(page, sel, "#inspiratie")
        if c is None or c < 4.5:
            fouten.append(f"index.html [desktop, Inspiratie]: {sel} haalt op de sluier {c and round(c, 2)}:1 (min. 4,5:1)")
    ctx.close()

# Personaliseren: tabbladen als media-slider (brief stock-pariteit, criterium 14 en 15)
LEES_TABBLAD = """() => {
  const s = document.querySelector('.slider'); const tabs = [...s.querySelectorAll('[role="tab"]')];
  const zichtbaar = e => getComputedStyle(e).visibility === 'visible' && e.getAnimations().length === 0;
  const dias = [...s.querySelectorAll('.dia')].filter(d => getComputedStyle(d).visibility === 'visible').map(d => [d.dataset.i, d.getAnimations().length]);
  const koppen = [...s.querySelectorAll('.techniek')].filter(d => getComputedStyle(d).visibility === 'visible').map(d => [d.dataset.i, d.querySelector('h2').textContent.trim()]);
  return [tabs.map(t => t.getAttribute('aria-selected')), dias, koppen, tabs.map(t => t.textContent.trim())];
}"""

def controleer_tabbladen(page, tag, touch):
    page.eval_on_selector(".slider", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
    page.wait_for_timeout(300)
    if not touch:
        page.hover(".slider [role='tab']:nth-of-type(2)")
        page.wait_for_timeout(400)
        geselecteerd, _, _, _ = page.evaluate(LEES_TABBLAD)
        if geselecteerd[1] == "true":
            fouten.append(f"{tag}: aanwijzen wisselt het tabblad in Personaliseren (alleen klik hoort te wisselen)")
    page.click(".slider [role='tab']:nth-of-type(2)")
    page.wait_for_timeout(1500)
    geselecteerd, dias, koppen, namen = page.evaluate(LEES_TABBLAD)
    if geselecteerd != ["false", "true", "false"]:
        fouten.append(f"{tag}: na een klik op het tweede tabblad is aria-selected {geselecteerd}")
    if dias != [["1", 0]]:
        fouten.append(f"{tag}: na 1,5 s staat in Personaliseren niet alleen de foto van het tweede tabblad stil ({dias})")
    if [k[0] for k in koppen] != ["1"] or koppen[0][1] != namen[1]:
        fouten.append(f"{tag}: na 1,5 s toont Personaliseren niet de kop van het tweede tabblad ({koppen})")
    page.click(".slider [role='tab']:nth-of-type(1)")
    page.wait_for_timeout(1500)

# Hero: de foto's wisselen samen per schermhelft (brief stock-pariteit, criterium 4 en 7)
WISSELEND, VAST = ["t2", "t3", "t4", "t6"], ["t1", "t5"]
LEES_SETS = """() => {
  const uit = {};
  document.querySelectorAll('.hero[data-wissel] .tegel').forEach(t => {
    const c = [...t.classList].find(k => /^t\\d$/.test(k)); const b = t.querySelector('img.set-b');
    uit[c] = b ? (getComputedStyle(b).opacity === '1' ? 'B' : 'A') : 'vast'; });
  const k = document.querySelector('.hero-wissel button[data-set="b"]');
  const kleur = s => getComputedStyle(document.querySelector(s)).color;
  const zicht = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).opacity : null; };
  // tekst in de bovenkant (kop en quote; de lopende regel van Uitgelicht is met dat blok van de homepage verdwenen) en het logo in de header
  const tekst = [kleur('.hero .kop-xl'), kleur('.hero-kleur .quote')];
  return [uit, k ? k.getAttribute('aria-pressed') : null, document.querySelectorAll('.tegel.om, .tegel[role="button"]').length,
          tekst, [zicht('.site-header .logo-wit'), zicht('.site-header .logo-donker')]];
}"""

def controleer_setwissel(page, tag, naam):
    """Desktop: muis op de rechterhelft zet t2, t3, t4, t6 op set B (t1, t5 blijven).
    Mobiel: een tik op "Het cadeau" doet hetzelfde en zet aria-pressed goed."""
    b, h = SCHERMEN[naam]
    if naam == "mobiel":
        page.tap(".hero-wissel button[data-set='b']")
    else:
        page.mouse.move(b * 0.25, h * 0.5); page.wait_for_timeout(100)
        page.mouse.move(b * 0.8, h * 0.5, steps=4)
    page.wait_for_timeout(1500)  # kleur- en logowissel duren 1,2 s
    sets, gedrukt, oud, tekst, logo = page.evaluate(LEES_SETS)
    if any(t != "rgb(32, 32, 32)" for t in tekst):
        fouten.append(f"{tag}: in set B is de tekst in de bovenkant niet inkt ({tekst})")
    if logo != ["0", "1"]:
        fouten.append(f"{tag}: in set B staat niet het donkere logo in de header (opacity wit/donker = {logo})")
    if [sets.get(t) for t in WISSELEND] != ["B"] * 4 or [sets.get(t) for t in VAST] != ["vast"] * 2:
        fouten.append(f"{tag}: setwissel klopt niet, tegels staan op {sets} (verwacht t2, t3, t4, t6 op B; t1, t5 vast)")
    if naam == "mobiel" and gedrukt != "true":
        fouten.append(f"{tag}: 'Het cadeau' heeft na een tik aria-pressed={gedrukt}, verwacht true")
    if oud:
        fouten.append(f"{tag}: er zijn nog {oud} tegels die omdraaien of als knop werken")
    # terug naar set A
    if naam == "mobiel":
        page.tap(".hero-wissel button[data-set='a']")
    else:
        page.mouse.move(b * 0.25, h * 0.5, steps=4)
    page.wait_for_timeout(1500)
    sets, _, _, tekst, logo = page.evaluate(LEES_SETS)
    if tekst[0] != "rgb(255, 255, 255)" or logo != ["1", "0"]:
        fouten.append(f"{tag}: terug in set A is de kop niet wit of het logo niet wit ({tekst[0]}, {logo})")
    if [sets.get(t) for t in WISSELEND] != ["A"] * 4:
        fouten.append(f"{tag}: terug naar set A lukt niet, tegels staan op {sets}")

def controleer_tablet(browser):
    """Geen horizontaal scrollen op 768 px (touch), ook niet na een wissel in Personaliseren."""
    ctx = browser.new_context(viewport={"width": 768, "height": 1024}, has_touch=True, is_mobile=True)
    ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
    for pagina in PAGINAS:
        page = ctx.new_page()
        page.goto(url(pagina), wait_until="load")
        page.wait_for_timeout(400)
        if pagina == "index.html":
            controleer_home(page, f"{pagina} [tablet]", "tablet")
        page.screenshot(path=str(SHOTS / f"{pagina.replace('.html','')}-tablet.png"), full_page=True)
        if page.query_selector(".slider [role='tab']"):
            page.eval_on_selector(".slider", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
            page.tap(".slider [role='tab']:nth-of-type(3)")
            page.wait_for_timeout(600)
        breedte = page.evaluate("document.documentElement.scrollWidth")
        if breedte > 768:
            fouten.append(f"{pagina} [tablet]: pagina scrollt horizontaal (scrollWidth {breedte} > 768)")
        page.close()
    ctx.close()

# Caching: CSS en JS mogen niet lang vastzitten zonder hercontrole (anders ziet een
# terugkerende bezoeker na een release nog een week de oude opmaak en scripts)
def cache_te_lang(waarde):
    """True als een Cache-Control-waarde lang cachet zonder hercontrole."""
    w = waarde.lower()
    m = re.search(r"max-age=(\d+)", w)
    return bool(m and int(m.group(1)) > 0 and "must-revalidate" not in w and "no-cache" not in w)

def controleer_headers():
    regels = (ROOT / "_headers").read_text(encoding="utf-8").splitlines()
    pad, gevonden = None, {}
    for r in regels:
        if r and not r[0].isspace():
            pad = r.strip()
        elif pad and r.strip().lower().startswith("cache-control:"):
            gevonden[pad] = r.split(":", 1)[1].strip()
    for pad in ["/assets/css/*", "/assets/js/*"]:
        waarde = gevonden.get(pad)
        if waarde is None:
            fouten.append(f"_headers: geen Cache-Control voor {pad}")
        elif cache_te_lang(waarde):
            fouten.append(f"_headers: {pad} cachet lang zonder hercontrole ({waarde}); gebruik max-age=0, must-revalidate")

# =====================================================================
# Navigatie (brief 2026-11-05-homepage-producten): Werkwijze · Kraamcadeauboxen · Prematuurkleding · Babynest · Inspiratie · Contact
# (vervangt de controles van navigatie-v2 met vijf items en Portfolio)
# =====================================================================
INTRO_WEG = "try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}"
HOOFDMENU = [("Werkwijze", "werkwijze"), ("Kraamcadeauboxen", "kraamcadeauboxen"), ("Prematuurkleding", "prematuurkleding"), ("Babynest", "babynest"), ("Inspiratie", "inspiratie"), ("Contact", "contact")]
HEADER_VANAF = 1280  # gemeten: vanaf deze breedte passen de zes links naast het logo (logo krimpt niet)
MENU_SUBS = [("Het atelier", "werkwijze#atelier"), ("Hoe ik werk", "werkwijze#hoe-ik-werk"), ("Personaliseren", "werkwijze#personaliseren"), 
             ("Thema's", "kraamcadeauboxen#themas"), ("Formaten en prijzen", "kraamcadeauboxen#formaten"), ("Zo werkt het", "kraamcadeauboxen#werkwijze"),
             ("Kleding", "inspiratie#kleding"), ("Knuffels, swaddles en babynest", "inspiratie#textiel"), ("Siliconen en hangers", "inspiratie#siliconen"), ("Kraamcadeauboxen", "inspiratie#boxen")]
INKT = "rgb(32, 32, 32)"
WIT = "rgb(255, 255, 255)"

def nieuwe_pagina(browser, pagina, b=1440, h=900, touch=False, **extra):
    ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch, **extra)
    ctx.add_init_script(INTRO_WEG)
    page = ctx.new_page()
    page.goto(url(pagina), wait_until="load")
    page.wait_for_timeout(500)
    return ctx, page

def schoon_doel(href):
    """'werkwijze.html#x' of '/werkwijze' -> 'werkwijze'"""
    return href.split("#")[0].split("?")[0].lstrip("/").replace(".html", "")

def controleer_bestanden():
    """Criteria 4 en 5: _redirects (301 rechtstreeks naar het eindadres), sitemap, canonicals, oude pagina's weg."""
    regels = {}
    for r in (ROOT / "_redirects").read_text(encoding="utf-8").splitlines():
        d = r.split()
        if len(d) >= 3 and not r.startswith("#"):
            regels[d[0]] = (d[1], d[2])
    verwacht = {"/producten": "/", "/producten.html": "/", "/over": "/werkwijze", "/over.html": "/werkwijze", "/over-lux": "/werkwijze",
                "/kraamcadeaubox": "/kraamcadeauboxen", "/kraamcadeaubox.html": "/kraamcadeauboxen", "/aanbod": "/kraamcadeauboxen", "/aanbod/": "/kraamcadeauboxen",
                "/shop": "/kraamcadeauboxen", "/product-page/*": "/kraamcadeauboxen", "/klantenservice": "/contact", "/account/*": "/",
                "/portfolio": "/inspiratie", "/portfolio.html": "/inspiratie"}
    for pad, doel in verwacht.items():
        if regels.get(pad) != (doel, "301"):
            fouten.append(f"_redirects: {pad} hoort 301 naar {doel} te gaan ({regels.get(pad)})")
    for pad, (doel, _) in regels.items():  # geen tussenstap: het doel is zelf geen bron van een regel
        if doel in regels or doel.rstrip("/") + ".html" in regels:
            fouten.append(f"_redirects: {pad} -> {doel} heeft een tussenstap")
    for pad in ["/contact", "/werkwijze", "/kraamcadeauboxen", "/prematuurkleding", "/babynest", "/inspiratie"]:
        if pad in regels:
            fouten.append(f"_redirects: er staat een regel voor {pad}; die blokkeert de pagina")
    for oud in OUDE_PAGINAS:
        if (ROOT / oud).exists():
            fouten.append(f"public/{oud} bestaat nog (hoort verwijderd te zijn; het oude adres geeft 301)")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    locs = re.findall(r"<loc>https://www\.luxmini\.nl([^<]*)</loc>", sitemap)
    if sorted(locs) != sorted(["/", "/werkwijze", "/kraamcadeauboxen", "/prematuurkleding", "/babynest", "/inspiratie", "/contact", "/privacy"]):
        fouten.append(f"sitemap.xml: adressen zijn {locs}")
    for pagina in HOOFDPAGINAS[1:]:
        html = (ROOT / pagina).read_text(encoding="utf-8")
        schoon = pagina.replace(".html", "")
        for patroon in [f'<link rel="canonical" href="https://www.luxmini.nl/{schoon}">', f'<meta property="og:url" content="https://www.luxmini.nl/{schoon}">']:
            if patroon not in html:
                fouten.append(f"{pagina}: canonical of og:url met het schone adres ontbreekt ({patroon})")
        if not re.search(r"<title>[^<]+</title>", html) or 'name="description"' not in html:
            fouten.append(f"{pagina}: eigen <title> of meta description ontbreekt")
    for f in (PROJECT / "src").glob("*.js"):
        tekst = f.read_text(encoding="utf-8")
        if "/?verzonden=fout#contact" in tekst or "'/#contact'" in tekst:
            fouten.append(f"src/{f.name}: verwijst nog naar het oude formulier op de homepage")
    if "<form" in (ROOT / "index.html").read_text(encoding="utf-8"):
        fouten.append("index.html: er staat nog een <form> op de homepage (hoort alleen op contact.html)")
    # criterium 9 en 24: LET OP bij de prijs en bij de tijdelijke foto op Prematuurkleding
    prem = (ROOT / "prematuurkleding.html").read_text(encoding="utf-8")
    if not re.search(r"<!--\s*LET OP:[^>]*prijs[^>]*-->\s*<p[^>]*>Prijsrichtlijn: \[prijs\]</p>", prem):
        fouten.append("prematuurkleding.html: 'Prijsrichtlijn: [prijs]' staat er niet met een LET OP-opmerking ervoor")
    if not re.search(r"<!--\s*LET OP:[^>]*tijdelijke foto[^>]*-->\s*<div class=\"categorie-foto\"><img src=\"assets/img/p-broekje-kleur", prem):
        fouten.append("prematuurkleding.html: de tijdelijke foto p-broekje-kleur heeft geen LET OP-opmerking")
    nest = (ROOT / "babynest.html").read_text(encoding="utf-8")
    if not re.search(r"<!--\s*LET OP:[^>]*prijs[^>]*-->\s*<p[^>]*>Prijsrichtlijn: \[prijs\]</p>", nest):
        fouten.append("babynest.html: 'Prijsrichtlijn: [prijs]' staat er niet met een LET OP-opmerking ervoor")
    if not re.search(r"<!--\s*LET OP:[^>]*-->\s*<p class=\"quote pagina-quote\">Een babynest in de stof en kleur die jij kiest\.</p>", nest):
        fouten.append("babynest.html: de kop 'Een babynest in de stof en kleur die jij kiest.' heeft geen LET OP-opmerking")
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    if not re.search(r"<!--\s*LET OP:[^>]*tijdelijke foto[^>]*-->\s*<div class=\"kern-beeld\"><div class=\"kern-masker\"><img src=\"assets/img/p-broekje-kleur", home):
        fouten.append("index.html: de tijdelijke foto p-broekje-kleur bij Prematuurkleding heeft geen LET OP-opmerking")
    # brief 2026-11-06, criterium 14: LET OP bij nieuwe teksten (drieluik, Technieken met Borduren, Inspiratie), de babynestfoto,
    # de douchehandschoen en de nieuwe formuliervelden; het label "001 — Producten" is goedgekeurd (Carst, 6 nov.)
    for id_ in ["kraamcadeauboxen", "prematuurkleding", "babynest", "technieken", "inspiratie"]:
        blok = re.search(r'<section id="' + id_ + r'".*?</section>', home, re.S)
        if not blok or "LET OP" not in blok.group(0):
            fouten.append(f"index.html: sectie #{id_} zonder LET OP-opmerking")
    if not re.search(r"<!--\s*LET OP:[^>]*Levendig en persoonlijk[^>]*Borduren", home, re.S):
        fouten.append("index.html: bij Technieken ontbreekt de LET OP over 'Levendig en persoonlijk' (Borduren)")
    drie = re.search(r'<section id="producten".*?\n</section>', home, re.S)
    if not drie or re.search(r'<img(?![^>]*loading="lazy")[^>]*>', drie.group(0)):
        fouten.append("index.html: niet alle foto's in het drieluik hebben loading=\"lazy\"")
    if not re.search(r"<!--\s*LET OP:[^>]*-->\s*<div class=\"nest-lijst\">", home):
        fouten.append("index.html: de babynestfoto in het drieluik heeft geen LET OP-opmerking")
    box = (ROOT / "kraamcadeauboxen.html").read_text(encoding="utf-8")
    if not re.search(r"<!--\s*LET OP:[^>]*douchehandschoen[^>]*-->\s*<li class=\"product\"><div class=\"product-tekening\">", box):
        fouten.append("kraamcadeauboxen.html: de douchehandschoen (lijntekening) heeft geen LET OP-opmerking")
    if "Douchehandschoen" not in (PROJECT / "docs" / "fotolijst.md").read_text(encoding="utf-8"):
        fouten.append("docs/fotolijst.md: de opname 'Douchehandschoen' ontbreekt")
    contact = (ROOT / "contact.html").read_text(encoding="utf-8")
    for stuk in ["prematuurkleding", "babynest", "kledingmaat"]:
        if not re.search(r"<!--\s*LET OP:[^>]*" + stuk, contact, re.I):
            fouten.append(f"contact.html: de formuliervelden voor {stuk} hebben geen LET OP-opmerking")

LEES_HEADER = """() => { const l = document.querySelector('.site-header .logo').getBoundingClientRect();
  return [[...document.querySelectorAll('.site-header .menu a')].map(a => { const r = a.getBoundingClientRect();
    return [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('aria-current'), getComputedStyle(a).display !== 'none' && r.height > 0, Math.round(r.top), Math.round(r.left)]; }), Math.round(l.right)]; }"""

def controleer_navigatie(browser):
    """Criterium 4: zes links op één regel vanaf HEADER_VANAF (daaronder alleen de burger, nergens een tweede regel),
    aria-current, menu met subitems overal gelijk, ankers met de kop in beeld, menu zonder scrollen, tikdoelen 44 px."""
    menus = {}
    for pagina in PAGINAS:
        ctx, page = nieuwe_pagina(browser, pagina)
        tag = f"{pagina} [navigatie]"
        links, logo = page.evaluate(LEES_HEADER)
        if [(t, schoon_doel(h)) for t, h, *_ in links] != HOOFDMENU or not all(l[3] for l in links):
            fouten.append(f"{tag}: header heeft niet precies Werkwijze, Kraamcadeauboxen, Prematuurkleding, Babynest, Inspiratie en Contact als zichtbare links ({[l[:2] for l in links]})")
        elif len({l[4] for l in links}) != 1 or min(l[5] for l in links) <= logo:
            fouten.append(f"{tag}: op 1440 px staan de zes links niet op één regel naast het logo ({links})")
        if any("#" in l[1] for l in links):
            fouten.append(f"{tag}: een hoofdlink in de header is een anker")
        huidig = [schoon_doel(l[1]) for l in links if l[2] == "page"]
        verwacht = [pagina.replace(".html", "")] if pagina.replace(".html", "") in dict((s, 1) for _, s in HOOFDMENU) else []
        if huidig != verwacht:
            fouten.append(f"{tag}: aria-current staat op {huidig}, verwacht {verwacht}")
        alle_current = page.evaluate("() => [...document.querySelectorAll('[aria-current]')].map(a => a.closest('.site-header, .menu-rij') ? 'header' : 'elders')")  # brief 2026-11-06: ook de menu-rij naast de burger
        if any(c != "header" for c in alle_current):
            fouten.append(f"{tag}: aria-current staat ook buiten de hoofdnavigatie (bijv. op een subitem met dezelfde naam)")
        if huidig:
            stijl = page.eval_on_selector('.site-header .menu a[aria-current="page"]', "a => [getComputedStyle(a).textDecorationLine, getComputedStyle(a).textUnderlineOffset]")
            if "underline" not in stijl[0] or stijl[1] != "6px":
                fouten.append(f"{tag}: de huidige pagina is niet onderstreept met 6 px afstand ({stijl})")
        menus[pagina] = page.eval_on_selector_all("#menu-scherm a", "els => els.map(a => [a.textContent.trim(), a.getAttribute('href')])")
        ctx.close()
    # vanaf HEADER_VANAF één regel naast het logo (logo op volle breedte, links vóór de burger); daaronder alleen de burger
    for b, h in [(HEADER_VANAF, 800), (1366, 768), (1920, 1080), (HEADER_VANAF - 1, 800), (1024, 768), (768, 1024)]:
        for pagina in ["index.html", "prematuurkleding.html", "inspiratie.html", "contact.html"]:
            ctx, page = nieuwe_pagina(browser, pagina, b, h)
            links, logo = page.evaluate(LEES_HEADER)
            zichtbaar = [l for l in links if l[3]]
            extra = page.evaluate("""() => { const l = document.querySelector('.site-header .logo img').getBoundingClientRect(), bu = document.querySelector('.burger').getBoundingClientRect();
              const as = [...document.querySelectorAll('.site-header .menu a')].filter(a => a.getBoundingClientRect().height > 0);
              return [Math.round(l.width), as.length ? Math.round(Math.max(...as.map(a => a.getBoundingClientRect().right))) : 0, Math.round(bu.left), document.documentElement.scrollWidth]; }""")
            if b >= HEADER_VANAF and (len(zichtbaar) != 6 or len({l[4] for l in zichtbaar}) != 1 or min(l[5] for l in zichtbaar) <= logo or extra[1] > extra[2] or extra[0] < 110 or extra[3] > b):
                fouten.append(f"{pagina} [{b} px]: de zes links staan niet op één regel tussen het volle logo en de burger ({links}, logo/rechts/burger/breedte {extra})")
            if b < HEADER_VANAF and (zichtbaar or not page.is_visible(".burger")):
                fouten.append(f"{pagina} [{b} px]: er horen alleen de burger en geen headerlinks te staan ({zichtbaar})")
            ctx.close()
    norm = lambda m: [(t, schoon_doel(h) + ("#" + h.split("#")[1] if "#" in h else "")) for t, h in m]
    basis = norm(menus["index.html"])
    for pagina, m in menus.items():
        if norm(m) != basis:
            fouten.append(f"{pagina} [navigatie]: het menu over het hele scherm wijkt af van dat op de homepage")
    hoofd = [(t, schoon_doel(h)) for t, h in menus["index.html"] if "#" not in h and not h.startswith(("http", "tel:", "mailto:"))]
    if hoofd != HOOFDMENU:
        fouten.append(f"index.html [navigatie]: hoofditems in het menu kloppen niet ({hoofd})")
    subs = [(t, schoon_doel(h) + "#" + h.split("#")[1]) for t, h in menus["index.html"] if "#" in h]
    if subs != MENU_SUBS:
        fouten.append(f"index.html [navigatie]: subitems in het menu kloppen niet ({subs})")
    if any(t == "De kraamcadeaubox" for t in page_tekst_menu_koppen()):
        fouten.append("index.html [navigatie]: het blok 'De kraamcadeaubox' staat nog in de rechterkolom van het menu")
    # 1440 x 900: alle hoofditems en subitems zonder scrollen in beeld; subitems 16 px Libre Caslon Text, 24 px ingesprongen
    ctx, page = nieuwe_pagina(browser, "index.html", reduced_motion="reduce")
    page.click(".burger"); page.wait_for_timeout(500)
    st = page.evaluate("""() => { const m = document.getElementById('menu-scherm');
      const as = [...m.querySelectorAll('.menu-nav a')]; const z = a => { const r = a.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      const hoofd = m.querySelector('.menu-nav > ul > li > a').getBoundingClientRect().left, sub = m.querySelector('.menu-sub a');
      return [as.length, as.filter(a => !z(a)).map(a => a.textContent.trim()), m.scrollHeight - m.clientHeight,
              Math.round(sub.getBoundingClientRect().left - hoofd), getComputedStyle(sub).fontSize, getComputedStyle(sub).fontFamily.split(',')[0]]; }""")
    if st[0] != 16 or st[1] or st[2] > 0:  # 6 hoofditems + 10 subitems (Wat ik maak is weg)
        fouten.append(f"index.html [1440 x 900, menu]: niet alle hoofd- en subitems staan zonder scrollen in beeld ({st[:3]})")
    if abs(st[3] - 24) > 2 or st[4] != "16px" or "Libre Caslon Text" not in st[5]:
        fouten.append(f"index.html [1440 x 900, menu]: subitems niet 24 px ingesprongen in Libre Caslon Text 16 px ({st[3:]})")
    ctx.close()
    # elk subitem landt op het juiste anker met de kop van die sectie in beeld (1440 x 900)
    ctx, page = nieuwe_pagina(browser, "index.html", reduced_motion="reduce")
    for t, h in menus["index.html"]:
        if "#" not in h:
            continue
        page.click(".burger"); page.wait_for_timeout(400)
        page.click(f"#menu-scherm a[href='{h}']")
        page.wait_for_load_state("load"); page.wait_for_timeout(900)
        anker = h.split("#")[1]
        stand = page.evaluate("""a => { const s = document.getElementById(a); if (!s) return null;
          const k = s.querySelector('h1, h2, .label'); const r = (k || s).getBoundingClientRect();
          return [location.hash, r.top >= 0 && r.top < innerHeight - 40]; }""", anker)
        if not stand or stand[0] != "#" + anker or not stand[1]:
            fouten.append(f"menu-subitem {t} -> {h}: komt niet op het anker uit met de kop in beeld ({stand})")
    ctx.close()
    # mobiel: zes hoofditems en WhatsApp zonder scrollen in beeld, subitems verborgen
    ctx, page = nieuwe_pagina(browser, "index.html", 390, 844, True, reduced_motion="reduce")
    page.click(".burger"); page.wait_for_timeout(500)
    zicht = page.evaluate("""() => {
      const z = e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      return [[...document.querySelectorAll('.menu-nav > ul > li > a')].map(z), z(document.querySelector('.menu-kolom a[href^="https://wa.me"]')),
              [...document.querySelectorAll('.menu-sub a')].some(a => a.getBoundingClientRect().height > 0)]; }""")
    if not all(zicht[0]) or len(zicht[0]) != 6 or not zicht[1]:
        fouten.append(f"index.html [mobiel, menu]: zes hoofditems en WhatsApp staan niet zonder scrollen in beeld ({zicht})")
    if zicht[2]:
        fouten.append("index.html [mobiel, menu]: subitems horen op mobiel verborgen te zijn")
    ctx.close()
    # tikdoelen op touch (390 en 768): header, burger, balk, menu over het hele scherm en footer minimaal 44 px
    for b, h in [(390, 844), (768, 1024)]:
        for pagina in ["index.html", "babynest.html"]:
            ctx, page = nieuwe_pagina(browser, pagina, b, h, True, reduced_motion="reduce")
            meet = """sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 20) || e.className, Math.round(r.width), Math.round(r.height)]; }).filter(x => x[1] > 0 && x[2] > 0)"""
            klein = []
            for sel in [".site-header a", ".burger", ".site-footer a"]:
                klein += [x for x in page.evaluate(meet, sel) if x[2] < 44 or (sel == ".burger" and x[1] < 44)]
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)"); page.wait_for_timeout(500)
            klein += [x for x in page.evaluate(meet, ".balk a") if x[2] < 44]
            page.click(".burger"); page.wait_for_timeout(500)
            klein += [x for x in page.evaluate(meet, "#menu-scherm a, .burger") if x[2] < 44]
            if klein:
                fouten.append(f"{pagina} [{b} px, touch]: tikdoelen lager of smaller dan 44 px: {klein[:5]}")
            ctx.close()

def page_tekst_menu_koppen():
    return re.findall(r'<p class="menu-kop">([^<]+)</p>', (ROOT / "index.html").read_text(encoding="utf-8"))

# pijl-links op de homepage die zonder aanwijzen zichtbaar moeten zijn (min. 44 px, dekking 1, in beeld na scrollen)
HOME_PIJLEN = [("#" + i, None, d) for i, _, _, d, _ in DRIELUIK] + [("#technieken", "Zo personaliseert Carien", "werkwijze.html#personaliseren"),
              ("#inspiratie", "Bekijk alle inspiratie", "inspiratie.html"), ("#inspiratie", "Stuur Carien een bericht", "contact.html#formulier")]

def pijl_meer(page, tag):
    """Elke pijl-link in de productblokken, Inspiratie en contact is zichtbaar zonder aanwijzen, min. 44 px en gaat naar het juiste doel."""
    for sectie, tekst, doel in HOME_PIJLEN:
        zoek = f"() => [...document.querySelectorAll('{sectie} a.pijl')].find(a => {'true' if tekst is None else repr(tekst) + ' === a.textContent.trim()'})"
        page.evaluate(f"() => {{ const a = ({zoek})(); if (a) a.scrollIntoView({{ block: 'center', behavior: 'instant' }}); }}")
        page.wait_for_timeout(1300)  # opkomen bij scrollen duurt 0,9 s
        st = page.evaluate(f"""() => {{ const a = ({zoek})();
          if (!a) return null; const c = getComputedStyle(a), r = a.getBoundingClientRect();
          let o = 1; for (let e = a; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
          return [a.getAttribute('href'), r.height, c.visibility, o, r.width, r.top >= 0 && r.bottom <= innerHeight]; }}""")
        if not st:
            fouten.append(f"{tag}: pijl-link {tekst or ''} ontbreekt in {sectie}"); continue
        href, hoogte, zicht, dekking, breedte, inbeeld = st
        if href != doel or hoogte < 43.5 or zicht != "visible" or float(dekking) < 1 or breedte == 0 or not inbeeld:
            fouten.append(f"{tag}: pijl-link in {sectie} niet goed zichtbaar, te laag of verkeerd doel ({st})")

HOME_LABELS = ["001 — Producten", "002 — Technieken", "003 — Inspiratie", "004 — Instagram"]

def controleer_algemeen(page, tag, pagina, naam):
    """Per pagina en scherm: data-labels, pijl-links 44 px, lopende tekst 16 px, homepage-opbouw."""
    if page.query_selector(".balk"):
        zonder = page.evaluate("() => [...document.querySelectorAll('main > section')].filter(s => !s.hasAttribute('data-label')).length")
        if zonder:
            fouten.append(f"{tag}: {zonder} sectie(s) zonder data-label")
    laag = page.evaluate("""() => [...document.querySelectorAll('main a.pijl, main a[href^="#"]')].filter(a => a.offsetParent !== null && getComputedStyle(a).visibility === 'visible')
      .map(a => [a.textContent.trim(), a.getBoundingClientRect().height]).filter(x => x[1] < 43.5)""")
    if laag:
        fouten.append(f"{tag}: pijl-links of ankerlinks lager dan 44 px: {laag[:4]}")
    klein = page.evaluate("""() => [...document.querySelectorAll('main p.klein, main .verhaal, main .hoe-copy, main .gegevens-kolom p, main .pagina-prijs, main .werk figcaption')]
      .filter(p => p.offsetParent !== null && parseFloat(getComputedStyle(p).fontSize) < 16).map(p => p.textContent.trim().slice(0, 30))""")
    if klein:
        fouten.append(f"{tag}: lopende tekst kleiner dan 16 px: {klein[:3]}")
    if pagina == "index.html":
        # brief 2026-11-06: hero, 001 Producten, 002 Technieken, 003 Inspiratie, 004 Instagram
        labels = page.evaluate("() => [...document.querySelectorAll('main [data-label]')].map(e => e.getAttribute('data-label').replace(/<[^>]+>/g, '').trim())")
        zicht = page.evaluate("() => [...document.querySelectorAll('main .label')].map(e => e.textContent.replace(/\\s+/g, ' ').trim())")
        if labels != ["— LUX mini"] + HOME_LABELS or not page.query_selector("main > section:first-child .hero[data-wissel]"):
            fouten.append(f"{tag}: volgorde van de secties is {labels}, verwacht de hero en dan {HOME_LABELS}")
        if zicht != HOME_LABELS:
            fouten.append(f"{tag}: zichtbare labels zijn {zicht}")
        hrefs = page.evaluate("""() => [...document.querySelectorAll('main a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')])""")
        for tekst, doel in [("Over Carien", "werkwijze.html#atelier"), ("Bekijk alle inspiratie", "inspiratie.html"), ("Stuur Carien een bericht", "contact.html#formulier")]:
            gevonden = [h for t, h in hrefs if t == tekst]
            if len(gevonden) != 1 or gevonden[0] != doel:
                fouten.append(f"{tag}: '{tekst}' gaat naar {gevonden}, verwacht één keer {doel}")
        for anker in ["contact", "inspiratie", "kraamcadeaubox", "prematuur", "babynest", "babykleding", "siliconen"]:
            if not page.query_selector(f"#{anker}"):
                fouten.append(f"{tag}: id='{anker}' ontbreekt op de homepage (oude links)")
        controleer_home(page, tag, naam)
        pijl_meer(page, tag)
        page.evaluate("window.scrollTo(0, 0)")

def lees_laag(page):
    return page.evaluate("getComputedStyle(document.querySelector('.achtergrond')).backgroundColor")

def norm_kleur(page, k):
    return page.evaluate("k => { const d = document.createElement('div'); d.style.color = k; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }", k)

# Witte tekst over een foto: verberg de tekst, lees de pixels onder de tekst en reken het contrast met wit uit
# (95e percentiel van de helderheid, dus de lichtste plekken tellen). Zonder extra Python-pakketten: de browser decodeert.
CONTRAST_JS = """async ([png, rand]) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data;
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = []; for (let i = 0; i < d.length; i += 16) L.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
  L.sort((a, b) => a - b); const p = L[Math.floor(L.length * 0.95)];
  return 1.05 / (p + 0.05); }"""

def contrast_wit_over_foto(page, tekst_sel, foto_sel):
    import base64
    vak = page.evaluate("""([t, f]) => { const a = document.querySelector(t).getBoundingClientRect(), b = document.querySelector(f).getBoundingClientRect();
      const x = Math.max(a.left, b.left), y = Math.max(a.top, b.top), r = Math.min(a.right, b.right), o = Math.min(a.bottom, b.bottom);
      return r - x > 4 && o - y > 4 ? { x, y, width: r - x, height: o - y } : null; }""", [tekst_sel, foto_sel])
    if not vak:
        return None  # de tekst ligt niet over de foto
    page.evaluate("s => document.querySelector(s).style.visibility = 'hidden'", tekst_sel)
    png = base64.b64encode(page.screenshot(clip=vak)).decode()
    page.evaluate("s => document.querySelector(s).style.visibility = ''", tekst_sel)
    return page.evaluate(CONTRAST_JS, [png, 0])

LEES_TABS_SLIDER = "() => [...document.querySelectorAll('.slider [role=\"tab\"]')].map(t => t.getAttribute('aria-selected'))"
MAAK_RIJEN = [("babykleding", "inspiratie.html#kleding"), ("siliconen", "inspiratie.html#siliconen"), ("babynest", "babynest.html"),
              ("prematuur", "prematuurkleding.html"), ("kraamcadeaubox", "kraamcadeauboxen.html")]

def controleer_werkwijze(browser):
    """Criterium 7 (en de oude Over-controles): kop, verhaal, Hoe ik werk, slider en Wat ik maak."""
    ctx, page = nieuwe_pagina(browser, "werkwijze.html")
    tag = "werkwijze.html [desktop]"
    links, rechts, w, h = page.evaluate("""() => { const f = document.querySelector('.over-kop-foto').getBoundingClientRect();
      return [f.left, document.documentElement.clientWidth - f.right, f.width, f.height]; }""")
    if abs(links - rechts) > 8 or abs(w - 480) > 2 or abs(h - 720) > 2:
        fouten.append(f"{tag}: kopfoto niet gecentreerd of niet 480 x 720 ({links:.0f}/{rechts:.0f}, {w:.0f} x {h:.0f})")
    lcp = page.evaluate("() => { const i = document.querySelector('.over-kop-foto img'); return [i.getAttribute('fetchpriority'), !!i.getAttribute('srcset'), i.getAttribute('loading')]; }")
    if lcp[0] != "high" or not lcp[1] or lcp[2] == "lazy":
        fouten.append(f"{tag}: de kopfoto is niet de LCP-afbeelding met fetchpriority=high en srcset ({lcp})")
    kop = page.evaluate("() => [document.querySelector('h1').textContent.trim(), document.querySelector('.over-kop .kop-xl').textContent.replace(/\\s+/g, ' ').trim()]")
    if kop != ["Werkwijze", "Van de eerste pakjes voor haar kleinkinderen tot maatwerk voor jou"]:
        fouten.append(f"{tag}: h1 of kop klopt niet ({kop})")
    c = contrast_wit_over_foto(page, ".over-kop .kop-xl", ".over-kop-foto")
    if c is not None and c < 3:
        fouten.append(f"{tag}: de witte kop over de foto haalt maar {c:.2f}:1 (minimaal 3:1)")
    if page.evaluate("() => /review|★/i.test(document.querySelector('main').textContent)"):
        fouten.append("werkwijze.html: er staat iets dat op een review lijkt")
    verhaal = page.inner_text(".verhaal")
    if "moeder van twee dochters en oma van vier kleinkinderen" not in verhaal or "net iets anders en persoonlijks." not in verhaal:
        fouten.append("werkwijze.html: het verhaal van Carien is niet de bestaande tekst")
    secties = page.evaluate("() => [...document.querySelectorAll('main > section')].map(s => [s.id, s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()])")
    if secties != [["", "— Werkwijze"], ["atelier", "001 — Het atelier"], ["hoe-ik-werk", "002 — Hoe ik werk"], ["personaliseren", "003 — Personaliseren"], ["contact", "004 — Contact"]]:
        fouten.append(f"{tag}: volgorde of labels van de secties kloppen niet ({secties})")
    # criterium 7: geen dubbele onderdelen (wat van de homepage verhuisde staat er alleen als het er nog niet stond) en geen lege secties
    dubbel = page.evaluate("""() => { const tel = s => document.querySelectorAll('main ' + s).length;
      const koppen = [...document.querySelectorAll('main h2')].map(h => h.textContent.replace(/\\s+/g, ' ').trim());
      const quotes = [...document.querySelectorAll('main .quote')].map(q => q.textContent.trim());
      const leeg = [...document.querySelectorAll('main > section')].filter(s => !s.innerText.trim() && !s.querySelector('img')).map(s => s.id);
      return [tel('.verhaal'), tel('.hoe'), tel('.slider'), tel('.maak-lijst'), tel('.kernwaarden, .uitgelicht, .sferen, .hoverlijst'),
              koppen.filter((k, i) => koppen.indexOf(k) !== i), quotes.filter((k, i) => quotes.indexOf(k) !== i), leeg]; }""")
    if dubbel[:5] != [1, 1, 1, 0, 0] or dubbel[5] or dubbel[6] or dubbel[7]:
        fouten.append(f"{tag}: dubbele of lege onderdelen op Werkwijze (verhaal, hoe, slider, wat ik maak, homepage-blokken, dubbele koppen, dubbele quotes, lege secties: {dubbel})")
    for oud in ["atelier", "hoe-ik-werk"]:
        if not page.query_selector(f"#{oud}"):
            fouten.append(f"werkwijze.html: anker #{oud} ontbreekt (oude adressen /over#)")
    # oude adressen /producten#… landen op de homepage (besluit Carst 5 nov.: Wat ik maak weg)
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    for oud in ["babykleding", "siliconen", "babynest", "prematuur", "kraamcadeaubox", "contact", "inspiratie"]:
        if f'id="{oud}"' not in home:
            fouten.append(f"index.html: anker #{oud} ontbreekt (oude adressen /producten#)")
    # Hoe ik werk: aanwijzen wisselt niet, klik, Enter en Spatie wel
    page.eval_on_selector("#hoe-ik-werk", "e => e.scrollIntoView()"); page.wait_for_timeout(300)
    lees = "() => [[...document.querySelectorAll('.hoe-tab')].map(t => t.getAttribute('aria-selected')), [...document.querySelectorAll('.hoe-stap')].map(s => getComputedStyle(s).visibility)]"
    page.hover(".hoe-tab:nth-child(2)"); page.wait_for_timeout(500)
    if page.evaluate(lees)[0] != ["true", "false", "false"]:
        fouten.append(f"{tag}: aanwijzen wisselt de stap in Hoe ik werk")
    page.click(".hoe-tab:nth-child(2)"); page.wait_for_timeout(600)
    if page.evaluate(lees) != [["false", "true", "false"], ["hidden", "visible", "hidden"]]:
        fouten.append(f"{tag}: klik op stap 2 toont niet stap 2 ({page.evaluate(lees)})")
    page.focus(".hoe-tab:nth-child(2)"); page.keyboard.press("ArrowDown"); page.keyboard.press("Enter"); page.wait_for_timeout(600)
    if page.evaluate(lees)[0] != ["false", "false", "true"]:
        fouten.append(f"{tag}: Enter op stap 3 wisselt niet")
    page.keyboard.press("ArrowUp"); page.keyboard.press(" "); page.wait_for_timeout(600)
    if page.evaluate(lees)[0] != ["false", "true", "false"]:
        fouten.append(f"{tag}: Spatie op stap 2 wisselt niet")
    groot = page.evaluate("() => { const r = document.querySelector('.hoe-foto img').getBoundingClientRect(); return [r.width, r.height]; }")
    if max(groot[0] / 1800, groot[1] / 900) > 1.001:
        fouten.append(f"{tag}: achtergrondfoto in Hoe ik werk wordt vergroot ({groot})")
    # Personaliseren: dezelfde slider als op de homepage, met eigen id's; alleen klik, Enter of Spatie wisselt
    ids = page.evaluate("() => [...document.querySelectorAll('#personaliseren [id]')].map(e => e.id)")
    index_ids = re.findall(r'id="([^"]+)"', (ROOT / "index.html").read_text(encoding="utf-8"))
    if len(ids) != 4 or set(ids) & set(index_ids) or len(set(page.evaluate("() => [...document.querySelectorAll('[id]')].map(e => e.id)"))) != page.evaluate("() => document.querySelectorAll('[id]').length"):
        fouten.append(f"{tag}: de slider heeft geen eigen unieke id's ({ids})")
    controleer_tabbladen(page, f"{tag} [Personaliseren]", False)
    page.focus(".slider [role='tab']:nth-of-type(1)"); page.keyboard.press("ArrowRight"); page.keyboard.press("ArrowRight"); page.wait_for_timeout(300)
    if page.evaluate(LEES_TABS_SLIDER) != ["true", "false", "false"]:
        fouten.append(f"{tag}: pijltoetsen wisselen de slider (alleen Enter of Spatie hoort te wisselen)")
    page.keyboard.press("Enter"); page.wait_for_timeout(1500)
    if page.evaluate(LEES_TABS_SLIDER) != ["false", "false", "true"]:
        fouten.append(f"{tag}: Enter op Siliconen wisselt de slider niet ({page.evaluate(LEES_TABS_SLIDER)})")
    page.keyboard.press("ArrowLeft"); page.keyboard.press(" "); page.wait_for_timeout(1500)
    if page.evaluate(LEES_TABS_SLIDER) != ["false", "true", "false"]:
        fouten.append(f"{tag}: Spatie op Belettering wisselt de slider niet ({page.evaluate(LEES_TABS_SLIDER)})")
    ctx.close()
    # Wat ik maak is weg (besluit Carst 5 nov.): de producttekst staat alleen nog op de homepage
    if (ROOT / "werkwijze.html").read_text(encoding="utf-8").count("maak-rij"):
        fouten.append("werkwijze.html: 'Wat ik maak' staat er nog (besluit Carst: weghalen)")
    # 390 x 844: h1 "Werkwijze" en de kop in het eerste scherm, de kop onder de foto
    ctx, page = nieuwe_pagina(browser, "werkwijze.html", 390, 844, True)
    st = page.evaluate("""() => { const f = document.querySelector('.over-kop-foto').getBoundingClientRect(), k = document.querySelector('.over-kop .kop-xl').getBoundingClientRect(), h = document.querySelector('h1').getBoundingClientRect();
      return [k.top >= f.bottom, h.top >= 0 && k.bottom <= innerHeight, [...document.querySelectorAll('.hoe-stap')].map(s => getComputedStyle(s).visibility === 'visible' && s.offsetHeight > 0), !!document.querySelector('.hoe-tabs:not([hidden])')]; }""")
    if not st[0]:
        fouten.append("werkwijze.html [mobiel]: de kop staat over de foto in plaats van eronder")
    if not st[1]:
        fouten.append("werkwijze.html [mobiel]: h1 'Werkwijze' en de kop staan niet samen in het eerste scherm (390 x 844)")
    if st[2] != [True, True, True] or st[3]:
        fouten.append(f"werkwijze.html [mobiel]: de drie stappen staan niet onder elkaar ({st})")
    ctx.close()

THEMA_KLEUREN_VERBODEN = {"rgb(188, 133, 101)"}  # terracotta
THEMAS = ["Giraf", "Vos", "Tulp", "Walvis", "Wilde blaadjes", "Framboos", "Regenboog", "Wilgentakjes", "Blaadjes en bloemen"]
# volgorde van de pagina (brief homepage per product, criterium 1): kop, statementfoto, 001 formaten, 002 thema's, 003 zo werkt het, 004 contact
BOX_SECTIES = [["", "— Kraamcadeauboxen"], ["", "— Met naam"], ["formaten", "001 — Kies je formaat"], ["themas", "002 — Thema's"], ["werkwijze", "003 — Zo werkt het"], ["contact", "004 — Contact"]]
LEES_THEMAS = """() => { const s = document.querySelector('#themas'); const kaarten = [...s.querySelectorAll('.themaraster > li')];
  return { kaarten: kaarten.map(k => { const i = k.querySelector('img'), r = i.getBoundingClientRect();
      return [(k.querySelector('figcaption') || {}).textContent, i.getAttribute('src'), i.getAttribute('srcset') || '', i.getAttribute('width'), r.width, r.height, Math.round(r.left), i.getAttribute('alt') || '']; }),
    links: [...s.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
    lopend: s.querySelectorAll('.lopend, .lopend-spoor, .thema-lopend').length + document.querySelectorAll('main section.thema').length,
    boven: s.getBoundingClientRect().top + scrollY, onder: Math.max(...kaarten.map(k => k.getBoundingClientRect().bottom)) + scrollY,
    laag: s.getAttribute('data-achtergrond') || getComputedStyle(s).backgroundColor }; }"""

def controleer_themas(browser):
    """Criterium 1 (vervangt de controle van het projectenritme): volgorde kop, statementfoto, formaten, thema's als raster,
    zo werkt het, contact; negen thema's zonder lopende regels; op 1440 x 900 binnen twee schermen; 3/2/2 kolommen."""
    ctx, page = nieuwe_pagina(browser, "kraamcadeauboxen.html", 390, 844, True)
    zicht = page.evaluate("""() => { const p = [...document.querySelectorAll('.pagina-kop p')].find(p => p.textContent.trim() === 'Vier formaten, van € 35 tot € 80.');
      if (!p) return null; const r = p.getBoundingClientRect(); return r.bottom <= innerHeight; }""")
    if not zicht:
        fouten.append(f"kraamcadeauboxen.html [mobiel]: 'Vier formaten, van € 35 tot € 80.' staat niet in het eerste scherm ({zicht})")
    if page.inner_text("h1").strip().lower() != "kraamcadeauboxen":
        fouten.append(f"kraamcadeauboxen.html: h1 is '{page.inner_text('h1')}', verwacht Kraamcadeauboxen")
    if page.query_selector(".hero, .hoverlijst, .kaarten"):
        fouten.append("kraamcadeauboxen.html: collage, hoverlijst of kaarten staan nog op de pagina")
    # 390: de statementfoto sluit direct aan op de intro en komt na hooguit één keer scrollen in beeld
    st = page.evaluate("""() => { const k = document.querySelector('main > section.pagina-kop'), s = k && k.nextElementSibling;
      if (!s || !s.matches('.statement')) return null; const a = k.getBoundingClientRect(), b = s.getBoundingClientRect();
      return [Math.round(b.top - a.bottom), Math.round(b.top), !!s.querySelector('img') && s.querySelector('img').complete, s.textContent.includes('Met naam en geboortedatum, op de producten en zelfs op de doos.')]; }""")
    if not st or abs(st[0]) > 1 or st[1] > 844 * 1.5 or not st[2] or not st[3]:
        fouten.append(f"kraamcadeauboxen.html [mobiel]: de statementfoto staat niet direct na de intro (verschil, top, geladen, tekst: {st})")
    ctx.close()
    for naam, (b, h, touch, kolommen) in {"desktop": (1440, 900, False, 3), "tablet": (768, 1024, True, 2), "mobiel": (390, 844, True, 2)}.items():
        ctx, page = nieuwe_pagina(browser, "kraamcadeauboxen.html", b, h, touch, reduced_motion="reduce")
        tag = f"kraamcadeauboxen.html [{naam}]"
        secties = page.evaluate("() => [...document.querySelectorAll('main > section')].map(s => [s.id, s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()])")
        if secties != BOX_SECTIES:
            fouten.append(f"{tag}: volgorde van de secties is {secties}, verwacht {BOX_SECTIES}")
        th = page.evaluate(LEES_THEMAS)
        if [k[0] for k in th["kaarten"]] != THEMAS:
            fouten.append(f"{tag}: thema's zijn {[k[0] for k in th['kaarten']]}, verwacht {THEMAS}")
        if len({k[6] for k in th["kaarten"]}) != kolommen:
            fouten.append(f"{tag}: thema's staan in {len({k[6] for k in th['kaarten']})} kolommen, verwacht {kolommen}")
        for naam_t, src, srcset, w, kb, kh, _, alt in th["kaarten"]:
            breedte = bestandsbreedte(src)
            if str(breedte) != str(w) or kb > breedte + 0.5 or "-600.jpg 600w" not in srcset or abs(kb / kh - 4 / 3) > .02 or naam_t not in alt:
                fouten.append(f"{tag}: thema {naam_t}: foto {kb:.0f} x {kh:.0f} (bestand {breedte}, width={w}), geen 4:3, geen 600w-versie of alt zonder naam")
        if th["links"] != [["Vraag je thema aan", "contact.html?onderwerp=kraamcadeaubox#formulier"]]:
            fouten.append(f"{tag}: onder de thema's hoort één pijl-link 'Vraag je thema aan' naar het formulier ({th['links']})")
        if th["lopend"]:
            fouten.append(f"{tag}: er staan nog lopende regels of losse themasecties ({th['lopend']})")
        if norm_kleur(page, th["laag"]) in THEMA_KLEUREN_VERBODEN:
            fouten.append(f"{tag}: de thema's staan op terracotta")
        if naam == "desktop" and th["onder"] - th["boven"] > 2 * h:
            fouten.append(f"{tag}: de negen thema's passen niet binnen twee schermen ({th['onder'] - th['boven']:.0f} px > {2 * h} px)")
        ctx.close()

# Geen scherm zonder inhoud: elk venster langs de pagina toont tekst of een foto
LEEG_SCHERM = """() => { const els = [...document.querySelectorAll('main h1, main h2, main p, main a, main img, main li')].filter(e => e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible');
  const h = innerHeight, totaal = document.querySelector('main').getBoundingClientRect().bottom + scrollY, leeg = [];
  for (let y = 0; y + h * .5 < totaal; y += h * .5) {
    if (!els.some(e => { const r = e.getBoundingClientRect(), t = r.top + scrollY; return t < y + h && t + r.height > y; })) leeg.push(Math.round(y)); }
  return leeg; }"""

# Prematuurkleding en Babynest (criterium 2): kop -> voorbeeldfoto -> prijsrichtlijn -> Zo werkt het -> contact
PRODUCTPAGINAS = {
    "prematuurkleding.html": {"formulier": "contact.html?onderwerp=prematuurkleding#formulier", "h1": "Prematuurkleding", "foto_id": "maatwerk", "kleur": "#C3CFBC", "foto": "p-broekje-kleur.jpg", "max_b": 480,
                              "secties": [["", "— Prematuurkleding"], ["maatwerk", "001 — Maatwerk"], ["prijs", "002 — Prijsrichtlijn"], ["zo-werkt-het", "003 — Zo werkt het"], ["contact", "004 — Contact"]]},
    "babynest.html": {"formulier": "contact.html?onderwerp=babynest#formulier", "h1": "Babynest", "foto_id": "babynest", "kleur": "#B5969E", "foto": "ig-babynest.jpg", "max_b": 324,
                      "secties": [["", "— Babynest"], ["babynest", "001 — Babynest"], ["prijs", "002 — Prijsrichtlijn"], ["zo-werkt-het", "003 — Zo werkt het"], ["contact", "004 — Contact"]]},
}

def controleer_productpagina(browser, pagina):
    """Criterium 2 (vervangt de controle 'max. 4 secties, prijs en WhatsApp in de kop' van Prematuurkleding)."""
    v = PRODUCTPAGINAS[pagina]
    # 390 x 844: h1, intro en 'Stuur Carien een bericht' in het eerste scherm; de foto na hooguit één keer scrollen in beeld
    ctx, page = nieuwe_pagina(browser, pagina, 390, 844, True)
    st = page.evaluate("""id => { const z = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      const a = [...document.querySelectorAll('.pagina-kop a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href'), z(a)]);
      const q = document.querySelector('.pagina-kop .quote');
      return [document.querySelector('h1').textContent.trim(), z(q), a, getComputedStyle(q).color, parseFloat(getComputedStyle(q).fontSize)]; }""", v["foto_id"])
    if st[0] != v["h1"] or not st[1] or st[2] != [["Stuur Carien een bericht", v["formulier"], True]]:
        fouten.append(f"{pagina} [mobiel]: h1, intro of 'Stuur Carien een bericht' (naar het formulier) staan niet in het eerste scherm ({st[:3]})")
    if st[3] != WIT or st[4] < 24:
        fouten.append(f"{pagina} [mobiel]: de intro in de kop hoort wit vanaf 24 px ({st[3:]})")
    # in het eerste scherm of na één keer scrollen (een schermhoogte) staat minstens de helft van de foto in beeld
    delen = []
    for y in [0, 844]:
        page.evaluate(f"window.scrollTo(0, {y})"); page.wait_for_timeout(300)
        delen.append(page.evaluate("""id => { const r = document.querySelector('#' + id + ' .categorie-foto img').getBoundingClientRect();
          return Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height; }""", v["foto_id"]))
    if max(delen) < .5:
        fouten.append(f"{pagina} [mobiel]: de voorbeeldfoto is in het eerste scherm en na één keer scrollen maar voor {max(delen):.0%} in beeld (min. 50%)")
    ctx.close()
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "mobiel": (390, 844, True)}.items():
        ctx, page = nieuwe_pagina(browser, pagina, b, h, touch, reduced_motion="reduce")
        tag = f"{pagina} [{naam}]"
        secties = page.evaluate("() => [...document.querySelectorAll('main > section')].map(s => [s.id, s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(), s.getAttribute('data-achtergrond')])")
        if [x[:2] for x in secties] != v["secties"]:
            fouten.append(f"{tag}: volgorde van de secties is {[x[:2] for x in secties]}, verwacht {v['secties']}")
        elif secties[1][2] != v["kleur"]:
            fouten.append(f"{tag}: de fotosectie heeft kleur {secties[1][2]}, verwacht {v['kleur']}")
        st = page.evaluate("""id => { const i = document.querySelector('#' + id + ' .categorie-foto img'), r = i.getBoundingClientRect(), p = document.querySelector('#prijs .prijs');
          return [[...document.querySelectorAll('#' + id + ' a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
            [...document.querySelectorAll('main .stappen > li h2')].map(h => { const k = h.cloneNode(true); k.querySelectorAll('br').forEach(b => b.replaceWith(' ')); return k.textContent.replace(/\\s+/g, ' ').trim(); }),
            [...document.querySelectorAll('main a.pijl')].filter(a => a.textContent.trim() === 'Meer over de werkwijze').map(a => a.getAttribute('href')),
            i.getAttribute('src'), /prematuur/i.test(i.alt), r.width, i.getAttribute('width'), i.getAttribute('fetchpriority'), i.getAttribute('loading'),
            p ? [p.textContent.trim(), getComputedStyle(p).color, parseFloat(getComputedStyle(p).fontSize)] : null]; }""", v["foto_id"])
        if st[0] != [["Bespreek je idee", v["formulier"]]] or st[1] != ["Samen kiezen", "Persoonlijk maken", "Met zorg gemaakt"] or st[2] != ["werkwijze.html#hoe-ik-werk"]:
            fouten.append(f"{tag}: fotosectie of Zo werkt het klopt niet ({st[:3]})")
        if v["foto"] not in st[3] or st[4]:
            fouten.append(f"{tag}: voorbeeldfoto {v['foto']} ontbreekt of de alt-tekst noemt het prematuurkleding")
        breedte = bestandsbreedte(st[3])
        if str(breedte) != str(st[6]) or st[5] > min(breedte, v["max_b"]) + 0.5 or st[7] != "high" or st[8] == "lazy":
            fouten.append(f"{tag}: voorbeeldfoto {st[5]:.0f} px breed (max. {v['max_b']}, bestand {breedte}, width={st[6]}) of niet de LCP-foto (fetchpriority={st[7]}, loading={st[8]})")
        if not st[9] or st[9][0] != "Prijsrichtlijn: [prijs]" or st[9][1] != INKT or st[9][2] < 16:
            fouten.append(f"{tag}: 'Prijsrichtlijn: [prijs]' staat niet als eigen blok in inkt (min. 16 px) ({st[9]})")
        leeg = page.evaluate(LEEG_SCHERM)
        if leeg:
            fouten.append(f"{tag}: scherm zonder inhoud vanaf y = {leeg}")
        ctx.close()

def controleer_prematuur(browser):
    for pagina in PRODUCTPAGINAS:
        controleer_productpagina(browser, pagina)

# Inspiratie (was Portfolio): vier groepen (criteria 10, 11 en 12 van navigatie-v2; criterium 5 van homepage per product)
GROEPEN = [("kleding", "#C3CFBC", "#839C75"), ("textiel", "#B5969E", "#AE8C94"), ("siliconen", "#B4B19A", "#999575"), ("boxen", "#DEB799", "#C88654")]
LEES_GROEPEN = """() => [...document.querySelectorAll('main > section.portfolio-groep')].map(s => [s.id, s.getAttribute('data-achtergrond'), s.getAttribute('data-diep'),
  [...s.querySelectorAll('.werk')].length, [...s.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')])])"""
LEES_WERKEN = """async () => {
  const uit = [];
  for (const i of document.querySelectorAll('main .werk img')) {
    const r = i.getBoundingClientRect(); const bron = new Image(); bron.src = i.getAttribute('src');
    try { await bron.decode(); } catch (e) { /* telt hieronder als 0 */ }
    const f = i.closest('figure');
    uit.push({ src: i.getAttribute('src'), srcset: i.getAttribute('srcset') || '', b: r.width, top: r.top + scrollY, links: Math.round(r.left), bestand: bron.naturalWidth,
      w: i.getAttribute('width'), h: i.getAttribute('height'), alt: i.getAttribute('alt') || '', lazy: i.getAttribute('loading'), dec: i.getAttribute('decoding'),
      fig: !!f && !!f.querySelector('figcaption'), tab: i.tabIndex >= 0 || !!i.closest('a, button, [tabindex]') });
  }
  return uit; }"""

def controleer_portfoliopagina(browser):
    for naam, (b, h, touch, kolommen) in {"desktop": (1440, 900, False, 4), "tablet": (768, 1024, True, 3), "mobiel": (390, 844, True, 2)}.items():
        ctx, page = nieuwe_pagina(browser, "inspiratie.html", b, h, touch, reduced_motion="reduce")
        tag = f"inspiratie.html [{naam}]"
        kop = page.evaluate("() => [document.querySelector('h1').textContent.trim(), document.title, [...document.querySelectorAll('main > section')].map(s => [s.id, s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()])]")
        if kop[0] != "Inspiratie" or not kop[1].startswith("Inspiratie") or kop[2] != [["", "— Inspiratie"], ["kleding", "001 — Kleding"], ["textiel", "002 — Knuffels en babynest"], ["siliconen", "003 — Siliconen en hangers"], ["boxen", "004 — Kraamcadeauboxen"], ["", "— Het atelier"], ["contact", "005 — Contact"]]:
            fouten.append(f"{tag}: h1, titel of secties kloppen niet ({kop})")
        groepen = page.evaluate(LEES_GROEPEN)
        if [g[:3] for g in groepen] != [list(g) for g in GROEPEN]:
            fouten.append(f"{tag}: groepen, id's of kleuren kloppen niet ({[g[:3] for g in groepen]})")
        for n, g in enumerate(groepen):
            if norm_kleur(page, g[1]) in THEMA_KLEUREN_VERBODEN or norm_kleur(page, g[2]) in THEMA_KLEUREN_VERBODEN:
                fouten.append(f"{tag}: groep {g[0]} gebruikt terracotta")
            if n and g[1].upper() == groepen[n - 1][1].upper():
                fouten.append(f"{tag}: groep {g[0]} heeft dezelfde kleur als de groep ervoor")
            doel = ["kraamcadeauboxen.html"] if g[0] == "boxen" else ["contact.html#formulier"]
            if [l[1] for l in g[4]] != doel:
                fouten.append(f"{tag}: pijl-link onder {g[0]} gaat naar {g[4]}, verwacht {doel}")
        werken = page.evaluate(LEES_WERKEN)
        # kolommen: aantal verschillende linkerkanten per groep
        for gid, *_ in GROEPEN:
            n = page.evaluate("id => new Set([...document.querySelectorAll('#' + id + ' .werk')].map(f => Math.round(f.getBoundingClientRect().left))).size", gid)
            cc = page.evaluate("id => getComputedStyle(document.querySelector('#' + id + ' .werken')).columnCount", gid)
            if n != kolommen or str(cc) != str(kolommen):
                fouten.append(f"{tag}: groep {gid} staat in {n} kolommen (column-count {cc}), verwacht {kolommen}")
        for w in werken:
            if w["bestand"] == 0 or w["b"] > w["bestand"] + 0.5:
                fouten.append(f"{tag}: {w['src']} wordt breder getoond ({w['b']:.0f} px) dan het bestand ({w['bestand']} px)")
            if str(w["bestand"]) != str(w["w"]):
                fouten.append(f"{tag}: {w['src']} heeft width={w['w']}, het bestand is {w['bestand']} px breed")
            if not w["w"] or not w["h"] or len(w["alt"]) < 15 or not w["fig"] or w["tab"] or w["dec"] != "async":
                fouten.append(f"{tag}: {w['src']} mist width/height, een beschrijvende alt, figcaption of decoding=async, of is met het toetsenbord te bereiken")
            if w["bestand"] > 600 and "-600.jpg 600w" not in w["srcset"]:
                fouten.append(f"{tag}: {w['src']} heeft geen srcset met een 600w-versie")
            if naam == "mobiel" and w["top"] >= h and w["lazy"] != "lazy":
                fouten.append(f"{tag}: {w['src']} staat onder het eerste scherm maar heeft geen loading=lazy")
        basis = [re.sub(r"(-600)?\.jpg$", "", w["src"]) for w in werken]
        dubbel = sorted({x for x in basis if basis.count(x) > 1})
        if dubbel or len(werken) != sum(g[3] for g in groepen):
            fouten.append(f"{tag}: foto's komen dubbel voor ({dubbel})")
        verboden = [x for x in basis if re.search(r"/(over-|home-|maatwerk-|pers-|stof-|box-hero-wide)", x)]
        if verboden:
            fouten.append(f"{tag}: atelierfoto's of dubbele versies in het portfolio ({verboden})")
        if naam != "desktop":
            # touch: geen hoverstand, alle bijschriften in inkt en zichtbaar
            bs = page.evaluate("() => [...document.querySelectorAll('.werk figcaption')].map(f => [getComputedStyle(f).color, getComputedStyle(f).opacity, f.offsetHeight > 0])")
            if any(c != INKT or o != "1" or not z for c, o, z in bs):
                fouten.append(f"{tag}: op touch zijn niet alle bijschriften in inkt te zien")
            page.tap("#kleding .werk:nth-child(2) img"); page.wait_for_timeout(300)
            if page.evaluate("() => !!document.querySelector('.portfolio-groep.aangewezen')"):
                fouten.append(f"{tag}: op touch ontstaat een hoverstand")
        ctx.close()
    # aanwijzen met een muis (1440): laag naar de diepe tint, kop en bijschrift wit (>= 24 px), label en pijl-links inkt
    ctx, page = nieuwe_pagina(browser, "inspiratie.html")
    for gid, licht, diep in GROEPEN:
        tag = f"inspiratie.html [desktop, aanwijzen {gid}]"
        page.eval_on_selector(f"#{gid} .werk:nth-child(2)", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
        page.wait_for_timeout(900)
        page.hover(f"#{gid} .werk:nth-child(2) img")
        page.wait_for_timeout(1400)  # laag en tekst wisselen in 1 s
        st = page.evaluate("""id => { const s = document.getElementById(id), c = e => getComputedStyle(e);
          const aan = s.querySelector('.werk:nth-child(2) figcaption'), ander = s.querySelector('.werk:nth-child(1) figcaption');
          return [c(s.querySelector('.groep-kop')).color, c(aan).color, c(aan).opacity, parseFloat(c(aan).fontSize), c(ander).color, c(ander).opacity,
                  c(s.querySelector('.label')).color, [...s.querySelectorAll('a.pijl')].map(a => c(a).color)]; }""", gid)
        if lees_laag(page) != norm_kleur(page, diep):
            fouten.append(f"{tag}: laag is {lees_laag(page)}, verwacht de diepe tint {diep}")
        if st[0] != WIT or st[1] != WIT or st[2] != "1" or st[3] < 24 or st[4] != WIT or abs(float(st[5]) - .35) > .01:
            fouten.append(f"{tag}: groepskop en aangewezen bijschrift niet wit (>= 24 px) of andere bijschriften niet wit op 0,35 ({st[:6]})")
        if st[6] != INKT or any(k != INKT for k in st[7]):
            fouten.append(f"{tag}: label of pijl-links zijn niet inkt ({st[6:]})")
        page.mouse.move(2, 450); page.wait_for_timeout(1400)
        if page.evaluate("() => !!document.querySelector('.portfolio-groep.aangewezen')"):
            fouten.append(f"{tag}: na het verlaten blijft de hoverstand staan")
    ctx.close()

def controleer_balk_labels(browser):
    """Criterium 13: de balk verschijnt op de nieuwe pagina's met het label van de sectie in beeld."""
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "mobiel": (390, 844, True)}.items():
        for pagina in ["index.html", "werkwijze.html", "prematuurkleding.html", "babynest.html", "inspiratie.html", "kraamcadeauboxen.html"]:
            ctx, page = nieuwe_pagina(browser, pagina, b, h, touch, reduced_motion="reduce")
            secties = page.evaluate("() => [...document.querySelectorAll('main > section')].slice(1).map((s, i) => i)")
            for i in secties:
                verwacht = page.evaluate("""i => { const s = [...document.querySelectorAll('main > section')][i + 1];
                  window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 20); return s.getAttribute('data-label').replace(/<[^>]+>/g, '').trim(); }""", i)
                page.wait_for_timeout(250)
                st = page.evaluate("() => [document.querySelector('.balk').classList.contains('zichtbaar'), document.querySelector('.balk .sectie-label').textContent.trim()]")
                if not st[0] or st[1] != verwacht:
                    fouten.append(f"{pagina} [{naam}, balk]: bij '{verwacht}' toont de balk {st}")
                    break
            ctx.close()

# brief 2026-11-06: eerst het onderwerp, dan de groepen (alle velden optioneel), bericht, naam, e-mail, telefoon
FORMULIER_VELDEN = [["select", "onderwerp", ""]] + [["input", "box_formaat", "radio"]] * 4 + [["select", "box_thema", ""], ["input", "box_naam", "text"], ["input", "box_datum", "text"], ["input", "box_maat", "text"],
                    ["input", "prem_maat", "text"], ["input", "prem_naam", "text"], ["input", "nest_stof", "text"], ["input", "nest_naam", "text"],
                    ["textarea", "bericht", ""], ["input", "naam", "text"], ["input", "email", "email"], ["input", "telefoon", "tel"], ["input", "website", "text"]]

def controleer_contactpagina(browser):
    """Criteria 20-23 en 30."""
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "mobiel": (390, 844, True)}.items():
        ctx, page = nieuwe_pagina(browser, "contact.html", b, h, touch, reduced_motion="reduce")
        tag = f"contact.html [{naam}]"
        st = page.evaluate("""() => { const z = e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; };
          const k = document.querySelector('.contact-kop'); const links = [...k.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), z(a)]);
          return [z(k.querySelector('h2')), links, getComputedStyle(k.querySelector('h1')).color, [...document.querySelectorAll('.site-header .menu a')].map(a => getComputedStyle(a).color)]; }""")
        if not st[0] or [l[0] for l in st[1]] != ["WhatsApp Carien", "Stuur een bericht"] or not all(l[1] for l in st[1]):
            fouten.append(f"{tag}: vraag, WhatsApp of 'Stuur een bericht' staan niet zonder scrollen in beeld ({st[:2]})")
        if naam == "desktop" and (st[2] != "rgb(255, 255, 255)" or any(c != "rgb(255, 255, 255)" for c in st[3])):
            fouten.append(f"{tag}: kop of navigatie is niet wit ({st[2]}, {st[3]})")
        f = page.evaluate("""() => { const f = document.querySelector('#formulier form');
          return f ? [f.getAttribute('action'), f.getAttribute('method'), [...f.querySelectorAll('input, select, textarea')].map(e => [e.tagName.toLowerCase(), e.name, e.getAttribute('type') || '']),
            [...f.querySelectorAll('input:not([name=website]), select, textarea')].filter(e => e.offsetParent !== null).map(e => Math.round(e.getBoundingClientRect().height)),
            new Set([...f.querySelectorAll('label:not(.val):not(.keuze-kaart)')].filter(l => l.offsetParent !== null).map(l => Math.round(l.getBoundingClientRect().left))).size] : null; }""")
        if not f or f[0] != "/api/contact" or f[1] != "post" or f[2] != FORMULIER_VELDEN:
            fouten.append(f"{tag}: formulier wijkt af van het oude (action, method, velden: {f and f[:3]})")
        elif min(f[3]) < 44:
            fouten.append(f"{tag}: velden lager dan 44 px ({f[3]})")
        elif naam == "mobiel" and f[4] != 1:
            fouten.append(f"{tag}: formulier staat niet in één kolom")
        tekst = page.inner_text(".gegevens")
        for stuk in ["Sperwerstraat 10", "6035 GH Ospel", "WhatsApp Carien", "06 – 43 79 16 18", "info.LUXmini@gmail.com", "binnen 7 werkdagen verzonden"]:
            if stuk not in tekst:
                fouten.append(f"{tag}: '{stuk}' ontbreekt in 001 — Contactgegevens")
        ctx.close()
        # mislukte verzending: melding staat zonder scrollen in beeld
        ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch)
        ctx.add_init_script(INTRO_WEG)
        page = ctx.new_page()
        page.goto(url("contact.html?verzonden=fout#formulier"), wait_until="load")
        page.wait_for_timeout(1500)
        m = page.evaluate("""() => { const m = document.querySelector('.formulier .melding'); const r = m.getBoundingClientRect();
          return [m.textContent.includes('niet verstuurd'), m.getAttribute('role'), r.top >= 0 && r.bottom <= innerHeight]; }""")
        if m != [True, "alert", True]:
            fouten.append(f"{tag}: na ?verzonden=fout staat de foutmelding niet (in beeld) ({m})")
        ctx.close()

def controleer_contactmomenten(browser):
    """Criterium 6: buiten contact.html geen links naar WhatsApp, telefoon of mail in de inhoud (vervangt de controle op WhatsApp
    in het contactblok); elke contact-link in de inhoud gaat naar contact.html#formulier. Menu en footer houden de directe kanalen.
    Uitzondering: het mailadres in de lopende tekst van de privacyverklaring (recht op inzage), geen pijl-link."""
    for pagina in PAGINAS:
        if pagina == "contact.html":
            continue
        ctx, page = nieuwe_pagina(browser, pagina, reduced_motion="reduce")
        st = page.evaluate("""() => { const direct = a => /^(https:\\/\\/wa\\.me|tel:|mailto:)/.test(a.getAttribute('href') || '');
          const inhoud = [...document.querySelectorAll('main a')].filter(direct).filter(a => a.matches('.pijl') || !a.closest('.tekstblok')).map(a => a.getAttribute('href'));
          const naarContact = [...document.querySelectorAll('main a')].map(a => a.getAttribute('href') || '').filter(h => /(^|\\/)contact(\\.html)?(#|$)/.test(h) && !/^(contact\\.html|\\/contact)#formulier$/.test(h));
          const menu = ['https://wa.me/31643791618', 'tel:+31643791618', 'mailto:info.luxmini@gmail.com'].filter(h => !document.querySelector('#menu-scherm .menu-kolom a[href="' + h + '"]'));
          return [inhoud, naarContact, menu]; }""")
        if st[0]:
            fouten.append(f"{pagina}: directe contactlinks in de inhoud (horen alleen op contact.html, in het menu en de footer): {st[0]}")
        if st[1]:
            fouten.append(f"{pagina}: contactlinks in de inhoud die niet naar contact.html#formulier gaan: {st[1]}")
        if st[2]:
            fouten.append(f"{pagina}: het menu mist de directe kanalen {st[2]}")
        ctx.close()

def controleer_zonder_js(browser):
    """Criterium 27: zonder JavaScript is alle inhoud zichtbaar; bij minder beweging geen parallax."""
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, java_script_enabled=False)
    for pagina in ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "babynest.html", "inspiratie.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load")
        st = page.evaluate("""() => { const zicht = e => { let o = 1; for (let x = e; x; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity);
            return e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible' && o === 1; };
          return { cat: [...document.querySelectorAll('.categorie-foto img, .categorie-tekst h2, .categorie-tekst .klein, .themakaart img, .themakaart figcaption, .inspiratie-rij img, .werk img, .werk figcaption, .maak-rij img, .maak-rij h2, .stap h2, .stap .klein, .techniek h2, .dia img, .fotorij img, .pagina-prijs, .prijs')].filter(e => !zicht(e)).length,
                   stappen: [...document.querySelectorAll('.hoe-stap')].map(zicht), form: [...document.querySelectorAll('#formulier input:not([name=website]):not([type=radio]), #formulier textarea, #formulier button')].filter(e => !e.closest('.groep:not([data-groep="Kraamcadeaubox"])') && !zicht(e)).length }; }""")
        if st["cat"] or not all(st["stappen"]) or st["form"]:
            fouten.append(f"{pagina} [zonder JavaScript]: niet alles zichtbaar ({st})")
        page.close()
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    ctx.add_init_script(INTRO_WEG)
    for pagina in ["kraamcadeauboxen.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load"); page.wait_for_timeout(300)
        page.evaluate("window.scrollTo(0, 1500)"); page.wait_for_timeout(400)
        if page.evaluate("() => [...document.querySelectorAll('main img')].some(i => i.style.getPropertyValue('--parallax'))"):
            fouten.append(f"{pagina} [minder beweging]: er is toch parallax")
        page.close()
    ctx.close()
    # bij minder beweging (met JavaScript) staat alles van de nieuwe pagina's er ook
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    ctx.add_init_script(INTRO_WEG)
    for pagina in ["index.html", "werkwijze.html", "prematuurkleding.html", "babynest.html", "inspiratie.html", "kraamcadeauboxen.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load"); page.wait_for_timeout(300)
        weg = page.evaluate("""() => [...document.querySelectorAll('main h1, main h2, main p, main .pijl, main .werk img, main .maak-rij img, main .categorie-foto img, main .themakaart img, main .inspiratie-rij img')].filter(e => {
          if (e.closest('.hoe-stappen, .slider-teksten, .slider-beelden, .hero, .sfeer-beelden, .sfeer-kaarten')) return false; /* tabbladen: één tegelijk zichtbaar; hero: set B ligt eronder; Technieken: foto's alleen bij aanwijzen, kaarten alleen op touch */
          if (e.matches('.sr-only')) return false;
          let o = 1; for (let x = e; x; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity);
          return !(e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible' && o === 1); }).map(e => e.textContent.trim().slice(0, 30) || e.getAttribute('src'))""")
        if weg:
            fouten.append(f"{pagina} [minder beweging]: niet alles zichtbaar ({weg[:4]})")
        page.close()
    ctx.close()

def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    controleer_headers()
    controleer_bestanden()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        controleer_navigatie(browser)
        controleer_home_interactie(browser)
        controleer_werkwijze(browser)
        controleer_themas(browser)
        controleer_prematuur(browser)
        controleer_portfoliopagina(browser)
        controleer_contactmomenten(browser)
        controleer_balk_labels(browser)
        controleer_contactpagina(browser)
        controleer_zonder_js(browser)
        controleer_prijstabel(browser)
        controleer_stappen(browser)
        controleer_contact(browser)
        controleer_tablet(browser)
        for naam, (b, h) in SCHERMEN.items():
            touch = naam == "mobiel"  # has_touch + is_mobile: (hover: none) en (pointer: coarse), zoals op een telefoon
            ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch)
            # intro-scherm overslaan, zodat de controle meteen de pagina ziet
            ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
            for pagina in PAGINAS:
                page = ctx.new_page()
                jsfouten = []
                page.on("pageerror", lambda e: jsfouten.append(str(e)))
                page.goto(url(pagina), wait_until="load")
                page.wait_for_timeout(400)
                tag = f"{pagina} [{naam}]"

                for e in jsfouten:
                    fouten.append(f"{tag}: JavaScript-fout: {e}")

                # links
                for href in page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))"):
                    if not bestaat(href, pagina):
                        fouten.append(f"{tag}: kapotte link -> {href}")
                # afbeeldingen
                for src, ok, alt, deco in page.eval_on_selector_all(
                    "img", "els => els.map(e => [e.getAttribute('src'), e.complete && e.naturalWidth > 0, e.getAttribute('alt'), e.closest('.hoverlijst') !== null || e.classList.contains('set-b')])"
                ):
                    if src and not src.startswith("http") and not bestaat(src, pagina):
                        fouten.append(f"{tag}: afbeelding ontbreekt -> {src}")
                    if alt is None:
                        fouten.append(f"{tag}: afbeelding zonder alt-attribuut -> {src}")
                # horizontaal scrollen
                breed = page.evaluate(f"document.documentElement.scrollWidth > {b} + 1")
                if breed:
                    fouten.append(f"{tag}: pagina scrollt horizontaal (iets is te breed)")
                else:  # ook na scrollen (lopende regels, parallax, fotorij)
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)"); page.wait_for_timeout(300)
                    if page.evaluate(f"document.documentElement.scrollWidth > {b} + 1"):
                        fouten.append(f"{tag}: pagina scrollt horizontaal na scrollen (lopende regel, parallax of fotorij)")
                    page.evaluate("window.scrollTo(0, 0)")
                controleer_algemeen(page, tag, pagina, naam)
                # placeholders
                tekst = page.inner_text("body")
                for p in sorted(set(re.findall(r"\[[^\]]{2,40}\]", tekst))):
                    waarschuwingen.append(f"{tag}: nog in te vullen: {p}")

                # interacties
                if pagina == "index.html":  # setwissel is verplicht op de homepage
                    if page.query_selector(".hero[data-wissel]"):
                        controleer_setwissel(page, tag, naam)
                    else:
                        fouten.append(f"{tag}: .hero[data-wissel] ontbreekt (setwisseltest kan niet draaien)")
                if page.query_selector(".hoverlijst button"):
                    lijst_zichtbaar = page.is_visible(".hoverlijst")
                    kaarten_zichtbaar = page.is_visible(".kaarten")
                    if touch:
                        # op touch: hover-lijst verborgen, kaarten met dezelfde foto's, namen en alt-teksten
                        if lijst_zichtbaar or not kaarten_zichtbaar:
                            fouten.append(f"{tag}: op touch hoort de kaartenrij zichtbaar en de hover-lijst verborgen")
                        knoppen = page.eval_on_selector_all(".hoverlijst button", "els => els.map(b => [b.dataset.groot, b.dataset.alt, b.textContent.trim()])")
                        kaarten = page.eval_on_selector_all(".kaarten .kaart", "els => els.map(k => [k.querySelector('img').getAttribute('src'), k.querySelector('img').getAttribute('alt'), (k.querySelector('.kaart-naam') || k.querySelector('figcaption')).textContent.trim()])")
                        if knoppen != kaarten:
                            fouten.append(f"{tag}: kaarten wijken af van de hover-lijst (foto, alt of naam)")
                        page.eval_on_selector(".kaarten", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
                        page.wait_for_timeout(500)
                        if not page.eval_on_selector(".kaarten .kaart img", "e => e.complete && e.naturalWidth > 0"):
                            fouten.append(f"{tag}: eerste kaartfoto laadt niet")
                    else:
                        if not lijst_zichtbaar or kaarten_zichtbaar:
                            fouten.append(f"{tag}: met muis hoort de hover-lijst zichtbaar en de kaartenrij verborgen")
                        page.click(".hoverlijst li:nth-child(2) button")
                        page.wait_for_timeout(500)
                        if not page.eval_on_selector(".hoverlijst", "e => e.classList.contains('actief')"):
                            fouten.append(f"{tag}: hover-lijst toont geen foto's")

                if page.query_selector(".balk"):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
                    page.wait_for_timeout(600)
                    if not page.eval_on_selector(".balk", "e => e.classList.contains('zichtbaar') && e.querySelector('.sectie-label').textContent.trim().length > 0"):
                        fouten.append(f"{tag}: vaste balk met sectielabel verschijnt niet na scrollen")
                    page.evaluate("window.scrollTo(0, 0)")
                    page.wait_for_timeout(300)
                # menu: openen, toetsenbord, sluiten met Esc
                if page.query_selector(".burger"):
                    page.click(".burger")
                    page.wait_for_timeout(500)
                    open_ok = page.eval_on_selector("#menu-scherm", "e => !e.hidden && e.classList.contains('open')") and \
                              page.get_attribute(".burger", "aria-expanded") == "true"
                    if not open_ok:
                        fouten.append(f"{tag}: menu gaat niet open")
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(900)
                    if page.get_attribute(".burger", "aria-expanded") != "false" or not page.eval_on_selector("#menu-scherm", "e => e.hidden"):
                        fouten.append(f"{tag}: menu sluit niet met Esc")
                # Personaliseren: tabbladen (alleen klik wisselt, aanwijzen niet); Personaliseren staat nu alleen op Werkwijze
                if pagina == "werkwijze.html":  # tabbladen zijn verplicht op Werkwijze (desktop en mobiel)
                    if page.query_selector(".slider [role='tab']"):
                        controleer_tabbladen(page, tag, touch)
                    else:
                        fouten.append(f"{tag}: geen tabbladen ([role=tab]) in Personaliseren (tabbladtest kan niet draaien)")
                # alles wat bij scrollen invaagt zichtbaar maken voor de screenshot
                page.evaluate("document.querySelectorAll('.opkomen, .woorden-kop, img.zoom, .stappen').forEach(e => e.classList.add('in-beeld')); document.querySelectorAll('.hero').forEach(h => h.classList.add('klaar'))")
                page.wait_for_timeout(1000)
                page.screenshot(path=str(SHOTS / f"{pagina.replace('.html','')}-{naam}.png"), full_page=True)
                page.close()
            ctx.close()
        browser.close()

    waarschuwingen_uniek = sorted(set(w.split(": ", 1)[1] for w in waarschuwingen))
    print("\n== Controle LUX mini ==")
    print(f"Screenshots: {SHOTS}")
    if waarschuwingen_uniek:
        print("\nNog in te vullen (geen fout):")
        for w in waarschuwingen_uniek:
            print("  -", w)
    if fouten:
        print(f"\n{len(fouten)} fout(en):")
        for f in fouten:
            print("  x", f)
        sys.exit(1)
    print("\nGeen fouten gevonden.")

if __name__ == "__main__":
    main()
