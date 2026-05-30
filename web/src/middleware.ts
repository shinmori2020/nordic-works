/**
 * Next.js middleware — next-intl のロケール検出 + リダイレクト。
 *
 * `/` などのプレフィックス無しURLにアクセスされた時、
 * Accept-Language ヘッダや Cookie からロケールを判定し、
 * `/ja/...` または `/en/...` にリダイレクトする。
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
	// API ルート、Next.js 内部、静的ファイル、拡張子付きパスは除外。
	// /sw.js（PWA）、/manifest.webmanifest、icon-*等もロケール非依存なので除外。
	matcher: [
		'/((?!api|_next|_vercel|sw\\.js|manifest\\.webmanifest|icon|apple-icon|favicon|robots\\.txt|sitemap\\.xml|offline|wp-uploads|.*\\..*).*)',
	],
};
