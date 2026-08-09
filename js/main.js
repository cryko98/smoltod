/* =========================================================
   SMOL TOD ($TOD) — main.js
   Everything is vanilla. No build step, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var LOGO = 'assets/smol-tod.jpg';
  var CA = '9w2nokGrjFACQaJaEJGafZgsxBePfDWdUav6ofSJpump';   // token contract address
  var X_URL = 'https://x.com/smoltod';         // X / Twitter profile

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  /* ---------------------------------------------------------
     SOUND — synthesised, no audio files, off by default
     --------------------------------------------------------- */
  var audioOn = false, ctx = null;
  function blorp(base) {
    if (!audioOn) return;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base || 180, t);
      osc.frequency.exponentialRampToValueAtTime((base || 180) * 3.4, t + 0.09);
      osc.frequency.exponentialRampToValueAtTime((base || 180) * 0.6, t + 0.22);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.3);
    } catch (e) { /* audio is a luxury, not a requirement */ }
  }

  var soundBtn = $('#soundBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      audioOn = !audioOn;
      soundBtn.setAttribute('aria-pressed', String(audioOn));
      soundBtn.querySelector('.iconbtn__on').textContent = audioOn ? '🔊' : '🔇';
      if (audioOn) { blorp(200); toast('TOAD NOISES: ON'); } else { toast('shhh 🤫'); }
    });
  }

  /* ---------------------------------------------------------
     CONTRACT ADDRESS + COPY
     --------------------------------------------------------- */
  $$('#caValue, #caValue2').forEach(function (el) { el.textContent = CA; });

  function copyCA(btn, labelEl) {
    function done() {
      var original = labelEl.textContent;
      labelEl.textContent = 'COPIED!';
      btn.classList.add('is-done');
      toast('CA copied. Go be reckless responsibly 🐸');
      blorp(320);
      rainToads(18);
      setTimeout(function () {
        labelEl.textContent = original;
        btn.classList.remove('is-done');
      }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(CA).then(done).catch(fallback);
    } else { fallback(); }

    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = CA;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { toast('Copy failed — select it manually 😔'); }
      document.body.removeChild(ta);
    }
  }

  var copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', function () { copyCA(copyBtn, $('#copyText')); });
  var copyBtn2 = $('#copyBtn2');
  if (copyBtn2) copyBtn2.addEventListener('click', function () { copyCA(copyBtn2, copyBtn2); });

  /* ---------------------------------------------------------
     X LINK — wire up once the URL exists
     --------------------------------------------------------- */
  $$('[data-x-link]').forEach(function (a) {
    if (X_URL) {
      a.href = X_URL;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.removeAttribute('title');
    } else {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toast('X account dropping soon — stay damp 💧');
        blorp(150);
      });
    }
  });

  /* ---------------------------------------------------------
     THE MEMES — one source of truth for the tape, the vault,
     the lightbox, the toad rain and the floating CTA toads.
     --------------------------------------------------------- */
  var MEMES = [
    { file: 'meme-gm.jpg',         title: 'GM.',
      sub: 'Awake four minutes. Already in love with you.',
      alt: 'Smol Tod waking up in bed next to a mug reading GM', stamp: 'daily' },
    { file: 'meme-doomscroll.jpg', title: 'HE SAW THE CHART',
      sub: 'And, more importantly, the chart saw him back.',
      alt: 'Close-up of Smol Tod staring at a phone screen', stamp: 'unwell' },
    { file: 'meme-fishing.jpg',    title: 'BOTTOM FISHING',
      sub: 'Caught three reds and a feeling.',
      alt: 'Smol Tod fishing a lake full of red and green candles', stamp: 'strategy' },
    { file: 'meme-bull.jpg',       title: 'SMOL BODY. BULL SHADOW.',
      sub: '4.2 cm of completely unexplained confidence.',
      alt: 'Smol Tod under a spotlight casting the shadow of a huge bull', stamp: 'natty' },
    { file: 'meme-army.jpg',       title: 'THE TOD ARMY',
      sub: 'Every single one of them is horny. This is the strategy.',
      alt: 'A battlefield full of tiny Smol Tods in helmets', stamp: 'enlisted' },
    { file: 'meme-money.jpg',      title: 'MONEY ANGELS',
      sub: 'He did it for the puddle. He says.',
      alt: 'Smol Tod making a snow angel in a field of banknotes', stamp: 'wagmi' },
    { file: 'meme-rafiki.jpg',     title: 'THE PRESENTATION',
      sub: 'They held him up. He winked at the entire kingdom.',
      alt: 'Smol Tod held aloft on a cliff like a newborn prince', stamp: 'legendary' },
    { file: 'meme-halo.jpg',       title: 'TOO PURE FOR THIS PUDDLE',
      sub: 'Lasted nine minutes up there. Came back damp.',
      alt: 'Smol Tod sitting on a cloud with a halo', stamp: 'briefly' },
    { file: 'meme-cozy.jpg',       title: 'HOLDING THROUGH THE DIP',
      sub: 'Tucked in. Unbothered. Moisturised. Still down bad.',
      alt: 'Smol Tod tucked into bed under a patchwork quilt', stamp: 'diamond' }
  ];

  MEMES.forEach(function (m) { m.src = 'assets/' + m.file; });

  /* ---------------------------------------------------------
     THE TOD TAPE — two rows drifting in opposite directions.
     Each row holds the list twice so the loop is seamless.
     --------------------------------------------------------- */
  function buildTape(row, list, rotSeed) {
    if (!row) return;
    var frag = document.createDocumentFragment();
    for (var pass = 0; pass < 2; pass++) {
      list.forEach(function (m, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tape__item';
        btn.style.setProperty('--rot', (((i + rotSeed) % 2 ? 1 : -1) * (1 + (i % 3) * 0.7)).toFixed(2) + 'deg');
        btn.setAttribute('aria-label', 'Open meme: ' + m.title);
        // the second pass is a visual duplicate — hide it from screen readers
        if (pass === 1) btn.setAttribute('aria-hidden', 'true');
        btn.tabIndex = pass === 1 ? -1 : 0;
        var img = document.createElement('img');
        img.src = m.src;
        img.alt = pass === 0 ? m.alt : '';
        img.loading = 'lazy';
        img.decoding = 'async';
        btn.appendChild(img);
        btn.addEventListener('click', function () { openLightbox(MEMES.indexOf(m)); });
        frag.appendChild(btn);
      });
    }
    row.appendChild(frag);
  }

  buildTape($('#tapeRowA'), MEMES, 0);
  buildTape($('#tapeRowB'), MEMES.slice().reverse(), 1);

  /* ---------------------------------------------------------
     MEME VAULT
     --------------------------------------------------------- */
  var grid = $('#memegrid');
  if (grid) {
    var gfrag = document.createDocumentFragment();
    MEMES.forEach(function (m, i) {
      var card = document.createElement('figure');
      card.className = 'meme reveal';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Open meme: ' + m.title);
      card.style.setProperty('--rot', ((i % 2 ? 1 : -1) * (1 + (i % 3) * 0.8)).toFixed(2) + 'deg');

      var img = document.createElement('img');
      img.className = 'meme__img';
      img.src = m.src;
      img.alt = m.alt;
      img.loading = 'lazy';
      img.decoding = 'async';

      var cap = document.createElement('figcaption');
      cap.className = 'meme__cap';
      var b = document.createElement('b');
      b.textContent = m.title;
      var s = document.createElement('span');
      s.textContent = m.sub;
      cap.appendChild(b); cap.appendChild(s);

      var stamp = document.createElement('span');
      stamp.className = 'meme__stamp';
      stamp.textContent = m.stamp;

      card.appendChild(img); card.appendChild(cap); card.appendChild(stamp);
      card.addEventListener('click', function () { openLightbox(i); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
      gfrag.appendChild(card);
    });
    grid.appendChild(gfrag);
  }

  /* ---------------------------------------------------------
     LIGHTBOX
     --------------------------------------------------------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbTitle = $('#lbTitle'),
      lbSub = $('#lbSub'), lbDl = $('#lbDl');
  var lbIndex = 0, lbLastFocus = null;

  function renderLightbox() {
    var m = MEMES[lbIndex];
    lbImg.src = m.src;
    lbImg.alt = m.alt;
    lbTitle.textContent = m.title;
    lbSub.textContent = m.sub;
    lbDl.href = m.src;
    lbDl.setAttribute('download', m.file);
  }

  function openLightbox(i) {
    if (!lb) return;
    lbIndex = (i + MEMES.length) % MEMES.length;
    lbLastFocus = document.activeElement;
    renderLightbox();
    lb.hidden = false;
    document.body.classList.add('lb-open');
    blorp(300);
    $('#lbClose').focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    blorp(120);
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
  }

  function stepLightbox(d) {
    lbIndex = (lbIndex + d + MEMES.length) % MEMES.length;
    renderLightbox();
    blorp(200 + d * 40);
  }

  if (lb) {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', function () { stepLightbox(-1); });
    $('#lbNext').addEventListener('click', function () { stepLightbox(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') stepLightbox(-1);
      else if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  /* ---------------------------------------------------------
     PFP LAB — talks to /api/pfp, which proxies fal.ai.
     Submit returns a job id; we poll until the toad is dressed.
     --------------------------------------------------------- */
  var CHIPS = [
    'a tiny cowboy hat', 'round black sunglasses', 'a chunky gold chain',
    'a red santa hat', 'a golden crown', 'big over-ear headphones',
    'a pirate eyepatch', 'a flower crown', 'a wool beanie',
    'a monocle and top hat', 'a striped scarf', 'a backwards cap',
    'a tiny bow tie', 'a leather jacket', 'a viking helmet'
  ];

  var labImg = $('#labImg'), labPrompt = $('#labPrompt'), labGo = $('#labGo'),
      labMsg = $('#labMsg'), labBusy = $('#labBusy'), labStatus = $('#labStatus'),
      labSave = $('#labSave'), labReset = $('#labReset'), labRetry = $('#labRetry'),
      labCount = $('#labCount'),
      labChips = $('#labChips'), labBadge = $('#labBadge'),
      labFrame = document.querySelector('.lab__frame');

  var BASE_PFP = 'assets/smol-tod.jpg';
  var labRunning = false;

  var WAIT_LINES = [
    'Warming up the puddle…',
    'He is choosing an outfit…',
    'Checking the mirror. Again.',
    'Adjusting for maximum smoulder…',
    'Nothing fits a 4.2 cm toad…',
    'Almost. He is nervous.'
  ];

  function labSay(msg, kind) {
    if (!labMsg) return;
    labMsg.textContent = msg || '';
    labMsg.className = 'lab__msg' + (kind ? ' lab__msg--' + kind : '');
  }

  function labBusyOn(on) {
    labRunning = on;
    if (labBusy) labBusy.hidden = !on;
    if (labGo) {
      labGo.disabled = on;
      labGo.textContent = on ? 'DRESSING…' : 'DRESS HIM UP';
    }
  }

  if (labChips) {
    CHIPS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lab__chip';
      b.textContent = c;
      b.addEventListener('click', function () {
        var cur = labPrompt.value.trim();
        // don't add the same thing twice
        if (cur.toLowerCase().indexOf(c.toLowerCase()) !== -1) return;
        labPrompt.value = cur ? cur.replace(/[,\s]+$/, '') + ', ' + c : c;
        if (labPrompt.value.length > 200) labPrompt.value = labPrompt.value.slice(0, 200);
        labPrompt.dispatchEvent(new Event('input'));
        labPrompt.focus();
        blorp(260);
      });
      labChips.appendChild(b);
    });
  }

  if (labPrompt && labCount) {
    labPrompt.addEventListener('input', function () {
      labCount.textContent = labPrompt.value.length;
    });
    labPrompt.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') dressHim();
    });
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* --- candidate scoring -------------------------------------------
     fal gives us a couple of takes on the same prompt. The model
     sometimes redraws the face — thickens the line mouth, rounds the
     half-lidded eyes — and a take that did that differs from the
     original far more than one that only dropped a hat on him.
     So: compare each candidate to the base image and keep the one that
     changed the LEAST, while still having actually added something.
     Done at 256px, which also stops anti-aliasing noise from counting.
     ------------------------------------------------------------------ */
  var SCORE_SIZE = 256;
  var BLOCK = 8;               // scoring grid cell, 8x8 px of the 256px image
  var CHANGE_THRESHOLD = 30;   // per-pixel RGB distance that counts as "changed"
  var MIN_SOLID = 0.003;       // fraction of cells that must be SOLIDLY changed to count as a real edit

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('image load failed')); };
      img.src = src;
    });
  }

  function pixelsOf(img) {
    var c = document.createElement('canvas');
    c.width = c.height = SCORE_SIZE;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, SCORE_SIZE, SCORE_SIZE);
    return ctx.getImageData(0, 0, SCORE_SIZE, SCORE_SIZE).data;
  }

  /* Two numbers per candidate:
       mean  — average colour distance from the original. Total deviation:
               a take that also redrew the face scores much higher than one
               that only added a hat.
       solid — fraction of 8x8 cells that are at least half changed. This is
               what tells a real added object from re-encoding noise: JPEG
               and rescaling wobble sits in thin 1px lines along the black
               outlines and never fills a cell, while even a small accessory
               fills several. Measured: pure noise 0.000, a monocle 0.009,
               a hat 0.042. */
  function driftScore(basePx, candPx) {
    var n = SCORE_SIZE * SCORE_SIZE;
    var mask = new Uint8Array(n);
    var total = 0;

    for (var i = 0, j = 0; i < candPx.length; i += 4, j++) {
      var dr = candPx[i] - basePx[i];
      var dg = candPx[i + 1] - basePx[i + 1];
      var db = candPx[i + 2] - basePx[i + 2];
      var d = Math.sqrt(dr * dr + dg * dg + db * db);
      total += d;
      if (d > CHANGE_THRESHOLD) mask[j] = 1;
    }

    var cells = SCORE_SIZE / BLOCK, solid = 0, need = BLOCK * BLOCK * 0.5;
    for (var by = 0; by < cells; by++) {
      for (var bx = 0; bx < cells; bx++) {
        var cnt = 0;
        for (var y = 0; y < BLOCK; y++) {
          var row = (by * BLOCK + y) * SCORE_SIZE + bx * BLOCK;
          for (var x = 0; x < BLOCK; x++) cnt += mask[row + x];
        }
        if (cnt >= need) solid++;
      }
    }

    return { mean: total / n, solid: solid / (cells * cells) };
  }

  function pickBest(candidates) {
    if (!candidates.length) return Promise.reject(new Error('He came back empty-handed.'));
    if (candidates.length === 1) return Promise.resolve(candidates[0]);

    return loadImage(BASE_PFP)
      .then(function (baseImg) {
        var basePx = pixelsOf(baseImg);
        return Promise.all(candidates.map(function (src) {
          return loadImage(src)
            .then(function (img) {
              var s = driftScore(basePx, pixelsOf(img));
              return { src: src, mean: s.mean, solid: s.solid };
            })
            .catch(function () { return null; });   // tainted or broken — skip
        }));
      })
      .then(function (scored) {
        var ok = scored.filter(Boolean);
        if (!ok.length) return candidates[0];

        // keep only takes that actually put something on him, then the
        // one that left the rest of him alone
        var real = ok.filter(function (s) { return s.solid >= MIN_SOLID; });
        if (real.length) {
          real.sort(function (a, b) { return a.mean - b.mean; });
          return real[0].src;
        }
        // none of them added anything — take whichever moved the most
        ok.sort(function (a, b) { return b.solid - a.solid; });
        return ok[0].src;
      })
      .catch(function () { return candidates[0]; });
  }

  // The API always answers JSON; anything else means we're not on the
  // deployed site (opened the file directly, or a plain static server).
  function readJson(res) {
    return res.text().then(function (t) {
      try { return JSON.parse(t); }
      catch (e) { throw new Error('OFFLINE'); }
    });
  }

  function dressHim() {
    if (labRunning || !labPrompt) return;
    var prompt = labPrompt.value.replace(/\s+/g, ' ').trim();
    if (!prompt) {
      labSay('Tell him what to wear first.', 'bad');
      labPrompt.focus();
      return;
    }

    labBusyOn(true);
    labSay('');
    if (labBadge) labBadge.hidden = true;
    blorp(240);

    var line = 0;
    if (labStatus) labStatus.textContent = WAIT_LINES[0];
    var ticker = setInterval(function () {
      line = (line + 1) % WAIT_LINES.length;
      if (labStatus) labStatus.textContent = WAIT_LINES[line];
    }, 3200);

    fetch('/api/pfp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    })
      .then(function (res) {
        return readJson(res).then(function (data) {
          if (!res.ok) throw new Error(data.error || 'The stylist said no.');
          if (!data.requestId) throw new Error('The stylist said nothing at all.');
          return data.requestId;
        });
      })
      .then(function (id) {
        // ~90s of patience, then we give up
        var tries = 0;
        function check() {
          tries++;
          if (tries > 60) throw new Error('He is taking far too long. Try again.');
          return sleep(1500)
            .then(function () { return fetch('/api/pfp?id=' + encodeURIComponent(id)); })
            .then(readJson)
            .then(function (data) {
              if (data.status === 'COMPLETED') {
                var list = data.images || (data.image ? [data.image] : []);
                if (!list.length) throw new Error('He came back without a picture.');
                if (labStatus) labStatus.textContent = 'Picking the take that looks most like him…';
                return pickBest(list);
              }
              if (data.status === 'ERROR' || data.error) {
                throw new Error(data.error || 'That outfit did not survive.');
              }
              return check();
            });
        }
        return check();
      })
      .then(function (src) {
        clearInterval(ticker);
        labImg.src = src;
        if (labSave) { labSave.href = src; labSave.hidden = false; }
        if (labRetry) labRetry.hidden = false;
        if (labReset) labReset.hidden = false;
        if (labBadge) labBadge.hidden = false;
        if (labFrame) {
          labFrame.classList.remove('is-fresh');
          void labFrame.offsetWidth;
          labFrame.classList.add('is-fresh');
        }
        labBusyOn(false);
        labSay('There he is. Right click or hit save.', 'good');
        blorp(420);
        popHearts(document.querySelector('.lab__stage'), 6, '✨');
      })
      .catch(function (err) {
        clearInterval(ticker);
        labBusyOn(false);
        // a non-JSON reply or a dead fetch both mean the API isn't there
        var offline = !err || err.message === 'OFFLINE' || err.name === 'TypeError';
        labSay(
          offline
            ? 'The generator only runs on the deployed site — it needs the server half.'
            : err.message || 'Something went wrong. Try again.',
          'bad'
        );
      });
  }

  if (labGo) labGo.addEventListener('click', dressHim);

  // same prompt, fresh roll — for when a take still drifts
  if (labRetry) labRetry.addEventListener('click', dressHim);

  if (labReset) {
    labReset.addEventListener('click', function () {
      labImg.src = BASE_PFP;
      labSave.hidden = true;
      labRetry.hidden = true;
      labReset.hidden = true;
      if (labBadge) labBadge.hidden = true;
      labPrompt.value = '';
      labPrompt.dispatchEvent(new Event('input'));
      labSay('');
      blorp(160);
    });
  }

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
     --------------------------------------------------------- */
  var revealTargets = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, idx) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, idx * 70);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     COUNTERS + ALLOCATION BARS
     --------------------------------------------------------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var dur = 1400, start = null;
    if (!target) { el.textContent = '0' + suffix; return; }
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(target * eased);
      el.textContent = (target >= 1000 ? val.toLocaleString('en-US') : val) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = $$('.stat__val[data-count]');
  var allocs = $$('.alloc');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.classList.contains('alloc')) e.target.classList.add('is-in');
        else animateCount(e.target);
        io2.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    counters.concat(allocs).forEach(function (el) { io2.observe(el); });
  } else {
    counters.forEach(animateCount);
    allocs.forEach(function (a) { a.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     NAV — hide on scroll down, show on scroll up
     --------------------------------------------------------- */
  var nav = $('#nav'), lastY = 0;
  function onScrollNav() {
    var y = window.pageYOffset;
    nav.classList.toggle('is-stuck', y > 20);
    if (y > lastY && y > 320) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = y;
  }

  var burger = $('#burger'), navLinks = $('.nav__links');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      blorp(open ? 260 : 160);
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------
     HORNY METER — scroll progress, obviously
     --------------------------------------------------------- */
  var fill = $('#hornyFill'), pct = $('#hornyPct'), bulb = $('.hornymeter__bulb');
  var FACES = ['😐', '🙂', '😏', '😳', '🥵', '🫠'];
  function onScrollMeter() {
    if (!fill) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(window.pageYOffset / h, 1) : 0;
    fill.style.height = (p * 100).toFixed(1) + '%';
    pct.textContent = Math.round(p * 100) + '%';
    if (bulb) bulb.textContent = FACES[Math.min(Math.floor(p * FACES.length), FACES.length - 1)];
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollNav();
      onScrollMeter();
      ticking = false;
    });
  }, { passive: true });
  onScrollNav(); onScrollMeter();

  /* ---------------------------------------------------------
     POKE THE TOAD — hearts, squish, rave mode after 10
     --------------------------------------------------------- */
  var todStage = $('#todStage');
  var heartLayer = $('#heartLayer');
  var pokes = 0;
  var POKE_LINES = [
    'blorp.', 'he liked that', 'stop it (do not stop it)', 'he is BLUSHING',
    'sir…', '4.2 cm of pure reaction', 'the sweater shifted slightly',
    'he winked. at YOU.', 'one more and he proposes', 'MARRY HIM'
  ];

  function popHearts(host, n, glyph) {
    if (reduced) return;
    var layer = host === todStage ? heartLayer : host;
    if (!layer) return;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var h = document.createElement('span');
        h.className = 'heart';
        h.textContent = glyph || ['💚', '💙', '😳', '💦', '🐸', '🔥'][Math.floor(Math.random() * 6)];
        h.style.left = (15 + Math.random() * 70) + '%';
        h.style.bottom = (10 + Math.random() * 40) + '%';
        h.style.setProperty('--dx', (Math.random() * 130 - 65) + 'px');
        h.style.setProperty('--dr', (Math.random() * 90 - 45) + 'deg');
        h.style.animationDelay = (i * 60) + 'ms';
        layer.appendChild(h);
        setTimeout(function () { h.remove(); }, 1400 + i * 60);
      })(i);
    }
  }

  function poke() {
    pokes++;
    todStage.classList.remove('is-poked');
    void todStage.offsetWidth;           // restart the squish animation
    todStage.classList.add('is-poked');
    popHearts(todStage, 6);
    blorp(150 + Math.min(pokes, 12) * 18);
    toast(POKE_LINES[Math.min(pokes - 1, POKE_LINES.length - 1)]);

    if (pokes === 10) {
      document.body.classList.add('rave');
      toast('🎉 RAVE MODE — he is UNWELL 🎉');
      rainToads(40);
      setTimeout(function () { document.body.classList.remove('rave'); }, 9000);
    }
  }

  if (todStage) {
    todStage.addEventListener('click', poke);
    todStage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
    });
  }

  /* ---------------------------------------------------------
     TOAD RAIN
     --------------------------------------------------------- */
  function rainToads(count) {
    if (reduced) return;
    for (var i = 0; i < count; i++) {
      (function (i) {
        setTimeout(function () {
          var t = document.createElement('img');
          // half logo, half actual memes raining down
          t.src = Math.random() < 0.5 ? LOGO : MEMES[Math.floor(Math.random() * MEMES.length)].src;
          t.alt = '';
          t.setAttribute('aria-hidden', 'true');
          var size = 26 + Math.random() * 48;
          t.style.cssText =
            'position:fixed;z-index:9990;pointer-events:none;border-radius:50%;' +
            'border:3px solid #12120f;width:' + size + 'px;height:' + size + 'px;object-fit:cover;' +
            'left:' + (Math.random() * 100) + 'vw;top:-90px;' +
            'transition:transform 2.4s cubic-bezier(.4,.1,.7,1),opacity 2.4s ease-in';
          document.body.appendChild(t);
          requestAnimationFrame(function () {
            t.style.transform = 'translateY(' + (window.innerHeight + 200) + 'px) rotate(' + (Math.random() * 900 - 450) + 'deg)';
            t.style.opacity = '0';
          });
          setTimeout(function () { t.remove(); }, 2600);
        }, i * 55);
      })(i);
    }
  }

  /* ---------------------------------------------------------
     FLOATING TOADS IN THE FINAL CTA
     --------------------------------------------------------- */
  var ctaToads = $('#ctaToads');
  if (ctaToads && !reduced) {
    for (var i = 0; i < 7; i++) {
      var img = document.createElement('img');
      img.src = MEMES[i % MEMES.length].src;
      img.alt = '';
      img.loading = 'lazy';
      img.style.left = (4 + i * 14 + Math.random() * 6) + '%';
      img.style.animationDuration = (11 + Math.random() * 9) + 's';
      img.style.animationDelay = (-Math.random() * 14) + 's';
      img.style.width = (44 + Math.random() * 46) + 'px';
      ctaToads.appendChild(img);
    }
  }

  /* ---------------------------------------------------------
     HERO PARALLAX (mouse)
     --------------------------------------------------------- */
  var stickers = $$('.fsticker');
  if (stickers.length && !reduced && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      var cx = (e.clientX / window.innerWidth - 0.5);
      var cy = (e.clientY / window.innerHeight - 0.5);
      stickers.forEach(function (s) {
        var d = parseFloat(s.dataset.depth) || 20;
        s.style.translate = (-cx * d) + 'px ' + (-cy * d) + 'px';
      });
      var todImg = $('#todImg');
      if (todImg) todImg.style.rotate = (cx * 5).toFixed(2) + 'deg';
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     CURSOR TRAIL — tiny toads, throttled
     --------------------------------------------------------- */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    var lastTrail = 0;
    document.addEventListener('mousemove', function (e) {
      var now = performance.now();
      if (now - lastTrail < 90) return;
      lastTrail = now;
      var d = document.createElement('div');
      d.className = 'trail';
      d.style.left = e.clientX + 'px';
      d.style.top = e.clientY + 'px';
      d.style.backgroundImage = 'url(' + LOGO + ')';
      d.style.backgroundSize = 'cover';
      document.body.appendChild(d);
      setTimeout(function () { d.remove(); }, 800);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     EASTER EGGS
     --------------------------------------------------------- */
  var egg = $('#egg');
  if (egg) {
    egg.addEventListener('click', function () {
      rainToads(30);
      blorp(420);
      toast('you found the damp button 🐸');
    });
  }

  // type "tod" anywhere
  var buffer = '';
  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input,textarea')) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-3);
    if (buffer === 'tod') {
      rainToads(35);
      document.body.classList.add('rave');
      toast('T O D   S U M M O N E D');
      blorp(90);
      setTimeout(function () { document.body.classList.remove('rave'); }, 7000);
      buffer = '';
    }
  });

  /* ---------------------------------------------------------
     MISC
     --------------------------------------------------------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  // accordion: only one FAQ open at a time
  var qas = $$('.qa');
  qas.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      blorp(240);
      qas.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  console.log('%c🐸 SMOL TOD ($TOD)', 'font-size:22px;font-weight:bold;color:#4e9e3e');
  console.log('%cHe is 4.2 cm. He is unwell. Type "tod" for a surprise.', 'font-size:13px;color:#1a5ce0');
})();
