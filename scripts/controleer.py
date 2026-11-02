"""
LUX mini — automatische controle van de website.

Gebruik:  python3 scripts/controleer.py
Vereist:  pip install playwright  &&  playwright install chromium

Wat het doet:
  - opent elke pagina op desktop (1440 px) en mobiel (390 px)
  - controleert (bij minder beweging, 1440/768/390) dat laag en balk na een
    #contact-link en na End op Contact staan (ontwerpcriterium 12)
  - maakt screenshots in scripts/screenshots/
  - controleert kapotte links en afbeeldingen, ontbrekende alt-teksten,
    horizontaal scrollen op mobiel, JavaScript-fouten en of de
    interacties werken (foto omdraaien, hover-lijst met muis, kaarten op touch)
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

def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        controleer_contact(browser)
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
                    "img", "els => els.map(e => [e.getAttribute('src'), e.complete && e.naturalWidth > 0, e.getAttribute('alt'), e.closest('.hoverlijst') !== null || e.classList.contains('achter')])"
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
                if page.query_selector(".tegel"):
                    if naam == "mobiel":
                        page.tap(".tegel.t2")
                    else:
                        page.focus(".tegel.t2"); page.keyboard.press("Enter")
                    page.wait_for_timeout(900)
                    if not page.eval_on_selector(".tegel.t2", "e => e.classList.contains('om')"):
                        fouten.append(f"{tag}: foto draait niet om (tik of Enter-toets)")
                    page.focus(".tegel.t2"); page.keyboard.press("Enter")
                if page.query_selector(".hoverlijst button"):
                    lijst_zichtbaar = page.is_visible(".hoverlijst")
                    kaarten_zichtbaar = page.is_visible(".kaarten")
                    if touch:
                        # op touch: hover-lijst verborgen, kaarten met dezelfde foto's, namen en alt-teksten
                        if lijst_zichtbaar or not kaarten_zichtbaar:
                            fouten.append(f"{tag}: op touch hoort de kaartenrij zichtbaar en de hover-lijst verborgen")
                        knoppen = page.eval_on_selector_all(".hoverlijst button", "els => els.map(b => [b.dataset.groot, b.dataset.alt, b.textContent.trim()])")
                        kaarten = page.eval_on_selector_all(".kaarten .kaart", "els => els.map(k => [k.querySelector('img').getAttribute('src'), k.querySelector('img').getAttribute('alt'), k.querySelector('figcaption').textContent.trim()])")
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
                # woordenlijst: tweede techniek kiezen
                if page.query_selector(".woordenlijst"):
                    page.click(".woorden li:nth-child(2) button")
                    page.wait_for_timeout(1100)
                    if not page.eval_on_selector(".dia[data-index='1']", "e => e.classList.contains('aan')"):
                        fouten.append(f"{tag}: woordenlijst wisselt de foto niet")
                    page.click(".woorden li:nth-child(1) button")
                    page.wait_for_timeout(1100)
                # alles wat bij scrollen invaagt zichtbaar maken voor de screenshot
                page.evaluate("document.querySelectorAll('.opkomen, .woorden-kop, img.zoom').forEach(e => e.classList.add('in-beeld')); document.querySelectorAll('.hero').forEach(h => h.classList.add('klaar'))")
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
