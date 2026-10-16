/*
 * Oynatıcı: window.FILM'i (Engine.film ile tanımlanmış) tuvale çizer ve sesini çalar.
 *
 * İki kip vardır:
 *  - Canlı: tarayıcıda açınca oynat/duraklat, sarma ve tam ekran.
 *  - Kayıt (?kayit): arayüz gizlenir; render.mjs kareleri ve sesi window.__* işlevleriyle çeker.
 */
(function () {
  'use strict';

  const film = window.FILM;
  const canvas = document.getElementById('film');
  // Film kendi boyutunu verebilir (ör. dikey kısa video 1080×1920); vermezse 1920×1080
  const W = film.width ?? Engine.W;
  const H = film.height ?? Engine.H;
  canvas.width = W;
  canvas.height = H;
  if (W !== Engine.W || H !== Engine.H) {
    canvas.parentElement.style.aspectRatio = `${W} / ${H}`;
    canvas.parentElement.style.width = `min(100%, calc((100vh - 96px) * ${W} / ${H}))`;
  }
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(location.search);

  if (params.has('kayit')) {
    document.body.classList.add('recording');
    let wav = null;
    const voice = film.narration ? (film.narration.voice ? 'ok' : film.narration.stale ? 'stale' : 'none') : 'none';
    window.__info = () => ({ title: film.title, duration: film.duration, width: W, height: H, voice });
    window.__frame = (t, type = 'image/png', quality = 0.95) => {
      film.draw(ctx, t);
      return canvas.toDataURL(type, quality);
    };
    // Sesi bir kez sentezler; kaç parça halinde okunacağını döndürür.
    window.__audio = async (chunk) => {
      // ?anlatimsiz: seslendirme sonradan (dub.mjs) eklenecek; miks yalnızca efekt ve müzik
      wav = Synth.toWav(await Synth.render(film.score, film.duration, 48000, params.has('anlatimsiz') ? null : film.voice));
      return Math.ceil(wav.length / chunk);
    };
    window.__audioChunk = (i, chunk) => {
      const part = wav.subarray(i * chunk, (i + 1) * chunk);
      let bin = '';
      for (let k = 0; k < part.length; k += 0x8000) bin += String.fromCharCode.apply(null, part.subarray(k, k + 0x8000));
      return btoa(bin);
    };
    film.draw(ctx, 0);
    return;
  }

  const $ = (id) => document.getElementById(id);
  const ui = { play: $('play'), big: $('bigPlay'), seek: $('seek'), time: $('time'), scene: $('scene'), status: $('status'), fs: $('fs') };
  ui.seek.max = film.duration;
  document.title = film.title;

  let buffer = null;
  let ac = null;
  let src = null;
  let playing = false;
  let offset = 0;
  let startedAt = 0;
  let lastDrawn = -1;

  const audioReady = Synth.render(film.score, film.duration, 48000, film.voice).then(
    (b) => {
      buffer = b;
      ui.status.hidden = true;
    },
    (err) => {
      ui.status.textContent = `Ses üretilemedi: ${err.message}`;
    },
  );

  const now = () => (playing ? Math.min(film.duration, offset + ac.currentTime - startedAt) : offset);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  async function play() {
    ac ??= new AudioContext();
    if (ac.state === 'suspended') await ac.resume();
    await audioReady;
    if (!buffer || playing) return;
    if (offset >= film.duration - 0.05) offset = 0;
    src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0, offset);
    startedAt = ac.currentTime;
    playing = true;
    sync();
  }

  function pause() {
    offset = now();
    if (src) {
      src.stop();
      src = null;
    }
    playing = false;
    sync();
  }

  function seek(t) {
    const was = playing;
    if (was) pause();
    offset = Math.max(0, Math.min(film.duration, t));
    if (was) play();
  }

  function sync() {
    ui.play.textContent = playing ? '❚❚' : '▶';
    ui.play.setAttribute('aria-label', playing ? 'Duraklat' : 'Oynat');
    ui.big.hidden = playing || offset > 0;
  }

  const toggle = () => (playing ? pause() : play());

  ui.play.addEventListener('click', toggle);
  ui.big.addEventListener('click', play);
  canvas.addEventListener('click', toggle);
  ui.seek.addEventListener('input', () => seek(Number(ui.seek.value)));
  ui.fs.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  document.addEventListener('keydown', (e) => {
    if (e.target === ui.seek && e.key.startsWith('Arrow')) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowRight') seek(now() + 5);
    else if (e.key === 'ArrowLeft') seek(now() - 5);
    else if (e.key === 'f') ui.fs.click();
  });

  function frame() {
    let t = now();
    if (playing && t >= film.duration) {
      pause();
      offset = t = film.duration;
    }
    if (t !== lastDrawn) {
      film.draw(ctx, Math.min(t, film.duration - 1e-3));
      lastDrawn = t;
      ui.seek.value = t;
      ui.time.textContent = `${fmt(t)} / ${fmt(film.duration)}`;
      ui.scene.textContent = film.sceneAt(t).title ?? '';
    }
    requestAnimationFrame(frame);
  }

  sync();
  requestAnimationFrame(frame);
})();
