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
  - controleert de prijstabel van de kraamcadeaubox (prijzen, producten,
    vinkjes en aantallen)
  - controleert "003 — Zo werkt het" op de kraamcadeaubox: één <ol> met drie
    stappen, de juiste koppen en geen horizontaal scrollen (1440/768/390)
  - controleert de tabbladen in Personaliseren (klik wisselt foto en kop
    binnen 1,5 s, aanwijzen niet)
  - controleert dat het portfolio precies vijf items telt, in de lijst en in
    de kaarten, en dat die overeenkomen
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
PAGINAS = ["index.html", "kraamcadeaubox.html", "privacy.html", "bedankt.html", "404.html"]
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

def bestaat(href, pagina):
    if href.startswith(("http", "mailto:", "tel:", "#", "/api/")) or href == "":
        return True
    pad = href.split("#")[0].split("?")[0]
    if pad == "":
        return True
    if pad.startswith("/"):
        doel = ROOT / pad.lstrip("/")
    else:
        doel = (ROOT / pagina).parent / pad
    if doel.is_dir():
        doel = doel / "index.html"
    return doel.exists()

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
        for pagina in ["index.html", "kraamcadeaubox.html"]:
            for manier in ["link", "end"]:
                page = ctx.new_page()
                page.goto(url(pagina), wait_until="load")
                page.wait_for_timeout(400)
                tag = f"{pagina} [{naam}, minder beweging, {manier}]"
                if manier == "link":
                    link = page.query_selector('main a.pijl[href="#contact"]')
                    if not link:
                        fouten.append(f"{tag}: geen pijl-link naar #contact gevonden"); page.close(); continue
                    link.scroll_into_view_if_needed()
                    page.wait_for_timeout(300)
                    link.click()
                else:
                    page.keyboard.press("End")
                page.wait_for_timeout(1200)
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
  const t = document.querySelector('#formaten table');
  if (!t) return null;
  const koppen = [...t.querySelectorAll('thead th')].slice(1).map(th => schoon(th.textContent));
  const rijen = [...t.querySelectorAll('tbody tr')].map(tr => [schoon(tr.querySelector('th') ? tr.querySelector('th').textContent : ''),
    [...tr.querySelectorAll('td')].map(td => schoon((td.querySelector('.sr-only') || {}).textContent || ''))]);
  const voet = [...t.querySelectorAll('tfoot td')].map(td => schoon(td.textContent));
  return [koppen, rijen, voet];
}"""

def controleer_prijstabel(browser):
    """Criterium 6 van de brief prijstabel: tabel, prijzen, producten, vinkjes en aantallen kloppen."""
    tag = "kraamcadeaubox.html [prijstabel]"
    page = browser.new_page()
    page.goto(url("kraamcadeaubox.html"), wait_until="load")
    stand = page.evaluate(LEES_PRIJSTABEL)
    page.close()
    if stand is None:
        fouten.append(f"{tag}: #formaten bevat geen <table>"); return
    koppen, rijen, voet = stand
    if koppen != PRIJZEN:
        fouten.append(f"{tag}: prijskolommen zijn {koppen}, verwacht {PRIJZEN}")
    if [r[0] for r in rijen] != list(PRODUCTEN):
        fouten.append(f"{tag}: productrijen zijn {[r[0] for r in rijen]}, verwacht {list(PRODUCTEN)}")
    for naam, cellen in rijen:
        if naam not in PRODUCTEN:
            continue
        verwacht = ["inbegrepen" if k >= PRODUCTEN[naam] else "niet inbegrepen" for k in range(1, 5)]
        if cellen != verwacht:
            fouten.append(f"{tag}: {naam} toont {cellen}, verwacht {verwacht}")
    if voet != AANTALLEN:
        fouten.append(f"{tag}: voet toont {voet}, verwacht {AANTALLEN}")

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

def controleer_portfolio(page, tag):
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
  return [uit, k ? k.getAttribute('aria-pressed') : null, document.querySelectorAll('.tegel.om, .tegel[role="button"]').length];
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
    page.wait_for_timeout(600)
    sets, gedrukt, oud = page.evaluate(LEES_SETS)
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
    page.wait_for_timeout(600)
    sets, _, _ = page.evaluate(LEES_SETS)
    if [sets.get(t) for t in WISSELEND] != ["A"] * 4:
        fouten.append(f"{tag}: terug naar set A lukt niet, tegels staan op {sets}")

def controleer_tablet(browser):
    """Geen horizontaal scrollen op 768 px (touch), ook niet na een wissel in Personaliseren."""
    ctx = browser.new_context(viewport={"width": 768, "height": 1024}, has_touch=True, is_mobile=True)
    ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
    for pagina in ["index.html", "kraamcadeaubox.html"]:
        page = ctx.new_page()
        page.goto(url(pagina), wait_until="load")
        page.wait_for_timeout(400)
        if page.query_selector(".slider [role='tab']"):
            page.eval_on_selector(".slider", "e => e.scrollIntoView({ block: 'center', behavior: 'instant' })")
            page.tap(".slider [role='tab']:nth-of-type(3)")
            page.wait_for_timeout(600)
        breedte = page.evaluate("document.documentElement.scrollWidth")
        if breedte > 768:
            fouten.append(f"{pagina} [tablet]: pagina scrollt horizontaal (scrollWidth {breedte} > 768)")
        page.close()
    ctx.close()

def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
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
                # placeholders
                tekst = page.inner_text("body")
                for p in sorted(set(re.findall(r"\[[^\]]{2,40}\]", tekst))):
                    waarschuwingen.append(f"{tag}: nog in te vullen: {p}")

                # interacties
                if page.query_selector(".hero[data-wissel]"):
                    controleer_setwissel(page, tag, naam)
                if page.query_selector("#portfolio"):
                    controleer_portfolio(page, tag)
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
                if page.query_selector(".slider [role='tab']"):
                    controleer_tabbladen(page, tag, touch)
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
