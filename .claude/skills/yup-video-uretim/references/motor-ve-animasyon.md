# Motor, animasyon, görseller ve render

İçindekiler:
1. Repo düzeni
2. Motor API'si (`shared/engine.js`)
3. `film.js` kalıbı
4. Sahne çizim yardımcıları
5. Konuşan karakter
6. Gemini görsellerini içeri almak
7. Ses notası
8. Render ve önizleme
9. Yerleşim dersleri
10. Shorts

## 1. Repo düzeni (`/home/user/skyde/video/`)

```
shared/engine.js  shared/synth.js  shared/player.js  shared/player.css
narrate.mjs   render.mjs   dub.mjs   package.json (playwright 1.56.1)
araclar/      kayıt bölme, altyazı, bölüm zamanları, duman testi
<bolum>/      index.html  film.js  narration.js  voice.js  [assets.js]  [araclar/]  youtube/
seslendirme/<KayitKlasoru>/<id>.mp3 + marks.json
tabagindaki-bilim/   seri rehberi ve Gemini prompt kütüphaneleri
*.jpeg (video/ kökünde)   Tabağındaki Bilim'in Gemini kaynak görselleri
out/          (gitignore) mp4, preview/*.png, voice-cache
```

Bir sayfanın her karesi yalnızca `t`'ye bağlıdır (deterministik). Bu yüzden ileri sarmak da kare kare dökmek de aynı kodla çalışır. Rastgelelik için `hash(i, seed)` ve `noise(x, seed)` kullanılır, `Math.random` kullanılmaz.

## 2. Motor API'si (`window.Engine`, `E`)

- **Tuval ve zaman yardımcıları.** `W=1920`, `H=1080`. `clamp`, `lerp`, `ease.{linear,inOut,out,in,back,expo}`. `progress(t,a,b,fn)` a→b aralığında 0→1 verir. `vis(t,a,b,fadeIn,fadeOut)` görünürlük verir. `hash`, `noise`, `rgba([r,g,b],a)`.
- **Yazı.**
  - `text(ctx,str,x,y,{size,weight,color,align,alpha,family:'display'|'sans',spacing})`
  - `measure(ctx,str,o)`
  - `runs(ctx,[[str,o],…],x,y)` (renkli parçalı satır)
  - `wrap(ctx,str,maxW,o)`
  - `paragraph(ctx,str,x,y,maxW,{size,lineHeight,valign})`
- **Çizim.** `glow(ctx,x,y,r,[r,g,b],alpha)`, `roundRect(ctx,x,y,w,h,r)`.
- **Zaman çizelgesi.** `E.timeline([{id,title,base,stretch:[[a,b,k]],holds:[[f,e]],draw,fadeIn,fadeOut}])` şunları döndürür:
  - `{scenes, duration, scene(id), at(id,x), span, warp}`
  - `stretch` bir aralığı k kat yavaşlatır. `holds` f anında e saniye dondurur.
- **Seslendirme planı.** `E.narration({build,beats,lines,voice,pauses,cps,gap,breath})`
  - `beats[id] = [sahne, a, b, donmaAnı]`
  - `build(holds, slow)` bir timeline döndürür. Anlatıcı satırlarını bitirmeden vuruş bitmez.
  - Döndürdükleri: `{timeline, cue(id,k), end(id), placed, fresh, stale, voice}`.
  - `cue(id,k)` satırın k. öbeğinin başladığı gerçek zamandır.
  - `PAUSES` noktalama duraklarıdır: virgül 0,35, noktalı virgül ve iki nokta 0,45, nokta 0,6, soru 0,65 sn. `phrases(str)` metni öbeklere böler.
- **Film.** `E.film({title,timeline,background,score,narration,voice,fade})` şunları döndürür: `{scenes, duration, sceneAt, draw}`. Sonuç `window.FILM` olarak verilir.

## 3. `film.js` kalıbı (Tabağındaki Bilim, `sogan-neden-aglatir/film.js`)

```js
(function () {
  const E = window.Engine; const { W, H, clamp, lerp, ease, progress, vis, hash, noise, text, paragraph, glow, roundRect } = E;
  const C = { navy:'#1b2440', gold:'#ffb547', cream:'#f3ede1', paper:'#fbf6ec', terra:'#d9653b', sage:'#8db596', tomato:'#e5484d', copper:'#c27c4e', ink:'#2b1f1a', muted:'#7d7468', … };
  // görseller: window.ASSETS → Image; window.FILM_READY = Promise.all(decode)
  const SCRIPT = window.NARRATION; const sayOf = …;
  const CPS = 18;                                    // kayıt yokken saniyedeki harf
  const recorded = …window.VOICE…;                   // kayıt varsa satır süresi kayıttan
  const EXTRA = { 'a-cut': 0.6, …, 'z-end': 12 };   // satırdan sonra görüntü payı
  const LEAD  = { 'a-cut': 1.6, … };                 // satır vuruş başından bu kadar sonra başlar
  const PLAN  = [{ id:'open', title:'Soğuk açılış', beats:['a-cut','a-tears','a-question'], fadeIn:0.8 }, …];
  // PLAN → BEATS[id] = [sahne, a, a+len, a+len-0.5], SCENES (base, draw: DRAW[id])
  const PAUSE = { 'a-question': 0.6, … };            // önemli cümleden sonra ek bekleme
  const VOICE = E.narration({ build, beats: BEATS, lines: SCRIPT.lines, voice: window.VOICE, pauses: PAUSE, breath: 0.6, cps: CPS });
  const TL = VOICE.timeline, cue = VOICE.cue, lineEnd = VOICE.end;
  const after = (t,id,k=0,d=0.6,fn=ease.out) => progress(t, cue(id,k), cue(id,k)+d, fn);
  // span(t,id,k,id2,j), during(t,first,last), layer(t,a,b), pop(t,at), sceneStart(id)
  DRAW.open = function (ctx, lt, t) { … };           // lt: sahne koreografi zamanı, t: gerçek zaman
  function score(m) { … m.whoosh(cue('b-zoom',0)-0.2, {…}); … }
  window.FILM = E.film({ title, timeline: TL, background, score, narration: VOICE, voice: VOICE.voice, fade: 0.4 });
})();
```

Öğeyi anlatıcının söylediği anda göstermek için `after(t,'b-wall',2)` kullanılır: o satırın 3. öbeği söylenince 0,6 sn içinde belirir. Bir sahnede ardışık alt sahneler `layer(t, a, b)` ile çapraz geçişle değişir. Örnek: efsane sahnesinde buzdolabı, ekmek ve mum, ardından ağlatmayan soğan.

**Bilişim kalıbı** (`ch02-tasa-kazinan-mantik/film.js`) şöyle ayrılır:
- Satırlarda `beat: 'sahne.vuruş'` vardır.
- Sahnelerin sabit koreografi süreleri (`SCENES`) ve `PACE` vardır.
- Ses notası `at(sahne, saniye)` ile gerçek zamana çevrilir.
- Kayıt yokken `node video/narrate.mjs <bolum> --pay 1.1` zamanlamaya pay bırakır.

**Yeni bölüm:** En yakın bölümü kopyala, `PLAN`, `EXTRA`, `LEAD`, `PAUSE` ve `DRAW.*` kısımlarını yeniden yaz. `index.html`'de `<title>` ile `aria-label`'ı değiştir. Script sırası: engine, synth, [assets], narration, voice, film, ardından `FILM_READY` sonrası player.

## 4. Sahne çizim yardımcıları (soğan bölümünden; yeniden kullan)

**Zemin ve kadraj:**
- `paperBg(ctx,t)`: krem kâğıt zemin.
- `microBg`: mikro dünya.
- `kitchen(ctx,t,{zoom,fx,fy,fg,dim})`: katmanlı mutfak, parallax ve kararma.
- `cover(ctx,k,zoom,fx,fy)`

**Görsel ve metin parçaları:**
- `pic`, `picC(ctx,k,cx,cy,h,a,rot)`
- `kicker(ctx,str,a)`: sol üstte bölüm etiketi.
- `chip(ctx,str,x,y,a,{size,fill,color})`: hap etiket.
- `card(ctx,x,y,w,h,a,{fill})`
- `statement`
- `stamp(ctx,'ŞÜPHELİ',renk,x,y,t0,t,{size,rot})`: hüküm damgası.
- `bubble(ctx,k,…)`: düşünce balonu.
- `arrow(ctx,x1,y1,x2,y2,{color,lw,p,dash})`
- `badge`

**Nesneler** (kodla, düz vektör, koyu kahve `outline`):
- `onionWhole`, `onionFace`, `knife`, `drop`, `garlic`
- `ballStick` (molekül), `gasMol`, `scissorEnzyme`, `catcherEnzyme`
- `eyeSection`, `brain`, `gland`, `pan`, `beaker`, `flameIcon`, `fridge`, `bread`, `candle`, `fan`, `snail`
- `hud` (araştırma kamera arayüzü), `gauge`

Moleküller, hücreler, organ kesitleri ve grafikler her zaman kodla çizilir; Gemini bunları doğru çizemez.

## 5. Konuşan karakter (Tabağındaki Bilim)

- **`host(ctx,t,x,y,h,{pose,mouth,eyes,talk,goggles,tilt,lean,flip,alpha})`**
  - Gövde pozu çizilir: `body`, `poseTools`, … (`assets.js` anahtarları).
  - Baş, ağız sayfasındaki 9 viseme başından kurulur. Baş gövdeye gözlük çerçevesinin sınır kutusuyla hizalanmıştır.
  - Gözler, göz sayfasından alınan bir şeritle üste bindirilir.
  - Hafif nefes ve sallanma vardır (`noise`).
- **Dudak eşleme.**
  - Her satırın metnindeki harfler ünlü/ünsüz tablosuyla ağız şekline çevrilir.
  - Satırın gerçek süresine (`voice.js`) eşit aralıkla yayılır.
  - Aynı şekiller birleştirilir, 60 ms'den kısa olanlar öncekine katılır (`TRACK`, `mouthAt`).
  - `speaking(t)` karakterin konuşup konuşmadığını verir.
- **Göz kırpma.** Tohumlu aralıklarla yapılır (yarı, kapalı, yarı); `eyesAt`.
- **`presenter(ctx,t,x,o)`** `host(ctx,t,x,1560,1400,o)` çağrısıdır: uyluktan yukarı kadraj, ayaklar ekran dışında. **Karakteri asla masa ya da tezgâh üstünde ayakta gösterme** (kullanıcı düzeltmesi).
- **`headPoint(x,y,h,mx,my)`** baş görselindeki bir noktanın ekran konumunu verir. Ağza ekmek, göze gaz oku gibi bağlamalarda kullanılır.
- **Gözlüğü indirme.** `goggles: 0..1`. Alında kalan boşluğu `fringe()` saç perçemiyle kapatır.

## 6. Gemini görsellerini içeri almak

- Kaynaklar `video/*.jpeg` dosyalarıdır:
  - karakter: `karakter.jpeg`, `karakter_parcalari.jpeg`, `karakter_kuklası.jpeg`
  - yüz sayfaları: `agız_sekillerii.jpeg`, `goz_sekilleri.jpeg`
  - mutfak: `arka_duvar.jpeg`, `orta_katman.jpeg`, `ön_katman.jpeg`, `ortam_full.jpeg`
  - diğer: `büyüteç_geçiş.jpeg`, `mikro_dünya_arka_plan.jpeg`, `sogan_calisması.jpeg`
- `pip install numpy scipy pillow` ile bağımlılıkları kur, sonra:
  - `python3 video/sogan-neden-aglatir/araclar/extract.py` zemini temizler ve parçaları keser. Macenta zeminde anahtar `min(R,B)−G` ile alınır, kenardaki pembe taşma temizlenir. Beyaz ya da krem zeminde köşe renginden taşma doldurma (flood fill) yapılır, ardından 2 px aşındırma uygulanır. Bir temas sayfası da üretir.
  - `python3 video/sogan-neden-aglatir/araclar/build_assets.py` başı gövdeye hizalar ve parçaları WebP (q≈86) olarak `assets.js`'e `window.ASSETS = { key: {src:'data:image/webp;base64,…', w, h, …} }` biçiminde gömer.
- **Neden data URI?** `file://` ile açılan sayfada dış resim tuvali kirletir (tainted canvas) ve `render.mjs` kareleri okuyamaz. `index.html` oynatıcıyı `window.FILM_READY` çözülünce yükler.
- **Ön katman.** Ön plandaki kepçe ve kâse gibi nesneler araya giriyordu; ön katman yalnız fesleğene kırpıldı. Büyük ön plan nesnelerini metnin ya da karakterin önüne koyma.

## 7. Ses notası (`score(m)`, `shared/synth.js`)

- Film sesi `OfflineAudioContext` ile tek seferde hesaplanır.
- `m.` altındaki efektler:
  - `click`, `tick`, `blip`, `bell`
  - `boom`, `whoosh`, `riser`, `crackle`, `wind`, `rain`, `hum`, `staticNoise`, `glitch`, `buzz`, `wobble`
  - `pop`, `typeKey`, `hoof`, `heartbeat`, `fireIgnite`, `projector`
  - `pad(t,dur,notes)`
- Her sahneye bir pad akoru verilir ve vurgular `cue`'ya bağlanır:
  - büyüteç: whoosh
  - hüküm damgası: boom
  - öneri kartları: pop notaları
- Seslendirme `--anlatimsiz` ile miksin dışında kalır.

## 8. Render ve önizleme

```bash
npm install --prefix video        # playwright (Chromium /opt/pw-browsers'ta hazır; "playwright install" çalıştırma)
node video/render.mjs <bolum> --frames 12,45.5        # → video/out/preview/*.png (Read ile bak)
node video/render.mjs <bolum> --from 30 --to 60       # aralık
node video/render.mjs <bolum> --anlatimsiz --workers 4   # tam film; 9 dk ≈ 15–17 dk sürer
node video/araclar/duman.cjs video/<bolum>             # sahte tuvalle baştan sona çizim, JS hatası sayısı
```

- Oynatıcı `?kayit` (render kipi) ve `?anlatimsiz` seçeneklerini tanır.
- Klavye: boşluk oynatır, ← → 5 sn sarar, `f` tam ekran yapar.
- Uzun render'ı arka planda çalıştır. Durdurmak için PID'i öldür; `pkill -f` kendi kabuğunu da öldürür.
- `render.mjs` bayat `voice.js` ile durur. Önce `narrate.mjs` çalıştır.

## 9. Yerleşim dersleri (önizlemede kontrol et)

- Her sahnenin en kalabalık anından kare al. Taşan yazıya, birbirine binen damga ve karta, etiketi kapatan nesneye bak.
- Kartları geniş tut. Uzun Türkçe sözcükler beklenenden uzun çıkar.
- Doğrulanmamış bir sayıyı ekrana yazma. HUD'da "10.000 kare/sn" yerine "yüksek hızlı kamera" yazıldı.
- Videoda alt yazı bandı yok. Eski `captions()` tamamen kaldırıldı.
- Karakter kadrajın bir yanında, içerik kartları öbür yanındadır. Sağ alt köşe, YouTube'un bitiş ekranı ve süre etiketi için sade kalır.

## 10. Shorts (1080×1920)

`kisa/kisa.js` uzun bölümün filmini yükler ve seçilen anları dikey kadraja yakınlaşarak yeniden çizer. Görüntü videodan kırpılmadığı için vektör kadar keskindir. Her `kisa-*/film.js` yalnız bir çekim listesidir (an, kadraj, öbek). Kayıtlar `seslendirme/Kisa/`, YouTube bilgileri `kisa/youtube.txt` içinde.
