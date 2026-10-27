/*
 * YUP Akademi · "Bu sensin" kısa video (1080×1920) — Kahvesini içmeden konuşulamayan arkadaşın abartmıyor
 *
 * Gönder kalıbı: kanca bir insan tipini anlatır, bilim onu haklı çıkarır, tek çağrı sonda: "arkadaşına gönder".
 * Kurgu izleyiciyi kaybetmemek için kuruldu:
 *   - ilk karede yazı ve asık suratlı arkadaş hazır, 0,35. saniyede ilk olay ("Günaydın!" balonu);
 *   - her satırın içinde her öbekte görüntü değişir (kilitler dolar, belirtiler tek tek gelir);
 *   - 2. sahneden itibaren köşede "Birazdan: sabah kahvesinin sırrı" vaadi durur, 5. sahnede ödenir;
 *   - sabah sahnesi kancadaki asık surata geri döner, kapanış ise aynı arkadaşa kahve verir.
 * Sahneler: asık surat ve tıbbi tanı · kafein kilide oturur, beyin kilit ekler · kahve kesilince kilitler
 * yorgunlukla dolar, belirtiler · son fincandan 12 saat sonra: tam sabah · sabah kahvesi süper yapmaz, normale
 * döndürür (Rogers 2010) · arkadaşına gönder kapanışı. Ortak marka motoru: video/yup-marka/kisa.js.
 */
(function () {
  'use strict';

  const E = window.Engine;
  const { clamp, lerp, ease, progress, hash } = E;
  const K = window.YupKisa;
  const { C, T, M, rr, shadowed, card, pill, line, dot, dayBg, stamp, star, clockFace, sunIcon, moonIcon, bellIcon, avatar, PEOPLE } = K;
  const COF = '#6b3f22';
  const COF_DARK = '#3b2416';
  const CREMA = '#c8935a';
  const ADEN = '#4f7fd6';
  const ADEN_SOFT = '#dbe6fa';
  const PAIN = '#e5484d';
  const SKIN = '#f2c6a0';
  const HAIR = '#3a2a22';
  const CELL = '#f7dde7';
  const CELL_EDGE = '#e7b9cb';

  // ---------------------------------------------------------------------------
  // Çizimler
  // ---------------------------------------------------------------------------
  // Arkadaş (önden). Birim: baş yarıçapı 100. open: göz açıklığı, mouth: −1 asık … 1 gülen, 'wave' homurtu,
  // brow: 1 kızgın … −1 dertli, bags: göz altı morluğu, blush: yanak
  function friend(ctx, x, y, r, t, m = {}) {
    const { open = 1, mouth = 0, brow = 0, bags = 0, blush = 0, tilt = 0, a = 1 } = m;
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(r / 100, r / 100);
    // kapüşonlu gövde
    const hg = ctx.createLinearGradient(0, 100, 0, 300);
    hg.addColorStop(0, '#26469c');
    hg.addColorStop(1, C.navy);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-170, 320);
    ctx.bezierCurveTo(-170, 165, -100, 112, 0, 112);
    ctx.bezierCurveTo(100, 112, 170, 165, 170, 320);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    line(ctx, -30, 140, -36, 210);
    line(ctx, 30, 140, 36, 210);
    ctx.fillStyle = '#e3b08a';
    rr(ctx, -26, 72, 52, 52, 16);
    ctx.fill();
    // saç (arka) ve kulaklar
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    ctx.ellipse(0, -16, 104, 106, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SKIN;
    dot(ctx, -95, 12, 19);
    dot(ctx, 95, 12, 19);
    // yüz
    const fg = ctx.createRadialGradient(-30, -20, 20, 0, 10, 120);
    fg.addColorStop(0, '#f7d3b2');
    fg.addColorStop(1, '#ebb68f');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(0, 12, 91, 99, 0, 0, Math.PI * 2);
    ctx.fill();
    // yataktan yeni kalkmış perçem
    const w = Math.sin(t * 2.1) * 3;
    ctx.fillStyle = HAIR;
    ctx.beginPath();
    const pts = [[-96, 0], [-92, -55], [-122, -72 + w], [-74, -92], [-70, -140 + w], [-28, -108], [-2, -156 - w], [26, -110], [74, -134 + w], [70, -94], [112, -70 - w], [94, -30], [96, 2], [70, -50], [36, -38], [8, -58], [-26, -40], [-62, -56]];
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
    ctx.fill();
    // göz altı
    if (bags > 0) {
      ctx.strokeStyle = `rgba(122,82,140,${0.45 * bags})`;
      ctx.lineWidth = 5;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * 36, 16, 20, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
      }
    }
    // gözler: göz kapağı yukarıdan iner
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(sx * 36, 4, 21, 15, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx * 36 - 22, -12, 44, 32);
      ctx.fillStyle = C.ink;
      dot(ctx, sx * 36 + 2, 6, 8.5);
      ctx.fillStyle = '#fff';
      dot(ctx, sx * 36 + 5, 2, 2.6);
      const lid = -11 + 30 * (1 - open);
      ctx.fillStyle = '#efbf98';
      ctx.fillRect(sx * 36 - 24, -14, 48, lid + 14);
      ctx.restore();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(sx * 36 - 21, -11 + 30 * (1 - open) - 1);
      ctx.lineTo(sx * 36 + 21, -11 + 30 * (1 - open) - 1);
      ctx.stroke();
    }
    // kaşlar
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) line(ctx, sx * 16, -30 + brow * 9, sx * 56, -36 - brow * 5);
    // burun
    ctx.strokeStyle = 'rgba(160,96,60,0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-4, 18);
    ctx.quadraticCurveTo(6, 34, -6, 38);
    ctx.stroke();
    // yanaklar
    if (blush > 0) {
      ctx.fillStyle = `rgba(239,122,110,${0.4 * blush})`;
      dot(ctx, -58, 40, 15);
      dot(ctx, 58, 40, 15);
    }
    // ağız
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (mouth === 'wave') {
      for (let i = 0; i <= 8; i++) {
        const px = -26 + i * 6.5;
        const py = 60 + (i % 2 ? -5 : 5) + Math.sin(t * 20) * 1.2;
        if (i) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
    } else {
      ctx.moveTo(-26, 60);
      ctx.quadraticCurveTo(0, 60 + mouth * 24, 26, 60);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Kupa: (x, y) alt orta, s genişlik. fill: kahve var mı, steam: buhar
  function cup(ctx, x, y, s, t, { fill = 1, steam = 0, tilt = 0, a = 1 } = {}) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(s / 100, s / 100);
    ctx.fillStyle = 'rgba(18,59,58,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 60, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e4ded3';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(50, -60, 25, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    const g = ctx.createLinearGradient(-50, 0, 50, 0);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.65, '#f2eee7');
    g.addColorStop(1, '#d7cfc2');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-50, -110);
    ctx.lineTo(50, -110);
    ctx.lineTo(44, -8);
    ctx.quadraticCurveTo(42, 0, 32, 0);
    ctx.lineTo(-32, 0);
    ctx.quadraticCurveTo(-42, 0, -44, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.teal;
    ctx.beginPath();
    ctx.moveTo(-48.7, -76);
    ctx.lineTo(48.7, -76);
    ctx.lineTo(47.7, -60);
    ctx.lineTo(-47.7, -60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e3ddd2';
    ctx.beginPath();
    ctx.ellipse(0, -110, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    if (fill > 0) {
      ctx.fillStyle = COF;
      ctx.beginPath();
      ctx.ellipse(0, -107, 45, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = CREMA;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -107, 38, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#cbc3b6';
      ctx.beginPath();
      ctx.ellipse(0, -108, 44, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(107,63,34,0.5)';
      ctx.beginPath();
      ctx.ellipse(8, -106, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (steam > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * steam})`;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const x0 = -22 + i * 22;
        const ph = t * 2 + i * 1.7;
        ctx.beginPath();
        for (let k = 0; k <= 10; k++) {
          const yy = -122 - k * 9;
          const xx = x0 + Math.sin(ph + k * 0.6) * 8;
          if (k) ctx.lineTo(xx, yy);
          else ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Fırtına bulutu (şimşekli)
  function stormCloud(ctx, x, y, s, t, a = 1) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x + Math.sin(t * 1.5) * 6, y);
    ctx.scale(s, s);
    const flash = Math.max(0, Math.sin(t * 7.3)) > 0.93 || (t % 1.7 < 0.1);
    if (flash) {
      ctx.fillStyle = C.amber;
      ctx.beginPath();
      ctx.moveTo(4, 30);
      ctx.lineTo(-22, 88);
      ctx.lineTo(0, 84);
      ctx.lineTo(-14, 130);
      ctx.lineTo(26, 70);
      ctx.lineTo(4, 74);
      ctx.lineTo(20, 30);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = flash ? '#a9b3c9' : '#8a96b0';
    for (const [cx, cy, r] of [[-70, 10, 44], [-20, -14, 58], [44, -4, 50], [86, 18, 36], [10, 26, 46]]) dot(ctx, cx, cy, r);
    ctx.strokeStyle = 'rgba(79,127,214,0.55)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const dx = -70 + i * 36;
      const dy = 70 + ((t * 160 + i * 37) % 60);
      line(ctx, dx, dy, dx - 6, dy + 18);
    }
    ctx.restore();
  }

  // Konuşma balonu
  function bubble(ctx, x, y, str, { s = 1, fill = '#fff', color = C.ink, size = 44, tail = -1, rot = 0 } = {}) {
    if (s <= 0.01) return;
    const w = M(ctx, str, { size, weight: 900 }) + 64;
    const h = size * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    shadowed(ctx, () => {
      ctx.fillStyle = fill;
      rr(ctx, -w / 2, -h / 2, w, h, h / 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tail * w * 0.18, h / 2 - 4);
      ctx.lineTo(tail * w * 0.32, h / 2 + 30);
      ctx.lineTo(tail * w * 0.02, h / 2 - 4);
      ctx.closePath();
      ctx.fill();
    }, { blur: 24, oy: 10 });
    T(ctx, str, 0, 3, { size, weight: 900, color });
    ctx.restore();
  }

  // Sinir hücresinin yüzeyi ve kilitler (adenozin alıcıları)
  const SLOTS = Array.from({ length: 8 }, (_, i) => 130 + i * 117);
  const OLD = [1, 3, 5, 7];
  const NEW = [0, 2, 4, 6];
  function membrane(ctx, y, t, { tint = 0 } = {}) {
    const g = ctx.createLinearGradient(0, y, 0, y + 700);
    g.addColorStop(0, tint > 0 ? `rgba(219,230,250,1)` : CELL);
    g.addColorStop(1, '#f2c9d8');
    ctx.save();
    ctx.fillStyle = CELL;
    ctx.beginPath();
    ctx.moveTo(-20, y + 30);
    for (let x = -20; x <= 1100; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.012 + t * 0.8) * 8);
    ctx.lineTo(1100, 2000);
    ctx.lineTo(-20, 2000);
    ctx.closePath();
    ctx.fill();
    if (tint > 0) {
      ctx.globalAlpha = tint * 0.6;
      ctx.fillStyle = ADEN_SOFT;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = CELL_EDGE;
    for (let x = -10; x <= 1100; x += 26) dot(ctx, x, y + Math.sin(x * 0.012 + t * 0.8) * 8, 10);
    ctx.restore();
  }
  const surf = (x, y, t) => y + Math.sin(x * 0.012 + t * 0.8) * 8;
  function lock(ctx, x, y, s = 1) {
    if (s <= 0.01) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = C.teal;
    rr(ctx, -14, 0, 28, 46, 8);
    ctx.fill();
    shadowed(ctx, () => {
      ctx.fillStyle = C.teal;
      rr(ctx, -50, -66, 100, 78, 24);
      ctx.fill();
    }, { blur: 14, oy: 6 });
    ctx.fillStyle = C.tealSoft;
    rr(ctx, -32, -78, 64, 58, 20);
    ctx.fill();
    ctx.restore();
  }
  function bean(ctx, x, y, s = 1, rot = 0, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 36);
    g.addColorStop(0, '#9a5d32');
    g.addColorStop(1, COF_DARK);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a170c';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-24, -4);
    ctx.bezierCurveTo(-8, 10, 8, -12, 24, 4);
    ctx.stroke();
    ctx.restore();
  }
  function adenKey(ctx, x, y, s = 1, a = 1) {
    if (a <= 0.002 || s <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    shadowed(ctx, () => {
      ctx.fillStyle = ADEN;
      rr(ctx, -30, -26, 60, 52, 18);
      ctx.fill();
    }, { blur: 12, oy: 5, color: 'rgba(30,58,138,0.25)' });
    T(ctx, 'Zz', 0, 2, { size: 30, weight: 900, color: '#fff' });
    ctx.restore();
  }
  function cross(ctx, x, y, r, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = PAIN;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    line(ctx, x - r, y - r, x + r, y + r);
    line(ctx, x + r, y - r, x - r, y + r);
    ctx.restore();
  }

  // Öfke işareti (çizgi romandaki damar)
  function anger(ctx, x, y, s, a, t) {
    if (a <= 0.002) return;
    const k = s * (1 + 0.08 * Math.sin(t * 14));
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.strokeStyle = PAIN;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(10, -30);
      ctx.quadraticCurveTo(10, -10, 30, -10);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Köşedeki vaat: sabah kahvesinin sırrı birazdan
  function teaser(ctx, t, a) {
    if (a <= 0.002) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const str = 'Birazdan: sabah kahvesinin sırrı';
    const w = M(ctx, str, { size: 29, weight: 800 }) + 90;
    const x = 1010 - w;
    ctx.fillStyle = C.paper;
    rr(ctx, x, 268, w, 58, 29);
    ctx.fill();
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 3;
    ctx.stroke();
    // kum saati
    const cx = x + 32;
    const ph = (t * 0.6) % 1;
    ctx.save();
    ctx.translate(cx, 297);
    ctx.rotate(ph > 0.85 ? Math.PI * ((ph - 0.85) / 0.15) : 0);
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.moveTo(-10, -14);
    ctx.lineTo(10, -14);
    ctx.lineTo(0, 0);
    ctx.lineTo(10, 14);
    ctx.lineTo(-10, 14);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    T(ctx, str, x + 58, 299, { size: 29, weight: 800, color: C.ink, align: 'left' });
    ctx.restore();
  }

  // Başlık: büyük, ortalı, tek ya da iki satır
  function title(ctx, a, l1, l2, { y = 390, c1 = C.ink, c2 = PAIN, size = 76 } = {}) {
    if (a <= 0.002) return;
    const s = lerp(0.92, 1, ease.out(a));
    ctx.save();
    ctx.translate(540, y);
    ctx.scale(s, s);
    T(ctx, l1, 0, 0, { size, weight: 900, color: c1, alpha: a, spacing: 1 });
    if (l2) T(ctx, l2, 0, size * 1.08, { size, weight: 900, color: c2, alpha: a, spacing: 1 });
    ctx.restore();
  }

  function chip(ctx, str, x, y, a, { fill = PAIN, color = '#fff', size = 34, icon = null } = {}) {
    if (a <= 0.002) return;
    pill(ctx, str, x, y, { size, fill, color, scale: lerp(0.4, 1, ease.back(clamp(a))), a: clamp(a * 2) });
  }

  const draw = {};

  // ---------------------------------------------------------------------------
  // 1 · Asık surat: "Günaydın!" balonu, homurtu, tıbbi tanı
  // ---------------------------------------------------------------------------
  draw['k-hook'] = function (ctx, t, api) {
    const { S0, cue, pop, after } = api;
    const s0 = S0('k-hook');
    const u = t - s0;
    dayBg(ctx, t);
    const z = 1 + 0.06 * progress(u, 0, 5, ease.inOut);
    ctx.save();
    ctx.translate(540, 1080);
    ctx.scale(z, z);
    ctx.translate(-540, -1080);
    stormCloud(ctx, 540, 690, 1.15, t);
    const grr = pop(t, s0 + 1.0, 0.3);
    friend(ctx, 540, 1090, 225, t, { open: 0.32, mouth: grr > 0.5 && u < 2.6 ? 'wave' : -0.85, brow: 0.9, bags: 1, tilt: Math.sin(t * 1.4) * 0.025 });
    // masa ve boş kupa
    ctx.fillStyle = '#d9b48a';
    rr(ctx, -40, 1505, 1160, 520, 30);
    ctx.fill();
    ctx.fillStyle = '#c49a6c';
    ctx.fillRect(-40, 1505, 1160, 16);
    cup(ctx, 830, 1560, 150, t, { fill: 0, tilt: -0.08 });
    ctx.restore();
    // "Günaydın!" ve homurtu
    bubble(ctx, 255, 870, 'Günaydın!', { s: pop(t, s0 + 0.3, 0.4) * (1 - progress(u, 2.2, 2.5)), tail: 1, rot: -0.05 });
    const shake = grr > 0 ? Math.sin(t * 60) * 5 * Math.exp(-(u - 1.0) * 3) : 0;
    bubble(ctx, 830 + shake, 900, '#@%!', { s: grr * (1 - progress(u, 2.3, 2.6)), fill: PAIN, color: '#fff', size: 52, tail: -1, rot: 0.06 });
    // tıbbi tanı kartı
    const ca = after(t, 'k-hook', 1, 0.45);
    if (ca > 0) {
      ctx.save();
      ctx.translate(0, (1 - ca) * 380);
      card(ctx, 110, 1235, 860, 300, { r: 40 });
      T(ctx, 'TIBBİ TANI', 160, 1290, { size: 28, weight: 900, color: C.muted, align: 'left', spacing: 4 });
      T(ctx, 'Kafein yoksunluğu', 160, 1362, { size: 64, weight: 900, color: C.ink, align: 'left' });
      T(ctx, 'DSM-5 · Psikiyatri tanı kitabı', 160, 1430, { size: 32, weight: 700, color: C.teal, align: 'left' });
      ctx.restore();
    }
    stamp(ctx, 'GERÇEK', PAIN, 835, 1462, cue('k-hook', 2) + 0.15, t, { size: 50, rot: -0.1 });
    // başlık ilk kareden
    title(ctx, 1, 'KAHVESİZ', '= YOKSUNLUK', { y: 360, size: 92 });
    api.tag(ctx);
  };

  // ---------------------------------------------------------------------------
  // 2 · Kafein kilide oturur, yorgunluk sinyali giremez; her gün içersen beyin kilit ekler
  // ---------------------------------------------------------------------------
  const MY = 1250; // hücre yüzeyi
  const LS = 1.1; // kilit ölçeği
  const KS = 1.25; // anahtar ve çekirdek ölçeği
  function lockScene(ctx, t, api, { s0, c0, c1, c2, flood = -1, beansOut = -1 }) {
    const u = t - s0;
    dayBg(ctx, t);
    membrane(ctx, MY, t, { tint: flood > 0 ? progress(t, flood, flood + 1.2) : 0 });
    T(ctx, 'SİNİR HÜCRESİ', 540, MY + 150, { size: 30, weight: 900, color: 'rgba(160,80,110,0.45)', spacing: 6 });
    // kilitler
    const grow = (i) => (OLD.includes(i) ? 1 : c2 > 0 ? api.pop(t, c2 + 0.5 + NEW.indexOf(i) * 0.12, 0.45) : 0);
    SLOTS.forEach((x, i) => lock(ctx, x, surf(x, MY, t) - 18 * LS, grow(i) * LS));
    // kafein: önce tek bir çekirdek uçar, sonra kilitleri doldurur; yeni kilitlere de oturur
    const beanIn = (i) => {
      if (OLD.includes(i)) return i === 1 ? c0 + 0.45 : c1 + 0.15 + OLD.indexOf(i) * 0.22;
      return c2 > 0 ? c2 + 1.25 + NEW.indexOf(i) * 0.14 : Infinity;
    };
    SLOTS.forEach((x, i) => {
      const ti = beanIn(i);
      if (t < ti - 0.45) return;
      const p = progress(t, ti - 0.45, ti, ease.in);
      const sy = surf(x, MY, t) - 62 * LS;
      let bx = lerp(i === 1 ? 980 : x + 40, x, p);
      let by = lerp(i === 1 ? 560 : 760, sy, p);
      let a = 1;
      if (beansOut > 0) {
        const q = progress(t, beansOut + i * 0.05, beansOut + 0.5 + i * 0.05, ease.in);
        by -= q * 700;
        a = 1 - q;
      }
      bean(ctx, bx, by, KS, (1 - p) * 3 + Math.sin(t * 2 + i) * 0.05, a);
      if (p >= 1 && t - ti < 0.25) {
        ctx.save();
        ctx.strokeStyle = `rgba(245,158,11,${1 - (t - ti) / 0.25})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, sy, 52 + (t - ti) * 130, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });
    // yorgunluk sinyali (adenozin): üstte süzülür; dolu kilide dalınca geri seker
    const keys = [[200, 990], [430, 905], [650, 995], [880, 900], [320, 780], [770, 770]];
    keys.forEach(([kx, ky], i) => {
      let x = kx + Math.sin(t * 1.3 + i * 2) * 18;
      let y = ky + Math.cos(t * 1.7 + i) * 14;
      if (flood > 0) {
        // kahve kesilince hepsi boş kilitlere dolar
        const target = SLOTS[i % 8];
        const p = progress(t, flood + 0.1 + i * 0.07, flood + 0.6 + i * 0.07, ease.inOut);
        x = lerp(x, target, p);
        y = lerp(y, surf(target, MY, t) - 62 * LS, p);
        adenKey(ctx, x, y, KS, 1);
        return;
      }
      if (t > c1 + 0.2 && c1 > 0) {
        const q = ((t - c1 - 0.2 - i * 0.37) % 2.2) / 0.7;
        if (q > 0 && q < 1) {
          const target = SLOTS[OLD[i % 4]];
          const d = Math.sin(Math.PI * q);
          x = lerp(x, target, d * 0.8);
          y = lerp(y, surf(target, MY, t) - 150, d);
          if (q > 0.35 && q < 0.75) cross(ctx, target + 52, surf(target, MY, t) - 175, 16, 1);
        }
      }
      adenKey(ctx, x, y, KS, api.fadeIn(t, s0 + 0.15 + i * 0.06, 0.3));
    });
    // fazladan sinyaller: taşma
    if (flood > 0) {
      SLOTS.forEach((x, i) => {
        if (i < 6) return;
        const p = progress(t, flood + 0.55 + i * 0.07, flood + 0.95 + i * 0.07, ease.inOut);
        adenKey(ctx, x, lerp(640, surf(x, MY, t) - 62 * LS, p), KS, p > 0 ? 1 : 0);
      });
      SLOTS.forEach((x, i) => {
        if (i >= 6) return;
        const p = progress(t, flood + 0.1 + i * 0.07, flood + 0.6 + i * 0.07, ease.inOut);
        if (p >= 1 && t - (flood + 0.6 + i * 0.07) < 0.3) {
          ctx.save();
          ctx.strokeStyle = `rgba(79,127,214,${1 - (t - flood - 0.6 - i * 0.07) / 0.3})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(x, surf(x, MY, t) - 62 * LS, 52 + (t - flood - 0.6 - i * 0.07) * 130, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
    }
    return u;
  }

  draw['k-lock'] = function (ctx, t, api) {
    const { S0, cue, fadeIn } = api;
    const s0 = S0('k-lock');
    const c0 = cue('k-lock', 0);
    const c1 = cue('k-lock', 1);
    const c2 = cue('k-lock', 2);
    lockScene(ctx, t, api, { s0, c0, c1, c2 });
    // etiketler
    chip(ctx, 'KAFEİN', 880, 560, progress(t, c0, c0 + 0.35), { fill: COF, size: 38 });
    const ya = fadeIn(t, c1 + 0.1, 0.35);
    if (ya > 0) {
      T(ctx, 'yorgunluk sinyali', 300, 690, { hand: true, size: 60, weight: 700, color: ADEN, alpha: ya });
      T(ctx, 'kilit dolu, giremiyor', 540, 1490, { hand: true, size: 54, weight: 700, color: C.teal, alpha: ya * (1 - fadeIn(t, c2, 0.3)) });
    }
    // her gün: gün sayacı ve +4 kilit
    if (c2 > 0 && t > c2) {
      const day = Math.min(30, 1 + Math.floor(progress(t, c2, c2 + 1.1, ease.linear) * 29));
      chip(ctx, `${day}. GÜN`, 540, 1450, fadeIn(t, c2, 0.25), { fill: C.navy, size: 36 });
      chip(ctx, '+4 KİLİT', 540, 1555, progress(t, c2 + 0.55, c2 + 0.9), { fill: C.amber, color: '#1b1204', size: 44 });
    }
    title(ctx, fadeIn(t, s0 + 0.05, 0.3), 'BEYNİNDEKİ', 'KİLİTLER', { c2: C.teal, size: 74 });
    teaser(ctx, t, fadeIn(t, s0 + 0.6, 0.4));
    api.tag(ctx);
  };

  // ---------------------------------------------------------------------------
  // 3 · Kahve kesilince kilitler yorgunlukla dolar; belirtiler tek tek
  // ---------------------------------------------------------------------------
  draw['k-crash'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-crash');
    const c0 = cue('k-crash', 0);
    const c1 = cue('k-crash', 1);
    const c2 = cue('k-crash', 2);
    const c3 = cue('k-crash', 3);
    const sw = progress(t, c1 - 0.25, c1 + 0.2, ease.inOut);
    if (sw < 1) {
      ctx.save();
      ctx.globalAlpha = 1 - sw;
      lockScene(ctx, t, api, { s0, c0: -9, c1: -9, c2: s0 - 5, flood: s0 + 0.55, beansOut: s0 + 0.1 });
      // kahve yok işareti
      const na = pop(t, s0 + 0.05, 0.4);
      ctx.save();
      ctx.translate(540, 680);
      ctx.scale(na, na);
      cup(ctx, 0, 70, 130, t, { fill: 0 });
      cross(ctx, 0, 6, 76, 1);
      ctx.restore();
      chip(ctx, 'HEPSİ YORGUNLUKLA DOLDU', 540, 1460, progress(t, s0 + 1.3, s0 + 1.65), { fill: ADEN, size: 36 });
      ctx.restore();
    }
    if (sw > 0) {
      ctx.save();
      ctx.globalAlpha = sw;
      dayBg(ctx, t);
      // belirtiye göre yüz
      const st = t < c2 ? 1 : t < c3 ? 2 : 3;
      const face = st === 1 ? { open: 0.12, mouth: -0.7, brow: -0.7, bags: 1, tilt: Math.sin(t * 9) * 0.015 } : st === 2 ? { open: 0.55, mouth: 'wave', brow: 1, bags: 1, tilt: Math.sin(t * 30) * 0.01 } : { open: 0.08, mouth: -0.3, brow: -0.3, bags: 1, tilt: 0.12 * progress(t, c3, c3 + 0.6) };
      friend(ctx, 540, 1150, 220, t, face);
      // baş ağrısı: şakaklarda zonklama
      const ha = fadeIn(t, c1, 0.2);
      if (ha > 0) {
        for (const sx of [-1, 1]) {
          for (let k = 0; k < 2; k++) {
            const q = ((t * 1.6 + k * 0.5) % 1);
            ctx.save();
            ctx.globalAlpha = ha * (1 - q) * 0.9;
            ctx.strokeStyle = PAIN;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.arc(540 + sx * 205, 1110, 20 + q * 70, sx > 0 ? -0.9 : Math.PI - 0.9 + 0, sx > 0 ? 0.9 : Math.PI + 0.9);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      if (t > c2) anger(ctx, 680, 905, 1.3, fadeIn(t, c2, 0.15) * (1 - fadeIn(t, c3 + 0.3, 0.3)), t);
      // uyuşukluk: Zzz
      if (t > c3) {
        const za = fadeIn(t, c3, 0.25);
        for (let k = 0; k < 3; k++) {
          const q = (t * 0.8 + k / 3) % 1;
          T(ctx, 'Z', 740 + q * 150 + k * 12, 930 - q * 300, { size: 70 + k * 18, weight: 900, color: ADEN, alpha: za * Math.sin(Math.PI * q) });
        }
      }
      chip(ctx, 'BAŞ AĞRISI', 250, 760, progress(t, c1, c1 + 0.35));
      chip(ctx, 'SİNİRLİLİK', 830, 690, progress(t, c2, c2 + 0.35), { fill: C.amber, color: '#1b1204' });
      chip(ctx, 'UYUŞUKLUK', 300, 1520, progress(t, c3, c3 + 0.35), { fill: ADEN });
      T(ctx, 'deneylerde her 2 kişiden 1\'inde baş ağrısı', 540, 560, { size: 30, weight: 800, color: C.muted, alpha: fadeIn(t, c1 + 0.6, 0.4) });
      ctx.restore();
    }
    title(ctx, 1, 'KAHVEYİ', 'KESİNCE', { c2: ADEN, size: 74 });
    teaser(ctx, t, 1);
    api.tag(ctx);
  };

  // ---------------------------------------------------------------------------
  // 4 · Son fincandan 12 saat sonra: tam sabah (kancadaki asık surata dönüş)
  // ---------------------------------------------------------------------------
  draw['k-morning'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-morning');
    const c0 = cue('k-morning', 0);
    const c1 = cue('k-morning', 1);
    dayBg(ctx, t);
    const spin = progress(t, c0 + 0.2, c1 - 0.05, ease.inOut);
    const night = clamp(spin * 3.5);
    const dawn = progress(t, c1 - 0.3, c1 + 0.35);
    // pencere: akşam turuncusu → gece laciverti → şafak
    const sky = (a, b) => {
      const g = ctx.createLinearGradient(0, 560, 0, 1470);
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      return g;
    };
    ctx.save();
    shadowed(ctx, () => {
      rr(ctx, 90, 560, 900, 910, 48);
      ctx.fillStyle = sky('#f6b46b', '#f7dcae');
      ctx.fill();
    }, { blur: 30, oy: 12 });
    rr(ctx, 90, 560, 900, 910, 48);
    ctx.clip();
    ctx.globalAlpha = clamp(night * 1.3) * (1 - dawn);
    ctx.fillStyle = sky('#0b1638', '#1e3a8a');
    ctx.fillRect(90, 560, 900, 910);
    ctx.globalAlpha = dawn;
    ctx.fillStyle = sky('#9fd3e8', '#fde7b8');
    ctx.fillRect(90, 560, 900, 910);
    ctx.globalAlpha = 1;
    const na = clamp(night * 1.4) * (1 - dawn);
    moonIcon(ctx, 200, 800, 50, { a: na, color: '#f4e7c3' });
    for (let i = 0; i < 9; i++) star(ctx, 140 + hash(i, 3) * 800, 640 + hash(i, 4) * 700, 8 + hash(i, 5) * 9, na * (0.6 + 0.4 * Math.sin(t * 3 + i)), '#f4e7c3');
    const sunA = pop(t, c1, 0.5);
    if (sunA > 0) sunIcon(ctx, 860, 860 - 80 * clamp(sunA), 60, t, { a: clamp(sunA) });
    ctx.restore();
    // saat 18.00 → 06.00
    const ring = t > c1 ? Math.sin((t - c1) * 40) * 0.04 * Math.exp(-(t - c1) * 1.5) : 0;
    ctx.save();
    ctx.translate(540, 1030);
    ctx.rotate(ring);
    const tm = 18 * 60 + spin * 12 * 60;
    // akrep 12 saatte bir tam tur atar: geçen süre saatin çevresinde dolan halka
    ctx.strokeStyle = 'rgba(245,158,11,0.9)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    if (spin > 0.005) {
      ctx.beginPath();
      ctx.arc(0, 0, 290, Math.PI / 2, Math.PI / 2 + spin * Math.PI * 2);
      ctx.stroke();
    }
    clockFace(ctx, 0, 0, 250, tm);
    ctx.restore();
    if (t > c1) {
      for (const sx of [-1, 1]) bellIcon(ctx, 540 + sx * 300, 800, 1.6, Math.sin((t - c1) * 32) * 0.4, C.navy);
    }
    chip(ctx, 'SON FİNCAN 18.00', 540, 650, fadeIn(t, s0 + 0.1, 0.3), { fill: COF, size: 32 });
    const hrs = Math.round(spin * 12);
    chip(ctx, `+${hrs} SAAT`, 540, 1395, fadeIn(t, c0 + 0.25, 0.3), { fill: C.amber, color: '#1b1204', size: 42 });
    // kancadaki asık surat geri döner
    const fa = pop(t, c1 + 0.1, 0.45);
    if (fa > 0) {
      ctx.save();
      ctx.translate(840, 1560);
      ctx.scale(fa, fa);
      stormCloud(ctx, 0, -250, 0.6, t);
      friend(ctx, 0, 0, 115, t, { open: 0.3, mouth: -0.85, brow: 0.9, bags: 1 });
      ctx.restore();
      chip(ctx, 'YOKSUNLUK BAŞLADI', 330, 1540, progress(t, c1 + 0.25, c1 + 0.6), { size: 32 });
    }
    title(ctx, fadeIn(t, s0, 0.3) * (1 - fadeIn(t, c1, 0.2)), '12 SAAT', 'SONRA', { c2: COF, size: 80 });
    title(ctx, fadeIn(t, c1, 0.25), 'TAM SABAH', null, { c1: C.amber, size: 96 });
    teaser(ctx, t, 1);
    api.tag(ctx);
  };

  // ---------------------------------------------------------------------------
  // 5 · Vaadin ödendiği yer: sabah kahvesi süper yapmaz, normale döndürür (Rogers ve ark. 2010)
  // ---------------------------------------------------------------------------
  const X0 = 170;
  const XC = 600; // kahve anı
  const X1 = 940;
  const YB = 980; // kahve içmeyen (taban)
  const YD = 1185; // gece başlayan yoksunluk
  const YS = 760; // sandığın: süper
  const drinker = (x) => (x <= XC ? YB + (YD - YB) * smooth01((x - X0) / (480 - X0)) : lerp(YD - 5, YB, smooth01((x - XC) / 110)));
  const myth = (x) => lerp(YD - 5, YS, smooth01((x - XC) / 140));
  function smooth01(u) {
    const v = clamp(u);
    return v * v * (3 - 2 * v);
  }
  function curve(ctx, f, xa, xb, color, width, dash = null) {
    if (xb <= xa) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    for (let x = xa; x <= xb; x += 4) {
      if (x === xa) ctx.moveTo(x, f(x));
      else ctx.lineTo(x, f(x));
    }
    ctx.lineTo(xb, f(xb));
    ctx.stroke();
    ctx.restore();
  }

  draw['k-twist'] = function (ctx, t, api) {
    const { S0, cue, fadeIn, pop } = api;
    const s0 = S0('k-twist');
    const c0 = cue('k-twist', 0);
    const c1 = cue('k-twist', 1);
    const c2 = cue('k-twist', 2);
    const c3 = cue('k-twist', 3);
    dayBg(ctx, t);
    const ca = fadeIn(t, s0 + 0.05, 0.35);
    card(ctx, 70, 560, 940, 900, { r: 44, a: ca });
    ctx.save();
    ctx.globalAlpha *= ca;
    T(ctx, 'UYANIKLIK', 120, 625, { size: 30, weight: 900, color: C.muted, align: 'left', spacing: 4 });
    // eksen ve zaman etiketleri
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 4;
    line(ctx, X0 - 30, 1290, X1 + 10, 1290);
    [['akşam', X0], ['gece', 390], ['sabah', XC], ['öğle', 860]].forEach(([s, x]) => T(ctx, s, x, 1335, { size: 30, weight: 800, color: C.muted }));
    // kahve içmeyen: taban çizgisi
    const bp = progress(t, s0 + 0.2, s0 + 0.8);
    curve(ctx, () => YB, X0, lerp(X0, X1, bp), C.grey, 6, [14, 12]);
    T(ctx, 'kahve içmeyen', X1 - 10, YB - 34, { size: 30, weight: 800, color: C.grey, align: 'right', alpha: bp });
    ctx.restore();
    // her gün içen: gece yoksunluğa düşer
    const dp = progress(t, c1, c1 + 1.1, ease.inOut);
    if (dp > 0) {
      const xe = lerp(X0, XC, dp);
      ctx.save();
      ctx.fillStyle = 'rgba(79,127,214,0.16)';
      ctx.beginPath();
      ctx.moveTo(X0, YB);
      for (let x = X0; x <= xe; x += 4) ctx.lineTo(x, drinker(x));
      ctx.lineTo(xe, YB);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      curve(ctx, drinker, X0, xe, C.teal, 10);
      T(ctx, 'her gün içen', 300, YD + 40, { size: 32, weight: 900, color: C.teal, alpha: fadeIn(t, c1 + 0.3, 0.3) });
      T(ctx, 'yoksunluk', 455, YB + 85, { hand: true, size: 50, weight: 700, color: ADEN, alpha: fadeIn(t, c1 + 0.7, 0.3) });
    }
    // kahve anı
    const cp = pop(t, c2 - 0.1, 0.4);
    if (cp > 0) {
      ctx.save();
      ctx.translate(XC, 1290);
      ctx.scale(cp, cp);
      cup(ctx, 0, -12, 70, t, { fill: 1, steam: 1 });
      ctx.restore();
    }
    // sandığın: süper (kesikli), sonra üstü çizilir
    const mp = progress(t, c2 + 0.1, c2 + 0.8, ease.inOut);
    const mx = fadeIn(t, c3 - 0.15, 0.25);
    if (mp > 0) {
      curve(ctx, myth, XC, lerp(XC, X1, mp), `rgba(245,158,11,${1 - 0.55 * mx})`, 8, [16, 12]);
      T(ctx, 'SÜPER?', 820, YS - 50, { size: 44, weight: 900, color: C.amber, alpha: mp * (1 - 0.55 * mx) });
      cross(ctx, 820, YS - 50, 46, mx);
    }
    // gerçek: sadece normale döner
    const np = progress(t, c3, c3 + 0.6, ease.inOut);
    if (np > 0) {
      curve(ctx, drinker, XC, lerp(XC, X1, np), C.teal, 10);
      if (np > 0.6) {
        ctx.fillStyle = C.teal;
        dot(ctx, 720, YB, 14);
      }
      chip(ctx, 'NORMAL', 800, YB + 70, progress(t, c3 + 0.4, c3 + 0.75), { fill: C.teal, size: 40 });
    }
    T(ctx, 'Rogers ve ark., Neuropsychopharmacology, 2010 · 379 kişi', 540, 1505, { size: 26, weight: 700, color: C.muted, alpha: fadeIn(t, c1, 0.4) });
    title(ctx, fadeIn(t, c0 - 0.05, 0.3) * (1 - fadeIn(t, c3, 0.2)), 'SABAH KAHVESİNİN', 'SIRRI', { c2: C.amber, size: 70 });
    title(ctx, fadeIn(t, c3, 0.25), 'SÜPER DEĞİL,', 'SADECE NORMAL', { c1: C.ink, c2: C.teal, size: 72 });
    api.tag(ctx);
  };

  // ---------------------------------------------------------------------------
  // 6 · Kapanış: arkadaşına gönder; ilk arkadaşa kahve gelir
  // ---------------------------------------------------------------------------
  draw['k-cta'] = function (ctx, t, api) {
    api.cta(ctx, t, { share: ['Kahvesiz yapamayan', 'arkadaşına gönder'] });
    const c1 = api.cue('k-cta', 1);
    const ka = api.pop(t, c1 + 0.1, 0.45);
    if (ka > 0) {
      const ia = api.fadeIn(t, api.S0('k-cta') + 0.15, 0.4);
      ctx.save();
      ctx.globalAlpha *= ia;
      cup(ctx, 268, 488, 52 * ka, t, { fill: 1, steam: 1 });
      for (let i = 0; i < 4; i++) {
        const q = clamp((t - c1 - 0.2) / 0.8);
        if (q <= 0 || q >= 1) continue;
        const th = (i / 4) * Math.PI * 2;
        star(ctx, 205 + Math.cos(th) * (50 + q * 30), 445 + Math.sin(th) * (50 + q * 30), 10 * (1 - q), 1, C.amber);
      }
      ctx.restore();
    }
  };

  // ---------------------------------------------------------------------------
  // Ses
  // ---------------------------------------------------------------------------
  function score(m, hz, api) {
    const { cue, S0, end } = api;
    const pop = (t, n, g = 0.05, pan = 0) => m.pop(t, { freq: hz(n), gain: g, pan });
    const bell = (t, n, g = 0.06, pan = 0) => m.bell(t, { freq: hz(n), gain: g, decay: 2.2, pan });
    // 1 · homurtu, balonlar, tanı damgası
    const s1 = S0('k-hook');
    pop(s1 + 0.3, 'E5', 0.06, -0.4);
    m.wobble(s1 + 1.0, 0.7, { gain: 0.1, freq: 120 });
    m.buzz(s1 + 1.0, { gain: 0.05, dur: 0.25 });
    m.whoosh(cue('k-hook', 1), { dur: 0.5, from: 500, to: 1600, gain: 0.04 });
    m.boom(cue('k-hook', 2) + 0.2, { gain: 0.22, freq: 80 });
    m.click(cue('k-hook', 2) + 0.2, { gain: 0.2, tone: 1500 });
    // 2 · çekirdek uçar, kilitler dolar, gün sayacı, yeni kilitler
    m.whoosh(cue('k-lock', 0), { dur: 0.5, from: 2400, to: 700, gain: 0.05, panFrom: 0.5, panTo: -0.1 });
    pop(cue('k-lock', 0) + 0.45, 'A4', 0.07);
    ['C#5', 'E5', 'A5'].forEach((n, i) => pop(cue('k-lock', 1) + 0.37 + i * 0.22, n, 0.05, -0.3 + i * 0.3));
    for (let i = 0; i < 10; i++) m.tick(cue('k-lock', 2) + i * 0.11, { gain: 0.03, tone: 4200 });
    ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => m.blip(cue('k-lock', 2) + 0.5 + i * 0.12, { freq: hz(n), dur: 0.12, gain: 0.03 }));
    // 3 · kahve kesilir, kilitler dolar, belirtiler
    const s3 = S0('k-crash');
    m.whoosh(s3 + 0.1, { dur: 0.6, from: 600, to: 3000, gain: 0.05 });
    m.riser(s3 + 0.4, 1.0, { gain: 0.05 });
    for (let i = 0; i < 8; i++) m.blip(s3 + 0.7 + i * 0.07, { freq: 300 - i * 18, dur: 0.1, gain: 0.025 });
    m.heartbeat(cue('k-crash', 1), { gain: 0.45 });
    m.heartbeat(cue('k-crash', 1) + 0.55, { gain: 0.35 });
    m.buzz(cue('k-crash', 2), { gain: 0.05, dur: 0.3 });
    m.blip(cue('k-crash', 3), { freq: 520, dur: 0.6, slide: 0.45, gain: 0.04 });
    // 4 · saat döner, alarm çalar
    const c40 = cue('k-morning', 0);
    const c41 = cue('k-morning', 1);
    for (let x = c40 + 0.2; x < c41; x += 0.12) m.tick(x, { gain: 0.03, tone: 3000 });
    for (let i = 0; i < 6; i++) bell(c41 + i * 0.13, i % 2 ? 'E6' : 'C#6', 0.045, i % 2 ? 0.3 : -0.3);
    // 5 · grafik, sandığın, gerçek
    m.whoosh(S0('k-twist') + 0.05, { dur: 0.5, from: 700, to: 2000, gain: 0.04 });
    m.riser(cue('k-twist', 2), 0.7, { gain: 0.04 });
    m.buzz(cue('k-twist', 3) - 0.15, { gain: 0.05, dur: 0.2 });
    bell(cue('k-twist', 3) + 0.45, 'A5', 0.07);
    // kapanış: kahve gelir
    pop(cue('k-cta', 1) + 0.1, 'F#5', 0.06, -0.3);
    bell(cue('k-cta', 1) + 0.25, 'B5', 0.04, -0.3);
  }

  window.FILM = K.short({
    title: 'Kahvesiz yapamayan arkadaşın · YUP Akademi',
    series: 'BU SENSİN',
    share: true,
    gap: 0.12,
    breath: 0.2,
    wipe: 0.35,
    extra: { 'k-hook': 0.35, 'k-lock': 0.45, 'k-crash': 0.4, 'k-morning': 0.45, 'k-twist': 0.8, 'k-cta': 2.0 },
    lead: { 'k-hook': 0.1, 'k-lock': 0.15, 'k-crash': 0.2, 'k-morning': 0.15, 'k-twist': 0.15, 'k-cta': 0.3 },
    titles: {
      'k-hook': 'Asık surat',
      'k-lock': 'Kilit',
      'k-crash': 'Yoksunluk',
      'k-morning': 'Tam sabah',
      'k-twist': 'Sabah kahvesinin sırrı',
      'k-cta': 'Arkadaşına gönder',
    },
    chords: {
      'k-hook': ['D3', 'A3', 'F#4', 'B4'],
      'k-lock': ['B2', 'F#3', 'D4', 'A4'],
      'k-crash': ['G2', 'D3', 'A#3', 'F4'],
      'k-morning': ['E3', 'B3', 'G#4', 'D5'],
      'k-twist': ['A2', 'E3', 'C#4', 'G#4'],
      'k-cta': ['D3', 'A3', 'F#4', 'A4'],
    },
    draw,
    score,
  });
})();
