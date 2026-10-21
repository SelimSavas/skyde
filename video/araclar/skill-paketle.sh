#!/usr/bin/env bash
# Taşınabilir skill paketini yeniden üretir (skill ya da araçlar değişince çalıştır, sonra commit et).
#   bash video/araclar/skill-paketle.sh
# → video/skill-paketi/yup-video-uretim.zip   (claude.ai > Ayarlar > Yetenekler > Skill yükle; .skill ile aynı içerik)
#   video/skill-paketi/yup-video-uretim.skill (Claude Code / Cowork için)
#   video/skill-paketi/YUP-video-uretim-tek-dosya.md (herhangi bir sohbete yapıştırmak ya da proje bilgisine eklemek için)
# Kaynak: .claude/skills/yup-video-uretim/ (SKILL.md + references/); scripts/ paketlenirken video/araclar'dan kopyalanır.
set -e
R="$(cd "$(dirname "$0")/../.." && pwd)"
SK="$R/.claude/skills/yup-video-uretim"
OUT="$R/video/skill-paketi"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT" "$TMP/yup-video-uretim/scripts/gorsel"
cp -r "$SK/SKILL.md" "$SK/references" "$TMP/yup-video-uretim/"
cp "$R"/video/araclar/*.{cjs,mjs,py,sh} "$TMP/yup-video-uretim/scripts/"
cp "$R"/video/sogan-neden-aglatir/araclar/{extract.py,build_assets.py} "$TMP/yup-video-uretim/scripts/gorsel/"
python3 - "$TMP" "$OUT" <<'EOF'
import sys, zipfile, pathlib, re
tmp, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
root = tmp / 'yup-video-uretim'
files = sorted(p for p in root.rglob('*') if p.is_file())
for ext in ('skill', 'zip'):
    with zipfile.ZipFile(out / f'yup-video-uretim.{ext}', 'w', zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, p.relative_to(tmp))
# tek dosya: SKILL.md + bütün referanslar (araçlar hariç)
skill = (root / 'SKILL.md').read_text()
parts = [skill.rstrip(), '', '---', '', '# EKLER (references/)', '',
         'Aşağıdaki bölümler SKILL.md içinde `references/<ad>.md` diye anılan dosyalardır. Araç betikleri (scripts/) yalnız .skill/.zip paketinde ve repoda `video/araclar/` altındadır.']
def demote(text):  # başlıkları bir kademe indir; kod bloklarındaki "# yorum" satırlarına dokunma
    fence, res = False, []
    for ln in text.splitlines():
        if ln.startswith('```'): fence = not fence
        res.append('#' + ln if not fence and re.match(r'#+ ', ln) else ln)
    return '\n'.join(res)
for p in sorted((root / 'references').glob('*.md')):
    body = demote(p.read_text())
    parts += ['', '---', '', f'# references/{p.name}', '', body.rstrip()]
(out / 'YUP-video-uretim-tek-dosya.md').write_text('\n'.join(parts) + '\n')
print(len(files), 'dosya paketlendi')
EOF
ls -la "$OUT"
