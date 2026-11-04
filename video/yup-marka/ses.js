/*
 * YUP Akademi · ses kimliği. Kısa videoların bütün sesleri tek yerden; dosya kullanılmaz, her ses synth.js'in
 * Mixer'ında sentezlenir (aynı kod oynatıcıda ve render'da aynı sesi verir). Rehber: video/ses/ses-rehberi.md.
 *
 * Kullanım (film.js'in score(m, hz, api) işlevi içinde):
 *   YupSes.vurgu(m, t, 'pop')            // vurgu sesleri: VURGULAR listesine bak
 *   YupSes.gecis(m, t, 'kesme')          // geçişler: mercek | kesme | sayfa | zoom | karanlik
 *   YupSes.ortam(m, t, sure, 'gece')     // ortam: oda | gece | yagmur | mutfak | lab | uzay | mac
 * kisa.js'te def.ses verilince müzik yatağı, kanca, geçişler ve kapanış kendiliğinden kurulur:
 *   ses: { muzik: 'merak', kanca: 'mercek', sus: ['a-dene'], ortam: { 'a-hook': 'oda' }, gecisler: { 'a-bak': null } }
 *
 * Marka imzası "Lup motifi": La5 – Re6 – Fa#6 (yükselen majör üçlü, marimba) + cam tıngısı. Açılışta kısa hâli
 * (tıngı ve mercek hışırtısı), kapanışta "Lup'la bak" yazısıyla tam hâli çalar; izleyici sesi kanala bağlar.
 * Müzik ruhları (RUH): merak (varsayılan, Re majör, marimba), gizem (La minör, celesta), sicak (Fa majör, piyano),
 * komik (Do majör, pizzicato ve fagot), enerjik (Mi minör, marimba ve ritim). Müzik seslendirme sırasında kısılır
 * (synth.js duck); "sus" aralıklarında tamamen susar (deney, sessizlik vurgusu).
 */
(function (root) {
  'use strict';

  const hz = root.Synth.hz;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const up = (name, oct) => hz(name) * Math.pow(2, oct);

  // Seviyeler ölçülerek ayarlandı (video/ses/kit/olcum.json; seslendirme ham −21 LUFS). Her ruhun lv katsayısı ruhları
  // aynı yüksekliğe (−35 LUFS) getirir; LV.muzik 1,58 (+4 dB) ile müzik yatağı seslendirmeden ~10 dB alçak çalar,
  // konuşma sırasında synth.js duck (×0,3) ile ~20,5 dB alçak kalır (WCAG: en az 20 dB; anlatım hep anlaşılır).
  // Ortamlar ~−39 LUFS. LV ile her grup birlikte değişir.
  const LV = { muzik: 1.58, vurgu: 1, ortam: 1 };

  const MOTIF = ['A5', 'D6', 'F#6'];

  // ---------------------------------------------------------------------------
  // İmza ve açılış
  // ---------------------------------------------------------------------------
  // Tam imza (~1,6 sn): mercek hışırtısı, cam tıngısı, Lup motifi, parıltı
  function imza(m, t, { gain = 1 } = {}) {
    m.whoosh(t, { dur: 0.36, from: 600, to: 4200, gain: 0.045 * gain, q: 1.4 });
    m.bell(t + 0.34, { freq: hz('E7'), gain: 0.06 * gain, decay: 1.8, pan: 0.15 });
    m.bell(t + 0.35, { freq: hz('B7'), gain: 0.022 * gain, decay: 1.4, pan: -0.15 });
    MOTIF.forEach((n, i) => m.pluck(t + 0.48 + i * 0.12, { freq: hz(n), gain: 0.09 * gain, decay: 0.9, pan: -0.2 + i * 0.2, wet: 0.35 }));
    m.pluck(t + 0.48 + 3 * 0.12, { freq: hz('D5'), gain: 0.05 * gain, decay: 1.2, wet: 0.35 });
    m.sparkle(t + 0.75, { gain: 0.02 * gain, dur: 0.5, base: 2349 });
  }

  // Kanca: videonun ilk saniyesi. Sesiz başlayan short kaydırılır; ilk karede mutlaka bir ses olur.
  function kanca(m, t, tur = 'mercek', { gain = 1 } = {}) {
    const g = gain * LV.vurgu;
    switch (tur) {
      case 'darbe': // şok bilgi, sayı: alçak darbe + parlak tıngı
        m.hit(t + 0.02, { gain: 0.3 * g });
        m.bell(t + 0.05, { freq: hz('E7'), gain: 0.04 * g, decay: 1.6, pan: 0.2 });
        break;
      case 'gizem': // uzay, sır: derin uğultu, uzun yankılı iki çan
        m.drone(t, 3.4, { gain: 0.07 * g, notes: ['A1', 'E2', 'A2'] });
        m.bell(t + 0.05, { freq: hz('A6'), gain: 0.05 * g, decay: 3, wet: 0.7 });
        m.bell(t + 0.42, { freq: hz('E7'), gain: 0.03 * g, decay: 2.6, wet: 0.7 });
        break;
      case 'komik': // ters köşe, mizah
        m.boing(t + 0.02, { gain: 0.08 * g });
        m.pop(t + 0.32, { freq: 900, gain: 0.05 * g });
        break;
      case 'imza':
        imza(m, t, { gain: g });
        break;
      default: // 'mercek': Mercek Açılışı'na oturur (el halkayı çevirir → cam tıngısı → mercek açılır)
        m.kick(t + 0.02, { gain: 0.12 * g });
        m.bell(t + 0.12, { freq: hz('E7'), gain: 0.065 * g, decay: 2, pan: 0.2 });
        m.bell(t + 0.14, { freq: hz('B7'), gain: 0.024 * g, decay: 1.6, pan: -0.2 });
        m.whoosh(t + 0.42, { dur: 0.62, from: 600, to: 2800, gain: 0.05 * g });
        m.sparkle(t + 0.95, { gain: 0.012 * g, dur: 0.35, base: 2349 });
    }
  }

  // ---------------------------------------------------------------------------
  // Geçişler (t: yeni sahnenin başı)
  // ---------------------------------------------------------------------------
  function gecis(m, t, tur = 'mercek', { gain = 1 } = {}) {
    const g = gain * LV.vurgu;
    switch (tur) {
      case 'kesme': // sert kesme: kısa hışırtı + hafif darbe
        m.whoosh(Math.max(0, t - 0.12), { dur: 0.18, from: 1500, to: 5000, gain: 0.035 * g, q: 1.6 });
        m.kick(t, { gain: 0.07 * g });
        break;
      case 'sayfa':
        m.paper(Math.max(0, t - 0.08), { gain: 0.09 * g });
        break;
      case 'zoom': // yakınlaşma: kısa yükseliş + pop
        m.riser(Math.max(0, t - 0.35), 0.35, { gain: 0.05 * g });
        m.pop(t, { freq: 760, gain: 0.06 * g });
        break;
      case 'karanlik': // karanlık ya da gizemli sahneye iniş
        m.whoosh(Math.max(0, t - 0.1), { dur: 0.7, from: 2400, to: 300, gain: 0.05 * g });
        m.boom(t + 0.05, { gain: 0.08 * g, freq: 60 });
        break;
      default: // 'mercek': mercek halkası büyür, sonda cam tıngısı
        m.whoosh(Math.max(0, t - 0.05), { dur: 0.55, from: 450, to: 2400, gain: 0.04 * g });
        m.bell(t + 0.42, { freq: hz('B6'), gain: 0.018 * g, decay: 1.2, pan: 0.25 });
    }
  }

  // ---------------------------------------------------------------------------
  // Vurgular
  // ---------------------------------------------------------------------------
  const VURGULAR = {
    pop: (m, t, g) => m.pop(t, { freq: 640, gain: 0.07 * g }),
    tik: (m, t, g) => m.click(t, { gain: 0.12 * g, tone: 2600 }),
    damga: (m, t, g) => {
      m.kick(t, { gain: 0.14 * g });
      m.click(t, { gain: 0.2 * g, tone: 900 });
    },
    bant: (m, t, g) => m.tapeRip(t, { gain: 0.09 * g }),
    yazi: (m, t, g) => {
      for (let i = 0; i < 7; i++) m.typeKey(t + i * 0.075, { gain: 0.07 * g, pan: 0.1 });
    },
    kalem: (m, t, g) => m.marker(t, { gain: 0.05 * g, dur: 0.45 }),
    dogru: (m, t, g) => {
      m.bell(t, { freq: hz('A6'), gain: 0.05 * g, decay: 1.4, pan: -0.15 });
      m.bell(t + 0.09, { freq: hz('E7'), gain: 0.045 * g, decay: 1.6, pan: 0.15 });
    },
    yanlis: (m, t, g) => m.buzz(t, { gain: 0.12 * g, dur: 0.32 }),
    sayi: (m, t, g) => {
      m.hit(t, { gain: 0.22 * g });
      m.bell(t + 0.03, { freq: hz('D7'), gain: 0.04 * g, decay: 1.8 });
    },
    sihir: (m, t, g) => m.sparkle(t, { gain: 0.035 * g, dur: 0.7 }),
    boing: (m, t, g) => m.boing(t, { gain: 0.08 * g }),
    kalp: (m, t, g) => m.heartbeat(t, { gain: 0.35 * g }),
    citla: (m, t, g) => {
      // çekirdek çitleme: kabuğun kırılışı (sert tık, tiz çatırtı, ikinci yarının açılışı)
      m.click(t, { gain: 0.13 * g, tone: 4200 });
      m.tick(t + 0.012, { gain: 0.07 * g, tone: 6200 });
      m.click(t + 0.038, { gain: 0.05 * g, tone: 2500 });
    },
    saat: (m, t, g) => {
      for (let i = 0; i < 4; i++) m.tick(t + i * 0.5, { gain: 0.05 * g, tone: 3000 + (i % 2) * 600 });
    },
    aha: (m, t, g) => {
      ['D5', 'F#5', 'A5', 'D6'].forEach((n, i) => m.pluck(t + i * 0.07, { freq: hz(n), gain: 0.06 * g, decay: 0.8, pan: -0.3 + i * 0.2 }));
      m.sparkle(t + 0.25, { gain: 0.018 * g, dur: 0.4 });
    },
    soru: (m, t, g) => {
      m.pluck(t, { freq: hz('E5'), gain: 0.06 * g, tone: 'pizz', decay: 0.5 });
      m.pluck(t + 0.16, { freq: hz('B5'), gain: 0.06 * g, tone: 'pizz', decay: 0.7 });
    },
    kagit: (m, t, g) => m.paper(t, { gain: 0.08 * g }),
    zzz: (m, t, g) => m.wobble(t, 0.6, { gain: 0.05 * g, freq: 170 }),
    yukselis: (m, t, g) => m.riser(t, 0.8, { gain: 0.04 * g }),
  };
  function vurgu(m, t, tur = 'pop', { gain = 1 } = {}) {
    (VURGULAR[tur] ?? VURGULAR.pop)(m, t, gain * LV.vurgu);
  }

  // ---------------------------------------------------------------------------
  // Ortam sesleri (sahne boyunca, çok alçak)
  // ---------------------------------------------------------------------------
  function ortam(m, t, dur, tur = 'oda', { gain = 1 } = {}) {
    const g = gain * LV.ortam;
    if (dur <= 0.2) return;
    switch (tur) {
      case 'gece':
        m.roomTone(t, dur, { gain: 0.02 * g });
        m.crickets(t, dur, { gain: 0.012 * g });
        m.wind(t, dur, { gain: 0.03 * g });
        break;
      case 'yagmur':
        m.rain(t, dur, { gain: 0.022 * g });
        break;
      case 'mutfak':
        m.roomTone(t, dur, { gain: 0.025 * g });
        m.bubbles(t, dur, { gain: 0.025 * g, rate: 5 });
        break;
      case 'lab':
        m.hum(t, dur, { gain: 0.007 * g });
        m.bubbles(t, dur, { gain: 0.012 * g, rate: 3 });
        break;
      case 'uzay':
        m.drone(t, dur, { gain: 0.012 * g, notes: ['D2', 'A2', 'E3'] });
        break;
      case 'mac': // televizyonda maç: uzak tribün uğultusu ve oda
        m.roomTone(t, dur, { gain: 0.02 * g });
        m.crowd(t, dur, { gain: 0.016 * g });
        break;
      default: // oda
        m.roomTone(t, dur, { gain: 0.03 * g });
    }
  }

  // ---------------------------------------------------------------------------
  // Müzik yatağı
  // ---------------------------------------------------------------------------
  // chords: kök notası en alçakta; arp: akor tonlarının (oktav yukarısı dahil) sırası; step: arp adımı (vuruş)
  const RUH = {
    merak: {
      bpm: 100, tone: 'marimba', oct: 2, step: 0.5, decay: 0.55, arpGain: 0.05, lv: 0.226,
      chords: [['D3', 'F#3', 'A3'], ['B2', 'D3', 'F#3'], ['G2', 'B2', 'D3'], ['A2', 'C#3', 'E3']],
      arp: [0, 1, 2, 3, 4, 3, 2, 1], bass: [0, 2], bassTone: 'yumusak',
      kick: [0, 2], snap: [], shaker: true,
    },
    gizem: {
      bpm: 84, tone: 'celesta', oct: 2, step: 1, decay: 1.6, arpGain: 0.04, lv: 0.21,
      chords: [['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3'], ['E2', 'G#2', 'B2']],
      arp: [4, null, 2, 3], bass: [0], bassLen: 4, bassTone: 'yumusak',
      kick: [], snap: [], shaker: false, tick: true, drone: true,
    },
    sicak: {
      bpm: 76, tone: 'piano', oct: 1, step: 0.5, decay: 1.3, arpGain: 0.045, lv: 0.24,
      chords: [['F2', 'A2', 'C3', 'E3'], ['A2', 'C3', 'E3', 'G3'], ['D2', 'F2', 'A2', 'C3'], ['G2', 'B2', 'D3', 'F3']],
      arp: [0, 2, 3, 4, 3, 2, 1, 2], bass: [0], bassLen: 4, bassTone: 'yumusak',
      kick: [], snap: [], shaker: false,
    },
    komik: {
      bpm: 116, tone: 'pizz', oct: 2, step: 1, decay: 0.22, arpGain: 0.055, lv: 0.153,
      chords: [['C3', 'E3', 'G3'], ['G2', 'B2', 'D3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3']],
      arp: [2, 3, 1, 4], bass: [0, 1, 2, 3], bassWalk: true, bassLen: 0.7, bassTone: 'kamis',
      kick: [], snap: [1, 3], shaker: false,
    },
    enerjik: {
      bpm: 120, tone: 'marimba', oct: 2, step: 0.5, decay: 0.4, arpGain: 0.045, lv: 0.204,
      chords: [['E3', 'G3', 'B3'], ['C3', 'E3', 'G3'], ['G2', 'B2', 'D3'], ['D3', 'F#3', 'A3']],
      arp: [0, 2, 4, 2, 1, 2, 4, 5], bass: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], bassTone: 'yumusak',
      kick: [0, 1, 2, 3], snap: [1, 3], shaker: true,
    },
  };

  // a–b arasında müzik; sus: [[t0, t1], ...] aralıklarında susar (öncesinde 0,6 sn söner, sonrasında 0,8 sn döner)
  function muzik(m, a, b, o = {}) {
    const R = { ...RUH[o.ruh ?? 'merak'], ...(o.bpm ? { bpm: o.bpm } : {}) };
    const G = (o.gain ?? 1) * LV.muzik * (R.lv ?? 1);
    const beat = 60 / R.bpm;
    const bar = beat * 4;
    const sus = o.sus ?? [];
    const amp = (t) => {
      let k = clamp((t - a) / 0.8) * clamp((b - t) / 1.0);
      for (const [x, y] of sus) {
        if (t >= x - 0.02 && t < y) return 0;
        if (t < x) k *= clamp((x - t) / 0.6);
        else k *= clamp((t - y) / 0.8);
      }
      return k;
    };
    const tones = (ch) => {
      const T = ch.map((n) => up(n, R.oct));
      return [...T, ...ch.map((n) => up(n, R.oct + 1))];
    };
    let bi = 0;
    for (let t0 = a; t0 < b - 0.05; t0 += bar, bi++) {
      const ch = R.chords[bi % R.chords.length];
      const T = tones(ch);
      // arpej
      const steps = Math.round(4 / R.step);
      for (let s = 0; s < steps; s++) {
        const idx = R.arp[s % R.arp.length];
        if (idx == null) continue;
        const t = t0 + s * R.step * beat;
        const k = amp(t);
        if (k <= 0.01 || t >= b) continue;
        const acc = s % (2 / R.step) === 0 ? 1 : 0.75;
        m.pluck(t, { freq: T[idx % T.length], gain: R.arpGain * G * k * acc, tone: R.tone, decay: R.decay, pan: ((s % 4) - 1.5) * 0.15, wet: 0.3 });
      }
      // bas
      const root0 = hz(ch[0]) / 2;
      R.bass.forEach((bt, i) => {
        const t = t0 + bt * beat;
        const k = amp(t);
        if (k <= 0.01 || t >= b) return;
        let f = root0;
        if (R.bassWalk) f = [root0, hz(ch[2]) / 2, root0 * 2, hz(ch[1]) / 2][i % 4];
        const len = (R.bassLen ?? (R.bass.length > 4 ? 0.45 : 1.6)) * beat;
        m.bass(t, { freq: f, dur: len, gain: 0.09 * G * k, tone: R.bassTone });
      });
      // vurmalılar
      for (const kb of R.kick) {
        const t = t0 + kb * beat;
        const k = amp(t);
        if (k > 0.01 && t < b) m.kick(t, { gain: 0.1 * G * k });
      }
      for (const sb of R.snap) {
        const t = t0 + sb * beat;
        const k = amp(t);
        if (k > 0.01 && t < b) m.snap(t, { gain: 0.045 * G * k, pan: 0.1 });
      }
      if (R.shaker) {
        for (let s = 0; s < 8; s++) {
          const t = t0 + s * 0.5 * beat;
          const k = amp(t);
          if (k > 0.01 && t < b) m.shaker(t, { gain: (s % 2 ? 0.022 : 0.012) * G * k, pan: 0.25 });
        }
      }
      if (R.tick) {
        for (let s = 0; s < 4; s++) {
          const t = t0 + s * beat;
          const k = amp(t);
          if (k > 0.01 && t < b) m.tick(t, { gain: 0.018 * G * k, tone: s % 2 ? 3600 : 3000 });
        }
      }
    }
    if (R.drone) {
      // gizem: sus aralıklarının dışında sürekli alçak uğultu
      const spans = [];
      let s = a;
      for (const [x, y] of [...sus].sort((p, q) => p[0] - q[0])) {
        if (x > s) spans.push([s, Math.min(x, b)]);
        s = Math.max(s, y);
      }
      if (s < b) spans.push([s, b]);
      for (const [x, y] of spans) if (y - x > 1) m.drone(x, y - x, { gain: 0.05 * G, notes: ['A1', 'E2', 'A2'] });
    }
  }

  // ---------------------------------------------------------------------------
  // Kapanış: logo ile tam imza, "abone ol"a basınca onay
  // ---------------------------------------------------------------------------
  function kapanis(m, s0, tap, { gain = 1 } = {}) {
    const g = gain * LV.vurgu;
    m.kick(s0 + 0.25, { gain: 0.1 * g });
    m.boom(s0 + 0.25, { gain: 0.08 * g, freq: 70 });
    imza(m, s0 + 0.35, { gain: g });
    m.click(tap, { gain: 0.22 * g, tone: 2600 });
    m.bell(tap + 0.05, { freq: hz('A6'), gain: 0.05 * g, decay: 1.5, pan: 0.2 });
    m.bell(tap + 0.18, { freq: hz('D7'), gain: 0.04 * g, decay: 1.8, pan: -0.2 });
    m.sparkle(tap + 0.12, { gain: 0.022 * g, dur: 0.6 });
  }

  root.YupSes = { LV, MOTIF, RUH, VURGULAR, imza, kanca, gecis, vurgu, ortam, muzik, kapanis };
})(typeof window !== 'undefined' ? window : globalThis);
