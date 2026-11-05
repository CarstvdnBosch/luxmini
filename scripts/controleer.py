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
  - controleert dat het portfolio precies vijf items telt, in de lijst en in
    de kaarten, en dat die overeenkomen; met een muis wordt bij aanwijzen de
    actieve naam wit en de laag een van de vijf diepe tinten
  - controleert in public/_headers dat CSS en JS niet lang gecachet worden
    zonder hercontrole
  - brief navigatie-v2: header met vijf links op één regel vanaf 1200 px
    (daaronder de burger) en aria-current, menu met subitems (ankers met de
    kop in beeld, op 1440 x 900 en 390 x 844 zonder scrollen), _redirects
    (301 rechtstreeks), sitemap en canonicals, homepage 001-007 zonder
    formulier (002 Werkwijze, 003 Portfolio), Werkwijze (kop, witte kop 3:1,
    Hoe ik werk-tabs, slider, Wat ik maak met vijf rijen), thema's en prijzen
    op Kraamcadeauboxen, Prematuurkleding (eerste scherm, max. 4 secties,
    LET OP), Portfolio (vier groepen, kleuren, kolommen, geen vergrote of
    dubbele foto's, lazy, aanwijzen en touch), Contact (kop, formulier,
    foutmelding), de balk met het juiste label, zonder JavaScript en bij
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
PAGINAS = ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "portfolio.html", "contact.html", "privacy.html", "bedankt.html", "404.html"]
HOOFDPAGINAS = ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "portfolio.html", "contact.html"]
OUDE_PAGINAS = ["producten.html", "over.html", "kraamcadeaubox.html"]
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
        for pagina in ["index.html", "werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "portfolio.html"]:
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
                if manier == "link" and naam == "mobiel":
                    # criterium 7: kop van het contactblok en WhatsApp zonder verder scrollen in beeld
                    zicht = page.evaluate("""() => ['#contact h2', '#contact a[href^="https://wa.me"]'].map(s => {
                      const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })""")
                    if not all(zicht):
                        fouten.append(f"{tag}: na de link naar #contact staan kop en WhatsApp niet samen in beeld ({zicht})")
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
    !!k.querySelector('a.pijl[href="contact.html#formulier"]')]);
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
        if not k[3]:
            fouten.append(f"{tag}: kaart {i} heeft geen pijl-link naar contact.html#formulier")

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

# Portfolio: precies vijf sferen, in de hoverlijst en in de kaarten (brief stock-pariteit, criterium 11 en 13)
LEES_PORTFOLIO = """() => {
  const s = document.querySelector('#portfolio');
  const knoppen = [...s.querySelectorAll('.hoverlijst ul button')].map(b => [b.textContent.trim(), b.dataset.groot]);
  const kaarten = [...s.querySelectorAll('.kaarten .kaart')].map(k => [(k.querySelector('.kaart-naam') || k).textContent.trim(), k.querySelector('img').getAttribute('src')]);
  const regels = [...s.querySelectorAll('.kaarten .kaart .kaart-regel')].map(r => r.textContent.trim());
  const beelden = s.querySelectorAll('.hoverlijst .sfeer').length;
  return [knoppen, kaarten, regels, beelden];
}"""

# diepe portfoliotinten (wit haalt daar minstens 3:1), als rgb
DIEPE_TINTEN = {"rgb(188, 139, 71)", "rgb(131, 156, 117)", "rgb(153, 149, 117)", "rgb(200, 134, 84)", "rgb(174, 140, 148)"}
LEES_HOVER = """() => { const a = document.querySelector('#portfolio .hoverlijst ul button.aan');
  return [a ? getComputedStyle(a).color : null, a ? getComputedStyle(a).opacity : null, getComputedStyle(document.querySelector('.achtergrond')).backgroundColor]; }"""

def controleer_portfolio(page, tag, touch=False):
    if not touch:
        # met een muis: aanwijzen maakt de actieve naam wit op een diepe tint (wens Carst)
        page.eval_on_selector("#portfolio .hoverlijst", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
        page.wait_for_timeout(300)
        for n in range(1, 6):
            page.hover(f"#portfolio .hoverlijst li:nth-child({n}) button")
            page.wait_for_timeout(1300)  # kleur en laag wisselen in 1 s
            kleur, zicht, laag = page.evaluate(LEES_HOVER)
            if kleur != "rgb(255, 255, 255)" or zicht != "1":
                fouten.append(f"{tag}: portfolio item {n}: actieve naam is {kleur} (opacity {zicht}), verwacht wit")
            if laag not in DIEPE_TINTEN:
                fouten.append(f"{tag}: portfolio item {n}: laag is {laag}, verwacht een van de diepe tinten")
        page.mouse.move(2, 2)
        page.wait_for_timeout(1300)
    knoppen, kaarten, regels, beelden = page.evaluate(LEES_PORTFOLIO)
    if len(knoppen) != 5 or len(kaarten) != 5:
        fouten.append(f"{tag}: portfolio telt {len(knoppen)} items in de lijst en {len(kaarten)} kaarten, verwacht precies 5 en 5")
    if knoppen != kaarten:
        fouten.append(f"{tag}: lijst en kaarten in het portfolio komen niet overeen ({knoppen} tegen {kaarten})")
    if len(regels) != len(kaarten) or not all(regels):
        fouten.append(f"{tag}: niet elke portfoliokaart heeft een productregel")
    if beelden != len(knoppen):
        fouten.append(f"{tag}: de lijst heeft {beelden} fotoparen voor {len(knoppen)} items")

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
  // tekst in de bovenkant (kop, quote, lopende regel) en het logo in de header
  const tekst = [kleur('.hero .kop-xl'), kleur('.hero-kleur .quote'), kleur('.hero-kleur .lopend-spoor')];
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
            pijl_meer(page, f"{pagina} [tablet]")
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
# Brief navigatie-v2 (2026-11-05): Werkwijze · Kraamcadeauboxen · Prematuurkleding · Portfolio · Contact
# (vervangt de controles van de brief navigatie-paginas voor Producten, Kraamcadeaubox en Over)
# =====================================================================
INTRO_WEG = "try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}"
HOOFDMENU = [("Werkwijze", "werkwijze"), ("Kraamcadeauboxen", "kraamcadeauboxen"), ("Prematuurkleding", "prematuurkleding"), ("Portfolio", "portfolio"), ("Contact", "contact")]
MENU_SUBS = [("Het atelier", "werkwijze#atelier"), ("Hoe ik werk", "werkwijze#hoe-ik-werk"), ("Personaliseren", "werkwijze#personaliseren"), ("Wat ik maak", "werkwijze#wat-ik-maak"),
             ("Thema's", "kraamcadeauboxen#themas"), ("Formaten en prijzen", "kraamcadeauboxen#formaten"), ("Zo werkt het", "kraamcadeauboxen#werkwijze"),
             ("Kleding", "portfolio#kleding"), ("Knuffels, swaddles en babynest", "portfolio#textiel"), ("Siliconen en hangers", "portfolio#siliconen"), ("Kraamcadeauboxen", "portfolio#boxen")]
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
    verwacht = {"/producten": "/werkwijze", "/producten.html": "/werkwijze", "/over": "/werkwijze", "/over.html": "/werkwijze", "/over-lux": "/werkwijze",
                "/kraamcadeaubox": "/kraamcadeauboxen", "/kraamcadeaubox.html": "/kraamcadeauboxen", "/aanbod": "/kraamcadeauboxen", "/aanbod/": "/kraamcadeauboxen",
                "/shop": "/kraamcadeauboxen", "/product-page/*": "/kraamcadeauboxen", "/klantenservice": "/contact", "/account/*": "/"}
    for pad, doel in verwacht.items():
        if regels.get(pad) != (doel, "301"):
            fouten.append(f"_redirects: {pad} hoort 301 naar {doel} te gaan ({regels.get(pad)})")
    for pad, (doel, _) in regels.items():  # geen tussenstap: het doel is zelf geen bron van een regel
        if doel in regels or doel.rstrip("/") + ".html" in regels:
            fouten.append(f"_redirects: {pad} -> {doel} heeft een tussenstap")
    for pad in ["/contact", "/werkwijze", "/kraamcadeauboxen", "/prematuurkleding", "/portfolio"]:
        if pad in regels:
            fouten.append(f"_redirects: er staat een regel voor {pad}; die blokkeert de pagina")
    for oud in OUDE_PAGINAS:
        if (ROOT / oud).exists():
            fouten.append(f"public/{oud} bestaat nog (hoort verwijderd te zijn; het oude adres geeft 301)")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    locs = re.findall(r"<loc>https://www\.luxmini\.nl([^<]*)</loc>", sitemap)
    if sorted(locs) != sorted(["/", "/werkwijze", "/kraamcadeauboxen", "/prematuurkleding", "/portfolio", "/contact", "/privacy"]):
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

LEES_HEADER = """() => { const l = document.querySelector('.site-header .logo').getBoundingClientRect();
  return [[...document.querySelectorAll('.site-header .menu a')].map(a => { const r = a.getBoundingClientRect();
    return [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('aria-current'), getComputedStyle(a).display !== 'none' && r.height > 0, Math.round(r.top), Math.round(r.left)]; }), Math.round(l.right)]; }"""

def controleer_navigatie(browser):
    """Criteria 1, 2 en 3: vijf links op één regel vanaf 1200 px (daaronder de burger), aria-current,
    menu met subitems overal gelijk, ankers met de kop in beeld, menu zonder scrollen."""
    menus = {}
    for pagina in PAGINAS:
        ctx, page = nieuwe_pagina(browser, pagina)
        tag = f"{pagina} [navigatie]"
        links, logo = page.evaluate(LEES_HEADER)
        if [(t, schoon_doel(h)) for t, h, *_ in links] != HOOFDMENU or not all(l[3] for l in links):
            fouten.append(f"{tag}: header heeft niet precies Werkwijze, Kraamcadeauboxen, Prematuurkleding, Portfolio en Contact als zichtbare links ({[l[:2] for l in links]})")
        elif len({l[4] for l in links}) != 1 or min(l[5] for l in links) <= logo:
            fouten.append(f"{tag}: op 1440 px staan de vijf links niet op één regel naast het logo ({links})")
        if any("#" in l[1] for l in links):
            fouten.append(f"{tag}: een hoofdlink in de header is een anker")
        huidig = [schoon_doel(l[1]) for l in links if l[2] == "page"]
        verwacht = [pagina.replace(".html", "")] if pagina.replace(".html", "") in dict((s, 1) for _, s in HOOFDMENU) else []
        if huidig != verwacht:
            fouten.append(f"{tag}: aria-current staat op {huidig}, verwacht {verwacht}")
        alle_current = page.evaluate("() => [...document.querySelectorAll('[aria-current]')].map(a => a.closest('.site-header') ? 'header' : 'elders')")
        if any(c != "header" for c in alle_current):
            fouten.append(f"{tag}: aria-current staat ook buiten de hoofdnavigatie (bijv. op een subitem met dezelfde naam)")
        if huidig:
            stijl = page.eval_on_selector('.site-header .menu a[aria-current="page"]', "a => [getComputedStyle(a).textDecorationLine, getComputedStyle(a).textUnderlineOffset]")
            if "underline" not in stijl[0] or stijl[1] != "6px":
                fouten.append(f"{tag}: de huidige pagina is niet onderstreept met 6 px afstand ({stijl})")
        menus[pagina] = page.eval_on_selector_all("#menu-scherm a", "els => els.map(a => [a.textContent.trim(), a.getAttribute('href')])")
        ctx.close()
    # 1200 px: nog steeds één regel; 1024 px: alleen de burger
    for b, h in [(1200, 800), (1024, 768)]:
        for pagina in ["index.html", "prematuurkleding.html"]:
            ctx, page = nieuwe_pagina(browser, pagina, b, h)
            links, logo = page.evaluate(LEES_HEADER)
            zichtbaar = [l for l in links if l[3]]
            if b >= 1200 and (len(zichtbaar) != 5 or len({l[4] for l in zichtbaar}) != 1 or min(l[5] for l in zichtbaar) <= logo):
                fouten.append(f"{pagina} [{b} px]: de vijf links staan niet op één regel naast het logo ({links})")
            if b < 1200 and (zichtbaar or not page.is_visible(".burger")):
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
    if st[0] != 16 or st[1] or st[2] > 0:
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
    # mobiel: vijf hoofditems en WhatsApp zonder scrollen in beeld, subitems verborgen
    ctx, page = nieuwe_pagina(browser, "index.html", 390, 844, True, reduced_motion="reduce")
    page.click(".burger"); page.wait_for_timeout(500)
    zicht = page.evaluate("""() => {
      const z = e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      return [[...document.querySelectorAll('.menu-nav > ul > li > a')].map(z), z(document.querySelector('.menu-kolom a[href^="https://wa.me"]')),
              [...document.querySelectorAll('.menu-sub a')].some(a => a.getBoundingClientRect().height > 0)]; }""")
    if not all(zicht[0]) or len(zicht[0]) != 5 or not zicht[1]:
        fouten.append(f"index.html [mobiel, menu]: vijf hoofditems en WhatsApp staan niet zonder scrollen in beeld ({zicht})")
    if zicht[2]:
        fouten.append("index.html [mobiel, menu]: subitems horen op mobiel verborgen te zijn")
    ctx.close()

def page_tekst_menu_koppen():
    return re.findall(r'<p class="menu-kop">([^<]+)</p>', (ROOT / "index.html").read_text(encoding="utf-8"))

def pijl_meer(page, tag):
    """Criterium 6: "Bekijk de werkwijze" (002) en "Bekijk het portfolio" (003) zichtbaar zonder aanwijzen, min. 44 px."""
    for sectie, tekst, doel in [("#werkwijze", "Bekijk de werkwijze", "werkwijze.html#hoe-ik-werk"), ("#portfolio", "Bekijk het portfolio", "portfolio.html")]:
        zoek = f"() => [...document.querySelectorAll('{sectie} a.pijl')].find(a => a.textContent.includes('{tekst}'))"
        page.evaluate(f"() => {{ const a = ({zoek})(); if (a) a.scrollIntoView({{ block: 'center', behavior: 'instant' }}); }}")
        page.wait_for_timeout(1300)  # opkomen bij scrollen duurt 0,9 s
        st = page.evaluate(f"""() => {{ const a = ({zoek})();
          if (!a) return null; const c = getComputedStyle(a), r = a.getBoundingClientRect();
          let o = 1; for (let e = a; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
          return [a.getAttribute('href'), r.height, c.visibility, o, r.width, r.top >= 0 && r.bottom <= innerHeight]; }}""")
        if not st:
            fouten.append(f"{tag}: pijl-link '{tekst}' ontbreekt in {sectie}"); continue
        href, hoogte, zicht, dekking, breedte, inbeeld = st
        if href != doel or hoogte < 43.5 or zicht != "visible" or float(dekking) < 1 or breedte == 0 or not inbeeld:
            fouten.append(f"{tag}: '{tekst}' niet goed zichtbaar, te laag of verkeerd doel ({st})")

HOME_LABELS = ["001 — De kraamcadeaubox", "002 — Werkwijze", "003 — Portfolio", "— Het atelier", "004 — Personaliseren", "005 — Over Carien", "006 — Instagram", "007 — Contact"]

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
        labels = page.evaluate("() => [...document.querySelectorAll('main [data-label]')].map(e => e.getAttribute('data-label').replace(/<[^>]+>/g, '').trim()).slice(1)")
        zicht = page.evaluate("() => [...document.querySelectorAll('main .label')].map(e => e.textContent.trim())")
        if labels != HOME_LABELS:
            fouten.append(f"{tag}: volgorde van de secties is {labels}, verwacht {HOME_LABELS}")
        if zicht != [l for l in HOME_LABELS if l[0] != "—"]:
            fouten.append(f"{tag}: zichtbare labels zijn {zicht}")
        hrefs = page.evaluate("""() => [...document.querySelectorAll('main a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')])""")
        for tekst, doel in [("Laat iets voor jou maken", "contact.html#formulier"), ("Bespreek je idee", "contact.html#formulier"), ("Neem contact op", "contact.html"),
                            ("Over Carien", "werkwijze.html#atelier"), ("Lees het verhaal", "werkwijze.html#atelier"), ("Lees het verhaal van Carien", "werkwijze.html#atelier"),
                            ("Bekijk de kraamcadeaubox", "kraamcadeauboxen.html"), ("Bekijk de werkwijze", "werkwijze.html#hoe-ik-werk"), ("Bekijk het portfolio", "portfolio.html")]:
            gevonden = [h for t, h in hrefs if t == tekst]
            if not gevonden or any(h != doel for h in gevonden):
                fouten.append(f"{tag}: '{tekst}' gaat naar {gevonden}, verwacht {doel}")
        if len([h for t, h in hrefs if t == "Bespreek je idee"]) != 3:
            fouten.append(f"{tag}: verwacht drie keer 'Bespreek je idee'")
        volgorde = [t for t, h in hrefs if t in ("Bekijk het portfolio", "Laat iets voor jou maken")]
        if volgorde != ["Bekijk het portfolio", "Laat iets voor jou maken"]:
            fouten.append(f"{tag}: in 003 hoort eerst 'Bekijk het portfolio' en dan 'Laat iets voor jou maken' ({volgorde})")
        if not page.query_selector("section#contact") or not page.query_selector("section#over"):
            fouten.append(f"{tag}: id='contact' of id='over' ontbreekt op de homepage (oude links)")
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
MAAK_RIJEN = [("babykleding", "portfolio.html#kleding"), ("siliconen", "portfolio.html#siliconen"), ("babynest", "portfolio.html#textiel"),
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
    if secties != [["", "— Werkwijze"], ["atelier", "001 — Het atelier"], ["hoe-ik-werk", "002 — Hoe ik werk"], ["personaliseren", "003 — Personaliseren"], ["wat-ik-maak", "004 — Wat ik maak"], ["contact", "005 — Contact"]]:
        fouten.append(f"{tag}: volgorde of labels van de secties kloppen niet ({secties})")
    for oud in ["atelier", "hoe-ik-werk", "babykleding", "siliconen", "babynest", "prematuur", "kraamcadeaubox"]:
        if not page.query_selector(f"#{oud}"):
            fouten.append(f"werkwijze.html: anker #{oud} ontbreekt (oude adressen /over# en /producten#)")
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
    # Wat ik maak: vijf rijen met id, foto max. 240 px (mobiel 96 px), nooit groter dan het bestand, en werkende pijl-links
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "tablet": (768, 1024, True), "mobiel": (390, 844, True)}.items():
        ctx, page = nieuwe_pagina(browser, "werkwijze.html", b, h, touch, reduced_motion="reduce")
        tag = f"werkwijze.html [{naam}, Wat ik maak]"
        page.eval_on_selector("#wat-ik-maak", "e => e.scrollIntoView()"); page.wait_for_timeout(300)
        rijen = page.evaluate("""() => [...document.querySelectorAll('#wat-ik-maak .maak-rij')].map(r => { const i = r.querySelector('img'), b = i.getBoundingClientRect();
          return [r.id, [...r.querySelectorAll('a.pijl')].map(a => a.getAttribute('href')), b.width, i.naturalWidth, !!r.querySelector('h2, h3') && !!r.querySelector('p.klein'), i.complete && i.naturalWidth > 0]; })""")
        if [(r[0], r[1]) for r in rijen] != [(i, [d]) for i, d in MAAK_RIJEN]:
            fouten.append(f"{tag}: rijen of pijl-links kloppen niet ({[(r[0], r[1]) for r in rijen]})")
        for r in rijen:
            maximaal = 96 if naam == "mobiel" else 240
            if r[2] > maximaal + 0.5 or r[2] > r[3] + 0.5 or not r[4] or not r[5]:
                fouten.append(f"{tag}: rij {r[0]}: foto {r[2]:.0f} px breed (max. {maximaal}, bestand {r[3]}) of kop/tekst ontbreekt")
        ctx.close()
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

def controleer_themas(browser):
    """Criterium 8: de bestaande criteria van de kraamcadeauboxpagina (prijsregel, negen thema's, ritme)."""
    ctx, page = nieuwe_pagina(browser, "kraamcadeauboxen.html", 390, 844, True)
    zicht = page.evaluate("""() => { const p = [...document.querySelectorAll('.pagina-kop p')].find(p => p.textContent.trim() === 'Vier formaten, van € 35 tot € 80.');
      if (!p) return null; const r = p.getBoundingClientRect(); return r.bottom <= innerHeight; }""")
    if not zicht:
        fouten.append(f"kraamcadeauboxen.html [mobiel]: 'Vier formaten, van € 35 tot € 80.' staat niet in het eerste scherm ({zicht})")
    if page.inner_text("h1").strip().lower() != "kraamcadeauboxen":
        fouten.append(f"kraamcadeauboxen.html: h1 is '{page.inner_text('h1')}', verwacht Kraamcadeauboxen")
    if page.query_selector(".hero, .hoverlijst, .kaarten"):
        fouten.append("kraamcadeauboxen.html: collage, hoverlijst of kaarten staan nog op de pagina")
    ctx.close()
    ctx, page = nieuwe_pagina(browser, "kraamcadeauboxen.html")
    themas = page.evaluate("""() => [...document.querySelectorAll('main > section.thema')].map(s => {
      const f = s.querySelector('.thema-foto'), img = f.querySelector('img'), l = s.querySelector('.thema-lopend'), sp = l.querySelector('.lopend-spoor');
      const a = sp.getAnimations()[0]; const vak = s.querySelector('.thema-vak').getBoundingClientRect(); const r = f.getBoundingClientRect();
      return { kop: s.querySelector('h2').textContent.trim(), link: [...s.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
        laag: s.getAttribute('data-achtergrond'), img: !!img.getAttribute('src'), links: (r.left - vak.left) / vak.width * 100, b: r.width, h: r.height,
        duur: a ? a.effect.getTiming().duration : null, dekking: getComputedStyle(l).opacity,
        achter: parseInt(getComputedStyle(l).zIndex) < parseInt(getComputedStyle(f).zIndex), verborgen: l.getAttribute('aria-hidden') }; })""")
    if len(themas) != 9:
        fouten.append(f"kraamcadeauboxen.html: {len(themas)} thema's, verwacht 9")
    ritme = [33.333, 8.333, 25, 8.333]
    for n, t in enumerate(themas):
        tag = f"kraamcadeauboxen.html [thema {t['kop']}]"
        if not t["img"] or t["link"] != [["Vraag dit thema aan", "contact.html#formulier"]]:
            fouten.append(f"{tag}: foto of 'Vraag dit thema aan' ontbreekt ({t['link']})")
        if abs(t["links"] - ritme[n % 4]) * 14.4 > 16:
            fouten.append(f"{tag}: linkermarge {t['links']:.2f}%, verwacht {ritme[n % 4]}%")
        if abs(t["b"] - 840) > 8 or abs(t["h"] - 480) > 8:
            fouten.append(f"{tag}: foto is {t['b']:.0f} x {t['h']:.0f}, verwacht 840 x 480")
        if t["duur"] is None or abs(t["duur"] - 30000) > 1000:
            fouten.append(f"{tag}: lopende regel duurt {t['duur']} ms, verwacht 30 s")
        if abs(float(t["dekking"]) - .2) > .01 or not t["achter"] or t["verborgen"] != "true":
            fouten.append(f"{tag}: lopende regel niet op 0,2, niet achter de foto of niet aria-hidden")
        if norm_kleur(page, t["laag"]) in THEMA_KLEUREN_VERBODEN:
            fouten.append(f"{tag}: gebruikt terracotta als laagkleur")
        if n and t["laag"].upper() == themas[n - 1]["laag"].upper():
            fouten.append(f"{tag}: zelfde laagkleur als het thema ervoor")
    pauze = page.evaluate("() => document.querySelectorAll('.thema-lopend.pauze').length")
    if pauze < 7:
        fouten.append(f"kraamcadeauboxen.html: lopende regels buiten beeld pauzeren niet ({pauze} gepauzeerd)")
    ctx.close()
    ctx, page = nieuwe_pagina(browser, "kraamcadeauboxen.html", reduced_motion="reduce")
    if page.evaluate("() => [...document.querySelectorAll('.thema .lopend-spoor')].some(s => s.getAnimations().length)"):
        fouten.append("kraamcadeauboxen.html [minder beweging]: lopende regels lopen nog")
    ctx.close()

# Geen scherm zonder inhoud: elk venster langs de pagina toont tekst of een foto
LEEG_SCHERM = """() => { const els = [...document.querySelectorAll('main h1, main h2, main p, main a, main img, main li')].filter(e => e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible');
  const h = innerHeight, totaal = document.querySelector('main').getBoundingClientRect().bottom + scrollY, leeg = [];
  for (let y = 0; y + h * .5 < totaal; y += h * .5) {
    if (!els.some(e => { const r = e.getBoundingClientRect(), t = r.top + scrollY; return t < y + h && t + r.height > y; })) leeg.push(Math.round(y)); }
  return leeg; }"""

def controleer_prematuur(browser):
    """Criterium 9: eerste scherm op 390 x 844, max. 4 secties, geen scherm zonder inhoud."""
    ctx, page = nieuwe_pagina(browser, "prematuurkleding.html", 390, 844, True)
    st = page.evaluate("""() => { const z = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      const prijs = [...document.querySelectorAll('.pagina-kop p')].find(p => p.textContent.trim() === 'Prijsrichtlijn: [prijs]');
      const wa = [...document.querySelectorAll('.pagina-kop a.pijl')].find(a => a.textContent.trim() === 'WhatsApp Carien');
      return [document.querySelector('h1').textContent.trim(), z(document.querySelector('.pagina-kop .quote')), z(prijs), z(wa), wa && wa.getAttribute('href'),
              prijs ? getComputedStyle(prijs).color : null, getComputedStyle(document.querySelector('.pagina-kop .quote')).color, parseFloat(getComputedStyle(document.querySelector('.pagina-kop .quote')).fontSize)]; }""")
    if st[0] != "Prematuurkleding" or not all(st[1:4]) or st[4] != "https://wa.me/31643791618":
        fouten.append(f"prematuurkleding.html [mobiel]: h1, quote, 'Prijsrichtlijn: [prijs]' of 'WhatsApp Carien' staan niet in het eerste scherm ({st})")
    if st[5] != INKT or st[6] != WIT or st[7] < 24:
        fouten.append(f"prematuurkleding.html [mobiel]: prijsregel hoort inkt en de quote wit vanaf 24 px ({st[5:]})")
    ctx.close()
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "mobiel": (390, 844, True)}.items():
        ctx, page = nieuwe_pagina(browser, "prematuurkleding.html", b, h, touch, reduced_motion="reduce")
        tag = f"prematuurkleding.html [{naam}]"
        secties = page.evaluate("() => [...document.querySelectorAll('main > section')].map(s => [s.id, s.getAttribute('data-achtergrond')])")
        if len(secties) > 4:
            fouten.append(f"{tag}: {len(secties)} secties, maximaal 4")
        if not secties or secties[1:2] != [["maatwerk", "#C3CFBC"]]:
            fouten.append(f"{tag}: 001 Maatwerk (#maatwerk, salie) ontbreekt ({secties})")
        st = page.evaluate("""() => [[...document.querySelectorAll('#maatwerk a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
          [...document.querySelectorAll('main .stappen > li h2')].map(h => { const k = h.cloneNode(true); k.querySelectorAll('br').forEach(b => b.replaceWith(' ')); return k.textContent.replace(/\\s+/g, ' ').trim(); }),
          [...document.querySelectorAll('main a.pijl')].filter(a => a.textContent.trim() === 'Meer over de werkwijze').map(a => a.getAttribute('href')),
          document.querySelector('#maatwerk img').getAttribute('src'), /prematuur/i.test(document.querySelector('#maatwerk img').alt)]""")
        if st[0] != [["Bespreek je idee", "contact.html#formulier"]] or st[1] != ["Samen kiezen", "Persoonlijk maken", "Met zorg gemaakt"] or st[2] != ["werkwijze.html#hoe-ik-werk"]:
            fouten.append(f"{tag}: Maatwerk of Zo werkt het klopt niet ({st[:3]})")
        if "p-broekje-kleur" not in st[3] or st[4]:
            fouten.append(f"{tag}: tijdelijke foto p-broekje-kleur ontbreekt of de alt-tekst noemt het prematuurkleding")
        leeg = page.evaluate(LEEG_SCHERM)
        if leeg:
            fouten.append(f"{tag}: scherm zonder inhoud vanaf y = {leeg}")
        ctx.close()

# Portfolio: vier groepen (criteria 10, 11 en 12)
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
        ctx, page = nieuwe_pagina(browser, "portfolio.html", b, h, touch, reduced_motion="reduce")
        tag = f"portfolio.html [{naam}]"
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
    ctx, page = nieuwe_pagina(browser, "portfolio.html")
    for gid, licht, diep in GROEPEN:
        tag = f"portfolio.html [desktop, aanwijzen {gid}]"
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
        for pagina in ["werkwijze.html", "prematuurkleding.html", "portfolio.html", "kraamcadeauboxen.html"]:
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

FORMULIER_VELDEN = [["input", "naam", "text"], ["input", "telefoon", "tel"], ["input", "email", "email"], ["select", "onderwerp", ""], ["textarea", "bericht", ""], ["input", "website", "text"]]

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
            [...f.querySelectorAll('input:not([name=website]), select, textarea')].map(e => Math.round(e.getBoundingClientRect().height)),
            new Set([...f.querySelectorAll('label:not(.val)')].map(l => Math.round(l.getBoundingClientRect().left))).size] : null; }""")
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

def controleer_zonder_js(browser):
    """Criterium 27: zonder JavaScript is alle inhoud zichtbaar; bij minder beweging geen parallax."""
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, java_script_enabled=False)
    for pagina in ["werkwijze.html", "kraamcadeauboxen.html", "prematuurkleding.html", "portfolio.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load")
        st = page.evaluate("""() => { const zicht = e => { let o = 1; for (let x = e; x; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity);
            return e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible' && o === 1; };
          return { cat: [...document.querySelectorAll('.categorie-foto img, .thema-foto img, .werk img, .werk figcaption, .maak-rij img, .maak-rij h2, .stap h2, .stap .klein, .techniek h2, .dia img, .fotorij img, .pagina-prijs')].filter(e => !zicht(e)).length,
                   stappen: [...document.querySelectorAll('.hoe-stap')].map(zicht), form: [...document.querySelectorAll('#formulier input:not([name=website]), #formulier textarea, #formulier button')].filter(e => !zicht(e)).length }; }""")
        if st["cat"] or not all(st["stappen"]) or st["form"]:
            fouten.append(f"{pagina} [zonder JavaScript]: niet alles zichtbaar ({st})")
        page.close()
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    ctx.add_init_script(INTRO_WEG)
    for pagina in ["kraamcadeauboxen.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load"); page.wait_for_timeout(300)
        page.evaluate("window.scrollTo(0, 1500)"); page.wait_for_timeout(400)
        if page.evaluate("() => [...document.querySelectorAll('.thema-foto img, .contact-kop-foto img')].some(i => i.style.getPropertyValue('--parallax'))"):
            fouten.append(f"{pagina} [minder beweging]: er is toch parallax")
        page.close()
    ctx.close()
    # bij minder beweging (met JavaScript) staat alles van de nieuwe pagina's er ook
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    ctx.add_init_script(INTRO_WEG)
    for pagina in ["werkwijze.html", "prematuurkleding.html", "portfolio.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load"); page.wait_for_timeout(300)
        weg = page.evaluate("""() => [...document.querySelectorAll('main h1, main h2, main p, main .pijl, main .werk img, main .maak-rij img')].filter(e => {
          if (e.closest('.hoe-stappen, .slider-teksten, .slider-beelden')) return false; /* tabbladen: één tegelijk zichtbaar */
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
        controleer_werkwijze(browser)
        controleer_themas(browser)
        controleer_prematuur(browser)
        controleer_portfoliopagina(browser)
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
                if page.query_selector("#portfolio"):
                    controleer_portfolio(page, tag, touch)
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
                # Personaliseren: tabbladen (alleen klik wisselt, aanwijzen niet)
                if pagina == "index.html":  # tabbladen zijn verplicht op de homepage
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
