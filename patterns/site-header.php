<?php
/**
 * Title: Site Header
 * Slug: mod4comp/site-header
 * Categories: mod4comp
 * Inserter: no
 *
 * Glas-Leiste [MOD4COMP | +] mit aufklappendem Menü (wie im Satellite-Theme),
 * Sprachumschalter separat oben rechts. Menüpunkte sind normale Absätze mit
 * Link (je Sprache einer). Nur die zwei Bedienelemente sind "Eigenes HTML".
 */
$m4c_menu = array(
	array( '/', 'Home', 'Start' ),
	array( '/mission/', 'Mission', 'Mission' ),
	array( '/subprojects/', 'Subprojects', 'Teilprojekte' ),
	array( '/publications/', 'Publications', 'Publikationen' ),
	array( '/news/', 'News', 'Neuigkeiten' ),
	array( '/contact/', 'Contact', 'Kontakt' ),
);

m4c_open( 'site-nav', 'nav' );

m4c_open( 'nav-bar glass' );
?>
<!-- wp:site-title {"level":0,"className":"nav-logo"} /-->

<!-- wp:html {"metadata":{"name":"Menü-Knopf (nicht bearbeiten)"},"lock":{"move":true,"remove":true}} -->
<button type="button" class="nav-plus" id="nav-toggle" aria-expanded="false" aria-controls="nav-dropdown" aria-label="Menu"><span class="nav-plus-icon" aria-hidden="true">+</span></button>
<!-- /wp:html -->

<?php
m4c_close();

m4c_open( 'nav-dropdown glass', 'div', 'nav-dropdown' );
foreach ( $m4c_menu as $m4c_item ) {
	foreach ( array( 'en' => $m4c_item[1], 'de' => $m4c_item[2] ) as $m4c_lang => $m4c_label ) {
		m4c_block( '<a href="' . esc_url( home_url( $m4c_item[0] ) ) . '">' . esc_html( $m4c_label ) . '</a>', 'p', 'lang-' . $m4c_lang );
	}
}
m4c_close();

m4c_close( 'nav' );
?>
<!-- wp:html {"metadata":{"name":"Sprachumschalter (nicht bearbeiten)"},"lock":{"move":true,"remove":true}} -->
<div class="lang-toggle glass" role="group" aria-label="Language / Sprache">
	<button type="button" class="lang-toggle-btn" data-lang="en">EN</button>
	<button type="button" class="lang-toggle-btn" data-lang="de">DE</button>
</div>
<!-- /wp:html -->
