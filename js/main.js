/* =========================================================
   SMOL TOD ($TOD) — main.js
   Everything is vanilla. No build step, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var LOGO = 'assets/smol-tod.jpg';
  var CA = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';   // <-- swap in the real contract address
  var X_URL = '';                              // <-- paste the X / Twitter profile URL here

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
     MEME VAULT
     --------------------------------------------------------- */
  var MEMES = [
    { top: 'WHEN SHE SAYS',        bot: 'SHE LIKES SHORT KINGS', hue: 0,   bg: '#ffe0ec', stamp: 'certified' },
    { top: 'SIR',                  bot: 'THIS IS A LILY PAD',    hue: 40,  bg: '#dff3ff', stamp: 'unhinged' },
    { top: 'MY EYES ARE UP HERE',  bot: '(THEY WERE NOT)',       hue: 300, bg: '#e7ffd9', stamp: 'busted' },
    { top: '0.5% BODY FAT',        bot: '99.5% SWEATER',         hue: 190, bg: '#fff0cf', stamp: 'natty' },
    { top: 'HE IS NOT BLOATED',    bot: 'HE IS BULKING',         hue: 90,  bg: '#f0e2ff', stamp: 'science' },
    { top: 'CHART GO DOWN?',       bot: 'HE GO UP',              hue: 220, bg: '#d9fff1', stamp: 'bullish' },
    { top: 'TOD SEES YOUR BAGS',   bot: 'TOD IS AROUSED',        hue: 330, bg: '#ffe3d1', stamp: 'concerning' },
    { top: 'RIBBIT',               bot: 'MEANS I LOVE YOU',      hue: 20,  bg: '#e2ecff', stamp: 'romantic' },
    { top: 'FROG OF THE YEAR',     bot: '— PUDDLE MONTHLY',      hue: 130, bg: '#fff7d6', stamp: 'award' },
    { top: 'DOWN BAD',             bot: 'BUT UP ONLY',           hue: 260, bg: '#ffd9f2', stamp: 'relatable' },
    { top: 'HE ASKED FOR',         bot: 'A HUG. JUST A HUG.',    hue: 60,  bg: '#dcf7e5', stamp: 'suspicious' },
    { top: 'SMOL HANDS',           bot: 'BIG DIAMOND ENERGY',    hue: 170, bg: '#e9e2ff', stamp: 'diamond' }
  ];

  var grid = $('#memegrid');
  if (grid) {
    var frag = document.createDocumentFragment();
    MEMES.forEach(function (m, i) {
      var card = document.createElement('figure');
      card.className = 'meme reveal';
      card.style.background = m.bg;
      card.style.setProperty('--rot', ((i % 2 ? 1 : -1) * (1 + (i % 3) * 0.9)).toFixed(2) + 'deg');
      card.style.setProperty('--hue', m.hue + 'deg');
      card.style.setProperty('--spin', ((i % 2 ? -1 : 1) * 4) + 'deg');
      card.innerHTML =
        '<img class="meme__img" src="' + LOGO + '" alt="Smol Tod meme: ' + m.top + ' ' + m.bot + '" loading="lazy" />' +
        '<figcaption class="meme__top">' + m.top + '</figcaption>' +
        '<figcaption class="meme__bot">' + m.bot + '</figcaption>' +
        '<span class="meme__stamp">' + m.stamp + '</span>';
      card.addEventListener('click', function () {
        blorp(140 + i * 22);
        popHearts(card, 5, ['😳', '🔥', '💦', '🐸', '💚'][i % 5]);
      });
      frag.appendChild(card);
    });
    grid.appendChild(frag);
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
          t.src = LOGO;
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
      img.src = LOGO;
      img.alt = '';
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
