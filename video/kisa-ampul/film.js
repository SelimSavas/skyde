/*
 * YUP Akademi · Lup · Vücudun Gizli Ayarları kısa video (1080×1920) — Ampule bakınca gelen renkli leke
 *
 * Ardıl görüntü: parlak ışık koni hücrelerinin boyasını soldurur, toparlanırken leke renkten renge geçer;
 * gözkapağı kapalıyken görülen kırmızılık kapaktaki kandan (mavi ve yeşil yutulur, kırmızı geçer).
 * Doruk: izleyiciye deney yaptırılır. Ters renkli Lup (Lab'de renk ekseni ters, parlaklık aynı) ve camında odak noktası;
 * 10 sn geri sayımdan sonra sert kesmeyle aynı yerde gri Lup gelir, izleyici onu renkli görür (parcala.py → yanilsama).
 * Deney ekranında yazı yok, kenar karartması yok, zemin düz nötr gri (renk kayması olmasın).
 *
 * Tipografi "göz muayenesi" (yazi.js): başlıklar Atkinson Hyperlegible Next (az gören okurlar için tasarlandı),
 * göz muayene panosu gibi satır satır küçülür; her satırın yanında görme keskinliği değeri, altta kırmızı-yeşil şerit.
 * Satır belirirken arkasında karşıt renkte solan bir "ardıl iz" bırakır. El yazısı notlar Kalam (Lup'un el yazısı).
 * Sahneler: kırmızı perde ve leke · yorulan koniler · gözkapağından geçen ışık · deney · gri Lup · gönder.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const L = window.YupEl;
  const LUP = window.YupLup;
  const { P, ink, paper, tape, finish, swash } = L;
  const TAU = Math.PI * 2;
  const INK = P.ink;
  const AT = '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", Arial, sans-serif';
  const KA = 'Kalam, "Patrick Hand", cursive';
  const NEUTRAL = '#b8b8b8';

  // ---------------------------------------------------------------------------
  // Görseller
  // ---------------------------------------------------------------------------
  const A = window.ASSETS ?? {};
  const IMG = {};
  const loads = [];
  for (const [k, v] of Object.entries(A)) {
    const im = new Image();
    im.src = v.src;
    IMG[k] = im;
    loads.push(im.decode ? im.decode().catch(() => {}) : Promise.resolve());
  }
  window.FILM_READY = Promise.all([window.FILM_READY, window.EL_FONTS_READY, window.GOZ_FONTS_READY, ...loads]);

  function pic(ctx, k, x, y, w, { ax = 0.5, ay = 0.5, rot = 0, a = 1, flip = false, sx = 1, sy = 1, filter = null } = {}) {
    const g = A[k];
    if (!g || a <= 0.002 || w <= 0.5) return;
    const h = (w * g.h) / g.w;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale((flip ? -1 : 1) * sx, sy);
    if (filter) ctx.filter = filter;
    ctx.drawImage(IMG[k], -ax * w, -ay * h, w, h);
    ctx.restore();
  }
  // Arka plan: s ölçeğiyle, görseldeki (px, py) noktası kadrajda (x, y)'ye gelecek biçimde
  function bg(ctx, k, { s = 1.25, px = null, py = null, x = 540, y = 960, dim = 0 } = {}) {
    const g = A[k];
    const ox = px == null ? 540 - (g.w * s) / 2 : x - px * s;
    const oy = py == null ? 960 - (g.h * s) / 2 : y - py * s;
    ctx.drawImage(IMG[k], ox, oy, g.w * s, g.h * s);
    if (dim) {
      ctx.fillStyle = `rgba(10,8,6,${dim})`;
      ctx.fillRect(0, 0, 1080, 1920);
    }
  }

  // ---------------------------------------------------------------------------
  // Tipografi: göz muayene panosu
  // ---------------------------------------------------------------------------
  // rows: [{ s, size, mark, at, c }] (at: satırın belirdiği an; yoksa hep görünür)
  function chart(ctx, rows, y, t, { a = 1, w = 900, labels = ['0,1', '0,3', '0,5', '0,8'], duo = true, x = 540 } = {}) {
    if (a <= 0.002) return;
    const pad = 46;
    let h = pad * 0.8;
    rows.forEach((r) => (h += r.size * 1.08));
    h += pad * 0.6 + (duo ? 18 : 0);
    const top = y;
    ctx.save();
    ctx.globalAlpha *= a;
    // ışık kutusu: sıcak beyaz, ince çerçeve, gölge
    ctx.shadowColor = 'rgba(10,6,4,0.4)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#2b2620';
    ctx.beginPath();
    ctx.roundRect(x - w / 2 - 10, top - 10, w + 20, h + 20, 14);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    const g = ctx.createRadialGradient(x, top + h / 2, 40, x, top + h / 2, w * 0.7);
    g.addColorStop(0, '#fbfaf5');
    g.addColorStop(1, '#ebe6da');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, top, w, h, 8);
    ctx.fill();
    // kırmızı-yeşil şerit (göz muayenesindeki renk testi)
    if (duo) {
      ctx.fillStyle = '#c8352c';
      ctx.fillRect(x - w / 2, top + h - 18, w / 2, 18);
      ctx.fillStyle = '#2f8a4c';
      ctx.fillRect(x, top + h - 18, w / 2, 18);
    }
    let yy = top + pad * 0.8;
    rows.forEach((r, i) => {
      yy += r.size * 0.92;
      const ap = r.at == null ? 1 : progress(t, r.at, r.at + 0.25, ease.out);
      if (ap > 0) {
        let size = r.size;
        ctx.font = `800 ${size}px ${AT}`;
        ctx.letterSpacing = `${Math.round(size * 0.08)}px`;
        let tw = ctx.measureText(r.s).width;
        if (tw > w - 150) {
          size *= (w - 150) / tw;
          ctx.font = `800 ${size}px ${AT}`;
          ctx.letterSpacing = `${Math.round(size * 0.08)}px`;
          tw = ctx.measureText(r.s).width;
        }
        const x0 = x - tw / 2;
        if (r.mark) swash(ctx, x0 - 10, yy - size * 0.42, tw + 16, size * 0.5, r.mark, r.markProg ?? 1, 30 + i);
        // ardıl iz: karşıt renkte, kayık, solan kopya
        const gk = r.at == null ? 0 : 0.55 * (1 - progress(t, r.at + 0.1, r.at + 1.1));
        if (gk > 0.01) {
          ctx.globalAlpha = a * gk;
          ctx.fillStyle = '#4fd2dc';
          ctx.fillText(r.s, x0 + size * 0.07, yy + size * 0.06);
        }
        ctx.globalAlpha = a * ap;
        ctx.fillStyle = r.c ?? '#16120e';
        ctx.fillText(r.s, x0, yy + (1 - ap) * 12);
        ctx.letterSpacing = '0px';
        ctx.font = `400 22px ${AT}`;
        ctx.fillStyle = 'rgba(40,32,24,0.5)';
        ctx.fillText(labels[i] ?? '', x + w / 2 - 62, yy - r.size * 0.3);
        ctx.fillText(String(i + 1), x - w / 2 + 26, yy - r.size * 0.3);
        ctx.globalAlpha = a;
      }
      yy += r.size * 0.16;
    });
    ctx.restore();
    return top + h;
  }

  // Kalam el yazısı not
  function note(ctx, str, x, y, { size = 50, col = INK, rot = -0.03, a = 1, prog = 1, align = 'left', card = false } = {}) {
    if (a <= 0.002 || prog <= 0) return 0;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `700 ${size}px ${KA}`;
    const w = ctx.measureText(str).width;
    const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
    if (card) {
      ctx.save();
      ctx.shadowColor = 'rgba(30,18,10,0.3)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fbf6ea';
      ctx.fillRect(x0 - size * 0.35, -size * 0.95, w + size * 0.7, size * 1.4);
      ctx.restore();
    }
    if (prog < 1) {
      ctx.beginPath();
      ctx.rect(x0 - 10, -size * 1.3, (w + 20) * prog, size * 2);
      ctx.clip();
    }
    ctx.fillStyle = col;
    ctx.fillText(str, x0, 0);
    ctx.restore();
    return w;
  }

  function tag(ctx, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(246,239,225,0.92)';
    ctx.beginPath();
    ctx.roundRect(60, 160, 470, 96, 16);
    ctx.fill();
    K.appIcon(ctx, 104, 206, 62);
    ctx.fillStyle = INK;
    ctx.font = `800 25px ${AT}`;
    ctx.letterSpacing = '2px';
    ctx.fillText('VÜCUDUN GİZLİ AYARLARI', 152, 202);
    ctx.font = `400 20px ${AT}`;
    ctx.fillStyle = 'rgba(42,28,20,0.66)';
    ctx.fillText('YUP AKADEMİ · LUP', 152, 233);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Çizim parçaları
  // ---------------------------------------------------------------------------
  const W = (api, id, i) => api.cue(id, 0) + (window.DUDAK?.[id]?.[i]?.[0] ?? i * 0.4);
  function lup(ctx, t, api, id, x, y, h, st = {}) {
    LUP.draw(ctx, x, y, h, { talk: LUP.say(api, id, t), ...st }, t);
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  // Ampulün ışıltısı (koyu odada 'lighter')
  function glow(ctx, x, y, r, k, col = '#ffc766') {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(col, 0.55 * k));
    g.addColorStop(0.35, hexA(col, 0.2 * k));
    g.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
  }
  // Ardıl leke: yumuşak kenarlı, renk değiştiren damla (ampul biçimine yakın)
  function blot(ctx, x, y, rx, ry, col, a = 1, t = 0) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + Math.sin(t * 1.3) * 6, y + Math.cos(t * 1.1) * 5);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    g.addColorStop(0, hexA(col, 0.95));
    g.addColorStop(0.55, hexA(col, 0.7));
    g.addColorStop(1, hexA(col, 0));
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(rx, ry), 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  // Renk geçişi: [[t, '#hex'], ...] arasında
  function colAt(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const k = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        const a = parseInt(keys[i - 1][1].slice(1), 16);
        const b = parseInt(keys[i][1].slice(1), 16);
        const ch = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, k));
        return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('');
      }
    }
    return keys[keys.length - 1][1];
  }
  // Kırmızı perde: gözü kapalıyken görülen kızıl ışık (kenarlar koyu, ışığın olduğu yer turuncu)
  function eyelidView(ctx, k, cx, cy) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = k;
    const g = ctx.createRadialGradient(cx, cy, 30, cx, cy, 1300);
    g.addColorStop(0, '#ff8a3c');
    g.addColorStop(0.18, '#e0472a');
    g.addColorStop(0.55, '#8e1a16');
    g.addColorStop(1, '#2a0606');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
  }
  // Işın: (x1,y1)'den (x2,y2)'ye renkli, yumuşak ışık şeridi
  function beam(ctx, x1, y1, x2, y2, col, k, w = 46) {
    if (k <= 0.01) return;
    const x = lerp(x1, x2, k);
    const y = lerp(y1, y2, k);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const [lw, al] of [[w * 1.8, 0.12], [w, 0.28], [w * 0.35, 0.7]]) {
      ctx.strokeStyle = hexA(col, al);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  function plane(ctx, x, y, s, rot, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ink(ctx, [[-50, 0], [50, -26], [14, 30]], { fill: '#fffaf0', seed: 270, t, width: 5, off: [3, 3] });
    ink(ctx, [[50, -26], [-6, 14], [0, 40]], { fill: '#e9e0cf', seed: 271, t, width: 5, off: [2, 2] });
    ctx.restore();
  }

  // Oda: ampul kadrajda (540, BY)
  const BULB = [512, 792]; // arka plan görselinde ampulün camı
  function room(ctx, t, { s = 1.25, by = 990, dim = 0, k = 1 } = {}) {
    bg(ctx, 'oda', { s, px: BULB[0], py: BULB[1], x: 540, y: by, dim });
    const fl = 0.92 + 0.08 * Math.sin(t * 7) * Math.sin(t * 2.3);
    glow(ctx, 540, by, 260 * s, 0.75 * k * fl);
    glow(ctx, 540, by, 90 * s, 0.6 * k * fl, '#fff1c8');
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};

  // 1 · Kanca: Arkadaşın ampule bakar, gözünü kapatır; ekran kızarır, ortada renkli leke yüzer
  draw['a-hook'] = function (ctx, t, api) {
    const id = 'a-hook';
    const s0 = api.S0(id);
    const closeT = W(api, id, 3); // kapatınca
    const notT = W(api, id, 10); // ampulden gelmiyor
    const youT = W(api, id, 12); // senin gözünden
    const shut = t >= closeT;
    const AW = 700;
    const inner = (c) => {
      room(c, t);
      pic(c, shut ? 'ark_kapali' : 'ark_bakis', 400, 1940, shut ? AW * (558 / 626) : AW, { ax: 0.5, ay: 1 });
    };
    const p = LUP.intro(ctx, t, s0, inner, { cx: 540, cy: 1000, r0: 380 });
    // göz kapalı: kızıl perde ve ampulün ardıl lekesi
    const vk = progress(t, closeT, closeT + 0.25) * (1 - progress(t, notT - 0.1, notT + 0.4));
    if (vk > 0) {
      eyelidView(ctx, 0.93 * vk, 540, 990);
      const lt = t - closeT;
      const col = colAt(lt, [[0, '#fff6d2'], [0.6, '#ffe27a'], [1.3, '#5fd6c8'], [2.1, '#3f7be0'], [2.8, '#c04fd8']]);
      blot(ctx, 540, 990, 95, 140, col, vk, t);
    }
    // Lup: önce ampule bakar, "senin gözünden"de gözünü ovuşturur
    if (t > notT - 0.1) {
      const hp = LUP.hop(t, notT - 0.1, { from: 260 });
      pic(ctx, t > youT ? 'poz_ovus' : 'poz_siper', 860, 1890 + hp.dy, 300, { ax: 0.5, ay: 1, a: hp.a });
    }
    chart(ctx, [
      { s: 'BU LEKE', size: 116 },
      { s: 'AMPULDEN DEĞİL,', size: 74 },
      { s: 'GÖZÜNDEN.', size: 62, mark: P.marker, markProg: progress(t, youT, youT + 0.4) },
    ], 300, t);
    tag(ctx, progress(t, s0 + 1.0, s0 + 1.3) * (p >= 1 ? 1 : 0));
    finish(ctx, t, { vig: 0.2 });
  };

  // 2 · Gözün içi: ışık konileri yorar, toparlanırken leke renk değiştirir
  draw['a-solma'] = function (ctx, t, api) {
    const id = 'a-solma';
    const s0 = api.S0(id);
    const lightT = W(api, id, 0);
    const tiredT = W(api, id, 6); // yoruyor
    const backT = W(api, id, 8); // toparlanırken
    const orT = W(api, id, 13); // turuncu
    const purT = W(api, id, 15); // mor
    const grT = W(api, id, 17); // yeşil
    bg(ctx, 'gozici', { s: 1.25 });
    // göz bebeğinden giren ışık parçacıkları konilere iner
    const lk = progress(t, lightT, lightT + 0.4) * (1 - 0.7 * progress(t, tiredT, tiredT + 0.5));
    if (lk > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const u = (t * 0.55 + hash(i, 3)) % 1;
        const tx = 300 + hash(i, 4) * 480;
        const x = lerp(280, tx, u);
        const y = lerp(250, 1080, u);
        ctx.fillStyle = `rgba(255,236,170,${0.75 * lk * Math.sin(Math.PI * u)})`;
        ctx.beginPath();
        ctx.arc(x, y, 7 + hash(i, 5) * 6, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    // koniler: mutlu → yorgun → tek tek toparlanır (mavi, yeşil, kırmızı)
    const cones = [['k', 330, orT], ['y', 540, purT], ['m', 750, grT]];
    cones.forEach(([c, x, rec], i) => {
      const tire = progress(t, tiredT - 0.05, tiredT + 0.3);
      const back = progress(t, rec - 0.15, rec + 0.35);
      const tk = tire * (1 - back);
      const bob = Math.sin(t * 3 + i) * 6 * (1 - tk);
      const sag = tk * 10;
      pic(ctx, 'koni_' + c, x, 1340 + bob, 168, { ax: 0.5, ay: 1, a: 1 - tk });
      pic(ctx, 'koniy_' + c, x, 1340 + sag, 175, { ax: 0.5, ay: 1, a: tk });
      if (back > 0 && back < 1) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(255,220,150,${0.22 * Math.sin(Math.PI * back)})`;
        ctx.beginPath();
        ctx.arc(x, 1180, 110, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });
    if (t > tiredT && t < backT + 0.6) {
      const za = progress(t, tiredT, tiredT + 0.3) * (1 - progress(t, backT + 0.2, backT + 0.6));
      for (let i = 0; i < 3; i++) {
        const u = (t * 0.6 + i / 3) % 1;
        note(ctx, 'z', 640 + i * 30 + u * 40, 800 - u * 140, { size: 46 + i * 8, col: 'rgba(60,40,90,0.85)', a: za * Math.sin(Math.PI * u), rot: -0.2 });
      }
    }
    // ardıl leke: koniler toparlanırken turuncu → mor → yeşil
    const bk = progress(t, backT - 0.1, backT + 0.4);
    if (bk > 0) {
      const col = colAt(t, [[backT, '#fff3d0'], [orT - 0.1, '#ffd9a0'], [orT + 0.2, '#ff8a2a'], [purT - 0.1, '#ff8a2a'], [purT + 0.2, '#a24fd8'], [grT - 0.1, '#a24fd8'], [grT + 0.2, '#43c06a']]);
      blot(ctx, 540, 720, 110, 150, col, bk * 0.95, t);
      const words = [[orT, 'turuncu', '#c85a10'], [purT, 'mor', '#7a2fb0'], [grT, 'yeşil', '#1f8a45']];
      for (const [w0, s, c] of words) {
        if (t > w0 - 0.05) note(ctx, s, 720, 680 + (w0 === purT ? 75 : w0 === grT ? 150 : 0), { size: 44, col: c, rot: -0.05, prog: progress(t, w0 - 0.05, w0 + 0.3), card: true });
      }
    }
    lup(ctx, t, api, id, 150, 1885, 320, { face: t > tiredT && t < backT ? 'endise' : 'merak', arms: 'anlat', gx: 0.8, gy: -0.6 });
    chart(ctx, [
      { s: 'HÜCRELER', size: 104, at: s0 + 0.15 },
      { s: 'YORULUYOR.', size: 76, at: s0 + 0.45, mark: P.markerRed, markProg: progress(t, tiredT, tiredT + 0.4) },
    ], 330, t, { labels: ['0,2', '0,4'] });
    finish(ctx, t, { vig: 0.18 });
  };

  // 3 · Kırmızı perde: ampulün ışığı gözkapağına vurur; mavi ve yeşil yutulur, kırmızı geçer
  draw['a-kapak'] = function (ctx, t, api) {
    const id = 'a-kapak';
    const s0 = api.S0(id);
    const lidT = W(api, id, 5); // göz kapağın
    const bloodT = W(api, id, 8); // kan
    const blueT = W(api, id, 10); // mavisini
    const greenT = W(api, id, 11); // yeşilini
    const redT = W(api, id, 14); // kırmızısı
    const BY = 720;
    room(ctx, t, { s: 1.85, by: BY, dim: 0.35 });
    // kapalı göz (yakın plan)
    const EX = 540;
    const EYc = 1400;
    const EW = 640;
    pic(ctx, 'goz_kapak', EX, EYc, EW);
    const lidTop = EYc - 70;
    // kızıllık: başta var (soru), "kan"da söner, "kırmızısı"nda geri gelir
    const red = (1 - progress(t, bloodT - 0.3, bloodT)) * progress(t, s0, s0 + 0.5) + progress(t, redT, redT + 0.5);
    if (red > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.75 * clamp(red);
      const g = ctx.createRadialGradient(EX, EYc - 40, 40, EX, EYc, EW * 0.55);
      g.addColorStop(0, '#ff6a3a');
      g.addColorStop(1, '#b0261a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(EX - EW / 2 + 16, EYc - (EW * 325) / 402 / 2 + 16, EW - 32, (EW * 325) / 402 - 32, 40);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 * clamp(red);
      const g2 = ctx.createRadialGradient(EX, EYc, 20, EX, EYc, EW * 0.5);
      g2.addColorStop(0, 'rgba(255,90,50,0.9)');
      g2.addColorStop(1, 'rgba(255,40,20,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(EX - EW / 2, EYc - EW / 2, EW, EW);
      ctx.restore();
    }
    // üç ışın: ampulden göz kapağına
    const go = progress(t, bloodT + 0.2, bloodT + 0.8, ease.out);
    const rays = [['#4f8cff', -150, blueT], ['#46d16a', 0, greenT], ['#ff4a35', 150, redT]];
    for (const [col, dx, t1] of rays) {
      const isRed = col === '#ff4a35';
      const stop = isRed ? 1 : 1 - progress(t, t1 + 0.1, t1 + 0.5);
      if (go <= 0) continue;
      beam(ctx, 540 + dx * 0.15, BY + 70, EX + dx, lidTop, col, go * Math.max(stop, 0.0001), 44);
      if (!isRed && t > t1) {
        // yutuldu: kapakta sönen küçük parıltı
        const pk = progress(t, t1, t1 + 0.5);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = hexA(col, 0.6 * (1 - pk));
        ctx.beginPath();
        ctx.arc(EX + dx, lidTop, 20 + 50 * pk, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      if (isRed && t > t1) {
        const pk = progress(t, t1, t1 + 0.6, ease.out);
        beam(ctx, EX + dx, lidTop, EX + dx * 0.4, EYc + 260, col, pk, 40);
      }
    }
    if (t > bloodT) note(ctx, 'kan', EX - 280, EYc + 210, { size: 54, col: '#8e1a16', rot: -0.05, prog: progress(t, bloodT, bloodT + 0.4) });
    if (t > blueT) note(ctx, 'yutuldu', EX - 310, EYc - 285, { size: 42, col: '#a9c6ff', rot: -0.06, prog: progress(t, blueT + 0.1, blueT + 0.5) });
    if (t > redT) note(ctx, 'geçti', EX + 120, EYc + 330, { size: 46, col: '#ffb3a6', rot: -0.04, prog: progress(t, redT + 0.3, redT + 0.7) });
    if (t > lidT - 0.1) {
      const hp = LUP.hop(t, lidT - 0.1, { from: 240 });
      pic(ctx, 'poz_kapali', 945, 1895 + hp.dy, 250, { ax: 0.5, ay: 1, a: hp.a });
    }
    chart(ctx, [
      { s: 'KIRMIZI PERDE:', size: 92, at: s0 + 0.15 },
      { s: 'GÖZ KAPAĞIN.', size: 72, at: s0 + 0.45, mark: P.markerRed, markProg: progress(t, lidT, lidT + 0.4) },
    ], 300, t, { labels: ['0,3', '0,5'], w: 900 });
    tag(ctx);
    finish(ctx, t, { vig: 0.2 });
  };

  // 4–5 · Deney: ters renkli Lup (odak noktası camında), 10 sn sayım; sonra aynı yerde gri Lup
  const LH = 1300; // Lup'un boyu (px)
  const FIX = [540, 800]; // odak noktası
  function expLup(ctx, key) {
    const g = A[key];
    const w = (LH * g.w) / g.h;
    const x = FIX[0] - g.fx * w;
    const y = FIX[1] - g.fy * LH;
    ctx.drawImage(IMG[key], x, y, w, LH);
  }
  function fixDot(ctx, n, ring, a = 1, pulse = 0) {
    const [x, y] = FIX;
    ctx.save();
    ctx.globalAlpha *= a;
    const r = 26 * (1 + 0.25 * pulse);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#1b1b1b';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (ring > 0) {
      ctx.strokeStyle = '#1b1b1b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, r + 14, -Math.PI / 2, -Math.PI / 2 + TAU * ring);
      ctx.stroke();
    }
    if (n) {
      ctx.fillStyle = '#1b1b1b';
      ctx.font = `800 30px ${AT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), x, y + 2);
    } else {
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
  const countStart = (api) => W(api, 'a-dene', 6); // "On saniye"
  draw['a-dene'] = function (ctx, t, api) {
    const id = 'a-dene';
    const s0 = api.S0(id);
    const dotT = W(api, id, 4); // noktaya
    const c0 = countStart(api);
    ctx.fillStyle = NEUTRAL;
    ctx.fillRect(0, 0, 1080, 1920);
    expLup(ctx, 'lup_ters');
    const left = 10 - (t - c0);
    const n = t < c0 ? 0 : Math.max(1, Math.ceil(left));
    const ring = t < c0 ? 0 : clamp(left / 10);
    const pulse = t < dotT + 0.6 ? Math.max(0, Math.sin((t - s0) * 7)) * (1 - progress(t, dotT, dotT + 0.6)) : 0;
    fixDot(ctx, n, ring, progress(t, s0, s0 + 0.3), pulse);
  };
  draw['a-bak'] = function (ctx, t, api) {
    ctx.fillStyle = NEUTRAL;
    ctx.fillRect(0, 0, 1080, 1920);
    expLup(ctx, 'lup_gri');
    fixDot(ctx, 0, 0);
  };

  // 6 · Arkadaşına gönder ve "Lup'la bak"
  draw['a-cta'] = function (ctx, t, api) {
    const id = 'a-cta';
    const { S0, end, fadeIn, pop } = api;
    const s0 = S0(id);
    const c1 = api.cue(id, 1);
    paper(ctx, t, { stains: [[120, 1760, 110, 91]] });
    chart(ctx, [
      { s: '"GÖZÜM KANMAZ"', size: 70, at: s0 + 0.1 },
      { s: 'DİYEN ARKADAŞINA', size: 56, at: s0 + 0.3 },
      { s: 'GÖNDER.', size: 84, at: s0 + 0.5, mark: P.marker, markProg: progress(t, s0 + 0.7, s0 + 1.1) },
    ], 300, t, { labels: ['0,2', '0,4', '0,1'], w: 600, x: 340, duo: false });
    // fotoğraf: ampullü oda, Arkadaşın gözleri kapalı
    const pa = pop(t, s0 + 0.15, 0.5);
    if (pa > 0) {
      ctx.save();
      ctx.translate(820, 640);
      ctx.rotate(0.07);
      ctx.scale(pa, pa);
      ctx.shadowColor = 'rgba(60,40,20,0.28)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#fffdf7';
      ctx.fillRect(-150, -200, 300, 400);
      ctx.shadowColor = 'transparent';
      ctx.save();
      ctx.beginPath();
      ctx.rect(-126, -176, 252, 300);
      ctx.clip();
      ctx.drawImage(IMG.oda, 252, 560, 520, 620, -126, -176, 252, 300);
      pic(ctx, 'ark_kapali', 0, 128, 230, { ax: 0.5, ay: 1 });
      ctx.restore();
      note(ctx, 'ampul deneyi', 0, 172, { size: 34, col: 'rgba(42,28,20,0.7)', align: 'center', rot: -0.02 });
      tape(ctx, 0, -202, 130, -0.05);
      ctx.restore();
    }
    const tap = end(id) + 0.35;
    const throwK = progress(t, s0 + 0.7, s0 + 1.0, ease.inOut);
    const back = progress(t, s0 + 1.3, s0 + 1.7, ease.inOut);
    const reach = progress(t, tap - 0.7, tap - 0.08, ease.inOut);
    const throwPose = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.2, y: -1.25, el: 'acik', d: [0.2, -1] } };
    const windUp = { l: { x: -1.4, y: 1.62, el: 'acik', d: [-0.3, 1] }, r: { x: 1.9, y: 0.6, el: 'yumruk', d: [1, 0.3] } };
    const tapPose = { l: { x: -2.15, y: 0.95, el: 'isaret', d: [-1, 0.2] }, r: { x: 1.4, y: 1.62, el: 'acik', d: [0.3, 1] } };
    let arms = LUP.mix(windUp, throwPose, throwK);
    if (back > 0) arms = LUP.mix(throwPose, 'anlat', back);
    if (reach > 0) arms = LUP.mix('anlat', tapPose, reach);
    const done = t > tap;
    lup(ctx, t, api, id, 860, 1830, 560, {
      ...LUP.hop(t, s0 + 0.05, { from: 300 }),
      face: done ? 'mutlu' : t > c1 ? 'gulum' : 'merak',
      gx: reach > 0 ? -0.9 : -0.3,
      gy: reach > 0 ? 0.4 : -0.6,
      arms,
    });
    const fly = progress(t, s0 + 1.0, s0 + 1.55, ease.inOut);
    if (fly > 0) {
      const path = [];
      for (let i = 0; i <= 30; i++) {
        const u = i / 30;
        path.push([lerp(930, 820, u) + Math.sin(Math.PI * u) * 150, lerp(1180, 700, u) - Math.sin(Math.PI * u) * 80]);
      }
      const n = Math.max(2, Math.floor(path.length * fly));
      for (let i = 0; i < n - 1; i += 2) ink(ctx, [path[i], path[i + 1]], { close: false, width: 4, color: 'rgba(42,28,20,0.5)', seed: 280 + i, t });
      if (fly < 1) {
        const [px, py] = path[n - 1];
        const [qx, qy] = path[Math.max(0, n - 3)];
        plane(ctx, px, py, 1, Math.atan2(py - qy, px - qx), t);
      }
    }
    if (t > s0 + 1.55) note(ctx, 'gönderildi ✓', 610, 935, { size: 46, col: P.teal, a: fadeIn(t, s0 + 1.55, 0.25), rot: -0.03 });
    const la = pop(t, s0 + 0.25, 0.6);
    if (la > 0) {
      ctx.save();
      ctx.translate(160, 1225);
      ctx.scale(la, la);
      K.appIcon(ctx, 0, 0, 140, { reveal: progress(t, s0 + 0.5, s0 + 1.3, ease.inOut), shine: progress(t, s0 + 1.4, s0 + 2.1) });
      ctx.restore();
    }
    const wa = fadeIn(t, s0 + 0.7, 0.4);
    K.T(ctx, 'YUP Akademi', 255, 1205, { size: 60, weight: 900, color: P.teal, align: 'left', alpha: wa });
    note(ctx, "Lup'la bak.", 258, 1276, { size: 52, col: INK, a: wa, rot: -0.02 });
    const ba = fadeIn(t, s0 + 1.1, 0.35);
    if (ba > 0) {
      const press = Math.exp(-(((t - tap) / 0.09) ** 2));
      ctx.save();
      ctx.globalAlpha *= ba;
      ctx.translate(390, 1560);
      ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
      ctx.font = `800 44px ${AT}`;
      ctx.letterSpacing = '2px';
      const w = Math.max(420, ctx.measureText(done ? 'ABONE OLUNDU ✓' : 'ABONE OL').width + 90);
      ctx.shadowColor = 'rgba(40,25,15,0.3)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = done ? '#fffaf0' : P.teal;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -50, w, 100, 50);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 5;
      ctx.strokeStyle = P.teal;
      ctx.stroke();
      ctx.fillStyle = done ? P.teal : '#fffaf0';
      ctx.font = `800 44px ${AT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText(done ? 'ABONE OLUNDU ✓' : 'ABONE OL', 0, 2);
      ctx.restore();
      if (done) {
        for (let i = 0; i < 10; i++) {
          const q2 = clamp((t - tap) / 0.9);
          if (q2 >= 1) continue;
          const th = (i / 10) * TAU;
          const d = 230 + q2 * 120;
          note(ctx, '+', 390 + Math.cos(th) * d, 1575 + Math.sin(th) * d * 0.4, { size: 40 * (1 - q2) + 10, col: [P.amber, P.teal, P.red][i % 3], align: 'center', rot: 0 });
        }
      }
    }
    tag(ctx);
    finish(ctx, t);
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { S0 } = api;
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.2, pan });
    // 1 kanca: cam tıngı, ampul vızıltısı, göz kapanınca boğuk "vuuş"
    const h = 'a-hook';
    const s1 = S0(h);
    bell(s1 + 0.15, 'E7', 0.07, 0.2);
    bell(s1 + 0.17, 'B7', 0.025, -0.2);
    m.whoosh(s1 + 0.45, { dur: 0.6, from: 700, to: 2600, gain: 0.05 });
    m.hum(s1 + 0.3, W(api, h, 3) - s1 - 0.3, { gain: 0.035 });
    m.whoosh(W(api, h, 3), { dur: 0.7, from: 1800, to: 250, gain: 0.06 });
    m.blip(W(api, h, 3) + 0.2, { freq: 520, dur: 1.6, slide: 0.6, gain: 0.03 });
    m.pop(W(api, h, 10) - 0.1, { freq: hz('A5'), gain: 0.06 });
    bell(W(api, h, 12), 'G6', 0.04, 0.2);
    // 2 koniler
    const k2 = 'a-solma';
    m.riser(W(api, k2, 0), 1.2, { gain: 0.025 });
    m.wobble(W(api, k2, 6), 0.6, { gain: 0.06, freq: 170 });
    [[13, 'C6'], [15, 'E6'], [17, 'G6']].forEach(([i, n]) => {
      m.blip(W(api, k2, i) - 0.05, { freq: hz(n), dur: 0.25, gain: 0.05 });
      bell(W(api, k2, i), n, 0.035, -0.2 + i * 0.02);
    });
    // 3 kapak: ışınlar, yutulma, kırmızının geçişi
    const k3 = 'a-kapak';
    m.whoosh(W(api, k3, 8) + 0.2, { dur: 0.6, from: 600, to: 2200, gain: 0.04 });
    m.pop(W(api, k3, 10) + 0.1, { freq: 380, gain: 0.06 });
    m.pop(W(api, k3, 11) + 0.1, { freq: 340, gain: 0.06 });
    m.riser(W(api, k3, 14) - 0.2, 0.7, { gain: 0.03 });
    // 4 deney: saniye tikleri, sonda yumuşak çan
    const c0 = countStart(api);
    for (let i = 0; i < 10; i++) m.tick(c0 + i, { gain: 0.05, tone: 2600 });
    bell(c0 + 10 - 0.05, 'C7', 0.035, 0);
    // 6 kapanış
    bell(api.cue('a-cta', 1) + 0.1, 'G7', 0.04, 0.3);
  }

  // Deney sayımının bitişi: a-dene sahnesi sayım bitene kadar sürer
  window.FILM = K.short({
    title: 'Ampule bakınca gelen renkli leke · YUP Akademi',
    series: 'VÜCUDUN GİZLİ AYARLARI',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.45,
    transition: LUP.lensWipe,
    cut: ['a-bak'],
    extra: { 'a-hook': 0.35, 'a-solma': 0.4, 'a-kapak': 0.4, 'a-dene': 7.8, 'a-bak': 0.5, 'a-cta': 1.75 },
    lead: { 'a-hook': 0.1, 'a-solma': 0.2, 'a-kapak': 0.2, 'a-dene': 0.25, 'a-bak': 0.0, 'a-cta': 0.3 },
    titles: {
      'a-hook': 'Renkli leke',
      'a-solma': 'Yorulan hücreler',
      'a-kapak': 'Kırmızı perde',
      'a-dene': 'Deney',
      'a-bak': 'Şimdi bak',
      'a-cta': 'Arkadaşına gönder',
    },
    chords: {
      'a-hook': ['D3', 'A3', 'F#4', 'B4'],
      'a-solma': ['B2', 'F#3', 'D4', 'A4'],
      'a-kapak': ['G2', 'D3', 'B3', 'F#4'],
      'a-dene': ['E3', 'B3', 'E4', 'G4'],
      'a-bak': ['C3', 'G3', 'E4', 'B4'],
      'a-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
