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
  - brief navigatie-paginas: header met vier links en aria-current, menu met
    subitems (ankers met de kop in beeld), _redirects/sitemap/canonicals,
    homepage 001-007 zonder formulier, Producten (vijf categorieën, laag,
    fotomaten, inkt), thema's op de kraamcadeaubox (ritme, 840 x 480, lopende
    regel 30 s), Over (kopfoto, Hoe ik werk-tabs), Contact (kop, formulier,
    foutmelding), zonder JavaScript en bij minder beweging; pijl-links 44 px,
    data-labels en geen horizontaal scrollen op 390, 768 en 1440 px
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
PAGINAS = ["index.html", "producten.html", "kraamcadeaubox.html", "over.html", "contact.html", "privacy.html", "bedankt.html", "404.html"]
HOOFDPAGINAS = ["index.html", "producten.html", "kraamcadeaubox.html", "over.html", "contact.html"]
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
    Schone adressen (/producten) gaan naar producten.html, zoals op Cloudflare (auto-trailing-slash)."""
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
        for pagina in ["index.html", "producten.html", "kraamcadeaubox.html", "over.html"]:
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
    tag = "kraamcadeaubox.html [prijskaarten]"
    page = browser.new_page()
    page.goto(url("kraamcadeaubox.html"), wait_until="load")
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
        page.goto(url("kraamcadeaubox.html"), wait_until="load")
        page.wait_for_timeout(400)
        tag = f"kraamcadeaubox.html [003 Zo werkt het, {naam}]"
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
# Brief navigatie-paginas (2026-11-02): losse pagina's Producten, Kraamcadeaubox, Over en Contact
# =====================================================================
INTRO_WEG = "try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}"
HOOFDMENU = [("Producten", "producten"), ("Kraamcadeaubox", "kraamcadeaubox"), ("Over", "over"), ("Contact", "contact")]
INKT = "rgb(32, 32, 32)"

def nieuwe_pagina(browser, pagina, b=1440, h=900, touch=False, **extra):
    ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch, is_mobile=touch, **extra)
    ctx.add_init_script(INTRO_WEG)
    page = ctx.new_page()
    page.goto(url(pagina), wait_until="load")
    page.wait_for_timeout(500)
    return ctx, page

def schoon_doel(href):
    """'producten.html#x' of '/producten' -> 'producten'"""
    return href.split("#")[0].split("?")[0].lstrip("/").replace(".html", "")

def controleer_bestanden():
    """_redirects, sitemap, canonicals en worker-doeladressen (criteria 3, 28, 33, 34)."""
    regels = {}
    for r in (ROOT / "_redirects").read_text(encoding="utf-8").splitlines():
        d = r.split()
        if len(d) >= 3 and not r.startswith("#"):
            regels[d[0]] = (d[1], d[2])
    if regels.get("/klantenservice") != ("/contact", "301"):
        fouten.append(f"_redirects: /klantenservice hoort 301 naar /contact te gaan ({regels.get('/klantenservice')})")
    if regels.get("/over-lux") != ("/over", "301"):
        fouten.append(f"_redirects: /over-lux hoort 301 naar /over te gaan ({regels.get('/over-lux')})")
    for pad in ["/contact", "/producten", "/over", "/kraamcadeaubox"]:
        if pad in regels:
            fouten.append(f"_redirects: er staat een regel voor {pad}; die blokkeert de pagina")
    for pad, doel in {"/aanbod": "/kraamcadeaubox", "/aanbod/": "/kraamcadeaubox", "/shop": "/kraamcadeaubox", "/product-page/*": "/kraamcadeaubox", "/account/*": "/"}.items():
        if regels.get(pad) != (doel, "301"):
            fouten.append(f"_redirects: {pad} hoort ongewijzigd 301 naar {doel} te gaan")
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    for pad in ["/", "/producten", "/kraamcadeaubox", "/over", "/contact"]:
        if f"<loc>https://www.luxmini.nl{pad}</loc>" not in sitemap:
            fouten.append(f"sitemap.xml: {pad} ontbreekt")
    for pagina, schoon in [("producten.html", "producten"), ("over.html", "over"), ("contact.html", "contact"), ("kraamcadeaubox.html", "kraamcadeaubox")]:
        html = (ROOT / pagina).read_text(encoding="utf-8")
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

def controleer_navigatie(browser):
    """Criteria 1, 2, 36: vier links in de header, aria-current, menu met subitems overal gelijk."""
    menus = {}
    for pagina in PAGINAS:
        ctx, page = nieuwe_pagina(browser, pagina)
        tag = f"{pagina} [navigatie]"
        links = page.eval_on_selector_all(".site-header .menu a", "els => els.map(a => [a.textContent.trim(), a.getAttribute('href'), a.getAttribute('aria-current'), getComputedStyle(a).display !== 'none'])")
        if [(t, schoon_doel(h)) for t, h, _, _ in links] != HOOFDMENU or not all(z for *_, z in links):
            fouten.append(f"{tag}: header heeft niet precies Producten, Kraamcadeaubox, Over en Contact als zichtbare links ({links})")
        if any("#" in h for _, h, _, _ in links):
            fouten.append(f"{tag}: een hoofdlink in de header is een anker")
        huidig = [schoon_doel(h) for _, h, c, _ in links if c == "page"]
        verwacht = [pagina.replace(".html", "")] if pagina.replace(".html", "") in dict((s, 1) for _, s in HOOFDMENU) else []
        if huidig != verwacht:
            fouten.append(f"{tag}: aria-current staat op {huidig}, verwacht {verwacht}")
        for _, h, c, _ in links:
            if c == "page":
                stijl = page.eval_on_selector('.site-header .menu a[aria-current="page"]', "a => [getComputedStyle(a).textDecorationLine, getComputedStyle(a).textUnderlineOffset]")
                if "underline" not in stijl[0]:
                    fouten.append(f"{tag}: de huidige pagina is niet onderstreept ({stijl})")
        menus[pagina] = page.eval_on_selector_all("#menu-scherm a", "els => els.map(a => [a.textContent.trim(), a.getAttribute('href')])")
        ctx.close()
    norm = lambda m: [(t, schoon_doel(h) + ("#" + h.split("#")[1] if "#" in h else "")) for t, h in m]
    basis = norm(menus["index.html"])
    for pagina, m in menus.items():
        if norm(m) != basis:
            fouten.append(f"{pagina} [navigatie]: het menu over het hele scherm wijkt af van dat op de homepage")
    subs = [t for t, h in menus["index.html"] if "#" in h]
    if subs != ["Babykleding met naam", "Siliconen items", "Babynest", "Prematuurkleding", "Thema's", "Formaten en prijzen", "Zo werkt het", "Het atelier", "Hoe ik werk"]:
        fouten.append(f"index.html [navigatie]: subitems in het menu kloppen niet ({subs})")
    if any(t == "De kraamcadeaubox" for t in page_tekst_menu_koppen()):
        fouten.append("index.html [navigatie]: het blok 'De kraamcadeaubox' staat nog in de rechterkolom van het menu")
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
    # mobiel: vier hoofditems en WhatsApp zonder scrollen in beeld, subitems verborgen
    ctx, page = nieuwe_pagina(browser, "index.html", 390, 844, True, reduced_motion="reduce")
    page.click(".burger"); page.wait_for_timeout(500)
    zicht = page.evaluate("""() => {
      const z = e => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
      return [[...document.querySelectorAll('.menu-nav > ul > li > a')].map(z), z(document.querySelector('.menu-kolom a[href^="https://wa.me"]')),
              [...document.querySelectorAll('.menu-sub a')].some(a => a.getBoundingClientRect().height > 0)]; }""")
    if not all(zicht[0]) or len(zicht[0]) != 4 or not zicht[1]:
        fouten.append(f"index.html [mobiel, menu]: vier hoofditems en WhatsApp staan niet zonder scrollen in beeld ({zicht})")
    if zicht[2]:
        fouten.append("index.html [mobiel, menu]: subitems horen op mobiel verborgen te zijn")
    ctx.close()

def page_tekst_menu_koppen():
    return re.findall(r'<p class="menu-kop">([^<]+)</p>', (ROOT / "index.html").read_text(encoding="utf-8"))

def pijl_meer(page, tag):
    """Criterium 6: "Bekijk alle producten" zichtbaar zonder aanwijzen, min. 44 px, naar producten.html."""
    zoek = "() => [...document.querySelectorAll('#werkwijze a.pijl')].find(a => a.textContent.includes('Bekijk alle producten'))"
    page.evaluate(f"() => {{ const a = ({zoek})(); if (a) a.scrollIntoView({{ block: 'center', behavior: 'instant' }}); }}")
    page.wait_for_timeout(1300)  # opkomen bij scrollen duurt 0,9 s
    st = page.evaluate("""() => { const a = [...document.querySelectorAll('#werkwijze a.pijl')].find(a => a.textContent.includes('Bekijk alle producten'));
      if (!a) return null; const c = getComputedStyle(a), r = a.getBoundingClientRect();
      return [a.getAttribute('href'), r.height, c.visibility, c.opacity, r.width]; }""")
    if not st:
        fouten.append(f"{tag}: pijl-link 'Bekijk alle producten' ontbreekt in 002"); return
    href, hoogte, zicht, dekking, breedte = st
    if href != "producten.html" or hoogte < 43.5 or zicht != "visible" or float(dekking) < 1 or breedte == 0:
        fouten.append(f"{tag}: 'Bekijk alle producten' niet goed zichtbaar of te laag ({st})")

HOME_LABELS = ["001 — De kraamcadeaubox", "002 — Producten", "003 — Het gevoel", "— Het atelier", "004 — Personaliseren", "005 — Over Carien", "006 — Instagram", "007 — Contact"]

def controleer_algemeen(page, tag, pagina, naam):
    """Per pagina en scherm: data-labels, pijl-links 44 px, lopende tekst 16 px, homepage-opbouw."""
    if page.query_selector(".balk"):
        zonder = page.evaluate("() => [...document.querySelectorAll('main > section')].filter(s => !s.hasAttribute('data-label')).length")
        if zonder:
            fouten.append(f"{tag}: {zonder} sectie(s) zonder data-label")
    laag = page.evaluate("""() => [...document.querySelectorAll('main a.pijl')].filter(a => a.offsetParent !== null && getComputedStyle(a).visibility === 'visible')
      .map(a => [a.textContent.trim(), a.getBoundingClientRect().height]).filter(x => x[1] < 43.5)""")
    if laag:
        fouten.append(f"{tag}: pijl-links lager dan 44 px: {laag[:4]}")
    klein = page.evaluate("""() => [...document.querySelectorAll('main p.klein, main .verhaal, main .hoe-copy, main .gegevens-kolom p')]
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
        for tekst, doel in [("Laat iets voor jou maken", "contact.html#formulier"), ("Bespreek je idee", "contact.html#formulier"), ("Neem contact op", "contact.html")]:
            gevonden = [h for t, h in hrefs if t == tekst]
            if not gevonden or any(h != doel for h in gevonden):
                fouten.append(f"{tag}: '{tekst}' gaat naar {gevonden}, verwacht {doel}")
        if len([h for t, h in hrefs if t == "Bespreek je idee"]) != 3:
            fouten.append(f"{tag}: verwacht drie keer 'Bespreek je idee'")
        if not page.query_selector("section#contact") or not page.query_selector("section#over"):
            fouten.append(f"{tag}: id='contact' of id='over' ontbreekt op de homepage (oude links)")
        pijl_meer(page, tag)
        page.evaluate("window.scrollTo(0, 0)")

def lees_laag(page):
    return page.evaluate("getComputedStyle(document.querySelector('.achtergrond')).backgroundColor")

def norm_kleur(page, k):
    return page.evaluate("k => { const d = document.createElement('div'); d.style.color = k; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }", k)

CATEGORIEEN = [("babykleding", "#C3CFBC"), ("siliconen", "#B5969E"), ("babynest", "#B4B19A"), ("prematuur", "#E0E6E7"), ("kraamcadeaubox", "#DEB799")]

def controleer_producten(browser):
    """Criteria 8-11."""
    for naam, (b, h, touch) in {"desktop": (1440, 900, False), "mobiel": (390, 844, True)}.items():
        ctx, page = nieuwe_pagina(browser, "producten.html", b, h, touch, reduced_motion="reduce")
        tag = f"producten.html [{naam}]"
        ids = page.evaluate("() => [...document.querySelectorAll('main > section.categorie')].map(s => s.id)")
        if ids != [c[0] for c in CATEGORIEEN]:
            fouten.append(f"{tag}: categorieën zijn {ids}")
        for n, (id_, kleur) in enumerate(CATEGORIEEN):
            page.eval_on_selector(f"#{id_}", "e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + (e.offsetHeight - innerHeight) / 2)")
            page.wait_for_timeout(500)
            st = page.evaluate("""id => { const s = document.getElementById(id); const z = e => e.getBoundingClientRect();
              const f = s.querySelector('.categorie-foto img'), t = s.querySelector('.categorie-tekst');
              const delen = [s.querySelector('.categorie-label'), s.querySelector('h2'), s.querySelector('p.klein'), s.querySelector('a.pijl'), f];
              const kleuren = [...s.querySelectorAll('.categorie-label, h2, p.klein, a.pijl')].map(e => getComputedStyle(e).color);
              return { alles: delen.every(e => { const r = z(e); return r.top >= 0 && r.bottom <= innerHeight; }),
                       foto: [z(f).width, z(f).height, f.naturalWidth, f.naturalHeight, z(f).left], tekst: z(t).left, kleuren }; }""", id_)
            if naam == "desktop":
                if page.evaluate("() => getComputedStyle(document.querySelector('.achtergrond')).backgroundColor") != norm_kleur(page, kleur):
                    fouten.append(f"{tag}: laag bij {id_} is {lees_laag(page)}, verwacht {kleur}")
                if not st["alles"]:
                    fouten.append(f"{tag}: {id_}: label, kop, alinea, pijl-link en foto staan niet samen in één scherm")
                foto_rechts = st["foto"][4] > st["tekst"]
                if foto_rechts != (n % 2 == 0):
                    fouten.append(f"{tag}: {id_}: tekst en foto staan niet om en om (foto rechts = {foto_rechts})")
                if id_ != "babynest" and st["foto"][0] > 481:
                    fouten.append(f"{tag}: {id_}: foto is {st['foto'][0]} px breed, max. 480")
            w, hh, nw, nh, _ = st["foto"]
            if w > nw + 0.5 or (id_ == "babynest" and w > 324.5):
                fouten.append(f"{tag}: {id_}: foto wordt vergroot ({w:.0f} px breed, bestand {nw} px)")
            if any(c != INKT for c in st["kleuren"]):
                fouten.append(f"{tag}: {id_}: tekst op de categoriekleur is niet inkt ({st['kleuren']})")
        ctx.close()

THEMA_KLEUREN_VERBODEN = {"rgb(188, 133, 101)"}  # terracotta

def controleer_themas(browser):
    """Criteria 12-15 en kraamcadeauboxkop."""
    ctx, page = nieuwe_pagina(browser, "kraamcadeaubox.html", 390, 844, True)
    zicht = page.evaluate("""() => { const p = [...document.querySelectorAll('.pagina-kop p')].find(p => p.textContent.trim() === 'Vier formaten, van € 35 tot € 80.');
      if (!p) return null; const r = p.getBoundingClientRect(); return r.bottom <= innerHeight; }""")
    if not zicht:
        fouten.append(f"kraamcadeaubox.html [mobiel]: 'Vier formaten, van € 35 tot € 80.' staat niet in het eerste scherm ({zicht})")
    if page.query_selector(".hero, .hoverlijst, .kaarten"):
        fouten.append("kraamcadeaubox.html: collage, hoverlijst of kaarten staan nog op de pagina")
    ctx.close()
    ctx, page = nieuwe_pagina(browser, "kraamcadeaubox.html")
    themas = page.evaluate("""() => [...document.querySelectorAll('main > section.thema')].map(s => {
      const f = s.querySelector('.thema-foto'), img = f.querySelector('img'), l = s.querySelector('.thema-lopend'), sp = l.querySelector('.lopend-spoor');
      const a = sp.getAnimations()[0]; const vak = s.querySelector('.thema-vak').getBoundingClientRect(); const r = f.getBoundingClientRect();
      return { kop: s.querySelector('h2').textContent.trim(), link: [...s.querySelectorAll('a.pijl')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
        laag: s.getAttribute('data-achtergrond'), img: !!img.getAttribute('src'), links: (r.left - vak.left) / vak.width * 100, b: r.width, h: r.height,
        duur: a ? a.effect.getTiming().duration : null, dekking: getComputedStyle(l).opacity,
        achter: parseInt(getComputedStyle(l).zIndex) < parseInt(getComputedStyle(f).zIndex), verborgen: l.getAttribute('aria-hidden') }; })""")
    if len(themas) != 9:
        fouten.append(f"kraamcadeaubox.html: {len(themas)} thema's, verwacht 9")
    ritme = [33.333, 8.333, 25, 8.333]
    for n, t in enumerate(themas):
        tag = f"kraamcadeaubox.html [thema {t['kop']}]"
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
        kleur = norm_kleur(page, t["laag"]).replace("rgb", "rgb")
        if kleur in THEMA_KLEUREN_VERBODEN:
            fouten.append(f"{tag}: gebruikt terracotta als laagkleur")
        if n and t["laag"].upper() == themas[n - 1]["laag"].upper():
            fouten.append(f"{tag}: zelfde laagkleur als het thema ervoor")
    # buiten beeld pauzeert de lopende regel
    pauze = page.evaluate("() => document.querySelectorAll('.thema-lopend.pauze').length")
    if pauze < 7:
        fouten.append(f"kraamcadeaubox.html: lopende regels buiten beeld pauzeren niet ({pauze} gepauzeerd)")
    ctx.close()
    ctx, page = nieuwe_pagina(browser, "kraamcadeaubox.html", reduced_motion="reduce")
    if page.evaluate("() => [...document.querySelectorAll('.thema .lopend-spoor')].some(s => s.getAnimations().length)"):
        fouten.append("kraamcadeaubox.html [minder beweging]: lopende regels lopen nog")
    ctx.close()

def controleer_over(browser):
    """Criteria 17-19."""
    ctx, page = nieuwe_pagina(browser, "over.html")
    links, rechts, w, h = page.evaluate("""() => { const f = document.querySelector('.over-kop-foto').getBoundingClientRect();
      return [f.left, document.documentElement.clientWidth - f.right, f.width, f.height]; }""")
    if abs(links - rechts) > 8 or abs(w - 480) > 2 or abs(h - 720) > 2:
        fouten.append(f"over.html [desktop]: kopfoto niet gecentreerd of niet 480 x 720 ({links:.0f}/{rechts:.0f}, {w:.0f} x {h:.0f})")
    if page.evaluate("() => /review|★/i.test(document.querySelector('main').textContent)"):
        fouten.append("over.html: er staat iets dat op een review lijkt")
    verhaal = page.inner_text(".verhaal")
    if "moeder van twee dochters en oma van vier kleinkinderen" not in verhaal or "net iets anders en persoonlijks." not in verhaal:
        fouten.append("over.html: het verhaal van Carien is niet de bestaande tekst")
    # Hoe ik werk: aanwijzen wisselt niet, klik wel
    page.eval_on_selector("#hoe-ik-werk", "e => e.scrollIntoView()"); page.wait_for_timeout(300)
    lees = "() => [[...document.querySelectorAll('.hoe-tab')].map(t => t.getAttribute('aria-selected')), [...document.querySelectorAll('.hoe-stap')].map(s => getComputedStyle(s).visibility)]"
    page.hover(".hoe-tab:nth-child(2)"); page.wait_for_timeout(500)
    if page.evaluate(lees)[0] != ["true", "false", "false"]:
        fouten.append("over.html [desktop]: aanwijzen wisselt de stap in Hoe ik werk")
    page.click(".hoe-tab:nth-child(2)"); page.wait_for_timeout(600)
    if page.evaluate(lees) != [["false", "true", "false"], ["hidden", "visible", "hidden"]]:
        fouten.append(f"over.html [desktop]: klik op stap 2 toont niet stap 2 ({page.evaluate(lees)})")
    page.focus(".hoe-tab:nth-child(2)"); page.keyboard.press("ArrowDown"); page.keyboard.press("Enter"); page.wait_for_timeout(600)
    if page.evaluate(lees)[0] != ["false", "false", "true"]:
        fouten.append("over.html [desktop]: Enter op stap 3 wisselt niet")
    page.keyboard.press("ArrowUp"); page.keyboard.press(" "); page.wait_for_timeout(600)
    if page.evaluate(lees)[0] != ["false", "true", "false"]:
        fouten.append("over.html [desktop]: Spatie op stap 2 wisselt niet")
    groot = page.evaluate("() => { const r = document.querySelector('.hoe-foto img').getBoundingClientRect(); return [r.width, r.height]; }")
    if max(groot[0] / 1800, groot[1] / 900) > 1.001:  # object-fit: cover vergroot met de grootste factor
        fouten.append(f"over.html [desktop]: achtergrondfoto wordt vergroot ({groot})")
    ctx.close()
    ctx, page = nieuwe_pagina(browser, "over.html", 390, 844, True)
    st = page.evaluate("""() => { const f = document.querySelector('.over-kop-foto').getBoundingClientRect(), k = document.querySelector('.over-kop .kop-xl').getBoundingClientRect();
      return [k.top >= f.bottom, [...document.querySelectorAll('.hoe-stap')].map(s => getComputedStyle(s).visibility === 'visible' && s.offsetHeight > 0), !!document.querySelector('.hoe-tabs:not([hidden])')]; }""")
    if not st[0]:
        fouten.append("over.html [mobiel]: de kop staat over de foto in plaats van eronder")
    if st[1] != [True, True, True] or st[2]:
        fouten.append(f"over.html [mobiel]: de drie stappen staan niet onder elkaar ({st})")
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
    for pagina in ["producten.html", "kraamcadeaubox.html", "over.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load")
        st = page.evaluate("""() => { const zicht = e => e.offsetHeight > 0 && getComputedStyle(e).visibility === 'visible' && getComputedStyle(e).opacity === '1';
          return { cat: [...document.querySelectorAll('.categorie-foto img, .thema-foto img')].filter(e => !zicht(e)).length,
                   stappen: [...document.querySelectorAll('.hoe-stap')].map(zicht), form: [...document.querySelectorAll('#formulier input:not([name=website]), #formulier textarea, #formulier button')].filter(e => !zicht(e)).length }; }""")
        if st["cat"] or not all(st["stappen"]) or st["form"]:
            fouten.append(f"{pagina} [zonder JavaScript]: niet alles zichtbaar ({st})")
        page.close()
    ctx.close()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    ctx.add_init_script(INTRO_WEG)
    for pagina in ["kraamcadeaubox.html", "contact.html"]:
        page = ctx.new_page(); page.goto(url(pagina), wait_until="load"); page.wait_for_timeout(300)
        page.evaluate("window.scrollTo(0, 1500)"); page.wait_for_timeout(400)
        if page.evaluate("() => [...document.querySelectorAll('.thema-foto img, .contact-kop-foto img')].some(i => i.style.getPropertyValue('--parallax'))"):
            fouten.append(f"{pagina} [minder beweging]: er is toch parallax")
        page.close()
    ctx.close()

def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    controleer_headers()
    controleer_bestanden()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        controleer_navigatie(browser)
        controleer_producten(browser)
        controleer_themas(browser)
        controleer_over(browser)
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
