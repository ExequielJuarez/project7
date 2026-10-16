# Mejora una foto de baja resolución para usarla de fondo: python3 scripts/enhance-hero.py entrada.webp public/img/hero.jpg
import sys, numpy as np
from PIL import Image, ImageFilter, ImageEnhance
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
# 1) limpiar ruido/bloques de compresión sin matar el detalle
den = im.filter(ImageFilter.MedianFilter(3))
im = Image.blend(im, den, 0.6).filter(ImageFilter.GaussianBlur(0.4))
# 2) escalar en dos etapas con reafirmado suave en cada una
for _ in range(2):
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=90, threshold=2))
# 3) tono: un poco más de contraste/color y viñeta
im = ImageEnhance.Contrast(im).enhance(1.08)
im = ImageEnhance.Color(im).enhance(1.1)
a = np.asarray(im).astype(np.float32)
h, w = a.shape[:2]
y, x = np.ogrid[:h, :w]
vig = 1 - 0.28 * (((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 2
a *= vig[..., None]
# 4) grano fino de película (disimula lo blando y da textura)
rng = np.random.default_rng(3)
a += rng.normal(0, 3.2, (h, w, 1)).astype(np.float32)
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(dst, quality=92, optimize=True, progressive=True)
print(Image.open(dst).size)
