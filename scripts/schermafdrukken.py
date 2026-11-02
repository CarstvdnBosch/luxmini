"""
LUX mini — schermafdrukken per schermhoogte voor de ontwerpgate.

Gebruik:  python3 scripts/schermafdrukken.py [pagina.html ...]
Maakt voor desktop (1440), tablet (768) en mobiel (390) een afdruk van elk
scherm van boven naar beneden, zoals een bezoeker de pagina doorloopt, in
scripts/schermafdrukken/<scherm>-<pagina>-<nr>.png. Animaties die bij scrollen
opkomen worden direct in eindstand gezet, zodat elk scherm compleet is.
"""
import sys, pathlib, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
ROOT = PROJECT / "public"
UIT = PROJECT / "scripts" / "schermafdrukken"
PAGINAS = sys.argv[1:] or ["index.html", "kraamcadeaubox.html"]
SCHERMEN = {"d": (1440, 900, False), "t": (768, 1024, True), "m": (390, 844, True)}

class Stil(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

def main():
    UIT.mkdir(parents=True, exist_ok=True)
    for oud in UIT.glob("*.png"):
        oud.unlink()
    srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Stil, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    basis = f"http://127.0.0.1:{srv.server_address[1]}/"
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for code, (b, h, touch) in SCHERMEN.items():
            ctx = browser.new_context(viewport={"width": b, "height": h}, has_touch=touch)
            ctx.add_init_script("try { sessionStorage.setItem('lux-intro-gezien', '1'); } catch (e) {}")
            for pagina in PAGINAS:
                page = ctx.new_page()
                page.goto(basis + pagina, wait_until="load")
                page.wait_for_timeout(1000)
                page.evaluate("document.querySelectorAll('.opkomen, .woorden-kop, img.zoom').forEach(e => e.classList.add('in-beeld')); document.querySelectorAll('.hero').forEach(e => e.classList.add('klaar'))")
                hoogte = page.evaluate("document.documentElement.scrollHeight")
                y, nr = 0, 0
                while y < hoogte:
                    page.evaluate(f"window.scrollTo({{ top: {y}, behavior: 'instant' }})")
                    page.wait_for_timeout(900)  # kleurlaag en balk laten bijkomen
                    page.screenshot(path=str(UIT / f"{code}-{pagina.replace('.html', '')}-{nr:02d}.png"))
                    y += h
                    nr += 1
                print(f"{code} {pagina}: {nr} schermen")
                page.close()
            ctx.close()
        browser.close()
    print(f"Klaar: {UIT}")

if __name__ == "__main__":
    main()
