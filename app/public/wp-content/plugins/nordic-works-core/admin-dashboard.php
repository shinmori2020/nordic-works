<?php
/**
 * Nordic Works - 編集者向けダッシュボード拡張
 *
 * WP 管理画面のトップ（ダッシュボード）に Nordic Works プロジェクト
 * 専用のウィジェットを4つ追加する:
 *
 *  1. コンテンツ概況       — CPT 別の publish/draft/future 件数
 *  2. フロント接続ステータス — Next.js の到達可否
 *  3. Revalidate 履歴       — 直近5件の webhook 実行結果
 *  4. クイックリンク         — 本番サイト / 各CPT編集 / プレビュー
 *
 * Revalidate 履歴は wp_options に array で保存（最大20件保持）。
 * 大量データではないので別テーブルは作らない。
 */

defined( 'ABSPATH' ) || exit;

const NORDIC_REVALIDATE_LOG_OPTION = 'nordic_revalidate_log';
const NORDIC_REVALIDATE_LOG_MAX    = 20;

// ===========================================================================
// 1. ウィジェット登録
// ===========================================================================

add_action( 'wp_dashboard_setup', 'nordic_register_dashboard_widgets' );

function nordic_register_dashboard_widgets() {
	wp_add_dashboard_widget(
		'nordic_content_overview',
		'📊 コンテンツ概況 (Nordic Works)',
		'nordic_widget_content_overview'
	);
	wp_add_dashboard_widget(
		'nordic_frontend_health',
		'🌐 フロントエンド接続ステータス',
		'nordic_widget_frontend_health'
	);
	wp_add_dashboard_widget(
		'nordic_revalidate_log',
		'♻️ Revalidate 直近履歴',
		'nordic_widget_revalidate_log'
	);
	wp_add_dashboard_widget(
		'nordic_quick_links',
		'🔗 クイックリンク',
		'nordic_widget_quick_links'
	);
}

// ===========================================================================
// 2. コンテンツ概況ウィジェット
// ===========================================================================

function nordic_widget_content_overview() {
	$types = array(
		'post'           => '記事 (Insights)',
		'service'        => 'サービス',
		'career'         => '採用',
		'feature'        => '特集',
		'author_profile' => '著者',
		'case_study'     => '導入事例',
	);

	echo '<table class="widefat striped" style="border:0;">';
	echo '<thead><tr><th style="width:40%;">CPT</th><th>公開</th><th>下書き</th><th>予約</th></tr></thead><tbody>';

	foreach ( $types as $type => $label ) {
		$counts = wp_count_posts( $type );
		printf(
			'<tr><td><strong>%s</strong></td><td>%d</td><td>%s</td><td>%s</td></tr>',
			esc_html( $label ),
			(int) ( $counts->publish ?? 0 ),
			(int) ( $counts->draft ?? 0 ) > 0
				? sprintf(
					'<a href="%s">%d</a>',
					esc_url( admin_url( "edit.php?post_status=draft&post_type=$type" ) ),
					(int) $counts->draft
				)
				: '0',
			(int) ( $counts->future ?? 0 ) > 0
				? sprintf(
					'<a href="%s">%d</a>',
					esc_url( admin_url( "edit.php?post_status=future&post_type=$type" ) ),
					(int) $counts->future
				)
				: '0'
		);
	}
	echo '</tbody></table>';

	echo '<p style="margin-top:1em;color:#666;font-size:12px;">下書き / 予約の数字をクリックすると該当一覧へジャンプします。</p>';
}

// ===========================================================================
// 3. フロントエンド接続ステータスウィジェット
// ===========================================================================

function nordic_widget_frontend_health() {
	$frontend_url = defined( 'NORDIC_FRONTEND_URL' ) ? NORDIC_FRONTEND_URL : '';

	if ( ! $frontend_url ) {
		echo '<p style="color:#d63638;">⚠ NORDIC_FRONTEND_URL が未設定です。</p>';
		echo '<p style="font-size:12px;color:#666;">wp-config.php または plugin で define してください。</p>';
		return;
	}

	echo '<p><strong>Frontend URL:</strong> <code>' . esc_html( $frontend_url ) . '</code></p>';

	// 5秒タイムアウトで HEAD リクエスト
	$response = wp_remote_head(
		$frontend_url,
		array(
			'timeout'     => 5,
			'redirection' => 3,
		)
	);

	if ( is_wp_error( $response ) ) {
		printf(
			'<p style="color:#d63638;">❌ 接続失敗: %s</p>',
			esc_html( $response->get_error_message() )
		);
		echo '<p style="font-size:12px;color:#666;">Next.js dev server が起動していない可能性があります（ローカル時）。</p>';
		return;
	}

	$code = wp_remote_retrieve_response_code( $response );
	if ( $code >= 200 && $code < 400 ) {
		printf(
			'<p style="color:#008a20;">✓ 接続OK (HTTP %d)</p>',
			(int) $code
		);
	} else {
		printf(
			'<p style="color:#d63638;">⚠ 異常応答: HTTP %d</p>',
			(int) $code
		);
	}

	// Revalidate API への secret 設定状況
	if ( defined( 'NORDIC_REVALIDATE_SECRET' ) && NORDIC_REVALIDATE_SECRET ) {
		echo '<p style="font-size:12px;color:#666;">Revalidate secret: ✓ 設定済</p>';
	} else {
		echo '<p style="font-size:12px;color:#d63638;">Revalidate secret: ❌ 未設定</p>';
	}

	if ( defined( 'NORDIC_PREVIEW_SECRET' ) && NORDIC_PREVIEW_SECRET ) {
		echo '<p style="font-size:12px;color:#666;">Preview secret: ✓ 設定済</p>';
	} else {
		echo '<p style="font-size:12px;color:#d63638;">Preview secret: ❌ 未設定</p>';
	}
}

// ===========================================================================
// 4. Revalidate 履歴ウィジェット
// ===========================================================================

function nordic_widget_revalidate_log() {
	$log = get_option( NORDIC_REVALIDATE_LOG_OPTION, array() );

	if ( empty( $log ) ) {
		echo '<p style="color:#666;">まだ revalidate の実行履歴がありません。</p>';
		echo '<p style="font-size:12px;color:#666;">記事を公開・更新すると save_post フックで自動的に記録されます。</p>';
		return;
	}

	echo '<table class="widefat striped" style="border:0;">';
	echo '<thead><tr><th>時刻</th><th>CPT</th><th>Slug</th><th>結果</th></tr></thead><tbody>';

	$recent = array_slice( $log, 0, 5 );
	foreach ( $recent as $entry ) {
		$status_html = $entry['ok']
			? '<span style="color:#008a20;">✓ 成功</span>'
			: '<span style="color:#d63638;">✗ 失敗</span>';
		printf(
			'<tr><td>%s</td><td>%s</td><td><code>%s</code></td><td>%s</td></tr>',
			esc_html( $entry['time'] ),
			esc_html( $entry['post_type'] ),
			esc_html( $entry['slug'] ),
			$status_html
		);
	}
	echo '</tbody></table>';

	if ( count( $log ) > 5 ) {
		printf(
			'<p style="margin-top:0.5em;font-size:12px;color:#666;">… 他 %d 件（最大%d件保持）</p>',
			count( $log ) - 5,
			NORDIC_REVALIDATE_LOG_MAX
		);
	}
}

/**
 * Revalidate ログに1件追加する。nordic_trigger_revalidate から呼ばれる。
 */
function nordic_log_revalidate( $post_type, $slug, $ok, $detail = '' ) {
	$log   = get_option( NORDIC_REVALIDATE_LOG_OPTION, array() );
	$entry = array(
		'time'      => current_time( 'Y-m-d H:i:s' ),
		'post_type' => $post_type,
		'slug'      => $slug,
		'ok'        => (bool) $ok,
		'detail'    => $detail,
	);
	array_unshift( $log, $entry );
	$log = array_slice( $log, 0, NORDIC_REVALIDATE_LOG_MAX );
	update_option( NORDIC_REVALIDATE_LOG_OPTION, $log, false );
}

// ===========================================================================
// 5. クイックリンクウィジェット
// ===========================================================================

function nordic_widget_quick_links() {
	$frontend_url = defined( 'NORDIC_FRONTEND_URL' ) ? NORDIC_FRONTEND_URL : '';

	echo '<ul style="margin:0;padding-left:1.2em;line-height:1.8;">';

	if ( $frontend_url ) {
		printf(
			'<li>🌐 <a href="%s" target="_blank" rel="noopener">本番（または開発）サイトを開く ↗</a></li>',
			esc_url( $frontend_url )
		);
	}

	$cpt_links = array(
		'post'           => '記事を新規作成',
		'service'        => 'サービスを新規作成',
		'career'         => '採用ポジションを新規作成',
		'feature'        => '特集を新規作成',
		'case_study'     => '導入事例を新規作成',
		'author_profile' => '著者を新規作成',
	);

	foreach ( $cpt_links as $type => $label ) {
		printf(
			'<li>📝 <a href="%s">%s</a></li>',
			esc_url( admin_url( "post-new.php?post_type=$type" ) ),
			esc_html( $label )
		);
	}

	echo '</ul>';

	echo '<p style="margin-top:1em;font-size:12px;color:#666;">記事を公開・更新すると、自動的にフロントエンドの該当ページが再生成されます。</p>';
}
