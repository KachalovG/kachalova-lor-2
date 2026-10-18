"""Prepare local fonts and responsive photographs. Does not create dist."""
from pathlib import Path
from urllib.request import urlretrieve
from PIL import Image
from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'src/assets/fonts'
SOURCES = {
    'manrope': 'https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf',
    'cormorant': 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf',
    'cormorant-italic': 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3smX5slCNuHLi8bLeY9MK7whWMhyjYrGFEsdtdc62E6zd58jDOjw.ttf',
}
for name, url in SOURCES.items():
    raw = ROOT / 'docs' / (name + '.ttf')
    urlretrieve(url, raw)
    options = subset.Options()
    options.flavor = 'woff2'
    font = subset.load_font(str(raw), options)
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=list(range(0x20, 0x100)) + list(range(0x400, 0x500)) + list(range(0x2000, 0x2070)) + [0x20BD, 0x2116, 0x2197, 0x2192])
    sub.subset(font)
    subset.save_font(font, str(FONTS / (name + '.woff2')), options)
    font.close()
    raw.unlink()
    print(name, (FONTS / (name + '.woff2')).stat().st_size)

photos = {'5379623761935539919': 'portrait', '5379623761935539921': 'consultation', '5379623761935539923': 'examination', '5379623761935539920': 'care'}
for source, name in photos.items():
    image = Image.open(Path.home() / 'Downloads' / (source + '.jpg')).convert('RGB')
    for width in (480, 880):
        image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS).save(ROOT / 'src/assets/images' / f'{name}-{width}.webp', quality=84, method=6)
