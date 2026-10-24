---
name: yup-video-uretim
description: YUP Akademi / YUP Stüdyo eğitim videolarının uçtan uca üretimi. Kapsadığı seriler Bilişim Teknolojileri Yetkinliği, Tabağındaki Bilim (mutfak kimyası), Uykunun Bilimi ve YouTube Shorts. Kapsadığı işler senaryo yazımı, ElevenLabs için [pause]'lu seslendirme txt'si, tek parça ElevenLabs kaydını satırlara bölüp doğrulama, kodla çizilen Canvas animasyonu (engine.js, film.js, narration.js), render ve insan sesi ekleme, SRT altyazı, YouTube başlık/açıklama/etiket/bölüm paketi ve Gemini promptları (karakter, ortam, animasyon parçası, kapak). Kullanıcı kanaldan, bu serilerden, bir bölümden, seslendirmeden, ElevenLabs kaydından, YouTube paylaşımından, kapak fotoğrafından ya da Gemini görselinden söz ettiğinde, skill'in adı geçmese bile mutlaka kullan. Use for any YUP video, script, narration, YouTube package or Gemini prompt request.
---

# YUP video üretimi

Bu skill, kullanıcıyla birlikte yürüttüğümüz video işinin hafızasıdır: kimin için çalıştığımız, hangi serilerin olduğu, hangi kuralların geçerli olduğu, hangi komutların kullanıldığı ve nerede kaldığımız burada yazılı. Kullanıcıyla Türkçe konuş. Kısa ve doğrudan ol, istenen şeyi ver.

## 1. Önce ortamı anla

**Repo erişimi varsa** (Claude Code; GitHub `SelimSavas/skyde`, `video/` klasörü) her şeyi kendin üretirsin: metin, animasyon, render, kayıt bölme ve YouTube paketi. Kullanıcının verdiği branch'te çalış. Biten işi commit edip push et, videoyu ya da dosyayı kullanıcıya gönder. Araçlar `video/araclar/` altındadır. Paketlenmiş skill'de aynı araçların kopyası `scripts/` klasöründe de durur.

**Repo erişimi yoksa** (claude.ai sohbeti, başka bir asistan) metin işlerinin hepsini eksiksiz yap: senaryo, seslendirme txt'si, YouTube paketi, Gemini promptları ve kaynak taraması. Render ve kayıt bölme bu ortamda yapılamaz. Bunu kullanıcıya tek cümleyle söyle. Çıktıyı repoya hazır biçimde ver (satır kimlikli metin, `narration.js` satırları), böylece Claude Code oturumunda doğrudan kullanılabilir.

## 2. Kullanıcının tercihleri (bozma)

Bunların her biri kullanıcının açıkça söylediği ya da düzelttiği şeylerdir:

- **Videoda alt yazı yok.** Altyazı yalnızca YouTube'a ayrıca yüklenen `altyazi-tr.srt` dosyasında bulunur.
- **Karakter masanın ya da tezgâhın üstünde durmaz.** Kullanıcı bunu "hiç olmamış" diye düzeltti. Karakter uyluktan yukarı kadraja alınır, ayakları kadrajın dışında kalır (`presenter()`).
- **Ses kullanıcının kendi sesidir.** ElevenLabs IVC klonu, v4 modeliyle üretilir. Kayıt ham kullanılır: gürültü azaltma, EQ ya da sıkıştırma uygulanmaz, çünkü bunlar sesi bozdu. Yalnız kesimlerde 6 ms yumuşatma yapılır. Son miks yaklaşık -15 LUFS olur.
- **Seslendirme metni txt olarak verilir.** Satırların arasına `[pause]` konur. Okunuşu karışık adlar kayıt metninde okunduğu gibi yazılır (bkz. `references/seslendirme-ve-kayit.md`).
- **İçerik** bilimsel ve kaynaklı olur, gündelik ve güzel bir Türkçeyle yazılır. Ton samimidir ama laubali değildir; izleyiciye "sen" denir. Pratik bir kazanç sunar ("bu akşam dene").
- **"Tam ver" dendiğinde** şunların hepsi kopyala-yapıştır hazır verilir: başlık ve alternatifler, eksiksiz açıklama (bölüm zamanları dahil), etiketler, yükleme ayarları, bitiş ekranı, kartlar ve sabitlenmiş yorum.
- **"Sadece X ver" dendiğinde yalnızca X verilir.** Kullanıcı kapak için HTML maket hazırlanırken sözü kesti ve "bana sadece gemini için prompt ver" dedi.
- **Yeni marka dili:** logo, palet (#0F766E #2E7D5B #6EC1C9 #F59E0B #1E3A8A) ve yazı tipleri (Nunito, Caveat) `video/yup-marka/` klasöründe. Her yeni video sonunda logoyu kısaca gösterir ve abone olmaya davet eder (bkz. `references/kanal-ve-seriler.md`).
- **Gemini promptları İngilizce yazılır.** Görselde yer alacak Türkçe yazı tırnak içinde, birebir yazımıyla verilir. Prompta harf düzeltme talimatı ve yazısız yedek yol eklenir.
- **Yeni dosyalar commit edilip push edilir.** Oturum sonunda takip edilmeyen dosya kalırsa uyarı geliyor.

## 3. Kanal ve seriler

| Seri | Biçim | Başlık kalıbı | Durum |
|---|---|---|---|
| Bilişim Teknolojileri Yetkinliği (kitap/kurs) | Karaktersiz vektör animasyon, koyu lacivert ve ateş renkleri, 9–15 dk | `X: Merak Sorusu? \| Bilişim Teknolojileri Yetkinliği · N. Bölüm` | Önsöz ve ch01 yayında. ch02 hazır (paketi var). ch03 ve ch04 videoları hazır, paketleri bekliyor. |
| Tabağındaki Bilim (mutfak kimyası) | Gemini karakter ve mutfak görselleriyle konuşan sunucu, 9 dk | `Merak Sorusu? Kanca \| Tabağındaki Bilim #N` | #1 Soğan bitti (8:40). Sırada #2 Acı Biber var. |
| Uykunun Bilimi (YUP Akademi) | Günlük hayat sahneleri, kaynaklı, 10 dk | `Soru? Kanca \| Uykunun Bilimi #N` | #1 Gecenin Mavi Işığı bitti (10:39). |
| Shorts | 1080×1920, 30–55 sn. Eskiler uzun bölümlerden kırpılmadan yeniden çizilir; yeniler YUP marka diliyle sıfırdan çizilir (`kisa-kis-saati`) | `kisa-*` klasörleri | Birkaçı bitti, bazıları kayıt bekliyor. |
| Udemy kursu | Tanıtım videosu ve sayfa metinleri | `tanitim/`, `udemy/` | Tanıtım insan sesi bekliyor. |

Kanal kimliği, renkler, oynatma listeleri ve bölüm bölüm ayrıntılı durum `references/kanal-ve-seriler.md` dosyasında.

## 4. İsteğe göre yol haritası

| Kullanıcı ne istiyor? | Ne yap | Önce oku |
|---|---|---|
| Yeni bölüm fikri, senaryo, "içerik oluştur" | Kaynak tara, iskelete göre yaz; `senaryo.md`, `narration.js`, `seslendirme-pause.txt` ve `kaynaklar.md` dosyalarını hazırla | `references/senaryo-yazimi.md` |
| "Seslendirme txt'sini ver", "ElevenLabs ile üreteyim" | `[pause]`'lu metni ver (repo varsa dosyayı da gönder) | `references/seslendirme-ve-kayit.md` |
| Bir mp3 yükledi ("kaydı böl", "videoyu bitir") | Aşağıdaki §5'i uygula | `references/seslendirme-ve-kayit.md` |
| "Videoyu üret", animasyon düzeltmesi | `film.js` sahneleri, önizleme kareleri, render | `references/motor-ve-animasyon.md` |
| YouTube başlık, açıklama, etiketler | Şablonu doldur, sınırları say | `references/youtube-paketi.md` |
| Kapak, karakter, ortam ya da animasyon görseli | Gemini promptu (İngilizce, STYLE bloğuyla) | `references/gemini-promptlari.md` |
| "Diğer bölümü at", "tekrar gönder" | Bitmiş videoyu `video/out/` içinde bul ve gönder (gerekirse yeniden üret) | §7 |

## 5. Kayıttan bitmiş videoya (en sık iş, repo gerekir)

Kullanıcı ElevenLabs'ten tek parça bir mp3 yükler (adı `ElevenLabs_<tarih>_Selim_Sava__ivc_sp100_s50_sb75_v4.mp3` gibidir). Satırlar `narration.js`'teki sırayla, aralarında `[pause]` sessizliğiyle okunmuştur.

```bash
cd <repo-kökü>   # ör. /home/user/skyde
# 1) Böl ve doğrula: Whisper sözcük zamanları, hizalama, ham kesim, satır satır döküm, sözcük hata oranı
bash video/araclar/kaydi-bol.sh <bolum> <kayit.mp3> <KayitKlasoru>
#    Raporda bak: "EŞLEŞME YOK", "fazla sözcük", uçlarında ses olan parça, eşik üstü WER satırı.
#    Sınır kaymışsa: /tmp/kayit-<bolum>/out/segments.json'da iki komşu satırın end/start'ını düzelt →
#    (çalışma klasöründe) python3 <repo>/video/araclar/kes.py kayit.mp3 out/segments.json parcalar → yeniden doğrula → klasöre kopyala.
# 2) Zamanlamayı sese oturt (film süreleri kayıttan alıyorsa ikinci kez çalıştır; "taze" görülmeli)
node video/narrate.mjs <bolum> --engine files:$PWD/video/seslendirme/<KayitKlasoru>
node video/araclar/duman.cjs video/<bolum>            # JS hatası yok mu?
node video/render.mjs <bolum> --frames 5,60,200,400   # video/out/preview/*.png → Read ile bak
# 3) Görüntüyü sessiz dök (9 dk ≈ 15–17 dk sürer; run_in_background kullan), sonra sesi ekle
node video/render.mjs <bolum> --anlatimsiz --workers 4
node video/dub.mjs <bolum> --kayit video/seslendirme/<KayitKlasoru>   # → video/out/<bolum>-seslendirme.mp4
# 4) YouTube sürümü, altyazı, bölüm zamanları
S=$(mktemp -d); cd video/out
ffmpeg -hide_banner -loglevel error -y -i <bolum>-seslendirme.mp4 -c:v libx264 -preset slow -tune animation -b:v 420k -pass 1 -passlogfile $S/x -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i <bolum>-seslendirme.mp4 -c:v libx264 -preset slow -tune animation -b:v 420k -pass 2 -passlogfile $S/x -c:a aac -b:a 128k -movflags +faststart <bolum>-youtube.mp4
cd ../..
ffmpeg -i video/out/<bolum>-youtube.mp4 -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
node video/araclar/altyazi.cjs video/<bolum> video/<bolum>/youtube/altyazi-tr.srt
node video/araclar/bolumler.cjs video/<bolum> --satir   # açıklamadaki BÖLÜMLER için
```

Sonra yap:
- `youtube/aciklama.txt` içindeki süreyi, bölüm zamanlarını ve bitiş ekranı aralığını güncelle.
- `video/README.md` tablosunu güncelle.
- Commit edip push et. `video/out/` ve `video/node_modules` gitignore'dadır.
- `<bolum>-youtube.mp4` dosyasını SendUserFile ile gönder (yaklaşık 35 MB).

Bir işlemi durdurman gerekirse PID ile öldür. `pkill -f "render.mjs…"` kendi kabuğunu da öldürür.

## 6. Yeni bölüm (repo gerekir)

1. **Konu ve kaynaklar.** Önce hakemli makale, sonra üniversite ya da kurum sayfası, en son haber. WebFetch çoğu sitede DNS hatası verir, WebSearch özetleri işe yarar. Her bilgiyi `kaynaklar.md` dosyasına işle. Doğrulanamayan şeyi "Bilerek metne alınmayanlar" başlığına yaz.
2. **Metin.** Serinin iskeletine göre yaz (`references/senaryo-yazimi.md`). Tabağındaki Bilim'de 40–45 satır ve 850–950 kelime hedeflenir. Satır kimlikleri bölüm harfiyle başlar: `a-cut`, `b-zoom`, `z-end`.
3. **Dosyalar.** Benzer bölümün klasörünü kopyala. Tabağındaki Bilim için `sogan-neden-aglatir/`, Bilişim için `ch02-tasa-kazinan-mantik/`, Uykunun Bilimi için `yup-mavi-isik/`. Sonra `narration.js`, `film.js` (PLAN, EXTRA, LEAD, PAUSE, `DRAW.<sahne>`, `score`), `seslendirme-metni.txt`, `seslendirme-pause.txt` ve `senaryo.md` dosyalarını yeniden yaz.
4. **TTS'siz zamanlama.** Film, kayıt yokken süreleri harf sayısından tahmin eder. `node video/narrate.mjs <bolum>` ya da `--pay 1.1` kullanılabilir. Önizleme kareleriyle yerleşimi denetle: taşan yazı, üst üste binen damga ya da kart, etiketi kapatan nesne var mı?
5. **Paylaş.** Kayıt metnini (`seslendirme-pause.txt`) kullanıcıya gönder. Kayıt gelince §5'i uygula.

Görsel varlıklar (Gemini JPEG → macenta ya da beyaz zemin temizliği → `assets.js` data URI) için `references/motor-ve-animasyon.md` dosyasına bak.

## 7. Teslim ve dosya yerleri

- Bölüm klasörü: `video/<bolum>/`. Burada `film.js`, `narration.js`, `voice.js` (üretilir, elle düzenlenmez), `index.html`, `assets.js` ve `youtube/{aciklama.txt, altyazi-tr.srt, kapak-promptlari.txt}` bulunur.
- Kayıtlar: `video/seslendirme/<KayitKlasoru>/<id>.mp3` ve `marks.json`.
- Çıktılar (gitignore): `video/out/<bolum>.mp4` (sessiz ya da TTS), `-seslendirme.mp4` (insan sesi, büyük) ve `-youtube.mp4` (420k, paylaşılacak olan).
- Repo yoksa kullanıcıya düz metin ver ve kod bloğu içinde kopyalanabilir tut.

## 8. Bilinen tuzaklar

- **Whisper ve kayıt bölme.** Whisper sayıları rakamla yazar ve yabancı adları farklı duyar, bu yüzden %5–10 WER normaldir. 30 sn'lik parçaların bindiği yerde sözcükleri iki kez yazabilir. Kaydın son satırını kaçırabilir: son birkaç saniyeyi `dokum.mjs` ile ayrıca dök ve sözcükleri `kelimeler.json`'a ekle.
- **Komşu satıra kayan sözcük.** Kısa ve iki noktalı başlangıçlar ("İki:" gibi) bir önceki satırda kalabilir. Bunu satır satır döküm yakalar; sınırı elle düzelt.
- **`[pause]`'u sesli okuyan model.** Bazı ElevenLabs modelleri `[pause]` yazısını okudu. v4 ile sorun çıkmadı.
- **`voice.js` bayatlığı.** Film beat sürelerini kayıttan alıyorsa (Tabağındaki Bilim) ilk `narrate` ile film değişir ve `voice.js` bayatlar. İkinci kez çalıştır. Bayat `voice.js` ile `render.mjs` durur.
- **Tainted canvas.** `file://` ile açılan sayfada dış resim tuvali kirletir. Görseller `assets.js`'e data URI olarak gömülür, oynatıcı `window.FILM_READY` bekler.
- **Satır metni kayıttan sonra değişirse** kimliği de değiştir. Aksi hâlde eski kayıt yanlış satıra düşer.
- **Ekran yazısı söyleneni tekrar etmez.** Ad, sayı ya da hüküm gösterir. Doğrulanmamış sayı ekrana da yazılmaz (bir keresinde "10.000 kare/sn" yazılmıştı, "yüksek hızlı kamera" ile değiştirildi).
- **Bilimsel ince ayrıntıyı iki kez kontrol et.** Japon ağlatmayan soğanında baskılanan enzim alliinazdır (makas), ikinci enzim değil (Kato 2016).

## 9. Nerede kaldık (2026-10-21)

**Bitenler (insan sesiyle):**
- Önsöz (11:20)
- ch01 Var ve Yok (9:19)
- ch02 Taşa Kazınan Mantık (9:41, yeni kayıt `seslendirme/TasaKazinan`; YouTube paketi ve kapak promptu hazır)
- Uykunun Bilimi #1 Gecenin Mavi Işığı (10:39)
- Tabağındaki Bilim #1 Soğan Neden Ağlatır? (8:40; paket, SRT ve kapak promptları hazır)

**Hazır ama paylaşım paketi yazılmamış:**
- ch03 Sayılardan Devreye (14:41)
- ch04 Veri, Bilgi, Anlam (13:20)

Kullanıcı bunları yeniden seslendirmek isteyebilir. O zaman txt'yi, paketi ve kapak promptunu ver.

**Kayıt bekleyen:** `kisa-kis-saati` (yeni marka dilindeki ilk short, yaklaşık 55 sn). Kayıt gelince §5'i uygula. Kayıt klasörü `KisSaati`. Film, satır sürelerini kayıttan alır, bu yüzden narrate iki kez çalıştırılır. Dikey render'ın YouTube sürümü için 420k yerine 1.2M kullan.

**Sıradaki olası işler:**
- Tabağındaki Bilim #2 "Acı biber ağzını neden gerçekten yakar?" (aşama kareleri promptu hazır: `tabagindaki-bilim/animasyon-promptlari.txt` E2)
- Bekleyen Shorts kayıtları (`kisa-durak`, `kisa-harf`)
- Udemy tanıtımının insan sesi
- Güncel konu fikirleri (Ekim 2026): `video/konu-fikirleri-2026-10.md` dosyasında 10 konu var: kış saati, 2026 Nobel'leri, zayıflama iğnesi, üşütmek, yapay zekâ, kestane, ilk bilgisayar, falso. Bazılarının son tarihi var (25 ve 29 Ekim).
- Shorts serileri: 10 fikir `video/kisa/shorts-serileri.md` dosyasında. Kullanıcı birini seçince ilk bölümün metnini yaz; kayıt gelince dikey (1080×1920) olarak üret.

**Yanıtsız kalan eski istek:** "Instagram hikâyesi kısmını ortadan çıkaralım, kampanya için yazı stili ve boyut önerileri verelim." Böyle bir içerik bulunamadı. Kullanıcı tekrar sorarsa hangi metni kastettiğini sor.

Yeni bir iş bitince bu bölümü ve `references/kanal-ve-seriler.md` dosyasını güncelle. Ardından `bash video/araclar/skill-paketle.sh` ile taşınabilir paketi (`video/skill-paketi/`) yenile ve commit et. Kullanıcı bu paketi başka sohbetlere taşıyor.

---

# EKLER (references/)

Aşağıdaki bölümler SKILL.md içinde `references/<ad>.md` diye anılan dosyalardır. Araç betikleri (scripts/) yalnız .skill/.zip paketinde ve repoda `video/araclar/` altındadır.

---

# references/gemini-promptlari.md

## Gemini promptları (görsel, animasyon parçası, Veo, kapak)

İçindekiler:
1. Genel kurallar
2. Tabağındaki Bilim karakteri ve stil
3. Animasyona hazır parçalar
4. Veo hareket promptları
5. Kapak (thumbnail) kalıpları ve örnekleri
6. Türkçe yazı bozulursa

Repo varsa tam kütüphaneler şuradadır:
- `video/tabagindaki-bilim/gorsel-promptlari.txt`: karakter, sayfalar, mutfak, nesneler, seri imzası.
- `video/tabagindaki-bilim/animasyon-promptlari.txt`:
  - A: katmanlı mutfak
  - B: kukla, ağız ve göz sayfaları
  - C: efektler
  - D: büyüteç
  - E: bölüm aşama kareleri E1–E5
  - F: başlık ve bitiş ekranı
  - H: Veo
- `video/<bolum>/youtube/kapak-promptlari.txt`

### 1. Genel kurallar

- Promptlar **İngilizce** yazılır. Kullanıcıya Türkçe kısa bir kullanım notu eklenir: hangi görseli yükleyeceği ve sonuç kötüyse ne yazacağı.
- Kullanıcı "sadece prompt ver" derse yalnız promptu ve en fazla iki satır kullanım notunu ver.
- **Tutarlılık.**
  - Karakterli her promptta karakter görseli yüklenir (`video/karakter.jpeg`). Prompt "Use the exact same character from the attached image (…)" ile başlar.
  - Görselin stili her promptta aynı cümleyle tarif edilir.
- **Kesilecek parçalar** düz macenta (#FF00FF) zemin üzerinde istenir. Paletimizde macenta yok, bu yüzden temiz ayrılır. Krem ya da beyaz zemin, beyaz önlük ve krem nesnelerle karışır; o durumda taşma doldurma ve aşındırma gerekir.
- **Aşama kareleri** tek görselde şerit olarak istenmez. Aynı sohbette art arda düzenleme olarak istenir. Önce tam prompt verilir, sonra her adımda şu yazılır: "Keep everything identical: same framing, same objects, same colors, same lighting. Only change: …". Kadraj sabit kalır, kareler arasında çapraz geçiş yapılır.
- **Gemini'nin çizemedikleri:** molekül yapısı, hücre, organ kesiti, grafik ve doğru yazı. Bunlar kodla çizilir. Büyüteç içi soyut bırakılır.
- **Oran.** Sonuç kare çıkarsa: "Make it a 16:9 landscape image, extend the scene to the sides, keep everything else." En yüksek çözünürlüğü seç.
- **Sahne görsellerinde yazı yok.** Her sahne promptu "No text, no letters, no numbers, no logos, no watermark." ile biter. Yazıyı videoda kod ekler. Kapakta yazı istenir (§5).

### 2. Tabağındaki Bilim karakteri ve stil

**Gerçekte üretilen ve kullanılan karakter** (`video/karakter.jpeg`; kapak promptlarında böyle anılır):
> a cheerful young man with messy brown hair, grey lab goggles pushed up on the forehead, a white lab coat over a teal t-shirt, a cream apron with a pattern of vegetables (carrots, tomatoes, bread) and atoms with orange straps, dark blue jeans, navy sneakers; often holding a wooden spoon and a brass-and-grey magnifying glass. 2D cartoon style with clean dark brown outlines and flat colors.

İlk prompt kütüphanesinde (`gorsel-promptlari.txt`, Prompt 1) "Defne" adlı bir kadın sunucu ve "no black outlines" diyen bir stil bloğu vardı. Kullanıcı farklı bir karakter üretti. **Yeni görsellerde bu gerçek karakteri ve stilini esas al:** "same 2D cartoon style with clean dark brown outlines and flat colors".

**Palet** (hepsinde ortak): navy #1B2440, golden yellow #FFB547, cream #F3EDE1, terracotta #D9653B, sage green #8DB596, tomato red #E5484D, copper #C27C4E.

**Sahne ve parça promptlarının stil son eki:**
```
Style: 2D cartoon illustration matching the attached images: clean dark brown outlines, flat colors with gentle shading, warm and friendly. Palette: navy #1B2440, golden yellow #FFB547, cream #F3EDE1, terracotta #D9653B, sage green #8DB596, tomato red #E5484D, copper #C27C4E. No text, no letters, no numbers, no logos, no watermark.
```

**Ortam:**
- Sıcak, yaşanmış bir Türk ev mutfağı. Adaçayı yeşili fayanslar, İznik desenli birkaç çini, bakır tencereler, kavanozlu raflar, çaydanlık, tezgâhta kesme tahtası.
- Ortası boş bırakılır, karakter oraya gelir.
- Karaktersiz üretilir ve katmanlara ayrılır: arka duvar, orta tezgâh (macenta zeminli), ön katman.

### 3. Animasyona hazır parçalar (kalıplar)

**Ağız sayfası** (dudak eşleme; motorda 9 viseme kullanılır):
```
Using the exact same character from the attached image, create a lip-sync sheet: nine head close-ups of the character, identical head angle, size, hair, goggles and eyes in every one, only the mouth changes, arranged in a 3x3 grid on a plain solid flat magenta (#FF00FF) background: 1) closed relaxed mouth; 2) wide open for "A"; 3) wide smile showing teeth for "E" and "İ"; 4) round open "O"; 5) small round pursed "U"; 6) lips pressed together for "M", "B", "P"; 7) upper teeth on the lower lip for "F" and "V"; 8) tongue touching the upper teeth for "L"; 9) slightly open, teeth together for "S" and "Z".
+ stil son eki
```

**Göz sayfası** (4×2, macenta zemin): açık, yarı kapalı, kapalı (kırpma), sola bakış, sağa bakış, yukarı bakıp düşünme, şaşkın, gülen hilal gözler.

**Poz ya da ifade:** "Using the exact same character… full-body, <poz>, on a plain solid flat magenta (#FF00FF) background" kalıbıyla istenir. Kullanılmış pozlar:
- merak (büyüteçle bakış)
- şaşkınlık
- gülme
- düşünme
- komik ağlama (soğan)
- ağzı yanma (biber; kulaklardan buhar)

**Efekt sayfası** (macenta zemin, ızgara düzeninde): buhar, yağ sıçraması, alev, duman, gözyaşı, ter damlası, altın koku kıvrımı, patlama yıldızı, parıltı.

**Bölüm aşama kareleri** (önce tam prompt, sonra adım adım "Only change: …"):
- E1 Soğan: bütün soğan → ikiye kesilmiş, halkalar görünür → kesik yüzden soluk sarı buğu yükselir → buğu yukarı yayılır → üst kenardan gözyaşı damlaları düşer.
- E2 Acı biber (sıradaki bölüm):
  - Kare 1: "Close-up 16:9 shot of a whole fresh red chili pepper on a wooden board, kitchen softly blurred behind." + stil son eki
  - → biber boyuna kesilir, soluk iç damarlar ve çekirdekler görünür
  - → iç damarlar turuncu parlar
  - → yanına bir bardak süt gelir
  - → turuncu parıltı söner, yanına biraz süt sıçrar
- Diğerleri: E3 ekmek bayatlaması, E4 patlamış mısır, E5 kızaran et (Maillard).

### 4. Veo hareket promptları (Gemini video)

Kurallar:
- Görsel yüklenir, kliplar yaklaşık 8 sn olur.
- Hareketler küçük tutulur, yoksa 2D stil bozulur.
- Üretilen ses kapatılır.
- Kalıp: "Static camera. <tek, küçük hareket>. Keep the flat 2D style, colors and every object exactly the same. No text, no speech, no music."

Örnekler:
- **Canlı mutfak:** buhar, mavi alevler, cızırdayan yağ, güneş ışığında toz.
- **Sunucu selam veriyor:** gülümser, bir kez kırpar, el sallar, büyüteci gözüne kaldırır.
- **Büyüteç geçişi:** "The camera pushes slowly into the magnifying glass lens until the golden glowing lens fills the frame, revealing a deep navy microscopic space with soft golden particles."
- **Soğan kesiliyor:** "Static close-up. The knife slowly cuts through the onion, the halves fall apart showing the rings, a faint pale-yellow mist rises. No hands, no people."

### 5. Kapak (thumbnail) kalıpları

**Ortak iskelet** (her seride aynı):
```
YouTube thumbnail, 16:9, 1280x720. <sahne: tek güçlü odak, ifadesi net bir yüz ya da nesne, yüksek kontrast, sıcak ışık>.
On the <left|right> half, a large bold headline in Turkish, in a heavy geometric sans-serif font (like Montserrat Black), all caps, left-aligned, on <2|3> lines, exact spelling:
"<SATIR 1>"
"<SATIR 2>"
"<SATIR 1>" in cream white (#F3EDE1)<; Tabağındaki Bilim'de: with a thick dark navy (#1B2440) outline>; "<SATIR 2>" larger, in warm golden yellow (#FFB547) with a soft golden glow.
Perfectly sharp and legible, correct Turkish characters (<hangi harf nerede: dotted İ in "…", Ğ with a breve in "…", dotless I in "…", Ü/Ş/Ç/Ö in "…">).
Bottom-left corner: a small rounded dark <navy> label with <a tiny golden magnifying glass icon and> the text "<ETİKET>" in small white bold capital letters.
Keep the bottom-right corner empty. No other text, no watermark.
```

**Seriye göre:**

| Seri | Sahne dili | Sol alt etiket |
|---|---|---|
| Bilişim | Koyu lacivert (#0f1730), sinematik dijital illüstrasyon, tek parlayan nesne (ampul, taş tablet, devre izleri, uçuşan 1 ve 0) | "N. BÖLÜM" |
| Tabağındaki Bilim | Karakter görseli yüklenir; göğüsten yukarı, abartılı ve komik ifade, sıcak bulanık mutfak, yazının yanı hafif karartılmış | büyüteç simgesi + "TABAĞINDAKİ BİLİM" |
| Uykunun Bilimi | Gece, derin lacivert, ekranın soğuk mavi ışığı yüze vuruyor, altın vurgu (#FFC24D) | altın nokta + "YUP AKADEMİ" |

**Başlık metni.** 2–3 kelimelik, merak uyandıran büyük harfli bir başlık yaz. Video başlığını tekrar etme. Örnekler: "ELEKTRİK / DÜŞÜNÜR MÜ?", "NEDEN / AĞLIYORUZ?", "AĞLAMADAN / DOĞRA!", "BEYNİN / HÂLÂ / GÜNDÜZ". Bir alternatif yazı da öner.

**Örnek: kullanıcının kendi fikri** (soğan; konuşma balonu varyantı). Kullanıcı bu tarz esprili ve birinci ağızdan yazıyı sever.
```
YouTube thumbnail, 16:9, 1280x720. Use the exact same character from the attached image (same face, messy brown hair, lab goggles on the forehead, white lab coat, apron with vegetable and atom pattern) in the same 2D cartoon style with clean dark brown outlines and flat colors. On the right half, a large close-up of the character from the chest up: he is crying comically, eyes squeezed shut, big tears streaming and splashing from both eyes, a wobbly frown, holding half an onion next to his cheek, trying to look tough. Background: a warm, softly blurred cozy kitchen with sage green tiles, copper pans and jars on shelves, slightly darkened on the left side so the text stands out. A soft golden glow behind the character. Bright, high contrast, funny.
On the left half, a large white comic speech bubble with a thick dark navy (#1B2440) outline, its tail pointing to the character's mouth. Inside the bubble, Turkish text in a heavy rounded sans-serif font (like Montserrat Black), left-aligned, exact spelling, on three lines:
"HAYIR,"  (dark navy, large)
"AĞLAMIYORUM!"  (terracotta orange #D9653B, the largest text in the image)
"GÖZÜME BİRAZ SOĞAN KAÇTI."  (dark navy, medium size)
Below the speech bubble, a smaller rounded golden yellow (#FFB547) label with a dark navy outline and the text, exact spelling:
"Soğan bizi neden ağlatır?"  (dark navy, bold)
All text perfectly sharp and legible with correct Turkish characters: Ğ with a breve, dotless I in "AĞLAMIYORUM" and "KAÇTI", dotted İ in "BİRAZ", Ö and Ü in "GÖZÜME", Ç in "KAÇTI".
Bottom-left corner: a small rounded dark navy label with a tiny golden magnifying glass icon and the text "TABAĞINDAKİ BİLİM" in small white bold capital letters.
Keep the bottom-right corner empty. No other text, no watermark.
```

**Örnek: Bilişim ch02:**
```
YouTube thumbnail, 16:9, 1280x720. Cinematic digital illustration on a deep navy (#0f1730) background. On the right half, a single large glowing light bulb with a warm orange-gold filament, wired to two brass toggle switches labeled with small engraved letters A and B. The wires turn into glowing golden circuit traces that flow down into an ancient grey stone tablet; the circuit lines are carved deep into the stone and glow from inside, as if logic is engraved in stone. Tiny 1 and 0 digits float faintly in the dark. Dramatic warm light on the bulb, soft glow, high contrast, one strong focal point, minimal, clean.
On the left half, a large bold headline in Turkish, in a heavy geometric sans-serif font (like Montserrat Black), all caps, left-aligned, on two lines, exact spelling:
"ELEKTRİK"
"DÜŞÜNÜR MÜ?"
"ELEKTRİK" in cream white (#F3EDE1); "DÜŞÜNÜR MÜ?" larger, in warm golden yellow (#FFB547) with a soft golden glow.
Perfectly sharp and legible, correct Turkish characters (dotted İ in "ELEKTRİK", Ü and Ş in "DÜŞÜNÜR", Ü in "MÜ").
Bottom-left corner: a small rounded dark label with the text "2. BÖLÜM" in small white bold capital letters.
Keep the bottom-right corner empty. No other text, no watermark.
```

### 6. Türkçe yazı bozulursa

1. Aynı sohbette şunu yaz: `Fix the text only, keep everything else exactly the same. The headline must read exactly: <SATIR 1> / <SATIR 2>`
2. Yine olmazsa prompta "No text at all" ekleyip görseli yazısız üret. Yazıyı ve logoyu Canva'da önceki bölümlerdeki yere ekle.
3. Kapak 2 MB'ı aşarsa JPEG olarak, %85–90 kaliteyle kaydet.

---

# references/kanal-ve-seriler.md

## Kanal, seriler ve durum

### Kanal kimliği
- **Ad:** YUP Akademi. Kurumsal adı YUP Stüdyo. YUP = Yükselen Ufuklar Platformu.
- **Kısa tanıtım** (açıklamaların sonunda kullanılır): "YUP (Yükselen Ufuklar Platformu): merak edenler için bir akademi. Bilişimden psikolojiye, matematikten kişisel gelişime; karmaşık konular sade, adım adım ve animasyonlarla." Kısa hâli: "YUP Akademi · merak edenler için."
- **Kapak köşe etiketi:** sol altta küçük, yuvarlak köşeli koyu etiket (seri adı ya da "N. BÖLÜM"). Sağ alt köşe boş kalır, çünkü süre etiketi oraya gelir.
- **Ortak renkler:** altın sarısı #FFB547, krem #F3EDE1, koyu lacivert #1B2440 (Bilişim'de daha koyu: #0f1730). Uykunun Bilimi'nde sarı biraz daha parlaktır: #FFC24D.
- **Yeni marka kimliği (Ekim 2026, kullanıcının referans görseli `video/yup-marka/marka-referansi.webp`):**
  - **Logo:** teal yuvarlak kare içinde beyaz çizgi sembol (açık kitap, filiz ve Y harfi). Dosya `video/yup-marka/logo.jpg`. Saydam beyaz sembol ve gömülü yazı tipleri `video/yup-marka/marka.js` içinde; `python3 video/yup-marka/build.py <fontsource-node_modules>` ile üretilir.
  - **Palet:** teal #0F766E (ana), yeşil #2E7D5B, açık camgöbeği #6EC1C9, kehribar #F59E0B, lacivert #1E3A8A. Zemin krem #F7F3EA, yazı koyu teal #123B3A.
  - **Yazı:** "YUP" Nunito 900 teal, "Akademi" Nunito 600. Başlıklar Nunito 800–900, el yazısı vurgular Caveat 700.
  - **Slogan:** "Küçük bir merak, büyük bir keşif." (el yazısı). Alt satır: "Merak et • Keşfet • Öğren".
  - **Biçim dili:** krem zemin, köşelerde organik teal ve kehribar lekeler, ince kehribar kavisler, yuvarlak köşeli kartlar, yumuşak gölge, düz vektör ve yuvarlak çizgi simgeler.
  - **Kural:** Yeni videolar (özellikle Shorts) sonunda kısaca logoyu gösterir ve abone olmaya davet eder: simge zıplar, sembol sapından büyür, "ABONE OL" düğmesine el basar, düğme "ABONE OLUNDU" olur. Örnek: `video/kisa-kis-saati/film.js` (`appIcon`, `DRAW['k-cta']`).
- **Kanal sahibi ve ses:** Selim Savaş. Seslendirme Selim'in sesinden ElevenLabs IVC klonuyla yapılır (ayarlar dosya adında: sp100, s50, sb75, v4). YouTube'da "Değiştirilmiş/yapay içerik" = EVET.

### Seri 1 · Bilişim Teknolojileri Yetkinliği
- **Ne:** Selim'in kitabından uyarlanan kurs. Kitapta on iki "kapı" var. Birinci Kapı'nın bölümleri: Var ve Yok, Taşa Kazınan Mantık, Sayılardan Devreye, Veri-Bilgi-Anlam.
- **Görsel dil:** Karakter yok. Tamamen kodla çizilen vektör animasyon: koyu lacivert zemin, krem çizgiler, ateş, kor ve alev renkleri (#ffa547, #e8541a, #ffd27a). Anlatıcı dışarıdan konuşur ve "biz" ile "sen" arasında gidip gelir. Ton biraz daha ağırbaşlı ve hikâyecidir: tepeden tepeye ateş, taş, köprü gibi imgeler kullanılır.
- **Başlık kalıbı:** `<Bölüm adı>: <Merak sorusu> | Bilişim Teknolojileri Yetkinliği · <N>. Bölüm`
  - ch01: "Var ve Yok: Bilgisayar Neden Sadece 0 ve 1 Bilir?"
  - ch02: "Taşa Kazınan Mantık: Elektrik Nasıl Düşünür? | Bilişim Teknolojileri Yetkinliği · 2. Bölüm"
  - ch03 için öneri: "Sayılardan Devreye: Elektrik Nasıl Hesap Yapar?"
- **Oynatma listesi:** "Bilişim Teknolojileri Yetkinliği | Dijital Dünyayı Baştan Sona Anlamak". Sıra: Önsöz, Var ve Yok, Taşa Kazınan Mantık, …
- **Kategori:** Eğitim. Etiketlerin sonuncusu "YUP Stüdyo"dur.
- **Açılış satırı:** "Birinci kapı, ikinci bölüm: taşa kazınan mantık." Hemen ardından önceki bölümün hatırlatması gelir.
- **Kapak dili:** koyu lacivert, sinematik dijital illüstrasyon, tek güçlü odak (ampul, taş tablet, devre). Solda iki satır başlık (krem ve altın), sol altta "N. BÖLÜM" etiketi.

| Bölüm | Klasör | Süre | Kayıt klasörü | Durum |
|---|---|---|---|---|
| Önsöz: Gece Yarısı Dokunulan Cam | `onsoz/` | 11:20 | `seslendirme/Onsoz` | Yayında |
| ch01 Var ve Yok | `ch01-var-ve-yok/` | 9:19 | `seslendirme/Bölüm1.1` | Yayında |
| ch02 Taşa Kazınan Mantık | `ch02-tasa-kazinan-mantik/` | 9:41 | `seslendirme/TasaKazinan` (yeni kayıt) | Video, paket, SRT ve kapak promptu hazır |
| ch03 Sayılardan Devreye | `ch03-sayilardan-devreye/` | 14:41 | `video/Bölüm1.3` (eski kayıt) | Video hazır, paketi yok |
| ch04 Veri, Bilgi, Anlam | `ch04-veri-bilgi-anlam/` | 13:20 | `seslendirme/Bölüm1.4` | Video hazır, paketi yok |

Shorts (1080×1920): `kisa-mesaj`, `kisa-kopru` ve `kisa-ekran` (Önsöz'den), `kisa-esik`, `kisa-lamba` ve `kisa-turkce` (Var ve Yok'tan) var. `kisa-durak` ile `kisa-harf` kayıt bekliyor. Kayıt metinleri `kisa/*-tek-dosya.txt`, YouTube bilgileri `kisa/youtube.txt` dosyasında. Kısa videolar uzun bölümün filmini dikey kadraja yakınlaşarak yeniden çizer (`kisa/kisa.js`).

**Markalı ilk short:** `kisa-kis-saati/` (Uykunun Bilimi kısa: "Saatler geri alınmıyor: vücudun buna ne diyor?"). Yeni marka diliyle, dikey, sonda logo ve abone çağrısı var. Kayıt bekliyor (`seslendirme-pause.txt`, kayıt klasörü `seslendirme/KisSaati`). Yeni markalı short'lar bu klasör kopyalanarak yapılır.

**Yeni Shorts serileri (2026-10-23, fikir aşaması):** `video/kisa/shorts-serileri.md` dosyasında 10 seri var. Her birinin kalıbı, görseli, ilk üç konusu ve uzun seriye köprüsü yazılı. Seriler: Efsane mi Gerçek mi?, Gözünü Kandırayım, Bir Sayı Bir Şok, Cebindeki Bilim, Ustanın Bilmecesi, Kelimenin Yolculuğu, Kazara Bulundu, Gece Bir Buçuk, Tek Lokma Bilim, Vücudun Gizli Ayarları. Önerilen başlangıç üçlüsü: Gözünü Kandırayım, Efsane mi Gerçek mi?, Ustanın Bilmecesi. Kullanıcı henüz seçmedi.

Udemy: tanıtım videosu (`tanitim/`, 1:54) insan sesi bekliyor. Sayfa metinleri ve kurs görseli `udemy/` klasöründe.

### Seri 2 · Tabağındaki Bilim (YUP Akademi)
- **Vaat:** Mutfakta her gün gördüğün küçük bir olayın arkasındaki kimya ve fizik. Bölümün sonunda izleyicinin elinde iki şey olur: arkadaşına anlatabileceği bir "vay be" nedeni ve o akşam mutfakta deneyebileceği bir şey.
- **Görsel dil:** Gemini ile üretilmiş 2D bir sunucu karakter. Erkek, dağınık kahverengi saç, alında laboratuvar gözlüğü, beyaz önlük, sebze ve atom desenli önlük. Görsel: `video/karakter.jpeg`. Ayrıca katmanlı mutfak (arka duvar, orta tezgâh, ön katman), büyüteç geçişi ve mikro dünya var. Moleküller, hücreler, göz kesiti, grafikler ve kartlar kodla çizilir.
- **Başlık kalıbı:** `<Merak sorusu>? <Şaşırtan kanca> | Tabağındaki Bilim #<N>`
  - #1: "Soğan Doğrarken Neden Ağlarız? Hızlı Doğramak İşe Yaramıyor | Tabağındaki Bilim #1"
- **Oynatma listesi:** "Tabağındaki Bilim | YUP Akademi". Kategori: Bilim ve Teknoloji (alternatifi Eğitim). Açıklamanın ilk hashtag'i `#TabağındakiBilim`. Etiketlerin sonuncusu "YUP Akademi".
- **Seri rehberi:** `video/tabagindaki-bilim/seri-rehberi.md`. Özeti `senaryo-yazimi.md` dosyasında.
- **Gemini prompt kütüphanesi:** `video/tabagindaki-bilim/gorsel-promptlari.txt` ve `animasyon-promptlari.txt`.

| # | Konu | Klasör | Süre | Durum |
|---|---|---|---|---|
| 1 | Soğan Neden Ağlatır? | `sogan-neden-aglatir/` | 8:40 | Bitti; video, paket, SRT ve 3 kapak promptu hazır. Kullanıcının kapak fikri: "HAYIR AĞLAMIYORUM GÖZÜME BİRAZ SOĞAN KAÇTI." ve altında küçük "Soğan bizi neden ağlatır?" |
| 2 | Acı biber ağzını neden gerçekten "yakar"? Neden su değil de süt işe yarar? | (yok) | | Sırada. Soğan bölümünün kapanışında duyuruldu. |
| sonra | Ekmek neden bayatlar? · Patlamış mısır nasıl patlar? · Kızaran etin kokusu (Maillard) · Kavrulan soğan neden tatlanır? | | | Fikir. Aşama kareleri promptları E3–E5'te. |

### Seri 3 · Uykunun Bilimi (YUP Akademi)
- **#1:** "Telefon Işığı Uykunu Nasıl Bozuyor? Bu Akşam Deneyebileceğin 7 Basit Şey | Uykunun Bilimi #1". Klasör `yup-mavi-isik/`, süre 10:39, kayıt klasörü `seslendirme/MaviIsik`. Kapaklar: `youtube/kapak-A.png` ve `kapak-B.png`.
- **Görsel dil:** gece sahneleri, düz vektör, derin lacivert ve soğuk mavi ekran ışığına karşı sıcak altın.
- **Oynatma listesi:** "Uykunun Bilimi | YUP Akademi". Açıklamanın ilk hashtag'i `#UykununBilimi`.
- **Yapı:** Tabağındaki Bilim'e benzer: soğuk açılış ("Gece saat bir buçuk…"), mekanizma, deneyler ve kaynaklar, "bu akşam" önerileri.

---

# references/motor-ve-animasyon.md

## Motor, animasyon, görseller ve render

İçindekiler:
1. Repo düzeni
2. Motor API'si (`shared/engine.js`)
3. `film.js` kalıbı
4. Sahne çizim yardımcıları
5. Konuşan karakter
6. Gemini görsellerini içeri almak
7. Ses notası
8. Render ve önizleme
9. Yerleşim dersleri
10. Shorts

### 1. Repo düzeni (`/home/user/skyde/video/`)

```
shared/engine.js  shared/synth.js  shared/player.js  shared/player.css
narrate.mjs   render.mjs   dub.mjs   package.json (playwright 1.56.1)
araclar/      kayıt bölme, altyazı, bölüm zamanları, duman testi
<bolum>/      index.html  film.js  narration.js  voice.js  [assets.js]  [araclar/]  youtube/
seslendirme/<KayitKlasoru>/<id>.mp3 + marks.json
tabagindaki-bilim/   seri rehberi ve Gemini prompt kütüphaneleri
*.jpeg (video/ kökünde)   Tabağındaki Bilim'in Gemini kaynak görselleri
out/          (gitignore) mp4, preview/*.png, voice-cache
```

Bir sayfanın her karesi yalnızca `t`'ye bağlıdır (deterministik). Bu yüzden ileri sarmak da kare kare dökmek de aynı kodla çalışır. Rastgelelik için `hash(i, seed)` ve `noise(x, seed)` kullanılır, `Math.random` kullanılmaz.

### 2. Motor API'si (`window.Engine`, `E`)

- **Tuval ve zaman yardımcıları.** `W=1920`, `H=1080`. `clamp`, `lerp`, `ease.{linear,inOut,out,in,back,expo}`. `progress(t,a,b,fn)` a→b aralığında 0→1 verir. `vis(t,a,b,fadeIn,fadeOut)` görünürlük verir. `hash`, `noise`, `rgba([r,g,b],a)`.
- **Yazı.**
  - `text(ctx,str,x,y,{size,weight,color,align,alpha,family:'display'|'sans',spacing})`
  - `measure(ctx,str,o)`
  - `runs(ctx,[[str,o],…],x,y)` (renkli parçalı satır)
  - `wrap(ctx,str,maxW,o)`
  - `paragraph(ctx,str,x,y,maxW,{size,lineHeight,valign})`
- **Çizim.** `glow(ctx,x,y,r,[r,g,b],alpha)`, `roundRect(ctx,x,y,w,h,r)`.
- **Zaman çizelgesi.** `E.timeline([{id,title,base,stretch:[[a,b,k]],holds:[[f,e]],draw,fadeIn,fadeOut}])` şunları döndürür:
  - `{scenes, duration, scene(id), at(id,x), span, warp}`
  - `stretch` bir aralığı k kat yavaşlatır. `holds` f anında e saniye dondurur.
- **Seslendirme planı.** `E.narration({build,beats,lines,voice,pauses,cps,gap,breath})`
  - `beats[id] = [sahne, a, b, donmaAnı]`
  - `build(holds, slow)` bir timeline döndürür. Anlatıcı satırlarını bitirmeden vuruş bitmez.
  - Döndürdükleri: `{timeline, cue(id,k), end(id), placed, fresh, stale, voice}`.
  - `cue(id,k)` satırın k. öbeğinin başladığı gerçek zamandır.
  - `PAUSES` noktalama duraklarıdır: virgül 0,35, noktalı virgül ve iki nokta 0,45, nokta 0,6, soru 0,65 sn. `phrases(str)` metni öbeklere böler.
- **Film.** `E.film({title,timeline,background,score,narration,voice,fade})` şunları döndürür: `{scenes, duration, sceneAt, draw}`. Sonuç `window.FILM` olarak verilir.

### 3. `film.js` kalıbı (Tabağındaki Bilim, `sogan-neden-aglatir/film.js`)

```js
(function () {
  const E = window.Engine; const { W, H, clamp, lerp, ease, progress, vis, hash, noise, text, paragraph, glow, roundRect } = E;
  const C = { navy:'#1b2440', gold:'#ffb547', cream:'#f3ede1', paper:'#fbf6ec', terra:'#d9653b', sage:'#8db596', tomato:'#e5484d', copper:'#c27c4e', ink:'#2b1f1a', muted:'#7d7468', … };
  // görseller: window.ASSETS → Image; window.FILM_READY = Promise.all(decode)
  const SCRIPT = window.NARRATION; const sayOf = …;
  const CPS = 18;                                    // kayıt yokken saniyedeki harf
  const recorded = …window.VOICE…;                   // kayıt varsa satır süresi kayıttan
  const EXTRA = { 'a-cut': 0.6, …, 'z-end': 12 };   // satırdan sonra görüntü payı
  const LEAD  = { 'a-cut': 1.6, … };                 // satır vuruş başından bu kadar sonra başlar
  const PLAN  = [{ id:'open', title:'Soğuk açılış', beats:['a-cut','a-tears','a-question'], fadeIn:0.8 }, …];
  // PLAN → BEATS[id] = [sahne, a, a+len, a+len-0.5], SCENES (base, draw: DRAW[id])
  const PAUSE = { 'a-question': 0.6, … };            // önemli cümleden sonra ek bekleme
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, pauses: PAUSE, breath: 0.6, cps: CPS });
  const TL = VOICE.timeline, cue = VOICE.cue, lineEnd = VOICE.end;
  const after = (t,id,k=0,d=0.6,fn=ease.out) => progress(t, cue(id,k), cue(id,k)+d, fn);
  // span(t,id,k,id2,j), during(t,first,last), layer(t,a,b), pop(t,at), sceneStart(id)
  DRAW.open = function (ctx, lt, t) { … };           // lt: sahne koreografi zamanı, t: gerçek zaman
  function score(m) { … m.whoosh(cue('b-zoom',0)-0.2, {…}); … }
  window.FILM = E.film({ title, timeline: TL, background, score, narration: VOICE, voice: VOICE.voice, fade: 0.4 });
})();
```

Öğeyi anlatıcının söylediği anda göstermek için `after(t,'b-wall',2)` kullanılır: o satırın 3. öbeği söylenince 0,6 sn içinde belirir. Bir sahnede ardışık alt sahneler `layer(t, a, b)` ile çapraz geçişle değişir. Örnek: efsane sahnesinde buzdolabı, ekmek ve mum, ardından ağlatmayan soğan.

**Bilişim kalıbı** (`ch02-tasa-kazinan-mantik/film.js`) şöyle ayrılır:
- Satırlarda `beat: 'sahne.vuruş'` vardır.
- Sahnelerin sabit koreografi süreleri (`SCENES`) ve `PACE` vardır.
- Ses notası `at(sahne, saniye)` ile gerçek zamana çevrilir.
- Kayıt yokken `node video/narrate.mjs <bolum> --pay 1.1` zamanlamaya pay bırakır.

**Yeni bölüm:** En yakın bölümü kopyala, `PLAN`, `EXTRA`, `LEAD`, `PAUSE` ve `DRAW.*` kısımlarını yeniden yaz. `index.html`'de `<title>` ile `aria-label`'ı değiştir. Script sırası: engine, synth, [assets], narration, voice, film, ardından `FILM_READY` sonrası player.

### 4. Sahne çizim yardımcıları (soğan bölümünden; yeniden kullan)

**Zemin ve kadraj:**
- `paperBg(ctx,t)`: krem kâğıt zemin.
- `microBg`: mikro dünya.
- `kitchen(ctx,t,{zoom,fx,fy,fg,dim})`: katmanlı mutfak, parallax ve kararma.
- `cover(ctx,k,zoom,fx,fy)`

**Görsel ve metin parçaları:**
- `pic`, `picC(ctx,k,cx,cy,h,a,rot)`
- `kicker(ctx,str,a)`: sol üstte bölüm etiketi.
- `chip(ctx,str,x,y,a,{size,fill,color})`: hap etiket.
- `card(ctx,x,y,w,h,a,{fill})`
- `statement`
- `stamp(ctx,'ŞÜPHELİ',renk,x,y,t0,t,{size,rot})`: hüküm damgası.
- `bubble(ctx,k,…)`: düşünce balonu.
- `arrow(ctx,x1,y1,x2,y2,{color,lw,p,dash})`
- `badge`

**Nesneler** (kodla, düz vektör, koyu kahve `outline`):
- `onionWhole`, `onionFace`, `knife`, `drop`, `garlic`
- `ballStick` (molekül), `gasMol`, `scissorEnzyme`, `catcherEnzyme`
- `eyeSection`, `brain`, `gland`, `pan`, `beaker`, `flameIcon`, `fridge`, `bread`, `candle`, `fan`, `snail`
- `hud` (araştırma kamera arayüzü), `gauge`

Moleküller, hücreler, organ kesitleri ve grafikler her zaman kodla çizilir; Gemini bunları doğru çizemez.

### 5. Konuşan karakter (Tabağındaki Bilim)

- **`host(ctx,t,x,y,h,{pose,mouth,eyes,talk,goggles,tilt,lean,flip,alpha})`**
  - Gövde pozu çizilir: `body`, `poseTools`, … (`assets.js` anahtarları).
  - Baş, ağız sayfasındaki 9 viseme başından kurulur. Baş gövdeye gözlük çerçevesinin sınır kutusuyla hizalanmıştır.
  - Gözler, göz sayfasından alınan bir şeritle üste bindirilir.
  - Hafif nefes ve sallanma vardır (`noise`).
- **Dudak eşleme.**
  - Her satırın metnindeki harfler ünlü/ünsüz tablosuyla ağız şekline çevrilir.
  - Satırın gerçek süresine (`voice.js`) eşit aralıkla yayılır.
  - Aynı şekiller birleştirilir, 60 ms'den kısa olanlar öncekine katılır (`TRACK`, `mouthAt`).
  - `speaking(t)` karakterin konuşup konuşmadığını verir.
- **Göz kırpma.** Tohumlu aralıklarla yapılır (yarı, kapalı, yarı); `eyesAt`.
- **`presenter(ctx,t,x,o)`** `host(ctx,t,x,1560,1400,o)` çağrısıdır: uyluktan yukarı kadraj, ayaklar ekran dışında. **Karakteri asla masa ya da tezgâh üstünde ayakta gösterme** (kullanıcı düzeltmesi).
- **`headPoint(x,y,h,mx,my)`** baş görselindeki bir noktanın ekran konumunu verir. Ağza ekmek, göze gaz oku gibi bağlamalarda kullanılır.
- **Gözlüğü indirme.** `goggles: 0..1`. Alında kalan boşluğu `fringe()` saç perçemiyle kapatır.

### 6. Gemini görsellerini içeri almak

- Kaynaklar `video/*.jpeg` dosyalarıdır:
  - karakter: `karakter.jpeg`, `karakter_parcalari.jpeg`, `karakter_kuklası.jpeg`
  - yüz sayfaları: `agız_sekillerii.jpeg`, `goz_sekilleri.jpeg`
  - mutfak: `arka_duvar.jpeg`, `orta_katman.jpeg`, `ön_katman.jpeg`, `ortam_full.jpeg`
  - diğer: `büyüteç_geçiş.jpeg`, `mikro_dünya_arka_plan.jpeg`, `sogan_calisması.jpeg`
- `pip install numpy scipy pillow` ile bağımlılıkları kur, sonra:
  - `python3 video/sogan-neden-aglatir/araclar/extract.py` zemini temizler ve parçaları keser. Macenta zeminde anahtar `min(R,B)−G` ile alınır, kenardaki pembe taşma temizlenir. Beyaz ya da krem zeminde köşe renginden taşma doldurma (flood fill) yapılır, ardından 2 px aşındırma uygulanır. Bir temas sayfası da üretir.
  - `python3 video/sogan-neden-aglatir/araclar/build_assets.py` başı gövdeye hizalar ve parçaları WebP (q≈86) olarak `assets.js`'e `window.ASSETS = { key: {src:'data:image/webp;base64,…', w, h, …} }` biçiminde gömer.
- **Neden data URI?** `file://` ile açılan sayfada dış resim tuvali kirletir (tainted canvas) ve `render.mjs` kareleri okuyamaz. `index.html` oynatıcıyı `window.FILM_READY` çözülünce yükler.
- **Ön katman.** Ön plandaki kepçe ve kâse gibi nesneler araya giriyordu; ön katman yalnız fesleğene kırpıldı. Büyük ön plan nesnelerini metnin ya da karakterin önüne koyma.

### 7. Ses notası (`score(m)`, `shared/synth.js`)

- Film sesi `OfflineAudioContext` ile tek seferde hesaplanır.
- `m.` altındaki efektler:
  - `click`, `tick`, `blip`, `bell`
  - `boom`, `whoosh`, `riser`, `crackle`, `wind`, `rain`, `hum`, `staticNoise`, `glitch`, `buzz`, `wobble`
  - `pop`, `typeKey`, `hoof`, `heartbeat`, `fireIgnite`, `projector`
  - `pad(t,dur,notes)`
- Her sahneye bir pad akoru verilir ve vurgular `cue`'ya bağlanır:
  - büyüteç: whoosh
  - hüküm damgası: boom
  - öneri kartları: pop notaları
- Seslendirme `--anlatimsiz` ile miksin dışında kalır.

### 8. Render ve önizleme

```bash
npm install --prefix video        # playwright (Chromium /opt/pw-browsers'ta hazır; "playwright install" çalıştırma)
node video/render.mjs <bolum> --frames 12,45.5        # → video/out/preview/*.png (Read ile bak)
node video/render.mjs <bolum> --from 30 --to 60       # aralık
node video/render.mjs <bolum> --anlatimsiz --workers 4   # tam film; 9 dk ≈ 15–17 dk sürer
node video/araclar/duman.cjs video/<bolum>             # sahte tuvalle baştan sona çizim, JS hatası sayısı
```

- Oynatıcı `?kayit` (render kipi) ve `?anlatimsiz` seçeneklerini tanır.
- Klavye: boşluk oynatır, ← → 5 sn sarar, `f` tam ekran yapar.
- Uzun render'ı arka planda çalıştır. Durdurmak için PID'i öldür; `pkill -f` kendi kabuğunu da öldürür.
- `render.mjs` bayat `voice.js` ile durur. Önce `narrate.mjs` çalıştır.

### 9. Yerleşim dersleri (önizlemede kontrol et)

- Her sahnenin en kalabalık anından kare al. Taşan yazıya, birbirine binen damga ve karta, etiketi kapatan nesneye bak.
- Kartları geniş tut. Uzun Türkçe sözcükler beklenenden uzun çıkar.
- Doğrulanmamış bir sayıyı ekrana yazma. HUD'da "10.000 kare/sn" yerine "yüksek hızlı kamera" yazıldı.
- Videoda alt yazı bandı yok. Eski `captions()` tamamen kaldırıldı.
- Karakter kadrajın bir yanında, içerik kartları öbür yanındadır. Sağ alt köşe, YouTube'un bitiş ekranı ve süre etiketi için sade kalır.

### 10. Shorts (1080×1920)

`kisa/kisa.js` uzun bölümün filmini yükler ve seçilen anları dikey kadraja yakınlaşarak yeniden çizer. Görüntü videodan kırpılmadığı için vektör kadar keskindir. Her `kisa-*/film.js` yalnız bir çekim listesidir (an, kadraj, öbek). Kayıtlar `seslendirme/Kisa/`, YouTube bilgileri `kisa/youtube.txt` içinde.

---

# references/senaryo-yazimi.md

## Senaryo ve seslendirme metni yazımı

İçindekiler: 1. Bütün seriler için ortak kurallar · 2. Tabağındaki Bilim iskeleti ve sabitleri · 3. Bilişim ve Uykunun Bilimi farkları · 4. Bilimsel doğruluk ve kaynaklar · 5. Dosya biçimleri · 6. Kayıttan önce kontrol listesi

Kullanıcının isteği şöyleydi: "bilimsel ve gündelik dilde, zevkle izlenecek güzel Türkçeli ve kısmen samimi bir içerik". Soğan bölümü bu isteğin kalıbıdır ve sonraki bütün bölümlere örnek olur (`video/sogan-neden-aglatir/`).

### 1. Ortak kurallar

**Ton.** Mutfakta, odada ya da masada yanında duran, bilgili ve meraklı bir arkadaş gibi konuş. İzleyiciye "sen" de. Samimi ol ama laubali olma; "kanka" ya da "aga" gibi sözler kullanılmaz. Kimseyle alay edilmez. Yaygın bir yanlış için "yanlış biliyorsun" denmez, "çok yaygın bir tavsiye, ama…" denir.

**Cümle.**
- Bir cümlede bir fikir olsun. İdeal uzunluk 20 kelimenin altıdır, 30'u geçmez.
- Etken fiil ve somut özne kullan: "Bıçak duvarı yıkar." ("Duvarın yıkılması gerçekleşir." değil.)
- Önce soru sor, sonra cevapla. İzleyici cevabı bir an aklından geçirsin.
- Metni sesli oku. Dil sürçmesi yapan cümleyi değiştir.

**Terim.**
- Bölüm başına en fazla 3–4 bilimsel terim kullan. Terim bir kez söylenir ve hemen ardından gündelik karşılığı verilir: "bir enzim var: alliinaz. Biz ona soğanın makası diyelim."
- Dil kıran bir ad söylenebilir, ama hemen bir lakap verilir: "sin-propantiyal-S-oksit. Biz kısaca ağlatan gaz diyelim."
- Yerleşik Türkçesi olan terimin Türkçesini kullan: tepkime (reaksiyon değil), işleyiş (mekanizma değil), düzenek, ara ürün.

**Benzetme.** Bölüm boyunca tek bir benzetme sistemi kurulur ve sonuna kadar kullanılır; soğanda bu sistem ev, oda, duvar ve makastı. Benzetme bilimsel olarak yanlış bir şey ima etmemeli. Makas benzetmesi doğrudur, çünkü alliinaz gerçekten bir bağı keser.

**Sayılar.** Seslendirmede sayılar yazıyla yazılır ("iki bin yirmi beş", "saniyede kırk metre"). Her büyük sayının yanında tanıdık bir karşılaştırma olur: "saatte yüz kırk kilometreden fazla; otoyoldaki çoğu arabadan hızlı." Ekranda ve açıklamada rakam kullanılır.

**Mizah.** Bölüm başına 3–4 hafif an yeterli; en iyisi karakterin kendi hâline dair olanlar (ağlarken, gözlüğü takarken). Deyimler yerinde ve az kullanılır: göz açıp kapayıncaya kadar, dil kırıcı, oracıkta.

**Pratik kazanç.** İzleyici bölümden iki şeyle ayrılmalı: anlatabileceği bir "vay be" nedeni ve o akşam deneyebileceği bir şey. Her önerinin tek cümlelik nedeni de söylenir. Sağlık tavsiyesi verilmez; mutfak güvenliği hatırlatılabilir ("Parmakların da sana teşekkür eder").

**Ekran yazısı.** Kısa olur ve söyleneni tekrar etmez. Ad, sayı ya da hüküm gösterir. Videoda alt yazı yoktur.

### 2. Tabağındaki Bilim

**Uzunluk.** 40–45 satır, 850–950 kelime. Bu yaklaşık 7 dakika ses, animasyon payıyla yaklaşık 9 dakika video eder.

| # | Bölüm | Süre | Ne olur | Soğandaki karşılığı |
|---|---|---|---|---|
| 1 | Soğuk açılış | 0:00–0:25 | Karakter yok. Yakın çekim, tanıdık bir mutfak anı, "sen" diye anlatılır, bir soruyla biter. | "Peki avucuna sığan bir sebze, koca bir insanı nasıl ağlatabiliyor?" |
| 2 | Selam ve vaat | 0:25–0:50 | Sabit selam. Bugün ne göreceğiz, sonunda ne kazanacaksın, bir merak kancası. | "Bunlardan biri, çoğumuzun yaptığının tam tersi." |
| 3 | Küçük deney | 0:50–1:15 | Evde yapılabilecek ya da bilinen bir gözlem; sorunun içindeki ipucu. | Bütün soğan kokmaz, kesince değişir. |
| 4 | Büyüteç anı | 1:15–2:40 | "Hadi biraz yaklaşalım." Mekanizma adım adım, tek benzetmeyle. | İki odalı ev, makas, duvar, ikinci enzim. |
| 5 | Vücuttaki karşılığı | 2:40–3:25 | Olay bize nasıl dokunuyor? | Kornea, sinir, beyin, gözyaşı itfaiyesi. |
| 6 | Neden böyle? | 3:25–4:20 | Doğadaki anlamı ve bir karşılaştırma (benzeri neden yapmıyor?). | Bitki kaçamaz, kimyayla savunur. Sarımsak neden ağlatmaz? |
| 7 | Ölçü ve değişkenlik (isteğe bağlı) | 4:20–4:50 | Gerçek birim ve neye göre değiştiği. | Pirüvik asit, çeşit, mevsim. |
| 8 | En taze araştırma | 4:50–6:00 | Son birkaç yıldan bir çalışma; yıl, ülke ve kurum söylenir. | Cornell 2025: damlacıklar, kör ve hızlı bıçak. |
| 9 | Bu akşam dene | 6:00–7:05 | 3–4 numaralı öneri, her birinin nedeni; biri görsel espri olabilir. | Bıçağını bile, acele etme, havalandır, gözlük. |
| 10 | Efsane mi, gerçek mi? | 7:05–8:05 | 2–3 yaygın inanç, her birine hüküm: **Gerçek · Efsane · Şüpheli · Kanıtı yok**. | Buzdolabı: şüpheli. Ekmek ve mum: kanıtı yok. Ağlatmayan soğan: gerçek. |
| 11 | Kapanış | 8:05–8:50 | Tek cümle özet, "bu akşam" hatırlatması, sonraki bölümün sorusu, sabit kapanış. | "Bir sonraki tabakta görüşmek üzere!" |

**Sabit cümleler (her bölümde birebir aynı):**
- Selam: "Tabağındaki Bilim'e hoş geldin! Burada her gün mutfakta gördüğümüz küçük olaylara büyüteçle bakıyoruz."
- Büyüteç: "Hadi biraz yaklaşalım." Büyüteç ekrana girer, merceğin içinde mikro dünya açılır, aynı ses efekti çalar.
- Köşe adı: "Efsane mi, gerçek mi?" Hükümler damgayla verilir: Gerçek yeşil, Efsane kırmızı, Şüpheli sarı, Kanıtı yok gri.
- Kapanış: "Tabağındaki Bilim'de bugünlük bu kadar. Bir sonraki tabakta görüşmek üzere!"
- Köprü: Kapanıştan önce sonraki bölümün sorusu sorulur. Bölüm içinde başka bir bölüme göz kırpılabilir ("Kavrulan soğan neden tatlanır? O başka bir bölümün konusu.").

**Karakter ifadesi** metne göre seçilir: merak (büyüteç), şaşkınlık (yeni bulgu), düşünme (neden?), gülme (espri), ağlama ya da yanma (konuya göre).

**Satır kimlikleri** iskeletin harfleriyle başlar:
- `a-` açılış
- `s-` selam
- `d-` deney
- `b-` büyüteç
- `g-` vücut (göz)
- `n-` neden
- `k-` ölçü
- `c-` araştırma
- `p-` öneri
- `e-` efsane
- `z-` kapanış

Örnekler: `a-cut`, `b-zoom`, `p-knife`, `z-end`.

### 3. Diğer seriler

**Bilişim Teknolojileri Yetkinliği.**
- Karakter yoktur; anlatıcı dışarıdandır. Ton daha hikâyeci ve ağırbaşlıdır. Kitabın imgeleri kullanılır: ateş, taş, kapı, köprü, usta-çırak.
- Bölüm şu açılışla başlar: "Birinci kapı, N. bölüm: …". Ardından önceki bölümün tek cümlelik hatırlatması ve yeni soru gelir.
- Somut gündelik düzenekler kullanılır: buzdolabının ışığı, merdiven lambası, kapı zili.
- Tarihsel kişiler yıl ve katkılarıyla anılır: Boole, Shannon, ENIAC.
- Uzunluk 9–15 dakika, 60 civarı satır.
- Kimlikler konu adıyla yazılır: `and-setup`, `or-cases`, `adder-carry`. `beat: 'sahne.vuruş'` alanı da kullanılabilir.

**Uykunun Bilimi.**
- Soğuk açılış bir gece sahnesidir ("Gece saat bir buçuk…").
- Mekanizma (iç saat, melatonin), deneyler, "bu akşam" önerileri (7 madde) ve kaynaklarla devam eder.
- İzleyici "sen"dir. Kimlikler kısa ön ekle yazılır: `h-night`, `c-body`.

### 4. Bilimsel doğruluk

- **Her bilgi kaynağa bağlanır** ve `kaynaklar.md` tablosuna yazılır (Bilgi | Kaynak). Öncelik sırası: hakemli makale (DOI ile), üniversite ya da kurum sayfası, en son haber. Ticari site ve blog kaynak sayılmaz.
- **Araştırma anlatılırken yıl, ülke ve kurum söylenir:** "İki bin yirmi beşte, Amerika'daki Cornell Üniversitesi'nden…"
- **Fiil seçimi önemlidir.** "Gösterdi", "gördü", "ölçtü" denir. "Kanıtladı" ya da "kesin olarak" denmez. Kesin olmayan şey açıkça söylenir: "Araştırmacılar bunun için daha çok çalışma gerektiğini söylüyor."
- **İnternette çok tekrarlanan ama doğrulanamayan bilgi metne alınmaz.** Örnek: "gözde sülfürik asit oluşur". Neden alınmadığı `kaynaklar.md` içinde "Bilerek metne alınmayanlar" başlığına yazılır.
- **İnce ayrıntıyı iki kez kontrol et.** Japon ağlatmayan soğanında (Kato 2016) baskılanan enzim alliinazdır (makas), ikinci enzim değil. Bunu bir kez yanlış yazdık.
- **Web aracı.** Repo ortamında WebFetch çoğu sitede DNS hatası verdi. WebSearch özetleri ve DOI'ler yeterli oldu.

### 5. Dosya biçimleri (her bölüm klasöründe)

**`senaryo.md`** bölümün planıdır:
- Başta: bölümün fikri (tek cümle), izleyicinin aklında kalacak üç an, süre, anlatıcı tonu.
- Her bölüm için: `## N · Ad · ~zaman`, ardından **Görüntü / Karakter / Ses** notları ve satırlar.
- Sonda: "Eksik görseller" ve "YouTube başlığı önerileri".

**`narration.js`** (motorun okuduğu metin):
```js
window.NARRATION = {
  lines: [
    // 1 · Soğuk açılış
    { id: 'a-cut', say: "Kesme tahtası hazır, bıçak hazır, soğan hazır. Birinci kesik, ikinci kesik… Daha yarısına gelmeden gözlerin yanmaya başlıyor." },
    ...
  ],
};
```
Noktalama hem durak hem öbek sınırıdır: film bir öğeyi `cue('a-cut', 3)` ile satırın 3. öbeğine (0'dan sayılır) bağlar. Noktalama değişirse `film.js`'teki cue numaralarını da denetle. Kaydı alınmış bir satırın metni değişirse kimliği de değişir.

**`seslendirme-metni.txt`** okuyan kişi için okunaklı sürümdür:
```
Tabağındaki Bilim · Bölüm 1 · Soğan Neden Ağlatır? · seslendirme metni (44 satır)
(Samimi, meraklı, gülümseyen bir anlatıcı; … Köşeli parantezdeki kimlikler okunmaz.)

1 · Soğuk açılış
  [a-cut]  Kesme tahtası hazır, …
```

**`seslendirme-pause.txt`** ElevenLabs'e yapıştırılan dosyadır:
- Yalnız satırlar bulunur, aralarında tek başına `[pause]` olur.
- Başlık ve kimlik yazılmaz. Okunuşu karışık adlar burada okunduğu gibi yazılır (bkz. `seslendirme-ve-kayit.md`).
```
Kesme tahtası hazır, bıçak hazır, soğan hazır. Birinci kesik, ikinci kesik… Daha yarısına gelmeden gözlerin yanmaya başlıyor.
[pause]
Birkaç saniye sonra gözyaşları da geliyor. …
[pause]
```

**`kaynaklar.md`:**
- `# Başlık — kaynaklar` ve `| Senaryodaki bilgi | Kaynak |` tablosu.
- Ardından `## Bilerek metne alınmayanlar` başlığı gelir.
- Açıklamadaki "📚 KAYNAKLAR" listesi buradan kısaltılır: "Konu: Yazar vd., Dergi Yıl · DOI bağlantısı".

### 6. Kayıttan önce kontrol listesi
- [ ] Soğuk açılış 25 saniyenin altında ve bir soruyla bitiyor.
- [ ] Selam, "Hadi biraz yaklaşalım." ve kapanış birebir aynı (Tabağındaki Bilim).
- [ ] Tek ana benzetme var ve sonuna kadar tutarlı.
- [ ] En fazla 4 terim var, her birinin gündelik karşılığı verilmiş.
- [ ] Her sayı yazıyla yazılmış ve karşılaştırması var.
- [ ] Her önerinin nedeni söylenmiş.
- [ ] Hükümler kaynakla destekli, kesin olmayana "şüpheli" denmiş.
- [ ] `kaynaklar.md` içinde her bilginin satırı var.
- [ ] Sonraki bölümün sorusu kapanışta soruluyor.
- [ ] Metin sesli okundu, dil sürçmesi kalmadı.

---

# references/seslendirme-ve-kayit.md

## Seslendirme: ElevenLabs metni, kaydı bölme, doğrulama, sesi ekleme

İçindekiler:
1. ElevenLabs'e gidecek metin
2. Kayıt geldiğinde
3. Bölme hattı nasıl çalışır?
4. Raporu okumak ve elle düzeltmek
5. Filme oturtmak ve miks
6. Kısmi kayıt ve yeniden kayıt

### 1. ElevenLabs'e gidecek metin

- **Ses.** Kullanıcının kendi sesinden IVC klonu kullanılır. Ses adı "Selim Savaş", model v4. Dosya adındaki ayarlar şunlar: `sp100_s50_sb75` (hız 100, kararlılık 50, benzerlik 75). Kullanıcı tek bir dosya üretip tek bir mp3 yükler.
- **Biçim.** `seslendirme-pause.txt` kullanılır: her satır kendi paragrafındadır ve satırların arasında tek başına bir `[pause]` bulunur. Böylece satır aralarında uzun ve temiz sessizlikler oluşur ve kesim oralardan yapılır. Başlık, kimlik ya da açıklama yazılmaz.
- **Okunduğu gibi yazım.** Bu kural yalnız kayıt metni için geçerlidir. Ekranda, altyazıda ve `narration.js`'te özgün yazım kalır.

  | Özgün | Kayıt metninde |
  |---|---|
  | S-oksit (sin-propantiyal-S-oksit) | es oksit |
  | ENIAC | Eniak |
  | George Boole / Boole'un | Corc Bul / Bul'un |
  | Claude Shannon | Klod Şenın |
  | VE, VEYA, DEĞİL (kapı adları, büyük harf) | ve, veya, değil (küçük harf; büyük harfi kısaltma gibi heceliyor) |
  | 2025, 40 m/s | iki bin yirmi beş, saniyede kırk metre (zaten yazıyla) |

  Yeni bir yabancı ad ya da kısaltma gelirse aynı mantıkla Türkçe okunuşunu yaz. Kullanıcıya hangilerini değiştirdiğini bir satırda söyle.
- **Bilinen sorun.** Bazı modeller `[pause]` yazısını sesli okudu. v4 ile sorun çıkmadı. Okunursa, ilgili satırları kullanıcıdan yeniden üretmesini iste ya da sözcüğü kesimde dışarıda bırak.
- **Teslim.** Repo varsa dosyayı SendUserFile ile gönder. Yoksa metni tek bir kod bloğu içinde ver.

### 2. Kayıt geldiğinde (repo gerekir)

Yüklenen dosya bir yükleme klasörüne düşer. Yolu kullanıcı mesajında `@…mp3` biçiminde görünür.

```bash
bash video/araclar/kaydi-bol.sh <bolum> <kayit.mp3> <KayitKlasoru> [asr=/tmp/asr] [calisma=/tmp/kayit-<bolum>]
```

Kayıt klasörüne CamelCase bir ad ver: `Sogan`, `TasaKazinan`, `MaviIsik`. Betik sırasıyla şunları yapar:

1. Gerekirse Whisper ortamını kurar (`asr-kur.sh`: `npm i @huggingface/transformers sts-whisper-small`). Model npm paketinin içindedir (~700 MB), yani Hugging Face erişimi gerekmez.
2. Kaydı 16 kHz mono f32'ye çevirir.
3. `narration.js`'ten satır kimliklerini sırayla `ids.txt`'ye yazar.
4. `kelimeler.mjs` ile sözcük zamanlı döküm alır (9 dakikalık kayıtta birkaç dakika sürer).
5. `hizala.cjs` ile hizalar ve `out/segments.json` ile `out/marks.json` dosyalarını üretir.
6. `kes.py` ile ham kesim yapar: `parcalar/<id>.mp3`, 192k, yalnız uçlarda 6 ms yumuşatma.
7. `dokum.mjs` ile her parçayı ayrı ayrı yazıya döker.
8. `wer.cjs` ile satır satır sözcük hata oranını hesaplar.
9. Parçaları ve `marks.json`'ı `video/seslendirme/<KayitKlasoru>/` klasörüne kopyalar.

### 3. Bölme hattı nasıl çalışır?

- **Hizalama.** Senaryo sözcükleri ile Whisper sözcükleri, normalleştirilip (Türkçe küçük harf, kesme işareti ve noktalama atılmış) Needleman–Wunsch yöntemiyle eşlenir. Eşleşmede Levenshtein benzerliği kullanılır, bu yüzden Whisper'ın yanlış yazdığı sözcükler de eşleşebilir. Her satırın ilk ve son eşleşen sözcüğü bulunur.
- **Kesim noktası.** İki satır arasındaki sessizlikler 10 ms'lik RMS zarfıyla aranır ve kesim en uzun sessizliğin içinden yapılır. `[pause]` bu sessizliği zaten uzun yapar.
- **`marks.json`.** Her satır için öbeklerin (noktalama ile ayrılan parçaların) satır içindeki başlangıç saniyeleri yazılır, örneğin `{"a-cut":[0,1.54,2.76,…]}`. `narrate.mjs` bunları `voice.js`'e taşır. Film görselleri `cue(id,k)` ile bu anlara bağlar. `dub.mjs` de sesi bu anlara göre yerleştirir.
- **İşleme yok.** Gürültü azaltma, EQ ve sıkıştırma kullanıcının sesini bozdu; kullanıcı ham sesi istedi.

### 4. Raporu okumak ve elle düzeltmek

- **Kapsama.** %95'in üstü beklenir.
- **"EŞLEŞME YOK".** Bir satır hiç bulunamadı ve betik 1 koduyla çıkar. Genellikle Whisper'ın son satırı kaçırmasıdır; aşağıdaki maddeye bak.
- **"fazla sözcük".** İki satır arasında eşleşmeyen sözcüklerdir. Nedeni Whisper'ın 30 saniyelik parça bindirmesinde aynı sözcükleri iki kez yazması (zararsız) ya da kayıtta fazladan okunmuş bir şey (`[pause]` okunmuş olabilir) olabilir. Hangisi olduğunu zamanına bakarak anla.
- **Uçlarında ses olan parça.** Kesim bir sözcüğün içine düşmüş olabilir. O iki satırın sınırını kontrol et.
- **WER.** Toplamda %5–10 normaldir: Whisper sayıları rakamla yazar ("2025"), yabancı adları farklı duyar ("Kork Bull"). Eşik üstü bir satırda asıl aranan şey, satır başında ya da sonunda eksik ya da komşu satırdan gelmiş bir sözcüktür. Örnek: soğanda "İki:" sözcüğü önceki satır `p-knife`'ın sonunda kalmıştı. Düzeltme `p-knife end 309.12`, `p-slow start 309.22` oldu.
- **Elle düzeltme:**
  1. `/tmp/kayit-<bolum>/out/segments.json` dosyasında ilgili `end` ve `start` değerlerini değiştir. Kelime zamanları için `kelimeler.json`'a bak.
  2. `python3 video/araclar/kes.py kayit.mp3 out/segments.json parcalar` ile yeniden kes.
  3. Değişen parçaları `dokum.mjs` ile yeniden dök ve `wer.cjs` ile tekrar kontrol et.
  4. Parçaları ve `marks.json`'ı kayıt klasörüne yeniden kopyala. Sınır değiştiyse `marks.json` içindeki o satırın öbek başlarını da kaydır (`hizala.cjs` yeniden çalıştırılabilir).
- **Son satır kaçtıysa:**
  1. Kaydın son ~10 saniyesini `ffmpeg -ss` ile ayrı bir dosyaya kes ve `dokum.mjs` ile dök. Bu döküm sözcük zamanı vermez.
  2. Son satırın sözcüklerini, kuyruğun başlangıç saniyesini ekleyerek ve sözcüklere satır süresi içinde eşit aralıklı zaman vererek `kelimeler.json`'ın sonuna ekle. ch02'de 542.07–543.10 aralığı böyle eklendi.
  3. `hizala.cjs`'i yeniden çalıştır.

### 5. Filme oturtmak ve miks

```bash
node video/narrate.mjs <bolum> --engine files:$PWD/video/seslendirme/<KayitKlasoru>
```

- `narrate.mjs` satırları sürelerine göre yerleştirir, gerekirse vuruşları uzatır ya da dondurur ve `voice.js`'i yazar. Film bir satır bitmeden ilerlemez.
- **İkinci çalıştırma.** Tabağındaki Bilim'in `film.js`'i sahne sürelerini kayıttaki satır sürelerinden alır (`recorded[id]`). İlk çalıştırmada film değişir ve `voice.js` bayatlar, bu yüzden bir kez daha çalıştır. Bilişim bölümlerinde bir kez yeterlidir.
- **Bayatlık kontrolü.** `altyazi.cjs` ya da `bolumler.cjs` "taze değil" diyorsa yeniden çalıştır. `render.mjs` bayat `voice.js` ile durur.
- **Seslendirme miksi.** `render.mjs <bolum> --anlatimsiz` ile görüntü sessiz (yalnız müzik ve efekt) dökülür. Ardından `dub.mjs <bolum> --kayit <klasör>` ile insan sesi eklenir. Görüntü akışı kopyalanır, yalnız ses yeniden karışır. Kayıttaki duraklar görüntünün bağlı olduğu öbeklere hizalanır; sığmayan satırda önce duraklar kısalır, gerekirse satır hafifçe hızlanır.
- **Seçenekler:** `--video a.mp4,b.mp4` (farklı kaynak video), `--atla id1,id2` (o satırların kaydını kullanma), `--gain 1.25`.
- **Ses düzeyi.** `ffmpeg -i X.mp4 -af loudnorm=print_format=summary -f null -` ile ölç. Hedef yaklaşık -15 LUFS ve -1 dBTP'nin altı.

### 6. Kısmi kayıt ve yeniden kayıt

- **Tek satır değiştiyse.** Satırın kimliğini değiştir. Kullanıcıdan yalnız o satırı üretmesini iste, dosyayı `<yeni-id>.mp3` olarak kayıt klasörüne koy ve `marks.json`'a öbek başlarını ekle (ya da tahmine bırak). Sonra narrate, render ve dub adımlarını uygula.
- **Bütün bölüm yeniden seslendirilirse** yeni bir kayıt klasörü aç (ör. `TasaKazinan`). Eski klasör kalabilir.
- **Eski kayıtla dökülmüş bir video kullanıcıda varsa** ona ayrı bir ad ver (ör. `ch02-…-eski-kayit-paylasim.mp4`), böylece karışmaz.

---

# references/youtube-paketi.md

## YouTube yükleme paketi

Kullanıcı "başlık, açıklama ve etiketleri tam ver" dediğinde bu paketin tamamı verilir. Repo varsa `video/<bolum>/youtube/aciklama.txt` dosyasına da yazılır. Örnekler:
- Tabağındaki Bilim: `sogan-neden-aglatir/youtube/aciklama.txt`
- Bilişim: `ch02-tasa-kazinan-mantik/youtube/aciklama.txt`
- Uykunun Bilimi: `yup-mavi-isik/youtube/aciklama.txt`

### Sınırlar (paketi vermeden önce say)

| Alan | Sınır | Not |
|---|---|---|
| Başlık | 100 karakter | Telefonda ilk ~60 karakter görünür. Önce merak sorusu, en sonda seri adı ve numarası gelir. |
| Açıklama | 5.000 **bayt** | Türkçe harfler (ç ğ ı ö ş ü İ) 2 bayt, emoji 4 bayt sayılır. Hem karakteri hem baytı yaz. `<` ve `>` kullanılmaz. |
| Bölümler | İlki `0:00`, en az 3 bölüm, her biri ≥10 sn | `node video/araclar/bolumler.cjs video/<bolum> [--satir]` |
| Etiketler | 500 karakter | Virgüller sayılır, boşluk içeren etikete +2 eklenir. ~25 etiket hedeflenir. |
| Hashtag | Açıklamadaki ilk 3 hashtag başlığın üstünde görünür | Seri hashtag'i ilk sırada olur. |
| Kapak | 1280×720, 2 MB altı, 16:9 | Sağ alt köşe boş kalır (süre etiketi oraya gelir). |

Sayım için:
```bash
python3 -c "import sys;s=open(sys.argv[1]).read();print(len(s),'karakter',len(s.encode()),'bayt')" aciklama-govde.txt
```

### Paket şablonu

```
YUP AKADEMİ · <SERİ> #N · <BÖLÜM ADI> · YOUTUBE YÜKLEME PAKETİ
Video: <bolum>-youtube.mp4 (M:SS) · Altyazı: altyazi-tr.srt

1) BAŞLIK
<Seçilen başlık>
Alternatifler:
• …
• …

2) AÇIKLAMA  (çizgiler arasını olduğu gibi yapıştır; X karakter / Y bayt, sınır 5.000)
----------------------------------------
<İlk cümle: aranan soruyu ve cevabın kancasını taşır; anahtar kelimeler burada (~140 karakter)>

<İkinci paragraf: bu videoda ne göreceksin, sonunda ne kazanacaksın.>

<Seri satırı: "🍳 Tabağındaki Bilim serisinin N. bölümü. Serinin tamamı: [OYNATMA LİSTESİ BAĞLANTISI]">

▶ BU VİDEODA NELER ÖĞRENECEKSİN?   (Bilişim'de: madde listesi, emoji yok)
• … (6–9 madde; her biri tek cümle, somut bilgi ve sayı içerir)

BÖLÜMLER
0:00 <merak sorusu>
0:28 …
…

✅ BU AKŞAM DENE        (Tabağındaki Bilim / Uykunun Bilimi)
1. …: <neden>
…

🔍 EFSANE Mİ, GERÇEK Mİ?   (Tabağındaki Bilim)
• <inanç>: ŞÜPHELİ (kısa gerekçe)
…

💬 <izleyiciye soru, yorum daveti>. Sıradaki bölüm: <sonraki sorunun kendisi>
🔔 Yeni bölümler için abone ol.

📚 KAYNAKLAR
<Konu>: <Yazar> vd., <Dergi> <Yıl> · https://doi.org/…
…

YUP Akademi · merak edenler için.

#<SeriHashtag> #<konu> #<konu2>
----------------------------------------

3) ETİKETLER  (virgüllerle birlikte yapıştır; N etiket, ≈ X / 500)
<seri adı>, <ana konu>, <arama cümleleri: "soğan neden ağlatır", "… nasıl", "… neden">, <ilgili terimler>, <genel: bilim, popüler bilim, eğitici video>, YUP Akademi

4) YOUTUBE STUDIO AYARLARI
• Oynatma listesi    : "<Seri> | YUP Akademi" (Bilişim: "Bilişim Teknolojileri Yetkinliği | Dijital Dünyayı Baştan Sona Anlamak"); liste yoksa liste açıklaması da ver
• İzleyiciler        : Hayır, çocuklara özel değil
• Değiştirilmiş veya yapay içerik : EVET (seslendirme kanal sahibinin sesinden yapay zekâyla üretildi; cezası yok, küçük bir etiket eklenir)
• Dil                : Türkçe · Altyazılar → Dosya yükle → "Zamanlamayla" → altyazi-tr.srt
• Kategori           : Tabağındaki Bilim/Uykunun Bilimi: Bilim ve Teknoloji (alt. Eğitim) · Bilişim: Eğitim
• Lisans             : Standart YouTube Lisansı · Yerleştirmeye izin ver
• Yorumlar           : Açık; sıralama "En popüler"
• Bitiş ekranı       : son 15–20 sn (M:SS – M:SS). Hangi tarafın boş olduğunu yaz (karakter ya da ortadaki yazı kapanmasın).
                       Öğeler: Abone ol + sıradaki video (yayınlandıysa) ya da oynatma listesi.
• Bilgi kartları     : 2–3 kart (önceki bölüm başta, seri listesi ortada, sıradaki bölüm sonda)

5) SABİTLENMİŞ YORUM
<Tahmin ya da deneyim soran bir soru + zaman damgası + sıradaki bölümün kancası>

6) KÜÇÜK RESİM
<Gemini promptu; bkz. gemini-promptlari.md>
```

### Yazım ipuçları

- **Başlık.** Arama dilinde soru sor ("Soğan Doğrarken Neden Ağlarız?") ve ardından şaşırtan bir kanca ekle ("Hızlı Doğramak İşe Yaramıyor"). Bilişim'de bölüm adı başta durur ("Taşa Kazınan Mantık: Elektrik Nasıl Düşünür?").
- **İlk cümle.** İzleyicinin arayacağı soruyu ve cevabın ilk ipucunu taşır.
- **Madde listesi.** Videodaki gerçek ve kaynaklı bilgilerden oluşur, sayılar rakamla yazılır ("saniyede 40 metre, yani saatte 144 kilometre"). Spoiler'dan korkma: arama ve izleyici güveni için iyidir.
- **Bölüm adları.** Merak uyandıran kısa sorular kullan ("Sarımsak neden ağlatmaz?").
- **Seride gezinme** (Bilişim): `SERİDE` bloğu, ardından `◀ Önceki: … [BAĞLANTI]`, `▶ Sıradaki: …` ve `Oynatma listesi: [BAĞLANTI]` satırları.
- **Bağlantılar.** Kullanıcının dolduracağı yerleri köşeli büyük harfle bırak: `[OYNATMA LİSTESİ BAĞLANTISI]`.
- **Etiketler.** Arama cümlelerini olduğu gibi ekle ("soğan doğrarken ağlamamak"). Son etiket kanal adıdır: Bilişim'de "YUP Stüdyo", diğer serilerde "YUP Akademi".

### Altyazı

```bash
node video/araclar/altyazi.cjs video/<bolum> video/<bolum>/youtube/altyazi-tr.srt
```

- SRT, filmin seslendirme planından (`cue`/`end`) yazılır. `dub.mjs` sesi bu anlara hizaladığı için zamanlar sesle örtüşür.
- `voice.js` taze olmalı.
- Satır en fazla 42 karakter, iki satırdır. Ekrandaki özgün yazım korunur ("S-oksit", "ENIAC").
- Videoya gömülmez. Kullanıcı YouTube'a ayrıca yükler.
