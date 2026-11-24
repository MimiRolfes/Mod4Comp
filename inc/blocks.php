<?php
/**
 * Helfer, die in den Patterns echte Kernblöcke erzeugen (wie im Satellite-Theme).
 * Alles Bearbeitbare ist ein normaler Block. Jeder Text existiert zweimal:
 * Klasse "lang-en" und "lang-de", sichtbar ist die gewählte Sprache.
 */

/** Öffnet einen Gruppen-Block. Mit m4c_close() schließen. */
function m4c_open( $class, $tag = 'div', $anchor = '' ) {
	$attrs = array( 'className' => $class );
	if ( 'div' !== $tag ) {
		$attrs = array( 'tagName' => $tag ) + $attrs;
	}
	if ( $anchor ) {
		$attrs['anchor'] = $anchor;
	}
	$attrs['layout'] = array( 'type' => 'default' );
	echo '<!-- wp:group ' . wp_json_encode( $attrs ) . " -->\n";
	echo '<' . esc_html( $tag ) . ' class="wp-block-group ' . esc_attr( $class ) . '"' . ( $anchor ? ' id="' . esc_attr( $anchor ) . '"' : '' ) . ">\n";
}

function m4c_close( $tag = 'div' ) {
	echo '</' . esc_html( $tag ) . ">\n<!-- /wp:group -->\n\n";
}

/** Ein Text-/Überschriftenblock ohne Sprachpaar ($lang = '' ) oder mit Sprachklasse. */
function m4c_block( $text, $tag = 'p', $class = '' ) {
	$is_heading = (bool) preg_match( '/^h[1-6]$/', $tag );
	$type       = $is_heading ? 'heading' : 'paragraph';
	$level      = $is_heading ? (int) substr( $tag, 1 ) : 0;
	$attrs      = array();
	if ( $level && 2 !== $level ) {
		$attrs['level'] = $level;
	}
	if ( $class ) {
		$attrs['className'] = $class;
	}
	$wrap = trim( ( $is_heading ? 'wp-block-heading ' : '' ) . $class );
	echo "<!-- wp:{$type} " . ( $attrs ? wp_json_encode( $attrs ) . ' ' : '' ) . "-->\n";
	echo '<' . esc_html( $tag ) . ( $wrap ? ' class="' . esc_attr( $wrap ) . '"' : '' ) . '>' . wp_kses_post( $text ) . '</' . esc_html( $tag ) . ">\n";
	echo "<!-- /wp:{$type} -->\n\n";
}

/** Text in beiden Sprachen (EN-Block, dann DE-Block). */
function m4c_i18n( $en, $de, $tag = 'p', $class = '' ) {
	m4c_block( $en, $tag, trim( $class . ' lang-en' ) );
	m4c_block( $de, $tag, trim( $class . ' lang-de' ) );
}

/**
 * Bild-Block. Fehlt die Datei (Moodboard-Bilder mit ungeklärter Lizenz sind
 * nicht im Repo, siehe .gitignore), entsteht ein leerer Platzhalter, den man
 * im Editor per Mediathek füllt.
 */
function m4c_image( $rel, $class, $alt = '' ) {
	$has = file_exists( get_template_directory() . '/' . $rel );
	echo '<!-- wp:image ' . wp_json_encode( array( 'className' => $class ) ) . " -->\n";
	echo '<figure class="wp-block-image ' . esc_attr( $class ) . '"><img' . ( $has ? ' src="' . esc_url( get_template_directory_uri() . '/' . $rel ) . '"' : '' ) . ' alt="' . esc_attr( $alt ) . "\"/></figure>\n";
	echo "<!-- /wp:image -->\n\n";
}

/** Button (Link) in beiden Sprachen. */
function m4c_button( $en, $de, $url, $class = '' ) {
	echo '<!-- wp:buttons ' . ( $class ? wp_json_encode( array( 'className' => $class ) ) . ' ' : '' ) . "-->\n";
	echo '<div class="wp-block-buttons' . ( $class ? ' ' . esc_attr( $class ) : '' ) . "\">\n";
	foreach ( array( 'en' => $en, 'de' => $de ) as $lang => $label ) {
		echo '<!-- wp:button ' . wp_json_encode( array( 'className' => 'lang-' . $lang ) ) . " -->\n";
		echo '<div class="wp-block-button lang-' . $lang . '"><a class="wp-block-button__link wp-element-button" href="' . esc_url( $url ) . '">' . esc_html( $label ) . "</a></div>\n";
		echo "<!-- /wp:button -->\n\n";
	}
	echo "</div>\n<!-- /wp:buttons -->\n\n";
}

/** Setzt beim Ausgeben aus "lang-en"/"lang-de" das lang-Attribut (Screenreader). */
function m4c_add_lang_attribute( $content ) {
	if ( false === strpos( $content, 'lang-' ) || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
		return $content;
	}
	$p = new WP_HTML_Tag_Processor( $content );
	if ( $p->next_tag() && preg_match( '/(?:^|\s)lang-(en|de)(?:\s|$)/', (string) $p->get_attribute( 'class' ), $m ) ) {
		$p->set_attribute( 'lang', $m[1] );
	}
	return $p->get_updated_html();
}
add_filter( 'render_block', 'm4c_add_lang_attribute', 10 );
