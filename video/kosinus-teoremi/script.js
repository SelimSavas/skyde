/*
 * KOSİNÜS TEOREMİNİ SIFIRDAN ÖĞRENİYORUM — sahne sahne senaryo
 *
 * Bu dosya videonun tek kaynağıdır: seslendirme metni (s.say), görseller ve zamanlama
 * buradan gelir; SENARYO.md ve altyazılar da bu dosyadan otomatik üretilir.
 *
 * Renk dili (her örnekte aynı):  1. kenar {a} mavi · 2. kenar {b} pembe · açı {g} turuncu · aranan/sonuç {x} yeşil
 * Zaman: {at: 0.4} = repliğin %40'ı konuşulduğunda;  {end: true} = replik bittiğinde.
 */
'use strict';
const { M } = VIDEO;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ortak yerleşim
const TRI = { x: 60, y: 140, w: 780, h: 660 };       // sol panel: üçgen
const NOTE = { x: 90, y: 818 };                      // sol alt: küçük not
const Q = { x: 880, y: 140, w: 980 };                // sağ üst: soru kartı
const RX = 880;                                      // sağ panel: işlemler

const note = (s, html, o = {}) => s.add(`<div class="note ${o.c || ''}">${html}</div>`, { ...NOTE, anim: 'pop', ...o });
const card = (s, html, o = {}) => s.add(`<div class="card ${o.c || ''}">${html}</div>`, { anim: 'fade', ...o });
const badge = (s, big, small) => {
  const it = s.add(`<div class="badge">${big}<small>${small}</small></div>`, { x: 960, y: 500, ax: 0.5, ay: 0.5, anim: 'pop', dur: 0.8 });
  s.hide(it, { end: true, after: -0.2 });
  return it;
};

function calculator(s, o) {
  const keys = [
    ['SHIFT', 'MODE', '◀', '▶', 'AC'],
    ['sin', 'cos', 'tan', '(', ')'],
    ['7', '8', '9', '×', '÷'],
    ['4', '5', '6', '+', '−'],
    ['1', '2', '3', '0', '=']
  ];
  let g = '';
  keys.forEach((row, r) => row.forEach((k, c) => {
    const x = 34 + c * 68, y = 252 + r * 66;
    const cls = k === 'SHIFT' ? 'k-shift' : k === 'cos' ? 'k-cos' : '';
    const fill = k === 'SHIFT' ? '#ffe066' : '#f4f1e6';
    g += `<g class="key ${cls}"><rect class="b" x="${x}" y="${y}" width="58" height="46" rx="10"/>` +
      `<rect class="ov" x="${x - 4}" y="${y - 4}" width="66" height="54" rx="13" fill="rgba(255,224,102,.3)" stroke="#ffe066" stroke-width="5"/>` +
      `<text x="${x + 29}" y="${y + 23}" font-size="${k.length > 3 ? 15 : 21}" fill="${fill}">${k}</text></g>`;
    if (r === 1 && c < 3) g += `<text x="${x + 29}" y="${y - 11}" font-size="14" fill="#ffe066">${k}⁻¹</text>`;
  }));
  const svg = `<svg class="calc" width="410" height="600" viewBox="0 0 410 600">
    <rect x="3" y="3" width="404" height="594" rx="38" fill="#24343a" stroke="#4a5d64" stroke-width="4"/>
    <rect x="30" y="36" width="350" height="160" rx="14" fill="#cfe0c4"/>
    <g class="k-deg"><rect class="ov" x="38" y="44" width="70" height="34" rx="8" fill="rgba(255,224,102,.6)" stroke="#e0a800" stroke-width="3"/>
      <text x="73" y="61" font-size="22" fill="#24332b">DEG</text></g>
    <text x="48" y="112" font-size="34" fill="#1d2a22" style="text-anchor:start">${o.line}</text>
    <text x="364" y="164" font-size="48" fill="#1d2a22" style="text-anchor:end">${o.res}</text>
    ${g}</svg>`;
  return s.add(svg, { x: o.x, y: o.y, anim: 'pop', ...o.t });
}

function countdown(s, o = {}) {
  const b = s.cur;
  const it = s.add(`<div class="cdw"><div class="cd"><svg width="300" height="300"><circle cx="150" cy="150" r="120" class="cdbg"/><circle cx="150" cy="150" r="120" class="cdfg"/></svg><div class="cdn">5</div></div>` +
    `<div class="cdt">Düşünme zamanı!</div><div class="cdh"><i class="pause"></i>İstersen videoyu durdur</div></div>`,
    { x: o.x || 1370, y: o.y || 590, ax: 0.5, ay: 0.5, anim: 'pop', dur: 0.5 });
  s.hide(it, { end: true, after: -0.25, dur: 0.3 });
  const fg = it.el.querySelector('.cdfg'), num = it.el.querySelector('.cdn'), C = 2 * Math.PI * 120;
  fg.style.strokeDasharray = C;
  s.hook(t => {
    if (t < b.start - 0.1 || t > b.start + b.dur + 0.1) return '';
    const e = clamp((t - b.start) / b.speak), n = Math.max(1, Math.ceil(b.speak - (t - b.start) - 1e-6));
    fg.style.strokeDashoffset = (C * e).toFixed(1);
    if (num.textContent != n) num.textContent = n;
    return n + ',' + e.toFixed(3);
  });
}

/* ======================================================================= */
/* BÖLÜM 1 — Üçgeni Hatırlayalım                                            */
/* ======================================================================= */
VIDEO.scene({
  id: '01', label: 'BÖLÜM 1', title: 'Üçgeni Hatırlayalım', target: '1 dk', noHeader: true,
  notes: [
    'Açılış kartı: "Kosinüs Teoremini Sıfırdan Öğreniyorum" başlığı ortada büyük, altında "10. Sınıf · Matematik".',
    'Sol panelde sade bir üçgen kendini çizer. Sorular sağda tek tek belirir; cevap gelince yeşil onay işareti.',
    '"Kaç kenar?" sorusunda üç kenar sırayla parlar; "kaç açı?" sorusunda üç köşeye yay çizilir.',
    'Pisagor anında üçgen yumuşak bir geçişle dik üçgene dönüşür, dik açı karesi belirir; a² + b² = c² kartı sağda.',
    '"Sadece dik üçgenlerde!" uyarısı kırmızı çerçeveli kartla gelir.',
    'Kapanışta üçgen tekrar dik olmayan bir üçgene dönüşür; iki kenar ve aradaki açı parlarken üçüncü kenarda "?" kalır.'
  ]
}, s => {
  s.say('Merhaba arkadaşlar! Bugün birlikte kosinüs teoremini sıfırdan öğreneceğiz. Hiç merak etmeyin; adım adım, yavaş yavaş ilerleyeceğiz.',
    { cue: 'Açılış kartı', hold: 0.6 });
  const t1 = s.add(`<div class="title-xl">Kosinüs Teoremini<br><em>Sıfırdan</em> Öğreniyorum</div>`, { x: 960, y: 450, ax: 0.5, ay: 0.5, anim: 'pop', dur: 1 });
  const t2 = s.add(`<div class="title-sub">10. Sınıf · Matematik</div>`, { x: 960, y: 640, ax: 0.5, at: 0.15 });
  s.hide([t1, t2], { end: true, after: -0.3 });

  s.say('Önce küçük bir ısınma yapalım. Bir üçgenin kaç kenarı vardır?', { cue: 'Üçgen çizilir, soru sağda' });
  s.header();
  const T = s.tri({
    ...TRI, p: 5, q: 4.2, ang: 65, angs: [90, 60], cols: { p: 'a', q: 'b', r: 'x' },
    lbl: { p: 'a', q: 'b', r: '?' }, angLbl: 'açı', arcs: ['1', '2'],
    hide: ['sl-p', 'sl-q', 'sl-r', 'arc-v', 'arc-1', 'arc-2', 'al'], at: 0.05
  });
  const k1 = s.add(`<div class="ask">Üçgenin kaç <b>kenarı</b> vardır?</div>`, { x: RX + 40, y: 260, at: 0.55 });

  s.say('Evet, üç kenarı vardır. Peki kaç açısı vardır? Yine üç!');
  s.hl(T.sel('side-p'), { at: 0.0, to: 0.3 }); s.hl(T.sel('side-q'), { at: 0.06, to: 0.3 }); s.hl(T.sel('side-r'), { at: 0.12, to: 0.3 });
  const k2 = s.add(`<div class="say"><i class="chk"></i>3 kenar</div>`, { x: RX + 60, y: 370, at: 0.12 });
  const k3 = s.add(`<div class="ask">Kaç <b>açısı</b> vardır?</div>`, { x: RX + 40, y: 500, at: 0.4 });
  T.show(['arc-v', 'arc-1', 'arc-2'], { at: 0.72 });
  const k4 = s.add(`<div class="say"><i class="chk"></i>3 açı</div>`, { x: RX + 60, y: 610, at: 0.8 });

  s.say('Şimdi biraz düşündürecek bir soru: Bir üçgenin iki kenarını biliyorsak, üçüncü kenarını her zaman bulabilir miyiz?',
    { cue: 'İki kenar etiketlenir, üçüncü kenarda "?"', hold: 0.8 });
  s.hide([k1, k2, k3, k4], {});
  T.hidePart(['arc-v', 'arc-1', 'arc-2'], {});
  T.show(['sl-p', 'sl-q'], { at: 0.35 }).show('sl-r', { at: 0.6 });
  const k5 = card(s, `Bir üçgenin <b>iki kenarını</b> biliyorsak,<br><b>üçüncü kenarı</b> her zaman bulabilir miyiz?`, { x: RX, y: 300, w: 960, at: 0.3 });

  s.say('Dik üçgenlerde bunun cevabını zaten biliyorsunuz: Pisagor bağıntısı. Dik kenarların karelerinin toplamı, hipotenüsün karesine eşittir.',
    { cue: 'Üçgen dik üçgene dönüşür; a² + b² = c²' });
  s.hide(k5, {});
  T.morph(90, { at: 0.0 }, 1.4).set('sl-r', 'c', { at: 0.3 });
  const p1 = card(s, `<span class="lbl">Pisagor bağıntısı</span><div class="fm" style="font-size:80px">${M('{a:a^2} + {b:b^2} = {x:c^2}')}</div>`, { x: RX + 40, y: 260, at: 0.3 });
  s.formulas.push('a² + b² = c²');
  s.hl(T.sel('side-p'), { at: 0.55, to: 0.8 }); s.hl(T.sel('side-q'), { at: 0.55, to: 0.8 }); s.hl(T.sel('side-r'), { at: 0.82, to: 1.1 });

  s.say('Ama dikkat! Pisagor bağıntısı, yalnızca dik üçgenlerde doğrudan kullanılır.', { cue: 'Uyarı kartı' });
  const p2 = card(s, `<span class="xx">!</span>&nbsp; Sadece <b>dik üçgenlerde</b> çalışır.`, { x: RX + 40, y: 520, c: 'r', at: 0.15 });
  s.hl(T.sel('sq'), { at: 0.4 });

  s.say('Peki, üçgenimiz dik üçgen değilse ve iki kenarıyla aralarındaki açıyı biliyorsak, üçüncü kenarı nasıl bulabiliriz?',
    { cue: 'Üçgen dik olmayan üçgene döner; iki kenar + açı parlar, üçüncü kenar "?"', hold: 0.5 });
  s.hide([p1, p2], {});
  T.morph(60, { at: 0.05 }, 1.4).set('sl-r', '?', { at: 0.1 }).show(['arc-v', 'al'], { at: 0.45 });
  s.hl(T.sel('side-p'), { at: 0.45, to: 0.95 }); s.hl(T.sel('side-q'), { at: 0.45, to: 0.95 }); s.hl(T.sel('arc-v'), { at: 0.6, to: 1.1 });
  const k6 = card(s, `Üçgen <b>dik değilse</b>?<br><span class="c-a">kenar</span> + <span class="c-b">kenar</span> + <span class="c-g">aradaki açı</span> → <span class="c-x">3. kenar = ?</span>`,
    { x: RX, y: 300, w: 960, at: 0.25 });

  s.say('İşte bugün bu sorunun cevabını öğreneceğiz.', { cue: '"Kosinüs Teoremi" yazısı belirir', hold: 1.0 });
  const k7 = s.add(`<div class="title-xl" style="font-size:84px"><em>Kosinüs Teoremi</em></div>`, { x: RX + 490, y: 640, ax: 0.5, anim: 'pop', at: 0.3, dur: 0.9 });
});

/* ======================================================================= */
/* BÖLÜM 2 — Kosinüs Teoremi Nedir?                                         */
/* ======================================================================= */
VIDEO.scene({
  id: '02', label: 'BÖLÜM 2', title: 'Kosinüs Teoremi Nedir?', target: '2 dk',
  notes: [
    'Sol panelde büyük bir üçgen: köşeler sırayla A (üst), B (sağ alt), C (sol alt) olarak yazılır.',
    'Kenar isimleri, karşısındaki köşeyle birlikte parlayarak gelir: A ↔ a (mavi), B ↔ b (pembe), C ↔ c (yeşil).',
    'a ve b kenarlarının C köşesinde birleştiği vurgulanır; C köşesine turuncu açı yayı çizilir.',
    'Formül sağda büyük bir kartta soldan sağa "yazılarak" belirir. Her parça anlatılırken formülde ve üçgende aynı anda parlar.',
    'Parça açıklamaları formülün altında birer satır olarak birikir (en fazla 5 satır).',
    'Sonda sarı çerçeveli "Önemli" kartı ve formülün sözlü hâli gösterilir: ezber yerine isimlendirme mantığı.'
  ]
}, s => {
  s.say('Önce üçgenimizi isimlendirelim. Köşelere A, B ve C diyelim.', { cue: 'Üçgen çizilir; köşeler A, B, C' });
  const T = s.tri({
    ...TRI, p: 6.2, q: 5, ang: 65, names: ['C', 'B', 'A'], cols: { p: 'a', q: 'b', r: 'x' },
    lbl: { p: 'a', q: 'b', r: 'c' }, angLbl: '', hide: ['vx-v', 'vx-1', 'vx-2', 'sl-p', 'sl-q', 'sl-r', 'arc-v'], at: 0
  });
  T.show('vx-2', { at: 0.62 }).show('vx-1', { at: 0.74 }).show('vx-v', { at: 0.86 });

  s.say('Şimdi kenarlara isim vereceğiz. Burada çok basit bir kural var: Her kenar, karşısındaki köşenin küçük harfini alır.', { cue: 'Kural kartı' });
  const r1 = card(s, `<span class="lbl">Kural</span>Her kenar, <b>karşısındaki köşenin</b><br>küçük harfini alır.`, { x: RX, y: 170, at: 0.35 });

  s.say('A köşesinin karşısındaki kenar, küçük a. B köşesinin karşısındaki kenar, küçük b. C köşesinin karşısındaki kenar da küçük c.',
    { cue: 'Köşe ve karşı kenar çiftleri sırayla parlar' });
  const pairs = [['A', 'a', 'a', 'vx-2', 'side-p', 'sl-p', 0], ['B', 'b', 'b', 'vx-1', 'side-q', 'sl-q', 0.34], ['C', 'c', 'x', 'vx-v', 'side-r', 'sl-r', 0.67]];
  const pr = pairs.map(([V, v, c, vx, sd, sl, at], i) => {
    s.hl(T.sel(vx), { at, to: at + 0.3 }); s.hl(T.sel(sd), { at: at + 0.12, to: at + 0.33 });
    T.show(sl, { at: at + 0.14 });
    return s.add(`<div class="say"><span class="c-${c}">${V}</span> köşesinin karşısı &nbsp;→&nbsp; <span class="c-${c}" style="font-size:1.25em">${v}</span> kenarı</div>`,
      { x: RX + 30, y: 420 + i * 92, at: at + 0.08 });
  });

  s.say('Kosinüs teoremi bize şunu söyler: Bir üçgende iki kenarı ve bu iki kenarın arasındaki açıyı biliyorsak, üçüncü kenarı bulabiliriz.',
    { cue: '"Bildiklerimiz → Bulacağımız" kartı' });
  s.hide([r1, ...pr], {});
  const c1 = card(s, `<span class="lbl">Bildiklerimiz</span><span class="c-a">1. kenar</span> + <span class="c-b">2. kenar</span> + <span class="c-g">aradaki açı</span>` +
    `<span class="lbl" style="margin-top:22px">Bulacağımız</span><span class="c-x">3. kenar</span>`, { x: RX, y: 260, w: 960, at: 0.3 });

  s.say('Bakın, a ve b kenarları C köşesinde birleşiyor. Yani a ile b arasındaki açı, C açısıdır.', { cue: 'a, b ve C köşesindeki açı vurgulanır' });
  s.hl(T.sel('side-p'), { at: 0.02, to: 0.5 }); s.hl(T.sel('side-q'), { at: 0.02, to: 0.5 }); s.hl(T.sel('vx-v'), { at: 0.3, to: 0.6 });
  T.show('arc-v', { at: 0.45 }); s.hl(T.sel('arc-v'), { at: 0.55 });

  s.say('Formülümüz şöyle: c kare eşittir, a kare artı b kare, eksi iki a b çarpı kosinüs C.', { cue: 'Formül yazılır', hold: 0.6 });
  s.hide(c1, {});
  const F = s.formula('{x.c2:c^2} = {a.a2:a^2} + {b.b2:b^2} − {_.ab:2{a:a}{b:b}} · {g.cs:cos(C)}',
    { x: RX, y: 170, size: 74, at: 0.25, durF: 0.7, cls: 'fbig', maxW: 980 });

  s.say('Hemen korkmayın, bu formülü parça parça inceleyelim.');

  const ex = (html, i, at) => s.add(`<div class="say" style="font-size:38px">${html}</div>`, { x: RX + 30, y: 410 + i * 80, at });
  s.say('a kare, birinci kenarın karesi. b kare de ikinci kenarın karesi.', { cue: 'a² ve b² parlar' });
  s.hl('.k-a2', { root: F, at: 0, to: 0.5 }); s.hl(T.sel('side-p'), { at: 0, to: 0.5 });
  s.hl('.k-b2', { root: F, at: 0.5 }); s.hl(T.sel('side-q'), { at: 0.5 });
  const e1 = ex(`${M('{a:a^2}')} &nbsp;→&nbsp; birinci kenarın karesi`, 0, 0.05);
  const e2 = ex(`${M('{b:b^2}')} &nbsp;→&nbsp; ikinci kenarın karesi`, 1, 0.55);

  s.say('İki a b ise, bu iki kenarın çarpımının iki katı.', { cue: '2ab parlar' });
  s.hl('.k-ab', { root: F, at: 0 }); s.hl(T.sel('side-p'), { at: 0.1 }); s.hl(T.sel('side-q'), { at: 0.1 });
  const e3 = ex(`${M('2{a:a}{b:b}')} &nbsp;→&nbsp; iki kenarın çarpımının 2 katı`, 2, 0.1);

  s.say('Kosinüs C ise, C açısının kosinüs değeri. Yani iki kenarın arasındaki açının kosinüsü.', { cue: 'cos(C) ve açı yayı parlar' });
  s.hl('.k-cs', { root: F, at: 0 }); s.hl(T.sel('arc-v'), { at: 0.1 });
  const e4 = ex(`${M('{g:cos(C)}')} &nbsp;→&nbsp; aradaki açının kosinüsü`, 3, 0.1);

  s.say('Sol taraftaki c kare de aradığımız kenarın karesi; yani C açısının tam karşısındaki kenar.', { cue: 'c² ve c kenarı parlar' });
  s.hl('.k-c2', { root: F, at: 0 }); s.hl(T.sel('side-r'), { at: 0.3 }); s.hl(T.sel('sl-r'), { at: 0.3 });
  const e5 = ex(`${M('{x:c^2}')} &nbsp;→&nbsp; aradığımız kenarın karesi`, 4, 0.1);

  s.say('Bizim işimiz aslında çok basit: Bildiğimiz sayıları formülde yerine koyacağız, sonra da işlemleri sırayla yapacağız.');

  s.say('Şimdi çok önemli bir noktaya geldik. Bir açının karşısındaki kenarı arıyorsak, formülde o kenarın harfini tek başına bırakacak şekilde düşünmeliyiz.',
    { cue: 'Sarı "Önemli" kartı; c², c kenarı ve C açısı birlikte parlar' });
  s.hide([e1, e2, e3, e4, e5], {});
  const im = card(s, `<span class="lbl">Önemli</span>Aradığın kenar, açının <b>karşısındaki</b> kenardır.<br>Formülde onun harfi eşittirin solunda <b>tek başına</b> durur.`,
    { x: RX, y: 420, w: 980, c: 'y', at: 0.25 });
  s.hl('.k-c2', { root: F, at: 0.45 }); s.hl(T.sel('side-r'), { at: 0.45 }); s.hl(T.sel('arc-v'), { at: 0.45 });

  s.say('Harflerin yerlerini ezberlemek yerine, üçgeni doğru isimlendirmeyi öğrenmeliyiz. Üçgen doğru isimlendirilirse formül kendiliğinden yerine oturur.',
    { cue: 'Formülün sözlü hâli', hold: 1.2 });
  s.hide(im, {});
  card(s, `<span class="lbl">Formülün sözlü hâli</span>` +
    `<div class="fm" style="font-size:40px;line-height:1.6">${M('({x:aranan kenar})^2 = ({a:1. kenar})^2 + ({b:2. kenar})^2')}<br>` +
    `${M('− 2 · ({a:1. kenar}) · ({b:2. kenar}) · cos({g:aradaki açı})')}</div>`, { x: RX, y: 420, w: 980, at: 0.25 });
  s.formulas.push('(aranan kenar)² = (1. kenar)² + (2. kenar)² − 2 · (1. kenar) · (2. kenar) · cos(aradaki açı)');
});

/* ======================================================================= */
/* BÖLÜM 3 — Kosinüs Değeri Nasıl Bulunur?                                  */
/* ======================================================================= */
VIDEO.scene({
  id: '03', label: 'BÖLÜM 3', title: 'Kosinüs Değeri Nasıl Bulunur?', target: '1 dk',
  notes: [
    'Sol tarafta iki sütunlu sade tablo: Açı | Kosinüs değeri. Satırlar yukarıdan aşağı tek tek belirir.',
    '0°, 120° ve 180° satırları soluklaşır (şimdilik gerek yok); 60° ve 90° satırları sarı vurguyla kalır.',
    'Sağda iki büyük "akılda tut" kartı: cos(60°) = 1/2 ve cos(90°) = 0.',
    'Sonda hesap makinesi çizimi: ekranın sol üstündeki DEG göstergesi sarı halkayla parlar.'
  ]
}, s => {
  s.say('Formülde bir de kosinüs değeri var. Peki bu değeri nereden bulacağız?', { cue: '"cos(açı) = ?"' });
  const q = s.add(`<div class="fm" style="font-size:96px">${M('{g:cos(açı)} = ?')}</div>`, { x: 960, y: 420, ax: 0.5, anim: 'pop', at: 0.1 });

  s.say('Bazı açıların kosinüs değerlerini bu küçük tabloda görüyorsunuz.', { cue: 'Tablo satır satır belirir', hold: 1.0 });
  s.hide(q, {});
  const rows = [['0°', '1'], ['60°', '[[1|2]]'], ['90°', '0'], ['120°', '−[[1|2]]'], ['180°', '−1']];
  const tb = s.add(`<table class="tbl"><tr><th>Açı</th><th>Kosinüs değeri</th></tr>` +
    rows.map(([a, v], i) => `<tr class="r${i}"><td>${a}</td><td><span class="fm">${M(v)}</span></td></tr>`).join('') + '</table>',
    { x: 150, y: 175, at: 0.0, dur: 0.4 });
  rows.forEach((r, i) => s.reveal(`.r${i}`, { root: tb, at: 0.2 + i * 0.16 }));
  s.formulas.push('cos 0° = 1 · cos 60° = 1/2 · cos 90° = 0 · cos 120° = −1/2 · cos 180° = −1');

  s.say('Ama hepsini şimdi ezberlemenize hiç gerek yok. Şimdilik 60 derecenin kosinüsünün yarım olduğunu ve 90 derecenin kosinüsünün sıfır olduğunu bilmen yeterli.',
    { cue: '60° ve 90° satırları vurgulanır, diğerleri soluklaşır' });
  [0, 3, 4].forEach(i => s.fade(`.r${i}`, { root: tb, at: 0.1 }));
  s.hl('.r1 td', { root: tb, at: 0.45, until: { end: true, after: 2 } });
  s.hl('.r2 td', { root: tb, at: 0.75, until: { end: true, after: 2 } });
  const m1 = s.add(`<div class="note y fm" style="font-size:64px">${M('{g:cos(60°)} = [[1|2]]')}</div>`, { x: 1050, y: 230, anim: 'pop', at: 0.5 });
  const m2 = s.add(`<div class="note y fm" style="font-size:64px">${M('{g:cos(90°)} = 0')}</div>`, { x: 1050, y: 470, anim: 'pop', at: 0.8 });

  s.say('Önce soruları çözmeyi öğrenelim. Diğer değerlere, ihtiyaç duyduğumuzda tekrar bakarız.');

  s.say('Bir de küçük bir ipucu: Hesap makinesi kullanacaksanız, ekranda DEG yazdığından, yani derece modunda olduğundan emin olun.',
    { cue: 'Hesap makinesi; DEG göstergesi parlar' });
  s.hide([m1, m2], {});
  const cm = calculator(s, { x: 1330, y: 170, line: 'cos(60)', res: '0,5', t: { at: 0.15 } });
  s.hl('.k-deg', { root: cm, at: 0.45, until: { end: true } });
  const d1 = s.add(`<div class="say" style="font-size:40px"><b>DEG</b> = derece modu <i class="chk" style="margin-left:14px"></i></div>`, { x: 860, y: 260, at: 0.55 });

  s.say('Derece modunda değilse, işlemi doğru yapsanız bile yanlış sonuç alırsınız.', { hold: 0.6 });
  s.add(`<div class="say" style="font-size:40px">RAD / GRAD → <span class="xx">yanlış sonuç</span></div>`, { x: 860, y: 360, at: 0.3 });
});

/* ======================================================================= */
/* BÖLÜM 4 — Birinci Örnek: En Kolay Soru                                   */
/* ======================================================================= */
VIDEO.scene({
  id: '04', label: 'BÖLÜM 4', title: 'Birinci Örnek: En Kolay Soru', target: '2 dk',
  notes: [
    'Ölçekli dik üçgen: yatay kenar 4 cm (pembe), dikey kenar 3 cm (mavi), aradaki dik açı karesi turuncu; hipotenüs x (yeşil).',
    'Soru kartı sağ üstte. İşlemler altında satır satır; yeni satır gelince eski satırlar soluklaşır.',
    'Sayılar formüle girerken üçgende ilgili kenar parlar (3 → mavi kenar, 4 → pembe kenar, 90° → açı).',
    '"− 24 · 0" terimi kırmızı çizgiyle üstü çizilerek "yok olur".',
    'Sonuç yeşil çerçevede; üçgendeki x etiketi "5 cm" olur. Sonda Pisagor ile aynı sonucun çıktığı kartı.'
  ]
}, s => {
  s.say('Hadi ilk sorumuza geçelim. En kolay sorudan başlıyoruz.', { cue: '"1. Örnek" kartı' });
  badge(s, '1. Örnek', 'En kolay soru');

  s.say('Elimizde bir dik üçgen var. İki kenarı 3 santimetre ve 4 santimetre; bu iki kenarın arasındaki açı da 90 derece.',
    { cue: 'Dik üçgen çizilir: 3 cm, 4 cm, 90°' });
  const T = s.tri({ ...TRI, p: 4, q: 3, ang: 90, cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: '4 cm', q: '3 cm', r: 'x' }, angLbl: '90°', hide: ['sl-r'], at: 0.05 });
  s.hl(T.sel('sl-q'), { at: 0.45, to: 0.6 }); s.hl(T.sel('sl-p'), { at: 0.6, to: 0.75 }); s.hl(T.sel('sq'), { at: 0.85 });

  s.say('Üçüncü kenara x diyelim. Soru şu: x kaç santimetredir?', { cue: 'x etiketi ve soru kartı' });
  T.show('sl-r', { at: 0.1 }); s.hl(T.sel('side-r'), { at: 0.1, to: 0.6 });
  const qc = card(s, `İki kenarı <span class="c-a">3 cm</span> ve <span class="c-b">4 cm</span> olan dik üçgende <span class="c-x">x</span> kenarını bulunuz.`, { ...Q, at: 0.35 });

  const st = s.stack({ x: RX, y: 330 });
  s.say('Önce formülümüzü yazalım. Aradığımız kenar x; bu yüzden x kareyi eşittirin solunda tek başına bırakıyoruz.', { cue: '"x² =" yazılır' });
  const L1 = st.line('{_.g1:{x:x^2} =} {_.g2:{a:3^2} + {b:4^2}} {_.g3:− 2 · {a:3} · {b:4} ·} {_.g4:{g:cos(90°)}}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L1, at: 0.55 }); s.hl('.k-g1', { root: L1, at: 0.6 });

  s.say('Bildiğimiz kenarlar 3 ve 4. Bunları yerine koyuyoruz: x kare eşittir 3 kare artı 4 kare...', { cue: '3² + 4² yazılır' });
  s.hl(T.sel('side-q'), { at: 0.15, to: 0.35 }); s.hl(T.sel('side-p'), { at: 0.25, to: 0.45 });
  s.reveal('.k-g2', { root: L1, at: 0.6 });

  s.say('...eksi 2 çarpı 3 çarpı 4 çarpı kosinüs 90.', { cue: '− 2 · 3 · 4 · cos(90°) yazılır' });
  s.reveal('.k-g3', { root: L1, at: 0.05 }); s.reveal('.k-g4', { root: L1, at: 0.7 }); s.hl(T.sel('sq'), { at: 0.7 });

  s.say('Kosinüs 90 derecenin değeri neydi? Sıfır!', { cue: 'Not: cos(90°) = 0' });
  s.hl('.k-g4', { root: L1, at: 0 });
  const n1 = note(s, M('{g:cos(90°)} = 0'), { at: 0.7 });

  s.say('3 kare 9 eder, 4 kare 16 eder. 2 çarpı 3 çarpı 4 de 24 eder.', { cue: 'x² = 9 + 16 − 24 · 0' });
  const L2 = st.line('{x:x^2} = {a:9} + {b:16} {_.z:− 24 · 0}', { at: 0.05, durF: 0.85 });

  s.say('Sıfırla çarpılan her şey sıfır olur. Yani 24 çarpı 0, sıfırdır. Bu kısım tamamen gidiyor.', { cue: '"− 24 · 0" üstü çizilir' });
  s.hl('.k-z', { root: L2, at: 0.1, to: 0.6 }); s.strike('.k-z', { root: L2, at: 0.7 });

  s.say('Geriye 9 artı 16 kalıyor. Bu da 25 eder.', { cue: 'x² = 25' });
  st.line('{x:x^2} = 25', { at: 0.5 });

  s.say('x kare 25 ise, x\'i bulmak için karekök alırız. Hangi sayının karesi 25 eder? 5\'in!', { cue: 'x = √25 = 5 cm' });
  const L4 = st.line('{_.g1:{x:x} = √(25)} {_.g2:<span class="resbox">= 5 cm</span>}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L4, at: 0.3 }); s.reveal('.k-g2', { root: L4, at: 0.88 });

  s.say('Yani x, 5 santimetre. Tebrikler, ilk soruyu birlikte çözdük!', { cue: 'Üçgende x → 5 cm' });
  T.set('sl-r', '5 cm', { at: 0.1 }); s.hl(T.sel('sl-r'), { at: 0.15 }); s.hl('.resbox', { root: L4, at: 0.15 });

  s.say('Dikkat ederseniz, kosinüs teoremi burada Pisagor bağıntısıyla aynı sonucu verdi. Çünkü dik üçgende kosinüs 90 sıfırdır ve o kısım tamamen kaybolur.',
    { cue: 'Pisagor karşılaştırma kartı' });
  s.hide(n1, {});
  const pc = note(s, `Pisagor: ${M('{a:3^2} + {b:4^2} = {x:5^2}')} &nbsp;&nbsp;<i class="chk"></i>`, { c: 'g', at: 0.35 });
  s.hl('.k-z', { root: L2, at: 0.75 });

  s.say('Yani Pisagor bağıntısı, aslında kosinüs teoreminin özel bir hâlidir. Kosinüs teoremi ise her türlü üçgende çalışır.', { hold: 0.8 });
  s.hide(pc, {});
  note(s, `Pisagor = açı 90° iken kosinüs teoremi`, { c: 'y', at: 0.2 });
});

/* ======================================================================= */
/* BÖLÜM 5 — İkinci Örnek: 60 Dereceli Üçgen                                */
/* ======================================================================= */
VIDEO.scene({
  id: '05', label: 'BÖLÜM 5', title: 'İkinci Örnek: 60 Dereceli Üçgen', target: '2 dk',
  notes: [
    'Ölçekli üçgen: yatay kenar 7 cm (pembe), eğik kenar 5 cm (mavi), aralarında 60° (turuncu yay); karşı kenar x (yeşil).',
    'Formül dört parçada yazılır; her parça söylenirken üçgende ilgili kenar/açı parlar.',
    'Not alanında sırasıyla: cos(60°) = 1/2 → "39 tam kare değil" → "karekök tam sayı olmak zorunda değil" → √36 < √39 < √49 kontrolü.',
    'Sonuç: x = √39 ≈ 6,24 cm (yeşil çerçeve); üçgendeki x etiketi "≈ 6,24 cm" olur.',
    'Kapanış: sağda üç numaralı adım kartı — Yerleştir → cos değerini kullan → Karekök al.'
  ]
}, s => {
  s.say('Şimdi bir adım daha ileri gidelim. Bu kez üçgenimiz dik üçgen değil.', { cue: '"2. Örnek" kartı' });
  badge(s, '2. Örnek', '60 dereceli üçgen');

  s.say('İki kenarı 5 santimetre ve 7 santimetre; bu kenarların arasındaki açı ise 60 derece.', { cue: 'Üçgen çizilir: 5 cm, 7 cm, 60°' });
  const T = s.tri({ ...TRI, p: 7, q: 5, ang: 60, cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: '7 cm', q: '5 cm', r: 'x' }, angLbl: '60°', hide: ['sl-r'], at: 0.05 });

  s.say('Üçüncü kenar x kaç santimetredir?', { cue: 'Soru kartı' });
  T.show('sl-r', { at: 0.05 }); s.hl(T.sel('side-r'), { at: 0.05 });
  card(s, `İki kenarı <span class="c-a">5 cm</span> ve <span class="c-b">7 cm</span>, aradaki açısı <span class="c-g">60°</span> olan üçgende <span class="c-x">x</span> kaç cm'dir?`, { ...Q, at: 0.1 });

  const st = s.stack({ x: RX, y: 330 });
  s.say('Önce sayıları formüle yerleştiriyoruz: x kare eşittir 5 kare artı 7 kare, eksi 2 çarpı 5 çarpı 7 çarpı kosinüs 60.',
    { cue: 'x² = 5² + 7² − 2 · 5 · 7 · cos(60°)' });
  const L1 = st.line('{_.g1:{x:x^2} =} {_.g2:{a:5^2} + {b:7^2}} {_.g3:− 2 · {a:5} · {b:7} ·} {_.g4:{g:cos(60°)}}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L1, at: 0.33 }); s.reveal('.k-g2', { root: L1, at: 0.45 }); s.reveal('.k-g3', { root: L1, at: 0.68 }); s.reveal('.k-g4', { root: L1, at: 0.9 });
  s.hl(T.sel('side-q'), { at: 0.45, to: 0.6 }); s.hl(T.sel('side-p'), { at: 0.55, to: 0.7 }); s.hl(T.sel('arc-v'), { at: 0.9 });

  s.say('Kosinüs 60\'ın değeri neydi? Yarım, yani bir bölü iki.', { cue: 'Not: cos(60°) = 1/2' });
  s.hl('.k-g4', { root: L1, at: 0 });
  let n = note(s, M('{g:cos(60°)} = [[1|2]]'), { at: 0.5 });

  s.say('5 kare 25, 7 kare 49 eder. 2 çarpı 5 çarpı 7 de 70 eder.', { cue: 'x² = 25 + 49 − 70 · 1/2' });
  st.line('{x:x^2} = {a:25} + {b:49} − 70 · [[.1|2]]', { at: 0.05, durF: 0.85 });

  s.say('25 artı 49, 74 eder. 70\'in yarısı da 35.', { cue: 'x² = 74 − 35' });
  st.line('{x:x^2} = 74 − 35', { at: 0.1, durF: 0.7 });

  s.say('74\'ten 35 çıkarınca 39 kalır. Yani x kare 39.', { cue: 'x² = 39' });
  st.line('{x:x^2} = 39', { at: 0.5 });

  s.say('Şimdi karekök alacağız. Ama 39; 36 ya da 49 gibi tam kare bir sayı değil.', { cue: 'x = √39; not: "39 tam kare değil"' });
  const L5 = st.line('{_.g1:{x:x} = √(39)} {_.g2:<span class="resbox">≈ 6,24 cm</span>}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L5, at: 0.25 });
  s.hide(n, { at: 0.5 });
  n = note(s, `39 tam kare değil`, { c: 'r', at: 0.6 });

  s.say('Bu hiç sorun değil! Karekök her zaman tam sayı çıkmak zorunda değildir. Cevabı kök 39 olarak da bırakabiliriz.', { cue: 'Not: "Karekök tam sayı olmak zorunda değil!"' });
  s.hide(n, { at: 0.1 });
  n = note(s, `Karekök tam sayı olmak zorunda değil!`, { c: 'g', at: 0.2 });
  s.hl('.k-g1', { root: L5, at: 0.6 });

  s.say('Hesap makinesiyle bakarsak, kök 39 yaklaşık 6 virgül 24 eder. Yani x, yaklaşık 6 virgül 24 santimetre.', { cue: '≈ 6,24 cm; üçgende x → ≈ 6,24 cm' });
  s.reveal('.k-g2', { root: L5, at: 0.4 });
  T.set('sl-r', '≈ 6,24 cm', { at: 0.75 }); s.hl(T.sel('sl-r'), { at: 0.75 });

  s.say('Sonuç mantıklı mı? 36\'nın kökü 6, 49\'un kökü 7. 39 bu ikisinin arasında; sonucumuz da 6 ile 7 arasında çıktı. Harika!',
    { cue: 'Kontrol notu: √36 = 6 < √39 < √49 = 7' });
  s.hide(n, { at: 0.05 });
  n = note(s, M('√(36) = 6 &nbsp;&lt;&nbsp; {x:√(39)} &nbsp;&lt;&nbsp; √(49) = 7'), { c: 'y', at: 0.15 });

  s.say('Sırayı unutmayalım: Önce sayıları formüle yerleştiriyoruz. Sonra kosinüs değerini kullanıyoruz. En son karekök alıyoruz.',
    { cue: 'Üç adım kartı', hold: 1.2 });
  st.clear({ at: 0 }); s.hide(n, { at: 0 });
  const steps = ['Sayıları formüle <b>yerleştir</b>', '<b>Kosinüs</b> değerini kullan', 'En son <b>karekök</b> al'];
  steps.forEach((t, i) => s.add(`<div class="step card" style="width:860px"><span class="n">${i + 1}</span><span>${t}</span></div>`,
    { x: RX + 20, y: 340 + i * 150, at: 0.12 + i * 0.3 }));
});

/* ======================================================================= */
/* BÖLÜM 6 — Üçüncü Örnek: Günlük Hayat Problemi                            */
/* ======================================================================= */
VIDEO.scene({
  id: '06', label: 'BÖLÜM 6', title: 'Üçüncü Örnek: Günlük Hayat Problemi', target: '2 dk',
  notes: [
    'Sol panelde kuşbakışı inşaat alanı: bir noktadan çıkan iki yol (koyu gri asfalt, kesikli orta çizgi), uçlarında turuncu dubalar, köşede "İNŞAAT ALANI" tabelası.',
    'Yollar ölçekli: 6 m ve 8 m, aralarında 60° (turuncu yay).',
    'Kuş uçuşu mesafe yeşil kesikli çizgiyle çizilirken küçük bir kuş bir uçtan diğerine uçar.',
    'Ardından yolların üstüne renkli kenar çizgileri gelir: "iki yol + mesafe = üçgen".',
    'İşlemler sağda satır satır; sonuç ≈ 7,21 m. Sol altta "6 + 8 = 14 m ✗" uyarısı, ardından "açıyı da kullandık ✓".'
  ]
}, s => {
  s.say('Şimdi matematiği gerçek hayata taşıyalım.', { cue: '"3. Örnek" kartı' });
  badge(s, '3. Örnek', 'Günlük hayat problemi');

  s.say('Bir inşaat alanında iki yol bir noktada birleşiyor. Birinci yolun uzunluğu 6 metre, ikinci yolun uzunluğu 8 metre.',
    { cue: 'İnşaat alanı: iki yol çizilir, 6 m ve 8 m' });
  const T = s.tri({
    ...TRI, p: 8, q: 6, ang: 60, road: true, dashR: true, margin: 110, cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: '8 m', q: '6 m', r: 'x' }, angLbl: '60°',
    hide: ['side-p', 'side-q', 'side-r', 'sl-p', 'sl-q', 'sl-r', 'arc-v', 'al'], at: 0.05
  });
  s.add(`<div class="sign"><span>İNŞAAT ALANI</span></div>`, { x: 90, y: 160, anim: 'pop', at: 0.1 });
  T.show('sl-q', { at: 0.6 }).show('sl-p', { at: 0.85 });

  s.say('Yolların birleştiği noktadaki açı 60 derece.', { cue: '60° açı yayı' });
  T.show(['arc-v', 'al'], { at: 0.2 }); s.hl(T.sel('arc-v'), { at: 0.35 });

  s.say('Biz, iki yolun uç noktaları arasındaki kuş uçuşu mesafeyi bulmak istiyoruz. Kuş uçuşu demek, iki nokta arasındaki dümdüz mesafe demek.',
    { cue: 'Kuş bir uçtan diğerine uçar; kesikli yeşil çizgi' });
  T.show('side-r', { at: 0.42 }).show('sl-r', { at: 0.8 });
  { // kuş
    const b = s.cur, t0 = s.T({ at: 0.42 }), t1 = s.T({ at: 0.92 });
    const bird = s.add(`<svg width="140" height="78" viewBox="0 0 90 50"><path class="w" d="M6,30 Q25,6 45,28 Q65,6 84,30" stroke="#f4f1e6" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`,
      { x: 0, y: 0, anim: 'none', at: 0.4 });
    s.hide(bird, { b, at: 1, after: 0.3 });
    const w = bird.el.querySelector('.w');
    s.hook(t => {
      if (t < t0 - 0.5) return '';
      const [, A, B] = T.pts(t), u = clamp((t - t0) / (t1 - t0));
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const x = A[0] + (B[0] - A[0]) * e, y = A[1] + (B[1] - A[1]) * e - 46;
      bird.el.style.left = (x - 70).toFixed(1) + 'px'; bird.el.style.top = (y - 39).toFixed(1) + 'px';
      const flap = u > 0 && u < 1 ? 0.45 + 0.55 * Math.abs(Math.cos(t * 9)) : 1;
      w.setAttribute('transform', `translate(0,${(30 * (1 - flap)).toFixed(1)}) scale(1,${flap.toFixed(3)})`);
      return x.toFixed(1) + ',' + y.toFixed(1) + ',' + flap.toFixed(2);
    });
  }
  const qc = card(s, `İki yolun uçları arasındaki <span class="c-x">kuş uçuşu mesafe x</span> kaç metredir?`, { ...Q, at: 0.95 });

  s.say('Şekle dikkat edin: İki yol ve bu mesafe bir üçgen oluşturuyor. Bildiklerimiz: iki kenar, 6 ve 8; aralarındaki açı da 60 derece.',
    { cue: 'Yolların üstüne renkli kenarlar gelir: üçgen' });
  T.show('side-q', { at: 0.05 }).show('side-p', { at: 0.15 });
  s.hl(T.sel('side-q'), { at: 0.5, to: 0.75 }); s.hl(T.sel('side-p'), { at: 0.6, to: 0.8 }); s.hl(T.sel('arc-v'), { at: 0.85 });

  const st = s.stack({ x: RX, y: 330 });
  s.say('Formüle yerleştirelim: x kare eşittir 6 kare artı 8 kare, eksi 2 çarpı 6 çarpı 8 çarpı kosinüs 60.', { cue: 'x² = 6² + 8² − 2 · 6 · 8 · cos(60°)' });
  const L1 = st.line('{_.g1:{x:x^2} =} {_.g2:{a:6^2} + {b:8^2}} {_.g3:− 2 · {a:6} · {b:8} ·} {_.g4:{g:cos(60°)}}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L1, at: 0.25 }); s.reveal('.k-g2', { root: L1, at: 0.4 }); s.reveal('.k-g3', { root: L1, at: 0.65 }); s.reveal('.k-g4', { root: L1, at: 0.9 });

  s.say('6 kare 36, 8 kare 64 eder. 2 çarpı 6 çarpı 8 de 96. Kosinüs 60 da yarım.', { cue: 'x² = 36 + 64 − 96 · 1/2' });
  st.line('{x:x^2} = {a:36} + {b:64} − 96 · [[.1|2]]', { at: 0.05, durF: 0.9 });

  s.say('36 artı 64, 100 eder. 96\'nın yarısı da 48.', { cue: 'x² = 100 − 48' });
  st.line('{x:x^2} = 100 − 48', { at: 0.1, durF: 0.7 });

  s.say('100\'den 48 çıkarınca 52 kalır. Yani x kare 52.', { cue: 'x² = 52' });
  st.line('{x:x^2} = 52', { at: 0.5 });

  s.say('Karekök alıyoruz: kök 52, yaklaşık 7 virgül 21 eder. Yani iki uç arasındaki mesafe, yaklaşık 7 virgül 21 metre.',
    { cue: 'x = √52 ≈ 7,21 m; üçgende x → ≈ 7,21 m' });
  const L5 = st.line('{_.g1:{x:x} = √(52)} {_.g2:<span class="resbox">≈ 7,21 m</span>}', { anim: 'none', at: 0 });
  s.reveal('.k-g1', { root: L5, at: 0.1 }); s.reveal('.k-g2', { root: L5, at: 0.4 });
  T.set('sl-r', '≈ 7,21 m', { at: 0.75 }); s.hl(T.sel('sl-r'), { at: 0.75 });

  s.say('Bir şeye dikkat edin: İki yolun uzunluğunu doğrudan toplamadık. Toplasaydık 14 metre bulurduk; ama bu yanlış olurdu.',
    { cue: 'Sol altta: 6 + 8 = 14 m ✗' });
  const w1 = note(s, `<span class="c-a">6</span> + <span class="c-b">8</span> = 14 m &nbsp;<span class="xx">✗ yanlış</span>`, { c: 'r', at: 0.5 });

  s.say('Çünkü yollar aynı doğrultuda değil. Aralarındaki açıyı da kullanarak, iki uç arasındaki mesafeyi hesapladık.',
    { cue: '"Açıyı da kullandık ✓"', hold: 1.0 });
  s.hide(w1, { at: 0.3 });
  note(s, `Yollar aynı doğrultuda değil → <span class="c-g">açıyı</span> da kullandık <i class="chk" style="margin-left:10px"></i>`, { c: 'g', at: 0.4, size: 34 });
  s.hl(T.sel('arc-v'), { at: 0.45 });
});

/* ======================================================================= */
/* BÖLÜM 7 — Dördüncü Örnek: Eksik Açıyı Bulma                              */
/* ======================================================================= */
VIDEO.scene({
  id: '07', label: 'BÖLÜM 7', title: 'Dördüncü Örnek: Eksik Açıyı Bulma', target: '1–1,5 dk',
  notes: [
    'İkinci örnekteki üçgenin aynısı: b = 7 cm (pembe), a = 5 cm (mavi), c = √39 cm (yeşil); C köşesinde turuncu "?" yayı.',
    'İşlemler: c² = a² + b² − 2ab · cos(C) → cos(C) kesirli formül → değerler → 35/70 = 1/2 → C = 60°.',
    'Kesirler üst üste (pay/payda) yazılır; pay ve payda ayrı ayrı belirir.',
    'Sonda hesap makinesi: SHIFT ve cos tuşları sırayla parlar; ekranda cos⁻¹(1÷2) = 60.',
    'Uyarı kartı: "cos⁻¹, 1/cos demek değildir."'
  ]
}, s => {
  s.say('Şimdi işi tersine çevirelim. Bu kez üçgenin üç kenarı da belli, ama bir açısı bilinmiyor.', { cue: '"4. Örnek" kartı' });
  badge(s, '4. Örnek', 'Eksik açıyı bulma');

  s.say('a eşittir 5, b eşittir 7, c eşittir kök 39 santimetre. Tanıdık geldi mi? Bu, ikinci örnekteki üçgenin ta kendisi!',
    { cue: 'Üçgen: a = 5, b = 7, c = √39; not: "2. örnekteki üçgen!"' });
  const T = s.tri({
    ...TRI, p: 7, q: 5, ang: 60, names: ['C', 'A', 'B'], cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: 'b = 7', q: 'a = 5', r: 'c = √39' }, angLbl: '?',
    hide: ['sl-p', 'sl-q', 'sl-r', 'arc-v', 'al'], at: 0
  });
  T.show('sl-q', { at: 0.05 }).show('sl-p', { at: 0.2 }).show('sl-r', { at: 0.35 });
  let n = note(s, `2. örnekteki üçgen!`, { c: 'y', at: 0.8 });

  const st = s.stack({ x: RX, y: 170 });
  s.say('C açısını bulmak istiyoruz. Yine aynı formülle başlıyoruz.', { cue: 'C köşesinde "?"; temel formül yazılır' });
  T.show(['arc-v', 'al'], { at: 0.0 }); s.hl(T.sel('arc-v'), { at: 0.1, to: 0.6 });
  st.line('{x:c^2} = {a:a^2} + {b:b^2} − 2{a:a}{b:b} · {g:cos(C)}', { at: 0.5, durF: 0.5 });

  s.say('Bu kez kosinüs C\'yi yalnız bırakacağız. Formülü düzenlersek şunu elde ederiz: kosinüs C eşittir, a kare artı b kare eksi c kare, bölü iki a b.',
    { cue: 'cos(C) = (a² + b² − c²) / 2ab' });
  st.line('{g:cos(C)} = [[{a:a^2} + {b:b^2} − {x:c^2}|2{a:a}{b:b}]]', { at: 0.5, durF: 0.45, gap: 160 });

  s.say('Değerleri yerleştirelim. a kare 25, b kare 49, c kare de 39. Çünkü kök 39\'un karesi, 39\'dur.', { cue: 'Değerler yerleştirilir; not: (√39)² = 39' });
  st.line('{g:cos(C)} = [[{a:25} + {b:49} − {x:39}|2 · {a:5} · {b:7}]]', { at: 0.1, durF: 0.55, gap: 160 });
  s.hide(n, { at: 0.6 });
  n = note(s, M('({x:√(39)})^2 = {x:39}'), { at: 0.7 });

  s.say('Üst taraf: 25 artı 49 eksi 39, yani 35. Alt taraf: 2 çarpı 5 çarpı 7, yani 70.', { cue: 'cos(C) = 35 / 70' });
  const L4 = st.line('{_.g1:{g:cos(C)} =} [[{_.g2:35}|{_.g3:70}]] {_.g4:= [[1|2]]}', { anim: 'none', at: 0, gap: 160 });
  s.reveal('.k-g1', { root: L4, at: 0.05 }); s.reveal('.fd', { root: L4, at: 0.05 });
  s.reveal('.k-g2', { root: L4, at: 0.4 }); s.reveal('.k-g3', { root: L4, at: 0.9 });

  s.say('35 bölü 70, yarım eder. Kosinüsü yarım olan açı hangisiydi? Tablomuzdan hatırlayalım: 60 derece!', { cue: '= 1/2 → C = 60°' });
  s.reveal('.k-g4', { root: L4, at: 0.15 });
  s.hide(n, { at: 0.4 });
  n = note(s, M('{g:cos(60°)} = [[1|2]]'), { c: 'y', at: 0.5 });
  st.line('{g:C} = <span class="resbox">60°</span>', { at: 0.85, size: 64 });
  T.set('al', '60°', { at: 0.88 }); s.hl(T.sel('al'), { at: 0.9 }); s.hl(T.sel('arc-v'), { at: 0.9 });

  s.say('Hesap makinesinde bu işlem için kosinüs üzeri eksi bir, yani ark kosinüs kullanılır. Genelde SHIFT ve cos tuşlarına basarak açılır.',
    { cue: 'Hesap makinesi: SHIFT + cos → cos⁻¹(1÷2) = 60' });
  st.clear({ at: 0 }); s.hide(n, { at: 0 });
  const cm = calculator(s, { x: 1420, y: 170, line: 'cos⁻¹(1÷2)', res: '60', t: { at: 0.1 } });
  s.hl('.k-shift', { root: cm, at: 0.6, to: 0.85 }); s.hl('.k-cos', { root: cm, at: 0.78 });
  s.add(`<div class="fm" style="font-size:64px">${M('cos^(−1)')}</div>`, { x: 880, y: 200, at: 0.15 });
  s.add(`<div class="say">= ark kosinüs</div>`, { x: 880, y: 300, at: 0.35 });
  s.add(`<div class="say"><span class="c-y">SHIFT</span> + cos</div>`, { x: 880, y: 400, at: 0.65 });
  s.formulas.push('cos⁻¹(1/2) = 60°  (hesap makinesi: SHIFT + cos)');

  s.say('Küçük bir uyarı: Buradaki eksi bir, bir bölü kosinüs anlamına gelmez. Sadece, kosinüsü bu olan açı hangisi, demektir.',
    { cue: 'Uyarı kartı: cos⁻¹ ≠ 1 / cos', hold: 1.0 });
  card(s, `<div class="fm" style="font-size:54px">${M('cos^(−1)')} &nbsp;≠&nbsp; ${M('[[1|cos]]')}</div><span style="font-size:32px">“Kosinüsü bu olan açı hangisi?” demek.</span>`,
    { x: 880, y: 520, w: 500, c: 'r', at: 0.2 });
});

/* ======================================================================= */
/* BÖLÜM 8 — Öğrenciyle Birlikte Çözelim                                    */
/* ======================================================================= */
VIDEO.scene({
  id: '08', label: 'BÖLÜM 8', title: 'Öğrenciyle Birlikte Çözelim', target: '2–2,5 dk',
  notes: [
    'Her soru için: soru kartı + ölçekli üçgen → 5 saniyelik geri sayım ("Düşünme zamanı!", "İstersen videoyu durdur") → çözüm satırları.',
    'Geri sayım sırasında çözüm ekranda YOKTUR; seslendirme de susar (yalnızca halka ve sayı akar).',
    'Soru 1: 4 cm, 6 cm, 90° → √52 ≈ 7,21 cm.  Soru 2: 4 cm, 4 cm, 60° → 4 cm (eşkenar üçgen notu).  Soru 3: a = 3, b = 4, C = 60° → √13 ≈ 3,61 cm.',
    'Bölüm sonunda cesaretlendirici kart: "Hata yapmak öğrenmenin parçası."'
  ]
}, s => {
  s.say('Şimdi sıra sizde! Üç kısa soru soracağım. Her sorudan sonra düşünmeniz için 5 saniye bekleyeceğim. Kalem kâğıt hazır mı?',
    { cue: '"Sıra sende!" kartı', hold: 0.6 });
  const intro = s.add(`<div class="badge">Sıra sende!<small>3 soru · her soru için 5 saniye düşünme süresi</small></div>`, { x: 960, y: 480, ax: 0.5, ay: 0.5, anim: 'pop' });
  s.hide(intro, { end: true, after: -0.2 });

  const ask = (q) => {
    s.say(q.text, { cue: q.cue });
    const qc = card(s, q.card, { ...Q, at: 0.05 });
    const T = s.tri({ ...TRI, ...q.tri, hide: ['sl-r'], at: 0.15 });
    T.show('sl-r', { at: 0.85 });
    s.wait(5, { cue: '⏸ 5 sn düşünme (sessiz, geri sayım)' });
    countdown(s);
    const st = s.stack({ x: RX, y: 380 });
    const L = [];
    q.sol.forEach(([vo, m, lo]) => {
      s.say(vo, { cue: lo.cue });
      L.push(st.line(m, lo));
      if (lo.then) lo.then(T);
    });
    return { qc, T, st };
  };

  const q1 = ask({
    text: 'Birinci soru: İki kenarı 4 santimetre ve 6 santimetre olan bir üçgende, bu kenarlar arasındaki açı 90 derece. Üçüncü kenar kaç santimetredir?',
    cue: 'Soru 1 kartı ve üçgen',
    card: `<span class="lbl">Soru 1</span>İki kenarı <span class="c-a">4 cm</span> ve <span class="c-b">6 cm</span>, aradaki açı <span class="c-g">90°</span>. Üçüncü kenar kaç cm?`,
    tri: { p: 6, q: 4, ang: 90, cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: '6 cm', q: '4 cm', r: 'x' }, angLbl: '90°' },
    sol: [
      ['Hadi birlikte bakalım. x kare eşittir 4 kare artı 6 kare, eksi 2 çarpı 4 çarpı 6 çarpı kosinüs 90.',
        '{x:x^2} = {a:4^2} + {b:6^2} − 2 · {a:4} · {b:6} · {g:cos(90°)}', { at: 0.2, durF: 0.75, cue: 'x² = 4² + 6² − 2 · 4 · 6 · cos(90°)' }],
      ['Kosinüs 90 sıfır olduğu için son kısım gidiyor. 16 artı 36, 52 eder.',
        '{x:x^2} = {a:16} + {b:36} = 52', { at: 0.45, durF: 0.5, cue: 'x² = 16 + 36 = 52' }],
      ['Yani x eşittir kök 52, yaklaşık 7 virgül 21 santimetre. Bulduysanız tebrikler!',
        '{x:x} = √(52) <span class="resbox">≈ 7,21 cm</span>', { at: 0.1, durF: 0.5, cue: 'x = √52 ≈ 7,21 cm',
          then: (T) => { T.set('sl-r', '≈ 7,21 cm', { at: 0.6 }); s.hl(T.sel('sl-r'), { at: 0.6 }); } }]
    ]
  });
  const clear = (q) => { s.hide(q.qc, {}); s.hide(q.T, {}); q.st.clear({}); };

  const q2 = (() => {
    s.say('İkinci soru: İki kenarı 4 santimetre ve 4 santimetre olan bir üçgende, aralarındaki açı 60 derece. Üçüncü kenar kaç santimetredir?', { cue: 'Soru 2 kartı ve üçgen' });
    clear(q1);
    const qc = card(s, `<span class="lbl">Soru 2</span>İki kenarı <span class="c-a">4 cm</span> ve <span class="c-b">4 cm</span>, aradaki açı <span class="c-g">60°</span>. Üçüncü kenar kaç cm?`, { ...Q, at: 0.05 });
    const T = s.tri({ ...TRI, p: 4, q: 4, ang: 60, cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: '4 cm', q: '4 cm', r: 'x' }, angLbl: '60°', hide: ['sl-r'], at: 0.2 });
    T.show('sl-r', { at: 0.85 });
    s.wait(5, { cue: '⏸ 5 sn düşünme (sessiz, geri sayım)' }); countdown(s);
    const st = s.stack({ x: RX, y: 380 });
    s.say('Hadi bakalım. x kare eşittir 16 artı 16, eksi 2 çarpı 4 çarpı 4 çarpı yarım.', { cue: 'x² = 16 + 16 − 2 · 4 · 4 · 1/2' });
    st.line('{x:x^2} = {a:16} + {b:16} − 2 · {a:4} · {b:4} · [[.1|2]]', { at: 0.2, durF: 0.75 });
    s.say('2 çarpı 4 çarpı 4, 32 eder; yarısı da 16. 32 eksi 16, 16 eder.', { cue: 'x² = 32 − 16 = 16' });
    st.line('{x:x^2} = 32 − 16 = 16', { at: 0.35, durF: 0.55 });
    s.say('x kare 16 ise, x 4 santimetre. İlginç değil mi? Üç kenarın üçü de 4 çıktı. Bu bir eşkenar üçgen!', { cue: 'x = 4 cm; not: eşkenar üçgen' });
    st.line('{x:x} = √(16) <span class="resbox">= 4 cm</span>', { at: 0.1, durF: 0.4 });
    T.set('sl-r', '4 cm', { at: 0.3 });
    ['side-p', 'side-q', 'side-r'].forEach(k => s.hl(T.sel(k), { at: 0.6 }));
    const nn = note(s, `Eşkenar üçgen: üç kenar da 4 cm`, { c: 'g', at: 0.7 });
    return { qc, T, st, nn };
  })();

  s.say('Üçüncü soru: Bir üçgende a eşittir 3 santimetre, b eşittir 4 santimetre ve C açısı 60 derece. c kenarını bulun.', { cue: 'Soru 3 kartı ve üçgen' });
  clear(q2); s.hide(q2.nn, {});
  const qc3 = card(s, `<span class="lbl">Soru 3</span><span class="c-a">a = 3 cm</span>, <span class="c-b">b = 4 cm</span>, <span class="c-g">C = 60°</span> ise <span class="c-x">c</span> kenarını bulun.`, { ...Q, at: 0.05 });
  const T3 = s.tri({ ...TRI, p: 4, q: 3, ang: 60, names: ['C', 'A', 'B'], cols: { p: 'b', q: 'a', r: 'x' }, lbl: { p: 'b = 4 cm', q: 'a = 3 cm', r: 'c = ?' }, angLbl: '60°', hide: ['sl-r'], at: 0.2 });
  T3.show('sl-r', { at: 0.9 });
  s.wait(5, { cue: '⏸ 5 sn düşünme (sessiz, geri sayım)' }); countdown(s);
  const st3 = s.stack({ x: RX, y: 330 });
  s.say('c kare eşittir 9 artı 16, eksi 2 çarpı 3 çarpı 4 çarpı yarım.', { cue: 'c² = 9 + 16 − 2 · 3 · 4 · 1/2' });
  st3.line('{x:c^2} = {a:9} + {b:16} − 2 · {a:3} · {b:4} · [[.1|2]]', { at: 0.05, durF: 0.85 });
  s.say('2 çarpı 3 çarpı 4, 24 eder; yarısı da 12. 25 eksi 12, 13 eder.', { cue: 'c² = 25 − 12 = 13' });
  st3.line('{x:c^2} = 25 − 12 = 13', { at: 0.35, durF: 0.55 });
  s.say('Yani c eşittir kök 13, yaklaşık 3 virgül 61 santimetre.', { cue: 'c = √13 ≈ 3,61 cm' });
  const L3 = st3.line('{x:c} = √(13) <span class="resbox">≈ 3,61 cm</span>', { at: 0.15, durF: 0.55 });
  T3.set('sl-r', 'c ≈ 3,61 cm', { at: 0.8 }); s.hl(T3.sel('sl-r'), { at: 0.8 });

  s.say('Yanlış yaptıysanız hiç dert etmeyin. Videoyu durdurup adımlara yeniden bakabilirsiniz. Hata yapmak, öğrenmenin bir parçasıdır.',
    { cue: 'Cesaretlendirici kart', hold: 0.8 });
  s.add(`<div class="badge" style="font-size:52px">Hata yapmak,<br>öğrenmenin bir parçası!</div>`, { x: 960, y: 500, ax: 0.5, ay: 0.5, anim: 'pop', at: 0.55 });
  s.hide([T3, qc3], { at: 0.5 }); st3.clear({ at: 0.5 });
});

/* ======================================================================= */
/* BÖLÜM 9 — Konu Özeti                                                     */
/* ======================================================================= */
VIDEO.scene({
  id: '09', label: 'BÖLÜM 9', title: 'Konu Özeti', target: '1 dk',
  notes: [
    'Solda numaralı 6 adım tek tek belirir. Sağda iki formül kartı: "Kenar bulma" ve "Açı bulma".',
    'Son cümlede her şey soluklaşır; ortada büyük kapanış mesajı kalır.'
  ]
}, s => {
  s.say('Harika bir iş çıkardınız! Şimdi bugün öğrendiklerimizi özetleyelim.', { cue: '"Kosinüs teoremini kullanırken:" başlığı' });
  const all = [];
  all.push(s.add(`<div class="ask" style="font-size:46px">Kosinüs teoremini kullanırken:</div>`, { x: 90, y: 150, at: 0.4 }));
  const steps = ['Üçgeni çiz.', 'Bilinen <b>iki kenarı</b> belirle.', 'Bu iki kenarın <b>arasındaki açıyı</b> bul.',
    'Doğru <b>formülü</b> yaz.', 'Sayıları ve <b>kosinüs değerini</b> yerine koy.', 'İşlemleri yap, gerekiyorsa <b>karekök</b> al.'];
  const stepAt = [0.2, 0.45, 0.7, 0.15, 0.42, 0.72];
  s.say('Kosinüs teoremini kullanırken: Bir, üçgeni çiz. İki, bilinen iki kenarı belirle. Üç, bu iki kenarın arasındaki açıyı bul.', { cue: 'Adım 1–3' });
  steps.slice(0, 3).forEach((t, i) => all.push(s.add(`<div class="step"><span class="n">${i + 1}</span><span>${t}</span></div>`, { x: 100, y: 250 + i * 104, at: stepAt[i] })));
  s.say('Dört, doğru formülü yaz. Beş, sayıları ve kosinüs değerini yerine koy. Altı, işlemleri yap ve gerekiyorsa karekök al.', { cue: 'Adım 4–6' });
  steps.slice(3).forEach((t, i) => all.push(s.add(`<div class="step"><span class="n">${i + 4}</span><span>${t}</span></div>`, { x: 100, y: 250 + (i + 3) * 104, at: stepAt[i + 3] })));

  s.say('Kenar bulmak için formülümüz: c kare eşittir, a kare artı b kare, eksi iki a b kosinüs C.', { cue: 'Kenar bulma kartı' });
  all.push(card(s, `<span class="lbl">Kenar bulma</span><div class="fm" style="font-size:54px">${M('{x:c^2} = {a:a^2} + {b:b^2} − 2{a:a}{b:b} · {g:cos(C)}')}</div>`, { x: 1050, y: 230, at: 0.2 }));
  s.formulas.push('c² = a² + b² − 2ab · cos(C)');

  s.say('Açı bulmak için de: kosinüs C eşittir, a kare artı b kare eksi c kare, bölü iki a b.', { cue: 'Açı bulma kartı' });
  all.push(card(s, `<span class="lbl">Açı bulma</span><div class="fm" style="font-size:54px">${M('{g:cos(C)} = [[{a:a^2} + {b:b^2} − {x:c^2}|2{a:a}{b:b}]]')}</div>`, { x: 1050, y: 500, at: 0.2 }));
  s.formulas.push('cos(C) = (a² + b² − c²) / 2ab');

  s.say('Kosinüs teoremi zor görünse de, aslında adım adım uyguladığımız bir yöntemdir. Üçgeni doğru çiz, verilenleri yerleştir ve işlemleri sırayla yap!',
    { cue: 'Kapanış mesajı', hold: 3.0 });
  s.hide(all, { at: 0.35 });
  s.add(`<div class="title-xl" style="font-size:80px">Üçgeni doğru çiz,<br>verilenleri <em>yerleştir</em>,<br>işlemleri <em>sırayla</em> yap!</div>`,
    { x: 960, y: 500, ax: 0.5, ay: 0.5, anim: 'pop', at: 0.5, dur: 1 });
});

/* ======================================================================= */
/* Matematik doğruluk kontrolü (SENARYO.md'ye otomatik yazılır)            */
/* ======================================================================= */
window.MATH_CHECKS = (() => {
  const rad = d => (d * Math.PI) / 180;
  const side = (a, b, C) => Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(C)));
  const tr = x => x.toFixed(2).replace('.', ',');
  const ang = (a, b, c) => (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI;
  const ok = (a, b, c) => a + b > c && a + c > b && b + c > a;
  const rows = [
    ['Örnek 1', 3, 4, 90, 25, '5'],
    ['Örnek 2', 5, 7, 60, 39, '6,24'],
    ['Örnek 3 (yollar)', 6, 8, 60, 52, '7,21'],
    ['Soru 1', 4, 6, 90, 52, '7,21'],
    ['Soru 2', 4, 4, 60, 16, '4'],
    ['Soru 3', 3, 4, 60, 13, '3,61']
  ].map(([ad, a, b, C, sq, shown]) => {
    const x = side(a, b, C), x2 = a * a + b * b - 2 * a * b * Math.cos(rad(C));
    const pass = Math.abs(x2 - sq) < 1e-9 && (shown.includes(',') ? tr(x) === shown : Math.abs(x - +shown) < 1e-9) && ok(a, b, x);
    return { ad, veri: `${a}, ${b}, ${C}°`, kare: `${+x2.toFixed(6)}`, sonuc: tr(x), gosterilen: shown, ucgen: ok(a, b, x), pass };
  });
  const C4 = ang(5, 7, Math.sqrt(39));
  rows.push({ ad: 'Örnek 4 (açı)', veri: '5, 7, √39', kare: `cos C = ${(35 / 70).toString().replace('.', ',')}`, sonuc: C4.toFixed(4).replace('.', ',') + '°', gosterilen: '60°', ucgen: ok(5, 7, Math.sqrt(39)), pass: Math.abs(C4 - 60) < 1e-9 });
  return rows;
})();
