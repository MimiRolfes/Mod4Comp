// Teilprojekte-Karussell
// - läuft endlos und langsam nach links, jede Karte schwebt für sich (CSS-Animation)
// - Hover: Karte hebt sich, neigt sich zur Maus und dreht sich von der Seite, über
//   die die Maus kommt (flach gedreht, Inhaltstausch bei 90° – so bleibt der Glas-Blur)
// - Tastatur-Fokus dreht ebenfalls, Klick öffnet die Teilprojekt-Seite,
//   auf Touch-Geräten dreht der erste Tipp
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

  function flip(card, toBack, dir) {
    if (card.classList.contains('is-back') === toBack && !card._busy) return;
    var inner = card.querySelector('.sp-card-inner');
    if (reduce || !inner.animate) { card.classList.toggle('is-back', toBack); return; }
    var token = (card._busy || 0) + 1;
    card._busy = token;
    card.classList.remove('is-sweep');
    void card.offsetWidth;
    card.classList.add('is-sweep');
    inner.animate(
      [{ transform: 'perspective(900px) rotateY(0deg)' }, { transform: 'perspective(900px) rotateY(' + 90 * dir + 'deg)' }],
      { duration: 200, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' }
    ).finished.then(function () {
      if (card._busy !== token) return;
      card.classList.toggle('is-back', toBack);
      return inner.animate(
        [{ transform: 'perspective(900px) rotateY(' + -90 * dir + 'deg)' }, { transform: 'perspective(900px) rotateY(0deg)' }],
        { duration: 520, easing: 'cubic-bezier(0.2, 1.45, 0.45, 1)' }
      ).finished;
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

  // Schweben: je Karte eigene Dauer (s), Höhe (px), Neigung (°) und Versatz.
  // Kopien bekommen dieselben Werte wie ihr Original, damit die Schleife nicht springt.
  var FLOAT = [[6.4, 10, 0.6], [7.6, 13, -0.5], [5.8, 8, 0.7], [8.2, 12, -0.4], [6.9, 11, 0.5], [6.1, 9, -0.7], [7.8, 14, 0.4]];
  function setFloat(card, i) {
    var f = FLOAT[i % FLOAT.length];
    card.style.setProperty('--float-dur', f[0] + 's');
    card.style.setProperty('--float-amp', f[1] + 'px');
    card.style.setProperty('--float-rot', f[2] + 'deg');
    card.style.setProperty('--float-delay', (-f[0] * ((i * 0.37) % 1)).toFixed(2) + 's');
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

  function frame(t) {
    var dt = last ? Math.min(t - last, 100) / 1000 : 0;
    last = t;
    if (!hold && visible && !document.hidden && loop > 0) {
      offset = (offset + SPEED * dt) % loop;
      track.style.transform = 'translate3d(' + -offset + 'px, 0, 0)';
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();
