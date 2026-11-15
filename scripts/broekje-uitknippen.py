#!/usr/bin/env python3
"""Broekje uit de Instagram-foto knippen voor het zachte schommelen op de homepage (004 Instagram).

Brief: docs/wijzigingen/2026-11-15-instagram-pakje-schommelt.md (besluit Carst: alleen het broekje, skewX,
bovenrand vast op de onderkant van de zoom van het shirt).

Deterministisch: een vaste, met de hand getekende polygoon per broekspijp (gemeten op uitvergrotingen van het
bestand van 480 x 640) en vaste regels voor het opvullen. Geen AI en geen generatief invullen: de achtergrond
achter het broekje wordt alleen opgevuld met pixels uit dezelfde foto:
  - muur: genormaliseerde convolutie (gewogen gemiddelde van de bekende muurpixels eromheen);
  - onderste sport: lineaire interpolatie langs de richting van de sport (rijen evenwijdig aan de bovenrand);
  - staander rechts: de eerstvolgende bekende pixel van de staander in dezelfde rij.
De schaduw van de broekzoompjes op de onderste sport hoort bij de bewegende laag.

Uitvoer (beide dezelfde uitsnede, uitgelijnd op het 16-pixelraster van de JPEG van het origineel):
  public/assets/img/ig-outfit-ladder-achtergrond.jpg   muur en sport, broekje weggehaald en opgevuld
  public/assets/img/ig-outfit-broekje.webp            broekje (met schaduwrandje) met alfa

Het origineel public/assets/img/ig-outfit-ladder.jpg wordt alleen gelezen.
Gebruik:  python3 scripts/broekje-uitknippen.py [--proef map]   (--proef: ook stilstaande proefbeelden)
Vereist (alleen voor dit script, niet voor de site): Pillow en OpenCV (opencv-python).
"""
import io
import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'public', 'assets', 'img')
BRON = os.path.join(IMG, 'ig-outfit-ladder.jpg')
UIT_ACHTERGROND = os.path.join(IMG, 'ig-outfit-ladder-achtergrond.jpg')
UIT_BROEKJE = os.path.join(IMG, 'ig-outfit-broekje.webp')

# Uitsnede (x0, y0, x1, y1) in het bestand, veelvoud van 16 (zelfde blokken als de JPEG van het origineel).
UITSNEDE = (32, 400, 416, 624)
# Draaipunt van skewX: de onderkant van de zoom van het shirt boven de pijpen (mediaan van de gemeten zoomlijn).
DRAAIPUNT_Y = 423
# Grootste uitslag (ontwerprichting): 2,5 graden.
HOEK = 2.5
WEBP_KWALITEIT = 94

# --- Polygonen (bestandspixels; een pixel x beslaat [x, x+1)) -----------------------------------------
# Linkerpijp: bovenrand langs de onderkant van de shirtzoom, rechts omlaag, zoom van rechts naar links, links omhoog.
LINKERPIJP = [
    (101.5, 417), (110, 418), (120, 419.5), (130, 420.5), (150, 421.5), (170, 422.5), (190, 422.5), (204, 422),
    (205, 426), (201, 433), (199, 440), (197, 450), (195.5, 457), (193.5, 463), (192.5, 470), (191.5, 478),
    (191, 490), (191, 504), (192, 512), (191, 520), (191.5, 534), (192, 546), (194, 552), (196, 558), (197, 566),
    (198.5, 574), (199.5, 582), (200, 588), (198.5, 592.5), (195.5, 595.5), (190, 597), (180, 597.5),
    (160, 596.5), (140, 595.5), (120, 593.5), (100, 591.5), (80, 590.5), (60, 589.5), (52, 587.5), (48, 584),
    (47.5, 578), (48.5, 570), (50.5, 563), (52.5, 557), (54.5, 552), (56.5, 545), (58, 540), (61.5, 534),
    (62.5, 528), (63, 522), (68, 516), (71.5, 510), (73.5, 504), (75, 498), (78.5, 492), (80, 486), (81, 480),
    (84.5, 474), (88, 466), (89.5, 460), (92, 454), (94, 449), (95.5, 444), (97, 437), (97, 430), (98.5, 423),
]
# Rechterpijp met het LUX-labeltje aan de buitennaad.
RECHTERPIJP = [
    (267.5, 427.5), (275, 425.5), (290, 424), (310, 421), (330, 420), (350, 418), (360, 417), (367, 416.5),
    (367.5, 432), (368, 446), (369, 452), (370, 462), (371, 468), (372, 474), (373, 480), (375, 486), (375.5, 492),
    (376, 499), (377, 505), (378.5, 510), (380, 515), (380.5, 518.5),
    (391.5, 517.5), (398.5, 534.5), (387.5, 538.5),  # labeltje
    (388, 542), (390, 548), (391.5, 554), (392.5, 560), (394, 566), (395, 572), (395, 577), (393.5, 581),
    (389.5, 585), (385, 586.5), (380, 587.5), (370, 589.5), (360, 590.5), (350, 592.5), (340, 593.5),
    (330, 595.5), (320, 597.5), (310, 598.5), (300, 599.5), (290, 599.5), (280, 598.5), (272, 596.5),
    (267.5, 594), (266, 590), (267.5, 582), (267.5, 572), (268, 566), (270, 560), (271, 552), (272, 546),
    (273, 540), (274, 532), (275.5, 524), (276.5, 518), (278, 512), (279, 504), (279, 494), (280, 486),
    (279, 480), (278, 474), (277, 468), (274, 463), (272.5, 457), (271.5, 450), (271, 440), (268.5, 433),
]
# Schaduwrandje van de zoompjes op de onderste sport (zachte rand, beweegt mee).
SCHADUW_LINKS = [
    (90, 592), (100, 591.5), (120, 593.5), (140, 595.5), (160, 596.5), (180, 597.5), (190, 597), (195.5, 595.5),
    (198.5, 592.5), (204, 594), (208, 597.5), (207, 603), (195, 606), (170, 606.5), (140, 606), (110, 605),
    (92, 604),
]
SCHADUW_RECHTS = [
    (265, 590), (267.5, 594), (272, 596.5), (280, 598.5), (290, 599.5), (300, 599.5), (310, 598.5), (320, 597.5),
    (330, 595.5), (340, 593.5), (350, 592.5), (360, 590.5), (370, 589.5), (380, 587.5), (389.5, 585),
    (393.5, 581), (395, 577), (398, 580), (398, 592), (385, 594), (370, 595.5), (350, 598.5), (330, 601.5),
    (310, 604.5), (290, 605.5), (276, 604.5), (266, 600),
]
# Bovenrand van de onderste sport (wand -> hout), gemeten links en rechts van de pijpen.
SPORT_RAND = [(30, 603.0), (98, 601.2), (204, 595.5), (264, 592.0), (397, 588.3), (420, 587.8)]


def sportrand(x):
    xs, ys = zip(*SPORT_RAND)
    return np.interp(x, xs, ys)


def staanderrand(y):
    """Linkerrand van de rechterstaander (gemeten boven en onder het labeltje en naast de zoom)."""
    return np.interp(y, [400, 545, 560, 640], [399.5, 399.5, 398.0, 397.5])


def dekking(polygonen, h, w, schaal=8):
    """Anti-aliased dekking (0..1) van polygonen, via 8x overbemonstering."""
    groot = np.zeros((h * schaal, w * schaal), np.uint8)
    for p in polygonen:
        pts = np.round(np.array(p, np.float64) * schaal).astype(np.int32)
        cv2.fillPoly(groot, [pts], 255, lineType=cv2.LINE_8)
    return cv2.resize(groot, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0


def vul_muur(img, bekend, gat):
    """Genormaliseerde convolutie: gewogen gemiddelde van bekende muurpixels; grotere straal waar nodig."""
    uit = img.copy()
    w = bekend.astype(np.float32)
    rest = gat.copy()
    for sigma in (2.5, 5.0, 10.0, 25.0, 60.0):
        k = int(sigma * 4) | 1
        num = cv2.GaussianBlur(img * w[..., None], (k, k), sigma)
        den = cv2.GaussianBlur(w, (k, k), sigma)
        ok = rest & (den > (0.05 if sigma < 60 else 1e-6))
        uit[ok] = num[ok] / den[ok][:, None]
        rest &= ~ok
    assert not rest.any(), ('muur niet helemaal opgevuld', np.argwhere(rest)[:5], rest.sum())
    # Gladstrijken (harmonisch, vaste 400 stappen): elk gatpixel wordt het gemiddelde van zijn buren die muur of gat
    # zijn. Zo verdwijnen de overgangen tussen de stralen; de bekende muurpixels blijven vast.
    mee = (bekend | gat).astype(np.float32)
    for _ in range(400):
        p = np.pad(uit, ((1, 1), (1, 1), (0, 0)), mode='edge')
        m = np.pad(mee, 1)
        som = (p[:-2, 1:-1] * m[:-2, 1:-1, None] + p[2:, 1:-1] * m[2:, 1:-1, None]
               + p[1:-1, :-2] * m[1:-1, :-2, None] + p[1:-1, 2:] * m[1:-1, 2:, None])
        n = m[:-2, 1:-1] + m[2:, 1:-1] + m[1:-1, :-2] + m[1:-1, 2:]
        nieuw = som / np.maximum(n, 1)[..., None]
        uit[gat] = nieuw[gat]
    return uit


def vul_sport(img, bekend, gat):
    """Lineaire interpolatie langs rijen evenwijdig aan de bovenrand van de sport."""
    h, w = gat.shape
    xs = np.arange(w, dtype=np.float32)
    rand = sportrand(xs).astype(np.float32)
    ds = np.arange(-10, 34)
    lijnen = {}
    for d in ds:
        mapx = xs[None, :].astype(np.float32); mapy = (rand + np.float32(d))[None, :].astype(np.float32)
        lijn = cv2.remap(img, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)[0]
        kb = cv2.remap(bekend.astype(np.float32), mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)[0] > 0.999
        kb[(xs < 37) | (xs > 398)] = False
        idx = np.where(kb)[0]
        gevuld = lijn.copy()
        if len(idx):
            for c in range(3):
                # gemiddelde van drie bekende buren per kant beperkt ruis; dan lineair over het gat
                v = lijn[idx, c]
                vg = np.convolve(np.pad(v, 1, mode='edge'), np.ones(3) / 3, mode='valid')
                gevuld[:, c] = np.interp(xs, idx.astype(np.float32), vg)
            gevuld[kb] = lijn[kb]
        lijnen[int(d)] = gevuld
    uit = img.copy()
    yy, xx = np.nonzero(gat)
    for y, x in zip(yy, xx):
        d = y - rand[x]
        d0 = int(np.floor(d)); f = d - d0
        d0 = max(ds[0], min(ds[-1] - 1, d0))
        uit[y, x] = lijnen[d0][x] * (1 - f) + lijnen[d0 + 1][x] * f
    return uit


def maak():
    bgr = cv2.imread(BRON, cv2.IMREAD_COLOR)
    h, w = bgr.shape[:2]
    img = bgr.astype(np.float32)

    a_broek = np.clip(cv2.GaussianBlur(dekking([LINKERPIJP, RECHTERPIJP], h, w), (0, 0), 0.45), 0, 1)
    a_broek[a_broek < 0.02] = 0
    r_schaduw = np.clip(cv2.GaussianBlur(dekking([SCHADUW_LINKS, SCHADUW_RECHTS], h, w), (0, 0), 0.8), 0, 1)
    r_schaduw[r_schaduw < 0.02] = 0

    ys, xs = np.mgrid[0:h, 0:w]
    # Gat in de achtergrond: alles waar het broekje of de schaduw meetelt, 2 px ruimer (JPEG-randjes weg);
    # bij de shirtzoom (boven y 432) niet ruimer, zodat het shirt in de achtergrond onaangeroerd blijft.
    iets = (a_broek > 0) | (r_schaduw > 0)
    gat = cv2.dilate(iets.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    gat &= iets | (ys >= 432)
    rand = sportrand(xs.astype(np.float32))
    staander = xs >= staanderrand(ys.astype(np.float32))
    hout = (ys >= rand) & ~staander
    muur = (ys < rand) & ~staander

    # Bekende pixels per vlak (buiten het gat, binnen de ladder, onder het shirt). De band rond de bovenrand van de
    # sport (vanaf 8 px erboven) wordt langs de richting van de sport opgevuld, zodat muur, donkere rand en hout
    # van links en rechts doorlopen; daarboven alleen muur.
    binnen = (xs >= 37) & (xs <= 398)
    BAND = 8
    bekend_muur = ~gat & muur & binnen & (ys >= 428) & (ys < rand - BAND + 3)
    bekend_sport = ~gat & ~staander & binnen & (ys >= rand - BAND)

    vm = vul_muur(img, bekend_muur, gat & (ys < rand - BAND + 4))
    vh = vul_sport(img, bekend_sport, gat & (ys >= rand - BAND))
    achter = img.copy()
    t = np.clip((ys - (rand - BAND)) / 2, 0, 1)[..., None]  # overgang van 2 px tussen beide vullingen
    gemengd = vm * (1 - t) + vh * t
    sel = gat & ~staander
    achter[sel] = gemengd[sel]
    # Staander: per rij de eerste bekende pixel rechts van het gat.
    for y, x in zip(*np.nonzero(gat & staander)):
        xr = x
        while xr < w - 1 and gat[y, xr]:
            xr += 1
        achter[y, x] = img[y, xr]

    # Kleinste dekking waarbij de voorgrond P = B + (O - B) / a binnen 0..255 blijft (per kanaal). Zo is
    # a*P + (1-a)*B in rust precies het origineel. De schaduw krijgt alleen deze dekking (een donkere, half
    # doorzichtige laag); het broekje minstens de dekking van de polygoon.
    B = np.maximum(achter, 0.5)
    a_min = np.max(np.maximum((B - img) / B, (img - B) / np.maximum(255 - B, 0.5)), axis=2)
    a_min = np.clip(a_min, 0, 1)
    a_schaduw = a_min * np.clip(r_schaduw * 2, 0, 1)  # alleen de buitenste halve pixel van de schaduwpolygoon zacht
    alfa = np.where(a_broek > 0, np.maximum(a_broek, a_min), a_schaduw)
    # De rand van 2 px rond broekje en schaduw (in het gat, maar buiten de polygonen) bevat nog wat onscherpte van de
    # stof. Die beweegt mee met de kleinste dekking, zodat er geen schim achterblijft en de rust gelijk blijft.
    rand_px = gat & (a_broek == 0) & (r_schaduw == 0) & ~staander
    alfa = np.where(rand_px & (a_min > 0.06), a_min, alfa)
    alfa[alfa < 0.02] = 0
    # Waar de dekking is weggevallen, moet de achtergrond het origineel zijn (anders verschil in rust).
    nul = gat & (alfa == 0) & (r_schaduw > 0)
    achter[nul] = img[nul]

    a3 = alfa[..., None]
    voor = np.where(a3 > 0, achter + (img - achter) / np.maximum(a3, 1e-3), img)
    voor = np.clip(voor, 0, 255)

    x0, y0, x1, y1 = UITSNEDE
    assert not gat[:y0].any() and not gat[y1:].any() and not gat[:, :x0].any() and not gat[:, x1:].any(), 'gat valt buiten de uitsnede'
    achter_u = np.clip(np.round(achter[y0:y1, x0:x1]), 0, 255).astype(np.uint8)
    voor_u = np.clip(np.round(voor[y0:y1, x0:x1]), 0, 255).astype(np.uint8)
    alfa_u = np.round(alfa[y0:y1, x0:x1] * 255).astype(np.uint8)
    voor_u[alfa_u == 0] = 0

    bron = Image.open(BRON)
    rgb_achter = Image.fromarray(cv2.cvtColor(achter_u, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    # Zelfde kwantisatietabellen en subsampling als het origineel: de ongewijzigde blokken blijven (bijna) gelijk.
    rgb_achter.save(buf, 'JPEG', qtables=bron.quantization, subsampling=2, optimize=True, progressive=True)
    data_achter = buf.getvalue()

    rgba = np.dstack([cv2.cvtColor(voor_u, cv2.COLOR_BGR2RGB), alfa_u])
    buf = io.BytesIO()
    Image.fromarray(rgba, 'RGBA').save(buf, 'WEBP', quality=WEBP_KWALITEIT, alpha_quality=100, method=6, exact=False)
    data_broek = buf.getvalue()

    with open(UIT_ACHTERGROND, 'wb') as f:
        f.write(data_achter)
    with open(UIT_BROEKJE, 'wb') as f:
        f.write(data_broek)
    orig = os.path.getsize(BRON)
    print(f'{os.path.relpath(UIT_ACHTERGROND, ROOT)}: {len(data_achter)} bytes, {x1 - x0} x {y1 - y0}')
    print(f'{os.path.relpath(UIT_BROEKJE, ROOT)}: {len(data_broek)} bytes, {x1 - x0} x {y1 - y0}')
    print(f'samen {len(data_achter) + len(data_broek)} bytes = {(len(data_achter) + len(data_broek)) / orig:.2f} x origineel ({orig})')
    zoom_y = max(y for p in (LINKERPIJP, RECHTERPIJP) for _, y in p)
    print(f'draaipunt y {DRAAIPUNT_Y}; zoom onderaan y {zoom_y}: uitslag {(zoom_y - DRAAIPUNT_Y) * np.tan(np.radians(HOEK)):.1f} px bij {HOEK} graden')
    print(f'CSS: left {x0 / w * 100:.4f}%  top {y0 / h * 100:.4f}%  width {(x1 - x0) / w * 100:.4f}%  height {(y1 - y0) / h * 100:.4f}%  '
          f'transform-origin y {(DRAAIPUNT_Y - y0) / (y1 - y0) * 100:.4f}%')


def proef(map_):
    """Stilstaande beelden: samengesteld bij 0, +HOEK en -HOEK, zoals de browser (bilineair), plus uitvergrotingen."""
    os.makedirs(map_, exist_ok=True)
    orig = cv2.imread(BRON).astype(np.float32)
    h, w = orig.shape[:2]
    x0, y0, x1, y1 = UITSNEDE
    achter = cv2.imread(UIT_ACHTERGROND).astype(np.float32)
    rgba = np.array(Image.open(UIT_BROEKJE).convert('RGBA')).astype(np.float32)
    voor = cv2.cvtColor(rgba[..., :3], cv2.COLOR_RGB2BGR); a = rgba[..., 3:] / 255.0

    def samen(hoek):
        k = np.tan(np.radians(hoek))
        oy = DRAAIPUNT_Y - y0
        M = np.float32([[1, k, -k * oy], [0, 1, 0]])
        size = (x1 - x0, y1 - y0)
        pv = cv2.warpAffine(voor * a, M, size, flags=cv2.INTER_LINEAR)
        pa = cv2.warpAffine(a, M, size, flags=cv2.INTER_LINEAR)[..., None]
        uit = orig.copy()
        uit[y0:y1, x0:x1] = pv + achter * (1 - pa)
        return np.clip(np.round(uit), 0, 255).astype(np.uint8)

    standen = {'rust': samen(0), 'plus': samen(HOEK), 'min': samen(-HOEK)}
    verschil = np.abs(standen['rust'].astype(int) - orig.astype(int))
    print(f'rust tegen origineel: max {verschil.max()}, gemiddeld {verschil.mean():.3f}, pixels > 8: {(verschil.max(2) > 8).sum()}')
    def mobiel(img):  # 4:5 met object-position 50% 40% -> rij 16 t/m 616
        return cv2.resize(img[16:616], (390, 488), interpolation=cv2.INTER_AREA)
    def desktop(img):  # 1440 px: de post is 400 px breed (33,333 % van 1200 px)
        return cv2.resize(img, (400, 533), interpolation=cv2.INTER_AREA)
    for naam, img in standen.items():
        cv2.imwrite(os.path.join(map_, f'{naam}-bestand-1x.png'), img)
        cv2.imwrite(os.path.join(map_, f'{naam}-bestand-2x.png'), cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC))
        cv2.imwrite(os.path.join(map_, f'{naam}-mobiel-390.png'), mobiel(img))
        cv2.imwrite(os.path.join(map_, f'{naam}-desktop.png'), desktop(img))
        detail = img[400:612, 30:410]
        cv2.imwrite(os.path.join(map_, f'{naam}-broekje-4x.png'), cv2.resize(detail, None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST))
    cv2.imwrite(os.path.join(map_, 'achtergrond-opgevuld.png'), achter.astype(np.uint8))


if __name__ == '__main__':
    maak()
    if '--proef' in sys.argv:
        proef(sys.argv[sys.argv.index('--proef') + 1])
