// Shared animation toolkit for the Skyde reels. Every reel defines window.render(t) (t in seconds)
// and builds on these helpers so the series keeps one visual language.

let __seed = 7;
const rnd = () => (__seed = (__seed * 16807) % 2147483647) / 2147483647;
const seedRnd = s => { __seed = s; };
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P01 = (t, a, b) => clamp((t - a) / (b - a));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eBack = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const pad = n => String(n).padStart(2, '0');
const pulseAt = (t, at, w = .15) => Math.max(0, 1 - Math.abs((t - at) / w));

function initIcons(root = document) {
  root.querySelectorAll('[data-ic]').forEach(el => {
    if (el.dataset.icDone) return;
    const [n, s, c, w] = el.dataset.ic.split(':');
    el.insertAdjacentHTML('afterbegin', svg(n, +s, c, w ? +w : 2));
    el.dataset.icDone = '1';
  });
}

// ---------- sky: clouds, sparkles, rain on the stage ----------
function makeCloud(parent, o, dark) {
  const c = document.createElement('div'); c.className = 'cloud';
  let h = '';
  for (let i = 0; i < 7; i++) {
    const w = 180 + rnd() * 220, x = i * 70 + rnd() * 40, y = 60 - Math.sin(i / 6 * Math.PI) * 90 + rnd() * 40;
    h += `<i style="left:${x}px;top:${y}px;width:${w}px;height:${w * .8}px${dark ? ';background:radial-gradient(circle at 50% 40%,#5d6f86 0%,rgba(80,98,122,.9) 45%,rgba(80,98,122,0) 72%)' : ''}"></i>`;
  }
  c.innerHTML = h; c.style.opacity = o; parent.appendChild(c); return c;
}
const Sky = {
  clouds: [], sparks: [], drops: [],
  init({ clouds = true, sparks = true, drops = 0 } = {}) {
    const host = $('sky');
    if (clouds) {
      this.clouds = [
        { x: -180, y: 1450, s: 1.25, sp: 9, o: .95 }, { x: 640, y: 1560, s: 1.4, sp: -7, o: .95 },
        { x: 720, y: 470, s: .7, sp: -12, o: .5 }, { x: -120, y: 560, s: .6, sp: 14, o: .45 },
        { x: 120, y: 1750, s: 1.6, sp: 6, o: 1 }, { x: 760, y: 100, s: .55, sp: -10, o: .45 },
      ].map(d => ({ el: makeCloud(host, d.o), ...d }));
    }
    if (sparks) {
      this.sparks = Array.from({ length: 22 }, () => {
        const s = document.createElement('div'); s.className = 'spark'; host.appendChild(s);
        return { el: s, x: rnd() * 1080, y: rnd() * 1920, ph: rnd() * 6.28, sc: .4 + rnd() * .8, sp: .6 + rnd() * 1.2 };
      });
    }
    this.drops = Array.from({ length: drops }, () => {
      const d = document.createElement('div'); d.className = 'drop'; $('rainHost').appendChild(d);
      return { el: d, x: rnd() * 1300 - 100, ph: rnd(), sp: 1.2 + rnd() * .7 };
    });
  },
  update(t, { glow = 1, sparkle = 1, rain = 0, cloudOpacity = 1 } = {}) {
    const g = $('sunGlow');
    if (g) { g.style.opacity = glow; g.style.transform = `scale(${1 + Math.sin(t * .8) * .04})`; }
    this.clouds.forEach(c => {
      c.el.style.opacity = c.o * cloudOpacity;
      c.el.style.transform = `translate(${c.x + t * c.sp}px, ${c.y + Math.sin(t * .5 + c.x) * 6}px) scale(${c.s})`;
    });
    this.sparks.forEach(s => {
      const o = .25 + .75 * Math.max(0, Math.sin(t * s.sp * 2 + s.ph));
      s.el.style.opacity = o * .8 * sparkle;
      s.el.style.transform = `translate(${s.x}px, ${s.y - t * 12 * s.sc}px) scale(${s.sc * (.6 + o * .5)})`;
    });
    this.drops.forEach(d => {
      const y = ((t * d.sp + d.ph) % 1) * 2100 - 120;
      d.el.style.opacity = rain * .8;
      d.el.style.transform = `translate(${d.x - y * .2}px, ${y}px) rotate(11deg)`;
    });
  },
};

// ---------- captions ----------
const Caps = {
  list: [],
  add(id, lines, sub, tin, tout, subAt) {
    const el = $(id), words = [], subs = [];
    lines.forEach(line => {
      const ln = document.createElement('span'); ln.className = 'line';
      line.split(' ').forEach(w => {
        const s = document.createElement('span'); s.className = 'w';
        if (w.startsWith('*')) { s.classList.add('hl'); w = w.slice(1); }
        if (w.endsWith('*')) w = w.slice(0, -1);
        s.textContent = w; ln.appendChild(s); words.push(s);
      });
      el.appendChild(ln);
    });
    if (sub) { const s = document.createElement('span'); s.className = 'sub w'; s.textContent = sub; el.appendChild(s); subs.push(s); }
    this.list.push({ words, subs, tin, tout, subAt });
  },
  update(t) {
    this.list.forEach(c => {
      const out = eIn(P01(t, c.tout, c.tout + .35));
      const anim = (w, a) => {
        const k = eOut(P01(t, a, a + .45));
        w.style.opacity = k * (1 - out);
        w.style.transform = `translateY(${(1 - k) * 50 - out * 40}px) scale(${.92 + .08 * k})`;
        w.style.filter = `blur(${(1 - k) * 10 + out * 8}px)`;
      };
      c.words.forEach((w, i) => anim(w, c.tin + i * .08));
      c.subs.forEach(w => anim(w, c.subAt ?? (c.tin + c.words.length * .08)));
    });
  },
};

// ---------- elements that slide in from the right and out to the left ----------
function slideCard(el, t, tin, tout, { from = 1100 } = {}) {
  const k = P01(t, tin, tin + .55), out = eIn(P01(t, tout, tout + .4));
  el.style.opacity = (k > 0 ? Math.min(1, k * 2) : 0) * (1 - out);
  el.style.transform = `translateX(${lerp(from, 0, eBack(k)) - out * 1100}px)`;
}
function popIn(el, t, tin, tout, { base = 'translateX(-50%)', dur = .45 } = {}) {
  const k = P01(t, tin, tin + dur), out = tout ? eIn(P01(t, tout, tout + .35)) : 0;
  el.style.opacity = (k > 0 ? Math.min(1, k * 2.5) : 0) * (1 - out);
  el.style.transform = `${base} scale(${(k > 0 ? eBack(k) : 0) * (1 - out * .2)})`;
}

// ---------- phone ----------
// opts: enter [t0,t1], exit [t0,t1], zoom [t0,t1,scale], vib [t], shake [t]
function phoneUpdate(el, t, { enter, exit, zoom, vib = [], shake = [], lift = 0 } = {}) {
  const pIn = enter ? P01(t, enter[0], enter[1]) : 1;
  const pOut = exit ? eIO(P01(t, exit[0], exit[1])) : 0;
  const z = zoom ? eIO(P01(t, zoom[0], zoom[1])) * (1 - pOut) : 0;
  let rz = enter ? lerp(10, 0, eOut(pIn)) : 0;
  vib.forEach(v => { if (t > v && t < v + .5) rz += Math.sin((t - v) * 90) * 1.6 * (1 - P01(t, v, v + .5)); });
  shake.forEach(v => { if (t > v && t < v + .45) rz += Math.sin((t - v) * 80) * 6 * (1 - P01(t, v, v + .45)); });
  const ty = lerp(1500, 0, enter ? eBack(pIn) : 1) + Math.sin(t * 1.3) * 8 - pOut * 80 + z * 10 + lift;
  el.style.opacity = (pIn > 0 ? 1 : 0) * (1 - pOut);
  el.style.filter = `blur(${pOut * 14}px)`;
  el.style.transform = `perspective(2600px) translateY(${ty}px) rotateX(${4 * (1 - z)}deg) rotateY(${Math.sin(t * .9) * 5 * (1 - z)}deg) rotateZ(${rz}deg) scale(${lerp(1, zoom ? zoom[2] : 1, z) * lerp(1, .78, pOut)})`;
}
function notifUpdate(el, t, tin, tout, glowAt) {
  const k = P01(t, tin, tin + .55), out = tout ? P01(t, tout - .2, tout + .2) : 0;
  el.style.opacity = (k > 0 ? 1 : 0) * (1 - out);
  el.style.transform = `translateY(${lerp(-340, 0, eBack(k))}px)`;
  const g = glowAt && t > glowAt ? 4 * eOut(P01(t, glowAt, glowAt + .4)) * (1 - P01(t, glowAt + 1.6, glowAt + 2)) : 0;
  el.style.boxShadow = `0 24px 60px rgba(0,30,80,.3), 0 0 0 ${g}px rgba(255,226,122,.95)`;
}
function tapUpdate(el, t, taps) {
  let shown = false;
  for (const tp of taps) {
    const d = t - tp.t;
    if (d > -.25 && d < .55) {
      shown = true; el.style.left = tp.x + 'px'; el.style.top = tp.y + 'px';
      el.classList.toggle('light', !!tp.light);
      if (d < 0) { const k = eOut(P01(d, -.25, 0)); el.style.opacity = k * .9; el.style.transform = `scale(${lerp(1.3, .8, k)})`; }
      else { const k = eOut(P01(d, 0, .55)); el.style.opacity = .9 * (1 - k); el.style.transform = `scale(${lerp(.8, 1.8, k)})`; }
    }
  }
  if (!shown) el.style.opacity = 0;
}

// ---------- Skyde home screen, themed ----------
const THEMES = {
  sun: { bg: 'linear-gradient(170deg,#FFAE1A 0%,#FFBB24 38%,#D9C23C 72%,#7CC36A 100%)', fg: '#2B2410', sub: '#3F7F2A',
    glass: 'rgba(255,255,255,.24)', border: 'rgba(255,255,255,.45)', icon: 'sun', iconC: '#C2410C', calBox: '#F57C00', calC: '#2B2410', accent: '#F57C00' },
  sky: { bg: 'linear-gradient(170deg,#3FB0F7 0%,#5AA9F8 42%,#4DB8F2 70%,#25CFEF 100%)', fg: '#ffffff', sub: 'rgba(255,255,255,.8)',
    glass: 'rgba(255,255,255,.2)', border: 'rgba(255,255,255,.38)', icon: 'sunsm', iconC: '#FFF4D6', calBox: 'rgba(255,255,255,.35)', calC: '#0f2a4a', accent: 'rgba(80,200,250,.95)' },
  rain: { bg: 'linear-gradient(170deg,#5C7FA6 0%,#6E89B3 45%,#5A93BC 75%,#4AA7C9 100%)', fg: '#ffffff', sub: 'rgba(255,255,255,.82)',
    glass: 'rgba(255,255,255,.18)', border: 'rgba(255,255,255,.38)', icon: 'rainc', iconC: '#E9F4FF', calBox: 'rgba(255,255,255,.35)', calC: '#0f2a4a', accent: 'rgba(120,210,255,.95)' },
  cold: { bg: 'linear-gradient(170deg,#6E8FB8 0%,#86A4C9 45%,#9DB9D8 75%,#B7CFE6 100%)', fg: '#ffffff', sub: 'rgba(255,255,255,.85)',
    glass: 'rgba(255,255,255,.2)', border: 'rgba(255,255,255,.4)', icon: 'wind', iconC: '#F2F7FF', calBox: 'rgba(255,255,255,.35)', calC: '#0f2a4a', accent: 'rgba(200,230,255,.95)' },
  night: { bg: 'linear-gradient(170deg,#1E2A55 0%,#2A3A6E 45%,#33468A 75%,#3E56A0 100%)', fg: '#ffffff', sub: 'rgba(255,255,255,.75)',
    glass: 'rgba(255,255,255,.12)', border: 'rgba(255,255,255,.25)', icon: 'moon', iconC: '#E9F0FF', calBox: 'rgba(255,255,255,.25)', calC: '#0f1a3a', accent: 'rgba(160,190,255,.9)' },
  heat: { bg: 'linear-gradient(170deg,#FF8A3D 0%,#FF9F3D 40%,#FFB547 72%,#FFC95E 100%)', fg: '#3A1A05', sub: '#7A2E0B',
    glass: 'rgba(255,255,255,.24)', border: 'rgba(255,255,255,.45)', icon: 'sun', iconC: '#B91C1C', calBox: '#E2550F', calC: '#3A1A05', accent: '#C2410C' },
};
// copy: { clock, title, sub, sumTitle, sum, clockId }
function homeHTML(themeName, copy) {
  const th = THEMES[themeName];
  const g = (l, tp, w, h, r, extra = '') => `<div class="glass" style="left:${l}px;top:${tp}px;width:${w}px;height:${h}px;border-radius:${r};background:${th.glass};border:2px solid ${th.border};${extra}"></div>`;
  const ic = (n, l, tp, s, c, w = 2, id = '') => `<div class="abs" ${id ? `id="${id}"` : ''} style="left:${l}px;top:${tp}px">${svg(n, s, c, w)}</div>`;
  const txt = (l, tp, s, wt = 500, extra = '') => `<div class="pill-txt" style="left:${l}px;top:${tp}px;color:${th.fg};font-weight:${wt};${extra}">${s}</div>`;
  const tab = copy.tab ?? 0;
  const tabX = [52, 226, 404][tab];
  return `<div class="layer" style="background:${th.bg}"></div>
  <div class="status" style="color:${th.fg}"><span class="abs" style="left:0" ${copy.clockId ? `id="${copy.clockId}"` : ''}>${copy.clock}</span></div>
  ${g(40, 116, 288, 80, '40px')}${ic('pin', 70, 134, 44, th.fg)}${txt(128, 136, 'My location')}${ic('chev', 290, 146, 28, th.fg)}
  ${g(408, 116, 80, 80, '50%')}${ic('bell', 428, 136, 40, th.fg)}${g(504, 116, 80, 80, '50%')}${ic('msg', 524, 136, 40, th.fg)}${g(600, 116, 80, 80, '50%')}${ic('gear', 620, 136, 40, th.fg)}
  ${g(40, 216, 543, 80, '40px')}<div class="abs" style="left:${tabX}px;top:228px;width:172px;height:56px;border-radius:28px;background:rgba(255,255,255,.32)"></div>
  ${txt(88, 236, 'Today', tab === 0 ? 600 : 400)}${txt(262, 236, 'Tomorrow', tab === 1 ? 600 : 400)}${txt(440, 236, 'Weekly', tab === 2 ? 600 : 400)}
  ${g(600, 216, 80, 80, '26px', copy.volId ? `` : '')}<div class="abs" ${copy.volId ? `id="${copy.volId}"` : ''} style="left:600px;top:216px;width:80px;height:80px;border-radius:26px"></div>${ic('vol', 620, 236, 40, th.fg)}
  ${g(40, 316, 640, 80, '40px')}
  <div class="abs" style="left:66px;top:326px;width:60px;height:60px;border-radius:16px;background:${th.calBox};display:flex;align-items:center;justify-content:center">${svg('cal', 36, th.calC)}</div>
  ${txt(146, 336, copy.planLabel ?? 'Plan Today', 600, 'letter-spacing:.5px')}
  ${g(182, 436, 356, 356, '72px')}
  ${ic(copy.icon ?? th.icon, 270, 524, 180, th.iconC, 2.2, copy.heroId ?? '')}
  ${g(40, 832, 640, 368, '56px')}
  <div class="abs" style="left:296px;top:860px;width:128px;height:8px;border-radius:4px;background:${th.accent}"></div>
  <div class="abs" ${copy.msgId ? `id="${copy.msgId}"` : ''} style="left:70px;top:900px;width:580px;text-align:center">
    <div style="font-size:40px;font-weight:600;line-height:58px;color:${th.fg}">${copy.title}</div>
    <div style="margin-top:20px;font-size:30px;line-height:42px;color:${th.sub}">${copy.sub}</div></div>
  ${g(40, 1232, 640, 420, '56px')}
  <div class="abs" style="left:88px;top:1302px;width:20px;height:20px;border-radius:50%;background:${th.accent}"></div>
  <div class="abs" style="left:128px;top:1286px;font-size:36px;font-weight:500;color:${th.fg}">${copy.sumTitle ?? "Today's summary"}</div>
  <div class="abs" style="left:90px;top:1370px;width:540px;font-size:31px;line-height:50px;color:${th.fg}">${copy.sum}</div>`;
}

// ---------- end card ----------
function endUpdate(t, END) {
  const e1 = P01(t, END, END + .7), e2 = P01(t, END + .3, END + .9), e3 = P01(t, END + .9, END + 1.5), e4 = P01(t, END + 1.7, END + 2.3), e5 = P01(t, END + 2.4, END + 2.9);
  $('endGlow').style.opacity = eOut(e1) * (.85 + .15 * Math.sin(t * 2));
  $('endGlow').style.transform = `scale(${lerp(.6, 1, eOut(e1))})`;
  $('endIcon').style.opacity = Math.min(1, e1 * 3);
  $('endIcon').style.transform = `translateY(${Math.sin(t * 1.6) * 6 * e1}px) scale(${e1 > 0 ? eBack(e1) : 0}) rotate(${lerp(-12, 0, eOut(e1))}deg)`;
  $('endWord').style.opacity = eOut(e2); $('endWord').style.transform = `translateY(${(1 - eOut(e2)) * 60}px)`;
  $('endWord').style.filter = `blur(${(1 - e2) * 10}px)`;
  $('endTag').style.opacity = eOut(e3); $('endTag').style.transform = `translateY(${(1 - eOut(e3)) * 40}px)`;
  const pulse = 1 + .035 * Math.max(0, Math.sin((t - END - 2.5) * 5)) * (t > END + 2.5 ? 1 : 0);
  $('endCta').style.opacity = eOut(e4);
  $('endCta').style.transform = `translateX(-50%) translateY(${(1 - eOut(e4)) * 40}px) scale(${(e4 > 0 ? eBack(e4) : 0) * pulse})`;
  $('endHandle').style.opacity = eOut(e5); $('endHandle').style.transform = `translateX(-50%) translateY(${(1 - eOut(e5)) * 30}px)`;
}
const END_HTML = (tag, cta) => `<div id="end"><div id="endGlow"></div><div id="endIcon"><img src="../shared/icon.png"></div>
  <div id="endWord">Skyde</div><div id="endTag">${tag}</div><div id="endCta">${cta}</div><div id="endHandle">@skyde.app</div></div>`;
