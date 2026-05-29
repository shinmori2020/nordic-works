/**
 * 資料請求一覧ページ — /resources
 *
 * 静的データ（lib/whitepapers.ts）からホワイトペーパー一覧を表示する。
 * 各カードから /resources/[slug] の詳細＋申込フォームへ遷移する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { WHITEPAPERS } from '@/lib/whitepapers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
	title: '資料ダウンロード',
	description:
		'Nordic Works が公開する組織開発・リモートワーク運用に関するホワイトペーパー一覧。',
	alternates: { canonical: '/resources' },
};

export default function ResourcesPage() {
	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<Breadcrumbs
				items={[
					{ label: 'ホーム', href: '/' },
					{ label: 'Resources' },
				]}
			/>

			<header className="mt-6">
				<p className="text-xs uppercase tracking-widest text-zinc-500">Resources</p>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					資料ダウンロード
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					組織開発・リモートワーク運用・目標管理に関する実務向けホワイトペーパーを
					公開しています。フォームへの記入後、担当者よりPDFをお送りします。
				</p>
			</header>

			<ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{WHITEPAPERS.map((wp) => (
					<li key={wp.slug}>
						<article className="flex h-full flex-col rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
							<div className="flex flex-wrap gap-1.5">
								{wp.topics.slice(0, 2).map((topic) => (
									<span
										key={topic}
										className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
									>
										{topic}
									</span>
								))}
							</div>

							<h2 className="mt-3 font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
								{wp.title}
							</h2>

							<p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
								{wp.summary}
							</p>

							<div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
								<span>PDF · {wp.pageCount} ページ</span>
								<span>· 約 {wp.readingTime} 分</span>
							</div>

							<Link
								href={`/resources/${wp.slug}`}
								className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-500 dark:text-zinc-100 dark:hover:text-zinc-400"
							>
								資料をダウンロード <span aria-hidden="true">→</span>
							</Link>
						</article>
					</li>
				))}
			</ul>
		</main>
	);
}
