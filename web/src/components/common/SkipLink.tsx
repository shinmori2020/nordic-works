/**
 * スキップリンク（WCAG 2.4.1 Bypass Blocks, Level A）。
 *
 * キーボード操作で Tab を押した最初の要素として現れ、
 * ヘッダーのナビをスキップして本文（#main-content）へジャンプできる。
 * 通常は画面外に隠れ、フォーカス時のみ表示される。
 *
 * Server Component。翻訳は getTranslations で解決。
 */

import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
	const t = await getTranslations('common');

	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:bg-zinc-100 dark:focus:text-zinc-900"
		>
			{t('skipToContent')}
		</a>
	);
}
