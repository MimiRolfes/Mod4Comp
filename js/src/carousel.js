// Teilprojekte-Karussell: läuft endlos und langsam von selbst nach links.
// Hält an, solange Maus oder Tastatur-Fokus auf den Karten ist oder die
// Sektion nicht sichtbar ist. Bei "Bewegung reduzieren" läuft es nicht
// (dann wischt/scrollt man selbst). Klick auf eine Karte öffnet die
// Teilprojekt-Seite; auf Touch-Geräten dreht der erste Tipp die Karte.

(function () {
  var section = document.querySelector('.subprojects');
  var track = section && section.querySelector('.sp-track');
  if (!track) return;

  var SPEED = 32;      // px pro Sekunde
  var WAVE_H = 22;     // Wellenhöhe in px
  var WAVE_L = 1100;   // Wellenlänge in px
  var TILT = 1.2;      // maximale Neigung in Grad
  var cards = Array.prototype.slice.call(track.querySelectorAll('.sp-card'));
  var touch = window.matchMedia('(hover: none)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bindCard(card) {
    var link = card.querySelector('.sp-more a');
    card.addEventListener('click', function (e) {
      if (!link || e.target.closest('a')) return;
      if (touch && !card.classList.contains('is-flipped')) {
        track.querySelectorAll('.is-flipped').forEach(function (c) { c.classList.remove('is-flipped'); });
        card.classList.add('is-flipped');
        return;
      }
      window.location.href = link.href;
    });
  }
  cards.forEach(bindCard);

  if (reduce) return;

  // Kopie für den nahtlosen Übergang: für Screenreader und Tastatur unsichtbar
  cards.forEach(function (card) {
    var copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
    track.appendChild(copy);
    bindCard(copy);
  });

  var loop = 0, offset = 0, last = 0, hold = false, visible = true;
  function measure() { loop = track.children[cards.length].offsetLeft - cards[0].offsetLeft; }
  measure();
  window.addEventListener('resize', measure);

  track.addEventListener('mouseenter', function () { hold = true; });
  track.addEventListener('mouseleave', function () { hold = false; });
  track.addEventListener('focusin', function () { hold = true; });
  track.addEventListener('focusout', function () { hold = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(section);
  }

  // Höhe und Neigung jeder Karte aus ihrer Position: alle reiten auf derselben Welle
  var all = Array.prototype.slice.call(track.children);
  function wave() {
    var base = section.getBoundingClientRect().left;
    all.forEach(function (card) {
      var x = card.offsetLeft - offset + card.offsetWidth / 2 - base;
      var a = (x / WAVE_L) * 2 * Math.PI;
      card.style.setProperty('--wave-y', (Math.sin(a) * WAVE_H).toFixed(2) + 'px');
      card.style.setProperty('--wave-r', (Math.cos(a) * TILT).toFixed(3) + 'deg');
    });
  }
  wave();

  function frame(t) {
    var dt = last ? Math.min(t - last, 100) / 1000 : 0;
    last = t;
    if (!hold && visible && !document.hidden && loop > 0) {
      offset = (offset + SPEED * dt) % loop;
      track.style.transform = 'translateX(' + -offset + 'px)';
      wave();
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();
