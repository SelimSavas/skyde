# Kanal, seriler ve durum

## Kanal kimliği
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

## Seri 1 · Bilişim Teknolojileri Yetkinliği
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

**Markalı ilk short:** `kisa-kis-saati/` (Uykunun Bilimi kısa: "Saatler geri alınmıyor: vücudun buna ne diyor?"). Yeni marka diliyle, dikey, sonda logo ve abone çağrısı var. 0:58, insan sesiyle bitti (kayıt `seslendirme/KisSaati`, paket `youtube.txt`, 25 Ekim'den önce yayınlanmalı). Yeni markalı short'lar bu klasör kopyalanarak yapılır.

**Ortak marka motoru:** `video/yup-marka/kisa.js` (`YupKisa.short(def)`). Zemin, seri etiketi, daire açılışlı geçişler, isteğe bağlı yorum çağrısı kartı, logo ve abone kapanışı ile kapanış seslerini verir. Yeni markalı short'ta yalnız `narration.js` ve sahne çizimleri (`def.draw`) yazılır. Örnek: `kisa-islak-sac/film.js`. (`kisa-kis-saati` bu modülden önce yazıldı, kendi kopyasını taşır.)

**Efsane mi, Gerçek mi? #1:** `kisa-islak-sac/`, "Islak saçla dışarı çıkarsan hasta olur musun?" Hüküm ŞÜPHELİ. Yorum çağrısı iki yerde: başta oy ("Sence efsane mi, gerçek mi? Cevabı görmeden yorumlara yaz"), sonda "Sıradaki efsaneyi sen seç". Kayıt bekliyor (kayıt klasörü `IslakSac`). Oynatma listesi "Efsane mi, Gerçek mi? | YUP Akademi".

**Yeni Shorts serileri (2026-10-23, fikir aşaması):** `video/kisa/shorts-serileri.md` dosyasında 10 seri var. Her birinin kalıbı, görseli, ilk üç konusu ve uzun seriye köprüsü yazılı. Seriler: Efsane mi Gerçek mi?, Gözünü Kandırayım, Bir Sayı Bir Şok, Cebindeki Bilim, Ustanın Bilmecesi, Kelimenin Yolculuğu, Kazara Bulundu, Gece Bir Buçuk, Tek Lokma Bilim, Vücudun Gizli Ayarları. Önerilen başlangıç üçlüsü: Gözünü Kandırayım, Efsane mi Gerçek mi?, Ustanın Bilmecesi. Kullanıcı henüz seçmedi.

Udemy: tanıtım videosu (`tanitim/`, 1:54) insan sesi bekliyor. Sayfa metinleri ve kurs görseli `udemy/` klasöründe.

## Seri 2 · Tabağındaki Bilim (YUP Akademi)
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

## Seri 3 · Uykunun Bilimi (YUP Akademi)
- **#1:** "Telefon Işığı Uykunu Nasıl Bozuyor? Bu Akşam Deneyebileceğin 7 Basit Şey | Uykunun Bilimi #1". Klasör `yup-mavi-isik/`, süre 10:39, kayıt klasörü `seslendirme/MaviIsik`. Kapaklar: `youtube/kapak-A.png` ve `kapak-B.png`.
- **Görsel dil:** gece sahneleri, düz vektör, derin lacivert ve soğuk mavi ekran ışığına karşı sıcak altın.
- **Oynatma listesi:** "Uykunun Bilimi | YUP Akademi". Açıklamanın ilk hashtag'i `#UykununBilimi`.
- **Yapı:** Tabağındaki Bilim'e benzer: soğuk açılış ("Gece saat bir buçuk…"), mekanizma, deneyler ve kaynaklar, "bu akşam" önerileri.
