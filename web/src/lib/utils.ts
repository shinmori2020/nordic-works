/**
 * 汎用ユーティリティ関数。
 *
 * 主に WordPress REST レスポンスの `_embedded` から関連データを
 * 安全に取り出すヘルパーを提供する。
 */

import type {
	WPMedia,
	WPTerm,
	ServiceFeature,
	PricingPlan,
	FaqItem,
	CaseStudyLink,
	CaseStudyOutcome,
	PositionType,
} from '@/types/wordpress';

/**
 * 全画像共通の blur プレースホルダー（薄いグレー）。
 * next/image の placeholder="blur" + blurDataURL に渡す。
 * WordPress の動的画像ごとに blurDataURL を生成するのは重いため、
 * 軽量な共通 SVG を使い「読込中のガクつき」だけ抑える。
 */
export const BLUR_DATA_URL =
	'data:image/svg+xml;base64,' +
	Buffer.from(
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10"><rect width="16" height="10" fill="#e4e4e7"/></svg>',
	).toString('base64');

/** `_embedded` を持つエンティティの最小形 */
type Embeddable = {
	_embedded?: {
		'wp:featuredmedia'?: WPMedia[];
		'wp:term'?: WPTerm[][];
	};
};

/**
 * アイキャッチ画像を取得する。未設定や取得失敗時は null。
 */
export function getFeaturedImage(entity: Embeddable): WPMedia | null {
	const media = entity._embedded?.['wp:featuredmedia']?.[0];
	if (!media || !media.source_url) return null;
	return media;
}

/**
 * 指定タクソノミーに属するタームを取得する。
 * `_embedded['wp:term']` はタクソノミーごとの二次元配列なので flat する。
 */
export function getTerms(entity: Embeddable, taxonomy: string): WPTerm[] {
	const groups = entity._embedded?.['wp:term'] ?? [];
	return groups.flat().filter((term) => term?.taxonomy === taxonomy);
}

/**
 * HTML タグを除去してプレーンテキストにする。
 * 抜粋（excerpt）やメタディスクリプション生成に使う。
 */
export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * ISO 日付文字列を locale に応じた形式に整形する。
 *   ja → 「2026年5月14日」
 *   en → 「May 14, 2026」
 * locale 省略時は ja。
 */
export function formatDate(iso: string, locale: 'ja' | 'en' = 'ja'): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	if (locale === 'ja') {
		return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
	}
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(d);
}

// ============================================================================
// ACF テキストエリアのパーサ
//
// ACF 無料版にはリピーターが無いため、複数行データは textarea に
// 「1行1項目、項目内は ` | ` 区切り」の形式で保存している。それをパースする。
// ============================================================================

/**
 * テキストエリアの生値を、トリム済みの非空行の配列に分割する。
 * 採用情報のスキル・待遇など「1行1項目」のフィールドにそのまま使える。
 */
export function parseLines(text: string | undefined | null): string[] {
	if (!text) return [];
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

/** 1行を ` | ` で区切ってトリム済みの配列にする */
function splitColumns(line: string): string[] {
	return line.split('|').map((cell) => cell.trim());
}

/** サービスの機能リスト（`タイトル | 説明`）をパースする */
export function parseServiceFeatures(text: string | undefined | null): ServiceFeature[] {
	return parseLines(text).map((line) => {
		const [title = '', description = ''] = splitColumns(line);
		return { title, description };
	});
}

/** サービスの料金プラン（`プラン名 | 価格 | 機能1, 機能2`）をパースする */
export function parsePricingPlans(text: string | undefined | null): PricingPlan[] {
	return parseLines(text).map((line) => {
		const [name = '', price = '', included = ''] = splitColumns(line);
		return {
			name,
			price,
			includedFeatures: included
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
		};
	});
}

/** サービスのFAQ（`質問 | 回答`）をパースする */
export function parseFaq(text: string | undefined | null): FaqItem[] {
	return parseLines(text).map((line) => {
		const [question = '', answer = ''] = splitColumns(line);
		return { question, answer };
	});
}

/** サービスの導入事例リンク（`ラベル | URL`）をパースする */
export function parseCaseStudyLinks(text: string | undefined | null): CaseStudyLink[] {
	return parseLines(text).map((line) => {
		const [label = '', url = ''] = splitColumns(line);
		return { label, url };
	});
}

/**
 * 導入事例の outcomes 文字列をパース。
 * 形式: `指標 | 数値 | 補足` を1行ずつ。補足は省略可。
 */
export function parseOutcomes(text: string | undefined | null): CaseStudyOutcome[] {
	return parseLines(text).map((line) => {
		const [label = '', value = '', note = ''] = splitColumns(line);
		return {
			label,
			value,
			...(note ? { note } : {}),
		};
	});
}

// ============================================================================
// 採用情報ヘルパー
// ============================================================================

/** ACF select フィールド position_type の値 → 日本語ラベル */
const POSITION_TYPE_LABELS: Record<PositionType, string> = {
	full_time: '正社員',
	contract: '契約社員',
	freelance: '業務委託',
};

/** 雇用形態コードを日本語ラベルに変換する。未知の値はそのまま返す。 */
export function positionTypeLabel(type: string | undefined | null): string {
	if (!type) return '';
	return POSITION_TYPE_LABELS[type as PositionType] ?? type;
}
