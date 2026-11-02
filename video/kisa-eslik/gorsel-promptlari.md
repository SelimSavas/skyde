# Bilmediğin şarkıya eşlik etmek · tipografi, görsel planı ve promptlar (ChatGPT)

Kullanım `video/lup/lup-gorsel-promptlari.md` ile aynı:
- Lup geçenlerde `lup-ana.png`'yi, Arkadaşın geçenlerde `arkadasin-ana.png`'yi ekle.
- `{LUP}`, `{STYLE}` ve `{ARKADAŞIN}` yerine o dosyadaki blokları yapıştır.
- PNG indir, verdiğim adla Drive'daki **LUP** klasörüne koy.
- Görsellerde yazı istemiyoruz; bütün yazılar kodla ekleniyor.

Kodla yapılacaklar (görsel gerekmez):
- **Melodi ve notalar:** Melodi (`melodi.js`), notaların porte üstünde çalındıkça belirmesi, son notanın boş yuvası ve parlayan doğru nota.
- **Yanlış nota:** Kırmızı ve eğri yanlış nota, ekranın titremesi.
- **Beyin:** "Bu yanlış" alarm dalgası, dopamin parıltısı.
- **Ses:** YUP ses kimliği; müzik yatağı `merak` ruhunda, melodi çalarken susar.

---

## Tipografi: "plak ve porte" (bu videoya özel)

| Görev | Yazı tipi ve biçim | Neden |
|---|---|---|
| Başlık | **Abril Fatface**: yüksek kontrastlı, konser afişi gibi. Başlık beş çizgili bir portenin üstüne yazılır. Melodi çalarken her hece notayla birlikte zıplar (karaoke gibi). Yanlış notada harfler bir an kayar, renk kırmızıya döner. | Yazı müziği oynar. Önceki videolardan da tamamen farklı. |
| Not | **Kalam Bold** (Lup'un el yazısı). | Marka sürekliliği. |
| Logo | Nunito, değişmez. | Marka. |

---

## Görseller (6)

ChatGPT saydam zemin yerine bazen dama desenli sahte zemin çiziyor. Karakter ve eşya promptlarında "düz beyaz zemin" istedim, zemini ben temizliyorum.

**1 · Lup'un müzik pozları** → `lup-4i-muzik.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference: same proportions, colors, line weight and details. 4 key poses of LUP in a row, same scale, isolated on a plain flat white background (no checkerboard):
(1) wearing big vintage over-ear headphones (brass and teal), eye blissfully closed, body swaying to music, a few small music notes floating around him;
(2) conducting an invisible orchestra with his yellow pencil used as a baton, mouth open singing, eyebrow raised, energetic;
(3) cringing at a wrong note: shoulders up, eye squeezed shut, mouth in a tight zigzag grimace, one hand pressed against the side of his rim like covering an ear;
(4) listening intently: one hand cupped behind the side of his rim, the other hand raised with the index finger up as if saying "wait", eyebrow raised, curious.
{LUP}
{STYLE}
```

**2 · Arkadaşın: eşlik ediyor ve yanlış notaya yüz buruşturuyor** → `arkadasin-muzik.png` (arkadasin-ana.png ekle)
```
Use the attached image as the exact character reference: same face, hair, clothes, colors and proportions. 2 upper-body poses of ARKADAŞIN side by side, same scale, isolated on a plain flat white background (no checkerboard):
(1) singing along passionately into a wooden spoon held like a microphone, eyes closed, head tilted back, big joyful open-mouth smile, wearing over-ear headphones;
(2) cringing at a wrong note: nose scrunched, one eye shut, teeth clenched, one hand pressed over her ear, the other hand still holding the wooden spoon.
No furniture, no text.
{ARKADAŞIN}
{STYLE}
```

**3 · Eşyalar** → `muzik-esya.png`
```
A clean prop sheet for a science video, each object separate with generous spacing, isolated on a plain flat white background (no checkerboard), same ink style:
(1) a vintage suitcase record player (turntable) with a black vinyl record on it, seen from a 3/4 top view;
(2) a single black vinyl record seen straight from above, with a plain teal center label (no text);
(3) a pair of vintage over-ear headphones in brass and teal;
(4) a friendly, simplified human brain seen from the side in soft pink, with a small warm golden glow deep in its center;
(5) an old brass hand bell ringing, with small motion lines;
(6) a wooden conductor's music stand holding an open book of sheet music with empty staff lines (five-line staves, no notes, no letters).
{STYLE}
```

**4 · Arka plan: müzik odası** → `lup-7o-muzik-odasi.png`
```
Vertical 1024×1536 cozy music room at night: a vintage record player on a low wooden cabinet in the lower third, shelves full of vinyl records on one side, an acoustic guitar on a stand on the other side, a warm table lamp, a window with a night sky. The middle band of the wall (around 35–55% from the top) is a calm, plain warm wall with nothing on it (an animated music staff will be drawn there), and the top part is also calm for titles. No people, no text, no letters, no posters with writing.
{STYLE}
```

**5 · Arka plan: beyindeki konser salonu** → `lup-7p-beyin-konser.png`
```
Vertical 1024×1536 whimsical hand-drawn "concert hall inside the brain": soft pink curved walls with gentle brain-fold patterns, red velvet curtains on both sides, a small wooden stage in the lower third with a warm spotlight and an empty conductor's podium, an orchestra pit in front with rows of tiny glowing round lamps like neurons, thin golden nerve fibers running up the walls like garlands. Warm, playful, magical, not scary. The center of the hall above the stage is open for animated content. No characters, no text.
{STYLE}
```

**6 · Kapak** → `lup-10a-kapak-eslik.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference. Vertical 1024×1536 thumbnail: LUP in the lower right third wearing big vintage headphones, eye closed, mouth open singing happily; a curving line of floating music notes comes out of a small vintage record player at the lower left and rises across the image, ending in one glowing empty golden circle where the last note should be. Warm paper background with a faint dotted grid. The upper half is calm, left free for the title. High contrast, readable at small size, no text, no letters, no question marks.
{LUP}
{STYLE}
```

---

## Sahne planı

| Satır | Arka plan | Görüntü ve ses |
|---|---|---|
| e-durak (kanca) | Müzik odası (`7o`) | **Mercek Açılışı**, ardından hemen melodi (0,3–7,3 sn). Duvardaki portede notalar çalındıkça belirir. Başlık ilk karede hazır: "SON NOTAYI SEN SÖYLE." Lup kulaklıkla sallanır (`4i-1`). Melodi son notadan önce durur, portede parlayan boş bir yuva kalır. Lup "bekle" der (`4i-4`). "İşte o nota:" sonrası doğru nota çalar, yuvaya altın nota oturur. |
| e-yanlis | Müzik odası | Son ölçü yeniden çalar ve yanlış biter. Kırmızı, eğri nota; ekran bir an titrer. Arkadaşın yüzünü buruşturur (`arkadasin-2`). |
| e-alarm | Beyindeki konser salonu (`7p`) | Beyin (`esya-4`) sahnede; sağ önden bir alarm dalgası yayılır, çan (`esya-5`) sallanır. Kalam not: "0,2 saniyede". Lup yüz buruşturur (`4i-3`). |
| e-tahmin | Konser salonu | Lup şef (`4i-2`), nota sehpasında (`esya-6`) gelecek notalar soluk olarak önceden belirir. "Eve döndüğünü" sözünde son nota küçük bir ev simgesine oturur. |
| e-dopamin | Konser salonu → müzik odası | Beynin ortası altın gibi parlar (`esya-4`), parıltılar. Arkadaşın kaşıkla eşlik eder (`arkadasin-1`). |
| e-cta | Defter kâğıdı | "'Müzik kulağım yok' diyen arkadaşına gönder." Plak (`esya-2`) dönerken fotoğrafa uçar; logo, "Lup'la bak.", abone ol. |

**Süre:** Konuşma ~30 sn, melodi ve testler ~11 sn; toplam ~42 sn.
