# Seslendirme: ElevenLabs metni, kaydı bölme, doğrulama, sesi ekleme

İçindekiler:
1. ElevenLabs'e gidecek metin
2. Kayıt geldiğinde
3. Bölme hattı nasıl çalışır?
4. Raporu okumak ve elle düzeltmek
5. Filme oturtmak ve miks
6. Kısmi kayıt ve yeniden kayıt

## 1. ElevenLabs'e gidecek metin

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

## 2. Kayıt geldiğinde (repo gerekir)

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

## 3. Bölme hattı nasıl çalışır?

- **Hizalama.** Senaryo sözcükleri ile Whisper sözcükleri, normalleştirilip (Türkçe küçük harf, kesme işareti ve noktalama atılmış) Needleman–Wunsch yöntemiyle eşlenir. Eşleşmede Levenshtein benzerliği kullanılır, bu yüzden Whisper'ın yanlış yazdığı sözcükler de eşleşebilir. Her satırın ilk ve son eşleşen sözcüğü bulunur.
- **Kesim noktası.** İki satır arasındaki sessizlikler 10 ms'lik RMS zarfıyla aranır ve kesim en uzun sessizliğin içinden yapılır. `[pause]` bu sessizliği zaten uzun yapar.
- **`marks.json`.** Her satır için öbeklerin (noktalama ile ayrılan parçaların) satır içindeki başlangıç saniyeleri yazılır, örneğin `{"a-cut":[0,1.54,2.76,…]}`. `narrate.mjs` bunları `voice.js`'e taşır. Film görselleri `cue(id,k)` ile bu anlara bağlar. `dub.mjs` de sesi bu anlara göre yerleştirir.
- **İşleme yok.** Gürültü azaltma, EQ ve sıkıştırma kullanıcının sesini bozdu; kullanıcı ham sesi istedi.

## 4. Raporu okumak ve elle düzeltmek

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

## 5. Filme oturtmak ve miks

```bash
node video/narrate.mjs <bolum> --engine files:$PWD/video/seslendirme/<KayitKlasoru>
```

- `narrate.mjs` satırları sürelerine göre yerleştirir, gerekirse vuruşları uzatır ya da dondurur ve `voice.js`'i yazar. Film bir satır bitmeden ilerlemez.
- **İkinci çalıştırma.** Tabağındaki Bilim'in `film.js`'i sahne sürelerini kayıttaki satır sürelerinden alır (`recorded[id]`). İlk çalıştırmada film değişir ve `voice.js` bayatlar, bu yüzden bir kez daha çalıştır. Bilişim bölümlerinde bir kez yeterlidir.
- **Bayatlık kontrolü.** `altyazi.cjs` ya da `bolumler.cjs` "taze değil" diyorsa yeniden çalıştır. `render.mjs` bayat `voice.js` ile durur.
- **Seslendirme miksi.** `render.mjs <bolum> --anlatimsiz` ile görüntü sessiz (yalnız müzik ve efekt) dökülür. Ardından `dub.mjs <bolum> --kayit <klasör>` ile insan sesi eklenir. Görüntü akışı kopyalanır, yalnız ses yeniden karışır. Kayıttaki duraklar görüntünün bağlı olduğu öbeklere hizalanır; sığmayan satırda önce duraklar kısalır, gerekirse satır hafifçe hızlanır.
- **Seçenekler:** `--video a.mp4,b.mp4` (farklı kaynak video), `--atla id1,id2` (o satırların kaydını kullanma), `--gain 1.25`.
- **Ses düzeyi.** `ffmpeg -i X.mp4 -af loudnorm=print_format=summary -f null -` ile ölç. Hedef yaklaşık -15 LUFS ve -1 dBTP'nin altı.

## 6. Kısmi kayıt ve yeniden kayıt

- **Tek satır değiştiyse.** Satırın kimliğini değiştir. Kullanıcıdan yalnız o satırı üretmesini iste, dosyayı `<yeni-id>.mp3` olarak kayıt klasörüne koy ve `marks.json`'a öbek başlarını ekle (ya da tahmine bırak). Sonra narrate, render ve dub adımlarını uygula.
- **Bütün bölüm yeniden seslendirilirse** yeni bir kayıt klasörü aç (ör. `TasaKazinan`). Eski klasör kalabilir.
- **Eski kayıtla dökülmüş bir video kullanıcıda varsa** ona ayrı bir ad ver (ör. `ch02-…-eski-kayit-paylasim.mp4`), böylece karışmaz.
