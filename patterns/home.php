<?php
/**
 * Title: Mod4Comp – Startseite
 * Slug: mod4comp/home
 * Categories: mod4comp
 * Description: Hero, About und Teilprojekte-Karussell.
 *
 * Inhalt der Startseite. Wird per "Create pages" (Design → Themes) zur Seite
 * "Home"; danach alles im Block-Editor bearbeitbar.
 */

/* ───────────── HERO ───────────── */
m4c_open( 'hero', 'section', 'top' );
m4c_image( 'images/hero.jpg', 'hero-bg' );
m4c_open( 'hero-card glass' );
m4c_image( 'images/logo.svg', 'hero-logo', 'Mod4Comp logo' );
m4c_open( 'hero-text' );
m4c_i18n( 'Holistic Energy and<br>Performance Modeling<br>for Sustainable<br>Computing', 'Ganzheitliche<br>Energie- und Performance-<br>Modellierung für<br>nachhaltiges Rechnen', 'h1', 'hero-title' );
m4c_i18n( 'A DFG Research Unit', 'Eine DFG-Forschungsgruppe', 'p', 'hero-sub' );
m4c_button( 'Explore subprojects  →', 'Teilprojekte entdecken  →', home_url( '/#subprojects' ), 'btn btn--leaf' );
m4c_close();
m4c_close();
m4c_close( 'section' );

/* ───────────── ABOUT ───────────── */
m4c_open( 'section about', 'section', 'about' );
m4c_open( 'container about-grid' );
m4c_open( 'about-text' );
m4c_i18n( '/ About', '/ Über uns', 'p', 'label label--green' );
m4c_i18n( 'Predicting energy and performance — from chip to network level.', 'Energie und Performance vorhersagen – von der Chip- bis zur Netzwerkebene.', 'h2', 'heading' );
m4c_i18n(
	'Mod4Comp takes a holistic view of the interaction between hardware and software. Mathematical models predict the energy consumption of complex scientific simulations, so that software and hardware can be developed that need far less energy.',
	'Mod4Comp betrachtet das Zusammenspiel von Hardware und Software ganzheitlich. Mathematische Modelle sagen den Energieverbrauch komplexer wissenschaftlicher Simulationen voraus, damit Software und Hardware entstehen, die deutlich weniger Energie benötigen.',
	'p',
	'lead'
);
m4c_button( 'Our mission  →', 'Unsere Mission  →', home_url( '/mission/' ), 'btn btn--green' );
m4c_close();
m4c_image( 'images/about.jpg', 'about-img' );
m4c_close();

m4c_open( 'container metrics' );
foreach ( array(
	array( '7', 'Subprojects', 'Teilprojekte', 'green' ),
	array( '3', 'Research institutions', 'Forschungseinrichtungen', 'blue' ),
	array( '4', 'Application domains', 'Anwendungsfelder', 'green' ),
) as $m4c_m ) {
	m4c_open( 'metric' );
	m4c_block( $m4c_m[0], 'p', 'metric-n metric-n--' . $m4c_m[3] );
	m4c_i18n( $m4c_m[1], $m4c_m[2], 'p', 'metric-l' );
	m4c_close();
}
m4c_close();
m4c_close( 'section' );

/* ───────────── TEILPROJEKTE (Karussell) ───────────── */
m4c_open( 'section section--dark subprojects', 'section', 'subprojects' );
m4c_open( 'container sp-head' );
m4c_open( 'sp-head-text' );
m4c_i18n( '/ Subprojects', '/ Teilprojekte', 'p', 'label label--leaf' );
m4c_i18n( 'Get to know our subprojects', 'Lerne unsere Teilprojekte kennen', 'h2', 'heading' );
m4c_i18n( 'Seven subprojects at FAU Erlangen-Nürnberg, TU Dresden and Forschungszentrum Jülich.', 'Sieben Teilprojekte an der FAU Erlangen-Nürnberg, der TU Dresden und dem Forschungszentrum Jülich.', 'p', 'sp-intro' );
m4c_close();
?>
<!-- wp:html {"metadata":{"name":"Karussell-Steuerung (nicht bearbeiten)"},"lock":{"move":true,"remove":true}} -->
<div class="sp-controls">
	<button type="button" class="sp-btn glass" data-sp="prev" aria-label="Previous subprojects">←</button>
	<button type="button" class="sp-btn glass" data-sp="pause" aria-label="Pause carousel" aria-pressed="false"><span class="sp-pause-icon" aria-hidden="true"></span></button>
	<button type="button" class="sp-btn glass" data-sp="next" aria-label="Next subprojects">→</button>
</div>
<!-- /wp:html -->
<?php
m4c_close();

m4c_open( 'sp-carousel' );
m4c_open( 'sp-track' );
foreach ( m4c_subprojects() as $m4c_n => $m4c_sp ) {
	m4c_open( 'sp-card' );
	m4c_open( 'sp-card-inner' );

	m4c_open( 'sp-face sp-front glass' );
	m4c_image( 'images/sp/sp' . $m4c_n . '.jpg', 'sp-img' );
	m4c_block( 'SP' . $m4c_n, 'p', 'sp-id' );
	m4c_i18n( $m4c_sp['title'][0], $m4c_sp['title'][1], 'h3', 'sp-title' );
	m4c_close();

	m4c_open( 'sp-face sp-back glass' );
	m4c_block( 'SP' . $m4c_n . '  ·  ' . $m4c_sp['inst'], 'p', 'sp-id' );
	m4c_i18n( $m4c_sp['title'][0], $m4c_sp['title'][1], 'h3', 'sp-title' );
	m4c_i18n( $m4c_sp['short'][0], $m4c_sp['short'][1], 'p', 'sp-short' );
	m4c_button( 'Learn more  →', 'Mehr erfahren  →', m4c_subproject_url( $m4c_n ), 'sp-more' );
	m4c_close();

	m4c_close();
	m4c_close();
}
m4c_close();
m4c_close();

m4c_open( 'container sp-foot' );
?>
<!-- wp:html {"metadata":{"name":"Karussell-Fortschritt (nicht bearbeiten)"},"lock":{"move":true,"remove":true}} -->
<div class="sp-progress" aria-hidden="true"><span></span></div>
<!-- /wp:html -->
<?php
m4c_button( 'All subprojects  →', 'Alle Teilprojekte  →', home_url( '/subprojects/' ), 'btn-link' );
m4c_close();
m4c_close( 'section' );
