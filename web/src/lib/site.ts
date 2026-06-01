/**
 * サイト全体のメタ情報を集約。
 *
 * sitemap / robots / canonical / OGP / JSON-LD などから参照する単一の出所。
 * 値を変えたい時はここだけ書き換える。
 */

import type { Metadata } from 'next';

/** 末尾スラッシュ無しの公開URL */
export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_NAME = 'Nordic Works';

export const SITE_DESCRIPTION =
	'リモートワーク・心理的安全性・組織デザインをテーマにした B2B SaaS 企業 Nordic Works のオウンドメディア+コーポレートサイト。';

/** OGP / JSON-LD で使う既定のロケール */
export const SITE_LOCALE = 'ja_JP';

/** サイト相対パスから絶対URLを組み立てる */
export function absoluteUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalized}`;
}

/**
 * canonical + hreflang を一括生成する。各ページの generateMetadata の
 * alternates にそのまま渡す。
 *
 * 引数はロケール無しの相対パス（例: '/articles/foo'）。
 *   - canonical: そのパス（ja はプレフィックス無し = as-needed 運用）
 *   - hreflang ja: 同じパス
 *   - hreflang en: '/en' プレフィックス付き
 *   - x-default: ja を既定として指す
 *
 * 値は metadataBase 基準で Next.js が絶対URL化する。
 */
export function localeAlternates(path: string): Metadata['alternates'] {
	const en = path === '/' ? '/en' : `/en${path}`;
	return {
		canonical: path,
		languages: {
			ja: path,
			en,
			'x-default': path,
		},
	};
}
