#!/usr/bin/env bash
# ElevenLabs'ten tek parça gelen kaydı (satırlar arası [pause]) satırlara böler, doğrular ve kayıt klasörüne koyar.
#   bash video/araclar/kaydi-bol.sh <bolum> <kayit.mp3> <KayitKlasoru> [asr-klasoru=/tmp/asr] [calisma=/tmp/kayit-<bolum>]
# Ör.: bash video/araclar/kaydi-bol.sh ch03-sayilardan-devreye ~/indirilen.mp3 SayilardanDevreye
# Sonra raporu oku: "EŞLEŞME YOK", "fazla sözcük", uçlarında ses olan parça, sözcük hata oranı yüksek satırlar.
# Bir sınır kaymışsa calisma/out/segments.json'da o iki satırın end/start değerini düzelt ve kes.py'yi yeniden çalıştır.
set -e
B="$1"; K="$(readlink -f "$2")"; O="$3"; ASR="${4:-/tmp/asr}"; W="${5:-/tmp/kayit-$B}"
R="$(cd "$(dirname "$0")/../.." && pwd)"; V="$R/video"; T="$V/araclar"
[ -d "$ASR/node_modules/sts-whisper-small" ] || bash "$T/asr-kur.sh" "$ASR"
mkdir -p "$W" && cd "$W"
cp "$K" kayit.mp3
ffmpeg -loglevel error -y -i kayit.mp3 -ar 16000 -ac 1 -f f32le all.f32
node -e 'global.window={};require(process.argv[1]);require("fs").writeFileSync("ids.txt",window.NARRATION.lines.map(l=>l.id).join("\n"))' "$V/$B/narration.js"
echo "1/4 sözcük zamanlı döküm (birkaç dakika)…"
node "$T/kelimeler.mjs" "$ASR" all.f32 kelimeler.json | tail -1
echo "2/4 hizalama"
node "$T/hizala.cjs" kelimeler.json all.f32 "$V/$B/narration.js" ids.txt out
echo "3/4 kesim"
python3 "$T/kes.py" kayit.mp3 out/segments.json parcalar
echo "4/4 doğrulama (her satır ayrı dökülür)…"
node "$T/dokum.mjs" "$ASR" dokum.json $(for id in $(cat ids.txt); do echo parcalar/$id.mp3; done) | tail -1
node "$T/wer.cjs" "$V/$B/narration.js" dokum.json
mkdir -p "$V/seslendirme/$O"
cp parcalar/*.mp3 out/marks.json "$V/seslendirme/$O/"
echo "Kayıtlar: video/seslendirme/$O · çalışma klasörü: $W"
echo "Sıradaki: node video/narrate.mjs $B --engine files:$V/seslendirme/$O  (film taze değilse bir kez daha)"
