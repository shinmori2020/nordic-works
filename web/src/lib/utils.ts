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
} from '@/types/wordpress';

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
 * ISO 日付文字列を「2026年5月14日」形式に整形する。
 */
export function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
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
