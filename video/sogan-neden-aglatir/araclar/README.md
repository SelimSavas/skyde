# Görselleri yeniden üretmek

Kaynak görseller `video/` klasöründeki Gemini JPEG'leridir (karakter, ağız ve göz sayfaları, mutfak, büyüteç,
mikro dünya, soğan kareleri). İki adımda `assets.js` yeniden yazılır:

```bash
pip install numpy scipy pillow
python3 video/sogan-neden-aglatir/araclar/extract.py        # zemini temizler, parçaları keser (geçici klasöre)
python3 video/sogan-neden-aglatir/araclar/build_assets.py   # başı gövdeye hizalar, WebP olarak assets.js'e gömer
```

Görseller data URI olarak gömülür: sayfa `file://` ile açıldığında ayrı resim dosyaları tuvali
"kirletir" ve render.mjs kareleri alamaz.
