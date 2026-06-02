'use client';

/**
 * ロケール内のエラー境界 — [locale] セグメント配下で発生した
 * 予期しないエラーを捕捉する。
 *
 * Client Component 必須（'use client'）。reset() で再試行できる。
 * root layout 内に描画されるため NextIntlClientProvider 配下で、
 * useTranslations が使える。
 */

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function LocaleError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations('error');

	useEffect(() => {
		// 監視ツールに送る余地（現状は console のみ）
		console.error('[error-boundary]', error);
	}, [error]);

	return (
		<main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
			<p className="text-xs uppercase tracking-widest text-zinc-500">
				{t('label')}
			</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
				{t('title')}
			</h1>
			<p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				{t('description')}
			</p>

			{error.digest && (
				<p className="mt-2 text-xs text-zinc-400">
					<code>{error.digest}</code>
				</p>
			)}

			<div className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center">
				<button
					type="button"
					onClick={reset}
					className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				>
					{t('retry')}
				</button>
				<Link
					href="/"
					className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
				>
					{t('backHome')}
				</Link>
			</div>
		</main>
	);
}
