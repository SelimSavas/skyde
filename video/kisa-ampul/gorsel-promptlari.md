# Ampule bakınca gelen renkli leke · tipografi, görsel planı ve promptlar (ChatGPT)

Kullanım `video/lup/lup-gorsel-promptlari.md` ile aynı:
- Lup geçenlerde `lup-ana.png`'yi, Arkadaşın geçenlerde `arkadasin-ana.png`'yi ekle.
- `{LUP}`, `{STYLE}` ve `{ARKADAŞIN}` yerine o dosyadaki blokları yapıştır.
- PNG indir, verdiğim adla Drive'daki **LUP** klasörüne koy.
- Görsellerde yazı istemiyoruz; bütün yazılar kodla ekleniyor.

Kodla yapılacaklar (görsel gerekmez):
- **Deney:** Lup'un ters renkli hâli (camında odak noktası), 10 sn geri sayım halkası, ardından siyah beyaz Lup.
- **Leke:** Ampulün renk değiştiren ardıl lekesi.
- **Gözkapağı:** Kapalı gözün üstüne vuran kırmızı ışık.
- **Hücreler:** Konilerin solup toparlanması.

---

## Tipografi: "göz muayenesi" (bu videoya özel)

| Görev | Yazı tipi ve biçim | Neden |
|---|---|---|
| Başlık | **Atkinson Hyperlegible Next ExtraBold**, göz muayene panosu gibi dizilir: satırlar aşağı doğru küçülür, harfler aralıklı. Az gören okurlar için tasarlanmış bir yazı tipi. Başlık kayınca arkasında karşıt renkte, solan bir "ardıl iz" bırakır. | Yazı konuyu oynar: hem göz muayenesi hem ardıl görüntü. Şablon görünümü yok. |
| Geri sayım | Aynı yazı tipi, dev rakamlar (10 → 1), ince bir halkanın ortasında. | Deneyin saati. |
| El yazısı not | **Kalam Bold** (Lup'un el yazısı, uyuşma videosundan beri). | Marka sürekliliği. |
| Logo | Nunito, değişmez. | Marka. |

Kural: Deney ekranında yazı yok (dikkat noktada kalsın); yalnız geri sayım.

---

## Görseller (6)

**1 · Lup'un ampul pozları** → `lup-4h-ampul.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference: same proportions, colors, line weight and details. 4 key poses of LUP in a row, same scale, transparent background:
(1) looking up at something bright above him, squinting his eye almost shut, one gloved hand raised to shade his lens like a visor;
(2) his eye closed (eyelid down, relaxed), a dreamy little smile, with a few soft colorful floating blobs (orange, magenta, green) drawn around his head like after-image spots;
(3) rubbing his eye with the knuckle of one gloved hand, slightly dazed, the other arm hanging loose;
(4) a proud "ta-da" pose: both arms open wide toward the viewer, eye wide and sparkling, big happy smile.
{LUP}
{STYLE}
```

**2 · Arkadaşın: ampule bakıp gözünü kapatıyor** → `arkadasin-ampul.png` (arkadasin-ana.png ekle)
```
Use the attached image as the exact character reference: same face, hair, clothes, colors and proportions. 2 upper-body poses of ARKADAŞIN side by side, same scale, transparent background:
(1) looking up at a bright ceiling light (off-frame, above), squinting, one hand shading her eyes, her face lit warmly from above;
(2) eyes gently closed, a dreamy curious smile, head tilted slightly back, as if watching colorful spots behind her eyelids. A few soft round colorful blobs (orange, magenta, teal) float around her head.
No furniture, no lamp in the picture, no text.
{ARKADAŞIN}
{STYLE}
```

**3 · Eşyalar** → `ampul-esya.png`
```
A clean prop sheet for a science video, each object separate with generous spacing, transparent background, same ink style:
(1) a vintage Edison light bulb glowing warmly, the coiled filament clearly visible, hanging from a short twisted fabric cord;
(2) the same bulb switched off (clear glass, dark filament);
(3) a friendly, simplified side cross-section of a human eye like a children's anatomy book: cornea, iris, lens, and the curved retina at the back drawn as a soft pink layer, a few light rays entering;
(4) three cute cone-shaped cells standing side by side like little characters, one red, one green, one blue, each with a tiny happy face;
(5) the same three cone cells looking tired and pale: droopy, half-closed eyes, washed-out colors, one yawning;
(6) a close-up of a gently closed human eye with eyelashes, neutral skin tone, no glow (the red glow will be added later).
{STYLE}
```

**4 · Arka plan: ampullü oda** → `lup-7m-ampul-odasi.png`
```
Vertical 1024×1536 cozy small room at night lit only by a single bare Edison bulb hanging from the ceiling on a long cord; the bulb hangs in the center of the image at about 40% from the top, glowing warmly, casting a soft pool of light; a wooden table across the lower third with an open notebook and a pencil (Lup will stand on the table); dark cozy corners, a window with a night sky on one side, a bookshelf in shadow on the other. The top part of the wall above the bulb is calm and dark, left free for titles. No people, no text.
{STYLE}
```

**5 · Arka plan: gözün içi** → `lup-7n-goz-ici.png`
```
Vertical 1024×1536 whimsical hand-drawn view from inside the human eye, looking toward the back: the curved retina as a soft pink-orange landscape covered with rows of tiny rounded cone and rod cells like a field of little tulips; thin glowing nerve fibers running across like rivers toward a pale optic disc on one side; in the upper part, the round pupil seen from inside as a bright window of light with rays coming in. Warm, magical, friendly, not medical or scary. No characters, no text. The center is open for animated content.
{STYLE}
```

**6 · Kapak** → `lup-10a-kapak-ampul.png` (lup-ana.png ekle)
```
Use the attached image as the exact character reference. Vertical 1024×1536 thumbnail: a glowing vintage Edison bulb hangs at the upper left; LUP stands in the lower right third with his eye closed and a dreamy smile, colorful after-image blobs (orange, magenta, green) floating inside and around his lens. Warm paper background with a faint dotted grid. The upper half is calm, left free for the title. High contrast, readable at small size, no text, no letters.
{LUP}
{STYLE}
```

---

## Sahne planı

| Satır | Arka plan | Görüntü |
|---|---|---|
| a-hook | Ampullü oda (`7m`) | **Mercek Açılışı:** merceğin içinde ampul parlıyor. Arkadaşın ampule bakıyor (`arkadasin-1`), "kapatınca"da gözünü kapatıyor (`arkadasin-2`); ekran kızıl perdeye dönüyor, ampulün yerinde renk değiştiren bir leke yüzüyor (sarı → turkuaz → mavi → mor). Başlık ilk karede hazır (göz muayene panosu): "BU LEKE / AMPULDEN DEĞİL, / GÖZÜNDEN." Lup ampule bakar (`4h-1`), "senin gözünden"de gözünü ovuşturur (`4h-3`). |
| a-solma | Gözün içi (`7n`) | Işık ışınları girer, üç koni (`esya-4`) ışıkla parlar ve solar (`esya-5`). "Renkten renge"de leke turuncu → pembe → yeşil geçer; koniler tek tek toparlanır. |
| a-kapak | Ampullü oda, yakın | Kapalı göz (`esya-6`) yakın plan; ampul ışığı kapaktan süzülür, mavi ve yeşil ışınlar kapakta "yutulur", kırmızı geçer. Lup gözü kapalı, rüyada gibi (`4h-2`). |
| a-dene | Düz, nötr kâğıt | Ters renkli Lup ortada, camında odak noktası. "On saniye" sözünden sonra 10 → 1 geri sayım (yazı yok, yalnız rakam ve halka), tik sesleri. |
| a-bak | Düz, nötr kâğıt | Aynı yerde siyah beyaz Lup; izleyici onu renkli görür. 2 sn sonra köşede Arkadaşın şaşkın (`yuz_saskin`, ifadeler sayfasından). |
| a-cta | Defter kâğıdı | "Gözünün asla kanmayacağını söyleyen arkadaşına gönder." Lup "ta-da" (`4h-4`); logo, "Lup'la bak.", abone ol. |
