/**
 * Algolia 検索クライアント（ブラウザ用 lite クライアント）。
 *
 * Search-Only Key は公開しても安全（検索しかできない）なので、
 * NEXT_PUBLIC_ALGOLIA_SEARCH_KEY としてクライアントバンドルに含めて良い。
 */

import { liteClient } from 'algoliasearch/lite';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '';
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ?? '';

export const ALGOLIA_INDEX_NAME =
	process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? 'nordic_works';

/**
 * ロケールに応じたインデックス名を返す。
 *   ja → nordic_works
 *   en → nordic_works_en
 * index-to-algolia.mjs が両方を生成している前提。
 */
export function indexNameForLocale(locale: string): string {
	return locale === 'en' ? `${ALGOLIA_INDEX_NAME}_en` : ALGOLIA_INDEX_NAME;
}

export const ALGOLIA_CONFIGURED = Boolean(APP_ID && SEARCH_KEY);

/** lite クライアント。未設定時は null（呼び出し側で配慮） */
export const algoliaClient = ALGOLIA_CONFIGURED
	? liteClient(APP_ID, SEARCH_KEY)
	: null;

/** Algolia のレコード型（index-to-algolia.mjs の出力形と一致） */
export interface AlgoliaPostHit {
	objectID: string;
	title: string;
	excerpt: string;
	content: string;
	slug: string;
	date: string;
	modified?: string;
	image?: string | null;
	topics?: string[];
	industries?: string[];
	readingLevels?: string[];
	readingTime?: number | null;
	url: string;
	_highlightResult?: {
		title?: { value: string };
		excerpt?: { value: string };
	};
	_snippetResult?: {
		content?: { value: string };
		excerpt?: { value: string };
	};
}
