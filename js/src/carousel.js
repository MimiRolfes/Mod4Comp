// Teilprojekte-Karussell: läuft langsam von selbst, Pfeile + Pause (WCAG 2.2.2),
// hält bei Hover/Fokus an, bei "Bewegung reduzieren" gar nicht.
// Klick auf eine Karte öffnet die Teilprojekt-Seite (Link "Learn more");
// auf Touch-Geräten dreht der erste Tipp die Karte, der zweite öffnet sie.

(function () {
  var section = document.querySelector('.subprojects');
  var track = section && section.querySelector('.sp-track');
  if (!track) return;

  var bar = section.querySelector('.sp-progress span');
  var pauseBtn = section.querySelector('[data-sp="pause"]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches;
  var paused = reduce, hovering = false, visible = true;

  function step() {
    var card = track.querySelector('.sp-card');
    return card ? card.getBoundingClientRect().width + 24 : 300;
  }
  function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; }

  function go(dir) {
    if (dir > 0 && atEnd()) { track.scrollTo({ left: 0 }); return; }
    if (dir < 0 && track.scrollLeft <= 4) { track.scrollTo({ left: track.scrollWidth }); return; }
    track.scrollBy({ left: dir * step() });
  }

  function progress() {
    if (bar) bar.style.width = Math.min(100, (track.scrollLeft + track.clientWidth) / track.scrollWidth * 100) + '%';
  }

  section.querySelector('[data-sp="prev"]').addEventListener('click', function () { go(-1); });
  section.querySelector('[data-sp="next"]').addEventListener('click', function () { go(1); });

  if (pauseBtn) {
    function setPaused(p) {
      paused = p;
      pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', p ? 'Play carousel' : 'Pause carousel');
    }
    setPaused(paused);
    pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  }

  track.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();

  track.addEventListener('mouseenter', function () { hovering = true; });
  track.addEventListener('mouseleave', function () { hovering = false; });
  track.addEventListener('focusin', function () { hovering = true; });
  track.addEventListener('focusout', function () { hovering = false; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(section);
  }

  window.setInterval(function () {
    if (!paused && !hovering && visible && !document.hidden) go(1);
  }, 4000);

  track.querySelectorAll('.sp-card').forEach(function (card) {
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
  });
})();
