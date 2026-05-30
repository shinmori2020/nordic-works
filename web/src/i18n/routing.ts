/**
 * next-intl ルーティング設定。
 *
 * - JA をデフォルト。URL は `/ja/...` 必須にせず、`/` も JA として扱う運用も可能だが、
 *   ここでは hreflang / canonical を綺麗に保つため明示プレフィックス常時付与にする。
 * - 新規ロケール追加時は locales に追加するだけで OK（messages/<locale>.json も用意）。
 */

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
	locales: ['ja', 'en'] as const,
	defaultLocale: 'ja',
	// 'as-needed': JA（デフォルト）はプレフィックスなし、EN は /en/... が付く。
	// これにより既存の `<Link href="/articles">` 等の参照を変更せずに済む。
	localePrefix: 'as-needed',
	// localeDetection を false にすることで、ブラウザの Accept-Language を無視し、
	// 新規訪問者は常に defaultLocale (ja) で表示する。
	// ユーザーが LanguageSwitcher で EN を選んだ場合は Cookie に保存され、
	// 以降の訪問では EN が維持される。
	localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
