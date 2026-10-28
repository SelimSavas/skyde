# Lup · ChatGPT görsel promptları ve kanal formatı

Lup, YUP Akademi'nin yaşayan büyüteci. Gündelik konularda bir şeye **yaklaşır** (Yakın Plan), gündelik dışı konularda teleskoba dönüşüp **uzaklaşır** (Uzak Plan). Bu dosya, ChatGPT'de üretilecek bütün görsellerin promptlarını, üretim sırasını ve kısa videoların ortak giriş-kapanış formatını içerir.

---

## 0 · Nasıl kullanılır

1. **Sırayla üret.** Önce **1A**'yı üret. Beğenene kadar yenile; beğendiğini `lup-ana.png` adıyla kaydet. Bu görsel artık "referans"tır.
2. **Her sonraki promptta referansı ekle.** `lup-ana.png` görselini mesaja ekle ve promptu olduğu gibi yapıştır. Promptların başındaki "Use the attached image as the exact character reference…" cümlesi tutarlılığı sağlar.
3. **İki bloğu her promptun sonuna ekle.** Aşağıdaki **LUP** ve **STYLE** blokları. Promptlarda `{LUP}` ve `{STYLE}` yazan yerlere bunları yapıştır.
4. **Arka plan.** Karakter ve parça görsellerinde saydam arka plan iste. ChatGPT saydam veremezse düz **#FF00FF macenta** arka plan iste; macentayı ben temizlerim.
5. **Boyutlar.**
   - Karakter ve parçalar: kare (1024×1024).
   - Arka planlar: dikey (1024×1536).
   - Banner: yatay (1536×1024).
6. **Dosya adları.** Her promptun yanındaki adla kaydet (`lup-2a-govde.png` gibi) ve hepsini toplu yükle. Videoda nereye gittikleri adlarından anlaşılır.
7. **Düzeltme.** Bir ayrıntı tutmazsa yeniden üretme, düzeltme iste: "Keep everything identical to the reference, only change: …".
8. **Yazı istemiyoruz.** Görsellerde yazı olmasın. Türkçe harfler (İ, Ş, Ğ) bozuk çıkıyor; bütün yazıları videoda kodla ekliyorum.

### STYLE bloğu (her promptun sonuna)
```
STYLE: hand-drawn ink illustration for an educational science channel, made to look like the work of a human illustrator, not 3D, not vector-perfect. Slightly wobbly dark espresso-brown ink outlines (#2A1C14) with natural line-weight variation, flat colors printed slightly off-register (color fills shifted 2–3 px from the outlines, like a risograph print), light cross-hatching for shadows, subtle paper grain. Limited palette: teal #0F766E, amber #F2A516, aged brass #C8963E, espresso #2A1C14, cream #F2EADC, soft red #D2452F, muted blue #4A73B8, pale glass blue #DDEBEF. No gradients, no glossy plastic, no glow, no lens flare, no text, no letters, no watermark.
```

### LUP bloğu (karakter geçen her promptun sonuna)
```
LUP: a living magnifying glass, the mascot of a Turkish science channel. A round lens (about 60% of his total height) in a thick aged-brass rim with small engraved tick marks along the rim and one tiny dent at the top right. Behind the glass, magnified, is his face: ONE big round eye (white, warm amber-brown iris, large black pupil) slightly above the center, one thick espresso eyebrow above it, and a small simple ink mouth below it. The glass has a pale blue-cream tint, two short diagonal white glare streaks at the top left and a few faint scratches. Handle: teal leather-wrapped grip with visible stitching and a brass collar where it meets the rim; the handle is his single leg and ends in a small rounded amber rubber cap (his foot). Two thin noodle arms come out of the left and right sides of the rim, ending in small cream mitten-like hands with three fingers and a thumb. A short yellow pencil is tucked behind the rim on the right side. Personality: curious, warm, slightly nerdy, dry sense of humor; an adult character, not babyish. Compact proportions that stay readable at small sizes.
```

---

## 1 · Ana tasarım

**1A · Ana karakter** → `lup-ana.png` (referans görsel olacak)
```
Create the master character design of LUP. Full body, front view, neutral friendly expression with a slightly curious eyebrow, standing upright on his handle-foot, arms relaxed at his sides. Centered with generous margins, nothing else in the image. Square 1024×1024, transparent background.
{LUP}
{STYLE}
```

**1B · Dönüş sayfası (turnaround)** → `lup-1b-donus.png`
```
Use the attached image as the exact character reference: same proportions, colors, line weight and details. Create a character turnaround sheet of LUP in one row, evenly spaced, same height, neutral expression: (1) front, (2) three-quarter view turned left, (3) side profile where the lens is seen almost edge-on as a thick brass ellipse and only a sliver of the eye is visible, (4) three-quarter view turned right, (5) back view where the glass shows only glare and the back of the brass rim. Transparent background.
{LUP}
{STYLE}
```

**1C · Ölçek sayfası** → `lup-1c-olcek.png`
```
Use the attached image as the exact character reference. Show LUP standing on a table next to everyday objects to establish his size: a white coffee mug with a teal stripe (LUP's lens is about the size of the mug's opening), a smartphone lying flat, and a human hand resting on the table. Side-by-side lineup, neutral expressions, plain paper-colored background.
{LUP}
{STYLE}
```

---

## 2 · Animasyon parçaları (kodla oynatılacak)

Bu parçalarla Lup'u kodda iskelete dönüştürüyorum. Göz kırpar, konuşurken ağzı sese uyar, eller pozdan poza geçer. **Merceğin içine konunun büyütülmüş görüntüsünü** koyabilmek için gövde ile yüz ayrı çizilir.

**2A · Gövde (yüzsüz, camsız)** → `lup-2a-govde.png`
```
Use the attached image as the exact character reference. Draw ONLY LUP's body: the brass rim, the teal handle with the brass collar and the amber foot cap, and the pencil tucked behind the rim. NO face, NO glass, NO arms: the inside of the rim must be a clean, fully transparent round hole. Perfectly front-facing and symmetric, centered. Transparent background.
{STYLE}
```

**2B · Göz seti** → `lup-2b-goz.png`
```
Use the attached image as the exact character reference. A sprite sheet of LUP's single eye, in a grid with generous spacing, every item separate on a transparent background: (1) the eye white alone, (2) the iris with pupil alone, (3) the full eye in these lid states: wide open, relaxed half-open, sleepy almost closed, closed (a gentle curved line), happy closed (upside-down U), wide surprised with a small pupil, angry narrowed, sad drooping.
{STYLE}
```

**2C · Kaş seti** → `lup-2c-kas.png`
```
Use the attached image as the exact character reference. A sprite sheet of 8 thick espresso eyebrow shapes for LUP, grid layout, transparent background: neutral, raised, very raised (surprised), angry (inner end down), worried (inner end up), skeptical (one end raised high), focused (flat and low), happy (soft arc).
{STYLE}
```

**2D · Ağız seti (konuşma için)** → `lup-2d-agiz.png`
```
Use the attached image as the exact character reference. A lip-sync mouth sheet for LUP: 13 small, simple ink mouths as seen through his glass, grid layout with labels-free spacing, transparent background. Shapes: rest (closed neutral), M-B-P (pressed lips), A (wide open), E (wide open, corners pulled), I (narrow open), O (round open), U (small pucker), F-V (lower lip under upper teeth), L (open with tongue tip up), big smile, grumpy frown, wavy unsure line, gasp (small round open).
{STYLE}
```

**2E · El seti** → `lup-2e-el.png`
```
Use the attached image as the exact character reference. A sprite sheet of 12 of LUP's small cream mitten hands (three fingers and a thumb, espresso ink outline), each separate on a transparent background: open palm facing viewer, pointing with index finger, thumbs up, fist, waving, counting one, counting two, counting three, holding a short yellow pencil, holding a small wooden rubber-stamp handle, scratching chin (thinking), OK sign.
{STYLE}
```

---

## 3 · İfadeler

**3A · 12 ifade** → `lup-3a-ifadeler.png`
```
Use the attached image as the exact character reference. An expression sheet of LUP, 12 full-body poses in a 4×3 grid, all front-facing, same size, transparent background. Expressions: (1) curious, leaning forward, eye wide; (2) amazed, eyebrow very high, mouth gasping; (3) thinking, hand on chin, eye looking up; (4) laughing, eye happy-closed; (5) dry skeptical, one eyebrow raised, half-lidded eye, tiny smirk; (6) annoyed, angry eyebrow; (7) sad, drooping eye; (8) sleepy, eye almost closed; (9) scared, leaning back; (10) proud, chest out, thumbs up; (11) crying with tears on the inside of the glass; (12) shrugging, "nobody knows yet", worried eyebrow, palms up.
{LUP}
{STYLE}
```

---

## 4 · Hareket ve pozlar

Hareketleri kodda iki pozun arasını yumuşatarak, sıçrama-esneme ve sallanmayla yapıyorum. Bu sayfalar ana pozları verir.

**4A · Giriş zıplaması (4 kare)** → `lup-4a-ziplama.png`
```
Use the attached image as the exact character reference. An animation key-pose strip of LUP hopping into the scene, 4 frames in a row, same scale, transparent background: (1) anticipation: squashed down on his handle, eye squinting with effort; (2) mid-air: stretched tall, arms up, eye wide and happy; (3) landing: squashed wide on his foot, arms out for balance; (4) settle: upright, small wave with one hand, friendly look at the viewer.
{LUP}
{STYLE}
```

**4B · Anlatım pozları** → `lup-4b-anlatim.png`
```
Use the attached image as the exact character reference. 4 key poses of LUP in a row, transparent background: (1) pointing to the left of the frame, looking at the viewer; (2) pointing straight up with an "aha!" eyebrow; (3) leaning far forward to inspect something tiny on the ground, lens tilted down, eye huge; (4) stepping back in surprise, arms up, eye wide.
{LUP}
{STYLE}
```

**4C · Aksiyon pozları** → `lup-4c-aksiyon.png`
```
Use the attached image as the exact character reference. 4 key poses of LUP in a row, transparent background: (1) slamming a small wooden rubber stamp down with both hands; (2) writing on an amber sticky note with his pencil; (3) throwing a white paper plane forward; (4) waving goodbye with a wink.
{LUP}
{STYLE}
```

**4D · Konuya göre kostümler** → `lup-4d-kostum.png`
```
Use the attached image as the exact character reference. 6 variations of LUP in a 3×2 grid, transparent background: (1) wearing a tiny chef's hat on top of his rim, holding a wooden spoon (kitchen science); (2) wearing a striped nightcap, yawning, holding a candle (sleep science); (3) holding a tiny white coffee mug with a teal stripe and a steam swirl, eye half-awake; (4) holding a small soccer ball under one arm; (5) wearing a tiny hard hat and holding a pocket screwdriver next to a little circuit chip (technology); (6) holding an umbrella, raindrops on his glass (weather).
{LUP}
{STYLE}
```

---

## 5 · Teleskop modu (Uzak Plan)

**5A · Dönüşüm (4 kare)** → `lup-5a-donusum.png`
```
Use the attached image as the exact character reference. A 4-frame transformation strip, transparent background: (1) LUP looks up at the sky with a curious eyebrow; (2) he pulls a short brass telescopic tube out of his handle; (3) he clips the brass tube in front of his lens like a telescope extension, the tube has two sliding segments; (4) he stands on a small three-legged brass tripod, tilted up 45 degrees like a telescope, his eye visible through the glass behind the tube, excited expression.
{LUP}
{STYLE}
```

**5B · Teleskop pozları** → `lup-5b-teleskop.png`
```
Use the attached image as the exact character reference, in his telescope mode (brass tube clipped in front of the lens, standing on a small brass tripod). 3 poses in a row on a dark navy paper background with a few hand-drawn stars: (1) looking up at the stars, amazed; (2) pointing at a single bright star; (3) turning to the viewer with a "can you believe this?" skeptical-amused look.
{LUP}
{STYLE}
```

---

## 6 · Geçiş ve efekt katmanları

**6A · Mercek halkası (imza geçiş)** → `lup-6a-mercek-halka.png`
```
A single very large brass magnifying-glass rim seen straight from the front, filling the square image edge to edge, thick ring with engraved tick marks and one tiny dent at the top right, two short glare streaks on the brass. The entire inside of the ring is fully transparent, and the outside is transparent too. No handle, no character, no glass.
{STYLE}
```

**6B · Teleskop görüş maskesi** → `lup-6b-teleskop-maske.png`
```
A telescope eyepiece view mask: solid espresso-black frame with a perfect circular transparent opening in the center (80% of the width), a thin brass inner ring with fine ink tick marks like a reticle, and a few faint scratches on the ring. Square, no text.
{STYLE}
```

**6C · Mürekkep lekesi geçişi (3 kare)** → `lup-6c-murekkep.png`
```
3 frames of an espresso-ink splash spreading from the center of a vertical frame, side by side: (1) small splat with a few droplets, (2) large irregular blob with drips, (3) ink covering almost the whole frame with ragged edges. Transparent background around the ink.
{STYLE}
```

**6D · Parıltı** → `lup-6d-parilti.png`
```
A small set of 4 sparkle sprites for a glass glint: four-pointed stars of different sizes, white fill with a thin amber ink outline, plus one longer diagonal glare streak. Transparent background.
{STYLE}
```

---

## 7 · Arka planlar (dikey 1024×1536)

**7A · Lup'un masası (giriş ve kapanış)** → `lup-7a-masa.png`
```
Top-down view of a wooden desk. An open dotted-grid notebook fills most of the frame; its center area is left empty for content. Around it: a coffee ring stain on the page corner, two pencils, an eraser, amber sticky notes, a brass ruler at the edge, a white mug with a teal stripe partly out of frame. No characters, no text. Vertical 1024×1536.
{STYLE}
```

**7B · Uzak Plan gökyüzü** → `lup-7b-gokyuzu.png`
```
A night sky drawn with ink and white gouache on dark navy paper: hand-drawn stars of different sizes, two faint constellation lines, a thin crescent moon at the top right, subtle paper grain. The center is emptier, left free for content. Vertical 1024×1536.
{STYLE}
```

**7C · Makro dünya (konuya göre)** → `lup-7c-makro-[konu].png`
```
An extreme macro view of [KONU, e.g. the crema foam on top of a coffee] drawn as if it were a landscape seen through a magnifying glass, soft colors from the palette, gentle ink texture, the center left calm for content. Vertical 1024×1536.
{STYLE}
```

**7D · Seri ortamları** → `lup-7d-mutfak.png`, `lup-7d-yatak-odasi.png`
```
(Kitchen) A cozy Turkish home kitchen counter seen slightly from above: a tea glass, a simit on a plate, an onion, a wooden cutting board, morning light; the center left empty for content. Vertical 1024×1536.
(Bedroom) A dim bedroom at night: a bed edge, a phone glowing on the nightstand, an alarm clock showing no numbers, curtains with moonlight; the center left empty. Vertical 1024×1536.
{STYLE}
```

---

## 8 · Yan karakter: Arkadaşın

Konuşmaz; derdi o yaşar, Lup açıklar. "Bu Sensin" videolarının yüzü.

### ARKADAŞIN bloğu (bu bölümdeki promptların sonuna)
```
ARKADAŞIN: a relatable Turkish man in his late twenties, the viewer's friend. Messy dark-brown hair sticking up, light stubble, tired eyes with faint eye bags, a navy hoodie with white drawstrings, often holding a white mug with a teal stripe. An expressive everyman, not a scientist, not a cartoon hero.
```

**8A · Ana tasarım ve dönüş** → `arkadasin-8a.png`
```
Create the master design of ARKADAŞIN as a turnaround sheet: front, three-quarter, side, back, upper body to mid-thigh (feet out of frame), neutral tired expression. Transparent background.
{ARKADAŞIN}
{STYLE}
```

**8B · İfadeler** → `arkadasin-8b-ifadeler.png`
```
Use the attached image as the exact character reference. 8 head-and-shoulders expressions in a 4×2 grid, transparent background: grumpy morning (storm-cloud mood), sleepy, angry, headache (hand on temple), surprised, laughing, guilty smile, happy and awake holding a steaming mug.
{ARKADAŞIN}
{STYLE}
```

**8C · İkisi birlikte** → `ikili-8c.png`
```
Use both attached images as exact character references (LUP and ARKADAŞIN). 3 panels in a row, transparent background: (1) LUP sitting on ARKADAŞIN's shoulder, both looking at the viewer; (2) LUP holding himself up to ARKADAŞIN's tired face, inspecting him through the glass, ARKADAŞIN annoyed; (3) both laughing, ARKADAŞIN raising his coffee mug, LUP giving a thumbs up.
{LUP}
{ARKADAŞIN}
{STYLE}
```

---

## 9 · Marka görselleri

**9A · Profil fotoğrafı** → `lup-9a-profil.png`
```
Use the attached image as the exact character reference. A circular channel avatar: LUP's lens filling most of the circle, his eye looking straight at the viewer with one raised eyebrow and a tiny smirk, solid teal #0F766E background. Bold, simple, readable at 100 px. Square, no text.
{LUP}
{STYLE}
```

**9B · YouTube banner** → `lup-9b-banner.png`
```
Use the attached image as the exact character reference. A wide banner (landscape 1536×1024) on warm paper: LUP on the right third leaning in, looking through his lens at a row of small everyday objects (coffee mug, onion, alarm clock, phone) that turn into planets and stars toward the far right edge. The left and center are calm paper with a few coffee stains, left free for the title. Keep all important elements inside the central horizontal band (the top and bottom 20% get cropped on phones). No text.
{LUP}
{STYLE}
```

**9C · Instagram öne çıkan kapakları (5)** → `lup-9c-one-cikanlar.png`
```
5 round story-highlight icons in a row, each a teal circle with a cream ink drawing in the center: (1) a magnifying glass (Close-up), (2) a small telescope with a star (Far-out), (3) a paper plane (Share), (4) a rubber stamp (Myth or fact), (5) an amber sticky note with a question mark shape drawn as a doodle. No letters.
{STYLE}
```

---

## 10 · Kapak şablonu (Shorts ilk karesi ve Instagram ızgarası)

**10A · Kapak** → `lup-10a-kapak-[konu].png`
```
Use the attached image as the exact character reference. Vertical 1024×1536 thumbnail: LUP large in the lower right third, leaning in with a huge curious eye, inspecting [OBJE, e.g. a cup of coffee] which sits in the lower left; extreme, readable expression. The top half of the image is plain warm paper with a single coffee stain, left free for the title. High contrast, no text.
{LUP}
{STYLE}
```

---

## 11 · Ortak giriş ve kapanış (tüm short'larda)

### Giriş: "Mercek Açılışı" (0,0–1,2 sn)
Kural: **Giriş, kancayı geciktirmez.** Ses 0,1. saniyede başlar; ilk cümle girişin üstünden okunur. Önce logo gösterilmez.

| Zaman | Görüntü | Ses |
|---|---|---|
| 0,00 | Ekranın ortasında Lup'un merceği (halka, `lup-6a`). İçinde kancanın ilk görüntüsü büyütülmüş; dışında Lup'un masası (`lup-7a`) hafif bulanık. Kanca başlığı üstte, ilk karede hazır. | Seslendirme 0,1'de başlar |
| 0,15 | Camın üstünden bir parıltı geçer (`lup-6d`). Lup'un eli halkanın kenarını çevirip netler. | Cam "tıng" (imza ses) |
| 0,45–1,1 | Mercek büyüyerek kadrajı aşar, halka kameranın yanından geçip gider. Artık sahnenin tam içindeyiz. | Hafif "vuuş" |
| 1,1 | Sol üstte seri etiketi: YAKIN PLAN · BU SENSİN gibi. | — |

**Uzak Plan çeşidi: "Teleskop Açılışı".** Mercek yerine teleskop görüş maskesi (`lup-6b`) açılır, içinden uzay görünür. İmza ses aynı, bir oktav pes.

### Sahne geçişleri
Daire açılışın yerine **mercek geçişi**: halka (`lup-6a`) yeni sahneyi taşıyarak büyür. Konuya göre ara sıra mürekkep lekesi (`lup-6c`).

### Lup'un videodaki yeri
- Kancadan sonra köşeden zıplayarak gelir (`lup-4a`), konuşurken ağzı sese uyar, önemli anlarda tepki verir (`lup-3a`).
- İçeriğin önüne geçmez: sol alt ya da sağ alt köşe, yüksekliği ekranın en fazla üçte biri.
- Büyük an: Lup konunun üstüne eğilir ve **merceğinin içinde büyütülmüş görüntü** belirir (kahvedeki kilitler, ekmekteki nişasta).

### Kapanış: "Lup'la bak" (son 2,5 sn)
1. Lup kadraja zıplar.
2. Çağrıya göre bir poz:
   - Bu Sensin: kâğıt uçağı arkadaşa fırlatır (`lup-4c`, 3. poz);
   - Efsane mi: damgayı basar;
   - Uzak Plan: teleskopla göz kırpar.
3. Altta küçük logo, "Lup'la bak." el yazısı ve abone ol düğmesi; Lup düğmeye dokunur.
4. Tek çağrı kuralı değişmez.

### İmza ses
- Giriş: cam "tıng" ve kısa vuuş.
- Kapanış: aynı tıng, iki nota yukarı.
- Bunları sentezleyiciye ekleyeceğim; her videoda aynı kalır, ses logosu olur.

---

## 12 · İlk video: "Merhaba, ben Lup" (tanıtım short'u, ~20 sn)

Kanal profilinde sabitlenecek tanıtım. Seslendirme (`[pause]` aralı):
```
Ben Lup. Bir büyüteçim.
[pause]
Kahvenden ekmeğine, uykundan telefonuna; gündelik hayatındaki her "neden"e yaklaşıyorum.
[pause]
Bazen de ters dönüp teleskop oluyorum: Yıldızlara, Dünya'nın derin geçmişine, akıl almaz sayılara uzaklaşıyoruz.
[pause]
Küçük bir merak, büyük bir keşif. Lup'la bak.
```
Görüntü:
- Masada Lup'un zıplayarak girişi.
- Mercekte sırayla kahve, ekmek ve telefon büyür.
- Teleskop dönüşümü (`lup-5a`) ve gökyüzü.
- Kapanış.

---

## 13 · Lup karakter kartı

- **Ses:** ElevenLabs'teki senin sesin (ivc v4), aynı ayarlar. Sıcak, hafif esprili; asla bağırmaz.
- **Konuşma:** "Sen" diye konuşur, kısa cümle kurar. Bir şeyi düzeltirken "aslında…" der ama küçümsemez. Bilmediğini söyler: "Bilim bunu henüz bilmiyor."
- **İmza sözleri:**
  - "Hadi biraz yaklaşalım." (Yakın Plan)
  - "Şimdi biraz uzaklaşalım." (Uzak Plan)
  - "Lup'la bak." (kapanış)
- **Yapmadıkları:**
  - Sağlık tavsiyesi vermez ("doktoruna sor").
  - Kaynaksız bilgi vermez.
  - Siyasete ve takım tutmaya girmez.
  - Arkadaşın'la alay etmez, onu aklar.
- **Görsel kuralları:**
  - Tek göz, tek kaş.
  - Pirinç halka, teal sap, amber ayak, kulağında kalem.
  - Masa ya da tezgâh üstünde dev gibi durmaz; ölçeği hep "kupa ağzı kadar".
- **Seri haritası:**
  - **Yakın Plan:** Bu Sensin, Tabağındaki Bilim, Uykunun Bilimi, Efsane mi Gerçek mi, Cebindeki Bilim.
  - **Uzak Plan:** Uzay, Derin Zaman, Kazara Bulundu, Bir Sayı Bir Şok.

---

## 14 · Görseller gelince yapacaklarım

1. Macentayı temizleyip parçaları keseceğim.
2. `yup-marka/lup.js` iskeletini kuracağım:
   - göz kırpma, kaş ve göz kapağı durumları;
   - sese uyan ağız (`speaking(t)` ve ünlülere göre ağız şekli);
   - zıplama-esneme, sallanma, el pozları;
   - merceğin içine sahne çizme.
3. "Mercek Açılışı" girişini, mercek geçişini ve "Lup'la bak" kapanışını ortak short motoruna (`kisa.js`) ekleyeceğim. Her yeni short bunları kendiliğinden kullanacak.
4. İlk olarak "Merhaba, ben Lup" tanıtım short'unu çıkaracağım; ardından kahve short'unu Lup'un anlattığı sürüme çevireceğim.
