<?php
/**
 * Nordic Works — 追加記事 15件 の seeder
 *
 * 既存 seed-content.php と同じパターンで、記事だけを追加投入する。
 * 既存記事と slug が被らない15記事を新規作成。idempotent（再実行しても二重に作らない）。
 *
 * Usage:
 *   Local の Site Shell で:
 *     wp eval-file wp-content/plugins/nordic-works-core/scripts/seed-more-articles.php
 */

// =============================================================================
// BOOTSTRAP
// =============================================================================

if ( ! defined( 'ABSPATH' ) ) {
	$wp_load = dirname( __FILE__, 5 ) . '/wp-load.php';
	if ( file_exists( $wp_load ) ) {
		require_once $wp_load;
	} else {
		die( "wp-load.php が見つかりません。WP-CLI 経由で実行してください。\n" );
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

// =============================================================================
// HELPERS
// =============================================================================

function nordic_more_log( $msg ) {
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		WP_CLI::log( $msg );
	} else {
		echo $msg . "\n";
	}
}

function nordic_more_find_post( $slug ) {
	$posts = get_posts(
		array(
			'name'        => $slug,
			'post_type'   => 'post',
			'post_status' => 'any',
			'numberposts' => 1,
		)
	);
	return $posts ? $posts[0] : null;
}

function nordic_more_attach_image( $seed, $post_id, $description = '' ) {
	if ( get_post_thumbnail_id( $post_id ) ) {
		return get_post_thumbnail_id( $post_id );
	}
	$url = "https://picsum.photos/seed/{$seed}/1600/900.jpg";
	$id  = media_sideload_image( $url, $post_id, $description, 'id' );
	if ( is_wp_error( $id ) ) {
		nordic_more_log( "    ⚠ image: " . $id->get_error_message() );
		return null;
	}
	set_post_thumbnail( $post_id, $id );
	return $id;
}

function nordic_more_set_terms( $post_id, $names, $taxonomy ) {
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

function nordic_more_author_id( $slug ) {
	$post = get_posts(
		array(
			'name'        => $slug,
			'post_type'   => 'author_profile',
			'post_status' => 'any',
			'numberposts' => 1,
		)
	);
	return $post ? $post[0]->ID : 0;
}

// =============================================================================
// DATA: 追加する15記事
// =============================================================================

$posts_data = array(

	'fika-quantitative-effects' => array(
		'title'        => 'スウェーデン式 fika が組織文化に与える定量効果',
		'image_seed'   => 'nordic-more-fika-data',
		'excerpt'      => '「コーヒー休憩」と思われがちな fika。実際は離職率・部署横断の相談頻度・心理的安全性スコアに有意な影響を与えていることが、複数社の社内データで観察されています。',
		'content'      => "<p>fika を「ただの休憩」と片付けると、その本質を見失います。スウェーデン企業で30年以上続く慣習が組織に何をもたらすのか、定量データから読み解きます。</p><h2>観察された3つの効果</h2><p>第一に、離職率の低下。共通の業務外時間を持つチームは、調査対象12社のうち10社で離職率が平均22%低下していました。第二に、部署横断の相談頻度の上昇。第三に、心理的安全性サーベイのスコア改善。</p><h2>導入時の注意点</h2><p>「強制参加」「上司主導の議題」にすると即座に逆効果になります。fika は意図的に「無目的」を守ることが価値の源泉です。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', 'カルチャー' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '雑談の量と質は組織の健康指標',
	),

	'1on1-design-principles' => array(
		'title'        => '1on1を「制度疲労」させない3つの設計原則',
		'image_seed'   => 'nordic-more-1on1-design',
		'excerpt'      => '導入から1〜2年で形骸化する1on1。失敗の多くは設計段階で予測可能でした。長期運用に耐える1on1を作る3つの原則を整理します。',
		'content'      => "<p>1on1は一度導入したら終わりではなく、定期的に「制度の健康診断」が必要な仕組みです。長く機能させるための3つの設計原則を紹介します。</p><h2>原則1: 目的を時期で変える</h2><p>新任マネージャー期は関係構築、安定期は成長支援、変革期は不安の可視化。1on1の「主目的」を半年ごとに見直します。</p><h2>原則2: フォーマットを軽くする</h2><p>テンプレートの強制は形骸化を加速します。最低限「前回のアクションの振り返り」と「次の1週間の懸念」だけ確保すれば十分。</p><h2>原則3: マネージャー研修を続ける</h2><p>導入時の研修1回で終わらせず、半年ごとの相互フィードバックの場を設ける。1on1の質はマネージャーのスキルに大きく依存します。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( '1on1', 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '導入後の運用設計こそが本番',
	),

	'denmark-no-decision-meeting' => array(
		'title'        => 'デンマーク企業に学ぶ「決めない会議」の生産性',
		'image_seed'   => 'nordic-more-denmark-meeting',
		'excerpt'      => '会議のゴールは「決定」だけではない。デンマーク企業で観察される「決めない会議」が、なぜ長期的な意思決定の質を高めるのかを解説します。',
		'content'      => "<p>「全ての会議には決定事項が必要」という日本式の信仰は、複雑な意思決定の質を下げることがあります。デンマーク企業が意識的に組み込む「決めない会議」の役割を見ていきます。</p><h2>3種類の会議を分ける</h2><p>1) 探索的会議（決めない・選択肢を広げる）、2) 統合的会議（複数案の利害を統合する）、3) 決定的会議（意思決定する）。多くの組織がこれらを混在させて時間を浪費しています。</p><h2>探索的会議のルール</h2><p>結論を出さない、ホワイトボードに全意見を残す、議事録に決定事項欄を作らない。これだけで議論の自由度が劇的に変わります。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', 'マネジメント' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 6,
		'caption'      => '決めない時間が決定の質を上げる',
	),

	'safety-and-high-performance' => array(
		'title'        => '心理的安全性とハイパフォーマンスは矛盾しない',
		'image_seed'   => 'nordic-more-safety-perf',
		'excerpt'      => '「心理的安全性を高めるとチームが緩む」という誤解は根強く残ります。実際は高い基準と両立できることを、Edmondsonのマトリクスと実例で示します。',
		'content'      => "<p>「心理的安全性」と「高い成果基準」は二者択一ではありません。Edmondson が示した2x2マトリクスでは、両方が高い領域こそが「学習する組織」と定義されています。</p><h2>誤解はどこから生まれるか</h2><p>「優しい職場」「衝突を避ける」「全員が同意するまで動かない」といったイメージが先行すると、心理的安全性は「ぬるさ」と混同されます。本質は「率直に意見が言える土台」であり、議論の温度を下げるものではありません。</p><h2>両立させる実践</h2><p>明確な評価基準を提示する、率直なフィードバックを当然のものとして組み込む、失敗の原因分析を「人」ではなく「仕組み」に向ける。この3点で両立は可能です。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS', '金融・保険' ),
		'topics'       => array( '心理的安全性', 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '安全性と基準は両立できる',
	),

	'remote-evaluation-pitfalls' => array(
		'title'        => 'リモート時代の評価制度：成果主義の落とし穴',
		'image_seed'   => 'nordic-more-remote-eval',
		'excerpt'      => 'リモート前提で「成果で評価する」というシンプルな解決は、実は深刻な副作用を生みます。評価の偏りと、それを補正する4つの仕組みを紹介します。',
		'content'      => "<p>リモートワーク時代に「成果主義に振り切る」のは一見合理的に見えます。しかし、可視化しやすい成果ばかりが評価され、見えにくい貢献（チーム支援・ナレッジ共有・暗黙の調整）が無視される現象が頻発しています。</p><h2>3つの副作用</h2><p>1) 見えやすい成果ばかりに人が集中する、2) 互助的な貢献が消える、3) 短期成果偏重で長期投資が削減される。</p><h2>補正する4つの仕組み</h2><p>ピア評価の導入、3ヶ月単位ではなく6ヶ月単位の評価、「協力性」を独立した評価軸にする、定期的な評価バイアスのレビュー。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( 'リモートワーク', 'マネジメント' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => '見えない貢献を見える化する',
	),

	'finnish-education-org' => array(
		'title'        => 'フィンランドの教育思想を組織開発に適用する',
		'image_seed'   => 'nordic-more-finland-edu',
		'excerpt'      => '世界的に評価されるフィンランドの教育制度。その背後にある思想（信頼ベース・小さく失敗する・対話の重視）は、企業の組織開発にも応用できます。',
		'content'      => "<p>フィンランドの教育は「成績競争を持ち込まない」「教師に高い裁量を与える」「失敗を学習機会と捉える」といった原則で知られます。これらは現代的な組織開発の原則と驚くほど重なります。</p><h2>応用できる3つの考え方</h2><p>1) 信頼に基づく権限委譲（マイクロマネジメントの放棄）、2) 早く小さく失敗できる安全性、3) 評価より対話を優先する文化。</p><h2>具体的に変えること</h2><p>1on1で「評価フィードバック」と「育成対話」を分離する、KPIを下方修正可能なものとして扱う、失敗事例の共有会を月次で開く。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', '医療・ヘルスケア' ),
		'topics'       => array( '北欧の働き方', '組織デザイン' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => '教育思想は組織思想に応用できる',
	),

	'em-first-90days' => array(
		'title'        => 'エンジニアリングマネージャーの最初の90日',
		'image_seed'   => 'nordic-more-em-90days',
		'excerpt'      => '初めて EM になる人が最初の90日でやるべきこと、避けるべきこと。技術力で評価されてきた人ほど陥りやすい罠を整理します。',
		'content'      => "<p>初めてエンジニアリングマネージャー（EM）になった人がよく陥る罠は、「技術判断に手を出しすぎる」「コードレビューが詳細すぎる」「1on1を進捗確認に使う」の3点に集約されます。</p><h2>30/60/90日の優先順位</h2><p>Day 1-30: メンバー全員と1on1して関係構築。意思決定パターンの観察に徹する。Day 31-60: チームの「困りごと」のリストを作り、優先順位付け。Day 61-90: 自分自身の役割を再定義し、メンバーに権限を委譲する仕組みを設計。</p><h2>避けるべき3つ</h2><p>1) コードを書く時間を「メイン業務」に位置付ける、2) 1on1をキャンセルしてレビューに時間を使う、3) 自分の判断を「正解」として押し付ける。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( 'マネジメント', '1on1' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 6,
		'caption'      => '技術力と管理力は別のスキル',
	),

	'hiring-pitch-story' => array(
		'title'        => '採用ピッチデックを「ストーリー」で書く',
		'image_seed'   => 'nordic-more-hiring-pitch',
		'excerpt'      => 'スペック羅列の採用資料は応募者の心を動かしません。優れた採用ピッチデックは、会社の「物語」を伝えます。構成と書き方を解説します。',
		'content'      => "<p>採用ピッチデックの典型的な失敗は、「事業の数字・福利厚生・技術スタックを並べて終わる」ことです。応募者が本当に知りたいのは「自分がそこで何になれるか」という物語です。</p><h2>4つの章で構成する</h2><p>1) 私たちが解決したい本当の問題、2) なぜ今このチームでやるのか、3) どんな働き方を信じているか、4) あなたに期待する役割の物語。</p><h2>避けるべき表現</h2><p>「業界トップクラスの」「やりがいのある」「成長できる環境」といった抽象表現は逆効果。具体的なエピソードで代替します。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '採用戦略', 'カルチャー' ),
		'reading_level'=> array( '初級' ),
		'reading_time' => 4,
		'caption'      => 'スペックではなく物語を伝える',
	),

	'flat-org-collapse-signs' => array(
		'title'        => 'フラット組織が崩壊する5つの兆候',
		'image_seed'   => 'nordic-more-flat-collapse',
		'excerpt'      => '理想を掲げて始まったフラット組織が、半年〜2年で機能不全に陥るのはよくあることです。崩壊前に現れる5つの兆候と、回避策を解説します。',
		'content'      => "<p>フラット組織は理想として語られる一方、実装の難易度は高く、多くが暗黙のヒエラルキー化や意思決定の停滞に陥ります。崩壊前の兆候を早期発見することが重要です。</p><h2>5つの兆候</h2><p>1) 意思決定が「自然に決まる」と説明される、2) 影響力のある人と肩書きが乖離する、3) 新人がキャッチアップに3ヶ月以上かかる、4) 同じ議論が何度も蒸し返される、5) 退職時の引継ぎが極端に難しい。</p><h2>回避策</h2><p>「役割」と「責任」を文書化する、意思決定プロセスを可視化する、新人向けのオンボーディング設計を強化する。フラットさは構造の不在ではなく、明示的な設計の上に成立します。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( '組織デザイン', 'マネジメント' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => 'フラットさは設計の上に成立する',
	),

	'async-communication-protocol' => array(
		'title'        => '非同期コミュニケーションのプロトコル設計',
		'image_seed'   => 'nordic-more-async-protocol',
		'excerpt'      => 'リモート環境で「非同期で進める」と言っても、明示的なルールがなければ機能しません。非同期コミュニケーションの基本プロトコルを設計します。',
		'content'      => "<p>「非同期コミュニケーションでお願いします」という指示だけでは、実際には機能しません。何を文書化し、何を返信期限とし、どこで判断するかが事前に合意されている必要があります。</p><h2>基本プロトコル</h2><p>1) 質問は「背景・現状・希望する判断」の3点を必ず明示、2) 緊急度を3段階で示す（24h以内・3日以内・1週間以内）、3) 返信不要の通知と判断を求めるリクエストを明確に分ける。</p><h2>ツール選定の視点</h2><p>Slack/Teams のスレッド機能を厳格に使うか、Notion 等で議題ベースで集約するか。チームサイズと業務種別で選択します。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS' ),
		'topics'       => array( 'リモートワーク', 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '非同期は明示的設計の上に成立する',
	),

	'nordic-startup-avoidances' => array(
		'title'        => '北欧スタートアップが避ける3つの日本的慣習',
		'image_seed'   => 'nordic-more-startup-avoid',
		'excerpt'      => '日本企業では当たり前の慣習でも、北欧スタートアップが意識的に避けるものがあります。3つの代表例と、その背景にある思想を紹介します。',
		'content'      => "<p>北欧の現代的なスタートアップを観察すると、日本企業では「礼儀」「配慮」とされる慣習が意識的に排除されていることに気づきます。それぞれに合理的な理由があります。</p><h2>避けられる3つ</h2><p>1) 役職名で呼ぶこと（First Name のみ）、2) 形式的な敬語、3) 役職別の意思決定権限の暗黙化。</p><h2>避ける理由</h2><p>これらは「フラットさ」を演出するためではなく、「議論の温度を下げない」「意見の重みを役職で決めない」ための実装です。日本企業がそのまま真似る必要はありませんが、なぜ避けているのかを理解する価値はあります。</p>",
		'author'       => 'lindberg-anna',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '北欧の働き方', 'カルチャー' ),
		'reading_level'=> array( '初級' ),
		'reading_time' => 4,
		'caption'      => '慣習の背景にある合理性を見る',
	),

	'okr-not-ritual' => array(
		'title'        => 'OKR を「儀式」にしないための運用設計',
		'image_seed'   => 'nordic-more-okr-ritual',
		'excerpt'      => '四半期ごとに目標を立てて達成度を測る「儀式」と化した OKR。本来の意図と乖離した運用を立て直す具体策を解説します。',
		'content'      => "<p>OKR は本来「野心的な目標で組織のフォーカスを揃える」仕組みですが、多くの組織で「四半期ごとの儀式」と化しています。達成度100%が当然、未達は責められる、目標が日常業務の延長線——これらは OKR の本来の意図と真逆です。</p><h2>立て直す3つの設計変更</h2><p>1) 達成度70%を「健全」と再定義する、2) Objective は野心的に、Key Results は測定可能に厳密分離する、3) 月次の進捗会を「軌道修正」の場に位置付ける。</p><h2>儀式化の根本要因</h2><p>OKR を評価制度と直結させると、確実に儀式化します。育成・戦略・評価は別の仕組みで運用するのが原則です。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS', '製造業' ),
		'topics'       => array( 'マネジメント', '組織デザイン' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 7,
		'caption'      => '評価と OKR は別の仕組みで',
	),

	'edmondson-survey-interpretation' => array(
		'title'        => '心理的安全性を測る Edmondson サーベイの解釈',
		'image_seed'   => 'nordic-more-edmondson',
		'excerpt'      => 'Edmondson の7項目サーベイは広く使われていますが、結果の解釈には注意が必要です。日本企業特有のバイアスと、補正する読み方を整理します。',
		'content'      => "<p>Amy Edmondson が開発した7項目の心理的安全性サーベイは、研究にも実務にも広く使われています。ただし、日本企業でそのまま使うと特有のバイアスが乗ります。</p><h2>3つのバイアス</h2><p>1) 「中央寄り回答」バイアス（極端な評価を避ける）、2) 上司への忖度（記名式の場合）、3) 「言えない雰囲気」自体が回答に出ない。</p><h2>補正する読み方</h2><p>絶対スコアではなく時系列の変化量を見る、自由記述欄を必ず併用する、サーベイ結果と1on1での発話量を組み合わせて解釈する。スコアだけを見ると判断を誤ります。</p>",
		'author'       => 'tanaka-kenichi',
		'industries'   => array( 'IT / SaaS', '医療・ヘルスケア' ),
		'topics'       => array( '心理的安全性' ),
		'reading_level'=> array( '上級' ),
		'reading_time' => 6,
		'caption'      => 'サーベイは変化量で読む',
	),

	'1on1-three-time-axes' => array(
		'title'        => '1on1 で扱うべき「3つの時間軸」',
		'image_seed'   => 'nordic-more-1on1-time',
		'excerpt'      => '1on1の議題が「直近の業務」に偏ると、長期的な成長や信頼構築が後回しになります。意識すべき3つの時間軸を整理します。',
		'content'      => "<p>1on1の30分が常に「直近1週間の業務状況」だけで終わってしまうと、本来の価値の多くを失っています。3つの時間軸を意識的に配分することで、1on1は短期成果と長期成長の両方を支えられます。</p><h2>3つの時間軸</h2><p>1) 直近1週間（業務の障害物の解消）、2) 直近3ヶ月（プロジェクトの方向性とスキル成長）、3) 半年〜1年（キャリアと役割の対話）。</p><h2>配分の目安</h2><p>毎回均等にする必要はありませんが、月次で「3つ目」の話題を必ず1回入れるルールが効果的です。これにより、長期的な信頼関係と離職予防の両方に効きます。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '1on1', 'マネジメント' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '長期の対話を意識的に組み込む',
	),

	'bottom-up-hiring' => array(
		'title'        => 'ボトムアップ採用：現場主導で人を集める仕組み',
		'image_seed'   => 'nordic-more-bottom-up',
		'excerpt'      => '人事主導の採用には限界があります。現場が主体的に候補者を集め、選び、口説く仕組みを構築するための4つのステップを解説します。',
		'content'      => "<p>人事部門が候補者母集団を作って現場が選ぶ、という従来の採用は限界に達しています。現場が主体的に動く「ボトムアップ採用」への移行が、特にエンジニアリング組織で広がっています。</p><h2>4つのステップ</h2><p>1) 現場メンバーがリファラル候補リストを四半期ごとに更新、2) 採用イベントへの登壇を現場メンバーが担当、3) カジュアル面談の最初は必ず現場メンバー、4) オファー条件の最終調整に現場マネージャーが関与。</p><h2>人事の役割の変化</h2><p>人事は「採用の主体」から「採用活動の仕組みづくり」へ役割が変わります。母集団形成・選考・口説きの全てが現場で完結する状態を支える側に回ります。</p>",
		'author'       => 'sato-misaki',
		'industries'   => array( 'IT / SaaS', 'サービス業' ),
		'topics'       => array( '採用戦略', '組織デザイン' ),
		'reading_level'=> array( '中級' ),
		'reading_time' => 5,
		'caption'      => '人事は主体から仕組み作りへ',
	),

);

// =============================================================================
// EXECUTE
// =============================================================================

nordic_more_log( '' );
nordic_more_log( '[seed-more] Creating 15 additional posts...' );

$created = 0;
$skipped = 0;

foreach ( $posts_data as $slug => $data ) {
	$existing = nordic_more_find_post( $slug );
	if ( $existing ) {
		nordic_more_log( "    ↻ skip   [{$slug}]" );
		$skipped++;
		continue;
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => 'post',
			'post_status'  => 'publish',
			'post_author'  => 1,
			'post_title'   => $data['title'],
			'post_name'    => $slug,
			'post_excerpt' => $data['excerpt'],
			'post_content' => $data['content'],
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		nordic_more_log( "    ⚠ insert failed [{$slug}]: " . $post_id->get_error_message() );
		continue;
	}

	nordic_more_log( "    + post   [{$slug}] {$data['title']}" );

	nordic_more_attach_image( $data['image_seed'], $post_id, $data['title'] );
	nordic_more_set_terms( $post_id, $data['industries'], 'industry' );
	nordic_more_set_terms( $post_id, $data['topics'], 'topic' );
	nordic_more_set_terms( $post_id, $data['reading_level'], 'reading_level' );

	update_field( 'reading_time', $data['reading_time'], $post_id );
	update_field( 'featured_image_caption', $data['caption'], $post_id );

	$author_id = nordic_more_author_id( $data['author'] );
	if ( $author_id ) {
		update_field( 'author_profile', $author_id, $post_id );
	}

	$created++;
}

nordic_more_log( '' );
nordic_more_log( "✨ Done: {$created} created, {$skipped} skipped." );
