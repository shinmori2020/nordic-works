/**
 * ホワイトペーパー（資料）の静的データ。
 *
 * 将来的に WP CPT 化する余地はあるが、現時点では数が少なく更新頻度も低いため
 * TypeScript ファイルで持つ。slug ベースで /resources/[slug] にルーティングされる。
 */

export interface Whitepaper {
	slug: string;
	title: string;
	/** 一覧カード用の短い説明 */
	summary: string;
	/** 詳細ページ用の本文（段落区切りの配列） */
	body: string[];
	/** カテゴリ / トピック（タグ表示用） */
	topics: string[];
	/** ページ数（仮想的なPDF想定） */
	pageCount: number;
	/** 想定読了時間（分） */
	readingTime: number;
	/** 公開日 (ISO 8601) */
	publishedAt: string;
	/** 詳細ページのヒーローイメージ。public/whitepapers/ 配下の想定。
	    null の場合は単色背景で代替する。 */
	coverImage: string | null;
}

export const WHITEPAPERS: Whitepaper[] = [
	{
		slug: 'remote-work-playbook-2026',
		title: 'リモートワーク運用プレイブック 2026',
		summary:
			'分散組織で生産性と心理的安全性を両立するための運用ルール・ツール選定・KPI を、北欧3社の実例をもとにまとめました。',
		body: [
			'コロナ禍を経て一時的にリモートワークを縮小した企業がある一方、北欧のテック企業は逆にフルリモートを「採用競争力の源泉」として強化しています。本プレイブックでは、Spotify(スウェーデン)・Supercell(フィンランド)・Personio(ドイツ・北欧型運用)の3社のケースを分析し、日本企業が自社で再現するための具体的な実装パターンを示します。',
			'扱うトピックは大きく3つ。①「同期と非同期の境界線」の引き方(会議ルール・Slack運用・ドキュメント文化)、②「成果可視化と監視の違い」(OKR運用とアウトプット管理)、③「リモートでも崩れないオンボーディング」(初日設計・90日プラン・バディ制度)です。',
			'巻末には自社診断シート(20問)と、3ヶ月の導入ロードマップテンプレートを収録。人事責任者・エンジニアリングマネージャー・経営層を主な読者として想定しています。',
		],
		topics: ['リモートワーク', '組織運営', '生産性'],
		pageCount: 38,
		readingTime: 25,
		publishedAt: '2026-04-15',
		coverImage: null,
	},
	{
		slug: 'psychological-safety-toolkit',
		title: '心理的安全性 計測・改善ツールキット',
		summary:
			'チームの心理的安全性を「測る・話す・改善する」ための質問票、1on1スクリプト、振り返りテンプレートをまとめた実務向けキット。',
		body: [
			'心理的安全性(Psychological Safety)は、Google の Project Aristotle で「高業績チームの最重要因子」とされて以来、組織開発の中心テーマとなりました。しかし日本企業の現場では「概念は知っているが、何をすれば改善するのかわからない」という声をよく聞きます。',
			'本ツールキットは、Amy Edmondson 教授の研究フレームワークをベースに、現場マネージャーがそのまま使える形に翻訳したものです。①7問の簡易計測アンケート、②結果を読み解くためのスコアリングガイド、③1on1で使える質問リスト30問、④週次・月次の振り返りテンプレート、を含みます。',
			'特に「離職リスクが高まっている兆候を、辞表が出る前に拾うための質問設計」のセクションは、エンジニアリング組織のマネージャーから高い評価をいただいています。',
		],
		topics: ['心理的安全性', '1on1', 'マネジメント'],
		pageCount: 24,
		readingTime: 18,
		publishedAt: '2026-03-20',
		coverImage: null,
	},
	{
		slug: 'okr-vs-mbo-decision-guide',
		title: 'OKR vs MBO 導入判断ガイド',
		summary:
			'目標管理手法の選定で迷う組織向けに、OKR と MBO の本質的な違い、向き不向き、移行時の落とし穴を整理した意思決定ガイド。',
		body: [
			'「うちもOKRを導入したい」という声は増えていますが、自社の組織フェーズ・カルチャーに合っていない手法を入れると、運用が形骸化して逆効果になることがあります。本ガイドは、目標管理手法を導入する前の「やる/やらない」の意思決定を支援する目的で作成しました。',
			'構成は①OKRとMBOの設計思想の違い(評価との接続・粒度・サイクル)、②自社の組織フェーズ診断(従業員数・成熟度・経営層のコミットメント別の推奨手法)、③よくある失敗パターン10選(評価連動の罠・KR数の増殖・四半期疲れ等)、④移行時の3段階ロードマップ、です。',
			'付録として、OKR/MBO どちらにも対応した目標設定ワークシートと、四半期レビューのファシリテーション台本を収録しています。',
		],
		topics: ['OKR', 'MBO', '目標管理', '組織設計'],
		pageCount: 32,
		readingTime: 22,
		publishedAt: '2026-02-10',
		coverImage: null,
	},
];

export function getWhitepaperBySlug(slug: string): Whitepaper | null {
	return WHITEPAPERS.find((w) => w.slug === slug) ?? null;
}
