/*
 * Kare-kare zamanlanabilen basit animasyon motoru.
 *
 * Videonun tamamı script.js içinde sahne → replik (beat) → görsel öğe olarak tanımlanır.
 * Her repliğin süresi ya tahmin edilir (kelime sayısı / konuşma hızı) ya da ses/manifest.js
 * içindeki gerçek ses süresinden alınır. Görseller repliğin içindeki oransal bir ana
 * bağlandığı için ses gelince her şey kendiliğinden yeniden hizalanır.
 */
'use strict';
const VIDEO = (() => {
  const W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg';
  const WPS = 1.95;          // tahmini konuşma hızı (kelime / sn), sakin öğretmen anlatımı
  const GAP = 0.6;           // her replikten sonra nefes payı (sn)
  const SCENE_IN = 0.7, SCENE_TAIL = 1.0;

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const eo = x => 1 - Math.pow(1 - clamp(x), 3);
  const eio = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const f3 = x => (Math.round(x * 1000) / 1000).toString();

  const stage = document.getElementById('stage');
  const manifest = window.AUDIO_MANIFEST || {};
  const params = new URLSearchParams(location.search);
  const scenes = [], subs = [];
  let cursor = 0, uid = 0;

  const words = t => t.trim().split(/\s+/).filter(Boolean).length;

  /* ---------------- formül mini dili ----------------
   *  x^2  → üs        ^(−1) → parantezli üs
   *  √(39) → karekök  [[pay|payda]] → kesir  [[.1|2]] → küçük kesir
   *  {a:...} renkli parça (a,b,g,x,y,r,m,w)   {a.k1:...} renk + .k-k1 anahtarı   {_.k1:...} renksiz anahtar
   */
  function M(s) {
    s = s.replace(/\^\(([^)]*)\)/g, '<sup>$1</sup>').replace(/\^([0-9a-z]+)/g, '<sup>$1</sup>');
    s = s.replace(/√\(([^()]*)\)/g, '<span class="sq"><span class="sqs">√</span><span class="sqv">$1</span></span>');
    let prev;
    do {
      prev = s;
      s = s.replace(/\[\[(\.?)([^\[\]|]*)\|([^\[\]]*)\]\]/g, (m, sm, a, b) =>
        `<span class="fr${sm ? ' sm' : ''}"><span class="fn">${a}</span><span class="fd">${b}</span></span>`);
      s = s.replace(/\{(\w)(?:\.(\w+))?:([^{}]*)\}/g, (m, c, k, body) =>
        `<span class="${c === '_' ? '' : 'c-' + c}${k ? ' k-' + k : ''}">${body}</span>`);
    } while (s !== prev);
    return s;
  }
  // Doküman için düz metin hâli
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '−': '⁻', '-': '⁻' };
  function plain(s) {
    s = s.replace(/\^\(([^)]*)\)/g, (m, a) => [...a].map(c => SUP[c] || c).join(''))
         .replace(/\^([0-9]+)/g, (m, a) => [...a].map(c => SUP[c] || c).join(''));
    let prev;
    do {
      prev = s;
      s = s.replace(/\{\w(?:\.\w+)?:([^{}]*)\}/g, '$1');
    } while (s !== prev);
    s = s.replace(/√\(([^()]*)\)/g, (m, a) => (/^\w+$/.test(a) ? '√' + a : '√(' + a + ')'));
    do {
      prev = s;
      s = s.replace(/\[\[\.?([^\[\]|]*)\|([^\[\]]*)\]\]/g, (m, a, b) => {
        const simple = x => /^[\w²√,]+$/.test(x.trim());
        const w = x => (simple(x) ? x.trim() : '(' + x.trim() + ')');
        return simple(a) && simple(b) ? w(a) + '/' + w(b) : w(a) + ' / ' + w(b);
      });
    } while (s !== prev);
    return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ---------------- altyazı parçalama ---------------- */
  function addSubs(b) {
    let parts = b.text.split(/(?<=[.!?…])\s+/).filter(Boolean);
    const out = [];
    for (const p of parts) {
      if (p.length <= 105) { out.push(p); continue; }
      const bits = p.split(/(?<=[,;:])\s+/);
      let cur = '';
      for (const x of bits) {
        if (cur && (cur + ' ' + x).length > 95) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x;
      }
      if (cur) out.push(cur);
    }
    // çok kısa parçaları bir öncekiyle birleştir
    const merged = [];
    for (const p of out) {
      const last = merged[merged.length - 1];
      if (last && (last.length < 28 || p.length < 18) && (last + ' ' + p).length <= 110) merged[merged.length - 1] = last + ' ' + p;
      else merged.push(p);
    }
    const total = merged.reduce((n, p) => n + p.length, 0);
    let t = b.start + 0.05;
    merged.forEach((p, i) => {
      const d = (b.speak * p.length) / total;
      subs.push({ t0: t, t1: i === merged.length - 1 ? b.start + b.speak + 0.35 : t + d, text: p, beat: b.id });
      t += d;
    });
  }

  /* ---------------- sahne kurucu ---------------- */
  class Scene {
    constructor(o) {
      Object.assign(this, o);
      this.items = []; this.fxs = []; this.beats = []; this.formulas = []; this.n = 0;
      this.layer = document.createElement('div');
      this.layer.className = 'scene';
      stage.insertBefore(this.layer, document.getElementById('sub'));
      this.start = cursor; cursor += SCENE_IN;
      this.cur = { start: cursor, speak: 0, dur: 0 };
      if (!o.noHeader) this.header({ after: -SCENE_IN });
    }
    /* --- zaman --- */
    say(text, o = {}) {
      const id = `${this.id}-${String(++this.n).padStart(2, '0')}`;
      const est = words(text) / WPS;
      const a = manifest[id];
      const speak = a != null ? a : est;
      const dur = Math.max(o.min || 0, speak + (o.gap ?? GAP) + (o.hold || 0));
      const b = { id, text, speak, dur, start: cursor, cue: o.cue || '', audio: a != null, est };
      cursor += dur; this.beats.push(b); this.cur = b; addSubs(b);
      return b;
    }
    wait(sec, o = {}) {
      const b = { id: null, text: '', speak: sec, dur: sec + (o.gap ?? 0.5), start: cursor, wait: true, cue: o.cue || '' };
      cursor += b.dur; this.beats.push(b); this.cur = b;
      return b;
    }
    T(o = {}) {
      if (typeof o === 'number') o = { at: o };
      const b = o.b || this.cur;
      if (o.end) return b.start + b.dur + (o.after || 0);
      return b.start + (o.at || 0) * b.speak + (o.after || 0);
    }
    close() { this.tEnd = cursor + SCENE_TAIL; cursor = this.tEnd; }

    /* --- öğeler --- */
    header(o) {
      return this.add(`<div class="hdr"><span class="chip">${this.label}</span><span class="tt">${this.title}</span></div>`,
        { x: 70, y: 44, ...o });
    }
    add(html, o = {}) {
      const el = document.createElement('div');
      el.className = 'it' + (o.w ? ' wrap' : '') + (o.cls ? ' ' + o.cls : '');
      el.innerHTML = html;
      el.style.left = o.x + 'px'; el.style.top = o.y + 'px';
      if (o.w) el.style.width = o.w + 'px';
      if (o.size) el.style.fontSize = o.size + 'px';
      if (o.align) el.style.textAlign = o.align;
      this.layer.appendChild(el);
      const b = o.b || this.cur;
      const it = {
        el, anim: o.anim || 'fade', tin: this.T(o),
        dur: o.dur ?? (o.durF != null ? o.durF * b.speak : o.anim === 'write' ? 1.1 : 0.6),
        tout: Infinity, odur: 0.45, ax: o.ax || 0, ay: o.ay || 0, dims: [], maxW: o.maxW, last: {}
      };
      el.style.transformOrigin = `${it.ax * 100}% ${it.ay * 100}%`;
      this.items.push(it);
      return it;
    }
    hide(it, o = {}) {
      if (Array.isArray(it)) { it.forEach(x => this.hide(x, o)); return it; }
      if (it.hideAll) { it.hideAll(this.T(o)); return it; }
      it.tout = this.T(o); if (o.dur) it.odur = o.dur;
      return it;
    }
    dim(it, o = {}, to = 0.42) { it.dims.push({ t: this.T(o), to }); }
    formula(m, o = {}) {
      this.formulas.push(plain(m));
      return this.add(`<div class="fm${o.res ? ' res' : ''}">${M(m)}</div>`, { anim: 'write', ...o });
    }
    stack(o) {
      const sc = this;
      const st = {
        x: o.x, y: o.y, gap: o.gap || 98, size: o.size || 56, maxW: o.maxW || 980, lines: [], cy: o.y,
        line(m, lo = {}) {
          const y = lo.y ?? st.cy;
          st.cy = y + (lo.gap ?? st.gap);
          if (lo.dim !== false) st.lines.forEach(l => { if (!l._dimmed) { sc.dim(l, lo); l._dimmed = true; } });
          const it = sc.formula(m, { ...lo, x: st.x, y, size: lo.size || st.size, maxW: st.maxW });
          st.lines.push(it);
          return it;
        },
        clear(lo = {}) { st.lines.forEach(l => sc.hide(l, lo)); st.lines = []; st.cy = st.y; }
      };
      return st;
    }
    tri(spec) { const t = new Tri(this, spec); this.items.push(t); return t; }
    hook(fn) { const h = { render: fn }; this.items.push(h); return h; }

    /* --- efektler (CSS değişkeni üzerinden) --- */
    fx(sel, o = {}, kind = 'hl') {
      const b = o.b || this.cur;
      const t0 = this.T(o);
      let t1;
      if (o.until) t1 = this.T(o.until);
      else if (o.to != null) t1 = this.T({ b, at: o.to });
      else t1 = kind === 'hl' ? b.start + b.dur - 0.15 : Infinity;
      const root = o.root ? (o.root.el || o.root) : null;
      this.fxs.push({ sel, root, kind, t0, t1, ramp: o.ramp || (kind === 'strike' ? 0.6 : 0.35) });
    }
    hl(sel, o) { this.fx(sel, o, 'hl'); }
    strike(sel, o) { this.fx(sel, o, 'strike'); }
    reveal(sel, o) { this.fx(sel, o, 'rv'); }
    fade(sel, o) { this.fx(sel, o, 'dm'); }
  }

  /* ---------------- üçgen ----------------
   * V köşesinde açı `ang` (derece); V→P1 uzunluğu p (yatay), V→P2 uzunluğu q.
   * Kenarlar: p (V-P1), q (V-P2), r (P1-P2, açının karşısı). Ölçekli çizilir.
   */
  const FX_VAR = { hl: '--hl', strike: '--st', rv: '--rv', dm: '--dm' };
  const FX_CLS = { hl: 'hlable', strike: 'strk', rv: 'rv', dm: 'dmable' };

  class Tri {
    constructor(sc, s) {
      this.sc = sc; this.s = s; this.id = 'tri' + (++uid);
      const t0 = sc.T(s);
      this.morphs = [];
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'tri'); svg.setAttribute('id', this.id);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.style.display = 'none';
      sc.layer.appendChild(svg);
      this.svg = svg;
      const mk = (tag, cls, txt) => {
        const e = document.createElementNS(NS, tag);
        if (cls) e.setAttribute('class', cls);
        if (txt != null) e.textContent = txt;
        svg.appendChild(e); return e;
      };
      const col = s.cols || { p: 'a', q: 'b', r: 'x' };
      const lbl = s.lbl || {};
      const nm = s.names || [];
      const hidden = new Set(s.hide || []);
      const P = {};
      const part = (key, el, tin, d = 0.6) => {
        P[key] = { el, iv: hidden.has(key) ? [] : [[tin, Infinity]], d, sw: [] };
      };
      if (s.road) {
        for (const k of ['p', 'q']) {
          part('re-' + k, mk('line', 'roadedge'), t0, 1.2);
          part('rd-' + k, mk('line', 'road'), t0, 1.2);
          part('rm-' + k, mk('line', 'roadmid'), t0 + 0.3, 1.2);
        }
      }
      const dd = s.drawDur ?? 0.75;
      part('side-p', mk('line', `side side-p s-${col.p}`), t0, dd);
      part('side-q', mk('line', `side side-q s-${col.q}`), t0 + dd * 0.8, dd);
      part('side-r', mk('line', `side side-r s-${col.r}${s.dashR ? ' dash' : ''}`), t0 + dd * 1.6, dd);
      const tl = t0 + dd * 2.4;
      part('arc-v', mk('path', 'arc arc-v'), tl, 0.6);
      part('arc-1', mk('path', 'arc arc-1'), tl, 0.6);
      part('arc-2', mk('path', 'arc arc-2'), tl, 0.6);
      part('sq', mk('polyline', 'sqr sq'), tl, 0.6);
      part('al', mk('text', 'al', s.angLbl ?? ''), tl + 0.2, 0.5);
      ['v', '1', '2'].forEach((k, i) => part('vx-' + k, mk('text', 'vx vx-' + k, nm[i] || ''), tl, 0.5));
      for (const k of ['p', 'q', 'r']) part('sl-' + k, mk('text', `sl sl-${k} f-${col[k]}`, lbl[k] ?? ''), tl + 0.15, 0.5);
      // diğer iki köşenin yayları yalnızca istenirse çizilir (sonradan show() ile de açılabilir)
      for (const k of ['1', '2']) if (!(s.arcs || []).includes(k)) P['arc-' + k].iv = [];
      this.P = P;
      if (s.road) this._cones = this.cones();
      // ölçek: kullanılacak tüm açılar için tek bir ölçek
      const angs = [s.ang, ...(s.angs || [])];
      let bb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      for (const a of angs) for (const pt of this.raw(a)) {
        bb.x0 = Math.min(bb.x0, pt[0]); bb.x1 = Math.max(bb.x1, pt[0]);
        bb.y0 = Math.min(bb.y0, pt[1]); bb.y1 = Math.max(bb.y1, pt[1]);
      }
      const m = s.margin ?? 90;
      this.k = s.scale || Math.min((s.w - 2 * m) / (bb.x1 - bb.x0), (s.h - 2 * m) / (bb.y1 - bb.y0));
      this.cx = s.x + s.w / 2; this.cy = s.y + s.h / 2;
      this.mx = (bb.x0 + bb.x1) / 2; this.my = (bb.y0 + bb.y1) / 2;
      this.tin = t0; this.tout = Infinity;
    }
    raw(a) {
      const s = this.s, r = (a * Math.PI) / 180, rot = ((s.rot || 0) * Math.PI) / 180;
      let pts = [[0, 0], [s.p, 0], [s.q * Math.cos(r), s.q * Math.sin(r)]];
      if (s.flip) pts = pts.map(([x, y]) => [-x, y]);
      return pts.map(([x, y]) => [x * Math.cos(rot) - y * Math.sin(rot), x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    angAt(t) {
      let a = this.s.ang;
      for (const m of this.morphs) {
        if (t >= m.t1) a = m.to;
        else if (t > m.t0) a = m.from + (m.to - m.from) * eio((t - m.t0) / (m.t1 - m.t0));
      }
      return a;
    }
    pts(t) {
      return this.raw(this.angAt(t)).map(([x, y]) => [this.cx + this.k * (x - this.mx), this.cy - this.k * (y - this.my)]);
    }
    /* --- zaman çizelgesi kontrolü --- */
    morph(to, o = {}, dur = 1.3) {
      const t0 = this.sc.T(o);
      const from = this.morphs.length ? this.morphs[this.morphs.length - 1].to : this.s.ang;
      this.morphs.push({ t0, t1: t0 + dur, from, to });
      return this;
    }
    show(keys, o = {}) {
      const t = this.sc.T(o);
      [].concat(keys).forEach(k => this.P[k].iv.push([t, Infinity]));
      return this;
    }
    hidePart(keys, o = {}) {
      const t = this.sc.T(o);
      [].concat(keys).forEach(k => { const iv = this.P[k].iv; if (iv.length) iv[iv.length - 1][1] = t; });
      return this;
    }
    set(key, text, o = {}) { this.P[key].sw.push({ t: this.sc.T(o), text }); return this; }
    hideAll(t) { this.tout = t; }
    sel(k) { return `#${this.id} .${k}`; }
    cones() {
      const g = [];
      for (let i = 0; i < 2; i++) {
        const e = document.createElementNS(NS, 'g');
        e.innerHTML = '<path d="M-20,18 L0,-30 L20,18 Z" style="fill:#ff8a3d;stroke:none"/><path d="M-12,-2 L12,-2 L9,-10 L-9,-10 Z" style="fill:#fff;stroke:none" opacity=".9"/><rect x="-26" y="16" width="52" height="8" rx="3" fill="#ff8a3d"/>';
        this.svg.appendChild(e); g.push(e);
      }
      return g;
    }
    /* --- çizim --- */
    vis(pt, t) {
      let a = 0, g = 0;
      for (const [t0, t1] of pt.iv) {
        const v = eo((t - t0) / pt.d) * (1 - eo((t - t1) / 0.4));
        if (v > a) a = v;
        if (t >= t0) g = clamp((t - t0) / pt.d);
      }
      return [a, g];
    }
    render(t) {
      const on = t >= this.tin - 0.01 && t < this.tout + 0.5;
      if (!on) { if (this._on !== false) { this.svg.style.display = 'none'; this._on = false; } return '·'; }
      if (this._on !== true) { this.svg.style.display = 'block'; this._on = true; }
      const gOut = 1 - eo((t - this.tout) / 0.45);
      this.svg.style.opacity = gOut;
      const [V, A, B] = this.pts(t);
      const ang = this.angAt(t);
      const C = [(V[0] + A[0] + B[0]) / 3, (V[1] + A[1] + B[1]) / 3];
      const sig = [f3(gOut), f3(ang)];
      const setLine = (el, a, b, g) => {
        el.setAttribute('x1', a[0]); el.setAttribute('y1', a[1]);
        el.setAttribute('x2', a[0] + (b[0] - a[0]) * eio(g)); el.setAttribute('y2', a[1] + (b[1] - a[1]) * eio(g));
      };
      const seg = { p: [V, A], q: [V, B], r: [A, B] };
      for (const k of ['p', 'q', 'r']) {
        const pt = this.P['side-' + k], [a, g] = this.vis(pt, t);
        pt.el.style.opacity = a; setLine(pt.el, seg[k][0], seg[k][1], g); sig.push(f3(a), f3(g));
        if (this.s.road && k !== 'r') for (const rk of ['re-', 'rd-', 'rm-']) {
          const rp = this.P[rk + k], [ra, rg] = this.vis(rp, t);
          rp.el.style.opacity = ra; setLine(rp.el, seg[k][0], seg[k][1], rg); sig.push(f3(ra), f3(rg));
        }
      }
      if (this._cones) {
        const [ca] = this.vis(this.P['rd-p'], t);
        [A, B].forEach((p, i) => { this._cones[i].setAttribute('transform', `translate(${p[0]},${p[1] - 8})`); this._cones[i].style.opacity = ca; });
      }
      // açı yayları
      const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [dx / L, dy / L]; };
      const arc = (O, u1, u2, R, g) => {
        const a1 = Math.atan2(u1[1], u1[0]);
        let da = Math.atan2(u2[1], u2[0]) - a1;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        const a2 = a1 + da * eio(g);
        const s = [O[0] + R * Math.cos(a1), O[1] + R * Math.sin(a1)], e = [O[0] + R * Math.cos(a2), O[1] + R * Math.sin(a2)];
        return `M${s[0]},${s[1]} A${R},${R} 0 0 ${da > 0 ? 1 : 0} ${e[0]},${e[1]}`;
      };
      const minSide = Math.min(Math.hypot(A[0] - V[0], A[1] - V[1]), Math.hypot(B[0] - V[0], B[1] - V[1]));
      const R = this.s.arcR || clamp(minSide * 0.2, 46, 78);
      const isRight = this.s.square !== false ? clamp(1 - Math.abs(ang - 90) / 2.5) : 0;
      const corners = { v: [V, A, B], 1: [A, B, V], 2: [B, V, A] };
      for (const k of ['v', '1', '2']) {
        const pt = this.P['arc-' + k], [a, g] = this.vis(pt, t);
        const [O, X, Y] = corners[k];
        pt.el.setAttribute('d', arc(O, unit(O, X), unit(O, Y), k === 'v' ? R : R * 0.8, g));
        pt.el.style.opacity = k === 'v' ? a * (1 - isRight) : a; sig.push(f3(a), f3(g));
      }
      { // dik açı karesi
        const pt = this.P.sq, [a] = this.vis(pt, t), u1 = unit(V, A), u2 = unit(V, B), z = 36;
        pt.el.setAttribute('points', [[V[0] + z * u1[0], V[1] + z * u1[1]], [V[0] + z * (u1[0] + u2[0]), V[1] + z * (u1[1] + u2[1])], [V[0] + z * u2[0], V[1] + z * u2[1]]].map(p => p.join(',')).join(' '));
        pt.el.style.opacity = a * isRight; sig.push(f3(a * isRight));
      }
      const txt = (key, pos) => {
        const pt = this.P[key]; let [a] = this.vis(pt, t);
        let text = pt.el._t0 ?? (pt.el._t0 = pt.el.textContent);
        for (const sw of pt.sw) {
          if (t >= sw.t) text = sw.text;
          const d = Math.abs(t - sw.t); if (d < 0.25) a *= d / 0.25;
        }
        if (pt.el.textContent !== text) pt.el.textContent = text;
        pt.el.setAttribute('x', pos[0]); pt.el.setAttribute('y', pos[1]); pt.el.style.opacity = a;
        sig.push(f3(a), text);
      };
      // köşe adları
      [['vx-v', V], ['vx-1', A], ['vx-2', B]].forEach(([k, p]) => {
        const u = unit(C, p); txt(k, [p[0] + u[0] * 40, p[1] + u[1] * 40]);
      });
      // kenar etiketleri: kenarın ortası, üçgenin dışına doğru
      for (const k of ['p', 'q', 'r']) {
        const [a, b] = seg[k], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let n = [-(b[1] - a[1]), b[0] - a[0]]; const L = Math.hypot(n[0], n[1]); n = [n[0] / L, n[1] / L];
        if ((mid[0] - C[0]) * n[0] + (mid[1] - C[1]) * n[1] < 0) n = [-n[0], -n[1]];
        const el = this.P['sl-' + k].el, tw = (el.textContent.length || 1) * 25;
        const off = 38 + Math.abs(n[0]) * tw * 0.5 + (this.s.road && k !== 'r' ? 34 : 0);
        txt('sl-' + k, [mid[0] + n[0] * off, mid[1] + n[1] * off]);
      }
      { // açı etiketi: açıortay üzerinde
        const u1 = unit(V, A), u2 = unit(V, B); let bs = [u1[0] + u2[0], u1[1] + u2[1]]; const L = Math.hypot(bs[0], bs[1]); bs = [bs[0] / L, bs[1] / L];
        const d = R + 22 + (this.s.alOff || 0) + this.P.al.el.textContent.length * 10;
        txt('al', [V[0] + bs[0] * d, V[1] + bs[1] * d]);
      }
      return sig.join(',');
    }
  }

  /* ---------------- DOM öğesi çizimi ---------------- */
  function renderDom(it, t) {
    const p = (t - it.tin) / Math.max(it.dur, 1e-3), q = (t - it.tout) / it.odur;
    const st = it.el.style, L = it.last;
    if (p <= 0 || q >= 1) { if (L.v !== 0) { st.visibility = 'hidden'; L.v = 0; } return '0'; }
    if (L.v !== 1) { st.visibility = 'visible'; L.v = 1; }
    const pe = clamp(p);
    let op = 1, ty = 0, sc = 1, clip = 'none';
    switch (it.anim) {
      case 'fade': op = eo(pe); ty = (1 - eo(pe)) * 18; break;
      case 'pop': op = eo(pe * 1.6); sc = 0.82 + 0.18 * back(pe); break;
      case 'write': op = clamp(pe * 8); if (pe < 1) clip = `inset(-40px calc(${((1 - pe) * 100).toFixed(2)}% - ${(pe * 40).toFixed(1)}px) -40px -40px)`; break;
      default: op = 1;
    }
    if (q > 0) op *= 1 - eo(q);
    for (const d of it.dims) { const k = eo((t - d.t) / 0.5); if (k > 0) op *= 1 - (1 - d.to) * k; }
    const tr = `translate(${-it.ax * 100}%, ${-it.ay * 100}%) translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(4)})`;
    const o3 = op.toFixed(3);
    if (L.op !== o3) { st.opacity = o3; L.op = o3; }
    if (L.tr !== tr) { st.transform = tr; L.tr = tr; }
    if (L.clip !== clip) { st.clipPath = clip; L.clip = clip; }
    return o3 + tr + clip;
  }

  function renderFx(sc, t) {
    const vals = new Map();
    for (const f of sc.fxs) {
      let v;
      if (f.kind === 'hl') v = Math.min(eo((t - f.t0) / f.ramp), 1 - eo((t - f.t1) / f.ramp));
      else v = eo((t - f.t0) / f.ramp) * (f.t1 === Infinity ? 1 : 1 - eo((t - f.t1) / f.ramp));
      v = clamp(v);
      for (const n of f.nodes) {
        let m = vals.get(n); if (!m) vals.set(n, (m = {}));
        const k = FX_VAR[f.kind]; m[k] = Math.max(m[k] || 0, v);
      }
    }
    const sig = [];
    for (const [n, m] of vals) for (const k in m) {
      const v = m[k].toFixed(3);
      if (n._fx?.[k] !== v) { n.style.setProperty(k, v); (n._fx ||= {})[k] = v; }
      sig.push(v);
    }
    return sig.join(',');
  }

  let subsOn = !params.has('nosubs');
  let subIdx = -2;
  const subEl = document.querySelector('#sub span');
  function renderSubs(t) {
    let idx = -1;
    if (subsOn) for (let i = 0; i < subs.length; i++) if (t >= subs[i].t0 && t < subs[i].t1) { idx = i; break; }
    if (idx !== subIdx) { subEl.textContent = idx >= 0 ? subs[idx].text : ''; subIdx = idx; }
    return 's' + idx;
  }

  function renderAt(t) {
    const sig = [];
    for (const sc of scenes) {
      const on = t >= sc.start && t < sc.tEnd;
      if (!on) { if (sc._on !== false) { sc.layer.style.display = 'none'; sc._on = false; } continue; }
      if (sc._on !== true) { sc.layer.style.display = 'block'; sc._on = true; }
      const a = Math.min(eo((t - sc.start) / 0.55), eo((sc.tEnd - t) / 0.55)).toFixed(3);
      if (sc._a !== a) { sc.layer.style.opacity = a; sc._a = a; }
      sig.push(sc.id + a);
      for (const it of sc.items) sig.push(it.render ? it.render(t, sc) : renderDom(it, t));
      sig.push(renderFx(sc, t));
    }
    sig.push(renderSubs(t));
    return sig.join('|');
  }

  /* ---------------- kurulum ---------------- */
  function scene(o, fn) {
    const sc = new Scene(o);
    scenes.push(sc);
    fn(sc);
    sc.close();
    return sc;
  }

  async function finalize() {
    await document.fonts.ready;
    await document.fonts.load('700 50px Inter');
    for (const sc of scenes) {
      sc.layer.style.display = 'block';
      for (const it of sc.items) {
        if (!it.el || !it.maxW) continue;
        const w = it.el.scrollWidth;
        if (w > it.maxW) it.el.style.fontSize = (parseFloat(getComputedStyle(it.el).fontSize) * it.maxW / w).toFixed(1) + 'px';
      }
      for (const f of sc.fxs) {
        f.nodes = [...(f.root || sc.layer).querySelectorAll(f.sel)];
        if (!f.nodes.length) console.warn('fx hedefi yok:', sc.id, f.sel);
        f.nodes.forEach(n => n.classList.add(FX_CLS[f.kind]));
      }
      sc.layer.style.display = 'none'; sc._on = false;
    }
    API.total = cursor;
    API.ready = true;
  }

  /* ---------------- önizleme oynatıcı ---------------- */
  function player() {
    const wrap = document.getElementById('wrap');
    const fit = () => { const s = Math.min(innerWidth / W, (innerHeight - 46) / H); wrap.style.transform = `scale(${s})`; };
    addEventListener('resize', fit); fit();
    let t = parseFloat(params.get('t') || '0'), playing = false, last = 0;
    const clips = {};
    let lastBeat = null;
    const allBeats = scenes.flatMap(s => s.beats);
    const beatAt = x => allBeats.find(b => x >= b.start && x < b.start + b.dur);
    const playAudio = () => {
      const b = beatAt(t);
      if (!b || !b.audio || b === lastBeat) return;
      lastBeat = b;
      Object.values(clips).forEach(a => a.pause());
      const src = window.AUDIO_FILES?.[b.id]; if (!src) return;
      const a = (clips[b.id] ||= new Audio('ses/' + src));
      const off = t - b.start; if (off < b.speak) { a.currentTime = Math.max(0, off); a.play().catch(() => {}); }
    };
    const fill = document.getElementById('fill'), clock = document.getElementById('clock'), btn = document.getElementById('play');
    const fmt = x => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
    const draw = () => { renderAt(t); fill.style.width = (100 * t / API.total) + '%'; clock.textContent = `${fmt(t)} / ${fmt(API.total)}`; };
    const seek = x => { t = clamp(x, 0, API.total); lastBeat = null; Object.values(clips).forEach(a => a.pause()); draw(); };
    const loop = now => {
      if (playing) { t += (now - last) / 1000; if (t >= API.total) { t = API.total; playing = false; btn.textContent = '▶'; } playAudio(); draw(); }
      last = now; requestAnimationFrame(loop);
    };
    const toggle = () => { playing = !playing; btn.textContent = playing ? '❚❚' : '▶'; if (!playing) Object.values(clips).forEach(a => a.pause()); lastBeat = null; };
    btn.onclick = toggle;
    document.getElementById('bar').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); seek(API.total * (e.clientX - r.left) / r.width); };
    addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      if (e.key === 'ArrowRight') seek(t + 5);
      if (e.key === 'ArrowLeft') seek(t - 5);
      if (e.key === ']') { const s = scenes.find(s => s.start > t + 0.1); if (s) seek(s.start); }
      if (e.key === '[') { const s = [...scenes].reverse().find(s => s.start < t - 1); seek(s ? s.start : 0); }
      if (e.key === 's' || e.key === 'S') { subsOn = !subsOn; subIdx = -2; draw(); }
    });
    requestAnimationFrame(n => { last = n; draw(); requestAnimationFrame(loop); });
  }

  function docs() {
    return {
      total: cursor,
      wps: WPS,
      scenes: scenes.map(s => ({
        id: s.id, label: s.label, title: s.title, target: s.target, start: s.start, end: s.tEnd,
        notes: s.notes || [], formulas: s.formulas,
        beats: s.beats.map(b => ({ id: b.id, start: b.start, dur: b.dur, speak: b.speak, est: b.est, text: b.text, cue: b.cue, wait: !!b.wait, audio: b.audio }))
      })),
      subs,
      checks: window.MATH_CHECKS || []
    };
  }

  const API = {
    M, plain, scene, renderAt, docs, total: 0, ready: false,
    boot() {
      const exp = params.has('export');
      if (exp) document.body.classList.add('export');
      if (!subsOn) document.body.classList.add('nosubs');
      finalize().then(() => { if (!exp) player(); });
    }
  };
  return API;
})();
