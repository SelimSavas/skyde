/*
 * Önsöz kısa videoları (YouTube Shorts, 1080×1920 dikey) için ortak motor.
 *
 * Kısa videolar bir kurs filminin (çoğunlukla Önsöz) görüntülerini kullanır, ama video dosyasından kırpmaz:
 * index.html kaynak filmi window.KAYNAK (ya da window.ONSOZ) olarak yükler, her çekim Önsöz'ün bir anını istenen bölgesine yakınlaşarak dikey kadraja
 * yeniden çizer. Böylece yakın plan da vektör kadar keskin kalır.
 *
 * Kısa video = seslendirme satırları. Her satır bir sahnedir; sahnenin çekimleri satırın öbeklerine
 * (cue) bağlanır: { k: öbek, src: (cue) => Önsöz anı, view: [x, y, genişlik], rate, crop }.
 *   view   Önsöz'ün 1920×1080 koordinatlarında kadraj merkezi ve görünen genişlik. Kadraj sabittir:
 *          hareketi Önsöz'ün kendi animasyonu taşır; çekimler arasında yumuşak geçiş (XF) yapılır,
 *          sert kesme ve yakınlaşma yoktur (göz yormasın).
 *   rate   Önsöz zamanının akış hızı (1 = gerçek hız).
 * Bir çekim kaynak film yerine kendi çizimini de taşıyabilir: { draw(ctx, t, { cue, end }) } (dikey için tasarlanmış sahne).
 * Son satır çağrıdır: videonun başka bölümlerinden iki sakin örnek (teaser) ve bitiş kartı (card, finale).
 * Altyazı, söylenen öbeğe göre sözcük sözcük yanar; *yıldızlı* sözcükler turuncu vurgulanır.
 */
(function (root) {
  'use strict';

  const E = root.Engine;
  const { clamp, ease, progress, vis, text, measure } = E;
  const SW = 1080;
  const SH = 1920;
  // Kaynak film isteğe bağlıdır: bütün çekimleri kendi çizimi olan kısa videolar onsuz çalışır
  const SRC = root.KAYNAK ?? root.ONSOZ ?? null;
  const scue = SRC ? SRC.narration.cue : () => { throw new Error('Kaynak film yüklenmemiş (window.KAYNAK ya da window.ONSOZ)'); };

  const C = {
    cream: '#f3ede1',
    muted: '#9aa3b8',
    fire: '#ffa547',
    ink: '#05070d',
  };

  // Videonun öbür bölümlerinden hızlı örnekler (çağrı satırında)
  const TEASERS = {
    mesaj: { label: 'Gece yarısı gönderilen mesaj', src: () => scue('night-send', 0) + 1.2, view: [1080, 430, 820] },
    isik: { label: 'Işık olup denizleri aşan ileti', src: () => scue('jr-fiber', 1), view: [925, 640, 1000], crop: [150, 1080] },
    kopru: { label: 'Malabadi Köprüsü', src: () => scue('br-forces', 1) + 1.2, view: [930, 500, 1000] },
    dunya: { label: 'İnsanlığın görünmez köprüsü', src: () => scue('inv-life', 3), view: [960, 600, 1100] },
    ekran: { label: 'Ekranın arkası', src: () => scue('who-side', 1) + 1.6, view: [975, 640, 960], crop: [260, 1080] },
    ahilik: { label: 'Çırak, kalfa, usta', src: () => scue('cr-ahi', 0) + 1.2, view: [960, 330, 720] },
  };
  // Bitiş kartının arkasındaki görüntü: iki telefonu birleştiren görünmez köprü
  const FINALE = { src: () => scue('st-bridge', 1) + 0.6, view: [960, 520, 1300] };
  const TEASER_LEN = 1.7; // her örnek ekranda bu kadar kalır
  const XF = 0.5; // çekimler arası yumuşak geçiş (sn)

  // ---------------------------------------------------------------------------
  // Önsöz'ü dikey kadraja çizmek
  // ---------------------------------------------------------------------------
  let DY = 1010; // kadraj merkezinin dikey konumu (üstte altyazıya yer kalsın); kısa video def.dy ile değiştirebilir
  const nativeSetTransform = CanvasRenderingContext2D.prototype.setTransform;

  // crop: Önsöz karesinin yalnızca [üst, alt] dikey aralığı çizilir (ör. bölüm başlığını dışarıda bırakmak için)
  function drawSource(ctx, ts, [x, y, w], crop = [0, 1080], alpha = 1) {
    if (alpha <= 0.002) return;
    const s = SW / w;
    const cx = w < 1920 ? clamp(x, w / 2, 1920 - w / 2) : 960;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(SW / 2, DY);
    ctx.scale(s, s);
    ctx.translate(-cx, -y);
    ctx.beginPath();
    ctx.rect(0, crop[0], 1920, crop[1] - crop[0]);
    ctx.clip();
    // Önsöz kendi çizimine dönüşümü sıfırlayarak başlar; sıfır noktası bu kadraj olsun
    const base = ctx.getTransform();
    ctx.setTransform = function (a, b, c, d, e, f) {
      nativeSetTransform.call(this, base);
      this.transform(a, b, c, d, e, f);
    };
    try {
      SRC.draw(ctx, clamp(ts, 0, SRC.duration - 1e-3));
    } finally {
      delete ctx.setTransform;
    }
    ctx.restore();
    // Önsöz karesinin üst ve alt kenarı arka plana yumuşakça karışsın
    const top = DY + (crop[0] - y) * s;
    const bottom = DY + (crop[1] - y) * s;
    const band = 170;
    if (top > -band) {
      const g = ctx.createLinearGradient(0, top, 0, top + band);
      g.addColorStop(0, 'rgba(5,7,13,1)');
      g.addColorStop(1, 'rgba(5,7,13,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, top - 1, SW, band + 1);
    }
    if (bottom < SH + band) {
      const g = ctx.createLinearGradient(0, bottom - band, 0, bottom);
      g.addColorStop(0, 'rgba(5,7,13,0)');
      g.addColorStop(1, 'rgba(5,7,13,1)');
      ctx.fillStyle = g;
      ctx.fillRect(0, bottom - band, SW, band + 1);
    }
  }

  function drawShot(ctx, shot, t) {
    if (shot.draw) {
      background(ctx);
      shot.draw(ctx, t, shot.api);
    } else {
      drawSource(ctx, shot.src0 + (t - shot.start) * (shot.rate ?? 1), shot.view, shot.crop);
    }
  }

  // Yeni çekim, öncekinin üstüne XF saniyede belirir. Önsöz kendi opaklığını sıfırladığı için
  // gelen çekim önce ayrı bir tuvale çizilip saydamlıkla bindirilir.
  let layer = null;
  function drawFootage(ctx, list, t) {
    let i = list.length - 1;
    while (i > 0 && t < list[i].start) i--;
    const cur = list[i];
    const p = i > 0 ? ease.inOut(clamp((t - cur.start) / XF)) : 1;
    if (p >= 1) return drawShot(ctx, cur, t);
    drawShot(ctx, list[i - 1], t);
    layer ??= Object.assign(document.createElement('canvas'), { width: SW, height: SH });
    const lc = layer.getContext('2d');
    lc.setTransform(1, 0, 0, 1, 0, 0);
    background(lc);
    drawShot(lc, cur, t);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Altyazı: sözcükler söylendikçe yanar
  // ---------------------------------------------------------------------------
  const CAP_Y = 400;
  const CAP_W = 930;
  const capFont = (size) => ({ size, family: 'display', weight: 700 });

  function captionWords(line) {
    const shown = line.show ?? line.say;
    const words = [];
    let em = false;
    shown.split('\n').forEach((part, r) => {
      part.split(/\s+/).filter(Boolean).forEach((raw, i) => {
        const starts = raw.startsWith('*');
        const ends = raw.endsWith('*') && raw.length > 1;
        if (starts) em = true;
        words.push({ str: raw.replace(/\*/g, ''), em, brk: r > 0 && i === 0 });
        if (ends) em = false;
      });
    });
    // her sözcüğün hangi öbekte olduğu, gösterilen metnin noktalamasından (say ile aynı öbek sayısı beklenir)
    let k = 0;
    let group = [];
    const close = () => {
      const total = group.reduce((n, w) => n + w.str.length + 1, 0);
      let before = 0;
      for (const w of group) {
        Object.assign(w, { k, frac: before / total });
        before += w.str.length + 1;
      }
      group = [];
      k++;
    };
    for (const w of words) {
      group.push(w);
      if (/[,;:.!?…—]$/.test(w.str)) close();
    }
    if (group.length) close();
    const n = E.phrases(line.say).length;
    words.forEach((w) => { if (w.k >= n) Object.assign(w, { k: n - 1, frac: 1 }); });
    return words;
  }

  const layoutCache = new Map();
  function layout(ctx, line, big) {
    const key = `${line.id}|${big}`;
    if (layoutCache.has(key)) return layoutCache.get(key);
    const words = captionWords(line);
    const maxW = big ? 1000 : CAP_W;
    const maxRows = big ? 2 : 3;
    let size = big ? 96 : 78;
    let rows;
    for (; size >= 54; size -= 4) {
      const space = measure(ctx, ' ', capFont(size));
      rows = [];
      let row = [];
      let width = 0;
      for (const w of words) {
        const ww = measure(ctx, w.str, capFont(size));
        if (row.length && (w.brk || width + space + ww > maxW)) {
          rows.push({ words: row, width });
          row = [];
          width = 0;
        }
        row.push({ ...w, w: ww, x: width + (row.length ? space : 0) });
        width += (row.length > 1 ? space : 0) + ww;
      }
      if (row.length) rows.push({ words: row, width });
      if (rows.length <= maxRows || size <= 54) break; // en küçük boyutta kalır (döngü boyutu bir adım fazla küçültmesin)
    }
    const out = { rows, size, lh: size * 1.16 };
    layoutCache.set(key, out);
    return out;
  }

  function caption(ctx, line, t, { cue, end, big, alpha }) {
    if (alpha <= 0.002) return;
    const L = layout(ctx, line, big);
    const top = CAP_Y - ((L.rows.length - 1) * L.lh) / 2;
    const nPh = E.phrases(line.say).length;
    L.rows.forEach((row, r) => {
      const x0 = SW / 2 - row.width / 2;
      const y = top + r * L.lh;
      for (const w of row.words) {
        const a = cue(line.id, w.k);
        const b = w.k + 1 < nPh ? cue(line.id, w.k + 1) : end(line.id);
        const at = a + w.frac * (b - a) * 0.9 - 0.05;
        const p = big ? 1 : ease.out(clamp((t - at) / 0.25));
        const lift = big ? 0 : (1 - p) * 4;
        text(ctx, w.str, x0 + w.x, y + lift, {
          ...capFont(L.size),
          align: 'left',
          color: w.em ? C.fire : C.cream,
          alpha: alpha * (0.3 + 0.7 * p),
          glow: 'rgba(0,0,0,0.85)',
          glowBlur: 22,
        });
      }
    });
  }

  // Dizinin adı, en üstte küçük
  function seriesTag(ctx) {
    text(ctx, 'BİLİŞİM TEKNOLOJİLERİ YETKİNLİĞİ', SW / 2, 168, { size: 24, weight: 600, spacing: 6, color: C.muted, alpha: 0.85 });
    ctx.fillStyle = C.fire;
    ctx.fillRect(SW / 2 - 22, 192, 44, 3);
  }

  function chip(ctx, label, a) {
    if (a <= 0.002) return;
    const y = 1440;
    const tag = 'VİDEODA';
    const f1 = { size: 22, weight: 700, spacing: 4 };
    const f2 = { size: 34, family: 'serif', italic: true };
    const w1 = measure(ctx, tag, f1) + 4;
    const w2 = measure(ctx, label, f2);
    const w = w1 + w2 + 28 + 56;
    const x = SW / 2 - w / 2;
    ctx.save();
    ctx.globalAlpha *= a;
    E.roundRect(ctx, x, y - 34, w, 68, 34);
    ctx.fillStyle = 'rgba(8,11,20,0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,165,71,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    text(ctx, tag, x + 28, y + 1, { ...f1, align: 'left', color: C.fire, alpha: a });
    text(ctx, label, x + 28 + w1 + 28, y + 2, { ...f2, align: 'left', color: C.cream, alpha: a });
  }

  const CARD = {
    kicker: 'TAMAMI KANALDA',
    title: ['Dijital Dünyayı', 'Anlamak'],
    sub: 'Bilişim Teknolojileri Yetkinliği · Giriş Bölümü',
    button: '▶  Videonun tamamını izle',
  };
  function endCard(ctx, a, card = CARD) {
    if (a <= 0.002) return;
    ctx.fillStyle = `rgba(5,7,13,${0.55 * a})`;
    ctx.fillRect(0, 0, SW, SH);
    const rise = (1 - a) * 30;
    text(ctx, card.kicker, SW / 2, 800 + rise, { size: 30, weight: 700, spacing: 10, color: C.fire, alpha: a });
    text(ctx, card.title[0], SW / 2, 915 + rise, { size: 104, family: 'display', weight: 700, color: C.cream, alpha: a, glow: 'rgba(0,0,0,0.8)', glowBlur: 26 });
    text(ctx, card.title[1], SW / 2, 1035 + rise, { size: 104, family: 'display', weight: 700, color: C.cream, alpha: a, glow: 'rgba(0,0,0,0.8)', glowBlur: 26 });
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = C.fire;
    ctx.fillRect(SW / 2 - 60, 1112 + rise, 120 * a, 4);
    ctx.restore();
    text(ctx, card.sub, SW / 2, 1172 + rise, { size: 32, family: 'serif', italic: true, color: C.muted, alpha: a });
    // Shorts'ta "ilgili video" bağlantısı başlığın hemen üstünde, sol altta görünür
    const pa = a;
    ctx.save();
    ctx.globalAlpha *= pa;
    E.roundRect(ctx, SW / 2 - 230, 1262 + rise, 460, 76, 38);
    ctx.fillStyle = C.fire;
    ctx.fill();
    ctx.restore();
    text(ctx, card.button, SW / 2, 1301 + rise, { size: 34, weight: 700, color: C.ink, alpha: pa });
  }

  function background(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, '#05070d');
    g.addColorStop(0.5, '#0a1020');
    g.addColorStop(1, '#05070d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SW, SH);
  }

  // Altyazının ve Shorts arayüzünün okunurluğu için üstte ve altta koyulaşma
  function shade(ctx) {
    let g = ctx.createLinearGradient(0, 0, 0, 760);
    g.addColorStop(0, 'rgba(5,7,13,0.92)');
    g.addColorStop(0.55, 'rgba(5,7,13,0.6)');
    g.addColorStop(1, 'rgba(5,7,13,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SW, 760);
    g = ctx.createLinearGradient(0, 1480, 0, SH);
    g.addColorStop(0, 'rgba(5,7,13,0)');
    g.addColorStop(1, 'rgba(5,7,13,0.75)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 1480, SW, SH - 1480);
  }

  // ---------------------------------------------------------------------------
  // Kısa video
  // ---------------------------------------------------------------------------
  const BREATH = 0.3;
  const SOUND_KEYS = new Set(['click', 'tick', 'blip', 'bell', 'boom', 'whoosh', 'pop', 'typeKey', 'glitch', 'buzz', 'staticNoise', 'heartbeat']);

  function short(def) {
    DY = def.dy ?? 1010;
    const SCRIPT = root.NARRATION ?? { lines: [] };
    const lines = SCRIPT.lines;
    const ctaId = lines[lines.length - 1].id;
    const teasers = (def.teaser ?? []).map((k) => {
      if (!TEASERS[k]) throw new Error(`Bilinmeyen örnek: ${k}`);
      return TEASERS[k];
    });
    const BEATS = {};
    const SCENES = lines.map((l) => {
      l.beat = l.id;
      l.offset = l.offset ?? (l === lines[0] ? 0.08 : 0.12);
      // sahne en az bu kadar sürer; anlatıcı daha uzun konuşursa narration planı sahneyi uzatır
      let base = l.offset + 1 + (def.extra?.[l.id] ?? 0) + BREATH;
      if (l.id === ctaId) base = teasers.length * TEASER_LEN + 2.8;
      BEATS[l.id] = [l.id, 0, base, base - 0.25];
      return { id: l.id, title: l.say, base, fadeIn: 0, fadeOut: 0, draw: (ctx, lt, t) => drawLine(l, ctx, t) };
    });
    const build = (holds, slow) => E.timeline(SCENES.map((sc) => ({
      ...sc,
      stretch: slow[sc.id] ? [[0, sc.base, slow[sc.id]]] : [],
      holds: holds[sc.id] > 0 ? [[BEATS[sc.id][3], holds[sc.id]]] : [],
    })));
    const VOICE = E.narration({ build, beats: BEATS, lines, voice: root.VOICE, pauses: def.pause ?? {}, breath: BREATH, gap: 0.3 });
    const TL = VOICE.timeline;
    const { cue, end } = VOICE;

    // Çekimleri gerçek zamana yerleştir
    const SHOTS = {};
    for (const l of lines) {
      const sc = TL.scene(l.id);
      let list;
      if (l.id === ctaId) {
        list = teasers.map((tz, i) => ({ ...tz, start: sc.start + i * TEASER_LEN }));
        list.push({ ...(def.finale ?? FINALE), finale: true, start: sc.start + teasers.length * TEASER_LEN });
      } else {
        list = (def.shots[l.id] ?? []).map((s) => ({ ...s, start: s.k ? cue(l.id, s.k) - 0.12 : sc.start }));
      }
      if (!list.length) throw new Error(`${l.id}: çekim yok`);
      list.forEach((s, i) => {
        s.end = i + 1 < list.length ? list[i + 1].start : sc.end;
        s.src0 = s.src ? s.src(scue) : 0;
        s.api = { cue, end, start: s.start };
      });
      SHOTS[l.id] = list;
    }
    const ALL = lines.flatMap((l) => SHOTS[l.id]);

    function drawLine(l, ctx, t) {
      const list = SHOTS[l.id];
      const shot = [...list].reverse().find((s) => t >= s.start) ?? list[0];
      drawFootage(ctx, ALL, t);
      shade(ctx);
      seriesTag(ctx);
      // kısa videoya özgü sabit katman (ör. durak göstergesi)
      if (def.overlay) def.overlay(ctx, t, { cue, end, line: l, scene: TL.scene(l.id) });
      const sc = TL.scene(l.id);
      const first = l === lines[0];
      caption(ctx, l, t, { cue, end, big: first, alpha: first ? 1 : progress(t, sc.start, sc.start + 0.3, ease.inOut) });
      if (l.id === ctaId) {
        if (shot.label) chip(ctx, shot.label, vis(t, shot.start, shot.end, 0.4, 0.4));
        const fin = list[list.length - 1];
        endCard(ctx, progress(t, fin.start, fin.start + 0.8, ease.inOut), { ...CARD, ...def.card });
      }
    }

    // Önsöz'ün efektleri: çekimlerde görünen anlara düşenler aynen taşınır
    const borrowed = [];
    if (SRC) SRC.score(new Proxy({}, { get: (_, key) => (...args) => { borrowed.push([key, args]); } }), root.Synth.hz);

    function score(m, hz) {
      const dur = TL.duration;
      m.pad(0, dur, def.pad ?? ['D2', 'A2', 'D3', 'F#3'], { gain: 0.2, attack: 0.25, release: 1.2, cutoff: 900 });
      m.boom(0.02, { gain: 0.3 });
      const all = Object.values(SHOTS).flat();
      for (const s of all) {
        if (s.start > 0.05) m.whoosh(s.start - 0.1, { dur: 1, from: 300, to: 900, gain: 0.018 });
        if (s.sound) s.sound(m, hz, s);
        if (s.label || s.finale || s.draw) continue;
        const rate = s.rate ?? 1;
        const a = s.src0;
        const b = s.src0 + (s.end - s.start) * rate;
        for (const [key, args] of borrowed) {
          const ts = args[0];
          if (!SOUND_KEYS.has(key) || ts < a || ts >= b) continue;
          const o = args[1] && typeof args[1] === 'object' ? { ...args[1], gain: (args[1].gain ?? 0.2) * 0.85 } : args[1];
          m[key](s.start + (ts - a) / rate, o, ...args.slice(2));
        }
      }
      // bitiş kartında çan
      const cta = SHOTS[ctaId];
      const fin = cta[cta.length - 1];
      m.boom(fin.start, { gain: 0.2 });
      ['D5', 'A5', 'D6'].forEach((n, i) => m.bell(fin.start + 0.05 + i * 0.16, { freq: hz(n), gain: 0.08, decay: 2.6, pan: -0.3 + i * 0.3 }));
    }

    return E.film({
      title: def.title,
      width: SW,
      height: SH,
      fade: 0,
      timeline: TL,
      background,
      score,
      narration: VOICE,
      voice: VOICE.voice,
      shots: SHOTS,
    });
  }

  root.Kisa = { short, TEASERS, SW, SH, C };
})(window);
