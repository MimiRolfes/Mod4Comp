<?php
/**
 * Mod4Comp Theme.
 *  - inc/blocks.php       Helfer für die Patterns
 *  - inc/subprojects.php  Texte SP1–SP7 (EN/DE)
 *  - patterns/*.php       Inhalte (Startseite, Kopfzeile)
 */

require_once get_template_directory() . '/inc/blocks.php';

function m4c_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'editor-styles' );
	add_editor_style( array( 'style.css', 'editor-style.css' ) );
}
add_action( 'after_setup_theme', 'm4c_setup' );

function m4c_pattern_categories() {
	register_block_pattern_category( 'mod4comp', array( 'label' => 'Mod4Comp' ) );
}
add_action( 'init', 'm4c_pattern_categories' );

function m4c_subprojects() {
	return require get_template_directory() . '/inc/subprojects.php';
}

function m4c_subproject_url( $n ) {
	return home_url( '/subprojects/sp-' . $n . '/' );
}

function m4c_pattern_content( $slug ) {
	$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( $slug );
	return $pattern ? $pattern['content'] : '';
}

/**
 * Legt Startseite, "Subprojects" und SP1–SP7 an (nur was fehlt). Läuft nicht
 * automatisch (Vorgabe RRZE), sondern per Button unter Design → Themes
 * oder `wp eval 'm4c_seed_content();'`.
 */
function m4c_seed_content() {
	if ( ! get_page_by_path( 'home' ) ) {
		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'home', 'post_title' => 'Home', 'post_content' => m4c_pattern_content( 'mod4comp/home' ) ) );
	}
	$parent = get_page_by_path( 'subprojects' );
	if ( ! $parent ) {
		$id     = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'subprojects', 'post_title' => 'Subprojects' ) );
		$parent = get_post( $id );
	}
	foreach ( m4c_subprojects() as $n => $sp ) {
		if ( get_page_by_path( 'subprojects/sp-' . $n ) ) {
			continue;
		}
		wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => 'sp-' . $n, 'post_parent' => $parent->ID, 'menu_order' => $n, 'post_title' => 'SP' . $n . ': ' . $sp['title'][0] ) );
	}
	$home = get_page_by_path( 'home' );
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $home->ID );
}

function m4c_seed_notice() {
	if ( 'themes' !== get_current_screen()->id || ! current_user_can( 'publish_pages' ) || get_page_by_path( 'home' ) ) {
		return;
	}
	$url = wp_nonce_url( admin_url( 'admin-post.php?action=m4c_seed' ), 'm4c_seed' );
	echo '<div class="notice notice-info"><p>Mod4Comp: Startseite und Teilprojekt-Seiten aus den Vorlagen anlegen. <a class="button" href="' . esc_url( $url ) . '">Create pages</a></p></div>';
}
add_action( 'admin_notices', 'm4c_seed_notice' );

function m4c_seed_action() {
	check_admin_referer( 'm4c_seed' );
	if ( current_user_can( 'publish_pages' ) ) {
		m4c_seed_content();
	}
	wp_safe_redirect( admin_url( 'edit.php?post_type=page' ) );
	exit;
}
add_action( 'admin_post_m4c_seed', 'm4c_seed_action' );

/** Sprache vor dem ersten Rendern setzen, damit nichts aufblitzt. Standard: Englisch. */
function m4c_lang_flash_guard() {
	echo "<script>(function(){var l='en';try{if(localStorage.getItem('m4c-lang')==='de'){l='de';}}catch(e){}document.documentElement.setAttribute('data-lang',l);})();</script>\n";
}
add_action( 'wp_head', 'm4c_lang_flash_guard', 0 );

function m4c_script_url( $name ) {
	$min = get_template_directory() . '/js/' . $name . '.min.js';
	return get_template_directory_uri() . ( file_exists( $min ) ? '/js/' . $name . '.min.js' : '/js/src/' . $name . '.js' );
}

/** Karussell-Skript nur laden, wo ein Karussell ist (FAU: nur laden, wo benötigt). */
function m4c_enqueue_features( $content ) {
	if ( false !== strpos( $content, 'sp-carousel' ) ) {
		wp_enqueue_script( 'm4c-carousel', m4c_script_url( 'carousel' ), array(), wp_get_theme()->get( 'Version' ), true );
	}
	return $content;
}
add_filter( 'render_block', 'm4c_enqueue_features', 20 );

function m4c_enqueue_assets() {
	wp_enqueue_style( 'm4c-style', get_stylesheet_uri(), array(), (string) filemtime( get_stylesheet_directory() . '/style.css' ) );
	wp_enqueue_script( 'm4c-script', m4c_script_url( 'mod4comp' ), array(), wp_get_theme()->get( 'Version' ), true );
}
add_action( 'wp_enqueue_scripts', 'm4c_enqueue_assets' );
