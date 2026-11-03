AnneKolay'ın Instagram'ı, iki anne arkadaşın birlikte tuttuğu bir **Anne Defteri** gibi görünür ve konuşur. Her gönderi o defterden bir sayfadır: dergi tipografisi, kâğıttan kesilmiş karakterler, bantlar, polaroidler, el yazısı notlar. Bu sayfa görsel ve yazılı kuralların tamamıdır. Maskotlar, üretim akışı, ChatGPT görsel promptları, metin asistanı ve 30 günlük takvim aşağıdaki bölümlerdedir.

## Konsept: Anne Defteri

- Hesap bir mağaza vitrini değil, bir defterdir. Her gönderi "sayfa", her seri "bölüm" gibi davranır. Üst köşede her zaman seri adı (`folio`), altta `annekolay` imzası ve sayfa numarası bulunur.
- Hikâyeyi iki maskot taşır: **Ada** (hamile, 20. haftadan başlar) ve **Defne** (yeni anne, bebeği **Pamuk** 2 aylık). Zaman gerçek takvimle ilerler: Ada her hafta bir hafta büyür, Pamuk her ay bir ay büyür.
- Görseller yalnızca yapay zekâ ve grafikle üretilir. Gerçek insan yüzü ya da yapay zekâyla üretilmiş gerçekçi bebek yüzü kullanılmaz; insanlar her zaman kâğıt kesik karakterdir.
- Kitle %50 hamile, %50 yeni anne (0-12 ay). Her gönderinin sağ üstündeki segment etiketi kime seslendiğini söyler: `Hamilelik`, `Yeni Anne` ya da iki maskotun birlikte olduğu `Ada & Defne`.

## Renk

Her gönderi üç katmandan oluşur: %60 zemin (`krem`, `keten`), %30 segment rengi, %10 metin ve vurgu (`toprak`, `bronz`). Segment rengi gönderinin kime ait olduğunu ızgarada tek bakışta söyler.

- **Hamilelik (Ada):** zemin ya da büyük kâğıt parçası `adacayi-acik`, figür ve vurgu `adacayi`, bu tonların üzerindeki her yazı `adacayi-derin`.
- **Yeni anne (Defne, Pamuk):** zemin `seftali`, büyük kâğıt parçası `kiremit` ya da `kil-derin`, bu tonların üzerindeki her yazı `kil-derin`. `kil-derin` zemin üzerinde yazı `krem` olur.
- **Ortak, topluluk ve marka:** `keten` ya da `krem` zemin, yazı `toprak`, segment etiketi `toprak` zeminli.
- **Gece Notları:** zemin `gece`, yazı `krem`, vurgu `seftali`. Izgarada ritim kırıcıdır; haftada en fazla bir kez kullanılır.
- `altin` yalnızca yıldız, bant ve alt çizgi gibi küçük süslerde kullanılır; yazı rengi olarak asla kullanılmaz (krem üzerinde 2:1, okunmaz).
- `adacayi` ve `kiremit` üzerine küçük yazı yazılmaz (krem yazıyla kontrast 2,8:1 ve 3,2:1). Bu tonlar yalnızca figür, bant ve büyük şekil içindir.
- `bronz` yalnızca `krem` zemin üzerinde metin olabilir (4,5:1); `keten` üzerinde sadece 24 px ve üstü başlık ya da ikon olur.

Test edilmiş metin eşleri: `toprak` / `krem` 8,7:1 · `toprak` / `keten` 7,4:1 · `adacayi-derin` / `adacayi-acik` 5,3:1 · `kil-derin` / `seftali` 4,8:1 · `krem` / `kil-derin` 6,4:1 · `krem` / `gece` 13,4:1 · `seftali` / `gece` 10,1:1.

## Tipografi

Üç yazı tipi, üç rol. Üçü de ücretsizdir (Google Fonts, Canva'da hazır) ve Türkçe karakterleri (ğ, ş, ı, İ, ç, ö, ü) tam destekler.

- **Cormorant Garamond** (`display`): başlıklar, büyük hafta numaraları, alıntılar. Duyguyu taşıyan tek kelime *italik* yazılır: "Bu defteri *birlikte* yazacağız." Bir başlıkta en fazla bir italik vurgu olur.
- **Poppins** (`body`): gövde metni, etiketler, sayfa numaraları. Etiketler BÜYÜK HARF, `label` stilinde, harf aralığı geniştir.
- **Caveat** (`hand`): el yazısı notlar, polaroid altyazıları, imzalar ("— Defne, 03.12"). Bir gönderide en fazla iki el yazısı not bulunur ve bunlar 8 kelimeyi geçmez.
- 1080 px genişlikte ölçek: `mega` 320-400 px (hafta numarası), `display-xl` 116-150 px (kapak başlığı), `display-l` 84-100 px (iç sayfa başlığı), `hand-l` 56-72 px, `body` 34 px, `label` 22-24 px. Gövde metni 30 px'in altına inmez; telefonda okunmaz.
- Bir carousel sayfasında en fazla 35 kelime gövde metni olur. Kapakta gövde metni olmaz; yalnızca başlık, bir el yazısı not ve "Kaydır →" çağrısı bulunur.

## Kolaj dili

Her şey kâğıttan kesilmiş gibi görünür. Bileşenler (Kolaj öğeleri grubu):

- **Yırtık kâğıt** (`YirtikKagit`): metin panelleri ve büyük renk alanları. Yırtık kenar yalnızca bir ya da iki tarafta olur; dört tarafı yırtık kâğıt yalnızca soru kartında kullanılır. Gölge `paper` gölgesidir.
- **Polaroid** (`Polaroid`): karakterleri "fotoğraf" gibi sunar. Her zaman 3-6° eğik durur, alt boşluğunda Caveat altyazı vardır, üstünden bir bantla tutturulur.
- **Bant** (`Bant`): her polaroid ve not kâğıdı en az bir bantla tutturulur. Bant rengi segment rengidir: hamilelik için `adacayi` çizgili, yeni anne için `seftali` çizgili, ortak içerikte `altin` ya da `krem`.
- **Çizgili not kâğıdı**: duygusal notlar ve ipuçları. Caveat satırları çizgilerin üstüne oturur (satır yüksekliği 71 px).
- **Damga** (`Damga`): "UZMAN KONTROLLÜ" damgası yalnızca uzman onayından geçmiş gönderilere basılır. Renk segment rengidir (`adacayi-derin` ya da `kil-derin`).
- **El çizimi ok**: el yazısı notu görsele bağlar. Gönderi başına en fazla bir ok.
- **Kâğıt objeler**: ay, çay fincanı, hastane çantası, zeytin dalı, kalp. Hepsi maskotlarla aynı kâğıt kesik stilindedir.
- Fotoğraf gerçekçiliği, 3D, parlak gradyan, neon, emoji çıkartması ve hazır Canva süsleri kullanılmaz.

## Formatlar ve güvenli alanlar

- **Gönderi / carousel:** 1080 × 1350 (4:5). Profil ızgarası 3:4 kırptığı için önemli her şey kenarlardan en az 80 px içeride durur.
- **Reels kapağı:** 1080 × 1920. Başlık ve karakter ortadaki 1080 × 1440 alanda kalır (üstten ve alttan 240 px), çünkü ızgarada yalnızca bu kısım görünür.
- **Story:** 1080 × 1920. Üst 250 px ve alt 340 px'e yazı konmaz (Instagram arayüzü kapatır).
- **Öne çıkan kapakları:** 1080 × 1080 düz renk zemin, ortada tek bir kâğıt kesik ikon; yazı yok (başlığı Instagram yazar).
- Kenar boşluğu her formatta 80 px'tir. Folio üstten 64 px, imza alttan 56 px.

## Seriler

| Seri | Segment | Format | Gün | Sütun |
|---|---|---|---|---|
| Uzman Masası | sırayla hamile ve yeni anne | Carousel | Pazartesi | Eğitim |
| Kimse Söylemedi | sırayla hamile ve yeni anne | Reels | Salı | Eğitim |
| Ada Sorar, Defne Anlatır | Ada & Defne | Reels | Çarşamba | Duygusal / Eğitim |
| Hafta Hafta Ada | Hamilelik | Carousel | Perşembe | Eğitim |
| Pamuk Bu Hafta / Pamuk Bu Ay | Yeni anne | Reels | Cuma | Eğitim |
| Mini Test / Anne Sözlüğü / Sizden Gelenler | Ada & Defne | Reels | Cumartesi | Eğlence / Topluluk |
| Gece Notları · Ada'nın Günlüğü | sırayla yeni anne ve hamile | Tek görsel | Pazar | Duygusal |

## Ses tonu

AnneKolay konuşurken sakin, sıcak ve bilgilidir. Bir arkadaş gibi konuşur, öğretmen gibi değil. "Sen" diye hitap eder, marka "biz" der.

- **Kullan:** birlikte, yanındayız, sakin, kolay, özen, güven, gelişim, "çok normal", "yalnız değilsin".
- **Kullanma:** en iyi anne, kusursuz anne, mecbursun, kesin çözüm, mucize, "asla", "hemen yapmalısın", korkutan istatistikler.
- Başlık kanca gibi yazılır ama abartmaz. Doğru örnek: "Hamilelikte kimsenin söylemediği 5 şey". Yanlış örnek: "BUNU BİLMEYEN ANNE KALMASIN!!!"
- Annelere ne kadar güçlü olduklarını hatırlat; eksiklerini söyleme. "Yorgunum. Ve onu deli gibi seviyorum. İkisi aynı anda doğru."
- Emoji yalnızca açıklama metninde ve en fazla üç tane kullanılır (🤍 🌿 🤰 👶 🌙). Tasarımın içine emoji konmaz.
- Sayılar tasarımda rakamla, seslendirme metninde yazıyla yazılır ("38°C", seslendirmede "otuz sekiz derece").

## Sağlık içeriği

- Sağlık bilgisi içeren her gönderi yayından önce uzmana gider. `Damga` yalnızca onaydan sonra basılır.
- Teşhis konmaz, ilaç ya da doz önerilmez, "doktoruna danış" cümlesi atlanmaz.
- Her bilgi gönderisinde "ne zaman doktora" uyarısı olur. Uyarı korkutmaz, sakin ve net yazılır.
- Kaynak gösterilecekse Sağlık Bakanlığı, WHO, ACOG ya da AAP tercih edilir.
- Açıklama metninin sonunda her zaman şu not bulunur: "Bu içerik bilgilendirme amaçlıdır; tıbbi tavsiyenin yerini tutmaz."

## Yapmayın

- Gerçek ya da gerçekçi insan/bebek yüzü kullanmayın; insanlar her zaman Ada, Defne, Pamuk ya da yüzsüz eller ve siluetlerdir.
- Türkçe yazıyı yapay zekâya görselin içine yazdırmayın; harf hatası yapar. Yazı her zaman Canva'da ya da şablonda eklenir.
- Aynı segment rengini ızgarada üç gönderi arka arkaya kullanmayın.
- Satış dili kullanmayın. Şirket kurulana kadar ürün tanıtımı yok; "Birlikte kuruyoruz" içerikleri yalnızca topluluğa soru sorar.
- Doğum, emzirme ve beden konularını çıplaklık ya da grafik ayrıntı olmadan, şefkatle anlatın.
