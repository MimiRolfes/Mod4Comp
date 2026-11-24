// Teilprojekte-Karussell
// - läuft endlos und langsam nach links, jede Karte schwebt für sich (CSS-Animation)
// - Hover: Karte hebt sich, neigt sich zur Maus und dreht sich von der Seite, über
//   die die Maus kommt (flach gedreht, Inhaltstausch bei 90° – so bleibt der Glas-Blur)
// - Tastatur-Fokus dreht ebenfalls, Klick öffnet die Teilprojekt-Seite,
//   auf Touch-Geräten dreht der erste Tipp
// - seitlich wischbar (Trackpad / Touch), ohne Scrollbar
// - hält bei Hover/Fokus an und wenn die Sektion nicht sichtbar ist;
//   bei "Bewegung reduzieren" keine Animation

(function () {
  var section = document.querySelector('.subprojects');
  var track = section && section.querySelector('.sp-track');
  if (!track) return;

  var SPEED = 30;      // px pro Sekunde
  var TILT = 7;        // maximale Neigung zur Maus in Grad

  var cards = Array.prototype.slice.call(track.querySelectorAll('.sp-card'));
  var touch = window.matchMedia('(hover: none)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragged = false, swiping = false;

  // Die Drehung läuft auf den beiden Seiten (.sp-face), nicht auf .sp-card-inner:
  // dort liegen schon Anheben und Neigung per CSS – sonst springt die Karte nach
  // dem Drehen zurück auf die CSS-Werte (das "Nachrutschen" nach oben).
  function spin(faces, from, to, duration, easing) {
    var anims = Array.prototype.map.call(faces, function (f) {
      return f.animate([{ transform: 'rotateY(' + from + 'deg)' }, { transform: 'rotateY(' + to + 'deg)' }], { duration: duration, easing: easing });
    });
    return anims[0].finished;
  }

  function flip(card, toBack, dir) {
    if (card.classList.contains('is-back') === toBack && !card._busy) return;
    var faces = card.querySelectorAll('.sp-face');
    if (reduce || !faces[0].animate) { card.classList.toggle('is-back', toBack); return; }
    var token = (card._busy || 0) + 1;
    card._busy = token;
    card.classList.remove('is-sweep');
    void card.offsetWidth;
    card.classList.add('is-sweep');
    spin(faces, 0, 90 * dir, 200, 'cubic-bezier(0.5, 0, 0.75, 0)').then(function () {
      if (card._busy !== token) return;
      card.classList.toggle('is-back', toBack);
      return spin(faces, -90 * dir, 0, 520, 'cubic-bezier(0.2, 1.45, 0.45, 1)');
    }).then(function () { if (card._busy === token) card._busy = 0; });
  }

  function bindCard(card) {
    var link = card.querySelector('.sp-more a');
    var inner = card.querySelector('.sp-card-inner');
    var dir = 1;

    card.addEventListener('mouseenter', function (e) {
      if (touch) return;
      var r = card.getBoundingClientRect();
      dir = e.clientX < r.left + r.width / 2 ? 1 : -1;
      card.classList.add('is-hover');
      flip(card, true, dir);
    });
    card.addEventListener('mousemove', function (e) {
      if (touch || reduce) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      inner.style.setProperty('--ry', (x * TILT).toFixed(2) + 'deg');
      inner.style.setProperty('--rx', (-y * TILT).toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', function () {
      if (touch) return;
      card.classList.remove('is-hover');
      inner.style.setProperty('--ry', '0deg');
      inner.style.setProperty('--rx', '0deg');
      flip(card, false, -dir);
    });
    card.addEventListener('focusin', function () { flip(card, true, 1); });
    card.addEventListener('focusout', function (e) { if (!card.contains(e.relatedTarget)) flip(card, false, -1); });

    card.addEventListener('click', function (e) {
      if (dragged) { dragged = false; e.preventDefault(); return; }
      if (!link || e.target.closest('a')) return;
      if (touch && !card.classList.contains('is-back')) {
        track.querySelectorAll('.is-back').forEach(function (c) { if (c !== card) flip(c, false, -1); });
        flip(card, true, 1);
        return;
      }
      window.location.href = link.href;
    });
  }
  cards.forEach(bindCard);

  // Schweben: je Karte eigene Drift-Dauer, Dreh-Dauer (s), Weite x/y (px) und Drehung (°).
  // Kopien bekommen dieselben Werte wie ihr Original, damit die Schleife nicht springt.
  var FLOAT = [
    [11.0, 15.0, 9, 15, 1.4], [13.5, 11.5, 12, 11, -1.1], [9.8, 17.0, 7, 17, 1.8], [12.6, 13.2, 11, 13, -1.5],
    [10.4, 16.4, 8, 16, 1.2], [14.2, 12.4, 13, 12, -1.7], [11.8, 14.6, 10, 18, 1.3]
  ];
  function setFloat(card, i) {
    var f = FLOAT[i % FLOAT.length];
    var st = card.style;
    st.setProperty('--drift-dur', f[0] + 's');
    st.setProperty('--spin-dur', f[1] + 's');
    st.setProperty('--ax', f[2] + 'px');
    st.setProperty('--ay', f[3] + 'px');
    st.setProperty('--rot', f[4] + 'deg');
    st.setProperty('--drift-delay', (-f[0] * ((i * 0.37) % 1)).toFixed(2) + 's');
    st.setProperty('--spin-delay', (-f[1] * ((i * 0.61) % 1)).toFixed(2) + 's');
  }
  cards.forEach(setFloat);

  if (reduce) return;

  // Kopie für den nahtlosen Übergang: für Screenreader und Tastatur unsichtbar
  cards.forEach(function (card) {
    var copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
    track.appendChild(copy);
    bindCard(copy);
  });
  Array.prototype.forEach.call(track.children, function (c, i) { if (i >= cards.length) setFloat(c, i - cards.length); });

  var all = Array.prototype.slice.call(track.children);
  var loop = 0, offset = 0, last = 0, hold = false, visible = true;
  function measure() { loop = all[cards.length].offsetLeft - cards[0].offsetLeft; }
  measure();
  window.addEventListener('resize', measure);

  track.addEventListener('mouseenter', function () { hold = true; });
  track.addEventListener('mouseleave', function () { hold = false; });
  track.addEventListener('focusin', function () { hold = true; });
  track.addEventListener('focusout', function () { hold = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(section);
  }

  function moveTo(x) {
    offset = loop > 0 ? ((x % loop) + loop) % loop : x;
    track.style.transform = 'translate3d(' + -offset + 'px, 0, 0)';
  }

  // Seitlich wischen: Trackpad (horizontales Scrollen) und Touch-Wischen schieben
  // die Spur mit, endlos in beide Richtungen. Danach läuft das Karussell weiter.
  var resume = 0;
  function pauseBriefly() { window.clearTimeout(resume); swiping = true; resume = window.setTimeout(function () { swiping = false; }, 1200); }

  track.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // senkrechtes Scrollen bleibt Seiten-Scrollen
    e.preventDefault();
    pauseBriefly();
    moveTo(offset + e.deltaX);
  }, { passive: false });

  var startX = 0, startY = 0, startOffset = 0, horizontal = null;
  track.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startOffset = offset;
    horizontal = null;
    dragged = false;
  }, { passive: true });
  track.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
    if (horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) horizontal = Math.abs(dx) > Math.abs(dy);
    if (!horizontal) return;
    e.preventDefault();
    dragged = true;
    pauseBriefly();
    moveTo(startOffset - dx);
  }, { passive: false });

  function frame(t) {
    var dt = last ? Math.min(t - last, 100) / 1000 : 0;
    last = t;
    if (!hold && !swiping && visible && !document.hidden && loop > 0) moveTo(offset + SPEED * dt);
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();
