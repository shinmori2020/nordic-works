/**
 * ホワイトペーパー（資料）の静的データ。
 *
 * 各エントリは JA / EN の本文を i18n フィールドに持つ。
 * 呼び出し側は getWhitepapers(locale) で locale ごとに整形済みの配列を得る。
 */

import type { Locale } from '@/i18n/routing';

interface WhitepaperI18nFields {
	title: string;
	summary: string;
	body: string[];
	topics: string[];
}

interface WhitepaperRaw {
	slug: string;
	pageCount: number;
	readingTime: number;
	publishedAt: string;
	coverImage: string | null;
	i18n: Record<Locale, WhitepaperI18nFields>;
}

/** 呼び出し側で扱う形（i18n フラット化済み） */
export interface Whitepaper extends WhitepaperI18nFields {
	slug: string;
	pageCount: number;
	readingTime: number;
	publishedAt: string;
	coverImage: string | null;
}

const WHITEPAPERS_RAW: WhitepaperRaw[] = [
	{
		slug: 'remote-work-playbook-2026',
		pageCount: 38,
		readingTime: 25,
		publishedAt: '2026-04-15',
		coverImage: null,
		i18n: {
			ja: {
				title: 'リモートワーク運用プレイブック 2026',
				summary:
					'分散組織で生産性と心理的安全性を両立するための運用ルール・ツール選定・KPI を、北欧3社の実例をもとにまとめました。',
				body: [
					'コロナ禍を経て一時的にリモートワークを縮小した企業がある一方、北欧のテック企業は逆にフルリモートを「採用競争力の源泉」として強化しています。本プレイブックでは、Spotify(スウェーデン)・Supercell(フィンランド)・Personio(ドイツ・北欧型運用)の3社のケースを分析し、日本企業が自社で再現するための具体的な実装パターンを示します。',
					'扱うトピックは大きく3つ。①「同期と非同期の境界線」の引き方(会議ルール・Slack運用・ドキュメント文化)、②「成果可視化と監視の違い」(OKR運用とアウトプット管理)、③「リモートでも崩れないオンボーディング」(初日設計・90日プラン・バディ制度)です。',
					'巻末には自社診断シート(20問)と、3ヶ月の導入ロードマップテンプレートを収録。人事責任者・エンジニアリングマネージャー・経営層を主な読者として想定しています。',
				],
				topics: ['リモートワーク', '組織運営', '生産性'],
			},
			en: {
				title: 'Remote Work Operations Playbook 2026',
				summary:
					'Operating rules, tool selection, and KPIs for balancing productivity and psychological safety in distributed organisations — drawn from three Nordic companies.',
				body: [
					'While some companies scaled remote work back after the pandemic, Nordic tech companies have doubled down on fully-remote operations as a recruiting advantage. This playbook analyses three cases — Spotify (Sweden), Supercell (Finland), and Personio (Germany, Nordic-style operations) — and translates them into concrete implementation patterns Japanese companies can reproduce in-house.',
					'It covers three core topics: (1) drawing the line between synchronous and asynchronous work (meeting rules, Slack operations, documentation culture), (2) the difference between outcome visibility and surveillance (OKR practice and output management), and (3) onboarding that survives fully-remote (day-one design, 90-day plan, buddy system).',
					'The appendix includes a 20-question self-diagnostic worksheet and a three-month implementation roadmap template. Primary readers: HR leaders, engineering managers, and executives.',
				],
				topics: ['Remote Work', 'Organisation Operations', 'Productivity'],
			},
		},
	},
	{
		slug: 'psychological-safety-toolkit',
		pageCount: 24,
		readingTime: 18,
		publishedAt: '2026-03-20',
		coverImage: null,
		i18n: {
			ja: {
				title: '心理的安全性 計測・改善ツールキット',
				summary:
					'チームの心理的安全性を「測る・話す・改善する」ための質問票、1on1スクリプト、振り返りテンプレートをまとめた実務向けキット。',
				body: [
					'心理的安全性(Psychological Safety)は、Google の Project Aristotle で「高業績チームの最重要因子」とされて以来、組織開発の中心テーマとなりました。しかし日本企業の現場では「概念は知っているが、何をすれば改善するのかわからない」という声をよく聞きます。',
					'本ツールキットは、Amy Edmondson 教授の研究フレームワークをベースに、現場マネージャーがそのまま使える形に翻訳したものです。①7問の簡易計測アンケート、②結果を読み解くためのスコアリングガイド、③1on1で使える質問リスト30問、④週次・月次の振り返りテンプレート、を含みます。',
					'特に「離職リスクが高まっている兆候を、辞表が出る前に拾うための質問設計」のセクションは、エンジニアリング組織のマネージャーから高い評価をいただいています。',
				],
				topics: ['心理的安全性', '1on1', 'マネジメント'],
			},
			en: {
				title: 'Psychological Safety: Measurement & Improvement Toolkit',
				summary:
					'A practical toolkit for measuring, discussing, and improving team psychological safety — survey, 1-on-1 scripts, and retrospective templates.',
				body: [
					'Since Google\'s Project Aristotle identified psychological safety as the most important factor in high-performing teams, it has become a central theme in organisation development. Yet many Japanese managers tell us: "I understand the concept, but I do not know what to do to improve it."',
					'This toolkit is based on Professor Amy Edmondson\'s research framework, translated into a form front-line managers can use as-is. It includes: (1) a 7-question quick-measurement survey, (2) a scoring guide for interpreting results, (3) a list of 30 questions usable in 1-on-1s, and (4) weekly and monthly retrospective templates.',
					'The section "Question design for catching attrition-risk signals before the resignation letter arrives" has been particularly well-received by engineering managers.',
				],
				topics: ['Psychological Safety', '1-on-1', 'Management'],
			},
		},
	},
	{
		slug: 'okr-vs-mbo-decision-guide',
		pageCount: 32,
		readingTime: 22,
		publishedAt: '2026-02-10',
		coverImage: null,
		i18n: {
			ja: {
				title: 'OKR vs MBO 導入判断ガイド',
				summary:
					'目標管理手法の選定で迷う組織向けに、OKR と MBO の本質的な違い、向き不向き、移行時の落とし穴を整理した意思決定ガイド。',
				body: [
					'「うちもOKRを導入したい」という声は増えていますが、自社の組織フェーズ・カルチャーに合っていない手法を入れると、運用が形骸化して逆効果になることがあります。本ガイドは、目標管理手法を導入する前の「やる/やらない」の意思決定を支援する目的で作成しました。',
					'構成は①OKRとMBOの設計思想の違い(評価との接続・粒度・サイクル)、②自社の組織フェーズ診断(従業員数・成熟度・経営層のコミットメント別の推奨手法)、③よくある失敗パターン10選(評価連動の罠・KR数の増殖・四半期疲れ等)、④移行時の3段階ロードマップ、です。',
					'付録として、OKR/MBO どちらにも対応した目標設定ワークシートと、四半期レビューのファシリテーション台本を収録しています。',
				],
				topics: ['OKR', 'MBO', '目標管理', '組織設計'],
			},
			en: {
				title: 'OKR vs MBO Adoption Decision Guide',
				summary:
					'A decision guide on the essential differences between OKR and MBO, when each fits, and pitfalls during transition.',
				body: [
					'"We want to adopt OKRs too" is a request we hear more and more — but introducing a method that does not match your organisation\'s phase and culture often leads to a hollow practice that backfires. This guide is built to support the "do / do not" decision before adopting any goal-management framework.',
					'It covers (1) the design philosophies of OKR vs MBO (evaluation linkage, granularity, cycle), (2) self-diagnosis by organisational phase (recommendations by headcount, maturity, and executive commitment), (3) ten common failure patterns (the evaluation-linked trap, KR proliferation, quarterly fatigue, etc.), and (4) a three-stage transition roadmap.',
					'Appendices include a goal-setting worksheet that works for either OKR or MBO, and a facilitation script for quarterly reviews.',
				],
				topics: ['OKR', 'MBO', 'Goal Management', 'Organisation Design'],
			},
		},
	},
];

/** i18n フィールドを locale でフラット化したエンティティを返す。 */
function flatten(raw: WhitepaperRaw, locale: Locale): Whitepaper {
	const fields = raw.i18n[locale];
	return {
		slug: raw.slug,
		pageCount: raw.pageCount,
		readingTime: raw.readingTime,
		publishedAt: raw.publishedAt,
		coverImage: raw.coverImage,
		...fields,
	};
}

export function getWhitepapers(locale: Locale): Whitepaper[] {
	return WHITEPAPERS_RAW.map((raw) => flatten(raw, locale));
}

export function getWhitepaperBySlug(slug: string, locale: Locale): Whitepaper | null {
	const raw = WHITEPAPERS_RAW.find((w) => w.slug === slug);
	return raw ? flatten(raw, locale) : null;
}

/** ビルド時用（locale 非依存で全 slug を返す。generateStaticParams で使う） */
export function getAllWhitepaperSlugs(): string[] {
	return WHITEPAPERS_RAW.map((w) => w.slug);
}
