# YUP Akademi · Shorts ses rehberi

Kanalın kısa videolarında kullanılacak sesler: kanca sesleri, geçişler, vurgular, ortam sesleri ve müzik yatağı.
Bu rehberin amacı iki şey:
- **İzleyiciyi tutmak:** Sesli başlayan, anlatımı net duyulan, ritmi olan bir video kaydırılmaz.
- **İyi bir seyir zevki vermek:** Sesler konuya oturur, kanalı tanıtır ve yormaz.

Bütün sesler kodla sentezlenir (`video/shared/synth.js`, `video/yup-marka/ses.js`). Hiçbir ses dosyası ya da hazır müzik kullanılmaz. Bunun iki faydası var:
- **Telif riski yok:** Content ID itirazı gelmez.
- **Tutarlılık:** Her video aynı ses ailesinden konuşur.

Dinlemek için:
- `video/ses/ses-katalogu.mp3`: bütün efektler sırayla; zamanları `ses-katalogu.txt` dosyasında.
- `video/ses/kit/`: her ses ayrı dosya, müzik yatakları `07-muzik-*.mp3`.
- Önce/sonra karşılaştırması: `video/out/kisa-ampul-youtube-eski-ses.mp4` ile `kisa-ampul-youtube-yeni-ses.mp4`.

---

## 1 · Araştırmadan çıkanlar

| Bulgu | Kaynak | Bizim için anlamı |
|---|---|---|
| TikTok kullanıcılarının %88'i sesin deneyimin "vazgeçilmez" parçası olduğunu söylüyor; %73'ü sesli reklamda "durup bakacağını" söylüyor. | Kantar, TikTok için, Ocak 2021 ([TikTok Business](https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok)). Not: platformun ısmarladığı bir anket, ölçüm değil. | Dikey kısa videolar sesli izleniyor. Ses görüntü kadar önemli. İlk an sessiz olmamalı. |
| Ses logoları (sonic logo) markayı hatırlatmada görsel logolardan güçlü bulunuyor. Ipsos'un 2.000'i aşkın reklamlık taramasında görsel marka ögesi reklamların ~%92'sinde, ses ögesi %10'undan azında vardı. | [Yahoo Finance özetiyle Ipsos](https://finance.yahoo.com/sectors/technology/articles/sonic-branding-most-underused-asset-104500993.html), [YouGov](https://yougov.com/articles/40973-invest-sonic-branding-boost-consumer-recall-and-re). Dikkat: "8,5 kat" gibi çarpanlar ikincil kaynaklarda farklı veriliyor; bir akademik çalışma etkiyi bulamadı ([Missouri](https://mospace.umsystem.edu/items/3ef128aa-1dc9-4777-b69a-17bd1b1607bb)). | Kanalın kendi kısa ses imzası olsun ve her videoda aynı yerde çalsın: "Lup motifi". Rakiplerin çoğunda yok; ucuz ve ayırt edici. |
| Konuşma ağırlıklı içerikte müzik, sesin en az 20 dB altında olmalı. 6 dB'lik fark, ses açıldığında anlatımı anlaşılmaz yapıyor. Öğretici videolarda 18–25 dB fark öneriliyor. | [WCAG 1.4.7](https://wcag.dock.codes/documentation/wcag147), [Wistia](https://wistia.com/blog/background-music-volume), [ShortsFast](https://shortsfast.com/blog/mix-background-music-under-narration-without-masking-speech/) | Müzik konuşma sırasında ~20 dB alçağa iner (otomatik "ducking"). Anlatım her zaman önde. |
| YouTube sesi yaklaşık −14 LUFS'e çeker; daha yüksek videoyu kısar, alçağını çoğunlukla yükseltmez. | [Production Advice](https://productionadvice.co.uk/youtube-loudness/), [MeterPlugs](https://meterplugs.com/blog/2019/09/18/youtube-changes-loudness-reference-to-14-lufs.html). Not: YouTube bunu resmî olarak yayımlamıyor. | Her video −14 LUFS'e ayarlanır (`yayin.sh`). Böylece kanal bütün shortlarda aynı yükseklikte çalar. |
| Kanal verisi: "Islak saç" short'unda izleyicilerin %65'i ilk anlarda kaydırdı. | YouTube Studio, Ekim 2026 | İlk saniyede görüntüyle birlikte bir ses olayı olmalı (kanca sesi). |

**Çıkan ilke:** Ses üç işi yapar.
1. **İlk saniyede dikkat ister.**
2. **Anlatımı taşır:** Müzik ritim verir ama hiç öne geçmez.
3. **Önemli anı işaretler:** Vurgu, sessizlik, imza.

Gereksiz efekt yağmuru izleyiciyi yorar. Her ses bir şeyi anlatmalı.

---

## 2 · Kanalın ses kimliği

- **Lup motifi:** La5 – Re6 – Fa#6, yükselen majör üçlü (marimba), önünde cam tıngısı ve mercek hışırtısı. Anlamı "merak çözüldü". İki yerde çalar:
  - **Açılışta kısa hâli:** Mercek açılırken tıngı ve hışırtı.
  - **Kapanışta tam hâli:** Logo ve "Lup'la bak." ekrandayken. Böylece izleyici sesi kanalla eşleştirir.
- **Temel tınılar:** cam (çan), pirinç ve tahta (marimba, celesta), kâğıt (sayfa, bant, kalem). Kanalın el yapımı, defterli görsel diliyle aynı aile.
- **Ruh (müzik yatağı):** Her videonun tek bir ruhu olur. Video boyunca değişmez; tutarlılık seyir zevki verir.

| Ruh | Tını ve tempo | Ton | Hangi içerik |
|---|---|---|---|
| `merak` (varsayılan) | marimba arpeji, yumuşak bas ve davul, shaker · 100 BPM | Re majör | Vücudun Gizli Ayarları, gündelik bilim, açıklama |
| `gizem` | celesta, uzun bas, uğultu, saat tiki · 84 BPM | La minör | Uzak Plan (uzay), Gözünü Kandırayım, sırlar, gece |
| `sicak` | piyano kırık akorları, davul yok · 76 BPM | Fa majör | Tabağındaki Bilim, duygusal anlar, anılar, kokular |
| `komik` | pizzicato, fagot gibi yürüyen bas, şıklatma · 116 BPM | Do majör | Efsane mi Gerçek mi (ters köşe), mizahi konular |
| `enerjik` | marimba, düz dörtlük davul, şıklatma · 120 BPM | Mi minör | Bir Sayı Bir Şok, rekorlar, hız, spor |

---

## 3 · Bir short'un ses haritası (30–55 sn)

| An | Ne çalar | Neden |
|---|---|---|
| 0,0–1,0 sn · kanca | **Kanca sesi** görüntüyle aynı karede: `mercek` (Mercek Açılışı), `darbe` (şok bilgi, sayı), `gizem`, `komik`, `imza` | Sessiz başlayan video kaydırılır. İlk kare ve ilk ses birlikte "dur" der. |
| 0–1 sn · müzik girişi | Müzik 0,8 sn'de yükselir, ilk cümlenin altına iner | Ritim baştan kurulur; ses boşluğu kalmaz. |
| Anlatım boyunca | Müzik sesin ~20 dB altında; satır aralarında da kısık kalır | Anlatım her zaman net. |
| Sözcüğe oturan vurgular | 2–4 sn'de bir, yalnız ekranda bir şey olunca: `pop` (bir şey belirince), `damga`, `yazi`, `kalem`, `sayi` (sayı çıkınca), `aha` (çözüm), `dogru`/`yanlis` | Görüntü ile ses birlikte çarpınca bilgi akılda kalır. Anlamsız efekt yorar. |
| Sahne geçişleri | `mercek` (varsayılan), `kesme` (aynı mekânda), `sayfa`, `zoom`, `karanlik` | İzleyici sahnenin değiştiğini kulağıyla da anlar; ritim bozulmaz. |
| Doruk (deney, şaşırtıcı bilgi) | **Sessizlik:** müzik susar (`sus`), yalnız tek ses kalır (saat tiki, kalp) | Ani sessizlik en güçlü vurgudur; izleyici ekrana bakar. |
| Kapanış | Alçak darbe + **tam imza** (logo ile), "abone ol"a basınca tık ve parıltı | Marka hatırlatma ve tamamlanmışlık hissi. |
| Ortam (isteğe bağlı) | Çok alçak oda, gece, yağmur, mutfak, laboratuvar, uzay sesi | Resimli arka plan "yaşar", sessizlik ölü durmaz. |

**Yapma listesi**
- **Telifli müzik ya da trend ses koyma.** Content ID ve gelir sorunu çıkar. Trend sesi denemek istersen YouTube'un kendi Shorts ses kütüphanesinden, yüklerken ekle.
- **Müziği anlatımın üstüne çıkarma.** Telefon hoparlöründe ilk kaybolan şey anlatım olur.
- **Aynı vurguyu art arda üç kez çalma.** Değiştir ya da sustur.
- **Ani ve yüksek ses koyma.** Kulaklıkla izleyeni rahatsız eder; tepe −1 dBTP.
- **Ruhu video ortasında değiştirme.** Gerekirse yalnız sus.

---

## 4 · Seviyeler (ölçülerek ayarlandı)

| Katman | Düzey | Not |
|---|---|---|
| Seslendirme (ham) | −21 LUFS | ElevenLabs kaydı × 1,25 kazanç |
| Müzik yatağı (tek başına) | ~−31 LUFS | Sesten ~10 dB alçak; her ruh aynı yükseklikte (`lv`) |
| Müzik, konuşma sırasında | ~−41 LUFS | Ducking (×0,3) ile sesten ~20 dB alçak |
| Ortam sesleri | ~−39 LUFS | Hemen hemen bilinçaltı |
| Vurgu ve geçişler | Kısa tepeler; ducking altında | Anlatımı bölmez |
| Son miks | **−14 LUFS, tepe ≤ −1 dBTP** | `bash video/araclar/yayin.sh <bolum>` |

Hepsini birlikte kısmak ya da açmak için `YupSes.LV` kullanılır (`muzik`, `vurgu`, `ortam`).

---

## 5 · Kütüphane

**Kanca** · `YupSes.kanca(m, t, tür)`
- `mercek`: Mercek Açılışı'na oturur. Tok vuruş, cam tıngısı, mercek hışırtısı, parıltı.
- `darbe`: Şok bilgi ve sayılar. Alçak darbe ve parlak tıngı.
- `gizem`: Uzay ve sır. Derin uğultu, uzun yankılı iki çan.
- `komik`: Ters köşe. "Boing" ve pop.
- `imza`: Lup motifinin tamamı.

**Geçiş** · `YupSes.gecis(m, t, tür)`: `mercek`, `kesme`, `sayfa`, `zoom`, `karanlik`.

**Vurgu** · `YupSes.vurgu(m, t, tür)`

| Tür | Ne zaman |
|---|---|
| `pop` | Ekranda bir şey belirince |
| `tik` | Küçük ayrıntı, imleç |
| `damga` | Lastik damga, kesin hüküm |
| `bant` | Bant yapıştırma, yırtma |
| `yazi` | Daktilo, yazı belirmesi |
| `kalem` | Keçeli kalemle çizgi, fosforlu kalem |
| `kagit` | Kâğıt, kart |
| `dogru` | Doğru cevap, onay |
| `yanlis` | Yanlış, efsane çürüdü |
| `sayi` | Sayı ya da istatistik ekrana gelince |
| `aha` | Çözüm, "işte bu yüzden" |
| `soru` | Merak, bilmece |
| `sihir` | Dönüşüm, parıltı |
| `boing` | Komik |
| `kalp` | Kalp atışı, gerilim |
| `saat` | Zaman, bekleme |
| `zzz` | Uyku, yorgunluk, sersemlik |
| `yukselis` | Doruğa hazırlık |

**Ortam** · `YupSes.ortam(m, t, süre, tür)`: `oda`, `gece`, `yagmur`, `mutfak`, `lab`, `uzay`, `mac` (uzak tribün), `kis` (hafif rüzgâr, uzak kuşlar).

**Özel sesler** (synth.js, doğrudan `m.` ile): `m.purr(t, süre, { gain })` kedi mırıltısı (saniyede ~25 titreşim, nefes ritminde); `m.kibble(t, { gain, n })` kaba dökülen mama taneleri; `m.whoosh` ile alçak frekanslı (260→1300 Hz) yumuşak bir hışırtı nefes sesi olarak kullanılır.

**Müzik** · `YupSes.muzik(m, a, b, { ruh, bpm, gain, sus: [[t0, t1]] })`

**Kapanış** · `YupSes.kapanis(m, sahneBaşı, basmaAnı)`

---

## 6 · Kullanım (yeni bir short'ta)

1. `index.html`'de `../shared/synth.js`'ten sonra `<script src="../yup-marka/ses.js"></script>` ekle.
2. `YupKisa.short({...})` içine `ses` ver:
   ```js
   ses: {
     muzik: 'merak',                       // ya da { ruh: 'gizem', bpm: 80 }
     kanca: 'mercek',                      // darbe | gizem | komik | imza | null
     sus: ['a-dene'],                      // müziğin sustuğu sahneler (doruk, deney)
     ortam: { 'a-hook': 'oda' },           // sahne başına ortam sesi
     gecisler: { 'a-bak': null },          // tek tek geçiş türü (null: sessiz)
   },
   ```
   `ses` verilince eski akor yatağı (`chords`) ve eski kapanış sesleri yerine bunlar çalar. Eski videolar etkilenmez.
3. Sahneye özgü vurguları `score(m, hz, api)` içinde sözcük zamanına koy: `YupSes.vurgu(m, W(api, id, 4), 'pop')`.
4. Render → `node video/dub.mjs <bolum> --kayit ...` → `bash video/araclar/yayin.sh <bolum>`.

Örnek: `video/kisa-ampul/film.js`. Merak müziği var; deney ve gri Lup sahnelerinde müzik susuyor; hook ve gözkapağı sahnesinde oda sesi çalıyor.

---

## 7 · Ses kitini yeniden üretmek

`node video/araclar/ses-kiti.mjs` komutu şunları üretir:
- `video/ses/kit/*.mp3`
- `video/ses/ses-katalogu.mp3` ve zaman listesi `ses-katalogu.txt`
- `kit/olcum.json` (müzik ve ortamların ham LUFS ölçümü)

Bir sesi değiştirince kiti yeniden üret ve ölçümlere bak. Müzik ruhları −35 LUFS ham düzeyinde kalmalı (`lv` katsayısı).
