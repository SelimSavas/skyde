# Bilmediğin şarkıya eşlik etmek · görsel planı ve promptlar (ChatGPT)

**Konu:** Hiç bilmediğin bir şarkı çalıyor. Sözlerini bilmiyorsun, ama ikinci nakarata gelmeden mırıldanmaya, eşlik etmeye başlıyorsun. Video bunu izleyiciye yaşatır:
1. Özgün melodiyi bir kez dinler.
2. İkinci kez çalınca içinden eşlik eder.
3. Melodi sondan önce durur, son notayı kendisi tamamlar.

Sonra nedeni anlatılır: tahmin eden beyin, tekrar, ödül ve birlikte söylemek.

**Kullanım** (`video/lup/lup-gorsel-promptlari.md` ile aynı):
- Lup geçenlerde `lup-ana.png`'yi, Arkadaşın geçenlerde `arkadasin-ana.png`'yi ekle.
- `{LUP}`, `{STYLE}` ve `{ARKADAŞIN}` yerine o dosyadaki blokları yapıştır.
- PNG indir, verdiğim adla Drive'daki **LUP** klasörüne koy.
- Görsellerde yazı yok; yazılar kodla ekleniyor.

**Kodla yapılacaklar:**
- **Melodi:** Melodi ve akorlar (`melodi.js`); notaların porte üstünde çalındıkça belirmesi; ikinci çalışta notaların bir an önce soluk belirmesi ("biliyorsun"); son notanın boş yuvası ve altın nota.
- **Beyin:** Beyne akan binlerce şarkı (plaklar ve notalar), ödül parıltısı.
- **Ses:** YUP ses kimliği; müzik yatağı `merak`, melodi çalarken susar.

---

## Tipografi: "plak ve porte"

| Görev | Yazı tipi ve biçim |
|---|---|
| Başlık | **Abril Fatface** (konser afişi gibi). Başlık beş çizgili bir portenin üstüne yazılır; melodi çalarken heceler notalarla birlikte zıplar. |
| Adım yazısı | "1 · DİNLE", "2 · SEN DE EŞLİK ET": aynı yazı tipinde, küçük, plak etiketi gibi yuvarlak bir rozette. |
| Not | **Kalam Bold** (Lup'un el yazısı). |
| Logo | Nunito. |

---

## Görseller (6)

ChatGPT saydam zemin yerine bazen dama desenli sahte zemin çiziyor. Karakter ve eşya promptlarında "düz beyaz zemin" istedim, zemini ben temizliyorum.

**1 · Lup'un müzik pozları** → `lup-4i-muzik.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference: same proportions, colors, line weight and details. 4 key poses of LUP in a row, same scale, isolated on a plain flat white background (no checkerboard):
(1) wearing big vintage over-ear headphones (brass and teal), eye blissfully closed, body swaying to music, a few small music notes floating around him;
(2) humming along with a sly happy smile, eye half closed, one hand tapping the air to the beat, small music notes coming out of his mouth;
(3) singing loudly and happily with mouth wide open, both arms spread wide, like singing along at a party;
(4) listening intently: one hand cupped behind the side of his rim, the other hand raised with the index finger up as if saying "wait", eyebrow raised, curious.
{LUP}
{STYLE}
```

**2 · Arkadaşın: düğünde bilmediği şarkıya eşlik ediyor** → `arkadasin-muzik.png` (arkadasin-ana.png ekle)
```
Use the attached image as the exact character reference: same face, hair, clothes, colors and proportions. 2 upper-body poses of ARKADAŞIN side by side, same scale, isolated on a plain flat white background (no checkerboard), dressed for a Turkish wedding: an elegant simple teal dress instead of the cardigan, same gold hoop earrings, hair loosely up:
(1) singing along joyfully with eyes closed and a big open-mouth smile, waving a red handkerchief in the air like the leader of a halay dance;
(2) a playful "I don't know the words but I'm singing anyway" look: mouth open singing, one eyebrow up, a sheepish grin, one hand palm up in a little shrug, a few small music notes around her.
No other people, no furniture, no text.
{ARKADAŞIN}
{STYLE}
```

**3 · Eşyalar** → `muzik-esya.png`
```
A clean prop sheet for a science video, each object separate with generous spacing, isolated on a plain flat white background (no checkerboard), same ink style:
(1) a vintage wooden tabletop radio with a fabric speaker grille and two round knobs;
(2) a single black vinyl record seen straight from above, with a plain teal center label (no text);
(3) a pair of vintage over-ear headphones in brass and teal;
(4) a friendly, simplified human brain seen from the side in soft pink, with a small warm golden glow deep in its center;
(5) a red handkerchief with a small patterned border, slightly fluttering (used in Turkish halay dance);
(6) a wooden conductor's music stand holding an open book of sheet music with empty staff lines (five-line staves, no notes, no letters).
{STYLE}
```

**4 · Arka plan: düğün salonu** → `lup-7o-dugun.png`
```
Vertical 1024×1536 joyful Turkish wedding hall at night, hand-drawn: strings of warm fairy lights across the ceiling, a wooden dance floor in the lower third with a cheerful crowd of guests in the background dancing halay in a line holding pinkies (simple, small, faces not detailed), a small stage at the back with a davul drum and a zurna resting on it, round tables with white tablecloths at the sides. The middle band (around 30–50% from the top) is a calmer area of soft lights with nothing important in it (an animated music staff will be drawn there), and the top is calm for titles. Warm, festive, friendly. No text, no letters, no signs.
{STYLE}
```

**5 · Arka plan: beyindeki konser salonu** → `lup-7p-beyin-konser.png`
```
Vertical 1024×1536 whimsical hand-drawn "concert hall inside the brain": soft pink curved walls with gentle brain-fold patterns, red velvet curtains on both sides, a small wooden stage in the lower third with a warm spotlight and an empty conductor's podium, an orchestra pit in front with rows of tiny glowing round lamps like neurons, thin golden nerve fibers running up the walls like garlands. Warm, playful, magical, not scary. The center of the hall above the stage is open for animated content. No characters, no text.
{STYLE}
```

**6 · Kapak** → `lup-10a-kapak-eslik.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference. Vertical 1024×1536 thumbnail: LUP in the lower right third singing happily with mouth wide open, wearing big vintage headphones; a curving line of floating music notes comes out of a small vintage radio at the lower left and rises across the image, ending in one glowing empty golden circle where the last note should be. Warm paper background with a faint dotted grid. The upper half is calm, left free for the title. High contrast, readable at small size, no text, no letters, no question marks.
{LUP}
{STYLE}
```

---

## Sahne planı

| Satır | Arka plan | Görüntü ve ses |
|---|---|---|
| e-hook | Düğün salonu (`7o`) | **Mercek Açılışı:** Arkadaşın mendil sallayıp bilmediği şarkıya eşlik ediyor (`arkadasin-1`). Başlık ilk karede: "BİLMEDİĞİN ŞARKIYA EŞLİK EDERSİN." "Dene" sözünde ışıkların arasına porte kartı gelir, rozet: "1 · DİNLE". Melodi bir kez baştan sona çalar (~8 sn); notalar çalındıkça portede belirir. Lup kulaklıkla sallanır (`4i-1`). |
| e-tekrar | Düğün salonu | Rozet: "2 · SEN DE EŞLİK ET". Melodinin ikinci yarısı çalar; her nota çalmadan bir an önce soluk belirir ("beynin biliyor"). Lup mırıldanır (`4i-2`). Son notadan önce durur; portede parlayan boş bir yuva kalır. Lup "bekle" der (`4i-4`). |
| e-tamam | Düğün salonu | "değil mi?" sözünden sonra son nota çalar, yuvaya altın nota oturur, parıltı. |
| e-neden | Beyindeki konser salonu (`7p`) | Radyo (`esya-1`) ve dönen plaklardan (`esya-2`) çıkan notalar beyne (`esya-4`) akar. Nota sehpasında (`esya-6`) "nakarat" iki kez belirir; ikincisi parlak ("kaydedildi"). |
| e-keyif | Konser salonu → düğün salonu | Beynin ortası altın gibi parlar. Düğünde halay; Arkadaşın sözleri bilmeden söylüyor (`arkadasin-2`), Lup coşkuyla söylüyor (`4i-3`), havada mendil (`esya-5`). |
| e-cta | Defter kâğıdı | "Sözleri bilmeden her şarkıya eşlik eden arkadaşına gönder." Plak fotoğrafa uçar; logo, "Lup'la bak.", abone ol. |

**Süre:** Konuşma ~31 sn, melodi ~11 sn; toplam ~44 sn.
