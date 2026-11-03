// Önizleme kurulumu: karakterleri, yırtık kenarları ve baş kırpmalarını yerleştirir, tuvali karta sığdırır.
(function () {

document.querySelectorAll("[data-torn]").forEach(el => { const [s, sides, a] = el.dataset.torn.split(","); el.style.clipPath = KIT.torn(+s, sides, +a); });
document.querySelectorAll("[data-tornc]").forEach(el => { el.style.clipPath = KIT.tornCircle(+el.dataset.tornc); });
document.querySelectorAll("[data-char]").forEach(el => {
  const [k, arg] = el.dataset.char.split(":");
  const m = { ada: () => AK.ada({ heart: arg !== "noheart" }), defne: () => AK.defne(), pamuk: () => AK.pamukAlone(), leaf: () => AK.leaf(), moon: () => AK.moon(), cup: () => AK.cup(), bag: () => AK.bag(),
    stamp: () => KIT.stamp(arg ? "#" + arg.replace("#", "") : undefined), arrow: () => KIT.arrow(arg || undefined), heart: () => KIT.heart(arg || undefined) };
  el.insertAdjacentHTML("beforeend", m[k]());
  const svg = el.querySelector("svg:last-child"); svg.style.width = "100%"; svg.style.height = "auto"; svg.style.display = "block";
  if (el.classList.contains("ph")) { svg.style.position = "absolute"; svg.style.left = "50%"; svg.style.bottom = "-6%"; svg.style.width = arg === "big" ? "80%" : "100%"; svg.style.transform = "translateX(-50%)"; if (arg === "big") svg.style.bottom = "8%"; }
});
// baş kırpma: karakterin yüzünü kartın/çemberin ortasına yerleştirir
document.querySelectorAll("[data-head]").forEach(el => {
  const [who, mode] = el.dataset.head.split(":");
  el.insertAdjacentHTML("beforeend", who === "ada" ? AK.ada({ heart: false }) : AK.defne());
  const svg = el.querySelector("svg:last-child");
  const W = el.clientWidth, H = el.clientHeight;
  const sw = mode === "hl" ? W * 1.55 : Math.min(W, H) * 1.35;
  const sc = sw / 600, hx = (who === "ada" ? 300 : 290) * sc, hy = 250 * sc;
  svg.style.width = sw + "px"; svg.style.height = (sw * 800 / 600) + "px";
  svg.style.left = (W / 2 - hx) + "px";
  svg.style.top = (H * (mode === "hl" ? 0.5 : 0.45) - hy + (mode === "hl" ? 20 : 30)) + "px";
});

  function fit() {
    document.querySelectorAll(".ak-stage").forEach(st => {
      const el = st.firstElementChild, W = el.offsetWidth, H = el.offsetHeight;
      const maxH = +(st.dataset.maxh || 600), s = Math.min(st.clientWidth / W, maxH / H, 1);
      el.style.position = "absolute"; el.style.top = "0"; el.style.transformOrigin = "0 0";
      el.style.transform = `scale(${s})`; el.style.left = ((st.clientWidth - W * s) / 2) + "px";
      st.style.height = (H * s) + "px";
    });
  }
  fit(); addEventListener("resize", fit);
  if (document.fonts) document.fonts.ready.then(fit);
})();
