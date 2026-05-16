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
