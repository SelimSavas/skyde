# Bir videoya özel yazı tiplerini (fontsource woff2, latin + latin-ext) tek bir JS dosyasına gömer.
#   python3 video/yup-marka/build-yazi.py <fontsource-node_modules> <cikti.js> <HAZIR_DEGISKENI> "Aile:paket:kalınlık" ...
# Ör. (Ayağın uyuşması, "sinir hattı" tipografisi):
#   npm i @fontsource/shantell-sans@5 @fontsource/barlow-condensed@5 @fontsource/kalam@5 @fontsource/courier-prime@5
#   python3 video/yup-marka/build-yazi.py node_modules video/kisa-uyusma/yazi.js HAT_FONTS_READY \
#     "Shantell Sans:shantell-sans:800" "Barlow Condensed:barlow-condensed:700" "Kalam:kalam:700" "Courier Prime:courier-prime:700"
# Sayfa, window.<HAZIR_DEGISKENI> sözünü FILM_READY'ye ekler; Türkçe harfler (ğşıİçöü) yüklenmeden çizim başlamaz.
import base64, json, os, re, sys

NM, OUT, READY = sys.argv[1], sys.argv[2], sys.argv[3]
FACES = []
for spec in sys.argv[4:]:
    fam, pkg, w = spec.split(':')
    FACES.append((fam, pkg, int(w), 'normal'))
faces = []
for fam, pkg, w, style in FACES:
    css = open(os.path.join(NM, '@fontsource', pkg, f'{w}.css')).read()
    for block in re.findall(r'/\* [^*]+ \*/\s*@font-face \{[^}]+\}', css):
        sub = re.search(r'/\* \S+-(latin(?:-ext)?)-\d+-(normal|italic) \*/', block)
        if not sub:
            continue
        rng = re.search(r'unicode-range: ([^;]+);', block).group(1)
        f = os.path.join(NM, '@fontsource', pkg, 'files', f'{pkg}-{sub.group(1)}-{w}-{style}.woff2')
        data = base64.b64encode(open(f, 'rb').read()).decode()
        faces.append(f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{w};font-display:block;"
                     f"src:url(data:font/woff2;base64,{data}) format('woff2');unicode-range:{rng};}}")

names = ', '.join(f'{fam} {w}' for fam, _, w, _ in FACES)
with open(OUT, 'w') as fh:
    fh.write('// Üretildi: python3 video/yup-marka/build-yazi.py — elle düzenlemeyin.\n')
    fh.write(f'// Yazı tipleri: {names}.\n')
    fh.write('(function () {\n  if (typeof document === "undefined" || !document.head || !document.head.appendChild) return;\n  const s = document.createElement("style");\n  s.textContent = ' + json.dumps(''.join(faces)) + ';\n  document.head.appendChild(s);\n})();\n')
    loads = ','.join(f'document.fonts.load("{w} 40px \\"{fam}\\"", "ğşıİçöüĞŞÇÖÜ")' for fam, _, w, _ in FACES)
    fh.write(f'window.{READY} = typeof document !== "undefined" && document.fonts ? Promise.all([' + loads + ']) : Promise.resolve();\n')
print(os.path.basename(OUT), round(os.path.getsize(OUT) / 1024), 'KB; yüz', len(faces))
