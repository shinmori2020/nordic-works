<?php
/**
 * Nordic Works Content Seeder
 *
 * ダミーコンテンツを投入するシーダースクリプト。
 * 既存データはslugで判定してスキップする（idempotent）。
 *
 * Usage:
 *   Local の Site Shell を開いて以下を実行
 *     wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-content.php
 */

// ===========================================================================
// BOOTSTRAP
// ===========================================================================

if ( ! defined( 'ABSPATH' ) ) {
	$wp_load = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load ) ) {
		require_once $wp_load;
	} else {
		die( "wp-load.php が見つかりません。WP-CLI 経由で実行してください:\n  wp eval-file " . __FILE__ . "\n" );
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

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

function nordic_seed_log( $msg ) {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::log( $msg );
	} else {
		echo $msg . "\n";
	}
}

function nordic_seed_get_or_create_term( $name, $taxonomy ) {
	$term = get_term_by( 'name', $name, $taxonomy );
	if ( $term ) {
		return $term->term_id;
	}
	$result = wp_insert_term( $name, $taxonomy );
	if ( is_wp_error( $result ) ) {
		nordic_seed_log( "    ⚠ term failed [$taxonomy] $name: " . $result->get_error_message() );
		return null;
	}
	nordic_seed_log( "    + term  [$taxonomy] $name" );
	return $result['term_id'];
}

function nordic_seed_find_post( $slug, $post_type ) {
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

function nordic_seed_create_post( $args ) {
	$existing = nordic_seed_find_post( $args['post_name'], $args['post_type'] );
	if ( $existing ) {
		nordic_seed_log( "    ↻ exists [{$args['post_type']}] {$args['post_name']}" );
		return $existing->ID;
	}
	$defaults = array(
		'post_status' => 'publish',
		'post_author' => 1,
	);
	$args     = wp_parse_args( $args, $defaults );
	$post_id  = wp_insert_post( $args, true );
	if ( is_wp_error( $post_id ) ) {
		nordic_seed_log( "    ⚠ insert failed: " . $post_id->get_error_message() );
		return null;
	}
	nordic_seed_log( "    + post  [{$args['post_type']}] {$args['post_title']}" );
	return $post_id;
}

function nordic_seed_attach_image( $seed, $post_id, $width = 1600, $height = 900, $description = '' ) {
	if ( get_post_thumbnail_id( $post_id ) ) {
		return get_post_thumbnail_id( $post_id );
	}
	$url           = "https://picsum.photos/seed/{$seed}/{$width}/{$height}.jpg";
	$attachment_id = media_sideload_image( $url, $post_id, $description, 'id' );
	if ( is_wp_error( $attachment_id ) ) {
		nordic_seed_log( "    ⚠ image download failed: " . $attachment_id->get_error_message() );
		return null;
	}
	set_post_thumbnail( $post_id, $attachment_id );
	return $attachment_id;
}

function nordic_seed_set_terms( $post_id, $terms, $taxonomy ) {
	if ( empty( $terms ) ) {
		return;
	}
	$term_ids = array();
	foreach ( $terms as $name ) {
		$term = get_term_by( 'name', $name, $taxonomy );
		if ( $term ) {
			$term_ids[] = (int) $term->term_id;
		}
	}
	if ( $term_ids ) {
		wp_set_object_terms( $post_id, $term_ids, $taxonomy );
	}
}

function nordic_seed_set_acf( $post_id, $fields ) {
	foreach ( $fields as $name => $value ) {
		update_field( $name, $value, $post_id );
	}
}

// ===========================================================================
// DATA: TAXONOMY TERMS
// ===========================================================================

$industries     = array( 'IT / SaaS', '製造業', '小売・EC', 'サービス業', '医療・ヘルスケア', '金融・保険' );
$topics         = array( 'リモートワーク', '心理的安全性', '組織デザイン', '北欧の働き方', '1on1', 'マネジメント', '採用戦略', 'カルチャー' );
$reading_levels = array( '初級', '中級', '上級' );

// ===========================================================================
// DATA: AUTHORS
// ===========================================================================

$authors_data = array(
	'sato-misaki'     => array(
		'title'      => '佐藤 美咲',
		'content'    => '組織開発コンサルタントとして10年以上のキャリア。',
		'image_seed' => 'nordic-author-sato',
		'fields'     => array(
			'position'     => 'シニアコンサルタント',
			'bio'          => "大手SaaS企業のチームビルディング支援に多数携わる。\n心理的安全性に関する執筆多数。",
			'twitter_url'  => 'https://twitter.com/example_sato',
			'linkedin_url' => 'https://linkedin.com/in/example-sato',
			'website_url'  => '',
		),
	),
	'tanaka-kenichi'  => array(
		'title'      => '田中 健一',
		'content'    => '元エンジニアマネージャー、現組織開発リード。',
		'image_seed' => 'nordic-author-tanaka',
		'fields'     => array(
			'position'     => '組織開発リード',
			'bio'          => "スタートアップから大企業まで、職種を問わず1on1とフィードバック設計の導入支援を行う。\nテック組織のマネジメントに関する寄稿多数。",
			'twitter_url'  => 'https://twitter.com/example_tanaka',
			'linkedin_url' => 'https://linkedin.com/in/example-tanaka',
			'website_url'  => '',
		),
	),
	'lindberg-anna'   => array(
		'title'      => 'リンドベリ・アンナ',
		'content'    => 'ストックホルム出身の北欧文化アドバイザー。',
		'image_seed' => 'nordic-author-lindberg',
		'fields'     => array(
			'position'     => '北欧文化アドバイザー',
			'bio'          => "日本のB2B企業に向けて、北欧型の働き方・組織文化を翻訳的に伝える役割を担う。\nスウェーデン語・英語・日本語のトリリンガル。",
			'twitter_url'  => '',
			'linkedin_url' => 'https://linkedin.com/in/example-lindberg',
			'website_url'  => 'https://example.com/anna',
		),
	),
);

// ===========================================================================
// DATA: SERVICES
// ===========================================================================

$services_data = array(
	'psychsafe-score'           => array(
		'title'      => 'PsychSafe Score',
		'image_seed' => 'nordic-service-psychsafe',
		'content'    => "<p>チーム単位の心理的安全性を数値で可視化するクラウドツール。月次サーベイの自動化、組織図上のヒートマップ表示、改善アクションの提案までを一気通貫で提供します。</p><p>導入企業の約78%が、3ヶ月以内に少なくとも1つのチーム指標で改善を観測しています。</p>",
		'fields'     => array(
			'subtitle'         => 'チームの心理的安全性を数値化する',
			'features'         => array(
				array( 'title' => '月次自動サーベイ', 'description' => '匿名性を担保した4軸サーベイを毎月自動配信。回答率向上のためのリマインダーも自動化。' ),
				array( 'title' => '組織図ヒートマップ', 'description' => 'チーム階層を視覚的に表示し、リスクのあるチームを一目で特定。' ),
				array( 'title' => '改善アクション提案', 'description' => 'スコアパターンに応じた具体的な打ち手を、社内ナレッジから自動でレコメンド。' ),
				array( 'title' => 'API・SSO対応', 'description' => 'Slack / Microsoft Teams / Okta / Google Workspace 等の主要ツールと連携可能。' ),
			),
			'pricing_plans'    => array(
				array( 'name' => 'Starter', 'price' => '月額 ¥30,000〜', 'included_features' => "最大50名\n基本サーベイ\nメールサポート" ),
				array( 'name' => 'Growth', 'price' => '月額 ¥80,000〜', 'included_features' => "最大200名\nカスタムサーベイ\n組織図ヒートマップ\nSlack連携" ),
				array( 'name' => 'Enterprise', 'price' => 'お問い合わせ', 'included_features' => "無制限\nSSO\n専任カスタマーサクセス\nSLA保証" ),
			),
			'faq'              => array(
				array( 'question' => '回答は本当に匿名ですか？', 'answer' => 'はい。個別回答は経営層を含む誰にも紐づきません。5名以下のチームは集計対象から除外します。' ),
				array( 'question' => '導入までどのくらいかかりますか？', 'answer' => '最短2週間。SSO連携を含む場合は3〜4週間を目安にしてください。' ),
				array( 'question' => '既存のサーベイツールから乗り換え可能ですか？', 'answer' => 'CSVインポート機能で過去データの引き継ぎが可能です。' ),
			),
			'case_study_links' => array(
				array( 'label' => '株式会社サンプルテック導入事例', 'url' => 'https://example.com/case/sample-tech' ),
				array( 'label' => 'グローバル製造業A社の活用法', 'url' => 'https://example.com/case/global-mfg' ),
			),
			'cta_text'         => '無料デモを予約する',
			'cta_url'          => '/contact?service=psychsafe',
		),
	),
	'remote-culture-diagnosis'  => array(
		'title'      => 'Remote Culture Diagnosis',
		'image_seed' => 'nordic-service-remote',
		'content'    => "<p>リモートワーク・ハイブリッドワーク下でのチーム文化を診断し、運用改善の優先順位を明示する2週間のコンサルティングプログラム。</p><p>独自フレームワーク「Nordic Remote Index」をベースに、ヒアリング・観察・サーベイの3層で組織の実態を可視化します。</p>",
		'fields'     => array(
			'subtitle'         => 'リモート文化の健康診断',
			'features'         => array(
				array( 'title' => '2週間集中プログラム', 'description' => 'キックオフから報告会まで14日間。経営層の意思決定スピードに合わせた設計。' ),
				array( 'title' => 'Nordic Remote Index', 'description' => '北欧企業の運用事例から抽出した32項目の評価軸で組織を診断。' ),
				array( 'title' => '実行ロードマップ', 'description' => '優先度・難易度・期待効果の3軸でアクションを並べた90日プランを提供。' ),
			),
			'pricing_plans'    => array(
				array( 'name' => 'Standard', 'price' => '¥1,200,000', 'included_features' => "従業員数100名まで\n2週間\n報告会1回" ),
				array( 'name' => 'Plus', 'price' => '¥2,400,000', 'included_features' => "従業員数300名まで\n3週間\n中間レビュー1回\n報告会2回" ),
			),
			'faq'              => array(
				array( 'question' => '完全リモートでない組織でも依頼できますか？', 'answer' => 'はい。ハイブリッド型・出社中心型の組織でも、それぞれに合わせた診断軸で対応します。' ),
				array( 'question' => '海外拠点を含む診断は可能ですか？', 'answer' => '英語・スウェーデン語での実施に対応可能です。事前にご相談ください。' ),
			),
			'case_study_links' => array(
				array( 'label' => 'SaaS企業X社の組織変革', 'url' => 'https://example.com/case/saas-x' ),
			),
			'cta_text'         => '診断について相談する',
			'cta_url'          => '/contact?service=remote-diagnosis',
		),
	),
	'org-design-lab'            => array(
		'title'      => 'Org Design Lab',
		'image_seed' => 'nordic-service-orgdesign',
		'content'    => "<p>事業フェーズの変化に応じた組織構造・意思決定設計を、経営層と並走しながら再設計する伴走型コンサルティング。</p><p>3ヶ月〜6ヶ月の中期プログラムで、組織図の書き換えだけでなく、運用が定着するまでをサポートします。</p>",
		'fields'     => array(
			'subtitle'         => '組織を「動く形」に再設計する',
			'features'         => array(
				array( 'title' => '伴走型 3〜6ヶ月', 'description' => '隔週の経営層セッション+月次の全社展開で、設計から定着までを並走。' ),
				array( 'title' => '意思決定マトリクス', 'description' => 'RACI を発展させた独自フレームで、誰が何を決めるかを明示。' ),
				array( 'title' => 'ガバナンス再構築', 'description' => '会議体・レポートライン・KPI設計を一括で見直し。' ),
			),
			'pricing_plans'    => array(
				array( 'name' => 'Foundation', 'price' => '¥6,000,000〜', 'included_features' => "3ヶ月\n経営層伴走\n組織設計ドキュメント\n月次レビュー" ),
				array( 'name' => 'Full Program', 'price' => '¥12,000,000〜', 'included_features' => "6ヶ月\nマネージャー層研修\n運用定着サポート\nKPI設計支援" ),
			),
			'faq'              => array(
				array( 'question' => 'どの規模の企業が対象ですか？', 'answer' => '50名〜500名規模の企業を主な対象としていますが、それ以上の規模でも事業部単位での導入が可能です。' ),
				array( 'question' => '既存の組織コンサルとの違いは？', 'answer' => '北欧型のフラット組織知見と、実運用への定着支援を組み合わせている点が特徴です。' ),
			),
			'case_study_links' => array(
				array( 'label' => '医療系スタートアップY社', 'url' => 'https://example.com/case/health-y' ),
				array( 'label' => '製造業Z社の事業部再編', 'url' => 'https://example.com/case/mfg-z' ),
			),
			'cta_text'         => 'パートナー相談を申し込む',
			'cta_url'          => '/contact?service=org-design',
		),
	),
);

// ===========================================================================
// DATA: CAREERS
// ===========================================================================

$careers_data = array(
	'senior-org-consultant'  => array(
		'title'   => 'シニア組織コンサルタント',
		'content' => "<p>クライアント企業の組織変革プロジェクトに、リードコンサルタントとして参画していただきます。経営層との対話、現場ヒアリング、診断、提案、定着支援までを一気通貫で担当。</p><h3>こんな方を求めています</h3><p>組織開発・人事領域での実務経験があり、定量・定性両面でのアプローチに慣れている方。北欧型の組織観に共感できる方を特に歓迎します。</p>",
		'fields'  => array(
			'position_type'    => 'full_time',
			'location'         => '東京（リモート週3日可）',
			'salary_range'     => '700万〜1,200万円（経験により応相談）',
			'required_skills'  => array(
				array( 'skill' => '組織開発／人事領域での実務経験5年以上' ),
				array( 'skill' => '経営層・マネージャー層との対話経験' ),
				array( 'skill' => '定量データを扱える基礎的なスキル（Excel / SQL いずれか）' ),
			),
			'preferred_skills' => array(
				array( 'skill' => 'コンサルティングファームでの勤務経験' ),
				array( 'skill' => '英語または北欧言語でのビジネスコミュニケーション' ),
				array( 'skill' => '自社プロダクト開発組織のマネジメント経験' ),
			),
			'benefits'         => array(
				array( 'item' => '完全週休2日（土日祝）／有給とは別の年6日のリチャージ休暇' ),
				array( 'item' => 'リモートワーク手当 月20,000円' ),
				array( 'item' => '書籍購入・カンファレンス参加費 全額会社負担（年上限あり）' ),
				array( 'item' => 'ストックホルムオフィス短期滞在制度（年1回）' ),
			),
			'application_url'  => '/contact?career=senior-org-consultant',
		),
	),
	'ui-ux-designer'         => array(
		'title'   => 'UI/UXデザイナー（業務委託）',
		'content' => "<p>自社プロダクト「PsychSafe Score」のUI/UXを、PdM・エンジニアと連携しながら継続的に改善するロールです。フルリモート可、稼働は週20時間程度から相談可。</p><h3>仕事の進め方</h3><p>2週間スプリント単位で機能改善を進めます。Figma中心、ユーザーリサーチの設計から関わっていただけます。</p>",
		'fields'  => array(
			'position_type'    => 'freelance',
			'location'         => 'フルリモート',
			'salary_range'     => '月額 30万〜80万円（稼働時間と経験による）',
			'required_skills'  => array(
				array( 'skill' => 'SaaSプロダクトのUI/UX設計経験 3年以上' ),
				array( 'skill' => 'Figma を用いた実務経験' ),
				array( 'skill' => 'エンジニアと協働でデザインシステムを運用した経験' ),
			),
			'preferred_skills' => array(
				array( 'skill' => 'B2B SaaS のUX設計経験' ),
				array( 'skill' => 'デザインリサーチ（インタビュー設計・分析）の経験' ),
			),
			'benefits'         => array(
				array( 'item' => '完全フルリモート' ),
				array( 'item' => '稼働時間の柔軟な設定（週20〜40時間）' ),
				array( 'item' => 'ツール費補助（Figma / Notion 等）' ),
			),
			'application_url'  => '/contact?career=ui-ux-designer',
		),
	),
);

// ===========================================================================
// DATA: POSTS
// ===========================================================================

$posts_data = array(
	'silence-trap-remote-3rd-year' => array(
		'title'        => 'リモートワーク3年目で気づいた「沈黙の罠」',
		'image_seed'   => 'nordic-post-silence',
		'excerpt'      => 'リモート定着の3年目に多発する「言いたいことが言われなくなる」現象。心理的安全性が低下しているチームに共通するサインと、マネージャーが取るべき具体的アクションを整理します。',
		'content'      => "<p>リモートワークが定着して3年目を迎えるチームから、「会議で誰も発言しなくなった」「重要な懸念が事前にエスカレーションされない」という相談が増えています。これは個々のメンバーのモチベーション低下ではなく、構造的な問題として捉えるべきです。</p><h2>沈黙が増える3つの構造的要因</h2><p>第一に、リアクションコストの上昇。対面なら頷きや表情で済む応答が、オンラインでは「ミュート解除→発言」という明示的な行動を要求されます。第二に、雑談機会の消失。第三に、評価の場と相談の場が分離されにくいこと。</p><h2>マネージャーが取れる3つの打ち手</h2><p>1) 会議の冒頭2分を「全員が一言話す」ルーティンにする。2) 1on1で必ず「言いづらかったこと」を聞く。3) チャット上のリアクションを意識的に増やす。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( 'リモートワーク', '心理的安全性' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '静かなチームほど、構造を見直すタイミング',
	),
	'psych-safety-not-kindness'    => array(
		'title'        => '心理的安全性は「優しさ」ではない、最新の研究が示すこと',
		'image_seed'   => 'nordic-post-research',
		'excerpt'      => 'Amy Edmondsonの近著と関連論文を踏まえ、「心理的安全性 = 優しい職場」という誤解を解きほぐします。むしろ高い基準と健全な対立を支える土台として捉え直す視点を紹介。',
		'content'      => "<p>心理的安全性は、いまだに「優しさ」や「衝突を避けること」と混同されがちです。しかしAmy Edmondsonをはじめとする研究者が一貫して強調しているのは、心理的安全性は「率直さの土台」であり、むしろ高い基準と並立するときに最も効果を発揮するという点です。</p><h2>2x2マトリクスで整理する</h2><p>「心理的安全性の高低」×「基準の高低」の2軸で組織を分類すると、4つの象限が見えてきます。安全性が高く基準も高い領域こそが「学習する組織」であり、目指すべき到達点です。</p><h2>明日からの実践</h2><p>会議で意見が割れたとき、収束を急がず「対立そのもの」を歓迎する姿勢を示す。マネージャーが先に弱さを開示する。失敗の事後検証で「個人の責任追及」と「仕組みの改善」を明確に分ける。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS', '金融・保険' ),
		'topics'       => array( '心理的安全性' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => '高い基準と健全な対立を支える土台',
	),
	'denmark-flat-org'             => array(
		'title'        => 'デンマーク企業に学ぶフラットな組織運営',
		'image_seed'   => 'nordic-post-denmark',
		'excerpt'      => '「上司がいないように振る舞う」デンマーク式マネジメント。階層を否定するのではなく、意思決定の透明性を高めることでフラットさを実現する具体的な仕組みを解説します。',
		'content'      => "<p>デンマークの企業文化を語る上で頻出するのが「フラットさ」というキーワード。しかし、これは単に階層を撤廃するという話ではありません。むしろ、意思決定のプロセスを透明化することで、肩書きに依存しない議論を成立させる仕組みです。</p><h2>3つの原則</h2><p>1) 提案は誰でも出せるが、決定の責任は明確である。2) 意思決定の理由が必ず文書化される。3) 役職ではなく、その案件の責任者として発言する。</p><h2>日本企業への適用</h2><p>全てを真似る必要はありません。まずは経営会議の議事録を全社公開することから始めるだけでも、意思決定の透明性は大きく改善します。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', '組織デザイン' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 6,
		'caption'      => 'フラットさは「決め方の透明性」から',
	),
	'1on1-anti-patterns'           => array(
		'title'        => '1on1ミーティングが形骸化する5つの兆候',
		'image_seed'   => 'nordic-post-1on1',
		'excerpt'      => '導入から半年〜1年で形骸化しがちな1on1。「進捗報告会と化す」「キャンセル率が上がる」など、よくある5つの兆候と、その背景にある根本要因を分解します。',
		'content'      => "<p>1on1の導入初期は機能していても、半年〜1年で形骸化するケースが後を絶ちません。形骸化を「メンバーの問題」と捉えると改善しません。多くの場合、設計レベルの問題が背後にあります。</p><h2>5つの兆候</h2><p>1) 進捗確認の場と化している。2) キャンセル率が10%を超える。3) 議題がいつも上司側から出てくる。4) 「困っていることはない」が定型回答になる。5) 議事録が形だけのものになっている。</p><h2>立て直しの順序</h2><p>まず「1on1の目的の再合意」をマネージャー全員で行います。その上で、フォーマットの強制を緩め、メンバー主導の議題設定に切り替えていきます。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( '1on1', 'マネジメント' ),
		'reading_level'=> array( '初級' ),
		'reading_time' => 4,
		'caption'      => '形骸化はメンバーではなく設計の問題',
	),
	'swedish-fika-productivity'    => array(
		'title'        => 'スウェーデン式「Fika」が生産性を高める理由',
		'image_seed'   => 'nordic-post-fika',
		'excerpt'      => '単なるコーヒー休憩ではなく、組織文化の中核を担うスウェーデンの「Fika」。リモート時代における再解釈と、日本のチームへの取り入れ方を実例ベースで紹介します。',
		'content'      => "<p>Fika（フィーカ）は、スウェーデンで一日に1〜2回、コーヒーと焼き菓子を囲んで同僚と過ごす時間のことを指します。単なる休憩ではなく、ヒエラルキーを超えた対話の場として組織に根付いています。</p><h2>なぜ生産性に効くのか</h2><p>第一に、業務外の文脈で情報が流通することで、形式的な会議では拾いきれない懸念が共有されます。第二に、肩書きの異なる人同士の心理的距離が縮まります。第三に、休憩そのものが生産性向上に寄与することは複数の研究で示されています。</p><h2>リモート時代の実装</h2><p>「バーチャルFika」を週2回30分、ランダムな組み合わせで設定する。話題は業務外でもOK。これだけで、組織内の弱い紐帯が確実に強化されます。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', 'カルチャー' ),
		'reading_level'=> array( '初級' ),
		'reading_time' => 4,
		'caption'      => 'コーヒー休憩を超えた組織文化',
	),
	'remote-onboarding-design'     => array(
		'title'        => 'リモート時代の新入社員オンボーディング設計',
		'image_seed'   => 'nordic-post-onboarding',
		'excerpt'      => 'リモート前提のオンボーディングは「対面の代替」では機能しません。最初の90日を「関係性」「業務」「文化」の3軸で設計し直す具体的な進め方を整理します。',
		'content'      => "<p>新入社員のオンボーディングは、対面前提の設計をそのままリモートに移行しても機能しません。情報の伝達だけでなく、暗黙知の共有・関係性の構築・組織文化の体得という3つの非言語的な要素が、リモート環境では意図的に設計しないと欠落します。</p><h2>90日プランの3軸</h2><p>関係性: 入社後30日以内に10名以上と1on1を設定。業務: 30/60/90日のチェックポイントで期待値をすり合わせる。文化: 「うちの会社らしい意思決定」を実例で示すセッションを設ける。</p><h2>よくある失敗</h2><p>初日のオリエンテーションに情報を詰め込みすぎる、メンターを形式的に割り当てて終わる、3ヶ月目の振り返りを省略する、の3点が代表的です。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( 'リモートワーク', '採用戦略' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 6,
		'caption'      => '関係性・業務・文化の3軸で設計する',
	),
	'measuring-psych-safety'       => array(
		'title'        => '心理的安全性を測る4つの指標とその落とし穴',
		'image_seed'   => 'nordic-post-metrics',
		'excerpt'      => 'サーベイで心理的安全性を測ろうとして、かえって組織を疲弊させてしまうケースが増えています。指標の選び方と、よくある落とし穴を4つに分解して説明します。',
		'content'      => "<p>心理的安全性を「測りたい」というニーズは強まっていますが、雑な計測はかえって組織に害を及ぼします。Edmondsonの7項目スケールがよく知られていますが、これをそのまま日本企業で使うと回答バイアスが大きく出る傾向があります。</p><h2>4つの推奨指標</h2><p>1) 失敗報告の頻度。2) 反対意見の出る会議の割合。3) 1on1での「困りごと」発話量。4) 退職者インタビューでの率直さの度合い。</p><h2>3つの落とし穴</h2><p>サーベイ疲労による回答率低下、上司への忖度バイアス、スコアの絶対値比較。スコアは「変化量」で見るのが鉄則です。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS', '医療・ヘルスケア' ),
		'topics'       => array( '心理的安全性' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => 'スコアは「変化量」で見るのが鉄則',
	),
	'rethinking-hierarchy'         => array(
		'title'        => '組織デザインの初手：階層構造を再考する',
		'image_seed'   => 'nordic-post-hierarchy',
		'excerpt'      => '事業が成長する中で「組織が動かなくなる」と感じたとき、最初に手を付けるべきは階層構造の見直しです。階層は悪ではなく、機能と数の問題であるという視点を提示します。',
		'content'      => "<p>事業が拡大し、人数が増えるにつれ「決まらない」「動かない」という症状が出始めます。多くの場合、その背景には階層構造のミスマッチがあります。階層そのものを悪とする議論ではなく、「現在の事業フェーズに合った階層数か」を問い直すことが重要です。</p><h2>3つの問い</h2><p>1) 経営層から現場まで何階層あるか。2) 各階層の人数比は健全か。3) 階層ごとに意思決定の権限が明確か。</p><h2>典型的なアンチパターン</h2><p>意思決定の責任が階層を上にエスカレーションされ続ける「責任の蒸発」、逆に決裁ラインを飛び越える「越境の常態化」、両者が同時に起きる「迷子組織」が代表例です。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS', '製造業' ),
		'topics'       => array( '組織デザイン' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '階層は悪ではなく、数と機能の問題',
	),
	'teal-organization-reality'    => array(
		'title'        => '「ティール組織」を本当に機能させるには',
		'image_seed'   => 'nordic-post-teal',
		'excerpt'      => 'ティール組織の理論を導入したが、現場が混乱して頓挫した — そんな失敗事例が増えています。理論と実装の間に必要な「翻訳」のステップを丁寧に解説します。',
		'content'      => "<p>「ティール組織」というラベルが独り歩きしています。ラルーの原著で示されている概念は、即時に階層を撤廃することではなく、組織の進化段階の一つとしてのモデルです。導入を急ぐと、必ずと言っていいほど混乱を招きます。</p><h2>翻訳に必要な3要素</h2><p>1) 自己組織化を支える「枠組み」の設計。2) 役割（Role）と人（Person）の分離。3) コンフリクトを処理する明示的なプロセス。</p><h2>段階的導入の例</h2><p>まず1〜2チームでパイロット運用し、6ヶ月後に評価する。全社一斉導入は、ほぼ確実に失敗します。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( '組織デザイン' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 8,
		'caption'      => '理論と実装の間にある翻訳の必要性',
	),
	'engineering-psych-safety'     => array(
		'title'        => 'エンジニア組織における心理的安全性の作り方',
		'image_seed'   => 'nordic-post-engineering',
		'excerpt'      => 'エンジニア特有の文化（コードレビュー、技術的負債の議論、障害対応）における心理的安全性の作り方を、現役EMの視点から具体的なプラクティスで紹介します。',
		'content'      => "<p>エンジニア組織の心理的安全性は、一般的な組織論とは少し異なる工夫が必要です。技術的判断には正解がある場合とない場合が混在し、コードレビューや障害対応など、率直さが特に問われる場面が多いからです。</p><h2>コードレビューでの3原則</h2><p>1) コードではなく人を批判しない。2) 「なぜ」を問うコメントを増やす。3) 良いコードへの賞賛を明示的に書く。</p><h2>ポストモーテムの設計</h2><p>「Blameless（無責性）」を明示的にルール化し、議事録の冒頭に毎回書く。原因を「個人の判断ミス」で終わらせず、「その判断ミスが起きやすい仕組み」まで掘り下げる文化を醸成します。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( '心理的安全性', 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 6,
		'caption'      => 'コードではなく人を批判しない',
	),
	'nordic-wlb-patterns'          => array(
		'title'        => '北欧的ワークライフバランスの実装パターン',
		'image_seed'   => 'nordic-post-wlb',
		'excerpt'      => '北欧諸国の高い労働生産性とワークライフバランスを支える具体的な制度・運用を、日本企業が部分的にでも取り入れられる形で紹介します。',
		'content'      => "<p>北欧諸国のワークライフバランスは「制度」だけでなく「運用」によって支えられています。週35時間労働、長期休暇、男性育休の高取得率といった制度の背景には、それを当たり前として運用する組織文化があります。</p><h2>取り入れやすい3パターン</h2><p>1) 「No Meeting Friday」など、構造的に集中時間を確保する。2) 育休・長期休暇の取得をマネージャー自身が率先する。3) メールへの即レスを評価対象から外す。</p><h2>逆効果になる導入</h2><p>制度だけ整え、運用で空文化させると、かえって従業員の信頼を失います。トップが先に休む姿勢が最重要です。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', 'カルチャー' ),
		'reading_level'=> array( '初級' ),
		'reading_time' => 5,
		'caption'      => 'トップが先に休む姿勢が最重要',
	),
	'manager-3month-program'       => array(
		'title'        => 'マネージャー育成のための3ヶ月プログラム設計',
		'image_seed'   => 'nordic-post-manager',
		'excerpt'      => '新任マネージャー研修を1回やって終わりにしていませんか？効果を残すための3ヶ月伴走型プログラムの設計を、実際の運用事例とともに公開します。',
		'content'      => "<p>新任マネージャー研修を1日完結で終わらせてしまう組織は多いものの、それで実務に役立つレベルまでスキルが定着するケースは稀です。マネジメントは知識ではなく行動様式であり、3ヶ月程度の伴走が必要です。</p><h2>3ヶ月プログラムの骨子</h2><p>Month 1: 基礎フレームの学習と自分のスタイルの言語化。Month 2: 実践+週次1on1での振り返り。Month 3: ピア間でのケーススタディ共有とメンター制度の開始。</p><h2>運用上のポイント</h2><p>研修と業務を分離せず、研修で学んだことを翌週の1on1で必ず使う設計に。マネージャー同士のピアコーチングが、実は最も効果が高い学習装置です。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS', '製造業' ),
		'topics'       => array( 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 6,
		'caption'      => 'マネジメントは知識ではなく行動様式',
	),
);

// ===========================================================================
// DATA: FEATURES (特集) -- 投稿slug依存があるため最後に作成
// ===========================================================================

$features_data = array(
	'nordic-remote-work-handbook'  => array(
		'title'      => '北欧式リモートワークの教科書',
		'image_seed' => 'nordic-feature-remote',
		'content'    => "<p>北欧諸国の働き方をベースに、リモート前提の組織運営を設計するための記事を厳選しました。基礎編から実践編まで、順に読むことで自社の運用を見直す視点が得られます。</p>",
		'fields'     => array(
			'lead_text'              => "北欧諸国のリモートワーク文化と、それを日本企業に翻訳した実装パターンを集めた特集。基礎・実践・応用の順で読み進めると、自社の運用を見直す視点が得られます。",
			'related_article_slugs'  => array( 'silence-trap-remote-3rd-year', 'remote-onboarding-design', 'nordic-wlb-patterns', 'denmark-flat-org' ),
			'published_period_start' => '20260501',
			'published_period_end'   => '',
		),
	),
	'psych-safety-five-actions'    => array(
		'title'      => '心理的安全性入門：明日からできる5つの実践',
		'image_seed' => 'nordic-feature-psychsafe',
		'content'    => "<p>「心理的安全性」というキーワードに触れたばかりの方に向けた入門特集。理論の深掘りから現場での実践、エンジニア組織への適用まで段階的に学べる構成にしています。</p>",
		'fields'     => array(
			'lead_text'              => "心理的安全性をこれから組織に導入したいマネージャー・人事担当者向け。誤解の解消から実践、計測、エンジニア組織への応用まで5本の記事で道筋を示します。",
			'related_article_slugs'  => array( 'psych-safety-not-kindness', 'measuring-psych-safety', 'engineering-psych-safety', '1on1-anti-patterns' ),
			'published_period_start' => '20260415',
			'published_period_end'   => '',
		),
	),
);

// ===========================================================================
// EXECUTION
// ===========================================================================

nordic_seed_log( '' );
nordic_seed_log( '========================================' );
nordic_seed_log( ' Nordic Works Content Seeder' );
nordic_seed_log( '========================================' );

// --- タクソノミー項目 ---
nordic_seed_log( '' );
nordic_seed_log( '[1/6] Creating taxonomy terms...' );
foreach ( $industries as $name ) {
	nordic_seed_get_or_create_term( $name, 'industry' );
}
foreach ( $topics as $name ) {
	nordic_seed_get_or_create_term( $name, 'topic' );
}
foreach ( $reading_levels as $name ) {
	nordic_seed_get_or_create_term( $name, 'reading_level' );
}

// --- 著者プロフィール ---
nordic_seed_log( '' );
nordic_seed_log( '[2/6] Creating authors...' );
$author_ids = array();
foreach ( $authors_data as $slug => $data ) {
	$post_id = nordic_seed_create_post(
		array(
			'post_type'    => 'author_profile',
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_content' => $data['content'],
		)
	);
	if ( ! $post_id ) {
		continue;
	}
	$author_ids[ $slug ] = $post_id;
	$image_id = nordic_seed_attach_image( $data['image_seed'], $post_id, 800, 800, $data['title'] );
	if ( $image_id ) {
		$data['fields']['photo'] = $image_id;
	}
	nordic_seed_set_acf( $post_id, $data['fields'] );
}

// --- サービス ---
nordic_seed_log( '' );
nordic_seed_log( '[3/6] Creating services...' );
foreach ( $services_data as $slug => $data ) {
	$post_id = nordic_seed_create_post(
		array(
			'post_type'    => 'service',
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_content' => $data['content'],
		)
	);
	if ( ! $post_id ) {
		continue;
	}
	$image_id = nordic_seed_attach_image( $data['image_seed'], $post_id, 1600, 900, $data['title'] );
	if ( $image_id ) {
		$data['fields']['hero_image'] = $image_id;
	}
	nordic_seed_set_acf( $post_id, $data['fields'] );
}

// --- 採用情報 ---
nordic_seed_log( '' );
nordic_seed_log( '[4/6] Creating careers...' );
foreach ( $careers_data as $slug => $data ) {
	$post_id = nordic_seed_create_post(
		array(
			'post_type'    => 'career',
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_content' => $data['content'],
		)
	);
	if ( ! $post_id ) {
		continue;
	}
	nordic_seed_set_acf( $post_id, $data['fields'] );
}

// --- 通常記事 ---
nordic_seed_log( '' );
nordic_seed_log( '[5/6] Creating posts...' );
$post_ids = array();
foreach ( $posts_data as $slug => $data ) {
	$post_id = nordic_seed_create_post(
		array(
			'post_type'    => 'post',
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_excerpt' => $data['excerpt'],
			'post_content' => $data['content'],
		)
	);
	if ( ! $post_id ) {
		continue;
	}
	$post_ids[ $slug ] = $post_id;

	nordic_seed_attach_image( $data['image_seed'], $post_id, 1600, 900, $data['title'] );
	nordic_seed_set_terms( $post_id, $data['industries'], 'industry' );
	nordic_seed_set_terms( $post_id, $data['topics'], 'topic' );
	nordic_seed_set_terms( $post_id, $data['reading_level'], 'reading_level' );

	$acf_fields = array(
		'reading_time'           => $data['reading_time'],
		'featured_image_caption' => $data['caption'],
	);
	if ( isset( $author_ids[ $data['author'] ] ) ) {
		$acf_fields['author_profile'] = $author_ids[ $data['author'] ];
	}
	nordic_seed_set_acf( $post_id, $acf_fields );
}

// --- 関連記事のセット（全記事生成後）---
nordic_seed_log( '' );
nordic_seed_log( '    Setting related posts...' );
$related_map = array(
	'silence-trap-remote-3rd-year' => array( 'remote-onboarding-design', '1on1-anti-patterns', 'nordic-wlb-patterns' ),
	'psych-safety-not-kindness'    => array( 'measuring-psych-safety', 'engineering-psych-safety', '1on1-anti-patterns' ),
	'denmark-flat-org'             => array( 'rethinking-hierarchy', 'teal-organization-reality', 'nordic-wlb-patterns' ),
	'1on1-anti-patterns'           => array( 'manager-3month-program', 'psych-safety-not-kindness' ),
	'swedish-fika-productivity'    => array( 'nordic-wlb-patterns', 'denmark-flat-org' ),
	'remote-onboarding-design'     => array( 'silence-trap-remote-3rd-year', 'manager-3month-program' ),
	'measuring-psych-safety'       => array( 'psych-safety-not-kindness', 'engineering-psych-safety' ),
	'rethinking-hierarchy'         => array( 'teal-organization-reality', 'denmark-flat-org' ),
	'teal-organization-reality'    => array( 'rethinking-hierarchy', 'denmark-flat-org' ),
	'engineering-psych-safety'     => array( 'psych-safety-not-kindness', 'measuring-psych-safety' ),
	'nordic-wlb-patterns'          => array( 'swedish-fika-productivity', 'denmark-flat-org' ),
	'manager-3month-program'       => array( '1on1-anti-patterns', 'remote-onboarding-design' ),
);
foreach ( $related_map as $slug => $related_slugs ) {
	if ( ! isset( $post_ids[ $slug ] ) ) {
		continue;
	}
	$ids = array();
	foreach ( $related_slugs as $rel_slug ) {
		if ( isset( $post_ids[ $rel_slug ] ) ) {
			$ids[] = $post_ids[ $rel_slug ];
		}
	}
	if ( $ids ) {
		update_field( 'related_posts', $ids, $post_ids[ $slug ] );
	}
}

// --- 特集 ---
nordic_seed_log( '' );
nordic_seed_log( '[6/6] Creating features...' );
foreach ( $features_data as $slug => $data ) {
	$post_id = nordic_seed_create_post(
		array(
			'post_type'    => 'feature',
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_content' => $data['content'],
		)
	);
	if ( ! $post_id ) {
		continue;
	}
	$image_id = nordic_seed_attach_image( $data['image_seed'], $post_id, 1600, 900, $data['title'] );
	if ( $image_id ) {
		$data['fields']['cover_image'] = $image_id;
	}
	$related_ids = array();
	foreach ( $data['fields']['related_article_slugs'] as $rel_slug ) {
		if ( isset( $post_ids[ $rel_slug ] ) ) {
			$related_ids[] = $post_ids[ $rel_slug ];
		}
	}
	$data['fields']['related_articles'] = $related_ids;
	unset( $data['fields']['related_article_slugs'] );
	nordic_seed_set_acf( $post_id, $data['fields'] );
}

nordic_seed_log( '' );
nordic_seed_log( '========================================' );
nordic_seed_log( ' Seeding completed!' );
nordic_seed_log( '========================================' );
nordic_seed_log( '' );
