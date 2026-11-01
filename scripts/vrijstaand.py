"""
Stelt een productfoto vrij en zet hem op een huiskleur met een zachte schaduw.

Gebruik:
  python3 scripts/vrijstaand.py <origineel.jpg> <uitvoer-basisnaam> <kleur> [--schaal 0.7]
  bijv. python3 scripts/vrijstaand.py ~/fotos/shirtje.jpg public/assets/img/p-shirtje "#C3CFBC"

Maakt <basisnaam>-kleur.jpg (3:4) en <basisnaam>-kleur-vierkant.jpg (1:1).
Werkt het best met een effen achtergrond die duidelijk afwijkt van het product.
Wit product op witte achtergrond lukt niet goed: maak dan een nieuwe foto.
Vereist: opencv-python, numpy, Pillow.
"""
import sys, argparse
import numpy as np
import cv2
from PIL import Image, ImageOps, ImageFilter

HUISKLEUREN = {
    "perzik": "#DEB799", "oker": "#C89F67", "salie": "#C3CFBC", "mauve": "#B5969E",
    "olijf": "#B4B19A", "grijsblauw": "#E0E6E7", "terracotta": "#C7997E",
}

def hexrgb(h):
    h = HUISKLEUREN.get(h, h).lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def masker(rgb):
    """GrabCut met de rand als zekere achtergrond. Geeft (masker 0..255, kwaliteitsscore)."""
    h, w = rgb.shape[:2]
    schaal = 900 / max(h, w)
    klein = cv2.resize(rgb, (int(w * schaal), int(h * schaal)), interpolation=cv2.INTER_AREA)
    kh, kw = klein.shape[:2]
    rand = max(4, int(min(kh, kw) * 0.02))
    m = np.full((kh, kw), cv2.GC_PR_FGD, np.uint8)
    # pixels die sterk op de randkleur lijken: waarschijnlijk achtergrond
    # achtergrond als glooiend vlak (telefoonfoto's hebben vaak een lichtverloop)
    yy, xx = np.mgrid[0:kh, 0:kw].astype(np.float32)
    xx, yy = xx / kw, yy / kh
    randmask = np.zeros((kh, kw), bool)
    randmask[:rand * 2], randmask[-rand * 2:], randmask[:, :rand * 2], randmask[:, -rand * 2:] = True, True, True, True
    A = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1)
    vlak = np.zeros_like(klein, dtype=np.float32)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A[randmask], klein[..., c][randmask].astype(np.float32), rcond=None)
        vlak[..., c] = A @ coef
    afstand = np.linalg.norm(klein.astype(np.float32) - vlak, axis=2)
    m[afstand < 12] = cv2.GC_PR_BGD
    m[:rand], m[-rand:], m[:, :rand], m[:, -rand:] = cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(cv2.cvtColor(klein, cv2.COLOR_RGB2BGR), m, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    voor = np.where((m == cv2.GC_FGD) | (m == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    # grootste aaneengesloten vlak (plus vlakken > 3%) houden, gaatjes dichten
    n, labels, stats, _ = cv2.connectedComponentsWithStats(voor, 8)
    if n <= 1:
        return None, 0.0
    groot = stats[1:, cv2.CC_STAT_AREA]
    houd = [i + 1 for i, a in enumerate(groot) if a >= max(groot) * 0.03]
    voor = np.isin(labels, houd).astype(np.uint8) * 255
    voor = cv2.morphologyEx(voor, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    # kwaliteit: hoe scherp is de grens (weinig twijfelpixels) en raakt het product de rand niet
    twijfel = np.mean((afstand > 8) & (afstand < 22) & (voor > 0)) / max(np.mean(voor > 0), 1e-6)
    raakt_rand = voor[:2].any() or voor[-2:].any() or voor[:, :2].any() or voor[:, -2:].any()
    score = (1 - min(twijfel * 4, 1)) * (0.5 if raakt_rand else 1)
    voor = cv2.resize(voor, (w, h), interpolation=cv2.INTER_LINEAR)
    voor = cv2.GaussianBlur(voor, (0, 0), 1.1)
    return voor, float(score)

def textuur(grootte, kleur, sterkte=5, zaad=7):
    rng = np.random.default_rng(zaad)
    basis = np.zeros((grootte[1], grootte[0], 3), np.float32) + np.array(kleur, np.float32)
    ruis = rng.normal(0, sterkte, (grootte[1], grootte[0], 1)).astype(np.float32)
    ruis = cv2.GaussianBlur(ruis, (0, 0), 0.7)[..., None] if ruis.ndim == 3 else ruis
    # heel zacht licht van linksboven
    yy, xx = np.mgrid[0:grootte[1], 0:grootte[0]].astype(np.float32)
    licht = 1.04 - 0.08 * ((xx / grootte[0]) * 0.4 + (yy / grootte[1]) * 0.6)
    return Image.fromarray(np.clip((basis + ruis) * licht[..., None], 0, 255).astype(np.uint8))

def opmaken(product, alfa, kleur, maat, schaal):
    doek = textuur(maat, hexrgb(kleur))
    bb = alfa.getbbox()
    product, alfa = product.crop(bb), alfa.crop(bb)
    f = min(maat[0] * schaal / product.width, maat[1] * schaal * 0.92 / product.height)
    product = product.resize((int(product.width * f), int(product.height * f)), Image.LANCZOS)
    alfa = alfa.resize(product.size, Image.LANCZOS)
    x, y = (maat[0] - product.width) // 2, int((maat[1] - product.height) * 0.48)
    schaduw = Image.new("L", maat, 0)
    schaduw.paste(alfa.point(lambda v: int(v * 0.30)), (x + int(maat[0] * 0.012), y + int(maat[1] * 0.022)))
    schaduw = schaduw.filter(ImageFilter.GaussianBlur(maat[0] * 0.022))
    doek = Image.composite(Image.new("RGB", maat, (70, 52, 40)), doek, schaduw)
    doek.paste(product, (x, y), alfa)
    return doek

def verwerk(bron, basis, kleur, schaal=0.7, minimum=0.55):
    im = ImageOps.exif_transpose(Image.open(bron)).convert("RGB")
    im.thumbnail((2000, 2000), Image.LANCZOS)
    alfa, score = masker(np.array(im))
    if alfa is None or score < minimum:
        print(f"OVERGESLAGEN {bron}: vrijstaand niet schoon genoeg (score {score:.2f})")
        return False
    alfa = Image.fromarray(alfa)
    for achtervoegsel, maat in (("-kleur", (900, 1200)), ("-kleur-vierkant", (900, 900))):
        uit = opmaken(im, alfa, kleur, maat, schaal)
        uit.save(f"{basis}{achtervoegsel}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(f"OK {basis}-kleur.jpg (score {score:.2f})")
    return True

if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("bron"); a.add_argument("basis"); a.add_argument("kleur")
    a.add_argument("--schaal", type=float, default=0.7)
    a.add_argument("--minimum", type=float, default=0.55)
    arg = a.parse_args()
    sys.exit(0 if verwerk(arg.bron, arg.basis, arg.kleur, arg.schaal, arg.minimum) else 2)
