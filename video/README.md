# Bölüm animasyonları

Kitap bölümlerini anlatan animasyon videoları. Her şey kodla üretilir:
görüntü HTML Canvas ile çizilir, efektler ve müzik Web Audio ile sentezlenir, Türkçe
seslendirme metinden TTS ile okutulur (hazır görüntü ya da ses dosyası kullanılmaz).
Alt yazı yoktur; anlatıcı tempoyu belirler ve anlatılan öğeler, anlatıcı onlardan söz ettiği anda belirir.

| Bölüm | Süre | Klasör |
|---|---|---|
| Önsöz — Gece Yarısı Dokunulan Cam (kursa hoş geldiniz) | 11:20 (seslendirmeli) | `onsoz/` |
| Birinci Kapı — Var ve Yok: İki Simgeli Bir Evren | 9:19 (insan sesiyle) | `ch01-var-ve-yok/` |
| Birinci Kapı, 2. Bölüm — Taşa Kazınan Mantık | 11:21 (insan sesiyle) | `ch02-tasa-kazinan-mantik/` |
| Birinci Kapı, 3. Bölüm — Sayılardan Devreye: Elektriğin Hesap Yapması | 14:41 (insan sesiyle) | `ch03-sayilardan-devreye/` |
| Birinci Kapı, 4. Bölüm — Veri, Bilgi, Anlam: Üç Basamaklı Merdiven | 13:20 (insan sesiyle) | `ch04-veri-bilgi-anlam/` |
| Kurs tanıtımı (Udemy) — Bilişim Teknolojileri Yetkinliği | 1:54 (insan sesi sonradan eklenecek) | `tanitim/` |
| Önsöz kısa videoları (YouTube Shorts, 1080×1920): mesaj, köprü, ekran | 0:23–0:25 (insan sesiyle) | `kisa-mesaj/`, `kisa-kopru/`, `kisa-ekran/` |
| Var ve Yok kısa videoları (dikey için sıfırdan çizildi): eşik (0:36, insan sesiyle), lambalar, Türkçe harfler | ~0:35 | `kisa-esik/`, `kisa-lamba/`, `kisa-turkce/` |
| Öğretici kısa video: mesajın beş durağı (Önsöz'den) | ~0:29 (kayıt bekleniyor) | `kisa-durak/` |
| Öğretici kısa video: A harfi aslında bir sayı (Birinci Kapı'dan) | ~0:30 (Birinci Kapı için, kayıt bekleniyor) | `kisa-harf/` |
| YUP Akademi — Gecenin Mavi Işığı: telefon ışığı iç saati nasıl kandırıyor ve bu akşam ne yapmalı? (kaynaklı, günlük hayat sahneleri, YouTube paketi `youtube/`) | 10:39 (insan sesiyle) | `yup-mavi-isik/` |

## İzlemek

`ch01-var-ve-yok/index.html` dosyasını tarayıcıda açın. Ses açılışta sentezlenir (bu bölümde
yarım dakika kadar sürebilir), sonra ▶ ile oynatılır. Kısayollar: boşluk (oynat/duraklat),
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
- `--anlatimsiz` seslendirmeyi miksin dışında bırakır (yalnızca efekt ve müzik). İnsan sesi sonradan
  `dub.mjs` ile eklenecekse video böyle dökülür; görüntü yine anlatıcının satırlarını bekler.

## Seslendirme

Türkçe seslendirme metni `ch01-var-ve-yok/narration.js` içindedir: her satırın hangi vuruşta (`beat`)
okunacağı ve okunacak metin (`say`; sayılar ve harf adları yazıyla, simgesiz). Ekranda alt yazı gösterilmez.

Tempoyu anlatıcı belirler: bir vuruş, satırları ve kısa bir nefes payı bitmeden bitmez. Donma anı olan
vuruşta görüntü o karede bekler, olmayanda animasyon yavaşlar; film, ses efektleri ve müzik birlikte kayar.
`film.js`'teki `PACE` kalabalık animasyonları ayrıca yavaşlatır, `PAUSE` önemli bir sonuçtan sonra
anlatıcı sustuğunda görüntüyü biraz daha bekletir.

TTS her cümleyi noktalama işaretlerinden öbeklere böler ve araya sakin bir anlatıcının duraklarını koyar
(virgül ~0,35 sn, nokta ~0,6 sn). Her öbeğin başlangıcı `voice.js`'e yazılır; `film.js` bir öğeyi
`cue('satır', k)` ile o satırın k. öbeğine bağlar (ör. "kapalı kapalı, kapalı açık…" sayılırken lambalar
tek tek yanar). Noktalamayı değiştirirseniz `film.js`'teki öbek numaralarını da denetleyin.

`narrate.mjs` satırları okutur, sürelerini ölçüp yerleştirir ve `voice.js`'i yazar.

```bash
# Çevrimdışı ses: espeak-ng + MBROLA (Türkçe difon sesi, erkek; anlaşılır ama yapay)
sudo apt-get install espeak-ng mbrola mbrola-tr1
node video/narrate.mjs ch01-var-ve-yok                    # varsayılan: --engine mbrola:tr1

# Doğal nöral ses: Piper (model Hugging Face'ten iner)
pip install piper-tts
python3 -m piper.download_voices tr_TR-fahrettin-medium --data-dir video/out/piper
node video/narrate.mjs ch01-var-ve-yok --engine piper:video/out/piper/tr_TR-fahrettin-medium.onnx

# İnsan sesi: her satır için <id>.wav kaydı (id'ler narration.js'te)
node video/narrate.mjs ch01-var-ve-yok --engine files:kayitlar/
```

İnsan kaydında öbek sınırları bilinmediği için film onları harf sayısına göre tahmin eder; kayıtta
virgüllerde kısa, noktalarda biraz daha uzun durmak eşzamanlamayı iyileştirir.

`--rate 1.1` konuşmayı hızlandırır, `--gain 1.0` seslendirmeyi miks içinde kısar (varsayılan 1.25). Ardından
`render.mjs` ile videoyu yeniden dökün.

`--pay 1.1` ölçülen süreleri %10 uzatır: TTS yalnızca zamanlama için kullanılıp insan sesi sonradan
eklenecekse, insan okuyuşu genelde daha yavaş olduğundan görüntüye pay bırakır
(`node video/narrate.mjs ch02-tasa-kazinan-mantik --pay 1.1`, ardından `render.mjs … --anlatimsiz`).

## Hazır videoya insan sesi eklemek

Her satır ayrı bir kayıt dosyası olarak (`<id>.mp3`, id'ler `narration.js`'te ve
`<bölüm>/seslendirme-metni.txt`'de) bir klasöre konursa, görüntü yeniden dökülmeden eklenir:

```bash
node video/dub.mjs ch01-var-ve-yok --kayit video/seslendirme/Bölüm1.1 \
  --video video/out/ch01-var-ve-yok.mp4,video/out/ch01-var-ve-yok-paylasim.mp4
# → video/out/ch01-var-ve-yok-seslendirme.mp4 (görüntü akışı kopyalanır, yalnızca ses yeniden karışır)

node video/dub.mjs ch02-tasa-kazinan-mantik --kayit video/seslendirme-ch02
# → video/out/ch02-tasa-kazinan-mantik-seslendirme.mp4
```

Satırlar videodaki yerlerinde başlar; kayıttaki duraklar görüntünün bağlı olduğu öbeklere hizalanır.
Sığmayan satırda önce duraklar kısalır, gerekirse satır hafifçe hızlanır. Kaydı olmayan ya da
`--atla id1,id2` ile dışarıda bırakılan satırlarda TTS sesi kalır.

## Yapı

- `shared/engine.js` — zaman çizelgesi, anlatıcıya göre tempo planı ve öbek zamanları (`cue`), yumuşatma eğrileri,
  tohumlu rastgelelik, yazı yardımcıları.
  Her kare yalnızca `t`'ye bağlıdır; bu yüzden sarmak da kare kare dökmek de aynı kodla çalışır.
- `shared/synth.js` — ses efektleri (ateş, çıtırtı, rüzgâr, yağmur, vınlama, tık, bip, çan, daktilo,
  bozulma, kalp atışı, at nalı, akorlar…). Film sesi `OfflineAudioContext` ile tek seferde hesaplanır.
- `shared/player.js` — tarayıcı oynatıcısı; `?kayit` ile açılınca `render.mjs`'in kullandığı kayıt kipine geçer.
- `ch01-var-ve-yok/film.js` — sahneler, seslendirme vuruşları (`BEATS`) ve ses notasyonu. Sahneler
  koreografi zamanıyla çizilir; ses notası `at(sahne, saniye)` ile gerçek zamana çevrilir, böylece
  bekleme eklenince görüntü, efektler ve müzik birlikte kayar. Anlatıcının söylediği anda beliren
  öğeler ve sesleri `cue(satır, öbek)` ile zamanlanır.
- `ch01-var-ve-yok/narration.js` — seslendirme metni; `voice.js` — üretilen ses izi (elle düzenlenmez).
- `ch02-tasa-kazinan-mantik/` — ikinci bölüm (VE, VEYA, DEĞİL; Boole, doğruluk tabloları, toplayıcı,
  transistör, çip); aynı yapı. `voice.js` burada yalnızca zamanlama içindir; ses `dub.mjs` ile eklenir.
- `ch03-sayilardan-devreye/` — üçüncü bölüm (ikilik sayma, yarım ve tam toplayıcı, elde zinciri, ikiye tümleyen,
  kaydırarak çarpma, bölme ve karekök, saat darbesi, geri beslemeli bellek hücresi); aynı yapı.
- `ch04-veri-bilgi-anlam/` — dördüncü bölüm (aynı sayının üç dünyası, veri–bilgi–anlam merdiveni, bağlam,
  makinenin ve insanın payı, veriyi kimin konuşturduğu, veri türleri ve baştaki sıfır, düzenli ve düzensiz veri); aynı yapı.
- `narrate.mjs` — seslendirme izini üretir (MBROLA, Piper ya da insan kaydı).
- `dub.mjs` — insan sesi kayıtlarını hazır videoya ekler (görüntüyü yeniden dökmeden).
- `onsoz/` — önsöz: kursa hoş geldiniz videosu (Elif'in gece yarısı mesajı ve görünmez yolculuğu, Malabadi Köprüsü,
  görünmez köprü, teknoloji kurulan bir şeydir, bütüncül bakış, bu yolculuk kimin için, çırak–kalfa–usta,
  kendi taşını yontmak). Kitabın önsözünden genel izleyici için uyarlandı; vuruş uzunlukları satırların
  tahmini okuma süresinden hesaplanır. Seslendirme: `onsoz/seslendirme-metni.txt`.
- `tanitim/` — kursun Udemy tanıtım videosu (tepeden tepeye ateş, iki simge, on iki kapı, kurstan görüntüler,
  ders kitabı, kimler için, açık olan kapı). Ekrandaki "kurstan bir an" bölümüne bölüm videolarından seçilen parçalar
  `tanitim/montaj.mjs` ile bindirilir:
  `node video/render.mjs tanitim --anlatimsiz` → `node video/tanitim/montaj.mjs` → `out/tanitim-montaj.mp4`;
  kayıtlar gelince `node video/dub.mjs tanitim --kayit <klasör> --video video/out/tanitim-montaj.mp4`.
- `udemy/` — Udemy açılış sayfası metinleri, kurs görseli ve görselin üreteci (`gorsel.html`).
- `kisa/` ve `kisa-*/` — Önsöz'den dikey kısa videolar (YouTube Shorts). Görüntüler video dosyasından kırpılmaz:
  `kisa/kisa.js` Önsöz filmini yükleyip seçilen anları dikey kadraja yakınlaşarak yeniden çizer (vektör kadar keskin).
  Her kısa videonun `film.js`'i yalnızca çekim listesidir (Önsöz anı, kadraj, öbek). Sonda videonun başka
  bölümlerinden hızlı örnekler ve bitiş kartı vardır. Seslendirme: `kisa/seslendirme-metni.txt`,
  kayıtlar `seslendirme/Kisa/` (öbek başları `marks.json`'da), YouTube bilgileri `kisa/youtube.txt`.
  `node video/narrate.mjs kisa-mesaj --engine files:video/seslendirme/Kisa` →
  `node video/render.mjs kisa-mesaj --anlatimsiz` → `node video/dub.mjs kisa-mesaj --kayit video/seslendirme/Kisa`.

## Yeni bölüm eklemek

`ch01-var-ve-yok/` klasörünü kopyalayın; `film.js` içinde sahneleri (`SCENES`), seslendirme
vuruşlarını (`BEATS`) ve `score` işlevini, `narration.js` içinde metni yeniden yazın. Sonra
`narrate.mjs` ile sesi, `render.mjs` ile videoyu üretin. `index.html` ve ortak dosyalar olduğu gibi
kullanılabilir. `narration.js` ya da `film.js`'teki `BEATS`, `PACE`, `PAUSE` veya sahne süreleri değişince
`narrate.mjs`'i yeniden çalıştırın; çalıştırılmazsa `render.mjs` durur.
