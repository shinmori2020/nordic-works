<?php
/**
 * Nordic Works - 導入事例 (case_study) Seeder
 *
 * サンプル4件の導入事例を投入する。
 * 既存データは slug で判定してスキップする（idempotent）。
 *
 * Usage:
 *   Local の Site Shell で
 *     wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-case-studies.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	$wp_load = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load ) ) {
		require_once $wp_load;
	} else {
		die( "wp-load.php が見つかりません。WP-CLI 経由で実行してください:\n" );
	}
}

if ( ! function_exists( 'update_field' ) ) {
	die( "ACF が有効化されていません。\n" );
}

function ncs_log( $msg ) {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::log( $msg );
	} else {
		echo $msg . "\n";
	}
}

function ncs_find_post( $slug, $post_type = 'case_study' ) {
	$posts = get_posts(
		array(
			'name'        => $slug,
			'post_type'   => $post_type,
			'post_status' => 'any',
			'numberposts' => 1,
		)
	);
	return $posts ? $posts[0] : null;
}

/** 業界タームを取得 or 作成。term_id を返す */
function ncs_get_or_create_industry( $name ) {
	$term = get_term_by( 'name', $name, 'industry' );
	if ( $term ) {
		return $term->term_id;
	}
	$result = wp_insert_term( $name, 'industry' );
	if ( is_wp_error( $result ) ) {
		return null;
	}
	return $result['term_id'];
}

/** 既存サービスを slug から探す（related_services 紐付け用） */
function ncs_find_service_id( $slug ) {
	$post = get_posts(
		array(
			'name'        => $slug,
			'post_type'   => 'service',
			'post_status' => 'any',
			'numberposts' => 1,
		)
	);
	return $post ? $post[0]->ID : null;
}

// ===========================================================================
// CASE STUDIES DATA
// ===========================================================================

$case_studies = array(
	array(
		'slug'    => 'saas-startup-retention-turnaround',
		'title'   => 'SaaSスタートアップが離職率を3年で12%→4%に改善した事例',
		'content' => "急成長フェーズに入ったクライアントは、エンジニア離職率が業界平均を大きく上回り、採用コストが膨張していました。Nordic Works は組織診断・1on1運用刷新・心理的安全性スコアの月次計測を導入し、3年間でエンジニア離職率を約3分の1に圧縮しました。\n\nプロジェクト初期の3ヶ月は徹底した「現状の可視化」に時間を割き、表層的な施策ではなく構造的な問題（評価フィードバックの不在・キャリア面談の形骸化）を特定したことが転換点となりました。",
		'acf'     => array(
			'client_name'        => 'Acme SaaS 株式会社（架空）',
			'client_industry'    => 'B2B SaaS',
			'company_size'       => '従業員150名',
			'subtitle'           => '1on1運用の刷新と心理的安全性の月次計測で、3年で離職率1/3に',
			'challenge'          => "エンジニアの離職率が業界平均の2倍に達しており、採用予算が EBITDA を圧迫していました。離職者へのアンケートでは「キャリア展望が見えない」「上長との対話が形骸化している」という声が多く、構造的な原因が疑われる状態でした。",
			'solution'           => "Nordic Works は最初の3ヶ月で組織診断（全社アンケート + 1on1ロールプレイ観察）を実施し、1on1の「キャリア・成果・関係性」の3軸に分けたフレームを導入。さらに心理的安全性スコアを月次計測する仕組みを CTO 直轄で立ち上げました。",
			'outcomes'           => "離職率 | 12% → 4% | 3年間で\n採用コスト | 年間8,400万円削減 | 退職補填の削減効果\n心理的安全性スコア | 2.8 → 4.1 | 5点満点、全社平均",
			'testimonial_body'   => "「離職率の数字よりも、辞めた人が『辞める前に話せた』と言ってくれることが嬉しい。組織が学習する仕組みになった。」",
			'testimonial_author' => 'CTO 山田太郎（架空）',
			'project_period'     => '2023年4月〜2026年3月（36ヶ月）',
			'related_service_slugs' => array( 'psychsafe-score', 'org-design-lab' ),
		),
		'industries' => array( 'IT / SaaS' ),
	),
	array(
		'slug'    => 'global-manufacturer-hybrid-onboarding',
		'title'   => '大手製造業のハイブリッド勤務オンボーディング設計',
		'content' => "コロナ後にハイブリッド勤務を本格化した製造業大手で、新卒・中途のオンボーディング体験がリモート/出社で分断され、入社90日後のエンゲージメントスコアに有意差が出ていました。Nordic Works は北欧型の「90日プラン」を翻訳的に導入し、両者のスコア差を解消しました。\n\n設計のポイントは「初日体験は対面で固定」「バディ制度はリモート/出社混在」「30/60/90日のチェックインを構造化」の3点でした。",
		'acf'     => array(
			'client_name'        => 'Northland Manufacturing（架空）',
			'client_industry'    => '製造業',
			'company_size'       => '従業員4,500名',
			'subtitle'           => 'リモート/出社で分断していた入社90日体験を、北欧型90日プランで再設計',
			'challenge'          => "ハイブリッド勤務移行後、リモート中心と出社中心の新入社員でエンゲージメントスコアに約30pt の差が生じていました。退職率も同様にリモート組で高く、現場マネージャーは「リモートだと馴染ませにくい」と感じていました。",
			'solution'           => "北欧3社のオンボーディング事例（Spotify / Supercell / Nordnet）を分析し、日本企業向けにアダプトした「90日プラン」を設計。初日のみ全員対面、以降はリモート/出社混在のバディ制度と30/60/90日チェックインを標準化しました。",
			'outcomes'           => "90日後エンゲージメント差 | 30pt → 4pt | リモート/出社の差解消\n新入社員定着率（1年） | 78% → 92% | 入社4年間の平均\nマネージャー研修時間 | 月12h → 月4h | 構造化による効率化",
			'testimonial_body'   => "「『リモート新人をどう育てるか』が個別マネージャーの工夫頼みだったのが、組織として再現可能な型になった。」",
			'testimonial_author' => '人事本部長 佐藤花子（架空）',
			'project_period'     => '2024年6月〜2025年5月（12ヶ月）',
			'related_service_slugs' => array( 'org-design-lab' ),
		),
		'industries' => array( '製造業' ),
	),
	array(
		'slug'    => 'consulting-firm-okr-rollout',
		'title'   => 'コンサルティングファームでの OKR 全社導入',
		'content' => "MBO 中心の運用が形骸化し、上位戦略と現場の日々のタスクが乖離していたコンサルファームで、OKR を全社導入。半年で「戦略→ KR → 日々のタスク」が辿れる組織に転換しました。\n\n注意点は「四半期サイクル疲れ」を起こさないこと。Nordic Works は OKR レビューを軽量化し、月次のチェックインを2週間に1度の15分セッションに置換することで、運用コストを大幅に下げました。",
		'acf'     => array(
			'client_name'        => 'Aurora Consulting Partners（架空）',
			'client_industry'    => 'コンサルティング',
			'company_size'       => '従業員320名',
			'subtitle'           => 'MBO の形骸化を OKR で打破。戦略から日次タスクまでが繋がる組織へ',
			'challenge'          => "MBO の目標が「期初に立てて期末まで触らない」運用になり、上位戦略が日々の意思決定に反映されていませんでした。経営会議では「みんな頑張っているのに数字が動かない」という議論が続いていました。",
			'solution'           => "OKR の設計思想（粒度・サイクル・公開性）を経営合宿で共有した後、上から下に展開。重要なのは「OKR を評価に直結させない」原則で、これにより目標設定が現実的かつ挑戦的になりました。",
			'outcomes'           => "戦略・現場の連動感（自己評価） | 2.4 → 4.0 | 5点満点、全社調査\nKR 達成率 | 平均 62% | 「7割で OK」原則の浸透\nレビュー時間 | 月8h → 月2h | 軽量化により",
			'testimonial_body'   => "「OKR を導入したというより、戦略を語る共通言語が組織に入った感覚です。」",
			'testimonial_author' => 'COO 鈴木一郎（架空）',
			'project_period'     => '2025年1月〜2025年7月（7ヶ月）',
			'related_service_slugs' => array( 'org-design-lab' ),
		),
		'industries' => array( 'コンサルティング' ),
	),
	array(
		'slug'    => 'fintech-remote-diagnosis',
		'title'   => 'FinTech企業のフルリモート文化診断',
		'content' => "創業以来フルリモートで運営してきた FinTech 企業が、社員 200名超の規模になり「以前のような風通しの良さがない」という声が顕在化。リモート文化診断を実施し、4つの構造的問題を特定・改善しました。\n\n特に重要だったのは「Slack 上の沈黙時間」を計測し、組織のサイレントゾーンを可視化したこと。これにより、形だけ存在していた1on1や全社会議の改善ポイントが明確になりました。",
		'acf'     => array(
			'client_name'        => 'Helix Finance（架空）',
			'client_industry'    => 'FinTech',
			'company_size'       => '従業員220名',
			'subtitle'           => '200名超のフルリモート組織で起きた「文化の希薄化」を診断・処方',
			'challenge'          => "創業期から大切にしてきた「率直なフィードバック文化」が、組織拡大に伴い薄れているという経営層の懸念。社員アンケートでも「Slack で発言しにくくなった」「全社会議が儀式化している」という声が増加。",
			'solution'           => "リモート文化診断（Slack ログ分析 + 1on1観察 + フォーカスグループ）を3週間で実施。4つの構造的問題（チャンネル肥大化、リーダーの発言時間占有、フィードバックの非対称性、全社会議の片方向性）を特定し、各々への打ち手を提示しました。",
			'outcomes'           => "Slack 発言者多様性指数 | 0.42 → 0.71 | 上位20%の発言占有率改善\n全社会議満足度 | 2.9 → 4.2 | 5点満点\n1on1で本音が出る感覚 | 51% → 78% | 全社員調査",
			'testimonial_body'   => "「『なんとなく息苦しい』という感覚を、データで言語化してもらえたことが一番の価値でした。」",
			'testimonial_author' => 'CEO 田中健（架空）',
			'project_period'     => '2025年9月〜2025年11月（3ヶ月）',
			'related_service_slugs' => array( 'remote-culture-diagnosis', 'psychsafe-score' ),
		),
		'industries' => array( 'FinTech' ),
	),
);

// ===========================================================================
// SEED
// ===========================================================================

ncs_log( "== Case Study Seeder ==" );

foreach ( $case_studies as $cs ) {
	$existing = ncs_find_post( $cs['slug'] );
	if ( $existing ) {
		ncs_log( "↻ exists [case_study] {$cs['slug']}" );
		$post_id = $existing->ID;
	} else {
		$post_id = wp_insert_post(
			array(
				'post_type'    => 'case_study',
				'post_name'    => $cs['slug'],
				'post_title'   => $cs['title'],
				'post_content' => $cs['content'],
				'post_status'  => 'publish',
			)
		);
		if ( is_wp_error( $post_id ) ) {
			ncs_log( "  ⚠ insert failed: " . $post_id->get_error_message() );
			continue;
		}
		ncs_log( "+ created [case_study] {$cs['slug']}" );
	}

	// 業界タクソノミー
	if ( ! empty( $cs['industries'] ) ) {
		$term_ids = array();
		foreach ( $cs['industries'] as $industry_name ) {
			$tid = ncs_get_or_create_industry( $industry_name );
			if ( $tid ) {
				$term_ids[] = $tid;
			}
		}
		if ( $term_ids ) {
			wp_set_post_terms( $post_id, $term_ids, 'industry', false );
		}
	}

	// ACF フィールド
	if ( ! empty( $cs['acf'] ) ) {
		$acf = $cs['acf'];

		// related_services は slug 配列で渡しているので ID 配列に変換
		if ( ! empty( $acf['related_service_slugs'] ) ) {
			$service_ids = array();
			foreach ( $acf['related_service_slugs'] as $svc_slug ) {
				$sid = ncs_find_service_id( $svc_slug );
				if ( $sid ) {
					$service_ids[] = $sid;
				} else {
					ncs_log( "  ⚠ related service not found: $svc_slug" );
				}
			}
			$acf['related_services'] = $service_ids;
			unset( $acf['related_service_slugs'] );
		}

		foreach ( $acf as $key => $value ) {
			update_field( $key, $value, $post_id );
		}
	}

	ncs_log( "  ✓ ACF + terms set for {$cs['slug']}" );
}

ncs_log( "\n✨ Done. Total: " . count( $case_studies ) . " case studies." );
