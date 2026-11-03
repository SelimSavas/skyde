# Karpuz çekirdeğinin proteini · tipografi, görsel planı ve promptlar (ChatGPT)

**Konu:** Karpuz çekirdeğinin içi gram gram kıymadan daha fazla protein taşır (28 g'a 19 g). Çünkü çekirdek, filizin beslenme çantasıdır. Ama bir anda çok yiyemeyiz: 100 g kıymanın proteini için binden fazla çekirdek çitlemek gerekir, neredeyse bir maç boyunca. Kabuk adeta bir frendir. Bu proteinin bazı yapı taşları azdır, etin yerini tek başına tutmaz.

**Kullanım** (`video/lup/lup-gorsel-promptlari.md` ile aynı):
- Lup geçenlerde `lup-ana.png`'yi, Arkadaşın geçende `arkadasin-ana.png`'yi ekle.
- Blokları yerleştirilmiş hâli `gorsel-promptlari-tam.md` dosyasında; doğrudan yapıştırılabilir.
- Görsellerde yazı yok; yazılar kodla eklenir.

**Yeniden kullanılan arka planlar** (yeni görsel gerekmez):
- `lup-7k-film-aksami`: maç gecesi. Ekranın ışığı kodla titreşir, maç uğultusu sesle gelir.
- `lup-7d-mutfak`: terazi ve karşılaştırma tezgâhı.
- `lup-7c-makro-toprak`: çekirdeğin filizlendiği toprak, Lup'un merceğinden.

**Kodla yapılacaklar:**
- **Skorbord:** "ÇEKİRDEK 28 – 19 KIYMA" (LED noktalı rakamlar).
- **Sayaçlar:** çekirdek sayacı (0 → 1.000+), maç saati (0' → 90').
- **Kabuk dağı:** büyüyen kabuk yığını.
- **Yapı taşları:** eksik parçalı yapboz.
- **Çitleme sesi:** her kırılışta "çıt" (yeni ses).

---

## Tipografi: "skorbord"

| Görev | Yazı tipi ve biçim |
|---|---|
| Başlık | **Bungee**: tabela ve stadyum harfi, büyük harf. Kâğıt şerit üstünde; rakamlar skorbord gibi çevrilerek gelir. |
| Skorbord | Kodla çizilen LED nokta rakamlar (koyu panel, amber ışık). |
| Not | **Kalam Bold** (Lup'un el yazısı). |
| Logo | Nunito. |

---

## Görseller (4)

**1 · Lup'un çekirdek pozları** → `lup-4j-cekirdek.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference: same proportions, colors, line weight and details. 4 key poses of LUP in a row, same scale, isolated on a plain flat white background (no checkerboard):
(1) cracking a black watermelon seed between his two gloved hands, a tiny crack line and a small spark at the seed, eye focused, tongue slightly out in concentration;
(2) proudly holding up a single tiny pale kernel between thumb and finger like a precious gem, eye wide and sparkling, a small glint on the kernel;
(3) sitting exhausted and half buried in a big pile of empty split black seed shells, arms hanging over the pile, eye half closed, tired funny smile, a few shells stuck on his rim;
(4) cheering at a football match on TV: one arm up holding a paper cone full of black seeds, a teal and amber striped scarf around his rim, mouth wide open shouting happily.
{LUP}
{STYLE}
```

**2 · Arkadaşın: maç gecesi çekirdek** → `arkadasin-cekirdek.png` (arkadasin-ana.png ekle)
```
Use the attached image as the exact character reference: same face, hair, clothes, colors and proportions. 2 upper-body poses of ARKADAŞIN side by side, same scale, isolated on a plain flat white background (no checkerboard), at home on a match night, wearing a teal and amber striped scarf over her teal cardigan:
(1) cracking a black watermelon seed between her front teeth with a skillful little smile, eyes looking to the side at a TV off-frame, holding a paper cone full of black seeds in one hand, a few empty shells in her other palm;
(2) looking down in comic disbelief at a single tiny pale kernel on her fingertip, one eyebrow raised, lips pursed, a small pile of empty shells in her other hand.
No furniture, no TV in the picture, no text.
{ARKADAŞIN}
{STYLE}
```

**3 · Eşyalar** → `karpuz-esya.png`
```
A clean prop sheet for a food science video, each object separate with generous spacing, isolated on a plain flat white background (no checkerboard), same ink style:
(1) a juicy triangular slice of watermelon with black seeds;
(2) a small heap of roasted black watermelon seeds in their shells;
(3) one big watermelon seed cracked open, the split black shell beside the pale cream kernel;
(4) a small bowl full of shelled pale watermelon seed kernels;
(5) a portion of raw minced beef on a sheet of butcher paper;
(6) a vintage brass kitchen balance scale with two empty round pans, level;
(7) a paper cone full of black roasted watermelon seeds;
(8) a watermelon seed sprouting: the split shell on the soil, a tiny seedling rising with two round fleshy seed leaves (cotyledons);
(9) a tiny vintage tin lunch box, open, empty inside.
{STYLE}
```

**4 · Kapak** → `lup-10a-kapak-karpuz.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference. Vertical 1024×1536 thumbnail: LUP in the lower right third holding up a single tiny pale watermelon seed kernel like a trophy, eye wide and proud; next to him a vintage brass balance scale where one pan holds a small heap of black watermelon seeds and the other pan holds raw minced meat, the seed pan sitting lower as if heavier; a juicy watermelon slice in the lower left corner. Warm paper background with a faint dotted grid. The upper half is calm, left free for the title. High contrast, readable at small size, no text, no letters, no numbers.
{LUP}
{STYLE}
```

---

## Sahne planı

| Satır | Arka plan | Görüntü ve ses |
|---|---|---|
| k-hook | Maç gecesi (`7k`) | **Mercek Açılışı:** Arkadaşın çekirdek çitliyor (`ark-1`), her kırılışta "çıt". Ekranın ışığı titreşir, maç uğultusu. Başlık: "GRAM GRAM KIYMADAN FAZLA PROTEİN". Lup atkıyla tezahürat yapar (`4j-4`). |
| k-sayi | Mutfak (`7d`) | Tezgâhta terazi (`esya-6`): bir kefede çekirdek içi (`esya-4`), ötekinde kıyma (`esya-5`), "100 g = 100 g". Skorbord: "ÇEKİRDEK 28 – 19 KIYMA", rakamlar çevrilerek gelir, darbe sesi. Not: "çiğ kıyma · USDA". |
| k-canta | Toprak makrosu (`7c`) | Çekirdek (`esya-3`) çatlar, filiz (`esya-8`) çenek yapraklarını açar. Beslenme çantası (`esya-9`) açılır, içinden "protein" ve "yağ" etiketleri çıkar. Lup içi parlayan çekirdeği gösterir (`4j-2`). |
| k-ama | Maç gecesi | Skorbord sayaca döner: çekirdek 0 → 1.000+, maç saati 0' → 90'. Kabuklar yağar, kabuk dağı büyür; Lup kabuklara gömülür (`4j-3`). Arkadaşın parmağındaki minik çekirdeğe bakar (`ark-2`). |
| k-kabuk | Maç gecesi → kâğıt | "Fren" sözünde kabuk tek tek çatlar (yavaş ritim). "Yapı taşları" sözünde bir yapbozun bir parçası eksik; Kalam not: "etin yerini tutmaz". |
| k-cta | Defter kâğıdı | "Çekirdeksiz maç izleyemeyen arkadaşına gönder." Çekirdek külahı (`esya-7`) fotoğrafa uçar; logo, "Lup'la bak.", abone ol. |

**Ses:** YUP ses kimliği: mercek kancası, `komik` müzik yatağı, maç uğultusu (ortam), skorborda `sayi` darbesi, filize `sihir`, kapanışta Lup motifi.

**Süre:** Konuşma ~40 sn, toplam ~45 sn.
