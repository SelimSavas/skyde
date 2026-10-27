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
- **Shorts kuralları (izleyici verisinden, Ekim 2026).** "Islak saç" short'unda izleyicilerin yalnız %35,4'ü izlemeye devam etti, %65'i ilk anlarda kaydırdı. Beğeni ve yorum düşük kaldı. Bu yüzden:
  1. İlk kare ve ilk cümle doğrudan çarpıcı bir bilgi ya da görüntüdür ("Ateşteki kestane, küçük bir buhar bombasıdır."). "Bunu kaç kez duydun?" ya da "Sence?" gibi sorularla açılmaz. Başlık ve ana görsel ilk karede hazırdır (solarak gelmez).
  2. 30–40 sn, yaklaşık 70–80 kelime. Satır arası boşluk az tutulur: `YupKisa.short({ gap: 0.15, breath: 0.25, wipe: 0.4 })`, `extra` değerleri 0,4–1,2 sn.
  3. Tek çağrı, yalnızca sonda: "Hangi … merak ediyorsun? Yorumlara yaz, sıradaki video o olsun." Ortada oy ya da yorum çağrısı olmaz. Abone daveti görseldir (logo ve "abone ol" düğmesi).
  Örnek: `video/kisa-kestane/`.
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

**Biten short:** `kisa-kis-saati` (0:58, yeni marka dili, kayıt `seslendirme/KisSaati`; paket `kisa-kis-saati/youtube.txt`). Dikey short'un dub çıktısı (yaklaşık 650 kbps, 6 MB) doğrudan yüklenebilir, yeniden kodlamaya gerek yok.

**Görsel dil (2026-10-27, kullanıcı geri bildirimi):** Kullanıcı yuvarlak hap etiketleri, ortalanmış büyük harf başlıkları ve kusursuz vektör çizimleri "çok yapay, yapay zekâ gibi" buldu. Yeni short'larda `video/yup-marka/el.js` ("el yapımı" katman) kullanılır:
- kâğıt dokusu ve kahve lekesi (`paper`);
- saniyede 12 kez titreyen mürekkep ve kaymış baskı dolgusu (`ink`), tarama gölge (`hatch`);
- sola yaslı Fraunces başlık ve fosforlu kalem vurgusu (`headline`), IBM Plex Mono şekil notu (`mono`), Patrick Hand kenar notu ve el çizimi ok (`hand`, `arrow`, `ring`, `scratch`);
- lastik damga (`rubber`), yapışkan not (`sticky`), bant (`tape`), çetele (`tally`).
Yazı tipleri `el-yazi.js` dosyasında gömülüdür (`build-el.py`); `index.html`'e kisa.js'ten sonra `el-yazi.js` ve `el.js` eklenir, film.js'te `FILM_READY` EL_FONTS_READY ile birleştirilir. Örnek: `kisa-kahve/`.

**Biten short'lar:** `kisa-kahve` ("Bu Sensin" gönder kalıbı: kanca bir insan tipini anlatır, bilim onu haklı çıkarır, kapanış `api.cta(ctx, t, { share: ['satır', 'satır'] })` ve `short({ share: true })`; kurgu: her öbekte görüntü değişir, köşede "Birazdan: …" vaadi sonraki sahnede ödenir, kancadaki karakter sona doğru geri döner; konu listesi `video/kisa/gonder-formati.md`); `kisa-falso` (derbi özel, gerçekçi kalıp: kodla ışın izlenen gece stadyumu, `flight()` ile yer çekimi + hava direnci + Magnus'tan hesaplanan top yolu, kesik ikosahedron top, potansiyel akışla duman tüneli; koyu sahnelerde `darkTag`, 0:38, kayıt `seslendirme/Falso`); `kisa-kestane` (hızlı kalıp, 0:41, kayıt `seslendirme/Kestane`); `kisa-islak-sac` (Efsane mi, Gerçek mi? #1, 0:59, kayıt `seslendirme/IslakSac`, paket `youtube.txt`). Araçlar (`altyazi.cjs`, `bolumler.cjs`, `duman.cjs`) filmi `araclar/yukle.cjs` ile bölümün `index.html` betik sırasına göre yükler, bu yüzden ortak marka modülünü de görürler.

**Sıradaki olası işler:**
- Tabağındaki Bilim #2 "Acı biber ağzını neden gerçekten yakar?" (aşama kareleri promptu hazır: `tabagindaki-bilim/animasyon-promptlari.txt` E2)
- Bekleyen Shorts kayıtları (`kisa-durak`, `kisa-harf`)
- Udemy tanıtımının insan sesi
- Güncel konu fikirleri (Ekim 2026): `video/konu-fikirleri-2026-10.md` dosyasında 10 konu var: kış saati, 2026 Nobel'leri, zayıflama iğnesi, üşütmek, yapay zekâ, kestane, ilk bilgisayar, falso. Bazılarının son tarihi var (25 ve 29 Ekim).
- Gündemden 10 short konusu (26 Ekim 2026): `video/konu-fikirleri-2026-10-26.md`. Havai fişek renkleri (28 Ekim), tüyler diken diken (30 Ekim), hız ve yakıt (1 Kasım), bütün altın bir küpte, balık yağı (Efsane mi #2), sınav uykusu, yağmur kokusu, falso, kuşlar ve kadınlar, Tavşanlı Höyük pati izi (tek kaynak, teyit bekliyor). Her birinde kanca cümlesi, seri, son tarih ve kaynak var.
- Kanca planı (26 Ekim 2026): `video/kisa/kanca-plani-2026-10-26.md`. Kanal verisinden çıkan 5 kanca kuralı ve takvime oturan 5 short: havai fişek (28 Ekim), tüyler diken diken (30 Ekim), benzin zammı ve hız (1 Kasım), bütün altın tek küpte (2 Kasım, stadyum motoruyla), balık yağı (Efsane mi #2, 4 Kasım). Her birinde ilk kare, ekran yazısı, kanca, yedek kancalar, akış, döngü ve tek çağrı var.
- Shorts serileri: 10 fikir `video/kisa/shorts-serileri.md` dosyasında. Kullanıcı birini seçince ilk bölümün metnini yaz; kayıt gelince dikey (1080×1920) olarak üret.

**Yanıtsız kalan eski istek:** "Instagram hikâyesi kısmını ortadan çıkaralım, kampanya için yazı stili ve boyut önerileri verelim." Böyle bir içerik bulunamadı. Kullanıcı tekrar sorarsa hangi metni kastettiğini sor.

Yeni bir iş bitince bu bölümü ve `references/kanal-ve-seriler.md` dosyasını güncelle. Ardından `bash video/araclar/skill-paketle.sh` ile taşınabilir paketi (`video/skill-paketi/`) yenile ve commit et. Kullanıcı bu paketi başka sohbetlere taşıyor.
