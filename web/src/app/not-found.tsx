/**
 * グローバル404ページ。
 *
 * 各ページの notFound() 呼び出し、および未定義ルートで表示される。
 * 直近記事と主要ナビゲーションを並べ、行き場を失った訪問者を回遊に戻す。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';

export const metadata: Metadata = {
	title: 'ページが見つかりません',
	robots: { index: false, follow: false },
};

const SECTION_LINKS = [
	{ href: '/articles', label: 'Insights', description: '記事一覧' },
	{ href: '/services', label: 'Services', description: 'サービス紹介' },
	{ href: '/careers', label: 'Careers', description: '採用情報' },
	{ href: '/about', label: 'About', description: '会社概要' },
	{ href: '/contact', label: 'Contact', description: 'お問い合わせ' },
];

export default async function NotFound() {
	// 直近記事を最大4件取得（取得失敗時は空配列）
	const allPosts = await getPosts().catch(() => []);
	const recentPosts = [...allPosts]
		.sort((a, b) => (b.date > a.date ? 1 : -1))
		.slice(0, 4);

	return (
		<main className="mx-auto max-w-6xl px-6 py-16">
			{/* ヘッダー */}
			<section className="text-center">
				<p className="text-xs uppercase tracking-widest text-accent-text">404</p>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
					ページが見つかりません
				</h1>
				<p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
					お探しのページは削除されたか、URL が変更された可能性があります。
					<br className="hidden sm:inline" />
					以下から目的のコンテンツを探してみてください。
				</p>

				<div className="mt-8 flex flex-col gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center">
					<Link
						href="/"
						className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
					>
						ホームに戻る
					</Link>
					<Link
						href="/search"
						className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
					>
						サイト内を検索する
					</Link>
				</div>
			</section>

			{/* セクションリンク（5主要ページ） */}
			<section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
				<h2 className="text-xs uppercase tracking-widest text-accent-text">
					主要セクション
				</h2>
				<ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{SECTION_LINKS.map((link) => (
						<li key={link.href}>
							<Link
								href={link.href}
								className="block rounded-md border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
							>
								<p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
									{link.label}
								</p>
								<p className="mt-0.5 text-xs text-zinc-500">{link.description}</p>
							</Link>
						</li>
					))}
				</ul>
			</section>

			{/* 直近記事 */}
			{recentPosts.length > 0 && (
				<section className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
					<div className="flex items-baseline justify-between">
						<h2 className="text-xs uppercase tracking-widest text-accent-text">
							最近の記事
						</h2>
						<Link
							href="/articles"
							className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
						>
							すべて見る →
						</Link>
					</div>
					<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
						{recentPosts.map((post) => (
							<ArticleCard key={post.id} post={post} />
						))}
					</div>
				</section>
			)}
		</main>
	);
}
