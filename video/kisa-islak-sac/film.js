/*
 * YUP Akademi · Efsane mi, Gerçek mi? #1 (kısa, 1080×1920) — Islak saçla dışarı çıkarsan hasta olur musun?
 *
 * Ortak marka motoru: video/yup-marka/kisa.js (zemin, seri etiketi, geçişler, kapanış ve abone çağrısı).
 * Sahneler: annenin sözü (ıslak saçlı, üşüyen kişi) · yorumlara oy çağrısı · soğuk mu, virüs mü? ·
 * burnun içi soğuyunca savunma parçacıkları azalır (2022) · soğuk suda ayaklar (Cardiff 2005) ·
 * hüküm: şüpheli (kapıyı aralayan üşüme) · bu kış dene · yorum çağrılı kapanış. Kaynaklar: kaynaklar.md.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const { C, T, M, rr, shadowed, card, pill, line, dot, dayBg, checkBadge, star, stamp, commentIcon, headPath, hand } = K;
  const DROP = '#5bb8d6';

  // ---------------------------------------------------------------------------
  // Çizimler
  // ---------------------------------------------------------------------------
  // Islak saçlı, üşüyen kişi (önden). Birim: yüz merkezi (0,0), yüz yarıçapı 100
  function person(ctx, x, y, s, t, { a = 1, wet = 1, shiver = 1, scarf = 0, smile = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + Math.sin(t * 55) * 2.5 * shiver, y);
    ctx.scale(s, s);
    // gövde (kazak)
    ctx.fillStyle = C.teal;
    ctx.beginPath();
    ctx.moveTo(-210, 380);
    ctx.bezierCurveTo(-210, 215, -135, 150, 0, 150);
    ctx.bezierCurveTo(135, 150, 210, 215, 210, 380);
    ctx.closePath();
    ctx.fill();
    // arka saç
    const hairC = '#1b2a55';
    ctx.fillStyle = hairC;
    ctx.beginPath();
    ctx.moveTo(-112, 0);
    ctx.bezierCurveTo(-120, -92, -60, -132, 0, -132);
    ctx.bezierCurveTo(60, -132, 120, -92, 112, 0);
    ctx.lineTo(122, 118 - 30 * (1 - wet));
    const tips = [118, 92, 66, -66, -92, -118];
    if (wet > 0.5) {
      // ıslak, sivri tutamlar
      ctx.lineTo(112, 150);
      ctx.lineTo(100, 122);
      ctx.lineTo(88, 158);
      ctx.lineTo(74, 120);
      ctx.lineTo(-74, 120);
      ctx.lineTo(-88, 158);
      ctx.lineTo(-100, 122);
      ctx.lineTo(-112, 150);
    } else {
      // kurumuş, kabarık
      ctx.quadraticCurveTo(110, 120, 80, 104);
      ctx.lineTo(-80, 104);
      ctx.quadraticCurveTo(-110, 120, -122, 88);
    }
    ctx.lineTo(-122, 118 - 30 * (1 - wet));
    ctx.closePath();
    ctx.fill();
    // boyun
    ctx.fillStyle = '#e3ae86';
    rr(ctx, -30, 70, 60, 100, 20);
    ctx.fill();
    // kulaklar ve yüz
    ctx.fillStyle = C.skin;
    dot(ctx, -96, 14, 18);
    dot(ctx, 96, 14, 18);
    ctx.beginPath();
    ctx.ellipse(0, 6, 92, 104, 0, 0, Math.PI * 2);
    ctx.fill();
    // ön saç
    ctx.fillStyle = hairC;
    ctx.beginPath();
    ctx.moveTo(-104, -2);
    ctx.quadraticCurveTo(-112, -104, -14, -120);
    ctx.quadraticCurveTo(84, -126, 106, -18);
    if (wet > 0.5) {
      [[92, -16], [80, -54], [62, -12], [40, -58], [18, -22], [0, -62], [-20, -20], [-44, -60], [-62, -14], [-80, -52], [-96, -2]].forEach(([px, py]) => ctx.lineTo(px, py));
    } else {
      ctx.quadraticCurveTo(60, -70, 0, -66);
      ctx.quadraticCurveTo(-70, -64, -96, -2);
    }
    ctx.closePath();
    ctx.fill();
    // ıslak parlaklık
    if (wet > 0.5) {
      ctx.strokeStyle = 'rgba(110,193,201,0.7)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -10, 112, -2.5, -2.0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -10, 112, -1.25, -0.85);
      ctx.stroke();
    }
    // kaşlar (endişeli) ve gözler
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const worry = 1 - smile;
    line(ctx, -54, -4 + 4 * worry, -22, -10 - 4 * worry);
    line(ctx, 22, -10 - 4 * worry, 54, -4 + 4 * worry);
    ctx.fillStyle = C.ink;
    const blink = (t % 3.3) < 0.12 ? 0.15 : 1;
    ctx.beginPath();
    ctx.ellipse(-34, 22, 8, 10 * blink, 0, 0, Math.PI * 2);
    ctx.ellipse(34, 22, 8, 10 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    // yanaklar ve üşüyen burun
    ctx.fillStyle = 'rgba(239,154,138,0.55)';
    dot(ctx, -54, 52, 16);
    dot(ctx, 54, 52, 16);
    ctx.fillStyle = shiver > 0.3 ? '#e8806e' : '#e9a888';
    dot(ctx, 0, 44, 11);
    // ağız: titreyen dalga ya da gülümseme
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (smile > 0.5) {
      ctx.arc(0, 62, 22, 0.2, Math.PI - 0.2);
    } else {
      ctx.moveTo(-24, 76);
      for (let i = 1; i <= 6; i++) ctx.lineTo(-24 + i * 8, 76 + (i % 2 ? -5 : 5) * (0.6 + 0.4 * Math.sin(t * 30)));
    }
    ctx.stroke();
    // atkı
    if (scarf > 0) {
      ctx.globalAlpha *= scarf;
      ctx.fillStyle = C.amber;
      rr(ctx, -96, 118, 192, 58, 29);
      ctx.fill();
      rr(ctx, 40, 150, 50, 150, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 6;
      for (let i = 0; i < 3; i++) line(ctx, 46, 200 + i * 30, 84, 200 + i * 30);
    }
    ctx.restore();
    // damlalar ve soğuk nefes
    if (wet > 0.5) {
      for (let i = 0; i < tips.length; i++) {
        const u = (t * 0.9 + hash(i, 3)) % 1;
        const dx = x + tips[i] * s;
        const dy = y + (150 + u * 240) * s;
        ctx.save();
        ctx.globalAlpha *= a * (1 - u) * wet;
        drop(ctx, dx, dy, 9 * s);
        ctx.restore();
      }
    }
    if (shiver > 0.3) {
      const u = (t * 0.7) % 1;
      ctx.save();
      ctx.globalAlpha *= a * (1 - u) * 0.8;
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 3; k++) dot(ctx, x + (104 + u * 90 + k * 24) * s, y + (92 - u * 50 - k * 8) * s, (12 + k * 6 + u * 10) * s);
      ctx.restore();
    }
  }
  function drop(ctx, x, y, r) {
    ctx.fillStyle = DROP;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.8);
    ctx.quadraticCurveTo(x + r, y - r * 0.4, x + r, y + r * 0.2);
    ctx.arc(x, y + r * 0.2, r, 0, Math.PI);
    ctx.quadraticCurveTo(x - r, y - r * 0.4, x, y - r * 1.8);
    ctx.fill();
  }
  function snowflake(ctx, x, y, r, { a = 1, color = '#fff', lw = null, rot = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw ?? Math.max(2, r * 0.12);
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      line(ctx, 0, 0, 0, -r);
      line(ctx, 0, -r * 0.55, -r * 0.25, -r * 0.8);
      line(ctx, 0, -r * 0.55, r * 0.25, -r * 0.8);
    }
    ctx.restore();
  }
  function virus(ctx, x, y, r, t, { a = 1, body = C.green, knob = C.amber, glow = 0 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    if (glow > 0) E.glow(ctx, x, y, r * 2.2, [46, 125, 91], 0.35 * glow);
    ctx.translate(x, y);
    ctx.rotate(t * 0.4);
    ctx.strokeStyle = body;
    ctx.lineWidth = r * 0.1;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2;
      line(ctx, Math.cos(th) * r * 0.8, Math.sin(th) * r * 0.8, Math.cos(th) * r * 1.25, Math.sin(th) * r * 1.25);
      ctx.fillStyle = knob;
      dot(ctx, Math.cos(th) * r * 1.3, Math.sin(th) * r * 1.3, r * 0.12);
    }
    ctx.fillStyle = body;
    dot(ctx, 0, 0, r);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    dot(ctx, -r * 0.3, -r * 0.25, r * 0.3);
    dot(ctx, r * 0.35, r * 0.3, r * 0.18);
    dot(ctx, r * 0.2, -r * 0.45, r * 0.12);
    ctx.restore();
  }
  function thermometer(ctx, x, y, h, level, { a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      ctx.fillStyle = '#fff';
      rr(ctx, x - 26, y, 52, h, 26);
      ctx.fill();
      dot(ctx, x, y + h + 10, 44);
    }, { blur: 18, oy: 6 });
    const col = level > 0.55 ? '#e8806e' : C.cyan;
    ctx.fillStyle = col;
    dot(ctx, x, y + h + 10, 32);
    const top = y + 22 + (h - 22) * (1 - level);
    rr(ctx, x - 12, top, 24, y + h + 10 - top, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(18,59,58,0.3)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) line(ctx, x + 30, y + (h * i) / 6, x + 44, y + (h * i) / 6);
    ctx.restore();
  }
  // Soğuk panel: buz mavisi zemin, yağan kar, rüzgâr çizgileri
  function coldPanel(ctx, x, y, w, h, t, { a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      rr(ctx, x, y, w, h, 48);
      ctx.fillStyle = '#cfe9ee';
      ctx.fill();
    });
    rr(ctx, x, y, w, h, 48);
    ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#e6f4f6');
    g.addColorStop(1, '#a9d8e0');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 22; i++) {
      const u = (t * (0.08 + hash(i, 2) * 0.06) + hash(i, 1)) % 1;
      const sx = x + hash(i, 3) * w + Math.sin(t + i) * 20;
      snowflake(ctx, sx, y + u * h, 8 + hash(i, 4) * 12, { a: 0.9, rot: t * 0.5 + i });
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const u = (t * 0.5 + i / 4) % 1;
      const wx = x - 200 + u * (w + 400);
      const wy = y + 120 + i * (h / 4.5);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + 80, wy - 20, wx + 160, wy);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Konuşma balonu kartı (aşağı kuyruklu)
  function bubble(ctx, x, y, w, h, tailX, { a = 1, fill = '#fff' } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      ctx.fillStyle = fill;
      rr(ctx, x, y, w, h, 40);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tailX - 30, y + h - 2);
      ctx.lineTo(tailX - 10, y + h + 52);
      ctx.lineTo(tailX + 34, y + h - 2);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Sahneler
  // ---------------------------------------------------------------------------
  const draw = {};
  const P = { x: 90, y: 600, w: 900, h: 760 };

  draw['e-hook'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx, fadeIn(t, 0.05));
    const s0 = S0('e-hook');
    coldPanel(ctx, P.x, P.y, P.w, P.h, t, { a: fadeIn(t, s0, 0.3) });
    ctx.save();
    rr(ctx, P.x, P.y, P.w, P.h, 48);
    ctx.clip();
    person(ctx, 540, 960, 1.45, t, { a: fadeIn(t, s0 + 0.05, 0.3) });
    ctx.restore();
    // termometre
    thermometer(ctx, 890, 660, 170, 0.22, { a: fadeIn(t, s0 + 0.3) });
    pill(ctx, '4°C', 890, 935, { size: 30, fill: C.navy, a: fadeIn(t, s0 + 0.4) });
    // annenin sözü
    const qa = progress(t, s0, s0 + 0.35, ease.out);
    bubble(ctx, 90, 270, 900, 250, 420, { a: qa });
    T(ctx, '“Islak saçla dışarı çıkma,', 540, 350, { size: 52, weight: 900, color: C.ink, alpha: after(t, 'e-hook', 0, 0.3) });
    ctx.save();
    const hp = pop(t, cue('e-hook', 1) - 0.05, 0.45);
    ctx.translate(540, 440);
    ctx.scale(lerp(0.6, 1, hp), lerp(0.6, 1, hp));
    T(ctx, 'hasta olursun!”', 0, 0, { size: 72, weight: 900, color: C.teal, alpha: clamp(hp * 2) });
    ctx.restore();
    // "kaç kez duydun?" — etrafta tekrar eden uyarılar
    const warns = [['üşüteceksin!', 210, 760, -0.12], ['saçını kurut!', 860, 1110, 0.1], ['bere tak!', 230, 1230, 0.08]];
    warns.forEach(([s, x, y, r], i) => {
      const at = cue('e-hook', 2) + i * 0.22;
      const p = pop(t, at, 0.45);
      if (p <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      ctx.scale(p, p);
      const w = M(ctx, s, { hand: true, size: 46, weight: 700 }) + 50;
      ctx.fillStyle = '#fff';
      shadowed(ctx, () => {
        rr(ctx, -w / 2, -38, w, 76, 38);
        ctx.fill();
      }, { blur: 16, oy: 6 });
      T(ctx, s, 0, 0, { hand: true, size: 46, weight: 700, color: C.amber });
      ctx.restore();
    });
  };

  draw['e-vote'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-vote');
    const ha = fadeIn(t, s0 + 0.1, 0.4);
    ctx.save();
    const hs = lerp(0.7, 1, pop(t, s0 + 0.1, 0.5));
    ctx.translate(540, 420);
    ctx.scale(hs, hs);
    T(ctx, 'Sence?', 0, 0, { size: 140, weight: 900, color: C.teal, alpha: ha });
    ctx.restore();
    // oy düğmeleri
    const btn = (label, x, fill, at, icon) => {
      const p = pop(t, at, 0.5);
      if (p <= 0) return;
      const hover = 1 + 0.05 * Math.max(0, Math.sin((t - at) * 3.2 + (icon ? 0 : Math.PI)));
      ctx.save();
      ctx.translate(x, 680);
      ctx.scale(p * hover, p * hover);
      shadowed(ctx, () => {
        rr(ctx, -180, -80, 360, 160, 80);
        ctx.fillStyle = fill;
        ctx.fill();
      }, { blur: 24, oy: 10 });
      checkBadge(ctx, -110, 0, 38, { fill: 'rgba(255,255,255,0.22)', cross: !icon });
      T(ctx, label, 36, 4, { size: 52, weight: 900, color: '#fff', spacing: 2 });
      ctx.restore();
    };
    btn('EFSANE', 290, C.navy, cue('e-vote', 0) + 0.3, false);
    btn('GERÇEK', 790, C.green, cue('e-vote', 1), true);
    T(ctx, 'ya da', 540, 690, { hand: true, size: 44, weight: 700, color: C.muted, alpha: after(t, 'e-vote', 1, 0.3) });
    // yorum kartı: cevap yazılıyor
    const ca = after(t, 'e-vote', 2, 0.45);
    ctx.save();
    ctx.translate(0, (1 - ease.out(ca)) * 60);
    card(ctx, 90, 860, 900, 400, { r: 44, a: ca });
    commentIcon(ctx, 200, 960, 1.1, { a: ca, dots: t });
    T(ctx, 'Yorumlar', 290, 945, { size: 46, weight: 900, color: C.ink, align: 'left', alpha: ca });
    T(ctx, 'cevabını videonun sonundan önce yaz!', 290, 995, { size: 30, weight: 700, color: C.muted, align: 'left', alpha: ca });
    ctx.globalAlpha *= ca;
    rr(ctx, 140, 1070, 800, 110, 55);
    ctx.fillStyle = C.cream;
    ctx.fill();
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 4;
    ctx.stroke();
    // yazılan cevap: harf harf "Bence efsane!" / "Bence gerçek!"
    const tt = t - cue('e-vote', 2) - 0.4;
    if (tt > 0) {
      const opts = ['Bence efsane!', 'Bence gerçek!'];
      const k = Math.floor(tt / 2.2) % 2;
      const u = (tt % 2.2) / 1.2;
      const n = Math.min(opts[k].length, Math.floor(u * opts[k].length));
      const str = opts[k].slice(0, n);
      const w = T(ctx, str, 190, 1126, { size: 46, weight: 800, color: C.ink, align: 'left' });
      if (Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = C.teal;
        ctx.fillRect(196 + w, 1100, 5, 52);
      }
    }
    ctx.restore();
    // yorum simgesine bakan ok
    const aa = after(t, 'e-vote', 2, 0.5);
    T(ctx, 'yorumlara yaz', 540, 1350, { hand: true, size: 64, weight: 700, color: C.amber, alpha: aa });
  };

  draw['e-virus'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-virus');
    T(ctx, 'hastalığı kim yapar?', 540, 350, { hand: true, size: 64, weight: 700, color: C.amber, alpha: fadeIn(t, s0 + 0.15) });
    T(ctx, 'Soğuk mu, virüs mü?', 540, 440, { size: 66, weight: 900, color: C.ink, alpha: fadeIn(t, s0 + 0.25) });
    // soğuk
    const la = fadeIn(t, s0 + 0.35);
    const no = after(t, 'e-virus', 1, 0.5);
    ctx.save();
    ctx.globalAlpha *= lerp(1, 0.45, no);
    ctx.fillStyle = C.cyanSoft;
    dot(ctx, 290, 780, 190 * clamp(la * 1.2));
    snowflake(ctx, 290, 780, 120, { a: la, color: C.cyan, lw: 16, rot: t * 0.2 });
    ctx.restore();
    pill(ctx, 'SOĞUK', 290, 1030, { size: 38, fill: C.cyan, a: la });
    checkBadge(ctx, 420, 640, 54, { a: no, s: pop(t, cue('e-virus', 1) + 0.25), fill: C.grey, cross: true });
    // virüs
    const va = fadeIn(t, s0 + 0.5);
    const yes = after(t, 'e-virus', 2, 0.4);
    ctx.save();
    ctx.fillStyle = C.greenSoft;
    ctx.globalAlpha *= va;
    dot(ctx, 790, 780, 190 * clamp(va * 1.2));
    ctx.restore();
    virus(ctx, 790, 780, lerp(95, 120, ease.back(yes)), t, { a: va, glow: yes });
    pill(ctx, 'VİRÜS', 790, 1030, { size: 38, fill: C.green, a: va });
    checkBadge(ctx, 920, 640, 54, { a: yes, s: pop(t, cue('e-virus', 2)) });
    // nezle · grip
    const na = after(t, 'e-virus', 1, 0.4);
    pill(ctx, 'nezle', 420, 1190, { size: 40, fill: C.paper, color: C.ink, a: na, weight: 800, scale: lerp(0.7, 1, pop(t, cue('e-virus', 1))) });
    pill(ctx, 'grip', 660, 1190, { size: 40, fill: C.paper, color: C.ink, a: na, weight: 800, scale: lerp(0.7, 1, pop(t, cue('e-virus', 1) + 0.15)) });
    // nezle ve grip oku virüse
    T(ctx, 'virüs yoksa, ıslak saç hasta etmez', 540, 1320, { size: 36, weight: 800, color: C.muted, alpha: progress(t, cue('e-virus', 2) + 0.7, cue('e-virus', 2) + 1.1) });
  };

  // Burun içi: hücreler savunma parçacıkları (kalkan) salar, virüsleri yakalar
  const NP = { x: 90, y: 860, w: 900, h: 470 };
  function nosePanel(ctx, t, api, a) {
    if (a <= 0.002) return;
    const { cue } = api;
    const cold = progress(t, cue('e-nose', 1), cue('e-nose', 1) + 1.0, ease.inOut);
    const yTop = NP.y + 20;
    const yCell = NP.y + NP.h - 90;
    ctx.save();
    ctx.globalAlpha *= a;
    shadowed(ctx, () => {
      rr(ctx, NP.x, NP.y, NP.w, NP.h, 44);
      ctx.fillStyle = '#fbe4dc';
      ctx.fill();
    });
    rr(ctx, NP.x, NP.y, NP.w, NP.h, 44);
    ctx.clip();
    // soğuyunca mavi örtü ve kırağı
    ctx.fillStyle = `rgba(169,216,224,${0.75 * cold})`;
    ctx.fillRect(NP.x, NP.y, NP.w, NP.h);
    // hücre sırası
    for (let i = 0; i < 9; i++) {
      const cx = NP.x + 20 + i * 100;
      ctx.fillStyle = cold > 0.5 ? '#f3c7c0' : '#f4b8ae';
      rr(ctx, cx, yCell, 92, 100, 30);
      ctx.fill();
      ctx.fillStyle = 'rgba(214,110,98,0.5)';
      dot(ctx, cx + 46, yCell + 46, 14);
    }
    // parçacıklar: her şeritte bir virüs iner; kalkan varsa çıkıp yolda yakalar
    const t0 = api.S0('e-nose') - 1.5;
    const VY = 250;
    const SY = 320;
    for (let i = 0; i < 80; i++) {
      const ti = t0 + i * 0.2;
      const tau = t - ti;
      if (tau < 0 || tau > 2.4) continue;
      const x = NP.x + 60 + hash(i, 1) * (NP.w - 120);
      const coldAt = progress(ti, cue('e-nose', 1), cue('e-nose', 1) + 1.0);
      const shield = hash(i, 2) < 1 - 0.42 * coldAt;
      const meet = (yCell - yTop + SY * 0.25) / (VY + SY);
      const vy = yTop + VY * tau;
      if (shield) {
        if (tau < meet) {
          virus(ctx, x, vy, 19, t + i, { body: C.green });
          if (tau > 0.25) {
            const sy = yCell - SY * (tau - 0.25);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 5;
            ctx.fillStyle = C.cyan;
            dot(ctx, x, sy, 16);
            ctx.beginPath();
            ctx.arc(x, sy, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (tau < meet + 0.35) {
          const u = (tau - meet) / 0.35;
          ctx.strokeStyle = `rgba(255,255,255,${1 - u})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x, yTop + VY * meet, 14 + u * 26, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        const reach = (yCell - yTop) / VY;
        if (tau < reach) virus(ctx, x, vy, 19, t + i, { body: C.green });
        else if (tau < reach + 0.8) E.glow(ctx, x, yCell + 10, 60, [229, 72, 77], 0.6 * (1 - (tau - reach) / 0.8));
      }
    }
    // kırağı kenarları
    if (cold > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * cold})`;
      ctx.lineWidth = 16;
      rr(ctx, NP.x + 6, NP.y + 6, NP.w - 12, NP.h - 12, 40);
      ctx.stroke();
    }
    ctx.restore();
  }
  draw['e-nose'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-nose');
    // çalışma künyesi
    const ya = after(t, 'e-nose', 0, 0.4);
    pill(ctx, '2022 · HARVARD TIP · MASS EYE AND EAR', 540, 320, { size: 28, fill: C.navy, a: ya, scale: lerp(0.7, 1, pop(t, cue('e-nose', 0))) });
    // profil kafa ve burun büyüteci
    const ha = fadeIn(t, s0 + 0.1);
    const hx = 110;
    const hy = 390;
    const hh = 400;
    ctx.save();
    ctx.globalAlpha *= ha;
    ctx.translate(hx, hy);
    ctx.scale(hh / 120, hh / 120);
    headPath(ctx);
    ctx.fillStyle = C.navy;
    ctx.fill();
    ctx.restore();
    const nx = hx + (98 * hh) / 120;
    const ny = hy + (58 * hh) / 120;
    const ma = fadeIn(t, s0 + 0.4);
    ctx.save();
    ctx.globalAlpha *= ma;
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(nx - 4, ny, 46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([4, 14]);
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    line(ctx, nx - 30, ny + 40, NP.x + 120, NP.y);
    line(ctx, nx + 30, ny + 36, NP.x + NP.w - 120, NP.y);
    ctx.restore();
    // termometre: burun içi soğur
    const cold = after(t, 'e-nose', 1, 1.0, ease.inOut);
    thermometer(ctx, 820, 410, 220, lerp(0.75, 0.38, cold), { a: fadeIn(t, s0 + 0.3) });
    pill(ctx, '−5°C', 700, 520, { size: 40, fill: C.cyan, a: cold, scale: lerp(0.6, 1, pop(t, cue('e-nose', 1) + 0.6)) });
    T(ctx, 'burnun içi', 700, 600, { size: 32, weight: 800, color: C.muted, alpha: cold });
    // panel ve sayaç
    nosePanel(ctx, t, api, fadeIn(t, s0 + 0.5));
    const drop = after(t, 'e-nose', 2, 1.4, ease.inOut);
    const pct = Math.round(100 - 42 * drop);
    card(ctx, 130, 880, 330, 120, { r: 30, a: fadeIn(t, s0 + 0.6), fill: 'rgba(255,253,248,0.92)', shadow: false });
    T(ctx, 'savunma', 160, 915, { size: 28, weight: 800, color: C.muted, align: 'left', alpha: fadeIn(t, s0 + 0.6) });
    T(ctx, `%${pct}`, 160, 965, { size: 56, weight: 900, color: drop > 0.2 ? C.amber : C.teal, align: 'left', alpha: fadeIn(t, s0 + 0.6) });
    const ba = progress(t, cue('e-nose', 2) + 1.4, cue('e-nose', 2) + 1.8);
    if (ba > 0) {
      ctx.save();
      ctx.translate(780, 940);
      const s = lerp(0.6, 1, pop(t, cue('e-nose', 2) + 1.4));
      ctx.scale(s, s);
      pill(ctx, '−%42', 0, 0, { size: 60, fill: C.amber, color: C.ink, a: ba });
      ctx.restore();
    }
    // açıklama
    ctx.save();
    ctx.globalAlpha *= fadeIn(t, s0 + 0.8);
    ctx.fillStyle = C.cyan;
    dot(ctx, 200, 1400, 13);
    ctx.restore();
    T(ctx, 'savunma parçacığı', 228, 1402, { size: 30, weight: 700, color: C.ink, align: 'left', alpha: fadeIn(t, s0 + 0.8) });
    virus(ctx, 620, 1400, 14, t, { a: fadeIn(t, s0 + 0.8) });
    T(ctx, 'virüs', 652, 1402, { size: 30, weight: 700, color: C.ink, align: 'left', alpha: fadeIn(t, s0 + 0.8) });
  };

  // Soğuk su leğeninde ayaklar
  function basin(ctx, x, y, s, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    // bacaklar (paçalar kıvrılmış)
    for (const lx of [-70, 70]) {
      ctx.fillStyle = C.skin;
      rr(ctx, lx - 38, -230, 76, 300, 30);
      ctx.fill();
      ctx.fillStyle = C.navy;
      rr(ctx, lx - 46, -300, 92, 90, 20);
      ctx.fill();
      ctx.fillStyle = '#26479e';
      rr(ctx, lx - 50, -222, 100, 26, 13);
      ctx.fill();
    }
    // leğen ve su
    ctx.fillStyle = '#d6dde6';
    ctx.beginPath();
    ctx.moveTo(-260, -10);
    ctx.lineTo(-210, 130);
    ctx.quadraticCurveTo(0, 170, 210, 130);
    ctx.lineTo(260, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(91,184,214,0.75)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 250, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(91,184,214,0.55)';
    ctx.beginPath();
    ctx.moveTo(-250, -10);
    ctx.lineTo(-208, 112);
    ctx.quadraticCurveTo(0, 150, 208, 112);
    ctx.lineTo(250, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8c3cf';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(0, -10, 262, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    // buz küpleri ve dalgalar
    [[-150, -18, 0.3], [140, -14, -0.2], [20, -24, 0.1]].forEach(([bx, by, r], i) => {
      ctx.save();
      ctx.translate(bx, by + Math.sin(t * 2 + i) * 4);
      ctx.rotate(r + Math.sin(t + i) * 0.05);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      rr(ctx, -26, -22, 52, 44, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(110,193,201,0.9)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
  draw['e-feet'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-feet');
    T(ctx, 'Cardiff Üniversitesi, 2005', 540, 330, { hand: true, size: 58, weight: 700, color: C.amber, alpha: fadeIn(t, s0 + 0.15) });
    basin(ctx, 540, 700, 1.0, t, fadeIn(t, s0 + 0.25));
    // 20 dk zamanlayıcısı
    const za = after(t, 'e-feet', 0, 0.4);
    const zp = progress(t, cue('e-feet', 0), cue('e-feet', 0) + 2.2);
    ctx.save();
    ctx.globalAlpha *= za;
    shadowed(ctx, () => {
      ctx.fillStyle = '#fff';
      dot(ctx, 880, 520, 82);
    }, { blur: 18, oy: 6 });
    ctx.fillStyle = C.amberSoft;
    ctx.beginPath();
    ctx.moveTo(880, 520);
    ctx.arc(880, 520, 66, -Math.PI / 2, -Math.PI / 2 + zp * Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    T(ctx, '20 dk', 880, 524, { size: 40, weight: 900, color: C.ink, alpha: za });
    // sütun grafiği
    const ga = after(t, 'e-feet', 1, 0.4);
    card(ctx, 90, 900, 900, 440, { r: 44, a: ga });
    const g = after(t, 'e-feet', 1, 1.0, ease.inOut);
    const bar = (x, pct, col, label, sub) => {
      const hmax = 190;
      const h = (hmax * pct) / 15 * g;
      ctx.save();
      ctx.globalAlpha *= ga;
      ctx.fillStyle = col;
      rr(ctx, x - 80, 1240 - h, 160, h, 20);
      ctx.fill();
      ctx.restore();
      T(ctx, `%${Math.round(pct * g)}`, x, 1204 - h, { size: 54, weight: 900, color: col, alpha: ga });
      T(ctx, label, x, 1278, { size: 32, weight: 900, color: C.ink, alpha: ga });
      T(ctx, sub, x, 1314, { size: 24, weight: 700, color: C.muted, alpha: ga });
    };
    bar(320, 14, C.amber, 'soğuk suda', '90 kişiden 13’ü');
    bar(600, 6, C.teal, 'kuru leğende', '90 kişiden 5’i');
    const ma = progress(t, cue('e-feet', 1) + 1.0, cue('e-feet', 1) + 1.4);
    ctx.save();
    ctx.translate(840, 1080);
    ctx.rotate(-0.06);
    const s = lerp(0.6, 1, pop(t, cue('e-feet', 1) + 1.0));
    ctx.scale(s, s);
    T(ctx, '2 kattan', 0, -30, { hand: true, size: 58, weight: 700, color: C.amber, alpha: ma });
    T(ctx, 'fazla', 0, 28, { hand: true, size: 58, weight: 700, color: C.amber, alpha: ma });
    ctx.restore();
    T(ctx, 'nezle olduğunu söyleyenler · sonraki 4–5 gün', 540, 945, { size: 28, weight: 800, color: C.muted, alpha: ga });
  };

  // Hüküm
  const VERDICTS = [['GERÇEK', C.green], ['EFSANE', C.navy], ['ŞÜPHELİ', C.amber], ['KANITI YOK', C.grey]];
  function door(ctx, x, y, s, t, open, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.nightDeep;
    rr(ctx, -90, -170, 180, 340, 18);
    ctx.fill();
    // aralıktan bakan virüs
    if (open > 0.05) virus(ctx, -80 + 100 * open, 0, 34, t, { a: clamp(open * 2) });
    ctx.save();
    ctx.translate(-90, 0);
    ctx.scale(1 - 0.7 * open, 1);
    ctx.fillStyle = C.teal;
    rr(ctx, 0, -170, 180, 340, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 6;
    rr(ctx, 26, -140, 128, 120, 10);
    ctx.stroke();
    rr(ctx, 26, 10, 128, 130, 10);
    ctx.stroke();
    ctx.fillStyle = C.amber;
    dot(ctx, 150, 10, 12);
    ctx.restore();
    ctx.strokeStyle = C.tealDeep;
    ctx.lineWidth = 12;
    rr(ctx, -96, -176, 192, 352, 20);
    ctx.stroke();
    ctx.restore();
  }
  draw['e-verdict'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-verdict');
    // hüküm seçici: vurgu dolaşır, ŞÜPHELİ'de durur
    const spin0 = cue('e-verdict', 3) - 0.1;
    const landed = t >= cue('e-verdict', 4);
    let hi = -1;
    if (t > spin0 && !landed) hi = Math.floor((t - spin0) / 0.12) % 4;
    if (landed) hi = 2;
    VERDICTS.forEach(([s, col], i) => {
      const x = i % 2 ? 790 : 290;
      const y = i < 2 ? 340 : 460;
      const a = fadeIn(t, s0 + 0.15 + i * 0.06);
      const on = hi === i;
      const k = on ? 1.08 : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(k, k);
      ctx.globalAlpha *= a * (hi >= 0 && !on ? 0.45 : 1);
      rr(ctx, -210, -48, 420, 96, 48);
      ctx.fillStyle = on ? col : '#fff';
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.stroke();
      T(ctx, s, 0, 3, { size: 40, weight: 900, color: on ? '#fff' : col, spacing: 2 });
      ctx.restore();
    });
    // sahne: üşüyen kişi ve aralanan kapı
    const pa = fadeIn(t, s0 + 0.3);
    const PY = { x: 90, y: 560, w: 900, h: 700 };
    coldPanel(ctx, PY.x, PY.y, PY.w, PY.h, t, { a: pa });
    ctx.save();
    rr(ctx, PY.x, PY.y, PY.w, PY.h, 48);
    ctx.clip();
    person(ctx, 360, 900, 1.15, t, { a: pa });
    door(ctx, 800, 960, 1.05, t, after(t, 'e-verdict', 2, 1.0, ease.inOut), pa);
    ctx.restore();
    pill(ctx, 'tek başına: hayır', 360, 620, { size: 32, fill: C.paper, color: C.ink, weight: 800, a: after(t, 'e-verdict', 0, 0.4), scale: lerp(0.7, 1, pop(t, cue('e-verdict', 0) + 0.2)) });
    pill(ctx, 'üşümek kapıyı aralar', 760, 1200, { size: 32, fill: C.paper, color: C.ink, weight: 800, a: after(t, 'e-verdict', 2, 0.4), scale: lerp(0.7, 1, pop(t, cue('e-verdict', 2))) });
    stamp(ctx, 'ŞÜPHELİ', C.amber, 540, 900, cue('e-verdict', 4) - 0.05, t, { size: 110, rot: -0.1 });
    T(ctx, 'virüs şart · üşümek işini kolaylaştırabilir', 540, 1330, { size: 30, weight: 800, color: C.muted, alpha: progress(t, cue('e-verdict', 4) + 0.5, cue('e-verdict', 4) + 0.9) });
  };

  // Bu kış dene: üç kart
  function dryer(ctx, x, y, s, t, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.navy;
    rr(ctx, -12, 0, 30, 70, 12);
    ctx.fill();
    dot(ctx, -10, -10, 38);
    rr(ctx, 10, -30, 56, 40, 10);
    ctx.fill();
    ctx.fillStyle = C.cyan;
    dot(ctx, -10, -10, 16);
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const u = (t * 1.5 + i / 3) % 1;
      const px = 70 + u * 28;
      ctx.globalAlpha = a * (1 - u);
      ctx.beginPath();
      ctx.moveTo(px, -30 + i * 14);
      ctx.quadraticCurveTo(px + 10, -36 + i * 14, px + 20, -30 + i * 14);
      ctx.stroke();
    }
    ctx.restore();
  }
  function scarfIcon(ctx, x, y, s, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.amber;
    rr(ctx, -60, -30, 120, 46, 23);
    ctx.fill();
    rr(ctx, 14, 0, 40, 90, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) line(ctx, 20, 30 + i * 20, 48, 30 + i * 20);
    ctx.fillStyle = C.teal;
    for (let i = 0; i < 4; i++) rr(ctx, 18 + i * 9, 86, 5, 18, 2), ctx.fill();
    ctx.restore();
  }
  function handsIcon(ctx, x, y, s, t, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.scale(sx, 1);
      ctx.rotate(-0.3);
      ctx.fillStyle = C.skin;
      ctx.strokeStyle = '#c98e68';
      ctx.lineWidth = 4;
      rr(ctx, 4, -50, 46, 90, 22);
      ctx.fill();
      ctx.stroke();
      rr(ctx, 40, -30, 18, 40, 9);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    for (let i = 0; i < 6; i++) {
      const u = (t * 0.6 + hash(i, 6)) % 1;
      const bx = -60 + hash(i, 7) * 120;
      const by = 20 - u * 110;
      ctx.strokeStyle = `rgba(110,193,201,${1 - u})`;
      ctx.fillStyle = `rgba(223,241,242,${0.7 * (1 - u)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx, by, 8 + hash(i, 8) * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  draw['e-tip'] = function (ctx, t, api) {
    const { cue, S0, after, pop, fadeIn } = api;
    dayBg(ctx, t);
    api.tag(ctx);
    const s0 = S0('e-tip');
    T(ctx, 'Bu kış dene', 540, 350, { hand: true, size: 80, weight: 700, color: C.teal, alpha: fadeIn(t, s0 + 0.15) });
    const cards = [
      ['Saçını kurut', 'sonra çık', C.amberSoft, (ctx2, x, y, a) => dryer(ctx2, x, y, 1.15, t, a)],
      ['Burnunu sıcak tut', 'atkı, boyunluk', C.cyanSoft, (ctx2, x, y, a) => scarfIcon(ctx2, x, y, 1.1, a)],
      ['Ellerini sık yıka', 'su ve sabunla, 20 saniye', C.greenSoft, (ctx2, x, y, a) => handsIcon(ctx2, x, y, 1.3, t, a)],
    ];
    cards.forEach(([title, sub, fill, icon], i) => {
      const at = cue('e-tip', i);
      const a = progress(t, at - 0.1, at + 0.35, ease.out);
      if (a <= 0) return;
      const y = 450 + i * 300;
      ctx.save();
      ctx.translate((1 - ease.out(a)) * (i % 2 ? 90 : -90), 0);
      card(ctx, 90, y, 900, 260, { r: 44, fill, a });
      icon(ctx, 230, y + 130, a);
      T(ctx, title, 360, y + 110, { size: 54, weight: 900, color: C.ink, align: 'left', alpha: a });
      T(ctx, sub, 360, y + 172, { size: 32, weight: 700, color: C.muted, align: 'left', alpha: a });
      ctx.restore();
      checkBadge(ctx, 930, y + 30, 34, { a, s: pop(t, at + 0.3) });
    });
  };

  draw['e-cta'] = function (ctx, t, api) {
    api.cta(ctx, t, { invite: 'Sıradaki efsaneyi sen seç!' });
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { cue, S0, end } = api;
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.4, pan });
    const popS = (t, n, g = 0.04, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    // 1 · rüzgâr, damla, uyarılar
    m.wind(0, end('e-hook') + 0.5, { gain: 0.05 });
    for (let x = 0.3; x < end('e-hook'); x += 0.55) m.blip(x, { freq: 1400 + (x * 300) % 500, dur: 0.05, gain: 0.012 });
    popS(cue('e-hook', 1), 'D5', 0.05);
    [0, 1, 2].forEach((i) => popS(cue('e-hook', 2) + i * 0.22, ['A4', 'C#5', 'E5'][i], 0.04, -0.3 + i * 0.3));
    // 2 · oy düğmeleri ve klavye
    popS(cue('e-vote', 0) + 0.3, 'F#4', 0.05, -0.3);
    popS(cue('e-vote', 1), 'B4', 0.05, 0.3);
    for (let i = 0; i < 12; i++) m.typeKey(cue('e-vote', 2) + 0.5 + i * 0.1, { gain: 0.06, pan: 0.1 });
    // 3 · soğuk ✕, virüs ✓
    m.click(cue('e-virus', 1) + 0.25, { gain: 0.12, tone: 900 });
    m.wobble(cue('e-virus', 2), 0.8, { gain: 0.05, freq: 160 });
    bell(cue('e-virus', 2) + 0.1, 'E5', 0.06);
    // 4 · burun: soğuma ve düşen sayaç
    m.whoosh(cue('e-nose', 1), { dur: 1.0, from: 2400, to: 500, gain: 0.05 });
    m.blip(cue('e-nose', 2), { freq: 880, dur: 1.4, slide: -500, gain: 0.025 });
    popS(cue('e-nose', 2) + 1.4, 'C#5', 0.06);
    // 5 · su, zamanlayıcı, sütunlar
    m.rain(S0('e-feet') + 0.2, 1.2, { gain: 0.05 });
    for (let i = 0; i < 12; i++) m.tick(cue('e-feet', 0) + i * 0.18, { gain: 0.035, tone: 4800 });
    popS(cue('e-feet', 1) + 0.6, 'E5');
    bell(cue('e-feet', 1) + 1.0, 'B5', 0.05);
    // 6 · hüküm
    const spin0 = cue('e-verdict', 3) - 0.1;
    for (let x = spin0; x < cue('e-verdict', 4); x += 0.12) m.tick(x, { gain: 0.05, tone: 3600 });
    m.boom(cue('e-verdict', 4), { gain: 0.2, freq: 85 });
    bell(cue('e-verdict', 4) + 0.05, 'F#5', 0.06);
    // 7 · öneriler
    [0, 1, 2].forEach((k, i) => popS(cue('e-tip', k), ['D5', 'F#5', 'A5'][i], 0.05, -0.3 + i * 0.3));
  }

  window.FILM = K.short({
    title: 'Islak saçla dışarı çıkarsan hasta olur musun? · YUP Akademi',
    series: 'EFSANE Mİ, GERÇEK Mİ?',
    extra: { 'e-hook': 0.8, 'e-vote': 1.3, 'e-virus': 0.9, 'e-nose': 1.3, 'e-feet': 1.2, 'e-verdict': 1.2, 'e-tip': 0.8, 'e-cta': 3.1 },
    lead: { 'e-hook': 0.4, 'e-vote': 0.35, 'e-virus': 0.4, 'e-nose': 0.4, 'e-feet': 0.4, 'e-verdict': 0.35, 'e-tip': 0.4, 'e-cta': 0.5 },
    titles: {
      'e-hook': 'Annenin sözü',
      'e-vote': 'Sence?',
      'e-virus': 'Soğuk mu, virüs mü?',
      'e-nose': 'Burnun savunması',
      'e-feet': 'Soğuk su deneyi',
      'e-verdict': 'Hüküm: şüpheli',
      'e-tip': 'Bu kış dene',
      'e-cta': 'YUP Akademi',
    },
    chords: {
      'e-hook': ['E3', 'B3', 'G4', 'D5'],
      'e-vote': ['C3', 'G3', 'E4', 'B4'],
      'e-virus': ['A2', 'E3', 'C4', 'G4'],
      'e-nose': ['F2', 'C3', 'A3', 'E4'],
      'e-feet': ['D3', 'A3', 'F#4', 'C#5'],
      'e-verdict': ['G2', 'D3', 'B3', 'F#4'],
      'e-tip': ['D3', 'A3', 'F#4', 'B4'],
      'e-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
