/**
 * オフラインフォールバックページ — /offline
 *
 * Service Worker が network 失敗時に表示する。
 * インストール時にプリキャッシュしているので、オフライン中でも表示可能。
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'オフライン',
	description: '現在オフラインのため、コンテンツを取得できません。',
	robots: { index: false, follow: false },
};

export default function OfflinePage() {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
			<p className="text-xs uppercase tracking-widest text-accent-text">
				Offline
			</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
				オフラインです
			</h1>
			<p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
				ネットワーク接続が確認できないため、コンテンツを取得できませんでした。
				<br className="hidden sm:inline" />
				接続を確認してから、もう一度お試しください。
			</p>

			<p className="mt-2 text-xs text-zinc-400">
				一度訪問したページは、オフラインでも閲覧できる場合があります。
			</p>

			<div className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center">
				<Link
					href="/"
					className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					ホームに戻る
				</Link>
			</div>
		</main>
	);
}
