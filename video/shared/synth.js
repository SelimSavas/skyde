/*
 * Ortak ses sentezleyici.
 *
 * Hiçbir ses dosyası kullanılmaz: her efekt Web Audio düğümleriyle (osilatör, gürültü,
 * filtre, zarf) burada üretilir. Filmin bütün sesi OfflineAudioContext ile tek seferde
 * hesaplanır; oynatıcı bu tamponu çalar, render.mjs ise aynı tamponu WAV olarak videoya ekler.
 * Gürültüler tohumlu üreteçle doldurulduğu için her hesaplama aynı sesi verir.
 */
(function (root) {
  'use strict';

  // Tohumlu sözde-rastgele üreteç (mulberry32)
  function prng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Nota adı → frekans ('A4' → 440, 'F#3', 'Bb2')
  function hz(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) throw new Error(`Geçersiz nota: ${name}`);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
    const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    const midi = 12 * (Number(m[3]) + 1) + base + acc;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function makeNoise(ctx, seconds, kind, rand) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = rand() * 2 - 1;
      if (kind === 'pink') {
        // Paul Kellet'in pembe gürültü süzgeci
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else if (kind === 'brown') {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else {
        d[i] = w;
      }
    }
    return buf;
  }

  // Yankı için yapay oda tepkisi: üstel sönen stereo gürültü
  function makeImpulse(ctx, seconds, decay, rand) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  }

  class Mixer {
    constructor(ctx, seed = 1014) {
      this.ctx = ctx;
      this.rand = prng(seed);
      this.white = makeNoise(ctx, 4, 'white', this.rand);
      this.pink = makeNoise(ctx, 4, 'pink', this.rand);
      this.brown = makeNoise(ctx, 4, 'brown', this.rand);

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 10;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.004;
      comp.release.value = 0.2;
      comp.connect(ctx.destination);
      this.bus = ctx.createGain();
      this.bus.connect(comp);
      // Efektler ve müzik "bed" kanalında toplanır; seslendirme sırasında bu kanal kısılır.
      this.bed = ctx.createGain();
      this.bed.connect(this.bus);

      const conv = ctx.createConvolver();
      conv.normalize = true;
      conv.buffer = makeImpulse(ctx, 3.4, 2.8, this.rand);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      this.verb = ctx.createGain();
      this.verb.connect(conv).connect(wet).connect(this.bed);
    }

    // Kaynağı kazanç/pan/yankı gönderisiyle ana kanala bağlar.
    route(node, { gain = 1, pan = 0, wet = 0.15 } = {}) {
      const g = this.ctx.createGain();
      g.gain.value = gain;
      node.connect(g);
      let last = g;
      if (pan) {
        const p = this.ctx.createStereoPanner();
        p.pan.value = Math.max(-1, Math.min(1, pan));
        g.connect(p);
        last = p;
      }
      last.connect(this.bed);
      if (wet > 0) {
        const s = this.ctx.createGain();
        s.gain.value = wet;
        last.connect(s);
        s.connect(this.verb);
      }
      return g;
    }

    noise(kind, t, dur) {
      const src = this.ctx.createBufferSource();
      src.buffer = this[kind];
      src.loop = true;
      src.start(t, this.rand() * 3);
      src.stop(t + dur + 0.05);
      return src;
    }

    osc(type, freq, t, dur) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.start(t);
      o.stop(t + dur + 0.05);
      return o;
    }

    filter(type, freq, q = 0.7) {
      const f = this.ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      return f;
    }

    // Vurmalı zarf: hızlı yükseliş, üstel sönüm
    env(t, attack, decay, peak = 1) {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
      g.gain.setValueAtTime(0, t + attack + decay + 0.005);
      return g;
    }

    // Sürekli sesler için: yavaş giriş, tutma, yavaş çıkış
    hold(t, dur, fadeIn, fadeOut, level = 1) {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + fadeIn);
      g.gain.setValueAtTime(level, Math.max(t + fadeIn, t + dur - fadeOut));
      g.gain.linearRampToValueAtTime(0, t + dur);
      return g;
    }

    // Seyrek, kısa, rastgele tıkırtılardan oluşan tampon (çıtırtı, yağmur damlası, parazit)
    sparks(dur, density, minLen, maxLen, curve = 2.2) {
      const sr = this.ctx.sampleRate;
      const n = Math.max(1, Math.floor(dur * sr));
      const buf = this.ctx.createBuffer(1, n, sr);
      const d = buf.getChannelData(0);
      const count = Math.floor(dur * density);
      for (let k = 0; k < count; k++) {
        const at = Math.floor(this.rand() * n);
        const len = minLen + Math.floor(this.rand() * (maxLen - minLen));
        const amp = Math.pow(this.rand(), curve) * 0.9 + 0.05;
        for (let i = 0; i < len && at + i < n; i++) {
          d[at + i] += (this.rand() * 2 - 1) * amp * Math.exp(-i / (len * 0.25));
        }
      }
      return buf;
    }

    // ---------- Efektler ----------

    // Düğme tıkı
    click(t, { gain = 0.2, pan = 0, tone = 3200 } = {}) {
      const n = this.noise('white', t, 0.03);
      const e = this.env(t, 0.0008, 0.018);
      n.connect(this.filter('bandpass', tone, 1.2)).connect(e);
      this.route(e, { gain, pan, wet: 0.05 });
      const o = this.osc('sine', tone * 0.4, t, 0.04);
      const e2 = this.env(t, 0.001, 0.025, 0.5);
      o.connect(e2);
      this.route(e2, { gain: gain * 0.6, pan, wet: 0.05 });
    }

    // Çok kısa, tiz tık (saat, ızgara dolumu, projektör)
    tick(t, { gain = 0.05, pan = 0, tone = 5200 } = {}) {
      const n = this.noise('white', t, 0.012);
      const e = this.env(t, 0.0005, 0.006);
      n.connect(this.filter('highpass', tone, 0.8)).connect(e);
      this.route(e, { gain, pan, wet: 0.03 });
    }

    // Dijital bip
    blip(t, { freq = 880, dur = 0.12, type = 'sine', gain = 0.15, pan = 0, wet = 0.15, slide = 0 } = {}) {
      const o = this.osc(type, freq, t, dur + 0.05);
      if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      const e = this.env(t, 0.004, dur);
      if (type === 'sine') {
        o.connect(e);
      } else {
        o.connect(this.filter('lowpass', Math.min(freq * 4, 12000))).connect(e);
      }
      this.route(e, { gain, pan, wet });
    }

    // Çan: uyumsuz kısmi tonlar, uzun sönüm
    bell(t, { freq = 880, gain = 0.2, decay = 2.5, pan = 0, wet = 0.45 } = {}) {
      const sum = this.ctx.createGain();
      const partials = [[1, 1, 1], [2.0, 0.5, 0.7], [2.76, 0.35, 0.5], [5.4, 0.16, 0.3], [8.93, 0.07, 0.18]];
      for (const [ratio, amp, dk] of partials) {
        const o = this.osc('sine', freq * ratio, t, decay * dk + 0.1);
        const e = this.env(t, 0.002, decay * dk, amp);
        o.connect(e).connect(sum);
      }
      this.route(sum, { gain, pan, wet });
    }

    // Derin vuruş
    boom(t, { gain = 0.5, freq = 70 } = {}) {
      const o = this.osc('sine', freq, t, 1.4);
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 1.1);
      const e = this.env(t, 0.005, 1.2);
      o.connect(e);
      this.route(e, { gain, wet: 0.2 });
      const n = this.noise('brown', t, 0.6);
      const e2 = this.env(t, 0.003, 0.5, 0.6);
      n.connect(this.filter('lowpass', 300)).connect(e2);
      this.route(e2, { gain: gain * 0.5, wet: 0.3 });
    }

    // Hışırtı: frekansı kayan bant geçiren gürültü
    whoosh(t, { dur = 0.8, from = 300, to = 3000, gain = 0.2, panFrom = 0, panTo = 0, q = 1.2 } = {}) {
      const n = this.noise('pink', t, dur);
      const f = this.filter('bandpass', from, q);
      f.frequency.setValueAtTime(from, t);
      f.frequency.exponentialRampToValueAtTime(to, t + dur);
      const e = this.ctx.createGain();
      e.gain.value = 0;
      e.gain.setValueAtTime(0, t);
      e.gain.linearRampToValueAtTime(1, t + dur * 0.6);
      e.gain.linearRampToValueAtTime(0, t + dur);
      const p = this.ctx.createStereoPanner();
      p.pan.setValueAtTime(panFrom, t);
      p.pan.linearRampToValueAtTime(panTo, t + dur);
      n.connect(f).connect(e).connect(p);
      this.route(p, { gain, wet: 0.3 });
    }

    // Yükselen gerilim
    riser(t, dur, { gain = 0.2 } = {}) {
      this.whoosh(t, { dur, from: 200, to: 6000, gain, q: 0.9 });
      const o = this.osc('sawtooth', 110, t, dur);
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(660, t + dur);
      const e = this.hold(t, dur, dur * 0.9, 0.05);
      o.connect(this.filter('lowpass', 1400)).connect(e);
      this.route(e, { gain: gain * 0.25, wet: 0.4 });
    }

    // Ateşin tutuşması: "fuşş" + alçak gümbürtü
    fireIgnite(t, { gain = 0.5, pan = 0 } = {}) {
      this.whoosh(t, { dur: 0.9, from: 250, to: 2200, gain: gain * 0.8, panFrom: pan, panTo: pan, q: 0.8 });
      const n = this.noise('brown', t, 1.6);
      const e = this.env(t, 0.08, 1.4);
      n.connect(this.filter('lowpass', 500)).connect(e);
      this.route(e, { gain: gain * 0.9, pan, wet: 0.2 });
    }

    // Yanan ateşin çıtırtısı ve uğultusu
    crackle(t, dur, { gain = 0.3, pan = 0, density = 22, roar = 0.5 } = {}) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.sparks(dur, density, 30, 330);
      src.start(t);
      const e = this.hold(t, dur, 0.3, Math.min(1.2, dur * 0.3));
      src.connect(this.filter('highpass', 900, 0.5)).connect(e);
      this.route(e, { gain, pan, wet: 0.12 });
      if (roar > 0) {
        const r = this.noise('brown', t, dur);
        const e2 = this.hold(t, dur, 0.6, Math.min(1.5, dur * 0.3));
        r.connect(this.filter('lowpass', 380)).connect(e2);
        this.route(e2, { gain: gain * roar, pan, wet: 0.1 });
      }
    }

    // Gece rüzgârı
    wind(t, dur, { gain = 0.2 } = {}) {
      const n = this.noise('pink', t, dur);
      const f = this.filter('bandpass', 520, 0.6);
      const lfo = this.osc('sine', 0.11, t, dur);
      const depth = this.ctx.createGain();
      depth.gain.value = 260;
      lfo.connect(depth).connect(f.frequency);
      const amp = this.ctx.createGain();
      amp.gain.value = 0.75;
      const lfo2 = this.osc('sine', 0.07, t, dur);
      const depth2 = this.ctx.createGain();
      depth2.gain.value = 0.25;
      lfo2.connect(depth2).connect(amp.gain);
      const e = this.hold(t, dur, 2, 2);
      n.connect(f).connect(amp).connect(e);
      this.route(e, { gain, wet: 0.2 });
    }

    // Yağmur: hışırtı + damlalar
    rain(t, dur, { gain = 0.3 } = {}) {
      const n = this.noise('white', t, dur);
      const e = this.hold(t, dur, 1.2, 1.2);
      n.connect(this.filter('highpass', 900)).connect(this.filter('lowpass', 7000)).connect(e);
      this.route(e, { gain: gain * 0.35, wet: 0.2 });
      const drops = this.ctx.createBufferSource();
      drops.buffer = this.sparks(dur, 70, 20, 90, 3);
      drops.start(t);
      const e2 = this.hold(t, dur, 1.2, 1.2);
      drops.connect(this.filter('highpass', 2000)).connect(e2);
      this.route(e2, { gain, wet: 0.25 });
    }

    // Elektrik vınlaması (50 Hz şebeke)
    hum(t, dur, { gain = 0.12 } = {}) {
      const lp = this.filter('lowpass', 420, 1);
      this.osc('sawtooth', 50, t, dur).connect(lp);
      this.osc('sine', 100, t, dur).connect(lp);
      const e = this.hold(t, dur, 0.5, 0.6);
      lp.connect(e);
      this.route(e, { gain, wet: 0.05 });
    }

    // Hat paraziti
    staticNoise(t, dur, { gain = 0.06 } = {}) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.sparks(dur, 90, 10, 120, 1.5);
      src.start(t);
      const e = this.hold(t, dur, 0.3, 0.4);
      src.connect(this.filter('highpass', 1800)).connect(e);
      this.route(e, { gain, wet: 0.02 });
    }

    // Daktilo tuşu
    typeKey(t, { gain = 0.25, pan = 0 } = {}) {
      const n = this.noise('white', t, 0.06);
      const e = this.env(t, 0.001, 0.045);
      n.connect(this.filter('bandpass', 1800 + this.rand() * 900, 1.4)).connect(e);
      this.route(e, { gain, pan, wet: 0.08 });
      const o = this.osc('sine', 160 + this.rand() * 40, t, 0.08);
      const e2 = this.env(t, 0.001, 0.06, 0.7);
      o.connect(e2);
      this.route(e2, { gain: gain * 0.7, pan, wet: 0.05 });
    }

    // Bozulma: rastgele frekans adımları ve kesik gürültü
    glitch(t, dur, { gain = 0.2 } = {}) {
      const o = this.osc('square', 200, t, dur);
      for (let s = t; s < t + dur; s += 0.03 + this.rand() * 0.04) {
        o.frequency.setValueAtTime(80 + this.rand() * 1600, s);
      }
      const gate = () => {
        const g = this.ctx.createGain();
        g.gain.value = 0;
        for (let s = t; s < t + dur; s += 0.025) g.gain.setValueAtTime(this.rand() > 0.35 ? 1 : 0, s);
        g.gain.setValueAtTime(0, t + dur);
        return g;
      };
      const g1 = gate();
      o.connect(this.filter('lowpass', 5000)).connect(g1);
      this.route(g1, { gain: gain * 0.5, wet: 0.1 });
      const g2 = gate();
      this.noise('white', t, dur).connect(this.filter('bandpass', 2500, 0.8)).connect(g2);
      this.route(g2, { gain: gain * 0.6, wet: 0.1 });
    }

    // "Olmaz" vızıltısı
    buzz(t, { gain = 0.15, dur = 0.35 } = {}) {
      const sum = this.ctx.createGain();
      this.osc('square', 110, t, dur).connect(sum);
      this.osc('square', 104, t, dur).connect(sum);
      const e = this.hold(t, dur, 0.01, 0.08);
      sum.connect(this.filter('lowpass', 900)).connect(e);
      this.route(e, { gain: gain * 0.5, wet: 0.1 });
    }

    // Kabarcık gibi kısa "pop"
    pop(t, { freq = 600, gain = 0.2, pan = 0 } = {}) {
      const o = this.osc('sine', freq * 1.8, t, 0.15);
      o.frequency.setValueAtTime(freq * 1.8, t);
      o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
      const e = this.env(t, 0.002, 0.11);
      o.connect(e);
      this.route(e, { gain, pan, wet: 0.15 });
    }

    // At nalı: tahta tok sesi, ikişer
    hoof(t, { gain = 0.2, pan = 0 } = {}) {
      for (const dt of [0, 0.11]) {
        const o = this.osc('sine', 420 + this.rand() * 60, t + dt, 0.08);
        const e = this.env(t + dt, 0.001, 0.05);
        o.connect(e);
        this.route(e, { gain, pan, wet: 0.15 });
        const n = this.noise('white', t + dt, 0.04);
        const e2 = this.env(t + dt, 0.001, 0.03);
        n.connect(this.filter('bandpass', 1400, 2)).connect(e2);
        this.route(e2, { gain: gain * 0.6, pan, wet: 0.1 });
      }
    }

    // Kalp atışı: "lub-dub"
    heartbeat(t, { gain = 0.5 } = {}) {
      for (const [dt, f, a] of [[0, 58, 1], [0.24, 66, 0.7]]) {
        const o = this.osc('sine', f * 1.4, t + dt, 0.3);
        o.frequency.setValueAtTime(f * 1.4, t + dt);
        o.frequency.exponentialRampToValueAtTime(f * 0.8, t + dt + 0.12);
        const e = this.env(t + dt, 0.008, 0.2, a);
        o.connect(e);
        this.route(e, { gain, wet: 0.1 });
      }
    }

    // Titreyen, odaklanamayan ton (göz yorgunluğu)
    wobble(t, dur, { gain = 0.12, freq = 180 } = {}) {
      const sum = this.ctx.createGain();
      for (const det of [0, 7]) {
        const o = this.osc('sine', freq + det, t, dur);
        const lfo = this.osc('sine', 6 + det * 0.3, t, dur);
        const depth = this.ctx.createGain();
        depth.gain.value = 14;
        lfo.connect(depth).connect(o.frequency);
        o.connect(sum);
      }
      const e = this.hold(t, dur, 0.2, 0.4);
      sum.connect(e);
      this.route(e, { gain, wet: 0.3 });
    }

    // Projektör: saniyede `rate` tık
    projector(t, dur, { gain = 0.04, rate = 25 } = {}) {
      for (let k = 0; k < dur * rate; k++) this.tick(t + k / rate, { gain: gain * (0.7 + this.rand() * 0.6), tone: 3000 });
    }

    // Arka plan akoru: detune edilmiş testere dişleri, yumuşak alçak geçiren
    pad(t, dur, notes, { gain = 0.12, attack = 2, release = 2.5, cutoff = 900 } = {}) {
      const sum = this.ctx.createGain();
      sum.gain.value = 0;
      sum.gain.setValueAtTime(0, t);
      sum.gain.linearRampToValueAtTime(1, t + attack);
      sum.gain.setValueAtTime(1, t + Math.max(attack, dur));
      sum.gain.linearRampToValueAtTime(0, t + Math.max(attack, dur) + release);
      const lp = this.filter('lowpass', cutoff, 0.4);
      const lfo = this.osc('sine', 0.09, t, dur + release);
      const depth = this.ctx.createGain();
      depth.gain.value = cutoff * 0.2;
      lfo.connect(depth).connect(lp.frequency);
      for (const name of notes) {
        for (const det of [-7, 6]) {
          const o = this.osc('sawtooth', hz(name), t, dur + release);
          o.detune.value = det;
          o.connect(lp);
        }
      }
      lp.connect(sum);
      this.route(sum, { gain: gain / (2 * notes.length), wet: 0.5 });
    }
  }

  // Seslendirme sırasında bed kanalını kısar; yakın satırlar arasında kanalı geri açmaz.
  function duck(param, lines, level = 0.3, attack = 0.25, release = 0.6) {
    const spans = [];
    for (const l of lines) {
      const a = l.at - attack;
      const b = l.at + l.dur;
      if (spans.length && a - spans[spans.length - 1][1] < attack + release + 0.3) spans[spans.length - 1][1] = b;
      else spans.push([a, b]);
    }
    param.setValueAtTime(1, 0);
    for (const [a, b] of spans) {
      param.setValueAtTime(1, Math.max(0, a));
      param.linearRampToValueAtTime(level, Math.max(0, a) + attack);
      param.setValueAtTime(level, b);
      param.linearRampToValueAtTime(1, b + release);
    }
  }

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  // voice: { audio: base64 (mp3), lines: [{ at, dur }], gain } — narrate.mjs'in ürettiği seslendirme izi
  async function render(score, duration, sampleRate = 48000, voice = null) {
    const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
    const mix = new Mixer(ctx);
    if (voice) {
      const speech = await ctx.decodeAudioData(base64ToBytes(voice.audio).buffer);
      const src = ctx.createBufferSource();
      src.buffer = speech;
      const g = ctx.createGain();
      g.gain.value = voice.gain ?? 1;
      src.connect(g).connect(mix.bus);
      src.start(0);
      duck(mix.bed.gain, voice.lines);
    }
    // Notadaki çağrılar önce yalnızca kaydedilir; düğümler zamanı gelince kurulur.
    // Binlerce efektin düğümü baştan bağlansaydı her işleme adımında hepsi dolaşılırdı.
    const calls = [];
    const recorder = new Proxy(mix, {
      get: (target, key) => (typeof target[key] === 'function' ? (...args) => { calls.push([key, args]); } : target[key]),
    });
    score(recorder, hz);
    calls.sort((a, b) => a[1][0] - b[1][0]);
    let next = 0;
    const scheduleUntil = (end) => {
      for (; next < calls.length && calls[next][1][0] < end; next++) mix[calls[next][0]](...calls[next][1]);
    };
    const STEP = 1;
    const LEAD = 0.1; // düğümler başlangıçlarından biraz önce kurulsun
    scheduleUntil(STEP);
    for (let s = STEP; s < duration; s += STEP) {
      ctx.suspend(s - LEAD).then(() => {
        scheduleUntil(s + STEP);
        ctx.resume();
      });
    }
    const buf = await ctx.startRendering();
    // tepe normalizasyonu: −1 dBFS
    let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    }
    if (peak > 0) {
      const k = 0.89 / peak;
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < d.length; i++) d[i] *= k;
      }
    }
    return buf;
  }

  // 16 bit PCM WAV
  function toWav(buf) {
    const ch = buf.numberOfChannels;
    const n = buf.length;
    const bytes = new Uint8Array(44 + n * ch * 2);
    const v = new DataView(bytes.buffer);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF');
    v.setUint32(4, 36 + n * ch * 2, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, ch, true);
    v.setUint32(24, buf.sampleRate, true);
    v.setUint32(28, buf.sampleRate * ch * 2, true);
    v.setUint16(32, ch * 2, true);
    v.setUint16(34, 16, true);
    str(36, 'data');
    v.setUint32(40, n * ch * 2, true);
    const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < ch; c++) {
        const s = Math.max(-1, Math.min(1, chans[c][i]));
        v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        o += 2;
      }
    }
    return bytes;
  }

  root.Synth = { render, toWav, hz, Mixer };
})(typeof window !== 'undefined' ? window : globalThis);
