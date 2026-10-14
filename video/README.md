# Bölüm animasyonları

Kitap bölümlerini anlatan kısa animasyon videoları. Her şey kodla üretilir:
görüntü HTML Canvas ile çizilir, bütün sesler Web Audio ile sentezlenir
(hiçbir görüntü ya da ses dosyası kullanılmaz).

| Bölüm | Süre | Klasör |
|---|---|---|
| Birinci Kapı — Var ve Yok: İki Simgeli Bir Evren | 3:00 | `ch01-var-ve-yok/` |

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

## Yapı

- `shared/engine.js` — zaman çizelgesi, yumuşatma eğrileri, tohumlu rastgelelik, yazı ve alt yazı yardımcıları.
  Her kare yalnızca `t`'ye bağlıdır; bu yüzden sarmak da kare kare dökmek de aynı kodla çalışır.
- `shared/synth.js` — ses efektleri (ateş, çıtırtı, rüzgâr, yağmur, vınlama, tık, bip, çan, daktilo,
  bozulma, kalp atışı, at nalı, akorlar…). Film sesi `OfflineAudioContext` ile tek seferde hesaplanır.
- `shared/player.js` — tarayıcı oynatıcısı; `?kayit` ile açılınca `render.mjs`'in kullandığı kayıt kipine geçer.
- `ch01-var-ve-yok/film.js` — sahneler ve ses notasyonu. Sahne başlangıçları `T` nesnesindedir;
  görüntü ve ses aynı sabitleri kullandığı için bir sahneyi kaydırmak sesleri de kaydırır.

## Yeni bölüm eklemek

`ch01-var-ve-yok/` klasörünü kopyalayın, `film.js` içinde sahneleri (`scenes`) ve `score`
işlevini yeniden yazın. `index.html` ve ortak dosyalar olduğu gibi kullanılabilir.
