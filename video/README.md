# Bölüm animasyonları

Kitap bölümlerini anlatan kısa animasyon videoları. Her şey kodla üretilir:
görüntü HTML Canvas ile çizilir, efektler ve müzik Web Audio ile sentezlenir, Türkçe
seslendirme metinden TTS ile okutulur (hazır görüntü ya da ses dosyası kullanılmaz).

| Bölüm | Süre | Klasör |
|---|---|---|
| Birinci Kapı — Var ve Yok: İki Simgeli Bir Evren | 3:18 (Türkçe seslendirmeli) | `ch01-var-ve-yok/` |

## İzlemek

`ch01-var-ve-yok/index.html` dosyasını tarayıcıda açın. Ses birkaç saniyede
sentezlenir, sonra ▶ ile oynatılır. Kısayollar: boşluk (oynat/duraklat),
← / → (5 sn sar), `f` (tam ekran).

## MP4'e dökmek

Gerekenler: Node 18+, `ffmpeg`, Playwright ve Chromium.

```bash
npm install --prefix video          # playwright
npx --prefix video playwright install chromium
node video/render.mjs ch01-var-ve-yok
# → video/out/ch01-var-ve-yok.mp4 (1920×1080, 30 fps, H.264 + AAC)
```

Yararlı seçenekler:

- `--frames 12,45.5` yalnızca o saniyelerin PNG önizlemesini `video/out/preview/` altına yazar.
- `--from 30 --to 60` yalnızca bir aralığı döker.
- `--workers 4` paralel tarayıcı sayısı, `--fps 60`, `--crf 18` (kalite).

## Seslendirme

Türkçe seslendirme metni `ch01-var-ve-yok/narration.js` içindedir: her satırın hangi vuruşta
(`beat`) okunacağı, ekranda gösterilecek alt yazısı (`text`) ve TTS'in okuyacağı biçimi (`say`;
sayılar yazıyla, simgesiz). Konuşma bir görüntüden uzun sürerse `holds` o vuruşta görüntüyü
bekletir; film, ses efektleri ve müzik birlikte kayar.

`narrate.mjs` satırları okutur, sürelerini ölçüp yerleştirir ve `voice.js`'i yazar. Alt yazılar ve
konuşma sırasında efekt/müziğin kısılması bu zamanlamayı izler. Sığmayan satır olursa raporlar.

```bash
# Çevrimdışı ses: espeak-ng + MBROLA (Türkçe difon sesi; anlaşılır ama yapay)
sudo apt-get install espeak-ng mbrola mbrola-tr2
node video/narrate.mjs ch01-var-ve-yok                    # varsayılan: --engine mbrola:tr2

# Doğal nöral ses: Piper (model Hugging Face'ten iner)
pip install piper-tts
python3 -m piper.download_voices tr_TR-fahrettin-medium --data-dir video/out/piper
node video/narrate.mjs ch01-var-ve-yok --engine piper:video/out/piper/tr_TR-fahrettin-medium.onnx

# İnsan sesi: her satır için <id>.wav kaydı (id'ler narration.js'te)
node video/narrate.mjs ch01-var-ve-yok --engine files:kayitlar/
```

`--rate 1.1` konuşmayı hızlandırır, `--gain 1.0` seslendirmeyi miks içinde kısar (varsayılan 1.25). Ardından
`render.mjs` ile videoyu yeniden dökün.

## Yapı

- `shared/engine.js` — zaman çizelgesi, yumuşatma eğrileri, tohumlu rastgelelik, yazı ve alt yazı yardımcıları.
  Her kare yalnızca `t`'ye bağlıdır; bu yüzden sarmak da kare kare dökmek de aynı kodla çalışır.
- `shared/synth.js` — ses efektleri (ateş, çıtırtı, rüzgâr, yağmur, vınlama, tık, bip, çan, daktilo,
  bozulma, kalp atışı, at nalı, akorlar…). Film sesi `OfflineAudioContext` ile tek seferde hesaplanır.
- `shared/player.js` — tarayıcı oynatıcısı; `?kayit` ile açılınca `render.mjs`'in kullandığı kayıt kipine geçer.
- `ch01-var-ve-yok/film.js` — sahneler, seslendirme vuruşları (`BEATS`) ve ses notasyonu. Sahneler
  koreografi zamanıyla çizilir; ses notası `at(sahne, saniye)` ile gerçek zamana çevrilir, böylece
  bekleme eklenince görüntü, efektler ve müzik birlikte kayar.
- `ch01-var-ve-yok/narration.js` — seslendirme metni; `voice.js` — üretilen ses izi (elle düzenlenmez).
- `narrate.mjs` — seslendirme izini üretir (MBROLA, Piper ya da insan kaydı).

## Yeni bölüm eklemek

`ch01-var-ve-yok/` klasörünü kopyalayın; `film.js` içinde sahneleri (`SCENES`), seslendirme
vuruşlarını (`BEATS`) ve `score` işlevini, `narration.js` içinde metni yeniden yazın. Sonra
`narrate.mjs` ile sesi, `render.mjs` ile videoyu üretin. `index.html` ve ortak dosyalar olduğu gibi
kullanılabilir. `narration.js` değişip `narrate.mjs` yeniden çalıştırılmazsa `render.mjs` durur.
