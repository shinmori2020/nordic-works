<?php
/**
 * Plugin Name:       Nordic Works Core
 * Description:       Nordic Works プロジェクトのカスタム投稿タイプとタクソノミーを登録するコアプラグイン。
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            Nordic Works
 * License:           GPL-2.0-or-later
 * Text Domain:       nordic-works-core
 */

defined( 'ABSPATH' ) || exit;

/**
 * ACF Local JSON の保存先をプラグイン内 acf-json/ に変更する。
 * フィールドグループを管理画面で保存すると、自動でこのフォルダにJSONが書き出される。
 */
function nordic_acf_json_save_point( $path ) {
	return __DIR__ . '/acf-json';
}
add_filter( 'acf/settings/save_json', 'nordic_acf_json_save_point' );

/**
 * ACF Local JSON の読み込み元としてプラグイン内 acf-json/ を追加する。
 * これによりプラグイン同梱のフィールド定義が管理画面に自動反映される。
 */
function nordic_acf_json_load_point( $paths ) {
	$paths[] = __DIR__ . '/acf-json';
	return $paths;
}
add_filter( 'acf/settings/load_json', 'nordic_acf_json_load_point' );

/**
 * カスタム投稿タイプを登録する。
 */
function nordic_register_post_types() {
	// サービス
	register_post_type(
		'service',
		array(
			'labels'              => array(
				'name'          => 'サービス',
				'singular_name' => 'サービス',
				'menu_name'     => 'サービス',
				'add_new_item'  => '新規サービスを追加',
				'edit_item'     => 'サービスを編集',
				'all_items'     => 'サービス一覧',
			),
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'service',
			'graphql_plural_name' => 'services',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'revisions' ),
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'services' ),
			'menu_icon'           => 'dashicons-products',
		)
	);

	// 採用情報
	register_post_type(
		'career',
		array(
			'labels'              => array(
				'name'          => '採用情報',
				'singular_name' => '採用情報',
				'menu_name'     => '採用情報',
				'add_new_item'  => '新規ポジションを追加',
				'edit_item'     => 'ポジションを編集',
				'all_items'     => '採用情報一覧',
			),
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'career',
			'graphql_plural_name' => 'careers',
			'supports'            => array( 'title', 'editor', 'custom-fields', 'revisions' ),
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'careers' ),
			'menu_icon'           => 'dashicons-businessperson',
		)
	);

	// 特集
	register_post_type(
		'feature',
		array(
			'labels'              => array(
				'name'          => '特集',
				'singular_name' => '特集',
				'menu_name'     => '特集',
				'add_new_item'  => '新規特集を追加',
				'edit_item'     => '特集を編集',
				'all_items'     => '特集一覧',
			),
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'feature',
			'graphql_plural_name' => 'features',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields', 'revisions' ),
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'features' ),
			'menu_icon'           => 'dashicons-star-filled',
		)
	);

	// 著者プロフィール
	register_post_type(
		'author_profile',
		array(
			'labels'              => array(
				'name'          => '著者',
				'singular_name' => '著者',
				'menu_name'     => '著者',
				'add_new_item'  => '新規著者を追加',
				'edit_item'     => '著者を編集',
				'all_items'     => '著者一覧',
			),
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'authorProfile',
			'graphql_plural_name' => 'authorProfiles',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'authors' ),
			'menu_icon'           => 'dashicons-admin-users',
		)
	);
}
add_action( 'init', 'nordic_register_post_types' );

/**
 * カスタムタクソノミーを登録する。
 */
function nordic_register_taxonomies() {
	// 業界
	register_taxonomy(
		'industry',
		array( 'post', 'feature' ),
		array(
			'labels'              => array(
				'name'          => '業界',
				'singular_name' => '業界',
				'menu_name'     => '業界',
			),
			'hierarchical'        => true,
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'industry',
			'graphql_plural_name' => 'industries',
			'rewrite'             => array( 'slug' => 'industry' ),
		)
	);

	// トピック
	register_taxonomy(
		'topic',
		array( 'post', 'feature' ),
		array(
			'labels'              => array(
				'name'          => 'トピック',
				'singular_name' => 'トピック',
				'menu_name'     => 'トピック',
			),
			'hierarchical'        => false,
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'topic',
			'graphql_plural_name' => 'topics',
			'rewrite'             => array( 'slug' => 'topic' ),
		)
	);

	// 読者レベル
	register_taxonomy(
		'reading_level',
		array( 'post' ),
		array(
			'labels'              => array(
				'name'          => '読者レベル',
				'singular_name' => '読者レベル',
				'menu_name'     => '読者レベル',
			),
			'hierarchical'        => false,
			'public'              => true,
			'show_in_rest'        => true,
			'show_in_graphql'     => true,
			'graphql_single_name' => 'readingLevel',
			'graphql_plural_name' => 'readingLevels',
			'rewrite'             => array( 'slug' => 'level' ),
		)
	);
}
add_action( 'init', 'nordic_register_taxonomies' );

/* =============================================================================
 * Headless 連携設定（プレビュー / On-demand Revalidation）
 *
 * 注: secret と frontend URL は Next.js 側 web/.env.local と一致させること。
 *     本プロジェクトはローカル運用前提のため、開発用 secret を直書きしている。
 *     本番運用時は wp-config.php の定数や環境変数から読む構成に変更する。
 * ---------------------------------------------------------------------------*/

if ( ! defined( 'NORDIC_FRONTEND_URL' ) ) {
	define( 'NORDIC_FRONTEND_URL', 'http://localhost:3000' );
}
if ( ! defined( 'NORDIC_PREVIEW_SECRET' ) ) {
	define( 'NORDIC_PREVIEW_SECRET', 'local-dev-preview-secret-change-me' );
}
if ( ! defined( 'NORDIC_REVALIDATE_SECRET' ) ) {
	define( 'NORDIC_REVALIDATE_SECRET', 'local-dev-revalidate-secret-change-me' );
}

/**
 * 対象 CPT / 投稿のフロントエンドリンクを Next.js のURLに書き換える。
 *
 * - 公開済み: `<frontend>/<base>/<slug>` （フロント公開URL）
 * - 下書き等: `<frontend>/api/preview?secret&id&slug&type` （プレビューAPI経由）
 *
 * post_link / post_type_link / preview_post_link の3つにかけることで、
 * クラシックエディタ・ブロックエディタ・REST API のいずれの経路でも
 * フロントエンドへ向くようにする。
 */
function nordic_frontend_link( $url, $post ) {
	$type_paths = array(
		'post'           => '/articles',
		'service'        => '/services',
		'career'         => '/careers',
		'feature'        => '/features',
		'author_profile' => '/authors',
	);
	if ( ! isset( $type_paths[ $post->post_type ] ) ) {
		return $url;
	}

	$base = $type_paths[ $post->post_type ];
	$slug = (string) $post->post_name;

	// 公開済みかつ slug がある場合はフロント公開URLへ
	if ( 'publish' === $post->post_status && '' !== $slug ) {
		return NORDIC_FRONTEND_URL . $base . '/' . $slug;
	}

	// それ以外（下書き等）はプレビューAPIへ。slug が空でも id で解決できる。
	return sprintf(
		'%s/api/preview?secret=%s&id=%d&slug=%s&type=%s',
		NORDIC_FRONTEND_URL,
		rawurlencode( NORDIC_PREVIEW_SECRET ),
		(int) $post->ID,
		rawurlencode( $slug ),
		rawurlencode( $post->post_type )
	);
}
add_filter( 'post_link', 'nordic_frontend_link', 10, 2 );
add_filter( 'post_type_link', 'nordic_frontend_link', 10, 2 );
add_filter( 'preview_post_link', 'nordic_frontend_link', 10, 2 );

/**
 * 下書きにも slug を自動付与する。
 *
 * WP のデフォルトでは下書きの post_name は空のことが多いが、
 * Headless プレビューでは slug を URL に使うため空だと困る。
 * タイトルから生成し、サニタイズで空になるなら id ベースで仮 slug を入れる。
 */
function nordic_force_draft_slug( $data, $postarr ) {
	$skip_statuses = array( 'auto-draft', 'inherit', 'trash' );
	if ( ! empty( $data['post_name'] ) || in_array( $data['post_status'], $skip_statuses, true ) ) {
		return $data;
	}
	$allowed_types = array( 'post', 'service', 'career', 'feature', 'author_profile' );
	if ( ! in_array( $data['post_type'], $allowed_types, true ) ) {
		return $data;
	}
	$slug = sanitize_title( $data['post_title'] );
	if ( '' === $slug ) {
		$slug = 'draft-' . ( isset( $postarr['ID'] ) ? (int) $postarr['ID'] : time() );
	}
	$data['post_name'] = $slug;
	return $data;
}
add_filter( 'wp_insert_post_data', 'nordic_force_draft_slug', 10, 2 );

/**
 * 公開・更新時に Next.js の /api/revalidate を叩いて該当ページのキャッシュを再検証する。
 */
function nordic_trigger_revalidate( $post_id ) {
	// 自動保存・リビジョンは除外
	if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
		return;
	}

	$post = get_post( $post_id );
	if ( ! $post || 'publish' !== $post->post_status ) {
		return;
	}

	$allowed_types = array( 'post', 'service', 'career', 'feature', 'author_profile' );
	if ( ! in_array( $post->post_type, $allowed_types, true ) ) {
		return;
	}

	wp_remote_post(
		NORDIC_FRONTEND_URL . '/api/revalidate',
		array(
			'headers'  => array(
				'Content-Type'        => 'application/json',
				'X-Revalidate-Secret' => NORDIC_REVALIDATE_SECRET,
			),
			'body'     => wp_json_encode(
				array(
					'postType' => $post->post_type,
					'slug'     => $post->post_name,
				)
			),
			'blocking' => false, // 非同期で投げて待たない
			'timeout'  => 5,
		)
	);
}
add_action( 'save_post', 'nordic_trigger_revalidate' );
add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( 'publish' === $new_status || 'publish' === $old_status ) {
			nordic_trigger_revalidate( $post->ID );
		}
	},
	10,
	3
);
