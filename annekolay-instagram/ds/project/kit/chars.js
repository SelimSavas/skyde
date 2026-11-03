// AnneKolay maskotları: Ada (hamile), Defne (yeni anne) ve bebeği Pamuk.
// Kâğıt kesik kolaj stili: her parça ayrı kâğıt katmanı (pürüzlü kenar + lif dokusu + gölge).
(function () {
  const C = {
    ink: "#3A2A20",
    adaSkin: "#E9BC97", adaSkinShade: "#D9A47E", adaHair: "#3E2B22", adaHairHi: "#5B4132",
    sage: "#8A9A86", sageDark: "#76866F", sageLight: "#DCE3D8", sageMid: "#A9B7A4",
    defneSkin: "#D69F7A", defneSkinShade: "#C48A66", defneHair: "#6B3A24", defneHairHi: "#8A5236",
    clay: "#C2785C", clayDark: "#A9624A", peach: "#F2D3C2",
    muslin: "#F7F1E6", babySkin: "#F2CDB0", gold: "#D4AF37", blush: "#EE9F86",
  };

  let uid = 0;
  function defs(id) {
    return `<defs>
      <filter id="cut-${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="11" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0.30  0 0 0 0 0.22  0 0 0 0 0.14  0.55 0 0 0 -0.27" result="fib"/>
        <feComposite in="fib" in2="rough" operator="in" result="fibIn"/>
        <feMerge result="tex"><feMergeNode in="rough"/><feMergeNode in="fibIn"/></feMerge>
        <feDropShadow dx="2.5" dy="4" stdDeviation="3.2" flood-color="#4A3524" flood-opacity="0.30"/>
      </filter>
      <filter id="line-${id}" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="1" seed="3" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>`;
  }
  const P = (id, d, fill, extra = "") => `<path d="${d}" fill="${fill}" filter="url(#cut-${id})" ${extra}/>`;
  const S = (id, d, stroke, w, extra = "") => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#cut-${id})" ${extra}/>`;
  const E = (id, cx, cy, rx, ry, fill, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" filter="url(#cut-${id})" ${extra}/>`;
  const L = (id, d, stroke, w = 4.5) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" filter="url(#line-${id})"/>`;

  function face(id, cx, cy, o = {}) {
    const ink = o.ink || C.ink, eyeY = cy + 6, gap = 32;
    let h = "";
    if (o.eyes === "open") {
      h += `<circle cx="${cx - gap}" cy="${eyeY}" r="6.5" fill="${ink}"/><circle cx="${cx + gap}" cy="${eyeY}" r="6.5" fill="${ink}"/>`;
      h += `<circle cx="${cx - gap + 2}" cy="${eyeY - 2}" r="2" fill="#fff"/><circle cx="${cx + gap + 2}" cy="${eyeY - 2}" r="2" fill="#fff"/>`;
    } else {
      h += L(id, `M${cx - gap - 11} ${eyeY - 2} Q${cx - gap} ${eyeY + 9} ${cx - gap + 11} ${eyeY - 2}`, ink);
      h += L(id, `M${cx + gap - 11} ${eyeY - 2} Q${cx + gap} ${eyeY + 9} ${cx + gap + 11} ${eyeY - 2}`, ink);
    }
    h += L(id, `M${cx - gap - 12} ${eyeY - 22} Q${cx - gap} ${eyeY - 29} ${cx - gap + 12} ${eyeY - 23}`, o.brow || ink, 3.5);
    h += L(id, `M${cx + gap - 12} ${eyeY - 23} Q${cx + gap} ${eyeY - 29} ${cx + gap + 12} ${eyeY - 22}`, o.brow || ink, 3.5);
    h += L(id, `M${cx - 1} ${eyeY + 8} Q${cx + 5} ${eyeY + 20} ${cx - 3} ${eyeY + 24}`, o.nose || C.adaSkinShade, 3.5);
    h += L(id, `M${cx - 13} ${cy + 46} Q${cx} ${cy + 57} ${cx + 13} ${cy + 46}`, o.mouth || "#A0503C", 4.5);
    h += `<ellipse cx="${cx - gap - 6}" cy="${cy + 34}" rx="15" ry="9" fill="${C.blush}" opacity="0.55"/>`;
    h += `<ellipse cx="${cx + gap + 6}" cy="${cy + 34}" rx="15" ry="9" fill="${C.blush}" opacity="0.55"/>`;
    return h;
  }

  function ada(o = {}) {
    const id = "a" + (++uid);
    let h = defs(id);
    // saç (arka, küt kesim)
    h += P(id, "M203 255 C198 150 258 138 300 138 C346 138 404 152 398 255 C396 305 396 335 384 352 C362 346 340 343 300 343 C262 343 238 346 216 352 C205 335 205 305 203 255 Z", C.adaHair);
    // boyun
    h += P(id, "M276 318 L276 368 Q300 380 324 368 L324 318 Z", C.adaSkinShade);
    // elbise gövde (sağa doğru karın)
    h += P(id, "M300 352 C248 352 214 362 199 386 C184 412 181 472 187 542 C191 622 187 722 184 800 L428 800 C448 768 492 730 500 650 C508 580 486 515 440 492 C418 480 406 456 406 422 C406 390 386 362 300 352 Z", C.sage);
    // karın ışığı (açık kâğıt katmanı)
    h += P(id, "M424 512 C472 536 492 590 486 652 C480 712 458 748 432 766 C416 700 412 600 424 512 Z", C.sageMid);
    // sol kol (sarkan)
    h += S(id, "M212 400 C190 440 182 510 186 575", C.sageDark, 44);
    h += E(id, 187, 606, 19, 24, C.adaSkin);
    // yaka
    h += P(id, "M300 362 C280 362 260 368 252 382 C262 404 292 402 300 374 Z", C.sageLight);
    h += P(id, "M300 362 C320 362 340 368 348 382 C338 404 308 402 300 374 Z", C.sageLight);
    // baş
    h += E(id, 300, 252, 79, 89, C.adaSkin);
    // ön saç (yana taranmış kâkül)
    h += P(id, "M221 256 C212 172 268 150 306 154 C352 158 392 186 383 252 C372 220 350 202 322 202 C302 228 262 232 238 218 C230 232 225 244 221 256 Z", C.adaHair);
    h += S(id, "M262 176 C286 166 318 166 344 178", C.adaHairHi, 7);
    h += face(id, 300, 250, { nose: C.adaSkinShade });
    // çiller
    h += [[256, 288], [264, 296], [250, 297], [344, 288], [336, 296], [350, 297]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#B07A5A" opacity="0.8"/>`).join("");
    // altın küpe
    h += `<circle cx="219" cy="322" r="7" fill="none" stroke="${C.gold}" stroke-width="3.5"/>`;
    // sağ kol: dirsek -> karın üstünde el
    h += S(id, "M386 398 C402 430 404 470 398 512", C.sageDark, 46);
    h += S(id, "M400 516 C418 548 440 566 462 574", C.adaSkin, 30);
    h += E(id, 470, 578, 30, 19, C.adaSkin, `transform="rotate(28 470 578)"`);
    if (o.heart !== false) h += `<path d="M452 690 c-10 -14 -30 -4 -20 12 l20 18 l20 -18 c10 -16 -10 -26 -20 -12 Z" fill="${C.peach}" filter="url(#cut-${id})"/>`;
    return `<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" class="char char-ada">${h}</svg>`;
  }

  function pamuk(id, cx, cy, s = 1, o = {}) {
    // kundaktaki bebek; cx,cy = başın merkezi
    let h = `<g transform="translate(${cx} ${cy}) scale(${s}) rotate(${o.rot || 0})">`;
    h += E(id, 6, 112, 64, 104, C.muslin, `transform="rotate(-14 6 112)"`);
    h += P(id, "M-40 70 C-10 58 30 60 58 74 L52 92 C26 80 -12 78 -42 90 Z", C.peach);
    h += P(id, "M-34 130 C-4 118 34 122 58 136 L52 152 C30 140 -6 136 -36 148 Z", C.peach);
    h += E(id, 0, 0, 44, 42, C.babySkin);
    h += P(id, "M-46 -4 C-46 -46 46 -46 46 -4 C30 -16 -30 -16 -46 -4 Z", C.sageMid);
    h += E(id, 0, -40, 11, 10, C.sageMid);
    h += L(id, "M-24 6 Q-17 12 -10 6", C.ink, 3.6) + L(id, "M10 6 Q17 12 24 6", C.ink, 3.6);
    h += L(id, "M-5 22 Q0 26 5 22", "#A0503C", 3.4);
    h += `<ellipse cx="-24" cy="18" rx="9" ry="6" fill="${C.blush}" opacity="0.55"/><ellipse cx="24" cy="18" rx="9" ry="6" fill="${C.blush}" opacity="0.55"/>`;
    return h + "</g>";
  }

  function defne(o = {}) {
    const id = "d" + (++uid);
    let h = defs(id);
    // topuz + kalem
    h += E(id, 300, 152, 48, 44, C.defneHair);
    h += S(id, "M246 112 L350 188", C.gold, 10);
    h += S(id, "M244 110 L254 117", "#E6A0A0", 10);
    h += L(id, "M278 140 Q300 124 322 146 Q306 168 286 156", C.defneHairHi, 5);
    // arka saç
    h += P(id, "M213 262 C206 168 262 158 292 158 C332 158 380 172 372 262 C370 300 362 330 350 340 L232 340 C220 326 214 300 213 262 Z", C.defneHair);
    // boyun
    h += P(id, "M268 318 L268 368 Q290 380 312 368 L312 318 Z", C.defneSkinShade);
    // kazak gövde
    h += P(id, "M290 352 C230 352 186 364 168 394 C150 430 150 520 158 600 C162 680 160 740 158 800 L432 800 C430 740 430 680 432 600 C440 520 434 430 414 394 C396 364 350 352 290 352 Z", C.clay);
    h += P(id, "M246 360 Q290 394 334 360 L342 374 Q290 414 238 374 Z", C.clayDark);
    // omuzda müslin bez (benekli)
    h += P(id, "M172 384 C198 370 232 372 248 388 L236 476 C218 486 190 484 168 470 Z", C.muslin);
    h += [[196, 404], [222, 412], [188, 436], [214 , 444], [200, 466], [228, 462]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${C.sageMid}"/>`).join("");
    // bebek Pamuk sağ omuzda
    h += pamuk(id, 398, 388, 0.95);
    // bebeği tutan kol + eller
    h += S(id, "M196 560 C268 610 350 600 412 548", C.clayDark, 56);
    h += E(id, 420, 545, 26, 20, C.defneSkin, `transform="rotate(-30 420 545)"`);
    h += E(id, 428, 452, 22, 30, C.defneSkin, `transform="rotate(12 428 452)"`);
    // baş
    h += E(id, 290, 252, 78, 88, C.defneSkin);
    // ön saç (ortadan ayrık)
    h += P(id, "M213 262 C206 176 258 156 292 160 C330 162 378 180 370 258 C360 222 334 200 296 204 C292 214 290 220 290 226 C288 214 284 206 280 204 C248 206 226 226 213 262 Z", C.defneHair);
    h += S(id, "M219 250 C205 292 210 322 226 340", C.defneHair, 9);
    h += S(id, "M360 250 C372 286 368 310 356 326", C.defneHair, 8);
    h += face(id, 290, 250, { nose: C.defneSkinShade });
    return `<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg" class="char char-defne">${h}</svg>`;
  }

  function pamukAlone() {
    const id = "p" + (++uid);
    return `<svg viewBox="-160 -110 320 360" xmlns="http://www.w3.org/2000/svg" class="char char-pamuk">${defs(id)}${pamuk(id, 0, 0, 1.25)}</svg>`;
  }

  // kolaj objeleri
  function leaf(o = {}) {
    const id = "l" + (++uid), col = o.color || C.sage;
    let h = defs(id) + S(id, "M20 280 C80 220 140 140 210 30", "#6F6040", 5);
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.12, x = 20 + (210 - 20) * t + (i % 2 ? 18 : -18), y = 280 - 250 * t;
      h += `<ellipse cx="${x}" cy="${y}" rx="30" ry="12" fill="${i % 3 === 0 ? C.sageMid : col}" filter="url(#cut-${id})" transform="rotate(${i % 2 ? -20 : -70} ${x} ${y})"/>`;
    }
    return `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" class="obj">${h}</svg>`;
  }
  function moon() {
    const id = "m" + (++uid);
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="obj">${defs(id)}${P(id, "M120 20 A80 80 0 1 0 180 140 A64 64 0 1 1 120 20 Z", "#E9D9A8")}
      ${[[40, 40, 6], [170, 50, 5], [150, 180, 4]].map(([x, y, r]) => P(id, `M${x} ${y - r * 2} L${x + r * 0.6} ${y - r * 0.6} L${x + r * 2} ${y} L${x + r * 0.6} ${y + r * 0.6} L${x} ${y + r * 2} L${x - r * 0.6} ${y + r * 0.6} L${x - r * 2} ${y} L${x - r * 0.6} ${y - r * 0.6} Z`, C.gold)).join("")}</svg>`;
  }
  function cup() {
    const id = "c" + (++uid);
    return `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" class="obj">${defs(id)}
      ${S(id, "M150 90 C190 90 190 140 150 140", C.clayDark, 14)}
      ${P(id, "M40 70 L160 70 L150 170 C148 182 138 188 126 188 L74 188 C62 188 52 182 50 170 Z", C.clay)}
      ${P(id, "M48 70 L152 70 L150 86 L50 86 Z", C.peach)}
      ${S(id, "M80 50 C70 34 92 24 82 8", C.sageLight, 7)}${S(id, "M112 50 C102 34 124 24 114 8", C.sageLight, 7)}</svg>`;
  }
  function bag() {
    const id = "b" + (++uid);
    return `<svg viewBox="0 0 260 240" xmlns="http://www.w3.org/2000/svg" class="obj">${defs(id)}
      ${S(id, "M90 70 C90 20 170 20 170 70", "#6F6040", 12)}
      ${P(id, "M30 70 L230 70 L220 220 L40 220 Z", C.sage)}
      ${P(id, "M30 70 L230 70 L226 110 L34 110 Z", C.sageDark)}
      ${P(id, "M110 130 L150 130 L150 160 L110 160 Z", C.sageLight)}</svg>`;
  }

  window.AK = { C, ada, defne, pamukAlone, leaf, moon, cup, bag };
})();
