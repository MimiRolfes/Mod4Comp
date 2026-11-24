// Start-Animation (Startseite, einmal pro Besuch):
// 1. Linien laufen von den Bildschirmrändern zur Mitte – jede aus der Richtung,
//    in die ihre Leiterbahn im Logo zeigt
// 2. dort zeichnen sich Drähte und Ringe, dann der Chip, Blatt und ∫Σ blenden ein
// 3. das Logo schwebt an seine Stelle in der Hero-Karte, die Fläche blendet aus
// Klick, Taste oder Scrollen überspringt. Ob sie läuft, entscheidet m4c_intro_guard().

(function () {
  var root = document.documentElement;
  var box = document.querySelector('.intro');
  if (!box || !root.classList.contains('intro-on')) return;

  var NS = 'http://www.w3.org/2000/svg';
  var done = false;

  function finish() {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('m4c-intro', '1'); } catch (e) {}
    root.classList.remove('intro-on');
    box.remove();
  }

  function skip() {
    if (done) return;
    box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(finish);
  }
  box.addEventListener('click', skip);
  window.addEventListener('keydown', skip, { once: true });
  window.addEventListener('wheel', skip, { once: true, passive: true });
  window.setTimeout(skip, 6000); // Sicherheitsnetz

  if (!box.animate) { finish(); return; }

  fetch(box.getAttribute('data-logo')).then(function (r) { return r.text(); }).then(function (svgText) {
    if (done) return;

    var wrap = document.createElement('div');
    wrap.className = 'intro-logo';
    wrap.innerHTML = svgText;
    box.appendChild(wrap);
    var logo = wrap.querySelector('svg');
    var group = logo.querySelector('g');                // Drähte + Ringe
    var traces = group.querySelectorAll('path');
    var rings = group.querySelectorAll('circle');
    var chip = logo.querySelector(':scope > path');     // Chip-Rahmen
    var art = logo.querySelectorAll(':scope > path:not(:first-of-type)'); // Blatt, ∫Σ

    var lines = document.createElementNS(NS, 'svg');
    lines.setAttribute('class', 'intro-lines');
    box.insertBefore(lines, wrap);

    var W = window.innerWidth, H = window.innerHeight;
    var m = logo.getScreenCTM();
    function toScreen(p) { return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f }; }

    // Linie vom Bildschirmrand zum äußeren Ende jeder Leiterbahn
    function edgePoint(p, dx, dy) {
      var t = Infinity;
      if (dx > 0) t = Math.min(t, (W - p.x) / dx);
      if (dx < 0) t = Math.min(t, -p.x / dx);
      if (dy > 0) t = Math.min(t, (H - p.y) / dy);
      if (dy < 0) t = Math.min(t, -p.y / dy);
      return { x: p.x + dx * t, y: p.y + dy * t };
    }

    function draw(el, len, reverse, delay, duration) {
      el.style.strokeDasharray = len + ' ' + len;
      el.style.strokeDashoffset = reverse ? -len : len;
      return el.animate([{ strokeDashoffset: reverse ? -len : len }, { strokeDashoffset: 0 }], {
        duration: duration, delay: delay, easing: 'cubic-bezier(0.6, 0, 0.2, 1)', fill: 'forwards'
      });
    }

    var T_LINES = 150, T_TRACES = 1050, T_CHIP = 1500, T_ART = 1850, T_FLY = 2500;

    Array.prototype.forEach.call(traces, function (path, i) {
      var len = path.getTotalLength();
      var end = toScreen(path.getPointAtLength(len));
      var before = toScreen(path.getPointAtLength(Math.max(0, len - 20)));
      var dx = end.x - before.x, dy = end.y - before.y, d = Math.hypot(dx, dy) || 1;
      var start = edgePoint(end, dx / d, dy / d);

      var line = document.createElementNS(NS, 'path');
      line.setAttribute('d', 'M' + start.x + ' ' + start.y + ' L' + end.x + ' ' + end.y);
      lines.appendChild(line);
      var lineLen = Math.hypot(end.x - start.x, end.y - start.y);
      var delay = T_LINES + i * 45;
      draw(line, lineLen, false, delay, 900);
      line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: T_TRACES + 300, fill: 'forwards' });

      draw(path, len, true, T_TRACES - 150 + i * 20, 600); // vom Ende zum Chip
    });
    Array.prototype.forEach.call(rings, function (c, i) {
      draw(c, c.getTotalLength(), false, T_TRACES - 250 + i * 30, 500);
    });
    draw(chip, chip.getTotalLength(), false, T_CHIP - 300, 600);
    chip.style.fillOpacity = 0;
    chip.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 400, delay: T_CHIP + 200, fill: 'forwards' });
    Array.prototype.forEach.call(art, function (p, i) {
      p.style.opacity = 0;
      p.animate([{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'scale(1)' }], {
        duration: 500, delay: T_ART + i * 120, easing: 'ease-out', fill: 'forwards'
      });
      p.style.transformOrigin = 'center';
      p.style.transformBox = 'fill-box';
    });

    // Flug zur Hero-Position
    window.setTimeout(function () {
      if (done) return;
      var target = document.querySelector('.hero-logo img');
      var from = wrap.getBoundingClientRect();
      var to = target ? target.getBoundingClientRect() : from;
      var s = to.width / from.width;
      wrap.style.transform = 'translate(' + from.left + 'px,' + from.top + 'px)';
      wrap.style.left = '0';
      wrap.style.top = '0';
      var fly = wrap.animate([
        { transform: 'translate(' + from.left + 'px,' + from.top + 'px) scale(1)' },
        { transform: 'translate(' + to.left + 'px,' + to.top + 'px) scale(' + s + ')' }
      ], { duration: 1000, easing: 'cubic-bezier(0.65, 0, 0.25, 1)', fill: 'forwards' });
      box.animate([{ backgroundColor: 'rgba(11,21,48,0.9)' }, { backgroundColor: 'rgba(11,21,48,0)' }], {
        duration: 900, delay: 150, easing: 'ease-in-out', fill: 'forwards'
      });
      fly.finished.then(finish);
    }, T_FLY);
  }).catch(finish);
})();
