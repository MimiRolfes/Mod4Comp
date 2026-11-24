// Basis-Skript (jede Seite): Menü und Sprachumschalter.

(function initNav() {
  var toggle = document.getElementById('nav-toggle');
  var dropdown = document.getElementById('nav-dropdown');
  if (!toggle || !dropdown) return;

  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function setNav(open) {
    toggle.classList.toggle('open', open);
    dropdown.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // Die ganze Leiste öffnet/schließt das Menü (auch "MOD4COMP"; Home steht im Menü).
  // Der +-Knopf bleibt das eigentliche Bedienelement für Tastatur und Screenreader.
  var bar = toggle.closest('.nav-bar');
  (bar || toggle).addEventListener('click', function (e) {
    e.preventDefault();
    setNav(!dropdown.classList.contains('open'));
  });
  backdrop.addEventListener('click', function () { setNav(false); });
  dropdown.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) { setNav(false); toggle.focus(); }
  });
})();

// Jeder Text steht doppelt im Markup (.lang-en / .lang-de); hier wird nur
// <html data-lang> gesetzt und gemerkt, die Sichtbarkeit regelt das CSS.
(function initLanguageToggle() {
  var KEY = 'm4c-lang';
  var buttons = document.querySelectorAll('.lang-toggle-btn');
  if (!buttons.length) return;

  function apply(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
  }

  var saved = 'en';
  try { saved = localStorage.getItem(KEY) === 'de' ? 'de' : 'en'; } catch (e) {}
  apply(saved);

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.getAttribute('data-lang');
      apply(lang);
      try { localStorage.setItem(KEY, lang); } catch (e) {}
    });
  });
})();
