# Kosinüs Teoremi — eğitim videosu

Meslek lisesi 10. sınıf için "Kosinüs Teoremini Sıfırdan Öğreniyorum" videosu (≈ 13–14 dk, 1920×1080).

| Dosya | Ne işe yarar |
|---|---|
| `SENARYO.md` | Sahne sahne senaryo: seslendirme metni, görsel yönergeler, ekrandaki formüller, zamanlama, matematik kontrolü (otomatik üretilir) |
| `seslendirme_metni.txt` | Kayıt / TTS için yalnızca konuşulacak metin; replikler arasında `[pause]` |
| `script.js` | **Tek kaynak**: replikler + görseller + zamanlama. Metin/görsel değişikliği burada yapılır |
| `engine.js`, `style.css`, `index.html` | Animasyon motoru ve görünüm |
| `render.js` | Video, altyazı ve dokümanları üretir |
| `ses/` | Ses kayıtları buraya (`01-01.mp3`, `01-02.mp3`, …) |

## Komutlar

```bash
node render.js --docs            # SENARYO.md + seslendirme_metni.txt + cikti/kosinus-teoremi.srt
node render.js                   # cikti/kosinus-teoremi-altyazili.mp4 (ses varsa sesli)
node render.js --nosubs          # altyazısız video
node render.js --from 300 --to 420   # yalnızca bir aralık (hızlı deneme)
node render.js --snap 12,95.5    # belirli saniyelerden PNG kare
```

Tarayıcıda `index.html` açılırsa video canlı oynar (boşluk: oynat/durdur, ←/→: 5 sn, [ ]: bölüm atla, S: altyazı).

## Ses gelince

`ses/` klasörüne replik kodlarıyla adlandırılmış dosyalar konur ve `node render.js` çalıştırılır. Her repliğin süresi
gerçek sesten ölçülür, görseller repliğin içindeki oransal anlara bağlı olduğu için kendiliğinden yeniden hizalanır,
ses tek bir parçaya karıştırılıp (−16 LUFS) videoya eklenir.
