/**
 * フッター用の検索入力欄（Client Component）。
 *
 * 入力して送信すると /search?q=… へ遷移する。空送信は無視。
 * ヘッダーの即時検索（⌘K モーダル）とは別役割で、ページ下部からの導線。
 * 見た目はニュースレター欄（NewsletterForm の compact）に揃える。
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export function FooterSearch() {
	const t = useTranslations('footer');
	const router = useRouter();
	const [value, setValue] = useState('');

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const q = value.trim();
		if (!q) return;
		router.push(`/search?q=${encodeURIComponent(q)}`);
	}

	return (
		<form onSubmit={onSubmit} className="flex gap-2" role="search">
			<div className="relative flex-1">
				<svg
					aria-hidden="true"
					viewBox="0 0 20 20"
					fill="none"
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
				>
					<circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
					<path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
				</svg>
				<input
					name="q"
					type="search"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={t('searchPlaceholder')}
					aria-label={t('searchTitle')}
					className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
				/>
			</div>
			<button
				type="submit"
				aria-label={t('searchTitle')}
				className="shrink-0 cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			>
				→
			</button>
		</form>
	);
}
