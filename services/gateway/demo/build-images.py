#!/usr/bin/env python3
"""
Images des publications et des actualités de démonstration (SEED_DEMO=true), 16:9, et CREDITS.md :
publications/<id>.jpg et actualites/<id>.jpg, servies par la passerelle sous /demo/.

Lit les publications dans services/apps/publications/src/seed/data/publications.data.ts. Pour chacune :
- si photos.json lui attribue une photo de Wikimedia Commons (licence libre), la télécharge, la recadre en 16:9
  (« y » : position verticale du cadrage, de 0 en haut à 1 en bas, 0,5 par défaut) et y inscrit le crédit
  (auteur, licence) exigé par la licence ; CREDITS.md reprend les crédits et les liens ;
- sinon, dessine une couverture aux couleurs de sa thématique (titre, date, carte de la région ou motif graphique).
Les actualités de la section « actualites » de photos.json reçoivent leur photo de la même façon.

    python3 services/gateway/demo/build-images.py      (depuis la racine du dépôt, Pillow et Internet nécessaires)
"""

import hashlib
import io
import json
import math
import random
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SEEDS = ROOT / "services/apps/publications/src/seed/data/publications.data.ts"
REGION_MAP = ROOT / "instat-front-v2/src/data/regionMap.ts"
FONT = ROOT / "instat-front-v2/node_modules/@fontsource-variable/libre-franklin/files/libre-franklin-latin-wght-normal.woff2"
DEMO = Path(__file__).resolve().parent
OUT = DEMO / "publications"
OUT_NEWS = DEMO / "actualites"
PHOTOS = DEMO / "photos.json"
CREDITS = DEMO / "CREDITS.md"
USER_AGENT = "instat-portail-demo/1.0 (https://github.com/Ramariarison/instat-portail)"

W, H, S = 1600, 900, 2  # dessin à 2× puis réduction : contours lissés

MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

# Fond (haut, bas) et couleur d'accent par thématique ; par défaut le vert des rizières du site.
PALETTES = {
    "Économie": ("#0d3b2b", "#1b6b4d", "#e3b448"),
    "Comptes nationaux": ("#202a3a", "#34495e", "#e98a54"),
    "Démographie et population": ("#1b3550", "#2c5d80", "#f2c14e"),
    "Santé": ("#0d4744", "#16736c", "#f29e74"),
    "Travail": ("#33294a", "#544276", "#f1c27d"),
    "Conditions de vie des ménages": ("#4d1f17", "#a3382a", "#f6d38d"),
    "Agriculture, élevage et pêche": ("#2a451b", "#55802f", "#ecc65f"),
    "Éducation": ("#1f3354", "#335b8a", "#94d7c4"),
    "Eau, assainissement et hygiène": ("#0a4660", "#13739a", "#9fe0ff"),
    "Environnement": ("#173f25", "#2f6e43", "#b4dca5"),
    "Énergie et hydrocarbures": ("#3a2617", "#6e4423", "#f6ae2d"),
    "Tourisme et artisanat": ("#0b5160", "#14808f", "#ffd166"),
    "Commerce et consommation": ("#43301f", "#7a5232", "#ee8460"),
    "Impact de la COVID-19": ("#47192a", "#7d2e47", "#f4a0a0"),
}
DEFAULT_PALETTE = ("#0d3b2b", "#14573f", "#e3b448")


def rgb(hex_color, alpha=255):
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def font(size, weight):
    f = ImageFont.truetype(str(FONT), size * S)
    f.set_variation_by_axes([weight])
    return f


def read_publications():
    """Champs utiles des deux lots, lus dans le fichier TypeScript : de chaque « id: » au suivant."""
    text = SEEDS.read_text(encoding="utf-8")
    starts = [m.start() for m in re.finditer(r'\bid: "', text)]
    pubs = []
    for i, start in enumerate(starts):
        block = text[start : starts[i + 1] if i + 1 < len(starts) else len(text)]
        field = lambda name: (m.group(1) if (m := re.search(name + r': "((?:[^"\\]|\\.)*)"', block)) else None)
        pubs.append({k: field(k) for k in ("id", "title", "date", "thematique", "region")})
    return pubs


def read_regions():
    regions = {}
    for name, d in re.findall(r'\{ name: "([^"]+)", d: "([^"]+)" \}', REGION_MAP.read_text(encoding="utf-8")):
        rings = []
        for part in re.findall(r"M[^MZ]+", d):
            rings.append([tuple(map(float, p.split(","))) for p in re.findall(r"-?[\d.]+,-?[\d.]+", part)])
        regions[name] = rings
    return regions


def wrap(draw, text, f, width):
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=f) <= width or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    return lines + [line]


def background(top, bottom):
    img = Image.new("RGBA", (W * S, H * S))
    t, b = rgb(top), rgb(bottom)
    draw = ImageDraw.Draw(img)
    for y in range(H * S):
        k = y / (H * S - 1)
        draw.line([(0, y), (W * S, y)], fill=tuple(round(t[i] + (b[i] - t[i]) * k) for i in range(4)))
    # Halo clair en haut à droite.
    halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    for r in range(900 * S, 0, -12 * S):
        hd.ellipse([W * S - r, -r, W * S + r, r], fill=(255, 255, 255, max(0, int(14 * (1 - r / (900 * S))))))
    return Image.alpha_composite(img, halo)


def dot_grid(layer, box, color):
    draw = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = box
    step = 26 * S
    for x in range(x0, x1, step):
        for y in range(y0, y1, step):
            draw.ellipse([x - 2 * S, y - 2 * S, x + 2 * S, y + 2 * S], fill=color)


def motif_bars(draw, rnd, box, accent):
    x0, y0, x1, y1 = box
    n = rnd.randint(7, 11)
    gap = 14 * S
    bw = (x1 - x0 - gap * (n - 1)) / n
    level = rnd.uniform(0.35, 0.5)
    highlight = rnd.randrange(n // 2, n)
    for i in range(n):
        level = min(0.97, max(0.18, level + rnd.uniform(-0.08, 0.14)))
        top = y1 - (y1 - y0) * level
        x = x0 + i * (bw + gap)
        draw.rectangle([x, top, x + bw, y1], fill=accent if i == highlight else (255, 255, 255, 70))
    draw.line([(x0 - 20 * S, y1), (x1 + 20 * S, y1)], fill=(255, 255, 255, 140), width=2 * S)


def motif_line(draw, rnd, box, accent):
    x0, y0, x1, y1 = box
    for k in range(5):  # graduations
        y = y0 + (y1 - y0) * k / 4
        draw.line([(x0, y), (x1, y)], fill=(255, 255, 255, 40), width=S)
    for series, color, width in ((1, (255, 255, 255, 120), 3), (0, accent, 6)):
        n, v, pts = 12, rnd.uniform(0.3, 0.5), []
        for i in range(n):
            v = min(0.95, max(0.08, v + rnd.uniform(-0.12, 0.16)))
            pts.append((x0 + (x1 - x0) * i / (n - 1), y1 - (y1 - y0) * v))
        if series == 0:
            draw.polygon(pts + [(x1, y1), (x0, y1)], fill=accent[:3] + (45,))
        draw.line(pts, fill=color, width=width * S, joint="curve")
        if series == 0:
            for x, y in pts:
                r = 9 * S
                draw.ellipse([x - r, y - r, x + r, y + r], fill=accent, outline=(255, 255, 255, 230), width=3 * S)


def motif_rings(draw, rnd, box, accent):
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    radius = min(x1 - x0, y1 - y0) / 2
    for k in range(4):
        r = radius * (1 - k * 0.22)
        bounds = [cx - r, cy - r, cx + r, cy + r]
        draw.arc(bounds, 0, 360, fill=(255, 255, 255, 45), width=26 * S)
        start = rnd.uniform(-90, 0)
        draw.arc(bounds, start, start + rnd.uniform(70, 300), fill=accent if k == 0 else (255, 255, 255, 150), width=26 * S)


def motif_waffle(draw, rnd, box, accent):
    x0, y0, x1, y1 = box
    n = 10
    size = min(x1 - x0, y1 - y0)
    cell = size / n
    ox, oy = x0 + (x1 - x0 - size) / 2, y0 + (y1 - y0 - size) / 2
    filled = rnd.randint(28, 78)
    for i in range(n * n):
        row, col = divmod(i, n)
        x, y = ox + col * cell, oy + (n - 1 - row) * cell
        pad = cell * 0.16
        draw.rounded_rectangle([x + pad, y + pad, x + cell - pad, y + cell - pad], radius=4 * S,
                               fill=accent if i < filled else (255, 255, 255, 55))


def motif_map(layer, regions, highlight, box, accent):
    draw = ImageDraw.Draw(layer)
    x0, y0, x1, y1 = box
    scale = min((x1 - x0) / 400, (y1 - y0) / 785)
    ox, oy = x0 + ((x1 - x0) - 400 * scale) / 2, y0 + ((y1 - y0) - 785 * scale) / 2
    for name, rings in regions.items():
        for ring in rings:
            pts = [(ox + x * scale, oy + y * scale) for x, y in ring]
            draw.polygon(pts, fill=accent if name == highlight else (255, 255, 255, 50),
                         outline=(255, 255, 255, 150) if name == highlight else (255, 255, 255, 90))


def month_label(date):
    year, month, _ = date.split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def cover(pub, regions):
    top, bottom, accent_hex = PALETTES.get(pub["thematique"], DEFAULT_PALETTE)
    accent = rgb(accent_hex)
    rnd = random.Random(int(hashlib.sha1(pub["id"].encode()).hexdigest(), 16))

    img = background(top, bottom)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dot_grid(layer, (930 * S, 60 * S, W * S, 420 * S), (255, 255, 255, 26))
    draw = ImageDraw.Draw(layer)

    art = (980 * S, 150 * S, 1500 * S, 760 * S)
    if pub["region"] and pub["region"] in regions:
        motif_map(layer, regions, pub["region"], (1000 * S, 70 * S, 1480 * S, 840 * S), accent)
    else:
        [motif_bars, motif_line, motif_rings, motif_waffle][rnd.randrange(4)](draw, rnd, art, accent)

    # Texte.
    x, width = 100 * S, 800 * S
    draw.rectangle([x, 96 * S, x + 56 * S, 102 * S], fill=accent)
    draw.text((x, 122 * S), "INSTAT MADAGASCAR", font=font(24, 700), fill=(255, 255, 255, 235))
    draw.text((x, 156 * S), "Institut national de la statistique", font=font(20, 400), fill=(255, 255, 255, 170))

    draw.text((x, 262 * S), pub["thematique"].upper(), font=font(24, 700), fill=accent)
    for size in (60, 54, 48, 44):
        title_font = font(size, 750)
        lines = wrap(draw, pub["title"], title_font, width)
        if len(lines) <= 5:
            break
    y = 306 * S
    for line in lines[:5]:
        draw.text((x, y), line, font=title_font, fill=(255, 255, 255, 255))
        y += int(size * 1.17) * S

    footer = month_label(pub["date"]) + (f"  ·  Région {pub['region']}" if pub["region"] else "  ·  National")
    draw.line([(x, 770 * S), (x + width, 770 * S)], fill=(255, 255, 255, 70), width=S)
    draw.text((x, 792 * S), footer, font=font(24, 500), fill=(255, 255, 255, 215))
    draw.rectangle([0, H * S - 10 * S, W * S, H * S], fill=accent)

    img = Image.alpha_composite(img, layer).resize((W, H), Image.LANCZOS).convert("RGB")
    img.save(OUT / f"{pub['id']}.jpg", "JPEG", quality=84, optimize=True, progressive=True)


def fetch(url, attempts=3):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(attempts):
        try:
            return urllib.request.urlopen(request, timeout=120).read()
        except (TimeoutError, OSError):
            if attempt == attempts - 1:
                raise


def commons_info(file_title):
    """Adresse d'une version de 2000 px de large au plus, auteur, licence et page de la photo."""
    params = {"action": "query", "format": "json", "titles": file_title, "prop": "imageinfo",
              "iiprop": "url|extmetadata", "iiurlwidth": 2000}
    page = next(iter(json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
                     ["query"]["pages"].values()))
    info = page["imageinfo"][0]
    meta = info["extmetadata"]
    text = lambda key: re.sub(r"<[^>]+>", "", meta.get(key, {}).get("value", "")).strip()
    return {"url": info.get("thumburl") or info["url"], "page": info["descriptionurl"], "author": text("Artist"),
            "license": text("LicenseShortName"), "license_url": text("LicenseUrl")}


def photo(target, entry):
    info = commons_info(entry["file"])
    img = Image.open(io.BytesIO(fetch(info["url"]))).convert("RGB")
    # Recadrage 16:9 : toute la largeur si possible, position verticale choisie par « y ».
    ratio = W / H
    if img.width / img.height > ratio:
        width = round(img.height * ratio)
        left = (img.width - width) // 2
        img = img.crop((left, 0, left + width, img.height))
    else:
        height = round(img.width / ratio)
        top = round((img.height - height) * entry.get("y", 0.5))
        img = img.crop((0, top, img.width, top + height))
    img = img.resize((W, H), Image.LANCZOS).convert("RGBA")

    credit = f"Photo : {info['author']} · {info['license']} · Wikimedia Commons"
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    f = ImageFont.truetype(str(FONT), 17)
    f.set_variation_by_axes([500])
    width = draw.textlength(credit, font=f)
    draw.rounded_rectangle([W - width - 36, H - 46, W - 12, H - 14], radius=4, fill=(0, 0, 0, 140))
    draw.text((W - width - 24, H - 40), credit, font=f, fill=(255, 255, 255, 235))
    # 1280 × 720 : assez pour la fiche de la publication, deux fois plus léger que 1600 × 900.
    Image.alpha_composite(img, layer).convert("RGB").resize((1280, 720), Image.LANCZOS).save(
        target, "JPEG", quality=78, optimize=True, progressive=True)
    return info


def credit_row(name, entry, info):
    license = f"[{info['license']}]({info['license_url']})" if info["license_url"] else info["license"]
    return f"| `{name}` | [{entry['file'][5:]}]({info['page']}) | {info['author']} | {license} |"


def main():
    OUT.mkdir(exist_ok=True)
    OUT_NEWS.mkdir(exist_ok=True)
    regions = read_regions()
    photos = json.loads(PHOTOS.read_text(encoding="utf-8"))
    pubs = read_publications()
    credits = []
    for pub in pubs:
        entry = photos["publications"].get(pub["id"])
        if entry:
            info = photo(OUT / f"{pub['id']}.jpg", entry)
            credits.append(credit_row(f"publications/{pub['id']}.jpg", entry, info))
        else:
            cover(pub, regions)
    for news_id, entry in photos["actualites"].items():
        info = photo(OUT_NEWS / f"{news_id}.jpg", entry)
        credits.append(credit_row(f"actualites/{news_id}.jpg", entry, info))
    CREDITS.write_text(
        "# Crédits des photos des publications et actualités de démonstration\n\n"
        "Photos de Wikimedia Commons sous licence libre, recadrées (1280 × 720) et légendées par "
        "`build-images.py` ; le crédit figure aussi sur chaque image. Les modifications (recadrage, légende) "
        "sont diffusées sous la même licence que l'original.\n\n"
        "| Image | Original | Auteur | Licence |\n|---|---|---|---|\n" + "\n".join(credits) + "\n",
        encoding="utf-8")
    print(f"{len(pubs)} publications et {len(photos['actualites'])} actualités, {len(credits)} photos (crédits : {CREDITS.name})")


if __name__ == "__main__":
    main()
