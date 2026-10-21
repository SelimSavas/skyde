# Gemini promptları (görsel, animasyon parçası, Veo, kapak)

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

## 1. Genel kurallar

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

## 2. Tabağındaki Bilim karakteri ve stil

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

## 3. Animasyona hazır parçalar (kalıplar)

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

## 4. Veo hareket promptları (Gemini video)

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

## 5. Kapak (thumbnail) kalıpları

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

## 6. Türkçe yazı bozulursa

1. Aynı sohbette şunu yaz: `Fix the text only, keep everything else exactly the same. The headline must read exactly: <SATIR 1> / <SATIR 2>`
2. Yine olmazsa prompta "No text at all" ekleyip görseli yazısız üret. Yazıyı ve logoyu Canva'da önceki bölümlerdeki yere ekle.
3. Kapak 2 MB'ı aşarsa JPEG olarak, %85–90 kaliteyle kaydet.
