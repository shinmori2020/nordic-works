/**
 * グローバル404ページ。
 *
 * 各ページの notFound() 呼び出し、および未定義ルートで表示される。
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'ページが見つかりません',
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
			<p className="text-xs uppercase tracking-widest text-zinc-500">404</p>
			<h1 className="mt-2 text-3xl font-semibold text-zinc-900 sm:text-4xl">
				ページが見つかりません
			</h1>
			<p className="mt-4 text-sm text-zinc-600">
				お探しのページは削除されたか、URL が変更された可能性があります。
			</p>

			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link
					href="/"
					className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
				>
					ホームに戻る
				</Link>
				<Link
					href="/articles"
					className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
				>
					記事一覧を見る
				</Link>
			</div>
		</main>
	);
}
