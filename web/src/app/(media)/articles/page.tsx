/**
 * 記事一覧ページ — /articles
 *
 * WordPress に投入した全記事をカード形式で一覧表示する。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/wordpress';
import { ArticleCard } from '@/components/media/ArticleCard';

// ISR: 1時間ごとに再生成（docs/06-features.md の方針）
export const revalidate = 3600;

export const metadata: Metadata = {
	title: '記事一覧',
	description:
		'リモートワーク・心理的安全性・組織デザイン・北欧の働き方に関する記事の一覧。',
	alternates: { canonical: '/articles' },
};

export default async function ArticlesPage() {
	const posts = await getPosts();

	return (
		<main className="mx-auto max-w-6xl px-6 py-12">
			<header className="mb-10">
				<Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
					← ホーム
				</Link>
				<h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">記事一覧</h1>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{posts.length} 件の記事</p>
			</header>

			{posts.length === 0 ? (
				<p className="text-sm text-red-600">
					⚠️ 記事を取得できませんでした。Local の WordPress が起動しているか確認してください。
				</p>
			) : (
				<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<ArticleCard key={post.id} post={post} />
					))}
				</div>
			)}
		</main>
	);
}
