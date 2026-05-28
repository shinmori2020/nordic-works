<?php
/**
 * Nordic Works — 全コンテンツ大幅増量 seeder（オーケストレーター）
 *
 * 既存28記事の本文を 1.5〜2k文字に拡充し、さらに新規15記事を追加。
 * services/careers/features/authors の本文・ACFも厚みを持たせる。
 *
 * Usage:
 *   wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-expand/main.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	$wp_load = dirname( __FILE__, 6 ) . '/wp-load.php';
	if ( file_exists( $wp_load ) ) {
		require_once $wp_load;
	} else {
		die( "wp-load.php が見つかりません。\n" );
	}
}

if ( ! function_exists( 'media_sideload_image' ) ) {
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
}

if ( ! function_exists( 'update_field' ) ) {
	die( "ACF が有効化されていません。\n" );
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function nx_log( $msg ) {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::log( $msg );
	} else {
		echo $msg . "\n";
	}
}

function nx_find_post( $slug, $type = 'post' ) {
	$posts = get_posts(
		array(
			'name'        => $slug,
			'post_type'   => $type,
			'post_status' => 'any',
			'numberposts' => 1,
		)
	);
	return $posts ? $posts[0] : null;
}

function nx_set_terms( $post_id, $names, $taxonomy ) {
	$ids = array();
	foreach ( $names as $name ) {
		$term = get_term_by( 'name', $name, $taxonomy );
		if ( $term ) {
			$ids[] = (int) $term->term_id;
		}
	}
	if ( $ids ) {
		wp_set_object_terms( $post_id, $ids, $taxonomy );
	}
}

function nx_author_id( $slug ) {
	$p = nx_find_post( $slug, 'author_profile' );
	return $p ? $p->ID : 0;
}

function nx_attach_image( $seed, $post_id, $description = '' ) {
	if ( get_post_thumbnail_id( $post_id ) ) {
		return get_post_thumbnail_id( $post_id );
	}
	$url = "https://picsum.photos/seed/{$seed}/1600/900.jpg";
	$id  = media_sideload_image( $url, $post_id, $description, 'id' );
	if ( is_wp_error( $id ) ) {
		nx_log( "    ⚠ image: " . $id->get_error_message() );
		return null;
	}
	set_post_thumbnail( $post_id, $id );
	return $id;
}

/**
 * 既存記事の content/excerpt を上書きする。slug で検索し、見つかれば更新。
 * タクソノミー・アイキャッチ・著者は変更しない（既存を尊重）。
 */
function nx_update_post_content( $slug, $excerpt, $content ) {
	$p = nx_find_post( $slug, 'post' );
	if ( ! $p ) {
		nx_log( "    ⚠ not found: $slug" );
		return null;
	}
	wp_update_post(
		array(
			'ID'           => $p->ID,
			'post_excerpt' => $excerpt,
			'post_content' => $content,
		)
	);
	nx_log( "    ✎ updated [$slug]" );
	return $p->ID;
}

/**
 * 新規記事を作成。既存なら content だけ上書き。
 */
function nx_create_or_update_post( $slug, $data ) {
	$existing = nx_find_post( $slug, 'post' );
	if ( $existing ) {
		wp_update_post(
			array(
				'ID'           => $existing->ID,
				'post_excerpt' => $data['excerpt'],
				'post_content' => $data['content'],
			)
		);
		$post_id = $existing->ID;
		nx_log( "    ✎ updated [$slug]" );
	} else {
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_author'  => 1,
				'post_title'   => $data['title'],
				'post_name'    => $slug,
				'post_excerpt' => $data['excerpt'],
				'post_content' => $data['content'],
			)
		);
		if ( is_wp_error( $post_id ) ) {
			nx_log( "    ⚠ create failed: $slug" );
			return null;
		}
		nx_log( "    + post    [$slug]" );
		nx_attach_image( $data['image_seed'], $post_id, $data['title'] );
		nx_set_terms( $post_id, $data['industries'], 'industry' );
		nx_set_terms( $post_id, $data['topics'], 'topic' );
		nx_set_terms( $post_id, $data['reading_level'], 'reading_level' );
		update_field( 'reading_time', $data['reading_time'], $post_id );
		update_field( 'featured_image_caption', $data['caption'], $post_id );
		$aid = nx_author_id( $data['author'] );
		if ( $aid ) {
			update_field( 'author_profile', $aid, $post_id );
		}
	}
	return $post_id;
}

// -----------------------------------------------------------------------------
// EXECUTION
// -----------------------------------------------------------------------------

$base = __DIR__;

nx_log( '' );
nx_log( '========================================' );
nx_log( ' Nordic Works Content Expansion' );
nx_log( '========================================' );

nx_log( '' );
nx_log( '[1/4] Updating existing 28 posts (batch 1: 1-14)...' );
require $base . '/posts-update-1.php';

nx_log( '' );
nx_log( '[2/4] Updating existing 28 posts (batch 2: 15-28)...' );
require $base . '/posts-update-2.php';

nx_log( '' );
nx_log( '[3/4] Creating 15 new posts...' );
require $base . '/posts-new.php';

nx_log( '' );
nx_log( '[4/4] Updating services / careers / features / authors...' );
require $base . '/cpts.php';

nx_log( '' );
nx_log( '✨ All expansion done.' );
