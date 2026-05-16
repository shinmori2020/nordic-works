/**
 * 汎用ユーティリティ関数。
 *
 * 主に WordPress REST レスポンスの `_embedded` から関連データを
 * 安全に取り出すヘルパーを提供する。
 */

import type { WPMedia, WPTerm } from '@/types/wordpress';

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
