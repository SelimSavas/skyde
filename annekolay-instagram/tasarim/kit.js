// Şablon yardımcıları: yırtık kâğıt, damga, ok çizimi
(function () {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // sides: "trbl" içinden yırtık kenarlar; a: kenar derinliği (%), n: diş sayısı
  function torn(seed, sides = "trbl", a = 2.2, n = 34) {
    const r = rng(seed), pts = [];
    const j = () => r() * a;
    const edge = (on, from, to, fn) => {
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push(fn(t, on ? j() : 0));
      }
    };
    edge(sides.includes("t"), 0, 0, (t, d) => [t * 100, d]);
    edge(sides.includes("r"), 0, 0, (t, d) => [100 - d, t * 100]);
    edge(sides.includes("b"), 0, 0, (t, d) => [100 - t * 100, 100 - d]);
    edge(sides.includes("l"), 0, 0, (t, d) => [d, 100 - t * 100]);
    return `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;
  }
  function tornCircle(seed, a = 2.5, n = 90) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < n; i++) { const th = i / n * Math.PI * 2, rr = 50 - r() * a; pts.push(`${(50 + rr * Math.cos(th)).toFixed(2)}% ${(50 + rr * Math.sin(th)).toFixed(2)}%`); }
    return `polygon(${pts.join(",")})`;
  }
  function stamp(color = "#4F5E4B", text = "UZMAN KONTROLLÜ · ANNEKOLAY · ") {
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs>
      <path id="sc${color.slice(1)}" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/>
      <filter id="sr${color.slice(1)}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6"/><feComposite in="SourceGraphic" operator="in"/></filter></defs>
      <g filter="url(#sr${color.slice(1)})" fill="none" stroke="${color}">
        <circle cx="100" cy="100" r="95" stroke-width="5"/><circle cx="100" cy="100" r="54" stroke-width="3"/>
        <text font-family="Poppins" font-weight="600" font-size="17.5" letter-spacing="3.2" fill="${color}" stroke="none"><textPath href="#sc${color.slice(1)}">${text}</textPath></text>
        <path d="M78 100 L94 116 L124 84" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      </g></svg>`;
  }
  function arrow(color = "#5A4426", flip = false) {
    return `<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" style="${flip ? "transform:scaleX(-1)" : ""}">
      <path d="M10 30 C70 0 150 20 190 100" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160 92 L192 104 L196 70" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function heart(color = "#C2785C") {
    return `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><path d="M50 84 C20 60 4 44 4 26 C4 12 16 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C84 4 96 12 96 26 C96 44 80 60 50 84 Z" fill="${color}"/></svg>`;
  }
  window.KIT = { torn, tornCircle, stamp, arrow, heart };
})();
