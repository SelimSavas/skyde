# "El yapımı" görsel dilin yazı tiplerini el-yazi.js'e gömer (kısa videoların editoryal katmanı).
#   python3 video/yup-marka/build-el.py <fontsource-node_modules>
#   (npm i @fontsource/fraunces@5 @fontsource/ibm-plex-mono@5 @fontsource/patrick-hand@5 ile geçici bir klasöre kurulur)
# Fraunces: başlıklar (serif, sıcak, elle kesilmiş gibi). IBM Plex Mono: şekil altı notlar, fiş yazısı.
# Patrick Hand: kenar notları (keçeli kalem el yazısı). Marka logosu yine Nunito ile (marka.js).
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NM = sys.argv[1]
FACES = [
    ('Fraunces', 'fraunces', 600, 'normal'), ('Fraunces', 'fraunces', 800, 'normal'), ('Fraunces', 'fraunces', 700, 'italic'),
    ('IBM Plex Mono', 'ibm-plex-mono', 500, 'normal'), ('IBM Plex Mono', 'ibm-plex-mono', 600, 'normal'),
    ('Patrick Hand', 'patrick-hand', 400, 'normal'),
]
faces = []
for fam, pkg, w, style in FACES:
    css = open(os.path.join(NM, '@fontsource', pkg, f'{w}{"-italic" if style == "italic" else ""}.css')).read()
    for block in re.findall(r'/\* [^*]+ \*/\s*@font-face \{[^}]+\}', css):
        sub = re.search(r'/\* \S+-(latin(?:-ext)?)-\d+-(normal|italic) \*/', block)
        if not sub:
            continue
        rng = re.search(r'unicode-range: ([^;]+);', block).group(1)
        f = os.path.join(NM, '@fontsource', pkg, 'files', f'{pkg}-{sub.group(1)}-{w}-{style}.woff2')
        data = base64.b64encode(open(f, 'rb').read()).decode()
        faces.append(f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{w};font-display:block;"
                     f"src:url(data:font/woff2;base64,{data}) format('woff2');unicode-range:{rng};}}")

out = os.path.join(HERE, 'el-yazi.js')
with open(out, 'w') as fh:
    fh.write('// Üretildi: python3 video/yup-marka/build-el.py — elle düzenlemeyin.\n')
    fh.write('// El yapımı katmanın yazı tipleri: Fraunces (başlık), IBM Plex Mono (not), Patrick Hand (el yazısı).\n')
    fh.write('(function () {\n  if (typeof document === "undefined" || !document.head || !document.head.appendChild) return;\n  const s = document.createElement("style");\n  s.textContent = ' + json.dumps(''.join(faces)) + ';\n  document.head.appendChild(s);\n})();\n')
    loads = ','.join(f'document.fonts.load("{"italic " if st == "italic" else ""}{w} 40px \\"{fam}\\"", "ğşıİçöüĞŞÇÖÜ")' for fam, _, w, st in FACES)
    fh.write('window.EL_FONTS_READY = typeof document !== "undefined" && document.fonts ? Promise.all([' + loads + ']) : Promise.resolve();\n')
print('el-yazi.js', round(os.path.getsize(out) / 1024), 'KB; yüz', len(faces))
